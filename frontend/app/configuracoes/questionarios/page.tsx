'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileQuestion,
  Copy,
  Eye,
  Link as LinkIcon,
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

interface Questao {
  id: string;
  texto: string;
  tipo: 'texto' | 'numero' | 'sim_nao' | 'multipla_escolha' | 'escala' | 'data';
  opcoes?: string[];
  pontuacao?: { [key: string]: number };
  obrigatoria: boolean;
}

interface Questionario extends BaseDocument {
  titulo: string;
  descricao: string;
  tipo: string;
  questoes: Questao[];
  interpretacao?: string;
  pontuacaoMaxima?: number;
  ativo: boolean;
  publico: boolean;
}

const TIPOS_QUESTIONARIO = [
  'Avaliação de Saúde',
  'Satisfação do Paciente',
  'Qualidade de Vida',
  'Avaliação Nutricional',
  'Rastreamento',
  'Acompanhamento',
  'Pré-consulta',
  'Pós-consulta',
  'Pesquisa',
  'Outros',
];

const TIPOS_QUESTAO = [
  { value: 'texto', label: 'Texto livre' },
  { value: 'numero', label: 'Número' },
  { value: 'sim_nao', label: 'Sim/Não' },
  { value: 'multipla_escolha', label: 'Múltipla escolha' },
  { value: 'escala', label: 'Escala (1-10)' },
  { value: 'data', label: 'Data' },
];

const emptyForm: Omit<Questionario, 'id' | 'createdAt' | 'updatedAt'> = {
  titulo: '',
  descricao: '',
  tipo: '',
  questoes: [],
  interpretacao: '',
  pontuacaoMaxima: 0,
  ativo: true,
  publico: false,
};

const emptyQuestao: Questao = {
  id: '',
  texto: '',
  tipo: 'texto',
  opcoes: [],
  obrigatoria: false,
};

export default function QuestionariosPage() {
  const { data: questionarios, loading, create, update, remove } = useFirestoreCrud<Questionario>('questionarios_config', 'titulo');
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Questionario | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [novaQuestao, setNovaQuestao] = useState<Questao>({ ...emptyQuestao, id: crypto.randomUUID() });
  const [opcoesInput, setOpcoesInput] = useState('');

  const filteredQuestionarios = useMemo(() => {
    return questionarios.filter((q) => {
      const matchesSearch = q.titulo.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === 'all' || q.tipo === tipoFilter;
      return matchesSearch && matchesTipo;
    });
  }, [questionarios, search, tipoFilter]);

  const handleOpenForm = (item?: Questionario) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        titulo: item.titulo,
        descricao: item.descricao,
        tipo: item.tipo,
        questoes: item.questoes || [],
        interpretacao: item.interpretacao || '',
        pontuacaoMaxima: item.pontuacaoMaxima || 0,
        ativo: item.ativo,
        publico: item.publico,
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
    setNovaQuestao({ ...emptyQuestao, id: crypto.randomUUID() });
    setOpcoesInput('');
  };

  const handleAddQuestao = () => {
    if (!novaQuestao.texto) {
      toast.error('Digite o texto da questão');
      return;
    }

    const questao: Questao = {
      ...novaQuestao,
      id: crypto.randomUUID(),
      opcoes: novaQuestao.tipo === 'multipla_escolha' 
        ? opcoesInput.split(',').map(o => o.trim()).filter(o => o)
        : undefined,
    };

    setFormData({
      ...formData,
      questoes: [...formData.questoes, questao],
    });
    setNovaQuestao({ ...emptyQuestao, id: crypto.randomUUID() });
    setOpcoesInput('');
  };

  const handleRemoveQuestao = (id: string) => {
    setFormData({
      ...formData,
      questoes: formData.questoes.filter((q) => q.id !== id),
    });
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (formData.questoes.length === 0) {
      toast.error('Adicione pelo menos uma questão');
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
    if (confirm('Tem certeza que deseja excluir este questionário?')) {
      await remove(id);
    }
  };

  const handleDuplicate = async (q: Questionario) => {
    await create({
      ...q,
      titulo: `${q.titulo} (Cópia)`,
      publico: false,
    });
    toast.success('Questionário duplicado!');
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/responder/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <div className="px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileQuestion className="w-8 h-8 text-primary" />
              Questionários de Avaliação
            </h1>
            <p className="text-muted-foreground">
              Crie questionários para enviar aos pacientes
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Questionário
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar questionário..."
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
                  {TIPOS_QUESTIONARIO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
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
        ) : filteredQuestionarios.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <FileQuestion className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              {questionarios.length === 0 ? (
                <>
                  <p className="mb-2">Nenhum questionário cadastrado</p>
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro questionário
                  </Button>
                </>
              ) : (
                <p>Nenhum questionário encontrado com os filtros aplicados</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuestionarios.map((q) => (
              <Card key={q.id} className="hover: transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{q.titulo}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {q.tipo}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(q)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(q.id)}>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Copiar Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(q)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {q.descricao && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{q.descricao}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{q.questoes?.length || 0} questões</span>
                    <div className="flex gap-2">
                      {q.publico && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          Público
                        </Badge>
                      )}
                      <Badge variant={q.ativo ? 'default' : 'secondary'}>
                        {q.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
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
              {editingItem ? 'Editar Questionário' : 'Novo Questionário'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Ex: Avaliação de Qualidade de Vida"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
                    {TIPOS_QUESTIONARIO.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Instruções para o paciente..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={2}
              />
            </div>

            {/* Questões */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">❓ Questões ({formData.questoes.length})</h3>
              
              {formData.questoes.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {formData.questoes.map((questao, index) => (
                    <div key={questao.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm">{questao.texto}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {TIPOS_QUESTAO.find(t => t.value === questao.tipo)?.label}
                          </Badge>
                          {questao.obrigatoria && (
                            <Badge variant="secondary" className="text-xs">Obrigatória</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveQuestao(questao.id)}
                        className="text-destructive hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">Nenhuma questão adicionada ainda.</p>
              )}

              {/* Adicionar nova questão */}
              <div className="p-4 border rounded-lg bg-white space-y-3">
                <h4 className="font-medium text-sm">Adicionar Questão</h4>
                <Input
                  placeholder="Digite a questão..."
                  value={novaQuestao.texto}
                  onChange={(e) => setNovaQuestao({ ...novaQuestao, texto: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={novaQuestao.tipo}
                    onValueChange={(value: any) => setNovaQuestao({ ...novaQuestao, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_QUESTAO.map((tipo) => (
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
                      checked={novaQuestao.obrigatoria}
                      onChange={(e) => setNovaQuestao({ ...novaQuestao, obrigatoria: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="obrigatoria" className="text-sm">Obrigatória</Label>
                  </div>
                </div>
                {novaQuestao.tipo === 'multipla_escolha' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Opções (separadas por vírgula)</Label>
                    <Input
                      placeholder="Ex: Ruim, Regular, Bom, Ótimo"
                      value={opcoesInput}
                      onChange={(e) => setOpcoesInput(e.target.value)}
                    />
                  </div>
                )}
                <Button type="button" onClick={handleAddQuestao} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Questão
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interpretação dos Resultados</Label>
              <Textarea
                placeholder="Como interpretar os resultados..."
                value={formData.interpretacao}
                onChange={(e) => setFormData({ ...formData, interpretacao: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ativo">Questionário ativo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="publico"
                  checked={formData.publico}
                  onChange={(e) => setFormData({ ...formData, publico: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="publico">Link público (sem login)</Label>
              </div>
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
