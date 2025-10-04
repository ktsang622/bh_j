# Build Locally & Deploy Pre-Built Image

## Why Build Locally?

**Advantages:**
- ✅ Much faster (use your powerful local machine)
- ✅ No resource strain on small Lightsail instance
- ✅ Build once, deploy anywhere
- ✅ Easier to debug build issues

**Building on Lightsail $10 instance:** 5-10 minutes
**Building locally:** 1-2 minutes
**Deploying pre-built image:** 30 seconds

---

## Option 1: Build & Push to Docker Hub (Recommended)

### Step 1: Setup Docker Hub Account

1. Create account at https://hub.docker.com (free)
2. Create repository: `behavior-journal`

### Step 2: Build Locally (On Your Machine)

```bash
cd /home/ktsang/repos/behavior_journal

# Login to Docker Hub
docker login
# Enter your Docker Hub username and password

# Build for linux/amd64 (Lightsail architecture)
docker build --platform linux/amd64 -t YOUR_DOCKERHUB_USERNAME/behavior-journal:latest .

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/behavior-journal:latest
```

### Step 3: Deploy on Lightsail (Fast!)

Create `docker-compose.hub.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: behavior_journal_db
    environment:
      POSTGRES_USER: behavior_user
      POSTGRES_PASSWORD: behavior_pass
      POSTGRES_DB: behavior_journal
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./init-db.sql:/docker-entrypoint-initdb.d/02-init-data.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U behavior_user -d behavior_journal"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  app:
    image: YOUR_DOCKERHUB_USERNAME/behavior-journal:latest  # Pre-built image!
    container_name: behavior_journal_app
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: behavior_journal_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

**On Lightsail:**
```bash
cd ~/bh_j

# Pull only schema files (not full source)
git pull origin main -- schema.sql init-db.sql nginx.conf

# Download docker-compose.hub.yml (or create it)

# Deploy (just pulls pre-built image, very fast!)
docker compose -f docker-compose.hub.yml up -d
```

---

## Option 2: Build Locally & Transfer Image (No Docker Hub)

### Step 1: Build on Local Machine

```bash
cd /home/ktsang/repos/behavior_journal

# Build for linux/amd64
docker build --platform linux/amd64 -t behavior-journal:latest .

# Save to tar file
docker save behavior-journal:latest | gzip > behavior-journal.tar.gz

# Check size
ls -lh behavior-journal.tar.gz
# Usually ~200-300 MB
```

### Step 2: Transfer to Lightsail

```bash
# From your local machine
scp -i ~/Downloads/LightsailDefaultKey.pem \
  behavior-journal.tar.gz \
  ubuntu@YOUR_LIGHTSAIL_IP:~/
```

### Step 3: Load & Deploy on Lightsail

```bash
# SSH into Lightsail
ssh -i ~/Downloads/LightsailDefaultKey.pem ubuntu@YOUR_LIGHTSAIL_IP

# Load image
docker load < behavior-journal.tar.gz

# Verify image loaded
docker images | grep behavior-journal

# Update docker-compose.prod.yml to use local image
cd ~/bh_j
```

Edit `docker-compose.prod.yml`, change app service:
```yaml
  app:
    image: behavior-journal:latest  # Use local image
    # Remove build section
    container_name: behavior_journal_app
    env_file:
      - .env
    # ... rest stays the same
```

```bash
# Deploy
docker compose -f docker-compose.prod.yml up -d
```

---

## Option 3: GitHub Container Registry (Free, Private)

### Step 1: Setup GitHub Token

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `write:packages`, `read:packages`
4. Copy token

### Step 2: Build & Push Locally

```bash
cd /home/ktsang/repos/behavior_journal

# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Build and tag
docker build --platform linux/amd64 -t ghcr.io/ktsang622/behavior-journal:latest .

# Push
docker push ghcr.io/ktsang622/behavior-journal:latest
```

### Step 3: Deploy on Lightsail

```bash
# On Lightsail
cd ~/bh_j

# Login to GitHub Container Registry
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u ktsang622 --password-stdin

# Create docker-compose.ghcr.yml
cat > docker-compose.ghcr.yml <<'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    # ... same as before

  app:
    image: ghcr.io/ktsang622/behavior-journal:latest
    container_name: behavior_journal_app
    env_file:
      - .env
    # ... rest same as before

  nginx:
    # ... same as before
