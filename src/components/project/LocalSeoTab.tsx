import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Search, Globe, Wand2, Eye, Trash2, Save, ExternalLink, List, FileText, RefreshCw } from "lucide-react";
import { spinText } from "@/lib/spintax";
import type { Json } from "@/integrations/supabase/types";

interface LocalSeoTabProps {
  projectId: string;
  project: any;
}

// Shared CSS
const LOCAL_SEO_STYLES = `
  :root{--c-primary:#1a365d;--c-accent:#e67e22;--c-bg:#f7f8fc;--c-card:#fff;--c-text:#2d3748;--c-light:#718096;--c-border:#e2e8f0;--radius:12px}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,-apple-system,sans-serif;background:var(--c-bg);color:var(--c-text);line-height:1.6}
  a{text-decoration:none;color:inherit}
  .nav{background:var(--c-primary);padding:0 2rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
  .nav-brand{color:#fff;font-weight:800;font-size:1.15rem;text-decoration:none}
  .nav-links{display:flex;gap:1.5rem}
  .nav-links a{color:rgba(255,255,255,.8);font-size:.875rem;font-weight:500;text-decoration:none}
  .nav-links a:hover{color:#fff}
  .container{max-width:900px;margin:0 auto;padding:2rem 1.5rem}
  h1{font-size:2rem;font-weight:800;color:var(--c-primary);margin-bottom:1rem}
  h2{font-size:1.35rem;font-weight:700;color:var(--c-primary);margin:2rem 0 .75rem}
  h3{font-size:1.1rem;font-weight:600;color:var(--c-primary);margin:1.5rem 0 .5rem}
  p{color:#4a5568;margin-bottom:1rem;line-height:1.8}
  ul{margin:0 0 1rem 1.5rem;color:#4a5568}
  li{margin-bottom:.4rem}
  .cta{display:inline-block;background:var(--c-accent);color:#fff;padding:.75rem 2rem;border-radius:8px;font-weight:700;text-decoration:none;margin-top:1rem}
  .cta:hover{opacity:.9}
  .breadcrumb{font-size:.8rem;color:var(--c-light);margin-bottom:1.5rem}
  .breadcrumb a{color:var(--c-accent)}
  .toc{background:var(--c-card);border:1px solid var(--c-border);border-radius:var(--radius);padding:1.5rem;margin-bottom:2rem}
  .toc h4{font-size:.9rem;font-weight:700;color:var(--c-primary);margin-bottom:.75rem}
  .toc ol,.toc ul{margin:0 0 0 1.25rem}
  .toc li{margin-bottom:.35rem}
  .toc a{color:var(--c-accent);font-size:.85rem}
  .footer{background:var(--c-primary);color:rgba(255,255,255,.7);padding:2rem;text-align:center;margin-top:3rem;font-size:.8rem}
`;

const DEFAULT_LOCAL_SEO_HTML = `<h2>Professional [search_term] in [location]</h2>
<p>Find a [search_term] in [location]. We offer top-quality services to meet your needs. Our professional team is dedicated to providing the best experience for every client.</p>

<h2>Why Choose Our [search_terms] in [location]?</h2>
<p>Our [search_terms] in [location] are highly rated and trusted by the local community. We combine expertise with personalized service.</p>
<ul>
  <li>Experienced and certified professionals</li>
  <li>Convenient [location] location</li>
  <li>Competitive pricing</li>
  <li>Excellent customer reviews</li>
</ul>

<h2>Our Services</h2>
<p>We provide a comprehensive range of [search_term] services in [location], including consultations, scheduled appointments, and emergency services.</p>

<h2>Book a [search_term] in [location]</h2>
<p>Ready to get started? Contact our [location] team today to schedule your appointment with a trusted [search_term].</p>
<p style="text-align:center"><a class="cta" href="#contact">Book Now</a></p>`;

