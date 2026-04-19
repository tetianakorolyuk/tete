# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Build for production
npm run start        # Start production server
```

## Architecture

- **Framework**: Next.js 16.2.4 with App Router and Turbopack
- **Styling**: Tailwind CSS with custom CSS in `app/globals.css`
- **Content**: JSON-based CMS stored in `public/content/projects.json`
- **Auth**: Cookie-based authentication for `/edit` route (password: `tete2025`)

## Key Directories

- `app/` - Next.js App Router pages and layouts
- `components/` - React components (Hero, ProjectsSection, Lightbox, Cursor, etc.)
- `lib/` - Utilities (auth.ts, content.ts, types.ts)
- `public/content/` - JSON data files for projects
- `public/images/` - Static assets and uploads

## CMS Features

- Edit page at `/edit` (requires login at `/edit/login`)
- Image upload to `/public/images/uploads/` via `/api/upload`
- AI-generated descriptions and facts via `/edit/ai-actions.ts`
- Server actions with `revalidatePath` for instant updates

## Design System

- **Colors**: Linen (#F0EAE2), Apricot (#B7694A), Brown (#3D2315)
- **Fonts**: Cormorant Garamond (headings), DM Sans (body), DM Mono (mono)
- **Features**: Custom cursor, grain overlay, lightbox, scroll progress, scroll reveal
