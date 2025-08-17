# Framework Integration Guide

Privakit is designed to work seamlessly across all major JavaScript frameworks and environments. This guide shows you how to integrate Privakit with popular frameworks and provides best practices for each platform.

## 🌐 Universal Compatibility

Privakit supports:

- ✅ **Node.js** (20.19.0+) - Server-side applications
- ✅ **React** (16.8+) - Web and React Native apps
- ✅ **Vue.js** (3.0+) - Progressive web applications
- ✅ **Angular** (12+) - Enterprise applications
- ✅ **Svelte** (3.0+) - Compiled web apps
- ✅ **Next.js** (12+) - Full-stack React framework
- ✅ **Nuxt** (3.0+) - Full-stack Vue framework
- ✅ **Express.js** - Web servers and APIs
- ✅ **Fastify** - High-performance APIs
- ✅ **Electron** - Desktop applications
- ✅ **React Native** - Mobile applications

## ⚛️ React Integration

### Basic Usage

```typescript
import React, { useState, useCallback } from 'react';
import { detectPII, maskPII, validateEmail, createPolicyEngine } from 'privakit';

function UserForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Real-time validation
    const validation = validateEmail(value);
    setEmailError(validation.isValid ? '' : 'Please enter a valid email');

    // Real-time masking for display
    if (validation.isValid) {
      const masked = maskPII(value, 'email', { visibleStart: 2, visibleEnd: 1 });
      setDisplayEmail(masked.masked);
    }
  }, []);

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Enter email"
      />
      {emailError && <div className="error">{emailError}</div>}
      {displayEmail && <div className="preview">Preview: {displayEmail}</div>}
    </div>
  );
}

export default UserForm;
```

### React Hook for PII Processing

```typescript
import { useState, useCallback, useMemo } from 'react';
import { detectPII, maskPII, validateEmail, createPolicyEngine } from 'privakit';

interface UsePIIOptions {
  maskingOptions?: any;
  policyType?: 'gdpr' | 'ccpa' | 'lgpd';
  strictMode?: boolean;
}

export function usePII(options: UsePIIOptions = {}) {
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    lastProcessed: null as any,
    errors: [] as string[]
  });

  const policyEngine = useMemo(() =>
    createPolicyEngine(options.policyType || 'gdpr', {
      strictMode: options.strictMode ?? true
    }), [options.policyType, options.strictMode]
  );

  const processText = useCallback(async (text: string, operation: string = 'display') => {
    setProcessingState(prev => ({ ...prev, isProcessing: true, errors: [] }));

    try {
      // Detect PII in text
      const detection = detectPII(text);

      if (!detection.hasPII) {
        return { safe: text, hasPII: false, processed: text };
      }

      // Check policy compliance
      const decisions = detection.spans.map(span =>
        policyEngine.evaluate(span.type, operation)
      );

      const violations = decisions.filter(d => !d.allowed);
      if (violations.length > 0) {
        throw new Error(`Policy violations: ${violations.map(v => v.reason).join(', ')}`);
      }

      // Apply masking if required
      let processed = text;
      detection.spans.forEach(span => {
        const decision = decisions.find(d => d.piiType === span.type);
        if (decision?.requiresMasking) {
          const masked = maskPII(span.text, span.type, options.maskingOptions);
          processed = processed.replace(span.text, masked.masked);
        }
      });

      const result = {
        safe: processed,
        hasPII: true,
        processed,
        detection,
        decisions
      };

      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        lastProcessed: result
      }));

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setProcessingState(prev => ({
        ...prev,
        isProcessing: false,
        errors: [...prev.errors, errorMsg]
      }));
      throw error;
    }
  }, [policyEngine, options.maskingOptions]);

  const validateData = useCallback((data: any, type: 'email' | 'phone' | 'name') => {
    switch (type) {
      case 'email':
        return validateEmail(data);
      case 'phone':
        return validatePhone(data);
      case 'name':
        return validateName(data);
      default:
        throw new Error(`Unsupported validation type: ${type}`);
    }
  }, []);

  return {
    processText,
    validateData,
    policyEngine,
    ...processingState
  };
}

// Usage example
function PrivacyAwareComponent() {
  const { processText, validateData, isProcessing, errors } = usePII({
    policyType: 'gdpr',
    maskingOptions: { visibleStart: 1, visibleEnd: 1 }
  });

  const [userInput, setUserInput] = useState('');
  const [safeOutput, setSafeOutput] = useState('');

  const handleSubmit = async () => {
    try {
      const result = await processText(userInput, 'display');
      setSafeOutput(result.safe);
    } catch (error) {
      console.error('PII processing failed:', error);
    }
  };

  return (
    <div>
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Enter text (may contain PII)"
      />
      <button onClick={handleSubmit} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Process Text'}
      </button>
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => <div key={i}>{error}</div>)}
        </div>
      )}
      {safeOutput && (
        <div className="output">
          <strong>Safe Output:</strong> {safeOutput}
        </div>
      )}
    </div>
  );
}
```

