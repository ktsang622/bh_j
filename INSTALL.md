# Install - 3 Steps Only

## What You Need on Lightsail
- Just Docker

## What You DON'T Need
- ❌ Node.js
- ❌ npm
- ❌ PostgreSQL
- ❌ Build tools

---

## Installation

### 1. Install Docker
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit
# SSH back in
```

### 2. Checkout & Deploy
```bash
git clone https://github.com/ktsang622/bh_j.git ~/app
cd ~/app
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Access
```
http://YOUR_LIGHTSAIL_IP
```

Login: `kevin` / `password123`

---

## What Happens?

Docker automatically:
- ✅ Downloads Node.js image
- ✅ Installs all npm dependencies (inside container)
- ✅ Builds Next.js app (inside container)
- ✅ Downloads & starts PostgreSQL
- ✅ Creates database & tables
- ✅ Downloads & starts Nginx
- ✅ Connects everything

**You just checkout and run!** 🚀

---

## Commands

```bash
# View logs
docker logs -f behavior_journal_app

# Restart
docker compose -f docker-compose.prod.yml restart

# Update
cd ~/app && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Backup
docker exec behavior_journal_db pg_dump -U behavior_user behavior_journal > backup.sql
```

---

## Full Guides
- [SIMPLE-DEPLOY.md](./SIMPLE-DEPLOY.md) - Complete guide
- [DEPLOY-CHEATSHEET.md](./DEPLOY-CHEATSHEET.md) - Quick reference
