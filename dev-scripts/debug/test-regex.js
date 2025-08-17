const text = 'My SSN is 123-45-6789 for verification.';
const regex = /\b(?!000|666|9\d\d)\d{3}-?(?!00)\d{2}-?(?!0000)\d{4}\b/g;
const matches = text.match(regex);
console.log('Matches:', matches);

// Test the false positive filter
const match = '123-45-6789';
const clean = match.replace(/\D/g, '');
const isFiltered = !['123456789', '987654321'].includes(clean);
console.log('Clean:', clean);
console.log('Is filtered (should be true):', isFiltered);