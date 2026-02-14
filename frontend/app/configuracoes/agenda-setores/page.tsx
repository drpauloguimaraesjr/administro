'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  LayoutGrid,
  MapPin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface SetorAgenda extends BaseDocument {
  nome: string;
  descricao: string;
  cor: string;
  capacidade: number;
  localizacao: string;
  equipamentos: string;
  ordem: number;
  ativo: boolean;
}

const CORES_PREDEFINIDAS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

const emptySetor: Omit<SetorAgenda, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  descricao: '',
  cor: CORES_PREDEFINIDAS[0],
  capacidade: 1,
  localizacao: '',
  equipamentos: '',
  ordem: 0,
  ativo: true,
};

export default function AgendaSetoresPage() {
  const { data: setores, loading, create, update, remove } = useFirestoreCrud<SetorAgenda>('agenda_setores', 'ordem');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SetorAgenda | null>(null);
  const [formData, setFormData] = useState(emptySetor);

  const filteredSetores = useMemo(() => {
    return setores.filter((setor) =>
      setor.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [setores, search]);

  const handleOpenForm = (item?: SetorAgenda) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        descricao: item.descricao,
        cor: item.cor,
        capacidade: item.capacidade,
        localizacao: item.localizacao,
        equipamentos: item.equipamentos,
        ordem: item.ordem,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData({
        ...emptySetor,
        ordem: setores.length + 1,
        cor: CORES_PREDEFINIDAS[setores.length % CORES_PREDEFINIDAS.length],
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptySetor);
  };

  const handleSubmit = async () => {
    if (!formData.nome) {
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
    if (confirm('Tem certeza que deseja excluir este setor?')) {
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
              <LayoutGrid className="w-8 h-8 text-primary" />
              Setores da Agenda
            </h1>
            <p className="text-muted-foreground">
              Consultórios, salas e locais de atendimento
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Setor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar setor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : filteredSetores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <LayoutGrid className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {setores.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum setor cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro setor
                    </Button>
                  </>
                ) : (
                  <p>Nenhum setor encontrado</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-center">Capacidade</TableHead>
                    <TableHead className="text-center">Cor</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSetores.map((setor) => (
                    <TableRow key={setor.id}>
                      <TableCell className="text-gray-400">{setor.ordem}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: setor.cor }}
                          />
                          <div>
                            <p className="font-medium">{setor.nome}</p>
                            {setor.descricao && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {setor.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {setor.localizacao ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            {setor.localizacao}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{setor.capacidade} pessoa(s)</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className="w-8 h-8 rounded-md mx-auto border"
                          style={{ backgroundColor: setor.cor }}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={setor.ativo ? 'default' : 'secondary'}>
                          {setor.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(setor)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(setor.id)}
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
            <DialogTitle>{editingItem ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Setor *</Label>
              <Input
                placeholder="Ex: Consultório 1"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do setor..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input
                  placeholder="Ex: 2º Andar, Sala 201"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Equipamentos Disponíveis</Label>
              <Textarea
                placeholder="Ex: Maca, Ar condicionado, Monitor..."
                value={formData.equipamentos}
                onChange={(e) => setFormData({ ...formData, equipamentos: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor na Agenda</Label>
              <div className="flex flex-wrap gap-2">
                {CORES_PREDEFINIDAS.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      formData.cor === cor ? 'border-gray-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: cor }}
                    onClick={() => setFormData({ ...formData, cor })}
                  />
                ))}
                <Input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  className="w-8 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ativo">Setor ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
