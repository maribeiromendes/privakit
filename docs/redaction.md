# Redaction Module

The Redaction module provides complete removal of PII from text, making it safe for logging, archival, and analysis. Unlike masking which preserves structure for display, redaction completely eliminates sensitive data.

## 🚫 Basic Redaction Concepts

### Redaction vs Masking

```typescript
import { redactText, maskPII } from 'privakit';

const text = "Contact John Doe at john@example.com or call (555) 123-4567";

// Redaction: Complete removal for logs
const redacted = redactText(text);
console.log(redacted.redacted); 
// Output: "Contact [REDACTED] at [REDACTED] or call [REDACTED]"

// Masking: Preserves structure for display
const masked = maskPII('john@example.com', 'email');
console.log(masked.masked); 
// Output: "j***@example.com"
```

### When to Use Redaction

- **Logging systems**: Remove PII from application logs
- **Data archival**: Long-term storage without sensitive data
- **Analytics**: Safe data for processing and analysis
- **Audit trails**: Record events without exposing PII
- **Error reporting**: Clean stack traces and error messages
- **Content moderation**: Remove sensitive data from user content

## 📝 Text Redaction

### Basic Text Redaction

```typescript
import { redactText } from 'privakit';

// Simple redaction with default settings
const text = "User john@example.com logged in from IP 192.168.1.100";
const result = redactText(text);

console.log(result.redacted);
// Output: "User [REDACTED] logged in from IP [REDACTED]"

console.log(result.redactionCount); // 2
console.log(result.detectedTypes); // ['email', 'ip']
```

### Custom Redaction Markers

```typescript
import { redactText, RedactionOptions } from 'privakit';

const options: RedactionOptions = {
  replacement: '***REMOVED***',
  preserveLength: false,
  strictMode: true
};

const result = redactText("Contact john@example.com", options);
console.log(result.redacted); 
// Output: "Contact ***REMOVED***"
```

### Length-Preserving Redaction

```typescript
// Preserve original text length for format consistency
const result = redactText("Email: user@domain.com", {
  preserveLength: true,
  replacement: 'X'
});

console.log(result.redacted); 
// Output: "Email: XXXXXXXXXXXXXXX" (same character count)
```

### Selective Type Redaction

```typescript
// Redact only specific PII types
const text = "John Doe's email is john@example.com, phone: 555-123-4567";

const emailOnly = redactText(text, {
  includeTypes: ['email']  // Only redact emails
});
console.log(emailOnly.redacted);
// Output: "John Doe's email is [REDACTED], phone: 555-123-4567"

const excludeNames = redactText(text, {
  excludeTypes: ['name']  // Redact everything except names
});
console.log(excludeNames.redacted);
// Output: "John Doe's email is [REDACTED], phone: [REDACTED]"
```

## 🔍 Targeted Redaction by Type

### Email Redaction

```typescript
import { redactEmails } from 'privakit';

const text = "Send reports to admin@company.com and backup@company.com";
const result = redactEmails(text);

console.log(result.redacted);
// Output: "Send reports to [REDACTED] and [REDACTED]"

console.log(result.redactedEmails);
// Output: ["admin@company.com", "backup@company.com"]
```

### Phone Number Redaction

```typescript
import { redactPhones } from 'privakit';

const text = "Call 555-123-4567 or international +44 20 7946 0958";
const result = redactPhones(text, {
  replacement: '[PHONE_REMOVED]'
});

console.log(result.redacted);
// Output: "Call [PHONE_REMOVED] or international [PHONE_REMOVED]"
```

### Credit Card Redaction

```typescript
import { redactCreditCards } from 'privakit';

// Complete removal for PCI compliance
const text = "Payment failed for card 4111-1111-1111-1111";
const result = redactCreditCards(text, {
  replacement: '[CARD_REDACTED]',
  strict: true  // Remove all card-like patterns
});

console.log(result.redacted);
// Output: "Payment failed for card [CARD_REDACTED]"
```

### Address Redaction

```typescript
import { redactAddresses } from 'privakit';

const text = "Ship to 123 Main Street, Anytown, ST 12345";
const result = redactAddresses(text, {
  partial: true,  // Allow partial redaction
  preserveCity: true  // Keep city names
});

console.log(result.redacted);
// Output: "Ship to [REDACTED], Anytown, [REDACTED]"
```

