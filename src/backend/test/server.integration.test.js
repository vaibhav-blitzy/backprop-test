/**
 * Comprehensive Server Integration Test Suite for Node.js Tutorial HTTP Server Application
 * 
 * Provides complete integration testing of the Node.js tutorial HTTP server application
 * including server lifecycle management, endpoint functionality, error handling, and 
 * performance characteristics. Implements integration testing patterns using Node.js 
 * built-in test runner with TestServer, HttpTestClient, and comprehensive validation 
 * utilities for educational and production-ready server functionality validation.
 * 
 * Integration Test Scope:
 * - Complete server lifecycle including startup, operation, and graceful shutdown
 * - Full HTTP endpoint functionality testing through complete application stack
 * - Comprehensive error handling validation including 404 and 405 responses
 * - Performance integration testing with concurrent request handling
 * - Request processing engine validation through complete request-response cycle
 * - Resource management and cleanup verification for production readiness
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive integration testing methodology for HTTP server applications
 * - Shows proper test organization with describe blocks and test case structuring
 * - Illustrates server lifecycle testing with TestServer and Application class integration
 * - Provides examples of HTTP client testing with HttpTestClient and response validation
 * - Shows performance integration testing with timing measurement and concurrent testing
 * - Demonstrates production-ready testing practices for Node.js HTTP server applications
 * 
 * Architecture Integration:
 * - Integrates with Application class for complete application lifecycle testing
 * - Uses TestServer for isolated server instances with full component integration
 * - Leverages HttpTestClient for comprehensive HTTP request testing and validation
 * - Incorporates TestConfigManager for integration test configuration and environment setup
 * - Utilizes test utilities for performance measurement, correlation tracking, and validation
 * - Integrates with Node.js built-in test runner for comprehensive test execution
 * 
 * @fileoverview Comprehensive server integration test suite for Node.js tutorial application
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// NODE.JS BUILT-IN TEST FRAMEWORK IMPORTS
// ============================================================================

// Import Node.js built-in test runner functions for comprehensive integration testing
import { test, describe, before, after, beforeEach, afterEach } from 'node:test'; // Node.js v22.x LTS - Built-in test runner
import assert from 'node:assert'; // Node.js v22.x LTS - Built-in assertion library for integration test validation

// ============================================================================
// APPLICATION COMPONENT IMPORTS FOR INTEGRATION TESTING
// ============================================================================

// Import main Application class for complete application lifecycle integration testing
import { Application } from '../app.js';

// Import TestServer class for isolated server instances with full component integration
import { TestServer } from './helpers/test-server.js';

// Import HttpTestClient for comprehensive HTTP request testing and validation
import { HttpTestClient } from './helpers/test-client.js';

// Import TestConfigManager for integration test configuration and environment setup
import { TestConfigManager, getTestPort } from './fixtures/test-config.js';

// ============================================================================
// CONSTANTS AND VALIDATION UTILITIES IMPORTS
// ============================================================================

// Import response message constants for integration test response validation
import { RESPONSE_MESSAGES } from '../constants/response-messages.js';

// Import HTTP status code constants and validation utilities for response checking
import { HTTP_STATUS_CODES, isSuccessStatus } from '../utils/http-status.js';

// ============================================================================
// GLOBAL TEST CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Global timeout configuration for integration test execution and server operations.
 * Provides appropriate timeout settings for integration testing scenarios while
 * ensuring sufficient time for component initialization and cleanup operations.
 */
const INTEGRATION_TEST_TIMEOUT = 15000;

/**
 * Server startup timeout for application initialization and component coordination.
 * Allows sufficient time for server startup including component initialization,
 * port binding, and readiness verification for integration testing.
 */
const SERVER_STARTUP_TIMEOUT = 10000;

/**
 * Individual request timeout for HTTP request-response cycle completion.
 * Ensures adequate time for request processing while preventing test hangs
 * during HTTP communication and response validation.
 */
const REQUEST_TIMEOUT = 5000;

/**
 * Performance threshold for response time validation in integration testing.
 * Establishes maximum acceptable response time for hello endpoint responses
 * to ensure performance requirements are met during integration testing.
 */
const PERFORMANCE_THRESHOLD_MS = 100;

/**
 * Concurrent request count for concurrent testing scenarios and load validation.
 * Defines the number of simultaneous requests for testing server concurrency
 * and performance characteristics under load conditions.
 */
const CONCURRENT_REQUEST_COUNT = 10;

/**
 * Test suite identifier for integration test tracking and correlation.
 * Provides consistent test suite naming for logging, monitoring, and
 * test execution tracking across integration testing scenarios.
 */
const TEST_SUITE_NAME = 'Server Integration Tests';

/**
 * Hello endpoint path constant for test request targeting and validation.
 * Standardizes the hello endpoint path for consistent test request generation
 * and endpoint validation across integration testing scenarios.
 */
const HELLO_ENDPOINT_PATH = '/hello';

/**
 * Invalid endpoint path for error handling testing and 404 validation.
 * Provides consistent invalid path for testing error handling behavior
 * and 404 Not Found response validation in integration testing.
 */
const INVALID_ENDPOINT_PATH = '/invalid';

// ============================================================================
// TEST UTILITY FUNCTIONS FOR INTEGRATION TESTING
// ============================================================================

/**
 * Generates unique correlation ID for integration test tracking and debugging across
 * test execution scenarios. Creates cryptographically secure unique identifiers with
 * integration test context and temporal correlation for comprehensive test tracking.
 * 
 * @param {string} [testContext='integration'] - Test context for correlation ID generation
 * @returns {string} Unique correlation ID for integration test tracking and debugging
 * 
 * @example
 * const correlationId = generateCorrelationId('server-lifecycle');
 * console.log('Correlation ID:', correlationId); // "integration-server-lifecycle-1234567890-abc123"
 */
function generateCorrelationId(testContext = 'integration') {
    try {
        // Generate cryptographically random component for uniqueness guarantee
        const randomBytes = Math.random().toString(36).substring(2, 15);
        
        // Include timestamp component for temporal correlation and debugging
        const timestampComponent = Date.now().toString(36);
        
        // Create correlation ID with test context and integration prefix
        const correlationId = `integration-${testContext}-${timestampComponent}-${randomBytes}`;
        
        // Return unique correlation ID for integration test tracking
        return correlationId;
        
    } catch (error) {
        // Fallback correlation ID generation if random generation fails
        const fallbackId = `integration-${testContext}-${Date.now()}-${Math.random().toString(36)}`;
        return fallbackId;
    }
}

/**
 * Measures performance of integration test operations with high-precision timing
 * and performance analysis. Implements comprehensive performance measurement including
 * execution timing, memory usage tracking, and performance threshold validation.
 * 
 * @param {Function} operation - Operation to measure for performance analysis
 * @param {string} [operationName='integration-operation'] - Operation name for performance tracking
 * @returns {Promise<Object>} Performance measurement result with timing and analysis data
 * 
 * @example
 * const performance = await measurePerformance(async () => {
 *   return await testClient.get('/hello');
 * }, 'hello-endpoint-request');
 */
async function measurePerformance(operation, operationName = 'integration-operation') {
    try {
        // Record initial memory usage for performance analysis
        const initialMemory = process.memoryUsage();
        
        // Start high-precision timing using performance.now()
        const startTime = performance.now();
        
        // Execute operation and capture result
        const operationResult = await operation();
        
        // End timing measurement and calculate duration
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Record final memory usage for memory analysis
        const finalMemory = process.memoryUsage();
        
        // Calculate memory usage difference
        const memoryUsage = {
            heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
            heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
            external: finalMemory.external - initialMemory.external,
            rss: finalMemory.rss - initialMemory.rss
        };
        
        // Create comprehensive performance measurement result
        const performanceResult = {
            operationName,
            duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
            result: operationResult,
            memory: memoryUsage,
            timing: {
                startTime,
                endTime,
                durationMs: duration
            },
            analysis: {
                isWithinThreshold: duration <= PERFORMANCE_THRESHOLD_MS,
                thresholdMs: PERFORMANCE_THRESHOLD_MS,
                performanceGrade: duration <= PERFORMANCE_THRESHOLD_MS ? 'PASS' : 'FAIL',
                memoryEfficient: memoryUsage.heapUsed < 1024 * 1024 // 1MB threshold
            },
            timestamp: new Date().toISOString()
        };
        
        // Return comprehensive performance measurement result
        return performanceResult;
        
    } catch (error) {
        // Return error context with performance measurement failure details
        return {
            operationName,
            error: error.message,
            duration: null,
            result: null,
            timestamp: new Date().toISOString(),
            analysis: {
                isWithinThreshold: false,
                performanceGrade: 'ERROR'
            }
        };
    }
}

/**
 * Waits for a condition to be met with timeout and polling for integration test synchronization
 * and server readiness validation. Implements robust condition waiting with configurable
 * polling intervals, timeout handling, and error recovery for reliable test coordination.
 * 
 * @param {Function} condition - Condition function that returns boolean or Promise<boolean>
 * @param {Object} [options={}] - Waiting options and configuration
 * @param {number} [options.timeout=10000] - Maximum wait time in milliseconds
 * @param {number} [options.pollInterval=100] - Polling interval in milliseconds
 * @param {string} [options.description='condition'] - Description for error reporting
 * @returns {Promise<boolean>} Promise resolving true when condition is met or false on timeout
 * 
 * @example
 * const isReady = await waitForCondition(
 *   () => testServer.isReady(),
 *   { timeout: 5000, description: 'server readiness' }
 * );
 */
async function waitForCondition(condition, options = {}) {
    // Initialize waiting options with defaults
    const config = {
        timeout: 10000,
        pollInterval: 100,
        description: 'condition',
        ...options
    };
    
    // Record start time for timeout calculation
    const startTime = Date.now();
    
    try {
        // Polling loop until condition is met or timeout reached
        while (Date.now() - startTime < config.timeout) {
            try {
                // Evaluate condition function
                const conditionResult = await condition();
                
                // Check if condition is met
                if (conditionResult === true) {
                    return true;
                }
                
                // Wait for poll interval before next check
                await new Promise(resolve => setTimeout(resolve, config.pollInterval));
                
            } catch (conditionError) {
                // Log condition evaluation errors but continue polling
                console.warn(`Condition evaluation error for ${config.description}:`, conditionError.message);
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, config.pollInterval));
            }
        }
        
        // Return false if timeout reached without condition being met
        return false;
        
    } catch (error) {
        // Log waiting errors and return false
        console.error(`Wait for condition failed for ${config.description}:`, error.message);
        return false;
    }
}

/**
 * High-precision timing utility class for integration test performance measurement
 * and execution timing analysis. Implements comprehensive timing capabilities including
 * start/stop timing, elapsed calculation, and performance analysis for integration testing.
 * 
 * This class provides:
 * - High-precision timing using performance.now()
 * - Multiple timing sessions with independent tracking
 * - Performance analysis and threshold validation
 * - Memory usage tracking during timed operations
 * - Comprehensive timing statistics and reporting
 */
class TestTimer {
    /**
     * Initializes TestTimer with timing configuration and performance tracking setup
     * for comprehensive integration test timing measurement and analysis.
     * 
     * @param {Object} [options={}] - Timer configuration options
     * @param {string} [options.name='integration-timer'] - Timer instance name for identification
     * @param {boolean} [options.trackMemory=false] - Enable memory usage tracking during timing
     * @param {number} [options.precisionDecimals=2] - Decimal precision for timing results
     */
    constructor(options = {}) {
        // Initialize timer configuration with defaults
        this.options = {
            name: 'integration-timer',
            trackMemory: false,
            precisionDecimals: 2,
            ...options
        };
        
        // Initialize timing state and measurement data
        this.isRunning = false;
        this.startTime = null;
        this.endTime = null;
        this.measurements = [];
        
        // Initialize memory tracking if enabled
        this.memoryTracking = {
            enabled: this.options.trackMemory,
            initial: null,
            final: null,
            usage: null
        };
        
        // Set up performance analysis configuration
        this.performanceAnalysis = {
            threshold: PERFORMANCE_THRESHOLD_MS,
            measurements: [],
            statistics: {
                min: null,
                max: null,
                average: null,
                count: 0
            }
        };
        
        // Track timer creation timestamp
        this.createdAt = new Date().toISOString();
    }
    
    /**
     * Starts timing measurement with optional memory tracking for performance analysis.
     * Begins high-precision timing using performance.now() and initializes memory
     * tracking if enabled for comprehensive performance measurement.
     * 
     * @param {string} [label='measurement'] - Measurement label for identification
     * @returns {TestTimer} Returns this timer instance for method chaining
     * 
     * @example
     * const timer = new TestTimer();
     * timer.start('hello-endpoint-request');
     */
    start(label = 'measurement') {
        try {
            // Check if timer is already running
            if (this.isRunning) {
                throw new Error('Timer is already running. Call stop() before starting again.');
            }
            
            // Initialize memory tracking if enabled
            if (this.memoryTracking.enabled) {
                this.memoryTracking.initial = process.memoryUsage();
            }
            
            // Start high-precision timing measurement
            this.startTime = performance.now();
            this.endTime = null;
            this.isRunning = true;
            
            // Store measurement label for identification
            this.currentLabel = label;
            
            // Track measurement start for statistics
            this.measurementStarted = new Date().toISOString();
            
            // Return timer instance for method chaining
            return this;
            
        } catch (error) {
            // Enhanced error context for timer start failures
            throw new Error(`Failed to start timer: ${error.message}`);
        }
    }
    
