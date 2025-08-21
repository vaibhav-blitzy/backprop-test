/**
 * Comprehensive Test Assertion Helper Module for Node.js Tutorial Application
 * 
 * Provides specialized assertion functions for HTTP server testing, response validation, and 
 * Node.js tutorial application specific test scenarios. Implements custom assertion utilities 
 * that extend Node.js built-in assert module with domain-specific validations for server status, 
 * HTTP responses, performance metrics, and educational testing patterns.
 * 
 * This module serves as the central testing authority for the Node.js tutorial application, providing:
 * - Specialized HTTP response assertions with protocol compliance checking
 * - Server status and health validation with operational verification
 * - Performance testing capabilities with timing and resource validation
 * - Enhanced error reporting with correlation tracking and detailed context
 * - Educational testing patterns demonstrating industry-standard practices
 * - Production-ready assertion utilities with comprehensive validation feedback
 * 
 * Educational Objectives:
 * - Demonstrates advanced testing patterns and assertion design
 * - Shows comprehensive HTTP protocol validation through custom assertions
 * - Illustrates performance testing with timing and resource monitoring
 * - Provides examples of enterprise-grade error reporting and debugging
 * - Shows integration patterns between assertion utilities and application components
 * - Demonstrates test correlation tracking and assertion context management
 * 
 * @fileoverview Comprehensive test assertion utilities with specialized HTTP and performance validation
 * @version 1.0.0
 * @author Node.js Tutorial Application Testing Team
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Import Node.js built-in assertion library for core assertion functionality
import assert from 'node:assert'; // Node.js v20.x - Built-in assertion module for test validation

// Import Node.js utility module for object inspection and detailed error reporting
import util from 'node:util'; // Node.js v20.x - Built-in utility module for object formatting and inspection

// Import test utility functions for correlation tracking and timing
import { 
    generateTestId, 
    generateCorrelationId, 
    TestTimer 
} from './test-utils.js';

// Import HTTP status code constants and validation functions
import { 
    HTTP_STATUS_CODES, 
    isValidStatusCode, 
    getStatusCategory, 
    isSuccessStatus, 
    isClientError, 
    isServerError 
} from '../../utils/http-status.js';

// Import response message constants for content validation
import { 
    RESPONSE_MESSAGES 
} from '../../constants/response-messages.js';

// Import HTTP header and content type constants for protocol validation
import { 
    HTTP_HEADERS, 
    CONTENT_TYPES 
} from '../../constants/http-headers.js';

// Import HTTP method constants for method validation
import { 
    HTTP_METHODS 
} from '../../constants/http-methods.js';

// Import Logger class for assertion execution tracking and debugging
import { 
    Logger 
} from '../../utils/logger.js';

// ============================================================================
// GLOBAL ASSERTION CONFIGURATION
// ============================================================================

/**
 * Primary assertion configuration object defining assertion handler behavior,
 * validation settings, and feature enablement for comprehensive assertion execution.
 * Controls assertion execution patterns and debugging capabilities.
 */
const ASSERTION_CONFIG = {
    handlerName: 'AssertionHelper',
    version: '1.0.0',
    enableDetailedErrors: true,
    enableLogging: true,
    enablePerformanceAssertions: true,
    defaultTimeout: 5000,
    correlationTracking: true
};

/**
 * Assertion type constants for categorizing different types of assertion operations
 * and enabling type-specific validation logic and error reporting.
 */
const ASSERTION_TYPES = {
    HTTP_RESPONSE: 'http_response',
    HTTP_STATUS: 'http_status',
    HTTP_HEADERS: 'http_headers',
    HTTP_CONTENT: 'http_content',
    SERVER_STATUS: 'server_status',
    PERFORMANCE: 'performance',
    HELLO_ENDPOINT: 'hello_endpoint',
    ERROR_RESPONSE: 'error_response'
};

/**
 * Assertion severity levels for categorizing assertion failures and determining
 * appropriate error handling and reporting strategies.
 */
const ASSERTION_SEVERITY = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info'
};

/**
 * Default assertion options applied to all assertion operations unless overridden
 * by specific assertion function parameters.
 */
const DEFAULT_ASSERTION_OPTIONS = {
    includeDetails: true,
    logAssertion: true,
    generateCorrelationId: true,
    trackPerformance: false,
    strictValidation: true
};

// ============================================================================
// UTILITY FUNCTIONS FOR ASSERTION SUPPORT
// ============================================================================

/**
 * Creates comprehensive assertion context with correlation tracking, timing information, 
 * and assertion metadata for detailed error reporting and test correlation.
 * 
 * @param {string} testName - Name of the test being executed for context
 * @param {Object} assertionOptions - Configuration options for assertion execution
 * @returns {Object} Assertion context with correlation ID, timing, metadata, and configuration
 */
function createAssertionContext(testName, assertionOptions = {}) {
    try {
        // Generate unique assertion correlation ID using generateCorrelationId for tracking
        const correlationId = generateCorrelationId();
        
        // Initialize assertion timing measurement using TestTimer for performance tracking
        const timer = new TestTimer();
        
        // Create assertion context object with test name and correlation information
        const context = {
            testName: testName || 'Unknown Test',
            correlationId: correlationId,
            timer: timer,
            timestamp: new Date().toISOString(),
            
            // Add assertion configuration options and validation preferences
            options: {
                ...DEFAULT_ASSERTION_OPTIONS,
                ...assertionOptions
            },
            
            // Include test metadata and debugging context for assertion failures
            metadata: {
                testId: generateTestId(),
                executionEnvironment: 'node-test-runner',
                assertionConfigVersion: ASSERTION_CONFIG.version,
                nodeVersion: process.version
            },
            
            // Set up error reporting context and detailed failure information structure
            errorContext: {
                stackTrace: null,
                assertionHistory: [],
                performanceMetrics: {},
                validationResults: {}
            }
        };
        
        // Start timing measurement for performance tracking
        timer.start();
        
        // Return comprehensive assertion context for assertion function usage
        return context;
        
    } catch (error) {
        // Fallback context if creation fails
        return {
            testName: testName || 'Unknown Test',
            correlationId: 'error-' + Date.now(),
            timer: new TestTimer(),
            timestamp: new Date().toISOString(),
            options: DEFAULT_ASSERTION_OPTIONS,
            error: error.message
        };
    }
}

/**
 * Formats detailed assertion error messages with context, expected vs actual values, 
 * and comprehensive debugging information for enhanced test failure analysis.
 * 
 * @param {string} assertionType - Type of assertion that failed for error categorization
 * @param {any} expected - Expected value for comparison and debugging
 * @param {any} actual - Actual value that caused assertion failure
 * @param {Object} context - Assertion context with correlation and debugging information
 * @returns {string} Formatted error message with detailed comparison information and assertion context
 */
function formatAssertionError(assertionType, expected, actual, context) {
    try {
        // Format assertion type and operation description for error message header
        const header = `Assertion Failed: ${assertionType.toUpperCase()}`;
        
        // Create detailed comparison between expected and actual values using util.inspect
        const expectedFormatted = util.inspect(expected, { 
            depth: 3, 
            colors: false, 
            maxArrayLength: 10 
        });
        const actualFormatted = util.inspect(actual, { 
            depth: 3, 
            colors: false, 
            maxArrayLength: 10 
        });
        
        // Include assertion context information including correlation ID and test name
        const contextInfo = `
Test Name: ${context.testName}
Correlation ID: ${context.correlationId}
Timestamp: ${context.timestamp}`;
        
        // Add timing information and performance context if available
        let timingInfo = '';
        if (context.timer) {
            try {
                context.timer.stop();
                const elapsedTime = context.timer.getElapsed();
                timingInfo = `\nExecution Time: ${elapsedTime}ms`;
            } catch (timerError) {
                timingInfo = '\nExecution Time: Unable to measure';
            }
        }
        
        // Include stack trace context and assertion location information
        const stackInfo = context.errorContext?.stackTrace ? 
            `\nStack Trace:\n${context.errorContext.stackTrace}` : '';
        
        // Format error message with color coding and structured layout for readability
        const errorMessage = `
${header}
${contextInfo}${timingInfo}

Expected: ${expectedFormatted}
Actual:   ${actualFormatted}

Assertion Details:
- Type: ${assertionType}
- Severity: ${context.options.strictValidation ? 'CRITICAL' : 'HIGH'}
- Test Environment: ${context.metadata?.executionEnvironment || 'unknown'}
${stackInfo}`;
        
        // Return comprehensive error message for assertion failure reporting
        return errorMessage.trim();
        
    } catch (error) {
        // Fallback error message if formatting fails
        return `Assertion Failed: ${assertionType} - Expected: ${expected}, Actual: ${actual} (Error formatting details: ${error.message})`;
    }
}