export default function LocalSeoTab({ projectId, project }: LocalSeoTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Settings state
  const [pageBase, setPageBase] = useState("services");
  const [slugPattern, setSlugPattern] = useState("[search_term]-in-[location]");
  const [archiveTitle, setArchiveTitle] = useState("Archive");
  const [overviewLabel, setOverviewLabel] = useState("Overview");
  const [searchTerms, setSearchTerms] = useState("Plumber | Plumbers\nElectrician | Electricians\nHandyman");
  const [locations, setLocations] = useState("New York\nLos Angeles\nChicago\nHouston\nPhoenix\nPhiladelphia\nSan Antonio\nSan Diego\nDallas\nSan Jose");
  const [htmlContent, setHtmlContent] = useState(DEFAULT_LOCAL_SEO_HTML);
  const [seoTitle, setSeoTitle] = useState("[search_term] in [location] | Professional Services");
  const [metaDescription, setMetaDescription] = useState("Find the best [search_term] in [location]. Professional, reliable, and affordable [search_terms] near you.");
  const [enableArchive, setEnableArchive] = useState(true);
  const [excludeArchiveIndex, setExcludeArchiveIndex] = useState(true);
  const [enableToc, setEnableToc] = useState(true);
  const [tocTitle, setTocTitle] = useState("Table of Contents");
  const [tocNumbered, setTocNumbered] = useState(true);
  const [tocToggle, setTocToggle] = useState(true);
  const [tocIncludeH3, setTocIncludeH3] = useState(false);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState<{ current: number; total: number } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: pages = [] } = useQuery({
    queryKey: ["pages", projectId, "local-seo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Filter to local SEO pages
      return data.filter(p => {
        const d = p.data as any;
        return d?._local_seo === true;
      });
    },
  });

  // Parse search terms and locations
  const parsedTerms = useMemo(() => {
    return searchTerms.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const parts = line.split("|").map(s => s.trim()).filter(Boolean);
      return { singular: parts[0], plural: parts.length > 1 ? parts[1] : parts[0] + "s" };
    });
  }, [searchTerms]);

  const parsedLocations = useMemo(() => {
    return locations.split("\n").map(l => l.trim()).filter(Boolean);
  }, [locations]);

  const totalUrls = parsedTerms.length * parsedLocations.length;
  const domain = project?.custom_domain || "yourdomain.com";
  const baseUrl = `https://${domain}/${pageBase}`;

  // Generate preview URLs
  const previewUrls = useMemo(() => {
    const urls: { term: string; location: string; url: string; title: string }[] = [];
    for (const term of parsedTerms) {
      for (const loc of parsedLocations) {
        const slug = slugPattern
          .replace(/\[search_term\]/g, term.singular.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
          .replace(/\[search_terms\]/g, term.plural.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
          .replace(/\[location\]/g, loc.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        urls.push({
          term: term.singular,
          location: loc,
          url: `${baseUrl}/${slug}`,
          title: seoTitle
            .replace(/\[search_term\]/g, term.singular)
            .replace(/\[search_terms\]/g, term.plural)
            .replace(/\[location\]/g, loc),
        });
      }
    }
    return urls;
  }, [parsedTerms, parsedLocations, slugPattern, baseUrl, seoTitle]);

  // Build a single page HTML
  const buildPageHtml = (term: { singular: string; plural: string }, location: string): string => {
    let content = htmlContent;
    content = content.replace(/\[search_term\]/g, term.singular);
    content = content.replace(/\[search_terms\]/g, term.plural);
    content = content.replace(/\[location\]/g, location);

    // Process spintax
    content = spinText(content);

    const title = seoTitle
      .replace(/\[search_term\]/g, term.singular)
      .replace(/\[search_terms\]/g, term.plural)
      .replace(/\[location\]/g, location);

    const desc = metaDescription
      .replace(/\[search_term\]/g, term.singular)
      .replace(/\[search_terms\]/g, term.plural)
      .replace(/\[location\]/g, location);

    // Build TOC if enabled
    let tocHtml = "";
    if (enableToc) {
      const headingRegex = tocIncludeH3 ? /<h[23][^>]*>(.*?)<\/h[23]>/gi : /<h2[^>]*>(.*?)<\/h2>/gi;
      const headings: string[] = [];
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        headings.push(match[1].replace(/<[^>]+>/g, ""));
      }
      if (headings.length > 0) {
        const listTag = tocNumbered ? "ol" : "ul";
        tocHtml = `<div class="toc"${tocToggle ? ' id="toc-container"' : ''}>
          <h4>${tocTitle}${tocToggle ? ' <span onclick="document.getElementById(\'toc-list\').style.display=document.getElementById(\'toc-list\').style.display===\'none\'?\'block\':\'none\'" style="cursor:pointer;float:right;font-size:.8rem;color:var(--c-accent)">[toggle]</span>' : ''}</h4>
          <${listTag} id="toc-list">${headings.map((h, i) => `<li><a href="#section-${i + 1}">${h}</a></li>`).join("")}</${listTag}>
        </div>`;

        // Add IDs to headings
        let idx = 0;
        content = content.replace(/<(h[23])([^>]*)>/gi, (match, tag, attrs) => {
          idx++;
          return `<${tag}${attrs} id="section-${idx}">`;
        });
      }
    }

    // Replace [nsg-toc] shortcode
    if (content.includes("[nsg-toc]")) {
      content = content.replace(/\[nsg-toc\]/g, tocHtml);
      tocHtml = ""; // Don't add at top if manually placed
    }

    const slug = slugPattern
      .replace(/\[search_term\]/g, term.singular.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
      .replace(/\[search_terms\]/g, term.plural.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
      .replace(/\[location\]/g, location.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

    const breadcrumb = `<div class="breadcrumb"><a href="/">Home</a> › <a href="/${pageBase}/">${archiveTitle}</a> › ${term.singular} in ${location}</div>`;

    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: title,
      description: desc,
      areaServed: { "@type": "Place", name: location },
      provider: { "@type": "Organization", name: project?.site_name || "Local Business" },
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="${baseUrl}/${slug}"/>
  <script type="application/ld+json">${schemaMarkup}</script>
  <style>${LOCAL_SEO_STYLES}</style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-brand">${project?.site_name || "Local Services"}</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/${pageBase}/">${overviewLabel}</a>
      <a href="/contact/">Contact</a>
    </div>
  </nav>
  <div class="container">
    ${breadcrumb}
    <h1>${title}</h1>
    ${tocHtml}
    ${content}
  </div>
  <div class="footer">© ${new Date().getFullYear()} ${project?.site_name || "Local Services"}. All rights reserved.</div>
</body>
</html>`;
  };

  // Build archive page
  const buildArchiveHtml = (): string => {
    const groupedByTerm: Record<string, { term: string; plural: string; urls: { location: string; url: string }[] }> = {};
    for (const term of parsedTerms) {
      groupedByTerm[term.singular] = { term: term.singular, plural: term.plural, urls: [] };
      for (const loc of parsedLocations) {
        const slug = slugPattern
          .replace(/\[search_term\]/g, term.singular.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
          .replace(/\[search_terms\]/g, term.plural.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
          .replace(/\[location\]/g, loc.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
        groupedByTerm[term.singular].urls.push({ location: loc, url: `/${pageBase}/${slug}` });
      }
    }

    const sections = Object.values(groupedByTerm).map(group => `
      <h2>${group.term}</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.5rem;margin-bottom:1.5rem">
        ${group.urls.map(u => `<a href="${u.url}" style="display:block;padding:.5rem .75rem;background:var(--c-card);border:1px solid var(--c-border);border-radius:6px;font-size:.85rem;color:var(--c-primary)">${group.term} in ${u.location}</a>`).join("")}
      </div>
    `).join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${archiveTitle} — ${project?.site_name || "Local Services"}</title>
  ${excludeArchiveIndex ? '<meta name="robots" content="noindex, follow">' : ''}
  <style>${LOCAL_SEO_STYLES}</style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-brand">${project?.site_name || "Local Services"}</a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/${pageBase}/">${overviewLabel}</a>
      <a href="/contact/">Contact</a>
    </div>
  </nav>
  <div class="container">
    <h1>${archiveTitle}</h1>
    <p>${totalUrls.toLocaleString()} pages covering ${parsedTerms.length} service${parsedTerms.length > 1 ? "s" : ""} across ${parsedLocations.length} location${parsedLocations.length > 1 ? "s" : ""}.</p>
    ${sections}
  </div>
  <div class="footer">© ${new Date().getFullYear()} ${project?.site_name || "Local Services"}. All rights reserved.</div>
</body>
</html>`;
  };

  // Generate all pages
  const generateAll = useMutation({
    mutationFn: async ({ regenerate }: { regenerate?: boolean } = {}) => {
      setGenerating(true);
      setGenProgress({ current: 0, total: totalUrls + (enableArchive ? 1 : 0) });

      if (regenerate) {
        // Delete existing local SEO pages
        const { data: existing } = await supabase.from("pages").select("id, data").eq("project_id", projectId);
        const localSeoIds = (existing || []).filter(p => (p.data as any)?._local_seo === true).map(p => p.id);
        if (localSeoIds.length > 0) {
          for (let i = 0; i < localSeoIds.length; i += 50) {
            const batch = localSeoIds.slice(i, i + 50);
            await supabase.from("pages").delete().in("id", batch);
          }
        }
      }

      let inserted = 0;
      const BATCH_SIZE = 10;
      const allPages: any[] = [];

      for (const term of parsedTerms) {
        for (const loc of parsedLocations) {
          const slug = slugPattern
            .replace(/\[search_term\]/g, term.singular.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
            .replace(/\[search_terms\]/g, term.plural.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
            .replace(/\[location\]/g, loc.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

          const html = buildPageHtml(term, loc);
          const title = seoTitle
            .replace(/\[search_term\]/g, term.singular)
            .replace(/\[search_terms\]/g, term.plural)
            .replace(/\[location\]/g, loc);
          const desc = metaDescription
            .replace(/\[search_term\]/g, term.singular)
            .replace(/\[search_terms\]/g, term.plural)
            .replace(/\[location\]/g, loc);

          allPages.push({
            project_id: projectId,
            title,
            slug,
            url_path: `/${pageBase}/${slug}/`,
            status: "draft" as const,
            data: { _local_seo: true, search_term: term.singular, search_terms: term.plural, location: loc, page_base: pageBase } as unknown as Json,
            meta_title: title,
            meta_description: desc,
            generated_html: html,
            schema_markup: { "@context": "https://schema.org", "@type": "Service", name: title } as unknown as Json,
          });
        }
      }

      // Add archive page
      if (enableArchive) {
        allPages.push({
          project_id: projectId,
          title: archiveTitle,
          slug: pageBase,
          url_path: `/${pageBase}/`,
          status: "draft" as const,
          data: { _local_seo: true, _archive: true, page_base: pageBase } as unknown as Json,
          meta_title: `${archiveTitle} — ${project?.site_name || "Local Services"}`,
          meta_description: `Browse all ${totalUrls} local service pages.`,
          generated_html: buildArchiveHtml(),
          schema_markup: { "@context": "https://schema.org", "@type": "CollectionPage", name: archiveTitle } as unknown as Json,
        });
      }

      // Batch insert
      for (let i = 0; i < allPages.length; i += BATCH_SIZE) {
        const batch = allPages.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("pages").insert(batch);
        if (error) throw error;
        inserted += batch.length;
        setGenProgress({ current: inserted, total: allPages.length });
      }

      return inserted;
    },
    onSuccess: (count) => {
      setGenerating(false);
      setGenProgress(null);
      queryClient.invalidateQueries({ queryKey: ["pages", projectId, "local-seo"] });
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: `${count} Local SEO pages generated!` });
    },
    onError: (err: any) => {
      setGenerating(false);
      setGenProgress(null);
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteAllLocalSeo = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase.from("pages").select("id, data").eq("project_id", projectId);
      const ids = (existing || []).filter(p => (p.data as any)?._local_seo === true).map(p => p.id);
      for (let i = 0; i < ids.length; i += 50) {
        await supabase.from("pages").delete().in("id", ids.slice(i, i + 50));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages", projectId, "local-seo"] });
      queryClient.invalidateQueries({ queryKey: ["pages", projectId] });
      toast({ title: "All Local SEO pages deleted" });
    },
  });

  const previewSinglePage = (term: { singular: string; plural: string }, location: string) => {
    setPreviewHtml(buildPageHtml(term, location));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2"><MapPin className="h-5 w-5" /> Local SEO Generator</h3>
          <p className="text-sm text-muted-foreground">Generate SEO pages for every combination of search terms × locations</p>
        </div>
        <div className="flex gap-2">
          {pages.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => deleteAllLocalSeo.mutate()} disabled={deleteAllLocalSeo.isPending}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear All ({pages.length})
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={generating || totalUrls === 0} onClick={() => generateAll.mutate({ regenerate: true })}>
            <RefreshCw className="h-4 w-4 mr-1" /> Regenerate All
          </Button>
          <Button disabled={generating || totalUrls === 0} onClick={() => generateAll.mutate({})}>
            <Wand2 className="h-4 w-4 mr-1" /> {generating ? "Generating..." : `Generate ${totalUrls.toLocaleString()} Pages`}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {genProgress && genProgress.total > 0 && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Generating Local SEO Pages</span>
              <span className="text-muted-foreground">{genProgress.current} / {genProgress.total}</span>
            </div>
            <Progress value={(genProgress.current / genProgress.total) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground">{Math.round((genProgress.current / genProgress.total) * 100)}% complete</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-4">
          {/* Page Base & Slug */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> URL Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SEO Page Base</Label>
                <Input value={pageBase} onChange={(e) => setPageBase(e.target.value)} placeholder="services" />
                <p className="text-xs text-muted-foreground">The base path for all generated URLs.</p>
              </div>
              <div className="space-y-2">
                <Label>Slug Pattern</Label>
                <Input value={slugPattern} onChange={(e) => setSlugPattern(e.target.value)} placeholder="[search_term]-in-[location]" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">Use [search_term], [search_terms], and [location] placeholders.</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">URL Structure Preview:</p>
                <code className="text-xs text-primary break-all">{baseUrl}/{slugPattern}</code>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Archive Page Title</Label>
                  <Input value={archiveTitle} onChange={(e) => setArchiveTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Overview Label</Label>
                  <Input value={overviewLabel} onChange={(e) => setOverviewLabel(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Terms */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Search className="h-4 w-4" /> Search Terms</CardTitle>
              <CardDescription className="text-xs">One per line. Use | for singular/plural (e.g., "Plumber | Plumbers")</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="Plumber | Plumbers&#10;Electrician | Electricians"
              />
              <p className="text-xs text-muted-foreground mt-2">Lines: {parsedTerms.length} (max: 20)</p>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Locations</CardTitle>
              <CardDescription className="text-xs">One location per line</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                rows={10}
                className="font-mono text-sm"
                placeholder="New York&#10;Los Angeles&#10;Chicago"
              />
              <p className="text-xs text-muted-foreground mt-2">Lines: {parsedLocations.length} (max: 300)</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Content & Options */}
        <div className="space-y-4">
          {/* SEO Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="font-mono text-sm" placeholder="[search_term] in [location] | Site Name" />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} className="font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Archive Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Archive & Indexing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Archive Page</Label>
                <Switch checked={enableArchive} onCheckedChange={setEnableArchive} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Exclude Archive from Indexing</Label>
                <Switch checked={excludeArchiveIndex} onCheckedChange={setExcludeArchiveIndex} />
              </div>
            </CardContent>
          </Card>

          {/* TOC Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><List className="h-4 w-4" /> Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Enable Table of Contents</Label>
                <Switch checked={enableToc} onCheckedChange={setEnableToc} />
              </div>
              {enableToc && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs">TOC Title</Label>
                    <Input value={tocTitle} onChange={(e) => setTocTitle(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Numbered List</Label>
                    <Switch checked={tocNumbered} onCheckedChange={setTocNumbered} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Allow Toggle</Label>
                    <Switch checked={tocToggle} onCheckedChange={setTocToggle} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Include H3 Headings</Label>
                    <Switch checked={tocIncludeH3} onCheckedChange={setTocIncludeH3} />
                  </div>
                  <p className="text-xs text-muted-foreground">Use [nsg-toc] shortcode in content for manual placement.</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* HTML Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Page Content (HTML)</CardTitle>
              <CardDescription className="text-xs">Use [search_term], [search_terms], [location] placeholders. Spintax supported.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated URLs Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Generated URLs Overview
            <Badge variant="secondary">{totalUrls.toLocaleString()} URLs</Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            A unique URL is generated for each combination of [search_term] and [location]. First 20 shown below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previewUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add search terms and locations to see generated URLs.</p>
          ) : (
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Search Term</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewUrls.slice(0, 20).map((u, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{u.term}</TableCell>
                      <TableCell className="text-sm">{u.location}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[300px]">{u.url}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          const term = parsedTerms.find(t => t.singular === u.term);
                          if (term) previewSinglePage(term, u.location);
                        }}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewUrls.length > 20 && (
                <p className="text-xs text-muted-foreground text-center py-2">...and {previewUrls.length - 20} more URLs</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Local SEO Pages */}
      {pages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Generated Local SEO Pages ({pages.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.slice(0, 50).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm max-w-[200px] truncate">{p.title}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">{p.url_path}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pages.length > 50 && (
                <p className="text-xs text-muted-foreground text-center py-2">...and {pages.length - 50} more</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewHtml} onOpenChange={() => setPreviewHtml(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Local SEO Page Preview
              <Button variant="outline" size="sm" onClick={() => {
                const w = window.open("", "_blank");
                if (w && previewHtml) { w.document.write(previewHtml); w.document.close(); }
              }}>
                <ExternalLink className="h-3 w-3 mr-1" /> Open in New Tab
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden" style={{ height: "70vh" }}>
            <iframe title="Local SEO Preview" srcDoc={previewHtml || ""} className="w-full h-full" sandbox="allow-same-origin" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
