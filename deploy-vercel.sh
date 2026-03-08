#!/bin/bash
# AIOME — Vercel Deploy Script
# Run this from the aiome/ directory after installing Vercel CLI
# Usage: bash deploy-vercel.sh

echo "🚀 Deploying AIOME to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Set env vars and deploy
# Load env vars from .env file (do not hardcode secrets here)
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and fill in values."
    exit 1
fi

# Source .env
set -a; source .env; set +a

vercel --token "$VERCEL_TOKEN" \
  --yes \
  --name aiome \
  -e VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
  -e VITE_FIREBASE_AUTH_DOMAIN="$VITE_FIREBASE_AUTH_DOMAIN" \
  -e VITE_FIREBASE_PROJECT_ID="$VITE_FIREBASE_PROJECT_ID" \
  -e VITE_FIREBASE_STORAGE_BUCKET="$VITE_FIREBASE_STORAGE_BUCKET" \
  -e VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
  -e VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"

echo "✅ Done! Check the URL above."
