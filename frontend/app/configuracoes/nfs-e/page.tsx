'use client';

import { useState } from 'react';
import {
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Building2,
  Key,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useFirestoreCrud, BaseDocument } from '@/hooks/use-firestore-crud';
import { toast } from 'sonner';

interface ConfiguracaoNFSe extends BaseDocument {
  // Dados da empresa
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoMunicipal: string;
  inscricaoEstadual: string;
  codigoMunicipio: string;
  
  // Endereço
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  
  // Configurações de Emissão
  ambiente: 'producao' | 'homologacao';
  regimeTributario: string;
  codigoServico: string;
  descricaoServico: string;
  aliquotaISS: number;
  codigoTributacaoMunicipio: string;
  itemListaServico: string;
  
  // Certificado Digital
  certificadoBase64: string;
  senhaCertificado: string;
  validadeCertificado: string;
  
  // Integração
  provedor: string;
  tokenIntegracao: string;
  urlWebservice: string;
  
  // Numeração
  serieNFSe: string;
  proximoNumero: number;
  
  ativo: boolean;
}

const emptyConfig: Omit<ConfiguracaoNFSe, 'id' | 'createdAt' | 'updatedAt'> = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoMunicipal: '',
  inscricaoEstadual: '',
  codigoMunicipio: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  ambiente: 'homologacao',
  regimeTributario: '',
  codigoServico: '',
  descricaoServico: 'Serviços médicos',
  aliquotaISS: 2,
  codigoTributacaoMunicipio: '',
  itemListaServico: '',
  certificadoBase64: '',
  senhaCertificado: '',
  validadeCertificado: '',
  provedor: '',
  tokenIntegracao: '',
  urlWebservice: '',
  serieNFSe: 'A',
  proximoNumero: 1,
  ativo: true,
};

const PROVEDORES = [
  { value: 'nfse-nacional', label: 'NFS-e Nacional (ABRASF)' },
  { value: 'ginfes', label: 'GINFES' },
  { value: 'issnet', label: 'ISS.net' },
  { value: 'betha', label: 'Betha' },
  { value: 'tecnos', label: 'Tecnos' },
  { value: 'sibrax', label: 'Sibrax' },
  { value: 'webiss', label: 'WebISS' },
  { value: 'govbr', label: 'Gov.br' },
  { value: 'outro', label: 'Outro' },
];

