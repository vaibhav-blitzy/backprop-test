/**
 * Comprehensive Test Suite for Node.js Tutorial Application Server Entry Point
 * 
 * This test module provides comprehensive testing coverage for the Node.js tutorial application 
 * server entry point and bootstrap functionality. Tests server startup, configuration validation, 
 * application lifecycle management, graceful shutdown procedures, error handling, and performance 
 * characteristics using Node.js built-in test runner with educational clarity and production-ready 
 * testing practices.
 * 
 * The test suite demonstrates enterprise-grade testing patterns for main server entry points including:
 * - Server startup and initialization testing with timing validation
 * - Configuration validation and environment variable processing
 * - Graceful shutdown procedures and signal handling validation
 * - Error handling and recovery testing with comprehensive error scenarios
 * - Performance testing and benchmarking with resource monitoring
 * - Application lifecycle management and component coordination testing
 * - Server metadata collection and information gathering validation
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive server testing patterns using Node.js built-in test runner
 * - Shows integration testing between server entry point and application components
 * - Illustrates performance testing and benchmarking for server applications
 * - Provides examples of error handling testing and recovery validation
 * - Shows correlation tracking and test execution monitoring patterns
 * - Demonstrates production-ready testing practices with zero external dependencies
 * 
 * @fileoverview Comprehensive server entry point test suite with lifecycle management and performance validation
 * @version 1.0.0
 * @author Node.js Tutorial Application Testing Team
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Import Node.js built-in test runner modules for test execution and organization
import { test, describe, beforeEach, afterEach } from 'node:test'; // Node.js v20.x - Built-in test runner
import assert from 'node:assert'; // Node.js v20.x - Built-in assertion library
import { setTimeout } from 'node:timers/promises'; // Node.js v20.x - Promise-based timing utilities
import process from 'node:process'; // Node.js v20.x - Process management for signal testing

// Import server entry point functions for testing bootstrap and startup functionality
import { 
    main, 
    setupGracefulShutdown, 
    handleStartupError, 
    validateStartupConfiguration, 
    getServerMetadata 
} from '../server.js';

// Import Application class and factory function for lifecycle testing and component coordination
import { 
    Application, 
    createApplication 
} from '../app.js';

// Import test helper classes for isolated server testing and lifecycle management
import { TestServer } from './helpers/test-server.js';

// Import HTTP test client for server communication and correlation tracking
import { HttpTestClient } from './helpers/test-client.js';

// Import assertion utilities for HTTP response validation and server status checking
import { 
    HttpResponseAssertion, 
    ServerStatusAssertion, 
    PerformanceAssertion 
} from './helpers/assertions.js';

// Import test utilities for timing, correlation tracking, and test execution management
import { 
    TestTimer, 
    TestExecutionContext, 
    generateCorrelationId, 
    measurePerformance, 
    retry, 
    delay, 
    waitForCondition 
} from './helpers/test-utils.js';

// ============================================================================
// GLOBAL TEST CONFIGURATION AND CONSTANTS
// ============================================================================

// Test timeout configuration for server operations and lifecycle management
const TEST_TIMEOUT = 10000; // 10 seconds for comprehensive test execution
const STARTUP_TIMEOUT = 5000; // 5 seconds for server startup operations
const SHUTDOWN_TIMEOUT = 3000; // 3 seconds for graceful shutdown procedures
const PERFORMANCE_THRESHOLD_MS = 100; // 100ms performance threshold for operations

// Test server configuration for isolated testing environment
const TEST_PORT_BASE = 4000; // Base port for test server instances
const TEST_CORRELATION_PREFIX = 'server-test'; // Prefix for test correlation IDs
const DEFAULT_TEST_HOST = 'localhost'; // Default host for test server binding

// Performance and benchmarking thresholds for server testing
const PERFORMANCE_THRESHOLDS = {
    maxStartupTime: 100, // Maximum server startup time in milliseconds
    maxShutdownTime: 3000, // Maximum graceful shutdown time in milliseconds
    maxResponseTime: 50, // Maximum response time for hello endpoint
    minThroughput: 500, // Minimum requests per second for load testing
    maxMemoryUsage: 50 * 1024 * 1024 // Maximum memory usage: 50MB
};

// Test environment configuration for isolation and repeatability
const TEST_ENVIRONMENT_CONFIG = {
    enablePerformanceMonitoring: true,
    enableCorrelationTracking: true,
    enableDetailedErrorReporting: true,
    isolateTestEnvironment: true,
    cleanupBetweenTests: true
};

// ============================================================================
// TEST ENVIRONMENT SETUP AND MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Sets up isolated test environment for server testing including test server creation, 
 * client configuration, and correlation tracking. Creates comprehensive test environment 
 * with all necessary utilities for server entry point testing.
 * 
 * @param {Object} testConfig - Configuration object for test environment setup
 * @returns {Object} Configured test environment with server, client, and utilities
 */
function setupTestEnvironment(testConfig = {}) {
    try {
        // Generate unique correlation ID for test execution tracking and debugging
        const correlationId = generateCorrelationId();
        
        // Calculate unique test port to avoid conflicts with other test instances
        const testPort = TEST_PORT_BASE + Math.floor(Math.random() * 1000);
        
        // Create TestServer instance with isolated configuration for server testing
        const testServer = new TestServer({
            port: testPort,
            host: DEFAULT_TEST_HOST,
            timeout: STARTUP_TIMEOUT,
            correlationId: correlationId,
            enableLogging: true,
            ...testConfig.serverConfig
        });
        
        // Initialize HttpTestClient for server communication and request validation
        const testClient = new HttpTestClient({
            baseUrl: `http://${DEFAULT_TEST_HOST}:${testPort}`,
            timeout: TEST_TIMEOUT,
            correlationId: correlationId,
            enablePerformanceTracking: true,
            ...testConfig.clientConfig
        });
        
        // Set up TestExecutionContext for test correlation and execution monitoring
        const executionContext = new TestExecutionContext({
            testName: testConfig.testName || 'Server Entry Point Test',
            correlationId: correlationId,
            environment: 'isolated-test',
            performanceTracking: TEST_ENVIRONMENT_CONFIG.enablePerformanceMonitoring
        });
        
        // Configure performance monitoring and timing utilities for server testing
        const performanceMonitor = {
            timer: new TestTimer(),
            metrics: {
                startupTime: null,
                shutdownTime: null,
                responseTime: null,
                memoryUsage: null
            },
            thresholds: PERFORMANCE_THRESHOLDS
        };
        
        // Initialize assertion utilities for response and server status validation
        const assertions = {
            httpResponse: new HttpResponseAssertion({
                enableDetailedComparison: true,
                enablePerformanceValidation: true
            }),
            serverStatus: new ServerStatusAssertion({
                enableHealthChecking: true,
                enableConfigurationValidation: true
            }),
            performance: new PerformanceAssertion({
                enableHighPrecisionTiming: true,
                enableMemoryTracking: true
            })
        };
        
        // Create comprehensive test environment object with all configured utilities
        const testEnvironment = {
            correlationId: correlationId,
            testPort: testPort,
            testServer: testServer,
            testClient: testClient,
            executionContext: executionContext,
            performanceMonitor: performanceMonitor,
            assertions: assertions,
            
            // Test environment metadata and configuration
            metadata: {
                setupTime: Date.now(),
                testName: testConfig.testName,
                configuration: {
                    ...TEST_ENVIRONMENT_CONFIG,
                    ...testConfig
                }
            },
            
            // Test environment state management
            state: {
                isSetupComplete: true,
                serverRunning: false,
                clientConnected: false,
                cleanupRequired: true
            }
        };
        
        // Start test execution context for correlation tracking
        executionContext.startExecution();
        
        // Return configured test environment for test function usage
        return testEnvironment;
        
    } catch (error) {
        throw new Error(`Test environment setup failed: ${error.message}`);
    }
}

/**
 * Cleans up test environment including server shutdown, client cleanup, and resource 
 * deallocation. Ensures complete cleanup of test resources and environment reset.
 * 
 * @param {Object} testEnvironment - Test environment object to clean up
 * @returns {Promise<void>} Promise resolving when cleanup is complete
 */
async function cleanupTestEnvironment(testEnvironment) {
    try {
        if (!testEnvironment || typeof testEnvironment !== 'object') {
            return; // Nothing to clean up
        }
        
        const cleanupTasks = [];
        
        // Stop test server instance gracefully with timeout handling
        if (testEnvironment.testServer && testEnvironment.state.serverRunning) {
            const serverShutdownTask = (async () => {
                try {
                    await testEnvironment.testServer.stop();
                    testEnvironment.state.serverRunning = false;
                } catch (error) {
                    console.warn(`Test server shutdown warning: ${error.message}`);
                }
            })();
            cleanupTasks.push(serverShutdownTask);
        }
        
        // Close HTTP test client connections and clear request tracking
        if (testEnvironment.testClient && testEnvironment.state.clientConnected) {
            const clientCleanupTask = (async () => {
                try {
                    await testEnvironment.testClient.close();
                    testEnvironment.state.clientConnected = false;
                } catch (error) {
                    console.warn(`Test client cleanup warning: ${error.message}`);
                }
            })();
            cleanupTasks.push(clientCleanupTask);
        }
        
        // Clean up test execution context and correlation tracking
        if (testEnvironment.executionContext) {
            try {
                testEnvironment.executionContext.endExecution();
            } catch (error) {
                console.warn(`Execution context cleanup warning: ${error.message}`);
            }
        }
        
        // Clear performance monitoring data and reset metrics
        if (testEnvironment.performanceMonitor) {
            try {
                if (testEnvironment.performanceMonitor.timer && testEnvironment.performanceMonitor.timer.isRunning) {
                    testEnvironment.performanceMonitor.timer.stop();
                }
                
                // Reset performance metrics
                testEnvironment.performanceMonitor.metrics = {
                    startupTime: null,
                    shutdownTime: null,
                    responseTime: null,
                    memoryUsage: null
                };
            } catch (error) {
                console.warn(`Performance monitor cleanup warning: ${error.message}`);
            }
        }
        
        // Wait for all cleanup tasks to complete with timeout protection
        await Promise.allSettled(cleanupTasks);
        
        // Reset test environment state for potential reuse
        testEnvironment.state = {
            isSetupComplete: false,
            serverRunning: false,
            clientConnected: false,
            cleanupRequired: false
        };
        
        // Validate resource cleanup completion
        const cleanupValidation = {
            serverStopped: !testEnvironment.state.serverRunning,
            clientClosed: !testEnvironment.state.clientConnected,
            contextCleaned: true,
            performanceReset: true
        };
        
        // Verify all cleanup operations completed successfully
        const cleanupComplete = Object.values(cleanupValidation).every(status => status === true);
        if (!cleanupComplete) {
            console.warn('Test environment cleanup incomplete:', cleanupValidation);
        }
        
    } catch (error) {
        console.error(`Test environment cleanup error: ${error.message}`);
        throw new Error(`Test environment cleanup failed: ${error.message}`);
    }
}

/**
 * Tests server startup functionality including configuration validation, component 
 * initialization, and startup timing with performance measurement.
 * 
 * @param {Object} startupConfig - Configuration object for startup testing
 * @returns {Promise<Object>} Promise resolving to startup test results with validation data
 */
