import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Code, Wand2, Sparkles, Database, AlertCircle } from "lucide-react";

interface TemplateEditorProps {
  template: any;
  projectId: string;
  onBack: () => void;
}

export default function TemplateEditor({ template, projectId, onBack }: TemplateEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [html, setHtml] = useState(template.html_content || "");
  const [css, setCss] = useState(template.css_content || "");
  const [urlPattern, setUrlPattern] = useState(template.url_pattern || "/{{slug}}");
  const [metaTitle, setMetaTitle] = useState(template.meta_title_pattern || "");
  const [metaDesc, setMetaDesc] = useState(template.meta_description_pattern || "");
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("html");

  // Draft tracking
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Track changes for draft indicator
  useEffect(() => {
    const changed =
      html !== (template.html_content || "") ||
      css !== (template.css_content || "") ||
      urlPattern !== (template.url_pattern || "/{{slug}}") ||
      metaTitle !== (template.meta_title_pattern || "") ||
      metaDesc !== (template.meta_description_pattern || "");
    setIsDirty(changed);
  }, [html, css, urlPattern, metaTitle, metaDesc, template]);

  // AI state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBrandGuidelines, setAiBrandGuidelines] = useState("");
  const [aiPreviewHtml, setAiPreviewHtml] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState<"openrouter" | "straico">("openrouter");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiModel, setAiModel] = useState("");

  // Get ALL data sources to collect all variables AND preview data
  const { data: allDataSources = [] } = useQuery({
    queryKey: ["all-data-sources-full", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("data_sources")
        .select("*")
        .eq("project_id", projectId);
      return data || [];
    },
  });

  // Get project settings for default AI config
  const { data: project } = useQuery({
    queryKey: ["project-ai-settings", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("brand_guidelines, openrouter_api_key, straico_api_key, ai_model")
        .eq("id", projectId)
        .maybeSingle();
      return data;
    },
  });

  // Build sampleData from first row, and collect ALL variable keys
  const sampleData = (() => {
    for (const ds of allDataSources) {
      if (Array.isArray(ds.cached_data) && (ds.cached_data as any[]).length > 0) {
        return (ds.cached_data as any[])[0];
      }
    }
    return { title: "Sample Title", description: "Sample description text", category: "Technology", location: "San Francisco", image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800", slug: "sample-page", rating: "4.5", price: "$99" };
  })();

  // Collect ALL unique variable names across all data sources
  const availableVars: string[] = [];
  for (const ds of allDataSources) {
    if (Array.isArray(ds.cached_data) && (ds.cached_data as any[]).length > 0) {
      for (const row of (ds.cached_data as any[])) {
        for (const key of Object.keys(row)) {
          if (!availableVars.includes(key)) availableVars.push(key);
        }
      }
    }
  }

  // All data rows for preview
  const allDataRows: any[] = [];
  for (const ds of allDataSources) {
    if (Array.isArray(ds.cached_data)) {
      allDataRows.push(...(ds.cached_data as any[]));
    }
  }
  const previewColumns = allDataRows.length > 0 ? Object.keys(allDataRows[0]) : [];

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("templates")
        .update({
          html_content: html,
          css_content: css,
          url_pattern: urlPattern,
          meta_title_pattern: metaTitle,
          meta_description_pattern: metaDesc,
        })
        .eq("id", template.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      setIsDirty(false);
      setLastSaved(new Date());
      toast({ title: "Template saved!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const renderPreview = useCallback(() => {
    let rendered = html;
    if (sampleData) {
      Object.entries(sampleData).forEach(([key, value]) => {
        rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value));
      });
    }
    if (css) {
      rendered = rendered.replace("</head>", `<style>${css}</style></head>`);
    }
    return rendered;
  }, [html, css, sampleData]);

  const openAiDialog = () => {
    setAiOpen(true);
    setAiPreviewHtml(null);
    setAiPrompt("");
    setAiBrandGuidelines(project?.brand_guidelines || "");
    if (project?.openrouter_api_key) {
      setAiProvider("openrouter");
      setAiApiKey(project.openrouter_api_key);
    } else if (project?.straico_api_key) {
      setAiProvider("straico");
      setAiApiKey(project.straico_api_key);
    } else {
      setAiApiKey("");
    }
    setAiModel(project?.ai_model || "");
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Please describe the website you want to generate", variant: "destructive" });
      return;
    }

    const key = aiApiKey.trim();
    if (!key) {
      toast({ title: "API key required", description: "Enter your OpenRouter or Straico API key above.", variant: "destructive" });
      return;
    }

    setAiGenerating(true);
    try {
      const variablesList = availableVars.map(v => `{{${v}}}`).join(", ");
      const guidelines = aiBrandGuidelines || "";

      const systemPrompt = `You are an expert web designer. Generate a complete, beautiful, responsive HTML page template.
The template must use these template variables for dynamic content: ${variablesList}
Variables are injected as {{variable_name}} in the HTML.
${guidelines ? `\nBrand Guidelines:\n${guidelines}` : ""}
Return ONLY the complete HTML code, starting with <!DOCTYPE html>. Include all CSS inline in a <style> tag.
Make the design modern, clean, and professional. Use semantic HTML.`;

      let response;
      if (aiProvider === "openrouter") {
        const model = aiModel || "openai/gpt-4o";
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "pSEO Generator",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: aiPrompt },
            ],
          }),
        });
      } else {
        // Straico API - v0 prompt completion
        const model = aiModel || "openai/gpt-4o";
        response = await fetch("https://api.straico.com/v0/prompt/completion", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            message: `${systemPrompt}\n\nUser request: ${aiPrompt}`,
          }),
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      let htmlContent = "";

      if (aiProvider === "openrouter") {
        htmlContent = data.choices?.[0]?.message?.content || "";
      } else {
        // Straico response: { data: { completion: { choices: [...] } } }
        htmlContent = data.data?.completion?.choices?.[0]?.message?.content || 
                      data.data?.completion || 
                      data.completion?.choices?.[0]?.message?.content ||
                      data.completion || "";
      }

      const codeBlockMatch = htmlContent.match(/```html?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        htmlContent = codeBlockMatch[1].trim();
      }

      if (!htmlContent.includes("<!DOCTYPE") && !htmlContent.includes("<html")) {
        throw new Error("AI did not return valid HTML. Please try again with a different prompt.");
      }

      setAiPreviewHtml(htmlContent);
      toast({ title: "AI template generated! Review the preview below." });
    } catch (err: any) {
      toast({ title: "AI generation failed", description: err.message, variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApproveAiHtml = () => {
    if (!aiPreviewHtml) return;
    setHtml(aiPreviewHtml);
    setAiOpen(false);
    setAiPreviewHtml(null);
    toast({ title: "AI HTML applied to editor! Don't forget to Save." });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {template.name}
              {isDirty && (
                <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                  <AlertCircle className="h-3 w-3 mr-1" /> Unsaved Draft
                </Badge>
              )}
            </h3>
            {lastSaved && (
              <p className="text-xs text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openAiDialog}>
            <Wand2 className="h-4 w-4 mr-1" /> AI Generate
          </Button>
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <><Code className="h-4 w-4 mr-1" /> Editor</> : <><Eye className="h-4 w-4 mr-1" /> Preview</>}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-1" /> {save.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Variable chips - scrollable, show ALL variables */}
      {availableVars.length > 0 && (
        <ScrollArea className="max-h-[7.5rem]">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground py-1">Available variables ({availableVars.length}):</span>
            {availableVars.map((v) => (
              <code key={v} className="text-xs bg-muted px-2 py-1 rounded font-mono">{`{{${v}}}`}</code>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* SEO Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">URL Pattern</Label>
          <Input value={urlPattern} onChange={(e) => setUrlPattern(e.target.value)} className="text-sm font-mono" placeholder="/{{slug}}" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Meta Title Pattern</Label>
          <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="text-sm" placeholder="{{title}} — {{site_name}}" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Meta Description Pattern</Label>
          <Input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} className="text-sm" placeholder="{{description}}" />
        </div>
      </div>

      {/* Editor / Preview / Data Preview */}
      {previewMode ? (
        <div className="border rounded-lg overflow-hidden bg-card" style={{ height: "70vh" }}>
          <iframe
            title="Template Preview"
            srcDoc={renderPreview()}
            className="w-full h-full"
            sandbox="allow-same-origin"
          />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-1">
              <Database className="h-3 w-3" /> Data ({allDataRows.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="html">
            <div className="border rounded-lg overflow-hidden" style={{ height: "65vh" }}>
              <Editor
                language="html"
                value={html}
                onChange={(v) => setHtml(v || "")}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", lineNumbers: "on" }}
              />
            </div>
          </TabsContent>
          <TabsContent value="css">
            <div className="border rounded-lg overflow-hidden" style={{ height: "65vh" }}>
              <Editor
                language="css"
                value={css}
                onChange={(v) => setCss(v || "")}
                theme="vs-dark"
                options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on" }}
              />
            </div>
          </TabsContent>
          <TabsContent value="data">
            <div className="border rounded-lg overflow-auto" style={{ maxHeight: "65vh" }}>
              {allDataRows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      {previewColumns.map((col) => (
                        <TableHead key={col} className="whitespace-nowrap text-xs">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDataRows.slice(0, 100).map((row: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        {previewColumns.map((col) => (
                          <TableCell key={col} className="whitespace-nowrap max-w-[200px] truncate text-xs">
                            {row[col] ?? ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Database className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No data sources connected yet.</p>
                </div>
              )}
              {allDataRows.length > 100 && (
                <p className="text-xs text-muted-foreground text-center py-2">Showing first 100 of {allDataRows.length} rows</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* AI Generate Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> AI Website Generator</DialogTitle>
          </DialogHeader>

          {!aiPreviewHtml ? (
            <div className="space-y-4">
              {/* API Key Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={aiProvider} onValueChange={(v) => setAiProvider(v as "openrouter" | "straico")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                      <SelectItem value="straico">Straico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model (optional)</Label>
                  <Input
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    placeholder="e.g., openai/gpt-4o"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={aiProvider === "openrouter" ? "sk-or-..." : "straico_..."}
                />
                <p className="text-xs text-muted-foreground">
                  {project?.openrouter_api_key || project?.straico_api_key
                    ? "Pre-filled from Project Settings. You can override here."
                    : "Enter your API key. You can also save a default in Project Settings → AI Web Creation."}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Describe the website you want</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g., A modern business directory page with a hero image, rating stars, contact info section, and a clean card layout. Use blue and white color scheme."
                />
              </div>

              <div className="space-y-2">
                <Label>Brand Guidelines (optional)</Label>
                <Textarea
                  value={aiBrandGuidelines}
                  onChange={(e) => setAiBrandGuidelines(e.target.value)}
                  rows={3}
                  placeholder="Brand voice, colors, fonts, tone, target audience..."
                />
              </div>

              {availableVars.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Available variables ({availableVars.length}) — AI will use these:</Label>
                  <ScrollArea className="max-h-[7.5rem]">
                    <div className="flex flex-wrap gap-1">
                      {availableVars.map((v) => (
                        <code key={v} className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <DialogFooter>
                <Button onClick={handleAiGenerate} disabled={aiGenerating}>
                  <Sparkles className="h-4 w-4 mr-1" /> {aiGenerating ? "Generating..." : "Generate HTML"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden" style={{ height: "60vh" }}>
                <iframe title="AI Preview" srcDoc={aiPreviewHtml} className="w-full h-full" sandbox="allow-same-origin" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setAiPreviewHtml(null)}>
                  ← Regenerate
                </Button>
                <Button onClick={handleApproveAiHtml}>
                  <Sparkles className="h-4 w-4 mr-1" /> Approve & Apply to Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}