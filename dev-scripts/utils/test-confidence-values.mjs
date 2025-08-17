// Test confidence level numeric values
import { detectPII, ConfidenceLevel } from './dist/index.mjs';

function getConfidenceValue(confidence) {
  switch (confidence) {
    case ConfidenceLevel.VeryHigh: return 0.9;
    case ConfidenceLevel.High: return 0.7;
    case ConfidenceLevel.Medium: return 0.5;
    case ConfidenceLevel.Low: return 0.3;
    default: return 0.3;
  }
}

console.log('VeryHigh value:', getConfidenceValue(ConfidenceLevel.VeryHigh));
console.log('High value:', getConfidenceValue(ConfidenceLevel.High));
console.log('Medium value:', getConfidenceValue(ConfidenceLevel.Medium));
console.log('Low value:', getConfidenceValue(ConfidenceLevel.Low));