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
export interface PolicyEngine {
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