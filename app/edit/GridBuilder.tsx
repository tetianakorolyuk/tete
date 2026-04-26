'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';

interface GridBuilderProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
  onClose: () => void;
}

export default function GridBuilder({ projects, onUpdate, onClose }: GridBuilderProps) {
  const [items, setItems] = useState<Project[]>(projects);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isLarge = (p: Project) => {
    if (!p.layout) return false;
    return ['single', 'full', 'wide'].includes(p.layout);
  };

  const toggleSize = (index: number) => {
    const next = [...items];
    const p = next[index];
    next[index] = {
      ...p,
      layout: isLarge(p) ? 'dual' : 'single',
    };
    setItems(next);
    onUpdate(next);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const next = [...items];
    const [removed] = next.splice(dragIndex, 1);
    next.splice(index, 0, removed);
    setItems(next);
    onUpdate(next);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="grid-builder-overlay" onClick={onClose}>
      <div className="grid-builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="grid-builder-header">
          <h3>Grid Builder</h3>
          <p>Click a card to toggle size. Drag to reorder.</p>
          <button className="grid-builder-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid-builder">
          {items.map((project, index) => {
            const large = isLarge(project);
            const isDragging = dragIndex === index;
            const isDropTarget = dragOverIndex === index && dragIndex !== index;
            const thumb = project.images?.find((img) => img && img !== '');

            return (
              <div
                key={project.slug}
                className={`grid-builder-item ${large ? 'large' : 'small'} ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                onClick={() => toggleSize(index)}
                title={`${project.title} — Click to make ${large ? 'small' : 'large'}`}
              >
                <div className="grid-builder-thumb">
                  {thumb ? (
                    <img src={thumb} alt="" draggable={false} />
                  ) : (
                    <div className="grid-builder-empty">{String(index + 1).padStart(2, '0')}</div>
                  )}
                </div>
                <div className="grid-builder-badge">
                  {large ? 'Large' : 'Small'}
                </div>
                <div className="grid-builder-drag-handle">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="9" cy="18" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
