#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if git repo is initialized
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository..."
  git init
  git branch -M main
fi

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit with timestamp
timestamp=$(date "+%Y-%m-%d %H:%M:%S")
echo "💾 Committing changes..."
git commit -m "Deploy: $timestamp" || echo "No changes to commit"

# Check if remote exists
if ! git remote | grep -q "origin"; then
  echo "⚠️  No remote repository configured."
  echo "Please run: git remote add origin <your-repo-url>"
  exit 1
fi

# Push to main branch
echo "⬆️  Pushing to remote repository..."
git push origin main

echo "✅ Deployment triggered! Check Vercel dashboard for build status."
echo "🔗 Your changes will be live in a few moments."
