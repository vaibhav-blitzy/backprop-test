/**
 * CORS (Cross-Origin Resource Sharing) Middleware Handler for Node.js Tutorial Application
 * 
 * Implements comprehensive cross-origin request handling for the Node.js tutorial HTTP server
 * application. Provides configurable CORS policy enforcement, preflight request handling, and
 * security-aware cross-origin communication. Implements industry-standard CORS patterns while
 * maintaining educational clarity for demonstrating web browser security concepts and cross-origin
 * communication patterns in modern web applications.
 * 
 * This module serves as the central CORS middleware component that processes all cross-origin
 * requests including preflight and actual requests with comprehensive policy enforcement. It
 * demonstrates educational CORS implementation while providing production-ready security features
 * including origin validation, method authorization, header management, and security-aware
 * cross-origin communication patterns.
 * 
 * Key Features:
 * - Comprehensive CORS policy enforcement with configurable origin validation
 * - Preflight request handling (OPTIONS) with proper method and header validation
 * - Security-aware cross-origin communication preventing CORS policy bypass
 * - Integration with application feature flags for environment-specific enablement
 * - Industry-standard CORS patterns following W3C Cross-Origin Resource Sharing specification
 * - Educational clarity demonstrating web browser security concepts and best practices
 * - Production-ready error handling with secure error responses and comprehensive logging
 * 
 * Educational Value:
 * - Demonstrates browser same-origin policy and cross-origin restrictions
 * - Shows CORS preflight request handling for complex requests
 * - Illustrates origin header validation and security considerations
 * - Provides examples of Access-Control-* header usage and browser communication
 * - Shows protection against origin header spoofing attacks
 * - Demonstrates proper HTTP header handling and status code usage
 * 
 * Security Features:
 * - Origin validation with whitelist approach and spoofing prevention
 * - Secure handling of Access-Control-Allow-Credentials header
 * - Comprehensive input validation for CORS headers and methods
 * - Prevention of header injection in CORS processing
 * - Security event logging for policy violations and suspicious requests
 * 
 * @fileoverview CORS middleware handler with comprehensive cross-origin request processing
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - INTERNAL DEPENDENCIES
// ============================================================================

// Import application configuration for CORS feature flag checking and server settings
import { 
    AppConfig 
} from '../config/app.config.js';

// Import HTTP header constants for CORS-specific Access-Control-* header management
import {
    HTTP_HEADERS,
    CORS_HEADERS
} from '../constants/http-headers.js';

// Import HTTP method constants for CORS preflight request handling and method validation
import {
    HTTP_METHODS,
    isValidHttpMethod
} from '../constants/http-methods.js';

// Import standardized error messages for CORS policy violations and preflight failures
import {
    ERROR_MESSAGES
} from '../constants/error-messages.js';

// Import HTTP request parsing utilities for extracting CORS-related headers
import {
    RequestParser,
    parseRequestHeaders
} from '../utils/request-utils.js';

// Import response utilities for CORS preflight responses and error handling
import {
    createSuccessResponse,
    createErrorResponse,
    formatHeaders
} from '../utils/response-utils.js';

// Import HTTP status codes for CORS preflight responses and error handling
import {
    HTTP_STATUS_CODES
} from '../utils/http-status.js';

// Import structured logging for CORS processing, policy enforcement, and security events
import {
    Logger
} from '../utils/logger.js';

// Import comprehensive error handling for CORS policy violations and preflight failures
import {
    ErrorHandler
} from '../lib/error-handler.js';

// ============================================================================
// GLOBAL CONSTANTS AND CORS CONFIGURATION
// ============================================================================

/**
 * Default CORS configuration settings including allowed origins, methods, and headers
 * for tutorial application security policy. Provides baseline security settings with
 * educational focus while maintaining production-ready security practices.
 */
const DEFAULT_CORS_CONFIG = {
    // Allowed origins for CORS requests including localhost and development domains
    allowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000', 
        'http://localhost:8080'
    ],
    
    // Allowed HTTP methods for CORS requests including standard REST methods
    allowedMethods: [
        HTTP_METHODS.GET,
        HTTP_METHODS.POST,
        HTTP_METHODS.PUT,
        HTTP_METHODS.DELETE,
        HTTP_METHODS.OPTIONS,
        HTTP_METHODS.HEAD
    ],
    
    // Allowed headers for CORS requests with security-aware header filtering
    allowedHeaders: [
        'Content-Type',
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    
    // Credentials support disabled by default for enhanced security
    allowCredentials: false,
    
    // Preflight cache duration for browser optimization (24 hours)
    maxAge: 86400,
    
    // Security policies for origin validation and attack prevention
    securityPolicies: {
        strictOriginValidation: true,
        preventOriginSpoofing: true,
        headerInjectionPrevention: true,
        wildcardRestrictions: 'development_only'
    }
};

/**
 * Array of allowed origins for CORS requests including localhost and development domains
 * for educational environment setup. Configured for tutorial application development
 * environment with common development server ports and localhost variations.
 */
const TUTORIAL_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8080'
];

/**
 * Maximum age in seconds for CORS preflight cache duration (86400 seconds = 24 hours).
 * Optimizes browser performance by reducing preflight request frequency while maintaining
 * security policy freshness and compliance with CORS specification recommendations.
 */
const CORS_PREFLIGHT_MAX_AGE = 86400;

/**
 * Object for tracking CORS request processing statistics including preflight requests,
 * policy violations, and origin validation for monitoring and performance analysis.
 */
const CORS_PROCESSING_METRICS = {
    totalRequests: 0,
    preflightRequests: 0,
    actualRequests: 0,
    policyViolations: 0,
    originValidationFailures: 0,
    successfulRequests: 0,
    processedOrigins: new Set(),
    lastProcessingTime: null
};

// ============================================================================
// CORS UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates comprehensive CORS processing context with request metadata, origin validation,
 * and preflight information for cross-origin request lifecycle management. Provides
 * structured context object for CORS middleware processing pipeline with correlation
 * and security validation support.
 * 
 * @param {Object} request - HTTP request object from Node.js
 * @param {string} correlationId - Unique correlation ID for request tracking
 * @returns {Object} CORS context object with origin information, preflight status, and processing metadata
 * 
 * @example
 * const corsContext = createCorsContext(request, 'cors_123456789');
 * console.log(corsContext.isPreflightRequest); // true/false
 * console.log(corsContext.origin); // 'http://localhost:3000'
 */
