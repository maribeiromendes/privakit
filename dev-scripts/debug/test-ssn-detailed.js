// Detailed test of SSN detection
const text = 'My SSN is 123-45-6789 for verification.';
console.log('Text:', text);

// Test the regex directly
const regex = /\b(?!000|666|9\d\d)\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}\b/g;
console.log('Regex:', regex);
const matches = [...text.matchAll(regex)];
console.log('Raw matches:', matches.map(m => m[0]));

// Test each match with the false positive filter
for (const match of matches) {
  const matchedText = match[0];
  console.log('Testing match:', matchedText);
  
  // Apply false positive filters
  const falsePositiveFilters = [
    (match) => {
      const clean = match.replace(/\D/g, '');
      return !['123456789', '987654321'].includes(clean); // Common fake SSNs
    }
  ];
  
  let isValid = true;
  if (falsePositiveFilters) {
    isValid = falsePositiveFilters.every(filter => filter(matchedText));
  }
  
  console.log('Is valid (not filtered):', isValid);
}