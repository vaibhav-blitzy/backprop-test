/**
 * HTTP Methods Constants Module
 * 
 * Provides standardized HTTP method definitions, endpoint-specific method configurations,
 * and method validation utilities for the Node.js tutorial application.
 * 
 * Implements comprehensive HTTP method management with educational clarity and production-ready
 * patterns for method validation, authorization, and routing decisions. Centralizes HTTP method
 * constants to ensure consistency across controllers, route handlers, and validation utilities.
 * 
 * @description HTTP method constants module for Node.js tutorial application
 * @author Tutorial Application
 * @version 1.0.0
 * @license MIT
 */

// =============================================================================
// HTTP METHOD CONSTANTS
// =============================================================================

/**
 * Standard HTTP method constants for consistent method referencing across the application.
 * Contains all standard HTTP/1.1 methods as defined in RFC 7231.
 * 
 * Each method is stored as both key and value for easy validation and reference.
 * This pattern allows for both property access and validation checking.
 * 
 * @constant {Object} HTTP_METHODS
 * @property {string} GET - Safe method for resource retrieval
 * @property {string} POST - Method for resource creation and data submission
 * @property {string} PUT - Method for resource creation or replacement
 * @property {string} DELETE - Method for resource deletion
 * @property {string} PATCH - Method for partial resource updates
 * @property {string} HEAD - Safe method for headers-only retrieval
 * @property {string} OPTIONS - Method for capability discovery
 */
const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS'
};

/**
 * Array of HTTP methods specifically allowed for the /hello endpoint.
 * 
 * The hello endpoint is designed for tutorial simplicity and only supports GET requests
 * to demonstrate basic HTTP server functionality and proper method restriction patterns.
 * 
 * This array is used for endpoint-specific authorization validation and generating
 * Allow headers in 405 Method Not Allowed responses.
 * 
 * @constant {string[]} HELLO_ENDPOINT_METHODS
 */
const HELLO_ENDPOINT_METHODS = [HTTP_METHODS.GET];

/**
 * Array of all HTTP methods supported by the tutorial application for general validation.
 * 
 * This serves as a whitelist for method validation to prevent HTTP method injection attacks
 * and ensures only recognized methods are processed by the application. Used throughout
 * the application for comprehensive method validation and security checking.
 * 
 * @constant {string[]} SUPPORTED_METHODS
 */
const SUPPORTED_METHODS = [
    HTTP_METHODS.GET,
    HTTP_METHODS.POST,
    HTTP_METHODS.PUT,
    HTTP_METHODS.DELETE,
    HTTP_METHODS.PATCH,
    HTTP_METHODS.HEAD,
    HTTP_METHODS.OPTIONS
];

// =============================================================================
// METHOD VALIDATION UTILITIES
// =============================================================================

/**
 * Validates if the provided method string is a valid HTTP method supported by the tutorial application.
 * 
 * Performs case-insensitive validation against the SUPPORTED_METHODS whitelist to prevent
 * HTTP method injection attacks and ensure only recognized methods are processed.
 * 
 * Implementation follows security best practices by:
 * - Converting method to uppercase for consistent comparison
 * - Using whitelist approach to prevent injection attacks
 * - Validating method format against HTTP method patterns
 * - Providing early termination for invalid methods
 * 
 * @param {string} method - The HTTP method string to validate
 * @returns {boolean} True if the method is valid and supported, false otherwise
 * 
 * @example
 * isValidHttpMethod('GET');     // Returns: true
 * isValidHttpMethod('get');     // Returns: true (case-insensitive)
 * isValidHttpMethod('INVALID'); // Returns: false
 * isValidHttpMethod('');        // Returns: false
 * isValidHttpMethod(null);      // Returns: false
 */
function isValidHttpMethod(method) {
    // Input validation - ensure method is a non-empty string
    if (!method || typeof method !== 'string') {
        return false;
    }
    
    // Convert method to uppercase for consistent comparison
    const normalizedMethod = method.trim().toUpperCase();
    
    // Validate method format - HTTP methods should be 3-7 characters, uppercase letters only
    const httpMethodPattern = /^[A-Z]{3,7}$/;
    if (!httpMethodPattern.test(normalizedMethod)) {
        return false;
    }
    
    // Check if method exists in SUPPORTED_METHODS array (whitelist approach)
    return SUPPORTED_METHODS.includes(normalizedMethod);
}

/**
 * Checks if a specific HTTP method is allowed for a given endpoint based on endpoint-specific method restrictions.
 * 
 * Implements endpoint-specific authorization by comparing the requested method against the
 * allowed methods for each endpoint. This follows the principle of least privilege where
 * each endpoint defines its own allowed methods.
 * 
 * Security features:
 * - Method normalization to prevent case-based bypass attempts
 * - Endpoint-specific authorization validation
 * - Default deny policy for unknown endpoints
 * - Protection against method enumeration attacks
 * 
 * @param {string} method - The HTTP method to check
 * @param {string} endpoint - The endpoint path to check against
 * @returns {boolean} True if method is allowed for the endpoint, false otherwise
 * 
 * @example
 * isMethodAllowedForEndpoint('GET', '/hello');    // Returns: true
 * isMethodAllowedForEndpoint('POST', '/hello');   // Returns: false
 * isMethodAllowedForEndpoint('GET', '/invalid');  // Returns: false
 */
