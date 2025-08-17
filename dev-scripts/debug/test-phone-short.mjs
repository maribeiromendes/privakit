// Test why the phone number isn't detected
console.log('Testing why phone number is not detected...');

const shortPhone = '555-1234';
const digits = shortPhone.replace(/\D/g, '');

console.log('Short phone:', shortPhone);
console.log('Digits:', digits);
console.log('Digit count:', digits.length);
console.log('Meets 10+ digit requirement:', digits.length >= 10);

// Test with a longer phone number
const longPhone = '555-123-4567';
const longDigits = longPhone.replace(/\D/g, '');

console.log('\nLong phone:', longPhone);
console.log('Digits:', longDigits);
console.log('Digit count:', longDigits.length);
console.log('Meets 10+ digit requirement:', longDigits.length >= 10);