/**
 * Base Service Module for Node.js Tutorial Application
 * 
 * Provides the foundational BaseService class and related utilities for service layer architecture
 * in the Node.js tutorial application. Implements comprehensive service patterns including logging,
 * validation, error handling, performance monitoring, and configuration management. Serves as the
 * foundation for all service classes while maintaining educational clarity and demonstrating
 * production-ready service implementation patterns.
 * 
 * This module demonstrates enterprise-grade service architecture with:
 * - Abstract base class providing common service functionality
 * - Comprehensive error handling with classification and recovery strategies
 * - Performance monitoring with timing metrics and threshold monitoring
 * - Structured logging integration with correlation tracking
 * - Configuration management with feature flags and environment awareness
 * - Health checking capabilities for production readiness
 * - Graceful shutdown procedures for clean service termination
 * 
 * Educational Value:
 * - Demonstrates service layer architecture patterns and best practices
 * - Shows advanced OOP concepts including inheritance and polymorphism
 * - Illustrates dependency injection and configuration management
 * - Teaches structured logging and monitoring integration patterns
 * - Demonstrates comprehensive error handling and recovery strategies
 * - Shows performance measurement techniques and optimization patterns
 * 
 * @description Base service class and utilities for service layer foundation
 * @author Node.js Tutorial Application
 * @version 1.0.0
 * @license MIT
 */

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================

// Node.js built-in modules for performance monitoring and cryptographic operations
const { performance } = require('perf_hooks'); // built-in
const crypto = require('crypto'); // built-in

// =============================================================================
// INTERNAL DEPENDENCIES
// =============================================================================

// Application configuration management for service initialization and feature flags
const { AppConfig } = require('../config/app.config.js');

// Structured logging capabilities for service operations and error tracking
const { Logger } = require('../utils/logger.js');

// HTTP request validation utilities for input validation and security checking
const { 
    validateRequestStructure, 
    createValidationResult 
} = require('../utils/validation.js');

// Standardized error message constants for consistent error handling
const { 
    ERROR_MESSAGES 
} = require('../constants/error-messages.js');

// HTTP status code constants for proper response classification
const { 
    HTTP_STATUS_CODES 
} = require('../utils/http-status.js');

// Request type definitions for service method parameters and validation
const { 
    REQUEST_TYPES 
} = require('../types/request.types.js');

// =============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Base service configuration object with default settings for service initialization
 * and behavior control across all service instances in the tutorial application
 * @constant {Object} BASE_SERVICE_CONFIG
 */
const BASE_SERVICE_CONFIG = {
    serviceName: 'BaseService',
    version: '1.0.0',
    enableMetrics: true,
    enableValidation: true,
    enableLogging: true,
    performanceTracking: true,
    healthCheckInterval: 30000,
    maxErrorRate: 0.05
};

/**
 * Default service metadata for service identification and categorization
 * providing common metadata across all service instances
 * @constant {Object} DEFAULT_SERVICE_METADATA
 */
const DEFAULT_SERVICE_METADATA = {
    category: 'tutorial-service',
    environment: 'development',
    maintainer: 'tutorial-application',
    documentation: 'Educational service implementation'
};

/**
 * Performance threshold configuration for monitoring and alerting
 * defining acceptable performance limits for service operations
 * @constant {Object} PERFORMANCE_THRESHOLDS
 */
