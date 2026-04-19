'use client';

import { useState, useCallback } from 'react';

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

export default function JournalSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string>('');

  const loadSubstack = useCallback(async (force = false) => {
    const FEED = 'https://tekofm.substack.com/feed';
    const RELAY = 'https://api.allorigins.win/raw?url=';
    const CACHE_KEY = 'tete_substack_cache_v4';
    const CACHE_TTL_MS = 10 * 60 * 1000;

    try {
      // Try cache first
      if (!force) {
        try {
          const raw = localStorage.getItem(CACHE_KEY);
          if (raw) {
            const cached = JSON.parse(raw);
            if (cached?.ts && Array.isArray(cached?.items) && Date.now() - cached.ts < CACHE_TTL_MS) {
              setPosts(cached.items);
              setNote('cached');
              setLoading(false);
            }
          }
        } catch {}
      }

      setLoading(true);
      const bust = Date.now();
      const url = RELAY + encodeURIComponent(`${FEED}?_=${bust}`);

      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xmlText = await res.text();

      const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
      const items: Post[] = [...doc.querySelectorAll('item')].map((item) => ({
        title: item.querySelector('title')?.textContent || '',
        link: item.querySelector('link')?.textContent || '',
        pubDate: item.querySelector('pubDate')?.textContent || '',
      })).slice(0, 6);

      if (!items.length) throw new Error('No RSS items');

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      } catch {}

      setPosts(items);
      setNote('updated');
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  if (loading) {
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
              <button
                className="postsRefresh"
                onClick={() => loadSubstack(true)}
                type="button"
                aria-label="Refresh posts"
              >
                Refresh
              </button>
            </div>
          </div>
          <div style={{ marginTop: 18 }} className="posts">
            <div className="postsEmpty">Loading posts…</div>
          </div>
        </div>
      </section>
    );
  }

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
            <button
              className="postsRefresh"
              onClick={() => loadSubstack(true)}
              type="button"
              aria-label="Refresh posts"
            >
              Refresh
            </button>
          </div>
        </div>

        <div style={{ marginTop: 18 }} className="posts">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <article key={i} className="postItem">
                <p className="postMeta">
                  {formatDate(post.pubDate)}
                  {note ? ` · ${note}` : ''}
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
