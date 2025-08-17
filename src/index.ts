/**
 * Privakit - TypeScript/JavaScript library for handling Personally Identifiable Information (PII)
 * 
 * This library provides comprehensive tools for:
 * - PII validation and normalization
 * - Display-safe masking
 * - Secure redaction for logging
 * - Pattern-based detection with NLP
 * - Policy-driven PII handling
 * - Compliance with GDPR, CCPA, and other regulations
 */

// Core types and utilities
export * from './core/index.js';
import type { PIIType, PolicyOperation, IPolicyEngine as PolicyEngineType } from './core/types.js';

// Validation functions
import * as emailValidation from './validate/email.js';
import * as phoneValidation from './validate/phone.js';
import * as nameValidation from './validate/name.js';
import * as addressValidation from './validate/address.js';

// Normalization functions
import * as normalization from './normalize/index.js';

// Masking functions
import * as masking from './mask/index.js';

// Redaction functions
import * as redaction from './redact/index.js';

// Detection functions
import * as detection from './detect/index.js';

// Policy engine
import * as policy from './core/policy.js';

export const {
  validateEmail,
  normalizeEmail,
  isDisposableEmail,
  extractEmailDomain,
  validateEmails,
  isValidEmailFormat
} = emailValidation;

export const {
  validatePhone,
  normalizePhone,
  formatPhone,
  extractPhoneCountry,
  getPhoneType,
  isMobilePhone,
  isValidPhoneFormat,
  validatePhones,
  createPhoneOptionsFromLocale
} = phoneValidation;

export const {
  validateName,
  normalizeNameCapitalization,
  extractNameParts,
  isLikelyPersonName,
  validateNames,
  createFullName
} = nameValidation;

export const {
  validateAddress,
  formatAddress,
  normalizeCountry,
  extractPostalCode,
  isPoBoxAddress,
  validateAddresses,
  createAddressOptionsFromLocale
} = addressValidation;

export const {
  normalizeEmailAddress,
  normalizePhoneNumber,
  normalizePersonName,
  normalizeAddress,
  normalizePII,
  normalizeMultiple,
  createNormalizationOptionsFromLocale
} = normalization;

export const {
  maskEmail,
  maskPhone,
  maskName,
  maskAddress,
  maskCreditCard,
  maskPII,
  maskMultiple
} = masking;

export const {
  redactText,
  redactFromDetection,
  createSafeLogger,
  createRedactionMiddleware,
  redactObject,
  createRedactionSummary,
  redactMultiple,
  validateRedaction,
  getDefaultRedactionPatterns,
  addRedactionPattern,
  removeRedactionPattern
} = redaction;

export const {
  detectPII,
  detectPIIMultiple,
  createDetectionConfig,
  getDefaultPIIPatterns,
  addPIIPattern,
  removePIIPattern,
  hasPII,
  countPIIByType
} = detection;

export const {
  PolicyEngine,
  createPolicyEngine
} = policy;

// Type definitions for external consumption
export type {
  // Core types
  PIIType,
  RiskLevel,
  ConfidenceLevel,
  PIIDetectionResult,
  DetectionSpan,
  ValidationResult,
  ValidationError,
  MaskingOptions,
  MaskingResult,
  NormalizationOptions,
  NormalizationResult,
  PolicyRule,
  PolicyOperation,
  PolicyDecision,
  IPolicyEngine,
  LocaleContext,
  PIIPattern,
  DetectionConfig,
  
  // Validation types
  EmailValidationOptions,
  EmailValidationResult,
  PhoneValidationOptions,
  PhoneValidationResult,
  NameValidationOptions,
  NameValidationResult,
  AddressValidationOptions,
  AddressValidationResult,
  AddressComponent,
  
  // Normalization types
  EmailNormalizationOptions,
  PhoneNormalizationOptions,
  NameNormalizationOptions,
  AddressNormalizationOptions,
  
  // Masking types
  EmailMaskingOptions,
  PhoneMaskingOptions,
  NameMaskingOptions,
  AddressMaskingOptions,
  CreditCardMaskingOptions,
  
  // Redaction types
  RedactionOptions,
  RedactionPattern,
  RedactionResult,
  RedactedSpan,
  
  // Detection types
  DetectionOptions
} from './core/types.js';

// Error classes
export {
  PrivakitError,
  PIIValidationError,
  PIIDetectionError,
  PIIMaskingError,
  PIINormalizationError,
  PIIPolicyError,
  PIIPseudonymizationError,
  PIIAnonymizationError,
  PIIConfigurationError,
  PIILocaleError,
  ErrorCodes,
  createValidationError,
  isPrivakitError,
  getErrorInfo
} from './core/errors.js';

// Convenience functions for common workflows

/**
 * Validates and normalizes an email address
 */
