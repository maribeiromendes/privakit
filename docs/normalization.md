# Normalization Module

The Normalization module standardizes PII data formats across different locales, providers, and input variations. This ensures consistent data storage, comparison, and processing while maintaining data integrity and international compatibility.

## 🔄 Basic Normalization Concepts

### Why Normalize PII?

```typescript
import { normalizeEmailAddress, normalizePhoneNumber } from "privakit";

// Different input formats for the same data
const emailVariations = [
  "USER@EXAMPLE.COM",
  "User@Example.com",
  "user@example.com",
  "  user@example.com  ",
];

// All normalize to the same format
emailVariations.forEach((email) => {
  console.log(normalizeEmailAddress(email).normalized);
  // All output: "user@example.com"
});

// Phone number variations
const phoneVariations = [
  "(555) 123-4567",
  "555-123-4567",
  "555.123.4567",
  "+1 555 123 4567",
  "15551234567",
];

// All normalize to E.164 format
phoneVariations.forEach((phone) => {
  console.log(normalizePhoneNumber(phone, "US").e164);
  // All output: "+15551234567"
});
```

### Benefits of Normalization

1. **Data Consistency**: Uniform formats across your application
2. **Deduplication**: Identify and merge duplicate records
3. **Validation**: Catch format errors and inconsistencies
4. **Internationalization**: Handle global data formats correctly
5. **Database Optimization**: Consistent indexing and searching
6. **Integration**: Compatible data for third-party services

## 📧 Email Normalization

### Basic Email Normalization

```typescript
import { normalizeEmailAddress } from "privakit";

// Standard normalization
const result = normalizeEmailAddress("USER@EXAMPLE.COM");
console.log(result.normalized); // "user@example.com"
console.log(result.isValid); // true
console.log(result.domain); // "example.com"
console.log(result.localPart); // "user"
```

### Advanced Email Options

```typescript
import { normalizeEmail, EmailNormalizationOptions } from "privakit";

const options: EmailNormalizationOptions = {
  lowercase: true, // Convert to lowercase
  removeComments: true, // Remove RFC comments
  removeDots: false, // Keep dots in Gmail addresses
  removeSubaddressing: false, // Keep + suffixes
  validateDomain: true, // Check domain validity
  punycodeDomains: true, // Handle international domains
};

const result = normalizeEmailAddress("User+Tag@Example.COM", options);
console.log(result.normalized); // "user+tag@example.com"
console.log(result.hasSubaddress); // true
console.log(result.subaddress); // "tag"
```

### Gmail-Specific Normalization

```typescript
// Handle Gmail's special rules
function normalizeGmail(email: string) {
  const result = normalizeEmailAddress(email, {
    removeDots: true, // Gmail ignores dots
    removeSubaddressing: true, // Remove everything after +
    lowercase: true,
  });

  if (result.domain === "gmail.com" || result.domain === "googlemail.com") {
    return {
      ...result,
      canonical: result.localPart.replace(/\./g, "") + "@gmail.com",
      isGmail: true,
    };
  }

  return result;
}

console.log(normalizeGmail("User.Name+label@gmail.com"));
// Output: canonical: "username@gmail.com"
```

### Corporate Email Handling

```typescript
// Handle corporate email policies
function normalizeCorporateEmail(email: string, domain: string) {
  const result = normalizeEmailAddress(email);

  if (result.domain === domain) {
    return {
      ...result,
      isCorporate: true,
      department: extractDepartment(result.localPart),
      employeeId: extractEmployeeId(result.localPart),
    };
  }

  return result;
}

function extractDepartment(localPart: string): string | null {
  // Handle formats like: firstname.lastname.dept@company.com
  const parts = localPart.split(".");
  if (parts.length > 2) {
    return parts[parts.length - 1]; // Last part is department
  }
  return null;
}
```

### International Email Support

