'use client';

import { useEffect, useState, useCallback } from 'react';

export default function Cursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [clickRipple, setClickRipple] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    setMounted(true);

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      // Add ripple effect
      const id = Date.now();
      setClickRipple((prev) => [...prev, { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => {
        setClickRipple((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    };

    const checkHover = () => {
      const el = document.elementFromPoint(mx, my);
      const isInteractive = el?.closest('a, button, [data-lightbox]');
      setIsHovering(!!isInteractive);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    const animate = () => {
      checkHover();
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      cancelAnimationFrame(frameId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
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
