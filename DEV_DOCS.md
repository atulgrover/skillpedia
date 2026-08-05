# SkillPedia - Developer Documentation & Session Memory

> **Last Updated**: August 5, 2026  
> **Project Name**: SkillPedia - National Skill Video Portal (PWA)  
> **Live Production URL**: [https://skillpedia-aas.pages.dev](https://skillpedia-aas.pages.dev)  
> **Cloudflare Pages Project**: `skillpedia-aas`  
> **Cloudflare Account ID**: `f0b9b9d65437d2ef1c98d46b1c33337b`

---

## 📌 Executive Summary
SkillPedia is a **Progressive Web App (PWA)** designed for students across India to explore National Skills Qualifications Framework (NSQF) Qualification Packs (QPs) through micro-learning video reels, performance criteria (PC) checklists, and interactive skill assessments.

---

## 🛠️ Completed Components & Architecture

### 1. Brand & Logo System
- **Artwork**: Hayagriva line art drawing holding tools with *"HAYAGRIVA skilled-craftsman"* text.
- **Transparency**: Background removed with smooth anti-aliased alpha transparency.
- **Dual Theme Support**:
  - `AAS/logo_dark.png` & `logo_dark_base64.txt`: White lines & text on transparent background for Dark Mode (`#07090e`).
  - `AAS/logo_light.png` & `logo_light_base64.txt`: Dark lines & text on transparent background for Light Mode (`#f8fafc`).
  - Responsive sizing on mobile portrait: `width: min(350px, 88vw)`.

### 2. Standalone Skill Reel Viewer (`/AAS/index.html`)
- Dedicated viewer for **`AAS/Q0103` (Airline Cargo Assistant v3.0)**.
- 15 embedded YouTube video lessons mapped to NOS codes (`AAS/N0101`, `AAS/N0102`, `AAS/N0502`, `AAS/N0702`).
- Collapsible Performance Criteria (PC) accordions with YouTube app deep-linking icons.

### 3. PWA Portal Shell (`/index.html`)
- **PWA Capabilities**:
  - `manifest.json`: Web App Manifest configured for standalone display, dark theme, and icons.
  - `sw.js`: Service worker implementing stale-while-revalidate caching for offline shell access.
  - `pwaBanner`: Install App prompt banner listening for `beforeinstallprompt`.
- **Desktop / Laptop Dashboard Layout (1024px+)**:
  - Top Glassmorphism Navbar: Brand logo, title, search, category filters, theme toggle (`🌙`/`☀️`), and PWA Install CTA.
  - Hero Search & Category Pills (`All`, `Aerospace`, `Automotive`, `Healthcare`, `IT-ITeS`).
  - 4-Column responsive grid of QP cards.
  - Side Inspector Drawer (`#sideInspector`): Live side-by-side video preview & PC self-assessment checklist without leaving the page.
- **Mobile Phone Layout (320px - 480px)**:
  - Fits `100dvh` mobile screen with native status bar colors.
  - Touch-friendly Bottom App Bar (`🏠 Home` | `🔍 Explore` | `🎬 Reels` | `⚙️ Theme`).

---

### 4. 11-Reel Standardized Architecture, AI Synthesizer & Employer Portal
- **Standardized 11-Reel Schemas (`js/schemas.js`)**: All NSQF and custom curricula formatted into exactly 11 video reels with step-by-step Performance Criteria (PCs).
- **Safety & Content Moderation (`js/contentFilter.js`)**: 4-tier guardrails including prompt keyword sanitization, AI safety instructions, YouTube SafeSearch API, and community 🚩 content reporting.
- **Turso Edge Database & IndexedDB (`js/tursoClient.js`)**: Cloud-synced Turso Edge DB queries with offline IndexedDB fallback.
- **Employer Auth & Session Manager (`js/auth.js`)**: Authenticated employer accounts to create and manage custom 11-reel packages; guest access for employees and students.
- **Custom AI 11-Reel Engine (`js/aiEngine.js`)**: Generates 11-reel NSQF-style curricula for custom learning needs (e.g. *"Baking a Cake"*).
- **Standardized Reel Viewer (`js/reelViewer.js`)**: Interactive 11-step progress tracker, PC checklists with `localStorage` memory, employer branding banners, and PWA phone shortcut links.

---

## 📁 Repository Directory Structure

```
skillpedia/
├── index.html            # Main PWA Portal Shell (3 Sections: NSQF, AI Generator, Employer Portal)
├── manifest.json         # PWA Manifest Configuration (Standalone Mode & Deep Links)
├── sw.js                 # Service Worker v2 (Stale-While-Revalidate & Offline Shell Cache)
├── DEV_DOCS.md           # Developer Documentation & Session Memory
├── css/
│   └── portal.css        # Glassmorphism, 11-Reel Progress Pills, Nav Tabs, Modals
├── js/
│   ├── app.js            # Section Controller, Search/Filter, Share Links & Deep-Link Parser
│   ├── schemas.js        # Standardized 11-Reel Curriculum & Package Data Validators
│   ├── contentFilter.js  # Tier 1 Safety Guardrails & Blacklist Filter
│   ├── tursoClient.js    # Turso Edge DB Client & IndexedDB Caching
│   ├── auth.js           # Employer Auth & User Session Manager
│   ├── aiEngine.js       # Standard 11-Reel AI Curriculum Engine
│   ├── reelViewer.js     # Standardized 11-Reel Viewer Component & Safety Reporting
│   └── mockData.js       # Representative QPs Database (AAS/Q0103, ASC/Q1402, HSS/Q5101, SSC/Q0501)
├── AAS/
│   ├── index.html        # AAS/Q0103 Standalone Reel Page
│   ├── build_skill_reels.py # Generator script for AAS reels page
│   ├── logo_dark.png     # Hayagriva Dark Mode Transparent Logo
│   ├── logo_light.png    # Hayagriva Light Mode Transparent Logo
│   ├── logo_dark_base64.txt
│   └── logo_light_base64.txt
└── .agents/
    └── AGENTS.md         # Workspace Rules & Context Memory
```

---

## 🚀 Deployment Command

To deploy updates to Cloudflare Pages:

```bash
CLOUDFLARE_API_TOKEN="<YOUR_CLOUDFLARE_API_TOKEN>" \
CLOUDFLARE_ACCOUNT_ID="f0b9b9d65437d2ef1c98d46b1c33337b" \
npx wrangler pages deploy /Users/atulgrover/Desktop/skillpedia --project-name=skillpedia-aas
```

---

## 🎯 Next Steps / Roadmap (For Tomorrow)
1. **Full Dataset Integration**:
   - Index the 2,176 active QPs from Skill India Digital Portal ([https://admin.skillindiadigital.gov.in/qpListings](https://admin.skillindiadigital.gov.in/qpListings)).
   - Map video playlists across additional Sector Skill Councils.
2. **Student Progress & Bookmarks**:
   - Persist completed PCs and watch progress in browser `localStorage` / `IndexedDB`.
3. **Full-Screen Mobile Reels Swipe**:
   - Enable vertical swipe feed for mobile reel player.
