/**
 * Response Types Module for Node.js Tutorial Application
 * 
 * Provides comprehensive type definitions, validation schemas, and response structure
 * interfaces for consistent HTTP response handling throughout the Node.js tutorial
 * application. This module implements enterprise-grade response type patterns with
 * educational clarity and production-ready response validation capabilities.
 * 
 * Key Features:
 * - JSDoc type definitions for HTTP response objects and components
 * - Comprehensive validation schemas for different response types
 * - Response templates for common patterns and testing scenarios
 * - Response validation class with full HTTP compliance checking
 * - Utility functions for response processing and normalization
 * - Security-conscious error handling without information disclosure
 * - Performance-optimized validation and processing functions
 * 
 * Educational Objectives:
 * - Demonstrates proper HTTP response structure and component handling
 * - Shows JavaScript type checking patterns using JSDoc for response objects
 * - Teaches comprehensive response validation and HTTP compliance principles
 * - Illustrates separation of type definitions for maintainable code architecture
 * - Demonstrates response security and information disclosure prevention
 * - Shows enterprise-grade response processing patterns for production readiness
 * 
 * Integration Points:
 * - Response Handler Component for response processing and validation
 * - Response Builder and utility functions for response creation
 * - Hello Controller for hello endpoint response formatting
 * - Error handling components for error response generation
 * - Middleware components for response postprocessing and validation
 * - Testing framework for response mock creation and test validation
 * 
 * @fileoverview Enterprise-grade response type definitions and validation for Node.js tutorial
 * @version 1.0.0
 * @author Node.js Tutorial Application Team
 * @since 2024
 */

// Import HTTP status code constants and utilities for response validation
const { 
    HTTP_STATUS_CODES, 
    isValidStatusCode, 
    getStatusCategory 
} = require('../utils/http-status.js');

// Import HTTP header constants for response header management
const { 
    HTTP_HEADERS, 
    CONTENT_TYPES 
} = require('../constants/http-headers.js');

// Import response message constants for standardized response content
const { 
    RESPONSE_MESSAGES 
} = require('../constants/response-messages.js');

// Import error message constants for error response generation
const { 
    ERROR_MESSAGES 
} = require('../constants/error-messages.js');

/**
 * @typedef {Object} HTTPResponse
 * @description Complete HTTP response object with status code, headers, and content
 * @property {number} statusCode - HTTP status code (200, 404, 500, etc.)
 * @property {ResponseHeaders} headers - HTTP response headers with normalized keys
 * @property {string|object} content - Response body content
 * @property {ResponseMetadata} metadata - Response processing metadata and context
 * @property {boolean} isValid - Overall response validation status
 * @property {Array<string>} errors - Validation error messages if any
 */

/**
 * @typedef {Object} FormattedResponse
 * @description Processed and formatted HTTP response object ready for transmission
 * @property {number} statusCode - Validated HTTP status code
 * @property {ResponseHeaders} headers - Formatted headers with proper case and values
 * @property {string} content - Serialized response content ready for transmission
 * @property {number} contentLength - Calculated content length in bytes
 * @property {string} contentType - Resolved content type with charset
 * @property {string} encoding - Content encoding (utf-8, gzip, etc.)
 * @property {number} timestamp - Response generation timestamp
 * @property {string} correlationId - Unique response identifier for tracking
 */

/**
 * @typedef {Object} ResponseHeaders
 * @description HTTP response headers object with normalized lowercase keys
 * @property {string} content-type - MIME type of response content with charset
 * @property {string} content-length - Size of response content in bytes
 * @property {string} date - Response generation timestamp in HTTP date format
 * @property {string} server - Server identification string
 * @property {string} x-content-type-options - Security header for MIME type protection
 * @property {string} allow - Allowed HTTP methods for 405 responses
 * @property {string} cache-control - Caching directives for response
 * @property {string} connection - Connection management directive (keep-alive, close)
 */

/**
 * @typedef {Object} ResponseMetadata
 * @description Response processing metadata and context information
 * @property {string} correlationId - Unique response identifier for tracking
 * @property {number} timestamp - Response generation timestamp
 * @property {number} processingTime - Response processing duration in milliseconds
 * @property {string} statusCategory - Status code category (success, client_error, server_error)
 * @property {string} responseType - Response type classification (hello, error, success)
 * @property {string} contentEncoding - Response content encoding method
 * @property {number} responseSize - Total response size in bytes
 * @property {boolean} validationStatus - Whether response passed validation
 */

/**
 * @typedef {Object} ValidatedResponse
 * @description Complete validated and processed response object ready for transmission
 * @property {HTTPResponse} original - Original response object for reference
 * @property {FormattedResponse} formatted - Formatted and processed response components
 * @property {Object} validation - Validation results and status information
 * @property {string} statusCategory - Determined status category based on status code
 * @property {boolean} isComplete - Whether response is complete and ready for transmission
 * @property {boolean} hasErrors - Whether response contains validation errors
 * @property {Object} securityChecks - Security validation results and warnings
 */

/**
 * @typedef {Object} ErrorResponse
 * @description Standardized error response object for client and server errors
 * @property {number} statusCode - HTTP error status code (4xx or 5xx)
 * @property {string} errorMessage - Client-safe error message
 * @property {string} errorType - Error type classification (client_error, server_error)
 * @property {Object} errorContext - Additional error context and debugging information
 * @property {ResponseHeaders} headers - Error-specific headers including Allow for 405
 * @property {number} timestamp - Error occurrence timestamp
 * @property {string} correlationId - Unique error identifier for tracking
 * @property {boolean} isSecure - Whether error message is safe for client exposure
 */

/**
 * @typedef {Object} SuccessResponse
 * @description Standardized success response object for successful operations
 * @property {number} statusCode - HTTP success status code (2xx range)
 * @property {string|object} content - Success response content
 * @property {string} successType - Success type classification (hello, general, created)
 * @property {ResponseHeaders} headers - Success-specific headers
 * @property {ResponseMetadata} metadata - Success response metadata
 * @property {number} timestamp - Success response generation timestamp
 * @property {string} correlationId - Unique success identifier for tracking
 * @property {number} processingTime - Request processing duration
 */

/**
 * Response Type Definitions Object
 * 
 * Centralized object containing all JSDoc type definitions for HTTP response
 * objects and components used throughout the application. This provides a
 * reference point for response structure and consistent type usage.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const RESPONSE_TYPES = {
    /**
     * Complete HTTP response object type definition reference
     * @type {string}
     */
    HTTPResponse: 'HTTPResponse',

    /**
     * Formatted response object type definition reference
     * @type {string}
     */
    FormattedResponse: 'FormattedResponse',

    /**
     * Response headers object type definition reference
     * @type {string}
     */
    ResponseHeaders: 'ResponseHeaders',

    /**
     * Response metadata object type definition reference
     * @type {string}
     */
    ResponseMetadata: 'ResponseMetadata',

    /**
     * Validated response object type definition reference
     * @type {string}
     */
    ValidatedResponse: 'ValidatedResponse',

    /**
     * Error response object type definition reference
     * @type {string}
     */
    ErrorResponse: 'ErrorResponse',

    /**
     * Success response object type definition reference
     * @type {string}
     */
    SuccessResponse: 'SuccessResponse'
};

