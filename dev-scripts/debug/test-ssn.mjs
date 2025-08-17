// Test SSN detection
import { detectPII, PIIType } from './dist/index.mjs';

console.log('Testing SSN detection...');

// Test with known good SSN
const text = 'My SSN is 555-55-5555 for verification.';
console.log('Text:', text);

const result = detectPII(text);
console.log('Has PII:', result.hasPII);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('All spans:', result.spans);

if (result.spans.length > 0) {
  console.log('First span:');
  console.log('  Type:', result.spans[0].type);
  console.log('  Text:', result.spans[0].text);
  console.log('  Start:', result.spans[0].start);
  console.log('  End:', result.spans[0].end);
}