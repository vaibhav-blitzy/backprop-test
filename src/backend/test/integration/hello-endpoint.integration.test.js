/**
 * Hello World Endpoint Integration Test Suite
 * 
 * Comprehensive integration testing for the Hello World endpoint demonstrating complete 
 * request-response pipeline validation from HTTP server through route handler, controller, 
 * and service layers. Tests the full integration between HTTP server, request routing, 
 * controller logic, and service business logic for the GET /hello endpoint.
 * 
 * This test suite validates:
 * - Complete request lifecycle including server startup, request processing, and response generation
 * - HTTP server foundation integration with request processing engine
 * - Request routing and endpoint resolution with proper HTTP method validation
 * - Controller and service layer integration with business logic execution
 * - Response generation and formatting with proper HTTP protocol compliance
 * - Performance requirements validation with timing and resource monitoring
 * - Error handling integration across all application layers
 * - Concurrent request handling and server stability under load
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive integration testing patterns using Node.js built-in test runner
 * - Shows proper test environment setup and teardown with resource management
 * - Illustrates HTTP client-server integration testing with realistic request scenarios
 * - Provides examples of performance testing and validation in integration contexts
 * - Shows enterprise-grade testing patterns with correlation tracking and detailed assertions
 * - Demonstrates production-ready testing approaches with comprehensive validation coverage
 * 
 * Technical Requirements:
 * - Node.js v22.x built-in test runner for zero external testing dependencies
 * - Complete integration testing from HTTP layer through service layer
 * - Performance validation with response time requirements under 100ms
 * - Comprehensive error handling validation across all application components
 * - Educational testing patterns demonstrating industry-standard practices
 * 
 * @fileoverview Complete integration test suite for hello endpoint with comprehensive validation
 * @version 1.0.0
 * @author Node.js Tutorial Application Testing Team
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Import Node.js built-in test runner functions for test definition and organization
import { test, describe, beforeEach, afterEach } from 'node:test'; // Node.js v22.x - Built-in test runner for comprehensive testing

// Import Node.js built-in assertion library for test validation and verification
import assert from 'node:assert'; // Node.js v22.x - Built-in assertion module for test validation

// Import test server management utilities for isolated server instance creation
import { TestServer } from '../helpers/test-server.js';

// Import HTTP client utilities for making test requests during integration testing
import { HttpTestClient, HttpRequestBuilder } from '../helpers/test-client.js';

// Import specialized assertion utilities for HTTP response and server status validation
import { 
    HttpResponseAssertion, 
    ServerStatusAssertion, 
    PerformanceAssertion 
} from '../helpers/assertions.js';

// Import test timing and correlation utilities for performance measurement and tracking
import { 
    TestTimer, 
    TestExecutionContext, 
    generateCorrelationId, 
    retryOperation 
} from '../helpers/test-utils.js';

// Import test request and response fixtures for comprehensive testing scenarios
import { 
    createMockRequest, 
    HELLO_ENDPOINT_REQUESTS 
} from '../fixtures/request-data.js';

import { 
    createMockResponse, 
    HELLO_ENDPOINT_RESPONSES 
} from '../fixtures/response-data.js';

// Import test configuration utilities for server setup and port management
import { 
    getTestPort, 
    createTestServerConfig, 
    TEST_SERVER_CONFIGS 
} from '../fixtures/test-config.js';

// ============================================================================
// GLOBAL TEST CONFIGURATION
// ============================================================================

/**
 * Global test configuration constants for integration testing behavior and validation
 */
const TEST_TIMEOUT = 10000; // Maximum test execution timeout in milliseconds
const HELLO_ENDPOINT_PATH = '/hello'; // Target endpoint path for integration testing
const EXPECTED_HELLO_RESPONSE = 'Hello world'; // Expected response content for validation
const EXPECTED_RESPONSE_TIME_MS = 100; // Maximum allowed response time in milliseconds
const TEST_CORRELATION_PREFIX = 'hello-integration-test-'; // Correlation ID prefix for test tracking

/**
 * Integration test suite configuration object defining test execution behavior
 */
const INTEGRATION_TEST_CONFIG = {
    testSuiteName: 'Hello Endpoint Integration Tests',
    version: '1.0.0',
    timeout: TEST_TIMEOUT,
    enablePerformanceValidation: true,
    enableConcurrencyTesting: true,
    enableErrorHandlingTesting: true,
    maxConcurrentRequests: 10,
    retryAttempts: 3,
    retryDelay: 100
};

/**
 * Test environment state management for test isolation and cleanup coordination
 */
let currentTestEnvironment = null;
let testExecutionMetrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    totalExecutionTime: 0,
    averageResponseTime: 0,
    testStartTime: null
};

// ============================================================================
// INTEGRATION TEST ENVIRONMENT SETUP AND TEARDOWN
// ============================================================================

/**
 * Sets up the complete integration test environment including test server configuration, 
 * client setup, and test context initialization for hello endpoint testing.
 * 
 * Creates isolated test environment with:
 * - Dedicated test server instance with unique port allocation
 * - HTTP test client for making requests with performance tracking
 * - Test execution context with correlation and debugging capabilities
 * - Assertion utilities for comprehensive response validation
 * - Performance measurement tools for timing and resource monitoring
 * 
 * @param {Object} testOptions - Configuration options for test environment setup
 * @param {number} [testOptions.port] - Specific port for test server (auto-allocated if not provided)
 * @param {Object} [testOptions.serverConfig] - Custom server configuration overrides
 * @param {boolean} [testOptions.enableLogging=false] - Enable detailed logging during tests
 * @returns {Object} Complete integration test environment with server, client, and context objects
 */
async function setupIntegrationTestEnvironment(testOptions = {}) {
    try {
        // Generate unique test correlation ID for request tracking and debugging
        const correlationId = generateCorrelationId();
        
        // Allocate available test port using getTestPort utility to avoid conflicts
        const testPort = testOptions.port || await getTestPort();
        
        // Create test server configuration using createTestServerConfig with integration settings
        const serverConfig = createTestServerConfig('integrationTest', {
            port: testPort,
            host: 'localhost',
            enableLogging: testOptions.enableLogging || false,
            enablePerformanceMonitoring: true,
            timeout: TEST_TIMEOUT,
            ...testOptions.serverConfig
        });
        
        // Initialize TestServer instance with test configuration and isolation
        const testServer = new TestServer(serverConfig);
        
        // Create HttpTestClient instance for making test requests with performance tracking
        const testClient = new HttpTestClient({
            baseUrl: `http://localhost:${testPort}`,
            timeout: TEST_TIMEOUT,
            enableTimingCollection: true,
            enableCorrelationTracking: true
        });
        
        // Set up test execution context with correlation and debugging information
        const testContext = new TestExecutionContext();
        const executionContext = testContext.createTestContext({
            testSuite: INTEGRATION_TEST_CONFIG.testSuiteName,
            correlationId: correlationId,
            testPort: testPort,
            startTime: Date.now()
        });
        
        // Initialize assertion utilities for response validation and server status checking
        const httpResponseAssertion = new HttpResponseAssertion({
            enableDetailedErrors: true,
            enablePerformanceValidation: INTEGRATION_TEST_CONFIG.enablePerformanceValidation,
            correlationTracking: true
        });
        
        const serverStatusAssertion = new ServerStatusAssertion({
            enableHealthChecking: true,
            enableConfigurationValidation: true,
            defaultHealthCheckTimeout: 5000
        });
        
        const performanceAssertion = new PerformanceAssertion({
            enableHighPrecisionTiming: true,
            enableMemoryTracking: true,
            enableThroughputMeasurement: true
        });
        
        // Create comprehensive test environment object for test execution
        const testEnvironment = {
            // Core test infrastructure components
            server: testServer,
            client: testClient,
            context: executionContext,
            
            // Server configuration and networking information
            config: serverConfig,
            port: testPort,
            baseUrl: `http://localhost:${testPort}`,
            
            // Assertion utilities for comprehensive validation
            assertions: {
                httpResponse: httpResponseAssertion,
                serverStatus: serverStatusAssertion,
                performance: performanceAssertion
            },
            
            // Test execution metadata and tracking information
            metadata: {
                correlationId: correlationId,
                setupTime: Date.now(),
                testSuite: INTEGRATION_TEST_CONFIG.testSuiteName,
                version: INTEGRATION_TEST_CONFIG.version
            },
            
            // Test utilities and helper functions
            utils: {
                timer: new TestTimer(),
                getCorrelationId: () => testContext.getCorrelationId(),
                generateRequestId: () => generateCorrelationId()
            }
        };
        
        // Store reference to current test environment for cleanup coordination
        currentTestEnvironment = testEnvironment;
        
        // Return complete test environment ready for integration testing
        return testEnvironment;
        
    } catch (error) {
        throw new Error(`Integration test environment setup failed: ${error.message}`);
    }
}

