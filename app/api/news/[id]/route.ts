import { NextResponse } from 'next/server';
import { getNewsPostContent } from '@/lib/notion';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({
        error: 'Post ID is required'
      }, { status: 400 });
    }

    const post = await getNewsPostContent(id);

    if (!post) {
      return NextResponse.json({
        error: 'Post not found'
      }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching news post:', error);
    return NextResponse.json({
      error: 'Failed to fetch news post'
    }, { status: 500 });
  }
}