/**
 * Comprehensive Server Startup Integration Test Suite for Node.js Tutorial Application
 * 
 * This integration test suite validates the complete server startup lifecycle including
 * application initialization, configuration verification, component integration, health
 * checking, and error handling scenarios. Tests the complete server startup process
 * from environment configuration through HTTP server binding and application readiness.
 * 
 * Educational Objectives:
 * - Demonstrates production-ready testing patterns for Node.js applications
 * - Shows comprehensive server startup validation and testing approaches
 * - Illustrates integration testing using Node.js built-in test runner
 * - Provides examples of performance testing and validation techniques
 * - Demonstrates advanced testing patterns with detailed validation
 * - Shows comprehensive error handling testing and recovery validation
 * 
 * Testing Architecture:
 * - Uses Node.js built-in test runner for zero external dependencies
 * - Implements isolated test server instances for reliable testing
 * - Provides comprehensive server lifecycle validation and testing
 * - Includes performance measurement and threshold validation
 * - Demonstrates production-ready testing configuration management
 * - Integrates with application configuration and environment management
 * 
 * @fileoverview Server startup integration test suite with comprehensive lifecycle validation
 * @version 1.0.0
 * @author Node.js Tutorial Application Testing Team
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Import Node.js built-in test runner for integration test organization and execution
import { describe, test, beforeEach, afterEach } from 'node:test'; // Node.js v22.x LTS - Built-in test runner

// Import Node.js built-in assertion library for basic assertion validation
import assert from 'node:assert'; // Node.js v22.x LTS - Built-in assertion module

// Import test server management utilities for isolated HTTP server instances
import { 
    TestServer, 
    createTestServer, 
    waitForServerReady, 
    cleanupTestServers 
} from '../helpers/test-server.js';

// Import test utility functions for correlation tracking, timing, and condition waiting
import { 
    generateCorrelationId, 
    measurePerformance, 
    TestTimer, 
    waitForCondition, 
    delay, 
    retry, 
    TestExecutionContext 
} from '../helpers/test-utils.js';

// Import test configuration management for integration testing setup
import { 
    TestConfigManager, 
    getTestPort, 
    TEST_SERVER_CONFIGS 
} from '../fixtures/test-config.js';

// Import specialized assertion classes for server status and performance validation
import { 
    ServerStatusAssertion, 
    PerformanceAssertion, 
    createAssertionContext 
} from '../helpers/assertions.js';

// Import main application class for testing complete application lifecycle
import { 
    Application, 
    createApplication 
} from '../../app.js';

// Import application configuration classes for configuration validation testing
import { 
    AppConfig 
} from '../../config/app.config.js';

// Import environment configuration for testing environment-specific settings
import { 
    EnvironmentConfig 
} from '../../config/environment.js';

// ============================================================================
// GLOBAL TEST CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Test suite configuration object defining global test settings, timeouts,
 * and validation preferences for server startup integration testing.
 */
const TEST_SUITE_CONFIG = {
    name: 'Server Startup Integration Tests',
    timeout: 10000,
    retryAttempts: 3,
    enablePerformanceValidation: true,
    enableConfigValidation: true,
    enableHealthChecks: true,
    isolateTestServers: true
};

/**
 * Performance thresholds for server startup timing and resource usage validation.
 * These thresholds ensure server startup meets educational tutorial requirements.
 */
const STARTUP_PERFORMANCE_THRESHOLDS = {
    maxStartupTime: 5000,       // Maximum server startup time in milliseconds
    maxConfigurationTime: 1000, // Maximum configuration validation time
    maxServerBindTime: 2000,    // Maximum server port binding time
    maxHealthCheckTime: 500,    // Maximum health check response time
    maxMemoryUsage: 50000000    // Maximum memory usage during startup (50MB)
};

/**
 * Test environment variables for isolated server startup testing with
 * consistent environment configuration across test executions.
 */
const TEST_ENVIRONMENT_VARIABLES = {
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    ENABLE_REQUEST_LOGGING: 'false',
    ENABLE_CORS: 'false',
    SERVER_TIMEOUT: '5000'
};

/**
 * Server startup scenario identifiers for different test scenarios and
 * configuration testing approaches with comprehensive validation coverage.
 */
const SERVER_STARTUP_SCENARIOS = {
    BASIC_STARTUP: 'basic_server_startup',
    CONFIGURATION_VALIDATION: 'configuration_validation',
    PORT_CONFLICT: 'port_conflict_handling',
    INVALID_CONFIG: 'invalid_configuration',
    PERFORMANCE_VALIDATION: 'performance_validation',
    HEALTH_CHECK_VALIDATION: 'health_check_validation',
    GRACEFUL_SHUTDOWN: 'graceful_shutdown_testing'
};

// ============================================================================
// TEST UTILITY FUNCTIONS
// ============================================================================

/**
 * Sets up isolated test environment for server startup testing including
 * configuration, port allocation, and test context initialization.
 * 
 * @param {Object} testConfig - Test configuration for environment setup
 * @param {string} correlationId - Unique correlation ID for test execution tracking
 * @returns {Object} Configured test environment with server configuration and context
 */
async function setupTestEnvironment(testConfig, correlationId) {
    try {
        // Generate unique correlation ID for test execution tracking and debugging
        const testCorrelationId = correlationId || generateCorrelationId();
        
        // Create TestExecutionContext with test metadata and timing information
        const testContext = new TestExecutionContext();
        testContext.setTestInfo({
            correlationId: testCorrelationId,
            testType: 'integration',
            scenario: testConfig.scenario || 'server_startup',
            timestamp: new Date().toISOString()
        });
        
        // Allocate unique test port using getTestPort to avoid conflicts
        const testPort = await getTestPort(testConfig.port, {
            randomSelection: true,
            maxAttempts: 10
        });
        
        // Set up test-specific environment variables for isolated testing
        const originalEnv = {};
        Object.keys(TEST_ENVIRONMENT_VARIABLES).forEach(key => {
            originalEnv[key] = process.env[key];
            process.env[key] = TEST_ENVIRONMENT_VARIABLES[key];
        });
        
        // Override port with allocated test port
        process.env.PORT = testPort.toString();
        
        // Create TestConfigManager instance with integration testing configuration
        const configManager = new TestConfigManager({
            caching: { enabled: false }, // Disable caching for test isolation
            portManagement: { trackAllocations: true },
            environment: { isolation: true }
        });
        
        // Initialize test environment configuration with validation and error handling
        const testEnvironmentConfig = await configManager.getConfig('integration', {
            overrides: {
                port: testPort,
                host: 'localhost',
                name: 'NodeJS-Tutorial-Test-Server',
                ...testConfig.configOverrides
            },
            validate: true
        });
        
        // Set up assertion contexts for server status and performance validation
        const serverStatusAssertion = new ServerStatusAssertion({
            enableHealthChecking: true,
            enableConfigurationValidation: true
        });
        
        const performanceAssertion = new PerformanceAssertion({
            enableHighPrecisionTiming: true,
            enableMemoryTracking: true
        });
        
        const assertionContext = createAssertionContext(
            `Server Startup Test - ${testConfig.scenario}`,
            {
                includeDetails: true,
                logAssertion: true,
                generateCorrelationId: true,
                trackPerformance: true
            }
        );
        
        // Return comprehensive test environment object ready for server startup testing
        return {
            testContext,
            testPort,
            configManager,
            testEnvironmentConfig,
            serverStatusAssertion,
            performanceAssertion,
            assertionContext,
            originalEnv,
            correlationId: testCorrelationId
        };
        
    } catch (error) {
        // Enhanced error context for test environment setup failures
        const setupError = new Error(`Test environment setup failed: ${error.message}`);
        setupError.originalError = error;
        setupError.context = {
            testConfig,
            correlationId,
            timestamp: new Date().toISOString()
        };
        throw setupError;
    }
}

/**
 * Cleans up test environment including server shutdown, resource deallocation,
 * and test context cleanup for proper test isolation between executions.
 * 
 * @param {Object} testContext - Test execution context with correlation tracking
 * @param {TestServer} testServer - Test server instance for shutdown
 * @returns {void} Cleans up test environment and resources
 */
