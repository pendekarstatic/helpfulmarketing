import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Palette, Code, Bot, Shield } from "lucide-react";

interface ProjectSettingsTabProps {
  project: any;
}

export default function ProjectSettingsTab({ project }: ProjectSettingsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: project.name || "",
    site_name: project.site_name || "",
    slug: project.slug || "",
    mode: project.mode || "directory",
    primary_color: project.primary_color || "#5b4fe0",
    secondary_color: project.secondary_color || "#16213e",
    font_family: project.font_family || "Inter",
    header_content: project.header_content || "",
    footer_content: project.footer_content || "",
    url_format: project.url_format || "pretty_slash",
    custom_domain: project.custom_domain || "",
    theme: project.theme || "dark",
    openrouter_api_key: project.openrouter_api_key || "",
    straico_api_key: project.straico_api_key || "",
    ai_model: project.ai_model || "",
    brand_guidelines: project.brand_guidelines || "",
    sitemap_max_urls: project.sitemap_max_urls ?? 50000,
    sitemap_separate: project.sitemap_separate ?? true,
    favicon_url: project.favicon_url || "",
    og_image_url: project.og_image_url || "",
    analytics_code: project.analytics_code || "",
    robots_txt: project.robots_txt || "",
    use_header_footer: project.use_header_footer ?? false,
    logo_url: project.logo_url || "",
    split_assets: project.split_assets ?? true,
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update(form as any)
        .eq("id", project.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      toast({ title: "Settings saved!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Project Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your site's identity, branding, and integrations</p>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="h-4 w-4 mr-1" /> {save.isPending ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} placeholder="My Directory" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-directory" />
            </div>
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="directory">Directory</SelectItem>
                  <SelectItem value="pseo">pSEO</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input value={form.favicon_url} onChange={(e) => setForm({ ...form, favicon_url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>OG Image URL</Label>
            <Input value={form.og_image_url} onChange={(e) => setForm({ ...form, og_image_url: e.target.value })} placeholder="https://... (default social share image)" />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Branding</CardTitle>
          <CardDescription>Colors and fonts for your generated website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="h-10 w-10 rounded border cursor-pointer" />
                <Input value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Font Family</Label>
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
        </CardContent>
      </Card>

      {/* URL Format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> URL Format</CardTitle>
          <CardDescription>Configure how page URLs are generated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL Style</Label>
            <Select value={form.url_format} onValueChange={(v) => setForm({ ...form, url_format: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pretty_slash">/path/ (trailing slash)</SelectItem>
                <SelectItem value="pretty_no_slash">/path (no trailing slash)</SelectItem>
                <SelectItem value="html">/path.html</SelectItem>
                <SelectItem value="directory">/path/index.html</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Preview: {form.url_format === "pretty_slash" ? "/best-restaurants-in-new-york/" : form.url_format === "pretty_no_slash" ? "/best-restaurants-in-new-york" : form.url_format === "html" ? "/best-restaurants-in-new-york.html" : "/best-restaurants-in-new-york/index.html"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Custom Domain</CardTitle>
          <CardDescription>Point your domain to your generated site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Domain</Label>
            <Input value={form.custom_domain} onChange={(e) => setForm({ ...form, custom_domain: e.target.value })} placeholder="example.com" />
            <p className="text-xs text-muted-foreground">
              After export, point your domain's DNS to your hosting provider. This setting configures sitemaps and canonical URLs.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Header & Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4" /> Header & Footer</CardTitle>
          <CardDescription>Optional separate header and footer sections for your pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Shared Header & Footer</Label>
              <p className="text-xs text-muted-foreground">Inject separate header/footer HTML into all generated pages</p>
            </div>
            <Switch
              checked={form.use_header_footer}
              onCheckedChange={(checked) => setForm({ ...form, use_header_footer: checked })}
            />
          </div>
          {form.use_header_footer && (
            <>
              <div className="space-y-2">
                <Label>Header HTML</Label>
                <Textarea value={form.header_content} onChange={(e) => setForm({ ...form, header_content: e.target.value })} rows={4} className="font-mono text-sm" placeholder='<nav class="navbar">...</nav>' />
              </div>
              <div className="space-y-2">
                <Label>Footer HTML</Label>
                <Textarea value={form.footer_content} onChange={(e) => setForm({ ...form, footer_content: e.target.value })} rows={4} className="font-mono text-sm" placeholder='<footer>...</footer>' />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sitemap Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Sitemap Settings</CardTitle>
          <CardDescription>Configure sitemap generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max URLs per Sitemap</Label>
              <Input
                type="number"
                min={1}
                max={50000}
                value={form.sitemap_max_urls}
                onChange={(e) => setForm({ ...form, sitemap_max_urls: Math.min(50000, Math.max(1, parseInt(e.target.value) || 50000)) })}
              />
              <p className="text-xs text-muted-foreground">Maximum 50,000 URLs per sitemap file</p>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.sitemap_separate}
                  onCheckedChange={(checked) => setForm({ ...form, sitemap_separate: checked })}
                />
                <div>
                  <Label>Separate Sitemaps</Label>
                  <p className="text-xs text-muted-foreground">Generate category, location, and type-specific sitemaps</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> AI Web Creation</CardTitle>
          <CardDescription>Connect AI providers to enhance page generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>OpenRouter API Key</Label>
              <Input
                type="password"
                value={form.openrouter_api_key}
                onChange={(e) => setForm({ ...form, openrouter_api_key: e.target.value })}
                placeholder="sk-or-..."
              />
            </div>
            <div className="space-y-2">
              <Label>Straico API Key</Label>
              <Input
                type="password"
                value={form.straico_api_key}
                onChange={(e) => setForm({ ...form, straico_api_key: e.target.value })}
                placeholder="straico_..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Input
              value={form.ai_model}
              onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
              placeholder="e.g., openai/gpt-4o, anthropic/claude-3.5-sonnet, google/gemini-pro"
            />
            <p className="text-xs text-muted-foreground">Enter the model ID from OpenRouter or Straico. Leave blank to use provider default.</p>
          </div>
          <div className="space-y-2">
            <Label>Brand Guidelines</Label>
            <Textarea
              value={form.brand_guidelines}
              onChange={(e) => setForm({ ...form, brand_guidelines: e.target.value })}
              rows={4}
              placeholder="Describe your brand voice, style, target audience, tone, keywords to include/avoid..."
            />
            <p className="text-xs text-muted-foreground">The AI will use these guidelines when generating or enhancing page content.</p>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4" /> Export Options</CardTitle>
          <CardDescription>Configure how exported files are structured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Split CSS & JavaScript</Label>
              <p className="text-xs text-muted-foreground">When enabled, CSS and JS are extracted into shared files instead of being inline in each page HTML</p>
            </div>
            <Switch
              checked={form.split_assets}
              onCheckedChange={(checked) => setForm({ ...form, split_assets: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4" /> Advanced</CardTitle>
          <CardDescription>Analytics, robots.txt, and other advanced settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Analytics Code</Label>
            <Textarea
              value={form.analytics_code}
              onChange={(e) => setForm({ ...form, analytics_code: e.target.value })}
              rows={3}
              className="font-mono text-sm"
              placeholder='<script async src="https://www.googletagmanager.com/gtag/js?id=G-..."></script>'
            />
          </div>
          <div className="space-y-2">
            <Label>robots.txt</Label>
            <Textarea
              value={form.robots_txt}
              onChange={(e) => setForm({ ...form, robots_txt: e.target.value })}
              rows={3}
              className="font-mono text-sm"
              placeholder={"User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml"}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => save.mutate()} disabled={save.isPending} className="w-full">
        <Save className="h-4 w-4 mr-1" /> {save.isPending ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  );
}
