/**
 * Tests for email validation functionality
 */

import { describe, it, expect } from 'vitest';
import { 
  validateEmail, 
  normalizeEmail, 
  isDisposableEmail, 
  extractEmailDomain,
  validateEmails,
  isValidEmailFormat
} from '../validate/email.js';

describe('Email Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user+tag@domain.org',
        'firstname.lastname@example.com',
        'email@domain-one.com',
        'firstname.lastname@domain.com'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.value).toBe(email);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@.com.',
        'username@com',
        'username..double.dot@example.com',
        'username@-example.com',
        'username@example-.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should handle email length validation', () => {
      const tooLong = 'a'.repeat(300) + '@example.com';
      const result = validateEmail(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'FIELD_TOO_LONG')).toBe(true);
    });

    it('should extract domain and local parts', () => {
      const result = validateEmail('user@example.com');
      expect(result.domain).toBe('example.com');
      expect(result.localPart).toBe('user');
    });

    it('should detect disposable email domains', () => {
      const result = validateEmail('test@10minutemail.com');
      expect(result.isDisposable).toBe(true);
    });

    it('should detect corporate email domains', () => {
      const result = validateEmail('user@gmail.com');
      expect(result.isCorporate).toBe(true);
    });

    it('should handle domain validation options', () => {
      const options = {
        blacklistedDomains: ['spam.com'],
        domainSpecificValidation: true
      };
      
      const result = validateEmail('user@spam.com', options);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('not allowed'))).toBe(true);
    });

    it('should handle whitelist validation', () => {
      const options = {
        whitelistedDomains: ['company.com'],
        domainSpecificValidation: true
      };
      
      const validResult = validateEmail('user@company.com', options);
      expect(validResult.isValid).toBe(true);
      
      const invalidResult = validateEmail('user@other.com', options);
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    it('should normalize email to lowercase', () => {
      const result = normalizeEmail('USER@EXAMPLE.COM');
      expect(result).toBe('user@example.com');
    });

    it('should handle normalization gracefully for invalid emails', () => {
      const result = normalizeEmail('invalid-email');
      expect(result).toBe('invalid-email');
    });

    it('should preserve valid email structure', () => {
      const email = 'user+tag@example.com';
      const result = normalizeEmail(email);
      expect(result).toBe('user+tag@example.com');
    });
  });

  describe('isDisposableEmail', () => {
    it('should detect known disposable domains', () => {
      expect(isDisposableEmail('test@10minutemail.com')).toBe(true);
      expect(isDisposableEmail('test@guerrillamail.com')).toBe(true);
      expect(isDisposableEmail('user@gmail.com')).toBe(false);
    });
  });

  describe('extractEmailDomain', () => {
    it('should extract domain from valid emails', () => {
      expect(extractEmailDomain('user@example.com')).toBe('example.com');
      expect(extractEmailDomain('test@domain.co.uk')).toBe('domain.co.uk');
    });

    it('should return null for invalid emails', () => {
      expect(extractEmailDomain('invalid-email')).toBe(null);
    });
  });

  describe('validateEmails', () => {
    it('should validate multiple emails', () => {
      const emails = ['valid@example.com', 'invalid-email', 'another@test.com'];
      const results = validateEmails(emails);
      
      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
    });
  });

  describe('isValidEmailFormat', () => {
    it('should perform fast email format validation', () => {
      expect(isValidEmailFormat('user@example.com')).toBe(true);
      expect(isValidEmailFormat('invalid-email')).toBe(false);
      expect(isValidEmailFormat('')).toBe(false);
      expect(isValidEmailFormat(null as any)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'REQUIRED_FIELD')).toBe(true);
    });

    it('should handle null/undefined input', () => {
      const result = validateEmail(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'REQUIRED_FIELD')).toBe(true);
    });

    it('should handle whitespace-only input', () => {
      const result = validateEmail('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'REQUIRED_FIELD')).toBe(true);
    });

    it('should trim whitespace from valid emails', () => {
      const result = validateEmail('  user@example.com  ');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('user@example.com');
    });
  });
});