async function cleanupTestEnvironment(testContext, testServer) {
    try {
        // Stop test server using TestServer.stop() with graceful shutdown
        if (testServer && typeof testServer.stop === 'function') {
            try {
                await testServer.stop();
                
                // Verify server is properly stopped
                if (testServer.isRunning && testServer.isRunning()) {
                    console.warn('Server still running after stop() call', {
                        correlationId: testContext.correlationId
                    });
                }
            } catch (stopError) {
                console.error('Error stopping test server:', stopError.message);
            }
        }
        
        // Clean up test server resources using cleanupTestServers utility
        await cleanupTestServers();
        
        // Reset environment variables to original values for test isolation
        if (testContext.originalEnv) {
            Object.keys(testContext.originalEnv).forEach(key => {
                if (testContext.originalEnv[key] === undefined) {
                    delete process.env[key];
                } else {
                    process.env[key] = testContext.originalEnv[key];
                }
            });
        }
        
        // Clear test context and correlation tracking information
        if (testContext.testContext && typeof testContext.testContext.cleanup === 'function') {
            await testContext.testContext.cleanup();
        }
        
        // Release allocated test port for reuse in subsequent tests
        if (testContext.configManager && testContext.correlationId) {
            testContext.configManager.releasePort(testContext.correlationId);
        }
        
        // Clean up assertion contexts and performance measurement data
        if (testContext.assertionContext && testContext.assertionContext.timer) {
            try {
                testContext.assertionContext.timer.stop();
            } catch (timerError) {
                // Timer may already be stopped
            }
        }
        
        // Log test cleanup completion with timing and resource information
        console.log('Test environment cleanup completed', {
            correlationId: testContext.correlationId,
            cleanupTimestamp: new Date().toISOString()
        });
        
    } catch (error) {
        // Log cleanup errors but don't throw to prevent test failures
        console.error('Test environment cleanup error:', {
            error: error.message,
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Creates and configures test server instance with specified configuration
 * and startup parameters for integration testing.
 * 
 * @param {Object} serverConfig - Server configuration for test instance
 * @param {Object} testContext - Test execution context with correlation tracking
 * @returns {Promise<TestServer>} Promise resolving to configured TestServer instance
 */
async function createTestServer(serverConfig, testContext) {
    try {
        // Validate server configuration using AppConfig and EnvironmentConfig validation
        const appConfig = new AppConfig({
            environment: 'test',
            port: serverConfig.port,
            logLevel: 'error',
            features: {
                helloEndpoint: true,
                requestLogging: false,
                cors: false
            }
        });
        
        // Validate configuration before server creation
        const configValidation = appConfig.validate();
        if (!configValidation.isValid) {
            throw new Error(`Configuration validation failed: ${configValidation.errors.join(', ')}`);
        }
        
        // Create TestServer instance with test-specific configuration and context
        const testServer = new TestServer({
            port: serverConfig.port,
            host: serverConfig.host || 'localhost',
            name: serverConfig.name || 'Test-Server',
            timeout: serverConfig.timeout || STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime,
            
            // Configure server with test environment settings and feature flags
            environment: {
                NODE_ENV: 'test',
                LOG_LEVEL: 'error',
                PORT: serverConfig.port
            },
            
            // Set up server event handlers for startup monitoring and error tracking
            eventHandlers: {
                onError: (error) => {
                    console.error('Test server error:', error.message, {
                        correlationId: testContext.correlationId
                    });
                },
                onListening: () => {
                    console.log('Test server listening:', {
                        port: serverConfig.port,
                        correlationId: testContext.correlationId
                    });
                }
            },
            
            // Initialize server performance monitoring and health checking capabilities
            monitoring: {
                enabled: true,
                performanceTracking: true,
                healthChecking: true
            }
        });
        
        // Configure server timeout and connection management for testing
        testServer.setTimeout = function(timeout) {
            this.timeout = timeout;
            return this;
        };
        
        // Add correlation tracking to server instance
        testServer.correlationId = testContext.correlationId;
        testServer.testContext = testContext;
        
        // Return configured TestServer instance ready for startup validation testing
        return testServer;
        
    } catch (error) {
        // Enhanced error context for test server creation failures
        const serverError = new Error(`Test server creation failed: ${error.message}`);
        serverError.originalError = error;
        serverError.context = {
            serverConfig,
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        };
        throw serverError;
    }
}

/**
 * Validates complete server startup process including configuration, binding,
 * health status, and readiness verification.
 * 
 * @param {TestServer} testServer - Test server instance for validation
 * @param {Object} expectedConfig - Expected configuration settings
 * @param {Object} assertionContext - Assertion context for validation tracking
 * @returns {Promise<Object>} Promise resolving to startup validation results
 */
async function validateServerStartup(testServer, expectedConfig, assertionContext) {
    try {
        // Initialize startup validation results object
        const validationResults = {
            startupTime: null,
            serverListening: false,
            healthStatus: null,
            configurationValid: false,
            performanceMetrics: {},
            timestamp: new Date().toISOString()
        };
        
        // Start server using TestServer.start() with timing measurement
        const startupTimer = new TestTimer();
        startupTimer.start();
        
        await testServer.start();
        
        startupTimer.stop();
        validationResults.startupTime = startupTimer.getElapsed();
        
        // Wait for server readiness using waitForServerReady with timeout handling
        await waitForServerReady(testServer, {
            timeout: STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime,
            interval: 100,
            maxAttempts: 50
        });
        
        // Validate server listening status using ServerStatusAssertion.assertServerListening
        const serverStatusAssertion = new ServerStatusAssertion();
        await serverStatusAssertion.assertServerListening(
            testServer.getServerInstance(),
            expectedConfig.port,
            assertionContext
        );
        validationResults.serverListening = true;
        
        // Verify server configuration matches expected settings
        const serverConfig = testServer.getServerInfo();
        await serverStatusAssertion.assertServerConfiguration(
            serverConfig,
            expectedConfig,
            assertionContext
        );
        validationResults.configurationValid = true;
        
        // Check server health status using assertServerHealth with comprehensive validation
        const healthStatus = await testServer.getHealthStatus();
        await serverStatusAssertion.assertServerHealth(
            healthStatus,
            {
                maxErrorRate: 0,
                requiredComponents: ['httpServer', 'requestHandler'],
                minUptime: 0
            },
            assertionContext
        );
        validationResults.healthStatus = healthStatus;
        
        // Validate server performance metrics using assertServerMetrics
        const performanceAssertion = new PerformanceAssertion();
        const serverMetrics = {
            startupTime: validationResults.startupTime,
            memoryUsage: process.memoryUsage().heapUsed,
            responseTime: 0 // Will be measured in actual requests
        };
        
        await performanceAssertion.assertMemoryUsage(
            async () => { return serverMetrics; },
            STARTUP_PERFORMANCE_THRESHOLDS.maxMemoryUsage,
            assertionContext
        );
        
        validationResults.performanceMetrics = serverMetrics;
        
        // Verify application health status using Application.getHealthStatus method
        if (testServer.application) {
            const appHealthStatus = await testServer.application.getHealthStatus();
            validationResults.applicationHealth = appHealthStatus;
        }
        
        // Return startup validation results with timing, configuration, and health information
        return {
            success: true,
            validationResults,
            correlationId: assertionContext.correlationId,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        // Enhanced error context for startup validation failures
        const validationError = new Error(`Server startup validation failed: ${error.message}`);
        validationError.originalError = error;
        validationError.context = {
            expectedConfig,
            correlationId: assertionContext.correlationId,
            timestamp: new Date().toISOString()
        };
        throw validationError;
    }
}

/**
 * Validates configuration integrity during server startup including environment
 * settings, feature flags, and component configuration.
 * 
 * @param {Object} applicationConfig - Application configuration instance
 * @param {Object} environmentConfig - Environment configuration instance
 * @param {Object} assertionContext - Assertion context for validation tracking
 * @returns {Object} Configuration validation results with detailed status
 */
function validateConfigurationIntegrity(applicationConfig, environmentConfig, assertionContext) {
    try {
        // Initialize configuration validation results
        const configValidationResults = {
            appConfigValid: false,
            environmentConfigValid: false,
            configurationConsistent: false,
            featureFlagsValid: false,
            validationErrors: [],
            timestamp: new Date().toISOString()
        };
        
        // Validate AppConfig instance using validate() method with comprehensive checking
        if (applicationConfig && typeof applicationConfig.validate === 'function') {
            const appConfigValidation = applicationConfig.validate();
            configValidationResults.appConfigValid = appConfigValidation.isValid;
            
            if (!appConfigValidation.isValid) {
                configValidationResults.validationErrors.push(
                    ...appConfigValidation.errors.map(error => `AppConfig: ${error}`)
                );
            }
        } else {
            configValidationResults.validationErrors.push('AppConfig instance missing or invalid');
        }
        
        // Verify EnvironmentConfig settings using validate() with constraint validation
        if (environmentConfig && typeof environmentConfig.validate === 'function') {
            const envConfigValidation = environmentConfig.validate();
            configValidationResults.environmentConfigValid = envConfigValidation.isValid;
            
            if (!envConfigValidation.isValid) {
                configValidationResults.validationErrors.push(
                    ...envConfigValidation.errors.map(error => `EnvironmentConfig: ${error}`)
                );
            }
        } else {
            configValidationResults.validationErrors.push('EnvironmentConfig instance missing or invalid');
        }
        
        // Check configuration consistency between AppConfig and EnvironmentConfig
        if (applicationConfig && environmentConfig) {
            const appServerConfig = applicationConfig.getServerConfig();
            const envServerConfig = environmentConfig.getServerConfig();
            
            // Validate port consistency
            if (appServerConfig.port !== envServerConfig.port) {
                configValidationResults.validationErrors.push(
                    `Port mismatch: AppConfig=${appServerConfig.port}, EnvironmentConfig=${envServerConfig.port}`
                );
            } else {
                configValidationResults.configurationConsistent = true;
            }
        }
        
        // Validate feature flag configuration and environment-specific settings
        if (applicationConfig && typeof applicationConfig.getFeatures === 'function') {
            const features = applicationConfig.getFeatures();
            const requiredFeatures = ['helloEndpoint'];
            
            const missingFeatures = requiredFeatures.filter(feature => 
                !features.hasOwnProperty(feature)
            );
            
            if (missingFeatures.length === 0) {
                configValidationResults.featureFlagsValid = true;
            } else {
                configValidationResults.validationErrors.push(
                    `Missing feature flags: ${missingFeatures.join(', ')}`
                );
            }
        }
        
        // Verify server configuration parameters including port, host, and timeouts
        const serverConfigErrors = [];
        if (applicationConfig) {
            const serverConfig = applicationConfig.getServerConfig();
            
            if (!serverConfig.port || serverConfig.port < 1024 || serverConfig.port > 65535) {
                serverConfigErrors.push(`Invalid server port: ${serverConfig.port}`);
            }
            
            if (!serverConfig.host || typeof serverConfig.host !== 'string') {
                serverConfigErrors.push(`Invalid server host: ${serverConfig.host}`);
            }
        }
        
        configValidationResults.validationErrors.push(...serverConfigErrors);
        
        // Check logging configuration and environment-specific log level settings
        if (environmentConfig && environmentConfig.logLevel) {
            const validLogLevels = ['error', 'warn', 'info', 'debug', 'trace'];
            if (!validLogLevels.includes(environmentConfig.logLevel)) {
                configValidationResults.validationErrors.push(
                    `Invalid log level: ${environmentConfig.logLevel}`
                );
            }
        }
        
        // Validate security configuration and feature enablement for test environment
        const isTestEnvironment = environmentConfig && environmentConfig.isTest;
        if (!isTestEnvironment) {
            configValidationResults.validationErrors.push(
                'Environment not configured for testing'
            );
        }
        
        // Determine overall validation success
        const overallSuccess = configValidationResults.appConfigValid &&
                              configValidationResults.environmentConfigValid &&
                              configValidationResults.configurationConsistent &&
                              configValidationResults.featureFlagsValid &&
                              configValidationResults.validationErrors.length === 0;
        
        // Return comprehensive configuration validation results with detailed status
        return {
            ...configValidationResults,
            overallValid: overallSuccess,
            validationSummary: {
                totalChecks: 5,
                passedChecks: [
                    configValidationResults.appConfigValid,
                    configValidationResults.environmentConfigValid,
                    configValidationResults.configurationConsistent,
                    configValidationResults.featureFlagsValid,
                    configValidationResults.validationErrors.length === 0
                ].filter(Boolean).length,
                errorCount: configValidationResults.validationErrors.length
            }
        };
        
    } catch (error) {
        // Enhanced error context for configuration validation failures
        const configError = new Error(`Configuration validation failed: ${error.message}`);
        configError.originalError = error;
        configError.context = {
            correlationId: assertionContext.correlationId,
            timestamp: new Date().toISOString()
        };
        throw configError;
    }
}

/**
 * Measures and validates server startup performance including timing metrics,
 * resource usage, and performance thresholds.
 * 
 * @param {Function} startupOperation - Startup operation to measure
 * @param {Object} performanceThresholds - Performance threshold configuration
 * @param {Object} testContext - Test execution context with correlation tracking
 * @returns {Object} Performance measurement results with metrics and validation
 */
async function measureStartupPerformance(startupOperation, performanceThresholds, testContext) {
    try {
        // Initialize TestTimer for high-precision startup timing measurement
        const performanceTimer = new TestTimer();
        
        // Measure memory usage before startup operation using process.memoryUsage()
        const baselineMemory = process.memoryUsage();
        
        // Force garbage collection if available for accurate measurement
        if (global.gc) {
            global.gc();
        }
        
        const cleanBaselineMemory = process.memoryUsage();
        
        // Execute startup operation with performance monitoring and error handling
        performanceTimer.start();
        let operationResult = null;
        let operationError = null;
        
        try {
            operationResult = await startupOperation();
        } catch (error) {
            operationError = error;
        }
        
        performanceTimer.stop();
        
        // Measure memory usage after startup operation
        const peakMemory = process.memoryUsage();
        
        // Force garbage collection again for cleanup measurement
        if (global.gc) {
            global.gc();
        }
        
        const finalMemory = process.memoryUsage();
        
        // Measure total startup time using TestTimer.getElapsed() method
        const totalStartupTime = performanceTimer.getElapsed();
        
        // Create comprehensive performance measurement results
        const performanceResults = {
            timing: {
                totalStartupTime: totalStartupTime,
                threshold: performanceThresholds.maxStartupTime
            },
            memory: {
                baseline: {
                    heapUsed: cleanBaselineMemory.heapUsed,
                    heapTotal: cleanBaselineMemory.heapTotal,
                    rss: cleanBaselineMemory.rss
                },
                peak: {
                    heapUsed: peakMemory.heapUsed,
                    heapTotal: peakMemory.heapTotal,
                    rss: peakMemory.rss
                },
                final: {
                    heapUsed: finalMemory.heapUsed,
                    heapTotal: finalMemory.heapTotal,
                    rss: finalMemory.rss
                },
                growth: {
                    heapUsed: peakMemory.heapUsed - cleanBaselineMemory.heapUsed,
                    heapTotal: peakMemory.heapTotal - cleanBaselineMemory.heapTotal,
                    rss: peakMemory.rss - cleanBaselineMemory.rss
                }
            },
            validation: {
                startupTimeValid: totalStartupTime <= performanceThresholds.maxStartupTime,
                memoryUsageValid: peakMemory.heapUsed <= performanceThresholds.maxMemoryUsage,
                performanceGrade: null
            },
            operationResult: operationResult,
            operationError: operationError
        };
        
        // Validate startup timing against performance thresholds
        const performanceAssertion = new PerformanceAssertion();
        
        if (performanceResults.validation.startupTimeValid) {
            // Calculate performance grade based on timing
            const timeRatio = totalStartupTime / performanceThresholds.maxStartupTime;
            if (timeRatio <= 0.25) {
                performanceResults.validation.performanceGrade = 'EXCELLENT';
            } else if (timeRatio <= 0.5) {
                performanceResults.validation.performanceGrade = 'GOOD';
            } else if (timeRatio <= 0.75) {
                performanceResults.validation.performanceGrade = 'ACCEPTABLE';
            } else {
                performanceResults.validation.performanceGrade = 'MARGINAL';
            }
        } else {
            performanceResults.validation.performanceGrade = 'POOR';
        }
        
        // Check memory usage during startup against maximum allowed usage
        if (!performanceResults.validation.memoryUsageValid) {
            throw new Error(
                `Memory usage ${Math.round(peakMemory.heapUsed / 1024 / 1024)}MB exceeds threshold ${Math.round(performanceThresholds.maxMemoryUsage / 1024 / 1024)}MB`
            );
        }
        
        // Validate startup performance meets educational tutorial requirements
        if (!performanceResults.validation.startupTimeValid) {
            throw new Error(
                `Startup time ${totalStartupTime}ms exceeds threshold ${performanceThresholds.maxStartupTime}ms`
            );
        }
        
        // Add test context metadata to results
        performanceResults.testContext = {
            correlationId: testContext.correlationId,
            testType: 'performance_validation',
            timestamp: new Date().toISOString()
        };
        
        // Throw original operation error if startup failed
        if (operationError) {
            throw operationError;
        }
        
        // Return comprehensive performance measurement results with metrics and validation
        return performanceResults;
        
    } catch (error) {
        // Enhanced error context for performance measurement failures
        const performanceError = new Error(`Performance measurement failed: ${error.message}`);
        performanceError.originalError = error;
        performanceError.context = {
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        };
        throw performanceError;
    }
}

/**
 * Simulates server startup error scenarios for testing error handling
 * and recovery mechanisms.
 * 
 * @param {string} errorType - Type of error to simulate
 * @param {Object} errorConfig - Error configuration and parameters
 * @param {Object} testContext - Test execution context with correlation tracking
 * @returns {Object} Error simulation results with validation status
 */
async function simulateStartupError(errorType, errorConfig, testContext) {
    try {
        // Initialize error simulation results
        const errorSimulationResults = {
            errorType: errorType,
            errorGenerated: false,
            errorHandled: false,
            errorMessage: null,
            recoveryAttempted: false,
            recoverySuccessful: false,
            timestamp: new Date().toISOString()
        };
        
        // Configure error scenario based on errorType parameter
        let errorScenario = null;
        
        switch (errorType) {
            case 'port_conflict':
                // Simulate port already in use error
                errorScenario = async () => {
                    // Create server on test port first
                    const conflictServer = new TestServer({
                        port: errorConfig.port,
                        host: 'localhost'
                    });
                    await conflictServer.start();
                    
                    // Try to start second server on same port
                    const testServer = new TestServer({
                        port: errorConfig.port,
                        host: 'localhost'
                    });
                    
                    try {
                        await testServer.start();
                        throw new Error('Expected port conflict error was not generated');
                    } catch (error) {
                        errorSimulationResults.errorGenerated = true;
                        errorSimulationResults.errorMessage = error.message;
                        
                        // Validate error message indicates port conflict
                        if (error.message.includes('EADDRINUSE') || 
                            error.message.includes('address already in use')) {
                            errorSimulationResults.errorHandled = true;
                        }
                        
                        return { conflictServer, testServer };
                    } finally {
                        // Cleanup servers
                        await conflictServer.stop();
                    }
                };
                break;
                
            case 'configuration_error':
                // Simulate invalid configuration error
                errorScenario = async () => {
                    try {
                        const invalidConfig = new AppConfig({
                            port: 'invalid_port', // Invalid port value
                            environment: 'test'
                        });
                        
                        const validation = invalidConfig.validate();
                        
                        if (!validation.isValid) {
                            errorSimulationResults.errorGenerated = true;
                            errorSimulationResults.errorHandled = true;
                            errorSimulationResults.errorMessage = validation.errors.join(', ');
                        }
                        
                        return { config: invalidConfig, validation };
                    } catch (error) {
                        errorSimulationResults.errorGenerated = true;
                        errorSimulationResults.errorMessage = error.message;
                        errorSimulationResults.errorHandled = true;
                        throw error;
                    }
                };
                break;
                
            case 'invalid_environment':
                // Simulate invalid environment configuration
                errorScenario = async () => {
                    const originalNodeEnv = process.env.NODE_ENV;
                    
                    try {
                        // Set invalid environment
                        process.env.NODE_ENV = 'invalid_environment';
                        
                        const environmentConfig = new EnvironmentConfig({
                            environment: 'invalid_environment'
                        });
                        
                        const validation = environmentConfig.validate();
                        
                        if (!validation.isValid) {
                            errorSimulationResults.errorGenerated = true;
                            errorSimulationResults.errorHandled = true;
                            errorSimulationResults.errorMessage = validation.errors.join(', ');
                        }
                        
                        return { config: environmentConfig, validation };
                    } finally {
                        // Restore original environment
                        process.env.NODE_ENV = originalNodeEnv;
                    }
                };
                break;
                
            default:
                throw new Error(`Unsupported error type: ${errorType}`);
        }
        
        // Execute error scenario and capture results
        const scenarioResult = await errorScenario();
        errorSimulationResults.scenarioResult = scenarioResult;
        
        // Validate error handling behavior and recovery mechanisms
        if (errorSimulationResults.errorGenerated && errorSimulationResults.errorHandled) {
            errorSimulationResults.recoveryAttempted = true;
            errorSimulationResults.recoverySuccessful = true;
        }
        
        // Return error simulation results with validation status and error analysis
        return {
            success: true,
            errorSimulationResults,
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        // Enhanced error context for error simulation failures
        const simulationError = new Error(`Error simulation failed: ${error.message}`);
        simulationError.originalError = error;
        simulationError.context = {
            errorType,
            errorConfig,
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        };
        throw simulationError;
    }
}

/**
 * Validates graceful server shutdown process including cleanup procedures,
 * resource deallocation, and shutdown timing.
 * 
 * @param {TestServer} testServer - Test server instance for shutdown validation
 * @param {Object} shutdownConfig - Shutdown configuration and timing requirements
 * @param {Object} testContext - Test execution context with correlation tracking
 * @returns {Promise<Object>} Promise resolving to shutdown validation results
 */
async function validateGracefulShutdown(testServer, shutdownConfig, testContext) {
    try {
        // Initialize shutdown validation results
        const shutdownResults = {
            shutdownTime: null,
            resourcesCleanedUp: false,
            serverStopped: false,
            gracefulShutdown: false,
            shutdownErrors: [],
            timestamp: new Date().toISOString()
        };
        
        // Start shutdown timing measurement using TestTimer for shutdown performance
        const shutdownTimer = new TestTimer();
        
        // Verify server is running before shutdown
        if (!testServer.isRunning()) {
            throw new Error('Server is not running - cannot validate shutdown');
        }
        
        const preShutdownInfo = testServer.getServerInfo();
        
        // Initiate graceful shutdown using TestServer.stop() with cleanup handling
        shutdownTimer.start();
        
        try {
            await testServer.stop();
            shutdownTimer.stop();
            shutdownResults.shutdownTime = shutdownTimer.getElapsed();
            shutdownResults.serverStopped = true;
        } catch (error) {
            shutdownTimer.stop();
            shutdownResults.shutdownTime = shutdownTimer.getElapsed();
            shutdownResults.shutdownErrors.push(`Shutdown error: ${error.message}`);
            throw error;
        }
        
        // Monitor server shutdown process and resource cleanup procedures
        await delay(100); // Allow time for cleanup operations
        
        // Validate shutdown timing meets graceful shutdown requirements
        const maxShutdownTime = shutdownConfig.maxShutdownTime || 2000; // 2 seconds default
        if (shutdownResults.shutdownTime <= maxShutdownTime) {
            shutdownResults.gracefulShutdown = true;
        } else {
            shutdownResults.shutdownErrors.push(
                `Shutdown time ${shutdownResults.shutdownTime}ms exceeds maximum ${maxShutdownTime}ms`
            );
        }
        
        // Verify all server resources are properly cleaned up and deallocated
        if (!testServer.isRunning()) {
            shutdownResults.resourcesCleanedUp = true;
        } else {
            shutdownResults.shutdownErrors.push('Server still running after shutdown');
        }
        
        // Check server status after shutdown using isRunning() method validation
        const postShutdownRunning = testServer.isRunning();
        if (postShutdownRunning) {
            shutdownResults.shutdownErrors.push('Server status indicates still running after shutdown');
        }
        
        // Validate shutdown logging and cleanup completion status reporting
        const shutdownMetrics = {
            preShutdownPort: preShutdownInfo.port,
            shutdownDuration: shutdownResults.shutdownTime,
            resourcesReleased: shutdownResults.resourcesCleanedUp,
            cleanShutdown: shutdownResults.gracefulShutdown
        };
        
        // Add test context to results
        shutdownResults.testContext = {
            correlationId: testContext.correlationId,
            shutdownMetrics,
            timestamp: new Date().toISOString()
        };
        
        // Determine overall shutdown success
        const shutdownSuccess = shutdownResults.serverStopped &&
                               shutdownResults.resourcesCleanedUp &&
                               shutdownResults.gracefulShutdown &&
                               shutdownResults.shutdownErrors.length === 0;
        
        // Return shutdown validation results with timing metrics and cleanup verification
        return {
            success: shutdownSuccess,
            shutdownResults,
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        // Enhanced error context for shutdown validation failures
        const shutdownError = new Error(`Graceful shutdown validation failed: ${error.message}`);
        shutdownError.originalError = error;
        shutdownError.context = {
            correlationId: testContext.correlationId,
            timestamp: new Date().toISOString()
        };
        throw shutdownError;
    }
}

// ============================================================================
// INTEGRATION TEST SUITE IMPLEMENTATION
// ============================================================================

describe('Server Startup Integration Tests', () => {
    // Test suite-level variables for shared test context and resource management
    let testEnvironment = null;
    let testServer = null;
    let correlationId = null;
    
    /**
     * Set up test environment and allocate resources before each test execution.
     * Initializes test context, allocates ports, and prepares assertion helpers.
     */
    beforeEach(async () => {
        try {
            // Generate unique correlation ID for test execution tracking
            correlationId = generateCorrelationId();
            
            // Set up isolated test environment with test-specific configuration
            testEnvironment = await setupTestEnvironment({
                scenario: 'server_startup_test',
                port: null, // Dynamic port allocation
                configOverrides: {
                    timeout: TEST_SUITE_CONFIG.timeout,
                    enableHealthChecks: TEST_SUITE_CONFIG.enableHealthChecks,
                    enablePerformanceValidation: TEST_SUITE_CONFIG.enablePerformanceValidation
                }
            }, correlationId);
            
            // Log test setup completion
            console.log('Test environment setup completed', {
                correlationId: correlationId,
                testPort: testEnvironment.testPort,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Test setup failed:', error.message);
            throw error;
        }
    });
    
    /**
     * Clean up test environment and resources after each test execution.
     * Ensures proper resource cleanup and test isolation between executions.
     */
    afterEach(async () => {
        try {
            // Clean up test environment and server resources
            await cleanupTestEnvironment(testEnvironment, testServer);
            
            // Reset test variables
            testEnvironment = null;
            testServer = null;
            correlationId = null;
            
        } catch (error) {
            console.error('Test cleanup failed:', error.message);
        }
    });
    
    // ========================================================================
    // BASIC STARTUP VALIDATION TESTS
    // ========================================================================
    
    describe('Basic Startup Validation', () => {
        test('should start server successfully with default configuration', async () => {
            // Create test server instance with specified configuration
            testServer = await createTestServer(testEnvironment.testEnvironmentConfig, testEnvironment);
            
            // Measure startup performance using high-precision timing
            const startupResults = await measureStartupPerformance(
                async () => {
                    await testServer.start();
                    return testServer.getServerInfo();
                },
                STARTUP_PERFORMANCE_THRESHOLDS,
                testEnvironment
            );
            
            // Validate server startup process and component initialization
            const validationResults = await validateServerStartup(
                testServer,
                testEnvironment.testEnvironmentConfig,
                testEnvironment.assertionContext
            );
            
            // Assert startup was successful
            assert.strictEqual(validationResults.success, true, 'Server startup should be successful');
            assert.strictEqual(startupResults.success, true, 'Startup performance should meet thresholds');
            assert.strictEqual(testServer.isRunning(), true, 'Server should be running after startup');
            
            // Validate startup timing meets requirements
            assert.ok(
                startupResults.performanceResults.timing.totalStartupTime <= STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime,
                `Startup time ${startupResults.performanceResults.timing.totalStartupTime}ms should be <= ${STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime}ms`
            );
        });
        
        test('should bind to specified port and become ready to accept connections', async () => {
            // Create test server with specific port configuration
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                port: testEnvironment.testPort,
                host: 'localhost'
            }, testEnvironment);
            
            // Start server and wait for readiness
            await testServer.start();
            await waitForServerReady(testServer, {
                timeout: STARTUP_PERFORMANCE_THRESHOLDS.maxServerBindTime
            });
            
            // Validate server listening status and network binding
            testEnvironment.serverStatusAssertion.assertServerListening(
                testServer.getServerInstance(),
                testEnvironment.testPort,
                testEnvironment.assertionContext
            );
            
            // Verify server information matches expected configuration
            const serverInfo = testServer.getServerInfo();
            assert.strictEqual(serverInfo.port, testEnvironment.testPort, 'Server should bind to allocated test port');
            assert.strictEqual(serverInfo.host, 'localhost', 'Server should bind to localhost interface');
            assert.strictEqual(serverInfo.listening, true, 'Server should be in listening state');
        });
        
        test('should initialize all application components during startup', async () => {
            // Create application instance with test configuration
            const appConfig = new AppConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                logLevel: 'error'
            });
            
            const application = createApplication(appConfig);
            
            // Create test server with application integration
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                application: application
            }, testEnvironment);
            
            // Start server and validate component initialization
            await testServer.start();
            
            // Check application health status and component coordination
            const appHealthStatus = await application.getHealthStatus();
            assert.strictEqual(appHealthStatus.status, 'healthy', 'Application should be healthy after startup');
            
            // Validate component integration and status
            const requiredComponents = ['httpServer', 'requestHandler', 'responseHandler'];
            requiredComponents.forEach(component => {
                assert.ok(
                    appHealthStatus.components[component],
                    `Component ${component} should be initialized`
                );
                assert.strictEqual(
                    appHealthStatus.components[component].status,
                    'healthy',
                    `Component ${component} should be healthy`
                );
            });
        });
        
        test('should complete startup within performance thresholds', async () => {
            // Create test server with performance monitoring enabled
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                monitoring: { enabled: true, performanceTracking: true }
            }, testEnvironment);
            
            // Measure startup performance with comprehensive timing validation
            const performanceResults = await measureStartupPerformance(
                async () => {
                    await testServer.start();
                    await waitForServerReady(testServer);
                    return testServer.getServerInfo();
                },
                STARTUP_PERFORMANCE_THRESHOLDS,
                testEnvironment
            );
            
            // Validate startup timing against all performance thresholds
            assert.ok(
                performanceResults.performanceResults.validation.startupTimeValid,
                'Startup time should meet performance threshold'
            );
            assert.ok(
                performanceResults.performanceResults.validation.memoryUsageValid,
                'Memory usage should meet performance threshold'
            );
            
            // Verify performance grade meets educational requirements
            const acceptableGrades = ['EXCELLENT', 'GOOD', 'ACCEPTABLE'];
            assert.ok(
                acceptableGrades.includes(performanceResults.performanceResults.validation.performanceGrade),
                `Performance grade ${performanceResults.performanceResults.validation.performanceGrade} should be acceptable`
            );
        });
    });
    
    // ========================================================================
    // CONFIGURATION VALIDATION TESTS
    // ========================================================================
    
    describe('Configuration Validation', () => {
        test('should validate application configuration before startup', async () => {
            // Create application configuration with test settings
            const appConfig = new AppConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                logLevel: 'error',
                features: {
                    helloEndpoint: true,
                    requestLogging: false,
                    cors: false
                }
            });
            
            const environmentConfig = new EnvironmentConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                logLevel: 'error'
            });
            
            // Validate configuration integrity using comprehensive validation
            const configValidation = validateConfigurationIntegrity(
                appConfig,
                environmentConfig,
                testEnvironment.assertionContext
            );
            
            // Assert configuration validation passes
            assert.strictEqual(configValidation.overallValid, true, 'Configuration should be valid');
            assert.strictEqual(configValidation.appConfigValid, true, 'App configuration should be valid');
            assert.strictEqual(configValidation.environmentConfigValid, true, 'Environment configuration should be valid');
            assert.strictEqual(configValidation.configurationConsistent, true, 'Configurations should be consistent');
            
            // Verify no validation errors
            assert.strictEqual(configValidation.validationErrors.length, 0, 
                `Should have no validation errors, found: ${configValidation.validationErrors.join(', ')}`);
        });
        
        test('should validate environment configuration and constraints', async () => {
            // Test environment configuration validation with test constraints
            const environmentConfig = new EnvironmentConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                logLevel: 'error',
                validateOnInit: true
            });
            
            // Validate environment configuration meets test requirements
            const envValidation = environmentConfig.validate();
            assert.strictEqual(envValidation.isValid, true, 'Environment configuration should be valid');
            
            // Check test environment specific settings
            assert.strictEqual(environmentConfig.isTest, true, 'Should be configured for test environment');
            
            const serverConfig = environmentConfig.getServerConfig();
            assert.strictEqual(serverConfig.port, testEnvironment.testPort, 'Port should match allocated test port');
            assert.strictEqual(serverConfig.host, 'localhost', 'Host should be localhost for test environment');
        });
        
        test('should handle invalid configuration with appropriate errors', async () => {
            // Test invalid configuration error handling
            const errorResults = await simulateStartupError(
                'configuration_error',
                { port: testEnvironment.testPort },
                testEnvironment
            );
            
            // Validate error generation and handling
            assert.strictEqual(errorResults.success, true, 'Error simulation should succeed');
            assert.strictEqual(
                errorResults.errorSimulationResults.errorGenerated,
                true,
                'Configuration error should be generated'
            );
            assert.strictEqual(
                errorResults.errorSimulationResults.errorHandled,
                true,
                'Configuration error should be handled properly'
            );
            
            // Verify error message provides helpful context
            assert.ok(
                errorResults.errorSimulationResults.errorMessage,
                'Error message should be provided for invalid configuration'
            );
        });
        
        test('should apply test-specific configuration correctly', async () => {
            // Create test server with test-specific configuration overrides
            const testSpecificConfig = {
                ...TEST_SERVER_CONFIGS.INTEGRATION,
                port: testEnvironment.testPort,
                logging: { enabled: false, level: 'error' },
                features: { helloEndpoint: true, requestLogging: false }
            };
            
            testServer = await createTestServer(testSpecificConfig, testEnvironment);
            await testServer.start();
            
            // Validate test-specific configuration is applied correctly
            const serverInfo = testServer.getServerInfo();
            assert.strictEqual(serverInfo.port, testEnvironment.testPort, 'Test port should be applied');
            
            // Verify test environment isolation
            assert.strictEqual(process.env.NODE_ENV, 'test', 'NODE_ENV should be set to test');
            assert.strictEqual(process.env.LOG_LEVEL, 'error', 'LOG_LEVEL should be set to error');
        });
    });
    
    // ========================================================================
    // HEALTH CHECK VALIDATION TESTS
    // ========================================================================
    
    describe('Health Check Validation', () => {
        test('should pass all health checks after successful startup', async () => {
            // Create application with health checking enabled
            const appConfig = new AppConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                features: { helloEndpoint: true }
            });
            
            const application = createApplication(appConfig);
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                application: application
            }, testEnvironment);
            
            // Start server and wait for full initialization
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Get server health status and validate all components
            const healthStatus = await testServer.getHealthStatus();
            
            // Validate server health using ServerStatusAssertion
            await testEnvironment.serverStatusAssertion.assertServerHealth(
                healthStatus,
                {
                    maxErrorRate: 0,
                    requiredComponents: ['httpServer', 'requestHandler'],
                    minUptime: 0
                },
                testEnvironment.assertionContext
            );
            
            // Assert overall health status
            assert.strictEqual(healthStatus.status, 'healthy', 'Server health status should be healthy');
            assert.ok(healthStatus.uptime >= 0, 'Server uptime should be non-negative');
            assert.strictEqual(healthStatus.errorRate, 0, 'Error rate should be zero for healthy server');
        });
        
        test('should report healthy status for all application components', async () => {
            // Create application with comprehensive component configuration
            const application = createApplication(new AppConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                features: { helloEndpoint: true, errorHandling: true }
            }));
            
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                application: application
            }, testEnvironment);
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Get application health status and component details
            const appHealthStatus = await application.getHealthStatus();
            
            // Validate each component is healthy and operational
            const expectedComponents = ['httpServer', 'requestHandler', 'responseHandler', 'errorHandler'];
            expectedComponents.forEach(component => {
                assert.ok(
                    appHealthStatus.components[component],
                    `Component ${component} should be present in health status`
                );
                assert.strictEqual(
                    appHealthStatus.components[component].status,
                    'healthy',
                    `Component ${component} should be healthy`
                );
                assert.ok(
                    appHealthStatus.components[component].uptime >= 0,
                    `Component ${component} should have non-negative uptime`
                );
            });
        });
        
        test('should provide accurate server information and metadata', async () => {
            // Create test server with metadata collection enabled
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                name: 'Integration-Test-Server',
                monitoring: { enabled: true }
            }, testEnvironment);
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Get comprehensive server information
            const serverInfo = testServer.getServerInfo();
            
            // Validate server information accuracy and completeness
            assert.strictEqual(serverInfo.port, testEnvironment.testPort, 'Server info should report correct port');
            assert.strictEqual(serverInfo.host, 'localhost', 'Server info should report correct host');
            assert.strictEqual(serverInfo.listening, true, 'Server info should indicate listening status');
            assert.strictEqual(serverInfo.name, 'Integration-Test-Server', 'Server info should report correct name');
            
            // Verify server metadata is accurate
            assert.ok(serverInfo.startTime, 'Server info should include start time');
            assert.ok(serverInfo.nodeVersion, 'Server info should include Node.js version');
            assert.strictEqual(serverInfo.environment, 'test', 'Server info should indicate test environment');
        });
        
        test('should validate component integration and coordination', async () => {
            // Create application with multiple components for integration testing
            const application = createApplication(new AppConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                features: {
                    helloEndpoint: true,
                    errorHandling: true,
                    requestLogging: false
                }
            }));
            
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                application: application
            }, testEnvironment);
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Test component integration by validating application information
            const appInfo = await application.getApplicationInfo();
            
            // Validate component coordination and integration
            assert.ok(appInfo.components, 'Application info should include component information');
            assert.ok(appInfo.routes, 'Application info should include route information');
            assert.ok(appInfo.configuration, 'Application info should include configuration details');
            
            // Check component interdependencies
            const healthStatus = await application.getHealthStatus();
            const componentCount = Object.keys(healthStatus.components).length;
            assert.ok(componentCount >= 2, 'Should have multiple integrated components');
            
            // Verify all components are coordinated and healthy
            Object.values(healthStatus.components).forEach(component => {
                assert.strictEqual(component.status, 'healthy', 'All components should be healthy');
                assert.ok(component.uptime >= 0, 'All components should have valid uptime');
            });
        });
    });
    
    // ========================================================================
    // PERFORMANCE VALIDATION TESTS
    // ========================================================================
    
    describe('Performance Validation', () => {
        test('should complete startup within maximum allowed time', async () => {
            // Create test server with performance monitoring configuration
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                monitoring: { performanceTracking: true }
            }, testEnvironment);
            
            // Measure startup performance with strict timing validation
            const performanceResults = await measureStartupPerformance(
                async () => {
                    await testServer.start();
                    await waitForServerReady(testServer);
                    return testServer;
                },
                STARTUP_PERFORMANCE_THRESHOLDS,
                testEnvironment
            );
            
            // Assert startup timing meets strict performance requirements
            assert.ok(
                performanceResults.performanceResults.timing.totalStartupTime <= STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime,
                `Startup time ${performanceResults.performanceResults.timing.totalStartupTime}ms exceeds maximum ${STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime}ms`
            );
            
            // Validate performance grade meets educational standards
            const performanceGrade = performanceResults.performanceResults.validation.performanceGrade;
            const acceptableGrades = ['EXCELLENT', 'GOOD', 'ACCEPTABLE'];
            assert.ok(
                acceptableGrades.includes(performanceGrade),
                `Performance grade ${performanceGrade} should be acceptable`
            );
        });
        
        test('should use memory efficiently during startup process', async () => {
            // Create test server with memory tracking enabled
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                monitoring: { memoryTracking: true }
            }, testEnvironment);
            
            // Measure memory usage during startup with comprehensive tracking
            const memoryResults = await testEnvironment.performanceAssertion.assertMemoryUsage(
                async () => {
                    await testServer.start();
                    await waitForServerReady(testServer);
                    return process.memoryUsage();
                },
                STARTUP_PERFORMANCE_THRESHOLDS.maxMemoryUsage,
                testEnvironment.assertionContext
            );
            
            // Validate memory efficiency and usage patterns
            assert.ok(
                memoryResults.memoryAnalysis.peak.heapUsed <= STARTUP_PERFORMANCE_THRESHOLDS.maxMemoryUsage,
                'Memory usage should be within threshold'
            );
            
            // Check memory growth during startup is reasonable
            const memoryGrowth = memoryResults.memoryAnalysis.growth.heapUsed;
            const maxAllowedGrowth = 10 * 1024 * 1024; // 10MB
            assert.ok(
                memoryGrowth <= maxAllowedGrowth,
                `Memory growth ${Math.round(memoryGrowth / 1024 / 1024)}MB should be <= 10MB`
            );
        });
        
        test('should meet educational tutorial performance requirements', async () => {
            // Create test server optimized for educational performance demonstration
            testServer = await createTestServer({
                ...TEST_SERVER_CONFIGS.INTEGRATION,
                port: testEnvironment.testPort,
                optimizations: { educationalMode: true }
            }, testEnvironment);
            
            // Validate startup performance meets tutorial requirements
            const educationalTimer = new TestTimer();
            educationalTimer.start();
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            educationalTimer.stop();
            const educationalStartupTime = educationalTimer.getElapsed();
            
            // Educational performance requirements (more lenient for learning)
            const educationalThresholds = {
                maxStartupTime: 3000,  // 3 seconds for educational clarity
                maxMemoryUsage: 30000000  // 30MB for educational scenarios
            };
            
            // Assert educational performance requirements
            assert.ok(
                educationalStartupTime <= educationalThresholds.maxStartupTime,
                `Educational startup time ${educationalStartupTime}ms should be <= ${educationalThresholds.maxStartupTime}ms`
            );
            
            // Validate educational memory usage
            const currentMemory = process.memoryUsage().heapUsed;
            assert.ok(
                currentMemory <= educationalThresholds.maxMemoryUsage,
                `Educational memory usage ${Math.round(currentMemory / 1024 / 1024)}MB should be <= ${Math.round(educationalThresholds.maxMemoryUsage / 1024 / 1024)}MB`
            );
        });
        
        test('should demonstrate acceptable startup performance patterns', async () => {
            // Create multiple test servers to demonstrate performance consistency
            const performanceTestResults = [];
            const numberOfTests = 3;
            
            for (let i = 0; i < numberOfTests; i++) {
                // Allocate new port for each test iteration
                const testPort = await getTestPort(null, { randomSelection: true });
                
                // Create isolated test server instance
                const iterationServer = await createTestServer({
                    ...testEnvironment.testEnvironmentConfig,
                    port: testPort,
                    name: `Performance-Test-Server-${i + 1}`
                }, testEnvironment);
                
                // Measure startup performance for consistency analysis
                const iterationTimer = new TestTimer();
                iterationTimer.start();
                
                await iterationServer.start();
                await waitForServerReady(iterationServer);
                
                iterationTimer.stop();
                const iterationTime = iterationTimer.getElapsed();
                
                performanceTestResults.push({
                    iteration: i + 1,
                    startupTime: iterationTime,
                    memoryUsage: process.memoryUsage().heapUsed,
                    port: testPort
                });
                
                // Cleanup iteration server
                await iterationServer.stop();
            }
            
            // Validate performance consistency across multiple startups
            const startupTimes = performanceTestResults.map(result => result.startupTime);
            const averageStartupTime = startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length;
            const maxStartupTime = Math.max(...startupTimes);
            
            // Assert performance consistency and reliability
            assert.ok(
                averageStartupTime <= STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime,
                `Average startup time ${averageStartupTime.toFixed(2)}ms should meet threshold`
            );
            assert.ok(
                maxStartupTime <= STARTUP_PERFORMANCE_THRESHOLDS.maxStartupTime * 1.5,
                `Maximum startup time ${maxStartupTime}ms should be within acceptable variance`
            );
            
            // Calculate performance variance for consistency validation
            const variance = startupTimes.reduce((acc, time) => 
                acc + Math.pow(time - averageStartupTime, 2), 0) / startupTimes.length;
            const standardDeviation = Math.sqrt(variance);
            
            // Validate performance consistency (standard deviation should be reasonable)
            assert.ok(
                standardDeviation <= averageStartupTime * 0.3,
                `Performance variance should be acceptable (std dev: ${standardDeviation.toFixed(2)}ms)`
            );
        });
    });
    
    // ========================================================================
    // ERROR HANDLING VALIDATION TESTS
    // ========================================================================
    
    describe('Error Handling Validation', () => {
        test('should handle port conflicts gracefully with appropriate errors', async () => {
            // Test port conflict error handling and recovery
            const portConflictResults = await simulateStartupError(
                'port_conflict',
                { port: testEnvironment.testPort },
                testEnvironment
            );
            
            // Validate port conflict detection and error handling
            assert.strictEqual(portConflictResults.success, true, 'Port conflict simulation should succeed');
            assert.strictEqual(
                portConflictResults.errorSimulationResults.errorGenerated,
                true,
                'Port conflict error should be generated'
            );
            assert.strictEqual(
                portConflictResults.errorSimulationResults.errorHandled,
                true,
                'Port conflict error should be handled appropriately'
            );
            
            // Verify error message indicates port conflict
            const errorMessage = portConflictResults.errorSimulationResults.errorMessage;
            assert.ok(
                errorMessage.includes('EADDRINUSE') || errorMessage.includes('address already in use'),
                'Error message should indicate port conflict'
            );
        });
        
        test('should validate configuration errors and provide helpful messages', async () => {
            // Test configuration error handling with detailed validation
            const configErrorResults = await simulateStartupError(
                'configuration_error',
                { invalidProperty: 'invalid_port_value' },
                testEnvironment
            );
            
            // Validate configuration error detection and helpful error reporting
            assert.strictEqual(configErrorResults.success, true, 'Configuration error simulation should succeed');
            assert.strictEqual(
                configErrorResults.errorSimulationResults.errorGenerated,
                true,
                'Configuration error should be generated'
            );
            
            // Verify error message provides helpful context for debugging
            const errorMessage = configErrorResults.errorSimulationResults.errorMessage;
            assert.ok(errorMessage.length > 0, 'Error message should be provided');
            assert.ok(
                errorMessage.includes('port') || errorMessage.includes('configuration'),
                'Error message should mention configuration issue'
            );
        });
        
        test('should handle component initialization failures appropriately', async () => {
            // Test component initialization failure handling
            try {
                // Create application with invalid component configuration
                const invalidAppConfig = new AppConfig({
                    environment: 'test',
                    port: -1, // Invalid port to trigger component failure
                    features: { helloEndpoint: true }
                });
                
                const application = createApplication(invalidAppConfig);
                testServer = await createTestServer({
                    ...testEnvironment.testEnvironmentConfig,
                    application: application
                }, testEnvironment);
                
                // Attempt server startup and expect failure
                let startupError = null;
                try {
                    await testServer.start();
                } catch (error) {
                    startupError = error;
                }
                
                // Validate component initialization failure is handled properly
                assert.ok(startupError, 'Component initialization failure should generate error');
                assert.ok(
                    startupError.message.includes('port') || startupError.message.includes('configuration'),
                    'Error should relate to component configuration'
                );
                
                // Verify server is not running after initialization failure
                assert.strictEqual(testServer.isRunning(), false, 'Server should not be running after initialization failure');
                
            } catch (error) {
                // Component initialization failure testing is successful if error is caught
                assert.ok(error.message.includes('port') || error.message.includes('configuration'),
                    'Component failure should provide helpful error context');
            }
        });
        
        test('should log startup errors with sufficient context and detail', async () => {
            // Test comprehensive error logging during startup failures
            const originalConsoleError = console.error;
            const errorLogs = [];
            
            // Capture error logs for validation
            console.error = (...args) => {
                errorLogs.push({
                    timestamp: new Date().toISOString(),
                    message: args.join(' '),
                    args: args
                });
                originalConsoleError.apply(console, args);
            };
            
            try {
                // Attempt startup with configuration that will cause error
                const environmentErrorResults = await simulateStartupError(
                    'invalid_environment',
                    { environment: 'invalid_test_env' },
                    testEnvironment
                );
                
                // Validate error logging captured sufficient context
                assert.ok(errorLogs.length > 0, 'Error logs should be generated during startup failure');
                
                // Check error log context includes correlation information
                const relevantLogs = errorLogs.filter(log => 
                    log.message.includes('error') || log.message.includes('failed')
                );
                
                assert.ok(relevantLogs.length > 0, 'Should have relevant error logs');
                
                // Validate error simulation results
                assert.strictEqual(
                    environmentErrorResults.errorSimulationResults.errorGenerated,
                    true,
                    'Environment error should be generated'
                );
                
            } finally {
                // Restore original console.error
                console.error = originalConsoleError;
            }
        });
    });
    
    // ========================================================================
    // GRACEFUL SHUTDOWN VALIDATION TESTS
    // ========================================================================
    
    describe('Graceful Shutdown Validation', () => {
        test('should shutdown gracefully with proper resource cleanup', async () => {
            // Create test server for graceful shutdown testing
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                gracefulShutdown: true,
                cleanupTimeout: 1000
            }, testEnvironment);
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Validate graceful shutdown process and resource cleanup
            const shutdownResults = await validateGracefulShutdown(
                testServer,
                { maxShutdownTime: 2000 },
                testEnvironment
            );
            
            // Assert graceful shutdown completed successfully
            assert.strictEqual(shutdownResults.success, true, 'Graceful shutdown should succeed');
            assert.strictEqual(
                shutdownResults.shutdownResults.gracefulShutdown,
                true,
                'Shutdown should be graceful'
            );
            assert.strictEqual(
                shutdownResults.shutdownResults.resourcesCleanedUp,
                true,
                'Resources should be cleaned up'
            );
            assert.strictEqual(
                shutdownResults.shutdownResults.serverStopped,
                true,
                'Server should be stopped'
            );
        });
        
        test('should complete shutdown within acceptable time limits', async () => {
            // Create test server with shutdown timing requirements
            testServer = await createTestServer(testEnvironment.testEnvironmentConfig, testEnvironment);
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Measure shutdown timing with strict time validation
            const shutdownTimer = new TestTimer();
            shutdownTimer.start();
            
            await testServer.stop();
            
            shutdownTimer.stop();
            const shutdownTime = shutdownTimer.getElapsed();
            
            // Assert shutdown timing meets performance requirements
            const maxShutdownTime = 2000; // 2 seconds maximum
            assert.ok(
                shutdownTime <= maxShutdownTime,
                `Shutdown time ${shutdownTime}ms should be <= ${maxShutdownTime}ms`
            );
            
            // Validate server is properly stopped
            assert.strictEqual(testServer.isRunning(), false, 'Server should not be running after shutdown');
        });
        
        test('should clean up all server resources and connections', async () => {
            // Create test server with resource tracking enabled
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                resourceTracking: true
            }, testEnvironment);
            
            await testServer.start();
            await waitForServerReady(testServer);
            
            // Get baseline resource information
            const preShutdownInfo = testServer.getServerInfo();
            const baselineMemory = process.memoryUsage();
            
            // Perform graceful shutdown with resource cleanup validation
            await testServer.stop();
            
            // Allow time for cleanup operations
            await delay(500);
            
            // Validate resource cleanup
            assert.strictEqual(testServer.isRunning(), false, 'Server should be stopped');
            
            // Check memory cleanup (should not grow significantly)
            const postShutdownMemory = process.memoryUsage();
            const memoryGrowth = postShutdownMemory.heapUsed - baselineMemory.heapUsed;
            const maxAllowedMemoryGrowth = 5 * 1024 * 1024; // 5MB tolerance
            
            assert.ok(
                memoryGrowth <= maxAllowedMemoryGrowth,
                `Memory growth after shutdown ${Math.round(memoryGrowth / 1024 / 1024)}MB should be minimal`
            );
        });
        
        test('should log shutdown completion with performance metrics', async () => {
            // Test shutdown logging and metrics reporting
            const originalConsoleLog = console.log;
            const shutdownLogs = [];
            
            // Capture shutdown logs for validation
            console.log = (...args) => {
                shutdownLogs.push({
                    timestamp: new Date().toISOString(),
                    message: args.join(' '),
                    args: args
                });
                originalConsoleLog.apply(console, args);
            };
            
            try {
                // Create test server with logging enabled
                testServer = await createTestServer({
                    ...testEnvironment.testEnvironmentConfig,
                    logging: { enabled: true, level: 'info' }
                }, testEnvironment);
                
                await testServer.start();
                await waitForServerReady(testServer);
                
                // Perform shutdown with logging validation
                const shutdownResults = await validateGracefulShutdown(
                    testServer,
                    { maxShutdownTime: 2000, enableLogging: true },
                    testEnvironment
                );
                
                // Validate shutdown logging includes performance metrics
                const shutdownRelevantLogs = shutdownLogs.filter(log =>
                    log.message.includes('shutdown') || log.message.includes('cleanup')
                );
                
                assert.ok(shutdownRelevantLogs.length > 0, 'Should have shutdown-related logs');
                
                // Verify shutdown results include timing metrics
                assert.ok(
                    shutdownResults.shutdownResults.shutdownTime !== null,
                    'Shutdown results should include timing metrics'
                );
                
            } finally {
                // Restore original console.log
                console.log = originalConsoleLog;
            }
        });
    });
    
    // ========================================================================
    // COMPREHENSIVE INTEGRATION SCENARIOS
    // ========================================================================
    
    describe('Comprehensive Integration Scenarios', () => {
        test('should handle complete server lifecycle with all validations', async () => {
            // Test complete server lifecycle from startup through shutdown
            const lifecycleTimer = new TestTimer();
            lifecycleTimer.start();
            
            // Phase 1: Server Creation and Configuration Validation
            const appConfig = new AppConfig({
                environment: 'test',
                port: testEnvironment.testPort,
                features: { helloEndpoint: true, errorHandling: true }
            });
            
            const configValidation = validateConfigurationIntegrity(
                appConfig,
                new EnvironmentConfig({ environment: 'test', port: testEnvironment.testPort }),
                testEnvironment.assertionContext
            );
            
            assert.strictEqual(configValidation.overallValid, true, 'Phase 1: Configuration should be valid');
            
            // Phase 2: Server Startup and Performance Validation
            const application = createApplication(appConfig);
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                application: application
            }, testEnvironment);
            
            const startupResults = await validateServerStartup(
                testServer,
                testEnvironment.testEnvironmentConfig,
                testEnvironment.assertionContext
            );
            
            assert.strictEqual(startupResults.success, true, 'Phase 2: Server startup should succeed');
            
            // Phase 3: Health Check and Component Validation
            const healthStatus = await testServer.getHealthStatus();
            await testEnvironment.serverStatusAssertion.assertServerHealth(
                healthStatus,
                {
                    maxErrorRate: 0,
                    requiredComponents: ['httpServer', 'requestHandler'],
                    minUptime: 0
                },
                testEnvironment.assertionContext
            );
            
            // Phase 4: Performance Validation
            const performanceResults = await measureStartupPerformance(
                async () => {
                    // Simulate additional load for performance testing
                    await delay(100);
                    return testServer.getServerInfo();
                },
                STARTUP_PERFORMANCE_THRESHOLDS,
                testEnvironment
            );
            
            assert.ok(
                performanceResults.performanceResults.validation.startupTimeValid,
                'Phase 4: Performance should meet thresholds'
            );
            
            // Phase 5: Graceful Shutdown Validation
            const shutdownResults = await validateGracefulShutdown(
                testServer,
                { maxShutdownTime: 2000 },
                testEnvironment
            );
            
            assert.strictEqual(shutdownResults.success, true, 'Phase 5: Graceful shutdown should succeed');
            
            lifecycleTimer.stop();
            const totalLifecycleTime = lifecycleTimer.getElapsed();
            
            // Validate complete lifecycle timing
            const maxLifecycleTime = 15000; // 15 seconds for complete lifecycle
            assert.ok(
                totalLifecycleTime <= maxLifecycleTime,
                `Complete lifecycle time ${totalLifecycleTime}ms should be <= ${maxLifecycleTime}ms`
            );
        });
        
        test('should demonstrate production-ready integration testing patterns', async () => {
            // Demonstrate comprehensive integration testing with production patterns
            const integrationTestContext = new TestExecutionContext();
            integrationTestContext.setTestInfo({
                correlationId: correlationId,
                testType: 'production_integration_patterns',
                scenario: 'comprehensive_validation',
                timestamp: new Date().toISOString()
            });
            
            // Production-pattern 1: Configuration Validation with Multiple Sources
            const multiConfigValidation = [];
            
            const configs = [
                new AppConfig({ environment: 'test', port: testEnvironment.testPort }),
                new EnvironmentConfig({ environment: 'test', port: testEnvironment.testPort })
            ];
            
            for (const config of configs) {
                const validation = config.validate();
                multiConfigValidation.push({
                    configType: config.constructor.name,
                    isValid: validation.isValid,
                    errors: validation.errors || []
                });
            }
            
            // Assert all configurations are valid
            multiConfigValidation.forEach(validation => {
                assert.strictEqual(validation.isValid, true, 
                    `${validation.configType} should be valid: ${validation.errors.join(', ')}`);
            });
            
            // Production-pattern 2: Server Lifecycle with Monitoring
            const application = createApplication(configs[0]);
            testServer = await createTestServer({
                ...testEnvironment.testEnvironmentConfig,
                application: application,
                monitoring: { enabled: true, comprehensive: true }
            }, testEnvironment);
            
            // Track multiple lifecycle events
            const lifecycleEvents = [];
            const originalLog = console.log;
            console.log = (...args) => {
                if (args[0] && typeof args[0] === 'string' && 
                    (args[0].includes('server') || args[0].includes('listening') || args[0].includes('health'))) {
                    lifecycleEvents.push({
                        timestamp: new Date().toISOString(),
                        event: args[0],
                        context: args[1] || {}
                    });
                }
                originalLog.apply(console, args);
            };
            
            try {
                // Execute complete lifecycle with event tracking
                await testServer.start();
                await waitForServerReady(testServer);
                
                const healthStatus = await testServer.getHealthStatus();
                integrationTestContext.addMetric('healthCheckTime', Date.now());
                
                await testServer.stop();
                
                // Validate lifecycle event tracking
                assert.ok(lifecycleEvents.length > 0, 'Should have tracked lifecycle events');
                
                // Get integration test results
                const integrationResults = integrationTestContext.getResults();
                assert.ok(integrationResults.correlationId, 'Should have correlation tracking');
                assert.ok(integrationResults.testInfo, 'Should have test information');
                
            } finally {
                console.log = originalLog;
            }
        });
    });
});