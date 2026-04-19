'use server';

import { saveProjects } from '@/lib/content';
import { checkAuth } from '@/lib/auth';
import { Project } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveProjectsAction(projects: Project[]): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      console.error('Save failed: Unauthorized');
      return { success: false, error: 'Unauthorized. Please login again.' };
    }

    console.log('Saving projects:', projects.length, 'projects');

    await saveProjects(projects);

    console.log('Projects saved successfully, revalidating...');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to save projects:', errorMsg);
    return {
      success: false,
      error: `Failed to save: ${errorMsg}`
    };
  }
}
