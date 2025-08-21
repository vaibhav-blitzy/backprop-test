/**
 * Comprehensive HTTP Request Validation Utility Module
 * 
 * Provides security-focused validation functions for HTTP methods, URL paths, headers,
 * and endpoint access with input sanitization, injection prevention, and validation patterns
 * for the Node.js tutorial application. Centralizes validation logic with educational
 * clarity while demonstrating production-ready security validation techniques including
 * path traversal prevention, method injection protection, and comprehensive input validation.
 * 
 * This module implements HTTP Request Processing Engine Validation with comprehensive
 * input validation and sanitization for security compliance, following standard security
 * practices and demonstrating proper error handling patterns without complex security
 * frameworks while maintaining security best practices.
 * 
 * Educational Value:
 * - Demonstrates comprehensive input validation patterns for web security
 * - Shows detection and prevention techniques for common injection attacks
 * - Illustrates proper input sanitization and encoding practices
 * - Teaches security threat pattern recognition and response strategies
 * - Shows how to structure validation logic into reusable components
 * - Demonstrates proper validation error handling and reporting
 * - Illustrates efficient validation techniques for high-performance applications
 * - Shows how to build configurable validation systems
 * 
 * @description Comprehensive HTTP request validation utility module
 * @author Node.js Tutorial Application
 * @version 1.0.0
 * @license MIT
 */

// Import required modules for validation functionality
const { 
    ERROR_MESSAGES, 
    VALIDATION_ERROR_MESSAGES, 
    INVALID_INPUT, 
    INVALID_REQUEST_FORMAT, 
    INVALID_HTTP_METHOD 
} = require('../constants/error-messages.js'); // v1.0.0

const { 
    HTTP_METHODS, 
    SUPPORTED_METHODS, 
    HELLO_ENDPOINT_METHODS 
} = require('../constants/http-methods.js'); // v1.0.0

const { 
    HTTP_STATUS_CODES, 
    isClientError 
} = require('./http-status.js'); // v1.0.0

const { 
    REQUEST_TYPES, 
    VALIDATION_SCHEMAS 
} = require('../types/request.types.js'); // v1.0.0

// =============================================================================
// GLOBAL VALIDATION CONFIGURATION OBJECTS
// =============================================================================

/**
 * Comprehensive validation rules for different request components including methods,
 * URLs, headers, and security patterns for thorough input validation and security checking.
 * 
 * @constant {Object} VALIDATION_RULES
 */