## 🏢 Enterprise-Grade Redaction

### Batch Document Processing

```typescript
import { redactDocuments } from 'privakit';

const documents = [
  "Invoice for john@company.com - $1,234.56",
  "Support ticket from jane@example.com",
  "Meeting notes: call Mary at 555-987-6543"
];

const results = redactDocuments(documents, {
  replacement: '[REDACTED]',
  includeMetadata: true
});

results.forEach((result, index) => {
  console.log(`Document ${index + 1}: ${result.redacted}`);
  console.log(`PII found: ${result.metadata.piiCount}`);
});
```

### Database Query Result Redaction

```typescript
// Safe database result processing
async function getRedactedUserData(userId: string) {
  const rawData = await database.query('SELECT * FROM users WHERE id = ?', [userId]);
  
  // Convert to JSON string for processing
  const jsonString = JSON.stringify(rawData);
  
  // Redact any PII that might be in the data
  const redacted = redactText(jsonString, {
    strictMode: true,
    includeTypes: ['email', 'phone', 'address', 'creditcard']
  });
  
  // Return safe data for logging/analysis
  return {
    safeData: redacted.redacted,
    piiRemoved: redacted.redactionCount,
    dataTypes: redacted.detectedTypes
  };
}
```

### API Response Sanitization

```typescript
import { createRedactionMiddleware } from 'privakit';

// Express.js middleware for automatic API response redaction
const redactionMiddleware = createRedactionMiddleware({
  redactRequestLogs: true,
  redactResponseLogs: true,
  redactErrorLogs: true,
  replacement: '[SANITIZED]'
});

app.use(redactionMiddleware);

// Automatic redaction of logs:
// Before: "POST /users {email: 'user@example.com'}"
// After:  "POST /users {email: '[SANITIZED]'}"
```

## 🔒 Safe Logging

### Logger Integration

```typescript
import { createSafeLogger } from 'privakit';

// Create PII-safe logger
const logger = createSafeLogger({
  replacement: '[REDACTED]',
  logLevel: 'info',
  auditRedactions: true  // Track what was redacted
});

// All log calls automatically redacted
logger.info('User john@example.com completed purchase');
// Logged: "User [REDACTED] completed purchase"

logger.error('Failed login for IP 192.168.1.100');
// Logged: "Failed login for IP [REDACTED]"

logger.debug('Processing data: {"email":"user@test.com","phone":"555-1234"}');
// Logged: "Processing data: {\"email\":\"[REDACTED]\",\"phone\":\"[REDACTED]\"}"
```

### Structured Logging with Redaction

```typescript
// Winston logger integration
import winston from 'winston';
import { redactText } from 'privakit';

const redactionFormat = winston.format((info) => {
  // Redact message content
  if (info.message) {
    const redacted = redactText(info.message, {
      replacement: '[REDACTED]',
      strictMode: true
    });
    info.message = redacted.redacted;
    info.piiRedacted = redacted.redactionCount;
  }
  
  // Redact any object properties
  Object.keys(info).forEach(key => {
    if (typeof info[key] === 'string') {
      const redacted = redactText(info[key]);
      if (redacted.redactionCount > 0) {
        info[key] = redacted.redacted;
      }
    }
  });
  
  return info;
});

const logger = winston.createLogger({
  format: winston.format.combine(
    redactionFormat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'safe-app.log' })
  ]
});
```

### Application Error Redaction

```typescript
// Safe error logging that removes PII from stack traces
function logError(error: Error, context: any) {
  // Redact error message
  const redactedMessage = redactText(error.message, {
    replacement: '[SENSITIVE_DATA]'
  });
  
  // Redact stack trace
  const redactedStack = error.stack ? redactText(error.stack, {
    replacement: '[SENSITIVE_DATA]'
  }).redacted : undefined;
  
  // Redact context data
  const redactedContext = redactText(JSON.stringify(context), {
    replacement: '[SENSITIVE_DATA]'
  });
  
  console.error({
    error: redactedMessage.redacted,
    stack: redactedStack,
    context: JSON.parse(redactedContext.redacted),
    piiRemoved: redactedMessage.redactionCount + redactedContext.redactionCount
  });
}
```

## 📊 Analytics-Safe Data

### Event Data Redaction