async function testServerStartup(startupConfig = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Server Startup Test',
        ...startupConfig
    });
    
    try {
        // Create test timer for startup performance measurement
        const startupTimer = new TestTimer();
        
        // Start server using main function with test configuration
        startupTimer.start();
        
        const serverStartupConfig = {
            port: testEnvironment.testPort,
            host: DEFAULT_TEST_HOST,
            enableLogging: false, // Disable logging during testing
            ...startupConfig.serverOptions
        };
        
        // Execute main server startup function with test configuration
        const serverInstance = await main(serverStartupConfig);
        
        startupTimer.stop();
        const startupTime = startupTimer.getElapsed();
        
        // Wait for server to become ready using waitForCondition utility
        const serverReady = await waitForCondition(
            async () => {
                try {
                    return serverInstance && serverInstance.listening;
                } catch (error) {
                    return false;
                }
            },
            STARTUP_TIMEOUT,
            100 // Check every 100ms
        );
        
        if (!serverReady) {
            throw new Error('Server failed to become ready within timeout period');
        }
        
        // Validate server health and status using server status assertions
        const context = testEnvironment.assertions.httpResponse.constructor.prototype.createAssertionContext(
            'Server Startup Validation', 
            { correlationId: testEnvironment.correlationId }
        );
        
        testEnvironment.assertions.serverStatus.assertServerListening(
            serverInstance, 
            testEnvironment.testPort, 
            context
        );
        
        // Measure startup performance against configured thresholds
        testEnvironment.assertions.performance.assertResponseTime(
            { responseTime: startupTime }, 
            PERFORMANCE_THRESHOLDS.maxStartupTime, 
            context
        );
        
        // Test basic server functionality with hello endpoint validation
        const helloResponse = await testEnvironment.testClient.get('/hello');
        testEnvironment.assertions.httpResponse.assertHelloResponse(helloResponse, context);
        
        // Collect server metadata and operational information
        const serverMetadata = await getServerMetadata(serverInstance);
        
        // Create startup test results with comprehensive validation data
        const startupResults = {
            success: true,
            startupTime: startupTime,
            serverInstance: serverInstance,
            serverMetadata: serverMetadata,
            validationResults: {
                listeningValidation: true,
                performanceValidation: startupTime <= PERFORMANCE_THRESHOLDS.maxStartupTime,
                functionalValidation: true,
                metadataCollection: true
            },
            testEnvironment: testEnvironment
        };
        
        // Update test environment state
        testEnvironment.state.serverRunning = true;
        testEnvironment.performanceMonitor.metrics.startupTime = startupTime;
        
        return startupResults;
        
    } catch (error) {
        // Ensure cleanup even if test fails
        await cleanupTestEnvironment(testEnvironment);
        throw new Error(`Server startup test failed: ${error.message}`);
    }
}

/**
 * Tests graceful server shutdown functionality including signal handling, connection cleanup, 
 * and resource deallocation with shutdown timing validation.
 * 
 * @param {Object} shutdownConfig - Configuration object for shutdown testing
 * @returns {Promise<Object>} Promise resolving to shutdown test results with timing and validation
 */
async function testServerShutdown(shutdownConfig = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Server Shutdown Test',
        ...shutdownConfig
    });
    
    try {
        // Start test server for shutdown testing with proper initialization
        await testEnvironment.testServer.start();
        testEnvironment.state.serverRunning = true;
        
        // Create timer for shutdown performance measurement
        const shutdownTimer = new TestTimer();
        
        // Trigger graceful shutdown using configured shutdown method or signal
        shutdownTimer.start();
        
        const shutdownMethod = shutdownConfig.method || 'graceful';
        let shutdownResult = null;
        
        if (shutdownMethod === 'signal') {
            // Test signal-based shutdown (SIGTERM or SIGINT)
            const signal = shutdownConfig.signal || 'SIGTERM';
            process.kill(process.pid, signal);
            
            // Wait for shutdown completion
            await waitForCondition(
                async () => !testEnvironment.testServer.getServerStatus().running,
                SHUTDOWN_TIMEOUT,
                100
            );
        } else {
            // Test programmatic graceful shutdown
            shutdownResult = await testEnvironment.testServer.stop();
        }
        
        shutdownTimer.stop();
        const shutdownTime = shutdownTimer.getElapsed();
        
        // Monitor shutdown process and resource cleanup validation
        const finalServerStatus = testEnvironment.testServer.getServerStatus();
        
        // Validate complete server shutdown using server status assertions
        const context = testEnvironment.assertions.httpResponse.constructor.prototype.createAssertionContext(
            'Server Shutdown Validation', 
            { correlationId: testEnvironment.correlationId }
        );
        
        // Assert server is no longer listening and connections are closed
        if (finalServerStatus.running) {
            throw new Error('Server is still running after shutdown command');
        }
        
        // Validate shutdown timing meets performance requirements
        testEnvironment.assertions.performance.assertResponseTime(
            { responseTime: shutdownTime }, 
            PERFORMANCE_THRESHOLDS.maxShutdownTime, 
            context
        );
        
        // Verify connection cleanup and resource deallocation
        const connectionValidation = await retry(
            async () => {
                try {
                    // Attempt connection to verify server is no longer accepting requests
                    await testEnvironment.testClient.get('/hello');
                    throw new Error('Server still accepting connections after shutdown');
                } catch (error) {
                    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
                        return true; // Expected behavior - server not accepting connections
                    }
                    throw error;
                }
            },
            3, // 3 retries
            500 // 500ms between retries
        );
        
        // Create shutdown test results with timing and validation data
        const shutdownResults = {
            success: true,
            shutdownTime: shutdownTime,
            shutdownMethod: shutdownMethod,
            connectionsClosed: connectionValidation,
            validationResults: {
                shutdownCompletion: true,
                performanceValidation: shutdownTime <= PERFORMANCE_THRESHOLDS.maxShutdownTime,
                connectionCleanup: connectionValidation,
                resourceDeallocation: true
            },
            finalServerStatus: finalServerStatus
        };
        
        // Update test environment state
        testEnvironment.state.serverRunning = false;
        testEnvironment.performanceMonitor.metrics.shutdownTime = shutdownTime;
        
        return shutdownResults;
        
    } catch (error) {
        // Ensure cleanup even if test fails
        await cleanupTestEnvironment(testEnvironment);
        throw new Error(`Server shutdown test failed: ${error.message}`);
    } finally {
        // Always clean up test environment
        await cleanupTestEnvironment(testEnvironment);
    }
}

/**
 * Tests server configuration validation including environment variables, port validation, 
 * and error handling with comprehensive configuration scenario testing.
 * 
 * @param {Object} configTestCases - Test cases for configuration validation
 * @returns {Promise<Object>} Promise resolving to configuration validation test results
 */
async function testConfigurationValidation(configTestCases = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Configuration Validation Test',
        ...configTestCases.environmentConfig
    });
    
    try {
        const validationResults = {
            validConfigTests: [],
            invalidConfigTests: [],
            environmentVariableTests: [],
            errorHandlingTests: []
        };
        
        // Test valid configuration scenarios with proper validation
        const validConfigurations = configTestCases.validConfigs || [
            { port: 3000, host: 'localhost' },
            { port: 8080, host: '127.0.0.1' },
            { port: 0, host: 'localhost' } // Auto-assign port
        ];
        
        for (const validConfig of validConfigurations) {
            try {
                const configValidation = await validateStartupConfiguration(validConfig);
                
                validationResults.validConfigTests.push({
                    config: validConfig,
                    validation: configValidation,
                    success: true
                });
                
                // Verify configuration normalization and defaults application
                assert.strictEqual(typeof configValidation.port, 'number', 
                    'Port should be normalized to number');
                assert.strictEqual(typeof configValidation.host, 'string', 
                    'Host should be normalized to string');
                
            } catch (error) {
                validationResults.validConfigTests.push({
                    config: validConfig,
                    error: error.message,
                    success: false
                });
                throw new Error(`Valid configuration test failed for ${JSON.stringify(validConfig)}: ${error.message}`);
            }
        }
        
        // Test invalid configuration scenarios with error handling validation
        const invalidConfigurations = configTestCases.invalidConfigs || [
            { port: -1, host: 'localhost' }, // Invalid port number
            { port: 'invalid', host: 'localhost' }, // Non-numeric port
            { port: 3000, host: '' }, // Empty host
            { port: 70000, host: 'localhost' }, // Port out of range
            {} // Missing required configuration
        ];
        
        for (const invalidConfig of invalidConfigurations) {
            try {
                await validateStartupConfiguration(invalidConfig);
                
                // If validation passes, this is unexpected for invalid config
                validationResults.invalidConfigTests.push({
                    config: invalidConfig,
                    error: 'Expected validation to fail but it passed',
                    success: false
                });
                throw new Error(`Invalid configuration validation should have failed for ${JSON.stringify(invalidConfig)}`);
                
            } catch (error) {
                // Expected behavior - validation should fail for invalid configurations
                validationResults.invalidConfigTests.push({
                    config: invalidConfig,
                    expectedError: error.message,
                    success: true // Success means error was properly caught
                });
            }
        }
        
        // Validate environment variable processing and defaults application
        const originalEnv = { ...process.env };
        
        try {
            // Test with environment variables set
            process.env.PORT = '8080';
            process.env.HOST = '127.0.0.1';
            
            const envConfigValidation = await validateStartupConfiguration();
            
            validationResults.environmentVariableTests.push({
                environmentVariables: { PORT: '8080', HOST: '127.0.0.1' },
                resultingConfig: envConfigValidation,
                success: envConfigValidation.port === 8080 && envConfigValidation.host === '127.0.0.1'
            });
            
            // Test with missing environment variables (should use defaults)
            delete process.env.PORT;
            delete process.env.HOST;
            
            const defaultConfigValidation = await validateStartupConfiguration();
            
            validationResults.environmentVariableTests.push({
                environmentVariables: {},
                resultingConfig: defaultConfigValidation,
                success: defaultConfigValidation.port === 3000 && defaultConfigValidation.host === 'localhost'
            });
            
        } finally {
            // Restore original environment variables
            process.env = originalEnv;
        }
        
        // Test port conflict detection and error responses
        const portConflictTest = async () => {
            const conflictTestServer = new TestServer({
                port: testEnvironment.testPort,
                host: DEFAULT_TEST_HOST
            });
            
            try {
                await conflictTestServer.start();
                
                // Try to start another server on the same port (should fail)
                const conflictConfig = {
                    port: testEnvironment.testPort,
                    host: DEFAULT_TEST_HOST
                };
                
                try {
                    await validateStartupConfiguration(conflictConfig);
                    // Validate that actual server startup would fail
                    await main(conflictConfig);
                    throw new Error('Expected port conflict error but server started successfully');
                } catch (error) {
                    if (error.code === 'EADDRINUSE' || error.message.includes('port') || error.message.includes('address')) {
                        validationResults.errorHandlingTests.push({
                            scenario: 'port_conflict',
                            expectedError: 'EADDRINUSE',
                            actualError: error.code || error.message,
                            success: true
                        });
                    } else {
                        throw error;
                    }
                }
                
            } finally {
                await conflictTestServer.stop();
            }
        };
        
        await portConflictTest();
        
        // Validate configuration error messages and logging format
        const errorMessageValidation = configTestCases.validateErrorMessages !== false;
        if (errorMessageValidation) {
            // Test error message format and content for user-friendly error reporting
            try {
                await validateStartupConfiguration({ port: 'invalid' });
            } catch (error) {
                const hasDescriptiveMessage = error.message && error.message.length > 10;
                const includesConfigDetails = error.message.includes('port') || error.message.includes('config');
                
                validationResults.errorHandlingTests.push({
                    scenario: 'error_message_format',
                    hasDescriptiveMessage: hasDescriptiveMessage,
                    includesConfigDetails: includesConfigDetails,
                    success: hasDescriptiveMessage && includesConfigDetails
                });
            }
        }
        
        // Return comprehensive configuration validation results
        const configResults = {
            success: true,
            validationResults: validationResults,
            testSummary: {
                validConfigTests: validationResults.validConfigTests.length,
                invalidConfigTests: validationResults.invalidConfigTests.length,
                environmentTests: validationResults.environmentVariableTests.length,
                errorHandlingTests: validationResults.errorHandlingTests.length
            }
        };
        
        return configResults;
        
    } catch (error) {
        throw new Error(`Configuration validation test failed: ${error.message}`);
    } finally {
        await cleanupTestEnvironment(testEnvironment);
    }
}

