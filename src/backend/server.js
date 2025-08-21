/**
 * Main Server Entry Point and Application Bootstrap for Node.js Tutorial HTTP Server
 * 
 * This file serves as the primary process entry point that initializes, starts, and manages 
 * the complete application lifecycle using the Application class. It demonstrates fundamental 
 * Node.js server patterns including process signal handling, graceful shutdown, error recovery, 
 * and production-ready application startup while maintaining educational clarity and showcasing 
 * industry-standard server initialization patterns.
 * 
 * Educational Objectives:
 * - Demonstrates proper server initialization and application lifecycle management
 * - Shows industry-standard process signal handling and graceful shutdown patterns
 * - Illustrates comprehensive error handling and recovery mechanisms for server startup
 * - Provides examples of production-ready logging and monitoring during application bootstrap
 * - Shows environment configuration validation and server readiness verification
 * - Demonstrates Node.js LTS features and modern server startup patterns
 * 
 * Production-Ready Features:
 * - Complete application lifecycle management with proper initialization phases
 * - Comprehensive process signal handling for graceful shutdown and restart scenarios
 * - Robust error handling with appropriate exit codes and cleanup procedures
 * - Performance monitoring and timing measurement during server startup
 * - Environment validation and configuration verification before application startup
 * - Structured logging with contextual information for operational monitoring
 * 
 * @fileoverview Main server entry point for Node.js tutorial HTTP server application
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// CORE MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Internal application modules for complete application lifecycle management
import { Application } from './app.js';
import { EnvironmentConfig } from './config/environment.js';
import { Logger } from './utils/logger.js';

// Import standardized response and error messages for consistent server communication
import { RESPONSE_MESSAGES } from './constants/response-messages.js';
import { 
    ERROR_MESSAGES,
    SERVER_ERROR_MESSAGES 
} from './constants/error-messages.js';

// Node.js built-in modules for process management and performance monitoring
import process from 'process'; // Node.js v22.x - Built-in process module for signal handling and environment access
import { performance } from 'node:perf_hooks'; // Node.js v22.x - Built-in performance measurement utilities

// ============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Server startup timeout in milliseconds for application initialization protection.
 * Prevents indefinite startup hanging and ensures timely server initialization.
 * 
 * @type {number}
 * @constant
 */
const SERVER_STARTUP_TIMEOUT = 30000; // 30 seconds

/**
 * Graceful shutdown timeout in milliseconds for clean application termination.
 * Allows sufficient time for active requests to complete before forced shutdown.
 * 
 * @type {number}
 * @constant
 */
const GRACEFUL_SHUTDOWN_TIMEOUT = 10000; // 10 seconds

/**
 * Process signals to handle for graceful shutdown and application management.
 * Implements industry-standard process signal handling for production deployment.
 * 
 * @type {string[]}
 * @constant
 */
const PROCESS_SIGNALS = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

/**
 * Server state definitions for application lifecycle tracking and monitoring.
 * Provides standardized state management for server lifecycle coordination.
 * 
 * @type {Object}
 * @constant
 */
const SERVER_STATES = {
    INITIALIZING: 'initializing',
    STARTING: 'starting',
    RUNNING: 'running',
    STOPPING: 'stopping',
    STOPPED: 'stopped',
    ERROR: 'error'
};

/**
 * Default exit codes for different application termination scenarios.
 * Follows UNIX/Linux exit code conventions for process management integration.
 * 
 * @type {Object}
 * @constant
 */
const DEFAULT_EXIT_CODES = {
    SUCCESS: 0,
    GENERAL_ERROR: 1,
    STARTUP_FAILURE: 2,
    CONFIGURATION_ERROR: 3,
    SHUTDOWN_TIMEOUT: 4
};

// ============================================================================
// GLOBAL STATE MANAGEMENT
// ============================================================================

/**
 * Global application instance reference for process signal handling and lifecycle management.
 * Maintains single application instance across the entire server process lifecycle.
 * 
 * @type {Application|null}
 */
let applicationInstance = null;

/**
 * Global logger instance for consistent logging across server lifecycle.
 * Provides centralized logging for server startup, operation, and shutdown phases.
 * 
 * @type {Logger|null}
 */
let serverLogger = null;

/**
 * Current server state for lifecycle tracking and process coordination.
 * Enables proper state management and prevents conflicting lifecycle operations.
 * 
 * @type {string}
 */
