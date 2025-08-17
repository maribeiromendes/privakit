# Detection Module

The Detection module automatically identifies PII in text using advanced pattern matching, NLP techniques, and confidence scoring. It's essential for scanning content, logs, and user input for sensitive information.

## 🔍 Basic PII Detection

### Simple Detection

```typescript
import { detectPII } from "privakit";

const text = "Contact John Doe at john.doe@company.com or call (555) 123-4567";
const result = detectPII(text);

console.log(result.hasPII); // true
console.log(result.detectedTypes); // ['name', 'email', 'phone']
console.log(result.spans.length); // 3 (number of PII instances found)
console.log(result.confidence); // Overall confidence level
```

### Detection Results

```typescript
const result = detectPII("My SSN is 123-45-6789");

// Detailed span information
result.spans.forEach((span) => {
  console.log(`Found ${span.type} at position ${span.start}-${span.end}`);
  console.log(`Text: "${span.text}"`);
  console.log(`Confidence: ${span.confidence}`);
  console.log(`Metadata:`, span.metadata);
});

// Output:
// Found ssn at position 10-21
// Text: "123-45-6789"
// Confidence: high
// Metadata: { pattern: "US Social Security Numbers", riskLevel: "critical" }
```

## 🎯 Supported PII Types

Privakit detects 17+ types of PII with specialized patterns:

### Personal Identifiers

- **Email addresses**: RFC 5322 compliant detection
- **Phone numbers**: US and international formats
- **Names**: NLP-powered person name detection
- **Addresses**: Structured address components

### Government IDs

- **SSN**: US Social Security Numbers with validation
- **National IDs**: Extensible for different countries
- **Passport numbers**: Various international formats

### Financial Data

- **Credit cards**: Visa, MasterCard, Amex, Discover (with Luhn validation)
- **IBAN**: International bank account numbers
- **VAT numbers**: European tax identification

### Digital Identifiers

- **IP addresses**: IPv4 with validity checking
- **URLs**: Web addresses and domains
- **Device IDs**: Various device fingerprints

### Location Data

- **ZIP codes**: US postal codes
- **Postal codes**: International formats
- **Geographic coordinates**: Lat/long pairs

## ⚙️ Detection Options

### Basic Configuration

```typescript
import { detectPII, DetectionOptions } from "privakit";

const options: DetectionOptions = {
  enableNLP: true, // Use compromise.js for name detection
  confidenceThreshold: 0.7, // Minimum confidence to report
  maxTextLength: 50000, // Maximum text length to process
  enableSpanExtraction: true, // Include position information
  strictMode: false, // Require additional validation
  includeContext: true, // Include surrounding text
  contextWindow: 10, // Characters around detected PII
};

const result = detectPII(text, options);
```

### Confidence Threshold Filtering

```typescript
// High confidence only (fewer false positives)
const highConfidence = detectPII(text, {
  confidenceThreshold: 0.9,
});

// Low confidence (catch more potential PII)
const lowConfidence = detectPII(text, {
  confidenceThreshold: 0.3,
});

console.log(`High confidence: ${highConfidence.spans.length} spans`);
console.log(`Low confidence: ${lowConfidence.spans.length} spans`);
```

### NLP-Powered Name Detection

```typescript
// Enable advanced name detection
const result = detectPII("John Smith will attend the meeting", {
  enableNLP: true,
});

// Check for NLP-detected names
result.spans.forEach((span) => {
  if (span.type === "name" && span.metadata?.source === "nlp") {
    console.log(`NLP detected name: ${span.text}`);
    console.log(`Name type: ${span.metadata.nameType}`); // 'person' | 'organization'
  }
});
```

### Context Extraction

```typescript
const result = detectPII("User email: user@example.com for support", {
  includeContext: true,
  contextWindow: 15,
});

result.spans.forEach((span) => {
  console.log(`Context: ${span.metadata?.context}`);
  // Output: "...User email: [user@example.com] for support..."
});
```

## 🧠 Advanced Pattern Matching

### Custom Patterns

```typescript
import { addPIIPattern, PIIType } from "privakit";

// Add custom employee ID pattern
addPIIPattern({
  type: PIIType.NationalID,
  regex: /EMP-\d{6}/g,
  description: "Company employee IDs",
  riskLevel: "moderate",
  examples: ["EMP-123456", "EMP-789012"],
  falsePositiveFilters: [
    (match) => match !== "EMP-000000", // Exclude test IDs
  ],
});

// Now detects custom patterns
const result = detectPII("Employee EMP-123456 logged in");
console.log(result.detectedTypes); // ['nationalid']
```

### Pattern Validation

```typescript
// Patterns include validation logic
const result = detectPII("Credit card: 4111111111111111");

result.spans.forEach((span) => {
  if (span.type === "creditcard") {
    console.log(`Luhn valid: ${span.metadata?.validationPassed}`);
    // Luhn algorithm validates credit card numbers
  }
});
```

### False Positive Filtering

