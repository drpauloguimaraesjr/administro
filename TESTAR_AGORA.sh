#!/bin/bash

# Script para testar localmente ANTES de fazer deploy

cd "/Users/drpgjr.../administrador de contas/backend"

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔨 Testando compilação TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ COMPILAÇÃO OK! Sem erros!"
    echo ""
    echo "🚀 Para rodar localmente, execute:"
    echo "   npm run dev"
else
    echo ""
    echo "❌ ERRO na compilação! Corrija os erros antes de fazer deploy."
    exit 1
fi

