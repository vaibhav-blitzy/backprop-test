/**
 * HTTP Response Utility Module for Node.js Tutorial Application
 * 
 * This module provides comprehensive response creation, formatting, and validation functions
 * for the Node.js tutorial application. Implements standardized response object generation 
 * with proper HTTP protocol compliance, security header management, and educational clarity.
 * 
 * Serves as the foundational utility layer supporting response handlers with reusable functions
 * for Hello world responses, success responses, error responses, and header formatting while
 * demonstrating production-ready utility design patterns.
 * 
 * Key Features:
 * - Standardized HTTP response generation with proper status codes and headers
 * - Educational patterns demonstrating HTTP protocol compliance and best practices
 * - Security header management with protection against web vulnerabilities
 * - Content length calculation with accurate UTF-8 byte measurement
 * - Response validation ensuring HTTP compliance before transmission
 * - Comprehensive error handling with secure information disclosure prevention
 * - Logging integration for monitoring and debugging support
 * - Metadata generation for response tracking and correlation
 * 
 * Educational Value:
 * - Demonstrates HTTP response creation patterns and protocol compliance
 * - Shows proper error handling without information disclosure vulnerabilities
 * - Illustrates security header implementation for web application protection
 * - Provides examples of utility function design and composition patterns
 * - Shows integration between multiple system components and constants
 * 
 * Production Readiness:
 * - Comprehensive input validation and error handling throughout all functions
 * - Security considerations including MIME sniffing protection and generic error messages
 * - Performance optimization with efficient memory usage and response generation
 * - Monitoring integration with structured logging for observability
 * - HTTP protocol compliance with proper header formatting and status codes
 * 
 * Architecture Integration:
 * - Integrates with response message constants for consistent content generation
 * - Uses HTTP header constants for proper header formatting and security
 * - Incorporates HTTP status code utilities for proper status management
 * - Utilizes logging utilities for comprehensive request-response monitoring
 * - Supports configuration-driven behavior through application settings
 * 
 * @fileoverview HTTP response utility module with comprehensive response management
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - INTERNAL DEPENDENCIES
// ============================================================================

// Import standardized response message constants for consistent response content
import { 
    RESPONSE_MESSAGES,
    SUCCESS_MESSAGES,
    HELLO_ENDPOINT_MESSAGES,
    ERROR_MESSAGES as RESPONSE_ERROR_MESSAGES
} from '../constants/response-messages.js';

// Import HTTP header constants for proper header management and formatting
import {
    HTTP_HEADERS,
    CONTENT_TYPES,
    SECURITY_HEADERS,
    SERVER_IDENTIFICATION
} from '../constants/http-headers.js';

// Import HTTP status code constants and validation utilities for proper response status management
import {
    HTTP_STATUS_CODES,
    isValidStatusCode,
    getStatusCategory
} from './http-status.js';

// Import logging utilities for response utility function tracking and debugging
import { logger } from './logger.js';

// Import error message constants for comprehensive error handling
import {
    ERROR_MESSAGES,
    HTTP_ERROR_MESSAGES,
    VALIDATION_ERROR_MESSAGES,
    SERVER_ERROR_MESSAGES
} from '../constants/error-messages.js';

// ============================================================================
// MODULE IMPORTS - EXTERNAL DEPENDENCIES
// ============================================================================

// Node.js Buffer for accurate content length calculation and string encoding operations
// Built-in Node.js module - no version specification needed

// ============================================================================
// GLOBAL CONSTANTS AND DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default character encoding for all HTTP response content to ensure consistent text processing
 * across all response generation functions with proper UTF-8 support.
 */
const DEFAULT_RESPONSE_ENCODING = 'utf-8';

/**
 * Default Content-Type header value for text responses with charset specification
 * providing browser compatibility and proper character encoding declaration.
 */
const DEFAULT_CONTENT_TYPE = 'text/plain; charset=utf-8';

/**
 * Response validation rules object containing validation criteria for response parameters
 * including status codes, content types, and header formats for HTTP compliance checking.
 */
const RESPONSE_VALIDATION_RULES = {
    // Status code validation parameters
    validStatusCodes: {
        min: 100,
        max: 599,
        successRange: [200, 299],
        clientErrorRange: [400, 499],
        serverErrorRange: [500, 599]
    },
    
    // Content type validation patterns
    validContentTypes: [
        CONTENT_TYPES.TEXT_PLAIN_UTF8,
        CONTENT_TYPES.APPLICATION_JSON_UTF8,
        'text/plain',
        'application/json'
    ],
    
    // Header validation requirements
    requiredHeaders: [
        HTTP_HEADERS.CONTENT_TYPE,
        HTTP_HEADERS.CONTENT_LENGTH,
        HTTP_HEADERS.DATE
    ],
    
    // Content validation limits
    contentLimits: {
        maxContentLength: 1048576, // 1MB limit for tutorial scope
        maxHeaderCount: 50,
        maxHeaderValueLength: 8192
    }
};

// ============================================================================
// CORE RESPONSE CREATION FUNCTIONS
// ============================================================================

/**
 * Creates a standardized response object for the /hello endpoint containing the 'Hello world'
 * message with proper HTTP formatting, headers, and educational clarity for tutorial demonstration.
 * 
 * This function demonstrates basic HTTP response creation patterns while maintaining production-ready
 * error handling and protocol compliance. It serves as the foundational example for HTTP response
 * generation in the Node.js tutorial application.
 * 
 * Implementation Features:
 * - Uses standardized response message constants for consistent content
 * - Applies appropriate Content-Type header for browser compatibility
 * - Calculates exact content length using Buffer.byteLength for HTTP compliance
 * - Generates standard headers including Date, Server, and security headers
 * - Implements comprehensive error handling with detailed logging
 * - Returns structured response object ready for HTTP transmission
 * 
 * @param {Object} [options={}] - Configuration options for hello response customization
 * @param {string} [options.encoding=DEFAULT_RESPONSE_ENCODING] - Character encoding for response content
 * @param {Object} [options.customHeaders] - Additional headers to include in response
 * @param {boolean} [options.includeMetadata=false] - Include response metadata for debugging
 * @param {string} [options.responseId] - Custom response correlation ID for tracking
 * @param {boolean} [options.enableLogging=true] - Enable response creation logging
 * 
 * @returns {Object} Formatted response object with Hello world content, 200 status code, and appropriate headers
 * @returns {number} returns.statusCode - HTTP status code (200)
 * @returns {Object} returns.headers - HTTP headers object with proper formatting
 * @returns {string} returns.content - Response body content ("Hello world")
 * @returns {string} returns.contentType - Content-Type header value
 * @returns {number} returns.contentLength - Content length in bytes
 * @returns {Object} [returns.metadata] - Response metadata if includeMetadata is true
 * 
 * @throws {Error} Configuration or response generation errors with detailed context
 * 
 * @example
 * // Basic hello response creation
 * const helloResponse = createHelloResponse();
 * // Returns: { statusCode: 200, headers: {...}, content: "Hello world", ... }
 * 
 * @example
 * // Hello response with custom options
 * const customHelloResponse = createHelloResponse({
 *   customHeaders: { 'X-Tutorial': 'Node.js HTTP Server' },
 *   includeMetadata: true,
 *   responseId: 'hello-001'
 * });
 */
