'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  Search,
  ArrowLeft,
  Package,
  Calendar,
  AlertTriangle,
  Box,
  MoreHorizontal,
  Trash2,
  Eye,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Product, StockBatch, CreateBatchDTO } from '@/types/inventory';

const emptyBatch: Omit<CreateBatchDTO, 'productId'> = {
  batchNumber: '',
  manufacturer: '',
  supplier: '',
  manufacturingDate: '',
  expirationDate: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  initialQuantity: 1,
  unitCost: 0,
  location: '',
  invoiceNumber: '',
  notes: '',
};

export default function LotesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formData, setFormData] = useState(emptyBatch);

  // Fetch products for dropdown
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/inventory/products');
      return res.data;
    },
  });

  // Fetch all batches
  const { data: batches = [], isLoading } = useQuery<StockBatch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await api.get('/inventory/batches');
      return res.data;
    },
  });

  // Create batch mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateBatchDTO) => {
      const res = await api.post('/inventory/batches', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-list'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      toast.success('Lote cadastrado com sucesso!');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar lote');
    },
  });

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group batches by product for summary
  const batchesByProduct = batches.reduce((acc, batch) => {
    if (!acc[batch.productId]) {
      acc[batch.productId] = {
        productName: batch.productName,
        batches: [],
        totalQuantity: 0,
      };
    }
    acc[batch.productId].batches.push(batch);
    acc[batch.productId].totalQuantity += batch.currentQuantity;
    return acc;
  }, {} as Record<string, { productName: string; batches: StockBatch[]; totalQuantity: number }>);

  const handleOpenForm = (productId?: string) => {
    setSelectedProductId(productId || '');
    setFormData({
      ...emptyBatch,
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    
    // Pre-fill manufacturer if product has default
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product?.defaultManufacturer) {
        setFormData(prev => ({ ...prev, manufacturer: product.defaultManufacturer || '' }));
      }
    }
    
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProductId('');
    setFormData(emptyBatch);
  };

  const handleSubmit = () => {
    if (!selectedProductId) {
      toast.error('Selecione um produto');
      return;
    }
    if (!formData.batchNumber || !formData.manufacturer) {
      toast.error('Preencha o número do lote e fabricante');
      return;
    }
    if (!formData.expirationDate) {
      toast.error('Preencha a data de validade');
      return;
    }
    if (formData.initialQuantity <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    createMutation.mutate({
      ...formData,
      productId: selectedProductId,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: StockBatch['status'], expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate);
    
    if (status === 'depleted') {
      return <Badge variant="outline" className="text-gray-500">Esgotado</Badge>;
    }
    if (status === 'expired' || days <= 0) {
      return <Badge variant="destructive">Vencido</Badge>;
    }
    if (days <= 15) {
      return <Badge className="bg-destructive/15 text-red-700">Vence em {days}d</Badge>;
    }
    if (days <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-700">Vence em {days}d</Badge>;
    }
    if (status === 'low') {
      return <Badge className="bg-orange-100 text-orange-700">Estoque Baixo</Badge>;
    }
    return <Badge className="bg-primary/15 text-primary">OK</Badge>;
  };

  // Summary stats
  const stats = {
    total: batches.length,
    active: batches.filter(b => b.status === 'active').length,
    expiringSoon: batches.filter(b => {
      const days = getDaysUntilExpiration(b.expirationDate);
      return days > 0 && days <= 30;
    }).length,
    expired: batches.filter(b => getDaysUntilExpiration(b.expirationDate) <= 0).length,
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/estoque">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Lotes de Estoque</h1>
              <p className="text-muted-foreground">
                Entrada e gestão de lotes
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/15 rounded-lg">
                  <Box className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total de Lotes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/15 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats.active}</p>
                  <p className="text-xs text-gray-500">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiringSoon}</p>
                  <p className="text-xs text-gray-500">Vencendo (30d)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/15 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
                  <p className="text-xs text-gray-500">Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por produto, lote ou fabricante..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="expiring">Vencendo</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                  <SelectItem value="depleted">Esgotados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Batches Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Lotes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Box className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {batches.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum lote cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro lote
                    </Button>
                  </>
                ) : (
                  <p>Nenhum lote encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Fabricante</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-center">Validade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Custo Unit.</TableHead>
                      <TableHead className="text-center">Local</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <p className="font-medium">{batch.productName}</p>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {batch.batchNumber}
                          </code>
                        </TableCell>
                        <TableCell>{batch.manufacturer}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{batch.currentQuantity}</span>
                          {batch.currentQuantity !== batch.initialQuantity && (
                            <span className="text-xs text-gray-500 block">
                              de {batch.initialQuantity}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(batch.expirationDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(batch.status, batch.expirationDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(batch.unitCost)}
                        </TableCell>
                        <TableCell className="text-center">
                          {batch.location || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Batch Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📦 Nova Entrada de Estoque</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select value={selectedProductId} onValueChange={(value) => {
                setSelectedProductId(value);
                const product = products.find(p => p.id === value);
                if (product?.defaultManufacturer) {
                  setFormData(prev => ({ ...prev, manufacturer: product.defaultManufacturer || '' }));
                }
                if (product?.costPrice) {
                  setFormData(prev => ({ ...prev, unitCost: product.costPrice }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} {product.genericName ? `(${product.genericName})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {products.length === 0 && (
                <p className="text-sm text-yellow-600">
                  Nenhum produto cadastrado. <Link href="/estoque/produtos" className="underline">Cadastre primeiro</Link>
                </p>
              )}
            </div>

            {/* Batch Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do Lote *</Label>
                <Input
                  placeholder="Ex: ABC123"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fabricante *</Label>
                <Input
                  placeholder="Ex: EMS"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input
                placeholder="Ex: Distribuidora XYZ"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data de Fabricação</Label>
                <Input
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade *</Label>
                <Input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data da Compra</Label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
            </div>

            {/* Quantity and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.initialQuantity}
                  onChange={(e) => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Unitário (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo Total</Label>
                <div className="h-10 flex items-center justify-center rounded-md border bg-gray-50 font-bold text-primary">
                  {formatCurrency(formData.initialQuantity * formData.unitCost)}
                </div>
              </div>
            </div>

            {/* Location and Invoice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input
                  placeholder="Ex: Geladeira 1, Prateleira A"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nota Fiscal</Label>
                <Input
                  placeholder="Ex: NF-001234"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Input
                placeholder="Observações adicionais..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Cadastrar Lote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
