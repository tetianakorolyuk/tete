'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const frameRef = useRef<number>(0);
  const isHovering = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      // Add click ripple
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    const checkHover = () => {
      const el = document.elementFromPoint(mousePos.current.x, mousePos.current.y);
      const wasHovering = isHovering.current;
      isHovering.current = !!el?.closest('a, button, [data-lightbox], input, textarea, [role="button"]');

      if (wasHovering !== isHovering.current) {
        dotRef.current?.classList.toggle('is-hovering', isHovering.current);
        ringRef.current?.classList.toggle('is-hovering', isHovering.current);
      }
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

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
