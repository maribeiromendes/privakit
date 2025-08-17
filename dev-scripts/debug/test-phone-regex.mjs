// Test phone number regex directly
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
const text = '(555) 123-4567';

console.log('Testing phone regex directly...');
console.log('Text:', text);
console.log('Regex:', phoneRegex);

const matches = [...text.matchAll(phoneRegex)];
console.log('Matches found:', matches.length);
console.log('All matches:', matches);

if (matches.length > 0) {
  console.log('First match:', matches[0]);
  console.log('Full match:', matches[0][0]);
  if (matches[0].index !== undefined) {
    console.log('Index:', matches[0].index);
  }
}