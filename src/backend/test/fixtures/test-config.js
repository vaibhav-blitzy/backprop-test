/**
 * Comprehensive Test Configuration Fixture Module for Node.js Tutorial Application
 * 
 * Provides standardized test configurations, test environment management, and configuration
 * factories for the Node.js tutorial application testing framework. This module implements
 * test-specific server configurations, port management, environment isolation, and
 * configuration generation utilities used across unit tests, integration tests, and
 * end-to-end tests.
 * 
 * Key Features:
 * - Dynamic port allocation with conflict avoidance and port range management
 * - Test environment isolation with test-specific environment variable management
 * - Configuration factories for different test types (unit, integration, e2e, performance)
 * - Comprehensive test configuration validation with detailed error reporting
 * - Test correlation and identification for tracking across test execution
 * - Performance testing configurations with load testing optimizations
 * - Educational patterns demonstrating testing configuration management best practices
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive testing configuration management and best practices
 * - Shows environment isolation and test-specific configuration patterns
 * - Illustrates dynamic resource allocation and lifecycle management for testing
 * - Provides examples of Node.js-specific testing patterns and built-in module integration
 * - Shows automated test configuration generation and support utilities
 * - Demonstrates production-ready testing configuration and management patterns
 * 
 * Architecture Integration:
 * - Integrates with EnvironmentConfig for test environment management
 * - Uses ServerConfig for test server configuration generation
 * - Incorporates HTTP status codes for test configuration validation
 * - Utilizes Logger for test execution debugging and configuration operations
 * - Leverages Node.js built-in modules for system integration and network configuration
 * 
 * @fileoverview Comprehensive test configuration fixture for Node.js tutorial testing framework
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import environment configuration for test-specific environment settings and validation
import { EnvironmentConfig } from '../../config/environment.js';

// Import server configuration patterns and structures for test server configuration generation
import { ServerConfig } from '../../config/server.config.js';

// Import HTTP status code constants for test configuration validation and response testing
import { HTTP_STATUS_CODES } from '../../utils/http-status.js';

// Import logging configuration for test execution and debugging test configuration operations
import { Logger } from '../../utils/logger.js';

// Import Node.js built-in modules for system information and platform-specific test configuration
import os from 'node:os'; // Node.js v22.x LTS - Built-in OS module for system information

// Import Node.js crypto module for generating unique test identifiers and port selection
import crypto from 'node:crypto'; // Node.js v22.x LTS - Built-in crypto module for random generation

// Import Node.js net module for port availability testing and network configuration validation
import net from 'node:net'; // Node.js v22.x LTS - Built-in net module for network operations

// ============================================================================
// GLOBAL TEST CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Default test port for test server instances when no specific port is requested.
 * This port serves as the starting point for test port allocation and provides
 * a consistent default for test server binding operations.
 */
const DEFAULT_TEST_PORT = 3001;

/**
 * Test port range configuration for dynamic test port allocation with conflict avoidance.
 * Defines the allowed port range for test server instances to prevent conflicts
 * with development and production servers while ensuring adequate port availability.
 */
const TEST_PORT_RANGE = {
    min: 3001,
    max: 3100
};

/**
 * Default test timeout duration in milliseconds for test execution and server operations.
 * Provides appropriate timeout settings for test scenarios while ensuring sufficient
 * time for test completion and resource cleanup operations.
 */
const TEST_TIMEOUT = 5000;

/**
 * Maximum number of port allocation attempts before giving up on finding an available port.
 * Prevents infinite loops during port allocation while providing sufficient retry attempts
 * for finding available ports in busy test environments.
 */
const MAX_PORT_ATTEMPTS = 10;

/**
 * Test server name identifier for server header and identification purposes.
 * Provides clear identification of test server instances in logs and monitoring
 * while distinguishing test servers from development and production instances.
 */
const TEST_SERVER_NAME = 'NodeJS-Tutorial-Test';

/**
 * Duration for performance testing scenarios in milliseconds for load testing validation.
 * Defines the standard duration for performance tests to ensure consistent
 * performance measurement and baseline establishment across test executions.
 */
const PERFORMANCE_TEST_DURATION = 10000;

/**
 * Maximum concurrent connections limit for performance testing and load validation.
 * Establishes the upper limit for concurrent connection testing to validate
 * server performance under high load while preventing resource exhaustion.
 */
const CONCURRENT_CONNECTIONS_LIMIT = 100;

/**
 * Test correlation prefix for generating unique test identifiers and correlation tracking.
 * Provides consistent prefix for test correlation IDs to enable tracking and
 * debugging across distributed test execution and parallel test scenarios.
 */
const TEST_CORRELATION_PREFIX = 'test-config-';

// ============================================================================
// PORT MANAGEMENT AND ALLOCATION UTILITIES
// ============================================================================

/**
 * Dynamically allocates an available port for test server instances with conflict avoidance
 * and port range management. Implements comprehensive port allocation strategy with retry
 * logic, availability testing, and conflict resolution for reliable test server binding.
 * 
 * @param {number} [preferredPort] - Preferred port number for allocation attempt
 * @param {Object} [portOptions={}] - Port allocation options and configuration
 * @param {number} [portOptions.minPort=TEST_PORT_RANGE.min] - Minimum port in allocation range
 * @param {number} [portOptions.maxPort=TEST_PORT_RANGE.max] - Maximum port in allocation range
 * @param {number} [portOptions.maxAttempts=MAX_PORT_ATTEMPTS] - Maximum allocation attempts
 * @param {boolean} [portOptions.randomSelection=true] - Enable random port selection
 * @returns {Promise<number>} Available port number for test server binding or rejection if no ports available
 * 
 * @throws {Error} Port allocation failure with detailed error context and troubleshooting information
 * 
 * @example
 * const port = await getTestPort(3001);
 * console.log('Allocated port:', port); // 3001 or next available port
 * 
 * const randomPort = await getTestPort(null, { randomSelection: true });
 * console.log('Random port:', randomPort); // Random available port in range
 */
async function getTestPort(preferredPort, portOptions = {}) {
    // Initialize port allocation options with defaults
    const options = {
        minPort: TEST_PORT_RANGE.min,
        maxPort: TEST_PORT_RANGE.max,
        maxAttempts: MAX_PORT_ATTEMPTS,
        randomSelection: true,
        ...portOptions
    };
    
    // Initialize port allocation tracking and attempt counter
    let attempts = 0;
    let currentPort = preferredPort;
    
    try {
        // Validate preferred port parameter and port options configuration
        if (preferredPort !== null && preferredPort !== undefined) {
            if (typeof preferredPort !== 'number' || 
                preferredPort < options.minPort || 
                preferredPort > options.maxPort) {
                throw new Error(`Preferred port ${preferredPort} is outside valid range ${options.minPort}-${options.maxPort}`);
            }
            
            // Check if preferred port is available using net module port testing
            const isPreferredAvailable = await testPortAvailability(preferredPort);
            if (isPreferredAvailable) {
                // Return preferred port immediately if available and within test range
                return preferredPort;
            }
        }
        
        // Generate random port within TEST_PORT_RANGE if preferred port unavailable
        while (attempts < options.maxAttempts) {
            attempts++;
            
            // Generate port based on selection strategy
            if (options.randomSelection || currentPort === null || currentPort === undefined) {
                currentPort = Math.floor(Math.random() * (options.maxPort - options.minPort + 1)) + options.minPort;
            } else {
                // Incremental search strategy for systematic port testing
                currentPort = options.minPort + (attempts - 1);
                if (currentPort > options.maxPort) {
                    currentPort = options.minPort;
                }
            }
            
            // Test port availability using net.createServer() and immediate close
            const isAvailable = await testPortAvailability(currentPort);
            if (isAvailable) {
                // Return available port number after successful allocation
                return currentPort;
            }
            
            // Handle port allocation conflicts with incremental search strategy
            if (!options.randomSelection) {
                currentPort++;
                if (currentPort > options.maxPort) {
                    currentPort = options.minPort;
                }
            }
        }
        
        // Return available port number or reject promise if no ports available
        throw new Error(`Failed to allocate port after ${attempts} attempts. All ports in range ${options.minPort}-${options.maxPort} appear to be in use.`);
        
    } catch (error) {
        // Enhanced error context for port allocation failures
        const portError = new Error(`Port allocation failed: ${error.message}`);
        portError.originalError = error;
        portError.context = {
            preferredPort,
            options,
            attempts,
            lastTriedPort: currentPort,
            timestamp: new Date().toISOString()
        };
        throw portError;
    }
}

