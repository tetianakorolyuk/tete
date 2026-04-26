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

export interface StudioStat {
  number: string;
  label: string;
}

export interface StudioPrinciple {
  num: string;
  title: string;
  description: string;
}

export interface StudioContent {
  headline: string;
  description: string;
  stats: StudioStat[];
  principles: StudioPrinciple[];
}

export interface SiteContent {
  projects: Project[];
}
