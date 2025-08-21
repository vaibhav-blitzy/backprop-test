/**
 * HTTP Status Code Utility Module
 * 
 * Provides comprehensive HTTP status code constants, validation functions, and categorization
 * utilities for the Node.js tutorial application. Implements standardized HTTP status code
 * management with educational clarity while demonstrating production-ready HTTP protocol
 * compliance patterns.
 * 
 * This module centralizes status code definitions, provides validation utilities, and supports
 * proper HTTP response generation according to HTTP/1.1 specifications.
 * 
 * Educational Objectives:
 * - Demonstrates proper HTTP status code usage according to HTTP/1.1 specifications
 * - Shows standardized status code management for consistent response generation
 * - Illustrates proper error categorization using status code ranges
 * - Demonstrates input validation for HTTP status codes
 * - Shows effective utility module design for cross-cutting concerns
 * - Provides scalable status code management suitable for production applications
 */

/**
 * Comprehensive HTTP status code constants organized by category for standardized status management.
 * Follows HTTP/1.1 specification with commonly used status codes for web applications.
 * 
 * Categories:
 * - INFORMATIONAL (1xx): Request received, continuing process
 * - SUCCESS (2xx): Request successfully received, understood, and accepted
 * - REDIRECTION (3xx): Further action must be taken to complete the request
 * - CLIENT_ERROR (4xx): Request contains bad syntax or cannot be fulfilled
 * - SERVER_ERROR (5xx): Server failed to fulfill an apparently valid request
 */
const HTTP_STATUS_CODES = {
    // 1xx Informational - Request received, continuing process
    INFORMATIONAL: {
        CONTINUE: 100,
        SWITCHING_PROTOCOLS: 101,
        PROCESSING: 102,
        EARLY_HINTS: 103
    },

    // 2xx Success - Request successfully received, understood, and accepted
    SUCCESS: {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NON_AUTHORITATIVE_INFORMATION: 203,
        NO_CONTENT: 204,
        RESET_CONTENT: 205,
        PARTIAL_CONTENT: 206,
        MULTI_STATUS: 207,
        ALREADY_REPORTED: 208,
        IM_USED: 226
    },

    // 3xx Redirection - Further action must be taken to complete the request
    REDIRECTION: {
        MULTIPLE_CHOICES: 300,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        SEE_OTHER: 303,
        NOT_MODIFIED: 304,
        USE_PROXY: 305,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308
    },

    // 4xx Client Error - Request contains bad syntax or cannot be fulfilled
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        PAYMENT_REQUIRED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        PROXY_AUTHENTICATION_REQUIRED: 407,
        REQUEST_TIMEOUT: 408,
        CONFLICT: 409,
        GONE: 410,
        LENGTH_REQUIRED: 411,
        PRECONDITION_FAILED: 412,
        PAYLOAD_TOO_LARGE: 413,
        URI_TOO_LONG: 414,
        UNSUPPORTED_MEDIA_TYPE: 415,
        RANGE_NOT_SATISFIABLE: 416,
        EXPECTATION_FAILED: 417,
        IM_A_TEAPOT: 418,
        MISDIRECTED_REQUEST: 421,
        UNPROCESSABLE_ENTITY: 422,
        LOCKED: 423,
        FAILED_DEPENDENCY: 424,
        TOO_EARLY: 425,
        UPGRADE_REQUIRED: 426,
        PRECONDITION_REQUIRED: 428,
        TOO_MANY_REQUESTS: 429,
        REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
        UNAVAILABLE_FOR_LEGAL_REASONS: 451
    },

    // 5xx Server Error - Server failed to fulfill an apparently valid request
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        HTTP_VERSION_NOT_SUPPORTED: 505,
        VARIANT_ALSO_NEGOTIATES: 506,
        INSUFFICIENT_STORAGE: 507,
        LOOP_DETECTED: 508,
        NOT_EXTENDED: 510,
        NETWORK_AUTHENTICATION_REQUIRED: 511
    }
};

/**
 * Status code category constants for classification and response handling logic.
 * Maps status code ranges to standardized category names for consistent classification.
 */
const STATUS_CATEGORIES = {
    INFORMATIONAL: 'INFORMATIONAL',
    SUCCESS: 'SUCCESS', 
    REDIRECTION: 'REDIRECTION',
    CLIENT_ERROR: 'CLIENT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN'
};

/**
 * Standard HTTP status messages corresponding to status codes for consistent response messaging.
 * Follows HTTP/1.1 specification for official status code descriptions.
 */