```typescript
// Handle international domains and characters
const internationalEmails = [
  "user@日本.jp", // Japanese domain
  "müller@example.de", // German umlaut
  "josé@empresa.es", // Spanish accent
  "пример@почта.рф", // Cyrillic
];

internationalEmails.forEach((email) => {
  const result = normalizeEmailAddress(email, {
    punycodeDomains: true, // Convert to ASCII
    unicodeNormalization: true, // Normalize Unicode characters
  });

  console.log(`Original: ${email}`);
  console.log(`Normalized: ${result.normalized}`);
  console.log(`Punycode: ${result.punycodeForm}`);
});
```

## 📞 Phone Number Normalization

### Basic Phone Normalization

```typescript
import { normalizePhoneNumber } from "privakit";

// US phone number
const result = normalizePhoneNumber("(555) 123-4567", "US");
console.log(result.e164); // "+15551234567"
console.log(result.national); // "(555) 123-4567"
console.log(result.international); // "+1 555 123 4567"
console.log(result.isValid); // true
console.log(result.country); // "US"
console.log(result.type); // "FIXED_LINE_OR_MOBILE"
```

### International Phone Support

```typescript
// Different country formats
const phoneNumbers = [
  { number: "+44 20 7946 0958", country: "GB" }, // UK
  { number: "+33 1 42 86 83 26", country: "FR" }, // France
  { number: "+49 30 12345678", country: "DE" }, // Germany
  { number: "+81 3 1234 5678", country: "JP" }, // Japan
  { number: "+55 11 99999-9999", country: "BR" }, // Brazil
];

phoneNumbers.forEach(({ number, country }) => {
  const result = normalizePhoneNumber(number, country);
  console.log(`${country}: ${result.e164} (${result.type})`);
});
```

### Phone Type Detection

```typescript
// Detect and normalize by phone type
function normalizeByType(phone: string, country: string) {
  const result = normalizePhoneNumber(phone, country);

  return {
    ...result,
    category: categorizePhone(result.type),
    businessHours: getBusinessHours(result.type),
    preferred: getPreferredFormat(result.type),
  };
}

function categorizePhone(type: string): string {
  switch (type) {
    case "MOBILE":
    case "FIXED_LINE_OR_MOBILE":
      return "mobile";
    case "FIXED_LINE":
      return "landline";
    case "TOLL_FREE":
      return "support";
    case "PREMIUM_RATE":
      return "premium";
    default:
      return "unknown";
  }
}
```

### Mobile vs Landline Handling

```typescript
// Different normalization strategies for mobile vs landline
function normalizePhoneByUsage(
  phone: string,
  country: string,
  usage: "sms" | "voice" | "both",
) {
  const result = normalizePhoneNumber(phone, country);

  if (usage === "sms" && result.type !== "MOBILE") {
    return {
      ...result,
      smsCapable: false,
      warning: "SMS not supported on this number type",
    };
  }

  if (usage === "voice" && result.type === "PREMIUM_RATE") {
    return {
      ...result,
      costWarning: true,
      warning: "Premium rate number - charges may apply",
    };
  }

  return {
    ...result,
    smsCapable:
      result.type === "MOBILE" || result.type === "FIXED_LINE_OR_MOBILE",
    voiceCapable: true,
  };
}
```

### Regional Format Preferences

```typescript
// Format phones according to regional preferences
function formatForRegion(
  phone: string,
  inputCountry: string,
  displayCountry: string,
) {
  const normalized = normalizePhoneNumber(phone, inputCountry);

  if (inputCountry === displayCountry) {
    // Same country - use national format
    return {
      display: normalized.national,
      format: "national",
    };
  } else {
    // Different country - use international format
    return {
      display: normalized.international,
      format: "international",
    };
  }
}

// Examples
console.log(formatForRegion("555-123-4567", "US", "US"));
// Output: { display: "(555) 123-4567", format: "national" }

console.log(formatForRegion("555-123-4567", "US", "GB"));
// Output: { display: "+1 555 123 4567", format: "international" }
```

## 👤 Name Normalization

### Basic Name Normalization

```typescript
import { normalizePersonName } from "privakit";

// Standard name normalization
const result = normalizePersonName("  JOHN   DOE  ");
console.log(result.normalized); // "John Doe"
console.log(result.firstName); // "John"
console.log(result.lastName); // "Doe"
console.log(result.fullName); // "John Doe"
```

