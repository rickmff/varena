import { Client, isNotionClientError, LogLevel } from "@notionhq/client";
import { type BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  logLevel: LogLevel.INFO,
});

export interface PageDetails {
  id: string;
  title: string;
  icon: string | null;
  iconUrl: string | null;
  publicUrl: string | null;
}

export interface NewsPost {
  id: string;
  title: string;
  excerpt?: string;
  publishedDate?: string;
  tags?: string[];
  icon?: string | null;
  iconUrl?: string | null;
  coverImageUrl?: string | null;
  publicUrl?: string | null;
  content?: NewsBlock[];
}

export interface NewsBlock {
  id: string;
  type: string;
  content: any;
  children?: NewsBlock[];
}

export interface RichText {
  type: string;
  text?: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string | null;
}

// Type for Notion page response with the properties we need
interface NotionPageResponse {
  id: string;
  cover?: {
    type: string;
    file?: {
      url: string;
    };
    external?: {
      url: string;
    };
  } | null;
  icon?: {
    type: string;
    emoji?: string;
    file?: {
      url: string;
    };
  } | null;
  public_url?: string | null;
  properties?: any;
  created_time?: string;
  last_edited_time?: string;
}

export async function getContentPages(): Promise<PageDetails[]> {
  const pages = await getNotionPages(process.env.NOTION_CONTENT_PAGE_ID ?? "");

  return pages;
}

export async function getNotionPages(id: string): Promise<PageDetails[]> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: id,
      page_size: 100,
    });

    const childPages = blocks.results.filter(
      (block) => (block as BlockObjectResponse).type === "child_page",
    ) as BlockObjectResponse[];

    const childPagesWithDetails = await Promise.all(
      childPages.map(async (page) => {
        const pageId = page.id;

        // Retrieve full page details to get icon and publicUrl
        const pageDetails = (await notion.pages.retrieve({
          page_id: pageId,
        })) as unknown as NotionPageResponse;

        // Get the title from the child_page block
        const title =
          page.type === "child_page" && page.child_page
            ? (page.child_page.title ?? "Untitled")
            : "Untitled";

        // Get the icon (emoji) from the page details
        let icon: string | null = null;
        if (
          pageDetails.icon &&
          pageDetails.icon.type === "emoji" &&
          pageDetails.icon.emoji
        ) {
          icon = pageDetails.icon.emoji;
        }

        let iconUrl: string | null = null;

        if (pageDetails.icon && pageDetails.icon.type === "file") {
          iconUrl = pageDetails.icon.file?.url ?? null;
        }

        // Get the publicUrl from the page details
        const publicUrl = pageDetails.public_url ?? null;

        return {
          id: pageId,
          title,
          icon,
          publicUrl,
          iconUrl,
        };
      }),
    );

    return childPagesWithDetails;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error("Error fetching Notion pages:", error.message);
    } else {
      console.error("Error fetching Notion pages:", error);
    }
    return [];
  }
}

