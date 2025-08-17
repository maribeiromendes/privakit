/**
 * Detection module for pattern matching and span extraction of PII
 */

import nlp from 'compromise';
import type { DetectionSpan, PIIPattern, DetectionConfig, PIIDetectionResult } from '../core/types.js';
import { PIIType, ConfidenceLevel } from '../core/types.js';
import { PIIDetectionError, ErrorCodes } from '../core/errors.js';
import { validateEmail } from '../validate/email.js';
import { validatePhone } from '../validate/phone.js';
import { validateName } from '../validate/name.js';
import { validateAddress } from '../validate/address.js';

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

// Enhanced PII detection patterns with improved accuracy
const DEFAULT_PII_PATTERNS: PIIPattern[] = [
  {
    type: PIIType.Email,
    regex: /\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\b/g,
    description: 'Email addresses (RFC 5322 compliant)',
    riskLevel: 'high' as any,
    examples: ['user@example.com', 'test.email+tag@domain.co.uk'],
    falsePositiveFilters: [
      (match) => !match.includes('..'), // No consecutive dots
      (match) => !match.startsWith('.') && !match.endsWith('.'), // No leading/trailing dots
      (match) => match.split('@').length === 2 // Exactly one @
    ]
  },
  {
    type: PIIType.Phone,
    regex: /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    description: 'US phone numbers',
    riskLevel: 'high' as any,
    examples: ['+1 (555) 123-4567', '555-123-4567', '5551234567'],
    falsePositiveFilters: [
      (match) => !/^(000|111|222|333|444|666|777|888|999)/.test(match.replace(/\D/g, '')), // Invalid area codes (removed 555 which is used in examples)
      (match) => {
        const digits = match.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
      }
    ]
  },
  {
    type: PIIType.Phone,
    regex: /\+(?:[0-9] ?){6,14}[0-9]/g,
    description: 'International phone numbers',
    riskLevel: 'high' as any,
    examples: ['+44 20 7946 0958', '+33 1 42 86 83 26'],
    falsePositiveFilters: [
      (match) => {
        const digits = match.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15; // ITU-T E.164
      }
    ]
  },
  {
    type: PIIType.SSN,
    regex: /\b(?!000|666|9\d\d)\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}\b/g,
    description: 'US Social Security Numbers',
    riskLevel: 'critical' as any,
    examples: ['123-45-6789', '123456789'],
    falsePositiveFilters: [
      (match) => {
        const clean = match.replace(/\D/g, '');
        return !['123456789', '987654321'].includes(clean); // Common fake SSNs
      }
    ]
  },
  {
    type: PIIType.CreditCard,
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    description: 'Credit card numbers (Visa, MasterCard, Amex, Discover)',
    riskLevel: 'critical' as any,
    examples: ['4111111111111111', '5555555555554444'],
    falsePositiveFilters: [
      (match) => luhnCheck(match), // Luhn algorithm validation
      (match) => !['1111111111111111', '0000000000000000'].includes(match) // Obvious fakes
    ]
  },
  {
    type: PIIType.IPAddress,
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    description: 'IPv4 addresses',
    riskLevel: 'moderate' as any,
    examples: ['192.168.1.1', '10.0.0.1'],
    falsePositiveFilters: [
      (match) => {
        const parts = match.split('.');
        return parts.every(part => parseInt(part) <= 255); // Valid IPv4
      }
    ]
  },
  {
    type: PIIType.ZipCode,
    regex: /\b\d{5}(?:-\d{4})?\b/g,
    description: 'US ZIP codes',
    riskLevel: 'low' as any,
    examples: ['12345', '12345-6789'],
    falsePositiveFilters: [
      (match) => {
        const zip = match.split('-')[0];
        return zip !== '00000' && zip !== '99999'; // Invalid ZIPs
      }
    ]
  },
  {
    type: PIIType.IBAN,
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
    description: 'International Bank Account Numbers',
    riskLevel: 'critical' as any,
    examples: ['GB82WEST12345698765432', 'DE89370400440532013000']
  },
  {
    type: PIIType.DateOfBirth,
    regex: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
    description: 'Dates of birth (MM/DD/YYYY format)',
    riskLevel: 'high' as any,
    examples: ['01/15/1990', '12-31-1985']
  }
];

/**
 * Detects PII in text using pattern matching and NLP
 */
