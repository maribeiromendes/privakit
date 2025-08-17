// Test phone number detection in isolation
import { detectPII, PIIType } from './dist/index.mjs';

console.log('Testing phone number detection in isolation...');

// Test with phone number from failing test
const text = '(555) 123-4567';
console.log('Text:', text);

const result = detectPII(text);
console.log('Has PII:', result.hasPII);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('Metadata:', result.metadata);
console.log('All spans:', result.spans);