/**
 * PM2 config for NestJS backend on EC2.
 * Usage (from repo root): pm2 start deploy/ec2/ecosystem.config.cjs
 * Or copy to server and set cwd paths to match your install directory.
 */
const path = require('path');

const deployRoot = process.env.DEPLOY_ROOT || path.resolve(__dirname, '../..');

module.exports = {
  apps: [
    {
      name: 'bcd-japan-integration-service',
      cwd: path.join(deployRoot, 'backend'),
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3004',
      },
      // Nest ConfigModule loads backend/.env when cwd is backend (keep .env next to package.json).
    },
  ],
};
