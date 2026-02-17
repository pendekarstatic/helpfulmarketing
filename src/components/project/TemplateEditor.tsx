import { useState, useCallback, useEffect, useRef } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Code, Wand2, Sparkles, Database, AlertCircle, X, Settings2, MessageSquare, FileDown, Copy, Send } from "lucide-react";

interface TemplateEditorProps {
  template: any;
  projectId: string;
  onBack: () => void;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type AiMode = "html" | "enhance_prompt" | "default_prompt";

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
  const [aiStreamingText, setAiStreamingText] = useState("");
  const [aiProgress, setAiProgress] = useState(0);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>("html");

  // AI advanced settings
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [aiMaxTokens, setAiMaxTokens] = useState(4096);
  const [aiTopP, setAiTopP] = useState(1);

  // Chat history for follow-up (session only)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Prompt generator dialog
  const [promptGenOpen, setPromptGenOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // Get ALL data sources
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

  // Build sampleData from first row
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

  const buildSystemPrompt = (mode: AiMode) => {
    const variablesList = availableVars.map(v => `{{${v}}}`).join(", ");
    const guidelines = aiBrandGuidelines || "";

    if (mode === "enhance_prompt") {
      return `You are an expert prompt engineer. The user wants to create a website template.
Given their description, enhance and expand their prompt to be more detailed and specific.
Include suggestions for layout, colors, typography, sections, and responsive design.
Available template variables: ${variablesList}
${guidelines ? `\nBrand Guidelines:\n${guidelines}` : ""}
Return ONLY the enhanced prompt text. Do not return HTML.`;
    }

    if (mode === "default_prompt") {
      return `You are an expert prompt generator. Based on the available data variables and brand guidelines, generate a comprehensive default prompt that the user can use with any AI to create an HTML template.
Available template variables: ${variablesList}
${guidelines ? `\nBrand Guidelines:\n${guidelines}` : ""}
The prompt should describe:
- Page structure and layout
- How each variable should be displayed
- Suggested styling approach
- Responsive design considerations
Return ONLY the prompt text. Do not return HTML.`;
    }

    // html mode
    return `You are an expert web designer. Generate a complete, beautiful, responsive HTML page template.
The template must use these template variables for dynamic content: ${variablesList}
Variables are injected as {{variable_name}} in the HTML.
${guidelines ? `\nBrand Guidelines:\n${guidelines}` : ""}
Return ONLY the complete HTML code, starting with <!DOCTYPE html>. Include all CSS inline in a <style> tag.
Make the design modern, clean, and professional. Use semantic HTML.`;
  };

  const openAiDialog = () => {
    setAiOpen(true);
    setAiPreviewHtml(null);
    setAiStreamingText("");
    setAiProgress(0);
    // Don't reset aiPrompt — keep user's previous prompt
    setChatHistory([]);
    setFollowUpInput("");
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

  const handleSaveAiSettings = async () => {
    const updates: any = {};
    if (aiProvider === "openrouter") {
      updates.openrouter_api_key = aiApiKey;
    } else {
      updates.straico_api_key = aiApiKey;
    }
    if (aiModel) updates.ai_model = aiModel;
    if (aiBrandGuidelines) updates.brand_guidelines = aiBrandGuidelines;

    const { error } = await supabase.from("projects").update(updates).eq("id", projectId);
    if (error) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["project-ai-settings", projectId] });
      toast({ title: "AI settings saved to project!" });
    }
  };

  const extractHtml = (text: string): string | null => {
    let htmlContent = text;
    const codeBlockMatch = htmlContent.match(/```html?\s*([\s\S]*?)```/);
    if (codeBlockMatch) htmlContent = codeBlockMatch[1].trim();
    if (htmlContent.includes("<!DOCTYPE") || htmlContent.includes("<html")) {
      return htmlContent;
    }
    return null;
  };

  const callAi = async (messages: ChatMessage[]): Promise<string> => {
    const key = aiApiKey.trim();
    if (!key) throw new Error("API key required");

    if (aiProvider === "openrouter") {
      const controller = new AbortController();
      abortRef.current = controller;
      const model = aiModel || "openai/gpt-4o";

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "PageForge",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: aiTemperature,
          max_tokens: aiMaxTokens,
          top_p: aiTopP,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAiStreamingText(fullText);
              setAiProgress(Math.min(90, 30 + (fullText.length / aiMaxTokens) * 60));
            }
          } catch { /* partial JSON, skip */ }
        }
      }
      return fullText;
    } else {
      // Straico
      const model = aiModel || "openai/gpt-4o";
      const systemMsg = messages.find(m => m.role === "system")?.content || "";
      const userMsgs = messages.filter(m => m.role !== "system").map(m => `${m.role}: ${m.content}`).join("\n\n");

      const response = await fetch("https://api.straico.com/v0/prompt/completion", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          message: `${systemMsg}\n\n${userMsgs}`,
          temperature: aiTemperature,
          max_tokens: aiMaxTokens,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      let htmlContent = data.data?.completion?.choices?.[0]?.message?.content ||
                        data.data?.completion || "";
      if (typeof htmlContent === "object") htmlContent = JSON.stringify(htmlContent);
      setAiStreamingText(htmlContent);
      return htmlContent;
    }
  };

  const MAX_PROMPT_LENGTH = 2000;

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({ title: "Please describe the website you want to generate", variant: "destructive" });
      return;
    }
    if (aiPrompt.length > MAX_PROMPT_LENGTH) {
      toast({ title: "Prompt too long", description: `Please keep your prompt under ${MAX_PROMPT_LENGTH} characters.`, variant: "destructive" });
      return;
    }
    if (!aiApiKey.trim()) {
      toast({ title: "API key required", variant: "destructive" });
      return;
    }

    setAiGenerating(true);
    setAiStreamingText("");
    setAiProgress(10);
    setAiPreviewHtml(null);

    try {
      const systemPrompt = buildSystemPrompt(aiMode);
      const contextNote = aiMode === "html" && html.trim() ? `\n\nThe current template HTML is:\n${html}\n\nPlease improve or regenerate based on the user's request.` : "";

      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt + contextNote },
        { role: "user", content: aiPrompt },
      ];

      setAiProgress(30);
      const fullText = await callAi(messages);

      if (aiMode === "html") {
        const extracted = extractHtml(fullText);
        if (!extracted) throw new Error("AI did not return valid HTML. Please try again.");
        setAiPreviewHtml(extracted);
      } else {
        // For prompt modes, show the generated prompt in the prompt generator dialog
        setGeneratedPrompt(fullText);
        setPromptGenOpen(true);
        setAiOpen(false);
      }

      // Save to chat history
      setChatHistory([
        { role: "system", content: systemPrompt + contextNote },
        { role: "user", content: aiPrompt },
        { role: "assistant", content: fullText },
      ]);

      setAiProgress(100);
      toast({ title: aiMode === "html" ? "AI template generated! Review below." : "Prompt generated!" });
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast({ title: "Generation cancelled" });
      } else {
        toast({ title: "AI generation failed", description: err.message, variant: "destructive" });
      }
    } finally {
      setAiGenerating(false);
      abortRef.current = null;
    }
  };

  const handleFollowUp = async () => {
    if (!followUpInput.trim() || aiGenerating) return;
    if (followUpInput.length > MAX_PROMPT_LENGTH) {
      toast({ title: "Input too long", description: `Please keep your input under ${MAX_PROMPT_LENGTH} characters.`, variant: "destructive" });
      return;
    }

    setAiGenerating(true);
    setAiStreamingText("");
    setAiProgress(10);

    try {
      const newMessages: ChatMessage[] = [
        ...chatHistory,
        { role: "user", content: followUpInput },
      ];

      setAiProgress(30);
      const fullText = await callAi(newMessages);

      setChatHistory([
        ...newMessages,
        { role: "assistant", content: fullText },
      ]);

      const extracted = extractHtml(fullText);
      if (extracted) {
        setAiPreviewHtml(extracted);
      }

      setFollowUpInput("");
      setAiProgress(100);
      toast({ title: "Follow-up response received!" });
    } catch (err: any) {
      toast({ title: "Follow-up failed", description: err.message, variant: "destructive" });
    } finally {
      setAiGenerating(false);
      abortRef.current = null;
    }
  };

  const handleApproveAiHtml = () => {
    if (!aiPreviewHtml) return;
    setHtml(aiPreviewHtml);
    setAiPreviewHtml(null);
    setAiStreamingText("");
    // Keep chat history and AI dialog open so user can continue iterating
    toast({ title: "AI HTML applied! Don't forget to Save." });
  };

  // Generate prompt for external use
  const generatePromptText = () => {
    const variablesList = availableVars.map(v => `{{${v}}}`).join(", ");
    const sampleRow = sampleData ? Object.entries(sampleData).map(([k, v]) => `  ${k}: ${v}`).join("\n") : "";
    const guidelines = project?.brand_guidelines || "";

    const prompt = `Create a complete, professional, responsive HTML page template for a directory/listing website.

## Requirements:
- Use these template variables for dynamic content: ${variablesList}
- Variables should be placed as {{variable_name}} in the HTML
- Include ALL CSS inline in a <style> tag within <head>
- The page should be fully self-contained (single HTML file)
- Use semantic HTML5 elements
- Make it mobile-responsive
- Include proper meta tags

## Sample Data Row:
${sampleRow}

${guidelines ? `## Brand Guidelines:\n${guidelines}\n` : ""}
## Template Variables Available:
${availableVars.map(v => `- {{${v}}}`).join("\n")}

## Output:
Return ONLY the complete HTML code starting with <!DOCTYPE html>. No explanations or markdown.`;

    setGeneratedPrompt(prompt);
    setPromptGenOpen(true);
  };

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "-").toLowerCase()}-prompt.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Prompt downloaded!" });
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({ title: "Prompt copied to clipboard!" });
  };

  // Chat messages for display (exclude system)
  const displayMessages = chatHistory.filter(m => m.role !== "system");

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
          <Button variant="outline" size="sm" onClick={generatePromptText}>
            <FileDown className="h-4 w-4 mr-1" /> Get Prompt
          </Button>
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

      {/* Variable chips */}
      {availableVars.length > 0 && (
        <ScrollArea className="max-h-[10rem]">
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

      {/* Editor / Preview / Data */}
      {previewMode ? (
        <div className="border rounded-lg overflow-hidden bg-card" style={{ height: "70vh" }}>
          <iframe title="Template Preview" srcDoc={renderPreview()} className="w-full h-full" sandbox="allow-same-origin" />
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
              <Editor language="html" value={html} onChange={(v) => setHtml(v || "")} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", lineNumbers: "on" }} />
            </div>
          </TabsContent>
          <TabsContent value="css">
            <div className="border rounded-lg overflow-hidden" style={{ height: "65vh" }}>
              <Editor language="css" value={css} onChange={(v) => setCss(v || "")} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on" }} />
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
                          <TableCell key={col} className="whitespace-nowrap max-w-[200px] truncate text-xs">{row[col] ?? ""}</TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /> AI Generator</DialogTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAiSettings(!showAiSettings)}>
                  <Settings2 className="h-4 w-4 mr-1" /> Settings
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSaveAiSettings}>
                  <Save className="h-4 w-4 mr-1" /> Save Settings
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setAiOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Progress bar */}
          {aiGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating...</span>
                <span className="text-muted-foreground">{Math.round(aiProgress)}%</span>
              </div>
              <Progress value={aiProgress} className="h-2" />
            </div>
          )}

          {!aiPreviewHtml && !aiGenerating && !aiStreamingText && chatHistory.length === 0 ? (
            <div className="space-y-4">
              {/* AI Mode Selection */}
              <div className="space-y-2">
                <Label>Generation Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={aiMode === "html" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiMode("html")}
                  >
                    <Code className="h-3 w-3 mr-1" /> HTML Website
                  </Button>
                  <Button
                    variant={aiMode === "enhance_prompt" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiMode("enhance_prompt")}
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> Enhance Prompt
                  </Button>
                  <Button
                    variant={aiMode === "default_prompt" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAiMode("default_prompt")}
                  >
                    <FileDown className="h-3 w-3 mr-1" /> Default Prompt
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiMode === "html" && "Generate a complete HTML website template with AI."}
                  {aiMode === "enhance_prompt" && "AI will enhance your description into a detailed prompt for better results."}
                  {aiMode === "default_prompt" && "AI generates a comprehensive prompt based on your data variables and brand."}
                </p>
              </div>

              {/* Settings panel */}
              {showAiSettings && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
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
                      <Label>Model</Label>
                      <Input value={aiModel} onChange={(e) => setAiModel(e.target.value)} placeholder="e.g., openai/gpt-4o" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" value={aiApiKey} onChange={(e) => setAiApiKey(e.target.value)} placeholder={aiProvider === "openrouter" ? "sk-or-..." : "straico_..."} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Temperature: {aiTemperature}</Label>
                      <Slider value={[aiTemperature]} onValueChange={([v]) => setAiTemperature(v)} min={0} max={2} step={0.1} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Tokens: {aiMaxTokens}</Label>
                      <Slider value={[aiMaxTokens]} onValueChange={([v]) => setAiMaxTokens(v)} min={256} max={16384} step={256} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Top P: {aiTopP}</Label>
                      <Slider value={[aiTopP]} onValueChange={([v]) => setAiTopP(v)} min={0} max={1} step={0.05} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{aiMode === "html" ? "Describe the website you want" : aiMode === "enhance_prompt" ? "Describe what you want (AI will enhance)" : "Additional context (optional)"}</Label>
                <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4} placeholder={
                  aiMode === "html" ? "e.g., A modern business directory page with a hero image, rating stars, contact info section, and a clean card layout."
                  : aiMode === "enhance_prompt" ? "e.g., Property listing page with photos and details"
                  : "e.g., Focus on real estate listings with property details"
                } />
              </div>

              <div className="space-y-2">
                <Label>Brand Guidelines (optional)</Label>
                <Textarea value={aiBrandGuidelines} onChange={(e) => setAiBrandGuidelines(e.target.value)} rows={3} placeholder="Brand voice, colors, fonts, tone, target audience..." />
              </div>

              {availableVars.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs">Available variables ({availableVars.length}) — AI will use these:</Label>
                  <ScrollArea className="max-h-[10rem]">
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
                  <Sparkles className="h-4 w-4 mr-1" />
                  {aiMode === "html" ? "Generate HTML" : aiMode === "enhance_prompt" ? "Enhance Prompt" : "Generate Default Prompt"}
                </Button>
              </DialogFooter>
            </div>
          ) : aiGenerating || (aiStreamingText && !aiPreviewHtml) ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-muted/20" style={{ height: "50vh" }}>
                <ScrollArea className="h-full">
                  <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                    {aiStreamingText}
                    {aiGenerating && <span className="animate-pulse">▊</span>}
                  </pre>
                </ScrollArea>
              </div>
              {aiGenerating && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => { abortRef.current?.abort(); }}>Cancel</Button>
                </div>
              )}
            </div>
          ) : aiPreviewHtml ? (
            <div className="space-y-4">
              <Tabs defaultValue="preview">
                <TabsList>
                  <TabsTrigger value="preview"><Eye className="h-3 w-3 mr-1" /> Preview</TabsTrigger>
                  <TabsTrigger value="code"><Code className="h-3 w-3 mr-1" /> Code</TabsTrigger>
                  {displayMessages.length > 0 && (
                    <TabsTrigger value="chat"><MessageSquare className="h-3 w-3 mr-1" /> Chat ({displayMessages.length})</TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="preview">
                  <div className="border rounded-lg overflow-hidden" style={{ height: "50vh" }}>
                    <iframe title="AI Preview" srcDoc={aiPreviewHtml} className="w-full h-full" sandbox="allow-same-origin" />
                  </div>
                </TabsContent>
                <TabsContent value="code">
                  <div className="border rounded-lg overflow-hidden" style={{ height: "50vh" }}>
                    <ScrollArea className="h-full">
                      <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words text-foreground">{aiPreviewHtml}</pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
                <TabsContent value="chat">
                  <div className="border rounded-lg overflow-hidden" style={{ height: "50vh" }}>
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {displayMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                              <p className="text-xs font-semibold mb-1 opacity-70">{msg.role === "user" ? "You" : "AI"}</p>
                              <p className="whitespace-pre-wrap break-words">{msg.content.length > 500 ? msg.content.slice(0, 500) + "..." : msg.content}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Follow-up input */}
              <div className="flex gap-2">
                <Input
                  value={followUpInput}
                  onChange={(e) => setFollowUpInput(e.target.value)}
                  placeholder="Ask AI to modify... e.g., 'Make the header darker' or 'Add a contact form section'"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleFollowUp()}
                  disabled={aiGenerating}
                />
                <Button onClick={handleFollowUp} disabled={aiGenerating || !followUpInput.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setAiPreviewHtml(null); setAiStreamingText(""); setAiProgress(0); setChatHistory([]); }}>
                  ← Start Over
                </Button>
                <Button onClick={handleApproveAiHtml}>
                  <Sparkles className="h-4 w-4 mr-1" /> Approve & Apply to Template
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Prompt Generator Dialog */}
      <Dialog open={promptGenOpen} onOpenChange={setPromptGenOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileDown className="h-5 w-5" /> Website Prompt</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Use this prompt with ChatGPT, Gemini, Claude, or any AI to generate your HTML template.</p>
          <Textarea value={generatedPrompt} onChange={(e) => setGeneratedPrompt(e.target.value)} rows={16} className="font-mono text-xs" />
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={copyPrompt}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button onClick={downloadPrompt}>
              <FileDown className="h-4 w-4 mr-1" /> Download .txt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
