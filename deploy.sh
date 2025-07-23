#!/bin/bash

# Quick GCP Deployment Script
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying LLM Cost Calculator to Google Cloud Run${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Please install Google Cloud CLI first.${NC}"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Project: $PROJECT_ID${NC}"

# Enable required APIs
echo -e "${BLUE}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Deploy to Cloud Run
echo -e "${BLUE}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy llm-cost-calculator \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 100 \
  --timeout 300

# Get service URL
SERVICE_URL=$(gcloud run services describe llm-cost-calculator --region us-central1 --format 'value(status.url)')

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Your app is live at: $SERVICE_URL${NC}"

echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Set environment variables:"
echo "   gcloud run services update llm-cost-calculator --region us-central1 --set-env-vars MONGODB_URI=\"your-mongodb-uri\""
echo ""
echo "2. Update GitHub OAuth app:"
echo "   Homepage URL: $SERVICE_URL"
echo "   Callback URL: $SERVICE_URL/api/auth/callback/github"
echo ""
echo "3. Update NEXTAUTH_URL:"
echo "   gcloud run services update llm-cost-calculator --region us-central1 --set-env-vars NEXTAUTH_URL=\"$SERVICE_URL\""