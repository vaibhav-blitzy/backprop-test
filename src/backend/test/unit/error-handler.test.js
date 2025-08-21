/**
 * Comprehensive Unit Test Suite for ErrorHandler Class and Error Handling Utilities
 * 
 * This test suite provides complete coverage of the ErrorHandler class and associated error handling
 * utilities in the Node.js tutorial application. Tests include error classification, response generation,
 * logging functionality, security measures, and HTTP protocol compliance validation.
 * 
 * Test Categories:
 * - Error Classification Testing: Validates error type detection, severity assessment, and categorization
 * - Error Response Generation: Tests HTTP compliant error response creation with proper headers and content
 * - Error Logging and Correlation: Validates structured logging, correlation tracking, and debugging information
 * - Security Validation: Tests information disclosure prevention and secure error message sanitization
 * - Performance Testing: Validates error handling performance under various load conditions
 * - Edge Case Handling: Tests boundary conditions, malformed inputs, and error recovery scenarios
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive unit testing patterns using Node.js built-in test runner
 * - Shows error handling testing best practices including mock objects and assertion helpers
 * - Illustrates performance testing and security validation in error handling scenarios
 * - Provides examples of correlation tracking and structured test organization
 * - Shows integration testing patterns between error handler and HTTP protocol components
 * 
 * @fileoverview Comprehensive unit tests for ErrorHandler class with mock objects and performance validation
 * @version 1.0.0
 * @author Node.js Tutorial Application Testing Team
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES  
// ============================================================================

// Import Node.js built-in testing framework
import { test, describe, before, after, beforeEach, afterEach } from 'node:test'; // Node.js v20.x - Built-in test runner
import assert from 'node:assert'; // Node.js v20.x - Built-in assertion library
import util from 'node:util'; // Node.js v20.x - Built-in utility module for object inspection

// Import ErrorHandler class and utility functions from main error handling module
import { 
    ErrorHandler,
    classifyError,
    sanitizeErrorMessage,
    formatErrorForLogging,
    generateErrorId
} from '../../lib/error-handler.js';

// Import error message constants and HTTP error messages for validation
import { 
    ERROR_MESSAGES,
    HTTP_ERROR_MESSAGES
} from '../../constants/error-messages.js';

// Import HTTP status code constants for error classification validation
import { 
    HTTP_STATUS_CODES
} from '../../utils/http-status.js';

// Import assertion helper classes for specialized HTTP and performance validation
import { 
    HttpResponseAssertion,
    PerformanceAssertion
} from '../helpers/assertions.js';

// Import mock HTTP request and response classes for controlled testing environment
import { 
    MockHttpRequest,
    createValidHelloRequest,
    createInvalidMethodRequest,
    createInvalidPathRequest,
    createMalformedRequest
} from '../mocks/http-request.mock.js';

import { 
    MockHttpResponse,
    createErrorResponse
} from '../mocks/http-response.mock.js';

// Import test data fixtures for comprehensive scenario testing
import { 
    INVALID_METHOD_REQUESTS,
    INVALID_PATH_REQUESTS,
    MALFORMED_REQUESTS
} from '../fixtures/request-data.js';

import { 
    ERROR_RESPONSES
} from '../fixtures/response-data.js';

// ============================================================================
// TEST CONFIGURATION AND GLOBAL SETUP
// ============================================================================

/**
 * Global test configuration object defining error handler test behavior,
 * validation settings, and performance thresholds for comprehensive testing.
 */
const TEST_ERROR_CONFIG = {
    includeStackTrace: false,
    logErrorDetails: true,
    sanitizeErrorMessages: true,
    enableErrorCorrelation: true
};

/**
 * Test timeout configuration for async operations and performance validation
 */
const TEST_TIMEOUT = 5000;

/**
 * Error handler test suite configuration with execution parameters
 */
const ERROR_HANDLER_SUITE_CONFIG = {
    name: 'ErrorHandler Unit Tests',
    timeout: 5000,
    parallel: false
};

// ============================================================================
// TEST UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates standardized Error objects for testing error handler functionality with 
 * specific properties and context information for comprehensive test scenarios.
 * 
 * @param {string} errorType - Type of error to create (client, server, validation, etc.)
 * @param {string} message - Error message content for testing
 * @param {Object} options - Additional options for error configuration
 * @returns {Error} Error object configured for specific test scenarios with proper stack trace and properties
 */
function createTestError(errorType, message, options = {}) {
    // Create Error object with provided message and error type
    const error = new Error(message);
    
    // Set error properties based on errorType (statusCode, severity, category)
    switch (errorType) {
        case 'client':
            error.statusCode = options.statusCode || HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
            error.severity = 'medium';
            error.category = 'client_error';
            break;
        case 'server':
            error.statusCode = options.statusCode || HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
            error.severity = 'high';
            error.category = 'server_error';
            break;
        case 'validation':
            error.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
            error.severity = 'low';
            error.category = 'validation_error';
            break;
        case 'parse':
            error.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
            error.severity = 'medium';
            error.category = 'parse_error';
            break;
        case 'route':
            error.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;
            error.severity = 'low';
            error.category = 'route_error';
            break;
        case 'method':
            error.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;
            error.severity = 'low';
            error.category = 'method_error';
            break;
        default:
            error.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
            error.severity = 'high';
            error.category = 'unknown_error';
    }
    
    // Add test-specific metadata including correlation ID and timestamp
    error.correlationId = generateCorrelationId();
    error.timestamp = new Date().toISOString();
    error.testMetadata = {
        errorType: errorType,
        testId: generateTestId(),
        createdBy: 'createTestError',
        ...options.metadata
    };
    
    // Configure stack trace and debugging information based on options
    if (options.includeStackTrace === false) {
        error.stack = null;
    }
    
    if (options.additionalProperties) {
        Object.assign(error, options.additionalProperties);
    }
    
    // Return error object ready for error handler testing
    return error;
}

/**
 * Creates test context objects for error handler testing with request information,
 * correlation IDs, and metadata for comprehensive test execution.
 * 
 * @param {Object} requestMock - Mock request object for context creation
 * @param {Object} options - Additional options for context configuration
 * @returns {Object} Test context object with request information and correlation data for error handler testing
 */
function createTestContext(requestMock, options = {}) {
    // Extract request information from requestMock parameter
    const requestInfo = {
        method: requestMock?.method || 'GET',
        url: requestMock?.url || '/test',
        headers: requestMock?.headers || {},
        ip: requestMock?.connection?.remoteAddress || '127.0.0.1',
        userAgent: requestMock?.headers?.['user-agent'] || 'test-agent'
    };
    
    // Generate correlation ID for error tracking and debugging
    const correlationId = generateCorrelationId();
    
    // Create context object with request metadata and timing information
    const context = {
        correlationId: correlationId,
        requestId: generateTestId(),
        timestamp: new Date().toISOString(),
        
        // Add request information and HTTP context
        request: requestInfo,
        
        // Add test-specific properties including test ID and execution context
        test: {
            testId: generateTestId(),
            testName: options.testName || 'Error Handler Test',
            executionEnvironment: 'node-test-runner',
            nodeVersion: process.version
        },
        
        // Include timing information and performance context
        timing: {
            startTime: Date.now(),
            processingTime: null,
            responseTime: null
        },
        
        // Add metadata and debugging context
        metadata: {
            userAgent: requestInfo.userAgent,
            clientIp: requestInfo.ip,
            protocol: 'HTTP/1.1',
            ...options.metadata
        }
    };
    
    // Return complete context object for error handler method testing
    return context;
}

/**
 * Validates error response objects generated by error handler against expected structure,
 * content, and HTTP compliance for comprehensive response validation.
 * 
 * @param {Object} actualResponse - Actual error response generated by error handler
 * @param {Object} expectedResponse - Expected response structure and content
 * @param {Object} validationOptions - Options for response validation behavior
 * @returns {boolean} True if error response is valid and matches expectations, false otherwise
 */
function validateErrorResponse(actualResponse, expectedResponse, validationOptions = {}) {
    try {
        // Validate response structure and required properties using HttpResponseAssertion
        if (!actualResponse || typeof actualResponse !== 'object') {
            throw new Error('Actual response must be an object');
        }
        
        if (!expectedResponse || typeof expectedResponse !== 'object') {
            throw new Error('Expected response must be an object');
        }
        
        // Check HTTP status code matches expected error classification
        if (expectedResponse.statusCode !== undefined) {
            if (actualResponse.statusCode !== expectedResponse.statusCode) {
                throw new Error(`Status code mismatch: expected ${expectedResponse.statusCode}, got ${actualResponse.statusCode}`);
            }
        }
        
        // Verify response headers are properly formatted and secure
        if (expectedResponse.headers) {
            if (!actualResponse.headers || typeof actualResponse.headers !== 'object') {
                throw new Error('Response headers missing or invalid');
            }
            
            Object.keys(expectedResponse.headers).forEach(headerName => {
                const expectedValue = expectedResponse.headers[headerName];
                const actualValue = actualResponse.headers[headerName.toLowerCase()];
                
                if (actualValue !== expectedValue) {
                    throw new Error(`Header mismatch for ${headerName}: expected ${expectedValue}, got ${actualValue}`);
                }
            });
        }
        
        // Validate error message content is sanitized and appropriate
        if (expectedResponse.content !== undefined) {
            const actualContent = actualResponse.body || actualResponse.data || actualResponse.content;
            if (actualContent !== expectedResponse.content) {
                throw new Error(`Content mismatch: expected ${expectedResponse.content}, got ${actualContent}`);
            }
        }
        
        // Check response timing and performance characteristics
        if (validationOptions.validateTiming && actualResponse.responseTime) {
            const maxResponseTime = validationOptions.maxResponseTime || 1000;
            if (actualResponse.responseTime > maxResponseTime) {
                throw new Error(`Response time ${actualResponse.responseTime}ms exceeds maximum ${maxResponseTime}ms`);
            }
        }
        
        // Return validation result with detailed failure information if applicable
        return true;
        
    } catch (error) {
        if (validationOptions.throwOnFailure !== false) {
            throw error;
        }
        return false;
    }
}

/**
 * Sets up test environment for error handler testing including mock objects,
 * context, and performance monitoring for comprehensive test execution.
 * 
 * @param {Object} testConfig - Configuration for test environment setup
 * @returns {Object} Test environment object with initialized error handler, mocks, and utilities
 */
