/* tete — projects data (edit this file to add more projects)
   - Add a new object to PROJECTS
   - Drop the referenced images into /images
   - The site auto-updates (index + project page)
*/
window.PROJECTS = [
  {
    slug: "project-01",
    number: "01",
    title: "Living / Kitchen",
    shortTitle: "Project 01",
    year: "2025",
    location: "Toronto",
    role: "Interior Design",
    blurb: "A calm, light-filled living space with warm wood and tactile neutrals.",
    description:
      "A calm, light-filled living space built around flow and proportion. Clean lines, integrated storage, and tactile materials keep the room elegant without visual noise. The palette stays warm and neutral so daylight becomes the main feature throughout the day.",
    facts: [
      ["Focus", "Layout + light"],
      ["Palette", "Natural oak, stone, soft linen"],
      ["Details", "Integrated storage, minimal hardware"],
      ["Mood", "Quiet, modern, warm"]
    ],
    hero: { src: "images/project-01-a.jpg", alt: "Living space — hero" },
    gallery: [
      { src: "images/project-01-a.jpg", alt: "Living space view A" },
      { src: "images/project-01-b.jpg", alt: "Living space view B" }
      // Add more:
      // { src: "images/project-01-c.jpg", alt: "..." }
    ]
  },
  {
    slug: "project-02",
    number: "02",
    title: "Residential",
    shortTitle: "Project 02",
    year: "2025",
    location: "Toronto",
    role: "Interior Design",
    blurb: "A residential concept built around simplicity and proportion.",
    description:
      "A residential concept focused on comfort and restraint. Materials stay honest and finishes remain matte, allowing texture and proportion to do the work. Transitions are clean and the composition is intentionally quiet.",
    facts: [
      ["Focus", "Comfort + proportion"],
      ["Palette", "Soft whites, warm timber, matte finishes"],
      ["Details", "Custom millwork, seamless transitions"],
      ["Mood", "Minimal, elevated, serene"]
    ],
    hero: { src: "images/project-02-a.jpg", alt: "Residential — hero" },
    gallery: [
      { src: "images/project-02-a.jpg", alt: "Residential view A" },
      { src: "images/project-02-b.jpg", alt: "Residential view B" }
    ]
  },
  {
    slug: "project-03",
    number: "03",
    title: "Kitchen / Bar",
    shortTitle: "Project 03",
    year: "2025",
    location: "Toronto",
    role: "Interior Design",
    blurb: "A kitchen and bar environment with a stronger, evening tone.",
    description:
      "A kitchen and bar environment with a stronger evening tone. Contrast, rhythm, and lighting create a premium feel while keeping the composition minimal. Edges are refined and the material story is deliberate.",
    facts: [
      ["Focus", "Material contrast"],
      ["Palette", "Dark wood, stone, soft amber light"],
      ["Details", "Linear lighting, refined edges"],
      ["Mood", "Bold, modern, intimate"]
    ],
    hero: { src: "images/project-03-a.jpg", alt: "Kitchen / bar — hero" },
    gallery: [
      { src: "images/project-03-a.jpg", alt: "Kitchen / bar view A" },
      { src: "images/project-03-b.jpg", alt: "Kitchen / bar view B" }
    ]
  }

  // ✅ ADD MORE PROJECTS (copy/paste this block)
  // ,{
  //   slug: "project-04",
  //   number: "04",
  //   title: "New Project Name",
  //   shortTitle: "Project 04",
  //   year: "2026",
  //   location: "Toronto",
  //   role: "Interior Design",
  //   blurb: "One-line summary.",
  //   description: "Longer description for the project page.",
  //   facts: [["Focus","..."],["Palette","..."]],
  //   hero: { src: "images/project-04-a.jpg", alt: "..." },
  //   gallery: [
  //     { src: "images/project-04-a.jpg", alt: "..." },
  //     { src: "images/project-04-b.jpg", alt: "..." }
  //   ]
  // }
];
