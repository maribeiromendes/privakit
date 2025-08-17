// Test phone number false positive filters
const text = '(555) 123-4567';
console.log('Testing phone false positive filters...');
console.log('Text:', text);

// False positive filters from the pattern (updated)
const filters = [
  (match) => !/^(000|111|222|333|444|666|777|888|999)/.test(match.replace(/\D/g, '')), // Invalid area codes (removed 555 which is used in examples)
  (match) => {
    const digits = match.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  }
];

console.log('Applying filters...');
for (let i = 0; i < filters.length; i++) {
  const result = filters[i](text);
  console.log(`Filter ${i + 1}: ${result}`);
  if (!result) {
    console.log(`  Filter ${i + 1} rejected the match`);
  }
}

// Check if all filters pass
const allPass = filters.every(filter => filter(text));
console.log('All filters pass:', allPass);