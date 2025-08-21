/**
 * Not Found Route Handler Module for Node.js Tutorial Application
 * 
 * Implements comprehensive catch-all routing for unmatched HTTP requests with advanced error handling,
 * security validation, and standardized error response generation. Provides production-ready error 
 * handling patterns while maintaining educational clarity for HTTP error response concepts including 
 * route fallback, method validation, and secure error reporting.
 * 
 * This module demonstrates enterprise-grade error handling architecture with:
 * - Comprehensive 404 Not Found and 405 Method Not Allowed response generation
 * - Advanced security validation and injection prevention mechanisms
 * - Structured logging and operational monitoring capabilities
 * - Production-ready error response formatting and HTTP compliance
 * - Educational patterns for understanding HTTP error handling concepts
 * - Integration with application security, validation, and monitoring systems
 * 
 * Educational Objectives:
 * - Demonstrates proper HTTP error handling implementation patterns
 * - Shows secure error response generation without information disclosure
 * - Illustrates comprehensive request validation and security checking
 * - Provides examples of structured logging and operational monitoring
 * - Shows integration patterns between error handling and application architecture
 * - Demonstrates production-ready observability patterns for error tracking
 * 
 * @fileoverview Comprehensive not found route handler with security validation and error monitoring
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Import core route handling logic for not found route processing and error delegation
const { RouteHandler } = require('../lib/route-handler.js'); // v1.0.0

// Import base controller for foundational error handling and request processing capabilities
const { BaseController } = require('../controllers/base.controller.js'); // v1.0.0

// Import HTTP status code constants for 404 Not Found and 405 Method Not Allowed responses
const { 
    HTTP_STATUS_CODES, 
    isClientError 
} = require('../utils/http-status.js'); // v1.0.0

// Import standardized error message constants for secure error reporting
const { 
    ERROR_MESSAGES, 
    HTTP_ERROR_MESSAGES 
} = require('../constants/error-messages.js'); // v1.0.0

// Import HTTP method constants for method validation and Allow header generation
const { 
    HTTP_METHODS, 
    getAllowedMethodsForEndpoint 
} = require('../constants/http-methods.js'); // v1.0.0

// Import response utilities for standardized error response generation
const { 
    createErrorResponse, 
    formatHeaders, 
    validateResponse 
} = require('../utils/response-utils.js'); // v1.0.0

// Import validation utilities for security validation and input sanitization
const { validateUrlPath } = require('../utils/validation.js'); // v1.0.0

// Import structured logger for not found route tracking and security monitoring
const { logger } = require('../utils/logger.js'); // v1.0.0

// ============================================================================
// GLOBAL CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Default configuration object for not found route including catch-all patterns 
 * and comprehensive error handling settings for robust error management.
 */
const NOT_FOUND_ROUTE_CONFIG = {
    // Catch-all route pattern for handling unmatched requests
    catchAllPattern: '*',
    
    // Error types handled by the not found route
    errorTypes: ['404_NOT_FOUND', '405_METHOD_NOT_ALLOWED'],
    
    // Security settings for error response generation
    securitySettings: {
        enableInputValidation: true,
        enableSecurityLogging: true,
        preventInformationDisclosure: true,
        sanitizeErrorMessages: true
    },
    
    // Response formatting configuration
    responseConfig: {
        contentType: 'text/plain',
        charset: 'utf-8',
        includeTimestamp: true,
        includeCorrelationId: true
    },
    
    // Logging configuration for operational monitoring
    loggingConfig: {
        logNotFoundRequests: true,
        logMethodNotAllowed: true,
        logSecurityEvents: true,
        includeClientInfo: true
    },
    
    // Performance and operational settings
    operationalSettings: {
        enableMetrics: true,
        trackResponseTimes: true,
        monitorErrorPatterns: true,
        enableHealthChecks: true
    }
};

/**
 * Array of error types handled by the not found route including 
 * comprehensive error classification and response mapping.
 */
const SUPPORTED_ERROR_TYPES = [
    {
        type: 'NOT_FOUND',
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
        message: HTTP_ERROR_MESSAGES.STATUS_404_MESSAGE,
        category: 'client_error',
        severity: 'low'
    },
    {
        type: 'METHOD_NOT_ALLOWED',
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
        message: HTTP_ERROR_MESSAGES.STATUS_405_MESSAGE,
        category: 'client_error',
        severity: 'medium'
    }
];

/**
 * Default HTTP headers applied to all error responses for security 
 * and content type specification with comprehensive security headers.
 */
