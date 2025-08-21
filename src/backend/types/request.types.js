/**
 * Request Types Module for Node.js Tutorial Application
 * 
 * Provides comprehensive type definitions, validation schemas, and interfaces for HTTP request objects
 * used throughout the Node.js tutorial application. Implements JSDoc type definitions, validation 
 * schemas, and request structure interfaces for consistent request handling, method validation, 
 * URL processing, and header management across controllers, handlers, and utility modules.
 * 
 * This module demonstrates comprehensive request type patterns for educational clarity and 
 * production-ready request validation, implementing HTTP Request Processing Engine functionality
 * with proper input validation and sanitization for security compliance.
 * 
 * Educational Value:
 * - Demonstrates proper HTTP request structure and component handling
 * - Shows JavaScript type checking patterns using JSDoc for request objects
 * - Teaches comprehensive request validation and security checking
 * - Illustrates separation of type definitions for maintainable code
 * - Demonstrates input validation and security threat prevention
 * - Shows enterprise-grade request processing patterns
 * 
 * @description Type definitions and interfaces for HTTP request objects
 * @author Node.js Tutorial Application
 * @version 1.0.0
 * @license MIT
 */

// Import HTTP method constants and validation utilities
const { 
    HTTP_METHODS, 
    SUPPORTED_METHODS, 
    isValidHttpMethod, 
    isMethodAllowedForEndpoint,
    validateMethodAuthorization 
} = require('../constants/http-methods.js'); // v1.0.0

// Import HTTP header constants for request header validation
const { HTTP_HEADERS } = require('../constants/http-headers.js'); // v1.0.0

// Import error message constants using ES6 import syntax compatibility
const {
    ERROR_MESSAGES,
    VALIDATION_ERROR_MESSAGES,
    ENDPOINT_ERROR_MESSAGES
} = require('../constants/error-messages.js'); // v1.0.0

// =============================================================================
// JSDOC TYPE DEFINITIONS
// =============================================================================

/**
 * @typedef {Object} HTTPRequest
 * @description Raw HTTP request object as received by Node.js HTTP server
 * @property {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @property {string} url - Full URL path including query parameters
 * @property {Object} headers - HTTP request headers with original case keys
 * @property {string} httpVersion - HTTP protocol version (1.1, 2.0)
 * @property {Object} connection - TCP connection information and socket details
 * @property {Object} socket - Network socket object for connection details
 */

/**
 * @typedef {Object} ParsedRequest
 * @description Processed and normalized HTTP request object with extracted components
 * @property {string} method - Normalized HTTP method in uppercase
 * @property {string} url - Original URL for reference
 * @property {string} pathname - URL pathname without query parameters
 * @property {Object} query - Parsed query parameters as key-value pairs
 * @property {RequestHeaders} headers - Normalized headers with lowercase keys
 * @property {RequestMetadata} metadata - Request processing metadata and context
 * @property {boolean} isValid - Overall request validation status
 * @property {Array} errors - Validation error messages if any
 */

/**
 * @typedef {Object} RequestHeaders
 * @description HTTP request headers object with normalized lowercase keys
 * @property {string} [content-type] - MIME type of request body content
 * @property {string} [content-length] - Size of request body in bytes
 * @property {string} [host] - Target host for the request
 * @property {string} [user-agent] - Client application identification string
 * @property {string} [connection] - Connection management directive (keep-alive, close)
 * @property {string} [accept] - Acceptable response content types
 * @property {string} [accept-encoding] - Acceptable response compression formats
 */

/**
 * @typedef {Object} RequestMetadata
 * @description Request processing metadata and context information
 * @property {string} correlationId - Unique request identifier for tracking
 * @property {number} timestamp - Request reception timestamp
 * @property {number} processingStartTime - Processing start time for performance tracking
 * @property {string} clientIp - Client IP address from connection or headers
 * @property {string} userAgent - Client user agent string
 * @property {string} protocol - HTTP protocol version
 * @property {string} connectionType - Connection type (keep-alive, close)
 * @property {number} requestSize - Total request size in bytes
 */

/**
 * @typedef {Object} ValidatedRequest
 * @description Complete validated and processed request object ready for routing
 * @property {HTTPRequest} original - Original request object for reference
 * @property {ParsedRequest} parsed - Parsed and normalized request components
 * @property {Object} validation - Validation results and status information
 * @property {string} endpoint - Determined endpoint based on URL path
 * @property {Array} allowedMethods - Methods allowed for the determined endpoint
 * @property {boolean} isAuthorized - Whether method is authorized for endpoint
 * @property {Object} securityChecks - Security validation results and warnings
 */

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * Validation schema for /hello endpoint requests with comprehensive security checks
 * @constant {Object} HELLO_REQUEST
 */
const HELLO_REQUEST = {
    description: 'Validation schema for /hello endpoint requests',
    requiredMethod: HTTP_METHODS.GET,
    allowedMethods: [HTTP_METHODS.GET],
    expectedPath: '/hello',
    pathPattern: '^/hello$',
    requiredHeaders: [],
    optionalHeaders: ['user-agent', 'accept', 'accept-encoding', 'host', 'connection'],
    maxUrlLength: 50,
    securityChecks: ['path_traversal', 'method_injection', 'header_validation'],
    validation: {
        strictMode: true,
        caseSensitive: false,
        allowQueryParams: false,
        validateHostHeader: false
    }
};

/**
 * Default validation schema for general HTTP requests with comprehensive validation
 * @constant {Object} DEFAULT_REQUEST
 */
