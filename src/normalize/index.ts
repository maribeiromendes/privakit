/**
 * Normalization module for standardizing PII formats
 */

import { normalizeEmail } from '../validate/email.js';
import { normalizePhone } from '../validate/phone.js';
import { normalizeNameCapitalization } from '../validate/name.js';
import { formatAddress, normalizeCountry } from '../validate/address.js';
import { NormalizationOptions, NormalizationResult, PIIType, LocaleContext } from '../core/types.js';
import { PIINormalizationError, ErrorCodes } from '../core/errors.js';
import { CountryCode } from 'libphonenumber-js';

export interface EmailNormalizationOptions extends NormalizationOptions {
  lowercase?: boolean;
  removeDots?: boolean;
  removeSubaddress?: boolean;
  provider?: 'gmail' | 'outlook' | 'yahoo' | 'icloud' | 'generic';
}

export interface PhoneNormalizationOptions extends NormalizationOptions {
  defaultCountry?: CountryCode;
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

/**
 * Normalizes email address to canonical format
 */
export function normalizeEmailAddress(
  email: string,
  options: EmailNormalizationOptions = {}
): NormalizationResult<string> {
  const original = email;
  const applied: string[] = [];

  try {
    let normalized = normalizeEmail(email);
    applied.push('basic-normalization');

    if (options.lowercase !== false) {
      normalized = normalized.toLowerCase();
      applied.push('lowercase');
    }

    // Provider-specific normalization
    if (options.provider || normalized.includes('@')) {
      const domain = normalized.split('@')[1];
      const provider = options.provider || detectEmailProvider(domain);
      
      switch (provider) {
        case 'gmail':
          if (options.removeDots) {
            const [local, domainPart] = normalized.split('@');
            normalized = local.replace(/\./g, '') + '@' + domainPart;
            applied.push('remove-dots');
          }
          if (options.removeSubaddress) {
            const [local, domainPart] = normalized.split('@');
            const cleanLocal = local.split('+')[0];
            normalized = cleanLocal + '@' + domainPart;
            applied.push('remove-subaddress');
          }
          break;
        case 'outlook':
        case 'yahoo':
        case 'icloud':
          if (options.removeSubaddress) {
            const [local, domainPart] = normalized.split('@');
            const cleanLocal = local.split('+')[0];
            normalized = cleanLocal + '@' + domainPart;
            applied.push('remove-subaddress');
          }
          break;
      }
    }

    return {
      normalized,
      original,
      applied,
      metadata: {
        type: PIIType.Email,
        provider: options.provider,
        normalizedLength: normalized.length,
        originalLength: original.length
      }
    };

  } catch (error) {
    throw new PIINormalizationError(
      `Failed to normalize email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      PIIType.Email,
      original,
      'canonical'
    );
  }
}

/**
 * Normalizes phone number to standard format
 */
export function normalizePhoneNumber(
  phone: string,
  options: PhoneNormalizationOptions = {}
): NormalizationResult<string> {
  const original = phone;
  const applied: string[] = [];

  try {
    const format = options.outputFormat || 'E.164';
    let normalized = normalizePhone(phone, options.defaultCountry);
    applied.push(`format-${format.toLowerCase()}`);

    // Additional formatting based on locale
    if (options.locale) {
      applied.push(`locale-${options.locale}`);
    }

    return {
      normalized,
      original,
      applied,
      metadata: {
        type: PIIType.Phone,
        format,
        defaultCountry: options.defaultCountry,
        normalizedLength: normalized.length,
        originalLength: original.length
      }
    };

  } catch (error) {
    throw new PIINormalizationError(
      `Failed to normalize phone: ${error instanceof Error ? error.message : 'Unknown error'}`,
      PIIType.Phone,
      original,
      options.outputFormat || 'E.164'
    );
  }
}

/**
 * Normalizes person name to standard format
 */
export function normalizePersonName(
  name: string,
  options: NameNormalizationOptions = {}
): NormalizationResult<string> {
  const original = name;
  const applied: string[] = [];

  try {
    let normalized = name.trim();

    // Remove extra spaces
    if (options.removeExtraSpaces !== false) {
      normalized = normalized.replace(/\s+/g, ' ');
      applied.push('remove-extra-spaces');
    }

    // Title case normalization
    if (options.titleCase !== false) {
      normalized = normalizeNameCapitalization(normalized);
      applied.push('title-case');
    }

    // Handle diacritics if specified
    if (options.removeDiacritics) {
      normalized = removeDiacritics(normalized);
      applied.push('remove-diacritics');
    }

    // Locale-specific normalization
    if (options.locale) {
      normalized = applyLocaleSpecificNameNormalization(normalized, options.locale);
      applied.push(`locale-${options.locale}`);
    }

    return {
      normalized,
      original,
      applied,
      metadata: {
        type: PIIType.Name,
        wordCount: normalized.split(/\s+/).length,
        normalizedLength: normalized.length,
        originalLength: original.length
      }
    };

  } catch (error) {
    throw new PIINormalizationError(
      `Failed to normalize name: ${error instanceof Error ? error.message : 'Unknown error'}`,
      PIIType.Name,
      original,
      'standard'
    );
  }
}

/**
 * Normalizes address to standard format
 */
export function normalizeAddress(
  address: string,
  options: AddressNormalizationOptions = {}
): NormalizationResult<string> {
  const original = address;
  const applied: string[] = [];

  try {
    let normalized = address.trim();

    // Remove extra spaces
    if (options.removeExtraSpaces !== false) {
      normalized = normalized.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n');
      applied.push('remove-extra-spaces');
    }

    // Standardize street types
    if (options.standardizeStreetTypes) {
      normalized = standardizeStreetTypes(normalized);
      applied.push('standardize-street-types');
    }

    // Standardize directions
    if (options.standardizeDirections) {
      normalized = standardizeDirections(normalized);
      applied.push('standardize-directions');
    }

    // Format style
    if (options.formatStyle) {
      normalized = applyAddressFormatStyle(normalized, options.formatStyle);
      applied.push(`format-${options.formatStyle}`);
    }

    // Locale-specific normalization
    if (options.locale) {
      normalized = applyLocaleSpecificAddressNormalization(normalized, options.locale);
      applied.push(`locale-${options.locale}`);
    }

    return {
      normalized,
      original,
      applied,
      metadata: {
        type: PIIType.Address,
        formatStyle: options.formatStyle,
        normalizedLength: normalized.length,
        originalLength: original.length
      }
    };

  } catch (error) {
    throw new PIINormalizationError(
      `Failed to normalize address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      PIIType.Address,
      original,
      options.formatStyle || 'standard'
    );
  }
}

/**
 * Generic normalization function that auto-detects PII type
 */
export function normalizePII(
  value: string,
  type: PIIType,
  options: NormalizationOptions = {}
): NormalizationResult<string> {
  switch (type) {
    case PIIType.Email:
      return normalizeEmailAddress(value, options as EmailNormalizationOptions);
    case PIIType.Phone:
      return normalizePhoneNumber(value, options as PhoneNormalizationOptions);
    case PIIType.Name:
      return normalizePersonName(value, options as NameNormalizationOptions);
    case PIIType.Address:
      return normalizeAddress(value, options as AddressNormalizationOptions);
    default:
      throw new PIINormalizationError(
        `Normalization not supported for PII type: ${type}`,
        type,
        value,
        'unknown'
      );
  }
}

/**
 * Batch normalization for multiple values
 */
export function normalizeMultiple<T extends string>(
  values: T[],
  type: PIIType,
  options: NormalizationOptions = {}
): NormalizationResult<T>[] {
  return values.map(value => normalizePII(value, type, options) as NormalizationResult<T>);
}

// Helper functions

/**
 * Detects email provider from domain
 */
function detectEmailProvider(domain: string): 'gmail' | 'outlook' | 'yahoo' | 'icloud' | 'generic' {
  const lowerDomain = domain.toLowerCase();
  
  if (lowerDomain.includes('gmail')) return 'gmail';
  if (lowerDomain.includes('outlook') || lowerDomain.includes('hotmail') || lowerDomain.includes('live')) return 'outlook';
  if (lowerDomain.includes('yahoo')) return 'yahoo';
  if (lowerDomain.includes('icloud') || lowerDomain.includes('me.com')) return 'icloud';
  
  return 'generic';
}

/**
 * Removes diacritics from text
 */
function removeDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Standardizes street types in address
 */
function standardizeStreetTypes(address: string): string {
  const streetTypeMap: Record<string, string> = {
    'street': 'St',
    'st': 'St',
    'avenue': 'Ave',
    'ave': 'Ave',
    'road': 'Rd',
    'rd': 'Rd',
    'boulevard': 'Blvd',
    'blvd': 'Blvd',
    'lane': 'Ln',
    'ln': 'Ln',
    'drive': 'Dr',
    'dr': 'Dr',
    'court': 'Ct',
    'ct': 'Ct',
    'place': 'Pl',
    'pl': 'Pl',
    'way': 'Way',
    'circle': 'Cir',
    'cir': 'Cir',
    'parkway': 'Pkwy',
    'pkwy': 'Pkwy'
  };

  let normalized = address;
  for (const [original, standard] of Object.entries(streetTypeMap)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    normalized = normalized.replace(regex, standard);
  }

  return normalized;
}

/**
 * Standardizes direction abbreviations
 */
function standardizeDirections(address: string): string {
  const directionMap: Record<string, string> = {
    'north': 'N',
    'south': 'S',
    'east': 'E',
    'west': 'W',
    'northeast': 'NE',
    'northwest': 'NW',
    'southeast': 'SE',
    'southwest': 'SW'
  };

  let normalized = address;
  for (const [original, standard] of Object.entries(directionMap)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    normalized = normalized.replace(regex, standard);
  }

  return normalized;
}

/**
 * Applies address format style
 */
function applyAddressFormatStyle(address: string, style: 'single-line' | 'multi-line' | 'compact'): string {
  switch (style) {
    case 'single-line':
      return address.replace(/\n/g, ', ');
    case 'multi-line':
      return address.replace(/, /g, '\n');
    case 'compact':
      return address.replace(/\s+/g, ' ').replace(/,\s*/g, ',');
    default:
      return address;
  }
}

/**
 * Applies locale-specific name normalization
 */
function applyLocaleSpecificNameNormalization(name: string, locale: string): string {
  // Placeholder for locale-specific rules
  // Could be expanded with country-specific naming conventions
  return name;
}

/**
 * Applies locale-specific address normalization
 */
function applyLocaleSpecificAddressNormalization(address: string, locale: string): string {
  // Placeholder for locale-specific rules
  // Could be expanded with country-specific address formats
  return address;
}

/**
 * Creates normalization options from locale context
 */
export function createNormalizationOptionsFromLocale(
  type: PIIType,
  locale: LocaleContext
): NormalizationOptions {
  const baseOptions: NormalizationOptions = {
    locale: locale.country,
    preserveCase: false,
    removeDiacritics: false
  };

  switch (type) {
    case PIIType.Phone:
      return {
        ...baseOptions,
        defaultCountry: locale.country.toUpperCase() as CountryCode,
        outputFormat: 'E.164'
      } as PhoneNormalizationOptions;
    
    case PIIType.Email:
      return {
        ...baseOptions,
        lowercase: true,
        removeDots: false,
        removeSubaddress: false
      } as EmailNormalizationOptions;
    
    case PIIType.Name:
      return {
        ...baseOptions,
        titleCase: true,
        removeExtraSpaces: true
      } as NameNormalizationOptions;
    
    case PIIType.Address:
      return {
        ...baseOptions,
        standardizeStreetTypes: true,
        formatStyle: 'multi-line'
      } as AddressNormalizationOptions;
    
    default:
      return baseOptions;
  }
}