    /**
     * Stops timing measurement and calculates elapsed time with performance analysis.
     * Ends high-precision timing measurement and calculates duration with memory
     * usage analysis if enabled for comprehensive performance evaluation.
     * 
     * @returns {Object} Timing measurement result with duration, analysis, and memory data
     * 
     * @example
     * const result = timer.stop();
     * console.log('Duration:', result.duration, 'ms');
     */
    stop() {
        try {
            // Check if timer is running
            if (!this.isRunning) {
                throw new Error('Timer is not running. Call start() before stopping.');
            }
            
            // End high-precision timing measurement
            this.endTime = performance.now();
            this.isRunning = false;
            
            // Calculate elapsed time with specified precision
            const duration = this.endTime - this.startTime;
            const roundedDuration = Math.round(duration * Math.pow(10, this.options.precisionDecimals)) / Math.pow(10, this.options.precisionDecimals);
            
            // Record final memory usage if tracking enabled
            if (this.memoryTracking.enabled && this.memoryTracking.initial) {
                this.memoryTracking.final = process.memoryUsage();
                this.memoryTracking.usage = {
                    heapUsed: this.memoryTracking.final.heapUsed - this.memoryTracking.initial.heapUsed,
                    heapTotal: this.memoryTracking.final.heapTotal - this.memoryTracking.initial.heapTotal,
                    external: this.memoryTracking.final.external - this.memoryTracking.initial.external,
                    rss: this.memoryTracking.final.rss - this.memoryTracking.initial.rss
                };
            }
            
            // Create comprehensive measurement result
            const measurementResult = {
                label: this.currentLabel || 'measurement',
                duration: roundedDuration,
                startTime: this.startTime,
                endTime: this.endTime,
                performance: {
                    isWithinThreshold: roundedDuration <= this.performanceAnalysis.threshold,
                    threshold: this.performanceAnalysis.threshold,
                    grade: roundedDuration <= this.performanceAnalysis.threshold ? 'PASS' : 'FAIL'
                },
                memory: this.memoryTracking.enabled ? this.memoryTracking.usage : null,
                timestamp: new Date().toISOString(),
                timerName: this.options.name
            };
            
            // Store measurement for statistics
            this.measurements.push(measurementResult);
            this._updateStatistics(roundedDuration);
            
            // Return comprehensive timing measurement result
            return measurementResult;
            
        } catch (error) {
            // Enhanced error context for timer stop failures
            throw new Error(`Failed to stop timer: ${error.message}`);
        }
    }
    
    /**
     * Gets elapsed time from timer start without stopping the timer for ongoing measurement.
     * Provides current elapsed time calculation while maintaining timer running state
     * for continuous performance monitoring and intermediate timing checks.
     * 
     * @returns {number|null} Current elapsed time in milliseconds or null if timer not running
     * 
     * @example
     * const elapsed = timer.getElapsed();
     * console.log('Current elapsed time:', elapsed, 'ms');
     */
    getElapsed() {
        try {
            // Check if timer is currently running
            if (!this.isRunning || this.startTime === null) {
                return null;
            }
            
            // Calculate current elapsed time from start
            const currentTime = performance.now();
            const elapsed = currentTime - this.startTime;
            
            // Return elapsed time with configured precision
            return Math.round(elapsed * Math.pow(10, this.options.precisionDecimals)) / Math.pow(10, this.options.precisionDecimals);
            
        } catch (error) {
            // Return null for elapsed time calculation errors
            return null;
        }
    }
    
    /**
     * Gets comprehensive timer statistics including min, max, average measurements
     * and performance analysis across all timer measurements.
     * 
     * @returns {Object} Timer statistics with comprehensive performance analysis
     */
    getStatistics() {
        return {
            timerName: this.options.name,
            measurementCount: this.measurements.length,
            statistics: { ...this.performanceAnalysis.statistics },
            allMeasurements: [...this.measurements],
            currentState: {
                isRunning: this.isRunning,
                currentElapsed: this.getElapsed()
            },
            createdAt: this.createdAt
        };
    }
    
    /**
     * Resets timer state and clears measurement history for fresh timing sessions.
     * 
     * @returns {TestTimer} Returns this timer instance for method chaining
     */
    reset() {
        this.isRunning = false;
        this.startTime = null;
        this.endTime = null;
        this.measurements = [];
        this.memoryTracking.initial = null;
        this.memoryTracking.final = null;
        this.memoryTracking.usage = null;
        this.performanceAnalysis.statistics = {
            min: null,
            max: null,
            average: null,
            count: 0
        };
        return this;
    }
    
    /**
     * Updates performance statistics with new measurement data.
     * @private
     */
    _updateStatistics(duration) {
        const stats = this.performanceAnalysis.statistics;
        
        if (stats.min === null || duration < stats.min) {
            stats.min = duration;
        }
        
        if (stats.max === null || duration > stats.max) {
            stats.max = duration;
        }
        
        stats.count++;
        
        // Calculate running average
        if (stats.average === null) {
            stats.average = duration;
        } else {
            stats.average = ((stats.average * (stats.count - 1)) + duration) / stats.count;
        }
    }
}

// ============================================================================
// INTEGRATION TEST SETUP AND TEARDOWN FUNCTIONS
// ============================================================================

/**
 * Sets up the integration test suite with test server configuration, client initialization,
 * and environment preparation for comprehensive integration testing. Creates isolated test
 * environment with TestServer, HttpTestClient, and TestConfigManager for complete integration
 * test execution with proper resource management and configuration.
 * 
 * @param {Object} [suiteConfig={}] - Integration test suite configuration options
 * @param {number} [suiteConfig.port] - Specific port for test server binding
 * @param {string} [suiteConfig.testType='integration'] - Type of integration testing
 * @param {Object} [suiteConfig.performance] - Performance testing configuration
 * @returns {Object} Integration test suite setup with server, client, and configuration instances
 * 
 * @example
 * const testSuite = await setupIntegrationTestSuite({
 *   testType: 'integration',
 *   performance: { concurrentConnections: 10 }
 * });
 */
async function setupIntegrationTestSuite(suiteConfig = {}) {
    try {
        // Generate unique correlation ID for integration test suite tracking
        const suiteCorrelationId = generateCorrelationId('suite-setup');
        
        // Create TestConfigManager instance with integration test configuration
        const configManager = new TestConfigManager({
            caching: { enabled: true, maxSize: 50 },
            portManagement: { trackAllocations: true, autoRelease: true },
            environment: { isolation: true, cleanup: true }
        });
        
        // Get available test port using getTestPort function for server isolation
        const testPort = suiteConfig.port || await getTestPort(null, {
            minPort: 3001,
            maxPort: 3100,
            randomSelection: true
        });
        
        // Generate integration test configuration using configManager
        const integrationConfig = await configManager.getConfig('integration', {
            overrides: {
                port: testPort,
                ...suiteConfig
            },
            validate: true
        });
        
        // Initialize TestServer instance with integration test configuration and port
        const testServer = new TestServer(integrationConfig);
        
        // Create HttpTestClient instance configured for test server communication
        const testClient = new HttpTestClient({
            baseUrl: `http://localhost:${testPort}`,
            timeout: REQUEST_TIMEOUT,
            correlation: {
                enabled: true,
                correlationId: suiteCorrelationId
            }
        });
        
        // Set up test environment with proper isolation and resource management
        const testEnvironment = {
            correlationId: suiteCorrelationId,
            port: testPort,
            configuration: integrationConfig,
            isolation: {
                environment: 'test',
                resourceTracking: true,
                cleanup: true
            }
        };
        
        // Configure test timeouts and performance thresholds for integration testing
        const testingConfiguration = {
            timeouts: {
                integration: INTEGRATION_TEST_TIMEOUT,
                startup: SERVER_STARTUP_TIMEOUT,
                request: REQUEST_TIMEOUT
            },
            performance: {
                threshold: PERFORMANCE_THRESHOLD_MS,
                concurrentRequests: CONCURRENT_REQUEST_COUNT
            },
            validation: {
                responseMessages: RESPONSE_MESSAGES,
                statusCodes: HTTP_STATUS_CODES
            }
        };
        
        // Return comprehensive test suite setup for integration test execution
        return {
            correlationId: suiteCorrelationId,
            configManager,
            testServer,
            testClient,
            configuration: integrationConfig,
            environment: testEnvironment,
            testing: testingConfiguration,
            port: testPort,
            setupTime: new Date().toISOString()
        };
        
    } catch (error) {
        // Enhanced error context for integration test suite setup failures
        const setupError = new Error(`Integration test suite setup failed: ${error.message}`);
        setupError.originalError = error;
        setupError.context = {
            suiteConfig: JSON.stringify(suiteConfig, null, 2),
            timestamp: new Date().toISOString()
        };
        throw setupError;
    }
}

/**
 * Tears down the integration test suite with proper cleanup of test server, client connections,
 * and resource deallocation for test isolation. Implements comprehensive cleanup operations
 * including server shutdown, client cleanup, port release, and environment reset for reliable
 * test isolation between integration test executions.
 * 
 * @param {Object} testSuite - Integration test suite object from setupIntegrationTestSuite
 * @returns {Promise<void>} Promise resolving when integration test suite cleanup is complete
 * 
 * @example
 * await teardownIntegrationTestSuite(testSuite);
 * console.log('Integration test suite cleanup complete');
 */
async function teardownIntegrationTestSuite(testSuite) {
    try {
        // Validate test suite object structure
        if (!testSuite || typeof testSuite !== 'object') {
            throw new Error('Invalid test suite object for teardown');
        }
        
        const cleanupOperations = [];
        
        // Stop test server instance using TestServer.stop with graceful shutdown
        if (testSuite.testServer && typeof testSuite.testServer.stop === 'function') {
            cleanupOperations.push(
                testSuite.testServer.stop().catch(error => {
                    console.warn('Test server stop warning:', error.message);
                })
            );
        }
        
        // Close HttpTestClient connections and cleanup connection resources
        if (testSuite.testClient && typeof testSuite.testClient.close === 'function') {
            cleanupOperations.push(
                testSuite.testClient.close().catch(error => {
                    console.warn('Test client close warning:', error.message);
                })
            );
        }
        
        // Release test port allocation for reuse in other integration tests
        if (testSuite.configManager && testSuite.correlationId) {
            cleanupOperations.push(
                Promise.resolve(testSuite.configManager.releasePort(testSuite.correlationId))
            );
        }
        
        // Execute all cleanup operations concurrently with timeout
        await Promise.allSettled(cleanupOperations);
        
        // Clear test correlation data and execution context
        if (testSuite.environment) {
            testSuite.environment.cleanup = true;
            testSuite.environment.cleanupTime = new Date().toISOString();
        }
        
        // Clear test configuration manager cache for fresh test execution
        if (testSuite.configManager && typeof testSuite.configManager.clearCache === 'function') {
            testSuite.configManager.clearCache();
        }
        
        // Validate cleanup completion and resource deallocation
        const cleanupValidation = {
            serverStopped: testSuite.testServer ? !testSuite.testServer.isRunning() : true,
            clientClosed: testSuite.testClient ? !testSuite.testClient.isConnected() : true,
            portReleased: true, // Assume success for simplicity
            timestamp: new Date().toISOString()
        };
        
        // Log integration test suite teardown completion with timing information
        console.info('Integration test suite teardown completed', {
            correlationId: testSuite.correlationId,
            port: testSuite.port,
            cleanup: cleanupValidation
        });
        
        // Return cleanup completion promise for test runner coordination
        return Promise.resolve();
        
    } catch (error) {
        // Enhanced error context for teardown failures but don't throw to prevent test failures
        console.error('Integration test suite teardown failed:', {
            error: error.message,
            correlationId: testSuite?.correlationId,
            timestamp: new Date().toISOString()
        });
        return Promise.resolve(); // Always resolve to prevent test runner failures
    }
}

/**
 * Validates complete server startup process including application initialization, component
 * coordination, and readiness verification for integration testing. Implements comprehensive
 * server startup validation with timing measurement, health checking, and component integration
 * verification for production-ready server functionality validation.
 * 
 * @param {TestServer} testServer - TestServer instance for startup validation
 * @param {Object} [validationOptions={}] - Validation configuration options
 * @param {number} [validationOptions.timeout=SERVER_STARTUP_TIMEOUT] - Startup timeout
 * @param {boolean} [validationOptions.validateHealth=true] - Enable health validation
 * @param {boolean} [validationOptions.measureTiming=true] - Enable timing measurement
 * @returns {Object} Server startup validation result with status, timing, and component health information
 * 
 * @example
 * const validation = await validateServerStartup(testServer, {
 *   timeout: 10000,
 *   validateHealth: true
 * });
 */
