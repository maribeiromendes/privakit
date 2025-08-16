/**
 * Address validation with pattern matching and format detection
 */

import { ValidationResult, PIIType, LocaleContext, ConfidenceLevel } from '../core/types.js';
import { PIIValidationError, createValidationError, ErrorCodes } from '../core/errors.js';

export interface AddressValidationOptions {
  country?: string;
  allowPoBox?: boolean;
  requirePostalCode?: boolean;
  requireCountry?: boolean;
  strictFormat?: boolean;
  allowApartmentNumbers?: boolean;
  maxLineLength?: number;
  allowedCountries?: string[];
  blockedCountries?: string[];
}

export interface AddressComponent {
  streetNumber?: string;
  streetName?: string;
  apartmentNumber?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  poBox?: string;
}

export interface AddressValidationResult extends ValidationResult<string> {
  components: AddressComponent;
  confidence: ConfidenceLevel;
  addressType: 'residential' | 'commercial' | 'po_box' | 'unknown';
  isComplete: boolean;
  formattedAddress?: string;
}

// Common address patterns
const ADDRESS_PATTERNS = {
  // Street number at start
  streetNumber: /^\s*(\d+[a-zA-Z]?)\s+/,
  
  // Street names and types
  streetTypes: /\b(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|place|pl|way|circle|cir|parkway|pkwy)\b/i,
  
  // Apartment/unit indicators
  apartment: /\b(apt|apartment|unit|suite|ste|floor|fl|room|rm|#)\s*\.?\s*([a-zA-Z0-9]+)/i,
  
  // PO Box patterns
  poBox: /\b(p\.?o\.?\s*box|post\s*office\s*box|postal\s*box)\s*\.?\s*(\d+)/i,
  
  // ZIP codes (US format)
  usZipCode: /\b(\d{5})(-\d{4})?\b/,
  
  // Canadian postal codes
  canadianPostal: /\b([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)\b/,
  
  // UK postal codes
  ukPostal: /\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i,
  
  // Generic postal codes
  postalCode: /\b(\d{4,6})\b/,
  
  // Common address separators
  separators: /[,\n\r]/,
  
  // State abbreviations (US)
  usStates: /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/i,
  
  // Country names
  countries: /\b(united\s*states|usa|canada|united\s*kingdom|uk|australia|germany|france|spain|italy|japan|china|india|brazil|mexico)\b/i
};

// Common commercial indicators
const COMMERCIAL_INDICATORS = new Set([
  'corp', 'corporation', 'inc', 'incorporated', 'ltd', 'limited', 'llc', 'company', 'co',
  'office', 'building', 'center', 'centre', 'plaza', 'mall', 'store', 'shop', 'business'
]);

/**
 * Validates an address with component extraction
 */
export function validateAddress(
  address: string,
  options: AddressValidationOptions = {}
): AddressValidationResult {
  const errors: any[] = [];
  
  // Basic input validation
  if (!address || typeof address !== 'string') {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Address is required',
      'address',
      address
    ));
    return {
      isValid: false,
      errors,
      components: {},
      confidence: ConfidenceLevel.Low,
      addressType: 'unknown',
      isComplete: false,
      metadata: { type: PIIType.Address }
    };
  }

  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length === 0) {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Address cannot be empty',
      'address',
      address
    ));
    return {
      isValid: false,
      errors,
      components: {},
      confidence: ConfidenceLevel.Low,
      addressType: 'unknown',
      isComplete: false,
      metadata: { type: PIIType.Address }
    };
  }

  // Length validation
  if (trimmedAddress.length > (options.maxLineLength ?? 500)) {
    errors.push(createValidationError(
      ErrorCodes.FIELD_TOO_LONG,
      `Address exceeds maximum length of ${options.maxLineLength ?? 500} characters`,
      'address',
      trimmedAddress
    ));
  }

  // Parse address components
  const components: AddressComponent = {};
  let confidence = ConfidenceLevel.Low;
  let addressType: AddressValidationResult['addressType'] = 'unknown';
  
  // Split address into lines
  const lines = trimmedAddress.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Check for PO Box
  const poBoxMatch = ADDRESS_PATTERNS.poBox.exec(trimmedAddress);
  if (poBoxMatch) {
    if (!options.allowPoBox) {
      errors.push(createValidationError(
        ErrorCodes.INVALID_FORMAT,
        'PO Box addresses are not allowed',
        'address',
        trimmedAddress
      ));
    } else {
      components.poBox = poBoxMatch[2];
      addressType = 'po_box';
      confidence = ConfidenceLevel.High;
    }
  } else {
    // Try to extract street address components
    const firstLine = lines[0] || '';
    
    // Extract street number
    const streetNumberMatch = ADDRESS_PATTERNS.streetNumber.exec(firstLine);
    if (streetNumberMatch) {
      components.streetNumber = streetNumberMatch[1];
      confidence = ConfidenceLevel.Medium;
      
      // Extract rest as street name
      const remainingStreet = firstLine.substring(streetNumberMatch[0].length).trim();
      if (remainingStreet) {
        components.streetName = remainingStreet;
        
        // Check if it contains street type indicators
        if (ADDRESS_PATTERNS.streetTypes.test(remainingStreet)) {
          confidence = ConfidenceLevel.High;
        }
      }
    } else {
      // No street number found, but might still be a street
      components.streetName = firstLine;
      confidence = ConfidenceLevel.Low;
    }
    
    // Check for apartment/unit numbers
    const apartmentMatch = ADDRESS_PATTERNS.apartment.exec(trimmedAddress);
    if (apartmentMatch) {
      if (!options.allowApartmentNumbers) {
        errors.push(createValidationError(
          ErrorCodes.INVALID_FORMAT,
          'Apartment numbers are not allowed',
          'address',
          trimmedAddress
        ));
      } else {
        components.apartmentNumber = apartmentMatch[2];
      }
    }
  }

  // Extract postal code
  let postalCodeMatch = ADDRESS_PATTERNS.usZipCode.exec(trimmedAddress);
  if (postalCodeMatch) {
    components.postalCode = postalCodeMatch[1] + (postalCodeMatch[2] || '');
    components.country = components.country || 'US';
  } else {
    postalCodeMatch = ADDRESS_PATTERNS.canadianPostal.exec(trimmedAddress);
    if (postalCodeMatch) {
      components.postalCode = postalCodeMatch[1];
      components.country = components.country || 'CA';
    } else {
      postalCodeMatch = ADDRESS_PATTERNS.ukPostal.exec(trimmedAddress);
      if (postalCodeMatch) {
        components.postalCode = postalCodeMatch[1];
        components.country = components.country || 'UK';
      } else {
        postalCodeMatch = ADDRESS_PATTERNS.postalCode.exec(trimmedAddress);
        if (postalCodeMatch) {
          components.postalCode = postalCodeMatch[1];
        }
      }
    }
  }

  // Extract state (for US addresses)
  const stateMatch = ADDRESS_PATTERNS.usStates.exec(trimmedAddress);
  if (stateMatch) {
    components.state = stateMatch[0].toUpperCase();
    components.country = components.country || 'US';
  }

  // Extract country
  const countryMatch = ADDRESS_PATTERNS.countries.exec(trimmedAddress);
  if (countryMatch) {
    components.country = normalizeCountry(countryMatch[0]);
  }

  // If country is specified in options, use it
  if (options.country) {
    components.country = options.country;
  }

  // Try to extract city (this is more heuristic)
  if (lines.length > 1) {
    const lastLine = lines[lines.length - 1];
    const secondLastLine = lines.length > 2 ? lines[lines.length - 2] : null;
    
    // If last line has postal code, city might be in second last line
    if (components.postalCode && secondLastLine) {
      const cityStateMatch = secondLastLine.replace(ADDRESS_PATTERNS.usZipCode, '').trim();
      if (cityStateMatch) {
        const parts = cityStateMatch.split(',').map(p => p.trim());
        if (parts.length >= 1) {
          components.city = parts[0];
        }
      }
    } else if (!components.postalCode) {
      // Try to find city in last line
      const cityMatch = lastLine.replace(ADDRESS_PATTERNS.countries, '').trim();
      if (cityMatch) {
        components.city = cityMatch;
      }
    }
  }

  // Determine address type
  if (addressType === 'unknown') {
    const lowerAddress = trimmedAddress.toLowerCase();
    const hasCommercialIndicators = [...COMMERCIAL_INDICATORS].some(indicator => 
      lowerAddress.includes(indicator)
    );
    
    if (hasCommercialIndicators) {
      addressType = 'commercial';
    } else {
      addressType = 'residential';
    }
  }

  // Check completeness
  const isComplete = !!(
    (components.streetNumber && components.streetName) || components.poBox
  ) && !!(components.city || components.postalCode);

  // Required field validation
  if (options.requirePostalCode && !components.postalCode) {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Postal code is required',
      'address',
      trimmedAddress
    ));
  }

  if (options.requireCountry && !components.country) {
    errors.push(createValidationError(
      ErrorCodes.REQUIRED_FIELD,
      'Country is required',
      'address',
      trimmedAddress
    ));
  }

  // Country validation
  if (components.country) {
    if (options.allowedCountries && !options.allowedCountries.includes(components.country)) {
      errors.push(createValidationError(
        ErrorCodes.INVALID_FORMAT,
        `Addresses from country '${components.country}' are not allowed`,
        'address',
        trimmedAddress
      ));
    }
    
    if (options.blockedCountries && options.blockedCountries.includes(components.country)) {
      errors.push(createValidationError(
        ErrorCodes.INVALID_FORMAT,
        `Addresses from country '${components.country}' are blocked`,
        'address',
        trimmedAddress
      ));
    }
  }

  // Strict format validation
  if (options.strictFormat && !isComplete) {
    errors.push(createValidationError(
      ErrorCodes.INVALID_FORMAT,
      'Address is incomplete or improperly formatted',
      'address',
      trimmedAddress
    ));
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    value: isValid ? trimmedAddress : undefined,
    normalized: isValid ? formatAddress(components) : undefined,
    errors,
    components,
    confidence,
    addressType,
    isComplete,
    formattedAddress: formatAddress(components),
    metadata: {
      type: PIIType.Address,
      validationOptions: options,
      originalLength: address.length,
      trimmedLength: trimmedAddress.length,
      lineCount: lines.length,
      componentCount: Object.keys(components).length
    }
  };
}

