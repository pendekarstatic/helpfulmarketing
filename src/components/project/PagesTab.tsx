import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Eye, Trash2, Wand2, Edit, Save, ChevronDown, ChevronUp } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface PagesTabProps {
  projectId: string;
}

export default function PagesTab({ projectId }: PagesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

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

  // Fetch project settings for URL format & header/footer
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const formatUrl = (path: string): string => {
    const fmt = (project as any)?.url_format || "pretty_slash";
    // Clean the path
    let clean = path.replace(/\/+/g, "/").replace(/^\//, "");
    clean = clean.replace(/\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "");
    
    switch (fmt) {
      case "pretty_slash": return `/${clean}/`;
      case "pretty_no_slash": return `/${clean}`;
      case "html": return `/${clean}.html`;
      case "directory": return `/${clean}/index.html`;
      default: return `/${clean}/`;
    }
  };

  const generatePages = useMutation({
    mutationFn: async (templateId: string) => {
      setGenerating(true);
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");
      const allRows: any[] = [];
      for (const ds of dataSources) {
        if (Array.isArray(ds.cached_data)) allRows.push(...(ds.cached_data as any[]));
      }
      if (allRows.length === 0) throw new Error("No data available. Add a data source first.");

      const useHF = (project as any)?.use_header_footer;
      const headerHtml = (project as any)?.header_content || "";
      const footerHtml = (project as any)?.footer_content || "";

      const pagesToInsert = allRows.map((row) => {
        let html = template.html_content;
        // Use first non-empty value from common title fields, fallback to first column value
        const title = row.title || row.name || row.Name || row.Title || 
                      Object.values(row).find((v) => typeof v === "string" && (v as string).trim()) || "Untitled";
        const slug = (row.slug || String(title)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        // Replace variables, using empty string for missing data (default behavior)
        Object.entries(row).forEach(([key, value]) => {
          html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
        });

        let metaTitle = template.meta_title_pattern || "{{title}}";
        let metaDesc = template.meta_description_pattern || "{{description}}";
        Object.entries(row).forEach(([key, value]) => {
          metaTitle = metaTitle.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
          metaDesc = metaDesc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
        });
        // Replace remaining unresolved variables with empty string
        metaTitle = metaTitle.replace(/\{\{[^}]+\}\}/g, "");
        metaDesc = metaDesc.replace(/\{\{[^}]+\}\}/g, "");

        let urlPath = template.url_pattern || "/{{slug}}";
        Object.entries(row).forEach(([key, value]) => {
          urlPath = urlPath.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        });
        urlPath = urlPath.replace(/\{\{slug\}\}/g, slug);
        urlPath = formatUrl(urlPath);

        // JSON-LD structured data
        const schemaType = template.schema_type || "Thing";
        const schemaMarkup = generateJsonLd(schemaType, row, String(title), metaDesc);

        // Inject JSON-LD + breadcrumbs into HTML
        const breadcrumbHtml = `<nav aria-label="breadcrumb" style="font-size:0.8rem;color:#666;margin-bottom:1rem;"><a href="/" style="color:#5b4fe0;text-decoration:none;">Home</a> › ${row.category ? `<a href="/category/${(row.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}" style="color:#5b4fe0;text-decoration:none;">${row.category}</a> › ` : ""}${title}</nav>`;
        const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>`;

        html = html.replace("<body>", `<body>\n${jsonLdScript}`);
        html = html.replace(/<div class="container">/i, `<div class="container">\n${breadcrumbHtml}`);

        // Inject shared header/footer if enabled
        if (useHF) {
          if (headerHtml) html = html.replace("<body>", `<body>\n${headerHtml}`);
          if (footerHtml) html = html.replace("</body>", `${footerHtml}\n</body>`);
        }

        return {
          project_id: projectId,
          template_id: templateId,
          title: String(title),
          slug,
          url_path: urlPath,
          status: "draft" as const,
          data: row as unknown as Json,
          meta_title: metaTitle || String(title),
          meta_description: metaDesc,
          generated_html: html,
          schema_markup: schemaMarkup as unknown as Json,
        };
      });

      const { error } = await supabase.from("pages").insert(pagesToInsert);
      if (error) throw error;
      return pagesToInsert.length;
    },
    onSuccess: (count) => {
      setGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: `${count} pages generated with JSON-LD & breadcrumbs!` });
    },
    onError: (err: any) => {
      setGenerating(false);
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const updatePage = useMutation({
    mutationFn: async (page: any) => {
      const { error } = await supabase.from("pages").update({
        title: page.title,
        slug: page.slug,
        url_path: page.url_path,
        meta_title: page.meta_title,
        meta_description: page.meta_description,
        status: page.status,
        generated_html: page.generated_html,
      }).eq("id", page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      setEditingPage(null);
      toast({ title: "Page updated!" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("pages").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pages", projectId] }),
  });

  const bulkUpdateStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("pages").update({ status: status as any }).eq("project_id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: "All pages updated!" });
    },
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

  const filteredPages = pages
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter((p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aVal = (a as any)[sortField] || "";
      const bVal = (b as any)[sortField] || "";
      return sortAsc ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

  const statusColor = (s: string) => {
    switch (s) {
      case "published": return "bg-success/10 text-success";
      case "draft": return "bg-warning/10 text-warning";
      case "archived": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  const toggleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: string }) => (
    sortField === field ? (sortAsc ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />) : null
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-semibold">Pages</h3>
          <p className="text-sm text-muted-foreground">{pages.length} total · {filteredPages.length} shown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {pages.length > 0 && (
            <>
              <Select onValueChange={(v) => bulkUpdateStatus.mutate(v)}>
                <SelectTrigger className="w-auto h-9">
                  <span className="text-sm">Bulk Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">All → Draft</SelectItem>
                  <SelectItem value="published">All → Published</SelectItem>
                  <SelectItem value="archived">All → Archived</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => deleteAllPages.mutate()}>
                <Trash2 className="h-4 w-4 mr-1" /> Clear All
              </Button>
            </>
          )}
          {templates.length > 0 && (
            <Select onValueChange={(v) => generatePages.mutate(v)}>
              <SelectTrigger className="w-auto h-9">
                <span className="text-sm flex items-center gap-1"><Wand2 className="h-3 w-3" /> {generating ? "Generating..." : "Generate"}</span>
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

      {/* Filters */}
      {pages.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="Search pages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs h-9" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {filteredPages.length === 0 && pages.length === 0 ? (
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
                <TableHead className="cursor-pointer" onClick={() => toggleSort("title")}>Title <SortIcon field="title" /></TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("slug")}>URL <SortIcon field="slug" /></TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("updated_at")}>Updated <SortIcon field="updated_at" /></TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{page.title}</TableCell>
                  <TableCell className="font-mono text-xs max-w-[150px] truncate">{page.url_path || `/${page.slug}`}</TableCell>
                  <TableCell>
                    <Select value={page.status} onValueChange={(v) => updateStatus.mutate({ id: page.id, status: v })}>
                      <SelectTrigger className="h-7 w-auto border-0 p-0">
                        <Badge variant="secondary" className={statusColor(page.status)}>{page.status}</Badge>
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit" onClick={() => setEditingPage({ ...page })}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview" onClick={() => setPreviewHtml(page.generated_html)}>
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

      {/* Edit Page Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
          </DialogHeader>
          {editingPage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editingPage.title} onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={editingPage.slug} onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })} className="font-mono text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL Path</Label>
                <Input value={editingPage.url_path || ""} onChange={(e) => setEditingPage({ ...editingPage, url_path: e.target.value })} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={editingPage.meta_title || ""} onChange={(e) => setEditingPage({ ...editingPage, meta_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={editingPage.meta_description || ""} onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editingPage.status} onValueChange={(v) => setEditingPage({ ...editingPage, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => editingPage && updatePage.mutate(editingPage)} disabled={updatePage.isPending}>
              <Save className="h-4 w-4 mr-1" /> {updatePage.isPending ? "Saving..." : "Save Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewHtml} onOpenChange={() => setPreviewHtml(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Page Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden" style={{ height: "70vh" }}>
            <iframe title="Page Preview" srcDoc={previewHtml || ""} className="w-full h-full" sandbox="allow-same-origin" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function generateJsonLd(schemaType: string, row: any, title: string, description: string): any {
  const base: any = {
    "@context": "https://schema.org",
    "@type": schemaType || "Thing",
    name: title,
    description: description,
  };

  if (row.url) base.url = row.url;
  if (row.image) base.image = row.image;

  switch (schemaType) {
    case "LocalBusiness":
      if (row.location) base.address = { "@type": "PostalAddress", addressLocality: row.location };
      if (row.rating) base.aggregateRating = { "@type": "AggregateRating", ratingValue: row.rating, bestRating: "5" };
      if (row.phone) base.telephone = row.phone;
      break;
    case "Product":
      if (row.price) base.offers = { "@type": "Offer", price: row.price.replace(/[^0-9.]/g, ""), priceCurrency: "USD" };
      if (row.rating) base.aggregateRating = { "@type": "AggregateRating", ratingValue: row.rating, bestRating: "5" };
      break;
    case "JobPosting":
      base.title = title;
      if (row.company) base.hiringOrganization = { "@type": "Organization", name: row.company };
      if (row.location) base.jobLocation = { "@type": "Place", address: row.location };
      break;
    default:
      break;
  }

  return base;
}
