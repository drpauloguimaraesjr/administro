#!/bin/bash

echo "🔍 Verificando package.json..."
cd "/Users/drpgjr.../administrador de contas"

# Verifica se tailwindcss está em dependencies
if grep -q '"tailwindcss"' frontend/package.json && grep -A 20 '"dependencies"' frontend/package.json | grep -q '"tailwindcss"'; then
    echo "✅ tailwindcss já está em dependencies"
else
    echo "❌ tailwindcss NÃO está em dependencies - corrigindo..."
fi

echo ""
echo "📦 Fazendo commit e push..."
git add frontend/package.json
git commit -m "Fix: Move tailwindcss to dependencies for Vercel build"
git push origin main

echo ""
echo "✅ Commit feito! Aguarde o Vercel fazer novo deploy."

