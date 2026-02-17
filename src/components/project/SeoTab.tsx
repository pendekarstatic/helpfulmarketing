import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Globe, Link2, List } from "lucide-react";

interface SeoTabProps {
  projectId: string;
  project: any;
}

export default function SeoTab({ projectId, project }: SeoTabProps) {
  const { data: pages = [] } = useQuery({
    queryKey: ["pages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("project_id", projectId)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const publishedPages = pages.filter((p) => p.status === "published");
  const draftPages = pages.filter((p) => p.status === "draft");
  const pagesWithMeta = pages.filter((p) => p.meta_title && p.meta_description);
  const pagesWithoutMeta = pages.filter((p) => !p.meta_title || !p.meta_description);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">SEO Overview</h3>
        <p className="text-sm text-muted-foreground">Monitor SEO health across all your pages</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{pages.length}</div>
            <p className="text-sm text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-success">{publishedPages.length}</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-warning">{draftPages.length}</div>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{pagesWithMeta.length}</div>
            <p className="text-sm text-muted-foreground">With Meta Tags</p>
          </CardContent>
        </Card>
      </div>

      {/* SERP Preview */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" /> SERP Preview
            </CardTitle>
            <CardDescription>How your pages appear in Google search results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pages.slice(0, 5).map((page) => (
              <div key={page.id} className="space-y-1">
                <div className="text-sm text-primary hover:underline cursor-pointer truncate">
                  {page.meta_title || page.title} — {project.site_name || project.name}
                </div>
                <div className="text-xs text-success truncate">
                  {project.slug || "example.com"}{page.url_path || `/${page.slug}`}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {page.meta_description || "No meta description set."}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Issues */}
      {pagesWithoutMeta.length > 0 && (
        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <FileText className="h-4 w-4" /> Missing Meta Tags
            </CardTitle>
            <CardDescription>{pagesWithoutMeta.length} pages are missing meta title or description</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {pagesWithoutMeta.slice(0, 10).map((p) => (
                <div key={p.id} className="text-sm flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {!p.meta_title ? "No title" : "No description"}
                  </Badge>
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sitemap info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <List className="h-4 w-4" /> Sitemap
          </CardTitle>
          <CardDescription>
            {publishedPages.length} URLs will be included in the XML sitemap. Export from the Export tab.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
