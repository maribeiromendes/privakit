# Quick Start Guide

Get up and running with Privakit in just a few minutes! This guide will walk you through the most common use cases and get you protecting PII right away.

## 🚀 5-Minute Setup

### 1. Install Privakit

```bash
npm install privakit
```

### 2. Your First PII Detection

```typescript
import { detectPII } from 'privakit';

const userMessage = "Hi, my email is john@example.com and phone is 555-1234";
const result = detectPII(userMessage);

console.log(result.hasPII);        // true
console.log(result.detectedTypes); // ['email', 'phone']
console.log(result.spans.length);  // 2 PII instances found
```

### 3. Safe Masking for Display

```typescript
import { maskPII } from 'privakit';

const email = "john.doe@company.com";
const masked = maskPII(email, 'email');

console.log(masked.masked); // "j*******@company.com"
// Safe to show in UI while protecting privacy
```

### 4. GDPR-Compliant Processing

```typescript
import { createPolicyEngine } from 'privakit';

const gdprEngine = createPolicyEngine('gdpr');
const decision = gdprEngine.evaluate('email', 'log');

console.log(decision.allowed);          // false
console.log(decision.requiresMasking);  // true
console.log(decision.reason);           // "Operation 'log' not allowed..."
```

## 🎯 Common Use Cases

### Form Validation

```typescript
import { validateEmail, validatePhone } from 'privakit';

function validateSignupForm(formData) {
  const errors = [];
  
  // Validate email
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
      details: emailResult.errors
    });
  }
  
  // Validate phone
  const phoneResult = validatePhone(formData.phone);
  if (!phoneResult.isValid) {
    errors.push({
      field: 'phone', 
      message: 'Please enter a valid phone number',
      details: phoneResult.errors
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    normalizedData: {
      email: emailResult.normalized,
      phone: phoneResult.e164Format
    }
  };
}

// Usage
const formData = {
  email: 'USER@EXAMPLE.COM',
  phone: '(555) 123-4567'
};

const validation = validateSignupForm(formData);
if (validation.isValid) {
  console.log('Safe to save:', validation.normalizedData);
  // email: "user@example.com"
  // phone: "+15551234567"
}
```

### Log Sanitization

```typescript
import { createSafeLogger } from 'privakit';

// Create logger that automatically redacts PII
const logger = createSafeLogger();

// Log messages safely
logger.log('User registration: john@example.com');
logger.error('Login failed for user 555-123-4567');
logger.info('Processing payment for card 4111-1111-1111-1111');

// All PII automatically replaced with [REDACTED]
// Logs are safe for storage and analysis
```

### Content Moderation

```typescript
import { detectPII, processPII } from 'privakit';

function moderateUserContent(content) {
  const result = processPII(content);
  
  if (result.detection.hasPII) {
    // Check for high-risk PII
    const criticalPII = result.detection.spans.filter(span => 
      span.metadata?.riskLevel === 'critical'
    );
    
    if (criticalPII.length > 0) {
      return {
        approved: false,
        reason: 'Content contains sensitive personal information',
        suggestion: 'Please remove personal details before posting'
      };
    }
    
    return {
      approved: true,
      warning: 'Personal information detected',
      safePreviously: result.masked // Show user what would be visible
    };
  }
  
  return { approved: true };
}

// Usage
const userPost = "My email is john@example.com, contact me!";
const moderation = moderateUserContent(userPost);

if (moderation.approved) {
  console.log('Post approved');
  if (moderation.warning) {
    console.log('Warning:', moderation.warning);
  }
} else {
  console.log('Post rejected:', moderation.reason);
}
```

### Data Discovery

```typescript
import { detectPII, countPIIByType } from 'privakit';

async function auditUserData(userData) {
  const dataString = JSON.stringify(userData);
  const detection = detectPII(dataString);
  
  if (detection.hasPII) {
    const counts = countPIIByType(dataString);
    
    console.log('PII Audit Report:');
    console.log('- Emails found:', counts.email);
    console.log('- Phone numbers:', counts.phone);
    console.log('- Names detected:', counts.name);
    console.log('- Addresses found:', counts.address);
    
    // Calculate risk score
    const riskScore = detection.spans.reduce((score, span) => {
      switch (span.metadata?.riskLevel) {
        case 'critical': return score + 4;
        case 'high': return score + 3;
        case 'moderate': return score + 2;
        case 'low': return score + 1;
        default: return score;
      }
    }, 0);
    
    console.log('Risk score:', riskScore);
    
    return {
      hasPII: true,
      riskLevel: riskScore > 10 ? 'high' : riskScore > 5 ? 'medium' : 'low',
      piiTypes: detection.detectedTypes,
      recommendations: detection.suggestions
    };
  }
  
  return { hasPII: false, riskLevel: 'none' };
}

// Usage
const userData = {
  profile: {
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567"
  },
  preferences: {
    theme: "dark",
    notifications: true
  }
};

auditUserData(userData).then(audit => {
  console.log('Audit complete:', audit);
});
```

## ⚡ Performance Tips

### Tree Shaking for Smaller Bundles

```typescript
// ✅ Import only what you need
import { validateEmail } from 'privakit/validate/email';
import { maskEmail } from 'privakit/mask';

// Instead of importing everything
// import * as Privakit from 'privakit'; // Larger bundle
```

