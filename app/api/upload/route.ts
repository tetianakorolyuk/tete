import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { put, download } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload with private access, then get download URL
    const blob = await put(`uploads/${filename}`, file, {
      access: 'private',
      addRandomSuffix: false,
    });

    // Get the download URL (works for private blobs)
    const downloadUrl = await download(blob.pathname);

    return NextResponse.json({
      url: downloadUrl.toString(),
      filename: blob.pathname,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