/**
 * Validation Schemas Object
 * 
 * Comprehensive validation schemas for different response types and status codes.
 * Each schema defines the validation rules, required headers, content requirements,
 * and security constraints for specific response types.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const VALIDATION_SCHEMAS = {
    /**
     * Validation schema for /hello endpoint responses
     * Ensures hello endpoint responses comply with tutorial requirements
     * 
     * @type {Object}
     * @property {number} statusCode - Expected status code (200)
     * @property {Array<string>} requiredHeaders - Required response headers
     * @property {string} contentType - Expected content type
     * @property {string} expectedContent - Expected response content
     * @property {number} contentLength - Expected content length in bytes
     * @property {Array<string>} securityHeaders - Required security headers
     * @property {string} encoding - Required content encoding
     */
    HELLO_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        requiredHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE],
        contentType: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        expectedContent: RESPONSE_MESSAGES.HELLO_WORLD,
        contentLength: Buffer.byteLength(RESPONSE_MESSAGES.HELLO_WORLD, 'utf8'),
        securityHeaders: [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS],
        encoding: 'utf-8'
    },

    /**
     * Validation schema for general success responses
     * Defines validation rules for successful HTTP operations
     * 
     * @type {Object}
     * @property {Array<number>} statusCodeRange - Allowed success status codes
     * @property {Array<string>} requiredHeaders - Required response headers
     * @property {Array<string>} allowedContentTypes - Permitted content types
     * @property {number} maxContentLength - Maximum allowed content length
     * @property {Array<string>} securityHeaders - Required security headers
     * @property {string} encoding - Required content encoding
     */
    SUCCESS_RESPONSE: {
        statusCodeRange: [HTTP_STATUS_CODES.SUCCESS.OK, 299],
        requiredHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE],
        allowedContentTypes: [CONTENT_TYPES.TEXT_PLAIN, CONTENT_TYPES.APPLICATION_JSON],
        maxContentLength: 10240,
        securityHeaders: [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS],
        encoding: 'utf-8'
    },

    /**
     * Validation schema for error responses
     * Ensures error responses maintain security and compliance standards
     * 
     * @type {Object}
     * @property {Array<number>} statusCodeRange - Allowed error status codes
     * @property {Array<string>} requiredHeaders - Required response headers
     * @property {string} contentType - Expected content type for errors
     * @property {number} maxContentLength - Maximum error message length
     * @property {Array<string>} securityHeaders - Required security headers
     * @property {boolean} informationDisclosure - Whether to prevent info disclosure
     */
    ERROR_RESPONSE: {
        statusCodeRange: [HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST, 599],
        requiredHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE],
        contentType: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        maxContentLength: 1024,
        securityHeaders: [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS],
        informationDisclosure: false
    },

    /**
     * Validation schema for 404 Not Found responses
     * Specific validation rules for resource not found scenarios
     * 
     * @type {Object}
     * @property {number} statusCode - Expected status code (404)
     * @property {Array<string>} requiredHeaders - Required response headers
     * @property {string} contentType - Expected content type
     * @property {string} expectedContent - Expected error message
     * @property {Array<string>} securityHeaders - Required security headers
     * @property {boolean} informationDisclosure - Whether to prevent info disclosure
     */
    NOT_FOUND_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
        requiredHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE],
        contentType: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        expectedContent: ERROR_MESSAGES.NOT_FOUND,
        securityHeaders: [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS],
        informationDisclosure: false
    },

    /**
     * Validation schema for 405 Method Not Allowed responses
     * Specific validation rules for unsupported HTTP method scenarios
     * 
     * @type {Object}
     * @property {number} statusCode - Expected status code (405)
     * @property {Array<string>} requiredHeaders - Required response headers including Allow
     * @property {string} contentType - Expected content type
     * @property {string} expectedContent - Expected error message
     * @property {Array<string>} securityHeaders - Required security headers
     * @property {boolean} allowHeaderRequired - Whether Allow header is mandatory
     */
    METHOD_NOT_ALLOWED_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
        requiredHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE, HTTP_HEADERS.ALLOW],
        contentType: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        expectedContent: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        securityHeaders: [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS],
        allowHeaderRequired: true
    }
};

/**
 * Response Templates Object
 * 
 * Pre-defined response templates for common response patterns used throughout
 * the application. These templates provide consistent response structure and
 * support testing scenarios with predictable response formats.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const RESPONSE_TEMPLATES = {
    /**
     * Complete template for successful hello endpoint responses
     * Includes all required headers and proper content formatting
     * 
     * @type {Object}
     * @property {number} statusCode - HTTP 200 OK status
     * @property {ResponseHeaders} headers - Complete header set
     * @property {string} content - Hello world response content
     * @property {Object} metadata - Response metadata for tracking
     */
    HELLO_SUCCESS_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(RESPONSE_MESSAGES.HELLO_WORLD, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: 'nosniff'
        },
        content: RESPONSE_MESSAGES.HELLO_WORLD,
        metadata: {
            responseType: 'hello_endpoint',
            isSuccess: true
        }
    },

    /**
     * Template for basic successful responses
     * General success response template for various success scenarios
     * 
     * @type {Object}
     * @property {number} statusCode - HTTP 200 OK status
     * @property {ResponseHeaders} headers - Basic success headers
     * @property {string} content - Success response content
     * @property {Object} metadata - Response metadata for tracking
     */
    BASIC_SUCCESS_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: 'nosniff'
        },
        content: RESPONSE_MESSAGES.SUCCESS,
        metadata: {
            responseType: 'general_success',
            isSuccess: true
        }
    },

    /**
     * Template for 404 Not Found error responses
     * Standardized template for resource not found scenarios
     * 
     * @type {Object}
     * @property {number} statusCode - HTTP 404 Not Found status
     * @property {ResponseHeaders} headers - Error response headers
     * @property {string} content - Not found error message
     * @property {Object} metadata - Error response metadata
     */
    NOT_FOUND_ERROR_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(ERROR_MESSAGES.NOT_FOUND, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: 'nosniff'
        },
        content: ERROR_MESSAGES.NOT_FOUND,
        metadata: {
            responseType: 'client_error',
            isSuccess: false
        }
    },

    /**
     * Template for 405 Method Not Allowed error responses
     * Standardized template for unsupported HTTP method scenarios
     * 
     * @type {Object}
     * @property {number} statusCode - HTTP 405 Method Not Allowed status
     * @property {ResponseHeaders} headers - Error headers including Allow header
     * @property {string} content - Method not allowed error message
     * @property {Object} metadata - Error response metadata
     */
    METHOD_NOT_ALLOWED_ERROR_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(ERROR_MESSAGES.METHOD_NOT_ALLOWED, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: 'nosniff',
            [HTTP_HEADERS.ALLOW]: 'GET'
        },
        content: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        metadata: {
            responseType: 'client_error',
            isSuccess: false
        }
    }
};