/**
 * Logs assertion execution details including success/failure status, performance metrics, 
 * and correlation information for assertion tracking and debugging.
 * 
 * @param {string} assertionType - Type of assertion executed for categorization
 * @param {boolean} success - Whether assertion passed or failed
 * @param {Object} details - Execution details and validation results
 * @param {Object} context - Assertion context with correlation and metadata
 * @returns {void} Logs assertion execution details for monitoring and debugging purposes
 */
function logAssertion(assertionType, success, details, context) {
    // Only log if logging is enabled in configuration
    if (!ASSERTION_CONFIG.enableLogging || !context.options.logAssertion) {
        return;
    }
    
    try {
        // Determine appropriate log level based on assertion success and severity
        const logger = new Logger();
        const logLevel = success ? 'info' : 'error';
        
        // Format assertion details with type, status, and execution information
        const logMessage = `Assertion ${success ? 'PASSED' : 'FAILED'}: ${assertionType}`;
        
        // Include correlation ID and test context for assertion tracking
        const logContext = {
            assertionType: assertionType,
            success: success,
            correlationId: context.correlationId,
            testName: context.testName,
            
            // Add performance metrics and timing information if available
            performance: {},
            details: details || {}
        };
        
        // Add timing information if timer is available
        if (context.timer) {
            try {
                if (!context.timer.isRunning) {
                    logContext.performance.executionTime = context.timer.getElapsed();
                } else {
                    logContext.performance.executionTime = 'still-running';
                }
            } catch (timerError) {
                logContext.performance.executionTime = 'measurement-error';
            }
        }
        
        // Log assertion execution with structured format for monitoring tools
        logger[logLevel](logMessage, logContext);
        
        // Update assertion metrics and statistics for test reporting
        if (success) {
            // Track successful assertion for metrics
        } else {
            // Track failed assertion for metrics and alerting
        }
        
    } catch (error) {
        // Fallback logging if primary logging fails
        console.error(`Assertion logging failed: ${error.message}`);
    }
}

/**
 * Validates assertion function input parameters for correctness and compatibility
 * with assertion requirements and expected data types.
 * 
 * @param {any} actual - Actual value being tested
 * @param {any} expected - Expected value for comparison
 * @param {string} assertionType - Type of assertion being performed
 * @returns {Object} Validation result with status, normalized parameters, and validation details
 */
function validateAssertionInput(actual, expected, assertionType) {
    const validationResult = {
        isValid: true,
        errors: [],
        normalizedActual: actual,
        normalizedExpected: expected,
        validationType: assertionType
    };
    
    try {
        // Check parameter types and null/undefined values for basic validation
        if (actual === undefined) {
            validationResult.errors.push('Actual value is undefined');
            validationResult.isValid = false;
        }
        
        if (expected === undefined && assertionType !== ASSERTION_TYPES.SERVER_STATUS) {
            validationResult.errors.push('Expected value is undefined');
            validationResult.isValid = false;
        }
        
        // Validate assertion type against supported assertion types
        if (!Object.values(ASSERTION_TYPES).includes(assertionType)) {
            validationResult.errors.push(`Invalid assertion type: ${assertionType}`);
            validationResult.isValid = false;
        }
        
        // Normalize input parameters for consistent assertion processing
        switch (assertionType) {
            case ASSERTION_TYPES.HTTP_STATUS:
                // Check parameter compatibility for HTTP status assertion type requirements
                if (typeof actual !== 'number' || typeof expected !== 'number') {
                    validationResult.errors.push('HTTP status assertion requires numeric status codes');
                    validationResult.isValid = false;
                }
                break;
                
            case ASSERTION_TYPES.HTTP_HEADERS:
                // Validate data structure and format for HTTP headers assertion type
                if (typeof actual !== 'object' || actual === null) {
                    validationResult.errors.push('HTTP headers assertion requires object for actual value');
                    validationResult.isValid = false;
                }
                if (typeof expected !== 'object' || expected === null) {
                    validationResult.errors.push('HTTP headers assertion requires object for expected value');
                    validationResult.isValid = false;
                }
                break;
                
            case ASSERTION_TYPES.HTTP_CONTENT:
                // Validate content assertion parameters
                if (typeof actual !== 'string' && actual !== null) {
                    validationResult.normalizedActual = String(actual);
                }
                if (typeof expected !== 'string' && expected !== null) {
                    validationResult.normalizedExpected = String(expected);
                }
                break;
                
            case ASSERTION_TYPES.PERFORMANCE:
                // Validate performance assertion requires numeric values
                if (typeof actual !== 'number' || actual < 0) {
                    validationResult.errors.push('Performance assertion requires non-negative numeric actual value');
                    validationResult.isValid = false;
                }
                if (typeof expected !== 'number' || expected < 0) {
                    validationResult.errors.push('Performance assertion requires non-negative numeric expected value');
                    validationResult.isValid = false;
                }
                break;
        }
        
        // Return validation result with status and normalized parameters
        return validationResult;
        
    } catch (error) {
        validationResult.isValid = false;
        validationResult.errors.push(`Validation error: ${error.message}`);
        return validationResult;
    }
}

// ============================================================================
// HTTP RESPONSE ASSERTION CLASS
// ============================================================================

/**
 * Specialized assertion class for HTTP response validation including status codes, headers, 
 * content, and protocol compliance. Provides comprehensive HTTP response testing capabilities 
 * with detailed error reporting and validation against expected response characteristics for 
 * the Node.js tutorial application.
 */
class HttpResponseAssertion {
    /**
     * Initializes HTTP response assertion helper with configuration, logging, and 
     * metrics setup for comprehensive response validation.
     * 
     * @param {Object} options - Configuration options for HTTP response assertion
     */
    constructor(options = {}) {
        // Validate and merge configuration with default HTTP response assertion settings
        this.config = {
            ...ASSERTION_CONFIG,
            enableDetailedComparison: true,
            enableHeaderValidation: true,
            enableContentValidation: true,
            enablePerformanceValidation: true,
            ...options
        };
        
        // Initialize Logger instance for assertion execution and failure reporting
        this.logger = new Logger({
            logLevel: 'DEBUG',
            enableColors: true
        });
        
        // Set up assertion metrics collection and performance tracking
        this.assertionMetrics = {
            totalAssertions: 0,
            successfulAssertions: 0,
            failedAssertions: 0,
            averageExecutionTime: 0,
            assertionTypes: {},
            startTime: new Date()
        };
        
        // Configure HTTP response validation rules and compliance checking
        this.validationRules = {
            requireContentType: true,
            requireContentLength: false,
            requireDateHeader: false,
            allowAdditionalHeaders: true,
            strictStatusCodeValidation: true
        };
        
        // Initialize detailed error reporting and context preservation
        this.errorReporting = {
            includeStackTrace: true,
            includeRequestContext: true,
            includeResponseContext: true,
            maxErrorLength: 10000
        };
        
        // Set up correlation tracking for assertion execution monitoring
        this.correlationTracking = {
            enabled: this.config.correlationTracking,
            activeContexts: new Map(),
            executionHistory: []
        };
    }
    