function createHelloResponse(options = {}) {
    try {
        // Initialize options with defaults for hello response configuration
        const responseOptions = {
            encoding: DEFAULT_RESPONSE_ENCODING,
            customHeaders: {},
            includeMetadata: false,
            responseId: null,
            enableLogging: true,
            ...options
        };

        // Log hello response creation for educational monitoring and debugging
        if (responseOptions.enableLogging) {
            logger.debug('Creating hello response', {
                function: 'createHelloResponse',
                options: responseOptions,
                timestamp: new Date().toISOString()
            });
        }

        // Use standardized hello world message constant for consistent content
        const responseContent = RESPONSE_MESSAGES.HELLO_WORLD;
        
        // Validate response content exists and is valid string
        if (!responseContent || typeof responseContent !== 'string') {
            throw new Error('Invalid hello world message content in response constants');
        }

        // Set HTTP status code to 200 OK for successful hello response
        const statusCode = HTTP_STATUS_CODES.SUCCESS.OK;

        // Apply text/plain content type for browser compatibility and educational clarity
        const contentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;

        // Calculate exact content length using Buffer.byteLength for HTTP protocol compliance
        const contentLength = calculateContentLength(responseContent, responseOptions.encoding);

        // Generate comprehensive headers with security headers and standard HTTP headers
        const responseHeaders = formatHeaders({
            [HTTP_HEADERS.CONTENT_TYPE]: contentType,
            [HTTP_HEADERS.CONTENT_LENGTH]: contentLength.toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: SERVER_IDENTIFICATION.SERVER_NAME,
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE,
            ...responseOptions.customHeaders
        });

        // Create comprehensive response object with all necessary components
        const helloResponseObject = {
            statusCode: statusCode,
            headers: responseHeaders,
            content: responseContent,
            contentType: contentType,
            contentLength: contentLength,
            encoding: responseOptions.encoding
        };

        // Add response metadata if requested for debugging and monitoring
        if (responseOptions.includeMetadata) {
            helloResponseObject.metadata = createResponseMetadata(
                statusCode,
                contentLength,
                {
                    responseType: 'hello',
                    endpoint: '/hello',
                    responseId: responseOptions.responseId || generateResponseId(),
                    generationMethod: 'createHelloResponse'
                }
            );
        }

        // Log successful hello response creation with performance details
        if (responseOptions.enableLogging) {
            logger.info('Hello response created successfully', {
                statusCode: statusCode,
                contentLength: contentLength,
                contentType: contentType,
                hasMetadata: responseOptions.includeMetadata,
                responseId: responseOptions.responseId,
                performance: {
                    generationTime: Date.now(),
                    memoryEfficient: true
                }
            });
        }

        // Return complete hello response object ready for HTTP transmission
        return helloResponseObject;

    } catch (error) {
        // Enhanced error handling for hello response creation failures
        const enhancedError = new Error(`Hello response creation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'createHelloResponse',
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        // Log hello response creation error for debugging
        logger.warn('Hello response creation failed', {
            error: enhancedError.message,
            originalError: error.message,
            context: enhancedError.context
        });

        throw enhancedError;
    }
}

/**
 * Creates standardized success response objects (2xx status codes) with configurable content 
 * and consistent header formatting for successful operation responses.
 * 
 * This function provides a flexible foundation for generating various types of success responses
 * while maintaining HTTP protocol compliance and security best practices. It supports both
 * text and JSON content with automatic content type detection and proper encoding.
 * 
 * Implementation Features:
 * - Validates status codes are in 2xx success range using isValidStatusCode
 * - Determines appropriate content type based on content parameter type
 * - Formats content with proper encoding and serialization
 * - Calculates accurate content length for HTTP Content-Length header
 * - Generates comprehensive headers with security and standard HTTP headers
 * - Implements structured error handling with detailed context
 * - Provides extensive logging for monitoring and debugging
 * 
 * @param {string|Object} content - Response content (string for text, object for JSON)
 * @param {number} [statusCode=200] - HTTP status code (must be in 2xx range)
 * @param {Object} [options={}] - Configuration options for response customization
 * @param {string} [options.contentType] - Override automatic content type detection
 * @param {string} [options.encoding=DEFAULT_RESPONSE_ENCODING] - Character encoding
 * @param {Object} [options.customHeaders] - Additional headers to include
 * @param {boolean} [options.includeMetadata=false] - Include response metadata
 * @param {string} [options.responseId] - Response correlation ID for tracking
 * @param {boolean} [options.enableLogging=true] - Enable response creation logging
 * 
 * @returns {Object} Formatted success response object with appropriate 2xx status code and content
 * @returns {number} returns.statusCode - HTTP status code (2xx range)
 * @returns {Object} returns.headers - HTTP headers object with proper formatting
 * @returns {string} returns.content - Formatted response body content
 * @returns {string} returns.contentType - Content-Type header value
 * @returns {number} returns.contentLength - Content length in bytes
 * @returns {Object} [returns.metadata] - Response metadata if requested
 * 
 * @throws {Error} Invalid status code, content formatting, or response generation errors
 * 
 * @example
 * // Basic success response with text content
 * const successResponse = createSuccessResponse('Operation completed successfully');
 * 
 * @example
 * // Success response with JSON content and custom status
 * const jsonResponse = createSuccessResponse(
 *   { message: 'Data processed', count: 42 },
 *   201,
 *   { includeMetadata: true }
 * );
 * 
 * @example
 * // Success response with custom headers and options
 * const customResponse = createSuccessResponse('Updated', 202, {
 *   customHeaders: { 'X-Processing-Time': '150ms' },
 *   responseId: 'update-123'
 * });
 */
function createSuccessResponse(content, statusCode = HTTP_STATUS_CODES.SUCCESS.OK, options = {}) {
    try {
        // Initialize response configuration options with defaults
        const responseOptions = {
            contentType: null, // Auto-detect based on content type
            encoding: DEFAULT_RESPONSE_ENCODING,
            customHeaders: {},
            includeMetadata: false,
            responseId: null,
            enableLogging: true,
            ...options
        };

        // Log success response creation initiation for monitoring
        if (responseOptions.enableLogging) {
            logger.debug('Creating success response', {
                function: 'createSuccessResponse',
                statusCode: statusCode,
                contentType: typeof content,
                options: responseOptions,
                timestamp: new Date().toISOString()
            });
        }

        // Validate status code is in 2xx success range using HTTP status validation
        if (!isValidStatusCode(statusCode)) {
            throw new Error(`Invalid status code: ${statusCode}. Must be a valid HTTP status code.`);
        }

        const statusCategory = getStatusCategory(statusCode);
        if (statusCategory !== 'Success') {
            throw new Error(`Status code ${statusCode} is not in success range (2xx). Received category: ${statusCategory}`);
        }

        // Validate content parameter is provided and valid
        if (content === null || content === undefined) {
            throw new Error('Content parameter is required for success response generation');
        }

        // Determine appropriate content type based on content parameter type
        let detectedContentType;
        let formattedContent;

        if (typeof content === 'string') {
            // Handle string content as plain text
            detectedContentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            formattedContent = content;
        } else if (typeof content === 'object') {
            // Handle object content as JSON with serialization
            detectedContentType = CONTENT_TYPES.APPLICATION_JSON_UTF8;
            formattedContent = formatResponseContent(content, detectedContentType);
        } else {
            // Handle other content types by converting to string
            detectedContentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            formattedContent = String(content);
        }

        // Use custom content type if provided, otherwise use detected type
        const finalContentType = responseOptions.contentType || detectedContentType;

        // Format content appropriately based on final content type
        const responseContent = formatResponseContent(formattedContent, finalContentType);

        // Calculate accurate content length using Buffer.byteLength for HTTP compliance
        const contentLength = calculateContentLength(responseContent, responseOptions.encoding);

        // Generate comprehensive success response headers with security headers
        const responseHeaders = formatHeaders({
            [HTTP_HEADERS.CONTENT_TYPE]: finalContentType,
            [HTTP_HEADERS.CONTENT_LENGTH]: contentLength.toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: SERVER_IDENTIFICATION.SERVER_NAME,
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE,
            ...responseOptions.customHeaders
        }, {
            includeSecurityHeaders: true,
            responseType: 'success'
        });

        // Create comprehensive success response object with all components
        const successResponseObject = {
            statusCode: statusCode,
            headers: responseHeaders,
            content: responseContent,
            contentType: finalContentType,
            contentLength: contentLength,
            encoding: responseOptions.encoding,
            category: statusCategory
        };

        // Add response metadata if requested for debugging and monitoring
        if (responseOptions.includeMetadata) {
            successResponseObject.metadata = createResponseMetadata(
                statusCode,
                contentLength,
                {
                    responseType: 'success',
                    responseId: responseOptions.responseId || generateResponseId(),
                    generationMethod: 'createSuccessResponse',
                    contentStructure: typeof content,
                    originalContentType: detectedContentType
                }
            );
        }

        // Log successful response creation with comprehensive details
        if (responseOptions.enableLogging) {
            logger.info('Success response created successfully', {
                statusCode: statusCode,
                statusCategory: statusCategory,
                contentType: finalContentType,
                contentLength: contentLength,
                hasCustomHeaders: Object.keys(responseOptions.customHeaders).length > 0,
                hasMetadata: responseOptions.includeMetadata,
                responseId: responseOptions.responseId,
                performance: {
                    generationTime: Date.now(),
                    contentProcessing: 'completed'
                }
            });
        }

        // Return complete success response object ready for transmission
        return successResponseObject;

    } catch (error) {
        // Enhanced error handling for success response creation failures
        const enhancedError = new Error(`Success response creation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'createSuccessResponse',
            providedStatusCode: statusCode,
            contentType: typeof content,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        // Log success response creation error for debugging and monitoring
        logger.warn('Success response creation failed', {
            error: enhancedError.message,
            originalError: error.message,
            context: enhancedError.context,
            statusCode: statusCode
        });

        throw enhancedError;
    }
}

/**
 * Creates secure error response objects (4xx and 5xx status codes) with generic error messages
 * and proper status code handling while preventing information disclosure vulnerabilities.
 * 
 * This function implements security best practices by providing generic error messages to clients
 * while logging detailed error information for debugging. It prevents information disclosure attacks
 * by sanitizing error messages and avoiding exposure of system internals.
 * 
 * Security Features:
 * - Sanitizes error messages to prevent information disclosure
 * - Uses generic client-facing error messages for security
 * - Logs detailed error context for debugging without client exposure
 * - Implements proper HTTP status code validation for error ranges
 * - Adds error-specific headers based on status code requirements
 * - Prevents sensitive system information inclusion in responses
 * 
 * Implementation Features:
 * - Validates error status codes are in 4xx or 5xx range
 * - Determines appropriate content type for error responses
 * - Generates standard error headers with security considerations
 * - Creates structured error response objects with minimal information
 * - Implements comprehensive error logging for debugging
 * - Supports custom error context for internal monitoring
 * 
 * @param {number} statusCode - HTTP error status code (4xx or 5xx range)
 * @param {string} [errorMessage] - Internal error message for logging (sanitized for client)
 * @param {Object} [errorContext={}] - Additional error context for debugging and monitoring
 * @param {Object} [options={}] - Configuration options for error response customization
 * @param {boolean} [options.includeDetails=false] - Include additional error details (dev mode only)
 * @param {Object} [options.customHeaders] - Additional headers for error response
 * @param {string} [options.responseId] - Error response correlation ID
 * @param {boolean} [options.enableLogging=true] - Enable error response logging
 * @param {boolean} [options.sanitizeMessage=true] - Sanitize error messages for security
 * 
 * @returns {Object} Formatted error response object with appropriate status code and secure error details
 * @returns {number} returns.statusCode - HTTP error status code (4xx or 5xx)
 * @returns {Object} returns.headers - HTTP headers object with error-specific headers
 * @returns {string} returns.content - Generic error message content (sanitized)
 * @returns {string} returns.contentType - Content-Type header value
 * @returns {number} returns.contentLength - Content length in bytes
 * @returns {string} returns.category - Error category ('Client Error' or 'Server Error')
 * @returns {Object} [returns.metadata] - Error metadata for debugging
 * 
 * @throws {Error} Invalid status code or error response generation failures
 * 
 * @example
 * // Basic 404 error response
 * const notFoundResponse = createErrorResponse(404, 'Resource not found');
 * 
 * @example
 * // Server error with context
 * const serverErrorResponse = createErrorResponse(500, 'Database connection failed', {
 *   database: 'primary',
 *   operation: 'user lookup',
 *   timestamp: new Date().toISOString()
 * });
 * 
 * @example
 * // Client error with custom headers
 * const badRequestResponse = createErrorResponse(400, 'Invalid input', {}, {
 *   customHeaders: { 'X-Validation-Error': 'field-required' },
 *   responseId: 'error-001'
 * });
 */
function createErrorResponse(statusCode, errorMessage = null, errorContext = {}, options = {}) {
    try {
        // Initialize error response configuration options with security defaults
        const responseOptions = {
            includeDetails: false, // Security: default to minimal error exposure
            customHeaders: {},
            responseId: null,
            enableLogging: true,
            sanitizeMessage: true, // Security: sanitize error messages by default
            ...options
        };

        // Log error response creation initiation for monitoring and debugging
        if (responseOptions.enableLogging) {
            logger.debug('Creating error response', {
                function: 'createErrorResponse',
                statusCode: statusCode,
                hasErrorMessage: !!errorMessage,
                hasErrorContext: Object.keys(errorContext).length > 0,
                options: responseOptions,
                timestamp: new Date().toISOString()
            });
        }

        // Validate error status code is in valid error range (4xx or 5xx)
        if (!isValidStatusCode(statusCode)) {
            throw new Error(`Invalid error status code: ${statusCode}. Must be a valid HTTP status code.`);
        }

        const statusCategory = getStatusCategory(statusCode);
        if (statusCategory !== 'Client Error' && statusCategory !== 'Server Error') {
            throw new Error(`Status code ${statusCode} is not an error code. Must be 4xx or 5xx range. Received category: ${statusCategory}`);
        }

        // Determine generic error message based on status code for security
        let clientErrorMessage;
        let internalErrorMessage = errorMessage;

        // Use generic messages to prevent information disclosure
        if (statusCategory === 'Client Error') {
            // 4xx errors - generic client error messages
            switch (statusCode) {
                case HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST:
                    clientErrorMessage = ERROR_MESSAGES.BAD_REQUEST;
                    break;
                case HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND:
                    clientErrorMessage = ERROR_MESSAGES.NOT_FOUND;
                    break;
                case HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED:
                    clientErrorMessage = ERROR_MESSAGES.METHOD_NOT_ALLOWED;
                    break;
                default:
                    clientErrorMessage = ERROR_MESSAGES.BAD_REQUEST;
            }
        } else {
            // 5xx errors - generic server error messages
            clientErrorMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
        }

        // Sanitize error message if security sanitization is enabled
        if (responseOptions.sanitizeMessage) {
            clientErrorMessage = sanitizeErrorMessage(clientErrorMessage);
        }

        // Set content type for error responses as plain text
        const contentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;

        // Calculate content length for error message
        const contentLength = calculateContentLength(clientErrorMessage, DEFAULT_RESPONSE_ENCODING);

        // Create error-specific headers based on status code
        const errorSpecificHeaders = {};
        
        // Add Allow header for 405 Method Not Allowed responses
        if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
            errorSpecificHeaders['Allow'] = 'GET'; // Hello endpoint only supports GET
        }

        // Generate comprehensive error headers with security headers
        const responseHeaders = formatHeaders({
            [HTTP_HEADERS.CONTENT_TYPE]: contentType,
            [HTTP_HEADERS.CONTENT_LENGTH]: contentLength.toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: SERVER_IDENTIFICATION.SERVER_NAME,
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE,
            ...errorSpecificHeaders,
            ...responseOptions.customHeaders
        }, {
            includeSecurityHeaders: true,
            responseType: 'error'
        });

        // Create comprehensive error response object with secure error information
        const errorResponseObject = {
            statusCode: statusCode,
            headers: responseHeaders,
            content: clientErrorMessage,
            contentType: contentType,
            contentLength: contentLength,
            encoding: DEFAULT_RESPONSE_ENCODING,
            category: statusCategory,
            errorType: statusCode >= 500 ? 'server_error' : 'client_error'
        };

        // Add error metadata for debugging (internal use only)
        const errorMetadata = createResponseMetadata(
            statusCode,
            contentLength,
            {
                responseType: 'error',
                errorCategory: statusCategory,
                responseId: responseOptions.responseId || generateResponseId(),
                generationMethod: 'createErrorResponse',
                internalContext: errorContext,
                sanitized: responseOptions.sanitizeMessage
            }
        );

        // Include metadata in response if debugging is enabled
        if (responseOptions.includeDetails) {
            errorResponseObject.metadata = errorMetadata;
        }

        // Log comprehensive error details for debugging (without exposing to client)
        if (responseOptions.enableLogging) {
            const logLevel = statusCategory === 'Server Error' ? 'warn' : 'info';
            logger[logLevel]('Error response created', {
                statusCode: statusCode,
                statusCategory: statusCategory,
                clientMessage: clientErrorMessage,
                internalMessage: internalErrorMessage,
                errorContext: errorContext,
                contentLength: contentLength,
                responseId: responseOptions.responseId,
                metadata: errorMetadata,
                security: {
                    messageSanitized: responseOptions.sanitizeMessage,
                    detailsIncluded: responseOptions.includeDetails,
                    informationDisclosure: 'prevented'
                }
            });
        }

        // Return complete error response object ready for secure transmission
        return errorResponseObject;

    } catch (error) {
        // Enhanced error handling for error response creation failures
        const enhancedError = new Error(`Error response creation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'createErrorResponse',
            providedStatusCode: statusCode,
            providedErrorMessage: errorMessage,
            errorContext: errorContext,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        // Log error response creation failure for debugging
        logger.warn('Error response creation failed', {
            error: enhancedError.message,
            originalError: error.message,
            context: enhancedError.context,
            statusCode: statusCode
        });

        throw enhancedError;
    }
}

// ============================================================================
// HEADER FORMATTING AND VALIDATION FUNCTIONS  
// ============================================================================

/**
 * Formats HTTP headers object with proper case normalization, security headers, and Node.js
 * HTTP module compliance including lowercase header names and proper value formatting.
 * 
 * This function ensures HTTP header compliance by converting all header names to lowercase
 * for Node.js HTTP module compatibility while adding essential security headers to protect
 * against common web vulnerabilities including MIME sniffing attacks.
 * 
 * Implementation Features:
 * - Converts header names to lowercase for Node.js HTTP compliance
 * - Adds standard headers including Date with current ISO timestamp
 * - Includes server identification using generic server name
 * - Applies security headers including X-Content-Type-Options for protection
 * - Merges custom headers with proper formatting and validation
 * - Validates header values for HTTP compliance and security
 * - Supports flexible header configuration based on response type
 * 
 * @param {Object} customHeaders - Custom headers to include in formatted headers object
 * @param {Object} [options={}] - Header formatting options and configuration
 * @param {boolean} [options.includeSecurityHeaders=true] - Include security headers automatically
 * @param {boolean} [options.includeServerHeader=true] - Include Server identification header
 * @param {boolean} [options.includeDateHeader=true] - Include Date header with current timestamp
 * @param {string} [options.responseType='default'] - Response type for header customization
 * @param {boolean} [options.validateHeaders=true] - Enable header validation
 * @param {boolean} [options.enableLogging=false] - Enable header formatting logging
 * 
 * @returns {Object} Formatted headers object with proper case and security headers included
 * @returns {Object} returns - Formatted headers with lowercase keys and proper values
 * 
 * @throws {Error} Header validation or formatting errors with detailed context
 * 
 * @example
 * // Basic header formatting with security headers
 * const headers = formatHeaders({
 *   'Content-Type': 'text/plain; charset=utf-8',
 *   'Content-Length': '11'
 * });
 * // Returns: { 'content-type': 'text/plain; charset=utf-8', 'content-length': '11', ... }
 * 
 * @example
 * // Custom header formatting with options
 * const customHeaders = formatHeaders({
 *   'X-Custom-Header': 'custom-value'
 * }, {
 *   responseType: 'error',
 *   includeSecurityHeaders: true,
 *   enableLogging: true
 * });
 */
function formatHeaders(customHeaders = {}, options = {}) {
    try {
        // Initialize header formatting options with defaults
        const headerOptions = {
            includeSecurityHeaders: true,
            includeServerHeader: true,
            includeDateHeader: true,
            responseType: 'default',
            validateHeaders: true,
            enableLogging: false,
            ...options
        };

        // Log header formatting initiation if logging is enabled
        if (headerOptions.enableLogging) {
            logger.debug('Formatting HTTP headers', {
                function: 'formatHeaders',
                customHeaderCount: Object.keys(customHeaders).length,
                options: headerOptions,
                timestamp: new Date().toISOString()
            });
        }

        // Validate custom headers parameter is object
        if (!customHeaders || typeof customHeaders !== 'object') {
            throw new Error('Custom headers must be a valid object');
        }

        // Initialize formatted headers object with security headers
        const formattedHeaders = {};

        // Add standard security headers if enabled
        if (headerOptions.includeSecurityHeaders) {
            // Add X-Content-Type-Options header to prevent MIME sniffing attacks
            formattedHeaders[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS] = SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE;
        }

        // Add Server identification header if enabled
        if (headerOptions.includeServerHeader) {
            formattedHeaders[HTTP_HEADERS.SERVER] = SERVER_IDENTIFICATION.SERVER_NAME;
        }

        // Add Date header with current timestamp if enabled
        if (headerOptions.includeDateHeader) {
            formattedHeaders[HTTP_HEADERS.DATE] = new Date().toUTCString();
        }

        // Process and normalize custom headers
        Object.keys(customHeaders).forEach(headerName => {
            // Validate header name is valid string
            if (!headerName || typeof headerName !== 'string') {
                throw new Error(`Invalid header name: ${headerName}. Header names must be non-empty strings.`);
            }

            // Convert header name to lowercase for Node.js HTTP compliance
            const normalizedHeaderName = headerName.toLowerCase().trim();

            // Validate header name format for HTTP compliance
            if (headerOptions.validateHeaders) {
                const headerNamePattern = /^[a-zA-Z0-9\-_]+$/;
                if (!headerNamePattern.test(normalizedHeaderName)) {
                    throw new Error(`Invalid header name format: ${headerName}. Headers must contain only alphanumeric characters, hyphens, and underscores.`);
                }
            }

            // Get header value and validate
            const headerValue = customHeaders[headerName];
            if (headerValue === null || headerValue === undefined) {
                throw new Error(`Header value cannot be null or undefined for header: ${headerName}`);
            }

            // Convert header value to string and validate format
            const normalizedHeaderValue = String(headerValue).trim();
            
            if (headerOptions.validateHeaders) {
                // Validate header value length for HTTP compliance
                if (normalizedHeaderValue.length > RESPONSE_VALIDATION_RULES.contentLimits.maxHeaderValueLength) {
                    throw new Error(`Header value too long for ${headerName}. Maximum length: ${RESPONSE_VALIDATION_RULES.contentLimits.maxHeaderValueLength}`);
                }

                // Validate header value doesn't contain invalid characters
                if (normalizedHeaderValue.includes('\n') || normalizedHeaderValue.includes('\r')) {
                    throw new Error(`Invalid characters in header value for ${headerName}. Header values cannot contain newline characters.`);
                }
            }

            // Add normalized header to formatted headers object
            formattedHeaders[normalizedHeaderName] = normalizedHeaderValue;
        });

        // Apply response-type specific header modifications
        switch (headerOptions.responseType) {
            case 'error':
                // Add error-specific headers if needed
                if (!formattedHeaders['cache-control']) {
                    formattedHeaders['cache-control'] = 'no-cache, no-store, must-revalidate';
                }
                break;
            case 'success':
                // Add success-specific headers if needed
                break;
            case 'hello':
                // Add hello-specific headers if needed
                break;
            default:
                // Default headers already applied
                break;
        }

        // Validate total header count for HTTP compliance
        if (headerOptions.validateHeaders) {
            const totalHeaderCount = Object.keys(formattedHeaders).length;
            if (totalHeaderCount > RESPONSE_VALIDATION_RULES.contentLimits.maxHeaderCount) {
                throw new Error(`Too many headers: ${totalHeaderCount}. Maximum allowed: ${RESPONSE_VALIDATION_RULES.contentLimits.maxHeaderCount}`);
            }
        }

        // Log successful header formatting if logging is enabled
        if (headerOptions.enableLogging) {
            logger.debug('HTTP headers formatted successfully', {
                totalHeaders: Object.keys(formattedHeaders).length,
                securityHeadersIncluded: headerOptions.includeSecurityHeaders,
                serverHeaderIncluded: headerOptions.includeServerHeader,
                dateHeaderIncluded: headerOptions.includeDateHeader,
                responseType: headerOptions.responseType,
                headerNames: Object.keys(formattedHeaders)
            });
        }

        // Return formatted headers object ready for Node.js HTTP response.writeHead()
        return formattedHeaders;

    } catch (error) {
        // Enhanced error handling for header formatting failures
        const enhancedError = new Error(`Header formatting failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'formatHeaders',
            customHeaders: JSON.stringify(customHeaders, null, 2),
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        // Log header formatting error for debugging
        if (options.enableLogging !== false) {
            logger.warn('Header formatting failed', {
                error: enhancedError.message,
                originalError: error.message,
                context: enhancedError.context
            });
        }

        throw enhancedError;
    }
}

// ============================================================================
// RESPONSE VALIDATION AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates response object parameters including status codes, content format, headers, and 
 * HTTP compliance before response transmission to ensure proper HTTP protocol adherence.
 * 
 * This function provides comprehensive validation of response objects to prevent HTTP protocol
 * violations and ensure proper response transmission. It validates all aspects of the response
 * including status codes, headers, content format, and overall HTTP compliance.
 * 
 * Validation Features:
 * - Validates status codes using isValidStatusCode function for HTTP compliance
 * - Checks content format and encoding for proper transmission compatibility
 * - Verifies headers object format and required headers presence
 * - Validates content length calculation against actual content size
 * - Checks content type header matches actual content format
 * - Ensures security headers are properly included and formatted
 * - Verifies response object structure meets HTTP response requirements
 * - Provides detailed validation error reporting for debugging
 * 
 * @param {Object} responseData - Response object to validate for HTTP compliance
 * @param {Object} [options={}] - Validation options and configuration
 * @param {boolean} [options.strictValidation=true] - Enable strict validation mode
 * @param {boolean} [options.validateSecurity=true] - Validate security headers presence
 * @param {boolean} [options.validateContent=true] - Validate content format and encoding
 * @param {boolean} [options.enableLogging=false] - Enable validation process logging
 * 
 * @returns {Object} Validation result with success status, validation errors, and compliance details
 * @returns {boolean} returns.isValid - Overall validation success status
 * @returns {Array<string>} returns.errors - Array of validation error messages
 * @returns {Object} returns.validationDetails - Detailed validation results by category
 * @returns {Object} returns.complianceReport - HTTP compliance analysis
 * @returns {Object} [returns.securityAnalysis] - Security header analysis if enabled
 * 
 * @throws {Error} Validation process errors (not validation failures)
 * 
 * @example
 * // Validate basic response object
 * const validation = validateResponse({
 *   statusCode: 200,
 *   headers: { 'content-type': 'text/plain', 'content-length': '11' },
 *   content: 'Hello world'
 * });
 * 
 * @example
 * // Strict validation with security checking
 * const strictValidation = validateResponse(responseObject, {
 *   strictValidation: true,
 *   validateSecurity: true,
 *   enableLogging: true
 * });
 */
function validateResponse(responseData, options = {}) {
    try {
        // Initialize validation options with defaults
        const validationOptions = {
            strictValidation: true,
            validateSecurity: true,
            validateContent: true,
            enableLogging: false,
            ...options
        };

        // Log response validation initiation if logging is enabled
        if (validationOptions.enableLogging) {
            logger.debug('Starting response validation', {
                function: 'validateResponse',
                hasResponseData: !!responseData,
                options: validationOptions,
                timestamp: new Date().toISOString()
            });
        }

        // Initialize validation result object
        const validationResult = {
            isValid: false,
            errors: [],
            validationDetails: {
                statusCode: { valid: false, details: '' },
                headers: { valid: false, details: '' },
                content: { valid: false, details: '' },
                structure: { valid: false, details: '' }
            },
            complianceReport: {
                httpCompliant: false,
                securityCompliant: false,
                contentCompliant: false
            },
            timestamp: new Date().toISOString()
        };

        // Validate response data parameter exists
        if (!responseData || typeof responseData !== 'object') {
            validationResult.errors.push('Response data must be a valid object');
            return validationResult;
        }

        // Step 1: Validate status code using HTTP status validation utilities
        if (responseData.statusCode !== undefined) {
            if (typeof responseData.statusCode !== 'number') {
                validationResult.errors.push('Status code must be a number');
                validationResult.validationDetails.statusCode.details = 'Invalid type';
            } else if (!isValidStatusCode(responseData.statusCode)) {
                validationResult.errors.push(`Invalid status code: ${responseData.statusCode}`);
                validationResult.validationDetails.statusCode.details = 'Status code out of valid range';
            } else {
                validationResult.validationDetails.statusCode.valid = true;
                validationResult.validationDetails.statusCode.details = `Valid ${getStatusCategory(responseData.statusCode)} status code`;
            }
        } else {
            validationResult.errors.push('Status code is required');
            validationResult.validationDetails.statusCode.details = 'Missing status code';
        }

        // Step 2: Validate headers object format and required headers
        if (responseData.headers !== undefined) {
            if (typeof responseData.headers !== 'object' || responseData.headers === null) {
                validationResult.errors.push('Headers must be a valid object');
                validationResult.validationDetails.headers.details = 'Invalid headers object';
            } else {
                // Check for required headers
                const requiredHeaders = RESPONSE_VALIDATION_RULES.requiredHeaders;
                const missingHeaders = [];
                
                requiredHeaders.forEach(requiredHeader => {
                    if (!responseData.headers[requiredHeader] && !responseData.headers[requiredHeader.toLowerCase()]) {
                        missingHeaders.push(requiredHeader);
                    }
                });

                if (missingHeaders.length > 0) {
                    validationResult.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
                    validationResult.validationDetails.headers.details = `Missing headers: ${missingHeaders.join(', ')}`;
                } else {
                    validationResult.validationDetails.headers.valid = true;
                    validationResult.validationDetails.headers.details = 'All required headers present';
                }
            }
        } else {
            validationResult.errors.push('Headers object is required');
            validationResult.validationDetails.headers.details = 'Missing headers object';
        }

        // Step 3: Validate content format and encoding if content validation is enabled
        if (validationOptions.validateContent && responseData.content !== undefined) {
            if (typeof responseData.content !== 'string') {
                validationResult.errors.push('Content must be a string');
                validationResult.validationDetails.content.details = 'Invalid content type';
            } else {
                // Validate content length matches Content-Length header if present
                const contentLengthHeader = responseData.headers && 
                    (responseData.headers[HTTP_HEADERS.CONTENT_LENGTH] || 
                     responseData.headers['content-length']);
                
                if (contentLengthHeader) {
                    const actualContentLength = calculateContentLength(responseData.content);
                    const declaredContentLength = parseInt(contentLengthHeader, 10);
                    
                    if (actualContentLength !== declaredContentLength) {
                        validationResult.errors.push(`Content length mismatch: actual ${actualContentLength}, declared ${declaredContentLength}`);
                        validationResult.validationDetails.content.details = 'Content length mismatch';
                    } else {
                        validationResult.validationDetails.content.valid = true;
                        validationResult.validationDetails.content.details = 'Content and length valid';
                    }
                } else {
                    validationResult.validationDetails.content.valid = true;
                    validationResult.validationDetails.content.details = 'Content format valid, no length header';
                }
            }
        } else if (validationOptions.validateContent) {
            validationResult.errors.push('Content is required for content validation');
            validationResult.validationDetails.content.details = 'Missing content';
        } else {
            validationResult.validationDetails.content.valid = true;
            validationResult.validationDetails.content.details = 'Content validation skipped';
        }

        // Step 4: Validate overall response object structure
        const requiredFields = ['statusCode', 'headers'];
        if (validationOptions.validateContent) {
            requiredFields.push('content');
        }

        const missingFields = requiredFields.filter(field => 
            responseData[field] === undefined || responseData[field] === null
        );

        if (missingFields.length > 0) {
            validationResult.errors.push(`Missing required fields: ${missingFields.join(', ')}`);
            validationResult.validationDetails.structure.details = `Missing fields: ${missingFields.join(', ')}`;
        } else {
            validationResult.validationDetails.structure.valid = true;
            validationResult.validationDetails.structure.details = 'All required fields present';
        }

        // Step 5: Validate security headers if security validation is enabled
        if (validationOptions.validateSecurity && responseData.headers) {
            validationResult.securityAnalysis = {
                hasSecurityHeaders: false,
                securityHeaders: [],
                recommendations: []
            };

            // Check for X-Content-Type-Options header
            const xContentTypeOptions = responseData.headers[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS] ||
                responseData.headers['x-content-type-options'];
            
            if (xContentTypeOptions) {
                validationResult.securityAnalysis.hasSecurityHeaders = true;
                validationResult.securityAnalysis.securityHeaders.push('X-Content-Type-Options');
            } else {
                validationResult.securityAnalysis.recommendations.push('Add X-Content-Type-Options header for MIME sniffing protection');
            }

            // Update compliance report for security
            validationResult.complianceReport.securityCompliant = validationResult.securityAnalysis.hasSecurityHeaders;
        }

        // Step 6: Generate compliance report
        validationResult.complianceReport.httpCompliant = 
            validationResult.validationDetails.statusCode.valid &&
            validationResult.validationDetails.headers.valid;
        
        validationResult.complianceReport.contentCompliant = 
            !validationOptions.validateContent || validationResult.validationDetails.content.valid;

        // Step 7: Determine overall validation success
        validationResult.isValid = 
            validationResult.errors.length === 0 &&
            validationResult.complianceReport.httpCompliant &&
            validationResult.complianceReport.contentCompliant &&
            (!validationOptions.validateSecurity || validationResult.complianceReport.securityCompliant);

        // Log validation completion if logging is enabled
        if (validationOptions.enableLogging) {
            const logLevel = validationResult.isValid ? 'debug' : 'warn';
            logger[logLevel]('Response validation completed', {
                isValid: validationResult.isValid,
                errorCount: validationResult.errors.length,
                httpCompliant: validationResult.complianceReport.httpCompliant,
                securityCompliant: validationResult.complianceReport.securityCompliant,
                contentCompliant: validationResult.complianceReport.contentCompliant,
                errors: validationResult.errors.length > 0 ? validationResult.errors : undefined
            });
        }

        // Return comprehensive validation result
        return validationResult;

    } catch (error) {
        // Enhanced error handling for validation process errors
        const enhancedError = new Error(`Response validation process failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'validateResponse',
            hasResponseData: !!responseData,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        // Log validation process error
        if (options.enableLogging !== false) {
            logger.warn('Response validation process failed', {
                error: enhancedError.message,
                originalError: error.message,
                context: enhancedError.context
            });
        }

        throw enhancedError;
    }
}

/**
 * Calculates accurate content length in bytes for HTTP Content-Length header using 
 * Buffer.byteLength with proper UTF-8 encoding consideration.
 * 
 * This function provides accurate byte-length calculation for HTTP Content-Length headers
 * by using Node.js Buffer.byteLength method which properly handles multi-byte UTF-8 characters
 * and ensures HTTP protocol compliance.
 * 
 * Implementation Features:
 * - Uses Buffer.byteLength for accurate byte measurement
 * - Handles special characters and Unicode content properly
 * - Supports configurable encoding with UTF-8 default
 * - Validates input parameters for proper string content
 * - Provides fallback handling for non-string content types
 * - Returns numeric byte length for HTTP Content-Length header
 * 
 * @param {string} content - Content string to measure for byte length calculation
 * @param {string} [encoding=DEFAULT_RESPONSE_ENCODING] - Character encoding for measurement
 * 
 * @returns {number} Content length in bytes for accurate HTTP Content-Length header
 * 
 * @throws {Error} Invalid content parameter or encoding specification errors
 * 
 * @example
 * // Calculate length for simple ASCII content
 * const length1 = calculateContentLength('Hello world');
 * // Returns: 11
 * 
 * @example
 * // Calculate length for Unicode content with UTF-8 encoding
 * const length2 = calculateContentLength('Hello 世界', 'utf-8');
 * // Returns: 12 (accounts for multi-byte characters)
 * 
 * @example
 * // Calculate length with custom encoding
 * const length3 = calculateContentLength('Response content', 'utf-8');
 * // Returns: accurate byte count for Content-Length header
 */
function calculateContentLength(content, encoding = DEFAULT_RESPONSE_ENCODING) {
    try {
        // Validate content parameter is provided
        if (content === null || content === undefined) {
            throw new Error('Content parameter is required for length calculation');
        }

        // Convert content to string if not already string type
        const contentString = typeof content === 'string' ? content : String(content);

        // Validate encoding parameter is valid string
        if (!encoding || typeof encoding !== 'string') {
            throw new Error('Encoding must be a valid string');
        }

        // Use default encoding if not specified or invalid
        const normalizedEncoding = encoding.toLowerCase().trim() || DEFAULT_RESPONSE_ENCODING;

        // Validate encoding is supported by Buffer.byteLength
        try {
            // Test encoding validity by attempting to calculate length of empty string
            Buffer.byteLength('', normalizedEncoding);
        } catch (encodingError) {
            throw new Error(`Unsupported encoding: ${encoding}. Using default UTF-8.`);
        }

        // Calculate accurate byte length using Buffer.byteLength for proper UTF-8 handling
        const byteLength = Buffer.byteLength(contentString, normalizedEncoding);

        // Validate calculated length is valid number
        if (typeof byteLength !== 'number' || isNaN(byteLength) || byteLength < 0) {
            throw new Error('Invalid content length calculation result');
        }

        // Return numeric byte length for HTTP Content-Length header
        return byteLength;

    } catch (error) {
        // Enhanced error handling for content length calculation failures
        const enhancedError = new Error(`Content length calculation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'calculateContentLength',
            contentType: typeof content,
            contentLength: content ? content.length : 0,
            encoding: encoding,
            timestamp: new Date().toISOString()
        };

        throw enhancedError;
    }
}

/**
 * Generates unique response correlation IDs for request-response tracking and debugging 
 * purposes with timestamp and random components.
 * 
 * This function creates unique identifiers for response correlation and tracking, enabling
 * request-response correlation for debugging, monitoring, and distributed tracing scenarios.
 * The generated IDs combine timestamp and random components for uniqueness.
 * 
 * Implementation Features:
 * - Generates timestamp component for response ID uniqueness
 * - Creates random component for additional uniqueness guarantee
 * - Includes request ID correlation if provided for traceability
 * - Formats response ID with standard pattern for consistency
 * - Provides collision-resistant ID generation algorithm
 * - Returns unique response identifier for logging and debugging
 * 
 * @param {string} [requestId] - Optional request ID for correlation and traceability
 * @param {Object} [options={}] - ID generation options and configuration
 * @param {string} [options.prefix='res'] - Response ID prefix for identification
 * @param {boolean} [options.includeTimestamp=true] - Include timestamp in response ID
 * @param {boolean} [options.includeRandom=true] - Include random component for uniqueness
 * @param {number} [options.randomLength=8] - Length of random component
 * 
 * @returns {string} Unique response ID for correlation and tracking purposes
 * 
 * @throws {Error} ID generation or formatting errors
 * 
 * @example
 * // Generate basic response ID
 * const responseId1 = generateResponseId();
 * // Returns: 'res_1703123456789_a1b2c3d4'
 * 
 * @example
 * // Generate correlated response ID with request ID
 * const responseId2 = generateResponseId('req_1703123456789_x1y2z3');
 * // Returns: 'res_1703123456790_b2c3d4e5_req_1703123456789_x1y2z3'
 * 
 * @example
 * // Generate response ID with custom options
 * const responseId3 = generateResponseId(null, {
 *   prefix: 'hello',
 *   randomLength: 12
 * });
 * // Returns: 'hello_1703123456791_a1b2c3d4e5f6'
 */
function generateResponseId(requestId = null, options = {}) {
    try {
        // Initialize response ID generation options with defaults
        const idOptions = {
            prefix: 'res',
            includeTimestamp: true,
            includeRandom: true,
            randomLength: 8,
            ...options
        };

        // Validate options for ID generation
        if (!idOptions.prefix || typeof idOptions.prefix !== 'string') {
            throw new Error('ID prefix must be a non-empty string');
        }

        if (typeof idOptions.randomLength !== 'number' || idOptions.randomLength < 4 || idOptions.randomLength > 32) {
            throw new Error('Random length must be a number between 4 and 32');
        }

        // Initialize response ID components array
        const idComponents = [];

        // Add prefix to response ID
        idComponents.push(idOptions.prefix.toLowerCase().replace(/[^a-z0-9]/g, ''));

        // Add timestamp component if enabled for uniqueness
        if (idOptions.includeTimestamp) {
            const timestamp = Date.now().toString();
            idComponents.push(timestamp);
        }

        // Add random component if enabled for additional uniqueness
        if (idOptions.includeRandom) {
            const randomComponent = generateRandomString(idOptions.randomLength);
            idComponents.push(randomComponent);
        }

        // Create base response ID from components
        const baseResponseId = idComponents.join('_');

        // Add request ID correlation if provided for traceability
        let correlatedResponseId = baseResponseId;
        if (requestId && typeof requestId === 'string') {
            // Sanitize request ID to prevent injection issues
            const sanitizedRequestId = requestId.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 64);
            if (sanitizedRequestId.length > 0) {
                correlatedResponseId = `${baseResponseId}_${sanitizedRequestId}`;
            }
        }

        // Validate generated response ID format and length
        if (correlatedResponseId.length > 128) {
            // Truncate if too long while maintaining uniqueness
            correlatedResponseId = correlatedResponseId.substring(0, 125) + '...';
        }

        // Validate final response ID format
        const responseIdPattern = /^[a-zA-Z0-9_\-\.]+$/;
        if (!responseIdPattern.test(correlatedResponseId)) {
            throw new Error('Generated response ID contains invalid characters');
        }

        // Return unique response identifier for tracking and correlation
        return correlatedResponseId;

    } catch (error) {
        // Enhanced error handling for response ID generation failures
        const enhancedError = new Error(`Response ID generation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'generateResponseId',
            requestId: requestId,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        throw enhancedError;
    }
}

/**
 * Formats response content based on content type with proper encoding, serialization, 
 * and formatting for HTTP transmission.
 * 
 * This function handles content formatting for different content types including text/plain
 * and application/json with proper encoding and serialization. It ensures content is
 * properly formatted for HTTP transmission based on the specified content type.
 * 
 * Implementation Features:
 * - Determines content type from parameter or auto-detects from content
 * - Applies appropriate formatting based on content type specification
 * - Serializes objects to JSON string if content type is application/json
 * - Ensures proper UTF-8 encoding for all text content
 * - Validates formatted content meets HTTP transmission requirements
 * - Handles error cases with proper fallback formatting
 * - Returns properly formatted content string for response transmission
 * 
 * @param {string|Object} content - Content to format (string for text, object for JSON)
 * @param {string} [contentType] - Content type for formatting guidance
 * @param {Object} [options={}] - Content formatting options
 * @param {string} [options.encoding=DEFAULT_RESPONSE_ENCODING] - Character encoding
 * @param {number} [options.jsonSpacing=0] - JSON formatting spacing (0 for compact)
 * @param {boolean} [options.validateResult=true] - Validate formatted content
 * @param {boolean} [options.enableLogging=false] - Enable content formatting logging
 * 
 * @returns {string} Formatted response content ready for HTTP transmission
 * 
 * @throws {Error} Content formatting, serialization, or validation errors
 * 
 * @example
 * // Format string content for text/plain
 * const textContent = formatResponseContent('Hello world', 'text/plain');
 * // Returns: 'Hello world'
 * 
 * @example
 * // Format object content for application/json
 * const jsonContent = formatResponseContent(
 *   { message: 'Success', code: 200 },
 *   'application/json'
 * );
 * // Returns: '{"message":"Success","code":200}'
 * 
 * @example
 * // Auto-detect content type and format
 * const autoContent = formatResponseContent({ data: 'test' });
 * // Returns: '{"data":"test"}' (auto-detected as JSON)
 */
function formatResponseContent(content, contentType = null, options = {}) {
    try {
        // Initialize content formatting options with defaults
        const formatOptions = {
            encoding: DEFAULT_RESPONSE_ENCODING,
            jsonSpacing: 0, // Compact JSON by default
            validateResult: true,
            enableLogging: false,
            ...options
        };

        // Log content formatting initiation if logging is enabled
        if (formatOptions.enableLogging) {
            logger.debug('Formatting response content', {
                function: 'formatResponseContent',
                contentType: typeof content,
                specifiedContentType: contentType,
                options: formatOptions,
                timestamp: new Date().toISOString()
            });
        }

        // Validate content parameter is provided
        if (content === null || content === undefined) {
            throw new Error('Content parameter is required for formatting');
        }

        // Determine content type from parameter or auto-detect from content type
        let detectedContentType = contentType;
        if (!detectedContentType) {
            if (typeof content === 'string') {
                detectedContentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            } else if (typeof content === 'object') {
                detectedContentType = CONTENT_TYPES.APPLICATION_JSON_UTF8;
            } else {
                detectedContentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            }
        }

        // Normalize content type for consistent processing
        const normalizedContentType = detectedContentType.toLowerCase().split(';')[0].trim();

        let formattedContent;

        // Apply appropriate formatting based on content type
        switch (normalizedContentType) {
            case 'application/json':
                // Handle JSON content formatting with serialization
                if (typeof content === 'string') {
                    // Content is already JSON string, validate and potentially reformat
                    try {
                        const parsedContent = JSON.parse(content);
                        formattedContent = JSON.stringify(parsedContent, null, formatOptions.jsonSpacing);
                    } catch (parseError) {
                        throw new Error(`Invalid JSON string content: ${parseError.message}`);
                    }
                } else if (typeof content === 'object') {
                    // Serialize object to JSON string
                    try {
                        formattedContent = JSON.stringify(content, null, formatOptions.jsonSpacing);
                    } catch (stringifyError) {
                        throw new Error(`JSON serialization failed: ${stringifyError.message}`);
                    }
                } else {
                    // Convert other types to JSON representation
                    try {
                        formattedContent = JSON.stringify(content, null, formatOptions.jsonSpacing);
                    } catch (conversionError) {
                        throw new Error(`Content cannot be converted to JSON: ${conversionError.message}`);
                    }
                }
                break;

            case 'text/plain':
            default:
                // Handle text content formatting
                if (typeof content === 'string') {
                    formattedContent = content;
                } else if (typeof content === 'object') {
                    // Convert object to string representation (not JSON)
                    try {
                        formattedContent = String(content);
                    } catch (conversionError) {
                        throw new Error(`Object cannot be converted to text: ${conversionError.message}`);
                    }
                } else {
                    // Convert other types to string
                    formattedContent = String(content);
                }
                break;
        }

        // Validate formatted content is valid string
        if (typeof formattedContent !== 'string') {
            throw new Error('Content formatting did not produce a valid string result');
        }

        // Apply encoding validation if specified
        if (formatOptions.validateResult) {
            try {
                // Validate content can be properly encoded
                Buffer.from(formattedContent, formatOptions.encoding);
            } catch (encodingError) {
                throw new Error(`Content cannot be encoded with ${formatOptions.encoding}: ${encodingError.message}`);
            }

            // Validate content length is reasonable
            if (formattedContent.length > RESPONSE_VALIDATION_RULES.contentLimits.maxContentLength) {
                throw new Error(`Formatted content exceeds maximum length: ${formattedContent.length} > ${RESPONSE_VALIDATION_RULES.contentLimits.maxContentLength}`);
            }
        }

        // Log successful content formatting if logging is enabled
        if (formatOptions.enableLogging) {
            logger.debug('Content formatting completed successfully', {
                originalContentType: typeof content,
                detectedContentType: normalizedContentType,
                formattedLength: formattedContent.length,
                encoding: formatOptions.encoding,
                validated: formatOptions.validateResult
            });
        }

        // Return properly formatted content string for HTTP transmission
        return formattedContent;

    } catch (error) {
        // Enhanced error handling for content formatting failures
        const enhancedError = new Error(`Content formatting failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'formatResponseContent',
            contentType: typeof content,
            specifiedContentType: contentType,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        // Log content formatting error if logging is enabled
        if (options.enableLogging !== false) {
            logger.warn('Content formatting failed', {
                error: enhancedError.message,
                originalError: error.message,
                context: enhancedError.context
            });
        }

        throw enhancedError;
    }
}

/**
 * Creates response metadata object containing timing information, processing details, 
 * and debugging context for monitoring and educational purposes.
 * 
 * This function generates comprehensive metadata for response objects including timing
 * information, processing details, debugging context, and monitoring data. It provides
 * valuable information for performance analysis and educational demonstration.
 * 
 * Implementation Features:
 * - Creates metadata object with current timestamp and processing details
 * - Includes status code category using getStatusCategory for classification
 * - Adds content length and type information for monitoring
 * - Incorporates performance timing data if available
 * - Provides debugging context for educational purposes
 * - Supports custom metadata through options parameter
 * - Returns structured metadata object for logging and monitoring
 * 
 * @param {number} statusCode - HTTP status code for response categorization
 * @param {number} contentLength - Content length in bytes for metadata
 * @param {Object} [options={}] - Additional metadata options and context
 * @param {string} [options.responseType] - Type of response for classification
 * @param {string} [options.responseId] - Response correlation ID
 * @param {string} [options.generationMethod] - Method used to generate response
 * @param {Object} [options.customContext] - Custom context information
 * @param {boolean} [options.includePerformance=true] - Include performance data
 * @param {boolean} [options.includeDebugInfo=false] - Include debug information
 * 
 * @returns {Object} Response metadata with timing, processing, and debugging information
 * @returns {string} returns.id - Unique metadata identifier
 * @returns {string} returns.timestamp - ISO timestamp of metadata creation
 * @returns {number} returns.statusCode - HTTP status code
 * @returns {string} returns.statusCategory - Status code category
 * @returns {number} returns.contentLength - Response content length
 * @returns {Object} [returns.performance] - Performance timing data
 * @returns {Object} [returns.context] - Additional context information
 * @returns {Object} [returns.debug] - Debug information if enabled
 * 
 * @throws {Error} Metadata creation or processing errors
 * 
 * @example
 * // Basic response metadata creation
 * const metadata1 = createResponseMetadata(200, 11);
 * 
 * @example
 * // Detailed metadata with custom context
 * const metadata2 = createResponseMetadata(200, 11, {
 *   responseType: 'hello',
 *   responseId: 'res_123456',
 *   generationMethod: 'createHelloResponse',
 *   customContext: { endpoint: '/hello', method: 'GET' }
 * });
 * 
 * @example
 * // Error response metadata with debug info
 * const errorMetadata = createResponseMetadata(404, 9, {
 *   responseType: 'error',
 *   includeDebugInfo: true,
 *   customContext: { originalUrl: '/invalid' }
 * });
 */
function createResponseMetadata(statusCode, contentLength, options = {}) {
    try {
        // Initialize metadata options with defaults
        const metadataOptions = {
            responseType: 'unknown',
            responseId: null,
            generationMethod: 'unknown',
            customContext: {},
            includePerformance: true,
            includeDebugInfo: false,
            ...options
        };

        // Validate required parameters
        if (typeof statusCode !== 'number' || !isValidStatusCode(statusCode)) {
            throw new Error(`Invalid status code for metadata: ${statusCode}`);
        }

        if (typeof contentLength !== 'number' || contentLength < 0) {
            throw new Error(`Invalid content length for metadata: ${contentLength}`);
        }

        // Create base metadata object with essential information
        const metadataObject = {
            id: generateResponseId(null, { prefix: 'meta', randomLength: 6 }),
            timestamp: new Date().toISOString(),
            statusCode: statusCode,
            statusCategory: getStatusCategory(statusCode),
            contentLength: contentLength,
            responseType: metadataOptions.responseType,
            generationMethod: metadataOptions.generationMethod
        };

        // Add response correlation ID if provided
        if (metadataOptions.responseId) {
            metadataObject.responseId = metadataOptions.responseId;
        }

        // Include performance timing data if enabled
        if (metadataOptions.includePerformance) {
            metadataObject.performance = {
                generatedAt: Date.now(),
                processingTime: process.hrtime ? process.hrtime.bigint() : Date.now(),
                memoryUsage: {
                    heapUsed: process.memoryUsage().heapUsed,
                    heapTotal: process.memoryUsage().heapTotal,
                    external: process.memoryUsage().external
                },
                nodeVersion: process.version,
                platform: process.platform
            };
        }

        // Add custom context information if provided
        if (metadataOptions.customContext && typeof metadataOptions.customContext === 'object') {
            metadataObject.context = {
                ...metadataOptions.customContext,
                contextGeneratedAt: new Date().toISOString()
            };
        }

        // Include debug information if enabled (typically for development)
        if (metadataOptions.includeDebugInfo) {
            metadataObject.debug = {
                stackTrace: new Error().stack,
                functionCall: 'createResponseMetadata',
                parametersProvided: {
                    statusCode: statusCode,
                    contentLength: contentLength,
                    optionsKeys: Object.keys(options)
                },
                processingDetails: {
                    metadataGenerated: true,
                    validationPassed: true,
                    contextIncluded: !!metadataOptions.customContext
                }
            };
        }

        // Add metadata versioning and schema information
        metadataObject.schema = {
            version: '1.0.0',
            format: 'response-metadata',
            generator: 'response-utils.createResponseMetadata'
        };

        // Validate created metadata object structure
        if (!metadataObject.id || !metadataObject.timestamp || !metadataObject.statusCategory) {
            throw new Error('Metadata object creation failed: missing required fields');
        }

        // Return structured metadata object for logging and monitoring
        return metadataObject;

    } catch (error) {
        // Enhanced error handling for metadata creation failures
        const enhancedError = new Error(`Response metadata creation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'createResponseMetadata',
            statusCode: statusCode,
            contentLength: contentLength,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };

        throw enhancedError;
    }
}

// ============================================================================
// HELPER AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitizes error messages to prevent information disclosure vulnerabilities
 * while maintaining useful error context for debugging purposes.
 * 
 * @private
 * @param {string} errorMessage - Original error message to sanitize
 * @returns {string} Sanitized error message safe for client exposure
 */
function sanitizeErrorMessage(errorMessage) {
    if (!errorMessage || typeof errorMessage !== 'string') {
        return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    }

    // Remove potential sensitive information patterns
    const sensitivePatterns = [
        /\/[a-zA-Z0-9\/\-_\.]+\.(js|json|env|config|log)/gi, // File paths
        /password[=:]\s*[^\s]+/gi, // Password references
        /token[=:]\s*[^\s]+/gi, // Token references
        /key[=:]\s*[^\s]+/gi, // Key references
        /localhost:\d+/gi, // Local addresses
        /127\.0\.0\.1:\d+/gi, // IP addresses
        /Error:\s*[A-Z_]+\s*:/gi // Internal error codes
    ];

    let sanitizedMessage = errorMessage;
    sensitivePatterns.forEach(pattern => {
        sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
    });

    // Limit message length to prevent information leakage
    if (sanitizedMessage.length > 200) {
        sanitizedMessage = sanitizedMessage.substring(0, 197) + '...';
    }

    return sanitizedMessage;
}

/**
 * Generates a random string for response ID components with specified length.
 * 
 * @private
 * @param {number} length - Length of random string to generate
 * @returns {string} Random string for ID component
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export all response utility functions for use throughout the Node.js tutorial application.
 * 
 * This module provides comprehensive HTTP response utilities including:
 * - Hello world response creation for tutorial demonstration
 * - Success response generation with flexible content support
 * - Secure error response creation with information disclosure prevention
 * - HTTP header formatting with security header inclusion
 * - Response validation ensuring HTTP protocol compliance
 * - Content length calculation with accurate UTF-8 byte measurement
 * - Response correlation ID generation for tracking and debugging
 * - Content formatting with proper encoding and serialization
 * - Response metadata creation for monitoring and educational purposes
 * 
 * All functions implement comprehensive error handling, security considerations,
 * and educational clarity while maintaining production-ready patterns.
 */
export {
    // Core response creation functions
    createHelloResponse,
    createSuccessResponse,  
    createErrorResponse,
    
    // Header formatting and validation utilities
    formatHeaders,
    validateResponse,
    
    // Content processing and calculation utilities
    calculateContentLength,
    formatResponseContent,
    
    // Response tracking and metadata utilities
    generateResponseId,
    createResponseMetadata
};