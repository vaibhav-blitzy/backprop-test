/**
 * Abstract Base Controller Class for Node.js Tutorial Application
 * 
 * Provides foundational HTTP request handling functionality for all controller classes in the Node.js 
 * tutorial application. Implements common controller patterns including request validation, response 
 * generation, error handling, performance monitoring, and service integration. Serves as the 
 * architectural foundation for controller layer with educational clarity while demonstrating 
 * production-ready controller implementation patterns including abstract method definitions, request 
 * lifecycle management, and standardized HTTP processing workflows.
 * 
 * This class demonstrates:
 * - Abstract base class patterns for shared functionality
 * - Comprehensive HTTP request processing with validation and security
 * - Error handling with proper HTTP status codes and sanitized responses
 * - Performance monitoring and metrics collection for request processing
 * - Service layer integration for business logic coordination
 * - Educational controller architecture with production-ready patterns
 * - Request lifecycle management with proper cleanup and resource handling
 * 
 * Educational Objectives:
 * - Demonstrates abstract base class implementation in Node.js
 * - Shows comprehensive HTTP request handling and response generation
 * - Illustrates error handling patterns with proper categorization
 * - Provides examples of performance monitoring in web applications
 * - Shows service layer integration and dependency injection patterns
 * - Demonstrates logging integration for observability and debugging
 * 
 * @fileoverview Abstract base controller providing foundational HTTP functionality
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import service layer base class for business logic coordination and validation
const { BaseService } = require('../services/base.service.js'); // v1.0.0

// Import comprehensive error handling class for HTTP error processing and responses
const { ErrorHandler } = require('../lib/error-handler.js'); // v1.0.0

// Import response utility functions for standardized HTTP response generation
const { 
    createSuccessResponse, 
    createErrorResponse, 
    validateResponse 
} = require('../utils/response-utils.js'); // v1.0.0

// Import request type definitions and validation functions for request processing
const { 
    REQUEST_TYPES, 
    validateRequestType, 
    normalizeRequestObject, 
    extractRequestMetadata 
} = require('../types/request.types.js'); // v1.0.0

// Import HTTP status code constants for proper response status management
const { HTTP_STATUS_CODES } = require('../utils/http-status.js'); // v1.0.0

// Import structured logging class for comprehensive request and error logging
const { Logger } = require('../utils/logger.js'); // v1.0.0

// Import Node.js built-in modules for performance measurement and unique ID generation
const { performance } = require('perf_hooks'); // Node.js built-in - Performance measurement APIs
const crypto = require('crypto'); // Node.js built-in - Cryptographic utilities for correlation IDs

// ============================================================================
// GLOBAL CONTROLLER CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Base controller configuration object with default settings for initialization,
 * feature enablement, and operational parameters across all controller implementations.
 */
const BASE_CONTROLLER_CONFIG = {
    controllerName: 'BaseController',
    version: '1.0.0',
    enableValidation: true,
    enableLogging: true,
    enableMetrics: true,
    enableErrorHandling: true,
    requestTimeout: 30000,
    maxRequestSize: 1048576 // 1MB limit for request processing
};

/**
 * Default controller metadata providing identification and maintenance information
 * for monitoring, documentation, and operational management.
 */
const DEFAULT_CONTROLLER_METADATA = {
    category: 'tutorial-controller',
    environment: 'development',
    maintainer: 'tutorial-application',
    documentation: 'Educational controller implementation'
};

/**
 * Performance threshold constants for monitoring and alerting on controller operation timing,
 * memory usage, and request processing performance optimization.
 */
const CONTROLLER_PERFORMANCE_THRESHOLDS = {
    slow_request_threshold_ms: 100,
    warning_threshold_ms: 50,
    critical_threshold_ms: 500,
    memory_warning_mb: 25,
    memory_critical_mb: 50
};

// ============================================================================
// UTILITY FUNCTIONS FOR CONTROLLER OPERATIONS
// ============================================================================

/**
 * Generates unique request correlation IDs for tracking and debugging HTTP requests 
 * across controller processing pipeline. Uses cryptographically secure random generation 
 * for uniqueness and optional prefix support for request categorization.
 * 
 * @param {string} [prefix=''] - Optional prefix for request ID categorization and routing
 * @returns {string} Unique request ID with optional prefix for request correlation and tracking
 * 
 * @example
 * const requestId = generateRequestId('api');
 * console.log(requestId); // "api_1642781234567_a1b2c3d4e5f6"
 */
