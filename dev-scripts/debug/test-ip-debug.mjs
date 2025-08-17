// Test IP address detection
import { detectPII, PIIType } from './dist/index.mjs';

console.log('Testing IP address detection...');

// Test with known IP address from test
const text = 'Server is running on 192.168.1.100 port 8080.';
console.log('Text:', text);

const result = detectPII(text);
console.log('Has PII:', result.hasPII);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('Metadata:', result.metadata);
console.log('All spans:', result.spans);