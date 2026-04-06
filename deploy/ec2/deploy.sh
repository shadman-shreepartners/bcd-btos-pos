#!/usr/bin/env bash
# Deploy or refresh bcd-btos-pos on EC2 (Ubuntu/Amazon Linux with Node 22 + nginx + pm2).
set -euo pipefail

DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/bcd-btos-pos}"

cd "$DEPLOY_ROOT"

echo "==> Pull latest (optional — skip if not using git on server)"
if git rev-parse --git-dir >/dev/null 2>&1; then
  git pull --ff-only || true
fi

echo "==> Backend: install + build"
cd "$DEPLOY_ROOT/backend"
npm ci
npm run build

echo "==> Frontend: install + build"
cd "$DEPLOY_ROOT/frontend"
npm ci
npm run build

echo "==> Restart API with PM2"
cd "$DEPLOY_ROOT"
export DEPLOY_ROOT
pm2 delete bcd-japan-integration-service 2>/dev/null || true
pm2 start "$DEPLOY_ROOT/deploy/ec2/ecosystem.config.cjs"
pm2 save

echo "==> Reload nginx (if configured)"
sudo nginx -t && sudo systemctl reload nginx || true

echo "Done. App: http://$(hostname -f 2>/dev/null || echo YOUR_HOST)/ (after DNS/security group)"
