// Test the actual detection function
import { detectPII, PIIType } from './dist/index.mjs';

// Test SSN detection
console.log('=== SSN Test ===');
const ssnText = 'My SSN is 123-45-6789 for verification.';
const ssnResult = detectPII(ssnText);
console.log('Has PII:', ssnResult.hasPII);
console.log('Detected types:', ssnResult.detectedTypes);
console.log('Spans:', ssnResult.spans);