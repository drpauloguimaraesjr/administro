# 🚀 PROMPT DE ONBOARDING — ADMINISTRO (Cola no Antigravity)

---

**Cole o texto abaixo como primeira mensagem no Antigravity da nova máquina:**

---

## PROMPT INÍCIO:

```
Preciso que você se familiarize com este projeto antes de começarmos a trabalhar. Leia com atenção:

## PROJETO: ADMINISTRO (Calyx)
Sistema de gestão para clínica médica do Dr. Paulo Guimarães Jr.
Repo: https://github.com/drpauloguimaraesjr/administro

## ARQUITETURA
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
  - Diretório: `frontend/`
  - Porta dev: 3000
  - Deploy: Vercel (auto-deploy do branch `main`)
  
- **Backend**: Node.js + Express + TypeScript
  - Diretório: `backend/`
  - Porta dev: 4000
  - Deploy: Railway

- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage

## DESIGN SYSTEM ATIVO: "Minimalist Emerald"
- Tema CLARO (light mode only). ZERO classes `dark:` no código.
- Paleta: Emerald green (primary=#059669), grays profissionais, fundo branco
- Tipografia: Inter (sans), Fragment Mono (mono)
- Border-radius: 0.5rem (discreto)
- Shadows: sutis (shadow-sm, shadow-md)
- Estilo: minimalista, profissional, discreto
- Componentes: shadcn/ui customizados
- Arquivos de referência:
  - `frontend/tailwind.config.ts` (cores, fontes)
  - `frontend/app/globals.css` (variáveis CSS, utilitários .btn-primary, .card-minimal)

## PÁGINAS PRINCIPAIS
| Rota | Página | Status |
|------|--------|--------|
| `/` | Dashboard (Home) | ✅ Com mock data |
| `/agenda` | Agenda/Calendário | ✅ |
| `/patients` | Lista de Pacientes | ✅ Limpo |
| `/crm` | CRM + Kanban Pipeline | ✅ Com mock data |
| `/indicacoes` | Dashboard de Indicações | ✅ Com mock data |
| `/transactions` | Financeiro | ✅ |
| `/whatsapp` | Conexão WhatsApp | ✅ |
| `/questionarios` | Questionários | ✅ |
| `/intercurrences` | Alertas/Intercorrências | ✅ |
| `/estoque` | Estoque (em desenvolvimento) | 🔧 |
| `/faturamento` | Faturamento | 🔧 |
| `/atendimento` | Atendimento IA | 🔧 |
| `/configuracoes` | Configurações | 🔧 |
| `/knowledge` | Base de Conhecimento (Cérebro) | 🔧 |

## MOCK DATA
Várias páginas usam dados mock para apresentação (quando API retorna vazio):
- `app/page.tsx` — appointments, stats
- `app/crm/page.tsx` — stats, birthdays, inactive patients
- `app/indicacoes/page.tsx` — patients, referrals
- `hooks/use-leads.ts` — leads do Kanban (tipos corretos: lowercase source values)

## TIPOS CRM (IMPORTANTE)
O tipo `LeadSource` usa valores MINÚSCULOS:
'whatsapp' | 'instagram' | 'facebook' | 'google' | 'indication' | 'website' | 'phone' | 'other'

O tipo `LeadStage`:
'lead_frio' | 'marcacao_consulta' | 'confirmacao_consulta' | 'confirmacao_procedimento' | 'duvidas_intercorrencias' | 'dr_paulo'

## ENV FILES
Os arquivos `.env` NÃO estão no Git. Você encontra as instruções no arquivo `SETUP_NOVA_MAQUINA.md` na raiz do projeto (se foi copiado junto). Se não:
- Frontend: `frontend/.env.local` (Firebase client keys + NEXT_PUBLIC_BACKEND_URL)
- Backend: `backend/.env` (Firebase Admin + OpenAI + MedX + Notion)

## INTEGRAÇÕES
- Firebase Firestore (database principal)
- MedX API (importação de pacientes) — `MEDX_API_URL` + `MEDX_INTEGRATION_TOKEN`
- OpenAI API (IA para atendimento, análises)
- Notion API (knowledge base)
- WhatsApp (Baileys — sessão local, ainda em desenvolvimento)

## DEPLOY
- **Vercel** (Frontend): Root Directory = `frontend/`. Auto-deploy no push para `main`.
- **Railway** (Backend): Auto-deploy no push para `main`.
- O `.gitignore` já está configurado corretamente.

## REGRAS CRÍTICAS
1. **NUNCA** adicionar classes `dark:` — o sistema é light-only
2. **NUNCA** commitar `.env` ou chaves — o GitHub Push Protection bloqueia
3. Sempre rodar `npx tsc --noEmit` antes de dar push (evita build errors na Vercel)
4. A pasta `frontend/components/superior-template/` está no .gitignore (referência de design, não parte do build)
5. Mock data tem que respeitar os tipos TypeScript exatamente (ex: LeadSource lowercase)

## ESTADO ATUAL
- Último commit: remoção completa de dark mode de 29 arquivos
- Build Vercel: deve estar passando (TypeScript check local = 0 erros)
- Todas as páginas principais estão funcionais com design Emerald minimalista
- Páginas em desenvolvimento: Estoque, Faturamento, Atendimento IA, Configurações, Knowledge

## PRÓXIMOS PASSOS SUGERIDOS
1. Verificar se o deploy Vercel está online e funcionando
2. Continuar desenvolvimento das páginas marcadas com 🔧
3. Conectar o backend Railway com dados reais (MedX sync)
4. Implementar funcionalidades de Estoque e Faturamento
5. Melhorar responsividade mobile

Confirme que entendeu o contexto e me diga quais páginas/features estão disponíveis para trabalharmos.
```

## PROMPT FIM

---

### COMO USAR:
1. Abra o Antigravity no novo computador
2. Copie TODO o texto entre "PROMPT INÍCIO" e "PROMPT FIM"
3. Cole como primeira mensagem
4. O AI vai ler e confirmar que entendeu tudo
5. A partir daí, trabalhe normalmente

### DICA:
Se o AI perder contexto durante a sessão, basta dizer:
> "Releia o PROMPT_ONBOARDING.md na raiz do projeto para relembrar o contexto."
