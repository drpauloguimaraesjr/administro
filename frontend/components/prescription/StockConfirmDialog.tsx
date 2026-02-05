'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Package,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Loader2,
  DollarSign,
  Box,
} from 'lucide-react';
import { StockMatchResult } from '@/hooks/useStockMatch';

interface StockConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: StockConfirmData) => void;
  onSkip: () => void;
  matchResult: StockMatchResult;
  formulaName: string;
  isLoading?: boolean;
}

export interface StockConfirmData {
  productId: string;
  quantity: number;
  batchId: string;
  generateBilling: boolean;
  unitPrice: number;
}

export function StockConfirmDialog({
  open,
  onClose,
  onConfirm,
  onSkip,
  matchResult,
  formulaName,
  isLoading = false,
}: StockConfirmDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [generateBilling, setGenerateBilling] = useState(true);

  const product = matchResult.product;
  const batch = matchResult.suggestedBatch;

  if (!product || !batch) {
    return null;
  }

  const daysUntilExpiration = batch.expirationDate
    ? Math.ceil((new Date(batch.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30;
  const isLowStock = batch.availableQuantity <= (product.minStock || 5);
  const totalPrice = quantity * product.sellPrice;

  const handleConfirm = () => {
    onConfirm({
      productId: product.id,
      quantity,
      batchId: batch.id,
      generateBilling,
      unitPrice: product.sellPrice,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Registrar no Estoque?
          </DialogTitle>
          <DialogDescription>
            Encontramos este item no seu estoque. Deseja registrar a aplicação?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Match Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-purple-900">{product.name}</p>
                {product.genericName && (
                  <p className="text-sm text-purple-700">{product.genericName}</p>
                )}
              </div>
              <Badge className="bg-purple-100 text-purple-700">
                Match encontrado
              </Badge>
            </div>
            
            {formulaName !== product.name && (
              <p className="text-xs text-purple-600 mt-2">
                Pesquisado: "{formulaName}"
              </p>
            )}
          </div>

          {/* Batch Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lote</span>
              <span className="font-medium">{batch.batchNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Box className="w-4 h-4" />
                Disponível
              </span>
              <span className={`font-medium ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                {batch.availableQuantity} {product.unit}(s)
                {isLowStock && (
                  <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                    Baixo
                  </Badge>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Validade
              </span>
              <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : ''}`}>
                {new Date(batch.expirationDate).toLocaleDateString('pt-BR')}
                {isExpiringSoon && daysUntilExpiration !== null && (
                  <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                    {daysUntilExpiration}d
                  </Badge>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Preço unitário
              </span>
              <span className="font-medium">{formatCurrency(product.sellPrice)}</span>
            </div>
          </div>

          {/* Alerts */}
          {(isExpiringSoon || isLowStock) && (
            <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                {isExpiringSoon && <p>Este lote vence em {daysUntilExpiration} dias (FIFO).</p>}
                {isLowStock && <p>Estoque baixo! Considere repor em breve.</p>}
              </div>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade a utilizar</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={batch.availableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(batch.availableQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(batch.availableQuantity, quantity + 1))}
                disabled={quantity >= batch.availableQuantity}
              >
                +
              </Button>
              <span className="text-sm text-gray-500">{product.unit}(s)</span>
            </div>
          </div>

          {/* Billing Option */}
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                id="generateBilling"
                checked={generateBilling}
                onCheckedChange={(checked) => setGenerateBilling(!!checked)}
              />
              <Label htmlFor="generateBilling" className="text-sm cursor-pointer">
                Gerar cobrança para o paciente
              </Label>
            </div>
            {generateBilling && (
              <span className="font-bold text-green-700">
                {formatCurrency(totalPrice)}
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Não registrar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || quantity > batch.availableQuantity}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Confirmar ({quantity} {product.unit})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
