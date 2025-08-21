/**
 * Application Startup Script for Node.js Tutorial HTTP Server
 * 
 * Serves as the primary entry point for launching the Node.js tutorial HTTP server application.
 * Provides simple, direct server startup functionality with minimal configuration, environment 
 * setup, and comprehensive error handling. Demonstrates educational startup patterns while 
 * implementing production-ready application initialization including server bootstrap, graceful 
 * shutdown handling, and basic monitoring integration.
 * 
 * This startup script coordinates the complete application lifecycle from initialization through
 * graceful shutdown, providing robust error handling, environment validation, and detailed
 * logging for both development debugging and production monitoring.
 * 
 * Key Features:
 * - Complete application bootstrap and component initialization
 * - Environment configuration validation and setup
 * - Comprehensive error handling with detailed logging and recovery
 * - Graceful shutdown handling for production signal management
 * - Educational clarity demonstrating startup best practices
 * - Production-ready monitoring and logging integration
 * 
 * Educational Objectives:
 * - Demonstrates proper Node.js application startup patterns
 * - Shows environment variable handling and configuration validation
 * - Illustrates comprehensive error handling for startup scenarios
 * - Demonstrates process lifecycle management and graceful shutdown
 * - Shows logging integration for startup events and monitoring
 * 
 * @fileoverview Application startup script for Node.js tutorial HTTP server
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import main server bootstrap function for complete application startup and lifecycle management
import { bootstrapServer, setupProcessSignalHandlers, handleServerError } from '../server.js';

// Import environment configuration management with validation and typed access to configuration values
import { EnvironmentConfig } from '../config/environment.js';

// Import centralized logging utility with structured console-based logging for startup events and error tracking
import { Logger } from '../utils/logger.js';

// Import standardized response message constants for consistent startup messaging
import { RESPONSE_MESSAGES } from '../constants/response-messages.js';

// Import standardized error message constants for consistent startup error handling
import { ERROR_MESSAGES } from '../constants/error-messages.js';

// Import Node.js built-in process module for environment variables and process management
import process from 'node:process'; // Node.js v20.x - Built-in process management utilities

// ============================================================================
// GLOBAL STARTUP CONSTANTS
// ============================================================================

/**
 * Startup script name for logging and identification purposes.
 */
const SCRIPT_NAME = 'start.js';

/**
 * Maximum startup timeout in milliseconds for server initialization and readiness.
 */
const STARTUP_TIMEOUT = 5000;

/**
 * Process exit code for error conditions and startup failures.
 */
const ERROR_EXIT_CODE = 1;

/**
 * Process exit code for successful startup completion.
 */
const SUCCESS_EXIT_CODE = 0;

// ============================================================================
// STARTUP FUNCTIONS
// ============================================================================

/**
 * Main startup function that initializes environment configuration, sets up logging, and 
 * starts the Node.js tutorial server with comprehensive error handling and graceful shutdown support.
 * 
 * Coordinates the complete application startup sequence including environment validation,
 * component initialization, server startup, and graceful shutdown configuration.
 * 
 * @returns {Promise} Promise that resolves when application startup is complete or rejects with startup error
 */
