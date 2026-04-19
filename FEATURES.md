# tete Portfolio — Features

## ✨ What's New

### Core Features
- **Next.js 16** - Modern React framework with SSR/SSG
- **TypeScript** - Full type safety
- **Tailwind CSS 4** - Utility-first styling
- **Dark Mode** - Auto-detects system preference + manual toggle
- **Loading Screen** - Animated logo on page load

### Content Management (`/edit`)
- **Password Protected** - Default: `tete2025`
- **Project Editor** - Add, edit, delete, reorder projects
- **Drag-and-Drop Image Upload** - Upload directly to Vercel Blob
- **AI-Powered Tools** (requires Ollama):
  - Auto-generate project descriptions
  - Auto-generate facts/details
  - SEO metadata suggestions

### UI/UX
- **Scroll Animations** - Fade-in effects as you scroll
- **Hero Carousel** - Auto-advancing featured images
- **Lightbox** - Full-screen image viewer
- **Responsive Design** - Mobile, tablet, desktop optimized
- **Smooth Transitions** - All interactions animated

### SEO & Performance
- **Dynamic Metadata** - Title, description, keywords
- **OpenGraph Tags** - Social sharing previews
- **Sitemap** - Auto-generated at `/sitemap.xml`
- **Image Optimization** - Next.js Image component ready

---

## 🔧 Setup

### Environment Variables (`.env.local`)
```bash
# Admin password
ADMIN_PASSWORD=your-secure-password

# Ollama AI (optional - for AI features)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Vercel Setup
1. Push code to GitHub ✅
2. Connect repo in Vercel ✅
3. Add environment variables in Vercel dashboard:
   - `ADMIN_PASSWORD` (required)
   - `BLOB_READ_WRITE_TOKEN` (auto-added by Vercel Blob)
   - `NEXT_PUBLIC_SITE_URL` (your production URL)

### Enable Vercel Blob (for image uploads)
```bash
npx vercel blob
```
Or in Vercel dashboard: Storage → Create → Blob

### Ollama Setup (for AI features)
```bash
# Install Ollama
brew install ollama  # macOS
# or download from ollama.com

# Pull a model
ollama pull llama3.2

# Start server (usually auto-starts)
ollama serve
```

---

## 📁 File Structure
```
app/
├── api/upload/          # Image upload endpoint
├── edit/
│   ├── login/           # Admin login page
│   ├── page.tsx         # Dashboard
│   ├── EditProjects.tsx # Editor component
│   └── ai-actions.ts    # AI generation functions
├── globals.css          # All styles
├── layout.tsx           # Root layout + ThemeProvider
└── page.tsx             # Home page
components/
├── Header.tsx           # Navigation + theme toggle
├── Hero.tsx             # Carousel
├── ProjectsSection.tsx  # Project grid + animations
├── JournalSection.tsx   # Substack RSS
├── ContactSection.tsx   # Contact info
├── Footer.tsx           # Footer
├── Lightbox.tsx         # Image viewer
├── LoadingScreen.tsx    # Loading animation
├── ThemeProvider.tsx    # Dark mode context
├── ThemeToggle.tsx      # Toggle button
├── FadeIn.tsx           # Scroll animation
└── PageWrapper.tsx      # Client wrapper
lib/
├── auth.ts              # Authentication
├── content.ts           # Content management
├── types.ts             # TypeScript types
└── ollama.ts            # AI generation
public/content/
└── projects.json        # Project data
```

---

## 🎨 Usage

### Edit Site Content
1. Go to `/edit`
2. Login with password
3. Click "Expand" on a project
4. Edit fields or use AI Generate buttons
5. Upload images via "Upload" button
6. Click "Save All"

### Reorder Projects
- Use ↑ ↓ buttons to reorder
- Order is saved automatically

### Dark Mode
- Click sun/moon icon in header
- Auto-detects system preference
- Persists selection in localStorage

---

## 🚀 Deployment

Vercel auto-deploys on push to main branch.

After deploy:
1. Check Vercel → Settings → Environment Variables
2. Set `ADMIN_PASSWORD` to a secure value
3. Enable Vercel Blob for image uploads
4. Update `NEXT_PUBLIC_SITE_URL` to production URL

---

## 📊 Analytics (Optional)

Add Vercel Analytics or Google Analytics:
```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

## 🔒 Security Notes

- Change `ADMIN_PASSWORD` in production
- Vercel Blob uploads require authentication
- Environment variables are server-side only
- `.env.local` is git-ignored

---

Built with ❤️ using Next.js 16, Tailwind CSS 4, and Ollama AI