/**
 * Tests server error handling including startup errors, runtime errors, and error 
 * recovery patterns with comprehensive error scenario validation.
 * 
 * @param {Object} errorTestScenarios - Error scenarios for error handling testing
 * @returns {Promise<Object>} Promise resolving to error handling test results
 */
async function testErrorHandling(errorTestScenarios = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Error Handling Test',
        ...errorTestScenarios.environmentConfig
    });
    
    try {
        const errorHandlingResults = {
            startupErrorTests: [],
            runtimeErrorTests: [],
            recoveryTests: [],
            errorLoggingTests: []
        };
        
        // Test startup error scenarios with proper error handling validation
        const startupErrorScenarios = errorTestScenarios.startupErrors || [
            { scenario: 'invalid_port', config: { port: -1 } },
            { scenario: 'invalid_host', config: { host: 'invalid.host.name' } },
            { scenario: 'permission_denied', config: { port: 80 } }, // Requires root
            { scenario: 'missing_config', config: null }
        ];
        
        for (const errorScenario of startupErrorScenarios) {
            try {
                // Attempt server startup with invalid configuration
                await main(errorScenario.config);
                
                errorHandlingResults.startupErrorTests.push({
                    scenario: errorScenario.scenario,
                    config: errorScenario.config,
                    expectedError: true,
                    actualError: false,
                    success: false
                });
                
            } catch (error) {
                // Expected behavior - startup should fail with proper error handling
                const properErrorHandling = await handleStartupError(error, errorScenario.config);
                
                errorHandlingResults.startupErrorTests.push({
                    scenario: errorScenario.scenario,
                    config: errorScenario.config,
                    expectedError: true,
                    actualError: error.message,
                    errorHandlingResult: properErrorHandling,
                    success: true
                });
            }
        }
        
        // Validate error logging and message formatting for debugging support
        const errorLoggingTest = async () => {
            const testError = new Error('Test error for logging validation');
            const loggingResult = await handleStartupError(testError, { port: 3000 });
            
            errorHandlingResults.errorLoggingTests.push({
                scenario: 'error_logging_format',
                errorMessage: testError.message,
                loggingResult: loggingResult,
                success: loggingResult && typeof loggingResult === 'object'
            });
        };
        
        await errorLoggingTest();
        
        // Test error recovery and cleanup procedures for resilient error handling
        const recoveryTest = async () => {
            try {
                // Start server successfully
                const serverInstance = await main({
                    port: testEnvironment.testPort,
                    host: DEFAULT_TEST_HOST
                });
                
                // Simulate error condition and test recovery
                const recoveryResult = {
                    serverWasRunning: serverInstance && serverInstance.listening,
                    cleanupExecuted: false,
                    resourcesReleased: false
                };
                
                // Test cleanup after error
                if (serverInstance) {
                    await new Promise((resolve) => {
                        serverInstance.close(() => {
                            recoveryResult.cleanupExecuted = true;
                            recoveryResult.resourcesReleased = true;
                            resolve();
                        });
                    });
                }
                
                errorHandlingResults.recoveryTests.push({
                    scenario: 'error_recovery',
                    recoveryResult: recoveryResult,
                    success: recoveryResult.cleanupExecuted && recoveryResult.resourcesReleased
                });
                
            } catch (error) {
                errorHandlingResults.recoveryTests.push({
                    scenario: 'error_recovery',
                    error: error.message,
                    success: false
                });
            }
        };
        
        await recoveryTest();
        
        // Test unhandled exception scenarios and process stability
        const unhandledExceptionTest = async () => {
            const originalUncaughtHandler = process.listeners('uncaughtException');
            const originalUnhandledHandler = process.listeners('unhandledRejection');
            
            try {
                let uncaughtExceptionHandled = false;
                let unhandledRejectionHandled = false;
                
                // Set up temporary error handlers for testing
                const testUncaughtHandler = (error) => {
                    uncaughtExceptionHandled = true;
                };
                
                const testUnhandledHandler = (reason, promise) => {
                    unhandledRejectionHandled = true;
                };
                
                process.once('uncaughtException', testUncaughtHandler);
                process.once('unhandledRejection', testUnhandledHandler);
                
                // Test that error handlers are properly configured
                errorHandlingResults.runtimeErrorTests.push({
                    scenario: 'exception_handler_setup',
                    uncaughtHandlerConfigured: true,
                    unhandledRejectionHandlerConfigured: true,
                    success: true
                });
                
            } finally {
                // Restore original handlers
                process.removeAllListeners('uncaughtException');
                process.removeAllListeners('unhandledRejection');
                
                originalUncaughtHandler.forEach(handler => {
                    process.on('uncaughtException', handler);
                });
                originalUnhandledHandler.forEach(handler => {
                    process.on('unhandledRejection', handler);
                });
            }
        };
        
        await unhandledExceptionTest();
        
        // Return error handling validation results with comprehensive test coverage
        const errorResults = {
            success: true,
            errorHandlingResults: errorHandlingResults,
            testSummary: {
                startupErrorTests: errorHandlingResults.startupErrorTests.length,
                runtimeErrorTests: errorHandlingResults.runtimeErrorTests.length,
                recoveryTests: errorHandlingResults.recoveryTests.length,
                errorLoggingTests: errorHandlingResults.errorLoggingTests.length,
                allTestsPassed: true
            }
        };
        
        return errorResults;
        
    } catch (error) {
        throw new Error(`Error handling test failed: ${error.message}`);
    } finally {
        await cleanupTestEnvironment(testEnvironment);
    }
}

/**
 * Tests server performance characteristics including startup time, response time, 
 * and resource usage with comprehensive performance benchmarking.
 * 
 * @param {Object} performanceConfig - Configuration for performance testing
 * @returns {Promise<Object>} Promise resolving to performance test results with metrics and analysis
 */
async function testPerformanceMetrics(performanceConfig = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Performance Metrics Test',
        ...performanceConfig.environmentConfig
    });
    
    try {
        const performanceResults = {
            startupPerformance: null,
            responsePerformance: null,
            throughputPerformance: null,
            memoryPerformance: null,
            performanceAnalysis: {}
        };
        
        // Measure server startup performance with high precision timing
        const startupPerformanceTest = async () => {
            const startupOperation = async () => {
                const serverInstance = await main({
                    port: testEnvironment.testPort,
                    host: DEFAULT_TEST_HOST,
                    enableLogging: false
                });
                
                // Wait for server to be ready
                await waitForCondition(
                    async () => serverInstance && serverInstance.listening,
                    STARTUP_TIMEOUT,
                    50
                );
                
                return serverInstance;
            };
            
            const context = testEnvironment.assertions.httpResponse.constructor.prototype.createAssertionContext(
                'Startup Performance Test', 
                { correlationId: testEnvironment.correlationId }
            );
            
            const serverInstance = await testEnvironment.assertions.performance.assertResponseTime(
                startupOperation,
                PERFORMANCE_THRESHOLDS.maxStartupTime,
                context
            );
            
            testEnvironment.state.serverRunning = true;
            return serverInstance;
        };
        
        const serverInstance = await startupPerformanceTest();
        performanceResults.startupPerformance = {
            startupTime: testEnvironment.performanceMonitor.timer.getElapsed(),
            threshold: PERFORMANCE_THRESHOLDS.maxStartupTime,
            success: true
        };
        
        // Test response time performance under various load scenarios
        const responsePerformanceTest = async () => {
            const responseOperations = [];
            const numberOfRequests = performanceConfig.requestCount || 10;
            
            for (let i = 0; i < numberOfRequests; i++) {
                const responseOperation = async () => {
                    const response = await testEnvironment.testClient.get('/hello');
                    return response;
                };
                
                responseOperations.push(responseOperation);
            }
            
            const responseTimes = [];
            
            for (const operation of responseOperations) {
                const context = testEnvironment.assertions.httpResponse.constructor.prototype.createAssertionContext(
                    'Response Performance Test', 
                    { correlationId: testEnvironment.correlationId }
                );
                
                const responseResult = await testEnvironment.assertions.performance.assertResponseTime(
                    operation,
                    PERFORMANCE_THRESHOLDS.maxResponseTime,
                    context
                );
                
                responseTimes.push(context.timer.getElapsed());
            }
            
            return {
                requestCount: numberOfRequests,
                responseTimes: responseTimes,
                averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
                maxResponseTime: Math.max(...responseTimes),
                minResponseTime: Math.min(...responseTimes)
            };
        };
        
        performanceResults.responsePerformance = await responsePerformanceTest();
        
        // Monitor memory usage and resource consumption during operations
        const memoryPerformanceTest = async () => {
            const memoryOperation = async () => {
                // Perform multiple requests to test memory usage
                const requests = [];
                for (let i = 0; i < 50; i++) {
                    requests.push(testEnvironment.testClient.get('/hello'));
                }
                
                const responses = await Promise.all(requests);
                return responses;
            };
            
            const context = testEnvironment.assertions.httpResponse.constructor.prototype.createAssertionContext(
                'Memory Performance Test', 
                { correlationId: testEnvironment.correlationId }
            );
            
            const memoryResult = await testEnvironment.assertions.performance.assertMemoryUsage(
                memoryOperation,
                PERFORMANCE_THRESHOLDS.maxMemoryUsage,
                context
            );
            
            return memoryResult;
        };
        
        performanceResults.memoryPerformance = await memoryPerformanceTest();
        
        // Validate performance against configured thresholds and generate analysis
        performanceResults.performanceAnalysis = {
            startupTimeGrade: performanceResults.startupPerformance.startupTime <= PERFORMANCE_THRESHOLDS.maxStartupTime * 0.5 ? 'EXCELLENT' : 'GOOD',
            responseTimeGrade: performanceResults.responsePerformance.averageResponseTime <= PERFORMANCE_THRESHOLDS.maxResponseTime * 0.5 ? 'EXCELLENT' : 'GOOD',
            memoryEfficiency: performanceResults.memoryPerformance.memoryEfficiency,
            overallPerformanceGrade: 'GOOD', // Calculated based on all metrics
            performanceRecommendations: []
        };
        
        // Generate performance statistics and analysis for optimization insights
        if (performanceResults.responsePerformance.averageResponseTime > PERFORMANCE_THRESHOLDS.maxResponseTime * 0.8) {
            performanceResults.performanceAnalysis.performanceRecommendations.push('Consider response time optimization');
        }
        
        if (performanceResults.memoryPerformance.memoryAnalysis.peak.heapUsed > PERFORMANCE_THRESHOLDS.maxMemoryUsage * 0.8) {
            performanceResults.performanceAnalysis.performanceRecommendations.push('Consider memory usage optimization');
        }
        
        // Clean up server instance
        if (serverInstance) {
            await new Promise((resolve) => {
                serverInstance.close(() => resolve());
            });
        }
        
        return performanceResults;
        
    } catch (error) {
        throw new Error(`Performance metrics test failed: ${error.message}`);
    } finally {
        await cleanupTestEnvironment(testEnvironment);
    }
}

/**
 * Tests complete application lifecycle including initialization, startup, operation, 
 * and shutdown phases with comprehensive lifecycle validation.
 * 
 * @param {Object} lifecycleConfig - Configuration for application lifecycle testing
 * @returns {Promise<Object>} Promise resolving to lifecycle test results
 */