// New function to get news posts from a Notion page or database
export async function getNewsPosts(parentId: string): Promise<NewsPost[]> {
  if (!parentId) {
    console.error("No parent ID provided for getNewsPosts");
    return [];
  }

  // console.log(`Fetching news posts from Notion page: ${parentId}`);

  try {
    const blocks = await notion.blocks.children.list({
      block_id: parentId,
      page_size: 100,
    });

    // console.log(`Found ${blocks.results.length} blocks in parent page`);

    const childPages = blocks.results.filter(
      (block) => (block as BlockObjectResponse).type === "child_page",
    ) as BlockObjectResponse[];

    // console.log(`Found ${childPages.length} child pages`);

    if (childPages.length === 0) {
      console.warn("No child pages found. Make sure you have created child pages under your news parent page.");
      return [];
    }

    const newsPosts = await Promise.all(
      childPages.map(async (page): Promise<NewsPost | null> => {
        const pageId = page.id;

        try {
          // Retrieve full page details
          const pageDetails = (await notion.pages.retrieve({
            page_id: pageId,
          })) as unknown as NotionPageResponse;

          // Get the title from the child_page block
          const title =
            page.type === "child_page" && page.child_page
              ? (page.child_page.title ?? "Untitled")
              : "Untitled";

          // Get the icon from the page details
          let icon: string | null = null;
          let iconUrl: string | null = null;
          let coverImageUrl: string | null = null;

          if (pageDetails.icon) {
            if (pageDetails.icon.type === "emoji" && pageDetails.icon.emoji) {
              icon = pageDetails.icon.emoji;
            } else if (pageDetails.icon.type === "file" && pageDetails.icon.file) {
              iconUrl = pageDetails.icon.file.url;
            }
          }

          // Get cover image from the page details
          if (pageDetails.cover) {
            if (pageDetails.cover.type === "file" && pageDetails.cover.file) {
              coverImageUrl = pageDetails.cover.file.url;
            } else if (pageDetails.cover.type === "external" && pageDetails.cover.external) {
              coverImageUrl = pageDetails.cover.external.url;
            }
          }

          // Get excerpt from first paragraph block
          const excerpt = await getPageExcerpt(pageId);

          // console.log(`Successfully processed news post: ${title}`);

          return {
            id: pageId,
            title,
            excerpt,
            publishedDate: pageDetails.created_time,
            icon,
            iconUrl,
            coverImageUrl,
            publicUrl: pageDetails.public_url ?? null,
          };
        } catch (pageError) {
          console.error(`Error processing page ${pageId}:`, pageError);
          return null;
        }
      }),
    );

    // Filter out any null results from failed page processing
    const validNewsPosts = newsPosts.filter((post): post is NewsPost => post !== null);
    // console.log(`Successfully processed ${validNewsPosts.length} news posts`);

    return validNewsPosts;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error("Notion API error in getNewsPosts:", {
        code: error.code,
        message: error.message,
        parentId: parentId
      });

      if (error.code === 'object_not_found') {
        console.error(`
❌ Page not found: ${parentId}

Troubleshooting steps:
1. Check that NOTION_NEWS_PAGE_ID is correctly formatted with hyphens
2. Ensure the page exists in your Notion workspace
3. Make sure the page is shared with your integration:
   - Go to the page in Notion
   - Click "Share" → "Add connections"
   - Select your integration and give it "Read" permissions
4. Verify the page ID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        `);
      }
    } else {
      console.error("Unexpected error in getNewsPosts:", error);
    }
    return [];
  }
}

// Get excerpt from the first paragraph of a page
async function getPageExcerpt(pageId: string): Promise<string | undefined> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 5, // Only get first few blocks
    });

    for (const block of blocks.results) {
      const blockObj = block as BlockObjectResponse;
      if (blockObj.type === "paragraph" && blockObj.paragraph.rich_text.length > 0) {
        return blockObj.paragraph.rich_text
          .map((text: any) => text.plain_text)
          .join("")
          .substring(0, 200) + "...";
      }
    }
  } catch (error) {
    console.error("Error fetching page excerpt:", error);
  }
  return undefined;
}