let currentServerState = SERVER_STATES.INITIALIZING;

/**
 * Graceful shutdown flag to coordinate shutdown procedures and prevent duplicate operations.
 * Ensures single graceful shutdown execution and prevents shutdown race conditions.
 * 
 * @type {boolean}
 */
let isShuttingDown = false;

/**
 * Server startup performance marker for timing measurement and monitoring.
 * Tracks server initialization performance for optimization and monitoring.
 * 
 * @type {number|null}
 */
let serverStartTime = null;

// ============================================================================
// CORE SERVER FACTORY AND INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Factory function that creates and configures a complete Application instance with 
 * environment configuration, validation, and readiness checks for server startup.
 * Demonstrates comprehensive application initialization patterns and dependency injection.
 * 
 * @param {Object} [serverOptions={}] - Server configuration options for application creation
 * @param {string} [serverOptions.logLevel] - Override log level for server logging
 * @param {boolean} [serverOptions.enableColors] - Enable colored console output
 * @param {Object} [serverOptions.envOverrides] - Environment variable overrides for testing
 * @returns {Application} Configured application instance ready for server startup and lifecycle management
 * 
 * @throws {Error} Throws error if environment validation fails or application creation fails
 * 
 * @example
 * const app = createServerInstance({ logLevel: 'DEBUG', enableColors: true });
 * await app.start();
 */
function createServerInstance(serverOptions = {}) {
    try {
        serverLogger.info('Creating server application instance', {
            options: serverOptions,
            state: currentServerState,
            timestamp: new Date().toISOString()
        });

        // Create and validate EnvironmentConfig instance with current environment variables
        const envConfig = new EnvironmentConfig(serverOptions.envOverrides);
        
        // Validate complete environment configuration before proceeding
        if (!envConfig.validate()) {
            throw new Error('Environment configuration validation failed');
        }

        serverLogger.info('Environment configuration validated successfully', {
            isDev: envConfig.isDev,
            serverConfig: envConfig.getServerConfig()
        });

        // Initialize Logger with server-specific configuration and appropriate log levels
        const logConfig = {
            logLevel: serverOptions.logLevel || envConfig.getLogConfig().level,
            enableColors: serverOptions.enableColors !== undefined ? 
                serverOptions.enableColors : envConfig.getLogConfig().colors,
            appConfig: envConfig
        };
        
        const appLogger = new Logger(logConfig);

        // Create Application instance with validated configuration and component integration
        const application = new Application({
            environmentConfig: envConfig,
            logger: appLogger,
            serverOptions: serverOptions
        });

        // Validate complete application configuration and component readiness
        if (!application.getHealthStatus || typeof application.getHealthStatus !== 'function') {
            throw new Error('Application instance missing required health check capabilities');
        }

        // Perform pre-startup health checks and dependency validation
        const healthStatus = application.getHealthStatus();
        if (!healthStatus.healthy) {
            throw new Error(`Application health check failed: ${healthStatus.message}`);
        }

        serverLogger.info('Application instance created and validated successfully', {
            applicationInfo: application.getApplicationInfo(),
            healthStatus: healthStatus,
            componentIntegration: 'complete'
        });

        // Return configured Application instance ready for server lifecycle management
        return application;

    } catch (error) {
        const errorMessage = `Failed to create server instance: ${error.message}`;
        if (serverLogger) {
            serverLogger.error(errorMessage, {
                error: error.message,
                stack: error.stack,
                serverOptions,
                currentState: currentServerState
            }, error);
        } else {
            console.error(errorMessage, error);
        }
        throw error;
    }
}

/**
 * Configures comprehensive process signal handlers for graceful shutdown, process management,
 * and error recovery with timeout protection and proper cleanup. Implements production-ready
 * signal handling patterns for reliable server operation and maintenance.
 * 
 * @param {Application} application - Application instance for lifecycle management
 * @param {Logger} logger - Logger instance for signal handling events and error reporting
 * @returns {void} Sets up signal handlers on process for graceful shutdown and process management
 * 
 * @example
 * setupProcessSignalHandlers(applicationInstance, serverLogger);
 */
