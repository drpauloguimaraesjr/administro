'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Check, Clock, RefreshCw, Package, Calendar } from 'lucide-react';

interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  batchId?: string;
  batchNumber?: string;
  type: 'low_stock' | 'expiring_soon' | 'expired' | 'high_consumption' | 'stockout';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  details: {
    currentQuantity?: number;
    minQuantity?: number;
    expirationDate?: string;
    daysUntilExpiration?: number;
    consumptionRate?: number;
    previousConsumption?: number;
    currentConsumption?: number;
  };
  suggestedActions?: string[];
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inventory/alerts`);
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    setChecking(true);
    try {
      await fetch(`${API_URL}/api/inventory/alerts/check`, { method: 'POST' });
      await fetchAlerts();
    } catch (error) {
      console.error('Error checking alerts:', error);
    } finally {
      setChecking(false);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/inventory/alerts/${id}/acknowledge`, { method: 'POST' });
      await fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/inventory/alerts/${id}/resolve`, { method: 'POST' });
      await fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.severity === filter
  );

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'stockout':
        return <Package className="w-4 h-4" />;
      case 'expiring_soon':
      case 'expired':
        return <Calendar className="w-4 h-4" />;
      case 'high_consumption':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const counts = {
    critical: alerts.filter(a => a.severity === 'critical').length,
    warning: alerts.filter(a => a.severity === 'warning').length,
    info: alerts.filter(a => a.severity === 'info').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas de Estoque</h1>
          <p className="text-gray-600">Monitore estoque baixo, validade e consumo</p>
        </div>
        <button
          onClick={checkAlerts}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          Verificar Alertas
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-lg border-2 transition ${
            filter === 'all' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-3xl font-bold text-gray-900">{alerts.length}</div>
          <div className="text-gray-600">Total de Alertas</div>
        </button>
        
        <button
          onClick={() => setFilter('critical')}
          className={`p-4 rounded-lg border-2 transition ${
            filter === 'critical' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span className="text-3xl font-bold text-red-600">{counts.critical}</span>
          </div>
          <div className="text-gray-600">Críticos</div>
        </button>
        
        <button
          onClick={() => setFilter('warning')}
          className={`p-4 rounded-lg border-2 transition ${
            filter === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <span className="text-3xl font-bold text-yellow-600">{counts.warning}</span>
          </div>
          <div className="text-gray-600">Atenção</div>
        </button>
        
        <button
          onClick={() => setFilter('info')}
          className={`p-4 rounded-lg border-2 transition ${
            filter === 'info' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-500" />
            <span className="text-3xl font-bold text-blue-600">{counts.info}</span>
          </div>
          <div className="text-gray-600">Informativos</div>
        </button>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Tudo em ordem!</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Não há alertas ativos no momento'
              : `Não há alertas ${filter === 'critical' ? 'críticos' : filter === 'warning' ? 'de atenção' : 'informativos'}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityBg(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                        {getTypeIcon(alert.type)}
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{alert.message}</p>
                    
                    {/* Details */}
                    {alert.details && (
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                        {alert.details.currentQuantity !== undefined && (
                          <span>Atual: <strong>{alert.details.currentQuantity}</strong></span>
                        )}
                        {alert.details.minQuantity !== undefined && (
                          <span>Mínimo: <strong>{alert.details.minQuantity}</strong></span>
                        )}
                        {alert.details.daysUntilExpiration !== undefined && (
                          <span>Vence em: <strong>{alert.details.daysUntilExpiration} dias</strong></span>
                        )}
                        {alert.details.previousConsumption !== undefined && (
                          <span>Consumo anterior: <strong>{alert.details.previousConsumption}</strong></span>
                        )}
                        {alert.details.currentConsumption !== undefined && (
                          <span>Consumo atual: <strong>{alert.details.currentConsumption}</strong></span>
                        )}
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Ações sugeridas:</p>
                        <div className="flex flex-wrap gap-2">
                          {alert.suggestedActions.map((action, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatDate(alert.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Marcar como visto"
                  >
                    Visto
                  </button>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Resolver"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
