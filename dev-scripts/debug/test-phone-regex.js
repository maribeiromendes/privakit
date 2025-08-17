// Test phone regex more carefully
const text = 'Call me at (555) 123-4567';
console.log('Text:', text);

// Break down the phone regex
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})\b/g;
console.log('Phone regex:', phoneRegex);

// Test the area code part: [2-9][0-8][0-9]
// This means first digit 2-9, second digit 0-8, third digit 0-9
// So 555 should match: 5[2-9], 5[0-8], 5[0-9]

console.log('Testing area code pattern [2-9][0-8][0-9]:');
console.log('5 in [2-9]?', /[2-9]/.test('5')); // Should be true
console.log('5 in [0-8]?', /[0-8]/.test('5')); // Should be true
console.log('5 in [0-9]?', /[0-9]/.test('5')); // Should be true

// Let's test the full regex step by step
const areaCodeRegex = /([2-9][0-8][0-9])/;
console.log('Area code test:', areaCodeRegex.test('555'));

// Test the full pattern on a simpler phone number
const simpleText = '5551234567';
const simpleMatches = [...simpleText.matchAll(phoneRegex)];
console.log('Simple matches:', simpleMatches.map(m => m[0]));