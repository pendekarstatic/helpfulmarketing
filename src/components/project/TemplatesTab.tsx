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
import { Plus, FileCode, Trash2, Edit, Copy, BookTemplate, Sparkles } from "lucide-react";
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

// Built-in template HTML for each type
const BUILTIN_TEMPLATES: Record<string, { name: string; type: TemplateType; html: string; urlPattern: string; schemaType: string }> = {
  business_directory: {
    name: "Business Directory",
    type: "listing_detail",
    schemaType: "LocalBusiness",
    urlPattern: "/listing/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b}
    .header{background:#1e293b;color:white;padding:1rem 2rem}
    .container{max-width:900px;margin:0 auto;padding:2rem}
    .card{background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
    .card-img{width:100%;height:300px;object-fit:cover}
    .card-body{padding:2rem}
    h1{font-size:1.75rem;margin-bottom:0.5rem}
    .meta{display:flex;gap:1rem;color:#64748b;font-size:0.875rem;margin-bottom:1rem;flex-wrap:wrap}
    .badge{background:#e0e7ff;color:#4338ca;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:600}
    .rating{color:#f59e0b;font-weight:700}
    .description{line-height:1.8;color:#475569;margin-top:1rem}
    .footer{text-align:center;padding:2rem;color:#94a3b8;font-size:0.8rem}
  </style>
</head>
<body>
  <div class="header"><strong>{{site_name}}</strong></div>
  <div class="container">
    <div class="card">
      <img class="card-img" src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'" />
      <div class="card-body">
        <h1>{{title}}</h1>
        <div class="meta">
          <span class="badge">{{category}}</span>
          <span>📍 {{location}}</span>
          <span class="rating">⭐ {{rating}}</span>
          <span>💰 {{price}}</span>
        </div>
        <div class="description">{{description}}</div>
      </div>
    </div>
  </div>
  <div class="footer">© {{site_name}}</div>
</body>
</html>`,
  },
  saas_directory: {
    name: "SaaS / Tool Directory",
    type: "listing_detail",
    schemaType: "SoftwareApplication",
    urlPattern: "/tool/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Tools</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#fafafa;color:#18181b}
    .nav{border-bottom:1px solid #e4e4e7;padding:1rem 2rem;display:flex;align-items:center;gap:1rem}
    .container{max-width:800px;margin:2rem auto;padding:0 2rem}
    .hero{display:flex;gap:2rem;align-items:flex-start;margin-bottom:2rem}
    .logo{width:80px;height:80px;border-radius:16px;object-fit:cover;border:1px solid #e4e4e7}
    h1{font-size:1.5rem}
    .tags{display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap}
    .tag{background:#f4f4f5;border:1px solid #e4e4e7;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.75rem;color:#52525b}
    .pricing{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:1.5rem;border-radius:12px;margin:1.5rem 0;font-size:1.25rem;font-weight:700;text-align:center}
    .desc{line-height:1.8;color:#3f3f46}
  </style>
</head>
<body>
  <div class="nav"><strong>Tools Directory</strong></div>
  <div class="container">
    <div class="hero">
      <img class="logo" src="{{image}}" alt="{{title}}" onerror="this.style.background='#e4e4e7'" />
      <div>
        <h1>{{title}}</h1>
        <div class="tags">
          <span class="tag">{{category}}</span>
          <span class="tag">⭐ {{rating}}</span>
        </div>
      </div>
    </div>
    <div class="pricing">{{price}}</div>
    <div class="desc">{{description}}</div>
  </div>
</body>
</html>`,
  },
  job_board: {
    name: "Job Board",
    type: "listing_detail",
    schemaType: "JobPosting",
    urlPattern: "/job/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} at {{company}} — Jobs</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#fefce8;color:#1c1917}
    .container{max-width:700px;margin:3rem auto;padding:0 2rem}
    .card{background:white;border-radius:12px;padding:2rem;border:1px solid #e7e5e4}
    h1{font-size:1.5rem;margin-bottom:0.5rem}
    .company{font-size:1.1rem;color:#a16207;font-weight:600;margin-bottom:1rem}
    .pills{display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
    .pill{background:#fef3c7;color:#92400e;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:500}
    .desc{line-height:1.8;color:#44403c}
    .apply{display:inline-block;margin-top:1.5rem;background:#ca8a04;color:white;padding:0.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:600}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>{{title}}</h1>
      <div class="company">{{company}}</div>
      <div class="pills">
        <span class="pill">📍 {{location}}</span>
        <span class="pill">{{category}}</span>
        <span class="pill">{{price}}</span>
      </div>
      <div class="desc">{{description}}</div>
      <a href="{{url}}" class="apply">Apply Now →</a>
    </div>
  </div>
</body>
</html>`,
  },
  best_x_in_y: {
    name: "Best X in Y (pSEO)",
    type: "best_x_in_y",
    schemaType: "Article",
    urlPattern: "/best-{{category}}-in-{{location}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Best {{category}} in {{location}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#fff;color:#1a1a2e}
    .hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:4rem 2rem;text-align:center}
    .hero h1{font-size:2.5rem;margin-bottom:0.5rem}
    .hero p{opacity:0.9;font-size:1.1rem}
    .container{max-width:800px;margin:0 auto;padding:2rem}
    .item{background:#f8fafc;border-radius:12px;padding:1.5rem;margin-bottom:1rem;display:flex;gap:1.5rem;border:1px solid #e2e8f0}
    .item img{width:120px;height:120px;border-radius:8px;object-fit:cover}
    .item h3{font-size:1.1rem;margin-bottom:0.25rem}
    .item .meta{color:#64748b;font-size:0.8rem;margin-bottom:0.5rem}
    .item .desc{font-size:0.9rem;color:#475569;line-height:1.6}
    .rating{color:#f59e0b;font-weight:700}
  </style>
</head>
<body>
  <div class="hero">
    <h1>Best {{category}} in {{location}}</h1>
    <p>Top-rated {{category}} options reviewed and compared</p>
  </div>
  <div class="container">
    <div class="item">
      <img src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400'" />
      <div>
        <h3>{{title}}</h3>
        <div class="meta"><span class="rating">⭐ {{rating}}</span> · {{price}} · {{location}}</div>
        <div class="desc">{{description}}</div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  glossary: {
    name: "Glossary / Wiki",
    type: "glossary",
    schemaType: "Article",
    urlPattern: "/glossary/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Glossary</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Georgia,serif;background:#fffbeb;color:#292524}
    .container{max-width:680px;margin:3rem auto;padding:0 2rem}
    .back{color:#a16207;text-decoration:none;font-size:0.875rem;display:inline-block;margin-bottom:2rem}
    h1{font-size:2rem;border-bottom:2px solid #fbbf24;padding-bottom:0.75rem;margin-bottom:1.5rem}
    .category{background:#fef3c7;color:#92400e;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.75rem;font-weight:600;display:inline-block;margin-bottom:1rem}
    .content{line-height:2;font-size:1.05rem;color:#44403c}
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back">← Back to Glossary</a>
    <h1>{{title}}</h1>
    <span class="category">{{category}}</span>
    <div class="content">{{description}}</div>
  </div>
</body>
</html>`,
  },
  category_hub: {
    name: "Category Hub Page",
    type: "category_page",
    schemaType: "CollectionPage",
    urlPattern: "/category/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Category</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a}
    .hero{background:#0f172a;color:white;padding:3rem 2rem;text-align:center}
    .hero h1{font-size:2rem}
    .hero p{color:#94a3b8;margin-top:0.5rem}
    .container{max-width:1000px;margin:0 auto;padding:2rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .card{background:white;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;transition:transform 0.2s}
    .card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,0.08)}
    .card img{width:100%;height:180px;object-fit:cover}
    .card-body{padding:1.25rem}
    .card h3{font-size:1rem;margin-bottom:0.25rem}
    .card .meta{color:#64748b;font-size:0.8rem}
  </style>
</head>
<body>
  <div class="hero">
    <h1>{{title}}</h1>
    <p>{{description}}</p>
  </div>
  <div class="container">
    <div class="grid">
      <div class="card">
        <img src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'" />
        <div class="card-body">
          <h3>{{title}}</h3>
          <div class="meta">{{location}} · ⭐ {{rating}}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
};

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;line-height:1.6;color:#1a1a2e;background:#fafafa}
    .container{max-width:800px;margin:0 auto;padding:2rem}
    .card{background:white;border-radius:12px;padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    h1{font-size:2rem;margin-bottom:1rem}
    .meta{color:#666;font-size:0.875rem;margin-bottom:1rem}
    .description{font-size:1rem;line-height:1.8}
    img{max-width:100%;border-radius:8px;margin:1rem 0}
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
  const [libraryOpen, setLibraryOpen] = useState(false);
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

  // Get available data for variable info and page count
  const { data: dataSources = [] } = useQuery({
    queryKey: ["data-sources", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("cached_data")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });


  // Calculate total available rows for page generation
  const totalDataRows = dataSources.reduce((sum, ds) => {
    if (Array.isArray(ds.cached_data)) return sum + (ds.cached_data as any[]).length;
    return sum;
  }, 0);

  // Get all available variables from data
  const allVariables: string[] = [];
  for (const ds of dataSources) {
    if (Array.isArray(ds.cached_data) && (ds.cached_data as any[]).length > 0) {
      const keys = Object.keys((ds.cached_data as any[])[0]);
      for (const k of keys) {
        if (!allVariables.includes(k)) allVariables.push(k);
      }
    }
  }

  const createTemplate = useMutation({
    mutationFn: async ({ name, template_type, html, urlPattern, schemaType }: { name: string; template_type: TemplateType; html?: string; urlPattern?: string; schemaType?: string }) => {
      const { error } = await supabase.from("templates").insert({
        project_id: projectId,
        user_id: user!.id,
        name,
        template_type,
        html_content: html || DEFAULT_HTML,
        url_pattern: urlPattern || "/{{slug}}",
        meta_title_pattern: "{{title}} — {{site_name}}",
        meta_description_pattern: "{{description}}",
        schema_type: schemaType || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      setCreateOpen(false);
      setLibraryOpen(false);
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
    return <TemplateEditor template={editingTemplate} projectId={projectId} onBack={() => setEditingId(null)} />;
  }

  const relevantBuiltins = Object.entries(BUILTIN_TEMPLATES).filter(([key]) => {
    if (projectMode === "pseo") return ["best_x_in_y", "glossary", "category_hub"].includes(key);
    if (projectMode === "directory") return ["business_directory", "saas_directory", "job_board", "category_hub"].includes(key);
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-semibold">Templates</h3>
          <p className="text-sm text-muted-foreground">
            HTML templates with {"{{variable}}"} injection · <strong>{totalDataRows} data rows</strong> available for page generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
            <BookTemplate className="h-4 w-4 mr-1" /> Library
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Custom</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Custom Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input name="name" required placeholder="My Template" />
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
      </div>

      {/* Available Variables */}
      {allVariables.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Available Variables ({allVariables.length})</CardTitle>
            <CardDescription className="text-xs">These variables from your data sources can be used in templates as {"{{variable}}"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[7.5rem] overflow-auto">
              <div className="flex flex-wrap gap-1.5">
                {allVariables.map((v) => (
                  <code key={v} className="text-xs bg-muted px-2 py-1 rounded font-mono">{`{{${v}}}`}</code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Template Library Dialog */}
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Template Library</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Pre-built templates for {projectMode} mode. Click to add to your project.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            {relevantBuiltins.map(([key, t]) => (
              <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => createTemplate.mutate({ name: t.name, template_type: t.type, html: t.html, urlPattern: t.urlPattern, schemaType: t.schemaType })}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <CardDescription className="text-xs">{TEMPLATE_LABELS[t.type]} · {t.schemaType}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="secondary" className="text-xs">{t.urlPattern}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template cards */}
      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No templates yet</h3>
            <p className="text-muted-foreground mb-4">Use the Library for pre-built templates or create a custom one. AI Generate is available inside the template editor.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLibraryOpen(true)}>
                <BookTemplate className="h-4 w-4 mr-1" /> Browse Library
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Custom
              </Button>
            </div>
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
                    <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{TEMPLATE_LABELS[t.template_type]}</Badge>
                      {t.schema_type && <Badge variant="outline" className="text-xs">{t.schema_type}</Badge>}
                      <span className="text-xs">v{t.version}</span>
                    </CardDescription>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Can generate <strong>{totalDataRows}</strong> pages from current data
                </p>
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