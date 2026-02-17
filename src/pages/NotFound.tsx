import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-8xl font-bold text-primary/20">404</div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            The page <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{location.pathname}</code> doesn't exist.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-1" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
