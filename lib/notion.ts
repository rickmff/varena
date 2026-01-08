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