const STATUS_MESSAGES = {
    // 1xx Informational
    100: 'Continue',
    101: 'Switching Protocols',
    102: 'Processing',
    103: 'Early Hints',

    // 2xx Success
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    207: 'Multi-Status',
    208: 'Already Reported',
    226: 'IM Used',

    // 3xx Redirection
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',

    // 4xx Client Error
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    418: "I'm a teapot",
    421: 'Misdirected Request',
    422: 'Unprocessable Entity',
    423: 'Locked',
    424: 'Failed Dependency',
    425: 'Too Early',
    426: 'Upgrade Required',
    428: 'Precondition Required',
    429: 'Too Many Requests',
    431: 'Request Header Fields Too Large',
    451: 'Unavailable For Legal Reasons',

    // 5xx Server Error
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
    506: 'Variant Also Negotiates',
    507: 'Insufficient Storage',
    508: 'Loop Detected',
    510: 'Not Extended',
    511: 'Network Authentication Required'
};

/**
 * Validates whether a given status code is a valid HTTP status code according to HTTP/1.1 
 * specifications and application requirements.
 * 
 * Performs comprehensive validation including:
 * - Type checking (must be a number)
 * - Range validation (100-599 inclusive)
 * - Existence verification in status codes mapping
 * 
 * @param {number} statusCode - The HTTP status code to validate
 * @returns {boolean} True if status code is valid HTTP status code, false otherwise
 */
function isValidStatusCode(statusCode) {
    // Check if statusCode is a number and not NaN
    if (typeof statusCode !== 'number' || isNaN(statusCode)) {
        return false;
    }

    // Validate status code is within valid HTTP range (100-599)
    if (statusCode < 100 || statusCode > 599) {
        return false;
    }

    // Check if status code exists in HTTP_STATUS_CODES object
    const allStatusCodes = new Set();
    Object.values(HTTP_STATUS_CODES).forEach(category => {
        Object.values(category).forEach(code => {
            allStatusCodes.add(code);
        });
    });

    // Return boolean result of validation checks
    return allStatusCodes.has(statusCode);
}

/**
 * Determines the category of an HTTP status code (Informational, Success, Redirection, 
 * Client Error, Server Error) for proper response handling and logging.
 * 
 * Uses status code ranges defined in HTTP/1.1 specification:
 * - 1xx: Informational responses
 * - 2xx: Successful responses  
 * - 3xx: Redirection messages
 * - 4xx: Client error responses
 * - 5xx: Server error responses
 * 
 * @param {number} statusCode - The HTTP status code to categorize
 * @returns {string} Status code category name for classification and handling logic
 */
function getStatusCategory(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        // Return 'UNKNOWN' for invalid status codes
        return STATUS_CATEGORIES.UNKNOWN;
    }

    // Determine category based on status code range (1xx, 2xx, 3xx, 4xx, 5xx)
    if (statusCode >= 100 && statusCode <= 199) {
        return STATUS_CATEGORIES.INFORMATIONAL;
    } else if (statusCode >= 200 && statusCode <= 299) {
        return STATUS_CATEGORIES.SUCCESS;
    } else if (statusCode >= 300 && statusCode <= 399) {
        return STATUS_CATEGORIES.REDIRECTION;
    } else if (statusCode >= 400 && statusCode <= 499) {
        return STATUS_CATEGORIES.CLIENT_ERROR;
    } else if (statusCode >= 500 && statusCode <= 599) {
        return STATUS_CATEGORIES.SERVER_ERROR;
    }

    // Return appropriate category string from STATUS_CATEGORIES mapping
    return STATUS_CATEGORIES.UNKNOWN;
}

/**
 * Retrieves the standard HTTP status message for a given status code according to 
 * HTTP/1.1 specifications.
 * 
 * Provides standardized status messages that correspond to official HTTP status code
 * descriptions for consistent response messaging across the application.
 * 
 * @param {number} statusCode - The HTTP status code to get message for
 * @returns {string} Standard HTTP status message for the given status code
 */
function getStatusMessage(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        // Return 'Unknown Status' for invalid or undefined status codes
        return 'Unknown Status';
    }

    // Look up status message in STATUS_MESSAGES object
    const message = STATUS_MESSAGES[statusCode];
    
    // Return standard HTTP message for status code
    return message || 'Unknown Status';
}

/**
 * Determines if a status code represents a successful HTTP response (2xx range) 
 * for response handling logic.
 * 
 * Success status codes indicate that the client's request was successfully received,
 * understood, and accepted by the server.
 * 
 * @param {number} statusCode - The HTTP status code to check
 * @returns {boolean} True if status code is in 2xx success range, false otherwise
 */
