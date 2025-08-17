// Test phone detection
import { detectPII, PIIType, ConfidenceLevel } from './dist/index.mjs';

// Test phone detection
console.log('=== Phone Test ===');
const phoneText = 'Call me at (555) 123-4567';
const phoneResult = detectPII(phoneText);
console.log('Has PII:', phoneResult.hasPII);
console.log('Detected types:', phoneResult.detectedTypes);
console.log('Spans count:', phoneResult.spans.length);
console.log('Metadata:', phoneResult.metadata);
if (phoneResult.spans.length > 0) {
  console.log('First span type:', phoneResult.spans[0].type);
  console.log('First span text:', phoneResult.spans[0].text);
  console.log('First span confidence:', phoneResult.spans[0].confidence);
}