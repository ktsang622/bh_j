# 🚀 Simplest Deployment - Docker Compose Only

## Why This Is Easier

**You DON'T need to install:**
- ❌ Node.js
- ❌ npm
- ❌ Build tools
- ❌ PostgreSQL locally

**You ONLY need:**
- ✅ Docker
- ✅ Docker Compose

Everything else runs inside containers! Docker handles all the building, dependencies, and runtime.

---

## Complete Deployment (5 Minutes)

### Step 1: Create Lightsail Instance

- **OS**: Ubuntu 22.04 LTS
- **Plan**: $10/month (2 GB RAM)
- **Firewall**: Open ports 22, 80, 443, 3000

### Step 2: Install Docker (One Command Block)

SSH into your instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose plugin (if not included)
sudo apt install -y docker-compose-plugin

# Enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# IMPORTANT: Logout and login again
exit
```

**Login again:**
```bash
ssh -i your-key.pem ubuntu@YOUR_IP
```

**Verify Docker works:**
```bash
docker --version
docker compose version
docker ps
# Should show empty list (no errors)
```

---

### Step 3: Deploy App (Copy-Paste All)

```bash
# Clone repository
git clone https://github.com/ktsang622/bh_j.git ~/app
cd ~/app

# Create secure environment variables
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# Build and start everything
docker compose -f docker-compose.prod.yml up -d --build

# Wait for startup (30 seconds)
echo "Waiting for services to start..."
sleep 30

# Check status
docker ps
```

**That's it!** 🎉

---

### Step 4: Access Your App

**Open in browser:**
```
http://YOUR_LIGHTSAIL_IP
```

**Login:**
- Username: `kevin`, Password: `password123` (Admin)
- Username: `wife`, Password: `password123` (User)

---

## What Just Happened?

Docker Compose automatically:

1. ✅ Built the Next.js app inside a container
2. ✅ Installed all npm dependencies
3. ✅ Created PostgreSQL database
4. ✅ Ran database migrations
5. ✅ Started Nginx reverse proxy
6. ✅ Connected everything together

**No manual Node.js installation needed!**

---

## Common Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Just the app
docker logs -f behavior_journal_app

# Just the database
docker logs -f behavior_journal_db
```

### Check Status
```bash
docker ps
```

### Restart
```bash
docker compose -f docker-compose.prod.yml restart
```

### Stop
```bash
docker compose -f docker-compose.prod.yml down
```

### Update App
```bash
cd ~/app
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
cat backup_20250104.sql | docker exec -i behavior_journal_db psql -U behavior_user -d behavior_journal
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# Stop nginx if installed locally
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Container Won't Start
```bash
# Check logs
docker logs behavior_journal_app

# Rebuild from scratch
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Can't Access From Browser
```bash
# Check firewall in Lightsail Console
# Instance → Networking → Firewall → Add rule for port 80

# Check containers are running
docker ps

# Check nginx
curl http://localhost
```

### Out of Disk Space
```bash
# Check space
df -h

# Clean Docker
docker system prune -a --volumes
```

---

## Why Docker Compose Is Better

### Traditional Deployment (Complex):
1. Install Node.js 20
2. Install npm packages (500+ dependencies)
3. Install PostgreSQL
4. Configure PostgreSQL
5. Build Next.js app
6. Install PM2 or process manager
7. Install Nginx
8. Configure Nginx
9. Manage environment variables
10. Set up autostart

### Docker Compose (Simple):
1. Install Docker
2. Run `docker compose up -d`

**Done!** Everything is containerized and portable.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         Lightsail Instance              │
│  ┌───────────────────────────────────┐  │
│  │   Docker Network                  │  │
│  │  ┌──────────┐  ┌──────────┐      │  │
│  │  │  Nginx   │→ │   App    │      │  │
│  │  │ (Port 80)│  │(Port 3000)│      │  │
│  │  └──────────┘  └─────┬────┘      │  │
│  │                      │            │  │
│  │                      ↓            │  │
│  │                ┌──────────┐      │  │
│  │                │PostgreSQL│      │  │
│  │                │(Internal)│      │  │
│  │                └──────────┘      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Benefits:**
- Everything isolated in containers
- No dependency conflicts
- Portable across servers
- Easy rollback
- Simple updates

---

## Production Checklist

After deployment:

- [ ] Change default passwords (kevin/wife)
- [ ] Set strong passwords in .env
- [ ] Setup static IP in Lightsail
- [ ] Configure domain name (optional)
- [ ] Enable HTTPS with Let's Encrypt (optional)
- [ ] Setup automatic backups
- [ ] Test all features
- [ ] Monitor logs for errors

---

## Automatic Backups (Optional)

```bash
# Create backup script
cat > ~/backup.sh <<'EOF'
#!/bin/bash
mkdir -p ~/backups
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal | gzip > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
# Keep only last 30 days
find ~/backups -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x ~/backup.sh

# Test it
~/backup.sh
ls -lh ~/backups/

# Schedule daily at 2 AM
crontab -e
# Add this line:
# 0 2 * * * /home/ubuntu/backup.sh
```

---

## SSL/HTTPS Setup (Optional)

```bash
# Install certbot
sudo apt install -y certbot

# Stop nginx container
docker stop behavior_journal_nginx

# Get certificate (replace your-domain.com)
sudo certbot certonly --standalone -d your-domain.com

# Copy certs
sudo mkdir -p ~/app/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/app/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/app/ssl/key.pem
sudo chown -R ubuntu:ubuntu ~/app/ssl

# Edit nginx.conf
cd ~/app
nano nginx.conf
# Uncomment HTTPS section, update server_name

# Restart
docker compose -f docker-compose.prod.yml restart nginx

# Auto-renewal
echo "0 3 * * * certbot renew --quiet && docker compose -f ~/app/docker-compose.prod.yml restart nginx" | crontab -
```

---

## Resources & Cost

### Lightsail Costs:
- **$5/month**: 1 GB RAM (minimum, may struggle)
- **$10/month**: 2 GB RAM (recommended) ⭐
- **$20/month**: 4 GB RAM (comfortable)

### Included:
- 1-3 TB data transfer
- Static IP
- DNS management
- Automatic snapshots (extra cost)

---

## Need Help?

- **GitHub**: https://github.com/ktsang622/bh_j
- **Issues**: Create an issue on GitHub
- **Documentation**: See other guides in repo

---

## Summary

**Installation:**
```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# 2. Deploy
git clone https://github.com/ktsang622/bh_j.git ~/app
cd ~/app
echo "DATABASE_URL=postgresql://user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production" > .env
docker compose -f docker-compose.prod.yml up -d --build
```

**Access:** http://YOUR_IP

**That's it! No Node.js, no npm, no manual building required!** 🚀
