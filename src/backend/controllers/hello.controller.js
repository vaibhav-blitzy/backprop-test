/**
 * HTTP Controller Class for Hello World Endpoint Requests in Node.js Tutorial Application
 * 
 * Extends BaseController to provide specialized request handling for the GET /hello endpoint,
 * coordinating with HelloService for business logic processing and implementing proper HTTP
 * response generation. Demonstrates controller layer patterns including request validation,
 * service integration, response formatting, and educational clarity with production-ready
 * implementation patterns for the tutorial application's primary endpoint functionality.
 * 
 * This HelloController implements a comprehensive HTTP controller architecture that showcases:
 * - MVC pattern implementation with clear separation of concerns between controller and service layers
 * - Production-ready error handling with comprehensive error classification and secure error responses
 * - Request validation and security measures including input sanitization and attack prevention
 * - Performance monitoring with request timing, memory usage tracking, and operational metrics
 * - Structured logging with correlation IDs, contextual information, and debugging capabilities
 * - HTTP protocol compliance with proper status codes, headers, and response formatting
 * - Educational patterns demonstrating enterprise-grade Node.js controller implementation
 * 
 * Educational Objectives:
 * - Demonstrates proper HTTP controller implementation patterns and best practices
 * - Shows integration between controller and service layers following MVC architecture
 * - Illustrates comprehensive error handling strategies for production-ready applications
 * - Provides examples of request validation and security-conscious input processing
 * - Shows performance monitoring and observability patterns for Node.js applications
 * - Demonstrates structured logging and debugging techniques for enterprise applications
 * 
 * @fileoverview HTTP controller for handling Hello World endpoint requests with comprehensive error handling and monitoring
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import base controller class providing common controller functionality and abstract methods
import { BaseController } from './base.controller.js';

// Import hello service for business logic processing and hello-specific operations
import { HelloService } from '../services/hello.service.js';

// Import response utilities for creating standardized HTTP response objects with proper formatting
import { 
    createHelloResponse, 
    createSuccessResponse, 
    createErrorResponse 
} from '../utils/response-utils.js';

// Import HTTP status code constants for proper response status management and error classification
import { 
    HTTP_STATUS_CODES,
    isValidStatusCode 
} from '../utils/http-status.js';

// Import HTTP method constants for method validation and authorization
import { HTTP_METHODS } from '../constants/http-methods.js';

// Import standardized error message constants for consistent error communication
import { ERROR_MESSAGES } from '../constants/error-messages.js';

// Import standard response message constants for consistent hello controller responses
import { RESPONSE_MESSAGES } from '../constants/response-messages.js';

// Import performance measurement APIs for hello controller operation timing and metrics
import { performance } from 'node:perf_hooks'; // Node.js v20.x - Built-in performance measurement APIs

// Import comprehensive logging utility for structured logging and monitoring
import { logger } from '../utils/logger.js';

// Import request validation utilities for security-focused validation and input sanitization
import { RequestValidator } from '../utils/validation.js';

// Import request type validation for comprehensive request validation and security checks
import { RequestTypeValidator } from '../types/request.types.js';

// Import centralized error handling for comprehensive error processing and classification
import { ErrorHandler } from '../lib/error-handler.js';

// ============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Hello controller configuration object containing operational parameters, feature flags,
 * and behavioral settings for the Hello endpoint controller implementation.
 */
const HELLO_CONTROLLER_CONFIG = {
    controllerName: 'HelloController',
    version: '1.0.0',
    endpointPath: '/hello',
    supportedMethods: ['GET'],
    responseContent: 'Hello world',
    enableValidation: true,
    enableLogging: true,
    enableMetrics: true,
    responseTimeTarget: 50  // Target response time in milliseconds
};

/**
 * Hello controller metadata providing categorization and documentation information
 * for controller identification and system integration.
 */
const HELLO_CONTROLLER_METADATA = {
    category: 'endpoint-controller',
    endpoint: 'hello',
    type: 'tutorial-controller',
    maintainer: 'tutorial-application',
    documentation: 'Hello endpoint controller implementation'
};

/**
 * Hello response templates defining standardized response structures for success
 * and error scenarios with consistent formatting and content.
 */
const HELLO_RESPONSE_TEMPLATES = {
    success_template: {
        status: 200,
        content: 'Hello world',
        contentType: 'text/plain'
    },
    error_templates: {
        not_found: {
            status: 404,
            message: 'Not Found'
        },
        method_not_allowed: {
            status: 405,
            message: 'Method Not Allowed'
        }
    }
};

// ============================================================================
// UTILITY FUNCTIONS FOR HELLO CONTROLLER OPERATIONS
// ============================================================================

/**
 * Validates incoming HTTP requests specifically for hello endpoint requirements including
 * method validation, path verification, and hello-specific authorization checks.
 * 
 * @param {Object} request - HTTP request object containing method, URL, headers, and connection information
 * @param {Object} validationOptions - Configuration options for validation behavior and rule enforcement
 * @returns {Object} Validation result specific to hello endpoint with success status, validated data, and error details
 */
async function validateHelloRequest(request, validationOptions = {}) {
    const validationStartTime = performance.now();
    const requestId = validationOptions.requestId || `hello-val-${Date.now()}`;
    
    try {
        logger.trace('Starting hello endpoint request validation', {
            requestId,
            method: request.method,
            url: request.url,
            validationOptions
        });
        
        // Initialize comprehensive validation result object
        const validationResult = {
            isValid: false,
            errors: [],
            warnings: [],
            validatedData: {},
            metadata: {
                requestId,
                validationType: 'hello-endpoint',
                startTime: new Date().toISOString()
            }
        };
        
        // Call parent validateRequest method for base HTTP request validation
        const requestValidator = new RequestValidator();
        const baseValidation = await requestValidator.validateRequest(request, {
            ...validationOptions,
            requestId
        });
        
        if (!baseValidation.isValid) {
            validationResult.errors.push(...baseValidation.errors);
            logger.warn('Base request validation failed for hello endpoint', {
                requestId,
                errors: baseValidation.errors
            });
        }
        
        // Use HelloService.validateRequest for hello-specific business logic validation
        const helloService = new HelloService();
        const serviceValidation = await helloService.validateRequest(request, {
            requestId,
            endpointPath: HELLO_CONTROLLER_CONFIG.endpointPath
        });
        
        if (!serviceValidation.isValid) {
            validationResult.errors.push(...serviceValidation.errors);
            logger.warn('Hello service validation failed', {
                requestId,
                serviceErrors: serviceValidation.errors
            });
        }
        
        // Validate HTTP method matches HTTP_METHODS.GET for hello endpoint authorization
        if (request.method !== HTTP_METHODS.GET) {
            validationResult.errors.push({
                type: 'method_validation',
                message: ERROR_MESSAGES.HELLO_METHOD_ERROR,
                expectedMethod: HTTP_METHODS.GET,
                actualMethod: request.method
            });
            
            logger.warn('Invalid HTTP method for hello endpoint', {
                requestId,
                expectedMethod: HTTP_METHODS.GET,
                actualMethod: request.method
            });
        }
        
        // Validate request URL path matches HELLO_CONTROLLER_CONFIG.endpointPath exactly
        const requestPath = request.url?.split('?')[0]; // Remove query parameters
        if (requestPath !== HELLO_CONTROLLER_CONFIG.endpointPath) {
            validationResult.errors.push({
                type: 'path_validation',
                message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
                expectedPath: HELLO_CONTROLLER_CONFIG.endpointPath,
                actualPath: requestPath
            });
            
            logger.warn('Invalid request path for hello endpoint', {
                requestId,
                expectedPath: HELLO_CONTROLLER_CONFIG.endpointPath,
                actualPath: requestPath
            });
        }
        
        // Perform hello endpoint specific security validation to prevent attack attempts
        const typeValidator = new RequestTypeValidator();
        const securityValidation = await typeValidator.validateRequest(request, {
            schema: 'HELLO_REQUEST',
            requestId
        });
        
        if (!securityValidation.isValid) {
            validationResult.errors.push(...securityValidation.errors);
            logger.warn('Hello endpoint security validation failed', {
                requestId,
                securityErrors: securityValidation.errors
            });
        }
        
        // Apply hello controller validation rules and business logic constraints
        if (request.headers && request.headers['content-length'] && 
            parseInt(request.headers['content-length']) > 0) {
            validationResult.warnings.push({
                type: 'unexpected_content',
                message: 'Hello endpoint does not expect request body content'
            });
        }
        
        // Compile comprehensive validation results with success status
        validationResult.isValid = validationResult.errors.length === 0;
        validationResult.validatedData = {
            method: request.method,
            path: requestPath,
            headers: request.headers,
            timestamp: new Date().toISOString()
        };
        
        // Calculate validation performance metrics
        const validationDuration = performance.now() - validationStartTime;
        validationResult.metadata.duration = `${validationDuration.toFixed(2)}ms`;
        validationResult.metadata.endTime = new Date().toISOString();
        
        logger.debug('Hello endpoint validation completed', {
            requestId,
            isValid: validationResult.isValid,
            errorCount: validationResult.errors.length,
            warningCount: validationResult.warnings.length,
            duration: validationResult.metadata.duration
        });
        
        return validationResult;
        
    } catch (error) {
        const validationDuration = performance.now() - validationStartTime;
        
        logger.error('Hello endpoint validation failed with exception', {
            requestId,
            error: error.message,
            duration: `${validationDuration.toFixed(2)}ms`
        }, error);
        
        return {
            isValid: false,
            errors: [{
                type: 'validation_exception',
                message: 'Internal validation error',
                details: error.message
            }],
            warnings: [],
            validatedData: {},
            metadata: {
                requestId,
                validationType: 'hello-endpoint',
                duration: `${validationDuration.toFixed(2)}ms`,
                error: true
            }
        };
    }
}

