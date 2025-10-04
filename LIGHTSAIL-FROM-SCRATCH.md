# 🚀 Lightsail Deployment - Complete From Scratch Guide

## Step 1: Create Lightsail Instance

1. **Go to AWS Lightsail Console**: https://lightsail.aws.amazon.com/
2. **Click "Create instance"**
3. **Select:**
   - Instance location: Choose closest region
   - Platform: **Linux/Unix**
   - Blueprint: **OS Only** → **Ubuntu 22.04 LTS**
   - Instance plan: **$10/month** (2 GB RAM, 1 vCPU, 60 GB SSD) - **minimum recommended**
   - Instance name: `behavior-journal`

4. **Click "Create instance"**

5. **Configure Networking (IMPORTANT):**
   - Click on your instance
   - Go to **"Networking"** tab
   - **Add firewall rules:**
     - SSH: TCP 22 (already there)
     - HTTP: TCP 80 (Add this)
     - HTTPS: TCP 443 (Add this - optional for now)
     - Custom: TCP 3000 (Add this - for direct app access)

6. **Get Static IP (Recommended):**
   - Networking tab → Create static IP
   - Attach to your instance
   - Note the IP address

---

## Step 2: Connect to Your Instance

### Download SSH Key (First Time)

1. Lightsail Console → Account → SSH Keys
2. Download default key → Save as `LightsailDefaultKey.pem`
3. Move to safe location and set permissions:

```bash
# On your local machine (WSL/Linux/Mac)
chmod 400 ~/Downloads/LightsailDefaultKey.pem
```

### SSH into Instance

```bash
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP
```

**You should now be logged into your Ubuntu server!**

---

## Step 3: System Update & Essential Tools

Run these commands on your **Lightsail instance**:

```bash
# Update package lists
sudo apt update

# Upgrade all packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y \
  curl \
  wget \
  git \
  vim \
  htop \
  net-tools \
  ca-certificates \
  gnupg \
  lsb-release

# Verify installation
echo "✅ Essential tools installed"
which curl git vim
```

---

## Step 4: Install Docker

```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list
sudo apt update

# Install Docker
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

# Add current user to docker group (no sudo needed)
sudo usermod -aG docker ubuntu

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker installation
docker --version
docker compose version

echo "✅ Docker installed successfully"
```

**IMPORTANT: Logout and login again for docker group to take effect:**

```bash
exit
# Then SSH back in
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP
```

**Verify Docker works without sudo:**

```bash
docker ps
# Should show empty list (no error)
```

---

## Step 5: Clone Application from GitHub

```bash
# Clone the repository (HTTPS - no authentication needed)
git clone https://github.com/ktsang622/bh_j.git ~/app

# Navigate to app directory
cd ~/app

# Verify files
ls -la

# You should see:
# README.md, Dockerfile, docker-compose.prod.yml, etc.
```

---

## Step 6: Configure Environment Variables

```bash
# Create production .env file with secure passwords
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# Verify .env was created
cat .env

# Should show:
# DATABASE_URL=postgresql://behavior_user:RANDOM_PASSWORD@postgres:5432/behavior_journal
# JWT_SECRET=RANDOM_SECRET
# NODE_ENV=production
```

---

## Step 7: Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

**Or deploy manually:**

```bash
# Build and start all services (app, database, nginx)
docker compose -f docker-compose.prod.yml up -d --build

# Wait for containers to start (about 30-60 seconds)
sleep 30

# Check container status
docker ps

# You should see 3 containers running:
# - behavior_journal_nginx
# - behavior_journal_app
# - behavior_journal_db
```

---

## Step 8: Verify Deployment

### Check Container Logs

```bash
# Check all logs
docker compose -f docker-compose.prod.yml logs

# Check specific service
docker logs behavior_journal_app
docker logs behavior_journal_db
docker logs behavior_journal_nginx
```

### Test Database Connection

```bash
docker exec behavior_journal_db psql -U behavior_user -d behavior_journal -c "SELECT username, role FROM users;"

# Should show:
#  username | role
# ----------+-------
#  kevin    | admin
#  wife     | user
```

### Test API

```bash
# Test login endpoint
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"kevin","password":"password123"}'

# Should return:
# {"success":true,"user":{"id":1,"username":"kevin","role":"admin"}}
```

---

## Step 9: Access Your Application

### From Browser:

1. **Via Nginx (Port 80):**
   ```
   http://YOUR_LIGHTSAIL_IP
   ```

2. **Direct to App (Port 3000):**
   ```
   http://YOUR_LIGHTSAIL_IP:3000
   ```

