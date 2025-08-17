# Core Concepts

Understanding Privakit's fundamental concepts will help you use the library effectively and build privacy-compliant applications.

## 🔐 What is PII (Personally Identifiable Information)?

**PII** is any information that can be used to identify, contact, or locate a specific individual. This includes:

### Direct Identifiers

- **Names**: John Doe, Jane Smith
- **Email addresses**: user@example.com
- **Phone numbers**: +1-555-123-4567
- **Social Security Numbers**: 123-45-6789
- **Addresses**: 123 Main St, Anytown, ST 12345

### Indirect Identifiers

- **IP addresses**: 192.168.1.1
- **Device IDs**: Unique device fingerprints
- **Location data**: GPS coordinates, ZIP codes
- **Biometric data**: Fingerprints, facial recognition data

### Why PII Protection Matters

1. **Legal Compliance**: GDPR, CCPA, HIPAA requirements
2. **Security**: Prevent data breaches and identity theft
3. **Trust**: Build customer confidence in your application
4. **Business Risk**: Avoid fines and reputation damage

## 🏗️ Privakit Architecture

Privakit follows a **modular architecture** with six core modules:

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│                    Privakit Library                     │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│Validation│Detection │ Masking  │Redaction │Policy Engine │
│   📝     │    🔍    │    🎭    │    🚫    │      ⚖️      │
├──────────┴──────────┴──────────┴──────────┴──────────────┤
│                  Normalization 🔧                       │
├─────────────────────────────────────────────────────────┤
│              Core Types & Errors 🎯                     │
└─────────────────────────────────────────────────────────┘
```

### Module Overview

| Module               | Purpose                | When to Use                    |
| -------------------- | ---------------------- | ------------------------------ |
| **Validation** 📝    | Verify PII correctness | Form validation, data entry    |
| **Detection** 🔍     | Find PII in text       | Log scanning, content analysis |
| **Masking** 🎭       | Hide PII for display   | UI display, debugging          |
| **Redaction** 🚫     | Remove PII completely  | Logging, archival              |
| **Normalization** 🔧 | Standardize formats    | Data storage, comparison       |
| **Policy Engine** ⚖️ | Enforce compliance     | Automated governance           |

## 🎯 Core Types

### PII Types

Privakit supports 17+ PII types:

```typescript
enum PIIType {
  Email = "email",
  Phone = "phone",
  Name = "name",
  Address = "address",
  SSN = "ssn",
  CreditCard = "creditcard",
  IPAddress = "ip",
  URL = "url",
  ZipCode = "zipcode",
  NationalID = "nationalid",
  DateOfBirth = "dateofbirth",
  IBAN = "iban",
  VAT = "vat",
  // ... and more
}
```

### Risk Levels

Each PII type has an associated risk level:

```typescript
enum RiskLevel {
  Low = "low", // ZIP codes, general locations
  Moderate = "moderate", // Email addresses, phone numbers
  High = "high", // Full names, detailed addresses
  Critical = "critical", // SSNs, credit cards, medical data
}
```

### Confidence Levels

Detection results include confidence scoring:

```typescript
enum ConfidenceLevel {
  Low = "low", // 30% - Might be PII
  Medium = "medium", // 50% - Likely PII
  High = "high", // 70% - Very likely PII
  VeryHigh = "very_high", // 90% - Almost certainly PII
}
```

## 🔄 PII Processing Pipeline

Privakit follows a standard pipeline for processing PII:

```
Input Text
    ↓
1. Detection 🔍
    ↓
2. Policy Check ⚖️
    ↓
3. Processing (Validation/Normalization/Masking/Redaction)
    ↓
Output (Safe/Compliant)
```

### Example Pipeline

```typescript
import { processPII, createPolicyEngine } from "privakit";

const text = "Contact John Doe at john@example.com";
const policyEngine = createPolicyEngine("gdpr");

const result = processPII(text, {
  policy: policyEngine,
});

console.log(result.detection.hasPII); // true
console.log(result.detection.detectedTypes); // ['name', 'email']
console.log(result.masked); // "Contact J*** D*** at j***@example.com"
console.log(result.redacted); // "Contact [REDACTED] at [REDACTED]"
console.log(result.policyViolations); // Array of compliance issues
```

## 🛡️ Privacy by Design Principles

Privakit implements **Privacy by Design** principles:

### 1. Proactive not Reactive

```typescript
// ✅ Automatically enforces privacy rules
const gdprEngine = createPolicyEngine("gdpr");
const decision = gdprEngine.evaluate("email", "log");
// Prevents privacy violations before they happen
```

### 2. Privacy as the Default

```typescript
// ✅ Conservative defaults
const masked = maskEmail("user@example.com");
// Default: 'u***@example.com' (safe for display)

// ✅ Strict policy by default
const processor = createPIIProcessor({ strictMode: true });
```

### 3. Privacy Embedded into Design

```typescript
// ✅ Privacy controls built into every function
validateEmail("user@example.com", {
  allowDisplayName: false, // Privacy setting
  domainSpecificValidation: true,
});
```

### 4. Full Functionality

```typescript
// ✅ Complete feature set without compromising privacy
const result = processPII(text, {
  detection: { enableNLP: true }, // Full detection capability
  masking: { preserveLength: true }, // Functional masking
  policy: gdprEngine, // Full compliance
});
```

### 5. End-to-End Security

```typescript
// ✅ Secure throughout the entire process
// - No network calls (local processing)
// - No data retention (stateless)
// - No telemetry (private by default)
// - Secure error handling (no data leaks)
```

### 6. Visibility and Transparency

```typescript
// ✅ Clear audit trails
const auditLog = gdprEngine.getAuditLog();
console.log(auditLog); // Full decision history

