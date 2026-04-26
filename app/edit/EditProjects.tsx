'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Project, StudioContent } from '@/lib/types';
import { saveStudioAction } from './actions';
import { generateDescriptionAction, generateFactsAction } from './ai-actions';
import GridBuilder from './GridBuilder';

interface EditProjectsProps {
  initialProjects: Project[];
}

interface Toast {
  id: number;
  type: 'success' | 'error';
  text: string;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

const defaultStudioContent: StudioContent = {
  headline: 'Spaces that feel <em>intimate</em>, editorial, precise.',
  description:
    'This direction keeps the website highly visual and intentionally restrained. The goal is to let the work feel premium and immersive, while still giving clients an easy path to conversation.',
  stats: [
    { number: '12', label: 'Completed Projects' },
    { number: '4', label: 'Featured Works' },
    { number: '24/7', label: 'Online Presentation' },
    { number: 'Tête-à-tête', label: 'Studio Philosophy' },
  ],
  principles: [
    {
      num: '01',
      title: 'Architecture as atmosphere',
      description:
        'Every space should feel like a considered emotional experience — not just a functional arrangement of walls and furniture.',
    },
    {
      num: '02',
      title: 'Material tells the story',
      description:
        'Texture, weight, and warmth are the language of intimacy. The right material choice is felt before it is seen.',
    },
    {
      num: '03',
      title: 'Restraint as a luxury',
      description:
        'True refinement is knowing what to leave out. Silence in a room — visual and physical — is always the rarest thing.',
    },
  ],
};

/* ─── Sub-components ─── */

function ConfirmModal({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  if (!state.open) return null;
  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{state.title}</h3>
        <p className="confirm-message">{state.message}</p>
        <div className="confirm-actions">
          <button className="admin-btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="admin-btn danger"
            onClick={() => {
              state.onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.text}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Main component ─── */

export default function EditProjects({ initialProjects }: EditProjectsProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [expandedSlugs, setExpandedSlugs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const [uploadingImage, setUploadingImage] = useState<{ slug: string; index: number } | null>(null);
  const [generatingAI, setGeneratingAI] = useState<{ type: string; slug: string } | null>(null);
  const [studioImage, setStudioImage] = useState<string>('/images/studio-hero.jpg');
  const [uploadingStudioImage, setUploadingStudioImage] = useState(false);
  const [studioContent, setStudioContent] = useState<StudioContent>(defaultStudioContent);
  const [studioExpanded, setStudioExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [dragOverSlug, setDragOverSlug] = useState<string | null>(null);
  const [gridLayout, setGridLayout] = useState('two-col');
  const [showGridBuilder, setShowGridBuilder] = useState(false);

  const projectsRef = useRef<Project[]>(initialProjects);
  projectsRef.current = projects;

  const initialStudioRef = useRef<StudioContent>(defaultStudioContent);

  /* ─── Load studio content on mount ─── */
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then(({ settings, studioContent: sc }) => {
        if (settings?.studioImage) {
          setStudioImage(settings.studioImage);
        }
        if (settings?.projectsGridLayout) {
          setGridLayout(settings.projectsGridLayout);
        }
        if (sc) {
          setStudioContent(sc);
          initialStudioRef.current = sc;
        }
      })
      .catch((err) => console.warn('Failed to load settings:', err));
  }, []);

  /* ─── Unsaved changes ─── */
  const hasChanges = useMemo(() => {
    const projectsChanged = JSON.stringify(projects) !== JSON.stringify(initialProjects);
    const studioChanged = JSON.stringify(studioContent) !== JSON.stringify(initialStudioRef.current);
    return projectsChanged || studioChanged;
  }, [projects, initialProjects, studioContent]);

  /* ─── Keyboard shortcuts ─── */
  const handleSaveRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSaveRef.current?.();
      }
      if (e.key === 'Escape') {
        setExpandedSlugs([]);
        setStudioExpanded(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ─── Toasts ─── */
  const addToast = useCallback((type: 'success' | 'error', text: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ─── Confirm helper ─── */
  const askConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmState({ open: true, title, message, onConfirm });
  }, []);

  /* ─── Save ─── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: projectsRef.current }),
      });
      const data = await res.json();

      if (!data.success && !data.message) {
        addToast('error', data.error || 'Failed to save projects');
        setSaving(false);
        return;
      }

      const studioRes = await saveStudioAction(studioContent);
      if (!studioRes.success) {
        addToast('error', studioRes.error || 'Failed to save studio content');
        setSaving(false);
        return;
      }

      addToast('success', data.message || 'Saved successfully!');
      router.refresh();
    } catch (e) {
      console.error(e);
      addToast('error', 'Failed to save');
    }
    setSaving(false);
  };

  handleSaveRef.current = handleSave;

  /* ─── Project CRUD ─── */
  const addProject = () => {
    const newProject: Project = {
      slug: `project-${Date.now()}`,
      title: 'New Project',
      subtitle: '',
      year: '',
      location: '',
      description: '',
      images: ['', ''],
      facts: [],
    };
    setProjects((prev) => [...prev, newProject]);
    setExpandedSlugs((prev) => [...prev, newProject.slug]);
    setSearchQuery('');
  };

  const duplicateProject = (slug: string) => {
    const project = projectsRef.current.find((p) => p.slug === slug);
    if (!project) return;
    const copy: Project = {
      ...project,
      slug: `${project.slug}-copy-${Date.now()}`,
      title: `${project.title} (Copy)`,
    };
    const idx = projectsRef.current.findIndex((p) => p.slug === slug);
    setProjects((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setExpandedSlugs((prev) => [...prev, copy.slug]);
    addToast('success', 'Project duplicated');
  };

  const deleteProject = (slug: string) => {
    askConfirm('Delete Project', 'Are you sure you want to delete this project? This cannot be undone.', () => {
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      setExpandedSlugs((prev) => prev.filter((s) => s !== slug));
      addToast('success', 'Project deleted');
    });
  };

  const updateProject = (slug: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...updates } : p)));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projectsRef.current.length) return;
    const newProjects = [...projectsRef.current];
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    setProjects(newProjects);
  };

  /* ─── Facts ─── */
  const addFact = (slug: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, facts: [...(p.facts || []), { label: '', value: '' }] } : p))
    );
  };

  const updateFact = (slug: string, index: number, field: 'label' | 'value', value: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.slug === slug
          ? { ...p, facts: p.facts?.map((f, i) => (i === index ? { ...f, [field]: value } : f)) }
          : p
      )
    );
  };

  const deleteFact = (slug: string, index: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, facts: p.facts?.filter((_, i) => i !== index) } : p))
    );
  };

  /* ─── Images ─── */
  const addImage = (slug: string) => {
    setProjects((prev) => prev.map((p) => (p.slug === slug ? { ...p, images: [...(p.images || []), ''] } : p)));
  };

  const updateImage = (slug: string, index: number, value: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, images: p.images?.map((img, i) => (i === index ? value : img)) } : p
      )
    );
  };

  const deleteImage = (slug: string, index: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, images: p.images?.filter((_, i) => i !== index) } : p))
    );
  };

  const getFileInputId = (slug: string, index: number) => `file-${slug}-${index}`;

  const handleImageUpload = useCallback(
    async (slug: string, imageIndex: number, file: File) => {
      setUploadingImage({ slug, index: imageIndex });
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        const data = await res.json();
        if (data.url) {
          setProjects((prev) =>
            prev.map((p) =>
              p.slug === slug
                ? { ...p, images: p.images?.map((img, i) => (i === imageIndex ? data.url : img)) }
                : p
            )
          );
          addToast('success', 'Image uploaded! Click "Save All" to persist.');
        } else {
          throw new Error(data.error || 'No URL in response');
        }
      } catch (err) {
        console.error('[handleImageUpload] Error:', err);
        addToast('error', err instanceof Error ? err.message : 'Upload failed');
      }
      setUploadingImage(null);
    },
    [addToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, slug: string, imageIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverSlug(null);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(slug, imageIndex, file);
      }
    },
    [handleImageUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent, slug: string) => {
    e.preventDefault();
    setDragOverSlug(slug);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlug(null);
  }, []);

  /* ─── AI ─── */
  const handleAIGenerateDescription = useCallback(
    async (slug: string) => {
      const project = projectsRef.current.find((p) => p.slug === slug);
      if (!project) return;
      setGeneratingAI({ type: 'description', slug });
      const result = await generateDescriptionAction(project.title, project.subtitle || '', project.facts || []);
      if (result.success && result.description) {
        updateProject(slug, { description: result.description });
        addToast('success', 'Description generated!');
      } else {
        addToast('error', result.error || 'Failed to generate');
      }
      setGeneratingAI(null);
    },
    [addToast]
  );

  const handleAIGenerateFacts = useCallback(
    async (slug: string) => {
      const project = projectsRef.current.find((p) => p.slug === slug);
      if (!project) return;
      setGeneratingAI({ type: 'facts', slug });
      const result = await generateFactsAction(project.title, project.description || '');
      if (result.success && result.facts) {
        updateProject(slug, { facts: result.facts });
        addToast('success', 'Facts generated!');
      } else {
        addToast('error', result.error || 'Failed to generate');
      }
      setGeneratingAI(null);
    },
    [addToast]
  );

  /* ─── Studio image ─── */
  const handleStudioImageUpload = useCallback(
    async (file: File) => {
      setUploadingStudioImage(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        const data = await res.json();
        if (data.url) {
          setStudioImage(data.url);
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: { studioImage: data.url } }),
          });
          addToast('success', 'Studio image updated!');
        } else {
          throw new Error(data.error || 'No URL in response');
        }
      } catch (err) {
        console.error('[handleStudioImageUpload] Error:', err);
        addToast('error', err instanceof Error ? err.message : 'Upload failed');
      }
      setUploadingStudioImage(false);
    },
    [addToast]
  );

  /* ─── Studio content handlers ─── */
  const updateStudioField = useCallback((field: keyof StudioContent, value: string) => {
    setStudioContent((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateStudioStat = useCallback((index: number, field: keyof StudioContent['stats'][0], value: string) => {
    setStudioContent((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }, []);

  const updateStudioPrinciple = useCallback(
    (index: number, field: keyof StudioContent['principles'][0], value: string) => {
      setStudioContent((prev) => ({
        ...prev,
        principles: prev.principles.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
      }));
    },
    []
  );

  /* ─── Expand / Collapse ─── */
  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const expandAll = () => setExpandedSlugs(projectsRef.current.map((p) => p.slug));
  const collapseAll = () => setExpandedSlugs([]);

  /* ─── Filter ─── */
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  /* ─── Render ─── */
  return (
    <div>
      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <ConfirmModal state={confirmState} onClose={() => setConfirmState((s) => ({ ...s, open: false }))} />

      {/* Grid Builder Modal */}
      {showGridBuilder && (
        <GridBuilder
          projects={projects}
          onUpdate={(next) => {
            setProjects(next);
            addToast('success', 'Grid updated! Click Save All to persist.');
          }}
          onClose={() => setShowGridBuilder(false)}
        />
      )}

      {/* Studio Settings */}
      <div className="admin-section">
        <button
          className="admin-section-toggle"
          onClick={() => setStudioExpanded((s) => !s)}
          aria-expanded={studioExpanded}
        >
          <div className="admin-section-toggle-left">
            <span className="admin-section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </span>
            <div>
              <h3 className="admin-section-title">Studio Section</h3>
              <p className="admin-section-subtitle">Headline, description, stats &amp; principles</p>
            </div>
          </div>
          <span className={`admin-section-chevron ${studioExpanded ? 'open' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </button>

        {studioExpanded && (
          <div className="admin-section-body">
            {/* Studio Image */}
            <div className="studio-image-editor">
              <div className="studio-image-preview">
                <img src={studioImage} alt="Studio preview" />
              </div>
              <div className="studio-image-actions">
                <label className="admin-btn secondary">
                  {uploadingStudioImage ? 'Uploading...' : 'Upload New Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleStudioImageUpload(file);
                    }}
                    disabled={uploadingStudioImage}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="studio-image-note">Displayed in the About/Studio section</p>
              </div>
            </div>

            {/* Studio Text Content */}
            <div className="studio-text-editor">
              <div className="form-group">
                <label className="form-label">Headline</label>
                <textarea
                  value={studioContent.headline}
                  onChange={(e) => updateStudioField('headline', e.target.value)}
                  className="form-input form-textarea"
                  rows={2}
                  placeholder="Use <em> for italic emphasis"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={studioContent.description}
                  onChange={(e) => updateStudioField('description', e.target.value)}
                  className="form-input form-textarea"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stats</label>
                <div className="studio-stats-editor">
                  {studioContent.stats.map((stat, i) => (
                    <div key={i} className="stat-row">
                      <input
                        type="text"
                        value={stat.number}
                        onChange={(e) => updateStudioStat(i, 'number', e.target.value)}
                        className="stat-number-input"
                        placeholder="12"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => updateStudioStat(i, 'label', e.target.value)}
                        className="stat-label-input"
                        placeholder="Label"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Principles</label>
                <div className="studio-principles-editor">
                  {studioContent.principles.map((principle, i) => (
                    <div key={i} className="principle-edit-card">
                      <div className="principle-edit-header">
                        <input
                          type="text"
                          value={principle.num}
                          onChange={(e) => updateStudioPrinciple(i, 'num', e.target.value)}
                          className="principle-num-input"
                          placeholder="01"
                        />
                        <input
                          type="text"
                          value={principle.title}
                          onChange={(e) => updateStudioPrinciple(i, 'title', e.target.value)}
                          className="principle-title-input"
                          placeholder="Title"
                        />
                      </div>
                      <textarea
                        value={principle.description}
                        onChange={(e) => updateStudioPrinciple(i, 'description', e.target.value)}
                        className="form-input form-textarea"
                        rows={2}
                        placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Action Bar */}
      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <h2 className="admin-toolbar-title">
            Projects
            <span className="admin-toolbar-count">{projects.length}</span>
            {hasChanges && <span className="unsaved-dot" title="Unsaved changes" />}
          </h2>
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                ×
              </button>
            )}
          </div>
          <div className="grid-layout-select">
            <label htmlFor="grid-layout">Bulk Layout</label>
            <select
              id="grid-layout"
              value={gridLayout}
              onChange={(e) => {
                const value = e.target.value;
                setGridLayout(value);
                // Bulk set all projects
                let newLayout: Project['layout'] = undefined;
                if (value === 'single') newLayout = 'single';
                if (value === 'auto-fit') newLayout = 'square';
                setProjects((prev) =>
                  prev.map((p) => ({ ...p, layout: newLayout }))
                );
                addToast('success', `All projects set to ${value === 'two-col' ? 'auto' : value}. Click Save All.`);
              }}
            >
              <option value="two-col">Auto (pattern)</option>
              <option value="single">All Full Width</option>
              <option value="auto-fit">All Square</option>
            </select>
          </div>
        </div>
        <div className="admin-toolbar-actions">
          <button onClick={() => setShowGridBuilder(true)} className="admin-btn text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Grid Builder
          </button>
          <button onClick={expandAll} className="admin-btn text">
            Expand All
          </button>
          <button onClick={collapseAll} className="admin-btn text">
            Collapse All
          </button>
          <button onClick={addProject} className="admin-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Project
          </button>
          <button onClick={handleSave} disabled={saving || !hasChanges} className="admin-btn primary">
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Project Cards */}
      <div className="project-list">
        {filteredProjects.map((project, index) => {
          const isExpanded = expandedSlugs.includes(project.slug);
          const isDragOver = dragOverSlug === project.slug;
          const thumb = project.images?.find((img) => img && img !== '');
          return (
            <div
              key={project.slug}
              className={`admin-project-card ${isExpanded ? 'expanded' : ''} ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, project.slug)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                const emptyIndex = project.images?.findIndex((img) => !img);
                const targetIndex = emptyIndex >= 0 ? emptyIndex : (project.images?.length || 0);
                if (emptyIndex < 0) {
                  setProjects((prev) =>
                    prev.map((p) =>
                      p.slug === project.slug ? { ...p, images: [...(p.images || []), ''] } : p
                    )
                  );
                }
                handleDrop(e, project.slug, targetIndex);
              }}
            >
              {/* Collapsed Header */}
              <div className="admin-project-card-summary" onClick={() => toggleExpand(project.slug)}>
                <div className="admin-project-card-thumb">
                  {thumb ? (
                    <img src={thumb} alt="" />
                  ) : (
                    <div className="admin-project-card-thumb-empty">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="admin-project-card-info">
                  <div className="admin-project-card-info-main">
                    <span className="admin-project-card-num">{String(index + 1).padStart(2, '0')}</span>
                    <h4 className="admin-project-card-name">{project.title}</h4>
                    {project.subtitle && <span className="admin-project-card-sub">{project.subtitle}</span>}
                  </div>
                  <div className="admin-project-card-meta-row">
                    {project.year && <span className="project-meta-tag">{project.year}</span>}
                    {project.location && <span className="project-meta-tag">{project.location}</span>}
                    <span className="project-meta-tag faint">
                      {project.images?.filter((img) => img).length || 0} images
                    </span>
                    <span className="project-meta-tag faint">
                      {project.facts?.length || 0} facts
                    </span>
                  </div>
                </div>
                <div className="admin-project-card-controls">
                  <button
                    className="project-move-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveProject(index, 'up');
                    }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    className="project-move-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveProject(index, 'down');
                    }}
                    disabled={index === projects.length - 1}
                    title="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <button
                    className="project-dup-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateProject(project.slug);
                    }}
                    title="Duplicate"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  <button
                    className="project-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.slug);
                    }}
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                  <span className={`project-expand-chevron ${isExpanded ? 'open' : ''}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Expanded Section */}
              {isExpanded && (
                <div className="project-expanded">
                  {/* Basic Info */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Slug</label>
                      <input
                        type="text"
                        value={project.slug}
                        onChange={(e) => updateProject(project.slug, { slug: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <input
                        type="text"
                        value={project.year || ''}
                        onChange={(e) => updateProject(project.slug, { year: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        value={project.location || ''}
                        onChange={(e) => updateProject(project.slug, { location: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Layout</label>
                      <select
                        value={project.layout || ''}
                        onChange={(e) => updateProject(project.slug, { layout: e.target.value as Project['layout'] })}
                        className="form-input"
                      >
                        <option value="">Auto (pattern)</option>
                        <option value="single">Single — 1 per row (16:10)</option>
                        <option value="dual">Dual — 2 per row (4:3)</option>
                        <option value="full">Full (2 cols, 16:10)</option>
                        <option value="wide">Wide (2 cols, 21:9)</option>
                        <option value="square">Square (1 col, 1:1)</option>
                        <option value="tall">Tall (1 col, 3:4)</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Visibility</label>
                      <div className="toggle-row">
                        <button
                          type="button"
                          className={`toggle-btn ${project.published !== false ? 'active' : ''}`}
                          onClick={() => updateProject(project.slug, { published: true })}
                        >
                          <span className="toggle-dot" />
                          Published
                        </button>
                        <button
                          type="button"
                          className={`toggle-btn ${project.published === false ? 'active' : ''}`}
                          onClick={() => updateProject(project.slug, { published: false })}
                        >
                          <span className="toggle-dot" />
                          Draft
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Featured</label>
                      <div className="toggle-row">
                        <button
                          type="button"
                          className={`toggle-btn ${project.featured ? 'active' : ''}`}
                          onClick={() => updateProject(project.slug, { featured: !project.featured })}
                        >
                          <span className="toggle-dot" />
                          {project.featured ? 'Featured' : 'Not featured'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="form-group">
                    <label className="form-label">Preview</label>
                    <div className="preview-wrap">
                      <div className={`project-card ${project.layout === 'square' ? 'square' : project.layout === 'tall' ? 'tall' : project.layout === 'wide' ? 'wide' : 'full'}`}>
                        <div className="project-card-img-wrap">
                          {project.images?.[0] ? (
                            <img src={project.images[0]} alt={project.title} />
                          ) : (
                            <div className="preview-no-image">No cover image</div>
                          )}
                        </div>
                        <div className="project-card-overlay">
                          <div className="project-card-info">
                            <span className="project-card-name">{project.title || 'Project Name'}</span>
                            <span className="project-card-meta">
                              {project.location || ''}
                              {project.location && project.year ? ' — ' : ''}
                              {project.year || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View on site */}
                  <div className="form-group">
                    <a
                      href={`/projects/${project.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-site-link"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                      Preview on site
                    </a>
                  </div>

                  {/* Description with AI */}
                  <div className="form-group">
                    <div className="flex items-center justify-between mb-1">
                      <label className="form-label">Description</label>
                      <button
                        onClick={() => handleAIGenerateDescription(project.slug)}
                        disabled={generatingAI?.type === 'description' && generatingAI?.slug === project.slug}
                        className="ai-btn"
                      >
                        {generatingAI?.type === 'description' && generatingAI?.slug === project.slug
                          ? 'Generating...'
                          : '✨ AI Generate'}
                      </button>
                    </div>
                    <textarea
                      value={project.description || ''}
                      onChange={(e) => updateProject(project.slug, { description: e.target.value })}
                      className="form-input form-textarea"
                      placeholder="Project description..."
                      rows={5}
                    />
                    <div className="char-count">{(project.description || '').length} characters</div>
                  </div>

                  {/* Images with Upload */}
                  <div className="form-group">
                    <label className="form-label">Images</label>
                    <div
                      className={`images-drop-zone ${isDragOver ? 'active' : ''}`}
                      onDragOver={(e) => handleDragOver(e, project.slug)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        const emptyIndex = project.images?.findIndex((img) => !img);
                        const targetIndex = emptyIndex >= 0 ? emptyIndex : (project.images?.length || 0);
                        if (emptyIndex < 0) {
                          setProjects((prev) =>
                            prev.map((p) =>
                              p.slug === project.slug ? { ...p, images: [...(p.images || []), ''] } : p
                            )
                          );
                        }
                        handleDrop(e, project.slug, targetIndex);
                      }}
                    >
                      <div className="image-grid">
                        {project.images?.map((img, i) => (
                          <div key={i} className={`image-grid-item ${img ? 'has-image' : 'empty'}`}>
                            {img ? (
                              <>
                                <img src={img} alt="" />
                                <div className="image-grid-overlay">
                                  <button
                                    onClick={() => document.getElementById(getFileInputId(project.slug, i))?.click()}
                                    className="image-grid-action"
                                    title="Replace"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                                    </svg>
                                  </button>
                                  <button onClick={() => deleteImage(project.slug, i)} className="image-grid-action" title="Remove">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button
                                onClick={() => document.getElementById(getFileInputId(project.slug, i))?.click()}
                                className="image-grid-add"
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            )}
                            <input
                              type="file"
                              id={getFileInputId(project.slug, i)}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(project.slug, i, file);
                                e.target.value = '';
                              }}
                              className="hidden"
                              accept="image/*"
                            />
                            {uploadingImage?.slug === project.slug && uploadingImage?.index === i && (
                              <div className="image-grid-loading">
                                <span>Uploading...</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addImage(project.slug)} className="image-grid-add-new">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          <span>Add</span>
                        </button>
                      </div>
                      {isDragOver && (
                        <div className="drop-zone-overlay">
                          <span>Drop image here</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Facts with AI */}
                  <div className="form-group">
                    <div className="flex items-center justify-between mb-2">
                      <label className="form-label">Facts / Details</label>
                      <button
                        onClick={() => handleAIGenerateFacts(project.slug)}
                        disabled={generatingAI?.slug === project.slug}
                        className="ai-btn"
                      >
                        {generatingAI?.type === 'facts' && generatingAI?.slug === project.slug
                          ? 'Generating...'
                          : '✨ AI Generate'}
                      </button>
                    </div>
                    <div className="facts-table">
                      {project.facts && project.facts.length > 0 && (
                        <div className="facts-table-header">
                          <span>Label</span>
                          <span>Value</span>
                        </div>
                      )}
                      {project.facts?.map((fact, i) => (
                        <div key={i} className="facts-table-row">
                          <input
                            type="text"
                            value={fact.label}
                            onChange={(e) => updateFact(project.slug, i, 'label', e.target.value)}
                            className="fact-label-input"
                            placeholder="Label"
                          />
                          <input
                            type="text"
                            value={fact.value}
                            onChange={(e) => updateFact(project.slug, i, 'value', e.target.value)}
                            className="fact-value-input"
                            placeholder="Value"
                          />
                          <button onClick={() => deleteFact(project.slug, i)} className="fact-delete-btn" title="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addFact(project.slug)} className="add-btn">
                        + Add Fact
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="no-projects">
            {searchQuery ? 'No projects match your search.' : 'No projects yet. Click "Add Project" to get started.'}
          </div>
        )}
      </div>
    </div>
  );
}