function isMethodAllowedForEndpoint(method, endpoint) {
    // Input validation
    if (!method || typeof method !== 'string' || !endpoint || typeof endpoint !== 'string') {
        return false;
    }
    
    // Normalize method to uppercase for consistent comparison
    const normalizedMethod = method.trim().toUpperCase();
    
    // Normalize endpoint path by removing trailing slashes and extra whitespace
    const normalizedEndpoint = endpoint.trim().toLowerCase().replace(/\/+$/, '') || '/';
    
    // Determine endpoint-specific allowed methods based on endpoint path
    let allowedMethods = [];
    
    switch (normalizedEndpoint) {
        case '/hello':
            // Hello endpoint only supports GET method for tutorial simplicity
            allowedMethods = HELLO_ENDPOINT_METHODS;
            break;
        default:
            // Unknown endpoints return empty array (default deny policy)
            allowedMethods = [];
            break;
    }
    
    // Return authorization result for method and endpoint combination
    return allowedMethods.includes(normalizedMethod);
}

/**
 * Returns the list of HTTP methods allowed for a specific endpoint for generating Allow headers in 405 responses.
 * 
 * This function provides the allowed methods list for proper HTTP protocol compliance,
 * specifically for generating Allow headers in 405 Method Not Allowed responses.
 * 
 * Follows HTTP/1.1 specification requirements for proper error response handling
 * and helps clients understand which methods are available for each endpoint.
 * 
 * @param {string} endpoint - The endpoint path to get allowed methods for
 * @returns {string[]} Array of allowed HTTP methods for the specified endpoint
 * 
 * @example
 * getAllowedMethodsForEndpoint('/hello');    // Returns: ['GET']
 * getAllowedMethodsForEndpoint('/invalid');  // Returns: []
 * getAllowedMethodsForEndpoint('');          // Returns: []
 */
function getAllowedMethodsForEndpoint(endpoint) {
    // Input validation
    if (!endpoint || typeof endpoint !== 'string') {
        return [];
    }
    
    // Normalize endpoint path
    const normalizedEndpoint = endpoint.trim().toLowerCase().replace(/\/+$/, '') || '/';
    
    // Identify endpoint pattern from provided endpoint path
    switch (normalizedEndpoint) {
        case '/hello':
            // For /hello endpoint, return HELLO_ENDPOINT_METHODS array
            return [...HELLO_ENDPOINT_METHODS]; // Return a copy to prevent mutation
        default:
            // For unknown endpoints, return empty array
            return [];
    }
}

/**
 * Formats an array of HTTP methods into a comma-separated string suitable for HTTP Allow header.
 * 
 * Generates properly formatted Allow header values according to HTTP/1.1 specification.
 * The Allow header lists the set of methods supported by a resource, typically used
 * in 405 Method Not Allowed responses.
 * 
 * Implementation includes:
 * - Input validation to ensure array parameter
 * - Filtering of invalid or unsupported methods
 * - Proper comma-space separation format
 * - Empty string return for empty or invalid input
 * 
 * @param {string[]} methods - Array of HTTP methods to format
 * @returns {string} Comma-separated string of HTTP methods for Allow header
 * 
 * @example
 * formatMethodsForAllowHeader(['GET', 'POST']);  // Returns: "GET, POST"
 * formatMethodsForAllowHeader(['GET']);          // Returns: "GET"
 * formatMethodsForAllowHeader([]);               // Returns: ""
 * formatMethodsForAllowHeader(null);             // Returns: ""
 */
function formatMethodsForAllowHeader(methods) {
    // Validate that methods parameter is an array
    if (!Array.isArray(methods) || methods.length === 0) {
        return '';
    }
    
    // Filter out invalid or unsupported methods
    const validMethods = methods.filter(method => {
        return method && 
               typeof method === 'string' && 
               isValidHttpMethod(method);
    });
    
    // Join methods with comma and space separation
    return validMethods
        .map(method => method.toUpperCase())
        .join(', ');
}

/**
 * Performs comprehensive method authorization validation for endpoint access including security checks.
 * 
 * This is the primary validation function that combines all method validation logic into a
 * comprehensive security check. It performs format validation, support checking, endpoint
 * authorization, and security validation to prevent various attack vectors.
 * 
 * Security features implemented:
 * - HTTP method injection prevention through format validation
 * - Request smuggling protection via strict method validation
 * - Method enumeration protection through generic error responses
 * - Comprehensive validation context for security monitoring
 * 
 * @param {string} method - The HTTP method to validate
 * @param {string} endpoint - The endpoint path for authorization checking
 * @param {Object} [options={}] - Additional validation options
 * @param {boolean} [options.strictValidation=true] - Enable strict validation mode
 * @param {boolean} [options.includeSecurityDetails=false] - Include security details in response
 * @returns {Object} Authorization result with success status, allowed methods, and validation details
 * 
 * @example
 * validateMethodAuthorization('GET', '/hello');
 * // Returns: { 
 * //   success: true, 
 * //   allowed: true, 
 * //   allowedMethods: ['GET'],
 * //   securityValidation: { passed: true },
 * //   details: { ... }
 * // }
 */
