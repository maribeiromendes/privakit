# Policy Engine Module

The Policy Engine automates privacy compliance by enforcing data handling rules, making intelligent decisions about PII processing, and maintaining comprehensive audit trails. It implements GDPR, CCPA, and custom privacy policies with granular control and risk-based automation.

## ⚖️ Basic Policy Engine Concepts

### What is a Policy Engine?

```typescript
import { createPolicyEngine } from 'privakit';

// Create a GDPR-compliant policy engine
const gdprEngine = createPolicyEngine('gdpr');

// Evaluate if an operation is allowed
const decision = gdprEngine.evaluate('email', 'log');
console.log(decision.allowed);          // false (GDPR protects email in logs)
console.log(decision.requiresMasking);  // true
console.log(decision.reason);           // "Operation 'log' requires masking for type 'email'"

// Safe operation
const displayDecision = gdprEngine.evaluate('email', 'display');
console.log(displayDecision.allowed);   // true (with masking)
console.log(displayDecision.requiresMasking); // true
```

### Policy-Driven Automation

```typescript
// Automatic compliance without manual decisions
function processUserData(email: string, operation: string) {
  const policy = createPolicyEngine('gdpr');
  const decision = policy.evaluate('email', operation);
  
  if (!decision.allowed) {
    throw new Error(`Operation '${operation}' not permitted: ${decision.reason}`);
  }
  
  if (decision.requiresMasking) {
    return maskPII(email, 'email').masked;
  }
  
  if (decision.requiresEncryption) {
    return encryptData(email);
  }
  
  return email; // Operation allowed as-is
}

// Automatically compliant usage
console.log(processUserData('user@example.com', 'display')); // "u***@example.com"
console.log(processUserData('user@example.com', 'store'));   // Encrypted or throws error
```

## 🛡️ Built-in Policy Templates

### GDPR Policy Engine

```typescript
import { createPolicyEngine } from 'privakit';

const gdprEngine = createPolicyEngine('gdpr', {
  strictMode: true,           // Strict interpretation of GDPR
  dataMinimization: true,     // Apply data minimization principle
  auditRequired: true,        // Maintain audit trails
  encryptionRequired: true    // Require encryption for storage
});

// GDPR evaluation examples
const evaluations = [
  gdprEngine.evaluate('email', 'store'),     // Requires encryption + consent
  gdprEngine.evaluate('name', 'display'),    // Allowed with masking
  gdprEngine.evaluate('ip', 'analytics'),    // Requires anonymization
  gdprEngine.evaluate('phone', 'marketing') // Requires explicit consent
];

evaluations.forEach(decision => {
  console.log(`${decision.piiType} + ${decision.operation}:`);
  console.log(`  Allowed: ${decision.allowed}`);
  console.log(`  Requirements: ${decision.requirements.join(', ')}`);
  console.log(`  Legal basis: ${decision.legalBasis}`);
});
```

### CCPA Policy Engine

```typescript
// California Consumer Privacy Act compliance
const ccpaEngine = createPolicyEngine('ccpa', {
  saleOfPersonalInfo: false,    // Don't sell personal information
  thirdPartySharing: 'opt-in',  // Require opt-in for sharing
  rightToDelete: true,          // Support deletion requests
  rightToKnow: true            // Support information requests
});

// CCPA-specific evaluations
const decision = ccpaEngine.evaluate('email', 'share_with_partner');
console.log(decision.allowed);           // false (requires opt-in)
console.log(decision.requirements);      // ['explicit_opt_in', 'privacy_notice']
console.log(decision.consumerRights);    // ['right_to_opt_out', 'right_to_delete']
```

### HIPAA Policy Engine

```typescript
// Healthcare compliance
const hipaaEngine = createPolicyEngine('hipaa', {
  minimumNecessary: true,     // Apply minimum necessary standard
  authorizedPersonnel: true,  // Restrict to authorized personnel
  auditLogging: true,         // Comprehensive audit logging
  encryptionAtRest: true,     // Encrypt stored PHI
  encryptionInTransit: true   // Encrypt transmitted PHI
});

// Healthcare data evaluation
const phiDecision = hipaaEngine.evaluate('medical_record_number', 'access', {
  userRole: 'nurse',
  purpose: 'patient_care',
  patientConsent: true
});

console.log(phiDecision.allowed);        // true (authorized for patient care)
console.log(phiDecision.auditRequired);  // true (log all PHI access)
```

### PCI DSS Policy Engine

```typescript
// Payment card industry compliance
const pciEngine = createPolicyEngine('pci_dss', {
  dataRetentionLimit: '90_days',    // Limit card data retention
  cardNumberMasking: true,          // Mask PANs when displayed
  cvvProhibited: true,              // Never store CVV
  encryptionRequired: true          // Encrypt stored card data
});

// Payment data evaluation
const cardDecision = pciEngine.evaluate('credit_card', 'display');
console.log(cardDecision.allowed);           // true
console.log(cardDecision.requiresMasking);   // true (show only last 4)
console.log(cardDecision.maskingPattern);    // "****-****-****-1234"
```

