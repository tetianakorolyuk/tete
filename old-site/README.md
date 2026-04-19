# tete — interior design (static site)

This is a simple, fast, **no-build** portfolio site (just HTML/CSS/JS) designed for GitHub Pages.

## Quick edit checklist
1. **Projects content**: edit `projects.js`
2. **Images**: drop JPGs into `/images` and reference them from `projects.js`
3. **Contact**: update the email address in `index.html` and `project.html` (search for `mailto:`)

## Run locally
Open `index.html` in your browser, or (recommended) use a tiny local server:

```bash
cd <this-folder>
python3 -m http.server 8080
```

Then open: http://localhost:8080

## Deploy on GitHub Pages
1. Push these files to the **repo root** (where `index.html` is).
2. GitHub → **Settings** → **Pages**
3. **Build and deployment**: Deploy from a branch
4. Branch: `main` (or `master`) / folder: `/ (root)`
5. Your site will be available at the Pages URL.

## Notes
- The home page pulls Substack posts from the RSS feed via a CORS relay.
- Open Graph preview image: `images/og.jpg` (replace it anytime).
## Easy editing (Wix-like "Save/Publish") — Netlify + Decap CMS

This site includes an admin editor at **/admin/** (works when hosted on Netlify).

### One-time setup (owner)
1) Create a free Netlify site from this GitHub repo (New site from Git).
2) Netlify → **Identity** → Enable
3) Netlify → **Identity** → Settings → **Git Gateway** → Enable
4) Invite your editor (email) under Identity → Invite users

### Editing (non-technical)
Open: `https://YOUR-NETLIFY-URL/admin/`  
Login → edit Projects → click **Publish**.

The site reads data from `content/projects.json`.
