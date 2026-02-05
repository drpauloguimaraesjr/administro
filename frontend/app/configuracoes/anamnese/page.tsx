'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ClipboardList,
  GripVertical,
  Copy,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useFirestoreCrud, BaseDocument } from '@/hooks/use-firestore-crud';
import { toast } from 'sonner';

interface Pergunta {
  id: string;
  texto: string;
  tipo: 'texto' | 'numero' | 'sim_nao' | 'multipla_escolha' | 'escala';
  opcoes?: string[];
  obrigatoria: boolean;
}

interface FormularioAnamnese extends BaseDocument {
  nome: string;
  descricao: string;
  especialidade: string;
  perguntas: Pergunta[];
  ativo: boolean;
}

const ESPECIALIDADES = [
  'Clínica Geral',
  'Cardiologia',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Nutrição',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Urologia',
  'Outras',
];

const TIPOS_PERGUNTA = [
  { value: 'texto', label: 'Texto livre' },
  { value: 'numero', label: 'Número' },
  { value: 'sim_nao', label: 'Sim/Não' },
  { value: 'multipla_escolha', label: 'Múltipla escolha' },
  { value: 'escala', label: 'Escala (1-10)' },
];

const emptyForm: Omit<FormularioAnamnese, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  descricao: '',
  especialidade: '',
  perguntas: [],
  ativo: true,
};

const emptyPergunta: Pergunta = {
  id: '',
  texto: '',
  tipo: 'texto',
  opcoes: [],
  obrigatoria: false,
};

export default function AnamnesePage() {
  const { data: formularios, loading, create, update, remove } = useFirestoreCrud<FormularioAnamnese>('anamnese_formularios', 'nome');
  const [search, setSearch] = useState('');
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FormularioAnamnese | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [novaPergunta, setNovaPergunta] = useState<Pergunta>({ ...emptyPergunta, id: crypto.randomUUID() });
  const [opcoesInput, setOpcoesInput] = useState('');

  const filteredFormularios = useMemo(() => {
    return formularios.filter((form) => {
      const matchesSearch = form.nome.toLowerCase().includes(search.toLowerCase());
      const matchesEspecialidade = especialidadeFilter === 'all' || form.especialidade === especialidadeFilter;
      return matchesSearch && matchesEspecialidade;
    });
  }, [formularios, search, especialidadeFilter]);

  const handleOpenForm = (item?: FormularioAnamnese) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        descricao: item.descricao,
        especialidade: item.especialidade,
        perguntas: item.perguntas || [],
        ativo: item.ativo,
      });
    } else {
      setEditingItem(null);
      setFormData(emptyForm);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyForm);
    setNovaPergunta({ ...emptyPergunta, id: crypto.randomUUID() });
    setOpcoesInput('');
  };

  const handleAddPergunta = () => {
    if (!novaPergunta.texto) {
      toast.error('Digite o texto da pergunta');
      return;
    }

    const pergunta: Pergunta = {
      ...novaPergunta,
      id: crypto.randomUUID(),
      opcoes: novaPergunta.tipo === 'multipla_escolha' 
        ? opcoesInput.split(',').map(o => o.trim()).filter(o => o)
        : undefined,
    };

    setFormData({
      ...formData,
      perguntas: [...formData.perguntas, pergunta],
    });
    setNovaPergunta({ ...emptyPergunta, id: crypto.randomUUID() });
    setOpcoesInput('');
  };

  const handleRemovePergunta = (id: string) => {
    setFormData({
      ...formData,
      perguntas: formData.perguntas.filter((p) => p.id !== id),
    });
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.especialidade) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (formData.perguntas.length === 0) {
      toast.error('Adicione pelo menos uma pergunta');
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
    if (confirm('Tem certeza que deseja excluir este formulário?')) {
      await remove(id);
    }
  };

  const handleDuplicate = async (form: FormularioAnamnese) => {
    await create({
      ...form,
      nome: `${form.nome} (Cópia)`,
    });
    toast.success('Formulário duplicado!');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardList className="w-8 h-8 text-purple-600" />
              Formulários de Anamnese
            </h1>
            <p className="text-muted-foreground">
              Templates de perguntas para consultas médicas
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Formulário
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar formulário..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={especialidadeFilter} onValueChange={setEspecialidadeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas especialidades</SelectItem>
                  {ESPECIALIDADES.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : filteredFormularios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              {formularios.length === 0 ? (
                <>
                  <p className="mb-2">Nenhum formulário cadastrado</p>
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro formulário
                  </Button>
                </>
              ) : (
                <p>Nenhum formulário encontrado com os filtros aplicados</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFormularios.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{form.nome}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {form.especialidade}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(form)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(form)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(form.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {form.descricao && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{form.descricao}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{form.perguntas?.length || 0} perguntas</span>
                    <Badge variant={form.ativo ? 'default' : 'secondary'}>
                      {form.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Formulário' : 'Novo Formulário de Anamnese'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Formulário *</Label>
                <Input
                  placeholder="Ex: Anamnese Cardiológica"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidade *</Label>
                <Select
                  value={formData.especialidade}
                  onValueChange={(value) => setFormData({ ...formData, especialidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ESPECIALIDADES.map((esp) => (
                      <SelectItem key={esp} value={esp}>
                        {esp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição do formulário..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            {/* Perguntas existentes */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">📋 Perguntas ({formData.perguntas.length})</h3>
              
              {formData.perguntas.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {formData.perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm">{pergunta.texto}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {TIPOS_PERGUNTA.find(t => t.value === pergunta.tipo)?.label}
                          </Badge>
                          {pergunta.obrigatoria && (
                            <Badge variant="secondary" className="text-xs">Obrigatória</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePergunta(pergunta.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Nenhuma pergunta adicionada ainda.</p>
              )}

              {/* Adicionar nova pergunta */}
              <div className="p-4 border rounded-lg bg-white space-y-3">
                <h4 className="font-medium text-sm">Adicionar Pergunta</h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Digite a pergunta..."
                    value={novaPergunta.texto}
                    onChange={(e) => setNovaPergunta({ ...novaPergunta, texto: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={novaPergunta.tipo}
                    onValueChange={(value: any) => setNovaPergunta({ ...novaPergunta, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PERGUNTA.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="obrigatoria"
                      checked={novaPergunta.obrigatoria}
                      onChange={(e) => setNovaPergunta({ ...novaPergunta, obrigatoria: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="obrigatoria" className="text-sm">Obrigatória</Label>
                  </div>
                </div>
                {novaPergunta.tipo === 'multipla_escolha' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Opções (separadas por vírgula)</Label>
                    <Input
                      placeholder="Ex: Sim, Não, Às vezes"
                      value={opcoesInput}
                      onChange={(e) => setOpcoesInput(e.target.value)}
                    />
                  </div>
                )}
                <Button type="button" onClick={handleAddPergunta} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </Button>
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
              <Label htmlFor="ativo">Formulário ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