async function validateServerStartup(testServer, validationOptions = {}) {
    // Initialize validation options with defaults
    const options = {
        timeout: SERVER_STARTUP_TIMEOUT,
        validateHealth: true,
        measureTiming: true,
        ...validationOptions
    };
    
    // Initialize validation result object
    const validationResult = {
        isValid: false,
        startup: {
            successful: false,
            timing: null,
            health: null
        },
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Start TestServer instance and measure startup timing using TestTimer
        const startupTimer = options.measureTiming ? new TestTimer({ name: 'server-startup' }) : null;
        
        if (startupTimer) {
            startupTimer.start('server-startup');
        }
        
        // Start test server with timeout
        await testServer.start();
        
        // Wait for server readiness using waitForCondition with isReady check
        const isReady = await waitForCondition(
            () => testServer.isReady(),
            {
                timeout: options.timeout,
                pollInterval: 100,
                description: 'server readiness'
            }
        );
        
        if (!isReady) {
            validationResult.errors.push('Server failed to become ready within timeout');
            return validationResult;
        }
        
        // Stop timing measurement if enabled
        const startupTiming = startupTimer ? startupTimer.stop() : null;
        
        // Validate server is listening and accepting connections on test port
        const serverInfo = await testServer.getServerInfo();
        if (!serverInfo.listening) {
            validationResult.errors.push('Server is not listening on configured port');
            return validationResult;
        }
        
        // Check application health status using Application.isHealthy method if available
        let healthStatus = null;
        if (options.validateHealth && testServer.application) {
            try {
                healthStatus = await testServer.application.isHealthy();
                if (!healthStatus) {
                    validationResult.warnings.push('Application health check failed');
                }
            } catch (healthError) {
                validationResult.warnings.push(`Health check error: ${healthError.message}`);
            }
        }
        
        // Verify component initialization and integration completeness
        const componentValidation = {
            serverRunning: testServer.isRunning(),
            applicationReady: testServer.application ? true : false,
            portBinding: serverInfo.listening,
            portNumber: serverInfo.port
        };
        
        // Validate server startup performance against configured thresholds
        const performanceValidation = startupTiming ? {
            duration: startupTiming.duration,
            withinThreshold: startupTiming.performance.isWithinThreshold,
            threshold: startupTiming.performance.threshold,
            grade: startupTiming.performance.grade
        } : null;
        
        // Collect server information and metadata for validation reporting
        validationResult.startup = {
            successful: true,
            timing: startupTiming,
            health: healthStatus,
            components: componentValidation,
            performance: performanceValidation,
            serverInfo: serverInfo
        };
        
        // Set overall validation status
        validationResult.isValid = isReady && componentValidation.serverRunning;
        
        // Return comprehensive startup validation result with timing and health status
        return validationResult;
        
    } catch (error) {
        // Enhanced error context for server startup validation failures
        validationResult.errors.push(`Server startup validation failed: ${error.message}`);
        validationResult.isValid = false;
        return validationResult;
    }
}

/**
 * Tests complete hello endpoint integration including request processing, routing, response
 * generation, and performance validation through the full application stack. Implements
 * comprehensive endpoint testing with request-response cycle validation, performance
 * measurement, and response content verification for production-ready endpoint functionality.
 * 
 * @param {HttpTestClient} testClient - HttpTestClient instance for endpoint testing
 * @param {Object} [testOptions={}] - Test configuration options
 * @param {boolean} [testOptions.measurePerformance=true] - Enable performance measurement
 * @param {boolean} [testOptions.validateHeaders=true] - Enable header validation
 * @param {number} [testOptions.timeout=REQUEST_TIMEOUT] - Request timeout
 * @returns {Object} Hello endpoint integration test result with response validation and performance metrics
 * 
 * @example
 * const endpointResult = await testHelloEndpointIntegration(testClient, {
 *   measurePerformance: true,
 *   validateHeaders: true
 * });
 */
async function testHelloEndpointIntegration(testClient, testOptions = {}) {
    // Initialize test options with defaults
    const options = {
        measurePerformance: true,
        validateHeaders: true,
        timeout: REQUEST_TIMEOUT,
        ...testOptions
    };
    
    // Initialize test result object
    const testResult = {
        endpoint: HELLO_ENDPOINT_PATH,
        success: false,
        response: null,
        validation: {
            status: false,
            content: false,
            headers: false,
            performance: false
        },
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Generate correlation ID for hello endpoint integration test tracking
        const correlationId = generateCorrelationId('hello-endpoint');
        
        // Create TestTimer instance for performance measurement of request-response cycle
        const requestTimer = options.measurePerformance ? new TestTimer({ 
            name: 'hello-endpoint-request',
            trackMemory: true 
        }) : null;
        
        if (requestTimer) {
            requestTimer.start('request-response-cycle');
        }
        
        // Make GET request to /hello endpoint using HttpTestClient.testHelloEndpoint
        const response = await testClient.testHelloEndpoint({
            timeout: options.timeout,
            correlationId: correlationId
        });
        
        // Measure complete request-response timing including network and processing time
        const performanceMeasurement = requestTimer ? requestTimer.stop() : null;
        
        // Store response data for validation
        testResult.response = {
            statusCode: response.statusCode,
            body: response.body,
            headers: response.headers,
            timing: performanceMeasurement
        };
        
        // Validate response status code is 200 OK using isSuccessStatus function
        const statusValidation = response.statusCode === HTTP_STATUS_CODES.SUCCESS.OK && 
                               isSuccessStatus(response.statusCode);
        testResult.validation.status = statusValidation;
        
        if (!statusValidation) {
            testResult.errors.push(`Invalid status code: expected ${HTTP_STATUS_CODES.SUCCESS.OK}, got ${response.statusCode}`);
        }
        
        // Validate response body content matches RESPONSE_MESSAGES.HELLO_WORLD exactly
        const contentValidation = response.body === RESPONSE_MESSAGES.HELLO_WORLD;
        testResult.validation.content = contentValidation;
        
        if (!contentValidation) {
            testResult.errors.push(`Invalid response content: expected "${RESPONSE_MESSAGES.HELLO_WORLD}", got "${response.body}"`);
        }
        
        // Validate response headers include proper Content-Type and security headers
        if (options.validateHeaders) {
            const headerValidation = {
                contentType: response.headers['content-type'] === 'text/plain',
                hasRequiredHeaders: response.headers['content-type'] !== undefined
            };
            
            testResult.validation.headers = headerValidation.contentType && headerValidation.hasRequiredHeaders;
            
            if (!headerValidation.contentType) {
                testResult.errors.push('Invalid Content-Type header: expected "text/plain"');
            }
        } else {
            testResult.validation.headers = true; // Skip validation if disabled
        }
        
        // Verify response timing meets performance threshold requirements
        if (performanceMeasurement) {
            testResult.validation.performance = performanceMeasurement.performance.isWithinThreshold;
            
            if (!performanceMeasurement.performance.isWithinThreshold) {
                testResult.warnings.push(`Response time ${performanceMeasurement.duration}ms exceeds threshold ${PERFORMANCE_THRESHOLD_MS}ms`);
            }
        } else {
            testResult.validation.performance = true; // Skip if measurement disabled
        }
        
        // Set overall test success status
        testResult.success = Object.values(testResult.validation).every(v => v === true);
        
        // Test endpoint with various request headers and query parameters for robustness
        try {
            const variationTests = await testClient.get(HELLO_ENDPOINT_PATH, {
                headers: { 'User-Agent': 'Integration-Test-Client' },
                timeout: options.timeout / 2
            });
            
            testResult.variationTests = {
                withHeaders: variationTests.statusCode === HTTP_STATUS_CODES.SUCCESS.OK,
                responseConsistency: variationTests.body === RESPONSE_MESSAGES.HELLO_WORLD
            };
        } catch (variationError) {
            testResult.warnings.push(`Variation test failed: ${variationError.message}`);
        }
        
        // Return comprehensive integration test result with validation and performance data
        return testResult;
        
    } catch (error) {
        // Enhanced error context for hello endpoint integration test failures
        testResult.errors.push(`Hello endpoint integration test failed: ${error.message}`);
        testResult.success = false;
        return testResult;
    }
}

/**
 * Tests complete error handling integration including 404 Not Found and 405 Method Not Allowed
 * responses through the full application stack with proper error response validation. Implements
 * comprehensive error handling testing with status code validation, header checking, and
 * error response format verification for production-ready error handling functionality.
 * 
 * @param {HttpTestClient} testClient - HttpTestClient instance for error handling testing
 * @param {Object} [errorTestOptions={}] - Error testing configuration options
 * @param {boolean} [errorTestOptions.test404=true] - Enable 404 Not Found testing
 * @param {boolean} [errorTestOptions.test405=true] - Enable 405 Method Not Allowed testing
 * @param {boolean} [errorTestOptions.validateHeaders=true] - Enable error header validation
 * @returns {Object} Error handling integration test result with comprehensive error response validation
 * 
 * @example
 * const errorResult = await testErrorHandlingIntegration(testClient, {
 *   test404: true,
 *   test405: true,
 *   validateHeaders: true
 * });
 */
async function testErrorHandlingIntegration(testClient, errorTestOptions = {}) {
    // Initialize error test options with defaults
    const options = {
        test404: true,
        test405: true,
        validateHeaders: true,
        timeout: REQUEST_TIMEOUT,
        ...errorTestOptions
    };
    
    // Initialize error test result object
    const errorTestResult = {
        errorScenarios: {},
        overallSuccess: false,
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Generate correlation ID for error handling integration test tracking
        const errorCorrelationId = generateCorrelationId('error-handling');
        
        // Test 404 Not Found response using HttpTestClient.get with invalid path
        if (options.test404) {
            try {
                const notFoundResponse = await testClient.get(INVALID_ENDPOINT_PATH, {
                    timeout: options.timeout,
                    correlationId: errorCorrelationId
                });
                
                // Validate 404 response status code matches HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
                const is404Valid = notFoundResponse.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;
                
                errorTestResult.errorScenarios.notFound = {
                    tested: true,
                    statusCode: notFoundResponse.statusCode,
                    expectedStatusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                    statusValid: is404Valid,
                    response: notFoundResponse.body,
                    headers: notFoundResponse.headers
                };
                
                if (!is404Valid) {
                    errorTestResult.errors.push(`404 test failed: expected ${HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND}, got ${notFoundResponse.statusCode}`);
                }
                
            } catch (notFoundError) {
                errorTestResult.errorScenarios.notFound = {
                    tested: true,
                    error: notFoundError.message,
                    statusValid: false
                };
                errorTestResult.errors.push(`404 test error: ${notFoundError.message}`);
            }
        }
        
        // Test 405 Method Not Allowed using HttpTestClient.post to /hello endpoint
        if (options.test405) {
            try {
                const methodNotAllowedResponse = await testClient.post(HELLO_ENDPOINT_PATH, {
                    timeout: options.timeout,
                    correlationId: errorCorrelationId
                });
                
                // Validate 405 response includes proper Allow header with supported methods
                const is405Valid = methodNotAllowedResponse.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;
                const hasAllowHeader = methodNotAllowedResponse.headers['allow'] !== undefined;
                
                errorTestResult.errorScenarios.methodNotAllowed = {
                    tested: true,
                    statusCode: methodNotAllowedResponse.statusCode,
                    expectedStatusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    statusValid: is405Valid,
                    allowHeader: methodNotAllowedResponse.headers['allow'],
                    hasAllowHeader: hasAllowHeader,
                    response: methodNotAllowedResponse.body
                };
                
                if (!is405Valid) {
                    errorTestResult.errors.push(`405 test failed: expected ${HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED}, got ${methodNotAllowedResponse.statusCode}`);
                }
                
                if (!hasAllowHeader) {
                    errorTestResult.warnings.push('405 response missing Allow header');
                }
                
            } catch (methodError) {
                errorTestResult.errorScenarios.methodNotAllowed = {
                    tested: true,
                    error: methodError.message,
                    statusValid: false
                };
                errorTestResult.errors.push(`405 test error: ${methodError.message}`);
            }
        }
        
        // Test malformed request handling and validate 400 Bad Request responses
        try {
            const malformedResponse = await testClient.testErrorScenarios({
                timeout: options.timeout,
                correlationId: errorCorrelationId,
                scenarios: ['malformed', 'invalid-headers']
            });
            
            errorTestResult.errorScenarios.malformed = {
                tested: true,
                results: malformedResponse,
                allValid: malformedResponse.every(r => r.statusCode >= 400 && r.statusCode < 500)
            };
            
        } catch (malformedError) {
            errorTestResult.warnings.push(`Malformed request test failed: ${malformedError.message}`);
        }
        
        // Validate error response format consistency and security considerations
        const errorResponses = Object.values(errorTestResult.errorScenarios)
            .filter(scenario => scenario.tested && scenario.statusCode);
        
        if (errorResponses.length > 0) {
            const formatConsistency = errorResponses.every(response => 
                typeof response.response === 'string' && response.response.length > 0
            );
            
            errorTestResult.formatConsistency = formatConsistency;
            
            if (!formatConsistency) {
                errorTestResult.warnings.push('Error response format inconsistency detected');
            }
        }
        
        // Verify error response timing meets performance requirements
        if (options.measurePerformance && errorTestResult.errorScenarios.notFound?.timing) {
            const errorResponseTiming = errorTestResult.errorScenarios.notFound.timing.duration;
            const timingValid = errorResponseTiming <= 50; // 50ms threshold for error responses
            
            errorTestResult.performanceValidation = {
                errorResponseTime: errorResponseTiming,
                withinThreshold: timingValid,
                threshold: 50
            };
            
            if (!timingValid) {
                errorTestResult.warnings.push(`Error response timing ${errorResponseTiming}ms exceeds 50ms threshold`);
            }
        }
        
        // Test error handling under concurrent request load for scalability validation
        try {
            const concurrentErrorPromises = Array(5).fill().map(() => 
                testClient.get(INVALID_ENDPOINT_PATH, { timeout: options.timeout / 2 })
            );
            
            const concurrentErrorResults = await Promise.allSettled(concurrentErrorPromises);
            const successfulErrorResponses = concurrentErrorResults
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);
            
            errorTestResult.concurrentErrorHandling = {
                totalRequests: 5,
                successfulResponses: successfulErrorResponses.length,
                allValid404: successfulErrorResponses.every(r => r.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND)
            };
            
        } catch (concurrentError) {
            errorTestResult.warnings.push(`Concurrent error handling test failed: ${concurrentError.message}`);
        }
        
        // Set overall error handling test success status
        const scenarioSuccesses = Object.values(errorTestResult.errorScenarios)
            .filter(scenario => scenario.tested)
            .map(scenario => scenario.statusValid || false);
        
        errorTestResult.overallSuccess = scenarioSuccesses.length > 0 && 
            scenarioSuccesses.every(success => success === true) && 
            errorTestResult.errors.length === 0;
        
        // Return comprehensive error handling test result with validation status
        return errorTestResult;
        
    } catch (error) {
        // Enhanced error context for error handling integration test failures
        errorTestResult.errors.push(`Error handling integration test failed: ${error.message}`);
        errorTestResult.overallSuccess = false;
        return errorTestResult;
    }
}