// Get full news post content with all blocks
export async function getNewsPostContent(pageId: string): Promise<NewsPost | null> {
  try {
    // Get page details
    const pageDetails = (await notion.pages.retrieve({
      page_id: pageId,
    })) as unknown as NotionPageResponse;

    // Get page title
    let title = "Untitled";
    if (pageDetails.properties && pageDetails.properties.title) {
      const titleProperty = pageDetails.properties.title;
      if (titleProperty.title && titleProperty.title.length > 0) {
        title = titleProperty.title.map((t: any) => t.plain_text).join("");
      }
    }

    // Get icon
    let icon: string | null = null;
    let iconUrl: string | null = null;
    let coverImageUrl: string | null = null;

    if (pageDetails.icon) {
      if (pageDetails.icon.type === "emoji" && pageDetails.icon.emoji) {
        icon = pageDetails.icon.emoji;
      } else if (pageDetails.icon.type === "file" && pageDetails.icon.file) {
        iconUrl = pageDetails.icon.file.url;
      }
    }

    // Get cover image from the page details
    if (pageDetails.cover) {
      if (pageDetails.cover.type === "file" && pageDetails.cover.file) {
        coverImageUrl = pageDetails.cover.file.url;
      } else if (pageDetails.cover.type === "external" && pageDetails.cover.external) {
        coverImageUrl = pageDetails.cover.external.url;
      }
    }

    // Get all blocks content
    const content = await getBlocksContent(pageId);

    return {
      id: pageId,
      title,
      publishedDate: pageDetails.created_time,
      icon,
      iconUrl,
      coverImageUrl,
      publicUrl: pageDetails.public_url ?? null,
      content,
    };
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error("Error fetching news post content:", error.message);
    } else {
      console.error("Error fetching news post content:", error);
    }
    return null;
  }
}

// Recursively get all blocks content
async function getBlocksContent(blockId: string): Promise<NewsBlock[]> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
    });

    const newsBlocks: NewsBlock[] = [];

    for (const block of blocks.results) {
      const blockObj = block as BlockObjectResponse;

      const newsBlock: NewsBlock = {
        id: blockObj.id,
        type: blockObj.type,
        content: (blockObj as any)[blockObj.type],
      };

      // If block has children, recursively get them
      if (blockObj.has_children) {
        newsBlock.children = await getBlocksContent(blockObj.id);
      }

      newsBlocks.push(newsBlock);
    }

    return newsBlocks;
  } catch (error) {
    console.error("Error fetching blocks content:", error);
    return [];
  }
}

// Helper function to convert rich text to plain text
export function richTextToPlainText(richText: RichText[]): string {
  return richText.map(text => text.plain_text).join("");
}

// Helper function to convert rich text to HTML
export function richTextToHtml(richText: RichText[]): string {
  return richText.map(text => {
    let html = text.plain_text;

    if (text.annotations.bold) html = `<strong>${html}</strong>`;
    if (text.annotations.italic) html = `<em>${html}</em>`;
    if (text.annotations.strikethrough) html = `<del>${html}</del>`;
    if (text.annotations.underline) html = `<u>${html}</u>`;
    if (text.annotations.code) html = `<code>${html}</code>`;

    if (text.text?.link) {
      html = `<a href="${text.text.link.url}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    }

    return html;
  }).join("");
}

// New function to get child databases
async function getNotionDatabases(id: string): Promise<PageDetails[]> {
  try {
    const blocks = await notion.blocks.children.list({
      block_id: id,
      page_size: 100,
    });

    const childDatabases = blocks.results.filter(
      (block) => (block as BlockObjectResponse).type === "child_database",
    ) as BlockObjectResponse[];

    const databasesWithDetails = await Promise.all(
      childDatabases.map(async (database) => {
        const databaseId = database.id;

        // Get the database details
        const databaseDetails = (await notion.databases.retrieve({
          database_id: databaseId,
        })) as unknown as {
          id: string;
          title: Array<{ plain_text: string }>;
          icon?: {
            type: string;
            emoji?: string;
          } | null;
          public_url?: string | null;
        };

        // Extract title from database details
        const title =
          databaseDetails.title?.length > 0
            ? databaseDetails.title.map((t) => t.plain_text).join("")
            : "Untitled Database";

        // Get the icon (emoji) from the database details
        let icon: string | null = null;
        if (
          databaseDetails.icon &&
          databaseDetails.icon.type === "emoji" &&
          databaseDetails.icon.emoji
        ) {
          icon = databaseDetails.icon.emoji;
        }

        return {
          id: databaseId,
          title,
          icon,
          publicUrl: databaseDetails.public_url ?? null,
          iconUrl: null,
        };
      }),
    );

    return databasesWithDetails;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error("Error fetching Notion databases:", error.message);
    } else {
      console.error("Error fetching Notion databases:", error);
    }
    return [];
  }
}