function createCorsContext(request, correlationId) {
    try {
        // Create CORS context object with correlation ID and processing timestamp
        const corsContext = {
            correlationId: correlationId || `cors_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
            processingTimestamp: new Date().toISOString(),
            processStartTime: Date.now()
        };

        // Extract origin header from request for cross-origin validation
        const originHeader = request.headers?.origin || request.headers?.Origin || null;
        corsContext.origin = originHeader;
        corsContext.hasOrigin = Boolean(originHeader);

        // Determine if request is a CORS preflight request (OPTIONS method)
        const requestMethod = request.method?.toUpperCase();
        corsContext.method = requestMethod;
        corsContext.isPreflightRequest = (
            requestMethod === HTTP_METHODS.OPTIONS &&
            corsContext.hasOrigin &&
            (request.headers['access-control-request-method'] || request.headers['Access-Control-Request-Method'])
        );

        // Parse CORS-specific headers including Access-Control-Request-Method and Access-Control-Request-Headers
        corsContext.requestedMethod = request.headers['access-control-request-method'] || 
                                     request.headers['Access-Control-Request-Method'] || null;
        corsContext.requestedHeaders = request.headers['access-control-request-headers'] || 
                                      request.headers['Access-Control-Request-Headers'] || null;

        // Initialize origin validation status and policy enforcement tracking
        corsContext.originValidation = {
            status: 'pending',
            matchedPattern: null,
            securityAssessment: 'unknown',
            validationTime: null
        };

        // Add CORS processing metadata and security context information
        corsContext.processingMetadata = {
            userAgent: request.headers['user-agent'] || 'unknown',
            referer: request.headers.referer || null,
            remoteAddress: request.connection?.remoteAddress || 'unknown',
            requestUrl: request.url || '/',
            httpVersion: request.httpVersion || '1.1'
        };

        // Include request timing and performance tracking
        corsContext.performance = {
            requestStartTime: Date.now(),
            processingStages: []
        };

        // Return comprehensive CORS context for middleware processing pipeline
        return corsContext;

    } catch (error) {
        // Return minimal CORS context if creation fails
        return {
            correlationId: correlationId || `cors_error_${Date.now()}`,
            processingTimestamp: new Date().toISOString(),
            origin: null,
            hasOrigin: false,
            isPreflightRequest: false,
            method: request?.method || 'UNKNOWN',
            error: `Context creation failed: ${error.message}`
        };
    }
}

/**
 * Validates the origin header against allowed origins policy with wildcard support and
 * security validation to prevent origin spoofing attacks. Implements comprehensive origin
 * validation with pattern matching, security assessment, and policy enforcement.
 * 
 * @param {string} origin - Origin header value to validate against policy
 * @param {Array} allowedOrigins - Array of allowed origin patterns and URLs
 * @param {Object} validationOptions - Validation options and security configuration
 * @returns {Object} Origin validation result with validation status, matched origin pattern, and security assessment
 * 
 * @example
 * const validation = validateCorsOrigin('http://localhost:3000', TUTORIAL_ALLOWED_ORIGINS);
 * console.log(validation.isValid); // true/false
 * console.log(validation.matchedPattern); // 'http://localhost:3000'
 */
function validateCorsOrigin(origin, allowedOrigins, validationOptions = {}) {
    try {
        // Initialize validation result with default values
        const validationResult = {
            isValid: false,
            origin: origin,
            matchedPattern: null,
            securityAssessment: 'failed',
            validationTime: new Date().toISOString(),
            securityFlags: {
                originSpoofingDetected: false,
                malformedOrigin: false,
                wildcardUsed: false,
                exactMatch: false
            }
        };

        // Validate origin header format and prevent malformed origin attacks
        if (!origin || typeof origin !== 'string') {
            validationResult.securityAssessment = 'no_origin';
            validationResult.securityFlags.malformedOrigin = true;
            return validationResult;
        }

        // Check for null or undefined origin and handle appropriately for same-origin requests
        if (origin.toLowerCase() === 'null') {
            validationResult.securityAssessment = 'null_origin';
            // Allow null origin for file:// protocol and some same-origin scenarios
            validationResult.isValid = validationOptions.allowNullOrigin || false;
            return validationResult;
        }

        // Normalize origin URL format and remove trailing slashes for consistent comparison
        let normalizedOrigin;
        try {
            const originUrl = new URL(origin);
            normalizedOrigin = `${originUrl.protocol}//${originUrl.host}`;
        } catch (urlError) {
            validationResult.securityAssessment = 'malformed_url';
            validationResult.securityFlags.malformedOrigin = true;
            return validationResult;
        }

        // Perform security validation to prevent origin spoofing and header injection
        if (origin.includes('\n') || origin.includes('\r') || origin.includes('\t')) {
            validationResult.securityAssessment = 'header_injection_attempt';
            validationResult.securityFlags.originSpoofingDetected = true;
            return validationResult;
        }

        // Iterate through allowed origins array for exact matches and wildcard patterns
        for (const allowedOrigin of allowedOrigins) {
            if (typeof allowedOrigin !== 'string') continue;

            // Check for exact origin match
            if (allowedOrigin === normalizedOrigin || allowedOrigin === origin) {
                validationResult.isValid = true;
                validationResult.matchedPattern = allowedOrigin;
                validationResult.securityAssessment = 'exact_match';
                validationResult.securityFlags.exactMatch = true;
                break;
            }

            // Apply wildcard pattern matching for development environments with security validation
            if (allowedOrigin.includes('*')) {
                // Only allow wildcards in development mode for security
                if (validationOptions.environment !== 'development' && 
                    validationOptions.environment !== 'test') {
                    continue;
                }

                // Convert wildcard pattern to regex for matching
                const wildcardRegex = new RegExp(
                    '^' + allowedOrigin.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$',
                    'i'
                );

                if (wildcardRegex.test(normalizedOrigin)) {
                    validationResult.isValid = true;
                    validationResult.matchedPattern = allowedOrigin;
                    validationResult.securityAssessment = 'wildcard_match';
                    validationResult.securityFlags.wildcardUsed = true;
                    break;
                }
            }
        }

        // Set final security assessment based on validation results
        if (validationResult.isValid) {
            validationResult.securityAssessment = validationResult.securityFlags.exactMatch ? 
                'secure_exact_match' : 'secure_pattern_match';
        } else {
            validationResult.securityAssessment = 'policy_violation';
        }

        // Return comprehensive origin validation result for CORS policy enforcement
        return validationResult;

    } catch (validationError) {
        // Return failed validation result if validation process encounters error
        return {
            isValid: false,
            origin: origin,
            matchedPattern: null,
            securityAssessment: 'validation_error',
            validationTime: new Date().toISOString(),
            error: validationError.message,
            securityFlags: {
                originSpoofingDetected: false,
                malformedOrigin: true,
                wildcardUsed: false,
                exactMatch: false
            }
        };
    }
}

