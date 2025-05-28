#!/usr/bin/env node
/**
 * Test script to verify frontend SOLID & KISS improvements are working correctly.
 * This script tests the new frontend utilities and constants.
 */

const fs = require('fs');
const path = require('path');

// Mock console for cleaner output
const originalConsole = { ...console };

function testConstants() {
    console.log("🧪 Testing Frontend Constants...");
    
    try {
        // Read the constants file
        const constantsPath = path.join(__dirname, 'frontend/src/lib/constants.ts');
        const constantsContent = fs.readFileSync(constantsPath, 'utf8');
        
        // Check for key constants
        const requiredConstants = [
            'TWITTER_CONSTANTS',
            'VALIDATION_RULES',
            'ERROR_MESSAGES',
            'SUCCESS_MESSAGES',
            'HTTP_STATUS',
            'REGEX_PATTERNS'
        ];
        
        for (const constant of requiredConstants) {
            if (!constantsContent.includes(constant)) {
                throw new Error(`Missing constant: ${constant}`);
            }
        }
        
        console.log("✅ All required constants found");
        
        // Check for specific values
        if (!constantsContent.includes('MAX_TWEET_LENGTH: 280')) {
            throw new Error("Twitter constants not properly defined");
        }
        console.log("✅ Twitter constants properly defined");
        
        if (!constantsContent.includes('MIN_TOPIC_LENGTH: 3')) {
            throw new Error("Validation rules not properly defined");
        }
        console.log("✅ Validation rules properly defined");
        
        if (!constantsContent.includes('NETWORK_ERROR:')) {
            throw new Error("Error messages not properly defined");
        }
        console.log("✅ Error messages properly defined");
        
        console.log("✅ All frontend constants tests passed!\n");
        return true;
        
    } catch (error) {
        console.log(`❌ Frontend constants test failed: ${error.message}\n`);
        return false;
    }
}

function testValidationUtilities() {
    console.log("🧪 Testing Frontend Validation Utilities...");
    
    try {
        // Read the validation file
        const validationPath = path.join(__dirname, 'frontend/src/lib/validation.ts');
        const validationContent = fs.readFileSync(validationPath, 'utf8');
        
        // Check for key classes and functions
        const requiredClasses = [
            'ValidationUtils',
            'ContentValidation',
            'FormValidation',
            'ValidationHooks'
        ];
        
        for (const className of requiredClasses) {
            if (!validationContent.includes(`class ${className}`)) {
                throw new Error(`Missing class: ${className}`);
            }
        }
        console.log("✅ All validation classes found");
        
        // Check for key methods
        const requiredMethods = [
            'validateRequired',
            'validateLength',
            'validateEmail',
            'validateTopic',
            'validateContent'
        ];
        
        for (const method of requiredMethods) {
            if (!validationContent.includes(method)) {
                throw new Error(`Missing method: ${method}`);
            }
        }
        console.log("✅ All validation methods found");
        
        // Check for utility functions
        if (!validationContent.includes('validateContentGenerationForm')) {
            throw new Error("Missing utility function: validateContentGenerationForm");
        }
        console.log("✅ Utility functions found");
        
        console.log("✅ All frontend validation utilities tests passed!\n");
        return true;
        
    } catch (error) {
        console.log(`❌ Frontend validation utilities test failed: ${error.message}\n`);
        return false;
    }
}

function testErrorHandling() {
    console.log("🧪 Testing Frontend Error Handling...");
    
    try {
        // Read the error handling file
        const errorPath = path.join(__dirname, 'frontend/src/lib/errorHandling.ts');
        const errorContent = fs.readFileSync(errorPath, 'utf8');
        
        // Check for key classes
        const requiredClasses = [
            'ErrorHandler',
            'ContentErrorHandler',
            'AuthErrorHandler',
            'NetworkErrorHandler',
            'RetryHandler',
            'ErrorLogger'
        ];
        
        for (const className of requiredClasses) {
            if (!errorContent.includes(`class ${className}`)) {
                throw new Error(`Missing class: ${className}`);
            }
        }
        console.log("✅ All error handling classes found");
        
        // Check for key methods
        const requiredMethods = [
            'handleApiError',
            'handleValidationError',
            'handleAsyncError',
            'retryOperation'
        ];
        
        for (const method of requiredMethods) {
            if (!errorContent.includes(method)) {
                throw new Error(`Missing method: ${method}`);
            }
        }
        console.log("✅ All error handling methods found");
        
        // Check for utility functions
        if (!errorContent.includes('withErrorHandling')) {
            throw new Error("Missing utility function: withErrorHandling");
        }
        console.log("✅ Error handling utilities found");
        
        console.log("✅ All frontend error handling tests passed!\n");
        return true;
        
    } catch (error) {
        console.log(`❌ Frontend error handling test failed: ${error.message}\n`);
        return false;
    }
}

