import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Eye, Trash2, Wand2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface PagesTabProps {
  projectId: string;
}

export default function PagesTab({ projectId }: PagesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: pages = [] } = useQuery({
    queryKey: ["pages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .or(`project_id.eq.${projectId},is_builtin.eq.true`);
      if (error) throw error;
      return data;
    },
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ["data-sources", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  const generatePages = useMutation({
    mutationFn: async (templateId: string) => {
      setGenerating(true);
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");

      // Gather all rows from all data sources
      const allRows: any[] = [];
      for (const ds of dataSources) {
        if (Array.isArray(ds.cached_data)) {
          allRows.push(...(ds.cached_data as any[]));
        }
      }

      if (allRows.length === 0) throw new Error("No data available. Add a data source first.");

      // Generate pages
      const pagesToInsert = allRows.map((row) => {
        let html = template.html_content;
        let title = row.title || row.name || row.Name || row.Title || "Untitled";
        let slug = (row.slug || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        // Variable injection
        Object.entries(row).forEach(([key, value]) => {
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
        });

        // Generate meta
        let metaTitle = template.meta_title_pattern || "{{title}}";
        let metaDesc = template.meta_description_pattern || "{{description}}";
        Object.entries(row).forEach(([key, value]) => {
          metaTitle = metaTitle.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
          metaDesc = metaDesc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || ""));
        });

        // URL path from pattern
        let urlPath = template.url_pattern || "/{{slug}}";
        Object.entries(row).forEach(([key, value]) => {
          urlPath = urlPath.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        });
        urlPath = urlPath.replace(/\{\{slug\}\}/g, slug);

        return {
          project_id: projectId,
          template_id: templateId,
          title,
          slug,
          url_path: urlPath,
          status: "draft" as const,
          data: row as unknown as Json,
          meta_title: metaTitle,
          meta_description: metaDesc,
          generated_html: html,
        };
      });

      const { error } = await supabase.from("pages").insert(pagesToInsert);
      if (error) throw error;
      return pagesToInsert.length;
    },
    onSuccess: (count) => {
      setGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: `${count} pages generated!` });
    },
    onError: (err: any) => {
      setGenerating(false);
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("pages").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages", projectId] }),
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: "Page deleted" });
    },
  });

  const deleteAllPages = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("pages").delete().eq("project_id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: "All pages deleted" });
    },
  });

  const statusColor = (s: string) => {
    switch (s) {
      case "published": return "bg-success/10 text-success";
      case "draft": return "bg-warning/10 text-warning";
      case "archived": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Pages</h3>
          <p className="text-sm text-muted-foreground">{pages.length} pages generated</p>
        </div>
        <div className="flex gap-2">
          {pages.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => deleteAllPages.mutate()}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear All
            </Button>
          )}
          {templates.length > 0 && (
            <Select onValueChange={(v) => generatePages.mutate(v)}>
              <SelectTrigger className="w-auto">
                <Button asChild variant="default" disabled={generating}>
                  <span><Wand2 className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "Generate Pages"}</span>
                </Button>
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {pages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No pages yet</h3>
            <p className="text-muted-foreground mb-4">Add data sources and templates, then generate pages.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{page.title}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[150px] truncate">{page.url_path || `/${page.slug}`}</TableCell>
                  <TableCell>
                    <Select value={page.status} onValueChange={(v) => updateStatus.mutate({ id: page.id, status: v })}>
                      <SelectTrigger className="h-7 w-auto">
                        <Badge variant="secondary" className={statusColor(page.status)}>
                          {page.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewHtml(page.generated_html)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePage.mutate(page.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={!!previewHtml} onOpenChange={() => setPreviewHtml(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Page Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden" style={{ height: "70vh" }}>
            <iframe
              title="Page Preview"
              srcDoc={previewHtml || ""}
              className="w-full h-full"
              sandbox="allow-same-origin"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
