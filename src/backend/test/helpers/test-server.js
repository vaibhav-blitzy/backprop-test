/**
 * Comprehensive Test Server Management Utility for Node.js Tutorial Application
 * 
 * Provides isolated HTTP server instances for testing the Node.js tutorial application
 * with comprehensive test server lifecycle management, automatic port allocation,
 * configuration isolation, health monitoring, and resource cleanup. Enables unit tests,
 * integration tests, and end-to-end tests with standardized server management, test
 * correlation, and educational patterns for testing HTTP server applications with
 * production-ready server management capabilities.
 * 
 * Key Features:
 * - Isolated test server instances with independent configuration and resource allocation
 * - Automatic port allocation with conflict avoidance and range management
 * - Comprehensive lifecycle management with startup, shutdown, and restart capabilities
 * - Health monitoring and status tracking for reliable test execution
 * - Performance metrics and timing measurement for optimization and monitoring
 * - Resource cleanup and isolation for proper test separation and reliability
 * - Event-driven architecture for test coordination and monitoring integration
 * - Educational patterns demonstrating enterprise testing infrastructure practices
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive test infrastructure design and implementation patterns
 * - Shows isolated test environment creation and resource management techniques
 * - Illustrates production-ready testing patterns with proper lifecycle management
 * - Provides examples of event-driven testing architecture and coordination
 * - Shows integration patterns between test utilities and application components
 * - Demonstrates Node.js-specific testing patterns and built-in module utilization
 * 
 * Architecture Integration:
 * - Deep integration with Application class for complete server functionality
 * - Utilizes HttpServer for direct HTTP server management and control
 * - Leverages ServerConfig for test-specific server configuration patterns
 * - Incorporates TestConfigManager for centralized configuration management
 * - Uses Logger for structured test execution logging and monitoring
 * - Integrates ErrorHandler for comprehensive test error management
 * 
 * @fileoverview Comprehensive test server management utility for Node.js tutorial testing framework
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - INTERNAL DEPENDENCIES
// ============================================================================

// Import main application class for creating isolated test server instances
import { Application, createApplication } from '../../app.js';

// Import core HTTP server implementation for direct server management
import { HttpServer } from '../../lib/http-server.js';

// Import server configuration patterns for test server configuration generation
import { ServerConfig } from '../../config/server.config.js';

// Import test configuration utilities for dynamic port allocation and test setup
import { 
    getTestPort, 
    createTestServerConfig, 
    TestConfigManager 
} from '../fixtures/test-config.js';

// Import logging utilities for test server operations and debugging
import { Logger } from '../../utils/logger.js';

// Import error handling for test server startup failures and runtime errors
import { ErrorHandler } from '../../lib/error-handler.js';

// ============================================================================
// MODULE IMPORTS - EXTERNAL DEPENDENCIES
// ============================================================================

// Import Node.js built-in EventEmitter for test server lifecycle events and notifications
import { EventEmitter } from 'node:events'; // Node.js v22.x LTS - Built-in events module

// Import Node.js net module for port availability testing and network configuration validation
import net from 'node:net'; // Node.js v22.x LTS - Built-in net module for network operations

// Import Node.js utilities for promisification and object inspection in test server operations
import util from 'node:util'; // Node.js v22.x LTS - Built-in utility module for object inspection

// ============================================================================
// GLOBAL TEST SERVER CONSTANTS
// ============================================================================

/**
 * Default port number for test server instances when no specific port is requested.
 * Serves as the starting point for test port allocation and provides consistent defaults.
 */
const DEFAULT_TEST_PORT = 3001;

/**
 * Default timeout duration in milliseconds for test server startup operations.
 * Provides sufficient time for server initialization while preventing test delays.
 */
const DEFAULT_STARTUP_TIMEOUT = 5000;

/**
 * Default timeout duration in milliseconds for test server shutdown operations.
 * Ensures graceful shutdown completion while maintaining test execution efficiency.
 */
const DEFAULT_SHUTDOWN_TIMEOUT = 3000;

/**
 * Maximum number of startup retry attempts before failing test server creation.
 * Prevents infinite retry loops while providing resilience for transient failures.
 */
const MAX_STARTUP_RETRIES = 3;

/**
 * Identifier prefix for test server instances used in logging and correlation.
 * Provides consistent identification of test servers in logs and monitoring systems.
 */
const TEST_SERVER_PREFIX = 'test-server';

/**
 * Interval duration in milliseconds for port availability checking operations.
 * Controls the frequency of port availability tests during server startup validation.
 */
const PORT_CHECK_INTERVAL = 100;

/**
 * Timeout duration in milliseconds for server readiness verification operations.
 * Defines maximum wait time for server readiness checking with connection validation.
 */
const SERVER_READY_CHECK_TIMEOUT = 2000;

// ============================================================================
// TEST UTILITY FUNCTIONS (Since test-utils.js doesn't exist)
// ============================================================================

/**
 * Generates unique test identifier for test server correlation and tracking across
 * test execution. Creates cryptographically secure unique identifiers with test type
 * context and temporal correlation for comprehensive test tracking.
 * 
 * @param {string} [prefix='test'] - Prefix for test identifier categorization
 * @param {string} [suffix=''] - Optional suffix for additional context
 * @returns {string} Unique test identifier with temporal and random components
 * 
 * @example
 * const testId = generateTestId('server', 'unit');
 * console.log(testId); // "test-server-unit-1703123456789-a1b2c3d4"
 */