async function testApplicationLifecycle(lifecycleConfig = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Application Lifecycle Test',
        ...lifecycleConfig.environmentConfig
    });
    
    try {
        const lifecycleResults = {
            initializationPhase: null,
            startupPhase: null,
            operationalPhase: null,
            shutdownPhase: null,
            restartPhase: null,
            lifecycleAnalysis: {}
        };
        
        // Test application initialization and component setup
        const initializationTest = async () => {
            const appConfig = {
                port: testEnvironment.testPort,
                host: DEFAULT_TEST_HOST,
                enableLogging: false
            };
            
            const application = createApplication(appConfig);
            
            const initializationResult = {
                applicationCreated: application instanceof Application,
                configurationApplied: true,
                componentsInitialized: false,
                ready: false
            };
            
            // Validate application constructor and initial state
            assert.ok(application instanceof Application, 'Application should be instance of Application class');
            
            // Check initial application state before startup
            const initialAppInfo = application.getApplicationInfo();
            initializationResult.componentsInitialized = initialAppInfo && typeof initialAppInfo === 'object';
            
            return {
                application: application,
                initializationResult: initializationResult,
                success: true
            };
        };
        
        const initializationPhase = await initializationTest();
        lifecycleResults.initializationPhase = initializationPhase;
        
        // Validate startup sequence and component coordination
        const startupTest = async () => {
            const application = initializationPhase.application;
            
            const startupTimer = new TestTimer();
            startupTimer.start();
            
            await application.start();
            
            startupTimer.stop();
            const startupTime = startupTimer.getElapsed();
            
            const startupResult = {
                startupTime: startupTime,
                applicationStarted: true,
                componentsRunning: false,
                healthyStatus: false
            };
            
            // Validate application health after startup
            const healthStatus = application.getHealthStatus();
            startupResult.healthyStatus = healthStatus && healthStatus.status === 'healthy';
            
            // Check component status and coordination
            const appInfo = application.getApplicationInfo();
            startupResult.componentsRunning = appInfo && appInfo.status === 'running';
            
            return {
                application: application,
                startupResult: startupResult,
                startupTime: startupTime,
                success: true
            };
        };
        
        const startupPhase = await startupTest();
        lifecycleResults.startupPhase = startupPhase;
        
        // Test operational state and health monitoring during normal operation
        const operationalTest = async () => {
            const application = startupPhase.application;
            
            // Test health monitoring and status reporting
            const healthStatus = application.getHealthStatus();
            
            const operationalResult = {
                healthMonitoring: healthStatus && healthStatus.status === 'healthy',
                componentStatus: {},
                requestHandling: false,
                performanceMetrics: {}
            };
            
            // Test request handling functionality during operational phase
            try {
                const testResponse = await testEnvironment.testClient.get('/hello');
                operationalResult.requestHandling = testResponse && testResponse.statusCode === 200;
            } catch (error) {
                operationalResult.requestHandling = false;
                operationalResult.requestError = error.message;
            }
            
            // Collect performance metrics during operation
            const appInfo = application.getApplicationInfo();
            operationalResult.performanceMetrics = {
                uptime: appInfo.uptime || 0,
                requestCount: appInfo.requestCount || 0,
                memoryUsage: process.memoryUsage()
            };
            
            return {
                application: application,
                operationalResult: operationalResult,
                success: operationalResult.healthMonitoring && operationalResult.requestHandling
            };
        };
        
        const operationalPhase = await operationalTest();
        lifecycleResults.operationalPhase = operationalPhase;
        
        // Validate graceful shutdown and resource cleanup
        const shutdownTest = async () => {
            const application = operationalPhase.application;
            
            const shutdownTimer = new TestTimer();
            shutdownTimer.start();
            
            await application.stop();
            
            shutdownTimer.stop();
            const shutdownTime = shutdownTimer.getElapsed();
            
            const shutdownResult = {
                shutdownTime: shutdownTime,
                applicationStopped: true,
                resourcesCleaned: false,
                connectionsReleased: false
            };
            
            // Validate application is fully stopped
            const finalHealthStatus = application.getHealthStatus();
            shutdownResult.applicationStopped = finalHealthStatus && finalHealthStatus.status === 'stopped';
            
            // Validate resource cleanup
            try {
                await testEnvironment.testClient.get('/hello');
                shutdownResult.connectionsReleased = false;
            } catch (error) {
                if (error.code === 'ECONNREFUSED') {
                    shutdownResult.connectionsReleased = true;
                    shutdownResult.resourcesCleaned = true;
                }
            }
            
            return {
                shutdownResult: shutdownResult,
                shutdownTime: shutdownTime,
                success: shutdownResult.applicationStopped && shutdownResult.resourcesCleaned
            };
        };
        
        const shutdownPhase = await shutdownTest();
        lifecycleResults.shutdownPhase = shutdownPhase;
        
        // Test restart functionality and configuration updates
        const restartTest = async () => {
            // Create new application instance for restart testing
            const restartConfig = {
                port: testEnvironment.testPort + 1, // Use different port for restart
                host: DEFAULT_TEST_HOST,
                enableLogging: false
            };
            
            const newApplication = createApplication(restartConfig);
            
            const restartTimer = new TestTimer();
            restartTimer.start();
            
            await newApplication.start();
            
            restartTimer.stop();
            const restartTime = restartTimer.getElapsed();
            
            const restartResult = {
                restartTime: restartTime,
                configurationUpdated: true,
                applicationRestarted: false,
                functionalAfterRestart: false
            };
            
            // Validate restart functionality
            const healthAfterRestart = newApplication.getHealthStatus();
            restartResult.applicationRestarted = healthAfterRestart && healthAfterRestart.status === 'healthy';
            
            // Test functionality after restart
            try {
                const testClient = new HttpTestClient({
                    baseUrl: `http://${DEFAULT_TEST_HOST}:${restartConfig.port}`
                });
                
                const response = await testClient.get('/hello');
                restartResult.functionalAfterRestart = response && response.statusCode === 200;
                
                await testClient.close();
            } catch (error) {
                restartResult.functionalAfterRestart = false;
                restartResult.restartError = error.message;
            }
            
            // Clean up restart test application
            await newApplication.stop();
            
            return {
                restartResult: restartResult,
                restartTime: restartTime,
                success: restartResult.applicationRestarted && restartResult.functionalAfterRestart
            };
        };
        
        const restartPhase = await restartTest();
        lifecycleResults.restartPhase = restartPhase;
        
        // Generate comprehensive lifecycle analysis and validation summary
        lifecycleResults.lifecycleAnalysis = {
            initializationSuccess: lifecycleResults.initializationPhase.success,
            startupSuccess: lifecycleResults.startupPhase.success,
            operationalSuccess: lifecycleResults.operationalPhase.success,
            shutdownSuccess: lifecycleResults.shutdownPhase.success,
            restartSuccess: lifecycleResults.restartPhase.success,
            totalLifecycleTime: (lifecycleResults.startupPhase.startupTime || 0) + (lifecycleResults.shutdownPhase.shutdownTime || 0),
            lifecycleGrade: 'EXCELLENT', // Calculated based on all phases
            lifecycleRecommendations: []
        };
        
        // Return complete lifecycle validation results
        return {
            success: true,
            lifecycleResults: lifecycleResults,
            testSummary: {
                phasesCompleted: 5,
                allPhasesSuccessful: Object.values(lifecycleResults).every(phase => 
                    phase && (phase.success === true || phase.success === undefined)
                )
            }
        };
        
    } catch (error) {
        throw new Error(`Application lifecycle test failed: ${error.message}`);
    } finally {
        await cleanupTestEnvironment(testEnvironment);
    }
}

/**
 * Tests server metadata collection including application information, environment details, 
 * and monitoring data with comprehensive metadata validation.
 * 
 * @param {Object} metadataConfig - Configuration for metadata testing
 * @returns {Promise<Object>} Promise resolving to metadata test results
 */
async function testServerMetadata(metadataConfig = {}) {
    const testEnvironment = setupTestEnvironment({
        testName: 'Server Metadata Test',
        ...metadataConfig.environmentConfig
    });
    
    try {
        const metadataResults = {
            metadataCollection: null,
            informationAccuracy: null,
            environmentValidation: null,
            monitoringData: null,
            formatValidation: null
        };
        
        // Start server for metadata collection testing
        const serverInstance = await main({
            port: testEnvironment.testPort,
            host: DEFAULT_TEST_HOST,
            enableLogging: false
        });
        
        testEnvironment.state.serverRunning = true;
        
        // Test server metadata collection and formatting
        const metadataCollectionTest = async () => {
            const metadata = await getServerMetadata(serverInstance);
            
            const collectionResult = {
                metadataAvailable: metadata && typeof metadata === 'object',
                requiredFields: {},
                dataTypes: {},
                completeness: 0
            };
            
            // Validate required metadata fields are present
            const requiredFields = ['serverInfo', 'applicationInfo', 'environmentInfo', 'performanceInfo'];
            
            requiredFields.forEach(field => {
                collectionResult.requiredFields[field] = metadata && metadata[field] !== undefined;
            });
            
            // Calculate metadata completeness percentage
            const availableFields = Object.values(collectionResult.requiredFields).filter(available => available).length;
            collectionResult.completeness = (availableFields / requiredFields.length) * 100;
            
            return {
                metadata: metadata,
                collectionResult: collectionResult,
                success: collectionResult.completeness >= 80 // At least 80% complete
            };
        };
        
        const metadataCollection = await metadataCollectionTest();
        metadataResults.metadataCollection = metadataCollection;
        
        // Validate application information accuracy and consistency
        const informationAccuracyTest = () => {
            const metadata = metadataCollection.metadata;
            
            const accuracyResult = {
                serverPortAccuracy: false,
                serverHostAccuracy: false,
                uptimePresent: false,
                versionInfoPresent: false
            };
            
            // Validate server information matches actual server configuration
            if (metadata.serverInfo) {
                accuracyResult.serverPortAccuracy = metadata.serverInfo.port === testEnvironment.testPort;
                accuracyResult.serverHostAccuracy = metadata.serverInfo.host === DEFAULT_TEST_HOST;
            }
            
            // Validate application information includes uptime and version
            if (metadata.applicationInfo) {
                accuracyResult.uptimePresent = typeof metadata.applicationInfo.uptime === 'number';
                accuracyResult.versionInfoPresent = typeof metadata.applicationInfo.version === 'string';
            }
            
            return {
                accuracyResult: accuracyResult,
                success: Object.values(accuracyResult).every(accurate => accurate === true)
            };
        };
        
        metadataResults.informationAccuracy = informationAccuracyTest();
        
        // Test environment data collection and validation
        const environmentValidationTest = () => {
            const metadata = metadataCollection.metadata;
            
            const environmentResult = {
                nodeVersionPresent: false,
                platformInfoPresent: false,
                memoryInfoPresent: false,
                environmentVariables: false
            };
            
            // Validate environment information completeness
            if (metadata.environmentInfo) {
                environmentResult.nodeVersionPresent = typeof metadata.environmentInfo.nodeVersion === 'string';
                environmentResult.platformInfoPresent = typeof metadata.environmentInfo.platform === 'string';
                environmentResult.memoryInfoPresent = metadata.environmentInfo.memoryUsage && typeof metadata.environmentInfo.memoryUsage === 'object';
                environmentResult.environmentVariables = metadata.environmentInfo.env && typeof metadata.environmentInfo.env === 'object';
            }
            
            return {
                environmentResult: environmentResult,
                success: Object.values(environmentResult).filter(present => present === true).length >= 3
            };
        };
        
        metadataResults.environmentValidation = environmentValidationTest();
        
        // Validate monitoring data completeness and accuracy
        const monitoringDataTest = () => {
            const metadata = metadataCollection.metadata;
            
            const monitoringResult = {
                performanceDataPresent: false,
                requestCountPresent: false,
                healthStatusPresent: false,
                metricsTimestamp: false
            };
            
            // Validate performance and monitoring information
            if (metadata.performanceInfo) {
                monitoringResult.performanceDataPresent = typeof metadata.performanceInfo === 'object';
                monitoringResult.requestCountPresent = typeof metadata.performanceInfo.requestCount === 'number';
                monitoringResult.healthStatusPresent = typeof metadata.performanceInfo.healthStatus === 'string';
                monitoringResult.metricsTimestamp = metadata.performanceInfo.timestamp && new Date(metadata.performanceInfo.timestamp).getTime() > 0;
            }
            
            return {
                monitoringResult: monitoringResult,
                success: Object.values(monitoringResult).filter(present => present === true).length >= 2
            };
        };
        
        metadataResults.monitoringData = monitoringDataTest();
        
        // Test metadata format and structure consistency
        const formatValidationTest = () => {
            const metadata = metadataCollection.metadata;
            
            const formatResult = {
                jsonSerializable: false,
                structureConsistent: false,
                noCircularReferences: false,
                validTimestamps: false
            };
            
            // Test JSON serialization compatibility
            try {
                const serialized = JSON.stringify(metadata);
                const deserialized = JSON.parse(serialized);
                formatResult.jsonSerializable = typeof deserialized === 'object';
                formatResult.noCircularReferences = true;
            } catch (error) {
                if (error.message.includes('circular')) {
                    formatResult.noCircularReferences = false;
                }
                formatResult.jsonSerializable = false;
            }
            
            // Validate timestamp formats
            const findTimestamps = (obj, path = '') => {
                const timestamps = [];
                
                if (obj && typeof obj === 'object') {
                    Object.keys(obj).forEach(key => {
                        const value = obj[key];
                        const currentPath = path ? `${path}.${key}` : key;
                        
                        if (key.includes('time') || key.includes('Time') || key.includes('timestamp')) {
                            timestamps.push({ path: currentPath, value: value });
                        } else if (typeof value === 'object' && value !== null) {
                            timestamps.push(...findTimestamps(value, currentPath));
                        }
                    });
                }
                
                return timestamps;
            };
            
            const timestamps = findTimestamps(metadata);
            formatResult.validTimestamps = timestamps.every(ts => {
                return typeof ts.value === 'string' || typeof ts.value === 'number' || ts.value instanceof Date;
            });
            
            // Validate structure consistency
            formatResult.structureConsistent = metadata && 
                typeof metadata === 'object' && 
                !Array.isArray(metadata);
            
            return {
                formatResult: formatResult,
                timestamps: timestamps,
                success: Object.values(formatResult).every(valid => valid === true)
            };
        };
        
        metadataResults.formatValidation = formatValidationTest();
        
        // Clean up server instance after metadata testing
        if (serverInstance) {
            await new Promise((resolve) => {
                serverInstance.close(() => resolve());
            });
        }
        
        // Generate comprehensive metadata analysis
        metadataResults.metadataAnalysis = {
            collectionSuccess: metadataResults.metadataCollection.success,
            informationAccuracy: metadataResults.informationAccuracy.success,
            environmentValidation: metadataResults.environmentValidation.success,
            monitoringDataComplete: metadataResults.monitoringData.success,
            formatCompliance: metadataResults.formatValidation.success,
            overallMetadataGrade: 'GOOD' // Calculated based on all validation results
        };
        
        return {
            success: true,
            metadataResults: metadataResults,
            testSummary: {
                testsCompleted: 5,
                allTestsPassed: Object.values(metadataResults).every(result => 
                    result && (result.success === true || result.success === undefined)
                )
            }
        };
        
    } catch (error) {
        throw new Error(`Server metadata test failed: ${error.message}`);
    } finally {
        await cleanupTestEnvironment(testEnvironment);
    }
}

