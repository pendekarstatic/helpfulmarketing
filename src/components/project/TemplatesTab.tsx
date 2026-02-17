import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileCode, Trash2, Edit, Copy, BookTemplate, Sparkles, Filter, Combine } from "lucide-react";
import TemplateEditor from "./TemplateEditor";
import type { Database } from "@/integrations/supabase/types";
import { SAMPLE_HOTEL_DATA, SAMPLE_DATA_SOURCE_NAME } from "@/lib/sample-data";

type TemplateType = Database["public"]["Enums"]["template_type"];

interface TemplatesTabProps {
  projectId: string;
  projectMode: string;
}

const TEMPLATE_LABELS: Record<TemplateType, string> = {
  listing_detail: "Listing Detail",
  category_page: "Category Page",
  search_results: "Search Results",
  location_page: "Location Page",
  best_x_in_y: "Best X in Y",
  comparison: "Comparison",
  glossary: "Glossary",
  custom: "Custom",
};

// Built-in template HTML for each type
const BUILTIN_TEMPLATES: Record<string, { name: string; type: TemplateType; html: string; urlPattern: string; schemaType: string }> = {
  business_directory: {
    name: "Business Directory",
    type: "listing_detail",
    schemaType: "LocalBusiness",
    urlPattern: "/listing/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b}
    .header{background:#1e293b;color:white;padding:1rem 2rem}
    .container{max-width:900px;margin:0 auto;padding:2rem}
    .card{background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
    .card-img{width:100%;height:300px;object-fit:cover}
    .card-body{padding:2rem}
    h1{font-size:1.75rem;margin-bottom:0.5rem}
    .meta{display:flex;gap:1rem;color:#64748b;font-size:0.875rem;margin-bottom:1rem;flex-wrap:wrap}
    .badge{background:#e0e7ff;color:#4338ca;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:600}
    .rating{color:#f59e0b;font-weight:700}
    .description{line-height:1.8;color:#475569;margin-top:1rem}
    .footer{text-align:center;padding:2rem;color:#94a3b8;font-size:0.8rem}
  </style>
</head>
<body>
  <div class="header"><strong>{{site_name}}</strong></div>
  <div class="container">
    <div class="card">
      <img class="card-img" src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'" />
      <div class="card-body">
        <h1>{{title}}</h1>
        <div class="meta">
          <span class="badge">{{category}}</span>
          <span>📍 {{location}}</span>
          <span class="rating">⭐ {{rating}}</span>
          <span>💰 {{price}}</span>
        </div>
        <div class="description">{{description}}</div>
      </div>
    </div>
  </div>
  <div class="footer">© {{site_name}}</div>
</body>
</html>`,
  },
  saas_directory: {
    name: "SaaS / Tool Directory",
    type: "listing_detail",
    schemaType: "SoftwareApplication",
    urlPattern: "/tool/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Tools</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#fafafa;color:#18181b}
    .nav{border-bottom:1px solid #e4e4e7;padding:1rem 2rem;display:flex;align-items:center;gap:1rem}
    .container{max-width:800px;margin:2rem auto;padding:0 2rem}
    .hero{display:flex;gap:2rem;align-items:flex-start;margin-bottom:2rem}
    .logo{width:80px;height:80px;border-radius:16px;object-fit:cover;border:1px solid #e4e4e7}
    h1{font-size:1.5rem}
    .tags{display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap}
    .tag{background:#f4f4f5;border:1px solid #e4e4e7;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.75rem;color:#52525b}
    .pricing{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:1.5rem;border-radius:12px;margin:1.5rem 0;font-size:1.25rem;font-weight:700;text-align:center}
    .desc{line-height:1.8;color:#3f3f46}
  </style>
</head>
<body>
  <div class="nav"><strong>Tools Directory</strong></div>
  <div class="container">
    <div class="hero">
      <img class="logo" src="{{image}}" alt="{{title}}" onerror="this.style.background='#e4e4e7'" />
      <div>
        <h1>{{title}}</h1>
        <div class="tags">
          <span class="tag">{{category}}</span>
          <span class="tag">⭐ {{rating}}</span>
        </div>
      </div>
    </div>
    <div class="pricing">{{price}}</div>
    <div class="desc">{{description}}</div>
  </div>
</body>
</html>`,
  },
  job_board: {
    name: "Job Board",
    type: "listing_detail",
    schemaType: "JobPosting",
    urlPattern: "/job/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} at {{company}} — Jobs</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#fefce8;color:#1c1917}
    .container{max-width:700px;margin:3rem auto;padding:0 2rem}
    .card{background:white;border-radius:12px;padding:2rem;border:1px solid #e7e5e4}
    h1{font-size:1.5rem;margin-bottom:0.5rem}
    .company{font-size:1.1rem;color:#a16207;font-weight:600;margin-bottom:1rem}
    .pills{display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
    .pill{background:#fef3c7;color:#92400e;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.75rem;font-weight:500}
    .desc{line-height:1.8;color:#44403c}
    .apply{display:inline-block;margin-top:1.5rem;background:#ca8a04;color:white;padding:0.75rem 2rem;border-radius:8px;text-decoration:none;font-weight:600}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>{{title}}</h1>
      <div class="company">{{company}}</div>
      <div class="pills">
        <span class="pill">📍 {{location}}</span>
        <span class="pill">{{category}}</span>
        <span class="pill">{{price}}</span>
      </div>
      <div class="desc">{{description}}</div>
      <a href="{{url}}" class="apply">Apply Now →</a>
    </div>
  </div>
</body>
</html>`,
  },
  best_x_in_y: {
    name: "Best X in Y (pSEO)",
    type: "best_x_in_y",
    schemaType: "Article",
    urlPattern: "/best-{{category}}-in-{{location}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Best {{category}} in {{location}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#fff;color:#1a1a2e}
    .hero{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:4rem 2rem;text-align:center}
    .hero h1{font-size:2.5rem;margin-bottom:0.5rem}
    .hero p{opacity:0.9;font-size:1.1rem}
    .container{max-width:800px;margin:0 auto;padding:2rem}
    .item{background:#f8fafc;border-radius:12px;padding:1.5rem;margin-bottom:1rem;display:flex;gap:1.5rem;border:1px solid #e2e8f0}
    .item img{width:120px;height:120px;border-radius:8px;object-fit:cover}
    .item h3{font-size:1.1rem;margin-bottom:0.25rem}
    .item .meta{color:#64748b;font-size:0.8rem;margin-bottom:0.5rem}
    .item .desc{font-size:0.9rem;color:#475569;line-height:1.6}
    .rating{color:#f59e0b;font-weight:700}
  </style>
</head>
<body>
  <div class="hero">
    <h1>Best {{category}} in {{location}}</h1>
    <p>Top-rated {{category}} options reviewed and compared</p>
  </div>
  <div class="container">
    <div class="item">
      <img src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400'" />
      <div>
        <h3>{{title}}</h3>
        <div class="meta"><span class="rating">⭐ {{rating}}</span> · {{price}} · {{location}}</div>
        <div class="desc">{{description}}</div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  glossary: {
    name: "Glossary / Wiki",
    type: "glossary",
    schemaType: "Article",
    urlPattern: "/glossary/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Glossary</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Georgia,serif;background:#fffbeb;color:#292524}
    .container{max-width:680px;margin:3rem auto;padding:0 2rem}
    .back{color:#a16207;text-decoration:none;font-size:0.875rem;display:inline-block;margin-bottom:2rem}
    h1{font-size:2rem;border-bottom:2px solid #fbbf24;padding-bottom:0.75rem;margin-bottom:1.5rem}
    .category{background:#fef3c7;color:#92400e;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.75rem;font-weight:600;display:inline-block;margin-bottom:1rem}
    .content{line-height:2;font-size:1.05rem;color:#44403c}
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back">← Back to Glossary</a>
    <h1>{{title}}</h1>
    <span class="category">{{category}}</span>
    <div class="content">{{description}}</div>
  </div>
</body>
</html>`,
  },
  category_hub: {
    name: "Category Hub Page",
    type: "category_page",
    schemaType: "CollectionPage",
    urlPattern: "/category/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Category</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a}
    .hero{background:#0f172a;color:white;padding:3rem 2rem;text-align:center}
    .hero h1{font-size:2rem}
    .hero p{color:#94a3b8;margin-top:0.5rem}
    .container{max-width:1000px;margin:0 auto;padding:2rem}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .card{background:white;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;transition:transform 0.2s}
    .card:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,0.08)}
    .card img{width:100%;height:180px;object-fit:cover}
    .card-body{padding:1.25rem}
    .card h3{font-size:1rem;margin-bottom:0.25rem}
    .card .meta{color:#64748b;font-size:0.8rem}
  </style>
</head>
<body>
  <div class="hero">
    <h1>{{title}}</h1>
    <p>{{description}}</p>
  </div>
  <div class="container">
    <div class="grid">
      <div class="card">
        <img src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'" />
        <div class="card-body">
          <h3>{{title}}</h3>
          <div class="meta">{{location}} · ⭐ {{rating}}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  hotel_ldp: {
    name: "Hotel LDP (Detail Page)",
    type: "listing_detail",
    schemaType: "Hotel",
    urlPattern: "/hotel/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{hotel_name}} — Hotels Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f4f4f4;color:#1e293b}
    .header{background:#1e293b;color:white;padding:1rem 2rem}
    .header a{color:white;text-decoration:none;opacity:0.7}
    .container{max-width:1200px;margin:0 auto;padding:2rem}
    .hero-img{width:100%;max-width:900px;height:auto;border-radius:15px;box-shadow:0 4px 8px rgba(0,0,0,0.1);display:block;margin:0 auto 2rem}
    h1{font-size:2.5rem;font-weight:bold;text-align:center;margin-bottom:0.5rem}
    .location{text-align:center;color:#777;font-size:1.25rem;margin-bottom:2rem}
    .rating-box{display:flex;justify-content:center;align-items:center;gap:1rem;margin-bottom:2rem}
    .rating-big{font-size:3rem;font-weight:600;color:#303a9e}
    .rating-sub{font-size:1rem;color:#888}
    .details-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem;margin-bottom:3rem;text-align:center}
    .detail-item h3{font-size:1.1rem;font-weight:600;color:#555;margin-bottom:0.25rem}
    .detail-item p{font-size:1rem;color:#444}
    .section{max-width:900px;margin:0 auto 2.5rem}
    .section h3{font-size:1.25rem;font-weight:600;color:#303a9e;margin-bottom:0.75rem}
    .section p{font-size:1rem;color:#555;line-height:1.8}
    .cta{display:inline-block;background:#303a9e;color:white;padding:0.875rem 2rem;border-radius:50px;text-decoration:none;font-weight:600;font-size:1.1rem}
    .cta:hover{opacity:0.9}
    .footer{text-align:center;padding:2rem;color:#94a3b8;font-size:0.8rem;border-top:1px solid #e2e8f0}
  </style>
</head>
<body>
  <div class="header"><a href="/">← Home</a> &nbsp; <strong>Hotels</strong></div>
  <div class="container">
    <h1>{{hotel_name}}</h1>
    <p class="location">{{address}}, {{country}}</p>
    <img class="hero-img" src="{{photo_url}}" alt="{{hotel_name}}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900'" />
    <div class="rating-box">
      <span class="rating-big">{{rating}} / 5</span>
      <span class="rating-sub">based on {{number_of_reviews}} reviews</span>
    </div>
    <div class="details-grid">
      <div class="detail-item"><h3>💰 Price per Night</h3><p>\${{price_per_night}} USD</p></div>
      <div class="detail-item"><h3>⭐ Hotel Stars</h3><p>{{stars}} Stars</p></div>
      <div class="detail-item"><h3>🗣️ Languages</h3><p>{{languages_spoken}}</p></div>
      <div class="detail-item"><h3>🛎️ Services</h3><p>{{hotel_services}}</p></div>
    </div>
    <div class="section">
      <h3>🏊 Property Amenities</h3>
      <p>{{amenities}}</p>
    </div>
    <div class="section">
      <h3>ℹ️ About</h3>
      <p>{{description}}</p>
    </div>
    <div style="text-align:center;margin-bottom:3rem">
      <a class="cta" href="{{url}}">Visit Hotel Website</a>
    </div>
  </div>
  <div class="footer">© Hotels Directory</div>
</body>
</html>`,
  },
  hotel_srp: {
    name: "Hotel SRP (Search Results)",
    type: "search_results",
    schemaType: "CollectionPage",
    urlPattern: "/hotels/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Hotels</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f8fafc;color:#1e293b}
    .header{background:#1e293b;color:white;padding:1.5rem 2rem}
    .header a{color:white;text-decoration:none;opacity:0.7}
    .container{max-width:1000px;margin:0 auto;padding:2rem}
    .hero{background:linear-gradient(135deg,#303a9e,#5b4fe0);color:white;padding:3rem 2rem;text-align:center;border-radius:15px;margin-bottom:2rem}
    .hero h1{font-size:2.25rem;margin-bottom:0.5rem}
    .hero p{opacity:0.9;font-size:1.1rem}
    .stats{display:flex;justify-content:center;gap:2rem;margin-bottom:2rem}
    .stat{text-align:center}
    .stat .num{font-size:1.75rem;font-weight:700;color:#303a9e}
    .stat .label{font-size:0.8rem;color:#64748b}
    .listing{display:flex;gap:1.5rem;padding:1.5rem;background:white;border-radius:12px;margin-bottom:1rem;border:1px solid #e2e8f0;transition:box-shadow 0.2s}
    .listing:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08)}
    .listing img{width:200px;height:150px;object-fit:cover;border-radius:8px;flex-shrink:0}
    .listing h3{font-size:1.1rem;margin-bottom:0.25rem}
    .listing .meta{color:#64748b;font-size:0.85rem;margin-bottom:0.5rem}
    .listing .price{color:#303a9e;font-weight:700;font-size:1.1rem}
    .listing .rating{color:#f59e0b}
    .listing .btn{display:inline-block;margin-top:0.75rem;background:#303a9e;color:white;padding:0.5rem 1.25rem;border-radius:6px;text-decoration:none;font-size:0.85rem}
    .footer{text-align:center;padding:2rem;color:#94a3b8;font-size:0.8rem}
    @media(max-width:640px){.listing{flex-direction:column}.listing img{width:100%;height:200px}}
  </style>
</head>
<body>
  <div class="header"><a href="/">← Home</a> &nbsp; <strong>Hotels</strong></div>
  <div class="container">
    <div class="hero">
      <h1>{{title}}</h1>
      <p>{{description}}</p>
    </div>
    <div class="stats">
      <div class="stat"><div class="num">{{category}}</div><div class="label">Category</div></div>
      <div class="stat"><div class="num">{{location}}</div><div class="label">Location</div></div>
    </div>
    <div class="listing">
      <img src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'" />
      <div>
        <h3>{{title}}</h3>
        <div class="meta">📍 {{location}} · <span class="rating">⭐ {{rating}}</span></div>
        <div class="price">{{price}}</div>
        <p style="font-size:0.9rem;color:#475569;margin-top:0.5rem;line-height:1.6">{{description}}</p>
        <a class="btn" href="{{url}}">View Details →</a>
      </div>
    </div>
  </div>
  <div class="footer">© Hotels Directory</div>
</body>
</html>`,
  },
  category_srp: {
    name: "Category SRP (Directory)",
    type: "category_page",
    schemaType: "CollectionPage",
    urlPattern: "/category/{{slug}}",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} — Directory</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;background:#f1f5f9;color:#0f172a}
    .header{background:#0f172a;color:white;padding:1.5rem 2rem;display:flex;align-items:center;gap:1rem}
    .header a{color:white;text-decoration:none;opacity:0.7}
    .hero{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:white;padding:4rem 2rem;text-align:center}
    .hero h1{font-size:2.5rem;margin-bottom:0.5rem}
    .hero p{opacity:0.85;font-size:1.15rem;max-width:600px;margin:0 auto}
    .breadcrumb{padding:1rem 2rem;font-size:0.8rem;color:#64748b;max-width:1200px;margin:0 auto}
    .breadcrumb a{color:#303a9e;text-decoration:none}
    .container{max-width:1200px;margin:0 auto;padding:0 2rem 3rem}
    .filter-bar{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap}
    .filter-bar span{background:white;border:1px solid #e2e8f0;padding:0.5rem 1rem;border-radius:20px;font-size:0.8rem;cursor:pointer}
    .filter-bar span:hover{background:#e2e8f0}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem}
    .card{background:white;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;transition:transform 0.2s,box-shadow 0.2s}
    .card:hover{transform:translateY(-3px);box-shadow:0 8px 25px rgba(0,0,0,0.1)}
    .card img{width:100%;height:200px;object-fit:cover}
    .card-body{padding:1.25rem}
    .card h3{font-size:1rem;margin-bottom:0.25rem}
    .card .meta{color:#64748b;font-size:0.8rem;margin-bottom:0.5rem}
    .card .price{color:#303a9e;font-weight:700;font-size:1rem}
    .card .rating{color:#f59e0b;font-weight:600}
    .card .btn{display:inline-block;margin-top:0.75rem;background:#303a9e;color:white;padding:0.4rem 1rem;border-radius:6px;text-decoration:none;font-size:0.8rem}
    .pagination{display:flex;justify-content:center;gap:0.5rem;margin-top:2rem}
    .pagination a{padding:0.5rem 1rem;border:1px solid #e2e8f0;border-radius:6px;text-decoration:none;color:#0f172a;font-size:0.875rem}
    .pagination a.active{background:#303a9e;color:white;border-color:#303a9e}
    .footer{text-align:center;padding:2rem;color:#94a3b8;font-size:0.8rem;border-top:1px solid #e2e8f0}
  </style>
</head>
<body>
  <div class="header"><a href="/">← Home</a> <strong>{{category}} — Directory</strong></div>
  <div class="hero">
    <h1>{{title}}</h1>
    <p>Browse all listings in {{category}}{{location ? " in " + location : ""}}</p>
  </div>
  <div class="breadcrumb"><a href="/">Home</a> › <a href="/categories/">Categories</a> › {{category}}</div>
  <div class="container">
    <div class="grid">
      <div class="card">
        <img src="{{image}}" alt="{{title}}" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'" />
        <div class="card-body">
          <h3>{{title}}</h3>
          <div class="meta">📍 {{location}} · <span class="rating">⭐ {{rating}}</span></div>
          <div class="price">{{price}}</div>
          <a class="btn" href="{{url}}">View Details →</a>
        </div>
      </div>
    </div>
  </div>
  <div class="footer">© Directory</div>
</body>
</html>`,
  },
};

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,sans-serif;line-height:1.6;color:#1a1a2e;background:#fafafa}
    .container{max-width:800px;margin:0 auto;padding:2rem}
    .card{background:white;border-radius:12px;padding:2rem;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    h1{font-size:2rem;margin-bottom:1rem}
    .meta{color:#666;font-size:0.875rem;margin-bottom:1rem}
    .description{font-size:1rem;line-height:1.8}
    img{max-width:100%;border-radius:8px;margin:1rem 0}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>{{title}}</h1>
      <div class="meta">{{category}} · {{location}}</div>
      <img src="{{image}}" alt="{{title}}" />
      <div class="description">{{description}}</div>
    </div>
  </div>
</body>
</html>`;

interface FilterRule {
  variable: string;
  operator: "contains" | "equals" | "not_contains";
  value: string;
  matchScope?: "any" | "all" | "specific";
  matchVariables?: string[];
}

export default function TemplatesTab({ projectId, projectMode }: TemplatesTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [configTemplateId, setConfigTemplateId] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ["templates", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .or(`project_id.eq.${projectId},is_builtin.eq.true`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ["data-sources", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_sources")
        .select("cached_data")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  const { data: existingPages = [] } = useQuery({
    queryKey: ["pages", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("slug, template_id")
        .eq("project_id", projectId);
      if (error) throw error;
      return data;
    },
  });

  const allDataRows: any[] = [];
  for (const ds of dataSources) {
    if (Array.isArray(ds.cached_data)) allDataRows.push(...(ds.cached_data as any[]));
  }
  const totalDataRows = allDataRows.length;

  const allVariables: string[] = [];
  for (const ds of dataSources) {
    if (Array.isArray(ds.cached_data) && (ds.cached_data as any[]).length > 0) {
      for (const row of (ds.cached_data as any[])) {
        for (const k of Object.keys(row)) {
          if (!allVariables.includes(k)) allVariables.push(k);
        }
      }
    }
  }

  const createTemplate = useMutation({
    mutationFn: async ({ name, template_type, html, urlPattern, schemaType }: { name: string; template_type: TemplateType; html?: string; urlPattern?: string; schemaType?: string }) => {
      const { error } = await supabase.from("templates").insert({
        project_id: projectId,
        user_id: user!.id,
        name,
        template_type,
        html_content: html || DEFAULT_HTML,
        url_pattern: urlPattern || "/{{slug}}",
        meta_title_pattern: "{{title}} — {{site_name}}",
        meta_description_pattern: "{{description}}",
        schema_type: schemaType || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      setCreateOpen(false);
      setLibraryOpen(false);
      toast({ title: "Template created!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (t: any) => {
      const { error } = await supabase.from("templates").insert({
        project_id: projectId,
        user_id: user!.id,
        name: `${t.name} (Copy)`,
        template_type: t.template_type,
        html_content: t.html_content,
        css_content: t.css_content,
        url_pattern: t.url_pattern,
        meta_title_pattern: t.meta_title_pattern,
        meta_description_pattern: t.meta_description_pattern,
        schema_type: t.schema_type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      toast({ title: "Template duplicated" });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      toast({ title: "Template deleted" });
    },
  });

  const updateTemplateConfig = useMutation({
    mutationFn: async ({ id, generation_mode, split_column, combo_columns, filter_rules }: any) => {
      const { error } = await supabase.from("templates").update({
        generation_mode,
        split_column,
        combo_columns,
        filter_rules,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
      toast({ title: "Generation config saved!" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createTemplate.mutate({
      name: form.get("name") as string,
      template_type: (form.get("template_type") as TemplateType) || "custom",
    });
  };

  const editingTemplate = editingId ? templates.find((t) => t.id === editingId) : null;

  if (editingTemplate) {
    return <TemplateEditor template={editingTemplate} projectId={projectId} onBack={() => setEditingId(null)} />;
  }

  const relevantBuiltins = Object.entries(BUILTIN_TEMPLATES).filter(([key]) => {
    if (projectMode === "pseo") return ["best_x_in_y", "glossary", "category_hub", "category_srp"].includes(key);
    if (projectMode === "directory") return ["business_directory", "saas_directory", "job_board", "category_hub", "hotel_ldp", "hotel_srp", "category_srp"].includes(key);
    return true; // hybrid shows all
  });

  const configTemplate = configTemplateId ? templates.find(t => t.id === configTemplateId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-semibold">Templates</h3>
          <p className="text-sm text-muted-foreground">
            HTML templates with {"{{variable}}"} injection · <strong>{totalDataRows} data rows</strong> available for page generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={async () => {
            // Load sample: create data source + 3 templates (LDP, SRP, Category SRP)
            try {
              // 1. Create sample data source if none exists
              const { data: existingSources } = await supabase.from("data_sources").select("id").eq("project_id", projectId).eq("name", SAMPLE_DATA_SOURCE_NAME);
              if (!existingSources || existingSources.length === 0) {
                await supabase.from("data_sources").insert({
                  project_id: projectId,
                  name: SAMPLE_DATA_SOURCE_NAME,
                  source_type: "csv" as any,
                  config: { manual: true, sample: true } as any,
                  cached_data: SAMPLE_HOTEL_DATA as any,
                  last_synced_at: new Date().toISOString(),
                });
              }
              // 2. Create 3 sample templates
              const sampleTemplates = [
                { key: "hotel_ldp", label: "Hotel Detail Page (LDP)" },
                { key: "hotel_srp", label: "Hotels Search Results (SRP)" },
                { key: "category_srp", label: "Category Directory (SRP)" },
              ];
              for (const st of sampleTemplates) {
                const builtin = BUILTIN_TEMPLATES[st.key];
                if (builtin) {
                  await supabase.from("templates").insert({
                    project_id: projectId,
                    user_id: user!.id,
                    name: builtin.name,
                    template_type: builtin.type,
                    html_content: builtin.html,
                    url_pattern: builtin.urlPattern,
                    schema_type: builtin.schemaType,
                    meta_title_pattern: "{{title}} — {{site_name}}",
                    meta_description_pattern: "{{description}}",
                  });
                }
              }
              queryClient.invalidateQueries({ queryKey: ["templates", projectId] });
              queryClient.invalidateQueries({ queryKey: ["data-sources", projectId] });
              toast({ title: "Sample loaded!", description: "8 hotel rows + 3 templates (LDP, SRP, Category SRP) added." });
            } catch (err: any) {
              toast({ title: "Error loading sample", description: err.message, variant: "destructive" });
            }
          }}>
            <Sparkles className="h-4 w-4 mr-1" /> Load Sample
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
            <BookTemplate className="h-4 w-4 mr-1" /> Library
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Custom</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create Custom Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input name="name" required placeholder="My Template" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select name="template_type" defaultValue="custom">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TEMPLATE_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createTemplate.isPending}>Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Available Variables */}
      {allVariables.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Available Variables ({allVariables.length})</CardTitle>
            <CardDescription className="text-xs">These variables from your data sources can be used in templates as {"{{variable}}"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[12rem] overflow-auto">
              <div className="flex flex-wrap gap-1.5">
                {allVariables.map((v) => (
                  <code key={v} className="text-xs bg-muted px-2 py-1 rounded font-mono">{`{{${v}}}`}</code>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Library Dialog */}
      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Template Library</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Pre-built templates for {projectMode} mode. Click to add to your project.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            {relevantBuiltins.map(([key, t]) => (
              <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => createTemplate.mutate({ name: t.name, template_type: t.type, html: t.html, urlPattern: t.urlPattern, schemaType: t.schemaType })}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <CardDescription className="text-xs">{TEMPLATE_LABELS[t.type]} · {t.schemaType}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="secondary" className="text-xs">{t.urlPattern}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Generation Config Dialog */}
      <GenerationConfigDialog
        template={configTemplate}
        variables={allVariables}
        open={!!configTemplateId}
        onOpenChange={(open) => { if (!open) setConfigTemplateId(null); }}
        onSave={(config) => updateTemplateConfig.mutate({ id: configTemplateId, ...config })}
        saving={updateTemplateConfig.isPending}
      />

      {/* Template cards */}
      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No templates yet</h3>
            <p className="text-muted-foreground mb-4">Use the Library for pre-built templates or create a custom one.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLibraryOpen(true)}>
                <BookTemplate className="h-4 w-4 mr-1" /> Browse Library
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Custom
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => {
            const genMode = (t as any).generation_mode || "normal";
            const filterRules = (t as any).filter_rules as FilterRule[] | null;
            return (
              <Card key={t.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{t.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{TEMPLATE_LABELS[t.template_type]}</Badge>
                        {t.schema_type && <Badge variant="outline" className="text-xs">{t.schema_type}</Badge>}
                        {genMode !== "normal" && (
                          <Badge variant="outline" className="text-xs bg-accent/10 text-accent">
                            {genMode === "split" ? "Split" : "Combo"}
                          </Badge>
                        )}
                        {filterRules && filterRules.length > 0 && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                            {filterRules.length} filter{filterRules.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                        <span className="text-xs">v{t.version}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const existingSlugs = new Set(existingPages.filter(p => p.template_id === t.id).map(p => p.slug));
                      const uniqueNewRows = allDataRows.filter(row => {
                        const title = row.title || row.name || row.Name || row.Title || Object.values(row).find((v) => typeof v === "string" && (v as string).trim()) || "Untitled";
                        const slug = (row.slug || String(title)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                        return !existingSlugs.has(slug);
                      });
                      const existing = existingPages.filter(p => p.template_id === t.id).length;
                      return <>Can generate <strong>{uniqueNewRows.length}</strong> new pages{existing > 0 && <> · {existing} already generated</>}</>;
                    })()}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(t.id)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" title="Generation Config" onClick={() => setConfigTemplateId(t.id)}>
                      <Filter className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => duplicateTemplate.mutate(t)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    {!t.is_builtin && (
                      <Button size="sm" variant="ghost" onClick={() => deleteTemplate.mutate(t.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Generation Config Dialog Component
function GenerationConfigDialog({
  template,
  variables,
  open,
  onOpenChange,
  onSave,
  saving,
}: {
  template: any;
  variables: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: any) => void;
  saving: boolean;
}) {
  const [mode, setMode] = useState<string>("normal");
  const [splitColumn, setSplitColumn] = useState("");
  const [comboCol1, setComboCol1] = useState("");
  const [comboCol2, setComboCol2] = useState("");
  const [filters, setFilters] = useState<FilterRule[]>([]);

  // Sync state when template changes
  useEffect(() => {
    if (template) {
      setMode((template as any).generation_mode || "normal");
      setSplitColumn((template as any).split_column || "");
      const cc = (template as any).combo_columns;
      if (Array.isArray(cc) && cc.length >= 2) {
        setComboCol1(cc[0]);
        setComboCol2(cc[1]);
      } else {
        setComboCol1("");
        setComboCol2("");
      }
      const fr = (template as any).filter_rules;
      if (Array.isArray(fr)) setFilters(fr);
      else setFilters([]);
    }
  }, [template]);

  const addFilter = () => {
    setFilters([...filters, { variable: variables[0] || "", operator: "contains", value: "", matchScope: "any" }]);
  };

  const removeFilter = (i: number) => {
    setFilters(filters.filter((_, idx) => idx !== i));
  };

  const updateFilter = (i: number, field: keyof FilterRule, value: any) => {
    const updated = [...filters];
    updated[i] = { ...updated[i], [field]: value };
    setFilters(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Generation Config</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generation Mode */}
          <div className="space-y-2">
            <Label>Generation Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal — one page per data row</SelectItem>
                <SelectItem value="split">Split — split comma values into separate pages</SelectItem>
                <SelectItem value="combo">Combo — cartesian product of two columns</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {mode === "normal" && "Each data row generates one page."}
              {mode === "split" && "Comma-separated values in a column generate separate pages. e.g., 'Cheap,Exclusive' → 2 pages."}
              {mode === "combo" && "Generates pages for every combination of two columns. e.g., category × location."}
            </p>
          </div>

          {mode === "split" && (
            <div className="space-y-2">
              <Label>Column to Split</Label>
              <Select value={splitColumn} onValueChange={setSplitColumn}>
                <SelectTrigger><SelectValue placeholder="Select column..." /></SelectTrigger>
                <SelectContent>
                  {variables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Rows with comma-separated values in this column will generate one page per value.</p>
            </div>
          )}

          {mode === "combo" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Column A (e.g., category)</Label>
                <Select value={comboCol1} onValueChange={setComboCol1}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {variables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Column B (e.g., location)</Label>
                <Select value={comboCol2} onValueChange={setComboCol2}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {variables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground col-span-2">Generates one page for every unique combination of values from both columns. Comma-separated values are also split.</p>
            </div>
          )}

          {/* Filter Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Data Filters</Label>
              <Button variant="outline" size="sm" onClick={addFilter}>
                <Plus className="h-3 w-3 mr-1" /> Add Filter
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Only generate pages for rows matching these conditions. Use commas to match multiple values (e.g., "data,frontend" matches either).
            </p>

            {filters.length > 0 && (
              <div className="space-y-3">
                {filters.map((f, i) => (
                  <div key={i} className="space-y-2 border rounded-lg p-3 bg-muted/20">
                    <div className="flex gap-2 items-center">
                      <Select value={f.variable} onValueChange={(v) => updateFilter(i, "variable", v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {variables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={f.operator} onValueChange={(v) => updateFilter(i, "operator", v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">contains</SelectItem>
                          <SelectItem value="equals">equals</SelectItem>
                          <SelectItem value="not_contains">not contains</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={f.value} onChange={(e) => updateFilter(i, "value", e.target.value)} placeholder="value1,value2,..." className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => removeFilter(i)} className="h-8 w-8 shrink-0">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    {/* Match scope */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Search in:</Label>
                      <Select value={f.matchScope || "any"} onValueChange={(v) => updateFilter(i, "matchScope", v)}>
                        <SelectTrigger className="h-7 w-auto text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any variable (match in any column)</SelectItem>
                          <SelectItem value="all">All variables (match in every column)</SelectItem>
                          <SelectItem value="specific">This variable only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => onSave({
              generation_mode: mode,
              split_column: mode === "split" ? splitColumn : null,
              combo_columns: mode === "combo" ? [comboCol1, comboCol2] : null,
              filter_rules: filters.length > 0 ? filters : null,
            })}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Config"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
