# CALYX - Sistema de Indicações (Árvore Genealógica)

## Visão Geral

O Sistema de Indicações permite rastrear a rede de pacientes que foram indicados por outros pacientes, criando uma "árvore genealógica" de indicações. Isso possibilita:

- Identificar pacientes que mais indicam
- Visualizar rede de indicações
- Calcular métricas de crescimento orgânico
- Criar programas de recompensa/fidelidade
- Entender canais de aquisição

---

## Arquitetura de Dados

### Modelo Principal: Referral

```typescript
interface Patient {
  id: string;
  name: string;
  // ... outros campos
  
  // Indicação
  referredBy?: string;                 // ID do paciente que indicou (null se não foi indicado)
  referralSource?: 'indication' | 'google' | 'instagram' | 'facebook' | 'friend' | 'other';
  referralNotes?: string;              // Observações sobre como conheceu
  
  // Métricas calculadas
  referralCount?: number;              // Quantos pacientes indicou (calculado)
  referralLevel?: number;              // Nível na árvore (0 = raiz, 1 = filho direto, etc)
}

interface ReferralTree {
  patientId: string;
  patientName: string;
  level: number;                       // Nível na árvore
  referredBy: string | null;           // ID do pai
  children: ReferralTree[];            // Filhos diretos
  totalDescendants: number;            // Total de descendentes (diretos + indiretos)
  directReferrals: number;             // Indicações diretas
}

interface ReferralStats {
  totalReferrals: number;              // Total de indicações no sistema
  topReferrers: {
    patientId: string;
    patientName: string;
    referralCount: number;
  }[];
  referralsByMonth: {
    month: string;
    count: number;
  }[];
  conversionRate: number;              // % de pacientes que vieram por indicação
}
```

### Coleções Firestore

```
/patients/{patientId}
  - referredBy: string | null
  - referralSource: string
  - referralNotes: string
  - referralCount: number (calculado)

/referral_stats/global
  - totalReferrals: number
  - lastUpdated: timestamp
```

---

## Funcionalidades

### 1. Cadastro de Indicação

**Quando:** Ao cadastrar novo paciente

**Fluxo:**
1. Formulário de cadastro tem campo "Como nos conheceu?"
2. Se selecionar "Indicação de paciente":
   - Campo de busca: "Quem indicou?" (autocomplete de pacientes)
   - Campo opcional: "Observações"
3. Ao salvar:
   - Salvar `referredBy` = ID do paciente selecionado
   - Incrementar `referralCount` do paciente que indicou
   - Calcular `referralLevel` baseado no pai

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ NOVO PACIENTE                                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Nome: [________________________]                         │
│ CPF: [________________________]                          │
│ Telefone: [____________________]                         │
│                                                          │
│ Como nos conheceu? *                                     │
│ ( ) Google                                               │
│ ( ) Instagram                                            │
│ ( ) Facebook                                             │
│ (•) Indicação de paciente                               │
│ ( ) Amigo/Familiar                                       │
│ ( ) Outro                                                │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Quem indicou? *                                     ││
│ │ [Maria Silva___________________________] 🔍         ││
│ │                                                     ││
│ │ Sugestões:                                          ││
│ │ • Maria Silva Santos - (11) 98765-4321             ││
│ │ • Maria Silva Oliveira - (11) 91234-5678           ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ Observações (opcional):                                  │
│ [_____________________________________________________]  │
│ [_____________________________________________________]  │
│                                                          │
│                                    [Cancelar] [Salvar]   │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Visualização da Árvore de Indicações

**Acesso:** Página de detalhes do paciente → Aba "Indicações"

**Visualizações:**

#### A) Árvore Hierárquica (Visual)

```
┌─────────────────────────────────────────────────────────┐
│ REDE DE INDICAÇÕES - Maria Silva                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    ┌─────────────┐                      │
│                    │ Maria Silva │                      │
│                    │   5 indic.  │                      │
│                    └──────┬──────┘                      │
│                           │                              │
│          ┌────────────────┼────────────────┐            │
│          │                │                │            │
│     ┌────▼────┐      ┌────▼────┐     ┌────▼────┐      │
│     │ João    │      │ Ana     │     │ Pedro   │      │
│     │ 2 indic.│      │ 1 indic.│     │ 0 indic.│      │
│     └────┬────┘      └────┬────┘     └─────────┘      │
│          │                │                             │
│     ┌────┼────┐      ┌────▼────┐                       │
│     │    │    │      │ Carlos  │                       │
│ ┌───▼┐ ┌─▼──┐ │      │ 0 indic.│                       │
│ │Luc.│ │Jul.│ │      └─────────┘                       │
│ └────┘ └────┘ │                                         │
│                                                          │
│ Total: 8 pacientes na rede                              │
│ Níveis: 3                                                │
│                                                          │
│ [Expandir Tudo] [Colapsar] [Exportar PNG]              │
└─────────────────────────────────────────────────────────┘
```

