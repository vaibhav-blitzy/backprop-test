/**
 * Core HTTP Route Handling Module for Node.js Tutorial Application
 * 
 * This module implements the central routing engine that processes incoming HTTP requests
 * through URL pattern matching, request routing, and endpoint resolution. Serves as the
 * primary routing infrastructure for the Node.js tutorial application, demonstrating
 * production-ready routing patterns while maintaining educational clarity for fundamental
 * HTTP routing concepts including route validation, endpoint matching, and request delegation.
 * 
 * The RouteHandler class orchestrates comprehensive request processing through:
 * - URL pattern matching and endpoint resolution
 * - HTTP method validation and authorization checking
 * - Security validation and injection prevention
 * - Request delegation to appropriate controllers
 * - Error handling and standardized response generation
 * - Performance monitoring and routing metrics collection
 * - Educational patterns demonstrating enterprise routing practices
 * 
 * Key Features:
 * - Production-ready routing with comprehensive error handling
 * - Security-focused validation with injection prevention
 * - Educational clarity for learning HTTP routing fundamentals
 * - Integration with tutorial application's controller architecture
 * - Comprehensive logging and performance monitoring
 * - Standardized error responses and status code management
 * 
 * Educational Objectives:
 * - Demonstrates enterprise-grade HTTP routing implementation patterns
 * - Shows proper request validation and security checking techniques
 * - Illustrates effective error handling and response generation
 * - Provides examples of performance monitoring and metrics collection
 * - Shows integration patterns between routing and application architecture
 * - Demonstrates proper separation of concerns in routing logic
 * 
 * @fileoverview Core HTTP route handling module with comprehensive routing capabilities
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import Node.js built-in modules for URL parsing and HTTP handling
const { URL } = require('url'); // Node.js v20.x - Built-in URL parsing for route path extraction

// Import core HTTP response handling for route processing results
const { ResponseHandler } = require('./response-handler.js'); // v1.0.0

// Import Hello endpoint controller for /hello route processing
const { HelloController } = require('../controllers/hello.controller.js'); // v1.0.0

// Import HTTP method constants and validation utilities
const { 
    HTTP_METHODS,
    HELLO_ENDPOINT_METHODS,
    isMethodAllowedForEndpoint,
    getAllowedMethodsForEndpoint
} = require('../constants/http-methods.js'); // v1.0.0

// Import HTTP status code constants and validation functions
const { 
    HTTP_STATUS_CODES,
    isClientError
} = require('../utils/http-status.js'); // v1.0.0

// Import URL path validation and security checking utilities
const { validateUrlPath } = require('../utils/validation.js'); // v1.0.0

// Import standardized error message constants
const { 
    ERROR_MESSAGES
} = require('../constants/error-messages.js'); // v1.0.0

// Import response message constants for successful operations
const { 
    RESPONSE_MESSAGES
} = require('../constants/response-messages.js'); // v1.0.0

// Import structured logging for route processing operations
const { Logger } = require('../utils/logger.js'); // v1.0.0

// ============================================================================
// GLOBAL ROUTE CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Primary hello route pattern for exact URL matching and validation.
 * Used throughout the routing system for consistent route identification.
 */
const HELLO_ROUTE_PATTERN = '/hello';

/**
 * Default route configuration settings including timeout and security options.
 * Provides baseline configuration for route processing behavior and limits.
 */
const DEFAULT_ROUTE_CONFIG = {
    // Request processing timeouts and limits
    requestTimeout: 30000, // 30 seconds
    maxRequestSize: 1048576, // 1MB
    
    // Security validation settings
    enableSecurityValidation: true,
    enableInjectionPrevention: true,
    enablePathTraversalCheck: true,
    
    // Performance monitoring settings
    enableMetrics: true,
    enablePerformanceLogging: true,
    slowRequestThreshold: 1000, // 1 second
    
    // Error handling configuration
    includeStackTrace: false,
    sanitizeErrorMessages: true,
    enableDetailedErrorLogging: true
};

/**
 * Route matching performance and statistics tracking object.
 * Collects metrics for route processing optimization and monitoring.
 */
const ROUTE_MATCHING_METRICS = {
    totalRequests: 0,
    successfulMatches: 0,
    notFoundCount: 0,
    methodNotAllowedCount: 0,
    errorCount: 0,
    averageProcessingTime: 0,
    slowRequestCount: 0,
    lastResetTime: new Date(),
    
    // Route-specific statistics
    helloRouteHits: 0,
    rootRouteHits: 0,
    invalidRouteAttempts: 0,
    
    // Security metrics
    securityViolations: 0,
    injectionAttempts: 0,
    pathTraversalAttempts: 0
};

/**
 * Array of route patterns supported by the tutorial application.
 * Used for validation, matching, and error handling throughout the routing system.
 */
const SUPPORTED_ROUTE_PATTERNS = [
    HELLO_ROUTE_PATTERN,
    '/' // Root route for basic application information
];

// ============================================================================
// ROUTE UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a unique route identifier for route tracking and logging purposes
 * across the routing pipeline. Creates correlation IDs for request tracking
 * and performance monitoring throughout the application lifecycle.
 * 
 * @param {string} method - HTTP method for route identification
 * @param {string} path - URL path for route identification  
 * @returns {string} Unique route identifier for tracking and correlation purposes
 */
