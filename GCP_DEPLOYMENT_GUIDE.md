# GCP Deployment Guide for LLM Cost Calculator

## Prerequisites
- Google Cloud Account with billing enabled
- Google Cloud CLI installed on your local machine
- GitHub repository access

## Step 1: Setup GCP Project

### 1.1 Create or Select Project
```bash
# Create new project (replace PROJECT_ID with your preferred ID)
gcloud projects create YOUR_PROJECT_ID

# Set as current project
gcloud config set project YOUR_PROJECT_ID

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

### 1.2 Enable Required APIs
```bash
# Enable necessary GCP services
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## Step 2: Create Deployment Files

### 2.1 Create Dockerfile
```dockerfile
# Create Dockerfile in your project root
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2.2 Update next.config.ts
```typescript
// Add this to your next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  serverExternalPackages: ['mongoose'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};
```

### 2.3 Create .dockerignore
```
node_modules
.next
.git
README.md
Dockerfile
.dockerignore
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Step 3: Deploy to Cloud Run

### 3.1 Build and Deploy with Single Command
```bash
# Navigate to your project directory
cd /path/to/your/project

# Deploy to Cloud Run (this will build and deploy automatically)
gcloud run deploy llm-cost-calculator \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 100 \
  --timeout 300
```

### 3.2 Set Environment Variables
```bash
# Set your environment variables
gcloud run services update llm-cost-calculator \
  --region us-central1 \
  --set-env-vars \
  MONGODB_URI="your-mongodb-connection-string",\
  NEXTAUTH_SECRET="your-nextauth-secret",\
  GITHUB_ID="your-github-oauth-id",\
  GITHUB_SECRET="your-github-oauth-secret",\
  GROQ_API_KEY="your-groq-api-key",\
  LINKUP_API_KEY="your-linkup-api-key",\
  NODE_ENV="production"
```

### 3.3 Update NEXTAUTH_URL
```bash
# Get your Cloud Run service URL
SERVICE_URL=$(gcloud run services describe llm-cost-calculator --region us-central1 --format 'value(status.url)')

# Update NEXTAUTH_URL with your service URL
gcloud run services update llm-cost-calculator \
  --region us-central1 \
  --set-env-vars NEXTAUTH_URL="$SERVICE_URL"

echo "Your service URL: $SERVICE_URL"
```

## Step 4: Update GitHub OAuth Settings

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Update your OAuth app:
   - **Homepage URL**: `https://your-service-url.run.app`
   - **Authorization callback URL**: `https://your-service-url.run.app/api/auth/callback/github`

## Step 5: Configure Custom Domain (Optional)

### 5.1 Map Custom Domain
```bash
# Map your custom domain
gcloud run domain-mappings create \
  --service llm-cost-calculator \
  --domain your-domain.com \
  --region us-central1
```

### 5.2 Update DNS Records
Follow the instructions provided by Cloud Run to update your domain's DNS records.

## Step 6: Monitor and Manage

### 6.1 View Logs
```bash
# View recent logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=llm-cost-calculator" --limit 50

# Stream logs in real-time
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=llm-cost-calculator"
```

### 6.2 Update Service
```bash
# Deploy updates from source
gcloud run deploy llm-cost-calculator \
  --source . \
  --region us-central1
```

### 6.3 Scale Service
```bash
# Update scaling settings
gcloud run services update llm-cost-calculator \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 100 \
  --concurrency 1000
```

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   ```bash
   # Check build logs
   gcloud builds list --limit 5
   gcloud builds log BUILD_ID
   ```

2. **Environment Variables**:
   ```bash
   # List current environment variables
   gcloud run services describe llm-cost-calculator --region us-central1 --format 'value(spec.template.spec.template.spec.containers[0].env[].name,spec.template.spec.template.spec.containers[0].env[].value)'
   ```

3. **Service Errors**:
   ```bash
   # Check service status
   gcloud run services describe llm-cost-calculator --region us-central1
   ```

## Cost Optimization

1. **Set appropriate resource limits**:
   - Start with 1 CPU and 1Gi memory
   - Scale up if needed

2. **Configure min instances**:
   - Set to 0 for cost savings (cold starts)
   - Set to 1+ for better performance

3. **Monitor usage**:
   ```bash
   # View metrics in Cloud Console
   gcloud run services describe llm-cost-calculator --region us-central1 --format 'value(status.url)'
   ```

## Security Best Practices

1. **Environment Variables**: Store sensitive data in Google Secret Manager
2. **IAM**: Use least privilege principle
3. **Network Security**: Configure VPC if needed
4. **Monitoring**: Set up alerts for unusual activity

Your application will be available at the Cloud Run service URL after successful deployment!