    /**
     * Asserts HTTP response status code matches expected value with detailed error 
     * reporting and status code validation.
     * 
     * @param {Object} response - HTTP response object to validate
     * @param {number} expectedStatus - Expected HTTP status code
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if status code doesn't match expected value
     */
    assertStatusCode(response, expectedStatus, context) {
        try {
            // Extract status code from response object and validate presence
            const actualStatus = response && response.statusCode ? response.statusCode : null;
            
            // Validate expected status code using isValidStatusCode function
            if (!isValidStatusCode(expectedStatus)) {
                throw new Error(`Invalid expected status code: ${expectedStatus}`);
            }
            
            // Validate actual status code exists
            if (actualStatus === null || actualStatus === undefined) {
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.HTTP_STATUS,
                    expectedStatus,
                    'No status code found',
                    context
                );
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: actualStatus,
                    expected: expectedStatus,
                    operator: 'strictEqual'
                });
            }
            
            // Compare actual status code with expected status code
            if (actualStatus !== expectedStatus) {
                // Create detailed error message if assertion fails with status comparison
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.HTTP_STATUS,
                    `${expectedStatus} (${getStatusCategory(expectedStatus)})`,
                    `${actualStatus} (${getStatusCategory(actualStatus)})`,
                    context
                );
                
                // Log assertion execution result with status code details
                logAssertion(ASSERTION_TYPES.HTTP_STATUS, false, {
                    expectedStatus,
                    actualStatus,
                    statusCategory: getStatusCategory(actualStatus)
                }, context);
                
                // Throw assertion error with comprehensive context if validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: actualStatus,
                    expected: expectedStatus,
                    operator: 'strictEqual'
                });
            }
            
            // Log successful assertion execution
            logAssertion(ASSERTION_TYPES.HTTP_STATUS, true, {
                statusCode: actualStatus,
                statusCategory: getStatusCategory(actualStatus)
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Status code assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts HTTP response headers contain expected values and proper formatting 
     * with header validation and protocol compliance checking.
     * 
     * @param {Object} response - HTTP response object containing headers
     * @param {Object} expectedHeaders - Expected header key-value pairs
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if headers don't match expected values or format
     */
    assertResponseHeaders(response, expectedHeaders, context) {
        try {
            // Extract response headers and normalize header names to lowercase
            const actualHeaders = response && response.headers ? response.headers : {};
            
            // Normalize header names to lowercase for Node.js compliance
            const normalizedActualHeaders = {};
            Object.keys(actualHeaders).forEach(key => {
                normalizedActualHeaders[key.toLowerCase()] = actualHeaders[key];
            });
            
            const normalizedExpectedHeaders = {};
            Object.keys(expectedHeaders).forEach(key => {
                normalizedExpectedHeaders[key.toLowerCase()] = expectedHeaders[key];
            });
            
            // Validate presence of required headers from expectedHeaders object
            const missingHeaders = [];
            const mismatchedHeaders = [];
            
            Object.keys(normalizedExpectedHeaders).forEach(headerName => {
                const expectedValue = normalizedExpectedHeaders[headerName];
                const actualValue = normalizedActualHeaders[headerName];
                
                if (actualValue === undefined) {
                    missingHeaders.push(headerName);
                } else if (actualValue !== expectedValue) {
                    mismatchedHeaders.push({
                        name: headerName,
                        expected: expectedValue,
                        actual: actualValue
                    });
                }
            });
            
            // Check header format and encoding for HTTP protocol compliance
            const formatErrors = [];
            Object.keys(normalizedActualHeaders).forEach(headerName => {
                // Validate header name format (lowercase, no special characters except dash)
                if (!/^[a-z0-9\-]+$/.test(headerName)) {
                    formatErrors.push(`Invalid header name format: ${headerName}`);
                }
            });
            
            // Create detailed error message for missing or mismatched headers
            if (missingHeaders.length > 0 || mismatchedHeaders.length > 0 || formatErrors.length > 0) {
                let errorDetails = 'Header validation failed:\n';
                
                if (missingHeaders.length > 0) {
                    errorDetails += `Missing headers: ${missingHeaders.join(', ')}\n`;
                }
                
                if (mismatchedHeaders.length > 0) {
                    errorDetails += 'Mismatched headers:\n';
                    mismatchedHeaders.forEach(header => {
                        errorDetails += `  ${header.name}: expected "${header.expected}", got "${header.actual}"\n`;
                    });
                }
                
                if (formatErrors.length > 0) {
                    errorDetails += `Format errors: ${formatErrors.join(', ')}\n`;
                }
                
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.HTTP_HEADERS,
                    normalizedExpectedHeaders,
                    normalizedActualHeaders,
                    context
                ) + '\n\n' + errorDetails;
                
                // Log assertion execution with header comparison details
                logAssertion(ASSERTION_TYPES.HTTP_HEADERS, false, {
                    missingHeaders,
                    mismatchedHeaders,
                    formatErrors
                }, context);
                
                // Throw assertion error with header context if validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: normalizedActualHeaders,
                    expected: normalizedExpectedHeaders,
                    operator: 'deepStrictEqual'
                });
            }
            
            // Log successful header assertion
            logAssertion(ASSERTION_TYPES.HTTP_HEADERS, true, {
                headersValidated: Object.keys(normalizedExpectedHeaders).length,
                totalHeaders: Object.keys(normalizedActualHeaders).length
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Header assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts HTTP response content matches expected content with content type 
     * validation and encoding verification.
     * 
     * @param {Object} response - HTTP response object containing content
     * @param {string} expectedContent - Expected response content
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if response content doesn't match expected content
     */
    assertResponseContent(response, expectedContent, context) {
        try {
            // Extract response content and handle different content encoding formats
            let actualContent = '';
            if (response && response.body !== undefined) {
                actualContent = String(response.body);
            } else if (response && response.data !== undefined) {
                actualContent = String(response.data);
            } else if (response && typeof response === 'string') {
                actualContent = response;
            }
            
            // Validate content type header matches expected content type
            const contentType = response.headers && response.headers[HTTP_HEADERS.CONTENT_TYPE];
            
            // Compare actual response content with expected content using strict comparison
            if (actualContent !== expectedContent) {
                // Check content length consistency with Content-Length header
                const contentLength = response.headers && response.headers[HTTP_HEADERS.CONTENT_LENGTH];
                const actualLength = actualContent.length;
                
                // Create detailed error message for content mismatch with content preview
                let errorDetails = `Content mismatch:\n`;
                errorDetails += `Expected: "${expectedContent}" (length: ${expectedContent.length})\n`;
                errorDetails += `Actual: "${actualContent}" (length: ${actualLength})\n`;
                
                if (contentLength && parseInt(contentLength) !== actualLength) {
                    errorDetails += `Content-Length header (${contentLength}) doesn't match actual content length (${actualLength})\n`;
                }
                
                if (contentType) {
                    errorDetails += `Content-Type: ${contentType}\n`;
                }
                
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.HTTP_CONTENT,
                    expectedContent,
                    actualContent,
                    context
                ) + '\n\n' + errorDetails;
                
                // Log assertion execution with content comparison and length information
                logAssertion(ASSERTION_TYPES.HTTP_CONTENT, false, {
                    expectedLength: expectedContent.length,
                    actualLength: actualLength,
                    contentType: contentType
                }, context);
                
                // Throw assertion error with content context if validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: actualContent,
                    expected: expectedContent,
                    operator: 'strictEqual'
                });
            }
            
            // Log successful content assertion
            logAssertion(ASSERTION_TYPES.HTTP_CONTENT, true, {
                contentLength: actualContent.length,
                contentType: contentType
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Content assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts HTTP response time meets performance requirements with timing 
     * validation and performance benchmarking.
     * 
     * @param {Object} response - HTTP response object with timing information
     * @param {number} maxResponseTime - Maximum allowed response time in milliseconds
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if response time exceeds maximum allowed time
     */
    assertResponseTime(response, maxResponseTime, context) {
        try {
            // Extract response timing information from response object or context
            let actualResponseTime = null;
            
            if (response && response.responseTime !== undefined) {
                actualResponseTime = response.responseTime;
            } else if (context && context.timer) {
                context.timer.stop();
                actualResponseTime = context.timer.getElapsed();
            } else if (response && response.timings) {
                actualResponseTime = response.timings.total || response.timings.response;
            }
            
            // Validate timing information is available
            if (actualResponseTime === null || actualResponseTime === undefined) {
                throw new Error('Response time information not available for assertion');
            }
            
            // Calculate response time from request start to response completion
            const responseTimeMs = Number(actualResponseTime);
            if (isNaN(responseTimeMs) || responseTimeMs < 0) {
                throw new Error(`Invalid response time value: ${actualResponseTime}`);
            }
            
            // Compare actual response time with maximum allowed response time
            if (responseTimeMs > maxResponseTime) {
                // Check response time against performance benchmarks and thresholds
                const performanceContext = {
                    threshold: maxResponseTime,
                    actual: responseTimeMs,
                    overhead: responseTimeMs - maxResponseTime,
                    performanceGrade: responseTimeMs <= maxResponseTime * 0.5 ? 'EXCELLENT' :
                                    responseTimeMs <= maxResponseTime * 0.8 ? 'GOOD' :
                                    responseTimeMs <= maxResponseTime ? 'ACCEPTABLE' : 'POOR'
                };
                
                // Create detailed error message for performance assertion failure
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.PERFORMANCE,
                    `<= ${maxResponseTime}ms`,
                    `${responseTimeMs}ms (exceeded by ${responseTimeMs - maxResponseTime}ms)`,
                    context
                ) + `\n\nPerformance Analysis:\n${util.inspect(performanceContext, { depth: 2 })}`;
                
                // Log performance assertion with timing metrics and benchmarks
                logAssertion(ASSERTION_TYPES.PERFORMANCE, false, {
                    responseTime: responseTimeMs,
                    threshold: maxResponseTime,
                    performanceGrade: performanceContext.performanceGrade
                }, context);
                
                // Throw assertion error with performance context if timing validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: responseTimeMs,
                    expected: maxResponseTime,
                    operator: 'lessThanOrEqual'
                });
            }
            
            // Log successful performance assertion
            logAssertion(ASSERTION_TYPES.PERFORMANCE, true, {
                responseTime: responseTimeMs,
                threshold: maxResponseTime,
                performanceMargin: maxResponseTime - responseTimeMs
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Response time assertion error: ${error.message}`);
        }
    }
    
    /**
     * Specialized assertion for hello endpoint response validation including status code, 
     * content, and headers specific to tutorial requirements.
     * 
     * @param {Object} response - HTTP response object from hello endpoint
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if hello response doesn't meet tutorial specifications
     */
    assertHelloResponse(response, context) {
        try {
            // Assert response status code is 200 OK using assertStatusCode method
            this.assertStatusCode(response, HTTP_STATUS_CODES.SUCCESS.OK, context);
            
            // Assert response content matches HELLO_WORLD constant using assertResponseContent
            this.assertResponseContent(response, RESPONSE_MESSAGES.HELLO_WORLD, context);
            
            // Assert Content-Type header is text/plain using assertResponseHeaders
            const expectedHeaders = {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
            };
            this.assertResponseHeaders(response, expectedHeaders, context);
            
            // Validate response format and encoding for hello endpoint requirements
            if (response.headers && response.headers[HTTP_HEADERS.CONTENT_LENGTH]) {
                const contentLength = parseInt(response.headers[HTTP_HEADERS.CONTENT_LENGTH]);
                const actualLength = RESPONSE_MESSAGES.HELLO_WORLD.length;
                
                if (contentLength !== actualLength) {
                    throw new Error(`Content-Length header (${contentLength}) doesn't match hello world content length (${actualLength})`);
                }
            }
            
            // Check response timing meets hello endpoint performance requirements
            if (context.timer && this.config.enablePerformanceValidation) {
                this.assertResponseTime(response, 100, context); // 100ms threshold for hello endpoint
            }
            
            // Log specialized hello endpoint assertion success with context
            logAssertion(ASSERTION_TYPES.HELLO_ENDPOINT, true, {
                statusCode: response.statusCode,
                contentLength: RESPONSE_MESSAGES.HELLO_WORLD.length,
                contentType: response.headers && response.headers[HTTP_HEADERS.CONTENT_TYPE]
            }, context);
            
        } catch (error) {
            // Log hello endpoint assertion failure
            logAssertion(ASSERTION_TYPES.HELLO_ENDPOINT, false, {
                error: error.message,
                responseStatus: response && response.statusCode
            }, context);
            
            // Throw assertion error with hello endpoint context if any validation fails
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Hello endpoint assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts error response characteristics including appropriate status codes, 
     * error messages, and security compliance for error scenarios.
     * 
     * @param {Object} response - HTTP response object for error validation
     * @param {number} expectedErrorStatus - Expected error status code (4xx or 5xx)
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if error response doesn't meet error handling specifications
     */
    assertErrorResponse(response, expectedErrorStatus, context) {
        try {
            // Assert response status code matches expected error status using status validation
            this.assertStatusCode(response, expectedErrorStatus, context);
            
            // Validate error status code is in appropriate error range (4xx or 5xx)
            if (!isClientError(expectedErrorStatus) && !isServerError(expectedErrorStatus)) {
                throw new Error(`Expected error status code must be 4xx or 5xx, got: ${expectedErrorStatus}`);
            }
            
            // Check error response content doesn't expose sensitive information
            const responseContent = response.body || response.data || '';
            const sensitivePatterns = [
                /password/i,
                /token/i,
                /secret/i,
                /key/i,
                /authorization/i,
                /stack trace/i,
                /internal error/i
            ];
            
            const exposedSensitiveInfo = sensitivePatterns.some(pattern => 
                pattern.test(responseContent)
            );
            
            if (exposedSensitiveInfo) {
                throw new Error('Error response exposes potentially sensitive information');
            }
            
            // Validate error response headers include appropriate content type
            const contentType = response.headers && response.headers[HTTP_HEADERS.CONTENT_TYPE];
            if (this.validationRules.requireContentType && !contentType) {
                throw new Error('Error response missing Content-Type header');
            }
            
            // Verify error response format follows standardized error patterns
            if (typeof responseContent === 'string' && responseContent.length === 0) {
                throw new Error('Error response has empty content body');
            }
            
            // Log error response assertion with error classification details
            logAssertion(ASSERTION_TYPES.ERROR_RESPONSE, true, {
                errorStatus: expectedErrorStatus,
                errorCategory: getStatusCategory(expectedErrorStatus),
                contentLength: responseContent.length,
                hasSensitiveInfo: exposedSensitiveInfo
            }, context);
            
        } catch (error) {
            // Log error response assertion failure
            logAssertion(ASSERTION_TYPES.ERROR_RESPONSE, false, {
                error: error.message,
                expectedStatus: expectedErrorStatus,
                actualStatus: response && response.statusCode
            }, context);
            
            // Throw assertion error with error response context if validation fails
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Error response assertion error: ${error.message}`);
        }
    }
    
    /**
     * Performs comprehensive HTTP response validation including all response components 
     * and protocol compliance checking.
     * 
     * @param {Object} response - Complete HTTP response object
     * @param {Object} expectedResponse - Expected response characteristics
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if any response component fails validation
     */
    assertCompleteResponse(response, expectedResponse, context) {
        try {
            // Validate response object structure and required properties
            if (!response || typeof response !== 'object') {
                throw new Error('Response object is required for complete response assertion');
            }
            
            if (!expectedResponse || typeof expectedResponse !== 'object') {
                throw new Error('Expected response object is required for complete response assertion');
            }
            
            const validationResults = [];
            
            // Assert status code matches expected status using assertStatusCode
            if (expectedResponse.statusCode !== undefined) {
                try {
                    this.assertStatusCode(response, expectedResponse.statusCode, context);
                    validationResults.push({ component: 'statusCode', success: true });
                } catch (error) {
                    validationResults.push({ component: 'statusCode', success: false, error: error.message });
                    throw error;
                }
            }
            
            // Assert response headers match expected headers using assertResponseHeaders
            if (expectedResponse.headers !== undefined) {
                try {
                    this.assertResponseHeaders(response, expectedResponse.headers, context);
                    validationResults.push({ component: 'headers', success: true });
                } catch (error) {
                    validationResults.push({ component: 'headers', success: false, error: error.message });
                    throw error;
                }
            }
            
            // Assert response content matches expected content using assertResponseContent
            if (expectedResponse.content !== undefined) {
                try {
                    this.assertResponseContent(response, expectedResponse.content, context);
                    validationResults.push({ component: 'content', success: true });
                } catch (error) {
                    validationResults.push({ component: 'content', success: false, error: error.message });
                    throw error;
                }
            }
            
            // Validate response timing if performance requirements specified
            if (expectedResponse.maxResponseTime !== undefined && this.config.enablePerformanceValidation) {
                try {
                    this.assertResponseTime(response, expectedResponse.maxResponseTime, context);
                    validationResults.push({ component: 'responseTime', success: true });
                } catch (error) {
                    validationResults.push({ component: 'responseTime', success: false, error: error.message });
                    throw error;
                }
            }
            
            // Check HTTP protocol compliance and response format validation
            const protocolCompliance = this._validateProtocolCompliance(response);
            if (!protocolCompliance.isValid) {
                validationResults.push({ component: 'protocolCompliance', success: false, error: protocolCompliance.error });
                throw new Error(`Protocol compliance validation failed: ${protocolCompliance.error}`);
            }
            
            // Log comprehensive response assertion with all validation results
            logAssertion(ASSERTION_TYPES.HTTP_RESPONSE, true, {
                componentsValidated: validationResults.length,
                validationResults: validationResults,
                protocolCompliance: protocolCompliance.isValid
            }, context);
            
        } catch (error) {
            // Log complete response assertion failure
            logAssertion(ASSERTION_TYPES.HTTP_RESPONSE, false, {
                error: error.message,
                validationResults: validationResults || []
            }, context);
            
            // Throw assertion error with complete context if any validation component fails
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Complete response assertion error: ${error.message}`);
        }
    }
    
    /**
     * Private method to validate HTTP protocol compliance for response validation.
     * 
     * @private
     * @param {Object} response - HTTP response object to validate
     * @returns {Object} Validation result with compliance status and error details
     */
    _validateProtocolCompliance(response) {
        try {
            const compliance = {
                isValid: true,
                errors: []
            };
            
            // Check required status code presence
            if (!response.statusCode || typeof response.statusCode !== 'number') {
                compliance.errors.push('Missing or invalid status code');
                compliance.isValid = false;
            }
            
            // Validate headers object structure
            if (response.headers && typeof response.headers !== 'object') {
                compliance.errors.push('Headers must be an object');
                compliance.isValid = false;
            }
            
            // Check header name formatting (lowercase requirement)
            if (response.headers) {
                Object.keys(response.headers).forEach(headerName => {
                    if (headerName !== headerName.toLowerCase()) {
                        compliance.errors.push(`Header name not lowercase: ${headerName}`);
                        compliance.isValid = false;
                    }
                });
            }
            
            return compliance;
            
        } catch (error) {
            return {
                isValid: false,
                error: `Protocol compliance validation error: ${error.message}`
            };
        }
    }
}

// ============================================================================
// SERVER STATUS ASSERTION CLASS  
// ============================================================================

/**
 * Specialized assertion class for server status and health validation including server state, 
 * metrics, configuration, and operational status. Provides comprehensive server testing 
 * capabilities with detailed status reporting and validation against expected server 
 * characteristics for operational verification.
 */
class ServerStatusAssertion {
    /**
     * Initializes server status assertion helper with configuration, logging, and 
     * metrics setup for comprehensive server validation.
     * 
     * @param {Object} options - Configuration options for server status assertion
     */
    constructor(options = {}) {
        // Validate and merge configuration with default server status assertion settings
        this.config = {
            ...ASSERTION_CONFIG,
            enableServerMetrics: true,
            enableHealthChecking: true,
            enableConfigurationValidation: true,
            defaultHealthCheckTimeout: 5000,
            ...options
        };
        
        // Initialize Logger instance for server assertion execution and status reporting
        this.logger = new Logger({
            logLevel: 'DEBUG',
            enableColors: true
        });
        
        // Set up server status metrics collection and operational tracking
        this.statusMetrics = {
            totalServerChecks: 0,
            successfulChecks: 0,
            failedChecks: 0,
            averageCheckTime: 0,
            lastCheckTime: null,
            serverUptime: 0
        };
        
        // Configure server status validation rules and health checking criteria
        this.validationCriteria = {
            requireListeningStatus: true,
            requirePortMatch: true,
            enableHealthMetrics: true,
            enableConfigurationChecks: true
        };
        
        // Initialize server status error reporting and context preservation
        this.errorReporting = {
            includeServerState: true,
            includeNetworkInfo: true,
            includeMetricsContext: true
        };
        
        // Set up server operational monitoring and status correlation tracking
        this.operationalTracking = {
            enabled: true,
            checkHistory: [],
            alertThresholds: {
                maxResponseTime: 1000,
                minSuccessRate: 95,
                maxErrorRate: 5
            }
        };
    }
    
    /**
     * Asserts server is listening and accepting connections on expected port 
     * with network connectivity validation.
     * 
     * @param {Object} server - Node.js HTTP server instance
     * @param {number} expectedPort - Expected port number for server binding
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if server is not listening or port doesn't match
     */
    assertServerListening(server, expectedPort, context) {
        try {
            // Check server listening status using server.listening property
            if (!server || typeof server !== 'object') {
                throw new Error('Server object is required for listening assertion');
            }
            
            if (!server.listening) {
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.SERVER_STATUS,
                    'Server listening: true',
                    'Server listening: false',
                    context
                );
                
                logAssertion(ASSERTION_TYPES.SERVER_STATUS, false, {
                    serverState: 'not-listening',
                    expectedPort: expectedPort
                }, context);
                
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: false,
                    expected: true,
                    operator: 'strictEqual'
                });
            }
            
            // Validate server port matches expected port configuration
            const serverAddress = server.address();
            if (!serverAddress) {
                throw new Error('Unable to retrieve server address information');
            }
            
            const actualPort = serverAddress.port;
            if (actualPort !== expectedPort) {
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.SERVER_STATUS,
                    `Port: ${expectedPort}`,
                    `Port: ${actualPort}`,
                    context
                );
                
                logAssertion(ASSERTION_TYPES.SERVER_STATUS, false, {
                    expectedPort: expectedPort,
                    actualPort: actualPort,
                    serverAddress: serverAddress
                }, context);
                
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: actualPort,
                    expected: expectedPort,
                    operator: 'strictEqual'
                });
            }
            
            // Verify server accepts connections and responds to requests
            const connectionInfo = {
                listening: server.listening,
                port: actualPort,
                address: serverAddress.address,
                family: serverAddress.family
            };
            
            // Check server network binding and address configuration
            if (serverAddress.address !== '127.0.0.1' && serverAddress.address !== '::1') {
                this.logger.warn('Server not bound to localhost interface', {
                    actualAddress: serverAddress.address,
                    expectedAddress: 'localhost/127.0.0.1'
                });
            }
            
            // Log server listening assertion with network status details
            logAssertion(ASSERTION_TYPES.SERVER_STATUS, true, {
                serverListening: true,
                port: actualPort,
                connectionInfo: connectionInfo
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Server listening assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts server performance metrics meet expected thresholds including request counts, 
     * response times, and resource usage.
     * 
     * @param {Object} serverMetrics - Server performance metrics object
     * @param {Object} expectedMetrics - Expected metric thresholds and values
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if server metrics don't meet expected performance thresholds
     */
    assertServerMetrics(serverMetrics, expectedMetrics, context) {
        try {
            // Extract server metrics including request counts and performance data
            if (!serverMetrics || typeof serverMetrics !== 'object') {
                throw new Error('Server metrics object is required for metrics assertion');
            }
            
            if (!expectedMetrics || typeof expectedMetrics !== 'object') {
                throw new Error('Expected metrics object is required for metrics assertion');
            }
            
            const validationErrors = [];
            const metricComparisons = [];
            
            // Validate metrics are within expected performance thresholds
            Object.keys(expectedMetrics).forEach(metricName => {
                const expectedValue = expectedMetrics[metricName];
                const actualValue = serverMetrics[metricName];
                
                if (actualValue === undefined) {
                    validationErrors.push(`Missing metric: ${metricName}`);
                    return;
                }
                
                // Check response time metrics against maximum allowed response times
                if (metricName.includes('responseTime') || metricName.includes('latency')) {
                    if (typeof actualValue === 'number' && typeof expectedValue === 'number') {
                        if (actualValue > expectedValue) {
                            validationErrors.push(`${metricName}: ${actualValue}ms exceeds threshold ${expectedValue}ms`);
                        }
                        metricComparisons.push({
                            metric: metricName,
                            actual: actualValue,
                            expected: expectedValue,
                            status: actualValue <= expectedValue ? 'PASS' : 'FAIL'
                        });
                    }
                }
                
                // Verify resource usage metrics including memory and CPU utilization
                if (metricName.includes('memory') || metricName.includes('cpu')) {
                    if (typeof actualValue === 'number' && typeof expectedValue === 'number') {
                        if (actualValue > expectedValue) {
                            validationErrors.push(`${metricName}: ${actualValue} exceeds threshold ${expectedValue}`);
                        }
                        metricComparisons.push({
                            metric: metricName,
                            actual: actualValue,
                            expected: expectedValue,
                            status: actualValue <= expectedValue ? 'PASS' : 'FAIL'
                        });
                    }
                }
            });
            
            // Create detailed error message for metrics assertion failure with threshold comparison
            if (validationErrors.length > 0) {
                const errorDetails = `Metrics validation failed:\n${validationErrors.join('\n')}`;
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.SERVER_STATUS,
                    expectedMetrics,
                    serverMetrics,
                    context
                ) + '\n\n' + errorDetails;
                
                // Log server metrics assertion with performance analysis details
                logAssertion(ASSERTION_TYPES.SERVER_STATUS, false, {
                    failedMetrics: validationErrors.length,
                    metricComparisons: metricComparisons
                }, context);
                
                // Throw assertion error with metrics context if performance validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: serverMetrics,
                    expected: expectedMetrics,
                    operator: 'metricsComparison'
                });
            }
            
            // Log successful metrics assertion
            logAssertion(ASSERTION_TYPES.SERVER_STATUS, true, {
                metricsValidated: Object.keys(expectedMetrics).length,
                metricComparisons: metricComparisons
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Server metrics assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts server health status including component status, error rates, and 
     * operational indicators for comprehensive health validation.
     * 
     * @param {Object} serverStatus - Current server status and health information
     * @param {Object} healthCriteria - Health validation criteria and thresholds
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if server health doesn't meet criteria or indicates unhealthy status
     */
    assertServerHealth(serverStatus, healthCriteria, context) {
        try {
            // Extract server health status and component operational status
            if (!serverStatus || typeof serverStatus !== 'object') {
                throw new Error('Server status object is required for health assertion');
            }
            
            if (!healthCriteria || typeof healthCriteria !== 'object') {
                throw new Error('Health criteria object is required for health assertion');
            }
            
            const healthValidationResults = {
                componentChecks: [],
                errorRateCheck: null,
                uptimeCheck: null,
                overallHealth: 'UNKNOWN'
            };
            
            // Validate error rates are within acceptable thresholds for healthy operation
            if (healthCriteria.maxErrorRate !== undefined) {
                const actualErrorRate = serverStatus.errorRate || 0;
                const maxErrorRate = healthCriteria.maxErrorRate;
                
                healthValidationResults.errorRateCheck = {
                    actual: actualErrorRate,
                    threshold: maxErrorRate,
                    status: actualErrorRate <= maxErrorRate ? 'HEALTHY' : 'UNHEALTHY'
                };
                
                if (actualErrorRate > maxErrorRate) {
                    throw new Error(`Error rate ${actualErrorRate}% exceeds healthy threshold ${maxErrorRate}%`);
                }
            }
            
            // Check server component status including request handler and response handler
            const requiredComponents = healthCriteria.requiredComponents || ['httpServer', 'requestHandler'];
            requiredComponents.forEach(componentName => {
                const componentStatus = serverStatus.components && serverStatus.components[componentName];
                
                if (!componentStatus || componentStatus.status !== 'healthy') {
                    healthValidationResults.componentChecks.push({
                        component: componentName,
                        status: componentStatus ? componentStatus.status : 'missing',
                        healthy: false
                    });
                    throw new Error(`Component ${componentName} is not healthy: ${componentStatus ? componentStatus.status : 'missing'}`);
                } else {
                    healthValidationResults.componentChecks.push({
                        component: componentName,
                        status: componentStatus.status,
                        healthy: true
                    });
                }
            });
            
            // Verify server uptime and stability metrics meet health criteria
            if (healthCriteria.minUptime !== undefined) {
                const actualUptime = serverStatus.uptime || 0;
                const minUptime = healthCriteria.minUptime;
                
                healthValidationResults.uptimeCheck = {
                    actual: actualUptime,
                    minimum: minUptime,
                    status: actualUptime >= minUptime ? 'HEALTHY' : 'UNHEALTHY'
                };
                
                if (actualUptime < minUptime) {
                    throw new Error(`Server uptime ${actualUptime}s below minimum healthy uptime ${minUptime}s`);
                }
            }
            
            // Set overall health status
            healthValidationResults.overallHealth = 'HEALTHY';
            
            // Log server health assertion with comprehensive health analysis
            logAssertion(ASSERTION_TYPES.SERVER_STATUS, true, {
                healthStatus: 'HEALTHY',
                componentChecks: healthValidationResults.componentChecks.length,
                healthValidationResults: healthValidationResults
            }, context);
            
        } catch (error) {
            // Create detailed error message for health assertion failure with status analysis
            const errorMessage = formatAssertionError(
                ASSERTION_TYPES.SERVER_STATUS,
                'Server Health: HEALTHY',
                `Server Health: UNHEALTHY - ${error.message}`,
                context
            );
            
            logAssertion(ASSERTION_TYPES.SERVER_STATUS, false, {
                healthStatus: 'UNHEALTHY',
                error: error.message
            }, context);
            
            // Throw assertion error with health context if health validation fails
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new assert.AssertionError({
                message: errorMessage,
                actual: 'UNHEALTHY',
                expected: 'HEALTHY',
                operator: 'strictEqual'
            });
        }
    }
    
    /**
     * Asserts server configuration matches expected settings including port, host, 
     * timeouts, and feature flags for configuration validation.
     * 
     * @param {Object} serverConfig - Current server configuration object
     * @param {Object} expectedConfig - Expected configuration settings
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {void} Throws assertion error if server configuration doesn't match expected configuration settings
     */
    assertServerConfiguration(serverConfig, expectedConfig, context) {
        try {
            // Extract server configuration including port, host, and operational settings
            if (!serverConfig || typeof serverConfig !== 'object') {
                throw new Error('Server configuration object is required for configuration assertion');
            }
            
            if (!expectedConfig || typeof expectedConfig !== 'object') {
                throw new Error('Expected configuration object is required for configuration assertion');
            }
            
            const configValidationResults = [];
            const configurationErrors = [];
            
            // Compare actual configuration with expected configuration values
            Object.keys(expectedConfig).forEach(configKey => {
                const expectedValue = expectedConfig[configKey];
                const actualValue = serverConfig[configKey];
                
                const configComparison = {
                    setting: configKey,
                    expected: expectedValue,
                    actual: actualValue,
                    match: false
                };
                
                if (actualValue === undefined) {
                    configurationErrors.push(`Missing configuration setting: ${configKey}`);
                    configComparison.error = 'missing';
                } else if (actualValue !== expectedValue) {
                    configurationErrors.push(`Configuration mismatch for ${configKey}: expected ${expectedValue}, got ${actualValue}`);
                    configComparison.error = 'mismatch';
                } else {
                    configComparison.match = true;
                }
                
                configValidationResults.push(configComparison);
            });
            
            // Validate configuration compatibility and internal consistency
            const compatibilityErrors = this._validateConfigurationCompatibility(serverConfig);
            if (compatibilityErrors.length > 0) {
                configurationErrors.push(...compatibilityErrors);
            }
            
            // Check feature flag configuration and component enablement status
            if (expectedConfig.features && serverConfig.features) {
                Object.keys(expectedConfig.features).forEach(featureName => {
                    const expectedEnabled = expectedConfig.features[featureName];
                    const actualEnabled = serverConfig.features[featureName];
                    
                    if (actualEnabled !== expectedEnabled) {
                        configurationErrors.push(`Feature flag mismatch for ${featureName}: expected ${expectedEnabled}, got ${actualEnabled}`);
                    }
                });
            }
            
            // Create detailed error message for configuration assertion failure
            if (configurationErrors.length > 0) {
                const errorDetails = `Configuration validation failed:\n${configurationErrors.join('\n')}`;
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.SERVER_STATUS,
                    expectedConfig,
                    serverConfig,
                    context
                ) + '\n\n' + errorDetails;
                
                // Log server configuration assertion with configuration comparison details
                logAssertion(ASSERTION_TYPES.SERVER_STATUS, false, {
                    configurationErrors: configurationErrors.length,
                    configValidationResults: configValidationResults
                }, context);
                
                // Throw assertion error with configuration context if validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: serverConfig,
                    expected: expectedConfig,
                    operator: 'configurationMatch'
                });
            }
            
            // Log successful configuration assertion
            logAssertion(ASSERTION_TYPES.SERVER_STATUS, true, {
                configurationSettings: Object.keys(expectedConfig).length,
                configValidationResults: configValidationResults
            }, context);
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Server configuration assertion error: ${error.message}`);
        }
    }
    
    /**
     * Private method to validate configuration compatibility and internal consistency.
     * 
     * @private
     * @param {Object} config - Configuration object to validate
     * @returns {Array} Array of compatibility error messages
     */
    _validateConfigurationCompatibility(config) {
        const errors = [];
        
        try {
            // Validate port number range
            if (config.port !== undefined) {
                const port = Number(config.port);
                if (isNaN(port) || port < 1 || port > 65535) {
                    errors.push(`Invalid port number: ${config.port} (must be 1-65535)`);
                }
                if (port < 1024 && process.getuid && process.getuid() !== 0) {
                    errors.push(`Port ${port} requires elevated privileges`);
                }
            }
            
            // Validate host configuration
            if (config.host !== undefined) {
                const validHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
                if (!validHosts.includes(config.host)) {
                    errors.push(`Invalid host configuration: ${config.host}`);
                }
            }
            
            // Validate timeout values
            if (config.timeout !== undefined) {
                const timeout = Number(config.timeout);
                if (isNaN(timeout) || timeout < 0) {
                    errors.push(`Invalid timeout value: ${config.timeout} (must be non-negative number)`);
                }
            }
            
            return errors;
            
        } catch (error) {
            return [`Configuration compatibility validation error: ${error.message}`];
        }
    }
}

// ============================================================================
// PERFORMANCE ASSERTION CLASS
// ============================================================================

/**
 * Specialized assertion class for performance testing and benchmarking including response times, 
 * throughput, resource usage, and performance metrics validation. Provides comprehensive 
 * performance testing capabilities with detailed performance reporting and validation against 
 * expected performance characteristics.
 */
class PerformanceAssertion {
    /**
     * Initializes performance assertion helper with timing configuration, benchmarking setup, 
     * and metrics collection for comprehensive performance validation.
     * 
     * @param {Object} options - Configuration options for performance assertion
     */
    constructor(options = {}) {
        // Validate and merge configuration with default performance assertion settings
        this.config = {
            ...ASSERTION_CONFIG,
            enableHighPrecisionTiming: true,
            enableMemoryTracking: true,
            enableThroughputMeasurement: true,
            defaultTimeoutMs: 10000,
            ...options
        };
        
        // Initialize Logger instance for performance assertion execution and benchmarking reporting
        this.logger = new Logger({
            logLevel: 'DEBUG',
            enableColors: true
        });
        
        // Create TestTimer instance for high-precision performance measurement
        this.timer = new TestTimer();
        
        // Set up performance metrics collection and benchmark tracking
        this.performanceMetrics = {
            totalMeasurements: 0,
            responseTimeMeasurements: [],
            throughputMeasurements: [],
            memoryMeasurements: [],
            performanceHistory: [],
            averageResponseTime: 0,
            maxResponseTime: 0,
            minResponseTime: Infinity
        };
        
        // Configure performance validation thresholds and criteria
        this.performanceThresholds = {
            maxResponseTime: 1000, // 1 second default
            minThroughput: 100,     // 100 operations per second
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            maxMemoryGrowth: 10 * 1024 * 1024   // 10MB growth
        };
        
        // Initialize performance error reporting and detailed timing context
        this.performanceReporting = {
            includeTimingBreakdown: true,
            includeMemoryAnalysis: true,
            includeThroughputStats: true,
            enablePerformanceComparison: true
        };
    }
    
    /**
     * Asserts operation response time meets performance requirements with high-precision 
     * timing and benchmark validation.
     * 
     * @param {Function} operation - Operation function to measure for timing
     * @param {number} maxTime - Maximum allowed execution time in milliseconds
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {any} Returns operation result if timing assertion passes
     */
    async assertResponseTime(operation, maxTime, context) {
        try {
            // Start high-precision timer using TestTimer.start for operation measurement
            const timer = new TestTimer();
            timer.start();
            
            let operationResult = null;
            let operationError = null;
            
            // Execute operation function with error handling and result capture
            try {
                if (typeof operation === 'function') {
                    operationResult = await operation();
                } else {
                    throw new Error('Operation must be a function for response time assertion');
                }
            } catch (error) {
                operationError = error;
            }
            
            // Stop timer and calculate operation execution time using TestTimer.stop
            timer.stop();
            const executionTime = timer.getElapsed();
            
            // Update performance metrics
            this.performanceMetrics.totalMeasurements++;
            this.performanceMetrics.responseTimeMeasurements.push(executionTime);
            
            // Calculate running averages
            this.performanceMetrics.averageResponseTime = 
                this.performanceMetrics.responseTimeMeasurements.reduce((a, b) => a + b, 0) / 
                this.performanceMetrics.responseTimeMeasurements.length;
            
            this.performanceMetrics.maxResponseTime = Math.max(this.performanceMetrics.maxResponseTime, executionTime);
            this.performanceMetrics.minResponseTime = Math.min(this.performanceMetrics.minResponseTime, executionTime);
            
            // Compare operation execution time with maximum allowed time threshold
            if (executionTime > maxTime) {
                // Create detailed error message for performance assertion failure with timing analysis
                const performanceAnalysis = {
                    executionTime: executionTime,
                    threshold: maxTime,
                    overhead: executionTime - maxTime,
                    performanceGrade: this._calculatePerformanceGrade(executionTime, maxTime),
                    statisticalContext: {
                        average: this.performanceMetrics.averageResponseTime,
                        minimum: this.performanceMetrics.minResponseTime,
                        maximum: this.performanceMetrics.maxResponseTime,
                        totalMeasurements: this.performanceMetrics.totalMeasurements
                    }
                };
                
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.PERFORMANCE,
                    `<= ${maxTime}ms`,
                    `${executionTime}ms (exceeded by ${executionTime - maxTime}ms)`,
                    context
                ) + `\n\nPerformance Analysis:\n${util.inspect(performanceAnalysis, { depth: 3 })}`;
                
                // Log performance assertion with timing metrics and benchmark comparison
                logAssertion(ASSERTION_TYPES.PERFORMANCE, false, {
                    executionTime: executionTime,
                    threshold: maxTime,
                    performanceAnalysis: performanceAnalysis
                }, context);
                
                // Throw assertion error with performance context if timing validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: executionTime,
                    expected: maxTime,
                    operator: 'lessThanOrEqual'
                });
            }
            
            // If operation had an error, throw it after timing validation
            if (operationError) {
                throw operationError;
            }
            
            // Log successful performance assertion
            logAssertion(ASSERTION_TYPES.PERFORMANCE, true, {
                executionTime: executionTime,
                threshold: maxTime,
                performanceMargin: maxTime - executionTime
            }, context);
            
            // Return operation result if performance assertion passes
            return operationResult;
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Response time assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts operation throughput meets performance requirements including requests per second 
     * and concurrent operation handling.
     * 
     * @param {Function} operation - Operation function to measure for throughput
     * @param {number} expectedThroughput - Expected operations per second
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {Object} Returns throughput measurement results and operation statistics
     */
    async assertThroughput(operation, expectedThroughput, context) {
        try {
            const throughputTestDuration = 5000; // 5 seconds test duration
            const concurrentOperations = 10; // Number of concurrent operations
            
            // Execute operation multiple times with timing measurement for throughput calculation
            const startTime = Date.now();
            const operationPromises = [];
            
            for (let i = 0; i < concurrentOperations; i++) {
                const operationPromise = (async () => {
                    const timer = new TestTimer();
                    timer.start();
                    
                    try {
                        const result = await operation();
                        timer.stop();
                        return {
                            success: true,
                            result: result,
                            executionTime: timer.getElapsed()
                        };
                    } catch (error) {
                        timer.stop();
                        return {
                            success: false,
                            error: error.message,
                            executionTime: timer.getElapsed()
                        };
                    }
                })();
                
                operationPromises.push(operationPromise);
            }
            
            // Wait for all operations to complete
            const operationResults = await Promise.all(operationPromises);
            const endTime = Date.now();
            const totalDuration = endTime - startTime;
            
            // Calculate operations per second and concurrent operation capacity
            const successfulOperations = operationResults.filter(result => result.success).length;
            const actualThroughput = (successfulOperations / totalDuration) * 1000; // Operations per second
            
            // Analyze throughput consistency and performance variation statistics
            const executionTimes = operationResults.map(result => result.executionTime);
            const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
            const minExecutionTime = Math.min(...executionTimes);
            const maxExecutionTime = Math.max(...executionTimes);
            
            const throughputAnalysis = {
                actualThroughput: actualThroughput,
                expectedThroughput: expectedThroughput,
                successfulOperations: successfulOperations,
                totalOperations: concurrentOperations,
                successRate: (successfulOperations / concurrentOperations) * 100,
                testDuration: totalDuration,
                executionTimeStats: {
                    average: averageExecutionTime,
                    minimum: minExecutionTime,
                    maximum: maxExecutionTime,
                    variance: this._calculateVariance(executionTimes)
                }
            };
            
            // Compare actual throughput with expected throughput requirements
            if (actualThroughput < expectedThroughput) {
                // Create detailed error message for throughput assertion failure with performance analysis
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.PERFORMANCE,
                    `>= ${expectedThroughput} ops/sec`,
                    `${actualThroughput.toFixed(2)} ops/sec`,
                    context
                ) + `\n\nThroughput Analysis:\n${util.inspect(throughputAnalysis, { depth: 3 })}`;
                
                // Log throughput assertion with performance statistics and benchmark comparison
                logAssertion(ASSERTION_TYPES.PERFORMANCE, false, {
                    throughputDeficit: expectedThroughput - actualThroughput,
                    throughputAnalysis: throughputAnalysis
                }, context);
                
                // Throw assertion error with throughput context if performance validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: actualThroughput,
                    expected: expectedThroughput,
                    operator: 'greaterThanOrEqual'
                });
            }
            
            // Update throughput metrics
            this.performanceMetrics.throughputMeasurements.push(throughputAnalysis);
            
            // Log successful throughput assertion
            logAssertion(ASSERTION_TYPES.PERFORMANCE, true, {
                actualThroughput: actualThroughput,
                expectedThroughput: expectedThroughput,
                performanceMargin: actualThroughput - expectedThroughput
            }, context);
            
            // Return throughput measurement results for analysis
            return throughputAnalysis;
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Throughput assertion error: ${error.message}`);
        }
    }
    
    /**
     * Asserts memory usage meets resource requirements including heap usage, memory growth, 
     * and garbage collection efficiency.
     * 
     * @param {Function} operation - Operation function to measure for memory usage
     * @param {number} maxMemoryUsage - Maximum allowed memory usage in bytes
     * @param {Object} context - Assertion context for error reporting and correlation
     * @returns {Object} Returns memory usage measurement results and resource statistics
     */
    async assertMemoryUsage(operation, maxMemoryUsage, context) {
        try {
            // Measure baseline memory usage before operation execution
            const baselineMemory = process.memoryUsage();
            
            // Force garbage collection if available for accurate measurement
            if (global.gc) {
                global.gc();
            }
            
            const cleanBaselineMemory = process.memoryUsage();
            
            let operationResult = null;
            let operationError = null;
            
            // Execute operation with memory monitoring and usage tracking
            try {
                if (typeof operation === 'function') {
                    operationResult = await operation();
                } else {
                    throw new Error('Operation must be a function for memory usage assertion');
                }
            } catch (error) {
                operationError = error;
            }
            
            // Measure peak memory usage and memory growth during operation
            const peakMemory = process.memoryUsage();
            
            // Force garbage collection again for growth measurement
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage();
            
            // Calculate memory efficiency and garbage collection impact
            const memoryAnalysis = {
                baseline: {
                    heapUsed: cleanBaselineMemory.heapUsed,
                    heapTotal: cleanBaselineMemory.heapTotal,
                    rss: cleanBaselineMemory.rss,
                    external: cleanBaselineMemory.external
                },
                peak: {
                    heapUsed: peakMemory.heapUsed,
                    heapTotal: peakMemory.heapTotal,
                    rss: peakMemory.rss,
                    external: peakMemory.external
                },
                final: {
                    heapUsed: finalMemory.heapUsed,
                    heapTotal: finalMemory.heapTotal,
                    rss: finalMemory.rss,
                    external: finalMemory.external
                },
                growth: {
                    heapUsed: peakMemory.heapUsed - cleanBaselineMemory.heapUsed,
                    heapTotal: peakMemory.heapTotal - cleanBaselineMemory.heapTotal,
                    rss: peakMemory.rss - cleanBaselineMemory.rss,
                    external: peakMemory.external - cleanBaselineMemory.external
                },
                retention: {
                    heapUsed: finalMemory.heapUsed - cleanBaselineMemory.heapUsed,
                    heapTotal: finalMemory.heapTotal - cleanBaselineMemory.heapTotal,
                    rss: finalMemory.rss - cleanBaselineMemory.rss,
                    external: finalMemory.external - cleanBaselineMemory.external
                }
            };
            
            // Compare memory usage with maximum allowed memory threshold
            const peakHeapUsage = peakMemory.heapUsed;
            if (peakHeapUsage > maxMemoryUsage) {
                // Create detailed error message for memory assertion failure with usage analysis
                const errorMessage = formatAssertionError(
                    ASSERTION_TYPES.PERFORMANCE,
                    `<= ${Math.round(maxMemoryUsage / 1024 / 1024)}MB`,
                    `${Math.round(peakHeapUsage / 1024 / 1024)}MB (exceeded by ${Math.round((peakHeapUsage - maxMemoryUsage) / 1024 / 1024)}MB)`,
                    context
                ) + `\n\nMemory Analysis:\n${util.inspect(memoryAnalysis, { depth: 3 })}`;
                
                // Log memory assertion with resource usage statistics and efficiency metrics
                logAssertion(ASSERTION_TYPES.PERFORMANCE, false, {
                    peakMemoryUsage: peakHeapUsage,
                    threshold: maxMemoryUsage,
                    memoryAnalysis: memoryAnalysis
                }, context);
                
                // Throw assertion error with memory context if resource validation fails
                throw new assert.AssertionError({
                    message: errorMessage,
                    actual: peakHeapUsage,
                    expected: maxMemoryUsage,
                    operator: 'lessThanOrEqual'
                });
            }
            
            // If operation had an error, throw it after memory validation
            if (operationError) {
                throw operationError;
            }
            
            // Update memory metrics
            this.performanceMetrics.memoryMeasurements.push(memoryAnalysis);
            
            // Log successful memory assertion
            logAssertion(ASSERTION_TYPES.PERFORMANCE, true, {
                peakMemoryUsage: peakHeapUsage,
                threshold: maxMemoryUsage,
                memoryEfficiency: ((maxMemoryUsage - peakHeapUsage) / maxMemoryUsage * 100).toFixed(2) + '% under threshold'
            }, context);
            
            // Return memory usage measurement results for optimization analysis
            return {
                operationResult: operationResult,
                memoryAnalysis: memoryAnalysis,
                memoryEfficiency: {
                    peakUsage: peakHeapUsage,
                    threshold: maxMemoryUsage,
                    utilisationPercentage: (peakHeapUsage / maxMemoryUsage * 100).toFixed(2)
                }
            };
            
        } catch (error) {
            if (error instanceof assert.AssertionError) {
                throw error;
            }
            throw new Error(`Memory usage assertion error: ${error.message}`);
        }
    }
    
    /**
     * Private method to calculate performance grade based on execution time and threshold.
     * 
     * @private
     * @param {number} executionTime - Actual execution time
     * @param {number} threshold - Maximum allowed time
     * @returns {string} Performance grade (EXCELLENT, GOOD, ACCEPTABLE, POOR)
     */
    _calculatePerformanceGrade(executionTime, threshold) {
        const ratio = executionTime / threshold;
        
        if (ratio <= 0.25) return 'EXCELLENT';
        if (ratio <= 0.5) return 'GOOD';
        if (ratio <= 0.75) return 'ACCEPTABLE';
        if (ratio <= 1.0) return 'MARGINAL';
        return 'POOR';
    }
    
    /**
     * Private method to calculate variance in execution times for statistical analysis.
     * 
     * @private
     * @param {number[]} values - Array of execution time values
     * @returns {number} Variance of the execution times
     */
    _calculateVariance(values) {
        if (values.length === 0) return 0;
        
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        return squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
    }
}

// ============================================================================
// MODULE EXPORTS FOR COMPREHENSIVE ASSERTION SUPPORT
// ============================================================================

// Export assertion classes for comprehensive testing support
export { HttpResponseAssertion, ServerStatusAssertion, PerformanceAssertion };

// Export utility functions for assertion context and error handling
export { createAssertionContext, formatAssertionError, logAssertion, validateAssertionInput };

// Export global configuration objects for assertion customization
export { ASSERTION_CONFIG, ASSERTION_TYPES, ASSERTION_SEVERITY, DEFAULT_ASSERTION_OPTIONS };

// Default assertion utility object providing convenient access to all assertion classes and utility functions
export const assertions = {
    // Assertion class instances for immediate use
    httpResponse: HttpResponseAssertion,
    serverStatus: ServerStatusAssertion,
    performance: PerformanceAssertion,
    
    // Utility functions for assertion support
    createContext: createAssertionContext,
    formatError: formatAssertionError,
    logAssertion: logAssertion,
    validateInput: validateAssertionInput,
    
    // Configuration and type constants
    types: ASSERTION_TYPES,
    severity: ASSERTION_SEVERITY,
    config: ASSERTION_CONFIG
};

// Export assertions object as default for convenient access to complete assertion functionality
export default assertions;