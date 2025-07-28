#!/bin/bash
echo "🚀 Starting deployment to GitHub Pages..."
mkdir -p temp_deploy
cp -r public/* temp_deploy/
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages
git rm -rf . 2>/dev/null || true
cp -r temp_deploy/* .
git add .
git commit -m "Deploy to GitHub Pages - $(date)"
git push origin gh-pages --force
git checkout main
rm -rf temp_deploy
echo "✅ Deployment completed!"
echo "🌐 Your site will be available at: https://pm-in-code.github.io/crypto-token-analyzer/"
