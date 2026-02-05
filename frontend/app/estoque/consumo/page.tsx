'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Package, AlertTriangle, 
  RefreshCw, ArrowUpRight, ArrowDownRight, Calendar, BarChart3 
} from 'lucide-react';

interface ProductConsumption {
  productId: string;
  productName: string;
  category: string;
  totalConsumed: number;
  averageDaily: number;
  consumptionTrend: 'increasing' | 'stable' | 'decreasing';
  trendPercentage: number;
  currentStock: number;
  estimatedDaysUntilStockout: number | null;
  status: 'ok' | 'warning' | 'critical';
}

interface ConsumptionSummary {
  period: { start: string; end: string; days: number };
  totalMovements: number;
  totalConsumed: number;
  totalValue: number;
  topConsumed: Array<{ productName: string; quantity: number; value: number }>;
  trends: {
    increasing: number;
    stable: number;
    decreasing: number;
  };
  alerts: {
    lowStockSoon: number;
    highConsumption: number;
  };
}

interface ProductDetail {
  productId: string;
  productName: string;
  period: { start: string; end: string };
  totalConsumed: number;
  averageDaily: number;
  consumptionByDay: Array<{ date: string; quantity: number }>;
  consumptionTrend: 'increasing' | 'stable' | 'decreasing';
  trendPercentage: number;
  estimatedDaysUntilStockout: number | null;
  currentStock: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConsumoPage() {
  const [summary, setSummary] = useState<ConsumptionSummary | null>(null);
  const [products, setProducts] = useState<ProductConsumption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory/consumption/summary?days=${days}`),
        fetch(`${API_URL}/api/inventory/consumption/all?days=${days}`),
      ]);
      
      const summaryData = await summaryRes.json();
      const productsData = await productsRes.json();
      
      setSummary(summaryData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching consumption data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetail = async (productId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/inventory/consumption/${productId}?days=${days}`);
      const data = await res.json();
      setSelectedProduct(data);
    } catch (error) {
      console.error('Error fetching product detail:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-600 bg-red-50';
      case 'decreasing': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical': 
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">Crítico</span>;
      case 'warning':
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700">Atenção</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">OK</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data }: { data: Array<{ date: string; quantity: number }> }) => {
    const maxQty = Math.max(...data.map(d => d.quantity), 1);
    const last14Days = data.slice(-14);
    
    return (
      <div className="flex items-end gap-1 h-24">
        {last14Days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
              style={{ height: `${(d.quantity / maxQty) * 100}%`, minHeight: d.quantity > 0 ? '4px' : '0' }}
              title={`${formatDate(d.date)}: ${d.quantity} un`}
            />
            {i % 2 === 0 && (
              <span className="text-[8px] text-gray-400 mt-1">
                {new Date(d.date).getDate()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Análise de Consumo</h1>
          <p className="text-gray-600">Tendências e previsões de uso de medicamentos</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimos 14 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={60}>Últimos 60 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Total Consumido</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{summary.totalConsumed}</div>
                <div className="text-sm text-gray-500">{summary.totalMovements} movimentações</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Tendências</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                    <span className="font-bold text-red-600">{summary.trends.increasing}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Minus className="w-4 h-4 text-gray-500" />
                    <span className="font-bold text-gray-600">{summary.trends.stable}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-green-600">{summary.trends.decreasing}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Alertas de Consumo</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{summary.alerts.highConsumption}</div>
                <div className="text-sm text-gray-500">produtos com alta demanda</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Risco de Ruptura</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{summary.alerts.lowStockSoon}</div>
                <div className="text-sm text-gray-500">podem acabar em 14 dias</div>
              </div>
            </div>
          )}

          {/* Top Consumed */}
          {summary && summary.topConsumed.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Mais Consumidos ({days} dias)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {summary.topConsumed.map((item, idx) => (
                  <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{item.quantity}</div>
                    <div className="text-sm text-gray-600 truncate" title={item.productName}>
                      {item.productName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Consumo por Produto</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Produto</th>
                    <th className="text-left p-3 text-sm font-medium text-gray-600">Categoria</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Consumido</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Média/Dia</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Tendência</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Estoque Atual</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Dias até Acabar</th>
                    <th className="text-center p-3 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr 
                      key={product.productId} 
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => fetchProductDetail(product.productId)}
                    >
                      <td className="p-3">
                        <span className="font-medium text-gray-900">{product.productName}</span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{product.category}</td>
                      <td className="p-3 text-center">
                        <span className="font-semibold">{product.totalConsumed}</span>
                      </td>
                      <td className="p-3 text-center text-gray-600">{product.averageDaily}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${getTrendColor(product.consumptionTrend)}`}>
                            {getTrendIcon(product.consumptionTrend)}
                            <span className="text-sm font-medium">
                              {product.trendPercentage > 0 ? '+' : ''}{product.trendPercentage}%
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-semibold ${product.currentStock <= 5 ? 'text-red-600' : ''}`}>
                          {product.currentStock}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {product.estimatedDaysUntilStockout !== null ? (
                          <span className={`font-semibold ${
                            product.estimatedDaysUntilStockout <= 7 ? 'text-red-600' : 
                            product.estimatedDaysUntilStockout <= 14 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {product.estimatedDaysUntilStockout} dias
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {getStatusBadge(product.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Detail Modal */}
          {selectedProduct && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-gray-900">{selectedProduct.productName}</h3>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.totalConsumed}</div>
                      <div className="text-xs text-gray-500">Total Consumido</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.averageDaily}</div>
                      <div className="text-xs text-gray-500">Média/Dia</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{selectedProduct.currentStock}</div>
                      <div className="text-xs text-gray-500">Estoque Atual</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${
                        (selectedProduct.estimatedDaysUntilStockout || 999) <= 14 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedProduct.estimatedDaysUntilStockout ?? '∞'}
                      </div>
                      <div className="text-xs text-gray-500">Dias até Acabar</div>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-gray-600">Tendência:</span>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded ${getTrendColor(selectedProduct.consumptionTrend)}`}>
                      {getTrendIcon(selectedProduct.consumptionTrend)}
                      <span className="font-medium">
                        {selectedProduct.consumptionTrend === 'increasing' ? 'Aumentando' :
                         selectedProduct.consumptionTrend === 'decreasing' ? 'Diminuindo' : 'Estável'}
                        {' '}({selectedProduct.trendPercentage > 0 ? '+' : ''}{selectedProduct.trendPercentage}%)
                      </span>
                    </span>
                  </div>

                  {/* Chart */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Consumo Diário (últimos 14 dias)</h4>
                    <SimpleBarChart data={selectedProduct.consumptionByDay} />
                  </div>

                  {/* Period */}
                  <div className="text-xs text-gray-400 mt-4 text-center">
                    Período: {formatDate(selectedProduct.period.start)} - {formatDate(selectedProduct.period.end)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
