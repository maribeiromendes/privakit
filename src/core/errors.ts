/**
 * Error classes for Privakit PII handling library
 */

import { PIIType, ValidationError } from './types.js';

// Base error class for all Privakit errors
export class PrivakitError extends Error {
  public readonly code: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(message: string, code: string, metadata?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.metadata = metadata;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Validation-related errors
export class PIIValidationError extends PrivakitError {
  public readonly field?: string;
  public readonly value?: unknown;
  public readonly validationErrors: ValidationError[];

  constructor(
    message: string, 
    validationErrors: ValidationError[] = [],
    field?: string,
    value?: unknown,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', metadata);
    this.field = field;
    this.value = value;
    this.validationErrors = validationErrors;
  }

  static fromValidationErrors(errors: ValidationError[], field?: string): PIIValidationError {
    const message = errors.length === 1 
      ? errors[0].message 
      : `Multiple validation errors: ${errors.map(e => e.message).join(', ')}`;
    
    return new PIIValidationError(message, errors, field);
  }
}

// Detection-related errors
export class PIIDetectionError extends PrivakitError {
  public readonly inputLength?: number;
  public readonly piiType?: PIIType;

  constructor(
    message: string,
    piiType?: PIIType,
    inputLength?: number,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'DETECTION_ERROR', metadata);
    this.piiType = piiType;
    this.inputLength = inputLength;
  }
}

// Masking-related errors
export class PIIMaskingError extends PrivakitError {
  public readonly piiType?: PIIType;
  public readonly originalValue?: string;

  constructor(
    message: string,
    piiType?: PIIType,
    originalValue?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'MASKING_ERROR', metadata);
    this.piiType = piiType;
    this.originalValue = originalValue;
  }
}

// Normalization-related errors
export class PIINormalizationError extends PrivakitError {
  public readonly piiType?: PIIType;
  public readonly originalValue?: string;
  public readonly targetFormat?: string;

  constructor(
    message: string,
    piiType?: PIIType,
    originalValue?: string,
    targetFormat?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'NORMALIZATION_ERROR', metadata);
    this.piiType = piiType;
    this.originalValue = originalValue;
    this.targetFormat = targetFormat;
  }
}

// Policy-related errors
export class PIIPolicyError extends PrivakitError {
  public readonly piiType?: PIIType;
  public readonly operation?: string;
  public readonly ruleViolation?: string;

  constructor(
    message: string,
    piiType?: PIIType,
    operation?: string,
    ruleViolation?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'POLICY_ERROR', metadata);
    this.piiType = piiType;
    this.operation = operation;
    this.ruleViolation = ruleViolation;
  }
}

// Pseudonymization-related errors
export class PIIPseudonymizationError extends PrivakitError {
  public readonly algorithm?: string;
  public readonly keyMissing?: boolean;

  constructor(
    message: string,
    algorithm?: string,
    keyMissing?: boolean,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'PSEUDONYMIZATION_ERROR', metadata);
    this.algorithm = algorithm;
    this.keyMissing = keyMissing;
  }
}

// Anonymization-related errors
export class PIIAnonymizationError extends PrivakitError {
  public readonly algorithm?: string;
  public readonly dataInsufficient?: boolean;

  constructor(
    message: string,
    algorithm?: string,
    dataInsufficient?: boolean,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'ANONYMIZATION_ERROR', metadata);
    this.algorithm = algorithm;
    this.dataInsufficient = dataInsufficient;
  }
}

// Configuration-related errors
export class PIIConfigurationError extends PrivakitError {
  public readonly configPath?: string;
  public readonly invalidSetting?: string;

  constructor(
    message: string,
    configPath?: string,
    invalidSetting?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'CONFIGURATION_ERROR', metadata);
    this.configPath = configPath;
    this.invalidSetting = invalidSetting;
  }
}

// Locale/region-related errors
export class PIILocaleError extends PrivakitError {
  public readonly locale?: string;
  public readonly missingLocale?: boolean;

  constructor(
    message: string,
    locale?: string,
    missingLocale?: boolean,
    metadata?: Record<string, unknown>
  ) {
    super(message, 'LOCALE_ERROR', metadata);
    this.locale = locale;
    this.missingLocale = missingLocale;
  }
}

// Error codes for consistent error handling
export const ErrorCodes = {
  // Validation errors
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',
  
  // Detection errors
  TEXT_TOO_LONG: 'TEXT_TOO_LONG',
  PATTERN_INVALID: 'PATTERN_INVALID',
  NLP_UNAVAILABLE: 'NLP_UNAVAILABLE',
  CONFIDENCE_TOO_LOW: 'CONFIDENCE_TOO_LOW',
  
  // Masking errors
  INVALID_MASK_PATTERN: 'INVALID_MASK_PATTERN',
  CANNOT_MASK_VALUE: 'CANNOT_MASK_VALUE',
  MASK_OPTIONS_INVALID: 'MASK_OPTIONS_INVALID',
  
  // Normalization errors
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  NORMALIZATION_FAILED: 'NORMALIZATION_FAILED',
  LOCALE_NOT_SUPPORTED: 'LOCALE_NOT_SUPPORTED',
  
  // Policy errors
  OPERATION_FORBIDDEN: 'OPERATION_FORBIDDEN',
  ENCRYPTION_REQUIRED: 'ENCRYPTION_REQUIRED',
  MASKING_REQUIRED: 'MASKING_REQUIRED',
  RETENTION_EXCEEDED: 'RETENTION_EXCEEDED',
  
  // Crypto errors
  KEY_MISSING: 'KEY_MISSING',
  ALGORITHM_UNSUPPORTED: 'ALGORITHM_UNSUPPORTED',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  
  // Configuration errors
  CONFIG_INVALID: 'CONFIG_INVALID',
  LOCALE_MISSING: 'LOCALE_MISSING',
  PATTERN_COMPILATION_FAILED: 'PATTERN_COMPILATION_FAILED'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Helper function to create validation errors
export function createValidationError(
  code: ErrorCode,
  message: string,
  field?: string,
  value?: unknown
): ValidationError {
  return {
    code,
    message,
    field,
    value
  };
}

// Helper function to check if error is a Privakit error
export function isPrivakitError(error: unknown): error is PrivakitError {
  return error instanceof PrivakitError;
}

// Helper function to extract error info safely
export function getErrorInfo(error: unknown): { message: string; code?: string } {
  if (isPrivakitError(error)) {
    return {
      message: error.message,
      code: error.code
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message
    };
  }
  
  return {
    message: String(error)
  };
}