```typescript
// Clean analytics data before sending to third parties
function trackUserEvent(event: string, properties: any) {
  // Redact the entire properties object
  const safeProperties = redactText(JSON.stringify(properties), {
    replacement: '[REDACTED]',
    preserveStructure: true  // Keep JSON structure intact
  });
  
  // Send to analytics (no PII included)
  analytics.track(event, JSON.parse(safeProperties.redacted));
  
  // Log redaction for audit
  if (safeProperties.redactionCount > 0) {
    console.log(`Redacted ${safeProperties.redactionCount} PII instances from analytics event`);
  }
}

// Usage
trackUserEvent('user_registered', {
  email: 'user@example.com',  // Will be redacted
  plan: 'premium',           // Safe to track
  phone: '555-123-4567'      // Will be redacted
});
```

### Search Query Sanitization

```typescript
// Clean search queries before storing for analysis
function logSearchQuery(query: string, userId: string) {
  const redactedQuery = redactText(query, {
    replacement: '[QUERY_REDACTED]',
    includeTypes: ['email', 'phone', 'name', 'creditcard']
  });
  
  const redactedUserId = redactText(userId, {
    replacement: '[USER_REDACTED]'
  });
  
  // Safe to store for search analytics
  searchAnalytics.log({
    query: redactedQuery.redacted,
    user: redactedUserId.redacted,
    timestamp: Date.now(),
    hadPII: redactedQuery.redactionCount > 0
  });
}
```

## ⚙️ Advanced Redaction Options

### Custom PII Patterns

```typescript
// Add custom patterns for organization-specific PII
const customRedaction = redactText(text, {
  customPatterns: [
    {
      name: 'employee_id',
      pattern: /EMP-\d{6}/g,
      replacement: '[EMPLOYEE_ID]'
    },
    {
      name: 'project_code',
      pattern: /PROJ-[A-Z]{3}-\d{4}/g,
      replacement: '[PROJECT_CODE]'
    }
  ]
});
```

### Context-Aware Redaction

```typescript
// Redact differently based on context
function contextualRedaction(text: string, context: 'public' | 'internal' | 'restricted') {
  switch (context) {
    case 'public':
      // Aggressive redaction for public data
      return redactText(text, {
        strictMode: true,
        replacement: '[REMOVED]',
        includeTypes: ['email', 'phone', 'name', 'address', 'creditcard', 'ssn', 'ip']
      });
    
    case 'internal':
      // Moderate redaction for internal use
      return redactText(text, {
        replacement: '[INTERNAL_REDACTED]',
        includeTypes: ['creditcard', 'ssn', 'phone']
      });
    
    case 'restricted':
      // Minimal redaction for restricted access
      return redactText(text, {
        replacement: '[CLASSIFIED]',
        includeTypes: ['creditcard', 'ssn']
      });
  }
}
```

### Reversible Redaction (with Encryption)

```typescript
// Redaction with encrypted storage for authorized recovery
import { encrypt, decrypt } from './encryption'; // Your encryption module

class ReversibleRedaction {
  private encryptionKey: string;
  
  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }
  
  redactWithRecovery(text: string) {
    const detection = detectPII(text);
    let redacted = text;
    const recoveryMap: any[] = [];
    
    detection.spans.forEach((span, index) => {
      const placeholder = `[REDACTED_${index}]`;
      
      // Encrypt original value
      const encrypted = encrypt(span.text, this.encryptionKey);
      
      // Store recovery information
      recoveryMap.push({
        placeholder,
        encrypted,
        type: span.type,
        position: span.start
      });
      
      // Replace with placeholder
      redacted = redacted.replace(span.text, placeholder);
    });
    
    return {
      redacted,
      recoveryMap: encrypt(JSON.stringify(recoveryMap), this.encryptionKey),
      redactionCount: recoveryMap.length
    };
  }
  
  recover(redactedText: string, encryptedRecoveryMap: string) {
    const recoveryMap = JSON.parse(decrypt(encryptedRecoveryMap, this.encryptionKey));
    let recovered = redactedText;
    
    recoveryMap.forEach((entry: any) => {
      const originalValue = decrypt(entry.encrypted, this.encryptionKey);
      recovered = recovered.replace(entry.placeholder, originalValue);
    });
    
    return recovered;
  }
}
```

## 📋 Compliance and Audit

### GDPR-Compliant Redaction

