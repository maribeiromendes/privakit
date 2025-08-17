// Test Luhn check implementation
function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let alternate = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i));
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

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