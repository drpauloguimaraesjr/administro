#!/bin/bash

# Script para renomear a pasta "administrador de contas" para "administrador-de-contas"
# Isso resolve o problema de espaços no Vercel

echo "⚠️  ATENÇÃO: Este script vai renomear a pasta no Git"
echo "Isso pode afetar outros serviços (Railway, etc)"
echo ""
read -p "Continuar? (s/N): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "Cancelado."
    exit 0
fi

cd "/Users/drpgjr.../administrador de contas"

# Move os arquivos para uma pasta temporária sem espaço
echo "📦 Movendo arquivos..."
git mv "administrador de contas" "administrador-de-contas-temp" 2>/dev/null || {
    echo "❌ Erro: Não foi possível renomear via git mv"
    echo "Tente manualmente:"
    echo "  git mv 'administrador de contas' 'administrador-de-contas'"
    exit 1
}

# Renomeia para o nome final
git mv "administrador-de-contas-temp" "administrador-de-contas"

echo "✅ Pasta renomeada!"
echo ""
echo "📝 Próximos passos:"
echo "1. Faça commit: git commit -m 'Rename folder: remove spaces for Vercel compatibility'"
echo "2. Faça push: git push origin main"
echo "3. No Vercel, atualize Root Directory para: administrador-de-contas/frontend"
echo "4. No Railway, atualize Root Directory para: administrador-de-contas/backend"

