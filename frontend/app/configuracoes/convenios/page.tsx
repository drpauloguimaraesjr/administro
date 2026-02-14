'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
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

interface Convenio extends BaseDocument {
  nome: string;
  codigo: string;
  tipo: string;
  registroANS: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  tabelaPrecos: string;
  percentualRepasse: number;
  diasPagamento: number;
  observacoes: string;
  ativo: boolean;
}

const TIPOS_CONVENIO = [
  'Plano de Saúde',
  'Seguro Saúde',
  'Convênio Empresa',
  'Particular',
  'SUS',
  'Outros',
];

const emptyConvenio: Omit<Convenio, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  codigo: '',
  tipo: '',
  registroANS: '',
  cnpj: '',
  telefone: '',
  email: '',
  endereco: '',
  tabelaPrecos: 'CBHPM',
  percentualRepasse: 100,
  diasPagamento: 30,
  observacoes: '',
  ativo: true,
};

export default function ConveniosPage() {
  const { data: convenios, loading, create, update, remove } = useFirestoreCrud<Convenio>('convenios', 'nome');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Convenio | null>(null);
  const [formData, setFormData] = useState(emptyConvenio);

  const filteredConvenios = useMemo(() => {
    return convenios.filter((conv) => {
      const matchesSearch =
        conv.nome.toLowerCase().includes(search.toLowerCase()) ||
        conv.codigo.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'all' || conv.tipo === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [convenios, search, tipoFilter]);

  const handleOpenForm = (item?: Convenio) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        codigo: item.codigo,
        tipo: item.tipo,
        registroANS: item.registroANS,
        cnpj: item.cnpj,
        telefone: item.telefone,
        email: item.email,
        endereco: item.endereco,
        tabelaPrecos: item.tabelaPrecos,
        percentualRepasse: item.percentualRepasse,
        diasPagamento: item.diasPagamento,
        observacoes: item.observacoes,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyConvenio);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyConvenio);
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
    if (confirm('Tem certeza que deseja excluir este convênio?')) {
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
              <Building2 className="w-8 h-8 text-indigo-600" />
              Tabelas e Convênios
            </h1>
            <p className="text-muted-foreground">
              Cadastro de planos de saúde e convênios
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Convênio
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
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {TIPOS_CONVENIO.map((tipo) => (
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
            ) : filteredConvenios.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {convenios.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum convênio cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro convênio
                    </Button>
                  </>
                ) : (
                  <p>Nenhum convênio encontrado com os filtros aplicados</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Convênio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Registro ANS</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead className="text-center">Repasse</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConvenios.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{conv.nome}</p>
                          {conv.codigo && (
                            <p className="text-xs text-gray-500">Cód: {conv.codigo}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{conv.tipo}</Badge>
                      </TableCell>
                      <TableCell>{conv.registroANS || '-'}</TableCell>
                      <TableCell>{conv.tabelaPrecos || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{conv.percentualRepasse}%</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={conv.ativo ? 'default' : 'secondary'}>
                          {conv.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(conv)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(conv.id)}
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
            <DialogTitle>{editingItem ? 'Editar Convênio' : 'Novo Convênio'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Convênio *</Label>
                <Input
                  placeholder="Ex: Unimed"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código</Label>
                <Input
                  placeholder="Código interno"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {TIPOS_CONVENIO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registro ANS</Label>
                <Input
                  placeholder="Número do registro"
                  value={formData.registroANS}
                  onChange={(e) => setFormData({ ...formData, registroANS: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tabela de Preços</Label>
                <Select
                  value={formData.tabelaPrecos}
                  onValueChange={(value) => setFormData({ ...formData, tabelaPrecos: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBHPM">CBHPM</SelectItem>
                    <SelectItem value="AMB">AMB</SelectItem>
                    <SelectItem value="TUSS">TUSS</SelectItem>
                    <SelectItem value="Própria">Tabela Própria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">📞 Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(00) 0000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="contato@convenio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Endereço</Label>
                <Input
                  placeholder="Endereço completo"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">💰 Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Percentual de Repasse (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.percentualRepasse}
                    onChange={(e) => setFormData({ ...formData, percentualRepasse: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo de Pagamento (dias)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.diasPagamento}
                    onChange={(e) => setFormData({ ...formData, diasPagamento: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre o convênio..."
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
              <Label htmlFor="ativo">Convênio ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
