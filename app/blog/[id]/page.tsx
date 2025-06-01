import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsPostContent } from '@/lib/notion';
import NotionRenderer from '@/components/NotionRenderer';
import { formatDistanceToNow } from 'date-fns';

interface NewsPostPageProps {
  params: {
    id: string;
  };
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const post = await getNewsPostContent(params.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link
            href="/news"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to News
          </Link>
        </nav>

        {/* Article Header */}
        <header className="mb-12">
          <div className="text-center">
            {/* Icon */}
            {post.icon && (
              <div className="text-6xl mb-6">{post.icon}</div>
            )}
            {post.iconUrl && (
              <div className="mb-6">
                <img
                  src={post.iconUrl}
                  alt={post.title}
                  className="w-24 h-24 object-cover rounded-full mx-auto"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              {post.publishedDate && (
                <time dateTime={post.publishedDate} className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Published {formatDistanceToNow(new Date(post.publishedDate), { addSuffix: true })}
                </time>
              )}

              {post.publicUrl && (
                <a
                  href={post.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View in Notion
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {post.content && post.content.length > 0 ? (
            <div className="prose prose-lg max-w-none">
              <NotionRenderer blocks={post.content} />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-gray-600">
                This post doesn't have any content yet.
              </p>
            </div>
          )}
        </article>

        {/* Footer Navigation */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <Link
              href="/news"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              ← Back to News
            </Link>

            <div className="flex items-center space-x-4">
              {post.publicUrl && (
                <a
                  href={post.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Edit in Notion
                </a>
              )}

              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Home
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}