/**
 * Name validation using NLP techniques and pattern matching
 */

import nlp from 'compromise';
import type { ValidationResult } from '../core/types.js';
import { PIIType, ConfidenceLevel } from '../core/types.js';
import { PIIValidationError, createValidationError, ErrorCodes } from '../core/errors.js';

export interface NameValidationOptions {
  allowMiddleName?: boolean;
  allowSuffix?: boolean;
  allowPrefix?: boolean;
  minLength?: number;
  maxLength?: number;
  allowNonLatin?: boolean;
  requireTitleCase?: boolean;
  allowSingleName?: boolean;
  blacklistedNames?: string[];
  customPatterns?: RegExp[];
}

export interface NameValidationResult extends ValidationResult<string> {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  prefix?: string;
  suffix?: string;
  confidence: ConfidenceLevel;
  isLikelyName: boolean;
  nameType: 'person' | 'organization' | 'unknown';
}

// Common prefixes and suffixes
const NAME_PREFIXES = new Set([
  'mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor', 'sir', 'dame', 'lord', 'lady'
]);

const NAME_SUFFIXES = new Set([
  'jr', 'sr', 'ii', 'iii', 'iv', 'v', 'phd', 'md', 'esq', 'cpa'
]);

// Common non-names that might be mistaken for names
const NON_NAMES = new Set([
  'test', 'admin', 'user', 'guest', 'anonymous', 'unknown', 'null', 'undefined',
  'none', 'na', 'n/a', 'tbd', 'temp', 'temporary', 'example', 'sample'
]);

