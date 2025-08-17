// Test the fixed phone regex
const text = '(555) 123-4567';
console.log('Original text:', text);

// Test the fixed regex
const fixedRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
console.log('Fixed regex:', fixedRegex);
const fixedMatches = [...text.matchAll(fixedRegex)];
console.log('Fixed matches:', fixedMatches.map(m => m[0]));

if (fixedMatches.length > 0) {
  console.log('Match details:');
  const match = fixedMatches[0];
  console.log('  Full match:', match[0]);
  console.log('  Group 1 (area code):', match[1]);
  console.log('  Group 2 (exchange):', match[2]);
  console.log('  Group 3 (last 4):', match[3]);
}