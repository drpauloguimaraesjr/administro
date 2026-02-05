'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Apple,
  Utensils,
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

interface Alimento extends BaseDocument {
  nome: string;
  categoria: string;
  porcao: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  sodio: number;
  observacoes: string;
  ativo: boolean;
}

const CATEGORIAS = [
  'Frutas',
  'Verduras',
  'Legumes',
  'Carnes',
  'Peixes',
  'Laticínios',
  'Cereais',
  'Leguminosas',
  'Oleaginosas',
  'Bebidas',
  'Doces',
  'Industrializados',
  'Suplementos',
  'Outros',
];

const emptyAlimento: Omit<Alimento, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  categoria: '',
  porcao: '100g',
  calorias: 0,
  proteinas: 0,
  carboidratos: 0,
  gorduras: 0,
  fibras: 0,
  sodio: 0,
  observacoes: '',
  ativo: true,
};

export default function AlimentosPage() {
  const { data: alimentos, loading, create, update, remove } = useFirestoreCrud<Alimento>('alimentos', 'nome');
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Alimento | null>(null);
  const [formData, setFormData] = useState(emptyAlimento);

  const filteredAlimentos = useMemo(() => {
    return alimentos.filter((alimento) => {
      const matchesSearch = alimento.nome.toLowerCase().includes(search.toLowerCase());
      const matchesCategoria = categoriaFilter === 'all' || alimento.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [alimentos, search, categoriaFilter]);

  const handleOpenForm = (item?: Alimento) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        categoria: item.categoria,
        porcao: item.porcao,
        calorias: item.calorias,
        proteinas: item.proteinas,
        carboidratos: item.carboidratos,
        gorduras: item.gorduras,
        fibras: item.fibras,
        sodio: item.sodio,
        observacoes: item.observacoes,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyAlimento);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyAlimento);
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
    if (confirm('Tem certeza que deseja excluir este alimento?')) {
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
              <Apple className="w-8 h-8 text-green-600" />
              Cadastro de Alimentos
            </h1>
            <p className="text-muted-foreground">
              Tabela nutricional para prescrição de dietas
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Alimento
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar alimento..."
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
            ) : filteredAlimentos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {alimentos.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum alimento cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro alimento
                    </Button>
                  </>
                ) : (
                  <p>Nenhum alimento encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alimento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Porção</TableHead>
                    <TableHead className="text-right">Calorias</TableHead>
                    <TableHead className="text-right">Proteínas</TableHead>
                    <TableHead className="text-right">Carbos</TableHead>
                    <TableHead className="text-right">Gorduras</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlimentos.map((alimento) => (
                    <TableRow key={alimento.id}>
                      <TableCell>
                        <p className="font-medium">{alimento.nome}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{alimento.categoria}</Badge>
                      </TableCell>
                      <TableCell>{alimento.porcao}</TableCell>
                      <TableCell className="text-right font-medium">
                        {alimento.calorias} kcal
                      </TableCell>
                      <TableCell className="text-right">{alimento.proteinas}g</TableCell>
                      <TableCell className="text-right">{alimento.carboidratos}g</TableCell>
                      <TableCell className="text-right">{alimento.gorduras}g</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(alimento)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(alimento.id)}
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
            <DialogTitle>{editingItem ? 'Editar Alimento' : 'Novo Alimento'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Alimento *</Label>
                <Input
                  placeholder="Ex: Arroz integral"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
              <Label>Porção de Referência</Label>
              <Input
                placeholder="Ex: 100g, 1 unidade, 1 xícara"
                value={formData.porcao}
                onChange={(e) => setFormData({ ...formData, porcao: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">🍎 Informação Nutricional (por porção)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Calorias (kcal)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.calorias}
                    onChange={(e) => setFormData({ ...formData, calorias: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proteínas (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.proteinas}
                    onChange={(e) => setFormData({ ...formData, proteinas: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carboidratos (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carboidratos}
                    onChange={(e) => setFormData({ ...formData, carboidratos: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gorduras (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.gorduras}
                    onChange={(e) => setFormData({ ...formData, gorduras: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fibras (g)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fibras}
                    onChange={(e) => setFormData({ ...formData, fibras: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sódio (mg)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.sodio}
                    onChange={(e) => setFormData({ ...formData, sodio: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações nutricionais, contraindicações..."
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
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
              <Label htmlFor="ativo">Alimento ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
