/**
 * Hello Endpoint Route Configuration Module for Node.js Tutorial Application
 * 
 * This module implements the /hello endpoint routing logic that defines route-specific handlers,
 * validation, and configuration for GET requests to the hello endpoint. Demonstrates clean route
 * organization patterns with controller integration, method validation, and educational routing
 * concepts while maintaining production-ready patterns for HTTP route management.
 * 
 * The module provides comprehensive route configuration and request handling for the tutorial
 * application's primary endpoint functionality, implementing:
 * - HelloRoute class for route configuration and request processing
 * - Route-specific validation and authorization checking
 * - Controller integration with proper error handling and response generation
 * - Performance monitoring and metrics collection for route operations
 * - Educational patterns demonstrating enterprise routing practices
 * - Production-ready observability features for debugging and monitoring
 * 
 * Key Features:
 * - Production-ready route handling with comprehensive error management
 * - Security-focused validation with method authorization and path verification
 * - Educational clarity for learning HTTP routing fundamentals and best practices
 * - Integration with tutorial application's controller and utility architecture
 * - Comprehensive logging and performance monitoring with correlation tracking
 * - Standardized error responses and HTTP status code management
 * - Route-specific configuration and operational health monitoring
 * 
 * Educational Objectives:
 * - Demonstrates enterprise-grade HTTP route implementation patterns and practices
 * - Shows proper route organization and controller integration techniques
 * - Illustrates effective validation, authorization, and security checking
 * - Provides examples of performance monitoring and metrics collection
 * - Shows integration patterns between routing and application architecture
 * - Demonstrates proper separation of concerns in route handling logic
 * 
 * @fileoverview Hello endpoint route configuration with comprehensive routing capabilities
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import hello endpoint controller for business logic and request processing
const { HelloController } = require('../controllers/hello.controller.js'); // v1.0.0

// Import core route handling utilities for request routing and error management
const { 
    RouteHandler,
    generateRouteId,
    createRouteContext,
    normalizeRoutePath,
    createRouteError
} = require('../lib/route-handler.js'); // v1.0.0

// Import HTTP method constants and validation utilities for authorization
const { 
    HTTP_METHODS,
    HELLO_ENDPOINT_METHODS,
    isMethodAllowedForEndpoint,
    validateMethodAuthorization
} = require('../constants/http-methods.js'); // v1.0.0

// Import standardized response message constants for consistent messaging
const { 
    RESPONSE_MESSAGES,
    HELLO_ENDPOINT_MESSAGES
} = require('../constants/response-messages.js'); // v1.0.0

// Import structured logging for route operations and correlation tracking
const { logger } = require('../utils/logger.js'); // v1.0.0

// ============================================================================
// GLOBAL ROUTE CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Primary hello route configuration object with endpoint behavior specification.
 * Defines core routing parameters including path, methods, controller integration,
 * response messaging, and operational settings for the /hello endpoint.
 * 
 * @constant {Object} HELLO_ROUTE_CONFIG
 * @property {string} path - Route path pattern for URL matching ('/hello')
 * @property {string[]} methods - Array of allowed HTTP methods (['GET'])
 * @property {string} controller - Controller class name for request delegation
 * @property {string} responseMessage - Default response message content
 * @property {boolean} enableValidation - Enable comprehensive request validation
 * @property {boolean} enableLogging - Enable detailed route operation logging
 * @property {boolean} strictMode - Enable strict validation and security checking
 */
const HELLO_ROUTE_CONFIG = {
    path: '/hello',
    methods: ['GET'],
    controller: 'HelloController',
    responseMessage: 'Hello world',
    enableValidation: true,
    enableLogging: true,
    strictMode: true
};

/**
 * Hello route metadata object with descriptive information and categorization.
 * Provides comprehensive metadata for route identification, monitoring, and
 * documentation purposes across the tutorial application.
 * 
 * @constant {Object} HELLO_ROUTE_METADATA
 * @property {string} name - Human-readable route name for identification
 * @property {string} version - Route implementation version for compatibility tracking
 * @property {string} description - Detailed route description for documentation
 * @property {string} category - Route category for classification and grouping
 * @property {string} endpoint - Endpoint path for reference and validation
 * @property {string} type - Route type classification for operational categorization
 */
const HELLO_ROUTE_METADATA = {
    name: 'HelloRoute',
    version: '1.0.0',
    description: 'Hello world endpoint route for tutorial application',
    category: 'tutorial-route',
    endpoint: '/hello',
    type: 'simple-response'
};

/**
 * Default hello route configuration settings for initialization and operation.
 * Provides baseline configuration parameters for route processing behavior,
 * security settings, and performance monitoring characteristics.
 */
const DEFAULT_HELLO_ROUTE_CONFIG = {
    // Request processing configuration
    requestTimeout: 5000, // 5 seconds for hello endpoint
    maxRequestSize: 1024, // 1KB for simple requests
    
    // Security and validation settings
    enableSecurityValidation: true,
    enableMethodValidation: true,
    enablePathValidation: true,
    strictModeEnabled: true,
    
    // Performance and monitoring settings
    enableMetrics: true,
    enablePerformanceLogging: true,
    slowRequestThreshold: 100, // 100ms threshold for hello endpoint
    
    // Error handling configuration
    includeStackTrace: false,
    sanitizeErrorMessages: true,
    enableDetailedErrorLogging: true,
    
    // Response configuration
    defaultContentType: 'text/plain',
    enableCaching: false,
    compressionEnabled: false
};

/**
 * Hello route performance and statistics tracking object.
 * Collects comprehensive metrics for route processing optimization, monitoring,
 * and performance analysis specific to the hello endpoint operations.
 */
const HELLO_ROUTE_METRICS = {
    // Request counting and processing statistics
    totalRequests: 0,
    successfulRequests: 0,
    errorCount: 0,
    validationErrors: 0,
    methodNotAllowedCount: 0,
    
    // Performance timing measurements
    averageResponseTime: 0,
    minimumResponseTime: Number.MAX_SAFE_INTEGER,
    maximumResponseTime: 0,
    slowRequestCount: 0,
    
    // Route-specific operational statistics
    helloRouteHits: 0,
    getRequestCount: 0,
    invalidMethodAttempts: 0,
    securityViolations: 0,
    
    // Monitoring and tracking metadata
    lastResetTime: new Date(),
    lastRequestTime: null,
    uptimeStart: new Date(),
    
    // Controller delegation statistics
    controllerSuccessCount: 0,
    controllerErrorCount: 0,
    controllerProcessingTime: 0
};

// ============================================================================
// ROUTE UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates incoming HTTP requests specifically for the hello endpoint including
 * method validation, path verification, and hello-specific authorization checks.
 * Implements comprehensive request validation with security assessment and
 * detailed error reporting for the /hello endpoint.
 * 
 * @param {Object} request - HTTP request object for validation
 * @param {Object} routeContext - Route processing context with correlation information
 * @returns {Object} Validation result specific to hello endpoint with success status and error details
 * 
 * @example
 * const validationResult = validateHelloRouteRequest(request, routeContext);
 * if (validationResult.isValid) {
 *     // Proceed with request processing
 * } else {
 *     // Handle validation errors
 * }
 */
