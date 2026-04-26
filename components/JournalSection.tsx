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

const CACHE_KEY = 'tete_substack_cache_v8';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

export default function JournalSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadSubstack = useCallback(async (force = false) => {
    try {
      // Check localStorage cache first
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached?.items?.length) {
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
      const res = await fetch('/api/journal');
      const data = await res.json();
      const items = data.posts || [];

      if (items.length > 0) {
        setPosts(items);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Substack load failed:', err);
      setError(true);
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
            <h2>Journal, references &amp; <em>Substack</em> thoughts.</h2>
            <div className="journal-note">
              <div className="journal-note-circle"></div>
              <p>This section connects to Tatiana's Substack feed. Editorial writing on design, atmosphere, and the spaces that shape how we live.</p>
            </div>
          </div>
        </FadeIn>

        <div className="posts">
          {loading ? (
            <div className="postsEmpty">Loading latest posts…</div>
          ) : error && posts.length === 0 ? (
            <div className="postsEmpty">
              Couldn't load posts right now.{' '}
              <a href="https://thetete.substack.com/" target="_blank" rel="noopener">
                Open Substack
              </a>
              .
            </div>
          ) : posts.length > 0 ? (
            posts.map((post, i) => (
              <JournalCard key={i} post={post} formatDate={formatDate} />
            ))
          ) : (
            <div className="postsEmpty">
              No posts found.{' '}
              <a href="https://thetete.substack.com/" target="_blank" rel="noopener">
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

// Journal Card with new design
function JournalCard({ post, formatDate }: { post: Post; formatDate: (pub: string) => string }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="journalCard">
      <div className="journalCard-image">
        {post.image && !imgError ? (
          <img
            src={post.image}
            alt=""
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="journalCard-image-placeholder"></div>
        )}
      </div>
      <div className="journalCard-content">
        <p className="journalCard-category">Journal</p>
        <h3 className="journalCard-title">
          <a href={post.link} target="_blank" rel="noopener">
            {post.title}
          </a>
        </h3>
        {post.description && (
          <p className="journalCard-excerpt">{post.description}</p>
        )}
        <div className="journalCard-footer">
          <span className="journalCard-date">{formatDate(post.pubDate)}</span>
          <a href={post.link} target="_blank" rel="noopener" className="journalCard-read">
            Read
          </a>
        </div>
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