/**
 * Generates hello controller specific response objects using service layer results and
 * response utilities for consistent HTTP response formatting.
 * 
 * @param {Object} serviceResult - HelloService execution result containing response data and status
 * @param {Object} responseOptions - Configuration options for response generation and formatting
 * @returns {Object} Formatted hello controller response with HTTP status, headers, and content ready for transmission
 */
async function generateHelloControllerResponse(serviceResult, responseOptions = {}) {
    const responseStartTime = performance.now();
    const requestId = responseOptions.requestId || `hello-resp-${Date.now()}`;
    
    try {
        logger.trace('Starting hello controller response generation', {
            requestId,
            serviceResult: {
                success: serviceResult.success,
                statusCode: serviceResult.statusCode
            },
            responseOptions
        });
        
        // Extract hello response data from HelloService execution result
        const responseData = {
            content: serviceResult.content || RESPONSE_MESSAGES.HELLO_WORLD,
            statusCode: serviceResult.statusCode || HTTP_STATUS_CODES.SUCCESS.OK,
            headers: serviceResult.headers || {},
            metadata: serviceResult.metadata || {}
        };
        
        // Use createHelloResponse utility for specialized hello world response formatting
        let formattedResponse;
        if (serviceResult.success && responseData.statusCode === HTTP_STATUS_CODES.SUCCESS.OK) {
            formattedResponse = createHelloResponse({
                content: responseData.content,
                requestId,
                timestamp: new Date().toISOString()
            });
        } else {
            // Use createErrorResponse for error scenarios
            formattedResponse = createErrorResponse({
                statusCode: responseData.statusCode,
                message: responseData.content || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                requestId,
                timestamp: new Date().toISOString()
            });
        }
        
        // Set HTTP status code to HTTP_STATUS_CODES.SUCCESS.OK for successful responses
        if (serviceResult.success) {
            formattedResponse.statusCode = HTTP_STATUS_CODES.SUCCESS.OK;
            formattedResponse.status = 'success';
        }
        
        // Apply hello controller specific headers and metadata for response identification
        formattedResponse.headers = {
            ...formattedResponse.headers,
            'X-Controller': HELLO_CONTROLLER_CONFIG.controllerName,
            'X-Controller-Version': HELLO_CONTROLLER_CONFIG.version,
            'X-Endpoint': HELLO_CONTROLLER_CONFIG.endpointPath,
            'Content-Type': 'text/plain; charset=utf-8'
        };
        
        // Include correlation ID and performance timing information for request tracking
        if (requestId) {
            formattedResponse.headers['X-Request-ID'] = requestId;
        }
        
        // Calculate response generation performance metrics
        const responseDuration = performance.now() - responseStartTime;
        formattedResponse.headers['X-Response-Time'] = `${responseDuration.toFixed(2)}ms`;
        
        // Add hello endpoint information for request-response tracking
        formattedResponse.metadata = {
            ...formattedResponse.metadata,
            controller: HELLO_CONTROLLER_CONFIG.controllerName,
            endpoint: HELLO_CONTROLLER_CONFIG.endpointPath,
            requestId,
            generationTime: responseDuration,
            timestamp: new Date().toISOString()
        };
        
        // Validate response object using response utilities for HTTP compliance
        if (!isValidStatusCode(formattedResponse.statusCode)) {
            logger.warn('Invalid status code in hello response', {
                requestId,
                statusCode: formattedResponse.statusCode
            });
            
            formattedResponse.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        }
        
        logger.debug('Hello controller response generated successfully', {
            requestId,
            statusCode: formattedResponse.statusCode,
            contentLength: formattedResponse.content?.length || 0,
            generationTime: `${responseDuration.toFixed(2)}ms`
        });
        
        return formattedResponse;
        
    } catch (error) {
        const responseDuration = performance.now() - responseStartTime;
        
        logger.error('Hello controller response generation failed', {
            requestId,
            error: error.message,
            generationTime: `${responseDuration.toFixed(2)}ms`
        }, error);
        
        // Return fallback error response
        return createErrorResponse({
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
            requestId,
            timestamp: new Date().toISOString(),
            error: 'Response generation failed'
        });
    }
}

/**
 * Logs hello controller operations with hello-specific context, performance data, and
 * correlation information for monitoring and educational purposes.
 * 
 * @param {string} operation - Operation name or identifier for logging categorization
 * @param {Object} operationData - Operation-specific data and context information
 * @param {string} level - Log level for the operation (INFO, DEBUG, WARN, ERROR)
 * @returns {void} Logs hello controller operation information to configured logger with controller context
 */
function logHelloControllerOperation(operation, operationData = {}, level = 'INFO') {
    try {
        // Format operation data with hello controller context and identification
        const contextualData = {
            ...operationData,
            controller: HELLO_CONTROLLER_CONFIG.controllerName,
            controllerVersion: HELLO_CONTROLLER_CONFIG.version,
            operation,
            timestamp: new Date().toISOString()
        };
        
        // Add hello endpoint specific metadata including endpoint path and supported methods
        contextualData.endpointInfo = {
            path: HELLO_CONTROLLER_CONFIG.endpointPath,
            supportedMethods: HELLO_CONTROLLER_CONFIG.supportedMethods,
            responseContent: HELLO_CONTROLLER_CONFIG.responseContent
        };
        
        // Include request correlation ID for hello request tracking and debugging
        if (operationData.requestId) {
            contextualData.requestId = operationData.requestId;
            contextualData.correlationId = operationData.requestId;
        }
        
        // Add performance metrics for hello controller operation timing and throughput
        if (operationData.startTime) {
            const duration = performance.now() - operationData.startTime;
            contextualData.performance = {
                duration: `${duration.toFixed(2)}ms`,
                isSlowOperation: duration > HELLO_CONTROLLER_CONFIG.responseTimeTarget
            };
        }
        
        // Include memory usage for performance monitoring
        if (level === 'DEBUG' || level === 'TRACE') {
            const memUsage = process.memoryUsage();
            contextualData.memoryUsage = {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
            };
        }
        
        // Use logger with hello controller context and structured formatting
        const logMessage = `Hello Controller: ${operation}`;
        
        switch (level.toUpperCase()) {
            case 'TRACE':
                logger.trace(logMessage, contextualData);
                break;
            case 'DEBUG':
                logger.debug(logMessage, contextualData);
                break;
            case 'INFO':
                logger.info(logMessage, contextualData);
                break;
            case 'WARN':
                logger.warn(logMessage, contextualData);
                break;
            case 'ERROR':
                logger.error(logMessage, contextualData);
                break;
            default:
                logger.info(logMessage, contextualData);
                break;
        }
        
    } catch (error) {
        // Fallback logging if operation logging fails
        logger.error('Failed to log hello controller operation', {
            operation,
            error: error.message,
            fallbackLogging: true
        }, error);
    }
}

// ============================================================================
// HELLO CONTROLLER CLASS IMPLEMENTATION
// ============================================================================

