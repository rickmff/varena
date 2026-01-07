import { NextResponse } from 'next/server';
import { getNewsPosts } from '@/lib/notion';
import { logger } from '@/lib/logger';

export const revalidate = 3600;

export async function GET() {
  try {
    const newsPageId = process.env.NOTION_NEWS_PAGE_ID;

    if (!newsPageId) {
      return NextResponse.json({
        error: 'News not configured'
      }, { status: 500 });
    }

    const newsPosts = await getNewsPosts(newsPageId, false);

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

    return new NextResponse(JSON.stringify(newsItems), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    logger.error('Error fetching all news posts', error);
    return NextResponse.json({
      error: 'Failed to fetch news posts'
    }, { status: 500 });
  }
}
