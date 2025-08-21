/**
 * Express-Style Error Handling Middleware for Node.js Tutorial Application
 * 
 * Provides comprehensive error processing, logging, and response generation middleware
 * for the Node.js tutorial application that implements centralized error handling patterns
 * with secure error responses, HTTP protocol compliance, and educational clarity.
 * 
 * This module serves as the primary error handling component that catches and processes
 * errors from all application layers including parsing errors, route errors, method errors,
 * and server errors while ensuring no sensitive information disclosure.
 * 
 * Key Features:
 * - Express-style error middleware with four-parameter function signature
 * - Centralized error processing with comprehensive error classification system
 * - Secure error responses preventing information disclosure vulnerabilities
 * - HTTP protocol compliant error responses with proper status codes and headers
 * - Comprehensive error logging with correlation IDs for debugging and monitoring
 * - Error statistics tracking for performance monitoring and analysis
 * - Educational patterns demonstrating industry-standard error handling practices
 * - Production-ready error management with security and monitoring considerations
 * 
 * Educational Objectives:
 * - Demonstrates proper Express middleware implementation patterns with four-parameter signature
 * - Shows centralized error processing for maintainable applications and separation of concerns
 * - Illustrates secure error handling without information disclosure vulnerabilities
 * - Provides examples of error classification and HTTP status code management
 * - Shows integration patterns between error handling and logging, monitoring systems
 * - Demonstrates production-ready error management patterns for Node.js applications
 * 
 * Security Features:
 * - Generic error messages for client-facing responses preventing information disclosure
 * - Sensitive information sanitization in error messages and stack traces
 * - Comprehensive internal error logging for debugging without client exposure
 * - Error correlation IDs for secure error tracking and debugging support
 * 
 * Integration Architecture:
 * - Integrates with ErrorHandler for comprehensive error processing and classification
 * - Uses Logger for structured error logging with HTTP request correlation
 * - Incorporates response utilities for consistent error response generation
 * - Utilizes HTTP status utilities for proper status code management and validation
 * - Supports configuration-driven behavior through global configuration constants
 * 
 * @fileoverview Express-style error handling middleware with comprehensive error management
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - INTERNAL DEPENDENCIES
// ============================================================================

// Import core error handling library for comprehensive error processing and classification
import {
    ErrorHandler,
    classifyError,
    sanitizeErrorMessage,
    formatErrorForLogging,
    generateErrorId,
    ERROR_TYPES,
    ERROR_SEVERITY_LEVELS
} from '../lib/error-handler.js';

// Import logging utilities for structured error logging and HTTP request correlation
import {
    Logger,
    logger
} from '../utils/logger.js';

// Import response utilities for consistent error response generation and validation
import {
    createErrorResponse,
    formatHeaders,
    validateResponse
} from '../utils/response-utils.js';

// Import HTTP status code utilities for proper error classification and status management
import {
    HTTP_STATUS_CODES,
    isClientError,
    isServerError,
    getStatusCategory
} from '../utils/http-status.js';

// Import standardized error message constants for consistent error communication
import {
    ERROR_MESSAGES,
    HTTP_ERROR_MESSAGES,
    BAD_REQUEST,
    NOT_FOUND,
    METHOD_NOT_ALLOWED,
    INTERNAL_SERVER_ERROR,
    ROUTE_NOT_FOUND,
    UNSUPPORTED_METHOD,
    STATUS_400_MESSAGE,
    STATUS_404_MESSAGE,
    STATUS_405_MESSAGE,
    STATUS_500_MESSAGE
} from '../constants/error-messages.js';

// ============================================================================
// MODULE IMPORTS - EXTERNAL DEPENDENCIES
// ============================================================================

// Node.js built-in util module for error object inspection and debugging information
import util from 'util'; // Node.js v20.x - Built-in utility module for object inspection and error formatting

// ============================================================================
// GLOBAL CONSTANTS AND ERROR HANDLING CONFIGURATION
// ============================================================================

/**
 * Error middleware configuration object with security defaults and educational settings.
 * Provides comprehensive configuration for error handling behavior, security features,
 * and educational clarity throughout the error processing pipeline.
 */
const ERROR_MIDDLEWARE_CONFIG = {
    enableStackTrace: false,        // Security: disabled to prevent information disclosure
    logAllErrors: true,            // Enable comprehensive error logging for debugging
    includeRequestContext: true,   // Include HTTP request context in error processing
    sanitizeErrorMessages: true,   // Enable error message sanitization for security
    enableErrorCorrelation: true,  // Enable error correlation IDs for tracking
    maxErrorMessageLength: 500     // Maximum error message length to prevent log pollution
};

/**
 * Middleware error type constants for comprehensive error classification and handling
 * strategy determination. Provides standardized error type identification for proper
 * error processing, logging, and response generation throughout the application.
 */
const MIDDLEWARE_ERROR_TYPES = {
    PARSING_ERROR: 'parsing_error',      // HTTP request parsing errors and malformed request data
    ROUTING_ERROR: 'routing_error',      // Route not found errors and URL path resolution failures
    METHOD_ERROR: 'method_error',        // HTTP method not allowed errors and unsupported methods
    SERVER_ERROR: 'server_error',        // Internal server errors and application processing failures
    VALIDATION_ERROR: 'validation_error', // Input validation errors and parameter validation failures
    MIDDLEWARE_ERROR: 'middleware_error'  // Middleware processing errors and component failures
};

/**
 * Error handling priority levels for determining processing order and response urgency.
 * Lower numeric values indicate higher priority levels requiring immediate attention
 * and specialized handling strategies for optimal application stability.
 */
const ERROR_HANDLING_PRIORITY = {
    CLIENT_ERRORS: 1,    // Client errors (4xx) - highest priority for user experience
    SERVER_ERRORS: 2,    // Server errors (5xx) - high priority for system stability
    CRITICAL_ERRORS: 3,  // Critical system errors - immediate attention required
    SECURITY_ERRORS: 4   // Security-related errors - maximum priority for protection
};

// ============================================================================
// ERROR CONTEXT EXTRACTION AND PROCESSING FUNCTIONS
// ============================================================================

/**
 * Extracts comprehensive error context from request, response, and error objects for
 * detailed logging and debugging purposes. Implements comprehensive context extraction
 * to provide maximum debugging information while maintaining security considerations.
 * 
 * This function gathers extensive request information, timing data, and system context
 * to support effective error diagnosis and resolution while avoiding sensitive information
 * exposure in client-facing responses.
 * 
 * @param {Error} error - Error object with stack trace and error details
 * @param {object} request - HTTP request object from Node.js HTTP server
 * @param {object} response - HTTP response object from Node.js HTTP server
 * @returns {object} Comprehensive error context with request details, timing, and correlation data
 * @returns {object} returns.requestInfo - HTTP request details and headers
 * @returns {object} returns.responseInfo - Response state and processing information
 * @returns {object} returns.systemInfo - System context and environment information
 * @returns {object} returns.timingInfo - Request timing and performance metrics
 * @returns {string} returns.correlationId - Unique correlation ID for error tracking
 * 
 * @example
 * const context = extractErrorContext(error, request, response);
 * // Returns comprehensive error context for logging and debugging
 */
