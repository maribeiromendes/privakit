// Debug the phone regex step by step
const text = '(555) 123-4567';

console.log('Original text:', text);

// Test the full regex
const fullRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})\b/g;
console.log('Full regex test:', fullRegex.test(text));

// Reset the regex (since test() advances the lastIndex)
fullRegex.lastIndex = 0;

// Test each component
console.log('\nTesting components:');

// 1. Optional country code part: (?:\+?1[-.\s]?)?
const countryPart = /(?:\+?1[-.\s]?)?/;
console.log('Country code part match:', countryPart.exec(text));

// 2. Area code part: \(?([2-9][0-8][0-9])\)? 
const areaPart = /\(?([2-9][0-8][0-9])\)?/;
console.log('Area code part match:', areaPart.exec(text));

// 3. First separator: [-.\s]?
const sep1Part = /[-.\s]?/;
console.log('First separator match:', sep1Part.exec('(555) 123-4567'));

// 4. Exchange code: ([2-9][0-9]{2})
const exchangePart = /([2-9][0-9]{2})/;
console.log('Exchange code match:', exchangePart.exec(' 123-4567'));

// 5. Second separator: [-.\s]?
const sep2Part = /[-.\s]?/;
console.log('Second separator match:', sep2Part.exec(' 123-4567'));

// 6. Last 4 digits: ([0-9]{4})\b
const last4Part = /([0-9]{4})\b/;
console.log('Last 4 digits match:', last4Part.exec(' 123-4567'));