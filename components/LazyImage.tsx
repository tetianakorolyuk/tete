'use client';

import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export default function LazyImage({ src, alt, className = '', onLoad }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={inView ? src : undefined}
      data-src={src}
      alt={alt}
      className={`${className} ${loaded ? 'loaded' : 'loading'}`}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      style={{
        background: loaded ? 'transparent' : 'linear-gradient(90deg, var(--linen-2) 25%, var(--linen) 50%, var(--linen-2) 75%)',
        backgroundSize: '200% 100%',
        animation: !loaded ? 'shimmer 1.5s infinite' : 'none',
      }}
    />
  );
}
