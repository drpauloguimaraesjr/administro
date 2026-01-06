#!/bin/bash

# Adiciona pasta frontend ao Git
echo "Adicionando pasta frontend ao Git..."
git add frontend/

# Verifica o que foi adicionado
echo ""
echo "Arquivos adicionados:"
git status --short | head -20

# Faz commit
echo ""
echo "Fazendo commit..."
git commit -m "Add frontend folder to repository"

# Push
echo ""
echo "Fazendo push..."
git push origin main

echo ""
echo "✅ Frontend adicionado ao repositório!"

