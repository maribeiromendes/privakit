# Masking Module

The Masking module provides display-safe concealment of PII while preserving readability and usability. Unlike redaction, masking maintains the structure and context of data for user interfaces and debugging.

## 🎭 Basic Masking Concepts

### Masking vs Redaction

```typescript
import { maskPII, redactText } from "privakit";

const email = "john.doe@company.com";

// Masking: Preserves structure, safe for display
const masked = maskPII(email, "email");
console.log(masked.masked); // "j*******@company.com"

// Redaction: Complete removal, safe for logs
const redacted = redactText(`Email: ${email}`);
console.log(redacted.redacted); // "Email: [REDACTED]"
```

### When to Use Masking

- **User interfaces**: Show partially hidden data
- **Debugging**: Preserve format while hiding sensitive info
- **Confirmation screens**: "Send to j\*\*\*@company.com?"
- **Search results**: Show matching structure without exposing data
- **Audit trails**: Record actions without storing full PII

## 📧 Email Masking

### Basic Email Masking

```typescript
import { maskEmail } from "privakit";

// Default masking
console.log(maskEmail("user@example.com").masked);
// Output: "u***@example.com"

console.log(maskEmail("john.doe@company.com").masked);
// Output: "j*******@company.com"
```

### Advanced Email Options

```typescript
import { maskEmail, EmailMaskingOptions } from "privakit";

const options: EmailMaskingOptions = {
  maskChar: "#", // Custom mask character
  visibleStart: 2, // Show first 2 characters
  visibleEnd: 1, // Show last 1 character of local part
  maskDomain: true, // Also mask domain
  preserveTLD: true, // Keep top-level domain visible
  minVisibleChars: 1, // Minimum characters to show
};

const result = maskEmail("john.doe@company.com", options);
console.log(result.masked); // "jo####e@c######.com"
```

### Domain Masking

```typescript
// Mask domain but preserve TLD
const result = maskEmail("user@sensitive-company.com", {
  maskDomain: true,
  preserveTLD: true,
});
console.log(result.masked); // "u***@s****************.com"

// Mask everything including TLD
const fullMask = maskEmail("user@secret.org", {
  maskDomain: true,
  preserveTLD: false,
});
console.log(fullMask.masked); // "u***@******.**"
```

### Corporate Email Handling

```typescript
// Handle corporate email policies
const corporateEmail = "john.doe+project@company.com";

// Preserve subaddressing for functionality
const result = maskEmail(corporateEmail, {
  visibleStart: 1,
  visibleEnd: 0,
  preserveFormat: true,
});
console.log(result.masked); // "j*******+*******@company.com"
```

## 📞 Phone Masking

### Basic Phone Masking

```typescript
import { maskPhone } from "privakit";

// US phone numbers
console.log(maskPhone("+1 (555) 123-4567").masked);
// Output: "+1 *** ***-**67"

console.log(maskPhone("555-123-4567").masked);
// Output: "***-***-**67"
```

### International Phone Support

```typescript
// International numbers
console.log(maskPhone("+44 20 7946 0958").masked);
// Output: "+44 ** ****-**58"

console.log(maskPhone("+33 1 42 86 83 26").masked);
// Output: "+33 * ** ** **-**26"
```

### Phone Masking Options

```typescript
import { maskPhone, PhoneMaskingOptions } from "privakit";

const options: PhoneMaskingOptions = {
  maskChar: "X",
  preserveAreaCode: true, // Keep area code visible
  maskCountryCode: false, // Keep country code visible
  visibleEnd: 4, // Show last 4 digits
  defaultCountry: "US",
};

const result = maskPhone("(555) 123-4567", options);
console.log(result.masked); // "+1 555 XXX-4567"
```

### Business Phone Handling

