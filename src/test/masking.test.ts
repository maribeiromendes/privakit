/**
 * Tests for PII masking functionality
 */

import { describe, it, expect } from "vitest";
import {
  maskEmail,
  maskPhone,
  maskName,
  maskAddress,
  maskCreditCard,
  maskPII,
  maskMultiple,
} from "../mask/index.js";
import { PIIType } from "../core/types.js";

describe("PII Masking", () => {
  describe("maskEmail", () => {
    it("should mask email addresses correctly", () => {
      const result = maskEmail("user@example.com");

      expect(result.masked).toBe("u***@example.com");
      expect(result.originalLength).toBe("user@example.com".length);
      expect(result.metadata?.type).toBe(PIIType.Email);
    });

    it("should respect visible start and end options", () => {
      const result = maskEmail("john.doe@example.com", {
        visibleStart: 2,
        visibleEnd: 1,
      });

      expect(result.masked).toMatch(/^jo.*e@example\.com$/);
    });

    it("should mask domain when requested", () => {
      const result = maskEmail("user@example.com", {
        maskDomain: true,
      });

      expect(result.masked).toMatch(/u\*+@\*+/);
    });

    it("should preserve TLD when masking domain", () => {
      const result = maskEmail("user@example.com", {
        maskDomain: true,
        preserveTLD: true,
      });

      expect(result.masked).toMatch(/u\*+@\*+\.com$/);
    });

    it("should handle custom mask character", () => {
      const result = maskEmail("user@example.com", {
        maskChar: "#",
      });

      expect(result.masked).toBe("u###@example.com");
    });

    it("should handle short emails", () => {
      const result = maskEmail("a@b.co");

      expect(result.masked).toMatch(/\*@b\.co/);
    });

    it("should throw error for invalid email", () => {
      expect(() => maskEmail("invalid-email")).toThrow();
      expect(() => maskEmail("")).toThrow();
      expect(() => maskEmail(null as any)).toThrow();
    });
  });

  describe("maskPhone", () => {
    it("should mask US phone numbers correctly", () => {
      const result = maskPhone("+1 (555) 123-4567");

      expect(result.masked).toMatch(/\+1 \*\*\* \*\*\*-\*\*67/);
      expect(result.originalLength).toBe("+1 (555) 123-4567".length);
      expect(result.metadata?.type).toBe(PIIType.Phone);
    });

    it("should preserve area code when requested", () => {
      const result = maskPhone("+1 (555) 123-4567", {
        preserveAreaCode: true,
      });

      expect(result.masked).toMatch(/\+1 555 \*\*\*-\*\*67/);
    });

    it("should mask country code when requested", () => {
      const result = maskPhone("+1 (555) 123-4567", {
        maskCountryCode: true,
      });

      expect(result.masked).toMatch(/\+\* \*\*\* \*\*\*-\*\*67/);
    });

    it("should handle different phone formats", () => {
      const formats = [
        "555-123-4567",
        "(555) 123-4567",
        "555.123.4567",
        "5551234567",
      ];

      formats.forEach((format) => {
        const result = maskPhone(format);
        expect(result.masked).toBeDefined();
        expect(result.originalLength).toBe(format.length);
      });
    });

    it("should fall back gracefully for unparseable numbers", () => {
      const result = maskPhone("invalid-phone-123456");

      expect(result.masked).toBeDefined();
      expect(result.metadata?.fallback).toBe(true);
    });

    it("should handle custom visible digits", () => {
      const result = maskPhone("555-123-4567", {
        visibleEnd: 3,
      });

      expect(result.masked).toMatch(/567$/);
    });
  });

  describe("maskName", () => {
    it("should mask single names", () => {
      const result = maskName("John");

      expect(result.masked).toBe("****");
      expect(result.originalLength).toBe(4);
      expect(result.metadata?.wordCount).toBe(1);
    });

    it("should mask full names", () => {
      const result = maskName("John Doe");

      expect(result.masked).toMatch(/\*+ \*+/);
      expect(result.metadata?.wordCount).toBe(2);
    });

    it("should preserve first letters when requested", () => {
      const result = maskName("John Doe Smith", {
        preserveFirstLetter: true,
      });

      expect(result.masked).toMatch(/^J\*+ D\*+ S\*+$/);
    });

    it("should handle middle names", () => {
      const result = maskName("John Michael Doe", {
        preserveFirstLetter: true,
        maskMiddleName: false,
      });

      expect(result.masked).toMatch(/^J\*+ Michael D\*+$/);
    });

    it("should optionally preserve last names", () => {
      const result = maskName("John Doe", {
        preserveFirstLetter: true,
        maskLastName: false,
      });

      expect(result.masked).toMatch(/^J\*+ Doe$/);
    });

    it("should handle custom mask character", () => {
      const result = maskName("John", {
        maskChar: "#",
      });

      expect(result.masked).toBe("####");
    });

    it("should handle empty or invalid names", () => {
      expect(() => maskName("")).toThrow();
      expect(() => maskName(null as any)).toThrow();
    });
  });

  describe("maskAddress", () => {
    it("should mask street addresses", () => {
      const address = "123 Main Street\nAnytown, ST 12345";
      const result = maskAddress(address);

      expect(result.masked).toBeDefined();
      expect(result.originalLength).toBe(address.length);
      expect(result.metadata?.type).toBe(PIIType.Address);
    });

    it("should optionally preserve street numbers", () => {
      const result = maskAddress("123 Main Street", {
        maskStreetNumber: false,
      });

      expect(result.masked).toMatch(/^123 /);
    });

    it("should mask street names when requested", () => {
      const result = maskAddress("123 Main Street", {
        maskStreetName: true,
      });

      expect(result.masked).toMatch(/M\*\*\* Street/);
    });

    it("should handle postal code masking", () => {
      const result = maskAddress("123 Main St, City, ST 12345", {
        maskPostalCode: true,
      });

      expect(result.masked).toMatch(/\*{5}$/);
    });

    it("should handle Canadian postal codes", () => {
      const result = maskAddress("123 Main St, Toronto, ON K1A 0A6", {
        maskPostalCode: true,
      });

      expect(result.masked).toMatch(/\*{7}$|\*{6}$/);
    });

    it("should mask city when requested", () => {
      const result = maskAddress("123 Main St\nAnytown, ST 12345", {
        maskCity: true,
      });

      expect(result.masked).toMatch(/\*+,/);
    });

    it("should handle multi-line addresses", () => {
      const address = "123 Main Street\nApt 4B\nAnytown, ST 12345\nUSA";
      const result = maskAddress(address);

      expect(result.metadata?.lineCount).toBe(4);
    });
  });

  describe("maskCreditCard", () => {
    it("should mask credit card numbers", () => {
      const result = maskCreditCard("4111111111111111");

      expect(result.masked).toMatch(/\*{12}1111/);
      expect(result.metadata?.digitCount).toBe(16);
    });

    it("should preserve first 4 digits when requested", () => {
      const result = maskCreditCard("4111111111111111", {
        preserveFirst4: true,
        preserveLast4: true,
      });

      expect(result.masked).toMatch(/^4111\*{8}1111$/);
    });

    it("should add group separators", () => {
      const result = maskCreditCard("4111111111111111", {
        groupSeparator: " ",
        preserveLast4: true,
      });

      expect(result.masked).toMatch(/\*{4} \*{4} \*{4} 1111/);
    });

    it("should handle cards with existing separators", () => {
      const result = maskCreditCard("4111-1111-1111-1111");

      expect(result.masked).toBeDefined();
      expect(result.metadata?.digitCount).toBe(16);
    });

    it("should handle different card lengths", () => {
      // American Express (15 digits)
      const amexResult = maskCreditCard("378282246310005");
      expect(amexResult.metadata?.digitCount).toBe(15);

      // Visa (16 digits)
      const visaResult = maskCreditCard("4111111111111111");
      expect(visaResult.metadata?.digitCount).toBe(16);
    });

    it("should throw error for short card numbers", () => {
      expect(() => maskCreditCard("1234567")).toThrow();
    });

    it("should handle invalid input", () => {
      expect(() => maskCreditCard("")).toThrow();
      expect(() => maskCreditCard(null as any)).toThrow();
    });
  });

  describe("maskPII", () => {
    it("should mask different PII types correctly", () => {
      const emailResult = maskPII("user@example.com", PIIType.Email);
      expect(emailResult.metadata?.type).toBe(PIIType.Email);

      const phoneResult = maskPII("555-123-4567", PIIType.Phone);
      expect(phoneResult.metadata?.type).toBe(PIIType.Phone);

      const nameResult = maskPII("John Doe", PIIType.Name);
      expect(nameResult.metadata?.type).toBe(PIIType.Name);
    });

    it("should provide fallback masking for unsupported types", () => {
      const result = maskPII("sensitive-data", PIIType.VAT, {
        visibleStart: 2,
        visibleEnd: 2,
      });

      expect(result.masked).toBe("se*********ta");
      expect(result.metadata?.fallback).toBe(true);
    });

    it("should handle custom masking options", () => {
      const result = maskPII("test@example.com", PIIType.Email, {
        maskChar: "#",
        visibleStart: 2,
      });

      expect(result.masked).toMatch(/^te/);
      expect(result.masked).toMatch(/#/);
    });
  });

  describe("maskMultiple", () => {
    it("should mask multiple values of the same type", () => {
      const emails = ["user1@example.com", "user2@test.com"];
      const results = maskMultiple(emails, PIIType.Email);

      expect(results).toHaveLength(2);
      expect(results[0].metadata?.type).toBe(PIIType.Email);
      expect(results[1].metadata?.type).toBe(PIIType.Email);
    });

    it("should apply consistent options to all values", () => {
      const values = ["John Doe", "Jane Smith"];
      const results = maskMultiple(values, PIIType.Name, {
        preserveFirstLetter: true,
      });

      expect(results[0].masked).toMatch(/^J\*+ D\*+$/);
      expect(results[1].masked).toMatch(/^J\*+ S\*+$/);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in data", () => {
      const result = maskName("Jean-Claude Van Damme");
      expect(result.masked).toBeDefined();
    });

    it("should handle international characters", () => {
      const result = maskName("José María");
      expect(result.masked).toBeDefined();
    });

    it("should handle very short data", () => {
      const result = maskName("X");
      expect(result.masked).toBe("*");
    });

    it("should handle empty options", () => {
      const result = maskEmail("test@example.com", {});
      expect(result.masked).toBeDefined();
    });

    it("should preserve original length metadata", () => {
      const original = "john.doe@example.com";
      const result = maskEmail(original);
      expect(result.originalLength).toBe(original.length);
    });
  });

  describe("Security Considerations", () => {
    it("should not expose original data in metadata", () => {
      const result = maskEmail("secret@company.com");

      expect(JSON.stringify(result.metadata)).not.toContain("secret");
      expect(JSON.stringify(result.metadata)).not.toContain("company");
    });

    it("should handle sensitive data consistently", () => {
      const sensitiveEmail = "ceo@company.com";
      const result1 = maskEmail(sensitiveEmail);
      const result2 = maskEmail(sensitiveEmail);

      expect(result1.masked).toBe(result2.masked);
    });

    it("should not leak data through pattern matching", () => {
      const result = maskCreditCard("4111111111111111");

      expect(result.pattern).not.toContain("4111111111111111");
      expect(result.metadata).not.toContain("4111111111111111");
    });
  });
});