function setupProcessSignalHandlers(application, logger) {
    try {
        logger.info('Setting up process signal handlers', {
            signals: PROCESS_SIGNALS,
            timeout: GRACEFUL_SHUTDOWN_TIMEOUT,
            currentPid: process.pid
        });

        // Set up SIGTERM handler for graceful shutdown with timeout protection
        process.on('SIGTERM', async (signal) => {
            logger.info('SIGTERM signal received - initiating graceful shutdown', {
                signal,
                isShuttingDown,
                currentState: currentServerState
            });

            if (!isShuttingDown) {
                await performGracefulShutdown(application, logger, {
                    reason: 'SIGTERM signal',
                    timeout: GRACEFUL_SHUTDOWN_TIMEOUT
                });
            }
        });

        // Configure SIGINT handler for development interrupt handling and cleanup
        process.on('SIGINT', async (signal) => {
            logger.info('SIGINT signal received - initiating graceful shutdown', {
                signal,
                isShuttingDown,
                currentState: currentServerState
            });

            if (!isShuttingDown) {
                await performGracefulShutdown(application, logger, {
                    reason: 'SIGINT signal (Ctrl+C)',
                    timeout: GRACEFUL_SHUTDOWN_TIMEOUT
                });
            }
        });

        // Set up SIGUSR2 handler for application reload and configuration refresh
        process.on('SIGUSR2', async (signal) => {
            logger.info('SIGUSR2 signal received - initiating application reload', {
                signal,
                currentState: currentServerState
            });

            if (application.isRunning && application.isRunning()) {
                logger.info('Reloading application configuration', {
                    reason: 'SIGUSR2 signal',
                    uptime: process.uptime()
                });
                
                // Perform configuration reload without full restart
                try {
                    await application.reload();
                    logger.info('Application configuration reloaded successfully');
                } catch (error) {
                    logger.error('Failed to reload application configuration', {
                        error: error.message
                    }, error);
                }
            }
        });

        // Configure unhandled exception handlers for error recovery and logging
        process.on('uncaughtException', (error) => {
            logger.fatal('Uncaught exception detected', {
                error: error.message,
                stack: error.stack,
                currentState: currentServerState,
                uptime: process.uptime()
            }, error);

            // Attempt graceful shutdown on critical errors
            handleServerError(error, logger, 'uncaughtException');
        });

        // Set up unhandled promise rejection handlers for async error management
        process.on('unhandledRejection', (reason, promise) => {
            logger.fatal('Unhandled promise rejection detected', {
                reason: reason?.message || reason,
                promise: promise.toString(),
                currentState: currentServerState,
                uptime: process.uptime()
            });

            // Convert promise rejection to error for consistent handling
            const rejectionError = reason instanceof Error ? reason : new Error(reason);
            handleServerError(rejectionError, logger, 'unhandledRejection');
        });

        // Configure process exit handlers for final cleanup and resource deallocation
        process.on('exit', (code) => {
            const exitMessage = `Process exiting with code ${code}`;
            
            // Synchronous logging only since process is exiting
            console.log(`[INFO ] ${new Date().toISOString()} - ${exitMessage}`, JSON.stringify({
                exitCode: code,
                finalState: currentServerState,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            }));
        });

        logger.info('Process signal handlers configured successfully', {
            handledSignals: PROCESS_SIGNALS,
            exceptionHandling: 'enabled',
            rejectionHandling: 'enabled',
            exitHandling: 'enabled'
        });

    } catch (error) {
        logger.error('Failed to setup process signal handlers', {
            error: error.message,
            stack: error.stack
        }, error);
        throw error;
    }
}

/**
 * Executes complete server startup sequence including application initialization, component startup,
 * health validation, and readiness confirmation with comprehensive error handling and performance
 * monitoring. Demonstrates production-ready server startup patterns and timing measurement.
 * 
 * @param {Application} application - Application instance to start and manage
 * @param {Logger} logger - Logger instance for startup event tracking and error reporting
 * @param {Object} [startupOptions={}] - Startup configuration options and behavior control
 * @param {number} [startupOptions.timeout] - Startup timeout override in milliseconds
 * @param {boolean} [startupOptions.healthCheck] - Enable health validation after startup
 * @returns {Promise<void>} Resolves when server is fully started and ready, rejects on startup errors
 * 
 * @throws {Error} Throws error if startup fails or timeout is exceeded
 * 
 * @example
 * await performServerStartup(app, logger, { timeout: 60000, healthCheck: true });
 */
