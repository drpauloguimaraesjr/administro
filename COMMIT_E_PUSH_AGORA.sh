#!/bin/bash

# Script para garantir commit e push do código correto

WORK_DIR="/Users/drpgjr.../administrador de contas"

echo "📂 Mudando para diretório: $WORK_DIR"
cd "$WORK_DIR" || {
    echo "❌ Erro: Não foi possível acessar o diretório"
    exit 1
}

echo ""
echo "📋 Status atual do Git:"
git status --short

echo ""
echo "📦 Adicionando arquivo n8n.routes.ts..."
git add backend/src/routes/n8n.routes.ts

echo ""
echo "🔍 Verificando conteúdo do arquivo (linhas 8-10):"
sed -n '8,10p' backend/src/routes/n8n.routes.ts

echo ""
echo "💾 Fazendo commit..."
git commit -m "fix: remove @shared alias, usa caminho relativo ../../shared/types/index" || {
    echo "⚠️  Nenhuma mudança para commitar (já está commitado?)"
}

echo ""
echo "🚀 Fazendo push para GitHub..."
git push origin main || {
    echo "❌ Erro ao fazer push. Verifique sua conexão e credenciais Git."
    exit 1
}

echo ""
echo "✅ Concluído! Verifique no GitHub em alguns segundos:"
echo "https://github.com/drpauloguimaraesjr/administro/blob/main/administrador%20de%20contas/backend/src/routes/n8n.routes.ts"



