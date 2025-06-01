import React from 'react';
import Link from 'next/link';
import { getNewsPosts } from '@/lib/notion';
import { formatDistanceToNow } from 'date-fns';

export default async function NewsPage() {
  // You'll need to set NOTION_NEWS_PAGE_ID in your .env file
  const newsPosts = await getNewsPosts(process.env.NOTION_NEWS_PAGE_ID || '');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📝 Our News
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights, tutorials, and stories from our team.
            All content is powered by Notion and rendered beautifully.
          </p>
        </div>

        {/* News Posts Grid */}
        {newsPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {newsPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <Link href={`/news/${post.id}`} className="block">
                  {/* Post Icon/Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {post.icon ? (
                      <span className="text-6xl">{post.icon}</span>
                    ) : post.iconUrl ? (
                      <img
                        src={post.iconUrl}
                        alt={post.title}
                        className="w-24 h-24 object-cover rounded-full"
                      />
                    ) : (
                      <div className="text-white text-6xl">📄</div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      {post.publishedDate && (
                        <time dateTime={post.publishedDate}>
                          {formatDistanceToNow(new Date(post.publishedDate), { addSuffix: true })}
                        </time>
                      )}
                      <span className="text-blue-600 font-medium hover:text-blue-800">
                        Read more →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No news posts yet
            </h2>
            <p className="text-gray-600 mb-6">
              Check back soon for new content, or make sure your Notion page ID is configured correctly.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Setup tip:</strong> Add <code>NOTION_NEWS_PAGE_ID</code> to your .env file
                with the ID of your Notion page containing news posts.
              </p>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}