/**
 * Formats address components into a standardized string
 */
export function formatAddress(components: AddressComponent): string {
  const parts: string[] = [];
  
  if (components.poBox) {
    parts.push(`PO Box ${components.poBox}`);
  } else {
    let streetLine = '';
    if (components.streetNumber) {
      streetLine += components.streetNumber;
    }
    if (components.streetName) {
      streetLine += (streetLine ? ' ' : '') + components.streetName;
    }
    if (components.apartmentNumber) {
      streetLine += ` Apt ${components.apartmentNumber}`;
    }
    if (streetLine) {
      parts.push(streetLine);
    }
  }
  
  let cityLine = '';
  if (components.city) {
    cityLine += components.city;
  }
  if (components.state) {
    cityLine += (cityLine ? ', ' : '') + components.state;
  }
  if (components.postalCode) {
    cityLine += (cityLine ? ' ' : '') + components.postalCode;
  }
  if (cityLine) {
    parts.push(cityLine);
  }
  
  if (components.country) {
    parts.push(components.country);
  }
  
  return parts.join('\n');
}

/**
 * Normalizes country name to standard format
 */
export function normalizeCountry(country: string): string {
  const normalized = country.toLowerCase().replace(/\s+/g, ' ').trim();
  
  switch (normalized) {
    case 'united states':
    case 'usa':
    case 'us':
      return 'US';
    case 'united kingdom':
    case 'uk':
      return 'UK';
    case 'canada':
      return 'CA';
    case 'australia':
      return 'AU';
    case 'germany':
      return 'DE';
    case 'france':
      return 'FR';
    case 'spain':
      return 'ES';
    case 'italy':
      return 'IT';
    case 'japan':
      return 'JP';
    case 'china':
      return 'CN';
    case 'india':
      return 'IN';
    case 'brazil':
      return 'BR';
    case 'mexico':
      return 'MX';
    default:
      return country.toUpperCase();
  }
}

/**
 * Extracts postal code from address
 */
export function extractPostalCode(address: string): string | null {
  const validation = validateAddress(address);
  return validation.components.postalCode || null;
}

/**
 * Checks if address is likely a PO Box
 */
export function isPoBoxAddress(address: string): boolean {
  return ADDRESS_PATTERNS.poBox.test(address);
}

/**
 * Validates multiple addresses
 */
export function validateAddresses(
  addresses: string[],
  options: AddressValidationOptions = {}
): AddressValidationResult[] {
  return addresses.map(address => validateAddress(address, options));
}

/**
 * Creates address validation options from locale context
 */
export function createAddressOptionsFromLocale(locale: LocaleContext): AddressValidationOptions {
  return {
    country: locale.country,
    allowPoBox: true,
    requirePostalCode: false,
    requireCountry: false,
    strictFormat: false,
    allowApartmentNumbers: true
  };
}