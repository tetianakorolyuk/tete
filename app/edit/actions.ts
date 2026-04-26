'use server';

import { saveProjects } from '@/lib/content';
import { checkAuth } from '@/lib/auth';
import { Project, StudioContent } from '@/lib/types';
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

export async function saveStudioAction(content: StudioContent): Promise<{ success: boolean; error?: string }> {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return { success: false, error: 'Unauthorized. Please login again.' };
    }

    // Save to KV
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set('tete_studio_content', content);
    } catch (kvError) {
      console.log('KV save skipped for studio content');
    }

    // Save to file as fallback
    try {
      const fs = await import('fs/promises');
      const CONTENT_PATH = process.cwd() + '/public/content';
      await fs.writeFile(
        CONTENT_PATH + '/studio.json',
        JSON.stringify(content, null, 2),
        'utf-8'
      );
    } catch (fileError) {
      console.error('File save failed for studio:', fileError);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to save studio content: ${errorMsg}` };
  }
}
