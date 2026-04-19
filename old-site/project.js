// project.js
(window.__projectsReady || Promise.resolve()).then(() => {
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || "";
  }

  function setText(el, txt) {
    if (!el) return;
    el.textContent = txt || "";
  }

  function escapeHtml(str) {
    return (str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const bySlug = window.PROJECTS_BY_SLUG || {};

  const slug = getParam("p") || projects[0]?.slug || "";
  const project = bySlug[slug] || projects.find(p => p.slug === slug);

  const els = {
    title: $("#projectTitle"),
    subtitle: $("#projectSubtitle"),
    year: $("#projectYear"),
    location: $("#projectLocation"),
    desc: $("#projectDescription"),
    hero: $("#heroImg"),
    thumbGrid: $("#thumbGrid"),
    crumbsTitle: $("#crumbsTitle"),
    prev: $("#prevProject"),
    next: $("#nextProject"),
    lightbox: $("#lightbox"),
    lbImg: $("#lbImg"),
    lbCaption: $("#lbCaption"),
    lbPrev: $("#lbPrev"),
    lbNext: $("#lbNext"),
    lbClose: $("#lbClose"),
    facts: $("#factsGrid"),
  };

  function renderNotFound() {
    document.title = "Project — tete";
    setText(els.title, "Project not found");
    setText(els.subtitle, "");
    setText(els.desc, "This link is missing or the project slug is wrong.");
    if (els.thumbGrid) els.thumbGrid.innerHTML = "";
  }

  if (!project) {
    renderNotFound();
    return;
  }

  document.title = `${project.title} — tete`;

  setText(els.title, project.title);
  setText(els.subtitle, project.subtitle || "");
  setText(els.year, project.year || "");
  setText(els.location, project.location || "");
  setText(els.desc, project.description || "");
  setText(els.crumbsTitle, project.title);

  const images = Array.isArray(project.images) ? project.images : [];
  const heroSrc = images[0] || "";

  if (els.hero) {
    els.hero.src = heroSrc;
    els.hero.alt = `${project.title} — hero image`;
  }

  // Facts
  if (els.facts) {
    const facts = Array.isArray(project.facts) ? project.facts : [];
    const norm = facts.map((item) => {
      if (Array.isArray(item)) return { k: item[0], v: item[1] };
      if (item && typeof item === "object") return { k: item.label || item.key || "", v: item.value || "" };
      return { k: "", v: "" };
    }).filter(x => x.k || x.v);
    els.facts.innerHTML = norm.map(({k, v}) => `
      <div class="fact">
        <div class="factKey">${escapeHtml(k)}</div>
        <div class="factVal">${escapeHtml(v)}</div>
      </div>
    `).join("");
  }

  // Thumbs
  if (els.thumbGrid) {
    els.thumbGrid.innerHTML = images.map((src, i) => `
      <button class="thumb" type="button" data-i="${i}" aria-label="Open image ${i + 1}">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(project.title)} photo ${i + 1}">
      </button>
    `).join("");
  }

  // Prev / next projects
  const idx = projects.findIndex(p => p.slug === project.slug);
  const prevP = projects[(idx - 1 + projects.length) % projects.length];
  const nextP = projects[(idx + 1) % projects.length];

  if (els.prev) {
    els.prev.href = `project.html?p=${encodeURIComponent(prevP.slug)}`;
    els.prev.setAttribute("aria-label", `Previous project: ${prevP.title}`);
  }
  if (els.next) {
    els.next.href = `project.html?p=${encodeURIComponent(nextP.slug)}`;
    els.next.setAttribute("aria-label", `Next project: ${nextP.title}`);
  }

  // Lightbox
  let activeIndex = 0;

  function openLightbox(i) {
    activeIndex = Math.max(0, Math.min(images.length - 1, i));
    if (!els.lightbox || !els.lbImg) return;

    els.lbImg.src = images[activeIndex];
    els.lbImg.alt = `${project.title} — image ${activeIndex + 1}`;
    if (els.lbCaption) {
      els.lbCaption.textContent = `${project.title} — ${activeIndex + 1} / ${images.length}`;
    }
    els.lightbox.classList.add("isOpen");
    els.lightbox.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("noScroll");
  }

  function closeLightbox() {
    if (!els.lightbox) return;
    els.lightbox.classList.remove("isOpen");
    els.lightbox.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("noScroll");
  }

  function step(dir) {
    if (!images.length) return;
    const next = (activeIndex + dir + images.length) % images.length;
    openLightbox(next);
  }

  // Click hero -> open
  if (els.hero) {
    els.hero.addEventListener("click", () => openLightbox(activeIndex));
    els.hero.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(activeIndex);
      }
    });
  }

  // Click thumbs -> swap hero + open
  if (els.thumbGrid) {
    els.thumbGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".thumb");
      if (!btn) return;
      const i = Number(btn.dataset.i || "0");
      if (els.hero) {
        activeIndex = i;
        els.hero.src = images[i];
      }
      openLightbox(i);
    });
  }

  // Lightbox controls
  els.lbClose?.addEventListener("click", closeLightbox);
  els.lightbox?.addEventListener("click", (e) => {
    if (e.target === els.lightbox) closeLightbox();
  });
  els.lbPrev?.addEventListener("click", () => step(-1));
  els.lbNext?.addEventListener("click", () => step(1));

  window.addEventListener("keydown", (e) => {
    if (!els.lightbox?.classList.contains("isOpen")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
});
