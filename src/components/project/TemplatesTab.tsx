import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileCode, Trash2, Edit, Copy, Eye } from "lucide-react";
import TemplateEditor from "./TemplateEditor";
import type { Database } from "@/integrations/supabase/types";

type TemplateType = Database["public"]["Enums"]["template_type"];

interface TemplatesTabProps {
  projectId: string;
  projectMode: string;
}

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  listing_detail: "Listing Detail",
  category_page: "Category Page",
  search_results: "Search Results",
  location_page: "Location Page",
  best_x_in_y: "Best X in Y",
  comparison: "Comparison",
  glossary: "Glossary",
  custom: "Custom",
};

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #1a1a2e; background: #fafafa; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .card { background: white; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 1rem; }
    .description { font-size: 1rem; line-height: 1.8; }
    img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>{{title}}</h1>
      <div class="meta">{{category}} · {{location}}</div>
      <img src="{{image}}" alt="{{title}}" />
      <div class="description">{{description}}</div>
    </div>
  </div>
</body>
</html>`;

export default function TemplatesTab({ projectId, projectMode }: TemplatesTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .or(`project_id.eq.${projectId},is_builtin.eq.true`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createTemplate = useMutation({
    mutationFn: async ({ name, template_type }: { name: string; template_type: TemplateType }) => {
      const { error } = await supabase.from("templates").insert({
        project_id: projectId,
        user_id: user!.id,
        name,
        template_type,
        html_content: DEFAULT_HTML,
        url_pattern: "/{{slug}}",
        meta_title_pattern: "{{title}} — {{site_name}}",
        meta_description_pattern: "{{description}}",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      setCreateOpen(false);
      toast({ title: "Template created!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (t: any) => {
      const { error } = await supabase.from("templates").insert({
        project_id: projectId,
        user_id: user!.id,
        name: `${t.name} (Copy)`,
        template_type: t.template_type,
        html_content: t.html_content,
        css_content: t.css_content,
        url_pattern: t.url_pattern,
        meta_title_pattern: t.meta_title_pattern,
        meta_description_pattern: t.meta_description_pattern,
        schema_type: t.schema_type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      toast({ title: "Template duplicated" });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      toast({ title: "Template deleted" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createTemplate.mutate({
      name: form.get("name") as string,
      template_type: (form.get("template_type") as TemplateType) || "custom",
    });
  };

  const editingTemplate = editingId ? templates.find((t) => t.id === editingId) : null;

  if (editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate}
        projectId={projectId}
        onBack={() => setEditingId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Templates</h3>
          <p className="text-sm text-muted-foreground">HTML templates with {"{{variable}}"} injection</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New Template</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input name="name" required placeholder="Listing Detail" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select name="template_type" defaultValue="custom">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createTemplate.isPending}>Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No templates yet</h3>
            <p className="text-muted-foreground mb-4">Create a custom HTML template to start generating pages.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{TEMPLATE_LABELS[t.template_type]}</Badge>
                      <span className="text-xs">v{t.version}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(t.id)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicateTemplate.mutate(t)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  {!t.is_builtin && (
                    <Button size="sm" variant="ghost" onClick={() => deleteTemplate.mutate(t.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
