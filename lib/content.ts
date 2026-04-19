import { Project, SiteContent } from './types';

const CONTENT_PATH = process.cwd() + '/public/content';

export async function getProjects(): Promise<Project[]> {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(CONTENT_PATH + '/projects.json', 'utf-8');
    const data: SiteContent = JSON.parse(content);
    return data.projects || [];
  } catch {
    return [];
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  const fs = await import('fs/promises');
  const content: SiteContent = { projects };
  await fs.writeFile(
    CONTENT_PATH + '/projects.json',
    JSON.stringify(content, null, 2),
    'utf-8'
  );
}
