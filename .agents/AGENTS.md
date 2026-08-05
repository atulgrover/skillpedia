# Workspace Memory & Rules for SkillPedia

## Project Context
- **Project Name**: SkillPedia (National Skill Video Portal PWA)
- **Live Production URL**: https://skillpedia.pages.dev
- **Cloudflare Account ID**: `f0b9b9d65437d2ef1c98d46b1c33337b`
- **Cloudflare Project Name**: `skillpedia`
- **Turso Edge DB Host**: `libsql://skillpedia-atulgrover.aws-ap-south-1.turso.io`
- **Developer Documentation**: Refer to [DEV_DOCS.md](file:///Users/atulgrover/Desktop/skillpedia/DEV_DOCS.md) for full system architecture, schema definitions, and component breakdown.

## Completed Architecture & Key Session Memory (August 2026)
1. **Turso Edge Database & Secret Management**:
   - Turso credentials configured in [`js/config.js`](file:///Users/atulgrover/Desktop/skillpedia/js/config.js).
   - `.gitignore` configured to keep secrets out of git repository commits.
   - Client fallback via IndexedDB and `localStorage` for 100% offline PWA reliability.
2. **Standardized 11-Reel Schemas (`js/schemas.js`)**:
   - Both Official NSQF QPs and Custom AI-generated curricula are strictly standardized to **11 reels** with step-by-step Performance Criteria (PCs).
3. **4-Tier Safety & Moderation Pipeline (`js/contentFilter.js`)**:
   - Tier 1: Keyword/intent sanitizer blocking dangerous, explosive, illicit, or explicit prompts.
   - Tier 2: AI system prompt guardrails.
   - Tier 3: YouTube SafeSearch API filtering.
   - Tier 4: Community 🚩 **Report Reel** button logging flags in Turso DB.
4. **User Authentication & Session (`js/auth.js`)**:
   - Employer / Creator Sign-In modal for saving and managing custom 11-reel packages.
   - Zero-friction guest access for employees opening share links or phone shortcuts.
5. **Custom AI 11-Reel Engine (`js/aiEngine.js`)**:
   - Synthesizes 11-reel NSQF-derived courses for custom learning needs (e.g. *"Baking a Cake"*).
   - Learner video links are fixed/authoritative (no manual video link swapping).
6. **Standardized 11-Reel Viewer (`js/reelViewer.js`)**:
   - 11-step progress tracker pills, PC checklist drawer with `localStorage` memory, employer branding banners, and 📲 phone shortcuts.

## Design System & Branding Rules
- Always maintain Dark Mode (`#07090e`) and Light Mode (`#f8fafc`) theme toggle support.
- Use the transparent Hayagriva logo (`AAS/logo_dark.png` and `AAS/logo_light.png`).
- On mobile portrait viewports, ensure logo container uses `width: min(350px, 88vw)`.
- Use Glassmorphism design elements (`backdrop-filter: blur(12px)`), high-contrast badges, and credit tags.

## PWA Rules
- Maintain `manifest.json` and `sw.js` (Service Worker v2) for offline caching and standalone mode (`display: "standalone"`).
- Preserve PWA install prompt banner capabilities.