### LGPD Policy Engine (Brazil)

```typescript
// Lei Geral de Proteção de Dados Pessoais (Brazil)
const lgpdEngine = createPolicyEngine('lgpd', {
  strictMode: true,               // Strict LGPD interpretation
  dataMinimization: true,         // Art. 6, IV - minimização
  consentRequired: true,          // Art. 7 - bases legais
  transparencyRequired: true,     // Art. 6, VI - transparência
  auditRequired: true,           // Art. 37 - relatório de impacto
  encryptionRequired: true,      // Art. 46 - segurança
  
  // Art. 6 - Princípios fundamentais
  principios: {
    adequacao: true,             // Adequação
    necessidade: true,           // Necessidade
    finalidade: true,            // Finalidade específica
    minimizacao: true,           // Minimização
    transparencia: true,         // Transparência
    seguranca: true,             // Segurança
    prevencao: true,             // Prevenção
    qualidade: true,             // Qualidade dos dados
    responsabilizacao: true      // Responsabilização
  },
  
  // Art. 7 - Bases legais para tratamento
  basesLegais: {
    consentimento: 'explicit',        // I - Consentimento explícito
    cumprimentoObrigacao: true,       // II - Cumprimento de obrigação legal
    execucaoContrato: true,           // V - Execução de contrato
    legitimo_interesse: 'restricted', // IX - Legítimo interesse (restrito)
    protecaoVida: true,              // IV - Proteção da vida
    exercicioCredito: true           // X - Proteção ao crédito
  },
  
  // Art. 18 - Direitos dos titulares
  titularRights: {
    confirmacao: true,          // I - Confirmação da existência
    acesso: true,              // II - Acesso aos dados
    correcao: true,            // III - Correção de dados
    anonimizacao: true,        // IV - Anonimização
    portabilidade: true,       // V - Portabilidade
    eliminacao: true,          // VI - Eliminação
    informacoes: true,         // VII - Informações sobre compartilhamento
    revogacao: true,           // VIII - Revogação do consentimento
    oposicao: true             // IX - Oposição ao tratamento
  }
});

// LGPD evaluation examples
const cpfDecision = lgpdEngine.evaluate('cpf', 'store', {
  baseLegal: 'cumprimento_obrigacao',
  finalidade: 'identificacao_fiscal'
});

console.log(cpfDecision.allowed);           // true (legal obligation)
console.log(cpfDecision.baseLegal);         // "cumprimento_obrigacao"
console.log(cpfDecision.titularRights);     // Available rights for this data

const emailMarketing = lgpdEngine.evaluate('email', 'marketing', {
  baseLegal: 'consentimento',
  consentGiven: false
});

console.log(emailMarketing.allowed);        // false (no consent)
console.log(emailMarketing.requirements);   // ['explicit_consent', 'opt_in_mechanism']
```

### LGPD Data Subject Rights Implementation

```typescript
// Implementação dos direitos dos titulares (Art. 18)
class LGPDTitularRights {
  constructor(private policyEngine: PolicyEngine) {}
  
  // Art. 18, I - Confirmação da existência de tratamento
  async confirmacaoExistencia(titularId: string, cpf: string) {
    const decision = this.policyEngine.evaluate('personal_data', 'confirmation', {
      titularId,
      cpf: maskPII(cpf, 'cpf').masked,
      rightType: 'confirmacao'
    });
    
    if (decision.allowed) {
      return {
        exists: await this.checkDataExists(titularId),
        finalidades: await this.getProcessingPurposes(titularId),
        basesLegais: await this.getLegalBases(titularId),
        compartilhamentos: await this.getSharingInfo(titularId),
        prazoRetencao: await this.getRetentionPeriod(titularId)
      };
    }
    
    throw new Error('Confirmação não permitida: ' + decision.reason);
  }
  
  // Art. 18, II - Acesso aos dados pessoais
  async acessoDados(titularId: string, requestContext: any) {
    const decision = this.policyEngine.evaluate('personal_data', 'access', {
      titularId,
      rightType: 'acesso',
      ...requestContext
    });
    
    if (!decision.allowed) {
      throw new Error('Acesso negado: ' + decision.reason);
    }
    
    const dados = await this.getTitularData(titularId);
    
    // Aplicar mascaramento se necessário
    if (decision.requiresMasking) {
      return this.maskSensitiveFields(dados);
    }
    
    return {
      dadosPessoais: dados,
      finalidades: await this.getProcessingPurposes(titularId),
      basesLegais: await this.getLegalBases(titularId),
      compartilhamentos: await this.getSharingHistory(titularId),
      dataUltimaAtualizacao: await this.getLastUpdateDate(titularId)
    };
  }
  
  // Art. 18, V - Portabilidade dos dados
  async portabilidadeDados(titularId: string, formato: 'json' | 'xml' | 'csv') {
    const decision = this.policyEngine.evaluate('personal_data', 'portability', {
      titularId,
      rightType: 'portabilidade',
      formato
    });
    
    if (!decision.allowed) {
      throw new Error('Portabilidade não permitida: ' + decision.reason);
    }
    
    const dados = await this.getTitularData(titularId);
    const dadosPortaveis = this.filterPortableData(dados);
    
    return {
      formato,
      dados: this.formatForPortability(dadosPortaveis, formato),
      dataGeracao: new Date().toISOString(),
      hashIntegridade: this.generateIntegrityHash(dadosPortaveis)
    };
  }
  
  // Art. 18, VI - Eliminação dos dados pessoais
  async eliminacaoDados(titularId: string, justificativa?: string) {
    const decision = this.policyEngine.evaluate('personal_data', 'elimination', {
      titularId,
      rightType: 'eliminacao',
      justificativa
    });
    
    if (!decision.allowed) {
      throw new Error('Eliminação não permitida: ' + decision.reason);
    }
    
    // Verificar se há base legal que impede eliminação
    const basesLegais = await this.getActiveLegalBases(titularId);
    const temObrigacaoLegal = basesLegais.includes('cumprimento_obrigacao');
    
    if (temObrigacaoLegal) {
      // Não pode eliminar, mas pode anonimizar
      await this.anonymizeData(titularId);
      return {
        acao: 'anonimizacao',
        motivo: 'Dados mantidos por obrigação legal, mas anonimizados',
        dataExecucao: new Date().toISOString()
      };
    } else {
      await this.deleteData(titularId);
      return {
        acao: 'eliminacao',
        motivo: 'Dados eliminados conforme solicitação do titular',
        dataExecucao: new Date().toISOString()
      };
    }
  }
}
```

