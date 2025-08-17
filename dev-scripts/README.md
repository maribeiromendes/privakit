# Development Scripts

This directory contains development and testing scripts used during Privakit development. These scripts are organized by purpose to help team members quickly find and use the appropriate tools for debugging and testing.

## 📁 Directory Structure

```
dev-scripts/
├── debug/              # Isolated debugging scripts for specific components
├── research/           # Research scripts for improving detection patterns  
├── validation/         # Privacy compliance and dependency validation
├── utils/              # Utility scripts for checking builds and exports
├── test-app/           # Interactive Vue.js test application
├── package-and-install.js # Script to build and install privakit in test app
└── README.md           # This file
```

## 🔍 Debug Scripts (`debug/`)

Scripts for testing and debugging specific PII detection components in isolation.

### Phone Number Testing
- **`test-phone-debug.js`** - Step-by-step phone regex debugging
- **`test-phone-detailed.js/.mjs`** - Comprehensive phone validation testing
- **`test-phone-validation*.mjs`** - Various phone validation scenarios
- **`test-phone-regex.js/.mjs`** - Phone number regex pattern testing
- **`test-phone-minimal.mjs`** - Minimal phone validation test cases
- **`test-phone-isolation.mjs`** - Isolated phone number parsing tests
- **`test-phone-filters.mjs`** - False positive filter testing

### SSN Testing
- **`test-ssn-debug.mjs`** - SSN pattern debugging
- **`test-ssn-detailed.js`** - Detailed SSN validation testing
- **`test-ssn-555.js/.mjs`** - Testing SSN patterns with 555 area codes
- **`test-ssn-valid.mjs`** - Valid SSN format testing

### Credit Card Testing
- **`test-cc-debug.mjs`** - Credit card pattern debugging
- **`test-cc.js`** - Credit card validation testing
- **`test-luhn.js/.mjs`** - Luhn algorithm validation testing

### IP Address Testing
- **`test-ip-debug.mjs`** - IP address pattern debugging
- **`test-ip.js`** - IP address validation testing

### General Detection Testing
- **`test-detection.js/.mjs`** - General PII detection testing
- **`test-detect-multiple.mjs`** - Multi-PII detection testing
- **`test-patterns.js`** - Pattern matching testing
- **`test-regex.js`** - Regex pattern validation
- **`test-multiple-debug.mjs`** - Multiple PII type debugging

## 🔬 Research Scripts (`research/`)

Scripts used for researching and improving PII detection patterns.

- **`research-area-codes.mjs`** - Research on valid phone area codes for improving phone detection accuracy

## ✅ Validation Scripts (`validation/`)

Scripts that ensure privacy compliance and dependency functionality.

- **`test-privacy.js`** - **CRITICAL** - Ensures no external network calls are made (privacy compliance test)
- **`test-simple.js`** - Basic dependency and functionality validation

## 🛠️ Utility Scripts (`utils/`)

Scripts for checking builds, exports, and other development utilities.

- **`check-built-exports.js`** - Validates that built exports match expected API
- **`check-exports.js`** - Checks package export configuration
- **`check-confidence.mjs`** - Validates confidence level constants
- **`test-confidence-values.mjs`** - Tests confidence value calculations
- **`test-count-by-type.mjs`** - Tests PII counting functionality
- **`test-inline.mjs`** - Inline testing utilities

## 🧪 Interactive Test Application (`test-app/`)

A comprehensive Vue.js application for visually testing and demonstrating all privakit functionality.

### Features
- **Real-time Testing Interface** - Interactive forms for testing all privakit functions
- **Visual Results** - Formatted JSON output with color-coded success/error states
- **Educational Content** - Built-in explanations and examples for each feature
- **Compliance Testing** - Test against 6 major privacy regulations (GDPR, LGPD, HIPAA, etc.)
- **Locale Testing** - International validation testing with transparent implementation status
- **Live Documentation** - Links to official privacy regulation texts

### Quick Start
```bash
# From project root - builds privakit and runs test app
npm run dev:test-app

# Manual process
node dev-scripts/package-and-install.js  # Build and install privakit locally
cd dev-scripts/test-app
npm run dev                               # Start Vue dev server
```

