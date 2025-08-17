// Test the IP address from the test
const text = 'Server is running on 192.168.1.100 port 8080.';
const regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
const matches = text.match(regex);
console.log('IP matches:', matches);

// Test the false positive filter
const match = '192.168.1.100';
const parts = match.split('.');
const isValid = parts.every(part => parseInt(part) <= 255);
console.log('IP parts:', parts);
console.log('Is valid IP (should be true):', isValid);