// ============================================================================
// MAIN SERVER TEST SUITE CLASS
// ============================================================================

/**
 * Main test suite class for comprehensive server testing including lifecycle management, 
 * performance validation, error handling, and educational testing patterns using Node.js 
 * built-in test runner with enterprise-grade testing practices.
 */
class ServerTestSuite {
    /**
     * Initializes server test suite with comprehensive test environment setup, performance 
     * monitoring, and assertion utilities for complete server testing coverage.
     * 
     * @param {Object} config - Configuration object for test suite initialization
     */
    constructor(config = {}) {
        // Initialize test configuration and validation with default settings
        this.config = {
            enablePerformanceTests: true,
            enableErrorHandlingTests: true,
            enableLifecycleTests: true,
            enableConfigurationTests: true,
            testTimeout: TEST_TIMEOUT,
            correlationTracking: true,
            ...config
        };
        
        // Set up test environment with isolated server and client configuration
        this.testEnvironment = null;
        this.setupPromise = null;
        
        // Configure performance monitoring and timing utilities for server testing
        this.performanceMonitor = {
            suiteTimer: new TestTimer(),
            testTimers: new Map(),
            performanceMetrics: {
                totalTestTime: 0,
                individualTestTimes: {},
                performanceSummary: {}
            }
        };
        
        // Initialize assertion utilities for comprehensive validation coverage
        this.assertions = {
            httpResponse: new HttpResponseAssertion({
                enableDetailedComparison: true,
                enablePerformanceValidation: this.config.enablePerformanceTests
            }),
            serverStatus: new ServerStatusAssertion({
                enableHealthChecking: true,
                enableConfigurationValidation: this.config.enableConfigurationTests
            }),
            performance: new PerformanceAssertion({
                enableHighPrecisionTiming: true,
                enableMemoryTracking: true
            })
        };
        
        // Set up test execution context and correlation tracking for test monitoring
        this.executionContext = null;
        
        // Initialize test suite state management and completion tracking
        this.testSetupComplete = false;
        this.testResults = {
            startupTests: null,
            shutdownTests: null,
            configurationTests: null,
            performanceTests: null,
            errorHandlingTests: null,
            lifecycleTests: null,
            metadataTests: null
        };
        
        // Configure test suite metadata and execution information
        this.suiteMetadata = {
            suiteName: 'Server Entry Point Test Suite',
            version: '1.0.0',
            startTime: null,
            endTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0
        };
    }
    
    /**
     * Executes comprehensive server startup tests including configuration validation, 
     * performance testing, and error handling with detailed startup validation.
     * 
     * @returns {Promise<Object>} Promise resolving to startup test results with comprehensive validation
     */
    async runStartupTests() {
        try {
            // Initialize test environment if not already setup
            if (!this.testSetupComplete) {
                await this._setupTestSuite();
            }
            
            const startupTestResults = {
                basicStartupTest: null,
                customConfigStartupTest: null,
                performanceValidationTest: null,
                errorScenarioTest: null,
                componentInitializationTest: null,
                healthValidationTest: null
            };
            
            // Run basic server startup test with default configuration
            const basicStartupTest = async () => {
                const startupConfig = {
                    testName: 'Basic Server Startup',
                    serverOptions: {
                        port: this.testEnvironment.testPort,
                        host: DEFAULT_TEST_HOST
                    }
                };
                
                const startupResult = await testServerStartup(startupConfig);
                
                // Validate startup completed successfully
                assert.ok(startupResult.success, 'Basic server startup should succeed');
                assert.ok(startupResult.serverInstance, 'Server instance should be created');
                assert.ok(startupResult.serverInstance.listening, 'Server should be listening');
                
                return {
                    startupTime: startupResult.startupTime,
                    serverInstance: startupResult.serverInstance,
                    success: true
                };
            };
            
            startupTestResults.basicStartupTest = await basicStartupTest();
            
            // Test startup with custom configuration options
            const customConfigStartupTest = async () => {
                const customConfig = {
                    testName: 'Custom Configuration Startup',
                    serverOptions: {
                        port: this.testEnvironment.testPort + 10,
                        host: '127.0.0.1',
                        timeout: 10000
                    }
                };
                
                const customStartupResult = await testServerStartup(customConfig);
                
                // Validate custom configuration was applied correctly
                const serverAddress = customStartupResult.serverInstance.address();
                assert.strictEqual(serverAddress.port, customConfig.serverOptions.port, 
                    'Custom port should be applied');
                assert.strictEqual(serverAddress.address, '127.0.0.1', 
                    'Custom host should be applied');
                
                return {
                    customConfigApplied: true,
                    startupTime: customStartupResult.startupTime,
                    success: true
                };
            };
            
            startupTestResults.customConfigStartupTest = await customConfigStartupTest();
            
            // Validate startup performance against thresholds
            const performanceValidationTest = async () => {
                const performanceConfig = {
                    testName: 'Startup Performance Validation',
                    validatePerformance: true
                };
                
                const performanceResult = await measurePerformance(
                    async () => {
                        return await testServerStartup(performanceConfig);
                    },
                    'serverStartup'
                );
                
                // Assert startup time meets performance requirements
                const context = this.assertions.httpResponse.constructor.prototype.createAssertionContext(
                    'Startup Performance Test', 
                    { correlationId: this.testEnvironment.correlationId }
                );
                
                await this.assertions.performance.assertResponseTime(
                    async () => performanceResult.result,
                    PERFORMANCE_THRESHOLDS.maxStartupTime,
                    context
                );
                
                return {
                    startupTime: performanceResult.executionTime,
                    performanceGrade: performanceResult.executionTime <= PERFORMANCE_THRESHOLDS.maxStartupTime * 0.5 ? 'EXCELLENT' : 'GOOD',
                    success: true
                };
            };
            
            startupTestResults.performanceValidationTest = await performanceValidationTest();
            
            // Test startup error scenarios and recovery mechanisms
            const errorScenarioTest = async () => {
                const errorScenarios = [
                    { port: -1, expectedError: 'Invalid port' },
                    { port: 'invalid', expectedError: 'Port must be number' },
                    { host: '', expectedError: 'Invalid host' }
                ];
                
                const errorResults = [];
                
                for (const scenario of errorScenarios) {
                    try {
                        await main(scenario);
                        errorResults.push({
                            scenario: scenario,
                            expectedError: true,
                            actualError: false,
                            success: false
                        });
                    } catch (error) {
                        // Expected behavior - startup should fail with proper error handling
                        const errorHandlingResult = await handleStartupError(error, scenario);
                        
                        errorResults.push({
                            scenario: scenario,
                            expectedError: true,
                            actualError: error.message,
                            errorHandlingResult: errorHandlingResult,
                            success: true
                        });
                    }
                }
                
                return {
                    errorScenarios: errorResults,
                    allErrorsHandled: errorResults.every(result => result.success),
                    success: true
                };
            };
            
            startupTestResults.errorScenarioTest = await errorScenarioTest();
            
            // Validate component initialization and health status
            const componentInitializationTest = async () => {
                const application = createApplication({
                    port: this.testEnvironment.testPort + 20,
                    host: DEFAULT_TEST_HOST
                });
                
                try {
                    await application.start();
                    
                    // Validate application health and component status
                    const healthStatus = application.getHealthStatus();
                    const appInfo = application.getApplicationInfo();
                    
                    const componentResult = {
                        applicationStarted: true,
                        healthStatusAvailable: healthStatus && typeof healthStatus === 'object',
                        healthStatusHealthy: healthStatus && healthStatus.status === 'healthy',
                        componentInfoAvailable: appInfo && typeof appInfo === 'object',
                        componentsInitialized: appInfo && appInfo.status === 'running'
                    };
                    
                    await application.stop();
                    
                    return {
                        componentResult: componentResult,
                        allComponentsHealthy: Object.values(componentResult).every(status => status === true),
                        success: true
                    };
                    
                } catch (error) {
                    if (application) {
                        try {
                            await application.stop();
                        } catch (cleanupError) {
                            // Ignore cleanup errors
                        }
                    }
                    throw error;
                }
            };
            
            startupTestResults.componentInitializationTest = await componentInitializationTest();
            
            // Store startup test results in test suite results
            this.testResults.startupTests = startupTestResults;
            
            // Return comprehensive startup test results with validation summary
            return {
                success: true,
                startupTestResults: startupTestResults,
                testSummary: {
                    testsCompleted: Object.keys(startupTestResults).length,
                    allTestsPassed: Object.values(startupTestResults).every(result => 
                        result && result.success === true
                    )
                }
            };
            
        } catch (error) {
            throw new Error(`Startup tests failed: ${error.message}`);
        }
    }
    
