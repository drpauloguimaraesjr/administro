#!/bin/bash

# Script para resolver todos os problemas de uma vez

cd "/Users/drpgjr.../administrador de contas"

echo "📁 Copiando pasta shared para backend..."
cp -r shared backend/shared

echo ""
echo "✅ Verificando se foi copiado..."
if [ -d "backend/shared" ]; then
    echo "✅ Pasta shared copiada com sucesso!"
    ls -la backend/ | grep shared
else
    echo "❌ ERRO: Pasta shared não foi copiada!"
    exit 1
fi

echo ""
echo "📦 Adicionando todos os arquivos ao Git..."
git add -A

echo ""
echo "📝 Status do Git:"
git status --short | head -20

echo ""
echo "💾 Fazendo commit..."
git commit -m "Fix: Copy shared folder to backend and fix all TypeScript errors"

echo ""
echo "🚀 Enviando para o GitHub..."
git push origin main

echo ""
echo "✅ Tudo resolvido!"