#### B) Lista de Indicações Diretas

```
┌─────────────────────────────────────────────────────────┐
│ PACIENTES INDICADOS POR MARIA SILVA                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 1. João Santos                                      ││
│ │    Cadastrado em: 15/01/2026                        ││
│ │    Indicou: 2 pacientes                             ││
│ │    [Ver Rede] [Ver Perfil]                          ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 2. Ana Oliveira                                     ││
│ │    Cadastrado em: 20/01/2026                        ││
│ │    Indicou: 1 paciente                              ││
│ │    [Ver Rede] [Ver Perfil]                          ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 3. Pedro Costa                                      ││
│ │    Cadastrado em: 22/01/2026                        ││
│ │    Indicou: 0 pacientes                             ││
│ │    [Ver Rede] [Ver Perfil]                          ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ Total: 5 indicações diretas                             │
│ Total na rede: 8 pacientes                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Dashboard de Indicações

**Acesso:** Menu principal → "Indicações" ou Dashboard → Card "Indicações"

**Cards de Métricas:**

```
┌─────────────────────────────────────────────────────────┐
│ DASHBOARD DE INDICAÇÕES                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│ │ Total de     │ │ Indicações   │ │ Taxa de      │    │
│ │ Indicações   │ │ Este Mês     │ │ Conversão    │    │
│ │              │ │              │ │              │    │
│ │     156      │ │      12      │ │     45%      │    │
│ │  +8% vs mês  │ │  +3 vs mês   │ │  +2% vs mês  │    │
│ └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ TOP 5 INDICADORES                                        │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 🥇 Maria Silva Santos                               ││
│ │    12 indicações diretas | 25 na rede               ││
│ │    [Ver Rede]                                        ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 🥈 João Pedro Oliveira                              ││
│ │    8 indicações diretas | 15 na rede                ││
│ │    [Ver Rede]                                        ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 🥉 Ana Carolina Costa                               ││
│ │    6 indicações diretas | 10 na rede                ││
│ │    [Ver Rede]                                        ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ INDICAÇÕES POR MÊS                                       │
│                                                          │
│ [Gráfico de linha mostrando evolução]                   │
│                                                          │
│ ─────────────────────────────────────────────────────  │
│                                                          │
│ CANAIS DE AQUISIÇÃO                                      │
│                                                          │
│ [Gráfico de pizza]                                       │
│ • Indicação: 45%                                         │
│ • Google: 25%                                            │
│ • Instagram: 20%                                         │
│ • Outros: 10%                                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Programa de Recompensas (Opcional - Fase 2)

**Conceito:** Recompensar pacientes que mais indicam

**Funcionalidades:**
- Definir metas (ex: 5 indicações = desconto de 10%)
- Badges/Conquistas (ex: "Embaixador Bronze", "Embaixador Prata")
- Notificações automáticas quando atingir meta
- Cupons de desconto gerados automaticamente

**Interface:**

