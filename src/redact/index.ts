/**
 * Redaction module for safe logging and hard removal of PII
 */

import type { DetectionSpan, PIIDetectionResult } from "../core/types.js";
import { PIIType } from "../core/types.js";
import { PIIMaskingError, ErrorCodes } from "../core/errors.js";

export interface RedactionOptions {
  replacement?: string;
  preserveLength?: boolean;
  preserveFormat?: boolean;
  redactionMarker?: string;
  includeType?: boolean;
  includeSpanInfo?: boolean;
  strictMode?: boolean;
  customPatterns?: RedactionPattern[];
  maskChar?: string;
}

export interface RedactionPattern {
  name: string;
  regex: RegExp;
  replacement: string;
  type?: PIIType;
  description?: string;
}

export interface RedactionResult {
  redacted: string;
  redactionCount: number;
  redactedSpans: RedactedSpan[];
  originalLength: number;
  redactedLength: number;
  metadata?: Record<string, unknown>;
}

export interface RedactedSpan {
  type: PIIType;
  start: number;
  end: number;
  originalText: string;
  redactedText: string;
  replacementType: "marker" | "placeholder" | "removal";
}

// Common PII patterns for redaction
const DEFAULT_REDACTION_PATTERNS: RedactionPattern[] = [
  {
    name: "email",
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL]",
    type: PIIType.Email,
    description: "Email addresses",
  },
  {
    name: "phone-us",
    regex:
      /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    replacement: "[PHONE]",
    type: PIIType.Phone,
    description: "US phone numbers",
  },
  {
    name: "phone-international",
    regex: /\+(?:[0-9] ?){6,14}[0-9]/g,
    replacement: "[PHONE]",
    type: PIIType.Phone,
    description: "International phone numbers",
  },
  {
    name: "ssn",
    regex: /\b(?:\d{3}-?\d{2}-?\d{4})\b/g,
    replacement: "[SSN]",
    type: PIIType.SSN,
    description: "Social Security Numbers",
  },
  {
    name: "credit-card",
    regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: "[CREDIT_CARD]",
    type: PIIType.CreditCard,
    description: "Credit card numbers",
  },
  {
    name: "ip-address",
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: "[IP_ADDRESS]",
    type: PIIType.IPAddress,
    description: "IP addresses",
  },
  {
    name: "url",
    regex:
      /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/g,
    replacement: "[URL]",
    type: PIIType.URL,
    description: "URLs",
  },
];

/**
 * Redacts PII from text using pattern matching
 */
export function redactText(
  text: string,
  options: RedactionOptions = {},
): RedactionResult {
  if (!text || typeof text !== "string") {
    return {
      redacted: text || "",
      redactionCount: 0,
      redactedSpans: [],
      originalLength: text?.length || 0,
      redactedLength: text?.length || 0,
    };
  }

  const replacement = options.replacement || "[REDACTED]";
  const redactionMarker = options.redactionMarker || "[REDACTED]";
  let redacted = text;
  const redactedSpans: RedactedSpan[] = [];
  let redactionCount = 0;

  // Combine default patterns with custom patterns
  const patterns = [...DEFAULT_REDACTION_PATTERNS];
  if (options.customPatterns) {
    patterns.push(...options.customPatterns);
  }

  // Apply each pattern
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;

    while ((match = regex.exec(redacted)) !== null) {
      const originalText = match[0];
      let redactedText: string;

      if (options.includeType && pattern.type) {
        redactedText = `[${pattern.type.toUpperCase()}]`;
      } else if (options.preserveLength) {
        redactedText = "*".repeat(originalText.length);
      } else if (options.preserveFormat) {
        redactedText = preserveFormatRedaction(originalText);
      } else {
        redactedText = pattern.replacement || replacement;
      }

      // Record the redaction
      redactedSpans.push({
        type: pattern.type || PIIType.Address, // Default fallback
        start: match.index,
        end: match.index + originalText.length,
        originalText,
        redactedText,
        replacementType: options.preserveLength ? "placeholder" : "marker",
      });

      // Replace in the text
      redacted =
        redacted.substring(0, match.index) +
        redactedText +
        redacted.substring(match.index + originalText.length);

      redactionCount++;

      // Reset regex lastIndex to account for text changes
      regex.lastIndex = match.index + redactedText.length;
    }
  }

  return {
    redacted,
    redactionCount,
    redactedSpans,
    originalLength: text.length,
    redactedLength: redacted.length,
    metadata: {
      patterns: patterns.length,
      preserveLength: options.preserveLength || false,
      preserveFormat: options.preserveFormat || false,
      strictMode: options.strictMode || false,
    },
  };
}

