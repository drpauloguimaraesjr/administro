'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  Filter,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  MoreHorizontal,
  Check,
  X,
  Receipt,
  ArrowUpRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import api from '@/lib/api';
import { BillingItem, BillingSummary, PatientBillingSummary } from '@/types/billing';

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX', icon: Smartphone },
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'credit', label: 'Crédito', icon: CreditCard },
  { value: 'debit', label: 'Débito', icon: CreditCard },
  { value: 'transfer', label: 'Transferência', icon: ArrowUpRight },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Pago', color: 'bg-primary/15 text-primary' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
  invoiced: { label: 'Faturado', color: 'bg-primary/15 text-primary' },
};

const CATEGORY_LABELS: Record<string, string> = {
  medication: 'Medicamento',
  procedure: 'Procedimento',
  consultation: 'Consulta',
  exam: 'Exame',
  material: 'Material',
  other: 'Outro',
};

export default function FaturamentoPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('pix');
  const [payingItemId, setPayingItemId] = useState<string | null>(null);

  // Fetch summary
  const { data: summary, isLoading: loadingSummary } = useQuery<BillingSummary>({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      const res = await api.get('/billing/summary');
      return res.data;
    },
  });

  // Fetch patients summary
  const { data: patientsSummary = [] } = useQuery<PatientBillingSummary[]>({
    queryKey: ['billing-patients-summary'],
    queryFn: async () => {
      const res = await api.get('/billing/patients-summary');
      return res.data;
    },
  });

  // Fetch billing items
  const { data: items = [], isLoading: loadingItems } = useQuery<BillingItem[]>({
    queryKey: ['billing-items', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/billing${params}`);
      return res.data;
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: string }) => {
      const res = await api.post(`/billing/${id}/pay`, {
        paymentMethod: method,
        paymentDate: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-items'] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['billing-patients-summary'] });
      toast.success('Pagamento registrado!');
      setIsPayDialogOpen(false);
      setPayingItemId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamento');
    },
  });

  // Mark multiple as paid
  const markMultiplePaidMutation = useMutation({
    mutationFn: async ({ ids, method }: { ids: string[]; method: string }) => {
      const res = await api.post('/billing/pay-multiple', {
        ids,
        paymentMethod: method,
        paymentDate: new Date().toISOString(),
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['billing-items'] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
      queryClient.invalidateQueries({ queryKey: ['billing-patients-summary'] });
      toast.success(`${data.count} itens marcados como pagos!`);
      setSelectedItems(new Set());
      setIsPayDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao registrar pagamentos');
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/billing/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-items'] });
      queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
      toast.success('Item cancelado');
    },
  });

  const filteredItems = items.filter(item =>
    item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const openPayDialog = (itemId?: string) => {
    setPayingItemId(itemId || null);
    setIsPayDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    if (payingItemId) {
      markAsPaidMutation.mutate({ id: payingItemId, method: paymentMethod });
    } else if (selectedItems.size > 0) {
      markMultiplePaidMutation.mutate({ ids: Array.from(selectedItems), method: paymentMethod });
    }
  };

  const selectedTotal = Array.from(selectedItems)
    .map(id => items.find(i => i.id === id))
    .filter(Boolean)
    .reduce((sum, item) => sum + (item?.totalPrice || 0), 0);

  // Patients with pending items
  const patientsWithPending = patientsSummary.filter(p => p.pendingAmount > 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Faturamento</h1>
            <p className="text-muted-foreground">
              Gerencie cobranças e pagamentos
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/estoque/produtos">
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Precificação
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {loadingSummary ? '...' : formatCurrency(summary?.pendingAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.pendingCount || 0} itens aguardando
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recebido</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loadingSummary ? '...' : formatCurrency(summary?.paidAmount || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary?.paidCount || 0} pagamentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loadingSummary ? '...' : formatCurrency(summary?.totalProfit || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margem: {summary?.profitMargin?.toFixed(1) || 0}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {patientsWithPending.length}
              </div>
              <p className="text-xs text-muted-foreground">
                com pendências
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Patients with Pending */}
        {patientsWithPending.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pacientes com Pendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patientsWithPending.slice(0, 6).map((patient) => (
                  <div
                    key={patient.patientId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(patient.patientName);
                      setStatusFilter('pending');
                    }}
                  >
                    <div>
                      <p className="font-medium text-sm">{patient.patientName}</p>
                      <p className="text-xs text-gray-500">
                        {patient.pendingItems} item(s)
                      </p>
                    </div>
                    <span className="font-bold text-yellow-600">
                      {formatCurrency(patient.pendingAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Itens de Faturamento</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente ou produto..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-4 mt-4 p-3 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedItems.size} selecionado(s)
                </span>
                <span className="text-sm text-primary font-bold">
                  Total: {formatCurrency(selectedTotal)}
                </span>
                <div className="flex-1" />
                <Button
                  size="sm"
                  onClick={() => openPayDialog()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Receber Selecionados
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Limpar
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {loadingItems ? (
              <div className="text-center py-8 text-gray-500">
                Carregando...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum item encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Data</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.status === 'pending' && (
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={() => handleSelectItem(item.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{item.patientName}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-gray-500">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                          {item.discount > 0 && (
                            <p className="text-xs text-gray-500">
                              -{formatCurrency(item.discount)} desc.
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={STATUS_LABELS[item.status]?.color || ''}>
                            {STATUS_LABELS[item.status]?.label || item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.status === 'pending' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openPayDialog(item.id)}>
                                  <Check className="w-4 h-4 mr-2 text-primary" />
                                  Receber
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    if (confirm('Cancelar este item?')) {
                                      cancelMutation.mutate(item.id);
                                    }
                                  }}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {item.status === 'paid' && item.paymentMethod && (
                            <Badge variant="outline" className="text-xs">
                              {PAYMENT_METHODS.find(m => m.value === item.paymentMethod)?.label || item.paymentMethod}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {payingItemId
                  ? formatCurrency(items.find(i => i.id === payingItemId)?.totalPrice || 0)
                  : formatCurrency(selectedTotal)
                }
              </p>
              <p className="text-sm text-gray-500">
                {payingItemId ? '1 item' : `${selectedItems.size} itens`}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.value}
                      type="button"
                      variant={paymentMethod === method.value ? 'default' : 'outline'}
                      className={paymentMethod === method.value ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setPaymentMethod(method.value)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {method.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={markAsPaidMutation.isPending || markMultiplePaidMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {(markAsPaidMutation.isPending || markMultiplePaidMutation.isPending) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
