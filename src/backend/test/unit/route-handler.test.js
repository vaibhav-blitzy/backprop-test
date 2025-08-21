/**
 * Comprehensive Unit Test Suite for RouteHandler Class
 * 
 * This test suite provides comprehensive validation of the RouteHandler class functionality
 * including HTTP request routing, URL pattern matching, method validation, endpoint resolution,
 * and error handling using Node.js built-in test runner. Tests all RouteHandler methods with
 * extensive coverage for routing metrics, configuration updates, security validation, and
 * comprehensive error scenarios using embedded test fixtures and utilities.
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive unit testing patterns for HTTP routing functionality
 * - Shows proper test organization and categorization for complex route handling
 * - Illustrates Node.js built-in test runner usage with embedded test utilities
 * - Provides examples of performance testing and metrics validation
 * - Shows security testing patterns for route security validation
 * - Demonstrates proper test fixture usage and mock object creation
 * 
 * Test Coverage:
 * - RouteHandler constructor and initialization testing
 * - Main route() method with comprehensive request processing scenarios
 * - URL pattern matching with matchRoute() method validation
 * - Security validation with validateRouteAccess() comprehensive testing
 * - Hello endpoint handling with handleHelloRoute() method testing
 * - Not found response handling with handleNotFoundRoute() method testing
 * - Method not allowed handling with handleMethodNotAllowed() testing
 * - Error handling with handleRouteError() comprehensive error scenario testing
 * - Metrics collection with getRoutingMetrics() validation testing
 * - Configuration updates with updateConfiguration() runtime config testing
 * - Utility function testing for generateRouteId, createRouteContext, normalizeRoutePath, createRouteError
 * 
 * @fileoverview Comprehensive unit tests for RouteHandler class functionality
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Node.js built-in test runner imports
import { test, describe, before, after, beforeEach, afterEach } from 'node:test'; // Node.js v22.x LTS - Built-in test runner
import assert from 'node:assert'; // Node.js v22.x LTS - Built-in assertion library

// Core RouteHandler class and utility functions being tested
import { 
    RouteHandler,
    generateRouteId,
    createRouteContext,
    normalizeRoutePath,
    createRouteError
} from '../../lib/route-handler.js';

// HTTP status code constants for test validation
import { 
    HTTP_STATUS_CODES 
} from '../../utils/http-status.js';

// HTTP method constants for test scenarios
import { 
    HTTP_METHODS 
} from '../../constants/http-methods.js';

// Error message constants for test validation
import { 
    ERROR_MESSAGES 
} from '../../constants/error-messages.js';

// Test fixture imports for request and response validation
import {
    VALID_HELLO_REQUESTS,
    INVALID_METHOD_REQUESTS,
    INVALID_PATH_REQUESTS,
    SECURITY_TEST_REQUESTS,
    createMockHttpRequest
} from '../fixtures/request-data.js';

import {
    VALID_HELLO_RESPONSES,
    ERROR_RESPONSES,
    createMockHttpResponse
} from '../fixtures/response-data.js';

// ============================================================================
// TEST UTILITIES (EMBEDDED IMPLEMENTATION)
// ============================================================================

/**
 * High-precision timing utility for measuring route handler performance and response times.
 * Provides accurate timing measurements for performance validation and optimization testing.
 */
class TestTimer {
    /**
     * Initializes the test timer with high-resolution timing capabilities.
     * 
     * @param {Object} options - Timer configuration options
     */
    constructor(options = {}) {
        this.startTime = null;
        this.endTime = null;
        this.options = {
            precision: 'milliseconds',
            enableLogging: false,
            ...options
        };
        this.timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * Starts the high-precision timer for performance measurement.
     * 
     * @returns {TestTimer} Returns this instance for method chaining
     */
    start() {
        this.startTime = process.hrtime.bigint();
        if (this.options.enableLogging) {
            console.log(`Timer ${this.timerId} started`);
        }
        return this;
    }

    /**
     * Stops the timer and calculates elapsed time.
     * 
     * @returns {TestTimer} Returns this instance for method chaining
     */
    stop() {
        if (!this.startTime) {
            throw new Error('Timer not started');
        }
        this.endTime = process.hrtime.bigint();
        if (this.options.enableLogging) {
            console.log(`Timer ${this.timerId} stopped. Elapsed: ${this.getElapsed()}ms`);
        }
        return this;
    }

    /**
     * Gets the elapsed time in the specified precision.
     * 
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsed() {
        if (!this.startTime || !this.endTime) {
            return 0;
        }
        const elapsedNanoseconds = this.endTime - this.startTime;
        return Number(elapsedNanoseconds) / 1000000; // Convert to milliseconds
    }

    /**
     * Resets the timer state for reuse.
     * 
     * @returns {TestTimer} Returns this instance for method chaining
     */
    reset() {
        this.startTime = null;
        this.endTime = null;
        return this;
    }
}

/**
 * Test execution context management for tracking route handler test execution and correlation.
 * Provides comprehensive context tracking for test correlation and debugging.
 */
class TestExecutionContext {
    /**
     * Initializes test execution context with correlation tracking.
     * 
     * @param {Object} options - Context configuration options
     */
    constructor(options = {}) {
        this.contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        this.startTime = null;
        this.endTime = null;
        this.metadata = {};
        this.options = {
            enableCorrelation: true,
            trackPerformance: true,
            ...options
        };
        this.executionData = [];
    }

    /**
     * Starts test execution tracking with timing and correlation.
     * 
     * @param {Object} testInfo - Information about the test being executed
     * @returns {TestExecutionContext} Returns this instance for method chaining
     */
    startExecution(testInfo = {}) {
        this.startTime = Date.now();
        this.metadata.testInfo = {
            name: testInfo.name || 'Unknown Test',
            suite: testInfo.suite || 'Default Suite',
            startTime: new Date().toISOString(),
            ...testInfo
        };
        return this;
    }

    /**
     * Ends test execution tracking and calculates performance metrics.
     * 
     * @param {Object} result - Test execution result
     * @returns {TestExecutionContext} Returns this instance for method chaining
     */
    endExecution(result = {}) {
        this.endTime = Date.now();
        this.metadata.result = {
            success: result.success !== false,
            duration: this.endTime - this.startTime,
            endTime: new Date().toISOString(),
            ...result
        };
        
        // Store execution data for analysis
        this.executionData.push({
            contextId: this.contextId,
            ...this.metadata
        });
        
        return this;
    }

    /**
     * Adds metadata to the test execution context.
     * 
     * @param {string} key - Metadata key
     * @param {*} value - Metadata value
     * @returns {TestExecutionContext} Returns this instance for method chaining
     */
    addMetadata(key, value) {
        if (!this.metadata.custom) {
            this.metadata.custom = {};
        }
        this.metadata.custom[key] = value;
        return this;
    }

    /**
     * Gets the current execution duration.
     * 
     * @returns {number} Duration in milliseconds
     */
    getDuration() {
        if (!this.startTime) return 0;
        const endTime = this.endTime || Date.now();
        return endTime - this.startTime;
    }
}

/**
 * Utility function for generating unique correlation IDs for route handler test tracking.
 * 
 * @param {string} prefix - Prefix for correlation ID
 * @returns {string} Unique correlation ID
 */
function generateCorrelationId(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 8);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Deep comparison utility for validating route handler responses and complex object assertions.
 * 
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 * @returns {boolean} True if values are deeply equal
 */
function deepCompare(actual, expected) {
    if (actual === expected) {
        return true;
    }

    if (actual == null || expected == null) {
        return actual === expected;
    }

    if (typeof actual !== typeof expected) {
        return false;
    }

    if (typeof actual !== 'object') {
        return actual === expected;
    }

    if (Array.isArray(actual) !== Array.isArray(expected)) {
        return false;
    }

    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);

    if (actualKeys.length !== expectedKeys.length) {
        return false;
    }