### React Native Integration

```typescript
import React, { useState } from 'react';
import { View, TextInput, Text, Alert } from 'react-native';
import { detectPII, maskPII } from 'privakit';

const PIIAwareInput = () => {
  const [text, setText] = useState('');
  const [hasPII, setHasPII] = useState(false);

  const handleTextChange = (newText: string) => {
    setText(newText);

    // Check for PII in real-time
    const detection = detectPII(newText);
    setHasPII(detection.hasPII);

    if (detection.hasPII) {
      Alert.alert(
        'PII Detected',
        'This text contains personally identifiable information.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View>
      <TextInput
        value={text}
        onChangeText={handleTextChange}
        placeholder="Enter text"
        style={{
          borderColor: hasPII ? 'red' : 'gray',
          borderWidth: 1,
          padding: 10
        }}
      />
      {hasPII && (
        <Text style={{ color: 'red' }}>
          ⚠️ PII detected in input
        </Text>
      )}
    </View>
  );
};
```

## 🟢 Vue.js Integration

### Composition API

```vue
<template>
  <div class="pii-form">
    <div class="input-group">
      <label for="email">Email:</label>
      <input
        id="email"
        v-model="email"
        type="email"
        :class="{ error: emailError }"
        @blur="validateEmailField"
      />
      <span v-if="emailError" class="error-text">{{ emailError }}</span>
      <span v-if="maskedEmail" class="preview">Preview: {{ maskedEmail }}</span>
    </div>

    <div class="input-group">
      <label for="message">Message:</label>
      <textarea
        id="message"
        v-model="message"
        @input="checkMessageForPII"
        :class="{ 'has-pii': messageHasPII }"
        placeholder="Enter your message"
      ></textarea>
      <div v-if="messageHasPII" class="pii-warning">
        ⚠️ This message contains personally identifiable information
      </div>
    </div>

    <button @click="submitForm" :disabled="!canSubmit">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  detectPII,
  maskPII,
  validateEmail,
  createPolicyEngine,
} from "privakit";

// Reactive state
const email = ref("");
const message = ref("");
const emailError = ref("");
const maskedEmail = ref("");
const messageHasPII = ref(false);

// Policy engine
const policyEngine = createPolicyEngine("gdpr");

// Computed properties
const canSubmit = computed(
  () => email.value && !emailError.value && !messageHasPII.value,
);

// Methods
const validateEmailField = () => {
  const result = validateEmail(email.value);
  emailError.value = result.isValid ? "" : "Please enter a valid email address";

  if (result.isValid) {
    const masked = maskPII(email.value, "email", { visibleStart: 2 });
    maskedEmail.value = masked.masked;
  } else {
    maskedEmail.value = "";
  }
};

const checkMessageForPII = () => {
  const detection = detectPII(message.value);
  messageHasPII.value = detection.hasPII;
};

const submitForm = async () => {
  // Final PII check before submission
  const messageDetection = detectPII(message.value);

  if (messageDetection.hasPII) {
    // Apply redaction for logging
    const safeMessage = redactText(message.value).redacted;
    console.log("Form submitted with safe message:", safeMessage);
  } else {
    console.log("Form submitted:", {
      email: email.value,
      message: message.value,
    });
  }
};

// Watchers
watch(email, validateEmailField);
watch(message, checkMessageForPII);
</script>
```

