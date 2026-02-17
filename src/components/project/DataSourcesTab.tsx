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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Trash2, RefreshCw, Eye, Database, Edit, Save, Link, Webhook, PenLine } from "lucide-react";
import Papa from "papaparse";
import type { Json } from "@/integrations/supabase/types";

interface DataSourcesTabProps {
  projectId: string;
}

function getGoogleSheetCsvUrl(url: string): string {
  if (!url.includes("docs.google.com/spreadsheets")) return url;
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return url;
  const spreadsheetId = idMatch[1];
  let csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
  const gidMatch = url.match(/[?&#]gid=(\d+)/);
  if (gidMatch) {
    csvUrl += `&gid=${gidMatch[1]}`;
  }
  return csvUrl;
}

export default function DataSourcesTab({ projectId }: DataSourcesTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<string>("published_url");
  const [previewSource, setPreviewSource] = useState<string | null>(null);
  const [mappingSource, setMappingSource] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualRows, setManualRows] = useState<Record<string, string>[]>([{ title: "", description: "", category: "", location: "" }]);
  const [editingRow, setEditingRow] = useState<{ sourceId: string; rowIndex: number; data: Record<string, string> } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sources = [] } = useQuery({
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
      setManualOpen(false);
      toast({ title: "Data source added!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateSource = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from("data_sources").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", projectId] });
      toast({ title: "Data source updated!" });
    },
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
        const csvUrl = getGoogleSheetCsvUrl(url);
        const res = await fetch(csvUrl);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.data.length === 0) throw new Error("No data found in sheet. Make sure the sheet is public.");
        const { error } = await supabase
          .from("data_sources")
          .update({ cached_data: parsed.data as unknown as Json, last_synced_at: new Date().toISOString() })
          .eq("id", source.id);
        if (error) throw error;
        return parsed.data.length;
      }
      throw new Error("Refresh not supported for this source type");
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["data-sources", projectId] });
      toast({ title: `Data refreshed! ${count} rows loaded.` });
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSheetUrl = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const url = form.get("url") as string;
    const name = form.get("name") as string || "Google Sheet";
    const csvUrl = getGoogleSheetCsvUrl(url);
    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}. Make sure the Google Sheet is published/public.`);
        return res.text();
      })
      .then((text) => {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.data.length === 0) throw new Error("No data found. Make sure the sheet has data and is public.");
        createSource.mutate({ name, source_type: "published_url", config: { url }, cached_data: parsed.data });
      })
      .catch((err) => toast({ title: "Fetch failed", description: err.message, variant: "destructive" }));
  };

  const handleWebhook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string || "Webhook";
    const webhookUrl = `${window.location.origin}/api/webhook/${projectId}`;
    createSource.mutate({
      name,
      source_type: "apps_script_webhook",
      config: { webhook_url: webhookUrl },
    });
  };

  const handleManualEntry = () => {
    const validRows = manualRows.filter((r) => Object.values(r).some((v) => v.trim()));
    if (validRows.length === 0) {
      toast({ title: "Add at least one row", variant: "destructive" });
      return;
    }
    createSource.mutate({
      name: "Manual Entry",
      source_type: "csv",
      config: { manual: true },
      cached_data: validRows,
    });
  };

  const handleSaveColumnMapping = (sourceId: string, mapping: Record<string, string>) => {
    updateSource.mutate({
      id: sourceId,
      updates: { column_mapping: mapping as unknown as Json },
    });
    setMappingSource(null);
  };

  const handleEditRow = () => {
    if (!editingRow) return;
    const source = sources.find((s) => s.id === editingRow.sourceId);
    if (!source || !Array.isArray(source.cached_data)) return;
    const rows = [...(source.cached_data as any[])];
    rows[editingRow.rowIndex] = editingRow.data;
    updateSource.mutate({
      id: editingRow.sourceId,
      updates: { cached_data: rows as unknown as Json },
    });
    setEditingRow(null);
  };

  const previewData = previewSource ? sources.find((s) => s.id === previewSource) : null;
  const previewRows = (previewData?.cached_data as any[] | null) ?? [];
  const previewColumns = previewRows.length > 0 ? Object.keys(previewRows[0]) : [];

  const mappingData = mappingSource ? sources.find((s) => s.id === mappingSource) : null;
  const mappingColumns = mappingData && Array.isArray(mappingData.cached_data) && (mappingData.cached_data as any[]).length > 0
    ? Object.keys((mappingData.cached_data as any[])[0])
    : [];
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const TEMPLATE_FIELDS = ["title", "description", "category", "location", "image", "url", "price", "rating", "tags", "slug"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Data Sources</h3>
          <p className="text-sm text-muted-foreground">Connect spreadsheets, upload CSV, or enter data manually</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setManualOpen(true)}>
            <PenLine className="h-4 w-4 mr-1" /> Manual
          </Button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Connect</Button>
            </DialogTrigger>
            <DialogContent>
              <Tabs value={addType} onValueChange={setAddType}>
                <DialogHeader>
                  <DialogTitle>Connect Data Source</DialogTitle>
                </DialogHeader>
                <TabsList className="w-full mt-2">
                  <TabsTrigger value="published_url" className="flex-1 gap-1"><Link className="h-3 w-3" /> Sheet URL</TabsTrigger>
                  <TabsTrigger value="apps_script_webhook" className="flex-1 gap-1"><Webhook className="h-3 w-3" /> Webhook</TabsTrigger>
                </TabsList>
                <TabsContent value="published_url">
                  <form onSubmit={handleSheetUrl} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" placeholder="My Sheet" />
                    </div>
                    <div className="space-y-2">
                      <Label>Google Sheet URL</Label>
                      <Input name="url" required placeholder="https://docs.google.com/spreadsheets/d/..." />
                      <p className="text-xs text-muted-foreground">
                        Paste any Google Sheets URL (edit, sharing, or published). The sheet tab (gid) will be auto-detected from the URL.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createSource.isPending}>
                        {createSource.isPending ? "Connecting..." : "Connect"}
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>
                <TabsContent value="apps_script_webhook">
                  <form onSubmit={handleWebhook} className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input name="name" placeholder="Apps Script Webhook" />
                    </div>
                    <div className="space-y-2 rounded-md bg-muted p-3">
                      <p className="text-xs text-muted-foreground">After creating, you'll get a webhook URL. Configure your Apps Script to POST JSON data to this endpoint.</p>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createSource.isPending}>Create Webhook</Button>
                    </DialogFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Source cards */}
      {sources.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No data sources yet</h3>
            <p className="text-muted-foreground mb-4">Upload a CSV, connect a Google Sheet, or enter data manually.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => {
            const rowCount = Array.isArray(source.cached_data) ? (source.cached_data as any[]).length : 0;
            const isWebhook = source.source_type === "apps_script_webhook";
            return (
              <Card key={source.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs capitalize">{source.source_type.replace(/_/g, " ")}</Badge>
                        <span>{rowCount} rows</span>
                        {source.last_synced_at && <span>· Synced {new Date(source.last_synced_at).toLocaleString()}</span>}
                        {isWebhook && source.config && (
                          <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono break-all">
                            {(source.config as any).webhook_url}
                          </code>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {rowCount > 0 && (
                        <Button variant="ghost" size="icon" title="Preview / Edit Data" onClick={() => setPreviewSource(source.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {rowCount > 0 && (
                        <Button variant="ghost" size="icon" title="Column Mapping" onClick={() => { setMappingSource(source.id); setColumnMap((source.column_mapping as Record<string, string>) || {}); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {(source.source_type === "published_url") && (
                        <Button variant="ghost" size="icon" title="Re-fetch data from source" onClick={() => refreshSource.mutate(source)} disabled={refreshSource.isPending}>
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

      {/* Manual Entry Dialog */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manual Data Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {manualRows.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                {Object.keys(row).map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{key}</Label>
                    <Input
                      value={row[key]}
                      onChange={(e) => {
                        const updated = [...manualRows];
                        updated[i] = { ...updated[i], [key]: e.target.value };
                        setManualRows(updated);
                      }}
                      className="text-sm"
                      placeholder={key}
                    />
                  </div>
                ))}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setManualRows([...manualRows, { title: "", description: "", category: "", location: "" }])}>
              <Plus className="h-3 w-3 mr-1" /> Add Row
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={handleManualEntry} disabled={createSource.isPending}>
              <Save className="h-4 w-4 mr-1" /> Save Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Mapping Dialog */}
      <Dialog open={!!mappingSource} onOpenChange={() => setMappingSource(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Column Mapping — {mappingData?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Map your sheet columns to template fields</p>
          <div className="space-y-3 py-2">
            {TEMPLATE_FIELDS.map((field) => (
              <div key={field} className="flex items-center gap-3">
                <Label className="w-24 text-sm font-mono">{`{{${field}}}`}</Label>
                <Select value={columnMap[field] || ""} onValueChange={(v) => setColumnMap({ ...columnMap, [field]: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select column..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— None —</SelectItem>
                    {mappingColumns.map((col) => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => mappingSource && handleSaveColumnMapping(mappingSource, columnMap)}>
              <Save className="h-4 w-4 mr-1" /> Save Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Preview Dialog with inline editing - opens in current tab, not blank */}
      <Dialog open={!!previewSource} onOpenChange={() => setPreviewSource(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Data Preview — {previewData?.name} ({previewRows.length} rows)</DialogTitle>
              {previewData?.source_type === "published_url" && (
                <Button variant="outline" size="sm" onClick={() => previewData && refreshSource.mutate(previewData)} disabled={refreshSource.isPending}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${refreshSource.isPending ? "animate-spin" : ""}`} /> Re-fetch
                </Button>
              )}
            </div>
          </DialogHeader>
          {previewRows.length > 0 ? (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    {previewColumns.map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                    ))}
                    <TableHead className="w-16">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.slice(0, 100).map((row: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      {previewColumns.map((col) => (
                        <TableCell key={col} className="whitespace-nowrap max-w-[200px] truncate text-sm">
                          {row[col] ?? ""}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingRow({ sourceId: previewSource!, rowIndex: i, data: { ...row } })}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">No data available. Try re-fetching the data source.</p>
          )}
          {previewRows.length > 100 && (
            <p className="text-xs text-muted-foreground text-center">Showing first 100 of {previewRows.length} rows</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Row Edit Dialog */}
      <Dialog open={!!editingRow} onOpenChange={() => setEditingRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Row #{editingRow ? editingRow.rowIndex + 1 : ""}</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {Object.entries(editingRow.data).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs font-mono">{key}</Label>
                  <Input
                    value={String(value || "")}
                    onChange={(e) => setEditingRow({ ...editingRow, data: { ...editingRow.data, [key]: e.target.value } })}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditRow}>
              <Save className="h-4 w-4 mr-1" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}