'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface PlanoContas extends BaseDocument {
  codigo: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  contaPai?: string;
  nivel: number;
  ativo: boolean;
}

const CATEGORIAS_RECEITA = [
  'Consultas',
  'Procedimentos',
  'Exames',
  'Convênios',
  'Produtos',
  'Serviços',
  'Outras Receitas',
];

const CATEGORIAS_DESPESA = [
  'Pessoal',
  'Aluguel',
  'Materiais',
  'Medicamentos',
  'Equipamentos',
  'Marketing',
  'Impostos',
  'Serviços Terceiros',
  'Manutenção',
  'Utilidades',
  'Administrativo',
  'Outras Despesas',
];

const emptyPlanoConta: Omit<PlanoContas, 'id' | 'createdAt' | 'updatedAt'> = {
  codigo: '',
  nome: '',
  tipo: 'receita',
  categoria: '',
  descricao: '',
  contaPai: '',
  nivel: 1,
  ativo: true,
};

export default function PlanoContasPage() {
  const { data: planoContas, loading, create, update, remove } = useFirestoreCrud<PlanoContas>('plano_contas', 'codigo');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanoContas | null>(null);
  const [formData, setFormData] = useState(emptyPlanoConta);

  const filteredPlanoContas = useMemo(() => {
    return planoContas.filter((conta) => {
      const matchesSearch =
        conta.nome.toLowerCase().includes(search.toLowerCase()) ||
        conta.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'all' || conta.tipo === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [planoContas, search, tipoFilter]);

  const handleOpenForm = (item?: PlanoContas) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        codigo: item.codigo,
        nome: item.nome,
        tipo: item.tipo,
        categoria: item.categoria,
        descricao: item.descricao,
        contaPai: item.contaPai || '',
        nivel: item.nivel,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyPlanoConta);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyPlanoConta);
  };

  const handleSubmit = async () => {
    if (!formData.codigo || !formData.nome || !formData.tipo) {
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
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await remove(id);
    }
  };

  const categorias = formData.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  const contasPai = planoContas.filter(c => c.tipo === formData.tipo && c.nivel === 1);

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-8 h-8 text-violet-600" />
              Plano de Contas
            </h1>
            <p className="text-muted-foreground">
              Categorias financeiras para controle de receitas e despesas
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-violet-600 hover:bg-violet-700">
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
                  placeholder="Buscar por nome ou código..."
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
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-primary">Contas de Receita</p>
                  <p className="text-2xl font-bold text-primary">
                    {planoContas.filter(c => c.tipo === 'receita' && c.ativo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-sm text-destructive">Contas de Despesa</p>
                  <p className="text-2xl font-bold text-red-700">
                    {planoContas.filter(c => c.tipo === 'despesa' && c.ativo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : filteredPlanoContas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {planoContas.length === 0 ? (
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
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-center">Nível</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlanoContas.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                          {conta.codigo}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {conta.nivel > 1 && (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={conta.nivel > 1 ? 'text-gray-600' : 'font-medium'}>
                            {conta.nome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={conta.tipo === 'receita' 
                          ? 'bg-primary/15 text-primary' 
                          : 'bg-destructive/15 text-red-700'
                        }>
                          {conta.tipo === 'receita' ? (
                            <><TrendingUp className="w-3 h-3 mr-1" /> Receita</>
                          ) : (
                            <><TrendingDown className="w-3 h-3 mr-1" /> Despesa</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{conta.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{conta.nivel}</Badge>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  placeholder="Ex: 1.1.01"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'receita' | 'despesa') => setFormData({ 
                    ...formData, 
                    tipo: value,
                    categoria: '' // Reset categoria ao mudar tipo
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Receita
                      </div>
                    </SelectItem>
                    <SelectItem value="despesa">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-destructive" />
                        Despesa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nome da Conta *</Label>
              <Input
                placeholder="Ex: Receita de Consultas"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nível</Label>
                <Select
                  value={formData.nivel.toString()}
                  onValueChange={(value) => setFormData({ ...formData, nivel: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Principal</SelectItem>
                    <SelectItem value="2">2 - Subconta</SelectItem>
                    <SelectItem value="3">3 - Detalhe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.nivel > 1 && contasPai.length > 0 && (
              <div className="space-y-2">
                <Label>Conta Pai</Label>
                <Select
                  value={formData.contaPai}
                  onValueChange={(value) => setFormData({ ...formData, contaPai: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contasPai.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.codigo} - {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição da conta..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
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

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-violet-600 hover:bg-violet-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
