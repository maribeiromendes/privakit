// Test multiple PII detection
import { detectPII, PIIType } from './dist/index.mjs';

console.log('Testing multiple PII detection...');

// Test with text from failing test
const text = 'Contact John Doe at john@example.com or call (555) 123-4567. SSN: 555-55-5555';
console.log('Text:', text);

const result = detectPII(text);
console.log('Has PII:', result.hasPII);
console.log('Detected types count:', result.detectedTypes.length);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('Metadata:', result.metadata);
console.log('All spans:', result.spans);

if (result.spans.length > 0) {
  const types = new Set(result.spans.map(span => span.type));
  console.log('Unique span types:', Array.from(types));
  console.log('Has Email:', types.has(PIIType.Email));
  console.log('Has Phone:', types.has(PIIType.Phone));
  console.log('Has SSN:', types.has(PIIType.SSN));
}