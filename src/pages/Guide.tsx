import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, FileCode, Wand2, Download, FileText, Search, Zap } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      <main className="container py-12 max-w-4xl space-y-10">
        {/* Intro */}
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">Welcome to HMW Guide 🚀</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Helpful Marketing Website lets you generate hundreds (or thousands!) of SEO-optimized pages from a simple spreadsheet.
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
                    <Badge className="h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs">{s.step}</Badge>
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
          {[
            { icon: <FileText className="h-5 w-5 text-primary" />, title: "LDP — Listing Detail Page", sub: "One page per data row (e.g., one page per hotel, per business, per job)", content: (<><p className="text-sm text-muted-foreground">This is the most common page type. Each row in your data creates a unique detail page.</p><div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1"><p className="text-primary">/hotel/hilton-tokyo/ → Shows all details for Hilton Tokyo</p><p className="text-primary">/hotel/marriott-paris/ → Shows all details for Marriott Paris</p></div></>) },
            { icon: <Search className="h-5 w-5 text-accent" />, title: "SRP — Search Results / Category Page", sub: "Lists multiple items that share a common attribute", content: (<><p className="text-sm text-muted-foreground">Category/SRP pages group your listings. Use <strong>Combo mode</strong> with filters.</p><div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1"><p className="text-primary">/category/5-star-hotels/ → Lists all 5-star hotels</p><p className="text-primary">/location/tokyo/ → Lists all hotels in Tokyo</p></div></>) },
            { icon: <Zap className="h-5 w-5 text-warning" />, title: "pSEO — Best X in Y", sub: "Pattern-based pages like 'Best Restaurants in New York'", content: (<><p className="text-sm text-muted-foreground">pSEO pages target long-tail keywords by combining category + location. Use <strong>Combo mode</strong>.</p><div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1"><p className="text-primary">/best-sushi-in-tokyo/ → category="Sushi" × location="Tokyo"</p></div></>) },
          ].map((pt) => (
            <Card key={pt.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">{pt.icon} {pt.title}</CardTitle>
                <CardDescription>{pt.sub}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">{pt.content}</CardContent>
            </Card>
          ))}
        </section>

        {/* Filtering */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Using Filters & Comma Values</h2>
          <Card>
            <CardContent className="py-6 space-y-3">
              <p className="text-sm">Filters let you generate pages for only specific data rows. Supports comma-separated values for OR matching.</p>
              <div className="space-y-2">
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-semibold">Match Scope Options:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                    <li><strong>Any variable</strong> — Matches if the value appears in ANY column</li>
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
              <p className="text-sm">Use the <strong>Custom Pages</strong> tab to create hub pages that prevent orphan pages:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li><strong>Homepage</strong> (/) — Your site's main entry point</li>
                <li><strong>/listings/</strong> — Hub for listing detail pages</li>
                <li><strong>/categories/</strong> — Hub for category pages</li>
                <li>About, Contact, Privacy, etc.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Generation Modes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Generation Modes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Normal", sub: "1 row = 1 page", desc: "Standard mode. Each data row generates exactly one page." },
              { title: "Split", sub: "Comma values → separate pages", desc: "A column with 'Cheap,Luxury' generates 2 pages." },
              { title: "Combo", sub: "Col A × Col B = pages", desc: "Generates every unique combination of two columns." },
            ].map((m) => (
              <Card key={m.title}>
                <CardHeader><CardTitle className="text-base">{m.title}</CardTitle><CardDescription>{m.sub}</CardDescription></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{m.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center py-8">
          <Button size="lg" className="gap-2" onClick={() => navigate("/dashboard")}>
            Start Building <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