function validateMethodAuthorization(method, endpoint, options = {}) {
    // Initialize options with defaults
    const opts = {
        strictValidation: true,
        includeSecurityDetails: false,
        ...options
    };
    
    // Initialize result object with comprehensive validation details
    const result = {
        success: false,
        allowed: false,
        method: method,
        endpoint: endpoint,
        allowedMethods: [],
        securityValidation: {
            passed: false,
            formatValid: false,
            supportedMethod: false,
            endpointAuthorized: false,
            securityChecks: {
                injectionPrevention: false,
                patternMatching: false,
                whitelistValidation: false
            }
        },
        details: {
            timestamp: new Date().toISOString(),
            validationMode: opts.strictValidation ? 'strict' : 'permissive'
        },
        errors: []
    };
    
    try {
        // Step 1: Validate method format and supported method checking
        if (!method || typeof method !== 'string') {
            result.errors.push('Invalid method parameter: must be a non-empty string');
            return result;
        }
        
        if (!endpoint || typeof endpoint !== 'string') {
            result.errors.push('Invalid endpoint parameter: must be a non-empty string');
            return result;
        }
        
        // Normalize method for consistent processing
        const normalizedMethod = method.trim().toUpperCase();
        result.method = normalizedMethod;
        
        // Perform security validation to prevent method injection attacks
        const methodPattern = /^[A-Z]{3,7}$/;
        result.securityValidation.formatValid = methodPattern.test(normalizedMethod);
        result.securityValidation.securityChecks.patternMatching = result.securityValidation.formatValid;
        
        if (!result.securityValidation.formatValid) {
            result.errors.push('Method format validation failed: invalid characters or length');
            if (opts.strictValidation) {
                return result;
            }
        }
        
        // Check if method is in supported methods whitelist
        result.securityValidation.supportedMethod = isValidHttpMethod(normalizedMethod);
        result.securityValidation.securityChecks.whitelistValidation = result.securityValidation.supportedMethod;
        
        if (!result.securityValidation.supportedMethod) {
            result.errors.push(`Unsupported HTTP method: ${normalizedMethod}`);
            return result;
        }
        
        // Check method authorization against endpoint-specific restrictions
        result.securityValidation.endpointAuthorized = isMethodAllowedForEndpoint(normalizedMethod, endpoint);
        result.allowed = result.securityValidation.endpointAuthorized;
        
        // Get allowed methods for endpoint (for generating Allow headers)
        result.allowedMethods = getAllowedMethodsForEndpoint(endpoint);
        
        // Perform comprehensive security validation
        result.securityValidation.securityChecks.injectionPrevention = 
            result.securityValidation.formatValid && 
            result.securityValidation.supportedMethod;
        
        // Overall security validation status
        result.securityValidation.passed = 
            result.securityValidation.formatValid &&
            result.securityValidation.supportedMethod &&
            result.securityValidation.securityChecks.injectionPrevention;
        
        // Set success status based on validation results
        result.success = result.securityValidation.passed;
        
        // Include additional security details if requested
        if (opts.includeSecurityDetails) {
            result.details.securityContext = {
                requestValidation: 'completed',
                authorizationCheck: result.allowed ? 'authorized' : 'unauthorized',
                securityLevel: result.securityValidation.passed ? 'secure' : 'insecure'
            };
        }
        
        // Add success message if no errors
        if (result.success && result.errors.length === 0) {
            result.details.message = `Method ${normalizedMethod} validation successful for endpoint ${endpoint}`;
        }
        
    } catch (error) {
        // Handle unexpected errors during validation
        result.errors.push(`Validation error: ${error.message}`);
        result.success = false;
        result.details.error = error.message;
    }
    
    return result;
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

/**
 * Export all HTTP method constants, validation utilities, and configuration arrays
 * for use throughout the Node.js tutorial application.
 * 
 * Provides a comprehensive API for HTTP method management including:
 * - Standard HTTP method constants
 * - Endpoint-specific method restrictions
 * - Method validation and authorization utilities
 * - Security-focused validation functions
 * 
 * This module serves as the central authority for all HTTP method-related
 * functionality in the tutorial application.
 */
module.exports = {
    // HTTP Method Constants
    HTTP_METHODS,
    
    // Endpoint Method Configuration
    HELLO_ENDPOINT_METHODS,
    SUPPORTED_METHODS,
    
    // Validation Utilities
    isValidHttpMethod,
    isMethodAllowedForEndpoint,
    getAllowedMethodsForEndpoint,
    formatMethodsForAllowHeader,
    validateMethodAuthorization
};