export function detectPII(
  text: string,
  options: DetectionOptions = {}
): PIIDetectionResult {
  if (!text || typeof text !== 'string') {
    throw new PIIDetectionError(
      'Invalid text provided for PII detection',
      undefined,
      text?.length
    );
  }

  const maxLength = options.maxTextLength || 50000;
  if (text.length > maxLength) {
    throw new PIIDetectionError(
      `Text length ${text.length} exceeds maximum allowed length ${maxLength}`,
      undefined,
      text.length
    );
  }

  const confidenceThreshold = options.confidenceThreshold || 0.7;
  const enableNLP = options.enableNLP !== false;
  const enableSpanExtraction = options.enableSpanExtraction !== false;

  const detectedSpans: DetectionSpan[] = [];
  const detectedTypes = new Set<PIIType>();
  const suggestions: string[] = [];

  // Combine default patterns with custom patterns
  const patterns = [...DEFAULT_PII_PATTERNS];
  if (options.customPatterns) {
    patterns.push(...options.customPatterns);
  }

  // Pattern-based detection
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern.regex));
    
    for (const match of matches) {
      if (match.index === undefined) continue;

      const matchedText = match[0];
      const start = match.index;
      const end = start + matchedText.length;

      // Apply false positive filters
      let isValid = true;
      if (pattern.falsePositiveFilters) {
        isValid = pattern.falsePositiveFilters.every(filter => filter(matchedText));
      }

      if (!isValid) continue;

      // Additional validation using specific validators
      let confidence = ConfidenceLevel.Medium;
      let additionalValidation = true;

      switch (pattern.type) {
        case PIIType.Email:
          const emailValidation = validateEmail(matchedText, { allowDisplayName: false });
          additionalValidation = emailValidation.isValid;
          confidence = emailValidation.isValid ? ConfidenceLevel.High : ConfidenceLevel.Low;
          break;
        
        case PIIType.Phone:
          const phoneValidation = validatePhone(matchedText);
          // For pattern detection, we're more lenient - if it looks like a phone number and passes basic validation, we accept it
          additionalValidation = phoneValidation.isValid || !!phoneValidation.isPossible || 
                                matchedText.replace(/\D/g, '').length >= 10; // At least 10 digits
          confidence = phoneValidation.isValid ? ConfidenceLevel.High : 
                      phoneValidation.isPossible ? ConfidenceLevel.Medium : 
                      matchedText.replace(/\D/g, '').length >= 10 ? ConfidenceLevel.High : ConfidenceLevel.Low;
          break;
          
        case PIIType.SSN:
          // SSNs that pass false positive filters (including fake SSN checks) get higher confidence
          confidence = ConfidenceLevel.High;
          break;
          
        case PIIType.CreditCard:
          // Credit cards that pass Luhn check get higher confidence
          confidence = ConfidenceLevel.High;
          break;
          
        case PIIType.IPAddress:
          // IP addresses that pass validation get higher confidence
          confidence = ConfidenceLevel.High;
          break;
      }

      if (options.strictMode && !additionalValidation) {
        continue;
      }

      // Create detection span
      const span: DetectionSpan = {
        type: pattern.type,
        start,
        end,
        text: matchedText,
        confidence,
        metadata: {
          pattern: pattern.description,
          riskLevel: pattern.riskLevel,
          validationPassed: additionalValidation,
          context: options.includeContext ? extractContext(text, start, end, options.contextWindow || 10) : undefined
        }
      };

      detectedSpans.push(span);
      detectedTypes.add(pattern.type);
    }
  }

  // NLP-based name detection
  if (enableNLP) {
    const nlpResults = detectNamesWithNLP(text, options);
    detectedSpans.push(...nlpResults.spans);
    nlpResults.types.forEach(type => detectedTypes.add(type));
    suggestions.push(...nlpResults.suggestions);
  }

  // Calculate overall confidence
  const overallConfidence = calculateOverallConfidence(detectedSpans);

  // Filter by confidence threshold
  const filteredSpans = detectedSpans.filter(span => {
    const confidenceValue = getConfidenceValue(span.confidence);
    return confidenceValue >= confidenceThreshold;
  });

  // Generate suggestions
  if (detectedTypes.size > 0) {
    suggestions.push('Consider masking or redacting detected PII before logging or storing');
    
    if (detectedTypes.has(PIIType.SSN) || detectedTypes.has(PIIType.CreditCard)) {
      suggestions.push('Critical PII detected - ensure encryption and secure handling');
    }
    
    if (detectedTypes.has(PIIType.Email) || detectedTypes.has(PIIType.Phone)) {
      suggestions.push('Contact information detected - verify consent for processing');
    }
  }

  return {
    hasPII: filteredSpans.length > 0,
    detectedTypes: Array.from(detectedTypes),
    spans: enableSpanExtraction ? filteredSpans : [],
    suggestions,
    confidence: overallConfidence,
    metadata: {
      totalMatches: detectedSpans.length,
      filteredMatches: filteredSpans.length,
      confidenceThreshold,
      nlpEnabled: enableNLP,
      textLength: text.length,
      patterns: patterns.length
    }
  };
}

/**
 * NLP-based name detection using compromise.js
 */