// ✅ Detailed results
const detection = detectPII(text, { includeContext: true });
console.log(detection.spans); // Exact locations and confidence
```

### 7. Respect for User Privacy

```typescript
// ✅ User control over their data
const processor = createPIIProcessor({
  maskingOptions: {
    preserveLength: true, // Maintain usability
    visibleStart: 1, // User-configurable visibility
    visibleEnd: 1,
  },
});
```

## 📊 Confidence and Quality

### Detection Confidence

```typescript
const detection = detectPII("Email: user@example.com");

detection.spans.forEach((span) => {
  console.log(`Found ${span.type} with ${span.confidence} confidence`);
  // "Found email with high confidence"
});
```

### Validation Quality

```typescript
const emailResult = validateEmail("user@example.com");

console.log(emailResult.isValid); // true/false
console.log(emailResult.errors); // Detailed error list
console.log(emailResult.metadata); // Additional context
```

### Error Handling

```typescript
import { isPrivakitError, getErrorInfo } from "privakit";

try {
  validateEmail(invalidInput);
} catch (error) {
  if (isPrivakitError(error)) {
    console.log("Privakit error:", error.code);
    console.log("Details:", error.metadata);
  } else {
    console.log("Other error:", getErrorInfo(error));
  }
}
```

## 🌐 Internationalization

### Locale-Aware Processing

```typescript
import { createPhoneOptionsFromLocale } from "privakit";

const localeContext = {
  country: "US",
  language: "en",
  timezone: "America/New_York",
};

const phoneOptions = createPhoneOptionsFromLocale(localeContext);
const result = validatePhone("+1-555-123-4567", phoneOptions);
```

### Multi-Language Support

```typescript
// Names in different languages
validateName("José María García"); // Spanish
validateName("François Müller"); // French/German
validateName("田中太郎"); // Japanese
```

## 🔧 Customization and Extension

### Custom Patterns

```typescript
import { addPIIPattern, PIIType } from "privakit";

// Add custom employee ID pattern
addPIIPattern({
  type: PIIType.NationalID,
  regex: /EMP-\d{6}/g,
  description: "Company employee IDs",
  riskLevel: "moderate",
});
```

### Custom Policies

```typescript
import { PolicyEngine } from "privakit";

const customEngine = new PolicyEngine(
  [
    {
      type: PIIType.Email,
      riskLevel: "high",
      allowLogging: false,
      requireMasking: true,
      requireEncryption: true,
      retentionDays: 365,
      allowedOperations: ["store", "process"],
    },
  ],
  true,
); // strict mode
```

## 🎯 Best Practices

### 1. Use Appropriate Risk Levels

```typescript
// ✅ Match risk to data sensitivity
const corporateProcessor = createPIIProcessor({
  policyEngine: createPolicyEngine("gdpr"), // High-risk environments
});

const internalProcessor = createPIIProcessor({
  policyEngine: createPolicyEngine("permissive"), // Development/testing
});
```

### 2. Implement Defense in Depth

```typescript
// ✅ Multiple layers of protection
const text = getUserInput();

// Layer 1: Detection
const detection = detectPII(text);

// Layer 2: Policy check
const policyDecision = policyEngine.evaluate(
  detection.detectedTypes[0],
  "store",
);

// Layer 3: Appropriate handling
if (policyDecision.requiresEncryption) {
  // Encrypt before storage
} else if (policyDecision.requiresMasking) {
  // Mask for display
} else if (!policyDecision.allowed) {
  // Reject operation
}
```

### 3. Regular Validation

```typescript
// ✅ Validate at multiple points
const email = userInput.email;

// Input validation
const inputValidation = validateEmail(email);
if (!inputValidation.isValid) {
  throw new Error("Invalid email format");
}

// Pre-storage validation
const storageValidation = validateEmail(normalizeEmail(email));
if (!storageValidation.isValid) {
  throw new Error("Cannot store malformed email");
}
```

### 4. Audit and Monitor

```typescript
// ✅ Track PII operations
const processor = createPIIProcessor({
  policyEngine: createPolicyEngine("gdpr", { auditMode: true }),
});

// Regular audit reviews
const auditLog = processor.policyEngine.getAuditLog();
auditLog.forEach((entry) => {
  if (!entry.decision.allowed) {
    console.warn("Policy violation:", entry);
  }
});
```

## 🔄 Data Lifecycle Management

### Collection → Processing → Storage → Deletion

```typescript
// 1. Collection: Validate input
const email = validateEmail(userInput.email);
if (!email.isValid) return;

// 2. Processing: Normalize format
const normalized = normalizeEmail(email.value);

// 3. Storage: Check retention policy
const rule = policyEngine.getRuleForType("email");
const expiryDate = new Date();
expiryDate.setDate(expiryDate.getDate() + rule.retentionDays);

// 4. Deletion: Automatic cleanup based on policy
if (rule.retentionDays && dataAge > rule.retentionDays) {
  // Trigger deletion process
}
```

---

**Next Steps:**

- 🚀 **Get started**: [Quick Start Guide](./quick-start.md)
- 📖 **Learn validation**: [Validation Documentation](./validation.md)
- 🔍 **Explore detection**: [Detection Documentation](./detection.md)