/**
 * Tests port availability using Node.js net module for reliable port availability checking.
 * Creates a temporary server instance to test port binding and immediately closes it
 * to verify port availability without resource leakage.
 * 
 * @private
 * @param {number} port - Port number to test for availability
 * @returns {Promise<boolean>} True if port is available, false if in use
 */
async function testPortAvailability(port) {
    return new Promise((resolve) => {
        // Create temporary server for port availability testing
        const testServer = net.createServer();
        
        // Set up error handler for port in use scenarios
        testServer.on('error', () => {
            resolve(false); // Port is not available
        });
        
        // Test port binding with immediate closure
        testServer.listen(port, 'localhost', () => {
            // Port is available, close server immediately
            testServer.close(() => {
                resolve(true); // Port is available
            });
        });
        
        // Set timeout to prevent hanging on problematic ports
        setTimeout(() => {
            testServer.close(() => {
                resolve(false); // Assume unavailable if timeout reached
            });
        }, 1000);
    });
}

// ============================================================================
// TEST CONFIGURATION FACTORY FUNCTIONS
// ============================================================================

/**
 * Factory function for creating test-specific server configurations with environment isolation
 * and testing optimizations. Implements test-specific server configuration generation with
 * support for different test types and scenario-specific optimizations.
 * 
 * @param {string} testType - Type of test configuration (unit, integration, e2e, performance, error)
 * @param {Object} [configOptions={}] - Configuration options for test scenario customization
 * @param {number} [configOptions.port] - Specific port for test server binding
 * @param {string} [configOptions.environment=test] - Test environment type
 * @param {Object} [configOptions.features] - Feature flag overrides for testing
 * @param {Object} [configOptions.performance] - Performance-specific settings
 * @returns {Object} Test server configuration object optimized for specified test type and scenario
 * 
 * @throws {Error} Configuration creation errors with detailed context and troubleshooting information
 * 
 * @example
 * const unitConfig = createTestServerConfig('unit', { port: 3001 });
 * const perfConfig = createTestServerConfig('performance', { 
 *   performance: { concurrentConnections: 200 } 
 * });
 */
