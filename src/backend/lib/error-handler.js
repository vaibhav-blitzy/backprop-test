/**
 * Core Error Handling Library for Node.js Tutorial Application
 * 
 * Provides comprehensive error processing, classification, and response generation capabilities
 * for the Node.js tutorial application that implements educational error handling patterns while
 * demonstrating production-ready error management including error categorization, secure error
 * responses, logging integration, and HTTP protocol compliance.
 * 
 * This module serves as the central error processing component that transforms various error
 * conditions into appropriate HTTP responses without information disclosure vulnerabilities.
 * It implements multiple layers of error handling with error classification systems for 
 * appropriate HTTP status codes (400, 404, 405, 500) and comprehensive error recovery strategies.
 * 
 * Key Features:
 * - Multi-layered error handling with comprehensive error classification system
 * - Secure error response generation preventing information disclosure vulnerabilities
 * - HTTP protocol compliant error responses with proper status codes and headers
 * - Comprehensive error logging with correlation IDs for debugging and monitoring
 * - Error recovery assessment for application stability and graceful degradation
 * - Educational patterns demonstrating industry-standard error handling practices
 * - Production-ready error management with security and monitoring considerations
 * 
 * Educational Value:
 * - Demonstrates proper error handling implementation patterns and best practices
 * - Shows secure error response generation without sensitive information exposure
 * - Illustrates error classification and severity assessment for proper handling
 * - Provides examples of error logging and correlation for debugging and monitoring
 * - Shows integration between error handling and HTTP protocol compliance
 * - Demonstrates production-ready error management patterns for Node.js applications
 * 
 * Security Features:
 * - Generic error messages for client-facing responses preventing information disclosure
 * - Sensitive information sanitization in error messages and stack traces
 * - Comprehensive internal error logging for debugging without client exposure
 * - Error correlation IDs for secure error tracking and debugging support
 * 
 * @fileoverview Core error handling library with comprehensive error management and secure responses
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - INTERNAL DEPENDENCIES
// ============================================================================

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

// Import HTTP status code constants and validation utilities for proper error classification
import {
    HTTP_STATUS_CODES,
    isValidStatusCode,
    isClientError,
    isServerError,
    getStatusCategory
} from '../utils/http-status.js';

// Import logging utilities for structured error logging and monitoring
import {
    Logger,
    logger
} from '../utils/logger.js';

// Import response utilities for error response creation and header formatting
import {
    createErrorResponse,
    formatHeaders,
    validateResponse
} from '../utils/response-utils.js';

// ============================================================================
// MODULE IMPORTS - EXTERNAL DEPENDENCIES
// ============================================================================

// Node.js built-in util module for error object inspection and stack trace formatting
import util from 'util'; // Node.js v20.x - Built-in utility module for object inspection and error formatting

// ============================================================================
// GLOBAL CONSTANTS AND ERROR TYPE DEFINITIONS
// ============================================================================

/**
 * Error type constants for comprehensive error classification and handling strategy determination.
 * These constants provide standardized error type identification for proper error processing,
 * logging, and response generation throughout the application.
 * 
 * Error Types:
 * - PARSE_ERROR: HTTP request parsing errors and malformed request data
 * - ROUTE_ERROR: Route not found errors and URL path resolution failures
 * - METHOD_ERROR: HTTP method not allowed errors and unsupported method requests
 * - SERVER_ERROR: Internal server errors and application processing failures
 * - VALIDATION_ERROR: Input validation errors and parameter validation failures
 */
const ERROR_TYPES = {
    PARSE_ERROR: 'parse_error',
    ROUTE_ERROR: 'route_error', 
    METHOD_ERROR: 'method_error',
    SERVER_ERROR: 'server_error',
    VALIDATION_ERROR: 'validation_error'
};

/**
 * Error severity levels with numeric values for priority assessment and handling strategy.
 * Lower numeric values indicate higher severity levels requiring immediate attention.
 * These levels guide error logging priorities, alerting thresholds, and recovery strategies.
 * 
 * Severity Levels:
 * - LOW (1): Minor issues that don't affect functionality
 * - MEDIUM (2): Issues that may impact user experience but allow continued operation
 * - HIGH (3): Serious issues requiring attention and potentially affecting functionality
 * - CRITICAL (4): Severe issues requiring immediate attention and potentially causing system instability
 */
const ERROR_SEVERITY_LEVELS = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
};

/**
 * Default error handler configuration providing baseline settings for error processing,
 * logging behavior, security features, and correlation tracking.
 * 
 * Configuration Options:
 * - includeStackTrace: Control stack trace inclusion in error responses (disabled for security)
 * - logErrorDetails: Enable comprehensive error detail logging for debugging
 * - sanitizeErrorMessages: Enable error message sanitization for security
 * - enableErrorCorrelation: Enable error correlation IDs for tracking and debugging
 */
const DEFAULT_ERROR_CONFIG = {
    includeStackTrace: false,        // Security: disabled to prevent information disclosure
    logErrorDetails: true,           // Enable detailed logging for debugging
    sanitizeErrorMessages: true,     // Enable message sanitization for security
    enableErrorCorrelation: true     // Enable correlation IDs for error tracking
};

// ============================================================================
// ERROR CLASSIFICATION AND PROCESSING FUNCTIONS
// ============================================================================

/**
 * Classifies errors by type, status code, and severity level for appropriate error handling
 * and response generation strategy selection. Implements comprehensive error analysis to
 * determine proper error processing approach, logging level, and response strategy.
 * 
 * This function examines error object properties, determines error category using HTTP status
 * utilities, assigns appropriate status codes, calculates severity levels, and provides
 * comprehensive error classification for proper error handling decisions.
 * 
 * @param {Error|object} error - Error object or error-like object to classify
 * @param {object} context - Additional context information for error classification
 * @param {string} [context.requestMethod] - HTTP method for method-specific classification
 * @param {string} [context.requestUrl] - Request URL for route-specific classification
 * @param {number} [context.statusCode] - Existing status code for classification context
 * @param {string} [context.errorType] - Hint for error type classification
 * @returns {object} Comprehensive error classification with type, severity, status code, and strategy
 * @returns {string} returns.type - Classified error type from ERROR_TYPES
 * @returns {number} returns.severity - Error severity level for handling priority
 * @returns {number} returns.statusCode - Appropriate HTTP status code for response
 * @returns {string} returns.category - Error category (client_error, server_error)
 * @returns {string} returns.logLevel - Recommended logging level for error
 * @returns {string} returns.responseStrategy - Recommended response handling strategy
 * 
 * @throws {Error} Error classification processing errors with detailed context
 * 
 * @example
 * const classification = classifyError(new Error('Route not found'), {
 *   requestMethod: 'GET',
 *   requestUrl: '/nonexistent'
 * });
 * // Returns: { type: 'route_error', severity: 2, statusCode: 404, ... }
 */