export function processEmail(email: string, options: {
  validation?: any;
  normalization?: any;
} = {}) {
  const validation = validateEmail(email, options.validation);
  if (!validation.isValid) {
    return { validation, normalized: null };
  }
  
  const normalized = normalizeEmailAddress(email, options.normalization);
  return { validation, normalized };
}

/**
 * Validates and normalizes a phone number
 */
export function processPhone(phone: string, options: {
  validation?: any;
  normalization?: any;
} = {}) {
  const validation = validatePhone(phone, { 
    defaultCountry: 'US',
    ...options.validation 
  });
  if (!validation.isValid) {
    return { validation, normalized: null };
  }
  
  const normalized = normalizePhoneNumber(phone, { 
    defaultCountry: 'US',
    ...options.normalization 
  });
  return { validation, normalized };
}

/**
 * Validates and normalizes a name
 */
export function processName(name: string, options: {
  validation?: any;
  normalization?: any;
} = {}) {
  const validation = validateName(name, options.validation);
  if (!validation.isValid) {
    return { validation, normalized: null };
  }
  
  const normalized = normalizePersonName(name, options.normalization);
  return { validation, normalized };
}

/**
 * Complete PII processing pipeline
 */
export function processPII(text: string, options: {
  detection?: any;
  masking?: any;
  redaction?: any;
  policy?: PolicyEngineType;
} = {}) {
  // Detect PII
  let detection;
  try {
    detection = detectPII(text, options.detection);
  } catch (error) {
    // Handle malformed input gracefully
    return {
      detection: {
        hasPII: false,
        detectedTypes: [],
        spans: [],
        confidence: 'low' as any,
        suggestions: ['Input validation failed']
      },
      masked: text || '',
      redacted: text || '',
      policyViolations: []
    };
  }
  
  if (!detection.hasPII) {
    return {
      detection,
      masked: text,
      redacted: text,
      policyViolations: []
    };
  }
  
  // Check policy compliance
  const policyViolations: string[] = [];
  if (options.policy) {
    for (const span of detection.spans) {
      const decision = options.policy.evaluate(span.type, 'display' as any);
      if (!decision.allowed) {
        policyViolations.push(`${span.type.toUpperCase()} at position ${span.start}-${span.end}: ${decision.reason}`);
      }
    }
  }
  
  // Apply masking
  const maskedResult = redactFromDetection(text, detection, {
    ...options.masking,
    preserveLength: true
  });
  
  // Apply redaction
  const redactedResult = redactFromDetection(text, detection, {
    replacement: '[REDACTED]',
    ...options.redaction
  });
  
  return {
    detection,
    masked: maskedResult.redacted,
    redacted: redactedResult.redacted,
    policyViolations
  };
}

/**
 * Creates a configured PII processor for consistent handling
 */
export function createPIIProcessor(config: {
  detectionOptions?: any;
  maskingOptions?: any;
  redactionOptions?: any;
  policyEngine?: PolicyEngineType;
  strictMode?: boolean;
} = {}) {
  const policyEngine = config.policyEngine || createPolicyEngine(config.strictMode ? 'strict' : 'permissive');
  
  return {
    detect: (text: string) => detectPII(text, config.detectionOptions),
    mask: (text: string) => redactFromDetection(text, detectPII(text, config.detectionOptions), {
      ...config.maskingOptions,
      preserveLength: true
    }),
    redact: (text: string) => redactFromDetection(text, detectPII(text, config.detectionOptions), config.redactionOptions),
    process: (text: string) => processPII(text, {
      detection: config.detectionOptions,
      masking: config.maskingOptions,
      redaction: config.redactionOptions,
      policy: policyEngine
    }),
    validateCompliance: (type: PIIType, operations: PolicyOperation[]) => {
      const violations: string[] = [];
      for (const operation of operations) {
        const decision = policyEngine.evaluate(type, operation);
        if (!decision.allowed) {
          violations.push(`${operation} not allowed for ${type}: ${decision.reason}`);
        }
      }
      return { isCompliant: violations.length === 0, violations };
    }
  };
}

// Library version and metadata
export const VERSION = '0.1.0';
export const LIBRARY_NAME = 'Privakit';
export const DESCRIPTION = 'TypeScript/JavaScript library for handling Personally Identifiable Information (PII)';

// Default exports for common use cases
export default {
  // Validation
  validateEmail,
  validatePhone,
  validateName,
  validateAddress,
  
  // Detection
  detectPII,
  hasPII,
  
  // Masking & Redaction
  maskPII,
  redactText,
  
  // Processing
  processPII,
  createPIIProcessor,
  
  // Policy
  createPolicyEngine,
  
  // Utilities
  VERSION,
  LIBRARY_NAME
};