function detectNamesWithNLP(
  text: string,
  options: DetectionOptions
): { spans: DetectionSpan[]; types: PIIType[]; suggestions: string[] } {
  const spans: DetectionSpan[] = [];
  const types: PIIType[] = [];
  const suggestions: string[] = [];

  try {
    const doc = nlp(text);
    
    // Extract person names
    const people = doc.people();
    people.forEach((person: any) => {
      const personText = person.text();
      const nameValidation = validateName(personText, { allowSingleName: true });
      
      if (nameValidation.isLikelyName && nameValidation.nameType === 'person') {
        // Find all occurrences of this name in the text
        const regex = new RegExp(`\\b${escapeRegex(personText)}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          spans.push({
            type: PIIType.Name,
            start: match.index,
            end: match.index + personText.length,
            text: personText,
            confidence: nameValidation.confidence,
            metadata: {
              source: 'nlp',
              nameType: nameValidation.nameType,
              firstName: nameValidation.firstName,
              lastName: nameValidation.lastName,
              context: options.includeContext ? extractContext(text, match.index, match.index + personText.length, options.contextWindow || 10) : undefined
            }
          });
        }
        
        types.push(PIIType.Name);
      }
    });

    // Extract organizations that might be confused with names
    const organizations = doc.organizations();
    if (organizations.length > 0) {
      suggestions.push('Organization names detected - verify if these should be treated as PII');
    }

    // Extract places that might contain address information
    const places = doc.places();
    places.forEach((place: any) => {
      const placeText = place.text();
      const addressValidation = validateAddress(placeText);
      
      if (addressValidation.confidence !== ConfidenceLevel.Low) {
        const regex = new RegExp(`\\b${escapeRegex(placeText)}\\b`, 'gi');
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          spans.push({
            type: PIIType.Address,
            start: match.index,
            end: match.index + placeText.length,
            text: placeText,
            confidence: addressValidation.confidence,
            metadata: {
              source: 'nlp',
              addressType: addressValidation.addressType,
              components: addressValidation.components,
              context: options.includeContext ? extractContext(text, match.index, match.index + placeText.length, options.contextWindow || 10) : undefined
            }
          });
        }
        
        types.push(PIIType.Address);
      }
    });

  } catch (error) {
    suggestions.push('NLP processing failed - consider manual review for name detection');
  }

  return { spans, types, suggestions };
}

/**
 * Batch detection for multiple texts
 */
export function detectPIIMultiple(
  texts: string[],
  options: DetectionOptions = {}
): PIIDetectionResult[] {
  return texts.map(text => detectPII(text, options));
}

/**
 * Creates a detection configuration from options
 */
export function createDetectionConfig(options: DetectionOptions = {}): DetectionConfig {
  return {
    patterns: [...DEFAULT_PII_PATTERNS, ...(options.customPatterns || [])],
    enableNLP: options.enableNLP !== false,
    confidenceThreshold: options.confidenceThreshold || 0.7,
    maxTextLength: options.maxTextLength || 50000,
    enableSpanExtraction: options.enableSpanExtraction !== false
  };
}

/**
 * Extracts context around detected PII
 */
function extractContext(text: string, start: number, end: number, windowSize: number = 10): string {
  const beforeStart = Math.max(0, start - windowSize);
  const afterEnd = Math.min(text.length, end + windowSize);
  
  const before = text.substring(beforeStart, start);
  const after = text.substring(end, afterEnd);
  const detected = text.substring(start, end);
  
  return `...${before}[${detected}]${after}...`;
}

/**
 * Calculates overall confidence from detection spans
 */
function calculateOverallConfidence(spans: DetectionSpan[]): ConfidenceLevel {
  if (spans.length === 0) return ConfidenceLevel.Low;
  
  const confidenceValues = spans.map(span => getConfidenceValue(span.confidence));
  const average = confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length;
  
  if (average >= 0.8) return ConfidenceLevel.VeryHigh;
  if (average >= 0.6) return ConfidenceLevel.High;
  if (average >= 0.4) return ConfidenceLevel.Medium;
  return ConfidenceLevel.Low;
}

/**
 * Converts confidence level to numeric value
 */
function getConfidenceValue(confidence: ConfidenceLevel): number {
  switch (confidence) {
    case ConfidenceLevel.VeryHigh: return 0.9;
    case ConfidenceLevel.High: return 0.7;
    case ConfidenceLevel.Medium: return 0.5;
    case ConfidenceLevel.Low: return 0.3;
    default: return 0.3;
  }
}

/**
 * Escapes special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let alternate = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

/**
 * Gets default PII patterns
 */
export function getDefaultPIIPatterns(): PIIPattern[] {
  return [...DEFAULT_PII_PATTERNS];
}

/**
 * Adds custom PII pattern
 */
export function addPIIPattern(pattern: PIIPattern): void {
  DEFAULT_PII_PATTERNS.push(pattern);
}

/**
 * Removes PII pattern by type
 */
export function removePIIPattern(type: PIIType): boolean {
  const index = DEFAULT_PII_PATTERNS.findIndex(p => p.type === type);
  if (index >= 0) {
    DEFAULT_PII_PATTERNS.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Quick PII check without detailed analysis
 */
export function hasPII(text: string, options: DetectionOptions = {}): boolean {
  const result = detectPII(text, { ...options, enableSpanExtraction: false });
  return result.hasPII;
}

/**
 * Counts PII occurrences by type
 */
export function countPIIByType(text: string, options: DetectionOptions = {}): Record<PIIType, number> {
  const result = detectPII(text, options);
  const counts: Record<PIIType, number> = {} as any;
  
  for (const type of Object.values(PIIType)) {
    counts[type] = result.spans.filter(span => span.type === type).length;
  }
  
  return counts;
}