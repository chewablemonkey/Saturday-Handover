# 🚀 Deployment Guide for Synergy Project Management Platform

This guide provides multiple options for deploying the Synergy Project Management Platform to Cloudflare Pages.

## 📋 Prerequisites

- Cloudflare account
- GitHub account (for automatic deployments)
- Node.js 18+ installed locally

## 🎯 Option 1: GitHub Integration (Recommended)

### 1. Push to GitHub
Your code is already in the GitHub repository:
- **Repository**: https://github.com/chewablemonkey/Saturday-Handover
- **Branch**: `feature/ux-improvements`

### 2. Set up Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your GitHub repository: `Saturday-Handover`
6. Configure the build settings:
   - **Framework preset**: `React`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty if whole repo)

### 3. Environment Variables (if needed)
If using AI features, set in Cloudflare Pages:
- `GEMINI_API_KEY`: Your Gemini API key

### 4. Custom Domain (Optional)
- Go to **Custom domains** tab in your Pages project
- Add your custom domain
- Follow DNS configuration instructions

## 🎯 Option 2: Wrangler CLI Deployment

### 1. Install Wrangler
```bash
npm install -g wrangler
```

### 2. Authenticate
```bash
wrangler login
```

### 3. Deploy
```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name="synergy-project-management"
```

## 🎯 Option 3: Manual Upload

### 1. Build the Project
```bash
npm install
npm run build
```

### 2. Create Pages Project
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages**
3. Click **Create a project**
4. Choose **Upload assets**
5. Name your project: `synergy-project-management`

### 3. Upload Files
- Zip the contents of the `dist` folder
- Upload the zip file
- Deploy

## 📁 Build Output Structure

After running `npm run build`, the `dist` folder contains:
```
dist/
├── index.html           # Main HTML file
├── _redirects          # SPA routing rules
└── assets/
    ├── index-[hash].css # Compiled CSS
    └── index-[hash].js  # Compiled JavaScript
```

## 🔧 Configuration Files

### wrangler.toml
```toml
name = "synergy-project-management"
compatibility_date = "2024-08-17"
send_metrics = false
```

### _redirects (for SPA routing)
```
/*    /index.html   200
```

## 🚀 Automatic Deployment

The project includes GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:
1. Builds the project on every push to main/feature branches
2. Deploys to Cloudflare Pages
3. Requires these GitHub repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

## 📊 Features Available After Deployment

✅ **Kanban Board** - Full drag-and-drop functionality
✅ **Task Management** - Create, edit, delete tasks
✅ **Analytics Dashboard** - Project insights and metrics
✅ **AI Suggestions** - Intelligent project analysis
✅ **Team Management** - User management in settings
✅ **Responsive Design** - Works on all devices
✅ **Professional UI** - Modern, business-ready interface

## 🔗 Expected URLs

After deployment, your app will be available at:
- **Cloudflare Pages URL**: `https://synergy-project-management.pages.dev`
- **Custom Domain**: Your configured domain (if set up)

## 🐛 Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Run `npm ci` for clean dependency install
- Check for TypeScript errors: `npm run build`

### Deployment Issues
- Verify Cloudflare account permissions
- Check API token permissions include Pages:Write
- Ensure build output directory is set to `dist`

### Runtime Issues
- Check browser console for errors
- Verify all routes work (SPA routing with _redirects)
- Test responsive design on different devices

## 🎉 Success!

Once deployed, your professional project management platform will be live with:
- Modern, responsive design
- Full functionality across all components
- Production-ready performance
- Professional appearance suitable for business use

For any issues, check the build logs in Cloudflare Pages dashboard or GitHub Actions.