import { NextResponse } from 'next/server';
import { getNewsPosts } from '@/lib/notion';

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isHomepage = searchParams.get('homepage') === 'true';

    const newsPageId = process.env.NOTION_NEWS_PAGE_ID;

    if (!newsPageId) {
      return NextResponse.json({
        error: 'NOTION_NEWS_PAGE_ID not configured'
      }, { status: 500 });
    }

    const newsPosts = await getNewsPosts(newsPageId, isHomepage);

    // Transform news posts to match the NewsItem interface expected by the frontend
    const newsItems = newsPosts.map((post) => ({
      id: post.id,
      title: post.title,
      date: post.publishedDate || new Date().toISOString(),
      excerpt: post.excerpt || 'No excerpt available',
      category: 'News',
      iconName: 'Terminal', // Default icon, you can customize this
      slug: post.id, // Use the Notion page ID as slug
      coverImageUrl: post.coverImageUrl, // Already optimized by the Notion helper
    }));

    // Cache the response for 1 hour
    return new NextResponse(JSON.stringify(newsItems), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching news posts:', error);
    return NextResponse.json({
      error: 'Failed to fetch news posts'
    }, { status: 500 });
  }
}