async function performServerStartup(application, logger, startupOptions = {}) {
    try {
        // Record startup start time using performance.mark for timing measurement
        const startupStartTime = performance.now();
        serverStartTime = Date.now();
        
        // Update server state to starting phase
        currentServerState = SERVER_STATES.STARTING;

        // Log server startup initiation with environment and configuration details
        logger.info('Server startup sequence initiated', {
            state: currentServerState,
            startupOptions,
            environment: process.env.NODE_ENV || 'development',
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid,
            startTime: new Date(serverStartTime).toISOString()
        });

        // Create startup timeout protection to prevent indefinite hanging
        const timeout = startupOptions.timeout || SERVER_STARTUP_TIMEOUT;
        const startupPromise = application.start();
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Server startup exceeded timeout of ${timeout}ms`));
            }, timeout);
        });

        // Start Application using application.start() with startup options and timeout protection
        await Promise.race([startupPromise, timeoutPromise]);

        // Wait for Application to reach running state with health validation
        let healthCheckAttempts = 0;
        const maxHealthCheckAttempts = 10;
        
        while (healthCheckAttempts < maxHealthCheckAttempts) {
            if (application.isRunning && application.isRunning()) {
                currentServerState = SERVER_STATES.RUNNING;
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms wait
            healthCheckAttempts++;
        }

        if (currentServerState !== SERVER_STATES.RUNNING) {
            throw new Error('Application failed to reach running state within expected timeframe');
        }

        // Perform post-startup health checks using application.getHealthStatus()
        if (startupOptions.healthCheck !== false) {
            const healthStatus = application.getHealthStatus();
            
            if (!healthStatus.healthy) {
                throw new Error(`Health check failed after startup: ${healthStatus.message}`);
            }

            logger.info('Post-startup health check completed successfully', {
                healthStatus,
                componentsHealthy: healthStatus.components || {},
                systemReady: true
            });
        }

        // Calculate startup performance metrics
        const startupEndTime = performance.now();
        const startupDuration = startupEndTime - startupStartTime;

        // Log successful server startup with performance metrics and application information
        logger.info('Server startup completed successfully', {
            state: currentServerState,
            startupDuration: `${startupDuration.toFixed(2)}ms`,
            applicationInfo: application.getApplicationInfo(),
            healthStatus: application.getHealthStatus(),
            serverReady: true,
            acceptingConnections: true,
            uptime: process.uptime()
        });

        // Update global state references for signal handlers
        applicationInstance = application;

        logger.info(RESPONSE_MESSAGES.SERVER_READY, {
            serverState: SERVER_STATES.RUNNING,
            readinessConfirmed: true
        });

    } catch (error) {
        currentServerState = SERVER_STATES.ERROR;
        
        const startupError = new Error(`Server startup failed: ${error.message}`);
        startupError.originalError = error;
        startupError.startupPhase = currentServerState;
        
        logger.error(SERVER_ERROR_MESSAGES.STARTUP_ERROR, {
            error: error.message,
            stack: error.stack,
            startupOptions,
            currentState: currentServerState,
            startupDuration: serverStartTime ? Date.now() - serverStartTime : 0
        }, startupError);
        
        throw startupError;
    }
}

/**
 * Executes graceful server shutdown sequence including active request completion, component cleanup,
 * resource deallocation, and process termination with timeout protection. Implements production-ready
 * graceful shutdown patterns for reliable application termination.
 * 
 * @param {Application} application - Application instance to shutdown gracefully
 * @param {Logger} logger - Logger instance for shutdown event tracking and monitoring
 * @param {Object} [shutdownOptions={}] - Shutdown configuration options and behavior control
 * @param {string} [shutdownOptions.reason] - Reason for shutdown for audit logging
 * @param {number} [shutdownOptions.timeout] - Shutdown timeout override in milliseconds
 * @returns {Promise<void>} Resolves when shutdown is complete, rejects on shutdown timeout
 * 
 * @throws {Error} Throws error if graceful shutdown fails or timeout is exceeded
 * 
 * @example
 * await performGracefulShutdown(app, logger, { reason: 'SIGTERM', timeout: 15000 });
 */
async function performGracefulShutdown(application, logger, shutdownOptions = {}) {
    try {
        // Prevent duplicate shutdown operations
        if (isShuttingDown) {
            logger.warn('Graceful shutdown already in progress', {
                currentState: currentServerState,
                shutdownOptions
            });
            return;
        }

        isShuttingDown = true;
        currentServerState = SERVER_STATES.STOPPING;
        
        const shutdownStartTime = performance.now();

        // Log graceful shutdown initiation with reason and timeout settings
        logger.info(RESPONSE_MESSAGES.SERVER_STOPPING, {
            reason: shutdownOptions.reason || 'Manual shutdown',
            timeout: shutdownOptions.timeout || GRACEFUL_SHUTDOWN_TIMEOUT,
            currentState: currentServerState,
            uptime: process.uptime(),
            shutdownInitiated: new Date().toISOString()
        });

        // Create shutdown timeout protection
        const timeout = shutdownOptions.timeout || GRACEFUL_SHUTDOWN_TIMEOUT;
        const shutdownPromise = application.stop();
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Graceful shutdown exceeded timeout of ${timeout}ms`));
            }, timeout);
        });

        // Stop Application using application.stop() with graceful shutdown options
        await Promise.race([shutdownPromise, timeoutPromise]);

        // Wait for Application shutdown completion with configurable timeout protection
        let shutdownCheckAttempts = 0;
        const maxShutdownCheckAttempts = 50; // 5 seconds total with 100ms intervals
        
        while (shutdownCheckAttempts < maxShutdownCheckAttempts) {
            if (!application.isRunning || !application.isRunning()) {
                currentServerState = SERVER_STATES.STOPPED;
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms wait
            shutdownCheckAttempts++;
        }

        // Perform final cleanup including resource deallocation and component cleanup
        await application.cleanup?.() || Promise.resolve();

        // Calculate shutdown performance metrics
        const shutdownEndTime = performance.now();
        const shutdownDuration = shutdownEndTime - shutdownStartTime;
        const totalUptime = process.uptime();

        // Log successful shutdown completion with uptime statistics and final metrics
        logger.info(RESPONSE_MESSAGES.SERVER_STOPPED, {
            shutdownDuration: `${shutdownDuration.toFixed(2)}ms`,
            totalUptime: `${totalUptime.toFixed(1)}s`,
            finalState: currentServerState,
            shutdownReason: shutdownOptions.reason,
            shutdownCompleted: new Date().toISOString(),
            gracefulShutdown: true
        });

        // Flush any pending log messages before process termination
        await logger.flush();

        // Set successful exit code for process termination
        process.exitCode = DEFAULT_EXIT_CODES.SUCCESS;

    } catch (error) {
        const shutdownError = new Error(`Graceful shutdown failed: ${error.message}`);
        shutdownError.originalError = error;
        
        logger.error(ERROR_MESSAGES.SERVER_ERROR, {
            error: error.message,
            stack: error.stack,
            shutdownOptions,
            currentState: currentServerState,
            isTimeout: error.message.includes('timeout')
        }, shutdownError);

        // Force shutdown if graceful shutdown fails
        logger.warn('Forcing server shutdown due to graceful shutdown failure');
        process.exitCode = DEFAULT_EXIT_CODES.SHUTDOWN_TIMEOUT;
        
        throw shutdownError;
    }
}

