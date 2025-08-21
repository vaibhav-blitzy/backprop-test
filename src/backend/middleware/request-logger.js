/**
 * Request Logging Middleware for Node.js Tutorial Application
 * 
 * Provides comprehensive HTTP request and response logging with structured output, performance
 * monitoring, and correlation tracking. Implements educational logging patterns while demonstrating
 * production-ready middleware architecture including request parsing, timing measurement,
 * security-safe logging, and integration with the application's logging system.
 * 
 * This middleware serves as an essential observability component in the middleware stack for
 * monitoring HTTP server operations and debugging request processing. It demonstrates:
 * - HTTP request/response lifecycle logging with correlation tracking
 * - Performance monitoring using Node.js performance hooks
 * - Security-safe header filtering to prevent sensitive data exposure
 * - Educational middleware patterns for production-ready applications
 * - Integration with centralized logging system and application configuration
 * - Request processing pipeline integration with timing and metrics collection
 * 
 * Educational Objectives:
 * - Demonstrates proper middleware implementation patterns in Node.js applications
 * - Shows comprehensive request/response logging for debugging and monitoring
 * - Illustrates performance measurement using Node.js built-in performance APIs
 * - Provides examples of security-conscious logging with sensitive data filtering
 * - Shows correlation tracking for request-response debugging and monitoring
 * - Demonstrates production-ready observability patterns for web applications
 * 
 * @fileoverview Request logging middleware with comprehensive HTTP monitoring and observability
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import central logging system for structured HTTP request/response logging
import { Logger } from '../utils/logger.js';

// Import request utility functions for parsing and extracting HTTP request components
import { 
    parseRequestMethod,
    parseRequestUrl, 
    extractRequestMetadata 
} from '../utils/request-utils.js';

// Import HTTP method constants for request method validation and classification
import { HTTP_METHODS } from '../constants/http-methods.js';

// Import response utility functions for generating unique response correlation IDs
import { generateResponseId } from '../utils/response-utils.js';

// Import Node.js built-in performance hooks for accurate request timing measurement
import { performance } from 'node:perf_hooks'; // Node.js v20.x - Performance measurement utilities

// Import Node.js crypto module for generating secure correlation IDs and request tracking
import { crypto } from 'node:crypto'; // Node.js v20.x - Cryptographic functionality

// ============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Request logger configuration with defaults for enabling various logging features
 * and controlling logging behavior throughout the HTTP request/response lifecycle.
 */
const REQUEST_LOGGER_CONFIG = {
    enableRequestLogging: true,      // Enable detailed HTTP request logging
    enableResponseLogging: true,     // Enable HTTP response logging with timing
    enableTimingLogging: true,       // Enable performance timing measurement
    logLevel: 'INFO',               // Default log level for request logging
    excludeHeaders: ['authorization', 'cookie', 'session'] // Headers to filter for security
};

/**
 * Default timing thresholds for performance monitoring and alerting.
 * Used to categorize response times and generate performance warnings.
 */
const DEFAULT_TIMING_THRESHOLDS = {
    warnThreshold: 100,     // Threshold in milliseconds for performance warnings
    errorThreshold: 1000,   // Threshold in milliseconds for performance errors
    measurementUnit: 'milliseconds' // Unit of measurement for timing data
};

/**
 * Log correlation configuration for request-response tracking and debugging.
 * Enables correlation ID generation and tracking throughout request lifecycle.
 */
const LOG_CORRELATION_CONFIG = {
    enableCorrelation: true,            // Enable correlation ID generation and tracking
    correlationHeader: 'x-correlation-id', // HTTP header name for correlation ID
    generateIds: true,                  // Automatically generate correlation IDs
    includeInResponse: true             // Include correlation ID in response headers
};

// ============================================================================
// UTILITY FUNCTIONS FOR REQUEST LOGGING AND PROCESSING
// ============================================================================

/**
 * Generates unique correlation IDs for request-response tracking using secure random generation
 * with timestamp components for debugging and monitoring. Provides unique identifiers for
 * correlating requests with their corresponding responses throughout the application lifecycle.
 * 
 * @param {Object} [options={}] - Configuration options for correlation ID generation
 * @param {boolean} [options.includeTimestamp=true] - Include timestamp component in ID
 * @param {string} [options.prefix='req'] - Prefix for correlation ID formatting
 * @returns {string} Unique correlation ID for request tracking and debugging
 * 
 * @example
 * const correlationId = generateCorrelationId();
 * console.log(correlationId); // "req-1234567890123-a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 */
