import { useNavigate } from "react-router-dom";

export default function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">H</span>
              </div>
              <span className="font-bold tracking-tight">HMW</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The all-in-one digital marketing platform. Turn spreadsheets into SEO-powered websites with programmatic SEO and local search tools.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#local-seo" className="hover:text-foreground transition-colors">Local SEO</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><button onClick={() => navigate("/tools/spintax")} className="hover:text-foreground transition-colors">Spintax Tool</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate("/guide")} className="hover:text-foreground transition-colors">Documentation</button></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">Sign Up</button></li>
              <li><button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">Login</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <span>© {new Date().getFullYear()} Helpful Marketing Website. All rights reserved.</span>
          <span className="font-mono">Digital Marketing & SEO Platform</span>
        </div>
      </div>
    </footer>
  );
}
