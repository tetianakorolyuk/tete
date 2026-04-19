import { Project } from './types';

const PROJECTS_KEY = 'tete_projects';

export async function getProjects(): Promise<Project[]> {
  // Try Vercel KV first
  try {
    const { kv } = await import('@vercel/kv');
    const projects = await kv.get<Project[]>(PROJECTS_KEY);
    if (projects && projects.length > 0) {
      console.log('Loaded projects from KV:', projects.length);
      return projects;
    }
  } catch (error) {
    console.log('KV not available, using file fallback');
  }

  // Fallback: read from file (works locally and as initial load)
  try {
    const fs = await import('fs/promises');
    const CONTENT_PATH = process.cwd() + '/public/content';
    const content = await fs.readFile(CONTENT_PATH + '/projects.json', 'utf-8');
    const data = JSON.parse(content);
    return data.projects || [];
  } catch (fileError) {
    console.error('Failed to read projects.json:', fileError);
    return [];
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  // Always save to file (this works on Vercel during build)
  try {
    const fs = await import('fs/promises');
    const CONTENT_PATH = process.cwd() + '/public/content';
    await fs.writeFile(
      CONTENT_PATH + '/projects.json',
      JSON.stringify({ projects }, null, 2),
      'utf-8'
    );
    console.log('Projects saved to file');
  } catch (fileError) {
    console.error('File save failed:', fileError);
  }

  // Also try to save to KV for instant updates
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(PROJECTS_KEY, projects);
    console.log('Projects also saved to KV');
  } catch (kvError) {
    console.log('KV save skipped (not configured)');
  }
}
