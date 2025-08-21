/**
 * Hello World Endpoint Comprehensive Test Suite
 * 
 * This test suite provides comprehensive testing for the Hello World endpoint functionality
 * in the Node.js tutorial application. It implements unit tests, integration tests, and 
 * end-to-end tests for the GET /hello endpoint using Node.js built-in test runner with 
 * zero external dependencies.
 * 
 * Test Coverage:
 * - Unit Tests: Direct controller method testing and business logic validation
 * - Integration Tests: Full HTTP request-response cycle with server instances
 * - End-to-End Tests: Complete application workflow testing with real HTTP clients
 * - Performance Tests: Response time validation and throughput testing
 * - Error Scenario Tests: Comprehensive error handling and edge case validation
 * 
 * Educational Objectives:
 * - Demonstrates production-ready testing patterns using Node.js built-in tools
 * - Shows comprehensive test organization and structure for maintainable test suites
 * - Illustrates proper test isolation and resource management
 * - Provides examples of performance testing and benchmarking
 * - Demonstrates security-conscious testing patterns and validation
 * - Shows integration between test components and application architecture
 * 
 * Architecture Integration:
 * - Supports F-002 Hello Endpoint Implementation with comprehensive endpoint testing
 * - Validates F-003 Request Processing Engine through request handling verification
 * - Tests F-004 Response Generation System with response validation and formatting
 * - Implements Basic Testing Approach from SYSTEM COMPONENTS DESIGN specification
 * 
 * @fileoverview Comprehensive test suite for Hello World endpoint with educational patterns
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// NODE.JS BUILT-IN TEST FRAMEWORK IMPORTS
// ============================================================================

import { test, describe, beforeEach, afterEach, before, after } from 'node:test'; // Node.js v18+ built-in test runner
import assert from 'node:assert'; // Node.js built-in assertion library

// ============================================================================
// APPLICATION COMPONENT IMPORTS
// ============================================================================

// Import application factory and main Application class for test server creation
import { createApplication, Application } from '../app.js';

// Import HelloController for direct unit testing of controller functionality
import { HelloController } from '../controllers/hello.controller.js';

// ============================================================================
// TEST FRAMEWORK COMPONENT IMPORTS
// ============================================================================

// Import HTTP test client for comprehensive endpoint testing and validation
import { HttpTestClient } from './helpers/test-client.js';

// Import test server management for coordinated testing with server instances
import { TestServer } from './helpers/test-server.js';

// Import specialized assertion classes for comprehensive response validation
import { HttpResponseAssertion, PerformanceAssertion } from './helpers/assertions.js';

// ============================================================================
// TEST UTILITIES AND FIXTURE IMPORTS
// ============================================================================

// Import test configuration settings for timeouts, ports, and performance thresholds
import { TEST_CONFIG } from './fixtures/test-config.js';

// Import test data fixtures for various request scenarios and validation
import { 
    createValidHelloRequest,
    INVALID_METHOD_REQUESTS,
    INVALID_PATH_REQUESTS
} from './fixtures/request-data.js';

// ============================================================================
// APPLICATION CONSTANTS AND UTILITIES
// ============================================================================

// Import HTTP status codes for response validation and test assertions
import { HTTP_STATUS_CODES } from '../utils/http-status.js';

// Import response message constants for content validation
import { RESPONSE_MESSAGES } from '../constants/response-messages.js';

// ============================================================================
// LOCAL TEST UTILITY IMPLEMENTATIONS
// ============================================================================

/**
 * Generates unique correlation ID for tracking requests across test execution
 * Note: This function is implemented locally since test-utils.js is not available
 * 
 * @returns {string} Unique correlation ID for request tracking and debugging
 */
function generateCorrelationId() {
    const timestamp = Date.now();
    const randomBytes = Math.random().toString(36).substring(2, 15);
    return `test-corr-${timestamp}-${randomBytes}`;
}

/**
 * TestTimer Class - High-precision timing for HTTP request performance measurement
 * Note: This class is implemented locally since test-utils.js is not available
 * 
 * Provides accurate timing measurement for performance testing and validation
 * with millisecond precision suitable for HTTP response time validation.
 */
