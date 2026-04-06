#!/usr/bin/env bash
# One-time EC2 setup for bcd-btos-pos.
# Run as: ssh ubuntu@<host> 'bash -s' < deploy/ec2/setup-server.sh
set -euo pipefail

DEPLOY_ROOT="/opt/bcd-btos-pos"

echo "==> Adding 2 GB swap (prevents OOM during builds)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "    Swap enabled"
else
  echo "    Swap already exists, skipping"
fi

echo "==> Installing Node 22 (if not already v22)"
if ! node --version 2>/dev/null | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
echo "    Node $(node --version), npm $(npm --version)"

echo "==> Installing nginx (if missing)"
if ! command -v nginx &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y nginx
fi

echo "==> Installing PM2 (if missing)"
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi

echo "==> Creating deploy directory"
sudo mkdir -p "$DEPLOY_ROOT"
sudo chown ubuntu:ubuntu "$DEPLOY_ROOT"
mkdir -p "$DEPLOY_ROOT/backend" "$DEPLOY_ROOT/frontend" "$DEPLOY_ROOT/deploy/ec2"

echo "==> Setting up backend .env"
if [ ! -f "$DEPLOY_ROOT/backend/.env" ]; then
  if [ -f "$DEPLOY_ROOT/backend/.env.example" ]; then
    cp "$DEPLOY_ROOT/backend/.env.example" "$DEPLOY_ROOT/backend/.env"
    sed -i 's/NODE_ENV=development/NODE_ENV=production/' "$DEPLOY_ROOT/backend/.env"
    echo "    Created .env from .env.example (edit JAL credentials if needed)"
  else
    echo "    WARNING: No .env.example found yet — will be created on first deploy"
  fi
else
  echo "    .env already exists, skipping"
fi

echo "==> Configuring nginx"
sudo cp "$DEPLOY_ROOT/deploy/ec2/nginx-bcd-btos-pos.conf" /etc/nginx/sites-available/bcd-btos-pos 2>/dev/null || echo "    nginx conf not uploaded yet — will configure after first deploy"
if [ -f /etc/nginx/sites-available/bcd-btos-pos ]; then
  sudo sed -i "s/YOUR_SERVER_NAME/_/g" /etc/nginx/sites-available/bcd-btos-pos
  sudo ln -sf /etc/nginx/sites-available/bcd-btos-pos /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl reload nginx
  echo "    nginx configured"
fi

echo "==> Configuring PM2 startup"
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo "==> Done. Server is ready for CI/CD deployments."
free -h