### Vue Plugin

```typescript
// plugins/privakit.ts
import { App } from "vue";
import {
  detectPII,
  maskPII,
  validateEmail,
  createPolicyEngine,
} from "privakit";

export default {
  install(app: App, options = {}) {
    const policyEngine = createPolicyEngine(options.policy || "gdpr");

    app.config.globalProperties.$privakit = {
      detectPII,
      maskPII,
      validateEmail,
      policyEngine,

      // Helper methods
      processText: (text: string, operation: string = "display") => {
        const detection = detectPII(text);

        if (!detection.hasPII) {
          return { safe: text, hasPII: false };
        }

        let processed = text;
        detection.spans.forEach((span) => {
          const decision = policyEngine.evaluate(span.type, operation);
          if (decision.requiresMasking) {
            const masked = maskPII(span.text, span.type);
            processed = processed.replace(span.text, masked.masked);
          }
        });

        return { safe: processed, hasPII: true, detection };
      },
    };

    app.provide("privakit", app.config.globalProperties.$privakit);
  },
};

// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import PrivakitPlugin from "./plugins/privakit";

const app = createApp(App);
app.use(PrivakitPlugin, { policy: "gdpr" });
app.mount("#app");
```

## 🅰️ Angular Integration

### Service Integration

```typescript
// services/pii.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {
  detectPII,
  maskPII,
  validateEmail,
  createPolicyEngine,
  PolicyEngine,
} from "privakit";

export interface PIIDetectionResult {
  hasPII: boolean;
  originalText: string;
  safeText: string;
  detection?: any;
}

@Injectable({
  providedIn: "root",
})
export class PIIService {
  private policyEngine: PolicyEngine;
  private processingSubject = new BehaviorSubject<boolean>(false);

  public isProcessing$: Observable<boolean> =
    this.processingSubject.asObservable();

  constructor() {
    this.policyEngine = createPolicyEngine("gdpr", {
      strictMode: true,
      auditRequired: true,
    });
  }

  async processText(
    text: string,
    operation: string = "display",
  ): Promise<PIIDetectionResult> {
    this.processingSubject.next(true);

    try {
      const detection = detectPII(text);

      if (!detection.hasPII) {
        return {
          hasPII: false,
          originalText: text,
          safeText: text,
        };
      }

      let safeText = text;
      for (const span of detection.spans) {
        const decision = this.policyEngine.evaluate(span.type, operation);

        if (!decision.allowed) {
          throw new Error(
            `Operation '${operation}' not allowed for ${span.type}: ${decision.reason}`,
          );
        }

        if (decision.requiresMasking) {
          const masked = maskPII(span.text, span.type);
          safeText = safeText.replace(span.text, masked.masked);
        }
      }

      return {
        hasPII: true,
        originalText: text,
        safeText,
        detection,
      };
    } finally {
      this.processingSubject.next(false);
    }
  }

  validateEmailAddress(email: string) {
    return validateEmail(email);
  }

  maskSensitiveData(data: string, type: string) {
    return maskPII(data, type);
  }
}
```

### Component Usage