function generateRequestId(prefix = '') {
    try {
        // Generate cryptographically random bytes using crypto.randomBytes for uniqueness
        const randomBytes = crypto.randomBytes(8);
        
        // Convert random bytes to hexadecimal string representation for readability
        const randomHex = randomBytes.toString('hex');
        
        // Include timestamp component for chronological request ordering and uniqueness
        const timestamp = Date.now();
        
        // Add optional prefix if provided for request categorization and identification
        const prefixPart = prefix ? `${prefix}_` : '';
        
        // Return unique request ID suitable for correlation tracking across services
        return `${prefixPart}${timestamp}_${randomHex}`;
        
    } catch (error) {
        // Fallback to timestamp-based ID if crypto operations fail
        return `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Factory function for creating controller context objects with request/response data and 
 * controller utilities. Provides comprehensive context setup for request processing with 
 * metadata, performance tracking, and error handling preparation.
 * 
 * @param {Object} request - HTTP request object with method, URL, headers, and connection info
 * @param {Object} response - HTTP response object for sending responses to client
 * @param {Object} [options={}] - Additional context options and configuration parameters
 * @returns {Object} Controller context with request data, response utilities, and processing metadata
 * 
 * @example
 * const context = createControllerContext(request, response, { timeout: 5000 });
 * console.log(context.requestId); // Unique correlation ID
 */
function createControllerContext(request, response, options = {}) {
    try {
        // Generate unique request correlation ID for tracking and debugging across services
        const requestId = generateRequestId('ctrl');
        
        // Create base context object with request and response references for processing
        const context = {
            request: request,
            response: response,
            requestId: requestId,
            startTime: performance.now(),
            timestamp: new Date().toISOString()
        };
        
        // Include request metadata using extractRequestMetadata function for comprehensive tracking
        context.requestMetadata = extractRequestMetadata(request);
        
        // Set up controller-specific utilities and helper functions for request processing
        context.utilities = {
            generateCorrelationId: () => generateRequestId(),
            getCurrentTimestamp: () => new Date().toISOString(),
            calculateDuration: (startTime) => performance.now() - startTime
        };
        
        // Add performance tracking and timing information for operation monitoring
        context.performance = {
            startTime: context.startTime,
            checkpoints: [],
            addCheckpoint: (name) => {
                context.performance.checkpoints.push({
                    name: name,
                    timestamp: performance.now(),
                    duration: performance.now() - context.startTime
                });
            }
        };
        
        // Include error handling context and recovery information for comprehensive error management
        context.errorHandling = {
            correlationId: requestId,
            errorHistory: [],
            context: 'controller-request-processing',
            addError: (error) => {
                context.errorHandling.errorHistory.push({
                    error: error,
                    timestamp: new Date().toISOString(),
                    correlationId: requestId
                });
            }
        };
        
        // Merge additional options provided for extended functionality
        Object.assign(context, options);
        
        // Return comprehensive controller context for request processing coordination
        return context;
        
    } catch (error) {
        // Return minimal context if creation fails to ensure request processing continues
        return {
            request: request,
            response: response,
            requestId: generateRequestId('fallback'),
            error: `Context creation failed: ${error.message}`
        };
    }
}

/**
 * Measures HTTP request processing performance with timing metrics and performance threshold 
 * monitoring. Provides comprehensive performance tracking with execution timing, resource 
 * monitoring, and threshold comparison for optimization and alerting.
 * 
 * @param {string} operationName - Name of operation being measured for identification and categorization
 * @param {Function} operation - Function to execute and measure for performance analysis
 * @param {Object} [context={}] - Processing context with timing and metadata information
 * @returns {Object} Performance measurement result with timing data and operation outcome
 * 
 * @example
 * const result = await measureControllerPerformance('validateRequest', async () => {
 *   return validateRequest(request);
 * }, context);
 */
async function measureControllerPerformance(operationName, operation, context = {}) {
    // Record high-resolution start time using performance.now() for precision measurement
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    // Initialize performance result object with operation identification
    const performanceResult = {
        operationName: operationName,
        startTime: startTime,
        endTime: null,
        duration: null,
        memoryUsage: null,
        success: false,
        result: null,
        error: null,
        thresholds: {
            exceeded: [],
            warnings: []
        }
    };
    
    try {
        // Execute controller operation with error handling and resource monitoring
        performanceResult.result = await operation();
        performanceResult.success = true;
        
    } catch (error) {
        // Capture execution errors for comprehensive error tracking
        performanceResult.error = {
            name: error.name,
            message: error.message,
            type: error.constructor.name
        };
        performanceResult.success = false;
    }
    
    // Calculate execution duration and compare against performance thresholds
    performanceResult.endTime = performance.now();
    performanceResult.duration = performanceResult.endTime - startTime;
    
    // Calculate memory usage and resource consumption metrics during operation
    const endMemory = process.memoryUsage();
    performanceResult.memoryUsage = {
        heapUsedDelta: endMemory.heapUsed - startMemory.heapUsed,
        heapTotalDelta: endMemory.heapTotal - startMemory.heapTotal,
        rssUsed: Math.round(endMemory.rss / 1024 / 1024), // MB
        heapUsed: Math.round(endMemory.heapUsed / 1024 / 1024) // MB
    };
    
    // Check performance against defined thresholds for alerting and optimization
    if (performanceResult.duration > CONTROLLER_PERFORMANCE_THRESHOLDS.critical_threshold_ms) {
        performanceResult.thresholds.exceeded.push('critical_duration');
    } else if (performanceResult.duration > CONTROLLER_PERFORMANCE_THRESHOLDS.warning_threshold_ms) {
        performanceResult.thresholds.warnings.push('warning_duration');
    }
    
    // Check memory usage against threshold limits for resource monitoring
    if (performanceResult.memoryUsage.heapUsed > CONTROLLER_PERFORMANCE_THRESHOLDS.memory_critical_mb) {
        performanceResult.thresholds.exceeded.push('critical_memory');
    } else if (performanceResult.memoryUsage.heapUsed > CONTROLLER_PERFORMANCE_THRESHOLDS.memory_warning_mb) {
        performanceResult.thresholds.warnings.push('warning_memory');
    }
    
    // Include context correlation ID for tracking across distributed systems
    if (context.requestId) {
        performanceResult.correlationId = context.requestId;
    }
    
    // Return performance measurement result with timing data and operation outcome
    return performanceResult;
}

/**
 * Validates controller configuration parameters and applies default values for missing 
 * configuration options. Ensures consistent controller initialization with proper validation 
 * and default value application for robust operation.
 * 
 * @param {Object} [config={}] - Controller configuration object to validate and normalize
 * @returns {Object} Validated and normalized controller configuration with applied defaults
 * 
 * @example
 * const validConfig = validateControllerConfig({ enableLogging: false });
 * console.log(validConfig.enableValidation); // true (from defaults)
 */
function validateControllerConfig(config = {}) {
    try {
        // Create base configuration object with defaults from BASE_CONTROLLER_CONFIG
        const validatedConfig = { ...BASE_CONTROLLER_CONFIG };
        
        // Validate configuration object structure and required properties
        if (!config || typeof config !== 'object') {
            return validatedConfig; // Return defaults if config is invalid
        }
        
        // Validate controller name and version information format
        if (config.controllerName && typeof config.controllerName === 'string') {
            validatedConfig.controllerName = config.controllerName.trim();
        }
        
        if (config.version && typeof config.version === 'string') {
            validatedConfig.version = config.version.trim();
        }
        
        // Validate feature flags for validation, logging, and metrics enablement
        ['enableValidation', 'enableLogging', 'enableMetrics', 'enableErrorHandling'].forEach(flag => {
            if (typeof config[flag] === 'boolean') {
                validatedConfig[flag] = config[flag];
            }
        });
        
        // Validate timeout and size limit configurations within acceptable ranges
        if (config.requestTimeout && typeof config.requestTimeout === 'number' && 
            config.requestTimeout > 0 && config.requestTimeout <= 300000) { // Max 5 minutes
            validatedConfig.requestTimeout = config.requestTimeout;
        }
        
        if (config.maxRequestSize && typeof config.maxRequestSize === 'number' && 
            config.maxRequestSize > 0 && config.maxRequestSize <= 104857600) { // Max 100MB
            validatedConfig.maxRequestSize = config.maxRequestSize;
        }
        
        // Apply additional custom configuration properties if provided
        Object.keys(config).forEach(key => {
            if (!validatedConfig.hasOwnProperty(key) && 
                typeof config[key] !== 'undefined') {
                validatedConfig[key] = config[key];
            }
        });
        
        // Return normalized configuration object with validated settings
        return validatedConfig;
        
    } catch (error) {
        // Return safe default configuration if validation fails
        return { ...BASE_CONTROLLER_CONFIG };
    }
}

// ============================================================================
// ABSTRACT BASE CONTROLLER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Abstract base controller class providing foundational HTTP request handling functionality 
 * for all controller classes in the Node.js tutorial application. Implements common controller 
 * patterns including request validation, response generation, error handling, performance 
 * monitoring, and service integration. Serves as the architectural foundation for controller 
 * layer with educational clarity while demonstrating production-ready controller implementation 
 * patterns.
 * 
 * This abstract base class provides:
 * - Comprehensive HTTP request processing with validation and sanitization
 * - Standardized response generation with proper HTTP status codes and headers
 * - Comprehensive error handling with secure error responses and logging
 * - Performance monitoring with timing metrics and resource usage tracking
 * - Service layer integration for business logic coordination and data access
 * - Request lifecycle management with proper resource cleanup and shutdown
 * - Educational patterns demonstrating controller architecture best practices
 * 
 * @abstract
 * @class BaseController
 */
class BaseController {
    /**
     * Initializes the base controller with configuration, service integration, logging, and 
     * error handling setup for comprehensive HTTP request processing foundation. Demonstrates 
     * dependency injection patterns and comprehensive initialization with error handling.
     * 
     * @param {Object} [controllerConfig={}] - Controller configuration object with feature flags and settings
     * @throws {Error} Throws error if critical initialization components fail to initialize
     * 
     * @example
     * const controller = new BaseController({
     *   controllerName: 'TestController',
     *   enableLogging: true,
     *   enableMetrics: true
     * });
     */
    constructor(controllerConfig = {}) {
        // Validate and normalize controller configuration using validateControllerConfig function
        this.config = validateControllerConfig(controllerConfig);
        
        // Set controller identification metadata including name and version information
        this.controllerName = this.config.controllerName;
        this.version = this.config.version;
        
        try {
            // Initialize Logger instance with controller-specific configuration for structured logging
            this.logger = new Logger({
                logLevel: this.config.logLevel || 'INFO',
                enableColors: this.config.enableColors !== false,
                enableMetrics: this.config.enableLogging !== false
            });
            
            // Create BaseService instance for business logic coordination and service layer integration
            this.baseService = new BaseService({
                serviceName: `${this.controllerName}Service`,
                enableLogging: this.config.enableLogging,
                enableMetrics: this.config.enableMetrics
            });
            
            // Initialize ErrorHandler instance for comprehensive error processing and response generation
            this.errorHandler = new ErrorHandler({
                enableLogging: this.config.enableErrorHandling,
                enableDetailedErrors: this.config.isDevelopment || false,
                correlationIdGenerator: generateRequestId
            });
            
        } catch (error) {
            // Initialize fallback implementations if primary initialization fails
            console.error(`Controller initialization failed: ${error.message}`);
            this._initializeFallbackComponents();
        }
        
        // Set up controller metadata including name, version, and identification information
        this.controllerMetadata = {
            ...DEFAULT_CONTROLLER_METADATA,
            controllerName: this.controllerName,
            version: this.version,
            initialized: new Date().toISOString(),
            capabilities: this._getControllerCapabilities()
        };
        
        // Initialize performance metrics tracking with request counters and timing measurements
        this.controllerMetrics = {
            requestCount: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            totalResponseTime: 0,
            errorsByType: {},
            statusCodeCounts: {},
            performanceHistory: [],
            memoryUsage: []
        };
        
        // Set controller start time and initialization status for lifecycle tracking
        this.startTime = new Date();
        this.isInitialized = true;
        
        // Log controller initialization with configuration and metadata information
        if (this.config.enableLogging && this.logger) {
            this.logger.info('BaseController initialized successfully', {
                controllerName: this.controllerName,
                version: this.version,
                config: this.config,
                metadata: this.controllerMetadata
            });
        }
    }
    
    /**
     * Main HTTP request processing method that coordinates the complete request lifecycle 
     * including validation, method handling, response generation, and error management. 
     * Implements comprehensive request processing pipeline with performance monitoring 
     * and error handling.
     * 
     * @param {Object} request - HTTP request object with method, URL, headers, and body data
     * @param {Object} response - HTTP response object for sending responses to client
     * @returns {void} Processes HTTP request and sends appropriate response to client
     * 
     * @example
     * // Called by HTTP server for each incoming request
     * controller.processRequest(req, res);
     */
    async processRequest(request, response) {
        // Generate unique request correlation ID using generateRequestId for tracking
        const requestId = generateRequestId('req');
        
        // Start performance measurement for request processing timing
        const processingStartTime = performance.now();
        
        let context = null;
        
        try {
            // Create controller context using createControllerContext with request and response
            context = createControllerContext(request, response, {
                requestId: requestId,
                timeout: this.config.requestTimeout
            });
            
            // Log request reception for monitoring and debugging purposes
            if (this.config.enableLogging) {
                this.logger.logHttpRequest(request, requestId, {
                    controllerName: this.controllerName
                });
            }
            
            // Validate incoming request using validateRequest method with comprehensive checks
            const validationResult = await this.validateRequest(request, {
                enableSecurity: true,
                maxSize: this.config.maxRequestSize
            });
            
            // Handle validation errors if request is invalid or malformed
            if (!validationResult.success) {
                return await this.handleError(
                    new Error(`Request validation failed: ${validationResult.errors.join(', ')}`),
                    request,
                    response,
                    context
                );
            }
            
            // Normalize request object using normalizeRequestObject for consistent processing
            const normalizedRequest = normalizeRequestObject(request);
            
            // Extract request metadata using extractRequestMetadata for logging and tracking
            context.requestMetadata = extractRequestMetadata(normalizedRequest);
            
            // Delegate to handleHttpMethod for method-specific processing logic
            const methodResult = await this.handleHttpMethod(
                normalizedRequest, 
                response, 
                normalizedRequest.method
            );
            
            // Generate and validate response using response utilities and validation
            const responseData = await this.generateResponse(
                methodResult,
                methodResult.statusCode || HTTP_STATUS_CODES.SUCCESS.OK,
                { correlationId: requestId }
            );
            
            // Validate response object before transmission to ensure HTTP compliance
            const responseValidation = validateResponse(responseData);
            if (!responseValidation.valid) {
                throw new Error(`Response validation failed: ${responseValidation.errors.join(', ')}`);
            }
            
            // Send successful response to client with proper headers and status code
            response.writeHead(responseData.statusCode, responseData.headers);
            response.end(JSON.stringify(responseData.body));
            
            // Update success metrics for monitoring and performance tracking
            this._updateSuccessMetrics(performance.now() - processingStartTime);
            
            // Log request completion with performance metrics and processing summary
            if (this.config.enableLogging) {
                this.logger.logHttpResponse(
                    response,
                    responseData.statusCode,
                    performance.now() - processingStartTime,
                    requestId
                );
            }
            
        } catch (error) {
            // Handle any errors during processing with comprehensive error management
            await this.handleError(error, request, response, context);
            
            // Update failure metrics for monitoring and alerting
            this._updateFailureMetrics(performance.now() - processingStartTime, error);
        }
    }
    
    /**
     * Validates incoming HTTP requests using comprehensive validation rules including structure, 
     * method, headers, and security checks. Implements multi-layer validation with security 
     * scanning and request sanitization for comprehensive input validation.
     * 
     * @param {Object} request - HTTP request object to validate against validation rules
     * @param {Object} [validationOptions={}] - Validation configuration and security options
     * @returns {Object} Validation result with success status, validated data, and error details
     * 
     * @example
     * const result = await controller.validateRequest(request, { enableSecurity: true });
     * if (!result.success) console.log(result.errors);
     */
    async validateRequest(request, validationOptions = {}) {
        // Initialize comprehensive validation result object with default success state
        const validationResult = {
            success: false,
            errors: [],
            warnings: [],
            validatedData: null,
            securityChecks: {
                passed: 0,
                failed: 0,
                warnings: []
            },
            performance: {
                startTime: performance.now(),
                duration: null
            }
        };
        
        try {
            // Check if validation is enabled via controller configuration flags
            if (!this.config.enableValidation) {
                validationResult.success = true;
                validationResult.validatedData = request;
                return validationResult;
            }
            
            // Validate basic request structure using validateRequestType function
            const structureValidation = validateRequestType(request, 'default');
            if (!structureValidation.success) {
                validationResult.errors.push(...structureValidation.errors);
            }
            
            // Use BaseService validateInput for service-level validation and security checks
            if (this.baseService && this.baseService.validateInput) {
                const serviceValidation = await this.baseService.validateInput(request, {
                    type: 'http-request',
                    enableSecurity: validationOptions.enableSecurity || true
                });
                
                if (!serviceValidation.success) {
                    validationResult.errors.push(...serviceValidation.errors);
                }
                
                // Include security validation results from service layer
                if (serviceValidation.securityChecks) {
                    validationResult.securityChecks = serviceValidation.securityChecks;
                }
            }
            
            // Perform HTTP protocol compliance validation including headers and method format
            const protocolValidation = this._validateHttpProtocolCompliance(request);
            if (!protocolValidation.valid) {
                validationResult.errors.push(...protocolValidation.errors);
            }
            
            // Apply security validation to prevent injection attacks and malicious input
            if (validationOptions.enableSecurity !== false) {
                const securityValidation = this._performSecurityValidation(request);
                validationResult.securityChecks.passed += securityValidation.checksPerformed;
                validationResult.securityChecks.failed += securityValidation.checksFailed;
                validationResult.securityChecks.warnings.push(...securityValidation.warnings);
                
                if (securityValidation.errors.length > 0) {
                    validationResult.errors.push(...securityValidation.errors);
                }
            }
            
            // Validate request size limits and timeout constraints from configuration
            if (validationOptions.maxSize && request.headers['content-length']) {
                const contentLength = parseInt(request.headers['content-length'], 10);
                if (contentLength > validationOptions.maxSize) {
                    validationResult.errors.push(`Request size ${contentLength} exceeds maximum ${validationOptions.maxSize}`);
                }
            }
            
            // Compile validation results with success status and detailed error information
            validationResult.success = validationResult.errors.length === 0;
            validationResult.validatedData = validationResult.success ? normalizeRequestObject(request) : null;
            validationResult.performance.duration = performance.now() - validationResult.performance.startTime;
            
            // Log validation outcomes and any security warnings detected
            if (this.config.enableLogging && (validationResult.errors.length > 0 || validationResult.warnings.length > 0)) {
                this.logger.warn('Request validation completed with issues', {
                    errors: validationResult.errors,
                    warnings: validationResult.warnings,
                    securityChecks: validationResult.securityChecks
                });
            }
            
        } catch (error) {
            // Handle validation processing errors with comprehensive error tracking
            validationResult.errors.push(`Validation processing error: ${error.message}`);
            validationResult.success = false;
            
            if (this.config.enableLogging) {
                this.logger.error('Request validation failed with exception', { error: error.message }, error);
            }
        }
        
        // Return comprehensive validation result with success status and validated data
        return validationResult;
    }
    
    /**
     * Abstract method for handling HTTP method-specific request processing that must be 
     * implemented by derived controller classes. Provides interface definition for 
     * method-specific processing with standardized input and output contracts.
     * 
     * @abstract
     * @param {Object} request - HTTP request object with normalized structure and metadata
     * @param {Object} response - HTTP response object for client communication
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE) for specific handling
     * @returns {Object} HTTP method handling result with response data and processing status
     * @throws {Error} Throws error indicating abstract method must be implemented
     * 
     * @example
     * // Must be implemented in derived classes:
     * async handleHttpMethod(request, response, method) {
     *   switch(method) {
     *     case 'GET': return this.handleGet(request);
     *     case 'POST': return this.handlePost(request);
     *     default: throw new Error(`Unsupported method: ${method}`);
     *   }
     * }
     */
    async handleHttpMethod(request, response, method) {
        // Abstract method implementation required in derived controller classes
        throw new Error(`Abstract method handleHttpMethod must be implemented by ${this.controllerName}`);
    }
    
    /**
     * Generates standardized HTTP responses using response utilities with proper formatting, 
     * headers, and validation. Implements comprehensive response generation with metadata 
     * inclusion, validation, and proper HTTP protocol compliance.
     * 
     * @param {Object} responseData - Response data object containing content and metadata
     * @param {number} [statusCode=200] - HTTP status code for the response
     * @param {Object} [options={}] - Response generation options and additional metadata
     * @returns {Object} Formatted HTTP response object with headers, status, and content
     * 
     * @example
     * const response = await controller.generateResponse(
     *   { message: 'Success', data: userData },
     *   200,
     *   { correlationId: 'req_123' }
     * );
     */
    async generateResponse(responseData, statusCode = HTTP_STATUS_CODES.SUCCESS.OK, options = {}) {
        try {
            // Initialize response generation with timing and metadata tracking
            const responseGeneration = {
                startTime: performance.now(),
                statusCode: statusCode,
                options: options,
                correlationId: options.correlationId || generateRequestId('resp')
            };
            
            // Determine response type based on status code and content type
            let formattedResponse;
            if (statusCode >= 200 && statusCode < 300) {
                // Use createSuccessResponse utility for 2xx status codes with proper formatting
                formattedResponse = createSuccessResponse(responseData, statusCode, {
                    timestamp: new Date().toISOString(),
                    correlationId: responseGeneration.correlationId,
                    controller: this.controllerName,
                    version: this.version
                });
            } else {
                // Use createErrorResponse utility for 4xx and 5xx status codes with sanitization
                formattedResponse = createErrorResponse(
                    responseData.message || 'Request processing error',
                    statusCode,
                    {
                        correlationId: responseGeneration.correlationId,
                        controller: this.controllerName,
                        timestamp: new Date().toISOString()
                    }
                );
            }
            
            // Include controller-specific metadata in response headers
            if (!formattedResponse.headers) {
                formattedResponse.headers = {};
            }
            
            // Add correlation ID for request-response tracking and debugging
            formattedResponse.headers['X-Correlation-ID'] = responseGeneration.correlationId;
            formattedResponse.headers['X-Controller'] = this.controllerName;
            formattedResponse.headers['X-Controller-Version'] = this.version;
            formattedResponse.headers['Content-Type'] = 'application/json';
            
            // Apply response size limits and content validation checks
            const responseString = JSON.stringify(formattedResponse.body);
            if (responseString.length > this.config.maxRequestSize) {
                throw new Error('Response size exceeds maximum allowed limit');
            }
            
            // Validate response object using validateResponse utility function
            const validation = validateResponse(formattedResponse);
            if (!validation.valid) {
                throw new Error(`Response validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Include performance timing in response metadata
            const processingTime = performance.now() - responseGeneration.startTime;
            formattedResponse.headers['X-Processing-Time'] = `${processingTime.toFixed(2)}ms`;
            
            // Log response generation for monitoring and debugging
            if (this.config.enableLogging) {
                this.logger.debug('Response generated successfully', {
                    statusCode: statusCode,
                    correlationId: responseGeneration.correlationId,
                    processingTime: processingTime,
                    responseSize: responseString.length
                });
            }
            
            // Return complete response object ready for HTTP transmission
            return formattedResponse;
            
        } catch (error) {
            // Generate fallback error response if primary generation fails
            if (this.config.enableLogging) {
                this.logger.error('Response generation failed', { error: error.message }, error);
            }
            
            return createErrorResponse(
                'Internal response generation error',
                HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                {
                    correlationId: options.correlationId || generateRequestId('err'),
                    controller: this.controllerName,
                    error: 'response-generation-failed'
                }
            );
        }
    }
    
    /**
     * Handles controller errors with comprehensive error processing, classification, and 
     * secure error response generation. Implements multi-layer error handling with 
     * logging, metrics, and secure response generation.
     * 
     * @param {Error} error - Error object with message, stack trace, and error details
     * @param {Object} request - HTTP request object for error context and correlation
     * @param {Object} response - HTTP response object for sending error responses
     * @param {Object} [context={}] - Request processing context and correlation information
     * @returns {void} Processes error and sends appropriate HTTP error response to client
     * 
     * @example
     * // Called automatically by processRequest or manually for error handling
     * await controller.handleError(error, request, response, context);
     */
    async handleError(error, request, response, context = {}) {
        try {
            // Generate error correlation ID for tracking and debugging across services
            const errorCorrelationId = context.requestId || generateRequestId('err');
            
            // Create comprehensive error context for processing and logging
            const errorContext = {
                correlationId: errorCorrelationId,
                controllerName: this.controllerName,
                timestamp: new Date().toISOString(),
                requestMethod: request?.method,
                requestUrl: request?.url,
                userAgent: request?.headers?.['user-agent'],
                ...context
            };
            
            // Use ErrorHandler.handleError for comprehensive error processing
            let processedError;
            if (this.errorHandler && this.errorHandler.handleError) {
                processedError = await this.errorHandler.handleError(error, errorContext);
            } else {
                // Fallback error processing if ErrorHandler is unavailable
                processedError = this._fallbackErrorProcessing(error, errorContext);
            }
            
            // Use BaseService.handleError for service-level error coordination
            if (this.baseService && this.baseService.handleError) {
                await this.baseService.handleError(error, errorContext);
            }
            
            // Classify error type and severity for appropriate response strategy
            const errorClassification = this._classifyError(error);
            
            // Determine appropriate HTTP status code based on error type
            const statusCode = this._determineErrorStatusCode(error, errorClassification);
            
            // Create secure error response without sensitive information disclosure
            const errorResponse = await this.generateResponse(
                {
                    error: processedError.sanitizedMessage || 'An error occurred processing your request',
                    correlationId: errorCorrelationId,
                    timestamp: new Date().toISOString()
                },
                statusCode,
                { correlationId: errorCorrelationId }
            );
            
            // Update controller error metrics and statistics for monitoring
            this._updateErrorMetrics(error, errorClassification, statusCode);
            
            // Log error details with context for debugging and analysis
            if (this.config.enableLogging) {
                this.logger.logError(error, errorContext, errorCorrelationId);
            }
            
            // Send formatted error response to client with proper status code
            if (response && !response.headersSent) {
                response.writeHead(errorResponse.statusCode, errorResponse.headers);
                response.end(JSON.stringify(errorResponse.body));
            }
            
        } catch (handlingError) {
            // Fallback error handling if primary error handling fails
            console.error('Error handling failed:', handlingError.message);
            console.error('Original error:', error.message);
            
            // Send minimal error response to prevent request hanging
            if (response && !response.headersSent) {
                response.writeHead(HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    error: 'Internal server error',
                    correlationId: generateRequestId('fallback')
                }));
            }
        }
    }
    
    /**
     * Logs controller operation details with structured format for monitoring, debugging, 
     * and performance tracking. Provides comprehensive operation logging with context, 
     * correlation IDs, and performance metrics.
     * 
     * @param {string} operation - Operation name or identifier for categorization and tracking
     * @param {Object} [details={}] - Operation details and context information for logging
     * @param {string} [level='INFO'] - Log level for the operation (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
     * @returns {void} Logs operation information to configured logger with controller context
     * 
     * @example
     * controller.logOperation('validateRequest', { requestId: 'req_123', duration: 45 }, 'DEBUG');
     */
    logOperation(operation, details = {}, level = 'INFO') {
        try {
            // Check if logging is enabled via controller configuration flags
            if (!this.config.enableLogging || !this.logger) {
                return; // Skip logging if disabled or logger unavailable
            }
            
            // Format operation details with controller context and metadata
            const operationDetails = {
                operation: operation,
                controller: this.controllerName,
                version: this.version,
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime.getTime(),
                ...details
            };
            
            // Include correlation ID and timing information for request tracking
            if (details.correlationId || details.requestId) {
                operationDetails.correlationId = details.correlationId || details.requestId;
            }
            
            // Add controller identification and version information to log entry
            operationDetails.controllerMetadata = {
                name: this.controllerName,
                version: this.version,
                initialized: this.startTime.toISOString(),
                isHealthy: this.isHealthy()
            };
            
            // Use BaseService.logOperation for consistent service layer logging
            if (this.baseService && this.baseService.logOperation) {
                this.baseService.logOperation(`Controller.${operation}`, operationDetails, level);
            }
            
            // Use appropriate log level based on operation type and severity
            switch (level.toUpperCase()) {
                case 'TRACE':
                    this.logger.trace(`Controller operation: ${operation}`, operationDetails);
                    break;
                case 'DEBUG':
                    this.logger.debug(`Controller operation: ${operation}`, operationDetails);
                    break;
                case 'INFO':
                    this.logger.info(`Controller operation: ${operation}`, operationDetails);
                    break;
                case 'WARN':
                    this.logger.warn(`Controller operation: ${operation}`, operationDetails);
                    break;
                case 'ERROR':
                    this.logger.error(`Controller operation: ${operation}`, operationDetails);
                    break;
                case 'FATAL':
                    this.logger.fatal(`Controller operation: ${operation}`, operationDetails);
                    break;
                default:
                    this.logger.info(`Controller operation: ${operation}`, operationDetails);
            }
            
            // Update operation metrics and statistics for performance monitoring
            this._updateOperationMetrics(operation, details);
            
        } catch (error) {
            // Fallback logging if primary logging fails
            console.error(`Failed to log operation ${operation}:`, error.message);
        }
    }
    
    /**
     * Measures and tracks controller operation performance with timing metrics and threshold 
     * monitoring for optimization. Provides comprehensive performance measurement with 
     * execution timing, resource monitoring, and threshold alerting.
     * 
     * @param {string} operationName - Name of operation to measure for identification and categorization
     * @param {Function} operation - Function to execute and measure for performance analysis
     * @param {Object} [options={}] - Performance measurement options and thresholds
     * @returns {Object} Performance measurement result with timing data and operation outcome
     * 
     * @example
     * const result = await controller.measurePerformance('processData', async () => {
     *   return await processUserData(userData);
     * }, { warnThreshold: 100 });
     */
    async measurePerformance(operationName, operation, options = {}) {
        try {
            // Check if performance tracking is enabled via configuration
            if (!this.config.enableMetrics) {
                // Execute operation without measurement if metrics disabled
                return await operation();
            }
            
            // Use measureControllerPerformance function for standardized measurement
            const performanceResult = await measureControllerPerformance(
                operationName, 
                operation, 
                {
                    controller: this.controllerName,
                    thresholds: {
                        warning: options.warnThreshold || CONTROLLER_PERFORMANCE_THRESHOLDS.warning_threshold_ms,
                        critical: options.criticalThreshold || CONTROLLER_PERFORMANCE_THRESHOLDS.critical_threshold_ms
                    },
                    ...options
                }
            );
            
            // Use BaseService.measurePerformance for service layer coordination
            if (this.baseService && this.baseService.measurePerformance) {
                await this.baseService.measurePerformance(
                    `Controller.${operationName}`,
                    async () => performanceResult.result,
                    options
                );
            }
            
            // Compare execution time against controller performance thresholds
            const duration = performanceResult.duration;
            if (duration > CONTROLLER_PERFORMANCE_THRESHOLDS.critical_threshold_ms) {
                this.logOperation(`Critical performance threshold exceeded for ${operationName}`, {
                    duration: duration,
                    threshold: CONTROLLER_PERFORMANCE_THRESHOLDS.critical_threshold_ms,
                    severity: 'critical'
                }, 'ERROR');
            } else if (duration > CONTROLLER_PERFORMANCE_THRESHOLDS.warning_threshold_ms) {
                this.logOperation(`Performance warning threshold exceeded for ${operationName}`, {
                    duration: duration,
                    threshold: CONTROLLER_PERFORMANCE_THRESHOLDS.warning_threshold_ms,
                    severity: 'warning'
                }, 'WARN');
            }
            
            // Update controller performance metrics including request processing statistics
            this._updatePerformanceMetrics(operationName, performanceResult);
            
            // Log performance information if measurement indicates issues
            if (this.config.enableLogging && performanceResult.thresholds.exceeded.length > 0) {
                this.logger.warn(`Performance thresholds exceeded for ${operationName}`, {
                    operation: operationName,
                    duration: duration,
                    thresholds: performanceResult.thresholds,
                    memoryUsage: performanceResult.memoryUsage
                });
            }
            
            // Return operation result (not the performance measurement wrapper)
            if (performanceResult.error) {
                throw performanceResult.error;
            }
            
            // Return performance measurement result with timing data and operation outcome
            return performanceResult;
            
        } catch (error) {
            // Log performance measurement failure and re-throw original error
            this.logOperation(`Performance measurement failed for ${operationName}`, {
                error: error.message,
                operation: operationName
            }, 'ERROR');
            throw error;
        }
    }
    
    /**
     * Returns comprehensive controller information including metadata, configuration, 
     * capabilities, and operational status for monitoring. Provides complete controller 
     * introspection for debugging, monitoring, and documentation purposes.
     * 
     * @returns {Object} Controller information with metadata, capabilities, and status
     * 
     * @example
     * const info = controller.getControllerInfo();
     * console.log(info.capabilities); // Array of controller capabilities
     * console.log(info.status.isHealthy); // Current health status
     */
    getControllerInfo() {
        try {
            // Compile controller identification metadata including name and version
            const identificationInfo = {
                name: this.controllerName,
                version: this.version,
                type: 'BaseController',
                abstract: true,
                initialized: this.startTime.toISOString()
            };
            
            // Include controller configuration and feature flags status
            const configurationInfo = {
                enableValidation: this.config.enableValidation,
                enableLogging: this.config.enableLogging,
                enableMetrics: this.config.enableMetrics,
                enableErrorHandling: this.config.enableErrorHandling,
                requestTimeout: this.config.requestTimeout,
                maxRequestSize: this.config.maxRequestSize
            };
            
            // Add operational status including uptime and initialization state
            const currentTime = new Date();
            const uptimeMs = currentTime.getTime() - this.startTime.getTime();
            const operationalStatus = {
                isInitialized: this.isInitialized,
                isHealthy: this.isHealthy(),
                uptime: {
                    milliseconds: uptimeMs,
                    seconds: Math.floor(uptimeMs / 1000),
                    formatted: this._formatUptime(uptimeMs)
                },
                startTime: this.startTime.toISOString(),
                currentTime: currentTime.toISOString()
            };
            
            // Include performance metrics summary and health indicators
            const performanceInfo = this.getPerformanceMetrics();
            
            // Add controller capabilities and supported HTTP methods
            const capabilities = this._getControllerCapabilities();
            
            // Include service layer integration status and health information
            const integrationStatus = {
                baseService: {
                    available: !!this.baseService,
                    healthy: this.baseService ? this.baseService.isHealthy() : false
                },
                errorHandler: {
                    available: !!this.errorHandler,
                    healthy: !!this.errorHandler
                },
                logger: {
                    available: !!this.logger,
                    level: this.logger ? this.logger.logLevel : 'unknown'
                }
            };
            
            // Return comprehensive controller information for monitoring and documentation
            return {
                identification: identificationInfo,
                configuration: configurationInfo,
                status: operationalStatus,
                performance: performanceInfo,
                capabilities: capabilities,
                integration: integrationStatus,
                metadata: this.controllerMetadata,
                metrics: {
                    summary: {
                        totalRequests: this.controllerMetrics.requestCount,
                        successfulRequests: this.controllerMetrics.successfulRequests,
                        failedRequests: this.controllerMetrics.failedRequests,
                        averageResponseTime: this.controllerMetrics.averageResponseTime
                    }
                }
            };
            
        } catch (error) {
            // Return error information if introspection fails
            return {
                error: 'Failed to retrieve controller information',
                message: error.message,
                controllerName: this.controllerName || 'unknown',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Performs comprehensive health check for controller including dependencies, configuration, 
     * and operational status validation. Implements multi-layer health assessment with 
     * dependency checking and operational readiness validation.
     * 
     * @returns {boolean} True if controller is healthy and operational, false otherwise
     * 
     * @example
     * if (controller.isHealthy()) {
     *   console.log('Controller is ready to handle requests');
     * } else {
     *   console.log('Controller has health issues');
     * }
     */
    isHealthy() {
        try {
            // Check controller initialization status and configuration validity
            if (!this.isInitialized) {
                return false;
            }
            
            // Validate logger functionality and logging capabilities
            if (this.config.enableLogging && !this.logger) {
                return false;
            }
            
            // Check BaseService health using BaseService.isHealthy method
            if (this.baseService && typeof this.baseService.isHealthy === 'function') {
                if (!this.baseService.isHealthy()) {
                    return false;
                }
            }
            
            // Validate ErrorHandler functionality and error processing capabilities
            if (this.config.enableErrorHandling && !this.errorHandler) {
                return false;
            }
            
            // Check performance metrics tracking and data collection systems
            if (this.config.enableMetrics && !this.controllerMetrics) {
                return false;
            }
            
            // Verify controller dependencies and external resource availability
            const criticalComponents = [
                this.config,
                this.controllerName,
                this.version,
                this.controllerMetadata
            ];
            
            if (criticalComponents.some(component => !component)) {
                return false;
            }
            
            // Validate controller-specific health requirements and operational readiness
            const memoryUsage = process.memoryUsage();
            const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
            
            // Check if memory usage is within acceptable limits
            if (heapUsedMB > CONTROLLER_PERFORMANCE_THRESHOLDS.memory_critical_mb * 2) {
                return false;
            }
            
            // Return overall health status based on all validation checks
            return true;
            
        } catch (error) {
            // Return unhealthy if health check fails
            if (this.logger) {
                this.logger.error('Health check failed', { error: error.message }, error);
            }
            return false;
        }
    }
    
    /**
     * Retrieves comprehensive performance metrics for controller operations including timing, 
     * throughput, and error statistics. Provides detailed performance analysis for monitoring, 
     * optimization, and capacity planning.
     * 
     * @returns {Object} Performance metrics with operation statistics and health indicators
     * 
     * @example
     * const metrics = controller.getPerformanceMetrics();
     * console.log(`Average response time: ${metrics.averageResponseTime}ms`);
     * console.log(`Success rate: ${metrics.successRate}%`);
     */
    getPerformanceMetrics() {
        try {
            // Get base service performance metrics using BaseService.getPerformanceMetrics
            let serviceMetrics = {};
            if (this.baseService && typeof this.baseService.getPerformanceMetrics === 'function') {
                serviceMetrics = this.baseService.getPerformanceMetrics();
            }
            
            // Compile controller request processing metrics including timing and throughput
            const requestMetrics = {
                totalRequests: this.controllerMetrics.requestCount,
                successfulRequests: this.controllerMetrics.successfulRequests,
                failedRequests: this.controllerMetrics.failedRequests,
                successRate: this.controllerMetrics.requestCount > 0 ? 
                    ((this.controllerMetrics.successfulRequests / this.controllerMetrics.requestCount) * 100).toFixed(2) : 0,
                averageResponseTime: this.controllerMetrics.averageResponseTime,
                totalResponseTime: this.controllerMetrics.totalResponseTime
            };
            
            // Include error statistics including error rates and failure patterns
            const errorStats = {
                totalErrors: this.controllerMetrics.failedRequests,
                errorsByType: { ...this.controllerMetrics.errorsByType },
                errorRate: this.controllerMetrics.requestCount > 0 ?
                    ((this.controllerMetrics.failedRequests / this.controllerMetrics.requestCount) * 100).toFixed(2) : 0
            };
            
            // Add memory usage and resource consumption metrics for controller operations
            const currentMemory = process.memoryUsage();
            const memoryMetrics = {
                current: {
                    rss: Math.round(currentMemory.rss / 1024 / 1024), // MB
                    heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024), // MB
                    external: Math.round(currentMemory.external / 1024 / 1024) // MB
                },
                history: [...this.controllerMetrics.memoryUsage]
            };
            
            // Calculate controller uptime and availability statistics
            const uptimeMs = Date.now() - this.startTime.getTime();
            const uptimeStats = {
                uptimeMs: uptimeMs,
                uptimeSeconds: Math.floor(uptimeMs / 1000),
                startTime: this.startTime.toISOString(),
                availability: this.isHealthy() ? 'available' : 'degraded'
            };
            
            // Include performance trend data for monitoring and optimization
            const performanceTrends = {
                recentPerformance: [...this.controllerMetrics.performanceHistory],
                statusCodeDistribution: { ...this.controllerMetrics.statusCodeCounts }
            };
            
            // Return comprehensive performance metrics for monitoring systems
            return {
                summary: {
                    controllerName: this.controllerName,
                    version: this.version,
                    isHealthy: this.isHealthy(),
                    timestamp: new Date().toISOString()
                },
                requests: requestMetrics,
                errors: errorStats,
                memory: memoryMetrics,
                uptime: uptimeStats,
                trends: performanceTrends,
                serviceLayer: serviceMetrics,
                thresholds: CONTROLLER_PERFORMANCE_THRESHOLDS
            };
            
        } catch (error) {
            // Return error metrics if collection fails
            return {
                error: 'Failed to collect performance metrics',
                message: error.message,
                timestamp: new Date().toISOString(),
                controllerName: this.controllerName
            };
        }
    }
    
    /**
     * Performs graceful controller shutdown with resource cleanup and operation completion 
     * for clean termination. Implements comprehensive shutdown process with dependency 
     * cleanup and final state persistence.
     * 
     * @param {Object} [shutdownOptions={}] - Shutdown configuration and cleanup options
     * @returns {Promise} Promise that resolves when controller shutdown is complete
     * 
     * @example
     * await controller.shutdown({ 
     *   gracePeriod: 5000, 
     *   saveMetrics: true 
     * });
     */
    async shutdown(shutdownOptions = {}) {
        try {
            // Set default shutdown options and validate shutdown request
            const options = {
                gracePeriod: 5000,
                saveMetrics: true,
                flushLogs: true,
                ...shutdownOptions
            };
            
            // Log controller shutdown initiation with reason and context
            const shutdownContext = {
                controllerName: this.controllerName,
                version: this.version,
                shutdownOptions: options,
                timestamp: new Date().toISOString(),
                uptime: Date.now() - this.startTime.getTime()
            };
            
            if (this.config.enableLogging && this.logger) {
                this.logger.info('Controller shutdown initiated', shutdownContext);
            }
            
            // Mark controller as shutting down to prevent new requests
            this.isInitialized = false;
            
            // Allow grace period for completing pending HTTP requests with timeout
            if (options.gracePeriod > 0) {
                await new Promise(resolve => setTimeout(resolve, Math.min(options.gracePeriod, 10000)));
            }
            
            // Shutdown BaseService using BaseService.shutdown method
            if (this.baseService && typeof this.baseService.shutdown === 'function') {
                await this.baseService.shutdown({
                    timeout: options.gracePeriod / 2
                });
            }
            
            // Clean up controller resources including timers and connections
            if (this.controllerMetrics) {
                // Save final metrics if requested
                if (options.saveMetrics) {
                    const finalMetrics = this.getPerformanceMetrics();
                    if (this.logger) {
                        this.logger.info('Final controller metrics', finalMetrics);
                    }
                }
                
                // Clear metrics arrays to free memory
                this.controllerMetrics.performanceHistory = [];
                this.controllerMetrics.memoryUsage = [];
            }
            
            // Flush pending logs and ensure all log entries are written
            if (options.flushLogs && this.logger && typeof this.logger.flush === 'function') {
                await this.logger.flush();
            }
            
            // Update controller status to shutdown and mark as unavailable
            this.controllerMetadata.shutdownTime = new Date().toISOString();
            this.controllerMetadata.status = 'shutdown';
            
            // Perform final performance metrics collection and reporting
            const shutdownDuration = Date.now() - new Date(shutdownContext.timestamp).getTime();
            
            // Log successful shutdown completion with final statistics
            if (this.config.enableLogging && this.logger) {
                this.logger.info('Controller shutdown completed successfully', {
                    controllerName: this.controllerName,
                    shutdownDuration: shutdownDuration,
                    finalUptime: Date.now() - this.startTime.getTime(),
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            // Log shutdown errors but don't throw to allow process termination
            console.error(`Controller shutdown failed for ${this.controllerName}:`, error.message);
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Initializes fallback components when primary initialization fails.
     * @private
     */
    _initializeFallbackComponents() {
        // Create minimal logger fallback
        this.logger = {
            info: (msg, data) => console.log('INFO:', msg, data),
            debug: (msg, data) => console.log('DEBUG:', msg, data),
            warn: (msg, data) => console.warn('WARN:', msg, data),
            error: (msg, data, err) => console.error('ERROR:', msg, data, err),
            logHttpRequest: () => {},
            logHttpResponse: () => {},
            logError: () => {}
        };
        
        // Create minimal service fallback
        this.baseService = {
            validateInput: async () => ({ success: true }),
            handleError: async () => {},
            isHealthy: () => true,
            shutdown: async () => {}
        };
        
        // Create minimal error handler fallback
        this.errorHandler = {
            handleError: async (error) => ({ sanitizedMessage: error.message })
        };
    }
    
    /**
     * Gets controller capabilities based on configuration and features.
     * @private
     */
    _getControllerCapabilities() {
        const capabilities = ['http-processing', 'error-handling'];
        
        if (this.config.enableValidation) capabilities.push('request-validation');
        if (this.config.enableLogging) capabilities.push('logging');
        if (this.config.enableMetrics) capabilities.push('performance-monitoring');
        if (this.config.enableErrorHandling) capabilities.push('comprehensive-error-handling');
        
        return capabilities;
    }
    
    /**
     * Validates HTTP protocol compliance for incoming requests.
     * @private
     */
    _validateHttpProtocolCompliance(request) {
        const result = { valid: true, errors: [] };
        
        // Check required HTTP properties
        if (!request.method) {
            result.errors.push('Missing HTTP method');
        }
        
        if (!request.url) {
            result.errors.push('Missing request URL');
        }
        
        if (!request.headers || typeof request.headers !== 'object') {
            result.errors.push('Invalid or missing headers');
        }
        
        result.valid = result.errors.length === 0;
        return result;
    }
    
    /**
     * Performs security validation on request objects.
     * @private
     */
    _performSecurityValidation(request) {
        const result = {
            checksPerformed: 0,
            checksFailed: 0,
            warnings: [],
            errors: []
        };
        
        // Check for path traversal attempts
        if (request.url && request.url.includes('..')) {
            result.errors.push('Path traversal attempt detected');
            result.checksFailed++;
        }
        result.checksPerformed++;
        
        // Check for suspicious headers
        if (request.headers) {
            Object.keys(request.headers).forEach(header => {
                if (header.includes('<script') || header.includes('javascript:')) {
                    result.warnings.push(`Suspicious header content: ${header}`);
                }
            });
            result.checksPerformed++;
        }
        
        return result;
    }
    
    /**
     * Classifies errors for appropriate handling.
     * @private
     */
    _classifyError(error) {
        if (error.name === 'ValidationError') return 'validation';
        if (error.name === 'TypeError') return 'type';
        if (error.name === 'ReferenceError') return 'reference';
        if (error.message.includes('timeout')) return 'timeout';
        if (error.message.includes('network')) return 'network';
        return 'generic';
    }
    
    /**
     * Determines HTTP status code based on error type.
     * @private
     */
    _determineErrorStatusCode(error, classification) {
        switch (classification) {
            case 'validation': return HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
            case 'timeout': return HTTP_STATUS_CODES.CLIENT_ERROR.REQUEST_TIMEOUT;
            case 'network': return HTTP_STATUS_CODES.SERVER_ERROR.BAD_GATEWAY;
            default: return HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        }
    }
    
    /**
     * Fallback error processing when ErrorHandler is unavailable.
     * @private
     */
    _fallbackErrorProcessing(error, context) {
        return {
            sanitizedMessage: 'An error occurred processing your request',
            correlationId: context.correlationId,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Updates success metrics for monitoring.
     * @private
     */
    _updateSuccessMetrics(duration) {
        this.controllerMetrics.requestCount++;
        this.controllerMetrics.successfulRequests++;
        this.controllerMetrics.totalResponseTime += duration;
        this.controllerMetrics.averageResponseTime = 
            this.controllerMetrics.totalResponseTime / this.controllerMetrics.requestCount;
    }
    
    /**
     * Updates failure metrics for monitoring.
     * @private
     */
    _updateFailureMetrics(duration, error) {
        this.controllerMetrics.requestCount++;
        this.controllerMetrics.failedRequests++;
        this.controllerMetrics.totalResponseTime += duration;
        this.controllerMetrics.averageResponseTime = 
            this.controllerMetrics.totalResponseTime / this.controllerMetrics.requestCount;
        
        const errorType = error.constructor.name;
        this.controllerMetrics.errorsByType[errorType] = 
            (this.controllerMetrics.errorsByType[errorType] || 0) + 1;
    }
    
    /**
     * Updates error metrics for monitoring.
     * @private
     */
    _updateErrorMetrics(error, classification, statusCode) {
        this.controllerMetrics.errorsByType[classification] = 
            (this.controllerMetrics.errorsByType[classification] || 0) + 1;
        
        this.controllerMetrics.statusCodeCounts[statusCode] = 
            (this.controllerMetrics.statusCodeCounts[statusCode] || 0) + 1;
    }
    
    /**
     * Updates operation metrics for monitoring.
     * @private
     */
    _updateOperationMetrics(operation, details) {
        // Track operation performance history
        if (details.duration) {
            this.controllerMetrics.performanceHistory.push({
                operation: operation,
                duration: details.duration,
                timestamp: new Date().toISOString()
            });
            
            // Keep only recent history
            if (this.controllerMetrics.performanceHistory.length > 100) {
                this.controllerMetrics.performanceHistory.shift();
            }
        }
    }
    
    /**
     * Updates performance metrics for monitoring.
     * @private
     */
    _updatePerformanceMetrics(operationName, performanceResult) {
        // Add to performance history
        this.controllerMetrics.performanceHistory.push({
            operation: operationName,
            duration: performanceResult.duration,
            success: performanceResult.success,
            memoryUsage: performanceResult.memoryUsage,
            timestamp: new Date().toISOString()
        });
        
        // Track memory usage
        if (performanceResult.memoryUsage) {
            this.controllerMetrics.memoryUsage.push({
                heapUsed: performanceResult.memoryUsage.heapUsed,
                timestamp: new Date().toISOString()
            });
            
            // Keep only recent memory usage
            if (this.controllerMetrics.memoryUsage.length > 50) {
                this.controllerMetrics.memoryUsage.shift();
            }
        }
    }
    
    /**
     * Formats uptime duration for human readability.
     * @private
     */
    _formatUptime(uptimeMs) {
        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
    // Main BaseController class for extension by concrete controllers
    BaseController,
    
    // Utility functions for controller operations and request processing
    generateRequestId,
    createControllerContext,
    measureControllerPerformance,
    validateControllerConfig,
    
    // Configuration constants for controller initialization
    BASE_CONTROLLER_CONFIG,
    DEFAULT_CONTROLLER_METADATA,
    CONTROLLER_PERFORMANCE_THRESHOLDS
};