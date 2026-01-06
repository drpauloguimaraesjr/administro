#!/bin/bash

# Script para testar build localmente ANTES de fazer deploy
# Isso ajuda a identificar erros antes de enviar para o Railway

cd "/Users/drpgjr.../administrador de contas/backend"

echo "🧪 TESTANDO BUILD LOCALMENTE"
echo "============================"
echo ""

echo "📦 1. Instalando dependências..."
npm install

echo ""
echo "🔨 2. Testando compilação TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO! Build local funcionou!"
    echo ""
    echo "🚀 Agora pode fazer deploy no Railway com confiança!"
else
    echo ""
    echo "❌ ERRO no build local!"
    echo "Corrija os erros acima antes de fazer deploy."
    exit 1
fi



