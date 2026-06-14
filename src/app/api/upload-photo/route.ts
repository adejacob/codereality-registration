import { NextRequest, NextResponse } from 'next/server';

export const config = { api: { bodyParser: false } };

export async function POST(request: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { success: false, message: 'Photo upload not configured.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File too large (max 10MB).' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: 'Only image files are allowed.' }, { status: 400 });
    }

    // Forward to Cloudinary unsigned upload endpoint
    const cloudinaryForm = new FormData();
    cloudinaryForm.append('file', file);
    cloudinaryForm.append('upload_preset', uploadPreset);
    cloudinaryForm.append('folder', 'codereality/students');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: cloudinaryForm }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('[upload-photo] Cloudinary error:', err);
      return NextResponse.json({ success: false, message: 'Upload failed.' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, url: data.secure_url });
  } catch (err) {
    console.error('[upload-photo] Error:', err);
    return NextResponse.json({ success: false, message: 'Upload error.' }, { status: 500 });
  }
}
