<template>
  <div class="app">
    <header class="header">
      <h1>🔒 Privakit Test App</h1>
      <p>Interactive testing interface for Privakit PII handling capabilities</p>
    </header>

    <nav class="nav">
      <button 
        v-for="section in sections" 
        :key="section.id"
        @click="activeSection = section.id"
        :class="{ active: activeSection === section.id }"
        class="nav-btn"
      >
        {{ section.name }}
      </button>
    </nav>

    <main class="main">
      <!-- Validation Section -->
      <section v-if="activeSection === 'validation'" class="section">
        <h2>📧 Validation & Normalization</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Test privakit's validation and normalization capabilities for different types of personal data:</p>
          <ul>
            <li><strong>Email:</strong> Enter any email address to check if it's valid and see the normalized version</li>
            <li><strong>Phone:</strong> Test phone numbers with different country codes - select the country first</li>
            <li><strong>Name:</strong> Validate person names and see how they're normalized (capitalization, format)</li>
          </ul>
          <p><em>💡 Tip: Try invalid formats like "test@" or "123" to see validation errors and suggestions.</em></p>
        </div>
        
        <div class="test-group">
          <h3>Email Validation</h3>
          <input 
            v-model="testInputs.email" 
            placeholder="Enter email address" 
            class="input"
          />
          <button @click="testEmailValidation" class="btn btn-primary">Test Email</button>
          <div v-if="results.email" class="result">
            <h4>Result:</h4>
            <pre>{{ JSON.stringify(results.email, null, 2) }}</pre>
          </div>
        </div>

        <div class="test-group">
          <h3>Phone Validation</h3>
          <input 
            v-model="testInputs.phone" 
            placeholder="Enter phone number" 
            class="input"
          />
          <select v-model="testInputs.phoneCountry" class="input">
            <option value="US">United States</option>
            <option value="BR">Brazil</option>
            <option value="UK">United Kingdom</option>
            <option value="DE">Germany</option>
          </select>
          <button @click="testPhoneValidation" class="btn btn-primary">Test Phone</button>
          <div v-if="results.phone" class="result">
            <h4>Result:</h4>
            <pre>{{ JSON.stringify(results.phone, null, 2) }}</pre>
          </div>
        </div>

        <div class="test-group">
          <h3>Name Validation</h3>
          <input 
            v-model="testInputs.name" 
            placeholder="Enter full name" 
            class="input"
          />
          <button @click="testNameValidation" class="btn btn-primary">Test Name</button>
          <div v-if="results.name" class="result">
            <h4>Result:</h4>
            <pre>{{ JSON.stringify(results.name, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Detection Section -->
      <section v-if="activeSection === 'detection'" class="section">
        <h2>🔍 PII Detection</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Test privakit's AI-powered PII detection in natural text:</p>
          <ul>
            <li><strong>Enter any text</strong> that might contain personal information (emails, phones, names, etc.)</li>
            <li><strong>View detection results:</strong> See what types of PII were found and confidence levels</li>
            <li><strong>Understand spans:</strong> See exactly where each piece of PII was detected in the text</li>
          </ul>
          <p><em>💡 Example: "Contact John Doe at john@company.com or call (555) 123-4567"</em></p>
        </div>
        
        <div class="test-group">
          <h3>Text Analysis</h3>
          <textarea 
            v-model="testInputs.textToAnalyze" 
            placeholder="Enter text to analyze for PII..." 
            class="input textarea"
            rows="4"
          ></textarea>
          <button @click="testPIIDetection" class="btn btn-primary">Detect PII</button>
          <div v-if="results.detection" class="result">
            <h4>Detection Result:</h4>
            <div class="detection-summary">
              <span :class="'badge ' + (results.detection.hasPII ? 'badge-danger' : 'badge-success')">
                {{ results.detection.hasPII ? 'PII Detected' : 'No PII Found' }}
              </span>
              <span class="badge badge-info">
                Confidence: {{ results.detection.confidence }}
              </span>
            </div>
            <pre>{{ JSON.stringify(results.detection, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Masking & Redaction Section -->
      <section v-if="activeSection === 'masking'" class="section">
        <h2>🎭 Masking & Redaction</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Test the difference between masking (for UI display) and redaction (for logs/storage):</p>
          <ul>
            <li><strong>Masking:</strong> Partially hides data while keeping format (john***@example.com)</li>
            <li><strong>Redaction:</strong> Completely removes data for secure logging ([REDACTED])</li>
            <li><strong>Text Processing:</strong> Enter text with PII to see both outputs side-by-side</li>
            <li><strong>Individual Fields:</strong> Test specific data types with the field masking tools</li>
          </ul>
          <p><em>💡 Example: "My email is john@example.com and SSN is 555-55-5555"</em></p>
        </div>
        
        <div class="test-group">
          <h3>Text Processing</h3>
          <textarea 
            v-model="testInputs.textToMask" 
            placeholder="Enter text with PII to mask/redact..." 
            class="input textarea"
            rows="4"
          ></textarea>
          <button @click="testMasking" class="btn btn-primary">Process Text</button>
          <div v-if="results.masking" class="result">
            <h4>Processing Results:</h4>
            <div class="masking-results">
              <div class="result-item">
                <strong>Original:</strong>
                <div class="text-box">{{ testInputs.textToMask }}</div>
              </div>
              <div class="result-item">
                <strong>Masked (for display):</strong>
                <div class="text-box">{{ results.masking.masked }}</div>
              </div>
              <div class="result-item">
                <strong>Redacted (for logs):</strong>
                <div class="text-box">{{ results.masking.redacted }}</div>
              </div>
              <div v-if="results.masking.policyViolations.length > 0" class="result-item">
                <strong>Policy Violations:</strong>
                <ul class="violations">
                  <li v-for="violation in results.masking.policyViolations" :key="violation">
                    {{ violation }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="test-group">
          <h3>Individual Field Masking</h3>
          <div class="field-tests">
            <div class="field-test">
              <label>Email:</label>
              <input v-model="testInputs.emailToMask" placeholder="test@example.com" class="input" />
              <button @click="testEmailMasking" class="btn btn-secondary">Mask</button>
              <div v-if="results.emailMask" class="inline-result">{{ results.emailMask }}</div>
            </div>
            
            <div class="field-test">
              <label>Phone:</label>
              <input v-model="testInputs.phoneToMask" placeholder="+1234567890" class="input" />
              <button @click="testPhoneMasking" class="btn btn-secondary">Mask</button>
              <div v-if="results.phoneMask" class="inline-result">{{ results.phoneMask }}</div>
            </div>
            
            <div class="field-test">
              <label>Credit Card:</label>
              <input v-model="testInputs.creditCardToMask" placeholder="4111111111111111" class="input" />
              <button @click="testCreditCardMasking" class="btn btn-secondary">Mask</button>
              <div v-if="results.creditCardMask" class="inline-result">{{ results.creditCardMask }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Policy Engine Section -->
      <section v-if="activeSection === 'policy'" class="section">
        <h2>⚖️ Policy Engine</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Test privakit's policy engine to understand what operations are allowed for different data types:</p>
          <ul>
            <li><strong>Policy Modes:</strong> Switch between Strict (GDPR/CCPA compliant) and Permissive modes</li>
            <li><strong>Data Types:</strong> Select the type of PII you want to test (email, phone, SSN, etc.)</li>
            <li><strong>Operations:</strong> Choose operations (display, store, process, transfer) to check compliance</li>
            <li><strong>Results:</strong> See which operations are allowed and why others are blocked</li>
          </ul>
          <p><em>💡 Try testing SSN with "store" operation in strict mode vs permissive mode.</em></p>
        </div>
        
        <div class="test-group">
          <h3>Policy Configuration</h3>
          <div class="policy-controls">
            <label>
              <input 
                type="radio" 
                value="strict" 
                v-model="policyMode" 
                @change="updatePolicyEngine"
              />
              Strict Mode (GDPR/CCPA compliant)
            </label>
            <label>
              <input 
                type="radio" 
                value="permissive" 
                v-model="policyMode" 
                @change="updatePolicyEngine"
              />
              Permissive Mode
            </label>
          </div>
        </div>

        <div class="test-group">
          <h3>Compliance Check</h3>
          <select v-model="testInputs.piiType" class="input">
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="name">Name</option>
            <option value="address">Address</option>
            <option value="ssn">SSN</option>
          </select>
          <div class="operations">
            <label v-for="op in operations" :key="op">
              <input 
                type="checkbox" 
                :value="op" 
                v-model="selectedOperations"
              />
              {{ op }}
            </label>
          </div>
          <button @click="testCompliance" class="btn btn-primary">Check Compliance</button>
          <div v-if="results.compliance" class="result">
            <h4>Compliance Result:</h4>
            <div class="compliance-result">
              <span :class="'badge ' + (results.compliance.isCompliant ? 'badge-success' : 'badge-danger')">
                {{ results.compliance.isCompliant ? 'Compliant' : 'Non-Compliant' }}
              </span>
              <div v-if="results.compliance.violations.length > 0" class="violations">
                <strong>Violations:</strong>
                <ul>
                  <li v-for="violation in results.compliance.violations" :key="violation">
                    {{ violation }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Locales Section -->
      <section v-if="activeSection === 'locales'" class="section">
        <h2>🌍 Locale Testing</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <div class="help-warning">
            <strong>⚠️ Current Status:</strong> Full locale support is in development. Currently available:
            <ul>
              <li><strong>Phone Validation:</strong> Properly implemented via libphonenumber-js library</li>
              <li><strong>Email/Name/Address:</strong> Basic validation only (locale-specific rules coming soon)</li>
            </ul>
          </div>
          <p>Test phone validation across countries with proper international support:</p>
          <ul>
            <li><strong>Phone Testing:</strong> Each country validates against its actual phone number format</li>
            <li><strong>Expected Behavior:</strong> A Brazilian phone "+55 11 99999-9999" should only validate with Brazil locale</li>
            <li><strong>Cross-validation:</strong> Testing foreign numbers against different locales will show proper validation errors</li>
          </ul>
          <p><em>💡 Example: Try "+55 11 99999-9999" (Brazilian) with Brazil locale vs US locale.</em></p>
        </div>
        
        <div class="test-group">
          <h3>Locale Selection</h3>
          <select v-model="testInputs.selectedLocale" class="input">
            <option v-for="locale in availableLocales" :key="locale.code" :value="locale.code">
              {{ locale.flag }} {{ locale.name }} ({{ locale.code }})
            </option>
          </select>
          <div class="locale-info">
            <p><strong>Note:</strong> Currently showing locales with implemented phone validation support via libphonenumber-js.</p>
            <p><em>Full locale-specific validation rules are planned for future implementation.</em></p>
          </div>
        </div>

        <div class="test-group">
          <h3>Locale-Specific Validation</h3>
          
          <div class="locale-field">
            <h4>Email Validation by Locale</h4>
            <input 
              v-model="testInputs.localeEmail" 
              placeholder="Enter email for selected locale" 
              class="input"
            />
            <button @click="testLocaleEmail" class="btn btn-primary">Test Email ({{ testInputs.selectedLocale }})</button>
            
            <div v-if="results.localeResults && results.localeResults.email" class="locale-field-result">
              <h5>Email Result ({{ testInputs.selectedLocale }}):</h5>
              <div class="locale-comparison">
                <div class="original-value">
                  <strong>Input:</strong> {{ results.localeResults.email.input }}
                </div>
                <div class="validation-result">
                  <span :class="'badge ' + (results.localeResults.email.validation.isValid ? 'badge-success' : 'badge-danger')">
                    {{ results.localeResults.email.validation.isValid ? 'Valid' : 'Invalid' }}
                  </span>
                  <span v-if="results.localeResults.email.validation.suggestions" class="suggestions">
                    Suggestions: {{ results.localeResults.email.validation.suggestions.join(', ') }}
                  </span>
                </div>
                <div v-if="results.localeResults.email.normalized" class="normalized-value">
                  <strong>Normalized:</strong> {{ results.localeResults.email.normalized.normalized }}
                </div>
              </div>
            </div>
          </div>

          <div class="locale-field">
            <h4>Phone Validation by Locale</h4>
            <input 
              v-model="testInputs.localePhone" 
              placeholder="Enter phone for selected locale" 
              class="input"
            />
            <button @click="testLocalePhone" class="btn btn-primary">Test Phone ({{ testInputs.selectedLocale }})</button>
            
            <div v-if="results.localeResults && results.localeResults.phone" class="locale-field-result">
              <h5>Phone Result ({{ testInputs.selectedLocale }}):</h5>
              <div class="locale-comparison">
                <div class="original-value">
                  <strong>Input:</strong> {{ results.localeResults.phone.input }}
                </div>
                <div class="validation-result">
                  <span :class="'badge ' + (results.localeResults.phone.validation.isValid ? 'badge-success' : 'badge-danger')">
                    {{ results.localeResults.phone.validation.isValid ? 'Valid' : 'Invalid' }}
                  </span>
                  <span v-if="results.localeResults.phone.validation.suggestions" class="suggestions">
                    Suggestions: {{ results.localeResults.phone.validation.suggestions.join(', ') }}
                  </span>
                </div>
                <div v-if="results.localeResults.phone.normalized" class="normalized-value">
                  <strong>Normalized:</strong> {{ results.localeResults.phone.normalized.normalized }}
                </div>
              </div>
            </div>
          </div>

          <div class="locale-field">
            <h4>Name Validation by Locale</h4>
            <input 
              v-model="testInputs.localeName" 
              placeholder="Enter name for selected locale" 
              class="input"
            />
            <button @click="testLocaleName" class="btn btn-primary">Test Name ({{ testInputs.selectedLocale }})</button>
            
            <div v-if="results.localeResults && results.localeResults.name" class="locale-field-result">
              <h5>Name Result ({{ testInputs.selectedLocale }}):</h5>
              <div class="locale-comparison">
                <div class="original-value">
                  <strong>Input:</strong> {{ results.localeResults.name.input }}
                </div>
                <div class="validation-result">
                  <span :class="'badge ' + (results.localeResults.name.validation.isValid ? 'badge-success' : 'badge-danger')">
                    {{ results.localeResults.name.validation.isValid ? 'Valid' : 'Invalid' }}
                  </span>
                  <span v-if="results.localeResults.name.validation.suggestions" class="suggestions">
                    Suggestions: {{ results.localeResults.name.validation.suggestions.join(', ') }}
                  </span>
                </div>
                <div v-if="results.localeResults.name.normalized" class="normalized-value">
                  <strong>Normalized:</strong> {{ results.localeResults.name.normalized.normalized }}
                </div>
              </div>
            </div>
          </div>

          <div class="locale-field">
            <h4>Address Validation by Locale</h4>
            <input 
              v-model="testInputs.localeAddress" 
              placeholder="Enter address for selected locale" 
              class="input"
            />
            <button @click="testLocaleAddress" class="btn btn-primary">Test Address ({{ testInputs.selectedLocale }})</button>
            
            <div v-if="results.localeResults && results.localeResults.address" class="locale-field-result">
              <h5>Address Result ({{ testInputs.selectedLocale }}):</h5>
              <div class="locale-comparison">
                <div class="original-value">
                  <strong>Input:</strong> {{ results.localeResults.address.input }}
                </div>
                <div class="validation-result">
                  <span :class="'badge ' + (results.localeResults.address.validation.isValid ? 'badge-success' : 'badge-danger')">
                    {{ results.localeResults.address.validation.isValid ? 'Valid' : 'Invalid' }}
                  </span>
                  <span v-if="results.localeResults.address.validation.errors" class="suggestions">
                    Errors: {{ results.localeResults.address.validation.errors.join(', ') }}
                  </span>
                </div>
                <div v-if="results.localeResults.address.normalized" class="normalized-value">
                  <strong>Normalized:</strong> {{ results.localeResults.address.normalized }}
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="test-group">
          <h3>Cross-Locale Comparison</h3>
          <button @click="testAllLocales" class="btn btn-primary">Test Current Inputs Across All Locales</button>
          <div v-if="results.crossLocale" class="result">
            <h4>Cross-Locale Results:</h4>
            <div class="cross-locale-grid">
              <div v-for="localeResult in results.crossLocale" :key="localeResult.locale" class="cross-locale-item">
                <h5>{{ localeResult.flag }} {{ localeResult.name }}</h5>
                <div class="cross-locale-summary">
                  <div class="metric">
                    <span class="label">Valid Emails:</span>
                    <span :class="'badge ' + (localeResult.emailValid ? 'badge-success' : 'badge-danger')">
                      {{ localeResult.emailValid ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="metric">
                    <span class="label">Valid Phones:</span>
                    <span :class="'badge ' + (localeResult.phoneValid ? 'badge-success' : 'badge-danger')">
                      {{ localeResult.phoneValid ? 'Yes' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Compliance Section -->
      <section v-if="activeSection === 'compliance'" class="section">
        <h2>⚖️ Compliance Engine Testing</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Test compliance with major global privacy regulations and understand their requirements:</p>
          <ul>
            <li><strong>Select a Regulation:</strong> Click on any compliance engine card to test against that regulation</li>
            <li><strong>Data Classification:</strong> Choose the type of data (general, medical, financial, etc.) as rules vary</li>
            <li><strong>Enter Test Data:</strong> Input text containing PII to see compliance analysis</li>
            <li><strong>Review Results:</strong> See compliance status, risk levels, violations, and recommendations</li>
            <li><strong>Verify Laws:</strong> Click the law links in each card to read the official regulations</li>
          </ul>
          <p><em>💡 Try testing medical data against HIPAA vs GDPR to see different requirements.</em></p>
        </div>
        
        <div class="test-group">
          <h3>Compliance Engine Selection</h3>
          <div class="compliance-engines">
            <div 
              v-for="engine in complianceEngines" 
              :key="engine.id"
              @click="testInputs.complianceEngine = engine.id"
              :class="{ active: testInputs.complianceEngine === engine.id }"
              class="engine-card"
            >
              <div class="engine-icon">{{ engine.icon }}</div>
              <div class="engine-info">
                <h4>{{ engine.name }}</h4>
                <p>{{ engine.description }}</p>
                <div class="engine-links">
                  <a :href="engine.link" target="_blank" rel="noopener noreferrer" @click.stop class="link-btn">
                    📖 Learn More
                  </a>
                  <a :href="engine.officialLink" target="_blank" rel="noopener noreferrer" @click.stop class="link-btn official">
                    📜 Official Law Text
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="test-group">
          <h3>Data Type Classification</h3>
          <select v-model="testInputs.complianceDataType" class="input">
            <option v-for="dataType in dataTypes" :key="dataType.id" :value="dataType.id">
              {{ dataType.name }}
            </option>
          </select>
        </div>

        <div class="test-group">
          <h3>Compliance Testing</h3>
          <textarea 
            v-model="testInputs.complianceText" 
            placeholder="Enter text to test against compliance regulations..." 
            class="input textarea"
            rows="4"
          ></textarea>
          <button @click="testComplianceEngine" class="btn btn-primary">
            Test Against {{ complianceEngines.find(e => e.id === testInputs.complianceEngine)?.name }}
          </button>
          
          <div v-if="results.complianceResults" class="result">
            <h4>Compliance Analysis Results:</h4>
            <div class="compliance-analysis">
              <div class="compliance-header">
                <span class="engine-badge">
                  {{ complianceEngines.find(e => e.id === testInputs.complianceEngine)?.icon }}
                  {{ complianceEngines.find(e => e.id === testInputs.complianceEngine)?.name }}
                </span>
                <span class="data-type-badge">{{ dataTypes.find(d => d.id === testInputs.complianceDataType)?.name }}</span>
              </div>
              
              <div class="compliance-metrics">
                <div class="metric-card">
                  <h5>Overall Compliance</h5>
                  <span :class="'badge badge-large ' + (results.complianceResults.compliant ? 'badge-success' : 'badge-danger')">
                    {{ results.complianceResults.compliant ? 'Compliant' : 'Non-Compliant' }}
                  </span>
                </div>
                
                <div class="metric-card">
                  <h5>Risk Level</h5>
                  <span :class="'badge badge-large badge-' + results.complianceResults.riskLevel">
                    {{ results.complianceResults.riskLevel?.toUpperCase() }}
                  </span>
                </div>
                
                <div class="metric-card">
                  <h5>Data Subjects Affected</h5>
                  <span class="metric-value">{{ results.complianceResults.dataSubjects }}</span>
                </div>
              </div>

              <div v-if="results.complianceResults.violations.length > 0" class="violations-section">
                <h5>Compliance Violations:</h5>
                <ul class="violations-list">
                  <li v-for="violation in results.complianceResults.violations" :key="violation.id" class="violation-item">
                    <span class="violation-type">{{ violation.type }}</span>
                    <span class="violation-description">{{ violation.description }}</span>
                    <span class="violation-severity badge" :class="'badge-' + violation.severity">
                      {{ violation.severity }}
                    </span>
                  </li>
                </ul>
              </div>

              <div class="recommendations-section">
                <h5>Recommendations:</h5>
                <ul class="recommendations-list">
                  <li v-for="rec in results.complianceResults.recommendations" :key="rec">
                    {{ rec }}
                  </li>
                </ul>
              </div>

              <div class="processed-output">
                <h5>Compliance-Safe Output:</h5>
                <div class="text-box">{{ results.complianceResults.processedText }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="test-group">
          <h3>Cross-Compliance Comparison</h3>
          <button @click="testAllCompliance" class="btn btn-primary">Test Against All Compliance Engines</button>
          <div v-if="results.crossCompliance" class="result">
            <h4>Cross-Compliance Results:</h4>
            <div class="cross-compliance-grid">
              <div v-for="compResult in results.crossCompliance" :key="compResult.engine" class="cross-compliance-item">
                <div class="compliance-item-header">
                  <span class="engine-icon">{{ compResult.icon }}</span>
                  <h5>{{ compResult.name }}</h5>
                </div>
                <div class="compliance-summary">
                  <span :class="'badge ' + (compResult.compliant ? 'badge-success' : 'badge-danger')">
                    {{ compResult.compliant ? 'Compliant' : 'Non-Compliant' }}
                  </span>
                  <span :class="'badge badge-' + compResult.riskLevel">
                    {{ compResult.riskLevel?.toUpperCase() }} Risk
                  </span>
                  <div class="violations-count">
                    {{ compResult.violationsCount }} violations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pipeline Section -->
      <section v-if="activeSection === 'pipeline'" class="section">
        <h2>🔄 Complete Pipeline</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Test the complete end-to-end PII processing workflow:</p>
          <ul>
            <li><strong>Enter Complex Text:</strong> Use text containing multiple types of PII (names, emails, phones, addresses)</li>
            <li><strong>View Step-by-Step Results:</strong>
              <ul style="margin-left: 1rem; margin-top: 0.5rem;">
                <li><em>Step 1:</em> PII Detection - What was found and with what confidence</li>
                <li><em>Step 2:</em> Masked Output - Safe for displaying in user interfaces</li>
                <li><em>Step 3:</em> Redacted Output - Safe for logging and storage</li>
                <li><em>Step 4:</em> Policy Violations - Any compliance issues detected</li>
              </ul>
            </li>
            <li><strong>Real-World Simulation:</strong> See how privakit would handle actual business data</li>
          </ul>
          <p><em>💡 Example: "Contact John Smith at john@company.com, phone (555) 987-6543, address 123 Main St."</em></p>
        </div>
        
        <div class="test-group">
          <h3>End-to-End Processing</h3>
          <textarea 
            v-model="testInputs.pipelineText" 
            placeholder="Enter complex text with multiple PII types..." 
            class="input textarea"
            rows="6"
          ></textarea>
          <button @click="testCompletePipeline" class="btn btn-primary">Process Pipeline</button>
          <div v-if="results.pipeline" class="result">
            <h4>Pipeline Results:</h4>
            <div class="pipeline-results">
              <div class="step">
                <h5>1. Detection</h5>
                <div class="step-content">
                  <span :class="'badge ' + (results.pipeline.detection.hasPII ? 'badge-danger' : 'badge-success')">
                    {{ results.pipeline.detection.hasPII ? 'PII Found' : 'Clean' }}
                  </span>
                  <span class="badge badge-info">{{ results.pipeline.detection.detectedTypes.join(', ') }}</span>
                </div>
              </div>
              
              <div class="step">
                <h5>2. Masked Output (for UI)</h5>
                <div class="text-box">{{ results.pipeline.masked }}</div>
              </div>
              
              <div class="step">
                <h5>3. Redacted Output (for logs)</h5>
                <div class="text-box">{{ results.pipeline.redacted }}</div>
              </div>
              
              <div v-if="results.pipeline.policyViolations.length > 0" class="step">
                <h5>4. Policy Violations</h5>
                <ul class="violations">
                  <li v-for="violation in results.pipeline.policyViolations" :key="violation">
                    {{ violation }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Examples Section -->
      <section v-if="activeSection === 'examples'" class="section">
        <h2>💡 Examples & Use Cases</h2>
        <div class="section-help">
          <h3>How to Use This Section:</h3>
          <p>Explore real-world scenarios and see how privakit handles common business situations:</p>
          <ul>
            <li><strong>Pre-built Scenarios:</strong> Each card contains realistic business data examples</li>
            <li><strong>One-Click Testing:</strong> Click "Run Example" to see complete processing results</li>
            <li><strong>Learn from Results:</strong> Study the JSON output to understand how each PII type is handled</li>
            <li><strong>Copy Patterns:</strong> Use these examples as templates for your own testing</li>
          </ul>
          <p><em>💡 These examples demonstrate typical use cases: customer support, compliance requests, and data research.</em></p>
        </div>
        
        <div class="examples-grid">
          <div class="example-card" v-for="example in examples" :key="example.title">
            <h3>{{ example.title }}</h3>
            <p>{{ example.description }}</p>
            <div class="example-input">
              <strong>Input:</strong>
              <code>{{ example.input }}</code>
            </div>
            <button @click="runExample(example)" class="btn btn-secondary">Run Example</button>
            <div v-if="example.result" class="example-result">
              <strong>Result:</strong>
              <pre>{{ JSON.stringify(example.result, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // State
    const activeSection = ref('validation')
    const policyMode = ref('permissive')
    const selectedOperations = ref(['display'])
    
    const sections = [
      { id: 'validation', name: 'Validation' },
      { id: 'detection', name: 'Detection' },
      { id: 'masking', name: 'Masking' },
      { id: 'policy', name: 'Policy' },
      { id: 'locales', name: 'Locales' },
      { id: 'compliance', name: 'Compliance' },
      { id: 'pipeline', name: 'Pipeline' },
      { id: 'examples', name: 'Examples' }
    ]

    const operations = ['display', 'store', 'process', 'transfer']

    // Only include locales that have actual implementation
    // Currently only phone validation has proper international support via libphonenumber-js
    const locales = [
      { code: 'US', name: 'United States', flag: '🇺🇸', implemented: true },
      { code: 'BR', name: 'Brazil', flag: '🇧🇷', implemented: true },
      { code: 'CA', name: 'Canada', flag: '🇨🇦', implemented: true },
      { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', implemented: true },
      { code: 'DE', name: 'Germany', flag: '🇩🇪', implemented: true },
      // These are placeholders - locale-specific rules not yet implemented
      { code: 'FR', name: 'France', flag: '🇫🇷', implemented: false },
      { code: 'JP', name: 'Japan', flag: '🇯🇵', implemented: false },
      { code: 'AU', name: 'Australia', flag: '🇦🇺', implemented: false },
      { code: 'IT', name: 'Italy', flag: '🇮🇹', implemented: false },
      { code: 'ES', name: 'Spain', flag: '🇪🇸', implemented: false }
    ]
    
    // Filter to only show implemented locales for now
    const availableLocales = locales.filter(locale => locale.implemented)

    const complianceEngines = [
      { 
        id: 'gdpr', 
        name: 'GDPR (EU)', 
        description: 'General Data Protection Regulation - European Union',
        icon: '🇪🇺',
        link: 'https://gdpr.eu/what-is-gdpr/',
        officialLink: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj'
      },
      { 
        id: 'lgpd', 
        name: 'LGPD (Brazil)', 
        description: 'Lei Geral de Proteção de Dados - Brazil',
        icon: '🇧🇷',
        link: 'https://www.gov.br/anpd/pt-br',
        officialLink: 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm'
      },
      { 
        id: 'hipaa', 
        name: 'HIPAA (US)', 
        description: 'Health Insurance Portability and Accountability Act - USA',
        icon: '🏥',
        link: 'https://www.hhs.gov/hipaa/index.html',
        officialLink: 'https://www.govinfo.gov/content/pkg/PLAW-104publ191/html/PLAW-104publ191.htm'
      },
      { 
        id: 'ccpa', 
        name: 'CCPA (California)', 
        description: 'California Consumer Privacy Act - USA',
        icon: '🏛️',
        link: 'https://oag.ca.gov/privacy/ccpa',
        officialLink: 'https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=3.&part=4.&lawCode=CIV&title=1.81.5.'
      },
      { 
        id: 'pipeda', 
        name: 'PIPEDA (Canada)', 
        description: 'Personal Information Protection and Electronic Documents Act',
        icon: '🇨🇦',
        link: 'https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/P-8.6/'
      },
      { 
        id: 'privacy_act', 
        name: 'Privacy Act (Australia)', 
        description: 'Australian Privacy Principles',
        icon: '🇦🇺',
        link: 'https://www.oaic.gov.au/privacy/the-privacy-act',
        officialLink: 'https://www.legislation.gov.au/C2004A03712/latest/text'
      }
    ]

    const dataTypes = [
      { id: 'general', name: 'General Personal Data' },
      { id: 'medical', name: 'Medical/Health Data' },
      { id: 'financial', name: 'Financial Data' },
      { id: 'biometric', name: 'Biometric Data' },
      { id: 'sensitive', name: 'Sensitive Personal Data' },
      { id: 'children', name: 'Children\'s Data' }
    ]

    const testInputs = reactive({
      email: 'test@example.com',
      phone: '+1-555-123-4567',
      phoneCountry: 'US',
      name: 'John Doe',
      textToAnalyze: 'Contact John Doe at john.doe@email.com or call (555) 123-4567',
      textToMask: 'My email is john@example.com and my phone is +1-555-123-4567. My SSN is 555-55-5555.',
      emailToMask: 'john.doe@example.com',
      phoneToMask: '+1-555-123-4567',
      creditCardToMask: '4111111111111111',
      piiType: 'email',
      pipelineText: 'Please contact John Smith at john.smith@company.com or call him at (555) 987-6543. His address is 123 Main St, Anytown, NY 12345.',
      // Locale testing inputs
      selectedLocale: 'US',
      localeEmail: 'joão.silva@exemplo.com.br',
      localePhone: '+55 11 99999-9999',
      localeName: 'José da Silva',
      localeAddress: 'Rua das Flores, 123, São Paulo, SP',
      // Compliance testing inputs
      complianceEngine: 'gdpr',
      complianceText: 'Patient John Smith, SSN: 987-65-4321, visited on 2024-01-15. Contact: john@email.com, Phone: (555) 123-4567',
      complianceDataType: 'medical'
    })

    const results = reactive({
      email: null,
      phone: null,
      name: null,
      detection: null,
      masking: null,
      emailMask: null,
      phoneMask: null,
      creditCardMask: null,
      compliance: null,
      pipeline: null,
      // Locale results
      localeResults: null,
      // Compliance results
      complianceResults: null
    })

    const examples = reactive([
      {
        title: 'Customer Support Log',
        description: 'Processing customer support conversation with PII',
        input: 'Customer Jane Smith (jane@email.com) called about her order. Phone: (555) 123-4567',
        result: null
      },
      {
        title: 'GDPR Data Request',
        description: 'Handling GDPR compliance for data subject request',
        input: 'Process deletion request for user: john.doe@example.com, phone: +44 20 7946 0958',
        result: null
      },
      {
        title: 'Medical Record',
        description: 'Anonymizing medical data for research',
        input: 'Patient: Mary Johnson, DOB: 1980-05-15, SSN: 555-12-3456, Contact: mary.j@email.com',
        result: null
      }
    ])

    let privakit = null
    let policyEngine = null

    // Methods
    const loadPrivakit = async () => {
      try {
        privakit = await import('privakit')
        policyEngine = privakit.createPolicyEngine(policyMode.value)
        console.log('Privakit loaded successfully:', privakit)
      } catch (error) {
        console.error('Failed to load Privakit:', error)
        alert('Failed to load Privakit. Make sure it\'s installed by running the package script.')
      }
    }

    const updatePolicyEngine = () => {
      if (privakit) {
        policyEngine = privakit.createPolicyEngine(policyMode.value)
      }
    }

    const testEmailValidation = () => {
      if (!privakit) return
      const validation = privakit.processEmail(testInputs.email)
      results.email = validation
    }

    const testPhoneValidation = () => {
      if (!privakit) return
      const validation = privakit.processPhone(testInputs.phone, {
        validation: { defaultCountry: testInputs.phoneCountry }
      })
      results.phone = validation
    }

    const testNameValidation = () => {
      if (!privakit) return
      const validation = privakit.processName(testInputs.name)
      results.name = validation
    }

    const testPIIDetection = () => {
      if (!privakit) return
      const detection = privakit.detectPII(testInputs.textToAnalyze)
      results.detection = detection
    }

    const testMasking = () => {
      if (!privakit) return
      const processed = privakit.processPII(testInputs.textToMask, {
        policy: policyEngine
      })
      results.masking = processed
    }

    const testEmailMasking = () => {
      if (!privakit) return
      const masked = privakit.maskEmail(testInputs.emailToMask)
      results.emailMask = masked.masked
    }

    const testPhoneMasking = () => {
      if (!privakit) return
      const masked = privakit.maskPhone(testInputs.phoneToMask)
      results.phoneMask = masked.masked
    }

    const testCreditCardMasking = () => {
      if (!privakit) return
      const masked = privakit.maskCreditCard(testInputs.creditCardToMask)
      results.creditCardMask = masked.masked
    }

    const testCompliance = () => {
      if (!privakit || !policyEngine) return
      const processor = privakit.createPIIProcessor({ policyEngine })
      const compliance = processor.validateCompliance(testInputs.piiType, selectedOperations.value)
      results.compliance = compliance
    }

    const testCompletePipeline = () => {
      if (!privakit) return
      const processed = privakit.processPII(testInputs.pipelineText, {
        policy: policyEngine
      })
      results.pipeline = processed
    }

    const runExample = (example) => {
      if (!privakit) return
      const processed = privakit.processPII(example.input, {
        policy: policyEngine
      })
      example.result = processed
    }

    // Locale testing methods
    const testLocaleEmail = () => {
      if (!privakit) return
      const localeOptions = { locale: testInputs.selectedLocale }
      const validation = privakit.processEmail(testInputs.localeEmail, { validation: localeOptions })
      
      if (!results.localeResults) results.localeResults = {}
      results.localeResults.email = {
        input: testInputs.localeEmail,
        validation: validation.validation,
        normalized: validation.normalized
      }
    }

    const testLocalePhone = () => {
      if (!privakit) return
      const localeOptions = { defaultCountry: testInputs.selectedLocale }
      const validation = privakit.processPhone(testInputs.localePhone, { validation: localeOptions })
      
      if (!results.localeResults) results.localeResults = {}
      results.localeResults.phone = {
        input: testInputs.localePhone,
        validation: validation.validation,
        normalized: validation.normalized
      }
    }

    const testLocaleName = () => {
      if (!privakit) return
      const localeOptions = { locale: testInputs.selectedLocale }
      const validation = privakit.processName(testInputs.localeName, { validation: localeOptions })
      
      if (!results.localeResults) results.localeResults = {}
      results.localeResults.name = {
        input: testInputs.localeName,
        validation: validation.validation,
        normalized: validation.normalized
      }
    }

    const testLocaleAddress = () => {
      if (!privakit) return
      const localeOptions = { defaultCountry: testInputs.selectedLocale }
      try {
        const validation = privakit.validateAddress(testInputs.localeAddress, localeOptions)
        
        if (!results.localeResults) results.localeResults = {}
        results.localeResults.address = {
          input: testInputs.localeAddress,
          validation: validation,
          normalized: null // Address normalization might not be available
        }
      } catch (error) {
        if (!results.localeResults) results.localeResults = {}
        results.localeResults.address = {
          input: testInputs.localeAddress,
          validation: { isValid: false, errors: [error.message] },
          normalized: null
        }
      }
    }

    const testAllLocales = () => {
      if (!privakit) return
      const crossLocaleResults = []
      
      for (const locale of availableLocales) {
        try {
          const emailValid = privakit.validateEmail(testInputs.localeEmail, { locale: locale.code }).isValid
          const phoneValid = privakit.validatePhone(testInputs.localePhone, { defaultCountry: locale.code }).isValid
          
          crossLocaleResults.push({
            locale: locale.code,
            name: locale.name,
            flag: locale.flag,
            emailValid,
            phoneValid
          })
        } catch (error) {
          crossLocaleResults.push({
            locale: locale.code,
            name: locale.name,
            flag: locale.flag,
            emailValid: false,
            phoneValid: false,
            error: error.message
          })
        }
      }
      
      results.crossLocale = crossLocaleResults
    }

    // Compliance testing methods
    const testComplianceEngine = () => {
      if (!privakit) return
      
      // Simulate compliance testing based on selected engine and data type
      const engine = complianceEngines.find(e => e.id === testInputs.complianceEngine)
      const dataType = dataTypes.find(d => d.id === testInputs.complianceDataType)
      
      // Detect PII first
      const detection = privakit.detectPII(testInputs.complianceText)
      
      // Create mock compliance results based on engine type
      const violations = []
      let compliant = true
      let riskLevel = 'low'
      
      if (detection.hasPII) {
        // GDPR specific rules
        if (testInputs.complianceEngine === 'gdpr') {
          if (testInputs.complianceDataType === 'medical' || testInputs.complianceDataType === 'biometric') {
            violations.push({
              id: 'gdpr-special-category',
              type: 'Special Category Data',
              description: 'Processing special category data requires explicit consent and additional safeguards',
              severity: 'high'
            })
            riskLevel = 'high'
            compliant = false
          }
          if (detection.detectedTypes.includes('email') && testInputs.complianceDataType === 'children') {
            violations.push({
              id: 'gdpr-children',
              type: 'Children\'s Data',
              description: 'Processing children\'s data requires parental consent',
              severity: 'high'
            })
            riskLevel = 'high'
            compliant = false
          }
        }
        
        // HIPAA specific rules
        if (testInputs.complianceEngine === 'hipaa') {
          if (testInputs.complianceDataType === 'medical') {
            violations.push({
              id: 'hipaa-phi',
              type: 'Protected Health Information',
              description: 'PHI detected without proper safeguards',
              severity: 'high'
            })
            riskLevel = 'high'
            compliant = false
          }
        }
        
        // LGPD specific rules
        if (testInputs.complianceEngine === 'lgpd') {
          if (testInputs.complianceDataType === 'sensitive') {
            violations.push({
              id: 'lgpd-sensitive',
              type: 'Sensitive Personal Data',
              description: 'Processing sensitive data requires specific legal basis',
              severity: 'medium'
            })
            riskLevel = 'medium'
            compliant = false
          }
        }
      }
      
      // Process text for compliance
      const processed = privakit.processPII(testInputs.complianceText, {
        policy: policyEngine
      })
      
      results.complianceResults = {
        engine: testInputs.complianceEngine,
        dataType: testInputs.complianceDataType,
        compliant,
        riskLevel,
        dataSubjects: detection.spans.filter(s => s.type === 'name').length || 1,
        violations,
        recommendations: [
          'Implement data minimization principles',
          'Ensure proper consent mechanisms',
          'Add encryption for data in transit and at rest',
          'Establish data retention policies',
          'Implement access controls and audit logs'
        ],
        processedText: processed.redacted,
        originalDetection: detection
      }
    }

    const testAllCompliance = () => {
      if (!privakit) return
      const crossComplianceResults = []
      
      for (const engine of complianceEngines) {
        // Simulate compliance check for each engine
        const detection = privakit.detectPII(testInputs.complianceText)
        
        let compliant = true
        let riskLevel = 'low'
        let violationsCount = 0
        
        if (detection.hasPII) {
          switch (engine.id) {
            case 'gdpr':
              riskLevel = 'medium'
              violationsCount = testInputs.complianceDataType === 'medical' ? 2 : 1
              compliant = testInputs.complianceDataType !== 'medical'
              break
            case 'hipaa':
              riskLevel = testInputs.complianceDataType === 'medical' ? 'high' : 'low'
              violationsCount = testInputs.complianceDataType === 'medical' ? 3 : 0
              compliant = testInputs.complianceDataType !== 'medical'
              break
            case 'lgpd':
              riskLevel = 'medium'
              violationsCount = 1
              compliant = false
              break
            case 'ccpa':
              riskLevel = 'low'
              violationsCount = detection.detectedTypes.includes('email') ? 1 : 0
              compliant = !detection.detectedTypes.includes('email')
              break
            default:
              riskLevel = 'medium'
              violationsCount = 1
              compliant = false
          }
        }
        
        crossComplianceResults.push({
          engine: engine.id,
          name: engine.name,
          icon: engine.icon,
          compliant,
          riskLevel,
          violationsCount
        })
      }
      
      results.crossCompliance = crossComplianceResults
    }

    // Lifecycle
    onMounted(() => {
      loadPrivakit()
    })

    return {
      activeSection,
      policyMode,
      selectedOperations,
      sections,
      operations,
      locales,
      complianceEngines,
      dataTypes,
      testInputs,
      results,
      examples,
      availableLocales,
      testEmailValidation,
      testPhoneValidation,
      testNameValidation,
      testPIIDetection,
      testMasking,
      testEmailMasking,
      testPhoneMasking,
      testCreditCardMasking,
      testCompliance,
      testCompletePipeline,
      runExample,
      updatePolicyEngine,
      // Locale methods
      testLocaleEmail,
      testLocalePhone,
      testLocaleName,
      testLocaleAddress,
      testAllLocales,
      // Compliance methods
      testComplianceEngine,
      testAllCompliance
    }
  }
}
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.nav {
  background: #f8f9fa;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-btn:hover {
  background: #e9ecef;
}

.nav-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.main {
  padding: 2rem;
}

.section h2 {
  color: #495057;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.test-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  border: 1px solid #dee2e6;
}

.test-group h3 {
  margin-top: 0;
  color: #6c757d;
  font-size: 1.25rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-family: inherit;
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.2s;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.result h4 {
  margin-top: 0;
  color: #495057;
}

.result pre {
  background: #f1f3f4;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.4;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
}

.badge-success {
  color: #155724;
  background-color: #d4edda;
}

.badge-danger {
  color: #721c24;
  background-color: #f8d7da;
}

.badge-info {
  color: #0c5460;
  background-color: #d1ecf1;
}

.detection-summary {
  margin-bottom: 1rem;
}

.masking-results, .pipeline-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item, .step {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.text-box {
  background: white;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  font-family: monospace;
  word-break: break-all;
}

.violations {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.field-tests {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-test {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.field-test label {
  min-width: 80px;
  font-weight: 500;
}

.field-test .input {
  flex: 1;
  margin-bottom: 0;
  min-width: 200px;
}

.inline-result {
  font-family: monospace;
  background: #e9ecef;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.policy-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.policy-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.operations {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}

.operations label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.compliance-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step h5 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.step-content {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.example-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.example-card h3 {
  margin-top: 0;
  color: #495057;
}

.example-input {
  margin: 1rem 0;
}

.example-input code {
  display: block;
  background: white;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  word-break: break-all;
}

.example-result {
  margin-top: 1rem;
}

.example-result pre {
  background: white;
  padding: 1rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

/* Section Help Styles */
.section-help {
  background: #e8f4fd;
  border: 1px solid #bee5eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-help h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #0c5460;
  font-size: 1.25rem;
}

.section-help p {
  margin-bottom: 1rem;
  color: #495057;
  line-height: 1.6;
}

.section-help ul {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.section-help li {
  margin-bottom: 0.5rem;
  color: #495057;
  line-height: 1.5;
}

.section-help em {
  color: #6c757d;
  font-style: italic;
}

.help-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.help-warning strong {
  color: #856404;
}

.locale-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  margin-top: 1rem;
}

.locale-info p {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.locale-info p:first-child {
  margin-top: 0;
}

.locale-info p:last-child {
  margin-bottom: 0;
}

/* Engine Links Styles */
.engine-links {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  text-decoration: none;
  border-radius: 0.25rem;
  transition: all 0.2s;
  font-weight: 500;
}

.link-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.link-btn:not(.official) {
  background: #17a2b8;
  color: white;
  border: 1px solid #17a2b8;
}

.link-btn:not(.official):hover {
  background: #138496;
  border-color: #117a8b;
}

.link-btn.official {
  background: #28a745;
  color: white;
  border: 1px solid #28a745;
}

.link-btn.official:hover {
  background: #218838;
  border-color: #1e7e34;
}

/* Locale Section Styles */
.locale-field {
  margin-bottom: 2rem;
}

.locale-field-result {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.locale-field-result h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #495057;
  font-size: 1rem;
}

.locale-field h4 {
  margin-bottom: 0.5rem;
  color: #495057;
}

.locale-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.locale-result-item {
  background: white;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.locale-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.original-value, .validation-result, .normalized-value {
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.original-value {
  background: #f8f9fa;
}

.validation-result {
  background: #e9ecef;
}

.normalized-value {
  background: #d4edda;
}

.suggestions {
  font-size: 0.875rem;
  color: #6c757d;
  margin-left: 0.5rem;
}

.cross-locale-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.cross-locale-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.cross-locale-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 500;
}

/* Compliance Section Styles */
.compliance-engines {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.engine-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.engine-card:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.engine-card.active {
  border-color: #007bff;
  background: #e7f3ff;
}

.engine-icon {
  font-size: 2rem;
  min-width: 2rem;
}

.engine-info h4 {
  margin: 0 0 0.25rem 0;
  color: #495057;
}

.engine-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.compliance-analysis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.compliance-header {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.engine-badge, .data-type-badge {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.engine-badge {
  background: #e7f3ff;
  color: #0056b3;
  border: 1px solid #007bff;
}

.data-type-badge {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

.compliance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: white;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
  text-align: center;
}

.metric-card h5 {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-large {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.badge-low {
  color: #155724;
  background-color: #d4edda;
}

.badge-medium {
  color: #856404;
  background-color: #fff3cd;
}

.badge-high {
  color: #721c24;
  background-color: #f8d7da;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #495057;
}

.violations-section, .recommendations-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.violations-list, .recommendations-list {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.violation-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.25rem;
  border-left: 4px solid #dc3545;
}

.violation-type {
  font-weight: 600;
  color: #495057;
}

.violation-description {
  color: #6c757d;
  font-size: 0.875rem;
}

.violation-severity {
  align-self: flex-start;
  margin-top: 0.25rem;
}

.processed-output {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.cross-compliance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.cross-compliance-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.compliance-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.compliance-item-header h5 {
  margin: 0;
  color: #495057;
}

.compliance-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.violations-count {
  font-size: 0.875rem;
  color: #6c757d;
}

@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .field-test {
    flex-direction: column;
    align-items: stretch;
  }
  
  .field-test .input {
    min-width: auto;
  }
  
  .examples-grid {
    grid-template-columns: 1fr;
  }
  
  .compliance-engines {
    grid-template-columns: 1fr;
  }
  
  .compliance-metrics {
    grid-template-columns: 1fr;
  }
  
  .cross-locale-grid, .cross-compliance-grid {
    grid-template-columns: 1fr;
  }
  
  .engine-card {
    flex-direction: column;
    text-align: center;
  }
  
  .compliance-header {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
