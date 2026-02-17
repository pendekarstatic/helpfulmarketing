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

function extractAndSplitAssets(html: string): { cleanHtml: string; css: string; js: string } {
  let css = "";
  let js = "";
  let cleanHtml = html;

  // Extract inline <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    css += match[1].trim() + "\n";
  }
  cleanHtml = cleanHtml.replace(styleRegex, "");

  // Extract inline <script> tags (not src-based)
  const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    js += match[1].trim() + "\n";
  }
  cleanHtml = cleanHtml.replace(scriptRegex, "");

  // Inject link to shared CSS and JS
  if (css) {
      cleanHtml = cleanHtml.replace("</head>", `  <link rel="stylesheet" href="/assets/styles.css">\n</head>`);
  }
  if (js) {
      cleanHtml = cleanHtml.replace("</body>", `  <script src="/assets/scripts.js"></script>\n</body>`);
  }
  return { cleanHtml, css, js };
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
  const urlFormat = project.url_format || "pretty_slash";
  const maxUrls = Math.min(project.sitemap_max_urls || 50000, 50000);
  const separateSitemaps = project.sitemap_separate ?? true;
  const splitAssets = project.split_assets ?? true;

  const getExportPath = (page: any): string => {
    const raw = (page.url_path || `/${page.slug}`).replace(/^\//, "");
    const clean = raw.replace(/\.html$/, "").replace(/\/index\.html$/, "").replace(/\/index$/, "").replace(/\/$/, "");
    switch (urlFormat) {
      case "pretty_slash":
      case "pretty_no_slash":
      case "directory":
        return `${clean}/index.html`;
      case "html":
        return `${clean}.html`;
      default:
        return `${clean}/index.html`;
    }
  };

  const getDomain = (): string => {
    if (project.custom_domain) return `https://${project.custom_domain}`;
    if (project.slug) return `https://${project.slug}.com`;
    return "https://example.com";
  };

  const exportHtmlZip = async () => {
    setExporting("html");
    try {
      const zip = new JSZip();
      const pagesToExport = allPages.filter((p) => p.generated_html);

      if (pagesToExport.length === 0) {
        toast({ title: "No pages to export", description: "Generate pages first.", variant: "destructive" });
        return;
      }

      let globalCss = "";
      let globalJs = "";

      for (const page of pagesToExport) {
        if (splitAssets) {
          const { cleanHtml, css, js } = extractAndSplitAssets(page.generated_html || "");
          zip.file(getExportPath(page), cleanHtml);
          globalCss += css;
          globalJs += js;
        } else {
          zip.file(getExportPath(page), page.generated_html || "");
        }
      }

      // Write shared CSS/JS files if split mode
      if (splitAssets) {
        if (globalCss.trim()) {
          const uniqueCss = [...new Set(globalCss.split("\n").filter(l => l.trim()))].join("\n");
          zip.file("assets/styles.css", uniqueCss);
        }
        if (globalJs.trim()) {
          const uniqueJs = [...new Set(globalJs.split("\n").filter(l => l.trim()))].join("\n");
          zip.file("assets/scripts.js", uniqueJs);
        }
      }

      // Index HTML
      const indexCssLink = splitAssets && globalCss.trim() ? `<link rel="stylesheet" href="/assets/styles.css">` : "";
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.site_name || project.name}</title>
  ${project.favicon_url ? `<link rel="icon" href="${project.favicon_url}" />` : ""}
  ${project.og_image_url ? `<meta property="og:image" content="${project.og_image_url}" />` : ""}
  ${indexCssLink}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${project.font_family || "system-ui"}, sans-serif; background: ${project.theme === "dark" ? "#1a1a2e" : "#fafafa"}; color: ${project.theme === "dark" ? "#e2e8f0" : "#1a1a2e"}; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    .links { display: flex; flex-direction: column; gap: 0.5rem; }
    a { color: ${project.primary_color || "#5b4fe0"}; text-decoration: none; padding: 0.75rem 1rem; background: ${project.theme === "dark" ? "#16213e" : "white"}; border-radius: 8px; border: 1px solid ${project.theme === "dark" ? "#2d3748" : "#e2e8f0"}; }
    a:hover { opacity: 0.85; }
  </style>
  ${project.analytics_code || ""}
</head>
<body>
  ${project.use_header_footer && project.header_content ? project.header_content : ""}
  <div class="container">
    <h1>${project.site_name || project.name}</h1>
    <div class="links">
      ${pagesToExport.map((p) => `<a href="./${getExportPath(p)}">${p.title}</a>`).join("\n      ")}
    </div>
  </div>
  ${project.use_header_footer && project.footer_content ? project.footer_content : ""}
</body>
</html>`;
      zip.file("index.html", indexHtml);

      const domain = getDomain();

      // Generate sitemaps
      if (separateSitemaps) {
        const pagesToSitemap = (publishedPages.length > 0 ? publishedPages : allPages).slice(0, maxUrls);
        const categories: Record<string, any[]> = {};
        const uncategorized: any[] = [];
        pagesToSitemap.forEach((p) => {
          const d = p.data as any;
          const cat = d?.category || d?.Category;
          if (cat) {
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(p);
          } else {
            uncategorized.push(p);
          }
        });

        const sitemapFiles: string[] = [];
        Object.entries(categories).forEach(([cat, catPages]) => {
          const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const filename = `sitemap-${catSlug}.xml`;
          zip.file(filename, generateSitemap(catPages, domain));
          sitemapFiles.push(filename);
        });

        if (uncategorized.length > 0) {
          zip.file("sitemap-pages.xml", generateSitemap(uncategorized, domain));
          sitemapFiles.push("sitemap-pages.xml");
        }

        if (sitemapFiles.length === 0) {
          zip.file("sitemap-pages.xml", generateSitemap(pagesToSitemap, domain));
          sitemapFiles.push("sitemap-pages.xml");
        }

        const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map((f) => `  <sitemap>\n    <loc>${domain}/${f}</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n  </sitemap>`).join("\n")}
</sitemapindex>`;
        zip.file("sitemap.xml", sitemapIndex);
      } else {
        const pagesToSitemap = (publishedPages.length > 0 ? publishedPages : allPages).slice(0, maxUrls);
        zip.file("sitemap.xml", generateSitemap(pagesToSitemap, domain));
      }

      const robotsTxt = project.robots_txt || `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml`;
      zip.file("robots.txt", robotsTxt);

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `${project.slug || "export"}-pages.zip`);
      toast({ title: "Export complete!", description: `${pagesToExport.length} pages exported${splitAssets ? " with shared CSS/JS" : ""}.` });
    } finally {
      setExporting(null);
    }
  };

  const exportSitemap = () => {
    setExporting("sitemap");
    const domain = getDomain();
    const pagesToExport = (publishedPages.length > 0 ? publishedPages : allPages).slice(0, maxUrls);

    if (separateSitemaps) {
      const zip = new JSZip();
      const categories: Record<string, any[]> = {};
      const uncategorized: any[] = [];
      pagesToExport.forEach((p) => {
        const d = p.data as any;
        const cat = d?.category || d?.Category;
        if (cat) {
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(p);
        } else {
          uncategorized.push(p);
        }
      });

      const sitemapFiles: string[] = [];
      Object.entries(categories).forEach(([cat, catPages]) => {
        const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const filename = `sitemap-${catSlug}.xml`;
        zip.file(filename, generateSitemap(catPages, domain));
        sitemapFiles.push(filename);
      });
      if (uncategorized.length > 0) {
        zip.file("sitemap-pages.xml", generateSitemap(uncategorized, domain));
        sitemapFiles.push("sitemap-pages.xml");
      }
      if (sitemapFiles.length === 0) {
        zip.file("sitemap-pages.xml", generateSitemap(pagesToExport, domain));
        sitemapFiles.push("sitemap-pages.xml");
      }

      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map((f) => `  <sitemap>\n    <loc>${domain}/${f}</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n  </sitemap>`).join("\n")}
</sitemapindex>`;
      zip.file("sitemap.xml", sitemapIndex);

      zip.generateAsync({ type: "blob" }).then((blob) => {
        saveAs(blob, "sitemaps.zip");
        toast({ title: "Sitemaps exported!", description: `${sitemapFiles.length + 1} sitemap files.` });
      });
    } else {
      const sitemap = generateSitemap(pagesToExport, domain);
      const blob = new Blob([sitemap], { type: "application/xml" });
      saveAs(blob, "sitemap.xml");
      toast({ title: "Sitemap exported!" });
    }
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
        <p className="text-sm text-muted-foreground">
          Download your generated pages and sitemaps
          {splitAssets && " · CSS & JS will be split into shared files"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Code className="h-6 w-6" />
            </div>
            <CardTitle className="text-base">Static HTML Package</CardTitle>
            <CardDescription>ZIP with HTML pages, index, sitemaps, and robots.txt{splitAssets ? " + shared CSS/JS" : ""}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={exportHtmlZip} disabled={exporting === "html"}>
              <Download className="h-4 w-4 mr-1" /> {exporting === "html" ? "Exporting..." : "Download ZIP"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{allPages.length} pages · {separateSitemaps ? "Separate sitemaps" : "Single sitemap"} · Max {maxUrls} URLs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <CardTitle className="text-base">XML Sitemap{separateSitemaps ? "s" : ""}</CardTitle>
            <CardDescription>{separateSitemaps ? "Sitemap index + category sitemaps" : "Single sitemap.xml"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={exportSitemap} disabled={exporting === "sitemap"}>
              <Download className="h-4 w-4 mr-1" /> Download Sitemap{separateSitemaps ? "s" : ""}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{publishedPages.length || allPages.length} URLs · Max {maxUrls}</p>
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
