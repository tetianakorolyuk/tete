import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { Octokit } from '@octokit/rest';

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

    // Always save to Vercel KV first (instant updates in production)
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set('tete_projects', projects);
      savedTo.push('Vercel KV');
    } catch (kvError) {
      console.log('KV save skipped:', kvError);
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
