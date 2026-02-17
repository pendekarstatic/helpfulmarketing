import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Eye, Trash2, Wand2, Edit, Save, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from "lucide-react";
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
  const [templateFilter, setTemplateFilter] = useState<string>("all");
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

  // Updated filter logic: supports comma-separated values and matchScope
  const applyFilters = (rows: any[], filterRules: any[]): any[] => {
    if (!filterRules || filterRules.length === 0) return rows;
    return rows.filter(row => {
      return filterRules.every((f: any) => {
        const filterValues = String(f.value ?? "").split(",").map((v: string) => v.trim().toLowerCase()).filter(Boolean);
        if (filterValues.length === 0) return true;
        
        const matchScope = f.matchScope || "specific";
        
        const checkValue = (cellValue: string): boolean => {
          const val = cellValue.toLowerCase();
          switch (f.operator) {
            case "contains": return filterValues.some(fv => val.includes(fv));
            case "equals": return filterValues.some(fv => val === fv);
            case "not_contains": return filterValues.every(fv => !val.includes(fv));
            default: return true;
          }
        };
        
        if (matchScope === "any") {
          // Match if ANY variable/column contains the value
          return Object.values(row).some(v => checkValue(String(v ?? "")));
        } else if (matchScope === "all") {
          // Match if ALL variables/columns contain the value
          return Object.values(row).every(v => checkValue(String(v ?? "")));
        } else {
          // specific: match only the specified variable
          return checkValue(String(row[f.variable] ?? ""));
        }
      });
    });
  };

  const expandRows = (rows: any[], template: any): any[] => {
    const genMode = (template as any).generation_mode || "normal";
    
    if (genMode === "split") {
      const splitCol = (template as any).split_column;
      if (!splitCol) return rows;
      const expanded: any[] = [];
      for (const row of rows) {
        const val = String(row[splitCol] || "");
        const parts = val.split(",").map((s: string) => s.trim()).filter(Boolean);
        if (parts.length <= 1) {
          expanded.push(row);
        } else {
          for (const part of parts) {
            expanded.push({ ...row, [splitCol]: part });
          }
        }
      }
      return expanded;
    }
    
    if (genMode === "combo") {
      const comboCols = (template as any).combo_columns;
      if (!Array.isArray(comboCols) || comboCols.length < 2) return rows;
      const [colA, colB] = comboCols;
      
      const valuesA = new Set<string>();
      const valuesB = new Set<string>();
      for (const row of rows) {
        const aVals = String(row[colA] || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const bVals = String(row[colB] || "").split(",").map((s: string) => s.trim()).filter(Boolean);
        aVals.forEach((v: string) => valuesA.add(v));
        bVals.forEach((v: string) => valuesB.add(v));
      }
      
      const baseRow = rows[0] || {};
      const expanded: any[] = [];
      for (const a of valuesA) {
        for (const b of valuesB) {
          expanded.push({ ...baseRow, [colA]: a, [colB]: b, title: `${a} in ${b}`, slug: `${a}-in-${b}`.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
        }
      }
      return expanded;
    }
    
    return rows;
  };

  const generatePages = useMutation({
    mutationFn: async ({ templateId, regenerate }: { templateId: string; regenerate?: boolean }) => {
      setGenerating(true);
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");
      let allRows: any[] = [];
      for (const ds of dataSources) {
        if (Array.isArray(ds.cached_data)) allRows.push(...(ds.cached_data as any[]));
      }
      if (allRows.length === 0) throw new Error("No data available. Add a data source first.");

      const filterRules = (template as any).filter_rules;
      allRows = applyFilters(allRows, filterRules);
      allRows = expandRows(allRows, template);

      if (allRows.length === 0) throw new Error("No rows match the filter rules.");

      const existingSlugs = new Set(
        pages
          .filter((p) => !regenerate && p.template_id === templateId)
          .map((p) => p.slug)
      );

      if (regenerate) {
        const { error: delErr } = await supabase
          .from("pages")
          .delete()
          .eq("project_id", projectId)
          .eq("template_id", templateId);
        if (delErr) throw delErr;
      }

      const useHF = (project as any)?.use_header_footer;
      const headerHtml = (project as any)?.header_content || "";
      const footerHtml = (project as any)?.footer_content || "";

      const pagesToInsert = allRows
        .map((row) => {
          let html = template.html_content;
          const title = row.title || row.name || row.Name || row.Title || 
                        Object.values(row).find((v) => typeof v === "string" && (v as string).trim()) || "Untitled";
          const slug = (row.slug || String(title)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

          if (existingSlugs.has(slug)) return null;
          existingSlugs.add(slug);

          Object.entries(row).forEach(([key, value]) => {
            html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
          });

          let metaTitle = template.meta_title_pattern || "{{title}}";
          let metaDesc = template.meta_description_pattern || "{{description}}";
          Object.entries(row).forEach(([key, value]) => {
            metaTitle = metaTitle.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
            metaDesc = metaDesc.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? ""));
          });
          metaTitle = metaTitle.replace(/\{\{[^}]+\}\}/g, "");
          metaDesc = metaDesc.replace(/\{\{[^}]+\}\}/g, "");

          let urlPath = template.url_pattern || "/{{slug}}";
          Object.entries(row).forEach(([key, value]) => {
            urlPath = urlPath.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"));
          });
          urlPath = urlPath.replace(/\{\{slug\}\}/g, slug);
          urlPath = formatUrl(urlPath);

          const schemaType = template.schema_type || "Thing";
          const schemaMarkup = generateJsonLd(schemaType, row, String(title), metaDesc);

          const breadcrumbHtml = `<nav aria-label="breadcrumb" style="font-size:0.8rem;color:#666;margin-bottom:1rem;"><a href="/" style="color:#5b4fe0;text-decoration:none;">Home</a> › ${row.category ? `<a href="/category/${(row.category || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}" style="color:#5b4fe0;text-decoration:none;">${row.category}</a> › ` : ""}${title}</nav>`;
          const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(schemaMarkup)}</script>`;

          html = html.replace("<body>", `<body>\n${jsonLdScript}`);
          html = html.replace(/<div class="container">/i, `<div class="container">\n${breadcrumbHtml}`);

          if (useHF) {
            if (headerHtml) html = html.replace("<body>", `<body>\n${headerHtml}`);
            if (footerHtml) html = html.replace("</body>", `${footerHtml}\n</body>`);
          }

          // Inject ALL_LISTINGS data for recommendations/SRP dynamic rendering
          const listingsJson = JSON.stringify(allRows.map(r => ({
            hotel_name: r.hotel_name || r.title || '',
            slug: (r.slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            city: r.city || '',
            country: r.country || '',
            district: r.district || '',
            category: r.category || '',
            brand_name: r.brand_name || '',
            property_type: r.property_type || '',
            stars: r.stars || '',
            rating: r.rating || '',
            number_of_reviews: r.number_of_reviews || '',
            price_per_night: r.price_per_night || '',
            photo_url: r.photo_url || '',
            amenities: r.amenities || '',
            bedrooms: r.bedrooms || '',
            description: (r.description || '').substring(0, 150),
          })));
          const listingsScript = `<script>window.__ALL_LISTINGS__=${listingsJson};</script>`;
          html = html.replace("</head>", `${listingsScript}\n</head>`);

          // Store which filter was used for sitemap grouping
          const filterTag = filterRules && filterRules.length > 0
            ? filterRules.map((f: any) => `${f.variable}:${f.value}`).join("|")
            : null;

          return {
            project_id: projectId,
            template_id: templateId,
            title: String(title),
            slug,
            url_path: urlPath,
            status: "draft" as const,
            data: { ...row, _filter_tag: filterTag } as unknown as Json,
            meta_title: metaTitle || String(title),
            meta_description: metaDesc,
            generated_html: html,
            schema_markup: schemaMarkup as unknown as Json,
          };
        })
        .filter(Boolean);

      if (pagesToInsert.length === 0) {
        throw new Error("No new pages to generate. All data rows already have pages.");
      }

      const { error } = await supabase.from("pages").insert(pagesToInsert);
      if (error) throw error;
      return pagesToInsert.length;
    },
    onSuccess: (count) => {
      setGenerating(false);
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: `${count} pages generated (duplicates skipped)!` });
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

  const openPreviewNewTab = (html: string, title: string) => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.document.title = title;
    }
  };

  const templateNames = new Map<string, string>();
  for (const p of pages) {
    if (p.template_id) {
      const t = templates.find((t) => t.id === p.template_id);
      if (t) templateNames.set(t.id, t.name);
    }
  }

  const filteredPages = pages
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter((p) => templateFilter === "all" || p.template_id === templateFilter)
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const d = p.data as any;
      if (p.title.toLowerCase().includes(q)) return true;
      if (p.slug.toLowerCase().includes(q)) return true;
      if (p.url_path?.toLowerCase().includes(q)) return true;
      if (p.meta_title?.toLowerCase().includes(q)) return true;
      if (p.meta_description?.toLowerCase().includes(q)) return true;
      if (d && typeof d === "object") {
        return Object.values(d).some((v) => String(v ?? "").toLowerCase().includes(q));
      }
      return false;
    })
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
            <>
              <Button variant="default" size="sm" disabled={generating} onClick={async () => {
                for (const t of templates) {
                  try { await generatePages.mutateAsync({ templateId: t.id }); } catch {}
                }
              }}>
                <Wand2 className="h-4 w-4 mr-1" /> {generating ? "Generating..." : "Bulk Generate All"}
              </Button>
              <Button variant="outline" size="sm" disabled={generating} onClick={async () => {
                for (const t of templates) {
                  try { await generatePages.mutateAsync({ templateId: t.id, regenerate: true }); } catch {}
                }
              }}>
                <RefreshCw className="h-4 w-4 mr-1" /> Bulk Regenerate All
              </Button>
              <Select onValueChange={(v) => generatePages.mutate({ templateId: v })}>
                <SelectTrigger className="w-auto h-9">
                  <span className="text-sm flex items-center gap-1"><Wand2 className="h-3 w-3" /> Generate</span>
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => generatePages.mutate({ templateId: v, regenerate: true })}>
                <SelectTrigger className="w-auto h-9">
                  <span className="text-sm flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Regenerate</span>
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} (replace existing)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      {pages.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Input placeholder="Search all fields..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs h-9" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {templateNames.size > 0 && (
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-44 h-9"><SelectValue placeholder="All Templates" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {Array.from(templateNames.entries()).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Open in new tab" onClick={() => openPreviewNewTab(page.generated_html || "", page.title)}>
                        <ExternalLink className="h-3 w-3" />
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
            <DialogTitle className="flex items-center justify-between">
              Page Preview
              <Button variant="outline" size="sm" onClick={() => previewHtml && openPreviewNewTab(previewHtml, "Preview")}>
                <ExternalLink className="h-3 w-3 mr-1" /> Open in New Tab
              </Button>
            </DialogTitle>
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