function generateRouteId(method, path) {
    try {
        // Normalize method to uppercase for consistent identification
        const normalizedMethod = (method || 'UNKNOWN').toString().trim().toUpperCase();
        
        // Sanitize path parameter and remove query strings for clean identification
        const sanitizedPath = (path || '/').toString().trim().split('?')[0].split('#')[0];
        
        // Generate unique identifier combining method, path, and timestamp
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 6);
        
        // Format route ID with consistent pattern for logging and tracking
        const routeId = `route_${normalizedMethod}_${sanitizedPath.replace(/\//g, '_')}_${timestamp}_${randomSuffix}`;
        
        // Return unique route identifier string for correlation and monitoring
        return routeId;
        
    } catch (error) {
        // Fallback route ID generation if primary method fails
        return `route_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
}

/**
 * Creates comprehensive route processing context with metadata, timing, and
 * correlation information for request routing lifecycle management. Provides
 * complete contextual information for debugging, monitoring, and performance analysis.
 * 
 * @param {Object} request - HTTP request object for context extraction
 * @param {string} routeId - Unique route identifier for correlation
 * @returns {Object} Route context object with metadata, timing, and routing information
 */
function createRouteContext(request, routeId) {
    try {
        // Create route context object with route ID and processing timestamp
        const routeContext = {
            routeId: routeId,
            timestamp: new Date().toISOString(),
            processingStartTime: Date.now()
        };
        
        // Extract route-specific information from request including method and path
        if (request && typeof request === 'object') {
            routeContext.request = {
                method: request.method || 'UNKNOWN',
                url: request.url || '/',
                httpVersion: request.httpVersion || '1.1',
                remoteAddress: request.connection?.remoteAddress || 'unknown',
                userAgent: request.headers?.['user-agent'] || 'unknown'
            };
            
            // Extract URL components for detailed routing analysis
            try {
                const urlObj = new URL(request.url || '/', 'http://localhost');
                routeContext.urlComponents = {
                    pathname: urlObj.pathname,
                    search: urlObj.search,
                    hash: urlObj.hash,
                    origin: urlObj.origin
                };
            } catch (urlError) {
                routeContext.urlComponents = {
                    pathname: request.url || '/',
                    parseError: true
                };
            }
        }
        
        // Initialize routing performance timing measurements for monitoring
        routeContext.performance = {
            startTime: Date.now(),
            endTime: null,
            duration: null,
            isSlowRequest: false
        };
        
        // Add route matching metadata and endpoint classification information
        routeContext.routing = {
            matched: false,
            endpoint: null,
            methodAllowed: false,
            securityPassed: false,
            handlerCalled: false
        };
        
        // Include security context and validation status tracking for route processing
        routeContext.security = {
            validated: false,
            threatLevel: 'none',
            injectionAttempt: false,
            pathTraversalAttempt: false,
            securityViolations: []
        };
        
        // Return comprehensive route context for routing pipeline and logging
        return routeContext;
        
    } catch (error) {
        // Return minimal context if creation fails
        return {
            routeId: routeId || `fallback_${Date.now()}`,
            timestamp: new Date().toISOString(),
            error: 'Context creation failed',
            errorMessage: error.message
        };
    }
}

/**
 * Normalizes URL paths for consistent route matching by removing query parameters,
 * fragments, and trailing slashes. Implements URL standardization for reliable
 * route pattern matching and security validation.
 * 
 * @param {string} path - URL path to normalize for route matching
 * @returns {string} Normalized path for consistent route matching and security validation
 */
function normalizeRoutePath(path) {
    try {
        // Validate path input and convert to string
        let normalizedPath = (path || '/').toString().trim();
        
        // Remove query parameters and URL fragments from path
        normalizedPath = normalizedPath.split('?')[0].split('#')[0];
        
        // Decode URL encoding to prevent encoding-based bypass attacks
        try {
            normalizedPath = decodeURIComponent(normalizedPath);
        } catch (decodeError) {
            // Keep original path if decoding fails
        }
        
        // Remove trailing slashes for consistent path matching (except root)
        if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }
        
        // Ensure path starts with forward slash
        if (!normalizedPath.startsWith('/')) {
            normalizedPath = '/' + normalizedPath;
        }
        
        // Validate path format and check for malicious patterns
        const pathValidation = validateUrlPath(normalizedPath, {
            strictMode: true,
            sanitize: true
        });
        
        if (!pathValidation.isValid) {
            // Return root path if validation fails
            return '/';
        }
        
        // Return normalized path ready for route pattern matching
        return pathValidation.sanitizedPath || normalizedPath;
        
    } catch (error) {
        // Return safe fallback path if normalization fails
        return '/';
    }
}

/**
 * Creates standardized route processing error objects with context information
 * and appropriate HTTP status codes for consistent error handling. Implements
 * comprehensive error object creation for route processing failures.
 * 
 * @param {string} errorType - Type of route error for classification
 * @param {string} message - Error message for client communication
 * @param {Object} routeContext - Route processing context for debugging
 * @returns {Object} Standardized route error with type, message, context, and HTTP status code
 */
function createRouteError(errorType, message, routeContext) {
    try {
        // Determine appropriate HTTP status code based on route error type classification
        let statusCode;
        let category;
        
        switch (errorType) {
            case 'NOT_FOUND':
                statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;
                category = 'client_error';
                break;
            case 'METHOD_NOT_ALLOWED':
                statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;
                category = 'client_error';
                break;
            case 'BAD_REQUEST':
                statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
                category = 'client_error';
                break;
            case 'INTERNAL_ERROR':
                statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
                category = 'server_error';
                break;
            default:
                statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
                category = 'unknown_error';
        }
        
        // Get standard error message from ERROR_MESSAGES constants for consistency
        const standardMessage = message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
        
        // Create error object with standardized structure and routing properties
        const routeError = {
            type: errorType,
            message: standardMessage,
            statusCode: statusCode,
            category: category,
            timestamp: new Date().toISOString(),
            isRouteError: true
        };
        
        // Add route processing context and correlation ID for debugging and tracking
        if (routeContext && typeof routeContext === 'object') {
            routeError.context = {
                routeId: routeContext.routeId,
                requestMethod: routeContext.request?.method,
                requestUrl: routeContext.request?.url,
                processingTime: routeContext.performance?.duration
            };
            
            // Include security context if available
            if (routeContext.security) {
                routeError.security = {
                    threatLevel: routeContext.security.threatLevel,
                    violations: routeContext.security.securityViolations
                };
            }
        }
        
        // Include timestamp and error severity level for monitoring and alerting
        routeError.severity = isClientError(statusCode) ? 'warning' : 'error';
        routeError.correlationId = routeContext?.routeId || `error_${Date.now()}`;
        
        // Return standardized route processing error object for error handling
        return routeError;
        
    } catch (error) {
        // Return minimal error object if creation fails
        return {
            type: 'INTERNAL_ERROR',
            message: 'Route error creation failed',
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            category: 'system_error',
            timestamp: new Date().toISOString(),
            originalError: error.message
        };
    }
}

// ============================================================================
// MAIN ROUTE HANDLER CLASS
// ============================================================================

/**
 * Core HTTP route handler class that orchestrates request routing through URL pattern
 * matching, endpoint resolution, and handler delegation. Implements the primary routing
 * engine for the Node.js tutorial application with educational clarity and production-ready
 * patterns. Processes incoming HTTP requests through comprehensive route validation, pattern
 * matching, and security assessment before delegating to appropriate controllers and handlers.
 * 
 * The RouteHandler class provides:
 * - Comprehensive URL pattern matching and endpoint resolution
 * - HTTP method validation and endpoint-specific authorization
 * - Security validation with injection prevention and path traversal detection
 * - Request delegation to appropriate controllers with error handling
 * - Performance monitoring and routing metrics collection
 * - Educational patterns demonstrating enterprise routing practices
 * - Integration with tutorial application's architecture and components
 */
class RouteHandler {
    /**
     * Initializes the route handler with comprehensive configuration, component setup,
     * and routing pipeline configuration for HTTP request routing. Sets up all required
     * dependencies and prepares the routing engine for request processing.
     * 
     * @param {Object} config - Configuration object for route handler initialization
     */
    constructor(config = {}) {
        try {
            // Validate and merge configuration with default route handling settings
            this.config = {
                ...DEFAULT_ROUTE_CONFIG,
                ...config
            };
            
            // Initialize response handler for route response generation and formatting
            this.responseHandler = new ResponseHandler(this.config.responseConfig || {});
            
            // Configure hello controller for /hello endpoint request processing  
            this.helloController = new HelloController(this.config.helloConfig || {});
            
            // Initialize structured logger for route processing operations and correlation tracking
            this.logger = new Logger({
                logLevel: this.config.logLevel || 'INFO',
                enableColors: this.config.enableColors !== false,
                includeTimestamp: true
            });
            
            // Set up routing metrics collection and performance monitoring
            this.routingMetrics = {
                ...ROUTE_MATCHING_METRICS,
                enabled: this.config.enableMetrics !== false
            };
            
            // Configure supported routes registry with hello endpoint and error handling patterns
            this.supportedRoutes = new Set(SUPPORTED_ROUTE_PATTERNS);
            
            // Set up strict mode for enhanced security validation and error reporting
            this.strictMode = this.config.strictMode !== false;
            
            // Initialize error handling and route processing result formatting
            this.errorHandling = {
                includeStackTrace: this.config.includeStackTrace === true,
                sanitizeErrors: this.config.sanitizeErrorMessages !== false,
                enableDetailedLogging: this.config.enableDetailedErrorLogging !== false
            };
            
            // Configure security validation settings
            this.securityConfig = {
                enableValidation: this.config.enableSecurityValidation !== false,
                enableInjectionPrevention: this.config.enableInjectionPrevention !== false,
                enablePathTraversalCheck: this.config.enablePathTraversalCheck !== false
            };
            
            // Log successful initialization
            this.logger.info('RouteHandler initialized successfully', {
                supportedRoutes: Array.from(this.supportedRoutes),
                strictMode: this.strictMode,
                securityEnabled: this.securityConfig.enableValidation
            });
            
        } catch (error) {
            // Initialize fallback configuration if setup fails
            this._initializeFallbackConfiguration();
            console.error('RouteHandler initialization failed:', error.message);
        }
    }
    
    /**
     * Main routing method that handles complete HTTP request routing pipeline including
     * URL pattern matching, method validation, endpoint resolution, and handler delegation.
     * Orchestrates the entire request routing process with comprehensive error handling.
     * 
     * @param {Object} request - HTTP request object for routing
     * @param {Object} response - HTTP response object for result generation
     * @param {Object} routingOptions - Additional routing configuration options
     * @returns {Object} Complete routing result with handler delegation, response generation, and processing context
     */
    async route(request, response, routingOptions = {}) {
        // Generate unique route ID for request tracking and correlation across routing pipeline
        const routeId = generateRouteId(request.method, request.url);
        
        // Create comprehensive route processing context with metadata and performance timing
        const routeContext = createRouteContext(request, routeId);
        
        // Initialize routing result object for comprehensive response tracking
        let routingResult = {
            success: false,
            statusCode: null,
            handled: false,
            routeId: routeId,
            processingTime: null,
            error: null
        };
        
        try {
            // Log incoming route request details with method, URL, and client information
            this.logger.info('Processing route request', {
                routeId: routeId,
                method: request.method,
                url: request.url,
                userAgent: request.headers?.['user-agent'],
                remoteAddress: request.connection?.remoteAddress
            });
            
            // Start route processing performance measurement and timing for monitoring
            const processingStartTime = Date.now();
            
            // Validate and preprocess request using basic validation with security checks
            if (!this._validateRequestStructure(request)) {
                const error = createRouteError('BAD_REQUEST', ERROR_MESSAGES.INVALID_REQUEST_FORMAT, routeContext);
                return await this._handleError(error, request, response, routeContext);
            }
            
            // Normalize URL path using normalizeRoutePath for consistent pattern matching
            const normalizedPath = normalizeRoutePath(request.url);
            routeContext.routing.normalizedPath = normalizedPath;
            
            // Perform route pattern matching using matchRoute to determine endpoint resolution
            const matchResult = this.matchRoute(request.method, normalizedPath);
            routeContext.routing.matchResult = matchResult;
            
            // Validate HTTP method authorization against endpoint-specific allowed methods
            if (!matchResult.matched) {
                // Handle route not found scenario
                routingResult = await this.handleNotFoundRoute(request, response, routeContext);
            } else if (!matchResult.methodAllowed) {
                // Handle method not allowed scenario
                routingResult = await this.handleMethodNotAllowed(request, response, matchResult.endpoint);
            } else {
                // Apply endpoint-specific security validation and access control checking
                const securityValidation = this.validateRouteAccess(request.method, normalizedPath, {
                    strictMode: this.strictMode,
                    enableSecurity: this.securityConfig.enableValidation
                });
                
                routeContext.security = securityValidation.security;
                
                if (!securityValidation.isValid) {
                    const securityError = createRouteError('BAD_REQUEST', 'Security validation failed', routeContext);
                    routingResult = await this._handleError(securityError, request, response, routeContext);
                } else {
                    // Delegate request to appropriate controller or handler based on route matching results
                    if (matchResult.endpoint === HELLO_ROUTE_PATTERN) {
                        routingResult = await this.handleHelloRoute(request, response, routeContext);
                    } else {
                        // Handle other supported routes (e.g., root route)
                        routingResult = await this._handleGenericRoute(request, response, routeContext, matchResult);
                    }
                }
            }
            
            // Calculate processing time and update performance metrics
            const processingTime = Date.now() - processingStartTime;
            routeContext.performance.duration = processingTime;
            routeContext.performance.endTime = Date.now();
            routeContext.performance.isSlowRequest = processingTime > this.config.slowRequestThreshold;
            
            routingResult.processingTime = processingTime;
            
            // Update routing metrics with processing results
            this._updateRoutingMetrics(routeContext, routingResult);
            
            // Log route processing completion with performance metrics and delegation status
            this.logger.info('Route processing completed', {
                routeId: routeId,
                success: routingResult.success,
                statusCode: routingResult.statusCode,
                processingTime: processingTime,
                endpoint: matchResult.endpoint,
                isSlowRequest: routeContext.performance.isSlowRequest
            });
            
            // Return comprehensive routing result with response data and processing context
            return routingResult;
            
        } catch (error) {
            // Handle unexpected errors in route processing
            const routeError = createRouteError('INTERNAL_ERROR', error.message, routeContext);
            return await this.handleRouteError(routeError, request, response, routeContext);
        }
    }
    
    /**
     * Performs URL pattern matching against supported routes to determine endpoint
     * resolution and handler delegation targets. Implements comprehensive route
     * matching logic with method validation and security checking.
     * 
     * @param {string} method - HTTP method for route matching
     * @param {string} path - URL path for pattern matching
     * @returns {Object} Route matching result with endpoint identification, handler information, and routing metadata
     */
    matchRoute(method, path) {
        try {
            // Normalize request method to uppercase for consistent pattern matching
            const normalizedMethod = (method || 'GET').toString().trim().toUpperCase();
            
            // Validate and normalize URL path using normalizeRoutePath function
            const normalizedPath = normalizeRoutePath(path);
            
            // Initialize route matching result object
            const matchResult = {
                matched: false,
                endpoint: null,
                methodAllowed: false,
                handler: null,
                allowedMethods: [],
                metadata: {
                    normalizedMethod,
                    normalizedPath,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Check for exact match with /hello route pattern for hello endpoint resolution
            if (normalizedPath === HELLO_ROUTE_PATTERN) {
                matchResult.matched = true;
                matchResult.endpoint = HELLO_ROUTE_PATTERN;
                matchResult.handler = 'HelloController';
                
                // Validate method authorization for matched route using isMethodAllowedForEndpoint
                matchResult.methodAllowed = HELLO_ENDPOINT_METHODS.includes(normalizedMethod);
                matchResult.allowedMethods = [...HELLO_ENDPOINT_METHODS];
                
                return matchResult;
            }
            
            // Check for root route pattern matching
            if (normalizedPath === '/') {
                matchResult.matched = true;
                matchResult.endpoint = '/';
                matchResult.handler = 'RootHandler';
                
                // Allow GET method for root route information
                matchResult.methodAllowed = normalizedMethod === 'GET';
                matchResult.allowedMethods = ['GET'];
                
                return matchResult;
            }
            
            // Apply route-specific validation rules and security checks for unmatched routes
            matchResult.matched = false;
            matchResult.endpoint = null;
            matchResult.methodAllowed = false;
            
            // Create route matching result with endpoint metadata and handler information
            matchResult.metadata.supportedRoutes = Array.from(this.supportedRoutes);
            matchResult.metadata.matchAttempted = true;
            
            // Return comprehensive route matching result for handler delegation
            return matchResult;
            
        } catch (error) {
            // Return error result if matching fails
            this.logger.error('Route matching failed', { method, path, error: error.message });
            
            return {
                matched: false,
                endpoint: null,
                methodAllowed: false,
                handler: null,
                allowedMethods: [],
                error: error.message,
                metadata: {
                    timestamp: new Date().toISOString(),
                    matchingFailed: true
                }
            };
        }
    }
    
    /**
     * Comprehensive route access validation method that performs security checks,
     * method authorization, and endpoint-specific access control validation.
     * Implements multi-layer security validation for route access control.
     * 
     * @param {string} method - HTTP method for validation
     * @param {string} path - URL path for access validation  
     * @param {Object} validationOptions - Validation configuration options
     * @returns {Object} Complete access validation result with authorization status, security assessment, and access control details
     */
    validateRouteAccess(method, path, validationOptions = {}) {
        try {
            // Initialize validation options with defaults
            const options = {
                strictMode: true,
                enableSecurity: true,
                includeDetails: true,
                ...validationOptions
            };
            
            // Create validation result object
            const validationResult = {
                isValid: false,
                method: method,
                path: path,
                authorized: false,
                security: {
                    validated: false,
                    threatLevel: 'none',
                    violations: [],
                    injectionAttempt: false,
                    pathTraversalAttempt: false
                },
                errors: [],
                metadata: {
                    timestamp: new Date().toISOString(),
                    validationId: `val_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
                }
            };
            
            // Validate route path format and structure using validateUrlPath with security checks
            const pathValidation = validateUrlPath(path, {
                strictMode: options.strictMode,
                sanitize: true,
                includeSecurityAssessment: true
            });
            
            if (!pathValidation.isValid) {
                validationResult.errors.push(...pathValidation.errors);
                validationResult.security.violations.push('invalid_path_format');
                
                // Check for specific security threats
                if (pathValidation.securityAssessment?.traversalAttempt) {
                    validationResult.security.pathTraversalAttempt = true;
                    validationResult.security.threatLevel = 'high';
                    validationResult.security.violations.push('path_traversal_attempt');
                }
                
                return validationResult;
            }
            
            // Perform HTTP method validation and authorization using method validation utilities
            const normalizedMethod = method.toString().toUpperCase();
            if (!Object.values(HTTP_METHODS).includes(normalizedMethod)) {
                validationResult.errors.push(`Invalid HTTP method: ${method}`);
                validationResult.security.violations.push('invalid_http_method');
                return validationResult;
            }
            
            // Apply endpoint-specific access control validation for /hello endpoint
            const normalizedPath = normalizeRoutePath(path);
            if (normalizedPath === HELLO_ROUTE_PATTERN) {
                const methodAllowed = isMethodAllowedForEndpoint(normalizedMethod, HELLO_ROUTE_PATTERN);
                validationResult.authorized = methodAllowed;
                
                if (!methodAllowed) {
                    validationResult.errors.push(`Method ${normalizedMethod} not allowed for ${HELLO_ROUTE_PATTERN}`);
                    validationResult.security.violations.push('method_not_allowed');
                }
            } else if (normalizedPath === '/') {
                // Root route only allows GET method
                validationResult.authorized = normalizedMethod === 'GET';
                
                if (!validationResult.authorized) {
                    validationResult.errors.push(`Method ${normalizedMethod} not allowed for root route`);
                    validationResult.security.violations.push('method_not_allowed_root');
                }
            } else {
                // Unknown routes are not authorized
                validationResult.authorized = false;
                validationResult.errors.push(`Route not found: ${normalizedPath}`);
                validationResult.security.violations.push('route_not_found');
            }
            
            // Perform comprehensive security validation using security validation framework
            if (options.enableSecurity && this.securityConfig.enableValidation) {
                // Check for injection attempts in URL
                const injectionPatterns = [/'|"|;|<|>|script|javascript:|data:/gi];
                const pathString = path.toString().toLowerCase();
                
                for (const pattern of injectionPatterns) {
                    if (pattern.test(pathString)) {
                        validationResult.security.injectionAttempt = true;
                        validationResult.security.threatLevel = 'high';
                        validationResult.security.violations.push('injection_attempt_detected');
                        validationResult.errors.push('Security threat detected in request');
                        break;
                    }
                }
                
                // Check for path traversal attempts
                if (this.securityConfig.enablePathTraversalCheck) {
                    const traversalPatterns = [/\.\./g, /%2e%2e/gi, /\\.\\.\\|\/\.\./g];
                    
                    for (const pattern of traversalPatterns) {
                        if (pattern.test(pathString)) {
                            validationResult.security.pathTraversalAttempt = true;
                            validationResult.security.threatLevel = 'critical';
                            validationResult.security.violations.push('path_traversal_detected');
                            validationResult.errors.push('Path traversal attempt detected');
                            break;
                        }
                    }
                }
            }
            
            // Compile validation results from all validation layers into comprehensive result
            validationResult.security.validated = true;
            validationResult.isValid = validationResult.errors.length === 0 && validationResult.authorized;
            
            // Generate security assessment with access control status and threat evaluation
            if (validationResult.security.violations.length > 0) {
                validationResult.security.threatLevel = validationResult.security.threatLevel || 'medium';
            }
            
            // Return complete access validation result with authorization and security assessment
            return validationResult;
            
        } catch (error) {
            // Return error result if validation fails
            this.logger.error('Route access validation failed', { method, path, error: error.message });
            
            return {
                isValid: false,
                method: method,
                path: path,
                authorized: false,
                security: {
                    validated: false,
                    threatLevel: 'critical',
                    violations: ['validation_error'],
                    injectionAttempt: false,
                    pathTraversalAttempt: false
                },
                errors: [`Validation error: ${error.message}`],
                metadata: {
                    timestamp: new Date().toISOString(),
                    validationFailed: true
                }
            };
        }
    }
    
    /**
     * Specialized handler method for /hello endpoint requests with hello-specific
     * processing logic and response generation. Delegates to HelloController for
     * comprehensive hello world response processing.
     * 
     * @param {Object} request - HTTP request object for hello endpoint
     * @param {Object} response - HTTP response object for response generation
     * @param {Object} routeContext - Route processing context with correlation information
     * @returns {Object} Hello route processing result with response generation and completion status
     */
    async handleHelloRoute(request, response, routeContext) {
        try {
            // Validate hello endpoint access using validateRouteAccess with hello-specific rules
            const accessValidation = this.validateRouteAccess(request.method, HELLO_ROUTE_PATTERN, {
                strictMode: this.strictMode,
                enableSecurity: this.securityConfig.enableValidation
            });
            
            if (!accessValidation.isValid) {
                const accessError = createRouteError('BAD_REQUEST', 'Hello endpoint access denied', routeContext);
                return await this._handleError(accessError, request, response, routeContext);
            }
            
            // Update route context with hello endpoint information
            routeContext.routing.endpoint = HELLO_ROUTE_PATTERN;
            routeContext.routing.handler = 'HelloController';
            routeContext.routing.matched = true;
            routeContext.routing.methodAllowed = true;
            
            // Log hello route processing initiation
            this.logger.debug('Processing hello route request', {
                routeId: routeContext.routeId,
                method: request.method,
                endpoint: HELLO_ROUTE_PATTERN
            });
            
            // Delegate request processing to hello controller for hello world response generation
            const helloResult = await this.helloController.handleHelloRequest(request, {
                routeContext: routeContext,
                responseHandler: this.responseHandler
            });
            
            // Handle hello controller response and format using response handler
            let routingResult;
            if (helloResult.success) {
                // Generate successful hello response
                const responseResult = await this.responseHandler.createResponse(
                    HTTP_STATUS_CODES.SUCCESS.OK,
                    helloResult.data,
                    { 
                        correlationId: routeContext.routeId,
                        endpoint: HELLO_ROUTE_PATTERN 
                    }
                );
                
                await this.responseHandler.sendResponse(response, responseResult);
                
                routingResult = {
                    success: true,
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    handled: true,
                    routeId: routeContext.routeId,
                    endpoint: HELLO_ROUTE_PATTERN,
                    data: helloResult.data
                };
                
                // Update hello route metrics
                this.routingMetrics.helloRouteHits++;
                
            } else {
                // Handle hello controller error
                const helloError = createRouteError('INTERNAL_ERROR', helloResult.error || 'Hello processing failed', routeContext);
                routingResult = await this._handleError(helloError, request, response, routeContext);
            }
            
            // Log hello route processing completion with performance metrics and success status
            this.logger.info('Hello route processing completed', {
                routeId: routeContext.routeId,
                success: routingResult.success,
                statusCode: routingResult.statusCode,
                processingTime: routeContext.performance?.duration
            });
            
            // Return hello route processing result with response data and completion status
            return routingResult;
            
        } catch (error) {
            // Handle unexpected errors in hello route processing
            this.logger.error('Hello route processing failed', {
                routeId: routeContext.routeId,
                error: error.message
            }, error);
            
            const helloError = createRouteError('INTERNAL_ERROR', `Hello route error: ${error.message}`, routeContext);
            return await this._handleError(helloError, request, response, routeContext);
        }
    }
    
    /**
     * Handles requests to non-existent routes by generating appropriate 404 Not Found
     * responses with proper error formatting. Provides standardized not found handling
     * with security-conscious error messages.
     * 
     * @param {Object} request - HTTP request object for not found route
     * @param {Object} response - HTTP response object for error response generation
     * @param {Object} routeContext - Route processing context with request information
     * @returns {Object} Not found route processing result with error response generation and completion status
     */
    async handleNotFoundRoute(request, response, routeContext) {
        try {
            // Log not found route access with request details and attempted path
            this.logger.warn('Route not found', {
                routeId: routeContext.routeId,
                method: request.method,
                url: request.url,
                attemptedPath: routeContext.routing?.normalizedPath,
                remoteAddress: request.connection?.remoteAddress
            });
            
            // Create standardized 404 Not Found error response using createRouteError
            const notFoundError = createRouteError('NOT_FOUND', ERROR_MESSAGES.NOT_FOUND, routeContext);
            
            // Generate error response using response handler with proper status code and headers
            const errorResponse = await this.responseHandler.createResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                {
                    error: ERROR_MESSAGES.NOT_FOUND,
                    message: 'The requested resource could not be found',
                    timestamp: new Date().toISOString(),
                    path: routeContext.routing?.normalizedPath || request.url
                },
                {
                    correlationId: routeContext.routeId,
                    errorType: 'NOT_FOUND'
                }
            );
            
            // Apply security headers and prevent information disclosure in error responses
            await this.responseHandler.sendResponse(response, errorResponse);
            
            // Update routing metrics with not found route statistics for monitoring
            this.routingMetrics.notFoundCount++;
            this.routingMetrics.invalidRouteAttempts++;
            
            // Log not found route processing completion with error context and client information
            this.logger.info('Not found response sent', {
                routeId: routeContext.routeId,
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                clientInfo: {
                    ip: request.connection?.remoteAddress,
                    userAgent: request.headers?.['user-agent']
                }
            });
            
            // Return not found route processing result with error response and completion status
            return {
                success: true, // Successfully handled the not found case
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                handled: true,
                routeId: routeContext.routeId,
                error: notFoundError,
                errorType: 'NOT_FOUND'
            };
            
        } catch (error) {
            // Handle errors in not found processing
            this.logger.error('Not found handling failed', {
                routeId: routeContext.routeId,
                error: error.message
            }, error);
            
            const handlingError = createRouteError('INTERNAL_ERROR', 'Not found handling failed', routeContext);
            return await this._handleError(handlingError, request, response, routeContext);
        }
    }
    
    /**
     * Handles requests with unsupported HTTP methods by generating 405 Method Not Allowed
     * responses with proper Allow headers. Implements comprehensive method validation
     * error handling with endpoint-specific method restrictions.
     * 
     * @param {Object} request - HTTP request object with unsupported method
     * @param {Object} response - HTTP response object for error response generation
     * @param {string} endpoint - Endpoint path for method restriction lookup
     * @returns {Object} Method not allowed processing result with error response generation and Allow header configuration
     */
    async handleMethodNotAllowed(request, response, endpoint) {
        try {
            // Generate route context for method not allowed processing
            const routeId = generateRouteId(request.method, request.url);
            const routeContext = createRouteContext(request, routeId);
            
            // Log method not allowed access with request details and endpoint information
            this.logger.warn('Method not allowed', {
                routeId: routeId,
                method: request.method,
                endpoint: endpoint,
                url: request.url,
                remoteAddress: request.connection?.remoteAddress
            });
            
            // Get allowed methods for endpoint using getAllowedMethodsForEndpoint function
            let allowedMethods = [];
            if (endpoint === HELLO_ROUTE_PATTERN) {
                allowedMethods = [...HELLO_ENDPOINT_METHODS];
            } else if (endpoint === '/') {
                allowedMethods = ['GET'];
            }
            
            // Create standardized 405 Method Not Allowed error response with Allow header
            const methodNotAllowedError = createRouteError('METHOD_NOT_ALLOWED', ERROR_MESSAGES.METHOD_NOT_ALLOWED, routeContext);
            
            // Generate error response using response handler with proper status code and method restrictions
            const errorResponse = await this.responseHandler.createResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                {
                    error: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                    message: `Method ${request.method} not allowed for ${endpoint}`,
                    allowedMethods: allowedMethods,
                    timestamp: new Date().toISOString(),
                    endpoint: endpoint
                },
                {
                    correlationId: routeId,
                    errorType: 'METHOD_NOT_ALLOWED',
                    customHeaders: {
                        'Allow': allowedMethods.join(', ')
                    }
                }
            );
            
            // Include Allow header with supported methods for the requested endpoint
            await this.responseHandler.sendResponse(response, errorResponse);
            
            // Update routing metrics with method not allowed statistics for monitoring
            this.routingMetrics.methodNotAllowedCount++;
            
            // Log method not allowed processing completion with method restriction details
            this.logger.info('Method not allowed response sent', {
                routeId: routeId,
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                endpoint: endpoint,
                attemptedMethod: request.method,
                allowedMethods: allowedMethods
            });
            
            // Return method not allowed processing result with error response and header configuration
            return {
                success: true, // Successfully handled the method not allowed case
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                handled: true,
                routeId: routeId,
                error: methodNotAllowedError,
                errorType: 'METHOD_NOT_ALLOWED',
                allowedMethods: allowedMethods
            };
            
        } catch (error) {
            // Handle errors in method not allowed processing
            this.logger.error('Method not allowed handling failed', {
                method: request.method,
                endpoint: endpoint,
                error: error.message
            }, error);
            
            // Return generic error response
            return {
                success: false,
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                handled: false,
                error: error.message,
                errorType: 'INTERNAL_ERROR'
            };
        }
    }
    
    /**
     * Handles route processing errors with proper classification, logging, and error
     * response preparation for consistent error management. Provides comprehensive
     * error handling with contextual information and appropriate HTTP status codes.
     * 
     * @param {Object} error - Route processing error object with classification information
     * @param {Object} request - HTTP request object for error context
     * @param {Object} response - HTTP response object for error response generation
     * @param {Object} routeContext - Route processing context with correlation information
     * @returns {Object} Error handling result with error classification, response data, and logging information
     */
    async handleRouteError(error, request, response, routeContext) {
        try {
            // Classify route error type and determine appropriate HTTP status code
            const errorType = error.type || 'INTERNAL_ERROR';
            const statusCode = error.statusCode || HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
            const errorMessage = error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
            
            // Extract error context and correlation ID for detailed logging and tracking
            const errorContext = {
                routeId: routeContext.routeId,
                errorType: errorType,
                statusCode: statusCode,
                requestMethod: request.method,
                requestUrl: request.url,
                timestamp: new Date().toISOString(),
                processingTime: routeContext.performance?.duration
            };
            
            // Include security context if available
            if (routeContext.security && routeContext.security.violations.length > 0) {
                errorContext.securityViolations = routeContext.security.violations;
                errorContext.threatLevel = routeContext.security.threatLevel;
            }
            
            // Log error details with security context and route processing information
            this.logger.error('Route processing error occurred', errorContext, error);
            
            // Determine error recovery strategy based on error type and severity classification
            let recoveryStrategy = 'send_error_response';
            let includeDetails = false;
            
            if (isClientError(statusCode)) {
                recoveryStrategy = 'send_client_error_response';
                includeDetails = this.strictMode;
            } else {
                recoveryStrategy = 'send_server_error_response';
                includeDetails = this.errorHandling.includeStackTrace;
            }
            
            // Create standardized error response using createRouteError with route context
            const errorResponseData = {
                error: this.errorHandling.sanitizeErrors ? 'An error occurred' : errorMessage,
                timestamp: new Date().toISOString(),
                correlationId: routeContext.routeId
            };
            
            // Include additional error details if configured
            if (includeDetails) {
                errorResponseData.details = {
                    type: errorType,
                    path: request.url,
                    method: request.method
                };
                
                if (error.stack && this.errorHandling.includeStackTrace) {
                    errorResponseData.details.stack = error.stack;
                }
            }
            
            // Generate error response using response handler with proper formatting
            const errorResponse = await this.responseHandler.createResponse(
                statusCode,
                errorResponseData,
                {
                    correlationId: routeContext.routeId,
                    errorType: errorType,
                    recoveryStrategy: recoveryStrategy
                }
            );
            
            await this.responseHandler.sendResponse(response, errorResponse);
            
            // Update routing metrics with error statistics and classification for monitoring
            this.routingMetrics.errorCount++;
            if (routeContext.security && routeContext.security.violations.length > 0) {
                this.routingMetrics.securityViolations++;
            }
            
            // Log error response completion
            this.logger.info('Error response sent', {
                routeId: routeContext.routeId,
                statusCode: statusCode,
                errorType: errorType,
                recoveryStrategy: recoveryStrategy
            });
            
            // Return comprehensive error handling result for response generation and completion
            return {
                success: true, // Successfully handled the error
                statusCode: statusCode,
                handled: true,
                routeId: routeContext.routeId,
                error: error,
                errorType: errorType,
                recoveryStrategy: recoveryStrategy
            };
            
        } catch (handlingError) {
            // Handle errors in error handling (fallback error response)
            this.logger.fatal('Error handling failed', {
                routeId: routeContext?.routeId,
                originalError: error.message,
                handlingError: handlingError.message
            }, handlingError);
            
            // Send minimal error response
            try {
                response.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({
                    error: 'Internal Server Error',
                    timestamp: new Date().toISOString()
                }));
            } catch (responseError) {
                // Final fallback - do nothing if response cannot be sent
            }
            
            return {
                success: false,
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                handled: false,
                error: handlingError.message,
                errorType: 'CRITICAL_ERROR'
            };
        }
    }
    
    /**
     * Retrieves current routing metrics including performance statistics, route
     * distribution, and error tracking for monitoring and optimization. Provides
     * comprehensive analytics for route processing performance assessment.
     * 
     * @returns {Object} Routing metrics including timing statistics, route counts, and error frequency by route type
     */
    getRoutingMetrics() {
        try {
            // Compile route processing performance statistics including timing and throughput
            const currentTime = Date.now();
            const uptimeMs = currentTime - this.routingMetrics.lastResetTime.getTime();
            const uptimeSeconds = Math.floor(uptimeMs / 1000);
            
            // Calculate route distribution statistics across hello endpoint and not found routes
            const totalRequests = this.routingMetrics.totalRequests;
            const successRate = totalRequests > 0 ? 
                ((this.routingMetrics.successfulMatches / totalRequests) * 100).toFixed(2) : 0;
            const errorRate = totalRequests > 0 ? 
                ((this.routingMetrics.errorCount / totalRequests) * 100).toFixed(2) : 0;
            
            // Aggregate error frequency and success rates by route type and error classification
            const routeDistribution = {
                helloRoute: {
                    hits: this.routingMetrics.helloRouteHits,
                    percentage: totalRequests > 0 ? 
                        ((this.routingMetrics.helloRouteHits / totalRequests) * 100).toFixed(2) : 0
                },
                rootRoute: {
                    hits: this.routingMetrics.rootRouteHits,
                    percentage: totalRequests > 0 ? 
                        ((this.routingMetrics.rootRouteHits / totalRequests) * 100).toFixed(2) : 0
                },
                notFound: {
                    count: this.routingMetrics.notFoundCount,
                    percentage: totalRequests > 0 ? 
                        ((this.routingMetrics.notFoundCount / totalRequests) * 100).toFixed(2) : 0
                }
            };
            
            // Include method authorization statistics and security validation effectiveness
            const securityMetrics = {
                totalViolations: this.routingMetrics.securityViolations,
                injectionAttempts: this.routingMetrics.injectionAttempts,
                pathTraversalAttempts: this.routingMetrics.pathTraversalAttempts,
                violationRate: totalRequests > 0 ? 
                    ((this.routingMetrics.securityViolations / totalRequests) * 100).toFixed(2) : 0
            };
            
            // Generate routing benchmarks and optimization recommendations for performance tuning
            const performanceMetrics = {
                averageProcessingTime: this.routingMetrics.averageProcessingTime,
                slowRequestCount: this.routingMetrics.slowRequestCount,
                slowRequestRate: totalRequests > 0 ? 
                    ((this.routingMetrics.slowRequestCount / totalRequests) * 100).toFixed(2) : 0,
                requestsPerSecond: uptimeSeconds > 0 ? 
                    (totalRequests / uptimeSeconds).toFixed(2) : 0
            };
            
            // Return comprehensive routing metrics for monitoring and performance analysis
            return {
                summary: {
                    totalRequests: totalRequests,
                    successfulMatches: this.routingMetrics.successfulMatches,
                    errorCount: this.routingMetrics.errorCount,
                    successRate: `${successRate}%`,
                    errorRate: `${errorRate}%`,
                    uptime: `${uptimeSeconds}s`
                },
                routeDistribution: routeDistribution,
                performance: performanceMetrics,
                security: securityMetrics,
                errorBreakdown: {
                    notFound: this.routingMetrics.notFoundCount,
                    methodNotAllowed: this.routingMetrics.methodNotAllowedCount,
                    internalErrors: this.routingMetrics.errorCount,
                    securityViolations: this.routingMetrics.securityViolations
                },
                configuration: {
                    strictMode: this.strictMode,
                    securityEnabled: this.securityConfig.enableValidation,
                    metricsEnabled: this.routingMetrics.enabled,
                    supportedRoutes: Array.from(this.supportedRoutes)
                },
                lastReset: this.routingMetrics.lastResetTime.toISOString(),
                generatedAt: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('Failed to generate routing metrics', { error: error.message }, error);
            
            return {
                error: 'Failed to generate routing metrics',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Updates route handler configuration at runtime with validation and component
     * reconfiguration for dynamic configuration management. Allows runtime adjustment
     * of routing behavior without requiring application restart.
     * 
     * @param {Object} newConfig - New configuration object with updated settings
     * @returns {boolean} true if configuration update was successful, false otherwise with error details
     */
    updateConfiguration(newConfig) {
        try {
            // Validate new configuration object against route handler configuration schema
            if (!newConfig || typeof newConfig !== 'object') {
                this.logger.error('Invalid configuration object provided');
                return false;
            }
            
            // Store previous configuration for rollback if needed
            const previousConfig = { ...this.config };
            
            // Check configuration compatibility with current routing pipeline and components
            const mergedConfig = {
                ...this.config,
                ...newConfig
            };
            
            // Validate critical configuration values
            if (mergedConfig.requestTimeout && (typeof mergedConfig.requestTimeout !== 'number' || mergedConfig.requestTimeout <= 0)) {
                this.logger.error('Invalid request timeout configuration');
                return false;
            }
            
            if (mergedConfig.maxRequestSize && (typeof mergedConfig.maxRequestSize !== 'number' || mergedConfig.maxRequestSize <= 0)) {
                this.logger.error('Invalid max request size configuration');
                return false;
            }
            
            // Update main configuration
            this.config = mergedConfig;
            
            // Update strict mode if provided
            if (newConfig.hasOwnProperty('strictMode')) {
                this.strictMode = Boolean(newConfig.strictMode);
            }
            
            // Reconfigure security settings if provided
            if (newConfig.securityConfig) {
                this.securityConfig = {
                    ...this.securityConfig,
                    ...newConfig.securityConfig
                };
            }
            
            // Update error handling configuration if provided
            if (newConfig.errorHandling) {
                this.errorHandling = {
                    ...this.errorHandling,
                    ...newConfig.errorHandling
                };
            }
            
            // Apply new logging configuration and performance monitoring settings
            if (newConfig.logLevel) {
                this.logger.setLogLevel(newConfig.logLevel);
            }
            
            // Update supported routes registry with new route patterns if applicable
            if (newConfig.additionalRoutes && Array.isArray(newConfig.additionalRoutes)) {
                newConfig.additionalRoutes.forEach(route => {
                    if (typeof route === 'string') {
                        this.supportedRoutes.add(route);
                    }
                });
            }
            
            // Log configuration change event with details and impact assessment for monitoring
            this.logger.info('Route handler configuration updated', {
                timestamp: new Date().toISOString(),
                configurationChanges: Object.keys(newConfig),
                strictMode: this.strictMode,
                securityEnabled: this.securityConfig.enableValidation,
                supportedRoutesCount: this.supportedRoutes.size
            });
            
            // Return configuration update success status with validation results and error details
            return true;
            
        } catch (error) {
            this.logger.error('Configuration update failed', { error: error.message }, error);
            return false;
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Validates basic HTTP request structure for routing processing.
     * @private
     */
    _validateRequestStructure(request) {
        if (!request || typeof request !== 'object') {
            return false;
        }
        
        if (!request.method || typeof request.method !== 'string') {
            return false;
        }
        
        if (!request.url || typeof request.url !== 'string') {
            return false;
        }
        
        return true;
    }
    
    /**
     * Handles generic routes (like root route) that don't have specific controllers.
     * @private
     */
    async _handleGenericRoute(request, response, routeContext, matchResult) {
        try {
            if (matchResult.endpoint === '/') {
                // Handle root route with basic application information
                const appInfo = {
                    name: 'Node.js Tutorial Application',
                    version: '1.0.0',
                    description: 'Educational HTTP server demonstrating fundamental concepts',
                    endpoints: {
                        '/': 'Application information',
                        '/hello': 'Hello world endpoint'
                    },
                    timestamp: new Date().toISOString()
                };
                
                const responseResult = await this.responseHandler.createResponse(
                    HTTP_STATUS_CODES.SUCCESS.OK,
                    appInfo,
                    { correlationId: routeContext.routeId }
                );
                
                await this.responseHandler.sendResponse(response, responseResult);
                
                this.routingMetrics.rootRouteHits++;
                
                return {
                    success: true,
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    handled: true,
                    routeId: routeContext.routeId,
                    endpoint: '/',
                    data: appInfo
                };
            }
            
            // If no specific handler, treat as not found
            return await this.handleNotFoundRoute(request, response, routeContext);
            
        } catch (error) {
            const routeError = createRouteError('INTERNAL_ERROR', `Generic route error: ${error.message}`, routeContext);
            return await this._handleError(routeError, request, response, routeContext);
        }
    }
    
    /**
     * Internal error handling method.
     * @private
     */
    async _handleError(error, request, response, routeContext) {
        return await this.handleRouteError(error, request, response, routeContext);
    }
    
    /**
     * Updates routing metrics with processing results.
     * @private
     */
    _updateRoutingMetrics(routeContext, routingResult) {
        if (!this.routingMetrics.enabled) {
            return;
        }
        
        this.routingMetrics.totalRequests++;
        
        if (routingResult.success) {
            this.routingMetrics.successfulMatches++;
        }
        
        if (routeContext.performance && routeContext.performance.duration) {
            // Update average processing time
            const currentAvg = this.routingMetrics.averageProcessingTime;
            const totalRequests = this.routingMetrics.totalRequests;
            const newDuration = routeContext.performance.duration;
            
            this.routingMetrics.averageProcessingTime = 
                ((currentAvg * (totalRequests - 1)) + newDuration) / totalRequests;
            
            if (routeContext.performance.isSlowRequest) {
                this.routingMetrics.slowRequestCount++;
            }
        }
        
        // Update security metrics
        if (routeContext.security && routeContext.security.violations.length > 0) {
            this.routingMetrics.securityViolations++;
            
            if (routeContext.security.injectionAttempt) {
                this.routingMetrics.injectionAttempts++;
            }
            
            if (routeContext.security.pathTraversalAttempt) {
                this.routingMetrics.pathTraversalAttempts++;
            }
        }
    }
    
    /**
     * Initializes fallback configuration if normal initialization fails.
     * @private
     */
    _initializeFallbackConfiguration() {
        this.config = { ...DEFAULT_ROUTE_CONFIG };
        this.routingMetrics = { ...ROUTE_MATCHING_METRICS, enabled: false };
        this.supportedRoutes = new Set([HELLO_ROUTE_PATTERN, '/']);
        this.strictMode = true;
        this.securityConfig = {
            enableValidation: true,
            enableInjectionPrevention: true,
            enablePathTraversalCheck: true
        };
        this.errorHandling = {
            includeStackTrace: false,
            sanitizeErrors: true,
            enableDetailedLogging: false
        };
        
        // Initialize basic logger and response handler
        this.logger = {
            info: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            debug: console.log.bind(console)
        };
        
        this.responseHandler = {
            createResponse: async (statusCode, data, options) => ({ statusCode, data, options }),
            sendResponse: async (response, responseData) => {
                response.statusCode = responseData.statusCode;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify(responseData.data));
            }
        };
        
        this.helloController = {
            handleHelloRequest: async () => ({
                success: true,
                data: { message: 'Hello, World!' }
            })
        };
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export the main RouteHandler class for application routing
module.exports = {
    // Main route handler class
    RouteHandler,
    
    // Utility functions for route processing
    generateRouteId,
    createRouteContext,
    normalizeRoutePath,
    createRouteError,
    
    // Global route configuration constants  
    HELLO_ROUTE_PATTERN,
    DEFAULT_ROUTE_CONFIG,
    ROUTE_MATCHING_METRICS,
    SUPPORTED_ROUTE_PATTERNS
};

// Create and export default route handler instance for immediate use
const routeHandler = new RouteHandler();
module.exports.routeHandler = routeHandler;