/**
 * HTTP controller class for handling Hello World endpoint requests in the Node.js tutorial
 * application. Extends BaseController to provide specialized request handling for the GET /hello
 * endpoint, coordinating with HelloService for business logic processing and implementing proper
 * HTTP response generation. Demonstrates controller layer patterns including request validation,
 * service integration, response formatting, and educational clarity with production-ready
 * implementation.
 */
class HelloController extends BaseController {
    /**
     * Initializes the HelloController with configuration, HelloService integration, and
     * hello-specific controller behavior setup for GET /hello endpoint handling.
     * 
     * @param {Object} controllerConfig - Configuration object for hello controller initialization
     */
    constructor(controllerConfig = {}) {
        const constructorStartTime = performance.now();
        
        try {
            // Call parent BaseController constructor with merged hello controller configuration
            const mergedConfig = {
                ...HELLO_CONTROLLER_CONFIG,
                ...controllerConfig,
                controllerType: 'HelloController'
            };
            
            super(mergedConfig);
            
            // Set controller name to 'HelloController' from HELLO_CONTROLLER_CONFIG
            this.controllerName = HELLO_CONTROLLER_CONFIG.controllerName;
            
            // Configure endpoint path to '/hello' and supported methods to ['GET'] for hello endpoint handling
            this.endpointPath = HELLO_CONTROLLER_CONFIG.endpointPath;
            this.supportedMethods = HELLO_CONTROLLER_CONFIG.supportedMethods;
            
            // Initialize HelloService instance with hello service configuration for business logic coordination
            this.helloService = new HelloService({
                requestTimeoutMs: mergedConfig.requestTimeoutMs || 5000,
                enableValidation: HELLO_CONTROLLER_CONFIG.enableValidation,
                enableMetrics: HELLO_CONTROLLER_CONFIG.enableMetrics
            });
            
            // Set up hello controller specific metrics tracking including request/success/error counts
            this.helloControllerConfig = HELLO_CONTROLLER_CONFIG;
            this.helloControllerMetrics = {
                requestCount: 0,
                successCount: 0,
                errorCount: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                slowRequestCount: 0,
                lastRequestTime: null,
                healthCheckCount: 0
            };
            
            // Configure response templates from HELLO_RESPONSE_TEMPLATES for consistent response formatting
            this.responseTemplates = HELLO_RESPONSE_TEMPLATES;
            
            // Set up hello controller logging with controller-specific context and identification
            this.controllerLogger = logger.createChildLogger({
                logLevel: mergedConfig.logLevel || 'INFO'
            }, {
                controller: this.controllerName,
                endpoint: this.endpointPath
            });
            
            // Set controller start time and initialization status for lifecycle tracking
            this.controllerStartTime = new Date();
            this.isInitialized = true;
            this.initializationDuration = performance.now() - constructorStartTime;
            
            // Initialize error handler for comprehensive error processing
            this.errorHandler = new ErrorHandler({
                enableStackTrace: true,
                enableErrorReporting: true,
                contextEnhancement: true
            });
            
            // Log hello controller initialization with configuration and service integration status
            logHelloControllerOperation('Controller Initialized', {
                controllerName: this.controllerName,
                endpointPath: this.endpointPath,
                supportedMethods: this.supportedMethods,
                initializationDuration: `${this.initializationDuration.toFixed(2)}ms`,
                helloServiceInitialized: !!this.helloService,
                startTime: this.controllerStartTime.toISOString()
            }, 'INFO');
            
        } catch (error) {
            // Handle initialization failure with comprehensive error logging
            const initializationDuration = performance.now() - constructorStartTime;
            
            logger.error('HelloController initialization failed', {
                error: error.message,
                initializationDuration: `${initializationDuration.toFixed(2)}ms`,
                controllerConfig
            }, error);
            
            // Set minimal fallback state for error handling
            this.controllerName = 'HelloController';
            this.endpointPath = '/hello';
            this.supportedMethods = ['GET'];
            this.isInitialized = false;
            this.initializationError = error;
            
            throw error;
        }
    }
    
