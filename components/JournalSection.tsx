'use client';

import { useState, useCallback, useEffect } from 'react';

interface Post {
  title: string;
  link: string;
  pubDate: string;
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

const CACHE_KEY = 'tete_substack_cache_v5';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

export default function JournalSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSubstack = useCallback(async (force = false) => {
    const FEED = 'https://tekofm.substack.com/feed';
    const RELAY = 'https://api.allorigins.win/raw?url=';

    try {
      // Try cache first (unless forced refresh)
      if (!force) {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const cached = JSON.parse(raw);
            if (cached?.ts && Array.isArray(cached?.items) && (Date.now() - cached.ts) < CACHE_TTL_MS) {
              setPosts(cached.items);
              setLoading(false);
              setError(false);
              return; // Use cached data
            }
          }
        } catch (e) {
          console.warn('Cache read failed:', e);
        }
      }

      // Fetch fresh data
      const bust = Date.now();
      const url = RELAY + encodeURIComponent(`${FEED}?_=${bust}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xmlText = await res.text();

      const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const items: Post[] = [...doc.querySelectorAll('item')].map((item) => ({
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
      })).slice(0, 6);

      if (!items.length) throw new Error('No RSS items');

      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      } catch (e) {
        console.warn('Cache write failed:', e);
      }

      setPosts(items);
      setError(false);
    } catch (err) {
      console.error('Substack load failed:', err);
      setError(true);
      // Try to show cached data on error
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.items?.length) {
            setPosts(cached.items);
          }
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubstack();
  }, [loadSubstack]);

  return (
    <section className="section" id="journal">
      <div className="wrap">
        <p className="subkicker">
          <span className="rule"></span>Journal
        </p>
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
                <p className="postMeta">
                  {formatDate(post.pubDate)}
                </p>
                <h3 className="postTitle">
                  <a href={post.link} target="_blank" rel="noopener">
                    {post.title}
                  </a>
                </h3>
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
