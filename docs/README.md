# Privakit Documentation

Welcome to the comprehensive documentation for **Privakit** - a TypeScript/JavaScript library for handling Personally Identifiable Information (PII) with privacy-first design principles.

## 📚 Documentation Structure

### Getting Started
- [Installation & Setup](./installation.md)
- [Quick Start Guide](./quick-start.md)
- [Core Concepts](./core-concepts.md)

### API Reference
- [Validation](./validation.md) - Email, phone, name, and address validation
- [Normalization](./normalization.md) - Standardizing PII formats
- [Detection](./detection.md) - Automatic PII detection in text
- [Masking](./masking.md) - Display-safe PII masking
- [Redaction](./redaction.md) - Secure removal for logging
- [Policy Engine](./policy-engine.md) - GDPR/CCPA compliance

### Regional Compliance
- 🇧🇷 [LGPD Guide (Brazil)](./lgpd-brazil.md) - Lei Geral de Proteção de Dados
- 🇪🇺 [GDPR Support](./policy-engine.md#gdpr-policy-engine) - European compliance
- 🇺🇸 [CCPA Support](./policy-engine.md#ccpa-policy-engine) - California privacy rights

## 🔗 Quick Navigation

| Module | Purpose | Key Features |
|--------|---------|-------------|
| [**Validation**](./validation.md) | Verify PII correctness | ✅ Email, phone, name validation<br>✅ International support<br>✅ Custom rules |
| [**Detection**](./detection.md) | Find PII in text | 🔍 17+ PII types<br>🔍 NLP-powered<br>🔍 Confidence scoring |
| [**Masking**](./masking.md) | Hide PII safely | 🎭 Preserve readability<br>🎭 Configurable visibility<br>🎭 Multiple formats |
| [**Redaction**](./redaction.md) | Remove PII completely | 🚫 Logging safety<br>🚫 Middleware support<br>🚫 Audit trails |
| [**Policy Engine**](./policy-engine.md) | Compliance automation | ⚖️ GDPR/CCPA ready<br>⚖️ Risk-based rules<br>⚖️ Audit logging |
| [**Normalization**](./normalization.md) | Standardize formats | 🔧 Consistent data<br>🔧 Locale-aware<br>🔧 Provider-specific |

## 🚀 Quick Example

```typescript
import { detectPII, maskPII, createPolicyEngine } from 'privakit';

// Detect PII in text
const text = "Contact John Doe at john@example.com";
const detection = detectPII(text);

// Apply GDPR-compliant masking
const policyEngine = createPolicyEngine('gdpr');
const decision = policyEngine.evaluate('email', 'display');

if (decision.requiresMasking) {
  const masked = maskPII('john@example.com', 'email');
  console.log(masked.masked); // "j***@example.com"
}
```

## 🛡️ Privacy & Security

Privakit is designed with **privacy by design** principles:

- ✅ **No telemetry** - Zero data collection
- ✅ **Local processing** - No external API calls
- ✅ **Deterministic** - Consistent, predictable results
- ✅ **Secure defaults** - Conservative privacy settings
- ✅ **Compliance ready** - GDPR/CCPA built-in

## 📞 Support

- 📖 **Documentation**: You're reading it!
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/privakit/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/privakit/discussions)
- 📧 **Email**: For sensitive security issues

---

**Next:** Start with [Installation & Setup](./installation.md) to get Privakit running in your project.