const DEFAULT_REQUEST = {
    description: 'Default validation schema for general HTTP requests',
    allowedMethods: [
        HTTP_METHODS.GET, 
        HTTP_METHODS.POST, 
        HTTP_METHODS.PUT, 
        HTTP_METHODS.DELETE, 
        HTTP_METHODS.HEAD, 
        HTTP_METHODS.OPTIONS
    ],
    maxUrlLength: 2048,
    maxHeaderSize: 8192,
    requiredHeaders: [],
    securityChecks: ['injection_prevention', 'size_limits', 'character_validation'],
    encoding: 'utf-8',
    validation: {
        strictMode: false,
        caseSensitive: false,
        allowQueryParams: true,
        validateHostHeader: true
    }
};

/**
 * Basic validation schema for minimal request validation requirements
 * @constant {Object} BASIC_REQUEST
 */
const BASIC_REQUEST = {
    description: 'Basic validation schema for minimal request validation',
    requiredProperties: ['method', 'url', 'headers'],
    methodValidation: true,
    urlValidation: true,
    headerValidation: true,
    securityValidation: false,
    strictMode: false,
    validation: {
        requireAllProperties: true,
        allowUndefinedHeaders: true,
        enforceHttpCompliance: true
    }
};

/**
 * Validation schemas object containing all defined schemas
 * @constant {Object} VALIDATION_SCHEMAS
 */
const VALIDATION_SCHEMAS = {
    HELLO_REQUEST,
    DEFAULT_REQUEST,
    BASIC_REQUEST
};

// =============================================================================
// REQUEST TEMPLATES
// =============================================================================

/**
 * Template for /hello GET request with standard headers
 * @constant {Object} HELLO_GET_REQUEST
 */
const HELLO_GET_REQUEST = {
    method: HTTP_METHODS.GET,
    url: '/hello',
    pathname: '/hello',
    query: {},
    headers: {
        [HTTP_HEADERS.HOST]: 'localhost:3000',
        [HTTP_HEADERS.USER_AGENT]: 'Node.js Tutorial Client',
        [HTTP_HEADERS.ACCEPT]: 'text/plain',
        [HTTP_HEADERS.CONNECTION]: 'keep-alive'
    },
    httpVersion: '1.1'
};

/**
 * Template for basic HTTP request structure
 * @constant {Object} BASIC_HTTP_REQUEST
 */
const BASIC_HTTP_REQUEST = {
    method: HTTP_METHODS.GET,
    url: '/',
    pathname: '/',
    query: {},
    headers: {
        [HTTP_HEADERS.HOST]: 'localhost:3000',
        [HTTP_HEADERS.USER_AGENT]: 'HTTP Client',
        [HTTP_HEADERS.CONNECTION]: 'close'
    },
    httpVersion: '1.1'
};

/**
 * Request templates object containing all defined templates
 * @constant {Object} REQUEST_TEMPLATES
 */
const REQUEST_TEMPLATES = {
    HELLO_GET_REQUEST,
    BASIC_HTTP_REQUEST
};

// =============================================================================
// REQUEST TYPE DEFINITIONS
// =============================================================================

/**
 * Object containing all request type definitions for HTTP request processing
 * @constant {Object} REQUEST_TYPES
 */
const REQUEST_TYPES = {
    HTTPRequest: {
        description: 'Raw HTTP request object as received by Node.js HTTP server',
        properties: {
            method: 'string - HTTP method (GET, POST, PUT, DELETE, etc.)',
            url: 'string - Full URL path including query parameters',
            headers: 'object - HTTP request headers with original case keys',
            httpVersion: 'string - HTTP protocol version (1.1, 2.0)',
            connection: 'object - TCP connection information and socket details',
            socket: 'object - Network socket object for connection details'
        }
    },
    ParsedRequest: {
        description: 'Processed and normalized HTTP request object with extracted components',
        properties: {
            method: 'string - Normalized HTTP method in uppercase',
            url: 'string - Original URL for reference',
            pathname: 'string - URL pathname without query parameters',
            query: 'object - Parsed query parameters as key-value pairs',
            headers: 'RequestHeaders - Normalized headers with lowercase keys',
            metadata: 'RequestMetadata - Request processing metadata and context',
            isValid: 'boolean - Overall request validation status',
            errors: 'array - Validation error messages if any'
        }
    },
    RequestHeaders: {
        description: 'HTTP request headers object with normalized lowercase keys',
        properties: {
            'content-type': 'string - MIME type of request body content',
            'content-length': 'string - Size of request body in bytes',
            'host': 'string - Target host for the request',
            'user-agent': 'string - Client application identification string',
            'connection': 'string - Connection management directive (keep-alive, close)',
            'accept': 'string - Acceptable response content types',
            'accept-encoding': 'string - Acceptable response compression formats'
        }
    },
    RequestMetadata: {
        description: 'Request processing metadata and context information',
        properties: {
            correlationId: 'string - Unique request identifier for tracking',
            timestamp: 'number - Request reception timestamp',
            processingStartTime: 'number - Processing start time for performance tracking',
            clientIp: 'string - Client IP address from connection or headers',
            userAgent: 'string - Client user agent string',
            protocol: 'string - HTTP protocol version',
            connectionType: 'string - Connection type (keep-alive, close)',
            requestSize: 'number - Total request size in bytes'
        }
    },
    ValidatedRequest: {
        description: 'Complete validated and processed request object ready for routing',
        properties: {
            original: 'HTTPRequest - Original request object for reference',
            parsed: 'ParsedRequest - Parsed and normalized request components',
            validation: 'object - Validation results and status information',
            endpoint: 'string - Determined endpoint based on URL path',
            allowedMethods: 'array - Methods allowed for the determined endpoint',
            isAuthorized: 'boolean - Whether method is authorized for endpoint',
            securityChecks: 'object - Security validation results and warnings'
        }
    }
};