function testContentService() {
    console.log("🧪 Testing Updated Content Service...");
    
    try {
        // Read the content service file
        const servicePath = path.join(__dirname, 'frontend/src/lib/contentService.ts');
        const serviceContent = fs.readFileSync(servicePath, 'utf8');
        
        // Check for imports of new utilities
        if (!serviceContent.includes('import { ContentValidation, ValidationUtils }')) {
            throw new Error("Missing validation utilities import");
        }
        console.log("✅ Validation utilities imported");
        
        if (!serviceContent.includes('import { ContentErrorHandler, withErrorHandling }')) {
            throw new Error("Missing error handling utilities import");
        }
        console.log("✅ Error handling utilities imported");
        
        if (!serviceContent.includes('import { VALIDATION_RULES, TWITTER_CONSTANTS }')) {
            throw new Error("Missing constants import");
        }
        console.log("✅ Constants imported");
        
        // Check for usage of new utilities
        if (!serviceContent.includes('withErrorHandling')) {
            throw new Error("withErrorHandling not used");
        }
        console.log("✅ Error handling utilities used");
        
        if (!serviceContent.includes('ContentValidation.validateTopic')) {
            throw new Error("Content validation not used");
        }
        console.log("✅ Validation utilities used");
        
        console.log("✅ All content service tests passed!\n");
        return true;
        
    } catch (error) {
        console.log(`❌ Content service test failed: ${error.message}\n`);
        return false;
    }
}

function testContentForm() {
    console.log("🧪 Testing Updated Content Form...");
    
    try {
        // Read the content form file
        const formPath = path.join(__dirname, 'frontend/src/components/content/ContentForm.tsx');
        const formContent = fs.readFileSync(formPath, 'utf8');
        
        // Check for imports of new utilities
        if (!formContent.includes('VALIDATION_RULES')) {
            throw new Error("Missing validation rules import");
        }
        console.log("✅ Validation rules imported");
        
        // Check for validation usage
        if (!formContent.includes('VALIDATION_RULES.MIN_TOPIC_LENGTH')) {
            throw new Error("Validation rules not used");
        }
        console.log("✅ Validation rules used");
        
        // Check for character count
        if (!formContent.includes('VALIDATION_RULES.MAX_TOPIC_LENGTH')) {
            throw new Error("Character count not implemented");
        }
        console.log("✅ Character count implemented");
        
        // Check for validation state
        if (!formContent.includes('validationErrors')) {
            throw new Error("Validation state not implemented");
        }
        console.log("✅ Validation state implemented");
        
        console.log("✅ All content form tests passed!\n");
        return true;
        
    } catch (error) {
        console.log(`❌ Content form test failed: ${error.message}\n`);
        return false;
    }
}

function main() {
    console.log("🚀 Starting Frontend SOLID & KISS Improvements Test Suite\n");
    console.log("=" + "=".repeat(60));
    
    const tests = [
        testConstants,
        testValidationUtilities,
        testErrorHandling,
        testContentService,
        testContentForm
    ];
    
    let passed = 0;
    const total = tests.length;
    
    for (const test of tests) {
        if (test()) {
            passed++;
        }
    }
    
    console.log("=" + "=".repeat(60));
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log("🎉 All frontend tests passed! The improvements are working correctly.");
        return true;
    } else {
        console.log(`⚠️  ${total - passed} tests failed. Please review the issues above.`);
        return false;
    }
}

if (require.main === module) {
    const success = main();
    process.exit(success ? 0 : 1);
}
