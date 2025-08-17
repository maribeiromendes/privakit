/**
 * Core types for Privakit PII handling library
 */

// Risk levels for PII classification
export enum RiskLevel {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  Critical = 'critical'
}

// PII types that can be detected
export enum PIIType {
  Email = 'email',
  Phone = 'phone',
  Name = 'name',
  Address = 'address',
  SSN = 'ssn',
  CreditCard = 'creditcard',
  IPAddress = 'ip',
  URL = 'url',
  ZipCode = 'zipcode',
  NationalID = 'nationalid',
  DateOfBirth = 'dateofbirth',
  IBAN = 'iban',
  VAT = 'vat'
}

// Confidence levels for detection
export enum ConfidenceLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  VeryHigh = 'very_high'
}

// Detection span with position information
export interface DetectionSpan {
  type: PIIType;
  start: number;
  end: number;
  text: string;
  confidence: ConfidenceLevel;
  metadata?: Record<string, unknown>;
}

// Result of PII detection
export interface PIIDetectionResult {
  hasPII: boolean;
  detectedTypes: PIIType[];
  spans: DetectionSpan[];
  suggestions: string[];
  redactedText?: string;
  confidence: ConfidenceLevel;
  metadata?: Record<string, unknown>;
}

// Validation result interface
export interface ValidationResult<T = string> {
  isValid: boolean;
  value?: T;
  normalized?: T;
  errors: ValidationError[];
  metadata?: Record<string, unknown>;
}

// Validation error details
export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: unknown;
}

// Masking options
export interface MaskingOptions {
  maskChar?: string;
  preserveLength?: boolean;
  preserveFormat?: boolean;
  visibleStart?: number;
  visibleEnd?: number;
  customPattern?: string;
}

// Masking result
export interface MaskingResult {
  masked: string;
  originalLength: number;
  pattern: string;
  metadata?: Record<string, unknown>;
}

// Normalization options
export interface NormalizationOptions {
  locale?: string;
  format?: string;
  preserveCase?: boolean;
  removeDiacritics?: boolean;
}

// Normalization result
export interface NormalizationResult<T = string> {
  normalized: T;
  original: T;
  applied: string[];
  metadata?: Record<string, unknown>;
}

// Policy rule for PII handling
export interface PolicyRule {
  type: PIIType;
  riskLevel: RiskLevel;
  allowLogging: boolean;
  requireMasking: boolean;
  requireEncryption: boolean;
  retentionDays?: number;
  allowedOperations: PolicyOperation[];
}

// Policy operations
export enum PolicyOperation {
  Store = 'store',
  Process = 'process',
  Transfer = 'transfer',
  Log = 'log',
  Display = 'display',
  Export = 'export'
}

// Policy engine interface
export interface IPolicyEngine {
  evaluate(type: PIIType, operation: PolicyOperation): PolicyDecision;
  addRule(rule: PolicyRule): void;
  removeRule(type: PIIType): void;
  getRules(): PolicyRule[];
}

