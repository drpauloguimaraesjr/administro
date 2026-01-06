#!/bin/bash
# Script para forçar commit e push do código correto

cd "/Users/drpgjr.../administrador de contas" || exit 1

echo "📦 Adicionando arquivos..."
git add -A

echo "💾 Fazendo commit..."
git commit -m "fix: FORÇA atualização - remove @shared, usa ../../shared/types/index" || echo "Nenhuma mudança para commitar"

echo "🚀 Fazendo push..."
git push origin main

echo "✅ Concluído!"



