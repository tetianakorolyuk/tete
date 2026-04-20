'use client';

import { useState, useCallback, useEffect } from 'react';

interface Post {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image?: string;
}

const formatDate = (pub: string) => {
  try {
    const d = new Date(pub);
    if (isNaN(d.getTime())) return pub || '';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return pub || '';
  }
};

const CACHE_KEY = 'tete_substack_cache_v6';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

export default function JournalSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSubstack = useCallback(async (force = false) => {
    const FEED = 'https://tekofm.substack.com/feed';
    // Use multiple fallbacks for reliability
    const PROXIES = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(FEED)}`,
      `https://corsproxy.io/?${encodeURIComponent(FEED)}`,
      FEED, // Direct (may fail due to CORS but try last)
    ];

    try {
      // Check cache first
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.ts && Array.isArray(cached?.items) && (Date.now() - cached.ts) < CACHE_TTL_MS) {
            setPosts(cached.items);
            setLoading(false);
            setError(false);
            return;
          }
        }
      }

      setLoading(true);
      setError(false);

      // Try proxies in order
      let xmlText = '';
      for (const proxyUrl of PROXIES) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

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

      if (!xmlText) throw new Error('All proxies failed');

      const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const items: Post[] = [...doc.querySelectorAll('item')].map((item) => {
        const content = item.querySelector('content\\:encoded')?.textContent || item.querySelector('description')?.textContent || '';
        // Extract first image from content or description
        const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
        const imageUrl = imgMatch ? imgMatch[1] : undefined;

        return {
          title: item.querySelector('title')?.textContent || '',
          link: item.querySelector('link')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
          description: content.replace(/<[^>]+>/g, '').slice(0, 180) + '...',
          image: imageUrl,
        };
      }).slice(0, 6);

      if (!items.length) throw new Error('No RSS items');

      // Cache the results
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));

      setPosts(items);
    } catch (err) {
      console.error('Substack load failed:', err);
      setError(true);
      // Show cached data on error
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.items?.length) {
          setPosts(cached.items);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubstack();
  }, [loadSubstack]);

  return (
    <section className="section journal" id="journal">
      <div className="wrap">
        <FadeIn>
          <p className="subkicker">
            <span className="rule"></span>Journal
          </p>
        </FadeIn>
        <FadeIn delay={100}>
          <div className="sectionTitleLine">
            <h2>Latest writing</h2>
            <div className="meta metaRow">
              <a href="https://tekofm.substack.com/" target="_blank" rel="noopener">
                tekofm.substack.com
              </a>
              {!loading && (
                <button
                  className="postsRefresh"
                  onClick={() => loadSubstack(true)}
                  type="button"
                  aria-label="Refresh posts"
                >
                  Refresh
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        <div style={{ marginTop: 18 }} className="posts">
          {loading ? (
            <div className="postsEmpty">Loading latest posts…</div>
          ) : error && posts.length === 0 ? (
            <div className="postsEmpty">
              Couldn't load posts right now.{' '}
              <a href="https://tekofm.substack.com/" target="_blank" rel="noopener">
                Open Substack
              </a>
              .
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <article key={i} className="postItem">
                {post.image && (
                  <div className="postImage">
                    <img src={post.image} alt="" loading="lazy" />
                  </div>
                )}
                <div className="postContent">
                  <p className="postMeta">
                    {formatDate(post.pubDate)}
                  </p>
                  <h3 className="postTitle">
                    <a href={post.link} target="_blank" rel="noopener">
                      {post.title}
                    </a>
                  </h3>
                  {post.description && (
                    <p className="postExcerpt">{post.description}</p>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="postsEmpty">
              No posts found.{' '}
              <a href="https://tekofm.substack.com/" target="_blank" rel="noopener">
                Open Substack
              </a>
              .
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Simple FadeIn for this component
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s cubic-bezier(0.76, 0, 0.24, 1), transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)',
      }}
    >
      {children}
    </div>
  );
}