/**
 * Creates standardized CORS preflight response with appropriate Access-Control-* headers
 * for browser preflight request compliance. Implements comprehensive preflight response
 * generation following W3C CORS specification with security and performance optimization.
 * 
 * @param {Object} corsContext - CORS processing context with origin and request information
 * @param {Object} corsConfig - CORS configuration with allowed methods, headers, and settings
 * @returns {Object} Preflight response object with status code, headers, and body for OPTIONS request handling
 * 
 * @example
 * const preflightResponse = createPreflightResponse(corsContext, corsConfig);
 * console.log(preflightResponse.statusCode); // 200
 * console.log(preflightResponse.headers['Access-Control-Allow-Origin']); // 'http://localhost:3000'
 */
function createPreflightResponse(corsContext, corsConfig) {
    try {
        // Create response object with 200 OK status for successful preflight
        const preflightResponse = {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {},
            content: '',
            contentType: 'text/plain; charset=utf-8',
            corsContext: corsContext.correlationId
        };

        // Set Access-Control-Allow-Origin header based on validated origin
        if (corsContext.originValidation?.isValid && corsContext.origin) {
            preflightResponse.headers[CORS_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN] = corsContext.origin;
        }

        // Set Access-Control-Allow-Methods header with supported HTTP methods
        const allowedMethods = corsConfig.allowedMethods || DEFAULT_CORS_CONFIG.allowedMethods;
        preflightResponse.headers[CORS_HEADERS.ACCESS_CONTROL_ALLOW_METHODS] = allowedMethods.join(', ');

        // Set Access-Control-Allow-Headers header with allowed request headers
        const allowedHeaders = corsConfig.allowedHeaders || DEFAULT_CORS_CONFIG.allowedHeaders;
        preflightResponse.headers[CORS_HEADERS.ACCESS_CONTROL_ALLOW_HEADERS] = allowedHeaders.join(', ');

        // Set Access-Control-Max-Age header for preflight cache duration
        const maxAge = corsConfig.maxAge || CORS_PREFLIGHT_MAX_AGE;
        preflightResponse.headers[HTTP_HEADERS.ACCESS_CONTROL_MAX_AGE] = maxAge.toString();

        // Include Access-Control-Allow-Credentials header if credentials are supported
        if (corsConfig.allowCredentials) {
            preflightResponse.headers[HTTP_HEADERS.ACCESS_CONTROL_ALLOW_CREDENTIALS] = 'true';
        }

        // Add Vary header for proper caching behavior with multiple origins
        preflightResponse.headers['Vary'] = 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers';

        // Format headers using formatHeaders utility for consistent header structure
        preflightResponse.headers = formatHeaders(preflightResponse.headers, {
            includeSecurityHeaders: true,
            responseType: 'cors_preflight'
        });

        // Calculate content length for HTTP compliance
        preflightResponse.contentLength = Buffer.byteLength(preflightResponse.content);
        preflightResponse.headers['Content-Length'] = preflightResponse.contentLength.toString();

        // Add processing timing and performance metadata
        preflightResponse.processingTime = Date.now() - corsContext.performance?.requestStartTime || 0;

        // Return complete preflight response for OPTIONS request handling
        return preflightResponse;

    } catch (error) {
        // Return error response if preflight response creation fails
        return {
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Length': '21'
            },
            content: 'Internal Server Error',
            contentType: 'text/plain; charset=utf-8',
            error: `Preflight response creation failed: ${error.message}`
        };
    }
}

/**
 * Creates standardized CORS error response objects with appropriate status codes and
 * security-aware error messages for policy violations. Implements secure error response
 * generation preventing information disclosure while providing meaningful error context.
 * 
 * @param {string} errorType - Type of CORS error (origin_invalid, method_not_allowed, etc.)
 * @param {string} message - Error message for logging and internal processing
 * @param {Object} corsContext - CORS processing context for error correlation
 * @returns {Object} CORS error object with status code, error message, and security context for consistent error handling
 * 
 * @example
 * const corsError = createCorsError('origin_invalid', 'Origin not allowed', corsContext);
 * console.log(corsError.statusCode); // 403
 * console.log(corsError.clientMessage); // 'Forbidden'
 */