### LGPD Compliance Reporting

```typescript
// Gerar relatórios de conformidade para ANPD
function generateLGPDComplianceReport(startDate: Date, endDate: Date) {
  const auditData = lgpdEngine.getAuditReport({
    dateFrom: startDate,
    dateTo: endDate
  });
  
  return {
    tipoRelatorio: 'Relatório de Conformidade LGPD',
    periodo: { 
      inicio: startDate.toISOString(),
      fim: endDate.toISOString()
    },
    
    // Art. 6 - Verificação dos princípios
    principios: {
      adequacao: {
        conforme: checkAdequacaoCompliance(auditData),
        evidencias: getAdequacaoEvidences(auditData)
      },
      necessidade: {
        conforme: checkNecessidadeCompliance(auditData),
        avaliacaoMinimizacao: getMinimizationAssessment(auditData)
      },
      finalidade: {
        conforme: checkFinalidadeCompliance(auditData),
        finalidadesDeclaradas: getDeclaredPurposes(auditData),
        desviosFinalidade: getPurposeDeviations(auditData)
      },
      transparencia: {
        conforme: checkTransparenciaCompliance(auditData),
        avisosPrivacidade: getPrivacyNotices(auditData),
        comunicacoesTitulares: getTitularCommunications(auditData)
      },
      seguranca: {
        conforme: checkSegurancaCompliance(auditData),
        medidasTecnicas: getTechnicalMeasures(auditData),
        medidasOrganizacionais: getOrganizationalMeasures(auditData),
        incidentes: getSecurityIncidents(auditData)
      }
    },
    
    // Art. 7 - Análise das bases legais
    basesLegais: {
      consentimento: {
        total: getConsentBasedProcessing(auditData),
        validoExplicito: getValidExplicitConsent(auditData),
        revogacoes: getConsentRevocations(auditData)
      },
      cumprimentoObrigacao: {
        total: getLegalObligationProcessing(auditData),
        fundamentosLegais: getLegalFoundations(auditData)
      },
      execucaoContrato: {
        total: getContractBasedProcessing(auditData),
        tiposContratos: getContractTypes(auditData)
      },
      legitimo_interesse: {
        total: getLegitimateInterestProcessing(auditData),
        avaliacoesInteresse: getInterestAssessments(auditData),
        objecoes: getObjections(auditData)
      }
    },
    
    // Art. 18 - Exercício dos direitos dos titulares
    direitosTitulares: {
      estatisticas: {
        totalSolicitacoes: getTotalRequests(auditData),
        tempoMedioResposta: getAverageResponseTime(auditData),
        taxaAtendimento: getComplianceRate(auditData)
      },
      porTipoDireito: {
        confirmacao: getConfirmationRequests(auditData),
        acesso: getAccessRequests(auditData),
        correcao: getCorrectionRequests(auditData),
        anonimizacao: getAnonymizationRequests(auditData),
        portabilidade: getPortabilityRequests(auditData),
        eliminacao: getDeletionRequests(auditData),
        oposicao: getObjectionRequests(auditData)
      }
    },
    
    // Art. 48 - Comunicação de incidentes à ANPD
    incidentesSeguranca: {
      total: getSecurityIncidentsCount(auditData),
      comunicadosANPD: getANPDNotifications(auditData),
      prazosComunicacao: getNotificationTimelines(auditData),
      medidasCorretivasAdotadas: getCorrectiveMeasures(auditData)
    },
    
    // Art. 37 - Relatório de impacto à proteção de dados
    avaliacoesImpacto: {
      realizadas: getImpactAssessments(auditData),
      riscosIdentificados: getIdentifiedRisks(auditData),
      medidasMitigacao: getMitigationMeasures(auditData),
      monitoramentoRiscos: getRiskMonitoring(auditData)
    },
    
    // Pontuação geral de conformidade
    pontuacaoConformidade: calculateLGPDComplianceScore(auditData),
    statusConformidade: getLGPDComplianceStatus(auditData),
    
    // Recomendações para melhorias
    recomendacoes: generateLGPDRecommendations(auditData),
    
    // Próximas ações necessárias
    proximasAcoes: getNextActions(auditData),
    
    // Dados do controlador
    controlador: {
      nome: getControllerName(),
      cnpj: getControllerCNPJ(),
      encarregado: getDPOInfo(),
      contato: getContactInfo()
    }
  };
}
```