function classifyError(error, context = {}) {
    try {
        // Initialize error classification result with defaults
        const classification = {
            type: ERROR_TYPES.SERVER_ERROR,
            severity: ERROR_SEVERITY_LEVELS.MEDIUM,
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            category: 'server_error',
            logLevel: 'error',
            responseStrategy: 'generic_error'
        };

        // Validate error parameter and convert to error-like object
        if (!error) {
            classification.type = ERROR_TYPES.SERVER_ERROR;
            classification.severity = ERROR_SEVERITY_LEVELS.LOW;
            return classification;
        }

        // Extract error properties for classification analysis
        const errorMessage = error.message || error.toString() || '';
        const errorName = error.name || 'Error';
        const errorStack = error.stack || '';
        
        // Determine error type based on context and error properties
        if (context.errorType) {
            // Use provided error type hint if available
            const providedType = context.errorType.toLowerCase();
            if (Object.values(ERROR_TYPES).includes(providedType)) {
                classification.type = providedType;
            }
        } else {
            // Classify error based on message content and context
            if (errorMessage.toLowerCase().includes('parse') || 
                errorMessage.toLowerCase().includes('malformed') ||
                errorMessage.toLowerCase().includes('invalid request')) {
                classification.type = ERROR_TYPES.PARSE_ERROR;
            } else if (errorMessage.toLowerCase().includes('not found') || 
                       errorMessage.toLowerCase().includes('route') ||
                       context.requestUrl && !context.requestUrl.startsWith('/hello')) {
                classification.type = ERROR_TYPES.ROUTE_ERROR;
            } else if (errorMessage.toLowerCase().includes('method') ||
                       errorMessage.toLowerCase().includes('not allowed') ||
                       (context.requestMethod && context.requestMethod !== 'GET')) {
                classification.type = ERROR_TYPES.METHOD_ERROR;
            } else if (errorMessage.toLowerCase().includes('validation') ||
                       errorMessage.toLowerCase().includes('invalid input')) {
                classification.type = ERROR_TYPES.VALIDATION_ERROR;
            } else {
                // Default to server error for unclassified errors
                classification.type = ERROR_TYPES.SERVER_ERROR;
            }
        }

        // Assign appropriate HTTP status code based on error type
        switch (classification.type) {
            case ERROR_TYPES.PARSE_ERROR:
            case ERROR_TYPES.VALIDATION_ERROR:
                classification.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
                classification.category = 'client_error';
                classification.logLevel = 'warn';
                classification.responseStrategy = 'bad_request';
                classification.severity = ERROR_SEVERITY_LEVELS.MEDIUM;
                break;
                
            case ERROR_TYPES.ROUTE_ERROR:
                classification.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;
                classification.category = 'client_error';
                classification.logLevel = 'warn';
                classification.responseStrategy = 'not_found';
                classification.severity = ERROR_SEVERITY_LEVELS.LOW;
                break;
                
            case ERROR_TYPES.METHOD_ERROR:
                classification.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;
                classification.category = 'client_error';
                classification.logLevel = 'warn';
                classification.responseStrategy = 'method_not_allowed';
                classification.severity = ERROR_SEVERITY_LEVELS.MEDIUM;
                break;
                
            case ERROR_TYPES.SERVER_ERROR:
            default:
                classification.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
                classification.category = 'server_error';
                classification.logLevel = 'error';
                classification.responseStrategy = 'internal_server_error';
                classification.severity = ERROR_SEVERITY_LEVELS.HIGH;
                break;
        }

        // Override status code if provided in context
        if (context.statusCode && isValidStatusCode(context.statusCode)) {
            classification.statusCode = context.statusCode;
            classification.category = isClientError(context.statusCode) ? 'client_error' : 'server_error';
        }

        // Adjust severity based on error characteristics
        if (errorName === 'TypeError' || errorName === 'ReferenceError') {
            classification.severity = ERROR_SEVERITY_LEVELS.CRITICAL;
        } else if (errorMessage.toLowerCase().includes('timeout')) {
            classification.severity = ERROR_SEVERITY_LEVELS.HIGH;
        } else if (classification.category === 'client_error') {
            classification.severity = Math.min(classification.severity, ERROR_SEVERITY_LEVELS.MEDIUM);
        }

        // Determine logging level using getStatusCategory utility
        const statusCategory = getStatusCategory(classification.statusCode);
        if (statusCategory === 'Client Error') {
            classification.logLevel = 'warn';
        } else if (statusCategory === 'Server Error') {
            classification.logLevel = 'error';
        }

        // Add classification metadata for debugging and monitoring
        classification.metadata = {
            originalErrorName: errorName,
            hasStackTrace: !!errorStack,
            contextProvided: Object.keys(context).length > 0,
            classificationTime: new Date().toISOString()
        };

        // Return comprehensive error classification object
        return classification;

    } catch (classificationError) {
        // Fallback classification for classification errors
        logger.warn('Error classification failed', {
            error: classificationError.message,
            originalError: error?.message,
            context: context
        });

        return {
            type: ERROR_TYPES.SERVER_ERROR,
            severity: ERROR_SEVERITY_LEVELS.HIGH,
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            category: 'server_error',
            logLevel: 'error',
            responseStrategy: 'generic_error',
            metadata: {
                classificationFailed: true,
                fallbackUsed: true
            }
        };
    }
}

/**
 * Sanitizes error messages by removing sensitive information and system details to prevent
 * information disclosure while maintaining error clarity for debugging. Implements comprehensive
 * message sanitization to protect against information disclosure attacks while preserving
 * useful debugging context for internal purposes.
 * 
 * @param {string} errorMessage - Original error message to sanitize for security
 * @param {object} options - Sanitization options and configuration
 * @param {boolean} [options.removePaths=true] - Remove file paths and system information
 * @param {boolean} [options.removeStackTrace=true] - Remove stack trace information
 * @param {boolean} [options.genericFallback=true] - Use generic message if sanitization removes all content
 * @param {number} [options.maxLength=200] - Maximum length for sanitized messages
 * @returns {string} Sanitized error message safe for client consumption without sensitive information
 * 
 * @example
 * const sanitized = sanitizeErrorMessage('Error in /home/user/app.js at line 42');
 * // Returns: 'Application error occurred'
 */