const DEFAULT_ERROR_HEADERS = {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

// ============================================================================
// STANDALONE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Factory function that creates and configures a NotFoundRoute instance with default 
 * settings for catch-all route handling and comprehensive error response generation.
 * 
 * @param {Object} [routeOptions={}] - Configuration options for route initialization
 * @param {Object} [routeOptions.config] - Custom configuration overrides
 * @param {boolean} [routeOptions.enableMetrics=true] - Enable metrics collection
 * @param {boolean} [routeOptions.strictValidation=true] - Enable strict validation mode
 * @returns {NotFoundRoute} Configured NotFoundRoute instance ready for route registration
 */
function createNotFoundRoute(routeOptions = {}) {
    try {
        // Validate and merge route options with default configuration
        const mergedConfig = {
            ...NOT_FOUND_ROUTE_CONFIG,
            ...routeOptions.config
        };
        
        // Create NotFoundRoute instance with merged configuration
        const notFoundRoute = new NotFoundRoute({
            config: mergedConfig,
            enableMetrics: routeOptions.enableMetrics !== false,
            strictValidation: routeOptions.strictValidation !== false
        });
        
        // Configure catch-all route pattern for unmatched request handling
        notFoundRoute.configureRoute({
            pattern: mergedConfig.catchAllPattern,
            errorTypes: mergedConfig.errorTypes,
            securitySettings: mergedConfig.securitySettings
        });
        
        // Set up error response generation with standardized formatting
        notFoundRoute._initializeErrorResponses();
        
        // Initialize logging and metrics collection for operational monitoring
        if (routeOptions.enableMetrics !== false) {
            notFoundRoute._initializeMetrics();
        }
        
        // Configure security settings and error message sanitization
        notFoundRoute._configureSecuritySettings(mergedConfig.securitySettings);
        
        logger.info('NotFoundRoute created successfully', {
            config: mergedConfig,
            enableMetrics: routeOptions.enableMetrics !== false,
            strictValidation: routeOptions.strictValidation !== false
        });
        
        // Return configured NotFoundRoute instance ready for registration
        return notFoundRoute;
        
    } catch (error) {
        logger.error('Failed to create NotFoundRoute', { error: error.message }, error);
        throw new Error(`NotFoundRoute creation failed: ${error.message}`);
    }
}

/**
 * Validates incoming requests for not found route processing including path sanitization,
 * method validation, and comprehensive security checks before error response generation.
 * 
 * @param {Object} request - HTTP request object to validate
 * @param {Object} [validationOptions={}] - Additional validation configuration
 * @param {boolean} [validationOptions.strictMode=true] - Enable strict validation
 * @param {boolean} [validationOptions.enableSecurityChecks=true] - Enable security validation
 * @returns {Object} Request validation result with sanitized path and error classification
 */
function validateNotFoundRequest(request, validationOptions = {}) {
    const startTime = Date.now();
    
    // Initialize validation options with defaults
    const options = {
        strictMode: true,
        enableSecurityChecks: true,
        sanitizePath: true,
        validateMethod: true,
        ...validationOptions
    };
    
    // Create comprehensive validation result object
    const result = {
        isValid: false,
        sanitizedPath: null,
        normalizedMethod: null,
        errorType: null,
        securityAssessment: {
            threatLevel: 'none',
            validationPassed: false,
            securityWarnings: []
        },
        errors: [],
        warnings: [],
        metadata: {
            timestamp: new Date().toISOString(),
            validationId: `nf_val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            processingTime: 0
        }
    };
    
    try {
        // Validate request object structure and required properties
        if (!request || typeof request !== 'object') {
            result.errors.push('Invalid request object: must be a valid HTTP request');
            return result;
        }
        
        // Validate and normalize HTTP method with security checking
        if (options.validateMethod) {
            if (!request.method || typeof request.method !== 'string') {
                result.errors.push('Missing or invalid HTTP method');
                result.errorType = 'BAD_REQUEST';
                return result;
            }
            
            result.normalizedMethod = request.method.trim().toUpperCase();
            
            // Validate method against supported HTTP methods
            const supportedMethods = Object.values(HTTP_METHODS);
            if (!supportedMethods.includes(result.normalizedMethod)) {
                result.errors.push(`Unsupported HTTP method: ${result.normalizedMethod}`);
                result.errorType = 'METHOD_NOT_ALLOWED';
            }
        }
        
        // Extract and validate URL path with security sanitization
        if (!request.url || typeof request.url !== 'string') {
            result.errors.push('Missing or invalid URL path');
            result.errorType = 'BAD_REQUEST';
            return result;
        }
        
        // Perform comprehensive URL path validation and sanitization
        if (options.sanitizePath) {
            const pathValidation = validateUrlPath(request.url, {
                strictMode: options.strictMode,
                sanitize: true,
                includeWarnings: true
            });
            
            if (!pathValidation.isValid) {
                result.errors.push(...pathValidation.errors);
                result.warnings.push(...pathValidation.warnings);
                result.securityAssessment.threatLevel = pathValidation.securityAssessment?.threatLevel || 'medium';
                result.securityAssessment.securityWarnings.push(...pathValidation.securityAssessment?.suspiciousPatterns || []);
                return result;
            }
            
            result.sanitizedPath = pathValidation.sanitizedPath;
            result.securityAssessment.validationPassed = true;
        } else {
            result.sanitizedPath = request.url;
        }
        
        // Classify request as not found or method not allowed based on endpoint analysis
        const pathname = result.sanitizedPath.split('?')[0].split('#')[0];
        
        // Check if path matches known endpoints for method validation
        if (pathname === '/hello') {
            // For known endpoints, check if method is allowed
            const allowedMethods = getAllowedMethodsForEndpoint('/hello');
            if (!allowedMethods.includes(result.normalizedMethod)) {
                result.errorType = 'METHOD_NOT_ALLOWED';
                result.errors.push(`Method ${result.normalizedMethod} not allowed for ${pathname}`);
            } else {
                // This should not reach not found route, but validate anyway
                result.warnings.push('Request for known endpoint reached not found route');
                result.errorType = 'NOT_FOUND';
            }
        } else {
            // Unknown path - classify as not found
            result.errorType = 'NOT_FOUND';
        }
        
        // Perform comprehensive security validation if enabled
        if (options.enableSecurityChecks) {
            const securityCheck = _performSecurityValidation(request, result);
            if (!securityCheck.passed) {
                result.securityAssessment.threatLevel = securityCheck.threatLevel;
                result.securityAssessment.securityWarnings.push(...securityCheck.warnings);
                result.warnings.push('Security validation warnings detected');
            }
        }
        
        // Set validation success based on error classification
        result.isValid = result.errors.length === 0 && result.errorType !== null;
        
        // Include processing time for performance monitoring
        result.metadata.processingTime = Date.now() - startTime;
        
        logger.debug('NotFound request validation completed', {
            validationId: result.metadata.validationId,
            isValid: result.isValid,
            errorType: result.errorType,
            processingTime: result.metadata.processingTime,
            securityAssessment: result.securityAssessment
        });
        
    } catch (error) {
        result.errors.push(`Request validation error: ${error.message}`);
        result.securityAssessment.threatLevel = 'critical';
        logger.error('NotFound request validation failed', { 
            error: error.message,
            validationId: result.metadata.validationId 
        }, error);
    }
    
    return result;
}

/**
 * Generates standardized 404 Not Found error response with proper headers, status codes,
 * and secure error messaging for unmatched route requests with comprehensive formatting.
 * 
 * @param {Object} request - HTTP request object for context
 * @param {Object} [responseOptions={}] - Response generation options
 * @param {boolean} [responseOptions.includeHeaders=true] - Include security headers
 * @param {boolean} [responseOptions.sanitizeErrors=true] - Sanitize error messages
 * @returns {Object} Complete 404 error response with headers and secure message
 */
function generateNotFoundResponse(request, responseOptions = {}) {
    const startTime = Date.now();
    
    // Initialize response options with defaults
    const options = {
        includeHeaders: true,
        sanitizeErrors: true,
        includeTimestamp: true,
        includeCorrelationId: true,
        ...responseOptions
    };
    
    try {
        // Create standardized error response using response utilities
        const errorResponse = createErrorResponse({
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
            message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
            errorType: 'NOT_FOUND',
            sanitize: options.sanitizeErrors
        });
        
        // Format comprehensive response headers with security settings
        const responseHeaders = {
            ...DEFAULT_ERROR_HEADERS,
            'Content-Length': Buffer.byteLength(errorResponse.body, 'utf8').toString()
        };
        
        // Add timestamp header if enabled
        if (options.includeTimestamp) {
            responseHeaders['Date'] = new Date().toUTCString();
        }
        
        // Add correlation ID for request tracking
        if (options.includeCorrelationId) {
            const correlationId = `nf_404_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            responseHeaders['X-Correlation-ID'] = correlationId;
        }
        
        // Format headers using response utilities for HTTP compliance
        const formattedHeaders = options.includeHeaders ? 
            formatHeaders(responseHeaders) : {};
        
        // Create complete 404 response object
        const response = {
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
            statusMessage: 'Not Found',
            headers: formattedHeaders,
            body: errorResponse.body,
            metadata: {
                timestamp: new Date().toISOString(),
                responseId: `404_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: Date.now() - startTime,
                errorType: 'NOT_FOUND',
                requestPath: request?.url || 'unknown'
            }
        };
        
        // Validate response using response utilities for HTTP compliance
        const validation = validateResponse(response);
        if (!validation.isValid) {
            logger.warn('Generated 404 response failed validation', {
                errors: validation.errors,
                responseId: response.metadata.responseId
            });
        }
        
        logger.info('Generated 404 Not Found response', {
            responseId: response.metadata.responseId,
            requestPath: response.metadata.requestPath,
            processingTime: response.metadata.processingTime
        });
        
        return response;
        
    } catch (error) {
        logger.error('Failed to generate 404 Not Found response', { 
            error: error.message,
            requestUrl: request?.url 
        }, error);
        
        // Return minimal fallback response
        return {
            statusCode: 404,
            statusMessage: 'Not Found',
            headers: { 'Content-Type': 'text/plain' },
            body: 'Not Found',
            metadata: {
                timestamp: new Date().toISOString(),
                error: 'Response generation failed'
            }
        };
    }
}

/**
 * Generates standardized 405 Method Not Allowed error response with proper Allow header
 * and secure error messaging for unsupported method requests with method restrictions.
 * 
 * @param {Object} request - HTTP request object for context
 * @param {string} endpoint - The endpoint path for method determination
 * @param {Object} [responseOptions={}] - Response generation options
 * @returns {Object} Complete 405 error response with Allow header and method restrictions
 */
function generateMethodNotAllowedResponse(request, endpoint, responseOptions = {}) {
    const startTime = Date.now();
    
    // Initialize response options with defaults
    const options = {
        includeHeaders: true,
        includeAllowHeader: true,
        sanitizeErrors: true,
        includeTimestamp: true,
        ...responseOptions
    };
    
    try {
        // Get allowed methods for the specific endpoint
        const allowedMethods = getAllowedMethodsForEndpoint(endpoint);
        
        // Create standardized error response for method not allowed
        const errorResponse = createErrorResponse({
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
            message: HTTP_ERROR_MESSAGES.STATUS_405_MESSAGE,
            errorType: 'METHOD_NOT_ALLOWED',
            sanitize: options.sanitizeErrors,
            context: {
                requestedMethod: request?.method,
                allowedMethods: allowedMethods,
                endpoint: endpoint
            }
        });
        
        // Format comprehensive response headers including Allow header
        const responseHeaders = {
            ...DEFAULT_ERROR_HEADERS,
            'Content-Length': Buffer.byteLength(errorResponse.body, 'utf8').toString()
        };
        
        // Add Allow header with supported methods for the endpoint
        if (options.includeAllowHeader && allowedMethods.length > 0) {
            responseHeaders['Allow'] = allowedMethods.join(', ');
        }
        
        // Add timestamp header if enabled
        if (options.includeTimestamp) {
            responseHeaders['Date'] = new Date().toUTCString();
        }
        
        // Add correlation ID for request tracking
        const correlationId = `nf_405_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        responseHeaders['X-Correlation-ID'] = correlationId;
        
        // Format headers using response utilities for HTTP compliance
        const formattedHeaders = options.includeHeaders ? 
            formatHeaders(responseHeaders) : {};
        
        // Create complete 405 response object with method restriction details
        const response = {
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
            statusMessage: 'Method Not Allowed',
            headers: formattedHeaders,
            body: errorResponse.body,
            metadata: {
                timestamp: new Date().toISOString(),
                responseId: correlationId,
                processingTime: Date.now() - startTime,
                errorType: 'METHOD_NOT_ALLOWED',
                requestMethod: request?.method || 'unknown',
                allowedMethods: allowedMethods,
                endpoint: endpoint
            }
        };
        
        // Validate response using response utilities for HTTP compliance
        const validation = validateResponse(response);
        if (!validation.isValid) {
            logger.warn('Generated 405 response failed validation', {
                errors: validation.errors,
                responseId: response.metadata.responseId
            });
        }
        
        logger.info('Generated 405 Method Not Allowed response', {
            responseId: response.metadata.responseId,
            requestMethod: response.metadata.requestMethod,
            allowedMethods: response.metadata.allowedMethods,
            endpoint: endpoint,
            processingTime: response.metadata.processingTime
        });
        
        return response;
        
    } catch (error) {
        logger.error('Failed to generate 405 Method Not Allowed response', { 
            error: error.message,
            requestMethod: request?.method,
            endpoint: endpoint 
        }, error);
        
        // Return minimal fallback response
        return {
            statusCode: 405,
            statusMessage: 'Method Not Allowed',
            headers: { 
                'Content-Type': 'text/plain',
                'Allow': 'GET'
            },
            body: 'Method Not Allowed',
            metadata: {
                timestamp: new Date().toISOString(),
                error: 'Response generation failed'
            }
        };
    }
}

/**
 * Logs not found request details including attempted path, method, client information,
 * and security context for comprehensive monitoring and security analysis.
 * 
 * @param {Object} request - HTTP request object with client details
 * @param {string} errorType - Type of error (NOT_FOUND, METHOD_NOT_ALLOWED)
 * @param {Object} [routeContext={}] - Additional route context information
 * @returns {void} Logs structured not found request information for monitoring
 */
function logNotFoundRequest(request, errorType, routeContext = {}) {
    try {
        // Extract comprehensive request details for logging
        const requestDetails = {
            method: request?.method || 'unknown',
            url: request?.url || 'unknown',
            httpVersion: request?.httpVersion || 'unknown',
            timestamp: new Date().toISOString()
        };
        
        // Extract client information safely with fallbacks
        const clientInfo = {
            remoteAddress: request?.connection?.remoteAddress || 
                          request?.socket?.remoteAddress || 'unknown',
            remotePort: request?.connection?.remotePort || 
                       request?.socket?.remotePort || 'unknown',
            userAgent: request?.headers?.['user-agent'] || 'unknown'
        };
        
        // Sanitize request path and headers for secure logging
        const sanitizedPath = (requestDetails.url || '').replace(/[<>\"']/g, '');
        const sanitizedUserAgent = (clientInfo.userAgent || '').slice(0, 200);
        
        // Create structured log entry with correlation ID
        const logEntry = {
            event: 'not_found_request',
            errorType: errorType,
            request: {
                ...requestDetails,
                url: sanitizedPath
            },
            client: {
                ...clientInfo,
                userAgent: sanitizedUserAgent
            },
            context: {
                ...routeContext,
                correlationId: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            security: {
                threatAssessment: _assessSecurityThreat(request, errorType),
                potentialAttack: _detectPotentialAttack(sanitizedPath, requestDetails.method)
            }
        };
        
        // Determine appropriate log level based on error type and security assessment
        const logLevel = _determineLogLevel(errorType, logEntry.security);
        
        // Log with appropriate level and comprehensive context
        switch (logLevel) {
            case 'warn':
                logger.warn('Not found request detected', logEntry);
                break;
            case 'error':
                logger.error('Suspicious not found request', logEntry);
                break;
            case 'info':
            default:
                logger.info('Not found request processed', logEntry);
                break;
        }
        
        // Update not found route metrics for operational monitoring
        if (routeContext.updateMetrics && typeof routeContext.updateMetrics === 'function') {
            routeContext.updateMetrics(errorType, logEntry);
        }
        
    } catch (error) {
        // Fallback logging if structured logging fails
        logger.error('Failed to log not found request', { 
            error: error.message,
            fallbackInfo: {
                method: request?.method,
                url: request?.url,
                errorType: errorType
            }
        });
    }
}

// ============================================================================
// MAIN CLASS IMPLEMENTATIONS
// ============================================================================

/**
 * Not Found route handler class that implements catch-all routing for unmatched HTTP 
 * requests with comprehensive error handling, security validation, and standardized 
 * error response generation. Extends base route functionality to provide production-ready
 * error handling patterns while maintaining educational clarity.
 */
class NotFoundRoute {
    /**
     * Initializes the NotFoundRoute with configuration settings, route handler setup,
     * and comprehensive error handling capabilities for catch-all request processing.
     * 
     * @param {Object} [config={}] - Configuration options for NotFoundRoute initialization
     * @param {Object} [config.config] - Route configuration settings
     * @param {boolean} [config.enableMetrics=true] - Enable metrics collection
     * @param {boolean} [config.strictValidation=true] - Enable strict validation mode
     */
    constructor(config = {}) {
        // Validate and merge configuration with defaults
        this.config = {
            ...NOT_FOUND_ROUTE_CONFIG,
            ...config.config
        };
        
        // Initialize RouteHandler instance for core routing logic
        this.routeHandler = new RouteHandler({
            pattern: this.config.catchAllPattern,
            methods: Object.values(HTTP_METHODS),
            enableValidation: true,
            enableSecurity: true
        });
        
        // Set up structured logger for not found route tracking
        this.logger = logger.createChildLogger(
            { component: 'NotFoundRoute' },
            { routeType: 'catch_all', errorHandling: true }
        );
        
        // Configure error metrics collection for operational monitoring
        this.errorMetrics = {
            totalRequests: 0,
            notFoundCount: 0,
            methodNotAllowedCount: 0,
            securityViolations: 0,
            responseTimeSum: 0,
            averageResponseTime: 0,
            lastReset: new Date(),
            errorPatterns: new Map()
        };
        
        // Set route pattern to catch-all for unmatched request handling
        this.routePattern = this.config.catchAllPattern;
        
        // Initialize supported methods array for proper validation
        this.supportedMethods = Object.values(HTTP_METHODS);
        
        // Configure strict validation mode for enhanced security
        this.strictValidation = config.strictValidation !== false;
        
        // Set up error response generation capabilities
        this._initializeErrorResponses();
        
        // Initialize metrics if enabled
        if (config.enableMetrics !== false) {
            this._initializeMetrics();
        }
        
        this.logger.info('NotFoundRoute initialized successfully', {
            config: this.config,
            strictValidation: this.strictValidation,
            metricsEnabled: config.enableMetrics !== false
        });
    }
    
    /**
     * Configures the not found route with catch-all pattern, error handling middleware,
     * and response generation settings for comprehensive error management.
     * 
     * @param {Object} routeConfiguration - Route configuration parameters
     * @param {string} [routeConfiguration.pattern] - Route pattern override
     * @param {Array} [routeConfiguration.errorTypes] - Supported error types
     * @param {Object} [routeConfiguration.securitySettings] - Security configuration
     * @returns {Object} Route configuration result with setup status and settings
     */
    configureRoute(routeConfiguration = {}) {
        const startTime = Date.now();
        
        const result = {
            success: false,
            configuration: null,
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                configurationId: `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0
            }
        };
        
        try {
            // Validate route configuration parameters
            const config = {
                pattern: routeConfiguration.pattern || this.config.catchAllPattern,
                errorTypes: routeConfiguration.errorTypes || this.config.errorTypes,
                securitySettings: {
                    ...this.config.securitySettings,
                    ...routeConfiguration.securitySettings
                }
            };
            
            // Configure catch-all route pattern for handling unmatched requests
            this.routePattern = config.pattern;
            
            // Set up error handling middleware stack
            this._configureErrorHandling(config.errorTypes);
            
            // Configure response generation settings with proper headers
            this._configureResponseGeneration(config);
            
            // Set up logging configuration for not found request tracking
            this._configureLogging(this.config.loggingConfig);
            
            // Configure security validation settings
            this._configureSecuritySettings(config.securitySettings);
            
            // Store configuration for future reference
            this.configuration = config;
            result.configuration = config;
            result.success = true;
            
            this.logger.info('NotFoundRoute configured successfully', {
                configurationId: result.metadata.configurationId,
                pattern: config.pattern,
                errorTypes: config.errorTypes,
                processingTime: Date.now() - startTime
            });
            
        } catch (error) {
            result.errors.push(`Route configuration failed: ${error.message}`);
            this.logger.error('NotFoundRoute configuration failed', {
                error: error.message,
                configurationId: result.metadata.configurationId
            }, error);
        }
        
        result.metadata.processingTime = Date.now() - startTime;
        return result;
    }
    
    /**
     * Main request handling method that processes unmatched requests and generates 
     * appropriate error responses based on request characteristics and validation results.
     * 
     * @param {Object} request - HTTP request object to process
     * @param {Object} response - HTTP response object for output
     * @param {Object} [requestContext={}] - Additional request context information
     * @returns {Object} Request handling result with error response generation status
     */
    async handleRequest(request, response, requestContext = {}) {
        const startTime = Date.now();
        
        const result = {
            success: false,
            errorType: null,
            responseGenerated: false,
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: requestContext.requestId || `nf_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0
            }
        };
        
        try {
            // Validate incoming request with comprehensive security checks
            const validation = validateNotFoundRequest(request, {
                strictMode: this.strictValidation,
                enableSecurityChecks: this.config.securitySettings.enableInputValidation
            });
            
            if (!validation.isValid) {
                result.errors.push(...validation.errors);
                this.logger.warn('Invalid request received in NotFoundRoute', {
                    requestId: result.metadata.requestId,
                    errors: validation.errors,
                    securityAssessment: validation.securityAssessment
                });
            }
            
            // Classify error type based on request analysis
            result.errorType = validation.errorType || this._classifyErrorType(request);
            
            // Log not found request details for monitoring and security analysis
            logNotFoundRequest(request, result.errorType, {
                requestId: result.metadata.requestId,
                updateMetrics: (errorType, logEntry) => this._updateMetrics(errorType, logEntry)
            });
            
            // Generate appropriate error response based on error type
            let errorResponse;
            if (result.errorType === 'METHOD_NOT_ALLOWED') {
                errorResponse = await this.processMethodNotAllowedError(request, response, validation.sanitizedPath);
            } else {
                errorResponse = await this.processNotFoundError(request, response, { validation });
            }
            
            result.responseGenerated = errorResponse.success;
            result.success = errorResponse.success;
            
            // Update error metrics for operational monitoring
            this._updateErrorMetrics(result.errorType, Date.now() - startTime);
            
            this.logger.info('NotFound request processed successfully', {
                requestId: result.metadata.requestId,
                errorType: result.errorType,
                responseGenerated: result.responseGenerated,
                processingTime: Date.now() - startTime
            });
            
        } catch (error) {
            result.errors.push(`Request processing failed: ${error.message}`);
            this.logger.error('NotFound request processing failed', {
                requestId: result.metadata.requestId,
                error: error.message
            }, error);
            
            // Attempt to send fallback error response
            try {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Internal Server Error');
                result.responseGenerated = true;
            } catch (fallbackError) {
                this.logger.error('Failed to send fallback error response', { error: fallbackError.message });
            }
        }
        
        result.metadata.processingTime = Date.now() - startTime;
        return result;
    }
    
    /**
     * Processes 404 Not Found errors with comprehensive error classification,
     * security validation, and standardized response generation.
     * 
     * @param {Object} request - HTTP request object
     * @param {Object} response - HTTP response object
     * @param {Object} [errorContext={}] - Additional error context information
     * @returns {Object} Not found error processing result with response data
     */
    async processNotFoundError(request, response, errorContext = {}) {
        const startTime = Date.now();
        
        const result = {
            success: false,
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                errorId: `404_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0
            }
        };
        
        try {
            // Validate request path for security assessment
            const pathValidation = errorContext.validation || validateUrlPath(request.url, {
                strictMode: this.strictValidation,
                sanitize: true
            });
            
            // Generate 404 error response with secure messaging
            const notFoundResponse = generateNotFoundResponse(request, {
                includeHeaders: true,
                sanitizeErrors: this.config.securitySettings.sanitizeErrorMessages,
                includeTimestamp: this.config.responseConfig.includeTimestamp
            });
            
            // Apply security headers and prevent information disclosure
            const securityHeaders = {
                ...notFoundResponse.headers,
                'X-Error-ID': result.metadata.errorId
            };
            
            // Send standardized 404 response to client
            response.writeHead(notFoundResponse.statusCode, securityHeaders);
            response.end(notFoundResponse.body);
            
            result.success = true;
            
            // Log not found error with security context
            this.logger.warn('404 Not Found error processed', {
                errorId: result.metadata.errorId,
                requestUrl: request.url,
                securityAssessment: pathValidation.securityAssessment,
                processingTime: Date.now() - startTime
            });
            
            // Update not found metrics
            this.errorMetrics.notFoundCount++;
            this.errorMetrics.totalRequests++;
            
        } catch (error) {
            result.errors.push(`404 error processing failed: ${error.message}`);
            this.logger.error('Failed to process 404 Not Found error', {
                errorId: result.metadata.errorId,
                error: error.message
            }, error);
        }
        
        result.metadata.processingTime = Date.now() - startTime;
        return result;
    }
    
    /**
     * Processes 405 Method Not Allowed errors with proper Allow header generation
     * and method restriction messaging for endpoint method validation failures.
     * 
     * @param {Object} request - HTTP request object
     * @param {Object} response - HTTP response object
     * @param {string} endpoint - The endpoint path for method determination
     * @returns {Object} Method not allowed error processing result with Allow header
     */
    async processMethodNotAllowedError(request, response, endpoint) {
        const startTime = Date.now();
        
        const result = {
            success: false,
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
            allowedMethods: [],
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                errorId: `405_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0
            }
        };
        
        try {
            // Determine allowed methods for requested endpoint
            const allowedMethods = getAllowedMethodsForEndpoint(endpoint);
            result.allowedMethods = allowedMethods;
            
            // Generate 405 error response with Allow header
            const methodNotAllowedResponse = generateMethodNotAllowedResponse(request, endpoint, {
                includeHeaders: true,
                includeAllowHeader: true,
                sanitizeErrors: this.config.securitySettings.sanitizeErrorMessages
            });
            
            // Apply standard error response headers and security settings
            const responseHeaders = {
                ...methodNotAllowedResponse.headers,
                'X-Error-ID': result.metadata.errorId,
                'Allow': allowedMethods.join(', ')
            };
            
            // Send 405 response with proper method restrictions to client
            response.writeHead(methodNotAllowedResponse.statusCode, responseHeaders);
            response.end(methodNotAllowedResponse.body);
            
            result.success = true;
            
            // Log method not allowed error with endpoint and method details
            this.logger.warn('405 Method Not Allowed error processed', {
                errorId: result.metadata.errorId,
                requestMethod: request.method,
                endpoint: endpoint,
                allowedMethods: allowedMethods,
                processingTime: Date.now() - startTime
            });
            
            // Update method not allowed metrics
            this.errorMetrics.methodNotAllowedCount++;
            this.errorMetrics.totalRequests++;
            
        } catch (error) {
            result.errors.push(`405 error processing failed: ${error.message}`);
            this.logger.error('Failed to process 405 Method Not Allowed error', {
                errorId: result.metadata.errorId,
                error: error.message,
                requestMethod: request.method,
                endpoint: endpoint
            }, error);
        }
        
        result.metadata.processingTime = Date.now() - startTime;
        return result;
    }
    
    /**
     * Retrieves current not found route configuration including catch-all patterns,
     * error handling settings, and security configuration for monitoring.
     * 
     * @returns {Object} Complete route configuration with settings and status
     */
    getRouteConfiguration() {
        return {
            pattern: this.routePattern,
            supportedMethods: this.supportedMethods,
            configuration: this.configuration,
            securitySettings: this.config.securitySettings,
            responseConfig: this.config.responseConfig,
            loggingConfig: this.config.loggingConfig,
            operationalSettings: this.config.operationalSettings,
            strictValidation: this.strictValidation,
            metadata: {
                timestamp: new Date().toISOString(),
                configurationVersion: '1.0.0'
            }
        };
    }
    
    /**
     * Validates not found route configuration for completeness, security compliance,
     * and proper error handling setup with comprehensive validation reporting.
     * 
     * @param {Object} [validationOptions={}] - Validation configuration options
     * @returns {Object} Configuration validation result with compliance status
     */
    validateConfiguration(validationOptions = {}) {
        const result = {
            isValid: false,
            compliance: {
                catchAllPattern: false,
                errorHandling: false,
                securitySettings: false,
                responseGeneration: false
            },
            errors: [],
            warnings: [],
            recommendations: [],
            metadata: {
                timestamp: new Date().toISOString(),
                validationId: `cfg_val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        };
        
        try {
            // Validate catch-all route pattern configuration
            if (this.routePattern && this.routePattern === '*') {
                result.compliance.catchAllPattern = true;
            } else {
                result.errors.push('Invalid catch-all route pattern configuration');
            }
            
            // Check error handling configuration for 404 and 405 responses
            if (this.config.errorTypes && this.config.errorTypes.length >= 2) {
                result.compliance.errorHandling = true;
            } else {
                result.errors.push('Insufficient error type configuration');
            }
            
            // Validate security settings and input sanitization configuration
            if (this.config.securitySettings && 
                this.config.securitySettings.enableInputValidation &&
                this.config.securitySettings.sanitizeErrorMessages) {
                result.compliance.securitySettings = true;
            } else {
                result.warnings.push('Security settings may need enhancement');
            }
            
            // Check response generation configuration
            if (this.config.responseConfig && 
                this.config.responseConfig.contentType) {
                result.compliance.responseGeneration = true;
            } else {
                result.errors.push('Response generation configuration incomplete');
            }
            
            // Generate recommendations for configuration improvements
            if (!this.config.operationalSettings.enableMetrics) {
                result.recommendations.push('Consider enabling metrics collection for monitoring');
            }
            
            if (!this.strictValidation) {
                result.recommendations.push('Enable strict validation for enhanced security');
            }
            
            // Assess overall configuration validity
            result.isValid = Object.values(result.compliance).every(check => check === true) &&
                           result.errors.length === 0;
            
        } catch (error) {
            result.errors.push(`Configuration validation failed: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Retrieves error handling metrics including 404/405 counts, response times,
     * and security incident tracking for operational monitoring.
     * 
     * @param {Object} [metricsOptions={}] - Metrics retrieval options
     * @returns {Object} Error metrics with response counts and performance data
     */
    getErrorMetrics(metricsOptions = {}) {
        const uptime = Date.now() - this.errorMetrics.lastReset.getTime();
        
        return {
            summary: {
                totalRequests: this.errorMetrics.totalRequests,
                notFoundCount: this.errorMetrics.notFoundCount,
                methodNotAllowedCount: this.errorMetrics.methodNotAllowedCount,
                securityViolations: this.errorMetrics.securityViolations,
                uptimeMs: uptime
            },
            performance: {
                averageResponseTime: this.errorMetrics.averageResponseTime,
                totalResponseTime: this.errorMetrics.responseTimeSum,
                requestsPerSecond: uptime > 0 ? (this.errorMetrics.totalRequests / (uptime / 1000)).toFixed(2) : 0
            },
            errorDistribution: {
                notFoundPercentage: this.errorMetrics.totalRequests > 0 ? 
                    ((this.errorMetrics.notFoundCount / this.errorMetrics.totalRequests) * 100).toFixed(2) : 0,
                methodNotAllowedPercentage: this.errorMetrics.totalRequests > 0 ? 
                    ((this.errorMetrics.methodNotAllowedCount / this.errorMetrics.totalRequests) * 100).toFixed(2) : 0
            },
            errorPatterns: Object.fromEntries(this.errorMetrics.errorPatterns),
            metadata: {
                timestamp: new Date().toISOString(),
                lastReset: this.errorMetrics.lastReset.toISOString(),
                metricsVersion: '1.0.0'
            }
        };
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Initializes error response templates and configuration.
     * @private
     */
    _initializeErrorResponses() {
        this.errorTemplates = {
            NOT_FOUND: {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
                headers: DEFAULT_ERROR_HEADERS
            },
            METHOD_NOT_ALLOWED: {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                message: HTTP_ERROR_MESSAGES.STATUS_405_MESSAGE,
                headers: { ...DEFAULT_ERROR_HEADERS, 'Allow': '' }
            }
        };
    }
    
    /**
     * Initializes metrics collection system.
     * @private
     */
    _initializeMetrics() {
        this.metricsEnabled = true;
        this.errorMetrics.lastReset = new Date();
        this.logger.debug('Error metrics initialized for NotFoundRoute');
    }
    
    /**
     * Configures error handling middleware.
     * @private
     */
    _configureErrorHandling(errorTypes) {
        this.supportedErrorTypes = errorTypes;
        this.logger.debug('Error handling configured', { errorTypes });
    }
    
    /**
     * Configures response generation settings.
     * @private
     */
    _configureResponseGeneration(config) {
        this.responseSettings = config;
        this.logger.debug('Response generation configured', { config });
    }
    
    /**
     * Configures logging settings.
     * @private
     */
    _configureLogging(loggingConfig) {
        this.loggingSettings = loggingConfig;
        this.logger.debug('Logging configured', { loggingConfig });
    }
    
    /**
     * Configures security settings.
     * @private
     */
    _configureSecuritySettings(securitySettings) {
        this.securitySettings = securitySettings;
        this.logger.debug('Security settings configured', { securitySettings });
    }
    
    /**
     * Classifies error type based on request characteristics.
     * @private
     */
    _classifyErrorType(request) {
        if (!request.method || !request.url) {
            return 'NOT_FOUND';
        }
        
        const pathname = request.url.split('?')[0].split('#')[0];
        if (pathname === '/hello' && request.method.toUpperCase() !== 'GET') {
            return 'METHOD_NOT_ALLOWED';
        }
        
        return 'NOT_FOUND';
    }
    
    /**
     * Updates error metrics with timing and counting information.
     * @private
     */
    _updateErrorMetrics(errorType, processingTime) {
        this.errorMetrics.totalRequests++;
        this.errorMetrics.responseTimeSum += processingTime;
        this.errorMetrics.averageResponseTime = this.errorMetrics.responseTimeSum / this.errorMetrics.totalRequests;
        
        // Update error pattern tracking
        const pattern = `${errorType}_pattern`;
        this.errorMetrics.errorPatterns.set(pattern, 
            (this.errorMetrics.errorPatterns.get(pattern) || 0) + 1);
    }
    
    /**
     * Updates general metrics with log entry information.
     * @private
     */
    _updateMetrics(errorType, logEntry) {
        this._updateErrorMetrics(errorType, 0);
        
        if (logEntry.security && logEntry.security.potentialAttack) {
            this.errorMetrics.securityViolations++;
        }
    }
}

/**
 * Not Found controller class that extends BaseController to provide specialized
 * error handling logic for 404 and 405 responses with secure error messaging.
 */
class NotFoundController extends BaseController {
    /**
     * Initializes the NotFoundController with error handling configuration
     * and secure error response capabilities.
     * 
     * @param {Object} [controllerConfig={}] - Controller configuration options
     */
    constructor(controllerConfig = {}) {
        // Call parent BaseController constructor with error handling configuration
        super({
            ...controllerConfig,
            controllerType: 'error_handler',
            enableErrorHandling: true,
            enableValidation: true
        });
        
        // Initialize secure error mode for preventing information disclosure
        this.secureErrorMode = controllerConfig.secureErrorMode !== false;
        
        // Set up error response templates for 404 and 405 responses
        this.errorTemplates = {
            404: {
                statusCode: 404,
                message: 'Not Found',
                contentType: 'text/plain'
            },
            405: {
                statusCode: 405,
                message: 'Method Not Allowed',
                contentType: 'text/plain'
            }
        };
        
        // Configure logging for error tracking and security monitoring
        this.logger = logger.createChildLogger(
            { component: 'NotFoundController' },
            { controllerType: 'error_handler' }
        );
        
        this.logger.info('NotFoundController initialized', {
            secureErrorMode: this.secureErrorMode,
            templatesLoaded: Object.keys(this.errorTemplates).length
        });
    }
    
    /**
     * Abstract method implementation for handling HTTP method validation
     * and error response generation for not found controller.
     * 
     * @param {Object} request - HTTP request object
     * @param {Object} response - HTTP response object
     * @returns {Object} Error handling result with appropriate response generation
     */
    async handleHttpMethod(request, response) {
        try {
            // Validate HTTP method and determine error type classification
            const method = request.method ? request.method.toUpperCase() : 'UNKNOWN';
            const url = request.url || '/';
            
            // Determine error type based on request analysis
            let errorType, statusCode;
            if (url === '/hello' && method !== 'GET') {
                errorType = 'METHOD_NOT_ALLOWED';
                statusCode = 405;
            } else {
                errorType = 'NOT_FOUND';
                statusCode = 404;
            }
            
            // Generate secure error response using appropriate method
            const errorResponse = this.generateErrorResponse(
                statusCode,
                this.errorTemplates[statusCode].message,
                {
                    method: method,
                    url: url,
                    errorType: errorType
                }
            );
            
            // Send error response to client
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.body);
            
            // Log error handling activity
            this.logger.info('HTTP method error handled', {
                method: method,
                url: url,
                errorType: errorType,
                statusCode: statusCode
            });
            
            return {
                success: true,
                errorType: errorType,
                statusCode: statusCode,
                responseGenerated: true
            };
            
        } catch (error) {
            this.logger.error('Failed to handle HTTP method error', { error: error.message }, error);
            return {
                success: false,
                error: error.message,
                responseGenerated: false
            };
        }
    }
    
    /**
     * Generates secure error responses for 404 and 405 errors with proper
     * status codes, headers, and sanitized error messages.
     * 
     * @param {number} statusCode - HTTP status code for the error
     * @param {string} errorMessage - Error message to include
     * @param {Object} [responseOptions={}] - Additional response options
     * @returns {Object} Complete error response with secure formatting
     */
    generateErrorResponse(statusCode, errorMessage, responseOptions = {}) {
        try {
            // Create error response using response utilities
            const response = createErrorResponse({
                statusCode: statusCode,
                message: this.secureErrorMode ? 
                    this.errorTemplates[statusCode]?.message || 'Error' : 
                    errorMessage,
                errorType: responseOptions.errorType || 'UNKNOWN',
                sanitize: this.secureErrorMode
            });
            
            // Apply secure error message formatting
            const sanitizedMessage = this.secureErrorMode ? 
                response.body.replace(/[<>\"']/g, '') : 
                response.body;
            
            // Format response headers with security headers
            const securityHeaders = formatHeaders({
                ...DEFAULT_ERROR_HEADERS,
                'Content-Length': Buffer.byteLength(sanitizedMessage, 'utf8').toString()
            });
            
            // Add method-specific headers for 405 responses
            if (statusCode === 405 && responseOptions.url === '/hello') {
                securityHeaders['Allow'] = 'GET';
            }
            
            const errorResponse = {
                statusCode: statusCode,
                statusMessage: this.errorTemplates[statusCode]?.message || 'Error',
                headers: securityHeaders,
                body: sanitizedMessage,
                metadata: {
                    timestamp: new Date().toISOString(),
                    errorType: responseOptions.errorType,
                    secureMode: this.secureErrorMode
                }
            };
            
            // Validate error response for HTTP compliance
            const validation = validateResponse(errorResponse);
            if (!validation.isValid) {
                this.logger.warn('Generated error response failed validation', {
                    statusCode: statusCode,
                    errors: validation.errors
                });
            }
            
            return errorResponse;
            
        } catch (error) {
            this.logger.error('Failed to generate error response', { 
                statusCode: statusCode,
                error: error.message 
            }, error);
            
            // Return minimal safe response
            return {
                statusCode: statusCode,
                statusMessage: 'Error',
                headers: { 'Content-Type': 'text/plain' },
                body: statusCode === 404 ? 'Not Found' : 'Method Not Allowed',
                metadata: {
                    timestamp: new Date().toISOString(),
                    fallback: true
                }
            };
        }
    }
}

// ============================================================================
// PRIVATE UTILITY FUNCTIONS
// ============================================================================

/**
 * Performs comprehensive security validation on request.
 * @private
 */
function _performSecurityValidation(request, validationResult) {
    const result = {
        passed: true,
        threatLevel: 'none',
        warnings: []
    };
    
    try {
        // Check for common attack patterns in URL
        const url = request.url || '';
        const suspiciousPatterns = [
            /\.\./,  // Path traversal
            /<script/i,  // XSS
            /union.*select/i,  // SQL injection
            /javascript:/i  // XSS
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(url)) {
                result.passed = false;
                result.threatLevel = 'high';
                result.warnings.push(`Suspicious pattern detected: ${pattern.source}`);
            }
        }
        
        // Check for unusual user agents
        const userAgent = request.headers?.['user-agent'] || '';
        if (userAgent.length > 500 || userAgent.includes('<script')) {
            result.warnings.push('Suspicious user agent detected');
            result.threatLevel = 'medium';
        }
        
    } catch (error) {
        result.passed = false;
        result.threatLevel = 'critical';
        result.warnings.push('Security validation failed');
    }
    
    return result;
}

/**
 * Assesses security threat level for request.
 * @private
 */
function _assessSecurityThreat(request, errorType) {
    const assessment = {
        level: 'low',
        indicators: [],
        confidence: 'medium'
    };
    
    try {
        // Analyze request patterns
        const url = request?.url || '';
        const method = request?.method || '';
        
        // Check for automated tools
        const userAgent = request?.headers?.['user-agent'] || '';
        const automatedToolPatterns = ['bot', 'crawler', 'scanner', 'curl', 'wget'];
        
        if (automatedToolPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
            assessment.indicators.push('automated_tool');
        }
        
        // Check for suspicious paths
        const suspiciousPaths = ['/admin', '/wp-admin', '/.env', '/config'];
        if (suspiciousPaths.some(path => url.includes(path))) {
            assessment.level = 'medium';
            assessment.indicators.push('suspicious_path');
        }
        
        // Multiple rapid requests pattern (would need session tracking)
        if (errorType === 'METHOD_NOT_ALLOWED') {
            assessment.indicators.push('method_probing');
        }
        
    } catch (error) {
        assessment.level = 'unknown';
        assessment.confidence = 'low';
    }
    
    return assessment;
}

/**
 * Detects potential attack patterns.
 * @private
 */
function _detectPotentialAttack(path, method) {
    const attackIndicators = [
        { pattern: /\.\.\//, type: 'path_traversal' },
        { pattern: /<script/i, type: 'xss' },
        { pattern: /union.*select/i, type: 'sql_injection' },
        { pattern: /exec|system|cmd/i, type: 'command_injection' }
    ];
    
    for (const indicator of attackIndicators) {
        if (indicator.pattern.test(path)) {
            return {
                detected: true,
                type: indicator.type,
                pattern: indicator.pattern.source
            };
        }
    }
    
    return { detected: false };
}

/**
 * Determines appropriate log level based on error type and security assessment.
 * @private
 */
function _determineLogLevel(errorType, securityAssessment) {
    if (securityAssessment.potentialAttack.detected) {
        return 'error';
    }
    
    if (errorType === 'METHOD_NOT_ALLOWED') {
        return 'warn';
    }
    
    if (securityAssessment.threatAssessment.level === 'medium' || 
        securityAssessment.threatAssessment.level === 'high') {
        return 'warn';
    }
    
    return 'info';
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export main classes for not found route handling
module.exports = {
    // Main route handler class
    NotFoundRoute,
    
    // Specialized controller class
    NotFoundController,
    
    // Factory functions for route creation
    createNotFoundRoute,
    
    // Validation functions for request processing
    validateNotFoundRequest,
    
    // Response generation functions
    generateNotFoundResponse,
    generateMethodNotAllowedResponse,
    
    // Logging function for operational monitoring
    logNotFoundRequest,
    
    // Default configuration and constants
    notFoundRoute: createNotFoundRoute(),
    NOT_FOUND_CONFIG: NOT_FOUND_ROUTE_CONFIG,
    
    // Configuration constants for initialization
    SUPPORTED_ERROR_TYPES,
    DEFAULT_ERROR_HEADERS
};