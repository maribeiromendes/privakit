// Test detectPIIMultiple function
import { detectPIIMultiple, PIIType } from './dist/index.mjs';

console.log('Testing detectPIIMultiple function...');

const texts = [
  'Email: user1@example.com',
  'Phone: 555-123-4567',
  'No PII here'
];

console.log('Texts:', texts);

const results = detectPIIMultiple(texts);

console.log('Results length:', results.length);
console.log('Results:', results);

for (let i = 0; i < results.length; i++) {
  console.log(`\nResult ${i}:`);
  console.log('  Has PII:', results[i].hasPII);
  console.log('  Detected types:', results[i].detectedTypes);
  console.log('  Spans count:', results[i].spans.length);
}