export function generateCorrelationId(options = {}) {
    try {
        // Configure correlation ID generation options with defaults
        const includeTimestamp = options.includeTimestamp !== false;
        const prefix = options.prefix || 'req';
        
        // Generate secure random UUID using Node.js crypto module
        const secureUuid = crypto.randomUUID();
        
        // Add timestamp component for temporal correlation and sorting
        const timestamp = includeTimestamp ? Date.now().toString() : '';
        
        // Format correlation ID with standard pattern for consistency
        const correlationId = includeTimestamp ? 
            `${prefix}-${timestamp}-${secureUuid}` : 
            `${prefix}-${secureUuid}`;
        
        // Validate correlation ID format and uniqueness requirements
        if (!correlationId || correlationId.length < 10) {
            throw new Error('Generated correlation ID is invalid or too short');
        }
        
        // Return formatted correlation ID for request tracking
        return correlationId;
        
    } catch (error) {
        // Fallback to simple timestamp-based ID if UUID generation fails
        const fallbackId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.warn(`Correlation ID generation failed, using fallback: ${fallbackId}`);
        return fallbackId;
    }
}

/**
 * Filters sensitive information from HTTP headers for security-safe logging by removing
 * authorization tokens, cookies, and other sensitive data. Implements comprehensive header
 * filtering to prevent accidental exposure of sensitive information in log outputs.
 * 
 * @param {Object} headers - HTTP headers object to filter
 * @param {Array} [excludeList=REQUEST_LOGGER_CONFIG.excludeHeaders] - Custom headers to exclude
 * @returns {Object} Filtered headers object with sensitive information removed
 * 
 * @example
 * const headers = { 'content-type': 'text/plain', 'authorization': 'Bearer token123' };
 * const filtered = filterSensitiveHeaders(headers);
 * console.log(filtered); // { 'content-type': 'text/plain', 'authorization': '[FILTERED]' }
 */
export function filterSensitiveHeaders(headers, excludeList = REQUEST_LOGGER_CONFIG.excludeHeaders) {
    try {
        // Validate headers input and create defensive copy
        if (!headers || typeof headers !== 'object') {
            return {};
        }
        
        // Create copy of headers object to avoid modifying original request
        const filteredHeaders = { ...headers };
        
        // Apply default exclusion list including authorization, cookie, session headers
        const defaultExclusions = REQUEST_LOGGER_CONFIG.excludeHeaders;
        
        // Apply custom exclusion list from configuration or parameters
        const combinedExclusions = [
            ...defaultExclusions,
            ...(Array.isArray(excludeList) ? excludeList : [])
        ];
        
        // Process each header key with case-insensitive matching
        Object.keys(filteredHeaders).forEach(headerKey => {
            const lowerHeaderKey = headerKey.toLowerCase();
            
            // Check if header matches any exclusion pattern
            const shouldFilter = combinedExclusions.some(excludePattern => {
                const lowerPattern = excludePattern.toLowerCase();
                return lowerHeaderKey.includes(lowerPattern) || lowerHeaderKey === lowerPattern;
            });
            
            // Mask sensitive header values instead of removing them completely
            if (shouldFilter) {
                filteredHeaders[headerKey] = '[FILTERED]';
            }
        });
        
        // Preserve header structure while ensuring security-safe logging
        return filteredHeaders;
        
    } catch (error) {
        // Return empty object if filtering fails to prevent data exposure
        console.warn(`Header filtering failed: ${error.message}`);
        return {};
    }
}

/**
 * Formats log messages for request/response logging with consistent structure, readable output,
 * and educational clarity for debugging and monitoring. Implements standardized message formatting
 * for consistent log output across all request logging operations.
 * 
 * @param {string} messageType - Type of message (request, response, error)
 * @param {Object} logData - Data object containing log information
 * @param {Object} [options={}] - Formatting options for message structure
 * @returns {string} Formatted log message with structured information and consistent formatting
 * 
 * @example
 * const message = formatLogMessage('request', { method: 'GET', url: '/hello' });
 * console.log(message); // "HTTP Request: GET /hello"
 */
export function formatLogMessage(messageType, logData, options = {}) {
    try {
        // Determine message type (request, response, error) for appropriate formatting
        const normalizedType = messageType.toString().toLowerCase();
        
        // Extract key log data components and format for readability
        let formattedMessage = '';
        
        switch (normalizedType) {
            case 'request':
                // Format HTTP request messages with method and URL
                formattedMessage = `HTTP Request: ${logData.method || 'UNKNOWN'} ${logData.url || '/'}`;
                break;
                
            case 'response':
                // Format HTTP response messages with status code and timing
                formattedMessage = `HTTP Response: ${logData.statusCode || 'UNKNOWN'}`;
                if (logData.duration) {
                    formattedMessage += ` (${logData.duration}ms)`;
                }
                break;
                
            case 'error':
                // Format error messages with error type and context
                formattedMessage = `Error: ${logData.error || logData.message || 'Unknown error'}`;
                break;
                
            default:
                // Generic message formatting for other message types
                formattedMessage = `${messageType}: ${logData.message || JSON.stringify(logData)}`;
                break;
        }
        
        // Apply consistent formatting pattern for educational clarity
        if (options.includeTimestamp) {
            formattedMessage = `[${new Date().toISOString()}] ${formattedMessage}`;
        }
        
        // Include correlation ID and timing information in message structure
        if (logData.correlationId) {
            formattedMessage += ` [ID: ${logData.correlationId}]`;
        }
        
        // Format message with appropriate level and context information
        if (options.includeContext && logData.context) {
            formattedMessage += ` | Context: ${JSON.stringify(logData.context)}`;
        }
        
        // Return formatted log message ready for console output
        return formattedMessage;
        
    } catch (error) {
        // Return safe fallback message if formatting fails
        return `[Message formatting error] ${messageType}: ${JSON.stringify(logData)}`;
    }
}

