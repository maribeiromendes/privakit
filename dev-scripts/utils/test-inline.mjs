// Simple inline test
console.log('Simple inline test...');

// Test the regex directly
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
const text = '(555) 123-4567';
console.log('Text:', text);
console.log('Regex:', phoneRegex);

const matches = [...text.matchAll(phoneRegex)];
console.log('Matches found:', matches.length);
if (matches.length > 0) {
  console.log('First match:', matches[0][0]);
}