```
┌─────────────────────────────────────────────────────────┐
│ PROGRAMA DE INDICAÇÕES - Maria Silva                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Você já indicou 12 pacientes! 🎉                        │
│                                                          │
│ Status: 🥇 EMBAIXADORA OURO                             │
│                                                          │
│ Benefícios Ativos:                                       │
│ • 15% de desconto em todas as consultas                 │
│ • 1 consulta gratuita a cada 10 indicações              │
│ • Prioridade no agendamento                             │
│                                                          │
│ Próxima Meta: 15 indicações                             │
│ [████████████░░░░░░] 12/15                              │
│                                                          │
│ Faltam 3 indicações para: EMBAIXADORA DIAMANTE 💎       │
│                                                          │
│ Cupons Disponíveis:                                      │
│ • MARIA15 - 15% OFF (válido até 31/03/2026)            │
│                                                          │
│ [Compartilhar Link de Indicação]                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Algoritmos

### Cálculo de Árvore

```typescript
async function buildReferralTree(patientId: string): Promise<ReferralTree> {
  const patient = await getPatient(patientId);
  
  // Buscar todos os pacientes indicados por este
  const directReferrals = await db
    .collection('patients')
    .where('referredBy', '==', patientId)
    .get();
  
  // Recursivamente construir árvore dos filhos
  const children: ReferralTree[] = [];
  let totalDescendants = directReferrals.size;
  
  for (const doc of directReferrals.docs) {
    const childTree = await buildReferralTree(doc.id);
    children.push(childTree);
    totalDescendants += childTree.totalDescendants;
  }
  
  return {
    patientId: patient.id,
    patientName: patient.name,
    level: patient.referralLevel || 0,
    referredBy: patient.referredBy || null,
    children,
    totalDescendants,
    directReferrals: directReferrals.size
  };
}
```

### Atualização de Contadores

```typescript
async function updateReferralCount(patientId: string) {
  const directReferrals = await db
    .collection('patients')
    .where('referredBy', '==', patientId)
    .get();
  
  await db.collection('patients').doc(patientId).update({
    referralCount: directReferrals.size
  });
}
```

### Cálculo de Nível

```typescript
async function calculateReferralLevel(patientId: string): Promise<number> {
  const patient = await getPatient(patientId);
  
  if (!patient.referredBy) {
    return 0; // Raiz
  }
  
  const parent = await getPatient(patient.referredBy);
  const parentLevel = parent.referralLevel || await calculateReferralLevel(parent.id);
  
  return parentLevel + 1;
}
```

---

## APIs Backend

### Endpoints

```typescript
// Criar paciente com indicação
POST /api/patients
Body: {
  name: string;
  referredBy?: string;
  referralSource: string;
  referralNotes?: string;
}
Response: { success: true, data: Patient }

// Buscar árvore de indicações
GET /api/patients/:id/referral-tree
Response: { success: true, data: ReferralTree }

// Buscar indicações diretas
GET /api/patients/:id/referrals
Response: { success: true, data: Patient[] }

// Buscar estatísticas globais
GET /api/referrals/stats
Response: { success: true, data: ReferralStats }

// Top indicadores
GET /api/referrals/top-referrers?limit=10
Response: { success: true, data: TopReferrer[] }

// Atualizar contadores (admin)
POST /api/referrals/recalculate
Response: { success: true }
```

---

## Visualização da Árvore

### Biblioteca Recomendada: React Flow ou D3.js

#### Opção 1: React Flow (Mais Fácil)

```typescript
import ReactFlow, { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

function ReferralTreeVisualization({ tree }: { tree: ReferralTree }) {
  const { nodes, edges } = buildFlowData(tree);
  
  return (
    <div style={{ height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      />
    </div>
  );
}

function buildFlowData(tree: ReferralTree, x = 0, y = 0): { nodes: Node[], edges: Edge[] } {
  const nodes: Node[] = [{
    id: tree.patientId,
    data: { 
      label: `${tree.patientName}\n${tree.directReferrals} indicações` 
    },
    position: { x, y },
    type: 'default'
  }];
  
  const edges: Edge[] = [];
  
  // Posicionar filhos horizontalmente
  const childSpacing = 200;
  let childX = x - (tree.children.length - 1) * childSpacing / 2;
  
  for (const child of tree.children) {
    const childData = buildFlowData(child, childX, y + 150);
    nodes.push(...childData.nodes);
    edges.push(...childData.edges);
    
    edges.push({
      id: `${tree.patientId}-${child.patientId}`,
      source: tree.patientId,
      target: child.patientId,
      type: 'smoothstep'
    });
    
    childX += childSpacing;
  }
  
  return { nodes, edges };
}
```

#### Opção 2: D3.js (Mais Flexível)

```typescript
import * as d3 from 'd3';

function renderReferralTree(tree: ReferralTree, containerId: string) {
  const width = 800;
  const height = 600;
  
  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  const treeLayout = d3.tree().size([width - 100, height - 100]);
  
  const root = d3.hierarchy(tree, d => d.children);
  treeLayout(root);
  
  // Desenhar links
  svg.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y))
    .attr('fill', 'none')
    .attr('stroke', '#ccc');
  
  // Desenhar nós
  const nodes = svg.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.x},${d.y})`);
  
  nodes.append('circle')
    .attr('r', 30)
    .attr('fill', '#4CAF50');
  
  nodes.append('text')
    .attr('dy', -35)
    .attr('text-anchor', 'middle')
    .text(d => d.data.patientName);
  
  nodes.append('text')
    .attr('dy', 5)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => d.data.directReferrals);
}
```