### Complex Name Handling

```typescript
import { normalizeName, NameNormalizationOptions } from "privakit";

const options: NameNormalizationOptions = {
  titleCase: true, // Proper case conversion
  removeExtraSpaces: true, // Clean up spacing
  handlePrefixes: true, // Process titles (Dr., Mr., etc.)
  handleSuffixes: true, // Process suffixes (Jr., III, etc.)
  preserveHyphens: true, // Keep hyphenated names intact
  culturalNames: "western", // Name format style
};

const result = normalizePersonName("DR. JEAN-PIERRE VAN DER BERG III", options);
console.log(result.title); // "Dr."
console.log(result.firstName); // "Jean-Pierre"
console.log(result.middleName); // "Van Der"
console.log(result.lastName); // "Berg"
console.log(result.suffix); // "III"
console.log(result.fullName); // "Dr. Jean-Pierre Van Der Berg III"
```

### Cultural Name Patterns

```typescript
// Handle different cultural naming conventions
function normalizeByCulture(
  name: string,
  culture: "western" | "eastern" | "spanish" | "arabic",
) {
  switch (culture) {
    case "western":
      return normalizePersonName(name, {
        titleCase: true,
        order: "first-last",
        handleMiddleNames: true,
      });

    case "eastern":
      // Many Asian cultures: Family name first
      return normalizePersonName(name, {
        titleCase: true,
        order: "family-given",
        preserveOrder: true,
      });

    case "spanish":
      // Spanish: Two surnames common
      return normalizePersonName(name, {
        titleCase: true,
        multipleSurnames: true,
        maternalSurname: true,
      });

    case "arabic":
      // Arabic: Patronymic naming
      return normalizePersonName(name, {
        titleCase: true,
        handlePatronymic: true,
        preserveArabicScript: true,
      });
  }
}
```

### Business Name vs Personal Name

```typescript
// Distinguish between personal and business names
function normalizeNameByType(name: string, type: "personal" | "business") {
  if (type === "business") {
    return {
      normalized: name.trim(),
      type: "business",
      isPersonal: false,
      businessIndicators: detectBusinessIndicators(name),
    };
  }

  const result = normalizePersonName(name, {
    titleCase: true,
    removeExtraSpaces: true,
  });

  return {
    ...result,
    type: "personal",
    isPersonal: true,
  };
}

function detectBusinessIndicators(name: string): string[] {
  const indicators = [];
  const businessSuffixes = ["LLC", "Inc", "Corp", "Ltd", "Co", "Company"];

  businessSuffixes.forEach((suffix) => {
    if (name.toUpperCase().includes(suffix.toUpperCase())) {
      indicators.push(suffix);
    }
  });

  return indicators;
}
```

### Name Matching and Fuzzy Comparison

```typescript
// Normalize names for comparison and deduplication
function normalizeForMatching(name: string) {
  const result = normalizePersonName(name, {
    titleCase: false, // Lowercase for comparison
    removeExtraSpaces: true,
    removePunctuation: true, // Remove apostrophes, hyphens
    handleNicknames: true, // Convert nicknames to full names
  });

  return {
    ...result,
    searchableForm: result.normalized.toLowerCase().replace(/[^a-z\s]/g, ""),
    phoneticForm: generatePhoneticForm(result.normalized),
    metaphone: generateMetaphone(result.normalized),
  };
}

function generatePhoneticForm(name: string): string {
  // Simplified phonetic algorithm (use library like metaphone in production)
  return name
    .toLowerCase()
    .replace(/ph/g, "f")
    .replace(/ck/g, "k")
    .replace(/[aeiou]/g, "") // Remove vowels for consonant matching
    .replace(/[^a-z]/g, "");
}
```

## 🏠 Address Normalization

### Basic Address Normalization