/**
 * Validates if the provided response object conforms to a specific response type schema
 * with comprehensive validation rules and HTTP compliance checking.
 * 
 * @param {Object} response - The response object to validate
 * @param {string} responseType - The response type schema to validate against
 * @returns {Object} Validation result with success status, normalized response data, and validation errors
 */
function validateResponseType(response, responseType) {
    // Initialize validation result object with default values
    const validationResult = {
        isValid: false,
        errors: [],
        normalizedResponse: null,
        validationDetails: {
            structureValid: false,
            statusCodeValid: false,
            headersValid: false,
            contentValid: false,
            securityValid: false
        }
    };

    try {
        // Check if response parameter is a valid object with required properties
        if (!response || typeof response !== 'object') {
            validationResult.errors.push('Response must be a valid object');
            return validationResult;
        }

        // Validate basic response structure
        if (!isValidResponseStructure(response)) {
            validationResult.errors.push('Response does not have valid structure');
            return validationResult;
        }
        validationResult.validationDetails.structureValid = true;

        // Determine the appropriate validation schema based on responseType parameter
        const schema = VALIDATION_SCHEMAS[responseType];
        if (!schema) {
            validationResult.errors.push(`Unknown response type: ${responseType}`);
            return validationResult;
        }

        // Validate response status code against valid HTTP status codes
        if (!isValidStatusCode(response.statusCode)) {
            validationResult.errors.push('Invalid HTTP status code');
            return validationResult;
        }

        // Check status code against schema requirements
        if (schema.statusCode && response.statusCode !== schema.statusCode) {
            validationResult.errors.push(`Status code ${response.statusCode} does not match expected ${schema.statusCode}`);
            return validationResult;
        }

        if (schema.statusCodeRange) {
            const [min, max] = schema.statusCodeRange;
            if (response.statusCode < min || response.statusCode > max) {
                validationResult.errors.push(`Status code ${response.statusCode} is outside allowed range ${min}-${max}`);
                return validationResult;
            }
        }
        validationResult.validationDetails.statusCodeValid = true;

        // Validate response headers structure and required headers based on type
        if (!response.headers || typeof response.headers !== 'object') {
            validationResult.errors.push('Response headers must be a valid object');
            return validationResult;
        }

        // Check for required headers
        if (schema.requiredHeaders) {
            for (const requiredHeader of schema.requiredHeaders) {
                if (!response.headers[requiredHeader]) {
                    validationResult.errors.push(`Missing required header: ${requiredHeader}`);
                    return validationResult;
                }
            }
        }
        validationResult.validationDetails.headersValid = true;

        // Validate response content format and encoding requirements
        if (response.content === undefined || response.content === null) {
            validationResult.errors.push('Response content is required');
            return validationResult;
        }

        // Validate content type consistency
        if (schema.contentType && response.headers[HTTP_HEADERS.CONTENT_TYPE] !== schema.contentType) {
            validationResult.errors.push(`Content type mismatch: expected ${schema.contentType}`);
            return validationResult;
        }

        // Validate expected content if specified
        if (schema.expectedContent && response.content !== schema.expectedContent) {
            validationResult.errors.push(`Content mismatch: expected "${schema.expectedContent}"`);
            return validationResult;
        }

        // Validate content length
        const actualLength = Buffer.byteLength(response.content.toString(), 'utf8');
        if (schema.contentLength && actualLength !== schema.contentLength) {
            validationResult.errors.push(`Content length mismatch: expected ${schema.contentLength}, got ${actualLength}`);
            return validationResult;
        }

        if (schema.maxContentLength && actualLength > schema.maxContentLength) {
            validationResult.errors.push(`Content length ${actualLength} exceeds maximum ${schema.maxContentLength}`);
            return validationResult;
        }
        validationResult.validationDetails.contentValid = true;

        // Perform type-specific validation rules and HTTP compliance checks
        if (schema.securityHeaders) {
            for (const securityHeader of schema.securityHeaders) {
                if (!response.headers[securityHeader]) {
                    validationResult.errors.push(`Missing security header: ${securityHeader}`);
                    return validationResult;
                }
            }
        }

        // Validate Allow header for 405 responses
        if (schema.allowHeaderRequired && !response.headers[HTTP_HEADERS.ALLOW]) {
            validationResult.errors.push('Allow header is required for 405 Method Not Allowed responses');
            return validationResult;
        }
        validationResult.validationDetails.securityValid = true;

        // Create validation result object with success status and error details
        validationResult.isValid = true;
        validationResult.normalizedResponse = normalizeResponseObject(response);

        // Return comprehensive validation result with normalized response data
        return validationResult;

    } catch (error) {
        validationResult.errors.push(`Validation error: ${error.message}`);
        return validationResult;
    }
}

/**
 * Creates a validation schema for HTTP response objects based on status code 
 * and content type requirements.
 * 
 * @param {number} statusCode - The HTTP status code to create schema for
 * @param {string} contentType - The content type for the response
 * @returns {Object} Validation schema object for the specified response type and status code
 */
function createResponseValidationSchema(statusCode, contentType) {
    // Initialize base schema object
    const schema = {
        statusCode: statusCode,
        requiredHeaders: [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE],
        contentType: contentType || CONTENT_TYPES.TEXT_PLAIN_UTF8,
        securityHeaders: [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS],
        encoding: 'utf-8'
    };

    // Determine response type based on status code category (success, error, etc.)
    const statusCategory = getStatusCategory(statusCode);

    // Create status code validation rules for the specified HTTP status
    if (!isValidStatusCode(statusCode)) {
        throw new Error(`Invalid status code: ${statusCode}`);
    }

    // Define header validation schema with content-type-specific requirements
    switch (statusCategory) {
        case 'SUCCESS':
            schema.statusCodeRange = [200, 299];
            schema.allowedContentTypes = [CONTENT_TYPES.TEXT_PLAIN, CONTENT_TYPES.APPLICATION_JSON];
            schema.maxContentLength = 10240;
            break;
            
        case 'CLIENT_ERROR':
        case 'SERVER_ERROR':
            schema.statusCodeRange = [400, 599];
            schema.maxContentLength = 1024;
            schema.informationDisclosure = false;
            
            // Special handling for 405 Method Not Allowed
            if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
                schema.requiredHeaders.push(HTTP_HEADERS.ALLOW);
                schema.allowHeaderRequired = true;
            }
            break;
            
        default:
            schema.maxContentLength = 1024;
    }

    // Set content validation requirements based on content type and status
    if (contentType && contentType.includes('application/json')) {
        schema.jsonValidation = true;
        schema.contentValidation = 'json';
    } else {
        schema.contentValidation = 'text';
    }

    // Configure security validation rules for the response type
    schema.securityValidation = {
        preventInfoDisclosure: statusCategory === 'CLIENT_ERROR' || statusCategory === 'SERVER_ERROR',
        requireSecurityHeaders: true,
        headerInjectionPrevention: true
    };

    // Return complete validation schema object for response validation
    return schema;
}

