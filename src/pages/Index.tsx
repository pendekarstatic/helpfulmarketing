import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Database, Code, Download, Search, BarChart3, FileText,
  Sparkles, Zap, Globe, Layers, CheckCircle, Star, Users, ChevronDown,
  MapPin, TrendingUp, Shield, Clock
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const zigzagRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero stagger
      gsap.from(".hero-animate", {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power3.out"
      });

      // Stats counter animation
      gsap.from(".stat-item", {
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1
      });

      // Features cards
      gsap.from(".feature-card", {
        scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
        y: 50, opacity: 0, duration: 0.7, stagger: 0.12
      });

      // Zigzag sections
      gsap.utils.toArray<HTMLElement>(".zigzag-section").forEach((el) => {
        gsap.from(el.querySelectorAll(".zigzag-content"), {
          scrollTrigger: { trigger: el, start: "top 80%" },
          x: -40, opacity: 0, duration: 0.7
        });
        gsap.from(el.querySelectorAll(".zigzag-visual"), {
          scrollTrigger: { trigger: el, start: "top 80%" },
          x: 40, opacity: 0, duration: 0.7, delay: 0.15
        });
      });

      // Services
      gsap.from(".service-card", {
        scrollTrigger: { trigger: servicesRef.current, start: "top 80%" },
        y: 40, opacity: 0, duration: 0.6, stagger: 0.1
      });

      // Benefits grid
      gsap.from(".benefit-card", {
        scrollTrigger: { trigger: benefitsRef.current, start: "top 80%" },
        y: 40, opacity: 0, duration: 0.5, stagger: 0.08
      });

      // How it works
      gsap.from(".step-card", {
        scrollTrigger: { trigger: howRef.current, start: "top 80%" },
        y: 40, opacity: 0, duration: 0.6, stagger: 0.12
      });

      // Final CTA
      gsap.from(".final-cta", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
        y: 30, opacity: 0, duration: 0.8
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative grid lg:grid-cols-2 gap-12 py-20 lg:py-32">
          <div className="space-y-8 flex flex-col justify-center">
            <Badge variant="secondary" className="hero-animate w-fit text-xs font-mono tracking-wider gap-1.5">
              <Sparkles className="h-3 w-3" /> Programmatic SEO Platform
            </Badge>
            <h1 className="hero-animate text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Generate 1000s of SEO pages
              <span className="block text-primary mt-2">from a spreadsheet</span>
            </h1>
            <p className="hero-animate text-lg text-muted-foreground max-w-lg leading-relaxed">
              Upload your data. Design templates. Export thousands of search-optimized static HTML pages — ready to deploy anywhere. No coding required.
            </p>
            <div className="hero-animate flex flex-wrap gap-3">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
                Start Free Today <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/guide")}>
                Read the Docs
              </Button>
            </div>
            <div className="hero-animate flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> Free to start</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> Export anytime</span>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
              <div className="relative bg-card border rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-warning" />
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="ml-2 text-muted-foreground font-mono text-xs">template.html</span>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-xs leading-relaxed space-y-1 text-muted-foreground">
                  <p><span className="text-primary">&lt;h1&gt;</span>{"{{business_name}}"}<span className="text-primary">&lt;/h1&gt;</span></p>
                  <p><span className="text-primary">&lt;p&gt;</span>Best {"{{category}}"} in {"{{city}}"}<span className="text-primary">&lt;/p&gt;</span></p>
                  <p><span className="text-primary">&lt;div</span> class="rating"<span className="text-primary">&gt;</span></p>
                  <p>  ⭐ {"{{rating}}"}/5 · {"{{reviews}}"} reviews</p>
                  <p><span className="text-primary">&lt;/div&gt;</span></p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>247 pages ready</span>
                  <Badge className="bg-success text-success-foreground text-xs">Generated ✓</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section ref={statsRef} className="border-y bg-muted/30">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "50K+", label: "Pages generated" },
              { value: "4 Modes", label: "pSEO · Directory · Hybrid · Local" },
              { value: "100%", label: "Static HTML export" },
              { value: "Zero", label: "Code required" },
            ].map((s) => (
              <div key={s.label} className="stat-item space-y-1">
                <div className="text-2xl md:text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINT ── */}
      <section className="container py-20 text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Stop building SEO pages <span className="text-primary">one by one</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Manually creating hundreds of location pages, directory listings, and landing pages is slow, expensive, and error-prone. HMW automates the entire process — from data import to static HTML export.
        </p>
        <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
          See How It Works <ArrowRight className="h-4 w-4" />
        </Button>
      </section>

      {/* ── ZIGZAG VALUE PROPS ── */}
      <section ref={zigzagRef} className="space-y-0">
        {[
          {
            title: "Connect any data source in seconds",
            desc: "Upload CSV files, paste a Google Sheets URL, or connect via OAuth. Your data is automatically parsed, mapped, and ready for template injection. No reformatting needed.",
            icon: <Database className="h-8 w-8" />,
            features: ["CSV upload", "Google Sheets sync", "Column auto-detect"],
          },
          {
            title: "Design templates with full HTML control",
            desc: "Use our Monaco editor with syntax highlighting, variable autocomplete, and live preview. Inject {{variables}} from your data into any HTML structure. AI-assisted generation available.",
            icon: <Code className="h-8 w-8" />,
            features: ["Monaco editor", "Live preview", "AI assistance"],
            reverse: true,
          },
          {
            title: "Export production-ready static sites",
            desc: "Download a complete ZIP with all HTML pages, shared CSS/JS assets, XML sitemaps, robots.txt, and JSON-LD structured data. Deploy to any hosting provider instantly.",
            icon: <Download className="h-8 w-8" />,
            features: ["Static HTML", "XML sitemaps", "JSON-LD schema"],
          },
        ].map((item, i) => (
          <div key={i} className={`zigzag-section border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
            <div className={`container py-16 lg:py-20 grid lg:grid-cols-2 gap-12 items-center ${item.reverse ? "lg:direction-rtl" : ""}`}>
              <div className={`zigzag-content space-y-6 ${item.reverse ? "lg:order-2" : ""}`}>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {item.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
                <Button className="gap-2" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <div className={`zigzag-visual flex justify-center ${item.reverse ? "lg:order-1" : ""}`}>
                <div className="h-64 w-full max-w-sm rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border flex items-center justify-center text-primary">
                  {item.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── SERVICES / MODES ── */}
      <section id="features" ref={servicesRef} className="bg-foreground text-background">
        <div className="container py-20 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Four powerful generation modes</h2>
            <p className="text-background/60">Choose the right approach for your SEO strategy. Mix and match across projects.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <BarChart3 className="h-6 w-6" />, title: "pSEO", desc: "Best X in Y pages, comparisons, glossaries at scale" },
              { icon: <Layers className="h-6 w-6" />, title: "Directory", desc: "Listing pages, categories, search results, locations" },
              { icon: <Globe className="h-6 w-6" />, title: "Hybrid", desc: "Combined directory listings + programmatic landing pages" },
              { icon: <MapPin className="h-6 w-6" />, title: "Local SEO", desc: "Search term × location combos for local dominance" },
            ].map((s) => (
              <div key={s.title} className="service-card rounded-xl border border-background/10 bg-background/5 p-6 space-y-3 hover:bg-background/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-sm text-background/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" variant="secondary" className="gap-2" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              Explore All Modes <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF SECTION ── */}
      <section className="container py-20 text-center space-y-8">
        <h2 className="text-3xl font-bold tracking-tight">Trusted by SEO professionals</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { quote: "Generated 2,000+ local pages in under an hour. The export quality is production-ready.", name: "Digital Marketing Agency", stars: 5 },
            { quote: "The template system gives us full control. We switched from expensive pSEO tools and never looked back.", name: "SEO Consultant", stars: 5 },
            { quote: "Local SEO mode is a game changer. We cover 300+ cities with unique content for each.", name: "Lead Gen Company", stars: 5 },
          ].map((t, i) => (
            <div key={i} className="feature-card bg-card border rounded-xl p-6 text-left space-y-4">
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
              <p className="text-xs font-semibold">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS GRID ── */}
      <section ref={benefitsRef} className="bg-muted/30 border-y">
        <div className="container py-20 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What makes HMW different</h2>
            <p className="text-muted-foreground">Everything you need for programmatic SEO, nothing you don't.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Search className="h-5 w-5" />, title: "Auto Meta Tags & OG", desc: "Pattern-based titles, descriptions, Open Graph, and canonical URLs for every page." },
              { icon: <FileText className="h-5 w-5" />, title: "JSON-LD Schema", desc: "Automatic structured data markup: LocalBusiness, Product, FAQ, and more." },
              { icon: <Globe className="h-5 w-5" />, title: "XML Sitemaps", desc: "Auto-generated sitemaps with 50K URL limit. Separate sitemaps per template type." },
              { icon: <TrendingUp className="h-5 w-5" />, title: "Spintax Engine", desc: "Nested spintax for unique content variations across thousands of pages." },
              { icon: <Shield className="h-5 w-5" />, title: "Custom Pages", desc: "Manual hub pages to prevent orphans: homepage, about, contact, privacy." },
              { icon: <Clock className="h-5 w-5" />, title: "Batch Generation", desc: "Generate and regenerate pages in bulk with real-time progress tracking." },
            ].map((b) => (
              <div key={b.title} className="benefit-card bg-card border rounded-xl p-6 space-y-3 hover:border-primary/30 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {b.icon}
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" ref={howRef} className="container py-20 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
          <p className="text-muted-foreground">From spreadsheet to deployed website in 4 simple steps.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { num: "01", icon: <Database className="h-6 w-6" />, title: "Add Your Data", desc: "CSV, Google Sheets, or manual entry. Columns auto-detected." },
            { num: "02", icon: <Code className="h-6 w-6" />, title: "Design Templates", desc: "Full HTML + {{variables}} in Monaco Editor with live preview." },
            { num: "03", icon: <Zap className="h-6 w-6" />, title: "Generate Pages", desc: "Normal, Split, or Combo modes. Bulk generate thousands at once." },
            { num: "04", icon: <Download className="h-6 w-6" />, title: "Export & Deploy", desc: "ZIP with HTML, sitemaps, robots.txt. Host anywhere." },
          ].map((s) => (
            <div key={s.num} className="step-card bg-card border rounded-xl p-6 space-y-4 relative overflow-hidden">
              <span className="absolute top-3 right-4 font-mono text-5xl font-bold text-primary/10">{s.num}</span>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {s.icon}
              </div>
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
            Start Building Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-muted/30 border-y">
        <div className="container py-20 max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: "What is programmatic SEO?", a: "Programmatic SEO is the practice of generating large numbers of search-optimized pages using templates and data. Instead of writing each page manually, you define a template and feed it data — HMW generates unique pages for every data row." },
              { q: "Do I need coding skills?", a: "No. While you can write custom HTML, HMW provides built-in templates and an AI assistant to help you create templates. The entire workflow is point-and-click." },
              { q: "What data sources are supported?", a: "CSV file upload, published Google Sheets URLs, Google Sheets OAuth API connection, and Apps Script webhooks for real-time data sync." },
              { q: "How does the Local SEO mode work?", a: "You enter a list of search terms (with optional singular/plural variants) and a list of locations. HMW generates a unique page for every combination — perfect for service-area businesses targeting multiple cities." },
              { q: "Can I export to my own hosting?", a: "Yes! HMW exports a complete ZIP file with static HTML pages, shared CSS/JS assets, XML sitemaps, and robots.txt. You can host the files on any web server, CDN, or static hosting provider." },
              { q: "What about duplicate content?", a: "HMW includes a built-in spintax engine that creates unique content variations for each page, canonical URL support, and customizable meta tags to avoid duplicate content issues." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border rounded-xl px-6">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section ref={ctaRef} className="container py-24">
        <div className="final-cta relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-10 md:p-16 text-center text-primary-foreground space-y-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to scale your SEO?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
              Join hundreds of marketers generating thousands of pages. Start free, no credit card required.
            </p>
            <Button size="lg" variant="secondary" className="gap-2 shadow-lg" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
