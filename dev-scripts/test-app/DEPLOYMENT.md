# 🚀 Deployment Guide for Privakit Test App

This guide provides step-by-step instructions for deploying the privakit test app to various hosting platforms.

## 📋 Prerequisites

Before deploying, ensure you have:
- Git repository connected to your hosting platform
- Node.js 18+ installed locally
- The test app builds successfully locally

```bash
# Test local build
cd dev-scripts/test-app
npm install
npm run build
```

## 🌟 Recommended Platforms

### 1. **Vercel** (Recommended for Vue.js)

**Why Vercel:**
- Automatic Vite detection and configuration
- Zero-config deployments with Git integration
- Excellent Vue.js support
- Fast global CDN
- Free tier includes custom domains

**Deployment Steps:**

1. **Connect Repository**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel
   
   # Deploy from CLI
   cd dev-scripts/test-app
   vercel
   ```

2. **Or use Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub/GitLab repository
   - Select `dev-scripts/test-app` as root directory
   - Vercel auto-detects Vite configuration

3. **Configuration:**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

**✅ Configuration files included:**
- `vercel.json` - SPA routing & caching headers
- Ready to deploy!

### 2. **Netlify** (Great for JAMstack)

**Why Netlify:**
- Excellent static site hosting
- Built-in forms and analytics
- Strong community support
- Generous free tier

**Deployment Steps:**

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - "New site from Git" → Connect repository
   - Select `dev-scripts/test-app` as base directory

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (set in netlify.toml)

**✅ Configuration files included:**
- `netlify.toml` - Build settings & redirects
- `public/_redirects` - SPA fallback routing
- Ready to deploy!

### 3. **GitHub Pages** (Free with GitHub)

**Why GitHub Pages:**
- Free hosting for public repositories
- Direct integration with GitHub
- Simple workflow-based deployment

**Deployment Steps:**

1. **Create GitHub Actions Workflow**
   Create `.github/workflows/deploy.yml` in repository root:

```yaml
name: Deploy Test App to GitHub Pages

on:
  push:
    branches: [ main ]
    paths: [ 'dev-scripts/test-app/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'dev-scripts/test-app/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd dev-scripts/test-app
        npm ci
    
    - name: Build
      run: |
        cd dev-scripts/test-app
        npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: dev-scripts/test-app/dist
```

2. **Enable GitHub Pages**
   - Repository Settings → Pages
   - Source: GitHub Actions

## ⚙️ Build Configuration

The test app uses Vite with the following build setup:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Vite Configuration** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/', // Change for GitHub Pages: '/privakit/'
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
```

## 🔧 Platform-Specific Adjustments

### For GitHub Pages Subdirectory
If deploying to `username.github.io/privakit`, update `vite.config.js`:

```javascript
export default defineConfig({
  base: '/privakit/',
  // ... rest of config
})
```

### For Custom Domains
1. **Vercel:** Add domain in dashboard → Settings → Domains
2. **Netlify:** Add domain in dashboard → Domain settings
3. **GitHub Pages:** Add `CNAME` file in `public/` directory

## 📊 Performance Considerations

**Bundle Optimization:**
- Production build size: ~200KB gzipped
- Vue 3 + Vite provides excellent tree-shaking
- Static assets cached with long-term headers

**Caching Strategy:**
- HTML: No cache (dynamic routing)
- Assets: 1 year cache (immutable with hash)
- API calls: No cache (local processing only)

## 🔒 Security & Privacy

**Deployment Safety:**
- ✅ No server-side code required
- ✅ All PII processing happens client-side
- ✅ No external API calls or data transmission
- ✅ No user data stored or transmitted

## 🚦 Deployment Checklist

Before deploying to production:

- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify all features work in built version
- [ ] Check bundle size: `npx vite-bundle-analyzer dist`
- [ ] Test on mobile devices
- [ ] Verify no console errors
- [ ] Check accessibility with screen reader
- [ ] Test with slow network connection

## 🐛 Troubleshooting

**Common Issues:**

1. **404 on page refresh**
   - Ensure SPA redirects are configured (`_redirects` or `vercel.json`)

2. **Build fails**
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

3. **Assets not loading**
   - Check `base` configuration in `vite.config.js`
   - Verify build output directory is correct

4. **Blank page after deployment**
   - Check browser console for errors
   - Verify all dependencies are in `dependencies`, not `devDependencies`

## 📞 Support & Contributing

**Getting Help:**
- Check the [test app documentation](./dev-scripts/README.md)
- Review [privakit documentation](./docs/README.md)
- Open issues for deployment problems

**Contributing:**
- Test the deployed app and report issues
- Suggest improvements to deployment process
- Help maintain deployment configurations
- Share successful deployment experiences

---

## 🎯 Quick Deploy Commands

**Vercel:**
```bash
cd dev-scripts/test-app
npx vercel --prod
```

**Netlify:**
```bash
cd dev-scripts/test-app
npx netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
# Commit and push - GitHub Actions handles the rest
git add .
git commit -m "Deploy test app"
git push origin main
```

Choose the platform that best fits your needs and follow the corresponding guide above!