const REGIMES = [
  { value: '1', label: 'Simples Nacional' },
  { value: '2', label: 'Simples Nacional - Excesso' },
  { value: '3', label: 'Regime Normal' },
  { value: '4', label: 'MEI' },
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function NFSePage() {
  const { data: configs, loading, create, update } = useFirestoreCrud<ConfiguracaoNFSe>('config_nfse', 'createdAt');
  const [formData, setFormData] = useState(emptyConfig);
  const [saving, setSaving] = useState(false);

  // Carregar configuração existente
  const config = configs[0];
  
  // Se carregar configuração existente, popular o form
  if (config && formData.cnpj === '' && !loading) {
    setFormData({
      razaoSocial: config.razaoSocial || '',
      nomeFantasia: config.nomeFantasia || '',
      cnpj: config.cnpj || '',
      inscricaoMunicipal: config.inscricaoMunicipal || '',
      inscricaoEstadual: config.inscricaoEstadual || '',
      codigoMunicipio: config.codigoMunicipio || '',
      endereco: config.endereco || '',
      numero: config.numero || '',
      complemento: config.complemento || '',
      bairro: config.bairro || '',
      cidade: config.cidade || '',
      estado: config.estado || '',
      cep: config.cep || '',
      ambiente: config.ambiente || 'homologacao',
      regimeTributario: config.regimeTributario || '',
      codigoServico: config.codigoServico || '',
      descricaoServico: config.descricaoServico || 'Serviços médicos',
      aliquotaISS: config.aliquotaISS || 2,
      codigoTributacaoMunicipio: config.codigoTributacaoMunicipio || '',
      itemListaServico: config.itemListaServico || '',
      certificadoBase64: config.certificadoBase64 || '',
      senhaCertificado: config.senhaCertificado || '',
      validadeCertificado: config.validadeCertificado || '',
      provedor: config.provedor || '',
      tokenIntegracao: config.tokenIntegracao || '',
      urlWebservice: config.urlWebservice || '',
      serieNFSe: config.serieNFSe || 'A',
      proximoNumero: config.proximoNumero || 1,
      ativo: config.ativo ?? true,
    });
  }

  const handleSave = async () => {
    if (!formData.cnpj || !formData.razaoSocial) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      if (config) {
        await update(config.id, formData);
      } else {
        await create(formData);
      }
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8 text-orange-600" />
              Configuração NFS-e
            </h1>
            <p className="text-muted-foreground">
              Configurações para emissão de Nota Fiscal de Serviços Eletrônica
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={formData.ambiente === 'producao' ? 'default' : 'secondary'}
              className={formData.ambiente === 'producao' ? 'bg-green-600' : 'bg-yellow-600'}
            >
              {formData.ambiente === 'producao' ? 'Produção' : 'Homologação'}
            </Badge>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className={formData.ativo ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {formData.ativo ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {formData.ativo ? 'NFS-e Ativa' : 'NFS-e Inativa'}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.ativo 
                    ? 'A emissão de notas fiscais está habilitada' 
                    : 'Configure os dados abaixo para habilitar a emissão'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações que aparecerão na NFS-e</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social *</Label>
                <Input
                  placeholder="Nome da empresa"
                  value={formData.razaoSocial}
                  onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
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
                <Label>CNPJ *</Label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Inscrição Municipal *</Label>
                <Input
                  placeholder="IM"
                  value={formData.inscricaoMunicipal}
                  onChange={(e) => setFormData({ ...formData, inscricaoMunicipal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Código Município</Label>
                <Input
                  placeholder="Código IBGE"
                  value={formData.codigoMunicipio}
                  onChange={(e) => setFormData({ ...formData, codigoMunicipio: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Endereço</h4>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  />
                </div>
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
                    <option value="">UF</option>
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
          </CardContent>
        </Card>

        {/* Configurações Tributárias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Tributárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ambiente *</Label>
                <Select
                  value={formData.ambiente}
                  onValueChange={(value: 'producao' | 'homologacao') => setFormData({ ...formData, ambiente: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homologacao">🧪 Homologação (Testes)</SelectItem>
                    <SelectItem value="producao">🚀 Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Regime Tributário</Label>
                <Select
                  value={formData.regimeTributario}
                  onValueChange={(value) => setFormData({ ...formData, regimeTributario: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIMES.map((regime) => (
                      <SelectItem key={regime.value} value={regime.value}>
                        {regime.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Código do Serviço</Label>
                <Input
                  placeholder="Ex: 04.01"
                  value={formData.codigoServico}
                  onChange={(e) => setFormData({ ...formData, codigoServico: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Item Lista Serviço</Label>
                <Input
                  placeholder="Ex: 0401"
                  value={formData.itemListaServico}
                  onChange={(e) => setFormData({ ...formData, itemListaServico: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alíquota ISS (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.01"
                  value={formData.aliquotaISS}
                  onChange={(e) => setFormData({ ...formData, aliquotaISS: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição Padrão do Serviço</Label>
              <Textarea
                placeholder="Descrição que aparecerá na NFS-e"
                value={formData.descricaoServico}
                onChange={(e) => setFormData({ ...formData, descricaoServico: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Série NFS-e</Label>
                <Input
                  placeholder="Ex: A"
                  value={formData.serieNFSe}
                  onChange={(e) => setFormData({ ...formData, serieNFSe: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Próximo Número</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.proximoNumero}
                  onChange={(e) => setFormData({ ...formData, proximoNumero: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Integração e Certificado
            </CardTitle>
            <CardDescription>Configurações de acesso ao webservice da prefeitura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provedor NFS-e</Label>
                <Select
                  value={formData.provedor}
                  onValueChange={(value) => setFormData({ ...formData, provedor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVEDORES.map((prov) => (
                      <SelectItem key={prov.value} value={prov.value}>
                        {prov.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Token de Integração</Label>
                <Input
                  type="password"
                  placeholder="Token ou senha do webservice"
                  value={formData.tokenIntegracao}
                  onChange={(e) => setFormData({ ...formData, tokenIntegracao: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL do Webservice</Label>
              <Input
                placeholder="https://nfse.prefeitura.gov.br/webservice"
                value={formData.urlWebservice}
                onChange={(e) => setFormData({ ...formData, urlWebservice: e.target.value })}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Certificado Digital (A1)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Senha do Certificado</Label>
                  <Input
                    type="password"
                    placeholder="Senha do arquivo .pfx"
                    value={formData.senhaCertificado}
                    onChange={(e) => setFormData({ ...formData, senhaCertificado: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validade</Label>
                  <Input
                    type="date"
                    value={formData.validadeCertificado}
                    onChange={(e) => setFormData({ ...formData, validadeCertificado: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                * O upload do certificado .pfx deve ser feito separadamente por segurança.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ativar/Desativar */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emissão de NFS-e</p>
                <p className="text-sm text-gray-500">
                  Habilita a emissão de notas fiscais eletrônicas
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="rounded border-gray-300 h-5 w-5"
                />
                <Label htmlFor="ativo" className="font-medium">
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