function extractErrorContext(error, request, response) {
    try {
        // Initialize comprehensive error context object with essential components
        const errorContext = {
            // Request information and HTTP context details
            requestInfo: {
                method: request.method || 'UNKNOWN',
                url: request.url || 'UNKNOWN',
                httpVersion: request.httpVersion || '1.1',
                remoteAddress: request.connection?.remoteAddress || 'unknown',
                remotePort: request.connection?.remotePort || null,
                userAgent: request.headers?.['user-agent'] || 'unknown',
                referer: request.headers?.['referer'] || null,
                acceptLanguage: request.headers?.['accept-language'] || null,
                contentType: request.headers?.['content-type'] || null,
                contentLength: request.headers?.['content-length'] || null,
                host: request.headers?.['host'] || null,
                connection: request.headers?.['connection'] || null
            },
            
            // Response state and processing information
            responseInfo: {
                statusCode: response.statusCode || null,
                headersSent: response.headersSent || false,
                finished: response.finished || false,
                writable: response.writable || false,
                destroyed: response.destroyed || false
            },
            
            // System context and environment information for debugging
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
                uptime: Math.round(process.uptime()),
                pid: process.pid,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage ? process.cpuUsage() : null,
                loadAverage: process.loadavg ? process.loadavg() : null
            },
            
            // Request timing and performance metrics for analysis
            timingInfo: {
                requestStartTime: Date.now(),
                timestamp: new Date().toISOString(),
                processingDuration: null // Will be calculated during response
            },
            
            // Error correlation and tracking information
            correlationId: generateErrorId('context', request.headers?.['x-request-id']),
            
            // Error classification and severity assessment
            errorInfo: {
                name: error?.name || 'UnknownError',
                message: error?.message || 'No error message available',
                type: error?.constructor?.name || 'Error',
                hasStackTrace: !!(error?.stack)
            }
        };

        // Sanitize request headers to remove sensitive information for secure logging
        if (request.headers && typeof request.headers === 'object') {
            const sanitizedHeaders = {};
            const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token', 'password'];
            
            Object.keys(request.headers).forEach(headerName => {
                const lowerHeaderName = headerName.toLowerCase();
                if (sensitiveHeaders.includes(lowerHeaderName)) {
                    sanitizedHeaders[headerName] = '[REDACTED]';
                } else {
                    sanitizedHeaders[headerName] = request.headers[headerName];
                }
            });
            
            errorContext.requestInfo.headers = sanitizedHeaders;
        }

        // Include request timing calculation if request start time is available
        if (request.startTime && typeof request.startTime === 'number') {
            errorContext.timingInfo.processingDuration = Date.now() - request.startTime;
        }

        // Add environment-specific debugging information for development
        if (process.env.NODE_ENV === 'development') {
            errorContext.developmentInfo = {
                environmentVariables: {
                    NODE_ENV: process.env.NODE_ENV,
                    PORT: process.env.PORT,
                    DEBUG: process.env.DEBUG
                },
                requestBody: request.body ? '[BODY_PRESENT]' : '[NO_BODY]',
                requestParams: request.params ? Object.keys(request.params) : []
            };
        }

        // Return comprehensive error context object for error processing
        return errorContext;

    } catch (contextError) {
        // Fallback context extraction if primary extraction fails
        logger.warn('Error context extraction failed', {
            contextError: contextError.message,
            originalError: error?.message
        });

        // Return minimal context object with essential information
        return {
            requestInfo: {
                method: request?.method || 'UNKNOWN',
                url: request?.url || 'UNKNOWN',
                userAgent: request?.headers?.['user-agent'] || 'unknown'
            },
            responseInfo: {
                headersSent: response?.headersSent || false
            },
            systemInfo: {
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            },
            correlationId: generateErrorId('fallback'),
            contextExtractionFailed: true
        };
    }
}

/**
 * Analyzes error objects and request context to determine the specific type of error
 * for appropriate handling strategy selection. Implements intelligent error classification
 * based on error characteristics, request context, and application-specific patterns.
 * 
 * This function examines error properties, request details, and contextual information
 * to route errors to appropriate specialized handlers and ensure optimal error processing
 * strategies for different error scenarios.
 * 
 * @param {Error} error - Error object to analyze for type classification
 * @param {object} request - HTTP request object for contextual error analysis
 * @returns {string} Error type classification for routing to appropriate error handler
 * @returns {string} One of MIDDLEWARE_ERROR_TYPES constants for error routing
 * 
 * @example
 * const errorType = determineErrorType(new Error('Route not found'), request);
 * // Returns: 'routing_error' for routing to appropriate handler
 */
