/**
 * Policy engine for PII handling rules and compliance
 */

import { 
  PIIType, 
  RiskLevel, 
  PolicyRule, 
  PolicyOperation, 
  PolicyDecision, 
  PolicyEngine as IPolicyEngine 
} from './types.js';
import { PIIPolicyError, ErrorCodes } from './errors.js';

// Default policy rules based on common compliance requirements
const DEFAULT_RULES: PolicyRule[] = [
  // Critical PII - strictest rules
  {
    type: PIIType.SSN,
    riskLevel: RiskLevel.Critical,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: true,
    retentionDays: 365,
    allowedOperations: [PolicyOperation.Store, PolicyOperation.Process]
  },
  {
    type: PIIType.CreditCard,
    riskLevel: RiskLevel.Critical,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: true,
    retentionDays: 90,
    allowedOperations: [PolicyOperation.Process]
  },
  
  // High risk PII
  {
    type: PIIType.DateOfBirth,
    riskLevel: RiskLevel.High,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: true,
    retentionDays: 1095, // 3 years
    allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display]
  },
  {
    type: PIIType.Address,
    riskLevel: RiskLevel.High,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: false,
    retentionDays: 1095,
    allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display, PolicyOperation.Export]
  },
  
  // Moderate risk PII
  {
    type: PIIType.Email,
    riskLevel: RiskLevel.Moderate,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: false,
    retentionDays: 2555, // 7 years
    allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display, PolicyOperation.Transfer, PolicyOperation.Export]
  },
  {
    type: PIIType.Phone,
    riskLevel: RiskLevel.Moderate,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: false,
    retentionDays: 2555,
    allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display, PolicyOperation.Transfer, PolicyOperation.Export]
  },
  {
    type: PIIType.Name,
    riskLevel: RiskLevel.Moderate,
    allowLogging: false,
    requireMasking: true,
    requireEncryption: false,
    retentionDays: 2555,
    allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display, PolicyOperation.Transfer, PolicyOperation.Export]
  },
  
  // Low risk PII
  {
    type: PIIType.ZipCode,
    riskLevel: RiskLevel.Low,
    allowLogging: true,
    requireMasking: false,
    requireEncryption: false,
    retentionDays: 3650, // 10 years
    allowedOperations: Object.values(PolicyOperation)
  },
  {
    type: PIIType.IPAddress,
    riskLevel: RiskLevel.Low,
    allowLogging: true,
    requireMasking: false,
    requireEncryption: false,
    retentionDays: 365,
    allowedOperations: [PolicyOperation.Log, PolicyOperation.Process, PolicyOperation.Display]
  }
];

export class PolicyEngine implements IPolicyEngine {
  private rules: Map<PIIType, PolicyRule> = new Map();
  private strictMode: boolean = false;

  constructor(customRules?: PolicyRule[], strictMode: boolean = false) {
    this.strictMode = strictMode;
    
    // Load default rules
    DEFAULT_RULES.forEach(rule => {
      this.rules.set(rule.type, rule);
    });
    
    // Override with custom rules if provided
    if (customRules) {
      customRules.forEach(rule => {
        this.addRule(rule);
      });
    }
  }

  public evaluate(type: PIIType, operation: PolicyOperation): PolicyDecision {
    const rule = this.rules.get(type);
    
    if (!rule) {
      if (this.strictMode) {
        return {
          allowed: false,
          requiresMasking: true,
          requiresEncryption: true,
          reason: `No policy rule defined for PII type: ${type}`,
          metadata: { strictMode: true }
        };
      } else {
        // Default permissive behavior for unknown types
        return {
          allowed: true,
          requiresMasking: false,
          requiresEncryption: false,
          reason: `No specific rule found, using permissive default for ${type}`,
          metadata: { defaultRule: true }
        };
      }
    }

    const allowed = rule.allowedOperations.includes(operation);
    
    if (!allowed) {
      return {
        allowed: false,
        requiresMasking: rule.requireMasking,
        requiresEncryption: rule.requireEncryption,
        reason: `Operation '${operation}' not allowed for PII type '${type}' (risk level: ${rule.riskLevel})`,
        metadata: { 
          riskLevel: rule.riskLevel, 
          allowedOperations: rule.allowedOperations 
        }
      };
    }

    // Special handling for logging operations
    if (operation === PolicyOperation.Log && !rule.allowLogging) {
      return {
        allowed: false,
        requiresMasking: true,
        requiresEncryption: rule.requireEncryption,
        reason: `Logging not allowed for PII type '${type}' due to risk level: ${rule.riskLevel}`,
        metadata: { riskLevel: rule.riskLevel }
      };
    }

    return {
      allowed: true,
      requiresMasking: rule.requireMasking,
      requiresEncryption: rule.requireEncryption,
      reason: `Operation '${operation}' allowed for PII type '${type}'`,
      metadata: { 
        riskLevel: rule.riskLevel,
        retentionDays: rule.retentionDays
      }
    };
  }

  public addRule(rule: PolicyRule): void {
    this.validateRule(rule);
    this.rules.set(rule.type, rule);
  }

