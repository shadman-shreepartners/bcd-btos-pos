# AWS EC2 deployment (bcd-btos-pos)

Store your EC2 SSH private key under `deploy/secrets/` (gitignored), not in the repo root.

Single EC2 instance: **nginx** serves the Vite SPA and proxies **`/api`** to **NestJS** on port **3004**, managed by **PM2**.

## 1. EC2 instance

- **AMI:** Ubuntu 22.04 LTS or Amazon Linux 2023
- **Security group:** allow **TCP 22** (SSH), **TCP 80** (HTTP), **443** if you use TLS later
- **Node.js:** v22.x (matches `engines` in `backend/package.json`)

```bash
# Ubuntu — Node 22 via NodeSource (example)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

## 2. Put the code on the server

```bash
sudo mkdir -p /opt/bcd-btos-pos
sudo chown "$USER:$USER" /opt/bcd-btos-pos
cd /opt/bcd-btos-pos
git clone <YOUR_REPO_URL> .
# or rsync/scp your project folder here
```

## 3. Backend environment

```bash
cp /opt/bcd-btos-pos/backend/.env.example /opt/bcd-btos-pos/backend/.env
# Edit .env: JAL_* , PORT=3004 , NODE_ENV=production
```

## 4. Nginx

```bash
sudo cp /opt/bcd-btos-pos/deploy/ec2/nginx-bcd-btos-pos.conf /etc/nginx/sites-available/bcd-btos-pos
sudo sed -i 's/YOUR_SERVER_NAME/_/g' /etc/nginx/sites-available/bcd-btos-pos   # or set your domain
sudo ln -sf /etc/nginx/sites-available/bcd-btos-pos /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # optional
sudo nginx -t && sudo systemctl reload nginx
```

Adjust `root` in that file if your install path is not `/opt/bcd-btos-pos`.

## 5. First-time server setup

Run the setup script to install swap, Node 22, nginx, PM2, and configure everything:

```bash
# From your local machine (streams the script to the server):
ssh -i deploy/secrets/chetan-ims.pem ubuntu@<EC2_HOST> 'bash -s' < deploy/ec2/setup-server.sh
```

Or SSH in and run it directly:

```bash
bash /opt/bcd-btos-pos/deploy/ec2/setup-server.sh
```

Then configure PM2 startup:

```bash
pm2 startup
# Run the command PM2 prints (sudo env PATH=...)
```

## 6. CI/CD — GitHub Actions (automatic deploys)

Every push to `main` triggers `.github/workflows/deploy.yml` which builds both apps in CI and deploys to EC2 via SCP + SSH.

### GitHub Secrets (required)

Go to **GitHub repo > Settings > Secrets and variables > Actions > New repository secret** and add:

| Secret name    | Value                                            |
|----------------|--------------------------------------------------|
| `EC2_SSH_KEY`  | Full contents of `deploy/secrets/chetan-ims.pem` |
| `EC2_HOST`     | Your EC2 public DNS (e.g. `ec2-52-7-187-197.compute-1.amazonaws.com`) |
| `EC2_USER`     | `ubuntu`                                         |

### What the workflow does

1. Checks out code
2. Installs + builds **backend** (`npm ci && npm run build`)
3. Installs + builds **frontend** (`npm ci && npm run build`)
4. SCPs `backend/dist/`, `frontend/dist/`, config files to EC2
5. SSHs into EC2: `npm ci --omit=dev`, PM2 restart, nginx reload, health check

### Triggering a deploy

```bash
git push origin main
```

Monitor at: `https://github.com/<owner>/<repo>/actions`

## 7. Manual deploy (alternative)

```bash
chmod +x /opt/bcd-btos-pos/deploy/ec2/deploy.sh
DEPLOY_ROOT=/opt/bcd-btos-pos /opt/bcd-btos-pos/deploy/ec2/deploy.sh
```

## 8. HTTPS (optional)

Use **Certbot** with nginx on your domain, or terminate TLS on an **Application Load Balancer** and forward HTTP to the instance.

## Verify

- `curl -s http://localhost:3004/health`
- Open `http://<EC2_PUBLIC_IP>/` in a browser; Domestic Travel → Book should call `/api/v1/integrations/jal/sso` on the same host.