```typescript
import { normalizeAddress } from "privakit";

// US address normalization
const result = normalizeAddress("123 main st apt 4b anytown st 12345");
console.log(result.normalized);
// Output: "123 Main Street Apt 4B, Anytown, ST 12345"

console.log(result.components);
// Output: {
//   streetNumber: "123",
//   streetName: "Main Street",
//   apartment: "Apt 4B",
//   city: "Anytown",
//   state: "ST",
//   postalCode: "12345",
//   country: "US"
// }
```

### International Address Support

```typescript
// Handle different international formats
const addresses = [
  {
    address: "1-2-3 Shibuya, Shibuya-ku, Tokyo 150-0002",
    country: "JP",
    format: "japanese",
  },
  {
    address: "123 High Street, London SW1A 1AA",
    country: "GB",
    format: "uk",
  },
  {
    address: "Musterstraße 123, 12345 Berlin",
    country: "DE",
    format: "german",
  },
];

addresses.forEach(({ address, country, format }) => {
  const result = normalizeAddress(address, {
    country,
    format,
    validatePostalCode: true,
  });

  console.log(`${country}: ${result.normalized}`);
  console.log(`Valid: ${result.isValid}`);
});
```

### Address Component Extraction

```typescript
// Extract and standardize address components
function standardizeAddressComponents(address: string, country: string) {
  const result = normalizeAddress(address, { country });

  return {
    ...result.components,
    // Standardized formats
    streetAddress: `${result.components.streetNumber} ${result.components.streetName}`,
    cityStateZip: `${result.components.city}, ${result.components.state} ${result.components.postalCode}`,
    fullAddress: result.normalized,

    // Validation flags
    hasApartment: !!result.components.apartment,
    isPoBox: result.components.streetName?.toLowerCase().includes("po box"),
    isValid: result.isValid,

    // Geocoding readiness
    geocodingFormat: formatForGeocoding(result.components),
  };
}

function formatForGeocoding(components: any): string {
  // Format optimized for geocoding services
  const parts = [
    components.streetNumber,
    components.streetName,
    components.city,
    components.state,
    components.postalCode,
    components.country,
  ].filter(Boolean);

  return parts.join(", ");
}
```

### Address Type Classification

```typescript
// Classify address types for different handling
function classifyAddress(address: string) {
  const result = normalizeAddress(address);
  const classification = {
    type: "unknown",
    confidence: 0,
    indicators: [],
  };

  // Check for business indicators
  const businessIndicators = ["suite", "floor", "building", "office", "ste"];
  const hasBusinessIndicators = businessIndicators.some((indicator) =>
    address.toLowerCase().includes(indicator),
  );

  if (hasBusinessIndicators) {
    classification.type = "business";
    classification.confidence = 0.8;
    classification.indicators.push("business_keywords");
  }

  // Check for residential indicators
  const residentialIndicators = ["apt", "apartment", "unit", "#"];
  const hasResidentialIndicators = residentialIndicators.some((indicator) =>
    address.toLowerCase().includes(indicator),
  );

  if (hasResidentialIndicators) {
    classification.type = "residential";
    classification.confidence = 0.7;
    classification.indicators.push("residential_keywords");
  }

  // Check for PO Box
  if (
    address.toLowerCase().includes("po box") ||
    address.toLowerCase().includes("p.o. box")
  ) {
    classification.type = "pobox";
    classification.confidence = 0.9;
    classification.indicators.push("po_box");
  }

  return {
    ...result,
    classification,
  };
}
```

## 🔧 Batch Normalization

### Bulk Processing

```typescript
import { normalizeMultiple } from "privakit";

// Normalize multiple emails at once
const emails = [
  "USER@EXAMPLE.COM",
  "  admin@test.org  ",
  "Support+Help@Company.Co.UK",
];

const results = normalizeMultiple(emails, "email", {
  lowercase: true,
  removeSubaddressing: false,
});

results.forEach((result, index) => {
  console.log(`Email ${index + 1}: ${result.normalized}`);
  console.log(`Valid: ${result.isValid}`);
});
```

### Database Migration Helper