function createCorsError(errorType, message, corsContext) {
    try {
        // Initialize CORS error object with correlation and timing information
        const corsError = {
            errorType: errorType,
            internalMessage: message,
            correlationId: corsContext?.correlationId || `cors_error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            processingTime: corsContext?.performance ? 
                Date.now() - corsContext.performance.requestStartTime : 0
        };

        // Determine appropriate HTTP status code based on CORS error type (400, 403, or 405)
        switch (errorType) {
            case 'origin_invalid':
            case 'origin_not_allowed':
            case 'policy_violation':
                corsError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.FORBIDDEN;
                corsError.clientMessage = ERROR_MESSAGES.CORS_POLICY_VIOLATION || 'Forbidden';
                corsError.logLevel = 'warn';
                break;

            case 'invalid_method':
            case 'method_not_allowed':
                corsError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;
                corsError.clientMessage = ERROR_MESSAGES.UNSUPPORTED_METHOD || 'Method Not Allowed';
                corsError.logLevel = 'warn';
                corsError.additionalHeaders = { 'Allow': 'GET, POST, PUT, DELETE, OPTIONS, HEAD' };
                break;

            case 'invalid_headers':
            case 'headers_not_allowed':
                corsError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
                corsError.clientMessage = ERROR_MESSAGES.BAD_REQUEST || 'Bad Request';
                corsError.logLevel = 'warn';
                break;

            case 'preflight_failed':
                corsError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
                corsError.clientMessage = ERROR_MESSAGES.PREFLIGHT_FAILED || 'Preflight Failed';
                corsError.logLevel = 'warn';
                break;

            case 'malformed_request':
            case 'invalid_origin_format':
                corsError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
                corsError.clientMessage = ERROR_MESSAGES.BAD_REQUEST || 'Bad Request';
                corsError.logLevel = 'warn';
                break;

            default:
                corsError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.FORBIDDEN;
                corsError.clientMessage = ERROR_MESSAGES.CORS_POLICY_VIOLATION || 'CORS Policy Violation';
                corsError.logLevel = 'warn';
        }

        // Add CORS processing context and correlation ID for debugging and tracking
        corsError.context = {
            origin: corsContext?.origin || 'unknown',
            method: corsContext?.method || 'unknown',
            isPreflightRequest: corsContext?.isPreflightRequest || false,
            userAgent: corsContext?.processingMetadata?.userAgent || 'unknown'
        };

        // Include security-aware error details without exposing sensitive configuration
        corsError.securityContext = {
            riskLevel: errorType.includes('invalid') || errorType.includes('malformed') ? 'medium' : 'low',
            securityEvent: true,
            requiresLogging: true,
            clientVisible: false
        };

        // Set appropriate error headers for CORS policy violation responses
        corsError.headers = {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Length': Buffer.byteLength(corsError.clientMessage).toString()
        };

        // Add additional headers if specified for the error type
        if (corsError.additionalHeaders) {
            Object.assign(corsError.headers, corsError.additionalHeaders);
        }

        // Return standardized CORS error object for error handling and response generation
        return corsError;

    } catch (error) {
        // Return fallback CORS error if error creation fails
        return {
            errorType: 'error_creation_failed',
            internalMessage: `Failed to create CORS error: ${error.message}`,
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            clientMessage: 'Internal Server Error',
            correlationId: corsContext?.correlationId || `cors_fallback_${Date.now()}`,
            timestamp: new Date().toISOString(),
            logLevel: 'error',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Length': '21'
            }
        };
    }
}

// ============================================================================
// MAIN CORS HANDLER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Comprehensive CORS middleware handler class that implements cross-origin resource sharing
 * policy enforcement, preflight request handling, and security-aware cross-origin communication.
 * Provides configurable CORS policies with origin validation, method authorization, and header
 * management while maintaining educational clarity for demonstrating web browser security concepts
 * and modern web application cross-origin communication patterns.
 * 
 * This class serves as the central CORS processing authority, providing:
 * - Configurable CORS policy enforcement with origin validation and method authorization
 * - Comprehensive preflight request handling (OPTIONS) with proper header management
 * - Security-aware cross-origin communication preventing CORS policy bypass and attacks
 * - Integration with application configuration for environment-specific CORS behavior
 * - Educational patterns demonstrating industry-standard CORS implementation and browser security
 * - Production-ready error handling with secure error responses and comprehensive audit logging
 */
class CorsHandler {
    /**
     * Initializes the CORS handler with comprehensive configuration, policy setup, and component
     * integration for cross-origin request processing. Demonstrates configuration integration
     * patterns and provides comprehensive error handling for initialization failures.
     * 
     * @param {Object} config - CORS handler configuration with policy settings and component integration
     */
    constructor(config = {}) {
        try {
            // Validate and merge CORS configuration with default settings and security policies
            this.config = {
                ...DEFAULT_CORS_CONFIG,
                ...config
            };

            // Initialize application configuration for feature flag checking and server settings
            this.appConfig = config.appConfig || new AppConfig();

            // Set up CORS policy configuration including allowed origins, methods, and headers
            this.corsConfig = this._setupCorsConfiguration();

            // Configure structured logger for CORS processing operations and security events
            this.logger = config.logger || new Logger({
                enableColors: this.appConfig.isDevelopment(),
                logLevel: this.appConfig.isDevelopment() ? 'debug' : 'warn'
            });

            // Initialize error handler for CORS policy violations and preflight failures
            this.errorHandler = config.errorHandler || new ErrorHandler({
                logger: this.logger,
                isDevelopment: this.appConfig.isDevelopment()
            });

            // Set up allowed origins array with development and production origin patterns
            this.allowedOrigins = this.corsConfig.allowedOrigins || TUTORIAL_ALLOWED_ORIGINS;

            // Configure allowed HTTP methods for CORS requests including GET, POST, and OPTIONS
            this.allowedMethods = this.corsConfig.allowedMethods || DEFAULT_CORS_CONFIG.allowedMethods;

            // Set up allowed headers for CORS requests with security-aware header filtering
            this.allowedHeaders = this.corsConfig.allowedHeaders || DEFAULT_CORS_CONFIG.allowedHeaders;

            // Configure credentials support and preflight cache duration for browser optimization
            this.allowCredentials = Boolean(this.corsConfig.allowCredentials);
            this.maxAge = this.corsConfig.maxAge || CORS_PREFLIGHT_MAX_AGE;

            // Check CORS feature enablement status from application configuration
            this.isEnabled = this.appConfig.isFeatureEnabled('cors');

            // Initialize CORS processing statistics and performance tracking
            this.processingStats = {
                ...CORS_PROCESSING_METRICS,
                startTime: new Date().toISOString(),
                configuredOrigins: this.allowedOrigins.length,
                configuredMethods: this.allowedMethods.length
            };

            // Validate complete CORS configuration and mark handler as ready for processing
            this._validateConfiguration();

            // Log successful CORS handler initialization in development mode
            if (this.appConfig.isDevelopment()) {
                this.logger.debug('CORS Handler initialized successfully', {
                    isEnabled: this.isEnabled,
                    allowedOrigins: this.allowedOrigins,
                    allowedMethods: this.allowedMethods,
                    allowCredentials: this.allowCredentials,
                    maxAge: this.maxAge
                });
            }

        } catch (initializationError) {
            // Fallback initialization if primary initialization fails
            console.error(`CORS Handler initialization failed: ${initializationError.message}`);
            this._initializeFallbackConfiguration();
        }
    }

    /**
     * Main CORS middleware function that processes all cross-origin requests including preflight
     * and actual requests with comprehensive policy enforcement. Implements complete CORS request
     * lifecycle management with security validation, policy enforcement, and response generation.
     * 
     * @param {Object} request - HTTP request object from Node.js server
     * @param {Object} response - HTTP response object from Node.js server  
     * @param {Function} next - Next middleware function in the processing pipeline
     * @returns {void} Processes CORS request and calls next middleware or sends response
     */
    async handleCors(request, response, next) {
        try {
            // Check if CORS feature is enabled using application configuration feature flags
            if (!this.isEnabled) {
                // If CORS disabled, call next middleware function and skip CORS processing
                return next();
            }

            // Generate correlation ID for CORS request tracking and logging
            const correlationId = `cors_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

            // Create comprehensive CORS context with request metadata and origin information
            const corsContext = createCorsContext(request, correlationId);

            // Log incoming CORS request details with method, origin, and client information
            this.logger.info('CORS request received', {
                correlationId: corsContext.correlationId,
                method: corsContext.method,
                origin: corsContext.origin,
                isPreflightRequest: corsContext.isPreflightRequest,
                userAgent: corsContext.processingMetadata.userAgent,
                url: request.url
            });

            // Parse request headers to extract origin and CORS-specific request headers
            const parsedHeaders = parseRequestHeaders(request);
            corsContext.parsedHeaders = parsedHeaders;

            // Validate origin against allowed origins policy using validateCorsOrigin function
            const originValidation = validateCorsOrigin(
                corsContext.origin, 
                this.allowedOrigins,
                {
                    environment: this.appConfig.getEnvironment(),
                    allowNullOrigin: this.appConfig.isDevelopment()
                }
            );

            corsContext.originValidation = originValidation;

            // If origin validation fails, create CORS error response and send to client
            if (!originValidation.isValid) {
                const corsError = createCorsError('origin_invalid', 
                    `Origin '${corsContext.origin}' not allowed by CORS policy`, corsContext);
                
                await this._sendCorsError(corsError, response);
                this._updateProcessingStatistics('policy_violation');
                return; // End request processing
            }

            // Determine if request is a preflight request (OPTIONS method with CORS headers)
            if (corsContext.isPreflightRequest) {
                // For preflight requests, handle using handlePreflightRequest method
                await this.handlePreflightRequest(request, response, corsContext);
            } else {
                // For actual requests, apply CORS headers using applyCorsHeaders method
                await this.applyCorsHeaders(request, response, corsContext);
                
                // Call next middleware function for continued request processing
                next();
            }

            // Log CORS processing completion with validation status and policy enforcement results
            this.logger.debug('CORS processing completed', {
                correlationId: corsContext.correlationId,
                originValid: originValidation.isValid,
                isPreflightRequest: corsContext.isPreflightRequest,
                processingTime: Date.now() - corsContext.performance.requestStartTime
            });

            // Update CORS processing statistics for monitoring and analysis
            this._updateProcessingStatistics('success');

        } catch (error) {
            // Handle CORS processing errors with comprehensive error logging
            this.logger.error('CORS processing failed', {
                error: error.message,
                method: request.method,
                url: request.url,
                origin: request.headers?.origin
            }, error);

            // Send fallback error response and continue middleware chain
            await this.errorHandler.handleServerError(error, request, response, {
                component: 'CorsHandler',
                operation: 'handleCors'
            });
        }
    }

    /**
     * Handles CORS preflight requests (OPTIONS) with comprehensive method and header validation
     * according to CORS specification. Implements complete preflight request processing with
     * security validation, method authorization, and header compliance checking.
     * 
     * @param {Object} request - HTTP request object for preflight processing
     * @param {Object} response - HTTP response object for preflight response
     * @param {Object} corsContext - CORS processing context with origin and validation information
     * @returns {void} Sends preflight response with appropriate CORS headers or error response
     */
    async handlePreflightRequest(request, response, corsContext) {
        try {
            // Log preflight request processing with origin and requested method information
            this.logger.info('Processing CORS preflight request', {
                correlationId: corsContext.correlationId,
                origin: corsContext.origin,
                requestedMethod: corsContext.requestedMethod,
                requestedHeaders: corsContext.requestedHeaders
            });

            // Validate Access-Control-Request-Method header against allowed methods
            const requestedMethod = corsContext.requestedMethod;
            if (!requestedMethod || !this.allowedMethods.includes(requestedMethod.toUpperCase())) {
                // If requested method not allowed, create method not allowed error response
                const corsError = createCorsError('method_not_allowed', 
                    `Method '${requestedMethod}' not allowed by CORS policy`, corsContext);
                
                await this._sendCorsError(corsError, response);
                this._updateProcessingStatistics('method_violation');
                return;
            }

            // Validate Access-Control-Request-Headers against allowed headers policy
            const requestedHeaders = corsContext.requestedHeaders;
            if (requestedHeaders) {
                const headerList = requestedHeaders.split(',').map(h => h.trim().toLowerCase());
                const allowedHeadersLower = this.allowedHeaders.map(h => h.toLowerCase());
                
                const unauthorizedHeaders = headerList.filter(header => 
                    !allowedHeadersLower.includes(header)
                );

                // If requested headers not allowed, create headers not allowed error response
                if (unauthorizedHeaders.length > 0) {
                    const corsError = createCorsError('headers_not_allowed', 
                        `Headers '${unauthorizedHeaders.join(', ')}' not allowed by CORS policy`, corsContext);
                    
                    await this._sendCorsError(corsError, response);
                    this._updateProcessingStatistics('header_violation');
                    return;
                }
            }

            // Create successful preflight response using createPreflightResponse function
            const preflightResponse = createPreflightResponse(corsContext, this.corsConfig);

            // Apply CORS headers including Access-Control-Allow-* headers for browser
            response.writeHead(preflightResponse.statusCode, preflightResponse.headers);

            // Send preflight response to browser with 200 OK status and CORS headers
            response.end(preflightResponse.content);

            // Log preflight processing completion with success status and applied headers
            this.logger.debug('CORS preflight response sent', {
                correlationId: corsContext.correlationId,
                statusCode: preflightResponse.statusCode,
                allowedMethods: this.allowedMethods.join(', '),
                allowedHeaders: this.allowedHeaders.join(', '),
                processingTime: preflightResponse.processingTime
            });

            // Update preflight request statistics
            this._updateProcessingStatistics('preflight_success');

        } catch (error) {
            this.logger.error('Preflight request handling failed', {
                error: error.message,
                correlationId: corsContext?.correlationId
            }, error);

            // Send error response for preflight failures
            const corsError = createCorsError('preflight_failed', 
                `Preflight request processing failed: ${error.message}`, corsContext);
            await this._sendCorsError(corsError, response);
        }
    }

    /**
     * Applies appropriate CORS headers to actual requests based on origin validation and CORS
     * policy configuration. Implements comprehensive CORS header management for non-preflight
     * requests with proper caching directives and security considerations.
     * 
     * @param {Object} request - HTTP request object for header application
     * @param {Object} response - HTTP response object for header modification
     * @param {Object} corsContext - CORS processing context with validated origin information
     * @returns {void} Adds CORS headers to response object for cross-origin access
     */
    async applyCorsHeaders(request, response, corsContext) {
        try {
            // Extract validated origin from CORS context for header application
            const validatedOrigin = corsContext.originValidation?.isValid ? corsContext.origin : null;

            if (validatedOrigin) {
                // Set Access-Control-Allow-Origin header with validated origin or wildcard
                response.setHeader(CORS_HEADERS.ACCESS_CONTROL_ALLOW_ORIGIN, validatedOrigin);

                // Apply Access-Control-Allow-Credentials header if credentials are supported
                if (this.allowCredentials) {
                    response.setHeader(HTTP_HEADERS.ACCESS_CONTROL_ALLOW_CREDENTIALS, 'true');
                }

                // Include Vary: Origin header for proper caching behavior with multiple origins
                const existingVary = response.getHeader('Vary');
                const varyValue = existingVary ? `${existingVary}, Origin` : 'Origin';
                response.setHeader('Vary', varyValue);

                // Log CORS headers application with origin and credentials information
                this.logger.debug('CORS headers applied to response', {
                    correlationId: corsContext.correlationId,
                    origin: validatedOrigin,
                    allowCredentials: this.allowCredentials,
                    method: request.method,
                    url: request.url
                });

                // Mark response as CORS-compliant for downstream middleware and handlers
                response._corsProcessed = true;
                response._corsOrigin = validatedOrigin;
            }

        } catch (error) {
            this.logger.error('Failed to apply CORS headers', {
                error: error.message,
                correlationId: corsContext?.correlationId,
                origin: corsContext?.origin
            }, error);
        }
    }

    /**
     * Comprehensive CORS request validation including origin checking, method authorization,
     * and security validation. Implements complete CORS policy compliance checking with
     * security assessment and policy enforcement validation.
     * 
     * @param {Object} request - HTTP request object for validation
     * @param {Object} corsContext - CORS processing context with request metadata
     * @returns {Object} CORS validation result with status, errors, and policy enforcement details
     */
    async validateCorsRequest(request, corsContext) {
        try {
            // Initialize validation result with comprehensive status tracking
            const validationResult = {
                isValid: true,
                errors: [],
                warnings: [],
                validationDetails: {
                    originValidation: null,
                    methodValidation: null,
                    headerValidation: null,
                    securityAssessment: null
                },
                correlationId: corsContext.correlationId,
                validationTime: new Date().toISOString()
            };

            // Extract origin header from request for validation against allowed origins
            const origin = corsContext.origin;
            
            // Validate origin format and check for null origin handling requirements
            if (!origin) {
                validationResult.warnings.push('No Origin header present');
            } else {
                // Perform origin validation using validateCorsOrigin function with security checks
                const originValidation = validateCorsOrigin(origin, this.allowedOrigins, {
                    environment: this.appConfig.getEnvironment(),
                    allowNullOrigin: this.appConfig.isDevelopment()
                });

                validationResult.validationDetails.originValidation = originValidation;

                if (!originValidation.isValid) {
                    validationResult.isValid = false;
                    validationResult.errors.push(`Origin '${origin}' not allowed by CORS policy`);
                }
            }

            // Check request method against allowed methods for CORS policy compliance
            const requestMethod = request.method?.toUpperCase();
            if (requestMethod && !isValidHttpMethod(requestMethod)) {
                validationResult.isValid = false;
                validationResult.errors.push(`Invalid HTTP method '${requestMethod}'`);
            } else if (requestMethod && !this.allowedMethods.includes(requestMethod)) {
                validationResult.warnings.push(`Method '${requestMethod}' not in allowed methods list`);
            }

            validationResult.validationDetails.methodValidation = {
                method: requestMethod,
                isValid: isValidHttpMethod(requestMethod),
                isAllowed: this.allowedMethods.includes(requestMethod)
            };

            // Validate request headers against allowed headers policy for header authorization
            const corsHeaders = ['access-control-request-method', 'access-control-request-headers'];
            const potentiallyProblematicHeaders = [];

            Object.keys(request.headers).forEach(headerName => {
                const lowerHeaderName = headerName.toLowerCase();
                if (corsHeaders.includes(lowerHeaderName)) {
                    const headerValue = request.headers[headerName];
                    if (headerValue && headerValue.includes('\n')) {
                        potentiallyProblematicHeaders.push(headerName);
                    }
                }
            });

            if (potentiallyProblematicHeaders.length > 0) {
                validationResult.isValid = false;
                validationResult.errors.push('Header injection detected in CORS headers');
            }

            validationResult.validationDetails.headerValidation = {
                problematicHeaders: potentiallyProblematicHeaders,
                totalHeaders: Object.keys(request.headers).length
            };

            // Perform security validation to prevent CORS policy bypass and injection attacks
            const securityAssessment = {
                riskLevel: 'low',
                securityFlags: [],
                suspiciousPatterns: []
            };

            // Check for suspicious patterns in origin and headers
            if (origin && (origin.includes('<') || origin.includes('>') || origin.includes('"'))) {
                securityAssessment.riskLevel = 'high';
                securityAssessment.securityFlags.push('potential_xss_in_origin');
                validationResult.isValid = false;
                validationResult.errors.push('Suspicious characters detected in Origin header');
            }

            validationResult.validationDetails.securityAssessment = securityAssessment;

            // Compile validation results from all validation layers into comprehensive result
            validationResult.summary = {
                totalErrors: validationResult.errors.length,
                totalWarnings: validationResult.warnings.length,
                overallValid: validationResult.isValid,
                processingTime: Date.now() - new Date(corsContext.processingTimestamp).getTime()
            };

            // Return complete CORS validation result with policy enforcement status
            return validationResult;

        } catch (validationError) {
            // Return failed validation result if validation process encounters error
            return {
                isValid: false,
                errors: [`CORS validation failed: ${validationError.message}`],
                warnings: [],
                validationDetails: {},
                correlationId: corsContext?.correlationId,
                validationTime: new Date().toISOString(),
                error: validationError.message
            };
        }
    }

    /**
     * Determines if an HTTP request is a CORS preflight request based on method and required
     * headers. Implements comprehensive preflight detection with CORS specification compliance.
     * 
     * @param {Object} request - HTTP request object for preflight detection
     * @returns {boolean} true if request is a CORS preflight request, false otherwise
     */
    isPreflightRequest(request) {
        try {
            // Check if request method is OPTIONS using HTTP_METHODS.OPTIONS constant
            if (request.method?.toUpperCase() !== HTTP_METHODS.OPTIONS) {
                return false;
            }

            // Verify presence of Origin header indicating cross-origin request
            const hasOrigin = Boolean(request.headers?.origin || request.headers?.Origin);
            if (!hasOrigin) {
                return false;
            }

            // Check for Access-Control-Request-Method header required for preflight
            const hasRequestMethod = Boolean(
                request.headers['access-control-request-method'] ||
                request.headers['Access-Control-Request-Method']
            );

            if (!hasRequestMethod) {
                return false;
            }

            // Optionally check for Access-Control-Request-Headers header
            // This header is not required for all preflight requests
            const hasRequestHeaders = Boolean(
                request.headers['access-control-request-headers'] ||
                request.headers['Access-Control-Request-Headers']
            );

            // Return true if all preflight conditions are met
            return true;

        } catch (error) {
            this.logger.error('Preflight detection failed', { error: error.message });
            return false;
        }
    }

    /**
     * Handles CORS processing errors with proper classification, logging, and error response
     * generation. Implements comprehensive CORS error management with security event logging
     * and appropriate client responses.
     * 
     * @param {Object} error - Error object or CORS error with processing details
     * @param {Object} request - HTTP request object for error context
     * @param {Object} response - HTTP response object for error response
     * @param {Object} corsContext - CORS processing context for error correlation
     * @returns {void} Sends appropriate error response for CORS policy violations
     */
    async handleCorsError(error, request, response, corsContext) {
        try {
            // Classify CORS error type and determine appropriate HTTP status code
            let corsError;
            if (error && error.errorType) {
                // Use existing CORS error object
                corsError = error;
            } else {
                // Create new CORS error from generic error
                corsError = createCorsError('processing_error', error?.message || 'CORS processing failed', corsContext);
            }

            // Extract error context and correlation ID for detailed logging and tracking
            const errorContext = {
                correlationId: corsError.correlationId,
                errorType: corsError.errorType,
                statusCode: corsError.statusCode,
                origin: corsContext?.origin,
                method: request?.method,
                url: request?.url
            };

            // Log error details with security context and CORS processing information
            this.logger[corsError.logLevel]('CORS error occurred', errorContext);

            // Send error response to client with appropriate status code and CORS headers
            await this._sendCorsError(corsError, response);

            // Update CORS processing metrics with error statistics and classification
            this._updateProcessingStatistics('error', corsError.errorType);

        } catch (handlingError) {
            this.logger.error('CORS error handling failed', {
                originalError: error?.message,
                handlingError: handlingError.message,
                correlationId: corsContext?.correlationId
            });

            // Send fallback error response
            try {
                response.writeHead(HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                response.end('Internal Server Error');
            } catch (responseError) {
                // Unable to send response - connection may be broken
                this.logger.error('Failed to send CORS error response', { error: responseError.message });
            }
        }
    }

    /**
     * Returns current CORS configuration including allowed origins, methods, headers, and policy
     * settings for monitoring and debugging purposes. Provides comprehensive configuration
     * visibility for administration and troubleshooting.
     * 
     * @returns {Object} CORS configuration object with origins, methods, headers, and settings
     */
    getCorsConfiguration() {
        try {
            // Compile current CORS policy configuration including origins and methods
            const configuration = {
                isEnabled: this.isEnabled,
                allowedOrigins: [...this.allowedOrigins],
                allowedMethods: [...this.allowedMethods],
                allowedHeaders: [...this.allowedHeaders],
                allowCredentials: this.allowCredentials,
                maxAge: this.maxAge,
                
                // Include policy and security settings
                securityPolicies: {
                    ...this.config.securityPolicies
                },
                
                // Include environment and feature flag information
                environment: {
                    isDevelopment: this.appConfig.isDevelopment(),
                    currentEnvironment: this.appConfig.getEnvironment(),
                    featureEnabled: this.isEnabled
                },
                
                // Include processing statistics
                statistics: {
                    ...this.processingStats,
                    uniqueOrigins: Array.from(this.processingStats.processedOrigins)
                },
                
                // Include configuration metadata
                metadata: {
                    configuredAt: this.processingStats.startTime,
                    version: '1.0.0',
                    specification: 'W3C Cross-Origin Resource Sharing'
                }
            };

            // Return comprehensive CORS configuration for monitoring and debugging
            return configuration;

        } catch (error) {
            this.logger.error('Failed to get CORS configuration', { error: error.message });
            return {
                error: 'Configuration retrieval failed',
                isEnabled: this.isEnabled || false,
                basicInfo: {
                    allowedOrigins: this.allowedOrigins?.length || 0,
                    allowedMethods: this.allowedMethods?.length || 0,
                    allowedHeaders: this.allowedHeaders?.length || 0
                }
            };
        }
    }

    /**
     * Updates CORS configuration at runtime with validation and policy reconfiguration.
     * Provides dynamic configuration updates for operational flexibility while maintaining
     * security and consistency validation.
     * 
     * @param {Object} newConfig - New CORS configuration object with updated policy settings
     * @returns {boolean} true if configuration update was successful, false otherwise
     */
    async updateCorsConfig(newConfig) {
        try {
            // Validate new CORS configuration object against configuration schema
            if (!newConfig || typeof newConfig !== 'object') {
                throw new Error('Invalid configuration object provided');
            }

            // Store original configuration for rollback if needed
            const originalConfig = {
                allowedOrigins: [...this.allowedOrigins],
                allowedMethods: [...this.allowedMethods],
                allowedHeaders: [...this.allowedHeaders],
                allowCredentials: this.allowCredentials,
                maxAge: this.maxAge
            };

            // Update allowed origins array with new origin patterns and validation
            if (newConfig.allowedOrigins && Array.isArray(newConfig.allowedOrigins)) {
                // Validate each origin format
                for (const origin of newConfig.allowedOrigins) {
                    if (typeof origin !== 'string' || origin.length === 0) {
                        throw new Error(`Invalid origin format: ${origin}`);
                    }
                }
                this.allowedOrigins = [...newConfig.allowedOrigins];
            }

            // Reconfigure allowed methods and headers with security validation
            if (newConfig.allowedMethods && Array.isArray(newConfig.allowedMethods)) {
                // Validate each method
                for (const method of newConfig.allowedMethods) {
                    if (!isValidHttpMethod(method)) {
                        throw new Error(`Invalid HTTP method: ${method}`);
                    }
                }
                this.allowedMethods = newConfig.allowedMethods.map(m => m.toUpperCase());
            }

            if (newConfig.allowedHeaders && Array.isArray(newConfig.allowedHeaders)) {
                this.allowedHeaders = [...newConfig.allowedHeaders];
            }

            // Apply new credentials and cache duration settings
            if (typeof newConfig.allowCredentials === 'boolean') {
                this.allowCredentials = newConfig.allowCredentials;
            }

            if (typeof newConfig.maxAge === 'number' && newConfig.maxAge >= 0) {
                this.maxAge = newConfig.maxAge;
            }

            // Update main configuration object
            this.corsConfig = {
                allowedOrigins: this.allowedOrigins,
                allowedMethods: this.allowedMethods,
                allowedHeaders: this.allowedHeaders,
                allowCredentials: this.allowCredentials,
                maxAge: this.maxAge
            };

            // Validate updated configuration integrity and security compliance
            this._validateConfiguration();

            // Log configuration change event with details and impact assessment
            this.logger.info('CORS configuration updated successfully', {
                timestamp: new Date().toISOString(),
                changes: {
                    originsChanged: JSON.stringify(originalConfig.allowedOrigins) !== JSON.stringify(this.allowedOrigins),
                    methodsChanged: JSON.stringify(originalConfig.allowedMethods) !== JSON.stringify(this.allowedMethods),
                    headersChanged: JSON.stringify(originalConfig.allowedHeaders) !== JSON.stringify(this.allowedHeaders),
                    credentialsChanged: originalConfig.allowCredentials !== this.allowCredentials,
                    maxAgeChanged: originalConfig.maxAge !== this.maxAge
                },
                newConfig: {
                    originsCount: this.allowedOrigins.length,
                    methodsCount: this.allowedMethods.length,
                    headersCount: this.allowedHeaders.length
                }
            });

            // Return configuration update success status with validation results
            return true;

        } catch (updateError) {
            this.logger.error('CORS configuration update failed', {
                error: updateError.message,
                providedConfig: newConfig
            });

            return false;
        }
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Sets up CORS configuration from application config and defaults.
     * @private
     */
    _setupCorsConfiguration() {
        try {
            // Get server configuration from AppConfig
            const serverConfig = this.appConfig.getServerConfig();
            
            // Merge with default CORS configuration
            return {
                allowedOrigins: serverConfig?.cors?.allowedOrigins || DEFAULT_CORS_CONFIG.allowedOrigins,
                allowedMethods: serverConfig?.cors?.allowedMethods || DEFAULT_CORS_CONFIG.allowedMethods,
                allowedHeaders: serverConfig?.cors?.allowedHeaders || DEFAULT_CORS_CONFIG.allowedHeaders,
                allowCredentials: serverConfig?.cors?.allowCredentials || DEFAULT_CORS_CONFIG.allowCredentials,
                maxAge: serverConfig?.cors?.maxAge || DEFAULT_CORS_CONFIG.maxAge
            };
        } catch (error) {
            return DEFAULT_CORS_CONFIG;
        }
    }

    /**
     * Validates CORS configuration and throws error if invalid.
     * @private
     */
    _validateConfiguration() {
        // Validate origins array
        if (!Array.isArray(this.allowedOrigins) || this.allowedOrigins.length === 0) {
            throw new Error('CORS configuration must include at least one allowed origin');
        }

        // Validate methods array
        if (!Array.isArray(this.allowedMethods) || this.allowedMethods.length === 0) {
            throw new Error('CORS configuration must include at least one allowed method');
        }

        // Validate headers array
        if (!Array.isArray(this.allowedHeaders)) {
            throw new Error('CORS configuration allowedHeaders must be an array');
        }

        // Validate maxAge
        if (typeof this.maxAge !== 'number' || this.maxAge < 0) {
            throw new Error('CORS maxAge must be a non-negative number');
        }
    }

    /**
     * Initializes fallback configuration when normal setup fails.
     * @private
     */
    _initializeFallbackConfiguration() {
        this.config = DEFAULT_CORS_CONFIG;
        this.corsConfig = DEFAULT_CORS_CONFIG;
        this.allowedOrigins = TUTORIAL_ALLOWED_ORIGINS;
        this.allowedMethods = DEFAULT_CORS_CONFIG.allowedMethods;
        this.allowedHeaders = DEFAULT_CORS_CONFIG.allowedHeaders;
        this.allowCredentials = false;
        this.maxAge = CORS_PREFLIGHT_MAX_AGE;
        this.isEnabled = false; // Disable CORS on configuration failure
        this.logger = console; // Fallback to console logging
        this.processingStats = { ...CORS_PROCESSING_METRICS };
    }

    /**
     * Sends CORS error response to client.
     * @private
     */
    async _sendCorsError(corsError, response) {
        try {
            // Create error response using response utilities
            const errorResponse = createErrorResponse(
                corsError.statusCode,
                corsError.clientMessage,
                { correlationId: corsError.correlationId },
                { customHeaders: corsError.headers }
            );

            // Send error response
            response.writeHead(errorResponse.statusCode, errorResponse.headers);
            response.end(errorResponse.content);

        } catch (error) {
            // Fallback error response
            try {
                response.writeHead(HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                response.end('Internal Server Error');
            } catch (finalError) {
                this.logger?.error('Failed to send any error response', { error: finalError.message });
            }
        }
    }

    /**
     * Updates processing statistics for monitoring.
     * @private
     */
    _updateProcessingStatistics(type, subType = null) {
        try {
            this.processingStats.totalRequests++;
            this.processingStats.lastProcessingTime = new Date().toISOString();

            switch (type) {
                case 'success':
                    this.processingStats.successfulRequests++;
                    break;
                case 'preflight_success':
                    this.processingStats.preflightRequests++;
                    this.processingStats.successfulRequests++;
                    break;
                case 'policy_violation':
                case 'method_violation':
                case 'header_violation':
                    this.processingStats.policyViolations++;
                    break;
                case 'error':
                    // Error statistics tracked by subType
                    break;
            }

        } catch (error) {
            // Fail silently for statistics updates
            this.logger?.debug('Statistics update failed', { error: error.message });
        }
    }
}

// ============================================================================
// DEFAULT CORS HANDLER INSTANCE AND MODULE EXPORTS
// ============================================================================

// Create default CORS handler instance configured for immediate use in tutorial application
const corsHandler = new CorsHandler();

// Export main CorsHandler class for custom instances
export { CorsHandler };

// Export utility functions for CORS processing
export { createCorsContext };
export { validateCorsOrigin };
export { createPreflightResponse };
export { createCorsError };

// Export default CORS handler instance configured for immediate use
export { corsHandler };

// Default export for convenient access to complete CORS functionality
export default corsHandler;