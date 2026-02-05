'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useFirestoreCrud, BaseDocument } from '@/hooks/use-firestore-crud';

interface Unidade extends BaseDocument {
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  telefone: string;
  email: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  horarioFuncionamento: string;
  responsavel: string;
  crmResponsavel: string;
  matriz: boolean;
  ativo: boolean;
}

const emptyUnidade: Omit<Unidade, 'id' | 'createdAt' | 'updatedAt'> = {
  nome: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  telefone: '',
  email: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  horarioFuncionamento: '',
  responsavel: '',
  crmResponsavel: '',
  matriz: false,
  ativo: true,
};

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function UnidadesPage() {
  const { data: unidades, loading, create, update, remove } = useFirestoreCrud<Unidade>('unidades', 'nome');
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Unidade | null>(null);
  const [formData, setFormData] = useState(emptyUnidade);

  const filteredUnidades = useMemo(() => {
    return unidades.filter((unidade) =>
      unidade.nome.toLowerCase().includes(search.toLowerCase()) ||
      unidade.cidade.toLowerCase().includes(search.toLowerCase())
    );
  }, [unidades, search]);

  const handleOpenForm = (item?: Unidade) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData(emptyUnidade);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData(emptyUnidade);
  };

  const handleSubmit = async () => {
    if (!formData.nome) {
      return;
    }

    // Se marcar como matriz, desmarcar outras
    if (formData.matriz) {
      const outrasUnidades = unidades.filter(u => u.id !== editingItem?.id && u.matriz);
      for (const unidade of outrasUnidades) {
        await update(unidade.id, { matriz: false });
      }
    }

    if (editingItem) {
      await update(editingItem.id, formData);
    } else {
      await create(formData);
    }
    handleCloseForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
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
              <Building className="w-8 h-8 text-cyan-600" />
              Unidades / Filiais
            </h1>
            <p className="text-muted-foreground">
              Cadastro de unidades da clínica
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Unidade
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar unidade..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : filteredUnidades.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              {unidades.length === 0 ? (
                <>
                  <p className="mb-2">Nenhuma unidade cadastrada</p>
                  <Button onClick={() => handleOpenForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar primeira unidade
                  </Button>
                </>
              ) : (
                <p>Nenhuma unidade encontrada</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnidades.map((unidade) => (
              <Card key={unidade.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{unidade.nome}</h3>
                        {unidade.matriz && (
                          <Badge className="bg-yellow-100 text-yellow-800">Matriz</Badge>
                        )}
                      </div>
                      {unidade.nomeFantasia && (
                        <p className="text-sm text-gray-500">{unidade.nomeFantasia}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(unidade)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(unidade.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    {unidade.endereco && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {unidade.endereco}, {unidade.numero}
                          {unidade.complemento && ` - ${unidade.complemento}`}
                          <br />
                          {unidade.bairro} - {unidade.cidade}/{unidade.estado}
                        </span>
                      </div>
                    )}
                    {unidade.telefone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{unidade.telefone}</span>
                      </div>
                    )}
                    {unidade.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{unidade.email}</span>
                      </div>
                    )}
                    {unidade.horarioFuncionamento && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{unidade.horarioFuncionamento}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <Badge variant={unidade.ativo ? 'default' : 'secondary'}>
                      {unidade.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {unidade.cnpj && (
                      <span className="text-xs text-gray-400">CNPJ: {unidade.cnpj}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social *</Label>
                <Input
                  placeholder="Nome da empresa"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  placeholder="Nome fantasia"
                  value={formData.nomeFantasia}
                  onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Inscrição Estadual</Label>
                <Input
                  placeholder="IE"
                  value={formData.inscricaoEstadual}
                  onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Inscrição Municipal</Label>
                <Input
                  placeholder="IM"
                  value={formData.inscricaoMunicipal}
                  onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">📍 Endereço</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Logradouro</Label>
                  <Input
                    placeholder="Rua, Avenida..."
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    placeholder="000"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Sala, Andar..."
                    value={formData.complemento}
                    onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {ESTADOS.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  />
                </div>
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
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    placeholder="contato@clinica.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Horário de Funcionamento</Label>
                <Input
                  placeholder="Ex: Seg-Sex 08:00-18:00, Sáb 08:00-12:00"
                  value={formData.horarioFuncionamento}
                  onChange={(e) => setFormData({ ...formData, horarioFuncionamento: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">👨‍⚕️ Responsável Técnico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Responsável</Label>
                  <Input
                    placeholder="Dr. Nome"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRM</Label>
                  <Input
                    placeholder="CRM/UF 00000"
                    value={formData.crmResponsavel}
                    onChange={(e) => setFormData({ ...formData, crmResponsavel: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="matriz"
                  checked={formData.matriz}
                  onChange={(e) => setFormData({ ...formData, matriz: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="matriz">Esta é a matriz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="ativo">Unidade ativa</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