```typescript
// Helper for normalizing existing database records
async function normalizeUserData(userTable: string) {
  const users = await database.query(
    `SELECT id, email, phone, name FROM ${userTable}`,
  );
  const updates = [];

  for (const user of users) {
    const normalizedEmail = normalizeEmailAddress(user.email);
    const normalizedPhone = normalizePhoneNumber(user.phone, "US");
    const normalizedName = normalizePersonName(user.name);

    // Only update if normalization changed the data
    if (
      normalizedEmail.normalized !== user.email ||
      normalizedPhone.e164 !== user.phone ||
      normalizedName.normalized !== user.name
    ) {
      updates.push({
        id: user.id,
        email: normalizedEmail.normalized,
        phone: normalizedPhone.e164,
        name: normalizedName.normalized,
        migration_date: new Date(),
      });
    }
  }

  // Batch update
  if (updates.length > 0) {
    await database.batchUpdate(userTable, updates);
    console.log(`Normalized ${updates.length} user records`);
  }

  return {
    totalRecords: users.length,
    normalizedRecords: updates.length,
    migrationCompleted: true,
  };
}
```

### Data Deduplication

```typescript
// Use normalization to find and merge duplicates
async function deduplicateUsers() {
  const users = await database.query("SELECT * FROM users");
  const normalizedUsers = new Map();
  const duplicates = [];

  users.forEach((user) => {
    // Create a composite key from normalized data
    const normalizedEmail = normalizeEmailAddress(user.email).normalized;
    const normalizedPhone = normalizePhoneNumber(user.phone, "US").e164;
    const normalizedName = normalizePersonName(user.name).normalized;

    const key = `${normalizedEmail}|${normalizedPhone}|${normalizedName}`;

    if (normalizedUsers.has(key)) {
      // Duplicate found
      const existing = normalizedUsers.get(key);
      duplicates.push({
        originalUser: existing,
        duplicateUser: user,
        matchKey: key,
      });
    } else {
      normalizedUsers.set(key, user);
    }
  });

  return {
    uniqueUsers: Array.from(normalizedUsers.values()),
    duplicates,
    deduplicationRate: duplicates.length / users.length,
  };
}
```

## 🌐 Locale-Aware Normalization

### Regional Preferences

```typescript
// Adapt normalization to regional preferences
function normalizeForLocale(data: any, locale: string) {
  const [language, country] = locale.split("-");

  return {
    email: normalizeEmailAddress(data.email, {
      lowercase: true,
      validateDomain: true,
    }),

    phone: normalizePhoneNumber(data.phone, country, {
      format: getPreferredPhoneFormat(country),
    }),

    name: normalizePersonName(data.name, {
      titleCase: true,
      culturalNames: getCulturalNameStyle(country),
    }),

    address: normalizeAddress(data.address, {
      country,
      format: getAddressFormat(country),
      validatePostalCode: true,
    }),
  };
}

function getPreferredPhoneFormat(country: string): string {
  const formats = {
    US: "national",
    GB: "national",
    DE: "international",
    JP: "national",
  };

  return formats[country] || "international";
}
```

### Multi-Language Support

```typescript
// Handle multilingual data normalization
function normalizeMultilingual(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
) {
  // Transliterate if needed (e.g., Cyrillic to Latin)
  if (needsTransliteration(sourceLanguage, targetLanguage)) {
    text = transliterate(text, sourceLanguage, targetLanguage);
  }

  // Apply language-specific normalization rules
  switch (targetLanguage) {
    case "en":
      return normalizeEnglish(text);
    case "es":
      return normalizeSpanish(text);
    case "de":
      return normalizeGerman(text);
    default:
      return normalizeGeneric(text);
  }
}

function normalizeGerman(text: string): string {
  // Handle German umlauts and special characters
  return text
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .toLowerCase();
}
```

## ⚙️ Advanced Normalization

### Custom Normalization Rules