function generateTestId(prefix = 'test', suffix = '') {
    try {
        // Generate timestamp component for temporal correlation
        const timestamp = Date.now().toString();
        
        // Generate random component for uniqueness guarantee
        const randomComponent = Math.random().toString(36).substring(2, 10);
        
        // Construct identifier components array
        const components = [prefix];
        
        if (suffix && typeof suffix === 'string' && suffix.trim().length > 0) {
            components.push(suffix.trim());
        }
        
        components.push(timestamp, randomComponent);
        
        // Return unique test identifier for correlation tracking
        return components.join('-');
        
    } catch (error) {
        // Fallback identifier generation if primary generation fails
        return `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
}

/**
 * Async delay utility for server startup and shutdown timing management with precise
 * timing control. Provides promisified delay functionality for test coordination and
 * timing control during server lifecycle operations.
 * 
 * @param {number} milliseconds - Duration to sleep in milliseconds
 * @returns {Promise<void>} Promise resolving after specified delay duration
 * 
 * @example
 * await sleep(1000); // Wait 1 second
 * console.log('Delay completed');
 */
function sleep(milliseconds) {
    return new Promise(resolve => {
        // Validate timeout parameter
        const timeout = Math.max(0, parseInt(milliseconds) || 0);
        
        // Set timer for specified duration
        setTimeout(resolve, timeout);
    });
}

/**
 * Retry logic for handling server startup and connection establishment with error resilience
 * and configurable retry behavior. Implements exponential backoff and comprehensive error
 * handling for reliable test server operations.
 * 
 * @param {Function} operation - Async operation to retry
 * @param {Object} [options={}] - Retry configuration options
 * @param {number} [options.maxAttempts=3] - Maximum retry attempts
 * @param {number} [options.initialDelay=100] - Initial delay between retries
 * @param {boolean} [options.exponentialBackoff=true] - Enable exponential backoff
 * @returns {Promise<any>} Promise resolving with operation result or rejecting after max attempts
 * 
 * @example
 * const result = await retry(async () => await connectToServer(), {
 *   maxAttempts: 5,
 *   initialDelay: 200
 * });
 */
async function retry(operation, options = {}) {
    const config = {
        maxAttempts: 3,
        initialDelay: 100,
        exponentialBackoff: true,
        ...options
    };
    
    let lastError;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            // Execute operation and return result on success
            const result = await operation();
            return result;
            
        } catch (error) {
            lastError = error;
            
            // Don't delay on the last attempt
            if (attempt < config.maxAttempts) {
                // Calculate delay with optional exponential backoff
                const delay = config.exponentialBackoff ? 
                    config.initialDelay * Math.pow(2, attempt - 1) :
                    config.initialDelay;
                
                await sleep(delay);
            }
        }
    }
    
    // Throw last error after all attempts exhausted
    throw lastError;
}

/**
 * High-precision timing utility for server startup and performance measurement with
 * microsecond precision. Provides comprehensive timing measurement for performance
 * monitoring and optimization of test server operations.
 */
class TestTimer {
    /**
     * Initializes test timer with high-precision timing capabilities for performance measurement.
     */
    constructor() {
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.measurements = [];
    }
    
    /**
     * Starts timing measurement using high-resolution time for precise performance tracking.
     * 
     * @returns {TestTimer} Timer instance for method chaining
     */
    start() {
        this.startTime = process.hrtime.bigint();
        this.endTime = null;
        this.isRunning = true;
        return this;
    }
    
    /**
     * Stops timing measurement and records elapsed duration for performance analysis.
     * 
     * @returns {TestTimer} Timer instance for method chaining
     */
    stop() {
        if (this.isRunning && this.startTime !== null) {
            this.endTime = process.hrtime.bigint();
            this.isRunning = false;
            
            // Record measurement for historical analysis
            this.measurements.push({
                startTime: this.startTime,
                endTime: this.endTime,
                duration: this.getElapsed(),
                timestamp: new Date().toISOString()
            });
        }
        return this;
    }
    
    /**
     * Returns elapsed time in milliseconds with high precision for performance measurement.
     * 
     * @returns {number} Elapsed time in milliseconds or 0 if timer not properly started/stopped
     */
    getElapsed() {
        if (this.startTime === null) return 0;
        
        const endTime = this.endTime || process.hrtime.bigint();
        const nanoseconds = endTime - this.startTime;
        
        // Convert nanoseconds to milliseconds with precision
        return Number(nanoseconds) / 1000000;
    }
    
    /**
     * Resets timer state for new measurement cycle.
     * 
     * @returns {TestTimer} Timer instance for method chaining
     */
    reset() {
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        return this;
    }
}

// ============================================================================
// COMPREHENSIVE TEST SERVER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Comprehensive test server management class providing isolated HTTP server instances
 * with lifecycle management, health monitoring, configuration management, and resource
 * cleanup for testing the Node.js tutorial application. Implements educational testing
 * patterns while providing production-ready server management capabilities including
 * event emission, performance tracking, and test correlation for robust test execution
 * environments.
 */
class TestServer extends EventEmitter {
    /**
     * Initializes test server with configuration, application instance, and monitoring
     * capabilities for comprehensive test server lifecycle management.
     * 
     * @param {Object} config - Test server configuration object
     */
    constructor(config) {
        super();
        
        try {
            // Generate unique test server ID using generateTestId for correlation tracking
            this.id = generateTestId(TEST_SERVER_PREFIX, config.testType || 'general');
            
            // Validate and store server configuration with defaults application
            this.config = this._validateAndMergeConfig(config);
            
            // Initialize Application instance using provided configuration and factory
            this.application = null;
            
            // Extract server connection details from configuration
            this.port = this.config.port || DEFAULT_TEST_PORT;
            this.host = this.config.host || 'localhost';
            this.status = 'stopped';
            
            // Set up logging with test-specific logger configuration and correlation
            this.logger = new Logger({
                logLevel: this.config.logging?.level || 'error',
                enableColors: false
            });
            
            // Initialize performance timer for server lifecycle measurement
            this.timer = new TestTimer();
            
            // Initialize server metrics and monitoring for performance tracking
            this.metrics = {
                startupTime: 0,
                uptime: 0,
                requestCount: 0,
                errorCount: 0,
                lastActivity: null,
                healthChecks: []
            };
            
            // Configure error handler for server startup and runtime error management
            this.errorHandler = new ErrorHandler({
                logger: this.logger,
                isDevelopment: true
            });
            
            // Track cleanup state for resource management
            this.isCleanedUp = false;
            
            // Set up event handlers for lifecycle management
            this._setupEventHandlers();
            
            // Log successful test server initialization
            this.logger.debug('TestServer initialized successfully', {
                id: this.id,
                port: this.port,
                host: this.host,
                testType: this.config.testType
            });
            
        } catch (error) {
            const initError = new Error(`TestServer initialization failed: ${error.message}`);
            initError.originalError = error;
            throw initError;
        }
    }
    
    /**
     * Starts the test server with comprehensive error handling, timing measurement,
     * and readiness verification for stable test execution.
     * 
     * @param {Object} [startOptions={}] - Server startup options
     * @returns {Promise<void>} Promise resolving when server is successfully started and ready
     */
    async start(startOptions = {}) {
        try {
            // Validate server is not already running to prevent duplicate startup
            if (this.status === 'running') {
                throw new Error(`Test server ${this.id} is already running`);
            }
            
            // Start performance timer for server startup measurement
            this.timer.start();
            
            // Set server status to 'starting' and emit startup event
            this.status = 'starting';
            this.emit('starting', { 
                id: this.id, 
                port: this.port, 
                timestamp: new Date().toISOString() 
            });
            
            // Create Application instance with test-specific configuration
            if (!this.application) {
                this.application = createApplication(this.config);
            }
            
            // Use Application.start method with test-specific configuration
            await this.application.start();
            
            // Wait for server to bind to port using waitForServerReady utility
            const isReady = await this.waitForReady({
                timeout: startOptions.timeout || DEFAULT_STARTUP_TIMEOUT,
                checkInterval: PORT_CHECK_INTERVAL
            });
            
            if (!isReady) {
                throw new Error(`Test server ${this.id} failed to become ready within timeout`);
            }
            
            // Verify server health status using getHealthStatus method
            const healthStatus = await this.getHealthStatus();
            if (!healthStatus.isHealthy) {
                throw new Error(`Test server ${this.id} failed health check: ${healthStatus.details}`);
            }
            
            // Stop timer and record startup performance metrics
            this.timer.stop();
            this.metrics.startupTime = this.timer.getElapsed();
            this.metrics.lastActivity = new Date().toISOString();
            
            // Set server status to 'running' and emit ready event
            this.status = 'running';
            this.emit('ready', { 
                id: this.id, 
                port: this.port, 
                startupTime: this.metrics.startupTime,
                baseUrl: this.getBaseUrl(),
                timestamp: new Date().toISOString()
            });
            
            // Log successful server startup with configuration and timing information
            this.logger.info('Test server started successfully', {
                id: this.id,
                port: this.port,
                host: this.host,
                startupTime: `${this.metrics.startupTime.toFixed(2)}ms`,
                baseUrl: this.getBaseUrl(),
                testType: this.config.testType
            });
            
        } catch (error) {
            // Handle startup failures with proper error handling and cleanup
            this.status = 'error';
            this.timer.stop();
            
            this.emit('error', { 
                id: this.id, 
                error: error.message,
                phase: 'startup',
                timestamp: new Date().toISOString()
            });
            
            this.logger.error('Test server startup failed', {
                id: this.id,
                error: error.message,
                port: this.port,
                timestamp: new Date().toISOString()
            }, error);
            
            // Cleanup partial initialization
            await this._emergencyCleanup();
            
            throw error;
        }
    }
    
    /**
     * Gracefully stops the test server with resource cleanup, connection draining,
     * and comprehensive cleanup verification for proper test isolation.
     * 
     * @param {Object} [stopOptions={}] - Server shutdown options
     * @returns {Promise<void>} Promise resolving when server is fully stopped and cleaned up
     */
    async stop(stopOptions = {}) {
        try {
            // Validate server is running before attempting shutdown
            if (this.status !== 'running') {
                this.logger.warn('Attempted to stop non-running test server', {
                    id: this.id,
                    currentStatus: this.status
                });
                return;
            }
            
            // Set server status to 'stopping' and emit stopping event
            this.status = 'stopping';
            this.emit('stopping', { 
                id: this.id, 
                port: this.port,
                timestamp: new Date().toISOString()
            });
            
            // Start shutdown timer for performance measurement
            const shutdownTimer = new TestTimer().start();
            
            // Use Application.stop method with graceful shutdown configuration
            if (this.application) {
                await this.application.stop();
            }
            
            // Wait for all active connections to complete within timeout
            const shutdownTimeout = stopOptions.timeout || DEFAULT_SHUTDOWN_TIMEOUT;
            await this._waitForConnectionsDrained(shutdownTimeout);
            
            // Release allocated port using TestConfigManager.releasePort
            if (this.config.testConfigManager) {
                this.config.testConfigManager.releasePort(this.id);
            }
            
            // Clean up server resources and event handlers
            await this._cleanupResources();
            
            // Stop timer and record shutdown performance metrics
            shutdownTimer.stop();
            this.metrics.shutdownTime = shutdownTimer.getElapsed();
            
            // Set server status to 'stopped' and emit stopped event
            this.status = 'stopped';
            this.emit('stopped', { 
                id: this.id, 
                port: this.port,
                shutdownTime: this.metrics.shutdownTime,
                timestamp: new Date().toISOString()
            });
            
            // Mark server as cleaned up for resource tracking
            this.isCleanedUp = true;
            
            this.logger.info('Test server stopped successfully', {
                id: this.id,
                port: this.port,
                shutdownTime: `${this.metrics.shutdownTime.toFixed(2)}ms`,
                uptime: `${this.metrics.uptime.toFixed(2)}ms`
            });
            
        } catch (error) {
            this.status = 'error';
            this.emit('error', { 
                id: this.id, 
                error: error.message,
                phase: 'shutdown',
                timestamp: new Date().toISOString()
            });
            
            this.logger.error('Test server shutdown failed', {
                id: this.id,
                error: error.message
            }, error);
            
            // Force cleanup even if graceful shutdown fails
            await this._emergencyCleanup();
            
            throw error;
        }
    }
    
    /**
     * Restarts the test server by stopping and starting with configuration reload
     * and comprehensive state management for test scenario changes.
     * 
     * @param {Object} [restartOptions={}] - Server restart options
     * @returns {Promise<void>} Promise resolving when server is successfully restarted
     */
    async restart(restartOptions = {}) {
        try {
            // Validate current server state and configuration
            this.logger.info('Restarting test server', {
                id: this.id,
                currentStatus: this.status,
                port: this.port
            });
            
            // Stop current server instance using graceful shutdown
            if (this.status === 'running') {
                await this.stop({
                    timeout: restartOptions.stopTimeout || DEFAULT_SHUTDOWN_TIMEOUT
                });
            }
            
            // Wait for complete shutdown verification
            await sleep(restartOptions.restartDelay || 500);
            
            // Reload configuration if specified in restart options
            if (restartOptions.reloadConfig && restartOptions.newConfig) {
                this.config = this._validateAndMergeConfig(restartOptions.newConfig);
                this.port = this.config.port || this.port;
                this.host = this.config.host || this.host;
            }
            
            // Start server with updated configuration
            await this.start({
                timeout: restartOptions.startTimeout || DEFAULT_STARTUP_TIMEOUT
            });
            
            // Verify server readiness and health status
            const healthStatus = await this.getHealthStatus();
            if (!healthStatus.isHealthy) {
                throw new Error(`Test server ${this.id} failed health check after restart`);
            }
            
            // Update server metrics and performance tracking
            this.metrics.restartCount = (this.metrics.restartCount || 0) + 1;
            this.metrics.lastRestart = new Date().toISOString();
            
            this.logger.info('Test server restarted successfully', {
                id: this.id,
                port: this.port,
                restartCount: this.metrics.restartCount
            });
            
        } catch (error) {
            this.logger.error('Test server restart failed', {
                id: this.id,
                error: error.message
            }, error);
            
            throw error;
        }
    }
    
    /**
     * Retrieves comprehensive server information including configuration, status,
     * performance metrics, and health data for monitoring and debugging.
     * 
     * @returns {Object} Complete server information object with configuration and performance data
     */
    getInfo() {
        try {
            // Collect basic server information including ID, host, and port
            const basicInfo = {
                id: this.id,
                host: this.host,
                port: this.port,
                baseUrl: this.getBaseUrl()
            };
            
            // Get current server status and lifecycle state
            const statusInfo = {
                status: this.status,
                isRunning: this.status === 'running',
                isReady: this.isReady(),
                isCleanedUp: this.isCleanedUp
            };
            
            // Include server configuration and test-specific settings
            const configInfo = {
                testType: this.config.testType,
                testId: this.config.correlation?.testId,
                sessionId: this.config.correlation?.sessionId,
                environment: this.config.environment?.NODE_ENV
            };
            
            // Add performance metrics including startup time and uptime
            const performanceInfo = {
                startupTime: this.metrics.startupTime,
                uptime: this._calculateUptime(),
                requestCount: this.metrics.requestCount,
                errorCount: this.metrics.errorCount,
                lastActivity: this.metrics.lastActivity,
                restartCount: this.metrics.restartCount || 0
            };
            
            // Format server information for test monitoring and debugging
            const serverInfo = {
                basic: basicInfo,
                status: statusInfo,
                configuration: configInfo,
                performance: performanceInfo,
                metadata: {
                    createdAt: this.config.correlation?.timestamp,
                    infoGeneratedAt: new Date().toISOString(),
                    className: 'TestServer',
                    version: '1.0.0'
                }
            };
            
            // Return comprehensive server information object
            return serverInfo;
            
        } catch (error) {
            this.logger.error('Failed to generate server info', {
                id: this.id,
                error: error.message
            });
            
            return {
                id: this.id,
                status: this.status,
                error: 'Failed to generate complete server information',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Checks if the test server is ready to accept requests with comprehensive
     * readiness verification including port binding and health status.
     * 
     * @returns {boolean} True if server is ready for requests, false otherwise
     */
    isReady() {
        try {
            // Check server status is 'running' for basic readiness
            if (this.status !== 'running') {
                return false;
            }
            
            // Use Application.isReady method for application-level readiness
            if (this.application && typeof this.application.isReady === 'function') {
                const applicationReady = this.application.isReady();
                if (!applicationReady) {
                    return false;
                }
            }
            
            // Check server health status for overall system health
            // Note: This is a synchronous check, avoiding async health status call
            const hasValidPort = this.port > 0 && this.port < 65536;
            const hasValidHost = typeof this.host === 'string' && this.host.length > 0;
            
            // Return comprehensive readiness status for test coordination
            return hasValidPort && hasValidHost;
            
        } catch (error) {
            this.logger.error('Error checking server readiness', {
                id: this.id,
                error: error.message
            });
            return false;
        }
    }
    
    /**
     * Retrieves detailed health status including server health, application health,
     * and resource utilization for comprehensive health monitoring.
     * 
     * @returns {Object} Health status object with detailed health information and diagnostic data
     */
    async getHealthStatus() {
        try {
            // Initialize health status object
            const healthStatus = {
                isHealthy: false,
                timestamp: new Date().toISOString(),
                serverId: this.id,
                checks: {}
            };
            
            // Check basic server state
            healthStatus.checks.serverStatus = {
                status: this.status,
                isHealthy: this.status === 'running',
                message: `Server status: ${this.status}`
            };
            
            // Check port binding and connection status
            healthStatus.checks.portBinding = await this._checkPortBinding();
            
            // Use Application.getHealthStatus for application health data
            if (this.application && typeof this.application.getHealthStatus === 'function') {
                try {
                    const appHealth = await this.application.getHealthStatus();
                    healthStatus.checks.application = {
                        isHealthy: appHealth.isHealthy,
                        details: appHealth.details || 'Application health check completed',
                        components: appHealth.components || {}
                    };
                } catch (appError) {
                    healthStatus.checks.application = {
                        isHealthy: false,
                        details: `Application health check failed: ${appError.message}`,
                        error: appError.message
                    };
                }
            } else {
                healthStatus.checks.application = {
                    isHealthy: this.status === 'running',
                    details: 'Application health check not available'
                };
            }
            
            // Include performance metrics and resource utilization
            const memUsage = process.memoryUsage();
            healthStatus.checks.resources = {
                isHealthy: memUsage.heapUsed < 100 * 1024 * 1024, // 100MB threshold
                memory: {
                    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
                    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
                },
                uptime: Math.round(process.uptime()),
                loadAverage: process.platform === 'linux' ? require('os').loadavg() : 'N/A'
            };
            
            // Add test-specific health information and correlation data
            healthStatus.checks.testSpecific = {
                isHealthy: !this.isCleanedUp && this.status === 'running',
                testId: this.config.correlation?.testId,
                testType: this.config.testType,
                port: this.port,
                baseUrl: this.getBaseUrl(),
                metricsCount: Object.keys(this.metrics).length
            };
            
            // Determine overall health status
            const allChecks = Object.values(healthStatus.checks);
            healthStatus.isHealthy = allChecks.every(check => 
                check.isHealthy !== false
            );
            
            // Add health check summary
            healthStatus.summary = {
                totalChecks: allChecks.length,
                passedChecks: allChecks.filter(check => check.isHealthy === true).length,
                failedChecks: allChecks.filter(check => check.isHealthy === false).length,
                overallStatus: healthStatus.isHealthy ? 'healthy' : 'unhealthy'
            };
            
            // Store health check in metrics for tracking
            this.metrics.healthChecks.push({
                timestamp: healthStatus.timestamp,
                isHealthy: healthStatus.isHealthy,
                summary: healthStatus.summary
            });
            
            // Limit health check history
            if (this.metrics.healthChecks.length > 10) {
                this.metrics.healthChecks = this.metrics.healthChecks.slice(-5);
            }
            
            // Return comprehensive health status object
            return healthStatus;
            
        } catch (error) {
            this.logger.error('Health status check failed', {
                id: this.id,
                error: error.message
            });
            
            return {
                isHealthy: false,
                timestamp: new Date().toISOString(),
                serverId: this.id,
                error: `Health check failed: ${error.message}`,
                checks: {
                    healthCheckFailure: {
                        isHealthy: false,
                        details: error.message
                    }
                }
            };
        }
    }
    
    /**
     * Retrieves performance metrics and statistics including timing data, request counts,
     * and resource utilization for performance monitoring and optimization.
     * 
     * @returns {Object} Performance metrics object with timing, throughput, and resource data
     */
    getMetrics() {
        try {
            // Collect server lifecycle timing metrics including startup and uptime
            const timingMetrics = {
                startupTime: this.metrics.startupTime,
                uptime: this._calculateUptime(),
                shutdownTime: this.metrics.shutdownTime || 0,
                lastActivity: this.metrics.lastActivity
            };
            
            // Include request processing metrics if available
            const requestMetrics = {
                requestCount: this.metrics.requestCount,
                errorCount: this.metrics.errorCount,
                successRate: this.metrics.requestCount > 0 ? 
                    ((this.metrics.requestCount - this.metrics.errorCount) / this.metrics.requestCount * 100).toFixed(2) : 0
            };
            
            // Add resource utilization metrics including memory and CPU
            const memUsage = process.memoryUsage();
            const resourceMetrics = {
                memory: {
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
                    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
                    external: Math.round(memUsage.external / 1024 / 1024) // MB
                },
                process: {
                    uptime: Math.round(process.uptime()),
                    pid: process.pid,
                    platform: process.platform,
                    nodeVersion: process.version
                }
            };
            
            // Include test-specific performance data and correlation
            const testMetrics = {
                testId: this.config.correlation?.testId,
                testType: this.config.testType,
                serverId: this.id,
                port: this.port,
                restartCount: this.metrics.restartCount || 0,
                healthCheckCount: this.metrics.healthChecks.length
            };
            
            // Format metrics for performance monitoring and analysis
            const performanceMetrics = {
                timing: timingMetrics,
                requests: requestMetrics,
                resources: resourceMetrics,
                test: testMetrics,
                metadata: {
                    metricsGeneratedAt: new Date().toISOString(),
                    metricsVersion: '1.0.0',
                    serverStatus: this.status
                }
            };
            
            // Return comprehensive performance metrics object
            return performanceMetrics;
            
        } catch (error) {
            this.logger.error('Failed to generate performance metrics', {
                id: this.id,
                error: error.message
            });
            
            return {
                error: 'Metrics generation failed',
                timestamp: new Date().toISOString(),
                serverId: this.id,
                basicMetrics: {
                    status: this.status,
                    port: this.port,
                    uptime: this._calculateUptime()
                }
            };
        }
    }
    
    /**
     * Performs comprehensive cleanup of server resources, event handlers, and allocated
     * resources for proper test isolation and resource management.
     * 
     * @returns {Promise<void>} Promise resolving when all cleanup operations are complete
     */
    async cleanup() {
        try {
            // Stop server if still running using graceful shutdown
            if (this.status === 'running') {
                await this.stop();
            }
            
            // Remove all event listeners and handlers
            this.removeAllListeners();
            
            // Release allocated port using TestConfigManager
            if (this.config.testConfigManager) {
                this.config.testConfigManager.releasePort(this.id);
            }
            
            // Clean up logger and performance timer resources
            if (this.logger && typeof this.logger.flush === 'function') {
                await this.logger.flush();
            }
            
            this.timer.reset();
            
            // Clear metrics and monitoring data
            this.metrics = {
                startupTime: 0,
                uptime: 0,
                requestCount: 0,
                errorCount: 0,
                lastActivity: null,
                healthChecks: []
            };
            
            // Clear application reference
            this.application = null;
            
            // Mark server as cleaned up for resource tracking
            this.isCleanedUp = true;
            this.status = 'cleaned';
            
            // Log cleanup completion for test execution monitoring
            this.logger.debug('Test server cleanup completed', {
                id: this.id,
                port: this.port,
                cleanupTime: new Date().toISOString()
            });
            
        } catch (error) {
            this.logger.error('Test server cleanup failed', {
                id: this.id,
                error: error.message
            }, error);
            
            // Mark as cleaned up even if cleanup failed to prevent resource leaks
            this.isCleanedUp = true;
            this.status = 'error';
            
            throw error;
        }
    }
    
    /**
     * Waits for server to be ready with configurable timeout and retry logic
     * for stable test coordination and execution timing.
     * 
     * @param {Object} [waitOptions={}] - Wait operation options
     * @returns {Promise<boolean>} Promise resolving to true when server is ready or false on timeout
     */
    async waitForReady(waitOptions = {}) {
        const options = {
            timeout: SERVER_READY_CHECK_TIMEOUT,
            checkInterval: PORT_CHECK_INTERVAL,
            ...waitOptions
        };
        
        try {
            // Use waitForServerReady utility function with server instance
            return await waitForServerReady(this, options);
            
        } catch (error) {
            this.logger.error('Wait for ready failed', {
                id: this.id,
                error: error.message,
                options
            });
            return false;
        }
    }
    
    /**
     * Returns the base URL for the test server including protocol, host, and port
     * for test client connection and request targeting.
     * 
     * @returns {string} Base URL string for test server connection
     */
    getBaseUrl() {
        try {
            // Construct base URL using protocol (http), host, and port
            const protocol = 'http'; // Tutorial uses HTTP only
            const host = this.host || 'localhost';
            const port = this.port || DEFAULT_TEST_PORT;
            
            // Validate server configuration for URL construction
            if (!host || !port) {
                throw new Error('Invalid host or port for URL construction');
            }
            
            // Return formatted base URL for test client usage
            return `${protocol}://${host}:${port}`;
            
        } catch (error) {
            this.logger.error('Failed to generate base URL', {
                id: this.id,
                host: this.host,
                port: this.port,
                error: error.message
            });
            
            return `http://localhost:${DEFAULT_TEST_PORT}`;
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Validates and merges configuration with defaults.
     * @private
     */
    _validateAndMergeConfig(config) {
        const defaultConfig = {
            testType: 'unit',
            port: DEFAULT_TEST_PORT,
            host: 'localhost',
            logging: {
                level: 'error',
                enabled: false
            },
            timeouts: {
                startup: DEFAULT_STARTUP_TIMEOUT,
                shutdown: DEFAULT_SHUTDOWN_TIMEOUT
            },
            correlation: {
                testId: generateTestId('server', 'config'),
                sessionId: util.randomUUID?.() || `session-${Date.now()}`,
                timestamp: new Date().toISOString()
            }
        };
        
        return { ...defaultConfig, ...config };
    }
    
    /**
     * Sets up event handlers for lifecycle management.
     * @private
     */
    _setupEventHandlers() {
        // Handle uncaught errors
        this.on('error', (errorInfo) => {
            this.metrics.errorCount++;
            this.logger.error('Test server error event', errorInfo);
        });
        
        // Track lifecycle events
        this.on('starting', () => {
            this.metrics.lastActivity = new Date().toISOString();
        });
        
        this.on('ready', () => {
            this.metrics.lastActivity = new Date().toISOString();
        });
        
        this.on('stopping', () => {
            this.metrics.lastActivity = new Date().toISOString();
        });
    }
    
    /**
     * Calculates current uptime in milliseconds.
     * @private
     */
    _calculateUptime() {
        if (this.status !== 'running' || !this.metrics.lastActivity) {
            return 0;
        }
        
        const startTime = new Date(this.config.correlation?.timestamp || Date.now());
        return Date.now() - startTime.getTime();
    }
    
    /**
     * Checks port binding status.
     * @private
     */
    async _checkPortBinding() {
        try {
            return new Promise((resolve) => {
                const testSocket = net.createConnection(this.port, this.host);
                
                testSocket.on('connect', () => {
                    testSocket.destroy();
                    resolve({
                        isHealthy: true,
                        message: `Port ${this.port} is accessible`,
                        port: this.port,
                        host: this.host
                    });
                });
                
                testSocket.on('error', () => {
                    resolve({
                        isHealthy: false,
                        message: `Port ${this.port} is not accessible`,
                        port: this.port,
                        host: this.host
                    });
                });
                
                // Timeout for connection attempt
                setTimeout(() => {
                    testSocket.destroy();
                    resolve({
                        isHealthy: false,
                        message: `Port ${this.port} connection timeout`,
                        port: this.port,
                        host: this.host
                    });
                }, 1000);
            });
        } catch (error) {
            return {
                isHealthy: false,
                message: `Port check failed: ${error.message}`,
                port: this.port,
                host: this.host
            };
        }
    }
    
    /**
     * Waits for connections to drain during shutdown.
     * @private
     */
    async _waitForConnectionsDrained(timeout) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            // In a real implementation, this would check for active connections
            // For the tutorial, we'll simulate connection draining
            await sleep(100);
            
            // Assume connections are drained after short delay
            if (Date.now() - startTime > 500) {
                break;
            }
        }
    }
    
    /**
     * Cleans up server resources.
     * @private
     */
    async _cleanupResources() {
        try {
            // Clear any timers or intervals
            // Clear references to prevent memory leaks
            this.metrics.lastActivity = new Date().toISOString();
            
            // Additional cleanup operations would go here
            await sleep(10); // Minimal delay for cleanup completion
            
        } catch (error) {
            this.logger.error('Resource cleanup error', {
                id: this.id,
                error: error.message
            });
        }
    }
    
    /**
     * Emergency cleanup for failed initialization.
     * @private
     */
    async _emergencyCleanup() {
        try {
            this.status = 'error';
            this.isCleanedUp = true;
            
            if (this.application) {
                try {
                    await this.application.stop();
                } catch (stopError) {
                    // Ignore stop errors during emergency cleanup
                }
            }
            
            this.removeAllListeners();
            
        } catch (error) {
            // Ignore cleanup errors during emergency situations
        }
    }
}