```typescript
// components/user-form.component.ts
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PIIService } from "../services/pii.service";

@Component({
  selector: "app-user-form",
  templateUrl: "./user-form.component.html",
  styleUrls: ["./user-form.component.scss"],
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  emailPreview: string = "";
  messageHasPII: boolean = false;
  isProcessing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private piiService: PIIService,
  ) {
    this.userForm = this.fb.group({
      email: ["", [Validators.required, this.emailValidator.bind(this)]],
      message: ["", Validators.required],
    });
  }

  ngOnInit() {
    // Subscribe to processing state
    this.piiService.isProcessing$.subscribe(
      (processing) => (this.isProcessing = processing),
    );

    // Watch email field for real-time masking
    this.userForm.get("email")?.valueChanges.subscribe((email) => {
      if (email && this.userForm.get("email")?.valid) {
        const masked = this.piiService.maskSensitiveData(email, "email");
        this.emailPreview = masked.masked;
      } else {
        this.emailPreview = "";
      }
    });

    // Watch message field for PII detection
    this.userForm.get("message")?.valueChanges.subscribe(async (message) => {
      if (message) {
        try {
          const result = await this.piiService.processText(message, "display");
          this.messageHasPII = result.hasPII;
        } catch (error) {
          console.error("PII processing error:", error);
        }
      } else {
        this.messageHasPII = false;
      }
    });
  }

  emailValidator(control: any) {
    if (!control.value) return null;

    const result = this.piiService.validateEmailAddress(control.value);
    return result.isValid ? null : { invalidEmail: true };
  }

  async onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      try {
        // Process message for safe submission
        const messageResult = await this.piiService.processText(
          formData.message,
          "store",
        );

        const submissionData = {
          email: formData.email,
          message: messageResult.safeText,
        };

        console.log("Safe form submission:", submissionData);
        // Submit to your API
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }
  }
}
```

```html
<!-- user-form.component.html -->
<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label for="email">Email:</label>
    <input
      id="email"
      type="email"
      formControlName="email"
      [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
    />
    <div
      *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched"
      class="error-text"
    >
      Please enter a valid email address
    </div>
    <div *ngIf="emailPreview" class="preview">Preview: {{ emailPreview }}</div>
  </div>

  <div class="form-group">
    <label for="message">Message:</label>
    <textarea
      id="message"
      formControlName="message"
      [class.has-pii]="messageHasPII"
      placeholder="Enter your message"
    ></textarea>
    <div *ngIf="messageHasPII" class="pii-warning">
      ⚠️ This message contains personally identifiable information
    </div>
  </div>

  <button type="submit" [disabled]="userForm.invalid || isProcessing">
    <span *ngIf="isProcessing">Processing...</span>
    <span *ngIf="!isProcessing">Submit</span>
  </button>
</form>
```

## 🔶 Svelte Integration

