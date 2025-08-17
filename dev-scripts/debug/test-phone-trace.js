// Test the exact phone number from the test
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})\b/g;
const text = '(555) 123-4567';
console.log('Testing:', text);
const matches = [...text.matchAll(phoneRegex)];
console.log('Matches:', matches.map(m => m[0]));

// Let's trace through what the regex is matching
console.log('\nTracing regex execution:');
let match;
while ((match = phoneRegex.exec(text)) !== null) {
  console.log('Match found:', match[0]);
  console.log('  Full match:', match[0]);
  console.log('  Group 1 (area code):', match[1]);
  console.log('  Group 2 (exchange):', match[2]);
  console.log('  Group 3 (last 4):', match[3]);
  console.log('  Index:', match.index);
}