// =============================================================================
// REQUEST TYPE VALIDATOR CLASS
// =============================================================================

/**
 * RequestTypeValidator class for validating HTTP request objects against defined type schemas
 * with comprehensive validation rules and security checks for production-ready request processing.
 * 
 * Implements enterprise-grade validation patterns including:
 * - HTTP method validation against supported methods whitelist
 * - URL format and security validation with path traversal prevention
 * - Header format validation and injection prevention
 * - Comprehensive security checks and threat prevention
 * 
 * @class RequestTypeValidator
 */
class RequestTypeValidator {
    /**
     * Initialize the request type validator with validation rules and schema definitions
     * 
     * @param {Object} options - Configuration options for validator initialization
     * @param {boolean} [options.strictMode=true] - Enable strict validation mode
     * @param {Array} [options.supportedMethods] - Override supported HTTP methods
     * @param {Object} [options.endpointSchemas] - Custom endpoint validation schemas
     * @param {boolean} [options.enableSecurityChecks=true] - Enable security validation
     */
    constructor(options = {}) {
        // Set default validation options and merge with provided options
        this.options = {
            strictMode: true,
            enableSecurityChecks: true,
            logValidationErrors: true,
            ...options
        };
        
        // Initialize supported HTTP methods from constants
        this.supportedMethods = options.supportedMethods || [...SUPPORTED_METHODS];
        
        // Load endpoint-specific validation schemas
        this.endpointSchemas = {
            '/hello': HELLO_REQUEST,
            'default': DEFAULT_REQUEST,
            ...options.endpointSchemas
        };
        
        // Configure strict mode for enhanced security validation
        this.strictMode = this.options.strictMode;
        
        // Set up validation rule templates and patterns
        this.validationRules = {
            maxUrlLength: 2048,
            maxHeaderSize: 8192,
            maxHeaderCount: 50,
            allowedCharacterPattern: /^[\x20-\x7E]*$/,
            pathTraversalPattern: /\.\./,
            methodInjectionPattern: /[^A-Z]/
        };
        
        // Initialize validation statistics and error tracking
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            securityViolations: 0
        };
    }
    
    /**
     * Validate a complete HTTP request object against the appropriate type schema
     * with comprehensive security checks and validation rules
     * 
     * @param {Object} request - HTTP request object to validate
     * @param {Object} [validationOptions={}] - Additional validation options
     * @param {boolean} [validationOptions.skipSecurityChecks=false] - Skip security validation
     * @param {string} [validationOptions.expectedEndpoint] - Expected endpoint for validation
     * @returns {Object} Comprehensive validation result with success status, errors, and normalized data
     */
    validate(request, validationOptions = {}) {
        // Initialize comprehensive validation result object
        const result = {
            success: false,
            isValid: false,
            request: request,
            normalizedRequest: null,
            validation: {
                method: { valid: false, errors: [] },
                url: { valid: false, errors: [] },
                headers: { valid: false, errors: [] },
                security: { valid: false, errors: [], violations: [] }
            },
            errors: [],
            warnings: [],
            metadata: {
                timestamp: Date.now(),
                validationId: this._generateCorrelationId(),
                processingTime: 0
            }
        };
        
        const startTime = Date.now();
        
        try {
            // Update validation statistics
            this.validationStats.totalValidations++;
            
            // Validate basic request structure and required properties
            const structureValidation = this._validateRequestStructure(request);
            if (!structureValidation.valid) {
                result.errors.push(...structureValidation.errors);
                return this._finalizeValidationResult(result, startTime);
            }
            
            // Determine appropriate validation schema based on request URL and method
            const schema = this._determineValidationSchema(request, validationOptions.expectedEndpoint);
            result.schema = schema;
            
            // Validate HTTP method against supported methods and endpoint rules
            const methodValidation = this.validateMethod(request.method, request.url, schema);
            result.validation.method = methodValidation;
            if (!methodValidation.valid) {
                result.errors.push(...methodValidation.errors);
            }
            
            // Validate URL format, length, and security constraints
            const urlValidation = this.validateUrl(request.url, schema);
            result.validation.url = urlValidation;
            if (!urlValidation.valid) {
                result.errors.push(...urlValidation.errors);
            }
            
            // Validate request headers format and required headers
            const headersValidation = this.validateHeaders(request.headers, schema);
            result.validation.headers = headersValidation;
            if (!headersValidation.valid) {
                result.errors.push(...headersValidation.errors);
            }
            
            // Apply endpoint-specific validation rules and security checks
            if (!validationOptions.skipSecurityChecks && this.options.enableSecurityChecks) {
                const securityValidation = this._performSecurityValidation(request, schema);
                result.validation.security = securityValidation;
                if (!securityValidation.valid) {
                    result.errors.push(...securityValidation.errors);
                    this.validationStats.securityViolations++;
                }
            }
            
            // Create normalized request object if validation passes
            if (result.validation.method.valid && result.validation.url.valid && result.validation.headers.valid) {
                result.normalizedRequest = this._createNormalizedRequest(request, result.validation);
            }
            
            // Compile validation results and determine overall success
            result.success = result.errors.length === 0;
            result.isValid = result.success;
            
            // Update success/failure statistics
            if (result.success) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            
            return this._finalizeValidationResult(result, startTime);
            
        } catch (error) {
            // Handle unexpected validation errors
            result.errors.push(`Validation error: ${error.message}`);
            result.metadata.error = error.message;
            this.validationStats.failedValidations++;
            return this._finalizeValidationResult(result, startTime);
        }
    }
    
    /**
     * Validate HTTP method against supported methods and endpoint-specific restrictions
     * with comprehensive security checks for method injection prevention
     * 
     * @param {string} method - HTTP method to validate
     * @param {string} [endpoint] - Endpoint path for authorization checking
     * @param {Object} [schema] - Validation schema for method restrictions
     * @returns {Object} Method validation result with authorization status and allowed methods
     */
    validateMethod(method, endpoint, schema) {
        const result = {
            valid: false,
            method: method,
            normalizedMethod: null,
            allowedMethods: [],
            isAuthorized: false,
            errors: [],
            securityChecks: {
                formatValidation: false,
                injectionPrevention: false,
                whitelistValidation: false
            }
        };
        
        try {
            // Input validation - ensure method is a valid string
            if (!method || typeof method !== 'string') {
                result.errors.push('Invalid method parameter: must be a non-empty string');
                return result;
            }
            
            // Normalize method to uppercase for consistent validation
            const normalizedMethod = method.trim().toUpperCase();
            result.normalizedMethod = normalizedMethod;
            
            // Security validation for method injection prevention
            result.securityChecks.formatValidation = /^[A-Z]{3,7}$/.test(normalizedMethod);
            if (!result.securityChecks.formatValidation) {
                result.errors.push('Method format validation failed: invalid characters or length');
                return result;
            }
            
            // Validate against supported methods whitelist (injection prevention)
            result.securityChecks.whitelistValidation = this.supportedMethods.includes(normalizedMethod);
            if (!result.securityChecks.whitelistValidation) {
                result.errors.push(`Unsupported HTTP method: ${normalizedMethod}`);
                return result;
            }
            
            // Check method authorization for specific endpoint if provided
            if (endpoint && schema) {
                const allowedMethods = schema.allowedMethods || this.supportedMethods;
                result.allowedMethods = allowedMethods;
                result.isAuthorized = allowedMethods.includes(normalizedMethod);
                
                if (!result.isAuthorized) {
                    result.errors.push(`Method ${normalizedMethod} not allowed for endpoint ${endpoint}`);
                    return result;
                }
            } else {
                result.isAuthorized = true;
                result.allowedMethods = this.supportedMethods;
            }
            
            // Set security check success for injection prevention
            result.securityChecks.injectionPrevention = 
                result.securityChecks.formatValidation && 
                result.securityChecks.whitelistValidation;
            
            // Overall validation success
            result.valid = result.securityChecks.injectionPrevention && result.isAuthorized;
            
        } catch (error) {
            result.errors.push(`Method validation error: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Validate request URL against format, security, and endpoint-specific requirements
     * with comprehensive path traversal prevention and security validation
     * 
     * @param {string} url - Request URL to validate
     * @param {Object} [schema] - URL validation schema with security rules
     * @returns {Object} URL validation result with normalized URL and validation details
     */
    validateUrl(url, schema) {
        const result = {
            valid: false,
            url: url,
            normalizedUrl: null,
            pathname: null,
            query: {},
            errors: [],
            securityChecks: {
                formatValidation: false,
                lengthValidation: false,
                pathTraversalPrevention: false,
                characterValidation: false,
                patternMatching: false
            }
        };
        
        try {
            // Input validation - ensure URL is a valid string
            if (!url || typeof url !== 'string') {
                result.errors.push('Invalid URL parameter: must be a non-empty string');
                return result;
            }
            
            // Normalize URL and validate basic format
            const normalizedUrl = url.trim();
            result.normalizedUrl = normalizedUrl;
            
            // URL length validation for DoS prevention
            const maxLength = schema?.maxUrlLength || this.validationRules.maxUrlLength;
            result.securityChecks.lengthValidation = normalizedUrl.length <= maxLength;
            if (!result.securityChecks.lengthValidation) {
                result.errors.push(`URL length exceeds maximum allowed (${maxLength} characters)`);
                return result;
            }
            
            // Basic URL format validation
            try {
                // Parse URL to extract components
                const urlObj = new URL(normalizedUrl, 'http://localhost:3000');
                result.pathname = urlObj.pathname;
                
                // Parse query parameters if present
                if (urlObj.search) {
                    const params = new URLSearchParams(urlObj.search);
                    for (const [key, value] of params) {
                        result.query[key] = value;
                    }
                }
                
                result.securityChecks.formatValidation = true;
            } catch (urlError) {
                // Fallback to simple path parsing for relative URLs
                const pathMatch = normalizedUrl.match(/^([^?]+)(\?(.*))?$/);
                if (pathMatch) {
                    result.pathname = pathMatch[1];
                    result.securityChecks.formatValidation = true;
                } else {
                    result.errors.push('Invalid URL format');
                    return result;
                }
            }
            
            // Security validation for path traversal prevention
            result.securityChecks.pathTraversalPrevention = !this.validationRules.pathTraversalPattern.test(result.pathname);
            if (!result.securityChecks.pathTraversalPrevention) {
                result.errors.push('Path traversal attempt detected in URL');
                return result;
            }
            
            // Character validation for injection prevention
            result.securityChecks.characterValidation = this.validationRules.allowedCharacterPattern.test(result.pathname);
            if (!result.securityChecks.characterValidation) {
                result.errors.push('Invalid characters detected in URL path');
                return result;
            }
            
            // Schema-specific pattern matching if defined
            if (schema?.pathPattern) {
                const pattern = new RegExp(schema.pathPattern);
                result.securityChecks.patternMatching = pattern.test(result.pathname);
                if (!result.securityChecks.patternMatching) {
                    result.errors.push(`URL path does not match expected pattern: ${schema.pathPattern}`);
                    return result;
                }
            } else {
                result.securityChecks.patternMatching = true;
            }
            
            // Overall validation success
            result.valid = Object.values(result.securityChecks).every(check => check === true);
            
        } catch (error) {
            result.errors.push(`URL validation error: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Validate request headers format, required headers, and security constraints
     * with comprehensive header injection prevention and HTTP compliance validation
     * 
     * @param {Object} headers - Request headers object to validate
     * @param {Object} [schema] - Header validation schema with requirements
     * @returns {Object} Header validation result with normalized headers and validation status
     */
    validateHeaders(headers, schema) {
        const result = {
            valid: false,
            headers: headers,
            normalizedHeaders: {},
            requiredHeaders: [],
            missingHeaders: [],
            invalidHeaders: [],
            errors: [],
            securityChecks: {
                structureValidation: false,
                sizeValidation: false,
                injectionPrevention: false,
                requiredHeadersPresent: false
            }
        };
        
        try {
            // Validate headers object structure and format
            if (!headers || typeof headers !== 'object') {
                result.errors.push('Invalid headers parameter: must be an object');
                return result;
            }
            
            result.securityChecks.structureValidation = true;
            
            // Validate headers size for DoS prevention
            const headerCount = Object.keys(headers).length;
            const maxHeaderCount = this.validationRules.maxHeaderCount;
            result.securityChecks.sizeValidation = headerCount <= maxHeaderCount;
            if (!result.securityChecks.sizeValidation) {
                result.errors.push(`Too many headers: ${headerCount} exceeds maximum ${maxHeaderCount}`);
                return result;
            }
            
            // Normalize header keys to lowercase for HTTP compliance and validate values
            let injectionDetected = false;
            for (const [key, value] of Object.entries(headers)) {
                if (typeof key !== 'string' || typeof value !== 'string') {
                    result.invalidHeaders.push(key);
                    continue;
                }
                
                // Normalize header key to lowercase (HTTP/1.1 compliance)
                const normalizedKey = key.toLowerCase();
                
                // Basic header injection detection
                if (key.includes('\n') || key.includes('\r') || value.includes('\n') || value.includes('\r')) {
                    injectionDetected = true;
                    result.invalidHeaders.push(key);
                    continue;
                }
                
                result.normalizedHeaders[normalizedKey] = value;
            }
            
            result.securityChecks.injectionPrevention = !injectionDetected;
            if (injectionDetected) {
                result.errors.push('Header injection attempt detected');
                return result;
            }
            
            // Check for required headers based on schema
            const requiredHeaders = schema?.requiredHeaders || [];
            result.requiredHeaders = requiredHeaders;
            
            for (const requiredHeader of requiredHeaders) {
                const normalizedRequired = requiredHeader.toLowerCase();
                if (!result.normalizedHeaders[normalizedRequired]) {
                    result.missingHeaders.push(requiredHeader);
                }
            }
            
            result.securityChecks.requiredHeadersPresent = result.missingHeaders.length === 0;
            if (!result.securityChecks.requiredHeadersPresent) {
                result.errors.push(`Missing required headers: ${result.missingHeaders.join(', ')}`);
            }
            
            // Overall validation success
            result.valid = Object.values(result.securityChecks).every(check => check === true) &&
                          result.invalidHeaders.length === 0;
            
        } catch (error) {
            result.errors.push(`Header validation error: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Validate basic structure and required properties of HTTP request objects
     * 
     * @private
     * @param {Object} request - Request object to validate structure
     * @returns {Object} Structure validation result
     */
    _validateRequestStructure(request) {
        const result = {
            valid: false,
            errors: []
        };
        
        // Check if request parameter is a valid object
        if (!request || typeof request !== 'object') {
            result.errors.push('Request must be a valid object');
            return result;
        }
        
        // Verify presence of required properties (method, url, headers)
        const requiredProperties = ['method', 'url', 'headers'];
        for (const prop of requiredProperties) {
            if (!(prop in request)) {
                result.errors.push(`Missing required property: ${prop}`);
            }
        }
        
        // Check for proper Node.js HTTP request object structure
        if (typeof request.method !== 'string') {
            result.errors.push('Request method must be a string');
        }
        
        if (typeof request.url !== 'string') {
            result.errors.push('Request URL must be a string');
        }
        
        if (typeof request.headers !== 'object' || request.headers === null) {
            result.errors.push('Request headers must be an object');
        }
        
        result.valid = result.errors.length === 0;
        return result;
    }
    
    /**
     * Perform comprehensive security validation for request objects
     * 
     * @private
     * @param {Object} request - Request object to validate
     * @param {Object} schema - Validation schema with security rules
     * @returns {Object} Security validation result
     */
    _performSecurityValidation(request, schema) {
        const result = {
            valid: false,
            errors: [],
            violations: [],
            securityLevel: 'unknown'
        };
        
        try {
            const violations = [];
            
            // Check for path traversal attempts
            if (request.url && request.url.includes('..')) {
                violations.push('path_traversal_attempt');
                result.errors.push('Path traversal attempt detected');
            }
            
            // Check for method injection attempts
            if (request.method && !/^[A-Z]+$/.test(request.method.toUpperCase())) {
                violations.push('method_injection_attempt');
                result.errors.push('Method injection attempt detected');
            }
            
            // Check for header injection attempts
            if (request.headers) {
                for (const [key, value] of Object.entries(request.headers)) {
                    if (key.includes('\n') || key.includes('\r') || value.includes('\n') || value.includes('\r')) {
                        violations.push('header_injection_attempt');
                        result.errors.push('Header injection attempt detected');
                        break;
                    }
                }
            }
            
            result.violations = violations;
            result.valid = violations.length === 0;
            result.securityLevel = violations.length === 0 ? 'secure' : 'suspicious';
            
        } catch (error) {
            result.errors.push(`Security validation error: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Determine appropriate validation schema based on request characteristics
     * 
     * @private
     * @param {Object} request - Request object to analyze
     * @param {string} [expectedEndpoint] - Expected endpoint override
     * @returns {Object} Selected validation schema
     */
    _determineValidationSchema(request, expectedEndpoint) {
        if (expectedEndpoint && this.endpointSchemas[expectedEndpoint]) {
            return this.endpointSchemas[expectedEndpoint];
        }
        
        if (request.url) {
            // Extract pathname from URL
            const pathname = request.url.split('?')[0];
            
            // Check for exact endpoint matches
            if (this.endpointSchemas[pathname]) {
                return this.endpointSchemas[pathname];
            }
        }
        
        // Return default schema if no specific match found
        return this.endpointSchemas.default || DEFAULT_REQUEST;
    }
    
    /**
     * Create normalized request object from validation results
     * 
     * @private
     * @param {Object} request - Original request object
     * @param {Object} validation - Validation results
     * @returns {Object} Normalized request object
     */
    _createNormalizedRequest(request, validation) {
        return {
            method: validation.method.normalizedMethod || request.method.toUpperCase(),
            url: validation.url.normalizedUrl || request.url,
            pathname: validation.url.pathname || request.url.split('?')[0],
            query: validation.url.query || {},
            headers: validation.headers.normalizedHeaders || {},
            httpVersion: request.httpVersion || '1.1',
            metadata: {
                correlationId: this._generateCorrelationId(),
                timestamp: Date.now(),
                processingStartTime: Date.now(),
                clientIp: this._extractClientIp(request),
                userAgent: validation.headers.normalizedHeaders?.['user-agent'] || 'Unknown',
                protocol: `HTTP/${request.httpVersion || '1.1'}`,
                connectionType: validation.headers.normalizedHeaders?.connection || 'close',
                requestSize: this._calculateRequestSize(request)
            }
        };
    }
    
    /**
     * Finalize validation result with timing and metadata
     * 
     * @private
     * @param {Object} result - Validation result object
     * @param {number} startTime - Validation start timestamp
     * @returns {Object} Finalized result object
     */
    _finalizeValidationResult(result, startTime) {
        result.metadata.processingTime = Date.now() - startTime;
        
        if (this.options.logValidationErrors && result.errors.length > 0) {
            console.warn(`Request validation failed (${result.metadata.validationId}):`, result.errors);
        }
        
        return result;
    }
    
    /**
     * Generate unique correlation ID for request tracking
     * 
     * @private
     * @returns {string} Unique correlation identifier
     */
    _generateCorrelationId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Extract client IP address from request object
     * 
     * @private
     * @param {Object} request - Request object
     * @returns {string} Client IP address
     */
    _extractClientIp(request) {
        if (request.connection && request.connection.remoteAddress) {
            return request.connection.remoteAddress;
        }
        if (request.socket && request.socket.remoteAddress) {
            return request.socket.remoteAddress;
        }
        return 'unknown';
    }
    
    /**
     * Calculate approximate request size for monitoring
     * 
     * @private
     * @param {Object} request - Request object
     * @returns {number} Estimated request size in bytes
     */
    _calculateRequestSize(request) {
        let size = 0;
        
        // Method and URL size
        size += (request.method || '').length;
        size += (request.url || '').length;
        
        // Headers size estimation
        if (request.headers) {
            for (const [key, value] of Object.entries(request.headers)) {
                size += key.length + value.length + 4; // +4 for ': ' and '\r\n'
            }
        }
        
        return size;
    }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validates if the provided request object conforms to a specific request type schema
 * with comprehensive validation including method, URL, headers, and security checks
 * 
 * @param {Object} request - Request object to validate
 * @param {string} requestType - Type of request validation to perform
 * @returns {Object} Validation result with success status, normalized request data, and validation errors
 */
function validateRequestType(request, requestType) {
    // Check if request parameter is a valid object with required properties
    if (!request || typeof request !== 'object') {
        return {
            success: false,
            error: ERROR_MESSAGES.INVALID_REQUEST_FORMAT,
            details: 'Request must be a valid object',
            timestamp: new Date().toISOString()
        };
    }
    
    // Determine the appropriate validation schema based on requestType parameter
    let schema;
    switch (requestType) {
        case 'hello':
            schema = VALIDATION_SCHEMAS.HELLO_REQUEST;
            break;
        case 'basic':
            schema = VALIDATION_SCHEMAS.BASIC_REQUEST;
            break;
        default:
            schema = VALIDATION_SCHEMAS.DEFAULT_REQUEST;
            break;
    }
    
    // Create validator instance and perform comprehensive validation
    const validator = new RequestTypeValidator({ strictMode: true });
    const validationResult = validator.validate(request, { expectedEndpoint: schema.expectedPath });
    
    // Create validation result object with success status and error details
    const result = {
        success: validationResult.success,
        isValid: validationResult.isValid,
        normalizedRequest: validationResult.normalizedRequest,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        validation: validationResult.validation,
        schema: schema,
        timestamp: new Date().toISOString(),
        processingTime: validationResult.metadata?.processingTime || 0
    };
    
    // Return comprehensive validation result with normalized request data
    return result;
}

/**
 * Creates a validation schema for HTTP request objects based on endpoint and method requirements
 * for customized validation rules and security constraints
 * 
 * @param {string} endpoint - Endpoint path for schema creation
 * @param {string} method - HTTP method for schema configuration
 * @returns {Object} Validation schema object for the specified request type and endpoint
 */
function createRequestValidationSchema(endpoint, method) {
    // Determine endpoint-specific request requirements based on endpoint parameter
    const normalizedEndpoint = endpoint.toLowerCase().trim();
    const normalizedMethod = method.toUpperCase().trim();
    
    // Create method validation rules for the specified HTTP method
    const allowedMethods = isMethodAllowedForEndpoint(normalizedMethod, endpoint) 
        ? [normalizedMethod] 
        : [];
    
    // Define URL validation schema with endpoint-specific path patterns
    const pathPattern = normalizedEndpoint === '/hello' ? '^/hello$' : `^${normalizedEndpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
    
    // Set header validation requirements based on endpoint and method
    const requiredHeaders = [];
    const optionalHeaders = ['user-agent', 'accept', 'accept-encoding', 'host', 'connection'];
    
    if (normalizedMethod === 'POST' || normalizedMethod === 'PUT') {
        requiredHeaders.push('content-type');
    }
    
    // Configure security validation rules for the request type
    const securityChecks = ['path_traversal', 'method_injection', 'header_validation'];
    if (normalizedEndpoint === '/hello') {
        securityChecks.push('exact_path_matching');
    }
    
    // Return complete validation schema object for request validation
    return {
        description: `Validation schema for ${normalizedMethod} ${endpoint}`,
        endpoint: normalizedEndpoint,
        requiredMethod: normalizedMethod,
        allowedMethods: allowedMethods,
        expectedPath: normalizedEndpoint,
        pathPattern: pathPattern,
        requiredHeaders: requiredHeaders,
        optionalHeaders: optionalHeaders,
        maxUrlLength: normalizedEndpoint === '/hello' ? 50 : 2048,
        securityChecks: securityChecks,
        validation: {
            strictMode: true,
            caseSensitive: false,
            allowQueryParams: normalizedEndpoint !== '/hello',
            validateHostHeader: false
        }
    };
}

/**
 * Normalizes HTTP request object properties to standard format for consistent processing
 * implementing HTTP/1.1 compliance with lowercase header keys and proper formatting
 * 
 * @param {Object} request - Request object to normalize
 * @returns {Object} Normalized request object with standardized properties and formats
 */
function normalizeRequestObject(request) {
    // Validate input request object
    if (!request || typeof request !== 'object') {
        throw new Error('Request parameter must be a valid object');
    }
    
    // Normalize HTTP method to uppercase for consistent validation
    const normalizedMethod = (request.method || '').trim().toUpperCase();
    
    // Parse and normalize URL components including pathname and query parameters
    let pathname = '/';
    let query = {};
    let normalizedUrl = request.url || '/';
    
    try {
        if (request.url) {
            const urlParts = request.url.split('?');
            pathname = urlParts[0] || '/';
            
            if (urlParts[1]) {
                const searchParams = new URLSearchParams(urlParts[1]);
                for (const [key, value] of searchParams) {
                    query[key] = value;
                }
            }
        }
    } catch (error) {
        // Fallback to simple parsing if URL parsing fails
        pathname = request.url || '/';
    }
    
    // Convert header keys to lowercase for HTTP/1.1 compliance
    const normalizedHeaders = {};
    if (request.headers && typeof request.headers === 'object') {
        for (const [key, value] of Object.entries(request.headers)) {
            if (typeof key === 'string' && typeof value === 'string') {
                normalizedHeaders[key.toLowerCase()] = value;
            }
        }
    }
    
    // Generate unique correlation ID for request tracking
    const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add request processing metadata including timestamp and correlation ID
    const metadata = {
        correlationId: correlationId,
        timestamp: Date.now(),
        processingStartTime: Date.now(),
        clientIp: request.connection?.remoteAddress || request.socket?.remoteAddress || 'unknown',
        userAgent: normalizedHeaders['user-agent'] || 'Unknown',
        protocol: `HTTP/${request.httpVersion || '1.1'}`,
        connectionType: normalizedHeaders.connection || 'close',
        requestSize: JSON.stringify(request).length
    };
    
    // Extract client information from connection and headers
    const clientInfo = {
        ipAddress: metadata.clientIp,
        userAgent: metadata.userAgent,
        acceptLanguage: normalizedHeaders['accept-language'] || '',
        acceptEncoding: normalizedHeaders['accept-encoding'] || '',
        host: normalizedHeaders.host || ''
    };
    
    // Return normalized request object with standardized structure
    return {
        method: normalizedMethod,
        url: normalizedUrl,
        pathname: pathname,
        query: query,
        headers: normalizedHeaders,
        httpVersion: request.httpVersion || '1.1',
        metadata: metadata,
        clientInfo: clientInfo,
        isValid: true,
        errors: []
    };
}

/**
 * Validates basic structure and required properties of HTTP request objects
 * for ensuring proper Node.js HTTP request object format compliance
 * 
 * @param {Object} request - Request object to validate structure
 * @returns {boolean} True if request has valid structure, false otherwise
 */
function isValidRequestStructure(request) {
    // Check if request parameter is a valid object
    if (!request || typeof request !== 'object') {
        return false;
    }
    
    // Verify presence of required properties (method, url, headers)
    const requiredProperties = ['method', 'url', 'headers'];
    for (const property of requiredProperties) {
        if (!(property in request)) {
            return false;
        }
    }
    
    // Validate property types and basic format requirements
    if (typeof request.method !== 'string' || request.method.trim().length === 0) {
        return false;
    }
    
    if (typeof request.url !== 'string' || request.url.trim().length === 0) {
        return false;
    }
    
    if (typeof request.headers !== 'object' || request.headers === null) {
        return false;
    }
    
    // Check for proper Node.js HTTP request object structure
    // Optional properties should have correct types if present
    if (request.httpVersion !== undefined && typeof request.httpVersion !== 'string') {
        return false;
    }
    
    if (request.connection !== undefined && typeof request.connection !== 'object') {
        return false;
    }
    
    if (request.socket !== undefined && typeof request.socket !== 'object') {
        return false;
    }
    
    // Return boolean result indicating structural validity
    return true;
}

/**
 * Extracts metadata from HTTP request object for logging and processing context
 * providing comprehensive request analysis and tracking information
 * 
 * @param {Object} request - Request object to extract metadata from
 * @returns {Object} Request metadata including timestamps, client info, and processing context
 */
function extractRequestMetadata(request) {
    // Validate input request object
    if (!request || typeof request !== 'object') {
        throw new Error('Request parameter must be a valid object');
    }
    
    // Generate unique request correlation ID for tracking
    const correlationId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract request timestamp and processing start time
    const timestamp = Date.now();
    const processingStartTime = timestamp;
    
    // Get client IP address and connection information
    let clientIp = 'unknown';
    let connectionInfo = {};
    
    if (request.connection) {
        clientIp = request.connection.remoteAddress || clientIp;
        connectionInfo = {
            remoteAddress: request.connection.remoteAddress,
            remotePort: request.connection.remotePort,
            localAddress: request.connection.localAddress,
            localPort: request.connection.localPort
        };
    } else if (request.socket) {
        clientIp = request.socket.remoteAddress || clientIp;
        connectionInfo = {
            remoteAddress: request.socket.remoteAddress,
            remotePort: request.socket.remotePort
        };
    }
    
    // Extract user agent and client identification headers
    const headers = request.headers || {};
    const userAgent = headers['user-agent'] || headers['User-Agent'] || 'Unknown';
    const host = headers.host || headers.Host || '';
    const acceptLanguage = headers['accept-language'] || headers['Accept-Language'] || '';
    const acceptEncoding = headers['accept-encoding'] || headers['Accept-Encoding'] || '';
    
    // Determine request protocol version and connection type
    const protocol = `HTTP/${request.httpVersion || '1.1'}`;
    const connectionType = headers.connection || headers.Connection || 'close';
    
    // Calculate request size estimation
    const requestSize = JSON.stringify(request).length;
    
    // Analyze request characteristics
    const requestAnalysis = {
        hasBody: request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH',
        isKeepAlive: connectionType.toLowerCase() === 'keep-alive',
        hasAuthentication: 'authorization' in headers || 'Authorization' in headers,
        contentType: headers['content-type'] || headers['Content-Type'] || '',
        contentLength: parseInt(headers['content-length'] || headers['Content-Length'] || '0', 10)
    };
    
    // Create metadata object with all extracted information
    const metadata = {
        // Request identification
        correlationId: correlationId,
        timestamp: timestamp,
        processingStartTime: processingStartTime,
        
        // Client information
        clientIp: clientIp,
        userAgent: userAgent,
        host: host,
        acceptLanguage: acceptLanguage,
        acceptEncoding: acceptEncoding,
        
        // Protocol information
        protocol: protocol,
        httpVersion: request.httpVersion || '1.1',
        connectionType: connectionType,
        connectionInfo: connectionInfo,
        
        // Request characteristics
        method: request.method || 'UNKNOWN',
        url: request.url || '/',
        requestSize: requestSize,
        headerCount: Object.keys(headers).length,
        
        // Request analysis
        analysis: requestAnalysis,
        
        // Processing context
        processingStarted: new Date(timestamp).toISOString(),
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        
        // Debug information
        debug: {
            hasConnectionObject: !!request.connection,
            hasSocketObject: !!request.socket,
            originalHeaderKeys: Object.keys(headers)
        }
    };
    
    // Return comprehensive request metadata for processing context
    return metadata;
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Request Type Definitions
    REQUEST_TYPES,
    
    // Validation Schemas
    VALIDATION_SCHEMAS,
    
    // Request Templates
    REQUEST_TEMPLATES,
    
    // Request Type Validator Class
    RequestTypeValidator,
    
    // Utility Functions
    validateRequestType,
    createRequestValidationSchema,
    normalizeRequestObject,
    isValidRequestStructure,
    extractRequestMetadata
};