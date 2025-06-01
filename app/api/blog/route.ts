import { NextResponse } from 'next/server';
import { getNewsPosts } from '@/lib/notion';

export async function GET() {
  try {
    const newsPageId = process.env.NOTION_NEWS_PAGE_ID;

    if (!newsPageId) {
      return NextResponse.json({
        error: 'NOTION_NEWS_PAGE_ID not configured'
      }, { status: 500 });
    }

    const newsPosts = await getNewsPosts(newsPageId);

    // Transform news posts to match the NewsItem interface expected by the frontend
    const newsItems = newsPosts.map((post, index) => ({
      id: post.id,
      title: post.title,
      date: post.publishedDate || new Date().toISOString(),
      excerpt: post.excerpt || 'No excerpt available',
      category: 'News',
      iconName: 'Terminal', // Default icon, you can customize this
      slug: post.id, // Use the Notion page ID as slug
    }));

    return NextResponse.json(newsItems);
  } catch (error) {
    console.error('Error fetching news posts:', error);
    return NextResponse.json({
      error: 'Failed to fetch news posts'
    }, { status: 500 });
  }
}