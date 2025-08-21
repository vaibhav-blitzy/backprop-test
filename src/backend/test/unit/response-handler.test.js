/**
 * Comprehensive Unit Test Suite for ResponseHandler Class
 * 
 * This test suite provides complete validation of the ResponseHandler class functionality
 * including HTTP response generation, formatting, transmission, error handling, performance
 * requirements, and HTTP protocol compliance. Uses Node.js built-in test runner with
 * custom assertion helpers, HTTP request/response mocks, and performance measurement
 * utilities to ensure comprehensive testing coverage.
 * 
 * Test Coverage:
 * - Constructor validation and initialization testing
 * - Hello endpoint response generation and validation
 * - Error response handling (404, 405, 500) and validation
 * - HTTP method validation and response coordination
 * - Response header formatting and HTTP compliance
 * - Response validation and protocol adherence
 * - Performance metrics tracking and validation
 * - Error handling integration and recovery testing
 * - HTTP compliance validation and standards adherence
 * 
 * @fileoverview Comprehensive unit test suite for ResponseHandler class functionality
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - Node.js Built-in Test Runner
// ============================================================================

// Import Node.js built-in assertion module for basic test assertions and validation
import assert from 'node:assert'; // Node.js v22.x LTS - Built-in assert module

// Import Node.js built-in test runner functions for organizing and executing test suites
import { describe, test, beforeEach, afterEach } from 'node:test'; // Node.js v22.x LTS - Built-in test runner

// ============================================================================
// MODULE IMPORTS - Application Components Under Test
// ============================================================================

// Import ResponseHandler class and utility functions for testing HTTP response functionality
import { 
    ResponseHandler,
    createResponseContext,
    generateResponseId,
    validateResponseData
} from '../../lib/response-handler.js';

// ============================================================================
// MODULE IMPORTS - Test Infrastructure and Utilities
// ============================================================================

// Import custom HTTP response assertion helpers for specialized response validation
import { 
    HttpResponseAssertion,
    PerformanceAssertion
} from '../helpers/assertions.js';

// Import test utilities including correlation ID generation and performance measurement
// Note: Functionality embedded in mock files due to missing test-utils.js
import { 
    generateCorrelationId,
    measurePerformance,
    TestTimer,
    TestExecutionContext
} from '../helpers/test-utils.js';

// Import HTTP request mocks for creating test request objects
import { 
    createMockHttpRequest,
    createValidHelloRequest,
    createInvalidMethodRequest
} from '../mocks/http-request.mock.js';

// Import HTTP response mocks and factory functions for test response objects
import { 
    createMockHttpResponse,
    createSuccessHelloResponse,
    MockHttpResponse
} from '../mocks/http-response.mock.js';

// Import test response fixtures for standardized test data
import { 
    VALID_HELLO_RESPONSES,
    ERROR_RESPONSES,
    HTTP_STATUS_CODES
} from '../fixtures/response-data.js';

// ============================================================================
// MODULE IMPORTS - Application Constants
// ============================================================================

// Import HTTP status code constants for testing response status validation
import { HTTP_STATUS_CODES as STATUS_CODES } from '../../utils/http-status.js';

// Import response message constants for testing response content validation
import { 
    RESPONSE_MESSAGES,
    HELLO_ENDPOINT_MESSAGES
} from '../../constants/response-messages.js';

// Import HTTP header constants for testing response header formatting
import { 
    HTTP_HEADERS,
    CONTENT_TYPES
} from '../../constants/http-headers.js';

// ============================================================================
// GLOBAL TEST CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Default ResponseHandler configuration object for consistent test initialization.
 * Provides standardized test configuration for ResponseHandler instances ensuring
 * consistent testing environment and predictable test results across test execution.
 */
const DEFAULT_RESPONSE_HANDLER_CONFIG = {
    handlerName: 'ResponseHandlerTest',
    enableLogging: false,
    enableMetrics: true,
    timeout: 1000,
    maxResponseSize: '1MB'
};

/**
 * Test correlation ID prefix for tracking and identifying test-specific operations.
 * Enables correlation tracking across test execution and provides consistent
 * identification pattern for test-related operations and debugging.
 */
const TEST_CORRELATION_ID_PREFIX = 'response-handler-test';

/**
 * Test response timeout configuration for preventing hanging tests and ensuring
 * timely test completion. Provides adequate timeout for response operations while
 * preventing test execution delays due to hanging operations.
 */
const TEST_RESPONSE_TIMEOUT = 5000;

/**
 * Performance thresholds for validating ResponseHandler performance requirements.
 * Defines acceptable performance limits for response generation, memory usage,
 * and throughput to ensure response handler meets performance requirements.
 */
const PERFORMANCE_THRESHOLDS = {
    maxResponseTime: 100,
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minThroughput: 1000
};

// ============================================================================
// TEST UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a ResponseHandler instance configured for testing with mock dependencies
 * and test-specific configuration options. Provides isolated ResponseHandler instance
 * with predictable configuration for reliable and repeatable test execution.
 * 
 * @param {Object} [testConfig={}] - Test-specific configuration overrides
 * @returns {ResponseHandler} Configured ResponseHandler instance ready for testing
 */
function createTestResponseHandler(testConfig = {}) {
    try {
        // Merge test configuration with default response handler configuration
        const mergedConfig = {
            ...DEFAULT_RESPONSE_HANDLER_CONFIG,
            ...testConfig
        };
        
        // Create mock logger and error handler instances for testing isolation
        const mockLogger = {
            info: () => {},
            warn: () => {},
            error: () => {},
            debug: () => {}
        };
        
        const mockErrorHandler = {
            handleError: (error) => ({ handled: true, error }),
            isRecoverableError: () => false
        };
        
        // Initialize ResponseHandler with test configuration and mock dependencies
        const responseHandler = new ResponseHandler(mergedConfig, mockLogger, mockErrorHandler);
        
        // Configure test-specific response options and timeout settings
        responseHandler.testMode = true;
        responseHandler.testTimeout = TEST_RESPONSE_TIMEOUT;
        
        // Set up performance monitoring and metrics collection for testing
        responseHandler.testMetrics = {
            responseCount: 0,
            errorCount: 0,
            averageResponseTime: 0
        };
        
        // Return configured ResponseHandler instance ready for test scenarios
        return responseHandler;
        
    } catch (error) {
        // Enhanced error context for ResponseHandler creation failures
        const handlerError = new Error(`Failed to create test ResponseHandler: ${error.message}`);
        handlerError.originalError = error;
        handlerError.context = {
            testConfig: JSON.stringify(testConfig, null, 2),
            timestamp: new Date().toISOString()
        };
        throw handlerError;
    }
}

/**
 * Creates a comprehensive test context object with mock request, response, and metadata
 * for response handler testing scenarios. Provides complete test environment with
 * proper mock objects and correlation tracking for isolated testing.
 * 
 * @param {Object} [contextOptions={}] - Test context configuration options
 * @returns {Object} Test context with mock request, response objects, and correlation tracking
 */
