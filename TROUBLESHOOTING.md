# Troubleshooting Common Issues

## Docker Permission Denied

### Error:
```
permission denied while trying to connect to the Docker daemon socket
```

### Solution:
You need to **logout and login again** after adding user to docker group:

```bash
# Exit SSH session
exit

# SSH back in
ssh -i your-key.pem ubuntu@YOUR_IP

# Verify docker works
docker ps
# Should show empty list (no error)

# Now deploy
cd ~/bh_j
docker compose -f docker-compose.prod.yml up -d --build
```

**Why?** The `usermod -aG docker ubuntu` command adds you to the docker group, but your current shell session doesn't know about it yet. Logging out and back in loads the new group membership.

---

## Quick Fix Commands

```bash
# If you see permission denied:
exit
ssh -i your-key.pem ubuntu@YOUR_IP
cd ~/bh_j
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Other Common Issues

### "version is obsolete" Warning

**Warning:**
```
the attribute `version` is obsolete, it will be ignored
```

**Solution:** This is just a warning, safe to ignore. Or remove `version: '3.8'` from docker-compose.prod.yml

### Port Already in Use

**Error:**
```
Bind for 0.0.0.0:80 failed: port is already allocated
```

**Solution:**
```bash
# Check what's using port 80
sudo netstat -tulpn | grep :80

# If Apache is installed
sudo systemctl stop apache2
sudo systemctl disable apache2

# If Nginx is installed locally
sudo systemctl stop nginx
sudo systemctl disable nginx

# Then retry
docker compose -f docker-compose.prod.yml up -d --build
```

### Container Won't Start

**Check logs:**
```bash
docker logs behavior_journal_app
docker logs behavior_journal_db
docker logs behavior_journal_nginx
```

**Rebuild from scratch:**
```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Can't Access from Browser

**Check firewall in Lightsail:**
- Go to Instance → Networking tab
- Make sure port 80 is open (HTTP)
- Make sure port 3000 is open (Custom TCP)

**Check containers are running:**
```bash
docker ps

# Should see 3 containers:
# - behavior_journal_nginx
# - behavior_journal_app
# - behavior_journal_db
```

**Test locally:**
```bash
curl http://localhost
# Should return HTML
```

### Database Connection Failed

**Check database logs:**
```bash
docker logs behavior_journal_db
```

**Test database connection:**
```bash
docker exec -it behavior_journal_db psql -U behavior_user -d behavior_journal -c "\dt"
```

**Check .env file:**
```bash
cat .env
# Make sure DATABASE_URL is correct
```

### Out of Disk Space

**Check disk usage:**
```bash
df -h
```

**Clean Docker:**
```bash
docker system prune -a --volumes
# WARNING: This removes all unused containers, images, and volumes
```

**Check what's using space:**
```bash
sudo du -h --max-depth=1 / 2>/dev/null | sort -hr | head -20
```

---

## Step-by-Step Verification

### 1. Docker is installed and working
```bash
docker --version
# Should show: Docker version 20.x.x or higher

docker compose version
# Should show: Docker Compose version v2.x.x

docker ps
# Should NOT show permission denied error
```

### 2. Code is checked out
```bash
cd ~/bh_j
ls -la
# Should see: Dockerfile, docker-compose.prod.yml, app/, etc.
```

### 3. .env file exists
```bash
cat .env
# Should show DATABASE_URL, JWT_SECRET, NODE_ENV
```

### 4. Build and start
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Check containers
```bash
docker ps
# Should see 3 containers running
```

### 6. Check logs
```bash
docker compose -f docker-compose.prod.yml logs
# Look for errors
```

### 7. Test access
```bash
curl http://localhost
# Should return HTML

# From browser
http://YOUR_LIGHTSAIL_IP
```

---

## Complete Fresh Start

If everything is broken, start fresh:

```bash
# 1. Stop and remove everything
cd ~/bh_j
docker compose -f docker-compose.prod.yml down -v

# 2. Remove all Docker containers/images
docker system prune -a --volumes

# 3. Remove code
cd ~
rm -rf bh_j

# 4. Start from beginning
git clone https://github.com/ktsang622/bh_j.git ~/bh_j
cd ~/bh_j

# 5. Create .env
cat > .env <<EOF
DATABASE_URL=postgresql://behavior_user:$(openssl rand -hex 16)@postgres:5432/behavior_journal
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# 6. Deploy
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Getting Help

1. **Check logs first:**
   ```bash
   docker compose -f docker-compose.prod.yml logs -f
   ```

2. **Check container status:**
   ```bash
   docker ps -a
   ```

3. **Test database:**
   ```bash
   docker exec behavior_journal_db psql -U behavior_user -d behavior_journal -c "SELECT * FROM users;"
   ```

4. **Check system resources:**
   ```bash
   df -h          # Disk space
   free -h        # Memory
   docker stats   # Container resources
   ```

---

## Quick Reference

```bash
# Permission denied → Logout and login again
exit
ssh -i your-key.pem ubuntu@YOUR_IP

# View logs
docker logs -f behavior_journal_app

# Restart
docker compose -f docker-compose.prod.yml restart

# Stop
docker compose -f docker-compose.prod.yml down

# Rebuild
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Clean up
docker system prune -a
```