```svelte
<!-- PIIAwareForm.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { detectPII, maskPII, validateEmail, createPolicyEngine } from 'privakit';

  let email = '';
  let message = '';
  let emailError = '';
  let emailPreview = '';
  let messageHasPII = false;
  let isProcessing = false;

  const policyEngine = createPolicyEngine('gdpr');

  $: if (email) {
    validateEmailInput(email);
  }

  $: if (message) {
    checkMessagePII(message);
  }

  function validateEmailInput(emailValue: string) {
    const result = validateEmail(emailValue);
    emailError = result.isValid ? '' : 'Please enter a valid email address';

    if (result.isValid) {
      const masked = maskPII(emailValue, 'email', { visibleStart: 2 });
      emailPreview = masked.masked;
    } else {
      emailPreview = '';
    }
  }

  async function checkMessagePII(messageValue: string) {
    isProcessing = true;
    try {
      const detection = detectPII(messageValue);
      messageHasPII = detection.hasPII;
    } catch (error) {
      console.error('PII detection error:', error);
    } finally {
      isProcessing = false;
    }
  }

  async function handleSubmit() {
    if (emailError || messageHasPII) return;

    isProcessing = true;
    try {
      // Process message for safe submission
      let safeMessage = message;
      const detection = detectPII(message);

      if (detection.hasPII) {
        for (const span of detection.spans) {
          const decision = policyEngine.evaluate(span.type, 'store');
          if (decision.requiresMasking) {
            const masked = maskPII(span.text, span.type);
            safeMessage = safeMessage.replace(span.text, masked.masked);
          }
        }
      }

      const submissionData = { email, message: safeMessage };
      console.log('Safe form submission:', submissionData);

      // Submit to your API
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      isProcessing = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="form-group">
    <label for="email">Email:</label>
    <input
      id="email"
      type="email"
      bind:value={email}
      class:error={emailError}
    />
    {#if emailError}
      <div class="error-text">{emailError}</div>
    {/if}
    {#if emailPreview}
      <div class="preview">Preview: {emailPreview}</div>
    {/if}
  </div>

  <div class="form-group">
    <label for="message">Message:</label>
    <textarea
      id="message"
      bind:value={message}
      class:has-pii={messageHasPII}
      placeholder="Enter your message"
    ></textarea>
    {#if messageHasPII}
      <div class="pii-warning">
        ⚠️ This message contains personally identifiable information
      </div>
    {/if}
  </div>

  <button type="submit" disabled={emailError || messageHasPII || isProcessing}>
    {isProcessing ? 'Processing...' : 'Submit'}
  </button>
</form>

<style>
  .form-group {
    margin-bottom: 1rem;
  }

  .error {
    border-color: red;
  }

  .has-pii {
    border-color: orange;
    background-color: #fff3cd;
  }

  .error-text {
    color: red;
    font-size: 0.875rem;
  }

  .pii-warning {
    color: orange;
    font-size: 0.875rem;
  }

  .preview {
    color: gray;
    font-style: italic;
    font-size: 0.875rem;
  }
</style>
```

## 🚀 Next.js Integration

### API Routes

```typescript
// pages/api/submit-form.ts or app/api/submit-form/route.ts
import { NextApiRequest, NextApiResponse } from "next";
import { detectPII, redactText, createPolicyEngine } from "privakit";

const policyEngine = createPolicyEngine("gdpr", {
  strictMode: true,
  auditRequired: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, message } = req.body;

    // Validate and process the form data
    const messageDetection = detectPII(message);

    if (messageDetection.hasPII) {
      // Check policy compliance
      for (const span of messageDetection.spans) {
        const decision = policyEngine.evaluate(span.type, "store");

        if (!decision.allowed) {
          return res.status(400).json({
            error: `Cannot store ${span.type}: ${decision.reason}`,
            policyViolation: true,
          });
        }
      }

      // Redact PII for logging
      const safeMessage = redactText(message).redacted;
      console.log("Form submitted with redacted message:", safeMessage);
    }

    // Process the form (save to database, send email, etc.)
    const result = await processFormSubmission({ email, message });

    res.status(200).json({
      success: true,
      message: "Form submitted successfully",
      hadPII: messageDetection.hasPII,
    });
  } catch (error) {
    console.error("Form processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function processFormSubmission(data: any) {
  // Your form processing logic here
  return { id: Date.now() };
}
```

### App Router (Next.js 13+)

```typescript
// app/api/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateEmail, validatePhone } from "privakit";

export async function POST(request: NextRequest) {
  const { type, value } = await request.json();

  let result;
  switch (type) {
    case "email":
      result = validateEmail(value);
      break;
    case "phone":
      result = validatePhone(value);
      break;
    default:
      return NextResponse.json(
        { error: "Invalid validation type" },
        { status: 400 },
      );
  }

  return NextResponse.json(result);
}
```

### Client-Side Hook