## 🎯 Custom Policy Creation

### Define Custom Policies

```typescript
import { PolicyEngine, PolicyRule } from 'privakit';

// Create custom company policy
const companyPolicy = new PolicyEngine('company_policy', {
  // Base policy settings
  strictMode: true,
  auditRequired: true
});

// Add custom rules
companyPolicy.addRule('employee_data', {
  piiTypes: ['email', 'phone', 'employee_id'],
  operations: {
    'hr_access': { allowed: true, requirements: ['hr_role'] },
    'manager_view': { allowed: true, requiresMasking: true },
    'peer_view': { allowed: false },
    'external_share': { allowed: false }
  },
  exceptions: [
    {
      condition: 'emergency_contact',
      override: { allowed: true, auditRequired: true }
    }
  ]
});

// Use custom policy
const decision = companyPolicy.evaluate('employee_id', 'manager_view', {
  userRole: 'manager',
  context: 'performance_review'
});
```

### Role-Based Policies

```typescript
// Define policies based on user roles
class RoleBasedPolicyEngine extends PolicyEngine {
  constructor() {
    super('role_based');
    this.setupRoles();
  }
  
  private setupRoles() {
    // Admin role - full access with audit
    this.addRole('admin', {
      permissions: ['read', 'write', 'delete', 'export'],
      piiAccess: 'full',
      auditLevel: 'comprehensive',
      maskingRequired: false
    });
    
    // Manager role - limited access
    this.addRole('manager', {
      permissions: ['read', 'write'],
      piiAccess: 'masked',
      auditLevel: 'standard',
      maskingRequired: true
    });
    
    // Employee role - minimal access
    this.addRole('employee', {
      permissions: ['read'],
      piiAccess: 'minimal',
      auditLevel: 'basic',
      maskingRequired: true,
      ownDataOnly: true
    });
    
    // Guest role - no PII access
    this.addRole('guest', {
      permissions: ['read'],
      piiAccess: 'none',
      auditLevel: 'basic',
      maskingRequired: true
    });
  }
  
  evaluateByRole(piiType: string, operation: string, userRole: string, context: any = {}) {
    const roleConfig = this.getRoleConfig(userRole);
    
    if (!roleConfig.permissions.includes(operation)) {
      return {
        allowed: false,
        reason: `Role '${userRole}' not permitted for operation '${operation}'`
      };
    }
    
    return this.evaluate(piiType, operation, {
      ...context,
      role: userRole,
      roleConfig
    });
  }
}
```

### Context-Aware Policies

```typescript
// Policies that adapt based on context
function createContextAwarePolicy() {
  const policy = new PolicyEngine('context_aware');
  
  // Different rules for different contexts
  policy.addContextRule('development', {
    // Development environment - more permissive
    maskingRequired: false,
    encryptionRequired: false,
    auditLevel: 'basic',
    allowedOperations: ['read', 'write', 'delete']
  });
  
  policy.addContextRule('staging', {
    // Staging environment - moderate security
    maskingRequired: true,
    encryptionRequired: false,
    auditLevel: 'standard',
    allowedOperations: ['read', 'write']
  });
  
  policy.addContextRule('production', {
    // Production environment - strict security
    maskingRequired: true,
    encryptionRequired: true,
    auditLevel: 'comprehensive',
    allowedOperations: ['read'],
    approvalRequired: true
  });
  
  return policy;
}

// Usage
const contextPolicy = createContextAwarePolicy();
const decision = contextPolicy.evaluate('email', 'write', {
  environment: 'production',
  userRole: 'developer'
});
```

## 📊 Risk-Based Decision Making

### Risk Assessment Engine