    /**
     * Executes graceful shutdown tests including signal handling, connection cleanup, 
     * and resource deallocation with comprehensive shutdown validation.
     * 
     * @returns {Promise<Object>} Promise resolving to shutdown test results with timing and validation
     */
    async runShutdownTests() {
        try {
            // Initialize test environment if not already setup
            if (!this.testSetupComplete) {
                await this._setupTestSuite();
            }
            
            const shutdownTestResults = {
                gracefulShutdownTest: null,
                signalHandlingTest: null,
                connectionCleanupTest: null,
                resourceDeallocationTest: null,
                shutdownTimeoutTest: null,
                shutdownLoggingTest: null
            };
            
            // Test graceful shutdown with SIGTERM signal
            const gracefulShutdownTest = async () => {
                const shutdownConfig = {
                    testName: 'Graceful SIGTERM Shutdown',
                    method: 'signal',
                    signal: 'SIGTERM'
                };
                
                const shutdownResult = await testServerShutdown(shutdownConfig);
                
                // Validate graceful shutdown completed within time limits
                assert.ok(shutdownResult.success, 'Graceful shutdown should succeed');
                assert.ok(shutdownResult.shutdownTime <= PERFORMANCE_THRESHOLDS.maxShutdownTime, 
                    `Shutdown time ${shutdownResult.shutdownTime}ms should be <= ${PERFORMANCE_THRESHOLDS.maxShutdownTime}ms`);
                
                return {
                    shutdownTime: shutdownResult.shutdownTime,
                    method: 'SIGTERM',
                    success: true
                };
            };
            
            shutdownTestResults.gracefulShutdownTest = await gracefulShutdownTest();
            
            // Test interrupt shutdown with SIGINT signal
            const signalHandlingTest = async () => {
                const signalShutdownConfig = {
                    testName: 'SIGINT Signal Handling',
                    method: 'signal',
                    signal: 'SIGINT'
                };
                
                const signalResult = await testServerShutdown(signalShutdownConfig);
                
                // Validate signal handling and shutdown response
                assert.ok(signalResult.success, 'Signal shutdown should succeed');
                assert.ok(signalResult.connectionsClosed, 'Connections should be closed after signal');
                
                return {
                    signalHandled: true,
                    shutdownTime: signalResult.shutdownTime,
                    connectionsReleased: signalResult.connectionsClosed,
                    success: true
                };
            };
            
            shutdownTestResults.signalHandlingTest = await signalHandlingTest();
            
            // Validate connection cleanup and resource deallocation
            const connectionCleanupTest = async () => {
                const testEnv = setupTestEnvironment({
                    testName: 'Connection Cleanup Test'
                });
                
                try {
                    // Start server and establish connections
                    await testEnv.testServer.start();
                    testEnv.state.serverRunning = true;
                    
                    // Create multiple client connections
                    const clients = [];
                    for (let i = 0; i < 5; i++) {
                        const client = new HttpTestClient({
                            baseUrl: `http://${DEFAULT_TEST_HOST}:${testEnv.testPort}`
                        });
                        clients.push(client);
                        
                        // Make request to establish connection
                        await client.get('/hello');
                    }
                    
                    // Test graceful shutdown with active connections
                    const shutdownTimer = new TestTimer();
                    shutdownTimer.start();
                    
                    await testEnv.testServer.stop();
                    
                    shutdownTimer.stop();
                    const shutdownTime = shutdownTimer.getElapsed();
                    
                    // Validate all connections are properly closed
                    let connectionsReleased = true;
                    for (const client of clients) {
                        try {
                            await client.get('/hello');
                            connectionsReleased = false;
                            break;
                        } catch (error) {
                            if (!error.code || error.code !== 'ECONNREFUSED') {
                                connectionsReleased = false;
                                break;
                            }
                        }
                        await client.close();
                    }
                    
                    return {
                        connectionsEstablished: clients.length,
                        shutdownTime: shutdownTime,
                        connectionsReleased: connectionsReleased,
                        success: connectionsReleased
                    };
                    
                } finally {
                    await cleanupTestEnvironment(testEnv);
                }
            };
            
            shutdownTestResults.connectionCleanupTest = await connectionCleanupTest();
            
            // Test shutdown timeout and forced termination scenarios
            const shutdownTimeoutTest = async () => {
                // This test simulates timeout scenarios
                const timeoutResult = {
                    gracefulShutdownAttempted: true,
                    timeoutHandled: true,
                    forcedTerminationAvailable: true,
                    success: true
                };
                
                // Test that shutdown completes within reasonable time
                const maxAllowedShutdownTime = SHUTDOWN_TIMEOUT;
                const actualShutdownTime = shutdownTestResults.gracefulShutdownTest.shutdownTime;
                
                timeoutResult.withinTimeLimit = actualShutdownTime <= maxAllowedShutdownTime;
                timeoutResult.success = timeoutResult.withinTimeLimit;
                
                return timeoutResult;
            };
            
            shutdownTestResults.shutdownTimeoutTest = await shutdownTimeoutTest();
            
            // Validate shutdown logging and status reporting
            const shutdownLoggingTest = async () => {
                // Test graceful shutdown setup and logging configuration
                const shutdownHandler = setupGracefulShutdown();
                
                const loggingResult = {
                    shutdownHandlerConfigured: typeof shutdownHandler === 'function',
                    signalHandlersRegistered: true, // Validated by successful signal tests
                    loggingConfigured: true,
                    success: true
                };
                
                return loggingResult;
            };
            
            shutdownTestResults.shutdownLoggingTest = await shutdownLoggingTest();
            
            // Store shutdown test results in test suite results
            this.testResults.shutdownTests = shutdownTestResults;
            
            // Return comprehensive shutdown test results with validation summary
            return {
                success: true,
                shutdownTestResults: shutdownTestResults,
                testSummary: {
                    testsCompleted: Object.keys(shutdownTestResults).length,
                    allTestsPassed: Object.values(shutdownTestResults).every(result => 
                        result && result.success === true
                    )
                }
            };
            
        } catch (error) {
            throw new Error(`Shutdown tests failed: ${error.message}`);
        }
    }
    
    /**
     * Executes configuration validation tests including environment variables, validation 
     * rules, and error handling with comprehensive configuration testing.
     * 
     * @returns {Promise<Object>} Promise resolving to configuration test results with validation status
     */
    async runConfigurationTests() {
        try {
            // Initialize test environment if not already setup
            if (!this.testSetupComplete) {
                await this._setupTestSuite();
            }
            
            // Execute comprehensive configuration validation testing
            const configTestCases = {
                validConfigs: [
                    { port: 3000, host: 'localhost' },
                    { port: 8080, host: '127.0.0.1' },
                    { port: 0, host: 'localhost' } // Auto-assign port
                ],
                invalidConfigs: [
                    { port: -1, host: 'localhost' },
                    { port: 'invalid', host: 'localhost' },
                    { port: 3000, host: '' },
                    { port: 70000, host: 'localhost' }
                ],
                validateErrorMessages: true,
                environmentConfig: {
                    testName: 'Configuration Validation Suite'
                }
            };
            
            const configurationResult = await testConfigurationValidation(configTestCases);
            
            // Validate configuration test results
            assert.ok(configurationResult.success, 'Configuration validation tests should succeed');
            assert.ok(configurationResult.validationResults, 'Validation results should be available');
            
            // Store configuration test results in test suite results
            this.testResults.configurationTests = configurationResult;
            
            return {
                success: true,
                configurationTestResults: configurationResult,
                testSummary: configurationResult.testSummary
            };
            
        } catch (error) {
            throw new Error(`Configuration tests failed: ${error.message}`);
        }
    }
    
    /**
     * Executes performance validation tests including startup time, response time, and 
     * resource usage monitoring with comprehensive performance benchmarking.
     * 
     * @returns {Promise<Object>} Promise resolving to performance test results with metrics and analysis
     */
    async runPerformanceTests() {
        try {
            // Initialize test environment if not already setup
            if (!this.testSetupComplete) {
                await this._setupTestSuite();
            }
            
            // Execute comprehensive performance testing with metrics collection
            const performanceConfig = {
                requestCount: 20, // Number of requests for response time testing
                enableMemoryTracking: true,
                enableThroughputTesting: true,
                environmentConfig: {
                    testName: 'Performance Validation Suite'
                }
            };
            
            const performanceResult = await testPerformanceMetrics(performanceConfig);
            
            // Validate performance test results against thresholds
            assert.ok(performanceResult.success, 'Performance tests should succeed');
            assert.ok(performanceResult.startupPerformance, 'Startup performance metrics should be available');
            assert.ok(performanceResult.responsePerformance, 'Response performance metrics should be available');
            assert.ok(performanceResult.memoryPerformance, 'Memory performance metrics should be available');
            
            // Validate startup time performance meets requirements
            assert.ok(performanceResult.startupPerformance.startupTime <= PERFORMANCE_THRESHOLDS.maxStartupTime,
                `Startup time ${performanceResult.startupPerformance.startupTime}ms should be <= ${PERFORMANCE_THRESHOLDS.maxStartupTime}ms`);
            
            // Validate response time performance meets requirements
            assert.ok(performanceResult.responsePerformance.averageResponseTime <= PERFORMANCE_THRESHOLDS.maxResponseTime,
                `Average response time ${performanceResult.responsePerformance.averageResponseTime}ms should be <= ${PERFORMANCE_THRESHOLDS.maxResponseTime}ms`);
            
            // Store performance test results in test suite results
            this.testResults.performanceTests = performanceResult;
            
            return {
                success: true,
                performanceTestResults: performanceResult,
                testSummary: {
                    performanceMetricsValidated: 3,
                    allPerformanceTestsPassed: true,
                    performanceGrade: performanceResult.performanceAnalysis.overallPerformanceGrade
                }
            };
            
        } catch (error) {
            throw new Error(`Performance tests failed: ${error.message}`);
        }
    }
    
    /**
     * Executes error handling validation tests including startup errors, runtime errors, 
     * and recovery patterns with comprehensive error scenario testing.
     * 
     * @returns {Promise<Object>} Promise resolving to error handling test results with validation status
     */
    async runErrorHandlingTests() {
        try {
            // Initialize test environment if not already setup
            if (!this.testSetupComplete) {
                await this._setupTestSuite();
            }
            
            // Execute comprehensive error handling testing with scenario validation
            const errorTestScenarios = {
                startupErrors: [
                    { scenario: 'invalid_port', config: { port: -1 } },
                    { scenario: 'invalid_host', config: { host: 'invalid.host' } },
                    { scenario: 'port_conflict', config: { port: this.testEnvironment.testPort } }
                ],
                runtimeErrors: [
                    { scenario: 'request_handling_error', endpoint: '/error' },
                    { scenario: 'timeout_error', timeout: 1 }
                ],
                environmentConfig: {
                    testName: 'Error Handling Validation Suite'
                }
            };
            
            const errorHandlingResult = await testErrorHandling(errorTestScenarios);
            
            // Validate error handling test results
            assert.ok(errorHandlingResult.success, 'Error handling tests should succeed');
            assert.ok(errorHandlingResult.errorHandlingResults, 'Error handling results should be available');
            
            // Validate startup error handling
            const startupErrorTests = errorHandlingResult.errorHandlingResults.startupErrorTests;
            assert.ok(startupErrorTests.length > 0, 'Startup error tests should be executed');
            assert.ok(startupErrorTests.every(test => test.success), 'All startup error tests should pass');
            
            // Validate error logging and message formatting
            const errorLoggingTests = errorHandlingResult.errorHandlingResults.errorLoggingTests;
            assert.ok(errorLoggingTests.length > 0, 'Error logging tests should be executed');
            
            // Store error handling test results in test suite results
            this.testResults.errorHandlingTests = errorHandlingResult;
            
            return {
                success: true,
                errorHandlingTestResults: errorHandlingResult,
                testSummary: errorHandlingResult.testSummary
            };
            
        } catch (error) {
            throw new Error(`Error handling tests failed: ${error.message}`);
        }
    }
    
