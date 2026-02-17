

# pSEO & Directory Site Generator — Full Build Plan

## Overview
A multi-user platform where users create SEO-optimized directory and programmatic SEO websites by connecting Google Sheets (or CSV). Features custom HTML templates with Monaco editor, live preview, static HTML export, sitemap generation, and separated pSEO vs Directory workflows.

---

## Phase 1: Foundation & Auth
- **User Authentication** — Sign up, login, password reset via Supabase Auth
- **User Profiles** — Store display name, avatar
- **Dashboard Home** — Clean admin panel showing all user's projects with create/archive/duplicate actions

## Phase 2: Project CRUD & Data Sources
- **Project Management** — Create, edit, duplicate, archive, delete projects. Each project = one website/directory
- **Project Settings** — Site name, custom colors, logo upload, fonts, header/footer content, custom domain slug
- **Data Source Manager (per project)** — Connect multiple data sources:
  - **CSV Upload** — Upload CSV files directly
  - **Published Sheet URL** — Paste public Google Sheets URL, auto-fetch as CSV/JSON
  - **Google Sheets OAuth API** — Authenticate via Google to access private sheets (edge function handles API calls)
  - **Apps Script Webhook** — Provide webhook endpoint URL; edge function receives data pushes
- **Data Merge** — Combine data from multiple sheets/CSVs into one dataset
- **Manual Data Entry** — Add/edit rows manually for small datasets
- **Column Mapping UI** — Auto-detect columns, drag-and-drop mapper to assign columns to template fields
- **Data Preview** — Table view of imported data before page generation

## Phase 3: Mode Selection — pSEO vs Directory vs Hybrid
Each project chooses a mode that determines available page types:

### pSEO Mode
- "Best X in Y" landing page generator (pattern-based from data)
- Comparison pages (X vs Y vs Z)
- Location-modifier pages ("X in [City]")
- Glossary/definition pages
- Focus: Generate 100s–1000s of pages at scale

### Directory Mode
- **Listing Detail Pages** — Individual rich pages per row (business/product)
- **Category Detail Pages** — Hub pages grouping listings by category with description
- **Search Result Pages** — Filterable listings with SEO-friendly URLs
- **Location Pages** — Geographic hub pages with local SEO

### Hybrid Mode
- Combines both: directory listings + programmatic landing pages

## Phase 4: Template System & Custom HTML
- **Built-in Templates** per mode:
  - Business/Local Directory, SaaS/Tool Directory, Job Board, "Best X in Y", Glossary
- **3 Design Styles** per template: Clean & Minimal, Data-Dense, Modern SaaS
- **Custom HTML Editor** — Monaco editor with `{{column_name}}` variable injection
- **Template CRUD** — Save, edit, delete, duplicate custom templates; import/export between projects
- **Template Library** — Browse built-in + user-created templates
- **Custom URL Patterns** — Define URL slug structure per template (e.g., `/best-{{category}}-in-{{city}}`)
- **Template Version History**

## Phase 5: Page Generation & Management
- **Auto-Generate Pages** — From data + templates, create individual detail pages, category pages, location pages, tag pages
- **Page-Level CRUD**:
  - Bulk create from sheet import
  - Edit individual pages (override sheet data)
  - Delete/blacklist specific rows
  - Draft/unpublish mode per page
- **Live Preview** — Preview button to see rendered page in-browser before exporting
- **Custom URL per page** — Override auto-generated slugs

## Phase 6: SEO Engine
- **Meta Tags & OG** — Auto-generate titles, descriptions, OG tags from customizable patterns (e.g., "Best {category} in {city} — {site_name}")
- **SERP Preview** — See how pages look in Google search results
- **XML Sitemap Generation** — Auto-generate and export sitemap.xml
- **JSON-LD Structured Data** — Auto-add schema markup (LocalBusiness, Product, JobPosting, etc.) based on template type
- **Internal Linking** — Auto-link related entries, categories, locations
- **Breadcrumb Navigation** — Auto-generated breadcrumbs on all pages

## Phase 7: Frontend Features (Generated Sites)
- **Search & Filtering** — Full-text search, filter by category/location/tags/rating/price, sort options
- **Responsive Design** — Desktop, tablet, mobile layouts
- **Grid/List View Toggle**
- **Custom Branding** — Colors, logo, fonts, site name applied to generated pages

## Phase 8: Export & Sharing
- **Static HTML Export** — Download ZIP with all generated HTML pages, assets, CSS
- **Sitemap Export** — Download XML sitemap separately
- **JSON Export** — Export page data as JSON
- **Public URL Sharing** — Share generated directory via public preview URL

## Phase 9: Data Sync & Automation
- **Manual Refresh** — Button to re-fetch latest data from connected sheet
- **Auto-Sync Schedule** — Configurable sync interval
- **Webhook Real-Time Push** — Instant updates via Apps Script webhook
- **Sheet Version Switching** — Switch between different versions of connected data

---

## Backend (Supabase / Lovable Cloud)
- **Auth** — User signup/login/password reset
- **Database** — Projects, templates, pages, data sources, cached sheet data, user profiles, roles
- **Edge Functions** — Google Sheets API proxy, webhook receiver, CSV parser, HTML generation
- **Storage** — Uploaded logos, images, exported ZIP files

