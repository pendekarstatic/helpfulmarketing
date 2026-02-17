import { useState } from "react";
import { SAMPLE_HOMEPAGE_HTML, SAMPLE_CONTACT_HTML, SAMPLE_PRIVACY_HTML, SAMPLE_ABOUT_HTML, ESSENTIAL_PAGES, DEFAULT_PAGE_HTML } from "@/lib/sample-data";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Home, FileCode, Trash2, Edit, Eye, Save, ArrowLeft, ExternalLink, Sparkles, AlertTriangle } from "lucide-react";

interface CustomPagesTabProps {
  projectId: string;
}

const STARTER_TEMPLATES: Record<string, { title: string; slug: string; urlPath: string; html: string; isHomepage: boolean }> = {
  homepage: { title: "Homepage", slug: "index", urlPath: "/", isHomepage: true, html: SAMPLE_HOMEPAGE_HTML },
  contact: { title: "Contact Us", slug: "contact", urlPath: "/contact/", isHomepage: false, html: SAMPLE_CONTACT_HTML },
  privacy: { title: "Privacy Policy", slug: "privacy", urlPath: "/privacy/", isHomepage: false, html: SAMPLE_PRIVACY_HTML },
  about: { title: "About Us", slug: "about", urlPath: "/about/", isHomepage: false, html: SAMPLE_ABOUT_HTML },
  listings_hub: {
    title: "All Listings",
    slug: "listings",
    urlPath: "/listings/",
    isHomepage: false,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Listings — {{site_name}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b}
    .header{background:#1e293b;color:white;padding:1.5rem 2rem}
    .header a{color:white;text-decoration:none;opacity:0.7}
    .header a:hover{opacity:1}
    .container{max-width:1200px;margin:0 auto;padding:2rem}
    h1{font-size:2rem;margin-bottom:1rem}
    .subtitle{color:#64748b;margin-bottom:2rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .card{background:white;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;transition:transform 0.2s,box-shadow 0.2s}
    .card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,0.08)}
    .card-body{padding:1.25rem}
    .card h3{font-size:1rem;margin-bottom:0.25rem}
    .card .meta{color:#64748b;font-size:0.8rem}
    .footer{text-align:center;padding:3rem 2rem;color:#94a3b8;font-size:0.875rem}
  </style>
</head>
<body>
  <div class="header">
    <a href="/">← Home</a> &nbsp; <strong>All Listings</strong>
  </div>
  <div class="container">
    <h1>All Listings</h1>
    <p class="subtitle">Browse all entries in our directory. Click any listing to view details.</p>
    <div class="grid">
      <!-- Generated listing cards will link here from your pages -->
      <div class="card">
        <div class="card-body">
          <h3>Listing pages will link back to this hub</h3>
          <div class="meta">Add your generated listing pages and link them here</div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">© {{site_name}}</div>
</body>
</html>`,
  },
  locations_hub: {
    title: "Locations",
    slug: "locations",
    urlPath: "/locations/",
    isHomepage: false,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Locations — {{site_name}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a}
    .header{background:#0f172a;color:white;padding:1.5rem 2rem}
    .header a{color:white;text-decoration:none;opacity:0.7}
    .container{max-width:1000px;margin:0 auto;padding:2rem}
    h1{font-size:2rem;margin-bottom:0.5rem}
    .subtitle{color:#64748b;margin-bottom:2rem}
    .list{display:flex;flex-direction:column;gap:0.75rem}
    .item{background:white;border-radius:8px;padding:1.25rem 1.5rem;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:inherit;transition:box-shadow 0.2s}
    .item:hover{box-shadow:0 4px 12px rgba(0,0,0,0.08)}
    .item h3{font-size:1rem;margin-bottom:0.15rem}
    .item .count{color:#64748b;font-size:0.8rem}
    .item .arrow{color:#94a3b8;font-size:1.25rem}
  </style>
</head>
<body>
  <div class="header">
    <a href="/">← Home</a> &nbsp; <strong>Locations</strong>
  </div>
  <div class="container">
    <h1>Browse by Location</h1>
    <p class="subtitle">Find listings organized by location.</p>
    <div class="list">
      <a href="#" class="item">
        <div><h3>Location Name</h3><span class="count">X listings</span></div>
        <span class="arrow">→</span>
      </a>
    </div>
  </div>
</body>
</html>`,
  },
  categories_hub: {
    title: "Categories",
    slug: "categories",
    urlPath: "/categories/",
    isHomepage: false,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Categories — {{site_name}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b}
    .header{background:#1e293b;color:white;padding:1.5rem 2rem}
    .header a{color:white;text-decoration:none;opacity:0.7}
    .container{max-width:1000px;margin:0 auto;padding:2rem}
    h1{font-size:2rem;margin-bottom:0.5rem}
    .subtitle{color:#64748b;margin-bottom:2rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1.5rem}
    .card{background:white;border-radius:12px;padding:1.5rem;border:1px solid #e2e8f0;text-decoration:none;color:inherit;transition:transform 0.2s}
    .card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,0.06)}
    .card h3{font-size:1.1rem;margin-bottom:0.25rem}
    .card .count{color:#64748b;font-size:0.8rem}
  </style>
</head>
<body>
  <div class="header">
    <a href="/">← Home</a> &nbsp; <strong>Categories</strong>
  </div>
  <div class="container">
    <h1>Browse by Category</h1>
    <p class="subtitle">Explore listings organized by category.</p>
    <div class="grid">
      <a href="#" class="card">
        <h3>Category Name</h3>
        <span class="count">X listings</span>
      </a>
    </div>
  </div>
</body>
</html>`,
  },
};

export default function CustomPagesTab({ projectId }: CustomPagesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHtml, setEditHtml] = useState("");
  const [editMeta, setEditMeta] = useState({ title: "", slug: "", url_path: "", meta_title: "", meta_description: "", is_homepage: false, status: "draft" });

  const { data: customPages = [] } = useQuery({
    queryKey: ["custom-pages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_pages")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createPage = useMutation({
    mutationFn: async (params: { title: string; slug: string; url_path: string; html_content: string; is_homepage: boolean }) => {
      const { error } = await supabase.from("custom_pages").insert({
        project_id: projectId,
        ...params,
        meta_title: params.title,
        sort_order: customPages.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pages", projectId] });
      setCreateOpen(false);
      toast({ title: "Custom page created!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updatePage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("custom_pages").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pages", projectId] });
      toast({ title: "Page updated!" });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-pages", projectId] });
      toast({ title: "Page deleted" });
    },
  });

  const startEdit = (page: any) => {
    setEditingId(page.id);
    setEditHtml(page.html_content || "");
    setEditMeta({
      title: page.title,
      slug: page.slug,
      url_path: page.url_path,
      meta_title: page.meta_title || "",
      meta_description: page.meta_description || "",
      is_homepage: page.is_homepage,
      status: page.status,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updatePage.mutate({
      id: editingId,
      updates: { html_content: editHtml, ...editMeta },
    });
    setEditingId(null);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createPage.mutate({
      title: form.get("title") as string,
      slug: (form.get("slug") as string).toLowerCase().replace(/[^a-z0-9-]/g, ""),
      url_path: form.get("url_path") as string || "/",
      html_content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${form.get("title")}</title>\n</head>\n<body>\n  <h1>${form.get("title")}</h1>\n</body>\n</html>`,
      is_homepage: false,
    });
  };

  const hasHomepage = customPages.some((p) => p.is_homepage);

  if (editingId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-xl font-semibold">{editMeta.title}</h3>
              <p className="text-xs text-muted-foreground font-mono">{editMeta.url_path}</p>
            </div>
          </div>
          <Button onClick={saveEdit} disabled={updatePage.isPending}>
            <Save className="h-4 w-4 mr-1" /> {updatePage.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input value={editMeta.title} onChange={(e) => setEditMeta({ ...editMeta, title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">URL Path</Label>
            <Input value={editMeta.url_path} onChange={(e) => setEditMeta({ ...editMeta, url_path: e.target.value })} className="font-mono text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={editMeta.status} onValueChange={(v) => setEditMeta({ ...editMeta, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Meta Title</Label>
            <Input value={editMeta.meta_title} onChange={(e) => setEditMeta({ ...editMeta, meta_title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Meta Description</Label>
            <Input value={editMeta.meta_description} onChange={(e) => setEditMeta({ ...editMeta, meta_description: e.target.value })} />
          </div>
        </div>
        <div className="border rounded-lg overflow-hidden" style={{ height: "65vh" }}>
          <Editor language="html" value={editHtml} onChange={(v) => setEditHtml(v || "")} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-semibold">Custom Pages</h3>
          <p className="text-sm text-muted-foreground">Homepage, hub pages (/listings/, /locations/) and other custom HTML pages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const hp = STARTER_TEMPLATES.homepage;
            createPage.mutate({ title: hp.title, slug: hp.slug, url_path: hp.urlPath, html_content: hp.html, is_homepage: hp.isHomepage });
          }} disabled={createPage.isPending}>
            <Sparkles className="h-4 w-4 mr-1" /> Load Sample Homepage
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Page</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Custom Page</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Page Title</Label>
                    <Input name="title" required placeholder="About Us" />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input name="slug" required placeholder="about" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Path</Label>
                    <Input name="url_path" required placeholder="/about/" defaultValue="/" />
                    <p className="text-xs text-muted-foreground">e.g., /about/, /locations/, /contact/</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createPage.isPending}>Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Starter Templates */}
      {customPages.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">No custom pages yet</h3>
              <p className="text-muted-foreground text-sm">Start with a homepage or hub page to avoid orphan pages in your directory.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(STARTER_TEMPLATES).map(([key, t]) => (
                <Card
                  key={key}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => createPage.mutate({ title: t.title, slug: t.slug, url_path: t.urlPath, html_content: t.html, is_homepage: t.isHomepage })}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {t.isHomepage && <Home className="h-3 w-3" />}
                      {t.title}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">{t.urlPath}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing custom pages */}
      {customPages.length > 0 && (
        <>
          {!hasHomepage && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-warning" />
                  <span className="text-sm">No homepage yet — create one to serve as your index page.</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const t = STARTER_TEMPLATES.homepage;
                    createPage.mutate({ title: t.title, slug: t.slug, url_path: t.urlPath, html_content: t.html, is_homepage: t.isHomepage });
                  }}
                >
                  <Home className="h-3 w-3 mr-1" /> Add Homepage
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPages.map((page) => (
              <Card key={page.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {page.is_homepage && <Home className="h-4 w-4 text-primary" />}
                        {page.title}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">{page.url_path}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={page.status === "published" ? "bg-green-100 text-green-700" : ""}>{page.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => startEdit(page)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => {
                      const w = window.open("", "_blank");
                      if (w) { w.document.write(page.html_content); w.document.close(); }
                    }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deletePage.mutate(page.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add more starter templates */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground py-2">Quick add:</span>
            {Object.entries(STARTER_TEMPLATES)
              .filter(([, t]) => !customPages.some((p) => p.slug === t.slug))
              .map(([key, t]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => createPage.mutate({ title: t.title, slug: t.slug, url_path: t.urlPath, html_content: t.html, is_homepage: t.isHomepage })}
                >
                  <Plus className="h-3 w-3 mr-1" /> {t.title}
                </Button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
