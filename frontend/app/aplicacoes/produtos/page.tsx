'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Package, Users, Syringe, ShoppingCart, ArrowLeft,
  TrendingUp, Clock, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import api from '@/lib/api';
import type { ProductSummaryItem } from '@/types/application';

export default function ProdutosAplicacoesPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['applications-products'],
    queryFn: async () => {
      const response = await api.get('/applications/products');
      return response.data as ProductSummaryItem[];
    }
  });

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/aplicacoes">
            <Button variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-cyan-400" />
              Visão por Produto
            </h1>
            <p className="text-muted-foreground/70 mt-1">Quais medicamentos estão sendo aplicados e por quantos pacientes</p>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Package className="w-6 h-6 animate-pulse text-cyan-400" />
          </div>
        ) : !products || products.length === 0 ? (
          <Card className="bg-foreground/90/50 border-border">
            <CardContent className="py-12 text-center text-muted-foreground/70">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto com aplicações registradas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.productName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-foreground/90/50 border-border backdrop-blur hover:border-cyan-500/30 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg flex items-center justify-between">
                      <span className="truncate">{product.productName}</span>
                      <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-0 ml-2 shrink-0">
                        {product.totalOrders} total
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-cyan-500/10">
                        <Syringe className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-cyan-400">{product.administered}</p>
                        <p className="text-xs text-muted-foreground/70">Aplicados</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-amber-500/10">
                        <ShoppingCart className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-amber-400">{product.waitingPurchase}</p>
                        <p className="text-xs text-muted-foreground/70">Aguardando</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-emerald-400">{product.purchased}</p>
                        <p className="text-xs text-muted-foreground/70">Comprados</p>
                      </div>
                    </div>

                    {/* Patients */}
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-muted-foreground/70" />
                        <span className="text-sm text-muted-foreground/70">
                          {product.patients.length} paciente{product.patients.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.patients.slice(0, 5).map(patient => (
                          <Badge
                            key={patient}
                            variant="outline"
                            className="text-xs border-slate-600 text-muted-foreground"
                          >
                            {patient}
                          </Badge>
                        ))}
                        {product.patients.length > 5 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-muted-foreground">
                            +{product.patients.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Last Applied */}
                    {product.lastAdministered && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/50">
                        <Clock className="w-3 h-3" />
                        Última aplicação: {formatDate(product.lastAdministered)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