### Batch Processing for Efficiency

```typescript
import { detectPIIMultiple, validateEmails } from 'privakit';

// ✅ Process multiple items at once
const emails = ['user1@example.com', 'user2@test.com', 'user3@domain.org'];
const results = validateEmails(emails);

// ✅ Batch PII detection
const texts = [
  'Contact: john@example.com',
  'Phone: 555-1234',
  'No sensitive data here'
];
const detections = detectPIIMultiple(texts);
```

### Optimize for Large Texts

```typescript
import { detectPII } from 'privakit';

// ✅ Set reasonable limits for large texts
const result = detectPII(largeText, {
  maxTextLength: 50000,        // Prevent processing huge texts
  confidenceThreshold: 0.8,    // Higher threshold = fewer false positives
  enableSpanExtraction: false  // Skip detailed spans for speed
});
```

## 🔧 Environment-Specific Configuration

### Development Environment

```typescript
import { createPIIProcessor } from 'privakit';

// Permissive settings for development
const devProcessor = createPIIProcessor({
  strictMode: false,
  detectionOptions: {
    confidenceThreshold: 0.6,  // Lower threshold for testing
    enableNLP: true,
    includeContext: true       // Helpful for debugging
  },
  policyEngine: createPolicyEngine('permissive')
});
```

### Production Environment

```typescript
// Strict compliance for production
const prodProcessor = createPIIProcessor({
  strictMode: true,
  detectionOptions: {
    confidenceThreshold: 0.9,  // High confidence only
    enableNLP: true,
    maxTextLength: 25000       // Performance limit
  },
  policyEngine: createPolicyEngine('gdpr') // Strict compliance
});
```

### Testing Environment

```typescript
// Special settings for tests
const testProcessor = createPIIProcessor({
  strictMode: false,
  detectionOptions: {
    confidenceThreshold: 0.5,  // Catch test edge cases
    enableNLP: false,          // Faster test execution
    enableSpanExtraction: false
  },
  maskingOptions: {
    maskChar: 'X'              // Consistent test output
  }
});
```

## 🛡️ Security Checklist

### ✅ Essential Security Practices

1. **Validate Before Storage**
   ```typescript
   const emailResult = validateEmail(userInput);
   if (emailResult.isValid) {
     await saveToDatabase(emailResult.normalized);
   }
   ```

2. **Mask for Display**
   ```typescript
   const displayEmail = maskPII(user.email, 'email').masked;
   return { ...user, email: displayEmail };
   ```

3. **Redact for Logs**
   ```typescript
   const safeLogger = createSafeLogger();
   safeLogger.log(`User action: ${userAction}`); // PII auto-redacted
   ```

4. **Check Policy Compliance**
   ```typescript
   const decision = policyEngine.evaluate('email', 'export');
   if (!decision.allowed) {
     throw new Error('Operation not permitted by privacy policy');
   }
   ```

5. **Audit PII Processing**
   ```typescript
   const auditLog = policyEngine.getAuditLog();
   console.log('Privacy decisions made:', auditLog.length);
   ```

## 🚨 Common Pitfalls to Avoid

### ❌ Don't Do This

```typescript
// ❌ Logging raw user input
console.log('User data:', userInput); // May contain PII

// ❌ Storing unvalidated data
database.save(userInput.email); // Could be malformed

// ❌ Displaying raw PII
<span>{user.email}</span> // Shows full email

// ❌ Ignoring policy decisions
policyEngine.evaluate('ssn', 'log'); // Check the result!
```

### ✅ Do This Instead

```typescript
// ✅ Safe logging
const logger = createSafeLogger();
logger.log('User data processed'); // Safe message

// ✅ Validate before storing
const emailResult = validateEmail(userInput.email);
if (emailResult.isValid) {
  database.save(emailResult.normalized);
}

// ✅ Mask for display
const masked = maskPII(user.email, 'email');
<span>{masked.masked}</span> // Shows j***@example.com

// ✅ Respect policy decisions
const decision = policyEngine.evaluate('ssn', 'log');
if (decision.allowed) {
  // Only log if policy allows
}
```

## 🎯 Next Steps

Now that you've got the basics down:

1. 📖 **Deep Dive**: Read the [Core Concepts](./core-concepts.md) guide
2. 🔍 **Learn Detection**: Master [PII Detection](./detection.md)
3. 🎭 **Explore Masking**: Advanced [Masking Techniques](./masking.md)
4. ⚖️ **Policy Engine**: Set up [Compliance Automation](./policy-engine.md)
5. 🔧 **Integration**: Check [Framework Integration Guide](./framework-integration.md)

## 💡 Pro Tips

1. **Start Small**: Begin with basic validation, then add detection and masking
2. **Test Thoroughly**: Use different input formats and edge cases
3. **Monitor Performance**: Profile PII processing in your specific use case  
4. **Audit Regularly**: Review policy decisions and adjust as needed
5. **Stay Updated**: Keep Privakit updated for latest privacy features

---

**Ready to protect your users' privacy?** Start with these examples and gradually expand based on your specific needs. Privakit makes PII protection automatic and compliant!