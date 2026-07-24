#!/bin/bash

# AWS EC2 Deployment Script for SwissGarden Perfumes
# Run this script with: bash deploy-to-aws.sh /path/to/swiss.pem

set -e  # Exit on error

# Check if key path is provided
if [ -z "$1" ]; then
    echo "Usage: bash deploy-to-aws.sh /path/to/swiss.pem"
    exit 1
fi

SSH_KEY="$1"
EC2_USER="ubuntu"
EC2_HOST="65.1.3.113"
APP_DIR="swissgardenperfumes"

echo "🚀 Starting deployment to AWS EC2..."

# Connect to EC2 and execute deployment commands
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'EOF'
    set -e
    
    echo "📦 Navigating to application directory..."
    cd swissgardenperfumes
    
    echo "🔄 Pulling latest changes from GitHub..."
    git pull origin main
    
    echo "📥 Installing server dependencies..."
    cd server
    npm install
    
    echo "📥 Installing client dependencies..."
    cd ../client
    npm install
    
    echo "🔨 Building client application..."
    npm run build
    
    echo "🔄 Restarting PM2 services..."
    pm2 restart all
    
    echo "✅ Deployment completed successfully!"
    
    echo "📊 PM2 Status:"
    pm2 status
EOF

echo ""
echo "✅ Deployment to AWS EC2 completed!"
echo "🌐 Your site should be live at: https://swissgardenperfumes.com"