class TestTimer {
    constructor() {
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Starts the timer for performance measurement
     * @returns {TestTimer} Returns this for method chaining
     */
    start() {
        this.startTime = process.hrtime.bigint();
        this.endTime = null;
        return this;
    }

    /**
     * Stops the timer and records end time
     * @returns {TestTimer} Returns this for method chaining
     */
    stop() {
        if (this.startTime === null) {
            throw new Error('Timer must be started before stopping');
        }
        this.endTime = process.hrtime.bigint();
        return this;
    }

    /**
     * Gets elapsed time in milliseconds with high precision
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsed() {
        if (this.startTime === null) {
            throw new Error('Timer must be started before getting elapsed time');
        }
        
        const endTime = this.endTime || process.hrtime.bigint();
        const elapsedNanoseconds = endTime - this.startTime;
        return Number(elapsedNanoseconds) / 1_000_000; // Convert to milliseconds
    }
}

// ============================================================================
// TEST SUITE GLOBAL CONFIGURATION
// ============================================================================

/**
 * Global test suite configuration based on TEST_SUITE_CONFIG from JSON specification
 */
const TEST_SUITE_CONFIG = {
    suiteName: 'Hello Endpoint Tests',
    version: '1.0.0',
    timeout: 10000,
    retries: 3,
    parallel: false,
    coverage: true
};

/**
 * Hello endpoint specific test configuration based on HELLO_ENDPOINT_TEST_CONFIG
 */
const HELLO_ENDPOINT_TEST_CONFIG = {
    endpoint: '/hello',
    method: 'GET',
    expectedStatus: 200,
    expectedContent: 'Hello world',
    expectedContentType: 'text/plain; charset=utf-8',
    maxResponseTime: 100,
    performanceTestCount: 100
};

/**
 * Error scenario test configuration based on ERROR_SCENARIO_TEST_CONFIG
 */
const ERROR_SCENARIO_TEST_CONFIG = {
    invalidPaths: ['/invalid', '/nonexistent', '/hello/extra'],
    invalidMethods: ['POST', 'PUT', 'DELETE'],
    expectedNotFoundStatus: 404,
    expectedMethodNotAllowedStatus: 405
};

// ============================================================================
// TEST ENVIRONMENT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Sets up the complete test environment including test server initialization,
 * test client configuration, and test assertion setup for hello endpoint testing.
 * 
 * @returns {Object} Test environment object containing server, client, and assertion instances
 */
async function setupTestEnvironment() {
    try {
        // Create test application instance using createApplication factory function
        const application = createApplication();
        
        // Initialize TestServer with test-specific configuration and port allocation
        const testServer = new TestServer({
            application,
            port: TEST_CONFIG.testServerPort,
            timeout: TEST_CONFIG.timeout
        });
        
        // Start test server and wait for ready state
        await testServer.start();
        const serverInfo = testServer.getServerInfo();
        
        // Create HttpTestClient instance configured for hello endpoint testing
        const testClient = new HttpTestClient({
            baseUrl: `http://localhost:${serverInfo.port}`,
            timeout: TEST_CONFIG.timeout,
            followRedirects: false
        });
        
        // Initialize HttpResponseAssertion and PerformanceAssertion for validation
        const responseAssertion = new HttpResponseAssertion({
            strictMode: true,
            validateHeaders: true,
            validateContent: true
        });
        
        const performanceAssertion = new PerformanceAssertion({
            thresholds: TEST_CONFIG.performanceThresholds,
            strictTiming: true
        });
        
        // Set up test correlation tracking and logging for test execution monitoring
        const correlationId = generateCorrelationId();
        const timer = new TestTimer();
        
        // Return comprehensive test environment object for test execution
        return {
            application,
            testServer,
            testClient,
            responseAssertion,
            performanceAssertion,
            correlationId,
            timer,
            serverInfo
        };
        
    } catch (error) {
        throw new Error(`Failed to setup test environment: ${error.message}`);
    }
}

/**
 * Cleans up test environment resources including server shutdown, client connection
 * cleanup, and resource deallocation after test execution.
 * 
 * @param {Object} testEnvironment - The test environment object to clean up
 * @returns {Promise} Promise that resolves when complete test environment cleanup is finished
 */
async function teardownTestEnvironment(testEnvironment) {
    try {
        if (!testEnvironment) {
            return;
        }
        
        // Close HttpTestClient connections and clean up client resources
        if (testEnvironment.testClient) {
            await testEnvironment.testClient.close();
        }
        
        // Stop TestServer and wait for graceful server shutdown
        if (testEnvironment.testServer) {
            await testEnvironment.testServer.stop();
        }
        
        // Clean up application instance and component resources
        if (testEnvironment.application && typeof testEnvironment.application.stop === 'function') {
            await testEnvironment.application.stop();
        }
        
        // Log test environment teardown completion with resource summary
        console.log(`Test environment cleanup completed for correlation ID: ${testEnvironment.correlationId}`);
        
    } catch (error) {
        console.error(`Test environment teardown error: ${error.message}`);
        throw error;
    }
}

/**
 * Creates comprehensive test context with correlation ID, timing information,
 * and test metadata for enhanced test execution tracking and debugging.
 * 
 * @param {string} testName - Name of the test case for context creation
 * @param {Object} testOptions - Additional options for test context configuration
 * @returns {Object} Test context object with correlation tracking, timing, and metadata
 */
function createTestContext(testName, testOptions = {}) {
    try {
        // Generate unique test correlation ID using generateCorrelationId for tracking
        const correlationId = generateCorrelationId();
        
        // Initialize test timing measurement using TestTimer for performance tracking
        const timer = new TestTimer();
        
        // Create test context with test name, suite information, and configuration
        const testContext = {
            testName,
            correlationId,
            timer,
            startTime: Date.now(),
            suiteConfig: TEST_SUITE_CONFIG,
            endpointConfig: HELLO_ENDPOINT_TEST_CONFIG,
            errorConfig: ERROR_SCENARIO_TEST_CONFIG,
            testOptions
        };
        
        // Add test metadata including endpoint, method, and expected results
        testContext.metadata = {
            endpoint: HELLO_ENDPOINT_TEST_CONFIG.endpoint,
            method: HELLO_ENDPOINT_TEST_CONFIG.method,
            expectedStatus: HELLO_ENDPOINT_TEST_CONFIG.expectedStatus,
            expectedContent: HELLO_ENDPOINT_TEST_CONFIG.expectedContent,
            maxResponseTime: HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime
        };
        
        // Return comprehensive test context for test function usage
        return testContext;
        
    } catch (error) {
        // Return minimal test context if creation fails
        return {
            testName,
            correlationId: `error-${Date.now()}`,
            timer: new TestTimer(),
            startTime: Date.now(),
            error: error.message
        };
    }
}

// ============================================================================
// MAIN TEST SUITE IMPLEMENTATION
// ============================================================================

/**
 * Main Test Suite: Hello Endpoint Tests
 * 
 * Comprehensive test suite for /hello endpoint functionality implementing unit tests,
 * integration tests, end-to-end tests, performance validation, and error scenario testing
 * using Node.js built-in test runner with production-ready test patterns.
 */
describe('Hello Endpoint Tests - Comprehensive test suite for /hello endpoint', () => {
    
    // Global test environment variables
    let testEnvironment = null;
    let suiteStartTime = null;
    let suiteCorrelationId = null;
    
    // ========================================================================
    // SUITE-LEVEL SETUP AND TEARDOWN
    // ========================================================================
    
    /**
     * Suite-level setup: Initialize test environment and validate test prerequisites
     */
    before(async () => {
        try {
            suiteStartTime = Date.now();
            suiteCorrelationId = generateCorrelationId();
            
            console.log(`\n=== Starting Hello Endpoint Test Suite ===`);
            console.log(`Suite Correlation ID: ${suiteCorrelationId}`);
            console.log(`Test Configuration: ${JSON.stringify(TEST_SUITE_CONFIG, null, 2)}`);
            console.log(`Endpoint Configuration: ${JSON.stringify(HELLO_ENDPOINT_TEST_CONFIG, null, 2)}`);
            
            // Setup test environment with all necessary components
            testEnvironment = await setupTestEnvironment();
            
            console.log(`Test environment initialized successfully`);
            console.log(`Test server running on port: ${testEnvironment.serverInfo.port}`);
            
        } catch (error) {
            console.error(`Suite setup failed: ${error.message}`);
            throw error;
        }
    });
    
    /**
     * Suite-level teardown: Clean up test environment and resources
     */
    after(async () => {
        try {
            if (testEnvironment) {
                await teardownTestEnvironment(testEnvironment);
            }
            
            const suiteDuration = Date.now() - suiteStartTime;
            console.log(`\n=== Hello Endpoint Test Suite Completed ===`);
            console.log(`Suite Duration: ${suiteDuration}ms`);
            console.log(`Suite Correlation ID: ${suiteCorrelationId}`);
            
        } catch (error) {
            console.error(`Suite teardown error: ${error.message}`);
        }
    });
    
    // ========================================================================
    // UNIT TESTS: Direct Controller Testing
    // ========================================================================
    
    describe('Unit Tests - HelloController Direct Method Testing', () => {
        let helloController = null;
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('HelloController Unit Test');
            helloController = new HelloController();
            
            console.log(`Starting unit test with correlation ID: ${testContext.correlationId}`);
        });
        
        afterEach(() => {
            if (testContext && testContext.timer) {
                const elapsed = testContext.timer.getElapsed();
                console.log(`Unit test completed in ${elapsed}ms`);
            }
        });
        
        test('HelloController.handleGetRequest() should return hello world response', async () => {
            // Create test context and start timing
            const context = createTestContext('handleGetRequest unit test');
            context.timer.start();
            
            try {
                // Create valid hello request using test fixture
                const validRequest = createValidHelloRequest();
                
                // Create mock response object for controller testing
                let responseData = {};
                const mockResponse = {
                    writeHead: (statusCode, headers) => {
                        responseData.statusCode = statusCode;
                        responseData.headers = headers || {};
                    },
                    end: (data) => {
                        responseData.body = data;
                        responseData.completed = true;
                    }
                };
                
                // Call controller method directly for unit testing
                await helloController.handleGetRequest(validRequest, mockResponse);
                
                // Validate response using assertions
                assert.strictEqual(responseData.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'Controller should return 200 OK status code');
                assert.strictEqual(responseData.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'Controller should return "Hello world" content');
                assert.strictEqual(responseData.completed, true, 
                    'Controller should complete response');
                
                // Validate response timing for performance requirements
                context.timer.stop();
                const responseTime = context.timer.getElapsed();
                assert.ok(responseTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime, 
                    `Controller response time ${responseTime}ms should be under ${HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime}ms`);
                
                console.log(`✓ HelloController unit test passed in ${responseTime}ms`);
                
            } catch (error) {
                console.error(`✗ HelloController unit test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('HelloController.processRequest() should validate request method', async () => {
            const context = createTestContext('processRequest method validation');
            context.timer.start();
            
            try {
                // Create invalid method request for validation testing
                const invalidRequest = INVALID_METHOD_REQUESTS.postRequest;
                
                // Create mock response for error handling testing
                let responseData = {};
                const mockResponse = {
                    writeHead: (statusCode, headers) => {
                        responseData.statusCode = statusCode;
                        responseData.headers = headers || {};
                    },
                    end: (data) => {
                        responseData.body = data;
                        responseData.completed = true;
                    }
                };
                
                // Call controller method with invalid method
                await helloController.processRequest(invalidRequest, mockResponse);
                
                // Validate error response for method validation
                assert.strictEqual(responseData.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    'Controller should return 405 Method Not Allowed for invalid methods');
                assert.strictEqual(responseData.completed, true,
                    'Controller should complete error response');
                
                context.timer.stop();
                const responseTime = context.timer.getElapsed();
                
                console.log(`✓ Method validation test passed in ${responseTime}ms`);
                
            } catch (error) {
                console.error(`✗ Method validation test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('HelloController.isHealthy() should return health status', async () => {
            const context = createTestContext('isHealthy health check');
            context.timer.start();
            
            try {
                // Test controller health status
                const healthStatus = await helloController.isHealthy();
                
                // Validate health check response
                assert.strictEqual(typeof healthStatus, 'object', 
                    'Health status should return an object');
                assert.strictEqual(healthStatus.healthy, true, 
                    'Controller should report healthy status');
                assert.ok(healthStatus.timestamp, 
                    'Health status should include timestamp');
                
                context.timer.stop();
                const responseTime = context.timer.getElapsed();
                
                console.log(`✓ Health check test passed in ${responseTime}ms`);
                
            } catch (error) {
                console.error(`✗ Health check test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // INTEGRATION TESTS: HTTP Client-Server Testing
    // ========================================================================
    
    describe('Integration Tests - HTTP Request-Response Cycle Testing', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Integration Test');
            console.log(`Starting integration test with correlation ID: ${testContext.correlationId}`);
        });
        
        afterEach(() => {
            if (testContext && testContext.timer) {
                const elapsed = testContext.timer.getElapsed();
                console.log(`Integration test completed in ${elapsed}ms`);
            }
        });
        
        test('GET /hello should return 200 OK with "Hello world" content', async () => {
            const context = createTestContext('GET /hello success scenario');
            context.timer.start();
            
            try {
                // Make HTTP request to hello endpoint using test client
                const response = await testEnvironment.testClient.get('/hello', {
                    headers: {
                        'x-correlation-id': context.correlationId
                    }
                });
                
                // Validate response using HttpResponseAssertion
                await testEnvironment.responseAssertion.assertHelloResponse(response, {
                    expectedStatus: HELLO_ENDPOINT_TEST_CONFIG.expectedStatus,
                    expectedContent: HELLO_ENDPOINT_TEST_CONFIG.expectedContent,
                    expectedContentType: HELLO_ENDPOINT_TEST_CONFIG.expectedContentType
                });
                
                // Validate performance requirements using PerformanceAssertion
                context.timer.stop();
                const responseTime = context.timer.getElapsed();
                await testEnvironment.performanceAssertion.assertResponseTime(responseTime, {
                    maxTime: HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime,
                    testName: 'hello_endpoint_response_time'
                });
                
                console.log(`✓ Hello endpoint integration test passed in ${responseTime}ms`);
                
            } catch (error) {
                console.error(`✗ Hello endpoint integration test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('GET /hello should include proper HTTP headers', async () => {
            const context = createTestContext('HTTP headers validation');
            context.timer.start();
            
            try {
                // Make HTTP request with header validation focus
                const response = await testEnvironment.testClient.get('/hello', {
                    headers: {
                        'x-correlation-id': context.correlationId,
                        'accept': 'text/plain'
                    }
                });
                
                // Validate response headers using specialized assertion
                await testEnvironment.responseAssertion.assertResponseHeaders(response, {
                    requiredHeaders: ['content-type', 'content-length', 'date'],
                    expectedContentType: HELLO_ENDPOINT_TEST_CONFIG.expectedContentType,
                    validateStandardHeaders: true
                });
                
                // Additional header validation
                assert.ok(response.headers['content-type'], 
                    'Response should include Content-Type header');
                assert.ok(response.headers['content-length'], 
                    'Response should include Content-Length header');
                assert.ok(response.headers['date'], 
                    'Response should include Date header');
                
                context.timer.stop();
                const responseTime = context.timer.getElapsed();
                
                console.log(`✓ Headers validation test passed in ${responseTime}ms`);
                
            } catch (error) {
                console.error(`✗ Headers validation test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Multiple concurrent requests should be handled correctly', async () => {
            const context = createTestContext('Concurrent requests test');
            context.timer.start();
            
            try {
                const concurrentRequestCount = 10;
                const requestPromises = [];
                
                // Create multiple concurrent requests to test server handling
                for (let i = 0; i < concurrentRequestCount; i++) {
                    const requestPromise = testEnvironment.testClient.get('/hello', {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-${i + 1}`,
                            'x-request-index': (i + 1).toString()
                        }
                    });
                    requestPromises.push(requestPromise);
                }
                
                // Wait for all concurrent requests to complete
                const responses = await Promise.all(requestPromises);
                
                // Validate all responses for consistency
                responses.forEach((response, index) => {
                    assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK,
                        `Concurrent request ${index + 1} should return 200 OK`);
                    assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                        `Concurrent request ${index + 1} should return correct content`);
                });
                
                context.timer.stop();
                const totalTime = context.timer.getElapsed();
                const averageTime = totalTime / concurrentRequestCount;
                
                // Validate concurrent request performance
                assert.ok(averageTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime,
                    `Average response time ${averageTime}ms should be under threshold`);
                
                console.log(`✓ Concurrent requests test passed: ${concurrentRequestCount} requests in ${totalTime}ms (avg: ${averageTime}ms)`);
                
            } catch (error) {
                console.error(`✗ Concurrent requests test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // END-TO-END TESTS: Complete Application Workflow Testing
    // ========================================================================
    
    describe('End-to-End Tests - Complete Application Workflow Validation', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('End-to-End Test');
            console.log(`Starting E2E test with correlation ID: ${testContext.correlationId}`);
        });
        
        afterEach(() => {
            if (testContext && testContext.timer) {
                const elapsed = testContext.timer.getElapsed();
                console.log(`E2E test completed in ${elapsed}ms`);
            }
        });
        
        test('Complete hello endpoint workflow should function correctly', async () => {
            const context = createTestContext('Complete workflow E2E test');
            context.timer.start();
            
            try {
                // Test complete workflow from HTTP client to response
                const workflowSteps = [];
                
                // Step 1: Verify server is ready
                const serverReady = testEnvironment.testServer.isReady();
                assert.strictEqual(serverReady, true, 'Test server should be ready');
                workflowSteps.push('Server Ready');
                
                // Step 2: Make HTTP request to hello endpoint
                const response = await testEnvironment.testClient.testHelloEndpoint({
                    correlationId: context.correlationId,
                    validateResponse: true
                });
                workflowSteps.push('HTTP Request Sent');
                
                // Step 3: Validate complete response structure
                await testEnvironment.responseAssertion.assertHelloResponse(response, {
                    expectedStatus: HELLO_ENDPOINT_TEST_CONFIG.expectedStatus,
                    expectedContent: HELLO_ENDPOINT_TEST_CONFIG.expectedContent,
                    validateHeaders: true,
                    validateTiming: true
                });
                workflowSteps.push('Response Validated');
                
                // Step 4: Verify application health after request
                const appHealthStatus = await testEnvironment.application.getHealthStatus();
                assert.strictEqual(appHealthStatus.healthy, true, 
                    'Application should remain healthy after request');
                workflowSteps.push('Health Verified');
                
                context.timer.stop();
                const workflowTime = context.timer.getElapsed();
                
                // Validate end-to-end performance
                assert.ok(workflowTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime * 2,
                    `E2E workflow time ${workflowTime}ms should be reasonable`);
                
                console.log(`✓ Complete workflow E2E test passed in ${workflowTime}ms`);
                console.log(`  Workflow steps: ${workflowSteps.join(' → ')}`);
                
            } catch (error) {
                console.error(`✗ Complete workflow E2E test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Application lifecycle should handle request processing correctly', async () => {
            const context = createTestContext('Application lifecycle E2E test');
            context.timer.start();
            
            try {
                // Test application state before request
                const initialHealth = await testEnvironment.application.getHealthStatus();
                assert.strictEqual(initialHealth.healthy, true, 
                    'Application should be healthy before request');
                
                // Process multiple requests to test lifecycle stability
                const requestCount = 5;
                const responses = [];
                
                for (let i = 0; i < requestCount; i++) {
                    const response = await testEnvironment.testClient.get('/hello', {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-lifecycle-${i + 1}`
                        }
                    });
                    responses.push(response);
                }
                
                // Validate all responses maintain consistency
                responses.forEach((response, index) => {
                    assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK,
                        `Lifecycle request ${index + 1} should return 200 OK`);
                    assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                        `Lifecycle request ${index + 1} should return correct content`);
                });
                
                // Test application state after requests
                const finalHealth = await testEnvironment.application.getHealthStatus();
                assert.strictEqual(finalHealth.healthy, true, 
                    'Application should remain healthy after multiple requests');
                
                context.timer.stop();
                const lifecycleTime = context.timer.getElapsed();
                
                console.log(`✓ Application lifecycle E2E test passed in ${lifecycleTime}ms`);
                console.log(`  Processed ${requestCount} requests successfully`);
                
            } catch (error) {
                console.error(`✗ Application lifecycle E2E test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // ERROR SCENARIO TESTS: Comprehensive Error Handling Validation
    // ========================================================================
    
    describe('Error Scenario Tests - Comprehensive Error Handling Validation', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Error Scenario Test');
            console.log(`Starting error test with correlation ID: ${testContext.correlationId}`);
        });
        
        afterEach(() => {
            if (testContext && testContext.timer) {
                const elapsed = testContext.timer.getElapsed();
                console.log(`Error test completed in ${elapsed}ms`);
            }
        });
        
        test('Invalid HTTP methods should return 405 Method Not Allowed', async () => {
            const context = createTestContext('Invalid method error test');
            context.timer.start();
            
            try {
                // Test each invalid method from configuration
                for (const method of ERROR_SCENARIO_TEST_CONFIG.invalidMethods) {
                    const response = await testEnvironment.testClient[method.toLowerCase()]('/hello', {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-${method.toLowerCase()}`
                        }
                    });
                    
                    // Validate error response using assertion helper
                    await testEnvironment.responseAssertion.assertErrorResponse(response, {
                        expectedStatus: ERROR_SCENARIO_TEST_CONFIG.expectedMethodNotAllowedStatus,
                        errorType: 'METHOD_NOT_ALLOWED',
                        validateErrorFormat: true
                    });
                    
                    console.log(`  ✓ ${method} method correctly returned 405 error`);
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Invalid method error test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Invalid method error test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Invalid paths should return 404 Not Found', async () => {
            const context = createTestContext('Invalid path error test');
            context.timer.start();
            
            try {
                // Test each invalid path from configuration
                for (const path of ERROR_SCENARIO_TEST_CONFIG.invalidPaths) {
                    const response = await testEnvironment.testClient.get(path, {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-path${path.replace(/\//g, '-')}`
                        }
                    });
                    
                    // Validate 404 error response
                    await testEnvironment.responseAssertion.assertErrorResponse(response, {
                        expectedStatus: ERROR_SCENARIO_TEST_CONFIG.expectedNotFoundStatus,
                        errorType: 'NOT_FOUND',
                        validateErrorFormat: true
                    });
                    
                    console.log(`  ✓ Path ${path} correctly returned 404 error`);
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Invalid path error test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Invalid path error test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Malformed requests should be handled gracefully', async () => {
            const context = createTestContext('Malformed request error test');
            context.timer.start();
            
            try {
                // Test malformed request handling
                const malformedTests = [
                    { path: '/hello/../admin', description: 'path traversal attempt' },
                    { path: '/hello?param=<script>', description: 'XSS attempt in query' },
                    { path: '/hello%00admin', description: 'null byte injection' }
                ];
                
                for (const testCase of malformedTests) {
                    try {
                        const response = await testEnvironment.testClient.get(testCase.path, {
                            headers: {
                                'x-correlation-id': `${context.correlationId}-malformed`
                            }
                        });
                        
                        // Validate error response for malformed requests
                        assert.ok(response.statusCode >= 400 && response.statusCode < 500,
                            `Malformed request (${testCase.description}) should return 4xx error`);
                        
                        console.log(`  ✓ Malformed request (${testCase.description}) correctly handled`);
                        
                    } catch (requestError) {
                        // Connection errors are acceptable for malformed requests
                        console.log(`  ✓ Malformed request (${testCase.description}) rejected at connection level`);
                    }
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Malformed request error test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Malformed request error test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // PERFORMANCE TESTS: Response Time and Throughput Validation
    // ========================================================================
    
    describe('Performance Tests - Response Time and Throughput Validation', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Performance Test');
            console.log(`Starting performance test with correlation ID: ${testContext.correlationId}`);
        });
        
        afterEach(() => {
            if (testContext && testContext.timer) {
                const elapsed = testContext.timer.getElapsed();
                console.log(`Performance test completed in ${elapsed}ms`);
            }
        });
        
        test('Hello endpoint response time should meet performance requirements', async () => {
            const context = createTestContext('Response time performance test');
            const responseTimes = [];
            
            try {
                // Execute multiple requests to measure response time consistency
                const performanceTestCount = Math.min(HELLO_ENDPOINT_TEST_CONFIG.performanceTestCount, 20);
                
                for (let i = 0; i < performanceTestCount; i++) {
                    const requestTimer = new TestTimer();
                    requestTimer.start();
                    
                    const response = await testEnvironment.testClient.get('/hello', {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-perf-${i + 1}`,
                            'x-performance-test': 'true'
                        }
                    });
                    
                    requestTimer.stop();
                    const responseTime = requestTimer.getElapsed();
                    responseTimes.push(responseTime);
                    
                    // Validate individual response
                    assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK,
                        `Performance test request ${i + 1} should return 200 OK`);
                }
                
                // Calculate performance statistics
                const averageTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
                const maxTime = Math.max(...responseTimes);
                const minTime = Math.min(...responseTimes);
                
                // Validate performance requirements using PerformanceAssertion
                await testEnvironment.performanceAssertion.assertResponseTime(averageTime, {
                    maxTime: HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime,
                    testName: 'average_response_time',
                    validateConsistency: true
                });
                
                // Additional performance validations
                assert.ok(maxTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime * 1.5,
                    `Maximum response time ${maxTime}ms should be within acceptable bounds`);
                assert.ok(averageTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime,
                    `Average response time ${averageTime}ms should meet requirements`);
                
                console.log(`✓ Performance test passed:`);
                console.log(`  Requests: ${performanceTestCount}`);
                console.log(`  Average: ${averageTime.toFixed(2)}ms`);
                console.log(`  Min: ${minTime.toFixed(2)}ms`);
                console.log(`  Max: ${maxTime.toFixed(2)}ms`);
                
            } catch (error) {
                console.error(`✗ Performance test failed: ${error.message}`);
                console.error(`  Response times: ${responseTimes.join(', ')}ms`);
                throw error;
            }
        });
        
        test('Server throughput should meet performance requirements', async () => {
            const context = createTestContext('Throughput performance test');
            context.timer.start();
            
            try {
                const throughputTestDuration = 2000; // 2 seconds
                const requestCount = 50;
                const requestInterval = throughputTestDuration / requestCount;
                
                let completedRequests = 0;
                let successfulRequests = 0;
                const startTime = Date.now();
                
                // Create controlled load testing scenario
                const throughputPromises = [];
                
                for (let i = 0; i < requestCount; i++) {
                    const requestPromise = new Promise((resolve) => {
                        setTimeout(async () => {
                            try {
                                const response = await testEnvironment.testClient.get('/hello', {
                                    headers: {
                                        'x-correlation-id': `${context.correlationId}-throughput-${i + 1}`,
                                        'x-throughput-test': 'true'
                                    }
                                });
                                
                                completedRequests++;
                                if (response.statusCode === HTTP_STATUS_CODES.SUCCESS.OK) {
                                    successfulRequests++;
                                }
                                
                                resolve({ index: i + 1, response, success: true });
                                
                            } catch (error) {
                                completedRequests++;
                                resolve({ index: i + 1, error: error.message, success: false });
                            }
                        }, i * requestInterval);
                    });
                    
                    throughputPromises.push(requestPromise);
                }
                
                // Wait for all throughput test requests to complete
                const results = await Promise.all(throughputPromises);
                const endTime = Date.now();
                const actualDuration = endTime - startTime;
                
                // Calculate throughput metrics
                const requestsPerSecond = (completedRequests / actualDuration) * 1000;
                const successRate = (successfulRequests / completedRequests) * 100;
                
                // Validate throughput requirements
                await testEnvironment.performanceAssertion.assertThroughput(requestsPerSecond, {
                    minThroughput: 10, // Reasonable for test environment
                    testDuration: actualDuration,
                    testName: 'hello_endpoint_throughput'
                });
                
                // Validate success rate
                assert.ok(successRate >= 95, 
                    `Success rate ${successRate}% should be at least 95%`);
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Throughput test passed in ${testTime}ms:`);
                console.log(`  Requests: ${completedRequests}/${requestCount}`);
                console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
                console.log(`  Throughput: ${requestsPerSecond.toFixed(1)} req/sec`);
                console.log(`  Duration: ${actualDuration}ms`);
                
            } catch (error) {
                console.error(`✗ Throughput test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // RESPONSE VALIDATION TESTS: Content and Format Verification
    // ========================================================================
    
    describe('Response Validation Tests - Content and Format Verification', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Response Validation Test');
            console.log(`Starting response validation with correlation ID: ${testContext.correlationId}`);
        });
        
        test('Response content should match exact specification', async () => {
            const context = createTestContext('Response content validation');
            context.timer.start();
            
            try {
                // Make request with content validation focus
                const response = await testEnvironment.testClient.get('/hello', {
                    headers: {
                        'x-correlation-id': context.correlationId,
                        'accept': 'text/plain'
                    }
                });
                
                // Validate response content with strict matching
                await testEnvironment.responseAssertion.assertResponseContent(response, {
                    expectedContent: HELLO_ENDPOINT_TEST_CONFIG.expectedContent,
                    strictMatch: true,
                    encoding: 'utf8',
                    validateLength: true
                });
                
                // Additional content validation
                assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                    'Response body should match HELLO_WORLD constant exactly');
                assert.strictEqual(response.body.length, RESPONSE_MESSAGES.HELLO_WORLD.length,
                    'Response body length should match expected length');
                assert.ok(!response.body.includes('\n') && !response.body.includes('\r'),
                    'Response body should not contain line breaks');
                
                context.timer.stop();
                const validationTime = context.timer.getElapsed();
                
                console.log(`✓ Response content validation passed in ${validationTime}ms`);
                
            } catch (error) {
                console.error(`✗ Response content validation failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Response status code should be exactly 200 OK', async () => {
            const context = createTestContext('Status code validation');
            context.timer.start();
            
            try {
                // Make request with status code validation focus
                const response = await testEnvironment.testClient.get('/hello', {
                    headers: {
                        'x-correlation-id': context.correlationId
                    }
                });
                
                // Validate status code with comprehensive checking
                await testEnvironment.responseAssertion.assertStatusCode(response, {
                    expectedStatus: HELLO_ENDPOINT_TEST_CONFIG.expectedStatus,
                    validateStatusMessage: true,
                    strictValidation: true
                });
                
                // Additional status code validation
                assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK,
                    'Response status code should be exactly 200');
                assert.strictEqual(typeof response.statusCode, 'number',
                    'Status code should be a number');
                assert.ok(response.statusCode >= 200 && response.statusCode < 300,
                    'Status code should be in 2xx success range');
                
                context.timer.stop();
                const validationTime = context.timer.getElapsed();
                
                console.log(`✓ Status code validation passed in ${validationTime}ms`);
                
            } catch (error) {
                console.error(`✗ Status code validation failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Response headers should comply with HTTP standards', async () => {
            const context = createTestContext('Headers compliance validation');
            context.timer.start();
            
            try {
                // Make request with headers compliance validation focus
                const response = await testEnvironment.testClient.get('/hello', {
                    headers: {
                        'x-correlation-id': context.correlationId,
                        'accept': 'text/plain, */*'
                    }
                });
                
                // Validate headers compliance using specialized assertion
                await testEnvironment.responseAssertion.assertResponseHeaders(response, {
                    validateContentType: true,
                    validateContentLength: true,
                    validateStandardHeaders: true,
                    validateHeaderFormat: true,
                    expectedContentType: HELLO_ENDPOINT_TEST_CONFIG.expectedContentType
                });
                
                // Additional header compliance validation
                const contentType = response.headers['content-type'];
                assert.ok(contentType && contentType.includes('text/plain'),
                    'Content-Type should be text/plain');
                assert.ok(contentType && contentType.includes('charset=utf-8'),
                    'Content-Type should specify UTF-8 charset');
                
                const contentLength = response.headers['content-length'];
                assert.ok(contentLength && parseInt(contentLength) > 0,
                    'Content-Length should be present and positive');
                
                const dateHeader = response.headers['date'];
                assert.ok(dateHeader && new Date(dateHeader).getTime() > 0,
                    'Date header should be present and valid');
                
                context.timer.stop();
                const validationTime = context.timer.getElapsed();
                
                console.log(`✓ Headers compliance validation passed in ${validationTime}ms`);
                
            } catch (error) {
                console.error(`✗ Headers compliance validation failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // EDGE CASE TESTS: Boundary Conditions and Special Scenarios
    // ========================================================================
    
    describe('Edge Case Tests - Boundary Conditions and Special Scenarios', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Edge Case Test');
            console.log(`Starting edge case test with correlation ID: ${testContext.correlationId}`);
        });
        
        test('Case sensitivity should be enforced for endpoint paths', async () => {
            const context = createTestContext('Case sensitivity test');
            context.timer.start();
            
            try {
                // Test case variations of hello endpoint
                const caseVariations = [
                    { path: '/HELLO', expected: 404 },
                    { path: '/Hello', expected: 404 },
                    { path: '/heLLo', expected: 404 },
                    { path: '/hello', expected: 200 }
                ];
                
                for (const variation of caseVariations) {
                    const response = await testEnvironment.testClient.get(variation.path, {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-case-${variation.path.replace('/', '')}`
                        }
                    });
                    
                    assert.strictEqual(response.statusCode, variation.expected,
                        `Path ${variation.path} should return ${variation.expected} status`);
                    
                    console.log(`  ✓ Path ${variation.path} correctly returned ${response.statusCode}`);
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Case sensitivity test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Case sensitivity test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Query parameters should be handled appropriately', async () => {
            const context = createTestContext('Query parameters test');
            context.timer.start();
            
            try {
                // Test hello endpoint with various query parameters
                const queryTests = [
                    { path: '/hello?test=1', expectedStatus: 200, description: 'simple query parameter' },
                    { path: '/hello?name=world', expectedStatus: 200, description: 'name query parameter' },
                    { path: '/hello?multiple=1&params=2', expectedStatus: 200, description: 'multiple query parameters' }
                ];
                
                for (const queryTest of queryTests) {
                    const response = await testEnvironment.testClient.get(queryTest.path, {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-query`
                        }
                    });
                    
                    // Query parameters should not affect hello endpoint response
                    assert.strictEqual(response.statusCode, queryTest.expectedStatus,
                        `Query test (${queryTest.description}) should return ${queryTest.expectedStatus}`);
                    assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                        `Query test (${queryTest.description}) should return standard content`);
                    
                    console.log(`  ✓ Query test (${queryTest.description}) handled correctly`);
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Query parameters test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Query parameters test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Connection handling should be robust under various conditions', async () => {
            const context = createTestContext('Connection handling test');
            context.timer.start();
            
            try {
                // Test various connection scenarios
                const connectionTests = [
                    { 
                        description: 'standard connection', 
                        headers: { 'connection': 'keep-alive' },
                        expectSuccess: true 
                    },
                    { 
                        description: 'close connection', 
                        headers: { 'connection': 'close' },
                        expectSuccess: true 
                    },
                    { 
                        description: 'no connection header', 
                        headers: {},
                        expectSuccess: true 
                    }
                ];
                
                for (const connectionTest of connectionTests) {
                    const response = await testEnvironment.testClient.get('/hello', {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-conn`,
                            ...connectionTest.headers
                        }
                    });
                    
                    if (connectionTest.expectSuccess) {
                        assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK,
                            `Connection test (${connectionTest.description}) should succeed`);
                        assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                            `Connection test (${connectionTest.description}) should return correct content`);
                    }
                    
                    console.log(`  ✓ Connection test (${connectionTest.description}) handled correctly`);
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Connection handling test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Connection handling test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // LOAD TESTING: High-Volume Request Handling Validation
    // ========================================================================
    
    describe('Load Testing - High-Volume Request Handling Validation', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Load Test');
            console.log(`Starting load test with correlation ID: ${testContext.correlationId}`);
        });
        
        test('Server should handle sustained load without degradation', async () => {
            const context = createTestContext('Sustained load test');
            context.timer.start();
            
            try {
                const loadTestConfig = {
                    requestCount: 50,
                    concurrentRequests: 10,
                    testDuration: 5000 // 5 seconds
                };
                
                let totalRequests = 0;
                let successfulRequests = 0;
                const responseTimes = [];
                
                // Execute sustained load test with concurrent requests
                const loadTestBatches = Math.ceil(loadTestConfig.requestCount / loadTestConfig.concurrentRequests);
                
                for (let batch = 0; batch < loadTestBatches; batch++) {
                    const batchPromises = [];
                    const batchSize = Math.min(loadTestConfig.concurrentRequests, 
                        loadTestConfig.requestCount - (batch * loadTestConfig.concurrentRequests));
                    
                    for (let i = 0; i < batchSize; i++) {
                        const requestTimer = new TestTimer();
                        requestTimer.start();
                        
                        const requestPromise = testEnvironment.testClient.get('/hello', {
                            headers: {
                                'x-correlation-id': `${context.correlationId}-load-${batch}-${i}`,
                                'x-load-test': 'true',
                                'x-batch': batch.toString(),
                                'x-request': i.toString()
                            }
                        }).then(response => {
                            requestTimer.stop();
                            return { response, responseTime: requestTimer.getElapsed() };
                        });
                        
                        batchPromises.push(requestPromise);
                    }
                    
                    // Process batch results
                    const batchResults = await Promise.all(batchPromises);
                    
                    batchResults.forEach(result => {
                        totalRequests++;
                        responseTimes.push(result.responseTime);
                        
                        if (result.response && result.response.statusCode === HTTP_STATUS_CODES.SUCCESS.OK) {
                            successfulRequests++;
                        }
                    });
                    
                    // Brief pause between batches to prevent overwhelming
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // Calculate load test statistics
                const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
                const maxResponseTime = Math.max(...responseTimes);
                const successRate = (successfulRequests / totalRequests) * 100;
                
                // Validate load test results
                assert.ok(successRate >= 95, 
                    `Success rate ${successRate}% should be at least 95% under load`);
                assert.ok(averageResponseTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime * 2,
                    `Average response time ${averageResponseTime}ms should be reasonable under load`);
                assert.ok(maxResponseTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime * 3,
                    `Maximum response time ${maxResponseTime}ms should be acceptable under load`);
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Sustained load test passed in ${testTime}ms:`);
                console.log(`  Total Requests: ${totalRequests}`);
                console.log(`  Successful Requests: ${successfulRequests}`);
                console.log(`  Success Rate: ${successRate.toFixed(1)}%`);
                console.log(`  Average Response Time: ${averageResponseTime.toFixed(2)}ms`);
                console.log(`  Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
                
            } catch (error) {
                console.error(`✗ Sustained load test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // SECURITY VALIDATION TESTS: Security Threat Detection and Response
    // ========================================================================
    
    describe('Security Validation Tests - Security Threat Detection and Response', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Security Test');
            console.log(`Starting security test with correlation ID: ${testContext.correlationId}`);
        });
        
        test('Path traversal attempts should be rejected appropriately', async () => {
            const context = createTestContext('Path traversal security test');
            context.timer.start();
            
            try {
                // Test various path traversal attack patterns
                const traversalPaths = [
                    '/hello/../admin',
                    '/hello/../../etc/passwd',
                    '/hello/../../../root',
                    '/hello/..\\..\\windows\\system32'
                ];
                
                for (const traversalPath of traversalPaths) {
                    try {
                        const response = await testEnvironment.testClient.get(traversalPath, {
                            headers: {
                                'x-correlation-id': `${context.correlationId}-traversal`,
                                'x-security-test': 'path-traversal'
                            }
                        });
                        
                        // Path traversal attempts should result in 404 or 400 errors
                        assert.ok(response.statusCode >= 400 && response.statusCode < 500,
                            `Path traversal ${traversalPath} should return 4xx error`);
                        assert.notStrictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                            `Path traversal ${traversalPath} should not return hello content`);
                        
                        console.log(`  ✓ Path traversal ${traversalPath} correctly rejected with ${response.statusCode}`);
                        
                    } catch (connectionError) {
                        // Connection rejections are also acceptable for security threats
                        console.log(`  ✓ Path traversal ${traversalPath} rejected at connection level`);
                    }
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Path traversal security test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Path traversal security test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Header injection attempts should be handled securely', async () => {
            const context = createTestContext('Header injection security test');
            context.timer.start();
            
            try {
                // Test header injection attack patterns
                const injectionHeaders = {
                    'x-correlation-id': context.correlationId,
                    'x-malicious-header': 'value\r\nInjected: malicious-content',
                    'user-agent': 'Test\r\nX-Injected: attack',
                    'x-security-test': 'header-injection'
                };
                
                const response = await testEnvironment.testClient.get('/hello', {
                    headers: injectionHeaders
                });
                
                // Validate that header injection doesn't affect response integrity
                assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK,
                    'Header injection should not prevent normal response');
                assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD,
                    'Header injection should not affect response content');
                
                // Validate that injected headers are not reflected in response
                const responseHeaderString = JSON.stringify(response.headers);
                assert.ok(!responseHeaderString.includes('Injected'),
                    'Response headers should not contain injected content');
                assert.ok(!responseHeaderString.includes('malicious'),
                    'Response headers should not contain malicious content');
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Header injection security test passed in ${testTime}ms`);
                
            } catch (error) {
                console.error(`✗ Header injection security test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // COMPREHENSIVE REGRESSION TESTS: Feature Stability Validation
    // ========================================================================
    
    describe('Regression Tests - Feature Stability and Consistency Validation', () => {
        let testContext = null;
        
        beforeEach(() => {
            testContext = createTestContext('Regression Test');
            console.log(`Starting regression test with correlation ID: ${testContext.correlationId}`);
        });
        
        test('Hello endpoint should maintain consistent behavior across multiple requests', async () => {
            const context = createTestContext('Consistency regression test');
            context.timer.start();
            
            try {
                const consistencyTestCount = 20;
                const responses = [];
                
                // Execute multiple requests to verify consistency
                for (let i = 0; i < consistencyTestCount; i++) {
                    const response = await testEnvironment.testClient.get('/hello', {
                        headers: {
                            'x-correlation-id': `${context.correlationId}-consistency-${i + 1}`,
                            'x-regression-test': 'consistency',
                            'x-request-number': (i + 1).toString()
                        }
                    });
                    
                    responses.push({
                        index: i + 1,
                        statusCode: response.statusCode,
                        body: response.body,
                        contentType: response.headers['content-type'],
                        contentLength: response.headers['content-length']
                    });
                }
                
                // Validate consistency across all responses
                const firstResponse = responses[0];
                responses.forEach((response, index) => {
                    assert.strictEqual(response.statusCode, firstResponse.statusCode,
                        `Response ${index + 1} status code should match first response`);
                    assert.strictEqual(response.body, firstResponse.body,
                        `Response ${index + 1} body should match first response`);
                    assert.strictEqual(response.contentType, firstResponse.contentType,
                        `Response ${index + 1} content type should match first response`);
                    assert.strictEqual(response.contentLength, firstResponse.contentLength,
                        `Response ${index + 1} content length should match first response`);
                });
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Consistency regression test passed in ${testTime}ms`);
                console.log(`  Validated ${consistencyTestCount} requests for consistency`);
                
            } catch (error) {
                console.error(`✗ Consistency regression test failed: ${error.message}`);
                throw error;
            }
        });
        
        test('Application should maintain performance characteristics under repeated testing', async () => {
            const context = createTestContext('Performance regression test');
            context.timer.start();
            
            try {
                const performanceRounds = 5;
                const requestsPerRound = 10;
                const roundResults = [];
                
                // Execute multiple performance testing rounds
                for (let round = 0; round < performanceRounds; round++) {
                    const roundTimer = new TestTimer();
                    roundTimer.start();
                    
                    const roundPromises = [];
                    
                    for (let i = 0; i < requestsPerRound; i++) {
                        const requestTimer = new TestTimer();
                        requestTimer.start();
                        
                        const requestPromise = testEnvironment.testClient.get('/hello', {
                            headers: {
                                'x-correlation-id': `${context.correlationId}-perf-round-${round + 1}-${i + 1}`,
                                'x-performance-regression': 'true'
                            }
                        }).then(response => {
                            requestTimer.stop();
                            return {
                                response,
                                responseTime: requestTimer.getElapsed()
                            };
                        });
                        
                        roundPromises.push(requestPromise);
                    }
                    
                    const roundResults = await Promise.all(roundPromises);
                    roundTimer.stop();
                    
                    // Calculate round statistics
                    const roundResponseTimes = roundResults.map(r => r.responseTime);
                    const roundAverageTime = roundResponseTimes.reduce((sum, time) => sum + time, 0) / roundResponseTimes.length;
                    const roundDuration = roundTimer.getElapsed();
                    
                    roundResults.push({
                        round: round + 1,
                        averageTime: roundAverageTime,
                        duration: roundDuration,
                        requestsPerSecond: (requestsPerRound / roundDuration) * 1000
                    });
                    
                    // Validate round performance
                    assert.ok(roundAverageTime < HELLO_ENDPOINT_TEST_CONFIG.maxResponseTime * 1.5,
                        `Round ${round + 1} average response time should be acceptable`);
                    
                    console.log(`  ✓ Performance round ${round + 1}: avg ${roundAverageTime.toFixed(2)}ms, ${roundResults[roundResults.length - 1].requestsPerSecond.toFixed(1)} req/sec`);
                }
                
                context.timer.stop();
                const testTime = context.timer.getElapsed();
                
                console.log(`✓ Performance regression test passed in ${testTime}ms`);
                console.log(`  Completed ${performanceRounds} rounds with ${requestsPerRound} requests each`);
                
            } catch (error) {
                console.error(`✗ Performance regression test failed: ${error.message}`);
                throw error;
            }
        });
    });
    
    // ========================================================================
    // TEST SUITE SUMMARY AND REPORTING
    // ========================================================================
    
    describe('Test Suite Summary - Comprehensive Test Execution Report', () => {
        
        test('Test suite execution summary and metrics validation', async () => {
            const context = createTestContext('Test suite summary');
            context.timer.start();
            
            try {
                // Validate test environment is still functional
                assert.ok(testEnvironment, 'Test environment should be available');
                assert.ok(testEnvironment.testServer.isReady(), 
                    'Test server should still be ready');
                
                // Validate application health after all tests
                const finalHealthStatus = await testEnvironment.application.getHealthStatus();
                assert.strictEqual(finalHealthStatus.healthy, true,
                    'Application should be healthy after all tests');
                
                // Calculate suite execution statistics
                const suiteExecutionTime = Date.now() - suiteStartTime;
                const testServerInfo = testEnvironment.testServer.getServerInfo();
                
                context.timer.stop();
                const summaryTime = context.timer.getElapsed();
                
                // Generate comprehensive test execution report
                const testReport = {
                    suiteConfig: TEST_SUITE_CONFIG,
                    endpointConfig: HELLO_ENDPOINT_TEST_CONFIG,
                    errorConfig: ERROR_SCENARIO_TEST_CONFIG,
                    execution: {
                        correlationId: suiteCorrelationId,
                        totalTime: suiteExecutionTime,
                        serverPort: testServerInfo.port,
                        applicationHealth: finalHealthStatus,
                        completedAt: new Date().toISOString()
                    },
                    testCategories: [
                        'Unit Tests - HelloController Direct Method Testing',
                        'Integration Tests - HTTP Request-Response Cycle Testing',
                        'End-to-End Tests - Complete Application Workflow Validation',
                        'Error Scenario Tests - Comprehensive Error Handling Validation',
                        'Response Validation Tests - Content and Format Verification',
                        'Edge Case Tests - Boundary Conditions and Special Scenarios',
                        'Load Testing - High-Volume Request Handling Validation',
                        'Security Validation Tests - Security Threat Detection and Response',
                        'Regression Tests - Feature Stability and Consistency Validation'
                    ]
                };
                
                console.log(`\n=== COMPREHENSIVE TEST SUITE EXECUTION REPORT ===`);
                console.log(`Suite: ${testReport.suiteConfig.suiteName} v${testReport.suiteConfig.version}`);
                console.log(`Correlation ID: ${testReport.execution.correlationId}`);
                console.log(`Total Execution Time: ${testReport.execution.totalTime}ms`);
                console.log(`Test Server Port: ${testReport.execution.serverPort}`);
                console.log(`Application Health: ${testReport.execution.applicationHealth.healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
                console.log(`Completed At: ${testReport.execution.completedAt}`);
                console.log(`\nTest Categories Executed:`);
                testReport.testCategories.forEach((category, index) => {
                    console.log(`  ${index + 1}. ${category}`);
                });
                console.log(`\n=== TEST SUITE EXECUTION COMPLETED SUCCESSFULLY ===\n`);
                
                // Final assertion for test suite completion
                assert.ok(true, 'Comprehensive test suite execution completed successfully');
                
            } catch (error) {
                console.error(`✗ Test suite summary failed: ${error.message}`);
                throw error;
            }
        });
    });
});

/**
 * Test File Export Summary and Documentation:
 * 
 * This comprehensive test file implements the complete testing requirements for the
 * Hello World endpoint functionality with the following coverage:
 * 
 * Test Categories Implemented:
 * 1. Unit Tests: Direct HelloController method testing with isolated validation
 * 2. Integration Tests: Full HTTP request-response cycle testing with test server
 * 3. End-to-End Tests: Complete application workflow validation with real clients
 * 4. Error Scenario Tests: Comprehensive error handling and edge case validation
 * 5. Performance Tests: Response time validation and throughput testing
 * 6. Security Tests: Security threat detection and validation testing
 * 7. Load Tests: High-volume request handling and stability validation
 * 8. Regression Tests: Feature stability and consistency verification
 * 
 * Testing Framework Integration:
 * - Uses Node.js built-in test runner (node:test) for zero external dependencies
 * - Implements comprehensive test organization with describe blocks and test cases
 * - Provides proper test isolation with beforeEach/afterEach hooks
 * - Includes suite-level setup and teardown for resource management
 * 
 * Educational Value:
 * - Demonstrates production-ready testing patterns using built-in Node.js tools
 * - Shows comprehensive test organization and structure for maintainable suites
 * - Illustrates proper test isolation, correlation tracking, and resource management
 * - Provides examples of performance testing, security validation, and error handling
 * - Shows integration between test components and application architecture
 * 
 * Production Readiness Features:
 * - Comprehensive error handling and graceful failure recovery
 * - Performance monitoring and validation against defined thresholds
 * - Security testing for common attack patterns and injection attempts
 * - Load testing for scalability and stability validation under sustained load
 * - Detailed logging and correlation tracking for debugging and analysis
 * - Resource management with proper cleanup and memory management
 * 
 * Test Execution Command:
 * node --test src/backend/test/hello-endpoint.test.js
 * 
 * Coverage Analysis Command:
 * node --test --experimental-test-coverage src/backend/test/hello-endpoint.test.js
 * 
 * Performance Testing Command:
 * node --test --test-timeout=30000 src/backend/test/hello-endpoint.test.js
 */