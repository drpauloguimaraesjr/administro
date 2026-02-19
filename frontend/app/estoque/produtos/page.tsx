'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  ArrowLeft,
  Filter,
  MoreHorizontal,
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Product, CreateProductDTO } from '@/types/inventory';

const PRODUCT_TYPES = [
  { value: 'medication', label: 'Medicamento' },
  { value: 'injectable', label: 'Injetável' },
  { value: 'supplement', label: 'Suplemento' },
  { value: 'material', label: 'Material' },
  { value: 'procedure', label: 'Procedimento' },
];

const UNITS = [
  { value: 'amp', label: 'Ampola' },
  { value: 'comp', label: 'Comprimido' },
  { value: 'ml', label: 'mL' },
  { value: 'un', label: 'Unidade' },
  { value: 'fr', label: 'Frasco' },
  { value: 'cx', label: 'Caixa' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'Grama' },
];

const CATEGORIES = [
  'Vitaminas',
  'Antibióticos',
  'Analgésicos',
  'Hormônios',
  'Anti-inflamatórios',
  'Suplementos',
  'Materiais',
  'Procedimentos',
  'Outros',
];

const STORAGE_CONDITIONS = [
  { value: 'room', label: 'Temperatura Ambiente' },
  { value: 'refrigerated', label: 'Refrigerado (2-8°C)' },
  { value: 'frozen', label: 'Congelado' },
];

const emptyProduct: CreateProductDTO = {
  name: '',
  genericName: '',
  type: 'medication',
  category: '',
  unit: 'un',
  defaultManufacturer: '',
  trackStock: true,
  minStock: 5,
  optimalStock: 20,
  costPrice: 0,
  sellPrice: 0,
  aliases: [],
  requiresPrescription: false,
  isControlled: false,
  storageConditions: 'room',
};