/**
 * Comprehensive server error handler that manages startup errors, runtime errors, and critical
 * failures with appropriate logging, recovery attempts, and process management. Implements
 * robust error handling patterns for reliable server operation and error recovery.
 * 
 * @param {Error} error - Error object with stack trace and error details
 * @param {Logger} logger - Logger instance for error reporting and context logging
 * @param {string} context - Error context description for debugging and categorization
 * @returns {void} Handles error with appropriate logging and process management actions
 * 
 * @example
 * handleServerError(startupError, logger, 'server_initialization');
 */
function handleServerError(error, logger, context) {
    try {
        // Log error details with full context including stack trace and system state
        logger.error('Server error encountered', {
            errorName: error.name,
            errorMessage: error.message,
            errorType: error.constructor.name,
            context,
            currentState: currentServerState,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        }, error);

        // Determine error severity and appropriate response based on error type
        let errorSeverity = 'medium';
        let shouldAttemptRecovery = false;
        let exitCode = DEFAULT_EXIT_CODES.GENERAL_ERROR;

        // Classify error severity based on error characteristics
        if (error.message.includes('EADDRINUSE') || error.message.includes('port')) {
            errorSeverity = 'high';
            exitCode = DEFAULT_EXIT_CODES.STARTUP_FAILURE;
            logger.error('Port binding error detected - server cannot start', {
                errorType: 'PORT_BINDING_ERROR',
                recommendedAction: 'Check if port 3000 is already in use'
            });
        } else if (error.message.includes('configuration') || error.message.includes('environment')) {
            errorSeverity = 'high';
            exitCode = DEFAULT_EXIT_CODES.CONFIGURATION_ERROR;
            logger.error('Configuration error detected', {
                errorType: 'CONFIGURATION_ERROR',
                recommendedAction: 'Verify environment configuration and settings'
            });
        } else if (context === 'startup' || currentServerState === SERVER_STATES.STARTING) {
            errorSeverity = 'critical';
            exitCode = DEFAULT_EXIT_CODES.STARTUP_FAILURE;
        } else if (applicationInstance && applicationInstance.isHealthy && applicationInstance.isHealthy()) {
            shouldAttemptRecovery = true;
            errorSeverity = 'low';
        }

        // Attempt error recovery for recoverable errors using application health checks
        if (shouldAttemptRecovery && applicationInstance) {
            logger.info('Attempting error recovery', {
                errorSeverity,
                recoveryStrategy: 'health_check_based',
                applicationHealthy: applicationInstance.isHealthy()
            });

            try {
                const healthStatus = applicationInstance.getHealthStatus();
                if (healthStatus.healthy) {
                    logger.info('Error recovery successful - application remains healthy', {
                        healthStatus,
                        recoveryCompleted: true
                    });
                    return; // Recovery successful, continue operation
                }
            } catch (recoveryError) {
                logger.error('Error recovery attempt failed', {
                    recoveryError: recoveryError.message,
                    originalError: error.message
                }, recoveryError);
            }
        }

        // Initiate graceful shutdown for critical errors with timeout protection
        if (errorSeverity === 'critical' || errorSeverity === 'high') {
            logger.warn('Critical error detected - initiating graceful shutdown', {
                errorSeverity,
                shutdownReason: `Critical error: ${context}`,
                exitCode
            });

            if (applicationInstance && !isShuttingDown) {
                performGracefulShutdown(applicationInstance, logger, {
                    reason: `Critical error: ${context}`,
                    timeout: GRACEFUL_SHUTDOWN_TIMEOUT / 2 // Shorter timeout for error scenarios
                }).catch((shutdownError) => {
                    logger.fatal('Failed to perform graceful shutdown after critical error', {
                        originalError: error.message,
                        shutdownError: shutdownError.message
                    });
                }).finally(() => {
                    // Set appropriate process exit code based on error category and severity
                    process.exitCode = exitCode;
                });
            } else {
                // Set appropriate process exit code based on error category and severity
                process.exitCode = exitCode;
            }
        }

        // Perform final error logging and cleanup before process termination
        logger.error('Server error handling completed', {
            errorSeverity,
            recoveryAttempted: shouldAttemptRecovery,
            shutdownInitiated: errorSeverity === 'critical' || errorSeverity === 'high',
            exitCode: process.exitCode,
            finalState: currentServerState
        });

    } catch (handlingError) {
        // Fallback error handling if primary error handling fails
        console.error('Error handler failed:', handlingError.message);
        console.error('Original error:', error.message);
        process.exitCode = DEFAULT_EXIT_CODES.GENERAL_ERROR;
    }
}