### Default Login Credentials:

- **Admin:**
  - Username: `kevin`
  - Password: `password123`

- **Standard User:**
  - Username: `wife`
  - Password: `password123`

---

## Step 10: Optional - Setup Domain & HTTPS

### A. Point Domain to Lightsail

1. **Create Static IP** (if not done):
   - Lightsail Console → Networking → Create static IP
   - Attach to instance

2. **Configure DNS:**
   - Lightsail → Networking → DNS zones → Create DNS zone
   - Add A record: `@` → Your static IP
   - Or use your existing DNS provider

### B. Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot

# Stop nginx container temporarily
docker stop behavior_journal_nginx

# Get SSL certificate (replace your-domain.com)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Create SSL directory
mkdir -p ~/app/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/app/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/app/ssl/key.pem
sudo chown -R ubuntu:ubuntu ~/app/ssl

# Edit nginx.conf
cd ~/app
nano nginx.conf

# Uncomment HTTPS section and update server_name to your domain

# Restart containers
docker compose -f docker-compose.prod.yml restart

# Setup auto-renewal
sudo crontab -e
# Add this line:
# 0 3 * * * certbot renew --quiet && docker compose -f ~/app/docker-compose.prod.yml restart nginx
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000

# Stop conflicting services
sudo systemctl stop apache2  # if Apache is running
sudo systemctl stop nginx    # if nginx is installed directly
```

### Container Won't Start

```bash
# Check logs
docker logs behavior_journal_app --tail 100

# Rebuild from scratch
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Can't Connect to Database

```bash
# Check postgres logs
docker logs behavior_journal_db

# Connect to postgres manually
docker exec -it behavior_journal_db psql -U behavior_user -d behavior_journal

# Inside psql:
\dt          # List tables
\q           # Quit
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a --volumes
docker volume prune

# Check largest files
sudo du -h --max-depth=1 / | sort -hr | head -20
```

### Firewall Issues

```bash
# Check if firewall is blocking
sudo ufw status

# If enabled, allow ports:
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
```

---

## Maintenance Commands

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs -f behavior_journal_app
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker restart behavior_journal_app
```

### Update Application

```bash
cd ~/app

# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Manual backup
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal | gzip > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Or use admin UI: http://YOUR_IP/admin/backup
```

### Restore Database

```bash
# Stop app (to prevent connections)
docker stop behavior_journal_app

# Restore from backup
gunzip -c ~/backups/backup_XXXXXX.sql.gz | docker exec -i behavior_journal_db psql -U behavior_user -d behavior_journal

# Restart app
docker start behavior_journal_app
```

### Stop Everything

```bash
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (CAUTION: deletes database)
docker compose -f docker-compose.prod.yml down -v
```

---

## System Monitoring

### Check System Resources

```bash
# CPU and Memory
htop

# Disk space
df -h

# Docker stats
docker stats

# Container resource usage
docker stats behavior_journal_app
```

### Setup Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

---

## Security Checklist

- ✅ Change default passwords in .env
- ✅ Use strong JWT_SECRET (auto-generated)
- ✅ Setup HTTPS with Let's Encrypt
- ✅ Configure firewall (only open necessary ports)
- ✅ Enable automatic security updates
- ✅ Regular database backups
- ✅ Keep Docker images updated

---

## Quick Reference

### Important URLs

- **App**: http://YOUR_IP or http://YOUR_IP:3000
- **Login**: kevin/password123 (admin) or wife/password123 (user)
- **GitHub**: https://github.com/ktsang622/bh_j

### Important Directories

- **App**: `~/app`
- **Backups**: `~/backups`
- **Logs**: `docker logs [container_name]`
- **SSL Certs**: `~/app/ssl/`

### Important Commands

```bash
# Start
docker compose -f docker-compose.prod.yml up -d

# Stop
docker compose -f docker-compose.prod.yml down

# Logs
docker compose -f docker-compose.prod.yml logs -f

# Status
docker ps

# Backup
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal > backup.sql
```

---

## Cost Estimate

- **Lightsail Instance**: $10/month (2GB RAM)
- **Static IP**: Free (while attached)
- **Data Transfer**: 2TB included
- **DNS Zone**: Free
- **Total**: ~$10/month

---

## Next Steps After Deployment

1. ✅ Change default passwords (kevin and wife users)
2. ✅ Setup domain name (optional)
3. ✅ Enable HTTPS
4. ✅ Configure automatic backups
5. ✅ Add your data
6. ✅ Test all features

---

**You're all set! Your Behaviour Journal app is now running on AWS Lightsail! 🎉**
