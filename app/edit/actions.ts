'use server';

import { saveProjects } from '@/lib/content';
import { checkAuth } from '@/lib/auth';
import { Project } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveProjectsAction(projects: Project[]): Promise<{ success: boolean; error?: string }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await saveProjects(projects);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to save projects:', error);
    return { success: false, error: 'Failed to save projects' };
  }
}
