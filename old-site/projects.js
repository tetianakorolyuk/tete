// projects.js
// Edit this file to add more projects. The site updates automatically.

window.PROJECTS = [
  {
    slug: "project-01",
    title: "Project 01",
    subtitle: "Living / Kitchen",
    year: "2025",
    location: "Toronto",
    description: "A calm, light-filled living space with warm wood and tactile neutrals. The layout stays open for flow, with clean lines and soft volumes.",
    images: [
      "images/project-01-a.jpg",
      "images/project-01-b.jpg"
    ],
    facts: [
      ["Focus", "Layout + light"],
      ["Palette", "Natural oak, stone, soft linen"],
      ["Details", "Integrated storage, minimal hardware"],
      ["Mood", "Quiet, modern, warm"]
    ]
  },
  {
    slug: "project-02",
    title: "Project 02",
    subtitle: "Residential",
    year: "2025",
    location: "Toronto",
    description: "A residential concept built around simplicity and proportion. Materials stay honest and restrained, letting texture do the work.",
    images: [
      "images/project-02-a.jpg",
      "images/project-02-b.jpg"
    ],
    facts: [
      ["Focus", "Comfort + proportion"],
      ["Palette", "Soft whites, warm timber, matte finishes"],
      ["Details", "Custom millwork, seamless transitions"],
      ["Mood", "Minimal, elevated, serene"]
    ]
  },
  {
    slug: "project-03",
    title: "Project 03",
    subtitle: "Kitchen / Bar",
    year: "2025",
    location: "Toronto",
    description: "A kitchen and bar environment with a stronger, evening tone. Dark surfaces, warm highlights, and a confident material contrast.",
    images: [
      "images/project-03-a.jpg",
      "images/project-03-b.jpg"
    ],
    facts: [
      ["Focus", "Material contrast"],
      ["Palette", "Deep stone, warm bronze, soft light"],
      ["Details", "Linear lighting, hidden storage"],
      ["Mood", "Bold, refined, night-ready"]
    ]
  }
];

// Convenience index (slug -> project), used by project.js
window.PROJECTS_BY_SLUG = window.PROJECTS.reduce((acc, p) => {
  acc[p.slug] = p;
  return acc;
}, {});