```typescript
// Define custom normalization rules for specific domains
class CustomNormalizer {
  private rules: Map<string, Function> = new Map();

  addRule(name: string, rule: Function) {
    this.rules.set(name, rule);
  }

  normalize(data: any, ruleName: string) {
    const rule = this.rules.get(ruleName);
    if (!rule) {
      throw new Error(`Normalization rule '${ruleName}' not found`);
    }

    return rule(data);
  }
}

// Usage
const normalizer = new CustomNormalizer();

// Add custom email rule for specific domain
normalizer.addRule("corporate_email", (email: string) => {
  const result = normalizeEmailAddress(email, {
    lowercase: true,
    removeSubaddressing: true, // Company policy: no subaddressing
  });

  // Add employee ID extraction
  const match = result.localPart.match(/(\w+)\.(\w+)/);
  if (match) {
    result.firstName = match[1];
    result.lastName = match[2];
    result.employeeFormat = true;
  }

  return result;
});
```

### Pipeline Normalization

```typescript
// Chain multiple normalization steps
class NormalizationPipeline {
  private steps: Array<(data: any) => any> = [];

  addStep(step: (data: any) => any) {
    this.steps.push(step);
    return this; // Enable chaining
  }

  process(data: any) {
    return this.steps.reduce((current, step) => step(current), data);
  }
}

// Usage
const pipeline = new NormalizationPipeline()
  .addStep((data) => ({
    ...data,
    email: normalizeEmailAddress(data.email).normalized,
  }))
  .addStep((data) => ({
    ...data,
    phone: normalizePhoneNumber(data.phone, "US").e164,
  }))
  .addStep((data) => ({
    ...data,
    name: normalizePersonName(data.name).normalized,
  }))
  .addStep((data) => validateNormalizedData(data));

const result = pipeline.process({
  email: "USER@EXAMPLE.COM",
  phone: "(555) 123-4567",
  name: "john doe",
});
```

### Conditional Normalization

```typescript
// Apply different normalization based on data characteristics
function smartNormalize(userData: any, context: string) {
  const result = { ...userData };

  // Email normalization
  if (userData.email) {
    const emailDomain = userData.email.split("@")[1]?.toLowerCase();

    if (emailDomain === "gmail.com") {
      // Gmail-specific normalization
      result.email = normalizeGmail(userData.email).canonical;
    } else if (isBusinessDomain(emailDomain)) {
      // Business email normalization
      result.email = normalizeEmailAddress(userData.email, {
        removeSubaddressing: false, // Keep business subaddressing
      }).normalized;
    } else {
      // Standard normalization
      result.email = normalizeEmailAddress(userData.email).normalized;
    }
  }

  // Context-specific phone normalization
  if (userData.phone) {
    if (context === "international") {
      result.phone = normalizePhoneNumber(
        userData.phone,
        userData.country || "US",
      ).international;
    } else {
      result.phone = normalizePhoneNumber(
        userData.phone,
        userData.country || "US",
      ).national;
    }
  }

  return result;
}
```

## 🎯 Real-World Use Cases

### CRM Data Cleanup

```typescript
// Clean and normalize CRM contact data
async function normalizeCRMContacts() {
  const contacts = await crmDatabase.getAllContacts();
  const normalizedContacts = [];
  const errors = [];

  for (const contact of contacts) {
    try {
      const normalized = {
        id: contact.id,
        firstName: normalizePersonName(contact.firstName).firstName,
        lastName: normalizePersonName(contact.lastName).lastName,
        email: normalizeEmailAddress(contact.email).normalized,
        phone: normalizePhoneNumber(contact.phone, contact.country || "US")
          .e164,
        address: normalizeAddress(contact.address, { country: contact.country })
          .normalized,

        // Metadata
        normalizedAt: new Date(),
        originalData: contact,
        country: contact.country || "US",
      };

      normalizedContacts.push(normalized);
    } catch (error) {
      errors.push({
        contactId: contact.id,
        error: error.message,
        originalData: contact,
      });
    }
  }

  return {
    normalizedContacts,
    errors,
    successRate: normalizedContacts.length / contacts.length,
  };
}
```

### E-commerce Customer Normalization

