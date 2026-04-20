import { NextResponse } from 'next/server';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
}

export async function GET() {
  const FEED = 'https://tekofm.substack.com/feed';
  const PROXIES = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(FEED)}`,
    `https://corsproxy.io/?${encodeURIComponent(FEED)}`,
    FEED,
  ];

  try {
    let xmlText = '';
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
          break;
        }
      } catch (e) {
        console.warn(`Proxy failed: ${proxyUrl}`);
        continue;
      }
    }

    if (!xmlText) {
      return NextResponse.json({ error: 'Feed unavailable' }, { status: 503 });
    }

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
      return NextResponse.json({ error: 'No items found' }, { status: 404 });
    }

    return NextResponse.json({ posts: items });
  } catch (err) {
    console.error('Journal API error:', err);
    return NextResponse.json({ error: 'Failed to fetch journal' }, { status: 500 });
  }
}
