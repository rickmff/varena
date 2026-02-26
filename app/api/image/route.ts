import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'edge';

// Allowed Notion hostnames for security
const NOTION_HOSTNAMES = [
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3.us-west-2.amazonaws.com',
  'notion.so',
  'www.notion.so'
];

// In-memory cache for URL mapping (file ID -> full URL with valid token)
// This helps reduce Notion API calls when multiple requests come for the same image
const urlCache = new Map<string, { url: string; expires: number }>();

/**
 * Extract stable file identifier from a Notion S3 URL
 * Notion URLs look like: https://prod-files-secure.s3.us-west-2.amazonaws.com/WORKSPACE_ID/FILE_ID/filename.ext?X-Amz-...
 * We extract the path portion which is stable
 */
function extractStableId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Return the pathname which is stable (doesn't include query params with tokens)
    return urlObj.pathname;
  } catch {
    return null;
  }
}

/**
 * Validate that a URL is from an allowed Notion hostname
 */
function isValidNotionUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return NOTION_HOSTNAMES.some(hostname =>
      urlObj.hostname === hostname || urlObj.hostname.endsWith('.' + hostname)
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const fileId = searchParams.get('id'); // New stable ID parameter

    if (!imageUrl && !fileId) {
      return new NextResponse('Missing URL or ID parameter', {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        }
      });
    }

    let finalUrl = imageUrl;

    // If we have a fileId, try to use cached URL
    if (fileId && urlCache.has(fileId)) {
      const cached = urlCache.get(fileId)!;
      if (cached.expires > Date.now()) {
        finalUrl = cached.url;
      }
    }

    if (!finalUrl) {
      return new NextResponse('Could not resolve image URL', {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        }
      });
    }

    // Security: Validate this is a Notion URL
    if (!isValidNotionUrl(finalUrl)) {
      return new NextResponse('Invalid image source', {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        }
      });
    }

    // Fetch the image
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
      },
    });

    if (!response.ok) {
      // If token expired, return error with short cache to allow retry
      if (response.status === 403 || response.status === 401) {
        return new NextResponse('Image token expired', {
          status: 502,
          headers: {
            'Cache-Control': 'public, max-age=0, s-maxage=0',
          }
        });
      }
      return new NextResponse('Failed to fetch image', {
        status: response.status,
        headers: {
          'Cache-Control': 'no-store',
        }
      });
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    // Cache the URL mapping for future requests
    const stableId = extractStableId(finalUrl);
    if (stableId && imageUrl) {
      // Notion URLs typically expire in ~1 hour, cache for 45 minutes
      urlCache.set(stableId, {
        url: imageUrl,
        expires: Date.now() + 45 * 60 * 1000,
      });
    }

    // Return image with aggressive CDN caching
    // s-maxage: CDN cache duration (1 year - images are immutable once uploaded)
    // max-age: Browser cache duration (1 week)
    // stale-while-revalidate: Serve stale while fetching new version
    // immutable: Content won't change at this URL
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=31536000, max-age=604800, stale-while-revalidate=86400, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  }
}
