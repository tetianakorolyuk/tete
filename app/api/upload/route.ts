import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';

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
        { error: `Invalid file type: ${file.type}` },
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

    // Try Vercel Blob first (production)
    try {
      const { put } = await import('@vercel/blob');
      const blob = await put(`uploads/${filename}`, file, {
        access: 'public',
        addRandomSuffix: false,
      });
      console.log('Blob upload:', blob.url);
      return NextResponse.json({
        url: blob.url,
        filename: blob.pathname,
        size: file.size,
      });
    } catch (blobError) {
      console.log('Blob unavailable, using local:', blobError);
    }

    // Fallback: save to local filesystem (local dev)
    const fs = await import('fs/promises');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);

    const url = `/images/uploads/${filename}`;
    console.log('Local upload:', url);

    return NextResponse.json({
      url,
      filename,
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