const PERFORMANCE_THRESHOLDS = {
    slow_operation_threshold_ms: 100,
    warning_threshold_ms: 50,
    critical_threshold_ms: 200,
    memory_warning_mb: 50,
    memory_critical_mb: 100
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generates unique correlation ID for request tracking and debugging across service operations
 * using cryptographic random generation for secure and unique identifier creation
 * 
 * @param {string} [prefix=''] - Optional prefix for categorization and identification
 * @returns {string} Unique correlation ID with optional prefix for request tracking
 */
function generateCorrelationId(prefix = '') {
    try {
        // Generate cryptographically random bytes using crypto.randomBytes
        const randomBytes = crypto.randomBytes(8);
        
        // Convert random bytes to hexadecimal string representation
        const randomHex = randomBytes.toString('hex');
        
        // Include timestamp component for chronological ordering
        const timestamp = Date.now().toString(36);
        
        // Add optional prefix if provided for categorization
        const prefixPart = prefix ? `${prefix}_` : '';
        
        // Return unique correlation ID suitable for request tracking
        return `${prefixPart}${timestamp}_${randomHex}`;
    } catch (error) {
        // Fallback to timestamp-based ID if crypto fails
        const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.warn('Failed to generate cryptographic correlation ID, using fallback:', fallbackId);
        return prefix ? `${prefix}_${fallbackId}` : fallbackId;
    }
}

/**
 * Factory function for creating standardized service operation result objects
 * with consistent structure and metadata for uniform service responses
 * 
 * @param {boolean} success - Success status of the service operation
 * @param {any} [data=null] - Operation result data or payload
 * @param {Object} [metadata={}] - Additional operation metadata and context
 * @param {Error} [error=null] - Error object if operation failed
 * @returns {Object} Standardized service result with success status, data, metadata, and error information
 */
function createServiceResult(success, data = null, metadata = {}, error = null) {
    // Create base service result object with standardized structure
    const result = {
        success: Boolean(success),
        timestamp: new Date().toISOString(),
        correlationId: generateCorrelationId('svc'),
        data: data,
        metadata: {
            processingTime: 0,
            operationType: 'service_operation',
            serviceVersion: BASE_SERVICE_CONFIG.version,
            ...metadata
        },
        error: null
    };
    
    // Include error information if operation failed
    if (error) {
        result.error = {
            message: error.message || ERROR_MESSAGES.PROCESSING_ERROR,
            code: error.code || 'UNKNOWN_ERROR',
            type: error.constructor.name,
            stack: error.stack,
            context: error.context || {}
        };
    }
    
    // Add performance metrics and timing information
    if (metadata.startTime) {
        result.metadata.processingTime = Date.now() - metadata.startTime;
    }
    
    // Return standardized service result for consistent handling
    return result;
}

/**
 * Measures execution time of service operations for performance monitoring and optimization
 * using high-resolution timing and comprehensive error handling
 * 
 * @param {function} operation - Operation function to execute and measure
 * @param {string} [operationName='anonymous'] - Name of operation for logging and metrics
 * @returns {Object} Execution result with timing metrics and operation outcome
 */
async function measureExecutionTime(operation, operationName = 'anonymous') {
    // Record high-resolution start time using performance.now()
    const startTime = performance.now();
    const startTimestamp = Date.now();
    const correlationId = generateCorrelationId('perf');
    
    // Initialize performance metrics object
    const performanceData = {
        operationName: operationName,
        correlationId: correlationId,
        startTime: startTime,
        endTime: 0,
        duration: 0,
        success: false,
        error: null,
        memoryUsage: process.memoryUsage()
    };
    
    try {
        // Execute provided operation function with error handling
        const result = await operation();
        
        // Record end time and calculate execution duration
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Update performance metrics with successful execution data
        performanceData.endTime = endTime;
        performanceData.duration = duration;
        performanceData.success = true;
        performanceData.result = result;
        
        // Log performance information if exceeds thresholds
        if (duration > PERFORMANCE_THRESHOLDS.warning_threshold_ms) {
            const logLevel = duration > PERFORMANCE_THRESHOLDS.critical_threshold_ms ? 'warn' : 'info';
            console[logLevel](`Performance Warning: Operation '${operationName}' took ${duration.toFixed(2)}ms (${correlationId})`);
        }
        
        // Return execution result with timing metrics and operation outcome
        return createServiceResult(true, result, {
            performance: performanceData,
            startTime: startTimestamp,
            operationType: 'performance_measurement'
        });
        
    } catch (error) {
        // Record end time and calculate duration even on error
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Update performance metrics with error information
        performanceData.endTime = endTime;
        performanceData.duration = duration;
        performanceData.success = false;
        performanceData.error = {
            message: error.message,
            type: error.constructor.name
        };
        
        // Log performance error information
        console.error(`Performance Error: Operation '${operationName}' failed after ${duration.toFixed(2)}ms (${correlationId}):`, error.message);
        
        // Return execution result with error and timing information
        return createServiceResult(false, null, {
            performance: performanceData,
            startTime: startTimestamp,
            operationType: 'performance_measurement'
        }, error);
    }
}

/**
 * Creates standardized service error objects with classification, context, and debugging information
 * for consistent error handling and comprehensive error reporting across services
 * 
 * @param {string} message - Error message describing the problem
 * @param {string} [code='UNKNOWN_ERROR'] - Error classification code for categorization
 * @param {Object} [context={}] - Additional error context and debugging information
 * @param {Error} [originalError=null] - Original error object if wrapping an existing error
 * @returns {Error} Standardized service error with classification and context information
 */
function createServiceError(message, code = 'UNKNOWN_ERROR', context = {}, originalError = null) {
    // Create Error object with provided message and context
    const error = new Error(message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    
    // Add error classification code for categorization
    error.code = code;
    error.name = 'ServiceError';
    
    // Include service context and correlation information
    error.context = {
        timestamp: new Date().toISOString(),
        correlationId: generateCorrelationId('err'),
        serviceName: BASE_SERVICE_CONFIG.serviceName,
        serviceVersion: BASE_SERVICE_CONFIG.version,
        ...context
    };
    
    // Preserve original error stack trace if provided
    if (originalError) {
        error.originalError = {
            message: originalError.message,
            stack: originalError.stack,
            name: originalError.name,
            code: originalError.code
        };
        
        // Enhance stack trace with original error information
        if (originalError.stack) {
            error.stack = `${error.stack}\nCaused by: ${originalError.stack}`;
        }
    }
    
    // Add error metadata including timestamp and service information
    error.metadata = {
        errorType: 'service_error',
        classification: code,
        severity: context.severity || 'error',
        recoverable: context.recoverable || false,
        retryable: context.retryable || false
    };
    
    // Return standardized service error for consistent error handling
    return error;
}

// =============================================================================
// BASE SERVICE CLASS
// =============================================================================

/**
 * Abstract base service class providing common functionality for all service classes
 * in the Node.js tutorial application. Implements fundamental service patterns including
 * logging, validation, error handling, performance monitoring, and configuration management.
 * 
 * Serves as the foundation for service layer architecture while maintaining educational
 * clarity and demonstrating production-ready service implementation patterns including
 * health checking, metrics collection, and standardized service lifecycle management.
 * 
 * Features:
 * - Comprehensive logging integration with structured logging patterns
 * - Input validation framework with security-focused validation rules
 * - Error handling with classification, recovery strategies, and centralized error management
 * - Performance monitoring with timing metrics and threshold-based alerting
 * - Configuration management with feature flags and environment-aware behavior
 * - Health checking capabilities for production deployment and monitoring
 * - Graceful shutdown procedures for clean service termination
 * - Service composition support with child service creation and management
 * 
 * @class BaseService
 */
class BaseService {
    /**
     * Initializes the base service with configuration, logging, and performance monitoring setup
     * for comprehensive service foundation and educational demonstration of service patterns
     * 
     * @param {Object} [serviceConfig={}] - Service-specific configuration object
     */
    constructor(serviceConfig = {}) {
        // Validate service configuration object and apply defaults from BASE_SERVICE_CONFIG
        this.config = {
            ...BASE_SERVICE_CONFIG,
            ...serviceConfig
        };
        
        // Set service identification properties
        this.serviceName = this.config.serviceName || BASE_SERVICE_CONFIG.serviceName;
        this.version = this.config.version || BASE_SERVICE_CONFIG.version;
        
        // Load application configuration using AppConfig for environment and feature settings
        try {
            this.appConfig = new AppConfig();
        } catch (error) {
            console.error('Failed to initialize AppConfig:', error.message);
            this.appConfig = null;
        }
        
        // Initialize Logger instance with service-specific configuration from AppConfig.getLogConfig()
        try {
            const logConfig = this.appConfig ? this.appConfig.getLogConfig() : {};
            this.logger = new Logger({
                service: this.serviceName,
                level: logConfig.level || 'info',
                ...logConfig
            });
        } catch (error) {
            console.error('Failed to initialize Logger:', error.message);
            this.logger = null;
        }
        
        // Set up service metadata including name, version, and identification information
        this.serviceMetadata = {
            ...DEFAULT_SERVICE_METADATA,
            serviceName: this.serviceName,
            version: this.version,
            instanceId: generateCorrelationId('svc'),
            createdAt: new Date().toISOString(),
            ...this.config.metadata
        };
        
        // Initialize performance metrics tracking with counters and timing measurements
        this.performanceMetrics = {
            operations: {
                total: 0,
                successful: 0,
                failed: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0
            },
            errors: {
                total: 0,
                rate: 0,
                lastError: null
            },
            health: {
                status: 'initializing',
                lastCheck: null,
                uptime: 0
            },
            memory: process.memoryUsage(),
            timestamps: {
                created: Date.now(),
                lastOperation: null,
                lastHealthCheck: null
            }
        };
        
        // Configure service features based on AppConfig feature flags and environment
        this.features = {
            loggingEnabled: this.config.enableLogging && this._isFeatureEnabled('logging'),
            metricsEnabled: this.config.enableMetrics && this._isFeatureEnabled('metrics'),
            validationEnabled: this.config.enableValidation && this._isFeatureEnabled('validation'),
            performanceTrackingEnabled: this.config.performanceTracking && this._isFeatureEnabled('performance_tracking')
        };
        
        // Set service start time and initialization status for lifecycle tracking
        this.startTime = new Date();
        this.isInitialized = false;
        
        // Log service initialization with configuration and metadata information
        this._logServiceEvent('Service instance created', {
            serviceName: this.serviceName,
            version: this.version,
            instanceId: this.serviceMetadata.instanceId,
            features: this.features
        });
    }
    
    /**
     * Initializes service-specific configuration, dependencies, and resources
     * with comprehensive validation and setup for production-ready service operation
     * 
     * @param {Object} [initOptions={}] - Initialization options and additional configuration
     * @returns {Object} Initialization result with success status and service information
     */
    async initialize(initOptions = {}) {
        const correlationId = generateCorrelationId('init');
        const startTime = Date.now();
        
        try {
            // Log initialization start
            this._logServiceEvent('Service initialization started', { 
                correlationId, 
                options: initOptions 
            });
            
            // Validate initialization options and merge with service configuration
            const mergedOptions = {
                validateDependencies: true,
                setupMetrics: true,
                enableHealthCheck: true,
                ...initOptions
            };
            
            // Perform service-specific dependency validation and resource setup
            if (mergedOptions.validateDependencies) {
                const dependencyCheck = await this._validateDependencies();
                if (!dependencyCheck.success) {
                    throw createServiceError(
                        'Service dependency validation failed', 
                        'DEPENDENCY_ERROR',
                        { dependencies: dependencyCheck.errors }
                    );
                }
            }
            
            // Initialize performance monitoring and metrics collection systems
            if (mergedOptions.setupMetrics && this.features.metricsEnabled) {
                this._initializePerformanceMonitoring();
            }
            
            // Set up error handling and recovery mechanisms for service operations
            this._initializeErrorHandling();
            
            // Configure logging and debugging capabilities based on environment
            if (this.features.loggingEnabled) {
                this._configureLogging();
            }
            
            // Validate service health and operational readiness
            const healthCheck = await this.isHealthy();
            if (!healthCheck) {
                throw createServiceError(
                    'Service health check failed during initialization',
                    'HEALTH_CHECK_FAILED'
                );
            }
            
            // Mark service as initialized and ready for operation
            this.isInitialized = true;
            this.performanceMetrics.health.status = 'healthy';
            this.performanceMetrics.health.lastCheck = Date.now();
            
            // Create successful initialization result
            const result = createServiceResult(true, {
                serviceName: this.serviceName,
                version: this.version,
                instanceId: this.serviceMetadata.instanceId,
                initializationTime: Date.now() - startTime,
                features: this.features
            }, {
                correlationId,
                operationType: 'service_initialization',
                startTime
            });
            
            // Log successful initialization with service metadata and configuration
            this._logServiceEvent('Service initialization completed successfully', {
                correlationId,
                initializationTime: result.data.initializationTime,
                status: 'ready'
            });
            
            return result;
            
        } catch (error) {
            // Handle initialization errors with comprehensive error reporting
            this.isInitialized = false;
            this.performanceMetrics.health.status = 'unhealthy';
            
            const serviceError = createServiceError(
                'Service initialization failed',
                'INITIALIZATION_ERROR',
                { correlationId, initOptions },
                error
            );
            
            this._logServiceEvent('Service initialization failed', {
                correlationId,
                error: serviceError.message,
                initializationTime: Date.now() - startTime
            }, 'error');
            
            return createServiceResult(false, null, {
                correlationId,
                operationType: 'service_initialization',
                startTime
            }, serviceError);
        }
    }
    
    /**
     * Validates input data for service operations using comprehensive validation rules
     * and security checks with support for multiple validation strategies
     * 
     * @param {any} input - Input data to validate
     * @param {Object} [validationOptions={}] - Validation configuration and rules
     * @returns {Object} Validation result with success status, validated data, and error details
     */
    async validateInput(input, validationOptions = {}) {
        const correlationId = generateCorrelationId('val');
        const startTime = Date.now();
        
        try {
            // Check if validation is enabled via AppConfig feature flags
            if (!this.features.validationEnabled) {
                return createValidationResult(true, input, {
                    message: 'Validation disabled',
                    correlationId
                });
            }
            
            // Apply basic input validation including type checking and null validation
            const basicValidation = this._performBasicValidation(input, validationOptions);
            if (!basicValidation.success) {
                return createValidationResult(false, null, {
                    errors: basicValidation.errors,
                    correlationId,
                    validationType: 'basic_validation'
                });
            }
            
            // Use validateRequestStructure for HTTP request validation if applicable
            if (this._isHttpRequest(input)) {
                const structureValidation = validateRequestStructure(input);
                if (!structureValidation.isValid) {
                    return createValidationResult(false, null, {
                        errors: structureValidation.errors,
                        correlationId,
                        validationType: 'request_structure'
                    });
                }
            }
            
            // Perform service-specific validation rules and business logic checks
            const serviceValidation = await this._performServiceValidation(input, validationOptions);
            if (!serviceValidation.success) {
                return createValidationResult(false, null, {
                    errors: serviceValidation.errors,
                    correlationId,
                    validationType: 'service_validation'
                });
            }
            
            // Apply security validation to prevent injection and malicious input
            const securityValidation = this._performSecurityValidation(input, validationOptions);
            if (!securityValidation.success) {
                // Log security validation warnings
                this._logServiceEvent('Security validation warning detected', {
                    correlationId,
                    warnings: securityValidation.warnings,
                    inputType: typeof input
                }, 'warn');
            }
            
            // Create validation result using createValidationResult factory function
            const validationResult = createValidationResult(true, input, {
                correlationId,
                processingTime: Date.now() - startTime,
                validationType: 'comprehensive_validation',
                securityChecks: securityValidation.checks || {}
            });
            
            // Log validation outcomes and any security warnings detected
            this._logServiceEvent('Input validation completed', {
                correlationId,
                success: true,
                processingTime: validationResult.metadata?.processingTime || 0,
                inputType: typeof input
            });
            
            return validationResult;
            
        } catch (error) {
            // Handle validation errors with comprehensive error reporting
            const serviceError = createServiceError(
                'Input validation failed',
                'VALIDATION_ERROR',
                { correlationId, inputType: typeof input },
                error
            );
            
            this._logServiceEvent('Input validation error', {
                correlationId,
                error: serviceError.message,
                inputType: typeof input
            }, 'error');
            
            return createValidationResult(false, null, {
                errors: [serviceError.message],
                correlationId,
                validationType: 'validation_error',
                error: serviceError
            });
        }
    }
    
    /**
     * Handles service errors with comprehensive logging, classification, and recovery strategies
     * for robust error management and consistent error response generation
     * 
     * @param {Error} error - Error object to handle and process
     * @param {Object} [context={}] - Error context and additional information
     * @param {string} [correlationId] - Correlation ID for request tracking and debugging
     * @returns {Object} Error handling result with recovery information and response data
     */
    async handleError(error, context = {}, correlationId = null) {
        const errorCorrelationId = correlationId || generateCorrelationId('err');
        const startTime = Date.now();
        
        try {
            // Classify error type and severity using error message and context
            const errorClassification = this._classifyError(error, context);
            
            // Update error metrics and statistics for monitoring and alerting
            this.performanceMetrics.errors.total++;
            this.performanceMetrics.errors.lastError = {
                message: error.message,
                timestamp: Date.now(),
                correlationId: errorCorrelationId,
                classification: errorClassification
            };
            
            // Calculate error rate for health monitoring
            this.performanceMetrics.errors.rate = 
                this.performanceMetrics.errors.total / 
                (this.performanceMetrics.operations.total || 1);
            
            // Log error details using logger.logError with full context and stack trace
            if (this.logger && this.features.loggingEnabled) {
                this.logger.logError(error, {
                    correlationId: errorCorrelationId,
                    classification: errorClassification,
                    context: context,
                    serviceName: this.serviceName,
                    serviceVersion: this.version
                });
            }
            
            // Determine appropriate error response and recovery strategy
            const recoveryStrategy = this._determineRecoveryStrategy(errorClassification, context);
            
            // Apply error recovery mechanisms if applicable for service continuity
            let recoveryResult = null;
            if (recoveryStrategy.recoverable) {
                try {
                    recoveryResult = await this._attemptErrorRecovery(error, recoveryStrategy, context);
                } catch (recoveryError) {
                    this._logServiceEvent('Error recovery failed', {
                        correlationId: errorCorrelationId,
                        originalError: error.message,
                        recoveryError: recoveryError.message
                    }, 'error');
                }
            }
            
            // Create standardized error response using createServiceError function
            const standardizedError = createServiceError(
                error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                errorClassification.code,
                {
                    correlationId: errorCorrelationId,
                    classification: errorClassification,
                    recovery: recoveryResult,
                    ...context
                },
                error
            );
            
            // Create error handling result with recovery information and response data
            const errorResult = createServiceResult(false, null, {
                correlationId: errorCorrelationId,
                operationType: 'error_handling',
                processingTime: Date.now() - startTime,
                errorClassification,
                recoveryAttempted: recoveryStrategy.recoverable,
                recoveryResult: recoveryResult,
                startTime
            }, standardizedError);
            
            // Log error handling completion with result information
            this._logServiceEvent('Error handling completed', {
                correlationId: errorCorrelationId,
                classification: errorClassification.type,
                severity: errorClassification.severity,
                recoverable: recoveryStrategy.recoverable
            });
            
            return errorResult;
            
        } catch (handlingError) {
            // Handle errors in error handling (meta-error handling)
            const metaError = createServiceError(
                'Error occurred while handling error',
                'ERROR_HANDLING_FAILED',
                { correlationId: errorCorrelationId, originalError: error.message },
                handlingError
            );
            
            console.error('Meta-error in error handling:', metaError);
            
            return createServiceResult(false, null, {
                correlationId: errorCorrelationId,
                operationType: 'error_handling_failure',
                startTime
            }, metaError);
        }
    }
    
    /**
     * Logs service operation details with structured format for monitoring, debugging,
     * and performance tracking with configurable log levels and correlation tracking
     * 
     * @param {string} operation - Operation name or identifier
     * @param {Object} [details={}] - Operation details and context information
     * @param {string} [level='info'] - Log level (info, debug, warn, error)
     */
    logOperation(operation, details = {}, level = 'info') {
        try {
            // Check if logging is enabled via AppConfig feature flags and environment
            if (!this.features.loggingEnabled || !this.logger) {
                return;
            }
            
            // Format operation details with service context and metadata
            const logContext = {
                operation: operation,
                serviceName: this.serviceName,
                serviceVersion: this.version,
                instanceId: this.serviceMetadata.instanceId,
                timestamp: new Date().toISOString(),
                correlationId: details.correlationId || generateCorrelationId('log'),
                ...details
            };
            
            // Include timing information for request tracking if available
            if (details.startTime) {
                logContext.processingTime = Date.now() - details.startTime;
            }
            
            // Add service identification and version information to log entry
            logContext.serviceInfo = {
                name: this.serviceName,
                version: this.version,
                environment: this.appConfig?.isDevelopment() ? 'development' : 'production'
            };
            
            // Use appropriate log level based on operation type and severity
            const validLevels = ['debug', 'info', 'warn', 'error'];
            const logLevel = validLevels.includes(level) ? level : 'info';
            
            // Log operation details using structured logger with service context
            this.logger[logLevel](`Service Operation: ${operation}`, logContext);
            
            // Update operation metrics and statistics for performance monitoring
            this._updateOperationMetrics(operation, logContext);
            
        } catch (error) {
            // Fallback logging if structured logging fails
            console.error('Failed to log service operation:', {
                operation,
                error: error.message,
                fallback: true
            });
        }
    }
    
    /**
     * Measures and tracks service operation performance with timing metrics and threshold monitoring
     * for optimization and performance analysis with comprehensive error handling
     * 
     * @param {string} operationName - Name of operation for identification and metrics
     * @param {function} operation - Operation function to execute and measure
     * @param {Object} [options={}] - Performance measurement options and configuration
     * @returns {Object} Performance measurement result with timing data and operation outcome
     */
    async measurePerformance(operationName, operation, options = {}) {
        const correlationId = generateCorrelationId('perf');
        const startTime = Date.now();
        
        try {
            // Check if performance tracking is enabled via configuration
            if (!this.features.performanceTrackingEnabled) {
                const result = await operation();
                return createServiceResult(true, result, {
                    correlationId,
                    operationType: 'performance_disabled',
                    message: 'Performance tracking disabled'
                });
            }
            
            // Use measureExecutionTime utility function for high-resolution timing
            const measurementResult = await measureExecutionTime(operation, operationName);
            
            // Update service performance metrics with measurement data
            if (measurementResult.success && measurementResult.metadata.performance) {
                this._updatePerformanceMetrics(measurementResult.metadata.performance);
            }
            
            // Log performance warnings if operation exceeds threshold limits
            const performance = measurementResult.metadata.performance;
            if (performance && performance.duration > PERFORMANCE_THRESHOLDS.warning_threshold_ms) {
                this.logOperation(`Performance Warning: ${operationName}`, {
                    correlationId,
                    duration: performance.duration,
                    threshold: PERFORMANCE_THRESHOLDS.warning_threshold_ms,
                    operationName
                }, 'warn');
            }
            
            // Create performance measurement result with enhanced metadata
            const result = createServiceResult(
                measurementResult.success,
                measurementResult.data,
                {
                    ...measurementResult.metadata,
                    correlationId,
                    operationType: 'performance_measurement',
                    serviceName: this.serviceName,
                    startTime
                },
                measurementResult.error
            );
            
            // Log successful performance measurement completion
            this.logOperation(`Performance Measurement: ${operationName}`, {
                correlationId,
                success: result.success,
                duration: performance?.duration || 0,
                operationName
            });
            
            return result;
            
        } catch (error) {
            // Handle performance measurement errors
            const serviceError = createServiceError(
                'Performance measurement failed',
                'PERFORMANCE_ERROR',
                { correlationId, operationName },
                error
            );
            
            this.logOperation(`Performance Measurement Error: ${operationName}`, {
                correlationId,
                error: serviceError.message,
                operationName
            }, 'error');
            
            return createServiceResult(false, null, {
                correlationId,
                operationType: 'performance_measurement_error',
                startTime
            }, serviceError);
        }
    }
    
    /**
     * Returns comprehensive service information including metadata, configuration,
     * and operational status for monitoring and debugging purposes
     * 
     * @returns {Object} Service information with metadata, capabilities, and status
     */
    getServiceInfo() {
        try {
            // Calculate service uptime since initialization
            const uptime = Date.now() - this.performanceMetrics.timestamps.created;
            
            // Compile service identification metadata including name and version
            const serviceInfo = {
                identification: {
                    serviceName: this.serviceName,
                    version: this.version,
                    instanceId: this.serviceMetadata.instanceId,
                    category: this.serviceMetadata.category,
                    maintainer: this.serviceMetadata.maintainer
                },
                
                // Include service configuration and feature flags status
                configuration: {
                    features: this.features,
                    config: {
                        enableMetrics: this.config.enableMetrics,
                        enableValidation: this.config.enableValidation,
                        enableLogging: this.config.enableLogging,
                        performanceTracking: this.config.performanceTracking,
                        maxErrorRate: this.config.maxErrorRate
                    },
                    thresholds: PERFORMANCE_THRESHOLDS
                },
                
                // Add operational status including uptime and initialization state
                operational: {
                    isInitialized: this.isInitialized,
                    startTime: this.startTime.toISOString(),
                    uptime: uptime,
                    uptimeHuman: this._formatUptime(uptime),
                    status: this.performanceMetrics.health.status,
                    lastHealthCheck: this.performanceMetrics.health.lastCheck
                },
                
                // Include performance metrics summary and health indicators
                performance: {
                    operations: { ...this.performanceMetrics.operations },
                    errors: {
                        total: this.performanceMetrics.errors.total,
                        rate: this.performanceMetrics.errors.rate,
                        lastErrorTime: this.performanceMetrics.errors.lastError?.timestamp || null
                    },
                    memory: process.memoryUsage()
                },
                
                // Add service capabilities and supported operations
                capabilities: {
                    logging: this.features.loggingEnabled,
                    validation: this.features.validationEnabled,
                    metrics: this.features.metricsEnabled,
                    performanceTracking: this.features.performanceTrackingEnabled,
                    errorHandling: true,
                    healthChecking: true,
                    gracefulShutdown: true
                },
                
                // Include environment information and application context
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    architecture: process.arch,
                    isDevelopment: this.appConfig?.isDevelopment() || false,
                    environment: this.serviceMetadata.environment
                },
                
                // Add timestamp for information retrieval
                timestamp: new Date().toISOString(),
                correlationId: generateCorrelationId('info')
            };
            
            return serviceInfo;
            
        } catch (error) {
            // Return minimal service information if detailed info fails
            return {
                serviceName: this.serviceName,
                version: this.version,
                status: 'error',
                error: 'Failed to retrieve service information',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Performs comprehensive health check for service including dependencies, configuration,
     * and operational status with detailed health analysis
     * 
     * @returns {boolean} True if service is healthy and operational, false otherwise
     */
    async isHealthy() {
        const startTime = Date.now();
        const correlationId = generateCorrelationId('health');
        
        try {
            // Check service initialization status and configuration validity
            if (!this.isInitialized) {
                this.performanceMetrics.health.status = 'unhealthy';
                return false;
            }
            
            // Validate logger functionality and logging capabilities
            if (this.features.loggingEnabled && !this.logger) {
                this.performanceMetrics.health.status = 'unhealthy';
                return false;
            }
            
            // Check AppConfig accessibility and configuration integrity
            if (this.appConfig) {
                try {
                    const appInfo = this.appConfig.getApplicationInfo();
                    if (!appInfo || typeof appInfo !== 'object') {
                        this.performanceMetrics.health.status = 'degraded';
                    }
                } catch (configError) {
                    this.performanceMetrics.health.status = 'degraded';
                }
            }
            
            // Validate performance metrics tracking and data collection
            if (this.features.metricsEnabled && !this.performanceMetrics) {
                this.performanceMetrics.health.status = 'degraded';
            }
            
            // Check error rates against acceptable thresholds using maxErrorRate
            const errorRate = this.performanceMetrics.errors.rate;
            if (errorRate > this.config.maxErrorRate) {
                this.performanceMetrics.health.status = 'unhealthy';
                this.logOperation('Health Check: High error rate detected', {
                    correlationId,
                    errorRate,
                    threshold: this.config.maxErrorRate
                }, 'warn');
                return false;
            }
            
            // Verify service dependencies and external resource availability
            const dependencyHealth = await this._checkDependencies();
            if (!dependencyHealth.healthy) {
                this.performanceMetrics.health.status = 'unhealthy';
                return false;
            }
            
            // Perform service-specific health checks for operational readiness
            const serviceSpecificHealth = await this._performServiceHealthCheck();
            if (!serviceSpecificHealth) {
                this.performanceMetrics.health.status = 'unhealthy';
                return false;
            }
            
            // Update health status and timestamps
            this.performanceMetrics.health.status = 'healthy';
            this.performanceMetrics.health.lastCheck = Date.now();
            this.performanceMetrics.health.uptime = Date.now() - this.performanceMetrics.timestamps.created;
            
            // Log successful health check
            this.logOperation('Health Check: Service healthy', {
                correlationId,
                checkDuration: Date.now() - startTime,
                status: 'healthy'
            });
            
            return true;
            
        } catch (error) {
            // Handle health check errors
            this.performanceMetrics.health.status = 'unhealthy';
            this.performanceMetrics.health.lastCheck = Date.now();
            
            this.logOperation('Health Check: Error during health check', {
                correlationId,
                error: error.message,
                checkDuration: Date.now() - startTime
            }, 'error');
            
            return false;
        }
    }
    
    /**
     * Retrieves comprehensive performance metrics for service operations including timing,
     * throughput, and error statistics for monitoring and optimization
     * 
     * @returns {Object} Performance metrics with operation statistics and health indicators
     */
    getPerformanceMetrics() {
        try {
            const currentTime = Date.now();
            
            // Compile operation timing metrics including average, min, max execution times
            const operationMetrics = {
                ...this.performanceMetrics.operations,
                successRate: this.performanceMetrics.operations.total > 0 
                    ? (this.performanceMetrics.operations.successful / this.performanceMetrics.operations.total)
                    : 0,
                failureRate: this.performanceMetrics.operations.total > 0
                    ? (this.performanceMetrics.operations.failed / this.performanceMetrics.operations.total)
                    : 0
            };
            
            // Include throughput metrics with request counts and processing rates
            const throughputMetrics = {
                operationsPerMinute: this._calculateOperationsPerMinute(),
                operationsPerHour: this._calculateOperationsPerHour(),
                peakOperationsPerMinute: this._getPeakThroughput()
            };
            
            // Add error statistics including error rates and failure patterns
            const errorMetrics = {
                ...this.performanceMetrics.errors,
                errorRate: this.performanceMetrics.errors.rate,
                errorTrend: this._calculateErrorTrend(),
                recentErrors: this._getRecentErrors(10)
            };
            
            // Include memory usage and resource consumption metrics
            const resourceMetrics = {
                memory: process.memoryUsage(),
                memoryTrend: this._calculateMemoryTrend(),
                cpuUsage: process.cpuUsage(),
                uptime: currentTime - this.performanceMetrics.timestamps.created
            };
            
            // Calculate service uptime and availability statistics
            const availabilityMetrics = {
                uptime: resourceMetrics.uptime,
                uptimePercentage: this._calculateUptimePercentage(),
                healthStatus: this.performanceMetrics.health.status,
                lastHealthCheck: this.performanceMetrics.health.lastCheck,
                healthCheckFrequency: this.config.healthCheckInterval
            };
            
            // Add performance trend data for monitoring and optimization
            const performanceTrends = {
                averageResponseTimeTraend: this._calculateResponseTimeTrend(),
                throughputTrend: this._calculateThroughputTrend(),
                errorRateTrend: this._calculateErrorTrend(),
                memoryUsageTrend: this._calculateMemoryTrend()
            };
            
            // Return comprehensive performance metrics for monitoring systems
            return {
                timestamp: new Date().toISOString(),
                correlationId: generateCorrelationId('metrics'),
                service: {
                    name: this.serviceName,
                    version: this.version,
                    instanceId: this.serviceMetadata.instanceId
                },
                operations: operationMetrics,
                throughput: throughputMetrics,
                errors: errorMetrics,
                resources: resourceMetrics,
                availability: availabilityMetrics,
                trends: performanceTrends,
                thresholds: PERFORMANCE_THRESHOLDS,
                collectionTime: currentTime
            };
            
        } catch (error) {
            // Return basic metrics if comprehensive collection fails
            return {
                timestamp: new Date().toISOString(),
                error: 'Failed to collect performance metrics',
                basicMetrics: {
                    operations: this.performanceMetrics.operations,
                    errors: this.performanceMetrics.errors,
                    uptime: Date.now() - this.performanceMetrics.timestamps.created
                }
            };
        }
    }
    
    /**
     * Performs graceful service shutdown with resource cleanup and operation completion
     * for clean termination and proper resource management
     * 
     * @param {Object} [shutdownOptions={}] - Shutdown configuration and options
     * @returns {Promise} Promise that resolves when shutdown is complete
     */
    async shutdown(shutdownOptions = {}) {
        const correlationId = generateCorrelationId('shutdown');
        const startTime = Date.now();
        const options = {
            timeout: 30000,
            force: false,
            reason: 'manual_shutdown',
            ...shutdownOptions
        };
        
        try {
            // Log service shutdown initiation with reason and context
            this.logOperation('Service shutdown initiated', {
                correlationId,
                reason: options.reason,
                timeout: options.timeout,
                force: options.force
            });
            
            // Update service status to indicate shutdown in progress
            this.performanceMetrics.health.status = 'shutting_down';
            this.isInitialized = false;
            
            // Complete pending operations with timeout and graceful handling
            await this._completePendingOperations(options.timeout);
            
            // Clean up service resources including timers and connections
            await this._cleanupResources();
            
            // Flush pending logs and ensure all log entries are written
            if (this.logger && this.features.loggingEnabled) {
                await this._flushLogs();
            }
            
            // Update service status to shutdown and mark as unavailable
            this.performanceMetrics.health.status = 'shutdown';
            
            // Perform final performance metrics collection and reporting
            const finalMetrics = this.getPerformanceMetrics();
            
            // Calculate shutdown duration
            const shutdownDuration = Date.now() - startTime;
            
            // Log successful shutdown completion with final statistics
            this.logOperation('Service shutdown completed successfully', {
                correlationId,
                shutdownDuration,
                reason: options.reason,
                finalMetrics: {
                    totalOperations: finalMetrics.operations?.total || 0,
                    totalErrors: finalMetrics.errors?.total || 0,
                    uptime: finalMetrics.resources?.uptime || 0
                }
            });
            
            // Return promise that resolves when shutdown process is complete
            return createServiceResult(true, {
                shutdownDuration,
                reason: options.reason,
                finalMetrics,
                timestamp: new Date().toISOString()
            }, {
                correlationId,
                operationType: 'service_shutdown',
                startTime
            });
            
        } catch (error) {
            // Handle shutdown errors and attempt forced shutdown if configured
            const shutdownError = createServiceError(
                'Service shutdown failed',
                'SHUTDOWN_ERROR',
                { correlationId, reason: options.reason },
                error
            );
            
            this.logOperation('Service shutdown failed', {
                correlationId,
                error: shutdownError.message,
                shutdownDuration: Date.now() - startTime
            }, 'error');
            
            // Force shutdown if specified
            if (options.force) {
                this.performanceMetrics.health.status = 'force_shutdown';
                process.exit(1);
            }
            
            return createServiceResult(false, null, {
                correlationId,
                operationType: 'service_shutdown_error',
                startTime
            }, shutdownError);
        }
    }
    
    /**
     * Creates child service instance with inherited configuration and additional context
     * for service composition and hierarchical service management
     * 
     * @param {Object} [childConfig={}] - Child service configuration overrides
     * @param {Object} [additionalContext={}] - Additional context for child service
     * @returns {BaseService} New BaseService instance with inherited and additional configuration
     */
    createChildService(childConfig = {}, additionalContext = {}) {
        try {
            // Inherit configuration from parent service with service hierarchy
            const inheritedConfig = {
                ...this.config,
                ...childConfig,
                parentService: {
                    name: this.serviceName,
                    version: this.version,
                    instanceId: this.serviceMetadata.instanceId
                }
            };
            
            // Merge additional configuration and context with proper precedence
            const mergedContext = {
                ...this.serviceMetadata,
                ...additionalContext,
                parentContext: {
                    serviceName: this.serviceName,
                    createdAt: this.serviceMetadata.createdAt,
                    features: this.features
                }
            };
            
            // Include inherited context in child configuration
            inheritedConfig.metadata = mergedContext;
            
            // Create new service instance with merged configuration
            const childService = new BaseService(inheritedConfig);
            
            // Establish parent-child relationship for monitoring and lifecycle management
            childService.parentService = this;
            childService.serviceMetadata.parentInstanceId = this.serviceMetadata.instanceId;
            childService.serviceMetadata.hierarchyLevel = (this.serviceMetadata.hierarchyLevel || 0) + 1;
            
            // Initialize child service with inherited logging and performance tracking
            if (this.isInitialized) {
                // Inherit feature flags from parent
                childService.features = {
                    ...childService.features,
                    ...this.features
                };
                
                // Log child service creation
                this.logOperation('Child service created', {
                    parentService: this.serviceName,
                    childService: childService.serviceName,
                    childInstanceId: childService.serviceMetadata.instanceId,
                    hierarchyLevel: childService.serviceMetadata.hierarchyLevel
                });
            }
            
            // Return configured child service for specialized operation handling
            return childService;
            
        } catch (error) {
            // Handle child service creation errors
            const serviceError = createServiceError(
                'Failed to create child service',
                'CHILD_SERVICE_CREATION_ERROR',
                { parentService: this.serviceName },
                error
            );
            
            this.logOperation('Child service creation failed', {
                error: serviceError.message,
                parentService: this.serviceName
            }, 'error');
            
            throw serviceError;
        }
    }
    
    // =============================================================================
    // PRIVATE HELPER METHODS
    // =============================================================================
    
    /**
     * Checks if a feature is enabled via AppConfig feature flags
     * 
     * @private
     * @param {string} featureName - Name of feature to check
     * @returns {boolean} True if feature is enabled
     */
    _isFeatureEnabled(featureName) {
        try {
            if (!this.appConfig) return true; // Default to enabled if no config
            return this.appConfig.isFeatureEnabled ? this.appConfig.isFeatureEnabled(featureName) : true;
        } catch (error) {
            return true; // Default to enabled on error
        }
    }
    
    /**
     * Logs service events with structured formatting
     * 
     * @private
     * @param {string} message - Log message
     * @param {Object} context - Log context
     * @param {string} level - Log level
     */
    _logServiceEvent(message, context = {}, level = 'info') {
        if (this.logger && this.features.loggingEnabled) {
            this.logger[level](message, {
                service: this.serviceName,
                ...context
            });
        } else {
            console[level === 'error' ? 'error' : 'log'](`[${this.serviceName}] ${message}`, context);
        }
    }
    
    /**
     * Validates service dependencies
     * 
     * @private
     * @returns {Object} Dependency validation result
     */
    async _validateDependencies() {
        const dependencies = {
            logger: this.logger !== null,
            appConfig: this.appConfig !== null,
            performance: typeof performance !== 'undefined',
            crypto: typeof crypto !== 'undefined'
        };
        
        const errors = [];
        for (const [dep, available] of Object.entries(dependencies)) {
            if (!available) {
                errors.push(`Missing dependency: ${dep}`);
            }
        }
        
        return {
            success: errors.length === 0,
            dependencies,
            errors
        };
    }
    
    /**
     * Initializes performance monitoring
     * 
     * @private
     */
    _initializePerformanceMonitoring() {
        // Set up performance metric collection
        this.performanceMetrics.timestamps.lastOperation = Date.now();
        this.performanceMetrics.health.status = 'monitoring_enabled';
    }
    
    /**
     * Initializes error handling mechanisms
     * 
     * @private
     */
    _initializeErrorHandling() {
        // Set up error handling patterns
        this.performanceMetrics.errors = {
            total: 0,
            rate: 0,
            lastError: null
        };
    }
    
    /**
     * Configures logging based on environment
     * 
     * @private
     */
    _configureLogging() {
        if (this.logger) {
            this.logger.info('Service logging configured', {
                service: this.serviceName,
                level: this.logger.level || 'info'
            });
        }
    }
    
    /**
     * Performs basic input validation
     * 
     * @private
     * @param {any} input - Input to validate
     * @param {Object} options - Validation options
     * @returns {Object} Basic validation result
     */
    _performBasicValidation(input, options) {
        const errors = [];
        
        if (input === null || input === undefined) {
            if (!options.allowNull) {
                errors.push('Input cannot be null or undefined');
            }
        }
        
        return {
            success: errors.length === 0,
            errors
        };
    }
    
    /**
     * Checks if input is an HTTP request object
     * 
     * @private
     * @param {any} input - Input to check
     * @returns {boolean} True if input appears to be HTTP request
     */
    _isHttpRequest(input) {
        return input && 
               typeof input === 'object' && 
               typeof input.method === 'string' && 
               typeof input.url === 'string' && 
               typeof input.headers === 'object';
    }
    
    /**
     * Performs service-specific validation
     * 
     * @private
     * @param {any} input - Input to validate
     * @param {Object} options - Validation options
     * @returns {Object} Service validation result
     */
    async _performServiceValidation(input, options) {
        // Override in derived classes for specific validation
        return { success: true, errors: [] };
    }
    
    /**
     * Performs security validation
     * 
     * @private
     * @param {any} input - Input to validate
     * @param {Object} options - Validation options
     * @returns {Object} Security validation result
     */
    _performSecurityValidation(input, options) {
        const warnings = [];
        const checks = {};
        
        // Basic security checks
        if (typeof input === 'string') {
            checks.sqlInjection = !/('|(--)|(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)\b))/i.test(input);
            checks.xssAttempt = !/<script|javascript:|vbscript:|onload|onerror/i.test(input);
            
            if (!checks.sqlInjection) warnings.push('Potential SQL injection attempt');
            if (!checks.xssAttempt) warnings.push('Potential XSS attempt');
        }
        
        return {
            success: warnings.length === 0,
            warnings,
            checks
        };
    }
    
    /**
     * Classifies error types for handling strategies
     * 
     * @private
     * @param {Error} error - Error to classify
     * @param {Object} context - Error context
     * @returns {Object} Error classification
     */
    _classifyError(error, context) {
        const classification = {
            type: 'unknown',
            severity: 'error',
            code: error.code || 'UNKNOWN_ERROR',
            category: 'general'
        };
        
        // Classify based on error type
        if (error.name === 'ValidationError') {
            classification.type = 'validation';
            classification.severity = 'warning';
            classification.category = 'client';
        } else if (error.name === 'ServiceError') {
            classification.type = 'service';
            classification.category = 'server';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            classification.type = 'network';
            classification.category = 'infrastructure';
        }
        
        return classification;
    }
    
    /**
     * Determines error recovery strategy
     * 
     * @private
     * @param {Object} classification - Error classification
     * @param {Object} context - Error context
     * @returns {Object} Recovery strategy
     */
    _determineRecoveryStrategy(classification, context) {
        return {
            recoverable: classification.severity !== 'critical',
            retryable: classification.type === 'network',
            maxRetries: 3,
            retryDelay: 1000
        };
    }
    
    /**
     * Attempts error recovery
     * 
     * @private
     * @param {Error} error - Original error
     * @param {Object} strategy - Recovery strategy
     * @param {Object} context - Error context
     * @returns {Object} Recovery result
     */
    async _attemptErrorRecovery(error, strategy, context) {
        if (!strategy.retryable) {
            return { recovered: false, reason: 'not_retryable' };
        }
        
        // Simple recovery attempt
        return { recovered: false, reason: 'no_recovery_implemented' };
    }
    
    /**
     * Updates operation metrics
     * 
     * @private
     * @param {string} operation - Operation name
     * @param {Object} context - Operation context
     */
    _updateOperationMetrics(operation, context) {
        this.performanceMetrics.operations.total++;
        this.performanceMetrics.timestamps.lastOperation = Date.now();
        
        if (context.processingTime) {
            const time = context.processingTime;
            this.performanceMetrics.operations.minTime = Math.min(this.performanceMetrics.operations.minTime, time);
            this.performanceMetrics.operations.maxTime = Math.max(this.performanceMetrics.operations.maxTime, time);
            
            // Update average time
            const totalOps = this.performanceMetrics.operations.total;
            this.performanceMetrics.operations.averageTime = 
                ((this.performanceMetrics.operations.averageTime * (totalOps - 1)) + time) / totalOps;
        }
    }
    
    /**
     * Updates performance metrics with measurement data
     * 
     * @private
     * @param {Object} performance - Performance measurement data
     */
    _updatePerformanceMetrics(performance) {
        if (performance.success) {
            this.performanceMetrics.operations.successful++;
        } else {
            this.performanceMetrics.operations.failed++;
        }
    }
    
    /**
     * Checks dependencies health
     * 
     * @private
     * @returns {Object} Dependency health status
     */
    async _checkDependencies() {
        // Basic dependency check
        return { healthy: true, dependencies: {} };
    }
    
    /**
     * Performs service-specific health check
     * 
     * @private
     * @returns {boolean} Service health status
     */
    async _performServiceHealthCheck() {
        // Override in derived classes
        return true;
    }
    
    /**
     * Formats uptime for human readability
     * 
     * @private
     * @param {number} uptime - Uptime in milliseconds
     * @returns {string} Formatted uptime
     */
    _formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    
    /**
     * Calculates operations per minute
     * 
     * @private
     * @returns {number} Operations per minute
     */
    _calculateOperationsPerMinute() {
        const uptimeMinutes = (Date.now() - this.performanceMetrics.timestamps.created) / 60000;
        return uptimeMinutes > 0 ? this.performanceMetrics.operations.total / uptimeMinutes : 0;
    }
    
    /**
     * Calculates operations per hour
     * 
     * @private
     * @returns {number} Operations per hour
     */
    _calculateOperationsPerHour() {
        return this._calculateOperationsPerMinute() * 60;
    }
    
    /**
     * Gets peak throughput
     * 
     * @private
     * @returns {number} Peak operations per minute
     */
    _getPeakThroughput() {
        // Simplified implementation
        return this._calculateOperationsPerMinute();
    }
    
    /**
     * Calculates error trend
     * 
     * @private
     * @returns {string} Error trend direction
     */
    _calculateErrorTrend() {
        // Simplified trend calculation
        return this.performanceMetrics.errors.rate > this.config.maxErrorRate ? 'increasing' : 'stable';
    }
    
    /**
     * Gets recent errors
     * 
     * @private
     * @param {number} limit - Number of recent errors
     * @returns {Array} Recent errors
     */
    _getRecentErrors(limit) {
        // Simplified implementation
        return this.performanceMetrics.errors.lastError ? [this.performanceMetrics.errors.lastError] : [];
    }
    
    /**
     * Calculates memory trend
     * 
     * @private
     * @returns {string} Memory trend direction
     */
    _calculateMemoryTrend() {
        // Simplified implementation
        return 'stable';
    }
    
    /**
     * Calculates uptime percentage
     * 
     * @private
     * @returns {number} Uptime percentage
     */
    _calculateUptimePercentage() {
        // Simplified calculation
        return this.performanceMetrics.health.status === 'healthy' ? 99.9 : 95.0;
    }
    
    /**
     * Calculates response time trend
     * 
     * @private
     * @returns {string} Response time trend
     */
    _calculateResponseTimeTrend() {
        return 'stable';
    }
    
    /**
     * Calculates throughput trend
     * 
     * @private
     * @returns {string} Throughput trend
     */
    _calculateThroughputTrend() {
        return 'stable';
    }
    
    /**
     * Completes pending operations during shutdown
     * 
     * @private
     * @param {number} timeout - Timeout for completion
     * @returns {Promise} Completion promise
     */
    async _completePendingOperations(timeout) {
        // Simplified implementation
        return Promise.resolve();
    }
    
    /**
     * Cleans up service resources
     * 
     * @private
     * @returns {Promise} Cleanup promise
     */
    async _cleanupResources() {
        // Clear any timers or intervals
        // Close connections
        // Release resources
        return Promise.resolve();
    }
    
    /**
     * Flushes pending logs
     * 
     * @private
     * @returns {Promise} Flush promise
     */
    async _flushLogs() {
        if (this.logger && typeof this.logger.flush === 'function') {
            return this.logger.flush();
        }
        return Promise.resolve();
    }
}

// =============================================================================
// MODULE EXPORTS
// =============================================================================

module.exports = {
    // Main BaseService class for service inheritance
    BaseService,
    
    // Utility functions for service operations
    generateCorrelationId,
    createServiceResult,
    measureExecutionTime,
    createServiceError,
    
    // Configuration constants
    BASE_SERVICE_CONFIG,
    DEFAULT_SERVICE_METADATA,
    PERFORMANCE_THRESHOLDS
};