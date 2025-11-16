import React from 'react';
import { getNewsPosts } from '@/lib/notion';

export default async function TestNotionPage() {
  const newsPageId = process.env.NOTION_NEWS_PAGE_ID;

  let newsPosts: any[] = [];
  let error: string | null = null;

  try {
    if (newsPageId) {
      newsPosts = await getNewsPosts(newsPageId);
    } else {
      error = 'NOTION_NEWS_PAGE_ID not set';
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Test page error:', e);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notion Connection Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium w-48">NOTION_API_KEY:</span>
              <span className={process.env.NOTION_API_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NOTION_API_KEY ? '✅ Set' : '❌ Not set'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-48">NOTION_NEWS_PAGE_ID:</span>
              <span className={newsPageId ? 'text-green-600' : 'text-red-600'}>
                {newsPageId ? `✅ ${newsPageId}` : '❌ Not set'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">News Posts ({newsPosts.length})</h2>

          {newsPosts.length > 0 ? (
            <div className="space-y-4">
              {newsPosts.map((post, index) => (
                <div key={post.id} className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600">ID: {post.id}</p>
                  {post.excerpt && (
                    <p className="text-gray-700 mt-2">{post.excerpt}</p>
                  )}
                  {post.publishedDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Published: {new Date(post.publishedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📰</div>
              <p className="text-gray-600">No news posts found</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Make sure you have:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Created a Notion page with child pages</li>
                  <li>Shared the page with your integration</li>
                  <li>Set the correct page ID in your environment variables</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/news"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go to News
          </a>
        </div>
      </div>
    </div>
  );
}