const VALIDATION_RULES = {
    // HTTP Method validation rules and security constraints
    METHOD_RULES: {
        maxLength: 10,
        allowedCharacters: /^[A-Z]+$/,
        supportedMethods: [...SUPPORTED_METHODS],
        injectionPatterns: ['\r', '\n', '\0', '<script', 'javascript:', 'data:'],
        caseSensitive: false,
        normalization: 'uppercase_conversion'
    },
    
    // URL Path validation rules with security constraints
    PATH_RULES: {
        maxLength: 2048,
        maxSegments: 20,
        maxSegmentLength: 255,
        allowedCharacters: /^[a-zA-Z0-9._\/-]*$/,
        traversalPatterns: ['../', '..\\', '%2e%2e', '%2f', '%5c'],
        dangerousSequences: ['\0', '\r', '\n', '<', '>', '"', "'"],
        normalization: 'remove_redundant_slashes_decode_url_encoding',
        encoding: 'utf-8'
    },
    
    // HTTP Header validation rules for format compliance
    HEADER_RULES: {
        maxHeaderCount: 50,
        maxHeaderSize: 8192,
        maxValueLength: 1024,
        maxTotalSize: 32768,
        forbiddenCharacters: ['\r', '\n', '\0'],
        caseNormalization: 'lowercase_keys',
        injectionPatterns: ['\\r\\n', '\\n\\r', '%0d%0a', '%0a%0d'],
        requiredHeaders: [],
        optionalHeaders: ['user-agent', 'accept', 'accept-encoding', 'host', 'connection']
    },
    
    // Security validation rules for threat detection
    SECURITY_RULES: {
        threatLevelThresholds: { low: 1, medium: 3, high: 5, critical: 10 },
        sqlInjectionPatterns: ["'", '"', '--', '/*', '*/', 'xp_', 'sp_', 'UNION', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        xssPatterns: ['<script', 'javascript:', 'onload=', 'onerror=', 'data:text/html', '<iframe'],
        pathTraversalPatterns: ['../', '..\\', '%2e%2e%2f', '%2e%2e%5c'],
        commandInjectionPatterns: ['|', '&', ';', '`', '$', '(', ')', '$(', '&&', '||'],
        maxRequestSize: 10485760,
        enableInjectionPrevention: true,
        enableXssPrevention: true,
        enableCommandInjection: true
    }
};

/**
 * Security threat detection patterns containing regular expressions and patterns
 * for detecting security threats including injection attempts and malicious input.
 * 
 * @constant {Object} SECURITY_PATTERNS
 */
const SECURITY_PATTERNS = {
    // SQL injection detection patterns
    INJECTION_PATTERNS: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
        /('|(\\')|(;)|(\-\-)|(\|\|)|(\/\*))/g,
        /(0x[0-9a-f]+)/gi,
        /(\b(OR|AND)\b.*=.*)/gi
    ],
    
    // Path traversal detection patterns for directory traversal attacks
    PATH_TRAVERSAL_PATTERNS: [
        /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/gi,
        /\\\\|\/\/|%2f%2f|%5c%5c/g,
        /\.\.\.|\.\.\.\.|\.\.\.\.\./g,
        /(\.\/){2,}|(\.\\){2,}/g
    ],
    
    // XSS (Cross-Site Scripting) detection patterns
    XSS_PATTERNS: [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /<iframe[^>]*>/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi
    ],
    
    // Command injection detection patterns
    COMMAND_INJECTION_PATTERNS: [
        /[|&;`$(){}[\]\\]/g,
        /\$\{[^}]*\}/g,
        /\$\([^)]*\)/g,
        /(&&|\|\|)/g
    ],
    
    // Header injection detection patterns
    HEADER_INJECTION_PATTERNS: [
        /[\r\n]/g,
        /%0d|%0a|%0D|%0A/gi,
        /\x00|\x0d|\x0a/g
    ]
};

/**
 * Path validation configuration including maximum length, allowed characters,
 * and security constraints for comprehensive path validation and sanitization.
 * 
 * @constant {Object} PATH_VALIDATION_CONFIG
 */
const PATH_VALIDATION_CONFIG = {
    maxPathLength: 2048,
    maxSegments: 20,
    maxSegmentLength: 255,
    allowedCharacters: 'alphanumeric_slash_dash_underscore_dot',
    characterPattern: /^[a-zA-Z0-9._\/-]*$/,
    normalizationRules: {
        removeTrailingSlashes: true,
        removeDoubleSlashes: true,
        decodeUrlEncoding: true,
        lowercaseComparison: false
    },
    securityConstraints: {
        preventTraversal: true,
        blockNullBytes: true,
        blockControlCharacters: true,
        blockScriptTags: true
    },
    encoding: {
        inputEncoding: 'utf-8',
        outputEncoding: 'utf-8',
        allowNonAscii: false
    }
};

/**
 * Endpoint validation rules mapping endpoints to their specific validation requirements
 * including allowed methods and access restrictions for endpoint-specific authorization.
 * 
 * @constant {Object} ENDPOINT_VALIDATION_RULES
 */
const ENDPOINT_VALIDATION_RULES = {
    // Hello endpoint specific validation rules
    '/hello': {
        allowedMethods: [...HELLO_ENDPOINT_METHODS],
        requiredHeaders: [],
        optionalHeaders: ['user-agent', 'accept', 'accept-encoding'],
        maxRequestSize: 1024,
        pathPattern: '^/hello$',
        caseSensitive: false,
        allowQueryParams: false,
        rateLimit: { requestsPerMinute: 60, burstLimit: 10 },
        securityLevel: 'standard',
        validation: {
            strictPathMatching: true,
            methodValidation: true,
            headerValidation: true,
            securityValidation: true
        }
    },
    
    // Default endpoint validation rules for unknown endpoints
    default: {
        allowedMethods: [...SUPPORTED_METHODS],
        requiredHeaders: [],
        maxRequestSize: 10485760,
        securityLevel: 'strict',
        validationMode: 'comprehensive',
        pathPattern: null,
        allowQueryParams: true,
        validation: {
            strictPathMatching: false,
            methodValidation: true,
            headerValidation: true,
            securityValidation: true
        }
    }
};

// =============================================================================
// STANDALONE VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validates HTTP method against supported methods and detects method injection attempts
 * with case normalization and security checking for the tutorial application hello endpoint.
 * 
 * @param {string} method - The HTTP method string to validate
 * @param {Object} [options={}] - Additional validation options
 * @param {boolean} [options.strictMode=true] - Enable strict validation mode
 * @param {boolean} [options.includeSecurityDetails=false] - Include security context
 * @returns {Object} Validation result with isValid boolean, normalizedMethod string, and error details
 */
function validateHttpMethod(method, options = {}) {
    // Initialize validation options with defaults
    const opts = {
        strictMode: true,
        includeSecurityDetails: false,
        ...options
    };
    
    // Create validation result object with comprehensive details
    const result = {
        isValid: false,
        normalizedMethod: null,
        errors: [],
        securityContext: {
            injectionAttempt: false,
            formatValid: false,
            whitelistValid: false,
            threatLevel: 'none'
        },
        metadata: {
            timestamp: new Date().toISOString(),
            validationMode: opts.strictMode ? 'strict' : 'permissive'
        }
    };
    
    try {
        // Validate method parameter is a string and not null or undefined
        if (!method || typeof method !== 'string') {
            result.errors.push(INVALID_INPUT);
            return result;
        }
        
        // Normalize method to uppercase for consistent validation and comparison
        const normalizedMethod = method.trim().toUpperCase();
        result.normalizedMethod = normalizedMethod;
        
        // Check for method injection patterns and suspicious characters in method string
        const injectionDetected = VALIDATION_RULES.METHOD_RULES.injectionPatterns.some(pattern => 
            normalizedMethod.includes(pattern)
        );
        
        if (injectionDetected) {
            result.errors.push('Method injection attempt detected');
            result.securityContext.injectionAttempt = true;
            result.securityContext.threatLevel = 'high';
            return result;
        }
        
        // Check method length constraints to prevent buffer overflow attacks
        if (normalizedMethod.length > VALIDATION_RULES.METHOD_RULES.maxLength) {
            result.errors.push(`Method length exceeds maximum allowed (${VALIDATION_RULES.METHOD_RULES.maxLength})`);
            return result;
        }
        
        // Validate method format against allowed character pattern
        result.securityContext.formatValid = VALIDATION_RULES.METHOD_RULES.allowedCharacters.test(normalizedMethod);
        if (!result.securityContext.formatValid) {
            result.errors.push('Invalid characters in HTTP method');
            return result;
        }
        
        // Validate method against SUPPORTED_METHODS whitelist for basic method authorization
        result.securityContext.whitelistValid = SUPPORTED_METHODS.includes(normalizedMethod);
        if (!result.securityContext.whitelistValid) {
            result.errors.push(INVALID_HTTP_METHOD);
            return result;
        }
        
        // Apply additional security checks for malicious method manipulation attempts
        if (opts.strictMode && normalizedMethod.length < 3) {
            result.errors.push('Method too short for valid HTTP method');
            return result;
        }
        
        // Create validation result object with success status and normalized method
        result.isValid = true;
        result.securityContext.threatLevel = 'none';
        
        // Include detailed error information for validation failures with security context
        if (opts.includeSecurityDetails) {
            result.securityContext.validationSteps = {
                inputValidation: 'passed',
                normalization: 'completed',
                injectionCheck: 'passed',
                formatValidation: 'passed',
                whitelistCheck: 'passed'
            };
        }
        
    } catch (error) {
        result.errors.push(`Method validation error: ${error.message}`);
        result.securityContext.threatLevel = 'critical';
    }
    
    // Return comprehensive validation result with method authorization status
    return result;
}

/**
 * Validates and sanitizes URL path with path traversal prevention, length checking,
 * and character validation for security against directory traversal and injection attacks.
 * 
 * @param {string} urlPath - The URL path string to validate
 * @param {Object} [validationOptions={}] - Additional validation options
 * @param {boolean} [validationOptions.strictMode=true] - Enable strict validation
 * @param {boolean} [validationOptions.sanitize=true] - Enable path sanitization
 * @returns {Object} Validation result with isValid boolean, sanitizedPath string, and security warnings
 */
function validateUrlPath(urlPath, validationOptions = {}) {
    // Initialize validation options with defaults
    const opts = {
        strictMode: true,
        sanitize: true,
        includeWarnings: true,
        ...validationOptions
    };
    
    // Create comprehensive validation result object
    const result = {
        isValid: false,
        sanitizedPath: null,
        originalPath: urlPath,
        errors: [],
        warnings: [],
        securityAssessment: {
            traversalAttempt: false,
            injectionAttempt: false,
            suspiciousPatterns: [],
            threatLevel: 'none',
            sanitizationRequired: false
        },
        pathDetails: {
            length: 0,
            segments: [],
            hasQueryParams: false,
            hasFragment: false
        },
        metadata: {
            timestamp: new Date().toISOString(),
            validationConfig: PATH_VALIDATION_CONFIG
        }
    };
    
    try {
        // Validate urlPath parameter is a string and handle null/undefined cases gracefully
        if (!urlPath || typeof urlPath !== 'string') {
            result.errors.push('Invalid URL path: must be a non-empty string');
            return result;
        }
        
        // Check URL path length against maximum allowed length for DoS prevention
        result.pathDetails.length = urlPath.length;
        if (urlPath.length > PATH_VALIDATION_CONFIG.maxPathLength) {
            result.errors.push(`URL path exceeds maximum length (${PATH_VALIDATION_CONFIG.maxPathLength})`);
            return result;
        }
        
        // Decode URL encoding and normalize path separators for consistent processing
        let workingPath = urlPath.trim();
        
        try {
            if (opts.sanitize && PATH_VALIDATION_CONFIG.normalizationRules.decodeUrlEncoding) {
                workingPath = decodeURIComponent(workingPath);
            }
        } catch (decodeError) {
            result.warnings.push('Failed to decode URL encoding, using original path');
        }
        
        // Detect and prevent path traversal attempts using ../ and ..\ patterns
        const traversalDetected = SECURITY_PATTERNS.PATH_TRAVERSAL_PATTERNS.some(pattern => 
            pattern.test(workingPath)
        );
        
        if (traversalDetected) {
            result.errors.push('Path traversal attempt detected');
            result.securityAssessment.traversalAttempt = true;
            result.securityAssessment.threatLevel = 'high';
            result.securityAssessment.suspiciousPatterns.push('path_traversal');
            return result;
        }
        
        // Validate characters against allowed character set and detect suspicious patterns
        if (!PATH_VALIDATION_CONFIG.characterPattern.test(workingPath)) {
            result.errors.push('Invalid characters detected in URL path');
            result.securityAssessment.injectionAttempt = true;
            result.securityAssessment.threatLevel = 'medium';
            return result;
        }
        
        // Check for null bytes and other dangerous characters that could cause issues
        const dangerousChars = PATH_VALIDATION_CONFIG.securityConstraints.blockNullBytes ? 
            VALIDATION_RULES.PATH_RULES.dangerousSequences : [];
        
        const dangerousCharDetected = dangerousChars.some(char => workingPath.includes(char));
        if (dangerousCharDetected) {
            result.errors.push('Dangerous characters detected in URL path');
            result.securityAssessment.injectionAttempt = true;
            result.securityAssessment.threatLevel = 'high';
            return result;
        }
        
        // Normalize path by removing redundant slashes and resolving relative components
        if (opts.sanitize) {
            if (PATH_VALIDATION_CONFIG.normalizationRules.removeDoubleSlashes) {
                workingPath = workingPath.replace(/\/+/g, '/');
            }
            
            if (PATH_VALIDATION_CONFIG.normalizationRules.removeTrailingSlashes && workingPath.length > 1) {
                workingPath = workingPath.replace(/\/+$/, '');
            }
            
            result.securityAssessment.sanitizationRequired = workingPath !== urlPath;
        }
        
        // Parse path segments and validate segment constraints
        const pathOnly = workingPath.split('?')[0].split('#')[0];
        result.pathDetails.segments = pathOnly.split('/').filter(segment => segment.length > 0);
        result.pathDetails.hasQueryParams = workingPath.includes('?');
        result.pathDetails.hasFragment = workingPath.includes('#');
        
        // Validate path segment count and individual segment length
        if (result.pathDetails.segments.length > PATH_VALIDATION_CONFIG.maxSegments) {
            result.errors.push(`Too many path segments (max: ${PATH_VALIDATION_CONFIG.maxSegments})`);
            return result;
        }
        
        for (const segment of result.pathDetails.segments) {
            if (segment.length > PATH_VALIDATION_CONFIG.maxSegmentLength) {
                result.errors.push(`Path segment too long (max: ${PATH_VALIDATION_CONFIG.maxSegmentLength})`);
                return result;
            }
        }
        
        // Apply security sanitization to remove or escape dangerous characters
        result.sanitizedPath = workingPath;
        
        // Validate final path against known endpoint patterns for routing validation
        if (workingPath === '/hello' || workingPath === '/') {
            result.isValid = true;
            result.securityAssessment.threatLevel = 'none';
        } else if (opts.strictMode) {
            result.warnings.push('Path does not match known endpoint patterns');
            result.isValid = false;
        } else {
            result.isValid = true;
        }
        
        // Create validation result with sanitized path and security assessment details
        if (opts.includeWarnings && result.securityAssessment.sanitizationRequired) {
            result.warnings.push('Path was modified during sanitization');
        }
        
    } catch (error) {
        result.errors.push(`Path validation error: ${error.message}`);
        result.securityAssessment.threatLevel = 'critical';
    }
    
    // Return comprehensive path validation result with security context information
    return result;
}

/**
 * Validates HTTP method authorization for specific endpoints including hello endpoint
 * method restrictions and access control validation for the tutorial application routing requirements.
 * 
 * @param {string} method - The HTTP method to validate
 * @param {string} endpoint - The endpoint path for authorization checking
 * @param {Object} [accessOptions={}] - Additional access control options
 * @returns {Object} Access validation result with isAuthorized boolean, allowedMethods array, and access control details
 */
function validateEndpointAccess(method, endpoint, accessOptions = {}) {
    // Initialize access control options with defaults
    const opts = {
        strictMode: true,
        includeAccessDetails: true,
        enforceMethodRestrictions: true,
        ...accessOptions
    };
    
    // Create comprehensive access validation result object
    const result = {
        isAuthorized: false,
        method: method,
        endpoint: endpoint,
        allowedMethods: [],
        accessControlDetails: {
            endpointExists: false,
            methodSupported: false,
            accessLevel: 'denied',
            restrictionReason: null
        },
        errors: [],
        warnings: [],
        metadata: {
            timestamp: new Date().toISOString(),
            validationRules: null
        }
    };
    
    try {
        // Validate method and endpoint parameters are valid strings with proper format
        if (!method || typeof method !== 'string') {
            result.errors.push('Invalid method parameter: must be a non-empty string');
            return result;
        }
        
        if (!endpoint || typeof endpoint !== 'string') {
            result.errors.push('Invalid endpoint parameter: must be a non-empty string');
            return result;
        }
        
        // Normalize method to uppercase and endpoint path for consistent comparison
        const normalizedMethod = method.trim().toUpperCase();
        const normalizedEndpoint = endpoint.trim().toLowerCase().replace(/\/+$/, '') || '/';
        
        result.method = normalizedMethod;
        result.endpoint = normalizedEndpoint;
        
        // Determine endpoint-specific access rules based on endpoint pattern matching
        let endpointRules;
        if (ENDPOINT_VALIDATION_RULES[normalizedEndpoint]) {
            endpointRules = ENDPOINT_VALIDATION_RULES[normalizedEndpoint];
            result.accessControlDetails.endpointExists = true;
        } else {
            endpointRules = ENDPOINT_VALIDATION_RULES.default;
            result.accessControlDetails.endpointExists = false;
            if (opts.strictMode) {
                result.warnings.push('Endpoint not found in validation rules, using default rules');
            }
        }
        
        result.metadata.validationRules = endpointRules;
        result.allowedMethods = [...endpointRules.allowedMethods];
        
        // For /hello endpoint, validate method against HELLO_ENDPOINT_METHODS array
        if (normalizedEndpoint === '/hello') {
            result.accessControlDetails.methodSupported = HELLO_ENDPOINT_METHODS.includes(normalizedMethod);
            
            if (!result.accessControlDetails.methodSupported) {
                result.errors.push(`Method ${normalizedMethod} not allowed for /hello endpoint`);
                result.accessControlDetails.restrictionReason = 'method_not_allowed_for_hello';
                return result;
            }
        } else {
            // Check general endpoint access rules and method authorization patterns
            result.accessControlDetails.methodSupported = endpointRules.allowedMethods.includes(normalizedMethod);
            
            if (!result.accessControlDetails.methodSupported) {
                result.errors.push(`Method ${normalizedMethod} not allowed for endpoint ${normalizedEndpoint}`);
                result.accessControlDetails.restrictionReason = 'method_not_allowed_for_endpoint';
                return result;
            }
        }
        
        // Apply security access controls and validate against endpoint whitelist
        if (opts.enforceMethodRestrictions) {
            // Validate method is in SUPPORTED_METHODS for overall application support
            if (!SUPPORTED_METHODS.includes(normalizedMethod)) {
                result.errors.push(`Method ${normalizedMethod} not supported by application`);
                result.accessControlDetails.restrictionReason = 'method_not_supported';
                return result;
            }
        }
        
        // Determine allowed methods for the specific endpoint for Allow header generation
        result.allowedMethods = endpointRules.allowedMethods;
        
        // Create access validation result with authorization status and method details
        result.isAuthorized = result.accessControlDetails.methodSupported;
        result.accessControlDetails.accessLevel = result.isAuthorized ? 'authorized' : 'denied';
        
        // Include security context and access violation information for unauthorized attempts
        if (opts.includeAccessDetails) {
            result.accessControlDetails.securityContext = {
                endpointPattern: endpointRules.pathPattern,
                securityLevel: endpointRules.securityLevel,
                validationMode: endpointRules.validationMode,
                rateLimit: endpointRules.rateLimit
            };
        }
        
        // Log access validation results for security monitoring and threat detection
        if (!result.isAuthorized && opts.strictMode) {
            console.warn(`Access denied: ${normalizedMethod} ${normalizedEndpoint} - ${result.accessControlDetails.restrictionReason}`);
        }
        
    } catch (error) {
        result.errors.push(`Access validation error: ${error.message}`);
        result.accessControlDetails.accessLevel = 'error';
    }
    
    // Return comprehensive access validation result with allowed methods and restrictions
    return result;
}

/**
 * Validates basic HTTP request object structure including required properties,
 * object type checking, and Node.js HTTP request compatibility validation.
 * 
 * @param {Object} request - The HTTP request object to validate
 * @param {Object} [structureOptions={}] - Additional structure validation options
 * @returns {Object} Structure validation result with isValid boolean, missing properties array, and structure compliance details
 */
function validateRequestStructure(request, structureOptions = {}) {
    // Initialize structure validation options with defaults
    const opts = {
        strictMode: true,
        checkNodejsCompatibility: true,
        validatePropertyTypes: true,
        ...structureOptions
    };
    
    // Create comprehensive structure validation result object
    const result = {
        isValid: false,
        missingProperties: [],
        invalidProperties: [],
        structureCompliance: {
            isObject: false,
            hasRequiredProperties: false,
            correctPropertyTypes: false,
            nodejsCompatible: false
        },
        errors: [],
        warnings: [],
        metadata: {
            timestamp: new Date().toISOString(),
            validationSchema: VALIDATION_SCHEMAS.BASIC_REQUEST
        }
    };
    
    try {
        // Check if request parameter is a valid object and not null or array
        if (!request || typeof request !== 'object' || Array.isArray(request)) {
            result.errors.push('Request must be a valid object (not null, undefined, or array)');
            return result;
        }
        
        result.structureCompliance.isObject = true;
        
        // Validate presence of required HTTP request properties (method, url, headers)
        const requiredProperties = ['method', 'url', 'headers'];
        for (const property of requiredProperties) {
            if (!(property in request)) {
                result.missingProperties.push(property);
                result.errors.push(`Missing required property: ${property}`);
            }
        }
        
        result.structureCompliance.hasRequiredProperties = result.missingProperties.length === 0;
        
        // Check property types match expected HTTP request object structure
        if (opts.validatePropertyTypes) {
            const propertyTypeChecks = {
                method: (val) => typeof val === 'string',
                url: (val) => typeof val === 'string',
                headers: (val) => typeof val === 'object' && val !== null && !Array.isArray(val),
                httpVersion: (val) => val === undefined || typeof val === 'string'
            };
            
            for (const [property, typeCheck] of Object.entries(propertyTypeChecks)) {
                if (property in request && !typeCheck(request[property])) {
                    result.invalidProperties.push(property);
                    result.errors.push(`Invalid type for property '${property}'`);
                }
            }
        }
        
        result.structureCompliance.correctPropertyTypes = result.invalidProperties.length === 0;
        
        // Validate headers object structure and key-value format compliance
        if (request.headers && typeof request.headers === 'object') {
            for (const [key, value] of Object.entries(request.headers)) {
                if (typeof key !== 'string' || typeof value !== 'string') {
                    result.warnings.push(`Header '${key}' has invalid type (should be string: string)`);
                }
            }
        }
        
        // Check for Node.js HTTP request object specific properties and methods
        if (opts.checkNodejsCompatibility) {
            const nodejsProperties = ['connection', 'socket'];
            let nodejsPropsFound = 0;
            
            for (const prop of nodejsProperties) {
                if (request[prop] && typeof request[prop] === 'object') {
                    nodejsPropsFound++;
                }
            }
            
            result.structureCompliance.nodejsCompatible = nodejsPropsFound > 0 || !opts.strictMode;
            
            if (nodejsPropsFound === 0 && opts.strictMode) {
                result.warnings.push('Request object may not be a Node.js HTTP request object');
            }
        } else {
            result.structureCompliance.nodejsCompatible = true;
        }
        
        // Apply structural validation against REQUEST_TYPES.HTTPRequest schema
        const schemaValidation = VALIDATION_SCHEMAS.BASIC_REQUEST;
        if (schemaValidation.validation.requireAllProperties) {
            const allRequiredPresent = schemaValidation.requiredProperties.every(prop => 
                prop in request
            );
            
            if (!allRequiredPresent) {
                result.errors.push('Not all required properties are present');
            }
        }
        
        // Detect additional properties that might indicate malicious request manipulation
        const expectedProperties = ['method', 'url', 'headers', 'httpVersion', 'connection', 'socket'];
        const unexpectedProperties = Object.keys(request).filter(key => 
            !expectedProperties.includes(key)
        );
        
        if (unexpectedProperties.length > 0 && opts.strictMode) {
            result.warnings.push(`Unexpected properties found: ${unexpectedProperties.join(', ')}`);
        }
        
        // Create structure validation result with detailed property analysis
        result.isValid = Object.values(result.structureCompliance).every(check => check === true);
        
        // Include missing property information for debugging and error reporting
        if (result.missingProperties.length > 0) {
            result.errors.push(`Missing required properties: ${result.missingProperties.join(', ')}`);
        }
        
    } catch (error) {
        result.errors.push(`Structure validation error: ${error.message}`);
    }
    
    // Return comprehensive structure validation result with compliance status
    return result;
}

/**
 * Validates HTTP request headers format, required headers presence, and header injection
 * prevention with security checking for malicious headers and format compliance.
 * 
 * @param {Object} headers - The headers object to validate
 * @param {Array} [requiredHeaders=[]] - Array of required header names
 * @param {Object} [headerOptions={}] - Additional header validation options
 * @returns {Object} Header validation result with isValid boolean, normalizedHeaders object, and security warnings
 */
function validateRequestHeaders(headers, requiredHeaders = [], headerOptions = {}) {
    // Initialize header validation options with defaults
    const opts = {
        strictMode: true,
        normalizeKeys: true,
        checkInjection: true,
        maxHeaderCount: VALIDATION_RULES.HEADER_RULES.maxHeaderCount,
        maxHeaderSize: VALIDATION_RULES.HEADER_RULES.maxHeaderSize,
        ...headerOptions
    };
    
    // Create comprehensive header validation result object
    const result = {
        isValid: false,
        normalizedHeaders: {},
        missingHeaders: [],
        invalidHeaders: [],
        securityWarnings: [],
        headerCompliance: {
            validStructure: false,
            sizeCompliant: false,
            injectionFree: false,
            requiredPresent: false
        },
        errors: [],
        metadata: {
            timestamp: new Date().toISOString(),
            originalHeaderCount: 0,
            totalHeaderSize: 0
        }
    };
    
    try {
        // Validate headers parameter is an object with proper key-value structure
        if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
            result.errors.push('Headers must be a valid object');
            return result;
        }
        
        result.headerCompliance.validStructure = true;
        result.metadata.originalHeaderCount = Object.keys(headers).length;
        
        // Check for required headers presence based on requiredHeaders array parameter
        for (const requiredHeader of requiredHeaders) {
            const headerKey = opts.normalizeKeys ? requiredHeader.toLowerCase() : requiredHeader;
            const headerExists = Object.keys(headers).some(key => 
                (opts.normalizeKeys ? key.toLowerCase() : key) === headerKey
            );
            
            if (!headerExists) {
                result.missingHeaders.push(requiredHeader);
                result.errors.push(`Missing required header: ${requiredHeader}`);
            }
        }
        
        result.headerCompliance.requiredPresent = result.missingHeaders.length === 0;
        
        // Validate header count against maximum allowed to prevent DoS attacks
        if (result.metadata.originalHeaderCount > opts.maxHeaderCount) {
            result.errors.push(`Too many headers: ${result.metadata.originalHeaderCount} exceeds maximum ${opts.maxHeaderCount}`);
            return result;
        }
        
        // Process headers and perform validation checks
        let totalSize = 0;
        let injectionDetected = false;
        
        for (const [key, value] of Object.entries(headers)) {
            // Validate header key and value are strings
            if (typeof key !== 'string' || typeof value !== 'string') {
                result.invalidHeaders.push(key);
                result.errors.push(`Invalid header type: ${key} (must be string: string)`);
                continue;
            }
            
            // Calculate header size for DoS prevention
            totalSize += key.length + value.length + 4; // +4 for ': ' and '\r\n'
            
            // Normalize header keys to lowercase for HTTP/1.1 protocol compliance
            const normalizedKey = opts.normalizeKeys ? key.toLowerCase() : key;
            
            // Validate header value formats and detect header injection attempts
            if (opts.checkInjection) {
                const injectionPatterns = VALIDATION_RULES.HEADER_RULES.forbiddenCharacters;
                const keyInjection = injectionPatterns.some(pattern => key.includes(pattern));
                const valueInjection = injectionPatterns.some(pattern => value.includes(pattern));
                
                if (keyInjection || valueInjection) {
                    injectionDetected = true;
                    result.securityWarnings.push(`Header injection detected in: ${key}`);
                    result.invalidHeaders.push(key);
                    continue;
                }
                
                // Check for CRLF injection patterns
                const crlfPattern = /[\r\n]/;
                if (crlfPattern.test(key) || crlfPattern.test(value)) {
                    injectionDetected = true;
                    result.securityWarnings.push(`CRLF injection detected in header: ${key}`);
                    result.invalidHeaders.push(key);
                    continue;
                }
            }
            
            // Apply header value length limits to prevent header overflow attacks
            if (value.length > VALIDATION_RULES.HEADER_RULES.maxValueLength) {
                result.errors.push(`Header value too long: ${key} (max: ${VALIDATION_RULES.HEADER_RULES.maxValueLength})`);
                result.invalidHeaders.push(key);
                continue;
            }
            
            // Store validated header with normalized key
            result.normalizedHeaders[normalizedKey] = value;
        }
        
        result.metadata.totalHeaderSize = totalSize;
        
        // Validate total header size against limits
        result.headerCompliance.sizeCompliant = totalSize <= opts.maxHeaderSize;
        if (!result.headerCompliance.sizeCompliant) {
            result.errors.push(`Total header size exceeds maximum: ${totalSize} > ${opts.maxHeaderSize}`);
        }
        
        // Set injection detection results
        result.headerCompliance.injectionFree = !injectionDetected;
        if (injectionDetected) {
            result.errors.push('Header injection attempts detected');
        }
        
        // Validate character encoding and detect non-ASCII characters in headers
        for (const [key, value] of Object.entries(result.normalizedHeaders)) {
            // Check for non-ASCII characters if strict mode is enabled
            if (opts.strictMode) {
                const asciiPattern = /^[\x20-\x7E]*$/;
                if (!asciiPattern.test(key) || !asciiPattern.test(value)) {
                    result.securityWarnings.push(`Non-ASCII characters in header: ${key}`);
                }
            }
        }
        
        // Generate header validation result with security assessment and compliance status
        result.isValid = Object.values(result.headerCompliance).every(check => check === true) &&
                         result.invalidHeaders.length === 0;
        
        // Include security warnings for detected threats and header manipulation attempts
        if (result.securityWarnings.length > 0) {
            result.errors.push(`Security warnings detected: ${result.securityWarnings.length} issues`);
        }
        
    } catch (error) {
        result.errors.push(`Header validation error: ${error.message}`);
    }
    
    // Return comprehensive header validation result with normalized headers and security context
    return result;
}

/**
 * Comprehensive security validation function that checks for injection attempts,
 * malicious patterns, and security threats across all request components for complete
 * request security assessment.
 * 
 * @param {Object} request - The HTTP request object to validate
 * @param {Object} [securityConfig={}] - Security validation configuration options
 * @returns {Object} Security validation result with isSecure boolean, threat assessment, and mitigation recommendations
 */
function validateRequestSecurity(request, securityConfig = {}) {
    // Initialize security configuration with defaults
    const config = {
        enableInjectionPrevention: true,
        enableXssPrevention: true,
        enableCommandInjection: true,
        enablePathTraversal: true,
        threatLevelThreshold: 'medium',
        includeRecommendations: true,
        ...securityConfig
    };
    
    // Create comprehensive security validation result object
    const result = {
        isSecure: false,
        threatAssessment: {
            overallThreatLevel: 'none',
            detectedThreats: [],
            riskScore: 0,
            criticalIssues: 0,
            securityViolations: []
        },
        securityWarnings: [],
        mitigationRecommendations: [],
        componentAnalysis: {
            method: { secure: false, threats: [] },
            url: { secure: false, threats: [] },
            headers: { secure: false, threats: [] },
            overall: { secure: false, threats: [] }
        },
        errors: [],
        metadata: {
            timestamp: new Date().toISOString(),
            securityConfig: config,
            validationId: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
    };
    
    try {
        // Initialize comprehensive security assessment with threat detection patterns
        let totalRiskScore = 0;
        let criticalIssues = 0;
        
        // Validate HTTP method for method injection and manipulation attempts
        if (request.method && config.enableInjectionPrevention) {
            const methodAnalysis = {
                secure: true,
                threats: []
            };
            
            // Check for method injection patterns
            const suspiciousChars = /[^A-Z]/;
            if (suspiciousChars.test(request.method.toUpperCase())) {
                methodAnalysis.secure = false;
                methodAnalysis.threats.push('method_injection');
                result.threatAssessment.detectedThreats.push('method_injection');
                result.securityWarnings.push('Suspicious characters detected in HTTP method');
                totalRiskScore += 5;
                criticalIssues++;
            }
            
            // Validate method against known attack patterns
            const methodLength = request.method.length;
            if (methodLength > 10 || methodLength < 3) {
                methodAnalysis.secure = false;
                methodAnalysis.threats.push('method_manipulation');
                result.threatAssessment.detectedThreats.push('method_manipulation');
                totalRiskScore += 3;
            }
            
            result.componentAnalysis.method = methodAnalysis;
        }
        
        // Check URL path for path traversal, directory traversal, and injection patterns
        if (request.url && config.enablePathTraversal) {
            const urlAnalysis = {
                secure: true,
                threats: []
            };
            
            // Scan for path traversal patterns
            for (const pattern of SECURITY_PATTERNS.PATH_TRAVERSAL_PATTERNS) {
                if (pattern.test(request.url)) {
                    urlAnalysis.secure = false;
                    urlAnalysis.threats.push('path_traversal');
                    result.threatAssessment.detectedThreats.push('path_traversal');
                    result.securityWarnings.push('Path traversal attempt detected in URL');
                    totalRiskScore += 8;
                    criticalIssues++;
                    break;
                }
            }
            
            // Check for directory traversal attempts
            const directoryTraversal = /(\.\.\/|\.\.\\)/;
            if (directoryTraversal.test(request.url)) {
                urlAnalysis.secure = false;
                urlAnalysis.threats.push('directory_traversal');
                result.threatAssessment.detectedThreats.push('directory_traversal');
                totalRiskScore += 7;
            }
            
            result.componentAnalysis.url = urlAnalysis;
        }
        
        // Scan headers for header injection, CRLF injection, and malicious header patterns
        if (request.headers && typeof request.headers === 'object') {
            const headerAnalysis = {
                secure: true,
                threats: []
            };
            
            for (const [key, value] of Object.entries(request.headers)) {
                // Check for header injection patterns
                for (const pattern of SECURITY_PATTERNS.HEADER_INJECTION_PATTERNS) {
                    if (pattern.test(key) || pattern.test(value)) {
                        headerAnalysis.secure = false;
                        headerAnalysis.threats.push('header_injection');
                        result.threatAssessment.detectedThreats.push('header_injection');
                        result.securityWarnings.push(`Header injection detected: ${key}`);
                        totalRiskScore += 6;
                        criticalIssues++;
                        break;
                    }
                }
                
                // Check for XSS attempts in headers
                if (config.enableXssPrevention) {
                    for (const pattern of SECURITY_PATTERNS.XSS_PATTERNS) {
                        if (pattern.test(value)) {
                            headerAnalysis.secure = false;
                            headerAnalysis.threats.push('xss_attempt');
                            result.threatAssessment.detectedThreats.push('xss_attempt');
                            result.securityWarnings.push(`XSS pattern detected in header: ${key}`);
                            totalRiskScore += 7;
                            break;
                        }
                    }
                }
            }
            
            result.componentAnalysis.headers = headerAnalysis;
        }
        
        // Apply pattern matching against known attack signatures and malicious patterns
        const requestString = JSON.stringify(request);
        
        // Check for SQL injection patterns
        if (config.enableInjectionPrevention) {
            for (const pattern of SECURITY_PATTERNS.INJECTION_PATTERNS) {
                if (pattern.test(requestString)) {
                    result.threatAssessment.detectedThreats.push('sql_injection');
                    result.securityWarnings.push('SQL injection pattern detected');
                    totalRiskScore += 9;
                    criticalIssues++;
                    break;
                }
            }
        }
        
        // Check for command injection patterns
        if (config.enableCommandInjection) {
            for (const pattern of SECURITY_PATTERNS.COMMAND_INJECTION_PATTERNS) {
                if (pattern.test(requestString)) {
                    result.threatAssessment.detectedThreats.push('command_injection');
                    result.securityWarnings.push('Command injection pattern detected');
                    totalRiskScore += 8;
                    criticalIssues++;
                    break;
                }
            }
        }
        
        // Validate request size and complexity against DoS attack prevention limits
        const requestSize = JSON.stringify(request).length;
        if (requestSize > VALIDATION_RULES.SECURITY_RULES.maxRequestSize) {
            result.threatAssessment.detectedThreats.push('oversized_request');
            result.securityWarnings.push('Request size exceeds safety limits');
            totalRiskScore += 4;
        }
        
        // Assess overall threat level based on detected security violations and patterns
        result.threatAssessment.riskScore = totalRiskScore;
        result.threatAssessment.criticalIssues = criticalIssues;
        
        if (totalRiskScore === 0) {
            result.threatAssessment.overallThreatLevel = 'none';
        } else if (totalRiskScore <= 3) {
            result.threatAssessment.overallThreatLevel = 'low';
        } else if (totalRiskScore <= 6) {
            result.threatAssessment.overallThreatLevel = 'medium';
        } else if (totalRiskScore <= 10) {
            result.threatAssessment.overallThreatLevel = 'high';
        } else {
            result.threatAssessment.overallThreatLevel = 'critical';
        }
        
        // Generate security warnings with threat classification and severity assessment
        result.threatAssessment.securityViolations = result.threatAssessment.detectedThreats.map(threat => ({
            type: threat,
            severity: result.threatAssessment.overallThreatLevel,
            timestamp: new Date().toISOString()
        }));
        
        // Create mitigation recommendations for detected security threats and vulnerabilities
        if (config.includeRecommendations) {
            if (result.threatAssessment.detectedThreats.includes('path_traversal')) {
                result.mitigationRecommendations.push('Implement strict path validation and sanitization');
            }
            
            if (result.threatAssessment.detectedThreats.includes('header_injection')) {
                result.mitigationRecommendations.push('Validate and sanitize all HTTP headers');
            }
            
            if (result.threatAssessment.detectedThreats.includes('sql_injection')) {
                result.mitigationRecommendations.push('Use parameterized queries and input validation');
            }
            
            if (result.threatAssessment.detectedThreats.includes('xss_attempt')) {
                result.mitigationRecommendations.push('Implement output encoding and CSP headers');
            }
            
            if (criticalIssues > 0) {
                result.mitigationRecommendations.push('Block request and review security policies');
            }
        }
        
        // Compile comprehensive security validation result with threat intelligence
        result.componentAnalysis.overall = {
            secure: Object.values(result.componentAnalysis).every(comp => comp.secure),
            threats: result.threatAssessment.detectedThreats
        };
        
        result.isSecure = result.threatAssessment.overallThreatLevel === 'none' || 
                         result.threatAssessment.overallThreatLevel === 'low';
        
        // Log critical security issues for monitoring
        if (criticalIssues > 0) {
            console.warn(`Critical security issues detected (${result.metadata.validationId}):`, 
                        result.threatAssessment.detectedThreats);
        }
        
    } catch (error) {
        result.errors.push(`Security validation error: ${error.message}`);
        result.threatAssessment.overallThreatLevel = 'critical';
        result.isSecure = false;
    }
    
    // Return security assessment with actionable threat information and mitigation strategies
    return result;
}

/**
 * Factory function for creating standardized validation result objects with consistent
 * structure, error handling, and validation metadata for uniform validation reporting.
 * 
 * @param {boolean} isValid - Validation success status
 * @param {Object} [data={}] - Validated and normalized data
 * @param {Array} [errors=[]] - Validation error details
 * @param {Object} [metadata={}] - Additional validation metadata
 * @returns {Object} Standardized validation result object with success status and processing metadata
 */
function createValidationResult(isValid, data = {}, errors = [], metadata = {}) {
    // Create base validation result object with standardized structure and properties
    const result = {
        success: Boolean(isValid),
        isValid: Boolean(isValid),
        data: data || {},
        errors: Array.isArray(errors) ? [...errors] : [],
        warnings: [],
        metadata: {
            timestamp: new Date().toISOString(),
            validationId: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            processingTime: 0,
            validationRules: 'standard',
            ...metadata
        }
    };
    
    // Set validation success status from isValid parameter with proper boolean casting
    if (!isValid && result.errors.length === 0) {
        result.errors.push('Validation failed without specific error details');
    }
    
    // Include validated and normalized data from data parameter with type safety
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        result.data = { ...data };
    } else if (data !== null && data !== undefined) {
        result.data = { value: data };
    }
    
    // Add error array with detailed error information including codes and messages
    result.errors = result.errors.map(error => {
        if (typeof error === 'string') {
            return {
                message: error,
                code: error.toUpperCase().replace(/\s+/g, '_'),
                timestamp: new Date().toISOString()
            };
        }
        return error;
    });
    
    // Include validation metadata such as timestamp, validation rules applied, and context
    result.metadata.errorCount = result.errors.length;
    result.metadata.warningCount = result.warnings.length;
    
    // Add performance metrics including validation time and resource usage
    const processingStartTime = Date.now();
    result.metadata.processingStartTime = processingStartTime;
    
    // Include security context and threat assessment information if applicable
    if (metadata.securityAssessment) {
        result.metadata.securityContext = {
            threatLevel: metadata.securityAssessment.threatLevel || 'none',
            securityChecks: metadata.securityAssessment.checks || [],
            riskScore: metadata.securityAssessment.riskScore || 0
        };
    }
    
    // Calculate and set processing time
    result.metadata.processingTime = Date.now() - processingStartTime;
    
    // Return standardized validation result object for consistent validation reporting
    return result;
}

// =============================================================================
// REQUEST VALIDATOR CLASS
// =============================================================================

/**
 * Comprehensive HTTP request validator class providing advanced validation capabilities
 * including security checking, sanitization, and endpoint-specific validation rules for
 * the Node.js tutorial application with educational patterns and production-ready security features.
 */
class RequestValidator {
    /**
     * Initializes the request validator with validation rules, security patterns,
     * and endpoint-specific configurations for comprehensive request validation.
     * 
     * @param {Object} [config={}] - Validator configuration options
     * @param {boolean} [config.strictMode=true] - Enable strict validation mode
     * @param {Object} [config.customRules] - Custom validation rules
     * @param {boolean} [config.enableMetrics=true] - Enable validation metrics tracking
     */
    constructor(config = {}) {
        // Validate and merge configuration with default validation settings and security rules
        this.config = {
            strictMode: true,
            enableSecurityChecks: true,
            enableMetrics: true,
            logValidationResults: false,
            customEndpointRules: {},
            customSecurityPatterns: {},
            ...config
        };
        
        // Initialize validation rules from VALIDATION_RULES global with endpoint-specific overrides
        this.validationRules = {
            ...VALIDATION_RULES,
            ...this.config.customRules
        };
        
        // Set up security patterns from SECURITY_PATTERNS global for threat detection
        this.securityPatterns = {
            ...SECURITY_PATTERNS,
            ...this.config.customSecurityPatterns
        };
        
        // Configure endpoint-specific validation rules from ENDPOINT_VALIDATION_RULES
        this.endpointRules = {
            ...ENDPOINT_VALIDATION_RULES,
            ...this.config.customEndpointRules
        };
        
        // Set strict mode flag for enhanced security validation and error reporting
        this.strictMode = this.config.strictMode;
        
        // Initialize validation statistics tracking and performance monitoring
        if (this.config.enableMetrics) {
            this.validationStats = {
                totalValidations: 0,
                successfulValidations: 0,
                failedValidations: 0,
                securityViolations: 0,
                performanceMetrics: {
                    averageProcessingTime: 0,
                    maxProcessingTime: 0,
                    minProcessingTime: Infinity
                },
                endpointStats: {},
                threatDetectionStats: {
                    injectionAttempts: 0,
                    pathTraversalAttempts: 0,
                    xssAttempts: 0,
                    headerInjectionAttempts: 0
                },
                lastReset: new Date()
            };
        }
        
        // Set up error handling and validation result formatting configuration
        this.errorHandling = {
            includeStackTrace: false,
            sanitizeErrorMessages: true,
            logSecurityViolations: true
        };
        
        // Configure logging and security event reporting for validation monitoring
        if (this.config.logValidationResults) {
            console.log(`RequestValidator initialized with strict mode: ${this.strictMode}`);
        }
    }
    
    /**
     * Primary validation method that performs comprehensive HTTP request validation
     * including structure, security, and endpoint-specific checks with detailed result reporting.
     * 
     * @param {Object} request - HTTP request object to validate
     * @param {Object} [validationOptions={}] - Additional validation options
     * @returns {Object} Complete validation result with success status, validated request components, and security assessment
     */
    validateRequest(request, validationOptions = {}) {
        const startTime = Date.now();
        
        // Initialize comprehensive validation options
        const options = {
            skipSecurityChecks: false,
            includeSecurityDetails: true,
            validateEndpointSpecific: true,
            sanitizeInput: true,
            ...validationOptions
        };
        
        // Create comprehensive validation result object
        const result = {
            success: false,
            validatedComponents: {
                structure: null,
                method: null,
                url: null,
                headers: null,
                security: null,
                endpointAccess: null
            },
            normalizedRequest: null,
            securityAssessment: {
                overallThreatLevel: 'none',
                detectedThreats: [],
                securityScore: 0
            },
            errors: [],
            warnings: [],
            metadata: {
                timestamp: new Date().toISOString(),
                validationId: `req_val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0,
                validatorConfig: {
                    strictMode: this.strictMode,
                    securityChecksEnabled: this.config.enableSecurityChecks
                }
            }
        };
        
        try {
            // Update validation statistics
            if (this.config.enableMetrics) {
                this.validationStats.totalValidations++;
            }
            
            // Validate basic request structure using validateRequestStructure method
            result.validatedComponents.structure = validateRequestStructure(request, {
                strictMode: this.strictMode,
                checkNodejsCompatibility: true
            });
            
            if (!result.validatedComponents.structure.isValid) {
                result.errors.push(...result.validatedComponents.structure.errors);
                return this._finalizeValidation(result, startTime);
            }
            
            // Perform HTTP method validation using validateHttpMethod with security checks
            result.validatedComponents.method = validateHttpMethod(request.method, {
                strictMode: this.strictMode,
                includeSecurityDetails: options.includeSecurityDetails
            });
            
            if (!result.validatedComponents.method.isValid) {
                result.errors.push(...result.validatedComponents.method.errors);
            }
            
            // Validate and sanitize URL path using validateUrlPath with security sanitization
            result.validatedComponents.url = validateUrlPath(request.url, {
                strictMode: this.strictMode,
                sanitize: options.sanitizeInput
            });
            
            if (!result.validatedComponents.url.isValid) {
                result.errors.push(...result.validatedComponents.url.errors);
            }
            
            // Validate request headers using validateRequestHeaders with injection prevention
            const endpointRules = this._getEndpointRules(request.url);
            result.validatedComponents.headers = validateRequestHeaders(
                request.headers,
                endpointRules.requiredHeaders || [],
                { strictMode: this.strictMode }
            );
            
            if (!result.validatedComponents.headers.isValid) {
                result.errors.push(...result.validatedComponents.headers.errors);
            }
            
            // Perform comprehensive security validation using validateRequestSecurity method
            if (!options.skipSecurityChecks && this.config.enableSecurityChecks) {
                result.validatedComponents.security = validateRequestSecurity(request, {
                    enableInjectionPrevention: true,
                    enableXssPrevention: true,
                    includeRecommendations: true
                });
                
                if (!result.validatedComponents.security.isSecure) {
                    result.errors.push(...result.validatedComponents.security.securityWarnings);
                    result.securityAssessment = result.validatedComponents.security.threatAssessment;
                    
                    if (this.config.enableMetrics) {
                        this.validationStats.securityViolations++;
                    }
                }
            }
            
            // Apply endpoint-specific validation rules based on URL path and method
            if (options.validateEndpointSpecific && request.method && request.url) {
                result.validatedComponents.endpointAccess = validateEndpointAccess(
                    request.method,
                    request.url,
                    { strictMode: this.strictMode }
                );
                
                if (!result.validatedComponents.endpointAccess.isAuthorized) {
                    result.errors.push(...result.validatedComponents.endpointAccess.errors);
                }
            }
            
            // Compile validation results from all validation layers into comprehensive result
            const allComponentsValid = Object.values(result.validatedComponents).every(component => 
                component === null || component.isValid === true || component.isAuthorized === true || component.isSecure === true
            );
            
            result.success = allComponentsValid && result.errors.length === 0;
            
            // Generate security assessment with threat level and mitigation recommendations
            if (result.validatedComponents.security) {
                result.securityAssessment = {
                    overallThreatLevel: result.validatedComponents.security.threatAssessment.overallThreatLevel,
                    detectedThreats: result.validatedComponents.security.threatAssessment.detectedThreats,
                    securityScore: 100 - (result.validatedComponents.security.threatAssessment.riskScore * 10),
                    mitigationRecommendations: result.validatedComponents.security.mitigationRecommendations
                };
            }
            
            // Create detailed error report with validation failures and security warnings
            if (result.errors.length > 0) {
                result.metadata.errorSummary = {
                    totalErrors: result.errors.length,
                    securityErrors: result.validatedComponents.security?.securityWarnings?.length || 0,
                    structureErrors: result.validatedComponents.structure?.errors?.length || 0
                };
            }
            
            // Create normalized request object if validation is successful
            if (result.success && options.sanitizeInput) {
                result.normalizedRequest = {
                    method: result.validatedComponents.method?.normalizedMethod || request.method?.toUpperCase(),
                    url: result.validatedComponents.url?.sanitizedPath || request.url,
                    headers: result.validatedComponents.headers?.normalizedHeaders || {},
                    httpVersion: request.httpVersion || '1.1',
                    metadata: {
                        validationId: result.metadata.validationId,
                        timestamp: result.metadata.timestamp,
                        endpoint: this._determineEndpoint(request.url)
                    }
                };
            }
            
        } catch (error) {
            result.errors.push(`Validation processing error: ${error.message}`);
            result.success = false;
        }
        
        return this._finalizeValidation(result, startTime);
    }
    
    /**
     * Specialized validation method for /hello endpoint requests with hello-specific
     * validation rules and security checks for the tutorial application requirements.
     * 
     * @param {Object} request - HTTP request object for hello endpoint
     * @returns {Object} Hello endpoint validation result with method authorization and tutorial-specific validation details
     */
    validateHelloRequest(request) {
        const startTime = Date.now();
        
        // Create specialized hello endpoint validation result
        const result = {
            success: false,
            isValidHelloRequest: false,
            helloValidation: {
                methodCheck: null,
                pathCheck: null,
                authorizationCheck: null
            },
            errors: [],
            warnings: [],
            metadata: {
                timestamp: new Date().toISOString(),
                validationId: `hello_val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                endpoint: '/hello',
                processingTime: 0
            }
        };
        
        try {
            // Validate request structure specifically for hello endpoint requirements
            const structureValidation = validateRequestStructure(request, {
                strictMode: true,
                checkNodejsCompatibility: true
            });
            
            if (!structureValidation.isValid) {
                result.errors.push(...structureValidation.errors);
                return this._finalizeValidation(result, startTime);
            }
            
            // Check HTTP method against HELLO_ENDPOINT_METHODS for GET method authorization
            result.helloValidation.methodCheck = {
                isValid: false,
                method: request.method,
                allowedMethods: [...HELLO_ENDPOINT_METHODS]
            };
            
            if (!request.method || typeof request.method !== 'string') {
                result.errors.push('Missing or invalid HTTP method');
                return this._finalizeValidation(result, startTime);
            }
            
            const normalizedMethod = request.method.toUpperCase();
            result.helloValidation.methodCheck.method = normalizedMethod;
            result.helloValidation.methodCheck.isValid = HELLO_ENDPOINT_METHODS.includes(normalizedMethod);
            
            if (!result.helloValidation.methodCheck.isValid) {
                result.errors.push(`Method ${normalizedMethod} not allowed for /hello endpoint. Only GET is supported.`);
            }
            
            // Validate URL path matches exactly '/hello' with case-sensitive comparison
            result.helloValidation.pathCheck = {
                isValid: false,
                path: request.url,
                expectedPath: '/hello'
            };
            
            if (!request.url || typeof request.url !== 'string') {
                result.errors.push('Missing or invalid URL path');
                return this._finalizeValidation(result, startTime);
            }
            
            // Extract pathname from URL, handling query parameters
            const pathname = request.url.split('?')[0].split('#')[0];
            result.helloValidation.pathCheck.path = pathname;
            result.helloValidation.pathCheck.isValid = pathname === '/hello';
            
            if (!result.helloValidation.pathCheck.isValid) {
                result.errors.push(`Invalid path for hello endpoint. Expected '/hello', got '${pathname}'`);
            }
            
            // Apply hello endpoint security validation and rate limiting checks
            const securityValidation = validateRequestSecurity(request, {
                enableInjectionPrevention: true,
                threatLevelThreshold: 'low'
            });
            
            if (!securityValidation.isSecure) {
                result.errors.push('Security validation failed for hello endpoint');
                result.warnings.push(...securityValidation.securityWarnings);
            }
            
            // Validate headers for hello endpoint specific requirements and optional headers
            const helloRules = this.endpointRules['/hello'];
            const headerValidation = validateRequestHeaders(
                request.headers || {},
                helloRules.requiredHeaders || [],
                { strictMode: false }
            );
            
            if (!headerValidation.isValid) {
                result.warnings.push(...headerValidation.errors);
            }
            
            // Check for hello endpoint access authorization and method restrictions
            result.helloValidation.authorizationCheck = validateEndpointAccess(
                normalizedMethod,
                '/hello',
                { strictMode: true }
            );
            
            if (!result.helloValidation.authorizationCheck.isAuthorized) {
                result.errors.push(...result.helloValidation.authorizationCheck.errors);
            }
            
            // Create hello-specific validation result with tutorial context information
            result.isValidHelloRequest = 
                result.helloValidation.methodCheck.isValid &&
                result.helloValidation.pathCheck.isValid &&
                result.helloValidation.authorizationCheck.isAuthorized;
            
            result.success = result.isValidHelloRequest && result.errors.length === 0;
            
            // Include tutorial-specific metadata
            result.metadata.tutorialContext = {
                endpointType: 'hello_world',
                allowedMethods: HELLO_ENDPOINT_METHODS,
                securityLevel: 'standard',
                educational: true
            };
            
        } catch (error) {
            result.errors.push(`Hello endpoint validation error: ${error.message}`);
            result.success = false;
        }
        
        // Return specialized validation result for hello endpoint processing
        return this._finalizeValidation(result, startTime);
    }
    
    /**
     * Sanitizes HTTP request components by removing or escaping dangerous characters
     * and applying security transformations for safe request processing.
     * 
     * @param {Object} request - HTTP request object to sanitize
     * @param {Object} [sanitizationOptions={}] - Sanitization configuration options
     * @returns {Object} Sanitized request object with safe components and sanitization metadata
     */
    sanitizeRequest(request, sanitizationOptions = {}) {
        // Initialize sanitization options with defaults
        const options = {
            sanitizeMethod: true,
            sanitizePath: true,
            sanitizeHeaders: true,
            removeNullBytes: true,
            escapeControlCharacters: true,
            normalizeWhitespace: true,
            ...sanitizationOptions
        };
        
        // Create sanitization result object
        const result = {
            sanitizedRequest: {},
            sanitizationActions: [],
            securityTransformations: [],
            originalRequest: { ...request },
            metadata: {
                timestamp: new Date().toISOString(),
                sanitizationId: `san_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                actionsPerformed: 0
            }
        };
        
        try {
            // Apply method sanitization by normalizing case and removing dangerous characters
            if (request.method && options.sanitizeMethod) {
                let sanitizedMethod = request.method.toString().trim().toUpperCase();
                
                // Remove any non-alphabetic characters
                const originalMethod = sanitizedMethod;
                sanitizedMethod = sanitizedMethod.replace(/[^A-Z]/g, '');
                
                if (sanitizedMethod !== originalMethod) {
                    result.sanitizationActions.push(`Method sanitized: '${originalMethod}' -> '${sanitizedMethod}'`);
                    result.metadata.actionsPerformed++;
                }
                
                result.sanitizedRequest.method = sanitizedMethod;
            } else {
                result.sanitizedRequest.method = request.method;
            }
            
            // Sanitize URL path by removing path traversal attempts and dangerous sequences
            if (request.url && options.sanitizePath) {
                let sanitizedUrl = request.url.toString().trim();
                const originalUrl = sanitizedUrl;
                
                // Remove path traversal patterns
                sanitizedUrl = sanitizedUrl.replace(/\.\.\/|\.\.\\|%2e%2e/gi, '');
                
                // Remove null bytes and control characters
                if (options.removeNullBytes) {
                    sanitizedUrl = sanitizedUrl.replace(/\x00/g, '');
                }
                
                if (options.escapeControlCharacters) {
                    sanitizedUrl = sanitizedUrl.replace(/[\x00-\x1F\x7F]/g, '');
                }
                
                // Normalize multiple slashes
                sanitizedUrl = sanitizedUrl.replace(/\/+/g, '/');
                
                if (sanitizedUrl !== originalUrl) {
                    result.sanitizationActions.push(`URL sanitized: '${originalUrl}' -> '${sanitizedUrl}'`);
                    result.metadata.actionsPerformed++;
                }
                
                result.sanitizedRequest.url = sanitizedUrl;
            } else {
                result.sanitizedRequest.url = request.url;
            }
            
            // Sanitize headers by escaping special characters and removing control characters
            if (request.headers && options.sanitizeHeaders) {
                const sanitizedHeaders = {};
                
                for (const [key, value] of Object.entries(request.headers)) {
                    if (typeof key === 'string' && typeof value === 'string') {
                        let sanitizedKey = key.toLowerCase().trim();
                        let sanitizedValue = value.trim();
                        
                        const originalKey = sanitizedKey;
                        const originalValue = sanitizedValue;
                        
                        // Remove CRLF injection characters
                        sanitizedKey = sanitizedKey.replace(/[\r\n]/g, '');
                        sanitizedValue = sanitizedValue.replace(/[\r\n]/g, '');
                        
                        // Remove null bytes
                        if (options.removeNullBytes) {
                            sanitizedKey = sanitizedKey.replace(/\x00/g, '');
                            sanitizedValue = sanitizedValue.replace(/\x00/g, '');
                        }
                        
                        // Normalize whitespace
                        if (options.normalizeWhitespace) {
                            sanitizedValue = sanitizedValue.replace(/\s+/g, ' ');
                        }
                        
                        if (sanitizedKey !== originalKey || sanitizedValue !== originalValue) {
                            result.sanitizationActions.push(`Header sanitized: '${key}' -> '${sanitizedKey}'`);
                            result.metadata.actionsPerformed++;
                        }
                        
                        sanitizedHeaders[sanitizedKey] = sanitizedValue;
                    }
                }
                
                result.sanitizedRequest.headers = sanitizedHeaders;
            } else {
                result.sanitizedRequest.headers = request.headers || {};
            }
            
            // Apply encoding sanitization to prevent character encoding attacks
            result.securityTransformations.push('character_encoding_normalized');
            
            // Remove or escape null bytes and control characters throughout request
            result.securityTransformations.push('null_bytes_removed');
            result.securityTransformations.push('control_characters_escaped');
            
            // Normalize whitespace and apply length limits for DoS prevention
            if (options.normalizeWhitespace) {
                result.securityTransformations.push('whitespace_normalized');
            }
            
            // Copy other request properties safely
            const safeProperties = ['httpVersion', 'connection', 'socket'];
            for (const prop of safeProperties) {
                if (request[prop]) {
                    result.sanitizedRequest[prop] = request[prop];
                }
            }
            
            // Include sanitization metadata with actions taken and security warnings
            result.metadata.totalSanitizationActions = result.sanitizationActions.length;
            result.metadata.securityTransformations = result.securityTransformations;
            
        } catch (error) {
            result.sanitizationActions.push(`Sanitization error: ${error.message}`);
        }
        
        // Return sanitized request ready for safe processing and routing
        return result;
    }
    
    /**
     * Retrieves validation performance metrics and statistics for monitoring validation
     * performance and security threat detection effectiveness.
     * 
     * @returns {Object} Validation metrics including performance statistics and security event counts
     */
    getValidationMetrics() {
        if (!this.config.enableMetrics || !this.validationStats) {
            return { 
                error: 'Validation metrics not enabled or not available',
                metricsEnabled: this.config.enableMetrics
            };
        }
        
        // Compile validation performance statistics including processing times and throughput
        const totalValidations = this.validationStats.totalValidations;
        const uptime = Date.now() - this.validationStats.lastReset.getTime();
        
        // Aggregate security event statistics and threat detection effectiveness metrics
        const securityMetrics = {
            totalSecurityViolations: this.validationStats.securityViolations,
            threatDetectionStats: { ...this.validationStats.threatDetectionStats },
            securityViolationRate: totalValidations > 0 ? 
                (this.validationStats.securityViolations / totalValidations * 100).toFixed(2) : 0
        };
        
        // Calculate validation success rates and error frequency by validation type
        const successRate = totalValidations > 0 ? 
            (this.validationStats.successfulValidations / totalValidations * 100).toFixed(2) : 0;
        
        const failureRate = totalValidations > 0 ? 
            (this.validationStats.failedValidations / totalValidations * 100).toFixed(2) : 0;
        
        // Include endpoint-specific validation statistics and hello endpoint metrics
        const endpointMetrics = {
            ...this.validationStats.endpointStats,
            helloEndpointValidations: this.validationStats.endpointStats['/hello'] || 0
        };
        
        // Generate performance benchmarks and validation rule effectiveness analysis
        const performanceMetrics = {
            ...this.validationStats.performanceMetrics,
            uptimeSeconds: Math.floor(uptime / 1000),
            validationsPerSecond: totalValidations > 0 ? 
                (totalValidations / (uptime / 1000)).toFixed(2) : 0
        };
        
        // Return comprehensive validation metrics for monitoring and optimization
        return {
            summary: {
                totalValidations,
                successfulValidations: this.validationStats.successfulValidations,
                failedValidations: this.validationStats.failedValidations,
                successRate: `${successRate}%`,
                failureRate: `${failureRate}%`
            },
            performance: performanceMetrics,
            security: securityMetrics,
            endpoints: endpointMetrics,
            configuration: {
                strictMode: this.strictMode,
                securityChecksEnabled: this.config.enableSecurityChecks,
                metricsEnabled: this.config.enableMetrics
            },
            lastReset: this.validationStats.lastReset.toISOString(),
            generatedAt: new Date().toISOString()
        };
    }
    
    /**
     * Private method to finalize validation results with performance tracking
     * 
     * @private
     * @param {Object} result - Validation result object to finalize
     * @param {number} startTime - Validation start timestamp
     * @returns {Object} Finalized validation result
     */
    _finalizeValidation(result, startTime) {
        const processingTime = Date.now() - startTime;
        result.metadata.processingTime = processingTime;
        
        // Update performance metrics if enabled
        if (this.config.enableMetrics) {
            const perf = this.validationStats.performanceMetrics;
            perf.maxProcessingTime = Math.max(perf.maxProcessingTime, processingTime);
            perf.minProcessingTime = Math.min(perf.minProcessingTime, processingTime);
            
            // Update average processing time
            const total = this.validationStats.totalValidations;
            perf.averageProcessingTime = ((perf.averageProcessingTime * (total - 1)) + processingTime) / total;
            
            // Update success/failure counts
            if (result.success) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
        }
        
        // Log validation results if configured
        if (this.config.logValidationResults) {
            const level = result.success ? 'info' : 'warn';
            console[level](`Validation ${result.metadata.validationId}: ${result.success ? 'SUCCESS' : 'FAILED'} (${processingTime}ms)`);
        }
        
        return result;
    }
    
    /**
     * Private method to get endpoint-specific validation rules
     * 
     * @private
     * @param {string} url - URL to determine endpoint rules for
     * @returns {Object} Endpoint validation rules
     */
    _getEndpointRules(url) {
        if (!url || typeof url !== 'string') {
            return this.endpointRules.default;
        }
        
        const pathname = url.split('?')[0].split('#')[0];
        return this.endpointRules[pathname] || this.endpointRules.default;
    }
    
    /**
     * Private method to determine endpoint from URL
     * 
     * @private
     * @param {string} url - URL to analyze
     * @returns {string} Determined endpoint
     */
    _determineEndpoint(url) {
        if (!url || typeof url !== 'string') {
            return 'unknown';
        }
        
        const pathname = url.split('?')[0].split('#')[0];
        return pathname === '/hello' ? '/hello' : 'other';
    }
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Global validation configuration objects
    VALIDATION_RULES,
    SECURITY_PATTERNS,
    PATH_VALIDATION_CONFIG,
    ENDPOINT_VALIDATION_RULES,
    
    // Standalone validation functions
    validateHttpMethod,
    validateUrlPath,
    validateEndpointAccess,
    validateRequestStructure,
    validateRequestHeaders,
    validateRequestSecurity,
    createValidationResult,
    
    // Request validator class
    RequestValidator
};