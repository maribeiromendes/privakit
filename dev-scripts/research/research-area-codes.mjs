// Research on invalid area codes
console.log('Research on invalid area codes...');

// Commonly blocked area codes in the filter:
// 000, 111, 222, 333, 444, 555, 666, 777, 888, 999

// Actually, 555 is used for fictional/testing purposes:
// - 555-0100 to 555-0199 are reserved for fictional use
// - But 555-01xx is different from 555-1234

// The issue is that the regex is checking if the ENTIRE number starts with these patterns
// For "(555) 123-4567", the digits are "5551234567"
// This DOES start with "555", so it's being rejected

// A better approach would be to check only the area code portion
const phoneNumber = '(555) 123-4567';
const digits = phoneNumber.replace(/\D/g, ''); // "5551234567"
const areaCode = digits.substring(0, 3); // "555"

console.log('Full digits:', digits);
console.log('Area code:', areaCode);

// Check if area code alone triggers the filter
const invalidAreaCodes = /^(000|111|222|333|444|555|666|777|888|999)/;
const isInvalidAreaCode = invalidAreaCodes.test(areaCode);
console.log('Is area code invalid:', isInvalidAreaCode);

// But really, we should be more specific about what's truly invalid
// Area codes that are actually invalid according to NANP:
// - 0XX (starts with 0)
// - 1XX (starts with 1)
// - N9X (second digit is 9) - except for 987, 988, 989 which are reserved
// - XXX (all same digits) - like 555, 888, etc. but some are exceptions

// Actually, the issue is that the filter is too broad
// "555" is used in examples but is technically a valid fictional prefix
// We should refine this filter