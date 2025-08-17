// Test Luhn check function
import { luhnCheck } from './dist/detect/index.mjs';

console.log('Testing Luhn check...');

const testCards = [
  '4111111111111111', // Known test Visa
  '4012888888881881', // Another test Visa
  '5555555555554444', // Test MasterCard
];

for (const card of testCards) {
  const result = luhnCheck(card);
  console.log(`${card}: ${result}`);
}