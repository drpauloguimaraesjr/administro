#!/usr/bin/env bash
# Deploy script for Railway (backend + frontend)
# Usage: ./deploy.sh
# Ensure you have the Railway CLI installed and are logged in.

# Backend deployment
cd backend
railway up --service backend || echo "Backend deploy failed"
cd ..

# Frontend deployment
cd frontend
railway up --service frontend || echo "Frontend deploy failed"
cd ..

echo "Deploy script finished. Check Railway dashboard for status."
