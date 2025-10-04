# 📋 Lightsail Deployment Cheat Sheet

## 🎯 Quick Deploy (Copy & Paste)

### 1. Create Lightsail Instance
- Ubuntu 22.04 LTS, $10/month (2GB RAM)
- Open ports: 22, 80, 443, 3000

### 2. Connect
```bash
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_IP
```

### 3. Install Everything
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y curl wget git vim htop ca-certificates gnupg lsb-release

# Install Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
sudo systemctl enable docker

# LOGOUT AND LOGIN AGAIN
exit
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_IP
```

### 4. Deploy App
```bash
# Clone repo
git clone https://github.com/ktsang622/bh_j.git ~/app
cd ~/app

# Create .env
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# Deploy
chmod +x deploy.sh
./deploy.sh

# OR manually:
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Access
```
http://YOUR_IP
```

**Login:** kevin/password123 (admin) or wife/password123 (user)

---

## ⚡ Common Commands

```bash
# View logs
docker logs -f behavior_journal_app

# Restart
docker compose -f docker-compose.prod.yml restart

# Stop
docker compose -f docker-compose.prod.yml down

# Update app
cd ~/app && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Backup database
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal | gzip > ~/backup_$(date +%Y%m%d).sql.gz

# Check status
docker ps

# System resources
htop
docker stats
df -h
```

---

## 🔧 Troubleshooting

```bash
# Container won't start
docker logs behavior_journal_app --tail 50

# Rebuild everything
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Check database
docker exec -it behavior_journal_db psql -U behavior_user -d behavior_journal -c "\dt"

# Clean up space
docker system prune -a --volumes

# Check ports
sudo netstat -tulpn | grep -E ':(80|3000|5432)'
```

---

## 🔐 Security Checklist

- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] Strong passwords in .env
- [ ] HTTPS enabled with Let's Encrypt
- [ ] Automatic security updates enabled
- [ ] Regular backups scheduled

---

## 📚 Full Guides

- **From Scratch:** [LIGHTSAIL-FROM-SCRATCH.md](./LIGHTSAIL-FROM-SCRATCH.md)
- **Full Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Start:** [QUICKSTART-LIGHTSAIL.md](./QUICKSTART-LIGHTSAIL.md)
- **GitHub:** https://github.com/ktsang622/bh_j
