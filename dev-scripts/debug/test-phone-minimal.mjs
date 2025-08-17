// Minimal test to isolate phone detection issue
import { detectPII } from './dist/index.mjs';

console.log('Minimal phone detection test...');

// Test with simplest possible phone number
const text = '5551234567';
console.log('Text:', text);

const result = detectPII(text, { confidenceThreshold: 0.0 });
console.log('Has PII:', result.hasPII);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('Metadata:', result.metadata);

if (result.spans.length > 0) {
  console.log('First span:', result.spans[0]);
}