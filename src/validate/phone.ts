/**
 * Phone validation using libphonenumber-js for international phone number validation
 */

import { parsePhoneNumber, PhoneNumber, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';
import type { ValidationResult, LocaleContext } from '../core/types.js';
import { PIIType } from '../core/types.js';
import { PIIValidationError, createValidationError, ErrorCodes } from '../core/errors.js';

export interface PhoneValidationOptions {
  defaultCountry?: CountryCode;
  allowInternational?: boolean;
  allowNational?: boolean;
  allowMobile?: boolean;
  allowLandline?: boolean;
  allowTollFree?: boolean;
  strictValidation?: boolean;
  allowedCountries?: CountryCode[];
  blockedCountries?: CountryCode[];
}

export interface PhoneValidationResult extends ValidationResult<string> {
  country?: CountryCode;
  nationalNumber?: string;
  internationalFormat?: string;
  e164Format?: string;
  type?: 'mobile' | 'landline' | 'toll-free' | 'voip' | 'unknown';
  isPossible?: boolean;
}

/**
 * Validates a phone number with comprehensive international support
 */
export function validatePhone(
  phone: string,
  options: PhoneValidationOptions = {}
): PhoneValidationResult {
  const errors: any[] = [];
  
  // Basic input validation
  if (!phone || typeof phone !== 'string') {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Phone number is required',
      'phone',
      phone
    ));
    return {
      isValid: false,
      errors,
      metadata: { type: PIIType.Phone }
    };
  }

  const trimmedPhone = phone.trim();
  
  if (trimmedPhone.length === 0) {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Phone number cannot be empty',
      'phone',
      phone
    ));
    return {
      isValid: false,
      errors,
      metadata: { type: PIIType.Phone }
    };
  }

  if (trimmedPhone.length > 20) {
    errors.push(createValidationError(
      ErrorCodes.FIELD_TOO_LONG,
      'Phone number exceeds maximum length of 20 characters',
      'phone',
      phone
    ));
  }

  // Try to parse the phone number
  let phoneNumber: PhoneNumber | undefined;
  try {
    phoneNumber = parsePhoneNumber(trimmedPhone, options.defaultCountry);
  } catch (error) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_PHONE,
      `Invalid phone number format: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'phone',
      trimmedPhone
    ));
    return {
      isValid: false,
      errors,
      metadata: { type: PIIType.Phone }
    };
  }

  if (!phoneNumber) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_PHONE,
      'Unable to parse phone number',
      'phone',
      trimmedPhone
    ));
    return {
      isValid: false,
      errors,
      metadata: { type: PIIType.Phone }
    };
  }

  // Check if number is valid
  const isValid = phoneNumber.isValid();
  const isPossible = phoneNumber.isPossible();

  if (options.strictValidation && !isValid) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_PHONE,
      'Phone number is not valid for its country',
      'phone',
      trimmedPhone
    ));
  } else if (!isPossible) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_PHONE,
      'Phone number format is not possible',
      'phone',
      trimmedPhone
    ));
  }

  // Country validation
  const country = phoneNumber.country;
  if (country) {
    if (options.allowedCountries && !options.allowedCountries.includes(country)) {
      errors.push(createValidationError(
        ErrorCodes.INVALID_PHONE,
        `Phone number from country '${country}' is not allowed`,
        'phone',
        trimmedPhone
      ));
    }
    
    if (options.blockedCountries && options.blockedCountries.includes(country)) {
      errors.push(createValidationError(
        ErrorCodes.INVALID_PHONE,
        `Phone number from country '${country}' is blocked`,
        'phone',
        trimmedPhone
      ));
    }
  }

  // Number type validation
  const type = phoneNumber.getType();
  let typeString: PhoneValidationResult['type'] = 'unknown';
  
  switch (type) {
    case 'MOBILE':
      typeString = 'mobile';
      if (options.allowMobile === false) {
        errors.push(createValidationError(
          ErrorCodes.INVALID_PHONE,
          'Mobile numbers are not allowed',
          'phone',
          trimmedPhone
        ));
      }
      break;
    case 'FIXED_LINE':
      typeString = 'landline';
      if (options.allowLandline === false) {
        errors.push(createValidationError(
          ErrorCodes.INVALID_PHONE,
          'Landline numbers are not allowed',
          'phone',
          trimmedPhone
        ));
      }
      break;
    case 'TOLL_FREE':
      typeString = 'toll-free';
      if (options.allowTollFree === false) {
        errors.push(createValidationError(
          ErrorCodes.INVALID_PHONE,
          'Toll-free numbers are not allowed',
          'phone',
          trimmedPhone
        ));
      }
      break;
    case 'VOIP':
      typeString = 'voip';
      break;
  }

  // Format validation
  const hasInternationalFormat = trimmedPhone.startsWith('+');
  if (options.allowInternational === false && hasInternationalFormat) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_PHONE,
      'International format is not allowed',
      'phone',
      trimmedPhone
    ));
  }
  
  if (options.allowNational === false && !hasInternationalFormat) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_PHONE,
      'National format is not allowed',
      'phone',
      trimmedPhone
    ));
  }

  const validationPassed = errors.length === 0;
  
  return {
    isValid: validationPassed,
    value: validationPassed ? trimmedPhone : undefined,
    normalized: validationPassed ? phoneNumber.format('E.164') : undefined,
    errors,
    country,
    nationalNumber: phoneNumber.nationalNumber,
    internationalFormat: phoneNumber.format('INTERNATIONAL'),
    e164Format: phoneNumber.format('E.164'),
    type: typeString,
    isPossible,
    metadata: {
      type: PIIType.Phone,
      validationOptions: options,
      originalLength: phone.length,
      trimmedLength: trimmedPhone.length,
      countryCallingCode: country ? getCountryCallingCode(country) : undefined
    }
  };
}

/**
 * Normalizes a phone number to E.164 format
 */
export function normalizePhone(phone: string, defaultCountry?: CountryCode): string {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  try {
    const phoneNumber = parsePhoneNumber(phone.trim(), defaultCountry);
    return phoneNumber?.format('E.164') || phone;
  } catch {
    return phone;
  }
}

/**
 * Formats phone number in different formats
 */
export function formatPhone(
  phone: string, 
  format: 'E.164' | 'INTERNATIONAL' | 'NATIONAL' | 'RFC3966' = 'INTERNATIONAL',
  defaultCountry?: CountryCode
): string {
  try {
    const phoneNumber = parsePhoneNumber(phone.trim(), defaultCountry);
    return phoneNumber?.format(format) || phone;
  } catch {
    return phone;
  }
}

/**
 * Extracts country code from phone number
 */
export function extractPhoneCountry(phone: string, defaultCountry?: CountryCode): CountryCode | null {
  try {
    const phoneNumber = parsePhoneNumber(phone.trim(), defaultCountry);
    return phoneNumber?.country || null;
  } catch {
    return null;
  }
}

/**
 * Gets phone number type (mobile, landline, etc.)
 */
export function getPhoneType(phone: string, defaultCountry?: CountryCode): string | null {
  try {
    const phoneNumber = parsePhoneNumber(phone.trim(), defaultCountry);
    return phoneNumber?.getType() || null;
  } catch {
    return null;
  }
}

/**
 * Checks if phone number is mobile
 */
export function isMobilePhone(phone: string, defaultCountry?: CountryCode): boolean {
  return getPhoneType(phone, defaultCountry) === 'MOBILE';
}

/**
 * Checks if phone number is valid (fast check)
 */
export function isValidPhoneFormat(phone: string, defaultCountry?: CountryCode): boolean {
  try {
    const phoneNumber = parsePhoneNumber(phone.trim(), defaultCountry);
    return phoneNumber?.isValid() ?? false;
  } catch {
    return false;
  }
}

/**
 * Validates multiple phone numbers
 */
export function validatePhones(
  phones: string[],
  options: PhoneValidationOptions = {}
): PhoneValidationResult[] {
  return phones.map(phone => validatePhone(phone, options));
}

/**
 * Creates validation options from locale context
 */
export function createPhoneOptionsFromLocale(locale: LocaleContext): PhoneValidationOptions {
  return {
    defaultCountry: locale.country.toUpperCase() as CountryCode,
    allowInternational: true,
    allowNational: true,
    allowMobile: true,
    allowLandline: true,
    strictValidation: false
  };
}