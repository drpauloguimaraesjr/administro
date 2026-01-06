'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '../../../shared/types/index';
import { format } from 'date-fns';

interface ExportOptionsProps {
  transactions: Transaction[];
}

export function ExportOptions({ transactions }: ExportOptionsProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    setExporting(true);
    const headers = ['Data', 'Tipo', 'Valor', 'Descrição', 'Categoria', 'Contexto', 'Status'];
    const rows = transactions.map(t => {
      const date = t.date instanceof Date ? t.date : new Date(t.date);
      return [
        format(date, 'dd/MM/yyyy'),
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toFixed(2),
        t.description,
        t.category,
        t.contextId === 'HOME' ? 'Casa' : 'Clínica',
        t.status === 'paid' ? 'Pago' : 'Pendente',
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    setExporting(false);
  };

  const exportToJSON = () => {
    setExporting(true);
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacoes_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    setExporting(false);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportToCSV} disabled={exporting}>
        <FileSpreadsheet className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button variant="outline" onClick={exportToJSON} disabled={exporting}>
        <FileText className="w-4 h-4 mr-2" />
        JSON
      </Button>
    </div>
  );
}

