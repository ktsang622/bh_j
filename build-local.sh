#!/bin/bash
# Build Docker image locally and save to tar.gz for transfer to Lightsail

set -e

IMAGE_NAME="behavior-journal"
VERSION="${1:-latest}"
OUTPUT_FILE="${IMAGE_NAME}-${VERSION}.tar.gz"

echo "🏗️  Building ${IMAGE_NAME}:${VERSION} for linux/amd64..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} .

echo "💾 Saving to ${OUTPUT_FILE}..."
docker save ${IMAGE_NAME}:${VERSION} | gzip > ${OUTPUT_FILE}

echo "📊 Image size:"
ls -lh ${OUTPUT_FILE}

echo ""
echo "✅ Build complete!"
echo ""
echo "📤 To deploy to Lightsail:"
echo "   1. Transfer: scp -i your-key.pem ${OUTPUT_FILE} ubuntu@YOUR_IP:~/"
echo "   2. SSH in:   ssh -i your-key.pem ubuntu@YOUR_IP"
echo "   3. Load:     docker load < ${OUTPUT_FILE}"
echo "   4. Deploy:   cd ~/bh_j && docker compose -f docker-compose.prebuilt.yml up -d"
echo ""
