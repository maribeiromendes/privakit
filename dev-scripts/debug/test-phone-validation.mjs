// Test phone validation directly
import { validatePhone } from './dist/index.mjs';

console.log('Testing phone validation directly...');

const phoneNumber = '5551234567';
console.log('Phone number:', phoneNumber);

const result = validatePhone(phoneNumber);
console.log('Validation result:', result);
console.log('Is valid:', result.isValid);
console.log('Is possible:', result.isPossible);