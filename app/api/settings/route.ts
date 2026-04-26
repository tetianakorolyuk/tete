import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { checkAuth } from '@/lib/auth';

const SETTINGS_KEY = 'site_settings_v1';
const STUDIO_KEY = 'tete_studio_content';

async function getSettingsFromFile() {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(process.cwd() + '/public/content/settings.json', 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function GET() {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    const studioContent = await kv.get(STUDIO_KEY);
    return NextResponse.json({ settings: settings || {}, studioContent: studioContent || null });
  } catch (err) {
    console.error('Settings API error:', err);
    // Fallback to file
    try {
      const fs = await import('fs/promises');
      const [settingsContent, studioContent] = await Promise.all([
        fs.readFile(process.cwd() + '/public/content/settings.json', 'utf-8').catch(() => '{}'),
        fs.readFile(process.cwd() + '/public/content/studio.json', 'utf-8').catch(() => 'null'),
      ]);
      return NextResponse.json({
        settings: JSON.parse(settingsContent),
        studioContent: studioContent === 'null' ? null : JSON.parse(studioContent),
      });
    } catch {
      return NextResponse.json({ settings: {}, studioContent: null });
    }
  }
}

export async function POST(req: Request) {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    if (body.settings) {
      const existing = (await kv.get(SETTINGS_KEY)) || {};
      const merged = { ...existing, ...body.settings };
      await kv.set(SETTINGS_KEY, merged);
      // Also save to file
      try {
        const fs = await import('fs/promises');
        const CONTENT_PATH = process.cwd() + '/public/content';
        await fs.writeFile(
          CONTENT_PATH + '/settings.json',
          JSON.stringify(merged, null, 2),
          'utf-8'
        );
      } catch (fileError) {
        console.error('File save failed for settings:', fileError);
      }
    }

    if (body.studioContent) {
      await kv.set(STUDIO_KEY, body.studioContent);
      // Also save to file
      try {
        const fs = await import('fs/promises');
        const CONTENT_PATH = process.cwd() + '/public/content';
        await fs.writeFile(
          CONTENT_PATH + '/studio.json',
          JSON.stringify(body.studioContent, null, 2),
          'utf-8'
        );
      } catch (fileError) {
        console.error('File save failed for studio:', fileError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings API error:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