/**
 * Redacts PII based on detection results
 */
export function redactFromDetection(
  text: string,
  detection: PIIDetectionResult,
  options: RedactionOptions = {},
): RedactionResult {
  if (!text || !detection.spans || detection.spans.length === 0) {
    return {
      redacted: text || "",
      redactionCount: 0,
      redactedSpans: [],
      originalLength: text?.length || 0,
      redactedLength: text?.length || 0,
    };
  }

  const replacement = options.replacement || "[REDACTED]";
  let redacted = text;
  const redactedSpans: RedactedSpan[] = [];
  let offsetAdjustment = 0;

  // Sort spans by start position (descending) to maintain correct indices
  const sortedSpans = [...detection.spans].sort((a, b) => b.start - a.start);

  for (const span of sortedSpans) {
    const originalText = span.text;
    let redactedText: string;

    if (options.includeType) {
      redactedText = `[${span.type.toUpperCase()}]`;
    } else if (options.preserveLength) {
      const maskChar = options.maskChar || "*";
      redactedText = maskChar.repeat(originalText.length);
    } else if (options.preserveFormat) {
      redactedText = preserveFormatRedaction(originalText);
    } else {
      redactedText = replacement;
    }

    // Apply redaction
    const startPos = span.start;
    const endPos = span.end;

    redacted =
      redacted.substring(0, startPos) +
      redactedText +
      redacted.substring(endPos);

    redactedSpans.push({
      type: span.type,
      start: startPos,
      end: endPos,
      originalText,
      redactedText,
      replacementType: options.preserveLength ? "placeholder" : "marker",
    });
  }

  return {
    redacted,
    redactionCount: sortedSpans.length,
    redactedSpans: redactedSpans.reverse(), // Restore original order
    originalLength: text.length,
    redactedLength: redacted.length,
    metadata: {
      detectionBased: true,
      confidenceThreshold: detection.confidence,
      originalSpanCount: detection.spans.length,
    },
  };
}

/**
 * Creates a safe logger that automatically redacts PII
 */
export function createSafeLogger(options: RedactionOptions = {}) {
  const redactionOpts = {
    ...options,
    strictMode: true, // Always use strict mode for logging
  };

  return {
    log: (message: string, ...args: any[]) => {
      const redactedMessage = redactText(message, redactionOpts).redacted;
      const redactedArgs = args.map((arg) =>
        typeof arg === "string" ? redactText(arg, redactionOpts).redacted : arg,
      );
      console.log(redactedMessage, ...redactedArgs);
    },

    error: (message: string, ...args: any[]) => {
      const redactedMessage = redactText(message, redactionOpts).redacted;
      const redactedArgs = args.map((arg) =>
        typeof arg === "string" ? redactText(arg, redactionOpts).redacted : arg,
      );
      console.error(redactedMessage, ...redactedArgs);
    },

    warn: (message: string, ...args: any[]) => {
      const redactedMessage = redactText(message, redactionOpts).redacted;
      const redactedArgs = args.map((arg) =>
        typeof arg === "string" ? redactText(arg, redactionOpts).redacted : arg,
      );
      console.warn(redactedMessage, ...redactedArgs);
    },

    info: (message: string, ...args: any[]) => {
      const redactedMessage = redactText(message, redactionOpts).redacted;
      const redactedArgs = args.map((arg) =>
        typeof arg === "string" ? redactText(arg, redactionOpts).redacted : arg,
      );
      console.info(redactedMessage, ...redactedArgs);
    },

    debug: (message: string, ...args: any[]) => {
      const redactedMessage = redactText(message, redactionOpts).redacted;
      const redactedArgs = args.map((arg) =>
        typeof arg === "string" ? redactText(arg, redactionOpts).redacted : arg,
      );
      console.debug(redactedMessage, ...redactedArgs);
    },
  };
}

/**
 * Middleware for Express.js to redact PII from error logs
 */
