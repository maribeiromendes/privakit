// Test with 555-55-5555 SSN
import { detectPII, PIIType, ConfidenceLevel } from './dist/index.mjs';

// Test SSN detection with 555-55-5555
console.log('=== SSN Test (555-55-5555) ===');
const ssnText = 'My SSN is 555-55-5555 for verification.';
const ssnResult = detectPII(ssnText);
console.log('Has PII:', ssnResult.hasPII);
console.log('Detected types:', ssnResult.detectedTypes);
console.log('Spans count:', ssnResult.spans.length);
console.log('Metadata:', ssnResult.metadata);
if (ssnResult.spans.length > 0) {
  console.log('First span type:', ssnResult.spans[0].type);
  console.log('First span text:', ssnResult.spans[0].text);
  console.log('First span confidence:', ssnResult.spans[0].confidence);
}