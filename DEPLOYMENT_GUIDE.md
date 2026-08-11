# JagoBot — Self-Hosted Deployment Guide

> Warehouse server + Cloudflare Tunnel + Docker Compose + NAS backups
> Last updated: 2026-08-07

---

## Prerequisites

- Linux server (Ubuntu 22.04+ recommended) in warehouse
- Docker + Docker Compose installed
- Cloudflare account (free tier works)
- Domain name managed via Cloudflare DNS
- NAS accessible on local network (for backups)
- Supabase PostgreSQL database (keep remote — don't self-host DB yet)

---

## Step 1: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version

# Enable on boot
sudo systemctl enable docker
sudo systemctl start docker
```

---

## Step 2: Clone & Configure

```bash
cd /opt
git clone <your-jagobot-repo-url> jagobot
cd jagobot

# Copy and edit env files
cp jagobot-backend/.env.example jagobot-backend/.env
nano jagobot-backend/.env
```

**Required env vars in `jagobot-backend/.env`:**
```
DATABASE_URL=postgresql://...  # Supabase connection
DIRECT_URL=postgresql://...    # Supabase direct connection
JWT_SECRET=your-secret-here
GEMINI_API_KEY=your-gemini-key  # Fallback
NINEROUTER_BASE_URL=https://your-9router.com/v1
NINEROUTER_API_KEY=your-key
NINEROUTER_CHAT_MODEL=your-chat-model
NINEROUTER_EMBED_MODEL=text-embedding-3-small
NODE_ENV=production
PORT=5000
```

---

## Step 3: Run Database Migration

```bash
# Before first deployment, run Prisma migration against Supabase
cd jagobot-backend
npx prisma migrate deploy
cd ..
```

**Important:** This creates the new `Subscription`, `PaymentProof`, `GoogleSheetsConnection` tables and adds `tokenCount` column to `ChatLog`.

---

## Step 4: Build & Start with Docker Compose

```bash
# Build and start
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

Services will be running:
- Frontend (nginx): `http://localhost:3000`
- Backend (Express): `http://localhost:5000` (only accessible internally)

---

## Step 5: Cloudflare Tunnel (No port forwarding needed)

### Install cloudflared

```bash
# Debian/Ubuntu
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

### Create Tunnel

```bash
# Login to Cloudflare
cloudflared tunnel login

# Create named tunnel
cloudflared tunnel create jagobot

# Note the tunnel ID from output
```

### Configure Tunnel

Create `~/.cloudflared/config.yml`:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /home/$USER/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: jagobot.yourdomain.com
    service: http://localhost:3000
  - hostname: api.jagobot.yourdomain.com
    service: http://localhost:5000
  - service: http_status:404
```

### Create DNS Records

```bash
# Point your domain to the tunnel
cloudflared tunnel route dns jagobot jagobot.yourdomain.com
cloudflared tunnel route dns jagobot api.jagobot.yourdomain.com
```

### Start Tunnel as Service

```bash
# Install as systemd service
sudo cloudflared service install

# Start and enable
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

Now JagoBot is accessible at:
- `https://jagobot.yourdomain.com` (frontend)
- `https://api.jagobot.yourdomain.com` (backend API)

---

## Step 6: Set Up NAS Backups

### Mount NAS (if not already mounted)

```bash
# Create mount point
sudo mkdir -p /mnt/nas

# Mount (adjust for your NAS setup — NFS example)
sudo mount -t nfs 192.168.1.100:/share/backups /mnt/nas

# Add to fstab for persistence
echo "192.168.1.100:/share/backups /mnt/nas nfs defaults 0 0" | sudo tee -a /etc/fstab
```

### Automated Backup Script

Create `/opt/jagobot/backup.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/mnt/nas/jagobot-backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Database dump (from Supabase — run locally or use pg_dump remotely)
# This assumes DATABASE_URL is set in the environment
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database.sql"

# Backup uploaded files (payment proofs, knowledge base)
docker cp jagobot-backend:/app/uploads "$BACKUP_DIR/uploads"

# Keep only last 7 days
find /mnt/nas/jagobot-backups -maxdepth 1 -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR"
```

```bash
chmod +x /opt/jagobot/backup.sh
```

### Schedule with Cron

```bash
# Run daily at 3 AM
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/jagobot/backup.sh >> /var/log/jagobot-backup.log 2>&1") | crontab -
```

### Test Restore

```bash
# Test restore from backup (do this once to verify it works)
psql "$DATABASE_URL" < /mnt/nas/jagobot-backups/2026-08-07/database.sql
```

---

## Step 7: Uptime Kuma Monitoring

### Install Uptime Kuma

```bash
# Run as Docker container
docker run -d \
  --name uptime-kuma \
  --restart=unless-stopped \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1
```

### Access and Configure

1. Open `http://your-server-ip:3001` (or tunnel it too)
2. Create admin account
3. Add monitors:
   - **Frontend:** `https://jagobot.yourdomain.com` (HTTP(s) — keyword check)
   - **Backend API:** `https://api.jagobot.yourdomain.com/api/health` (HTTP(s) — keyword "ok")
   - **Cloudflare Tunnel:** monitor the `cloudflared` process
4. Set up notifications (Telegram, email, or Discord)

### Optional: Add Kuma to Cloudflare Tunnel

Add to `~/.cloudflared/config.yml`:
```yaml
  - hostname: status.yourdomain.com
    service: http://localhost:3001
```

---

## Step 8: Server Hardening

```bash
# Firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 443/tcp  # HTTPS (if using direct, but tunnel doesn't need this)
sudo ufw enable

# Fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

---

## Step 9: Update / Restart Procedures

### Update code

```bash
cd /opt/jagobot
git pull origin darren  # or your deployment branch
docker compose up -d --build
```

### Restart services

```bash
docker compose restart
sudo systemctl restart cloudflared
```

### Check health

```bash
docker compose ps
curl https://api.jagobot.yourdomain.com/api/health
sudo systemctl status cloudflared
```

---

## Troubleshooting

### Tunnel not connecting
```bash
sudo journalctl -u cloudflared -f
```

### Backend not starting
```bash
docker compose logs backend
# Common: DATABASE_URL incorrect, missing .env
```

### Database migration needed after update
```bash
docker compose exec backend npx prisma migrate deploy
```

### Uploads not persisting after restart
```bash
# Verify volume is mounted
docker volume ls
docker inspect jagobot-backend | grep uploads
```

---

## Cost Summary

| Item | Cost |
|------|------|
| Cloudflare Tunnel | Free |
| Uptime Kuma | Free (self-hosted) |
| Docker | Free |
| Supabase (Pro) | ~$25/month |
| Domain | ~$12/year |
| Server electricity | ~$5-15/month |
| **Total** | ~$30-40/month |