```typescript
// hooks/usePII.ts
"use client";

import { useState, useCallback } from "react";
import { detectPII, maskPII, validateEmail } from "privakit";

export function usePII() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processText = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const detection = detectPII(text);

      if (detection.hasPII) {
        let maskedText = text;
        detection.spans.forEach((span) => {
          const masked = maskPII(span.text, span.type);
          maskedText = maskedText.replace(span.text, masked.masked);
        });

        return {
          original: text,
          masked: maskedText,
          hasPII: true,
          detection,
        };
      }

      return {
        original: text,
        masked: text,
        hasPII: false,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateData = useCallback(
    async (data: string, type: "email" | "phone") => {
      setIsLoading(true);
      setError(null);

      try {
        // For client-side validation, we can validate directly
        if (type === "email") {
          return validateEmail(data);
        }

        // For server-side validation, make API call
        const response = await fetch("/api/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, value: data }),
        });

        if (!response.ok) {
          throw new Error("Validation failed");
        }

        return await response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Validation error";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    processText,
    validateData,
    isLoading,
    error,
  };
}
```

## 🟢 Nuxt Integration

### Plugin

```typescript
// plugins/privakit.client.ts
import {
  detectPII,
  maskPII,
  validateEmail,
  createPolicyEngine,
} from "privakit";

export default defineNuxtPlugin(() => {
  const policyEngine = createPolicyEngine("gdpr");

  return {
    provide: {
      privakit: {
        detectPII,
        maskPII,
        validateEmail,
        policyEngine,

        // Helper composable
        processText: (text: string, operation: string = "display") => {
          const detection = detectPII(text);

          if (!detection.hasPII) {
            return { safe: text, hasPII: false };
          }

          let processed = text;
          detection.spans.forEach((span) => {
            const decision = policyEngine.evaluate(span.type, operation);
            if (decision.requiresMasking) {
              const masked = maskPII(span.text, span.type);
              processed = processed.replace(span.text, masked.masked);
            }
          });

          return { safe: processed, hasPII: true, detection };
        },
      },
    },
  };
});
```

### Composable

```typescript
// composables/usePII.ts
export const usePII = () => {
  const { $privakit } = useNuxtApp();

  const processText = (text: string, operation?: string) => {
    return $privakit.processText(text, operation);
  };

  const validateEmail = (email: string) => {
    return $privakit.validateEmail(email);
  };

  const maskSensitiveData = (data: string, type: string) => {
    return $privakit.maskPII(data, type);
  };

  return {
    processText,
    validateEmail,
    maskSensitiveData,
  };
};
```

## 🟦 Node.js/Express Integration

### Middleware

```typescript
// middleware/pii-protection.ts
import { Request, Response, NextFunction } from "express";
import { detectPII, redactText, createPolicyEngine } from "privakit";

const policyEngine = createPolicyEngine("gdpr", {
  strictMode: true,
  auditRequired: true,
});

export interface PIIProtectionOptions {
  redactLogs?: boolean;
  blockPIISubmission?: boolean;
  maskResponses?: boolean;
  allowedOperations?: string[];
}

export function piiProtection(options: PIIProtectionOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Intercept request body for PII detection
    if (req.body && typeof req.body === "object") {
      const bodyString = JSON.stringify(req.body);
      const detection = detectPII(bodyString);

      if (detection.hasPII) {
        // Add PII metadata to request
        req.piiDetection = detection;

        // Check policy compliance
        const violations = detection.spans.filter((span) => {
          const decision = policyEngine.evaluate(span.type, "receive");
          return !decision.allowed;
        });

        if (options.blockPIISubmission && violations.length > 0) {
          return res.status(400).json({
            error: "Request contains disallowed PII",
            violations: violations.map((v) => ({
              type: v.type,
              reason: "Not allowed for receive operation",
            })),
          });
        }

        // Redact logs if enabled
        if (options.redactLogs) {
          const originalLog = console.log;
          console.log = (...args) => {
            const redactedArgs = args.map((arg) => {
              if (typeof arg === "string") {
                return redactText(arg).redacted;
              }
              return arg;
            });
            originalLog(...redactedArgs);
          };
        }
      }
    }

    // Intercept response for PII masking
    if (options.maskResponses) {
      const originalSend = res.send;
      res.send = function (data) {
        if (typeof data === "string") {
          const detection = detectPII(data);
          if (detection.hasPII) {
            let maskedData = data;
            detection.spans.forEach((span) => {
              const decision = policyEngine.evaluate(span.type, "send");
              if (decision.requiresMasking) {
                const masked = maskPII(span.text, span.type);
                maskedData = maskedData.replace(span.text, masked.masked);
              }
            });
            data = maskedData;
          }
        }
        return originalSend.call(this, data);
      };
    }

    next();
  };
}

// Usage
import express from "express";
import { piiProtection } from "./middleware/pii-protection";

const app = express();

app.use(express.json());
app.use(
  piiProtection({
    redactLogs: true,
    blockPIISubmission: false,
    maskResponses: true,
  }),
);

app.post("/api/submit", (req, res) => {
  // Access PII detection results
  if (req.piiDetection?.hasPII) {
    console.log("Request contains PII types:", req.piiDetection.detectedTypes);
  }

  res.json({ success: true });
});
```

