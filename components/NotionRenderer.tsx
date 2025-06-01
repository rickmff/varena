import React, { ReactNode } from 'react';
import { NewsBlock, RichText, richTextToHtml } from '@/lib/notion';

interface NotionRendererProps {
  blocks: NewsBlock[];
}

interface RichTextRendererProps {
  richText: RichText[];
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ richText }) => {
  return (
    <>
      {richText.map((text, index) => {
        let element: ReactNode = text.plain_text;

        if (text.annotations.bold) {
          element = <strong key={index}>{element}</strong>;
        }
        if (text.annotations.italic) {
          element = <em key={index}>{element}</em>;
        }
        if (text.annotations.strikethrough) {
          element = <del key={index}>{element}</del>;
        }
        if (text.annotations.underline) {
          element = <u key={index}>{element}</u>;
        }
        if (text.annotations.code) {
          element = <code key={index} className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-red-400">{element}</code>;
        }

        if (text.text?.link) {
          element = (
            <a
              key={index}
              href={text.text.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              {element}
            </a>
          );
        }

        return <span key={index}>{element}</span>;
      })}
    </>
  );
};

const BlockRenderer: React.FC<{ block: NewsBlock }> = ({ block }) => {
  const renderChildren = () => {
    if (block.children && block.children.length > 0) {
      return <NotionRenderer blocks={block.children} />;
    }
    return null;
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <div className="mb-4">
          <p className="text-gray-200 leading-relaxed">
            {block.content.rich_text && (
              <RichTextRenderer richText={block.content.rich_text} />
            )}
          </p>
          {renderChildren()}
        </div>
      );

    case 'heading_1':
      return (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {block.content.rich_text && (
              <RichTextRenderer richText={block.content.rich_text} />
            )}
          </h1>
          {renderChildren()}
        </div>
      );

    case 'heading_2':
      return (
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-white mb-2">
            {block.content.rich_text && (
              <RichTextRenderer richText={block.content.rich_text} />
            )}
          </h2>
          {renderChildren()}
        </div>
      );

    case 'heading_3':
      return (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {block.content.rich_text && (
              <RichTextRenderer richText={block.content.rich_text} />
            )}
          </h3>
          {renderChildren()}
        </div>
      );

    case 'bulleted_list_item':
      return (
        <div className="mb-2">
          <div className="flex items-start">
            <span className="mr-2 mt-2 w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
            <div className="flex-1">
              <p className="text-gray-200">
                {block.content.rich_text && (
                  <RichTextRenderer richText={block.content.rich_text} />
                )}
              </p>
              {renderChildren()}
            </div>
          </div>
        </div>
      );

    case 'numbered_list_item':
      return (
        <div className="mb-2">
          <div className="flex items-start">
            <span className="mr-3 text-red-400 font-medium min-w-[1.5rem]">1.</span>
            <div className="flex-1">
              <p className="text-gray-200">
                {block.content.rich_text && (
                  <RichTextRenderer richText={block.content.rich_text} />
                )}
              </p>
              {renderChildren()}
            </div>
          </div>
        </div>
      );

    case 'to_do':
      return (
        <div className="mb-2">
          <div className="flex items-start">
            <input
              type="checkbox"
              checked={block.content.checked || false}
              readOnly
              className="mr-3 mt-1 accent-red-500"
            />
            <div className="flex-1">
              <p className={`text-gray-200 ${block.content.checked ? 'line-through text-gray-500' : ''}`}>
                {block.content.rich_text && (
                  <RichTextRenderer richText={block.content.rich_text} />
                )}
              </p>
              {renderChildren()}
            </div>
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="mb-4">
          <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-300">
            {block.content.rich_text && (
              <RichTextRenderer richText={block.content.rich_text} />
            )}
          </blockquote>
          {renderChildren()}
        </div>
      );

    case 'code':
      return (
        <div className="mb-4">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border border-red-900/30">
            <code className="text-sm font-mono">
              {block.content.rich_text && (
                <RichTextRenderer richText={block.content.rich_text} />
              )}
            </code>
          </pre>
          {renderChildren()}
        </div>
      );

    case 'callout':
      return (
        <div className="mb-4">
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="flex items-start">
              {block.content.icon && (
                <span className="mr-3 text-lg">
                  {block.content.icon.emoji || '💡'}
                </span>
              )}
              <div className="flex-1">
                <p className="text-red-200">
                  {block.content.rich_text && (
                    <RichTextRenderer richText={block.content.rich_text} />
                  )}
                </p>
                {renderChildren()}
              </div>
            </div>
          </div>
        </div>
      );

    case 'divider':
      return <hr className="my-8 border-red-900/30" />;

    case 'image':
      const imageUrl = block.content.file?.url || block.content.external?.url;
      return (
        <div className="mb-6">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={block.content.caption?.[0]?.plain_text || 'Image'}
              className="max-w-full h-auto rounded-lg shadow-md"
            />
          )}
          {block.content.caption && block.content.caption.length > 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center italic">
              <RichTextRenderer richText={block.content.caption} />
            </p>
          )}
        </div>
      );

    case 'video':
      const videoUrl = block.content.file?.url || block.content.external?.url;
      return (
        <div className="mb-6">
          {videoUrl && (
            <video
              controls
              className="max-w-full h-auto rounded-lg shadow-md"
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}
          {block.content.caption && block.content.caption.length > 0 && (
            <p className="text-sm text-gray-400 mt-2 text-center italic">
              <RichTextRenderer richText={block.content.caption} />
            </p>
          )}
        </div>
      );

    case 'embed':
      return (
        <div className="mb-6">
          <div className="bg-gray-800 border border-red-900/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              Embedded content: {block.content.url}
            </p>
            <a
              href={block.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline"
            >
              View content
            </a>
          </div>
        </div>
      );

    case 'toggle':
      return (
        <div className="mb-4">
          <details className="border border-red-900/30 rounded-lg bg-gray-900/50">
            <summary className="p-3 cursor-pointer hover:bg-red-900/20 font-medium text-gray-200">
              {block.content.rich_text && (
                <RichTextRenderer richText={block.content.rich_text} />
              )}
            </summary>
            <div className="p-3 pt-0">
              {renderChildren()}
            </div>
          </details>
        </div>
      );

    case 'table':
      return (
        <div className="mb-6 overflow-x-auto">
          <table className="min-w-full border border-red-900/30 rounded-lg bg-gray-900/50">
            <tbody>
              {renderChildren()}
            </tbody>
          </table>
        </div>
      );

    case 'table_row':
      return (
        <tr className="border-b border-red-900/30">
          {block.content.cells?.map((cell: RichText[], index: number) => (
            <td key={index} className="p-3 border-r border-red-900/30 last:border-r-0 text-gray-200">
              <RichTextRenderer richText={cell} />
            </td>
          ))}
        </tr>
      );

    default:
      return (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
          <p className="text-yellow-300 text-sm">
            Unsupported block type: {block.type}
          </p>
          {renderChildren()}
        </div>
      );
  }
};

const NotionRenderer: React.FC<NotionRendererProps> = ({ blocks }) => {
  return (
    <div className="notion-content">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export default NotionRenderer;