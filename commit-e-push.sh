#!/bin/bash

# Script para fazer commit e push de todas as correções

cd "/Users/drpgjr.../administrador de contas"

echo "📦 Adicionando arquivos modificados..."
git add backend/src/index.ts backend/src/routes/n8n.routes.ts backend/src/services/mediaUpload.ts

echo ""
echo "📝 Status dos arquivos:"
git status --short

echo ""
echo "💾 Fazendo commit..."
git commit -m "Fix: All TypeScript errors - initializeWhatsApp, shared types path, and logger"

echo ""
echo "🚀 Enviando para o GitHub..."
git push origin main

echo ""
echo "✅ Pronto!"