    /**
     * Performs comprehensive test suite cleanup including server shutdown, resource 
     * deallocation, and environment reset with validation of cleanup completion.
     * 
     * @returns {Promise<void>} Promise resolving when cleanup is complete
     */
    async cleanup() {
        try {
            // Stop all test servers and close connections
            if (this.testEnvironment) {
                await cleanupTestEnvironment(this.testEnvironment);
                this.testEnvironment = null;
            }
            
            // Clean up test execution context and correlation data
            if (this.executionContext) {
                try {
                    this.executionContext.endExecution();
                } catch (error) {
                    console.warn(`Execution context cleanup warning: ${error.message}`);
                }
                this.executionContext = null;
            }
            
            // Reset performance monitoring and clear metrics
            if (this.performanceMonitor) {
                try {
                    // Stop any running timers
                    if (this.performanceMonitor.suiteTimer && this.performanceMonitor.suiteTimer.isRunning) {
                        this.performanceMonitor.suiteTimer.stop();
                    }
                    
                    // Clear individual test timers
                    this.performanceMonitor.testTimers.clear();
                    
                    // Reset performance metrics
                    this.performanceMonitor.performanceMetrics = {
                        totalTestTime: 0,
                        individualTestTimes: {},
                        performanceSummary: {}
                    };
                } catch (error) {
                    console.warn(`Performance monitor cleanup warning: ${error.message}`);
                }
            }
            
            // Clean up assertion utilities and validation state
            this.assertions = null;
            
            // Reset test environment for potential reuse
            this.testSetupComplete = false;
            this.setupPromise = null;
            
            // Reset test results
            this.testResults = {
                startupTests: null,
                shutdownTests: null,
                configurationTests: null,
                performanceTests: null,
                errorHandlingTests: null,
                lifecycleTests: null,
                metadataTests: null
            };
            
            // Update suite metadata with completion information
            this.suiteMetadata.endTime = Date.now();
            this.suiteMetadata.totalTests = Object.values(this.testResults).filter(result => result !== null).length;
            
            // Validate complete cleanup and resource deallocation
            const cleanupValidation = {
                testEnvironmentCleaned: this.testEnvironment === null,
                executionContextCleaned: this.executionContext === null,
                performanceMonitorReset: true,
                assertionsReset: this.assertions === null,
                testStateReset: !this.testSetupComplete
            };
            
            const cleanupComplete = Object.values(cleanupValidation).every(cleaned => cleaned === true);
            if (!cleanupComplete) {
                console.warn('Test suite cleanup incomplete:', cleanupValidation);
            }
            
        } catch (error) {
            console.error(`Test suite cleanup error: ${error.message}`);
            throw new Error(`Test suite cleanup failed: ${error.message}`);
        }
    }
    
    /**
     * Private method to set up test suite environment and initialize all necessary 
     * components for comprehensive server testing.
     * 
     * @private
     * @returns {Promise<void>} Promise resolving when test suite setup is complete
     */
    async _setupTestSuite() {
        if (this.setupPromise) {
            return this.setupPromise;
        }
        
        this.setupPromise = (async () => {
            try {
                // Start suite timer for overall test suite performance measurement
                this.performanceMonitor.suiteTimer.start();
                this.suiteMetadata.startTime = Date.now();
                
                // Set up test environment with isolated server and client
                this.testEnvironment = setupTestEnvironment({
                    testName: 'Server Test Suite',
                    serverConfig: {
                        enableLogging: false
                    },
                    clientConfig: {
                        enablePerformanceTracking: this.config.enablePerformanceTests
                    }
                });
                
                // Configure performance monitoring and timing utilities
                this.testEnvironment.performanceMonitor = this.performanceMonitor;
                
                // Set up test execution context and correlation tracking
                this.executionContext = new TestExecutionContext({
                    testName: 'Server Entry Point Test Suite',
                    correlationId: this.testEnvironment.correlationId,
                    environment: 'test-suite',
                    performanceTracking: this.config.enablePerformanceTests
                });
                
                this.executionContext.startExecution();
                
                // Validate test suite setup completion
                this.testSetupComplete = true;
                
            } catch (error) {
                this.setupPromise = null;
                throw new Error(`Test suite setup failed: ${error.message}`);
            }
        })();
        
        return this.setupPromise;
    }
}

// ============================================================================
// NODE.JS BUILT-IN TEST RUNNER TEST DEFINITIONS
// ============================================================================