function isSuccessStatus(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        return false;
    }

    // Check if status code is between 200 and 299 inclusive
    // Return boolean result of range check
    return statusCode >= 200 && statusCode <= 299;
}

/**
 * Determines if a status code represents a client error (4xx range) for error 
 * handling and response generation.
 * 
 * Client error status codes indicate that the client seems to have made an error
 * in the request that prevents the server from processing it.
 * 
 * @param {number} statusCode - The HTTP status code to check
 * @returns {boolean} True if status code is in 4xx client error range, false otherwise
 */
function isClientError(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        return false;
    }

    // Check if status code is between 400 and 499 inclusive
    // Return boolean result of client error range check
    return statusCode >= 400 && statusCode <= 499;
}

/**
 * Determines if a status code represents a server error (5xx range) for error 
 * handling and monitoring.
 * 
 * Server error status codes indicate that the server failed to fulfill an 
 * apparently valid request due to server-side issues.
 * 
 * @param {number} statusCode - The HTTP status code to check
 * @returns {boolean} True if status code is in 5xx server error range, false otherwise
 */
function isServerError(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        return false;
    }

    // Check if status code is between 500 and 599 inclusive
    // Return boolean result of server error range check
    return statusCode >= 500 && statusCode <= 599;
}

/**
 * Determines if a status code represents a redirection response (3xx range) 
 * for response handling completeness.
 * 
 * Redirection status codes indicate that further action needs to be taken 
 * by the user agent to fulfill the request.
 * 
 * @param {number} statusCode - The HTTP status code to check
 * @returns {boolean} True if status code is in 3xx redirect range, false otherwise
 */
function isRedirectStatus(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        return false;
    }

    // Check if status code is between 300 and 399 inclusive
    // Return boolean result of redirect range check
    return statusCode >= 300 && statusCode <= 399;
}

/**
 * Formats a complete HTTP status line with status code and message for response generation.
 * 
 * Creates a properly formatted HTTP/1.1 status line according to HTTP specification:
 * HTTP-Version SP Status-Code SP Reason-Phrase CRLF
 * 
 * @param {number} statusCode - The HTTP status code to format
 * @returns {string} Formatted HTTP status line with code and message
 */
function formatStatusLine(statusCode) {
    // Validate status code using isValidStatusCode function
    if (!isValidStatusCode(statusCode)) {
        return 'HTTP/1.1 500 Internal Server Error';
    }

    // Get status message using getStatusMessage function
    const message = getStatusMessage(statusCode);
    
    // Format status line as 'HTTP/1.1 {code} {message}'
    // Return formatted status line string
    return `HTTP/1.1 ${statusCode} ${message}`;
}

/**
 * Comprehensive HTTP status code handler class providing advanced status code management,
 * validation, and categorization capabilities for the Node.js tutorial application with 
 * educational patterns and production-ready features.
 * 
 * This class encapsulates HTTP status code functionality with enhanced features including:
 * - Custom validation rules and status code mappings
 * - Flexible categorization with custom category support
 * - Enhanced error detection with configurable ranges
 * - Status response formatting with metadata
 * - Metrics collection for monitoring and analysis
 */
class HttpStatusHandler {
    /**
     * Initializes the HttpStatusHandler with status code mappings, validation rules, 
     * and categorization logic for comprehensive status management.
     * 
     * @param {object} options - Configuration options for the status handler
     * @param {object} options.customStatusCodes - Custom status code definitions
     * @param {object} options.customMessages - Custom status message overrides
     * @param {object} options.customCategories - Custom category definitions
     * @param {object} options.validationRules - Custom validation rules
     * @param {boolean} options.enableMetrics - Enable status code usage tracking
     */
    constructor(options = {}) {
        // Initialize status codes object with HTTP_STATUS_CODES constants
        this.statusCodes = { ...HTTP_STATUS_CODES, ...(options.customStatusCodes || {}) };
        
        // Set up status messages mapping from STATUS_MESSAGES object
        this.statusMessages = { ...STATUS_MESSAGES, ...(options.customMessages || {}) };
        
        // Configure status code categories from STATUS_CATEGORIES mapping
        this.categories = { ...STATUS_CATEGORIES, ...(options.customCategories || {}) };
        
        // Initialize validation rules for status code checking
        this.validationRules = {
            minStatusCode: 100,
            maxStatusCode: 599,
            strictMode: false,
            ...options.validationRules
        };
        
        // Set up default options for status handling behavior
        this.options = {
            enableMetrics: false,
            enableLogging: false,
            defaultErrorCode: 500,
            ...options
        };
        
        // Initialize metrics tracking if enabled
        if (this.options.enableMetrics) {
            this.metrics = {
                totalRequests: 0,
                statusCodeCounts: {},
                categoryStats: {
                    [STATUS_CATEGORIES.INFORMATIONAL]: 0,
                    [STATUS_CATEGORIES.SUCCESS]: 0,
                    [STATUS_CATEGORIES.REDIRECTION]: 0,
                    [STATUS_CATEGORIES.CLIENT_ERROR]: 0,
                    [STATUS_CATEGORIES.SERVER_ERROR]: 0
                },
                lastReset: new Date()
            };
        }
    }

