// Test the updated phone false positive filter
console.log('Testing updated phone false positive filter...');

const text = '(555) 123-4567';
console.log('Text:', text);

// Updated false positive filters from the pattern
const filters = [
  (match) => !/^(000|111|222|333|444|666|777|888|999)/.test(match.replace(/\D/g, '')), // Invalid area codes (removed 555)
  (match) => {
    const digits = match.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }
];

console.log('Applying filters...');
const allPass = filters.every(filter => {
  const result = filter(text);
  console.log('  Filter result:', result);
  return result;
});

console.log('All filters pass:', allPass);

// Test with the actual phone number from the text
const cleanDigits = text.replace(/\D/g, '');
console.log('Clean digits:', cleanDigits);
console.log('Clean digits length:', cleanDigits.length);

const firstFilterResult = !/^(000|111|222|333|444|666|777|888|999)/.test(cleanDigits);
console.log('First filter result (should be true):', firstFilterResult);

const secondFilterResult = cleanDigits.length >= 10 && cleanDigits.length <= 11;
console.log('Second filter result (should be true):', secondFilterResult);