function determineErrorType(error, request) {
    try {
        // Extract error characteristics for classification analysis
        const errorMessage = (error?.message || '').toLowerCase();
        const errorName = (error?.name || '').toLowerCase();
        const errorType = error?.constructor?.name || '';
        
        // Extract request context for classification hints
        const requestMethod = request?.method || '';
        const requestUrl = request?.url || '';
        const userAgent = request?.headers?.['user-agent'] || '';

        // Analyze error message patterns for specific error types
        
        // HTTP request parsing errors and malformed request detection
        if (errorMessage.includes('parse') || 
            errorMessage.includes('malformed') || 
            errorMessage.includes('invalid request') ||
            errorMessage.includes('bad request') ||
            errorName.includes('syntax') ||
            errorType === 'SyntaxError') {
            return MIDDLEWARE_ERROR_TYPES.PARSING_ERROR;
        }

        // Route not found errors and URL path resolution failures
        if (errorMessage.includes('not found') || 
            errorMessage.includes('route') ||
            errorMessage.includes('path') ||
            errorMessage.includes('404') ||
            (requestUrl && !requestUrl.startsWith('/hello'))) {
            return MIDDLEWARE_ERROR_TYPES.ROUTING_ERROR;
        }

        // HTTP method not allowed errors and unsupported method requests
        if (errorMessage.includes('method') || 
            errorMessage.includes('not allowed') ||
            errorMessage.includes('405') ||
            errorMessage.includes('unsupported method') ||
            (requestMethod && requestMethod !== 'GET' && requestUrl === '/hello')) {
            return MIDDLEWARE_ERROR_TYPES.METHOD_ERROR;
        }

        // Input validation errors and parameter validation failures
        if (errorMessage.includes('validation') || 
            errorMessage.includes('invalid input') ||
            errorMessage.includes('missing parameter') ||
            errorMessage.includes('invalid format') ||
            errorName.includes('validation')) {
            return MIDDLEWARE_ERROR_TYPES.VALIDATION_ERROR;
        }

        // Middleware processing errors and component failures
        if (errorMessage.includes('middleware') || 
            errorMessage.includes('component') ||
            errorMessage.includes('processing failed') ||
            errorName.includes('middleware')) {
            return MIDDLEWARE_ERROR_TYPES.MIDDLEWARE_ERROR;
        }

        // Server-side errors based on error type and system indicators
        if (errorName.includes('type') || 
            errorName.includes('reference') ||
            errorName.includes('range') ||
            errorType === 'TypeError' ||
            errorType === 'ReferenceError' ||
            errorType === 'RangeError') {
            return MIDDLEWARE_ERROR_TYPES.SERVER_ERROR;
        }

        // Database and connection-related errors
        if (errorMessage.includes('database') || 
            errorMessage.includes('connection') ||
            errorMessage.includes('timeout') ||
            errorMessage.includes('network')) {
            return MIDDLEWARE_ERROR_TYPES.SERVER_ERROR;
        }

        // System resource and memory errors
        if (errorMessage.includes('memory') || 
            errorMessage.includes('resource') ||
            errorMessage.includes('limit') ||
            errorName.includes('memory')) {
            return MIDDLEWARE_ERROR_TYPES.SERVER_ERROR;
        }

        // Default classification for unrecognized error patterns
        return MIDDLEWARE_ERROR_TYPES.SERVER_ERROR;

    } catch (classificationError) {
        // Fallback error type determination if classification fails
        logger.warn('Error type determination failed', {
            classificationError: classificationError.message,
            originalError: error?.message
        });

        // Return default server error type for safe error handling
        return MIDDLEWARE_ERROR_TYPES.SERVER_ERROR;
    }
}

/**
 * Generates unique correlation IDs for error tracking and debugging purposes with
 * timestamp and random components for error traceability. Creates collision-resistant
 * identifiers for error tracking across logs, monitoring systems, and debugging sessions.
 * 
 * This function provides unique identifiers that enable error correlation across
 * different system components, log files, and monitoring systems while maintaining
 * readability and debuggability for development and production troubleshooting.
 * 
 * @param {string} requestId - Request ID for correlation and tracing across request lifecycle
 * @param {string} errorType - Type of error for ID categorization and filtering
 * @returns {string} Unique error correlation ID for tracking and debugging purposes
 * @returns {string} Formatted as 'err_{errorType}_{timestamp}_{random}_{requestId}'
 * 
 * @example
 * const correlationId = generateErrorCorrelationId('req_123456', 'server_error');
 * // Returns: 'err_server_1703123456789_a1b2c3d4_req_123456'
 */
