import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Save, Bot, Palette, Code } from "lucide-react";

interface GlobalSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GlobalSettings {
  // AI
  openrouter_api_key?: string;
  straico_api_key?: string;
  ai_model?: string;
  ai_provider?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  brand_guidelines?: string;
  // Branding
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  theme?: string;
  // Export
  split_assets?: boolean;
  url_format?: string;
}

export default function GlobalSettingsDialog({ open, onOpenChange }: GlobalSettingsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settingsRow } = useQuery({
    queryKey: ["user-settings", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user && open,
  });

  const defaults: GlobalSettings = (settingsRow?.settings as GlobalSettings) || {};

  const [form, setForm] = useState<GlobalSettings>({
    openrouter_api_key: "",
    straico_api_key: "",
    ai_model: "",
    ai_provider: "openrouter",
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
    brand_guidelines: "",
    primary_color: "#5b4fe0",
    secondary_color: "#16213e",
    font_family: "Inter",
    theme: "dark",
    split_assets: true,
    url_format: "pretty_slash",
  });

  useEffect(() => {
    if (defaults && Object.keys(defaults).length > 0) {
      setForm((prev) => ({ ...prev, ...defaults }));
    }
  }, [settingsRow]);

  const save = useMutation({
    mutationFn: async () => {
      if (settingsRow) {
        const { error } = await supabase
          .from("user_settings")
          .update({ settings: form as any, updated_at: new Date().toISOString() })
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_settings")
          .insert({ user_id: user!.id, settings: form as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast({ title: "Global settings saved!" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Global Default Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Settings */}
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 text-sm"><Bot className="h-4 w-4" /> AI Defaults</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">AI Provider</Label>
                <Select value={form.ai_provider} onValueChange={(v) => setForm({ ...form, ai_provider: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="straico">Straico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Default Model</Label>
                <Input value={form.ai_model} onChange={(e) => setForm({ ...form, ai_model: e.target.value })} placeholder="e.g., openai/gpt-4o" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">OpenRouter API Key</Label>
                <Input type="password" value={form.openrouter_api_key} onChange={(e) => setForm({ ...form, openrouter_api_key: e.target.value })} placeholder="sk-or-..." className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Straico API Key</Label>
                <Input type="password" value={form.straico_api_key} onChange={(e) => setForm({ ...form, straico_api_key: e.target.value })} placeholder="straico_..." className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Temperature: {form.temperature}</Label>
                <Slider value={[form.temperature ?? 0.7]} onValueChange={([v]) => setForm({ ...form, temperature: v })} min={0} max={2} step={0.1} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Max Tokens: {form.max_tokens}</Label>
                <Slider value={[form.max_tokens ?? 4096]} onValueChange={([v]) => setForm({ ...form, max_tokens: v })} min={256} max={16384} step={256} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Top P: {form.top_p}</Label>
                <Slider value={[form.top_p ?? 1]} onValueChange={([v]) => setForm({ ...form, top_p: v })} min={0} max={1} step={0.05} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Brand Guidelines</Label>
              <Textarea value={form.brand_guidelines} onChange={(e) => setForm({ ...form, brand_guidelines: e.target.value })} rows={3} placeholder="Default brand voice, style, tone..." className="text-sm" />
            </div>
          </div>

          {/* Branding */}
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 text-sm"><Palette className="h-4 w-4" /> Branding Defaults</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Primary Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-9 w-9 rounded border cursor-pointer" />
                  <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Secondary Color</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="h-9 w-9 rounded border cursor-pointer" />
                  <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Font Family</Label>
                <Select value={form.font_family} onValueChange={(v) => setForm({ ...form, font_family: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                    <SelectItem value="DM Sans">DM Sans</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="system-ui">System UI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2 text-sm"><Code className="h-4 w-4" /> Export Defaults</h4>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Split CSS & JavaScript</Label>
                <p className="text-xs text-muted-foreground">Extract into shared /assets/ folder</p>
              </div>
              <Switch checked={form.split_assets} onCheckedChange={(checked) => setForm({ ...form, split_assets: checked })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">URL Format</Label>
              <Select value={form.url_format} onValueChange={(v) => setForm({ ...form, url_format: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pretty_slash">/path/ (trailing slash)</SelectItem>
                  <SelectItem value="pretty_no_slash">/path (no trailing slash)</SelectItem>
                  <SelectItem value="html">/path.html</SelectItem>
                  <SelectItem value="directory">/path/index.html</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            <Save className="h-4 w-4 mr-1" /> {save.isPending ? "Saving..." : "Save Defaults"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