/**
 * Validates server environment including Node.js version compatibility, environment variables,
 * system resources, and configuration requirements before startup. Implements comprehensive
 * environment validation for reliable server operation and configuration verification.
 * 
 * @param {EnvironmentConfig} envConfig - Environment configuration instance for validation
 * @param {Logger} logger - Logger instance for validation event reporting and error logging
 * @returns {boolean} True if environment is valid for server startup, false otherwise
 * 
 * @example
 * const isValid = validateServerEnvironment(envConfig, logger);
 * if (!isValid) process.exit(3);
 */
function validateServerEnvironment(envConfig, logger) {
    try {
        logger.info('Starting server environment validation', {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            validationStarted: new Date().toISOString()
        });

        // Validate Node.js version against LTS requirements and compatibility matrix
        const requiredNodeVersion = '20.0.0';
        const currentVersion = process.version.slice(1); // Remove 'v' prefix
        
        const versionValid = compareVersions(currentVersion, requiredNodeVersion) >= 0;
        if (!versionValid) {
            logger.error('Node.js version compatibility check failed', {
                currentVersion: process.version,
                requiredVersion: `>= ${requiredNodeVersion}`,
                recommendation: 'Upgrade to Node.js LTS version'
            });
            return false;
        }

        logger.info('Node.js version compatibility validated', {
            currentVersion: process.version,
            compatibilityStatus: 'compatible'
        });

        // Check environment configuration using envConfig.validate() method
        if (!envConfig.validate()) {
            logger.error('Environment configuration validation failed', {
                configurationStatus: 'invalid',
                recommendation: 'Check environment variables and configuration files'
            });
            return false;
        }

        logger.info('Environment configuration validated successfully', {
            configurationStatus: 'valid',
            isDevelopment: envConfig.isDev
        });

        // Verify system resources including available memory and network ports
        const memoryUsage = process.memoryUsage();
        const minimumMemory = 50 * 1024 * 1024; // 50MB minimum
        
        if (memoryUsage.heapTotal < minimumMemory) {
            logger.warn('Low memory condition detected', {
                currentMemory: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                minimumRequired: `${Math.round(minimumMemory / 1024 / 1024)}MB`,
                recommendation: 'Monitor memory usage during operation'
            });
        }

        // Validate required environment variables and configuration completeness
        const serverConfig = envConfig.getServerConfig();
        if (!serverConfig.port || !serverConfig.host) {
            logger.error('Server configuration incomplete', {
                port: serverConfig.port,
                host: serverConfig.host,
                recommendation: 'Verify server configuration completeness'
            });
            return false;
        }

        // Check platform compatibility and deployment requirements
        const supportedPlatforms = ['linux', 'darwin', 'win32'];
        if (!supportedPlatforms.includes(process.platform)) {
            logger.warn('Platform compatibility warning', {
                currentPlatform: process.platform,
                supportedPlatforms,
                recommendation: 'Verify platform-specific functionality'
            });
        }

        logger.info('Server environment validation completed successfully', {
            validationResult: 'success',
            nodeVersion: process.version,
            platform: process.platform,
            memoryAvailable: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            configurationValid: true,
            serverConfig: {
                port: serverConfig.port,
                host: serverConfig.host,
                environment: envConfig.isDev ? 'development' : 'production'
            }
        });

        // Return validation result with detailed error information if validation fails
        return true;

    } catch (error) {
        logger.error('Environment validation failed with exception', {
            error: error.message,
            stack: error.stack,
            validationPhase: 'exception_occurred'
        }, error);
        return false;
    }
}