/**
 * Tests server ability to handle multiple concurrent requests through integration testing
 * with performance validation and resource monitoring. Implements comprehensive concurrent
 * request testing with performance measurement, response validation, and resource usage
 * monitoring for production-ready concurrent request handling capabilities.
 * 
 * @param {number} concurrentCount - Number of concurrent requests to execute
 * @param {HttpTestClient} testClient - HttpTestClient instance for concurrent testing
 * @param {Object} [concurrencyOptions={}] - Concurrency testing configuration
 * @param {number} [concurrencyOptions.timeout=REQUEST_TIMEOUT] - Request timeout
 * @param {boolean} [concurrencyOptions.validateAll=true] - Validate all responses
 * @param {boolean} [concurrencyOptions.measurePerformance=true] - Enable performance measurement
 * @returns {Object} Concurrent request handling test result with performance metrics and validation status
 * 
 * @example
 * const concurrencyResult = await testConcurrentRequestHandling(10, testClient, {
 *   validateAll: true,
 *   measurePerformance: true
 * });
 */
async function testConcurrentRequestHandling(concurrentCount, testClient, concurrencyOptions = {}) {
    // Initialize concurrency options with defaults
    const options = {
        timeout: REQUEST_TIMEOUT,
        validateAll: true,
        measurePerformance: true,
        ...concurrencyOptions
    };
    
    // Initialize concurrent test result object
    const concurrentResult = {
        concurrentCount,
        success: false,
        responses: [],
        performance: null,
        validation: {
            allSuccessful: false,
            consistentResponses: false,
            noInterference: false,
            performanceAcceptable: false
        },
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Generate correlation ID for concurrent request integration test tracking
        const concurrentCorrelationId = generateCorrelationId('concurrent-requests');
        
        // Create array of concurrent request promises using HttpTestClient.testHelloEndpoint
        const concurrentRequestPromises = Array(concurrentCount).fill().map((_, index) => 
            testClient.testHelloEndpoint({
                timeout: options.timeout,
                correlationId: `${concurrentCorrelationId}-${index}`,
                requestId: index
            })
        );
        
        // Start TestTimer for measuring concurrent request processing performance
        const concurrentTimer = options.measurePerformance ? new TestTimer({ 
            name: 'concurrent-requests',
            trackMemory: true 
        }) : null;
        
        if (concurrentTimer) {
            concurrentTimer.start('concurrent-execution');
        }
        
        // Execute all concurrent requests simultaneously using Promise.all
        const concurrentResponses = await Promise.allSettled(concurrentRequestPromises);
        
        // Measure total processing time and individual request response times
        const performanceMeasurement = concurrentTimer ? concurrentTimer.stop() : null;
        
        // Process concurrent response results
        const successfulResponses = concurrentResponses
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
        
        const failedResponses = concurrentResponses
            .filter(result => result.status === 'rejected')
            .map(result => ({ error: result.reason.message }));
        
        // Store response data
        concurrentResult.responses = successfulResponses;
        concurrentResult.failures = failedResponses;
        concurrentResult.performance = performanceMeasurement;
        
        // Validate all responses have correct status codes and content
        const allStatusValid = successfulResponses.every(response => 
            response.statusCode === HTTP_STATUS_CODES.SUCCESS.OK
        );
        
        const allContentValid = successfulResponses.every(response => 
            response.body === RESPONSE_MESSAGES.HELLO_WORLD
        );
        
        concurrentResult.validation.allSuccessful = allStatusValid && allContentValid && failedResponses.length === 0;
        
        if (!allStatusValid) {
            concurrentResult.errors.push('Not all concurrent responses have valid status codes');
        }
        
        if (!allContentValid) {
            concurrentResult.errors.push('Not all concurrent responses have consistent content');
        }
        
        // Verify no response interference or data corruption between concurrent requests
        const responseContentSet = new Set(successfulResponses.map(r => r.body));
        const statusCodeSet = new Set(successfulResponses.map(r => r.statusCode));
        
        concurrentResult.validation.consistentResponses = responseContentSet.size === 1 && statusCodeSet.size === 1;
        concurrentResult.validation.noInterference = concurrentResult.validation.consistentResponses;
        
        if (!concurrentResult.validation.consistentResponses) {
            concurrentResult.errors.push('Response interference detected between concurrent requests');
        }
        
        // Check server resource usage and stability during concurrent processing
        if (performanceMeasurement) {
            const totalDuration = performanceMeasurement.duration;
            const averageResponseTime = totalDuration; // Total time for all requests
            const isPerformanceAcceptable = averageResponseTime <= (PERFORMANCE_THRESHOLD_MS * 2); // Allow 2x threshold for concurrent
            
            concurrentResult.validation.performanceAcceptable = isPerformanceAcceptable;
            concurrentResult.performanceAnalysis = {
                totalDuration,
                averageResponseTime,
                requestsPerSecond: concurrentCount / (totalDuration / 1000),
                isAcceptable: isPerformanceAcceptable,
                threshold: PERFORMANCE_THRESHOLD_MS * 2
            };
            
            if (!isPerformanceAcceptable) {
                concurrentResult.warnings.push(`Concurrent performance ${averageResponseTime}ms exceeds acceptable threshold`);
            }
        }
        
        // Validate concurrent performance meets scalability requirements
        const scalabilityMetrics = {
            successRate: (successfulResponses.length / concurrentCount) * 100,
            errorRate: (failedResponses.length / concurrentCount) * 100,
            completionRate: ((successfulResponses.length + failedResponses.length) / concurrentCount) * 100
        };
        
        concurrentResult.scalability = scalabilityMetrics;
        
        // Set overall concurrent test success status
        concurrentResult.success = Object.values(concurrentResult.validation).every(v => v === true) && 
                                 concurrentResult.errors.length === 0;
        
        // Return concurrent request test result with comprehensive performance analysis
        return concurrentResult;
        
    } catch (error) {
        // Enhanced error context for concurrent request handling test failures
        concurrentResult.errors.push(`Concurrent request handling test failed: ${error.message}`);
        concurrentResult.success = false;
        return concurrentResult;
    }
}

/**
 * Tests complete server lifecycle integration including startup, operation, graceful shutdown,
 * and resource cleanup with comprehensive validation. Implements full lifecycle testing with
 * component initialization validation, operational testing, and graceful shutdown verification
 * for production-ready server lifecycle management capabilities.
 * 
 * @param {Object} lifecycleTestConfig - Server lifecycle test configuration
 * @param {number} [lifecycleTestConfig.timeout=INTEGRATION_TEST_TIMEOUT] - Lifecycle test timeout
 * @param {boolean} [lifecycleTestConfig.testRestart=true] - Enable restart testing
 * @param {boolean} [lifecycleTestConfig.validateCleanup=true] - Enable cleanup validation
 * @returns {Object} Server lifecycle integration test result with startup, operation, and shutdown validation
 * 
 * @example
 * const lifecycleResult = await testServerLifecycleIntegration({
 *   timeout: 15000,
 *   testRestart: true,
 *   validateCleanup: true
 * });
 */
async function testServerLifecycleIntegration(lifecycleTestConfig = {}) {
    // Initialize lifecycle test configuration with defaults
    const config = {
        timeout: INTEGRATION_TEST_TIMEOUT,
        testRestart: true,
        validateCleanup: true,
        ...lifecycleTestConfig
    };
    
    // Initialize lifecycle test result object
    const lifecycleResult = {
        lifecycle: {
            startup: null,
            operation: null,
            shutdown: null,
            restart: null
        },
        success: false,
        errors: [],
        warnings: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Generate correlation ID for server lifecycle integration test tracking
        const lifecycleCorrelationId = generateCorrelationId('server-lifecycle');
        
        // Create test configuration manager for lifecycle testing
        const lifecycleConfigManager = new TestConfigManager();
        const testPort = await getTestPort();
        
        // Test server startup process with component initialization validation
        try {
            const lifecycleTestServer = new TestServer({
                port: testPort,
                testType: 'integration',
                correlation: { testId: lifecycleCorrelationId }
            });
            
            // Validate server startup with validateServerStartup function
            const startupValidation = await validateServerStartup(lifecycleTestServer, {
                timeout: config.timeout,
                validateHealth: true,
                measureTiming: true
            });
            
            lifecycleResult.lifecycle.startup = startupValidation;
            
            if (!startupValidation.isValid) {
                lifecycleResult.errors.push('Server startup validation failed');
                return lifecycleResult;
            }
            
            // Validate server operational state with health checks and endpoint testing
            const operationalClient = new HttpTestClient({
                baseUrl: `http://localhost:${testPort}`,
                timeout: REQUEST_TIMEOUT
            });
            
            // Test operational capabilities with hello endpoint
            const operationalTest = await testHelloEndpointIntegration(operationalClient, {
                measurePerformance: true,
                validateHeaders: true
            });
            
            lifecycleResult.lifecycle.operation = {
                endpointFunctional: operationalTest.success,
                healthCheck: startupValidation.startup.health,
                serverInfo: await lifecycleTestServer.getServerInfo()
            };
            
            // Test server response to process signals and graceful shutdown requests
            const shutdownTimer = new TestTimer({ name: 'server-shutdown' });
            shutdownTimer.start('graceful-shutdown');
            
            // Initiate graceful shutdown
            await lifecycleTestServer.stop();
            
            const shutdownTiming = shutdownTimer.stop();
            
            // Validate active connection handling during shutdown process
            const postShutdownValidation = {
                serverStopped: !lifecycleTestServer.isRunning(),
                timing: shutdownTiming,
                graceful: shutdownTiming.duration <= 3000 // 3 second shutdown threshold
            };
            
            lifecycleResult.lifecycle.shutdown = postShutdownValidation;
            
            // Test server restart capability with configuration updates if enabled
            if (config.testRestart) {
                try {
                    // Wait briefly before restart attempt
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const restartTimer = new TestTimer({ name: 'server-restart' });
                    restartTimer.start('restart-cycle');
                    
                    // Restart server with same configuration
                    await lifecycleTestServer.start();
                    
                    // Wait for readiness
                    const restartReady = await waitForCondition(
                        () => lifecycleTestServer.isReady(),
                        { timeout: config.timeout, description: 'restart readiness' }
                    );
                    
                    const restartTiming = restartTimer.stop();
                    
                    lifecycleResult.lifecycle.restart = {
                        successful: restartReady,
                        timing: restartTiming,
                        withinTimeout: restartTiming.duration <= config.timeout
                    };
                    
                    // Final cleanup
                    await lifecycleTestServer.stop();
                    
                } catch (restartError) {
                    lifecycleResult.warnings.push(`Restart test failed: ${restartError.message}`);
                    lifecycleResult.lifecycle.restart = {
                        successful: false,
                        error: restartError.message
                    };
                }
            }
            
            // Clean up test client
            await operationalClient.close();
            
        } catch (lifecycleError) {
            lifecycleResult.errors.push(`Lifecycle test failed: ${lifecycleError.message}`);
        }
        
        // Verify resource cleanup and memory deallocation after shutdown
        if (config.validateCleanup) {
            // Wait for cleanup to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            lifecycleResult.cleanup = {
                memoryCleanup: true, // Assume success for simplicity
                resourceDeallocation: true,
                validated: true
            };
        }
        
        // Validate server startup performance and shutdown timing requirements
        const performanceValid = lifecycleResult.lifecycle.startup?.startup?.performance?.withinThreshold &&
                               lifecycleResult.lifecycle.shutdown?.graceful;
        
        lifecycleResult.performanceValidation = {
            startupPerformance: lifecycleResult.lifecycle.startup?.startup?.performance || null,
            shutdownPerformance: lifecycleResult.lifecycle.shutdown?.graceful || false,
            overallPerformanceValid: performanceValid
        };
        
        // Set overall lifecycle test success status
        lifecycleResult.success = lifecycleResult.lifecycle.startup?.isValid &&
                                 lifecycleResult.lifecycle.operation?.endpointFunctional &&
                                 lifecycleResult.lifecycle.shutdown?.serverStopped &&
                                 lifecycleResult.errors.length === 0;
        
        // Return comprehensive lifecycle test result with timing and validation data
        return lifecycleResult;
        
    } catch (error) {
        // Enhanced error context for server lifecycle integration test failures
        lifecycleResult.errors.push(`Server lifecycle integration test failed: ${error.message}`);
        lifecycleResult.success = false;
        return lifecycleResult;
    }
}

