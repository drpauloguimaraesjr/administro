# Sistema de Controle de Estoque - CALYX

## 📦 Visão Geral

Sistema completo de gestão de estoque farmacêutico com rastreabilidade de lotes, controle de validade e alertas inteligentes.

## 🗃️ Estruturas de Dados

### Product (Produto Base)
```typescript
interface Product {
  id: string;
  name: string;                    // Nome do componente
  genericName?: string;            // Nome genérico
  type: 'medication' | 'material' | 'injectable' | 'supplement';
  category: string;                // Vitaminas, Antibióticos, etc.
  unit: 'amp' | 'comp' | 'ml' | 'un' | 'fr' | 'cx';
  defaultManufacturer?: string;
  minStock: number;                // Estoque mínimo (alerta)
  optimalStock: number;            // Estoque ideal
  costPrice: number;               // Preço de custo médio
  sellPrice: number;               // Preço de venda
  markup?: number;                 // Margem %
  aliases: string[];               // Nomes alternativos (para match)
  isActive: boolean;
  requiresPrescription: boolean;
  isControlled: boolean;           // Controlado (tarja preta/vermelha)
  createdAt: string;
  updatedAt: string;
}
```

### StockBatch (Lote de Estoque)
```typescript
interface StockBatch {
  id: string;
  productId: string;
  
  // Identificação do Lote
  batchNumber: string;             // Número do lote
  manufacturer: string;            // Fabricante
  supplier?: string;               // Fornecedor (se diferente)
  
  // Datas
  manufacturingDate: string;       // Data de fabricação
  expirationDate: string;          // Data de validade
  purchaseDate: string;            // Data de compra
  
  // Quantidades
  initialQuantity: number;         // Quantidade comprada
  currentQuantity: number;         // Quantidade atual
  reservedQuantity: number;        // Reservado (agendamentos)
  
  // Custos
  unitCost: number;                // Custo unitário deste lote
  totalCost: number;               // Custo total do lote
  
  // Status
  status: 'active' | 'low' | 'expired' | 'depleted';
  location?: string;               // Localização física (geladeira, armário, etc.)
  
  // Rastreabilidade
  invoiceNumber?: string;          // Nota fiscal
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
}
```

### StockMovement (Movimentação)
```typescript
interface StockMovement {
  id: string;
  productId: string;
  batchId: string;
  
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'loss';
  reason: 'purchase' | 'prescription' | 'procedure' | 'expired' | 'damaged' | 'manual' | 'inventory';
  
  quantity: number;                // Positivo ou negativo
  previousQuantity: number;        // Quantidade antes
  newQuantity: number;             // Quantidade depois
  
  // Referências
  referenceType?: 'prescription' | 'appointment' | 'purchase' | 'adjustment';
  referenceId?: string;
  patientId?: string;
  patientName?: string;
  
  notes?: string;
  createdBy: string;
  createdAt: string;
}
```

### StockAlert (Alertas)
```typescript
interface StockAlert {
  id: string;
  productId: string;
  batchId?: string;
  
  type: 'low_stock' | 'expiring_soon' | 'expired' | 'high_consumption';
  severity: 'info' | 'warning' | 'critical';
  
  message: string;
  details: {
    currentQuantity?: number;
    minQuantity?: number;
    expirationDate?: string;
    daysUntilExpiration?: number;
    consumptionRate?: number;      // unidades/dia
    daysUntilDepleted?: number;    // previsão de acabar
  };
  
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  
  createdAt: string;
}
```

## 📊 Métricas e Analytics

### ConsumptionAnalytics
```typescript
interface ConsumptionAnalytics {
  productId: string;
  period: 'daily' | 'weekly' | 'monthly';
  
  averageConsumption: number;      // Média de consumo
  consumptionTrend: 'increasing' | 'stable' | 'decreasing';
  peakDays: string[];              // Dias de maior consumo
  
  // Previsões
  estimatedDaysUntilStockout: number;
  recommendedReorderDate: string;
  recommendedReorderQuantity: number;
  
  lastCalculatedAt: string;
}
```

## 🔔 Sistema de Alertas

### Regras de Alerta
1. **Estoque Baixo**
   - Warning: currentQuantity <= minStock * 1.5
   - Critical: currentQuantity <= minStock

2. **Validade**
   - Info: 60 dias para vencer
   - Warning: 30 dias para vencer  
   - Critical: 15 dias para vencer ou vencido

3. **Velocidade de Consumo**
   - Se consumo aumentar >30% em 7 dias → alerta
   - Se estoque vai acabar antes da próxima entrega prevista → alerta

### Canais de Notificação
- [ ] Dashboard (sempre)
- [ ] WhatsApp (críticos)
- [ ] Email (diário/semanal)

## 🖥️ Telas Necessárias

### 1. `/estoque` - Dashboard de Estoque
- Cards de resumo (total itens, alertas, valor em estoque)
- Lista de produtos com quantidades
- Filtros por categoria, status, validade
- Busca por nome/lote

### 2. `/estoque/produtos` - Cadastro de Produtos
- CRUD de produtos base
- Configuração de estoque mínimo/ideal
- Preços e margens

### 3. `/estoque/lotes` - Gestão de Lotes
- Entrada de novos lotes
- Visualização por produto
- Ajustes de inventário

### 4. `/estoque/movimentacoes` - Histórico
- Timeline de movimentações
- Filtros por período, produto, tipo
- Exportação

### 5. `/estoque/alertas` - Central de Alertas
- Lista de alertas ativos
- Ações rápidas (comprar, ajustar, etc.)

### 6. `/estoque/relatorios` - Relatórios
- Consumo por período
- Produtos mais usados
- Valor em estoque
- Perdas (vencidos, danificados)

## 🔗 Integrações

### Com Prescrição
- Ao prescrever item do estoque → gera movimento de saída
- Match inteligente por nome/aliases
- Popup de confirmação com lote (FIFO - primeiro a vencer, primeiro a sair)

### Com Faturamento
- Movimento de saída pode gerar item de cobrança
- Preço automático baseado no sellPrice

### Com Agenda
- Reserva de estoque para procedimentos agendados
- Liberação automática se cancelado

## 📱 Alertas WhatsApp (Automação)

Mensagem diária/semanal:
```
📦 *Resumo de Estoque - CALYX*

⚠️ *Atenção Necessária:*
• Vitamina B12 - 3 amp restantes (mín: 10)
• Complexo B - vence em 15 dias (lote: ABC123)

📊 *Consumo da Semana:*
• 12 ampolas de B12 utilizadas
• 8 procedimentos realizados

💰 *Valor em Estoque:* R$ 4.250,00
```

## 🚀 Ordem de Implementação

1. **Fase 1: Base**
   - [ ] Models/Types
   - [ ] Firestore collections
   - [ ] CRUD de Produtos
   - [ ] CRUD de Lotes

2. **Fase 2: Movimentação**
   - [ ] Entrada de estoque
   - [ ] Saída manual
   - [ ] Histórico

3. **Fase 3: Alertas**
   - [ ] Cálculo de alertas (cron/scheduler)
   - [ ] Dashboard de alertas
   - [ ] Notificações

4. **Fase 4: Integrações**
   - [ ] Integração com Prescrição
   - [ ] Integração com Faturamento
   - [ ] Analytics de consumo

5. **Fase 5: Automação**
   - [ ] Alertas WhatsApp
   - [ ] Relatórios automáticos
