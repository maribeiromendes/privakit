// Check what's exported from the built modules
import * as types from './dist/core/types.js';
import * as policy from './dist/core/policy.js';

console.log('Types exports:', Object.keys(types));
console.log('Policy exports:', Object.keys(policy));

// Check if PolicyEngine exists in both
console.log('PolicyEngine in types:', 'PolicyEngine' in types);
console.log('PolicyEngine in policy:', 'PolicyEngine' in policy);