// Patterns for detecting likely names
const NAME_PATTERNS = {
  // Latin letters with basic punctuation
  latinName: /^[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'.]+$/,
  
  // Single word name
  singleName: /^[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\-']+$/,
  
  // Two or more word name
  multiWordName: /^[a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'.]{2,}$/,
  
  // Title case pattern
  titleCase: /^[A-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF][a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\-']*(\s[A-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF][a-zA-ZÀ-ÿĀ-žА-я\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\-']*)*$/,
  
  // Contains numbers (likely not a name)
  hasNumbers: /\d/,
  
  // Special characters that are not typical in names
  specialChars: /[!@#$%^&*()_+=\[\]{}|\\:";?/<>]/,
  
  // Email-like pattern
  emailLike: /@.*\./,
  
  // URL-like pattern
  urlLike: /https?:\/\/|www\./
};

/**
 * Validates a name using NLP and pattern matching
 */
export function validateName(
  name: string,
  options: NameValidationOptions = {}
): NameValidationResult {
  const errors: any[] = [];
  
  // Basic input validation
  if (!name || typeof name !== 'string') {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Name is required',
      'name',
      name
    ));
    return {
      isValid: false,
      errors,
      confidence: ConfidenceLevel.Low,
      isLikelyName: false,
      nameType: 'unknown',
      metadata: { type: PIIType.Name }
    };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Name cannot be empty',
      'name',
      name
    ));
    return {
      isValid: false,
      errors,
      confidence: ConfidenceLevel.Low,
      isLikelyName: false,
      nameType: 'unknown',
      metadata: { type: PIIType.Name }
    };
  }

  // Length validation
  const minLength = options.minLength ?? 2;
  const maxLength = options.maxLength ?? 100;
  
  if (trimmedName.length < minLength) {
    errors.push(createValidationError(
      ErrorCodes.FIELD_TOO_SHORT,
      `Name must be at least ${minLength} characters long`,
      'name',
      trimmedName
    ));
  }
  
  if (trimmedName.length > maxLength) {
    errors.push(createValidationError(
      ErrorCodes.FIELD_TOO_LONG,
      `Name cannot exceed ${maxLength} characters`,
      'name',
      trimmedName
    ));
  }

  // Check for blacklisted names
  const lowerName = trimmedName.toLowerCase();
  if (NON_NAMES.has(lowerName) || options.blacklistedNames?.includes(lowerName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Name appears to be a placeholder or invalid value',
      'name',
      trimmedName
    ));
  }

  // Pattern-based validation
  let confidence = ConfidenceLevel.Low;
  let isLikelyName = false;
  let nameType: 'person' | 'organization' | 'unknown' = 'unknown';

  // Check for patterns that disqualify as names
  if (NAME_PATTERNS.hasNumbers.test(trimmedName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Names should not contain numbers',
      'name',
      trimmedName
    ));
  }

  if (NAME_PATTERNS.specialChars.test(trimmedName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Names contain invalid special characters',
      'name',
      trimmedName
    ));
  }

  if (NAME_PATTERNS.emailLike.test(trimmedName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Name appears to be an email address',
      'name',
      trimmedName
    ));
  }

  if (NAME_PATTERNS.urlLike.test(trimmedName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Name appears to be a URL',
      'name',
      trimmedName
    ));
  }

  // Basic character set validation
  if (!options.allowNonLatin && !NAME_PATTERNS.latinName.test(trimmedName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Name contains non-Latin characters',
      'name',
      trimmedName
    ));
  }

  // Title case validation
  if (options.requireTitleCase && !NAME_PATTERNS.titleCase.test(trimmedName)) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Name must be in title case',
      'name',
      trimmedName
    ));
  }

  // Use NLP to analyze the name
  let nlpAnalysis: any;
  let firstName: string | undefined;
  let lastName: string | undefined;
  let middleName: string | undefined;
  let prefix: string | undefined;
  let suffix: string | undefined;

  try {
    nlpAnalysis = nlp(trimmedName);
    
    // Extract people entities
    const people = nlpAnalysis.people();
    const organizations = nlpAnalysis.organizations();
    
    if (people.length > 0) {
      nameType = 'person';
      isLikelyName = true;
      confidence = ConfidenceLevel.High;
      
      // Try to extract name parts
      const nameWords = trimmedName.split(/\s+/);
      
      if (nameWords.length === 1) {
        if (!options.allowSingleName) {
          errors.push(createValidationError(
            ErrorCodes.INVALID_FORMAT,
            'Single names are not allowed',
            'name',
            trimmedName
          ));
        } else {
          firstName = nameWords[0];
        }
      } else if (nameWords.length >= 2) {
        // Basic name part extraction
        let startIndex = 0;
        let endIndex = nameWords.length - 1;
        
        // Check for prefix
        if (NAME_PREFIXES.has(nameWords[0].toLowerCase().replace('.', ''))) {
          if (options.allowPrefix) {
            prefix = nameWords[0];
            startIndex = 1;
          } else {
            errors.push(createValidationError(
              ErrorCodes.INVALID_FORMAT,
              'Name prefixes are not allowed',
              'name',
              trimmedName
            ));
          }
        }
        
        // Check for suffix
        if (NAME_SUFFIXES.has(nameWords[endIndex].toLowerCase().replace('.', ''))) {
          if (options.allowSuffix) {
            suffix = nameWords[endIndex];
            endIndex -= 1;
          } else {
            errors.push(createValidationError(
              ErrorCodes.INVALID_FORMAT,
              'Name suffixes are not allowed',
              'name',
              trimmedName
            ));
          }
        }
        
        // Extract first and last name
        if (startIndex <= endIndex) {
          firstName = nameWords[startIndex];
          
          if (startIndex < endIndex) {
            lastName = nameWords[endIndex];
            
            // Middle name(s)
            if (startIndex + 1 < endIndex) {
              if (options.allowMiddleName) {
                middleName = nameWords.slice(startIndex + 1, endIndex).join(' ');
              } else {
                errors.push(createValidationError(
                  ErrorCodes.INVALID_FORMAT,
                  'Middle names are not allowed',
                  'name',
                  trimmedName
                ));
              }
            }
          }
        }
      }
      
    } else if (organizations.length > 0) {
      nameType = 'organization';
      isLikelyName = true;
      confidence = ConfidenceLevel.Medium;
    } else {
      // Check if it looks like a name using patterns
      if (NAME_PATTERNS.multiWordName.test(trimmedName) || NAME_PATTERNS.singleName.test(trimmedName)) {
        isLikelyName = true;
        confidence = ConfidenceLevel.Medium;
        nameType = 'person';
      }
    }
    
  } catch (error) {
    // NLP failed, fall back to pattern matching
    if (NAME_PATTERNS.multiWordName.test(trimmedName)) {
      isLikelyName = true;
      confidence = ConfidenceLevel.Low;
      nameType = 'person';
    }
  }

  // Custom pattern validation
  if (options.customPatterns) {
    for (const pattern of options.customPatterns) {
      if (!pattern.test(trimmedName)) {
        errors.push(createValidationError(
          ErrorCodes.INVALID_FORMAT,
          'Name does not match required pattern',
          'name',
          trimmedName
        ));
      }
    }
  }

  const isValid = errors.length === 0 && isLikelyName;

  return {
    isValid,
    value: isValid ? trimmedName : undefined,
    normalized: isValid ? normalizeNameCapitalization(trimmedName) : undefined,
    errors,
    firstName,
    lastName,
    middleName,
    prefix,
    suffix,
    confidence,
    isLikelyName,
    nameType,
    metadata: {
      type: PIIType.Name,
      validationOptions: options,
      originalLength: name.length,
      trimmedLength: trimmedName.length,
      wordCount: trimmedName.split(/\s+/).length,
      nlpConfidence: confidence
    }
  };
}

