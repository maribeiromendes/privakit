// Test the countPIIByType test case
import { countPIIByType, PIIType } from './dist/index.mjs';

console.log('Testing countPIIByType test case...');

const text = 'Emails: john@example.com, jane@test.com. Phone: 555-123-4567';
console.log('Text:', text);

const counts = countPIIByType(text);
console.log('Counts:', counts);

console.log('Email count:', counts[PIIType.Email]);
console.log('Phone count:', counts[PIIType.Phone]);
console.log('SSN count:', counts[PIIType.SSN]);

// Let's also test with detectPII to see what's detected
import { detectPII } from './dist/index.mjs';
const result = detectPII(text);
console.log('Detection result:', result);
console.log('Spans:', result.spans);