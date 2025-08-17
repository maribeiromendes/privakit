// Test pattern matching directly
const text = 'Call me at (555) 123-4567';
console.log('Text:', text);

// Test the phone regex from the source code
const phoneRegex = /(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})\b/g;
console.log('Phone regex:', phoneRegex);
const phoneMatches = [...text.matchAll(phoneRegex)];
console.log('Phone matches:', phoneMatches.map(m => m[0]));

// Test email regex
const emailRegex = /\b[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\b/g;
console.log('Email regex:', emailRegex);
const emailMatches = [...text.matchAll(emailRegex)];
console.log('Email matches:', emailMatches.map(m => m[0]));