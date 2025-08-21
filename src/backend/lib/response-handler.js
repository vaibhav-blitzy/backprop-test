/**
 * Core HTTP Response Generation Module for Node.js Tutorial Application
 * 
 * This module serves as the central response coordination component that orchestrates the creation,
 * formatting, and transmission of HTTP responses based on routing decisions and request processing
 * results. It implements comprehensive response handling for success scenarios, error conditions,
 * and method validation failures while demonstrating production-ready response patterns and
 * educational clarity for Node.js HTTP server development.
 * 
 * The ResponseHandler integrates with all system components to provide consistent, standardized
 * HTTP response generation including proper status codes, headers, content formatting, logging,
 * error handling, and performance monitoring. It demonstrates enterprise-grade response management
 * patterns while maintaining educational simplicity for tutorial learning objectives.
 * 
 * Key Features:
 * - Comprehensive HTTP response generation with proper protocol compliance
 * - Standardized response formatting for success, error, and method validation scenarios
 * - Integration with logging, error handling, and performance monitoring systems
 * - Security-conscious response generation with information disclosure prevention
 * - Educational patterns demonstrating production-ready HTTP response management
 * - Metrics collection and performance tracking for monitoring and optimization
 * - Correlation ID support for request-response tracking and debugging
 * - Configurable response options and header management
 * 
 * Educational Value:
 * - Demonstrates comprehensive HTTP response generation patterns
 * - Shows integration between multiple system components
 * - Illustrates proper error handling and security considerations
 * - Provides examples of logging and monitoring integration
 * - Shows performance tracking and metrics collection
 * - Demonstrates production-ready code organization and documentation
 * 
 * Security Features:
 * - Generic error messages preventing information disclosure
 * - Input validation and sanitization for all response data
 * - Secure header management with appropriate content types
 * - Comprehensive error logging without exposing sensitive information
 * 
 * @fileoverview Core HTTP response generation module with comprehensive response coordination
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
    SERVER_STATUS_MESSAGES,
    TUTORIAL_MESSAGES
} from '../constants/response-messages.js';

// Import HTTP status code constants and validation utilities
import {
    HTTP_STATUS_CODES,
    isValidStatusCode,
    getStatusCategory,
    isClientError,
    isServerError
} from '../utils/http-status.js';

// Import response utilities for standardized response creation and formatting
import {
    createSuccessResponse,
    createErrorResponse,
    createHelloResponse,
    formatResponseHeaders,
    validateResponse,
    calculateContentLength
} from '../utils/response-utils.js';

// Import HTTP header constants for proper response header management
import {
    HTTP_HEADERS,
    CONTENT_TYPES,
    SECURITY_HEADERS,
    SERVER_IDENTIFICATION
} from '../constants/http-headers.js';

// Import logging utilities for structured response logging and monitoring
import {
    Logger,
    logger
} from '../utils/logger.js';

// Import error handling utilities for comprehensive error processing
import {
    ErrorHandler,
    classifyError,
    sanitizeErrorMessage,
    formatErrorForLogging,
    generateErrorId,
    ERROR_TYPES,
    ERROR_SEVERITY_LEVELS
} from './error-handler.js';

// ============================================================================
// MODULE IMPORTS - EXTERNAL DEPENDENCIES
// ============================================================================

// Node.js built-in performance hooks for response generation timing and monitoring
import { performance } from 'perf_hooks'; // Node.js v20.x - Built-in performance measurement utilities

// ============================================================================
// GLOBAL CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Response Handler Configuration Object
 * 
 * Provides comprehensive configuration options for response generation, logging behavior,
 * metrics collection, error handling, and performance monitoring. These settings control
 * the behavior of the ResponseHandler class and associated utility functions.
 */
const RESPONSE_HANDLER_CONFIG = {
    handlerName: 'ResponseHandler',
    version: '1.0.0',
    enableLogging: true,
    enableMetrics: true,
    enableErrorHandling: true,
    defaultContentType: 'text/plain',
    defaultEncoding: 'utf-8'
};

/**
 * Default Response Options Configuration
 * 
 * Defines default settings for response generation including timestamp inclusion,
 * correlation ID tracking, caching behavior, and compression settings. These options
 * can be overridden on a per-request basis for customized response handling.
 */
const DEFAULT_RESPONSE_OPTIONS = {
    includeTimestamp: true,
    includeCorrelationId: true,
    enableCaching: false,
    compressionEnabled: false
};

/**
 * Response Metrics Tracking Object
 * 
 * Maintains comprehensive metrics for response generation including response counts,
 * success and error rates, and average response times. These metrics support
 * monitoring, performance analysis, and operational visibility.
 */
const RESPONSE_METRICS = {
    responseCount: 0,
    successCount: 0,
    errorCount: 0,
    averageResponseTime: 0
};

// ============================================================================
// RESPONSE CONTEXT AND CORRELATION FUNCTIONS
// ============================================================================

/**
 * Creates a comprehensive response context object with request data, response options,
 * and correlation tracking for response generation. This function initializes all
 * necessary context information required for proper response processing, logging,
 * and monitoring throughout the response generation lifecycle.
 * 
 * @param {object} request - HTTP request object from Node.js
 * @param {object} response - HTTP response object from Node.js
 * @param {object} options - Response configuration options and settings
 * @returns {object} Response context with metadata, timing information, correlation ID, and response configuration options
 * 
 * @example
 * const context = createResponseContext(request, response, { includeTimestamp: true });
 * // Returns comprehensive context object for response processing
 */