    /**
     * Handles HTTP method-specific request processing for hello endpoint, implementing the
     * abstract method from BaseController with GET method support and proper error handling
     * for unsupported methods.
     * 
     * @param {Object} request - HTTP request object containing method, URL, headers, and body
     * @param {Object} response - HTTP response object for sending responses to client
     * @param {string} method - HTTP method for request processing (GET, POST, PUT, DELETE)
     * @returns {Object} HTTP method handling result with hello response data and processing status
     */
    async handleHttpMethod(request, response, method) {
        const methodStartTime = performance.now();
        const requestId = request.requestId || `hello-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            logHelloControllerOperation('HTTP Method Handler Started', {
                method,
                requestId,
                url: request.url,
                startTime: methodStartTime
            }, 'DEBUG');
            
            // Start performance measurement for hello request method handling
            const methodContext = {
                requestId,
                method,
                url: request.url,
                timestamp: new Date().toISOString(),
                startTime: methodStartTime
            };
            
            // Validate HTTP method using HTTP_METHODS.GET constant for hello endpoint authorization
            if (!this.supportedMethods.includes(method)) {
                const errorResult = await this._handleUnsupportedMethod(request, response, method, methodContext);
                
                const methodDuration = performance.now() - methodStartTime;
                logHelloControllerOperation('HTTP Method Handler Completed', {
                    ...methodContext,
                    result: 'unsupported_method',
                    statusCode: errorResult.statusCode,
                    duration: `${methodDuration.toFixed(2)}ms`
                }, 'WARN');
                
                return errorResult;
            }
            
            // Handle GET method by delegating to handleGetRequest method for hello response generation
            let methodResult;
            switch (method) {
                case HTTP_METHODS.GET:
                    methodResult = await this.handleGetRequest(request, response, methodContext);
                    break;
                    
                default:
                    // Handle unsupported methods with 405 Method Not Allowed error
                    methodResult = await this._handleUnsupportedMethod(request, response, method, methodContext);
                    break;
            }
            
            // Calculate method handling performance metrics
            const methodDuration = performance.now() - methodStartTime;
            methodResult.performance = {
                duration: methodDuration,
                isSlowRequest: methodDuration > HELLO_CONTROLLER_CONFIG.responseTimeTarget
            };
            
            // Log method handling operation with hello controller context and performance metrics
            logHelloControllerOperation('HTTP Method Handler Completed', {
                ...methodContext,
                result: 'success',
                statusCode: methodResult.statusCode,
                duration: `${methodDuration.toFixed(2)}ms`,
                isSlowRequest: methodResult.performance.isSlowRequest
            }, methodResult.performance.isSlowRequest ? 'WARN' : 'DEBUG');
            
            return methodResult;
            
        } catch (error) {
            const methodDuration = performance.now() - methodStartTime;
            
            // Handle method processing errors with comprehensive error context
            const errorContext = {
                requestId,
                method,
                url: request.url,
                duration: `${methodDuration.toFixed(2)}ms`,
                error: error.message
            };
            
            logHelloControllerOperation('HTTP Method Handler Failed', errorContext, 'ERROR');
            
            // Return error response using error handler
            return await this.errorHandler.handleError(error, request, response, {
                requestId,
                context: 'handleHttpMethod',
                method,
                controller: this.controllerName
            });
        }
    }
    
    /**
     * Handles GET requests to /hello endpoint by coordinating with HelloService for business
     * logic execution and generating appropriate hello world responses.
     * 
     * @param {Object} request - HTTP request object for GET request processing
     * @param {Object} response - HTTP response object for sending hello world response
     * @param {Object} context - Request context with correlation ID and timing information
     * @returns {Object} GET request handling result with hello world response data and processing metrics
     */
    async handleGetRequest(request, response, context = {}) {
        const getRequestStartTime = performance.now();
        const requestId = context.requestId || `hello-get-${Date.now()}`;
        
        try {
            logHelloControllerOperation('GET Request Handler Started', {
                requestId,
                url: request.url,
                startTime: getRequestStartTime
            }, 'DEBUG');
            
            // Start performance measurement for GET request processing
            const requestContext = {
                ...context,
                requestId,
                method: 'GET',
                endpoint: this.endpointPath,
                timestamp: new Date().toISOString()
            };
            
            // Validate GET request using validateHelloRequest method for hello endpoint requirements
            const validationResult = await validateHelloRequest(request, {
                requestId,
                enableSecurityValidation: true,
                enableBusinessRules: true
            });
            
            if (!validationResult.isValid) {
                // Handle validation errors by generating appropriate error responses using createErrorResponse
                const validationError = {
                    type: 'validation_error',
                    message: 'Request validation failed',
                    errors: validationResult.errors,
                    warnings: validationResult.warnings
                };
                
                logHelloControllerOperation('GET Request Validation Failed', {
                    requestId,
                    validationErrors: validationResult.errors,
                    validationWarnings: validationResult.warnings
                }, 'WARN');
                
                return await this.errorHandler.handleError(validationError, request, response, {
                    requestId,
                    context: 'validation',
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST
                });
            }
            
            // Execute HelloService.execute method with request context for hello business logic processing
            const serviceExecutionStartTime = performance.now();
            const serviceResult = await this.helloService.execute(request, {
                requestId,
                validationResult,
                endpoint: this.endpointPath,
                correlationId: requestId
            });
            
            const serviceExecutionDuration = performance.now() - serviceExecutionStartTime;
            
            if (!serviceResult.success) {
                // Handle service errors using HelloService.handleHelloError for hello-specific error processing
                const serviceError = await this.helloService.handleHelloError(
                    serviceResult.error || new Error('Service execution failed'),
                    request,
                    { requestId, serviceResult }
                );
                
                logHelloControllerOperation('HelloService Execution Failed', {
                    requestId,
                    serviceError: serviceError.message,
                    serviceExecutionDuration: `${serviceExecutionDuration.toFixed(2)}ms`
                }, 'ERROR');
                
                return await this.errorHandler.handleError(serviceError, request, response, {
                    requestId,
                    context: 'service_execution',
                    serviceResult
                });
            }
            
            // Generate hello response using generateHelloControllerResponse with service result
            const responseGenerationStartTime = performance.now();
            const controllerResponse = await generateHelloControllerResponse(serviceResult, {
                requestId,
                requestContext,
                serviceExecutionDuration
            });
            
            const responseGenerationDuration = performance.now() - responseGenerationStartTime;
            
            // Include hello endpoint metadata and correlation ID for response tracking and debugging
            controllerResponse.metadata = {
                ...controllerResponse.metadata,
                requestId,
                correlationId: requestId,
                endpoint: this.endpointPath,
                controller: this.controllerName,
                serviceExecutionTime: `${serviceExecutionDuration.toFixed(2)}ms`,
                responseGenerationTime: `${responseGenerationDuration.toFixed(2)}ms`
            };
            
            // Update hello controller metrics
            this._updateHelloControllerMetrics(getRequestStartTime, true);
            
            // Log successful GET request processing with performance metrics and response details
            const totalDuration = performance.now() - getRequestStartTime;
            logHelloControllerOperation('GET Request Handler Completed', {
                requestId,
                statusCode: controllerResponse.statusCode,
                totalDuration: `${totalDuration.toFixed(2)}ms`,
                serviceExecutionDuration: `${serviceExecutionDuration.toFixed(2)}ms`,
                responseGenerationDuration: `${responseGenerationDuration.toFixed(2)}ms`,
                contentLength: controllerResponse.content?.length || 0
            }, 'INFO');
            
            return controllerResponse;
            
        } catch (error) {
            const getDuration = performance.now() - getRequestStartTime;
            
            // Handle GET request processing errors with comprehensive error context
            const errorContext = {
                requestId,
                url: request.url,
                endpoint: this.endpointPath,
                duration: `${getDuration.toFixed(2)}ms`,
                error: error.message
            };
            
            logHelloControllerOperation('GET Request Handler Failed', errorContext, 'ERROR');
            
            // Update metrics for failed request
            this._updateHelloControllerMetrics(getRequestStartTime, false);
            
            return await this.errorHandler.handleError(error, request, response, {
                requestId,
                context: 'handleGetRequest',
                endpoint: this.endpointPath,
                controller: this.controllerName
            });
        }
    }
    
    /**
     * Overrides BaseController processRequest to provide hello-specific request processing
     * with hello endpoint validation, service coordination, and response generation.
     * 
     * @param {Object} request - HTTP request object for complete request processing
     * @param {Object} response - HTTP response object for sending processed response
     * @returns {void} Processes hello endpoint HTTP request and sends appropriate response to client
     */
    async processRequest(request, response) {
        const processStartTime = performance.now();
        
        try {
            // Generate unique request correlation ID for hello request tracking and debugging
            const requestId = `hello-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            request.requestId = requestId;
            
            logHelloControllerOperation('Request Processing Started', {
                requestId,
                method: request.method,
                url: request.url,
                startTime: processStartTime
            }, 'DEBUG');
            
            // Start performance measurement for complete hello request processing lifecycle
            const processingContext = {
                requestId,
                controller: this.controllerName,
                endpoint: this.endpointPath,
                method: request.method,
                url: request.url,
                startTime: processStartTime,
                timestamp: new Date().toISOString()
            };
            
            // Create hello controller context with request, response, and hello-specific metadata
            const controllerContext = {
                ...processingContext,
                controllerVersion: HELLO_CONTROLLER_CONFIG.version,
                supportedMethods: this.supportedMethods,
                responseTemplate: this.responseTemplates.success_template
            };
            
            // Call parent processRequest method for base request processing and validation
            await super.processRequest(request, response, controllerContext);
            
            // Apply hello endpoint specific processing using handleHttpMethod with method delegation
            const methodResult = await this.handleHttpMethod(request, response, request.method);
            
            // Handle hello endpoint specific errors using hello controller error handling
            if (!methodResult || methodResult.error) {
                const processingError = methodResult?.error || new Error('Request processing failed');
                await this.handleError(processingError, request, response, controllerContext);
                return;
            }
            
            // Generate and send hello response using hello response utilities and formatting
            await this._sendHelloResponse(response, methodResult, controllerContext);
            
            // Calculate total processing time and update metrics
            const totalDuration = performance.now() - processStartTime;
            this._updateHelloControllerMetrics(processStartTime, true);
            
            // Log hello request completion with performance metrics and processing summary
            logHelloControllerOperation('Request Processing Completed', {
                requestId,
                statusCode: methodResult.statusCode,
                totalDuration: `${totalDuration.toFixed(2)}ms`,
                success: true
            }, 'INFO');
            
        } catch (error) {
            const processDuration = performance.now() - processStartTime;
            
            // Handle request processing errors with comprehensive error context
            const errorContext = {
                requestId: request.requestId,
                method: request.method,
                url: request.url,
                duration: `${processDuration.toFixed(2)}ms`,
                controller: this.controllerName
            };
            
            logHelloControllerOperation('Request Processing Failed', errorContext, 'ERROR');
            
            // Update metrics for failed request
            this._updateHelloControllerMetrics(processStartTime, false);
            
            await this.handleError(error, request, response, errorContext);
        }
    }
    
    /**
     * Validates incoming HTTP requests for hello endpoint with hello-specific validation rules,
     * method checking, and security validation.
     * 
     * @param {Object} request - HTTP request object for validation
     * @param {Object} validationOptions - Configuration options for validation behavior
     * @returns {Object} Hello endpoint specific validation result with success status, validated data, and error details
     */
    async validateRequest(request, validationOptions = {}) {
        const validationStartTime = performance.now();
        const requestId = validationOptions.requestId || request.requestId || `hello-validation-${Date.now()}`;
        
        try {
            logHelloControllerOperation('Request Validation Started', {
                requestId,
                method: request.method,
                url: request.url,
                startTime: validationStartTime
            }, 'DEBUG');
            
            // Call parent validateRequest method for base HTTP request validation and structure checking
            const baseValidationResult = await super.validateRequest(request, {
                ...validationOptions,
                requestId,
                controller: this.controllerName
            });
            
            // Use validateHelloRequest function for hello endpoint specific validation requirements
            const helloValidationResult = await validateHelloRequest(request, {
                ...validationOptions,
                requestId,
                baseValidation: baseValidationResult
            });
            
            // Apply HelloService.validateRequest for business logic validation and hello-specific rules
            const serviceValidationResult = await this.helloService.validateRequest(request, {
                requestId,
                endpoint: this.endpointPath,
                controllerValidation: helloValidationResult
            });
            
            // Validate request URL path matches hello endpoint path exactly for routing verification
            const requestPath = request.url?.split('?')[0];
            const pathValidation = {
                isValid: requestPath === this.endpointPath,
                expectedPath: this.endpointPath,
                actualPath: requestPath
            };
            
            // Validate HTTP method is GET using HTTP_METHODS.GET for hello endpoint authorization
            const methodValidation = {
                isValid: request.method === HTTP_METHODS.GET,
                expectedMethod: HTTP_METHODS.GET,
                actualMethod: request.method,
                supportedMethods: this.supportedMethods
            };
            
            // Perform security validation specific to hello endpoint including input sanitization
            const typeValidator = new RequestTypeValidator();
            const securityValidationResult = await typeValidator.validateRequest(request, {
                schema: 'HELLO_REQUEST',
                requestId,
                enableSecurityChecks: true
            });
            
            // Compile comprehensive validation results with success status and detailed error information
            const consolidatedValidation = {
                isValid: baseValidationResult.isValid && 
                        helloValidationResult.isValid && 
                        serviceValidationResult.isValid &&
                        pathValidation.isValid &&
                        methodValidation.isValid &&
                        securityValidationResult.isValid,
                errors: [
                    ...baseValidationResult.errors || [],
                    ...helloValidationResult.errors || [],
                    ...serviceValidationResult.errors || [],
                    ...securityValidationResult.errors || []
                ],
                warnings: [
                    ...baseValidationResult.warnings || [],
                    ...helloValidationResult.warnings || [],
                    ...serviceValidationResult.warnings || [],
                    ...securityValidationResult.warnings || []
                ],
                validatedData: {
                    ...baseValidationResult.validatedData,
                    ...helloValidationResult.validatedData,
                    pathValidation,
                    methodValidation
                },
                metadata: {
                    requestId,
                    controller: this.controllerName,
                    endpoint: this.endpointPath,
                    validationType: 'hello-endpoint-comprehensive',
                    timestamp: new Date().toISOString()
                }
            };
            
            // Add path validation errors if path doesn't match
            if (!pathValidation.isValid) {
                consolidatedValidation.errors.push({
                    type: 'path_mismatch',
                    message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
                    expectedPath: this.endpointPath,
                    actualPath: requestPath
                });
            }
            
            // Add method validation errors if method is not GET
            if (!methodValidation.isValid) {
                consolidatedValidation.errors.push({
                    type: 'method_not_allowed',
                    message: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                    expectedMethod: HTTP_METHODS.GET,
                    actualMethod: request.method
                });
            }
            
            // Calculate validation performance metrics
            const validationDuration = performance.now() - validationStartTime;
            consolidatedValidation.metadata.duration = `${validationDuration.toFixed(2)}ms`;
            consolidatedValidation.metadata.endTime = new Date().toISOString();
            
            // Log validation outcomes and any security warnings detected for monitoring purposes
            logHelloControllerOperation('Request Validation Completed', {
                requestId,
                isValid: consolidatedValidation.isValid,
                errorCount: consolidatedValidation.errors.length,
                warningCount: consolidatedValidation.warnings.length,
                duration: consolidatedValidation.metadata.duration,
                pathValid: pathValidation.isValid,
                methodValid: methodValidation.isValid
            }, consolidatedValidation.isValid ? 'DEBUG' : 'WARN');
            
            return consolidatedValidation;
            
        } catch (error) {
            const validationDuration = performance.now() - validationStartTime;
            
            logHelloControllerOperation('Request Validation Failed', {
                requestId,
                error: error.message,
                duration: `${validationDuration.toFixed(2)}ms`
            }, 'ERROR');
            
            return {
                isValid: false,
                errors: [{
                    type: 'validation_exception',
                    message: 'Validation process failed',
                    details: error.message
                }],
                warnings: [],
                validatedData: {},
                metadata: {
                    requestId,
                    controller: this.controllerName,
                    validationType: 'hello-endpoint-error',
                    duration: `${validationDuration.toFixed(2)}ms`,
                    error: true
                }
            };
        }
    }
    
    /**
     * Generates standardized HTTP responses for hello endpoint using hello response utilities
     * with proper formatting, headers, and hello-specific metadata.
     * 
     * @param {Object} responseData - Response content and data for formatting
     * @param {number} statusCode - HTTP status code for the response
     * @param {Object} options - Response generation options and configuration
     * @returns {Object} Formatted hello endpoint HTTP response object with headers, status, and hello world content
     */
    async generateResponse(responseData, statusCode = HTTP_STATUS_CODES.SUCCESS.OK, options = {}) {
        const responseStartTime = performance.now();
        const requestId = options.requestId || `hello-response-${Date.now()}`;
        
        try {
            logHelloControllerOperation('Response Generation Started', {
                requestId,
                statusCode,
                hasResponseData: !!responseData,
                startTime: responseStartTime
            }, 'DEBUG');
            
            // Determine response type based on status code and hello endpoint context
            const isSuccessResponse = statusCode >= 200 && statusCode < 300;
            const isClientError = statusCode >= 400 && statusCode < 500;
            const isServerError = statusCode >= 500;
            
            let formattedResponse;
            
            if (isSuccessResponse) {
                // Use createHelloResponse utility for successful hello world responses (200 status)
                formattedResponse = createHelloResponse({
                    content: responseData?.content || RESPONSE_MESSAGES.HELLO_WORLD,
                    requestId,
                    timestamp: new Date().toISOString(),
                    metadata: responseData?.metadata || {}
                });
            } else {
                // Use createErrorResponse utility for error responses with hello context
                formattedResponse = createErrorResponse({
                    statusCode,
                    message: responseData?.message || this._getErrorMessageForStatus(statusCode),
                    requestId,
                    timestamp: new Date().toISOString(),
                    details: responseData?.details,
                    metadata: responseData?.metadata || {}
                });
            }
            
            // Use parent generateResponse method for base response formatting and validation
            const baseResponse = await super.generateResponse(formattedResponse, statusCode, {
                ...options,
                requestId,
                controller: this.controllerName
            });
            
            // Include hello controller specific metadata in response headers for identification
            const helloSpecificHeaders = {
                'X-Controller': this.controllerName,
                'X-Controller-Version': HELLO_CONTROLLER_CONFIG.version,
                'X-Endpoint': this.endpointPath,
                'X-Response-Type': isSuccessResponse ? 'hello-success' : 'hello-error',
                'Content-Type': 'text/plain; charset=utf-8'
            };
            
            // Add correlation ID and hello endpoint information for request-response tracking
            if (requestId) {
                helloSpecificHeaders['X-Request-ID'] = requestId;
                helloSpecificHeaders['X-Correlation-ID'] = requestId;
            }
            
            // Calculate response generation performance
            const responseDuration = performance.now() - responseStartTime;
            helloSpecificHeaders['X-Response-Time'] = `${responseDuration.toFixed(2)}ms`;
            
            // Merge headers with base response
            const finalResponse = {
                ...baseResponse,
                headers: {
                    ...baseResponse.headers,
                    ...helloSpecificHeaders
                },
                metadata: {
                    ...baseResponse.metadata,
                    controller: this.controllerName,
                    endpoint: this.endpointPath,
                    requestId,
                    responseGenerationTime: responseDuration,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Validate response object for HTTP compliance and hello endpoint requirements
            if (!isValidStatusCode(finalResponse.statusCode)) {
                logHelloControllerOperation('Invalid Status Code Detected', {
                    requestId,
                    invalidStatusCode: finalResponse.statusCode,
                    correctedTo: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR
                }, 'WARN');
                
                finalResponse.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
            }
            
            logHelloControllerOperation('Response Generation Completed', {
                requestId,
                statusCode: finalResponse.statusCode,
                responseType: helloSpecificHeaders['X-Response-Type'],
                generationTime: `${responseDuration.toFixed(2)}ms`,
                contentLength: finalResponse.content?.length || 0
            }, 'DEBUG');
            
            return finalResponse;
            
        } catch (error) {
            const responseDuration = performance.now() - responseStartTime;
            
            logHelloControllerOperation('Response Generation Failed', {
                requestId,
                error: error.message,
                attemptedStatusCode: statusCode,
                generationTime: `${responseDuration.toFixed(2)}ms`
            }, 'ERROR');
            
            // Return fallback error response
            return createErrorResponse({
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                requestId,
                timestamp: new Date().toISOString(),
                error: 'Response generation failed'
            });
        }
    }
    
    /**
     * Handles hello controller errors with comprehensive error processing, classification,
     * and secure hello-specific error response generation.
     * 
     * @param {Error} error - Error object with stack trace and error details
     * @param {Object} request - HTTP request object for error context
     * @param {Object} response - HTTP response object for sending error response
     * @param {Object} context - Additional error context and debugging information
     * @returns {void} Processes hello controller error and sends appropriate HTTP error response to client
     */
    async handleError(error, request, response, context = {}) {
        const errorHandlingStartTime = performance.now();
        const requestId = context.requestId || request.requestId || `hello-error-${Date.now()}`;
        
        try {
            logHelloControllerOperation('Error Handling Started', {
                requestId,
                errorType: error.constructor.name,
                errorMessage: error.message,
                context: context.context || 'unknown',
                startTime: errorHandlingStartTime
            }, 'DEBUG');
            
            // Generate error correlation ID for hello error tracking and debugging
            const errorId = `hello-err-${Date.now()}`;
            context.errorId = errorId;
            context.requestId = requestId;
            
            // Use HelloService.handleHelloError for hello-specific error processing and classification
            const helloServiceErrorResult = await this.helloService.handleHelloError(error, request, {
                ...context,
                controller: this.controllerName,
                endpoint: this.endpointPath
            });
            
            // Use parent handleError method for base controller error coordination and logging
            const baseErrorResult = await super.handleError(error, request, response, {
                ...context,
                helloServiceResult: helloServiceErrorResult,
                controller: this.controllerName
            });
            
            // Classify error type and severity for appropriate hello endpoint error response strategy
            const errorClassification = await this.errorHandler.classifyError(error, {
                requestId,
                controller: this.controllerName,
                endpoint: this.endpointPath,
                method: request.method,
                url: request.url
            });
            
            // Create secure error response using createErrorResponse with hello context
            const errorResponse = await this.generateResponse({
                message: errorClassification.safeMessage,
                details: errorClassification.publicDetails,
                metadata: {
                    errorId,
                    errorType: errorClassification.type,
                    severity: errorClassification.severity,
                    timestamp: new Date().toISOString()
                }
            }, errorClassification.statusCode, {
                requestId,
                errorContext: context
            });
            
            // Update hello controller error metrics and statistics for monitoring and analysis
            this.helloControllerMetrics.errorCount++;
            this._updateErrorStatistics(error, errorClassification);
            
            // Log error details with hello controller context for debugging and incident tracking
            const errorDuration = performance.now() - errorHandlingStartTime;
            
            logHelloControllerOperation('Error Handling Completed', {
                requestId,
                errorId,
                errorType: errorClassification.type,
                severity: errorClassification.severity,
                statusCode: errorClassification.statusCode,
                safeMessage: errorClassification.safeMessage,
                handlingDuration: `${errorDuration.toFixed(2)}ms`
            }, errorClassification.severity === 'high' ? 'ERROR' : 'WARN');
            
            // Send formatted hello error response to client with proper status code and headers
            await this._sendHelloResponse(response, errorResponse, {
                ...context,
                isError: true,
                errorClassification
            });
            
        } catch (handlingError) {
            const errorDuration = performance.now() - errorHandlingStartTime;
            
            // Handle error processing failure with fallback error response
            logHelloControllerOperation('Error Handling Failed', {
                requestId,
                originalError: error.message,
                handlingError: handlingError.message,
                handlingDuration: `${errorDuration.toFixed(2)}ms`
            }, 'ERROR');
            
            // Send minimal fallback error response
            try {
                response.writeHead(HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
                    'Content-Type': 'text/plain',
                    'X-Controller': this.controllerName,
                    'X-Request-ID': requestId
                });
                response.end(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
            } catch (responseError) {
                logger.error('Failed to send fallback error response', {
                    requestId,
                    responseError: responseError.message
                }, responseError);
            }
        }
    }
    
    /**
     * Returns comprehensive hello controller information including endpoint details, service
     * integration status, configuration, and operational metrics.
     * 
     * @returns {Object} Hello controller information with metadata, capabilities, service status, and performance metrics
     */
    getControllerInfo() {
        try {
            // Get base controller information from parent getControllerInfo method
            const baseControllerInfo = super.getControllerInfo();
            
            // Add hello controller specific metadata including name, version, and endpoint path
            const helloControllerMetadata = {
                controllerName: this.controllerName,
                controllerVersion: HELLO_CONTROLLER_CONFIG.version,
                controllerType: 'HelloController',
                endpointPath: this.endpointPath,
                supportedMethods: this.supportedMethods,
                category: HELLO_CONTROLLER_METADATA.category,
                maintainer: HELLO_CONTROLLER_METADATA.maintainer
            };
            
            // Include hello endpoint capabilities including supported methods and response types
            const endpointCapabilities = {
                supportedHttpMethods: this.supportedMethods,
                responseContentType: 'text/plain',
                responseContent: HELLO_CONTROLLER_CONFIG.responseContent,
                enableValidation: HELLO_CONTROLLER_CONFIG.enableValidation,
                enableLogging: HELLO_CONTROLLER_CONFIG.enableLogging,
                enableMetrics: HELLO_CONTROLLER_CONFIG.enableMetrics,
                responseTimeTarget: HELLO_CONTROLLER_CONFIG.responseTimeTarget
            };
            
            // Add HelloService integration status and hello service health information
            const serviceIntegrationStatus = {
                helloServiceConnected: !!this.helloService,
                helloServiceHealthy: this.helloService ? this.helloService.isHelloServiceHealthy() : false,
                helloServiceInfo: this.helloService ? this.helloService.getHelloServiceInfo() : null,
                serviceInitializationTime: this.controllerStartTime?.toISOString()
            };
            
            // Include hello controller performance metrics and operational statistics
            const performanceMetrics = this.getHelloControllerMetrics();
            
            // Add hello endpoint configuration details and feature flags status
            const configurationDetails = {
                ...HELLO_CONTROLLER_CONFIG,
                responseTemplates: this.responseTemplates,
                isInitialized: this.isInitialized,
                initializationDuration: this.initializationDuration,
                controllerStartTime: this.controllerStartTime?.toISOString()
            };
            
            // Calculate uptime
            const uptime = this.controllerStartTime ? 
                ((new Date() - this.controllerStartTime) / 1000).toFixed(1) : null;
            
            // Return comprehensive hello controller information
            return {
                ...baseControllerInfo,
                helloController: {
                    metadata: helloControllerMetadata,
                    capabilities: endpointCapabilities,
                    serviceIntegration: serviceIntegrationStatus,
                    performance: performanceMetrics,
                    configuration: configurationDetails,
                    status: {
                        isHealthy: this.isHealthy(),
                        isInitialized: this.isInitialized,
                        uptime: uptime ? `${uptime}s` : null,
                        lastRequestTime: this.helloControllerMetrics.lastRequestTime?.toISOString() || null
                    }
                },
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            logger.error('Failed to get hello controller info', {
                controller: this.controllerName,
                error: error.message
            }, error);
            
            return {
                controller: this.controllerName,
                error: 'Failed to retrieve controller information',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Performs comprehensive health check for hello controller including HelloService health,
     * configuration validation, and hello endpoint operational status.
     * 
     * @returns {boolean} True if hello controller is healthy and operational, false otherwise
     */
    isHealthy() {
        try {
            this.helloControllerMetrics.healthCheckCount++;
            
            const healthCheckStartTime = performance.now();
            
            // Call parent isHealthy method for base controller health validation
            const baseControllerHealthy = super.isHealthy();
            
            if (!baseControllerHealthy) {
                logHelloControllerOperation('Base Controller Health Check Failed', {
                    baseControllerHealthy: false
                }, 'WARN');
                return false;
            }
            
            // Check HelloService health using HelloService.isHelloServiceHealthy method
            const helloServiceHealthy = this.helloService ? 
                this.helloService.isHelloServiceHealthy() : false;
            
            if (!helloServiceHealthy) {
                logHelloControllerOperation('HelloService Health Check Failed', {
                    helloServiceHealthy: false,
                    helloServiceExists: !!this.helloService
                }, 'WARN');
                return false;
            }
            
            // Validate hello controller configuration and endpoint settings for operational readiness
            const configurationValid = this._validateControllerConfiguration();
            
            if (!configurationValid) {
                logHelloControllerOperation('Controller Configuration Invalid', {
                    configurationValid: false
                }, 'WARN');
                return false;
            }
            
            // Check hello endpoint specific functionality including response generation capabilities
            const endpointFunctional = this._checkEndpointFunctionality();
            
            if (!endpointFunctional) {
                logHelloControllerOperation('Endpoint Functionality Check Failed', {
                    endpointFunctional: false
                }, 'WARN');
                return false;
            }
            
            // Validate hello controller dependencies including response utilities and constants
            const dependenciesHealthy = this._checkDependencyHealth();
            
            if (!dependenciesHealthy) {
                logHelloControllerOperation('Dependencies Health Check Failed', {
                    dependenciesHealthy: false
                }, 'WARN');
                return false;
            }
            
            // Check hello controller metrics and error rates against health thresholds
            const metricsHealthy = this._checkMetricsHealth();
            
            if (!metricsHealthy) {
                logHelloControllerOperation('Metrics Health Check Failed', {
                    metricsHealthy: false,
                    errorRate: this._calculateErrorRate(),
                    averageResponseTime: this.helloControllerMetrics.averageResponseTime
                }, 'WARN');
                return false;
            }
            
            // Verify hello endpoint response time performance against targets and SLA requirements
            const performanceHealthy = this._checkPerformanceHealth();
            
            if (!performanceHealthy) {
                logHelloControllerOperation('Performance Health Check Failed', {
                    performanceHealthy: false,
                    averageResponseTime: this.helloControllerMetrics.averageResponseTime,
                    responseTimeTarget: HELLO_CONTROLLER_CONFIG.responseTimeTarget
                }, 'WARN');
                return false;
            }
            
            // Calculate health check duration
            const healthCheckDuration = performance.now() - healthCheckStartTime;
            
            logHelloControllerOperation('Health Check Completed Successfully', {
                healthCheckDuration: `${healthCheckDuration.toFixed(2)}ms`,
                allChecksPass: true,
                healthCheckCount: this.helloControllerMetrics.healthCheckCount
            }, 'DEBUG');
            
            return true;
            
        } catch (error) {
            logHelloControllerOperation('Health Check Exception', {
                error: error.message,
                healthCheckFailed: true
            }, 'ERROR');
            
            return false;
        }
    }
    
    /**
     * Retrieves hello controller specific performance metrics including request counts, response
     * times, success rates, and hello endpoint statistics.
     * 
     * @returns {Object} Hello controller performance metrics with request statistics, service metrics, and health indicators
     */
    getHelloControllerMetrics() {
        try {
            // Get base controller performance metrics from parent getPerformanceMetrics method
            const baseMetrics = super.getPerformanceMetrics ? super.getPerformanceMetrics() : {};
            
            // Add hello controller specific request and response metrics including count and timing
            const requestMetrics = {
                requestCount: this.helloControllerMetrics.requestCount,
                successCount: this.helloControllerMetrics.successCount,
                errorCount: this.helloControllerMetrics.errorCount,
                lastRequestTime: this.helloControllerMetrics.lastRequestTime?.toISOString() || null
            };
            
            // Include HelloService metrics using HelloService.getHelloMetrics for business logic performance
            const serviceMetrics = this.helloService ? 
                this.helloService.getHelloMetrics() : { serviceUnavailable: true };
            
            // Calculate hello controller success rate and error rate percentages
            const totalRequests = this.helloControllerMetrics.requestCount;
            const successRate = totalRequests > 0 ? 
                ((this.helloControllerMetrics.successCount / totalRequests) * 100).toFixed(2) : 0;
            const errorRate = totalRequests > 0 ? 
                ((this.helloControllerMetrics.errorCount / totalRequests) * 100).toFixed(2) : 0;
            
            // Include average response time for hello endpoint requests and performance trends
            const averageResponseTime = this.helloControllerMetrics.averageResponseTime || 0;
            const slowRequestCount = this.helloControllerMetrics.slowRequestCount || 0;
            const slowRequestRate = totalRequests > 0 ? 
                ((slowRequestCount / totalRequests) * 100).toFixed(2) : 0;
            
            // Add hello controller uptime and availability metrics for monitoring systems
            const uptime = this.controllerStartTime ? 
                ((new Date() - this.controllerStartTime) / 1000) : 0;
            const uptimeFormatted = `${uptime.toFixed(1)}s`;
            
            // Calculate throughput metrics
            const requestsPerSecond = uptime > 0 ? (totalRequests / uptime).toFixed(2) : 0;
            
            // Return comprehensive hello controller performance metrics
            return {
                controller: {
                    name: this.controllerName,
                    version: HELLO_CONTROLLER_CONFIG.version,
                    endpoint: this.endpointPath,
                    timestamp: new Date().toISOString()
                },
                requests: {
                    total: totalRequests,
                    successful: this.helloControllerMetrics.successCount,
                    failed: this.helloControllerMetrics.errorCount,
                    successRate: `${successRate}%`,
                    errorRate: `${errorRate}%`,
                    lastRequestTime: requestMetrics.lastRequestTime
                },
                performance: {
                    averageResponseTime: `${averageResponseTime.toFixed(2)}ms`,
                    slowRequestCount: slowRequestCount,
                    slowRequestRate: `${slowRequestRate}%`,
                    responseTimeTarget: `${HELLO_CONTROLLER_CONFIG.responseTimeTarget}ms`,
                    totalResponseTime: this.helloControllerMetrics.totalResponseTime
                },
                throughput: {
                    requestsPerSecond: parseFloat(requestsPerSecond),
                    uptime: uptimeFormatted,
                    uptimeSeconds: uptime,
                    startTime: this.controllerStartTime?.toISOString()
                },
                health: {
                    isHealthy: this.isHealthy(),
                    healthCheckCount: this.helloControllerMetrics.healthCheckCount,
                    isInitialized: this.isInitialized,
                    initializationDuration: this.initializationDuration
                },
                service: {
                    helloService: serviceMetrics
                },
                base: baseMetrics
            };
            
        } catch (error) {
            logger.error('Failed to get hello controller metrics', {
                controller: this.controllerName,
                error: error.message
            }, error);
            
            return {
                controller: this.controllerName,
                error: 'Failed to retrieve metrics',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Performs graceful hello controller shutdown with HelloService cleanup, resource
     * deallocation, and hello endpoint deregistration for clean termination.
     * 
     * @param {Object} shutdownOptions - Configuration options for shutdown behavior
     * @returns {Promise} Promise that resolves when hello controller shutdown is complete
     */
    async shutdown(shutdownOptions = {}) {
        const shutdownStartTime = performance.now();
        const shutdownId = `hello-shutdown-${Date.now()}`;
        
        try {
            // Log hello controller shutdown initiation with reason and context information
            logHelloControllerOperation('Shutdown Initiated', {
                shutdownId,
                reason: shutdownOptions.reason || 'manual',
                gracefulShutdown: shutdownOptions.graceful !== false,
                timeout: shutdownOptions.timeout || 30000,
                startTime: shutdownStartTime
            }, 'INFO');
            
            const shutdownPromises = [];
            
            // Complete pending hello requests with timeout and graceful response handling
            if (shutdownOptions.graceful !== false) {
                logHelloControllerOperation('Completing Pending Requests', {
                    shutdownId,
                    activeRequests: this.helloControllerMetrics.requestCount
                }, 'INFO');
                
                // Allow time for pending requests to complete
                const requestCompletionPromise = new Promise((resolve) => {
                    setTimeout(() => {
                        logHelloControllerOperation('Request Completion Timeout', {
                            shutdownId,
                            timeoutMs: shutdownOptions.requestTimeout || 5000
                        }, 'WARN');
                        resolve();
                    }, shutdownOptions.requestTimeout || 5000);
                });
                
                shutdownPromises.push(requestCompletionPromise);
            }
            
            // Shutdown HelloService using service shutdown methods for clean business logic termination
            if (this.helloService && typeof this.helloService.shutdown === 'function') {
                logHelloControllerOperation('Shutting Down HelloService', {
                    shutdownId
                }, 'INFO');
                
                const serviceShutdownPromise = this.helloService.shutdown({
                    ...shutdownOptions,
                    parentShutdownId: shutdownId
                }).catch((error) => {
                    logHelloControllerOperation('HelloService Shutdown Error', {
                        shutdownId,
                        error: error.message
                    }, 'ERROR');
                });
                
                shutdownPromises.push(serviceShutdownPromise);
            }
            
            // Call parent shutdown method for base controller resource cleanup and termination
            if (super.shutdown && typeof super.shutdown === 'function') {
                logHelloControllerOperation('Calling Parent Shutdown', {
                    shutdownId
                }, 'INFO');
                
                const parentShutdownPromise = super.shutdown({
                    ...shutdownOptions,
                    childShutdownId: shutdownId
                }).catch((error) => {
                    logHelloControllerOperation('Parent Shutdown Error', {
                        shutdownId,
                        error: error.message
                    }, 'ERROR');
                });
                
                shutdownPromises.push(parentShutdownPromise);
            }
            
            // Wait for all shutdown operations to complete
            await Promise.allSettled(shutdownPromises);
            
            // Clean up hello controller specific resources including metrics and response templates
            this._cleanupControllerResources(shutdownId);
            
            // Flush pending logs and ensure all hello controller log entries are written
            if (this.controllerLogger && typeof this.controllerLogger.flush === 'function') {
                await this.controllerLogger.flush();
            }
            
            // Update hello controller status to shutdown and mark endpoint as unavailable
            this.isInitialized = false;
            this.isShuttingDown = true;
            this.shutdownTime = new Date();
            
            // Perform final hello controller metrics collection and reporting for monitoring
            const finalMetrics = this.getHelloControllerMetrics();
            
            // Calculate total shutdown duration
            const shutdownDuration = performance.now() - shutdownStartTime;
            
            // Log successful hello controller shutdown completion with final operational statistics
            logHelloControllerOperation('Shutdown Completed Successfully', {
                shutdownId,
                shutdownDuration: `${shutdownDuration.toFixed(2)}ms`,
                finalMetrics: {
                    totalRequests: finalMetrics.requests?.total || 0,
                    successRate: finalMetrics.requests?.successRate || '0%',
                    averageResponseTime: finalMetrics.performance?.averageResponseTime || '0ms'
                },
                shutdownTime: this.shutdownTime.toISOString()
            }, 'INFO');
            
            return {
                success: true,
                shutdownId,
                duration: shutdownDuration,
                finalMetrics,
                shutdownTime: this.shutdownTime.toISOString()
            };
            
        } catch (error) {
            const shutdownDuration = performance.now() - shutdownStartTime;
            
            logHelloControllerOperation('Shutdown Failed', {
                shutdownId,
                error: error.message,
                shutdownDuration: `${shutdownDuration.toFixed(2)}ms`
            }, 'ERROR');
            
            return {
                success: false,
                shutdownId,
                error: error.message,
                duration: shutdownDuration,
                shutdownTime: new Date().toISOString()
            };
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Handles unsupported HTTP methods with proper error response generation.
     * @private
     */
    async _handleUnsupportedMethod(request, response, method, context) {
        const allowedMethods = this.supportedMethods.join(', ');
        
        return await this.generateResponse({
            message: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
            details: `Method ${method} not allowed. Supported methods: ${allowedMethods}`,
            metadata: {
                allowedMethods: this.supportedMethods,
                attemptedMethod: method
            }
        }, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, {
            requestId: context.requestId,
            headers: {
                'Allow': allowedMethods
            }
        });
    }
    
    /**
     * Sends hello response to client with proper headers and content.
     * @private
     */
    async _sendHelloResponse(response, responseData, context = {}) {
        try {
            const headers = responseData.headers || {};
            const statusCode = responseData.statusCode || HTTP_STATUS_CODES.SUCCESS.OK;
            const content = responseData.content || RESPONSE_MESSAGES.HELLO_WORLD;
            
            response.writeHead(statusCode, headers);
            response.end(content);
            
            logHelloControllerOperation('Response Sent', {
                requestId: context.requestId,
                statusCode,
                contentLength: content.length,
                isError: context.isError || false
            }, 'DEBUG');
            
        } catch (error) {
            logHelloControllerOperation('Failed to Send Response', {
                requestId: context.requestId,
                error: error.message
            }, 'ERROR');
            
            throw error;
        }
    }
    
    /**
     * Updates hello controller metrics with request data.
     * @private
     */
    _updateHelloControllerMetrics(startTime, success = true) {
        try {
            const duration = performance.now() - startTime;
            
            this.helloControllerMetrics.requestCount++;
            this.helloControllerMetrics.lastRequestTime = new Date();
            this.helloControllerMetrics.totalResponseTime += duration;
            
            if (success) {
                this.helloControllerMetrics.successCount++;
            } else {
                this.helloControllerMetrics.errorCount++;
            }
            
            // Update average response time
            this.helloControllerMetrics.averageResponseTime = 
                this.helloControllerMetrics.totalResponseTime / this.helloControllerMetrics.requestCount;
            
            // Track slow requests
            if (duration > HELLO_CONTROLLER_CONFIG.responseTimeTarget) {
                this.helloControllerMetrics.slowRequestCount++;
            }
            
        } catch (error) {
            logger.error('Failed to update hello controller metrics', {
                error: error.message
            }, error);
        }
    }
    
    /**
     * Updates error statistics for monitoring.
     * @private
     */
    _updateErrorStatistics(error, classification) {
        try {
            // Add error tracking logic here
            logHelloControllerOperation('Error Statistics Updated', {
                errorType: classification.type,
                severity: classification.severity,
                errorCount: this.helloControllerMetrics.errorCount
            }, 'DEBUG');
            
        } catch (updateError) {
            logger.error('Failed to update error statistics', {
                error: updateError.message
            }, updateError);
        }
    }
    
    /**
     * Validates controller configuration for health checks.
     * @private
     */
    _validateControllerConfiguration() {
        try {
            return this.controllerName === HELLO_CONTROLLER_CONFIG.controllerName &&
                   this.endpointPath === HELLO_CONTROLLER_CONFIG.endpointPath &&
                   Array.isArray(this.supportedMethods) &&
                   this.supportedMethods.includes(HTTP_METHODS.GET);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Checks endpoint functionality for health validation.
     * @private
     */
    _checkEndpointFunctionality() {
        try {
            return typeof this.handleGetRequest === 'function' &&
                   typeof this.generateResponse === 'function' &&
                   typeof this.validateRequest === 'function';
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Checks dependency health status.
     * @private
     */
    _checkDependencyHealth() {
        try {
            return !!this.helloService &&
                   !!RESPONSE_MESSAGES.HELLO_WORLD &&
                   !!HTTP_STATUS_CODES.SUCCESS.OK &&
                   !!HTTP_METHODS.GET;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Checks metrics health against thresholds.
     * @private
     */
    _checkMetricsHealth() {
        try {
            const errorRate = this._calculateErrorRate();
            const avgResponseTime = this.helloControllerMetrics.averageResponseTime;
            
            return errorRate < 50 && // Less than 50% error rate
                   avgResponseTime < (HELLO_CONTROLLER_CONFIG.responseTimeTarget * 5); // Less than 5x target
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Checks performance health against SLA targets.
     * @private
     */
    _checkPerformanceHealth() {
        try {
            const avgResponseTime = this.helloControllerMetrics.averageResponseTime;
            const target = HELLO_CONTROLLER_CONFIG.responseTimeTarget;
            
            return avgResponseTime <= (target * 2); // Within 2x target
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Calculates current error rate percentage.
     * @private
     */
    _calculateErrorRate() {
        try {
            const totalRequests = this.helloControllerMetrics.requestCount;
            const errorCount = this.helloControllerMetrics.errorCount;
            
            return totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
        } catch (error) {
            return 100; // Assume worst case if calculation fails
        }
    }
    
    /**
     * Gets appropriate error message for HTTP status code.
     * @private
     */
    _getErrorMessageForStatus(statusCode) {
        switch (statusCode) {
            case HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND:
                return ERROR_MESSAGES.NOT_FOUND;
            case HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED:
                return ERROR_MESSAGES.METHOD_NOT_ALLOWED;
            case HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR:
                return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
            default:
                return 'An error occurred';
        }
    }
    
    /**
     * Cleans up controller resources during shutdown.
     * @private
     */
    _cleanupControllerResources(shutdownId) {
        try {
            // Reset metrics
            this.helloControllerMetrics = {
                requestCount: 0,
                successCount: 0,
                errorCount: 0,
                totalResponseTime: 0,
                averageResponseTime: 0,
                slowRequestCount: 0,
                lastRequestTime: null,
                healthCheckCount: 0
            };
            
            // Clear references
            this.responseTemplates = null;
            
            logHelloControllerOperation('Resources Cleaned Up', {
                shutdownId
            }, 'DEBUG');
            
        } catch (error) {
            logHelloControllerOperation('Resource Cleanup Failed', {
                shutdownId,
                error: error.message
            }, 'ERROR');
        }
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export the main HelloController class
export { HelloController };

// Export utility functions for external use and testing
export { 
    validateHelloRequest,
    generateHelloControllerResponse,
    logHelloControllerOperation 
};

// Export configuration constants for external reference
export { 
    HELLO_CONTROLLER_CONFIG,
    HELLO_CONTROLLER_METADATA,
    HELLO_RESPONSE_TEMPLATES 
};

// Default export for convenient access to HelloController
export default HelloController;