function sanitizeErrorMessage(errorMessage, options = {}) {
    try {
        // Initialize sanitization options with secure defaults
        const sanitizationOptions = {
            removePaths: true,
            removeStackTrace: true,
            genericFallback: true,
            maxLength: 200,
            ...options
        };

        // Validate error message input
        if (!errorMessage || typeof errorMessage !== 'string') {
            return sanitizationOptions.genericFallback ? INTERNAL_SERVER_ERROR : 'Error occurred';
        }

        let sanitizedMessage = errorMessage.trim();

        // Remove file paths, stack traces, and system information
        if (sanitizationOptions.removePaths) {
            // Remove absolute and relative file paths
            sanitizedMessage = sanitizedMessage.replace(/\/[^\s]*\.(js|json|ts|jsx|tsx|env|config|log)/gi, '[FILE]');
            sanitizedMessage = sanitizedMessage.replace(/\.[\/\\][^\s]*\.(js|json|ts|jsx|tsx|env|config|log)/gi, '[FILE]');
            
            // Remove Windows-style paths
            sanitizedMessage = sanitizedMessage.replace(/[A-Z]:[\\\/][^\s]*/gi, '[PATH]');
            
            // Remove line numbers and error locations
            sanitizedMessage = sanitizedMessage.replace(/at line \d+/gi, '');
            sanitizedMessage = sanitizedMessage.replace(/:\d+:\d+/g, '');
        }

        // Remove stack trace information if requested
        if (sanitizationOptions.removeStackTrace) {
            sanitizedMessage = sanitizedMessage.replace(/\s+at\s+[^\n]+/g, '');
            sanitizedMessage = sanitizedMessage.replace(/Error:\s*[A-Z_][A-Z_0-9]*:/gi, 'Error:');
        }

        // Remove sensitive patterns and information
        const sensitivePatterns = [
            // Database connection strings and credentials
            /mongodb:\/\/[^\s]+/gi,
            /postgres:\/\/[^\s]+/gi,
            /mysql:\/\/[^\s]+/gi,
            
            // API keys and tokens
            /api[_-]?key[=:\s]*[^\s]+/gi,
            /token[=:\s]*[^\s]+/gi,
            /bearer\s+[^\s]+/gi,
            
            // Passwords and secrets
            /password[=:\s]*[^\s]+/gi,
            /secret[=:\s]*[^\s]+/gi,
            /key[=:\s]*[^\s]+/gi,
            
            // IP addresses and ports
            /\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g,
            /localhost:\d+/gi,
            
            // System information
            /node_modules[\/\\][^\s]*/gi,
            /package\.json/gi,
            /.env/gi
        ];

        // Apply sensitive pattern filtering
        sensitivePatterns.forEach(pattern => {
            sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
        });

        // Replace error-specific technical details with generic messages
        const technicalPatterns = [
            { pattern: /ECONNREFUSED/gi, replacement: 'Connection error' },
            { pattern: /ENOTFOUND/gi, replacement: 'Resource not found' },
            { pattern: /ETIMEDOUT/gi, replacement: 'Request timeout' },
            { pattern: /EADDRINUSE/gi, replacement: 'Address already in use' },
            { pattern: /TypeError: Cannot read propert(y|ies) of/gi, replacement: 'Invalid data access' },
            { pattern: /ReferenceError:/gi, replacement: 'Reference error:' },
            { pattern: /SyntaxError:/gi, replacement: 'Syntax error:' }
        ];

        technicalPatterns.forEach(({ pattern, replacement }) => {
            sanitizedMessage = sanitizedMessage.replace(pattern, replacement);
        });

        // Clean up extra whitespace and normalize formatting
        sanitizedMessage = sanitizedMessage.replace(/\s+/g, ' ').trim();
        sanitizedMessage = sanitizedMessage.replace(/\[REDACTED\]\s*\[REDACTED\]/g, '[REDACTED]');

        // Apply message length limits to prevent information leakage
        if (sanitizedMessage.length > sanitizationOptions.maxLength) {
            sanitizedMessage = sanitizedMessage.substring(0, sanitizationOptions.maxLength - 3) + '...';
        }

        // Use generic fallback if sanitization removed all useful content
        if (sanitizationOptions.genericFallback && 
            (sanitizedMessage.length < 10 || 
             sanitizedMessage === '[REDACTED]' || 
             sanitizedMessage.match(/^\[.*\]$/))) {
            switch (true) {
                case errorMessage.toLowerCase().includes('not found'):
                    return NOT_FOUND;
                case errorMessage.toLowerCase().includes('method'):
                    return METHOD_NOT_ALLOWED;
                case errorMessage.toLowerCase().includes('bad') || errorMessage.toLowerCase().includes('invalid'):
                    return BAD_REQUEST;
                default:
                    return INTERNAL_SERVER_ERROR;
            }
        }

        // Return sanitized message safe for client consumption
        return sanitizedMessage || 'An error occurred';

    } catch (sanitizationError) {
        // Fallback to generic error message if sanitization fails
        logger.warn('Error message sanitization failed', {
            error: sanitizationError.message,
            originalMessage: errorMessage
        });
        
        return INTERNAL_SERVER_ERROR;
    }
}

/**
 * Formats error objects for comprehensive logging with stack traces, context, and debugging
 * information while maintaining structured logging format. Provides detailed error formatting
 * for internal logging systems with complete debugging context and correlation support.
 * 
 * @param {Error} error - Error object with stack trace and error details
 * @param {object} context - Additional context and debugging information
 * @param {string} [context.requestMethod] - HTTP method for request context
 * @param {string} [context.requestUrl] - Request URL for context
 * @param {object} [context.headers] - Request headers for debugging
 * @param {string} requestId - Request correlation ID for tracing
 * @returns {object} Formatted error object with full debugging information for internal logging
 * 
 * @example
 * const formatted = formatErrorForLogging(error, { requestMethod: 'GET' }, 'req_123');
 */
function formatErrorForLogging(error, context = {}, requestId = null) {
    try {
        // Initialize formatted error object with essential information
        const formattedError = {
            // Basic error information
            name: error?.name || 'UnknownError',
            message: error?.message || 'No error message provided',
            type: error?.constructor?.name || 'Error',
            
            // Request correlation and tracing information
            requestId: requestId || null,
            timestamp: new Date().toISOString(),
            
            // System context and environment information
            systemContext: {
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
                uptime: Math.round(process.uptime()),
                memoryUsage: process.memoryUsage(),
                pid: process.pid
            }
        };

        // Include comprehensive stack trace using util.inspect for debugging
        if (error?.stack) {
            formattedError.stack = error.stack;
            
            // Parse stack trace for structured analysis
            const stackLines = error.stack.split('\n').slice(1); // Remove error message line
            formattedError.stackTrace = {
                frames: stackLines.slice(0, 10), // Limit to first 10 frames
                totalFrames: stackLines.length,
                topFrame: stackLines[0] || 'Unknown location'
            };
        }

        // Add detailed error inspection using util.inspect for complex objects
        if (error && typeof error === 'object') {
            formattedError.errorInspection = util.inspect(error, {
                depth: 4,
                colors: false,
                showHidden: true,
                maxArrayLength: 10,
                breakLength: Infinity
            });
        }

        // Include comprehensive request context for debugging
        if (context && typeof context === 'object' && Object.keys(context).length > 0) {
            formattedError.requestContext = {
                method: context.requestMethod || null,
                url: context.requestUrl || null,
                userAgent: context.userAgent || null,
                referer: context.referer || null,
                
                // Add sanitized headers for debugging (remove sensitive information)
                headers: context.headers ? sanitizeHeaders(context.headers) : null,
                
                // Include additional context information
                remoteAddress: context.remoteAddress || null,
                timestamp: context.timestamp || new Date().toISOString()
            };
        }

        // Add error classification and severity assessment
        const errorClassification = classifyError(error, context);
        formattedError.classification = {
            type: errorClassification.type,
            severity: errorClassification.severity,
            category: errorClassification.category,
            statusCode: errorClassification.statusCode,
            logLevel: errorClassification.logLevel
        };

        // Include error frequency and occurrence tracking
        formattedError.metadata = {
            formattedAt: new Date().toISOString(),
            formattedBy: 'formatErrorForLogging',
            errorHash: generateErrorHash(error),
            processingTime: process.hrtime.bigint ? process.hrtime.bigint().toString() : Date.now()
        };

        // Add environment-specific debugging information
        if (process.env.NODE_ENV === 'development') {
            formattedError.development = {
                errorProto: Object.getPrototypeOf(error)?.constructor?.name || 'Unknown',
                errorKeys: Object.keys(error || {}),
                contextKeys: Object.keys(context || {}),
                environmentVariables: getFilteredEnvironment()
            };
        }

        // Return comprehensive formatted error object for internal logging
        return formattedError;

    } catch (formattingError) {
        // Fallback error formatting if primary formatting fails
        logger.warn('Error formatting failed, using fallback', {
            formattingError: formattingError.message,
            originalError: error?.message
        });

        return {
            name: 'FormattingError',
            message: error?.message || 'Error formatting failed',
            type: 'FallbackError',
            requestId: requestId,
            timestamp: new Date().toISOString(),
            fallback: true,
            originalError: {
                message: error?.message,
                name: error?.name,
                type: error?.constructor?.name
            }
        };
    }
}

