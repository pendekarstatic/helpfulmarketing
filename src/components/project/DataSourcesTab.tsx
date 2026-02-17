import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Link, Trash2, RefreshCw, Eye, Database } from "lucide-react";
import Papa from "papaparse";
import type { Json } from "@/integrations/supabase/types";

interface DataSourcesTabProps {
  projectId: string;
}

export default function DataSourcesTab({ projectId }: DataSourcesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["data-sources", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createSource = useMutation({
    mutationFn: async (params: { name: string; source_type: string; config: any; cached_data?: any }) => {
      const { error } = await supabase.from("data_sources").insert({
        project_id: projectId,
        name: params.name,
        source_type: params.source_type as any,
        config: params.config as Json,
        cached_data: params.cached_data as Json ?? null,
        last_synced_at: params.cached_data ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", projectId] });
      setAddOpen(false);
      toast({ title: "Data source added!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("data_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", projectId] });
      toast({ title: "Data source removed" });
    },
  });

  const refreshSource = useMutation({
    mutationFn: async (source: any) => {
      if (source.source_type === "published_url") {
        const url = source.config?.url;
        if (!url) throw new Error("No URL configured");
        // Convert Google Sheets URL to CSV export
        let csvUrl = url;
        if (url.includes("docs.google.com/spreadsheets")) {
          const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (match) {
            csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
          }
        }
        const res = await fetch(csvUrl);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        const { error } = await supabase
          .from("data_sources")
          .update({ cached_data: parsed.data as unknown as Json, last_synced_at: new Date().toISOString() })
          .eq("id", source.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", projectId] });
      toast({ title: "Data refreshed!" });
    },
    onError: (err: any) => toast({ title: "Refresh failed", description: err.message, variant: "destructive" }),
  });

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        createSource.mutate({
          name: file.name.replace(/\.csv$/, ""),
          source_type: "csv",
          config: { filename: file.name },
          cached_data: results.data,
        });
      },
      error: (err) => toast({ title: "Parse error", description: err.message, variant: "destructive" }),
    });
  };

  const handleSheetUrl = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const url = form.get("url") as string;
    const name = form.get("name") as string || "Google Sheet";

    // Immediately fetch
    let csvUrl = url;
    if (url.includes("docs.google.com/spreadsheets")) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }
    }

    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        createSource.mutate({
          name,
          source_type: "published_url",
          config: { url },
          cached_data: parsed.data,
        });
      })
      .catch((err) => toast({ title: "Fetch failed", description: err.message, variant: "destructive" }));
  };

  const previewData = previewSource
    ? sources.find((s) => s.id === previewSource)
    : null;
  const previewRows = (previewData?.cached_data as any[] | null) ?? [];
  const previewColumns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Data Sources</h3>
          <p className="text-sm text-muted-foreground">Connect spreadsheets or upload CSV files</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Upload CSV
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> Add Sheet URL</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSheetUrl}>
                <DialogHeader>
                  <DialogTitle>Connect Google Sheet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input name="name" placeholder="My Sheet" />
                  </div>
                  <div className="space-y-2">
                    <Label>Published Sheet URL</Label>
                    <Input name="url" required placeholder="https://docs.google.com/spreadsheets/d/..." />
                    <p className="text-xs text-muted-foreground">Paste a public Google Sheets URL or any CSV URL</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createSource.isPending}>
                    {createSource.isPending ? "Connecting..." : "Connect"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sources.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No data sources yet</h3>
            <p className="text-muted-foreground mb-4">Upload a CSV or connect a Google Sheet to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => {
            const rowCount = Array.isArray(source.cached_data) ? (source.cached_data as any[]).length : 0;
            return (
              <Card key={source.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{source.source_type.replace("_", " ")}</Badge>
                        <span>{rowCount} rows</span>
                        {source.last_synced_at && (
                          <span>· Synced {new Date(source.last_synced_at).toLocaleString()}</span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setPreviewSource(source.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {source.source_type === "published_url" && (
                        <Button variant="ghost" size="icon" onClick={() => refreshSource.mutate(source)} disabled={refreshSource.isPending}>
                          <RefreshCw className={`h-4 w-4 ${refreshSource.isPending ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteSource.mutate(source.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Data Preview Dialog */}
      <Dialog open={!!previewSource} onOpenChange={() => setPreviewSource(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Data Preview — {previewData?.name}</DialogTitle>
          </DialogHeader>
          {previewRows.length > 0 ? (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewColumns.map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.slice(0, 50).map((row: any, i: number) => (
                    <TableRow key={i}>
                      {previewColumns.map((col) => (
                        <TableCell key={col} className="whitespace-nowrap max-w-[200px] truncate">
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">No data available</p>
          )}
          {previewRows.length > 50 && (
            <p className="text-xs text-muted-foreground text-center">Showing first 50 of {previewRows.length} rows</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
