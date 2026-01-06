#!/bin/bash

echo "🔍 Verificando package.json..."
cd "/Users/drpgjr.../administrador de contas"

# Verifica se TypeScript está em dependencies
if grep -A 30 '"dependencies"' frontend/package.json | grep -q '"typescript"'; then
    echo "✅ TypeScript está em dependencies"
else
    echo "❌ TypeScript NÃO está em dependencies"
    exit 1
fi

echo ""
echo "📦 Fazendo commit e push..."
git add frontend/package.json
git commit -m "Fix: Move TypeScript to dependencies for Vercel build"
git push origin main

echo ""
echo "✅ Commit feito! Aguarde o Vercel fazer novo deploy."
echo "📝 Commit hash:"
git log --oneline -1