```typescript
// Built-in false positive filters
const result = detectPII("Phone: 123-45-6789 vs SSN: 123-45-6789");

// SSN pattern includes validation:
// - Not 000, 666, or 9XX area numbers
// - Not 00 group numbers
// - Not 0000 serial numbers
// - Excludes common fake numbers

console.log(result.spans.length); // Only valid patterns detected
```

## 📊 Confidence Scoring

### Confidence Levels

```typescript
enum ConfidenceLevel {
  Low = "low", // 30% - Might be PII
  Medium = "medium", // 50% - Likely PII
  High = "high", // 70% - Very likely PII
  VeryHigh = "very_high", // 90% - Almost certainly PII
}
```

### Factors Affecting Confidence

1. **Pattern specificity**: More specific patterns = higher confidence
2. **Validation results**: Valid format = higher confidence
3. **Context clues**: Labeled data ("Email: user@domain.com") = higher confidence
4. **NLP analysis**: Recognized entities = higher confidence

```typescript
const result = detectPII("Email address: john@company.com");

result.spans.forEach((span) => {
  console.log(`Confidence: ${span.confidence}`);
  console.log(`Factors:`, span.metadata);

  // Factors might include:
  // - pattern: "Email addresses (RFC 5322 compliant)"
  // - validationPassed: true
  // - contextLabel: "Email address:"
  // - riskLevel: "moderate"
});
```

## 🚀 Batch Processing

### Multiple Texts

```typescript
import { detectPIIMultiple } from "privakit";

const texts = ["User: john@example.com", "Phone: 555-1234", "No PII here"];

const results = detectPIIMultiple(texts);

results.forEach((result, index) => {
  console.log(`Text ${index + 1}: ${result.hasPII ? "Has PII" : "Clean"}`);
});
```

### Performance Optimization

```typescript
// Process large batches efficiently
const largeBatch = Array(1000).fill("Email: user@example.com");

console.time("batch-detection");
const results = detectPIIMultiple(largeBatch, {
  maxTextLength: 1000, // Limit per text
  enableSpanExtraction: false, // Skip detailed spans for speed
});
console.timeEnd("batch-detection");

console.log(`Processed ${results.length} texts`);
console.log(`Found PII in ${results.filter((r) => r.hasPII).length} texts`);
```

## 🎯 Specialized Detection Functions

### Quick PII Check

```typescript
import { hasPII } from "privakit";

// Fast boolean check (no detailed analysis)
console.log(hasPII("Contact: user@example.com")); // true
console.log(hasPII("No sensitive data here")); // false

// Useful for quick filtering
const texts = ["Email: test@example.com", "Regular text", "Phone: 555-1234"];
const piiTexts = texts.filter((text) => hasPII(text));
console.log(`${piiTexts.length} texts contain PII`);
```

### PII Type Counting

```typescript
import { countPIIByType } from "privakit";

const text = "Contact: john@example.com, jane@test.com, phone: 555-1234";
const counts = countPIIByType(text);

console.log(`Emails: ${counts.email}`); // 2
console.log(`Phones: ${counts.phone}`); // 1
console.log(`Names: ${counts.name}`); // 0
console.log(`SSNs: ${counts.ssn}`); // 0

// Get totals
const totalPII = Object.values(counts).reduce((sum, count) => sum + count, 0);
console.log(`Total PII instances: ${totalPII}`);
```

## 🔧 Detection Configuration

### Creating Detection Config

```typescript
import { createDetectionConfig } from "privakit";

const config = createDetectionConfig({
  enableNLP: true,
  confidenceThreshold: 0.8,
  maxTextLength: 25000,
  customPatterns: [
    {
      type: "nationalid",
      regex: /ID-\d{8}/g,
      description: "Custom ID format",
      riskLevel: "moderate",
    },
  ],
});

// Use config with detection
const result = detectPII(text, config);
```

### Pattern Management

```typescript
import { getDefaultPIIPatterns, removePIIPattern } from "privakit";

// View all available patterns
const patterns = getDefaultPIIPatterns();
console.log(`${patterns.length} built-in patterns`);

patterns.forEach((pattern) => {
  console.log(`${pattern.type}: ${pattern.description}`);
});

// Remove patterns you don't need
removePIIPattern("url"); // Stop detecting URLs
removePIIPattern("ip"); // Stop detecting IP addresses

// Now detection skips those types
const result = detectPII("Visit https://example.com from 192.168.1.1");
console.log(result.detectedTypes); // Won't include 'url' or 'ip'
```

## 📝 Real-World Use Cases

### Log File Scanning

