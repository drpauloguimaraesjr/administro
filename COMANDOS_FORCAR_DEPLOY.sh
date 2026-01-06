#!/bin/bash

# Script para forçar deploy no Railway
# Execute: bash COMANDOS_FORCAR_DEPLOY.sh

cd "/Users/drpgjr.../administrador de contas"

echo "🔄 Forçando novo deploy no Railway..."
echo ""

# Commit vazio para forçar deploy
git commit --allow-empty -m "trigger: Force Railway redeploy"

echo ""
echo "📤 Enviando para GitHub..."
git push origin main

echo ""
echo "✅ Commit enviado!"
echo "🚂 O Railway deve iniciar um novo deploy agora."
echo ""
echo "👉 Acesse o Railway e verifique em Deployments"

