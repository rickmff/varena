import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Verify this is a Notion URL (various domains)
    try {
      const urlObj = new URL(imageUrl);
      const notionHostnames = [
        'prod-files-secure.s3.us-west-2.amazonaws.com',
        's3.us-west-2.amazonaws.com',
        'notion.so',
        'www.notion.so'
      ];

      if (!notionHostnames.some(hostname => urlObj.hostname === hostname || urlObj.hostname.endsWith('.' + hostname))) {
        return new NextResponse('Invalid image source', { status: 400 });
      }
    } catch (e) {
      return new NextResponse('Invalid URL format', { status: 400 });
    }

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // Get the image buffer
    const imageBuffer = await response.arrayBuffer();

    // Return the image with caching headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}