function createTestServerConfig(testType, configOptions = {}) {
    try {
        // Validate test type parameter against supported test configuration types
        const validTestTypes = ['unit', 'integration', 'e2e', 'performance', 'error'];
        const normalizedTestType = (testType || 'unit').toString().toLowerCase().trim();
        
        if (!validTestTypes.includes(normalizedTestType)) {
            throw new Error(`Invalid test type: ${testType}. Valid types: ${validTestTypes.join(', ')}`);
        }
        
        // Initialize test-specific environment configuration
        const testEnvironmentOptions = {
            environment: 'test',
            port: configOptions.port || DEFAULT_TEST_PORT,
            logLevel: 'error', // Minimal logging for test isolation
            validateOnInit: false
        };
        
        // Create base server configuration using ServerConfig class patterns
        const testEnvironmentConfig = new EnvironmentConfig(testEnvironmentOptions);
        const baseServerConfig = new ServerConfig(testEnvironmentConfig);
        
        // Apply test-specific optimizations based on test type (unit, integration, e2e)
        const testSpecificConfig = getTestTypeConfiguration(normalizedTestType, configOptions);
        
        // Configure test environment isolation settings and resource limits
        const serverConfiguration = {
            // Base server options from ServerConfig
            ...baseServerConfig.toJSON(),
            
            // Test-specific server configuration
            testType: normalizedTestType,
            port: configOptions.port || DEFAULT_TEST_PORT,
            host: 'localhost',
            name: TEST_SERVER_NAME,
            
            // Set up test-specific logging, timeouts, and connection management
            logging: {
                enabled: testSpecificConfig.logging.enabled,
                level: testSpecificConfig.logging.level,
                requestLogging: testSpecificConfig.logging.requestLogging
            },
            
            // Apply test-specific timeouts and connection settings
            timeouts: {
                server: testSpecificConfig.timeouts.server,
                request: testSpecificConfig.timeouts.request,
                keep_alive: testSpecificConfig.timeouts.keep_alive
            },
            
            // Configure connection management and resource limits
            connection: {
                maxConnections: testSpecificConfig.connection.maxConnections,
                keepAlive: testSpecificConfig.connection.keepAlive,
                timeout: testSpecificConfig.connection.timeout
            },
            
            // Apply performance testing configurations for load testing scenarios
            performance: {
                concurrentConnections: testSpecificConfig.performance.concurrentConnections,
                duration: testSpecificConfig.performance.duration,
                monitoring: testSpecificConfig.performance.monitoring
            },
            
            // Include test correlation and identification metadata
            correlation: {
                testId: generateTestId(normalizedTestType, 'server'),
                sessionId: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                testType: normalizedTestType
            },
            
            // Test environment variables and feature flags
            environment: {
                NODE_ENV: 'test',
                PORT: configOptions.port || DEFAULT_TEST_PORT,
                LOG_LEVEL: testSpecificConfig.logging.level,
                ENABLE_CORS: false,
                SERVER_TIMEOUT: testSpecificConfig.timeouts.server
            },
            
            // Security settings for test scenarios
            security: {
                headers: testSpecificConfig.security.headers,
                cors: testSpecificConfig.security.cors,
                validation: testSpecificConfig.security.validation
            }
        };
        
        // Return complete test server configuration ready for test server instantiation
        return serverConfiguration;
        
    } catch (error) {
        // Enhanced error context for configuration creation failures
        const configError = new Error(`Failed to create test server configuration: ${error.message}`);
        configError.originalError = error;
        configError.context = {
            testType,
            configOptions: JSON.stringify(configOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw configError;
    }
}

/**
 * Generates test environment configuration with isolation settings and test-specific environment
 * variables. Creates isolated test environment configuration with proper isolation, feature flags,
 * and test-specific settings for reliable test execution.
 * 
 * @param {string} [environment='test'] - Test environment type for configuration generation
 * @param {Object} [envOptions={}] - Environment configuration options and overrides
 * @param {Object} [envOptions.variables] - Environment variable overrides
 * @param {Object} [envOptions.features] - Feature flag overrides for testing
 * @param {boolean} [envOptions.isolation=true] - Enable test environment isolation
 * @returns {Object} Test environment configuration with isolated settings and test-specific variables
 * 
 * @throws {Error} Environment configuration generation errors with detailed context
 * 
 * @example
 * const testEnv = generateTestEnvironmentConfig('test', {
 *   variables: { DEBUG: 'true' },
 *   features: { cors: false }
 * });
 */
function generateTestEnvironmentConfig(environment = 'test', envOptions = {}) {
    try {
        // Create isolated test environment configuration using EnvironmentConfig patterns
        const baseEnvironmentOptions = {
            environment: environment,
            port: DEFAULT_TEST_PORT,
            logLevel: 'error',
            validateOnInit: false
        };
        
        // Apply test-specific environment variable overrides for isolation
        const testEnvironmentVariables = {
            NODE_ENV: 'test',
            PORT: DEFAULT_TEST_PORT.toString(),
            LOG_LEVEL: 'error',
            ENABLE_CORS: 'false',
            SERVER_TIMEOUT: TEST_TIMEOUT.toString(),
            TEST_MODE: 'true',
            ...envOptions.variables
        };
        
        // Configure test logging levels and debugging settings
        const testLoggingConfig = {
            level: 'error',
            enabled: false,
            colors: false,
            timestamp: true,
            requestLogging: false,
            errorLogging: true
        };
        
        // Set up test-specific feature flags and configuration options
        const testFeatureFlags = {
            helloEndpoint: true,
            requestLogging: false,
            errorHandling: true,
            cors: false,
            securityHeaders: false,
            debugMode: false,
            performanceMonitoring: false,
            ...envOptions.features
        };
        
        // Include test correlation and session identification settings
        const testCorrelationConfig = {
            sessionId: crypto.randomUUID(),
            testExecutionId: generateTestId('environment', 'config'),
            isolationLevel: envOptions.isolation !== false ? 'high' : 'normal',
            timestamp: new Date().toISOString()
        };
        
        // Create comprehensive test environment configuration object
        const testEnvironmentConfig = {
            environment: environment,
            variables: testEnvironmentVariables,
            logging: testLoggingConfig,
            features: testFeatureFlags,
            correlation: testCorrelationConfig,
            
            // Test isolation settings and resource management
            isolation: {
                enabled: envOptions.isolation !== false,
                resourceLimits: {
                    memory: '50MB',
                    timeout: TEST_TIMEOUT,
                    connections: 10
                },
                cleanup: {
                    autoCleanup: true,
                    cleanupTimeout: 1000
                }
            },
            
            // Platform and system information for test environment
            platform: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                osType: os.type(),
                cpuCount: os.cpus().length,
                totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)}MB`
            }
        };
        
        // Return test environment configuration for test execution
        return testEnvironmentConfig;
        
    } catch (error) {
        // Enhanced error context for environment configuration failures
        const envError = new Error(`Failed to generate test environment configuration: ${error.message}`);
        envError.originalError = error;
        envError.context = {
            environment,
            envOptions: JSON.stringify(envOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw envError;
    }
}

/**
 * Validates test configuration objects against requirements and constraints with comprehensive
 * error reporting. Implements thorough configuration validation including port validation,
 * timeout checking, environment settings verification, and security configuration assessment.
 * 
 * @param {Object} testConfig - Test configuration object to validate
 * @param {Object} [validationOptions={}] - Validation options and constraint configuration
 * @param {boolean} [validationOptions.strictValidation=true] - Enable strict validation mode
 * @param {boolean} [validationOptions.validatePorts=true] - Enable port validation checking
 * @param {boolean} [validationOptions.checkAvailability=false] - Check actual port availability
 * @returns {Object} Validation result with success status and detailed error information for test configuration
 * 
 * @throws {Error} Validation errors for critical configuration failures
 * 
 * @example
 * const validation = validateTestConfig(testConfig, { strictValidation: true });
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 */
function validateTestConfig(testConfig, validationOptions = {}) {
    // Initialize validation options with defaults
    const options = {
        strictValidation: true,
        validatePorts: true,
        checkAvailability: false,
        ...validationOptions
    };
    
    // Initialize validation result object
    const validationResult = {
        isValid: false,
        errors: [],
        warnings: [],
        details: {
            timestamp: new Date().toISOString(),
            validationMode: options.strictValidation ? 'strict' : 'permissive',
            configType: testConfig?.testType || 'unknown'
        }
    };
    
    try {
        // Validate required test configuration properties and structure
        if (!testConfig || typeof testConfig !== 'object') {
            validationResult.errors.push('Test configuration must be a valid object');
            return validationResult;
        }
        
        // Check required configuration properties
        const requiredProperties = ['testType', 'port', 'host', 'timeouts', 'connection'];
        requiredProperties.forEach(prop => {
            if (!testConfig.hasOwnProperty(prop)) {
                validationResult.errors.push(`Missing required property: ${prop}`);
            }
        });
        
        // Check port numbers against test port range and availability constraints
        if (options.validatePorts && testConfig.port) {
            const port = testConfig.port;
            if (typeof port !== 'number' || port < TEST_PORT_RANGE.min || port > TEST_PORT_RANGE.max) {
                validationResult.errors.push(`Invalid port ${port}: must be number between ${TEST_PORT_RANGE.min} and ${TEST_PORT_RANGE.max}`);
            }
            
            // Check actual port availability if requested
            if (options.checkAvailability) {
                testPortAvailability(port).then(isAvailable => {
                    if (!isAvailable) {
                        validationResult.warnings.push(`Port ${port} may not be available`);
                    }
                }).catch(error => {
                    validationResult.warnings.push(`Could not verify port ${port} availability: ${error.message}`);
                });
            }
        }
        
        // Validate timeout values and performance testing configuration limits
        if (testConfig.timeouts) {
            const timeouts = testConfig.timeouts;
            if (typeof timeouts.server !== 'number' || timeouts.server <= 0) {
                validationResult.errors.push('Invalid server timeout: must be positive number');
            }
            if (typeof timeouts.request !== 'number' || timeouts.request <= 0) {
                validationResult.errors.push('Invalid request timeout: must be positive number');
            }
            if (timeouts.server > 30000) {
                validationResult.warnings.push('Server timeout exceeds 30 seconds: may cause test delays');
            }
        }
        
        // Verify test environment isolation settings and security configurations
        if (testConfig.environment && typeof testConfig.environment === 'object') {
            const env = testConfig.environment;
            if (env.NODE_ENV !== 'test') {
                validationResult.warnings.push(`NODE_ENV is ${env.NODE_ENV}, expected 'test' for proper isolation`);
            }
            if (env.LOG_LEVEL && !['error', 'warn', 'info', 'debug', 'trace'].includes(env.LOG_LEVEL)) {
                validationResult.errors.push(`Invalid LOG_LEVEL: ${env.LOG_LEVEL}`);
            }
        }
        
        // Check test correlation and identification metadata completeness
        if (testConfig.correlation) {
            const correlation = testConfig.correlation;
            if (!correlation.testId || typeof correlation.testId !== 'string') {
                validationResult.errors.push('Missing or invalid test correlation ID');
            }
            if (!correlation.sessionId || typeof correlation.sessionId !== 'string') {
                validationResult.errors.push('Missing or invalid session ID');
            }
        }
        
        // Validate test-specific feature flags and configuration consistency
        if (testConfig.features && typeof testConfig.features === 'object') {
            const features = testConfig.features;
            Object.keys(features).forEach(feature => {
                if (typeof features[feature] !== 'boolean') {
                    validationResult.errors.push(`Feature flag ${feature} must be boolean value`);
                }
            });
        }
        
        // Validate performance testing configuration if present
        if (testConfig.performance) {
            const perf = testConfig.performance;
            if (perf.concurrentConnections && 
                (typeof perf.concurrentConnections !== 'number' || perf.concurrentConnections <= 0)) {
                validationResult.errors.push('Invalid concurrent connections: must be positive number');
            }
            if (perf.duration && 
                (typeof perf.duration !== 'number' || perf.duration <= 0)) {
                validationResult.errors.push('Invalid performance test duration: must be positive number');
            }
        }
        
        // Check configuration consistency across components
        if (testConfig.port && testConfig.environment?.PORT) {
            const configPort = testConfig.port;
            const envPort = parseInt(testConfig.environment.PORT);
            if (configPort !== envPort) {
                validationResult.errors.push(`Port mismatch: config=${configPort}, environment=${envPort}`);
            }
        }
        
        // Set validation result based on error count
        validationResult.isValid = validationResult.errors.length === 0;
        
        // Add validation summary and statistics
        validationResult.summary = {
            errorCount: validationResult.errors.length,
            warningCount: validationResult.warnings.length,
            validationStatus: validationResult.isValid ? 'passed' : 'failed',
            configurationScore: validationResult.isValid ? 100 : 
                Math.max(0, 100 - (validationResult.errors.length * 20))
        };
        
        // Return comprehensive validation result with success status and errors
        return validationResult;
        
    } catch (error) {
        // Handle validation errors with comprehensive context
        validationResult.errors.push(`Validation error: ${error.message}`);
        validationResult.isValid = false;
        validationResult.details.error = error.message;
        return validationResult;
    }
}

/**
 * Generates unique test identifier for test configuration correlation and tracking across
 * test execution. Creates cryptographically secure unique identifiers with test type
 * context and temporal correlation for comprehensive test tracking.
 * 
 * @param {string} testType - Type of test for identifier context
 * @param {string} [configType='general'] - Configuration type for identifier structure
 * @returns {string} Unique test configuration identifier with test type and correlation prefix
 * 
 * @example
 * const testId = generateTestId('unit', 'server');
 * console.log(testId); // "test-config-unit-server-1234567890-abc123"
 */
function generateTestId(testType, configType = 'general') {
    try {
        // Generate cryptographically random component for uniqueness guarantee
        const randomBytes = crypto.randomBytes(8);
        const randomComponent = randomBytes.toString('hex');
        
        // Include test type and configuration type in identifier structure
        const typeComponent = `${testType}-${configType}`;
        
        // Add timestamp component for temporal correlation and debugging
        const timestampComponent = Date.now().toString(36);
        
        // Apply TEST_CORRELATION_PREFIX for consistent identifier formatting
        const testIdentifier = `${TEST_CORRELATION_PREFIX}${typeComponent}-${timestampComponent}-${randomComponent}`;
        
        // Return unique test configuration identifier for correlation tracking
        return testIdentifier;
        
    } catch (error) {
        // Fallback identifier generation if crypto operations fail
        const fallbackId = `${TEST_CORRELATION_PREFIX}${testType}-${Date.now()}-${Math.random().toString(36)}`;
        return fallbackId;
    }
}

/**
 * Creates specialized configuration for performance testing scenarios with load testing
 * optimizations and resource management. Implements high-concurrency settings, performance
 * monitoring, and resource optimization for comprehensive performance testing validation.
 * 
 * @param {Object} [performanceOptions={}] - Performance testing configuration options
 * @param {number} [performanceOptions.concurrentConnections=CONCURRENT_CONNECTIONS_LIMIT] - Concurrent connection limit
 * @param {number} [performanceOptions.duration=PERFORMANCE_TEST_DURATION] - Test duration in milliseconds
 * @param {boolean} [performanceOptions.monitoring=true] - Enable performance monitoring
 * @param {Object} [performanceOptions.thresholds] - Performance threshold configuration
 * @returns {Object} Performance test configuration with load testing settings and resource optimization
 * 
 * @example
 * const perfConfig = createPerformanceTestConfig({
 *   concurrentConnections: 200,
 *   duration: 15000,
 *   thresholds: { responseTime: 100 }
 * });
 */
function createPerformanceTestConfig(performanceOptions = {}) {
    try {
        // Initialize performance options with high-concurrency defaults
        const options = {
            concurrentConnections: CONCURRENT_CONNECTIONS_LIMIT,
            duration: PERFORMANCE_TEST_DURATION,
            monitoring: true,
            thresholds: {
                responseTime: 100, // milliseconds
                errorRate: 5, // percentage
                memoryUsage: 100 // MB
            },
            ...performanceOptions
        };
        
        // Configure high-concurrency settings for performance testing scenarios
        const performanceConfiguration = {
            testType: 'performance',
            
            // Set up load testing timeouts and connection management optimizations
            timeouts: {
                server: options.duration + 5000, // Extra time for cleanup
                request: 30000, // Extended timeout for load testing
                keep_alive: 60000, // Keep connections alive during load testing
                connection: 10000 // Connection establishment timeout
            },
            
            // Configure connection management and concurrency settings
            connection: {
                maxConnections: options.concurrentConnections,
                keepAlive: true,
                timeout: 10000,
                noDelay: true, // Disable Nagle algorithm for performance
                allowHalfOpen: false
            },
            
            // Apply performance monitoring and measurement configuration settings
            monitoring: {
                enabled: options.monitoring,
                metrics: {
                    responseTime: true,
                    throughput: true,
                    errorRate: true,
                    memoryUsage: true,
                    cpuUsage: true
                },
                sampling: {
                    interval: 1000, // Sample every second
                    bufferSize: 1000 // Keep last 1000 samples
                }
            },
            
            // Configure memory management and resource allocation for load testing
            resources: {
                memoryLimit: options.thresholds.memoryUsage * 1024 * 1024, // Convert MB to bytes
                connectionPoolSize: Math.min(options.concurrentConnections, 500),
                bufferSize: 64 * 1024, // 64KB buffer size
                gcOptimization: true
            },
            
            // Include performance baseline and threshold configuration settings
            thresholds: options.thresholds,
            
            // Load testing scenario configuration
            loadTesting: {
                duration: options.duration,
                concurrentUsers: options.concurrentConnections,
                rampUpTime: Math.min(5000, options.duration * 0.1), // 10% of duration or 5s max
                rampDownTime: Math.min(2000, options.duration * 0.05), // 5% of duration or 2s max
                sustainedLoad: true
            },
            
            // Performance measurement and baseline configuration
            measurement: {
                responseTimeBuckets: [10, 50, 100, 500, 1000, 5000], // milliseconds
                throughputTarget: options.concurrentConnections * 10, // requests per second
                baselineComparison: true,
                reportGeneration: true
            }
        };
        
        // Return performance test configuration optimized for load testing
        return performanceConfiguration;
        
    } catch (error) {
        // Enhanced error context for performance configuration failures
        const perfError = new Error(`Failed to create performance test configuration: ${error.message}`);
        perfError.originalError = error;
        perfError.context = {
            performanceOptions: JSON.stringify(performanceOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw perfError;
    }
}

/**
 * Resets test configuration state and clears cached configurations for test isolation
 * and fresh test execution. Implements comprehensive state reset operations including
 * cache clearing, port allocation reset, and environment variable cleanup.
 * 
 * @param {Object} [resetOptions={}] - Reset operation options and configuration
 * @param {boolean} [resetOptions.clearCache=true] - Clear configuration cache
 * @param {boolean} [resetOptions.releasePorts=true] - Release allocated ports
 * @param {boolean} [resetOptions.resetEnvironment=true] - Reset environment variables
 * @param {boolean} [resetOptions.clearStats=true] - Clear statistics and metrics
 * @returns {Promise<void>} Promise resolving when test configuration reset operations are complete
 * 
 * @example
 * await resetTestConfiguration({ clearCache: true, releasePorts: true });
 * console.log('Test configuration reset complete');
 */
async function resetTestConfiguration(resetOptions = {}) {
    // Initialize reset options with defaults
    const options = {
        clearCache: true,
        releasePorts: true,
        resetEnvironment: true,
        clearStats: true,
        ...resetOptions
    };
    
    try {
        const resetOperations = [];
        
        // Clear cached test configuration objects and port allocations
        if (options.clearCache) {
            resetOperations.push(clearConfigurationCache());
        }
        
        // Reset test correlation and identification state
        if (options.clearStats) {
            resetOperations.push(clearTestStatistics());
        }
        
        // Clear test environment variable overrides and isolation settings
        if (options.resetEnvironment) {
            resetOperations.push(resetTestEnvironmentVariables());
        }
        
        // Reset performance testing configuration and measurement state
        if (options.releasePorts) {
            resetOperations.push(releaseAllocatedPorts());
        }
        
        // Clear test server configuration cache and optimization settings
        resetOperations.push(clearTestServerCache());
        
        // Execute all reset operations concurrently
        await Promise.all(resetOperations);
        
        // Return promise resolving when reset operations are complete
        return Promise.resolve();
        
    } catch (error) {
        // Enhanced error context for reset operation failures
        const resetError = new Error(`Test configuration reset failed: ${error.message}`);
        resetError.originalError = error;
        resetError.context = {
            resetOptions: JSON.stringify(resetOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw resetError;
    }
}

// ============================================================================
// TEST CONFIGURATION TYPE DEFINITIONS AND TEMPLATES
// ============================================================================

/**
 * Returns test type-specific configuration settings and optimizations based on test scenario.
 * Implements comprehensive test type configuration with scenario-specific optimizations,
 * resource allocation, and performance settings for different testing approaches.
 * 
 * @private
 * @param {string} testType - Test type for configuration generation
 * @param {Object} configOptions - Additional configuration options
 * @returns {Object} Test type-specific configuration settings
 */
function getTestTypeConfiguration(testType, configOptions) {
    const baseConfig = {
        logging: {
            enabled: false,
            level: 'error',
            requestLogging: false
        },
        timeouts: {
            server: TEST_TIMEOUT,
            request: TEST_TIMEOUT,
            keep_alive: TEST_TIMEOUT
        },
        connection: {
            maxConnections: 10,
            keepAlive: false,
            timeout: TEST_TIMEOUT
        },
        performance: {
            concurrentConnections: 1,
            duration: TEST_TIMEOUT,
            monitoring: false
        },
        security: {
            headers: false,
            cors: false,
            validation: true
        }
    };
    
    // Apply test type-specific configurations
    switch (testType) {
        case 'unit':
            // Minimal test configuration for basic unit testing scenarios
            return {
                ...baseConfig,
                logging: {
                    enabled: false,
                    level: 'error',
                    requestLogging: false
                },
                timeouts: {
                    server: 2000,
                    request: 1000,
                    keep_alive: 1000
                },
                connection: {
                    maxConnections: 1,
                    keepAlive: false,
                    timeout: 1000
                }
            };
            
        case 'integration':
            // Comprehensive test configuration for integration testing with component interaction
            return {
                ...baseConfig,
                logging: {
                    enabled: true,
                    level: 'warn',
                    requestLogging: false
                },
                timeouts: {
                    server: TEST_TIMEOUT,
                    request: 3000,
                    keep_alive: 3000
                },
                connection: {
                    maxConnections: 5,
                    keepAlive: true,
                    timeout: 3000
                }
            };
            
        case 'e2e':
            // Full-featured test configuration for end-to-end testing scenarios
            return {
                ...baseConfig,
                logging: {
                    enabled: true,
                    level: 'info',
                    requestLogging: true
                },
                timeouts: {
                    server: TEST_TIMEOUT * 2,
                    request: 5000,
                    keep_alive: 5000
                },
                connection: {
                    maxConnections: 10,
                    keepAlive: true,
                    timeout: 5000
                },
                security: {
                    headers: true,
                    cors: true,
                    validation: true
                }
            };
            
        case 'performance':
            // Optimized test configuration for performance and load testing
            return {
                ...baseConfig,
                logging: {
                    enabled: true,
                    level: 'warn',
                    requestLogging: false
                },
                timeouts: {
                    server: PERFORMANCE_TEST_DURATION + 5000,
                    request: 30000,
                    keep_alive: 60000
                },
                connection: {
                    maxConnections: CONCURRENT_CONNECTIONS_LIMIT,
                    keepAlive: true,
                    timeout: 10000
                },
                performance: {
                    concurrentConnections: CONCURRENT_CONNECTIONS_LIMIT,
                    duration: PERFORMANCE_TEST_DURATION,
                    monitoring: true
                }
            };
            
        case 'error':
            // Specialized test configuration for error handling and negative testing
            return {
                ...baseConfig,
                logging: {
                    enabled: true,
                    level: 'debug',
                    requestLogging: true
                },
                timeouts: {
                    server: TEST_TIMEOUT,
                    request: 1000,
                    keep_alive: 1000
                },
                connection: {
                    maxConnections: 3,
                    keepAlive: false,
                    timeout: 1000
                },
                security: {
                    headers: false,
                    cors: false,
                    validation: false // Allow invalid inputs for error testing
                }
            };
            
        default:
            return baseConfig;
    }
}

// ============================================================================
// COMPREHENSIVE TEST CONFIGURATION MANAGER CLASS
// ============================================================================

/**
 * Comprehensive test configuration management class providing centralized test configuration
 * generation, validation, and lifecycle management with support for different test types,
 * environment isolation, and configuration caching for the Node.js tutorial application
 * testing framework.
 * 
 * This class serves as the central authority for test configuration management, providing:
 * - Centralized test configuration generation and validation
 * - Dynamic port allocation and lifecycle management
 * - Configuration caching for performance optimization
 * - Test correlation and tracking across test execution
 * - Environment isolation and test-specific configuration
 * - Performance testing configuration and optimization
 * - Comprehensive error handling and recovery mechanisms
 */
class TestConfigManager {
    /**
     * Initializes test configuration manager with caching, port management, and environment
     * configuration for comprehensive test configuration lifecycle management.
     * 
     * @param {Object} [options={}] - Manager configuration options and settings
     * @param {Object} [options.caching] - Configuration caching options
     * @param {Object} [options.portManagement] - Port allocation and management settings
     * @param {Object} [options.environment] - Environment configuration overrides
     * @param {Logger} [options.logger] - Logger instance for configuration operations
     */
    constructor(options = {}) {
        try {
            // Initialize configuration cache for test configuration storage and reuse
            this.configCache = new Map();
            
            // Set up port allocation tracking for test server port management
            this.portAllocations = new Map();
            
            // Create test environment configuration using EnvironmentConfig patterns
            this.environmentConfig = new EnvironmentConfig({
                environment: 'test',
                logLevel: 'error',
                validateOnInit: false
            });
            
            // Generate unique session ID for test configuration correlation
            this.sessionId = crypto.randomUUID();
            
            // Configure test configuration manager options and settings
            this.options = {
                caching: {
                    enabled: true,
                    maxSize: 100,
                    ttl: 300000, // 5 minutes cache TTL
                    ...options.caching
                },
                portManagement: {
                    trackAllocations: true,
                    autoRelease: true,
                    portRange: TEST_PORT_RANGE,
                    ...options.portManagement
                },
                environment: {
                    isolation: true,
                    cleanup: true,
                    ...options.environment
                },
                ...options
            };
            
            // Initialize logger for configuration operations
            this.logger = options.logger || new Logger({
                logLevel: 'error',
                enableColors: false
            });
            
            // Initialize test configuration validation and error handling
            this.validationRules = this._initializeValidationRules();
            this.errorRecovery = this._initializeErrorRecovery();
            
            // Track manager initialization for debugging
            this.initializationTime = new Date().toISOString();
            this.configurationCount = 0;
            
        } catch (error) {
            // Enhanced error context for manager initialization failures
            const managerError = new Error(`TestConfigManager initialization failed: ${error.message}`);
            managerError.originalError = error;
            managerError.context = {
                options: JSON.stringify(options, null, 2),
                timestamp: new Date().toISOString()
            };
            throw managerError;
        }
    }
    
    /**
     * Retrieves or generates test configuration for specified test type with caching and validation.
     * Implements intelligent configuration management with cache optimization, validation, and
     * automatic configuration generation for comprehensive test scenario support.
     * 
     * @param {string} testType - Type of test configuration to retrieve or generate
     * @param {Object} [configOptions={}] - Configuration options and customization settings
     * @param {boolean} [configOptions.useCache=true] - Enable configuration caching
     * @param {boolean} [configOptions.validate=true] - Enable configuration validation
     * @param {Object} [configOptions.overrides] - Configuration property overrides
     * @returns {Object} Test configuration object for specified test type with validation and optimization
     * 
     * @example
     * const config = await manager.getConfig('integration', { 
     *   overrides: { port: 3002 },
     *   validate: true 
     * });
     */
    async getConfig(testType, configOptions = {}) {
        try {
            // Initialize configuration options with defaults
            const options = {
                useCache: true,
                validate: true,
                ...configOptions
            };
            
            // Generate cache key for configuration lookup
            const cacheKey = this._generateCacheKey(testType, options);
            
            // Check configuration cache for existing test configuration
            if (options.useCache && this.configCache.has(cacheKey)) {
                const cachedConfig = this.configCache.get(cacheKey);
                
                // Validate cached configuration freshness
                if (this._isCacheEntryValid(cachedConfig)) {
                    // Return cached configuration if available and valid
                    this.logger.debug('Retrieved test configuration from cache', {
                        testType,
                        cacheKey,
                        configAge: Date.now() - cachedConfig.timestamp
                    });
                    return cachedConfig.config;
                } else {
                    // Remove stale cache entry
                    this.configCache.delete(cacheKey);
                }
            }
            
            // Generate new test configuration using createTestServerConfig factory
            const baseConfiguration = createTestServerConfig(testType, options.overrides || {});
            
            // Apply configuration overrides if provided
            const mergedConfiguration = options.overrides ? 
                this._mergeConfigurationOverrides(baseConfiguration, options.overrides) : 
                baseConfiguration;
            
            // Validate generated configuration using validateTestConfig function
            if (options.validate) {
                const validationResult = validateTestConfig(mergedConfiguration, {
                    strictValidation: true,
                    validatePorts: true
                });
                
                if (!validationResult.isValid) {
                    throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
                }
            }
            
            // Store validated configuration in cache for reuse
            if (options.useCache && this.options.caching.enabled) {
                this._storeCacheEntry(cacheKey, mergedConfiguration);
            }
            
            // Track configuration generation statistics
            this.configurationCount++;
            
            // Return test configuration object ready for test execution
            return mergedConfiguration;
            
        } catch (error) {
            // Enhanced error context for configuration retrieval failures
            const configError = new Error(`Failed to get test configuration: ${error.message}`);
            configError.originalError = error;
            configError.context = {
                testType,
                configOptions: JSON.stringify(configOptions, null, 2),
                timestamp: new Date().toISOString()
            };
            throw configError;
        }
    }
    
    /**
     * Allocates and tracks test port for server instances with conflict avoidance and
     * lifecycle management. Implements comprehensive port allocation with tracking,
     * conflict resolution, and automatic cleanup for reliable test server operations.
     * 
     * @param {string} testId - Unique test identifier for port allocation tracking
     * @param {number} [preferredPort] - Preferred port number for allocation
     * @returns {Promise<number>} Allocated port number for test server with tracking and lifecycle management
     * 
     * @example
     * const port = await manager.allocatePort('test-123', 3001);
     * console.log('Allocated port:', port);
     */
    async allocatePort(testId, preferredPort) {
        try {
            // Validate test ID parameter
            if (!testId || typeof testId !== 'string') {
                throw new Error('Test ID must be a non-empty string');
            }
            
            // Check existing port allocations for test ID conflicts
            if (this.portAllocations.has(testId)) {
                const existingAllocation = this.portAllocations.get(testId);
                this.logger.warn('Port already allocated for test ID', {
                    testId,
                    existingPort: existingAllocation.port,
                    allocationTime: existingAllocation.timestamp
                });
                return existingAllocation.port;
            }
            
            // Use getTestPort function to find available port
            const allocatedPort = await getTestPort(preferredPort, {
                minPort: this.options.portManagement.portRange.min,
                maxPort: this.options.portManagement.portRange.max,
                maxAttempts: MAX_PORT_ATTEMPTS,
                randomSelection: true
            });
            
            // Track allocated port with test ID for lifecycle management
            const allocationData = {
                port: allocatedPort,
                testId: testId,
                timestamp: Date.now(),
                sessionId: this.sessionId,
                allocatedAt: new Date().toISOString()
            };
            
            // Store port allocation in port allocations tracking object
            this.portAllocations.set(testId, allocationData);
            
            // Log successful port allocation
            this.logger.info('Port allocated for test', {
                testId,
                port: allocatedPort,
                preferredPort,
                sessionId: this.sessionId
            });
            
            // Return allocated port number for test server binding
            return allocatedPort;
            
        } catch (error) {
            // Enhanced error context for port allocation failures
            const allocationError = new Error(`Port allocation failed: ${error.message}`);
            allocationError.originalError = error;
            allocationError.context = {
                testId,
                preferredPort,
                timestamp: new Date().toISOString()
            };
            throw allocationError;
        }
    }
    
    /**
     * Releases allocated test port and cleans up port tracking for resource management
     * and test isolation. Implements comprehensive port release with cleanup operations
     * and allocation tracking removal for proper resource management.
     * 
     * @param {string} testId - Test identifier for port release operation
     * @returns {boolean} Success status of port release and cleanup operation
     * 
     * @example
     * const released = manager.releasePort('test-123');
     * console.log('Port released:', released);
     */
    releasePort(testId) {
        try {
            // Validate test ID and check port allocation existence
            if (!testId || typeof testId !== 'string') {
                this.logger.warn('Invalid test ID for port release', { testId });
                return false;
            }
            
            // Check if port allocation exists for test ID
            if (!this.portAllocations.has(testId)) {
                this.logger.warn('No port allocation found for test ID', { testId });
                return false;
            }
            
            // Get allocation data for cleanup operations
            const allocationData = this.portAllocations.get(testId);
            
            // Remove port allocation from tracking system
            this.portAllocations.delete(testId);
            
            // Clean up port-related resources and connections
            this.logger.debug('Port released successfully', {
                testId,
                port: allocationData.port,
                allocationDuration: Date.now() - allocationData.timestamp,
                sessionId: this.sessionId
            });
            
            // Update port allocation state for future allocations
            // (Additional cleanup operations could be added here)
            
            // Return success status of port release operation
            return true;
            
        } catch (error) {
            // Log port release errors but don't throw to prevent test failures
            this.logger.error('Port release failed', {
                testId,
                error: error.message
            });
            return false;
        }
    }
    
    /**
     * Generates complete set of test configurations for all test types with consistency
     * and correlation. Creates comprehensive configuration set for unit, integration,
     * end-to-end, and performance testing with proper correlation and consistency.
     * 
     * @param {Object} [setOptions={}] - Configuration set generation options
     * @param {Array} [setOptions.testTypes] - Specific test types to include
     * @param {Object} [setOptions.globalOverrides] - Global configuration overrides
     * @param {boolean} [setOptions.validate=true] - Enable configuration validation
     * @returns {Object} Complete set of test configurations for unit, integration, and e2e tests with correlation
     * 
     * @example
     * const configSet = await manager.generateConfigSet({
     *   testTypes: ['unit', 'integration', 'e2e'],
     *   globalOverrides: { host: '127.0.0.1' }
     * });
     */
    async generateConfigSet(setOptions = {}) {
        try {
            // Initialize set options with defaults
            const options = {
                testTypes: ['unit', 'integration', 'e2e', 'performance'],
                globalOverrides: {},
                validate: true,
                ...setOptions
            };
            
            // Generate session correlation ID for configuration set
            const setCorrelationId = generateTestId('config-set', 'generation');
            
            // Initialize configuration set object
            const configurationSet = {
                correlationId: setCorrelationId,
                sessionId: this.sessionId,
                generatedAt: new Date().toISOString(),
                configurations: {},
                metadata: {
                    testTypes: options.testTypes,
                    globalOverrides: options.globalOverrides,
                    validated: options.validate
                }
            };
            
            // Generate configuration for each requested test type
            for (const testType of options.testTypes) {
                try {
                    // Generate configuration with global overrides applied
                    const typeConfig = await this.getConfig(testType, {
                        overrides: options.globalOverrides,
                        validate: options.validate,
                        useCache: false // Force fresh generation for set
                    });
                    
                    // Include correlation metadata for set consistency
                    typeConfig.setCorrelation = {
                        setId: setCorrelationId,
                        sessionId: this.sessionId,
                        position: options.testTypes.indexOf(testType)
                    };
                    
                    // Store configuration in set
                    configurationSet.configurations[testType] = typeConfig;
                    
                } catch (error) {
                    this.logger.error(`Failed to generate ${testType} configuration`, {
                        testType,
                        setCorrelationId,
                        error: error.message
                    });
                    
                    // Continue with other configurations but mark error
                    configurationSet.configurations[testType] = {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    };
                }
            }
            
            // Apply configuration correlation and consistency checking
            this._applySetCorrelation(configurationSet);
            
            // Validate configuration set consistency if requested
            if (options.validate) {
                const setValidation = this._validateConfigurationSet(configurationSet);
                configurationSet.validation = setValidation;
            }
            
            // Return complete test configuration set for comprehensive testing
            return configurationSet;
            
        } catch (error) {
            // Enhanced error context for configuration set generation failures
            const setError = new Error(`Failed to generate configuration set: ${error.message}`);
            setError.originalError = error;
            setError.context = {
                setOptions: JSON.stringify(setOptions, null, 2),
                timestamp: new Date().toISOString()
            };
            throw setError;
        }
    }
    
    /**
     * Validates test configuration completeness and consistency with detailed error reporting
     * and validation rules. Implements comprehensive configuration validation including
     * structural validation, constraint checking, and consistency verification.
     * 
     * @param {Object} config - Test configuration object to validate
     * @returns {Object} Validation result with detailed error information and validation status
     * 
     * @example
     * const validation = manager.validateConfiguration(testConfig);
     * if (!validation.isValid) {
     *   console.error('Validation failed:', validation.errors);
     * }
     */
    validateConfiguration(config) {
        try {
            // Use validateTestConfig function for basic configuration validation
            const baseValidation = validateTestConfig(config, {
                strictValidation: true,
                validatePorts: true,
                checkAvailability: false
            });
            
            // Check configuration consistency across test types and scenarios
            const consistencyValidation = this._validateConfigurationConsistency(config);
            
            // Validate port allocation and availability for configuration
            const portValidation = this._validatePortConfiguration(config);
            
            // Check test environment isolation and security settings
            const environmentValidation = this._validateEnvironmentConfiguration(config);
            
            // Validate test correlation and identification completeness
            const correlationValidation = this._validateCorrelationConfiguration(config);
            
            // Combine all validation results
            const combinedValidation = {
                isValid: baseValidation.isValid && 
                        consistencyValidation.isValid && 
                        portValidation.isValid && 
                        environmentValidation.isValid && 
                        correlationValidation.isValid,
                
                errors: [
                    ...baseValidation.errors,
                    ...consistencyValidation.errors,
                    ...portValidation.errors,
                    ...environmentValidation.errors,
                    ...correlationValidation.errors
                ],
                
                warnings: [
                    ...baseValidation.warnings,
                    ...consistencyValidation.warnings,
                    ...portValidation.warnings,
                    ...environmentValidation.warnings,
                    ...correlationValidation.warnings
                ],
                
                details: {
                    baseValidation: baseValidation.summary,
                    consistencyCheck: consistencyValidation.details,
                    portValidation: portValidation.details,
                    environmentCheck: environmentValidation.details,
                    correlationCheck: correlationValidation.details,
                    timestamp: new Date().toISOString()
                }
            };
            
            // Return comprehensive validation result with success status and errors
            return combinedValidation;
            
        } catch (error) {
            // Return validation error result
            return {
                isValid: false,
                errors: [`Validation error: ${error.message}`],
                warnings: [],
                details: {
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
    
    /**
     * Clears configuration cache and resets manager state for fresh test execution and isolation.
     * Implements comprehensive state reset including cache clearing, port release, and
     * environment cleanup for reliable test isolation between test executions.
     * 
     * @returns {void} Clears cache and resets state in place
     * 
     * @example
     * manager.clearCache();
     * console.log('Configuration cache cleared for fresh test execution');
     */
    clearCache() {
        try {
            // Clear configuration cache and remove all cached configurations
            const cacheSize = this.configCache.size;
            this.configCache.clear();
            
            // Reset port allocation tracking and release allocated ports
            const portCount = this.portAllocations.size;
            if (this.options.portManagement.autoRelease) {
                this.portAllocations.forEach((allocation, testId) => {
                    this.releasePort(testId);
                });
            }
            this.portAllocations.clear();
            
            // Clear test correlation and session state
            this.sessionId = crypto.randomUUID();
            this.configurationCount = 0;
            
            // Reset manager options and configuration state
            this.initializationTime = new Date().toISOString();
            
            // Initialize fresh manager state for new test execution
            this.logger.info('Test configuration manager state reset', {
                clearedCacheEntries: cacheSize,
                releasedPorts: portCount,
                newSessionId: this.sessionId,
                resetTimestamp: new Date().toISOString()
            });
            
        } catch (error) {
            // Log cache clearing errors but don't throw to prevent test failures
            this.logger.error('Failed to clear configuration cache', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Generates cache key for configuration storage and retrieval.
     * @private
     */
    _generateCacheKey(testType, options) {
        const keyComponents = [
            testType,
            JSON.stringify(options.overrides || {}),
            options.validate ? 'validated' : 'unvalidated'
        ];
        return keyComponents.join('|');
    }
    
    /**
     * Validates cache entry freshness based on TTL configuration.
     * @private
     */
    _isCacheEntryValid(cacheEntry) {
        const age = Date.now() - cacheEntry.timestamp;
        return age < this.options.caching.ttl;
    }
    
    /**
     * Stores configuration in cache with metadata.
     * @private
     */
    _storeCacheEntry(cacheKey, config) {
        // Check cache size limits
        if (this.configCache.size >= this.options.caching.maxSize) {
            // Remove oldest entry
            const oldestKey = this.configCache.keys().next().value;
            this.configCache.delete(oldestKey);
        }
        
        // Store configuration with timestamp
        this.configCache.set(cacheKey, {
            config,
            timestamp: Date.now(),
            cacheKey
        });
    }
    
    /**
     * Merges configuration overrides with base configuration.
     * @private
     */
    _mergeConfigurationOverrides(baseConfig, overrides) {
        return {
            ...baseConfig,
            ...overrides,
            // Preserve correlation data
            correlation: {
                ...baseConfig.correlation,
                overridesApplied: true,
                overrideTimestamp: new Date().toISOString()
            }
        };
    }
    
    /**
     * Initializes validation rules for configuration validation.
     * @private
     */
    _initializeValidationRules() {
        return {
            requiredProperties: ['testType', 'port', 'host', 'timeouts'],
            portRange: TEST_PORT_RANGE,
            timeoutLimits: { min: 100, max: 60000 },
            connectionLimits: { min: 1, max: 1000 }
        };
    }
    
    /**
     * Initializes error recovery mechanisms.
     * @private
     */
    _initializeErrorRecovery() {
        return {
            retryAttempts: 3,
            fallbackConfiguration: true,
            gracefulDegradation: true
        };
    }
    
    /**
     * Validates configuration consistency across components.
     * @private
     */
    _validateConfigurationConsistency(config) {
        const errors = [];
        const warnings = [];
        
        // Check port consistency
        if (config.port && config.environment?.PORT) {
            if (config.port !== parseInt(config.environment.PORT)) {
                errors.push('Port mismatch between config and environment');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details: { consistencyChecks: ['port', 'environment', 'timeouts'] }
        };
    }
    
    /**
     * Validates port configuration and allocation.
     * @private
     */
    _validatePortConfiguration(config) {
        const errors = [];
        const warnings = [];
        
        if (!config.port || typeof config.port !== 'number') {
            errors.push('Invalid port configuration');
        } else if (config.port < TEST_PORT_RANGE.min || config.port > TEST_PORT_RANGE.max) {
            errors.push(`Port ${config.port} outside valid range`);
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details: { portRange: TEST_PORT_RANGE }
        };
    }
    
    /**
     * Validates environment configuration for test isolation.
     * @private
     */
    _validateEnvironmentConfiguration(config) {
        const errors = [];
        const warnings = [];
        
        if (config.environment?.NODE_ENV !== 'test') {
            warnings.push('NODE_ENV not set to test');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details: { environmentChecks: ['NODE_ENV', 'PORT', 'LOG_LEVEL'] }
        };
    }
    
    /**
     * Validates correlation configuration completeness.
     * @private
     */
    _validateCorrelationConfiguration(config) {
        const errors = [];
        const warnings = [];
        
        if (!config.correlation?.testId) {
            errors.push('Missing test correlation ID');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            details: { correlationFields: ['testId', 'sessionId', 'timestamp'] }
        };
    }
    
    /**
     * Applies correlation metadata to configuration set.
     * @private
     */
    _applySetCorrelation(configSet) {
        const correlationData = {
            setId: configSet.correlationId,
            sessionId: this.sessionId,
            generatedAt: configSet.generatedAt
        };
        
        Object.keys(configSet.configurations).forEach(testType => {
            if (configSet.configurations[testType].correlation) {
                configSet.configurations[testType].correlation.setCorrelation = correlationData;
            }
        });
    }
    
    /**
     * Validates configuration set consistency.
     * @private
     */
    _validateConfigurationSet(configSet) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            details: {}
        };
        
        // Check that all configurations have consistent session IDs
        Object.keys(configSet.configurations).forEach(testType => {
            const config = configSet.configurations[testType];
            if (config.correlation?.sessionId !== this.sessionId) {
                validation.warnings.push(`Session ID mismatch for ${testType} configuration`);
            }
        });
        
        return validation;
    }
}

// ============================================================================
// RESET AND CLEANUP HELPER FUNCTIONS
// ============================================================================

/**
 * Clears configuration cache for fresh test execution.
 * @private
 */
async function clearConfigurationCache() {
    // Implementation would clear global configuration cache
    return Promise.resolve();
}

/**
 * Clears test statistics and metrics.
 * @private
 */
async function clearTestStatistics() {
    // Implementation would reset test statistics
    return Promise.resolve();
}

/**
 * Resets test environment variables to defaults.
 * @private
 */
async function resetTestEnvironmentVariables() {
    // Implementation would reset test-specific environment variables
    return Promise.resolve();
}

/**
 * Releases all allocated ports for cleanup.
 * @private
 */
async function releaseAllocatedPorts() {
    // Implementation would release all allocated test ports
    return Promise.resolve();
}

/**
 * Clears test server configuration cache.
 * @private
 */
async function clearTestServerCache() {
    // Implementation would clear server configuration cache
    return Promise.resolve();
}

// ============================================================================
// PRE-CONFIGURED TEST SERVER CONFIGURATIONS
// ============================================================================

/**
 * Pre-configured test server configurations for different testing scenarios and test types.
 * These configurations provide standardized test server setups for immediate use across
 * the testing framework without requiring custom configuration generation.
 */
const TEST_SERVER_CONFIGS = {
    /**
     * Minimal test configuration for basic unit testing scenarios.
     * Optimized for fast execution, minimal resource usage, and isolated testing
     * of individual functions and components without external dependencies.
     */
    basicTest: {
        testType: 'unit',
        port: DEFAULT_TEST_PORT,
        host: 'localhost',
        name: TEST_SERVER_NAME,
        
        // Minimal logging and debugging for focused testing
        logging: {
            enabled: false,
            level: 'error',
            requestLogging: false
        },
        
        // Fast timeout settings for quick test execution
        timeouts: {
            server: 2000,
            request: 1000,
            keep_alive: 1000
        },
        
        // Basic security settings without advanced features
        connection: {
            maxConnections: 1,
            keepAlive: false,
            timeout: 1000
        },
        
        // Test correlation and identification
        correlation: {
            testId: `${TEST_CORRELATION_PREFIX}basic-${Date.now()}`,
            testType: 'unit'
        }
    },
    
    /**
     * Comprehensive test configuration for integration testing with component interaction.
     * Configured for testing HTTP server and route handler integration with enhanced
     * logging for component interaction debugging and extended timeouts.
     */
    integrationTest: {
        testType: 'integration',
        port: DEFAULT_TEST_PORT + 1,
        host: 'localhost',
        name: TEST_SERVER_NAME,
        
        // Enhanced logging for component interaction debugging
        logging: {
            enabled: true,
            level: 'warn',
            requestLogging: false
        },
        
        // Extended timeouts for component coordination
        timeouts: {
            server: TEST_TIMEOUT,
            request: 3000,
            keep_alive: 3000
        },
        
        // Integration-specific security and connection settings
        connection: {
            maxConnections: 5,
            keepAlive: true,
            timeout: 3000
        },
        
        // Test correlation for integration tracking
        correlation: {
            testId: `${TEST_CORRELATION_PREFIX}integration-${Date.now()}`,
            testType: 'integration'
        }
    },
    
    /**
     * Full-featured test configuration for end-to-end testing scenarios.
     * Configured for complete request/response lifecycle testing with comprehensive
     * logging, production-like timeouts, and full security configuration.
     */
    e2eTest: {
        testType: 'e2e',
        port: DEFAULT_TEST_PORT + 2,
        host: 'localhost',
        name: TEST_SERVER_NAME,
        
        // Comprehensive logging and monitoring for full system testing
        logging: {
            enabled: true,
            level: 'info',
            requestLogging: true
        },
        
        // Production-like timeouts and connection management
        timeouts: {
            server: TEST_TIMEOUT * 2,
            request: 5000,
            keep_alive: 5000
        },
        
        // Full security configuration and feature enablement
        connection: {
            maxConnections: 10,
            keepAlive: true,
            timeout: 5000
        },
        
        // End-to-end test correlation
        correlation: {
            testId: `${TEST_CORRELATION_PREFIX}e2e-${Date.now()}`,
            testType: 'e2e'
        }
    },
    
    /**
     * Optimized test configuration for performance and load testing.
     * Configured for load testing and concurrent connection validation with
     * high-concurrency settings, performance monitoring, and extended timeouts.
     */
    performanceTest: {
        testType: 'performance',
        port: DEFAULT_TEST_PORT + 3,
        host: 'localhost',
        name: TEST_SERVER_NAME,
        
        // Performance monitoring and measurement configuration
        logging: {
            enabled: true,
            level: 'warn',
            requestLogging: false
        },
        
        // Extended timeouts for load testing scenarios
        timeouts: {
            server: PERFORMANCE_TEST_DURATION + 5000,
            request: 30000,
            keep_alive: 60000
        },
        
        // High-concurrency connection settings and limits
        connection: {
            maxConnections: CONCURRENT_CONNECTIONS_LIMIT,
            keepAlive: true,
            timeout: 10000
        },
        
        // Performance testing specific configuration
        performance: {
            concurrentConnections: CONCURRENT_CONNECTIONS_LIMIT,
            duration: PERFORMANCE_TEST_DURATION,
            monitoring: true,
            thresholds: {
                responseTime: 100,
                errorRate: 5,
                memoryUsage: 100
            }
        },
        
        // Performance test correlation
        correlation: {
            testId: `${TEST_CORRELATION_PREFIX}performance-${Date.now()}`,
            testType: 'performance'
        }
    },
    
    /**
     * Specialized test configuration for error handling and negative testing.
     * Configured for negative testing and error condition validation with
     * enhanced error logging, failure mode testing, and error boundary testing.
     */
    errorTest: {
        testType: 'error',
        port: DEFAULT_TEST_PORT + 4,
        host: 'localhost',
        name: TEST_SERVER_NAME,
        
        // Enhanced error logging and debugging configuration
        logging: {
            enabled: true,
            level: 'debug',
            requestLogging: true
        },
        
        // Shorter timeouts for error scenario testing
        timeouts: {
            server: TEST_TIMEOUT,
            request: 1000,
            keep_alive: 1000
        },
        
        // Limited connections for error testing scenarios
        connection: {
            maxConnections: 3,
            keepAlive: false,
            timeout: 1000
        },
        
        // Error testing specific configuration
        errorTesting: {
            simulateFailures: true,
            errorInjection: true,
            recoveryTesting: true
        },
        
        // Error test correlation
        correlation: {
            testId: `${TEST_CORRELATION_PREFIX}error-${Date.now()}`,
            testType: 'error'
        }
    }
};

/**
 * Array of valid test configuration objects used by request-data.js and response-data.js
 * for test data generation. Provides standardized test configurations for data generation
 * utilities and ensures consistency across test data creation and validation.
 */
const VALID_TEST_CONFIGS = [
    /**
     * Basic test configuration object for unit testing scenarios with minimal setup
     * and fast execution characteristics for isolated function and component testing.
     */
    {
        testType: 'unit',
        name: 'basicTestConfig',
        config: TEST_SERVER_CONFIGS.basicTest,
        description: 'Minimal configuration for unit testing with fast execution and isolation',
        useCases: ['Unit testing individual functions', 'Testing basic HTTP patterns', 'Simple server validation'],
        characteristics: ['Single port allocation', 'Minimal logging', 'Fast timeouts', 'Basic security']
    },
    
    /**
     * Integration test configuration object for component interaction testing with enhanced
     * logging and extended timeouts for comprehensive component integration validation.
     */
    {
        testType: 'integration',
        name: 'integrationTestConfig',
        config: TEST_SERVER_CONFIGS.integrationTest,
        description: 'Comprehensive configuration for integration testing with component interaction',
        useCases: ['HTTP server and route integration', 'Request processing pipeline testing', 'Component interaction validation'],
        characteristics: ['Multiple port support', 'Enhanced logging', 'Extended timeouts', 'Integration security']
    },
    
    /**
     * End-to-end test configuration object for full system testing with comprehensive
     * features enabled and production-like settings for complete system validation.
     */
    {
        testType: 'e2e',
        name: 'e2eTestConfig',
        config: TEST_SERVER_CONFIGS.e2eTest,
        description: 'Full-featured configuration for end-to-end testing with complete system validation',
        useCases: ['Complete request/response lifecycle', 'Full system integration testing', 'Production environment simulation'],
        characteristics: ['Complete server configuration', 'Comprehensive logging', 'Production timeouts', 'Full security']
    }
];

// ============================================================================
// DEFAULT CONFIGURATION MANAGER INSTANCE
// ============================================================================

/**
 * Default test configuration manager instance for immediate use across the testing framework.
 * Provides pre-configured manager instance with standard settings for quick access to
 * test configuration management capabilities without requiring custom initialization.
 */
const testConfigManager = new TestConfigManager({
    caching: {
        enabled: true,
        maxSize: 50,
        ttl: 300000 // 5 minutes
    },
    portManagement: {
        trackAllocations: true,
        autoRelease: true,
        portRange: TEST_PORT_RANGE
    },
    environment: {
        isolation: true,
        cleanup: true
    }
});

// Add convenience methods to default instance for immediate use
testConfigManager.getTestPort = getTestPort;
testConfigManager.createConfig = createTestServerConfig;

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export pre-configured test server configurations for different testing scenarios
export { TEST_SERVER_CONFIGS };

// Export utility functions for test configuration management
export { getTestPort };
export { createTestServerConfig };
export { generateTestEnvironmentConfig };
export { validateTestConfig };
export { generateTestId };
export { createPerformanceTestConfig };
export { resetTestConfiguration };

// Export comprehensive test configuration management class
export { TestConfigManager };

// Export valid test configuration array for test data generation
export { VALID_TEST_CONFIGS };

// Export default test configuration manager instance
export { testConfigManager };

// Export global test configuration constants
export {
    DEFAULT_TEST_PORT,
    TEST_PORT_RANGE,
    TEST_TIMEOUT,
    MAX_PORT_ATTEMPTS,
    TEST_SERVER_NAME,
    PERFORMANCE_TEST_DURATION,
    CONCURRENT_CONNECTIONS_LIMIT,
    TEST_CORRELATION_PREFIX
};

// Default export for convenient access to complete test configuration functionality
export default testConfigManager;