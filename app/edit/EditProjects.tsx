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
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);
  const [generatingAI, setGeneratingAI] = useState<{ type: string; slug: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await saveProjectsAction(projects);
      if (result.success) {
        setMessage({ type: 'success', text: 'Projects saved! Refreshing...' });
        router.refresh(); // Refresh the page to show updated data
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save' });
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to save projects' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
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
    setProjects([...projects, newProject]);
    setEditingSlug(newProject.slug);
  };

  const deleteProject = (slug: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter((p) => p.slug !== slug));
      if (editingSlug === slug) setEditingSlug(null);
    }
  };

  const updateProject = (slug: string, updates: Partial<Project>) => {
    setProjects(projects.map((p) => (p.slug === slug ? { ...p, ...updates } : p)));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;
    const newProjects = [...projects];
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    setProjects(newProjects);
  };

  const addFact = (slug: string) => {
    setProjects(
      projects.map((p) =>
        p.slug === slug ? { ...p, facts: [...(p.facts || []), { label: '', value: '' }] } : p
      )
    );
  };

  const updateFact = (slug: string, index: number, field: 'label' | 'value', value: string) => {
    setProjects(
      projects.map((p) =>
        p.slug === slug
          ? {
              ...p,
              facts: p.facts?.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
            }
          : p
      )
    );
  };

  const deleteFact = (slug: string, index: number) => {
    setProjects(
      projects.map((p) =>
        p.slug === slug ? { ...p, facts: p.facts?.filter((_, i) => i !== index) } : p
      )
    );
  };

  const addImage = (slug: string) => {
    setProjects(
      projects.map((p) =>
        p.slug === slug ? { ...p, images: [...(p.images || []), ''] } : p
      )
    );
  };

  const updateImage = (slug: string, index: number, value: string) => {
    setProjects(
      projects.map((p) =>
        p.slug === slug
          ? { ...p, images: p.images?.map((img, i) => (i === index ? value : img)) }
          : p
      )
    );
  };

  const deleteImage = (slug: string, index: number) => {
    setProjects(
      projects.map((p) =>
        p.slug === slug ? { ...p, images: p.images?.filter((_, i) => i !== index) } : p
      )
    );
  };

  const handleImageUpload = useCallback(async (slug: string, imageIndex: number, file: File) => {
    setUploadingImage(imageIndex);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        updateImage(slug, imageIndex, data.url);
        setMessage({ type: 'success', text: 'Image uploaded!' });
        setTimeout(() => setMessage(null), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: 'error', text: 'Upload failed' });
      setTimeout(() => setMessage(null), 3000);
    }
    setUploadingImage(null);
  }, []);

  const handleAIGenerateDescription = useCallback(async (slug: string) => {
    const project = projects.find((p) => p.slug === slug);
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
  }, [projects]);

  const handleAIGenerateFacts = useCallback(async (slug: string) => {
    const project = projects.find((p) => p.slug === slug);
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
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light">Projects ({projects.length})</h2>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <button
            onClick={addProject}
            className="px-4 py-2 border border-[var(--line)] bg-white text-sm uppercase tracking-wider hover:border-[var(--accent)]"
          >
            + Add Project
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[var(--accent)] text-white text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.slug} className="border border-[var(--line2)] bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[var(--muted)] uppercase tracking-wider">#{index + 1}</span>
                  <button
                    onClick={() => moveProject(index, 'up')}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs border border-[var(--line)] disabled:opacity-30 hover:border-[var(--accent)]"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveProject(index, 'down')}
                    disabled={index === projects.length - 1}
                    className="px-2 py-1 text-xs border border-[var(--line)] disabled:opacity-30 hover:border-[var(--accent)]"
                  >
                    ↓
                  </button>
                </div>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => updateProject(project.slug, { title: e.target.value })}
                  className="text-lg font-light border-b border-transparent hover:border-[var(--line)] focus:border-[var(--accent)] focus:outline-none bg-transparent"
                  placeholder="Project Title"
                />
                <input
                  type="text"
                  value={project.subtitle || ''}
                  onChange={(e) => updateProject(project.slug, { subtitle: e.target.value })}
                  className="text-sm text-[var(--muted)] border-b border-transparent hover:border-[var(--line)] focus:border-[var(--accent)] focus:outline-none bg-transparent mt-1"
                  placeholder="Subtitle (e.g., Living / Kitchen)"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingSlug(editingSlug === project.slug ? null : project.slug)}
                  className="px-3 py-1 text-xs uppercase tracking-wider border border-[var(--line)] hover:border-[var(--accent)]"
                >
                  {editingSlug === project.slug ? 'Collapse' : 'Expand'}
                </button>
                <button
                  onClick={() => deleteProject(project.slug)}
                  className="px-3 py-1 text-xs uppercase tracking-wider text-red-600 border border-transparent hover:border-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingSlug === project.slug && (
              <div className="space-y-6 pt-4 border-t border-[var(--line2)]">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={project.slug}
                      onChange={(e) => updateProject(project.slug, { slug: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      value={project.year || ''}
                      onChange={(e) => updateProject(project.slug, { year: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={project.location || ''}
                      onChange={(e) => updateProject(project.slug, { location: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                {/* Description with AI */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs uppercase tracking-wider text-[var(--muted)]">
                      Description
                    </label>
                    <button
                      onClick={() => handleAIGenerateDescription(project.slug)}
                      disabled={generatingAI?.slug === project.slug}
                      className="text-xs px-2 py-1 bg-[var(--accent)] text-white rounded disabled:opacity-50"
                    >
                      {generatingAI?.type === 'description' && generatingAI?.slug === project.slug
                        ? 'Generating...'
                        : '✨ AI Generate'}
                    </button>
                  </div>
                  <textarea
                    value={project.description || ''}
                    onChange={(e) => updateProject(project.slug, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)] min-h-[100px]"
                    placeholder="Project description..."
                  />
                </div>

                {/* Images with Upload */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
                    Images
                  </label>
                  <div className="space-y-2">
                    {project.images?.map((img, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {img && (
                          <img src={img} alt="" className="w-12 h-12 object-cover border" />
                        )}
                        <input
                          type="text"
                          value={img}
                          onChange={(e) => updateImage(project.slug, i, e.target.value)}
                          className="flex-1 px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          placeholder={`Image ${i + 1} URL`}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(project.slug, i, file);
                          }}
                          className="hidden"
                          accept="image/*"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage === i}
                          className="px-2 py-2 text-xs border border-[var(--line)] hover:border-[var(--accent)] disabled:opacity-50"
                        >
                          {uploadingImage === i ? '...' : 'Upload'}
                        </button>
                        <button
                          onClick={() => deleteImage(project.slug, i)}
                          className="px-2 py-2 text-xs text-red-600 border border-transparent hover:border-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addImage(project.slug)}
                      className="text-xs uppercase tracking-wider text-[var(--accent)] hover:underline"
                    >
                      + Add Image
                    </button>
                  </div>
                </div>

                {/* Facts with AI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase tracking-wider text-[var(--muted)]">
                      Facts / Details
                    </label>
                    <button
                      onClick={() => handleAIGenerateFacts(project.slug)}
                      disabled={generatingAI?.slug === project.slug}
                      className="text-xs px-2 py-1 bg-[var(--accent)] text-white rounded disabled:opacity-50"
                    >
                      {generatingAI?.type === 'facts' && generatingAI?.slug === project.slug
                        ? 'Generating...'
                        : '✨ AI Generate'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {project.facts?.map((fact, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fact.label}
                          onChange={(e) => updateFact(project.slug, i, 'label', e.target.value)}
                          className="w-32 px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={fact.value}
                          onChange={(e) => updateFact(project.slug, i, 'value', e.target.value)}
                          className="flex-1 px-3 py-2 border border-[var(--line)] text-sm focus:outline-none focus:border-[var(--accent)]"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => deleteFact(project.slug, i)}
                          className="px-2 py-2 text-xs text-red-600 border border-transparent hover:border-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFact(project.slug)}
                      className="text-xs uppercase tracking-wider text-[var(--accent)] hover:underline"
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
