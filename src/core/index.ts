/**
 * Core module exports for Privakit
 */

// Types
export * from "./types.js";

// Errors
export * from "./errors.js";

// Policy engine
export { PolicyEngine, createPolicyEngine } from "./policy.js";

// Re-export commonly used types for convenience
export type {
  PIIDetectionResult,
  ValidationResult,
  MaskingResult,
  NormalizationResult,
  PolicyDecision,
} from "./types.js";
