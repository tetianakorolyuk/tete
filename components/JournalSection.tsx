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

const CACHE_KEY = 'tete_substack_cache_v7';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

export default function JournalSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSubstack = useCallback(async (force = false) => {
    try {
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

      // Use Next.js API route for reliable server-side fetching
      const res = await fetch('/api/journal', {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Failed to fetch journal');

      const data = await res.json();
      const items = data.posts || [];

      if (!items.length) throw new Error('No journal items');

      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));

      setPosts(items);
    } catch (err) {
      console.error('Substack load failed:', err);
      setError(true);
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
              <ImagePost key={i} post={post} formatDate={formatDate} />
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

// Post card with image fallback handling
function ImagePost({ post, formatDate }: { post: Post; formatDate: (pub: string) => string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="postItem">
      {post.image && !imgError ? (
        <div className="postImage">
          <img
            src={post.image}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>
      ) : null}
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