function setupErrorHandlerTest(testConfig = {}) {
    // Initialize ErrorHandler instance with test configuration
    const errorHandler = new ErrorHandler({
        ...TEST_ERROR_CONFIG,
        ...testConfig.errorHandlerConfig
    });
    
    // Create TestExecutionContext for test environment management
    const testContext = new TestExecutionContext({
        testName: testConfig.testName || 'Error Handler Test',
        timeout: testConfig.timeout || TEST_TIMEOUT,
        enableMetrics: true
    });
    
    // Set up mock HTTP request and response objects
    const mockRequest = new MockHttpRequest({
        method: 'GET',
        url: '/hello',
        headers: {
            'user-agent': 'test-agent',
            'accept': 'text/plain'
        }
    });
    
    const mockResponse = new MockHttpResponse();
    
    // Initialize performance monitoring with TestTimer
    const timer = new TestTimer();
    
    // Configure assertion helpers with test-specific settings
    const httpAssertion = new HttpResponseAssertion({
        enableDetailedErrors: true,
        correlationTracking: true
    });
    
    const performanceAssertion = new PerformanceAssertion({
        enableHighPrecisionTiming: true,
        enableMemoryTracking: true
    });
    
    // Return complete test environment ready for error handler testing
    return {
        errorHandler,
        testContext,
        mockRequest,
        mockResponse,
        timer,
        httpAssertion,
        performanceAssertion,
        correlationId: generateCorrelationId()
    };
}

/**
 * Cleans up test environment after error handler testing including resource cleanup
 * and performance reporting for proper test isolation.
 * 
 * @param {Object} testEnvironment - Test environment object from setupErrorHandlerTest
 * @returns {void} No return value, performs cleanup operations
 */
function teardownErrorHandlerTest(testEnvironment) {
    // Clean up mock objects and event listeners
    if (testEnvironment.mockRequest && typeof testEnvironment.mockRequest.cleanup === 'function') {
        testEnvironment.mockRequest.cleanup();
    }
    
    if (testEnvironment.mockResponse && typeof testEnvironment.mockResponse.cleanup === 'function') {
        testEnvironment.mockResponse.cleanup();
    }
    
    // Stop performance timers and collect metrics
    if (testEnvironment.timer && typeof testEnvironment.timer.stop === 'function') {
        try {
            testEnvironment.timer.stop();
        } catch (error) {
            // Timer may already be stopped
        }
    }
    
    // Reset error handler state and statistics
    if (testEnvironment.errorHandler && typeof testEnvironment.errorHandler.getErrorStats === 'function') {
        const stats = testEnvironment.errorHandler.getErrorStats();
        // Log final error statistics for test reporting
    }
    
    // Clear test context and correlation tracking
    if (testEnvironment.testContext && typeof testEnvironment.testContext.cleanup === 'function') {
        testEnvironment.testContext.cleanup();
    }
    
    // Report test performance metrics and resource usage
    // Performance reporting handled by individual assertion helpers
}

// ============================================================================
// UTILITY CLASSES FOR TESTING SUPPORT
// ============================================================================

/**
 * Test timer utility class for measuring execution times and performance characteristics
 * during error handler testing with high-precision timing capabilities.
 */
class TestTimer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.elapsedTime = 0;
    }
    
    /**
     * Starts timing measurement for performance testing
     * @returns {void}
     */
    start() {
        this.startTime = process.hrtime.bigint();
        this.isRunning = true;
        this.endTime = null;
    }
    
    /**
     * Stops timing measurement and calculates elapsed time
     * @returns {void}
     */
    stop() {
        if (this.isRunning) {
            this.endTime = process.hrtime.bigint();
            this.elapsedTime = Number(this.endTime - this.startTime) / 1000000; // Convert to milliseconds
            this.isRunning = false;
        }
    }
    
    /**
     * Gets the duration of the measured operation
     * @returns {number} Duration in milliseconds
     */
    getDuration() {
        if (this.isRunning) {
            const currentTime = process.hrtime.bigint();
            return Number(currentTime - this.startTime) / 1000000;
        }
        return this.elapsedTime;
    }
    
    /**
     * Gets the elapsed time (alias for getDuration for compatibility)
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsed() {
        return this.getDuration();
    }
}

/**
 * Test execution context class for managing error handler test environment
 * and state during test execution with setup and cleanup capabilities.
 */
class TestExecutionContext {
    constructor(config = {}) {
        this.config = config;
        this.state = {
            initialized: false,
            testName: config.testName || 'Unknown Test',
            startTime: Date.now(),
            correlationId: generateCorrelationId(),
            metrics: {
                assertions: 0,
                errors: 0,
                warnings: 0
            }
        };
        this.resources = [];
        this.timers = [];
    }
    
    /**
     * Sets up test execution context and initializes resources
     * @returns {void}
     */
    setup() {
        this.state.initialized = true;
        this.state.setupTime = Date.now();
    }
    
    /**
     * Cleans up test execution context and releases resources
     * @returns {void}
     */
    cleanup() {
        // Clean up timers
        this.timers.forEach(timer => {
            if (timer.isRunning) {
                timer.stop();
            }
        });
        
        // Release resources
        this.resources.forEach(resource => {
            if (resource && typeof resource.cleanup === 'function') {
                resource.cleanup();
            }
        });
        
        this.state.cleanupTime = Date.now();
        this.state.totalExecutionTime = this.state.cleanupTime - this.state.startTime;
    }
    
    /**
     * Gets current test execution state
     * @returns {Object} Current state object with metrics and timing
     */
    getState() {
        return { ...this.state };
    }
}

/**
 * Generates unique correlation ID for error tracking and test correlation.
 * @returns {string} Unique correlation ID for error tracking
 */