```typescript
// Handle business vs personal phone distinction
function maskPhoneByContext(phone: string, context: "business" | "personal") {
  if (context === "business") {
    // Business phones: show area code for context
    return maskPhone(phone, {
      preserveAreaCode: true,
      visibleEnd: 0, // Hide specific number
    });
  } else {
    // Personal phones: standard masking
    return maskPhone(phone, {
      preserveAreaCode: false,
      visibleEnd: 4,
    });
  }
}

console.log(maskPhoneByContext("(555) 123-4567", "business").masked);
// Output: "+1 555 XXX-XXXX"

console.log(maskPhoneByContext("(555) 123-4567", "personal").masked);
// Output: "+1 XXX XXX-4567"
```

## 👤 Name Masking

### Basic Name Masking

```typescript
import { maskName } from "privakit";

// Simple names
console.log(maskName("John Doe").masked);
// Output: "**** ***"

console.log(maskName("Mary Johnson").masked);
// Output: "**** *******"
```

### Preserve First Letters

```typescript
// Preserve first letters for context
const result = maskName("John Michael Doe", {
  preserveFirstLetter: true,
});
console.log(result.masked); // "J*** M****** D**"
```

### Complex Name Handling

```typescript
import { maskName, NameMaskingOptions } from "privakit";

const options: NameMaskingOptions = {
  preserveFirstLetter: true,
  maskMiddleName: false, // Don't mask middle names
  maskLastName: false, // Don't mask last names
  maskChar: "•",
};

// Useful for partial disclosure
const result = maskName("Dr. John Michael Smith Jr.", options);
console.log(result.masked); // "D•. J••• Michael Smith J•."
```

### Cultural Name Sensitivity

```typescript
// Handle different name formats respectfully
function maskNameCulturally(
  name: string,
  culture: "western" | "eastern" | "mononym",
) {
  switch (culture) {
    case "western":
      return maskName(name, {
        preserveFirstLetter: true,
        maskLastName: false, // Family name context important
      });

    case "eastern":
      // In some cultures, family name comes first
      return maskName(name, {
        preserveFirstLetter: true,
        maskMiddleName: true,
      });

    case "mononym":
      // Single names (celebrities, historical figures)
      return maskName(name, {
        preserveFirstLetter: true,
        visibleEnd: 1,
      });
  }
}
```

## 🏠 Address Masking

### Basic Address Masking

```typescript
import { maskAddress } from "privakit";

const address = `123 Main Street
Apt 4B
Anytown, ST 12345`;

const result = maskAddress(address);
console.log(result.masked);
// Output:
// "*** Main Street
// Apt 4B
// Anytown, ST 12345"
```

### Selective Address Masking

```typescript
import { maskAddress, AddressMaskingOptions } from "privakit";

const options: AddressMaskingOptions = {
  maskStreetNumber: true, // Hide house number
  maskStreetName: false, // Keep street name
  maskCity: false, // Keep city
  maskPostalCode: true, // Hide ZIP code
  preserveCountry: true, // Always show country
};

const result = maskAddress("123 Oak Avenue, Portland, OR 97201", options);
console.log(result.masked); // "*** Oak Avenue, Portland, OR *****"
```

### Privacy-Level Address Masking

```typescript
// Different privacy levels for different contexts
function maskAddressByPrivacy(
  address: string,
  level: "low" | "medium" | "high",
) {
  switch (level) {
    case "low":
      // Show city and state only
      return maskAddress(address, {
        maskStreetNumber: true,
        maskStreetName: true,
        maskCity: false,
        maskPostalCode: true,
      });

    case "medium":
      // Show street but hide specific address
      return maskAddress(address, {
        maskStreetNumber: true,
        maskStreetName: false,
        maskCity: false,
        maskPostalCode: true,
      });

    case "high":
      // Hide everything except country
      return maskAddress(address, {
        maskStreetNumber: true,
        maskStreetName: true,
        maskCity: true,
        maskPostalCode: true,
        preserveCountry: true,
      });
  }
}
```

### Geographic Sensitivity

