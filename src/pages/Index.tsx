import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Globe, Layers, Zap, ArrowRight, Code, Download, Search } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold tracking-tight">PageForge</h1>
          <Button onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            {user ? "Dashboard" : "Get Started"} <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32 text-center">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Build SEO sites from{" "}
            <span className="text-primary">spreadsheets</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect Google Sheets, design with custom HTML templates, and export fully optimized directory & pSEO pages — no code required.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              Start Building <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Layers className="h-6 w-6" />}
            title="Directory Builder"
            desc="Listing pages, category hubs, location pages, and filterable search — all auto-generated."
          />
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="pSEO at Scale"
            desc="Generate 'Best X in Y', comparison, and location-modifier pages from your data."
          />
          <FeatureCard
            icon={<Code className="h-6 w-6" />}
            title="Custom HTML"
            desc="Full Monaco editor with {{variable}} injection. Complete control over every page."
          />
          <FeatureCard
            icon={<Globe className="h-6 w-6" />}
            title="SEO Engine"
            desc="Auto meta tags, JSON-LD, sitemaps, internal linking, and SERP previews."
          />
          <FeatureCard
            icon={<Download className="h-6 w-6" />}
            title="Static Export"
            desc="Download a ZIP with all HTML pages, CSS, and sitemap.xml. Host anywhere."
          />
          <FeatureCard
            icon={<Search className="h-6 w-6" />}
            title="Search & Filter"
            desc="Built-in search, category filters, and sort options for generated directories."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PageForge. Built for SEO builders.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-3 hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
