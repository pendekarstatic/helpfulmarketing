import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Globe, Code } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ExportTabProps {
  projectId: string;
  project: any;
}

export default function ExportTab({ projectId, project }: ExportTabProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const { data: pages = [] } = useQuery({
    queryKey: ["pages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  const publishedPages = pages.filter((p) => p.status === "published");
  const allPages = pages;

  const exportHtmlZip = async () => {
    setExporting("html");
    try {
      const zip = new JSZip();
      const pagesToExport = allPages.filter((p) => p.generated_html);

      if (pagesToExport.length === 0) {
        toast({ title: "No pages to export", description: "Generate pages first.", variant: "destructive" });
        return;
      }

      // Add each page as HTML file
      for (const page of pagesToExport) {
        const path = (page.url_path || `/${page.slug}`).replace(/^\//, "");
        zip.file(`${path}/index.html`, page.generated_html || "");
      }

      // Generate index.html listing
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.site_name || project.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #fafafa; color: #1a1a2e; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    .links { display: flex; flex-direction: column; gap: 0.5rem; }
    a { color: #5b4fe0; text-decoration: none; padding: 0.75rem 1rem; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
    a:hover { background: #f5f3ff; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${project.site_name || project.name}</h1>
    <div class="links">
      ${pagesToExport.map((p) => `<a href="./${(p.url_path || `/${p.slug}`).replace(/^\//, "")}/index.html">${p.title}</a>`).join("\n      ")}
    </div>
  </div>
</body>
</html>`;
      zip.file("index.html", indexHtml);

      // Generate sitemap
      const domain = project.slug ? `https://${project.slug}.com` : "https://example.com";
      const sitemap = generateSitemap(pagesToExport, domain);
      zip.file("sitemap.xml", sitemap);

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${project.slug || "export"}-pages.zip`);
      toast({ title: "Export complete!", description: `${pagesToExport.length} pages exported.` });
    } finally {
      setExporting(null);
    }
  };

  const exportSitemap = () => {
    setExporting("sitemap");
    const domain = project.slug ? `https://${project.slug}.com` : "https://example.com";
    const pagesToExport = publishedPages.length > 0 ? publishedPages : allPages;
    const sitemap = generateSitemap(pagesToExport, domain);
    const blob = new Blob([sitemap], { type: "application/xml" });
    saveAs(blob, "sitemap.xml");
    toast({ title: "Sitemap exported!" });
    setExporting(null);
  };

  const exportJson = () => {
    setExporting("json");
    const data = allPages.map((p) => ({
      title: p.title,
      slug: p.slug,
      url_path: p.url_path,
      status: p.status,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
      data: p.data,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    saveAs(blob, `${project.slug || "export"}-data.json`);
    toast({ title: "JSON exported!" });
    setExporting(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Export</h3>
        <p className="text-sm text-muted-foreground">Download your generated pages and sitemaps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Code className="h-6 w-6" />
            </div>
            <CardTitle className="text-base">Static HTML Package</CardTitle>
            <CardDescription>ZIP file with all HTML pages, index, and sitemap</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={exportHtmlZip} disabled={exporting === "html"}>
              <Download className="h-4 w-4 mr-1" /> {exporting === "html" ? "Exporting..." : "Download ZIP"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{allPages.length} pages · Ready to host anywhere</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <CardTitle className="text-base">XML Sitemap</CardTitle>
            <CardDescription>Auto-generated sitemap.xml for search engines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={exportSitemap} disabled={exporting === "sitemap"}>
              <Download className="h-4 w-4 mr-1" /> Download Sitemap
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{publishedPages.length || allPages.length} URLs included</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning mb-2">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-base">JSON Data Export</CardTitle>
            <CardDescription>All page data as structured JSON</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={exportJson} disabled={exporting === "json"}>
              <Download className="h-4 w-4 mr-1" /> Download JSON
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{allPages.length} records</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateSitemap(pages: any[], domain: string): string {
  const urls = pages.map((p) => {
    const loc = `${domain}${p.url_path || `/${p.slug}`}`;
    const lastmod = new Date(p.updated_at).toISOString().split("T")[0];
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}