```typescript
// Handle geographically sensitive addresses
const sensitiveAddress = "1600 Pennsylvania Avenue, Washington, DC 20500";

const publicSafe = maskAddress(sensitiveAddress, {
  maskStreetNumber: true,
  maskStreetName: true,
  maskCity: false, // DC is public knowledge
  maskPostalCode: true, // ZIP could be sensitive
  preserveCountry: true,
});
console.log(publicSafe.masked); // "*** ************ ******, Washington, DC *****, US"
```

## 💳 Credit Card Masking

### Basic Credit Card Masking

```typescript
import { maskCreditCard } from "privakit";

// Default: show last 4 digits
console.log(maskCreditCard("4111111111111111").masked);
// Output: "************1111"

// With separators for readability
const result = maskCreditCard("4111-1111-1111-1111", {
  groupSeparator: " ",
});
console.log(result.masked); // "**** **** **** 1111"
```

### PCI DSS Compliant Masking

```typescript
import { maskCreditCard, CreditCardMaskingOptions } from "privakit";

// PCI DSS allows showing first 6 and last 4
const pciOptions: CreditCardMaskingOptions = {
  preserveFirst4: false, // Don't show first 4
  preserveLast4: true, // Show last 4 (PCI compliant)
  groupSeparator: " ",
  maskChar: "X",
};

const result = maskCreditCard("4111111111111111", pciOptions);
console.log(result.masked); // "XXXX XXXX XXXX 1111"

// Bank identification (first 6) + last 4 (maximum PCI allows)
const bankIdOptions: CreditCardMaskingOptions = {
  preserveFirst4: true, // Show bank identification
  preserveLast4: true, // Show last 4
  groupSeparator: " ",
};

const bankResult = maskCreditCard("4111111111111111", bankIdOptions);
console.log(bankResult.masked); // "4111 **** **** 1111"
```

### Card Type Preservation

```typescript
// Preserve card type context while masking
function maskCardWithType(cardNumber: string) {
  // Detect card type from first digits
  const firstDigit = cardNumber.charAt(0);
  let cardType = "Unknown";

  switch (firstDigit) {
    case "4":
      cardType = "Visa";
      break;
    case "5":
      cardType = "MasterCard";
      break;
    case "3":
      cardType = "American Express";
      break;
    case "6":
      cardType = "Discover";
      break;
  }

  const masked = maskCreditCard(cardNumber, {
    preserveFirst4: false,
    preserveLast4: true,
    groupSeparator: " ",
  });

  return {
    ...masked,
    cardType,
    display: `${cardType} ending in ${cardNumber.slice(-4)}`,
  };
}

const result = maskCardWithType("4111111111111111");
console.log(result.display); // "Visa ending in 1111"
```

## 🔧 Generic PII Masking

### Universal Masking Function

```typescript
import { maskPII } from "privakit";

// Automatically applies appropriate masking based on PII type
console.log(maskPII("user@example.com", "email").masked);
// Output: "u***@example.com"

console.log(maskPII("555-123-4567", "phone").masked);
// Output: "***-***-**67"

console.log(maskPII("John Doe", "name").masked);
// Output: "**** ***"
```

### Fallback Masking

```typescript
// For unsupported PII types, uses generic masking
const result = maskPII("CUSTOM-ID-12345", "nationalid", {
  visibleStart: 2,
  visibleEnd: 2,
  maskChar: "#",
});
console.log(result.masked); // "CU############45"
console.log(result.metadata?.fallback); // true
```

### Batch Masking

```typescript
import { maskMultiple } from "privakit";

const emails = ["user1@example.com", "user2@company.com", "admin@service.org"];

const results = maskMultiple(emails, "email", {
  visibleStart: 1,
  visibleEnd: 0,
});

results.forEach((result, index) => {
  console.log(`Email ${index + 1}: ${result.masked}`);
});
// Output:
// Email 1: u***@example.com
// Email 2: u***@company.com
// Email 3: a***@service.org
```

## ⚙️ Advanced Masking Options

### Custom Masking Patterns