/**
 * Measures request processing time with high precision using Node.js performance hooks for
 * accurate timing and performance monitoring. Provides comprehensive timing analysis with
 * performance classification and threshold comparison.
 * 
 * @param {number} startTime - Request start time from performance.now()
 * @param {number} endTime - Request end time from performance.now()
 * @returns {Object} Timing measurement object with duration and performance metrics
 * 
 * @example
 * const start = performance.now();
 * // ... request processing ...
 * const end = performance.now();
 * const timing = measureRequestTiming(start, end);
 * console.log(timing); // { duration: 45.2, classification: 'normal', unit: 'milliseconds' }
 */
export function measureRequestTiming(startTime, endTime) {
    try {
        // Calculate duration using performance.now() timestamps for accuracy
        const durationMs = endTime - startTime;
        
        // Convert timing measurements to milliseconds for standard reporting
        const duration = Math.round(durationMs * 100) / 100; // Round to 2 decimal places
        
        // Compare timing against configured thresholds for performance alerts
        let classification = 'normal';
        if (duration >= DEFAULT_TIMING_THRESHOLDS.errorThreshold) {
            classification = 'critical';
        } else if (duration >= DEFAULT_TIMING_THRESHOLDS.warnThreshold) {
            classification = 'slow';
        } else if (duration < 10) {
            classification = 'fast';
        }
        
        // Create timing object with duration and performance characteristics
        const timingObject = {
            duration: duration,
            classification: classification,
            unit: DEFAULT_TIMING_THRESHOLDS.measurementUnit,
            startTime: startTime,
            endTime: endTime,
            thresholds: {
                warnThreshold: DEFAULT_TIMING_THRESHOLDS.warnThreshold,
                errorThreshold: DEFAULT_TIMING_THRESHOLDS.errorThreshold
            }
        };
        
        // Include timing classification (fast, normal, slow) for monitoring
        timingObject.performanceCategory = classification;
        
        // Add performance flags for alerting and monitoring
        timingObject.isSlowRequest = duration >= DEFAULT_TIMING_THRESHOLDS.warnThreshold;
        timingObject.isCriticalRequest = duration >= DEFAULT_TIMING_THRESHOLDS.errorThreshold;
        
        // Return timing measurement object for logging and metrics
        return timingObject;
        
    } catch (error) {
        // Return fallback timing object if measurement fails
        console.warn(`Timing measurement failed: ${error.message}`);
        return {
            duration: 0,
            classification: 'unknown',
            unit: DEFAULT_TIMING_THRESHOLDS.measurementUnit,
            error: 'Timing measurement failed'
        };
    }
}

/**
 * Logs detailed HTTP request information including method, URL, headers, and client data
 * with security-safe formatting and structured output. Provides comprehensive request
 * logging with correlation tracking and client identification for debugging.
 * 
 * @param {Object} request - HTTP request object from Node.js server
 * @param {string} correlationId - Unique correlation ID for request tracking
 * @param {Object} requestMetadata - Additional request metadata and context
 * @returns {void} Logs structured request information to console output
 * 
 * @example
 * logRequestDetails(req, 'req-123-uuid', { clientIp: '127.0.0.1' });
 */
export function logRequestDetails(request, correlationId, requestMetadata) {
    try {
        // Extract HTTP method using parseRequestMethod and normalize for logging
        const httpMethod = parseRequestMethod(request);
        
        // Parse URL components using parseRequestUrl for structured path logging
        const urlComponents = parseRequestUrl(request);
        
        // Filter sensitive headers from request headers for security-safe logging
        const filteredHeaders = filterSensitiveHeaders(request.headers);
        
        // Format client information including IP address and user agent
        const clientInfo = {
            ip: request.connection?.remoteAddress || 'unknown',
            port: request.connection?.remotePort || 'unknown',
            userAgent: request.headers?.['user-agent'] || 'unknown',
            httpVersion: request.httpVersion || '1.1'
        };
        
        // Create structured log entry with correlation ID and request context
        const requestLogData = {
            correlationId: correlationId,
            method: httpMethod,
            url: urlComponents.fullUrl,
            path: urlComponents.pathname,
            query: urlComponents.query,
            headers: filteredHeaders,
            client: clientInfo,
            metadata: requestMetadata || {},
            timestamp: new Date().toISOString()
        };
        
        // Initialize logger instance for HTTP request logging
        const logger = new Logger();
        
        // Log request details using Logger.logHttpRequest method with INFO level
        logger.logHttpRequest(request, correlationId, {
            requestData: requestLogData,
            logLevel: 'INFO'
        });
        
        // Include request timestamp and processing context for debugging
        logger.info(formatLogMessage('request', requestLogData), {
            correlationId: correlationId,
            requestProcessing: true
        });
        
    } catch (error) {
        // Handle logging errors gracefully without interrupting request processing
        const fallbackLogger = new Logger();
        fallbackLogger.error('Failed to log request details', {
            correlationId: correlationId,
            error: error.message
        }, error);
    }
}