---

## Notificações e Gamificação

### Notificação ao Indicador

Quando um paciente indicado faz primeira consulta:

```typescript
async function notifyReferrer(newPatientId: string) {
  const newPatient = await getPatient(newPatientId);
  
  if (!newPatient.referredBy) return;
  
  const referrer = await getPatient(newPatient.referredBy);
  
  // Enviar WhatsApp
  await whatsappService.sendMessage(
    referrer.phone,
    `🎉 Ótima notícia! ${newPatient.name} que você indicou acabou de fazer a primeira consulta. Obrigado por confiar no nosso trabalho!`
  );
  
  // Verificar se atingiu meta de recompensa
  const referralCount = await getReferralCount(referrer.id);
  
  if (referralCount === 5) {
    await whatsappService.sendMessage(
      referrer.phone,
      `🏆 Parabéns! Você atingiu 5 indicações e ganhou 10% de desconto na próxima consulta! Use o cupom: ${referrer.name.toUpperCase()}10`
    );
  }
}
```

---

## Relatórios

### Relatório de Indicações (PDF/Excel)

**Conteúdo:**
- Período: [Data Início] - [Data Fim]
- Total de indicações no período
- Top 10 indicadores
- Indicações por mês (gráfico)
- Lista completa de indicações (tabela)

**Campos da Tabela:**
| Indicador | Paciente Indicado | Data Cadastro | Status | Consultas Realizadas |
|-----------|-------------------|---------------|--------|----------------------|
| Maria Silva | João Santos | 15/01/2026 | Ativo | 3 |

---

## Integração com WhatsApp

### Link de Indicação Personalizado

Cada paciente tem link único para compartilhar:

```
https://calyx.health/indicacao/maria-silva-abc123
```

Quando alguém clica:
1. Abre página de cadastro pré-preenchida
2. Campo "Indicado por" já vem com Maria Silva
3. Ao cadastrar, automaticamente vincula

**Mensagem para compartilhar:**

```
Olá! Estou adorando o atendimento do Dr. Paulo. Se você também quer cuidar da sua saúde, use meu link para agendar:

https://calyx.health/indicacao/maria-silva-abc123

Você vai amar! 💚
```

---

## Checklist de Implementação

### Fase 1: Estrutura Básica
- [ ] Adicionar campos `referredBy`, `referralSource`, `referralNotes` ao modelo Patient
- [ ] Atualizar formulário de cadastro
- [ ] Criar função de atualização de contadores
- [ ] Criar endpoint de busca de indicações diretas

### Fase 2: Visualização
- [ ] Criar página de detalhes de indicações
- [ ] Implementar lista de indicações diretas
- [ ] Implementar visualização de árvore (React Flow ou D3)
- [ ] Criar dashboard de indicações

### Fase 3: Métricas
- [ ] Calcular estatísticas globais
- [ ] Top indicadores
- [ ] Gráficos de evolução
- [ ] Relatórios exportáveis

### Fase 4: Gamificação (Opcional)
- [ ] Definir níveis e recompensas
- [ ] Sistema de badges
- [ ] Geração de cupons
- [ ] Notificações automáticas

### Fase 5: Integração
- [ ] Link de indicação personalizado
- [ ] Página de cadastro via link
- [ ] Notificações WhatsApp
- [ ] Compartilhamento social

---

## Estimativa de Esforço

| Fase | Descrição | Dias |
|------|-----------|------|
| 1 | Estrutura Básica | 2 |
| 2 | Visualização | 3 |
| 3 | Métricas | 2 |
| 4 | Gamificação | 3 |
| 5 | Integração | 2 |
| **Total** | **Sistema Completo** | **12 dias** |

Com Antigravity: **6-7 dias**

---

## Melhorias Futuras

- [ ] Análise de valor vitalício (LTV) por canal de indicação
- [ ] Previsão de indicações futuras (ML)
- [ ] Integração com CRM externo
- [ ] App mobile para pacientes visualizarem sua rede
- [ ] Ranking público de indicadores (com permissão)
- [ ] Certificados digitais para embaixadores
- [ ] Eventos exclusivos para top indicadores