/**
 * Normalizes HTTP response object properties to standard format for consistent processing
 * and HTTP protocol compliance.
 * 
 * @param {Object} response - The response object to normalize
 * @returns {Object} Normalized response object with standardized properties and formats
 */
function normalizeResponseObject(response) {
    // Validate basic response structure before normalization
    if (!isValidResponseStructure(response)) {
        throw new Error('Cannot normalize invalid response structure');
    }

    // Normalize HTTP status code to valid integer value
    const normalizedStatusCode = parseInt(response.statusCode, 10);
    if (!isValidStatusCode(normalizedStatusCode)) {
        throw new Error(`Invalid status code: ${response.statusCode}`);
    }

    // Convert header keys to lowercase for HTTP/1.1 compliance
    const normalizedHeaders = {};
    if (response.headers && typeof response.headers === 'object') {
        Object.entries(response.headers).forEach(([key, value]) => {
            normalizedHeaders[key.toLowerCase()] = value;
        });
    }

    // Format response content with proper encoding and type
    const contentString = typeof response.content === 'object' 
        ? JSON.stringify(response.content) 
        : String(response.content || '');

    // Add response processing metadata including timestamp and correlation ID
    const correlationId = generateCorrelationId();
    const timestamp = Date.now();

    // Calculate and validate content length for Content-Length header
    const contentLength = Buffer.byteLength(contentString, 'utf8');
    normalizedHeaders[HTTP_HEADERS.CONTENT_LENGTH] = contentLength.toString();

    // Ensure date header is present and properly formatted
    if (!normalizedHeaders[HTTP_HEADERS.DATE]) {
        normalizedHeaders[HTTP_HEADERS.DATE] = new Date().toUTCString();
    }

    // Add security headers if not already present
    if (!normalizedHeaders[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]) {
        normalizedHeaders[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS] = 'nosniff';
    }

    // Return normalized response object with standardized structure
    return {
        statusCode: normalizedStatusCode,
        headers: normalizedHeaders,
        content: contentString,
        metadata: {
            correlationId: correlationId,
            timestamp: timestamp,
            processingTime: 0, // Will be calculated by calling function
            statusCategory: getStatusCategory(normalizedStatusCode),
            responseType: determineResponseType(normalizedStatusCode),
            contentEncoding: 'utf-8',
            responseSize: contentLength,
            validationStatus: true
        },
        isValid: true,
        errors: []
    };
}

/**
 * Validates basic structure and required properties of HTTP response objects
 * to ensure minimal compliance before detailed validation.
 * 
 * @param {Object} response - The response object to validate
 * @returns {boolean} True if response has valid structure, false otherwise
 */
function isValidResponseStructure(response) {
    // Check if response parameter is a valid object
    if (!response || typeof response !== 'object') {
        return false;
    }

    // Verify presence of required properties (statusCode, headers, content)
    if (typeof response.statusCode !== 'number') {
        return false;
    }

    if (!response.headers || typeof response.headers !== 'object') {
        return false;
    }

    // Content can be string, object, or empty but must be defined
    if (response.content === undefined) {
        return false;
    }

    // Validate property types and basic format requirements
    // Check for proper HTTP response object structure
    const hasValidStatusCode = Number.isInteger(response.statusCode) && response.statusCode > 0;
    const hasValidHeaders = Object.prototype.toString.call(response.headers) === '[object Object]';

    // Return boolean result indicating structural validity
    return hasValidStatusCode && hasValidHeaders;
}

/**
 * Extracts metadata from HTTP response object for logging and processing context
 * including timestamps, status information, and response characteristics.
 * 
 * @param {Object} response - The response object to extract metadata from
 * @returns {Object} Response metadata including timestamps, status info, and processing context
 */
function extractResponseMetadata(response) {
    // Validate response structure before metadata extraction
    if (!isValidResponseStructure(response)) {
        throw new Error('Cannot extract metadata from invalid response');
    }

    // Generate unique response correlation ID for tracking
    const correlationId = generateCorrelationId();

    // Extract response timestamp and processing completion time
    const timestamp = Date.now();
    const processingStartTime = response.metadata?.startTime || timestamp;
    const processingTime = timestamp - processingStartTime;

    // Get status code category and response type classification
    const statusCategory = getStatusCategory(response.statusCode);
    const responseType = determineResponseType(response.statusCode);

    // Calculate response content length and processing metrics
    const contentString = typeof response.content === 'object' 
        ? JSON.stringify(response.content) 
        : String(response.content || '');
    const responseSize = Buffer.byteLength(contentString, 'utf8');

    // Determine response protocol version and encoding details
    const contentEncoding = extractContentEncoding(response.headers);
    const protocolVersion = '1.1'; // HTTP/1.1 for tutorial application

    // Create metadata object with all extracted information
    const metadata = {
        correlationId: correlationId,
        timestamp: timestamp,
        processingTime: processingTime,
        statusCategory: statusCategory,
        responseType: responseType,
        contentEncoding: contentEncoding,
        responseSize: responseSize,
        validationStatus: true,
        protocolVersion: protocolVersion,
        generatedAt: new Date().toISOString(),
        serverInfo: {
            name: 'Node.js Tutorial Server',
            version: '1.0.0'
        }
    };

    // Return comprehensive response metadata for processing context
    return metadata;
}

/**
 * ResponseTypeValidator Class
 * 
 * Comprehensive class for validating HTTP response objects against defined type schemas
 * with advanced validation rules, HTTP compliance checks, and enterprise-grade
 * validation capabilities for production-ready response processing.
 * 
 * Features:
 * - Complete HTTP response validation with status code verification
 * - Header format validation and security header enforcement
 * - Content validation with encoding and type consistency checks
 * - Configurable validation rules and strict mode operation
 * - Performance monitoring and validation metrics collection
 * - Extensible validation framework for custom response types
 */
