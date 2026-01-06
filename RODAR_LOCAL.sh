#!/bin/bash

echo "🧪 TESTANDO LOCALMENTE - Backend"
echo "================================="
echo ""

# Navegar para o diretório do backend
cd "$(dirname "$0")/backend" || exit 1

echo "📦 1. Instalando dependências..."
npm install

echo ""
echo "🔨 2. Testando compilação TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO! Compilação OK!"
    echo ""
    echo "🚀 Para rodar localmente:"
    echo "   cd backend"
    echo "   npm run dev"
    echo ""
else
    echo ""
    echo "❌ ERRO na compilação!"
    echo "Corrija os erros acima antes de fazer deploy."
    exit 1
fi

