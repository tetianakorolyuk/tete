import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
      console.error('Upload failed: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('Upload failed: No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      console.error('Upload failed: Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Upload failed: File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    console.log('Uploading file:', filename, 'type:', file.type, 'size:', file.size);

    // Check if BLOB token exists
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN not set');
      return NextResponse.json(
        { error: 'Storage not configured. Please contact admin.' },
        { status: 500 }
      );
    }

    // Upload to Vercel Blob (without public access flag - use signed URLs or make blob public after)
    const blob = await put(`uploads/${filename}`, file, {
      addRandomSuffix: false,
    });

    console.log('Upload successful:', blob.url);

    // Return public URL
    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
