# Installation & Setup

This guide will help you install and configure Privakit in your TypeScript/JavaScript project.

## 📦 Installation

### npm

```bash
npm install privakit
```

### yarn

```bash
yarn add privakit
```

### pnpm

```bash
pnpm add privakit
```

## 🔧 Basic Setup

### TypeScript Project

```typescript
// ESM import (recommended)
import { validateEmail, detectPII, maskPII } from "privakit";

// Or import everything
import * as Privakit from "privakit";

// Or use default export for common functions
import Privakit from "privakit";
const result = Privakit.validateEmail("user@example.com");
```

### JavaScript Project

```javascript
// ESM (Node.js 14+)
import { validateEmail, detectPII } from "privakit";

// CommonJS
const { validateEmail, detectPII } = require("privakit");
```

### Browser (ES Modules)

```html
<!-- Via CDN (not recommended for production) -->
<script type="module">
  import { detectPII } from "https://unpkg.com/privakit@latest/dist/index.esm.js";

  const result = detectPII("Contact: user@example.com");
  console.log(result.hasPII); // true
</script>
```

## 📋 Requirements

### Runtime Requirements

- **Node.js**: 16.0.0 or higher
- **Browser**: ES2020 support (Chrome 80+, Firefox 72+, Safari 13.1+)

### TypeScript Support

- **TypeScript**: 4.5+ (included type definitions)
- **ESM/CommonJS**: Both module systems supported
- **Tree Shaking**: Full support for optimized bundles

## 🔍 Verify Installation

Create a test file to verify everything works:

```typescript
// test-privakit.ts
import { validateEmail, detectPII, VERSION } from "privakit";

console.log("Privakit version:", VERSION);

// Test email validation
const emailResult = validateEmail("test@example.com");
console.log("Email valid:", emailResult.isValid);

// Test PII detection
const text = "My email is user@domain.com";
const detection = detectPII(text);
console.log("Found PII:", detection.hasPII);
console.log("PII types:", detection.detectedTypes);
```

Run the test:

```bash
npx tsx test-privakit.ts
# or
node test-privakit.js
```

Expected output:

```
Privakit version: 0.1.0
Email valid: true
Found PII: true
PII types: ['email']
```

## ⚙️ Configuration Options

### Basic Configuration

```typescript
import { createPIIProcessor } from "privakit";

// Create a configured processor
const processor = createPIIProcessor({
  // Detection settings
  detectionOptions: {
    confidenceThreshold: 0.8,
    enableNLP: true,
    maxTextLength: 10000,
  },

  // Masking preferences
  maskingOptions: {
    maskChar: "*",
    preserveLength: true,
  },

  // Policy compliance
  strictMode: true, // Enable GDPR-like strict policies
});
```

### Environment-Specific Setup

#### Development Environment

```typescript
import { createPolicyEngine } from "privakit";

// Permissive for development
const devProcessor = createPIIProcessor({
  policyEngine: createPolicyEngine("permissive"),
  strictMode: false,
});
```

#### Production Environment

```typescript
// Strict compliance for production
const prodProcessor = createPIIProcessor({
  policyEngine: createPolicyEngine("gdpr"), // or 'ccpa'
  strictMode: true,
  detectionOptions: {
    confidenceThreshold: 0.9, // Higher confidence in production
  },
});
```

## 🌐 Framework Integration

### React/Next.js

```typescript
// hooks/usePIIProcessor.ts
import { useMemo } from 'react';
import { createPIIProcessor } from 'privakit';

export function usePIIProcessor(options = {}) {
  return useMemo(() => createPIIProcessor({
    strictMode: process.env.NODE_ENV === 'production',
    ...options
  }), [options]);
}

// components/SafeDisplay.tsx
import { usePIIProcessor } from '../hooks/usePIIProcessor';

export function SafeDisplay({ text }: { text: string }) {
  const processor = usePIIProcessor();
  const result = processor.process(text);

  return <div>{result.masked}</div>;
}
```

### Express.js

```typescript
// middleware/pii-redaction.ts
import { createRedactionMiddleware } from "privakit";

// Apply to all routes
app.use(
  createRedactionMiddleware({
    replacement: "[REDACTED]",
    strictMode: true,
  }),
);
```

### Vue.js

```typescript
// plugins/privakit.ts
import { createPIIProcessor } from "privakit";

export default {
  install(app: App) {
    const processor = createPIIProcessor({
      strictMode: process.env.NODE_ENV === "production",
    });

    app.config.globalProperties.$pii = processor;
    app.provide("piiProcessor", processor);
  },
};
```

## 🔒 Security Considerations

### Local Processing Only

```typescript
// ✅ All processing happens locally
const result = detectPII(sensitiveText); // No network calls

// ✅ No telemetry or analytics
import { validateEmail } from "privakit"; // Zero tracking
```

### Secure Defaults

```typescript
// ✅ Conservative masking by default
const masked = maskEmail("user@example.com");
// Result: 'u***@example.com'

// ✅ Strict policy enforcement
const gdprEngine = createPolicyEngine("gdpr");
const decision = gdprEngine.evaluate("email", "log");
// Result: { allowed: false } - protects by default
```

### Memory Safety

```typescript
// ✅ Automatic cleanup of sensitive data
const processor = createPIIProcessor();
// Sensitive data is not retained between calls

// ✅ No persistent storage
const detection = detectPII(text);
// Original text is not stored internally
```

## 🧪 Development Tools

### Enable Debug Mode

```typescript
// For detailed logging during development
const processor = createPIIProcessor({
  detectionOptions: {
    includeContext: true, // Include context in detection results
    contextWindow: 20, // Characters around detected PII
  },
});
```

### Testing Integration

```typescript
// jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
};

// tests/setup.ts
import { createPolicyEngine } from "privakit";

// Use permissive policies for testing
global.testPolicyEngine = createPolicyEngine("permissive");
```

## 📦 Bundle Size Optimization

### Tree Shaking (Recommended)

```typescript
// Import only what you need
import { validateEmail } from "privakit/validate/email";
import { maskEmail } from "privakit/mask";

// Instead of importing everything
// import * as Privakit from 'privakit'; // Larger bundle
```

### Webpack Configuration

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false, // Privakit is side-effect free
  },
};
```

## ❌ Common Issues

### TypeScript Errors

**Issue**: Module not found

```
Error: Cannot find module 'privakit'
```

**Solution**: Check TypeScript configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Runtime Errors

**Issue**: Import/require errors in Node.js

```
SyntaxError: Cannot use import statement outside a module
```

**Solution**: Use appropriate import syntax

```javascript
// For CommonJS
const { validateEmail } = require("privakit");

// For ESM (package.json has "type": "module")
import { validateEmail } from "privakit";
```

### Performance Issues

**Issue**: Slow detection on large texts

```typescript
// ❌ Don't do this
const hugeTex = "x".repeat(1000000);
detectPII(hugeText); // May be slow
```

**Solution**: Use text length limits

```typescript
// ✅ Set reasonable limits
const detection = detectPII(text, {
  maxTextLength: 50000, // Adjust based on needs
});
```

## ✅ Next Steps

Now that Privakit is installed and configured:

1. 📖 **Learn the basics**: [Core Concepts](./core-concepts.md)
2. 🚀 **Start using it**: [Quick Start Guide](./quick-start.md)
3. 🔍 **Explore features**: [API Reference](./validation.md)

---

**Having issues?** Please [open an issue](https://github.com/maribeiromendes/privakit/issues) for support.
