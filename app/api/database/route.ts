import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/better-auth/server';
import { isAdmin } from '@/lib/utils/admin';
import { logger } from '@/lib/logger';

// Serialize database data for JSON response
function serializeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return data.toString('base64');
  }

  if (typeof data === 'object') {
    const serialized: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeData((data as Record<string, unknown>)[key]);
      }
    }
    return serialized;
  }

  return data;
}

export async function GET(request: Request) {
  try {
    // CRITICAL: Admin authentication required
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isAdmin(session)) {
      logger.warn("Unauthorized database access attempt", { userId: session.user.id });
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tableName = searchParams.get('table');

    if (action === 'tables') {
      try {
        const tables = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
          SELECT TABLE_NAME
          FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
          ORDER BY TABLE_NAME
        `;

        return NextResponse.json({
          success: true,
          tables: tables.map(t => t.TABLE_NAME)
        });
      } catch (dbError) {
        logger.error('Database query error', dbError);
        return NextResponse.json({
          success: false,
          error: 'Database connection error'
        }, { status: 500 });
      }
    }

    if (action === 'table-info' && tableName) {
      // Validate table name (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return NextResponse.json(
          { success: false, error: 'Invalid table name' },
          { status: 400 }
        );
      }

      try {
        const columns = await prisma.$queryRaw<Array<{
          COLUMN_NAME: string;
          DATA_TYPE: string;
          IS_NULLABLE: string;
          COLUMN_KEY: string;
          COLUMN_DEFAULT: string | null;
        }>>`
          SELECT
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_KEY,
            COLUMN_DEFAULT
          FROM information_schema.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ${tableName}
          ORDER BY ORDINAL_POSITION
        `;

        const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT COUNT(*) as count FROM \`${tableName}\``
        );
        const totalRecords = Number(countResult[0]?.count || 0);

        return NextResponse.json({
          success: true,
          tableName,
          columns: columns.map(col => ({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            nullable: col.IS_NULLABLE === 'YES',
            key: col.COLUMN_KEY,
            default: col.COLUMN_DEFAULT
          })),
          totalRecords
        });
      } catch (dbError) {
        logger.error('Database query error', dbError);
        return NextResponse.json({
          success: false,
          error: 'Error fetching table info'
        }, { status: 500 });
      }
    }

    if (action === 'table-data' && tableName) {
      // Validate table name
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return NextResponse.json(
          { success: false, error: 'Invalid table name' },
          { status: 400 }
        );
      }

      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
      const offset = (page - 1) * limit;

      try {
        const rawData = await prisma.$queryRawUnsafe(
          `SELECT * FROM \`${tableName}\` LIMIT ${limit} OFFSET ${offset}`
        );

        const data = serializeData(rawData);

        const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
          `SELECT COUNT(*) as count FROM \`${tableName}\``
        );
        const totalRecords = Number(countResult[0]?.count || 0);

        return NextResponse.json({
          success: true,
          tableName,
          data,
          pagination: {
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit)
          }
        });
      } catch (dbError) {
        logger.error('Database query error', dbError);
        return NextResponse.json({
          success: false,
          error: 'Error fetching table data'
        }, { status: 500 });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Database API error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
