This folder is for local-only files (e.g. SSH .pem keys). Do not commit keys or passwords.

Git ignores everything here except this README.

SSH example (from repo root, adjust path and host):

  ssh -i deploy/secrets/your-key.pem ubuntu@your-ec2-host.amazonaws.com
