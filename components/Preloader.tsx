'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Animate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 6 + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDone(true);
            setTimeout(() => setVisible(false), 320);
          }, 320);
          return 100;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div id="preloader" className={done ? 'done' : ''}>
      <div className="pre-brand">
        <span className="pre-brand-small">the</span>
        <br />
        <span className="pre-brand-large">TETE</span>
      </div>
      <div className="pre-bar">
        <div className="pre-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="pre-num">{Math.floor(progress)}%</div>
    </div>
  );
}
