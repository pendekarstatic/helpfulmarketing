import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Globe, Link2, List, Code, AlertTriangle, CheckCircle, Save } from "lucide-react";

interface SeoTabProps {
  projectId: string;
  project: any;
}

export default function SeoTab({ projectId, project }: SeoTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMeta, setEditingMeta] = useState<any>(null);

  const { data: pages = [] } = useQuery({
    queryKey: ["pages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("project_id", projectId).order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("*").or(`project_id.eq.${projectId},is_builtin.eq.true`);
      if (error) throw error;
      return data;
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, schema_type }: { id: string; schema_type: string }) => {
      const { error } = await supabase.from("templates").update({ schema_type }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      toast({ title: "Schema type updated!" });
    },
  });

  const updateMeta = useMutation({
    mutationFn: async (page: any) => {
      const { error } = await supabase.from("pages").update({
        meta_title: page.meta_title,
        meta_description: page.meta_description,
      }).eq("id", page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      setEditingMeta(null);
      toast({ title: "Meta tags updated!" });
    },
  });

  const publishedPages = pages.filter((p) => p.status === "published");
  const draftPages = pages.filter((p) => p.status === "draft");
  const pagesWithMeta = pages.filter((p) => p.meta_title && p.meta_description);
  const pagesWithoutMeta = pages.filter((p) => !p.meta_title || !p.meta_description);
  const pagesWithSchema = pages.filter((p) => p.schema_markup);
  const titleTooLong = pages.filter((p) => p.meta_title && p.meta_title.length > 60);
  const descTooLong = pages.filter((p) => p.meta_description && p.meta_description.length > 160);

  // Internal linking analysis
  const categories = [...new Set(pages.map((p) => {
    const d = p.data as any;
    return d?.category || d?.Category;
  }).filter(Boolean))];
  const locations = [...new Set(pages.map((p) => {
    const d = p.data as any;
    return d?.location || d?.Location || d?.city || d?.City;
  }).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">SEO Engine</h3>
        <p className="text-sm text-muted-foreground">Complete SEO health dashboard with meta tags, structured data, and internal linking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Pages" value={pages.length} />
        <StatCard label="Published" value={publishedPages.length} color="text-success" />
        <StatCard label="Drafts" value={draftPages.length} color="text-warning" />
        <StatCard label="With Meta" value={pagesWithMeta.length} />
        <StatCard label="With Schema" value={pagesWithSchema.length} />
      </div>

      {/* SERP Preview */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> SERP Preview</CardTitle>
            <CardDescription>Click any result to edit its meta tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pages.slice(0, 8).map((page) => (
              <div key={page.id} className="space-y-1 cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2 transition-colors" onClick={() => setEditingMeta({ ...page })}>
                <div className="text-sm text-primary hover:underline truncate">
                  {page.meta_title || page.title}
                  {page.meta_title && page.meta_title.length > 60 && <Badge variant="outline" className="ml-2 text-xs text-destructive">Too long</Badge>}
                </div>
                <div className="text-xs text-success truncate">{project.slug || "example.com"}{page.url_path || `/${page.slug}`}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {page.meta_description || <span className="text-destructive italic">No meta description</span>}
                  {page.meta_description && page.meta_description.length > 160 && <Badge variant="outline" className="ml-2 text-xs text-destructive">Too long</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Structured Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4" /> JSON-LD Structured Data</CardTitle>
          <CardDescription>Set schema type per template for auto-generated structured data</CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-40 truncate">{t.name}</span>
                  <Select value={t.schema_type || ""} onValueChange={(v) => updateTemplate.mutate({ id: t.id, schema_type: v })}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="Select schema..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Thing">Thing (Generic)</SelectItem>
                      <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="JobPosting">JobPosting</SelectItem>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="FAQPage">FAQPage</SelectItem>
                      <SelectItem value="SoftwareApplication">SoftwareApplication</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" className="text-xs">{t.schema_type || "None"}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Create templates first to configure structured data.</p>
          )}
        </CardContent>
      </Card>

      {/* Internal Linking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Link2 className="h-4 w-4" /> Internal Linking Opportunities</CardTitle>
          <CardDescription>Auto-detected categories and locations for hub pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Categories ({categories.length})</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categories.map((cat) => {
                    const count = pages.filter((p) => {
                      const d = p.data as any;
                      return (d?.category || d?.Category) === cat;
                    }).length;
                    return <Badge key={String(cat)} variant="secondary">{String(cat)} ({count})</Badge>;
                  })}
                </div>
              </div>
            )}
            {locations.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Locations ({locations.length})</Label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {locations.map((loc) => {
                    const count = pages.filter((p) => {
                      const d = p.data as any;
                      return (d?.location || d?.Location || d?.city || d?.City) === loc;
                    }).length;
                    return <Badge key={String(loc)} variant="outline">{String(loc)} ({count})</Badge>;
                  })}
                </div>
              </div>
            )}
            {categories.length === 0 && locations.length === 0 && (
              <p className="text-sm text-muted-foreground">Generate pages with category/location data to see linking opportunities.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pagesWithoutMeta.length > 0 && (
          <Card className="border-warning/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-warning"><AlertTriangle className="h-4 w-4" /> Missing Meta ({pagesWithoutMeta.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {pagesWithoutMeta.slice(0, 5).map((p) => (
                  <div key={p.id} className="text-sm flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => setEditingMeta({ ...p })}>
                    <Badge variant="outline" className="text-xs">{!p.meta_title ? "title" : "desc"}</Badge>
                    <span className="truncate">{p.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {(titleTooLong.length > 0 || descTooLong.length > 0) && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" /> Length Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {titleTooLong.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-sm"><Badge variant="outline" className="text-xs mr-2">title &gt;60</Badge>{p.title}</div>
                ))}
                {descTooLong.slice(0, 3).map((p) => (
                  <div key={p.id} className="text-sm"><Badge variant="outline" className="text-xs mr-2">desc &gt;160</Badge>{p.title}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {pagesWithoutMeta.length === 0 && titleTooLong.length === 0 && descTooLong.length === 0 && pages.length > 0 && (
          <Card className="border-success/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-success"><CheckCircle className="h-4 w-4" /> All Good!</CardTitle>
              <CardDescription>All pages have valid meta tags.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Sitemap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><List className="h-4 w-4" /> Sitemap</CardTitle>
          <CardDescription>{publishedPages.length} published URLs included. Export from the Export tab.</CardDescription>
        </CardHeader>
      </Card>

      {/* Edit Meta Dialog */}
      <Dialog open={!!editingMeta} onOpenChange={() => setEditingMeta(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meta Tags</DialogTitle>
          </DialogHeader>
          {editingMeta && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title <span className="text-xs text-muted-foreground">({(editingMeta.meta_title || "").length}/60)</span></Label>
                <Input value={editingMeta.meta_title || ""} onChange={(e) => setEditingMeta({ ...editingMeta, meta_title: e.target.value })} />
                {(editingMeta.meta_title || "").length > 60 && <p className="text-xs text-destructive">Title is too long for optimal SEO</p>}
              </div>
              <div className="space-y-2">
                <Label>Meta Description <span className="text-xs text-muted-foreground">({(editingMeta.meta_description || "").length}/160)</span></Label>
                <Input value={editingMeta.meta_description || ""} onChange={(e) => setEditingMeta({ ...editingMeta, meta_description: e.target.value })} />
                {(editingMeta.meta_description || "").length > 160 && <p className="text-xs text-destructive">Description is too long for optimal SEO</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => editingMeta && updateMeta.mutate(editingMeta)} disabled={updateMeta.isPending}>
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`text-3xl font-bold ${color || ""}`}>{value}</div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
