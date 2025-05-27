import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

export async function GET() {
  const notionApiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !databaseId) {
    return NextResponse.json(
      { error: 'Notion API Key or Database ID is not configured' },
      { status: 500 }
    );
  }

  const notion = new Client({ auth: notionApiKey });

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const fetchedNews = response.results.map((page: any) => {
      const title = page.properties.Name?.title[0]?.plain_text || "Untitled";
      const date = page.properties.Date?.date?.start || new Date().toISOString();
      const excerpt = page.properties.Excerpt?.rich_text[0]?.plain_text || "No Excerpt";
      const category = page.properties.Category?.select?.name || "General";
      const iconName = page.properties.IconName?.rich_text[0]?.plain_text || "Terminal";

      return {
        id: page.id,
        title: title,
        date: date,
        excerpt: excerpt,
        category: category,
        iconName: iconName,
      };
    });

    return NextResponse.json(fetchedNews);
  } catch (error) {
    console.error("Failed to fetch news from Notion:", error);
    return NextResponse.json(
      { error: 'Failed to fetch news from Notion' },
      { status: 500 }
    );
  }
}