### Logging Middleware

```typescript
// middleware/safe-logger.ts
import { createSafeLogger } from "privakit";
import winston from "winston";

// Create PII-safe logger
const safeLogger = createSafeLogger({
  replacement: "[REDACTED]",
  strictMode: true,
  auditTrail: true,
});

// Winston integration
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      // Redact PII from log messages
      const safeMessage = safeLogger.redact(message);
      const safeMeta = safeLogger.redact(JSON.stringify(meta));

      return `${timestamp} [${level}]: ${safeMessage} ${safeMeta}`;
    }),
  ),
  transports: [
    new winston.transports.File({ filename: "app.log" }),
    new winston.transports.Console(),
  ],
});

export { logger };
```

## 📱 Mobile Integration (React Native/Expo)

### Setup for React Native

```bash
# Install Privakit
npm install privakit

# For React Native, no additional setup needed
# Privakit works out of the box with React Native's JavaScript environment
```

### React Native Component

```typescript
// components/PIIAwareInput.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { detectPII, maskPII, validateEmail } from 'privakit';

interface PIIAwareInputProps {
  placeholder?: string;
  onSafeTextChange?: (safeText: string, originalText: string) => void;
  type?: 'email' | 'general';
}

export const PIIAwareInput: React.FC<PIIAwareInputProps> = ({
  placeholder,
  onSafeTextChange,
  type = 'general'
}) => {
  const [text, setText] = useState('');
  const [hasPII, setHasPII] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [maskedPreview, setMaskedPreview] = useState('');

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);

    // Validate if it's an email field
    if (type === 'email') {
      const validation = validateEmail(newText);
      setIsValid(validation.isValid);

      if (validation.isValid) {
        const masked = maskPII(newText, 'email');
        setMaskedPreview(masked.masked);
      } else {
        setMaskedPreview('');
      }
    }

    // Check for PII
    const detection = detectPII(newText);
    setHasPII(detection.hasPII);

    if (detection.hasPII && type === 'general') {
      Alert.alert(
        'PII Detected',
        'This text contains personally identifiable information. Please be careful when sharing.',
        [
          { text: 'OK', style: 'default' },
          {
            text: 'Mask PII',
            style: 'default',
            onPress: () => {
              let maskedText = newText;
              detection.spans.forEach(span => {
                const masked = maskPII(span.text, span.type);
                maskedText = maskedText.replace(span.text, masked.masked);
              });
              setText(maskedText);
              setHasPII(false);
            }
          }
        ]
      );
    }

    // Notify parent component
    if (onSafeTextChange) {
      let safeText = newText;
      if (detection.hasPII) {
        detection.spans.forEach(span => {
          const masked = maskPII(span.text, span.type);
          safeText = safeText.replace(span.text, masked.masked);
        });
      }
      onSafeTextChange(safeText, newText);
    }
  }, [type, onSafeTextChange]);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          hasPII && styles.piiInput,
          type === 'email' && !isValid && styles.invalidInput
        ]}
        value={text}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        multiline={type === 'general'}
        keyboardType={type === 'email' ? 'email-address' : 'default'}
      />

      {hasPII && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ PII detected</Text>
        </View>
      )}

      {type === 'email' && !isValid && text.length > 0 && (
        <Text style={styles.errorText}>Please enter a valid email address</Text>
      )}

      {maskedPreview && (
        <Text style={styles.previewText}>Preview: {maskedPreview}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 40,
  },
  piiInput: {
    borderColor: '#ff9500',
    backgroundColor: '#fff3cd',
  },
  invalidInput: {
    borderColor: '#dc3545',
  },
  warningContainer: {
    marginTop: 5,
  },
  warningText: {
    color: '#ff9500',
    fontSize: 14,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 5,
  },
  previewText: {
    color: '#6c757d',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
  },
});
```

