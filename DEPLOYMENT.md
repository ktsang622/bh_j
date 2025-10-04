# Deployment Guide - AWS Lightsail

## Prerequisites

- AWS Lightsail account
- SSH key pair configured
- Domain name (optional, but recommended)

## Step 1: Create Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"**
3. Select:
   - **Platform**: Linux/Unix
   - **Blueprint**: OS Only → Ubuntu 22.04 LTS
   - **Instance plan**: $10/month (2 GB RAM, 1 vCPU) minimum
   - **Instance name**: behavior-journal

4. **Important**: Configure networking:
   - Go to instance → Networking tab
   - Add firewall rules:
     - HTTP (port 80) - Allow all
     - HTTPS (port 443) - Allow all
     - Custom TCP (port 3000) - Allow all (for direct access)

## Step 2: Connect to Your Instance

```bash
# Download your SSH key from Lightsail
# Connect to instance
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP
```

## Step 3: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git (optional, for updates)
sudo apt install git -y

# Logout and login again
exit
# ssh back in
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP
```

## Step 4: Deploy Your Application

### Option A: Deploy from Local Machine

From your **local machine**:

```bash
# Navigate to project
cd /home/ktsang/repos/behavior_journal

# Create deployment package
tar -czf behavior_journal.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.tar.gz' \
  .

# Copy to Lightsail
scp -i ~/Downloads/LightsailDefaultKey.pem \
  behavior_journal.tar.gz \
  ubuntu@YOUR_LIGHTSAIL_IP:~/

# SSH into Lightsail
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP

# Extract and setup
tar -xzf behavior_journal.tar.gz -C ~/app
cd ~/app
```

### Option B: Deploy from Git (Recommended)

On **Lightsail instance**:

```bash
# Clone repository
git clone YOUR_REPO_URL ~/app
cd ~/app
```

## Step 5: Configure Environment

```bash
# Generate secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Create production .env file
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:behavior_pass@postgres:5432/behavior_journal
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
EOF

# Update database password (recommended)
# Edit .env and change 'behavior_pass' to a strong password
nano .env
```

## Step 6: Deploy with Docker Compose

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

Or manually:

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 7: Access Your Application

### Direct Access (Port 3000)
```
http://YOUR_LIGHTSAIL_IP:3000
```

### Via Nginx (Port 80)
```
http://YOUR_LIGHTSAIL_IP
```

### Using Static IP (Recommended)

1. In Lightsail console → Networking → Create static IP
2. Attach to your instance
3. Access via: `http://YOUR_STATIC_IP`

## Step 8: Setup Domain (Optional)

### Configure DNS

1. In Lightsail → Networking → DNS zones
2. Create DNS zone for your domain
3. Add A record:
   - Name: `@` (or `app`)
   - Resolves to: Your static IP
   - TTL: 300

4. Update your domain registrar's nameservers to Lightsail's NS records

### Enable HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx container temporarily
docker stop behavior_journal_nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo mkdir -p ~/app/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/app/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/app/ssl/key.pem
sudo chown -R ubuntu:ubuntu ~/app/ssl

# Update nginx.conf
cd ~/app
nano nginx.conf
# Uncomment HTTPS section and update server_name

# Restart containers
docker-compose -f docker-compose.prod.yml restart nginx
```

## Deployment Verification

1. **Check containers are running**:
```bash
docker ps
```

2. **Test database connection**:
```bash
docker exec behavior_journal_db psql -U behavior_user -d behavior_journal -c "SELECT COUNT(*) FROM users;"
```

3. **Test login**:
```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"kevin","password":"password123"}'
```

4. **Check logs**:
```bash
# App logs
docker logs behavior_journal_app

# Database logs
docker logs behavior_journal_db

# Nginx logs
docker logs behavior_journal_nginx
```

## Maintenance

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

### Update Application
```bash
cd ~/app
git pull  # if using git
./deploy.sh
```

### Backup Database
```bash
# Automated backup via admin UI
# Or manual backup:
docker exec behavior_journal_db pg_dump \
  -U behavior_user behavior_journal > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
docker exec -i behavior_journal_db psql \
  -U behavior_user -d behavior_journal < backup.sql
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
docker-compose -f docker-compose.prod.yml down
```

## Monitoring

### Check System Resources
```bash
# Disk usage
docker system df

# Container stats
docker stats

# System monitoring
htop  # install with: sudo apt install htop
```

### Setup Automatic Backups

```bash
# Create backup script
cat > ~/backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 30 backups
ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +31 | xargs -r rm
EOF

chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line: 0 2 * * * ~/backup.sh
```

## Troubleshooting

### Container won't start
```bash
docker-compose -f docker-compose.prod.yml logs [service_name]
```

### Port 3000 not accessible
- Check Lightsail firewall rules
- Check if container is running: `docker ps`

### Database connection error
- Verify DATABASE_URL in .env
- Check postgres container: `docker logs behavior_journal_db`

### Out of disk space
```bash
# Clean up Docker
docker system prune -a --volumes

# Check disk usage
df -h
```

## Security Recommendations

1. **Change default passwords** in .env
2. **Use strong JWT_SECRET** (32+ characters)
3. **Enable HTTPS** with Let's Encrypt
4. **Setup automatic security updates**:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```
5. **Configure firewall**:
```bash
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
```
6. **Regular backups** (setup cron job above)

## Cost Optimization

- Use Lightsail's $10/month plan for production
- Enable snapshots for disaster recovery
- Monitor data transfer (first 1 TB free)
- Consider using Lightsail CDN for static assets

## Need Help?

- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Restart services: `docker-compose -f docker-compose.prod.yml restart`
- Full rebuild: `docker-compose -f docker-compose.prod.yml up -d --build --force-recreate`