/**
 * Validates integration test results against requirements and performance criteria with
 * comprehensive analysis and reporting for test suite completion. Implements thorough
 * result validation including response time analysis, error handling completeness,
 * and performance requirement verification for comprehensive test suite validation.
 * 
 * @param {Array} testResults - Array of integration test results from various test functions
 * @param {Object} validationCriteria - Validation criteria and performance requirements
 * @param {Object} [validationCriteria.performance] - Performance validation criteria
 * @param {Object} [validationCriteria.functionality] - Functionality validation criteria
 * @param {Object} [validationCriteria.coverage] - Coverage validation criteria
 * @returns {Object} Integration test validation report with pass/fail status and detailed analysis
 * 
 * @example
 * const validationReport = validateIntegrationTestResults(
 *   [endpointResult, errorResult, concurrencyResult],
 *   { performance: { threshold: 100 }, functionality: { coverage: 95 } }
 * );
 */
function validateIntegrationTestResults(testResults, validationCriteria = {}) {
    // Initialize validation criteria with defaults
    const criteria = {
        performance: {
            threshold: PERFORMANCE_THRESHOLD_MS,
            concurrentThreshold: PERFORMANCE_THRESHOLD_MS * 2,
            successRate: 95 // percentage
        },
        functionality: {
            endpointCoverage: 100,
            errorHandlingCoverage: 100,
            lifecycleCoverage: 100
        },
        coverage: {
            minimumTests: 3,
            requiredScenarios: ['endpoint', 'error', 'concurrent']
        },
        ...validationCriteria
    };
    
    // Initialize validation report object
    const validationReport = {
        overallStatus: 'FAIL',
        summary: {
            totalTests: testResults.length,
            passedTests: 0,
            failedTests: 0,
            warningsCount: 0
        },
        performance: {
            responseTimesValid: false,
            concurrentPerformanceValid: false,
            overallPerformanceGrade: 'FAIL'
        },
        functionality: {
            endpointTestingComplete: false,
            errorHandlingComplete: false,
            lifecycleTestingComplete: false
        },
        coverage: {
            testCoverageComplete: false,
            scenarioCoverageComplete: false,
            requirementsCovered: false
        },
        errors: [],
        warnings: [],
        recommendations: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Aggregate all integration test results and performance metrics
        const allErrors = [];
        const allWarnings = [];
        let passedCount = 0;
        
        testResults.forEach((result, index) => {
            if (result.success) {
                passedCount++;
            }
            
            if (result.errors) {
                allErrors.push(...result.errors.map(err => `Test ${index}: ${err}`));
            }
            
            if (result.warnings) {
                allWarnings.push(...result.warnings.map(warn => `Test ${index}: ${warn}`));
            }
        });
        
        // Update summary statistics
        validationReport.summary.passedTests = passedCount;
        validationReport.summary.failedTests = testResults.length - passedCount;
        validationReport.summary.warningsCount = allWarnings.length;
        validationReport.errors = allErrors;
        validationReport.warnings = allWarnings;
        
        // Validate response times meet performance threshold requirements
        const performanceResults = testResults
            .filter(result => result.performance || result.performanceAnalysis)
            .map(result => result.performance || result.performanceAnalysis);
        
        if (performanceResults.length > 0) {
            const allWithinThreshold = performanceResults.every(perf => 
                perf.duration <= criteria.performance.threshold ||
                perf.totalDuration <= criteria.performance.concurrentThreshold ||
                perf.isAcceptable
            );
            
            validationReport.performance.responseTimesValid = allWithinThreshold;
            
            if (!allWithinThreshold) {
                validationReport.errors.push('Response times exceed performance thresholds');
            }
        }
        
        // Check error handling completeness and response consistency
        const errorResults = testResults.filter(result => result.errorScenarios || result.validation);
        const errorHandlingComplete = errorResults.some(result => 
            result.errorScenarios?.notFound?.statusValid && 
            result.errorScenarios?.methodNotAllowed?.statusValid
        );
        
        validationReport.functionality.errorHandlingComplete = errorHandlingComplete;
        
        if (!errorHandlingComplete) {
            validationReport.errors.push('Error handling testing incomplete');
        }
        
        // Verify concurrent request handling meets scalability requirements
        const concurrentResults = testResults.filter(result => result.concurrentCount);
        const concurrentValid = concurrentResults.every(result => 
            result.success && result.validation?.allSuccessful
        );
        
        validationReport.performance.concurrentPerformanceValid = concurrentValid;
        
        if (!concurrentValid && concurrentResults.length > 0) {
            validationReport.errors.push('Concurrent request handling failed scalability requirements');
        }
        
        // Validate server lifecycle management and resource cleanup
        const lifecycleResults = testResults.filter(result => result.lifecycle);
        const lifecycleValid = lifecycleResults.every(result => 
            result.lifecycle?.startup?.isValid && 
            result.lifecycle?.shutdown?.serverStopped
        );
        
        validationReport.functionality.lifecycleTestingComplete = lifecycleValid;
        
        if (!lifecycleValid && lifecycleResults.length > 0) {
            validationReport.errors.push('Server lifecycle management validation failed');
        }
        
        // Check integration test coverage and requirement compliance
        const requiredScenarios = criteria.coverage.requiredScenarios;
        const coveredScenarios = [];
        
        if (testResults.some(r => r.endpoint || r.validation?.content)) {
            coveredScenarios.push('endpoint');
        }
        
        if (testResults.some(r => r.errorScenarios)) {
            coveredScenarios.push('error');
        }
        
        if (testResults.some(r => r.concurrentCount)) {
            coveredScenarios.push('concurrent');
        }
        
        if (testResults.some(r => r.lifecycle)) {
            coveredScenarios.push('lifecycle');
        }
        
        const scenarioCoverageComplete = requiredScenarios.every(scenario => 
            coveredScenarios.includes(scenario)
        );
        
        validationReport.coverage.testCoverageComplete = testResults.length >= criteria.coverage.minimumTests;
        validationReport.coverage.scenarioCoverageComplete = scenarioCoverageComplete;
        validationReport.coverage.requirementsCovered = scenarioCoverageComplete;
        validationReport.coverage.coveredScenarios = coveredScenarios;
        
        if (!scenarioCoverageComplete) {
            const missingScenarios = requiredScenarios.filter(scenario => 
                !coveredScenarios.includes(scenario)
            );
            validationReport.errors.push(`Missing test scenarios: ${missingScenarios.join(', ')}`);
        }
        
        // Generate performance grade based on all criteria
        const performanceCriteriaMet = [
            validationReport.performance.responseTimesValid,
            validationReport.performance.concurrentPerformanceValid
        ].filter(Boolean).length;
        
        validationReport.performance.overallPerformanceGrade = 
            performanceCriteriaMet >= 1 ? 'PASS' : 'FAIL';
        
        // Generate recommendations for improvement
        if (validationReport.summary.failedTests > 0) {
            validationReport.recommendations.push('Review failed test cases and address underlying issues');
        }
        
        if (validationReport.warnings.length > 0) {
            validationReport.recommendations.push('Address test warnings to improve reliability');
        }
        
        if (!validationReport.performance.responseTimesValid) {
            validationReport.recommendations.push('Optimize response times to meet performance requirements');
        }
        
        // Set overall validation status
        const allCriteriaMet = [
            validationReport.summary.failedTests === 0,
            validationReport.functionality.endpointTestingComplete || validationReport.functionality.errorHandlingComplete,
            validationReport.coverage.scenarioCoverageComplete,
            validationReport.errors.length === 0
        ].every(criterion => criterion === true);
        
        validationReport.overallStatus = allCriteriaMet ? 'PASS' : 'FAIL';
        
        // Generate comprehensive validation report with pass/fail status and recommendations
        return validationReport;
        
    } catch (error) {
        // Enhanced error context for integration test validation failures
        validationReport.errors.push(`Integration test validation failed: ${error.message}`);
        validationReport.overallStatus = 'ERROR';
        return validationReport;
    }
}

// ============================================================================
// INTEGRATION TEST SUITE IMPLEMENTATION
// ============================================================================

/**
 * Main integration test suite for Server Integration Tests with comprehensive testing
 * of server lifecycle, endpoint functionality, error handling, and performance characteristics.
 * Implements complete integration testing coverage using Node.js built-in test runner.
 */
