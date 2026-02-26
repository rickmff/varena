"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface TableInfo {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: string | null;
}

interface TableData {
  [key: string]: any;
}

export default function DatabasePage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const limit = 50;

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableInfo(selectedTable);
      loadTableData(selectedTable, 1);
    }
  }, [selectedTable]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/database?action=tables');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Resposta não é JSON válido');
      }

      const result = await response.json();

      if (result.success) {
        setTables(result.tables);
        if (result.tables.length > 0 && !selectedTable) {
          setSelectedTable(result.tables[0]);
        }
      } else {
        toast.error(result.error || 'Erro ao carregar tabelas');
        if (result.details) {
          console.error('Detalhes do erro:', result.details);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao conectar com o banco de dados');
      console.error('Erro ao carregar tabelas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableInfo = async (tableName: string) => {
    try {
      const response = await fetch(`/api/database?action=table-info&table=${tableName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Resposta não é JSON válido');
      }

      const result = await response.json();

      if (result.success) {
        setTableInfo(result.columns);
        setTotalRecords(result.totalRecords);
      } else {
        toast.error(result.error || 'Erro ao carregar informações da tabela');
        if (result.details) {
          console.error('Detalhes do erro:', result.details);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao carregar informações da tabela');
      console.error('Erro:', error);
    }
  };

  const loadTableData = async (tableName: string, pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/database?action=table-data&table=${tableName}&page=${pageNum}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        throw new Error('Resposta não é JSON válido');
      }

      const result = await response.json();

      if (result.success) {
        setTableData(result.data);
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotalRecords(result.pagination.totalRecords);
      } else {
        toast.error(result.error || 'Erro ao carregar dados da tabela');
        if (result.details) {
          console.error('Detalhes do erro:', result.details);
        }
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados da tabela');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(1);
    setSearchTerm('');
  };

  const handlePageChange = (newPage: number) => {
    if (selectedTable && newPage >= 1 && newPage <= totalPages) {
      loadTableData(selectedTable, newPage);
    }
  };

  const filteredTables = tables.filter(table =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColumnHeaders = () => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value instanceof Date) return value.toLocaleString();
    return String(value);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visualizador de Banco de Dados</h1>
          <p className="text-muted-foreground mt-2">
            Explore tabelas e dados do banco de dados MySQL
          </p>
        </div>
        <Button onClick={loadTables} variant="outline">
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com lista de tabelas */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tabelas</CardTitle>
            <CardDescription>
              {tables.length} tabela{tables.length !== 1 ? 's' : ''} encontrada{tables.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar tabela..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {filteredTables.map((table) => (
                <Button
                  key={table}
                  variant={selectedTable === table ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleTableSelect(table)}
                >
                  {table}
                </Button>
              ))}
              {filteredTables.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tabela encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3 space-y-6">
          {selectedTable ? (
            <Tabs defaultValue="data" className="w-full">
              <TabsList>
                <TabsTrigger value="data">Dados</TabsTrigger>
                <TabsTrigger value="structure">Estrutura</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedTable}</CardTitle>
                        <CardDescription>
                          {totalRecords} registro{totalRecords !== 1 ? 's' : ''} total{totalRecords !== 1 ? 'is' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Carregando dados...</p>
                      </div>
                    ) : tableData.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nenhum dado encontrado</p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {getColumnHeaders().map((header) => (
                                  <TableHead key={header} className="font-semibold">
                                    {header}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tableData.map((row, idx) => (
                                <TableRow key={idx}>
                                  {getColumnHeaders().map((header) => (
                                    <TableCell key={header} className="max-w-[300px] truncate">
                                      <span title={formatValue(row[header])}>
                                        {formatValue(row[header])}
                                      </span>
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                              Página {page} de {totalPages}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1 || loading}
                              >
                                Anterior
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages || loading}
                              >
                                Próxima
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estrutura da Tabela: {selectedTable}</CardTitle>
                    <CardDescription>
                      Informações sobre colunas, tipos e propriedades
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tableInfo.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Carregando estrutura...</p>
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Coluna</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Nulo</TableHead>
                              <TableHead>Chave</TableHead>
                              <TableHead>Padrão</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableInfo.map((column, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{column.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{column.type}</Badge>
                                </TableCell>
                                <TableCell>
                                  {column.nullable ? (
                                    <Badge variant="secondary">Sim</Badge>
                                  ) : (
                                    <Badge variant="destructive">Não</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {column.key ? (
                                    <Badge variant="default">{column.key}</Badge>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {column.default !== null ? (
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {String(column.default)}
                                    </code>
                                  ) : (
                                    <span className="text-muted-foreground">NULL</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Selecione uma tabela para visualizar seus dados
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