```typescript
// Automatic risk assessment for PII operations
class RiskBasedPolicyEngine extends PolicyEngine {
  evaluateRisk(piiType: string, operation: string, context: any) {
    let riskScore = 0;
    const riskFactors = [];
    
    // PII type risk
    const piiRisk = this.getPIIRisk(piiType);
    riskScore += piiRisk.score;
    riskFactors.push(piiRisk.factor);
    
    // Operation risk
    const operationRisk = this.getOperationRisk(operation);
    riskScore += operationRisk.score;
    riskFactors.push(operationRisk.factor);
    
    // Context risk
    const contextRisk = this.getContextRisk(context);
    riskScore += contextRisk.score;
    riskFactors.push(...contextRisk.factors);
    
    // Determine risk level
    const riskLevel = this.categorizeRisk(riskScore);
    
    return {
      riskScore,
      riskLevel,
      riskFactors,
      mitigation: this.getMitigationStrategy(riskLevel),
      decision: this.makeRiskBasedDecision(riskLevel, context)
    };
  }
  
  private getPIIRisk(piiType: string) {
    const riskMap = {
      'ssn': { score: 10, factor: 'highly_sensitive_id' },
      'credit_card': { score: 9, factor: 'financial_data' },
      'medical_record': { score: 9, factor: 'health_data' },
      'email': { score: 4, factor: 'contact_info' },
      'phone': { score: 5, factor: 'contact_info' },
      'name': { score: 3, factor: 'identifying_info' },
      'ip': { score: 6, factor: 'behavioral_data' }
    };
    
    return riskMap[piiType] || { score: 2, factor: 'unknown_pii' };
  }
  
  private getOperationRisk(operation: string) {
    const riskMap = {
      'export': { score: 8, factor: 'data_transfer' },
      'log': { score: 7, factor: 'permanent_storage' },
      'analytics': { score: 6, factor: 'processing' },
      'display': { score: 3, factor: 'temporary_exposure' },
      'validate': { score: 2, factor: 'processing_only' }
    };
    
    return riskMap[operation] || { score: 5, factor: 'unknown_operation' };
  }
  
  private makeRiskBasedDecision(riskLevel: string, context: any) {
    switch (riskLevel) {
      case 'low':
        return { allowed: true, requirements: ['basic_audit'] };
      
      case 'medium':
        return { 
          allowed: true, 
          requirements: ['masking', 'audit', 'user_consent'] 
        };
      
      case 'high':
        return { 
          allowed: context.approvalGranted || false,
          requirements: ['encryption', 'comprehensive_audit', 'manager_approval'] 
        };
      
      case 'critical':
        return { 
          allowed: false,
          reason: 'Risk level too high for automated approval',
          requirements: ['executive_approval', 'legal_review']
        };
    }
  }
}
```

### Dynamic Policy Adjustment

```typescript
// Policies that adjust based on current threat level
class AdaptivePolicyEngine extends PolicyEngine {
  private threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  
  setThreatLevel(level: 'low' | 'medium' | 'high' | 'critical') {
    this.threatLevel = level;
    this.adjustPolicies();
  }
  
  private adjustPolicies() {
    switch (this.threatLevel) {
      case 'low':
        this.updateGlobalSettings({
          maskingThreshold: 0.3,
          encryptionRequired: false,
          auditLevel: 'basic'
        });
        break;
      
      case 'medium':
        this.updateGlobalSettings({
          maskingThreshold: 0.5,
          encryptionRequired: true,
          auditLevel: 'standard'
        });
        break;
      
      case 'high':
        this.updateGlobalSettings({
          maskingThreshold: 0.8,
          encryptionRequired: true,
          auditLevel: 'comprehensive',
          approvalRequired: true
        });
        break;
      
      case 'critical':
        this.updateGlobalSettings({
          maskingThreshold: 1.0,
          encryptionRequired: true,
          auditLevel: 'comprehensive',
          approvalRequired: true,
          accessRestricted: true
        });
        break;
    }
  }
  
  evaluate(piiType: string, operation: string, context: any = {}) {
    // Include current threat level in evaluation
    const decision = super.evaluate(piiType, operation, {
      ...context,
      threatLevel: this.threatLevel
    });
    
    // Apply threat-level specific modifications
    if (this.threatLevel === 'critical' && decision.allowed) {
      decision.additionalRequirements = [
        'secondary_authentication',
        'real_time_monitoring',
        'automatic_expiry'
      ];
    }
    
    return decision;
  }
}
```

## 📋 Audit and Compliance Tracking

### Comprehensive Audit Logging

