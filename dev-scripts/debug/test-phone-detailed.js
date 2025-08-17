// Test phone regex very carefully
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})\b/g;

// Test on a known good phone number from the examples
const testNumber = '555-123-4567';
console.log('Testing:', testNumber);
const matches = [...testNumber.matchAll(phoneRegex)];
console.log('Matches:', matches);

// Let's break it down step by step
console.log('\nBreaking down the regex:');
console.log('Full pattern:', phoneRegex.source);

// Test each part:
// 1. (?:\+?1[-.\s]?)? - Optional country code
// 2. \(?([2-9][0-8][0-9])\)? - Area code with optional parens
// 3. [-.\s]? - Optional separator
// 4. ([2-9][0-9]{2}) - Exchange code
// 5. [-.\s]? - Optional separator
// 6. ([0-9]{4}) - Last 4 digits
// 7. \b - Word boundary

// Test area code part: \(?([2-9][0-8][0-9])\)?
console.log('\nTesting area code part:');
const areaCodePart = /\(?([2-9][0-8][0-9])\)?/;
console.log('Area code match:', areaCodePart.exec('(555)'));

// Test exchange code part: ([2-9][0-9]{2})
console.log('\nTesting exchange code part:');
const exchangePart = /([2-9][0-9]{2})/;
console.log('Exchange match:', exchangePart.exec('123'));

// Test last 4 digits part: ([0-9]{4})
console.log('\nTesting last 4 digits part:');
const last4Part = /([0-9]{4})/;
console.log('Last 4 match:', last4Part.exec('4567'));

// Test the whole thing step by step
console.log('\nTesting step by step:');
const step1 = /(?:\+?1[-.\s]?)?/.exec('555-123-4567');
console.log('Step 1 (optional country code):', step1);

const step2 = /\(?([2-9][0-8][0-9])\)?/.exec('555-123-4567');
console.log('Step 2 (area code):', step2);

const step3 = /[-.\s]?([2-9][0-9]{2})/.exec('-123-4567');
console.log('Step 3 (exchange + separator):', step3);

const step4 = /[-.\s]?([0-9]{4})\b/.exec('-4567');
console.log('Step 4 (last 4 + separator + word boundary):', step4);