```typescript
// Create custom masking logic
function maskCustomPattern(value: string, pattern: string): string {
  // Pattern: 'XXXX-XXXX-NNNN' where X = mask, N = visible
  let result = "";
  let valueIndex = 0;

  for (const char of pattern) {
    if (char === "X") {
      result += "*";
      valueIndex++;
    } else if (char === "N") {
      result += value[valueIndex] || "*";
      valueIndex++;
    } else {
      result += char; // Separator (-, space, etc.)
    }
  }

  return result;
}

// Usage
console.log(maskCustomPattern("1234567890", "XXXX-XXXX-NN"));
// Output: "****-****-90"
```

### Context-Aware Masking

```typescript
// Adjust masking based on user role/context
function maskForRole(
  data: string,
  type: string,
  userRole: "admin" | "user" | "guest",
) {
  const baseOptions = { maskChar: "*" };

  switch (userRole) {
    case "admin":
      // Admins see more
      return maskPII(data, type, {
        ...baseOptions,
        visibleStart: 3,
        visibleEnd: 3,
      });

    case "user":
      // Regular users see standard masking
      return maskPII(data, type, {
        ...baseOptions,
        visibleStart: 1,
        visibleEnd: 2,
      });

    case "guest":
      // Guests see minimal information
      return maskPII(data, type, {
        ...baseOptions,
        visibleStart: 1,
        visibleEnd: 0,
      });
  }
}

const email = "john.doe@company.com";
console.log(maskForRole(email, "email", "admin").masked); // "joh****@com******.com"
console.log(maskForRole(email, "email", "user").masked); // "j*****@com******.om"
console.log(maskForRole(email, "email", "guest").masked); // "j*****@com*******.***"
```

### Progressive Disclosure

```typescript
// Gradually reveal information based on verification
class ProgressiveMasking {
  private data: string;
  private type: string;
  private verificationLevel: number = 0;

  constructor(data: string, type: string) {
    this.data = data;
    this.type = type;
  }

  verify(level: number) {
    this.verificationLevel = Math.max(this.verificationLevel, level);
  }

  getMasked(): string {
    const options = {
      visibleStart: this.verificationLevel,
      visibleEnd: Math.min(this.verificationLevel, 4),
    };

    return maskPII(this.data, this.type, options).masked;
  }
}

// Usage
const maskedData = new ProgressiveMasking("john.doe@company.com", "email");
console.log(maskedData.getMasked()); // "*****************"

maskedData.verify(1);
console.log(maskedData.getMasked()); // "j***************m"

maskedData.verify(3);
console.log(maskedData.getMasked()); // "joh***********om"
```

## 🎯 Real-World Use Cases

### User Interface Display

```typescript
// Profile page showing masked data
function renderUserProfile(user: any) {
  return {
    name: maskName(user.fullName, { preserveFirstLetter: true }).masked,
    email: maskEmail(user.email, { visibleStart: 2, visibleEnd: 0 }).masked,
    phone: maskPhone(user.phone, { preserveAreaCode: true, visibleEnd: 0 })
      .masked,
    address: maskAddress(user.address, {
      maskStreetNumber: true,
      maskStreetName: false,
      maskCity: false,
      maskPostalCode: true,
    }).masked,
  };
}

const user = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "+1-555-123-4567",
  address: "123 Main St, Anytown, ST 12345",
};

const profile = renderUserProfile(user);
console.log(profile);
// Output:
// {
//   name: "J*** D**",
//   email: "jo*************",
//   phone: "+1 555 XXX-XXXX",
//   address: "*** Main St, Anytown, ST *****"
// }
```

### Search Results

```typescript
// Mask PII in search results while preserving context
function maskSearchResults(results: string[], searchTerm: string) {
  return results.map((result) => {
    const detection = detectPII(result);

    if (!detection.hasPII) {
      return result; // No masking needed
    }

    let masked = result;

    // Mask each detected PII span
    detection.spans.forEach((span) => {
      const maskedValue = maskPII(span.text, span.type, {
        preserveLength: true, // Keep search highlighting accurate
      }).masked;

      masked = masked.replace(span.text, maskedValue);
    });

    return masked;
  });
}

const searchResults = [
  "Contact John Doe at john@example.com",
  "No PII in this result",
  "Phone support: 555-123-4567",
];

const maskedResults = maskSearchResults(searchResults, "contact");
console.log(maskedResults);
// Output:
// [
//   'Contact J*** D** at j***@example.com',
//   'No PII in this result',
//   'Phone support: ***-***-**67'
// ]
```

