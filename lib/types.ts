export interface Fact {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  subtitle?: string;
  year?: string;
  location?: string;
  description?: string;
  images: string[];
  facts?: Fact[];
}

export interface SiteContent {
  projects: Project[];
}