/**
 * Normalizes name capitalization to proper title case
 */
export function normalizeNameCapitalization(name: string): string {
  if (!name || typeof name !== 'string') {
    return name;
  }

  return name
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      // Handle common prefixes
      const cleanWord = word.replace(/[.,]/g, '');
      if (NAME_PREFIXES.has(cleanWord.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      
      // Handle hyphenated names
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-');
      }
      
      // Handle apostrophes (O'Connor, D'Angelo)
      if (word.includes("'")) {
        const parts = word.split("'");
        return parts
          .map((part, index) => {
            if (index === 0 || part.length > 1) {
              return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part.toLowerCase();
          })
          .join("'");
      }
      
      // Regular title case
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Extracts first and last name from full name
 */
export function extractNameParts(name: string): { first?: string; last?: string; middle?: string } {
  const validation = validateName(name, { allowMiddleName: true });
  return {
    first: validation.firstName,
    last: validation.lastName,
    middle: validation.middleName
  };
}

/**
 * Checks if text is likely a person's name
 */
export function isLikelyPersonName(text: string): boolean {
  const validation = validateName(text);
  return validation.isLikelyName && validation.nameType === 'person';
}

/**
 * Validates multiple names
 */
export function validateNames(
  names: string[],
  options: NameValidationOptions = {}
): NameValidationResult[] {
  return names.map(name => validateName(name, options));
}

/**
 * Normalizes person name to standard format
 */
export function normalizePersonName(
  name: string,
  options: NameValidationOptions = {}
): string {
  try {
    // Trim and clean up whitespace
    let normalized = name.trim().replace(/\s+/g, ' ');
    
    // Apply title case normalization if requested
    if (options.requireTitleCase !== false) {
      normalized = normalizeNameCapitalization(normalized);
    }
    
    return normalized;
  } catch {
    return name;
  }
}

/**
 * Creates a name from parts
 */
export function createFullName(parts: {
  prefix?: string;
  first: string;
  middle?: string;
  last?: string;
  suffix?: string;
}): string {
  const nameParts: string[] = [];
  
  if (parts.prefix) nameParts.push(parts.prefix);
  nameParts.push(parts.first);
  if (parts.middle) nameParts.push(parts.middle);
  if (parts.last) nameParts.push(parts.last);
  if (parts.suffix) nameParts.push(parts.suffix);
  
  return nameParts.join(' ');
}