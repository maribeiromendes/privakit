// Test with a different SSN that's not in the fake list
import { detectPII, PIIType } from './dist/index.mjs';

// Test SSN detection with a valid SSN that's not in the fake list
console.log('=== SSN Test (valid different) ===');
const ssnText = 'My SSN is 123-45-6788 for verification.';
const ssnResult = detectPII(ssnText);
console.log('Has PII:', ssnResult.hasPII);
console.log('Detected types:', ssnResult.detectedTypes);
console.log('Spans count:', ssnResult.spans.length);
if (ssnResult.spans.length > 0) {
  console.log('First span type:', ssnResult.spans[0].type);
  console.log('First span text:', ssnResult.spans[0].text);
}