export function createRedactionMiddleware(options: RedactionOptions = {}) {
  return (error: Error, req: any, res: any, next: any) => {
    // Redact PII from error message and stack
    const redactedError = {
      ...error,
      message: redactText(error.message, options).redacted,
      stack: error.stack
        ? redactText(error.stack, options).redacted
        : undefined,
    };

    // Redact PII from request data if present
    const redactedReq = {
      ...req,
      body: redactObject(req.body, options),
      query: redactObject(req.query, options),
      params: redactObject(req.params, options),
    };

    // Log the redacted error
    console.error("Redacted error:", redactedError, "Request:", {
      method: redactedReq.method,
      url: redactText(redactedReq.url || "", options).redacted,
      body: redactedReq.body,
      query: redactedReq.query,
      params: redactedReq.params,
    });

    next(error);
  };
}

/**
 * Redacts PII from object properties
 */
export function redactObject(
  obj: Record<string, any>,
  options: RedactionOptions = {},
): Record<string, any> {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const redacted: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      redacted[key] = redactText(value, options).redacted;
    } else if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        redacted[key] = value.map((item) =>
          typeof item === "string"
            ? redactText(item, options).redacted
            : typeof item === "object"
              ? redactObject(item, options)
              : item,
        );
      } else {
        redacted[key] = redactObject(value, options);
      }
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Creates a redaction summary for audit purposes
 */
export function createRedactionSummary(result: RedactionResult): string {
  const summary = [
    `Redaction Summary:`,
    `- Original length: ${result.originalLength} characters`,
    `- Redacted length: ${result.redactedLength} characters`,
    `- Redactions made: ${result.redactionCount}`,
    `- Redacted spans:`,
  ];

  for (const span of result.redactedSpans) {
    summary.push(
      `  * ${span.type} at ${span.start}-${span.end}: "${span.originalText}" → "${span.redactedText}"`,
    );
  }

  return summary.join("\n");
}

/**
 * Batch redaction for multiple texts
 */
export function redactMultiple(
  texts: string[],
  options: RedactionOptions = {},
): RedactionResult[] {
  return texts.map((text) => redactText(text, options));
}

/**
 * Validates that text is properly redacted
 */
export function validateRedaction(
  text: string,
  allowedPatterns: RegExp[] = [],
): { isRedacted: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check against default patterns
  for (const pattern of DEFAULT_REDACTION_PATTERNS) {
    const matches = text.match(pattern.regex);
    if (matches) {
      // Check if matches are in allowed patterns
      const isAllowed = allowedPatterns.some((allowed) =>
        matches.every((match) => allowed.test(match)),
      );

      if (!isAllowed) {
        violations.push(
          `Found unredacted ${pattern.description}: ${matches.join(", ")}`,
        );
      }
    }
  }

  return {
    isRedacted: violations.length === 0,
    violations,
  };
}

// Helper functions

/**
 * Preserves format while redacting (e.g., email becomes ***@***.*** )
 */
function preserveFormatRedaction(text: string): string {
  // Email format preservation
  if (text.includes("@") && text.includes(".")) {
    const [local, domain] = text.split("@");
    const [domainName, ...tlds] = domain.split(".");
    return (
      "*".repeat(local.length) +
      "@" +
      "*".repeat(domainName.length) +
      "." +
      tlds.join(".")
    );
  }

  // Phone format preservation
  if (/^\+?[\d\s\-\(\)\.]+$/.test(text)) {
    return text.replace(/\d/g, "*");
  }

  // Credit card format preservation
  if (/^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/.test(text)) {
    return text.replace(/\d/g, "*");
  }

  // Default: replace alphanumeric with *
  return text.replace(/[a-zA-Z0-9]/g, "*");
}

/**
 * Default redaction patterns
 */
export const getDefaultRedactionPatterns = (): RedactionPattern[] => {
  return [...DEFAULT_REDACTION_PATTERNS];
};

/**
 * Adds custom redaction pattern
 */
export function addRedactionPattern(pattern: RedactionPattern): void {
  DEFAULT_REDACTION_PATTERNS.push(pattern);
}

/**
 * Removes redaction pattern by name
 */
export function removeRedactionPattern(name: string): boolean {
  const index = DEFAULT_REDACTION_PATTERNS.findIndex((p) => p.name === name);
  if (index >= 0) {
    DEFAULT_REDACTION_PATTERNS.splice(index, 1);
    return true;
  }
  return false;
}
