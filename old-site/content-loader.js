// content-loader.js
// Loads content/projects.json and exposes window.PROJECTS for the site.
(function () {
  async function load() {
    try {
      const res = await fetch("content/projects.json", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.projects) ? data.projects : []);
      window.PROJECTS = list;
      window.PROJECTS_BY_SLUG = Object.fromEntries(list.map(p => [p.slug, p]));
      window.dispatchEvent(new CustomEvent("projects:ready", { detail: { projects: list } }));
      return list;
    } catch (e) {
      window.PROJECTS = window.PROJECTS || [];
      window.PROJECTS_BY_SLUG = window.PROJECTS_BY_SLUG || {};
      return window.PROJECTS;
    }
  }

  window.__projectsReady = load();
})();
