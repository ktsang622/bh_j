# 🚀 Quick Start - Deploy to AWS Lightsail

## TL;DR - Fast Deployment

### 1. Create Lightsail Instance
- Ubuntu 22.04 LTS
- $10/month plan (2GB RAM)
- Open ports: 22, 80, 443, 3000

### 2. Run on Lightsail Instance

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@YOUR_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
exit && ssh -i your-key.pem ubuntu@YOUR_IP

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Deploy App

```bash
# Upload code from local machine
tar -czf app.tar.gz behavior_journal/
scp -i your-key.pem app.tar.gz ubuntu@YOUR_IP:~/
ssh -i your-key.pem ubuntu@YOUR_IP

# Extract and setup
mkdir app && tar -xzf app.tar.gz -C app && cd app

# Create .env
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 8)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# Deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Access App

**Direct access (port 3000):**
```
http://YOUR_IP:3000
```

**Via Nginx (port 80):**
```
http://YOUR_IP
```

**Login:**
- Username: `kevin` / Password: `password123` (Admin)
- Username: `wife` / Password: `password123` (User)

---

## Access Localhost:3000 from Outside

### Option 1: Direct Port Access (Simplest)

1. **Open port 3000 in Lightsail firewall:**
   - Lightsail Console → Instance → Networking
   - Add rule: Custom TCP, Port 3000, Allow all

2. **Start only app & database** (skip nginx):
   ```bash
   docker-compose up -d postgres app
   ```

3. **Access:**
   ```
   http://YOUR_LIGHTSAIL_IP:3000
   ```

### Option 2: Nginx Reverse Proxy (Recommended)

1. **Use production compose file** (includes nginx):
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Access via port 80:**
   ```
   http://YOUR_LIGHTSAIL_IP
   ```
   Nginx proxies to localhost:3000 internally

### Option 3: SSH Tunnel (Development)

From your **local machine**:

```bash
# Forward remote port 3000 to local port 3000
ssh -i your-key.pem -L 3000:localhost:3000 ubuntu@YOUR_IP

# Keep terminal open, access locally:
# http://localhost:3000
```

---

## Common Commands

```bash
# Check status
docker ps

# View logs
docker logs behavior_journal_app -f

# Restart
docker-compose -f docker-compose.prod.yml restart

# Stop
docker-compose -f docker-compose.prod.yml down

# Rebuild
docker-compose -f docker-compose.prod.yml up -d --build

# Database backup
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal > backup.sql
```

---

## Firewall Ports Summary

| Port | Service | Required | Access |
|------|---------|----------|--------|
| 22   | SSH     | Yes      | Your IP only (recommended) |
| 80   | HTTP    | Yes      | All (if using nginx) |
| 443  | HTTPS   | Optional | All (for SSL) |
| 3000 | Next.js | Optional | All (for direct access) |

---

## Troubleshooting

**Can't access port 3000?**
- Check firewall: Lightsail Console → Networking
- Check container: `docker ps | grep app`
- Check logs: `docker logs behavior_journal_app`

**Nginx 502 Bad Gateway?**
- App container down: `docker-compose -f docker-compose.prod.yml restart app`
- Check app logs: `docker logs behavior_journal_app`

**Database connection failed?**
- Check postgres: `docker logs behavior_journal_db`
- Verify .env DATABASE_URL

---

## Quick Links

- [Full Deployment Guide](./DEPLOYMENT.md)
- [README](./README.md)
- [Lightsail Console](https://lightsail.aws.amazon.com/)
