// edit-mode.js — Complete inline editing system for tete portfolio
// Must load BEFORE projects are rendered (place before closing </body> but after projects.js)
// Activate: ?edit=secret or Ctrl+Shift+E x3

(function() {
  'use strict';

  // ============================================
  // EARLY DRAFT LOADING (before projects render)
  // ============================================
  const STORAGE_KEY = 'tete_edit_draft_v1';
  const originalProjects = JSON.stringify(window.PROJECTS || []);
  let hasChanges = false;
  let editMode = false;
  let uploadedImages = {};

  // Try to load draft immediately
  function loadDraftEarly() {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace projects with draft
          window.PROJECTS = parsed;
          // Update index
          window.PROJECTS_BY_SLUG = parsed.reduce((acc, p) => { acc[p.slug] = p; return acc; }, {});
          hasChanges = true;
          console.log('[Edit Mode] Draft loaded:', parsed.length, 'projects');
          return true;
        }
      }
    } catch (e) {
      console.warn('[Edit Mode] Draft load failed:', e);
    }
    return false;
  }

  // Load draft immediately
  loadDraftEarly();

  // Also hook into async loading if content-loader is used
  window.addEventListener('projects:ready', () => {
    // Content loader finished, check if we have a draft
    if (localStorage.getItem(STORAGE_KEY)) {
      loadDraftEarly();
    }
  });

  // ============================================
  // EDIT MODE INITIALIZATION
  // ============================================

  // State
  let editKeyCount = 0;
  let editKeyTimer = null;
  const SECRET_CODE = 'edit=secret';
  const ACTIVATION_KEYS = 3;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('edit-mode-styles')) return;
    const style = document.createElement('style');
    style.id = 'edit-mode-styles';
    style.textContent = `
      /* ========================================
         EDIT MODE - Integrated with tete design
         ======================================== */

      /* Toolbar - matches site aesthetic */
      .edit-toolbar {
        position: fixed;
        top: 100px;
        right: 0;
        z-index: 10000;
        background: rgba(251, 250, 247, 0.98);
        border-left: 1px solid rgba(21, 19, 17, 0.14);
        border-top: 1px solid rgba(21, 19, 17, 0.14);
        border-bottom: 1px solid rgba(21, 19, 17, 0.14);
        border-radius: 12px 0 0 12px;
        padding: 20px;
        box-shadow: -4px 10px 40px rgba(0,0,0,0.12);
        font-family: Inter, system-ui, sans-serif;
        width: 260px;
        transform: translateX(110%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(20px);
      }
      .edit-toolbar.active {
        transform: translateX(0);
      }
      .edit-toolbar-header {
        margin-bottom: 16px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(21, 19, 17, 0.08);
      }
      .edit-toolbar-title {
        font-family: "Roboto Slab", serif;
        font-size: 20px;
        font-weight: 300;
        color: #151311;
        margin: 0 0 4px 0;
      }
      .edit-status {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #6d6863;
        transition: color 0.2s;
      }
      .edit-status.changed {
        color: #ff9500;
      }
      .edit-status.saved {
        color: #28a745;
      }

      /* Buttons */
      .edit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 10px;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(21, 19, 17, 0.14);
        border-radius: 8px;
        color: #151311;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }
      .edit-btn:hover {
        border-color: rgba(255, 149, 0, 0.55);
        background: rgba(255, 149, 0, 0.05);
      }
      .edit-btn.primary {
        background: #ff9500;
        border-color: #ff9500;
        color: #fff;
      }
      .edit-btn.primary:hover {
        background: #ffb347;
      }
      .edit-btn.danger {
        background: rgba(255, 68, 68, 0.08);
        border-color: rgba(255, 68, 68, 0.3);
        color: #ff4444;
      }
      .edit-btn.danger:hover {
        background: rgba(255, 68, 68, 0.15);
      }
      .edit-btn svg {
        width: 16px;
        height: 16px;
      }

      /* Project Edit Controls */
      .edit-project-controls {
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        gap: 6px;
        opacity: 0;
        transform: translateY(-8px);
        transition: all 0.25s ease;
        z-index: 100;
        pointer-events: none;
      }
      .edit-mode .projectBlock:hover .edit-project-controls {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .edit-project-btn {
        width: 36px;
        height: 36px;
        background: rgba(251, 250, 247, 0.95);
        border: 1px solid rgba(21, 19, 17, 0.14);
        border-radius: 8px;
        color: #151311;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .edit-project-btn:hover {
        border-color: #ff9500;
        background: #fff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      }
      .edit-project-btn.delete:hover {
        border-color: #ff4444;
        background: rgba(255, 68, 68, 0.05);
        color: #ff4444;
      }

      /* Inline Edit Fields */
      .edit-field {
        position: relative;
        border: 2px solid transparent;
        border-radius: 6px;
        padding: 4px 8px;
        margin: -4px -8px;
        transition: all 0.2s ease;
        cursor: text;
      }
      .edit-mode .edit-field:hover {
        border-color: rgba(255, 149, 0, 0.4);
        background: rgba(255, 149, 0, 0.03);
      }
      .edit-mode .edit-field:hover::after {
        content: '✎';
        position: absolute;
        right: -20px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        color: #ff9500;
        opacity: 0.6;
      }
      .edit-field.editing {
        border-color: #ff9500;
        background: #fff;
        color: #151311;
        outline: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      .edit-field.editing::after {
        display: none !important;
      }
      .edit-field textarea {
        width: 100%;
        min-height: 100px;
        max-height: 300px;
        resize: vertical;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        border: none;
        background: transparent;
        outline: none;
        padding: 0;
        color: inherit;
      }

      /* Image Edit Overlay */
      .edit-image-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: rgba(21, 19, 17, 0.85);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 50;
        pointer-events: none;
      }
      .edit-mode .projectMedia:hover .edit-image-overlay {
        opacity: 1;
        pointer-events: auto;
      }
      .edit-image-btn {
        background: rgba(255, 255, 255, 0.95);
        border: none;
        border-radius: 8px;
        color: #151311;
        padding: 14px 28px;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .edit-image-btn:hover {
        background: #fff;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      }

      /* Add Project Button */
      .edit-add-project {
        margin-top: 60px;
        padding: 80px 40px;
        border: 2px dashed rgba(21, 19, 17, 0.14);
        border-radius: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: transparent;
        display: none;
      }
      .edit-mode .edit-add-project {
        display: block;
      }
      .edit-add-project:hover {
        border-color: #ff9500;
        background: rgba(255, 149, 0, 0.03);
        transform: translateY(-4px);
      }
      .edit-add-project-icon {
        font-size: 56px;
        color: rgba(21, 19, 17, 0.2);
        margin-bottom: 16px;
        font-weight: 200;
        transition: all 0.3s ease;
      }
      .edit-add-project:hover .edit-add-project-icon {
        color: #ff9500;
        transform: scale(1.1);
      }
      .edit-add-project-text {
        color: #6d6863;
        font-size: 14px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        transition: color 0.2s;
      }
      .edit-add-project:hover .edit-add-project-text {
        color: #ff9500;
      }

      /* Exit Button */
      .edit-exit-btn {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10000;
        background: rgba(255, 68, 68, 0.95);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 14px 24px;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 500;
        cursor: pointer;
        transform: translateY(200%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 16px rgba(255, 68, 68, 0.3);
      }
      .edit-mode .edit-exit-btn {
        transform: translateY(0);
      }
      .edit-exit-btn:hover {
        background: #ff4444;
        transform: translateY(-2px);
      }

      /* Edit Mode Visual States */
      .edit-mode .projectBlock {
        position: relative;
      }
      .edit-mode .projectBlock::before {
        content: '';
        position: absolute;
        inset: -16px;
        border: 2px dashed transparent;
        border-radius: 20px;
        pointer-events: none;
        transition: all 0.3s ease;
      }
      .edit-mode .projectBlock:hover::before {
        border-color: rgba(255, 149, 0, 0.2);
        background: rgba(255, 149, 0, 0.01);
      }

      /* Initial states */
      .edit-project-controls,
      .edit-image-overlay {
        display: none;
      }
      .edit-mode .edit-project-controls {
        display: flex;
      }
      .edit-mode .edit-image-overlay {
        display: flex;
      }

      /* Keyboard hint */
      .edit-hint {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(21, 19, 17, 0.08);
        font-size: 11px;
        color: #6d6863;
        line-height: 1.6;
      }
      .edit-hint kbd {
        background: rgba(21, 19, 17, 0.06);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: inherit;
        font-size: 10px;
      }

      /* Mobile */
      @media (max-width: 720px) {
        .edit-toolbar {
          width: calc(100vw - 40px);
          top: auto;
          bottom: 80px;
          right: 20px;
          left: 20px;
          border-radius: 12px;
          border: 1px solid rgba(21, 19, 17, 0.14);
          transform: translateY(150%);
        }
        .edit-toolbar.active {
          transform: translateY(0);
        }
        .edit-project-controls {
          top: 8px;
          right: 8px;
        }
        .edit-project-btn {
          width: 32px;
          height: 32px;
          font-size: 12px;
        }
      }

      /* Edit modal for new project */
      .edit-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(21, 19, 17, 0.75);
        z-index: 20000;
        display: none;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      }
      .edit-modal-overlay.active {
        display: flex;
      }
      .edit-modal {
        background: var(--bg, #fbfaf7);
        border-radius: 16px;
        padding: 32px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .edit-modal h3 {
        font-family: "Roboto Slab", serif;
        font-weight: 300;
        font-size: 28px;
        margin: 0 0 24px 0;
        color: #151311;
      }
      .edit-form-field {
        margin-bottom: 20px;
      }
      .edit-form-field label {
        display: block;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #6d6863;
        margin-bottom: 8px;
      }
      .edit-form-field input,
      .edit-form-field textarea {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(21, 19, 17, 0.14);
        border-radius: 8px;
        font-family: inherit;
        font-size: 15px;
        background: #fff;
        color: #151311;
      }
      .edit-form-field input:focus,
      .edit-form-field textarea:focus {
        outline: none;
        border-color: #ff9500;
      }
      .edit-form-field textarea {
        min-height: 100px;
        resize: vertical;
      }
      .edit-modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
      }
      .edit-modal-btn {
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
      }
      .edit-modal-btn.cancel {
        background: transparent;
        border: 1px solid rgba(21, 19, 17, 0.14);
        color: #6d6863;
      }
      .edit-modal-btn.cancel:hover {
        border-color: #151311;
        color: #151311;
      }
      .edit-modal-btn.save {
        background: #ff9500;
        border: none;
        color: #fff;
      }
      .edit-modal-btn.save:hover {
        background: #ffb347;
      }
    `;
    document.head.appendChild(style);
  }

  // Create toolbar
  function createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'edit-toolbar';
    toolbar.id = 'edit-toolbar';
    toolbar.innerHTML = `
      <div class="edit-toolbar-header">
        <div class="edit-toolbar-title">Edit Mode</div>
        <div class="edit-status" id="edit-status">${hasChanges ? 'Draft loaded' : 'Ready'}</div>
      </div>
      <button class="edit-btn primary" id="edit-btn-download">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export
      </button>
      <button class="edit-btn" id="edit-btn-add">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Project
      </button>
      <button class="edit-btn danger" id="edit-btn-reset">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Reset
      </button>
      <div class="edit-hint">
        <kbd>Click</kbd> text to edit • <kbd>Enter</kbd> to save
      </div>
    `;
    document.body.appendChild(toolbar);

    // Exit button
    const exitBtn = document.createElement('button');
    exitBtn.className = 'edit-exit-btn';
    exitBtn.textContent = 'Exit';
    exitBtn.onclick = deactivateEditMode;
    document.body.appendChild(exitBtn);

    // Bind events
    document.getElementById('edit-btn-download').onclick = exportChanges;
    document.getElementById('edit-btn-add').onclick = openAddProjectModal;
    document.getElementById('edit-btn-reset').onclick = resetChanges;
  }

  // Create modal for adding/editing projects
  function createModal() {
    if (document.getElementById('edit-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'edit-modal-overlay';
    overlay.className = 'edit-modal-overlay';
    overlay.innerHTML = `
      <div class="edit-modal">
        <h3 id="edit-modal-title">Add New Project</h3>
        <div class="edit-form">
          <div class="edit-form-field">
            <label>Title</label>
            <input type="text" id="edit-field-title" placeholder="Project Name">
          </div>
          <div class="edit-form-field">
            <label>Subtitle</label>
            <input type="text" id="edit-field-subtitle" placeholder="e.g. Living / Kitchen">
          </div>
          <div class="edit-form-field">
            <label>Year</label>
            <input type="text" id="edit-field-year" placeholder="${new Date().getFullYear()}">
          </div>
          <div class="edit-form-field">
            <label>Location</label>
            <input type="text" id="edit-field-location" placeholder="Toronto">
          </div>
          <div class="edit-form-field">
            <label>Description</label>
            <textarea id="edit-field-description" placeholder="Describe the project..."></textarea>
          </div>
        </div>
        <div class="edit-modal-actions">
          <button class="edit-modal-btn cancel" onclick="closeEditModal()">Cancel</button>
          <button class="edit-modal-btn save" id="edit-modal-save">Save</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeEditModal();
    });

    // Save button
    document.getElementById('edit-modal-save').onclick = saveProjectFromModal;
  }

  function openAddProjectModal() {
    createModal();
    document.getElementById('edit-modal-title').textContent = 'Add New Project';
    document.getElementById('edit-field-title').value = '';
    document.getElementById('edit-field-subtitle').value = '';
    document.getElementById('edit-field-year').value = new Date().getFullYear().toString();
    document.getElementById('edit-field-location').value = '';
    document.getElementById('edit-field-description').value = '';
    document.getElementById('edit-modal-overlay').classList.add('active');
    window.editingProjectIndex = -1;
  }

  function openEditProjectModal(index) {
    const p = window.PROJECTS[index];
    if (!p) return;

    createModal();
    document.getElementById('edit-modal-title').textContent = 'Edit Project';
    document.getElementById('edit-field-title').value = p.title || '';
    document.getElementById('edit-field-subtitle').value = p.subtitle || '';
    document.getElementById('edit-field-year').value = p.year || '';
    document.getElementById('edit-field-location').value = p.location || '';
    document.getElementById('edit-field-description').value = p.description || '';
    document.getElementById('edit-modal-overlay').classList.add('active');
    window.editingProjectIndex = index;
  }

  window.closeEditModal = function() {
    document.getElementById('edit-modal-overlay')?.classList.remove('active');
    window.editingProjectIndex = null;
  };

  function saveProjectFromModal() {
    const title = document.getElementById('edit-field-title').value.trim();
    if (!title) {
      alert('Please enter a project title');
      return;
    }

    const projectData = {
      title: title,
      subtitle: document.getElementById('edit-field-subtitle').value.trim(),
      year: document.getElementById('edit-field-year').value.trim(),
      location: document.getElementById('edit-field-location').value.trim(),
      description: document.getElementById('edit-field-description').value.trim(),
    };

    if (window.editingProjectIndex >= 0) {
      // Edit existing
      const p = window.PROJECTS[window.editingProjectIndex];
      Object.assign(p, projectData);
    } else {
      // Add new
      const newProject = {
        slug: 'project-' + Date.now().toString().slice(-6),
        ...projectData,
        images: [],
        facts: [
          ['Focus', ''],
          ['Palette', ''],
          ['Details', ''],
          ['Mood', '']
        ]
      };
      window.PROJECTS.push(newProject);
    }

    saveDraft();
    closeEditModal();
    location.reload();
  }

  // Update status
  function updateStatus(text, type) {
    const status = document.getElementById('edit-status');
    if (!status) return;
    status.textContent = text;
    status.className = 'edit-status' + (type ? ' ' + type : '');
  }

  // Check URL for activation
  function checkUrlActivation() {
    return window.location.search.includes(SECRET_CODE);
  }

  // Keyboard activation
  function setupKeyboardActivation() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        editKeyCount++;
        if (editKeyTimer) clearTimeout(editKeyTimer);
        editKeyTimer = setTimeout(() => editKeyCount = 0, 800);
        if (editKeyCount >= ACTIVATION_KEYS) {
          editKeyCount = 0;
          if (!editMode) activateEditMode();
        }
      }
    });
  }

  // Activate edit mode
  function activateEditMode() {
    if (editMode) return;
    editMode = true;
    document.body.classList.add('edit-mode');
    document.getElementById('edit-toolbar')?.classList.add('active');

    injectProjectControls();
    updateStatus(hasChanges ? 'Unsaved changes' : 'Ready', hasChanges ? 'changed' : '');
  }

  // Deactivate
  function deactivateEditMode() {
    editMode = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-toolbar')?.classList.remove('active');
  }

  // Inject controls into rendered projects
  function injectProjectControls() {
    const projects = document.querySelectorAll('.projectBlock');

    projects.forEach((project, index) => {
      if (project.querySelector('.edit-project-controls')) return;

      // Control buttons
      const controls = document.createElement('div');
      controls.className = 'edit-project-controls';
      controls.innerHTML = `
        <button class="edit-project-btn" title="Edit details" onclick="window.editProjectDetails(${index})">✎</button>
        <button class="edit-project-btn" title="Move up" onclick="window.moveProject(${index}, -1)">↑</button>
        <button class="edit-project-btn" title="Move down" onclick="window.moveProject(${index}, 1)">↓</button>
        <button class="edit-project-btn" title="Duplicate" onclick="window.duplicateProject(${index})">⎘</button>
        <button class="edit-project-btn delete" title="Delete" onclick="window.deleteProject(${index})">×</button>
      `;
      project.appendChild(controls);

      // Make editable fields
      const title = project.querySelector('h2');
      const subtitle = project.querySelector('.meta');
      const desc = project.querySelector('.projectDesc');

      if (title) makeEditable(title, 'title', index);
      if (subtitle) makeEditable(subtitle, 'subtitle', index);
      if (desc) makeEditable(desc, 'description', index);

      // Image overlay
      const media = project.querySelector('.projectMedia');
      if (media) {
        const overlay = document.createElement('div');
        overlay.className = 'edit-image-overlay';
        overlay.innerHTML = `
          <button class="edit-image-btn" onclick="window.addImagesToProject(${index})">Add Images</button>
          <button class="edit-image-btn" onclick="window.editFacts(${index})">Edit Facts</button>
        `;
        media.appendChild(overlay);
      }
    });

    // Add "Add Project" button at end
    const mount = document.getElementById('projectsMount');
    if (mount && !document.getElementById('edit-add-project')) {
      const addBtn = document.createElement('div');
      addBtn.id = 'edit-add-project';
      addBtn.className = 'edit-add-project';
      addBtn.innerHTML = `
        <div class="edit-add-project-icon">+</div>
        <div class="edit-add-project-text">Add New Project</div>
      `;
      addBtn.onclick = openAddProjectModal;
      mount.appendChild(addBtn);
    }
  }

  // Make element editable inline
  function makeEditable(el, field, projectIndex) {
    el.classList.add('edit-field');

    el.addEventListener('click', (e) => {
      if (!editMode || el.classList.contains('editing')) return;
      e.preventDefault();
      e.stopPropagation();

      const originalText = el.textContent.trim();
      const isDesc = field === 'description';

      if (isDesc) {
        const textarea = document.createElement('textarea');
        textarea.value = originalText;
        el.innerHTML = '';
        el.appendChild(textarea);
        textarea.focus();

        const save = () => {
          const newText = textarea.value.trim();
          el.textContent = newText || originalText;
          el.classList.remove('editing');
          if (newText && newText !== originalText) {
            updateProjectData(projectIndex, field, newText);
          }
        };

        textarea.addEventListener('blur', save, { once: true });
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && e.ctrlKey) save();
          if (e.key === 'Escape') {
            el.textContent = originalText;
            el.classList.remove('editing');
          }
        });
      } else {
        el.contentEditable = 'true';
        el.classList.add('editing');

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const save = () => {
          el.contentEditable = 'false';
          el.classList.remove('editing');
          const newText = el.textContent.trim();
          if (newText && newText !== originalText) {
            updateProjectData(projectIndex, field, newText);
          } else if (!newText) {
            el.textContent = originalText;
          }
        };

        el.addEventListener('blur', save, { once: true });
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            el.blur();
          }
          if (e.key === 'Escape') {
            el.textContent = originalText;
            el.contentEditable = 'false';
            el.classList.remove('editing');
          }
        });
      }

      el.classList.add('editing');
    });
  }

  // Update project data
  function updateProjectData(index, field, value) {
    if (window.PROJECTS?.[index]) {
      window.PROJECTS[index][field] = value;
      hasChanges = true;
      saveDraft();
      updateStatus('Unsaved changes', 'changed');
    }
  }

  // Save to localStorage
  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(window.PROJECTS));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  // ============================================
  // GLOBAL FUNCTIONS (exposed to window)
  // ============================================

  window.moveProject = function(index, dir) {
    if (!window.PROJECTS) return;
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= window.PROJECTS.length) return;

    [window.PROJECTS[index], window.PROJECTS[newIndex]] =
    [window.PROJECTS[newIndex], window.PROJECTS[index]];

    saveDraft();
    location.reload();
  };

  window.duplicateProject = function(index) {
    if (!window.PROJECTS?.[index]) return;

    const copy = JSON.parse(JSON.stringify(window.PROJECTS[index]));
    copy.title += ' (Copy)';
    copy.slug += '-copy-' + Date.now().toString().slice(-4);

    window.PROJECTS.splice(index + 1, 0, copy);
    saveDraft();
    location.reload();
  };

  window.deleteProject = function(index) {
    if (!window.PROJECTS || !confirm('Delete this project?')) return;

    window.PROJECTS.splice(index, 1);
    saveDraft();
    location.reload();
  };

  window.editProjectDetails = function(index) {
    openEditProjectModal(index);
  };

  window.addImagesToProject = function(index) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      const project = window.PROJECTS[index];
      if (!project.images) project.images = [];

      files.forEach((file, i) => {
        const ext = file.name.split('.').pop();
        const filename = `${project.slug}-${project.images.length + i + 1}.${ext}`;
        project.images.push(`images/${filename}`);

        // Store for potential upload
        if (!uploadedImages[index]) uploadedImages[index] = [];
        uploadedImages[index].push({ file, filename });
      });

      saveDraft();
      hasChanges = true;
      updateStatus('Images added', 'changed');
      location.reload();
    };
    input.click();
  };

  window.editFacts = function(index) {
    const project = window.PROJECTS[index];
    if (!project) return;

    // Simple prompt-based fact editing for now
    const factsText = project.facts.map(f => `${f[0]}: ${f[1]}`).join('\n');
    const newFacts = prompt('Edit facts (Label: Value, one per line):', factsText);
    if (newFacts !== null) {
      project.facts = newFacts.split('\n')
        .map(line => {
          const parts = line.split(':');
          return [parts[0]?.trim() || '', parts.slice(1).join(':').trim() || ''];
        })
        .filter(f => f[0]);
      saveDraft();
      location.reload();
    }
  };

  // ============================================
  // EXPORT & RESET
  // ============================================

  function resetChanges() {
    if (!confirm('Reset all changes to original?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  async function exportChanges() {
    if (!window.PROJECTS?.length) {
      updateStatus('Nothing to export', 'changed');
      return;
    }

    try {
      const content = `// projects.js
// Exported: ${new Date().toLocaleString()}

window.PROJECTS = ${JSON.stringify(window.PROJECTS, null, 2)};

window.PROJECTS_BY_SLUG = window.PROJECTS.reduce((acc, p) => {
  acc[p.slug] = p;
  return acc;
}, {});
`;

      const blob = new Blob([content], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'projects.js';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      hasChanges = false;
      updateStatus('Exported!', 'saved');
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Export failed:', e);
      updateStatus('Export failed', 'changed');
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    injectStyles();
    createToolbar();
    setupKeyboardActivation();

    // Auto-activate if URL has secret
    if (checkUrlActivation()) {
      // Wait for DOM and projects to render
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(activateEditMode, 100);
        });
      } else {
        setTimeout(activateEditMode, 100);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also re-inject controls after any dynamic content loads
  window.addEventListener('load', () => {
    if (editMode) {
      setTimeout(injectProjectControls, 500);
    }
  });
})();