/**
 * Logs HTTP response information including status code, processing time, and performance
 * metrics with correlation to original request for monitoring and debugging. Provides
 * comprehensive response logging with timing analysis and performance categorization.
 * 
 * @param {Object} response - HTTP response object from Node.js server
 * @param {number} statusCode - HTTP status code for the response
 * @param {number} duration - Request processing duration in milliseconds
 * @param {string} correlationId - Correlation ID linking to original request
 * @returns {void} Logs structured response information with performance data
 * 
 * @example
 * logResponseDetails(res, 200, 45.2, 'req-123-uuid');
 */
export function logResponseDetails(response, statusCode, duration, correlationId) {
    try {
        // Calculate request processing duration from start time to completion
        const timingData = measureRequestTiming(0, duration); // Duration already calculated
        
        // Extract response status code and categorize response type (success/error)
        const responseCategory = statusCode >= 200 && statusCode < 300 ? 'success' : 
                               statusCode >= 400 && statusCode < 500 ? 'client_error' : 
                               statusCode >= 500 ? 'server_error' : 'informational';
        
        // Generate response metadata including timing and performance information
        const responseLogData = {
            correlationId: correlationId,
            statusCode: statusCode,
            statusMessage: response.statusMessage || 'Unknown',
            category: responseCategory,
            duration: `${duration}ms`,
            timing: timingData,
            headers: filterSensitiveHeaders(response.getHeaders()),
            timestamp: new Date().toISOString()
        };
        
        // Determine appropriate log level based on response status and timing
        let logLevel = 'INFO';
        if (statusCode >= 500) {
            logLevel = 'ERROR';
        } else if (statusCode >= 400 || timingData.isSlowRequest) {
            logLevel = 'WARN';
        } else if (timingData.isCriticalRequest) {
            logLevel = 'ERROR';
        }
        
        // Initialize logger instance for HTTP response logging
        const logger = new Logger();
        
        // Log response details using Logger.logHttpResponse with correlation tracking
        logger.logHttpResponse(response, statusCode, duration, correlationId);
        
        // Include performance warnings if duration exceeds configured thresholds
        if (timingData.isSlowRequest) {
            logger.warn(`Slow response detected: ${duration}ms exceeds ${DEFAULT_TIMING_THRESHOLDS.warnThreshold}ms threshold`, {
                correlationId: correlationId,
                performanceWarning: true,
                timing: timingData
            });
        }
        
        // Update response timing metrics for server performance monitoring
        logger.log(logLevel, formatLogMessage('response', responseLogData), {
            correlationId: correlationId,
            responseProcessing: true,
            performanceData: timingData
        });
        
    } catch (error) {
        // Handle logging errors gracefully without interrupting response processing
        const fallbackLogger = new Logger();
        fallbackLogger.error('Failed to log response details', {
            correlationId: correlationId,
            statusCode: statusCode,
            error: error.message
        }, error);
    }
}

// ============================================================================
// MAIN REQUEST LOGGER MIDDLEWARE FUNCTION
// ============================================================================

/**
 * Main request logging middleware function that logs HTTP requests and responses with timing
 * information, correlation tracking, and structured output for the Node.js tutorial application
 * request processing pipeline. Implements comprehensive request-response lifecycle logging.
 * 
 * @param {Object} request - HTTP request object from Node.js server
 * @param {Object} response - HTTP response object from Node.js server  
 * @param {Function} next - Next middleware function in the processing pipeline
 * @returns {void} Processes request logging and calls next middleware in pipeline
 * 
 * @example
 * // Usage in HTTP server
 * server.on('request', (req, res) => {
 *   requestLogger(req, res, () => {
 *     // Continue with request processing
 *   });
 * });
 */
