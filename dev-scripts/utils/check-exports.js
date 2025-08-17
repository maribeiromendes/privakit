// Check what's exported from types.js
import * as types from './src/core/types.js';
import * as policy from './src/core/policy.js';

console.log('Types exports:', Object.keys(types));
console.log('Policy exports:', Object.keys(policy));

// Check if PolicyEngine exists in both
console.log('PolicyEngine in types:', 'PolicyEngine' in types);
console.log('PolicyEngine in policy:', 'PolicyEngine' in policy);