/**
 * Generates unique error correlation IDs for tracking and debugging purposes with timestamp
 * and random components for error traceability. Creates collision-resistant identifiers for
 * error tracking across logs, monitoring systems, and debugging sessions.
 * 
 * @param {string} errorType - Type of error for ID categorization
 * @param {string} requestId - Request ID for correlation and tracing
 * @returns {string} Unique error ID for correlation and tracking across logs and responses
 * 
 * @example
 * const errorId = generateErrorId('server_error', 'req_123456');
 * // Returns: 'err_server_1703123456789_a1b2c3d4_req_123456'
 */
function generateErrorId(errorType = 'unknown', requestId = null) {
    try {
        // Initialize error ID components array
        const idComponents = ['err']; // Error ID prefix for identification

        // Add error type component for categorization
        if (errorType && typeof errorType === 'string') {
            const sanitizedType = errorType.toLowerCase()
                .replace(/[^a-z0-9_]/g, '')
                .substring(0, 20); // Limit type length
            
            if (sanitizedType.length > 0) {
                idComponents.push(sanitizedType);
            }
        }

        // Generate timestamp component for uniqueness
        const timestamp = Date.now().toString();
        idComponents.push(timestamp);

        // Create random component for additional uniqueness guarantee
        const randomComponent = generateRandomString(8);
        idComponents.push(randomComponent);

        // Create base error ID from components
        const baseErrorId = idComponents.join('_');

        // Add request ID correlation if provided for traceability
        let correlatedErrorId = baseErrorId;
        if (requestId && typeof requestId === 'string') {
            const sanitizedRequestId = requestId.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 32);
            if (sanitizedRequestId.length > 0) {
                correlatedErrorId = `${baseErrorId}_${sanitizedRequestId}`;
            }
        }

        // Validate generated error ID format and length
        if (correlatedErrorId.length > 128) {
            // Truncate if too long while maintaining essential components
            const essentialParts = [idComponents[0], idComponents[1], timestamp.substring(-8), randomComponent];
            correlatedErrorId = essentialParts.join('_');
        }

        // Ensure error ID meets format requirements
        const errorIdPattern = /^[a-zA-Z0-9_\-]+$/;
        if (!errorIdPattern.test(correlatedErrorId)) {
            // Fallback to basic error ID if format validation fails
            correlatedErrorId = `err_${timestamp}_${randomComponent}`;
        }

        // Return unique error identifier for tracking and debugging
        return correlatedErrorId;

    } catch (generationError) {
        // Fallback error ID generation if primary generation fails
        logger.warn('Error ID generation failed, using fallback', {
            error: generationError.message,
            errorType: errorType,
            requestId: requestId
        });

        // Return simple fallback error ID with timestamp
        return `err_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
}

// ============================================================================
// MAIN ERROR HANDLER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Main error handling class that provides comprehensive error processing, classification,
 * and response generation capabilities for the Node.js tutorial application. Implements
 * educational error handling patterns while demonstrating production-ready error management
 * including secure error responses, structured logging, and HTTP protocol compliance.
 * 
 * This class serves as the central error processing authority, providing:
 * - Comprehensive error classification and response generation
 * - Secure error handling preventing information disclosure vulnerabilities
 * - HTTP protocol compliant error responses with proper status codes and headers
 * - Structured error logging with correlation IDs for debugging and monitoring
 * - Error statistics tracking for performance monitoring and analysis
 * - Error recovery assessment for application stability and resilience
 * - Educational patterns demonstrating enterprise error handling best practices
 */
class ErrorHandler {
    /**
     * Initializes the ErrorHandler with configuration settings, logger instance, and error
     * tracking capabilities for comprehensive error management. Demonstrates configuration
     * integration patterns and provides comprehensive error handling setup.
     * 
     * @param {object} options - Configuration options for error handler initialization
     * @param {boolean} [options.includeStackTrace=false] - Include stack traces in responses (security)
     * @param {boolean} [options.logErrorDetails=true] - Enable detailed error logging
     * @param {boolean} [options.sanitizeErrorMessages=true] - Enable message sanitization
     * @param {boolean} [options.enableErrorCorrelation=true] - Enable correlation IDs
     * @param {Logger} [options.logger] - Custom logger instance
     * @param {boolean} [options.isDevelopment=false] - Development mode flag
     */
    constructor(options = {}) {
        try {
            // Validate and merge configuration options with defaults
            this.config = {
                ...DEFAULT_ERROR_CONFIG,
                ...options
            };

            // Initialize Logger instance for structured error logging and monitoring
            this.logger = options.logger || new Logger({
                enableColors: this.config.isDevelopment,
                logLevel: this.config.isDevelopment ? 'debug' : 'warn'
            });

            // Set up error statistics tracking object for monitoring and metrics
            this.errorStats = {
                totalErrors: 0,
                errorsByType: {
                    [ERROR_TYPES.PARSE_ERROR]: 0,
                    [ERROR_TYPES.ROUTE_ERROR]: 0,
                    [ERROR_TYPES.METHOD_ERROR]: 0,
                    [ERROR_TYPES.SERVER_ERROR]: 0,
                    [ERROR_TYPES.VALIDATION_ERROR]: 0
                },
                errorsBySeverity: {
                    [ERROR_SEVERITY_LEVELS.LOW]: 0,
                    [ERROR_SEVERITY_LEVELS.MEDIUM]: 0,
                    [ERROR_SEVERITY_LEVELS.HIGH]: 0,
                    [ERROR_SEVERITY_LEVELS.CRITICAL]: 0
                },
                httpStatusCodes: {},
                lastErrorTimestamp: null,
                startTime: new Date().toISOString()
            };

            // Configure development vs production error handling behavior
            this.isDevelopment = Boolean(options.isDevelopment || process.env.NODE_ENV === 'development');

            // Initialize error correlation and tracking capabilities
            this.correlationMap = new Map(); // Error ID to context mapping
            this.errorHistory = []; // Recent error history for pattern analysis

            // Set up error severity level mappings and thresholds
            this.severityThresholds = {
                alertingThreshold: ERROR_SEVERITY_LEVELS.HIGH,
                loggingThreshold: ERROR_SEVERITY_LEVELS.LOW,
                statisticsThreshold: ERROR_SEVERITY_LEVELS.LOW
            };

            // Log successful error handler initialization
            this.logger.debug('ErrorHandler initialized successfully', {
                config: this.config,
                isDevelopment: this.isDevelopment,
                statisticsEnabled: true
            });

        } catch (initializationError) {
            // Fallback initialization if primary initialization fails
            console.error(`ErrorHandler initialization failed: ${initializationError.message}`);
            
            this.config = DEFAULT_ERROR_CONFIG;
            this.logger = logger; // Use default logger
            this.errorStats = { totalErrors: 0, initializationFailed: true };
            this.isDevelopment = false;
            this.correlationMap = new Map();
            this.errorHistory = [];
        }
    }

    /**
     * Primary error handling method that processes errors, determines appropriate responses,
     * and manages error logging with full error lifecycle management. Implements comprehensive
     * error processing including classification, response generation, and monitoring integration.
     * 
     * @param {Error} error - Error object to process and handle
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {object} context - Additional error context and debugging information
     * @returns {void} Processes error and sends appropriate HTTP response to client
     */
    async handleError(error, request, response, context = {}) {
        try {
            // Generate unique error ID using generateErrorId for correlation tracking
            const requestId = context.requestId || request.headers['x-request-id'] || null;
            const errorId = generateErrorId('general', requestId);

            // Classify error using classifyError function for proper categorization
            const errorContext = {
                requestMethod: request.method,
                requestUrl: request.url,
                userAgent: request.headers['user-agent'],
                ...context
            };
            
            const classification = classifyError(error, errorContext);

            // Sanitize error message using sanitizeErrorMessage for secure client response
            const sanitizedMessage = sanitizeErrorMessage(error.message, {
                removePaths: true,
                removeStackTrace: true,
                genericFallback: true
            });

            // Format error for logging using formatErrorForLogging with full context
            const formattedError = formatErrorForLogging(error, {
                ...errorContext,
                headers: request.headers,
                remoteAddress: request.connection?.remoteAddress,
                timestamp: new Date().toISOString()
            }, requestId);

            // Log error with appropriate level based on severity using logger instance
            const logLevel = classification.logLevel;
            this.logger[logLevel]('Error handled by ErrorHandler', {
                errorId: errorId,
                classification: classification,
                formattedError: formattedError,
                requestInfo: {
                    method: request.method,
                    url: request.url,
                    userAgent: request.headers['user-agent']
                }
            });

            // Create error response using createErrorResponse utility function
            const errorResponse = createErrorResponse(
                classification.statusCode,
                sanitizedMessage,
                { errorId: errorId },
                {
                    customHeaders: classification.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED 
                        ? { 'Allow': 'GET' } : {},
                    sanitizeMessage: true
                }
            );

            // Send error response to client with proper headers and status code
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

            // Update error statistics for monitoring and performance tracking
            this._updateErrorStatistics(classification, errorId);

            // Store error correlation for debugging support
            if (this.config.enableErrorCorrelation) {
                this.correlationMap.set(errorId, {
                    error: error,
                    context: errorContext,
                    classification: classification,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (handlingError) {
            // Fallback error handling if primary handling fails
            this.logger.error('Error handling failed, using fallback', {
                handlingError: handlingError.message,
                originalError: error?.message
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles client errors (4xx status codes) including bad requests, not found, and method
     * not allowed errors with appropriate client-facing responses. Provides specialized
     * handling for client-side errors with proper HTTP status codes and security considerations.
     * 
     * @param {number} statusCode - HTTP status code in 4xx range
     * @param {string} errorMessage - Client error message for logging
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @param {object} context - Additional error context
     * @returns {void} Sends appropriate 4xx error response to client
     */
    async handleClientError(statusCode, errorMessage, request, response, context = {}) {
        try {
            // Validate status code is in 4xx range using isClientError function
            if (!isClientError(statusCode)) {
                throw new Error(`Invalid client error status code: ${statusCode}. Must be in 4xx range.`);
            }

            // Generate error correlation ID for tracking
            const requestId = context.requestId || request.headers['x-request-id'] || null;
            const errorId = generateErrorId('client', requestId);

            // Select appropriate error message from ERROR_MESSAGES constants
            let clientErrorMessage;
            switch (statusCode) {
                case HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST:
                    clientErrorMessage = BAD_REQUEST;
                    break;
                case HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND:
                    clientErrorMessage = NOT_FOUND;
                    break;
                case HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED:
                    clientErrorMessage = METHOD_NOT_ALLOWED;
                    break;
                default:
                    clientErrorMessage = BAD_REQUEST;
            }

            // Create client error response using createErrorResponse utility
            const customHeaders = {};
            if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
                customHeaders['Allow'] = 'GET'; // Hello endpoint only supports GET
            }

            const errorResponse = createErrorResponse(
                statusCode,
                clientErrorMessage,
                { errorId: errorId },
                { customHeaders: customHeaders }
            );

            // Log client error with WARN level for monitoring and analysis
            this.logger.warn('Client error handled', {
                statusCode: statusCode,
                message: errorMessage,
                clientMessage: clientErrorMessage,
                errorId: errorId,
                requestInfo: {
                    method: request.method,
                    url: request.url,
                    userAgent: request.headers['user-agent']
                }
            });

            // Send formatted client error response to client
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

            // Update client error statistics for monitoring
            this._updateErrorStatistics({
                type: ERROR_TYPES.ROUTE_ERROR, // Default client error type
                severity: ERROR_SEVERITY_LEVELS.MEDIUM,
                statusCode: statusCode,
                category: 'client_error'
            }, errorId);

        } catch (error) {
            this.logger.error('Client error handling failed', {
                error: error.message,
                statusCode: statusCode,
                originalMessage: errorMessage
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles server errors (5xx status codes) including internal server errors with secure
     * error responses and comprehensive internal logging. Implements secure server error handling
     * with generic client responses and detailed internal error tracking.
     * 
     * @param {Error} error - Error object causing server error
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object  
     * @param {object} context - Additional error context
     * @returns {void} Sends secure 5xx error response to client with internal error logging
     */
    async handleServerError(error, request, response, context = {}) {
        try {
            // Generate error correlation ID for internal tracking and debugging
            const requestId = context.requestId || request.headers['x-request-id'] || null;
            const errorId = generateErrorId('server', requestId);

            // Log full error details using logError method for comprehensive debugging
            await this.logError(error, {
                requestMethod: request.method,
                requestUrl: request.url,
                userAgent: request.headers['user-agent'],
                remoteAddress: request.connection?.remoteAddress,
                ...context
            }, requestId, { includeStackTrace: true });

            // Create generic server error response using HTTP_ERROR_MESSAGES.STATUS_500_MESSAGE
            const errorResponse = createErrorResponse(
                HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                STATUS_500_MESSAGE,
                { errorId: errorId },
                { sanitizeMessage: true }
            );

            // Ensure no sensitive information is exposed to client in error response
            this.logger.error('Server error occurred', {
                errorId: errorId,
                error: {
                    name: error.name,
                    message: error.message,
                    type: error.constructor.name
                },
                requestInfo: {
                    method: request.method,
                    url: request.url
                },
                securityNote: 'Sensitive details logged internally only'
            });

            // Send secure server error response with 500 status code
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

            // Alert monitoring systems for critical server error conditions
            if (this.config.enableErrorCorrelation) {
                this._alertOnCriticalError(error, errorId, context);
            }

            // Update server error statistics and metrics for monitoring
            this._updateErrorStatistics({
                type: ERROR_TYPES.SERVER_ERROR,
                severity: ERROR_SEVERITY_LEVELS.HIGH,
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                category: 'server_error'
            }, errorId);

        } catch (handlingError) {
            this.logger.error('Server error handling failed', {
                handlingError: handlingError.message,
                originalError: error?.message
            });

            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles HTTP request parsing errors with 400 Bad Request responses and appropriate
     * error logging for malformed requests. Specialized handling for HTTP protocol errors
     * and request format issues.
     * 
     * @param {Error} parseError - Parse error from HTTP request processing
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @returns {void} Sends 400 Bad Request response for HTTP parsing errors
     */
    async handleParseError(parseError, request, response) {
        try {
            // Classify parse error using ERROR_TYPES.PARSE_ERROR classification
            const errorId = generateErrorId(ERROR_TYPES.PARSE_ERROR);

            // Use ERROR_MESSAGES.BAD_REQUEST for consistent error messaging
            const errorResponse = createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                BAD_REQUEST,
                { errorId: errorId },
                { sanitizeMessage: true }
            );

            // Log parse error details for debugging malformed request issues
            this.logger.warn('HTTP parse error occurred', {
                errorId: errorId,
                error: {
                    name: parseError.name,
                    message: parseError.message
                },
                requestInfo: {
                    method: request.method || 'UNKNOWN',
                    url: request.url || 'UNKNOWN'
                }
            });

            // Send bad request response to client with proper error formatting
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

            // Update parse error statistics
            this._updateErrorStatistics({
                type: ERROR_TYPES.PARSE_ERROR,
                severity: ERROR_SEVERITY_LEVELS.MEDIUM,
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                category: 'client_error'
            }, errorId);

        } catch (error) {
            this.logger.error('Parse error handling failed', { error: error.message });
            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Handles route not found errors with 404 Not Found responses and appropriate logging
     * for unmatched routes. Provides specialized handling for routing errors with security
     * considerations to prevent information disclosure about existing routes.
     * 
     * @param {string} requestPath - Requested path that was not found
     * @param {object} request - HTTP request object
     * @param {object} response - HTTP response object
     * @returns {void} Sends 404 Not Found response for unmatched routes
     */
    async handleRouteError(requestPath, request, response) {
        try {
            // Generate error ID for route tracking
            const errorId = generateErrorId(ERROR_TYPES.ROUTE_ERROR);

            // Use ERROR_MESSAGES.ROUTE_NOT_FOUND for consistent route error messaging
            const errorResponse = createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                ROUTE_NOT_FOUND,
                { errorId: errorId },
                { sanitizeMessage: true }
            );

            // Log route not found event with requested path for monitoring
            this.logger.warn('Route not found', {
                errorId: errorId,
                requestedPath: requestPath,
                method: request.method,
                userAgent: request.headers['user-agent'],
                note: 'No information about existing routes disclosed'
            });

            // Ensure no information about existing routes is disclosed
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

            // Update route error statistics
            this._updateErrorStatistics({
                type: ERROR_TYPES.ROUTE_ERROR,
                severity: ERROR_SEVERITY_LEVELS.LOW,
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                category: 'client_error'
            }, errorId);

        } catch (error) {
            this.logger.error('Route error handling failed', { error: error.message });
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
     * @returns {void} Sends 405 Method Not Allowed response with Allow header
     */
    async handleMethodError(requestMethod, requestPath, request, response) {
        try {
            // Generate method error ID for tracking
            const errorId = generateErrorId(ERROR_TYPES.METHOD_ERROR);

            // Use ERROR_MESSAGES.UNSUPPORTED_METHOD for method error messaging
            const errorResponse = createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                UNSUPPORTED_METHOD,
                { errorId: errorId },
                {
                    customHeaders: { 'Allow': 'GET' }, // Hello endpoint supports only GET
                    sanitizeMessage: true
                }
            );

            // Log method not allowed event with method and path for monitoring
            this.logger.warn('HTTP method not allowed', {
                errorId: errorId,
                requestedMethod: requestMethod,
                requestedPath: requestPath,
                allowedMethods: ['GET'],
                userAgent: request.headers['user-agent']
            });

            // Send method not allowed response with proper HTTP compliance headers
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

            // Update method error statistics
            this._updateErrorStatistics({
                type: ERROR_TYPES.METHOD_ERROR,
                severity: ERROR_SEVERITY_LEVELS.MEDIUM,
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                category: 'client_error'
            }, errorId);

        } catch (error) {
            this.logger.error('Method error handling failed', { error: error.message });
            this._sendFallbackErrorResponse(response);
        }
    }

    /**
     * Creates comprehensive error response objects with proper status codes, sanitized messages,
     * and security headers for consistent error handling. Centralized error response creation
     * with validation and security considerations.
     * 
     * @param {number} statusCode - HTTP status code for error response
     * @param {string} errorMessage - Error message for response content
     * @param {object} errorContext - Additional error context and metadata
     * @param {object} options - Error response options and configuration
     * @returns {object} Complete error response object with status, headers, and sanitized content
     */
    createErrorResponse(statusCode, errorMessage, errorContext = {}, options = {}) {
        try {
            // Validate status code using isValidStatusCode for HTTP compliance
            if (!isValidStatusCode(statusCode)) {
                throw new Error(`Invalid status code for error response: ${statusCode}`);
            }

            // Sanitize error message using sanitizeErrorMessage for security
            const sanitizedMessage = sanitizeErrorMessage(errorMessage, {
                removePaths: true,
                removeStackTrace: true,
                genericFallback: true
            });

            // Create error response object using createErrorResponse utility function
            const errorResponse = createErrorResponse(
                statusCode,
                sanitizedMessage,
                errorContext,
                {
                    ...options,
                    sanitizeMessage: true
                }
            );

            // Add error-specific headers based on status code and error type
            const customHeaders = { ...options.customHeaders };
            
            // Include correlation ID for error tracking and debugging
            if (errorContext.errorId) {
                customHeaders['X-Error-ID'] = errorContext.errorId;
            }

            // Format response headers using formatHeaders utility function
            const formattedHeaders = formatHeaders({
                ...errorResponse.headers,
                ...customHeaders
            }, {
                includeSecurityHeaders: true,
                responseType: 'error'
            });

            // Return complete error response object ready for transmission
            return {
                statusCode: errorResponse.statusCode,
                headers: formattedHeaders,
                content: errorResponse.content,
                contentType: errorResponse.contentType,
                contentLength: errorResponse.contentLength
            };

        } catch (error) {
            this.logger.error('Error response creation failed', {
                error: error.message,
                statusCode: statusCode,
                errorMessage: errorMessage
            });

            // Return fallback error response
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
     * Logs errors with comprehensive context, correlation IDs, and appropriate log levels
     * for monitoring and debugging purposes. Provides centralized error logging with
     * structured format and correlation support.
     * 
     * @param {Error} error - Error object to log
     * @param {object} context - Error context and debugging information
     * @param {string} requestId - Request correlation ID for tracking
     * @param {object} options - Logging options and configuration
     * @returns {void} Logs error information with structured format for monitoring and debugging
     */
    async logError(error, context = {}, requestId = null, options = {}) {
        try {
            // Format error for logging using formatErrorForLogging function
            const formattedError = formatErrorForLogging(error, context, requestId);

            // Determine appropriate log level based on error severity and status code
            const classification = classifyError(error, context);
            const logLevel = classification.logLevel;

            // Include request correlation ID and context for debugging traceability
            const logContext = {
                formattedError: formattedError,
                classification: classification,
                requestId: requestId,
                options: options
            };

            // Use logger.logError method for structured error logging
            if (typeof this.logger.logError === 'function') {
                this.logger.logError(error, logContext, requestId);
            } else {
                // Fallback to regular log method with appropriate level
                this.logger[logLevel]('Error logged by ErrorHandler', logContext);
            }

            // Update error statistics and metrics for monitoring dashboards
            this._updateErrorStatistics(classification, formattedError.metadata?.errorHash);

            // Trigger alerts for critical errors if monitoring thresholds exceeded
            if (classification.severity >= this.severityThresholds.alertingThreshold) {
                this._alertOnCriticalError(error, formattedError.metadata?.errorHash, context);
            }

        } catch (loggingError) {
            // Fallback logging if structured error logging fails
            console.error('Structured error logging failed:', loggingError.message);
            console.error('Original error:', error?.message);
        }
    }

    /**
     * Retrieves error handling statistics including error counts by type, response times,
     * and error rates for monitoring and performance analysis. Provides comprehensive
     * error metrics for monitoring dashboards and performance assessment.
     * 
     * @returns {object} Error statistics with counts, rates, and performance metrics for monitoring
     */
    getErrorStats() {
        try {
            // Calculate uptime and error rates
            const uptime = Date.now() - new Date(this.errorStats.startTime).getTime();
            const uptimeInSeconds = uptime / 1000;
            const errorsPerSecond = this.errorStats.totalErrors > 0 ? 
                (this.errorStats.totalErrors / uptimeInSeconds).toFixed(4) : 0;

            // Aggregate error counts by type and status code from internal tracking
            const errorTypeDistribution = {};
            Object.keys(this.errorStats.errorsByType).forEach(type => {
                const count = this.errorStats.errorsByType[type];
                errorTypeDistribution[type] = {
                    count: count,
                    percentage: this.errorStats.totalErrors > 0 ? 
                        ((count / this.errorStats.totalErrors) * 100).toFixed(2) : 0
                };
            });

            // Calculate error rates and trends over time periods
            const severityDistribution = {};
            Object.keys(this.errorStats.errorsBySeverity).forEach(severity => {
                const count = this.errorStats.errorsBySeverity[severity];
                severityDistribution[severity] = {
                    count: count,
                    percentage: this.errorStats.totalErrors > 0 ? 
                        ((count / this.errorStats.totalErrors) * 100).toFixed(2) : 0
                };
            });

            // Include error handling performance metrics and response times
            const performanceMetrics = {
                totalErrors: this.errorStats.totalErrors,
                errorsPerSecond: parseFloat(errorsPerSecond),
                uptimeSeconds: Math.round(uptimeInSeconds),
                lastErrorTimestamp: this.errorStats.lastErrorTimestamp,
                correlationMapSize: this.correlationMap.size,
                errorHistorySize: this.errorHistory.length
            };

            // Format statistics for monitoring system consumption
            const statistics = {
                summary: performanceMetrics,
                errorsByType: errorTypeDistribution,
                errorsBySeverity: severityDistribution,
                httpStatusCodes: { ...this.errorStats.httpStatusCodes },
                configuration: {
                    includeStackTrace: this.config.includeStackTrace,
                    logErrorDetails: this.config.logErrorDetails,
                    sanitizeErrorMessages: this.config.sanitizeErrorMessages,
                    enableErrorCorrelation: this.config.enableErrorCorrelation,
                    isDevelopment: this.isDevelopment
                },
                thresholds: this.severityThresholds
            };

            // Return comprehensive error metrics object for dashboards and alerts
            return statistics;

        } catch (error) {
            this.logger.error('Error statistics generation failed', { error: error.message });
            
            return {
                error: 'Statistics generation failed',
                totalErrors: this.errorStats.totalErrors || 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Determines if an error condition is recoverable and whether the application should
     * continue processing or gracefully shut down. Implements error recovery assessment
     * for application stability and resilience.
     * 
     * @param {Error} error - Error object to assess for recoverability
     * @param {object} context - Error context for recovery assessment
     * @returns {boolean} True if error is recoverable and application can continue, false for critical errors
     */
    isErrorRecoverable(error, context = {}) {
        try {
            // Analyze error type and severity using error classification
            const classification = classifyError(error, context);
            
            // Critical errors that indicate system instability
            const criticalErrorPatterns = [
                'EADDRINUSE', // Port already in use
                'EMFILE',     // Too many open files
                'ENOMEM',     // Out of memory
                'Error: listen EADDRINUSE', // Server binding errors
                'ReferenceError', // Code errors
                'TypeError: Cannot read propert' // Null reference errors
            ];

            // Check if error matches critical patterns
            const errorMessage = error.message || '';
            const errorName = error.name || '';
            
            const isCriticalError = criticalErrorPatterns.some(pattern => 
                errorMessage.includes(pattern) || errorName.includes(pattern)
            );

            if (isCriticalError) {
                return false; // Not recoverable
            }

            // Check system resource availability and health status
            const memoryUsage = process.memoryUsage();
            const memoryThreshold = 500 * 1024 * 1024; // 500MB threshold
            
            if (memoryUsage.heapUsed > memoryThreshold) {
                this.logger.warn('High memory usage detected during error assessment', {
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
                    threshold: Math.round(memoryThreshold / 1024 / 1024) + 'MB'
                });
                return false; // System resource exhaustion
            }

            // Determine if error affects critical application functionality
            if (classification.severity >= ERROR_SEVERITY_LEVELS.CRITICAL) {
                return false; // Critical severity errors are not recoverable
            }

            // Consider error frequency and patterns for stability assessment
            const recentSimilarErrors = this.errorHistory.filter(historicalError => 
                historicalError.type === classification.type &&
                Date.now() - new Date(historicalError.timestamp).getTime() < 60000 // Last minute
            );

            if (recentSimilarErrors.length > 10) {
                this.logger.warn('High frequency of similar errors detected', {
                    errorType: classification.type,
                    count: recentSimilarErrors.length,
                    timeWindow: '1 minute'
                });
                return false; // Error pattern indicates system instability
            }

            // Client errors are generally recoverable
            if (classification.category === 'client_error') {
                return true;
            }

            // Server errors require individual assessment
            if (classification.category === 'server_error') {
                // Parse errors and validation errors are usually recoverable
                if (classification.type === ERROR_TYPES.PARSE_ERROR || 
                    classification.type === ERROR_TYPES.VALIDATION_ERROR) {
                    return true;
                }
                
                // Other server errors require careful consideration
                return classification.severity < ERROR_SEVERITY_LEVELS.HIGH;
            }

            // Return boolean indicating whether application can recover from error
            return true; // Default to recoverable for unknown cases

        } catch (assessmentError) {
            this.logger.error('Error recovery assessment failed', {
                assessmentError: assessmentError.message,
                originalError: error?.message
            });
            
            // Conservative approach: assume not recoverable if assessment fails
            return false;
        }
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Updates internal error statistics tracking.
     * @private
     */
    _updateErrorStatistics(classification, errorId) {
        try {
            this.errorStats.totalErrors++;
            this.errorStats.lastErrorTimestamp = new Date().toISOString();

            // Update error type statistics
            if (this.errorStats.errorsByType[classification.type] !== undefined) {
                this.errorStats.errorsByType[classification.type]++;
            }

            // Update severity statistics
            if (this.errorStats.errorsBySeverity[classification.severity] !== undefined) {
                this.errorStats.errorsBySeverity[classification.severity]++;
            }

            // Update HTTP status code statistics
            const statusCode = classification.statusCode;
            this.errorStats.httpStatusCodes[statusCode] = 
                (this.errorStats.httpStatusCodes[statusCode] || 0) + 1;

            // Maintain error history for pattern analysis
            this.errorHistory.push({
                type: classification.type,
                severity: classification.severity,
                statusCode: statusCode,
                errorId: errorId,
                timestamp: new Date().toISOString()
            });

            // Limit error history size to prevent memory issues
            if (this.errorHistory.length > 1000) {
                this.errorHistory = this.errorHistory.slice(-500); // Keep last 500
            }

        } catch (error) {
            // Fail silently for statistics updates to avoid recursive errors
            console.error('Error statistics update failed:', error.message);
        }
    }

    /**
     * Sends fallback error response when primary error handling fails.
     * @private
     */
    _sendFallbackErrorResponse(response) {
        try {
            const fallbackResponse = {
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                headers: {
                    'content-type': 'text/plain; charset=utf-8',
                    'content-length': Buffer.byteLength(INTERNAL_SERVER_ERROR).toString()
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
                // Connection may be broken - nothing more we can do
                console.error('Ultimate fallback failed:', finalError.message);
            }
        }
    }

    /**
     * Alerts on critical errors for monitoring systems.
     * @private
     */
    _alertOnCriticalError(error, errorId, context) {
        try {
            this.logger.error('CRITICAL ERROR ALERT', {
                errorId: errorId,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                context: context,
                timestamp: new Date().toISOString(),
                requiresImmediateAttention: true
            });

            // In production, this would integrate with monitoring systems
            // like DataDog, New Relic, or custom alerting systems

        } catch (alertError) {
            console.error('Critical error alerting failed:', alertError.message);
        }
    }
}

// ============================================================================
// HELPER UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitizes HTTP headers for logging by removing sensitive information.
 * @private
 */
function sanitizeHeaders(headers) {
    const sanitized = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    
    Object.keys(headers).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (sensitiveHeaders.includes(lowerKey)) {
            sanitized[key] = '[REDACTED]';
        } else {
            sanitized[key] = headers[key];
        }
    });
    
    return sanitized;
}

/**
 * Generates error hash for deduplication and tracking.
 * @private
 */
function generateErrorHash(error) {
    try {
        const hashInput = `${error.name}:${error.message}:${error.constructor.name}`;
        return Buffer.from(hashInput).toString('base64').substring(0, 16);
    } catch (e) {
        return Math.random().toString(36).substring(2, 18);
    }
}

/**
 * Generates random string for ID components.
 * @private
 */
function generateRandomString(length) {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
}

/**
 * Gets filtered environment variables for debugging.
 * @private
 */
function getFilteredEnvironment() {
    const filtered = {};
    const safeEnvVars = ['NODE_ENV', 'NODE_VERSION', 'PLATFORM', 'ARCH'];
    
    safeEnvVars.forEach(envVar => {
        if (process.env[envVar]) {
            filtered[envVar] = process.env[envVar];
        }
    });
    
    return filtered;
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export all error handling components for use throughout the Node.js tutorial application.
 * 
 * This module provides comprehensive error handling capabilities including:
 * - ErrorHandler class for complete error processing and response generation
 * - Error classification functions for proper error categorization and handling
 * - Error message sanitization for security and information disclosure prevention
 * - Error logging formatting for structured debugging and monitoring
 * - Error correlation ID generation for tracking and debugging support
 * - Global constants for error types, severity levels, and configuration
 * 
 * All components implement comprehensive error handling patterns with security
 * considerations, educational clarity, and production-ready error management.
 */

// Export main ErrorHandler class
export { ErrorHandler };

// Export utility functions for error processing
export { classifyError };
export { sanitizeErrorMessage };  
export { formatErrorForLogging };
export { generateErrorId };

// Export global constants for error management
export { ERROR_TYPES };
export { ERROR_SEVERITY_LEVELS };
export { DEFAULT_ERROR_CONFIG };

// Default export for convenient access to ErrorHandler
export default ErrorHandler;