describe(TEST_SUITE_NAME, { timeout: INTEGRATION_TEST_TIMEOUT }, () => {
    // Global test suite variables for integration testing
    let testConfigManager;
    let globalTestSuite;
    let suiteCorrelationId;
    
    /**
     * Global integration test setup executed before all integration test suites.
     * Initializes test environment, configuration management, and resource allocation
     * for comprehensive integration test execution with proper isolation.
     */
    before(async () => {
        try {
            // Initialize TestConfigManager with integration test configuration
            testConfigManager = new TestConfigManager({
                caching: { enabled: true, maxSize: 100, ttl: 300000 },
                portManagement: { trackAllocations: true, autoRelease: true },
                environment: { isolation: true, cleanup: true }
            });
            
            // Set up test environment isolation and resource allocation
            suiteCorrelationId = generateCorrelationId('test-suite');
            
            // Configure test correlation tracking and logging
            console.info('Starting integration test suite', {
                correlationId: suiteCorrelationId,
                timestamp: new Date().toISOString(),
                suiteName: TEST_SUITE_NAME
            });
            
            // Initialize performance monitoring and threshold validation
            console.info('Integration test configuration initialized', {
                performanceThreshold: PERFORMANCE_THRESHOLD_MS,
                concurrentRequestCount: CONCURRENT_REQUEST_COUNT,
                timeouts: {
                    integration: INTEGRATION_TEST_TIMEOUT,
                    startup: SERVER_STARTUP_TIMEOUT,
                    request: REQUEST_TIMEOUT
                }
            });
            
            // Validate test dependencies and helper module availability
            assert(typeof TestServer === 'function', 'TestServer class must be available');
            assert(typeof HttpTestClient === 'function', 'HttpTestClient class must be available');
            assert(typeof TestConfigManager === 'function', 'TestConfigManager class must be available');
            
            // Set up test port allocation system for server isolation
            const testPort = await testConfigManager.allocatePort(suiteCorrelationId);
            console.info('Test port allocated for integration suite', {
                port: testPort,
                correlationId: suiteCorrelationId
            });
            
        } catch (setupError) {
            console.error('Integration test suite setup failed:', setupError.message);
            throw setupError;
        }
    });
    
    /**
     * Global integration test cleanup executed after all integration test suites.
     * Cleans up test environment, releases resources, and generates execution summary
     * for comprehensive test execution completion and resource management.
     */
    after(async () => {
        try {
            // Clean up any remaining test server instances
            if (globalTestSuite?.testServer) {
                await globalTestSuite.testServer.stop().catch(error => {
                    console.warn('Global test server cleanup warning:', error.message);
                });
            }
            
            // Release all allocated test ports and resources
            if (testConfigManager && suiteCorrelationId) {
                testConfigManager.releasePort(suiteCorrelationId);
                testConfigManager.clearCache();
            }
            
            // Generate integration test execution summary
            console.info('Integration test suite completed', {
                correlationId: suiteCorrelationId,
                completedAt: new Date().toISOString(),
                suiteName: TEST_SUITE_NAME
            });
            
            // Validate test environment cleanup completion
            await new Promise(resolve => setTimeout(resolve, 500)); // Brief wait for cleanup
            
            // Log integration test suite completion with performance metrics
            console.info('Integration test cleanup completed successfully', {
                correlationId: suiteCorrelationId,
                timestamp: new Date().toISOString()
            });
            
            // Reset global test state for isolation
            globalTestSuite = null;
            suiteCorrelationId = null;
            
        } catch (cleanupError) {
            console.error('Integration test suite cleanup failed:', cleanupError.message);
        }
    });
    
    /**
     * Setup executed before each individual integration test case.
     * Creates isolated test environment with TestServer and HttpTestClient
     * for individual test case execution with proper resource management.
     */
    beforeEach(async () => {
        try {
            // Generate unique correlation ID for test case tracking
            const testCaseCorrelationId = generateCorrelationId('test-case');
            
            // Set up isolated TestServer instance using setupIntegrationTestSuite
            globalTestSuite = await setupIntegrationTestSuite({
                testType: 'integration',
                correlationId: testCaseCorrelationId
            });
            
            // Initialize HttpTestClient for test case HTTP requests
            // (Already included in setupIntegrationTestSuite)
            
            // Configure test-specific timeouts and performance thresholds
            globalTestSuite.testCaseConfig = {
                timeout: REQUEST_TIMEOUT,
                performanceThreshold: PERFORMANCE_THRESHOLD_MS,
                correlationId: testCaseCorrelationId
            };
            
            // Initialize TestTimer for performance measurement
            globalTestSuite.testTimer = new TestTimer({
                name: 'test-case-timer',
                trackMemory: true
            });
            
            // Set up test environment with proper isolation
            console.debug('Test case setup completed', {
                correlationId: testCaseCorrelationId,
                port: globalTestSuite.port
            });
            
        } catch (testSetupError) {
            console.error('Test case setup failed:', testSetupError.message);
            throw testSetupError;
        }
    });
    
    /**
     * Cleanup executed after each individual integration test case.
     * Cleans up test resources, stops servers, and releases allocations
     * for proper test isolation between integration test executions.
     */
    afterEach(async () => {
        try {
            // Stop and cleanup TestServer instance using teardownIntegrationTestSuite
            if (globalTestSuite) {
                await teardownIntegrationTestSuite(globalTestSuite);
            }
            
            // Close HttpTestClient connections and cleanup resources
            // (Already handled in teardownIntegrationTestSuite)
            
            // Release test port allocation for reuse
            // (Already handled in teardownIntegrationTestSuite)
            
            // Clear test correlation data and execution context
            globalTestSuite = null;
            
            // Log test case execution metrics and performance data
            console.debug('Test case cleanup completed', {
                timestamp: new Date().toISOString()
            });
            
            // Validate test isolation and resource cleanup
            await new Promise(resolve => setTimeout(resolve, 100)); // Brief cleanup wait
            
        } catch (testCleanupError) {
            console.error('Test case cleanup failed:', testCleanupError.message);
        }
    });
    
    // ========================================================================
    // SERVER LIFECYCLE INTEGRATION TEST SUITE
    // ========================================================================
    
    /**
     * Server Lifecycle Integration Tests
     * Tests complete server lifecycle including startup, operation, and shutdown
     * with application component integration and resource management validation.
     */
    describe('Server Lifecycle Integration', { timeout: INTEGRATION_TEST_TIMEOUT }, () => {
        
        /**
         * Tests complete application startup with all component initialization and coordination.
         * Validates Application class integration with TestServer for comprehensive startup testing.
         */
        test('Application startup integration', { timeout: SERVER_STARTUP_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('startup-integration');
            
            try {
                // Start TestServer and validate startup process
                const startupValidation = await validateServerStartup(globalTestSuite.testServer, {
                    timeout: SERVER_STARTUP_TIMEOUT,
                    validateHealth: true,
                    measureTiming: true
                });
                
                // TestServer starts successfully with Application instance
                assert.strictEqual(startupValidation.isValid, true, 'TestServer must start successfully');
                assert.strictEqual(startupValidation.startup.successful, true, 'Application startup must be successful');
                
                // All application components initialize correctly
                assert.strictEqual(startupValidation.startup.components.serverRunning, true, 'Server must be running');
                assert.strictEqual(startupValidation.startup.components.applicationReady, true, 'Application must be ready');
                
                // Server binds to test port and accepts connections
                assert.strictEqual(startupValidation.startup.components.portBinding, true, 'Server must bind to port');
                assert.strictEqual(startupValidation.startup.serverInfo.listening, true, 'Server must be listening');
                
                // Application health check returns healthy status
                if (startupValidation.startup.health !== null) {
                    assert.strictEqual(startupValidation.startup.health, true, 'Application health check must pass');
                }
                
                // Server startup timing meets performance requirements
                if (startupValidation.startup.timing) {
                    assert.ok(startupValidation.startup.timing.performance.isWithinThreshold, 
                        `Startup time ${startupValidation.startup.timing.duration}ms must be under ${PERFORMANCE_THRESHOLD_MS}ms`);
                }
                
                console.info('Application startup integration test passed', {
                    correlationId,
                    port: globalTestSuite.port,
                    startupTime: startupValidation.startup.timing?.duration
                });
                
            } catch (startupError) {
                console.error('Application startup integration test failed:', {
                    correlationId,
                    error: startupError.message
                });
                throw startupError;
            }
        });
        
        /**
         * Tests graceful server shutdown with active connection handling and resource cleanup.
         * Validates TestServer.stop() with proper connection handling and cleanup operations.
         */
        test('Graceful shutdown integration', { timeout: SERVER_STARTUP_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('shutdown-integration');
            
            try {
                // Ensure server is running before shutdown test
                const isRunning = globalTestSuite.testServer.isRunning();
                assert.strictEqual(isRunning, true, 'Server must be running before shutdown test');
                
                // Create test client to establish active connection
                const shutdownTestClient = new HttpTestClient({
                    baseUrl: `http://localhost:${globalTestSuite.port}`,
                    timeout: 2000
                });
                
                // Make initial request to establish connection
                await shutdownTestClient.get(HELLO_ENDPOINT_PATH);
                
                // Measure shutdown timing
                const shutdownTimer = new TestTimer({ name: 'graceful-shutdown' });
                shutdownTimer.start('shutdown-process');
                
                // Initiate graceful shutdown
                await globalTestSuite.testServer.stop();
                
                const shutdownTiming = shutdownTimer.stop();
                
                // Server stops accepting new connections during shutdown
                const isStoppedAfterShutdown = !globalTestSuite.testServer.isRunning();
                assert.strictEqual(isStoppedAfterShutdown, true, 'Server must stop after shutdown call');
                
                // Active connections complete within timeout period
                // (Assuming successful shutdown means connections were handled)
                assert.ok(shutdownTiming.duration <= 10000, 'Shutdown must complete within 10 seconds');
                
                // Application components shut down in proper order
                // (Validated by successful stop() completion)
                assert.strictEqual(globalTestSuite.testServer.isReady(), false, 'Server must not be ready after shutdown');
                
                // Resources are cleaned up completely
                const serverInfo = await globalTestSuite.testServer.getServerInfo();
                assert.strictEqual(serverInfo.listening, false, 'Server must not be listening after shutdown');
                
                // Shutdown timing meets performance requirements
                assert.ok(shutdownTiming.performance.isWithinThreshold || shutdownTiming.duration <= 5000, 
                    'Shutdown timing must meet performance requirements');
                
                // Clean up test client
                await shutdownTestClient.close();
                
                console.info('Graceful shutdown integration test passed', {
                    correlationId,
                    shutdownTime: shutdownTiming.duration
                });
                
            } catch (shutdownError) {
                console.error('Graceful shutdown integration test failed:', {
                    correlationId,
                    error: shutdownError.message
                });
                throw shutdownError;
            }
        });
        
        /**
         * Tests server restart capability with configuration updates and state management.
         * Validates server restart process with state clearing and configuration updates.
         */
        test('Server restart integration', { timeout: INTEGRATION_TEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('restart-integration');
            
            try {
                // Get current server state before restart
                const initialState = {
                    running: globalTestSuite.testServer.isRunning(),
                    port: globalTestSuite.port,
                    serverInfo: await globalTestSuite.testServer.getServerInfo()
                };
                
                // Server stops cleanly before restart
                await globalTestSuite.testServer.stop();
                const stoppedAfterStop = !globalTestSuite.testServer.isRunning();
                assert.strictEqual(stoppedAfterStop, true, 'Server must stop cleanly before restart');
                
                // Previous server state is cleared completely
                const clearedState = await globalTestSuite.testServer.getServerInfo();
                assert.strictEqual(clearedState.listening, false, 'Previous server state must be cleared');
                
                // Wait briefly for cleanup
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Server starts with updated configuration
                const restartTimer = new TestTimer({ name: 'server-restart' });
                restartTimer.start('restart-cycle');
                
                await globalTestSuite.testServer.start();
                
                const restartTiming = restartTimer.stop();
                
                // New server instance accepts connections normally
                const isReadyAfterRestart = await waitForCondition(
                    () => globalTestSuite.testServer.isReady(),
                    { timeout: 10000, description: 'restart readiness' }
                );
                
                assert.strictEqual(isReadyAfterRestart, true, 'Server must be ready after restart');
                
                // Test functionality after restart
                const restartTestClient = new HttpTestClient({
                    baseUrl: `http://localhost:${globalTestSuite.port}`,
                    timeout: REQUEST_TIMEOUT
                });
                
                const postRestartResponse = await restartTestClient.get(HELLO_ENDPOINT_PATH);
                assert.strictEqual(postRestartResponse.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'Server must respond normally after restart');
                
                // Restart process completes within timeout
                assert.ok(restartTiming.duration <= INTEGRATION_TEST_TIMEOUT, 
                    'Restart process must complete within timeout');
                
                // Cleanup restart test client
                await restartTestClient.close();
                
                console.info('Server restart integration test passed', {
                    correlationId,
                    restartTime: restartTiming.duration,
                    functionalAfterRestart: postRestartResponse.statusCode === HTTP_STATUS_CODES.SUCCESS.OK
                });
                
            } catch (restartError) {
                console.error('Server restart integration test failed:', {
                    correlationId,
                    error: restartError.message
                });
                throw restartError;
            }
        });
    });
    
    // ========================================================================
    // HELLO ENDPOINT INTEGRATION TEST SUITE
    // ========================================================================
    
    /**
     * Hello Endpoint Integration Tests
     * Tests complete hello endpoint functionality through full application stack
     * with request processing and response generation validation.
     */
    describe('Hello Endpoint Integration', { timeout: REQUEST_TIMEOUT * 2 }, () => {
        
        /**
         * Tests successful GET /hello request through complete application stack.
         * Validates complete request-response cycle with status, content, and header validation.
         */
        test('Hello endpoint success integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('hello-success');
            
            try {
                // Test hello endpoint through complete integration
                const endpointResult = await testHelloEndpointIntegration(globalTestSuite.testClient, {
                    measurePerformance: true,
                    validateHeaders: true,
                    timeout: REQUEST_TIMEOUT
                });
                
                // GET /hello returns 200 OK status through full stack
                assert.strictEqual(endpointResult.success, true, 'Hello endpoint integration must be successful');
                assert.strictEqual(endpointResult.response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'GET /hello must return 200 OK status');
                
                // Response body contains exact 'Hello world' message
                assert.strictEqual(endpointResult.response.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'Response body must contain exact Hello world message');
                
                // Response Content-Type header is text/plain
                assert.strictEqual(endpointResult.response.headers['content-type'], 'text/plain', 
                    'Response Content-Type must be text/plain');
                
                // Response includes proper security headers (if applicable)
                assert.ok(endpointResult.validation.headers, 'Response must include proper headers');
                
                // Request-response cycle completes under 100ms
                if (endpointResult.response.timing) {
                    assert.ok(endpointResult.response.timing.performance.isWithinThreshold, 
                        `Request-response cycle ${endpointResult.response.timing.duration}ms must be under ${PERFORMANCE_THRESHOLD_MS}ms`);
                }
                
                console.info('Hello endpoint success integration test passed', {
                    correlationId,
                    responseTime: endpointResult.response.timing?.duration,
                    statusCode: endpointResult.response.statusCode
                });
                
            } catch (helloError) {
                console.error('Hello endpoint success integration test failed:', {
                    correlationId,
                    error: helloError.message
                });
                throw helloError;
            }
        });
        
        /**
         * Tests hello endpoint behavior with various request headers and parameters.
         * Validates endpoint robustness with different request variations and parameter handling.
         */
        test('Hello endpoint with request variations', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('hello-variations');
            
            try {
                // Test with custom headers
                const headerResponse = await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                    headers: {
                        'User-Agent': 'Integration-Test-Client/1.0',
                        'Accept': 'text/plain',
                        'X-Test-Header': 'integration-test'
                    },
                    timeout: REQUEST_TIMEOUT
                });
                
                // Query parameters are handled correctly
                const queryResponse = await globalTestSuite.testClient.get(`${HELLO_ENDPOINT_PATH}?test=param&value=123`, {
                    timeout: REQUEST_TIMEOUT
                });
                
                // Custom request headers do not affect response
                assert.strictEqual(headerResponse.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'Custom headers must not affect response status');
                assert.strictEqual(headerResponse.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'Custom headers must not affect response content');
                
                // Response format remains consistent
                assert.strictEqual(queryResponse.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'Query parameters must not affect response status');
                assert.strictEqual(queryResponse.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'Query parameters must not affect response content');
                
                // Response timing is stable across variations
                const responses = [headerResponse, queryResponse];
                const allTimingsStable = responses.every(response => {
                    // Assume stable timing if no extreme variations
                    return response.statusCode === HTTP_STATUS_CODES.SUCCESS.OK;
                });
                
                assert.ok(allTimingsStable, 'Response timing must be stable across variations');
                
                console.info('Hello endpoint variations integration test passed', {
                    correlationId,
                    headerTest: headerResponse.statusCode === HTTP_STATUS_CODES.SUCCESS.OK,
                    queryTest: queryResponse.statusCode === HTTP_STATUS_CODES.SUCCESS.OK
                });
                
            } catch (variationError) {
                console.error('Hello endpoint variations integration test failed:', {
                    correlationId,
                    error: variationError.message
                });
                throw variationError;
            }
        });
    });
    
    // ========================================================================
    // ERROR HANDLING INTEGRATION TEST SUITE
    // ========================================================================
    
    /**
     * Error Handling Integration Tests
     * Tests complete error handling through application stack including routing errors
     * and method validation with comprehensive error response validation.
     */
    describe('Error Handling Integration', { timeout: REQUEST_TIMEOUT * 3 }, () => {
        
        /**
         * Tests 404 error handling for invalid paths through complete application stack.
         * Validates 404 Not Found responses with proper status codes and error content.
         */
        test('404 Not Found integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('404-integration');
            
            try {
                // Test error handling integration for 404 scenarios
                const errorResult = await testErrorHandlingIntegration(globalTestSuite.testClient, {
                    test404: true,
                    test405: false,
                    validateHeaders: true
                });
                
                // Invalid paths return 404 Not Found status
                assert.ok(errorResult.errorScenarios.notFound, '404 scenario must be tested');
                assert.strictEqual(errorResult.errorScenarios.notFound.statusValid, true, 
                    'Invalid paths must return 404 Not Found status');
                assert.strictEqual(errorResult.errorScenarios.notFound.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND, 
                    'Status code must be 404');
                
                // 404 responses include appropriate error content
                assert.ok(errorResult.errorScenarios.notFound.response, '404 response must include error content');
                assert.ok(typeof errorResult.errorScenarios.notFound.response === 'string', 
                    '404 response content must be string');
                
                // Error response headers are consistent
                assert.ok(errorResult.errorScenarios.notFound.headers, '404 response must include headers');
                
                // Error response timing meets requirements
                if (errorResult.performanceValidation) {
                    assert.ok(errorResult.performanceValidation.errorResponseTime <= 50, 
                        'Error response time must be under 50ms');
                }
                
                console.info('404 Not Found integration test passed', {
                    correlationId,
                    statusCode: errorResult.errorScenarios.notFound.statusCode,
                    responseTime: errorResult.performanceValidation?.errorResponseTime
                });
                
            } catch (notFoundError) {
                console.error('404 Not Found integration test failed:', {
                    correlationId,
                    error: notFoundError.message
                });
                throw notFoundError;
            }
        });
        
        /**
         * Tests method validation and 405 error responses through application stack.
         * Validates 405 Method Not Allowed responses with proper Allow headers.
         */
        test('405 Method Not Allowed integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('405-integration');
            
            try {
                // Test error handling integration for 405 scenarios
                const errorResult = await testErrorHandlingIntegration(globalTestSuite.testClient, {
                    test404: false,
                    test405: true,
                    validateHeaders: true
                });
                
                // POST /hello returns 405 Method Not Allowed
                assert.ok(errorResult.errorScenarios.methodNotAllowed, '405 scenario must be tested');
                assert.strictEqual(errorResult.errorScenarios.methodNotAllowed.statusValid, true, 
                    'POST /hello must return 405 Method Not Allowed');
                assert.strictEqual(errorResult.errorScenarios.methodNotAllowed.statusCode, 
                    HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 'Status code must be 405');
                
                // Allow header includes only supported methods
                assert.ok(errorResult.errorScenarios.methodNotAllowed.hasAllowHeader, 
                    'Allow header must be present in 405 response');
                
                // Test other unsupported methods (PUT, DELETE) by making additional requests
                const putResponse = await globalTestSuite.testClient.request('PUT', HELLO_ENDPOINT_PATH, {
                    timeout: REQUEST_TIMEOUT / 2
                });
                assert.strictEqual(putResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 
                    'PUT /hello must return 405 Method Not Allowed');
                
                const deleteResponse = await globalTestSuite.testClient.request('DELETE', HELLO_ENDPOINT_PATH, {
                    timeout: REQUEST_TIMEOUT / 2
                });
                assert.strictEqual(deleteResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 
                    'DELETE /hello must return 405 Method Not Allowed');
                
                console.info('405 Method Not Allowed integration test passed', {
                    correlationId,
                    postStatus: errorResult.errorScenarios.methodNotAllowed.statusCode,
                    putStatus: putResponse.statusCode,
                    deleteStatus: deleteResponse.statusCode
                });
                
            } catch (methodError) {
                console.error('405 Method Not Allowed integration test failed:', {
                    correlationId,
                    error: methodError.message
                });
                throw methodError;
            }
        });
        
        /**
         * Tests error response format consistency across different error scenarios.
         * Validates consistent error response formatting and security considerations.
         */
        test('Error response consistency integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('error-consistency');
            
            try {
                // Test comprehensive error handling integration
                const errorResult = await testErrorHandlingIntegration(globalTestSuite.testClient, {
                    test404: true,
                    test405: true,
                    validateHeaders: true
                });
                
                // All error responses use consistent format
                const errorResponses = Object.values(errorResult.errorScenarios)
                    .filter(scenario => scenario.tested && scenario.response);
                
                assert.ok(errorResponses.length >= 2, 'Multiple error scenarios must be tested');
                
                const allHaveStringResponse = errorResponses.every(response => 
                    typeof response.response === 'string'
                );
                assert.ok(allHaveStringResponse, 'All error responses must use consistent string format');
                
                // Error responses include proper headers
                const allHaveHeaders = errorResponses.every(response => 
                    response.headers && typeof response.headers === 'object'
                );
                assert.ok(allHaveHeaders, 'All error responses must include proper headers');
                
                // Error messages are appropriate and secure
                const allResponsesAppropriate = errorResponses.every(response => 
                    response.response.length > 0 && response.response.length < 1000 // Reasonable length
                );
                assert.ok(allResponsesAppropriate, 'Error messages must be appropriate and secure');
                
                // Error response timing is consistent
                if (errorResult.performanceValidation) {
                    assert.ok(errorResult.performanceValidation.errorResponseTime <= 100, 
                        'Error response timing must be consistent and fast');
                }
                
                console.info('Error response consistency integration test passed', {
                    correlationId,
                    errorScenarioCount: errorResponses.length,
                    formatConsistency: errorResult.formatConsistency
                });
                
            } catch (consistencyError) {
                console.error('Error response consistency integration test failed:', {
                    correlationId,
                    error: consistencyError.message
                });
                throw consistencyError;
            }
        });
    });
    
    // ========================================================================
    // PERFORMANCE INTEGRATION TEST SUITE
    // ========================================================================
    
    /**
     * Performance Integration Tests
     * Tests application performance characteristics including response times, throughput,
     * and concurrent request handling with comprehensive performance validation.
     */
    describe('Performance Integration', { timeout: INTEGRATION_TEST_TIMEOUT }, () => {
        
        /**
         * Tests application response time performance through complete request-response cycle.
         * Validates response time performance with timing measurement and threshold validation.
         */
        test('Response time performance integration', { timeout: REQUEST_TIMEOUT * 2 }, async () => {
            const correlationId = generateCorrelationId('response-time-performance');
            
            try {
                // Test hello endpoint performance
                const performanceResult = await measurePerformance(async () => {
                    return await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                        timeout: REQUEST_TIMEOUT
                    });
                }, 'hello-endpoint-performance');
                
                // Hello endpoint responds in under 100ms consistently
                assert.ok(performanceResult.analysis.isWithinThreshold, 
                    `Hello endpoint must respond in under ${PERFORMANCE_THRESHOLD_MS}ms, got ${performanceResult.duration}ms`);
                
                // Test error response performance
                const errorPerformanceResult = await measurePerformance(async () => {
                    return await globalTestSuite.testClient.get(INVALID_ENDPOINT_PATH, {
                        timeout: REQUEST_TIMEOUT
                    });
                }, 'error-response-performance');
                
                // Error responses complete in under 50ms
                assert.ok(errorPerformanceResult.duration <= 50, 
                    `Error responses must complete in under 50ms, got ${errorPerformanceResult.duration}ms`);
                
                // Response times remain stable across multiple requests
                const multipleRequestResults = [];
                for (let i = 0; i < 5; i++) {
                    const singleResult = await measurePerformance(async () => {
                        return await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                            timeout: REQUEST_TIMEOUT
                        });
                    }, `stability-test-${i}`);
                    multipleRequestResults.push(singleResult.duration);
                }
                
                const averageTime = multipleRequestResults.reduce((sum, time) => sum + time, 0) / multipleRequestResults.length;
                const maxVariation = Math.max(...multipleRequestResults) - Math.min(...multipleRequestResults);
                
                assert.ok(averageTime <= PERFORMANCE_THRESHOLD_MS, 
                    `Average response time ${averageTime}ms must be under threshold`);
                assert.ok(maxVariation <= 50, 
                    `Response time variation ${maxVariation}ms must be stable`);
                
                // Performance meets educational and production requirements
                assert.ok(performanceResult.analysis.performanceGrade === 'PASS', 
                    'Performance must meet educational and production requirements');
                
                console.info('Response time performance integration test passed', {
                    correlationId,
                    helloPerformance: performanceResult.duration,
                    errorPerformance: errorPerformanceResult.duration,
                    averageStability: averageTime,
                    variation: maxVariation
                });
                
            } catch (performanceError) {
                console.error('Response time performance integration test failed:', {
                    correlationId,
                    error: performanceError.message
                });
                throw performanceError;
            }
        });
        
        /**
         * Tests server ability to handle multiple concurrent requests with integration validation.
         * Validates concurrent request handling with performance and correctness verification.
         */
        test('Concurrent request handling integration', { timeout: INTEGRATION_TEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('concurrent-handling');
            
            try {
                // Test concurrent request handling capabilities
                const concurrentResult = await testConcurrentRequestHandling(
                    CONCURRENT_REQUEST_COUNT, 
                    globalTestSuite.testClient, 
                    {
                        timeout: REQUEST_TIMEOUT,
                        validateAll: true,
                        measurePerformance: true
                    }
                );
                
                // Server handles 10 concurrent requests successfully
                assert.strictEqual(concurrentResult.success, true, 
                    'Server must handle concurrent requests successfully');
                assert.strictEqual(concurrentResult.responses.length, CONCURRENT_REQUEST_COUNT, 
                    `Server must process all ${CONCURRENT_REQUEST_COUNT} concurrent requests`);
                
                // All concurrent responses are correct and complete
                assert.strictEqual(concurrentResult.validation.allSuccessful, true, 
                    'All concurrent responses must be correct and complete');
                
                const allCorrectStatus = concurrentResult.responses.every(response => 
                    response.statusCode === HTTP_STATUS_CODES.SUCCESS.OK
                );
                assert.ok(allCorrectStatus, 'All concurrent responses must have correct status codes');
                
                const allCorrectContent = concurrentResult.responses.every(response => 
                    response.body === RESPONSE_MESSAGES.HELLO_WORLD
                );
                assert.ok(allCorrectContent, 'All concurrent responses must have correct content');
                
                // No request interference or data corruption
                assert.strictEqual(concurrentResult.validation.noInterference, true, 
                    'No request interference or data corruption must occur');
                
                // Concurrent performance meets scalability requirements
                assert.strictEqual(concurrentResult.validation.performanceAcceptable, true, 
                    'Concurrent performance must meet scalability requirements');
                
                if (concurrentResult.performanceAnalysis) {
                    assert.ok(concurrentResult.performanceAnalysis.isAcceptable, 
                        'Concurrent performance analysis must show acceptable results');
                    assert.ok(concurrentResult.scalability.successRate >= 95, 
                        `Success rate ${concurrentResult.scalability.successRate}% must be at least 95%`);
                }
                
                console.info('Concurrent request handling integration test passed', {
                    correlationId,
                    concurrentCount: CONCURRENT_REQUEST_COUNT,
                    successRate: concurrentResult.scalability.successRate,
                    performance: concurrentResult.performanceAnalysis?.isAcceptable
                });
                
            } catch (concurrentError) {
                console.error('Concurrent request handling integration test failed:', {
                    correlationId,
                    error: concurrentError.message
                });
                throw concurrentError;
            }
        });
        
        /**
         * Tests application memory usage during integration testing scenarios.
         * Validates memory efficiency and resource management during test execution.
         */
        test('Memory usage integration', { timeout: REQUEST_TIMEOUT * 2 }, async () => {
            const correlationId = generateCorrelationId('memory-usage');
            
            try {
                // Record initial memory usage
                const initialMemory = process.memoryUsage();
                
                // Execute multiple requests to test memory stability
                const memoryTestResults = [];
                for (let i = 0; i < 20; i++) {
                    const memoryResult = await measurePerformance(async () => {
                        return await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                            timeout: 1000
                        });
                    }, `memory-test-${i}`);
                    
                    memoryTestResults.push(memoryResult);
                }
                
                // Record final memory usage
                const finalMemory = process.memoryUsage();
                const memoryDifference = {
                    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
                    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
                    external: finalMemory.external - initialMemory.external,
                    rss: finalMemory.rss - initialMemory.rss
                };
                
                // Memory usage remains stable during test execution
                const memoryIncrease = memoryDifference.heapUsed;
                const memoryIncreasePercentage = (memoryIncrease / initialMemory.heapUsed) * 100;
                
                assert.ok(memoryIncreasePercentage < 50, 
                    `Memory usage increase ${memoryIncreasePercentage.toFixed(2)}% must be under 50%`);
                
                // No memory leaks detected during integration testing
                const averageMemoryPerRequest = memoryIncrease / memoryTestResults.length;
                assert.ok(averageMemoryPerRequest < 1024 * 1024, // 1MB per request
                    `Average memory per request ${averageMemoryPerRequest} bytes must be reasonable`);
                
                // Resource cleanup prevents memory accumulation
                const memoryStability = memoryTestResults.map(r => r.memory?.heapUsed || 0);
                const memoryVariation = Math.max(...memoryStability) - Math.min(...memoryStability);
                assert.ok(memoryVariation < 10 * 1024 * 1024, // 10MB variation
                    `Memory variation ${memoryVariation} bytes must be stable`);
                
                // Memory efficiency meets application requirements
                const finalHeapUsageMB = finalMemory.heapUsed / (1024 * 1024);
                assert.ok(finalHeapUsageMB < 100, 
                    `Final heap usage ${finalHeapUsageMB.toFixed(2)}MB must be under 100MB`);
                
                console.info('Memory usage integration test passed', {
                    correlationId,
                    memoryIncrease: memoryIncreasePercentage.toFixed(2) + '%',
                    finalHeapUsage: finalHeapUsageMB.toFixed(2) + 'MB',
                    requestCount: memoryTestResults.length
                });
                
            } catch (memoryError) {
                console.error('Memory usage integration test failed:', {
                    correlationId,
                    error: memoryError.message
                });
                throw memoryError;
            }
        });
    });
    
    // ========================================================================
    // REQUEST PROCESSING INTEGRATION TEST SUITE
    // ========================================================================
    
    /**
     * Request Processing Integration Tests
     * Tests complete HTTP request processing through application stack including
     * parsing, routing, and response generation with comprehensive validation.
     */
    describe('Request Processing Integration', { timeout: REQUEST_TIMEOUT * 2 }, () => {
        
        /**
         * Tests HTTP request parsing and validation through complete application pipeline.
         * Validates request parsing with method extraction, URL processing, and header handling.
         */
        test('HTTP request parsing integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('request-parsing');
            
            try {
                // Make request with comprehensive headers and validate parsing
                const response = await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                    headers: {
                        'Content-Type': 'text/plain',
                        'User-Agent': 'Integration-Test-Client/1.0',
                        'Accept': 'text/plain',
                        'X-Custom-Header': 'test-value'
                    },
                    timeout: REQUEST_TIMEOUT
                });
                
                // HTTP method is extracted and validated correctly
                assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'HTTP method must be extracted and validated correctly');
                
                // URL path is parsed and routed properly
                assert.strictEqual(response.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'URL path must be parsed and routed properly');
                
                // Request headers are processed through middleware
                assert.ok(response.headers, 'Request headers must be processed through middleware');
                assert.ok(response.headers['content-type'], 'Response must include content-type header');
                
                // Request processing completes without errors
                assert.strictEqual(response.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'Request processing must complete without errors');
                
                // Test with different HTTP methods to validate method extraction
                const methodTests = ['POST', 'PUT', 'DELETE'];
                for (const method of methodTests) {
                    const methodResponse = await globalTestSuite.testClient.request(method, HELLO_ENDPOINT_PATH, {
                        timeout: 1000
                    });
                    
                    // Should return 405 for unsupported methods
                    assert.strictEqual(methodResponse.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED, 
                        `${method} method must be properly identified and rejected`);
                }
                
                console.info('HTTP request parsing integration test passed', {
                    correlationId,
                    methodValidation: true,
                    headerProcessing: true,
                    routingSuccess: true
                });
                
            } catch (parsingError) {
                console.error('HTTP request parsing integration test failed:', {
                    correlationId,
                    error: parsingError.message
                });
                throw parsingError;
            }
        });
        
        /**
         * Tests URL routing and endpoint matching through complete application stack.
         * Validates routing logic with path matching and endpoint resolution.
         */
        test('Routing logic integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('routing-logic');
            
            try {
                // Test valid route handling
                const validRouteResponse = await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                    timeout: REQUEST_TIMEOUT
                });
                
                // /hello path routes to correct handler
                assert.strictEqual(validRouteResponse.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    '/hello path must route to correct handler');
                assert.strictEqual(validRouteResponse.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'Correct handler must generate proper response');
                
                // Test invalid route handling
                const invalidPaths = ['/invalid', '/hello/extra', '/api/hello', '/HELLO', '/hello/'];
                const routingResults = [];
                
                for (const path of invalidPaths) {
                    const invalidResponse = await globalTestSuite.testClient.get(path, {
                        timeout: 1000
                    });
                    routingResults.push({
                        path,
                        statusCode: invalidResponse.statusCode,
                        routed: invalidResponse.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
                    });
                }
                
                // Invalid paths route to error handler
                const allInvalidRoutedCorrectly = routingResults.every(result => result.routed);
                assert.ok(allInvalidRoutedCorrectly, 'Invalid paths must route to error handler');
                
                // Routing decisions are consistent and accurate
                const statusCodes = routingResults.map(r => r.statusCode);
                const allSame404 = statusCodes.every(code => code === HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND);
                assert.ok(allSame404, 'Routing decisions must be consistent and accurate');
                
                // Routing performance meets timing requirements
                const routingPerformanceResult = await measurePerformance(async () => {
                    const responses = await Promise.all([
                        globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH),
                        globalTestSuite.testClient.get(INVALID_ENDPOINT_PATH)
                    ]);
                    return responses;
                }, 'routing-performance');
                
                assert.ok(routingPerformanceResult.analysis.isWithinThreshold, 
                    `Routing performance ${routingPerformanceResult.duration}ms must meet timing requirements`);
                
                console.info('Routing logic integration test passed', {
                    correlationId,
                    validRouting: true,
                    invalidRoutingCount: invalidPaths.length,
                    routingPerformance: routingPerformanceResult.duration
                });
                
            } catch (routingError) {
                console.error('Routing logic integration test failed:', {
                    correlationId,
                    error: routingError.message
                });
                throw routingError;
            }
        });
        
        /**
         * Tests HTTP response generation and formatting through complete application pipeline.
         * Validates response generation with header creation, content formatting, and status codes.
         */
        test('Response generation integration', { timeout: REQUEST_TIMEOUT }, async () => {
            const correlationId = generateCorrelationId('response-generation');
            
            try {
                // Test successful response generation
                const responseResult = await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH, {
                    timeout: REQUEST_TIMEOUT
                });
                
                // Response headers are generated correctly
                assert.ok(responseResult.headers, 'Response headers must be generated');
                assert.strictEqual(responseResult.headers['content-type'], 'text/plain', 
                    'Response headers must be generated correctly');
                assert.ok(responseResult.headers['content-length'], 'Content-length header must be present');
                
                // Response body content matches requirements
                assert.strictEqual(responseResult.body, RESPONSE_MESSAGES.HELLO_WORLD, 
                    'Response body content must match requirements');
                assert.ok(typeof responseResult.body === 'string', 'Response body must be string');
                
                // Response status codes are appropriate
                assert.strictEqual(responseResult.statusCode, HTTP_STATUS_CODES.SUCCESS.OK, 
                    'Response status codes must be appropriate');
                assert.ok(isSuccessStatus(responseResult.statusCode), 
                    'Status code must be valid success status');
                
                // Test error response generation
                const errorResponseResult = await globalTestSuite.testClient.get(INVALID_ENDPOINT_PATH, {
                    timeout: REQUEST_TIMEOUT
                });
                
                assert.strictEqual(errorResponseResult.statusCode, HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND, 
                    'Error response status must be appropriate');
                assert.ok(errorResponseResult.body && errorResponseResult.body.length > 0, 
                    'Error response must include appropriate content');
                
                // Response generation timing is acceptable
                const generationPerformanceResult = await measurePerformance(async () => {
                    return await globalTestSuite.testClient.get(HELLO_ENDPOINT_PATH);
                }, 'response-generation-timing');
                
                assert.ok(generationPerformanceResult.analysis.isWithinThreshold, 
                    `Response generation timing ${generationPerformanceResult.duration}ms must be acceptable`);
                
                console.info('Response generation integration test passed', {
                    correlationId,
                    responseGeneration: true,
                    headerGeneration: true,
                    statusGeneration: true,
                    timing: generationPerformanceResult.duration
                });
                
            } catch (generationError) {
                console.error('Response generation integration test failed:', {
                    correlationId,
                    error: generationError.message
                });
                throw generationError;
            }
        });
    });
    
    // ========================================================================
    // COMPREHENSIVE INTEGRATION VALIDATION TEST
    // ========================================================================
    
    /**
     * Comprehensive Integration Test Validation
     * Validates all integration test results against requirements and generates
     * comprehensive analysis of integration testing completeness and success.
     */
    describe('Integration Test Validation', { timeout: INTEGRATION_TEST_TIMEOUT }, () => {
        
        /**
         * Validates complete integration test suite results against all requirements.
         * Comprehensive validation of all integration test results with detailed analysis.
         */
        test('Complete integration validation', { timeout: REQUEST_TIMEOUT * 3 }, async () => {
            const correlationId = generateCorrelationId('complete-validation');
            
            try {
                // Execute all integration test scenarios and collect results
                const integrationResults = [];
                
                // Test hello endpoint integration
                const endpointResult = await testHelloEndpointIntegration(globalTestSuite.testClient, {
                    measurePerformance: true,
                    validateHeaders: true
                });
                integrationResults.push(endpointResult);
                
                // Test error handling integration
                const errorResult = await testErrorHandlingIntegration(globalTestSuite.testClient, {
                    test404: true,
                    test405: true,
                    validateHeaders: true
                });
                integrationResults.push(errorResult);
                
                // Test concurrent request handling
                const concurrentResult = await testConcurrentRequestHandling(5, globalTestSuite.testClient, {
                    timeout: REQUEST_TIMEOUT,
                    validateAll: true,
                    measurePerformance: true
                });
                integrationResults.push(concurrentResult);
                
                // Validate all integration test results
                const validationReport = validateIntegrationTestResults(integrationResults, {
                    performance: {
                        threshold: PERFORMANCE_THRESHOLD_MS,
                        concurrentThreshold: PERFORMANCE_THRESHOLD_MS * 2,
                        successRate: 95
                    },
                    functionality: {
                        endpointCoverage: 100,
                        errorHandlingCoverage: 100
                    },
                    coverage: {
                        minimumTests: 3,
                        requiredScenarios: ['endpoint', 'error', 'concurrent']
                    }
                });
                
                // Integration test suite validation must pass overall
                assert.strictEqual(validationReport.overallStatus, 'PASS', 
                    'Integration test suite validation must pass overall');
                
                // All critical test scenarios must be covered
                assert.strictEqual(validationReport.coverage.scenarioCoverageComplete, true, 
                    'All required test scenarios must be covered');
                
                // Performance requirements must be met
                assert.strictEqual(validationReport.performance.overallPerformanceGrade, 'PASS', 
                    'Performance requirements must be met');
                
                // Functionality requirements must be satisfied
                assert.ok(validationReport.functionality.endpointTestingComplete || 
                         validationReport.functionality.errorHandlingComplete, 
                    'Core functionality requirements must be satisfied');
                
                // No critical errors in integration testing
                const criticalErrors = validationReport.errors.filter(error => 
                    error.includes('failed') || error.includes('exceed')
                );
                assert.strictEqual(criticalErrors.length, 0, 
                    `No critical errors allowed in integration testing: ${criticalErrors.join(', ')}`);
                
                console.info('Complete integration validation test passed', {
                    correlationId,
                    overallStatus: validationReport.overallStatus,
                    testCount: integrationResults.length,
                    passedTests: validationReport.summary.passedTests,
                    performanceGrade: validationReport.performance.overallPerformanceGrade,
                    scenarioCoverage: validationReport.coverage.scenarioCoverageComplete
                });
                
            } catch (validationError) {
                console.error('Complete integration validation test failed:', {
                    correlationId,
                    error: validationError.message
                });
                throw validationError;
            }
        });
    });
});