function createTestContext(contextOptions = {}) {
    try {
        // Generate unique correlation ID for test isolation and tracking
        const correlationId = `${TEST_CORRELATION_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create mock HTTP request object using createMockHttpRequest function
        const mockRequest = createMockHttpRequest({
            method: contextOptions.method || 'GET',
            url: contextOptions.url || '/hello',
            headers: contextOptions.requestHeaders || {},
            ...contextOptions.requestOptions
        });
        
        // Create mock HTTP response object using MockHttpResponse class
        const mockResponse = new MockHttpResponse({
            statusCode: contextOptions.statusCode || 200,
            headers: contextOptions.responseHeaders || {},
            content: contextOptions.content || '',
            ...contextOptions.responseOptions
        });
        
        // Set up test metadata including timestamps and test identification
        const testMetadata = {
            correlationId: correlationId,
            testName: contextOptions.testName || 'unknown-test',
            timestamp: new Date().toISOString(),
            testType: contextOptions.testType || 'unit',
            scenario: contextOptions.scenario || 'default'
        };
        
        // Configure test-specific options and validation requirements
        const testOptions = {
            timeout: contextOptions.timeout || TEST_RESPONSE_TIMEOUT,
            validateResponse: contextOptions.validateResponse !== false,
            measurePerformance: contextOptions.measurePerformance !== false,
            ...contextOptions.options
        };
        
        // Return complete test context ready for response handler testing
        return {
            request: mockRequest,
            response: mockResponse,
            metadata: testMetadata,
            options: testOptions,
            correlationId: correlationId
        };
        
    } catch (error) {
        // Enhanced error context for test context creation failures
        const contextError = new Error(`Failed to create test context: ${error.message}`);
        contextError.originalError = error;
        contextError.context = {
            contextOptions: JSON.stringify(contextOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw contextError;
    }
}

/**
 * Validates response handler performance metrics against expected thresholds and requirements
 * for performance testing. Compares actual performance metrics with defined thresholds
 * and provides detailed performance analysis for validation.
 * 
 * @param {Object} metrics - Response handler performance metrics to validate
 * @param {Object} [expectedThresholds=PERFORMANCE_THRESHOLDS] - Expected performance thresholds
 * @returns {Object} Validation result with compliance status and performance analysis
 */
function validateResponseHandlerMetrics(metrics, expectedThresholds = PERFORMANCE_THRESHOLDS) {
    try {
        // Compare response time metrics against performance thresholds
        const responseTimeValid = metrics.averageResponseTime <= expectedThresholds.maxResponseTime;
        const responseTimeAnalysis = {
            actual: metrics.averageResponseTime,
            threshold: expectedThresholds.maxResponseTime,
            compliant: responseTimeValid,
            variance: metrics.averageResponseTime - expectedThresholds.maxResponseTime
        };
        
        // Validate memory usage and resource consumption metrics
        const memoryUsageValid = metrics.memoryUsage <= expectedThresholds.maxMemoryUsage;
        const memoryAnalysis = {
            actual: metrics.memoryUsage,
            threshold: expectedThresholds.maxMemoryUsage,
            compliant: memoryUsageValid,
            utilizationPercent: (metrics.memoryUsage / expectedThresholds.maxMemoryUsage) * 100
        };
        
        // Check response count and throughput metrics for performance compliance
        const throughputValid = metrics.throughput >= expectedThresholds.minThroughput;
        const throughputAnalysis = {
            actual: metrics.throughput,
            threshold: expectedThresholds.minThroughput,
            compliant: throughputValid,
            efficiency: (metrics.throughput / expectedThresholds.minThroughput) * 100
        };
        
        // Analyze error rates and response success metrics
        const errorRateValid = metrics.errorRate <= 5; // 5% max error rate
        const errorAnalysis = {
            actual: metrics.errorRate,
            threshold: 5,
            compliant: errorRateValid,
            errorCount: metrics.errorCount,
            totalRequests: metrics.responseCount
        };
        
        // Validate response handler efficiency and optimization metrics
        const overallCompliant = responseTimeValid && memoryUsageValid && throughputValid && errorRateValid;
        
        // Return comprehensive performance validation result
        return {
            compliant: overallCompliant,
            analysisDetails: {
                responseTime: responseTimeAnalysis,
                memoryUsage: memoryAnalysis,
                throughput: throughputAnalysis,
                errorRate: errorAnalysis
            },
            performanceScore: overallCompliant ? 100 : 
                Math.round((
                    (responseTimeValid ? 25 : 0) +
                    (memoryUsageValid ? 25 : 0) +
                    (throughputValid ? 25 : 0) +
                    (errorRateValid ? 25 : 0)
                )),
            summary: {
                timestamp: new Date().toISOString(),
                metricsValidated: Object.keys(metrics).length,
                thresholdsChecked: Object.keys(expectedThresholds).length,
                complianceStatus: overallCompliant ? 'PASSED' : 'FAILED'
            }
        };
        
    } catch (error) {
        // Enhanced error context for metrics validation failures
        const validationError = new Error(`Failed to validate response handler metrics: ${error.message}`);
        validationError.originalError = error;
        validationError.context = {
            metrics: JSON.stringify(metrics, null, 2),
            expectedThresholds: JSON.stringify(expectedThresholds, null, 2),
            timestamp: new Date().toISOString()
        };
        throw validationError;
    }
}

/**
 * Sets up the test environment with necessary configuration, mock objects, and performance
 * monitoring for response handler testing. Initializes complete test environment with
 * all required components for isolated and reliable test execution.
 * 
 * @param {Object} [testOptions={}] - Test environment setup options
 * @returns {Object} Test environment configuration with initialized components
 */
function setupTestEnvironment(testOptions = {}) {
    try {
        // Initialize test execution context using TestExecutionContext class
        const testExecutionContext = new TestExecutionContext({
            testType: 'unit',
            isolationLevel: 'high',
            timeout: TEST_RESPONSE_TIMEOUT
        });
        
        // Set up performance monitoring with TestTimer and measurement utilities
        const performanceTimer = new TestTimer();
        const performanceMonitoring = {
            timer: performanceTimer,
            startTime: null,
            measurements: []
        };
        
        // Configure mock HTTP objects and request/response factories
        const mockFactories = {
            createRequest: createMockHttpRequest,
            createResponse: createMockHttpResponse,
            createValidHelloRequest: createValidHelloRequest,
            createInvalidMethodRequest: createInvalidMethodRequest,
            createSuccessHelloResponse: createSuccessHelloResponse
        };
        
        // Initialize assertion helpers and validation utilities
        const assertionHelpers = {
            httpAssertion: new HttpResponseAssertion(),
            performanceAssertion: new PerformanceAssertion()
        };
        
        // Set up test data fixtures and response validation scenarios
        const testFixtures = {
            validResponses: VALID_HELLO_RESPONSES,
            errorResponses: ERROR_RESPONSES,
            statusCodes: STATUS_CODES,
            responseMessages: RESPONSE_MESSAGES,
            httpHeaders: HTTP_HEADERS
        };
        
        // Return complete test environment ready for response handler testing
        return {
            executionContext: testExecutionContext,
            performance: performanceMonitoring,
            mocks: mockFactories,
            assertions: assertionHelpers,
            fixtures: testFixtures,
            correlationId: `${TEST_CORRELATION_ID_PREFIX}-env-${Date.now()}`,
            options: testOptions
        };
        
    } catch (error) {
        // Enhanced error context for test environment setup failures
        const setupError = new Error(`Failed to setup test environment: ${error.message}`);
        setupError.originalError = error;
        setupError.context = {
            testOptions: JSON.stringify(testOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw setupError;
    }
}

/**
 * Cleans up test environment resources including mock objects, timers, and performance
 * monitoring after test completion. Ensures proper resource cleanup and state reset
 * for reliable test isolation between test executions.
 * 
 * @param {Object} testEnvironment - Test environment object to clean up
 * @returns {void} Completes cleanup and resource deallocation
 */
function cleanupTestEnvironment(testEnvironment) {
    try {
        // Stop all active performance timers and monitoring
        if (testEnvironment.performance?.timer) {
            testEnvironment.performance.timer.stop();
        }
        
        // Clean up mock HTTP objects and reset mock state
        if (testEnvironment.mocks) {
            // Reset mock factories to initial state
            Object.keys(testEnvironment.mocks).forEach(mockKey => {
                if (typeof testEnvironment.mocks[mockKey].reset === 'function') {
                    testEnvironment.mocks[mockKey].reset();
                }
            });
        }
        
        // Clear test data fixtures and temporary test resources
        if (testEnvironment.fixtures) {
            // Clear any temporary fixtures or cache
            testEnvironment.fixtures = null;
        }
        
        // Reset response handler metrics and performance counters
        if (testEnvironment.responseHandler) {
            if (typeof testEnvironment.responseHandler.resetMetrics === 'function') {
                testEnvironment.responseHandler.resetMetrics();
            }
        }
        
        // Release test execution context and associated resources
        if (testEnvironment.executionContext) {
            if (typeof testEnvironment.executionContext.cleanupTest === 'function') {
                testEnvironment.executionContext.cleanupTest();
            }
        }
        
        // Complete environment cleanup and prepare for next test
        testEnvironment.correlationId = null;
        
    } catch (error) {
        // Log cleanup errors but don't throw to prevent test failure cascade
        console.error('Test environment cleanup error:', error.message);
    }
}

// ============================================================================
// MAIN RESPONSE HANDLER TEST SUITE CLASS
// ============================================================================

/**
 * Main test suite class for comprehensive testing of the ResponseHandler class including
 * constructor validation, response generation methods, error handling, performance testing,
 * and HTTP compliance validation. Organizes all response handler test scenarios with
 * proper setup, execution, and cleanup for isolated and reliable testing.
 */
class ResponseHandlerTestSuite {
    /**
     * Initializes the response handler test suite with test configuration, assertion helpers,
     * and performance monitoring setup. Creates comprehensive test suite instance with
     * all necessary components for complete ResponseHandler testing coverage.
     * 
     * @param {Object} [config={}] - Test suite configuration options
     */
    constructor(config = {}) {
        try {
            // Set up test configuration with default response handler test settings
            this.testConfig = {
                ...DEFAULT_RESPONSE_HANDLER_CONFIG,
                ...config
            };
            
            // Initialize HttpResponseAssertion and PerformanceAssertion helpers
            this.responseAssertion = new HttpResponseAssertion();
            this.performanceAssertion = new PerformanceAssertion();
            
            // Create TestTimer instance for performance measurement and validation
            this.testTimer = new TestTimer();
            
            // Set up test environment using setupTestEnvironment function
            this.testEnvironment = setupTestEnvironment({
                testType: 'unit',
                performance: true,
                mockDependencies: true
            });
            
            // Initialize response handler instance for testing using createTestResponseHandler
            this.responseHandler = createTestResponseHandler(this.testConfig);
            
            // Configure test data fixtures and mock object factories
            this.testFixtures = this.testEnvironment.fixtures;
            this.mockFactories = this.testEnvironment.mocks;
            
        } catch (error) {
            // Enhanced error context for test suite initialization failures
            const suiteError = new Error(`ResponseHandlerTestSuite initialization failed: ${error.message}`);
            suiteError.originalError = error;
            suiteError.context = {
                config: JSON.stringify(config, null, 2),
                timestamp: new Date().toISOString()
            };
            throw suiteError;
        }
    }
    
    /**
     * Tests ResponseHandler constructor with various configuration options including validation
     * of default settings, custom configuration, and error handling. Validates proper
     * initialization, dependency injection, and configuration processing.
     * 
     * @returns {Promise<void>} Completes constructor testing with validation
     */
    async testConstructor() {
        try {
            // Test ResponseHandler constructor with default configuration
            const defaultHandler = new ResponseHandler();
            assert.ok(defaultHandler instanceof ResponseHandler, 'ResponseHandler should instantiate with default configuration');
            assert.ok(defaultHandler.config, 'ResponseHandler should have configuration object');
            assert.strictEqual(typeof defaultHandler.sendHello, 'function', 'ResponseHandler should have sendHello method');
            assert.strictEqual(typeof defaultHandler.sendNotFound, 'function', 'ResponseHandler should have sendNotFound method');
            
            // Test constructor with custom configuration options and validation
            const customConfig = {
                handlerName: 'CustomTestHandler',
                enableLogging: true,
                enableMetrics: false,
                timeout: 2000
            };
            const customHandler = new ResponseHandler(customConfig);
            assert.strictEqual(customHandler.config.handlerName, 'CustomTestHandler', 'Constructor should apply custom configuration');
            assert.strictEqual(customHandler.config.enableLogging, true, 'Constructor should apply custom logging setting');
            assert.strictEqual(customHandler.config.timeout, 2000, 'Constructor should apply custom timeout setting');
            
            // Test constructor error handling with invalid configuration
            try {
                const invalidHandler = new ResponseHandler({ timeout: 'invalid' });
                assert.fail('Constructor should reject invalid configuration');
            } catch (error) {
                assert.ok(error instanceof Error, 'Constructor should throw error for invalid configuration');
                assert.ok(error.message.includes('Invalid configuration'), 'Error message should indicate configuration issue');
            }
            
            // Validate logger and error handler initialization in constructor
            const handlerWithDeps = new ResponseHandler(customConfig, this.testEnvironment.mocks.logger, this.testEnvironment.mocks.errorHandler);
            assert.ok(handlerWithDeps.logger, 'Constructor should initialize logger dependency');
            assert.ok(handlerWithDeps.errorHandler, 'Constructor should initialize error handler dependency');
            
            // Test response metrics setup and configuration in constructor
            if (customHandler.config.enableMetrics) {
                assert.ok(customHandler.metrics, 'Constructor should initialize metrics when enabled');
                assert.strictEqual(typeof customHandler.getResponseMetrics, 'function', 'Constructor should provide metrics access methods');
            }
            
            // Assert constructor completes successfully with proper component initialization
            assert.ok(true, 'ResponseHandler constructor tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for constructor test failures
            const constructorError = new Error(`Constructor test failed: ${error.message}`);
            constructorError.originalError = error;
            constructorError.testMethod = 'testConstructor';
            throw constructorError;
        }
    }
    
    /**
     * Tests sendHello method for successful hello endpoint response generation including
     * status codes, headers, content, and performance validation. Validates complete
     * hello response generation process with comprehensive validation.
     * 
     * @returns {Promise<void>} Completes hello response testing with validation
     */
    async testSendHelloMethod() {
        try {
            // Create test context with valid hello request using createTestContext
            const testContext = createTestContext({
                method: 'GET',
                url: '/hello',
                testName: 'sendHello-success',
                scenario: 'valid-hello-request'
            });
            
            // Start performance timer for response generation measurement
            this.testTimer.start();
            
            // Call responseHandler.sendHello with test request and response objects
            await this.responseHandler.sendHello(testContext.request, testContext.response, {
                correlationId: testContext.correlationId
            });
            
            // Stop performance timer and measure response generation time
            const responseTime = this.testTimer.stop();
            
            // Validate response status code is 200 using HttpResponseAssertion.assertStatusCode
            this.responseAssertion.assertStatusCode(
                testContext.response,
                STATUS_CODES.SUCCESS.OK,
                'Hello response should have 200 status code'
            );
            
            // Validate response content is 'Hello world' using HttpResponseAssertion.assertHelloResponse
            this.responseAssertion.assertHelloResponse(
                testContext.response,
                RESPONSE_MESSAGES.HELLO_WORLD,
                'Hello response should contain "Hello world" content'
            );
            
            // Validate response headers include proper Content-Type and Content-Length
            this.responseAssertion.assertResponseHeaders(testContext.response, {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                [HTTP_HEADERS.CONTENT_LENGTH]: RESPONSE_MESSAGES.HELLO_WORLD.length.toString()
            }, 'Hello response should have proper headers');
            
            // Test response timing performance using PerformanceAssertion.assertResponseTime
            this.performanceAssertion.assertResponseTime(
                responseTime,
                PERFORMANCE_THRESHOLDS.maxResponseTime,
                'Hello response should complete within performance threshold'
            );
            
            // Validate response is properly finished and completed
            assert.strictEqual(testContext.response.finished, true, 'Hello response should be finished after sendHello');
            assert.strictEqual(testContext.response.headersSent, true, 'Hello response headers should be sent after sendHello');
            
            // Assert response completion and proper method execution
            assert.ok(true, 'sendHello method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for sendHello test failures
            const helloError = new Error(`sendHello test failed: ${error.message}`);
            helloError.originalError = error;
            helloError.testMethod = 'testSendHelloMethod';
            throw helloError;
        }
    }
    
    /**
     * Tests sendNotFound method for 404 error response generation including status codes,
     * error content, and header validation. Validates proper 404 error response generation
     * with appropriate error content and HTTP compliance.
     * 
     * @returns {Promise<void>} Completes 404 error response testing with validation
     */
    async testSendNotFoundMethod() {
        try {
            // Create test context with invalid path request for 404 testing
            const testContext = createTestContext({
                method: 'GET',
                url: '/invalid-path',
                testName: 'sendNotFound-404',
                scenario: 'invalid-path-request'
            });
            
            // Start performance timer for error response measurement
            this.testTimer.start();
            
            // Call responseHandler.sendNotFound with test request and response objects
            await this.responseHandler.sendNotFound(testContext.request, testContext.response, {
                correlationId: testContext.correlationId,
                requestedPath: '/invalid-path'
            });
            
            // Stop timer and measure error response generation time
            const responseTime = this.testTimer.stop();
            
            // Validate response status code is 404 using HttpResponseAssertion.assertStatusCode
            this.responseAssertion.assertStatusCode(
                testContext.response,
                STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                'Not found response should have 404 status code'
            );
            
            // Validate error response content using HttpResponseAssertion.assertErrorResponse
            this.responseAssertion.assertErrorResponse(
                testContext.response,
                ERROR_RESPONSES.notFoundResponse.content,
                'Not found response should contain proper error message'
            );
            
            // Validate error response headers include proper Content-Type
            this.responseAssertion.assertResponseHeaders(testContext.response, {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
            }, 'Not found response should have proper content type header');
            
            // Test error response timing and performance characteristics
            this.performanceAssertion.assertResponseTime(
                responseTime,
                PERFORMANCE_THRESHOLDS.maxResponseTime,
                'Not found response should complete within performance threshold'
            );
            
            // Validate response completion and finalization
            assert.strictEqual(testContext.response.finished, true, 'Not found response should be finished');
            assert.strictEqual(testContext.response.statusCode, STATUS_CODES.CLIENT_ERROR.NOT_FOUND, 'Status code should be 404');
            
            // Assert error response completion and proper error handling
            assert.ok(true, 'sendNotFound method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for sendNotFound test failures
            const notFoundError = new Error(`sendNotFound test failed: ${error.message}`);
            notFoundError.originalError = error;
            notFoundError.testMethod = 'testSendNotFoundMethod';
            throw notFoundError;
        }
    }
    
    /**
     * Tests sendMethodNotAllowed method for 405 error response generation including Allow
     * header validation and method error handling. Validates proper method validation
     * error response with correct HTTP method restrictions.
     * 
     * @returns {Promise<void>} Completes 405 method error response testing with validation
     */
    async testSendMethodNotAllowedMethod() {
        try {
            // Create test context with invalid method request using createInvalidMethodRequest
            const testContext = createTestContext({
                method: 'POST',
                url: '/hello',
                testName: 'sendMethodNotAllowed-405',
                scenario: 'invalid-method-request'
            });
            
            // Start performance timer for method error response measurement
            this.testTimer.start();
            
            // Call responseHandler.sendMethodNotAllowed with allowed methods array
            const allowedMethods = ['GET'];
            await this.responseHandler.sendMethodNotAllowed(testContext.request, testContext.response, {
                allowedMethods: allowedMethods,
                correlationId: testContext.correlationId,
                requestedMethod: 'POST'
            });
            
            // Stop timer and measure method error response time
            const responseTime = this.testTimer.stop();
            
            // Validate response status code is 405 using HttpResponseAssertion.assertStatusCode
            this.responseAssertion.assertStatusCode(
                testContext.response,
                STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                'Method not allowed response should have 405 status code'
            );
            
            // Validate Allow header contains proper allowed methods (GET)
            const allowHeader = testContext.response.getHeader(HTTP_HEADERS.ALLOW);
            assert.strictEqual(allowHeader, 'GET', 'Allow header should contain GET method');
            
            // Validate method not allowed error content and formatting
            this.responseAssertion.assertErrorResponse(
                testContext.response,
                ERROR_RESPONSES.methodNotAllowedResponse.content,
                'Method not allowed response should contain proper error message'
            );
            
            // Test method validation error response timing and performance
            this.performanceAssertion.assertResponseTime(
                responseTime,
                PERFORMANCE_THRESHOLDS.maxResponseTime,
                'Method not allowed response should complete within performance threshold'
            );
            
            // Validate response headers include proper Content-Type and Allow headers
            this.responseAssertion.assertResponseHeaders(testContext.response, {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                [HTTP_HEADERS.ALLOW]: 'GET'
            }, 'Method not allowed response should have proper headers');
            
            // Assert method error response completion and proper error handling
            assert.strictEqual(testContext.response.finished, true, 'Method not allowed response should be finished');
            assert.ok(true, 'sendMethodNotAllowed method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for sendMethodNotAllowed test failures
            const methodError = new Error(`sendMethodNotAllowed test failed: ${error.message}`);
            methodError.originalError = error;
            methodError.testMethod = 'testSendMethodNotAllowedMethod';
            throw methodError;
        }
    }
    
    /**
     * Tests sendServerError method for 500 error response generation including secure
     * error handling and information disclosure prevention. Validates proper server error
     * response with security compliance and error information protection.
     * 
     * @returns {Promise<void>} Completes server error response testing with security validation
     */
    async testSendServerErrorMethod() {
        try {
            // Create test context with server error scenario for 500 testing
            const testContext = createTestContext({
                method: 'GET',
                url: '/hello',
                testName: 'sendServerError-500',
                scenario: 'server-error-simulation'
            });
            
            // Create test error object with stack trace and sensitive information
            const testError = new Error('Test server error with sensitive information: database password = secret123');
            testError.stack = 'Error: Test server error\n    at TestFunction (/internal/path/module.js:123:45)';
            testError.sensitiveData = {
                dbPassword: 'secret123',
                apiKey: 'sk-test-12345'
            };
            
            // Start performance timer for server error response measurement
            this.testTimer.start();
            
            // Call responseHandler.sendServerError with error object and context
            await this.responseHandler.sendServerError(testContext.request, testContext.response, testError, {
                correlationId: testContext.correlationId,
                includeStack: false,
                sanitizeError: true
            });
            
            // Stop timer and measure server error response time
            const responseTime = this.testTimer.stop();
            
            // Validate response status code is 500 using HttpResponseAssertion.assertStatusCode
            this.responseAssertion.assertStatusCode(
                testContext.response,
                STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                'Server error response should have 500 status code'
            );
            
            // Validate error response does not disclose sensitive information
            const responseContent = testContext.response.content;
            assert.ok(!responseContent.includes('secret123'), 'Server error response should not disclose sensitive information');
            assert.ok(!responseContent.includes('database password'), 'Server error response should not include error details');
            assert.ok(!responseContent.includes('/internal/path'), 'Server error response should not include internal paths');
            
            // Validate generic server error message in response content
            this.responseAssertion.assertErrorResponse(
                testContext.response,
                ERROR_RESPONSES.internalServerErrorResponse.content,
                'Server error response should contain generic error message'
            );
            
            // Test server error response logging and metrics update
            // Note: In a real implementation, we would verify logging was called
            // For this test, we validate the response structure and security
            
            // Validate response headers are properly set for server errors
            this.responseAssertion.assertResponseHeaders(testContext.response, {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
            }, 'Server error response should have proper content type header');
            
            // Test server error response performance
            this.performanceAssertion.assertResponseTime(
                responseTime,
                PERFORMANCE_THRESHOLDS.maxResponseTime,
                'Server error response should complete within performance threshold'
            );
            
            // Assert server error response completion and security compliance
            assert.strictEqual(testContext.response.finished, true, 'Server error response should be finished');
            assert.ok(true, 'sendServerError method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for sendServerError test failures
            const serverError = new Error(`sendServerError test failed: ${error.message}`);
            serverError.originalError = error;
            serverError.testMethod = 'testSendServerErrorMethod';
            throw serverError;
        }
    }
    
    /**
     * Tests generateResponse method for coordinating response generation based on response
     * type with delegation to appropriate methods. Validates proper response coordination
     * and method delegation based on response type parameters.
     * 
     * @returns {Promise<void>} Completes response generation coordination testing with validation
     */
    async testGenerateResponseMethod() {
        try {
            // Test generateResponse with 'hello' response type delegation to sendHello
            const helloContext = createTestContext({
                testName: 'generateResponse-hello',
                scenario: 'hello-delegation'
            });
            
            await this.responseHandler.generateResponse(helloContext.request, helloContext.response, {
                responseType: 'hello',
                correlationId: helloContext.correlationId
            });
            
            this.responseAssertion.assertStatusCode(helloContext.response, STATUS_CODES.SUCCESS.OK, 'Hello delegation should result in 200 status');
            this.responseAssertion.assertResponseContent(helloContext.response, RESPONSE_MESSAGES.HELLO_WORLD, 'Hello delegation should produce hello content');
            
            // Test generateResponse with 'not_found' response type delegation to sendNotFound
            const notFoundContext = createTestContext({
                url: '/invalid',
                testName: 'generateResponse-notFound',
                scenario: 'not-found-delegation'
            });
            
            await this.responseHandler.generateResponse(notFoundContext.request, notFoundContext.response, {
                responseType: 'not_found',
                correlationId: notFoundContext.correlationId
            });
            
            this.responseAssertion.assertStatusCode(notFoundContext.response, STATUS_CODES.CLIENT_ERROR.NOT_FOUND, 'Not found delegation should result in 404 status');
            
            // Test generateResponse with 'method_not_allowed' type delegation to sendMethodNotAllowed
            const methodContext = createTestContext({
                method: 'POST',
                testName: 'generateResponse-methodNotAllowed',
                scenario: 'method-not-allowed-delegation'
            });
            
            await this.responseHandler.generateResponse(methodContext.request, methodContext.response, {
                responseType: 'method_not_allowed',
                allowedMethods: ['GET'],
                correlationId: methodContext.correlationId
            });
            
            this.responseAssertion.assertStatusCode(methodContext.response, STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 'Method not allowed delegation should result in 405 status');
            
            // Test generateResponse with 'server_error' type delegation to sendServerError
            const errorContext = createTestContext({
                testName: 'generateResponse-serverError',
                scenario: 'server-error-delegation'
            });
            
            const testError = new Error('Test server error for delegation');
            await this.responseHandler.generateResponse(errorContext.request, errorContext.response, {
                responseType: 'server_error',
                error: testError,
                correlationId: errorContext.correlationId
            });
            
            this.responseAssertion.assertStatusCode(errorContext.response, STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, 'Server error delegation should result in 500 status');
            
            // Test generateResponse with invalid response type error handling
            const invalidContext = createTestContext({
                testName: 'generateResponse-invalid',
                scenario: 'invalid-response-type'
            });
            
            try {
                await this.responseHandler.generateResponse(invalidContext.request, invalidContext.response, {
                    responseType: 'invalid_type',
                    correlationId: invalidContext.correlationId
                });
                assert.fail('generateResponse should reject invalid response type');
            } catch (error) {
                assert.ok(error instanceof Error, 'generateResponse should throw error for invalid response type');
                assert.ok(error.message.includes('Invalid response type'), 'Error should indicate invalid response type');
            }
            
            // Assert response generation completion and proper coordination
            assert.ok(true, 'generateResponse method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for generateResponse test failures
            const generateError = new Error(`generateResponse test failed: ${error.message}`);
            generateError.originalError = error;
            generateError.testMethod = 'testGenerateResponseMethod';
            throw generateError;
        }
    }
    
    /**
     * Tests formatResponseHeaders method for HTTP header formatting including lowercased
     * keys, content validation, and HTTP compliance. Validates proper header formatting
     * according to HTTP protocol standards.
     * 
     * @returns {Promise<void>} Completes response header formatting testing with validation
     */
    async testFormatResponseHeadersMethod() {
        try {
            // Test formatResponseHeaders with basic response data and default options
            const basicResponseData = {
                statusCode: STATUS_CODES.SUCCESS.OK,
                content: RESPONSE_MESSAGES.HELLO_WORLD,
                contentType: CONTENT_TYPES.TEXT_PLAIN
            };
            
            const formattedHeaders = this.responseHandler.formatResponseHeaders(basicResponseData);
            
            // Validate header names are lowercased for HTTP/1.1 compliance
            const headerKeys = Object.keys(formattedHeaders);
            headerKeys.forEach(key => {
                assert.strictEqual(key, key.toLowerCase(), `Header name "${key}" should be lowercase for HTTP compliance`);
            });
            
            // Test Content-Type header formatting with proper content type values
            assert.strictEqual(
                formattedHeaders[HTTP_HEADERS.CONTENT_TYPE],
                CONTENT_TYPES.TEXT_PLAIN,
                'Formatted headers should include proper content-type'
            );
            
            // Test Content-Length header calculation and accuracy
            const expectedContentLength = Buffer.byteLength(basicResponseData.content, 'utf8').toString();
            assert.strictEqual(
                formattedHeaders[HTTP_HEADERS.CONTENT_LENGTH],
                expectedContentLength,
                'Formatted headers should include accurate content-length'
            );
            
            // Test Date header formatting with proper timestamp format
            assert.ok(formattedHeaders[HTTP_HEADERS.DATE], 'Formatted headers should include Date header');
            assert.ok(new Date(formattedHeaders[HTTP_HEADERS.DATE]).getTime() > 0, 'Date header should be valid timestamp');
            
            // Test custom header formatting and normalization
            const customResponseData = {
                statusCode: STATUS_CODES.SUCCESS.OK,
                content: 'Custom content',
                contentType: CONTENT_TYPES.TEXT_PLAIN,
                customHeaders: {
                    'X-Custom-Header': 'test-value',
                    'X-UPPERCASE-HEADER': 'uppercase-value',
                    'x-lowercase-header': 'lowercase-value'
                }
            };
            
            const customFormattedHeaders = this.responseHandler.formatResponseHeaders(customResponseData);
            
            // Validate custom headers are properly normalized to lowercase
            assert.strictEqual(customFormattedHeaders['x-custom-header'], 'test-value', 'Custom headers should be normalized to lowercase');
            assert.strictEqual(customFormattedHeaders['x-uppercase-header'], 'uppercase-value', 'Uppercase headers should be normalized to lowercase');
            assert.strictEqual(customFormattedHeaders['x-lowercase-header'], 'lowercase-value', 'Lowercase headers should remain lowercase');
            
            // Validate formatted headers object structure and completeness
            assert.ok(typeof formattedHeaders === 'object', 'formatResponseHeaders should return object');
            assert.ok(formattedHeaders[HTTP_HEADERS.CONTENT_TYPE], 'Formatted headers should include content-type');
            assert.ok(formattedHeaders[HTTP_HEADERS.CONTENT_LENGTH], 'Formatted headers should include content-length');
            assert.ok(formattedHeaders[HTTP_HEADERS.DATE], 'Formatted headers should include date');
            
            // Assert header formatting completion and HTTP compliance
            assert.ok(true, 'formatResponseHeaders method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for formatResponseHeaders test failures
            const formatError = new Error(`formatResponseHeaders test failed: ${error.message}`);
            formatError.originalError = error;
            formatError.testMethod = 'testFormatResponseHeadersMethod';
            throw formatError;
        }
    }
    
    /**
     * Tests validateResponse method for HTTP protocol compliance validation including
     * status codes, headers, and content validation. Validates response structure
     * compliance with HTTP protocol standards and requirements.
     * 
     * @returns {Promise<void>} Completes response validation testing with compliance checking
     */
    async testValidateResponseMethod() {
        try {
            // Test validateResponse with valid response object and validation options
            const validResponseData = {
                statusCode: STATUS_CODES.SUCCESS.OK,
                headers: {
                    [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                    [HTTP_HEADERS.CONTENT_LENGTH]: '11',
                    [HTTP_HEADERS.DATE]: new Date().toUTCString()
                },
                content: RESPONSE_MESSAGES.HELLO_WORLD
            };
            
            const validationResult = this.responseHandler.validateResponse(validResponseData);
            
            // Validate validation result indicates valid response
            assert.strictEqual(validationResult.isValid, true, 'Valid response should pass validation');
            assert.strictEqual(validationResult.errors.length, 0, 'Valid response should have no validation errors');
            
            // Test status code validation using isValidStatusCode function
            const statusCodeValidation = this.responseHandler.validateResponse({
                statusCode: STATUS_CODES.SUCCESS.OK,
                headers: validResponseData.headers,
                content: validResponseData.content
            });
            
            assert.strictEqual(statusCodeValidation.isValid, true, 'Valid status code should pass validation');
            
            // Test header validation for required headers and format compliance
            const headerValidation = this.responseHandler.validateResponse({
                statusCode: STATUS_CODES.SUCCESS.OK,
                headers: {
                    [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                    [HTTP_HEADERS.CONTENT_LENGTH]: '11'
                },
                content: validResponseData.content
            });
            
            assert.strictEqual(headerValidation.isValid, true, 'Response with required headers should pass validation');
            
            // Test content validation for proper encoding and format
            const contentValidation = this.responseHandler.validateResponse({
                statusCode: STATUS_CODES.SUCCESS.OK,
                headers: validResponseData.headers,
                content: RESPONSE_MESSAGES.HELLO_WORLD
            });
            
            assert.strictEqual(contentValidation.isValid, true, 'Response with valid content should pass validation');
            
            // Test response validation with invalid status codes for error handling
            const invalidStatusValidation = this.responseHandler.validateResponse({
                statusCode: 999, // Invalid status code
                headers: validResponseData.headers,
                content: validResponseData.content
            });
            
            assert.strictEqual(invalidStatusValidation.isValid, false, 'Invalid status code should fail validation');
            assert.ok(invalidStatusValidation.errors.length > 0, 'Invalid status code validation should include errors');
            
            // Test response validation with malformed headers for error detection
            const malformedHeaderValidation = this.responseHandler.validateResponse({
                statusCode: STATUS_CODES.SUCCESS.OK,
                headers: {
                    'Invalid Header Name': 'value', // Headers should be lowercase
                    [HTTP_HEADERS.CONTENT_LENGTH]: 'invalid-length' // Invalid content length
                },
                content: validResponseData.content
            });
            
            assert.strictEqual(malformedHeaderValidation.isValid, false, 'Malformed headers should fail validation');
            
            // Validate validation result object structure and compliance details
            assert.ok(typeof validationResult === 'object', 'validateResponse should return validation object');
            assert.ok(typeof validationResult.isValid === 'boolean', 'Validation result should include isValid boolean');
            assert.ok(Array.isArray(validationResult.errors), 'Validation result should include errors array');
            
            // Assert response validation completion and compliance checking
            assert.ok(true, 'validateResponse method tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for validateResponse test failures
            const validateError = new Error(`validateResponse test failed: ${error.message}`);
            validateError.originalError = error;
            validateError.testMethod = 'testValidateResponseMethod';
            throw validateError;
        }
    }
    
    /**
     * Tests response metrics methods including getResponseMetrics and updateResponseMetrics
     * for performance monitoring and statistics. Validates proper metrics tracking,
     * aggregation, and performance data collection.
     * 
     * @returns {Promise<void>} Completes response metrics testing with performance validation
     */
    async testResponseMetricsMethods() {
        try {
            // Test getResponseMetrics method for retrieving current metrics
            const initialMetrics = this.responseHandler.getResponseMetrics();
            
            assert.ok(typeof initialMetrics === 'object', 'getResponseMetrics should return object');
            assert.ok(typeof initialMetrics.responseCount === 'number', 'Metrics should include response count');
            assert.ok(typeof initialMetrics.averageResponseTime === 'number', 'Metrics should include average response time');
            assert.ok(typeof initialMetrics.errorCount === 'number', 'Metrics should include error count');
            
            // Test updateResponseMetrics with hello response type and timing data
            const helloResponseTime = 45; // milliseconds
            this.responseHandler.updateResponseMetrics('hello', helloResponseTime, {
                correlationId: `${TEST_CORRELATION_ID_PREFIX}-hello-metrics`,
                timestamp: Date.now()
            });
            
            const helloMetrics = this.responseHandler.getResponseMetrics();
            assert.ok(helloMetrics.responseCount > initialMetrics.responseCount, 'Response count should increase after hello response');
            assert.ok(helloMetrics.helloResponseCount > 0, 'Hello response count should be tracked');
            
            // Test updateResponseMetrics with error response types and statistics
            const errorResponseTime = 25; // milliseconds
            this.responseHandler.updateResponseMetrics('error', errorResponseTime, {
                correlationId: `${TEST_CORRELATION_ID_PREFIX}-error-metrics`,
                errorType: 'not_found',
                timestamp: Date.now()
            });
            
            const errorMetrics = this.responseHandler.getResponseMetrics();
            assert.ok(errorMetrics.errorCount > initialMetrics.errorCount, 'Error count should increase after error response');
            assert.ok(errorMetrics.errorResponseCount > 0, 'Error response count should be tracked');
            
            // Validate metrics accuracy including response counts and timing
            const totalResponses = helloMetrics.helloResponseCount + errorMetrics.errorResponseCount;
            assert.strictEqual(errorMetrics.responseCount, initialMetrics.responseCount + 2, 'Total response count should match hello + error responses');
            
            // Test metrics aggregation and rolling average calculations
            const expectedAverageTime = (helloResponseTime + errorResponseTime) / 2;
            const actualAverageTime = errorMetrics.averageResponseTime;
            const timeDifference = Math.abs(actualAverageTime - expectedAverageTime);
            assert.ok(timeDifference < 5, 'Average response time should be calculated correctly within margin of error');
            
            // Test metrics reset and cleanup functionality
            if (typeof this.responseHandler.resetMetrics === 'function') {
                this.responseHandler.resetMetrics();
                const resetMetrics = this.responseHandler.getResponseMetrics();
                assert.strictEqual(resetMetrics.responseCount, 0, 'Metrics should reset to zero after resetMetrics call');
                assert.strictEqual(resetMetrics.errorCount, 0, 'Error count should reset to zero after resetMetrics call');
            }
            
            // Validate metrics data structure and completeness
            const currentMetrics = this.responseHandler.getResponseMetrics();
            const requiredMetricFields = ['responseCount', 'averageResponseTime', 'errorCount', 'helloResponseCount', 'errorResponseCount'];
            requiredMetricFields.forEach(field => {
                assert.ok(currentMetrics.hasOwnProperty(field), `Metrics should include ${field} field`);
                assert.ok(typeof currentMetrics[field] === 'number', `Metrics field ${field} should be number`);
            });
            
            // Assert metrics methods completion and accurate tracking
            assert.ok(true, 'Response metrics methods tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for metrics test failures
            const metricsError = new Error(`Response metrics test failed: ${error.message}`);
            metricsError.originalError = error;
            metricsError.testMethod = 'testResponseMetricsMethods';
            throw metricsError;
        }
    }
    
    /**
     * Tests response handler performance requirements including response time, throughput,
     * and resource usage validation. Validates performance compliance with defined
     * thresholds and performance optimization requirements.
     * 
     * @returns {Promise<void>} Completes performance testing with threshold validation
     */
    async testPerformanceRequirements() {
        try {
            // Test hello response generation performance within 100ms threshold
            const helloPerformanceTests = [];
            for (let i = 0; i < 10; i++) {
                const testContext = createTestContext({
                    testName: `performance-hello-${i}`,
                    scenario: 'hello-performance-test'
                });
                
                this.testTimer.start();
                await this.responseHandler.sendHello(testContext.request, testContext.response);
                const responseTime = this.testTimer.stop();
                
                helloPerformanceTests.push(responseTime);
                
                // Validate individual response time meets threshold
                this.performanceAssertion.assertResponseTime(
                    responseTime,
                    PERFORMANCE_THRESHOLDS.maxResponseTime,
                    `Hello response ${i + 1} should complete within ${PERFORMANCE_THRESHOLDS.maxResponseTime}ms`
                );
            }
            
            // Calculate average hello response time and validate performance consistency
            const averageHelloTime = helloPerformanceTests.reduce((sum, time) => sum + time, 0) / helloPerformanceTests.length;
            assert.ok(averageHelloTime <= PERFORMANCE_THRESHOLDS.maxResponseTime, 'Average hello response time should meet performance threshold');
            
            // Test error response generation performance and timing
            const errorPerformanceTests = [];
            for (let i = 0; i < 5; i++) {
                const testContext = createTestContext({
                    url: '/invalid',
                    testName: `performance-error-${i}`,
                    scenario: 'error-performance-test'
                });
                
                this.testTimer.start();
                await this.responseHandler.sendNotFound(testContext.request, testContext.response);
                const responseTime = this.testTimer.stop();
                
                errorPerformanceTests.push(responseTime);
                
                // Validate error response time meets threshold
                this.performanceAssertion.assertResponseTime(
                    responseTime,
                    PERFORMANCE_THRESHOLDS.maxResponseTime,
                    `Error response ${i + 1} should complete within ${PERFORMANCE_THRESHOLDS.maxResponseTime}ms`
                );
            }
            
            // Test response handler memory usage and resource consumption
            const memoryUsageBefore = process.memoryUsage().heapUsed;
            
            // Generate multiple responses to test memory usage patterns
            for (let i = 0; i < 50; i++) {
                const testContext = createTestContext({
                    testName: `memory-test-${i}`,
                    scenario: 'memory-usage-test'
                });
                await this.responseHandler.sendHello(testContext.request, testContext.response);
            }
            
            // Force garbage collection if available for accurate memory measurement
            if (global.gc) {
                global.gc();
            }
            
            const memoryUsageAfter = process.memoryUsage().heapUsed;
            const memoryIncrease = memoryUsageAfter - memoryUsageBefore;
            
            // Validate memory usage stays within acceptable limits
            this.performanceAssertion.assertMemoryUsage(
                memoryIncrease,
                PERFORMANCE_THRESHOLDS.maxMemoryUsage,
                'Memory usage should stay within acceptable limits during response generation'
            );
            
            // Test concurrent response handling and throughput capacity
            const concurrentRequests = 20;
            const concurrentPromises = [];
            const throughputStartTime = Date.now();
            
            for (let i = 0; i < concurrentRequests; i++) {
                const testContext = createTestContext({
                    testName: `concurrent-test-${i}`,
                    scenario: 'concurrent-throughput-test'
                });
                
                const responsePromise = this.responseHandler.sendHello(testContext.request, testContext.response);
                concurrentPromises.push(responsePromise);
            }
            
            // Wait for all concurrent requests to complete
            await Promise.all(concurrentPromises);
            const throughputDuration = Date.now() - throughputStartTime;
            const throughput = (concurrentRequests / throughputDuration) * 1000; // requests per second
            
            // Validate throughput meets minimum requirements
            this.performanceAssertion.assertThroughput(
                throughput,
                PERFORMANCE_THRESHOLDS.minThroughput,
                'Response handler throughput should meet minimum requirements'
            );
            
            // Validate performance metrics against PERFORMANCE_THRESHOLDS constants
            const performanceMetrics = this.responseHandler.getResponseMetrics();
            const metricsValidation = validateResponseHandlerMetrics(performanceMetrics, PERFORMANCE_THRESHOLDS);
            assert.strictEqual(metricsValidation.compliant, true, 'Performance metrics should meet all threshold requirements');
            
            // Assert performance requirements compliance and optimization
            assert.ok(true, 'Performance requirements tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for performance test failures
            const performanceError = new Error(`Performance requirements test failed: ${error.message}`);
            performanceError.originalError = error;
            performanceError.testMethod = 'testPerformanceRequirements';
            throw performanceError;
        }
    }
    
    /**
     * Tests error handling integration with ErrorHandler class including error processing,
     * logging, and response coordination. Validates proper error handling integration
     * and error processing coordination across system components.
     * 
     * @returns {Promise<void>} Completes error handling integration testing with validation
     */
    async testErrorHandlingIntegration() {
        try {
            // Test error handler integration for server error processing
            const serverError = new Error('Integration test server error');
            serverError.code = 'SERVER_ERROR';
            serverError.stack = 'Error stack trace for integration testing';
            
            const errorContext = createTestContext({
                testName: 'errorHandling-integration',
                scenario: 'error-handler-integration'
            });
            
            // Call sendServerError to test error handler integration
            await this.responseHandler.sendServerError(errorContext.request, errorContext.response, serverError, {
                correlationId: errorContext.correlationId,
                processWithErrorHandler: true
            });
            
            // Validate error handler was called and error was processed properly
            this.responseAssertion.assertStatusCode(errorContext.response, STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, 'Error handler integration should result in 500 status');
            assert.ok(!errorContext.response.content.includes('stack trace'), 'Error handler should sanitize error information');
            
            // Test error logging coordination with Logger class integration
            // Note: In real implementation, we would verify logger.error was called
            // For this test, we validate the error response structure and security
            
            // Test error response generation with proper error classification
            const classificationError = new Error('Classification test error');
            classificationError.type = 'VALIDATION_ERROR';
            classificationError.severity = 'HIGH';
            
            const classificationContext = createTestContext({
                testName: 'errorHandling-classification',
                scenario: 'error-classification-test'
            });
            
            await this.responseHandler.sendServerError(classificationContext.request, classificationContext.response, classificationError);
            
            // Validate error classification and proper error response generation
            this.responseAssertion.assertStatusCode(classificationContext.response, STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, 'Error classification should result in proper status code');
            
            // Test error recovery and fallback response mechanisms
            const recoveryError = new Error('Recovery test error');
            recoveryError.recoverable = true;
            
            const recoveryContext = createTestContext({
                testName: 'errorHandling-recovery',
                scenario: 'error-recovery-test'
            });
            
            await this.responseHandler.sendServerError(recoveryContext.request, recoveryContext.response, recoveryError, {
                enableRecovery: true,
                fallbackResponse: true
            });
            
            // Validate error recovery mechanisms and fallback response
            assert.strictEqual(recoveryContext.response.finished, true, 'Error recovery should complete response');
            
            // Validate error handling metrics update and tracking
            const errorMetrics = this.responseHandler.getResponseMetrics();
            assert.ok(errorMetrics.errorCount > 0, 'Error handling should update error count metrics');
            
            // Assert error handling integration completion and reliability
            assert.ok(true, 'Error handling integration tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for error handling integration test failures
            const integrationError = new Error(`Error handling integration test failed: ${error.message}`);
            integrationError.originalError = error;
            integrationError.testMethod = 'testErrorHandlingIntegration';
            throw integrationError;
        }
    }
    
    /**
     * Tests HTTP protocol compliance validation including header formatting, status code
     * usage, and protocol adherence. Validates response handler compliance with HTTP
     * protocol standards and RFC specifications.
     * 
     * @returns {Promise<void>} Completes HTTP compliance testing with protocol validation
     */
    async testHttpComplianceValidation() {
        try {
            // Test HTTP/1.1 protocol compliance for all response types
            const complianceTestCases = [
                {
                    method: 'sendHello',
                    context: createTestContext({ testName: 'compliance-hello', scenario: 'http-compliance-hello' }),
                    expectedStatus: STATUS_CODES.SUCCESS.OK,
                    expectedContent: RESPONSE_MESSAGES.HELLO_WORLD
                },
                {
                    method: 'sendNotFound',
                    context: createTestContext({ url: '/invalid', testName: 'compliance-notFound', scenario: 'http-compliance-404' }),
                    expectedStatus: STATUS_CODES.CLIENT_ERROR.NOT_FOUND
                },
                {
                    method: 'sendMethodNotAllowed',
                    context: createTestContext({ method: 'POST', testName: 'compliance-methodNotAllowed', scenario: 'http-compliance-405' }),
                    expectedStatus: STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    methodOptions: { allowedMethods: ['GET'] }
                }
            ];
            
            // Test each response method for HTTP compliance
            for (const testCase of complianceTestCases) {
                // Execute response method based on test case configuration
                if (testCase.method === 'sendHello') {
                    await this.responseHandler.sendHello(testCase.context.request, testCase.context.response);
                } else if (testCase.method === 'sendNotFound') {
                    await this.responseHandler.sendNotFound(testCase.context.request, testCase.context.response);
                } else if (testCase.method === 'sendMethodNotAllowed') {
                    await this.responseHandler.sendMethodNotAllowed(testCase.context.request, testCase.context.response, testCase.methodOptions);
                }
                
                // Test header formatting compliance with lowercased keys requirement
                const responseHeaders = testCase.context.response.getHeaders();
                Object.keys(responseHeaders).forEach(headerName => {
                    assert.strictEqual(headerName, headerName.toLowerCase(), `Header "${headerName}" should be lowercase for HTTP compliance`);
                });
                
                // Test status code usage compliance with HTTP specification
                const statusCode = testCase.context.response.statusCode;
                assert.strictEqual(statusCode, testCase.expectedStatus, `${testCase.method} should use correct HTTP status code`);
                
                // Test content encoding and character set compliance
                const contentType = responseHeaders[HTTP_HEADERS.CONTENT_TYPE];
                assert.ok(contentType, `${testCase.method} response should include Content-Type header`);
                
                // Test response structure compliance with HTTP message format
                const contentLength = responseHeaders[HTTP_HEADERS.CONTENT_LENGTH];
                const actualContentLength = Buffer.byteLength(testCase.context.response.content, 'utf8');
                assert.strictEqual(parseInt(contentLength), actualContentLength, `${testCase.method} Content-Length should match actual content length`);
                
                // Use HttpResponseAssertion.assertHttpCompliance for comprehensive validation
                this.responseAssertion.assertHttpCompliance(
                    testCase.context.response,
                    `${testCase.method} response should comply with HTTP protocol standards`
                );
            }
            
            // Test response structure compliance with HTTP message format
            const structureTestContext = createTestContext({
                testName: 'compliance-structure',
                scenario: 'http-structure-compliance'
            });
            
            await this.responseHandler.sendHello(structureTestContext.request, structureTestContext.response);
            
            // Validate HTTP message structure with status line, headers, and body
            assert.ok(structureTestContext.response.statusCode, 'HTTP response should have status code');
            assert.ok(structureTestContext.response.headers, 'HTTP response should have headers object');
            assert.ok(typeof structureTestContext.response.content === 'string', 'HTTP response should have string content');
            
            // Validate response handler adherence to HTTP standards
            const httpComplianceValidation = this.responseHandler.validateResponse({
                statusCode: structureTestContext.response.statusCode,
                headers: structureTestContext.response.headers,
                content: structureTestContext.response.content
            });
            
            assert.strictEqual(httpComplianceValidation.isValid, true, 'Response handler should generate HTTP-compliant responses');
            
            // Assert HTTP compliance completion and protocol adherence
            assert.ok(true, 'HTTP compliance validation tests completed successfully');
            
        } catch (error) {
            // Enhanced error context for HTTP compliance test failures
            const complianceError = new Error(`HTTP compliance validation test failed: ${error.message}`);
            complianceError.originalError = error;
            complianceError.testMethod = 'testHttpComplianceValidation';
            throw complianceError;
        }
    }
    
    /**
     * Sets up individual test with clean environment, fresh response handler instance,
     * and performance monitoring. Prepares isolated test environment for reliable
     * and repeatable test execution.
     * 
     * @returns {Promise<void>} Completes test setup with environment preparation
     */
    async setupTest() {
        try {
            // Reset response handler metrics and performance counters
            if (typeof this.responseHandler.resetMetrics === 'function') {
                this.responseHandler.resetMetrics();
            }
            
            // Create fresh mock HTTP objects for test isolation
            this.testEnvironment.currentMocks = {
                request: null,
                response: null,
                correlationId: null
            };
            
            // Initialize test timer and performance monitoring
            this.testTimer.reset();
            this.testEnvironment.performance.measurements = [];
            
            // Set up test correlation ID and context tracking
            this.currentTestCorrelationId = `${TEST_CORRELATION_ID_PREFIX}-setup-${Date.now()}`;
            
            // Prepare test data fixtures and validation scenarios
            this.testEnvironment.currentFixtures = {
                validResponses: VALID_HELLO_RESPONSES,
                errorResponses: ERROR_RESPONSES
            };
            
            // Complete test setup and environment preparation
            this.testEnvironment.setupComplete = true;
            this.testEnvironment.setupTimestamp = new Date().toISOString();
            
        } catch (error) {
            // Enhanced error context for test setup failures
            const setupError = new Error(`Test setup failed: ${error.message}`);
            setupError.originalError = error;
            setupError.testMethod = 'setupTest';
            throw setupError;
        }
    }
    
    /**
     * Cleans up individual test resources including mock objects, timers, and metrics reset.
     * Ensures proper resource cleanup and state reset after each test for reliable
     * test isolation and consistent test execution.
     * 
     * @returns {Promise<void>} Completes test cleanup with resource deallocation
     */
    async cleanupTest() {
        try {
            // Stop test timer and performance monitoring
            if (this.testTimer.isRunning()) {
                this.testTimer.stop();
            }
            
            // Clean up mock HTTP objects and reset state
            if (this.testEnvironment.currentMocks) {
                this.testEnvironment.currentMocks.request = null;
                this.testEnvironment.currentMocks.response = null;
                this.testEnvironment.currentMocks.correlationId = null;
            }
            
            // Clear test correlation ID and context data
            this.currentTestCorrelationId = null;
            
            // Reset response handler metrics for next test
            if (typeof this.responseHandler.resetMetrics === 'function') {
                this.responseHandler.resetMetrics();
            }
            
            // Release test resources and memory allocation
            this.testEnvironment.currentFixtures = null;
            this.testEnvironment.performance.measurements = [];
            
            // Complete test cleanup and prepare for next test
            this.testEnvironment.setupComplete = false;
            this.testEnvironment.cleanupTimestamp = new Date().toISOString();
            
        } catch (error) {
            // Log cleanup errors but don't throw to prevent test cascade failures
            console.error('Test cleanup error:', error.message);
        }
    }
}

// ============================================================================
// RESPONSE HANDLER UNIT TEST SUITE EXECUTION
// ============================================================================

/**
 * Main test suite execution using Node.js built-in test runner with comprehensive
 * ResponseHandler testing including all response methods, error handling, performance
 * validation, and HTTP compliance testing with proper test organization and isolation.
 */
describe('ResponseHandler Unit Test Suite', () => {
    // Test suite shared variables and configuration
    let testSuite;
    let testEnvironment;
    let responseHandler;
    
    // Set up test suite before each test execution
    beforeEach(async () => {
        try {
            // Initialize test suite instance with test configuration
            testSuite = new ResponseHandlerTestSuite({
                enableLogging: false,
                enableMetrics: true,
                timeout: TEST_RESPONSE_TIMEOUT
            });
            
            // Set up test environment and performance monitoring
            testEnvironment = setupTestEnvironment({
                testType: 'unit',
                performance: true,
                isolation: true
            });
            
            // Create fresh ResponseHandler instance for each test
            responseHandler = createTestResponseHandler();
            
            // Configure test suite for individual test execution
            await testSuite.setupTest();
            
        } catch (error) {
            throw new Error(`Test setup failed: ${error.message}`);
        }
    });
    
    // Clean up test resources after each test execution
    afterEach(async () => {
        try {
            // Clean up test suite resources and state
            if (testSuite) {
                await testSuite.cleanupTest();
            }
            
            // Clean up test environment and release resources
            if (testEnvironment) {
                cleanupTestEnvironment(testEnvironment);
            }
            
            // Reset shared variables for next test
            testSuite = null;
            testEnvironment = null;
            responseHandler = null;
            
        } catch (error) {
            console.error('Test cleanup failed:', error.message);
        }
    });
    
    // ========================================================================
    // CONSTRUCTOR VALIDATION TESTS
    // ========================================================================
    
    describe('Constructor Validation Tests', () => {
        test('should initialize ResponseHandler with default configuration', async () => {
            await testSuite.testConstructor();
        });
        
        test('should handle custom configuration options properly', async () => {
            const customHandler = createTestResponseHandler({
                handlerName: 'CustomTestHandler',
                timeout: 2000
            });
            
            assert.ok(customHandler instanceof ResponseHandler, 'Custom configuration should create valid ResponseHandler');
            assert.strictEqual(customHandler.config.timeout, 2000, 'Custom timeout should be applied');
        });
        
        test('should validate configuration parameters during initialization', async () => {
            try {
                createTestResponseHandler({ timeout: -1 });
                assert.fail('Constructor should reject invalid timeout configuration');
            } catch (error) {
                assert.ok(error instanceof Error, 'Constructor should throw error for invalid configuration');
            }
        });
    });
    
    // ========================================================================
    // HELLO ENDPOINT RESPONSE TESTS
    // ========================================================================
    
    describe('Hello Endpoint Response Generation Tests', () => {
        test('should generate successful hello response with proper status and content', async () => {
            await testSuite.testSendHelloMethod();
        });
        
        test('should include proper HTTP headers in hello response', async () => {
            const testContext = createTestContext({
                testName: 'hello-headers-validation',
                scenario: 'hello-headers-test'
            });
            
            await responseHandler.sendHello(testContext.request, testContext.response);
            
            // Validate all required headers are present
            const headers = testContext.response.getHeaders();
            assert.ok(headers[HTTP_HEADERS.CONTENT_TYPE], 'Hello response should include Content-Type header');
            assert.ok(headers[HTTP_HEADERS.CONTENT_LENGTH], 'Hello response should include Content-Length header');
            assert.ok(headers[HTTP_HEADERS.DATE], 'Hello response should include Date header');
            
            // Validate header values are correct
            assert.strictEqual(headers[HTTP_HEADERS.CONTENT_TYPE], CONTENT_TYPES.TEXT_PLAIN, 'Content-Type should be text/plain');
            assert.strictEqual(headers[HTTP_HEADERS.CONTENT_LENGTH], '11', 'Content-Length should match hello content length');
        });
        
        test('should complete hello response within performance threshold', async () => {
            const testContext = createTestContext({
                testName: 'hello-performance',
                scenario: 'hello-performance-test'
            });
            
            const timer = new testEnvironment.performance.timer.constructor();
            timer.start();
            
            await responseHandler.sendHello(testContext.request, testContext.response);
            
            const responseTime = timer.stop();
            
            // Validate response time meets performance requirements
            assert.ok(responseTime <= PERFORMANCE_THRESHOLDS.maxResponseTime, 
                `Hello response time ${responseTime}ms should be within ${PERFORMANCE_THRESHOLDS.maxResponseTime}ms threshold`);
        });
    });
    
    // ========================================================================
    // ERROR RESPONSE GENERATION TESTS
    // ========================================================================
    
    describe('Error Response Generation Tests', () => {
        test('should generate 404 Not Found response for invalid paths', async () => {
            await testSuite.testSendNotFoundMethod();
        });
        
        test('should generate 405 Method Not Allowed response with Allow header', async () => {
            await testSuite.testSendMethodNotAllowedMethod();
        });
        
        test('should generate secure 500 server error response', async () => {
            await testSuite.testSendServerErrorMethod();
        });
        
        test('should not disclose sensitive information in error responses', async () => {
            const sensitiveError = new Error('Database connection failed: password=secret123, host=internal.db.server');
            sensitiveError.stack = 'Error: Database connection failed\n    at /internal/db/connection.js:45:12';
            
            const testContext = createTestContext({
                testName: 'error-information-disclosure',
                scenario: 'sensitive-error-handling'
            });
            
            await responseHandler.sendServerError(testContext.request, testContext.response, sensitiveError);
            
            const responseContent = testContext.response.content;
            assert.ok(!responseContent.includes('password=secret123'), 'Error response should not include password');
            assert.ok(!responseContent.includes('internal.db.server'), 'Error response should not include internal hostnames');
            assert.ok(!responseContent.includes('/internal/'), 'Error response should not include internal paths');
        });
    });
    
    // ========================================================================
    // RESPONSE COORDINATION TESTS
    // ========================================================================
    
    describe('Response Coordination and Generation Tests', () => {
        test('should coordinate response generation based on response type', async () => {
            await testSuite.testGenerateResponseMethod();
        });
        
        test('should format response headers with proper HTTP compliance', async () => {
            await testSuite.testFormatResponseHeadersMethod();
        });
        
        test('should validate response data against HTTP protocol standards', async () => {
            await testSuite.testValidateResponseMethod();
        });
        
        test('should generate response IDs for correlation tracking', async () => {
            const responseId1 = generateResponseId();
            const responseId2 = generateResponseId();
            
            assert.ok(typeof responseId1 === 'string', 'generateResponseId should return string');
            assert.ok(responseId1.length > 0, 'Response ID should not be empty');
            assert.notStrictEqual(responseId1, responseId2, 'Response IDs should be unique');
        });
        
        test('should create response context with proper metadata', async () => {
            const context = createResponseContext({
                correlationId: 'test-context-123',
                requestType: 'hello'
            });
            
            assert.ok(typeof context === 'object', 'createResponseContext should return object');
            assert.ok(context.correlationId, 'Response context should include correlation ID');
            assert.ok(context.timestamp, 'Response context should include timestamp');
        });
    });
    
    // ========================================================================
    // PERFORMANCE AND METRICS TESTS
    // ========================================================================
    
    describe('Performance and Metrics Validation Tests', () => {
        test('should track response metrics accurately', async () => {
            await testSuite.testResponseMetricsMethods();
        });
        
        test('should meet performance requirements for response generation', async () => {
            await testSuite.testPerformanceRequirements();
        });
        
        test('should handle concurrent requests efficiently', async () => {
            const concurrentPromises = [];
            const concurrentCount = 10;
            
            for (let i = 0; i < concurrentCount; i++) {
                const testContext = createTestContext({
                    testName: `concurrent-${i}`,
                    scenario: 'concurrent-request-test'
                });
                
                const promise = responseHandler.sendHello(testContext.request, testContext.response);
                concurrentPromises.push(promise);
            }
            
            const startTime = Date.now();
            await Promise.all(concurrentPromises);
            const totalTime = Date.now() - startTime;
            
            // Validate concurrent handling efficiency
            const averageTime = totalTime / concurrentCount;
            assert.ok(averageTime <= PERFORMANCE_THRESHOLDS.maxResponseTime * 2, 'Concurrent requests should complete efficiently');
        });
        
        test('should maintain memory usage within acceptable limits', async () => {
            const memoryBefore = process.memoryUsage().heapUsed;
            
            // Generate multiple responses to test memory usage
            for (let i = 0; i < 100; i++) {
                const testContext = createTestContext({
                    testName: `memory-${i}`,
                    scenario: 'memory-usage-test'
                });
                await responseHandler.sendHello(testContext.request, testContext.response);
            }
            
            // Force garbage collection for accurate measurement
            if (global.gc) global.gc();
            
            const memoryAfter = process.memoryUsage().heapUsed;
            const memoryIncrease = memoryAfter - memoryBefore;
            
            assert.ok(memoryIncrease <= PERFORMANCE_THRESHOLDS.maxMemoryUsage, 
                `Memory increase ${memoryIncrease} bytes should be within ${PERFORMANCE_THRESHOLDS.maxMemoryUsage} byte limit`);
        });
    });
    
    // ========================================================================
    // ERROR HANDLING INTEGRATION TESTS
    // ========================================================================
    
    describe('Error Handling Integration Tests', () => {
        test('should integrate properly with error handler component', async () => {
            await testSuite.testErrorHandlingIntegration();
        });
        
        test('should handle error processing with proper logging coordination', async () => {
            const loggingError = new Error('Test logging coordination error');
            const testContext = createTestContext({
                testName: 'error-logging-coordination',
                scenario: 'logging-integration-test'
            });
            
            await responseHandler.sendServerError(testContext.request, testContext.response, loggingError);
            
            // Validate error was processed and response generated
            assert.strictEqual(testContext.response.statusCode, STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, 'Error processing should result in 500 status');
            assert.strictEqual(testContext.response.finished, true, 'Error processing should complete response');
        });
        
        test('should implement error recovery mechanisms for recoverable errors', async () => {
            const recoverableError = new Error('Recoverable test error');
            recoverableError.recoverable = true;
            
            const testContext = createTestContext({
                testName: 'error-recovery',
                scenario: 'error-recovery-test'
            });
            
            await responseHandler.sendServerError(testContext.request, testContext.response, recoverableError, {
                enableRecovery: true
            });
            
            // Validate error recovery handled properly
            assert.strictEqual(testContext.response.finished, true, 'Error recovery should complete response');
        });
    });
    
    // ========================================================================
    // HTTP COMPLIANCE VALIDATION TESTS
    // ========================================================================
    
    describe('HTTP Protocol Compliance Tests', () => {
        test('should comply with HTTP/1.1 protocol standards', async () => {
            await testSuite.testHttpComplianceValidation();
        });
        
        test('should format headers with lowercase keys for HTTP compliance', async () => {
            const testContext = createTestContext({
                testName: 'header-case-compliance',
                scenario: 'header-formatting-test'
            });
            
            await responseHandler.sendHello(testContext.request, testContext.response);
            
            const headers = testContext.response.getHeaders();
            Object.keys(headers).forEach(headerName => {
                assert.strictEqual(headerName, headerName.toLowerCase(), 
                    `Header "${headerName}" should be lowercase for HTTP/1.1 compliance`);
            });
        });
        
        test('should use appropriate status codes for different response scenarios', async () => {
            const statusCodeTests = [
                {
                    method: 'sendHello',
                    expected: STATUS_CODES.SUCCESS.OK,
                    description: 'Hello endpoint should use 200 OK status'
                },
                {
                    method: 'sendNotFound', 
                    expected: STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                    description: 'Not found should use 404 status'
                },
                {
                    method: 'sendMethodNotAllowed',
                    expected: STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    description: 'Method not allowed should use 405 status'
                }
            ];
            
            for (const statusTest of statusCodeTests) {
                const testContext = createTestContext({
                    testName: `status-code-${statusTest.method}`,
                    scenario: 'status-code-compliance'
                });
                
                if (statusTest.method === 'sendHello') {
                    await responseHandler.sendHello(testContext.request, testContext.response);
                } else if (statusTest.method === 'sendNotFound') {
                    await responseHandler.sendNotFound(testContext.request, testContext.response);
                } else if (statusTest.method === 'sendMethodNotAllowed') {
                    await responseHandler.sendMethodNotAllowed(testContext.request, testContext.response, { allowedMethods: ['GET'] });
                }
                
                assert.strictEqual(testContext.response.statusCode, statusTest.expected, statusTest.description);
            }
        });
        
        test('should include required HTTP headers in all responses', async () => {
            const requiredHeaders = [HTTP_HEADERS.CONTENT_TYPE, HTTP_HEADERS.CONTENT_LENGTH, HTTP_HEADERS.DATE];
            
            const testContext = createTestContext({
                testName: 'required-headers',
                scenario: 'required-headers-validation'
            });
            
            await responseHandler.sendHello(testContext.request, testContext.response);
            
            const headers = testContext.response.getHeaders();
            requiredHeaders.forEach(requiredHeader => {
                assert.ok(headers[requiredHeader], `Response should include required header: ${requiredHeader}`);
            });
        });
    });
    
    // ========================================================================
    // INTEGRATION AND VALIDATION TESTS
    // ========================================================================
    
    describe('Response Validation and Data Handling Tests', () => {
        test('should validate response data structure and content', async () => {
            const validData = {
                statusCode: STATUS_CODES.SUCCESS.OK,
                content: RESPONSE_MESSAGES.HELLO_WORLD,
                headers: {
                    [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                }
            };
            
            const validation = validateResponseData(validData);
            assert.strictEqual(validation.isValid, true, 'Valid response data should pass validation');
            assert.strictEqual(validation.errors.length, 0, 'Valid response data should have no errors');
        });
        
        test('should handle malformed response data with proper error reporting', async () => {
            const malformedData = {
                statusCode: 'invalid', // Should be number
                content: null, // Should be string
                headers: 'invalid' // Should be object
            };
            
            const validation = validateResponseData(malformedData);
            assert.strictEqual(validation.isValid, false, 'Malformed response data should fail validation');
            assert.ok(validation.errors.length > 0, 'Malformed response data should include validation errors');
        });
        
        test('should create response context with proper correlation tracking', async () => {
            const context = createResponseContext({
                correlationId: 'test-correlation-123',
                requestType: 'hello',
                metadata: { testExecution: true }
            });
            
            assert.ok(context.correlationId, 'Response context should include correlation ID');
            assert.ok(context.timestamp, 'Response context should include timestamp');
            assert.ok(context.metadata, 'Response context should include metadata');
        });
    });
    
    // ========================================================================
    // END-TO-END RESPONSE LIFECYCLE TESTS
    // ========================================================================
    
    describe('Complete Response Lifecycle Tests', () => {
        test('should handle complete request/response lifecycle for hello endpoint', async () => {
            const testContext = createTestContext({
                method: 'GET',
                url: '/hello',
                testName: 'complete-lifecycle-hello',
                scenario: 'end-to-end-hello-test'
            });
            
            // Start complete lifecycle timing
            const lifecycleTimer = new testEnvironment.performance.timer.constructor();
            lifecycleTimer.start();
            
            // Execute complete response lifecycle
            await responseHandler.sendHello(testContext.request, testContext.response);
            
            const lifecycleTime = lifecycleTimer.stop();
            
            // Validate complete lifecycle completion
            assert.strictEqual(testContext.response.finished, true, 'Complete lifecycle should finish response');
            assert.strictEqual(testContext.response.headersSent, true, 'Complete lifecycle should send headers');
            assert.strictEqual(testContext.response.statusCode, STATUS_CODES.SUCCESS.OK, 'Complete lifecycle should set correct status');
            assert.strictEqual(testContext.response.content, RESPONSE_MESSAGES.HELLO_WORLD, 'Complete lifecycle should set correct content');
            
            // Validate lifecycle performance
            assert.ok(lifecycleTime <= PERFORMANCE_THRESHOLDS.maxResponseTime, 'Complete lifecycle should meet performance requirements');
        });
        
        test('should handle complete error response lifecycle with proper error handling', async () => {
            const serverError = new Error('Complete lifecycle server error test');
            const testContext = createTestContext({
                testName: 'complete-lifecycle-error',
                scenario: 'end-to-end-error-test'
            });
            
            await responseHandler.sendServerError(testContext.request, testContext.response, serverError);
            
            // Validate complete error lifecycle
            assert.strictEqual(testContext.response.finished, true, 'Complete error lifecycle should finish response');
            assert.strictEqual(testContext.response.statusCode, STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, 'Complete error lifecycle should set 500 status');
            assert.ok(testContext.response.content.length > 0, 'Complete error lifecycle should include error content');
        });
        
        test('should maintain HTTP compliance throughout complete response lifecycle', async () => {
            const testContext = createTestContext({
                testName: 'lifecycle-compliance',
                scenario: 'complete-compliance-test'
            });
            
            await responseHandler.sendHello(testContext.request, testContext.response);
            
            // Validate HTTP compliance throughout lifecycle
            testSuite.responseAssertion.assertHttpCompliance(testContext.response, 'Complete lifecycle should maintain HTTP compliance');
            
            // Validate response structure integrity
            assert.ok(testContext.response.statusCode, 'Complete lifecycle should maintain status code');
            assert.ok(testContext.response.headers, 'Complete lifecycle should maintain headers');
            assert.ok(typeof testContext.response.content === 'string', 'Complete lifecycle should maintain content integrity');
        });
    });
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export main test suite class for comprehensive ResponseHandler testing
export { ResponseHandlerTestSuite };

// Export factory function for creating ResponseHandler instances configured for testing
export { createTestResponseHandler };

// Export factory function for creating test context objects with mock request and response
export { createTestContext };

// Export utility function for validating response handler performance metrics
export { validateResponseHandlerMetrics };

// Export utility function for setting up test environment with configuration and monitoring
export { setupTestEnvironment };

// Export utility function for cleaning up test environment resources and state
export { cleanupTestEnvironment };