#!/bin/bash

# Script para fazer commit e push do código correto

cd "/Users/drpgjr.../administrador de contas"

echo "📦 Adicionando arquivo..."
git add backend/src/routes/n8n.routes.ts

echo "💾 Fazendo commit..."
git commit -m "fix: remove @shared alias, usa caminho relativo ../../shared/types/index"

echo "🚀 Fazendo push..."
git push origin main

echo "✅ Concluído!"



