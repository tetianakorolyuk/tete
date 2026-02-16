// editor.js
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  const modal = $("#modal");
  const btnHelp = $("#btnHelp");
  const btnClose = $("#btnClose");

  // Show a simple warning when opened as a local file (file://)
  const localWarning = $("#localWarning");
  if (localWarning && location.protocol === "file:") {
    localWarning.hidden = false;
  }


  btnHelp?.addEventListener("click", () => { modal.hidden = false; });
  btnClose?.addEventListener("click", () => { modal.hidden = true; });
  modal?.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

  // ---- Data helpers ----
  const deepCopy = (x) => JSON.parse(JSON.stringify(x || null));

  function slugify(str) {
    return (str || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project";
  }

  function ensureUniqueSlug(base, taken) {
    let s = base;
    let n = 2;
    while (taken.has(s)) {
      s = `${base}-${n++}`;
    }
    taken.add(s);
    return s;
  }

  function normalizeProjects(list) {
    const arr = Array.isArray(list) ? deepCopy(list) : [];
    // convert images strings -> objects {src, fileName, fileData?}
    arr.forEach(p => {
      p.slug = p.slug || slugify(p.title || "");
      p.images = Array.isArray(p.images) ? p.images.map(src => ({ src })) : [];
      p.facts = Array.isArray(p.facts) ? p.facts : [];
    });
    // ensure unique slugs
    const taken = new Set();
    arr.forEach(p => {
      const base = slugify(p.slug || p.title || "project");
      p.slug = ensureUniqueSlug(base, taken);
    });
    return arr;
  }

  const state = {
    projects: normalizeProjects(window.PROJECTS || []),
    selectedIndex: 0
  };

  // ---- DOM refs ----
  const listEl = $("#projectList");
  const panelTitle = $("#panelTitle");

  const fTitle = $("#fTitle");
  const fSubtitle = $("#fSubtitle");
  const fYear = $("#fYear");
  const fLocation = $("#fLocation");
  const fSlug = $("#fSlug");
  const fDescription = $("#fDescription");

  const dropZone = $("#dropZone");
  const fileInput = $("#fileInput");
  const btnAddImages = $("#btnAddImages");
  const imageList = $("#imageList");

  const factsList = $("#factsList");
  const btnAddFact = $("#btnAddFact");

  const btnAdd = $("#btnAdd");
  const btnDelete = $("#btnDelete");
  const btnDuplicate = $("#btnDuplicate");
  const btnMoveUp = $("#btnMoveUp");
  const btnMoveDown = $("#btnMoveDown");

  const btnDownload = $("#btnDownload");

  function current() {
    return state.projects[state.selectedIndex];
  }

  function setSelected(i) {
    if (!state.projects.length) state.projects = normalizeProjects([{ title: "New Project", subtitle: "", year: "", location: "", description: "", images: [], facts: [] }]);
    state.selectedIndex = Math.max(0, Math.min(i, state.projects.length - 1));
    renderList();
    renderForm();
  }

  // ---- Rendering ----
  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = "";
    state.projects.forEach((p, idx) => {
      const div = document.createElement("div");
      div.className = "item" + (idx === state.selectedIndex ? " isActive" : "");
      div.innerHTML = `
        <div class="itemTitle">${escapeHtml(p.title || "Untitled")}</div>
        <div class="itemMeta">${escapeHtml([p.year, p.location].filter(Boolean).join(" • ") || p.slug)}</div>
      `;
      div.addEventListener("click", () => setSelected(idx));
      listEl.appendChild(div);
    });
  }

  function renderForm() {
    const p = current();
    if (!p) return;

    panelTitle.textContent = `Edit: ${p.title || "Untitled"}`;

    fTitle.value = p.title || "";
    fSubtitle.value = p.subtitle || "";
    fYear.value = p.year || "";
    fLocation.value = p.location || "";
    fSlug.value = p.slug || "";
    fDescription.value = p.description || "";

    renderImages();
    renderFacts();
  }

  function renderImages() {
    const p = current();
    imageList.innerHTML = "";

    if (!p.images.length) {
      const empty = document.createElement("div");
      empty.className = "muted tiny";
      empty.textContent = "No images yet.";
      imageList.appendChild(empty);
      return;
    }

    p.images.forEach((img, idx) => {
      const row = document.createElement("div");
      row.className = "imgRow";

      const previewSrc = img.fileObjectUrl || img.src || "";
      row.innerHTML = `
        <img class="thumb" src="${escapeAttr(previewSrc)}" alt="thumb" />
        <div class="imgMeta" title="${escapeAttr(img.src || img.originalName || "image")}">${escapeHtml(img.src || img.originalName || "image")}</div>
        <div class="imgBtns">
          <button class="iconBtn" type="button" data-act="up" title="Move up">↑</button>
          <button class="iconBtn" type="button" data-act="down" title="Move down">↓</button>
          <button class="iconBtn danger" type="button" data-act="remove" title="Remove">✕</button>
        </div>
      `;

      row.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        const act = b.getAttribute("data-act");
        if (act === "remove") {
          // revoke object URL
          if (img.fileObjectUrl) URL.revokeObjectURL(img.fileObjectUrl);
          p.images.splice(idx, 1);
          renderImages();
        } else if (act === "up") {
          if (idx === 0) return;
          const tmp = p.images[idx - 1];
          p.images[idx - 1] = p.images[idx];
          p.images[idx] = tmp;
          renderImages();
        } else if (act === "down") {
          if (idx >= p.images.length - 1) return;
          const tmp = p.images[idx + 1];
          p.images[idx + 1] = p.images[idx];
          p.images[idx] = tmp;
          renderImages();
        }
      });

      imageList.appendChild(row);
    });
  }

  function renderFacts() {
    const p = current();
    factsList.innerHTML = "";

    if (!p.facts.length) {
      const empty = document.createElement("div");
      empty.className = "muted tiny";
      empty.textContent = "No facts yet.";
      factsList.appendChild(empty);
      return;
    }

    p.facts.forEach((pair, idx) => {
      const key = Array.isArray(pair) ? (pair[0] || "") : "";
      const val = Array.isArray(pair) ? (pair[1] || "") : "";
      const row = document.createElement("div");
      row.className = "factRow";
      row.innerHTML = `
        <input type="text" value="${escapeAttr(key)}" placeholder="Label (e.g. Focus)" />
        <input type="text" value="${escapeAttr(val)}" placeholder="Value (e.g. Layout + light)" />
        <button class="iconBtn danger" type="button" title="Remove">✕</button>
      `;
      const [kEl, vEl] = row.querySelectorAll("input");
      kEl.addEventListener("input", () => { p.facts[idx][0] = kEl.value; });
      vEl.addEventListener("input", () => { p.facts[idx][1] = vEl.value; });
      row.querySelector("button").addEventListener("click", () => {
        p.facts.splice(idx, 1);
        renderFacts();
      });
      factsList.appendChild(row);
    });
  }

  // ---- Form bindings ----
  function syncSlugFromTitle() {
    const p = current();
    if (!p) return;
    const base = slugify(p.title || "project");
    const taken = new Set(state.projects.map((x, i) => (i === state.selectedIndex ? null : x.slug)).filter(Boolean));
    p.slug = ensureUniqueSlug(base, taken);
    fSlug.value = p.slug;
    renderList();
  }

  fTitle.addEventListener("input", () => {
    const p = current();
    p.title = fTitle.value;
    syncSlugFromTitle();
  });
  fSubtitle.addEventListener("input", () => { current().subtitle = fSubtitle.value; renderList(); });
  fYear.addEventListener("input", () => { current().year = fYear.value; renderList(); });
  fLocation.addEventListener("input", () => { current().location = fLocation.value; renderList(); });
  fDescription.addEventListener("input", () => { current().description = fDescription.value; });

  // ---- Images: drag/drop + file picker ----
  function addFiles(files) {
    const p = current();
    if (!p) return;
    const arr = Array.from(files || []).filter(f => (f && f.type && f.type.startsWith("image/")));
    if (!arr.length) return;

    arr.forEach(file => {
      const url = URL.createObjectURL(file);
      p.images.push({
        src: "",                 // will be filled on export
        file,
        fileObjectUrl: url,
        originalName: file.name
      });
    });

    renderImages();
  }

  btnAddImages?.addEventListener("click", () => fileInput.click());
  dropZone?.addEventListener("click", () => fileInput.click());
  fileInput?.addEventListener("change", () => {
    addFiles(fileInput.files);
    fileInput.value = "";
  });

  ["dragenter","dragover"].forEach(evt => {
    dropZone?.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropZone.classList.add("isOver");
    });
  });
  ["dragleave","drop"].forEach(evt => {
    dropZone?.addEventListener(evt, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropZone.classList.remove("isOver");
    });
  });
  dropZone?.addEventListener("drop", (e) => {
    addFiles(e.dataTransfer.files);
  });

  // ---- Facts ----
  btnAddFact?.addEventListener("click", () => {
    const p = current();
    if (!Array.isArray(p.facts)) p.facts = [];
    p.facts.push(["", ""]);
    renderFacts();
  });

  // ---- Project actions ----
  btnAdd?.addEventListener("click", () => {
    const taken = new Set(state.projects.map(p => p.slug));
    const newSlug = ensureUniqueSlug("project", taken);
    state.projects.push({
      slug: newSlug,
      title: "New Project",
      subtitle: "",
      year: "",
      location: "",
      description: "",
      images: [],
      facts: []
    });
    setSelected(state.projects.length - 1);
  });

  btnDelete?.addEventListener("click", () => {
    if (state.projects.length <= 1) return;
    const p = current();
    // revoke object urls
    (p.images || []).forEach(img => { if (img.fileObjectUrl) URL.revokeObjectURL(img.fileObjectUrl); });
    state.projects.splice(state.selectedIndex, 1);
    setSelected(Math.max(0, state.selectedIndex - 1));
  });

  btnDuplicate?.addEventListener("click", () => {
    const p = deepCopy(current());
    // do not copy file objects; keep src references
    (p.images || []).forEach(img => { delete img.file; delete img.fileObjectUrl; });
    const taken = new Set(state.projects.map(x => x.slug));
    p.slug = ensureUniqueSlug(slugify(p.slug || p.title || "project"), taken);
    p.title = (p.title || "Project") + " (copy)";
    state.projects.splice(state.selectedIndex + 1, 0, p);
    setSelected(state.selectedIndex + 1);
  });

  btnMoveUp?.addEventListener("click", () => {
    const i = state.selectedIndex;
    if (i <= 0) return;
    const tmp = state.projects[i - 1];
    state.projects[i - 1] = state.projects[i];
    state.projects[i] = tmp;
    setSelected(i - 1);
  });

  btnMoveDown?.addEventListener("click", () => {
    const i = state.selectedIndex;
    if (i >= state.projects.length - 1) return;
    const tmp = state.projects[i + 1];
    state.projects[i + 1] = state.projects[i];
    state.projects[i] = tmp;
    setSelected(i + 1);
  });

  // ---- Export zip ----
  function extFromName(name, fallback = "jpg") {
    const m = (name || "").match(/\.([a-zA-Z0-9]+)$/);
    return (m ? m[1].toLowerCase() : fallback);
  }

  async function fetchBlob(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch: ${path}`);
    return await res.blob();
  }

  function buildProjectsJs(projectsOut) {
    const clean = projectsOut.map(p => ({
      slug: p.slug || "",
      title: p.title || "",
      subtitle: p.subtitle || "",
      year: p.year || "",
      location: p.location || "",
      description: p.description || "",
      images: (p.images || []).map(x => x.src).filter(Boolean),
      facts: Array.isArray(p.facts) ? p.facts.filter(pair => Array.isArray(pair) && (pair[0] || pair[1])) : []
    }));

    const json = JSON.stringify(clean, null, 2);
    return `// projects.js\n// Generated by editor.html — you can re-run the editor anytime.\n\nwindow.PROJECTS = ${json};\n\n// Convenience index (slug -> project), used by project.js\nwindow.PROJECTS_BY_SLUG = window.PROJECTS.reduce((acc, p) => {\n  acc[p.slug] = p;\n  return acc;\n}, {});\n`;
  }

  async function exportZip() {
    if (!window.JSZip) {
      alert("JSZip failed to load. Try refreshing.");
      return;
    }

    // Validate + prepare
    const taken = new Set();
    state.projects.forEach(p => {
      p.slug = ensureUniqueSlug(slugify(p.slug || p.title || "project"), taken);
      if (!Array.isArray(p.images)) p.images = [];
      if (!Array.isArray(p.facts)) p.facts = [];
    });

    // Assign filenames to new images, and collect all needed image blobs (including existing)
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");

    const usedPaths = new Set();
    const projectsOut = deepCopy(state.projects);

    for (const p of projectsOut) {
      let counter = 1;
      for (const img of p.images) {
        // New upload
        if (img.file) {
          const ext = extFromName(img.originalName || "photo.jpg", "jpg");
          const safeName = `${p.slug}-${String(counter++).padStart(2, "0")}.${ext}`;
          const outPath = `images/${safeName}`;
          img.src = outPath;

          if (!usedPaths.has(outPath)) {
            imagesFolder.file(safeName, img.file);
            usedPaths.add(outPath);
          }
        } else if (img.src) {
          // Existing image on the site; include it in the zip too (so the zip is complete)
          const outPath = img.src;
          if (!usedPaths.has(outPath)) {
            try {
              const blob = await fetchBlob(outPath);
              const fileName = outPath.replace(/^images\//, "");
              imagesFolder.file(fileName, blob);
              usedPaths.add(outPath);
            } catch (e) {
              console.warn(e);
              // keep going; user might still have image in repo already
            }
          }
        }
      }

      // Remove empty image entries
      p.images = (p.images || []).filter(x => x.src);
    }

    // Include README.txt if present
    try {
      const readmeBlob = await fetchBlob("images/README.txt");
      imagesFolder.file("README.txt", readmeBlob);
    } catch (e) {}

    // Write projects.js
    zip.file("projects.js", buildProjectsJs(projectsOut));

    // Small instructions file
    zip.file("HOW_TO_UPDATE.txt",
`How to update the site (GitHub Pages):
1) Unzip this file.
2) Upload/replace these in your GitHub repo:
   - projects.js
   - /images (only the ones you want to change/add; you can upload the whole images folder too)
3) Commit changes.
Done.

If you're not sure: ask Flavio to do the upload.`);
    const blob = await zip.generateAsync({ type: "blob" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tete-update.zip";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 1200);
  }

  btnDownload?.addEventListener("click", exportZip);

  // ---- Escape helpers ----
  function escapeHtml(str) {
    return (str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  function escapeAttr(str) { return escapeHtml(str).replaceAll("\n", " "); }

  // init
  setSelected(0);
})();
