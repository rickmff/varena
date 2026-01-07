import { NextResponse } from 'next/server';
import { getNewsPosts } from '@/lib/notion';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const newsPageId = process.env.NOTION_NEWS_PAGE_ID;

    if (!newsPageId) {
      return NextResponse.json({
        error: 'News not configured'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const isHomepage = searchParams.get('homepage') === 'true';

    const newsPosts = await getNewsPosts(newsPageId, isHomepage);

    const newsItems = newsPosts.map((post) => ({
      id: post.id,
      title: post.title,
      date: post.publishedDate || new Date().toISOString(),
      excerpt: post.excerpt || 'No excerpt available',
      category: 'News',
      iconName: 'Terminal',
      slug: post.id,
      coverImageUrl: post.coverImageUrl,
    }));

    const cacheControl = isHomepage
      ? 'public, s-maxage=3600, max-age=3600, stale-while-revalidate=86400'
      : 'public, s-maxage=3600, stale-while-revalidate=86400';

    return new NextResponse(JSON.stringify(newsItems), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    logger.error('Error fetching news posts', error);
    return NextResponse.json({
      error: 'Failed to fetch news posts'
    }, { status: 500 });
  }
}