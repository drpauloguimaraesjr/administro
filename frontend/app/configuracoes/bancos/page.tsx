'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Landmark,
  CreditCard,
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

interface ContaBancaria extends BaseDocument {
  nome: string;
  tipo: string;
  banco: string;
  agencia: string;
  conta: string;
  digitoConta: string;
  chavePix: string;
  tipoChavePix: string;
  titular: string;
  cpfCnpj: string;
  saldoInicial: number;
  principal: boolean;
  ativo: boolean;
}

const TIPOS_CONTA = [
  'Conta Corrente',
  'Conta Poupança',
  'Conta Pagamento',
  'Caixa',
  'Carteira Digital',
];

const BANCOS = [
  { codigo: '001', nome: 'Banco do Brasil' },
  { codigo: '033', nome: 'Santander' },
  { codigo: '104', nome: 'Caixa Econômica' },
  { codigo: '237', nome: 'Bradesco' },
  { codigo: '341', nome: 'Itaú' },
  { codigo: '260', nome: 'Nubank' },
  { codigo: '077', nome: 'Inter' },
  { codigo: '336', nome: 'C6 Bank' },
  { codigo: '380', nome: 'PicPay' },
  { codigo: '323', nome: 'Mercado Pago' },
  { codigo: '000', nome: 'Outro' },
];

const TIPOS_PIX = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'aleatoria', label: 'Chave Aleatória' },
];

const emptyContaBancaria: Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  tipo: 'Conta Corrente',
  banco: '',
  agencia: '',
  conta: '',
  digitoConta: '',
  chavePix: '',
  tipoChavePix: '',
  titular: '',
  cpfCnpj: '',
  saldoInicial: 0,
  principal: false,
  ativo: true,
};

export default function BancosPage() {
  const { data: contas, loading, create, update, remove } = useFirestoreCrud<ContaBancaria>('contas_bancarias', 'nome');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContaBancaria | null>(null);
  const [formData, setFormData] = useState(emptyContaBancaria);

  const filteredContas = useMemo(() => {
    return contas.filter((conta) => {
      const matchesSearch =
        conta.nome.toLowerCase().includes(search.toLowerCase()) ||
        conta.banco.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'all' || conta.tipo === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [contas, search, tipoFilter]);

  const handleOpenForm = (item?: ContaBancaria) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        tipo: item.tipo,
        banco: item.banco,
        agencia: item.agencia,
        conta: item.conta,
        digitoConta: item.digitoConta,
        chavePix: item.chavePix,
        tipoChavePix: item.tipoChavePix,
        titular: item.titular,
        cpfCnpj: item.cpfCnpj,
        saldoInicial: item.saldoInicial,
        principal: item.principal,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyContaBancaria);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyContaBancaria);
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.tipo) {
      return;
    }

    // Se marcar como principal, desmarcar outras
    if (formData.principal) {
      const outrasContas = contas.filter(c => c.id !== editingItem?.id && c.principal);
      for (const conta of outrasContas) {
        await update(conta.id, { principal: false });
      }
    }

    if (editingItem) {
      await update(editingItem.id, formData);
    } else {
      await create(formData);
    }
    handleCloseForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await remove(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case 'Caixa':
        return <Wallet className="w-4 h-4" />;
      case 'Carteira Digital':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Landmark className="w-4 h-4" />;
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Landmark className="w-8 h-8 text-emerald-600" />
              Contas Correntes
            </h1>
            <p className="text-muted-foreground">
              Cadastro de contas bancárias da clínica
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar conta..."
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
                  {TIPOS_CONTA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
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
            ) : filteredContas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Landmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {contas.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhuma conta cadastrada</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeira conta
                    </Button>
                  </>
                ) : (
                  <p>Nenhuma conta encontrada com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Agência/Conta</TableHead>
                    <TableHead>PIX</TableHead>
                    <TableHead className="text-right">Saldo Inicial</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getIconForType(conta.tipo)}
                          <div>
                            <p className="font-medium">{conta.nome}</p>
                            <p className="text-xs text-gray-500">{conta.tipo}</p>
                          </div>
                          {conta.principal && (
                            <Badge className="bg-yellow-100 text-yellow-800 ml-2">Principal</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {BANCOS.find(b => b.codigo === conta.banco)?.nome || conta.banco || '-'}
                      </TableCell>
                      <TableCell>
                        {conta.agencia && conta.conta ? (
                          <span className="font-mono text-sm">
                            {conta.agencia} / {conta.conta}-{conta.digitoConta}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {conta.chavePix ? (
                          <div className="text-sm">
                            <Badge variant="outline" className="text-xs">
                              {TIPOS_PIX.find(t => t.value === conta.tipoChavePix)?.label || 'PIX'}
                            </Badge>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(conta.saldoInicial)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={conta.ativo ? 'default' : 'secondary'}>
                          {conta.ativo ? 'Ativa' : 'Inativa'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(conta)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(conta.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Conta *</Label>
                <Input
                  placeholder="Ex: Conta Principal"
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
                    {TIPOS_CONTA.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">🏦 Dados Bancários</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Banco</Label>
                  <Select
                    value={formData.banco}
                    onValueChange={(value) => setFormData({ ...formData, banco: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BANCOS.map((banco) => (
                        <SelectItem key={banco.codigo} value={banco.codigo}>
                          {banco.codigo} - {banco.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Agência</Label>
                  <Input
                    placeholder="0000"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2 col-span-1">
                  <Label>Conta</Label>
                  <Input
                    placeholder="00000"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dígito</Label>
                  <Input
                    placeholder="0"
                    maxLength={2}
                    value={formData.digitoConta}
                    onChange={(e) => setFormData({ ...formData, digitoConta: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">💳 PIX</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Chave</Label>
                  <Select
                    value={formData.tipoChavePix}
                    onValueChange={(value) => setFormData({ ...formData, tipoChavePix: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PIX.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX</Label>
                  <Input
                    placeholder="Digite a chave"
                    value={formData.chavePix}
                    onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">👤 Titular</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Titular</Label>
                  <Input
                    placeholder="Nome completo"
                    value={formData.titular}
                    onChange={(e) => setFormData({ ...formData, titular: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Saldo Inicial (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.saldoInicial}
                onChange={(e) => setFormData({ ...formData, saldoInicial: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="principal"
                  checked={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="principal">Conta principal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ativo">Conta ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