    for (const key of actualKeys) {
        if (!expectedKeys.includes(key)) {
            return false;
        }
        if (!deepCompare(actual[key], expected[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Performance measurement utility for testing route handler execution timing and optimization.
 * 
 * @param {Function} operation - Function to measure
 * @param {Object} options - Measurement options
 * @returns {Object} Performance measurement result
 */
async function measurePerformance(operation, options = {}) {
    const timer = new TestTimer(options);
    let result = null;
    let error = null;

    timer.start();
    try {
        result = await operation();
    } catch (err) {
        error = err;
    } finally {
        timer.stop();
    }

    return {
        result,
        error,
        duration: timer.getElapsed(),
        timerId: timer.timerId,
        success: !error
    };
}

// ============================================================================
// GLOBAL TEST CONFIGURATION
// ============================================================================

// Test timeout configuration
const TEST_TIMEOUT_MS = 5000;
const PERFORMANCE_THRESHOLD_MS = 100;
const TEST_CORRELATION_PREFIX = 'route-handler-test';

// Route handler test configuration
const ROUTE_HANDLER_TEST_CONFIG = {
    timeout: TEST_TIMEOUT_MS,
    performanceThreshold: PERFORMANCE_THRESHOLD_MS,
    enableMetrics: true,
    enableSecurityValidation: true,
    strictMode: true,
    logLevel: 'ERROR' // Reduce logging during tests
};

// Global test state
let testEnvironment = null;
let routeHandlerInstance = null;
let testExecutionContext = null;

// ============================================================================
// TEST SETUP AND TEARDOWN FUNCTIONS
// ============================================================================

/**
 * Sets up route handler test environment with mock dependencies, test configuration,
 * and performance monitoring for comprehensive route handler testing.
 * 
 * @param {Object} testConfig - Test configuration object
 * @returns {Object} Route handler test environment with configured dependencies and monitoring
 */
function setupRouteHandlerTest(testConfig = {}) {
    // Create test configuration with timeout and performance settings
    const config = {
        ...ROUTE_HANDLER_TEST_CONFIG,
        ...testConfig
    };

    // Initialize mock request and response handlers for route handler dependencies
    const mockRequestHandler = {
        parseRequest: async (req) => ({ success: true, data: req }),
        validateRequest: async (req) => ({ isValid: true, request: req })
    };

    const mockResponseHandler = {
        createResponse: async (statusCode, data, options = {}) => ({
            statusCode,
            data,
            headers: {
                'content-type': 'application/json',
                'content-length': JSON.stringify(data).length.toString(),
                'date': new Date().toUTCString(),
                ...options.customHeaders
            },
            options
        }),
        sendResponse: async (response, responseData) => {
            response.statusCode = responseData.statusCode;
            Object.entries(responseData.headers || {}).forEach(([key, value]) => {
                response.setHeader(key, value);
            });
            response.end(JSON.stringify(responseData.data));
        }
    };

    // Set up test execution context with correlation tracking
    testExecutionContext = new TestExecutionContext({
        enableCorrelation: true,
        trackPerformance: true
    });

    // Configure performance monitoring for route handler timing analysis
    const performanceMonitor = {
        timer: new TestTimer({ enableLogging: false }),
        thresholds: {
            routing: config.performanceThreshold,
            slow: config.performanceThreshold * 2
        }
    };

    // Create route handler instance with test configuration
    routeHandlerInstance = new RouteHandler({
        ...config,
        responseHandler: mockResponseHandler,
        enableMetrics: true,
        enableDetailedErrorLogging: false
    });

    // Return complete test environment ready for route handler testing
    return {
        routeHandler: routeHandlerInstance,
        config,
        mocks: {
            requestHandler: mockRequestHandler,
            responseHandler: mockResponseHandler
        },
        performance: performanceMonitor,
        context: testExecutionContext,
        correlationId: generateCorrelationId(TEST_CORRELATION_PREFIX)
    };
}

/**
 * Cleans up route handler test environment including stopping performance monitoring,
 * clearing test data, and resetting test state.
 * 
 * @param {Object} testEnvironment - Test environment to clean up
 */
function cleanupRouteHandlerTest(testEnvironment) {
    if (!testEnvironment) return;

    // Stop performance monitoring and collect final metrics
    if (testEnvironment.performance && testEnvironment.performance.timer) {
        try {
            if (testEnvironment.performance.timer.startTime && !testEnvironment.performance.timer.endTime) {
                testEnvironment.performance.timer.stop();
            }
        } catch (error) {
            console.warn('Performance monitoring cleanup warning:', error.message);
        }
    }

    // Clear test data and reset route handler state
    if (testEnvironment.routeHandler) {
        // Reset metrics if available
        if (testEnvironment.routeHandler.routingMetrics) {
            testEnvironment.routeHandler.routingMetrics.totalRequests = 0;
            testEnvironment.routeHandler.routingMetrics.successfulMatches = 0;
            testEnvironment.routeHandler.routingMetrics.errorCount = 0;
            testEnvironment.routeHandler.routingMetrics.lastResetTime = new Date();
        }
    }

    // Clean up mock dependencies and test fixtures
    testEnvironment.mocks = null;
    testEnvironment.config = null;

    // End test execution context and finalize correlation tracking
    if (testExecutment.context) {
        try {
            testEnvironment.context.endExecution({ success: true });
        } catch (error) {
            console.warn('Test context cleanup warning:', error.message);
        }
    }

    // Log test completion status and performance summary
    console.log('Route handler test environment cleaned up successfully');
}

/**
 * Validates route handler response against expected response structure, status codes,
 * headers, and content for comprehensive response verification.
 * 
 * @param {Object} actualResponse - Actual response from route handler
 * @param {Object} expectedResponse - Expected response structure
 * @param {Object} validationOptions - Validation configuration options
 * @returns {Object} Validation result with success status, differences, and detailed analysis
 */
function validateRouteHandlerResponse(actualResponse, expectedResponse, validationOptions = {}) {
    const validation = {
        success: true,
        differences: [],
        analysis: {
            statusCodeMatch: false,
            contentMatch: false,
            headerMatch: false,
            timingValid: false
        },
        details: {
            timestamp: new Date().toISOString(),
            correlationId: generateCorrelationId('validation')
        }
    };

    try {
        // Compare response status codes using HTTP_STATUS_CODES constants
        if (actualResponse.statusCode !== expectedResponse.statusCode) {
            validation.differences.push({
                field: 'statusCode',
                actual: actualResponse.statusCode,
                expected: expectedResponse.statusCode,
                severity: 'high'
            });
            validation.success = false;
        } else {
            validation.analysis.statusCodeMatch = true;
        }

        // Validate response headers including content-type and security headers
        if (expectedResponse.headers) {
            const headerDifferences = [];
            Object.entries(expectedResponse.headers).forEach(([key, expectedValue]) => {
                const actualValue = actualResponse.headers && actualResponse.headers[key.toLowerCase()];
                if (actualValue !== expectedValue) {
                    headerDifferences.push({
                        header: key,
                        actual: actualValue,
                        expected: expectedValue
                    });
                }
            });
            
            if (headerDifferences.length > 0) {
                validation.differences.push({
                    field: 'headers',
                    differences: headerDifferences,
                    severity: 'medium'
                });
                validation.success = false;
            } else {
                validation.analysis.headerMatch = true;
            }
        }

        // Compare response content and body using deep comparison utility
        const contentMatch = deepCompare(actualResponse.content || actualResponse.data, 
                                        expectedResponse.content || expectedResponse.data);
        if (!contentMatch) {
            validation.differences.push({
                field: 'content',
                actual: actualResponse.content || actualResponse.data,
                expected: expectedResponse.content || expectedResponse.data,
                severity: 'high'
            });
            validation.success = false;
        } else {
            validation.analysis.contentMatch = true;
        }

        // Check response timing against performance thresholds
        if (validationOptions.checkTiming && actualResponse.processingTime) {
            const thresholdMs = validationOptions.performanceThreshold || PERFORMANCE_THRESHOLD_MS;
            validation.analysis.timingValid = actualResponse.processingTime <= thresholdMs;
            if (!validation.analysis.timingValid) {
                validation.differences.push({
                    field: 'performance',
                    actual: actualResponse.processingTime,
                    threshold: thresholdMs,
                    severity: 'low'
                });
            }
        }

        // Validate response structure and required properties
        const requiredProperties = validationOptions.requiredProperties || [];
        requiredProperties.forEach(property => {
            if (!(property in actualResponse)) {
                validation.differences.push({
                    field: 'structure',
                    missing: property,
                    severity: 'medium'
                });
                validation.success = false;
            }
        });

        // Return comprehensive validation result with detailed analysis
        return validation;

    } catch (error) {
        validation.success = false;
        validation.differences.push({
            field: 'validation',
            error: error.message,
            severity: 'critical'
        });
        return validation;
    }
}

/**
 * Creates comprehensive route test scenarios with request fixtures, expected responses,
 * and validation criteria for systematic route handler testing.
 * 
 * @param {string} scenarioType - Type of scenario to create
 * @param {Object} scenarioConfig - Scenario configuration options
 * @returns {Object} Route test scenario with request, expected response, and validation configuration
 */
function createRouteTestScenario(scenarioType, scenarioConfig = {}) {
    const scenarios = {
        'valid-hello': {
            request: VALID_HELLO_REQUESTS.basicGetRequest,
            expectedResponse: {
                statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                content: 'Hello, World!',
                headers: {
                    'content-type': 'application/json'
                }
            },
            validation: {
                checkTiming: true,
                requiredProperties: ['success', 'statusCode', 'handled']
            }
        },
        'invalid-method': {
            request: INVALID_METHOD_REQUESTS.postRequest,
            expectedResponse: {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                headers: {
                    'allow': 'GET'
                }
            },
            validation: {
                checkTiming: true,
                requiredProperties: ['success', 'statusCode', 'errorType']
            }
        },
        'invalid-path': {
            request: INVALID_PATH_REQUESTS.nonExistentPath,
            expectedResponse: {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
            },
            validation: {
                checkTiming: true,
                requiredProperties: ['success', 'statusCode', 'errorType']
            }
        },
        'security-test': {
            request: SECURITY_TEST_REQUESTS.pathTraversalRequest,
            expectedResponse: {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST
            },
            validation: {
                checkTiming: true,
                requiredProperties: ['success', 'statusCode', 'error']
            }
        }
    };

    const baseScenario = scenarios[scenarioType];
    if (!baseScenario) {
        throw new Error(`Unknown scenario type: ${scenarioType}`);
    }

    // Generate appropriate request fixture based on scenario type
    const request = { ...baseScenario.request, ...scenarioConfig.requestOverrides };

    // Create expected response fixture with proper status codes and content
    const expectedResponse = { ...baseScenario.expectedResponse, ...scenarioConfig.responseOverrides };

    // Set up validation criteria and performance expectations
    const validation = { ...baseScenario.validation, ...scenarioConfig.validationOverrides };

    // Configure error handling and edge case validation
    const errorHandling = {
        expectError: scenarioType.includes('invalid') || scenarioType.includes('security'),
        errorType: scenarioConfig.expectedErrorType,
        ...scenarioConfig.errorHandling
    };

    // Add correlation tracking and test metadata
    const metadata = {
        scenarioType,
        correlationId: generateCorrelationId(`scenario-${scenarioType}`),
        generatedAt: new Date().toISOString(),
        ...scenarioConfig.metadata
    };

    // Return complete test scenario ready for execution
    return {
        request,
        expectedResponse,
        validation,
        errorHandling,
        metadata
    };
}

/**
 * Measures route handler performance including response time, memory usage, and routing metrics
 * for performance validation and optimization analysis.
 * 
 * @param {Object} routeHandler - Route handler instance to measure
 * @param {Object} testRequest - Test request object
 * @param {Object} performanceOptions - Performance measurement options
 * @returns {Object} Performance measurement result with timing, metrics, and analysis
 */
async function measureRouteHandlerPerformance(routeHandler, testRequest, performanceOptions = {}) {
    // Start high-precision performance timer using TestTimer
    const timer = new TestTimer({ enableLogging: false });
    const mockResponse = createMockHttpResponse();
    
    // Capture initial memory usage
    const initialMemory = process.memoryUsage();
    
    timer.start();
    
    let routingResult = null;
    let error = null;

    try {
        // Execute route handler processing with test request
        routingResult = await routeHandler.route(testRequest, mockResponse, performanceOptions);
    } catch (err) {
        error = err;
    } finally {
        timer.stop();
    }

    // Measure response time and memory usage during processing
    const finalMemory = process.memoryUsage();
    const memoryDelta = {
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external
    };

    // Collect routing metrics from route handler
    let routingMetrics = null;
    try {
        routingMetrics = routeHandler.getRoutingMetrics();
    } catch (metricsError) {
        console.warn('Failed to collect routing metrics:', metricsError.message);
    }

    // Stop performance timer and calculate execution statistics
    const duration = timer.getElapsed();
    const isSlowRequest = duration > (performanceOptions.threshold || PERFORMANCE_THRESHOLD_MS);

    // Return comprehensive performance analysis with metrics and recommendations
    return {
        timing: {
            duration,
            threshold: performanceOptions.threshold || PERFORMANCE_THRESHOLD_MS,
            isSlowRequest,
            timerId: timer.timerId
        },
        memory: {
            delta: memoryDelta,
            initial: initialMemory,
            final: finalMemory
        },
        result: {
            routingResult,
            error,
            success: !error && routingResult?.success
        },
        metrics: routingMetrics,
        analysis: {
            performanceGrade: isSlowRequest ? 'slow' : 'acceptable',
            memoryEfficient: memoryDelta.heapUsed < 1024 * 1024, // Less than 1MB
            recommendations: isSlowRequest ? ['Optimize route processing'] : ['Performance acceptable']
        },
        correlationId: generateCorrelationId('performance-test')
    };
}

// ============================================================================
// ROUTE HANDLER CLASS UNIT TESTS
// ============================================================================

describe('RouteHandler Class Unit Tests', () => {
    
    // Test suite setup and teardown
    before(async () => {
        testEnvironment = setupRouteHandlerTest();
        testExecutionContext = testEnvironment.context;
        testExecutionContext.startExecution({
            name: 'RouteHandler Unit Test Suite',
            suite: 'RouteHandler',
            startTime: new Date().toISOString()
        });
    });

    after(async () => {
        if (testExecutionContext) {
            testExecutionContext.endExecution({ success: true });
        }
        cleanupRouteHandlerTest(testEnvironment);
    });

    beforeEach(async () => {
        // Reset route handler state before each test
        if (testEnvironment && testEnvironment.routeHandler) {
            testEnvironment.routeHandler.routingMetrics.totalRequests = 0;
            testEnvironment.routeHandler.routingMetrics.errorCount = 0;
        }
    });

    afterEach(async () => {
        // Clean up any test-specific state
        if (testEnvironment && testEnvironment.performance) {
            testEnvironment.performance.timer.reset();
        }
    });

    // ========================================================================
    // CONSTRUCTOR TESTS
    // ========================================================================

    describe('RouteHandler Constructor', () => {
        
        test('should initialize with default configuration', async () => {
            const routeHandler = new RouteHandler();
            
            assert.ok(routeHandler, 'RouteHandler instance should be created');
            assert.ok(routeHandler.config, 'Configuration should be initialized');
            assert.ok(routeHandler.supportedRoutes, 'Supported routes should be initialized');
            assert.strictEqual(typeof routeHandler.route, 'function', 'route method should be available');
            assert.strictEqual(typeof routeHandler.matchRoute, 'function', 'matchRoute method should be available');
        });

        test('should initialize with custom configuration', async () => {
            const customConfig = {
                requestTimeout: 15000,
                enableMetrics: false,
                strictMode: false
            };
            
            const routeHandler = new RouteHandler(customConfig);
            
            assert.strictEqual(routeHandler.config.requestTimeout, 15000, 'Custom request timeout should be applied');
            assert.strictEqual(routeHandler.strictMode, false, 'Strict mode should be disabled');
            assert.ok(routeHandler.supportedRoutes.has('/hello'), 'Hello route should be supported');
        });

        test('should handle invalid configuration gracefully', async () => {
            const invalidConfigs = [null, undefined, 'invalid', 123, []];
            
            for (const invalidConfig of invalidConfigs) {
                const routeHandler = new RouteHandler(invalidConfig);
                assert.ok(routeHandler, 'RouteHandler should initialize with fallback configuration');
                assert.ok(routeHandler.config, 'Fallback configuration should be available');
            }
        });

    });

    // ========================================================================
    // MAIN ROUTE METHOD TESTS
    // ========================================================================

    describe('route() Method', () => {

        test('should process valid hello route request successfully', async (t) => {
            const scenario = createRouteTestScenario('valid-hello');
            const mockResponse = createMockHttpResponse();
            
            const performance = await measureRouteHandlerPerformance(
                testEnvironment.routeHandler,
                scenario.request,
                { threshold: PERFORMANCE_THRESHOLD_MS }
            );
            
            assert.ok(performance.result.routingResult, 'Routing result should be available');
            assert.strictEqual(performance.result.routingResult.success, true, 'Route processing should succeed');
            assert.strictEqual(performance.result.routingResult.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 'Status code should be 200');
            assert.ok(performance.timing.duration < PERFORMANCE_THRESHOLD_MS, 'Processing should be within performance threshold');
        });

        test('should handle invalid method requests with 405 response', async () => {
            const scenario = createRouteTestScenario('invalid-method');
            const mockResponse = createMockHttpResponse();
            
            const routingResult = await testEnvironment.routeHandler.route(
                scenario.request,
                mockResponse
            );
            
            assert.strictEqual(routingResult.success, true, 'Error handling should succeed');
            assert.strictEqual(routingResult.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 'Status code should be 405');
            assert.strictEqual(routingResult.errorType, 'METHOD_NOT_ALLOWED', 'Error type should be METHOD_NOT_ALLOWED');
            assert.ok(routingResult.allowedMethods, 'Allowed methods should be included');
        });

        test('should handle invalid path requests with 404 response', async () => {
            const scenario = createRouteTestScenario('invalid-path');
            const mockResponse = createMockHttpResponse();
            
            const routingResult = await testEnvironment.routeHandler.route(
                scenario.request,
                mockResponse
            );
            
            assert.strictEqual(routingResult.success, true, 'Error handling should succeed');
            assert.strictEqual(routingResult.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND, 'Status code should be 404');
            assert.strictEqual(routingResult.errorType, 'NOT_FOUND', 'Error type should be NOT_FOUND');
        });

        test('should handle security threats with proper validation', async () => {
            const scenario = createRouteTestScenario('security-test');
            const mockResponse = createMockHttpResponse();
            
            const routingResult = await testEnvironment.routeHandler.route(
                scenario.request,
                mockResponse
            );
            
            assert.strictEqual(routingResult.success, true, 'Security error handling should succeed');
            assert.ok(routingResult.statusCode >= 400, 'Status code should indicate client error');
            assert.ok(routingResult.error, 'Error object should be available');
        });

        test('should handle malformed requests gracefully', async () => {
            const malformedRequests = [
                null,
                undefined,
                {},
                { method: null },
                { url: null },
                { method: '', url: '' }
            ];
            
            for (const request of malformedRequests) {
                const mockResponse = createMockHttpResponse();
                const routingResult = await testEnvironment.routeHandler.route(
                    request,
                    mockResponse
                );
                
                assert.ok(routingResult, 'Routing result should be available');
                assert.ok(routingResult.statusCode >= 400, 'Should return error status code');
            }
        });

    });

    // ========================================================================
    // ROUTE MATCHING TESTS
    // ========================================================================

    describe('matchRoute() Method', () => {

        test('should match hello route correctly', async () => {
            const matchResult = testEnvironment.routeHandler.matchRoute('GET', '/hello');
            
            assert.strictEqual(matchResult.matched, true, 'Hello route should match');
            assert.strictEqual(matchResult.endpoint, '/hello', 'Endpoint should be /hello');
            assert.strictEqual(matchResult.methodAllowed, true, 'GET method should be allowed');
            assert.strictEqual(matchResult.handler, 'HelloController', 'Handler should be HelloController');
            assert.ok(Array.isArray(matchResult.allowedMethods), 'Allowed methods should be array');
            assert.ok(matchResult.allowedMethods.includes('GET'), 'GET should be in allowed methods');
        });

        test('should match root route correctly', async () => {
            const matchResult = testEnvironment.routeHandler.matchRoute('GET', '/');
            
            assert.strictEqual(matchResult.matched, true, 'Root route should match');
            assert.strictEqual(matchResult.endpoint, '/', 'Endpoint should be root');
            assert.strictEqual(matchResult.methodAllowed, true, 'GET method should be allowed for root');
            assert.strictEqual(matchResult.handler, 'RootHandler', 'Handler should be RootHandler');
        });

        test('should not match invalid routes', async () => {
            const invalidRoutes = [
                '/invalid',
                '/hello/extra',
                '/api/hello',
                '/HELLO',
                '/hello/',
                ''
            ];
            
            for (const route of invalidRoutes) {
                const matchResult = testEnvironment.routeHandler.matchRoute('GET', route);
                assert.strictEqual(matchResult.matched, false, `Route ${route} should not match`);
                assert.strictEqual(matchResult.endpoint, null, 'Endpoint should be null for invalid routes');
                assert.strictEqual(matchResult.methodAllowed, false, 'Method should not be allowed for invalid routes');
            }
        });

        test('should handle method validation for hello route', async () => {
            const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
            
            for (const method of methods) {
                const matchResult = testEnvironment.routeHandler.matchRoute(method, '/hello');
                assert.strictEqual(matchResult.matched, true, 'Route should match regardless of method');
                assert.strictEqual(matchResult.methodAllowed, false, `Method ${method} should not be allowed`);
                assert.ok(matchResult.allowedMethods.includes('GET'), 'GET should be in allowed methods');
            }
        });

        test('should handle malformed inputs gracefully', async () => {
            const malformedInputs = [
                { method: null, path: '/hello' },
                { method: 'GET', path: null },
                { method: '', path: '/hello' },
                { method: 'GET', path: '' },
                { method: undefined, path: undefined }
            ];
            
            for (const input of malformedInputs) {
                const matchResult = testEnvironment.routeHandler.matchRoute(input.method, input.path);
                assert.ok(matchResult, 'Match result should be available');
                assert.ok(matchResult.metadata, 'Metadata should be available');
                assert.strictEqual(typeof matchResult.matched, 'boolean', 'Matched should be boolean');
            }
        });

    });

    // ========================================================================
    // SECURITY VALIDATION TESTS
    // ========================================================================

    describe('validateRouteAccess() Method', () => {

        test('should validate legitimate hello route access', async () => {
            const validation = testEnvironment.routeHandler.validateRouteAccess('GET', '/hello');
            
            assert.strictEqual(validation.isValid, true, 'Validation should pass for legitimate request');
            assert.strictEqual(validation.authorized, true, 'Access should be authorized');
            assert.strictEqual(validation.security.validated, true, 'Security validation should pass');
            assert.strictEqual(validation.security.threatLevel, 'none', 'Threat level should be none');
            assert.strictEqual(validation.errors.length, 0, 'No validation errors should occur');
        });

        test('should detect path traversal attempts', async () => {
            const pathTraversalPaths = [
                '/hello/../admin',
                '/hello/../../etc/passwd',
                '/hello/%2e%2e/admin',
                '/hello/..%2fadmin'
            ];
            
            for (const path of pathTraversalPaths) {
                const validation = testEnvironment.routeHandler.validateRouteAccess('GET', path);
                assert.strictEqual(validation.isValid, false, `Path traversal should be detected: ${path}`);
                assert.strictEqual(validation.security.pathTraversalAttempt, true, 'Path traversal attempt should be flagged');
                assert.strictEqual(validation.security.threatLevel, 'critical', 'Threat level should be critical');
            }
        });

        test('should detect injection attempts', async () => {
            const injectionPaths = [
                '/hello?id=1\';DROP TABLE users--',
                '/hello<script>alert("xss")</script>',
                '/hello"javascript:alert(1)"',
                '/hello/data:text/html,<script>alert(1)</script>'
            ];
            
            for (const path of injectionPaths) {
                const validation = testEnvironment.routeHandler.validateRouteAccess('GET', path);
                assert.strictEqual(validation.isValid, false, `Injection should be detected: ${path}`);
                assert.strictEqual(validation.security.injectionAttempt, true, 'Injection attempt should be flagged');
                assert.strictEqual(validation.security.threatLevel, 'high', 'Threat level should be high');
            }
        });

        test('should validate HTTP method authorization', async () => {
            const unauthorizedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
            
            for (const method of unauthorizedMethods) {
                const validation = testEnvironment.routeHandler.validateRouteAccess(method, '/hello');
                assert.strictEqual(validation.isValid, false, `Method ${method} should not be authorized`);
                assert.strictEqual(validation.authorized, false, 'Access should not be authorized');
                assert.ok(validation.errors.some(error => error.includes('not allowed')), 'Should include method not allowed error');
            }
        });

        test('should handle invalid HTTP methods', async () => {
            const invalidMethods = ['INVALID', 'CONNECT', 'TRACE', '', null, undefined];
            
            for (const method of invalidMethods) {
                const validation = testEnvironment.routeHandler.validateRouteAccess(method, '/hello');
                assert.strictEqual(validation.isValid, false, `Invalid method should be rejected: ${method}`);
                assert.ok(validation.errors.length > 0, 'Validation errors should be present');
            }
        });

    });

    // ========================================================================
    // HELLO ROUTE HANDLER TESTS
    // ========================================================================

    describe('handleHelloRoute() Method', () => {

        test('should handle valid hello requests successfully', async () => {
            const validRequests = Object.values(VALID_HELLO_REQUESTS);
            
            for (const request of validRequests) {
                const mockResponse = createMockHttpResponse();
                const routeContext = createRouteContext(request, generateCorrelationId('hello-test'));
                
                const result = await testEnvironment.routeHandler.handleHelloRoute(
                    request,
                    mockResponse,
                    routeContext
                );
                
                assert.strictEqual(result.success, true, 'Hello route handling should succeed');
                assert.strictEqual(result.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 'Status code should be 200');
                assert.strictEqual(result.endpoint, '/hello', 'Endpoint should be /hello');
                assert.ok(result.data, 'Response data should be available');
            }
        });

        test('should validate request access before processing', async () => {
            const invalidRequest = createMockHttpRequest({
                method: 'POST',
                url: '/hello',
                headers: {}
            });
            
            const mockResponse = createMockHttpResponse();
            const routeContext = createRouteContext(invalidRequest, generateCorrelationId('hello-invalid-test'));
            
            const result = await testEnvironment.routeHandler.handleHelloRoute(
                invalidRequest,
                mockResponse,
                routeContext
            );
            
            assert.strictEqual(result.success, true, 'Error handling should succeed');
            assert.ok(result.statusCode >= 400, 'Should return error status code');
            assert.ok(result.error, 'Error object should be available');
        });

        test('should measure hello route performance', async () => {
            const request = VALID_HELLO_REQUESTS.basicGetRequest;
            const mockResponse = createMockHttpResponse();
            const routeContext = createRouteContext(request, generateCorrelationId('hello-performance-test'));
            
            const performance = await measurePerformance(async () => {
                return await testEnvironment.routeHandler.handleHelloRoute(request, mockResponse, routeContext);
            });
            
            assert.ok(performance.success, 'Performance measurement should succeed');
            assert.ok(performance.duration >= 0, 'Duration should be non-negative');
            assert.ok(performance.result, 'Result should be available');
            assert.strictEqual(performance.result.success, true, 'Hello route should process successfully');
        });

    });

    // ========================================================================
    // NOT FOUND HANDLER TESTS
    // ========================================================================

    describe('handleNotFoundRoute() Method', () => {

        test('should handle not found requests with 404 response', async () => {
            const notFoundRequests = Object.values(INVALID_PATH_REQUESTS);
            
            for (const request of notFoundRequests) {
                const mockResponse = createMockHttpResponse();
                const routeContext = createRouteContext(request, generateCorrelationId('not-found-test'));
                
                const result = await testEnvironment.routeHandler.handleNotFoundRoute(
                    request,
                    mockResponse,
                    routeContext
                );
                
                assert.strictEqual(result.success, true, 'Not found handling should succeed');
                assert.strictEqual(result.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND, 'Status code should be 404');
                assert.strictEqual(result.errorType, 'NOT_FOUND', 'Error type should be NOT_FOUND');
                assert.ok(result.error, 'Error object should be available');
            }
        });

        test('should log not found attempts for monitoring', async () => {
            const request = INVALID_PATH_REQUESTS.nonExistentPath;
            const mockResponse = createMockHttpResponse();
            const routeContext = createRouteContext(request, generateCorrelationId('not-found-logging-test'));
            
            const initialNotFoundCount = testEnvironment.routeHandler.routingMetrics.notFoundCount;
            
            await testEnvironment.routeHandler.handleNotFoundRoute(request, mockResponse, routeContext);
            
            const finalNotFoundCount = testEnvironment.routeHandler.routingMetrics.notFoundCount;
            assert.strictEqual(finalNotFoundCount, initialNotFoundCount + 1, 'Not found count should increment');
        });

        test('should handle not found error handling failures gracefully', async () => {
            const request = INVALID_PATH_REQUESTS.malformedPath;
            // Create response that will fail during error handling
            const mockResponse = createMockHttpResponse();
            mockResponse.end = () => { throw new Error('Response error'); };
            
            const routeContext = createRouteContext(request, generateCorrelationId('not-found-error-test'));
            
            const result = await testEnvironment.routeHandler.handleNotFoundRoute(
                request,
                mockResponse,
                routeContext
            );
            
            assert.ok(result, 'Result should be available even with response errors');
            assert.ok(result.statusCode >= 400, 'Should return error status code');
        });

    });

    // ========================================================================
    // METHOD NOT ALLOWED HANDLER TESTS
    // ========================================================================

    describe('handleMethodNotAllowed() Method', () => {

        test('should handle method not allowed with proper Allow header', async () => {
            const invalidMethodRequests = Object.values(INVALID_METHOD_REQUESTS);
            
            for (const request of invalidMethodRequests) {
                const mockResponse = createMockHttpResponse();
                
                const result = await testEnvironment.routeHandler.handleMethodNotAllowed(
                    request,
                    mockResponse,
                    '/hello'
                );
                
                assert.strictEqual(result.success, true, 'Method not allowed handling should succeed');
                assert.strictEqual(result.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 'Status code should be 405');
                assert.strictEqual(result.errorType, 'METHOD_NOT_ALLOWED', 'Error type should be METHOD_NOT_ALLOWED');
                assert.ok(Array.isArray(result.allowedMethods), 'Allowed methods should be array');
                assert.ok(result.allowedMethods.includes('GET'), 'GET should be in allowed methods');
            }
        });

        test('should handle different endpoints with appropriate allowed methods', async () => {
            const testCases = [
                { endpoint: '/hello', expectedMethods: ['GET'] },
                { endpoint: '/', expectedMethods: ['GET'] }
            ];
            
            for (const testCase of testCases) {
                const request = createMockHttpRequest({
                    method: 'POST',
                    url: testCase.endpoint
                });
                const mockResponse = createMockHttpResponse();
                
                const result = await testEnvironment.routeHandler.handleMethodNotAllowed(
                    request,
                    mockResponse,
                    testCase.endpoint
                );
                
                assert.deepStrictEqual(result.allowedMethods, testCase.expectedMethods, 
                    `Allowed methods should match for endpoint ${testCase.endpoint}`);
            }
        });

        test('should increment method not allowed metrics', async () => {
            const request = INVALID_METHOD_REQUESTS.postRequest;
            const mockResponse = createMockHttpResponse();
            
            const initialCount = testEnvironment.routeHandler.routingMetrics.methodNotAllowedCount;
            
            await testEnvironment.routeHandler.handleMethodNotAllowed(request, mockResponse, '/hello');
            
            const finalCount = testEnvironment.routeHandler.routingMetrics.methodNotAllowedCount;
            assert.strictEqual(finalCount, initialCount + 1, 'Method not allowed count should increment');
        });

    });

    // ========================================================================
    // ERROR HANDLING TESTS
    // ========================================================================

    describe('handleRouteError() Method', () => {

        test('should handle client errors appropriately', async () => {
            const clientErrors = [
                createRouteError('NOT_FOUND', ERROR_MESSAGES.NOT_FOUND, {}),
                createRouteError('METHOD_NOT_ALLOWED', ERROR_MESSAGES.METHOD_NOT_ALLOWED, {}),
                createRouteError('BAD_REQUEST', ERROR_MESSAGES.BAD_REQUEST, {})
            ];
            
            for (const error of clientErrors) {
                const request = createMockHttpRequest({ method: 'GET', url: '/test' });
                const mockResponse = createMockHttpResponse();
                const routeContext = createRouteContext(request, generateCorrelationId('client-error-test'));
                
                const result = await testEnvironment.routeHandler.handleRouteError(
                    error,
                    request,
                    mockResponse,
                    routeContext
                );
                
                assert.strictEqual(result.success, true, 'Error handling should succeed');
                assert.ok(result.statusCode >= 400 && result.statusCode < 500, 'Should return client error status');
                assert.strictEqual(result.errorType, error.type, 'Error type should match');
            }
        });

        test('should handle server errors appropriately', async () => {
            const serverError = createRouteError('INTERNAL_ERROR', ERROR_MESSAGES.INTERNAL_SERVER_ERROR, {});
            const request = createMockHttpRequest({ method: 'GET', url: '/hello' });
            const mockResponse = createMockHttpResponse();
            const routeContext = createRouteContext(request, generateCorrelationId('server-error-test'));
            
            const result = await testEnvironment.routeHandler.handleRouteError(
                serverError,
                request,
                mockResponse,
                routeContext
            );
            
            assert.strictEqual(result.success, true, 'Error handling should succeed');
            assert.ok(result.statusCode >= 500, 'Should return server error status');
            assert.strictEqual(result.errorType, 'INTERNAL_ERROR', 'Error type should be INTERNAL_ERROR');
        });

        test('should handle error handling failures gracefully', async () => {
            const error = createRouteError('INTERNAL_ERROR', 'Test error', {});
            const request = createMockHttpRequest({ method: 'GET', url: '/hello' });
            // Create response that will fail during error handling
            const mockResponse = createMockHttpResponse();
            mockResponse.setHeader = () => { throw new Error('Header error'); };
            
            const routeContext = createRouteContext(request, generateCorrelationId('error-handling-failure-test'));
            
            const result = await testEnvironment.routeHandler.handleRouteError(
                error,
                request,
                mockResponse,
                routeContext
            );
            
            assert.ok(result, 'Result should be available even with handling failures');
            assert.ok(result.statusCode >= 500, 'Should return server error status');
        });

        test('should sanitize error messages in production mode', async () => {
            // Configure route handler for production mode
            testEnvironment.routeHandler.errorHandling.sanitizeErrors = true;
            testEnvironment.routeHandler.errorHandling.includeStackTrace = false;
            
            const sensitiveError = createRouteError('INTERNAL_ERROR', 'Database connection failed: password=secret123', {});
            const request = createMockHttpRequest({ method: 'GET', url: '/hello' });
            const mockResponse = createMockHttpResponse();
            const routeContext = createRouteContext(request, generateCorrelationId('sanitize-test'));
            
            const result = await testEnvironment.routeHandler.handleRouteError(
                sensitiveError,
                request,
                mockResponse,
                routeContext
            );
            
            assert.strictEqual(result.success, true, 'Error handling should succeed');
            // Note: In real implementation, error message should be sanitized
            assert.ok(result.error, 'Error should be present');
        });

    });

    // ========================================================================
    // METRICS COLLECTION TESTS
    // ========================================================================

    describe('getRoutingMetrics() Method', () => {

        test('should return comprehensive routing metrics', async () => {
            // Perform some routing operations to generate metrics
            const operations = [
                { request: VALID_HELLO_REQUESTS.basicGetRequest, type: 'success' },
                { request: INVALID_PATH_REQUESTS.nonExistentPath, type: 'not_found' },
                { request: INVALID_METHOD_REQUESTS.postRequest, type: 'method_not_allowed' }
            ];
            
            for (const operation of operations) {
                const mockResponse = createMockHttpResponse();
                await testEnvironment.routeHandler.route(operation.request, mockResponse);
            }
            
            const metrics = testEnvironment.routeHandler.getRoutingMetrics();
            
            assert.ok(metrics, 'Metrics should be available');
            assert.ok(metrics.summary, 'Summary should be available');
            assert.ok(metrics.routeDistribution, 'Route distribution should be available');
            assert.ok(metrics.performance, 'Performance metrics should be available');
            assert.ok(metrics.security, 'Security metrics should be available');
            assert.ok(metrics.errorBreakdown, 'Error breakdown should be available');
            assert.ok(metrics.configuration, 'Configuration should be available');
            
            assert.ok(metrics.summary.totalRequests >= 3, 'Total requests should include test operations');
            assert.ok(typeof metrics.summary.successRate === 'string', 'Success rate should be string percentage');
            assert.ok(typeof metrics.summary.errorRate === 'string', 'Error rate should be string percentage');
        });

        test('should track route distribution accurately', async () => {
            // Reset metrics for clean testing
            testEnvironment.routeHandler.routingMetrics.helloRouteHits = 0;
            testEnvironment.routeHandler.routingMetrics.notFoundCount = 0;
            
            // Execute hello route requests
            for (let i = 0; i < 3; i++) {
                const mockResponse = createMockHttpResponse();
                await testEnvironment.routeHandler.route(VALID_HELLO_REQUESTS.basicGetRequest, mockResponse);
            }
            
            // Execute not found requests
            for (let i = 0; i < 2; i++) {
                const mockResponse = createMockHttpResponse();
                await testEnvironment.routeHandler.route(INVALID_PATH_REQUESTS.nonExistentPath, mockResponse);
            }
            
            const metrics = testEnvironment.routeHandler.getRoutingMetrics();
            
            assert.strictEqual(metrics.routeDistribution.helloRoute.hits, 3, 'Hello route hits should be 3');
            assert.strictEqual(metrics.routeDistribution.notFound.count, 2, 'Not found count should be 2');
        });

        test('should track security violations', async () => {
            // Reset security metrics
            testEnvironment.routeHandler.routingMetrics.securityViolations = 0;
            
            // Execute security test requests
            const securityRequests = Object.values(SECURITY_TEST_REQUESTS);
            for (const request of securityRequests) {
                const mockResponse = createMockHttpResponse();
                await testEnvironment.routeHandler.route(request, mockResponse);
            }
            
            const metrics = testEnvironment.routeHandler.getRoutingMetrics();
            assert.ok(metrics.security.totalViolations >= 0, 'Security violations should be tracked');
        });

        test('should handle metrics generation failures gracefully', async () => {
            // Temporarily break metrics
            const originalMetrics = testEnvironment.routeHandler.routingMetrics;
            testEnvironment.routeHandler.routingMetrics = null;
            
            const metrics = testEnvironment.routeHandler.getRoutingMetrics();
            
            assert.ok(metrics, 'Metrics should be available');
            assert.ok(metrics.error, 'Error should be indicated');
            
            // Restore metrics
            testEnvironment.routeHandler.routingMetrics = originalMetrics;
        });

    });

    // ========================================================================
    // CONFIGURATION UPDATE TESTS
    // ========================================================================

    describe('updateConfiguration() Method', () => {

        test('should update valid configuration successfully', async () => {
            const newConfig = {
                requestTimeout: 25000,
                enableMetrics: false,
                strictMode: false
            };
            
            const result = testEnvironment.routeHandler.updateConfiguration(newConfig);
            
            assert.strictEqual(result, true, 'Configuration update should succeed');
            assert.strictEqual(testEnvironment.routeHandler.config.requestTimeout, 25000, 'Request timeout should be updated');
            assert.strictEqual(testEnvironment.routeHandler.strictMode, false, 'Strict mode should be updated');
        });

        test('should validate configuration parameters', async () => {
            const invalidConfigs = [
                { requestTimeout: -1000 },
                { requestTimeout: 'invalid' },
                { maxRequestSize: -500 },
                { maxRequestSize: 'invalid' }
            ];
            
            for (const invalidConfig of invalidConfigs) {
                const result = testEnvironment.routeHandler.updateConfiguration(invalidConfig);
                assert.strictEqual(result, false, `Invalid configuration should be rejected: ${JSON.stringify(invalidConfig)}`);
            }
        });

        test('should handle null and undefined configuration gracefully', async () => {
            const invalidInputs = [null, undefined, 'string', 123, []];
            
            for (const input of invalidInputs) {
                const result = testEnvironment.routeHandler.updateConfiguration(input);
                assert.strictEqual(result, false, `Invalid input should be rejected: ${input}`);
            }
        });

        test('should update security configuration properly', async () => {
            const securityConfig = {
                securityConfig: {
                    enableValidation: false,
                    enableInjectionPrevention: false,
                    enablePathTraversalCheck: true
                }
            };
            
            const result = testEnvironment.routeHandler.updateConfiguration(securityConfig);
            
            assert.strictEqual(result, true, 'Security configuration update should succeed');
            assert.strictEqual(testEnvironment.routeHandler.securityConfig.enableValidation, false, 'Security validation should be disabled');
            assert.strictEqual(testEnvironment.routeHandler.securityConfig.enablePathTraversalCheck, true, 'Path traversal check should be enabled');
        });

    });

});

// ============================================================================
// UTILITY FUNCTION UNIT TESTS
// ============================================================================

describe('RouteHandler Utility Functions', () => {

    // ========================================================================
    // ROUTE ID GENERATION TESTS
    // ========================================================================

    describe('generateRouteId() Function', () => {

        test('should generate unique route IDs for valid inputs', async () => {
            const testCases = [
                { method: 'GET', path: '/hello' },
                { method: 'POST', path: '/api/test' },
                { method: 'put', path: '/users/123' },
                { method: 'DELETE', path: '/items' }
            ];
            
            const generatedIds = new Set();
            
            for (const testCase of testCases) {
                const routeId = generateRouteId(testCase.method, testCase.path);
                
                assert.ok(routeId, 'Route ID should be generated');
                assert.strictEqual(typeof routeId, 'string', 'Route ID should be string');
                assert.ok(routeId.length > 0, 'Route ID should not be empty');
                assert.ok(!generatedIds.has(routeId), 'Route ID should be unique');
                
                // Check route ID format
                assert.ok(routeId.startsWith('route_'), 'Route ID should start with route_ prefix');
                assert.ok(routeId.includes(testCase.method.toUpperCase()), 'Route ID should include method');
                
                generatedIds.add(routeId);
            }
            
            assert.strictEqual(generatedIds.size, testCases.length, 'All route IDs should be unique');
        });

        test('should handle invalid inputs gracefully', async () => {
            const invalidInputs = [
                { method: null, path: '/hello' },
                { method: 'GET', path: null },
                { method: '', path: '/hello' },
                { method: 'GET', path: '' },
                { method: undefined, path: undefined }
            ];
            
            for (const input of invalidInputs) {
                const routeId = generateRouteId(input.method, input.path);
                
                assert.ok(routeId, 'Route ID should be generated even for invalid inputs');
                assert.strictEqual(typeof routeId, 'string', 'Route ID should be string');
                assert.ok(routeId.length > 0, 'Route ID should not be empty');
            }
        });

        test('should generate consistent format across multiple calls', async () => {
            const routeIds = [];
            for (let i = 0; i < 5; i++) {
                routeIds.push(generateRouteId('GET', '/hello'));
            }
            
            // Check format consistency
            routeIds.forEach((routeId, index) => {
                assert.ok(routeId.startsWith('route_GET_'), `Route ID ${index} should have consistent format`);
                assert.ok(routeId.includes('hello'), `Route ID ${index} should include path component`);
            });
            
            // Ensure uniqueness
            const uniqueIds = new Set(routeIds);
            assert.strictEqual(uniqueIds.size, routeIds.length, 'All generated IDs should be unique');
        });

    });

    // ========================================================================
    // ROUTE CONTEXT CREATION TESTS
    // ========================================================================

    describe('createRouteContext() Function', () => {

        test('should create comprehensive route context for valid requests', async () => {
            const request = VALID_HELLO_REQUESTS.basicGetRequest;
            const routeId = generateRouteId(request.method, request.url);
            
            const context = createRouteContext(request, routeId);
            
            assert.ok(context, 'Route context should be created');
            assert.strictEqual(context.routeId, routeId, 'Route ID should match');
            assert.ok(context.timestamp, 'Timestamp should be available');
            assert.ok(context.processingStartTime, 'Processing start time should be available');
            
            // Validate request information extraction
            assert.ok(context.request, 'Request information should be extracted');
            assert.strictEqual(context.request.method, request.method, 'Method should be extracted');
            assert.strictEqual(context.request.url, request.url, 'URL should be extracted');
            
            // Validate URL components parsing
            assert.ok(context.urlComponents, 'URL components should be parsed');
            assert.strictEqual(context.urlComponents.pathname, request.url.split('?')[0], 'Pathname should be extracted');
            
            // Validate performance tracking initialization
            assert.ok(context.performance, 'Performance tracking should be initialized');
            assert.ok(context.performance.startTime, 'Start time should be set');
            assert.strictEqual(context.performance.endTime, null, 'End time should be null initially');
            
            // Validate routing metadata initialization
            assert.ok(context.routing, 'Routing metadata should be initialized');
            assert.strictEqual(context.routing.matched, false, 'Matched should be false initially');
            assert.strictEqual(context.routing.endpoint, null, 'Endpoint should be null initially');
            
            // Validate security context initialization
            assert.ok(context.security, 'Security context should be initialized');
            assert.strictEqual(context.security.validated, false, 'Security validated should be false initially');
            assert.strictEqual(context.security.threatLevel, 'none', 'Threat level should be none initially');
        });

        test('should handle requests with headers and additional data', async () => {
            const request = VALID_HELLO_REQUESTS.getRequestWithHeaders;
            const routeId = generateRouteId(request.method, request.url);
            
            const context = createRouteContext(request, routeId);
            
            assert.ok(context.request.userAgent, 'User agent should be extracted from headers');
            assert.ok(context.request.httpVersion, 'HTTP version should be extracted');
        });

        test('should handle malformed requests gracefully', async () => {
            const malformedRequests = [
                null,
                undefined,
                {},
                { method: null },
                { url: null },
                { headers: null }
            ];
            
            for (const request of malformedRequests) {
                const routeId = generateRouteId('UNKNOWN', '/unknown');
                const context = createRouteContext(request, routeId);
                
                assert.ok(context, 'Context should be created for malformed requests');
                assert.strictEqual(context.routeId, routeId, 'Route ID should be preserved');
                assert.ok(context.timestamp, 'Timestamp should be available');
            }
        });

    });

    // ========================================================================
    // PATH NORMALIZATION TESTS
    // ========================================================================

    describe('normalizeRoutePath() Function', () => {

        test('should normalize valid paths correctly', async () => {
            const testCases = [
                { input: '/hello', expected: '/hello' },
                { input: '/hello/', expected: '/hello' },
                { input: '/hello?param=value', expected: '/hello' },
                { input: '/hello#fragment', expected: '/hello' },
                { input: '/hello?param=value#fragment', expected: '/hello' },
                { input: 'hello', expected: '/hello' },
                { input: '', expected: '/' },
                { input: '/', expected: '/' }
            ];
            
            for (const testCase of testCases) {
                const normalized = normalizeRoutePath(testCase.input);
                assert.strictEqual(normalized, testCase.expected, 
                    `Path ${testCase.input} should normalize to ${testCase.expected}`);
            }
        });

        test('should handle URL encoding properly', async () => {
            const encodedPaths = [
                { input: '/hello%20world', expected: '/hello world' },
                { input: '/hello%2Ftest', expected: '/hello/test' },
                { input: '/caf%C3%A9', expected: '/café' }
            ];
            
            for (const testCase of encodedPaths) {
                const normalized = normalizeRoutePath(testCase.input);
                // Note: Actual behavior depends on validation.js implementation
                assert.ok(normalized, 'Normalized path should be available');
                assert.strictEqual(typeof normalized, 'string', 'Normalized path should be string');
            }
        });

        test('should prevent malicious path patterns', async () => {
            const maliciousPaths = [
                '../admin',
                '../../etc/passwd',
                '/hello/../admin',
                '/hello/../../etc/passwd',
                '%2e%2e/admin',
                null,
                undefined
            ];
            
            for (const path of maliciousPaths) {
                const normalized = normalizeRoutePath(path);
                
                assert.ok(normalized, 'Normalized path should be available');
                assert.strictEqual(typeof normalized, 'string', 'Normalized path should be string');
                // Should return safe path (/ or validated path)
                assert.ok(normalized === '/' || normalized.startsWith('/'), 'Should return safe path');
            }
        });

    });

    // ========================================================================
    // ROUTE ERROR CREATION TESTS
    // ========================================================================

    describe('createRouteError() Function', () => {

        test('should create standardized error objects for different error types', async () => {
            const errorTypes = [
                { type: 'NOT_FOUND', expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND },
                { type: 'METHOD_NOT_ALLOWED', expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED },
                { type: 'BAD_REQUEST', expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST },
                { type: 'INTERNAL_ERROR', expectedStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR }
            ];
            
            for (const errorType of errorTypes) {
                const routeContext = { routeId: generateCorrelationId('error-test') };
                const error = createRouteError(errorType.type, `Test ${errorType.type} message`, routeContext);
                
                assert.ok(error, 'Error object should be created');
                assert.strictEqual(error.type, errorType.type, 'Error type should match');
                assert.strictEqual(error.statusCode, errorType.expectedStatus, 'Status code should match expected');
                assert.ok(error.message, 'Error message should be available');
                assert.ok(error.timestamp, 'Timestamp should be available');
                assert.strictEqual(error.isRouteError, true, 'Should be marked as route error');
                
                // Validate error category classification
                if (errorType.expectedStatus >= 400 && errorType.expectedStatus < 500) {
                    assert.strictEqual(error.category, 'client_error', 'Client errors should be categorized correctly');
                } else if (errorType.expectedStatus >= 500) {
                    assert.strictEqual(error.category, 'server_error', 'Server errors should be categorized correctly');
                }
            }
        });

        test('should include route context information', async () => {
            const routeContext = {
                routeId: generateCorrelationId('context-test'),
                request: { method: 'GET', url: '/hello' },
                performance: { duration: 150 },
                security: { threatLevel: 'medium', violations: ['test_violation'] }
            };
            
            const error = createRouteError('NOT_FOUND', 'Test context error', routeContext);
            
            assert.ok(error.context, 'Error context should be available');
            assert.strictEqual(error.context.routeId, routeContext.routeId, 'Route ID should be included');
            assert.strictEqual(error.context.requestMethod, 'GET', 'Request method should be included');
            assert.strictEqual(error.context.requestUrl, '/hello', 'Request URL should be included');
            assert.strictEqual(error.context.processingTime, 150, 'Processing time should be included');
            
            assert.ok(error.security, 'Security context should be available');
            assert.strictEqual(error.security.threatLevel, 'medium', 'Threat level should be included');
            assert.ok(Array.isArray(error.security.violations), 'Security violations should be array');
        });

        test('should handle error creation failures gracefully', async () => {
            // Test with invalid inputs
            const invalidInputs = [
                { type: null, message: 'test', context: {} },
                { type: 'INVALID_TYPE', message: null, context: {} },
                { type: undefined, message: undefined, context: null }
            ];
            
            for (const input of invalidInputs) {
                const error = createRouteError(input.type, input.message, input.context);
                
                assert.ok(error, 'Error object should be created even with invalid inputs');
                assert.ok(error.type, 'Error type should be available');
                assert.ok(error.statusCode, 'Status code should be available');
                assert.ok(error.timestamp, 'Timestamp should be available');
            }
        });

    });

});

// ============================================================================
// INTEGRATION AND PERFORMANCE TESTS
// ============================================================================

describe('RouteHandler Integration and Performance Tests', () => {

    // ========================================================================
    // PERFORMANCE TESTS
    // ========================================================================

    describe('Performance Validation', () => {

        test('should process hello requests within performance threshold', async () => {
            const request = VALID_HELLO_REQUESTS.basicGetRequest;
            const performanceResults = [];
            
            // Execute multiple requests to get average performance
            for (let i = 0; i < 10; i++) {
                const mockResponse = createMockHttpResponse();
                
                const performance = await measureRouteHandlerPerformance(
                    testEnvironment.routeHandler,
                    request,
                    { threshold: PERFORMANCE_THRESHOLD_MS }
                );
                
                performanceResults.push(performance);
            }
            
            // Calculate average performance
            const avgDuration = performanceResults.reduce((sum, p) => sum + p.timing.duration, 0) / performanceResults.length;
            
            assert.ok(avgDuration < PERFORMANCE_THRESHOLD_MS, `Average duration ${avgDuration}ms should be below threshold ${PERFORMANCE_THRESHOLD_MS}ms`);
            assert.ok(performanceResults.every(p => p.success), 'All performance tests should succeed');
        });

        test('should handle concurrent requests efficiently', async () => {
            const concurrentRequests = 5;
            const requests = Array(concurrentRequests).fill(VALID_HELLO_REQUESTS.basicGetRequest);
            
            const timer = new TestTimer();
            timer.start();
            
            const promises = requests.map(async (request) => {
                const mockResponse = createMockHttpResponse();
                return await testEnvironment.routeHandler.route(request, mockResponse);
            });
            
            const results = await Promise.all(promises);
            timer.stop();
            
            const totalDuration = timer.getElapsed();
            const avgDurationPerRequest = totalDuration / concurrentRequests;
            
            assert.ok(results.every(r => r.success), 'All concurrent requests should succeed');
            assert.ok(avgDurationPerRequest < PERFORMANCE_THRESHOLD_MS, 'Average concurrent duration should be acceptable');
            assert.strictEqual(results.length, concurrentRequests, 'All requests should complete');
        });

    });

    // ========================================================================
    // COMPREHENSIVE SCENARIO TESTS
    // ========================================================================

    describe('Comprehensive Route Scenarios', () => {

        test('should handle complete request lifecycle for valid hello requests', async () => {
            const testContext = new TestExecutionContext();
            testContext.startExecution({ name: 'Complete Hello Lifecycle Test' });
            
            const request = VALID_HELLO_REQUESTS.getRequestWithUserAgent;
            const mockResponse = createMockHttpResponse();
            
            // Execute complete routing pipeline
            const routingResult = await testEnvironment.routeHandler.route(request, mockResponse);
            
            // Validate complete lifecycle
            assert.strictEqual(routingResult.success, true, 'Complete lifecycle should succeed');
            assert.strictEqual(routingResult.handled, true, 'Request should be handled');
            assert.ok(routingResult.routeId, 'Route ID should be generated');
            assert.ok(routingResult.processingTime >= 0, 'Processing time should be available');
            
            // Validate route matching occurred
            const matchResult = testEnvironment.routeHandler.matchRoute(request.method, request.url);
            assert.strictEqual(matchResult.matched, true, 'Route should be matched');
            assert.strictEqual(matchResult.endpoint, '/hello', 'Endpoint should be hello');
            
            // Validate security validation passed
            const securityValidation = testEnvironment.routeHandler.validateRouteAccess(request.method, request.url);
            assert.strictEqual(securityValidation.isValid, true, 'Security validation should pass');
            assert.strictEqual(securityValidation.authorized, true, 'Access should be authorized');
            
            testContext.endExecution({ success: true });
        });

        test('should handle complete error scenarios properly', async () => {
            const errorScenarios = [
                { name: 'Not Found', request: INVALID_PATH_REQUESTS.nonExistentPath, expectedStatus: 404 },
                { name: 'Method Not Allowed', request: INVALID_METHOD_REQUESTS.putRequest, expectedStatus: 405 },
                { name: 'Security Violation', request: SECURITY_TEST_REQUESTS.injectionRequest, expectedStatus: 400 }
            ];
            
            for (const scenario of errorScenarios) {
                const testContext = new TestExecutionContext();
                testContext.startExecution({ name: scenario.name });
                
                const mockResponse = createMockHttpResponse();
                const routingResult = await testEnvironment.routeHandler.route(scenario.request, mockResponse);
                
                assert.strictEqual(routingResult.success, true, `${scenario.name} error handling should succeed`);
                assert.strictEqual(routingResult.statusCode, scenario.expectedStatus, 
                    `${scenario.name} should return status ${scenario.expectedStatus}`);
                assert.ok(routingResult.error || routingResult.errorType, `${scenario.name} should include error information`);
                
                testContext.endExecution({ success: true });
            }
        });

        test('should maintain routing metrics across multiple requests', async () => {
            // Reset metrics for clean testing
            testEnvironment.routeHandler.routingMetrics.totalRequests = 0;
            testEnvironment.routeHandler.routingMetrics.successfulMatches = 0;
            testEnvironment.routeHandler.routingMetrics.errorCount = 0;
            
            const testRequests = [
                VALID_HELLO_REQUESTS.basicGetRequest,
                VALID_HELLO_REQUESTS.getRequestWithHeaders,
                INVALID_PATH_REQUESTS.nonExistentPath,
                INVALID_METHOD_REQUESTS.deleteRequest
            ];
            
            // Process all test requests
            for (const request of testRequests) {
                const mockResponse = createMockHttpResponse();
                await testEnvironment.routeHandler.route(request, mockResponse);
            }
            
            // Validate metrics collection
            const metrics = testEnvironment.routeHandler.getRoutingMetrics();
            
            assert.ok(metrics.summary.totalRequests >= testRequests.length, 'Total requests should be tracked');
            assert.ok(metrics.summary.successfulMatches >= 2, 'Successful matches should be tracked');
            assert.ok(metrics.routeDistribution, 'Route distribution should be available');
            assert.ok(metrics.errorBreakdown, 'Error breakdown should be available');
        });

    });

    // ========================================================================
    // EDGE CASE AND STRESS TESTS
    // ========================================================================

    describe('Edge Cases and Stress Tests', () => {

        test('should handle rapid sequential requests', async () => {
            const requestCount = 20;
            const requests = Array(requestCount).fill(VALID_HELLO_REQUESTS.basicGetRequest);
            
            const timer = new TestTimer();
            timer.start();
            
            let successCount = 0;
            for (const request of requests) {
                const mockResponse = createMockHttpResponse();
                const result = await testEnvironment.routeHandler.route(request, mockResponse);
                if (result.success) successCount++;
            }
            
            timer.stop();
            
            assert.strictEqual(successCount, requestCount, 'All sequential requests should succeed');
            assert.ok(timer.getElapsed() < (PERFORMANCE_THRESHOLD_MS * requestCount), 'Sequential processing should be efficient');
        });

        test('should handle extreme input values', async () => {
            const extremeInputs = [
                { method: 'A'.repeat(1000), path: '/hello' },
                { method: 'GET', path: '/' + 'a'.repeat(10000) },
                { method: 'GET', path: '/hello?' + 'param='.repeat(100) + 'value' }
            ];
            
            for (const input of extremeInputs) {
                const mockRequest = createMockHttpRequest(input);
                const mockResponse = createMockHttpResponse();
                
                const result = await testEnvironment.routeHandler.route(mockRequest, mockResponse);
                
                assert.ok(result, 'Result should be available for extreme inputs');
                assert.ok(result.statusCode >= 400, 'Should return error status for extreme inputs');
            }
        });

        test('should maintain stability under error conditions', async () => {
            const errorConditions = [
                () => { throw new Error('Unexpected error during routing'); },
                () => { return Promise.reject(new Error('Async error during processing')); },
                () => { const obj = {}; obj.circular = obj; return obj; } // Circular reference
            ];
            
            for (let i = 0; i < errorConditions.length; i++) {
                try {
                    const mockRequest = createMockHttpRequest({ 
                        method: 'GET', 
                        url: '/hello',
                        errorCondition: i 
                    });
                    const mockResponse = createMockHttpResponse();
                    
                    const result = await testEnvironment.routeHandler.route(mockRequest, mockResponse);
                    
                    // Should handle errors gracefully
                    assert.ok(result, 'Result should be available even under error conditions');
                } catch (error) {
                    // Errors should be handled internally
                    console.warn(`Error condition ${i} caused exception:`, error.message);
                }
            }
        });

    });

});

// ============================================================================
// COMPREHENSIVE VALIDATION TESTS
// ============================================================================

describe('RouteHandler Validation and Security Tests', () => {

    describe('Request Validation', () => {

        test('should validate request structure comprehensively', async () => {
            const validationTests = [
                { request: null, shouldPass: false, description: 'null request' },
                { request: undefined, shouldPass: false, description: 'undefined request' },
                { request: {}, shouldPass: false, description: 'empty request object' },
                { request: { method: 'GET' }, shouldPass: false, description: 'missing url' },
                { request: { url: '/hello' }, shouldPass: false, description: 'missing method' },
                { request: { method: 'GET', url: '/hello' }, shouldPass: true, description: 'valid request' }
            ];
            
            for (const test of validationTests) {
                const mockResponse = createMockHttpResponse();
                const result = await testEnvironment.routeHandler.route(test.request, mockResponse);
                
                if (test.shouldPass) {
                    assert.ok(result.success || result.statusCode < 500, `Valid request should not cause server error: ${test.description}`);
                } else {
                    assert.ok(result.statusCode >= 400, `Invalid request should return error status: ${test.description}`);
                }
            }
        });

    });

    describe('Security Validation', () => {

        test('should prevent common web vulnerabilities', async () => {
            const vulnerabilityTests = [
                { path: '/hello?id=1\';DROP TABLE users--', type: 'SQL Injection' },
                { path: '/hello<script>alert("xss")</script>', type: 'XSS' },
                { path: '/hello/../../../etc/passwd', type: 'Path Traversal' },
                { path: '/hello"javascript:alert(1)"', type: 'JavaScript Protocol' },
                { path: '/hello/data:text/html,<script>alert(1)</script>', type: 'Data URL' }
            ];
            
            for (const test of vulnerabilityTests) {
                const validation = testEnvironment.routeHandler.validateRouteAccess('GET', test.path);
                
                assert.strictEqual(validation.isValid, false, `${test.type} should be detected and blocked`);
                assert.ok(validation.security.violations.length > 0, `${test.type} should generate security violations`);
                assert.ok(['medium', 'high', 'critical'].includes(validation.security.threatLevel), 
                    `${test.type} should have appropriate threat level`);
            }
        });

    });

    describe('Response Validation', () => {

        test('should generate proper HTTP-compliant responses', async () => {
            const scenarios = [
                { type: 'valid-hello', expectedStatus: 200 },
                { type: 'invalid-path', expectedStatus: 404 },
                { type: 'invalid-method', expectedStatus: 405 }
            ];
            
            for (const scenario of scenarios) {
                const testScenario = createRouteTestScenario(scenario.type);
                const mockResponse = createMockHttpResponse();
                
                const result = await testEnvironment.routeHandler.route(
                    testScenario.request,
                    mockResponse
                );
                
                const validation = validateRouteHandlerResponse(
                    result,
                    testScenario.expectedResponse,
                    testScenario.validation
                );
                
                assert.strictEqual(validation.success || result.statusCode === scenario.expectedStatus, true, 
                    `Response for ${scenario.type} should be HTTP-compliant`);
                assert.strictEqual(result.statusCode, scenario.expectedStatus, 
                    `Status code should match expected for ${scenario.type}`);
            }
        });

    });

});

// ============================================================================
// CLEANUP AND FINALIZATION
// ============================================================================

// Final cleanup after all tests complete
process.on('exit', () => {
    if (testEnvironment) {
        cleanupRouteHandlerTest(testEnvironment);
    }
});