"use client";

import { useEffect, useState, ReactNode, ReactElement } from 'react';
import { useParams } from 'next/navigation'; // To get the [id] from URL
import Link from 'next/link';
import { Client } from '@notionhq/client';
import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints"; // For block types
// For a more robust layout, you might import your existing NavBar and Footer
// import NavBar from '@/components/NavBar';
// import Footer from '@/components/Footer'; // Assuming you have a Footer component

// Define a type for the full news article
interface FullNewsArticle {
  id: string;
  title: string;
  date: string;
  // category?: string; // Optional if you want to display it
  // iconName?: string; // Optional
  contentBlocks: BlockObjectResponse[]; // To store Notion page content blocks
}

// Simple component to render Notion blocks (expand this for more block types and styling)
const renderBlock = (block: BlockObjectResponse) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={block.id} className="my-4 leading-relaxed">
          {block.paragraph.rich_text.map((rt, index) => (
            <span key={index} style={{ fontWeight: rt.annotations.bold ? 'bold' : 'normal', fontStyle: rt.annotations.italic ? 'italic' : 'normal', textDecoration: rt.annotations.underline ? 'underline' : (rt.annotations.strikethrough ? 'line-through' : 'none'), color: rt.annotations.color !== 'default' ? rt.annotations.color : undefined }}>
              {rt.href ? <a href={rt.href} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">{rt.plain_text}</a> : rt.plain_text}
            </span>
          ))}
        </p>
      );
    case 'heading_1':
      return <h1 key={block.id} className="text-4xl font-bold my-6 text-red-300">{block.heading_1.rich_text.map(rt => rt.plain_text).join('')}</h1>;
    case 'heading_2':
      return <h2 key={block.id} className="text-3xl font-semibold my-5 text-red-300">{block.heading_2.rich_text.map(rt => rt.plain_text).join('')}</h2>;
    case 'heading_3':
      return <h3 key={block.id} className="text-2xl font-semibold my-4 text-red-300">{block.heading_3.rich_text.map(rt => rt.plain_text).join('')}</h3>;
    case 'bulleted_list_item':
      // For proper list rendering, you might need to group consecutive list items
      return <li key={block.id} className="ml-6 list-disc">{block.bulleted_list_item.rich_text.map(rt => rt.plain_text).join('')}</li>;
    case 'numbered_list_item':
      // Similar to bulleted list, grouping might be needed for ol > li structure
      return <li key={block.id} className="ml-6 list-decimal">{block.numbered_list_item.rich_text.map(rt => rt.plain_text).join('')}</li>;
    case 'image':
      const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
      return (
        <div key={block.id} className="my-6">
          <Image src={imageUrl} alt={block.image.caption.map(rt => rt.plain_text).join('') || "News image"} width={800} height={600} className="rounded-lg shadow-md mx-auto" />
          {block.image.caption.length > 0 && <p className="text-sm text-center text-gray-400 mt-2">{block.image.caption.map(rt => rt.plain_text).join('')}</p>}
        </div>
      );
    case 'code':
      return (
        <pre key={block.id} className="bg-gray-800/50 p-4 rounded-md my-4 overflow-x-auto text-sm">
          <code>{block.code.rich_text.map(rt => rt.plain_text).join('')}</code>
        </pre>
      );
    case 'quote':
      return (
        <blockquote key={block.id} className="border-l-4 border-red-500 pl-4 italic my-4 text-gray-300">
          {block.quote.rich_text.map(rt => rt.plain_text).join('')}
        </blockquote>
      );
    // Add more block types as needed (e.g., callout, divider, video, etc.)
    default:
      console.warn("Unsupported block type:", block.type);
      return <p key={block.id} className="my-2 text-gray-500">[Unsupported content block: {block.type}]</p>;
  }
};


