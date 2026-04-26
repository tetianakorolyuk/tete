'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Fact } from '@/lib/types';
import { saveProjectsAction } from './actions';
import { generateDescriptionAction, generateFactsAction } from './ai-actions';

interface EditProjectsProps {
  initialProjects: Project[];
}

export default function EditProjects({ initialProjects }: EditProjectsProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState<{ slug: string; index: number } | null>(null);
  const [generatingAI, setGeneratingAI] = useState<{ type: string; slug: string } | null>(null);
  const [studioImage, setStudioImage] = useState<string>('/images/studio-hero.jpg');
  const [uploadingStudioImage, setUploadingStudioImage] = useState(false);

  // Store a ref to the latest projects for use in callbacks
  const projectsRef = useRef<Project[]>(initialProjects);
  projectsRef.current = projects;

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: projectsRef.current }),
      });
      const data = await res.json();

      if (data.success || data.message) {
        setMessage({ type: 'success', text: data.message || 'Saved!' });
        await new Promise(r => setTimeout(r, 1000));
        router.refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to save projects' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 5000);
  };

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
    setProjects(prev => [...prev, newProject]);
    setEditingSlug(newProject.slug);
  };

  const deleteProject = (slug: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter((p) => p.slug !== slug));
      if (editingSlug === slug) setEditingSlug(null);
    }
  };

  const updateProject = (slug: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map((p) => (p.slug === slug ? { ...p, ...updates } : p)));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projectsRef.current.length) return;
    const newProjects = [...projectsRef.current];
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    setProjects(newProjects);
  };

  const addFact = (slug: string) => {
    setProjects(prev => prev.map((p) =>
      p.slug === slug ? { ...p, facts: [...(p.facts || []), { label: '', value: '' }] } : p
    ));
  };

  const updateFact = (slug: string, index: number, field: 'label' | 'value', value: string) => {
    setProjects(prev => prev.map((p) =>
      p.slug === slug
        ? {
            ...p,
            facts: p.facts?.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
          }
        : p
    ));
  };

  const deleteFact = (slug: string, index: number) => {
    setProjects(prev => prev.map((p) =>
      p.slug === slug ? { ...p, facts: p.facts?.filter((_, i) => i !== index) } : p
    ));
  };

  const addImage = (slug: string) => {
    setProjects(prev => prev.map((p) =>
      p.slug === slug ? { ...p, images: [...(p.images || []), ''] } : p
    ));
  };

  const updateImage = (slug: string, index: number, value: string) => {
    console.log(`[updateImage] Setting project ${slug} image ${index} to:`, value);
    setProjects(prev => {
      const newProjects = prev.map((p) =>
        p.slug === slug
          ? { ...p, images: p.images?.map((img, i) => (i === index ? value : img)) }
          : p
      );
      console.log('[updateImage] New projects state:', newProjects.find(p => p.slug === slug)?.images);
      return newProjects;
    });
  };

  const deleteImage = (slug: string, index: number) => {
    setProjects(prev => prev.map((p) =>
      p.slug === slug ? { ...p, images: p.images?.filter((_, i) => i !== index) } : p
    ));
  };

  const handleImageUpload = useCallback(async (slug: string, imageIndex: number, file: File) => {
    console.log(`[handleImageUpload] Starting upload for ${slug} index ${imageIndex}`, file.name);
    setUploadingImage({ slug, index: imageIndex });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      console.log('[handleImageUpload] Upload response:', data);

      if (data.url) {
        console.log('[handleImageUpload] Setting image URL:', data.url);
        // Use setProjects directly to avoid stale closure
        setProjects(prev => {
          const newProjects = prev.map((p) =>
            p.slug === slug
              ? { ...p, images: p.images?.map((img, i) => (i === imageIndex ? data.url : img)) }
              : p
          );
          console.log('[handleImageUpload] Updated project images:', newProjects.find(p => p.slug === slug)?.images);
          return newProjects;
        });
        setMessage({ type: 'success', text: 'Image uploaded! Click "Save All" to persist.' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error || 'No URL in response');
      }
    } catch (err) {
      console.error('[handleImageUpload] Error:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Upload failed'
      });
      setTimeout(() => setMessage(null), 5000);
    }
    setUploadingImage(null);
  }, []);

  const handleAIGenerateDescription = useCallback(async (slug: string) => {
    const project = projectsRef.current.find((p) => p.slug === slug);
    if (!project) return;

    setGeneratingAI({ type: 'description', slug });
    const result = await generateDescriptionAction(
      project.title,
      project.subtitle || '',
      project.facts || []
    );
    if (result.success && result.description) {
      updateProject(slug, { description: result.description });
      setMessage({ type: 'success', text: 'Description generated!' });
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to generate' });
      setTimeout(() => setMessage(null), 3000);
    }
    setGeneratingAI(null);
  }, []);

  const handleAIGenerateFacts = useCallback(async (slug: string) => {
    const project = projectsRef.current.find((p) => p.slug === slug);
    if (!project) return;

    setGeneratingAI({ type: 'facts', slug });
    const result = await generateFactsAction(project.title, project.description || '');
    if (result.success && result.facts) {
      updateProject(slug, { facts: result.facts });
      setMessage({ type: 'success', text: 'Facts generated!' });
      setTimeout(() => setMessage(null), 2000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to generate' });
      setTimeout(() => setMessage(null), 3000);
    }
    setGeneratingAI(null);
  }, []);

  // Separate file input ref for each image slot
  const getFileInputId = (slug: string, index: number) => `file-${slug}-${index}`;

  const handleStudioImageUpload = useCallback(async (file: File) => {
    setUploadingStudioImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      if (data.url) {
        setStudioImage(data.url);
        // Save to settings
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ settings: { studioImage: data.url } }),
        });
        setMessage({ type: 'success', text: 'Studio image updated!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.error || 'No URL in response');
      }
    } catch (err) {
      console.error('[handleStudioImageUpload] Error:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Upload failed'
      });
      setTimeout(() => setMessage(null), 5000);
    }
    setUploadingStudioImage(false);
  }, []);

  // Load studio image on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then(({ settings }) => {
        if (settings?.studioImage) {
          setStudioImage(settings.studioImage);
        }
      })
      .catch((err) => console.warn('Failed to load studio image:', err));
  }, []);

  return (
    <div>
      {/* Studio Settings */}
      <div className="studio-settings-card">
        <h3>Studio Section Image</h3>
        <div className="studio-image-editor">
          <div className="studio-image-preview">
            <img src={studioImage} alt="Studio preview" />
          </div>
          <div className="studio-image-actions">
            <label className="admin-btn admin-btn-secondary">
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
            <p className="studio-image-note">This image appears in the About/Studio section</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="admin-action-bar">
        <h2>Projects ({projects.length})</h2>
        <div className="admin-actions">
          {message && (
            <span className={`admin-message ${message.type === 'success' ? 'success' : 'error'}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={addProject}
            className="admin-btn"
          >
            + Add Project
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn admin-btn-primary"
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.slug} className="project-card">
            {/* Card Header */}
            <div className="project-card-header">
              <div className="project-card-meta">
                <span className="project-index">#{index + 1}</span>
                <button
                  onClick={() => moveProject(index, 'up')}
                  disabled={index === 0}
                  className="project-move-btn"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveProject(index, 'down')}
                  disabled={index === projects.length - 1}
                  className="project-move-btn"
                >
                  ↓
                </button>
              </div>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateProject(project.slug, { title: e.target.value })}
                className="project-card-title"
                placeholder="Project Title"
              />
              <input
                type="text"
                value={project.subtitle || ''}
                onChange={(e) => updateProject(project.slug, { subtitle: e.target.value })}
                className="project-card-subtitle"
                placeholder="Subtitle (e.g., Living / Kitchen)"
              />
            </div>

            {/* Card Actions */}
            <div className="project-card-actions">
              <div></div>
              <div className="project-card-buttons">
                <button
                  onClick={() => setEditingSlug(editingSlug === project.slug ? null : project.slug)}
                  className="project-toggle-btn"
                >
                  {editingSlug === project.slug ? 'Collapse' : 'Expand'}
                </button>
                <button
                  onClick={() => deleteProject(project.slug)}
                  className="project-delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Expanded Section */}
            {editingSlug === project.slug && (
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
                </div>

                {/* Description with AI */}
                <div className="form-group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label">Description</label>
                    <button
                      onClick={() => handleAIGenerateDescription(project.slug)}
                      disabled={generatingAI?.slug === project.slug}
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
                  />
                </div>

                {/* Images with Upload */}
                <div className="form-group">
                  <label className="form-label">Images</label>
                  <div>
                    {project.images?.map((img, i) => (
                      <div key={i} className="image-row">
                        {img && img !== '' && (
                          <img src={img} alt="" className="image-preview" />
                        )}
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => updateImage(project.slug, i, e.target.value)}
                          className="image-input"
                          placeholder={`Image ${i + 1} URL`}
                        />
                        <input
                          type="file"
                          id={getFileInputId(project.slug, i)}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(project.slug, i, file);
                            }
                            e.target.value = '';
                          }}
                          className="hidden"
                          accept="image/*"
                        />
                        <button
                          onClick={() => document.getElementById(getFileInputId(project.slug, i))?.click()}
                          disabled={uploadingImage?.slug === project.slug && uploadingImage?.index === i}
                          className="image-upload-btn"
                        >
                          {uploadingImage?.slug === project.slug && uploadingImage?.index === i ? '...' : 'Upload'}
                        </button>
                        <button
                          onClick={() => deleteImage(project.slug, i)}
                          className="image-delete-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addImage(project.slug)}
                      className="add-btn"
                    >
                      + Add Image
                    </button>
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
                  <div>
                    {project.facts?.map((fact, i) => (
                      <div key={i} className="fact-row">
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
                        <button
                          onClick={() => deleteFact(project.slug, i)}
                          className="fact-delete-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFact(project.slug)}
                      className="add-btn"
                    >
                      + Add Fact
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
