# 🚀 QuickServe Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Code Quality

- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage above 80%
- [ ] No console errors or warnings
- [ ] Performance optimizations applied
- [ ] Security vulnerabilities fixed
- [ ] Accessibility compliance verified

### ✅ Build & Assets

- [ ] Production build created
- [ ] Assets minified and compressed
- [ ] Images optimized
- [ ] Service worker configured
- [ ] Cache strategies implemented
- [ ] CDN setup completed

### ✅ Environment Configuration

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Database connections tested
- [ ] Payment gateway keys updated
- [ ] Analytics tracking configured
- [ ] Error tracking setup

### ✅ Security

- [ ] HTTPS certificates installed
- [ ] Content Security Policy configured
- [ ] CORS settings verified
- [ ] Authentication tokens secured
- [ ] API rate limiting enabled
- [ ] Security headers configured

## 🏗️ Deployment Options

### Option 1: Static Hosting (Recommended for Frontend)

#### Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
netlify init

# Configure build settings
echo 'build = "npm run build"
publish = "dist"
command = "npm run build"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200' > netlify.toml

# Deploy to production
netlify deploy --prod
```

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure vercel.json
echo '{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}' > vercel.json
```

#### GitHub Pages Deployment

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add deploy script to package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# Deploy
npm run deploy
```

### Option 2: Traditional Web Hosting

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName quickserve.com
    ServerAlias www.quickserve.com
    DocumentRoot /var/www/quickserve
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png|ico)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Enable caching
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType image/png "access plus 1 month"
        ExpiresByType image/jpg "access plus 1 month"
        ExpiresByType image/jpeg "access plus 1 month"
        ExpiresByType image/gif "access plus 1 month"
        ExpiresByType image/ico "access plus 1 month"
        ExpiresByType image/icon "access plus 1 month"
        ExpiresByType text/html "access plus 1 hour"
    </IfModule>
    
    # Handle SPA routing
    <Directory /var/www/quickserve>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
</VirtualHost>

# HTTPS Virtual Host
<VirtualHost *:443>
    ServerName quickserve.com
    ServerAlias www.quickserve.com
    DocumentRoot /var/www/quickserve
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/private.key
    
    # Include all directives from HTTP version
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name quickserve.com www.quickserve.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name quickserve.com www.quickserve.com;
    
    root /var/www/quickserve;
    index index.html;
    
    # SSL Configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy (if backend is separate)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 3: Docker Deployment

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if available)
# COPY certs/ /etc/nginx/certs/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    restart: unless-stopped
    
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    
  database:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=quickserve
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale frontend=3

# Update services
docker-compose pull
docker-compose up -d
```

### Option 4: Cloud Deployment (AWS)

#### AWS S3 + CloudFront

```bash
# Install AWS CLI
aws configure

# Create S3 bucket
aws s3 mb s3://quickserve-prod

# Enable static website hosting
aws s3 website s3://quickserve-prod \
    --index-document index.html \
    --error-document index.html

# Upload files
aws s3 sync dist/ s3://quickserve-prod

# Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

#### CloudFront Configuration

```json
{
    "CallerReference": "quickserve-prod-1",
    "Comment": "QuickServe Production Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-quickserve-prod",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {"Forward": "none"}
        },
        "Compress": true,
        "DefaultTTL": 86400
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-quickserve-prod",
                "DomainName": "quickserve-prod.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_All"
}
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
API_BASE_URL=https://api.quickserve.com/v1
PAYMENT_GATEWAY_KEY=pk_live_...
PAYMENT_GATEWAY_SECRET=sk_live_...
ANALYTICS_ID=GA-XXXXXXXXXX
SENTRY_DSN=https://...@sentry.io/...
CDN_URL=https://cdn.quickserve.com
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/quickserve
JWT_SECRET=your-super-secret-jwt-key
EMAIL_SERVICE_KEY=sg_...
SMS_SERVICE_KEY=...
ADMIN_EMAIL=admin@quickserve.com
SUPPORT_EMAIL=support@quickserve.com
```

### SSL Certificate Setup

```bash
# Using Let's Encrypt with Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d quickserve.com -d www.quickserve.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Analytics

### Performance Monitoring

```javascript
// Add to index.html
<script>
// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'GA-XXXXXXXXXX', 'auto');
ga('send', 'pageview');

// Performance tracking
window.addEventListener('load', function() {
    setTimeout(function() {
        const perfData = performance.getEntriesByType('navigation')[0];
        ga('send', 'timing', 'Page Load', 'Load Time', Math.round(perfData.loadEventEnd - perfData.navigationStart));
    }, 0);
});
</script>
```

### Error Tracking with Sentry

```javascript
// Add to main application
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
        new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,
});
```

