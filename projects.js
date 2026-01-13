/* tete/project.js */
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || "";
  }

  function normalizeKey(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/_/g, "-");
  }

  function pickProjectKey() {
    const raw = getParam("p");
    const key = normalizeKey(raw);
    const projects = window.PROJECTS || {};
    if (projects[key]) return key;

    // If someone passes "project01" or "01" etc
    const alt1 = key.replace(/project(\d+)/, "project-$1");
    if (projects[alt1]) return alt1;

    const alt2 = key.replace(/project-?0?(\d+)/, (_, n) => `project-${String(n).padStart(2, "0")}`);
    if (projects[alt2]) return alt2;

    // fallback: first project
    return Object.keys(projects)[0] || "";
  }

  function setText(sel, text) {
    const el = $(sel);
    if (el) el.textContent = text;
  }

  function buildThumbs(images) {
    const wrap = $("#thumbGrid");
    wrap.innerHTML = "";

    images.forEach((img, idx) => {
      const b = document.createElement("button");
      b.className = "thumb";
      b.type = "button";
      b.setAttribute("data-idx", String(idx));
      b.setAttribute("aria-label", `Open image ${idx + 1} of ${images.length}`);

      const im = document.createElement("img");
      im.src = img.src;
      im.alt = img.alt || "";
      im.loading = "lazy";
      im.decoding = "async";

      const icon = document.createElement("span");
      icon.className = "zoomMark";
      icon.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 105.07 13.02l3.7 3.7a1 1 0 001.41-1.42l-3.7-3.7A7.5 7.5 0 0010.5 3zm0 2a5.5 5.5 0 110 11 5.5 5.5 0 010-11z"/>
          <path d="M10.5 7a1 1 0 011 1v1.5H13a1 1 0 110 2h-1.5V13a1 1 0 11-2 0v-1.5H8a1 1 0 110-2h1.5V8a1 1 0 011-1z"/>
        </svg>
      `;

      b.appendChild(im);
      b.appendChild(icon);
      wrap.appendChild(b);
    });
  }

  // ----- Lightbox -----
  let LB = null;
  let LB_INDEX = 0;
  let LB_IMAGES = [];

  function ensureLightbox() {
    if (LB) return;

    LB = document.createElement("div");
    LB.id = "lightbox";
    LB.className = "lb";
    LB.innerHTML = `
      <div class="lbScrim" data-close="1"></div>

      <div class="lbFrame" role="dialog" aria-modal="true" aria-label="Image viewer">
        <button class="lbClose" type="button" aria-label="Close (Esc)" data-close="1">
          <span aria-hidden="true">✕</span>
        </button>

        <button class="lbNav lbPrev" type="button" aria-label="Previous (←)">
          <span aria-hidden="true">←</span>
        </button>

        <figure class="lbFigure">
          <img class="lbImg" alt="" />
          <figcaption class="lbCap">
            <span class="lbCount"></span>
            <span class="lbAlt"></span>
          </figcaption>
        </figure>

        <button class="lbNav lbNext" type="button" aria-label="Next (→)">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    `;

    document.body.appendChild(LB);

    LB.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("[data-close='1']")) closeLightbox();
    });

    $(".lbPrev").addEventListener("click", () => showLightbox(LB_INDEX - 1));
    $(".lbNext").addEventListener("click", () => showLightbox(LB_INDEX + 1));

    document.addEventListener("keydown", (e) => {
      if (!document.body.classList.contains("lbOpen")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showLightbox(LB_INDEX - 1);
      if (e.key === "ArrowRight") showLightbox(LB_INDEX + 1);
    });
  }

  function openLightbox(images, startIndex) {
    ensureLightbox();
    LB_IMAGES = images || [];
    showLightbox(startIndex || 0);
    document.body.classList.add("lbOpen");
  }

  function closeLightbox() {
    document.body.classList.remove("lbOpen");
  }

  function showLightbox(i) {
    if (!LB_IMAGES.length) return;
    const max = LB_IMAGES.length;
    LB_INDEX = (i + max) % max;

    const item = LB_IMAGES[LB_INDEX];
    const imgEl = $(".lbImg");
    imgEl.src = item.src;
    imgEl.alt = item.alt || "";

    $(".lbCount").textContent = `Image ${LB_INDEX + 1} of ${max}`;
    $(".lbAlt").textContent = item.alt ? ` — ${item.alt}` : "";
  }

  function bindGallery(images) {
    // Click hero
    $("#heroBtn").addEventListener("click", () => openLightbox(images, 0));
    $("#heroImg").addEventListener("click", () => openLightbox(images, 0));

    // Click thumbs
    $("#thumbGrid").addEventListener("click", (e) => {
      const btn = e.target.closest(".thumb");
      if (!btn) return;
      const idx = Number(btn.getAttribute("data-idx") || "0");
      openLightbox(images, idx);
    });
  }

  function render() {
    const projects = window.PROJECTS || {};
    const key = pickProjectKey();
    const p = projects[key];

    if (!p) {
      // fail-safe: show something readable
      document.body.innerHTML = "<div style='padding:24px;font-family:system-ui'>Project not found.</div>";
      return;
    }

    // Header
    setText("#pageTitle", p.title);
    setText("#projTitle", p.title);
    setText("#projSubtitle", p.subtitle || "Selected Works");
    setText("#projDesc", p.description || "");

    setText("#metaYear", p.year || "");
    setText("#metaLoc", p.location || "");
    setText("#metaScope", (p.scope || []).join(" · "));

    // Hero image = first image
    const hero = p.images && p.images[0] ? p.images[0] : null;
    if (hero) {
      const hi = $("#heroImg");
      hi.src = hero.src;
      hi.alt = hero.alt || p.title || "Project image";
    }

    // Thumbnails = all images
    const images = (p.images || []).filter(Boolean);
    buildThumbs(images);
    bindGallery(images);

    // Highlight current project link if you have multiple
    $$(".projLink").forEach((a) => {
      if (a.getAttribute("href")?.includes(`p=${key}`)) a.classList.add("active");
    });
  }

  // Hamburger
  function bindMenu() {
    const btn = $("#menuBtn");
    const panel = $("#mobileNav");
    if (!btn || !panel) return;

    const close = () => {
      panel.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", () => {
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
    });

    panel.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindMenu();
    render();
  });
})();
