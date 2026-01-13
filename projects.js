/* tete/projects.js */
(() => {
  // IMPORTANT: keep this as window.PROJECTS so project.js can read it everywhere.
  window.PROJECTS = {
    "project-01": {
      title: "Noir Marble Bar",
      subtitle: "Selected Works",
      year: "2024",
      location: "Toronto, ON",
      scope: ["Interior Design", "Concept", "Visualization"],
      description:
        "A dramatic, high-contrast space where stone and shadow do the talking. Warm linear lighting reveals texture and depth while keeping the overall feel quiet and premium.",
      images: [
        { src: "./images/project-01-a.jpg", alt: "Dark marble bar with backlit shelving" },
        { src: "./images/project-01-b.jpg", alt: "Concrete and wood open-plan living space" }
      ]
    },

    "project-02": {
      title: "Arches Suite",
      subtitle: "Selected Works",
      year: "2024",
      location: "Private Residence",
      scope: ["Interior Design", "Styling", "Visualization"],
      description:
        "Soft light, natural textures, and calm geometry. The palette stays minimal so the architecture feels timeless and effortless.",
      images: [
        { src: "./images/project-02-a.jpg", alt: "Minimal suite with arched portals and warm light" },
        { src: "./images/project-02-b.jpg", alt: "Minimal kitchen with warm wood and stone island" }
      ]
    },

    "project-03": {
      title: "Lakeside Living",
      subtitle: "Selected Works",
      year: "2023",
      location: "Private Residence",
      scope: ["Interior Design", "FF&E", "Visualization"],
      description:
        "A quiet living room designed around the view. Layers of neutrals keep the interior calm while the landscape stays the hero.",
      images: [
        { src: "./images/project-03-a.jpg", alt: "Modern living space with soft modular sofa" },
        { src: "./images/project-03-b.jpg", alt: "Living room with fireplace and mountain view" }
      ]
    }
  };
})();
