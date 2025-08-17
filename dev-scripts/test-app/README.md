# 🧪 Privakit Test App

Interactive Vue.js application for testing and demonstrating all privakit functionality.

## 🌐 Live Demo

**[Try it online →](https://maribeiromendes.github.io/privakit/)**

The test app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## 🚀 Local Development

```bash
# From project root
npm run dev:test-app

# Or manually
cd dev-scripts/test-app
npm install
npm run dev
```

## 📦 Deployment

The test app includes configuration files for multiple deployment platforms:

### GitHub Pages (Current)
- Automatically deployed via GitHub Actions
- URL: `https://maribeiromendes.github.io/privakit/`
- Triggers on changes to test app or privakit source

### Vercel
```bash
cd dev-scripts/test-app
vercel --prod
```

### Netlify
```bash
cd dev-scripts/test-app
netlify deploy --prod --dir=dist
```

## 🛠️ Configuration Files

- `vercel.json` - Vercel deployment configuration
- `netlify.toml` - Netlify deployment configuration  
- `public/_redirects` - SPA routing fallback
- `vite.config.js` - Build configuration with GitHub Pages support

## ✨ Features

- **Real-time PII Testing** - Interactive forms for all privakit functions
- **Visual Results** - Color-coded JSON output with success/error states
- **Educational Content** - Built-in usage guides and examples
- **Compliance Testing** - Test against 6 major privacy regulations
- **Locale Testing** - International validation with honest implementation status
- **Live Documentation** - Links to official privacy regulation texts

## 🤝 Contributing

Help improve the test app:
- Test with real-world data and report issues
- Suggest new features or UI improvements
- Contribute additional test scenarios
- Help with documentation and examples

See the main [README](../../README.md) for more information.