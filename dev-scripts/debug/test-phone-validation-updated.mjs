// Test the updated phone validation logic
console.log('Testing updated phone validation logic...');

const text = '(555) 123-4567';
console.log('Text:', text);

// Test digit count
const digits = text.replace(/\D/g, '');
console.log('Digits:', digits);
console.log('Digit count:', digits.length);
console.log('Has 10+ digits:', digits.length >= 10);

// Test if this would pass the updated validation
const wouldPassAdditionalValidation = digits.length >= 10;
const confidence = wouldPassAdditionalValidation ? 'medium' : 'low';
console.log('Would pass additional validation:', wouldPassAdditionalValidation);
console.log('Assigned confidence:', confidence);
console.log('Confidence threshold:', 0.7);

// Compare confidence values
const confidenceValues = {
  low: 0.3,
  medium: 0.5,
  high: 0.7,
  very_high: 0.9
};

console.log('Actual confidence value:', confidenceValues[confidence]);
console.log('Would pass threshold:', confidenceValues[confidence] >= 0.7);