function generateCorrelationId() {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates unique test ID for test identification and tracking.
 * @returns {string} Unique test ID for test execution tracking
 */
function generateTestId() {
    return `test-id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Measures performance of async operations with timing and resource monitoring.
 * 
 * @param {Function} operation - Operation function to measure
 * @param {Object} options - Performance measurement options
 * @returns {Object} Performance measurement results with timing and resource data
 */
async function measurePerformance(operation, options = {}) {
    const timer = new TestTimer();
    const startMemory = process.memoryUsage();
    
    timer.start();
    
    let result = null;
    let error = null;
    
    try {
        result = await operation();
    } catch (err) {
        error = err;
    }
    
    timer.stop();
    const endMemory = process.memoryUsage();
    
    return {
        result,
        error,
        timing: {
            duration: timer.getDuration(),
            startTime: timer.startTime,
            endTime: timer.endTime
        },
        memory: {
            start: startMemory,
            end: endMemory,
            growth: {
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                rss: endMemory.rss - startMemory.rss
            }
        }
    };
}

// ============================================================================
// ERROR HANDLER TEST SUITE CLASS
// ============================================================================

/**
 * Comprehensive test suite class for organizing and executing error handler tests with 
 * shared setup, utilities, and validation methods for systematic error handling validation.
 */
class ErrorHandlerTestSuite {
    /**
     * Initializes the error handler test suite with configuration, test utilities, 
     * and shared test infrastructure for comprehensive error handling validation.
     * 
     * @param {Object} config - Test suite configuration object
     */
    constructor(config = {}) {
        // Initialize ErrorHandler instance with test configuration
        this.errorHandler = new ErrorHandler({
            ...TEST_ERROR_CONFIG,
            ...config.errorHandlerConfig
        });
        
        // Set up TestExecutionContext for test environment management
        this.testContext = new TestExecutionContext({
            testName: config.testName || 'ErrorHandler Test Suite',
            timeout: config.timeout || TEST_TIMEOUT,
            enableMetrics: true
        });
        
        // Create assertion helper instances for response and performance validation
        this.responseAssertion = new HttpResponseAssertion({
            enableDetailedErrors: true,
            correlationTracking: true
        });
        
        this.performanceAssertion = new PerformanceAssertion({
            enableHighPrecisionTiming: true,
            enableMemoryTracking: true
        });
        
        // Initialize test metrics tracking for performance analysis
        this.testMetrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            averageExecutionTime: 0,
            testExecutionTimes: [],
            errorCategories: {},
            securityValidations: 0
        };
        
        // Configure test timeout and execution parameters
        this.config = {
            timeout: config.timeout || TEST_TIMEOUT,
            enablePerformanceValidation: config.enablePerformanceValidation !== false,
            enableSecurityValidation: config.enableSecurityValidation !== false,
            strictValidation: config.strictValidation !== false
        };
        
        // Set up shared mock objects and test utilities
        this.sharedMocks = {
            request: null,
            response: null,
            context: null
        };
    }
    
    /**
     * Tests error classification functionality including error type detection, 
     * severity assessment, and status code assignment for comprehensive error categorization.
     * 
     * @param {Error} testError - Error object to test classification for
     * @param {Object} context - Test execution context with correlation and metadata
     * @returns {Object} Test result object with classification validation and performance metrics
     */
    async testErrorClassification(testError, context) {
        try {
            // Call classifyError function with test error and context
            const timer = new TestTimer();
            timer.start();
            
            const classification = classifyError(testError, context);
            
            timer.stop();
            const executionTime = timer.getElapsed();
            
            // Validate error classification including type, severity, and status code
            if (!classification || typeof classification !== 'object') {
                throw new Error('Error classification must return an object');
            }
            
            // Verify error category assignment (client error, server error, validation error)
            const requiredFields = ['type', 'severity', 'statusCode', 'category'];
            requiredFields.forEach(field => {
                if (classification[field] === undefined) {
                    throw new Error(`Classification missing required field: ${field}`);
                }
            });
            
            // Check performance of error classification process
            const maxClassificationTime = 50; // 50ms maximum for classification
            if (executionTime > maxClassificationTime) {
                throw new Error(`Error classification took ${executionTime}ms, exceeds maximum ${maxClassificationTime}ms`);
            }
            
            // Assert error classification matches expected categorization
            const expectedCategory = testError.category || 'unknown_error';
            if (classification.category !== expectedCategory) {
                throw new Error(`Classification category mismatch: expected ${expectedCategory}, got ${classification.category}`);
            }
            
            // Validate status code is appropriate for error type
            const statusCode = classification.statusCode;
            if (testError.statusCode && statusCode !== testError.statusCode) {
                throw new Error(`Classification status code mismatch: expected ${testError.statusCode}, got ${statusCode}`);
            }
            
            // Update test metrics
            this.testMetrics.totalTests++;
            this.testMetrics.passedTests++;
            this.testMetrics.testExecutionTimes.push(executionTime);
            
            if (!this.testMetrics.errorCategories[classification.category]) {
                this.testMetrics.errorCategories[classification.category] = 0;
            }
            this.testMetrics.errorCategories[classification.category]++;
            
            // Return test result with validation status and metrics
            return {
                success: true,
                classification: classification,
                performance: {
                    executionTime: executionTime,
                    withinThreshold: executionTime <= maxClassificationTime
                },
                validation: {
                    hasRequiredFields: true,
                    categoryMatch: true,
                    statusCodeValid: true
                }
            };
            
        } catch (error) {
            this.testMetrics.totalTests++;
            this.testMetrics.failedTests++;
            
            return {
                success: false,
                error: error.message,
                classification: null,
                performance: null
            };
        }
    }
    
    /**
     * Tests error message sanitization functionality including information disclosure 
     * prevention and secure error messaging for security compliance validation.
     * 
     * @param {string} unsafeErrorMessage - Unsafe error message containing sensitive information
     * @param {Object} sanitizationOptions - Options for sanitization behavior
     * @returns {Object} Test result object with sanitization validation and security checks
     */
    async testErrorSanitization(unsafeErrorMessage, sanitizationOptions = {}) {
        try {
            // Call sanitizeErrorMessage function with unsafe error message
            const timer = new TestTimer();
            timer.start();
            
            const sanitizedMessage = sanitizeErrorMessage(unsafeErrorMessage, sanitizationOptions);
            
            timer.stop();
            const executionTime = timer.getElapsed();
            
            // Validate sanitized message removes sensitive information
            const sensitivePatterns = [
                /password/i,
                /token/i,
                /secret/i,
                /key/i,
                /authorization/i,
                /stack trace/i,
                /internal error/i,
                /database/i,
                /connection string/i,
                /api key/i
            ];
            
            const exposedSensitiveInfo = sensitivePatterns.some(pattern => 
                pattern.test(sanitizedMessage)
            );
            
            if (exposedSensitiveInfo) {
                throw new Error('Sanitized message still contains sensitive information');
            }
            
            // Check error message maintains useful information for debugging
            if (!sanitizedMessage || sanitizedMessage.trim().length === 0) {
                throw new Error('Sanitized message is empty or null');
            }
            
            // Verify message length and format constraints are enforced
            const maxMessageLength = sanitizationOptions.maxLength || 500;
            if (sanitizedMessage.length > maxMessageLength) {
                throw new Error(`Sanitized message length ${sanitizedMessage.length} exceeds maximum ${maxMessageLength}`);
            }
            
            // Assert no system paths, stack traces, or sensitive data exposed
            const systemPatterns = [
                /\/home\/[^\/]+/i,
                /\/usr\/[^\/]+/i,
                /C:\\Users\\/i,
                /Error: /,
                /at [A-Za-z]+\./,
                /node_modules/i
            ];
            
            const exposedSystemInfo = systemPatterns.some(pattern => 
                pattern.test(sanitizedMessage)
            );
            
            if (exposedSystemInfo) {
                throw new Error('Sanitized message exposes system paths or internal structure');
            }
            
            // Update security validation metrics
            this.testMetrics.securityValidations++;
            
            // Return test result with security validation status
            return {
                success: true,
                sanitizedMessage: sanitizedMessage,
                security: {
                    noSensitiveInfo: !exposedSensitiveInfo,
                    noSystemInfo: !exposedSystemInfo,
                    withinLengthLimit: sanitizedMessage.length <= maxMessageLength,
                    isNonEmpty: sanitizedMessage.trim().length > 0
                },
                performance: {
                    executionTime: executionTime,
                    withinThreshold: executionTime <= 10 // 10ms threshold for sanitization
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                sanitizedMessage: null,
                security: null
            };
        }
    }
    
    /**
     * Tests error response generation including HTTP compliance, header formatting, 
     * and content sanitization for protocol-compliant error responses.
     * 
     * @param {number} statusCode - HTTP status code for error response
     * @param {string} errorMessage - Error message content for response
     * @param {Object} context - Request context and correlation information
     * @returns {Object} Test result object with response validation and HTTP compliance checks
     */
    async testErrorResponseGeneration(statusCode, errorMessage, context) {
        try {
            // Call createErrorResponse with status code, message, and context
            const timer = new TestTimer();
            timer.start();
            
            const errorResponse = this.errorHandler.createErrorResponse(statusCode, errorMessage, context);
            
            timer.stop();
            const executionTime = timer.getElapsed();
            
            // Validate HTTP status code matches error classification
            if (!errorResponse || typeof errorResponse !== 'object') {
                throw new Error('Error response must be an object');
            }
            
            if (errorResponse.statusCode !== statusCode) {
                throw new Error(`Response status code mismatch: expected ${statusCode}, got ${errorResponse.statusCode}`);
            }
            
            // Check response headers are properly formatted and secure
            if (!errorResponse.headers || typeof errorResponse.headers !== 'object') {
                throw new Error('Error response must include headers object');
            }
            
            // Verify required headers are present
            const requiredHeaders = ['content-type', 'content-length'];
            requiredHeaders.forEach(header => {
                if (!errorResponse.headers[header]) {
                    throw new Error(`Missing required header: ${header}`);
                }
            });
            
            // Verify response content is sanitized and appropriate
            const responseContent = errorResponse.body || errorResponse.content;
            if (!responseContent || typeof responseContent !== 'string') {
                throw new Error('Error response must include content body');
            }
            
            // Assert HTTP protocol compliance including content-length and date headers
            const contentLength = parseInt(errorResponse.headers['content-length']);
            const actualLength = responseContent.length;
            if (contentLength !== actualLength) {
                throw new Error(`Content-Length header mismatch: declared ${contentLength}, actual ${actualLength}`);
            }
            
            // Validate correlation ID is included for error tracking
            if (context.correlationId && !errorResponse.correlationId) {
                throw new Error('Error response missing correlation ID');
            }
            
            // Check response generation performance
            const maxResponseTime = 100; // 100ms maximum for response generation
            if (executionTime > maxResponseTime) {
                throw new Error(`Response generation took ${executionTime}ms, exceeds maximum ${maxResponseTime}ms`);
            }
            
            // Return test result with HTTP compliance validation
            return {
                success: true,
                response: errorResponse,
                compliance: {
                    validStatusCode: true,
                    hasRequiredHeaders: true,
                    contentLengthValid: true,
                    hasCorrelationId: !!errorResponse.correlationId
                },
                performance: {
                    executionTime: executionTime,
                    withinThreshold: executionTime <= maxResponseTime
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                response: null,
                compliance: null
            };
        }
    }
    
    /**
     * Tests error logging functionality including structured logging, correlation tracking, 
     * and performance monitoring for comprehensive error tracking validation.
     * 
     * @param {Error} error - Error object to test logging for
     * @param {Object} context - Request context and correlation information
     * @param {string} requestId - Request ID for correlation tracking
     * @returns {Object} Test result object with logging validation and correlation tracking
     */
    async testErrorLogging(error, context, requestId) {
        try {
            // Call logError method with error, context, and request ID
            const timer = new TestTimer();
            timer.start();
            
            const logResult = this.errorHandler.logError(error, context, requestId);
            
            timer.stop();
            const executionTime = timer.getElapsed();
            
            // Validate structured logging format and content
            if (!logResult || typeof logResult !== 'object') {
                throw new Error('Log result must be an object');
            }
            
            // Check correlation ID is properly included and tracked
            if (requestId && logResult.requestId !== requestId) {
                throw new Error(`Request ID mismatch in log: expected ${requestId}, got ${logResult.requestId}`);
            }
            
            if (context.correlationId && logResult.correlationId !== context.correlationId) {
                throw new Error(`Correlation ID mismatch in log: expected ${context.correlationId}, got ${logResult.correlationId}`);
            }
            
            // Verify appropriate log level is used based on error severity
            const expectedLogLevel = this._getExpectedLogLevel(error);
            if (logResult.level !== expectedLogLevel) {
                throw new Error(`Log level mismatch: expected ${expectedLogLevel}, got ${logResult.level}`);
            }
            
            // Assert sensitive information is not logged in client-facing messages
            const logMessage = logResult.message || '';
            const sensitivePatterns = [
                /password/i,
                /token/i,
                /secret/i,
                /authorization/i
            ];
            
            const containsSensitiveInfo = sensitivePatterns.some(pattern => 
                pattern.test(logMessage)
            );
            
            if (containsSensitiveInfo) {
                throw new Error('Log message contains sensitive information');
            }
            
            // Validate log structure includes required fields
            const requiredLogFields = ['timestamp', 'level', 'message', 'correlationId'];
            requiredLogFields.forEach(field => {
                if (logResult[field] === undefined) {
                    throw new Error(`Log result missing required field: ${field}`);
                }
            });
            
            // Return test result with logging validation and correlation status
            return {
                success: true,
                logResult: logResult,
                validation: {
                    structuredFormat: true,
                    correlationTracked: true,
                    appropriateLogLevel: true,
                    noSensitiveInfo: !containsSensitiveInfo,
                    hasRequiredFields: true
                },
                performance: {
                    executionTime: executionTime,
                    withinThreshold: executionTime <= 50 // 50ms threshold for logging
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                logResult: null,
                validation: null
            };
        }
    }
    
    /**
     * Tests error handling performance including response time, memory usage, 
     * and throughput under various error conditions for performance validation.
     * 
     * @param {Array} errorScenarios - Array of error scenarios to test performance
     * @param {Object} performanceConfig - Performance testing configuration
     * @returns {Object} Performance test results with timing metrics and resource usage analysis
     */
    async testPerformanceCharacteristics(errorScenarios, performanceConfig = {}) {
        try {
            const performanceResults = {
                totalScenarios: errorScenarios.length,
                scenarioResults: [],
                overallMetrics: {
                    averageResponseTime: 0,
                    maxResponseTime: 0,
                    minResponseTime: Infinity,
                    totalMemoryGrowth: 0,
                    averageMemoryUsage: 0
                },
                thresholdValidation: {
                    responseTimeThreshold: performanceConfig.maxResponseTime || 100,
                    memoryThreshold: performanceConfig.maxMemoryUsage || 10 * 1024 * 1024,
                    allScenariosWithinThreshold: true
                }
            };
            
            // Execute error handling scenarios with performance measurement
            for (let i = 0; i < errorScenarios.length; i++) {
                const scenario = errorScenarios[i];
                
                // Measure response time for each error handling operation
                const performanceResult = await measurePerformance(async () => {
                    const mockRequest = new MockHttpRequest(scenario.request || {});
                    const mockResponse = new MockHttpResponse();
                    const testContext = createTestContext(mockRequest, { testName: scenario.name });
                    
                    const testError = createTestError(scenario.errorType, scenario.message, scenario.options);
                    
                    return this.errorHandler.handleError(testError, mockRequest, mockResponse, testContext);
                });
                
                // Monitor memory usage during error processing
                const memoryGrowth = performanceResult.memory.growth.heapUsed;
                const responseTime = performanceResult.timing.duration;
                
                // Calculate throughput for error handling under load
                const scenarioResult = {
                    scenario: scenario.name,
                    responseTime: responseTime,
                    memoryGrowth: memoryGrowth,
                    success: !performanceResult.error,
                    error: performanceResult.error?.message,
                    withinResponseTimeThreshold: responseTime <= performanceResults.thresholdValidation.responseTimeThreshold,
                    withinMemoryThreshold: memoryGrowth <= performanceResults.thresholdValidation.memoryThreshold
                };
                
                performanceResults.scenarioResults.push(scenarioResult);
                
                // Update overall metrics
                performanceResults.overallMetrics.maxResponseTime = Math.max(
                    performanceResults.overallMetrics.maxResponseTime, 
                    responseTime
                );
                performanceResults.overallMetrics.minResponseTime = Math.min(
                    performanceResults.overallMetrics.minResponseTime, 
                    responseTime
                );
                performanceResults.overallMetrics.totalMemoryGrowth += memoryGrowth;
                
                // Check if scenario exceeds thresholds
                if (!scenarioResult.withinResponseTimeThreshold || !scenarioResult.withinMemoryThreshold) {
                    performanceResults.thresholdValidation.allScenariosWithinThreshold = false;
                }
            }
            
            // Calculate final averages
            const responseTimes = performanceResults.scenarioResults.map(r => r.responseTime);
            performanceResults.overallMetrics.averageResponseTime = 
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            
            performanceResults.overallMetrics.averageMemoryUsage = 
                performanceResults.overallMetrics.totalMemoryGrowth / errorScenarios.length;
            
            // Validate performance meets acceptable thresholds
            if (!performanceResults.thresholdValidation.allScenariosWithinThreshold) {
                throw new Error('One or more error handling scenarios exceeded performance thresholds');
            }
            
            // Return comprehensive performance analysis and metrics
            return {
                success: true,
                performanceResults: performanceResults,
                validation: {
                    allScenariosSuccessful: performanceResults.scenarioResults.every(r => r.success),
                    withinPerformanceThresholds: performanceResults.thresholdValidation.allScenariosWithinThreshold,
                    averagePerformance: 'ACCEPTABLE'
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                performanceResults: null
            };
        }
    }
    
    /**
     * Tests security measures in error handling including information disclosure prevention 
     * and secure error responses for comprehensive security validation.
     * 
     * @param {Array} securityTestCases - Array of security test scenarios
     * @param {Object} securityConfig - Security testing configuration
     * @returns {Object} Security test results with vulnerability assessment and protection validation
     */
    async testSecurityMeasures(securityTestCases, securityConfig = {}) {
        try {
            const securityResults = {
                totalTestCases: securityTestCases.length,
                testCaseResults: [],
                securityValidation: {
                    noInformationDisclosure: true,
                    genericErrorMessages: true,
                    noStackTraceExposure: true,
                    secureHeaders: true,
                    allTestsPassed: true
                },
                vulnerabilityAssessment: {
                    informationDisclosureRisk: 'LOW',
                    stackTraceExposureRisk: 'LOW',
                    systemInformationRisk: 'LOW',
                    overallRisk: 'LOW'
                }
            };
            
            // Execute security test cases with various attack vectors
            for (let i = 0; i < securityTestCases.length; i++) {
                const testCase = securityTestCases[i];
                
                const mockRequest = new MockHttpRequest(testCase.request || {});
                const mockResponse = new MockHttpResponse();
                const testContext = createTestContext(mockRequest, { testName: testCase.name });
                
                // Create error with potentially sensitive information
                const testError = createTestError(testCase.errorType, testCase.maliciousMessage, {
                    additionalProperties: testCase.sensitiveProperties || {}
                });
                
                try {
                    // Execute error handling with security monitoring
                    const errorResponse = this.errorHandler.createErrorResponse(
                        testError.statusCode, 
                        testError.message, 
                        testContext
                    );
                    
                    // Validate no sensitive information is disclosed in error responses
                    const responseContent = errorResponse.body || errorResponse.content || '';
                    const sensitivePatterns = testCase.sensitivePatterns || [
                        /password/i, /token/i, /secret/i, /key/i, /authorization/i,
                        /stack trace/i, /internal error/i, /database/i, /connection string/i
                    ];
                    
                    const disclosedSensitiveInfo = sensitivePatterns.some(pattern => 
                        pattern.test(responseContent)
                    );
                    
                    // Check error messages are generic and safe for client consumption
                    const isGenericMessage = this._isGenericErrorMessage(responseContent, testCase.errorType);
                    
                    // Verify stack traces and system details are not exposed
                    const stackTracePatterns = [
                        /at [A-Za-z]+\./,
                        /\/[A-Za-z]+\/[A-Za-z]+/,
                        /node_modules/i,
                        /Error: .+ at /
                    ];
                    
                    const exposedStackTrace = stackTracePatterns.some(pattern => 
                        pattern.test(responseContent)
                    );
                    
                    // Assert proper error response headers prevent security vulnerabilities
                    const securityHeaders = ['x-content-type-options', 'x-frame-options'];
                    const missingSecurityHeaders = securityHeaders.filter(header => 
                        !errorResponse.headers[header]
                    );
                    
                    const testCaseResult = {
                        testCase: testCase.name,
                        success: true,
                        security: {
                            noSensitiveDisclosure: !disclosedSensitiveInfo,
                            genericMessage: isGenericMessage,
                            noStackTrace: !exposedStackTrace,
                            hasSecurityHeaders: missingSecurityHeaders.length === 0
                        },
                        response: {
                            statusCode: errorResponse.statusCode,
                            contentLength: responseContent.length,
                            hasCorrelationId: !!errorResponse.correlationId
                        }
                    };
                    
                    // Update security validation results
                    if (disclosedSensitiveInfo) {
                        securityResults.securityValidation.noInformationDisclosure = false;
                        securityResults.vulnerabilityAssessment.informationDisclosureRisk = 'HIGH';
                        testCaseResult.success = false;
                    }
                    
                    if (!isGenericMessage) {
                        securityResults.securityValidation.genericErrorMessages = false;
                        testCaseResult.success = false;
                    }
                    
                    if (exposedStackTrace) {
                        securityResults.securityValidation.noStackTraceExposure = false;
                        securityResults.vulnerabilityAssessment.stackTraceExposureRisk = 'HIGH';
                        testCaseResult.success = false;
                    }
                    
                    if (missingSecurityHeaders.length > 0) {
                        securityResults.securityValidation.secureHeaders = false;
                        testCaseResult.security.missingSecurityHeaders = missingSecurityHeaders;
                        testCaseResult.success = false;
                    }
                    
                    securityResults.testCaseResults.push(testCaseResult);
                    
                } catch (error) {
                    securityResults.testCaseResults.push({
                        testCase: testCase.name,
                        success: false,
                        error: error.message,
                        security: null
                    });
                    securityResults.securityValidation.allTestsPassed = false;
                }
            }
            
            // Calculate overall security risk assessment
            const failedTests = securityResults.testCaseResults.filter(r => !r.success).length;
            const successRate = ((securityResults.totalTestCases - failedTests) / securityResults.totalTestCases) * 100;
            
            if (successRate < 100) {
                securityResults.vulnerabilityAssessment.overallRisk = successRate >= 90 ? 'MEDIUM' : 'HIGH';
            }
            
            securityResults.securityValidation.allTestsPassed = failedTests === 0;
            
            // Return security validation results with threat protection status
            return {
                success: securityResults.securityValidation.allTestsPassed,
                securityResults: securityResults,
                riskAssessment: securityResults.vulnerabilityAssessment,
                successRate: successRate
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                securityResults: null
            };
        }
    }
    
    /**
     * Private method to get expected log level based on error severity
     * @private
     * @param {Error} error - Error object to determine log level for
     * @returns {string} Expected log level (error, warn, info, debug)
     */
    _getExpectedLogLevel(error) {
        if (error.severity === 'high' || error.statusCode >= 500) {
            return 'error';
        } else if (error.severity === 'medium' || error.statusCode >= 400) {
            return 'warn';
        } else {
            return 'info';
        }
    }
    
    /**
     * Private method to check if error message is generic and safe for clients
     * @private
     * @param {string} message - Error message to validate
     * @param {string} errorType - Type of error for context
     * @returns {boolean} True if message is generic and safe
     */
    _isGenericErrorMessage(message, errorType) {
        // Check against known safe generic messages
        const genericPatterns = [
            /^Bad Request$/i,
            /^Not Found$/i,
            /^Method Not Allowed$/i,
            /^Internal Server Error$/i,
            /^Request could not be processed$/i,
            /^An error occurred$/i
        ];
        
        return genericPatterns.some(pattern => pattern.test(message.trim()));
    }
}

// ============================================================================
// MAIN TEST SUITE EXECUTION
// ============================================================================

describe('ErrorHandler Unit Test Suite', { timeout: TEST_TIMEOUT }, () => {
    let testSuite;
    let testEnvironment;
    
    // Global test suite setup
    before(async () => {
        // Initialize comprehensive test suite with configuration
        testSuite = new ErrorHandlerTestSuite(ERROR_HANDLER_SUITE_CONFIG);
        
        // Set up shared test environment with utilities and mocks
        testEnvironment = setupErrorHandlerTest({
            testName: 'ErrorHandler Complete Test Suite',
            errorHandlerConfig: TEST_ERROR_CONFIG
        });
        
        // Initialize test context for correlation tracking
        testEnvironment.testContext.setup();
    });
    
    // Global test suite cleanup
    after(async () => {
        // Clean up test environment and release resources
        teardownErrorHandlerTest(testEnvironment);
        
        // Report final test metrics and performance statistics
        const finalMetrics = testSuite.testMetrics;
        console.log('Final Test Metrics:', util.inspect(finalMetrics, { depth: 2, colors: true }));
    });
    
    // Individual test setup
    beforeEach(async () => {
        // Reset mock objects for test isolation
        testEnvironment.mockRequest = new MockHttpRequest({
            method: 'GET',
            url: '/hello',
            headers: { 'user-agent': 'test-agent' }
        });
        
        testEnvironment.mockResponse = new MockHttpResponse();
        
        // Create fresh correlation context for each test
        testEnvironment.correlationId = generateCorrelationId();
    });
    
    // Individual test cleanup
    afterEach(async () => {
        // Clean up per-test resources and reset state
        if (testEnvironment.timer && testEnvironment.timer.isRunning) {
            testEnvironment.timer.stop();
        }
        
        // Reset mock object state
        testEnvironment.mockRequest = null;
        testEnvironment.mockResponse = null;
    });
    
    // ========================================================================
    // ERROR CLASSIFICATION TESTS
    // ========================================================================
    
    describe('Error Classification Tests', () => {
        test('should classify client errors correctly', async () => {
            // Test client error classification with various client error types
            const clientErrors = [
                { type: 'client', message: 'Bad Request', statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST },
                { type: 'validation', message: 'Invalid input', statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST },
                { type: 'route', message: 'Route not found', statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND },
                { type: 'method', message: 'Method not allowed', statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED }
            ];
            
            for (const errorConfig of clientErrors) {
                const testError = createTestError(errorConfig.type, errorConfig.message, {
                    statusCode: errorConfig.statusCode
                });
                
                const context = createTestContext(testEnvironment.mockRequest, {
                    testName: `Client Error Classification - ${errorConfig.type}`
                });
                
                const result = await testSuite.testErrorClassification(testError, context);
                
                assert.strictEqual(result.success, true, `Client error classification failed for ${errorConfig.type}: ${result.error}`);
                assert.strictEqual(result.classification.category, errorConfig.type === 'client' ? 'client_error' : `${errorConfig.type}_error`);
                assert.strictEqual(result.classification.statusCode, errorConfig.statusCode);
                assert.strictEqual(result.performance.withinThreshold, true, 'Classification performance exceeded threshold');
            }
        });
        
        test('should classify server errors correctly', async () => {
            // Test server error classification with various server error types
            const serverErrors = [
                { type: 'server', message: 'Internal Server Error', statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR },
                { type: 'server', message: 'Service Unavailable', statusCode: HTTP_STATUS_CODES.SERVER_ERROR.SERVICE_UNAVAILABLE },
                { type: 'server', message: 'Gateway Timeout', statusCode: HTTP_STATUS_CODES.SERVER_ERROR.GATEWAY_TIMEOUT }
            ];
            
            for (const errorConfig of serverErrors) {
                const testError = createTestError(errorConfig.type, errorConfig.message, {
                    statusCode: errorConfig.statusCode
                });
                
                const context = createTestContext(testEnvironment.mockRequest, {
                    testName: `Server Error Classification - ${errorConfig.statusCode}`
                });
                
                const result = await testSuite.testErrorClassification(testError, context);
                
                assert.strictEqual(result.success, true, `Server error classification failed: ${result.error}`);
                assert.strictEqual(result.classification.category, 'server_error');
                assert.strictEqual(result.classification.statusCode, errorConfig.statusCode);
                assert.strictEqual(result.classification.severity, 'high', 'Server errors should have high severity');
            }
        });
        
        test('should handle error classification edge cases', async () => {
            // Test edge cases in error classification including malformed errors and missing properties
            const edgeCases = [
                { error: new Error(), expectedCategory: 'unknown_error' },
                { error: { message: 'Not an Error object' }, expectedCategory: 'unknown_error' },
                { error: createTestError('unknown', 'Unknown error type'), expectedCategory: 'unknown_error' }
            ];
            
            for (const testCase of edgeCases) {
                const context = createTestContext(testEnvironment.mockRequest, {
                    testName: 'Error Classification Edge Case'
                });
                
                try {
                    const classification = classifyError(testCase.error, context);
                    assert.strictEqual(classification.category, testCase.expectedCategory);
                    assert.ok(classification.statusCode >= 400, 'Edge case errors should have error status codes');
                } catch (error) {
                    assert.fail(`Error classification edge case failed: ${error.message}`);
                }
            }
        });
    });
    
    // ========================================================================
    // ERROR SANITIZATION TESTS
    // ========================================================================
    
    describe('Error Message Sanitization Tests', () => {
        test('should sanitize sensitive information from error messages', async () => {
            // Test sanitization of various sensitive information patterns
            const sensitiveMessages = [
                'Database connection failed: password=secret123',
                'Authentication failed: invalid token xyz789',
                'API key validation error: key=abcd1234',
                'Stack trace: Error at /home/user/app/server.js:45',
                'Internal error: connection string mongodb://user:pass@host'
            ];
            
            for (const unsafeMessage of sensitiveMessages) {
                const result = await testSuite.testErrorSanitization(unsafeMessage, {
                    maxLength: 200,
                    removeStackTrace: true
                });
                
                assert.strictEqual(result.success, true, `Sanitization failed for: ${unsafeMessage} - ${result.error}`);
                assert.strictEqual(result.security.noSensitiveInfo, true, 'Sanitized message still contains sensitive information');
                assert.strictEqual(result.security.noSystemInfo, true, 'Sanitized message exposes system information');
                assert.strictEqual(result.security.isNonEmpty, true, 'Sanitized message is empty');
                assert.strictEqual(result.performance.withinThreshold, true, 'Sanitization performance exceeded threshold');
            }
        });
        
        test('should preserve useful error information while sanitizing', async () => {
            // Test that sanitization preserves useful debugging information without exposing sensitive data
            const testMessage = 'Validation failed for user input: invalid email format';
            
            const result = await testSuite.testErrorSanitization(testMessage, {
                preserveValidationInfo: true,
                maxLength: 300
            });
            
            assert.strictEqual(result.success, true, `Sanitization failed: ${result.error}`);
            assert.ok(result.sanitizedMessage.includes('validation'), 'Useful validation information should be preserved');
            assert.ok(result.sanitizedMessage.includes('email'), 'Specific validation context should be preserved');
            assert.strictEqual(result.security.withinLengthLimit, true, 'Sanitized message exceeds length limit');
        });
        
        test('should handle sanitization edge cases', async () => {
            // Test sanitization with edge cases including null, empty, and malformed messages
            const edgeCases = [
                { message: '', expectedResult: false }, // Empty message
                { message: null, expectedResult: false }, // Null message
                { message: undefined, expectedResult: false }, // Undefined message
                { message: 'a'.repeat(1000), expectedResult: true } // Very long message
            ];
            
            for (const testCase of edgeCases) {
                try {
                    const result = await testSuite.testErrorSanitization(testCase.message, {
                        maxLength: 500,
                        allowEmpty: false
                    });
                    
                    if (testCase.expectedResult) {
                        assert.strictEqual(result.success, true, `Sanitization should succeed for valid input`);
                    } else {
                        assert.strictEqual(result.success, false, `Sanitization should fail for invalid input: ${testCase.message}`);
                    }
                } catch (error) {
                    if (testCase.expectedResult) {
                        assert.fail(`Unexpected sanitization error: ${error.message}`);
                    }
                    // Expected failure for invalid inputs
                }
            }
        });
    });
    
    // ========================================================================
    // ERROR RESPONSE GENERATION TESTS
    // ========================================================================
    
    describe('Error Response Generation Tests', () => {
        test('should generate proper HTTP error responses for client errors', async () => {
            // Test client error response generation with proper HTTP status codes and headers
            const clientErrorTests = [
                { 
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                    message: ERROR_MESSAGES.BAD_REQUEST,
                    expectedContent: HTTP_ERROR_MESSAGES.STATUS_400_MESSAGE
                },
                { 
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                    message: ERROR_MESSAGES.NOT_FOUND,
                    expectedContent: HTTP_ERROR_MESSAGES.STATUS_404_MESSAGE
                },
                { 
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    message: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                    expectedContent: HTTP_ERROR_MESSAGES.STATUS_405_MESSAGE
                }
            ];
            
            for (const testConfig of clientErrorTests) {
                const context = createTestContext(testEnvironment.mockRequest, {
                    testName: `Client Error Response - ${testConfig.statusCode}`
                });
                
                const result = await testSuite.testErrorResponseGeneration(
                    testConfig.statusCode,
                    testConfig.message,
                    context
                );
                
                assert.strictEqual(result.success, true, `Error response generation failed: ${result.error}`);
                assert.strictEqual(result.response.statusCode, testConfig.statusCode);
                assert.strictEqual(result.compliance.validStatusCode, true);
                assert.strictEqual(result.compliance.hasRequiredHeaders, true);
                assert.strictEqual(result.performance.withinThreshold, true);
            }
        });
        
        test('should generate proper HTTP error responses for server errors', async () => {
            // Test server error response generation with proper HTTP status codes and secure content
            const serverErrorTests = [
                { 
                    statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
                    expectedContent: HTTP_ERROR_MESSAGES.STATUS_500_MESSAGE
                },
                { 
                    statusCode: HTTP_STATUS_CODES.SERVER_ERROR.SERVICE_UNAVAILABLE,
                    message: 'Service temporarily unavailable',
                    expectedContent: 'Service temporarily unavailable'
                }
            ];
            
            for (const testConfig of serverErrorTests) {
                const context = createTestContext(testEnvironment.mockRequest, {
                    testName: `Server Error Response - ${testConfig.statusCode}`
                });
                
                const result = await testSuite.testErrorResponseGeneration(
                    testConfig.statusCode,
                    testConfig.message,
                    context
                );
                
                assert.strictEqual(result.success, true, `Server error response generation failed: ${result.error}`);
                assert.strictEqual(result.response.statusCode, testConfig.statusCode);
                assert.strictEqual(result.compliance.validStatusCode, true);
                assert.strictEqual(result.compliance.hasCorrelationId, true, 'Server errors should include correlation ID');
            }
        });
        
        test('should include proper headers in error responses', async () => {
            // Test error response header generation for HTTP protocol compliance
            const testError = createTestError('client', 'Test error message');
            const context = createTestContext(testEnvironment.mockRequest);
            
            const errorResponse = testEnvironment.errorHandler.createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                testError.message,
                context
            );
            
            // Validate required HTTP headers are present
            const requiredHeaders = {
                'content-type': 'application/json',
                'content-length': String(errorResponse.body.length)
            };
            
            testEnvironment.httpAssertion.assertResponseHeaders(errorResponse, requiredHeaders, context);
            
            // Validate security headers are included
            const securityHeaders = ['x-content-type-options', 'x-frame-options'];
            securityHeaders.forEach(header => {
                assert.ok(errorResponse.headers[header], `Missing security header: ${header}`);
            });
        });
    });
    
    // ========================================================================
    // ERROR LOGGING TESTS
    // ========================================================================
    
    describe('Error Logging and Correlation Tests', () => {
        test('should log errors with proper correlation tracking', async () => {
            // Test error logging with correlation ID tracking and structured logging
            const testError = createTestError('server', 'Test server error for logging');
            const requestId = generateTestId();
            const context = createTestContext(testEnvironment.mockRequest, {
                testName: 'Error Logging Correlation Test'
            });
            
            const result = await testSuite.testErrorLogging(testError, context, requestId);
            
            assert.strictEqual(result.success, true, `Error logging failed: ${result.error}`);
            assert.strictEqual(result.validation.correlationTracked, true, 'Correlation tracking failed');
            assert.strictEqual(result.validation.structuredFormat, true, 'Log format validation failed');
            assert.strictEqual(result.validation.appropriateLogLevel, true, 'Log level validation failed');
            assert.strictEqual(result.validation.noSensitiveInfo, true, 'Sensitive information found in logs');
        });
        
        test('should format errors properly for logging', async () => {
            // Test error formatting function with comprehensive context information
            const testError = createTestError('validation', 'Validation error with context', {
                additionalProperties: {
                    field: 'email',
                    value: 'invalid-email',
                    constraint: 'email-format'
                }
            });
            
            const context = createTestContext(testEnvironment.mockRequest);
            
            const formattedError = formatErrorForLogging(testError, context);
            
            assert.ok(formattedError, 'Formatted error should not be null or empty');
            assert.ok(typeof formattedError === 'object', 'Formatted error should be an object');
            assert.strictEqual(formattedError.message, testError.message, 'Error message should be preserved');
            assert.strictEqual(formattedError.correlationId, context.correlationId, 'Correlation ID should be included');
            assert.ok(formattedError.timestamp, 'Timestamp should be included');
            assert.strictEqual(formattedError.category, testError.category, 'Error category should be preserved');
        });
        
        test('should generate unique error IDs for correlation', async () => {
            // Test error ID generation for unique error correlation and tracking
            const errorIds = [];
            const iterationCount = 100;
            
            for (let i = 0; i < iterationCount; i++) {
                const errorId = generateErrorId();
                assert.ok(errorId, 'Error ID should not be null or empty');
                assert.ok(typeof errorId === 'string', 'Error ID should be a string');
                assert.ok(errorId.length >= 10, 'Error ID should be sufficiently long for uniqueness');
                
                errorIds.push(errorId);
            }
            
            // Validate all generated IDs are unique
            const uniqueIds = new Set(errorIds);
            assert.strictEqual(uniqueIds.size, iterationCount, 'All generated error IDs should be unique');
        });
    });
    
    // ========================================================================
    // ERROR HANDLER METHOD TESTS
    // ========================================================================
    
    describe('ErrorHandler Method Tests', () => {
        test('should handle client errors through handleClientError method', async () => {
            // Test handleClientError method with various client error scenarios
            const clientError = createTestError('client', 'Invalid request format', {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST
            });
            
            const context = createTestContext(testEnvironment.mockRequest);
            const timer = new TestTimer();
            timer.start();
            
            await testEnvironment.errorHandler.handleClientError(
                clientError,
                testEnvironment.mockRequest,
                testEnvironment.mockResponse,
                context
            );
            
            timer.stop();
            
            // Validate response was generated properly
            assert.strictEqual(testEnvironment.mockResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST);
            assert.ok(testEnvironment.mockResponse.headers['content-type'], 'Content-Type header should be set');
            assert.ok(testEnvironment.mockResponse.body, 'Response body should be present');
            
            // Validate response time is within acceptable limits
            const executionTime = timer.getElapsed();
            assert.ok(executionTime < 100, `Client error handling took ${executionTime}ms, should be under 100ms`);
        });
        
        test('should handle server errors through handleServerError method', async () => {
            // Test handleServerError method with server error scenarios and security validation
            const serverError = createTestError('server', 'Database connection failed', {
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                additionalProperties: {
                    stack: 'Error: Database connection failed\n    at Server.connect (/app/db.js:123)',
                    sensitiveInfo: 'database password: secret123'
                }
            });
            
            const context = createTestContext(testEnvironment.mockRequest);
            
            await testEnvironment.errorHandler.handleServerError(
                serverError,
                testEnvironment.mockRequest,
                testEnvironment.mockResponse,
                context
            );
            
            // Validate response status and content are appropriate
            assert.strictEqual(testEnvironment.mockResponse.statusCode, HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR);
            
            // Ensure sensitive information is not exposed in response
            const responseBody = testEnvironment.mockResponse.body || '';
            assert.ok(!responseBody.includes('password'), 'Response should not contain password information');
            assert.ok(!responseBody.includes('secret123'), 'Response should not contain sensitive values');
            assert.ok(!responseBody.includes('/app/db.js'), 'Response should not contain file paths');
        });
        
        test('should handle parse errors through handleParseError method', async () => {
            // Test handleParseError method with malformed request scenarios
            const parseError = createTestError('parse', 'Invalid JSON in request body');
            const malformedRequest = createMalformedRequest();
            const context = createTestContext(malformedRequest);
            
            await testEnvironment.errorHandler.handleParseError(
                parseError,
                malformedRequest,
                testEnvironment.mockResponse,
                context
            );
            
            // Validate parse error response characteristics
            assert.strictEqual(testEnvironment.mockResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST);
            
            // Verify response content indicates parse error without exposing request details
            const responseContent = testEnvironment.mockResponse.body || '';
            assert.ok(responseContent.includes('request'), 'Parse error message should mention request issue');
            assert.ok(!responseContent.includes('JSON'), 'Parse error should not expose parsing details');
        });
        
        test('should handle route errors through handleRouteError method', async () => {
            // Test handleRouteError method with invalid path scenarios
            const routeError = createTestError('route', ERROR_MESSAGES.ROUTE_NOT_FOUND);
            const invalidPathRequest = createInvalidPathRequest();
            const context = createTestContext(invalidPathRequest);
            
            await testEnvironment.errorHandler.handleRouteError(
                routeError,
                invalidPathRequest,
                testEnvironment.mockResponse,
                context
            );
            
            // Validate route error response characteristics
            assert.strictEqual(testEnvironment.mockResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
            
            // Verify response content is generic and doesn't expose routing information
            const responseContent = testEnvironment.mockResponse.body || '';
            assert.strictEqual(responseContent, HTTP_ERROR_MESSAGES.STATUS_404_MESSAGE);
        });
        
        test('should handle method errors through handleMethodError method', async () => {
            // Test handleMethodError method with unsupported HTTP method scenarios
            const methodError = createTestError('method', ERROR_MESSAGES.UNSUPPORTED_METHOD);
            const invalidMethodRequest = createInvalidMethodRequest();
            const context = createTestContext(invalidMethodRequest);
            
            await testEnvironment.errorHandler.handleMethodError(
                methodError,
                invalidMethodRequest,
                testEnvironment.mockResponse,
                context
            );
            
            // Validate method error response characteristics
            assert.strictEqual(testEnvironment.mockResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED);
            
            // Verify Allow header is set for method not allowed responses
            assert.ok(testEnvironment.mockResponse.headers['allow'], 'Allow header should be set for method errors');
            
            // Validate response content matches expected method error message
            const responseContent = testEnvironment.mockResponse.body || '';
            assert.strictEqual(responseContent, HTTP_ERROR_MESSAGES.STATUS_405_MESSAGE);
        });
    });
    
    // ========================================================================
    // MAIN ERROR HANDLER TESTS
    // ========================================================================
    
    describe('Main Error Handler Tests', () => {
        test('should handle errors through main handleError method', async () => {
            // Test main handleError method with comprehensive error processing
            const testError = createTestError('client', 'Comprehensive error handling test');
            const context = createTestContext(testEnvironment.mockRequest);
            
            const timer = new TestTimer();
            timer.start();
            
            await testEnvironment.errorHandler.handleError(
                testError,
                testEnvironment.mockRequest,
                testEnvironment.mockResponse,
                context
            );
            
            timer.stop();
            
            // Validate error was processed and response generated
            assert.ok(testEnvironment.mockResponse.statusCode >= 400, 'Error status code should be set');
            assert.ok(testEnvironment.mockResponse.headers, 'Response headers should be set');
            assert.ok(testEnvironment.mockResponse.body, 'Response body should be set');
            
            // Validate performance characteristics
            const executionTime = timer.getElapsed();
            assert.ok(executionTime < 200, `Error handling took ${executionTime}ms, should be under 200ms`);
        });
        
        test('should track error statistics through getErrorStats method', async () => {
            // Test error statistics tracking and reporting functionality
            const errors = [
                createTestError('client', 'Client error 1'),
                createTestError('server', 'Server error 1'),
                createTestError('validation', 'Validation error 1'),
                createTestError('client', 'Client error 2')
            ];
            
            // Process multiple errors to generate statistics
            for (const error of errors) {
                const context = createTestContext(testEnvironment.mockRequest);
                await testEnvironment.errorHandler.handleError(
                    error,
                    testEnvironment.mockRequest,
                    new MockHttpResponse(),
                    context
                );
            }
            
            // Retrieve and validate error statistics
            const errorStats = testEnvironment.errorHandler.getErrorStats();
            
            assert.ok(errorStats, 'Error statistics should be available');
            assert.ok(typeof errorStats === 'object', 'Error statistics should be an object');
            assert.ok(errorStats.totalErrors >= errors.length, 'Total error count should reflect processed errors');
            assert.ok(errorStats.errorsByCategory, 'Error statistics should include category breakdown');
            assert.ok(errorStats.errorsByCategory.client_error >= 2, 'Client error count should be tracked');
            assert.ok(errorStats.errorsByCategory.server_error >= 1, 'Server error count should be tracked');
        });
        
        test('should determine error recoverability through isErrorRecoverable method', async () => {
            // Test error recoverability assessment for different error types
            const recoverabilityTests = [
                { error: createTestError('client', 'Bad request'), expectedRecoverable: true },
                { error: createTestError('validation', 'Invalid input'), expectedRecoverable: true },
                { error: createTestError('route', 'Route not found'), expectedRecoverable: true },
                { error: createTestError('method', 'Method not allowed'), expectedRecoverable: true },
                { error: createTestError('server', 'Database connection failed'), expectedRecoverable: false },
                { error: createTestError('server', 'Out of memory'), expectedRecoverable: false }
            ];
            
            for (const test of recoverabilityTests) {
                const isRecoverable = testEnvironment.errorHandler.isErrorRecoverable(test.error);
                
                assert.strictEqual(
                    isRecoverable, 
                    test.expectedRecoverable,
                    `Recoverability assessment incorrect for ${test.error.category}: expected ${test.expectedRecoverable}, got ${isRecoverable}`
                );
            }
        });
    });
    
    // ========================================================================
    // PERFORMANCE TESTING
    // ========================================================================
    
    describe('Error Handler Performance Tests', () => {
        test('should meet performance requirements under normal load', async () => {
            // Test error handler performance with various error scenarios under simulated load
            const errorScenarios = [
                { name: 'Client Error Scenario', errorType: 'client', message: 'Bad request performance test' },
                { name: 'Server Error Scenario', errorType: 'server', message: 'Server error performance test' },
                { name: 'Validation Error Scenario', errorType: 'validation', message: 'Validation performance test' },
                { name: 'Route Error Scenario', errorType: 'route', message: 'Route not found performance test' },
                { name: 'Method Error Scenario', errorType: 'method', message: 'Method not allowed performance test' }
            ];
            
            const performanceConfig = {
                maxResponseTime: 100, // 100ms maximum for error handling
                maxMemoryUsage: 5 * 1024 * 1024 // 5MB maximum memory growth
            };
            
            const result = await testSuite.testPerformanceCharacteristics(errorScenarios, performanceConfig);
            
            assert.strictEqual(result.success, true, `Performance test failed: ${result.error}`);
            assert.strictEqual(result.validation.allScenariosSuccessful, true, 'All error scenarios should complete successfully');
            assert.strictEqual(result.validation.withinPerformanceThresholds, true, 'All scenarios should meet performance thresholds');
            
            // Validate average performance metrics
            const avgResponseTime = result.performanceResults.overallMetrics.averageResponseTime;
            assert.ok(avgResponseTime < performanceConfig.maxResponseTime, 
                `Average response time ${avgResponseTime}ms exceeds threshold ${performanceConfig.maxResponseTime}ms`);
        });
        
        test('should handle high-frequency error processing efficiently', async () => {
            // Test error handler throughput with high-frequency error processing
            const highFrequencyOperation = async () => {
                const testError = createTestError('client', 'High frequency test error');
                const mockRequest = new MockHttpRequest();
                const mockResponse = new MockHttpResponse();
                const context = createTestContext(mockRequest);
                
                await testEnvironment.errorHandler.handleError(testError, mockRequest, mockResponse, context);
                return mockResponse;
            };
            
            const expectedThroughput = 50; // 50 operations per second minimum
            const context = createTestContext(testEnvironment.mockRequest, {
                testName: 'High Frequency Error Processing'
            });
            
            const throughputResult = await testEnvironment.performanceAssertion.assertThroughput(
                highFrequencyOperation,
                expectedThroughput,
                context
            );
            
            assert.ok(throughputResult.actualThroughput >= expectedThroughput,
                `Throughput ${throughputResult.actualThroughput} ops/sec below minimum ${expectedThroughput} ops/sec`);
            assert.ok(throughputResult.successRate >= 95, 
                `Success rate ${throughputResult.successRate}% below minimum 95%`);
        });
        
        test('should maintain acceptable memory usage during error processing', async () => {
            // Test memory efficiency during error processing with leak detection
            const memoryTestOperation = async () => {
                const errors = [];
                for (let i = 0; i < 50; i++) {
                    const testError = createTestError('client', `Memory test error ${i}`);
                    errors.push(testError);
                    
                    const mockRequest = new MockHttpRequest();
                    const mockResponse = new MockHttpResponse();
                    const context = createTestContext(mockRequest);
                    
                    await testEnvironment.errorHandler.handleError(testError, mockRequest, mockResponse, context);
                }
                return errors;
            };
            
            const maxMemoryUsage = 10 * 1024 * 1024; // 10MB maximum
            const context = createTestContext(testEnvironment.mockRequest, {
                testName: 'Memory Usage Validation'
            });
            
            const memoryResult = await testEnvironment.performanceAssertion.assertMemoryUsage(
                memoryTestOperation,
                maxMemoryUsage,
                context
            );
            
            assert.ok(memoryResult.memoryAnalysis.growth.heapUsed <= maxMemoryUsage,
                `Memory growth ${memoryResult.memoryAnalysis.growth.heapUsed} bytes exceeds limit ${maxMemoryUsage} bytes`);
            
            // Check for memory leaks by comparing retention vs growth
            const memoryRetention = memoryResult.memoryAnalysis.retention.heapUsed;
            const memoryGrowth = memoryResult.memoryAnalysis.growth.heapUsed;
            const retentionPercentage = (memoryRetention / memoryGrowth) * 100;
            
            assert.ok(retentionPercentage < 50, 
                `Memory retention ${retentionPercentage}% suggests potential memory leak`);
        });
    });
    
    // ========================================================================
    // SECURITY VALIDATION TESTS
    // ========================================================================
    
    describe('Security Validation Tests', () => {
        test('should prevent information disclosure in error responses', async () => {
            // Test security measures with comprehensive attack scenarios for information disclosure prevention
            const securityTestCases = [
                {
                    name: 'Password Disclosure Test',
                    errorType: 'server',
                    maliciousMessage: 'Database authentication failed: password=admin123',
                    sensitivePatterns: [/password/i, /admin123/]
                },
                {
                    name: 'Stack Trace Disclosure Test',
                    errorType: 'server',
                    maliciousMessage: 'Internal error at /home/app/server.js line 45',
                    sensitivePatterns: [/\/home\/app/i, /server\.js/i, /line \d+/i]
                },
                {
                    name: 'API Key Disclosure Test',
                    errorType: 'client',
                    maliciousMessage: 'Authentication failed: API key sk_test_xyz789 invalid',
                    sensitivePatterns: [/api key/i, /sk_test_xyz789/]
                },
                {
                    name: 'Database Connection Disclosure Test',
                    errorType: 'server',
                    maliciousMessage: 'Connection failed: mongodb://user:pass@localhost:27017/app',
                    sensitivePatterns: [/mongodb:\/\//i, /user:pass/i, /localhost:27017/i]
                }
            ];
            
            const securityConfig = {
                strictValidation: true,
                enableVulnerabilityScanning: true
            };
            
            const result = await testSuite.testSecurityMeasures(securityTestCases, securityConfig);
            
            assert.strictEqual(result.success, true, `Security validation failed: ${result.error}`);
            assert.strictEqual(result.securityResults.securityValidation.noInformationDisclosure, true, 'Information disclosure detected');
            assert.strictEqual(result.securityResults.securityValidation.genericErrorMessages, true, 'Non-generic error messages found');
            assert.strictEqual(result.securityResults.securityValidation.noStackTraceExposure, true, 'Stack trace exposure detected');
            assert.strictEqual(result.riskAssessment.overallRisk, 'LOW', 'Overall security risk should be LOW');
            assert.strictEqual(result.successRate, 100, 'All security tests should pass');
        });
        
        test('should include security headers in error responses', async () => {
            // Test security header inclusion in error responses for security hardening
            const testError = createTestError('client', 'Security header test error');
            const context = createTestContext(testEnvironment.mockRequest);
            
            const errorResponse = testEnvironment.errorHandler.createErrorResponse(
                HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                testError.message,
                context
            );
            
            // Validate security headers are present and properly configured
            const requiredSecurityHeaders = {
                'x-content-type-options': 'nosniff',
                'x-frame-options': 'DENY',
                'x-xss-protection': '1; mode=block'
            };
            
            Object.keys(requiredSecurityHeaders).forEach(header => {
                assert.strictEqual(
                    errorResponse.headers[header],
                    requiredSecurityHeaders[header],
                    `Security header ${header} missing or incorrect`
                );
            });
        });
    });
    
    // ========================================================================
    // INTEGRATION TESTS WITH FIXTURES
    // ========================================================================
    
    describe('Integration Tests with Test Fixtures', () => {
        test('should handle invalid method requests from fixtures', async () => {
            // Test error handling integration with invalid method request fixtures
            const invalidMethodRequests = [
                INVALID_METHOD_REQUESTS.postRequest,
                INVALID_METHOD_REQUESTS.putRequest,
                INVALID_METHOD_REQUESTS.deleteRequest
            ];
            
            for (const requestFixture of invalidMethodRequests) {
                const mockRequest = new MockHttpRequest(requestFixture);
                const mockResponse = new MockHttpResponse();
                const context = createTestContext(mockRequest);
                
                // Create method error based on unsupported method
                const methodError = createTestError('method', ERROR_MESSAGES.UNSUPPORTED_METHOD, {
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED
                });
                
                await testEnvironment.errorHandler.handleMethodError(
                    methodError,
                    mockRequest,
                    mockResponse,
                    context
                );
                
                // Validate response matches expected error response fixture
                const expectedResponse = ERROR_RESPONSES.methodNotAllowedResponse;
                const isValid = validateErrorResponse(mockResponse, expectedResponse, {
                    validateTiming: false,
                    throwOnFailure: false
                });
                
                assert.strictEqual(isValid, true, `Invalid method request handling failed for ${mockRequest.method}`);
            }
        });
        
        test('should handle invalid path requests from fixtures', async () => {
            // Test error handling integration with invalid path request fixtures
            const invalidPathRequests = [
                INVALID_PATH_REQUESTS.rootPath,
                INVALID_PATH_REQUESTS.nonExistentPath
            ];
            
            for (const requestFixture of invalidPathRequests) {
                const mockRequest = new MockHttpRequest(requestFixture);
                const mockResponse = new MockHttpResponse();
                const context = createTestContext(mockRequest);
                
                // Create route error for invalid path
                const routeError = createTestError('route', ERROR_MESSAGES.ROUTE_NOT_FOUND, {
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
                });
                
                await testEnvironment.errorHandler.handleRouteError(
                    routeError,
                    mockRequest,
                    mockResponse,
                    context
                );
                
                // Validate response matches expected error response fixture
                const expectedResponse = ERROR_RESPONSES.notFoundResponse;
                const isValid = validateErrorResponse(mockResponse, expectedResponse, {
                    validateTiming: false,
                    throwOnFailure: false
                });
                
                assert.strictEqual(isValid, true, `Invalid path request handling failed for ${mockRequest.url}`);
            }
        });
        
        test('should handle malformed requests from fixtures', async () => {
            // Test error handling integration with malformed request fixtures
            const malformedRequests = [
                MALFORMED_REQUESTS.missingHeaders,
                MALFORMED_REQUESTS.invalidHeaders
            ];
            
            for (const requestFixture of malformedRequests) {
                const mockRequest = new MockHttpRequest(requestFixture);
                const mockResponse = new MockHttpResponse();
                const context = createTestContext(mockRequest);
                
                // Create parse error for malformed request
                const parseError = createTestError('parse', 'Malformed request format', {
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST
                });
                
                await testEnvironment.errorHandler.handleParseError(
                    parseError,
                    mockRequest,
                    mockResponse,
                    context
                );
                
                // Validate response matches expected error response fixture
                const expectedResponse = ERROR_RESPONSES.badRequestResponse;
                const isValid = validateErrorResponse(mockResponse, expectedResponse, {
                    validateTiming: false,
                    throwOnFailure: false
                });
                
                assert.strictEqual(isValid, true, `Malformed request handling failed for request fixture`);
            }
        });
    });
    
    // ========================================================================
    // EDGE CASE AND ERROR RECOVERY TESTS
    // ========================================================================
    
    describe('Edge Cases and Error Recovery Tests', () => {
        test('should handle null and undefined error inputs gracefully', async () => {
            // Test error handler resilience with null, undefined, and malformed error inputs
            const edgeCaseInputs = [
                { error: null, expectedStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR },
                { error: undefined, expectedStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR },
                { error: 'string error', expectedStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR },
                { error: { message: 'Not an Error object' }, expectedStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR }
            ];
            
            for (const testCase of edgeCaseInputs) {
                const mockRequest = new MockHttpRequest();
                const mockResponse = new MockHttpResponse();
                const context = createTestContext(mockRequest);
                
                try {
                    await testEnvironment.errorHandler.handleError(
                        testCase.error,
                        mockRequest,
                        mockResponse,
                        context
                    );
                    
                    // Validate error handler gracefully handles edge case input
                    assert.strictEqual(mockResponse.statusCode, testCase.expectedStatus);
                    assert.ok(mockResponse.body, 'Response body should be generated even for edge case errors');
                    
                } catch (error) {
                    assert.fail(`Error handler should gracefully handle edge case input: ${error.message}`);
                }
            }
        });
        
        test('should handle error handler internal errors gracefully', async () => {
            // Test error handler behavior when internal error processing fails
            const testError = createTestError('server', 'Test error for internal error scenario');
            
            // Create problematic mock response that will cause internal errors
            const problematicMockResponse = new MockHttpResponse();
            // Override writeHead to throw error
            problematicMockResponse.writeHead = () => {
                throw new Error('Mock response internal error');
            };
            
            const context = createTestContext(testEnvironment.mockRequest);
            
            try {
                await testEnvironment.errorHandler.handleError(
                    testError,
                    testEnvironment.mockRequest,
                    problematicMockResponse,
                    context
                );
                
                // Even with internal errors, error handler should attempt fallback response
                assert.ok(true, 'Error handler handled internal error gracefully');
                
            } catch (error) {
                // Error handler should not throw unhandled errors
                assert.fail(`Error handler should handle internal errors gracefully: ${error.message}`);
            }
        });
        
        test('should validate error handler configuration and initialization', async () => {
            // Test error handler initialization with various configuration scenarios
            const configurationTests = [
                { config: {}, description: 'Default configuration' },
                { config: { includeStackTrace: true }, description: 'Stack trace enabled' },
                { config: { sanitizeErrorMessages: false }, description: 'Sanitization disabled' },
                { config: { enableErrorCorrelation: false }, description: 'Correlation disabled' }
            ];
            
            for (const configTest of configurationTests) {
                try {
                    const testErrorHandler = new ErrorHandler(configTest.config);
                    assert.ok(testErrorHandler, `Error handler should initialize with ${configTest.description}`);
                    
                    // Test basic functionality with configuration
                    const testError = createTestError('client', 'Configuration test error');
                    const mockRequest = new MockHttpRequest();
                    const mockResponse = new MockHttpResponse();
                    const context = createTestContext(mockRequest);
                    
                    await testErrorHandler.handleError(testError, mockRequest, mockResponse, context);
                    
                    assert.ok(mockResponse.statusCode >= 400, 'Error handler should generate error response');
                    
                } catch (error) {
                    assert.fail(`Error handler configuration test failed for ${configTest.description}: ${error.message}`);
                }
            }
        });
    });
    
    // ========================================================================
    // COMPREHENSIVE INTEGRATION TESTS
    // ========================================================================
    
    describe('Comprehensive Integration Tests', () => {
        test('should demonstrate complete error handling workflow', async () => {
            // Comprehensive integration test demonstrating complete error handling workflow
            const workflowSteps = [
                'Error Classification',
                'Message Sanitization', 
                'Response Generation',
                'Error Logging',
                'Performance Validation',
                'Security Compliance'
            ];
            
            const workflowResults = {};
            
            // Create comprehensive test error with various properties
            const comprehensiveError = createTestError('server', 'Comprehensive workflow test error: database connection failed with password=secret123', {
                statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                additionalProperties: {
                    stack: 'Error: Database connection failed\n    at Database.connect (/app/database.js:123)',
                    connectionString: 'mongodb://user:password@localhost:27017/app',
                    sensitiveData: 'API_KEY=abcd1234'
                }
            });
            
            const context = createTestContext(testEnvironment.mockRequest, {
                testName: 'Comprehensive Error Handling Workflow'
            });
            
            // Step 1: Error Classification
            const classificationResult = await testSuite.testErrorClassification(comprehensiveError, context);
            workflowResults['Error Classification'] = classificationResult.success;
            assert.strictEqual(classificationResult.success, true, 'Error classification step failed');
            
            // Step 2: Message Sanitization
            const sanitizationResult = await testSuite.testErrorSanitization(comprehensiveError.message);
            workflowResults['Message Sanitization'] = sanitizationResult.success;
            assert.strictEqual(sanitizationResult.success, true, 'Message sanitization step failed');
            
            // Step 3: Response Generation
            const responseResult = await testSuite.testErrorResponseGeneration(
                comprehensiveError.statusCode,
                sanitizationResult.sanitizedMessage,
                context
            );
            workflowResults['Response Generation'] = responseResult.success;
            assert.strictEqual(responseResult.success, true, 'Response generation step failed');
            
            // Step 4: Error Logging
            const loggingResult = await testSuite.testErrorLogging(comprehensiveError, context, context.requestId);
            workflowResults['Error Logging'] = loggingResult.success;
            assert.strictEqual(loggingResult.success, true, 'Error logging step failed');
            
            // Step 5: Performance Validation
            const performanceScenarios = [{
                name: 'Comprehensive Workflow Performance',
                errorType: 'server',
                message: comprehensiveError.message,
                request: { method: 'GET', url: '/hello' }
            }];
            
            const performanceResult = await testSuite.testPerformanceCharacteristics(performanceScenarios, {
                maxResponseTime: 150,
                maxMemoryUsage: 5 * 1024 * 1024
            });
            workflowResults['Performance Validation'] = performanceResult.success;
            assert.strictEqual(performanceResult.success, true, 'Performance validation step failed');
            
            // Step 6: Security Compliance
            const securityTestCases = [{
                name: 'Comprehensive Security Test',
                errorType: 'server',
                maliciousMessage: comprehensiveError.message,
                sensitiveProperties: comprehensiveError
            }];
            
            const securityResult = await testSuite.testSecurityMeasures(securityTestCases);
            workflowResults['Security Compliance'] = securityResult.success;
            assert.strictEqual(securityResult.success, true, 'Security compliance step failed');
            
            // Validate all workflow steps completed successfully
            const allStepsSuccessful = Object.values(workflowResults).every(result => result === true);
            assert.strictEqual(allStepsSuccessful, true, `Workflow steps failed: ${JSON.stringify(workflowResults)}`);
            
            console.log('Comprehensive Error Handling Workflow Results:', workflowResults);
        });
        
        test('should validate error correlation across multiple error instances', async () => {
            // Test error correlation and tracking across multiple related error instances
            const correlationId = generateCorrelationId();
            const relatedErrors = [
                createTestError('client', 'First related error'),
                createTestError('validation', 'Second related error'), 
                createTestError('server', 'Third related error')
            ];
            
            const correlationResults = [];
            
            // Process related errors with same correlation ID
            for (let i = 0; i < relatedErrors.length; i++) {
                const error = relatedErrors[i];
                const mockRequest = new MockHttpRequest();
                const mockResponse = new MockHttpResponse();
                const context = createTestContext(mockRequest, {
                    testName: `Correlation Test ${i + 1}`
                });
                
                // Use same correlation ID for all related errors
                context.correlationId = correlationId;
                
                await testEnvironment.errorHandler.handleError(error, mockRequest, mockResponse, context);
                
                correlationResults.push({
                    errorIndex: i,
                    correlationId: context.correlationId,
                    responseStatus: mockResponse.statusCode,
                    hasCorrelationHeader: !!mockResponse.headers['x-correlation-id']
                });
            }
            
            // Validate all errors maintain same correlation ID
            const allCorrelationIdsMatch = correlationResults.every(result => 
                result.correlationId === correlationId
            );
            
            assert.strictEqual(allCorrelationIdsMatch, true, 'Correlation ID should be consistent across related errors');
            
            // Validate correlation headers are included in responses
            const allHaveCorrelationHeaders = correlationResults.every(result => 
                result.hasCorrelationHeader
            );
            
            assert.strictEqual(allHaveCorrelationHeaders, true, 'All error responses should include correlation headers');
        });
    });
});