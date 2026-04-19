'use client';

import { useEffect, useState } from 'react';

export default function Cursor() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };

    animate();

    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="cursor-dot" id="cursorDot" />
      <div className="cursor-ring" id="cursorRing" />
    </>
  );
}
