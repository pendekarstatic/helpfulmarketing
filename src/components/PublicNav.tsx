import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Local SEO", href: "#local-seo" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
    { label: "Docs", href: "/guide" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-lg">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-lg tracking-tight">HMW</span>
        </button>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href.startsWith("#") ? l.href : undefined}
              onClick={l.href.startsWith("/") ? (e) => { e.preventDefault(); navigate(l.href); } : undefined}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            >
              {l.label}
            </a>
          ))}
          <div className="ml-3 flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/tools/spintax")}>
              Tools
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              {user ? "Dashboard" : "Get Started"} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </nav>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background pb-4">
          <nav className="container flex flex-col gap-1 pt-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href.startsWith("#") ? l.href : undefined}
                onClick={(e) => {
                  if (l.href.startsWith("/")) { e.preventDefault(); navigate(l.href); }
                  setMobileOpen(false);
                }}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <a onClick={() => { navigate("/tools/spintax"); setMobileOpen(false); }} className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted cursor-pointer">Tools</a>
            <div className="px-3 pt-2">
              <Button className="w-full gap-1.5" onClick={() => { navigate(user ? "/dashboard" : "/auth"); setMobileOpen(false); }}>
                {user ? "Dashboard" : "Get Started"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
