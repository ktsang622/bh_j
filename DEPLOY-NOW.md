# 🚀 Deploy Pre-Built Image to Lightsail - NOW!

## ✅ Image Built Successfully!

**File ready:** `behavior-journal-latest.tar.gz` (71 MB)
**Image size:** 307 MB
**Built for:** linux/amd64 (Lightsail compatible)

---

## 📤 Step 1: Transfer to Lightsail

From your local machine (WSL):

```bash
scp -i ~/Downloads/LightsailDefaultKey.pem \
  /home/ktsang/repos/behavior_journal/behavior-journal-latest.tar.gz \
  ubuntu@YOUR_LIGHTSAIL_IP:~/
```

**This will take ~1-2 minutes depending on your internet speed.**

---

## 📥 Step 2: Deploy on Lightsail

SSH into Lightsail:

```bash
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP
```

Then run these commands:

```bash
# Load the pre-built image (30 seconds)
docker load < ~/behavior-journal-latest.tar.gz

# Verify image loaded
docker images | grep behavior-journal

# Navigate to app directory
cd ~/bh_j

# Pull latest config files
git pull

# Make sure .env exists
cat .env
# If not, create it:
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# Deploy with pre-built image (instant!)
docker compose -f docker-compose.prebuilt.yml up -d

# Check status
docker ps

# View logs
docker logs -f behavior_journal_app
```

---

## ✅ Step 3: Access Your App

Open in browser:
```
http://YOUR_LIGHTSAIL_IP
```

**Login:**
- Username: `kevin`, Password: `password123` (Admin)
- Username: `wife`, Password: `password123` (User)

---

## 🎯 What Just Happened?

1. ✅ Built Next.js app locally (much faster than cloud)
2. ✅ Saved as tar.gz (71 MB compressed)
3. ✅ Transferred to Lightsail
4. ✅ Loaded pre-built image
5. ✅ Deployed containers (PostgreSQL + App + Nginx)

**Total deployment time: ~2-3 minutes!**

---

## 🔄 Future Updates

When you make code changes:

```bash
# On local machine
cd /home/ktsang/repos/behavior_journal

# Rebuild
docker build --platform linux/amd64 -t behavior-journal:latest .
docker save behavior-journal:latest | gzip > behavior-journal-latest.tar.gz

# Transfer
scp -i key.pem behavior-journal-latest.tar.gz ubuntu@YOUR_IP:~/

# On Lightsail
docker load < ~/behavior-journal-latest.tar.gz
cd ~/bh_j
docker compose -f docker-compose.prebuilt.yml up -d --force-recreate
```

---

## 🐛 Troubleshooting

**Can't transfer file?**
```bash
# Check file exists
ls -lh /home/ktsang/repos/behavior_journal/behavior-journal-latest.tar.gz

# Check Lightsail IP is correct
ping YOUR_LIGHTSAIL_IP
```

**Image won't load?**
```bash
# Check file integrity
gunzip -t ~/behavior-journal-latest.tar.gz

# Try loading again
docker load < ~/behavior-journal-latest.tar.gz
```

**Container won't start?**
```bash
# Check logs
docker logs behavior_journal_app

# Rebuild containers
docker compose -f docker-compose.prebuilt.yml down
docker compose -f docker-compose.prebuilt.yml up -d
```

---

## 📊 Summary

| Task | Time |
|------|------|
| Build locally | ✅ ~2 min (done!) |
| Transfer to Lightsail | ~1-2 min |
| Load & deploy | ~30 sec |
| **Total** | **~3-4 min** |

vs building on Lightsail: **5-10 minutes**

**You saved 50% time by building locally!** 🎉