```typescript
// Redaction that meets GDPR requirements
function gdprCompliantRedaction(personalData: string) {
  const result = redactText(personalData, {
    strictMode: true,
    replacement: '[GDPR_REDACTED]',
    auditTrail: true,
    includeTypes: ['email', 'phone', 'name', 'address', 'ip', 'device_id']
  });
  
  // Log for GDPR compliance audit
  console.log({
    event: 'gdpr_data_redaction',
    timestamp: new Date().toISOString(),
    piiTypesRedacted: result.detectedTypes,
    redactionCount: result.redactionCount,
    dataSubject: '[REDACTED]',  // Don't log who the data belonged to
    legalBasis: 'data_minimization_article_5'
  });
  
  return result;
}
```

### PCI DSS Compliance

```typescript
// Credit card data redaction for PCI DSS compliance
function pciCompliantRedaction(text: string) {
  return redactText(text, {
    includeTypes: ['creditcard', 'cvv', 'bank_account'],
    replacement: '[PCI_REDACTED]',
    strictMode: true,
    auditRequired: true
  });
}

// Usage in payment processing logs
function logPaymentEvent(event: string, data: any) {
  const safeData = pciCompliantRedaction(JSON.stringify(data));
  
  paymentLogger.info({
    event,
    data: JSON.parse(safeData.redacted),
    pciCompliant: true,
    redactionApplied: safeData.redactionCount > 0
  });
}
```

### Audit Trail Generation

```typescript
// Comprehensive audit trail for redaction operations
class RedactionAuditor {
  private auditLog: any[] = [];
  
  redactWithAudit(text: string, purpose: string, user: string) {
    const result = redactText(text, {
      replacement: '[AUDITED_REDACTION]',
      strictMode: true
    });
    
    // Create audit entry
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user,
      purpose,
      originalLength: text.length,
      redactedLength: result.redacted.length,
      piiTypesFound: result.detectedTypes,
      redactionCount: result.redactionCount,
      hash: this.hashText(text),  // For integrity verification
      compliant: true
    };
    
    this.auditLog.push(auditEntry);
    
    return {
      ...result,
      auditId: auditEntry.timestamp + '_' + auditEntry.user
    };
  }
  
  private hashText(text: string): string {
    // Simple hash for integrity (use proper crypto in production)
    return Buffer.from(text).toString('base64').substring(0, 10);
  }
  
  getAuditReport(dateFrom: Date, dateTo: Date) {
    return this.auditLog.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= dateFrom && entryDate <= dateTo;
    });
  }
}
```

## 🎯 Real-World Use Cases

### Content Management System

```typescript
// CMS that automatically redacts user-generated content
class SafeContentManager {
  async saveContent(content: string, authorId: string) {
    // Check for PII in content
    const detection = detectPII(content);
    
    if (detection.hasPII) {
      // Redact for public display
      const redacted = redactText(content, {
        replacement: '[CONTENT_MODERATED]'
      });
      
      // Store both versions (original encrypted, redacted public)
      await this.storage.save({
        id: generateId(),
        authorId,
        publicContent: redacted.redacted,
        privateContent: this.encrypt(content),  // Encrypted original
        containsPII: true,
        piiTypes: detection.detectedTypes,
        moderationRequired: true
      });
      
      return {
        success: true,
        message: 'Content saved with privacy protection applied',
        requiresReview: true
      };
    } else {
      // No PII, safe to store as-is
      await this.storage.save({
        id: generateId(),
        authorId,
        publicContent: content,
        containsPII: false,
        moderationRequired: false
      });
      
      return {
        success: true,
        message: 'Content saved successfully'
      };
    }
  }
}
```

### Customer Support Ticket System