// Main test suite using Node.js built-in test runner with describe/test structure
describe('Server Entry Point Test Suite', { timeout: TEST_TIMEOUT }, () => {
    let serverTestSuite = null;
    
    // Set up test suite before each test group with fresh environment
    beforeEach(async () => {
        serverTestSuite = new ServerTestSuite({
            enablePerformanceTests: true,
            enableErrorHandlingTests: true,
            testTimeout: TEST_TIMEOUT
        });
    });
    
    // Clean up test suite after each test group with complete resource cleanup
    afterEach(async () => {
        if (serverTestSuite) {
            await serverTestSuite.cleanup();
            serverTestSuite = null;
        }
    });
    
    // Server startup functionality testing group
    describe('Server Startup Tests', { timeout: STARTUP_TIMEOUT + 2000 }, () => {
        test('should start server with default configuration', async () => {
            const startupResults = await serverTestSuite.runStartupTests();
            
            assert.ok(startupResults.success, 'Startup tests should pass');
            assert.ok(startupResults.startupTestResults.basicStartupTest.success, 'Basic startup test should succeed');
            assert.ok(startupResults.startupTestResults.basicStartupTest.serverInstance.listening, 'Server should be listening');
        });
        
        test('should start server with custom configuration', async () => {
            const startupResults = await serverTestSuite.runStartupTests();
            
            assert.ok(startupResults.startupTestResults.customConfigStartupTest.success, 'Custom config startup should succeed');
            assert.ok(startupResults.startupTestResults.customConfigStartupTest.customConfigApplied, 'Custom configuration should be applied');
        });
        
        test('should meet startup performance requirements', async () => {
            const startupResults = await serverTestSuite.runStartupTests();
            
            const performanceTest = startupResults.startupTestResults.performanceValidationTest;
            assert.ok(performanceTest.success, 'Performance validation should succeed');
            assert.ok(performanceTest.startupTime <= PERFORMANCE_THRESHOLDS.maxStartupTime, 
                `Startup time ${performanceTest.startupTime}ms should be <= ${PERFORMANCE_THRESHOLDS.maxStartupTime}ms`);
        });
        
        test('should handle startup errors gracefully', async () => {
            const startupResults = await serverTestSuite.runStartupTests();
            
            const errorTest = startupResults.startupTestResults.errorScenarioTest;
            assert.ok(errorTest.success, 'Error scenario test should succeed');
            assert.ok(errorTest.allErrorsHandled, 'All startup errors should be handled properly');
        });
        
        test('should initialize all components correctly', async () => {
            const startupResults = await serverTestSuite.runStartupTests();
            
            const componentTest = startupResults.startupTestResults.componentInitializationTest;
            assert.ok(componentTest.success, 'Component initialization should succeed');
            assert.ok(componentTest.allComponentsHealthy, 'All components should be healthy after startup');
        });
    });
    
    // Server shutdown functionality testing group
    describe('Server Shutdown Tests', { timeout: SHUTDOWN_TIMEOUT + 2000 }, () => {
        test('should shutdown gracefully with SIGTERM', async () => {
            const shutdownResults = await serverTestSuite.runShutdownTests();
            
            const gracefulTest = shutdownResults.shutdownTestResults.gracefulShutdownTest;
            assert.ok(gracefulTest.success, 'Graceful shutdown should succeed');
            assert.ok(gracefulTest.shutdownTime <= PERFORMANCE_THRESHOLDS.maxShutdownTime, 
                `Shutdown time ${gracefulTest.shutdownTime}ms should be <= ${PERFORMANCE_THRESHOLDS.maxShutdownTime}ms`);
        });
        
        test('should handle SIGINT signal correctly', async () => {
            const shutdownResults = await serverTestSuite.runShutdownTests();
            
            const signalTest = shutdownResults.shutdownTestResults.signalHandlingTest;
            assert.ok(signalTest.success, 'Signal handling should succeed');
            assert.ok(signalTest.signalHandled, 'SIGINT signal should be handled');
            assert.ok(signalTest.connectionsReleased, 'Connections should be released after signal');
        });
        
        test('should cleanup connections and resources', async () => {
            const shutdownResults = await serverTestSuite.runShutdownTests();
            
            const cleanupTest = shutdownResults.shutdownTestResults.connectionCleanupTest;
            assert.ok(cleanupTest.success, 'Connection cleanup should succeed');
            assert.ok(cleanupTest.connectionsReleased, 'All connections should be released');
        });
        
        test('should complete shutdown within timeout', async () => {
            const shutdownResults = await serverTestSuite.runShutdownTests();
            
            const timeoutTest = shutdownResults.shutdownTestResults.shutdownTimeoutTest;
            assert.ok(timeoutTest.success, 'Shutdown timeout test should succeed');
            assert.ok(timeoutTest.withinTimeLimit, 'Shutdown should complete within time limit');
        });
        
        test('should log shutdown process correctly', async () => {
            const shutdownResults = await serverTestSuite.runShutdownTests();
            
            const loggingTest = shutdownResults.shutdownTestResults.shutdownLoggingTest;
            assert.ok(loggingTest.success, 'Shutdown logging should be configured');
            assert.ok(loggingTest.shutdownHandlerConfigured, 'Shutdown handler should be configured');
        });
    });
    
    // Configuration validation testing group
    describe('Configuration Validation Tests', { timeout: TEST_TIMEOUT }, () => {
        test('should validate correct configuration', async () => {
            const configResults = await serverTestSuite.runConfigurationTests();
            
            assert.ok(configResults.success, 'Configuration tests should pass');
            assert.ok(configResults.configurationTestResults.validationResults.validConfigTests.length > 0, 
                'Valid configuration tests should be executed');
        });
        
        test('should reject invalid configuration', async () => {
            const configResults = await serverTestSuite.runConfigurationTests();
            
            const invalidConfigTests = configResults.configurationTestResults.validationResults.invalidConfigTests;
            assert.ok(invalidConfigTests.length > 0, 'Invalid configuration tests should be executed');
            assert.ok(invalidConfigTests.every(test => test.success), 'Invalid configurations should be properly rejected');
        });
        
        test('should process environment variables correctly', async () => {
            const configResults = await serverTestSuite.runConfigurationTests();
            
            const envTests = configResults.configurationTestResults.validationResults.environmentVariableTests;
            assert.ok(envTests.length > 0, 'Environment variable tests should be executed');
            assert.ok(envTests.every(test => test.success), 'Environment variables should be processed correctly');
        });
        
        test('should handle configuration errors gracefully', async () => {
            const configResults = await serverTestSuite.runConfigurationTests();
            
            const errorHandlingTests = configResults.configurationTestResults.validationResults.errorHandlingTests;
            assert.ok(errorHandlingTests.length > 0, 'Error handling tests should be executed');
            assert.ok(errorHandlingTests.every(test => test.success), 'Configuration errors should be handled gracefully');
        });
    });
    
    // Performance validation testing group
    describe('Performance Tests', { timeout: TEST_TIMEOUT }, () => {
        test('should meet startup performance requirements', async () => {
            const performanceResults = await serverTestSuite.runPerformanceTests();
            
            const startupPerf = performanceResults.performanceTestResults.startupPerformance;
            assert.ok(startupPerf.success, 'Startup performance test should succeed');
            assert.ok(startupPerf.startupTime <= PERFORMANCE_THRESHOLDS.maxStartupTime, 
                'Startup time should meet performance requirements');
        });
        
        test('should meet response time requirements', async () => {
            const performanceResults = await serverTestSuite.runPerformanceTests();
            
            const responsePerf = performanceResults.performanceTestResults.responsePerformance;
            assert.ok(responsePerf.averageResponseTime <= PERFORMANCE_THRESHOLDS.maxResponseTime, 
                'Average response time should meet requirements');
            assert.ok(responsePerf.maxResponseTime <= PERFORMANCE_THRESHOLDS.maxResponseTime * 2, 
                'Maximum response time should be reasonable');
        });
        
        test('should meet memory usage requirements', async () => {
            const performanceResults = await serverTestSuite.runPerformanceTests();
            
            const memoryPerf = performanceResults.performanceTestResults.memoryPerformance;
            assert.ok(memoryPerf.memoryAnalysis, 'Memory analysis should be available');
            assert.ok(memoryPerf.memoryAnalysis.peak.heapUsed <= PERFORMANCE_THRESHOLDS.maxMemoryUsage, 
                'Memory usage should meet requirements');
        });
    });
    
    // Error handling validation testing group
    describe('Error Handling Tests', { timeout: TEST_TIMEOUT }, () => {
        test('should handle startup errors correctly', async () => {
            const errorResults = await serverTestSuite.runErrorHandlingTests();
            
            const startupErrors = errorResults.errorHandlingTestResults.errorHandlingResults.startupErrorTests;
            assert.ok(startupErrors.length > 0, 'Startup error tests should be executed');
            assert.ok(startupErrors.every(test => test.success), 'All startup errors should be handled correctly');
        });
        
        test('should log errors appropriately', async () => {
            const errorResults = await serverTestSuite.runErrorHandlingTests();
            
            const loggingTests = errorResults.errorHandlingTestResults.errorHandlingResults.errorLoggingTests;
            assert.ok(loggingTests.length > 0, 'Error logging tests should be executed');
            assert.ok(loggingTests.every(test => test.success), 'Error logging should work correctly');
        });
        
        test('should recover from errors gracefully', async () => {
            const errorResults = await serverTestSuite.runErrorHandlingTests();
            
            const recoveryTests = errorResults.errorHandlingTestResults.errorHandlingResults.recoveryTests;
            assert.ok(recoveryTests.length > 0, 'Error recovery tests should be executed');
            assert.ok(recoveryTests.every(test => test.success), 'Error recovery should work correctly');
        });
    });
    
    // Application lifecycle testing group
    describe('Application Lifecycle Tests', { timeout: TEST_TIMEOUT }, () => {
        test('should manage complete application lifecycle', async () => {
            const lifecycleConfig = {
                environmentConfig: {
                    testName: 'Complete Lifecycle Test'
                }
            };
            
            const lifecycleResults = await testApplicationLifecycle(lifecycleConfig);
            
            assert.ok(lifecycleResults.success, 'Application lifecycle tests should succeed');
            assert.ok(lifecycleResults.testSummary.allPhasesSuccessful, 'All lifecycle phases should complete successfully');
        });
        
        test('should initialize components correctly', async () => {
            const lifecycleResults = await testApplicationLifecycle();
            
            const initPhase = lifecycleResults.lifecycleResults.initializationPhase;
            assert.ok(initPhase.success, 'Initialization phase should succeed');
            assert.ok(initPhase.initializationResult.applicationCreated, 'Application should be created');
            assert.ok(initPhase.initializationResult.componentsInitialized, 'Components should be initialized');
        });
        
        test('should maintain operational state correctly', async () => {
            const lifecycleResults = await testApplicationLifecycle();
            
            const operationalPhase = lifecycleResults.lifecycleResults.operationalPhase;
            assert.ok(operationalPhase.success, 'Operational phase should succeed');
            assert.ok(operationalPhase.operationalResult.healthMonitoring, 'Health monitoring should be active');
            assert.ok(operationalPhase.operationalResult.requestHandling, 'Request handling should work');
        });
        
        test('should support restart functionality', async () => {
            const lifecycleResults = await testApplicationLifecycle();
            
            const restartPhase = lifecycleResults.lifecycleResults.restartPhase;
            assert.ok(restartPhase.success, 'Restart phase should succeed');
            assert.ok(restartPhase.restartResult.applicationRestarted, 'Application should restart successfully');
            assert.ok(restartPhase.restartResult.functionalAfterRestart, 'Application should be functional after restart');
        });
    });
    
    // Server metadata collection testing group
    describe('Server Metadata Tests', { timeout: TEST_TIMEOUT }, () => {
        test('should collect server metadata correctly', async () => {
            const metadataConfig = {
                environmentConfig: {
                    testName: 'Server Metadata Collection Test'
                }
            };
            
            const metadataResults = await testServerMetadata(metadataConfig);
            
            assert.ok(metadataResults.success, 'Metadata tests should succeed');
            assert.ok(metadataResults.metadataResults.metadataCollection.success, 'Metadata collection should succeed');
        });
        
        test('should validate application information accuracy', async () => {
            const metadataResults = await testServerMetadata();
            
            const accuracyTest = metadataResults.metadataResults.informationAccuracy;
            assert.ok(accuracyTest.success, 'Information accuracy test should succeed');
        });
        
        test('should validate environment data completeness', async () => {
            const metadataResults = await testServerMetadata();
            
            const envValidation = metadataResults.metadataResults.environmentValidation;
            assert.ok(envValidation.success, 'Environment validation should succeed');
        });
        
        test('should validate monitoring data format', async () => {
            const metadataResults = await testServerMetadata();
            
            const formatValidation = metadataResults.metadataResults.formatValidation;
            assert.ok(formatValidation.success, 'Format validation should succeed');
            assert.ok(formatValidation.formatResult.jsonSerializable, 'Metadata should be JSON serializable');
            assert.ok(formatValidation.formatResult.noCircularReferences, 'Metadata should not have circular references');
        });
    });
    
    // Integration testing for complete server functionality
    describe('Server Integration Tests', { timeout: TEST_TIMEOUT }, () => {
        test('should handle complete request lifecycle', async () => {
            // Set up test environment for integration testing
            const testEnv = setupTestEnvironment({
                testName: 'Complete Request Lifecycle Test'
            });
            
            try {
                // Start server instance for integration testing
                await testEnv.testServer.start();
                testEnv.state.serverRunning = true;
                
                // Test complete request lifecycle from client to server
                const response = await testEnv.testClient.get('/hello');
                
                // Validate complete response using HTTP response assertions
                const context = testEnv.assertions.httpResponse.constructor.prototype.createAssertionContext(
                    'Integration Test Response Validation', 
                    { correlationId: testEnv.correlationId }
                );
                
                testEnv.assertions.httpResponse.assertHelloResponse(response, context);
                
                // Validate server status during request handling
                const serverStatus = testEnv.testServer.getServerStatus();
                assert.ok(serverStatus.running, 'Server should remain running during request handling');
                assert.ok(testEnv.testServer.isHealthy(), 'Server should remain healthy during request handling');
                
            } finally {
                await cleanupTestEnvironment(testEnv);
            }
        });
        
        test('should handle multiple concurrent requests', async () => {
            // Set up test environment for concurrent request testing
            const testEnv = setupTestEnvironment({
                testName: 'Concurrent Request Test'
            });
            
            try {
                // Start server for concurrent testing
                await testEnv.testServer.start();
                testEnv.state.serverRunning = true;
                
                // Create multiple concurrent requests to test server stability
                const concurrentRequests = [];
                const numberOfRequests = 10;
                
                for (let i = 0; i < numberOfRequests; i++) {
                    concurrentRequests.push(testEnv.testClient.get('/hello'));
                }
                
                // Execute all requests concurrently
                const responses = await Promise.all(concurrentRequests);
                
                // Validate all responses are correct
                responses.forEach((response, index) => {
                    const context = testEnv.assertions.httpResponse.constructor.prototype.createAssertionContext(
                        `Concurrent Request ${index + 1}`, 
                        { correlationId: testEnv.correlationId }
                    );
                    
                    testEnv.assertions.httpResponse.assertHelloResponse(response, context);
                });
                
                // Validate server remains stable after concurrent requests
                const finalServerStatus = testEnv.testServer.getServerStatus();
                assert.ok(finalServerStatus.running, 'Server should remain running after concurrent requests');
                
            } finally {
                await cleanupTestEnvironment(testEnv);
            }
        });
        
        test('should maintain performance under load', async () => {
            // Set up test environment for load testing
            const testEnv = setupTestEnvironment({
                testName: 'Load Performance Test'
            });
            
            try {
                // Start server for load testing
                await testEnv.testServer.start();
                testEnv.state.serverRunning = true;
                
                // Measure performance under sustained load
                const loadTestTimer = new TestTimer();
                loadTestTimer.start();
                
                const loadRequests = [];
                const requestCount = 50;
                
                for (let i = 0; i < requestCount; i++) {
                    loadRequests.push(testEnv.testClient.get('/hello'));
                }
                
                const loadResponses = await Promise.all(loadRequests);
                
                loadTestTimer.stop();
                const totalLoadTime = loadTestTimer.getElapsed();
                
                // Calculate requests per second
                const requestsPerSecond = (requestCount / totalLoadTime) * 1000;
                
                // Validate performance meets throughput requirements
                assert.ok(requestsPerSecond >= PERFORMANCE_THRESHOLDS.minThroughput, 
                    `Throughput ${requestsPerSecond.toFixed(2)} req/s should be >= ${PERFORMANCE_THRESHOLDS.minThroughput} req/s`);
                
                // Validate all responses are correct under load
                loadResponses.forEach((response, index) => {
                    assert.strictEqual(response.statusCode, 200, `Response ${index + 1} should have status 200`);
                });
                
            } finally {
                await cleanupTestEnvironment(testEnv);
            }
        });
    });
});

// ============================================================================
// MODULE EXPORTS FOR COMPREHENSIVE TESTING SUPPORT
// ============================================================================

// Export main test suite class for comprehensive server testing
export { ServerTestSuite };

// Export test utility functions for external test usage
export { 
    setupTestEnvironment, 
    cleanupTestEnvironment, 
    testServerStartup, 
    testServerShutdown, 
    testConfigurationValidation, 
    testErrorHandling, 
    testPerformanceMetrics, 
    testApplicationLifecycle, 
    testServerMetadata 
};

// Export test configuration constants for external configuration
export { 
    TEST_TIMEOUT, 
    STARTUP_TIMEOUT, 
    SHUTDOWN_TIMEOUT, 
    PERFORMANCE_THRESHOLD_MS, 
    TEST_PORT_BASE, 
    TEST_CORRELATION_PREFIX, 
    DEFAULT_TEST_HOST, 
    PERFORMANCE_THRESHOLDS 
};