async function startApplication() {
    const startupStartTime = Date.now();
    let environmentConfig = null;
    let logger = null;
    
    try {
        // Phase 1: Environment and Configuration Initialization with Validation
        console.log(`[${SCRIPT_NAME}] Initializing application startup sequence...`);
        
        // Initialize environment configuration using EnvironmentConfig class with validation
        environmentConfig = new EnvironmentConfig();
        
        // Validate environment configuration and check for required settings
        const configValidation = environmentConfig.validate();
        if (!configValidation.isValid) {
            throw new Error(`Environment configuration validation failed: ${configValidation.errors.join(', ')}`);
        }
        
        // Validate startup environment including environment variables and system prerequisites
        const environmentValid = await validateStartupEnvironment(environmentConfig);
        if (!environmentValid) {
            throw new Error('Startup environment validation failed - check environment variables and system requirements');
        }
        
        // Create logger instance with startup-specific configuration settings
        logger = new Logger({
            appConfig: environmentConfig,
            logLevel: environmentConfig.getLogLevel(),
            enableColors: true
        });
        
        // Log startup initiation with script name and environment information
        await logStartupBanner(logger, environmentConfig);
        
        logger.info('Environment configuration initialized successfully', {
            scriptName: SCRIPT_NAME,
            nodeEnv: environmentConfig.getNodeEnv(),
            serverPort: environmentConfig.getPort(),
            logLevel: environmentConfig.getLogLevel()
        });
        
        // Phase 2: Application Startup using Server Bootstrap Function
        logger.info('Starting application server bootstrap sequence', {
            scriptName: SCRIPT_NAME,
            startupTimeout: STARTUP_TIMEOUT
        });
        
        // Call bootstrapServer function from server.js to bootstrap complete application
        const serverBootstrapPromise = bootstrapServer({
            environmentConfig: environmentConfig,
            logger: logger,
            enableGracefulShutdown: true,
            startupTimeout: STARTUP_TIMEOUT
        });
        
        // Wait for server startup completion with timeout protection
        const startupTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Server startup timeout exceeded (${STARTUP_TIMEOUT}ms)`));
            }, STARTUP_TIMEOUT);
        });
        
        const serverInstance = await Promise.race([
            serverBootstrapPromise,
            startupTimeoutPromise
        ]);
        
        // Set up graceful shutdown handlers using setupProcessSignalHandlers function
        setupProcessSignalHandlers(serverInstance, {
            logger: logger,
            gracefulShutdownTimeout: 10000,
            enableSignalLogging: true
        });
        
        // Log successful startup completion with server information
        const startupDuration = Date.now() - startupStartTime;
        const serverConfig = environmentConfig.getServerConfig();
        
        logger.logServerStartup({
            scriptName: SCRIPT_NAME,
            serverPort: serverConfig.port,
            serverHost: serverConfig.hostname,
            startupDuration: `${startupDuration}ms`,
            nodeEnv: environmentConfig.getNodeEnv(),
            processId: process.pid,
            message: RESPONSE_MESSAGES.SERVER_READY
        });
        
        logger.info('Application startup completed successfully', {
            scriptName: SCRIPT_NAME,
            applicationReady: true,
            startupDuration: `${startupDuration}ms`,
            serverStatus: 'listening',
            gracefulShutdownEnabled: true
        });
        
        // Return resolved promise indicating successful application startup and readiness
        return Promise.resolve();
        
    } catch (error) {
        // Phase 3: Comprehensive Error Handling for Startup Failures
        const startupDuration = Date.now() - startupStartTime;
        
        // Handle startup script errors with comprehensive error logging and cleanup procedures
        await handleScriptError(error, logger || console, {
            scriptName: SCRIPT_NAME,
            startupDuration: `${startupDuration}ms`,
            environmentConfig: environmentConfig
        });
        
        // Return rejected promise with startup error for monitoring and debugging
        return Promise.reject(error);
    }
}

/**
 * Validates the startup environment including environment variables, required settings, and 
 * system prerequisites for successful application launch.
 * 
 * Performs comprehensive validation of the runtime environment to ensure all required
 * configuration is present and valid before attempting application startup.
 * 
 * @param {EnvironmentConfig} environmentConfig - Environment configuration instance for validation
 * @returns {boolean} true if environment is valid for startup, false otherwise
 */
async function validateStartupEnvironment(environmentConfig) {
    const validationStartTime = Date.now();
    
    try {
        // Check environment configuration completeness using EnvironmentConfig.validate() method
        const configValidation = environmentConfig.validate();
        if (!configValidation.isValid) {
            console.error(`[${SCRIPT_NAME}] Environment configuration validation failed:`, configValidation.errors);
            return false;
        }
        
        // Verify required environment variables are present and valid
        const requiredEnvVars = ['NODE_ENV'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.error(`[${SCRIPT_NAME}] Missing required environment variables:`, missingVars);
            return false;
        }
        
        // Validate port availability and network configuration
        const serverConfig = environmentConfig.getServerConfig();
        const portNumber = parseInt(serverConfig.port, 10);
        
        if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
            console.error(`[${SCRIPT_NAME}] Invalid port configuration: ${serverConfig.port}`);
            return false;
        }
        
        if (portNumber < 1024 && process.getuid && process.getuid() !== 0) {
            console.warn(`[${SCRIPT_NAME}] Warning: Port ${portNumber} requires elevated privileges`);
        }
        
        // Check Node.js version compatibility and runtime requirements
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
        
        if (majorVersion < 18) {
            console.error(`[${SCRIPT_NAME}] Node.js version ${nodeVersion} is not supported. Minimum required: v18.0.0`);
            return false;
        }
        
        // Validate memory and system resource availability for application operation
        const memoryUsage = process.memoryUsage();
        const availableMemory = memoryUsage.heapTotal;
        const minimumMemory = 64 * 1024 * 1024; // 64MB minimum
        
        if (availableMemory < minimumMemory) {
            console.warn(`[${SCRIPT_NAME}] Warning: Low memory availability. Available: ${Math.round(availableMemory / 1024 / 1024)}MB`);
        }
        
        const validationDuration = Date.now() - validationStartTime;
        
        // Log successful environment validation with system information and configuration details
        console.log(`[${SCRIPT_NAME}] Environment validation completed successfully in ${validationDuration}ms`);
        console.log(`[${SCRIPT_NAME}] Node.js version: ${nodeVersion}, Platform: ${process.platform}, Arch: ${process.arch}`);
        console.log(`[${SCRIPT_NAME}] Environment: ${environmentConfig.getNodeEnv()}, Port: ${serverConfig.port}`);
        
        // Return validation result with specific error details if validation fails
        return true;
        
    } catch (error) {
        const validationDuration = Date.now() - validationStartTime;
        
        console.error(`[${SCRIPT_NAME}] Environment validation failed after ${validationDuration}ms:`, error.message);
        
        // Return false for validation failure with error context for debugging
        return false;
    }
}

/**
 * Handles startup script errors with comprehensive error logging, cleanup procedures, and 
 * appropriate process termination with error codes.
 * 
 * Provides detailed error analysis, cleanup operations, and proper process termination
 * with exit codes for monitoring systems and process management.
 * 
 * @param {Error} error - Error object from startup failure
 * @param {Logger|Console} logger - Logger instance or console fallback for error logging
 * @param {Object} context - Additional context information for error analysis
 * @returns {void} Logs error and terminates process with error status code
 */
async function handleScriptError(error, logger = console, context = {}) {
    const errorHandlingStartTime = Date.now();
    
    try {
        // Log detailed error information using logger.error with context
        const errorContext = {
            scriptName: context.scriptName || SCRIPT_NAME,
            error: error.message,
            stack: error.stack,
            startupDuration: context.startupDuration || 'unknown',
            timestamp: new Date().toISOString(),
            processId: process.pid,
            nodeVersion: process.version,
            platform: process.platform
        };
        
        // Determine error type and appropriate error message using ERROR_MESSAGES
        let errorMessage = ERROR_MESSAGES.STARTUP_ERROR;
        let errorCategory = 'startup_error';
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Server startup timeout - check server initialization and port availability';
            errorCategory = 'timeout_error';
        } else if (error.message.includes('port') || error.message.includes('EADDRINUSE')) {
            errorMessage = ERROR_MESSAGES.CONNECTION_ERROR;
            errorCategory = 'connection_error';
        } else if (error.message.includes('configuration') || error.message.includes('validation')) {
            errorMessage = 'Configuration validation error - check environment variables and settings';
            errorCategory = 'configuration_error';
        }
        
        // Log error categorization and troubleshooting information
        if (logger && typeof logger.error === 'function') {
            logger.error('Application startup failed', errorContext, error);
            
            logger.error('Error Analysis', {
                errorCategory: errorCategory,
                errorMessage: errorMessage,
                troubleshooting: {
                    checkEnvironment: 'Verify all required environment variables are set',
                    checkPort: 'Ensure target port is available and not in use',
                    checkPermissions: 'Verify process has required permissions for port binding',
                    checkDependencies: 'Ensure all application dependencies are properly installed'
                }
            });
        } else {
            // Fallback to console logging if logger is not available
            console.error(`[${SCRIPT_NAME}] STARTUP ERROR:`, errorMessage);
            console.error(`[${SCRIPT_NAME}] Error Details:`, error.message);
            console.error(`[${SCRIPT_NAME}] Error Category:`, errorCategory);
            console.error(`[${SCRIPT_NAME}] Stack Trace:`, error.stack);
        }
        
        // Perform cleanup procedures if partially initialized
        if (context.environmentConfig) {
            try {
                console.log(`[${SCRIPT_NAME}] Performing startup cleanup procedures...`);
                
                // Clear any environment configuration references
                context.environmentConfig = null;
                
                // Force garbage collection if available
                if (global.gc) {
                    global.gc();
                }
                
                console.log(`[${SCRIPT_NAME}] Cleanup procedures completed`);
                
            } catch (cleanupError) {
                console.error(`[${SCRIPT_NAME}] Cleanup failed:`, cleanupError.message);
            }
        }
        
        const errorHandlingDuration = Date.now() - errorHandlingStartTime;
        
        // Log final error summary with handling duration for debugging purposes
        const finalErrorLog = {
            message: 'Application startup terminated due to error',
            scriptName: SCRIPT_NAME,
            errorCategory: errorCategory,
            errorHandlingDuration: `${errorHandlingDuration}ms`,
            exitCode: ERROR_EXIT_CODE,
            timestamp: new Date().toISOString()
        };
        
        if (logger && typeof logger.error === 'function') {
            logger.error('Final startup error summary', finalErrorLog);
        } else {
            console.error(`[${SCRIPT_NAME}] Final Error Summary:`, JSON.stringify(finalErrorLog, null, 2));
        }
        
        // Flush logger if available to ensure error logging is complete
        if (logger && typeof logger.flush === 'function') {
            try {
                await logger.flush();
            } catch (flushError) {
                console.error(`[${SCRIPT_NAME}] Logger flush failed:`, flushError.message);
            }
        }
        
        // Exit process with ERROR_EXIT_CODE for monitoring systems
        console.error(`[${SCRIPT_NAME}] Exiting with error code ${ERROR_EXIT_CODE}`);
        process.exit(ERROR_EXIT_CODE);
        
    } catch (handlingError) {
        // Ensure error is properly reported for debugging purposes
        console.error(`[${SCRIPT_NAME}] Error handling failed:`, handlingError.message);
        console.error(`[${SCRIPT_NAME}] Original error:`, error.message);
        
        // Force exit with error code if error handling itself fails
        process.exit(ERROR_EXIT_CODE);
    }
}

/**
 * Logs startup banner with application information, environment details, and configuration 
 * summary for monitoring and educational purposes.
 * 
 * Provides comprehensive startup information display including system details, configuration
 * summary, and educational context for both development and production environments.
 * 
 * @param {Logger} logger - Logger instance for structured startup banner logging
 * @param {EnvironmentConfig} environmentConfig - Environment configuration for startup details
 * @returns {void} Logs startup banner information
 */
async function logStartupBanner(logger, environmentConfig) {
    try {
        // Log application name and version information
        logger.info('='.repeat(80));
        logger.info('NODE.JS TUTORIAL HTTP SERVER APPLICATION');
        logger.info('='.repeat(80));
        
        // Include environment information and configuration details
        const appInfo = environmentConfig.getApplicationInfo();
        const serverConfig = environmentConfig.getServerConfig();
        
        logger.info('Application Information:', {
            name: appInfo.name || 'Node.js Tutorial HTTP Server',
            version: appInfo.version || '1.0.0',
            description: appInfo.description || 'Educational Node.js HTTP server tutorial',
            environment: environmentConfig.getNodeEnv(),
            isDevelopment: environmentConfig.isDevelopment()
        });
        
        // Log Node.js version and runtime environment details
        logger.info('Runtime Environment:', {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            processId: process.pid,
            workingDirectory: process.cwd(),
            memoryUsage: {
                total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
                used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
            }
        });
        
        // Include server configuration and network information
        logger.info('Server Configuration:', {
            port: serverConfig.port,
            hostname: serverConfig.hostname,
            protocol: 'HTTP/1.1',
            maxConnections: serverConfig.maxConnections || 1000,
            keepAliveTimeout: serverConfig.keepAliveTimeout || 5000
        });
        
        // Include educational information about tutorial objectives
        logger.info('Educational Objectives:', {
            learningGoals: [
                'HTTP server fundamentals and request handling',
                'Environment configuration and validation patterns',
                'Error handling and graceful shutdown procedures',
                'Structured logging and monitoring integration',
                'Production-ready Node.js application architecture'
            ],
            tutorialFocus: 'Simple yet comprehensive server implementation patterns'
        });
        
        // Log startup timestamp and process information
        logger.info('Startup Information:', {
            scriptName: SCRIPT_NAME,
            startupTime: new Date().toISOString(),
            processId: process.pid,
            parentProcessId: process.ppid || 'unknown',
            startupTimeout: `${STARTUP_TIMEOUT}ms`,
            gracefulShutdownEnabled: true
        });
        
        logger.info('='.repeat(80));
        logger.info(`Starting ${appInfo.name || 'Tutorial Server'} on ${serverConfig.hostname}:${serverConfig.port}`);
        logger.info('='.repeat(80));
        
    } catch (error) {
        // Fallback to basic logging if banner logging fails
        console.log(`[${SCRIPT_NAME}] === Node.js Tutorial HTTP Server Starting ===`);
        console.log(`[${SCRIPT_NAME}] Environment: ${environmentConfig.getNodeEnv()}`);
        console.log(`[${SCRIPT_NAME}] Port: ${environmentConfig.getPort()}`);
        console.log(`[${SCRIPT_NAME}] Process ID: ${process.pid}`);
        console.log(`[${SCRIPT_NAME}] Banner logging error:`, error.message);
    }
}

// ============================================================================
// SCRIPT EXECUTION LOGIC
// ============================================================================

/**
 * Immediately Invoked Function Expression (IIFE) for direct script execution with
 * comprehensive error handling and process management.
 * 
 * Provides the main script execution flow with proper error handling, logging,
 * and process exit management for both development and production environments.
 */
(async function executeStartupScript() {
    const scriptStartTime = Date.now();
    
    // Set up process-level error handlers for unhandled errors and promise rejections
    process.on('uncaughtException', async (error) => {
        console.error(`[${SCRIPT_NAME}] Uncaught Exception:`, error.message);
        console.error(`[${SCRIPT_NAME}] Stack:`, error.stack);
        
        await handleScriptError(error, console, {
            scriptName: SCRIPT_NAME,
            errorType: 'uncaught_exception',
            scriptDuration: `${Date.now() - scriptStartTime}ms`
        });
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
        console.error(`[${SCRIPT_NAME}] Unhandled Promise Rejection at:`, promise);
        console.error(`[${SCRIPT_NAME}] Reason:`, reason);
        
        const error = reason instanceof Error ? reason : new Error(String(reason));
        await handleScriptError(error, console, {
            scriptName: SCRIPT_NAME,
            errorType: 'unhandled_rejection',
            scriptDuration: `${Date.now() - scriptStartTime}ms`
        });
    });
    
    try {
        // Log script execution initiation with timestamp and process information
        console.log(`[${SCRIPT_NAME}] Script execution initiated at ${new Date().toISOString()}`);
        console.log(`[${SCRIPT_NAME}] Process ID: ${process.pid}, Node.js Version: ${process.version}`);
        
        // Execute main startup function with comprehensive error handling and logging
        await startApplication();
        
        const scriptDuration = Date.now() - scriptStartTime;
        
        // Log successful script completion with execution time and status
        console.log(`[${SCRIPT_NAME}] Startup script completed successfully in ${scriptDuration}ms`);
        console.log(`[${SCRIPT_NAME}] Application is running and ready to accept requests`);
        console.log(`[${SCRIPT_NAME}] Use Ctrl+C or SIGTERM for graceful shutdown`);
        
        // Note: Process continues running - server handles its own lifecycle
        // No process.exit(SUCCESS_EXIT_CODE) here as the server should keep running
        
    } catch (error) {
        const scriptDuration = Date.now() - scriptStartTime;
        
        // Handle script execution errors with detailed logging and process termination
        console.error(`[${SCRIPT_NAME}] Script execution failed after ${scriptDuration}ms`);
        
        await handleScriptError(error, console, {
            scriptName: SCRIPT_NAME,
            scriptDuration: `${scriptDuration}ms`,
            errorType: 'script_execution_error'
        });
    }
})();