import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files (JPG, PNG, WebP) are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file size must be under 10MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fileName = `crop-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;

    // 1. Try Supabase Storage if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();

        // Check if bucket exists, create if not
        const { data: buckets } = await supabase.storage.listBuckets();
        const hasBucket = buckets?.some((b) => b.name === 'crop-images');
        if (!hasBucket) {
          await supabase.storage.createBucket('crop-images', { public: true });
        }

        const { error: uploadError } = await supabase.storage
          .from('crop-images')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('crop-images')
            .getPublicUrl(fileName);

          console.log(`✅ [Upload] Saved image to Supabase Storage: ${publicUrl}`);
          return NextResponse.json({
            success: true,
            url: publicUrl,
            source: 'supabase',
          });
        } else {
          console.warn('[Upload] Supabase storage upload error, falling back to local storage:', uploadError);
        }
      } catch (sbErr) {
        console.warn('[Upload] Supabase storage exception, falling back to local storage:', sbErr);
      }
    }

    // 2. Local Disk Storage Fallback (public/uploads)
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const uploadsDir = path.join(publicDir, 'uploads');

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${fileName}`;
      console.log(`✅ [Upload] Saved image to local uploads: ${localUrl}`);
      return NextResponse.json({
        success: true,
        url: localUrl,
        source: 'local',
      });
    } catch (diskErr) {
      console.warn('[Upload] Disk write failed, falling back to base64 Data URL:', diskErr);

      // 3. Fallback: Base64 Data URL (safe in any serverless or restricted disk environment)
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        source: 'data-url',
      });
    }
  } catch (err: any) {
    console.error('[Upload Error]', err);
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
