# Validation Module

The Validation module provides comprehensive verification of PII data formats, ensuring data quality and compliance before storage or processing.

## 📧 Email Validation

### Basic Usage

```typescript
import { validateEmail } from "privakit";

const result = validateEmail("user@example.com");
console.log(result.isValid); // true
console.log(result.errors); // []
console.log(result.domain); // "example.com"
console.log(result.localPart); // "user"
```

### Advanced Options

```typescript
import { validateEmail, EmailValidationOptions } from "privakit";

const options: EmailValidationOptions = {
  allowDisplayName: false, // Reject "John Doe <john@example.com>"
  requireTld: true, // Require top-level domain
  allowUtf8LocalPart: true, // Allow international characters
  allowIpDomain: false, // Reject "user@192.168.1.1"
  domainSpecificValidation: true, // Enable domain rules
  blacklistedDomains: ["spam.com"],
  whitelistedDomains: ["company.com", "partner.org"],
};

const result = validateEmail("user@company.com", options);
```

### Disposable Email Detection

```typescript
import { validateEmail, isDisposableEmail } from "privakit";

// Check if email is from disposable provider
const result = validateEmail("test@10minutemail.com");
console.log(result.isDisposable); // true

// Quick check
console.log(isDisposableEmail("temp@guerrillamail.com")); // true
```

### Email Normalization

```typescript
import { normalizeEmailAddress } from "privakit";

// Basic normalization (lowercase)
console.log(normalizeEmailAddress("USER@EXAMPLE.COM")); // "user@example.com"

// Provider-specific normalization
console.log(normalizeEmailAddress("user.name+tag@gmail.com"));
// Result varies based on provider rules
```

### Batch Validation

```typescript
import { validateEmails } from "privakit";

const emails = ["valid@example.com", "invalid-email", "another@test.com"];

const results = validateEmails(emails);
results.forEach((result, index) => {
  console.log(`Email ${index + 1}: ${result.isValid ? "Valid" : "Invalid"}`);
});
```

### Why Email Validation Matters

**PII Context**: Email addresses are high-value PII that can:

- Identify specific individuals
- Be used for unauthorized access attempts
- Reveal organizational affiliations
- Enable targeted phishing attacks

**Compliance Requirements**:

- **GDPR**: Requires lawful basis for processing
- **CCPA**: Classified as personal information
- **CAN-SPAM**: Requires opt-in consent

---

## 📞 Phone Validation

### Basic Usage

```typescript
import { validatePhone } from "privakit";

const result = validatePhone("+1 (555) 123-4567");
console.log(result.isValid); // true
console.log(result.e164Format); // "+15551234567"
console.log(result.internationalFormat); // "+1 555 123 4567"
console.log(result.country); // "US"
console.log(result.type); // "mobile" | "landline" | etc.
```

### International Support

```typescript
import { validatePhone } from "privakit";

// US number
const usResult = validatePhone("(555) 123-4567", {
  defaultCountry: "US",
});

// UK number
const ukResult = validatePhone("+44 20 7946 0958");
console.log(ukResult.country); // "GB"

// Auto-detect country from international format
const autoResult = validatePhone("+33 1 42 86 83 26");
console.log(autoResult.country); // "FR"
```

### Advanced Options

```typescript
import { validatePhone, PhoneValidationOptions } from "privakit";

const options: PhoneValidationOptions = {
  defaultCountry: "US",
  allowInternational: true,
  allowNational: true,
  allowMobile: true,
  allowLandline: false, // Reject landline numbers
  allowTollFree: false, // Reject 1-800 numbers
  strictValidation: true, // Require perfect format
  allowedCountries: ["US", "CA", "MX"],
  blockedCountries: ["XX"], // Block specific countries
};

const result = validatePhone("555-1234", options);
```

### Phone Type Detection

```typescript
import { getPhoneType, isMobilePhone } from "privakit";

console.log(getPhoneType("+1-555-123-4567")); // "MOBILE"
console.log(isMobilePhone("+1-555-123-4567")); // true
```

### Phone Normalization

```typescript
import { normalizePhoneNumber, formatPhone } from "privakit";

// Normalize to E.164 format
console.log(normalizePhoneNumber("(555) 123-4567", "US")); // "+15551234567"

// Format for display
console.log(formatPhone("+15551234567", "NATIONAL")); // "(555) 123-4567"
console.log(formatPhone("+15551234567", "INTERNATIONAL")); // "+1 555 123 4567"
```

### Why Phone Validation Matters

**PII Context**: Phone numbers are sensitive because they:

- Enable direct contact with individuals
- Often used for 2FA and account recovery
- Can reveal location information
- May be linked to other services

**Compliance Considerations**:

- **TCPA**: Requires consent for automated calls/texts
- **GDPR**: Processing requires lawful basis
- **Local regulations**: Country-specific telecom rules

---

## 👤 Name Validation

### Basic Usage