export function requestLogger(request, response, next) {
    try {
        // Generate unique correlation ID for request-response tracking using crypto.randomUUID
        const correlationId = generateCorrelationId({
            includeTimestamp: LOG_CORRELATION_CONFIG.generateIds,
            prefix: 'req'
        });
        
        // Record request start time using performance.now() for accurate timing measurement
        const requestStartTime = performance.now();
        
        // Extract request metadata using extractRequestMetadata function with correlation context
        const requestMetadata = extractRequestMetadata(request, {
            correlationId: correlationId,
            startTime: requestStartTime
        });
        
        // Parse request method and URL using parseRequestMethod and parseRequestUrl utilities
        const requestMethod = parseRequestMethod(request);
        const requestUrl = parseRequestUrl(request);
        
        // Initialize logger instance for middleware logging
        const logger = new Logger();
        
        // Log incoming request details using Logger.logHttpRequest with correlation ID and metadata
        if (REQUEST_LOGGER_CONFIG.enableRequestLogging) {
            logRequestDetails(request, correlationId, {
                ...requestMetadata,
                method: requestMethod,
                url: requestUrl,
                middleware: 'request-logger'
            });
        }
        
        // Set up response finish event handler for logging response details and timing
        response.on('finish', () => {
            try {
                // Calculate total request processing time
                const requestEndTime = performance.now();
                const processingDuration = requestEndTime - requestStartTime;
                
                // Generate response correlation ID using generateResponseId utility
                const responseId = generateResponseId(correlationId);
                
                // Log response details with timing and correlation tracking
                if (REQUEST_LOGGER_CONFIG.enableResponseLogging) {
                    logResponseDetails(response, response.statusCode, processingDuration, correlationId);
                }
                
                // Log timing information if timing logging is enabled
                if (REQUEST_LOGGER_CONFIG.enableTimingLogging) {
                    const timingData = measureRequestTiming(requestStartTime, requestEndTime);
                    logger.info('Request processing completed', {
                        correlationId: correlationId,
                        responseId: responseId,
                        timing: timingData,
                        processingComplete: true
                    });
                }
                
            } catch (finishError) {
                // Handle response finish logging errors gracefully
                logger.error('Failed to log response finish event', {
                    correlationId: correlationId,
                    error: finishError.message
                }, finishError);
            }
        });
        
        // Add correlation ID to response headers for client debugging and tracking
        if (LOG_CORRELATION_CONFIG.includeInResponse) {
            response.setHeader(LOG_CORRELATION_CONFIG.correlationHeader, correlationId);
        }
        
        // Store correlation ID and timing data on request object for downstream middleware
        request.correlationId = correlationId;
        request.startTime = requestStartTime;
        request.requestMetadata = requestMetadata;
        
        // Call next middleware function to continue request processing pipeline
        if (typeof next === 'function') {
            next();
        }
        
    } catch (error) {
        // Handle any logging errors gracefully without interrupting request processing
        console.error(`Request logger middleware error: ${error.message}`);
        
        // Ensure next middleware is called even if logging fails
        if (typeof next === 'function') {
            next();
        }
    }
}

// ============================================================================
// CONFIGURABLE REQUEST LOGGER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Configurable request logging middleware class that provides advanced logging capabilities
 * including request filtering, performance monitoring, security-safe logging, and integration
 * with the application's logging system. Supports different logging modes for development
 * and production environments with comprehensive request-response tracking and correlation features.
 */
export class RequestLogger {
    /**
     * Initializes the request logger with configuration settings, logger instance, and
     * middleware behavior for HTTP request/response logging. Demonstrates advanced logger
     * configuration with comprehensive middleware setup and statistics tracking.
     * 
     * @param {Object} [options={}] - Configuration options for request logger initialization
     * @param {boolean} [options.enableRequestLogging=true] - Enable HTTP request logging
     * @param {boolean} [options.enableResponseLogging=true] - Enable HTTP response logging
     * @param {boolean} [options.enableTimingLogging=true] - Enable performance timing measurement
     * @param {string} [options.logLevel='INFO'] - Default log level for request logging
     * @param {Array} [options.excludeHeaders] - Headers to exclude from logging
     * @param {Object} [options.timingThresholds] - Performance timing thresholds
     */
    constructor(options = {}) {
        try {
            // Validate and set request logger configuration with defaults
            this.config = {
                enableRequestLogging: options.enableRequestLogging !== false,
                enableResponseLogging: options.enableResponseLogging !== false,
                enableTimingLogging: options.enableTimingLogging !== false,
                logLevel: options.logLevel || REQUEST_LOGGER_CONFIG.logLevel,
                excludeHeaders: options.excludeHeaders || REQUEST_LOGGER_CONFIG.excludeHeaders,
                correlationConfig: options.correlationConfig || LOG_CORRELATION_CONFIG
            };
            
            // Initialize Logger instance with request logging specific settings
            this.logger = new Logger({
                logLevel: this.config.logLevel
            });
            
            // Configure request and response logging enablement flags
            this.enableRequestLogging = this.config.enableRequestLogging;
            this.enableResponseLogging = this.config.enableResponseLogging;
            this.enableTimingLogging = this.config.enableTimingLogging;
            
            // Set up timing measurement and performance monitoring thresholds
            this.timingThresholds = {
                ...DEFAULT_TIMING_THRESHOLDS,
                ...options.timingThresholds
            };
            
            // Configure header filtering and security-safe logging options
            this.excludeHeaders = this.config.excludeHeaders;
            
            // Initialize logging metrics collection for monitoring middleware performance
            this.loggingMetrics = {
                requestsLogged: 0,
                responsesLogged: 0,
                errorsLogged: 0,
                averageResponseTime: 0,
                totalResponseTime: 0,
                slowRequests: 0,
                criticalRequests: 0,
                startTime: new Date()
            };
            
            // Set up correlation tracking and request-response linking configuration
            this.correlationTracking = new Map(); // Store correlation data temporarily
            
            // Log successful RequestLogger initialization
            this.logger.info('RequestLogger initialized successfully', {
                config: this.config,
                timingThresholds: this.timingThresholds,
                loggingMetrics: true
            });
            
        } catch (error) {
            // Initialize with fallback configuration if setup fails
            console.error(`RequestLogger initialization failed: ${error.message}`);
            this._initializeFallbackConfiguration();
        }
    }
    