### Health Check Endpoint

```javascript
// Health check service
class HealthCheckService {
    static async checkHealth() {
        const checks = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            version: '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            services: {}
        };

        // Check database
        try {
            await database.ping();
            checks.services.database = 'healthy';
        } catch (error) {
            checks.services.database = 'unhealthy';
            checks.status = 'degraded';
        }

        // Check Redis
        try {
            await redis.ping();
            checks.services.redis = 'healthy';
        } catch (error) {
            checks.services.redis = 'unhealthy';
            checks.status = 'degraded';
        }

        return checks;
    }
}

// Health endpoint
app.get('/health', async (req, res) => {
    const health = await HealthCheckService.checkHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      # Deploy to Netlify
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
      
      # Notify Slack
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🔐 Security Hardening

### Security Headers

```javascript
// security-headers.js
module.exports = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // HTTPS enforcement
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.quickserve.com"
    ].join('; '));
    
    next();
};
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);
```

## 📈 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer

# Add to package.json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/static/js/*.js"
  }
}

# Run analysis
npm run analyze
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci && npm run build
      - run: npm install -g @lhci/cli@0.9.x
      - run: lhci autorun
```

### Performance Budget

```json
{
  "budget": [
    {
      "type": "bundle",
      "name": "bundle",
      "baseline": "main",
      "maximumFileSizeByte": 170000,
      "maximumPercentIncrease": 20
    },
    {
      "type": "initial",
      "maximumFileSizeByte": 300000,
      "maximumPercentIncrease": 20
    }
  ]
}
```

## 🚨 Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump quickserve_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Files backup
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/quickserve

# Upload to S3
aws s3 cp backup_*.sql s3://quickserve-backups/
aws s3 cp files_backup_*.tar.gz s3://quickserve-backups/

# Cleanup old backups (keep last 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
find . -name "files_backup_*.tar.gz" -mtime +30 -delete
```

### Rollback Plan

```bash
#!/bin/bash
# rollback.sh

echo "Starting rollback process..."

# Stop current deployment
docker-compose down

# Restore previous version
git checkout HEAD~1
docker-compose up -d

# Verify rollback
curl -f http://localhost/health || exit 1

echo "Rollback completed successfully"
```

## 📞 Post-Deployment Checklist

### ✅ Immediate Verification

- [ ] Application loads without errors
- [ ] All critical features working
- [ ] SSL certificate valid
- [ ] Performance metrics acceptable
- [ ] Database connections stable
- [ ] Payment processing functional

### ✅ 24-Hour Monitoring

- [ ] Error rates within normal range
- [ ] Response times acceptable
- [ ] Server resources healthy
- [ ] User feedback positive
- [ ] Business metrics tracking

### ✅ Weekly Review

- [ ] Performance trends analysis
- [ ] Security audit results
- [ ] User behavior analytics
- [ ] System capacity planning
- [ ] Backup verification

## 📞 Support & Maintenance

### Production Support Team

- **DevOps Engineer**: Infrastructure and deployment
- **Backend Developer**: API and database issues
- **Frontend Developer**: UI and user experience
- **QA Engineer**: Testing and quality assurance
- **Product Manager**: Business requirements and priorities

### Emergency Contacts

- **Primary On-Call**: +91-XXXX-XXXX-XX1
- **Secondary On-Call**: +91-XXXX-XXXX-XX2
- **DevOps Team**: <devops@quickserve.com>
- **CTO**: <cto@quickserve.com>

### Escalation Matrix

1. **Level 1**: Frontend issues, minor bugs
2. **Level 2**: Backend API issues, performance problems
3. **Level 3**: Database issues, security incidents
4. **Level 4**: Complete system outage, data breach

---

**Deployment completed successfully! 🎉**

**Production URL**: <https://quickserve.com>
**Admin Panel**: <https://quickserve.com/admin>
**API Documentation**: <https://api.quickserve.com/docs>
**Status Page**: <https://status.quickserve.com>

---

## Supabase + Vercel (Static Frontend)

- Configure `config.js` with your public runtime values:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - (Optional) `API_BASE_URL` if you keep any HTTP endpoints
- Ensure the following files are deployed: `index.html`, `config.js`, `js/**`, `assets/**`.
- Vercel steps:
  - Create a new Vercel project from this repository
  - Framework preset: “Other” (static)
  - Build Command: none (static)
  - Output Directory: `/` (root)
  - Alternatively, place `config.js` as a Project File and edit in the Vercel web editor after first deploy
- Supabase DB: run the SQL from `SUPABASE_INTEGRATION.md` in the SQL editor
- Test:
  - Load the site on Vercel URL
  - Open devtools console, confirm “Supabase integration enabled”
  - Try registering/logging in (email/password)