```typescript
// Support system with automatic PII redaction
class SupportTicketSystem {
  async createTicket(customerEmail: string, subject: string, message: string) {
    // Redact customer message for support agent view
    const redactedMessage = redactText(message, {
      replacement: '[CUSTOMER_INFO_REDACTED]',
      includeTypes: ['phone', 'address', 'creditcard', 'ssn']
    });
    
    // Create ticket with redacted content
    const ticket = await this.database.tickets.create({
      customerEmail: this.hashEmail(customerEmail),  // Hash for lookup
      subject,
      publicMessage: redactedMessage.redacted,
      privateMessage: this.encrypt(message),  // Encrypted original
      piiRedacted: redactedMessage.redactionCount > 0,
      createdAt: new Date()
    });
    
    // Notify support team with safe content
    await this.notifySupport({
      ticketId: ticket.id,
      subject,
      message: redactedMessage.redacted,
      priority: this.calculatePriority(subject)
    });
    
    return ticket;
  }
  
  // Support agents see redacted version by default
  async getTicketForAgent(ticketId: string, agentId: string) {
    const ticket = await this.database.tickets.findById(ticketId);
    
    return {
      ...ticket,
      message: ticket.publicMessage,  // Redacted version
      hasRedactedContent: ticket.piiRedacted
    };
  }
  
  // Managers can access original with approval
  async getFullTicketForManager(ticketId: string, managerId: string, justification: string) {
    const approval = await this.requestAccess(managerId, ticketId, justification);
    
    if (approval.granted) {
      const ticket = await this.database.tickets.findById(ticketId);
      
      // Log access for audit
      this.auditAccess(managerId, ticketId, 'full_content_access', justification);
      
      return {
        ...ticket,
        message: this.decrypt(ticket.privateMessage),  // Original content
        accessGranted: true,
        accessReason: justification
      };
    }
    
    throw new Error('Access denied - insufficient privileges');
  }
}
```

## 🔒 Security Best Practices

### Memory Safety

```typescript
// ✅ Secure redaction that clears sensitive data from memory
function secureRedact(sensitiveText: string) {
  try {
    const result = redactText(sensitiveText, {
      replacement: '[SECURE_REDACTED]'
    });
    
    return result;
  } finally {
    // Clear sensitive data from memory (Node.js specific)
    if (Buffer.isBuffer(sensitiveText)) {
      sensitiveText.fill(0);
    }
  }
}
```

### Prevent Information Leakage

```typescript
// ✅ Ensure redacted data doesn't leak information
function paranoidRedaction(text: string) {
  const result = redactText(text, {
    replacement: '[REDACTED]',
    preserveLength: false,     // Don't preserve length
    preserveCase: false,       // Don't preserve case patterns
    preservePunctuation: false // Don't preserve punctuation
  });
  
  // Don't include metadata that might leak information
  return {
    redacted: result.redacted,
    hasRedactions: result.redactionCount > 0
    // Don't include: original length, PII types, positions, etc.
  };
}
```

### Redaction Verification

```typescript
// ✅ Verify redaction was complete
function verifyRedaction(originalText: string, redactedText: string) {
  // Re-scan redacted text to ensure no PII remains
  const remainingPII = detectPII(redactedText);
  
  if (remainingPII.hasPII) {
    throw new Error(`Redaction incomplete: ${remainingPII.detectedTypes.join(', ')} still present`);
  }
  
  // Verify no obvious patterns leaked through
  const suspiciousPatterns = [
    /@\w+\./,           // Email patterns
    /\(\d{3}\)/,        // Phone patterns
    /\d{4}-\d{4}-\d{4}/ // Card-like patterns
  ];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(redactedText)) {
      throw new Error(`Suspicious pattern detected in redacted text: ${pattern}`);
    }
  });
  
  return {
    verified: true,
    safe: true,
    redactionComplete: true
  };
}
```

## 🎯 Why Redaction Matters in PII Context

### Legal Protection

1. **Compliance**: Meet GDPR, CCPA, HIPAA data minimization requirements
2. **Liability Reduction**: Remove sensitive data from logs and archives
3. **Breach Impact**: Limit damage if systems are compromised
4. **Right to Erasure**: Enable GDPR "right to be forgotten" compliance

### Operational Security

1. **Log Safety**: Prevent PII from appearing in application logs
2. **Developer Protection**: Keep PII out of debug information
3. **Third-party Safety**: Clean data before sending to external services
4. **Error Handling**: Prevent PII leakage in error messages

### Business Benefits

1. **Risk Mitigation**: Reduce regulatory and reputational risks
2. **Data Minimization**: Store only necessary information
3. **Vendor Relations**: Share safe data with partners and vendors
4. **Audit Readiness**: Maintain compliant audit trails

---

**Next Steps:**
- 🎭 **Learn masking**: [Masking Documentation](./masking.md)
- 🔧 **Explore normalization**: [Normalization Documentation](./normalization.md)
- ⚖️ **Understand policies**: [Policy Engine Documentation](./policy-engine.md)