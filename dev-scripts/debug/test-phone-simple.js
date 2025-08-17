// Test a simpler phone regex
const text = '(555) 123-4567';
console.log('Original text:', text);

// Try a simpler approach that matches the whole phone number at once
const simplePhoneRegex = /\(?\b[2-9][0-8][0-9]\)?[-.\s]?\b[2-9][0-9]{2}[-.\s]?[0-9]{4}\b/g;
console.log('Simple phone regex:', simplePhoneRegex);
const simpleMatches = [...text.matchAll(simplePhoneRegex)];
console.log('Simple matches:', simpleMatches.map(m => m[0]));

// Try an even simpler pattern
const evenSimplerRegex = /\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
console.log('\nEven simpler regex:', evenSimplerRegex);
const evenSimplerMatches = [...text.matchAll(evenSimplerRegex)];
console.log('Even simpler matches:', evenSimplerMatches.map(m => m[0]));

// Test the original complex regex on a simpler string
const simpleText = '5551234567';
console.log('\nTesting on:', simpleText);
const originalRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})\b/g;
const originalMatches = [...simpleText.matchAll(originalRegex)];
console.log('Original regex matches:', originalMatches.map(m => m[0]));