EOF

# Deploy
docker compose -f docker-compose.ghcr.yml up -d
```

---

## Comparison

| Method | Speed | Pros | Cons |
|--------|-------|------|------|
| **Build on Lightsail** | 🐌 Slow (5-10min) | Simple, no extra steps | Slow, uses Lightsail resources |
| **Docker Hub** | 🚀 Fast (30sec) | Fast, easy updates | Requires Docker Hub account |
| **Transfer tar.gz** | ⚡ Medium (2min) | No registry needed | Manual file transfer |
| **GitHub Registry** | 🚀 Fast (30sec) | Private, free, integrated | Requires GitHub token |

---

## Recommended Workflow

### For Development/Testing:
```bash
# Build locally
cd /home/ktsang/repos/behavior_journal
docker build --platform linux/amd64 -t behavior-journal:latest .

# Test locally first
docker run --rm -p 3000:3000 behavior-journal:latest

# Save and transfer
docker save behavior-journal:latest | gzip > behavior-journal.tar.gz
scp -i key.pem behavior-journal.tar.gz ubuntu@YOUR_IP:~/
```

### For Production:
```bash
# Build and push to Docker Hub
docker build --platform linux/amd64 -t yourname/behavior-journal:v1.0.0 .
docker tag yourname/behavior-journal:v1.0.0 yourname/behavior-journal:latest
docker push yourname/behavior-journal:v1.0.0
docker push yourname/behavior-journal:latest

# On Lightsail - just pull and run
docker pull yourname/behavior-journal:latest
docker compose -f docker-compose.hub.yml up -d
```

---

## Build Script for Local Development

Create `build-and-push.sh`:

```bash
#!/bin/bash
set -e

VERSION=${1:-latest}
DOCKER_USER="YOUR_DOCKERHUB_USERNAME"
IMAGE_NAME="behavior-journal"

echo "🏗️  Building ${DOCKER_USER}/${IMAGE_NAME}:${VERSION}..."
docker build --platform linux/amd64 -t ${DOCKER_USER}/${IMAGE_NAME}:${VERSION} .

echo "🏷️  Tagging as latest..."
docker tag ${DOCKER_USER}/${IMAGE_NAME}:${VERSION} ${DOCKER_USER}/${IMAGE_NAME}:latest

echo "📤 Pushing to Docker Hub..."
docker push ${DOCKER_USER}/${IMAGE_NAME}:${VERSION}
docker push ${DOCKER_USER}/${IMAGE_NAME}:latest

echo "✅ Done! Deploy with:"
echo "   docker pull ${DOCKER_USER}/${IMAGE_NAME}:${VERSION}"
```

Usage:
```bash
chmod +x build-and-push.sh
./build-and-push.sh v1.0.0
```

---

## Multi-Architecture Build (Advanced)

Build for both your local testing (arm64/amd64) and Lightsail (amd64):

```bash
# Create buildx builder
docker buildx create --name multiarch --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t yourname/behavior-journal:latest \
  --push \
  .
```

---

## Quick Commands

### Build locally:
```bash
cd /home/ktsang/repos/behavior_journal
docker build --platform linux/amd64 -t behavior-journal:latest .
```

### Save to file:
```bash
docker save behavior-journal:latest | gzip > behavior-journal.tar.gz
```

### Transfer to Lightsail:
```bash
scp -i key.pem behavior-journal.tar.gz ubuntu@YOUR_IP:~/
```

### Load on Lightsail:
```bash
docker load < behavior-journal.tar.gz
docker images
```

### Push to Docker Hub:
```bash
docker login
docker tag behavior-journal:latest yourname/behavior-journal:latest
docker push yourname/behavior-journal:latest
```

---

## Troubleshooting

### Build fails on local machine

**Check platform:**
```bash
# Are you building for the right platform?
docker build --platform linux/amd64 -t behavior-journal:latest .
```

### Image won't run on Lightsail

**Check architecture:**
```bash
# On Lightsail
uname -m
# Should show: x86_64

# Check image architecture
docker inspect behavior-journal:latest | grep Architecture
# Should show: amd64
```

### Image too large

**Use .dockerignore:**
```
node_modules
.next
.git
*.md
.env*
```

**Check image size:**
```bash
docker images behavior-journal
# Should be ~150-250 MB
```

---

**Recommendation: Use Docker Hub for easiest workflow!** 🚀