// ============================================================================
// UTILITY HELPER FUNCTIONS
// ============================================================================

/**
 * Compares two semantic version strings for compatibility checking.
 * Implements basic semantic version comparison for Node.js version validation.
 * 
 * @param {string} version1 - First version string to compare
 * @param {string} version2 - Second version string to compare  
 * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 * 
 * @example
 * const result = compareVersions('20.1.0', '18.0.0'); // Returns 1
 */
function compareVersions(version1, version2) {
    try {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        
        return 0;
    } catch (error) {
        return 0; // Default to equal if comparison fails
    }
}

/**
 * Creates a unique request correlation ID for request tracking and debugging.
 * Generates unique identifiers for request correlation and distributed tracing.
 * 
 * @returns {string} Unique correlation ID for request tracking
 * 
 * @example
 * const requestId = createCorrelationId(); // Returns: "req_1234567890_abc123"
 */
function createCorrelationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `req_${timestamp}_${random}`;
}

// ============================================================================
// MAIN APPLICATION BOOTSTRAP AND EXECUTION
// ============================================================================

/**
 * Main application bootstrap function that orchestrates complete server initialization,
 * component integration, and lifecycle management. Serves as the primary entry point
 * for the Node.js tutorial HTTP server application.
 * 
 * @async
 * @returns {Promise<void>} Resolves when server is running successfully
 * 
 * @throws {Error} Throws error if bootstrap process fails at any stage
 */
