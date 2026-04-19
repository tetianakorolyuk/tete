'use client';

import { useEffect, useState, useRef } from 'react';

export default function Cursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number }[]>([]);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      const id = Date.now();
      setClickRipple((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => {
        setClickRipple((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    };

    const checkHover = () => {
      const el = document.elementFromPoint(mousePos.current.x, mousePos.current.y);
      const isInteractive = el?.closest('a, button, [data-lightbox], input, textarea, [role="button"]');
      setIsHovering(!!isInteractive);
    };

    const animate = () => {
      checkHover();

      // Update dot position (instant)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px) translate(-50%, -50%)`;
      }

      // Update ring position (smooth follow)
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('click', handleClick);

    // Start animation
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        id="cursorDot"
        style={{
          pointerEvents: 'none',
          width: isHovering ? '16px' : '8px',
          height: isHovering ? '16px' : '8px',
          background: isHovering ? 'var(--brown)' : 'var(--apricot)',
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        id="cursorRing"
        style={{
          pointerEvents: 'none',
          width: isHovering ? '60px' : '40px',
          height: isHovering ? '60px' : '40px',
          borderColor: isHovering ? 'var(--brown)' : 'var(--apricot)',
        }}
      />
      {clickRipple.map((ripple) => (
        <div
          key={ripple.id}
          className="click-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </>
  );
}
