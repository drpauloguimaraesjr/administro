'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CalendarClock,
  Clock,
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

interface TipoAgendamento extends BaseDocument {
  nome: string;
  descricao: string;
  duracaoMinutos: number;
  corId: string;
  corFundo: string;
  corTexto: string;
  preco: number;
  exigeConfirmacao: boolean;
  permiteCancelamento: boolean;
  antecedenciaMinimaCancelamento: number;
  enviaLembrete: boolean;
  antecedenciaLembrete: number;
  ordem: number;
  ativo: boolean;
}

const CORES_PREDEFINIDAS = [
  { fundo: '#DBEAFE', texto: '#1E40AF', nome: 'Azul' },
  { fundo: '#D1FAE5', texto: '#065F46', nome: 'Verde' },
  { fundo: '#FEF3C7', texto: '#92400E', nome: 'Amarelo' },
  { fundo: '#FEE2E2', texto: '#991B1B', nome: 'Vermelho' },
  { fundo: '#EDE9FE', texto: '#5B21B6', nome: 'Roxo' },
  { fundo: '#FCE7F3', texto: '#9D174D', nome: 'Rosa' },
  { fundo: '#CFFAFE', texto: '#0E7490', nome: 'Ciano' },
  { fundo: '#FFEDD5', texto: '#C2410C', nome: 'Laranja' },
];

const emptyTipoAgendamento: Omit<TipoAgendamento, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  descricao: '',
  duracaoMinutos: 30,
  corId: '',
  corFundo: CORES_PREDEFINIDAS[0].fundo,
  corTexto: CORES_PREDEFINIDAS[0].texto,
  preco: 0,
  exigeConfirmacao: true,
  permiteCancelamento: true,
  antecedenciaMinimaCancelamento: 24,
  enviaLembrete: true,
  antecedenciaLembrete: 24,
  ordem: 0,
  ativo: true,
};

export default function AgendaTiposPage() {
  const { data: tipos, loading, create, update, remove } = useFirestoreCrud<TipoAgendamento>('agenda_tipos', 'ordem');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipoAgendamento | null>(null);
  const [formData, setFormData] = useState(emptyTipoAgendamento);

  const filteredTipos = useMemo(() => {
    return tipos.filter((tipo) =>
      tipo.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [tipos, search]);

  const handleOpenForm = (item?: TipoAgendamento) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        descricao: item.descricao,
        duracaoMinutos: item.duracaoMinutos,
        corId: item.corId,
        corFundo: item.corFundo,
        corTexto: item.corTexto,
        preco: item.preco,
        exigeConfirmacao: item.exigeConfirmacao,
        permiteCancelamento: item.permiteCancelamento,
        antecedenciaMinimaCancelamento: item.antecedenciaMinimaCancelamento,
        enviaLembrete: item.enviaLembrete,
        antecedenciaLembrete: item.antecedenciaLembrete,
        ordem: item.ordem,
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      const nextColor = CORES_PREDEFINIDAS[tipos.length % CORES_PREDEFINIDAS.length];
      setFormData({
        ...emptyTipoAgendamento,
        ordem: tipos.length + 1,
        corFundo: nextColor.fundo,
        corTexto: nextColor.texto,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyTipoAgendamento);
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
    if (confirm('Tem certeza que deseja excluir este tipo de agendamento?')) {
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CalendarClock className="w-8 h-8 text-indigo-600" />
              Tipos de Agendamento
            </h1>
            <p className="text-muted-foreground">
              Consulta, retorno, procedimento, avaliação...
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Tipo
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar tipo..."
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
            ) : filteredTipos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarClock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                {tipos.length === 0 ? (
                  <>
                    <p className="mb-2">Nenhum tipo de agendamento cadastrado</p>
                    <Button onClick={() => handleOpenForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar primeiro tipo
                    </Button>
                  </>
                ) : (
                  <p>Nenhum tipo encontrado</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Duração</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-center">Confirmação</TableHead>
                    <TableHead className="text-center">Lembrete</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTipos.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell className="text-gray-400">{tipo.ordem}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: tipo.corFundo,
                              color: tipo.corTexto,
                            }}
                          >
                            {tipo.nome}
                          </div>
                        </div>
                        {tipo.descricao && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {tipo.descricao}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{tipo.duracaoMinutos} min</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {tipo.preco > 0 ? formatCurrency(tipo.preco) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tipo.exigeConfirmacao ? 'default' : 'secondary'}>
                          {tipo.exigeConfirmacao ? 'Sim' : 'Não'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {tipo.enviaLembrete ? (
                          <Badge variant="outline">{tipo.antecedenciaLembrete}h antes</Badge>
                        ) : (
                          <Badge variant="secondary">Não</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={tipo.ativo ? 'default' : 'secondary'}>
                          {tipo.ativo ? 'Ativo' : 'Inativo'}
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
                            <DropdownMenuItem onClick={() => handleOpenForm(tipo)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(tipo.id)}
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
            <DialogTitle>{editingItem ? 'Editar Tipo' : 'Novo Tipo de Agendamento'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Consulta"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do tipo de agendamento..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração (minutos)</Label>
                <Select
                  value={formData.duracaoMinutos.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duracaoMinutos: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="40">40 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {CORES_PREDEFINIDAS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`px-3 py-1.5 rounded text-xs font-medium border-2 transition-all ${
                      formData.corFundo === preset.fundo 
                        ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400' 
                        : 'border-transparent'
                    }`}
                    style={{ 
                      backgroundColor: preset.fundo,
                      color: preset.texto,
                    }}
                    onClick={() => setFormData({ ...formData, corFundo: preset.fundo, corTexto: preset.texto })}
                  >
                    {preset.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Configurações */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Configurações</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="exigeConfirmacao"
                    checked={formData.exigeConfirmacao}
                    onChange={(e) => setFormData({ ...formData, exigeConfirmacao: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="exigeConfirmacao">Exigir confirmação do paciente</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="permiteCancelamento"
                    checked={formData.permiteCancelamento}
                    onChange={(e) => setFormData({ ...formData, permiteCancelamento: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="permiteCancelamento">Permitir cancelamento online</Label>
                </div>

                {formData.permiteCancelamento && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-sm">Antecedência mínima para cancelamento</Label>
                    <Select
                      value={formData.antecedenciaMinimaCancelamento.toString()}
                      onValueChange={(value) => setFormData({ ...formData, antecedenciaMinimaCancelamento: parseInt(value) })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 horas</SelectItem>
                        <SelectItem value="6">6 horas</SelectItem>
                        <SelectItem value="12">12 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="48">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enviaLembrete"
                    checked={formData.enviaLembrete}
                    onChange={(e) => setFormData({ ...formData, enviaLembrete: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="enviaLembrete">Enviar lembrete automático</Label>
                </div>

                {formData.enviaLembrete && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-sm">Enviar lembrete com antecedência de</Label>
                    <Select
                      value={formData.antecedenciaLembrete.toString()}
                      onValueChange={(value) => setFormData({ ...formData, antecedenciaLembrete: parseInt(value) })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="2">2 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="48">48 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
              <Label htmlFor="ativo">Tipo ativo</Label>
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
