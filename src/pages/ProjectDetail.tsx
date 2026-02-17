import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Database, FileCode, FileText, Search, Download, Settings, Home } from "lucide-react";
import DataSourcesTab from "@/components/project/DataSourcesTab";
import TemplatesTab from "@/components/project/TemplatesTab";
import CustomPagesTab from "@/components/project/CustomPagesTab";
import PagesTab from "@/components/project/PagesTab";
import SeoTab from "@/components/project/SeoTab";
import ExportTab from "@/components/project/ExportTab";
import ProjectSettingsTab from "@/components/project/ProjectSettingsTab";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Project not found");
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">{project.name}</h1>
            <p className="text-xs text-muted-foreground capitalize">{project.mode} mode</p>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {project.mode === "local_seo" ? (
          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="templates" className="gap-1.5">
                <FileCode className="h-4 w-4" /> Templates
              </TabsTrigger>
              <TabsTrigger value="custom-pages" className="gap-1.5">
                <Home className="h-4 w-4" /> Custom Pages
              </TabsTrigger>
              <TabsTrigger value="pages" className="gap-1.5">
                <FileText className="h-4 w-4" /> Pages
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-1.5">
                <Search className="h-4 w-4" /> SEO
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-1.5">
                <Download className="h-4 w-4" /> Export
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="templates">
              <TemplatesTab projectId={project.id} projectMode={project.mode} />
            </TabsContent>
            <TabsContent value="custom-pages">
              <CustomPagesTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="pages">
              <PagesTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab projectId={project.id} project={project} />
            </TabsContent>
            <TabsContent value="export">
              <ExportTab projectId={project.id} project={project} />
            </TabsContent>
            <TabsContent value="settings">
              <ProjectSettingsTab project={project} />
            </TabsContent>
          </Tabs>
        ) : (
          <Tabs defaultValue="data" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="data" className="gap-1.5">
                <Database className="h-4 w-4" /> Data Sources
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-1.5">
                <FileCode className="h-4 w-4" /> Templates
              </TabsTrigger>
              <TabsTrigger value="custom-pages" className="gap-1.5">
                <Home className="h-4 w-4" /> Custom Pages
              </TabsTrigger>
              <TabsTrigger value="pages" className="gap-1.5">
                <FileText className="h-4 w-4" /> Pages
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-1.5">
                <Search className="h-4 w-4" /> SEO
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-1.5">
                <Download className="h-4 w-4" /> Export
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5">
                <Settings className="h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data">
              <DataSourcesTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="templates">
              <TemplatesTab projectId={project.id} projectMode={project.mode} />
            </TabsContent>
            <TabsContent value="custom-pages">
              <CustomPagesTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="pages">
              <PagesTab projectId={project.id} />
            </TabsContent>
            <TabsContent value="seo">
              <SeoTab projectId={project.id} project={project} />
            </TabsContent>
            <TabsContent value="export">
              <ExportTab projectId={project.id} project={project} />
            </TabsContent>
            <TabsContent value="settings">
              <ProjectSettingsTab project={project} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
