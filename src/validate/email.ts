/**
 * Email validation using validator.js for robust email validation
 */

import validator from 'validator';
import { ValidationResult, PIIType } from '../core/types.js';
import { PIIValidationError, createValidationError, ErrorCodes } from '../core/errors.js';

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

// Common disposable email domains for filtering
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'yopmail.com',
  'temp-mail.org',
  'sharklasers.com'
]);

// Common corporate domains
const CORPORATE_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com'
]);

/**
 * Validates an email address with comprehensive checks
 */
export function validateEmail(
  email: string, 
  options: EmailValidationOptions = {}
): EmailValidationResult {
  const errors: any[] = [];
  
  // Basic input validation
  if (!email || typeof email !== 'string') {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Email address is required',
      'email',
      email
    ));
    return {
      isValid: false,
      errors,
      metadata: { type: PIIType.Email }
    };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Email address cannot be empty',
      'email',
      email
    ));
    return {
      isValid: false,
      errors,
      metadata: { type: PIIType.Email }
    };
  }

  if (trimmedEmail.length > 320) { // RFC 5321 limit
    errors.push(createValidationError(
      ErrorCodes.FIELD_TOO_LONG,
      'Email address exceeds maximum length of 320 characters',
      'email',
      email
    ));
  }

  // Use validator.js for robust email validation
  const validatorOptions = {
    allow_display_name: options.allowDisplayName ?? false,
    require_tld: options.requireTld ?? true,
    allow_utf8_local_part: options.allowUtf8LocalPart ?? true,
    require_display_name: false,
    allow_ip_domain: options.allowIpDomain ?? false
  };

  const isValidFormat = validator.isEmail(trimmedEmail, validatorOptions);
  
  if (!isValidFormat) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_EMAIL,
      'Invalid email address format',
      'email',
      trimmedEmail
    ));
  }

  // Extract domain and local part for additional validation
  let domain: string | undefined;
  let localPart: string | undefined;
  
  if (isValidFormat) {
    const atIndex = trimmedEmail.lastIndexOf('@');
    if (atIndex > 0) {
      localPart = trimmedEmail.substring(0, atIndex);
      domain = trimmedEmail.substring(atIndex + 1).toLowerCase();
      
      // Domain-specific validation
      if (options.domainSpecificValidation && domain) {
        if (options.blacklistedDomains?.includes(domain)) {
          errors.push(createValidationError(
            ErrorCodes.INVALID_EMAIL,
            `Email domain '${domain}' is not allowed`,
            'email',
            trimmedEmail
          ));
        }
        
        if (options.whitelistedDomains && !options.whitelistedDomains.includes(domain)) {
          errors.push(createValidationError(
            ErrorCodes.INVALID_EMAIL,
            `Email domain '${domain}' is not in the allowed list`,
            'email',
            trimmedEmail
          ));
        }
      }
      
      // Local part validation (before @)
      if (localPart.length > 64) { // RFC 5321 limit
        errors.push(createValidationError(
          ErrorCodes.FIELD_TOO_LONG,
          'Email local part exceeds maximum length of 64 characters',
          'email',
          trimmedEmail
        ));
      }
    }
  }

  const isValid = errors.length === 0;
  const isDisposable = domain ? DISPOSABLE_DOMAINS.has(domain) : false;
  const isCorporate = domain ? CORPORATE_DOMAINS.has(domain) : false;

  return {
    isValid,
    value: isValid ? trimmedEmail : undefined,
    normalized: isValid ? trimmedEmail.toLowerCase() : undefined,
    errors,
    domain,
    localPart,
    isDisposable,
    isCorporate,
    metadata: {
      type: PIIType.Email,
      validationOptions: options,
      originalLength: email.length,
      trimmedLength: trimmedEmail.length
    }
  };
}

/**
 * Normalizes an email address to canonical format
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email;
  }

  // Use validator.js normalize function
  try {
    return validator.normalizeEmail(email, {
      gmail_lowercase: true,
      gmail_remove_dots: false, // Keep dots for safety
      gmail_remove_subaddress: false, // Keep +tags for safety
      outlookdotcom_lowercase: true,
      outlookdotcom_remove_subaddress: false,
      yahoo_lowercase: true,
      yahoo_remove_subaddress: false,
      icloud_lowercase: true,
      icloud_remove_subaddress: false
    }) || email.toLowerCase().trim();
  } catch {
    // If normalization fails, fall back to basic lowercase/trim
    return email.toLowerCase().trim();
  }
}

/**
 * Checks if an email domain is likely disposable
 */
export function isDisposableEmail(email: string): boolean {
  const validation = validateEmail(email);
  return validation.isDisposable ?? false;
}

/**
 * Extracts domain from email address
 */
export function extractEmailDomain(email: string): string | null {
  const validation = validateEmail(email);
  return validation.domain || null;
}

/**
 * Validates multiple email addresses
 */
export function validateEmails(
  emails: string[], 
  options: EmailValidationOptions = {}
): EmailValidationResult[] {
  return emails.map(email => validateEmail(email, options));
}

/**
 * Checks if email passes basic format validation (fast check)
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return validator.isEmail(email.trim());
}