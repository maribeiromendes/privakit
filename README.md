# 🛡️ Privakit

**A comprehensive TypeScript/JavaScript library for handling Personally Identifiable Information (PII) with privacy-first design principles.**

Privakit provides enterprise-grade tools for **detecting**, **validating**, **masking**, **redacting**, and **managing** personal data in compliance with GDPR, CCPA, and other privacy regulations.

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

  

## ✨ Key Features

-   🔍 **Smart PII Detection** - Automatically find 17+ types of PII in text using NLP and pattern matching
-   ✅ **Robust Validation** - Validate emails, phones, names, and addresses with international support
-   🎭 **Safe Masking** - Display-safe concealment while preserving usability
-   🚫 **Secure Redaction** - Complete removal for logging and archival
-   ⚖️ **Policy Engine** - GDPR/CCPA compliance automation with audit trails
-   🔧 **Data Normalization** - Standardize formats across locales and providers
-   🌐 **Zero Dependencies** - No external API calls, completely local processing
-   📦 **Tree Shakable** - Import only what you need for optimal bundle size

## 🚀 Quick Start

[//]:  ### Installation

[//]:  ```bash
[//]:  npm install privakit # or yarn add privakit # or pnpm add privakit
[//]:  ```

### Basic Usage

```typescript
import { detectPII, maskPII, createPolicyEngine } from 'privakit';// Detect PII in textconst text = "Contact John Doe at john@example.com or call (555) 123-4567";const detection = detectPII(text);console.log(detection.hasPII);           // trueconsole.log(detection.detectedTypes);    // ['name', 'email', 'phone']// Apply safe masking for displayconst maskedEmail = maskPII('john@example.com', 'email');console.log(maskedEmail.masked);         // "j***@example.com"// GDPR-compliant policy enforcementconst gdprEngine = createPolicyEngine('gdpr');const decision = gdprEngine.evaluate('email', 'log');console.log(decision.allowed);           // false (protects by default)
```

## 🏗️ What is PII and Why It Matters

**Personally Identifiable Information (PII)** is any data that can identify, contact, or locate an individual. This includes:

-   **Direct identifiers**: Names, emails, phone numbers, SSNs, addresses
-   **Digital footprints**: IP addresses, device IDs, online accounts
-   **Financial data**: Credit cards, bank accounts, payment information
-   **Behavioral data**: Location history, browsing patterns, preferences

### Why PII Protection is Critical

1.  **Legal Compliance** 📚
    
    -   **GDPR**: €20M+ fines for violations
    -   **CCPA**: $7,500 per violation
    -   **HIPAA**, **SOX**, **PCI DSS** requirements
2.  **Security Risks** 🔒
    
    -   Data breaches affecting millions
    -   Identity theft and fraud
    -   Social engineering attacks
3.  **Business Impact** 💼
    
    -   Customer trust and retention
    -   Reputation management
    -   Competitive advantage

## 🔧 Core Modules

Module

Purpose

Key Features

**[Detection](./docs/detection.md)**

Find PII in text

17+ PII types, NLP-powered, confidence scoring

**[Validation](./docs/validation.md)**

Verify PII correctness

International support, custom rules, batch processing

**[Masking](./docs/masking.md)**

Hide PII safely

Preserve usability, configurable visibility, role-based

**[Redaction](./docs/redaction.md)**

Remove PII completely

Logging safety, middleware, audit trails

**[Policy Engine](./docs/policy-engine.md)**

Automate compliance

GDPR/CCPA ready, risk-based rules, audit logging

**[Normalization](./docs/normalization.md)**

Standardize formats

Locale-aware, provider-specific, consistent data

## 📖 Comprehensive Documentation

-   📚 **[Full Documentation](./docs/README.md)** - Complete API reference and guides
-   🚀 **[Quick Start Guide](./docs/quick-start.md)** - Get up and running in minutes
-   🏗️ **[Core Concepts](./docs/core-concepts.md)** - Understanding PII and privacy principles
-   ⚙️ **[Installation Guide](./docs/installation.md)** - Setup for different environments
-   🔗 **[Integration Examples](./docs/examples/)** - Real-world usage patterns
-   🇧🇷 **[LGPD Guide (Brazil)](./docs/lgpd-brazil.md)** - Brazilian data protection compliance

## 🛡️ Privacy & Security First

Privakit is built with **privacy by design** principles:

### ✅ Complete Privacy Protection

-   **No telemetry or tracking** - Zero data collection
-   **Local processing only** - No external API calls or network requests
-   **No data retention** - Stateless processing, no persistent storage
-   **Secure by default** - Conservative privacy settings out-of-the-box

### ✅ Enterprise Security

-   **Memory safe** - Automatic cleanup of sensitive data
-   **Error safe** - No PII leaked in error messages or logs
-   **Audit ready** - Comprehensive logging and compliance reporting
-   **Deterministic** - Consistent, predictable results

### ✅ Compliance Ready

-   **GDPR Article 25** - Privacy by design and by default
-   **CCPA Section 1798.100** - Consumer privacy rights
-   **ISO 27001** - Information security management
-   **SOC 2 Type II** - Security, availability, and confidentiality

## 🌐 Third-Party Dependencies

Privakit uses carefully selected, privacy-respecting dependencies:

Library

Version

License

Purpose

Privacy Impact

**[validator.js](https://github.com/validatorjs/validator.js)**

^13.12.0

MIT

Email validation

✅ Client-side only, no network calls

**[libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js)**

^1.11.19

MIT

Phone number validation

✅ Local processing, Google's offline data

**[compromise](https://github.com/spencermountain/compromise)**

^14.14.4

MIT

NLP for name detection

✅ Pure JavaScript, no remote API

### Why These Dependencies Are Safe

1.  **No Network Activity**: All processing happens locally
2.  **Open Source**: Full transparency, auditable code
3.  **Established Libraries**: Well-maintained, widely used
4.  **MIT Licensed**: Compatible with commercial use
5.  **Privacy Focused**: No tracking or data collection

## 🎯 Real-World Examples

### Form Validation with Privacy

```typescript
import { validateEmail, validatePhone, createPolicyEngine } from 'privakit';async function handleUserRegistration(formData: any) {  const policy = createPolicyEngine('gdpr');    // Validate email  const emailResult = validateEmail(formData.email);  if (!emailResult.isValid) {    throw new Error('Invalid email format');  }    // Check if processing is allowed  const emailDecision = policy.evaluate('email', 'store');  if (!emailDecision.allowed) {    throw new Error('Email processing not permitted');  }    // Safely store with encryption (as required by policy)  if (emailDecision.requiresEncryption) {    formData.email = await encryptPII(emailResult.normalized);  }    return saveUser(formData);}
```

### Log Sanitization

```typescript
import { createSafeLogger } from 'privakit';// Create PII-safe loggerconst logger = createSafeLogger({  replacement: '[REDACTED]',  strictMode: true});// All PII automatically redactedlogger.log('User john@example.com failed login from 192.168.1.100');// Output: "User [REDACTED] failed login from [REDACTED]"
```

### Content Moderation

```typescript
import { detectPII, processPII } from 'privakit';function moderateUserContent(content: string) {  const result = processPII(content, {    policy: createPolicyEngine('strict')  });    if (result.policyViolations.length > 0) {    return {      approved: false,      reason: 'Contains sensitive information',      safeMasked: result.masked  // Safe version for review    };  }    return { approved: true, content };}
```

## 🔄 Migration and Integration

### From Other Libraries

```typescript
// Migrating from custom validation// Before:const isValidEmail = (email) => /S+@S+.S+/.test(email);// After:import { validateEmail } from 'privakit';const emailResult = validateEmail(email);const isValidEmail = emailResult.isValid;
```

### Framework Integration

Privakit works seamlessly with all major frameworks:

#### React/Next.js

```typescript
import { detectPII, maskPII } from 'privakit';function UserProfile({ user }) {  const maskedEmail = maskPII(user.email, 'email').masked;    return (    <div>      <span>{maskedEmail}</span>    </div>  );}
```

#### Vue.js/Nuxt

```vue
<script setup>import { detectPII, maskPII } from 'privakit';const email = ref('user@example.com');const maskedEmail = computed(() => maskPII(email.value, 'email').masked);</script>
```

#### Angular

```typescript
import { detectPII, maskPII } from 'privakit';@Component({...})export class UserComponent {  getMaskedEmail(email: string) {    return maskPII(email, 'email').masked;  }}
```

#### Node.js/Express

```typescript
import { createRedactionMiddleware } from 'privakit';app.use(createRedactionMiddleware({  strictMode: process.env.NODE_ENV === 'production'}));
```

**📖 [Complete Framework Guide](./docs/framework-integration.md)** - Detailed integration examples for React, Vue, Angular, Svelte, Next.js, Nuxt, and more.

## 📊 Performance & Bundle Size

-   **Core library**: ~50KB gzipped
-   **Tree-shakeable**: Import only what you need
-   **Zero runtime dependencies**: All deps are for validation/NLP
-   **Memory efficient**: No data retention between calls
-   **Fast processing**: Optimized regex and NLP pipelines

```typescript
// Minimal import for bundle optimizationimport { validateEmail } from 'privakit/validate/email';import { maskEmail } from 'privakit/mask';// Only email validation and masking included in bundle
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development

```bash
git clone https://github.com/yourusername/privakit.gitcd privakitnpm installnpm run dev     # Start development modenpm test        # Run test suitenpm run build   # Build for production
```

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔒 Security

For security issues, please report them privately via the [GitHub security tab](https://github.com/yourusername/privakit/security/advisories).

## SonarCloud Badges

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=bugs)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=coverage)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=sqale_index)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=maribeiromendes_privakit&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=maribeiromendes_privakit)

## 🌟 Sponsors

Privakit development is supported by organizations who prioritize privacy:

-   [Your Company Here] - Supporting privacy-first development

---

**Built with ❤️ for developers who care about privacy.**

*Privakit - Making PII protection simple, automatic, and compliant.*