export default function NewsArticlePage() {
  const params = useParams();
  const newsId = params.id as string;
  const [article, setArticle] = useState<FullNewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!newsId) {
      setError("Article ID not found.");
      setLoading(false);
      return;
    }

    const fetchArticleContent = async () => {
      setLoading(true);
      setError(null);
      const notionApiKey = process.env.NEXT_PUBLIC_NOTION_API_KEY;

      if (!notionApiKey) {
        console.error("Notion API Key is not configured in .env.local. Cannot fetch article.");
        setError("Configuration error: Notion API Key is missing.");
        setLoading(false);
        return;
      }

      const notion = new Client({ auth: notionApiKey });

      try {
        // 1. Fetch page properties (title, date etc.)
        // Ensure you adjust "Name" and "Date" to your actual Notion property names
        const pageResponse: any = await notion.pages.retrieve({ page_id: newsId });
        const title = pageResponse.properties.Name?.title[0]?.plain_text || "Untitled Article";
        // Ensure 'Date' is the correct name of your date property in Notion
        const date = pageResponse.properties.Date?.date?.start || new Date().toISOString();

        // 2. Fetch page content (blocks)
        const blocksResponse = await notion.blocks.children.list({
          block_id: newsId,
          page_size: 100, // Notion defaults to 100, adjust if you expect more blocks
        });
        const contentBlocks = blocksResponse.results as BlockObjectResponse[];

        setArticle({
          id: newsId,
          title,
          date,
          contentBlocks,
        });

      } catch (err: any) {
        console.error("Failed to fetch article from Notion:", err);
        setError(`Failed to load article. ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleContent();
  }, [newsId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl">Loading article...</p>
          {/* Optional: Add a spinner component here */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl text-red-500">Error: {error}</p>
          <Link href="/#news" className="mt-8 inline-block bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded transition-colors">
            &larr; Back to News
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xl">Article not found.</p>
          <Link href="/#news" className="mt-8 inline-block bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded transition-colors">
            &larr; Back to News
          </Link>
        </div>
      </div>
    );
  }

  // Naive way to render lists. For proper nested lists, you'd need a more complex renderer.
  let listItems: ReactNode[] = [];
  const renderedBlocks = article.contentBlocks.reduce((acc, block, index, allBlocks) => {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      listItems.push(renderBlock(block) as ReactElement);
      // If it's the last item or the next item is not a list item of the same type, render the list
      const nextBlock = allBlocks[index + 1];
      if (!nextBlock || (nextBlock.type !== block.type)) {
        if (block.type === 'bulleted_list_item') {
          acc.push(<ul key={`ul-${block.id}`} className="list-disc space-y-1 my-4 pl-8">{listItems}</ul>);
        } else {
          acc.push(<ol key={`ol-${block.id}`} className="list-decimal space-y-1 my-4 pl-8">{listItems}</ol>);
        }
        listItems = []; // Reset for the next list
      }
    } else {
      acc.push(renderBlock(block) as ReactElement);
    }
    return acc;
  }, [] as ReactElement[]);


  return (
    <div className="min-h-screen bg-black text-white">
      {/* <NavBar /> Uncomment if you have and want to use NavBar */}
      <main className="container mx-auto px-4 py-12 pt-20 md:pt-24"> {/* Added top padding */}
        <article className="max-w-3xl mx-auto"> {/* Removed prose for more control if needed, or add back prose prose-invert */}
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">
              {article.title}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Published on: {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          {/* Render Notion Blocks */}
          <div className="text-gray-200 leading-relaxed space-y-2">
            {renderedBlocks.map((blockComponent, index) => (
              <div key={index}>{blockComponent}</div> // Each block component already has a key from renderBlock
            ))}
          </div>

          <div className="mt-10 md:mt-16 pt-6 border-t border-gray-700">
            <Link href="/#news" className="inline-flex items-center text-red-500 hover:text-red-400 transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to News
            </Link>
          </div>
        </article>
      </main>
      {/* <Footer /> Uncomment if you have and want to use Footer */}
    </div>
  );
}

// Need to import Image from next/image if not already globally available in this context
// For client components using next/image, ensure it's imported.
import Image from 'next/image';