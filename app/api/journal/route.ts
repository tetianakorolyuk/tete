import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
}

const CACHE_KEY = 'journal_posts_v1';
const CACHE_TTL = 3600; // 1 hour in seconds

// Fallback posts if feed is unavailable
const FALLBACK_POSTS: Post[] = [
  {
    title: 'The Art of Quiet Spaces',
    link: 'https://thetete.substack.com/',
    pubDate: new Date().toUTCString(),
    description: 'Exploring how minimalism and warmth coexist in modern interior design. A journey through texture, light, and the spaces that shape our daily rituals.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80'
  },
  {
    title: 'Material Stories: Natural Textures',
    link: 'https://thetete.substack.com/',
    pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toUTCString(),
    description: 'How natural materials tell a story through their imperfections. Linen, wood, and stone as the foundation of intimate spaces.',
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80'
  },
  {
    title: 'Light as Architecture',
    link: 'https://thetete.substack.com/',
    pubDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toUTCString(),
    description: 'Understanding how natural light shapes our experience of space. The interplay of shadow and illumination in residential design.',
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80'
  },
];

export async function GET() {
  // Try cache first for instant loads
  try {
    const cached = await kv.get<Post[]>(CACHE_KEY);
    if (cached && cached.length > 0) {
      console.log('Returning cached journal posts:', cached.length);
      return NextResponse.json({ posts: cached });
    }
  } catch (err) {
    console.warn('KV cache read failed, fetching fresh:', err);
  }

  const FEED = 'https://thetete.substack.com/feed';
  const PROXIES = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(FEED)}`,
    `https://corsproxy.io/?${encodeURIComponent(FEED)}`,
    FEED,
  ];

  let xmlText = '';
  let fetchError: any = null;

  for (const proxyUrl of PROXIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(proxyUrl, {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        xmlText = await res.text();
        console.log('✓ Successfully fetched feed from:', proxyUrl);
        console.log('Feed content length:', xmlText.length);
        break;
      }
      fetchError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      console.warn(`✗ Proxy failed: ${proxyUrl}`, e);
      fetchError = e;
      continue;
    }
  }

  if (!xmlText) {
    console.warn('Feed unavailable, returning fallback posts');
    // Return fallback posts if feed fails
    return NextResponse.json({ posts: FALLBACK_POSTS });
  }

  try {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    const items: Post[] = [...doc.querySelectorAll('item')].map((item) => {
      const description = item.querySelector('description')?.textContent || '';
      const content = item.querySelector('content\\:encoded')?.textContent || description;

      // Extract image from description (Substack puts featured image there)
      const descImgMatch = description.match(/<img[^>]+src="([^"]+)"/);
      // Extract image from content-encoded
      const contentImgMatch = content.match(/<img[^>]+src="([^"]+)"/);
      // Extract from enclosure tag
      const enclosure = item.querySelector('enclosure');
      const enclosureUrl = enclosure?.getAttribute('url');
      // Extract from media:content tag
      const mediaContent = item.querySelector('media\\:content');
      const mediaUrl = mediaContent?.getAttribute('url');

      const imageUrl = descImgMatch?.[1] || contentImgMatch?.[1] || enclosureUrl || mediaUrl;

      return {
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
        description: content.replace(/<[^>]+>/g, '').slice(0, 200) + '...',
        image: imageUrl || undefined,
      };
    }).slice(0, 6);

    if (!items.length) {
      console.warn('No items found in feed, returning fallback');
      return NextResponse.json({ posts: FALLBACK_POSTS });
    }

    console.log(`✓ Extracted ${items.length} posts from feed`);

    // Cache the posts for 1 hour
    try {
      await kv.set(CACHE_KEY, items, { ex: CACHE_TTL });
      console.log(`Journal posts cached: ${items.length} posts`);
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
