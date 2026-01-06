#!/bin/bash

# Script para corrigir e enviar o código para o GitHub

cd "/Users/drpgjr.../administrador de contas"

echo "📁 Verificando diretório..."
pwd

echo ""
echo "📦 Adicionando arquivos..."
git add backend/src/index.ts

echo ""
echo "📝 Status antes do commit:"
git status --short

echo ""
echo "💾 Fazendo commit..."
git commit -m "Fix: Explicit PORT parsing to fix TypeScript error on Railway"

echo ""
echo "🚀 Enviando para o GitHub..."
git push origin main

echo ""
echo "✅ Pronto! Verifique o GitHub para confirmar que o commit foi enviado."

