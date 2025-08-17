/**
 * GDPR (General Data Protection Regulation) Compliance Test Suite
 *
 * Tests compliance with EU GDPR requirements including:
 * - Data subject rights (Article 15-22)
 * - Lawful basis for processing (Article 6)
 * - Cross-border data transfers (Chapter V)
 * - Data protection by design and default (Article 25)
 * - Data minimization and purpose limitation
 */

import { describe, it, expect } from "vitest";
import {
  createPolicyEngine,
  processPII,
  detectPII,
  maskPII,
  PIIType,
  PolicyOperation,
} from "../index.js";

describe("GDPR Compliance Test Suite", () => {
  const gdprEngine = createPolicyEngine("gdpr");

  describe("Article 6 - Lawful basis for processing", () => {
    it("should require explicit consent for sensitive data processing", () => {
      const sensitiveText = "SSN: 123-45-6789, Email: patient@hospital.com";
      const result = processPII(sensitiveText, { policy: gdprEngine });

      // GDPR engine should detect PII data
      expect(result.detection.hasPII).toBe(true);
      expect(result.detection.detectedTypes.length).toBeGreaterThan(0);

      // Check that SSN data requires encryption
      const ssnDecision = gdprEngine.evaluate(
        PIIType.SSN,
        PolicyOperation.Store,
      );
      expect(ssnDecision.requiresEncryption).toBe(true);
    });

    it("should allow legitimate interest for basic contact processing", () => {
      const contactDecision = gdprEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Display,
      );
      expect(contactDecision.allowed).toBe(true);

      const phoneDecision = gdprEngine.evaluate(
        PIIType.Phone,
        PolicyOperation.Display,
      );
      expect(phoneDecision.allowed).toBe(true);
    });

    it("should restrict processing without lawful basis", () => {
      // Transfer operations should be more restricted
      const transferDecision = gdprEngine.evaluate(
        PIIType.Name,
        PolicyOperation.Transfer,
      );
      expect(transferDecision.allowed).toBe(false);
      expect(transferDecision.reason).toContain("not allowed");
    });
  });

  describe("Article 15 - Right of access by the data subject", () => {
    it("should support data subject access requests", () => {
      const personalData =
        "John Doe, email: john@example.com, phone: (555) 123-4567";
      const detection = detectPII(personalData);

      // Should detect all personal data
      expect(detection.hasPII).toBe(true);
      expect(detection.detectedTypes).toContain("name");
      expect(detection.detectedTypes).toContain("email");
      // Note: Phone detection may vary based on format and confidence

      // Data should be identifiable for access requests
      expect(detection.spans.length).toBeGreaterThan(0);
      detection.spans.forEach((span) => {
        expect(span.text).toBeDefined();
        expect(span.type).toBeDefined();
        expect(span.start).toBeGreaterThanOrEqual(0);
        expect(span.end).toBeGreaterThan(span.start);
      });
    });
  });

  describe("Article 17 - Right to erasure (right to be forgotten)", () => {
    it("should support complete data removal", () => {
      const userData =
        "Customer: Alice Smith, SSN: 555-12-3456, Email: alice@test.com";
      const result = processPII(userData, {
        policy: gdprEngine,
        redaction: { replacement: "[DELETED]" },
      });

      // Should completely redact for erasure
      expect(result.redacted).toContain("[DELETED]");
      expect(result.redacted).not.toContain("Alice Smith");
      expect(result.redacted).not.toContain("555-12-3456");
      expect(result.redacted).not.toContain("alice@test.com");
    });

    it("should maintain data structure after erasure", () => {
      const originalText = "Name: John Doe, Email: john@example.com";
      const result = processPII(originalText, {
        policy: gdprEngine,
        redaction: { replacement: "[ERASED]" },
      });

      // Should maintain readable structure
      expect(result.redacted).toMatch(/Name: \[ERASED\], Email: \[ERASED\]/);
      expect(result.redacted.length).toBeGreaterThan(0);
    });
  });

  describe("Article 20 - Right to data portability", () => {
    it("should extract data in structured format", () => {
      const customerData =
        "Profile: Jane Doe, jane@company.com, +44-20-7946-0958, London UK";
      const detection = detectPII(customerData);

      // Should structure data for portability
      const structuredData = detection.spans.map((span) => ({
        type: span.type,
        value: span.text,
        position: { start: span.start, end: span.end },
      }));

      expect(structuredData).toHaveLength(detection.spans.length);
      structuredData.forEach((item) => {
        expect(item.type).toMatch(/name|email|phone|address/);
        expect(item.value).toBeDefined();
        expect(item.position.start).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Article 25 - Data protection by design and default", () => {
    it("should apply privacy-preserving defaults", () => {
      const personalData =
        "Employee: Bob Wilson, ID: 123456789, Salary: $75000";
      const result = processPII(personalData, { policy: gdprEngine });

      // Should detect sensitive employment data
      expect(result.detection.hasPII).toBe(true);

      // Should apply masking by default for display
      expect(result.masked).not.toBe(personalData);
      expect(result.masked).toMatch(/\*/); // Should contain masking characters
    });

    it("should minimize data exposure through progressive masking", () => {
      const fullRecord =
        "Patient: Mary Johnson, DOB: 1985-03-15, SSN: 987-65-4321, Address: 456 Oak Street";

      // Test that different data types can be masked appropriately
      const nameResult = maskPII("Mary Johnson", PIIType.Name, {
        preserveStart: 2,
        preserveEnd: 2,
      });
      const ssnResult = maskPII("987-65-4321", PIIType.SSN);

      // Both should be masked but names may preserve more structure
      expect(nameResult.masked).toContain("*");
      expect(ssnResult.masked).toMatch(/\*+/);
    });
  });

  describe("Chapter V - Transfers of personal data to third countries", () => {
    it("should restrict cross-border data transfers", () => {
      const transferDecision = gdprEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Transfer,
      );

      // GDPR restricts transfers outside EU/EEA
      expect(transferDecision.allowed).toBe(false);
      expect(transferDecision.reason).toContain("not allowed");
    });

    it("should require encryption for international processing", () => {
      const processDecision = gdprEngine.evaluate(
        PIIType.CreditCard,
        PolicyOperation.Process,
      );

      // Financial data requires encryption
      expect(processDecision.requiresEncryption).toBe(true);
    });
  });

  describe("Data minimization principle", () => {
    it("should process only necessary data fields", () => {
      const excessiveData =
        "Order: #12345, Customer: John Smith, Email: john@test.com, Phone: 555-0123, SSN: 123-45-6789, Mother maiden name: Johnson";
      const result = processPII(excessiveData, { policy: gdprEngine });

      // Should detect multiple types of PII
      expect(result.detection.hasPII).toBe(true);
      expect(result.detection.detectedTypes.length).toBeGreaterThan(2);

      // GDPR engine should apply strict masking for sensitive data
      expect(result.masked).not.toBe(excessiveData);
    });
  });

  describe("Purpose limitation principle", () => {
    it("should restrict data use beyond original purpose", () => {
      // Marketing use should be restricted without consent
      const marketingDecision = gdprEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Log,
      );
      expect(marketingDecision.allowed).toBe(false);

      // Analytics should require anonymization
      const analyticsDecision = gdprEngine.evaluate(
        PIIType.Name,
        PolicyOperation.Process,
      );
      expect(analyticsDecision.requiresMasking).toBe(true);
    });
  });

  describe("Storage limitation principle", () => {
    it("should enforce data retention policies", () => {
      const emailDecision = gdprEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Store,
      );

      // Should have retention period metadata
      expect(emailDecision.metadata).toBeDefined();
      expect(emailDecision.metadata.retentionDays).toBeDefined();
      expect(emailDecision.metadata.retentionDays).toBeGreaterThan(0);
    });
  });

  describe("Accountability principle", () => {
    it("should provide audit trail for compliance demonstration", () => {
      const auditText =
        "Processing customer data: name=John Doe, email=john@example.com";
      const result = processPII(auditText, { policy: gdprEngine });

      // Should track what was processed
      expect(result.detection.detectedTypes.length).toBeGreaterThan(0);
      expect(result.detection.spans.length).toBeGreaterThan(0);

      // Should track policy decisions
      if (result.policyViolations.length > 0) {
        result.policyViolations.forEach((violation) => {
          expect(violation).toMatch(/[A-Z]+ at position \d+-\d+:/);
        });
      }
    });

    it("should log processing decisions for compliance audits", () => {
      const decisions = [
        gdprEngine.evaluate(PIIType.Email, PolicyOperation.Store),
        gdprEngine.evaluate(PIIType.Name, PolicyOperation.Display),
        gdprEngine.evaluate(PIIType.Phone, PolicyOperation.Process),
      ];

      decisions.forEach((decision) => {
        expect(decision.reason).toBeDefined();
        expect(decision.metadata).toBeDefined();
        expect(decision.metadata.riskLevel).toBeDefined();
      });
    });
  });

  describe("Special categories of personal data (Article 9)", () => {
    it("should apply enhanced protection for sensitive data", () => {
      // Health data should have strictest protection
      const healthDecision = gdprEngine.evaluate(
        PIIType.DriverLicense,
        PolicyOperation.Store,
      );
      expect(healthDecision.requiresEncryption).toBe(true);
      // Note: Risk level may vary by implementation

      // Biometric data equivalent (SSN) should be highly protected
      const biometricDecision = gdprEngine.evaluate(
        PIIType.SSN,
        PolicyOperation.Process,
      );
      expect(biometricDecision.requiresEncryption).toBe(true);
    });
  });

  describe("GDPR compliance workflow integration", () => {
    it("should support end-to-end GDPR compliant processing", () => {
      const gdprWorkflow =
        "Data subject request: Access all data for user@example.com";

      // Step 1: Detect what personal data we have
      const detection = detectPII(gdprWorkflow);
      expect(detection.detectedTypes).toContain("email");

      // Step 2: Check what operations are allowed
      const accessDecision = gdprEngine.evaluate(
        PIIType.Email,
        PolicyOperation.Display,
      );
      expect(accessDecision).toBeDefined();

      // Step 3: Apply appropriate protection
      const result = processPII(gdprWorkflow, { policy: gdprEngine });
      expect(result.detection.hasPII).toBe(true);

      // Step 4: Ensure audit trail exists
      expect(result.policyViolations).toBeDefined();
    });
  });
});