async function bootstrapServer() {
    let startupLogger = null;
    
    try {
        // Initialize minimal logger for bootstrap logging before full application setup
        startupLogger = new Logger({
            logLevel: process.env.LOG_LEVEL || 'INFO',
            enableColors: process.stdout.isTTY && process.env.NODE_ENV !== 'production'
        });
        
        serverLogger = startupLogger;
        
        // Update server state to initializing
        currentServerState = SERVER_STATES.INITIALIZING;
        
        startupLogger.info('Node.js tutorial server bootstrap initiated', {
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid,
            environment: process.env.NODE_ENV || 'development',
            workingDirectory: process.cwd(),
            bootstrapStarted: new Date().toISOString()
        });

        // Create environment configuration and validate server environment
        const envConfig = new EnvironmentConfig();
        
        if (!validateServerEnvironment(envConfig, startupLogger)) {
            throw new Error('Server environment validation failed');
        }

        // Create application instance with validated configuration
        const serverOptions = {
            logLevel: envConfig.getLogConfig().level,
            enableColors: envConfig.getLogConfig().colors
        };
        
        const application = createServerInstance(serverOptions);
        
        // Setup process signal handlers for graceful lifecycle management
        setupProcessSignalHandlers(application, startupLogger);
        
        // Execute complete server startup sequence
        await performServerStartup(application, startupLogger, {
            timeout: SERVER_STARTUP_TIMEOUT,
            healthCheck: true
        });

        startupLogger.info('Node.js tutorial server bootstrap completed successfully', {
            state: currentServerState,
            bootstrapCompleted: new Date().toISOString(),
            serverReady: true,
            applicationInfo: application.getApplicationInfo(),
            uptime: process.uptime()
        });

    } catch (error) {
        const bootstrapError = new Error(`Server bootstrap failed: ${error.message}`);
        bootstrapError.originalError = error;
        
        if (startupLogger) {
            startupLogger.fatal('Server bootstrap process failed', {
                error: error.message,
                stack: error.stack,
                currentState: currentServerState,
                bootstrapPhase: 'failed',
                timestamp: new Date().toISOString()
            }, bootstrapError);
        } else {
            console.error('Bootstrap failed before logging initialization:', error.message);
        }

        // Handle bootstrap error with appropriate error management
        handleServerError(bootstrapError, startupLogger || console, 'bootstrap');
        
        // Exit process with appropriate error code
        process.exit(DEFAULT_EXIT_CODES.STARTUP_FAILURE);
    }
}

// ============================================================================
// PROCESS ENTRY POINT AND APPLICATION EXECUTION
// ============================================================================

/**
 * Main process entry point - executes server bootstrap when module is run directly.
 * Implements proper entry point detection and application startup coordination
 * for production-ready server initialization.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    // Mark server startup time for performance measurement
    performance.mark('server-bootstrap-start');
    
    // Execute main bootstrap function with comprehensive error handling
    bootstrapServer().catch((error) => {
        console.error('Fatal error during server bootstrap:', error.message);
        console.error('Process will exit with error code:', DEFAULT_EXIT_CODES.STARTUP_FAILURE);
        process.exit(DEFAULT_EXIT_CODES.STARTUP_FAILURE);
    });
}

// ============================================================================
// MODULE EXPORTS FOR TESTING AND INTEGRATION
// ============================================================================

// Export factory functions for testing and external usage
export { 
    createServerInstance,
    setupProcessSignalHandlers,
    performServerStartup,
    performGracefulShutdown,
    handleServerError,
    validateServerEnvironment
};

// Export global constants for configuration and testing
export {
    SERVER_STARTUP_TIMEOUT,
    GRACEFUL_SHUTDOWN_TIMEOUT,
    PROCESS_SIGNALS,
    SERVER_STATES,
    DEFAULT_EXIT_CODES
};

// Export utility functions for testing and debugging
export {
    createCorrelationId,
    compareVersions
};

// Default export for comprehensive server bootstrap functionality
export default {
    bootstrap: bootstrapServer,
    createInstance: createServerInstance,
    setupSignalHandlers: setupProcessSignalHandlers,
    startup: performServerStartup,
    shutdown: performGracefulShutdown,
    errorHandler: handleServerError,
    validateEnvironment: validateServerEnvironment,
    constants: {
        SERVER_STARTUP_TIMEOUT,
        GRACEFUL_SHUTDOWN_TIMEOUT,
        PROCESS_SIGNALS,
        SERVER_STATES,
        DEFAULT_EXIT_CODES
    }
};