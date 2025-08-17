// Detailed test of phone number detection
import { detectPII, PIIType, ConfidenceLevel } from './dist/index.mjs';

console.log('Detailed phone number detection test...');

// Test with phone number from failing test
const text = '(555) 123-4567';
console.log('Text:', text);

// Test with very low confidence threshold to see if it passes any filters
const result = detectPII(text, { confidenceThreshold: 0.0 });
console.log('Has PII:', result.hasPII);
console.log('Detected types:', result.detectedTypes);
console.log('Spans count:', result.spans.length);
console.log('Metadata:', result.metadata);
console.log('All spans:', result.spans);

if (result.spans.length > 0) {
  console.log('First span details:');
  console.log('  Type:', result.spans[0].type);
  console.log('  Text:', result.spans[0].text);
  console.log('  Confidence:', result.spans[0].confidence);
  console.log('  Metadata:', result.spans[0].metadata);
}