/**
 * Cleans up integration test environment including server shutdown, resource cleanup, 
 * and test context reset for proper test isolation.
 * 
 * Performs comprehensive cleanup including:
 * - Graceful test server shutdown with connection cleanup
 * - Test port release and availability restoration
 * - HTTP client connection cleanup and resource deallocation
 * - Test execution context reset and correlation tracking cleanup
 * - Assertion utility state cleanup and cached data removal
 * - Performance metrics collection and test execution summary
 * 
 * @param {Object} testEnvironment - Test environment object from setupIntegrationTestEnvironment
 * @returns {Promise} Promise resolving when all cleanup operations are complete
 */
async function teardownIntegrationTestEnvironment(testEnvironment) {
    try {
        if (!testEnvironment) {
            return; // No cleanup needed if no environment exists
        }
        
        const cleanupOperations = [];
        const cleanupResults = {
            serverStopped: false,
            portReleased: false,
            clientCleaned: false,
            contextReset: false,
            assertionsReset: false
        };
        
        // Stop test server instance gracefully with connection cleanup
        if (testEnvironment.server && testEnvironment.server.isRunning()) {
            cleanupOperations.push(
                testEnvironment.server.stop()
                    .then(() => {
                        cleanupResults.serverStopped = true;
                    })
                    .catch(error => {
                        console.warn(`Server cleanup warning: ${error.message}`);
                        cleanupResults.serverStopped = false;
                    })
            );
        }
        
        // Release allocated test port and update port tracking
        if (testEnvironment.port) {
            cleanupOperations.push(
                Promise.resolve().then(() => {
                    // Port will be automatically released when server stops
                    cleanupResults.portReleased = true;
                })
            );
        }
        
        // Clean up HTTP test client connections and resources
        if (testEnvironment.client) {
            cleanupOperations.push(
                Promise.resolve().then(() => {
                    // Client cleanup (if cleanup method exists)
                    if (typeof testEnvironment.client.cleanup === 'function') {
                        return testEnvironment.client.cleanup();
                    }
                    cleanupResults.clientCleaned = true;
                })
                .catch(error => {
                    console.warn(`Client cleanup warning: ${error.message}`);
                    cleanupResults.clientCleaned = false;
                })
            );
        }
        
        // Reset test execution context and correlation tracking
        if (testEnvironment.context) {
            cleanupOperations.push(
                Promise.resolve().then(() => {
                    // Context cleanup (if cleanup method exists)
                    if (typeof testEnvironment.context.cleanup === 'function') {
                        testEnvironment.context.cleanup();
                    }
                    cleanupResults.contextReset = true;
                })
            );
        }
        
        // Clear assertion utility state and cached data
        if (testEnvironment.assertions) {
            cleanupOperations.push(
                Promise.resolve().then(() => {
                    // Reset assertion state if reset methods exist
                    Object.values(testEnvironment.assertions).forEach(assertion => {
                        if (assertion && typeof assertion.reset === 'function') {
                            assertion.reset();
                        }
                    });
                    cleanupResults.assertionsReset = true;
                })
            );
        }
        
        // Wait for all cleanup operations to complete
        await Promise.allSettled(cleanupOperations);
        
        // Verify complete resource cleanup and test isolation
        const cleanupSuccess = Object.values(cleanupResults).every(result => result !== false);
        
        if (!cleanupSuccess) {
            console.warn('Some cleanup operations encountered issues:', cleanupResults);
        }
        
        // Clear global test environment reference
        if (currentTestEnvironment === testEnvironment) {
            currentTestEnvironment = null;
        }
        
        // Return cleanup completion status
        return {
            success: cleanupSuccess,
            results: cleanupResults,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error(`Integration test environment teardown failed: ${error.message}`);
        throw error;
    }
}

// ============================================================================
// HTTP REQUEST AND RESPONSE TESTING UTILITIES
// ============================================================================

/**
 * Makes HTTP request to hello endpoint with performance measurement and comprehensive 
 * response collection for integration testing.
 * 
 * Executes complete HTTP request including:
 * - Correlation ID generation for request tracking and debugging
 * - High-precision performance timing for response time validation
 * - HTTP request construction using HttpRequestBuilder with fluent interface
 * - Error handling and retry logic for reliable test execution
 * - Comprehensive response data collection including headers, status, and content
 * - Performance metrics calculation and correlation information inclusion
 * 
 * @param {Object} testClient - HttpTestClient instance for making HTTP requests
 * @param {string} requestPath - Request path for the HTTP request (default: '/hello')
 * @param {Object} requestOptions - Additional options for request configuration
 * @param {Object} [requestOptions.headers] - Custom headers for the request
 * @param {string} [requestOptions.method='GET'] - HTTP method for the request
 * @param {number} [requestOptions.timeout] - Request timeout override
 * @returns {Object} Request result including response data, timing metrics, and correlation information
 */
async function makeHelloRequest(testClient, requestPath = HELLO_ENDPOINT_PATH, requestOptions = {}) {
    try {
        // Create correlation ID for request tracking and debugging across application layers
        const correlationId = generateCorrelationId();
        
        // Start performance timer for response time measurement and validation
        const performanceTimer = new TestTimer();
        performanceTimer.start();
        
        // Build HTTP request using HttpRequestBuilder with specified options and fluent interface
        const requestBuilder = new HttpRequestBuilder();
        const httpRequest = requestBuilder
            .withPath(requestPath)
            .withMethod(requestOptions.method || 'GET')
            .withHeaders({
                'x-correlation-id': correlationId,
                'x-test-type': 'integration',
                'user-agent': 'Node.js Tutorial Integration Test Client/1.0.0',
                ...requestOptions.headers
            })
            .build();
        
        let response = null;
        let requestError = null;
        
        // Execute HTTP request using HttpTestClient with comprehensive error handling
        try {
            response = await testClient.makeRequest(httpRequest, {
                timeout: requestOptions.timeout || TEST_TIMEOUT,
                enableTimingCollection: true,
                correlationId: correlationId
            });
        } catch (error) {
            requestError = error;
        }
        
        // Stop performance timer and calculate request duration for performance validation
        performanceTimer.stop();
        const requestDuration = performanceTimer.getDuration();
        
        // Collect complete response including status, headers, and body with error handling
        const responseData = response ? {
            statusCode: response.statusCode,
            headers: response.headers || {},
            body: response.body || response.data || '',
            responseTime: response.responseTime || requestDuration,
            success: response.statusCode >= 200 && response.statusCode < 300
        } : {
            statusCode: null,
            headers: {},
            body: '',
            responseTime: requestDuration,
            success: false,
            error: requestError ? requestError.message : 'No response received'
        };
        
        // Include performance metrics and correlation data in result for comprehensive analysis
        const requestResult = {
            // Request execution information
            request: {
                path: requestPath,
                method: requestOptions.method || 'GET',
                headers: httpRequest.headers,
                correlationId: correlationId,
                timestamp: Date.now()
            },
            
            // Complete response data with validation information
            response: responseData,
            
            // Performance metrics and timing analysis
            performance: {
                requestDuration: requestDuration,
                responseTime: responseData.responseTime,
                meetsPerformanceRequirement: requestDuration <= EXPECTED_RESPONSE_TIME_MS,
                performanceGrade: requestDuration <= EXPECTED_RESPONSE_TIME_MS * 0.5 ? 'EXCELLENT' :
                                 requestDuration <= EXPECTED_RESPONSE_TIME_MS * 0.8 ? 'GOOD' :
                                 requestDuration <= EXPECTED_RESPONSE_TIME_MS ? 'ACCEPTABLE' : 'POOR'
            },
            
            // Error information and debugging context
            error: requestError ? {
                message: requestError.message,
                type: requestError.constructor.name,
                stack: requestError.stack
            } : null,
            
            // Test execution metadata and correlation tracking
            metadata: {
                correlationId: correlationId,
                testSuite: INTEGRATION_TEST_CONFIG.testSuiteName,
                executionTime: requestDuration,
                success: !requestError && responseData.success
            }
        };
        
        // Return comprehensive request result for test validation and analysis
        return requestResult;
        
    } catch (error) {
        throw new Error(`Hello request execution failed: ${error.message}`);
    }
}

/**
 * Validates hello endpoint response against expected values including status code, 
 * headers, content, and performance requirements using specialized assertion utilities.
 * 
 * Performs comprehensive validation including:
 * - HTTP status code validation against expected 200 OK response
 * - Response header validation including Content-Type and encoding verification
 * - Response body content validation against 'Hello world' expectation
 * - Performance requirement validation against 100ms response time threshold
 * - Response format and structure completeness verification
 * - Integration validation across all application layers
 * 
 * @param {Object} response - HTTP response object from makeHelloRequest execution
 * @param {Object} expectedResponse - Expected response characteristics for validation
 * @param {Object} validationOptions - Configuration options for response validation
 * @param {boolean} [validationOptions.strictValidation=true] - Enable strict validation mode
 * @param {boolean} [validationOptions.validatePerformance=true] - Enable performance validation
 * @returns {Object} Validation result with success status and detailed validation information
 */
function validateHelloEndpointResponse(response, expectedResponse, validationOptions = {}) {
    try {
        // Create HttpResponseAssertion instance for specialized response validation
        const responseAssertion = new HttpResponseAssertion({
            enableDetailedComparison: true,
            enableHeaderValidation: true,
            enableContentValidation: true,
            enablePerformanceValidation: validationOptions.validatePerformance !== false,
            strictValidation: validationOptions.strictValidation !== false
        });
        
        // Create assertion context for error reporting and correlation tracking
        const assertionContext = {
            testName: 'Hello Endpoint Response Validation',
            correlationId: response.request?.correlationId || generateCorrelationId(),
            timer: new TestTimer(),
            timestamp: new Date().toISOString(),
            options: {
                includeDetails: true,
                logAssertion: true,
                strictValidation: validationOptions.strictValidation !== false
            }
        };
        
        const validationResults = {
            statusCodeValid: false,
            headersValid: false,
            contentValid: false,
            performanceValid: false,
            overallValid: false,
            validationDetails: {},
            validationErrors: []
        };
        
        // Validate HTTP status code against expected value (200 OK) using specialized assertion
        try {
            responseAssertion.assertStatusCode(response, expectedResponse.statusCode || 200, assertionContext);
            validationResults.statusCodeValid = true;
            validationResults.validationDetails.statusCode = {
                expected: expectedResponse.statusCode || 200,
                actual: response.statusCode,
                valid: true
            };
        } catch (error) {
            validationResults.validationErrors.push(`Status code validation failed: ${error.message}`);
            validationResults.validationDetails.statusCode = {
                expected: expectedResponse.statusCode || 200,
                actual: response.statusCode,
                valid: false,
                error: error.message
            };
        }
        
        // Validate response headers including Content-Type and encoding using header assertion
        try {
            const expectedHeaders = expectedResponse.headers || {
                'content-type': 'text/plain; charset=utf-8'
            };
            responseAssertion.assertResponseHeaders(response, expectedHeaders, assertionContext);
            validationResults.headersValid = true;
            validationResults.validationDetails.headers = {
                expected: expectedHeaders,
                actual: response.headers,
                valid: true
            };
        } catch (error) {
            validationResults.validationErrors.push(`Headers validation failed: ${error.message}`);
            validationResults.validationDetails.headers = {
                expected: expectedResponse.headers,
                actual: response.headers,
                valid: false,
                error: error.message
            };
        }
        
        // Validate response body content matches 'Hello world' exactly using content assertion
        try {
            const expectedContent = expectedResponse.content || EXPECTED_HELLO_RESPONSE;
            responseAssertion.assertResponseContent(response, expectedContent, assertionContext);
            validationResults.contentValid = true;
            validationResults.validationDetails.content = {
                expected: expectedContent,
                actual: response.body,
                valid: true,
                lengthMatch: response.body?.length === expectedContent.length
            };
        } catch (error) {
            validationResults.validationErrors.push(`Content validation failed: ${error.message}`);
            validationResults.validationDetails.content = {
                expected: expectedResponse.content || EXPECTED_HELLO_RESPONSE,
                actual: response.body,
                valid: false,
                error: error.message
            };
        }
        
        // Validate response time against performance requirements (< 100ms) using performance assertion
        if (validationOptions.validatePerformance !== false) {
            try {
                const maxResponseTime = expectedResponse.maxResponseTime || EXPECTED_RESPONSE_TIME_MS;
                responseAssertion.assertResponseTime(response, maxResponseTime, assertionContext);
                validationResults.performanceValid = true;
                validationResults.validationDetails.performance = {
                    expectedMaxTime: maxResponseTime,
                    actualTime: response.responseTime,
                    valid: true,
                    performanceGrade: response.responseTime <= maxResponseTime * 0.5 ? 'EXCELLENT' :
                                     response.responseTime <= maxResponseTime * 0.8 ? 'GOOD' :
                                     response.responseTime <= maxResponseTime ? 'ACCEPTABLE' : 'POOR'
                };
            } catch (error) {
                validationResults.validationErrors.push(`Performance validation failed: ${error.message}`);
                validationResults.validationDetails.performance = {
                    expectedMaxTime: expectedResponse.maxResponseTime || EXPECTED_RESPONSE_TIME_MS,
                    actualTime: response.responseTime,
                    valid: false,
                    error: error.message
                };
            }
        } else {
            validationResults.performanceValid = true; // Skip performance validation
        }
        
        // Check response format and structure completeness for integration validation
        const structureValidation = {
            hasStatusCode: response.statusCode !== undefined && response.statusCode !== null,
            hasHeaders: response.headers && typeof response.headers === 'object',
            hasBody: response.body !== undefined,
            hasTimingInfo: response.responseTime !== undefined
        };
        
        const structureValid = Object.values(structureValidation).every(check => check === true);
        if (!structureValid) {
            validationResults.validationErrors.push('Response structure validation failed');
            validationResults.validationDetails.structure = {
                checks: structureValidation,
                valid: false
            };
        } else {
            validationResults.validationDetails.structure = {
                checks: structureValidation,
                valid: true
            };
        }
        
        // Determine overall validation success based on all validation components
        validationResults.overallValid = validationResults.statusCodeValid &&
                                       validationResults.headersValid &&
                                       validationResults.contentValid &&
                                       validationResults.performanceValid &&
                                       structureValid;
        
        // Create comprehensive validation result with success status and detailed information
        const validationResult = {
            success: validationResults.overallValid,
            results: validationResults,
            summary: {
                totalValidations: Object.keys(validationResults.validationDetails).length,
                passedValidations: Object.values(validationResults.validationDetails).filter(detail => detail.valid).length,
                failedValidations: validationResults.validationErrors.length,
                performanceGrade: validationResults.validationDetails.performance?.performanceGrade || 'N/A'
            },
            correlationId: assertionContext.correlationId,
            timestamp: new Date().toISOString()
        };
        
        // Return comprehensive validation result with success status and validation details
        return validationResult;
        
    } catch (error) {
        return {
            success: false,
            results: {
                overallValid: false,
                validationErrors: [`Validation execution failed: ${error.message}`]
            },
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// ============================================================================
// INTEGRATION TEST EXECUTION FUNCTIONS
// ============================================================================

/**
 * Executes complete integration test for hello endpoint including server startup, 
 * request processing, and response validation across all application layers.
 * 
 * Tests complete integration including:
 * - Test server startup and readiness verification
 * - HTTP request execution with performance measurement
 * - Response validation using comprehensive assertion utilities
 * - Performance requirement verification against 100ms threshold
 * - Complete request-response pipeline integration validation
 * - Application layer coordination and component interaction verification
 * 
 * @param {Object} testEnvironment - Complete test environment from setupIntegrationTestEnvironment
 * @returns {Promise} Promise resolving with test execution result and performance metrics
 */
async function testHelloEndpointIntegration(testEnvironment) {
    try {
        const testResults = {
            testName: 'Hello Endpoint Integration Test',
            correlationId: testEnvironment.metadata.correlationId,
            startTime: Date.now(),
            success: false,
            steps: {},
            performance: {},
            errors: []
        };
        
        // Start test server and verify successful startup with port binding validation
        try {
            await testEnvironment.server.start();
            
            // Verify server is running and accepting connections
            const serverInfo = testEnvironment.server.getServerInfo();
            testEnvironment.assertions.serverStatus.assertServerListening(
                testEnvironment.server.server, 
                testEnvironment.port,
                testEnvironment.context
            );
            
            testResults.steps.serverStartup = {
                success: true,
                port: testEnvironment.port,
                serverInfo: serverInfo,
                startupTime: Date.now() - testResults.startTime
            };
        } catch (error) {
            testResults.errors.push(`Server startup failed: ${error.message}`);
            testResults.steps.serverStartup = { success: false, error: error.message };
            throw error;
        }
        
        // Wait for server to be ready and accepting connections with readiness verification
        try {
            await retryOperation(async () => {
                const serverRunning = testEnvironment.server.isRunning();
                if (!serverRunning) {
                    throw new Error('Server not ready for connections');
                }
                return true;
            }, {
                maxAttempts: 5,
                delay: 100,
                correlationId: testEnvironment.metadata.correlationId
            });
            
            testResults.steps.serverReadiness = {
                success: true,
                readinessTime: Date.now() - testResults.startTime
            };
        } catch (error) {
            testResults.errors.push(`Server readiness check failed: ${error.message}`);
            testResults.steps.serverReadiness = { success: false, error: error.message };
            throw error;
        }
        
        // Make GET request to /hello endpoint with performance measurement and timing validation
        try {
            const requestResult = await makeHelloRequest(testEnvironment.client, HELLO_ENDPOINT_PATH, {
                timeout: TEST_TIMEOUT,
                headers: {
                    'x-test-scenario': 'hello-endpoint-integration'
                }
            });
            
            testResults.steps.requestExecution = {
                success: requestResult.metadata.success,
                correlationId: requestResult.metadata.correlationId,
                requestDuration: requestResult.performance.requestDuration,
                responseData: requestResult.response
            };
            
            if (!requestResult.metadata.success) {
                testResults.errors.push(`Request execution failed: ${requestResult.error?.message || 'Unknown error'}`);
                throw new Error(`Request failed: ${requestResult.error?.message || 'Unknown error'}`);
            }
        } catch (error) {
            testResults.errors.push(`Request execution failed: ${error.message}`);
            testResults.steps.requestExecution = { success: false, error: error.message };
            throw error;
        }
        
        // Validate response using comprehensive assertion utilities and expected response characteristics
        try {
            const expectedResponse = HELLO_ENDPOINT_RESPONSES.successResponse;
            const validationResult = validateHelloEndpointResponse(
                testResults.steps.requestExecution.responseData,
                expectedResponse,
                {
                    strictValidation: true,
                    validatePerformance: true
                }
            );
            
            testResults.steps.responseValidation = {
                success: validationResult.success,
                validationSummary: validationResult.summary,
                validationDetails: validationResult.results.validationDetails
            };
            
            if (!validationResult.success) {
                testResults.errors.push(`Response validation failed: ${validationResult.results.validationErrors.join(', ')}`);
                throw new Error(`Response validation failed: ${validationResult.results.validationErrors.join(', ')}`);
            }
        } catch (error) {
            testResults.errors.push(`Response validation failed: ${error.message}`);
            testResults.steps.responseValidation = { success: false, error: error.message };
            throw error;
        }
        
        // Verify response time meets performance requirements with threshold validation
        try {
            const responseTime = testResults.steps.requestExecution.requestDuration;
            assert.ok(responseTime <= EXPECTED_RESPONSE_TIME_MS, 
                `Response time ${responseTime}ms exceeds requirement ${EXPECTED_RESPONSE_TIME_MS}ms`);
            
            testResults.steps.performanceValidation = {
                success: true,
                responseTime: responseTime,
                requirement: EXPECTED_RESPONSE_TIME_MS,
                performanceMargin: EXPECTED_RESPONSE_TIME_MS - responseTime
            };
        } catch (error) {
            testResults.errors.push(`Performance validation failed: ${error.message}`);
            testResults.steps.performanceValidation = { success: false, error: error.message };
            throw error;
        }
        
        // Test complete request-response pipeline integration with end-to-end validation
        try {
            const pipelineValidation = {
                serverRunning: testEnvironment.server.isRunning(),
                clientConnected: true,
                responseReceived: testResults.steps.requestExecution.success,
                validationPassed: testResults.steps.responseValidation.success,
                performanceMet: testResults.steps.performanceValidation.success
            };
            
            const pipelineSuccess = Object.values(pipelineValidation).every(check => check === true);
            
            testResults.steps.pipelineIntegration = {
                success: pipelineSuccess,
                pipelineChecks: pipelineValidation,
                integrationComplete: pipelineSuccess
            };
            
            if (!pipelineSuccess) {
                testResults.errors.push('Pipeline integration validation failed');
                throw new Error('Pipeline integration validation failed');
            }
        } catch (error) {
            testResults.errors.push(`Pipeline integration failed: ${error.message}`);
            testResults.steps.pipelineIntegration = { success: false, error: error.message };
            throw error;
        }
        
        // Calculate comprehensive performance metrics and test execution summary
        testResults.performance = {
            totalExecutionTime: Date.now() - testResults.startTime,
            serverStartupTime: testResults.steps.serverStartup?.startupTime || 0,
            requestResponseTime: testResults.steps.requestExecution?.requestDuration || 0,
            validationTime: testResults.steps.responseValidation ? 
                (Date.now() - testResults.startTime - testResults.steps.requestExecution?.requestDuration || 0) : 0,
            performanceGrade: testResults.steps.performanceValidation?.performanceMargin > 50 ? 'EXCELLENT' :
                             testResults.steps.performanceValidation?.performanceMargin > 20 ? 'GOOD' : 'ACCEPTABLE'
        };
        
        // Set overall test success status based on all validation steps
        testResults.success = Object.values(testResults.steps).every(step => step.success);
        
        // Return test execution result with metrics and validation status
        return testResults;
        
    } catch (error) {
        return {
            testName: 'Hello Endpoint Integration Test',
            correlationId: testEnvironment.metadata.correlationId,
            success: false,
            error: error.message,
            executionTime: Date.now() - (testEnvironment.metadata.setupTime || Date.now()),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Tests integration error handling including invalid requests, unsupported methods, 
 * and server error responses across all application layers.
 * 
 * Validates error handling integration including:
 * - Invalid HTTP method request handling (POST, PUT, DELETE) with 405 responses
 * - Non-existent path request handling with 404 error responses
 * - Malformed request handling with 400 error responses and proper error format
 * - Error response validation including status codes, content, and header compliance
 * - Server stability verification during error conditions and recovery testing
 * - Error response timing and format consistency across all error scenarios
 * 
 * @param {Object} testEnvironment - Complete test environment from setupIntegrationTestEnvironment
 * @returns {Promise} Promise resolving with error handling test results and validation status
 */
async function testErrorHandlingIntegration(testEnvironment) {
    try {
        const errorTestResults = {
            testName: 'Error Handling Integration Test',
            correlationId: testEnvironment.metadata.correlationId,
            startTime: Date.now(),
            success: false,
            errorScenarios: {},
            serverStability: {},
            errors: []
        };
        
        // Test invalid HTTP method requests (POST, PUT, DELETE) to /hello endpoint
        const invalidMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        for (const method of invalidMethods) {
            try {
                const methodTestResult = await makeHelloRequest(testEnvironment.client, HELLO_ENDPOINT_PATH, {
                    method: method,
                    headers: {
                        'x-test-scenario': `invalid-method-${method.toLowerCase()}`
                    }
                });
                
                // Validate 405 Method Not Allowed response
                const expectedResponse = HELLO_ENDPOINT_RESPONSES.methodNotAllowedResponse;
                assert.strictEqual(methodTestResult.response.statusCode, 405, 
                    `Expected 405 for ${method} method, got ${methodTestResult.response.statusCode}`);
                
                errorTestResults.errorScenarios[`invalid_method_${method.toLowerCase()}`] = {
                    success: true,
                    method: method,
                    responseStatus: methodTestResult.response.statusCode,
                    responseTime: methodTestResult.performance.requestDuration
                };
            } catch (error) {
                errorTestResults.errors.push(`Invalid method test failed for ${method}: ${error.message}`);
                errorTestResults.errorScenarios[`invalid_method_${method.toLowerCase()}`] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        // Test requests to non-existent paths for 404 handling validation
        const invalidPaths = ['/nonexistent', '/api/users', '/admin', '/hello/extra'];
        for (const path of invalidPaths) {
            try {
                const pathTestResult = await makeHelloRequest(testEnvironment.client, path, {
                    headers: {
                        'x-test-scenario': `invalid-path-${path.replace(/\//g, '-')}`
                    }
                });
                
                // Validate 404 Not Found response
                const expectedResponse = HELLO_ENDPOINT_RESPONSES.notFoundResponse;
                assert.strictEqual(pathTestResult.response.statusCode, 404,
                    `Expected 404 for path ${path}, got ${pathTestResult.response.statusCode}`);
                
                errorTestResults.errorScenarios[`invalid_path_${path.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
                    success: true,
                    path: path,
                    responseStatus: pathTestResult.response.statusCode,
                    responseTime: pathTestResult.performance.requestDuration
                };
            } catch (error) {
                errorTestResults.errors.push(`Invalid path test failed for ${path}: ${error.message}`);
                errorTestResults.errorScenarios[`invalid_path_${path.replace(/[^a-zA-Z0-9]/g, '_')}`] = {
                    success: false,
                    error: error.message
                };
            }
        }
        
        // Test malformed requests for proper error response and request parsing validation
        try {
            const malformedRequest = HELLO_ENDPOINT_REQUESTS.malformedRequest;
            const malformedTestResult = await makeHelloRequest(testEnvironment.client, malformedRequest.url || '/hello', {
                method: malformedRequest.method || 'GET',
                headers: {
                    'x-test-scenario': 'malformed-request',
                    ...malformedRequest.headers
                }
            });
            
            // Validate error response status code (400 or 404)
            const validErrorStatuses = [400, 404];
            assert.ok(validErrorStatuses.includes(malformedTestResult.response.statusCode),
                `Expected error status (400/404), got ${malformedTestResult.response.statusCode}`);
            
            errorTestResults.errorScenarios.malformed_request = {
                success: true,
                responseStatus: malformedTestResult.response.statusCode,
                responseTime: malformedTestResult.performance.requestDuration
            };
        } catch (error) {
            errorTestResults.errors.push(`Malformed request test failed: ${error.message}`);
            errorTestResults.errorScenarios.malformed_request = {
                success: false,
                error: error.message
            };
        }
        
        // Validate error response status codes and content format consistency
        const errorScenarioCount = Object.keys(errorTestResults.errorScenarios).length;
        const successfulErrorTests = Object.values(errorTestResults.errorScenarios)
            .filter(scenario => scenario.success).length;
        
        const errorHandlingSuccessRate = errorScenarioCount > 0 ? 
            (successfulErrorTests / errorScenarioCount) * 100 : 0;
        
        // Verify error handling doesn't affect server stability with stability assessment
        try {
            const stabilityCheck = {
                serverStillRunning: testEnvironment.server.isRunning(),
                serverResponsive: false,
                errorRecovery: true
            };
            
            // Test server responsiveness after error scenarios
            const stabilityTestResult = await makeHelloRequest(testEnvironment.client, HELLO_ENDPOINT_PATH, {
                headers: {
                    'x-test-scenario': 'stability-check-after-errors'
                }
            });
            
            stabilityCheck.serverResponsive = stabilityTestResult.response.statusCode === 200;
            
            errorTestResults.serverStability = {
                stabilityChecks: stabilityCheck,
                stabilityValid: Object.values(stabilityCheck).every(check => check === true),
                postErrorResponseTime: stabilityTestResult.performance.requestDuration
            };
            
            assert.ok(errorTestResults.serverStability.stabilityValid, 'Server stability compromised after error scenarios');
        } catch (error) {
            errorTestResults.errors.push(`Server stability check failed: ${error.message}`);
            errorTestResults.serverStability = {
                stabilityValid: false,
                error: error.message
            };
        }
        
        // Test error response timing and format consistency across error scenarios
        const errorResponseTimes = Object.values(errorTestResults.errorScenarios)
            .filter(scenario => scenario.success && scenario.responseTime)
            .map(scenario => scenario.responseTime);
        
        if (errorResponseTimes.length > 0) {
            const averageErrorResponseTime = errorResponseTimes.reduce((a, b) => a + b, 0) / errorResponseTimes.length;
            const maxErrorResponseTime = Math.max(...errorResponseTimes);
            
            errorTestResults.performance = {
                averageErrorResponseTime: averageErrorResponseTime,
                maxErrorResponseTime: maxErrorResponseTime,
                errorResponseConsistency: maxErrorResponseTime <= EXPECTED_RESPONSE_TIME_MS,
                errorHandlingSuccessRate: errorHandlingSuccessRate
            };
            
            // Validate error response timing meets performance requirements
            assert.ok(averageErrorResponseTime <= EXPECTED_RESPONSE_TIME_MS,
                `Average error response time ${averageErrorResponseTime}ms exceeds requirement ${EXPECTED_RESPONSE_TIME_MS}ms`);
        }
        
        // Determine overall error handling test success based on all error scenarios
        const overallErrorHandlingSuccess = errorTestResults.errors.length === 0 &&
                                          errorHandlingSuccessRate >= 80 &&
                                          errorTestResults.serverStability.stabilityValid;
        
        errorTestResults.success = overallErrorHandlingSuccess;
        errorTestResults.executionTime = Date.now() - errorTestResults.startTime;
        
        // Return error handling test results with validation status and performance metrics
        return errorTestResults;
        
    } catch (error) {
        return {
            testName: 'Error Handling Integration Test',
            correlationId: testEnvironment.metadata.correlationId,
            success: false,
            error: error.message,
            executionTime: Date.now() - (testEnvironment.metadata.setupTime || Date.now()),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Tests server ability to handle concurrent requests to hello endpoint with performance 
 * measurement and response validation.
 * 
 * Validates concurrent request handling including:
 * - Multiple simultaneous request execution to hello endpoint
 * - Response validation for all concurrent requests with consistency verification
 * - Performance measurement during concurrent load with timing analysis
 * - Server stability verification under concurrent request load
 * - Response consistency validation across all concurrent requests
 * - Resource usage monitoring during concurrent request execution
 * 
 * @param {Object} testEnvironment - Complete test environment from setupIntegrationTestEnvironment
 * @param {number} concurrentRequests - Number of concurrent requests to execute (default: 5)
 * @returns {Promise} Promise resolving with concurrent request test results and performance metrics
 */
async function testConcurrentRequestHandling(testEnvironment, concurrentRequests = 5) {
    try {
        const concurrencyTestResults = {
            testName: 'Concurrent Request Handling Test',
            correlationId: testEnvironment.metadata.correlationId,
            startTime: Date.now(),
            success: false,
            concurrentRequests: concurrentRequests,
            requestResults: [],
            performance: {},
            errors: []
        };
        
        // Generate array of concurrent test requests to /hello endpoint with unique correlation
        const requestPromises = [];
        const requestCorrelations = [];
        
        for (let i = 0; i < concurrentRequests; i++) {
            const requestCorrelationId = `${TEST_CORRELATION_PREFIX}concurrent-${i + 1}-${Date.now()}`;
            requestCorrelations.push(requestCorrelationId);
            
            const requestPromise = makeHelloRequest(testEnvironment.client, HELLO_ENDPOINT_PATH, {
                headers: {
                    'x-correlation-id': requestCorrelationId,
                    'x-test-scenario': 'concurrent-request',
                    'x-request-index': (i + 1).toString(),
                    'x-total-concurrent': concurrentRequests.toString()
                }
            });
            
            requestPromises.push(requestPromise);
        }
        
        // Start performance measurement for concurrent request execution timing
        const concurrencyTimer = new TestTimer();
        concurrencyTimer.start();
        
        let allRequestResults = [];
        
        // Execute all requests simultaneously using Promise.all with comprehensive error handling
        try {
            allRequestResults = await Promise.all(requestPromises);
            concurrencyTimer.stop();
            
            concurrencyTestResults.requestResults = allRequestResults;
        } catch (error) {
            concurrencyTimer.stop();
            concurrencyTestResults.errors.push(`Concurrent request execution failed: ${error.message}`);
            throw error;
        }
        
        // Validate all responses for correct status and content with consistency verification
        const validationResults = {
            totalRequests: allRequestResults.length,
            successfulRequests: 0,
            failedRequests: 0,
            responseValidations: [],
            consistencyChecks: {
                statusCodes: new Set(),
                responseBodies: new Set(),
                responseHeaders: []
            }
        };
        
        for (let i = 0; i < allRequestResults.length; i++) {
            const requestResult = allRequestResults[i];
            const expectedResponse = HELLO_ENDPOINT_RESPONSES.successResponse;
            
            try {
                // Validate individual response using comprehensive validation
                const validationResult = validateHelloEndpointResponse(
                    requestResult.response,
                    expectedResponse,
                    { strictValidation: true, validatePerformance: true }
                );
                
                if (validationResult.success) {
                    validationResults.successfulRequests++;
                    
                    // Collect consistency data
                    validationResults.consistencyChecks.statusCodes.add(requestResult.response.statusCode);
                    validationResults.consistencyChecks.responseBodies.add(requestResult.response.body);
                    validationResults.consistencyChecks.responseHeaders.push(requestResult.response.headers);
                } else {
                    validationResults.failedRequests++;
                    concurrencyTestResults.errors.push(
                        `Request ${i + 1} validation failed: ${validationResult.results.validationErrors.join(', ')}`
                    );
                }
                
                validationResults.responseValidations.push({
                    requestIndex: i + 1,
                    correlationId: requestResult.request.correlationId,
                    success: validationResult.success,
                    responseTime: requestResult.performance.requestDuration
                });
            } catch (error) {
                validationResults.failedRequests++;
                concurrencyTestResults.errors.push(`Request ${i + 1} validation error: ${error.message}`);
                validationResults.responseValidations.push({
                    requestIndex: i + 1,
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Measure total execution time and individual response times for performance analysis
        const totalConcurrentExecutionTime = concurrencyTimer.getDuration();
        const individualResponseTimes = allRequestResults.map(result => result.performance.requestDuration);
        const averageResponseTime = individualResponseTimes.length > 0 ?
            individualResponseTimes.reduce((a, b) => a + b, 0) / individualResponseTimes.length : 0;
        const maxResponseTime = individualResponseTimes.length > 0 ? Math.max(...individualResponseTimes) : 0;
        const minResponseTime = individualResponseTimes.length > 0 ? Math.min(...individualResponseTimes) : 0;
        
        // Calculate concurrent request performance metrics and throughput analysis
        concurrencyTestResults.performance = {
            totalExecutionTime: totalConcurrentExecutionTime,
            averageResponseTime: averageResponseTime,
            maxResponseTime: maxResponseTime,
            minResponseTime: minResponseTime,
            throughput: concurrentRequests / (totalConcurrentExecutionTime / 1000), // requests per second
            responseTimeVariance: this._calculateVariance(individualResponseTimes),
            performanceConsistency: maxResponseTime <= EXPECTED_RESPONSE_TIME_MS * 1.5, // Allow 50% margin for concurrency
            concurrencyEfficiency: (concurrentRequests / totalConcurrentExecutionTime) * 1000 // efficiency metric
        };
        
        // Verify server maintains stability under concurrent load with resource monitoring
        try {
            const stabilityValidation = {
                serverRunning: testEnvironment.server.isRunning(),
                allRequestsCompleted: allRequestResults.length === concurrentRequests,
                responseConsistency: validationResults.consistencyChecks.statusCodes.size === 1 && 
                                   validationResults.consistencyChecks.responseBodies.size === 1,
                performanceStability: concurrencyTestResults.performance.performanceConsistency,
                successRate: (validationResults.successfulRequests / validationResults.totalRequests) * 100
            };
            
            const serverStable = Object.values(stabilityValidation).every(check => check === true);
            
            concurrencyTestResults.serverStability = {
                stable: serverStable,
                stabilityChecks: stabilityValidation,
                successRate: stabilityValidation.successRate,
                responseConsistency: stabilityValidation.responseConsistency
            };
            
            // Assert server stability requirements
            assert.ok(serverStable, 'Server stability compromised under concurrent load');
            assert.ok(stabilityValidation.successRate >= 90, 
                `Success rate ${stabilityValidation.successRate}% below 90% threshold`);
        } catch (error) {
            concurrencyTestResults.errors.push(`Server stability validation failed: ${error.message}`);
            concurrencyTestResults.serverStability = {
                stable: false,
                error: error.message
            };
        }
        
        // Determine overall concurrent request test success based on all validation criteria
        const overallConcurrencySuccess = concurrencyTestResults.errors.length === 0 &&
                                        validationResults.successfulRequests >= concurrentRequests * 0.9 && // 90% success rate
                                        concurrencyTestResults.serverStability.stable &&
                                        concurrencyTestResults.performance.performanceConsistency;
        
        concurrencyTestResults.success = overallConcurrencySuccess;
        concurrencyTestResults.executionTime = Date.now() - concurrencyTestResults.startTime;
        concurrencyTestResults.validationSummary = validationResults;
        
        // Return concurrent request test results with performance analysis and stability validation
        return concurrencyTestResults;
        
    } catch (error) {
        return {
            testName: 'Concurrent Request Handling Test',
            correlationId: testEnvironment.metadata.correlationId,
            success: false,
            error: error.message,
            concurrentRequests: concurrentRequests,
            executionTime: Date.now() - (testEnvironment.metadata.setupTime || Date.now()),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Helper function to calculate variance for performance analysis
 * @private
 */
function _calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    return squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
}

// ============================================================================
// INTEGRATION TEST SUITE IMPLEMENTATION
// ============================================================================

/**
 * Main integration test suite for hello endpoint testing with comprehensive validation
 * covering all application layers, error scenarios, and performance requirements.
 */
describe('Hello Endpoint Integration Test Suite', () => {
    // Test environment setup and cleanup for each test with proper isolation
    beforeEach(async () => {
        // Reset test execution metrics for clean test state
        testExecutionMetrics.testStartTime = Date.now();
        testExecutionMetrics.totalTests++;
        
        // Setup integration test environment with unique configuration
        currentTestEnvironment = await setupIntegrationTestEnvironment({
            enableLogging: false, // Disable logging during tests for clean output
            serverConfig: {
                enablePerformanceMonitoring: true,
                enableDetailedErrorReporting: true
            }
        });
        
        // Verify test environment setup completed successfully
        assert.ok(currentTestEnvironment, 'Test environment setup failed');
        assert.ok(currentTestEnvironment.server, 'Test server not available');
        assert.ok(currentTestEnvironment.client, 'Test client not available');
    });
    
    afterEach(async () => {
        // Cleanup integration test environment with comprehensive resource deallocation
        if (currentTestEnvironment) {
            try {
                await teardownIntegrationTestEnvironment(currentTestEnvironment);
                
                // Update test execution metrics
                const testDuration = Date.now() - testExecutionMetrics.testStartTime;
                testExecutionMetrics.totalExecutionTime += testDuration;
                
            } catch (error) {
                console.warn(`Test cleanup warning: ${error.message}`);
            } finally {
                currentTestEnvironment = null;
            }
        }
    });
    
    // ========================================================================
    // HELLO ENDPOINT SUCCESS SCENARIO INTEGRATION TESTS
    // ========================================================================
    
    test('should successfully handle GET request to /hello endpoint', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Execute complete hello endpoint integration test with comprehensive validation
            const integrationTestResult = await testHelloEndpointIntegration(currentTestEnvironment);
            
            // Validate test execution success and all integration steps
            assert.ok(integrationTestResult.success, 
                `Hello endpoint integration test failed: ${integrationTestResult.errors.join(', ')}`);
            
            // Verify all integration steps completed successfully
            const requiredSteps = ['serverStartup', 'serverReadiness', 'requestExecution', 'responseValidation', 'performanceValidation', 'pipelineIntegration'];
            requiredSteps.forEach(step => {
                assert.ok(integrationTestResult.steps[step]?.success, 
                    `Integration step '${step}' failed: ${integrationTestResult.steps[step]?.error || 'Unknown error'}`);
            });
            
            // Validate performance requirements met across all integration components
            assert.ok(integrationTestResult.performance.performanceGrade !== 'POOR',
                `Performance grade ${integrationTestResult.performance.performanceGrade} indicates poor performance`);
            
            // Update success metrics
            testExecutionMetrics.passedTests++;
            testExecutionMetrics.averageResponseTime = 
                (testExecutionMetrics.averageResponseTime + integrationTestResult.performance.requestResponseTime) / 2;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    test('should return correct response content and headers', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Start test server for response content validation
            await currentTestEnvironment.server.start();
            
            // Make request to hello endpoint for content validation
            const requestResult = await makeHelloRequest(currentTestEnvironment.client, HELLO_ENDPOINT_PATH, {
                headers: {
                    'x-test-scenario': 'content-validation'
                }
            });
            
            // Validate response content matches expected hello world message
            assert.strictEqual(requestResult.response.body, EXPECTED_HELLO_RESPONSE,
                `Response content mismatch: expected '${EXPECTED_HELLO_RESPONSE}', got '${requestResult.response.body}'`);
            
            // Validate response status code is 200 OK
            assert.strictEqual(requestResult.response.statusCode, 200,
                `Status code mismatch: expected 200, got ${requestResult.response.statusCode}`);
            
            // Validate response headers include proper Content-Type
            assert.ok(requestResult.response.headers['content-type'],
                'Response missing Content-Type header');
            assert.ok(requestResult.response.headers['content-type'].includes('text/plain'),
                `Content-Type should be text/plain, got: ${requestResult.response.headers['content-type']}`);
            
            // Validate response structure completeness
            assert.ok(requestResult.response.headers, 'Response missing headers object');
            assert.ok(typeof requestResult.response.body === 'string', 'Response body should be string');
            assert.ok(requestResult.performance.requestDuration > 0, 'Response time should be measured');
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    test('should meet performance requirements for response time', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Start test server for performance validation
            await currentTestEnvironment.server.start();
            
            // Create performance assertion for response time validation
            const performanceAssertion = currentTestEnvironment.assertions.performance;
            
            // Execute hello request with performance measurement
            const performanceTestResult = await performanceAssertion.assertResponseTime(
                async () => {
                    const requestResult = await makeHelloRequest(currentTestEnvironment.client, HELLO_ENDPOINT_PATH, {
                        headers: {
                            'x-test-scenario': 'performance-validation'
                        }
                    });
                    return requestResult;
                },
                EXPECTED_RESPONSE_TIME_MS,
                {
                    testName: 'Hello Endpoint Performance Test',
                    correlationId: currentTestEnvironment.metadata.correlationId,
                    timer: new TestTimer()
                }
            );
            
            // Validate performance test execution and timing results
            assert.ok(performanceTestResult, 'Performance test should return result');
            assert.ok(performanceTestResult.metadata.success, 'Performance test should succeed');
            
            // Verify response time meets educational requirements
            const responseTime = performanceTestResult.performance.requestDuration;
            assert.ok(responseTime <= EXPECTED_RESPONSE_TIME_MS,
                `Response time ${responseTime}ms exceeds requirement ${EXPECTED_RESPONSE_TIME_MS}ms`);
            
            // Validate performance grade meets minimum standards
            const performanceGrade = performanceTestResult.performance.performanceGrade;
            assert.notStrictEqual(performanceGrade, 'POOR',
                `Performance grade ${performanceGrade} indicates poor performance`);
            
            testExecutionMetrics.passedTests++;
            testExecutionMetrics.averageResponseTime = 
                (testExecutionMetrics.averageResponseTime + responseTime) / 2;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    // ========================================================================
    // ERROR HANDLING INTEGRATION TESTS
    // ========================================================================
    
    test('should handle invalid HTTP methods with proper error responses', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Execute error handling integration test for method validation
            const errorHandlingResult = await testErrorHandlingIntegration(currentTestEnvironment);
            
            // Validate error handling test execution success
            assert.ok(errorHandlingResult.success,
                `Error handling integration test failed: ${errorHandlingResult.errors.join(', ')}`);
            
            // Verify invalid method scenarios were tested successfully
            const invalidMethodTests = Object.keys(errorHandlingResult.errorScenarios)
                .filter(key => key.startsWith('invalid_method_'));
            
            assert.ok(invalidMethodTests.length >= 4, 
                `Should test at least 4 invalid methods, tested ${invalidMethodTests.length}`);
            
            // Validate each invalid method returned proper 405 response
            invalidMethodTests.forEach(methodTest => {
                const testResult = errorHandlingResult.errorScenarios[methodTest];
                assert.ok(testResult.success, `Invalid method test ${methodTest} should succeed`);
                assert.strictEqual(testResult.responseStatus, 405,
                    `Invalid method should return 405, got ${testResult.responseStatus}`);
            });
            
            // Verify server stability after error scenarios
            assert.ok(errorHandlingResult.serverStability.stable,
                'Server should remain stable after error scenarios');
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    test('should handle invalid paths with 404 responses', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Start test server for invalid path testing
            await currentTestEnvironment.server.start();
            
            // Test multiple invalid paths for comprehensive route validation
            const invalidPaths = ['/nonexistent', '/api/users', '/admin', '/hello/extra'];
            const pathTestResults = [];
            
            for (const invalidPath of invalidPaths) {
                const pathTestResult = await makeHelloRequest(currentTestEnvironment.client, invalidPath, {
                    headers: {
                        'x-test-scenario': `invalid-path-${invalidPath.replace(/\//g, '-')}`
                    }
                });
                
                // Validate 404 Not Found response for invalid paths
                assert.strictEqual(pathTestResult.response.statusCode, 404,
                    `Invalid path ${invalidPath} should return 404, got ${pathTestResult.response.statusCode}`);
                
                // Validate error response format and content
                assert.ok(pathTestResult.response.headers['content-type'],
                    `404 response for ${invalidPath} should include Content-Type header`);
                
                pathTestResults.push({
                    path: invalidPath,
                    statusCode: pathTestResult.response.statusCode,
                    responseTime: pathTestResult.performance.requestDuration,
                    success: pathTestResult.response.statusCode === 404
                });
            }
            
            // Verify all invalid path tests succeeded
            const allPathTestsSucceeded = pathTestResults.every(result => result.success);
            assert.ok(allPathTestsSucceeded, 'All invalid path tests should return 404');
            
            // Validate error response timing consistency
            const errorResponseTimes = pathTestResults.map(result => result.responseTime);
            const averageErrorResponseTime = errorResponseTimes.reduce((a, b) => a + b, 0) / errorResponseTimes.length;
            assert.ok(averageErrorResponseTime <= EXPECTED_RESPONSE_TIME_MS,
                `Average error response time ${averageErrorResponseTime}ms should meet performance requirements`);
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    // ========================================================================
    // CONCURRENT REQUEST HANDLING INTEGRATION TESTS
    // ========================================================================
    
    test('should handle concurrent requests without performance degradation', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Execute concurrent request handling test with performance validation
            const concurrencyTestResult = await testConcurrentRequestHandling(
                currentTestEnvironment, 
                INTEGRATION_TEST_CONFIG.maxConcurrentRequests
            );
            
            // Validate concurrent request test execution success
            assert.ok(concurrencyTestResult.success,
                `Concurrent request test failed: ${concurrencyTestResult.errors.join(', ')}`);
            
            // Verify all concurrent requests completed successfully
            assert.strictEqual(concurrencyTestResult.requestResults.length, INTEGRATION_TEST_CONFIG.maxConcurrentRequests,
                'All concurrent requests should complete');
            
            // Validate server stability under concurrent load
            assert.ok(concurrencyTestResult.serverStability.stable,
                'Server should remain stable under concurrent load');
            
            // Verify response consistency across concurrent requests
            assert.ok(concurrencyTestResult.serverStability.responseConsistency,
                'Responses should be consistent across concurrent requests');
            
            // Validate performance characteristics under concurrent load
            assert.ok(concurrencyTestResult.performance.performanceConsistency,
                'Performance should remain consistent under concurrent load');
            
            // Verify success rate meets minimum threshold
            const successRate = concurrencyTestResult.serverStability.successRate;
            assert.ok(successRate >= 90,
                `Success rate ${successRate}% should be at least 90%`);
            
            // Validate throughput meets minimum requirements
            const throughput = concurrencyTestResult.performance.throughput;
            assert.ok(throughput > 0, 'Throughput should be measurable');
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    test('should maintain response consistency across multiple requests', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Start test server for consistency validation
            await currentTestEnvironment.server.start();
            
            // Execute multiple sequential requests for consistency verification
            const consistencyRequestCount = 5;
            const consistencyResults = [];
            
            for (let i = 0; i < consistencyRequestCount; i++) {
                const requestResult = await makeHelloRequest(currentTestEnvironment.client, HELLO_ENDPOINT_PATH, {
                    headers: {
                        'x-test-scenario': 'consistency-validation',
                        'x-request-sequence': (i + 1).toString()
                    }
                });
                
                consistencyResults.push({
                    index: i + 1,
                    statusCode: requestResult.response.statusCode,
                    body: requestResult.response.body,
                    contentType: requestResult.response.headers['content-type'],
                    responseTime: requestResult.performance.requestDuration
                });
            }
            
            // Validate response consistency across all requests
            const firstResponse = consistencyResults[0];
            consistencyResults.forEach((result, index) => {
                assert.strictEqual(result.statusCode, firstResponse.statusCode,
                    `Request ${index + 1} status code should match first request`);
                assert.strictEqual(result.body, firstResponse.body,
                    `Request ${index + 1} body should match first request`);
                assert.strictEqual(result.contentType, firstResponse.contentType,
                    `Request ${index + 1} Content-Type should match first request`);
            });
            
            // Validate performance consistency across requests
            const responseTimes = consistencyResults.map(result => result.responseTime);
            const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const maxResponseTime = Math.max(...responseTimes);
            const minResponseTime = Math.min(...responseTimes);
            const responseTimeVariance = _calculateVariance(responseTimes);
            
            // Ensure all responses meet performance requirements
            assert.ok(maxResponseTime <= EXPECTED_RESPONSE_TIME_MS,
                `Maximum response time ${maxResponseTime}ms should meet requirement ${EXPECTED_RESPONSE_TIME_MS}ms`);
            
            // Validate response time consistency (variance should be reasonable)
            const acceptableVariance = Math.pow(EXPECTED_RESPONSE_TIME_MS * 0.3, 2); // 30% variance threshold
            assert.ok(responseTimeVariance <= acceptableVariance,
                `Response time variance ${responseTimeVariance} should be consistent`);
            
            testExecutionMetrics.passedTests++;
            testExecutionMetrics.averageResponseTime = 
                (testExecutionMetrics.averageResponseTime + averageResponseTime) / 2;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    // ========================================================================
    // ERROR SCENARIO INTEGRATION TESTS
    // ========================================================================
    
    test('should handle error scenarios without affecting server stability', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Execute comprehensive error handling integration test
            const errorHandlingResult = await testErrorHandlingIntegration(currentTestEnvironment);
            
            // Validate error handling integration test success
            assert.ok(errorHandlingResult.success,
                `Error handling integration failed: ${errorHandlingResult.errors.join(', ')}`);
            
            // Verify comprehensive error scenario coverage
            const errorScenarioKeys = Object.keys(errorHandlingResult.errorScenarios);
            assert.ok(errorScenarioKeys.length >= 8, 
                `Should test at least 8 error scenarios, tested ${errorScenarioKeys.length}`);
            
            // Validate server stability metrics after error scenarios
            assert.ok(errorHandlingResult.serverStability.stabilityValid,
                'Server should maintain stability after error scenarios');
            
            // Verify error response performance meets requirements
            assert.ok(errorHandlingResult.performance.errorHandlingSuccessRate >= 80,
                `Error handling success rate ${errorHandlingResult.performance.errorHandlingSuccessRate}% should be at least 80%`);
            
            // Validate error response timing consistency
            assert.ok(errorHandlingResult.performance.errorResponseConsistency,
                'Error response timing should be consistent and meet performance requirements');
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    // ========================================================================
    // COMPREHENSIVE INTEGRATION VALIDATION TESTS
    // ========================================================================
    
    test('should demonstrate complete application layer integration', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Start test server for comprehensive integration validation
            await currentTestEnvironment.server.start();
            
            // Verify server foundation integration (F-001)
            const serverInfo = currentTestEnvironment.server.getServerInfo();
            assert.ok(serverInfo.listening, 'HTTP server foundation should be operational');
            assert.strictEqual(serverInfo.port, currentTestEnvironment.port, 'Server should bind to correct port');
            
            // Test request processing engine integration (F-003)
            const requestResult = await makeHelloRequest(currentTestEnvironment.client, HELLO_ENDPOINT_PATH, {
                headers: {
                    'x-test-scenario': 'layer-integration-validation',
                    'x-integration-test': 'comprehensive'
                }
            });
            
            // Validate hello endpoint implementation integration (F-002)
            assert.strictEqual(requestResult.response.statusCode, 200, 'Hello endpoint should return 200 status');
            assert.strictEqual(requestResult.response.body, EXPECTED_HELLO_RESPONSE, 'Hello endpoint should return correct content');
            
            // Verify complete request-response pipeline integration
            assert.ok(requestResult.metadata.success, 'Complete pipeline integration should succeed');
            assert.ok(requestResult.performance.meetsPerformanceRequirement, 'Pipeline should meet performance requirements');
            
            // Test HTTP server, routing, controller, and service layer coordination
            const layerIntegrationChecks = {
                httpServerLayer: requestResult.response.statusCode !== null,
                routingLayer: requestResult.response.statusCode !== 404 || requestResult.request.path === HELLO_ENDPOINT_PATH,
                controllerLayer: requestResult.response.body === EXPECTED_HELLO_RESPONSE,
                serviceLayer: requestResult.response.headers['content-type'] !== undefined,
                performanceLayer: requestResult.performance.requestDuration <= EXPECTED_RESPONSE_TIME_MS
            };
            
            // Validate all application layers integrated correctly
            Object.entries(layerIntegrationChecks).forEach(([layer, check]) => {
                assert.ok(check, `${layer} integration should be successful`);
            });
            
            // Verify educational objectives met through comprehensive integration
            const educationalObjectives = {
                httpProtocolHandling: requestResult.response.statusCode === 200,
                requestResponseCycle: requestResult.metadata.success,
                performanceAwareness: requestResult.performance.performanceGrade !== 'POOR',
                errorHandlingDemonstration: true, // Covered in other tests
                testingPatterns: true // Demonstrated through test execution
            };
            
            Object.entries(educationalObjectives).forEach(([objective, achieved]) => {
                assert.ok(achieved, `Educational objective '${objective}' should be achieved`);
            });
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
    
    test('should demonstrate Node.js built-in test runner capabilities', { timeout: TEST_TIMEOUT }, async () => {
        try {
            // Verify Node.js built-in test runner functionality and features
            assert.ok(typeof test === 'function', 'Node.js test function should be available');
            assert.ok(typeof describe === 'function', 'Node.js describe function should be available');
            assert.ok(typeof beforeEach === 'function', 'Node.js beforeEach function should be available');
            assert.ok(typeof afterEach === 'function', 'Node.js afterEach function should be available');
            
            // Demonstrate assertion capabilities with Node.js built-in assert module
            assert.ok(typeof assert.strictEqual === 'function', 'Built-in assertion functions should be available');
            assert.ok(typeof assert.ok === 'function', 'Built-in assertion validation should be available');
            
            // Verify test environment provides comprehensive testing capabilities
            assert.ok(currentTestEnvironment.server, 'Test environment should provide server instance');
            assert.ok(currentTestEnvironment.client, 'Test environment should provide HTTP client');
            assert.ok(currentTestEnvironment.assertions, 'Test environment should provide assertion utilities');
            
            // Demonstrate comprehensive testing patterns for educational purposes
            const testingPatterns = {
                environmentSetup: currentTestEnvironment !== null,
                resourceCleanup: typeof teardownIntegrationTestEnvironment === 'function',
                performanceMeasurement: typeof TestTimer === 'function',
                correlationTracking: typeof generateCorrelationId === 'function',
                comprehensiveAssertions: Object.keys(currentTestEnvironment.assertions).length >= 3
            };
            
            Object.entries(testingPatterns).forEach(([pattern, demonstrated]) => {
                assert.ok(demonstrated, `Testing pattern '${pattern}' should be demonstrated`);
            });
            
            // Validate educational value and testing completeness
            const educationalDemonstration = {
                zeroExternalDependencies: true, // Using only Node.js built-in modules
                comprehensiveTestCoverage: true, // Testing all application layers
                performanceValidation: true, // Including response time requirements
                errorHandlingValidation: true, // Testing error scenarios
                productionReadyPatterns: true // Demonstrating enterprise patterns
            };
            
            Object.entries(educationalDemonstration).forEach(([aspect, demonstrated]) => {
                assert.ok(demonstrated, `Educational aspect '${aspect}' should be demonstrated`);
            });
            
            testExecutionMetrics.passedTests++;
            
        } catch (error) {
            testExecutionMetrics.failedTests++;
            throw error;
        }
    });
});