```typescript
import { validateName } from "privakit";

const result = validateName("John Doe");
console.log(result.isValid); // true
console.log(result.firstName); // "John"
console.log(result.lastName); // "Doe"
console.log(result.isLikelyName); // true
console.log(result.nameType); // "person"
console.log(result.confidence); // "high"
```

### Advanced Options

```typescript
import { validateName, NameValidationOptions } from "privakit";

const options: NameValidationOptions = {
  allowMiddleName: true,
  allowSuffix: true, // Jr., Sr., III, etc.
  allowPrefix: true, // Dr., Mr., Ms., etc.
  minLength: 2,
  maxLength: 50,
  allowNonLatin: true, // Allow international characters
  requireTitleCase: false,
  allowSingleName: false, // Require first + last name
  blacklistedNames: ["test", "admin", "user"],
  customPatterns: [/^[A-Z][a-z]+ [A-Z][a-z]+$/], // Custom validation
};

const result = validateName("Dr. John Michael Smith Jr.", options);
console.log(result.prefix); // "Dr."
console.log(result.firstName); // "John"
console.log(result.middleName); // "Michael"
console.log(result.lastName); // "Smith"
console.log(result.suffix); // "Jr."
```

### NLP-Powered Detection

```typescript
import { validateName, isLikelyPersonName } from "privakit";

// Uses compromise.js for intelligent name detection
const result = validateName("Jean-Claude Van Damme");
console.log(result.confidence); // "high" - NLP detected person name

// Quick person name check
console.log(isLikelyPersonName("Microsoft Corporation")); // false
console.log(isLikelyPersonName("Jane Smith")); // true
```

### Name Normalization

```typescript
import {
  normalizePersonName,
  normalizeNameCapitalization,
  createFullName,
} from "privakit";

// Fix capitalization
console.log(normalizeNameCapitalization("john doe")); // "John Doe"
console.log(normalizeNameCapitalization("MARY JOHNSON")); // "Mary Johnson"

// Handle special cases
console.log(normalizeNameCapitalization("o'connor")); // "O'Connor"
console.log(normalizeNameCapitalization("jean-paul")); // "Jean-Paul"

// Create full name from parts
const fullName = createFullName({
  prefix: "Dr.",
  first: "John",
  middle: "Michael",
  last: "Smith",
  suffix: "Jr.",
});
console.log(fullName); // "Dr. John Michael Smith Jr."
```

### Extract Name Parts

```typescript
import { extractNameParts } from "privakit";

const parts = extractNameParts("Dr. Elizabeth Jane Wilson-Smith III");
console.log(parts.first); // "Elizabeth"
console.log(parts.middle); // "Jane"
console.log(parts.last); // "Wilson-Smith"
```

### Why Name Validation Matters

**PII Context**: Names are highly sensitive because they:

- Directly identify individuals
- Often combined with other data for identification
- Carry cultural and personal significance
- May reveal ethnicity, gender, or background

**Legal Considerations**:

- **GDPR Article 4**: Names are explicitly PII
- **CCPA**: Names are personal information
- **Cultural sensitivity**: International name formats vary

---

## 🏠 Address Validation

### Basic Usage

```typescript
import { validateAddress } from "privakit";

const address = `123 Main Street
Anytown, ST 12345
United States`;

const result = validateAddress(address);
console.log(result.isValid); // true
console.log(result.components); // Parsed address parts
console.log(result.addressType); // "residential" | "commercial" | "po_box"
console.log(result.isComplete); // true if all required parts present
```

### Address Components

```typescript
const result = validateAddress("123 Main St, Apt 4B, Anytown, ST 12345");

console.log(result.components.streetNumber); // "123"
console.log(result.components.streetName); // "Main St"
console.log(result.components.apartmentNumber); // "4B"
console.log(result.components.city); // "Anytown"
console.log(result.components.state); // "ST"
console.log(result.components.postalCode); // "12345"
console.log(result.components.country); // "US" (if detected)
```

### Advanced Options

```typescript
import { validateAddress, AddressValidationOptions } from "privakit";

const options: AddressValidationOptions = {
  country: "US",
  allowPoBox: false, // Reject PO Box addresses
  requirePostalCode: true, // Must include ZIP/postal code
  requireCountry: false,
  strictFormat: true, // Require complete address
  allowApartmentNumbers: true,
  maxLineLength: 100,
  allowedCountries: ["US", "CA", "MX"],
  blockedCountries: ["XX"],
};

const result = validateAddress(address, options);
```

### PO Box Detection

```typescript
import { validateAddress, isPoBoxAddress } from "privakit";

console.log(isPoBoxAddress("PO Box 1234")); // true
console.log(isPoBoxAddress("P.O. Box 5678")); // true
console.log(isPoBoxAddress("123 Main St")); // false

const result = validateAddress("PO Box 1234");
console.log(result.addressType); // "po_box"
console.log(result.components.poBox); // "1234"
```

### Address Formatting