### Test App Structure
```
test-app/
├── src/
│   ├── App.vue         # Main application with all testing sections
│   └── main.js         # Vue app bootstrap
├── index.html          # HTML template
├── package.json        # Vue app dependencies
└── vite.config.js      # Vite configuration for Vue
```

### Development Notes
- **Local Package Testing**: Uses `package-and-install.js` to install privakit from local build
- **Hot Reload**: Changes to test app automatically update via Vite HMR
- **Honest Implementation Status**: Clearly shows what's implemented vs planned
- **Privacy Compliance**: All testing done locally, no external API calls

### Contributing to Test App
- **Add New Test Scenarios**: Create realistic examples for testing
- **Improve UX**: Enhance visual feedback and user guidance
- **Documentation**: Add more educational content and examples
- **Deployment**: Help deploy to Vercel, Netlify, or other platforms

## 📦 Package Installation Script

**`package-and-install.js`** - Automated script for local development testing

### What It Does
1. **Builds privakit** using the standard build process
2. **Creates npm package** using `npm pack`
3. **Installs in test app** as if from npm registry
4. **Cleans up** temporary files
5. **Provides feedback** on success/failure

### Usage
```bash
# Run from project root
node dev-scripts/package-and-install.js

# Or use the convenient npm script
npm run dev:test-app
```

### Why This Approach
- **Real Package Testing**: Tests privakit exactly as consumers would use it
- **Dependency Validation**: Ensures all dependencies are properly packaged
- **Export Verification**: Confirms package.json exports work correctly
- **Integration Testing**: Tests the complete package lifecycle

## 🚀 How to Use These Scripts

### Quick Testing
```bash
# Test privacy compliance (IMPORTANT - run before any release)
node dev-scripts/validation/test-privacy.js

# Test basic functionality
node dev-scripts/validation/test-simple.js

# Debug phone number detection
node dev-scripts/debug/test-phone-debug.js

# Check built exports
node dev-scripts/utils/check-built-exports.js
```

### Before Making Changes
1. **Always run privacy test**: `node dev-scripts/validation/test-privacy.js`
2. **Test affected components**: Run relevant debug scripts for components you're modifying
3. **Validate exports**: Run utils scripts to ensure build integrity

### Creating New Debug Scripts
When adding new debug scripts, follow this naming convention:
- `test-[component]-debug.js` - For step-by-step debugging
- `test-[component]-detailed.js` - For comprehensive testing
- `test-[component]-[specific].js` - For specific scenario testing

## 🔒 Privacy & Security Notes

### CRITICAL: Privacy Compliance
- **`validation/test-privacy.js`** is the most important script
- It ensures NO external network calls are made by the library
- **MUST** pass before any release or deployment
- Mocks all network functions to detect violations

### Safe Development Practices
- All scripts should work with sample/fake data only
- Never commit scripts containing real PII data
- Use the provided examples in each script as templates

## 📝 Maintenance Notes

### Keeping Scripts Updated
- Update debug scripts when changing core detection logic
- Add new scripts for new PII types or detection patterns
- Remove obsolete scripts that no longer match current implementation

### File Organization
- Keep scripts focused on single components/issues
- Use descriptive filenames
- Document any complex testing scenarios in script comments

## 🤝 Team Collaboration

### For New Team Members
1. Start with `validation/test-simple.js` to verify your setup
2. Run `validation/test-privacy.js` to understand privacy requirements
3. Explore debug scripts relevant to components you'll be working on

### Before Code Reviews
- Run relevant debug scripts to verify your changes
- Update existing scripts if you modify detection patterns
- Add new debug scripts for new functionality

### Sharing Debug Techniques
- Document useful debugging patterns in script comments
- Create new scripts for recurring debugging scenarios
- Share findings in the main documentation if generally useful

---

## ⚠️ Important Reminders

1. **Never commit real PII data** in these scripts
2. **Always use sample/test data** for testing
3. **Run privacy validation** before any release
4. **Keep scripts organized** and properly named
5. **Document complex scenarios** in script comments

These scripts are valuable development tools - use them to ensure Privakit remains reliable, accurate, and privacy-compliant!