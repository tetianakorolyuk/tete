'use server';

import { checkAuth } from '@/lib/auth';
import {
  generateProjectDescription,
  generateProjectFacts,
  generateSEOData,
  generateAltText,
} from '@/lib/ollama';

export async function generateDescriptionAction(
  title: string,
  subtitle: string,
  facts: { label: string; value: string }[]
): Promise<{ success: boolean; description?: string; error?: string }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const description = await generateProjectDescription(
      title,
      subtitle,
      facts.map((f) => `${f.label}: ${f.value}`)
    );

    return { success: true, description };
  } catch (error) {
    console.error('AI generation failed:', error);
    return { success: false, error: 'Failed to generate description' };
  }
}

export async function generateFactsAction(
  title: string,
  description: string
): Promise<{ success: boolean; facts?: { label: string; value: string }[]; error?: string }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const facts = await generateProjectFacts(title, description);
    return { success: true, facts };
  } catch (error) {
    console.error('AI generation failed:', error);
    return { success: false, error: 'Failed to generate facts' };
  }
}

export async function generateSEOAction(
  title: string,
  description: string
): Promise<{ success: boolean; seo?: { metaTitle: string; metaDescription: string }; error?: string }> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const seo = await generateSEOData(title, description);
    return { success: true, seo };
  } catch (error) {
    console.error('AI generation failed:', error);
    return { success: false, error: 'Failed to generate SEO data' };
  }
}
