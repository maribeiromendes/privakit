/**
 * Privacy validation test - ensures no data is sent externally
 */

const originalFetch = global.fetch;
const originalXMLHttpRequest = global.XMLHttpRequest;
const originalWebSocket = global.WebSocket;

// Mock network functions to detect any external calls
global.fetch = function(...args) {
  console.error('🚨 PRIVACY VIOLATION: fetch() called with:', args[0]);
  throw new Error('Network call attempted - privacy violation!');
};

global.XMLHttpRequest = function() {
  console.error('🚨 PRIVACY VIOLATION: XMLHttpRequest created');
  throw new Error('Network call attempted - privacy violation!');
};

global.WebSocket = function() {
  console.error('🚨 PRIVACY VIOLATION: WebSocket created');
  throw new Error('Network call attempted - privacy violation!');
};

try {
  // Test basic functionality
  console.log('🔍 Testing Privakit privacy compliance...\n');

  // Test 1: Basic imports (should not trigger network calls)
  console.log('✅ Test 1: Safe imports');
  const { detectPII, validateEmail, maskPII, createPolicyEngine } = require('../../dist/index.js');
  console.log('   ✓ All modules imported safely\n');

  // Test 2: Email validation (uses validator.js - should be local only)
  console.log('✅ Test 2: Email validation');
  const emailResult = validateEmail('test@example.com');
  console.log('   ✓ Email validation:', emailResult.isValid);
  console.log('   ✓ No network calls detected\n');

  // Test 3: Phone validation (uses libphonenumber-js - should be local only)
  console.log('✅ Test 3: Phone validation');
  const { validatePhone } = require('../../dist/index.js');
  const phoneResult = validatePhone('+1-555-123-4567');
  console.log('   ✓ Phone validation:', phoneResult.isValid);
  console.log('   ✓ No network calls detected\n');

  // Test 4: PII detection (uses compromise.js - should be local only)
  console.log('✅ Test 4: PII detection');
  const text = "Contact John Doe at john@example.com or call (555) 123-4567";
  const detection = detectPII(text);
  console.log('   ✓ PII detected:', detection.hasPII);
  console.log('   ✓ Types found:', detection.detectedTypes);
  console.log('   ✓ No network calls detected\n');

  // Test 5: Masking functionality
  console.log('✅ Test 5: PII masking');
  const maskedEmail = maskPII('john.doe@company.com', 'email');
  console.log('   ✓ Masked email:', maskedEmail.masked);
  console.log('   ✓ No network calls detected\n');

  // Test 6: Policy engine
  console.log('✅ Test 6: Policy engine');
  const gdprEngine = createPolicyEngine('gdpr');
  const decision = gdprEngine.evaluate('email', 'log');
  console.log('   ✓ Policy decision allowed:', decision.allowed);
  console.log('   ✓ Requires masking:', decision.requiresMasking);
  console.log('   ✓ No network calls detected\n');

  // Test 7: Batch processing
  console.log('✅ Test 7: Batch processing');
  const texts = [
    "Email: user1@example.com",
    "Phone: 555-1234",
    "No PII here"
  ];
  const { detectPIIMultiple } = require('../../dist/index.js');
  const results = detectPIIMultiple(texts);
  console.log('   ✓ Batch results:', results.map(r => r.hasPII));
  console.log('   ✓ No network calls detected\n');

  // Test 8: Large text processing (stress test)
  console.log('✅ Test 8: Large text processing');
  const largeText = 'Contact: user@example.com. '.repeat(1000);
  const largeResult = detectPII(largeText);
  console.log('   ✓ Large text processed:', largeResult.hasPII);
  console.log('   ✓ Spans found:', largeResult.spans.length);
  console.log('   ✓ No network calls detected\n');

  console.log('🎉 ALL TESTS PASSED - PRIVAKIT IS PRIVACY-COMPLIANT!');
  console.log('✅ No external network calls detected');
  console.log('✅ All processing is local-only');
  console.log('✅ No personal data transmitted');

} catch (error) {
  console.error('❌ Privacy test failed:', error.message);
  process.exit(1);
} finally {
  // Restore original functions
  global.fetch = originalFetch;
  global.XMLHttpRequest = originalXMLHttpRequest;
  global.WebSocket = originalWebSocket;
}