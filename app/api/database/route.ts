import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Função para serializar dados do banco para JSON
function serializeData(data: any): any {
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
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeData(data[key]);
      }
    }
    return serialized;
  }

  return data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tableName = searchParams.get('table');

    if (action === 'tables') {
      try {
        // Listar todas as tabelas do banco
        const tables = await prisma.$queryRaw<Array<{ TABLE_NAME: string }>>`
          SELECT TABLE_NAME
          FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
          ORDER BY TABLE_NAME
        `;

        return NextResponse.json({
          success: true,
          tables: tables.map(t => t.TABLE_NAME)
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (dbError: any) {
        console.error('Database query error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Erro ao conectar com o banco de dados',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        }, {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    }

    if (action === 'table-info' && tableName) {
      // Validar nome da tabela (apenas letras, números e underscore)
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return NextResponse.json(
          { success: false, error: 'Invalid table name' },
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      try {
        // Obter informações sobre uma tabela específica (colunas, tipos, etc.)
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

        // Contar total de registros
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
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (dbError: any) {
        console.error('Database query error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Erro ao buscar informações da tabela',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        }, {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    }

    if (action === 'table-data' && tableName) {
      // Validar nome da tabela (apenas letras, números e underscore)
      if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        return NextResponse.json(
          { success: false, error: 'Invalid table name' },
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }

      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 registros
      const offset = (page - 1) * limit;

      try {
        // Obter dados da tabela com paginação
        const rawData = await prisma.$queryRawUnsafe(
          `SELECT * FROM \`${tableName}\` LIMIT ${limit} OFFSET ${offset}`
        );

        // Serializar dados para JSON (converter BigInt, Date, Buffer, etc.)
        const data = serializeData(rawData);

        // Contar total de registros
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
        }, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (dbError: any) {
        console.error('Database query error:', {
          message: dbError.message,
          stack: dbError.stack,
          code: dbError.code,
          tableName
        });
        return NextResponse.json({
          success: false,
          error: 'Erro ao buscar dados da tabela',
          details: process.env.NODE_ENV === 'development' ? {
            message: dbError.message,
            code: dbError.code,
            tableName
          } : undefined
        }, {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error: any) {
    console.error('Database API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Database error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

