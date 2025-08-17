// Test credit card detection
import { detectPII, PIIType } from './dist/index.mjs';

console.log('Testing credit card detection...');

// Test with known test credit card
const text = 'Payment with card 4111111111111111.';
console.log('Text:', text);

const result = detectPII(text);
console.log('Has PII:', result.hasPII);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('Metadata:', result.metadata);
console.log('All spans:', result.spans);