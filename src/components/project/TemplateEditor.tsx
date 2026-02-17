import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Eye, Code } from "lucide-react";

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

  // Get ALL data sources to collect all variables
  const { data: allDataSources = [] } = useQuery({
    queryKey: ["all-data-sources", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("data_sources")
        .select("cached_data")
        .eq("project_id", projectId);
      return data || [];
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
      for (const key of Object.keys((ds.cached_data as any[])[0])) {
        if (!availableVars.includes(key)) availableVars.push(key);
      }
    }
  }

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
    // Inject CSS if separate
    if (css) {
      rendered = rendered.replace("</head>", `<style>${css}</style></head>`);
    }
    return rendered;
  }, [html, css, sampleData]);

  // availableVars already computed above from all data sources

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-xl font-semibold">{template.name}</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <><Code className="h-4 w-4 mr-1" /> Editor</> : <><Eye className="h-4 w-4 mr-1" /> Preview</>}
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-1" /> {save.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Variable chips - scrollable, max 5 lines */}
      {availableVars.length > 0 && (
        <ScrollArea className="max-h-[7.5rem]">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground py-1">Available variables:</span>
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

      {/* Editor / Preview */}
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
        <Tabs defaultValue="html" className="space-y-2">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
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
        </Tabs>
      )}
    </div>
  );
}
