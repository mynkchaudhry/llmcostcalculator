#!/bin/bash

# GCP Deployment Script for LLM Cost Calculator
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=""
REGION="us-central1"
SERVICE_NAME="llm-cost-calculator"
MONGODB_URI=""
NEXTAUTH_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
GROQ_API_KEY=""
LINKUP_API_KEY=""

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required variables are set
check_requirements() {
    print_status "Checking requirements..."
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "PROJECT_ID is not set. Please edit this script and add your GCP project ID."
        exit 1
    fi
    
    if [ -z "$MONGODB_URI" ]; then
        print_warning "MONGODB_URI is not set. Make sure to set it in GCP console or uncomment the line below."
    fi
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Set up GCP project
setup_gcp() {
    print_status "Setting up GCP project..."
    
    # Set project
    gcloud config set project $PROJECT_ID
    
    # Enable required APIs
    print_status "Enabling required APIs..."
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable run.googleapis.com
    gcloud services enable containerregistry.googleapis.com
    
    print_success "GCP setup completed"
}

# Build and deploy using Cloud Run
deploy_cloud_run() {
    print_status "Deploying to Cloud Run..."
    
    # Build the application
    print_status "Building application..."
    npm run build
    
    # Build and push Docker image
    print_status "Building Docker image..."
    docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME .
    docker push gcr.io/$PROJECT_ID/$SERVICE_NAME
    
    # Deploy to Cloud Run
    print_status "Deploying to Cloud Run..."
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --set-env-vars NODE_ENV=production \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 100 \
        --timeout 300
    
    # Get service URL
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
    
    print_success "Deployment completed!"
    print_success "Your application is available at: $SERVICE_URL"
}

# Deploy using App Engine
deploy_app_engine() {
    print_status "Deploying to App Engine..."
    
    # Deploy to App Engine
    gcloud app deploy app.yaml --quiet
    
    # Get service URL
    SERVICE_URL=$(gcloud app browse --no-launch-browser)
    
    print_success "Deployment completed!"
    print_success "Your application is available at: $SERVICE_URL"
}

# Set environment variables in Cloud Run
set_env_vars() {
    print_status "Setting environment variables..."
    
    if [ ! -z "$MONGODB_URI" ]; then
        gcloud run services update $SERVICE_NAME \
            --region $REGION \
            --set-env-vars MONGODB_URI="$MONGODB_URI"
    fi
    
    if [ ! -z "$NEXTAUTH_SECRET" ]; then
        gcloud run services update $SERVICE_NAME \
            --region $REGION \
            --set-env-vars NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
    fi
    
    if [ ! -z "$GITHUB_ID" ]; then
        gcloud run services update $SERVICE_NAME \
            --region $REGION \
            --set-env-vars GITHUB_ID="$GITHUB_ID"
    fi
    
    if [ ! -z "$GITHUB_SECRET" ]; then
        gcloud run services update $SERVICE_NAME \
            --region $REGION \
            --set-env-vars GITHUB_SECRET="$GITHUB_SECRET"
    fi
    
    if [ ! -z "$GROQ_API_KEY" ]; then
        gcloud run services update $SERVICE_NAME \
            --region $REGION \
            --set-env-vars GROQ_API_KEY="$GROQ_API_KEY"
    fi
    
    if [ ! -z "$LINKUP_API_KEY" ]; then
        gcloud run services update $SERVICE_NAME \
            --region $REGION \
            --set-env-vars LINKUP_API_KEY="$LINKUP_API_KEY"
    fi
    
    print_success "Environment variables set"
}

# Main deployment
main() {
    print_status "Starting GCP deployment for LLM Cost Calculator..."
    
    check_requirements
    setup_gcp
    
    # Ask user for deployment method
    echo -e "${YELLOW}Choose deployment method:${NC}"
    echo "1) Cloud Run (Recommended)"
    echo "2) App Engine"
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            deploy_cloud_run
            set_env_vars
            ;;
        2)
            deploy_app_engine
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac
    
    print_success "Deployment script completed!"
    print_status "Don't forget to:"
    print_status "1. Set up your MongoDB database (MongoDB Atlas recommended)"
    print_status "2. Configure OAuth apps for GitHub authentication"
    print_status "3. Set up domain name and SSL certificate if needed"
    print_status "4. Monitor your application logs and performance"
}

# Run main function
main "$@"