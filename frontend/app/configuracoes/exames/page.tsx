'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  FlaskConical,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Exame extends BaseDocument {
  nome: string;
  codigo: string;
  categoria: string;
  descricao: string;
  preparacao: string;
  valorReferencia: string;
  unidade: string;
  ativo: boolean;
}

const CATEGORIAS = [
  'Hematologia',
  'Bioquímica',
  'Hormônios',
  'Imunologia',
  'Microbiologia',
  'Urinálise',
  'Parasitologia',
  'Imagem',
  'Cardiologia',
  'Outros',
];

const emptyExame: Omit<Exame, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  codigo: '',
  categoria: '',
  descricao: '',
  preparacao: '',
  valorReferencia: '',
  unidade: '',
  ativo: true,
};

export default function ExamesPage() {
  const { data: exames, loading, create, update, remove } = useFirestoreCrud<Exame>('exames', 'nome');
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Exame | null>(null);
  const [formData, setFormData] = useState(emptyExame);

  const filteredExames = useMemo(() => {
    return exames.filter((exame) => {
      const matchesSearch =
        exame.nome.toLowerCase().includes(search.toLowerCase()) ||
        exame.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesCategoria = categoriaFilter === 'all' || exame.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [exames, search, categoriaFilter]);

  const handleOpenForm = (item?: Exame) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        codigo: item.codigo,
        categoria: item.categoria,
        descricao: item.descricao,
        preparacao: item.preparacao,
        valorReferencia: item.valorReferencia,
        unidade: item.unidade,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyExame);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyExame);
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
    if (confirm('Tem certeza que deseja excluir este exame?')) {
      await remove(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FlaskConical className="w-8 h-8 text-teal-600" />
              Planilha de Exames
            </h1>
            <p className="text-muted-foreground">
              Cadastro de tipos de exames médicos e laboratoriais
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Exame
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
                  <SelectItem value="all">Todas as categorias</SelectItem>
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
            ) : filteredExames.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {exames.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum exame cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro exame
                    </Button>
                  </>
                ) : (
                  <p>Nenhum exame encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Valor Referência</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExames.map((exame) => (
                    <TableRow key={exame.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exame.nome}</p>
                          {exame.descricao && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              {exame.descricao}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {exame.codigo || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{exame.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {exame.valorReferencia || '-'}
                          {exame.unidade && ` ${exame.unidade}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={exame.ativo ? 'default' : 'secondary'}>
                          {exame.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(exame)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(exame.id)}
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
            <DialogTitle>{editingItem ? 'Editar Exame' : 'Novo Exame'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Exame *</Label>
                <Input
                  placeholder="Ex: Hemograma Completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input
                  placeholder="Ex: HMG001"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  placeholder="Ex: mg/dL, UI/L"
                  value={formData.unidade}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valor de Referência</Label>
              <Input
                placeholder="Ex: 4.5 - 5.5 milhões/mm³"
                value={formData.valorReferencia}
                onChange={(e) => setFormData({ ...formData, valorReferencia: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do exame..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Preparação do Paciente</Label>
              <Textarea
                placeholder="Ex: Jejum de 12 horas, não consumir álcool..."
                value={formData.preparacao}
                onChange={(e) => setFormData({ ...formData, preparacao: e.target.value })}
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
              <Label htmlFor="ativo">Exame ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
