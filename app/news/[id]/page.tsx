"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import NotionRenderer from '@/components/NotionRenderer';
import NavBar from '@/components/NavBar';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

function NewsPostSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/hero-bg.png"
            alt="V Rising Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Navigation skeleton */}
            <nav className="mb-8">
              <Skeleton className="w-32 h-6" />
            </nav>

            {/* Header skeleton */}
            <header className="mb-12 text-center">
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
              <Skeleton className="w-3/4 h-12 mx-auto mb-4" />
              <Skeleton className="w-1/2 h-12 mx-auto mb-6" />
              <div className="flex items-center justify-center space-x-4">
                <Skeleton className="w-40 h-6" />
                <Skeleton className="w-32 h-6" />
              </div>
            </header>

            {/* Content skeleton */}
            <article className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/30 p-8 md:p-12">
              <div className="space-y-4">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-full h-32 mt-8" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-2/3 h-6" />
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsPostPage({ params }: NewsPostPageProps) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/news/${resolvedParams.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Post not found');
          } else {
            setError('Failed to load post');
          }
          return;
        }

        const postData = await response.json();

        if (postData.error) {
          setError(postData.error);
          return;
        }

        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [resolvedParams.id]);

  if (loading) {
    return <NewsPostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <NavBar />
        <div className="container mx-auto px-4 py-24">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold text-red-400 mb-4">News Post Not Found</h1>
            <p className="text-gray-400 mb-8">
              {error || 'The news post you\'re looking for doesn\'t exist or has been removed.'}
            </p>
            <Link
              href="/news"
              className="inline-flex items-center px-6 py-3 bg-red-900/50 border border-red-900/50 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200"
            >
              ← Back to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />

      <div className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden bg-gradient-to-b from-black to-black">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="/hero-bg.png"
            alt="V Rising Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <motion.nav
              className="mb-8"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <Link
                href="/news"
                className="inline-flex items-center text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                ← Back to News
              </Link>
            </motion.nav>

            {/* Article Header */}
            <motion.header
              className="mb-12 text-center"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {/* Cover Image */}
              {post.coverImageUrl && (
                <motion.div
                  className="mb-8 relative aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden shadow-2xl shadow-red-900/50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30" />
                </motion.div>
              )}

              {/* Icon */}
              {post.icon && (
                <motion.div
                  className="text-6xl mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {post.icon}
                </motion.div>
              )}
              {post.iconUrl && (
                <motion.div
                  className="mb-6"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img
                    src={post.iconUrl}
                    alt={post.title}
                    className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-red-900/50"
                  />
                </motion.div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 leading-tight uppercase tracking-wider">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center justify-center space-x-6 text-gray-400">
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
                    className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View in Notion
                  </a>
                )}
              </div>
            </motion.header>

            {/* Article Content */}
            <motion.article
              className="bg-black/80 backdrop-blur-sm rounded-lg border-2 border-red-900/30 p-8 md:p-12 shadow-2xl shadow-red-900/10"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {post.content && post.content.length > 0 ? (
                <div className="prose prose-lg max-w-none prose-invert">
                  <NotionRenderer blocks={post.content} />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-gray-400">
                    This news post doesn't have any content yet.
                  </p>
                </div>
              )}
            </motion.article>

            {/* Footer Navigation */}
            <motion.footer
              className="mt-12 pt-8 border-t border-red-900/30"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <Link
                  href="/news"
                  className="inline-flex items-center py-3 text-white font-medium rounded-lg hover:bg-red-900/70 hover:border-red-500 transition-all duration-200"
                >
                  ← Back to News
                </Link>

                <div className="flex items-center space-x-4">
                  {post.publicUrl && (
                    <a
                      href={post.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-red-900/50 text-gray-300 font-medium rounded-lg hover:bg-red-900/20 hover:border-red-500 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Edit in Notion
                    </a>
                  )}

                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-red-900/50 text-gray-300 font-medium rounded-lg hover:bg-red-900/20 hover:border-red-500 transition-all duration-200"
                  >
                    Home
                  </Link>
                </div>
              </div>
            </motion.footer>
          </div>
        </div>
      </div>
    </div>
  );
}