### Debugging and Logging

```typescript
// Safe debugging that preserves structure
function debugSafeLog(data: any, context: string) {
  const jsonString = JSON.stringify(data);
  const detection = detectPII(jsonString);

  if (detection.hasPII) {
    let safeData = jsonString;

    // Mask each PII instance
    detection.spans.forEach((span) => {
      const masked = maskPII(span.text, span.type, {
        preserveLength: true,
        maskChar: "•",
      }).masked;

      safeData = safeData.replace(span.text, masked);
    });

    console.log(`[DEBUG:${context}] ${safeData}`);
  } else {
    console.log(`[DEBUG:${context}] ${jsonString}`);
  }
}

// Usage
const userData = {
  id: 123,
  email: "user@example.com",
  preferences: { theme: "dark" },
};

debugSafeLog(userData, "user-login");
// Output: [DEBUG:user-login] {"id":123,"email":"u•••@example.com","preferences":{"theme":"dark"}}
```

## 🔒 Security Best Practices

### Consistent Masking

```typescript
// ✅ Use consistent masking across application
const MASKING_CONFIG = {
  email: { visibleStart: 1, visibleEnd: 0, maskChar: "*" },
  phone: { preserveAreaCode: true, visibleEnd: 4, maskChar: "*" },
  name: { preserveFirstLetter: true, maskChar: "*" },
  creditcard: { preserveLast4: true, groupSeparator: " ", maskChar: "*" },
};

function maskConsistently(value: string, type: string) {
  return maskPII(value, type, MASKING_CONFIG[type]);
}
```

### Prevent Unmasking

```typescript
// ✅ Ensure masked data can't be easily reversed
function secureMask(value: string, type: string) {
  const result = maskPII(value, type);

  // Don't include original value in metadata
  delete result.metadata?.originalValue;
  delete result.metadata?.unmaskingHint;

  return {
    masked: result.masked,
    pattern: result.pattern,
    // Safe metadata only
    metadata: {
      type,
      maskedLength: result.masked.length,
      timestamp: Date.now(),
    },
  };
}
```

### Audit Masking Operations

```typescript
// ✅ Log masking operations for audit
function auditedMask(value: string, type: string, context: string) {
  const result = maskPII(value, type);

  // Log masking event (without original value)
  console.log(
    JSON.stringify({
      event: "pii_masked",
      type,
      context,
      maskedLength: result.masked.length,
      originalLength: result.originalLength,
      timestamp: new Date().toISOString(),
      // Never log original value
    }),
  );

  return result;
}
```

## 🎯 Why Masking Matters in PII Context

### User Experience Benefits

1. **Trust Building**: Users see their data is protected
2. **Verification**: "Send to j\*\*\*@example.com?" builds confidence
3. **Error Prevention**: Partial display prevents typos in critical operations
4. **Context Preservation**: Users recognize their data without full exposure

### Developer Benefits

1. **Debug Safety**: Preserve data structure while hiding sensitive content
2. **Demo Data**: Safe data for presentations and testing
3. **Progressive Disclosure**: Reveal information based on verification
4. **Compliance Support**: Meet "need to know" requirements

### Legal Compliance

1. **GDPR Data Minimization**: Show only necessary information
2. **PCI DSS**: Proper credit card number display requirements
3. **HIPAA**: Patient information display guidelines
4. **SOX**: Financial data handling requirements

---

**Next Steps:**

- 🚫 **Learn redaction**: [Redaction Documentation](./redaction.md)
- 🔧 **Explore normalization**: [Normalization Documentation](./normalization.md)
- ⚖️ **Understand policies**: [Policy Engine Documentation](./policy-engine.md)
