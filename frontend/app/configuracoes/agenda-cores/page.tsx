'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Palette,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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

interface CorAgenda extends BaseDocument {
  nome: string;
  corFundo: string;
  corTexto: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
}

const CORES_PREDEFINIDAS = [
  { fundo: '#DBEAFE', texto: '#1E40AF', nome: 'Azul Claro' },
  { fundo: '#D1FAE5', texto: '#065F46', nome: 'Verde Claro' },
  { fundo: '#FEF3C7', texto: '#92400E', nome: 'Amarelo Claro' },
  { fundo: '#FEE2E2', texto: '#991B1B', nome: 'Vermelho Claro' },
  { fundo: '#EDE9FE', texto: '#5B21B6', nome: 'Roxo Claro' },
  { fundo: '#FCE7F3', texto: '#9D174D', nome: 'Rosa Claro' },
  { fundo: '#CFFAFE', texto: '#0E7490', nome: 'Ciano Claro' },
  { fundo: '#FFEDD5', texto: '#C2410C', nome: 'Laranja Claro' },
  { fundo: '#E0E7FF', texto: '#3730A3', nome: 'Índigo Claro' },
  { fundo: '#F3F4F6', texto: '#374151', nome: 'Cinza Claro' },
];

const emptyCorAgenda: Omit<CorAgenda, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  corFundo: CORES_PREDEFINIDAS[0].fundo,
  corTexto: CORES_PREDEFINIDAS[0].texto,
  descricao: '',
  ordem: 0,
  ativo: true,
};

export default function AgendaCoresPage() {
  const { data: cores, loading, create, update, remove } = useFirestoreCrud<CorAgenda>('agenda_cores', 'ordem');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CorAgenda | null>(null);
  const [formData, setFormData] = useState(emptyCorAgenda);

  const filteredCores = useMemo(() => {
    return cores.filter((cor) =>
      cor.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [cores, search]);

  const handleOpenForm = (item?: CorAgenda) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        corFundo: item.corFundo,
        corTexto: item.corTexto,
        descricao: item.descricao,
        ordem: item.ordem,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      const nextColor = CORES_PREDEFINIDAS[cores.length % CORES_PREDEFINIDAS.length];
      setFormData({
        ...emptyCorAgenda,
        ordem: cores.length + 1,
        corFundo: nextColor.fundo,
        corTexto: nextColor.texto,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyCorAgenda);
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
    if (confirm('Tem certeza que deseja excluir esta cor?')) {
      await remove(id);
    }
  };

  const selectPresetColor = (preset: typeof CORES_PREDEFINIDAS[0]) => {
    setFormData({
      ...formData,
      corFundo: preset.fundo,
      corTexto: preset.texto,
    });
  };

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Palette className="w-8 h-8 text-pink-600" />
              Cores da Agenda
            </h1>
            <p className="text-muted-foreground">
              Paleta de cores para identificar tipos de atendimento
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Cor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar cor..."
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
            ) : filteredCores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Palette className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {cores.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhuma cor cadastrada</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeira cor
                    </Button>
                  </>
                ) : (
                  <p>Nenhuma cor encontrada</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Preview</TableHead>
                    <TableHead className="text-center">Cores</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCores.map((cor) => (
                    <TableRow key={cor.id}>
                      <TableCell className="text-gray-400">{cor.ordem}</TableCell>
                      <TableCell>
                        <p className="font-medium">{cor.nome}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {cor.descricao || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className="inline-block px-4 py-2 rounded-md text-sm font-medium"
                          style={{ 
                            backgroundColor: cor.corFundo,
                            color: cor.corTexto,
                          }}
                        >
                          Exemplo
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: cor.corFundo }}
                            />
                            <span className="text-xs font-mono">{cor.corFundo}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={cor.ativo ? 'default' : 'secondary'}>
                          {cor.ativo ? 'Ativa' : 'Inativa'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(cor)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(cor.id)}
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
            <DialogTitle>{editingItem ? 'Editar Cor' : 'Nova Cor'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Consulta de Rotina"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Quando usar esta cor..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="p-4 rounded-lg border text-center font-medium"
                style={{ 
                  backgroundColor: formData.corFundo,
                  color: formData.corTexto,
                }}
              >
                {formData.nome || 'Exemplo de Agendamento'}
              </div>
            </div>

            {/* Cores Predefinidas */}
            <div className="space-y-2">
              <Label>Cores Predefinidas</Label>
              <div className="grid grid-cols-5 gap-2">
                {CORES_PREDEFINIDAS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`p-2 rounded-md border-2 transition-all text-xs font-medium ${
                      formData.corFundo === preset.fundo 
                        ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: preset.fundo,
                      color: preset.texto,
                    }}
                    onClick={() => selectPresetColor(preset)}
                    title={preset.nome}
                  >
                    Aa
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Customizadas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.corFundo}
                    onChange={(e) => setFormData({ ...formData, corFundo: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.corFundo}
                    onChange={(e) => setFormData({ ...formData, corFundo: e.target.value })}
                    placeholder="#FFFFFF"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.corTexto}
                    onChange={(e) => setFormData({ ...formData, corTexto: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.corTexto}
                    onChange={(e) => setFormData({ ...formData, corTexto: e.target.value })}
                    placeholder="#000000"
                    className="font-mono"
                  />
                </div>
              </div>
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="ativo">Cor ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