export default function ProdutosPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDTO>(emptyProduct);
  const [aliasInput, setAliasInput] = useState('');

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/inventory/products');
      return res.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateProductDTO) => {
      const res = await api.post('/inventory/products', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto cadastrado com sucesso!');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar produto');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const res = await api.put(`/inventory/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar produto');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover produto');
    },
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.genericName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || product.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        genericName: product.genericName,
        type: product.type,
        category: product.category,
        unit: product.unit,
        defaultManufacturer: product.defaultManufacturer,
        trackStock: product.trackStock,
        minStock: product.minStock,
        optimalStock: product.optimalStock,
        costPrice: product.costPrice,
        sellPrice: product.sellPrice,
        aliases: product.aliases,
        requiresPrescription: product.requiresPrescription,
        isControlled: product.isControlled,
        controlType: product.controlType,
        storageConditions: product.storageConditions,
      });
    } else {
      setEditingProduct(null);
      setFormData(emptyProduct);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData(emptyProduct);
    setAliasInput('');
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddAlias = () => {
    if (aliasInput.trim() && !formData.aliases?.includes(aliasInput.trim())) {
      setFormData({
        ...formData,
        aliases: [...(formData.aliases || []), aliasInput.trim()],
      });
      setAliasInput('');
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setFormData({
      ...formData,
      aliases: formData.aliases?.filter(a => a !== alias) || [],
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="px-4 py-6">
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
              <h1 className="text-3xl font-bold">Produtos</h1>
              <p className="text-muted-foreground">
                Cadastro de produtos e itens de estoque
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, genérico ou alias..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {PRODUCT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {products.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum produto cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro produto
                    </Button>
                  </>
                ) : (
                  <p>Nenhum produto encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Unidade</TableHead>
                    <TableHead className="text-center">Est. Mínimo</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Venda</TableHead>
                    <TableHead className="text-center">Margem</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.genericName && (
                            <p className="text-xs text-gray-500">{product.genericName}</p>
                          )}
                          {product.aliases.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {product.aliases.slice(0, 2).map(alias => (
                                <Badge key={alias} variant="outline" className="text-xs">
                                  {alias}
                                </Badge>
                              ))}
                              {product.aliases.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.aliases.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {PRODUCT_TYPES.find(t => t.value === product.type)?.label || product.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-center">
                        {UNITS.find(u => u.value === product.unit)?.label || product.unit}
                      </TableCell>
                      <TableCell className="text-center">{product.minStock}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="text-gray-500 text-xs">Custo</p>
                          <p>{formatCurrency(product.costPrice)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="text-gray-500 text-xs">Venda</p>
                          <p className="font-medium">{formatCurrency(product.sellPrice)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.costPrice && product.sellPrice && product.sellPrice > 0 ? (
                          <Badge className={
                            product.sellPrice > product.costPrice 
                              ? 'bg-primary/15 text-primary' 
                              : 'bg-destructive/15 text-red-700'
                          }>
                            {(((product.sellPrice - product.costPrice) / product.sellPrice) * 100).toFixed(0)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(product)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Tem certeza que deseja remover este produto?')) {
                                  deleteMutation.mutate(product.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  placeholder="Ex: Vitamina B12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Genérico</Label>
                <Input
                  placeholder="Ex: Cianocobalamina"
                  value={formData.genericName || ''}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value: any) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map(unit => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fabricante Padrão</Label>
              <Input
                placeholder="Ex: EMS"
                value={formData.defaultManufacturer || ''}
                onChange={(e) => setFormData({ ...formData, defaultManufacturer: e.target.value })}
              />
            </div>

            {/* Stock Settings */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Configurações de Estoque</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Ideal</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.optimalStock}
                    onChange={(e) => setFormData({ ...formData, optimalStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Armazenamento</Label>
                  <Select
                    value={formData.storageConditions || 'room'}
                    onValueChange={(value: any) => setFormData({ ...formData, storageConditions: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STORAGE_CONDITIONS.map(cond => (
                        <SelectItem key={cond.value} value={cond.value}>
                          {cond.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">💰 Precificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Custo (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500">Quanto você paga</p>
                </div>
                <div className="space-y-2">
                  <Label>Preço de Venda (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-gray-500">Quanto você cobra</p>
                </div>
                <div className="space-y-2">
                  <Label>Margem de Lucro</Label>
                  <div className={`h-10 flex items-center justify-center rounded-md border text-lg font-bold ${
                    formData.costPrice && formData.sellPrice && formData.sellPrice > formData.costPrice
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : formData.costPrice && formData.sellPrice && formData.sellPrice < formData.costPrice
                      ? 'bg-destructive/10 border-destructive/30 text-red-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    {formData.costPrice && formData.sellPrice && formData.sellPrice > 0
                      ? `${(((formData.sellPrice - formData.costPrice) / formData.sellPrice) * 100).toFixed(1)}%`
                      : '—'
                    }
                  </div>
                  <p className="text-xs text-gray-500">
                    Lucro: {formData.costPrice && formData.sellPrice 
                      ? formatCurrency(formData.sellPrice - formData.costPrice)
                      : 'R$ 0,00'
                    }
                  </p>
                </div>
              </div>
              
              {/* Quick Markup Calculator */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Calculadora de Markup</p>
                <div className="flex flex-wrap gap-2">
                  {[30, 50, 100, 150, 200].map(markup => {
                    const cost = formData.costPrice || 0;
                    const suggestedPrice = cost * (1 + markup / 100);
                    return (
                      <Button
                        key={markup}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setFormData({ ...formData, sellPrice: parseFloat(suggestedPrice.toFixed(2)) })}
                        disabled={!formData.costPrice}
                      >
                        +{markup}% = {formatCurrency(suggestedPrice)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Aliases */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Nomes Alternativos (Aliases)</h3>
              <p className="text-sm text-gray-500 mb-2">
                Adicione nomes alternativos para facilitar a busca e o match automático
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Ex: B12, Cobalamina..."
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAlias();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddAlias}>
                  Adicionar
                </Button>
              </div>
              {formData.aliases && formData.aliases.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.aliases.map(alias => (
                    <Badge
                      key={alias}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveAlias(alias)}
                    >
                      {alias} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Flags */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Classificação</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trackStock"
                    checked={formData.trackStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, trackStock: !!checked })}
                  />
                  <Label htmlFor="trackStock">Controlar estoque deste produto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresPrescription"
                    checked={formData.requiresPrescription}
                    onCheckedChange={(checked) => setFormData({ ...formData, requiresPrescription: !!checked })}
                  />
                  <Label htmlFor="requiresPrescription">Requer prescrição</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isControlled"
                    checked={formData.isControlled}
                    onCheckedChange={(checked) => setFormData({ ...formData, isControlled: !!checked })}
                  />
                  <Label htmlFor="isControlled">Medicamento controlado</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
