/**
 * Error Messages Constants for Node.js Tutorial Application
 * 
 * This module provides centralized error message definitions for consistent error
 * communication across the Node.js tutorial application. It implements educational
 * error handling patterns while maintaining security by avoiding information disclosure.
 * 
 * The error messages are organized into categories for different types of errors:
 * - General application errors (ERROR_MESSAGES)
 * - HTTP status code specific errors (HTTP_ERROR_MESSAGES)  
 * - Input validation errors (VALIDATION_ERROR_MESSAGES)
 * - Endpoint-specific errors (ENDPOINT_ERROR_MESSAGES)
 * - Server-specific errors (SERVER_ERROR_MESSAGES)
 * 
 * All error messages follow security best practices by providing generic,
 * user-friendly messages without exposing internal system details.
 * 
 * Educational Value:
 * - Demonstrates proper error message standardization and management patterns
 * - Shows correct HTTP error message formatting and status code alignment
 * - Illustrates secure error handling without information disclosure
 * - Provides example of centralized constants management for maintainable code
 * - Enables consistent error message validation in test scenarios
 */

/**
 * General error messages for common HTTP error conditions and application states.
 * These messages provide standardized text for various error scenarios throughout
 * the application, ensuring consistent communication with clients.
 * 
 * Usage: Used by error handling libraries and controllers for consistent error
 * message generation across the application.
 */
const ERROR_MESSAGES = {
    // HTTP 4xx Client Error Messages
    BAD_REQUEST: 'Bad Request',
    NOT_FOUND: 'Not Found', 
    METHOD_NOT_ALLOWED: 'Method Not Allowed',
    
    // HTTP 5xx Server Error Messages  
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    SERVER_ERROR: 'Server Error',
    
    // Application-Specific Error Messages
    INVALID_REQUEST_FORMAT: 'Invalid request format',
    ROUTE_NOT_FOUND: 'The requested route was not found',
    UNSUPPORTED_METHOD: 'HTTP method not supported for this endpoint'
};

/**
 * HTTP status code specific error messages for protocol-compliant error responses.
 * These messages align with HTTP/1.1 standards and provide detailed descriptions
 * for each status code while maintaining security by avoiding sensitive information.
 * 
 * Usage: Integrates with HTTP status utilities for complete error response objects
 * and ensures proper HTTP protocol compliance in error responses.
 */
const HTTP_ERROR_MESSAGES = {
    // HTTP 400 Bad Request
    STATUS_400_MESSAGE: '400 Bad Request - The request was malformed or invalid',
    
    // HTTP 404 Not Found  
    STATUS_404_MESSAGE: '404 Not Found - The requested resource could not be found',
    
    // HTTP 405 Method Not Allowed
    STATUS_405_MESSAGE: '405 Method Not Allowed - HTTP method not supported for this resource',
    
    // HTTP 500 Internal Server Error
    STATUS_500_MESSAGE: '500 Internal Server Error - An unexpected error occurred'
};

/**
 * Validation-specific error messages for input validation failure scenarios.
 * These messages are used when request validation fails, providing clear
 * feedback about input problems without exposing system internals.
 * 
 * Usage: Validation utilities use these messages for input validation failure
 * reporting and form validation error communication.
 */
const VALIDATION_ERROR_MESSAGES = {
    // General validation errors
    INVALID_INPUT: 'Invalid input provided',
    MISSING_PARAMETERS: 'Required parameters are missing',
    INVALID_FORMAT: 'Request format is invalid'
};

/**
 * Endpoint-specific error messages for the tutorial application routes.
 * These messages are tailored for the specific endpoints in the tutorial
 * application, particularly the /hello endpoint and route handling.
 * 
 * Usage: Route handling components and controllers use these messages for
 * endpoint-specific error responses and hello route error handling.
 */
const ENDPOINT_ERROR_MESSAGES = {
    // Hello endpoint specific errors
    HELLO_ENDPOINT_ERROR: 'Error processing hello endpoint request',
    ENDPOINT_NOT_AVAILABLE: 'The requested endpoint is not available',
    HELLO_METHOD_ERROR: 'Only GET method is allowed for /hello endpoint'
};

/**
 * Server-specific error messages for internal server error conditions.
 * These messages cover server startup, connection, and processing errors
 * while providing generic information suitable for client consumption.
 * 
 * Usage: Server initialization, connection handling, and internal error
 * processing components use these messages for server-related error reporting.
 */
const SERVER_ERROR_MESSAGES = {
    // Server lifecycle errors
    STARTUP_ERROR: 'Server failed to start properly',
    CONNECTION_ERROR: 'Connection error occurred',
    
    // Request processing errors  
    PROCESSING_ERROR: 'Error occurred while processing request',
    UNEXPECTED_ERROR: 'An unexpected error occurred'
};

/**
 * Export all error message constants for use throughout the application.
 * These exports provide named exports for specific error message categories
 * and support tree-shaking for optimal bundle size in production builds.
 * 
 * Integration Points:
 * - Error handler middleware components
 * - HTTP response generation utilities
 * - Route handler error management
 * - Test frameworks for error response validation
 * - Monitoring and logging systems
 */

// Export individual error message objects
export { ERROR_MESSAGES };
export { HTTP_ERROR_MESSAGES };
export { VALIDATION_ERROR_MESSAGES };
export { ENDPOINT_ERROR_MESSAGES };
export { SERVER_ERROR_MESSAGES };

// Export individual error message constants for direct access
export const {
    BAD_REQUEST,
    NOT_FOUND,
    METHOD_NOT_ALLOWED,
    INTERNAL_SERVER_ERROR,
    INVALID_REQUEST_FORMAT,
    SERVER_ERROR,
    ROUTE_NOT_FOUND,
    UNSUPPORTED_METHOD
} = ERROR_MESSAGES;

export const {
    STATUS_400_MESSAGE,
    STATUS_404_MESSAGE,
    STATUS_405_MESSAGE,
    STATUS_500_MESSAGE
} = HTTP_ERROR_MESSAGES;

export const {
    INVALID_INPUT,
    MISSING_PARAMETERS,
    INVALID_FORMAT
} = VALIDATION_ERROR_MESSAGES;

export const {
    HELLO_ENDPOINT_ERROR,
    ENDPOINT_NOT_AVAILABLE,
    HELLO_METHOD_ERROR
} = ENDPOINT_ERROR_MESSAGES;

export const {
    STARTUP_ERROR,
    CONNECTION_ERROR,
    PROCESSING_ERROR,
    UNEXPECTED_ERROR
} = SERVER_ERROR_MESSAGES;

// Default export for convenient access to all error messages
export default {
    ERROR_MESSAGES,
    HTTP_ERROR_MESSAGES,
    VALIDATION_ERROR_MESSAGES,
    ENDPOINT_ERROR_MESSAGES,
    SERVER_ERROR_MESSAGES
};