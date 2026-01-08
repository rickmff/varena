import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
// Enable ISR with 30-day revalidation (images rarely change)
export const revalidate = 2592000; // 30 days in seconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const quality = searchParams.get('q') || '75'; // Default quality 75%
    const width = searchParams.get('w'); // Optional width parameter

    if (!imageUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Verify this is a Notion URL
    if (!imageUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com')) {
      return new NextResponse('Invalid image source', { status: 400 });
    }

    // Fetch the image from Notion S3
    const response = await fetch(imageUrl, {
      // Add cache control for the fetch itself
      next: { revalidate: 2592000 }, // Cache for 30 days
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    // Optional: Compress image if sharp is available
    let processedBuffer = imageBuffer;
    try {
      // Try to import sharp for compression (only if available)
      const sharp = require('sharp');

      const qualityNum = Math.min(100, Math.max(1, parseInt(quality)));
      const image = sharp(Buffer.from(imageBuffer));

      // Get image metadata to check size
      const metadata = await image.metadata();

      // Resize if width parameter is provided
      if (width) {
        const widthNum = Math.min(2048, Math.max(100, parseInt(width)));
        image.resize(widthNum, null, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Compress based on format
      if (contentType.includes('png')) {
        image.png({ quality: qualityNum, compressionLevel: 9 });
      } else if (contentType.includes('webp')) {
        image.webp({ quality: qualityNum });
      } else {
        // Default to JPEG compression
        image.jpeg({ quality: qualityNum, mozjpeg: true });
      }

      processedBuffer = await image.toBuffer();

      // Log compression savings
      const originalSize = imageBuffer.byteLength;
      const compressedSize = processedBuffer.byteLength;
      const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      console.log(`Image compressed: ${(originalSize / 1024).toFixed(1)}KB → ${(compressedSize / 1024).toFixed(1)}KB (${savings}% savings)`);
    } catch (sharpError) {
      // Sharp not available or error during compression, use original buffer
      console.warn('Image compression not available, serving original:', sharpError instanceof Error ? sharpError.message : 'unknown error');
      processedBuffer = imageBuffer;
    }

    // Return the image with aggressive caching headers
    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': contentType,
        // Browser cache: 1 year
        'Cache-Control': 'public, max-age=31536000, immutable',
        // CDN cache: 30 days, stale-while-revalidate for 7 days
        'CDN-Cache-Control': 'public, max-age=2592000, stale-while-revalidate=604800',
        // Vercel-specific caching
        'Vercel-CDN-Cache-Control': 'public, max-age=2592000, stale-while-revalidate=604800',
        // Add content length for better performance
        'Content-Length': processedBuffer.byteLength.toString(),
        // Add ETag for cache validation
        'ETag': `"${Buffer.from(imageUrl).toString('base64').substring(0, 32)}"`,
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}