function createResponseContext(request, response, options = {}) {
    try {
        // Extract request correlation ID and metadata for response tracking
        const correlationId = request.headers['x-correlation-id'] || 
                            request.headers['x-request-id'] || 
                            generateResponseId();

        // Initialize response timing measurement for performance monitoring
        const startTime = performance.now();
        const timestamp = new Date().toISOString();

        // Create response context object with request and response references
        const responseContext = {
            // Request and response object references
            request: request,
            response: response,
            
            // Correlation and tracking information
            correlationId: correlationId,
            responseId: generateResponseId(correlationId),
            timestamp: timestamp,
            startTime: startTime,
            
            // Request characteristics for logging and processing
            requestMethod: request.method || 'UNKNOWN',
            requestUrl: request.url || '/',
            requestHeaders: request.headers || {},
            userAgent: request.headers['user-agent'] || 'Unknown',
            remoteAddress: request.connection?.remoteAddress || 'Unknown',
            
            // Response configuration options and formatting preferences
            options: {
                ...DEFAULT_RESPONSE_OPTIONS,
                ...options
            },
            
            // Performance and metrics tracking
            metrics: {
                startTime: startTime,
                endTime: null,
                processingTime: null,
                responseSize: 0
            },
            
            // Error handling context and recovery strategies
            errorHandling: {
                hasErrors: false,
                errorCount: 0,
                lastError: null,
                recoveryStrategy: 'continue'
            }
        };

        // Add response configuration options and formatting preferences
        if (options.contentType) {
            responseContext.contentType = options.contentType;
        }
        
        if (options.statusCode) {
            responseContext.statusCode = options.statusCode;
        }

        // Include client information and request characteristics for logging
        responseContext.clientInfo = {
            ip: request.connection?.remoteAddress,
            userAgent: request.headers['user-agent'],
            acceptLanguage: request.headers['accept-language'],
            acceptEncoding: request.headers['accept-encoding'],
            referer: request.headers['referer']
        };

        // Set up error handling context and recovery strategies
        responseContext.errorHandler = new ErrorHandler({
            includeStackTrace: false,
            logErrorDetails: true,
            sanitizeErrorMessages: true,
            enableErrorCorrelation: true
        });

        // Return comprehensive response context for handler processing
        return responseContext;

    } catch (contextError) {
        // Fallback context creation if primary context creation fails
        logger.warn('Response context creation failed, using fallback', {
            error: contextError.message,
            requestUrl: request?.url,
            requestMethod: request?.method
        });

        return {
            request: request,
            response: response,
            correlationId: generateResponseId(),
            responseId: generateResponseId(),
            timestamp: new Date().toISOString(),
            startTime: performance.now(),
            requestMethod: request?.method || 'UNKNOWN',
            requestUrl: request?.url || '/',
            options: DEFAULT_RESPONSE_OPTIONS,
            metrics: { startTime: performance.now() },
            errorHandling: { hasErrors: true, errorCount: 1 }
        };
    }
}

/**
 * Generates a unique response identifier for tracking and correlation with request
 * processing throughout the response lifecycle. Creates collision-resistant identifiers
 * that combine correlation IDs with response-specific components for comprehensive
 * request-response tracking across logs, monitoring systems, and debugging sessions.
 * 
 * @param {string} correlationId - Optional correlation ID from request context for response linking
 * @returns {string} Unique response identifier combining correlation ID with response-specific components
 * 
 * @example
 * const responseId = generateResponseId('req_123456789');
 * // Returns: 'res_1703123456789_a1b2c3d4_req_123456789'
 */