    /**
     * Returns the configured request logging middleware function for integration with HTTP
     * server middleware stack. Provides bound middleware function with current configuration
     * applied for immediate integration.
     * 
     * @returns {Function} Request logging middleware function with (req, res, next) signature
     * 
     * @example
     * const requestLoggerInstance = new RequestLogger();
     * const middleware = requestLoggerInstance.middleware();
     * server.on('request', middleware);
     */
    middleware() {
        try {
            // Return bound middleware function with current configuration applied
            const middlewareFunction = (request, response, next) => {
                try {
                    // Generate correlation ID for this request
                    const correlationId = generateCorrelationId();
                    const startTime = performance.now();
                    
                    // Extract request metadata
                    const metadata = extractRequestMetadata(request, {
                        correlationId: correlationId,
                        startTime: startTime
                    });
                    
                    // Log request if enabled
                    if (this.enableRequestLogging) {
                        this.logRequest(request, correlationId, metadata);
                    }
                    
                    // Store correlation data for response logging
                    this.correlationTracking.set(correlationId, {
                        startTime: startTime,
                        metadata: metadata
                    });
                    
                    // Set up response finish handler
                    response.on('finish', () => {
                        const endTime = performance.now();
                        const correlationData = this.correlationTracking.get(correlationId);
                        
                        if (correlationData && this.enableResponseLogging) {
                            const duration = endTime - correlationData.startTime;
                            this.logResponse(response, response.statusCode, duration, correlationId);
                        }
                        
                        // Clean up correlation data
                        this.correlationTracking.delete(correlationId);
                    });
                    
                    // Add correlation ID to response headers
                    if (this.config.correlationConfig.includeInResponse) {
                        response.setHeader(this.config.correlationConfig.correlationHeader, correlationId);
                    }
                    
                    // Store data on request for downstream middleware
                    request.correlationId = correlationId;
                    request.startTime = startTime;
                    
                    // Continue to next middleware
                    if (typeof next === 'function') {
                        next();
                    }
                    
                } catch (middlewareError) {
                    this.logger.error('Middleware execution failed', {
                        error: middlewareError.message
                    }, middlewareError);
                    
                    // Ensure next middleware is called even on error
                    if (typeof next === 'function') {
                        next();
                    }
                }
            };
            
            // Ensure middleware function has proper request logging signature
            Object.defineProperty(middlewareFunction, 'name', {
                value: 'requestLoggerMiddleware',
                configurable: true
            });
            
            // Include correlation tracking and performance measurement setup
            middlewareFunction.config = this.config;
            middlewareFunction.metrics = this.loggingMetrics;
            
            // Apply configured security and filtering settings to middleware
            return middlewareFunction;
            
        } catch (error) {
            this.logger.error('Failed to create middleware function', {
                error: error.message
            }, error);
            
            // Return no-op middleware if creation fails
            return (req, res, next) => {
                console.warn('Request logger middleware disabled due to initialization failure');
                if (typeof next === 'function') next();
            };
        }
    }
    
    /**
     * Logs HTTP request details with structured formatting, correlation tracking, and
     * security-safe header filtering. Provides detailed request analysis with client
     * information and request context for debugging and monitoring.
     * 
     * @param {Object} request - HTTP request object
     * @param {string} correlationId - Unique correlation ID for tracking
     * @param {Object} metadata - Additional request metadata and context
     * @returns {void} Logs structured request information to configured output
     */
    logRequest(request, correlationId, metadata) {
        try {
            // Extract and parse request method and URL components for logging
            const method = parseRequestMethod(request);
            const url = parseRequestUrl(request);
            
            // Filter sensitive headers using configured exclusion list
            const safeHeaders = filterSensitiveHeaders(request.headers, this.excludeHeaders);
            
            // Format request data with correlation ID and timing information
            const requestData = {
                correlationId: correlationId,
                method: method,
                url: url.fullUrl,
                path: url.pathname,
                query: url.query,
                headers: safeHeaders,
                client: {
                    ip: request.connection?.remoteAddress,
                    userAgent: request.headers?.['user-agent']
                },
                metadata: metadata
            };
            
            // Log request details using Logger.logHttpRequest with structured format
            this.logger.logHttpRequest(request, correlationId, requestData);
            
            // Update request logging metrics for middleware performance monitoring
            this.loggingMetrics.requestsLogged++;
            
        } catch (error) {
            this.logger.error('Failed to log request in RequestLogger', {
                correlationId: correlationId,
                error: error.message
            }, error);
        }
    }
    
