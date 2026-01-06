#!/bin/bash

# Script para resolver TUDO de uma vez

cd "/Users/drpgjr.../administrador de contas"

echo "🔍 Verificando estrutura..."
echo ""

# Copiar shared para backend se não existir
if [ ! -d "backend/shared" ]; then
    echo "📁 Copiando pasta shared para backend..."
    cp -r shared backend/shared
    echo "✅ Pasta shared copiada!"
else
    echo "✅ Pasta shared já existe em backend/"
fi

echo ""
echo "📦 Verificando arquivos importantes..."
echo ""

# Verificar se os arquivos estão corretos
if [ -f "backend/src/routes/n8n.routes.ts" ]; then
    echo "✅ n8n.routes.ts existe"
fi

if [ -f "backend/shared/types/index.ts" ]; then
    echo "✅ shared/types/index.ts existe"
else
    echo "❌ ERRO: shared/types/index.ts NÃO existe!"
    exit 1
fi

echo ""
echo "📝 Adicionando tudo ao Git..."
git add -A

echo ""
echo "💾 Fazendo commit..."
git commit -m "Fix: Copy shared folder to backend for Railway build - Final fix"

echo ""
echo "🚀 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ TUDO PRONTO! O Railway vai detectar e fazer deploy automaticamente."
echo ""
echo "⏳ Aguarde alguns minutos e verifique os logs do Railway."