// Policy decision result
export interface PolicyDecision {
  allowed: boolean;
  requiresMasking: boolean;
  requiresEncryption: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// Pseudonymization options
export interface PseudonymizationOptions {
  algorithm: 'aes' | 'hmac' | 'sha256';
  key?: string;
  salt?: string;
  preserveFormat?: boolean;
  reversible?: boolean;
}

// Pseudonymization result
export interface PseudonymizationResult {
  token: string;
  algorithm: string;
  reversible: boolean;
  metadata?: Record<string, unknown>;
}

// Anonymization options
export interface AnonymizationOptions {
  algorithm: 'hash' | 'generalize' | 'suppress';
  salt?: string;
  generalizationLevel?: number;
  suppressionThreshold?: number;
}

// Anonymization result
export interface AnonymizationResult {
  anonymized: string;
  algorithm: string;
  reversible: false;
  metadata?: Record<string, unknown>;
}

// Locale-specific validation context
export interface LocaleContext {
  country: string;
  language?: string;
  region?: string;
  timezone?: string;
  customRules?: Record<string, unknown>;
}

// Pattern definition for detection
export interface PIIPattern {
  type: PIIType;
  regex: RegExp;
  description: string;
  riskLevel: RiskLevel;
  examples?: string[];
  falsePositiveFilters?: ((match: string) => boolean)[];
}

// Configuration for detection engine
export interface DetectionConfig {
  patterns: PIIPattern[];
  enableNLP: boolean;
  confidenceThreshold: number;
  maxTextLength: number;
  enableSpanExtraction: boolean;
  locale?: LocaleContext;
}

// Validation-specific types
export interface EmailValidationOptions {
  allowDisplayName?: boolean;
  requireTld?: boolean;
  allowUtf8LocalPart?: boolean;
  allowIpDomain?: boolean;
  domainSpecificValidation?: boolean;
  blacklistedDomains?: string[];
  whitelistedDomains?: string[];
}

export interface EmailValidationResult extends ValidationResult<string> {
  domain?: string;
  localPart?: string;
  isDisposable?: boolean;
  isCorporate?: boolean;
}

export interface PhoneValidationOptions {
  defaultCountry?: string;
  strictMode?: boolean;
  validateLength?: boolean;
  validateType?: boolean;
}

export interface PhoneValidationResult extends ValidationResult<string> {
  country?: string;
  type?: string;
  isPossible?: boolean;
  e164?: string;
  national?: string;
  international?: string;
}

export interface NameValidationOptions {
  allowSingleName?: boolean;
  requireLastName?: boolean;
  maxLength?: number;
  minLength?: number;
}

export interface NameValidationResult extends ValidationResult<string> {
  firstName?: string;
  lastName?: string;
  middleNames?: string[];
  nameType?: 'person' | 'organization' | 'unknown';
  isLikelyName?: boolean;
  confidence?: ConfidenceLevel;
}

export interface AddressValidationOptions {
  requireStreet?: boolean;
  requireCity?: boolean;
  requirePostalCode?: boolean;
  requireCountry?: boolean;
  country?: string;
}

export interface AddressValidationResult extends ValidationResult<string> {
  components?: AddressComponent[];
  addressType?: 'residential' | 'business' | 'po_box' | 'unknown';
  confidence?: ConfidenceLevel;
}

export interface AddressComponent {
  type: 'street' | 'city' | 'state' | 'postal_code' | 'country';
  value: string;
  confidence: ConfidenceLevel;
}

// Normalization-specific types
export interface EmailNormalizationOptions extends NormalizationOptions {
  lowercase?: boolean;
  removeDots?: boolean;
  removeSubaddress?: boolean;
  provider?: 'gmail' | 'outlook' | 'yahoo' | 'icloud' | 'generic';
}

export interface PhoneNormalizationOptions extends NormalizationOptions {
  defaultCountry?: string;
  outputFormat?: 'E.164' | 'INTERNATIONAL' | 'NATIONAL' | 'RFC3966';
}

export interface NameNormalizationOptions extends NormalizationOptions {
  titleCase?: boolean;
  removeExtraSpaces?: boolean;
  handleHyphens?: boolean;
  handleApostrophes?: boolean;
}

export interface AddressNormalizationOptions extends NormalizationOptions {
  standardizeStreetTypes?: boolean;
  standardizeDirections?: boolean;
  removeExtraSpaces?: boolean;
  formatStyle?: 'single-line' | 'multi-line' | 'compact';
}

// Masking-specific types
export interface EmailMaskingOptions extends MaskingOptions {
  maskDomain?: boolean;
  preserveTld?: boolean;
  visibleLocalPart?: number;
}

export interface PhoneMaskingOptions extends MaskingOptions {
  maskCountryCode?: boolean;
  maskAreaCode?: boolean;
  visibleDigits?: number;
  groupSeparator?: string;
}

export interface NameMaskingOptions extends MaskingOptions {
  preserveFirstName?: boolean;
  preserveLastName?: boolean;
  maskMiddleNames?: boolean;
}

export interface AddressMaskingOptions extends MaskingOptions {
  maskStreetNumber?: boolean;
  maskStreetName?: boolean;
  maskCity?: boolean;
  maskPostalCode?: boolean;
  visibleStreetChars?: number;
}

export interface CreditCardMaskingOptions extends MaskingOptions {
  visibleLastDigits?: number;
  groupSeparator?: string;
  preserveFirstDigits?: number;
}

// Redaction-specific types
export interface RedactionOptions {
  replacement?: string;
  preserveLength?: boolean;
  strictMode?: boolean;
  customPatterns?: RedactionPattern[];
}

export interface RedactionPattern {
  type: PIIType;
  regex: RegExp;
  replacement: string;
  description: string;
}

export interface RedactionResult {
  redacted: string;
  originalLength: number;
  redactedCount: number;
  metadata?: Record<string, unknown>;
}

export interface RedactedSpan {
  type: PIIType;
  start: number;
  end: number;
  original: string;
  replacement: string;
}

// Detection-specific types
export interface DetectionOptions {
  enableNLP?: boolean;
  confidenceThreshold?: number;
  maxTextLength?: number;
  enableSpanExtraction?: boolean;
  customPatterns?: PIIPattern[];
  strictMode?: boolean;
  includeContext?: boolean;
  contextWindow?: number;
}