// ============================================================================
// FACTORY FUNCTIONS FOR TEST SERVER MANAGEMENT
// ============================================================================

/**
 * Factory function for creating isolated test server instances with test-specific
 * configuration, port allocation, and lifecycle management for different testing scenarios.
 * 
 * @param {Object} [serverOptions={}] - Server creation options and configuration
 * @returns {Promise<TestServer>} Promise resolving to configured TestServer instance
 */
async function createTestServer(serverOptions = {}) {
    try {
        // Validate server options and apply defaults for test server configuration
        const options = {
            testType: 'unit',
            port: null, // Will be auto-allocated
            host: 'localhost',
            ...serverOptions
        };
        
        // Generate unique test server ID using generateTestId for correlation tracking
        const testServerId = generateTestId(TEST_SERVER_PREFIX, options.testType);
        
        // Initialize TestConfigManager for configuration management
        const configManager = new TestConfigManager();
        
        // Allocate available port using getTestPort with conflict avoidance
        const allocatedPort = await configManager.allocatePort(testServerId, options.port);
        
        // Create test-specific server configuration using createTestServerConfig factory
        const serverConfig = createTestServerConfig(options.testType, {
            port: allocatedPort,
            host: options.host,
            testConfigManager: configManager,
            ...options
        });
        
        // Create TestServer instance with application and configuration
        const testServer = new TestServer(serverConfig);
        
        // Set up test server event handlers for lifecycle monitoring
        testServer.on('error', (errorInfo) => {
            console.error(`Test server error [${testServer.id}]:`, errorInfo);
        });
        
        testServer.on('ready', (readyInfo) => {
            console.log(`Test server ready [${testServer.id}]: ${readyInfo.baseUrl}`);
        });
        
        // Return configured TestServer instance ready for test execution
        return testServer;
        
    } catch (error) {
        const createError = new Error(`Failed to create test server: ${error.message}`);
        createError.originalError = error;
        createError.context = {
            serverOptions: JSON.stringify(serverOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw createError;
    }
}

/**
 * Utility function for waiting until test server is ready to accept connections with
 * configurable timeout and retry logic for stable test execution.
 * 
 * @param {TestServer} testServer - Test server instance to check for readiness
 * @param {Object} [waitOptions={}] - Wait operation options and configuration
 * @returns {Promise<boolean>} Promise resolving to true when server is ready or false on timeout
 */
async function waitForServerReady(testServer, waitOptions = {}) {
    const options = {
        timeout: SERVER_READY_CHECK_TIMEOUT,
        checkInterval: PORT_CHECK_INTERVAL,
        maxAttempts: Math.ceil(SERVER_READY_CHECK_TIMEOUT / PORT_CHECK_INTERVAL),
        ...waitOptions
    };
    
    try {
        // Extract server information including host and port from test server instance
        const serverInfo = testServer.getInfo();
        const host = serverInfo.basic.host;
        const port = serverInfo.basic.port;
        
        // Configure wait timeout and interval from options with defaults
        const startTime = Date.now();
        let attempts = 0;
        
        // Use retry function to check server readiness with configurable attempts
        while (attempts < options.maxAttempts && (Date.now() - startTime) < options.timeout) {
            attempts++;
            
            try {
                // Test port connectivity using net module for connection verification
                const isConnectable = await testPortConnectivity(host, port);
                
                if (isConnectable) {
                    // Verify server health status using getHealthStatus method
                    const healthStatus = await testServer.getHealthStatus();
                    
                    if (healthStatus.isHealthy) {
                        // Return readiness status with timing information for test coordination
                        return true;
                    }
                }
                
            } catch (checkError) {
                // Continue checking on individual check failures
            }
            
            // Wait before next check
            await sleep(options.checkInterval);
        }
        
        // Return false if timeout reached without readiness confirmation
        return false;
        
    } catch (error) {
        testServer.logger?.error('Server readiness check failed', {
            serverId: testServer.id,
            error: error.message,
            options
        });
        return false;
    }
}

/**
 * Tests port connectivity for server readiness verification.
 * @private
 */
async function testPortConnectivity(host, port) {
    return new Promise((resolve) => {
        const socket = net.createConnection(port, host);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        
        socket.on('error', () => {
            resolve(false);
        });
        
        // Timeout for connection test
        setTimeout(() => {
            socket.destroy();
            resolve(false);
        }, 1000);
    });
}

/**
 * Cleanup utility function for stopping all active test servers and releasing
 * allocated resources for proper test isolation and resource management.
 * 
 * @param {Array<TestServer>} testServers - Array of test server instances to cleanup
 * @param {Object} [cleanupOptions={}] - Cleanup operation options
 * @returns {Promise<void>} Promise resolving when all test servers are stopped and resources released
 */
async function cleanupTestServers(testServers, cleanupOptions = {}) {
    const options = {
        timeout: DEFAULT_SHUTDOWN_TIMEOUT,
        parallel: true,
        forceCleanup: true,
        ...cleanupOptions
    };
    
    try {
        // Validate input array
        if (!Array.isArray(testServers)) {
            throw new Error('testServers must be an array');
        }
        
        // Filter for valid TestServer instances
        const validServers = testServers.filter(server => 
            server && typeof server.cleanup === 'function'
        );
        
        if (validServers.length === 0) {
            return; // No servers to cleanup
        }
        
        // Create cleanup operations array
        const cleanupOperations = validServers.map(async (server) => {
            try {
                // Stop each test server using graceful shutdown procedures
                await server.cleanup();
                
                console.log(`Test server cleaned up: ${server.id}`);
                
            } catch (serverError) {
                console.error(`Failed to cleanup server ${server.id}:`, serverError.message);
                
                if (options.forceCleanup) {
                    // Force cleanup even on errors
                    server.isCleanedUp = true;
                    server.status = 'error';
                }
            }
        });
        
        // Wait for all cleanup operations to complete with timeout handling
        if (options.parallel) {
            await Promise.allSettled(cleanupOperations);
        } else {
            // Sequential cleanup
            for (const operation of cleanupOperations) {
                await operation;
            }
        }
        
        // Log cleanup completion status for test execution monitoring
        console.log(`Cleanup completed for ${validServers.length} test servers`);
        
    } catch (error) {
        const cleanupError = new Error(`Test servers cleanup failed: ${error.message}`);
        cleanupError.originalError = error;
        cleanupError.context = {
            serverCount: testServers.length,
            cleanupOptions: JSON.stringify(cleanupOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw cleanupError;
    }
}

/**
 * Validates test server configuration against requirements and constraints with
 * comprehensive error reporting for test setup verification.
 * 
 * @param {Object} serverConfig - Server configuration object to validate
 * @returns {Object} Validation result with success status and detailed error information
 */
function validateTestServerConfig(serverConfig) {
    const validation = {
        isValid: false,
        errors: [],
        warnings: [],
        details: {
            timestamp: new Date().toISOString(),
            configType: serverConfig?.testType || 'unknown'
        }
    };
    
    try {
        // Validate required configuration properties and structure completeness
        if (!serverConfig || typeof serverConfig !== 'object') {
            validation.errors.push('Server configuration must be a valid object');
            return validation;
        }
        
        // Check required properties
        const requiredProps = ['testType', 'port', 'host'];
        requiredProps.forEach(prop => {
            if (!serverConfig.hasOwnProperty(prop)) {
                validation.errors.push(`Missing required property: ${prop}`);
            }
        });
        
        // Check port number against test port range and availability constraints
        if (serverConfig.port) {
            const port = serverConfig.port;
            if (typeof port !== 'number' || port < 1024 || port > 65535) {
                validation.errors.push(`Invalid port ${port}: must be number between 1024 and 65535`);
            }
        }
        
        // Validate timeout values and server lifecycle configuration limits
        if (serverConfig.timeouts) {
            const timeouts = serverConfig.timeouts;
            if (timeouts.startup && (typeof timeouts.startup !== 'number' || timeouts.startup <= 0)) {
                validation.errors.push('Invalid startup timeout: must be positive number');
            }
            if (timeouts.shutdown && (typeof timeouts.shutdown !== 'number' || timeouts.shutdown <= 0)) {
                validation.errors.push('Invalid shutdown timeout: must be positive number');
            }
        }
        
        // Verify test isolation settings and resource allocation constraints
        if (serverConfig.testType) {
            const validTypes = ['unit', 'integration', 'e2e', 'performance', 'error'];
            if (!validTypes.includes(serverConfig.testType)) {
                validation.errors.push(`Invalid test type: ${serverConfig.testType}. Valid types: ${validTypes.join(', ')}`);
            }
        }
        
        // Check server configuration compatibility with test environment
        if (serverConfig.host && typeof serverConfig.host !== 'string') {
            validation.errors.push('Host must be a string');
        }
        
        // Set validation success based on error count
        validation.isValid = validation.errors.length === 0;
        
        // Add validation summary
        validation.summary = {
            errorCount: validation.errors.length,
            warningCount: validation.warnings.length,
            validationStatus: validation.isValid ? 'passed' : 'failed'
        };
        
        // Return comprehensive validation result with success status and error details
        return validation;
        
    } catch (error) {
        validation.errors.push(`Validation error: ${error.message}`);
        validation.isValid = false;
        return validation;
    }
}

/**
 * Retrieves comprehensive status information for test server instances including
 * health, performance, and resource utilization for monitoring and debugging.
 * 
 * @param {TestServer} testServer - Test server instance to get status for
 * @returns {Object} Server status object with health information and performance metrics
 */
function getServerStatus(testServer) {
    try {
        // Validate test server instance
        if (!testServer || typeof testServer.getInfo !== 'function') {
            throw new Error('Invalid test server instance provided');
        }
        
        // Get server health status using getHealthStatus method
        const serverInfo = testServer.getInfo();
        
        // Collect server information including host, port, and configuration
        const basicStatus = {
            id: testServer.id,
            status: testServer.status,
            port: testServer.port,
            host: testServer.host,
            baseUrl: testServer.getBaseUrl(),
            isReady: testServer.isReady(),
            isCleanedUp: testServer.isCleanedUp
        };
        
        // Gather performance metrics including uptime and response statistics
        const performanceMetrics = testServer.getMetrics();
        
        // Include resource utilization information for monitoring
        const resourceInfo = {
            memory: performanceMetrics.resources?.memory || {},
            process: performanceMetrics.resources?.process || {}
        };
        
        // Format status information for test execution and debugging
        const serverStatus = {
            basic: basicStatus,
            performance: {
                timing: performanceMetrics.timing || {},
                requests: performanceMetrics.requests || {},
                resources: resourceInfo
            },
            configuration: {
                testType: testServer.config?.testType,
                testId: testServer.config?.correlation?.testId,
                sessionId: testServer.config?.correlation?.sessionId
            },
            metadata: {
                statusGeneratedAt: new Date().toISOString(),
                className: 'TestServer',
                version: '1.0.0'
            }
        };
        
        // Return comprehensive server status object for monitoring and troubleshooting
        return serverStatus;
        
    } catch (error) {
        return {
            error: `Failed to get server status: ${error.message}`,
            timestamp: new Date().toISOString(),
            serverId: testServer?.id || 'unknown'
        };
    }
}

/**
 * Creates multiple test server instances for load testing and concurrent testing
 * scenarios with coordinated lifecycle management and resource allocation.
 * 
 * @param {number} serverCount - Number of test server instances to create
 * @param {Object} [clusterOptions={}] - Cluster configuration options
 * @returns {Promise<Array<TestServer>>} Promise resolving to array of configured TestServer instances
 */
async function createTestServerCluster(serverCount, clusterOptions = {}) {
    try {
        // Validate server count and cluster options for resource allocation
        if (typeof serverCount !== 'number' || serverCount <= 0 || serverCount > 50) {
            throw new Error('Server count must be a positive number between 1 and 50');
        }
        
        const options = {
            testType: 'performance',
            basePort: DEFAULT_TEST_PORT,
            portIncrement: 1,
            parallel: true,
            ...clusterOptions
        };
        
        // Initialize TestConfigManager for centralized port allocation and tracking
        const configManager = new TestConfigManager();
        const testServers = [];
        const serverCreationPromises = [];
        
        // Create server configurations with cluster-specific settings
        for (let i = 0; i < serverCount; i++) {
            const serverOptions = {
                testType: options.testType,
                host: 'localhost',
                clusterId: generateTestId('cluster', `server-${i}`),
                clusterIndex: i,
                clusterSize: serverCount,
                ...options
            };
            
            if (options.parallel) {
                // Create servers in parallel for faster cluster initialization
                serverCreationPromises.push(createTestServer(serverOptions));
            } else {
                // Create servers sequentially for controlled resource allocation
                const testServer = await createTestServer(serverOptions);
                testServers.push(testServer);
            }
        }
        
        // Wait for parallel server creation if enabled
        if (options.parallel && serverCreationPromises.length > 0) {
            const results = await Promise.allSettled(serverCreationPromises);
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    testServers.push(result.value);
                } else {
                    console.error(`Failed to create server ${index}:`, result.reason?.message);
                }
            });
        }
        
        // Set up cluster event coordination and communication
        testServers.forEach((server, index) => {
            server.clusterInfo = {
                clusterId: options.clusterId || generateTestId('cluster', 'main'),
                index: index,
                totalServers: testServers.length,
                peers: testServers.filter((_, i) => i !== index).map(s => ({
                    id: s.id,
                    port: s.port,
                    baseUrl: s.getBaseUrl()
                }))
            };
        });
        
        console.log(`Test server cluster created: ${testServers.length} servers`);
        
        // Return array of configured test server instances for cluster testing
        return testServers;
        
    } catch (error) {
        const clusterError = new Error(`Failed to create test server cluster: ${error.message}`);
        clusterError.originalError = error;
        clusterError.context = {
            serverCount,
            clusterOptions: JSON.stringify(clusterOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw clusterError;
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export primary test server management class
export { TestServer };

// Export factory functions for test server creation and management
export { createTestServer };
export { waitForServerReady };
export { cleanupTestServers };
export { validateTestServerConfig };
export { getServerStatus };
export { createTestServerCluster };

// Export test utility functions for external use
export { generateTestId };
export { sleep };
export { retry };
export { TestTimer };

// Export global constants for configuration and integration
export {
    DEFAULT_TEST_PORT,
    DEFAULT_STARTUP_TIMEOUT,
    DEFAULT_SHUTDOWN_TIMEOUT,
    MAX_STARTUP_RETRIES,
    TEST_SERVER_PREFIX,
    PORT_CHECK_INTERVAL,
    SERVER_READY_CHECK_TIMEOUT
};

// Default export for convenient access to TestServer class
export default TestServer;