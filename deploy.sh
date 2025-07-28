#!/bin/bash

# Deploy script for GitHub Pages
echo "🚀 Starting deployment to GitHub Pages..."

# Create gh-pages branch if it doesn't exist
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Remove all files except public directory
git rm -rf . 2>/dev/null || true

# Copy public files to root
cp -r public/* .

# Add all files
git add .

# Commit changes
git commit -m "Deploy to GitHub Pages - $(date)"

# Push to gh-pages branch
git push origin gh-pages --force

# Switch back to main branch
git checkout main

echo "✅ Deployment completed!"
echo "🌐 Your site will be available at: https://pm-in-code.github.io/crypto-token-analyzer/"
echo "⏰ It may take a few minutes for changes to appear." 