class ResponseTypeValidator {
    /**
     * Initializes the response type validator with validation rules and schema definitions
     * for comprehensive HTTP response validation capabilities.
     * 
     * @param {Object} options - Configuration options for validator behavior
     * @param {Object} options.validationRules - Custom validation rules
     * @param {Array<number>} options.validStatusCodes - Allowed status codes
     * @param {Object} options.contentTypeSchemas - Content type validation schemas
     * @param {boolean} options.strictMode - Enable strict validation mode
     */
    constructor(options = {}) {
        // Set default validation options and merge with provided options
        this.validationRules = {
            requireAllHeaders: true,
            enforceSecurityHeaders: true,
            validateContentLength: true,
            strictStatusCodeValidation: true,
            preventInformationDisclosure: true,
            ...options.validationRules
        };

        // Initialize valid HTTP status codes from constants
        this.validStatusCodes = options.validStatusCodes || this._getAllValidStatusCodes();

        // Load content-type-specific validation schemas
        this.contentTypeSchemas = {
            [CONTENT_TYPES.TEXT_PLAIN]: { requireUtf8: true, maxSize: 10240 },
            [CONTENT_TYPES.APPLICATION_JSON]: { requireValidJson: true, maxSize: 10240 },
            ...options.contentTypeSchemas
        };

        // Configure strict mode for enhanced HTTP compliance validation
        this.strictMode = options.strictMode || false;

        // Set up validation rule templates and patterns
        this.validationTemplates = {
            ...VALIDATION_SCHEMAS,
            ...options.customTemplates
        };

        // Initialize validation statistics and error tracking
        this.validationStats = {
            totalValidations: 0,
            successfulValidations: 0,
            failedValidations: 0,
            errorBreakdown: {},
            performanceMetrics: {
                averageValidationTime: 0,
                maxValidationTime: 0,
                minValidationTime: Infinity
            }
        };
    }

    /**
     * Validates a complete HTTP response object against the appropriate type schema
     * with comprehensive validation rules and detailed error reporting.
     * 
     * @param {Object} response - The response object to validate
     * @param {Object} validationOptions - Additional validation options
     * @returns {Object} Comprehensive validation result with success status, errors, and normalized data
     */
    validate(response, validationOptions = {}) {
        // Record validation start time for performance metrics
        const validationStartTime = process.hrtime.bigint();

        // Initialize comprehensive validation result object
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            normalizedResponse: null,
            validationDetails: {
                structureValid: false,
                statusCodeValid: false,
                headersValid: false,
                contentValid: false,
                securityValid: false,
                performanceValid: false
            },
            metadata: {
                validationTimestamp: new Date().toISOString(),
                validatorVersion: '1.0.0',
                validationRules: this.validationRules
            }
        };