function generateErrorCorrelationId(requestId, errorType) {
    try {
        // Initialize correlation ID components with error prefix
        const correlationComponents = ['err'];

        // Add error type component for categorization and log filtering
        if (errorType && typeof errorType === 'string') {
            const sanitizedType = errorType.toLowerCase()
                .replace(/[^a-z0-9_]/g, '')
                .substring(0, 20);
            
            if (sanitizedType.length > 0) {
                correlationComponents.push(sanitizedType);
            } else {
                correlationComponents.push('unknown');
            }
        } else {
            correlationComponents.push('unknown');
        }

        // Generate timestamp component for uniqueness and temporal ordering
        const timestamp = Date.now().toString();
        correlationComponents.push(timestamp);

        // Create random component for additional entropy and collision avoidance
        const randomComponent = generateRandomString(8);
        correlationComponents.push(randomComponent);

        // Create base correlation ID from components
        const baseCorrelationId = correlationComponents.join('_');

        // Add request ID correlation if provided for request-response traceability
        let correlatedId = baseCorrelationId;
        if (requestId && typeof requestId === 'string') {
            const sanitizedRequestId = requestId.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 32);
            if (sanitizedRequestId.length > 0) {
                correlatedId = `${baseCorrelationId}_${sanitizedRequestId}`;
            }
        }

        // Validate generated correlation ID format and length constraints
        if (correlatedId.length > 128) {
            // Truncate if too long while maintaining essential components
            const essentialParts = [correlationComponents[0], correlationComponents[1], 
                                  timestamp.substring(-8), randomComponent];
            correlatedId = essentialParts.join('_');
        }

        // Ensure correlation ID meets format requirements for log parsing
        const correlationIdPattern = /^[a-zA-Z0-9_\-]+$/;
        if (!correlationIdPattern.test(correlatedId)) {
            // Fallback to basic correlation ID if format validation fails
            correlatedId = `err_${timestamp}_${randomComponent}`;
        }

        // Return unique error correlation identifier for tracking
        return correlatedId;

    } catch (generationError) {
        // Fallback correlation ID generation if primary generation fails
        logger.warn('Error correlation ID generation failed', {
            generationError: generationError.message,
            requestId: requestId,
            errorType: errorType
        });

        // Return simple fallback correlation ID with timestamp for basic tracking
        return `err_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
}

/**
 * Sanitizes error information for client consumption by removing sensitive system
 * details while maintaining helpful error context. Implements comprehensive error
 * sanitization to protect against information disclosure attacks while preserving
 * useful debugging context for internal purposes.
 * 
 * This function removes sensitive information including file paths, stack traces,
 * system internals, and database details while maintaining error classification
 * and general error context suitable for client consumption.
 * 
 * @param {Error} error - Error object to sanitize for secure client response
 * @param {object} sanitizationOptions - Sanitization configuration and options
 * @param {boolean} [sanitizationOptions.removeStackTrace=true] - Remove stack trace information
 * @param {boolean} [sanitizationOptions.removePaths=true] - Remove file paths and system info
 * @param {boolean} [sanitizationOptions.genericFallback=true] - Use generic messages if sanitization removes all content
 * @param {number} [sanitizationOptions.maxLength=200] - Maximum length for sanitized messages
 * @returns {object} Sanitized error object safe for client response without sensitive information
 * @returns {string} returns.message - Sanitized error message safe for client exposure
 * @returns {string} returns.type - Generic error type classification
 * @returns {string} returns.correlationId - Error correlation ID for support purposes
 * 
 * @example
 * const sanitized = sanitizeErrorForClient(new Error('Database connection failed at /home/user/app.js:42'));
 * // Returns: { message: 'An error occurred', type: 'ServerError', correlationId: 'err_...' }
 */
function sanitizeErrorForClient(error, sanitizationOptions = {}) {
    try {
        // Initialize sanitization options with security-focused defaults
        const options = {
            removeStackTrace: true,
            removePaths: true,
            genericFallback: true,
            maxLength: 200,
            ...sanitizationOptions
        };

        // Extract error information for sanitization processing
        let errorMessage = error?.message || 'An error occurred';
        const errorName = error?.name || 'Error';
        const errorType = error?.constructor?.name || 'Error';

        // Remove file paths and system information for security
        if (options.removePaths) {
            // Remove absolute and relative file paths
            errorMessage = errorMessage.replace(/\/[^\s]*\.(js|json|ts|jsx|tsx|env|config|log)/gi, '[FILE]');
            errorMessage = errorMessage.replace(/\.[\/\\][^\s]*\.(js|json|ts|jsx|tsx|env|config|log)/gi, '[FILE]');
            
            // Remove Windows-style paths
            errorMessage = errorMessage.replace(/[A-Z]:[\\\/][^\s]*/gi, '[PATH]');
            
            // Remove line numbers and error locations
            errorMessage = errorMessage.replace(/at line \d+/gi, '');
            errorMessage = errorMessage.replace(/:\d+:\d+/g, '');
        }

        // Remove stack trace information if requested for security
        if (options.removeStackTrace) {
            errorMessage = errorMessage.replace(/\s+at\s+[^\n]+/g, '');
            errorMessage = errorMessage.replace(/Error:\s*[A-Z_][A-Z_0-9]*:/gi, 'Error:');
        }

        // Remove sensitive information patterns for information disclosure prevention
        const sensitivePatterns = [
            // Database connection strings and credentials
            /mongodb:\/\/[^\s]+/gi,
            /postgres:\/\/[^\s]+/gi,
            /mysql:\/\/[^\s]+/gi,
            
            // API keys and authentication tokens
            /api[_-]?key[=:\s]*[^\s]+/gi,
            /token[=:\s]*[^\s]+/gi,
            /bearer\s+[^\s]+/gi,
            
            // Passwords and secrets
            /password[=:\s]*[^\s]+/gi,
            /secret[=:\s]*[^\s]+/gi,
            /key[=:\s]*[^\s]+/gi,
            
            // Network addresses and system information
            /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g,
            /localhost:\d+/gi,
            
            // System paths and configuration files
            /node_modules[\/\\][^\s]*/gi,
            /package\.json/gi,
            /.env/gi
        ];

        // Apply sensitive pattern filtering to error message
        sensitivePatterns.forEach(pattern => {
            errorMessage = errorMessage.replace(pattern, '[REDACTED]');
        });

        // Replace technical error details with user-friendly messages
        const technicalPatterns = [
            { pattern: /ECONNREFUSED/gi, replacement: 'Connection error' },
            { pattern: /ENOTFOUND/gi, replacement: 'Resource not found' },
            { pattern: /ETIMEDOUT/gi, replacement: 'Request timeout' },
            { pattern: /EADDRINUSE/gi, replacement: 'Address already in use' },
            { pattern: /TypeError: Cannot read propert(y|ies) of/gi, replacement: 'Invalid data access' },
            { pattern: /ReferenceError:/gi, replacement: 'Reference error:' },
            { pattern: /SyntaxError:/gi, replacement: 'Syntax error:' }
        ];

        // Apply technical pattern replacements for user-friendly messaging
        technicalPatterns.forEach(({ pattern, replacement }) => {
            errorMessage = errorMessage.replace(pattern, replacement);
        });

        // Clean up extra whitespace and normalize formatting
        errorMessage = errorMessage.replace(/\s+/g, ' ').trim();
        errorMessage = errorMessage.replace(/\[REDACTED\]\s*\[REDACTED\]/g, '[REDACTED]');

        // Apply message length limits to prevent information leakage
        if (errorMessage.length > options.maxLength) {
            errorMessage = errorMessage.substring(0, options.maxLength - 3) + '...';
        }

        // Use generic fallback messages if sanitization removed useful content
        if (options.genericFallback && 
            (errorMessage.length < 10 || 
             errorMessage === '[REDACTED]' || 
             errorMessage.match(/^\[.*\]$/))) {
            
            // Determine appropriate generic message based on error characteristics
            if (error?.message?.toLowerCase().includes('not found')) {
                errorMessage = NOT_FOUND;
            } else if (error?.message?.toLowerCase().includes('method')) {
                errorMessage = METHOD_NOT_ALLOWED;
            } else if (error?.message?.toLowerCase().includes('bad') || 
                       error?.message?.toLowerCase().includes('invalid')) {
                errorMessage = BAD_REQUEST;
            } else {
                errorMessage = INTERNAL_SERVER_ERROR;
            }
        }

        // Generate correlation ID for support and debugging purposes
        const correlationId = generateErrorCorrelationId(null, 'sanitized');

        // Create sanitized error object safe for client consumption
        const sanitizedError = {
            message: errorMessage || 'An error occurred',
            type: errorType === 'TypeError' || errorType === 'ReferenceError' || 
                  errorType === 'SyntaxError' ? 'ServerError' : 'Error',
            correlationId: correlationId,
            timestamp: new Date().toISOString(),
            sanitized: true
        };

        // Return sanitized error object ready for client response
        return sanitizedError;

    } catch (sanitizationError) {
        // Fallback sanitization if primary sanitization fails
        logger.warn('Error sanitization failed', {
            sanitizationError: sanitizationError.message,
            originalError: error?.message
        });

        // Return minimal safe error object for client consumption
        return {
            message: INTERNAL_SERVER_ERROR,
            type: 'Error',
            correlationId: generateErrorCorrelationId(null, 'fallback'),
            timestamp: new Date().toISOString(),
            sanitized: true,
            sanitizationFailed: true
        };
    }
}

// ============================================================================
// MAIN ERROR MIDDLEWARE CLASS IMPLEMENTATION
// ============================================================================

/**
 * Main error handling middleware class that provides centralized error processing
 * for the Node.js tutorial application. Implements Express-style error middleware
 * patterns with comprehensive error classification, secure response generation,
 * structured logging, and HTTP protocol compliance for educational and production-ready
 * error management.
 * 
 * This class serves as the central error processing authority, providing:
 * - Express-style middleware integration with four-parameter function signature
 * - Comprehensive error classification and response generation capabilities
 * - Secure error handling preventing information disclosure vulnerabilities
 * - HTTP protocol compliant error responses with proper status codes and headers
 * - Structured error logging with correlation IDs for debugging and monitoring
 * - Error statistics tracking for performance monitoring and analysis
 * - Error recovery assessment for application stability and resilience
 * - Educational patterns demonstrating enterprise error handling best practices
 */
class ErrorMiddleware {
    /**
     * Initializes the ErrorMiddleware with configuration settings, error handler, and logger
     * instances for comprehensive error processing. Demonstrates configuration integration
     * patterns and provides comprehensive error handling setup.
     * 
     * @param {object} options - Configuration options for error middleware initialization
     * @param {boolean} [options.enableStackTrace=false] - Include stack traces in responses (security)
     * @param {boolean} [options.logAllErrors=true] - Enable comprehensive error logging
     * @param {boolean} [options.includeRequestContext=true] - Include HTTP request context
     * @param {boolean} [options.sanitizeErrorMessages=true] - Enable message sanitization
     * @param {boolean} [options.enableErrorCorrelation=true] - Enable correlation IDs
     * @param {number} [options.maxErrorMessageLength=500] - Maximum error message length
     * @param {Logger} [options.logger] - Custom logger instance
     * @param {boolean} [options.isDevelopment=false] - Development mode flag
     */
    constructor(options = {}) {
        try {
            // Merge configuration options with ERROR_MIDDLEWARE_CONFIG defaults
            this.config = {
                ...ERROR_MIDDLEWARE_CONFIG,
                ...options
            };

            // Initialize ErrorHandler instance with error processing configuration
            this.errorHandler = new ErrorHandler({
                includeStackTrace: this.config.enableStackTrace,
                logErrorDetails: this.config.logAllErrors,
                sanitizeErrorMessages: this.config.sanitizeErrorMessages,
                enableErrorCorrelation: this.config.enableErrorCorrelation,
                isDevelopment: this.config.isDevelopment || process.env.NODE_ENV === 'development'
            });

            // Set up Logger instance for error middleware logging and monitoring
            this.logger = options.logger || new Logger({
                enableColors: this.config.isDevelopment,
                logLevel: this.config.isDevelopment ? 'debug' : 'warn'
            });

            // Initialize error statistics tracking object for monitoring and metrics
            this.errorStats = {
                totalErrors: 0,
                errorsByType: {
                    [MIDDLEWARE_ERROR_TYPES.PARSING_ERROR]: 0,
                    [MIDDLEWARE_ERROR_TYPES.ROUTING_ERROR]: 0,
                    [MIDDLEWARE_ERROR_TYPES.METHOD_ERROR]: 0,
                    [MIDDLEWARE_ERROR_TYPES.SERVER_ERROR]: 0,
                    [MIDDLEWARE_ERROR_TYPES.VALIDATION_ERROR]: 0,
                    [MIDDLEWARE_ERROR_TYPES.MIDDLEWARE_ERROR]: 0
                },
                errorsByStatusCode: {},
                errorsByPriority: {
                    [ERROR_HANDLING_PRIORITY.CLIENT_ERRORS]: 0,
                    [ERROR_HANDLING_PRIORITY.SERVER_ERRORS]: 0,
                    [ERROR_HANDLING_PRIORITY.CRITICAL_ERRORS]: 0,
                    [ERROR_HANDLING_PRIORITY.SECURITY_ERRORS]: 0
                },
                lastErrorTimestamp: null,
                startTime: new Date().toISOString(),
                performanceMetrics: {
                    averageProcessingTime: 0,
                    totalProcessingTime: 0,
                    maxProcessingTime: 0
                }
            };

            // Configure development vs production error handling behavior
            this.isDevelopment = Boolean(this.config.isDevelopment);

            // Initialize error correlation and tracking capabilities
            this.correlationMap = new Map();
            this.errorHistory = [];

            // Set up error severity thresholds and alerting configuration
            this.severityThresholds = {
                alertingThreshold: ERROR_SEVERITY_LEVELS.HIGH,
                loggingThreshold: ERROR_SEVERITY_LEVELS.LOW,
                statisticsThreshold: ERROR_SEVERITY_LEVELS.LOW
            };

            // Log successful error middleware initialization
            this.logger.debug('ErrorMiddleware initialized successfully', {
                config: this.config,
                isDevelopment: this.isDevelopment,
                errorHandler: 'initialized',
                statisticsEnabled: true,
                timestamp: new Date().toISOString()
            });

        } catch (initializationError) {
            // Fallback initialization if primary initialization fails
            console.error(`ErrorMiddleware initialization failed: ${initializationError.message}`);
            
            // Set up minimal fallback configuration
            this.config = ERROR_MIDDLEWARE_CONFIG;
            this.logger = logger;
            this.errorHandler = new ErrorHandler();
            this.errorStats = { totalErrors: 0, initializationFailed: true };
            this.isDevelopment = false;
            this.correlationMap = new Map();
            this.errorHistory = [];
        }
    }

    /**
     * Primary error handling method that processes all application errors with comprehensive
     * classification, logging, and response generation. Implements comprehensive error
     * processing including classification, response generation, and monitoring integration
     * following Express-style middleware patterns.
     * 
     * @param {Error} error - Error object to process and handle
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {function} next - Next middleware function (Express pattern)
     * @returns {void} Processes error and sends appropriate HTTP response to client
     */
    async handleError(error, request, response, next) {
        const startTime = Date.now();
        
        try {
            // Generate unique error correlation ID for tracking and debugging
            const requestId = request.headers['x-request-id'] || null;
            const correlationId = generateErrorCorrelationId(requestId, 'general');

            // Extract comprehensive error context using extractErrorContext function
            const errorContext = extractErrorContext(error, request, response);

            // Determine error type using determineErrorType for appropriate handler routing
            const errorType = determineErrorType(error, request);

            // Classify error using ErrorHandler classifyError for proper categorization
            const errorClassification = classifyError(error, {
                requestMethod: request.method,
                requestUrl: request.url,
                errorType: errorType
            });

            // Log error with comprehensive context using logger for monitoring
            await this.logErrorEvent(error, {
                ...errorContext,
                errorType: errorType,
                classification: errorClassification
            }, correlationId, {
                includeStackTrace: this.config.enableStackTrace,
                logLevel: errorClassification.logLevel
            });

            // Route to appropriate specialized error handler based on error type
            switch (errorType) {
                case MIDDLEWARE_ERROR_TYPES.PARSING_ERROR:
                    await this.handleParsingError(error, request, response, {
                        context: errorContext,
                        correlationId: correlationId
                    });
                    break;

                case MIDDLEWARE_ERROR_TYPES.ROUTING_ERROR:
                    await this.handleRoutingError(request.url, request, response, {
                        context: errorContext,
                        correlationId: correlationId
                    });
                    break;

                case MIDDLEWARE_ERROR_TYPES.METHOD_ERROR:
                    await this.handleMethodError(request.method, request.url, request, response, {
                        context: errorContext,
                        correlationId: correlationId
                    });
                    break;

                case MIDDLEWARE_ERROR_TYPES.SERVER_ERROR:
                case MIDDLEWARE_ERROR_TYPES.VALIDATION_ERROR:
                case MIDDLEWARE_ERROR_TYPES.MIDDLEWARE_ERROR:
                default:
                    await this.handleServerError(error, request, response, {
                        context: errorContext,
                        correlationId: correlationId
                    });
                    break;
            }

            // Update error statistics and metrics for monitoring dashboards
            const processingTime = Date.now() - startTime;
            this.updateErrorStats(errorType, errorClassification.statusCode, processingTime);

            // Store error correlation for debugging support if enabled
            if (this.config.enableErrorCorrelation) {
                this.correlationMap.set(correlationId, {
                    error: error,
                    context: errorContext,
                    classification: errorClassification,
                    processingTime: processingTime,
                    timestamp: new Date().toISOString()
                });

                // Limit correlation map size to prevent memory issues
                if (this.correlationMap.size > 1000) {
                    const oldestKey = this.correlationMap.keys().next().value;
                    this.correlationMap.delete(oldestKey);
                }
            }

        } catch (handlingError) {
            // Fallback error handling if primary error handling fails
            this.logger.error('Primary error handling failed, using fallback', {
                handlingError: handlingError.message,
                originalError: error?.message,
                requestUrl: request?.url,
                requestMethod: request?.method
            });

            // Send fallback error response to prevent hanging requests
            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles HTTP request parsing errors with 400 Bad Request responses and detailed
     * logging for malformed request debugging. Provides specialized handling for HTTP
     * protocol errors and request format issues.
     * 
     * @param {Error} parseError - Parse error from HTTP request processing
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @param {object} context - Additional error context and correlation information
     * @returns {void} Sends 400 Bad Request response for HTTP parsing errors
     */
    async handleParsingError(parseError, request, response, context) {
        try {
            // Use ErrorHandler.handleParseError for standardized parse error processing
            await this.errorHandler.handleParseError(parseError, request, response);

            // Log parsing error details with request context for debugging
            this.logger.warn('HTTP parsing error processed', {
                errorType: MIDDLEWARE_ERROR_TYPES.PARSING_ERROR,
                parseError: {
                    name: parseError.name,
                    message: parseError.message
                },
                requestInfo: {
                    method: request.method,
                    url: request.url,
                    headers: request.headers
                },
                correlationId: context.correlationId,
                context: context.context
            });

        } catch (error) {
            this.logger.error('Parsing error handling failed', {
                error: error.message,
                parseError: parseError?.message,
                correlationId: context?.correlationId
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles route not found errors with 404 Not Found responses and appropriate logging
     * for unmatched route tracking. Provides specialized handling for routing errors with
     * security considerations to prevent information disclosure about existing routes.
     * 
     * @param {string} requestPath - Requested path that was not found
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @param {object} context - Additional error context and correlation information
     * @returns {void} Sends 404 Not Found response for unmatched routes
     */
    async handleRoutingError(requestPath, request, response, context) {
        try {
            // Use ErrorHandler.handleRouteError for standardized route error processing
            await this.errorHandler.handleRouteError(requestPath, request, response);

            // Log route not found event with requested path for monitoring
            this.logger.warn('Route not found processed', {
                errorType: MIDDLEWARE_ERROR_TYPES.ROUTING_ERROR,
                requestedPath: requestPath,
                requestInfo: {
                    method: request.method,
                    userAgent: request.headers?.['user-agent'],
                    referer: request.headers?.['referer']
                },
                correlationId: context.correlationId,
                securityNote: 'No information about existing routes disclosed'
            });

        } catch (error) {
            this.logger.error('Routing error handling failed', {
                error: error.message,
                requestPath: requestPath,
                correlationId: context?.correlationId
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles HTTP method not allowed errors with 405 Method Not Allowed responses including
     * proper Allow header for supported methods. Implements HTTP protocol compliance for
     * method validation errors with proper header management.
     * 
     * @param {string} requestMethod - HTTP method that is not allowed
     * @param {string} requestPath - Request path for context
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @param {object} context - Additional error context and correlation information
     * @returns {void} Sends 405 Method Not Allowed response with Allow header
     */
    async handleMethodError(requestMethod, requestPath, request, response, context) {
        try {
            // Use ErrorHandler.handleMethodError for standardized method error processing
            await this.errorHandler.handleMethodError(requestMethod, requestPath, request, response);

            // Log method not allowed event with method and path for monitoring
            this.logger.warn('HTTP method not allowed processed', {
                errorType: MIDDLEWARE_ERROR_TYPES.METHOD_ERROR,
                requestedMethod: requestMethod,
                requestedPath: requestPath,
                allowedMethods: ['GET'],
                requestInfo: {
                    userAgent: request.headers?.['user-agent'],
                    referer: request.headers?.['referer']
                },
                correlationId: context.correlationId,
                httpCompliance: 'Allow header included'
            });

        } catch (error) {
            this.logger.error('Method error handling failed', {
                error: error.message,
                requestMethod: requestMethod,
                requestPath: requestPath,
                correlationId: context?.correlationId
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles internal server errors with secure 500 responses and comprehensive internal
     * logging for debugging. Implements secure server error handling with generic client
     * responses and detailed internal error tracking.
     * 
     * @param {Error} serverError - Error object causing server error
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @param {object} context - Additional error context and correlation information
     * @returns {void} Sends secure 500 Internal Server Error response with internal logging
     */
    async handleServerError(serverError, request, response, context) {
        try {
            // Use ErrorHandler.handleServerError for secure server error processing
            await this.errorHandler.handleServerError(serverError, request, response, context);

            // Log comprehensive server error details for internal debugging
            this.logger.error('Server error processed with secure response', {
                errorType: MIDDLEWARE_ERROR_TYPES.SERVER_ERROR,
                serverError: {
                    name: serverError.name,
                    message: serverError.message,
                    type: serverError.constructor.name,
                    stack: this.config.enableStackTrace ? serverError.stack : '[STACK_TRACE_DISABLED]'
                },
                requestInfo: {
                    method: request.method,
                    url: request.url,
                    userAgent: request.headers?.['user-agent']
                },
                systemState: {
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                    platform: process.platform
                },
                correlationId: context.correlationId,
                securityNote: 'Sensitive details logged internally only'
            });

            // Alert monitoring systems for critical server error conditions if needed
            if (this.config.enableErrorCorrelation) {
                this._alertOnCriticalServerError(serverError, context.correlationId, context.context);
            }

        } catch (error) {
            this.logger.error('Server error handling failed', {
                error: error.message,
                originalError: serverError?.message,
                correlationId: context?.correlationId
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Processes client errors (4xx status codes) with appropriate client-facing responses
     * and monitoring. Provides specialized handling for client-side errors with proper
     * HTTP status codes and security considerations.
     * 
     * @param {number} statusCode - HTTP status code in 4xx range
     * @param {string} errorMessage - Client error message for logging
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @param {object} context - Additional error context and correlation information
     * @returns {void} Sends appropriate 4xx error response to client
     */
    async processClientError(statusCode, errorMessage, request, response, context) {
        try {
            // Validate status code is in 4xx range using isClientError function
            if (!isClientError(statusCode)) {
                throw new Error(`Invalid client error status code: ${statusCode}. Must be in 4xx range.`);
            }

            // Use ErrorHandler.handleClientError for standardized client error processing
            await this.errorHandler.handleClientError(statusCode, errorMessage, request, response, context);

            // Log client error with WARN level for monitoring and analysis
            this.logger.warn('Client error processed', {
                statusCode: statusCode,
                statusCategory: getStatusCategory(statusCode),
                clientErrorMessage: errorMessage,
                requestInfo: {
                    method: request.method,
                    url: request.url,
                    userAgent: request.headers?.['user-agent'],
                    referer: request.headers?.['referer']
                },
                correlationId: context?.correlationId,
                processingType: 'client_error_handling'
            });

        } catch (error) {
            this.logger.error('Client error processing failed', {
                error: error.message,
                statusCode: statusCode,
                errorMessage: errorMessage,
                correlationId: context?.correlationId
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Logs error events with comprehensive context, correlation IDs, and structured format
     * for monitoring and debugging purposes. Provides centralized error logging with
     * structured format and correlation support.
     * 
     * @param {Error} error - Error object to log
     * @param {object} context - Error context and debugging information
     * @param {string} correlationId - Error correlation ID for tracking
     * @param {object} options - Logging options and configuration
     * @returns {void} Logs structured error information for monitoring and debugging
     */
    async logErrorEvent(error, context, correlationId, options = {}) {
        try {
            // Format error for logging using ErrorHandler formatErrorForLogging
            const formattedError = formatErrorForLogging(error, context, correlationId);

            // Determine appropriate log level based on error severity
            const logLevel = options.logLevel || 'error';

            // Create comprehensive log context with error and system information
            const logContext = {
                correlationId: correlationId,
                errorMiddleware: 'ErrorMiddleware',
                formattedError: formattedError,
                context: context,
                options: options,
                timestamp: new Date().toISOString()
            };

            // Use logger.logError method for structured error logging if available
            if (typeof this.logger.logError === 'function') {
                this.logger.logError(error, logContext, correlationId);
            } else {
                // Fallback to regular log method with appropriate level
                this.logger[logLevel]('Error processed by ErrorMiddleware', logContext);
            }

            // Update error logging statistics for monitoring
            this.errorStats.lastErrorTimestamp = new Date().toISOString();

        } catch (loggingError) {
            // Fallback logging if structured error logging fails
            console.error('Error logging failed in ErrorMiddleware:', loggingError.message);
            console.error('Original error:', error?.message);
        }
    }

    /**
     * Creates comprehensive error response objects with proper status codes, sanitized
     * messages, and security headers for consistent error handling. Centralized error
     * response creation with validation and security considerations.
     * 
     * @param {number} statusCode - HTTP status code for error response
     * @param {string} errorMessage - Error message for response content
     * @param {object} errorContext - Additional error context and metadata
     * @param {string} correlationId - Error correlation ID for tracking
     * @returns {object} Complete error response object with status, headers, and sanitized content
     */
    createErrorResponse(statusCode, errorMessage, errorContext, correlationId) {
        try {
            // Use ErrorHandler.createErrorResponse for standardized response creation
            return this.errorHandler.createErrorResponse(
                statusCode,
                errorMessage,
                {
                    ...errorContext,
                    correlationId: correlationId
                },
                {
                    sanitizeMessage: this.config.sanitizeErrorMessages,
                    includeMetadata: this.isDevelopment
                }
            );

        } catch (error) {
            this.logger.error('Error response creation failed in middleware', {
                error: error.message,
                statusCode: statusCode,
                correlationId: correlationId
            });

            // Return basic fallback error response
            return {
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
                content: INTERNAL_SERVER_ERROR,
                contentType: 'text/plain; charset=utf-8',
                contentLength: Buffer.byteLength(INTERNAL_SERVER_ERROR)
            };
        }
    }

    /**
     * Updates error handling statistics and metrics for monitoring, alerting, and
     * performance analysis. Provides comprehensive error metrics for monitoring
     * dashboards and performance assessment.
     * 
     * @param {string} errorType - Type of error for categorization
     * @param {number} statusCode - HTTP status code for classification
     * @param {number} processingTime - Error processing time in milliseconds
     * @returns {void} Updates internal error statistics for monitoring and metrics
     */
    updateErrorStats(errorType, statusCode, processingTime) {
        try {
            // Update total error count
            this.errorStats.totalErrors++;

            // Update error count by type
            if (this.errorStats.errorsByType[errorType] !== undefined) {
                this.errorStats.errorsByType[errorType]++;
            }

            // Update error count by status code
            if (statusCode) {
                this.errorStats.errorsByStatusCode[statusCode] = 
                    (this.errorStats.errorsByStatusCode[statusCode] || 0) + 1;
            }

            // Update error priority statistics
            let priority = ERROR_HANDLING_PRIORITY.SERVER_ERRORS; // Default
            if (isClientError(statusCode)) {
                priority = ERROR_HANDLING_PRIORITY.CLIENT_ERRORS;
            } else if (isServerError(statusCode)) {
                priority = ERROR_HANDLING_PRIORITY.SERVER_ERRORS;
            }

            this.errorStats.errorsByPriority[priority]++;

            // Update performance metrics
            if (typeof processingTime === 'number' && processingTime > 0) {
                this.errorStats.performanceMetrics.totalProcessingTime += processingTime;
                this.errorStats.performanceMetrics.averageProcessingTime = 
                    this.errorStats.performanceMetrics.totalProcessingTime / this.errorStats.totalErrors;
                
                if (processingTime > this.errorStats.performanceMetrics.maxProcessingTime) {
                    this.errorStats.performanceMetrics.maxProcessingTime = processingTime;
                }
            }

            // Update timestamp and maintain error history
            this.errorStats.lastErrorTimestamp = new Date().toISOString();
            
            this.errorHistory.push({
                errorType: errorType,
                statusCode: statusCode,
                processingTime: processingTime,
                timestamp: new Date().toISOString()
            });

            // Limit error history size to prevent memory issues
            if (this.errorHistory.length > 500) {
                this.errorHistory = this.errorHistory.slice(-250);
            }

        } catch (error) {
            // Log statistics update failure without throwing to prevent recursion
            console.error('Error statistics update failed:', error.message);
        }
    }

    /**
     * Returns comprehensive error handling statistics for monitoring, alerting, and
     * performance analysis. Provides comprehensive error metrics for monitoring
     * dashboards and performance assessment.
     * 
     * @returns {object} Error statistics with counts, rates, and performance metrics
     */
    getErrorStats() {
        try {
            // Calculate uptime and error rates
            const uptime = Date.now() - new Date(this.errorStats.startTime).getTime();
            const uptimeInSeconds = uptime / 1000;
            const errorsPerSecond = this.errorStats.totalErrors > 0 ? 
                (this.errorStats.totalErrors / uptimeInSeconds).toFixed(4) : 0;

            // Aggregate error counts by type with percentages
            const errorTypeDistribution = {};
            Object.keys(this.errorStats.errorsByType).forEach(type => {
                const count = this.errorStats.errorsByType[type];
                errorTypeDistribution[type] = {
                    count: count,
                    percentage: this.errorStats.totalErrors > 0 ? 
                        ((count / this.errorStats.totalErrors) * 100).toFixed(2) : 0
                };
            });

            // Aggregate status code distribution
            const statusCodeDistribution = {};
            Object.keys(this.errorStats.errorsByStatusCode).forEach(statusCode => {
                const count = this.errorStats.errorsByStatusCode[statusCode];
                statusCodeDistribution[statusCode] = {
                    count: count,
                    percentage: this.errorStats.totalErrors > 0 ? 
                        ((count / this.errorStats.totalErrors) * 100).toFixed(2) : 0,
                    category: getStatusCategory(parseInt(statusCode))
                };
            });

            // Return comprehensive statistics object
            return {
                summary: {
                    totalErrors: this.errorStats.totalErrors,
                    errorsPerSecond: parseFloat(errorsPerSecond),
                    uptimeSeconds: Math.round(uptimeInSeconds),
                    lastErrorTimestamp: this.errorStats.lastErrorTimestamp,
                    averageProcessingTime: `${this.errorStats.performanceMetrics.averageProcessingTime.toFixed(2)}ms`,
                    maxProcessingTime: `${this.errorStats.performanceMetrics.maxProcessingTime}ms`
                },
                errorDistribution: {
                    byType: errorTypeDistribution,
                    byStatusCode: statusCodeDistribution,
                    byPriority: this.errorStats.errorsByPriority
                },
                performance: this.errorStats.performanceMetrics,
                configuration: {
                    enableStackTrace: this.config.enableStackTrace,
                    logAllErrors: this.config.logAllErrors,
                    sanitizeErrorMessages: this.config.sanitizeErrorMessages,
                    enableErrorCorrelation: this.config.enableErrorCorrelation,
                    isDevelopment: this.isDevelopment
                },
                correlationMapSize: this.correlationMap.size,
                errorHistorySize: this.errorHistory.length
            };

        } catch (error) {
            return {
                error: 'Statistics generation failed',
                message: error.message,
                totalErrors: this.errorStats.totalErrors || 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Sends fallback error response when primary error handling fails.
     * @private
     */
    _sendFallbackErrorResponse(response) {
        try {
            if (response.headersSent) {
                return; // Cannot send response if headers already sent
            }

            const fallbackResponse = {
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                headers: {
                    'content-type': 'text/plain; charset=utf-8',
                    'content-length': Buffer.byteLength(INTERNAL_SERVER_ERROR).toString(),
                    'x-error-fallback': 'true'
                },
                content: INTERNAL_SERVER_ERROR
            };

            response.writeHead(fallbackResponse.statusCode, fallbackResponse.headers);
            response.end(fallbackResponse.content);

        } catch (fallbackError) {
            // Ultimate fallback - close connection
            try {
                response.end('Internal Server Error');
            } catch (finalError) {
                console.error('Ultimate error handling fallback failed:', finalError.message);
            }
        }
    }

    /**
     * Alerts on critical server errors for monitoring systems.
     * @private
     */
    _alertOnCriticalServerError(error, correlationId, context) {
        try {
            this.logger.error('CRITICAL SERVER ERROR ALERT', {
                alert: 'CRITICAL_ERROR',
                correlationId: correlationId,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                context: context,
                timestamp: new Date().toISOString(),
                requiresImmediateAttention: true,
                severity: 'CRITICAL'
            });

        } catch (alertError) {
            console.error('Critical error alerting failed:', alertError.message);
        }
    }
}

// ============================================================================
// FACTORY FUNCTIONS AND MIDDLEWARE CREATION
// ============================================================================

/**
 * Factory function that creates error handling middleware with configurable options
 * for comprehensive error processing and response generation. Provides flexible
 * middleware creation with customizable configuration and Express integration.
 * 
 * @param {object} options - Configuration options for error middleware creation
 * @returns {function} Express-style error middleware function for error handling integration
 */
function createErrorMiddleware(options = {}) {
    try {
        // Create ErrorMiddleware instance with provided configuration
        const errorMiddleware = new ErrorMiddleware(options);

        // Return Express-style error middleware function with four-parameter signature
        return async (error, request, response, next) => {
            await errorMiddleware.handleError(error, request, response, next);
        };

    } catch (error) {
        console.error('Error middleware creation failed:', error.message);
        
        // Return fallback middleware function
        return (error, request, response, next) => {
            response.writeHead(500, { 'content-type': 'text/plain' });
            response.end('Internal Server Error');
        };
    }
}

// ============================================================================
// HELPER UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a random string for correlation ID components with specified length.
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
// DEFAULT MIDDLEWARE INSTANCE
// ============================================================================

// Create default error middleware instance for immediate use
const errorMiddleware = createErrorMiddleware({
    enableStackTrace: false,
    logAllErrors: true,
    includeRequestContext: true,
    sanitizeErrorMessages: true,
    enableErrorCorrelation: true,
    isDevelopment: process.env.NODE_ENV === 'development'
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export all error middleware components for use throughout the Node.js tutorial application.
 * 
 * This module provides comprehensive error middleware including:
 * - ErrorMiddleware class for complete error processing with Express integration
 * - Factory function for creating configured error middleware instances
 * - Utility functions for error context extraction and processing
 * - Error type determination and correlation ID generation
 * - Error sanitization for secure client consumption
 * - Global constants for error types, priority levels, and configuration
 * 
 * All components implement comprehensive error handling patterns with security
 * considerations, educational clarity, and production-ready error management.
 */

// Export main ErrorMiddleware class
export { ErrorMiddleware };

// Export factory function for middleware creation
export { createErrorMiddleware };

// Export utility functions for error processing
export { extractErrorContext };
export { determineErrorType };
export { generateErrorCorrelationId };
export { sanitizeErrorForClient };

// Export global constants for error management
export { ERROR_MIDDLEWARE_CONFIG };
export { MIDDLEWARE_ERROR_TYPES };
export { ERROR_HANDLING_PRIORITY };

// Export default configured error middleware function
export { errorMiddleware };

// Default export for convenient access to ErrorMiddleware
export default ErrorMiddleware;