```typescript
// Normalize customer data for e-commerce platform
function normalizeCustomerData(customer: any) {
  const billingAddress = normalizeAddress(customer.billingAddress, {
    country: customer.billingCountry,
    validatePostalCode: true,
  });

  const shippingAddress = customer.shippingAddress
    ? normalizeAddress(customer.shippingAddress, {
        country: customer.shippingCountry,
        validatePostalCode: true,
      })
    : billingAddress;

  return {
    customerId: customer.id,

    // Contact information
    name: normalizePersonName(customer.name).normalized,
    email: normalizeEmailAddress(customer.email).normalized,
    phone: normalizePhoneNumber(customer.phone, customer.country).e164,

    // Addresses
    billingAddress: billingAddress.normalized,
    shippingAddress: shippingAddress.normalized,
    sameAddress: billingAddress.normalized === shippingAddress.normalized,

    // Validation
    isValidCustomer:
      billingAddress.isValid &&
      normalizeEmailAddress(customer.email).isValid &&
      normalizePhoneNumber(customer.phone, customer.country).isValid,

    // Preferences (preserved for targeting)
    country: customer.country,
    language: customer.language,
    currency: customer.currency,
  };
}
```

### Marketing List Normalization

```typescript
// Normalize marketing lists for better targeting and compliance
function normalizeMarketingList(subscribers: any[]) {
  const normalized = [];
  const duplicates = new Set();
  const invalid = [];

  subscribers.forEach((subscriber) => {
    try {
      const emailResult = normalizeEmailAddress(subscriber.email);
      const phoneResult = subscriber.phone
        ? normalizePhoneNumber(subscriber.phone, subscriber.country || "US")
        : null;

      if (!emailResult.isValid) {
        invalid.push({ ...subscriber, reason: "invalid_email" });
        return;
      }

      // Create unique key for deduplication
      const uniqueKey = `${emailResult.normalized}|${phoneResult?.e164 || ""}`;

      if (duplicates.has(uniqueKey)) {
        invalid.push({ ...subscriber, reason: "duplicate" });
        return;
      }

      duplicates.add(uniqueKey);

      normalized.push({
        email: emailResult.normalized,
        phone: phoneResult?.e164,
        name: normalizePersonName(subscriber.name || "").normalized,
        country: subscriber.country || "US",
        subscribeDate: subscriber.subscribeDate,
        preferences: subscriber.preferences,

        // Compliance tracking
        canEmail: emailResult.isValid,
        canSMS: phoneResult?.isValid && phoneResult?.type === "MOBILE",
        gdprCompliant: isGDPRCountry(subscriber.country),
        ccpaApplicable: isCCPAApplicable(subscriber.country, subscriber.state),
      });
    } catch (error) {
      invalid.push({ ...subscriber, reason: error.message });
    }
  });

  return {
    normalized,
    invalid,
    stats: {
      total: subscribers.length,
      valid: normalized.length,
      invalid: invalid.length,
      duplicates: invalid.filter((i) => i.reason === "duplicate").length,
    },
  };
}
```

## 🎯 Why Normalization Matters in PII Context

### Data Quality Benefits

1. **Consistency**: Uniform data formats across all systems
2. **Deduplication**: Identify and merge duplicate records accurately
3. **Validation**: Catch and fix data quality issues early
4. **Integration**: Compatible data for third-party services and APIs

### Privacy and Compliance

1. **Data Minimization**: Store data in most efficient, minimal format
2. **Audit Trails**: Consistent data for compliance reporting
3. **Right to Rectification**: Enable accurate data corrections
4. **Portability**: Standardized formats for data export/import

### Business Impact

1. **Customer Experience**: Consistent communication across channels
2. **Analytics Accuracy**: Clean data for better insights
3. **Cost Reduction**: Fewer failed deliveries and communications
4. **Operational Efficiency**: Reduced manual data cleanup

### Technical Benefits

1. **Database Performance**: Optimized indexing and querying
2. **Caching Efficiency**: Consistent keys for caching strategies
3. **API Reliability**: Predictable data formats for integrations
4. **Search Accuracy**: Improved matching and retrieval

---

**Next Steps:**

- 🎭 **Learn masking**: [Masking Documentation](./masking.md)
- 🚫 **Explore redaction**: [Redaction Documentation](./redaction.md)
- ⚖️ **Understand policies**: [Policy Engine Documentation](./policy-engine.md)
