import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Copy } from "lucide-react";
import { spinText, validateSpintax, countVariations } from "@/lib/spintax";
import { useToast } from "@/hooks/use-toast";

export default function SpintaxTool() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState(
    `{Welcome to|Discover|Explore} our {amazing|incredible|{truly|absolutely} wonderful} {hotel|resort|property} in {Tokyo|{New York|NYC}|Cannes}.

{We offer|Our guests enjoy|You'll love} {luxurious|comfortable|spacious} {rooms|suites|accommodations} with {stunning|breathtaking|panoramic} {views|scenery}.

{Book now|Reserve today|Plan your stay} and {experience|discover|enjoy} {the best|top-rated|award-winning} {hospitality|service|comfort} in the {city|region|area}.`
  );
  const [outputs, setOutputs] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const validation = validateSpintax(input);
  const variations = validation.valid ? countVariations(input) : 0;

  const generate = () => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(spinText(input));
    }
    setOutputs(results);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">Spintax Testing Tool</h1>
            <p className="text-xs text-muted-foreground">Test nested spintax syntax and preview generated variations</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Home</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/guide")}>Docs</Button>
        </div>
      </header>

      <main className="container py-8 space-y-6 max-w-4xl">
        {/* Syntax Guide */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Spintax Syntax Guide</CardTitle>
            <CardDescription>Use curly braces and pipes to create text variations. Nesting is supported.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted rounded-lg p-3">
                <div className="font-mono text-xs mb-1 text-muted-foreground">Basic:</div>
                <code className="text-xs">{`{Hello|Hi|Hey} world`}</code>
                <div className="text-xs text-muted-foreground mt-1">→ "Hello world" or "Hi world" or "Hey world"</div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="font-mono text-xs mb-1 text-muted-foreground">Nested:</div>
                <code className="text-xs">{`{a {great|wonderful}|an amazing} hotel`}</code>
                <div className="text-xs text-muted-foreground mt-1">→ "a great hotel" or "a wonderful hotel" or "an amazing hotel"</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Input Text</CardTitle>
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" /> Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <XCircle className="h-3 w-3" /> {validation.error}
                  </Badge>
                )}
                {validation.valid && (
                  <Badge variant="outline" className="text-xs">
                    {variations.toLocaleString()} possible variations
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); setOutputs([]); }}
              rows={8}
              className="font-mono text-sm"
              placeholder="Enter your spintax text here... e.g., {Hello|Hi} {world|everyone}"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Generate</span>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value={1}>1</option>
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-muted-foreground">variations</span>
              </div>
              <Button onClick={generate} disabled={!validation.valid} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Outputs */}
        {outputs.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Variations ({outputs.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(outputs.join('\n\n---\n\n'));
                  toast({ title: "Copied all variations!" });
                }}>
                  <Copy className="h-3 w-3 mr-1" /> Copy All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {outputs.map((output, i) => (
                  <div key={i} className="bg-muted rounded-lg p-4 relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        navigator.clipboard.writeText(output);
                        toast({ title: "Copied!" });
                      }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed pr-16">{output}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
