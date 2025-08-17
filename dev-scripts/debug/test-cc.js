// Test the credit card number from the test
const cc = '4111111111111111';
console.log('Credit card:', cc);

// Test Luhn check
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

console.log('Luhn check result:', luhnCheck(cc));

// Test the regex
const regex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;
const text = 'Payment with card 4111111111111111.';
const matches = text.match(regex);
console.log('Credit card matches:', matches);