function generateResponseId(correlationId = null) {
    try {
        // Extract correlation ID from request context for response linking
        const baseCorrelationId = correlationId || 'unknown';
        
        // Generate timestamp component for response uniqueness
        const timestamp = Date.now().toString();
        
        // Create random component for identifier collision prevention
        const randomComponent = Math.random().toString(36).substring(2, 10);
        
        // Combine correlation ID, timestamp, and random elements
        const responseIdComponents = [
            'res',                    // Response identifier prefix
            timestamp,                // Timestamp for uniqueness
            randomComponent          // Random component for collision prevention
        ];

        // Format response ID with consistent pattern for tracking
        let responseId = responseIdComponents.join('_');
        
        // Add correlation ID if provided for request-response linking
        if (correlationId && correlationId !== 'unknown') {
            const sanitizedCorrelationId = correlationId.replace(/[^a-zA-Z0-9_\-]/g, '').substring(0, 32);
            if (sanitizedCorrelationId.length > 0) {
                responseId = `${responseId}_${sanitizedCorrelationId}`;
            }
        }

        // Validate response ID format and length constraints
        if (responseId.length > 128) {
            // Truncate while maintaining essential components
            responseId = `res_${timestamp.substring(-8)}_${randomComponent}`;
        }

        // Return unique response identifier for logging and monitoring
        return responseId;

    } catch (generationError) {
        // Fallback response ID generation if primary generation fails
        logger.warn('Response ID generation failed, using fallback', {
            error: generationError.message,
            correlationId: correlationId
        });

        return `res_fallback_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    }
}

/**
 * Validates response data including status codes, headers, and body content to ensure
 * HTTP protocol compliance and response integrity. Performs comprehensive validation
 * of response components to prevent malformed responses and ensure proper HTTP/1.1
 * protocol compliance for all response generation scenarios.
 * 
 * @param {object} responseData - Response data object containing status, headers, and body
 * @param {object} validationOptions - Validation configuration options and rules
 * @returns {object} Response validation result with compliance status, normalized data, and validation details
 * 
 * @example
 * const validation = validateResponseData({
 *   statusCode: 200,
 *   headers: { 'content-type': 'text/plain' },
 *   body: 'Hello world'
 * });
 * // Returns: { isValid: true, normalizedData: {...}, issues: [] }
 */
function validateResponseData(responseData, validationOptions = {}) {
    try {
        // Initialize validation result with default values
        const validationResult = {
            isValid: true,
            issues: [],
            normalizedData: null,
            compliance: {
                httpProtocol: true,
                headerFormat: true,
                contentType: true,
                statusCode: true
            }
        };

        // Validate input parameters
        if (!responseData || typeof responseData !== 'object') {
            validationResult.isValid = false;
            validationResult.issues.push('Response data is required and must be an object');
            return validationResult;
        }

        // Validate HTTP status code using isValidStatusCode function
        const statusCode = responseData.statusCode || responseData.status;
        if (!statusCode) {
            validationResult.issues.push('Status code is required');
            validationResult.compliance.statusCode = false;
        } else if (!isValidStatusCode(statusCode)) {
            validationResult.issues.push(`Invalid HTTP status code: ${statusCode}`);
            validationResult.compliance.statusCode = false;
        }

        // Check response headers format and required header presence
        const headers = responseData.headers || {};
        if (typeof headers !== 'object') {
            validationResult.issues.push('Headers must be an object');
            validationResult.compliance.headerFormat = false;
        } else {
            // Validate required headers
            const requiredHeaders = [HTTP_HEADERS.CONTENT_TYPE];
            requiredHeaders.forEach(headerName => {
                if (!headers[headerName] && !headers[headerName.toLowerCase()]) {
                    validationResult.issues.push(`Required header missing: ${headerName}`);
                    validationResult.compliance.headerFormat = false;
                }
            });

            // Validate header format compliance
            Object.keys(headers).forEach(headerName => {
                if (typeof headers[headerName] !== 'string') {
                    validationResult.issues.push(`Header value must be string: ${headerName}`);
                    validationResult.compliance.headerFormat = false;
                }
            });
        }

        // Validate response body content type and encoding compatibility
        const contentType = headers[HTTP_HEADERS.CONTENT_TYPE] || 
                          headers['content-type'] || 
                          CONTENT_TYPES.TEXT_PLAIN;
        
        const body = responseData.body || responseData.content || '';
        
        // Check content type validity
        const validContentTypes = Object.values(CONTENT_TYPES);
        const isValidContentType = validContentTypes.some(validType => 
            contentType.toLowerCase().includes(validType.split(';')[0].toLowerCase())
        );
        
        if (!isValidContentType) {
            validationResult.issues.push(`Invalid content type: ${contentType}`);
            validationResult.compliance.contentType = false;
        }

        // Verify content length calculation and header consistency
        const bodyString = typeof body === 'string' ? body : String(body);
        const calculatedLength = Buffer.byteLength(bodyString, 'utf8');
        const declaredLength = headers[HTTP_HEADERS.CONTENT_LENGTH] || 
                              headers['content-length'];
        
        if (declaredLength && parseInt(declaredLength) !== calculatedLength) {
            validationResult.issues.push(
                `Content-Length mismatch: declared ${declaredLength}, actual ${calculatedLength}`
            );
        }

        // Check for security headers and information disclosure prevention
        const securityHeaders = Object.keys(SECURITY_HEADERS);
        let hasBasicSecurity = false;
        
        securityHeaders.forEach(securityHeader => {
            if (headers[securityHeader] || headers[securityHeader.toLowerCase()]) {
                hasBasicSecurity = true;
            }
        });

        // Validate response structure against HTTP/1.1 specifications
        const normalizedData = {
            statusCode: statusCode,
            headers: {
                ...headers,
                [HTTP_HEADERS.CONTENT_LENGTH]: calculatedLength.toString(),
                [HTTP_HEADERS.DATE]: headers[HTTP_HEADERS.DATE] || new Date().toUTCString()
            },
            body: bodyString,
            contentLength: calculatedLength,
            hasSecurityHeaders: hasBasicSecurity
        };

        // Ensure content-type is properly formatted
        if (!normalizedData.headers[HTTP_HEADERS.CONTENT_TYPE]) {
            normalizedData.headers[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.TEXT_PLAIN;
        }

        // Set validation result based on issue count
        validationResult.isValid = validationResult.issues.length === 0;
        validationResult.normalizedData = normalizedData;

        // Return comprehensive validation result with compliance details
        return validationResult;

    } catch (validationError) {
        // Fallback validation result for validation errors
        logger.error('Response validation failed', {
            error: validationError.message,
            responseData: responseData
        });

        return {
            isValid: false,
            issues: [`Validation error: ${validationError.message}`],
            normalizedData: null,
            compliance: {
                httpProtocol: false,
                headerFormat: false,
                contentType: false,
                statusCode: false
            }
        };
    }
}

/**
 * Logs response generation details including status codes, processing time, and response
 * characteristics for monitoring and debugging purposes. Provides comprehensive response
 * logging with structured format, correlation tracking, and performance metrics for
 * operational monitoring and debugging support.
 * 
 * @param {string} responseType - Type of response being generated (hello, error, etc.)
 * @param {object} responseData - Response data including status, headers, and content
 * @param {object} context - Response context with correlation and timing information
 * @returns {void} Logs structured response information for monitoring and operational analysis
 * 
 * @example
 * logResponseGeneration('hello', { statusCode: 200, body: 'Hello world' }, context);
 * // Logs comprehensive response information for monitoring
 */
function logResponseGeneration(responseType, responseData, context) {
    try {
        // Determine appropriate log level based on response type and status
        const statusCode = responseData.statusCode || responseData.status || 200;
        const statusCategory = getStatusCategory(statusCode);
        
        let logLevel = 'info';
        if (statusCategory === 'Client Error') {
            logLevel = 'warn';
        } else if (statusCategory === 'Server Error') {
            logLevel = 'error';
        }

        // Format response details with status code, content type, and size
        const responseDetails = {
            responseType: responseType,
            statusCode: statusCode,
            statusCategory: statusCategory,
            contentType: responseData.headers?.[HTTP_HEADERS.CONTENT_TYPE] || 
                        responseData.headers?.['content-type'] || 
                        'unknown',
            contentLength: responseData.contentLength || 
                          Buffer.byteLength(responseData.body || '', 'utf8'),
            hasSecurityHeaders: Boolean(responseData.hasSecurityHeaders)
        };

        // Include response processing time and performance metrics
        const currentTime = performance.now();
        const processingTime = context.startTime ? 
            Math.round(currentTime - context.startTime) : 0;
        
        const performanceMetrics = {
            processingTimeMs: processingTime,
            responseSize: responseDetails.contentLength,
            responseGenerated: new Date().toISOString()
        };

        // Add correlation ID and request context for request-response linking
        const correlationInfo = {
            correlationId: context.correlationId,
            responseId: context.responseId,
            requestMethod: context.requestMethod,
            requestUrl: context.requestUrl,
            userAgent: context.userAgent || 'Unknown'
        };

        // Log response generation with structured format for monitoring tools
        const logData = {
            message: `Response generated: ${responseType}`,
            responseDetails: responseDetails,
            performanceMetrics: performanceMetrics,
            correlationInfo: correlationInfo,
            timestamp: new Date().toISOString()
        };

        // Use logger with appropriate level for structured logging
        logger[logLevel]('Response generation completed', logData);

        // Update response metrics and statistics for operational monitoring
        updateResponseMetrics(responseType, statusCode, processingTime, responseData);

    } catch (loggingError) {
        // Fallback logging if structured logging fails
        logger.error('Response logging failed', {
            error: loggingError.message,
            responseType: responseType,
            statusCode: responseData?.statusCode || 'unknown'
        });
    }
}

// ============================================================================
// MAIN RESPONSE HANDLER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Main Response Handler Class
 * 
 * Orchestrates HTTP response generation, formatting, and transmission for the Node.js
 * tutorial application. This class coordinates with all system components to provide
 * consistent, standardized response handling for success scenarios, error conditions,
 * and method validation failures. It implements comprehensive response processing
 * pipeline with logging, metrics, and error handling integration.
 * 
 * The ResponseHandler demonstrates production-ready response management patterns while
 * maintaining educational clarity for tutorial learning objectives. It provides
 * centralized response coordination that integrates with routing decisions, error
 * handling, logging systems, and performance monitoring.
 */
class ResponseHandler {
    /**
     * Initializes the ResponseHandler with configuration, logging, error handling, and
     * metrics setup for comprehensive response processing. Demonstrates configuration
     * integration patterns and provides comprehensive error handling setup with
     * production-ready logging and monitoring capabilities.
     * 
     * @param {object} options - Configuration options for response handler initialization
     * @param {boolean} [options.enableLogging=true] - Enable response generation logging
     * @param {boolean} [options.enableMetrics=true] - Enable response metrics collection
     * @param {boolean} [options.enableErrorHandling=true] - Enable comprehensive error handling
     * @param {string} [options.defaultContentType='text/plain'] - Default response content type
     * @param {Logger} [options.logger] - Custom logger instance for response logging
     */
    constructor(options = {}) {
        try {
            // Validate and merge configuration with default response handler settings
            this.config = {
                ...RESPONSE_HANDLER_CONFIG,
                ...options
            };

            // Initialize Logger instance for response processing and HTTP logging
            this.logger = options.logger || new Logger({
                enableColors: false,
                logLevel: 'info',
                format: 'json'
            });

            // Create ErrorHandler instance for response error processing and coordination
            this.errorHandler = new ErrorHandler({
                logger: this.logger,
                includeStackTrace: false,
                logErrorDetails: true,
                sanitizeErrorMessages: true,
                enableErrorCorrelation: true
            });

            // Set up response metrics collection and performance tracking
            this.responseMetrics = {
                ...RESPONSE_METRICS,
                startTime: new Date().toISOString(),
                handlerInstances: 1
            };

            // Configure response options including headers, encoding, and formatting
            this.responseOptions = {
                ...DEFAULT_RESPONSE_OPTIONS,
                defaultHeaders: {
                    [HTTP_HEADERS.SERVER]: SERVER_IDENTIFICATION.NAME,
                    [HTTP_HEADERS.DATE]: new Date().toUTCString()
                }
            };

            // Initialize response processing pipeline components and utilities
            this.processingPipeline = {
                validateInput: true,
                formatHeaders: true,
                logResponses: this.config.enableLogging,
                collectMetrics: this.config.enableMetrics,
                handleErrors: this.config.enableErrorHandling
            };

            // Log response handler initialization and configuration details
            this.logger.info('ResponseHandler initialized successfully', {
                handlerName: this.config.handlerName,
                version: this.config.version,
                configuration: this.config,
                pipelineEnabled: this.processingPipeline
            });

        } catch (initializationError) {
            // Fallback initialization if primary initialization fails
            console.error(`ResponseHandler initialization failed: ${initializationError.message}`);
            
            this.config = RESPONSE_HANDLER_CONFIG;
            this.logger = logger; // Use default logger
            this.errorHandler = new ErrorHandler();
            this.responseMetrics = { ...RESPONSE_METRICS, initializationFailed: true };
            this.responseOptions = DEFAULT_RESPONSE_OPTIONS;
            this.processingPipeline = { validateInput: false, formatHeaders: true };
        }
    }

    /**
     * Generates and sends hello world response for successful GET requests to /hello endpoint
     * with proper status code and content formatting. Implements the primary success response
     * scenario for the tutorial application with comprehensive logging, metrics collection,
     * and proper HTTP protocol compliance including headers and content formatting.
     * 
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {object} context - Response context with correlation and timing information
     * @returns {Promise<void>} Completes hello response generation and transmission to client
     */
    async sendHello(request, response, context = null) {
        try {
            // Create response context using createResponseContext with request data
            const responseContext = context || createResponseContext(request, response, {
                includeTimestamp: true,
                includeCorrelationId: true
            });

            // Generate hello world response using createHelloResponse utility
            const helloResponseData = createHelloResponse(RESPONSE_MESSAGES.HELLO_WORLD, {
                includeTimestamp: responseContext.options.includeTimestamp,
                correlationId: responseContext.correlationId
            });

            // Set HTTP status code to 200 OK using HTTP_STATUS_CODES.SUCCESS
            const statusCode = HTTP_STATUS_CODES.SUCCESS.OK;

            // Configure response headers with Content-Type text/plain and proper encoding
            const responseHeaders = this.formatResponseHeaders(helloResponseData, {
                contentType: CONTENT_TYPES.TEXT_PLAIN,
                includeSecurityHeaders: true,
                includeServerInfo: true
            });

            // Add response timestamp and correlation ID for tracking
            if (responseContext.options.includeTimestamp) {
                responseHeaders[HTTP_HEADERS.DATE] = new Date().toUTCString();
            }
            
            if (responseContext.options.includeCorrelationId && responseContext.correlationId) {
                responseHeaders['X-Correlation-ID'] = responseContext.correlationId;
            }

            // Write response headers using response.writeHead with status and headers
            response.writeHead(statusCode, responseHeaders);

            // Send hello world message body using response.end with RESPONSE_MESSAGES.HELLO_WORLD
            response.end(helloResponseData.content);

            // Log successful hello response generation with logResponseGeneration
            logResponseGeneration('hello', {
                statusCode: statusCode,
                headers: responseHeaders,
                body: helloResponseData.content,
                contentLength: helloResponseData.contentLength
            }, responseContext);

            // Update response metrics for hello endpoint success tracking
            this.updateResponseMetrics('hello', statusCode, 
                performance.now() - responseContext.startTime, helloResponseData);

        } catch (error) {
            // Handle hello response generation errors
            this.logger.error('Hello response generation failed', {
                error: error.message,
                requestUrl: request.url,
                requestMethod: request.method
            });

            await this.sendServerError(request, response, error, context);
        }
    }

    /**
     * Generates and sends 404 Not Found response for requests to non-existent endpoints
     * with proper error formatting and headers. Implements secure not found error handling
     * with generic error messages that prevent information disclosure about existing
     * routes while providing appropriate HTTP status codes and error content.
     * 
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {object} context - Response context with correlation and timing information
     * @returns {Promise<void>} Completes 404 Not Found response generation and transmission
     */
    async sendNotFound(request, response, context = null) {
        try {
            // Create response context for not found error response processing
            const responseContext = context || createResponseContext(request, response, {
                includeTimestamp: true,
                includeCorrelationId: true
            });

            // Generate error response using ErrorHandler.handleNotFoundError method
            const notFoundMessage = 'Not Found';
            const errorResponseData = createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                notFoundMessage,
                { correlationId: responseContext.correlationId },
                { sanitizeMessage: true }
            );

            // Set HTTP status code to 404 using HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
            const statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;

            // Configure error response headers with appropriate content type
            const responseHeaders = this.formatResponseHeaders(errorResponseData, {
                contentType: CONTENT_TYPES.TEXT_PLAIN,
                includeSecurityHeaders: true
            });

            // Create generic not found message without information disclosure
            // (Already handled by createErrorResponse with sanitization)

            // Write response headers and status using response.writeHead
            response.writeHead(statusCode, responseHeaders);

            // Send not found error message using response.end
            response.end(errorResponseData.content);

            // Log not found response with request path for monitoring
            logResponseGeneration('not_found', {
                statusCode: statusCode,
                headers: responseHeaders,
                body: errorResponseData.content,
                contentLength: errorResponseData.contentLength
            }, responseContext);

            // Update error metrics for 404 response tracking and analysis
            this.updateResponseMetrics('not_found', statusCode,
                performance.now() - responseContext.startTime, errorResponseData);

        } catch (error) {
            // Handle not found response generation errors
            this.logger.error('Not found response generation failed', {
                error: error.message,
                requestUrl: request.url,
                requestMethod: request.method
            });

            await this.sendServerError(request, response, error, context);
        }
    }

    /**
     * Generates and sends 405 Method Not Allowed response for unsupported HTTP methods
     * with proper Allow header and error content. Implements HTTP protocol compliance
     * for method validation errors with proper Allow header management and method-specific
     * error messaging that follows HTTP/1.1 specifications.
     * 
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {array} allowedMethods - Array of allowed HTTP methods for the endpoint
     * @param {object} context - Response context with correlation and timing information
     * @returns {Promise<void>} Completes 405 Method Not Allowed response generation and transmission
     */
    async sendMethodNotAllowed(request, response, allowedMethods = ['GET'], context = null) {
        try {
            // Create response context for method not allowed error processing
            const responseContext = context || createResponseContext(request, response, {
                includeTimestamp: true,
                includeCorrelationId: true
            });

            // Generate method not allowed response using ErrorHandler.handleMethodNotAllowed
            const methodNotAllowedMessage = 'Method Not Allowed';
            const errorResponseData = createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                methodNotAllowedMessage,
                { 
                    correlationId: responseContext.correlationId,
                    allowedMethods: allowedMethods 
                },
                { sanitizeMessage: true }
            );

            // Set HTTP status code to 405 using HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED
            const statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;

            // Configure Allow header with comma-separated list of allowed methods
            const responseHeaders = this.formatResponseHeaders(errorResponseData, {
                contentType: CONTENT_TYPES.TEXT_PLAIN,
                includeSecurityHeaders: true
            });

            // Set appropriate content type and error response headers
            responseHeaders['Allow'] = allowedMethods.join(', ');

            // Create method not allowed error message with allowed methods information
            // (Already handled by createErrorResponse)

            // Write response headers including Allow header using response.writeHead
            response.writeHead(statusCode, responseHeaders);

            // Send method not allowed error message using response.end
            response.end(errorResponseData.content);

            // Log method not allowed response with attempted method for security monitoring
            logResponseGeneration('method_not_allowed', {
                statusCode: statusCode,
                headers: responseHeaders,
                body: errorResponseData.content,
                contentLength: errorResponseData.contentLength,
                attemptedMethod: request.method,
                allowedMethods: allowedMethods
            }, responseContext);

            // Update error metrics for method validation failure tracking
            this.updateResponseMetrics('method_not_allowed', statusCode,
                performance.now() - responseContext.startTime, errorResponseData);

        } catch (error) {
            // Handle method not allowed response generation errors
            this.logger.error('Method not allowed response generation failed', {
                error: error.message,
                requestUrl: request.url,
                requestMethod: request.method,
                allowedMethods: allowedMethods
            });

            await this.sendServerError(request, response, error, context);
        }
    }

    /**
     * Generates and sends 500 Internal Server Error response for server-side processing
     * errors with secure error handling and logging. Implements secure server error
     * handling with generic client responses and detailed internal error tracking that
     * prevents information disclosure while providing comprehensive debugging support.
     * 
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {object} error - Error object causing the server error
     * @param {object} context - Response context with correlation and timing information
     * @returns {Promise<void>} Completes server error response generation and transmission
     */
    async sendServerError(request, response, error, context = null) {
        try {
            // Create response context for server error processing and recovery
            const responseContext = context || createResponseContext(request, response, {
                includeTimestamp: true,
                includeCorrelationId: true
            });

            // Process server error using ErrorHandler.handle with error classification
            const errorId = generateErrorId('server', responseContext.correlationId);
            
            // Set HTTP status code to 500 using HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR
            const statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;

            // Generate secure error response without sensitive information disclosure
            const serverErrorMessage = 'Internal Server Error';
            const errorResponseData = createErrorResponse(
                statusCode,
                serverErrorMessage,
                { 
                    correlationId: responseContext.correlationId,
                    errorId: errorId 
                },
                { sanitizeMessage: true }
            );

            // Configure error response headers with appropriate content type
            const responseHeaders = this.formatResponseHeaders(errorResponseData, {
                contentType: CONTENT_TYPES.TEXT_PLAIN,
                includeSecurityHeaders: true
            });

            // Log detailed error information for debugging and monitoring
            const formattedError = formatErrorForLogging(error, {
                requestMethod: request.method,
                requestUrl: request.url,
                userAgent: request.headers['user-agent'],
                remoteAddress: request.connection?.remoteAddress
            }, responseContext.correlationId);

            this.logger.error('Server error occurred', {
                errorId: errorId,
                formattedError: formattedError,
                requestInfo: {
                    method: request.method,
                    url: request.url,
                    userAgent: request.headers['user-agent']
                },
                securityNote: 'Sensitive details logged internally only'
            });

            // Write response headers and status using response.writeHead
            response.writeHead(statusCode, responseHeaders);

            // Send generic server error message using response.end
            response.end(errorResponseData.content);

            // Update server error metrics and alert thresholds if necessary
            this.updateResponseMetrics('server_error', statusCode,
                performance.now() - responseContext.startTime, errorResponseData);

            // Log response generation for monitoring
            logResponseGeneration('server_error', {
                statusCode: statusCode,
                headers: responseHeaders,
                body: errorResponseData.content,
                contentLength: errorResponseData.contentLength,
                errorId: errorId
            }, responseContext);

        } catch (handlingError) {
            // Ultimate fallback for server error handling failures
            this.logger.error('Server error handling failed', {
                originalError: error?.message,
                handlingError: handlingError.message
            });

            try {
                response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
                response.end('Internal Server Error');
            } catch (responseError) {
                // Connection may be broken - nothing more we can do
                this.logger.error('Response transmission failed', {
                    error: responseError.message
                });
            }
        }
    }

    /**
     * Main response generation method that coordinates response creation based on routing
     * decisions and processing results with comprehensive error handling. Serves as the
     * central response coordination point that delegates to appropriate response methods
     * based on response type while providing unified error handling and logging.
     * 
     * @param {string} responseType - Type of response to generate (hello, not_found, method_not_allowed, server_error)
     * @param {object} request - HTTP request object from Node.js
     * @param {object} response - HTTP response object from Node.js
     * @param {object} data - Response data and context information
     * @param {object} options - Response generation options and configuration
     * @returns {Promise<void>} Completes response generation and delegation to appropriate response method
     */
    async generateResponse(responseType, request, response, data = {}, options = {}) {
        try {
            // Validate response generation parameters using validateResponseData
            if (!responseType || typeof responseType !== 'string') {
                throw new Error('Response type is required and must be a string');
            }

            if (!request || !response) {
                throw new Error('Request and response objects are required');
            }

            // Create comprehensive response context with request and response data
            const responseContext = createResponseContext(request, response, {
                ...options,
                responseType: responseType
            });

            // Determine response strategy based on responseType parameter
            this.logger.debug('Generating response', {
                responseType: responseType,
                correlationId: responseContext.correlationId,
                requestMethod: request.method,
                requestUrl: request.url
            });

            // Delegate to appropriate response method based on response type
            switch (responseType.toLowerCase()) {
                case 'hello':
                    // For 'hello' type, delegate to sendHello method with context
                    await this.sendHello(request, response, responseContext);
                    break;

                case 'not_found':
                    // For 'not_found' type, delegate to sendNotFound method
                    await this.sendNotFound(request, response, responseContext);
                    break;

                case 'method_not_allowed':
                    // For 'method_not_allowed' type, delegate to sendMethodNotAllowed with allowed methods
                    const allowedMethods = data.allowedMethods || ['GET'];
                    await this.sendMethodNotAllowed(request, response, allowedMethods, responseContext);
                    break;

                case 'server_error':
                    // For 'server_error' type, delegate to sendServerError with error context
                    const error = data.error || new Error('Unknown server error');
                    await this.sendServerError(request, response, error, responseContext);
                    break;

                default:
                    // Handle unknown response types with server error
                    throw new Error(`Unknown response type: ${responseType}`);
            }

            // Log response generation completion with type and status information
            this.logger.info('Response generation completed', {
                responseType: responseType,
                correlationId: responseContext.correlationId,
                processingTime: performance.now() - responseContext.startTime
            });

            // Update comprehensive response metrics for monitoring and analysis
            this.responseMetrics.responseCount++;

        } catch (error) {
            // Handle any response generation errors with fallback error responses
            this.logger.error('Response generation failed', {
                error: error.message,
                responseType: responseType,
                requestUrl: request.url,
                requestMethod: request.method
            });

            await this.sendServerError(request, response, error, null);
        }
    }

    /**
     * Formats and validates HTTP response headers ensuring proper content type, encoding,
     * and security headers for protocol compliance. Provides centralized header management
     * with validation, normalization, and security header injection for consistent
     * HTTP response formatting across all response types.
     * 
     * @param {object} responseData - Response data containing content and metadata
     * @param {object} headerOptions - Header formatting options and configuration
     * @returns {object} Formatted headers object with proper HTTP header formatting and validation
     */
    formatResponseHeaders(responseData, headerOptions = {}) {
        try {
            // Initialize headers object with default HTTP headers
            const headers = {};

            // Set Content-Type header using CONTENT_TYPES constants
            const contentType = headerOptions.contentType || 
                              responseData.contentType || 
                              CONTENT_TYPES.TEXT_PLAIN;
            headers[HTTP_HEADERS.CONTENT_TYPE] = contentType;

            // Calculate and set Content-Length header based on response body
            const content = responseData.content || responseData.body || '';
            const contentLength = responseData.contentLength || 
                                Buffer.byteLength(content, 'utf8');
            headers[HTTP_HEADERS.CONTENT_LENGTH] = contentLength.toString();

            // Add Date header with current timestamp for HTTP compliance
            headers[HTTP_HEADERS.DATE] = new Date().toUTCString();

            // Include Server header with application identification
            if (headerOptions.includeServerInfo !== false) {
                headers[HTTP_HEADERS.SERVER] = SERVER_IDENTIFICATION.NAME;
            }

            // Add security headers for basic protection and compliance
            if (headerOptions.includeSecurityHeaders) {
                // X-Content-Type-Options to prevent MIME sniffing
                headers['X-Content-Type-Options'] = SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS;
                
                // Additional security headers for production readiness
                headers['X-Frame-Options'] = 'DENY';
                headers['X-XSS-Protection'] = '1; mode=block';
            }

            // Format header names with proper case using HTTP_HEADERS constants
            // (Headers are already in proper case from constants)

            // Add any custom headers from response data
            if (responseData.headers && typeof responseData.headers === 'object') {
                Object.keys(responseData.headers).forEach(headerName => {
                    if (!headers[headerName]) {
                        headers[headerName] = responseData.headers[headerName];
                    }
                });
            }

            // Add any additional headers from options
            if (headerOptions.customHeaders && typeof headerOptions.customHeaders === 'object') {
                Object.keys(headerOptions.customHeaders).forEach(headerName => {
                    headers[headerName] = headerOptions.customHeaders[headerName];
                });
            }

            // Validate all headers for HTTP/1.1 compliance and format
            Object.keys(headers).forEach(headerName => {
                const headerValue = headers[headerName];
                
                // Ensure header values are strings
                if (typeof headerValue !== 'string') {
                    headers[headerName] = String(headerValue);
                }
                
                // Validate header name format (basic validation)
                if (!/^[a-zA-Z0-9\-_]+$/.test(headerName)) {
                    this.logger.warn('Invalid header name format', {
                        headerName: headerName,
                        headerValue: headerValue
                    });
                }
            });

            // Return formatted headers object ready for response transmission
            return headers;

        } catch (error) {
            // Fallback header formatting if primary formatting fails
            this.logger.error('Header formatting failed', {
                error: error.message,
                responseData: responseData,
                headerOptions: headerOptions
            });

            return {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                [HTTP_HEADERS.CONTENT_LENGTH]: '0',
                [HTTP_HEADERS.DATE]: new Date().toUTCString()
            };
        }
    }

    /**
     * Validates complete response objects including status codes, headers, and content
     * for HTTP protocol compliance and response integrity. Performs comprehensive
     * validation of response components to ensure proper HTTP/1.1 protocol compliance
     * and response integrity across all response generation scenarios.
     * 
     * @param {object} responseObject - Complete response object with status, headers, and content
     * @param {object} validationOptions - Validation configuration options and rules
     * @returns {object} Response validation result with compliance status and detailed validation information
     */
    validateResponse(responseObject, validationOptions = {}) {
        try {
            // Use the global validateResponseData function for comprehensive validation
            const validationResult = validateResponseData(responseObject, validationOptions);

            // Add additional validation specific to ResponseHandler
            if (validationResult.isValid) {
                // Validate response timing if available
                if (responseObject.processingTime && responseObject.processingTime > 5000) {
                    validationResult.issues.push('Response processing time exceeds threshold (5000ms)');
                }

                // Validate response size constraints
                const contentLength = responseObject.contentLength || 
                                    Buffer.byteLength(responseObject.body || '', 'utf8');
                if (contentLength > 1024 * 1024) { // 1MB limit
                    validationResult.issues.push('Response content exceeds size limit (1MB)');
                }
            }

            // Update validation status based on additional checks
            validationResult.isValid = validationResult.issues.length === 0;

            return validationResult;

        } catch (error) {
            this.logger.error('Response validation failed', {
                error: error.message,
                responseObject: responseObject
            });

            return {
                isValid: false,
                issues: [`Validation error: ${error.message}`],
                normalizedData: null
            };
        }
    }

    /**
     * Retrieves response handler performance metrics including response counts, timing
     * statistics, and error rates for monitoring and optimization. Provides comprehensive
     * metrics data for monitoring dashboards, performance analysis, and operational
     * visibility into response handler performance characteristics.
     * 
     * @param {object} metricsOptions - Metrics retrieval options and filters
     * @returns {object} Response handler metrics with performance data and statistics
     */
    getResponseMetrics(metricsOptions = {}) {
        try {
            // Aggregate response counts by type and status code
            const currentTime = new Date().toISOString();
            const uptimeMs = Date.now() - new Date(this.responseMetrics.startTime).getTime();
            
            // Calculate response processing times and performance statistics
            const performanceStats = {
                totalResponses: this.responseMetrics.responseCount,
                successfulResponses: this.responseMetrics.successCount,
                errorResponses: this.responseMetrics.errorCount,
                averageResponseTime: this.responseMetrics.averageResponseTime,
                uptimeMs: uptimeMs,
                uptimeSeconds: Math.round(uptimeMs / 1000),
                responsesPerSecond: uptimeMs > 0 ? 
                    (this.responseMetrics.responseCount / (uptimeMs / 1000)).toFixed(4) : 0
            };

            // Compile error rates and response failure statistics
            const errorRates = {
                errorRate: this.responseMetrics.responseCount > 0 ? 
                    (this.responseMetrics.errorCount / this.responseMetrics.responseCount).toFixed(4) : 0,
                successRate: this.responseMetrics.responseCount > 0 ? 
                    (this.responseMetrics.successCount / this.responseMetrics.responseCount).toFixed(4) : 0
            };

            // Include hello endpoint specific response metrics
            const endpointMetrics = {
                helloEndpointResponses: this.responseMetrics.helloCount || 0,
                notFoundResponses: this.responseMetrics.notFoundCount || 0,
                methodNotAllowedResponses: this.responseMetrics.methodNotAllowedCount || 0,
                serverErrorResponses: this.responseMetrics.serverErrorCount || 0
            };

            // Add response handler performance benchmarks
            const handlerInfo = {
                handlerName: this.config.handlerName,
                version: this.config.version,
                configuration: this.config,
                startTime: this.responseMetrics.startTime,
                currentTime: currentTime
            };

            // Format metrics data for monitoring systems integration
            const metricsData = {
                summary: performanceStats,
                errorRates: errorRates,
                endpointBreakdown: endpointMetrics,
                handlerInfo: handlerInfo,
                timestamp: currentTime
            };

            // Return comprehensive response metrics object
            return metricsData;

        } catch (error) {
            this.logger.error('Metrics retrieval failed', {
                error: error.message
            });

            return {
                error: 'Metrics retrieval failed',
                totalResponses: this.responseMetrics.responseCount || 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Updates response handler metrics with latest response processing data including
     * timing, status codes, and performance indicators. Maintains comprehensive metrics
     * for monitoring dashboards and performance analysis with rolling averages and
     * response categorization for operational visibility.
     * 
     * @param {string} responseType - Type of response for metrics categorization
     * @param {number} statusCode - HTTP status code for response classification
     * @param {number} processingTime - Response processing time in milliseconds
     * @param {object} responseData - Response data for additional metrics collection
     * @returns {void} Updates internal response metrics for monitoring and performance tracking
     */
    updateResponseMetrics(responseType, statusCode, processingTime, responseData) {
        try {
            // Identify response type and appropriate metric collection category
            const responseCategory = getStatusCategory(statusCode);
            
            // Update response count metrics by type and status code
            this.responseMetrics.responseCount++;
            
            // Record response processing time and performance characteristics
            if (typeof processingTime === 'number' && processingTime >= 0) {
                // Calculate rolling average for response times
                const currentAverage = this.responseMetrics.averageResponseTime || 0;
                const responseCount = this.responseMetrics.responseCount;
                
                this.responseMetrics.averageResponseTime = 
                    ((currentAverage * (responseCount - 1)) + processingTime) / responseCount;
            }

            // Update success and error rate metrics based on status code
            if (isClientError(statusCode) || isServerError(statusCode)) {
                this.responseMetrics.errorCount++;
            } else {
                this.responseMetrics.successCount++;
            }

            // Maintain rolling averages for response performance analysis
            // Update response type specific counters
            const typeCounterKey = `${responseType}Count`;
            if (this.responseMetrics[typeCounterKey] !== undefined) {
                this.responseMetrics[typeCounterKey]++;
            } else {
                this.responseMetrics[typeCounterKey] = 1;
            }

            // Update response size and content metrics for optimization
            if (responseData && responseData.contentLength) {
                if (!this.responseMetrics.totalBytesTransferred) {
                    this.responseMetrics.totalBytesTransferred = 0;
                }
                this.responseMetrics.totalBytesTransferred += responseData.contentLength;
            }

            // Update last response timestamp
            this.responseMetrics.lastResponseTime = new Date().toISOString();

            // Trigger alerts if response metric thresholds are exceeded
            if (this.responseMetrics.averageResponseTime > 1000) { // 1 second threshold
                this.logger.warn('High average response time detected', {
                    averageResponseTime: this.responseMetrics.averageResponseTime,
                    threshold: 1000,
                    responseCount: this.responseMetrics.responseCount
                });
            }

            if (this.responseMetrics.errorCount > 0 && 
                (this.responseMetrics.errorCount / this.responseMetrics.responseCount) > 0.1) { // 10% error rate
                this.logger.warn('High error rate detected', {
                    errorRate: (this.responseMetrics.errorCount / this.responseMetrics.responseCount).toFixed(4),
                    errorCount: this.responseMetrics.errorCount,
                    totalResponses: this.responseMetrics.responseCount
                });
            }

        } catch (error) {
            // Fail silently for metrics updates to avoid recursive errors
            this.logger.warn('Metrics update failed', {
                error: error.message,
                responseType: responseType,
                statusCode: statusCode
            });
        }
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Export all response handling components for use throughout the Node.js tutorial application.
 * 
 * This module provides comprehensive response handling capabilities including:
 * - ResponseHandler class for complete response processing and coordination
 * - Response context creation functions for correlation and tracking
 * - Response validation utilities for HTTP protocol compliance
 * - Response logging functions for monitoring and debugging
 * - Response metrics collection for performance analysis
 * 
 * All components implement comprehensive response handling patterns with educational
 * clarity, security considerations, and production-ready response management.
 */

// Export main ResponseHandler class
export { ResponseHandler };

// Export utility functions for response processing
export { createResponseContext };
export { generateResponseId };
export { validateResponseData };
export { logResponseGeneration };

// Export default configured response handler instance
const responseHandler = new ResponseHandler({
    enableLogging: true,
    enableMetrics: true,
    enableErrorHandling: true,
    defaultContentType: CONTENT_TYPES.TEXT_PLAIN
});

// Export default response handler instance for immediate use
export { responseHandler };

// Default export for convenient access to ResponseHandler class
export default ResponseHandler;

/**
 * Export Summary:
 * 
 * Main Class:
 * - ResponseHandler: Comprehensive response generation and coordination class
 * 
 * Utility Functions:
 * - createResponseContext: Response context creation with correlation tracking
 * - generateResponseId: Unique response identifier generation for tracking
 * - validateResponseData: Response validation for HTTP protocol compliance
 * - logResponseGeneration: Structured response logging for monitoring
 * 
 * Default Instance:
 * - responseHandler: Pre-configured ResponseHandler instance for immediate use
 * 
 * Integration Examples:
 * 
 * // Using ResponseHandler class
 * import { ResponseHandler } from './lib/response-handler.js';
 * const handler = new ResponseHandler({ enableLogging: true });
 * await handler.sendHello(request, response);
 * 
 * // Using default instance
 * import { responseHandler } from './lib/response-handler.js';
 * await responseHandler.generateResponse('hello', request, response);
 * 
 * // Using utility functions
 * import { createResponseContext, logResponseGeneration } from './lib/response-handler.js';
 * const context = createResponseContext(request, response);
 * logResponseGeneration('hello', responseData, context);
 * 
 * Educational Value:
 * - Demonstrates comprehensive HTTP response generation patterns
 * - Shows integration between logging, error handling, and metrics systems
 * - Illustrates proper response validation and HTTP protocol compliance
 * - Provides examples of correlation tracking and performance monitoring
 * - Shows production-ready response management with educational clarity
 * - Demonstrates security-conscious response handling with information disclosure prevention
 */