import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const SETTINGS_KEY = 'site_settings_v1';

export async function GET() {
  try {
    const settings = await kv.get(SETTINGS_KEY);
    return NextResponse.json({ settings: settings || {} });
  } catch (err) {
    console.error('Settings API error:', err);
    return NextResponse.json({ settings: {} });
  }
}

export async function POST(req: Request) {
  try {
    const { settings } = await req.json();
    await kv.set(SETTINGS_KEY, settings);
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Settings API error:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
