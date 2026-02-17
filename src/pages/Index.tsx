import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Code, Download, Search, BarChart3, FileText, Sparkles } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container flex items-center justify-between h-14">
          <span className="font-mono text-sm font-bold tracking-widest uppercase text-primary">HMW</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/guide")}>
              Docs
            </Button>
            <div className="relative group">
              <Button variant="ghost" size="sm">
                Tools ▾
              </Button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => navigate("/tools/spintax")}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">Spintax Testing</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Test & preview nested spintax patterns</p>
                  </button>
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              {user ? "Open App" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero — asymmetric two-column */}
      <section className="container grid lg:grid-cols-5 gap-12 py-20 lg:py-28">
        <div className="lg:col-span-3 space-y-8">
          <Badge variant="secondary" className="text-xs font-mono tracking-wider">
            pSEO · Directories · Static Export
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Turn any spreadsheet into an
            <span className="block text-primary mt-1">SEO-powered website</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Connect Google Sheets or upload CSV. Design HTML templates with variables. 
            Generate hundreds of optimized pages and export as static HTML — zero code needed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="gap-2" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/guide")}>
              Read the Guide
            </Button>
          </div>
        </div>
        <div className="lg:col-span-2 hidden lg:flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-sm">
            {/* Decorative abstract grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2">
              {[
                "bg-primary/20", "bg-primary/10", "bg-primary/5",
                "bg-primary/5", "bg-primary/30", "bg-primary/10",
                "bg-primary/15", "bg-primary/5", "bg-primary/20",
              ].map((bg, i) => (
                <div key={i} className={`${bg} rounded-xl flex items-center justify-center`}>
                  {i === 1 && <Database className="h-6 w-6 text-primary/60" />}
                  {i === 4 && <Sparkles className="h-8 w-8 text-primary" />}
                  {i === 7 && <FileText className="h-6 w-6 text-primary/60" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow strip */}
      <section className="border-y bg-muted/30">
        <div className="container py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
            {[
              { num: "01", icon: <Database className="h-5 w-5" />, label: "Add Data", sub: "CSV, Google Sheets, or manual entry" },
              { num: "02", icon: <Code className="h-5 w-5" />, label: "Design Templates", sub: "HTML + {{variables}} in Monaco Editor" },
              { num: "03", icon: <BarChart3 className="h-5 w-5" />, label: "Generate Pages", sub: "Normal, Split, or Combo modes" },
              { num: "04", icon: <Download className="h-5 w-5" />, label: "Export & Deploy", sub: "ZIP with HTML, sitemaps, robots.txt" },
            ].map((step) => (
              <div key={step.num} className="bg-background p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{step.num}</span>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-semibold">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities — stacked cards */}
      <section className="container py-20 space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need for programmatic SEO</h2>
          <p className="text-muted-foreground mt-2">From data ingestion to static export — one workflow, no dependencies.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: <Search className="h-5 w-5" />, title: "SEO Engine", desc: "Auto meta tags, Open Graph, JSON-LD structured data, canonical URLs, and XML sitemaps with 50K URL limit." },
            { icon: <FileText className="h-5 w-5" />, title: "Page Types", desc: "Listing Detail Pages, Search Result Pages, Category Hubs, Best-X-in-Y, Comparisons, and Glossary pages." },
            { icon: <Code className="h-5 w-5" />, title: "Full HTML Control", desc: "Monaco editor with syntax highlighting, variable injection, live preview, and AI-assisted template generation." },
            { icon: <Download className="h-5 w-5" />, title: "Static Export", desc: "Download a production-ready ZIP with all HTML, shared CSS/JS assets, sitemaps, and robots.txt. Host anywhere." },
          ].map((item) => (
            <div key={item.title} className="group rounded-xl border bg-card p-6 space-y-3 hover:border-primary/30 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {item.icon}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Helpful Marketing Website</span>
          <span className="font-mono">Built for SEO builders</span>
        </div>
      </footer>
    </div>
  );
}
