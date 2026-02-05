import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Product, StockBatch } from '@/types/inventory';

export interface StockMatchResult {
  found: boolean;
  product: Product | null;
  hasStock: boolean;
  availableQuantity: number;
  suggestedBatch: {
    id: string;
    batchNumber: string;
    expirationDate: string;
    availableQuantity: number;
  } | null;
}

export function useStockMatch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkMatch = useCallback(async (productName: string): Promise<StockMatchResult | null> => {
    if (!productName || productName.length < 3) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get('/inventory/match', {
        params: { name: productName }
      });
      return response.data;
    } catch (err: any) {
      console.error('Error checking stock match:', err);
      setError(err.response?.data?.error || 'Erro ao verificar estoque');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerUsage = useCallback(async (
    productId: string,
    quantity: number,
    patientId: string,
    patientName: string,
    prescriptionId: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/inventory/movements/prescription', {
        productId,
        quantity,
        patientId,
        patientName,
        prescriptionId,
      });
      return response.data;
    } catch (err: any) {
      console.error('Error registering stock usage:', err);
      setError(err.response?.data?.error || 'Erro ao registrar uso no estoque');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    checkMatch,
    registerUsage,
    isLoading,
    error,
  };
}
