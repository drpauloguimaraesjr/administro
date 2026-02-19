'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Stethoscope,
  DollarSign,
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

interface Procedimento extends BaseDocument {
  nome: string;
  codigoTUSS: string;
  codigoInterno: string;
  categoria: string;
  descricao: string;
  precoParticular: number;
  precoConvenio: number;
  duracaoMinutos: number;
  ativo: boolean;
}

const CATEGORIAS = [
  'Consultas',
  'Exames',
  'Procedimentos Estéticos',
  'Procedimentos Cirúrgicos',
  'Terapias',
  'Avaliações',
  'Retornos',
  'Urgência',
  'Outros',
];

const emptyProcedimento: Omit<Procedimento, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  codigoTUSS: '',
  codigoInterno: '',
  categoria: '',
  descricao: '',
  precoParticular: 0,
  precoConvenio: 0,
  duracaoMinutos: 30,
  ativo: true,
};

export default function ProcedimentosPage() {
  const { data: procedimentos, loading, create, update, remove } = useFirestoreCrud<Procedimento>('procedimentos', 'nome');
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Procedimento | null>(null);
  const [formData, setFormData] = useState(emptyProcedimento);

  const filteredProcedimentos = useMemo(() => {
    return procedimentos.filter((proc) => {
      const matchesSearch =
        proc.nome.toLowerCase().includes(search.toLowerCase()) ||
        proc.codigoTUSS.toLowerCase().includes(search.toLowerCase()) ||
        proc.codigoInterno.toLowerCase().includes(search.toLowerCase());
      const matchesCategoria = categoriaFilter === 'all' || proc.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [procedimentos, search, categoriaFilter]);

  const handleOpenForm = (item?: Procedimento) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        codigoTUSS: item.codigoTUSS,
        codigoInterno: item.codigoInterno,
        categoria: item.categoria,
        descricao: item.descricao,
        precoParticular: item.precoParticular,
        precoConvenio: item.precoConvenio,
        duracaoMinutos: item.duracaoMinutos,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyProcedimento);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyProcedimento);
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.categoria) {
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
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      await remove(id);
    }
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
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Stethoscope className="w-8 h-8 text-rose-600" />
              Procedimentos Médicos
            </h1>
            <p className="text-muted-foreground">
              Cadastro de procedimentos com preços e códigos TUSS
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-rose-600 hover:bg-rose-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Procedimento
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
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
            ) : filteredProcedimentos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {procedimentos.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum procedimento cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro procedimento
                    </Button>
                  </>
                ) : (
                  <p>Nenhum procedimento encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Código TUSS</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Particular</TableHead>
                    <TableHead className="text-right">Convênio</TableHead>
                    <TableHead className="text-center">Duração</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcedimentos.map((proc) => (
                    <TableRow key={proc.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{proc.nome}</p>
                          {proc.codigoInterno && (
                            <p className="text-xs text-gray-500">Cód: {proc.codigoInterno}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {proc.codigoTUSS || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{proc.categoria}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {formatCurrency(proc.precoParticular)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(proc.precoConvenio)}
                      </TableCell>
                      <TableCell className="text-center">
                        {proc.duracaoMinutos} min
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={proc.ativo ? 'default' : 'secondary'}>
                          {proc.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(proc)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(proc.id)}
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
            <DialogTitle>{editingItem ? 'Editar Procedimento' : 'Novo Procedimento'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Procedimento *</Label>
              <Input
                placeholder="Ex: Consulta Médica"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Código TUSS</Label>
                <Input
                  placeholder="Ex: 10101012"
                  value={formData.codigoTUSS}
                  onChange={(e) => setFormData({ ...formData, codigoTUSS: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código Interno</Label>
                <Input
                  placeholder="Código da clínica"
                  value={formData.codigoInterno}
                  onChange={(e) => setFormData({ ...formData, codigoInterno: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do procedimento..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Precificação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço Particular (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precoParticular}
                    onChange={(e) => setFormData({ ...formData, precoParticular: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Convênio (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precoConvenio}
                    onChange={(e) => setFormData({ ...formData, precoConvenio: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Input
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duracaoMinutos}
                    onChange={(e) => setFormData({ ...formData, duracaoMinutos: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ativo">Procedimento ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-rose-600 hover:bg-rose-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
