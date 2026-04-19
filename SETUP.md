# Setup Guide - Thete Testudio Portfolio

## Quick Start

```bash
npm run dev     # Start at http://localhost:3001
npm run build   # Build for production
```

## Editor Access

- **Edit URL**: http://localhost:3001/edit
- **Password**: `tete2025`

## Features Completed

### 1. Individual Project Pages
Each project now has its own page at `/projects/[slug]`:
- Click any project on homepage to view details
- Navigate between projects with Previous/Next buttons
- Full-screen hero images + gallery
- Project facts and description

### 2. Image Upload
- Upload images directly from the editor
- Stored in Vercel Blob (public access)
- Supports: JPEG, PNG, WebP, GIF (max 5MB)

### 3. Project Management
- Add/Edit/Delete projects from `/edit`
- Reorder projects with up/down arrows
- AI-generated descriptions and facts
- Save button persists changes

## Environment Variables Required

### For Local Development (`.env.local`)
```bash
ADMIN_PASSWORD=tete2025
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
KV_URL=your_upstash_redis_url
GITHUB_TOKEN=your_github_personal_access_token
```

### For Vercel Production
Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Purpose | Required |
|----------|---------|----------|
| `BLOB_READ_WRITE_TOKEN` | Image uploads | Yes |
| `KV_URL` | Project data persistence | Yes |
| `GITHUB_TOKEN` | Permanent content storage | Optional* |
| `RESEND_API_KEY` | Contact form emails | Optional |
| `CONTACT_EMAIL` | Form recipient | Optional |

\* *Without `GITHUB_TOKEN`, projects save to KV only (still persistent)*

## How Saving Works

1. **Local**: Saves to `public/content/projects.json` + KV
2. **Vercel (with KV only)**: Saves to KV database (persistent across deploys)
3. **Vercel (with GitHub)**: Saves to KV + commits to GitHub repo

## Getting Your Tokens

### Vercel Blob (Required)
1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Connect Database" → Create "Blob"
3. Token auto-configured in production

### Vercel KV (Required)
1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Connect Database" → Create "KV"
3. Copy `KV_URL` from settings

### GitHub Token (Optional but Recommended)
1. Go to https://github.com/settings/tokens
2. Create token with `repo` scope
3. Copy to Vercel as `GITHUB_TOKEN`

## File Structure

```
girlfriend-portfolio/
├── app/
│   ├── page.tsx              # Homepage
│   ├── projects/[slug]/      # Project detail pages
│   ├── edit/                 # CMS editor
│   └── api/
│       ├── /upload           # Image upload endpoint
│       └── /save             # Save projects endpoint
├── components/
│   ├── ProjectsSection.tsx   # Project grid (clickable)
│   ├── Hero.tsx              # Homepage hero slider
│   └── Cursor.tsx            # Custom cursor
├── lib/
│   ├── content.ts            # Get/save projects
│   ├── auth.ts               # Edit page auth
│   └── types.ts              # TypeScript types
└── public/content/
    └── projects.json         # Project data
```

## Troubleshooting

### "Upload failed"
- Check `BLOB_READ_WRITE_TOKEN` is set
- Ensure Blob store has **public access** enabled

### "Save failed" or changes don't persist
- Check `KV_URL` is set in Vercel
- Without KV, changes only last until next deploy

### Build fails with TypeScript error
- Run `npm run build` to see full error
- Common: missing type annotations or undefined variables

## Deployment Checklist

- [ ] Set all environment variables in Vercel
- [ ] Verify Blob store has public access
- [ ] Test image upload in production
- [ ] Test save functionality persists
- [ ] Verify custom domain (thetetestudio.com) is connected