```typescript
// Policy engine with built-in audit trails
class AuditablePolicyEngine extends PolicyEngine {
  private auditLog: any[] = [];
  
  evaluate(piiType: string, operation: string, context: any = {}) {
    const startTime = Date.now();
    const decision = super.evaluate(piiType, operation, context);
    const endTime = Date.now();
    
    // Create audit entry
    const auditEntry = {
      timestamp: new Date().toISOString(),
      piiType,
      operation,
      decision: decision.allowed,
      reason: decision.reason,
      requirements: decision.requirements,
      context: this.sanitizeContext(context),
      user: context.userId || 'anonymous',
      sessionId: context.sessionId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      processingTime: endTime - startTime,
      policyVersion: this.getPolicyVersion(),
      riskLevel: decision.riskLevel,
      complianceFramework: this.getActiveFrameworks()
    };
    
    this.auditLog.push(auditEntry);
    
    // Trigger real-time compliance monitoring
    this.checkComplianceViolations(auditEntry);
    
    return {
      ...decision,
      auditId: auditEntry.timestamp + '_' + auditEntry.user
    };
  }
  
  private sanitizeContext(context: any) {
    // Remove sensitive data from audit context
    const sanitized = { ...context };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    return sanitized;
  }
  
  getAuditReport(filters: any = {}) {
    let filtered = this.auditLog;
    
    if (filters.dateFrom) {
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp) >= new Date(filters.dateFrom)
      );
    }
    
    if (filters.user) {
      filtered = filtered.filter(entry => entry.user === filters.user);
    }
    
    if (filters.piiType) {
      filtered = filtered.filter(entry => entry.piiType === filters.piiType);
    }
    
    if (filters.violation) {
      filtered = filtered.filter(entry => !entry.decision);
    }
    
    return {
      entries: filtered,
      summary: this.generateAuditSummary(filtered),
      complianceScore: this.calculateComplianceScore(filtered)
    };
  }
  
  private generateAuditSummary(entries: any[]) {
    return {
      totalDecisions: entries.length,
      allowedDecisions: entries.filter(e => e.decision).length,
      deniedDecisions: entries.filter(e => !e.decision).length,
      mostAccessedPII: this.getMostFrequent(entries, 'piiType'),
      mostCommonOperations: this.getMostFrequent(entries, 'operation'),
      averageProcessingTime: entries.reduce((sum, e) => sum + e.processingTime, 0) / entries.length
    };
  }
}
```

### Compliance Reporting

```typescript
// Generate compliance reports for auditors
class ComplianceReporter {
  constructor(private policyEngine: AuditablePolicyEngine) {}
  
  generateGDPRReport(startDate: Date, endDate: Date) {
    const auditData = this.policyEngine.getAuditReport({
      dateFrom: startDate,
      dateTo: endDate
    });
    
    return {
      reportType: 'GDPR Compliance Report',
      period: { startDate, endDate },
      
      // Article 5 - Lawfulness, fairness and transparency
      lawfulnessAssessment: {
        legalBasisRecorded: this.checkLegalBasisCompliance(auditData),
        transparencyMeasures: this.checkTransparencyCompliance(auditData)
      },
      
      // Article 5 - Data minimization
      dataMinimization: {
        unnecessaryDataAccess: this.findUnnecessaryAccess(auditData),
        excessiveRetention: this.checkRetentionPolicies(auditData)
      },
      
      // Article 5 - Accuracy
      accuracyMeasures: {
        dataValidationRate: this.calculateValidationRate(auditData),
        correctionRequests: this.getCorrectionRequests(auditData)
      },
      
      // Article 25 - Data protection by design and by default
      privacyByDesign: {
        automaticMasking: this.checkAutomaticMasking(auditData),
        encryptionUsage: this.checkEncryptionUsage(auditData)
      },
      
      // Article 32 - Security of processing
      securityMeasures: {
        accessControls: this.checkAccessControls(auditData),
        auditTrails: this.validateAuditTrails(auditData)
      },
      
      // Overall compliance score
      complianceScore: auditData.complianceScore,
      recommendations: this.generateRecommendations(auditData)
    };
  }
  
  generateCCPAReport(startDate: Date, endDate: Date) {
    const auditData = this.policyEngine.getAuditReport({
      dateFrom: startDate,
      dateTo: endDate
    });
    
    return {
      reportType: 'CCPA Compliance Report',
      period: { startDate, endDate },
      
      // Right to Know
      rightToKnow: {
        dataDisclosureRequests: this.getDisclosureRequests(auditData),
        responseTime: this.calculateResponseTime(auditData)
      },
      
      // Right to Delete
      rightToDelete: {
        deletionRequests: this.getDeletionRequests(auditData),
        deletionCompliance: this.checkDeletionCompliance(auditData)
      },
      
      // Right to Opt-Out
      rightToOptOut: {
        optOutRequests: this.getOptOutRequests(auditData),
        saleOfPersonalInfo: this.checkSaleRestrictions(auditData)
      },
      
      // Non-discrimination
      nonDiscrimination: {
        serviceRestrictions: this.checkServiceRestrictions(auditData),
        pricingChanges: this.checkPricingCompliance(auditData)
      },
      
      complianceScore: auditData.complianceScore
    };
  }
}
```

## 🔄 Policy Workflow Integration

### Automated Workflow Processing

