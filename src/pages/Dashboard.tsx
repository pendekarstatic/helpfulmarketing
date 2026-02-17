import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Plus, MoreVertical, Archive, Copy, Trash2, FolderOpen, Globe, Layers, Zap, LogOut } from "lucide-react";

type ProjectMode = "pseo" | "directory" | "hybrid";

interface Project {
  id: string;
  name: string;
  slug: string | null;
  mode: ProjectMode;
  site_name: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", showArchived],
    queryFn: async () => {
      const q = supabase
        .from("projects")
        .select("*")
        .eq("is_archived", showArchived)
        .order("updated_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async ({ name, mode }: { name: string; mode: ProjectMode }) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { error } = await supabase.from("projects").insert({
        name,
        mode,
        slug,
        user_id: user!.id,
        site_name: name,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setCreateOpen(false);
      toast({ title: "Project created!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const archiveProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").update({ is_archived: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project archived" });
    },
  });

  const duplicateProject = useMutation({
    mutationFn: async (project: Project) => {
      const { error } = await supabase.from("projects").insert({
        name: `${project.name} (Copy)`,
        mode: project.mode,
        slug: `${project.slug}-copy`,
        user_id: user!.id,
        site_name: project.site_name,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project duplicated" });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createProject.mutate({
      name: form.get("name") as string,
      mode: (form.get("mode") as ProjectMode) || "directory",
    });
  };

  const modeIcon = (mode: ProjectMode) => {
    switch (mode) {
      case "pseo": return <Zap className="h-4 w-4" />;
      case "directory": return <Layers className="h-4 w-4" />;
      case "hybrid": return <Globe className="h-4 w-4" />;
    }
  };

  const modeColor = (mode: ProjectMode) => {
    switch (mode) {
      case "pseo": return "bg-primary/10 text-primary";
      case "directory": return "bg-accent/10 text-accent";
      case "hybrid": return "bg-warning/10 text-warning";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold tracking-tight">PageForge</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Title + actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground mt-1">
              {showArchived ? "Archived projects" : "Your active projects"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
              <Archive className="h-4 w-4 mr-1" />
              {showArchived ? "Active" : "Archived"}
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>Each project becomes one website or directory.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input id="project-name" name="name" required placeholder="My Directory" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mode</Label>
                      <Select name="mode" defaultValue="directory">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="directory">
                            <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> Directory</span>
                          </SelectItem>
                          <SelectItem value="pseo">
                            <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> pSEO</span>
                          </SelectItem>
                          <SelectItem value="hybrid">
                            <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Hybrid</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createProject.isPending}>
                      {createProject.isPending ? "Creating..." : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Project grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-5 bg-muted rounded w-3/4" /><div className="h-4 bg-muted rounded w-1/2 mt-2" /></CardHeader>
                <CardContent><div className="h-4 bg-muted rounded w-1/3" /></CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                {showArchived ? "No archived projects" : "No projects yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showArchived ? "Archived projects will appear here." : "Create your first project to get started."}
              </p>
              {!showArchived && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> New Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => duplicateProject.mutate(project)}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => archiveProject.mutate(project.id)}>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteProject.mutate(project.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{project.site_name || project.slug}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Badge variant="secondary" className={modeColor(project.mode)}>
                    {modeIcon(project.mode)}
                    <span className="ml-1 capitalize">{project.mode}</span>
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