    /**
     * Instance method for validating HTTP status codes with enhanced validation logic 
     * and custom validation rules.
     * 
     * @param {number} statusCode - The HTTP status code to validate
     * @returns {boolean} True if status code is valid according to HTTP specifications and validation rules
     */
    isValidStatusCode(statusCode) {
        // Apply validation rules configured during initialization
        if (typeof statusCode !== 'number' || isNaN(statusCode)) {
            return false;
        }

        // Check status code against HTTP/1.1 specification
        if (statusCode < this.validationRules.minStatusCode || 
            statusCode > this.validationRules.maxStatusCode) {
            return false;
        }

        // Validate status code exists in internal status codes mapping
        if (this.validationRules.strictMode) {
            const allCodes = new Set();
            Object.values(this.statusCodes).forEach(category => {
                Object.values(category).forEach(code => allCodes.add(code));
            });
            return allCodes.has(statusCode);
        }

        // Return comprehensive validation result
        return true;
    }

    /**
     * Retrieves HTTP status message with optional custom message support and fallback handling.
     * 
     * @param {number} statusCode - The HTTP status code to get message for
     * @returns {string} HTTP status message for the given status code with fallback support
     */
    getStatusMessage(statusCode) {
        // Validate status code using instance validation method
        if (!this.isValidStatusCode(statusCode)) {
            return 'Unknown Status';
        }

        // Look up status message in internal status messages mapping
        // Apply custom message overrides if configured
        const message = this.statusMessages[statusCode];
        
        // Return appropriate status message with fallback handling
        return message || `Status ${statusCode}`;
    }

    /**
     * Determines status code category with enhanced categorization logic and custom category support.
     * 
     * @param {number} statusCode - The HTTP status code to categorize
     * @returns {string} Status code category with enhanced classification
     */
    getStatusCategory(statusCode) {
        // Validate status code using instance validation
        if (!this.isValidStatusCode(statusCode)) {
            return this.categories.UNKNOWN;
        }

        // Apply categorization rules from internal categories mapping
        // Handle custom category definitions if configured
        if (statusCode >= 100 && statusCode <= 199) {
            return this.categories.INFORMATIONAL;
        } else if (statusCode >= 200 && statusCode <= 299) {
            return this.categories.SUCCESS;
        } else if (statusCode >= 300 && statusCode <= 399) {
            return this.categories.REDIRECTION;
        } else if (statusCode >= 400 && statusCode <= 499) {
            return this.categories.CLIENT_ERROR;
        } else if (statusCode >= 500 && statusCode <= 599) {
            return this.categories.SERVER_ERROR;
        }

        // Return appropriate category classification
        return this.categories.UNKNOWN;
    }

    /**
     * Enhanced client error detection with configurable error ranges and custom client error definitions.
     * 
     * @param {number} statusCode - The HTTP status code to check
     * @returns {boolean} True if status code represents client error with enhanced detection logic
     */
    isClientError(statusCode) {
        // Validate status code using instance validation
        if (!this.isValidStatusCode(statusCode)) {
            return false;
        }

        // Check against client error range (4xx) with custom ranges
        // Apply custom client error definitions if configured
        const category = this.getStatusCategory(statusCode);
        
        // Return enhanced client error detection result
        return category === this.categories.CLIENT_ERROR;
    }

    /**
     * Enhanced server error detection with configurable error ranges and monitoring integration.
     * 
     * @param {number} statusCode - The HTTP status code to check
     * @returns {boolean} True if status code represents server error with enhanced detection logic
     */
    isServerError(statusCode) {
        // Validate status code using instance validation
        if (!this.isValidStatusCode(statusCode)) {
            return false;
        }

        // Check against server error range (5xx) with custom ranges
        const category = this.getStatusCategory(statusCode);
        
        // Apply monitoring and alerting logic for server errors
        if (category === this.categories.SERVER_ERROR && this.options.enableLogging) {
            console.warn(`Server error detected: ${statusCode} - ${this.getStatusMessage(statusCode)}`);
        }

        // Return enhanced server error detection result
        return category === this.categories.SERVER_ERROR;
    }