```typescript
// Integrate policy engine with business workflows
class WorkflowPolicyIntegration {
  constructor(private policyEngine: PolicyEngine) {}
  
  async processWorkflowStep(stepName: string, data: any, context: any) {
    const piiDetection = detectPII(JSON.stringify(data));
    
    if (!piiDetection.hasPII) {
      // No PII, proceed normally
      return this.executeStep(stepName, data, context);
    }
    
    // Process each PII type found
    const processedData = { ...data };
    const policyDecisions = [];
    
    for (const span of piiDetection.spans) {
      const decision = this.policyEngine.evaluate(span.type, stepName, context);
      policyDecisions.push(decision);
      
      if (!decision.allowed) {
        throw new PolicyViolationError(
          `Workflow step '${stepName}' not allowed for PII type '${span.type}': ${decision.reason}`
        );
      }
      
      // Apply required transformations
      if (decision.requiresMasking) {
        processedData[span.field] = maskPII(span.text, span.type).masked;
      }
      
      if (decision.requiresEncryption) {
        processedData[span.field] = await this.encryptData(span.text);
      }
      
      if (decision.requiresRedaction) {
        delete processedData[span.field];
      }
    }
    
    // Execute step with policy-compliant data
    const result = await this.executeStep(stepName, processedData, context);
    
    // Log workflow execution for audit
    this.logWorkflowExecution(stepName, policyDecisions, context);
    
    return result;
  }
  
  private async executeStep(stepName: string, data: any, context: any) {
    // Execute the actual workflow step
    switch (stepName) {
      case 'send_email':
        return this.sendEmail(data, context);
      case 'store_customer_data':
        return this.storeCustomerData(data, context);
      case 'generate_report':
        return this.generateReport(data, context);
      default:
        throw new Error(`Unknown workflow step: ${stepName}`);
    }
  }
}
```

### Approval Workflows

```typescript
// Handle operations requiring approval
class ApprovalWorkflowEngine {
  constructor(private policyEngine: PolicyEngine) {}
  
  async requestAccess(piiType: string, operation: string, context: any) {
    const decision = this.policyEngine.evaluate(piiType, operation, context);
    
    if (decision.allowed && !decision.requiresApproval) {
      // Automatic approval
      return {
        approved: true,
        automatic: true,
        decision
      };
    }
    
    if (!decision.allowed) {
      // Automatic denial
      return {
        approved: false,
        automatic: true,
        reason: decision.reason
      };
    }
    
    // Requires manual approval
    const approvalRequest = {
      id: generateId(),
      requester: context.userId,
      piiType,
      operation,
      context: this.sanitizeContext(context),
      businessJustification: context.justification,
      requestedAt: new Date(),
      urgency: context.urgency || 'normal',
      approvalLevel: decision.approvalLevel || 'manager'
    };
    
    // Route to appropriate approver
    const approver = await this.getApprover(approvalRequest);
    await this.sendApprovalRequest(approvalRequest, approver);
    
    return {
      approved: false,
      pending: true,
      approvalRequestId: approvalRequest.id,
      estimatedApprovalTime: this.getEstimatedApprovalTime(approvalRequest)
    };
  }
  
  async processApproval(requestId: string, approverId: string, decision: 'approve' | 'deny', comments?: string) {
    const request = await this.getApprovalRequest(requestId);
    
    if (!request) {
      throw new Error('Approval request not found');
    }
    
    const approval = {
      requestId,
      approverId,
      decision,
      comments,
      approvedAt: new Date(),
      ipAddress: this.getCurrentIP(),
      valid: decision === 'approve',
      expiresAt: decision === 'approve' ? 
        new Date(Date.now() + this.getApprovalDuration(request)) : null
    };
    
    await this.storeApproval(approval);
    
    // Notify requester
    await this.notifyRequester(request, approval);
    
    // Log approval decision
    this.policyEngine.logApprovalDecision(request, approval);
    
    return approval;
  }
}
```

## 🎯 Real-World Policy Implementations

### Healthcare Policy Implementation

```typescript
// HIPAA-compliant healthcare policy
class HealthcarePolicyEngine extends PolicyEngine {
  constructor() {
    super('healthcare');
    this.setupHIPAACompliance();
  }
  
  private setupHIPAACompliance() {
    // Minimum necessary standard
    this.addRule('minimum_necessary', {
      applies: ['phi', 'medical_record', 'patient_id'],
      evaluate: (context) => {
        const userRole = context.userRole;
        const purpose = context.purpose;
        
        // Only allow access for legitimate healthcare operations
        const legitimatePurposes = [
          'treatment',
          'payment', 
          'healthcare_operations',
          'patient_request'
        ];
        
        if (!legitimatePurposes.includes(purpose)) {
          return { allowed: false, reason: 'Not a legitimate healthcare purpose' };
        }
        
        // Role-based access
        const rolePermissions = {
          'physician': ['treatment', 'healthcare_operations'],
          'nurse': ['treatment'],
          'billing': ['payment'],
          'patient': ['patient_request']
        };
        
        if (!rolePermissions[userRole]?.includes(purpose)) {
          return { allowed: false, reason: 'Role not authorized for this purpose' };
        }
        
        return {
          allowed: true,
          requirements: ['audit_log', 'minimum_necessary_documentation'],
          auditRequired: true
        };
      }
    });
    
    // Patient consent requirements
    this.addRule('patient_consent', {
      applies: ['phi'],
      evaluate: (context) => {
        if (context.purpose === 'marketing' || context.purpose === 'research') {
          return {
            allowed: context.patientConsent === true,
            requirements: ['written_consent', 'opt_out_mechanism']
          };
        }
        
        return { allowed: true };
      }
    });
  }
  
  evaluatePhiAccess(patientId: string, phiType: string, purpose: string, context: any) {
    // Check patient-provider relationship
    if (!this.verifyPatientRelationship(patientId, context.userId)) {
      return {
        allowed: false,
        reason: 'No established patient-provider relationship'
      };
    }
    
    // Evaluate against HIPAA rules
    const decision = this.evaluate(phiType, 'access', {
      ...context,
      purpose,
      patientId
    });
    
    // Additional HIPAA-specific logging
    this.logPhiAccess(patientId, phiType, purpose, context, decision);
    
    return decision;
  }
}
```