```typescript
import { detectPII, redactFromDetection } from "privakit";

async function scanLogFile(logContent: string) {
  // Detect PII in logs
  const detection = detectPII(logContent, {
    confidenceThreshold: 0.6, // Be sensitive for logs
    enableSpanExtraction: true,
  });

  if (detection.hasPII) {
    console.warn(`Found ${detection.spans.length} PII instances in logs`);

    // Generate redacted version
    const redacted = redactFromDetection(logContent, detection);
    return redacted.redacted;
  }

  return logContent; // Safe to keep original
}

// Usage
const logEntry = "User john@company.com failed login from 192.168.1.100";
const safeLog = await scanLogFile(logEntry);
console.log(safeLog); // "User [REDACTED] failed login from [REDACTED]"
```

### Content Moderation

```typescript
import { detectPII } from "privakit";

function moderateUserContent(content: string) {
  const detection = detectPII(content, {
    enableNLP: true,
    confidenceThreshold: 0.7,
  });

  if (detection.hasPII) {
    const criticalPII = detection.spans.filter(
      (span) => span.metadata?.riskLevel === "critical",
    );

    if (criticalPII.length > 0) {
      return {
        approved: false,
        reason: "Contains sensitive personal information",
        suggestions: detection.suggestions,
      };
    }

    return {
      approved: true,
      warning: "Content contains personal information",
      detectedTypes: detection.detectedTypes,
    };
  }

  return { approved: true };
}

// Usage
const userPost = "My credit card number is 4111-1111-1111-1111";
const moderation = moderateUserContent(userPost);
console.log(moderation.approved); // false (critical PII detected)
```

### Data Discovery

```typescript
import { detectPII } from "privakit";

async function auditDatabase(records: any[]) {
  const piiReport = {
    totalRecords: records.length,
    recordsWithPII: 0,
    piiByType: {} as Record<string, number>,
    riskAssessment: "low" as "low" | "medium" | "high" | "critical",
  };

  for (const record of records) {
    const textContent = JSON.stringify(record);
    const detection = detectPII(textContent);

    if (detection.hasPII) {
      piiReport.recordsWithPII++;

      detection.detectedTypes.forEach((type) => {
        piiReport.piiByType[type] = (piiReport.piiByType[type] || 0) + 1;
      });

      // Check for critical PII
      const hasCritical = detection.spans.some(
        (span) => span.metadata?.riskLevel === "critical",
      );

      if (hasCritical && piiReport.riskAssessment !== "critical") {
        piiReport.riskAssessment = "critical";
      }
    }
  }

  return piiReport;
}

// Usage
const records = [
  { name: "John Doe", email: "john@example.com" },
  { id: 123, status: "active" },
  { ssn: "123-45-6789", account: "12345" },
];

const report = await auditDatabase(records);
console.log(
  `${report.recordsWithPII}/${report.totalRecords} records contain PII`,
);
console.log("Risk level:", report.riskAssessment);
```

## 🔒 Security Considerations

### No Data Exfiltration

```typescript
// ✅ All processing is local
const detection = detectPII(sensitiveText);
// No network calls, no data sent anywhere

// ✅ No data retention
const result1 = detectPII("Email: user@example.com");
const result2 = detectPII("Phone: 555-1234");
// Each call is independent, no shared state
```

### Safe Error Handling

```typescript
import { detectPII, PIIDetectionError } from "privakit";

try {
  const hugeTex = "x".repeat(100000);
  const result = detectPII(hugeTex, { maxTextLength: 50000 });
} catch (error) {
  if (error instanceof PIIDetectionError) {
    console.error("Detection failed:", error.code);
    // Error doesn't contain the input text
  }
}
```

### Memory Management

```typescript
// ✅ Process large texts in chunks
function detectInLargeText(text: string, chunkSize = 50000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  const allResults = chunks.map((chunk) => detectPII(chunk));

  // Combine results
  return {
    hasPII: allResults.some((r) => r.hasPII),
    detectedTypes: [...new Set(allResults.flatMap((r) => r.detectedTypes))],
    totalSpans: allResults.reduce((sum, r) => sum + r.spans.length, 0),
  };
}
```

## 🎯 Why Detection Matters in PII Context

### Compliance Requirements

**GDPR Article 30**: Organizations must maintain records of processing activities

- Detection helps identify what PII is being processed
- Enables accurate data mapping and inventory

**CCPA Section 1798.110**: Right to know about personal information collected

- Detection helps businesses understand what PI they collect
- Enables proper disclosure to consumers

### Security Benefits

1. **Data Loss Prevention**: Identify PII before it's logged or transmitted
2. **Incident Response**: Quickly assess scope of data exposure
3. **Privacy by Design**: Catch PII early in development cycle
4. **Compliance Monitoring**: Continuous scanning for policy violations

### Business Value

1. **Risk Assessment**: Understand PII exposure across systems
2. **Data Governance**: Enable informed privacy decisions
3. **Cost Reduction**: Prevent expensive compliance violations
4. **Trust Building**: Demonstrate proactive privacy protection

---

**Next Steps:**

- 🎭 **Learn masking**: [Masking Documentation](./masking.md)
- 🚫 **Explore redaction**: [Redaction Documentation](./redaction.md)
- ⚖️ **Understand policies**: [Policy Engine Documentation](./policy-engine.md)
