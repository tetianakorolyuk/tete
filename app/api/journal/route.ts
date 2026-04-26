import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
}

const CACHE_KEY = 'journal_posts_v3';
const CACHE_TTL = 3600; // 1 hour in seconds

// Fallback posts if API is unavailable
const FALLBACK_POSTS: Post[] = [
  {
    title: 'The Art of Quiet Spaces',
    link: 'https://thetete.substack.com/',
    pubDate: new Date().toUTCString(),
    description: 'Exploring how minimalism and warmth coexist in modern interior design. A journey through texture, light, and the spaces that shape our daily rituals.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80'
  },
  {
    title: 'Material Stories: Natural Textures',
    link: 'https://thetete.substack.com/',
    pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toUTCString(),
    description: 'How natural materials tell a story through their imperfections. Linen, wood, and stone as the foundation of intimate spaces.',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80'
  },
  {
    title: 'Light as Architecture',
    link: 'https://thetete.substack.com/',
    pubDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toUTCString(),
    description: 'Understanding how natural light shapes our experience of space. The interplay of shadow and illumination in residential design.',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80'
  },
];

export async function GET() {
  // Try cache first for instant loads
  try {
    const cached = await kv.get<Post[]>(CACHE_KEY);
    if (cached && cached.length > 0) {
      return NextResponse.json({ posts: cached });
    }
  } catch (err) {
    console.warn('KV cache read failed, fetching fresh:', err);
  }

  // Use Substack JSON API — this returns proper cover images
  const API_URL = 'https://thetete.substack.com/api/v1/posts?limit=6';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(API_URL, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Substack API returned ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Empty response from Substack API');
    }

    const items: Post[] = data.map((post: any) => ({
      title: post.title || post.slug || 'Untitled',
      link: post.canonical_url || `https://thetete.substack.com/p/${post.slug}`,
      pubDate: post.post_date || new Date().toISOString(),
      description: post.subtitle || post.description || post.search_engine_description || '',
      image: post.cover_image || undefined,
    })).slice(0, 6);

    // Cache the posts for 1 hour
    try {
      await kv.set(CACHE_KEY, items, { ex: CACHE_TTL });
    } catch (err) {
      console.warn('KV cache write failed:', err);
    }

    return NextResponse.json({ posts: items });
  } catch (err) {
    console.error('Journal API error:', err);
    // Always return fallback posts on any error
    return NextResponse.json({ posts: FALLBACK_POSTS });
  }
}