### Financial Services Policy

```typescript
// PCI DSS and financial regulations compliance
class FinancialPolicyEngine extends PolicyEngine {
  constructor() {
    super('financial');
    this.setupFinancialCompliance();
  }
  
  private setupFinancialCompliance() {
    // PCI DSS cardholder data protection
    this.addRule('cardholder_data', {
      applies: ['credit_card', 'debit_card', 'cvv'],
      evaluate: (context) => {
        const operation = context.operation;
        
        // Never allow CVV storage
        if (context.piiType === 'cvv' && operation === 'store') {
          return {
            allowed: false,
            reason: 'CVV storage prohibited by PCI DSS'
          };
        }
        
        // Limit cardholder data retention
        if (operation === 'store' && context.retentionPeriod > 90) {
          return {
            allowed: false,
            reason: 'Cardholder data retention exceeds 90-day limit'
          };
        }
        
        // Require encryption for storage
        if (operation === 'store') {
          return {
            allowed: true,
            requirements: ['strong_encryption', 'secure_key_management']
          };
        }
        
        // Mask for display
        if (operation === 'display') {
          return {
            allowed: true,
            requiresMasking: true,
            maskingPattern: 'show_last_4'
          };
        }
        
        return { allowed: true };
      }
    });
    
    // Know Your Customer (KYC) requirements
    this.addRule('kyc_data', {
      applies: ['ssn', 'tax_id', 'government_id'],
      evaluate: (context) => {
        return {
          allowed: true,
          requirements: [
            'identity_verification',
            'risk_assessment',
            'enhanced_due_diligence'
          ],
          retentionPeriod: '7_years', // Regulatory requirement
          auditRequired: true
        };
      }
    });
  }
  
  evaluateTransactionData(transactionData: any, context: any) {
    const decisions = [];
    
    // Evaluate each piece of financial data
    for (const [field, value] of Object.entries(transactionData)) {
      const piiType = this.detectFinancialPiiType(field, value);
      
      if (piiType) {
        const decision = this.evaluate(piiType, context.operation, {
          ...context,
          field,
          value
        });
        
        decisions.push({ field, piiType, decision });
      }
    }
    
    return {
      decisions,
      compliant: decisions.every(d => d.decision.allowed),
      requirements: this.consolidateRequirements(decisions)
    };
  }
}
```

## 🎯 Why Policy Engine Matters in PII Context

### Automated Compliance

1. **Consistency**: Uniform policy application across all systems
2. **Scalability**: Handle thousands of decisions per second
3. **Accuracy**: Eliminate human error in compliance decisions
4. **Efficiency**: Reduce manual review and approval overhead

### Risk Management

1. **Proactive Protection**: Prevent violations before they occur
2. **Risk Assessment**: Quantify and manage privacy risks
3. **Threat Response**: Adapt policies based on current threat levels
4. **Incident Prevention**: Stop policy violations in real-time

### Legal Protection

1. **Regulatory Compliance**: Meet GDPR, CCPA, HIPAA requirements
2. **Audit Readiness**: Comprehensive trails for regulatory review
3. **Legal Defense**: Demonstrate due diligence and good faith
4. **Policy Evolution**: Adapt to changing regulatory landscape

### Business Value

1. **Customer Trust**: Transparent and consistent privacy protection
2. **Operational Efficiency**: Automate complex compliance decisions
3. **Cost Reduction**: Reduce compliance overhead and violations
4. **Innovation Enablement**: Safe experimentation within policy bounds

---

**Next Steps:**
- 🔍 **Master detection**: [PII Detection Documentation](./detection.md)
- 🎭 **Learn masking**: [Masking Documentation](./masking.md)
- 🚫 **Explore redaction**: [Redaction Documentation](./redaction.md)
- 🔧 **Understand normalization**: [Normalization Documentation](./normalization.md)