        try {
            // Validate basic response structure and required properties
            if (!isValidResponseStructure(response)) {
                result.errors.push('Response does not have valid basic structure');
                this._recordValidationResult(result, validationStartTime);
                return result;
            }
            result.validationDetails.structureValid = true;

            // Determine appropriate validation schema based on response status and content type
            const responseType = this._determineResponseType(response);
            const schema = this._getValidationSchema(responseType, validationOptions);

            // Validate HTTP status code against valid status codes
            const statusValidation = this.validateStatusCode(response.statusCode, {
                schema: schema,
                strictMode: this.strictMode
            });
            
            if (!statusValidation.isValid) {
                result.errors.push(...statusValidation.errors);
                this._recordValidationResult(result, validationStartTime);
                return result;
            }
            result.validationDetails.statusCodeValid = true;

            // Validate response headers format and required headers
            const headersValidation = this.validateHeaders(
                response.headers, 
                response.statusCode, 
                schema.requiredHeaders || []
            );
            
            if (!headersValidation.isValid) {
                result.errors.push(...headersValidation.errors);
                result.warnings.push(...(headersValidation.warnings || []));
                this._recordValidationResult(result, validationStartTime);
                return result;
            }
            result.validationDetails.headersValid = true;

            // Validate response content format and encoding requirements
            const contentValidation = this.validateContent(
                response.content,
                response.headers[HTTP_HEADERS.CONTENT_TYPE] || CONTENT_TYPES.TEXT_PLAIN_UTF8,
                { schema: schema, strictMode: this.strictMode }
            );
            
            if (!contentValidation.isValid) {
                result.errors.push(...contentValidation.errors);
                result.warnings.push(...(contentValidation.warnings || []));
                this._recordValidationResult(result, validationStartTime);
                return result;
            }
            result.validationDetails.contentValid = true;

            // Apply content-type-specific validation rules and HTTP compliance checks
            const securityValidation = this._validateSecurityRequirements(response, schema);
            if (!securityValidation.isValid) {
                result.errors.push(...securityValidation.errors);
                result.warnings.push(...(securityValidation.warnings || []));
                this._recordValidationResult(result, validationStartTime);
                return result;
            }
            result.validationDetails.securityValid = true;

            // Validate performance characteristics
            const performanceValidation = this._validatePerformanceRequirements(response);
            result.validationDetails.performanceValid = performanceValidation.isValid;
            if (performanceValidation.warnings) {
                result.warnings.push(...performanceValidation.warnings);
            }

            // Compile validation results and error messages
            result.isValid = true;
            result.normalizedResponse = normalizeResponseObject(response);
            result.metadata.responseType = responseType;
            result.metadata.schema = schema;

            // Return comprehensive validation result object
            this._recordValidationResult(result, validationStartTime);
            return result;

        } catch (error) {
            result.errors.push(`Validation exception: ${error.message}`);
            this._recordValidationResult(result, validationStartTime);
            return result;
        }
    }

    /**
     * Validates HTTP status code against valid codes and category-specific restrictions
     * with comprehensive status code verification and compliance checking.
     * 
     * @param {number} statusCode - The status code to validate
     * @param {Object} statusOptions - Validation options for status code checking
     * @returns {Object} Status code validation result with category information and validation status
     */
    validateStatusCode(statusCode, statusOptions = {}) {
        // Initialize status validation result
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            statusInfo: {
                code: statusCode,
                category: null,
                message: null,
                isHttpCompliant: false
            }
        };

        // Check if status code is a valid integer within HTTP range
        if (typeof statusCode !== 'number' || !Number.isInteger(statusCode)) {
            result.errors.push('Status code must be a valid integer');
            return result;
        }

        if (statusCode < 100 || statusCode > 599) {
            result.errors.push('Status code must be in range 100-599');
            return result;
        }

        // Validate status code against supported status codes list
        if (!isValidStatusCode(statusCode)) {
            result.errors.push(`Unsupported status code: ${statusCode}`);
            return result;
        }

        // Determine status code category (success, error, etc.)
        const statusCategory = getStatusCategory(statusCode);
        result.statusInfo.category = statusCategory;
        result.statusInfo.isHttpCompliant = true;

        // Apply category-specific validation rules
        if (statusOptions.schema) {
            const schema = statusOptions.schema;
            
            // Check specific status code requirements
            if (schema.statusCode && statusCode !== schema.statusCode) {
                result.errors.push(`Status code ${statusCode} does not match required ${schema.statusCode}`);
                return result;
            }

            // Check status code range requirements
            if (schema.statusCodeRange) {
                const [min, max] = schema.statusCodeRange;
                if (statusCode < min || statusCode > max) {
                    result.errors.push(`Status code ${statusCode} is outside allowed range ${min}-${max}`);
                    return result;
                }
            }
        }

        // Validate status code against application-specific rules
        if (this.strictMode) {
            // In strict mode, only allow common status codes
            const commonStatusCodes = [200, 201, 400, 401, 403, 404, 405, 500, 502, 503];
            if (!commonStatusCodes.includes(statusCode)) {
                result.warnings.push(`Uncommon status code: ${statusCode} - consider using standard alternatives`);
            }
        }

        // Create validation result with success status and category info
        result.isValid = true;
        result.statusInfo.message = this._getStatusMessage(statusCode);

        // Return status code validation result object
        return result;
    }

    /**
     * Validates response headers format, required headers, and HTTP compliance constraints
     * with comprehensive header validation and security checking.
     * 
     * @param {Object} headers - The headers object to validate
     * @param {number} statusCode - The response status code for context
     * @param {Array<string>} requiredHeaders - List of required header names
     * @returns {Object} Header validation result with normalized headers and validation status
     */
    validateHeaders(headers, statusCode, requiredHeaders = []) {
        // Initialize header validation result
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            normalizedHeaders: {},
            headerInfo: {
                totalHeaders: 0,
                requiredHeadersPresent: 0,
                securityHeadersPresent: 0,
                customHeadersPresent: 0
            }
        };

        // Validate headers object structure and format
        if (!headers || typeof headers !== 'object') {
            result.errors.push('Headers must be a valid object');
            return result;
        }

        // Check for required headers based on status code and content type
        const missingRequiredHeaders = [];
        for (const requiredHeader of requiredHeaders) {
            const headerExists = Object.keys(headers).some(
                key => key.toLowerCase() === requiredHeader.toLowerCase()
            );
            
            if (!headerExists) {
                missingRequiredHeaders.push(requiredHeader);
            } else {
                result.headerInfo.requiredHeadersPresent++;
            }
        }

        if (missingRequiredHeaders.length > 0) {
            result.errors.push(`Missing required headers: ${missingRequiredHeaders.join(', ')}`);
            return result;
        }

        // Normalize header keys to lowercase for HTTP compliance
        Object.entries(headers).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase();
            result.normalizedHeaders[normalizedKey] = value;
            result.headerInfo.totalHeaders++;

            // Count security headers
            if (normalizedKey.startsWith('x-') || normalizedKey === 'strict-transport-security') {
                result.headerInfo.securityHeadersPresent++;
            }

            // Count custom headers
            if (normalizedKey.startsWith('x-custom-')) {
                result.headerInfo.customHeadersPresent++;
            }
        });

        // Validate header value formats and encoding
        const headerValidationErrors = this._validateHeaderValues(result.normalizedHeaders, statusCode);
        if (headerValidationErrors.length > 0) {
            result.errors.push(...headerValidationErrors);
            return result;
        }

        // Apply security validation for header injection prevention
        const securityValidation = this._validateHeaderSecurity(result.normalizedHeaders);
        if (!securityValidation.isValid) {
            result.errors.push(...securityValidation.errors);
            result.warnings.push(...(securityValidation.warnings || []));
        }

        // Validate special header requirements based on status code
        if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
            if (!result.normalizedHeaders[HTTP_HEADERS.ALLOW]) {
                result.errors.push('Allow header is required for 405 Method Not Allowed responses');
                return result;
            }
        }

        // Check content-length consistency
        if (result.normalizedHeaders[HTTP_HEADERS.CONTENT_LENGTH]) {
            const contentLength = parseInt(result.normalizedHeaders[HTTP_HEADERS.CONTENT_LENGTH], 10);
            if (isNaN(contentLength) || contentLength < 0) {
                result.errors.push('Content-Length header must be a valid non-negative integer');
                return result;
            }
        }

        // Return header validation result with normalized headers
        result.isValid = result.errors.length === 0;
        return result;
    }

    /**
     * Validates response content format, encoding, and content-type consistency
     * with comprehensive content validation and type checking.
     * 
     * @param {string|object} content - The response content to validate
     * @param {string} contentType - The declared content type
     * @param {Object} contentOptions - Additional content validation options
     * @returns {Object} Content validation result with formatted content and validation status
     */
    validateContent(content, contentType, contentOptions = {}) {
        // Initialize content validation result
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            formattedContent: null,
            contentInfo: {
                originalType: typeof content,
                finalType: 'string',
                encoding: 'utf-8',
                size: 0,
                isJson: false,
                isText: true
            }
        };

        try {
            // Validate content format against specified content type
            const contentString = this._serializeContent(content, contentType);
            result.formattedContent = contentString;
            result.contentInfo.size = Buffer.byteLength(contentString, 'utf8');

            // Check content encoding and character set requirements
            if (!this._isValidUtf8Content(contentString)) {
                result.errors.push('Content contains invalid UTF-8 characters');
                return result;
            }

            // Validate content length and size constraints
            const schema = contentOptions.schema;
            if (schema && schema.maxContentLength) {
                if (result.contentInfo.size > schema.maxContentLength) {
                    result.errors.push(`Content size ${result.contentInfo.size} exceeds maximum ${schema.maxContentLength}`);
                    return result;
                }
            }

            // Apply content-type-specific validation rules
            if (contentType) {
                const typeValidation = this._validateContentType(content, contentType);
                if (!typeValidation.isValid) {
                    result.errors.push(...typeValidation.errors);
                    return result;
                }
                result.contentInfo.isJson = contentType.includes('application/json');
                result.contentInfo.isText = contentType.includes('text/');
            }

            // Ensure content consistency with Content-Type header
            if (contentType && contentType.includes('application/json')) {
                try {
                    JSON.parse(contentString);
                    result.contentInfo.isJson = true;
                } catch (jsonError) {
                    result.errors.push('Content is not valid JSON but Content-Type indicates JSON');
                    return result;
                }
            }

            // Validate content encoding requirements
            const encodingValidation = this._validateContentEncoding(contentString, contentType);
            if (!encodingValidation.isValid) {
                result.warnings.push(...encodingValidation.warnings);
            }

            // Return content validation result with formatted content
            result.isValid = true;
            return result;

        } catch (error) {
            result.errors.push(`Content validation error: ${error.message}`);
            return result;
        }
    }

    /**
     * Extracts all valid HTTP status codes from the status code constants
     * for validator initialization and configuration.
     * 
     * @private
     * @returns {Array<number>} Array of all valid HTTP status codes
     */
    _getAllValidStatusCodes() {
        const statusCodes = [];
        Object.values(HTTP_STATUS_CODES).forEach(category => {
            Object.values(category).forEach(code => {
                statusCodes.push(code);
            });
        });
        return statusCodes;
    }

    /**
     * Determines the response type based on status code and content
     * for appropriate schema selection.
     * 
     * @private
     * @param {Object} response - The response object to analyze
     * @returns {string} Determined response type for schema selection
     */
    _determineResponseType(response) {
        const statusCode = response.statusCode;
        const content = response.content;

        // Check for hello endpoint response
        if (statusCode === HTTP_STATUS_CODES.SUCCESS.OK && content === RESPONSE_MESSAGES.HELLO_WORLD) {
            return 'HELLO_RESPONSE';
        }

        // Check for specific error types
        if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND) {
            return 'NOT_FOUND_RESPONSE';
        }

        if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
            return 'METHOD_NOT_ALLOWED_RESPONSE';
        }

        // General categorization
        const category = getStatusCategory(statusCode);
        switch (category) {
            case 'SUCCESS':
                return 'SUCCESS_RESPONSE';
            case 'CLIENT_ERROR':
            case 'SERVER_ERROR':
                return 'ERROR_RESPONSE';
            default:
                return 'SUCCESS_RESPONSE'; // Default fallback
        }
    }

    /**
     * Gets the appropriate validation schema for a response type
     * with fallback handling and custom schema support.
     * 
     * @private
     * @param {string} responseType - The response type to get schema for
     * @param {Object} options - Additional schema options
     * @returns {Object} Validation schema for the response type
     */
    _getValidationSchema(responseType, options = {}) {
        // Get base schema from validation templates
        const baseSchema = this.validationTemplates[responseType] || this.validationTemplates.SUCCESS_RESPONSE;
        
        // Merge with custom options
        return {
            ...baseSchema,
            ...options.customRules
        };
    }

    /**
     * Validates individual header values for format and security compliance
     * 
     * @private
     * @param {Object} headers - Normalized headers object
     * @param {number} statusCode - Response status code for context
     * @returns {Array<string>} Array of header validation errors
     */
    _validateHeaderValues(headers, statusCode) {
        const errors = [];

        // Validate Content-Type header format
        if (headers[HTTP_HEADERS.CONTENT_TYPE]) {
            if (!headers[HTTP_HEADERS.CONTENT_TYPE].includes('/')) {
                errors.push('Content-Type header must include media type');
            }
        }

        // Validate Content-Length header
        if (headers[HTTP_HEADERS.CONTENT_LENGTH]) {
            const contentLength = parseInt(headers[HTTP_HEADERS.CONTENT_LENGTH], 10);
            if (isNaN(contentLength) || contentLength < 0) {
                errors.push('Content-Length must be a valid non-negative integer');
            }
        }

        // Validate Date header format
        if (headers[HTTP_HEADERS.DATE]) {
            const dateValue = new Date(headers[HTTP_HEADERS.DATE]);
            if (isNaN(dateValue.getTime())) {
                errors.push('Date header must be a valid HTTP date format');
            }
        }

        // Validate Allow header for 405 responses
        if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
            if (headers[HTTP_HEADERS.ALLOW]) {
                const allowedMethods = headers[HTTP_HEADERS.ALLOW].split(',').map(m => m.trim().toUpperCase());
                const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
                const invalidMethods = allowedMethods.filter(method => !validMethods.includes(method));
                
                if (invalidMethods.length > 0) {
                    errors.push(`Invalid HTTP methods in Allow header: ${invalidMethods.join(', ')}`);
                }
            }
        }

        return errors;
    }

    /**
     * Validates security requirements for response headers and content
     * 
     * @private
     * @param {Object} response - The response object to validate
     * @param {Object} schema - The validation schema with security requirements
     * @returns {Object} Security validation result
     */
    _validateSecurityRequirements(response, schema) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check for required security headers
        if (schema.securityHeaders) {
            for (const securityHeader of schema.securityHeaders) {
                if (!response.headers[securityHeader]) {
                    result.errors.push(`Missing required security header: ${securityHeader}`);
                    result.isValid = false;
                }
            }
        }

        // Validate information disclosure prevention
        if (schema.informationDisclosure === false) {
            const statusCategory = getStatusCategory(response.statusCode);
            if ((statusCategory === 'CLIENT_ERROR' || statusCategory === 'SERVER_ERROR')) {
                // Check if error message is generic and safe
                if (this._containsSensitiveInformation(response.content)) {
                    result.warnings.push('Error response may contain sensitive information');
                }
            }
        }

        // Check for server identification security
        if (response.headers[HTTP_HEADERS.SERVER]) {
            if (this._containsVersionInformation(response.headers[HTTP_HEADERS.SERVER])) {
                result.warnings.push('Server header contains version information that could aid attackers');
            }
        }

        return result;
    }

    /**
     * Validates performance requirements for response processing
     * 
     * @private
     * @param {Object} response - The response object to validate
     * @returns {Object} Performance validation result
     */
    _validatePerformanceRequirements(response) {
        const result = {
            isValid: true,
            warnings: []
        };

        // Check response size for performance implications
        const contentSize = Buffer.byteLength(response.content.toString(), 'utf8');
        if (contentSize > 10240) { // 10KB threshold
            result.warnings.push(`Large response size: ${contentSize} bytes may impact performance`);
        }

        // Check header count for performance implications
        const headerCount = Object.keys(response.headers).length;
        if (headerCount > 20) {
            result.warnings.push(`High header count: ${headerCount} headers may impact performance`);
        }

        return result;
    }

    /**
     * Serializes content to string format based on content type
     * 
     * @private
     * @param {*} content - Content to serialize
     * @param {string} contentType - Target content type
     * @returns {string} Serialized content string
     */
    _serializeContent(content, contentType) {
        if (content === null || content === undefined) {
            return '';
        }

        if (typeof content === 'string') {
            return content;
        }

        if (contentType && contentType.includes('application/json')) {
            return JSON.stringify(content);
        }

        return String(content);
    }

    /**
     * Validates if content is valid UTF-8
     * 
     * @private
     * @param {string} content - Content to validate
     * @returns {boolean} True if content is valid UTF-8
     */
    _isValidUtf8Content(content) {
        try {
            // Try to encode and decode the content to check UTF-8 validity
            const buffer = Buffer.from(content, 'utf8');
            return buffer.toString('utf8') === content;
        } catch (error) {
            return false;
        }
    }

    /**
     * Validates content type consistency
     * 
     * @private
     * @param {*} content - Content to validate
     * @param {string} contentType - Declared content type
     * @returns {Object} Content type validation result
     */
    _validateContentType(content, contentType) {
        const result = {
            isValid: true,
            errors: []
        };

        if (contentType.includes('application/json')) {
            try {
                const contentString = typeof content === 'string' ? content : JSON.stringify(content);
                JSON.parse(contentString);
            } catch (jsonError) {
                result.isValid = false;
                result.errors.push('Content is not valid JSON but Content-Type indicates JSON');
            }
        }

        return result;
    }

    /**
     * Validates content encoding requirements
     * 
     * @private
     * @param {string} content - Content to validate
     * @param {string} contentType - Content type for encoding context
     * @returns {Object} Encoding validation result
     */
    _validateContentEncoding(content, contentType) {
        const result = {
            isValid: true,
            warnings: []
        };

        // Check for potential encoding issues
        if (content.includes('�')) {
            result.warnings.push('Content may contain encoding artifacts or invalid characters');
        }

        // Validate charset consistency
        if (contentType && contentType.includes('charset=')) {
            const charset = contentType.split('charset=')[1].split(';')[0].trim();
            if (charset.toLowerCase() !== 'utf-8') {
                result.warnings.push(`Non-UTF-8 charset specified: ${charset}`);
            }
        }

        return result;
    }

    /**
     * Checks if content contains potentially sensitive information
     * 
     * @private
     * @param {string} content - Content to check
     * @returns {boolean} True if content may contain sensitive information
     */
    _containsSensitiveInformation(content) {
        const sensitivePatterns = [
            /stack trace/i,
            /error at /i,
            /file:\/\//i,
            /\/home\//i,
            /c:\\/i,
            /password/i,
            /token/i,
            /secret/i,
            /key/i
        ];

        return sensitivePatterns.some(pattern => pattern.test(content));
    }

    /**
     * Checks if server header contains version information
     * 
     * @private
     * @param {string} serverHeader - Server header value
     * @returns {boolean} True if header contains version information
     */
    _containsVersionInformation(serverHeader) {
        const versionPatterns = [
            /\d+\.\d+\.\d+/,
            /node\.?js\/\d+/i,
            /express\/\d+/i,
            /version/i
        ];

        return versionPatterns.some(pattern => pattern.test(serverHeader));
    }

    /**
     * Gets status message for a status code
     * 
     * @private
     * @param {number} statusCode - Status code to get message for
     * @returns {string} Status message
     */
    _getStatusMessage(statusCode) {
        // Use imported status code utilities or fallback to simple mapping
        const statusMessages = {
            200: 'OK',
            201: 'Created',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable'
        };

        return statusMessages[statusCode] || `Status ${statusCode}`;
    }

    /**
     * Records validation results for metrics and monitoring
     * 
     * @private
     * @param {Object} result - Validation result object
     * @param {bigint} startTime - Validation start time
     */
    _recordValidationResult(result, startTime) {
        // Calculate validation execution time
        const endTime = process.hrtime.bigint();
        const validationTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Update validation statistics
        this.validationStats.totalValidations++;
        
        if (result.isValid) {
            this.validationStats.successfulValidations++;
        } else {
            this.validationStats.failedValidations++;
            
            // Track error types for analysis
            result.errors.forEach(error => {
                const errorType = error.split(':')[0] || 'unknown';
                this.validationStats.errorBreakdown[errorType] = 
                    (this.validationStats.errorBreakdown[errorType] || 0) + 1;
            });
        }

        // Update performance metrics
        const metrics = this.validationStats.performanceMetrics;
        metrics.maxValidationTime = Math.max(metrics.maxValidationTime, validationTime);
        metrics.minValidationTime = Math.min(metrics.minValidationTime, validationTime);
        
        // Update average validation time
        const totalTime = (metrics.averageValidationTime * (this.validationStats.totalValidations - 1)) + validationTime;
        metrics.averageValidationTime = totalTime / this.validationStats.totalValidations;
    }

    /**
     * Validates header security requirements and injection prevention
     * 
     * @private
     * @param {Object} headers - Headers to validate for security
     * @returns {Object} Security validation result
     */
    _validateHeaderSecurity(headers) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check for header injection attempts
        Object.entries(headers).forEach(([key, value]) => {
            if (typeof value === 'string') {
                // Check for CRLF injection
                if (value.includes('\r') || value.includes('\n')) {
                    result.errors.push(`Header ${key} contains CRLF characters (potential injection)`);
                    result.isValid = false;
                }

                // Check for control characters
                if (/[\x00-\x1f\x7f]/.test(value)) {
                    result.warnings.push(`Header ${key} contains control characters`);
                }
            }
        });

        return result;
    }
}