```typescript
import { formatAddress, normalizeCountry } from "privakit";

const components = {
  streetNumber: "123",
  streetName: "Main Street",
  apartmentNumber: "4B",
  city: "Anytown",
  state: "ST",
  postalCode: "12345",
  country: "US",
};

const formatted = formatAddress(components);
console.log(formatted);
// Output:
// 123 Main Street Apt 4B
// Anytown, ST 12345
// US

// Normalize country names
console.log(normalizeCountry("United States")); // "US"
console.log(normalizeCountry("uk")); // "UK"
```

### Postal Code Extraction

```typescript
import { extractPostalCode } from "privakit";

console.log(extractPostalCode("123 Main St, City, ST 12345")); // "12345"
console.log(extractPostalCode("Address in Toronto, ON M5V 3A8")); // "M5V 3A8"
console.log(extractPostalCode("London SW1A 1AA, UK")); // "SW1A 1AA"
```

### Why Address Validation Matters

**PII Context**: Addresses are sensitive because they:

- Reveal exact physical location
- Enable physical contact/visits
- Often combined with names for full identification
- May indicate socioeconomic status

**Privacy Implications**:

- **Stalking/harassment**: Physical location enables targeting
- **Discrimination**: Address may reveal protected characteristics
- **Security**: Home addresses enable social engineering

---

## 🛠️ Validation Utilities

### Batch Processing

```typescript
import {
  validateEmails,
  validatePhones,
  validateNames,
  validateAddresses,
} from "privakit";

// Validate multiple items of same type
const emails = ["user1@example.com", "user2@test.com"];
const results = validateEmails(emails, options);

// Process mixed validation results
results.forEach((result, index) => {
  if (!result.isValid) {
    console.error(`Email ${index + 1} failed:`, result.errors);
  }
});
```

### Locale-Aware Validation

```typescript
import {
  createPhoneOptionsFromLocale,
  createAddressOptionsFromLocale,
} from "privakit";

const locale = {
  country: "US",
  language: "en",
  region: "NA",
  timezone: "America/New_York",
};

// Create locale-specific options
const phoneOptions = createPhoneOptionsFromLocale(locale);
const addressOptions = createAddressOptionsFromLocale(locale);

// Use in validation
const phoneResult = validatePhone("555-1234", phoneOptions);
const addressResult = validateAddress("123 Main St", addressOptions);
```

### Error Handling

```typescript
import { validateEmail, PIIValidationError, isPrivakitError } from "privakit";

try {
  const result = validateEmail(userInput);

  if (!result.isValid) {
    // Handle validation errors
    result.errors.forEach((error) => {
      console.error(`${error.code}: ${error.message}`);
    });
  }
} catch (error) {
  if (isPrivakitError(error)) {
    console.error("Privakit validation error:", error.code);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

### Custom Validation

```typescript
import { ValidationResult, PIIType } from "privakit";

// Create custom validator
function validateCustomId(id: string): ValidationResult<string> {
  const errors = [];

  if (!/^CID-\d{6}$/.test(id)) {
    errors.push({
      code: "INVALID_FORMAT",
      message: "Custom ID must follow format CID-123456",
      field: "customId",
      value: id,
    });
  }

  return {
    isValid: errors.length === 0,
    value: errors.length === 0 ? id : undefined,
    normalized: id.toUpperCase(),
    errors,
    metadata: { type: PIIType.NationalID },
  };
}

const result = validateCustomId("cid-123456");
console.log(result.normalized); // "CID-123456"
```

## 🔒 Security Best Practices

### Input Sanitization

```typescript
// ✅ Always validate before processing
const userEmail = request.body.email;
const validation = validateEmail(userEmail);

if (!validation.isValid) {
  return res.status(400).json({
    error: "Invalid email format",
    details: validation.errors,
  });
}

// Use validated value
const normalizedEmail = validation.normalized;
```

### Safe Error Messages

```typescript
// ✅ Don't expose sensitive data in errors
try {
  const result = validateEmail(sensitiveInput);
  if (!result.isValid) {
    // Generic error message (don't echo input)
    throw new Error("Email validation failed");
  }
} catch (error) {
  // Log details securely (not to user)
  logger.error("Validation error", {
    error: error.message,
    // Don't log the actual input value
  });

  // Return generic message to user
  return { error: "Invalid input format" };
}
```

### Validation Chaining

```typescript
// ✅ Multi-layer validation
const email = userInput.email;

// 1. Format validation
const formatCheck = validateEmail(email);
if (!formatCheck.isValid) {
  throw new Error("Invalid email format");
}

// 2. Normalization
const normalized = normalizeEmailAddress(email);

// 3. Business rule validation
const businessCheck = validateEmail(normalized, {
  blacklistedDomains: companyBlacklist,
  domainSpecificValidation: true,
});

if (!businessCheck.isValid) {
  throw new Error("Email not allowed by policy");
}

// 4. Final validation before storage
const finalEmail = businessCheck.normalized;
```

---

**Next Steps:**

- 🔍 **Learn detection**: [Detection Documentation](./detection.md)
- 🎭 **Explore masking**: [Masking Documentation](./masking.md)
- ⚖️ **Understand policies**: [Policy Engine Documentation](./policy-engine.md)
