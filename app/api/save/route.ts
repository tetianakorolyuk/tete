import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { Octokit } from '@octokit/rest';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projects } = await request.json();

    if (!projects || !Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    let savedTo = [];

    // Try Vercel KV first (production)
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set('tete_projects', projects);
      savedTo.push('Vercel KV');
    } catch (kvError) {
      console.log('KV save skipped:', kvError);
    }

    // Fallback: save to local file (local dev)
    try {
      const fs = await import('fs/promises');
      const CONTENT_PATH = process.cwd() + '/public/content';
      await fs.writeFile(
        CONTENT_PATH + '/projects.json',
        JSON.stringify({ projects }, null, 2),
        'utf-8'
      );
      savedTo.push('local file');
    } catch (fileError) {
      console.log('Local file save skipped:', fileError);
    }

    // Also save to GitHub if token is available (permanent storage)
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      try {
        const octokit = new Octokit({ auth: githubToken });
        const owner = 'tetianakorolyuk';
        const repo = 'tete';
        const path = 'public/content/projects.json';

        // Get current file SHA
        const { data: file } = await octokit.repos.getContent({
          owner,
          repo,
          path,
        });

        if ('sha' in file) {
          await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: 'Update projects via CMS',
            content: Buffer.from(JSON.stringify({ projects }, null, 2)).toString('base64'),
            sha: file.sha,
            branch: 'main',
          });
          savedTo.push('GitHub');
        }
      } catch (ghError) {
        console.log('GitHub save skipped:', ghError);
      }
    }

    if (savedTo.length === 0) {
      return NextResponse.json({
        error: 'No storage configured. Add GITHUB_TOKEN or KV_URL to environment variables.'
      }, { status: 500 });
    }

    // Revalidate the homepage and project pages to show updated content
    revalidatePath('/');
    revalidatePath('/projects/[slug]', 'page');

    return NextResponse.json({
      success: true,
      message: `Saved to ${savedTo.join(' + ')}`
    });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Save failed'
    }, { status: 500 });
  }
}