## 🛠️ Updated Workflows

### CI/CD Pipeline

- **Node.js Version**: Updated to 20.19.0 for compatibility with dependencies.
- **Tarball Integrity Check**: Added verification step to ensure package integrity.

### Deployment Workflow

- **Node.js Version**: Updated to 20.19.0.
- **Base Path Configuration**: Adjusted for GitHub Pages compatibility.

Refer to `.github/workflows/ci.yml` and `.github/workflows/deploy-test-app.yml` for details.

## 🎯 Framework-Specific Best Practices

### Performance Optimization

1. **Tree Shaking**: Import only needed functions

```typescript
// ✅ Good - tree shakeable
import { validateEmail, maskPII } from "privakit";

// ❌ Avoid - imports everything
import * as Privakit from "privakit";
```

2. **Lazy Loading**: Load Privakit when needed

```typescript
// React lazy loading
const PIIProcessor = lazy(() => import("./components/PIIProcessor"));

// Vue async component
const PIIForm = defineAsyncComponent(() => import("./PIIForm.vue"));

// Angular lazy loading
const PIIModule = () => import("./pii/pii.module").then((m) => m.PIIModule);
```

3. **Memoization**: Cache validation results

```typescript
// React
const memoizedValidation = useMemo(() => validateEmail(email), [email]);

// Vue
const validationResult = computed(() => validateEmail(email.value));
```

### Error Handling

```typescript
// Universal error handling pattern
async function safePIIProcessing(text: string) {
  try {
    return await processText(text);
  } catch (error) {
    // Log error safely (without PII)
    const safeError = redactText(error.message).redacted;
    console.error("PII processing failed:", safeError);

    // Return safe fallback
    return { safe: text, hasPII: false, error: true };
  }
}
```

### TypeScript Integration

```typescript
// Define types for better developer experience
interface PIIProcessingResult {
  safe: string;
  hasPII: boolean;
  detection?: any;
  error?: boolean;
}

interface PIIValidationResult {
  isValid: boolean;
  errors: string[];
  normalized?: string;
}

// Framework-specific type extensions
declare module "vue" {
  interface ComponentCustomProperties {
    $privakit: {
      detectPII: (text: string) => any;
      maskPII: (text: string, type: string) => any;
      validateEmail: (email: string) => PIIValidationResult;
    };
  }
}
```

## 🎯 Why Framework Compatibility Matters

### Universal JavaScript

Privakit is built as a **universal JavaScript library** that works across all environments:

1. **Modern Build System**: Uses TypeScript and modern build tools
2. **Standard APIs**: Relies only on standard JavaScript APIs
3. **No Framework Dependencies**: Pure JavaScript with no external dependencies
4. **Tree Shakeable**: Modular design for optimal bundle sizes
5. **TypeScript First**: Full type definitions for better developer experience

### Cross-Platform Benefits

1. **Code Reuse**: Same PII logic across web, mobile, and desktop
2. **Consistent Behavior**: Identical privacy protection everywhere
3. **Easy Migration**: Move between frameworks without changing PII logic
4. **Team Efficiency**: One library to learn for all platforms

---

**🚀 Ready to integrate?** Choose your framework above and start protecting PII in minutes!
