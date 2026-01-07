import { NextResponse } from 'next/server';
import { getNewsPosts } from '@/lib/notion';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const newsPageId = process.env.NOTION_NEWS_PAGE_ID;

    if (!newsPageId) {
      return NextResponse.json({
        error: 'News not configured'
      }, { status: 500 });
    }

    const newsPosts = await getNewsPosts(newsPageId);

    const newsItems = newsPosts.map((post) => ({
      id: post.id,
      title: post.title,
      date: post.publishedDate || new Date().toISOString(),
      excerpt: post.excerpt || 'No excerpt available',
      category: 'News',
      iconName: 'Terminal',
      slug: post.id,
    }));

    return NextResponse.json(newsItems);
  } catch (error) {
    logger.error('Error fetching blog posts', error);
    return NextResponse.json({
      error: 'Failed to fetch posts'
    }, { status: 500 });
  }
}
