'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useFirestoreCrud, BaseDocument } from '@/hooks/use-firestore-crud';

interface FormaPagamento extends BaseDocument {
  nome: string;
  tipo: string;
  taxaPercentual: number;
  taxaFixa: number;
  diasRecebimento: number;
  contaBancariaId?: string;
  geraRecebivel: boolean;
  permiteParcelas: boolean;
  maxParcelas: number;
  ordem: number;
  ativo: boolean;
}

const TIPOS_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { value: 'pix', label: 'PIX', icon: QrCode },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: CreditCard },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: CreditCard },
  { value: 'boleto', label: 'Boleto', icon: Wallet },
  { value: 'transferencia', label: 'Transferência', icon: Wallet },
  { value: 'cheque', label: 'Cheque', icon: Wallet },
  { value: 'convenio', label: 'Convênio', icon: Wallet },
  { value: 'cortesia', label: 'Cortesia', icon: Wallet },
];

const emptyFormaPagamento: Omit<FormaPagamento, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  tipo: 'dinheiro',
  taxaPercentual: 0,
  taxaFixa: 0,
  diasRecebimento: 0,
  contaBancariaId: '',
  geraRecebivel: true,
  permiteParcelas: false,
  maxParcelas: 1,
  ordem: 0,
  ativo: true,
};

export default function PagamentosPage() {
  const { data: formasPagamento, loading, create, update, remove } = useFirestoreCrud<FormaPagamento>('formas_pagamento', 'ordem');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FormaPagamento | null>(null);
  const [formData, setFormData] = useState(emptyFormaPagamento);

  const filteredFormasPagamento = useMemo(() => {
    return formasPagamento.filter((forma) => {
      const matchesSearch = forma.nome.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'all' || forma.tipo === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [formasPagamento, search, tipoFilter]);

  const handleOpenForm = (item?: FormaPagamento) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        tipo: item.tipo,
        taxaPercentual: item.taxaPercentual,
        taxaFixa: item.taxaFixa,
        diasRecebimento: item.diasRecebimento,
        contaBancariaId: item.contaBancariaId || '',
        geraRecebivel: item.geraRecebivel,
        permiteParcelas: item.permiteParcelas,
        maxParcelas: item.maxParcelas,
        ordem: item.ordem,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...emptyFormaPagamento,
        ordem: formasPagamento.length + 1,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyFormaPagamento);
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.tipo) {
      return;
    }

    if (editingItem) {
      await update(editingItem.id, formData);
    } else {
      await create(formData);
    }
    handleCloseForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
      await remove(id);
    }
  };

  const getIconForType = (tipo: string) => {
    const found = TIPOS_PAGAMENTO.find(t => t.value === tipo);
    if (found) {
      const Icon = found.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Wallet className="w-4 h-4" />;
  };

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-amber-600" />
              Formas de Pagamento
            </h1>
            <p className="text-muted-foreground">
              Configuração de métodos de pagamento aceitos
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Forma
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar forma de pagamento..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TIPOS_PAGAMENTO.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : filteredFormasPagamento.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {formasPagamento.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhuma forma de pagamento cadastrada</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeira forma
                    </Button>
                  </>
                ) : (
                  <p>Nenhuma forma de pagamento encontrada</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Taxa</TableHead>
                    <TableHead className="text-center">Recebimento</TableHead>
                    <TableHead className="text-center">Parcelas</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFormasPagamento.map((forma) => (
                    <TableRow key={forma.id}>
                      <TableCell className="text-gray-400">{forma.ordem}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIconForType(forma.tipo)}
                          <span className="font-medium">{forma.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {TIPOS_PAGAMENTO.find(t => t.value === forma.tipo)?.label || forma.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {forma.taxaPercentual > 0 || forma.taxaFixa > 0 ? (
                          <span className="text-sm text-destructive">
                            {forma.taxaPercentual > 0 && `${forma.taxaPercentual}%`}
                            {forma.taxaPercentual > 0 && forma.taxaFixa > 0 && ' + '}
                            {forma.taxaFixa > 0 && `R$ ${forma.taxaFixa.toFixed(2)}`}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {forma.diasRecebimento > 0 ? (
                          <Badge variant="outline">{forma.diasRecebimento} dias</Badge>
                        ) : (
                          <Badge className="bg-primary/15 text-primary">Imediato</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {forma.permiteParcelas ? (
                          <Badge variant="outline">Até {forma.maxParcelas}x</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={forma.ativo ? 'default' : 'secondary'}>
                          {forma.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(forma)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(forma.id)}
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  placeholder="Ex: PIX"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PAGAMENTO.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <tipo.icon className="w-4 h-4" />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">💸 Taxas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Taxa Percentual (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxaPercentual}
                    onChange={(e) => setFormData({ ...formData, taxaPercentual: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa Fixa (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxaFixa}
                    onChange={(e) => setFormData({ ...formData, taxaFixa: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dias para Recebimento</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.diasRecebimento}
                  onChange={(e) => setFormData({ ...formData, diasRecebimento: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">0 = recebimento imediato</p>
              </div>
              <div className="space-y-2">
                <Label>Ordem de Exibição</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">⚙️ Configurações</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="geraRecebivel"
                    checked={formData.geraRecebivel}
                    onChange={(e) => setFormData({ ...formData, geraRecebivel: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="geraRecebivel">Gera conta a receber</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="permiteParcelas"
                    checked={formData.permiteParcelas}
                    onChange={(e) => setFormData({ ...formData, permiteParcelas: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="permiteParcelas">Permite parcelamento</Label>
                </div>
              </div>

              {formData.permiteParcelas && (
                <div className="mt-4 space-y-2">
                  <Label>Máximo de Parcelas</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.maxParcelas}
                    onChange={(e) => setFormData({ ...formData, maxParcelas: parseInt(e.target.value) || 1 })}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ativo">Forma de pagamento ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