    /**
     * Logs HTTP response details with status codes, timing metrics, and correlation to
     * original request for comprehensive monitoring. Provides detailed response analysis
     * with performance categorization and threshold monitoring.
     * 
     * @param {Object} response - HTTP response object
     * @param {number} statusCode - HTTP status code for response
     * @param {number} duration - Request processing duration in milliseconds
     * @param {string} correlationId - Correlation ID linking to original request
     * @returns {void} Logs structured response information with performance data
     */
    logResponse(response, statusCode, duration, correlationId) {
        try {
            // Calculate request processing time and performance metrics
            const timingData = measureRequestTiming(0, duration);
            
            // Determine response status category for appropriate log level
            const statusCategory = statusCode >= 200 && statusCode < 300 ? 'success' :
                                 statusCode >= 400 && statusCode < 500 ? 'client_error' :
                                 statusCode >= 500 ? 'server_error' : 'informational';
            
            // Format response data with timing and correlation information
            const responseData = {
                correlationId: correlationId,
                statusCode: statusCode,
                statusCategory: statusCategory,
                duration: `${duration}ms`,
                timing: timingData,
                headers: filterSensitiveHeaders(response.getHeaders())
            };
            
            // Log response details using Logger.logHttpResponse method
            this.logger.logHttpResponse(response, statusCode, duration, correlationId);
            
            // Check performance thresholds and log warnings if exceeded
            if (timingData.isSlowRequest) {
                this.logger.warn('Performance threshold exceeded', {
                    correlationId: correlationId,
                    threshold: this.timingThresholds.warnThreshold,
                    actualDuration: duration,
                    performanceImpact: timingData.classification
                });
                this.loggingMetrics.slowRequests++;
            }
            
            if (timingData.isCriticalRequest) {
                this.logger.error('Critical performance threshold exceeded', {
                    correlationId: correlationId,
                    threshold: this.timingThresholds.errorThreshold,
                    actualDuration: duration,
                    requiresInvestigation: true
                });
                this.loggingMetrics.criticalRequests++;
            }
            
            // Update response logging metrics for performance monitoring
            this.loggingMetrics.responsesLogged++;
            this.loggingMetrics.totalResponseTime += duration;
            this.loggingMetrics.averageResponseTime = 
                this.loggingMetrics.totalResponseTime / this.loggingMetrics.responsesLogged;
            
        } catch (error) {
            this.logger.error('Failed to log response in RequestLogger', {
                correlationId: correlationId,
                statusCode: statusCode,
                error: error.message
            }, error);
            
            this.loggingMetrics.errorsLogged++;
        }
    }
    
    /**
     * Updates request logger configuration at runtime for dynamic logging behavior changes.
     * Provides runtime configuration management for adjusting logging behavior based on
     * operational requirements and debugging needs.
     * 
     * @param {Object} newConfig - New configuration options to apply
     * @returns {boolean} True if configuration was successfully updated
     * 
     * @example
     * const updated = requestLogger.updateConfig({ logLevel: 'DEBUG', enableTimingLogging: false });
     * console.log(updated); // true
     */
    updateConfig(newConfig) {
        try {
            // Validate new configuration options against supported settings
            if (!newConfig || typeof newConfig !== 'object') {
                this.logger.warn('Invalid configuration provided for RequestLogger update');
                return false;
            }
            
            // Store previous configuration for comparison and rollback
            const previousConfig = { ...this.config };
            
            // Update internal configuration state with new values
            Object.keys(newConfig).forEach(key => {
                if (this.config.hasOwnProperty(key)) {
                    this.config[key] = newConfig[key];
                }
            });
            
            // Reconfigure logger instance if logging settings changed
            if (newConfig.logLevel && newConfig.logLevel !== previousConfig.logLevel) {
                this.logger.setLogLevel(newConfig.logLevel);
            }
            
            // Update header filtering and security settings
            if (newConfig.excludeHeaders) {
                this.excludeHeaders = newConfig.excludeHeaders;
            }
            
            // Update timing thresholds if provided
            if (newConfig.timingThresholds) {
                this.timingThresholds = {
                    ...this.timingThresholds,
                    ...newConfig.timingThresholds
                };
            }
            
            // Log configuration change event for operational awareness
            this.logger.info('RequestLogger configuration updated', {
                previousConfig: previousConfig,
                newConfig: this.config,
                updatedAt: new Date().toISOString()
            });
            
            // Return success status of configuration update
            return true;
            
        } catch (error) {
            this.logger.error('Failed to update RequestLogger configuration', {
                newConfig: newConfig,
                error: error.message
            }, error);
            
            return false;
        }
    }
    