    /**
     * Creates formatted status response object with status code, message, and metadata 
     * for comprehensive response handling.
     * 
     * @param {number} statusCode - The HTTP status code to format
     * @param {object} options - Additional options for response formatting
     * @returns {object} Formatted status response object with comprehensive status information
     */
    formatStatusResponse(statusCode, options = {}) {
        // Validate status code and extract status information
        const isValid = this.isValidStatusCode(statusCode);
        const effectiveCode = isValid ? statusCode : this.options.defaultErrorCode;
        
        // Get status message and category using instance methods
        const message = this.getStatusMessage(effectiveCode);
        const category = this.getStatusCategory(effectiveCode);
        
        // Create formatted response object with status metadata
        const response = {
            statusCode: effectiveCode,
            statusMessage: message,
            category: category,
            isSuccess: category === this.categories.SUCCESS,
            isClientError: category === this.categories.CLIENT_ERROR,
            isServerError: category === this.categories.SERVER_ERROR,
            isRedirect: category === this.categories.REDIRECTION,
            timestamp: new Date().toISOString(),
            formattedStatusLine: `HTTP/1.1 ${effectiveCode} ${message}`
        };

        // Include additional context and options if provided
        if (options.includeMetadata) {
            response.metadata = {
                validationPassed: isValid,
                originalStatusCode: statusCode,
                handlerConfig: {
                    strictMode: this.validationRules.strictMode,
                    metricsEnabled: this.options.enableMetrics
                }
            };
        }

        // Update metrics if enabled
        if (this.options.enableMetrics) {
            this._updateMetrics(effectiveCode, category);
        }

        // Return comprehensive status response object
        return response;
    }

    /**
     * Retrieves status code usage metrics and statistics for monitoring and analysis purposes.
     * 
     * @returns {object} Status code metrics including usage statistics and categorization data
     */
    getStatusMetrics() {
        if (!this.options.enableMetrics || !this.metrics) {
            return { error: 'Metrics not enabled' };
        }

        // Aggregate status code usage data from internal tracking
        // Calculate statistics by category (success, client error, server error)
        const totalRequests = this.metrics.totalRequests;
        const categoryPercentages = {};
        
        Object.entries(this.metrics.categoryStats).forEach(([category, count]) => {
            categoryPercentages[category] = totalRequests > 0 ? (count / totalRequests * 100).toFixed(2) : 0;
        });

        // Include performance metrics and response time data
        const uptime = Date.now() - this.metrics.lastReset.getTime();
        
        // Format metrics data for monitoring system consumption
        // Return comprehensive status metrics object
        return {
            summary: {
                totalRequests,
                uptime: `${Math.floor(uptime / 1000)}s`,
                averageRequestsPerSecond: totalRequests > 0 ? (totalRequests / (uptime / 1000)).toFixed(2) : 0
            },
            categoryStats: this.metrics.categoryStats,
            categoryPercentages,
            topStatusCodes: Object.entries(this.metrics.statusCodeCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([code, count]) => ({
                    statusCode: parseInt(code),
                    count,
                    message: this.getStatusMessage(parseInt(code)),
                    percentage: totalRequests > 0 ? (count / totalRequests * 100).toFixed(2) : 0
                })),
            lastReset: this.metrics.lastReset.toISOString()
        };
    }

    /**
     * Internal method to update metrics tracking for status code usage.
     * 
     * @private
     * @param {number} statusCode - The status code to track
     * @param {string} category - The category of the status code
     */
    _updateMetrics(statusCode, category) {
        if (!this.metrics) return;

        this.metrics.totalRequests++;
        
        // Track individual status code usage
        this.metrics.statusCodeCounts[statusCode] = 
            (this.metrics.statusCodeCounts[statusCode] || 0) + 1;
        
        // Track category statistics
        if (this.metrics.categoryStats[category] !== undefined) {
            this.metrics.categoryStats[category]++;
        }
    }
}

// Export all constants, functions, and classes for use throughout the application
module.exports = {
    // Global constants for HTTP status code management
    HTTP_STATUS_CODES,
    STATUS_CATEGORIES,
    STATUS_MESSAGES,
    
    // Utility functions for status code validation and categorization
    isValidStatusCode,
    getStatusCategory,
    getStatusMessage,
    isSuccessStatus,
    isClientError,
    isServerError,
    isRedirectStatus,
    formatStatusLine,
    
    // Advanced status code handler class
    HttpStatusHandler
};