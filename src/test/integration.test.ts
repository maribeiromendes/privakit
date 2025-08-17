/**
 * Integration tests for Privakit library
 */

import { describe, it, expect } from "vitest";
import {
  processPII,
  createPIIProcessor,
  processEmail,
  processPhone,
  processName,
  detectPII,
  maskPII,
  redactText,
  createPolicyEngine,
} from "../index.js";
import { PIIType, PolicyOperation } from "../core/types.js";

describe("Integration Tests", () => {
  describe("processPII", () => {
    it("should provide complete PII processing pipeline", () => {
      const text =
        "Contact John Doe at john.doe@company.com or call (555) 123-4567. SSN: 555-55-5555";

      const result = processPII(text);

      expect(result.detection).toBeDefined();
      expect(result.detection.hasPII).toBe(true);
      expect(result.masked).toBeDefined();
      expect(result.redacted).toBeDefined();
      expect(result.policyViolations).toBeDefined();

      // Should detect multiple PII types
      expect(result.detection.detectedTypes.length).toBeGreaterThan(1);

      // Masked version should preserve readability
      expect(result.masked).toContain("Contact");
      expect(result.masked).not.toContain("john.doe@company.com");

      // Redacted version should remove PII completely
      expect(result.redacted).toContain("Contact");
      expect(result.redacted).not.toContain("123-45-6789");
    });

    it("should handle text without PII", () => {
      const text = "This is just regular text with no sensitive information.";

      const result = processPII(text);

      expect(result.detection.hasPII).toBe(false);
      expect(result.masked).toBe(text);
      expect(result.redacted).toBe(text);
      expect(result.policyViolations).toHaveLength(0);
    });

    it("should respect policy engine rules", () => {
      const text = "SSN: 555-55-5555";
      const policyEngine = createPolicyEngine("strict");

      const result = processPII(text, {
        policy: policyEngine,
      });

      expect(result.policyViolations.length).toBeGreaterThan(0);
      expect(result.policyViolations[0]).toContain("SSN");
    });

    it("should handle custom processing options", () => {
      const text = "Email: user@example.com";

      const result = processPII(text, {
        masking: { preserveLength: true },
        redaction: { replacement: "[HIDDEN]" },
      });

      expect(result.masked.length).toBe(text.length);
      expect(result.redacted).toContain("[HIDDEN]");
    });
  });

  describe("createPIIProcessor", () => {
    it("should create a configured processor", () => {
      const processor = createPIIProcessor({
        strictMode: true,
        detectionOptions: { confidenceThreshold: 0.8 },
        maskingOptions: { maskChar: "#" },
      });

      const text = "Contact: user@example.com";

      const detection = processor.detect(text);
      const masked = processor.mask(text);
      const redacted = processor.redact(text);
      const processed = processor.process(text);

      expect(detection.hasPII).toBe(true);
      expect(masked.redacted).toContain("#");
      expect(redacted.redacted).toContain("[REDACTED]");
      expect(processed.detection).toBeDefined();
    });

    it("should validate compliance", () => {
      const processor = createPIIProcessor({ strictMode: true });

      const compliance = processor.validateCompliance(PIIType.SSN, [
        PolicyOperation.Store,
        PolicyOperation.Log,
      ]);

      expect(compliance.isCompliant).toBeDefined();
      expect(compliance.violations).toBeDefined();
    });

    it("should handle permissive mode", () => {
      const processor = createPIIProcessor({ strictMode: false });

      const compliance = processor.validateCompliance(PIIType.ZipCode, [
        PolicyOperation.Display,
        PolicyOperation.Log,
      ]);

      expect(compliance.violations.length).toBe(0);
    });
  });

  describe("Individual Data Type Processing", () => {
    describe("processEmail", () => {
      it("should validate and normalize emails", () => {
        const result = processEmail("USER@EXAMPLE.COM");

        expect(result.validation.isValid).toBe(true);
        expect(result.normalized?.normalized).toBe("user@example.com");
      });

      it("should handle invalid emails", () => {
        const result = processEmail("invalid-email");

        expect(result.validation.isValid).toBe(false);
        expect(result.normalized).toBe(null);
      });

      it("should apply custom options", () => {
        const result = processEmail("test@example.com", {
          validation: { allowDisplayName: false },
          normalization: { lowercase: true },
        });

        expect(result.validation.isValid).toBe(true);
        expect(result.normalized?.normalized).toBe("test@example.com");
      });
    });

    describe("processPhone", () => {
      it("should validate and normalize phone numbers", () => {
        const result = processPhone("(555) 123-4567");

        expect(result.validation.isValid).toBe(true);
        expect(result.normalized?.normalized).toMatch(/^\+1/);
      });

      it("should handle invalid phone numbers", () => {
        const result = processPhone("invalid-phone");

        expect(result.validation.isValid).toBe(false);
        expect(result.normalized).toBe(null);
      });

      it("should handle international numbers", () => {
        const result = processPhone("+44 20 7946 0958");

        expect(result.validation.isValid).toBe(true);
        expect(result.normalized?.normalized).toMatch(/^\+44/);
      });
    });

    describe("processName", () => {
      it("should validate and normalize names", () => {
        const result = processName("john doe");

        expect(result.validation.isValid).toBe(true);
        expect(result.normalized?.normalized).toBe("John Doe");
      });

      it("should handle invalid names", () => {
        const result = processName("123invalid");

        expect(result.validation.isValid).toBe(false);
        expect(result.normalized).toBe(null);
      });

      it("should handle complex names", () => {
        const result = processName("jean-claude van damme");

        expect(result.validation.isValid).toBe(true);
        expect(result.normalized?.normalized).toMatch(/Jean-Claude/);
      });
    });
  });

  describe("Cross-Module Integration", () => {
    it("should work seamlessly between detection and masking", () => {
      const text = "Contact info: john@example.com, phone: 555-1234";

      const detection = detectPII(text);
      expect(detection.hasPII).toBe(true);

      // Use detection results for targeted masking
      const emailSpans = detection.spans.filter(
        (span) => span.type === PIIType.Email,
      );
      expect(emailSpans.length).toBeGreaterThan(0);

      const maskedEmail = maskPII(emailSpans[0].text, PIIType.Email);
      expect(maskedEmail.masked).not.toBe(emailSpans[0].text);
    });

    it("should work between detection and redaction", () => {
      const text = "Sensitive data: SSN 555-55-5555, Card 4111111111111111";

      const detection = detectPII(text);
      const redacted = redactText(text);

      expect(detection.hasPII).toBe(true);
      expect(redacted.redactionCount).toBeGreaterThan(0);
      expect(redacted.redacted).not.toContain("123-45-6789");
      expect(redacted.redacted).not.toContain("4111111111111111");
    });

    it("should integrate validation with policy engine", () => {
      const policyEngine = createPolicyEngine("strict");

      // Check if email logging is allowed
      const emailDecision = policyEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Log,
      );
      expect(emailDecision.allowed).toBe(false);

      // Check if ZIP code display is allowed
      const zipDecision = policyEngine.evaluate(
        PIIType.ZipCode,
        PolicyOperation.Display,
      );
      expect(zipDecision.allowed).toBe(true);
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle customer service chat logs", () => {
      const chatLog = `
        Agent: Hello! How can I help you today?
        Customer: Hi, I need to update my account. My email is john.doe@gmail.com
        Agent: I can help with that. Can you provide your phone number for verification?
        Customer: Sure, it's (555) 123-4567
        Agent: Thank you. I also need the last 4 digits of your SSN
        Customer: It's 6789
      `;

      const result = processPII(chatLog);

      expect(result.detection.hasPII).toBe(true);
      expect(result.detection.detectedTypes).toContain(PIIType.Email);
      expect(result.detection.detectedTypes).toContain(PIIType.Phone);

      // Redacted version should be safe for logging
      expect(result.redacted).toContain("Agent:");
      expect(result.redacted).toContain("Customer:");
      expect(result.redacted).not.toContain("john.doe@gmail.com");
      expect(result.redacted).not.toContain("(555) 123-4567");
    });

    it("should handle application error logs", () => {
      const errorLog = `
        [ERROR] Authentication failed for user john@company.com
        [DEBUG] Request from IP 192.168.1.100
        [ERROR] Database connection failed: Connection string contains password
        [INFO] Processing payment for card ending in 1111
      `;

      const redacted = redactText(errorLog);

      expect(redacted.redactionCount).toBeGreaterThan(0);
      expect(redacted.redacted).not.toContain("john@company.com");
      expect(redacted.redacted).not.toContain("192.168.1.100");
      expect(redacted.redacted).toContain("[ERROR]");
      expect(redacted.redacted).toContain("[DEBUG]");
    });

    it("should handle form validation workflow", () => {
      const formData = {
        email: "USER@EXAMPLE.COM",
        phone: "(555) 123-4567",
        name: "john doe",
        address: "123 main street, anytown, st 12345",
      };

      // Validate each field
      const emailResult = processEmail(formData.email);
      const phoneResult = processPhone(formData.phone);
      const nameResult = processName(formData.name);

      expect(emailResult.validation.isValid).toBe(true);
      expect(phoneResult.validation.isValid).toBe(true);
      expect(nameResult.validation.isValid).toBe(true);

      // Normalized data ready for storage
      expect(emailResult.normalized?.normalized).toBe("user@example.com");
      expect(phoneResult.normalized?.normalized).toMatch(/^\+1/);
      expect(nameResult.normalized?.normalized).toBe("John Doe");
    });

    it("should handle GDPR compliance scenario", () => {
      const gdprEngine = createPolicyEngine("gdpr");
      const text =
        "Customer data: name=John Doe, email=john@example.com, address=123 Main St";

      const result = processPII(text, { policy: gdprEngine });

      // GDPR requires strict handling
      expect(result.policyViolations.length).toBeGreaterThan(0);

      // Check specific GDPR requirements
      const emailDecision = gdprEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Store,
      );
      expect(emailDecision.requiresEncryption).toBe(true);

      const nameDecision = gdprEngine.evaluate(
        PIIType.Name,
        PolicyOperation.Transfer,
      );
      expect(nameDecision.allowed).toBeDefined();
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle batch processing efficiently", () => {
      const texts = Array(100)
        .fill(0)
        .map(
          (_, i) =>
            `User ${i}: Contact user${i}@example.com or call 555-${i.toString().padStart(4, "0")}`,
        );

      const start = Date.now();
      const processor = createPIIProcessor();

      const results = texts.map((text) => processor.process(text));
      const duration = Date.now() - start;

      expect(results).toHaveLength(100);
      expect(results.every((r) => r.detection.hasPII)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should handle complex documents", () => {
      const document = `
        CONFIDENTIAL CUSTOMER RECORD
        
        Personal Information:
        - Name: John Michael Doe
        - Email: john.doe@company.com
        - Phone: +1 (555) 123-4567
        - SSN: 123-45-6789
        - Address: 123 Main Street, Apartment 4B, Anytown, ST 12345-6789
        
        Financial Information:
        - Credit Card: 4111-1111-1111-1111
        - Bank Account: 123456789
        - Income: $75,000
        
        System Information:
        - IP Address: 192.168.1.100
        - Session ID: abc123def456
        - Last Login: 2023-10-15 14:30:00
      `.repeat(10); // Simulate larger document

      const start = Date.now();
      const result = processPII(document);
      const duration = Date.now() - start;

      expect(result.detection.hasPII).toBe(true);
      expect(result.detection.spans.length).toBeGreaterThan(20);
      expect(duration).toBeLessThan(2000); // Should handle large docs efficiently
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should gracefully handle malformed input", () => {
      const malformedInputs = [
        "", // empty
        " ".repeat(100), // whitespace only
        "äöü@münchen.de", // international characters
        "test@domain.toolongtobevalid".repeat(10), // very long
        "user@domain..com", // malformed email
        null as any, // null
        undefined as any, // undefined
      ];

      malformedInputs.forEach((input) => {
        if (input === null || input === undefined) {
          expect(() => processPII(input)).toThrow();
        } else {
          const result = processPII(input);
          expect(result).toBeDefined();
          expect(result.detection).toBeDefined();
        }
      });
    });

    it("should handle mixed valid and invalid data", () => {
      const text =
        "Valid email: user@example.com, Invalid: @invalid, Phone: 555-1234, Invalid phone: abc";

      const result = processPII(text);

      expect(result.detection.hasPII).toBe(true);
      expect(result.detection.spans.length).toBeGreaterThan(0);

      // Should detect valid PII and ignore invalid
      const validSpans = result.detection.spans.filter(
        (span) => span.text === "user@example.com" || span.text === "555-1234",
      );
      expect(validSpans.length).toBeGreaterThan(0);
    });

    it("should provide meaningful error messages", () => {
      try {
        maskPII("", PIIType.Email);
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid");
        expect(error.code).toBeDefined();
      }
    });
  });
});