function validateHelloRouteRequest(request, routeContext) {
    try {
        // Initialize comprehensive validation result object
        const validationResult = {
            isValid: false,
            authorized: false,
            method: request.method,
            path: request.url,
            validationId: `hello_val_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            errors: [],
            warnings: [],
            securityAssessment: {
                passed: false,
                threatLevel: 'none',
                violations: []
            },
            metadata: {
                timestamp: new Date().toISOString(),
                routeContext: routeContext.routeId,
                validationType: 'hello-endpoint-validation'
            }
        };

        // Step 1: Validate HTTP method against HELLO_ENDPOINT_METHODS array for authorization
        logger.debug('Validating HTTP method for hello endpoint', {
            method: request.method,
            allowedMethods: HELLO_ENDPOINT_METHODS,
            routeId: routeContext.routeId
        });

        if (!request.method || typeof request.method !== 'string') {
            validationResult.errors.push('Invalid or missing HTTP method');
            validationResult.securityAssessment.violations.push('missing_method');
            return validationResult;
        }

        // Normalize method and validate against hello endpoint allowed methods
        const normalizedMethod = request.method.toUpperCase();
        validationResult.method = normalizedMethod;

        if (!HELLO_ENDPOINT_METHODS.includes(normalizedMethod)) {
            validationResult.errors.push(`Method ${normalizedMethod} not allowed for hello endpoint`);
            validationResult.securityAssessment.violations.push('method_not_allowed');
            validationResult.securityAssessment.threatLevel = 'low';
            return validationResult;
        }

        // Step 2: Verify request URL path matches exact /hello route pattern
        logger.debug('Validating URL path for hello endpoint', {
            requestUrl: request.url,
            expectedPath: HELLO_ROUTE_CONFIG.path,
            routeId: routeContext.routeId
        });

        if (!request.url || typeof request.url !== 'string') {
            validationResult.errors.push('Invalid or missing request URL');
            validationResult.securityAssessment.violations.push('missing_url');
            return validationResult;
        }

        // Normalize path and verify exact match with hello route pattern
        const normalizedPath = normalizeRoutePath(request.url);
        validationResult.path = normalizedPath;

        if (normalizedPath !== HELLO_ROUTE_CONFIG.path) {
            validationResult.errors.push(`Path ${normalizedPath} does not match hello endpoint pattern`);
            validationResult.securityAssessment.violations.push('path_mismatch');
            return validationResult;
        }

        // Step 3: Use RouteHandler.validateRouteAccess for comprehensive access validation
        logger.debug('Performing comprehensive route access validation', {
            method: normalizedMethod,
            path: normalizedPath,
            routeId: routeContext.routeId
        });

        const routeHandler = new RouteHandler();
        const accessValidation = routeHandler.validateRouteAccess(normalizedMethod, normalizedPath, {
            strictMode: HELLO_ROUTE_CONFIG.strictMode,
            enableSecurity: DEFAULT_HELLO_ROUTE_CONFIG.enableSecurityValidation
        });

        if (!accessValidation.isValid) {
            validationResult.errors.push(...accessValidation.errors);
            validationResult.securityAssessment.violations.push(...accessValidation.security.violations);
            validationResult.securityAssessment.threatLevel = accessValidation.security.threatLevel;
            return validationResult;
        }

        // Step 4: Perform hello endpoint specific security validation checks
        logger.debug('Performing hello endpoint specific security validation', {
            securityEnabled: DEFAULT_HELLO_ROUTE_CONFIG.enableSecurityValidation,
            routeId: routeContext.routeId
        });

        // Check for query parameters (not expected for hello endpoint)
        if (request.url.includes('?')) {
            validationResult.warnings.push('Query parameters detected on hello endpoint');
            validationResult.securityAssessment.violations.push('unexpected_query_params');
        }

        // Validate request headers for hello endpoint requirements
        if (request.headers) {
            // Check for suspicious headers
            const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-cluster-client-ip'];
            suspiciousHeaders.forEach(header => {
                if (request.headers[header]) {
                    validationResult.warnings.push(`Proxy header detected: ${header}`);
                }
            });

            // Validate user agent if present
            const userAgent = request.headers['user-agent'];
            if (userAgent && userAgent.length > 1000) {
                validationResult.warnings.push('Unusually long user agent string');
                validationResult.securityAssessment.violations.push('suspicious_user_agent');
            }
        }

        // Step 5: Validate request headers and content type for hello endpoint requirements
        const contentType = request.headers?.['content-type'];
        if (contentType && normalizedMethod === 'GET') {
            validationResult.warnings.push('Content-Type header present on GET request');
        }

        // Check for request body on GET request (not expected)
        if (normalizedMethod === 'GET' && request.headers?.['content-length'] && 
            parseInt(request.headers['content-length']) > 0) {
            validationResult.warnings.push('Request body present on GET request');
            validationResult.securityAssessment.violations.push('unexpected_request_body');
        }

        // Step 6: Create validation result object with success status and detailed error information
        validationResult.authorized = accessValidation.authorized;
        validationResult.securityAssessment.passed = 
            accessValidation.security.validated && 
            validationResult.securityAssessment.violations.length === 0;

        // Set overall validation status
        validationResult.isValid = 
            validationResult.errors.length === 0 && 
            validationResult.authorized && 
            validationResult.securityAssessment.passed;

        // Add success metadata if validation passed
        if (validationResult.isValid) {
            validationResult.metadata.validationStatus = 'passed';
            validationResult.metadata.allowedMethods = HELLO_ENDPOINT_METHODS;
            validationResult.metadata.endpointConfiguration = HELLO_ROUTE_CONFIG;
        }

        // Step 7: Return comprehensive hello route validation result for request processing
        logger.info('Hello route validation completed', {
            validationId: validationResult.validationId,
            isValid: validationResult.isValid,
            authorized: validationResult.authorized,
            errorCount: validationResult.errors.length,
            warningCount: validationResult.warnings.length,
            securityPassed: validationResult.securityAssessment.passed,
            routeId: routeContext.routeId
        });

        return validationResult;

    } catch (error) {
        // Handle validation errors and return error result
        logger.error('Hello route validation failed', {
            error: error.message,
            routeId: routeContext?.routeId,
            method: request?.method,
            url: request?.url
        }, error);

        return {
            isValid: false,
            authorized: false,
            method: request?.method || 'unknown',
            path: request?.url || 'unknown',
            errors: [`Validation error: ${error.message}`],
            warnings: [],
            securityAssessment: {
                passed: false,
                threatLevel: 'critical',
                violations: ['validation_error']
            },
            metadata: {
                timestamp: new Date().toISOString(),
                validationFailed: true,
                errorType: 'validation_exception'
            }
        };
    }
}

/**
 * Creates and configures the hello route request handler with controller integration
 * and proper error handling for GET /hello requests. Implements comprehensive
 * handler creation with route-specific configuration and error management.
 * 
 * @param {Object} routeConfig - Route configuration object for handler setup
 * @returns {Function} Request handler function for hello endpoint processing with controller delegation
 * 
 * @example
 * const handler = createHelloRouteHandler(HELLO_ROUTE_CONFIG);
 * const result = await handler(request, response, context);
 */
function createHelloRouteHandler(routeConfig = {}) {
    try {
        // Initialize route configuration with defaults
        const config = {
            ...DEFAULT_HELLO_ROUTE_CONFIG,
            ...HELLO_ROUTE_CONFIG,
            ...routeConfig
        };

        logger.info('Creating hello route handler', {
            routePath: config.path,
            allowedMethods: config.methods,
            controllerName: config.controller,
            enableValidation: config.enableValidation
        });

        // Step 1: Initialize HelloController instance with hello route configuration
        const helloController = new HelloController({
            routeConfig: config,
            enableLogging: config.enableLogging,
            responseMessage: config.responseMessage
        });

        // Step 2: Create route-specific request handler function with proper closure
        async function helloRouteHandler(request, response, context = {}) {
            // Generate unique request ID for correlation and tracking
            const requestId = generateRouteId(request.method, request.url);
            const startTime = Date.now();

            try {
                // Create enhanced route context with hello route metadata
                const routeContext = createRouteContext(request, requestId);
                routeContext.route = {
                    path: config.path,
                    handler: 'HelloRouteHandler',
                    controller: config.controller,
                    configuration: config
                };

                logger.info('Processing hello route request', {
                    requestId: requestId,
                    method: request.method,
                    url: request.url,
                    userAgent: request.headers?.['user-agent'],
                    remoteAddress: request.connection?.remoteAddress
                });

                // Step 3: Set up request validation using validateHelloRouteRequest function
                if (config.enableValidation) {
                    const validation = validateHelloRouteRequest(request, routeContext);
                    
                    if (!validation.isValid) {
                        const validationError = createRouteError(
                            'BAD_REQUEST', 
                            `Hello route validation failed: ${validation.errors.join(', ')}`,
                            routeContext
                        );
                        
                        logger.warn('Hello route validation failed', {
                            requestId: requestId,
                            errors: validation.errors,
                            warnings: validation.warnings,
                            securityViolations: validation.securityAssessment.violations
                        });

                        // Update metrics for validation failure
                        HELLO_ROUTE_METRICS.validationErrors++;
                        HELLO_ROUTE_METRICS.errorCount++;

                        throw validationError;
                    }

                    logger.debug('Hello route validation passed', {
                        requestId: requestId,
                        validationId: validation.validationId,
                        authorized: validation.authorized
                    });
                }

                // Step 4: Configure controller request delegation for hello endpoint processing
                const controllerContext = {
                    ...context,
                    routeContext: routeContext,
                    requestId: requestId,
                    routeConfig: config
                };

                // Delegate request to hello controller
                const controllerResult = await helloController.processRequest(request, controllerContext);

                if (!controllerResult.success) {
                    throw new Error(controllerResult.error || 'Controller processing failed');
                }

                // Step 5: Implement error handling for hello route processing failures
                const processingTime = Date.now() - startTime;
                
                // Update performance metrics
                HELLO_ROUTE_METRICS.totalRequests++;
                HELLO_ROUTE_METRICS.successfulRequests++;
                HELLO_ROUTE_METRICS.helloRouteHits++;
                HELLO_ROUTE_METRICS.controllerSuccessCount++;
                HELLO_ROUTE_METRICS.getRequestCount++;
                
                // Update timing statistics
                HELLO_ROUTE_METRICS.averageResponseTime = 
                    ((HELLO_ROUTE_METRICS.averageResponseTime * (HELLO_ROUTE_METRICS.totalRequests - 1)) + processingTime) / 
                    HELLO_ROUTE_METRICS.totalRequests;
                
                HELLO_ROUTE_METRICS.minimumResponseTime = Math.min(HELLO_ROUTE_METRICS.minimumResponseTime, processingTime);
                HELLO_ROUTE_METRICS.maximumResponseTime = Math.max(HELLO_ROUTE_METRICS.maximumResponseTime, processingTime);
                
                if (processingTime > config.slowRequestThreshold) {
                    HELLO_ROUTE_METRICS.slowRequestCount++;
                }

                HELLO_ROUTE_METRICS.lastRequestTime = new Date();

                // Step 6: Add hello route logging and metrics collection integration
                if (config.enableLogging) {
                    logHelloRouteOperation('request_processed', {
                        requestId: requestId,
                        processingTime: processingTime,
                        controllerResult: controllerResult,
                        routeConfig: config
                    }, 'info');
                }

                // Step 7: Return configured hello route handler function ready for HTTP requests
                return {
                    success: true,
                    statusCode: 200,
                    data: controllerResult.data,
                    processingTime: processingTime,
                    requestId: requestId,
                    route: config.path,
                    controller: config.controller
                };

            } catch (error) {
                const processingTime = Date.now() - startTime;
                
                // Update error metrics
                HELLO_ROUTE_METRICS.errorCount++;
                HELLO_ROUTE_METRICS.controllerErrorCount++;

                logger.error('Hello route handler error', {
                    requestId: requestId,
                    error: error.message,
                    processingTime: processingTime,
                    method: request.method,
                    url: request.url
                }, error);

                // Log error operation
                logHelloRouteOperation('request_error', {
                    requestId: requestId,
                    error: error.message,
                    processingTime: processingTime
                }, 'error');

                return {
                    success: false,
                    statusCode: error.statusCode || 500,
                    error: error.message || 'Hello route processing failed',
                    processingTime: processingTime,
                    requestId: requestId,
                    route: config.path
                };
            }
        }

        // Add metadata to handler function for identification
        helloRouteHandler.routeConfig = config;
        helloRouteHandler.routePath = config.path;
        helloRouteHandler.handlerType = 'HelloRouteHandler';
        helloRouteHandler.created = new Date().toISOString();

        logger.info('Hello route handler created successfully', {
            routePath: config.path,
            handlerType: 'HelloRouteHandler',
            controllerIntegration: config.controller,
            validationEnabled: config.enableValidation
        });

        return helloRouteHandler;

    } catch (error) {
        logger.error('Failed to create hello route handler', {
            error: error.message,
            routeConfig: routeConfig
        }, error);

        // Return fallback handler that returns error
        return async function fallbackHelloHandler(request, response, context) {
            return {
                success: false,
                statusCode: 500,
                error: 'Hello route handler creation failed',
                requestId: generateRouteId(request.method, request.url)
            };
        };
    }
}

/**
 * Logs hello route operations with route-specific context, performance data,
 * and correlation information for monitoring and debugging purposes.
 * Implements comprehensive logging with structured formatting and metrics.
 * 
 * @param {string} operation - Operation type for logging categorization
 * @param {Object} operationData - Operation data and context information
 * @param {string} level - Log level for operation severity
 * @returns {void} Logs hello route operation information with structured formatting
 * 
 * @example
 * logHelloRouteOperation('request_processed', { requestId: 'req_123', processingTime: 45 }, 'info');
 */
function logHelloRouteOperation(operation, operationData = {}, level = 'info') {
    try {
        // Step 1: Format operation data with hello route context and endpoint identification
        const logContext = {
            operation: operation,
            timestamp: new Date().toISOString(),
            route: HELLO_ROUTE_CONFIG.path,
            routeType: 'hello-endpoint',
            module: 'HelloRoute'
        };

        // Step 2: Add hello route specific metadata including path, methods, and handler information
        logContext.routeMetadata = {
            path: HELLO_ROUTE_CONFIG.path,
            allowedMethods: HELLO_ROUTE_CONFIG.methods,
            controller: HELLO_ROUTE_CONFIG.controller,
            responseMessage: HELLO_ROUTE_CONFIG.responseMessage,
            version: HELLO_ROUTE_METADATA.version
        };

        // Step 3: Include request correlation ID for hello route request tracking and debugging
        if (operationData.requestId) {
            logContext.correlationId = operationData.requestId;
            logContext.tracking = {
                requestId: operationData.requestId,
                operationType: operation
            };
        }

        // Step 4: Add performance metrics for hello route operation timing and throughput measurement
        if (operationData.processingTime !== undefined) {
            logContext.performance = {
                processingTime: operationData.processingTime,
                isSlowRequest: operationData.processingTime > DEFAULT_HELLO_ROUTE_CONFIG.slowRequestThreshold,
                performanceCategory: operationData.processingTime < 50 ? 'fast' : 
                                   operationData.processingTime < 100 ? 'normal' : 'slow'
            };
        }

        // Include current route metrics snapshot
        logContext.routeMetrics = {
            totalRequests: HELLO_ROUTE_METRICS.totalRequests,
            successfulRequests: HELLO_ROUTE_METRICS.successfulRequests,
            errorCount: HELLO_ROUTE_METRICS.errorCount,
            averageResponseTime: HELLO_ROUTE_METRICS.averageResponseTime,
            uptime: Date.now() - HELLO_ROUTE_METRICS.uptimeStart.getTime()
        };

        // Add operation-specific data
        if (operationData.controllerResult) {
            logContext.controller = {
                success: operationData.controllerResult.success,
                dataPresent: !!operationData.controllerResult.data,
                resultType: typeof operationData.controllerResult.data
            };
        }

        if (operationData.error) {
            logContext.error = {
                message: operationData.error,
                category: 'hello-route-error'
            };
        }

        // Include additional operation data
        const enhancedOperationData = {
            ...operationData,
            ...logContext
        };

        // Step 5: Use structured logger with hello route context for consistent log formatting
        const logMessage = `Hello Route Operation: ${operation}`;
        
        // Step 6: Update hello route operational metrics for monitoring and analysis systems
        switch (level.toLowerCase()) {
            case 'trace':
                logger.trace(logMessage, enhancedOperationData);
                break;
            case 'debug':
                logger.debug(logMessage, enhancedOperationData);
                break;
            case 'info':
                logger.info(logMessage, enhancedOperationData);
                break;
            case 'warn':
                logger.warn(logMessage, enhancedOperationData);
                break;
            case 'error':
                logger.error(logMessage, enhancedOperationData);
                break;
            case 'fatal':
                logger.fatal(logMessage, enhancedOperationData);
                break;
            default:
                logger.info(logMessage, enhancedOperationData);
        }

        // Update operational logging metrics
        if (!HELLO_ROUTE_METRICS.loggingStats) {
            HELLO_ROUTE_METRICS.loggingStats = {
                totalLogs: 0,
                errorLogs: 0,
                warnLogs: 0,
                infoLogs: 0
            };
        }

        HELLO_ROUTE_METRICS.loggingStats.totalLogs++;
        
        switch (level.toLowerCase()) {
            case 'error':
            case 'fatal':
                HELLO_ROUTE_METRICS.loggingStats.errorLogs++;
                break;
            case 'warn':
                HELLO_ROUTE_METRICS.loggingStats.warnLogs++;
                break;
            case 'info':
                HELLO_ROUTE_METRICS.loggingStats.infoLogs++;
                break;
        }

    } catch (error) {
        // Fallback logging if structured logging fails
        console.error('Hello route logging failed:', error.message);
        console.error('Original operation:', operation, operationData);
    }
}

// ============================================================================
// MAIN HELLO ROUTE CLASS IMPLEMENTATION
// ============================================================================

/**
 * Hello endpoint route configuration class that encapsulates routing logic,
 * controller integration, and request handling for the /hello endpoint.
 * Demonstrates clean route organization patterns with educational clarity
 * while implementing production-ready route management including validation,
 * logging, and error handling for the Node.js tutorial application's
 * primary endpoint functionality.
 * 
 * The HelloRoute class provides:
 * - Comprehensive route configuration and initialization with defaults
 * - Request processing with validation, controller delegation, and response generation
 * - Performance monitoring and metrics collection for route operations
 * - Educational patterns demonstrating enterprise routing practices
 * - Production-ready error handling and security validation
 * - Integration with tutorial application's controller and utility architecture
 */
class HelloRoute {
    /**
     * Initializes the HelloRoute with configuration, controller setup, and
     * route-specific behavior configuration for GET /hello endpoint handling.
     * Sets up comprehensive route configuration with validation, logging,
     * and performance monitoring capabilities.
     * 
     * @param {Object} routeConfig - Route configuration object for initialization
     */
    constructor(routeConfig = {}) {
        try {
            // Step 1: Validate and merge route configuration with HELLO_ROUTE_CONFIG defaults
            this.routeConfig = {
                ...DEFAULT_HELLO_ROUTE_CONFIG,
                ...HELLO_ROUTE_CONFIG,
                ...routeConfig
            };

            // Step 2: Set route path to '/hello' and allowed methods to ['GET'] from configuration
            this.routePath = this.routeConfig.path;
            this.allowedMethods = [...this.routeConfig.methods];

            // Step 3: Initialize HelloController instance with hello controller configuration
            this.helloController = new HelloController({
                routeConfig: this.routeConfig,
                enableLogging: this.routeConfig.enableLogging,
                responseMessage: this.routeConfig.responseMessage
            });

            // Step 4: Set up route-specific logger with hello route context and identification
            this.logger = logger.createChildLogger({
                logLevel: this.routeConfig.logLevel || 'INFO'
            }, {
                route: this.routePath,
                routeType: 'hello-endpoint',
                module: 'HelloRoute',
                version: HELLO_ROUTE_METADATA.version
            });

            // Step 5: Initialize route metrics collection for performance monitoring and analysis
            this.routeMetrics = {
                ...HELLO_ROUTE_METRICS,
                enabled: this.routeConfig.enableMetrics !== false,
                routeSpecific: {
                    initializationTime: new Date(),
                    configurationHash: this._generateConfigHash(),
                    controllerIntegration: 'HelloController'
                }
            };

            // Step 6: Configure route validation rules and security settings for hello endpoint
            this.validationConfig = {
                enableValidation: this.routeConfig.enableValidation !== false,
                enableSecurityValidation: this.routeConfig.enableSecurityValidation !== false,
                enableMethodValidation: this.routeConfig.enableMethodValidation !== false,
                enablePathValidation: this.routeConfig.enablePathValidation !== false,
                strictMode: this.routeConfig.strictMode !== false
            };

            // Step 7: Set up error handling configuration for hello route processing failures
            this.errorHandling = {
                includeStackTrace: this.routeConfig.includeStackTrace === true,
                sanitizeErrorMessages: this.routeConfig.sanitizeErrorMessages !== false,
                enableDetailedErrorLogging: this.routeConfig.enableDetailedErrorLogging !== false,
                maxErrorRetries: this.routeConfig.maxErrorRetries || 0
            };

            // Initialize route handler
            this.routeHandler = new RouteHandler({
                ...this.routeConfig,
                routeSpecific: true,
                helloEndpoint: true
            });

            // Step 8: Mark route as initialized and ready for request processing
            this.initialized = true;
            this.initializationTime = new Date();
            this.readyForRequests = true;

            // Step 9: Log hello route initialization with configuration details and success status
            this.logger.info('HelloRoute initialized successfully', {
                routePath: this.routePath,
                allowedMethods: this.allowedMethods,
                controllerIntegrated: true,
                validationEnabled: this.validationConfig.enableValidation,
                metricsEnabled: this.routeMetrics.enabled,
                strictMode: this.validationConfig.strictMode,
                initializationTime: this.initializationTime.toISOString()
            });

        } catch (error) {
            // Handle initialization failure with fallback configuration
            this._initializeFallbackConfiguration();
            
            console.error('HelloRoute initialization failed:', error.message);
            
            if (logger && logger.error) {
                logger.error('HelloRoute initialization failed', {
                    error: error.message,
                    routeConfig: routeConfig
                }, error);
            }
        }
    }

    /**
     * Configures the hello route with proper handlers, validation, and middleware
     * integration for HTTP request processing. Sets up comprehensive route
     * configuration with application integration and request handling pipeline.
     * 
     * @param {Object} application - Application instance for route registration
     * @param {Object} configurationOptions - Additional configuration options
     * @returns {Object} Route configuration result with handler setup and configuration status
     */
    async configureRoute(application, configurationOptions = {}) {
        try {
            // Step 1: Validate application instance and ensure proper HTTP server capabilities
            if (!application || typeof application !== 'object') {
                throw new Error('Invalid application instance provided for route configuration');
            }

            const startTime = Date.now();
            
            this.logger.info('Configuring hello route', {
                routePath: this.routePath,
                allowedMethods: this.allowedMethods,
                configurationType: 'application-integration'
            });

            // Step 2: Create hello route handler using createHelloRouteHandler function
            const handlerConfig = {
                ...this.routeConfig,
                ...configurationOptions
            };

            const routeHandler = createHelloRouteHandler(handlerConfig);

            if (!routeHandler || typeof routeHandler !== 'function') {
                throw new Error('Failed to create hello route handler');
            }

            // Step 3: Configure route path matching for exact '/hello' endpoint resolution
            const routePathPattern = this.routePath;
            const pathMatcher = (requestPath) => {
                const normalizedPath = normalizeRoutePath(requestPath);
                return normalizedPath === routePathPattern;
            };

            // Step 4: Set up HTTP method validation using HELLO_ENDPOINT_METHODS authorization
            const methodValidator = (requestMethod) => {
                if (!requestMethod || typeof requestMethod !== 'string') {
                    return false;
                }
                return HELLO_ENDPOINT_METHODS.includes(requestMethod.toUpperCase());
            };

            // Step 5: Configure controller delegation for hello endpoint request processing
            const controllerIntegration = {
                controller: this.helloController,
                controllerType: 'HelloController',
                delegationEnabled: true,
                errorHandling: this.errorHandling
            };

            // Step 6: Set up middleware integration for logging and error handling coordination
            const middlewareConfig = {
                enableLogging: this.routeConfig.enableLogging,
                enableMetrics: this.routeMetrics.enabled,
                enableValidation: this.validationConfig.enableValidation,
                loggerInstance: this.logger
            };

            // Step 7: Configure route-specific security validation and access control settings
            const securityConfig = {
                enableSecurityValidation: this.validationConfig.enableSecurityValidation,
                strictMode: this.validationConfig.strictMode,
                methodValidation: this.validationConfig.enableMethodValidation,
                pathValidation: this.validationConfig.enablePathValidation
            };

            // Step 8: Register route handler with application for /hello endpoint processing
            const routeRegistration = {
                path: this.routePath,
                methods: this.allowedMethods,
                handler: routeHandler,
                pathMatcher: pathMatcher,
                methodValidator: methodValidator,
                middleware: middlewareConfig,
                security: securityConfig,
                controller: controllerIntegration
            };

            // If application has route registration method, use it
            if (application.registerRoute && typeof application.registerRoute === 'function') {
                await application.registerRoute(routeRegistration);
            } else if (application.use && typeof application.use === 'function') {
                // Express-style middleware registration
                application.use(this.routePath, routeHandler);
            } else {
                // Store route configuration for manual integration
                if (!application.routes) {
                    application.routes = new Map();
                }
                application.routes.set(this.routePath, routeRegistration);
            }

            const configurationTime = Date.now() - startTime;

            // Step 9: Log route configuration completion with handler details and status information
            this.logger.info('Hello route configuration completed', {
                routePath: this.routePath,
                handlerRegistered: true,
                middlewareConfigured: true,
                securityConfigured: true,
                controllerIntegrated: true,
                configurationTime: configurationTime,
                registrationType: application.registerRoute ? 'framework' : 'manual'
            });

            // Step 10: Return route configuration result with success status and handler information
            return {
                success: true,
                routePath: this.routePath,
                allowedMethods: this.allowedMethods,
                handlerConfigured: true,
                middlewareIntegrated: true,
                securityEnabled: this.validationConfig.enableSecurityValidation,
                controllerIntegrated: true,
                configurationTime: configurationTime,
                registrationDetails: routeRegistration,
                metadata: {
                    timestamp: new Date().toISOString(),
                    routeVersion: HELLO_ROUTE_METADATA.version,
                    configurationType: 'complete'
                }
            };

        } catch (error) {
            this.logger.error('Hello route configuration failed', {
                routePath: this.routePath,
                error: error.message,
                applicationProvided: !!application
            }, error);

            return {
                success: false,
                routePath: this.routePath,
                error: error.message,
                handlerConfigured: false,
                configurationFailed: true,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Main request handler for hello endpoint that processes GET /hello requests
     * with validation, controller delegation, and response generation.
     * Implements comprehensive request processing with performance monitoring.
     * 
     * @param {Object} request - HTTP request object for processing
     * @param {Object} response - HTTP response object for result generation
     * @param {Object} context - Additional request context and metadata
     * @returns {void} Processes hello endpoint request and sends appropriate response to client
     */
    async handleRequest(request, response, context = {}) {
        // Step 1: Generate unique request correlation ID for hello request tracking
        const requestId = generateRouteId(request.method, request.url);
        
        // Step 2: Start performance measurement for hello route request processing
        const processingStartTime = Date.now();
        
        try {
            this.logger.info('Processing hello route request', {
                requestId: requestId,
                method: request.method,
                url: request.url,
                remoteAddress: request.connection?.remoteAddress,
                userAgent: request.headers?.['user-agent']
            });

            // Step 3: Create route context using RouteHandler.createRouteContext with hello metadata
            const routeContext = createRouteContext(request, requestId);
            routeContext.route = {
                path: this.routePath,
                handler: 'HelloRoute',
                controller: 'HelloController',
                metadata: HELLO_ROUTE_METADATA
            };

            // Step 4: Validate hello route request using validateHelloRouteRequest function
            if (this.validationConfig.enableValidation) {
                const validation = validateHelloRouteRequest(request, routeContext);
                
                if (!validation.isValid) {
                    // Step 5: Handle validation errors by delegating to RouteHandler.handleRouteError
                    const validationError = createRouteError(
                        'BAD_REQUEST',
                        `Hello route validation failed: ${validation.errors.join(', ')}`,
                        routeContext
                    );

                    this.logger.warn('Hello route validation failed', {
                        requestId: requestId,
                        errors: validation.errors,
                        warnings: validation.warnings,
                        securityViolations: validation.securityAssessment.violations
                    });

                    await this.routeHandler.handleRouteError(validationError, request, response, routeContext);
                    return;
                }

                this.logger.debug('Hello route validation passed', {
                    requestId: requestId,
                    validationId: validation.validationId,
                    authorized: validation.authorized
                });
            }

            // Step 6: Delegate validated request to HelloController.processRequest for business logic
            const controllerContext = {
                ...context,
                routeContext: routeContext,
                requestId: requestId,
                routeConfig: this.routeConfig
            };

            const controllerResult = await this.helloController.processRequest(request, controllerContext);

            // Step 7: Handle controller processing results and response generation coordination
            if (!controllerResult.success) {
                throw new Error(controllerResult.error || 'Controller processing failed');
            }

            // Generate successful response
            response.statusCode = 200;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.setHeader('X-Content-Type-Options', 'nosniff');
            response.setHeader('Date', new Date().toUTCString());
            response.end(controllerResult.data.message || RESPONSE_MESSAGES.HELLO_WORLD);

            const processingTime = Date.now() - processingStartTime;

            // Update metrics
            this._updateRouteMetrics(requestId, processingTime, true);

            // Step 8: Log hello route request completion with performance metrics and status
            this.logger.info('Hello route request completed successfully', {
                requestId: requestId,
                statusCode: 200,
                processingTime: processingTime,
                controllerSuccess: true,
                responseGenerated: true
            });

            // Step 9: Update hello route metrics including request count and response time
            logHelloRouteOperation('request_completed', {
                requestId: requestId,
                processingTime: processingTime,
                statusCode: 200,
                controllerResult: controllerResult
            }, 'info');

        } catch (error) {
            const processingTime = Date.now() - processingStartTime;
            
            this.logger.error('Hello route request processing failed', {
                requestId: requestId,
                error: error.message,
                processingTime: processingTime
            }, error);

            // Handle error response
            const routeContext = createRouteContext(request, requestId);
            const routeError = createRouteError('INTERNAL_ERROR', error.message, routeContext);
            
            await this.routeHandler.handleRouteError(routeError, request, response, routeContext);

            // Update error metrics
            this._updateRouteMetrics(requestId, processingTime, false);

            logHelloRouteOperation('request_error', {
                requestId: requestId,
                error: error.message,
                processingTime: processingTime
            }, 'error');
        }
    }

    /**
     * Validates incoming HTTP requests for hello endpoint with hello-specific
     * validation rules and authorization checking. Provides comprehensive
     * request validation with security assessment.
     * 
     * @param {Object} request - HTTP request object for validation
     * @param {Object} validationContext - Validation context and configuration
     * @returns {Object} Hello route specific validation result with authorization status and error details
     */
    async validateRouteRequest(request, validationContext = {}) {
        try {
            // Create route context for validation
            const requestId = generateRouteId(request.method, request.url);
            const routeContext = createRouteContext(request, requestId);

            // Step 1: Use validateHelloRouteRequest function for hello endpoint specific validation
            const validation = validateHelloRouteRequest(request, routeContext);

            // Step 2: Validate HTTP method using isMethodAllowedForEndpoint with /hello endpoint
            const methodAuthorization = validateMethodAuthorization(request.method, this.routePath, {
                strictValidation: this.validationConfig.strictMode,
                includeSecurityDetails: true
            });

            // Step 3: Perform route path validation against exact '/hello' pattern matching
            const normalizedPath = normalizeRoutePath(request.url);
            const pathValid = normalizedPath === this.routePath;

            // Step 4: Apply hello route security validation using RouteHandler validation utilities
            const securityValidation = this.routeHandler.validateRouteAccess(
                request.method, 
                normalizedPath,
                {
                    strictMode: this.validationConfig.strictMode,
                    enableSecurity: this.validationConfig.enableSecurityValidation
                }
            );

            // Step 5: Check request authorization against hello endpoint access control rules
            const authorized = validation.authorized && 
                             methodAuthorization.allowed && 
                             pathValid && 
                             securityValidation.isValid;

            // Step 6: Compile comprehensive validation results with success status and error information
            const validationResult = {
                isValid: validation.isValid && authorized,
                authorized: authorized,
                method: request.method,
                path: normalizedPath,
                validationDetails: {
                    routeValidation: validation,
                    methodAuthorization: methodAuthorization,
                    pathValidation: { valid: pathValid, expectedPath: this.routePath },
                    securityValidation: securityValidation
                },
                errors: [
                    ...validation.errors,
                    ...(methodAuthorization.errors || []),
                    ...(pathValid ? [] : [`Invalid path: ${normalizedPath}`]),
                    ...(securityValidation.errors || [])
                ],
                warnings: validation.warnings || [],
                metadata: {
                    validationId: `hello_route_val_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    requestId: requestId
                }
            };

            // Step 7: Log validation outcomes and security assessment for monitoring purposes
            this.logger.debug('Hello route validation completed', {
                requestId: requestId,
                isValid: validationResult.isValid,
                authorized: validationResult.authorized,
                errorCount: validationResult.errors.length,
                warningCount: validationResult.warnings.length
            });

            // Step 8: Return hello route validation result with authorization and security status
            return validationResult;

        } catch (error) {
            this.logger.error('Hello route validation failed', {
                error: error.message,
                method: request?.method,
                url: request?.url
            }, error);

            return {
                isValid: false,
                authorized: false,
                method: request?.method || 'unknown',
                path: request?.url || 'unknown',
                errors: [`Validation error: ${error.message}`],
                warnings: [],
                validationDetails: {},
                metadata: {
                    validationFailed: true,
                    timestamp: new Date().toISOString(),
                    errorType: 'validation_exception'
                }
            };
        }
    }

    /**
     * Returns comprehensive hello route configuration including path, methods,
     * controller, and operational settings for monitoring and debugging.
     * Provides complete route configuration information.
     * 
     * @returns {Object} Hello route configuration with metadata, settings, and operational status
     */
    getRouteConfiguration() {
        try {
            // Step 1: Compile hello route configuration with path, methods, and controller information
            const routeConfiguration = {
                route: {
                    path: this.routePath,
                    methods: [...this.allowedMethods],
                    controller: this.routeConfig.controller,
                    handlerType: 'HelloRoute'
                },
                
                // Step 2: Include hello route metadata from HELLO_ROUTE_METADATA global configuration
                metadata: {
                    ...HELLO_ROUTE_METADATA,
                    initializationTime: this.initializationTime,
                    configurationHash: this._generateConfigHash()
                },

                // Step 3: Add hello controller integration status and hello service health information
                controller: {
                    integrated: !!this.helloController,
                    type: 'HelloController',
                    healthy: this.helloController ? await this._checkControllerHealth() : false
                },

                // Step 4: Include hello route performance metrics and operational statistics
                performance: this.getRouteMetrics(),

                // Step 5: Add hello route security settings and validation configuration details
                security: {
                    validationEnabled: this.validationConfig.enableValidation,
                    securityValidationEnabled: this.validationConfig.enableSecurityValidation,
                    strictMode: this.validationConfig.strictMode,
                    methodValidation: this.validationConfig.enableMethodValidation,
                    pathValidation: this.validationConfig.enablePathValidation
                },

                // Step 6: Include hello route initialization status and readiness indicators
                status: {
                    initialized: this.initialized,
                    readyForRequests: this.readyForRequests,
                    healthy: this.isRouteHealthy(),
                    uptime: this.initializationTime ? Date.now() - this.initializationTime.getTime() : 0
                },

                // Configuration details
                configuration: {
                    enableLogging: this.routeConfig.enableLogging,
                    enableMetrics: this.routeMetrics.enabled,
                    slowRequestThreshold: this.routeConfig.slowRequestThreshold,
                    errorHandling: this.errorHandling
                }
            };

            // Step 7: Return comprehensive hello route configuration for monitoring and documentation
            return routeConfiguration;

        } catch (error) {
            this.logger.error('Failed to get route configuration', { error: error.message }, error);
            
            return {
                route: {
                    path: this.routePath || '/hello',
                    methods: this.allowedMethods || ['GET'],
                    controller: 'HelloController',
                    handlerType: 'HelloRoute'
                },
                error: 'Failed to retrieve complete configuration',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Retrieves hello route specific performance metrics including request counts,
     * response times, and success rates for monitoring.
     * 
     * @returns {Object} Hello route performance metrics with request statistics and performance indicators
     */
    getRouteMetrics() {
        try {
            const currentTime = Date.now();
            const uptime = this.initializationTime ? currentTime - this.initializationTime.getTime() : 0;

            // Step 1: Compile hello route request and response metrics including count and timing
            const requestMetrics = {
                totalRequests: this.routeMetrics.totalRequests,
                successfulRequests: this.routeMetrics.successfulRequests,
                errorCount: this.routeMetrics.errorCount,
                validationErrors: this.routeMetrics.validationErrors,
                methodNotAllowedCount: this.routeMetrics.methodNotAllowedCount
            };

            // Step 2: Calculate hello route success rate and error rate percentages
            const successRate = this.routeMetrics.totalRequests > 0 ? 
                ((this.routeMetrics.successfulRequests / this.routeMetrics.totalRequests) * 100).toFixed(2) : 0;
            const errorRate = this.routeMetrics.totalRequests > 0 ? 
                ((this.routeMetrics.errorCount / this.routeMetrics.totalRequests) * 100).toFixed(2) : 0;

            // Step 3: Include average response time for hello endpoint requests and trends
            const performanceMetrics = {
                averageResponseTime: this.routeMetrics.averageResponseTime,
                minimumResponseTime: this.routeMetrics.minimumResponseTime === Number.MAX_SAFE_INTEGER ? 
                    0 : this.routeMetrics.minimumResponseTime,
                maximumResponseTime: this.routeMetrics.maximumResponseTime,
                slowRequestCount: this.routeMetrics.slowRequestCount,
                slowRequestRate: this.routeMetrics.totalRequests > 0 ?
                    ((this.routeMetrics.slowRequestCount / this.routeMetrics.totalRequests) * 100).toFixed(2) : 0
            };

            // Step 4: Add hello route controller delegation metrics and processing statistics
            const controllerMetrics = {
                controllerSuccessCount: this.routeMetrics.controllerSuccessCount,
                controllerErrorCount: this.routeMetrics.controllerErrorCount,
                controllerProcessingTime: this.routeMetrics.controllerProcessingTime,
                delegationSuccessRate: this.routeMetrics.totalRequests > 0 ?
                    ((this.routeMetrics.controllerSuccessCount / this.routeMetrics.totalRequests) * 100).toFixed(2) : 0
            };

            // Step 5: Include hello route validation metrics and security assessment data
            const validationMetrics = {
                validationErrors: this.routeMetrics.validationErrors,
                securityViolations: this.routeMetrics.securityViolations,
                validationSuccessRate: this.routeMetrics.totalRequests > 0 ?
                    (((this.routeMetrics.totalRequests - this.routeMetrics.validationErrors) / this.routeMetrics.totalRequests) * 100).toFixed(2) : 0
            };

            // Calculate requests per second
            const requestsPerSecond = uptime > 0 ? 
                ((this.routeMetrics.totalRequests / uptime) * 1000).toFixed(2) : 0;

            // Step 6: Return comprehensive hello route performance metrics for monitoring and optimization
            return {
                summary: {
                    totalRequests: requestMetrics.totalRequests,
                    successRate: `${successRate}%`,
                    errorRate: `${errorRate}%`,
                    uptime: `${Math.round(uptime / 1000)}s`,
                    requestsPerSecond: parseFloat(requestsPerSecond)
                },
                requests: requestMetrics,
                performance: performanceMetrics,
                controller: controllerMetrics,
                validation: validationMetrics,
                timing: {
                    lastRequestTime: this.routeMetrics.lastRequestTime ? 
                        this.routeMetrics.lastRequestTime.toISOString() : null,
                    uptimeStart: this.routeMetrics.uptimeStart.toISOString(),
                    metricsEnabled: this.routeMetrics.enabled
                },
                operational: {
                    helloRouteHits: this.routeMetrics.helloRouteHits,
                    getRequestCount: this.routeMetrics.getRequestCount,
                    invalidMethodAttempts: this.routeMetrics.invalidMethodAttempts
                }
            };

        } catch (error) {
            this.logger.error('Failed to generate route metrics', { error: error.message }, error);
            
            return {
                error: 'Failed to generate metrics',
                timestamp: new Date().toISOString(),
                summary: {
                    totalRequests: 0,
                    successRate: '0%',
                    errorRate: '0%'
                }
            };
        }
    }

    /**
     * Performs health check for hello route including controller health,
     * configuration validation, and operational status.
     * 
     * @returns {boolean} True if hello route is healthy and operational, false otherwise
     */
    isRouteHealthy() {
        try {
            // Step 1: Check hello route initialization status and configuration completeness
            if (!this.initialized || !this.readyForRequests) {
                return false;
            }

            // Step 2: Validate HelloController health using controller health check methods
            if (!this.helloController) {
                return false;
            }

            // Check if controller has health check method and use it
            const controllerHealthy = this.helloController.isHealthy ? 
                this.helloController.isHealthy() : true;

            if (!controllerHealthy) {
                return false;
            }

            // Step 3: Check hello route configuration and endpoint settings for operational readiness
            if (!this.routePath || !this.allowedMethods || this.allowedMethods.length === 0) {
                return false;
            }

            // Step 4: Validate hello route dependencies including response utilities and constants
            if (!HELLO_ROUTE_CONFIG || !HELLO_ROUTE_METADATA || !RESPONSE_MESSAGES) {
                return false;
            }

            // Step 5: Check hello route metrics and error rates against health thresholds
            if (this.routeMetrics.enabled) {
                const errorRate = this.routeMetrics.totalRequests > 0 ?
                    (this.routeMetrics.errorCount / this.routeMetrics.totalRequests) : 0;

                // Consider route unhealthy if error rate exceeds 50%
                if (errorRate > 0.5) {
                    return false;
                }
            }

            // Step 6: Verify hello route response time performance against targets and SLAs
            if (this.routeMetrics.averageResponseTime > 1000) { // 1 second threshold
                return false;
            }

            // Step 7: Return overall hello route health status based on all validation checks
            return true;

        } catch (error) {
            this.logger.error('Hello route health check failed', { error: error.message }, error);
            return false;
        }
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Initializes fallback configuration when normal initialization fails.
     * @private
     */
    _initializeFallbackConfiguration() {
        this.routePath = '/hello';
        this.allowedMethods = ['GET'];
        this.routeConfig = { ...HELLO_ROUTE_CONFIG };
        this.initialized = false;
        this.readyForRequests = false;
        this.initializationTime = new Date();
        this.routeMetrics = { ...HELLO_ROUTE_METRICS, enabled: false };
        this.validationConfig = {
            enableValidation: true,
            enableSecurityValidation: false,
            strictMode: false
        };
        this.errorHandling = {
            includeStackTrace: false,
            sanitizeErrorMessages: true,
            enableDetailedErrorLogging: false
        };
        
        // Initialize basic logger fallback
        this.logger = {
            info: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            debug: console.log.bind(console)
        };
    }

    /**
     * Updates route metrics with request processing results.
     * @private
     */
    _updateRouteMetrics(requestId, processingTime, success) {
        if (!this.routeMetrics.enabled) {
            return;
        }

        this.routeMetrics.totalRequests++;
        this.routeMetrics.lastRequestTime = new Date();

        if (success) {
            this.routeMetrics.successfulRequests++;
            this.routeMetrics.helloRouteHits++;
            this.routeMetrics.getRequestCount++;
            this.routeMetrics.controllerSuccessCount++;
        } else {
            this.routeMetrics.errorCount++;
            this.routeMetrics.controllerErrorCount++;
        }

        // Update timing statistics
        if (processingTime !== undefined) {
            this.routeMetrics.averageResponseTime = 
                ((this.routeMetrics.averageResponseTime * (this.routeMetrics.totalRequests - 1)) + processingTime) / 
                this.routeMetrics.totalRequests;

            this.routeMetrics.minimumResponseTime = Math.min(this.routeMetrics.minimumResponseTime, processingTime);
            this.routeMetrics.maximumResponseTime = Math.max(this.routeMetrics.maximumResponseTime, processingTime);

            if (processingTime > this.routeConfig.slowRequestThreshold) {
                this.routeMetrics.slowRequestCount++;
            }
        }
    }

    /**
     * Generates configuration hash for change detection.
     * @private
     */
    _generateConfigHash() {
        try {
            const configString = JSON.stringify({
                path: this.routePath,
                methods: this.allowedMethods,
                validation: this.validationConfig,
                error: this.errorHandling
            });
            
            // Simple hash function for configuration changes
            let hash = 0;
            for (let i = 0; i < configString.length; i++) {
                const char = configString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return hash.toString(16);
        } catch (error) {
            return 'hash_error';
        }
    }

    /**
     * Checks controller health status.
     * @private
     */
    async _checkControllerHealth() {
        try {
            if (!this.helloController) {
                return false;
            }

            // If controller has health check method, use it
            if (this.helloController.isHealthy && typeof this.helloController.isHealthy === 'function') {
                return this.helloController.isHealthy();
            }

            // Otherwise assume healthy if controller exists
            return true;
        } catch (error) {
            return false;
        }
    }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Factory function for creating HelloRoute instances with default configuration
 * and proper initialization. Provides simplified route creation with error handling.
 * 
 * @param {Object} [config={}] - Route configuration options
 * @returns {HelloRoute} Configured HelloRoute instance ready for use
 * 
 * @example
 * const helloRoute = createHelloRoute({ enableLogging: true, strictMode: true });
 */
function createHelloRoute(config = {}) {
    try {
        logger.info('Creating HelloRoute instance', {
            configProvided: Object.keys(config).length > 0,
            strictMode: config.strictMode,
            enableLogging: config.enableLogging
        });

        const helloRoute = new HelloRoute(config);

        if (helloRoute.isRouteHealthy()) {
            logger.info('HelloRoute created successfully', {
                routePath: helloRoute.routePath,
                allowedMethods: helloRoute.allowedMethods,
                initialized: helloRoute.initialized
            });
        } else {
            logger.warn('HelloRoute created but health check failed', {
                routePath: helloRoute.routePath,
                initialized: helloRoute.initialized
            });
        }

        return helloRoute;

    } catch (error) {
        logger.error('Failed to create HelloRoute', {
            error: error.message,
            config: config
        }, error);

        // Return minimal working instance
        return new HelloRoute();
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
    // Main route class export
    HelloRoute,

    // Factory functions for route creation
    createHelloRoute,

    // Utility functions for route processing
    validateHelloRouteRequest,
    createHelloRouteHandler,
    logHelloRouteOperation,

    // Route configuration constants
    HELLO_ROUTE_CONFIG,
    HELLO_ROUTE_METADATA,
    DEFAULT_HELLO_ROUTE_CONFIG,
    HELLO_ROUTE_METRICS
};