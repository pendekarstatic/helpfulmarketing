import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Database, FileCode, Wand2, Download, Globe, Layers, Zap, Home, FileText, Filter, Search } from "lucide-react";

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">PageForge Guide</h1>
          </div>
          <Button onClick={() => navigate("/dashboard")}>
            Dashboard <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-4xl space-y-10">
        {/* Intro */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Welcome to PageForge 🚀</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            PageForge lets you generate hundreds (or thousands!) of SEO-optimized pages from a simple spreadsheet. 
            Whether you're building a directory, running pSEO campaigns, or creating a hybrid site — this guide will walk you through everything.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: <Database className="h-6 w-6" />, step: "1", title: "Add Data", desc: "Upload CSV, connect Google Sheets, or enter data manually." },
              { icon: <FileCode className="h-6 w-6" />, step: "2", title: "Design Template", desc: "Create HTML templates with {{variable}} placeholders." },
              { icon: <Wand2 className="h-6 w-6" />, step: "3", title: "Generate Pages", desc: "Each data row becomes a unique, SEO-ready page." },
              { icon: <Download className="h-6 w-6" />, step: "4", title: "Export & Deploy", desc: "Download ZIP with HTML, sitemaps, robots.txt." },
            ].map((s) => (
              <Card key={s.step}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs">{s.step}</Badge>
                    {s.icon}
                  </div>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{s.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Page Types */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Page Types Explained</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> LDP — Listing Detail Page</CardTitle>
              <CardDescription>One page per data row (e.g., one page per hotel, per business, per job)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">This is the most common page type. Each row in your data creates a unique detail page. Example:</p>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                <p className="text-primary">/hotel/hilton-tokyo/ → Shows all details for Hilton Tokyo</p>
                <p className="text-primary">/hotel/marriott-paris/ → Shows all details for Marriott Paris</p>
              </div>
              <p className="text-sm text-muted-foreground">Template type: <strong>Listing Detail</strong>. Use the "Hotel LDP" or "Business Directory" from the Library.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-accent" /> SRP — Search Results / Category Page</CardTitle>
              <CardDescription>Lists multiple items that share a common attribute (e.g., all hotels in Tokyo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Category/SRP pages group your listings. They help with internal linking and SEO. Example:</p>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                <p className="text-primary">/category/5-star-hotels/ → Lists all 5-star hotels</p>
                <p className="text-primary">/location/tokyo/ → Lists all hotels in Tokyo</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Use <strong>Combo mode</strong> to generate category × location pages (e.g., "5-star hotels in Tokyo").
                Use <strong>Filters</strong> with comma-separated values (e.g., "Tokyo,Osaka") to match specific data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-warning" /> pSEO — Best X in Y</CardTitle>
              <CardDescription>Pattern-based pages like "Best Restaurants in New York"</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">pSEO pages target long-tail keywords by combining category + location. Example:</p>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1">
                <p className="text-primary">/best-sushi-in-tokyo/ → Generated from category="Sushi" × location="Tokyo"</p>
                <p className="text-primary">/best-italian-in-paris/ → Generated from category="Italian" × location="Paris"</p>
              </div>
              <p className="text-sm text-muted-foreground">Template type: <strong>Best X in Y</strong>. Use <strong>Combo mode</strong> with two columns.</p>
            </CardContent>
          </Card>
        </section>

        {/* Filtering */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Using Filters & Comma Values</h2>
          <Card>
            <CardContent className="py-6 space-y-3">
              <p className="text-sm">Filters let you generate pages for only specific data rows. Supports comma-separated values for OR matching.</p>
              <div className="space-y-2">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-semibold">Example: Real Estate Directory</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filter: variable = "location", operator = "contains", value = "Pantai Indah Kapuk,PIK"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Match scope: "Any variable" — matches rows where ANY column contains "Pantai Indah Kapuk" OR "PIK"
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-semibold">Match Scope Options:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                    <li><strong>Any variable</strong> — Matches if the value appears in ANY column of the row</li>
                    <li><strong>All variables</strong> — Matches if the value appears in EVERY column</li>
                    <li><strong>This variable only</strong> — Matches only in the selected column</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Custom Pages */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Custom Pages (Hub Pages)</h2>
          <Card>
            <CardContent className="py-6 space-y-3">
              <p className="text-sm">
                Use the <strong>Custom Pages</strong> tab to create hub pages that prevent orphan pages. These are manually created HTML pages for:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Homepage</strong> (/) — Your site's main entry point</li>
                <li><strong>/listings/</strong> — Hub for all listing detail pages</li>
                <li><strong>/locations/</strong> — Hub for location-based pages</li>
                <li><strong>/categories/</strong> — Hub for category pages</li>
                <li>Any other static page you need (About, Contact, etc.)</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                These pages are included in the export ZIP alongside your generated pages.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Generation Modes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Generation Modes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Normal</CardTitle>
                <CardDescription>1 row = 1 page</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Standard mode. Each data row generates exactly one page.</p></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Split</CardTitle>
                <CardDescription>Comma values → separate pages</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">A column with "Cheap,Luxury" generates 2 pages — one for each value.</p></CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Combo</CardTitle>
                <CardDescription>Col A × Col B = pages</CardDescription>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Generates every unique combination (cartesian product) of two columns.</p></CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Start Building <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </section>
      </main>
    </div>
  );
}