  public removeRule(type: PIIType): void {
    this.rules.delete(type);
  }

  public getRules(): PolicyRule[] {
    return Array.from(this.rules.values());
  }

  public getRuleForType(type: PIIType): PolicyRule | undefined {
    return this.rules.get(type);
  }

  public setStrictMode(enabled: boolean): void {
    this.strictMode = enabled;
  }

  public isStrictMode(): boolean {
    return this.strictMode;
  }

  // Helper methods for common policy checks
  public canLog(type: PIIType): boolean {
    const decision = this.evaluate(type, PolicyOperation.Log);
    return decision.allowed;
  }

  public canStore(type: PIIType): boolean {
    const decision = this.evaluate(type, PolicyOperation.Store);
    return decision.allowed;
  }

  public requiresMasking(type: PIIType, operation: PolicyOperation): boolean {
    const decision = this.evaluate(type, operation);
    return decision.requiresMasking;
  }

  public requiresEncryption(type: PIIType, operation: PolicyOperation): boolean {
    const decision = this.evaluate(type, operation);
    return decision.requiresEncryption;
  }

  public getRiskLevel(type: PIIType): RiskLevel | undefined {
    const rule = this.rules.get(type);
    return rule?.riskLevel;
  }

  public getRetentionDays(type: PIIType): number | undefined {
    const rule = this.rules.get(type);
    return rule?.retentionDays;
  }

  // Validation helpers
  private validateRule(rule: PolicyRule): void {
    if (!rule.type) {
      throw new PIIPolicyError(
        'Policy rule must specify a PII type',
        undefined,
        undefined,
        'Missing PII type',
        { rule }
      );
    }

    if (!Object.values(PIIType).includes(rule.type)) {
      throw new PIIPolicyError(
        `Invalid PII type: ${rule.type}`,
        rule.type,
        undefined,
        'Invalid PII type',
        { rule }
      );
    }

    if (!Object.values(RiskLevel).includes(rule.riskLevel)) {
      throw new PIIPolicyError(
        `Invalid risk level: ${rule.riskLevel}`,
        rule.type,
        undefined,
        'Invalid risk level',
        { rule }
      );
    }

    if (!Array.isArray(rule.allowedOperations) || rule.allowedOperations.length === 0) {
      throw new PIIPolicyError(
        'Policy rule must specify at least one allowed operation',
        rule.type,
        undefined,
        'Missing allowed operations',
        { rule }
      );
    }

    const invalidOperations = rule.allowedOperations.filter(
      op => !Object.values(PolicyOperation).includes(op)
    );

    if (invalidOperations.length > 0) {
      throw new PIIPolicyError(
        `Invalid operations: ${invalidOperations.join(', ')}`,
        rule.type,
        undefined,
        'Invalid operations',
        { rule, invalidOperations }
      );
    }

    if (rule.retentionDays !== undefined && rule.retentionDays < 0) {
      throw new PIIPolicyError(
        'Retention days cannot be negative',
        rule.type,
        undefined,
        'Invalid retention period',
        { rule }
      );
    }
  }
}

// Factory function for creating policy engines with common configurations
export function createPolicyEngine(config: 'strict' | 'permissive' | 'gdpr' | 'ccpa' = 'permissive'): PolicyEngine {
  switch (config) {
    case 'strict':
      return new PolicyEngine(undefined, true);
      
    case 'permissive':
      return new PolicyEngine(undefined, false);
      
    case 'gdpr':
      return createGDPRPolicyEngine();
      
    case 'ccpa':
      return createCCPAPolicyEngine();
      
    default:
      return new PolicyEngine();
  }
}

// GDPR-compliant policy engine
function createGDPRPolicyEngine(): PolicyEngine {
  const gdprRules: PolicyRule[] = [
    // Stricter rules for GDPR compliance
    {
      type: PIIType.Email,
      riskLevel: RiskLevel.High, // Elevated from Moderate
      allowLogging: false,
      requireMasking: true,
      requireEncryption: true, // Required for GDPR
      retentionDays: 1095, // 3 years max
      allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display]
    },
    {
      type: PIIType.Name,
      riskLevel: RiskLevel.High,
      allowLogging: false,
      requireMasking: true,
      requireEncryption: true,
      retentionDays: 1095,
      allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display]
    }
  ];
  
  return new PolicyEngine(gdprRules, true);
}

// CCPA-compliant policy engine
function createCCPAPolicyEngine(): PolicyEngine {
  const ccpaRules: PolicyRule[] = [
    // CCPA-specific rules with focus on consumer rights
    {
      type: PIIType.Email,
      riskLevel: RiskLevel.Moderate,
      allowLogging: false,
      requireMasking: true,
      requireEncryption: false,
      retentionDays: 1825, // 5 years
      allowedOperations: [PolicyOperation.Store, PolicyOperation.Process, PolicyOperation.Display, PolicyOperation.Export]
    }
  ];
  
  return new PolicyEngine(ccpaRules, false);
}