    /**
     * Retrieves current request logging metrics for monitoring middleware performance and
     * request processing statistics. Provides comprehensive metrics data for operational
     * monitoring and performance analysis.
     * 
     * @returns {Object} Logging metrics with request counts, timing statistics, and performance data
     * 
     * @example
     * const metrics = requestLogger.getLoggingMetrics();
     * console.log(metrics.summary.averageResponseTime); // 45.2
     */
    getLoggingMetrics() {
        try {
            // Calculate uptime and processing rates for performance analysis
            const uptime = (new Date() - this.loggingMetrics.startTime) / 1000; // seconds
            const requestsPerSecond = uptime > 0 ? 
                (this.loggingMetrics.requestsLogged / uptime).toFixed(2) : 0;
            
            // Aggregate request and response logging counts by type
            const aggregatedCounts = {
                totalRequests: this.loggingMetrics.requestsLogged,
                totalResponses: this.loggingMetrics.responsesLogged,
                totalErrors: this.loggingMetrics.errorsLogged,
                slowRequests: this.loggingMetrics.slowRequests,
                criticalRequests: this.loggingMetrics.criticalRequests
            };
            
            // Calculate average logging processing times and overhead
            const timingStatistics = {
                averageResponseTime: Math.round(this.loggingMetrics.averageResponseTime * 100) / 100,
                totalResponseTime: Math.round(this.loggingMetrics.totalResponseTime * 100) / 100,
                requestsPerSecond: parseFloat(requestsPerSecond),
                uptime: `${uptime.toFixed(1)}s`
            };
            
            // Include error rates and logging failure statistics
            const errorRates = {
                errorRate: this.loggingMetrics.requestsLogged > 0 ? 
                    ((this.loggingMetrics.errorsLogged / this.loggingMetrics.requestsLogged) * 100).toFixed(2) + '%' : '0%',
                slowRequestRate: this.loggingMetrics.requestsLogged > 0 ? 
                    ((this.loggingMetrics.slowRequests / this.loggingMetrics.requestsLogged) * 100).toFixed(2) + '%' : '0%',
                criticalRequestRate: this.loggingMetrics.requestsLogged > 0 ? 
                    ((this.loggingMetrics.criticalRequests / this.loggingMetrics.requestsLogged) * 100).toFixed(2) + '%' : '0%'
            };
            
            // Compile correlation tracking statistics and effectiveness
            const correlationStats = {
                activeCorrelations: this.correlationTracking.size,
                correlationTrackingEnabled: this.config.correlationConfig.enableCorrelation,
                correlationHeader: this.config.correlationConfig.correlationHeader
            };
            
            // Format metrics data for monitoring systems integration
            const comprehensiveMetrics = {
                summary: {
                    ...aggregatedCounts,
                    ...timingStatistics
                },
                performance: {
                    timing: timingStatistics,
                    thresholds: this.timingThresholds,
                    rates: errorRates
                },
                correlation: correlationStats,
                configuration: {
                    enableRequestLogging: this.enableRequestLogging,
                    enableResponseLogging: this.enableResponseLogging,
                    enableTimingLogging: this.enableTimingLogging,
                    logLevel: this.config.logLevel,
                    excludeHeaders: this.excludeHeaders
                },
                uptime: {
                    startTime: this.loggingMetrics.startTime.toISOString(),
                    currentTime: new Date().toISOString(),
                    uptimeSeconds: uptime
                }
            };
            
            // Return comprehensive logging metrics object
            return comprehensiveMetrics;
            
        } catch (error) {
            this.logger.error('Failed to generate logging metrics', {
                error: error.message
            }, error);
            
            return {
                error: 'Failed to generate metrics',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Initializes fallback configuration when normal initialization fails.
     * @private
     */
    _initializeFallbackConfiguration() {
        this.config = { ...REQUEST_LOGGER_CONFIG };
        this.logger = new Logger();
        this.enableRequestLogging = true;
        this.enableResponseLogging = true;
        this.enableTimingLogging = true;
        this.timingThresholds = { ...DEFAULT_TIMING_THRESHOLDS };
        this.excludeHeaders = REQUEST_LOGGER_CONFIG.excludeHeaders;
        this.loggingMetrics = {
            requestsLogged: 0,
            responsesLogged: 0,
            errorsLogged: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
            slowRequests: 0,
            criticalRequests: 0,
            startTime: new Date()
        };
        this.correlationTracking = new Map();
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export default request logging middleware function for immediate integration
export default requestLogger;

// Export configurable RequestLogger class for advanced logging scenarios
export { RequestLogger };

// Export utility functions for external use and testing
export {
    logRequestDetails,
    logResponseDetails, 
    generateCorrelationId,
    filterSensitiveHeaders,
    formatLogMessage,
    measureRequestTiming
};

// Export configuration constants for external configuration and testing
export {
    REQUEST_LOGGER_CONFIG,
    DEFAULT_TIMING_THRESHOLDS,
    LOG_CORRELATION_CONFIG
};