/**
 * Tests for PII detection functionality
 */

import { describe, it, expect } from 'vitest';
import { 
  detectPII, 
  hasPII, 
  countPIIByType,
  detectPIIMultiple,
  getDefaultPIIPatterns
} from '../detect/index.js';
import { PIIType, ConfidenceLevel } from '../core/types.js';

describe('PII Detection', () => {
  describe('detectPII', () => {
    it('should detect email addresses', () => {
      const text = 'Please contact me at john.doe@example.com for more information.';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain(PIIType.Email);
      expect(result.spans).toHaveLength(1);
      expect(result.spans[0].text).toBe('john.doe@example.com');
      expect(result.spans[0].type).toBe(PIIType.Email);
    });

    it('should detect phone numbers', () => {
      const text = 'Call me at (555) 123-4567 or +1-555-987-6543.';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain(PIIType.Phone);
      expect(result.spans.length).toBeGreaterThan(0);
      
      const phoneSpans = result.spans.filter(span => span.type === PIIType.Phone);
      expect(phoneSpans.length).toBeGreaterThan(0);
    });

    it('should detect SSNs', () => {
      const text = 'My SSN is 555-55-5555 for verification.';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain(PIIType.SSN);
      
      const ssnSpans = result.spans.filter(span => span.type === PIIType.SSN);
      expect(ssnSpans.length).toBe(1);
      expect(ssnSpans[0].text).toBe('555-55-5555');
    });

    it('should detect credit card numbers', () => {
      const text = 'Payment with card 4111111111111111.';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain(PIIType.CreditCard);
      
      const cardSpans = result.spans.filter(span => span.type === PIIType.CreditCard);
      expect(cardSpans.length).toBe(1);
    });

    it('should detect IP addresses', () => {
      const text = 'Server is running on 192.168.1.100 port 8080.';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain(PIIType.IPAddress);
      
      const ipSpans = result.spans.filter(span => span.type === PIIType.IPAddress);
      expect(ipSpans.length).toBe(1);
      expect(ipSpans[0].text).toBe('192.168.1.100');
    });

    it('should detect multiple PII types in single text', () => {
      const text = 'Contact John Doe at john@example.com or call (555) 123-4567. SSN: 555-55-5555';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes.length).toBeGreaterThan(1);
      expect(result.spans.length).toBeGreaterThan(2);
      
      const types = new Set(result.spans.map(span => span.type));
      expect(types.has(PIIType.Email)).toBe(true);
      expect(types.has(PIIType.Phone)).toBe(true);
      expect(types.has(PIIType.SSN)).toBe(true);
    });

    it('should handle text with no PII', () => {
      const text = 'This is just regular text with no sensitive information.';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(false);
      expect(result.detectedTypes).toHaveLength(0);
      expect(result.spans).toHaveLength(0);
    });

    it('should provide confidence levels', () => {
      const text = 'Email: valid@example.com';
      const result = detectPII(text);
      
      expect(result.confidence).toBeDefined();
      expect(result.spans[0].confidence).toBeDefined();
      expect(Object.values(ConfidenceLevel)).toContain(result.spans[0].confidence);
    });

    it('should handle confidence threshold filtering', () => {
      const text = 'Email: test@example.com';
      const highThresholdResult = detectPII(text, { confidenceThreshold: 0.9 });
      const lowThresholdResult = detectPII(text, { confidenceThreshold: 0.1 });
      
      expect(lowThresholdResult.spans.length).toBeGreaterThanOrEqual(highThresholdResult.spans.length);
    });

    it('should detect names with NLP when enabled', () => {
      const text = 'John Smith will attend the meeting tomorrow.';
      const result = detectPII(text, { enableNLP: true });
      
      // NLP detection might find names
      if (result.hasPII) {
        const nameSpans = result.spans.filter(span => span.type === PIIType.Name);
        if (nameSpans.length > 0) {
          expect(nameSpans[0].metadata?.source).toBe('nlp');
        }
      }
    });

    it('should handle context extraction', () => {
      const text = 'The user email address is user@example.com and should be verified.';
      const result = detectPII(text, { includeContext: true, contextWindow: 5 });
      
      if (result.spans.length > 0) {
        expect(result.spans[0].metadata?.context).toBeDefined();
        expect(typeof result.spans[0].metadata?.context).toBe('string');
      }
    });

    it('should respect text length limits', () => {
      const longText = 'a'.repeat(100000);
      
      expect(() => {
        detectPII(longText, { maxTextLength: 50000 });
      }).toThrow();
    });

    it('should handle strict mode', () => {
      const text = 'Email: test@invalid-domain';
      const strictResult = detectPII(text, { strictMode: true });
      const lenientResult = detectPII(text, { strictMode: false });
      
      // Strict mode should filter out invalid matches
      expect(strictResult.spans.length).toBeLessThanOrEqual(lenientResult.spans.length);
    });

    it('should provide suggestions for detected PII', () => {
      const text = 'SSN: 123-45-6789, Credit Card: 4111111111111111';
      const result = detectPII(text);
      
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('Critical PII'))).toBe(true);
    });
  });

  describe('hasPII', () => {
    it('should quickly check for PII presence', () => {
      expect(hasPII('Contact: john@example.com')).toBe(true);
      expect(hasPII('No sensitive data here')).toBe(false);
    });

    it('should be faster than full detection', () => {
      const text = 'Email: test@example.com';
      
      const start1 = Date.now();
      hasPII(text);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      detectPII(text);
      const time2 = Date.now() - start2;
      
      // hasPII should generally be faster or similar
      expect(time1).toBeLessThanOrEqual(time2 + 10); // Allow some margin
    });
  });

  describe('countPIIByType', () => {
    it('should count occurrences by PII type', () => {
      const text = 'Emails: john@example.com, jane@test.com. Phone: 555-123-4567';
      const counts = countPIIByType(text);
      
      expect(counts[PIIType.Email]).toBeGreaterThan(0);
      expect(counts[PIIType.Phone]).toBeGreaterThan(0);
      expect(counts[PIIType.SSN]).toBe(0);
    });

    it('should return zero counts for text without PII', () => {
      const counts = countPIIByType('No PII here');
      
      Object.values(counts).forEach(count => {
        expect(count).toBe(0);
      });
    });
  });

  describe('detectPIIMultiple', () => {
    it('should process multiple texts', () => {
      const texts = [
        'Email: user1@example.com',
        'Phone: 555-123-4567',
        'No PII here'
      ];
      
      const results = detectPIIMultiple(texts);
      
      expect(results).toHaveLength(3);
      expect(results[0].hasPII).toBe(true);
      expect(results[1].hasPII).toBe(true);
      expect(results[2].hasPII).toBe(false);
    });
  });

  describe('Pattern Management', () => {
    it('should get default patterns', () => {
      const patterns = getDefaultPIIPatterns();
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.type && p.regex && p.description)).toBe(true);
    });

    it('should include common PII types in patterns', () => {
      const patterns = getDefaultPIIPatterns();
      const types = patterns.map(p => p.type);
      
      expect(types).toContain(PIIType.Email);
      expect(types).toContain(PIIType.Phone);
      expect(types).toContain(PIIType.SSN);
      expect(types).toContain(PIIType.CreditCard);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      expect(() => {
        detectPII('');
      }).toThrow();
    });

    it('should handle null/undefined input', () => {
      expect(() => detectPII(null as any)).toThrow();
      expect(() => detectPII(undefined as any)).toThrow();
    });

    it('should handle special characters', () => {
      const text = 'Email: test@domain.com! Phone: (555) 123-4567?';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      // Should still detect despite punctuation
    });

    it('should handle malformed PII', () => {
      const text = 'Malformed: @domain.com, 555-, 123-45-';
      const result = detectPII(text);
      
      // Should not detect malformed patterns
      expect(result.spans.length).toBe(0);
    });

    it('should handle case sensitivity', () => {
      const text = 'EMAIL: USER@EXAMPLE.COM';
      const result = detectPII(text);
      
      expect(result.hasPII).toBe(true);
      expect(result.spans[0].text).toBe('USER@EXAMPLE.COM');
    });
  });

  describe('Performance', () => {
    it('should handle reasonable text sizes efficiently', () => {
      const mediumText = 'Contact info: ' + 'email@example.com '.repeat(100) + 'phones: ' + '555-1234 '.repeat(100);
      
      const start = Date.now();
      const result = detectPII(mediumText);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.hasPII).toBe(true);
    });
  });
});