/**
 * Utility Functions for Response Processing
 * These functions provide additional response processing capabilities
 * beyond the main validation framework.
 */

/**
 * Generates a unique correlation ID for response tracking
 * 
 * @returns {string} Unique correlation identifier
 */
function generateCorrelationId() {
    // Generate timestamp-based correlation ID
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `resp_${timestamp}_${randomPart}`;
}

/**
 * Determines response type classification based on status code
 * 
 * @param {number} statusCode - Status code to classify
 * @returns {string} Response type classification
 */
function determineResponseType(statusCode) {
    const category = getStatusCategory(statusCode);
    
    switch (category) {
        case 'SUCCESS':
            return statusCode === HTTP_STATUS_CODES.SUCCESS.OK ? 'hello' : 'success';
        case 'CLIENT_ERROR':
            return 'client_error';
        case 'SERVER_ERROR':
            return 'server_error';
        default:
            return 'unknown';
    }
}

/**
 * Extracts content encoding from response headers
 * 
 * @param {Object} headers - Response headers object
 * @returns {string} Content encoding method
 */
function extractContentEncoding(headers) {
    if (!headers || typeof headers !== 'object') {
        return 'utf-8';
    }

    const contentType = headers[HTTP_HEADERS.CONTENT_TYPE] || '';
    
    // Extract charset from Content-Type header
    if (contentType.includes('charset=')) {
        const charset = contentType.split('charset=')[1].split(';')[0].trim();
        return charset.toLowerCase();
    }

    return 'utf-8'; // Default encoding
}

/**
 * Global object exports for comprehensive response type management
 * All exports use named exports for tree-shaking optimization and clear dependency management
 */

// Export JSDoc type definitions object
module.exports = {
    // Primary response type definitions and validation schemas
    RESPONSE_TYPES,
    VALIDATION_SCHEMAS,
    RESPONSE_TEMPLATES,

    // Response validation class for comprehensive validation
    ResponseTypeValidator,

    // Utility functions for response processing and validation
    validateResponseType,
    createResponseValidationSchema,
    normalizeResponseObject,
    isValidResponseStructure,
    extractResponseMetadata,

    // Helper utilities for response processing
    generateCorrelationId,
    determineResponseType,
    extractContentEncoding
};