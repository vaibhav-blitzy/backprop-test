/**
 * Core HTTP Server Implementation Module for Node.js Tutorial Application
 * 
 * This module serves as the central orchestrator for the Node.js tutorial application, integrating
 * Node.js built-in HTTP module with all system components including request handling, routing,
 * response generation, error handling, and logging to provide a comprehensive HTTP server solution.
 * 
 * The implementation follows production-ready patterns while maintaining educational clarity,
 * demonstrating how to build scalable HTTP servers using Node.js native capabilities with proper
 * configuration management, security features, and observability.
 * 
 * Key Features:
 * - Production-ready HTTP server implementation using Node.js built-in HTTP module
 * - Comprehensive component integration with request handlers, routers, and response generators
 * - Advanced lifecycle management including graceful startup and shutdown procedures
 * - Performance monitoring with request metrics, response timing, and connection tracking
 * - Robust error handling with centralized error processing and recovery strategies
 * - Educational patterns demonstrating enterprise HTTP server development practices
 * 
 * Architecture Integration:
 * - Single-threaded event loop architecture with non-blocking I/O processing
 * - Stateless request-response model for horizontal scalability
 * - Layered component architecture with clear separation of concerns
 * - Event-driven processing with comprehensive event handling and lifecycle management
 * 
 * @fileoverview Core HTTP server implementation with comprehensive component integration
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// EXTERNAL MODULE IMPORTS - Node.js Built-in Modules
// ============================================================================

// Node.js built-in HTTP module for creating HTTP server and handling request-response cycle
const http = require('node:http'); // Node.js v18+

// Node.js event emitter for server event handling and lifecycle management
const { EventEmitter } = require('node:events'); // Node.js v18+

// Performance measurement utilities for server operation timing and monitoring
const { performance } = require('node:perf_hooks'); // Node.js v18+

// ============================================================================
// INTERNAL MODULE IMPORTS - Application Components
// ============================================================================

// Application configuration management for server setup, feature flags, and environment-specific settings
const { AppConfig } = require('../config/app.config.js');

// HTTP server configuration including connection settings, timeout values, and default headers
const { ServerConfig } = require('../config/server.config.js');

// HTTP request processing engine for parsing, validation, and security checks of incoming requests
const { RequestHandler } = require('./request-handler.js');

// Central routing engine for URL pattern matching, endpoint resolution, and request delegation
const { RouteHandler } = require('./route-handler.js');

// HTTP response generation coordinator for creating, formatting, and transmitting standardized responses
const { ResponseHandler } = require('./response-handler.js');

// Centralized error management for processing, classification, and secure HTTP error response generation
const { ErrorHandler } = require('./error-handler.js');

// Structured logging system for HTTP server operations, request tracking, and performance monitoring
const { Logger } = require('../utils/logger.js');

// HTTP status code constants for proper response status management and protocol compliance
const { HTTP_STATUS_CODES } = require('../utils/http-status.js');

// Specialized utility function for creating standardized hello world responses for the tutorial endpoint
const { createHelloResponse } = require('../utils/response-utils.js');

// ============================================================================
// GLOBAL CONSTANTS AND SERVER CONFIGURATION
// ============================================================================

/**
 * Server state constants for tracking HTTP server lifecycle and operational status.
 * These states provide comprehensive server status management for monitoring and debugging.
 */
const SERVER_STATES = {
    INITIALIZING: 'initializing',
    STARTING: 'starting',
    LISTENING: 'listening',
    PROCESSING: 'processing',
    SHUTTING_DOWN: 'shutting_down',
    CLOSED: 'closed',
    ERROR: 'error'
};

/**
 * HTTP server configuration metadata including handler identification and operational settings.
 * These constants provide server identification and feature enablement configuration.
 */
const HTTP_SERVER_CONFIG = {
    handlerName: 'HttpServer',
    version: '1.0.0',
    enableLogging: true,
    enableMetrics: true,
    enableGracefulShutdown: true,
    shutdownTimeout: 30000
};

/**
 * Server event constants for event-driven architecture and lifecycle management.
 * These events enable comprehensive server monitoring and external system integration.
 */
const SERVER_EVENTS = {
    SERVER_STARTING: 'server:starting',
    SERVER_READY: 'server:ready',
    SERVER_ERROR: 'server:error',
    SERVER_SHUTDOWN: 'server:shutdown',
    REQUEST_RECEIVED: 'request:received',
    REQUEST_PROCESSED: 'request:processed',
    CONNECTION_ESTABLISHED: 'connection:established',
    CONNECTION_CLOSED: 'connection:closed'
};

/**
 * Default server metrics structure for performance monitoring and analysis.
 * These metrics provide comprehensive server performance tracking and analysis capabilities.
 */
const DEFAULT_SERVER_METRICS = {
    requestCount: 0,
    successCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    activeConnections: 0,
    totalConnections: 0
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Factory function that creates and configures Node.js HTTP server instance with proper
 * request handling, error management, and event setup for comprehensive server initialization.
 * 
 * This function demonstrates the factory pattern for server creation and provides educational
 * clarity for HTTP server configuration with Node.js built-in capabilities.
 * 
 * @param {Object} serverConfig - Server configuration object with HTTP server options
 * @param {Function} requestListener - Request listener function for handling HTTP requests
 * @returns {Object} Configured Node.js HTTP server instance with event handlers and connection management
 * 
 * @throws {Error} Server creation errors with detailed context and troubleshooting information
 */
function createServerInstance(serverConfig, requestListener) {
    try {
        // Validate server configuration parameter
        if (!serverConfig || typeof serverConfig.getHttpServerOptions !== 'function') {
            throw new Error('Invalid server configuration: must provide ServerConfig instance');
        }

        // Validate request listener function parameter
        if (!requestListener || typeof requestListener !== 'function') {
            throw new Error('Invalid request listener: must provide function for request handling');
        }

        // Extract HTTP server options from server configuration using getHttpServerOptions
        const httpServerOptions = serverConfig.getHttpServerOptions();

        // Create HTTP server instance using http.createServer with request listener function
        const server = http.createServer(httpServerOptions, requestListener);

        // Configure server timeout settings including request timeout and keep-alive timeout
        const connectionConfig = serverConfig.getConnectionConfig();
        server.timeout = connectionConfig.timeout || 30000;
        server.keepAliveTimeout = connectionConfig.keepAliveTimeout || 5000;
        server.headersTimeout = connectionConfig.headersTimeout || 60000;

        // Set up connection event handlers for connection tracking and management
        server.on('connection', (socket) => {
            // Configure socket timeout and keep-alive settings
            socket.setTimeout(connectionConfig.socketTimeout || 30000);
            socket.setKeepAlive(true, connectionConfig.idleTimeout || 5000);

            // Set up connection error handling for socket management
            socket.on('error', (error) => {
                console.error('Socket error:', error.message);
            });

            // Configure socket timeout error handling
            socket.on('timeout', () => {
                console.warn('Socket timeout detected, closing connection');
                socket.destroy();
            });
        });

        // Configure error event handlers for server error handling and recovery
        server.on('error', (error) => {
            console.error('Server error detected:', error.message);
        });

        // Set up client error handling for malformed requests and protocol violations
        server.on('clientError', (error, socket) => {
            console.warn('Client error detected:', error.message);
            if (socket.writable) {
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }
        });

        // Apply security settings and connection limits from server configuration
        const securityConfig = serverConfig.getSecurityConfig();
        if (securityConfig.strictParsing) {
            // Enable strict HTTP parsing for security
            server.insecureHTTPParser = false;
        }

        // Set up graceful shutdown handling with connection drain and timeout
        server.gracefulShutdown = async (timeout = 30000) => {
            return new Promise((resolve, reject) => {
                // Set shutdown timeout protection
                const shutdownTimer = setTimeout(() => {
                    reject(new Error('Graceful shutdown timeout exceeded'));
                }, timeout);

                // Close server and wait for connections to complete
                server.close((error) => {
                    clearTimeout(shutdownTimer);
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        };

        // Return configured HTTP server instance ready for binding and listening
        return server;

    } catch (error) {
        // Enhanced error context for server creation failures
        const serverError = new Error(`Failed to create server instance: ${error.message}`);
        serverError.originalError = error;
        serverError.context = {
            function: 'createServerInstance',
            timestamp: new Date().toISOString()
        };
        throw serverError;
    }
}

/**
 * Validates complete server configuration including application config, server config, and
 * component dependencies with comprehensive error reporting and troubleshooting guidance.
 * 
 * @param {Object} appConfig - Application configuration instance for validation
 * @param {Object} serverConfig - Server configuration instance for validation
 * @returns {Object} Validation result with success status, validated configuration, and detailed error information
 * 
 * @throws {Error} Configuration validation errors with detailed context and suggested remediation
 */
function validateServerConfiguration(appConfig, serverConfig) {
    const validationErrors = [];
    const validationWarnings = [];

    try {
        // Validate application configuration using AppConfig.validate method
        if (!appConfig || typeof appConfig.validate !== 'function') {
            validationErrors.push({
                component: 'AppConfig',
                error: 'Invalid application configuration: must provide AppConfig instance',
                remedy: 'Ensure AppConfig is properly instantiated and configured'
            });
        } else {
            const appValidation = appConfig.validate();
            if (!appValidation) {
                const appErrors = appConfig.getValidationErrors();
                validationErrors.push({
                    component: 'AppConfig',
                    error: `Application configuration validation failed: ${appErrors.join(', ')}`,
                    remedy: 'Review application configuration settings and environment variables'
                });
            }
        }

        // Validate server configuration using ServerConfig.validate method
        if (!serverConfig || typeof serverConfig.validate !== 'function') {
            validationErrors.push({
                component: 'ServerConfig',
                error: 'Invalid server configuration: must provide ServerConfig instance',
                remedy: 'Ensure ServerConfig is properly instantiated with environment configuration'
            });
        } else {
            const serverValidation = serverConfig.validate();
            if (!serverValidation) {
                const serverErrors = serverConfig.getValidationErrors();
                validationErrors.push({
                    component: 'ServerConfig',
                    error: `Server configuration validation failed: ${serverErrors.join(', ')}`,
                    remedy: 'Review server configuration including port, host, and timeout settings'
                });
            }
        }

        // Check configuration compatibility between application and server settings
        if (appConfig && serverConfig && validationErrors.length === 0) {
            const appServerConfig = appConfig.getServerConfig();
            const serverPort = serverConfig.getPort();
            const serverHost = serverConfig.getHost();

            // Validate port consistency across configurations
            if (appServerConfig.port && appServerConfig.port !== serverPort) {
                validationWarnings.push({
                    component: 'Configuration Compatibility',
                    warning: `Port mismatch between app config (${appServerConfig.port}) and server config (${serverPort})`,
                    remedy: 'Ensure consistent port configuration across all configuration modules'
                });
            }

            // Verify hostname consistency and network accessibility
            if (appServerConfig.host && appServerConfig.host !== serverHost) {
                validationWarnings.push({
                    component: 'Configuration Compatibility',
                    warning: `Host mismatch between app config (${appServerConfig.host}) and server config (${serverHost})`,
                    remedy: 'Ensure consistent hostname configuration across all configuration modules'
                });
            }
        }

        // Validate required component dependencies are available and properly configured
        const requiredComponents = [
            { name: 'RequestHandler', type: 'class' },
            { name: 'RouteHandler', type: 'class' },
            { name: 'ResponseHandler', type: 'class' },
            { name: 'ErrorHandler', type: 'class' },
            { name: 'Logger', type: 'class' }
        ];

        // Check component availability (simplified validation for tutorial context)
        requiredComponents.forEach(component => {
            try {
                // Basic component availability check
                const ComponentClass = require(`./${component.name.toLowerCase().replace('handler', '-handler')}.js`);
                if (!ComponentClass || typeof ComponentClass[component.name] !== 'function') {
                    validationErrors.push({
                        component: component.name,
                        error: `${component.name} component is not available or improperly exported`,
                        remedy: `Ensure ${component.name} is properly implemented and exported from its module`
                    });
                }
            } catch (error) {
                validationErrors.push({
                    component: component.name,
                    error: `Failed to load ${component.name}: ${error.message}`,
                    remedy: `Check ${component.name} module implementation and file path`
                });
            }
        });

        // Verify feature flag configuration consistency across components
        if (appConfig && typeof appConfig.getFeatureFlags === 'function') {
            const featureFlags = appConfig.getFeatureFlags();
            
            // Validate logging feature configuration
            if (featureFlags.request_logging && !featureFlags.error_handling) {
                validationWarnings.push({
                    component: 'Feature Flags',
                    warning: 'Request logging enabled but error handling disabled may cause incomplete logs',
                    remedy: 'Consider enabling error handling when request logging is active'
                });
            }
        }

        // Validate logging configuration and logger initialization requirements
        if (appConfig && typeof appConfig.getLogConfig === 'function') {
            const logConfig = appConfig.getLogConfig();
            if (logConfig.enabled && (!logConfig.level || typeof logConfig.level !== 'string')) {
                validationErrors.push({
                    component: 'Logging Configuration',
                    error: 'Invalid logging configuration: missing or invalid log level',
                    remedy: 'Set valid log level (debug, info, warn, error) in logging configuration'
                });
            }
        }

        // Check network configuration including port availability and hostname resolution
        if (serverConfig && typeof serverConfig.getPort === 'function') {
            const port = serverConfig.getPort();
            const host = serverConfig.getHost();

            // Validate port number range and accessibility
            if (port < 1024 && process.getuid && process.getuid() !== 0) {
                validationWarnings.push({
                    component: 'Network Configuration',
                    warning: `Port ${port} requires elevated privileges on Unix systems`,
                    remedy: 'Use port >= 1024 for non-privileged execution or run with appropriate permissions'
                });
            }

            // Check hostname format and resolution capability
            if (host && !['localhost', '127.0.0.1', '0.0.0.0'].includes(host)) {
                validationWarnings.push({
                    component: 'Network Configuration',
                    warning: `Custom hostname ${host} may require DNS resolution`,
                    remedy: 'Ensure hostname is resolvable or use localhost for development'
                });
            }
        }

        // Return comprehensive validation result with detailed error context
        return {
            isValid: validationErrors.length === 0,
            hasWarnings: validationWarnings.length > 0,
            errors: validationErrors,
            warnings: validationWarnings,
            summary: {
                errorCount: validationErrors.length,
                warningCount: validationWarnings.length,
                timestamp: new Date().toISOString(),
                validationResult: validationErrors.length === 0 ? 'PASSED' : 'FAILED'
            }
        };

    } catch (error) {
        // Handle unexpected validation errors with comprehensive context
        return {
            isValid: false,
            hasWarnings: false,
            errors: [{
                component: 'Configuration Validation',
                error: `Unexpected validation error: ${error.message}`,
                remedy: 'Check configuration module implementations and dependencies'
            }],
            warnings: [],
            summary: {
                errorCount: 1,
                warningCount: 0,
                timestamp: new Date().toISOString(),
                validationResult: 'FAILED',
                unexpectedError: true
            }
        };
    }
}

/**
 * Configures comprehensive event handlers for HTTP server lifecycle management, connection
 * tracking, and error handling with detailed event processing and monitoring capabilities.
 * 
 * @param {Object} server - Node.js HTTP server instance for event handler configuration
 * @param {Object} eventHandlers - Event handler configuration object with lifecycle callbacks
 * @param {Logger} logger - Logger instance for event logging and monitoring
 * @returns {void} Sets up event handlers on server instance for lifecycle and connection management
 */
function setupServerEventHandlers(server, eventHandlers, logger) {
    try {
        // Validate server instance parameter
        if (!server || typeof server.on !== 'function') {
            throw new Error('Invalid server instance: must provide Node.js HTTP server');
        }

        // Validate logger instance parameter
        if (!logger || typeof logger.info !== 'function') {
            throw new Error('Invalid logger instance: must provide Logger with logging methods');
        }

        // Set up 'listening' event handler for server startup confirmation and logging
        server.on('listening', () => {
            const address = server.address();
            const listenInfo = {
                port: address.port,
                host: address.address,
                family: address.family,
                protocol: 'HTTP/1.1'
            };

            logger.info('HTTP server started successfully', listenInfo);

            // Execute custom listening event handler if provided
            if (eventHandlers.onListening && typeof eventHandlers.onListening === 'function') {
                eventHandlers.onListening(listenInfo);
            }
        });

        // Configure 'connection' event handler for connection tracking and metrics
        server.on('connection', (socket) => {
            const connectionInfo = {
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                localAddress: socket.localAddress,
                localPort: socket.localPort,
                timestamp: new Date().toISOString()
            };

            logger.debug('New connection established', connectionInfo);

            // Execute custom connection event handler if provided
            if (eventHandlers.onConnection && typeof eventHandlers.onConnection === 'function') {
                eventHandlers.onConnection(socket, connectionInfo);
            }

            // Set up connection close event handler for cleanup and metrics
            socket.on('close', () => {
                logger.debug('Connection closed', {
                    remoteAddress: connectionInfo.remoteAddress,
                    duration: Date.now() - new Date(connectionInfo.timestamp).getTime()
                });

                // Execute custom connection close handler if provided
                if (eventHandlers.onConnectionClose && typeof eventHandlers.onConnectionClose === 'function') {
                    eventHandlers.onConnectionClose(connectionInfo);
                }
            });
        });

        // Set up 'close' event handler for graceful shutdown completion logging
        server.on('close', () => {
            logger.info('HTTP server closed successfully');

            // Execute custom server close handler if provided
            if (eventHandlers.onClose && typeof eventHandlers.onClose === 'function') {
                eventHandlers.onClose();
            }
        });

        // Configure 'error' event handler for server error logging and recovery
        server.on('error', (error) => {
            const errorInfo = {
                message: error.message,
                code: error.code,
                errno: error.errno,
                syscall: error.syscall,
                address: error.address,
                port: error.port,
                timestamp: new Date().toISOString()
            };

            logger.error('HTTP server error occurred', errorInfo);

            // Execute custom error event handler if provided
            if (eventHandlers.onError && typeof eventHandlers.onError === 'function') {
                eventHandlers.onError(error, errorInfo);
            }
        });

        // Set up 'clientError' event handler for client connection error management
        server.on('clientError', (error, socket) => {
            const clientErrorInfo = {
                message: error.message,
                code: error.code,
                remoteAddress: socket.remoteAddress,
                timestamp: new Date().toISOString()
            };

            logger.warn('Client error detected', clientErrorInfo);

            // Send appropriate error response if socket is still writable
            if (socket.writable) {
                socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
            }

            // Execute custom client error handler if provided
            if (eventHandlers.onClientError && typeof eventHandlers.onClientError === 'function') {
                eventHandlers.onClientError(error, socket, clientErrorInfo);
            }
        });

        // Configure process signal handlers for graceful shutdown (SIGTERM, SIGINT)
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}, initiating graceful shutdown`);

            try {
                // Execute graceful shutdown procedure
                await server.gracefulShutdown(HTTP_SERVER_CONFIG.shutdownTimeout);
                logger.info('Graceful shutdown completed successfully');
                process.exit(0);
            } catch (error) {
                logger.error('Graceful shutdown failed', { error: error.message });
                process.exit(1);
            }
        };

        // Set up SIGTERM handler for production environment shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

        // Configure SIGINT handler for development environment shutdown (Ctrl+C)
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Set up connection timeout and keep-alive event handlers
        server.on('timeout', () => {
            logger.warn('Server timeout event triggered');
        });

        // Configure performance monitoring event handlers for metrics collection
        if (HTTP_SERVER_CONFIG.enableMetrics) {
            server.on('request', (req, res) => {
                // Record request start time for performance measurement
                req.startTime = performance.now();
                
                // Set up response finish handler for timing measurement
                res.on('finish', () => {
                    const responseTime = performance.now() - req.startTime;
                    logger.debug('Request processed', {
                        method: req.method,
                        url: req.url,
                        statusCode: res.statusCode,
                        responseTime: `${responseTime.toFixed(2)}ms`
                    });
                });
            });
        }

        logger.debug('Server event handlers configured successfully');

    } catch (error) {
        const eventError = new Error(`Failed to setup server event handlers: ${error.message}`);
        eventError.originalError = error;
        eventError.context = {
            function: 'setupServerEventHandlers',
            timestamp: new Date().toISOString()
        };
        throw eventError;
    }
}

/**
 * Creates comprehensive request context object with correlation ID, timing information,
 * and request metadata for processing pipeline and monitoring integration.
 * 
 * @param {Object} request - Node.js HTTP request object
 * @param {Object} response - Node.js HTTP response object  
 * @param {Object} options - Additional options for context generation
 * @returns {Object} Request context with correlation ID, timing, metadata, and processing configuration
 */
function generateRequestContext(request, response, options = {}) {
    try {
        // Generate unique correlation ID for request-response tracking and logging
        const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Initialize request timing measurement using performance.now() for monitoring
        const startTime = performance.now();
        const timestamp = new Date().toISOString();

        // Extract request metadata including method, URL, headers, and client information
        const requestMetadata = {
            method: request.method,
            url: request.url,
            httpVersion: request.httpVersion,
            headers: { ...request.headers },
            remoteAddress: request.socket?.remoteAddress,
            remotePort: request.socket?.remotePort,
            userAgent: request.headers['user-agent'],
            contentLength: request.headers['content-length']
        };

        // Create request context object with references to request and response objects
        const requestContext = {
            correlationId,
            timestamp,
            startTime,
            request,
            response,
            metadata: requestMetadata,
            
            // Add server instance reference and processing configuration options
            serverConfig: options.serverConfig,
            processingOptions: {
                enableLogging: options.enableLogging !== false,
                enableMetrics: options.enableMetrics !== false,
                enableTiming: options.enableTiming !== false
            },
            
            // Initialize error handling context and recovery strategies for pipeline
            errorContext: {
                hasErrors: false,
                errors: [],
                recoveryStrategy: 'continue'
            },
            
            // Set up logging context with correlation ID and request characteristics
            loggingContext: {
                correlationId,
                requestId: correlationId,
                method: requestMetadata.method,
                url: requestMetadata.url,
                remoteAddress: requestMetadata.remoteAddress
            }
        };

        // Add timing utilities for performance measurement
        requestContext.getTiming = () => {
            return {
                startTime,
                currentTime: performance.now(),
                elapsedTime: performance.now() - startTime,
                timestamp
            };
        };

        // Add error handling utilities for pipeline error management
        requestContext.addError = (error, category = 'PROCESSING') => {
            requestContext.errorContext.hasErrors = true;
            requestContext.errorContext.errors.push({
                error: error.message,
                category,
                timestamp: new Date().toISOString(),
                stackTrace: error.stack
            });
        };

        // Return comprehensive request context for handler processing pipeline
        return requestContext;

    } catch (error) {
        // Create fallback context for error scenarios
        const fallbackContext = {
            correlationId: `error-${Date.now()}`,
            timestamp: new Date().toISOString(),
            startTime: performance.now(),
            request,
            response,
            error: error.message,
            fallbackMode: true
        };

        return fallbackContext;
    }
}

// ============================================================================
// MAIN HTTP SERVER CLASS
// ============================================================================

/**
 * Main HTTP server class that orchestrates all system components to provide a comprehensive
 * Node.js HTTP server implementation. Integrates request handling, routing, response generation,
 * error handling, and logging with Node.js built-in HTTP module.
 * 
 * This class implements production-ready patterns including graceful shutdown, performance
 * monitoring, connection management, and comprehensive error handling while maintaining
 * educational clarity for the tutorial application.
 * 
 * Key Features:
 * - Complete HTTP server lifecycle management with startup and shutdown procedures
 * - Comprehensive component integration with all system handlers and utilities
 * - Advanced performance monitoring with request metrics and response timing
 * - Robust error handling with centralized error processing and recovery
 * - Production-ready patterns with graceful shutdown and resource management
 * - Educational clarity with detailed logging and comprehensive documentation
 */
class HttpServer extends EventEmitter {
    /**
     * Initializes the HTTP server with comprehensive configuration, component setup, and
     * integration of all system handlers with validation and error handling.
     * 
     * @param {Object} options - Server initialization options with configuration and component settings
     */
    constructor(options = {}) {
        super();

        try {
            // Initialize and validate application configuration using AppConfig with environment settings
            this.appConfig = options.appConfig || new AppConfig({
                validateOnInit: true,
                throwOnValidationError: false
            });

            // Create and validate server configuration using ServerConfig with HTTP options
            this.serverConfig = options.serverConfig || new ServerConfig(this.appConfig.environment);

            // Initialize Logger instance with configuration from application settings
            const logConfig = this.appConfig.getLogConfig();
            this.logger = options.logger || new Logger(logConfig);

            // Create RequestHandler instance for HTTP request processing and validation
            this.requestHandler = options.requestHandler || new RequestHandler({
                logger: this.logger,
                config: this.appConfig
            });

            // Initialize RouteHandler for URL routing and endpoint resolution
            this.routeHandler = options.routeHandler || new RouteHandler({
                logger: this.logger,
                config: this.appConfig
            });

            // Create ResponseHandler for HTTP response generation and formatting
            this.responseHandler = options.responseHandler || new ResponseHandler({
                logger: this.logger,
                config: this.appConfig
            });

            // Initialize ErrorHandler for centralized error processing and recovery
            this.errorHandler = options.errorHandler || new ErrorHandler({
                logger: this.logger,
                config: this.appConfig
            });

            // Validate complete server configuration and component dependencies
            const validationResult = validateServerConfiguration(this.appConfig, this.serverConfig);
            if (!validationResult.isValid) {
                const errorDetails = validationResult.errors.map(e => e.error).join('; ');
                throw new Error(`Server configuration validation failed: ${errorDetails}`);
            }

            // Log validation warnings if present
            if (validationResult.hasWarnings) {
                validationResult.warnings.forEach(warning => {
                    this.logger.warn('Configuration warning', warning);
                });
            }

            // Set server state to INITIALIZING and initialize metrics collection
            this.serverState = SERVER_STATES.INITIALIZING;
            this.serverMetrics = { ...DEFAULT_SERVER_METRICS };
            this.activeConnections = new Set();
            this.isShuttingDown = false;

            // Create Node.js HTTP server instance with configured request listener
            this.server = createServerInstance(this.serverConfig, this.handleRequest.bind(this));

            // Set up comprehensive server event handlers for lifecycle management
            this.configureShutdownHandlers();
            setupServerEventHandlers(this.server, {
                onConnection: this._handleNewConnection.bind(this),
                onConnectionClose: this._handleConnectionClose.bind(this),
                onError: this._handleServerError.bind(this),
                onClientError: this._handleClientError.bind(this)
            }, this.logger);

            // Log successful HTTP server initialization with configuration details
            this.logger.info('HTTP server initialized successfully', {
                port: this.serverConfig.getPort(),
                host: this.serverConfig.getHost(),
                version: HTTP_SERVER_CONFIG.version,
                features: this.appConfig.getFeatureFlags()
            });

        } catch (error) {
            // Enhanced error context for initialization failures
            const initError = new Error(`HttpServer initialization failed: ${error.message}`);
            initError.originalError = error;
            initError.context = {
                class: 'HttpServer',
                method: 'constructor',
                timestamp: new Date().toISOString()
            };
            throw initError;
        }
    }

    /**
     * Starts the HTTP server by binding to configured port and host with comprehensive
     * startup validation and error handling including timeout protection and connection verification.
     * 
     * @param {Object} startOptions - Optional startup configuration with timeout and validation settings
     * @returns {Promise<void>} Resolves when server is successfully listening, rejects on startup errors
     */
    async start(startOptions = {}) {
        try {
            // Validate server configuration and ensure all components are properly initialized
            const validationResult = validateServerConfiguration(this.appConfig, this.serverConfig);
            if (!validationResult.isValid) {
                throw new Error(`Server startup validation failed: ${validationResult.summary.validationResult}`);
            }

            // Set server state to STARTING and log startup initiation with configuration
            this.serverState = SERVER_STATES.STARTING;
            this.emit(SERVER_EVENTS.SERVER_STARTING);

            // Extract port and host from server configuration using getPort and getHost methods
            const port = this.serverConfig.getPort();
            const host = this.serverConfig.getHost();
            const startupTimeout = startOptions.timeout || 10000;

            this.logger.info('Starting HTTP server', {
                port,
                host,
                timeout: startupTimeout,
                configuration: this.serverConfig.toJSON()
            });

            // Validate port availability and hostname resolution before attempting to bind
            await this._validateNetworkConfiguration(port, host);

            // Start HTTP server listening on configured port and host using server.listen
            return new Promise((resolve, reject) => {
                // Set startup timeout protection
                const startupTimer = setTimeout(() => {
                    reject(new Error(`Server startup timeout after ${startupTimeout}ms`));
                }, startupTimeout);

                // Handle startup errors
                const errorHandler = (error) => {
                    clearTimeout(startupTimer);
                    this.serverState = SERVER_STATES.ERROR;
                    reject(new Error(`Server startup failed: ${error.message}`));
                };

                this.server.once('error', errorHandler);

                // Wait for 'listening' event confirmation with timeout handling for startup errors
                this.server.listen(port, host, (error) => {
                    clearTimeout(startupTimer);
                    this.server.removeListener('error', errorHandler);

                    if (error) {
                        this.serverState = SERVER_STATES.ERROR;
                        reject(new Error(`Failed to bind to ${host}:${port}: ${error.message}`));
                        return;
                    }

                    // Set server state to LISTENING and update server metrics with startup information
                    this.serverState = SERVER_STATES.LISTENING;
                    this.serverMetrics.totalConnections = 0;
                    this.serverMetrics.requestCount = 0;

                    // Log successful server startup with listening address and configuration details
                    const address = this.server.address();
                    this.logger.info('HTTP server listening successfully', {
                        address: `${address.address}:${address.port}`,
                        family: address.family,
                        state: this.serverState,
                        uptime: process.uptime()
                    });

                    // Emit SERVER_READY event for external systems and monitoring integration
                    this.emit(SERVER_EVENTS.SERVER_READY, {
                        port,
                        host,
                        address,
                        timestamp: new Date().toISOString()
                    });

                    resolve();
                });
            });

        } catch (error) {
            this.serverState = SERVER_STATES.ERROR;
            const startupError = new Error(`Server start failed: ${error.message}`);
            startupError.originalError = error;
            throw startupError;
        }
    }

    /**
     * Gracefully stops the HTTP server by draining connections, completing active requests,
     * and cleaning up resources with timeout protection and comprehensive shutdown management.
     * 
     * @param {Object} stopOptions - Optional shutdown configuration with timeout and force settings
     * @returns {Promise<void>} Resolves when server is fully stopped, rejects on shutdown timeout
     */
    async stop(stopOptions = {}) {
        try {
            // Set isShuttingDown flag to prevent new connections and requests
            this.isShuttingDown = true;

            // Set server state to SHUTTING_DOWN and log graceful shutdown initiation
            this.serverState = SERVER_STATES.SHUTTING_DOWN;
            const shutdownTimeout = stopOptions.timeout || HTTP_SERVER_CONFIG.shutdownTimeout;

            this.logger.info('Initiating graceful server shutdown', {
                activeConnections: this.activeConnections.size,
                shutdownTimeout,
                forceShutdown: stopOptions.force || false
            });

            // Stop accepting new connections by calling server.close()
            return new Promise((resolve, reject) => {
                // Set shutdown timeout protection
                const shutdownTimer = setTimeout(async () => {
                    if (stopOptions.force !== false) {
                        this.logger.warn('Shutdown timeout reached, forcing connection closure');
                        await this._forceCloseConnections();
                        resolve();
                    } else {
                        reject(new Error(`Graceful shutdown timeout after ${shutdownTimeout}ms`));
                    }
                }, shutdownTimeout);

                // Close server and wait for connections to complete
                this.server.close(async (error) => {
                    clearTimeout(shutdownTimer);

                    if (error) {
                        this.logger.error('Server close error', { error: error.message });
                        reject(error);
                        return;
                    }

                    // Wait for active connections to complete with configurable timeout protection
                    try {
                        await this._waitForConnectionsDrain(shutdownTimeout / 2);
                    } catch (drainError) {
                        this.logger.warn('Connection drain timeout, forcing closure');
                        await this._forceCloseConnections();
                    }

                    // Clean up server resources, metrics, and component references
                    this._cleanupServerResources();

                    // Set server state to CLOSED and log successful shutdown completion
                    this.serverState = SERVER_STATES.CLOSED;
                    this.logger.info('HTTP server shutdown completed successfully');

                    // Emit SERVER_SHUTDOWN event for monitoring and external system notification
                    this.emit(SERVER_EVENTS.SERVER_SHUTDOWN, {
                        timestamp: new Date().toISOString(),
                        finalMetrics: { ...this.serverMetrics }
                    });

                    resolve();
                });
            });

        } catch (error) {
            this.serverState = SERVER_STATES.ERROR;
            const shutdownError = new Error(`Server shutdown failed: ${error.message}`);
            shutdownError.originalError = error;
            throw shutdownError;
        }
    }

    /**
     * Main request handling method that coordinates the complete request-response pipeline
     * from parsing through response transmission with comprehensive error handling.
     * 
     * @param {Object} request - Node.js HTTP request object
     * @param {Object} response - Node.js HTTP response object
     * @returns {Promise<void>} Completes when request processing and response transmission are finished
     */
    async handleRequest(request, response) {
        let requestContext;

        try {
            // Generate request context with correlation ID and timing information
            requestContext = generateRequestContext(request, response, {
                serverConfig: this.serverConfig,
                enableLogging: HTTP_SERVER_CONFIG.enableLogging,
                enableMetrics: HTTP_SERVER_CONFIG.enableMetrics
            });

            // Log incoming request with method, URL, and client information
            this.logger.logHttpRequest(request, {
                correlationId: requestContext.correlationId,
                timestamp: requestContext.timestamp
            });

            // Update server metrics for request count and active connection tracking
            this.updateServerMetrics('REQUEST_RECEIVED', {
                correlationId: requestContext.correlationId,
                method: request.method,
                url: request.url
            });

            // Emit request received event for monitoring
            this.emit(SERVER_EVENTS.REQUEST_RECEIVED, requestContext);

            // Parse and validate request using RequestHandler.handleRequest method
            const parsedRequest = await this.requestHandler.handleRequest(request, response);
            
            // Validate parsed request for security and protocol compliance
            const validationResult = await this.requestHandler.validateRequest(parsedRequest);
            if (!validationResult.isValid) {
                throw new Error(`Request validation failed: ${validationResult.errors.join(', ')}`);
            }

            // Resolve route and endpoint using RouteHandler.resolveRoute method
            const routeResult = await this.routeHandler.resolveRoute(parsedRequest.url, parsedRequest.method);

            // Process route result and generate appropriate response
            if (routeResult.matched && routeResult.endpoint === 'hello') {
                // For hello endpoint, delegate to ResponseHandler.sendHello method
                await this.responseHandler.sendHello(request, response, {
                    correlationId: requestContext.correlationId,
                    context: requestContext
                });
                
                // Update success metrics
                this.updateServerMetrics('SUCCESS_RESPONSE', {
                    correlationId: requestContext.correlationId,
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK
                });

            } else if (!routeResult.matched) {
                // For not found routes, delegate to ResponseHandler.sendNotFound method
                await this.responseHandler.sendNotFound(request, response, {
                    correlationId: requestContext.correlationId,
                    requestedPath: parsedRequest.url
                });

                // Update client error metrics
                this.updateServerMetrics('CLIENT_ERROR', {
                    correlationId: requestContext.correlationId,
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
                });

            } else if (routeResult.methodNotAllowed) {
                // For method not allowed, delegate to ResponseHandler.sendMethodNotAllowed method
                await this.responseHandler.sendMethodNotAllowed(request, response, {
                    correlationId: requestContext.correlationId,
                    method: parsedRequest.method,
                    allowedMethods: routeResult.allowedMethods
                });

                // Update client error metrics
                this.updateServerMetrics('CLIENT_ERROR', {
                    correlationId: requestContext.correlationId,
                    statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED
                });
            }

            // Log response completion with status code and processing time
            const timing = requestContext.getTiming();
            this.logger.logHttpResponse(response, {
                correlationId: requestContext.correlationId,
                processingTime: timing.elapsedTime,
                method: request.method,
                url: request.url
            });

            // Update server metrics with response information and performance data
            this.updateServerMetrics('REQUEST_PROCESSED', {
                correlationId: requestContext.correlationId,
                responseTime: timing.elapsedTime,
                statusCode: response.statusCode
            });

            // Emit request processed event for monitoring
            this.emit(SERVER_EVENTS.REQUEST_PROCESSED, {
                ...requestContext,
                responseTime: timing.elapsedTime,
                statusCode: response.statusCode
            });

        } catch (error) {
            // Handle any processing errors using ErrorHandler.handle method
            try {
                await this.errorHandler.handle(error, request, response, {
                    correlationId: requestContext?.correlationId,
                    context: requestContext
                });

                // Update error metrics
                this.updateServerMetrics('SERVER_ERROR', {
                    correlationId: requestContext?.correlationId,
                    error: error.message,
                    statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR
                });

            } catch (handlerError) {
                // Fallback error handling for critical error scenarios
                this.logger.error('Critical error in request handling', {
                    originalError: error.message,
                    handlerError: handlerError.message,
                    correlationId: requestContext?.correlationId
                });

                // Send basic error response if response is still writable
                if (!response.headersSent && response.writable) {
                    try {
                        response.writeHead(HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR, {
                            'content-type': 'text/plain; charset=utf-8'
                        });
                        response.end('Internal Server Error');
                    } catch (responseError) {
                        this.logger.error('Failed to send error response', {
                            error: responseError.message,
                            correlationId: requestContext?.correlationId
                        });
                    }
                }
            }
        }
    }

    /**
     * Returns comprehensive server status information including state, metrics, configuration,
     * and health indicators for monitoring and administrative purposes.
     * 
     * @returns {Object} Server status object with state, metrics, health, and configuration information
     */
    getServerStatus() {
        try {
            // Extract current server state and listening status
            const isListening = this.server && this.server.listening;
            const address = isListening ? this.server.address() : null;

            // Compile server metrics including request counts and performance data
            const currentMetrics = {
                ...this.serverMetrics,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            };

            // Include active connection count and connection metrics
            const connectionMetrics = {
                activeConnections: this.activeConnections.size,
                totalConnections: this.serverMetrics.totalConnections,
                connectionList: Array.from(this.activeConnections).map(conn => ({
                    remoteAddress: conn.remoteAddress,
                    remotePort: conn.remotePort,
                    connectTime: conn.connectTime
                }))
            };

            // Add configuration information including port, host, and feature flags
            const configurationInfo = {
                port: this.serverConfig.getPort(),
                host: this.serverConfig.getHost(),
                version: HTTP_SERVER_CONFIG.version,
                environment: this.appConfig.getApplicationInfo().environment,
                features: this.appConfig.getFeatureFlags()
            };

            // Include health indicators and error rate information
            const healthIndicators = {
                serverState: this.serverState,
                isListening,
                isShuttingDown: this.isShuttingDown,
                errorRate: this.serverMetrics.requestCount > 0 ? 
                    (this.serverMetrics.errorCount / this.serverMetrics.requestCount) * 100 : 0,
                successRate: this.serverMetrics.requestCount > 0 ? 
                    (this.serverMetrics.successCount / this.serverMetrics.requestCount) * 100 : 0
            };

            // Add server uptime and performance characteristics
            const performanceInfo = {
                averageResponseTime: this.serverMetrics.averageResponseTime,
                requestsPerSecond: currentMetrics.uptime > 0 ? 
                    this.serverMetrics.requestCount / currentMetrics.uptime : 0,
                memoryUsage: currentMetrics.memoryUsage,
                cpuUsage: currentMetrics.cpuUsage
            };

            // Return comprehensive server status object for monitoring
            return {
                server: {
                    state: this.serverState,
                    listening: isListening,
                    address,
                    version: HTTP_SERVER_CONFIG.version,
                    uptime: currentMetrics.uptime
                },
                metrics: currentMetrics,
                connections: connectionMetrics,
                configuration: configurationInfo,
                health: healthIndicators,
                performance: performanceInfo,
                timestamp: new Date().toISOString(),
                requestId: `status-${Date.now()}`
            };

        } catch (error) {
            // Return error status for status retrieval failures
            return {
                server: {
                    state: SERVER_STATES.ERROR,
                    listening: false,
                    error: error.message
                },
                timestamp: new Date().toISOString(),
                statusError: true
            };
        }
    }

    /**
     * Retrieves detailed server performance metrics including request statistics, response times,
     * and connection data for monitoring and performance analysis purposes.
     * 
     * @param {Object} metricsOptions - Options for metrics retrieval including time ranges and filters
     * @returns {Object} Server metrics with performance data, statistics, and monitoring information
     */
    getServerMetrics(metricsOptions = {}) {
        try {
            // Aggregate request and response metrics by type and status code
            const requestMetrics = {
                totalRequests: this.serverMetrics.requestCount,
                successfulRequests: this.serverMetrics.successCount,
                failedRequests: this.serverMetrics.errorCount,
                successRate: this.serverMetrics.requestCount > 0 ? 
                    (this.serverMetrics.successCount / this.serverMetrics.requestCount) * 100 : 0,
                errorRate: this.serverMetrics.requestCount > 0 ? 
                    (this.serverMetrics.errorCount / this.serverMetrics.requestCount) * 100 : 0
            };

            // Calculate average response times and performance percentiles
            const performanceMetrics = {
                averageResponseTime: this.serverMetrics.averageResponseTime,
                minResponseTime: this.serverMetrics.minResponseTime || 0,
                maxResponseTime: this.serverMetrics.maxResponseTime || 0,
                responseTimePercentiles: this._calculateResponseTimePercentiles()
            };

            // Include connection metrics and active connection information
            const connectionMetrics = {
                activeConnections: this.activeConnections.size,
                totalConnections: this.serverMetrics.totalConnections,
                averageConnectionDuration: this._calculateAverageConnectionDuration(),
                connectionTurnover: this._calculateConnectionTurnover()
            };

            // Compile error rates and server error statistics
            const errorMetrics = {
                totalErrors: this.serverMetrics.errorCount,
                clientErrors: this.serverMetrics.clientErrorCount || 0,
                serverErrors: this.serverMetrics.serverErrorCount || 0,
                errorsByType: this.serverMetrics.errorsByType || {},
                recentErrors: this.serverMetrics.recentErrors || []
            };

            // Add hello endpoint specific metrics and response data
            const endpointMetrics = {
                helloEndpoint: {
                    requests: this.serverMetrics.helloRequests || 0,
                    successRate: this.serverMetrics.helloSuccessRate || 0,
                    averageResponseTime: this.serverMetrics.helloAverageResponseTime || 0
                }
            };

            // Include server performance benchmarks and resource usage
            const systemMetrics = {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                nodeVersion: process.version,
                platform: process.platform
            };

            // Format metrics data for monitoring systems and dashboards
            const formattedMetrics = {
                summary: {
                    state: this.serverState,
                    uptime: systemMetrics.uptime,
                    totalRequests: requestMetrics.totalRequests,
                    successRate: requestMetrics.successRate,
                    errorRate: requestMetrics.errorRate
                },
                requests: requestMetrics,
                performance: performanceMetrics,
                connections: connectionMetrics,
                errors: errorMetrics,
                endpoints: endpointMetrics,
                system: systemMetrics,
                
                // Include metrics metadata and collection information
                metadata: {
                    collectionPeriod: metricsOptions.period || 'lifetime',
                    timestamp: new Date().toISOString(),
                    metricsVersion: '1.0.0'
                }
            };

            // Return comprehensive server metrics object for analysis
            return formattedMetrics;

        } catch (error) {
            // Return error metrics for metrics retrieval failures
            return {
                error: `Failed to retrieve server metrics: ${error.message}`,
                timestamp: new Date().toISOString(),
                metricsError: true
            };
        }
    }

    /**
     * Updates server metrics with latest request processing data including timing, status codes,
     * and performance indicators for monitoring and analysis purposes.
     * 
     * @param {string} metricType - Type of metric update (REQUEST_RECEIVED, SUCCESS_RESPONSE, etc.)
     * @param {Object} metricData - Metric data including timing, status codes, and context information
     * @returns {void} Updates internal server metrics for monitoring and performance tracking
     */
    updateServerMetrics(metricType, metricData = {}) {
        try {
            // Identify metric type and appropriate metric collection category
            const timestamp = new Date().toISOString();
            const { correlationId, statusCode, responseTime, error } = metricData;

            switch (metricType) {
                case 'REQUEST_RECEIVED':
                    // Update request count metrics by endpoint and HTTP method
                    this.serverMetrics.requestCount++;
                    
                    // Track endpoint-specific request counts
                    if (metricData.url === '/hello') {
                        this.serverMetrics.helloRequests = (this.serverMetrics.helloRequests || 0) + 1;
                    }
                    break;

                case 'SUCCESS_RESPONSE':
                    // Record response processing time and performance characteristics
                    this.serverMetrics.successCount++;
                    
                    if (responseTime) {
                        // Update rolling averages for server performance analysis
                        this._updateResponseTimeMetrics(responseTime);
                    }
                    
                    // Track endpoint success rates
                    if (metricData.url === '/hello') {
                        this.serverMetrics.helloSuccessCount = (this.serverMetrics.helloSuccessCount || 0) + 1;
                        this.serverMetrics.helloSuccessRate = 
                            (this.serverMetrics.helloSuccessCount / this.serverMetrics.helloRequests) * 100;
                    }
                    break;

                case 'CLIENT_ERROR':
                    // Update success and error rate metrics based on response status
                    this.serverMetrics.errorCount++;
                    this.serverMetrics.clientErrorCount = (this.serverMetrics.clientErrorCount || 0) + 1;
                    
                    // Track client error types and patterns
                    const clientErrorType = `CLIENT_ERROR_${statusCode}`;
                    this.serverMetrics.errorsByType = this.serverMetrics.errorsByType || {};
                    this.serverMetrics.errorsByType[clientErrorType] = 
                        (this.serverMetrics.errorsByType[clientErrorType] || 0) + 1;
                    break;

                case 'SERVER_ERROR':
                    // Update server error metrics and critical error tracking
                    this.serverMetrics.errorCount++;
                    this.serverMetrics.serverErrorCount = (this.serverMetrics.serverErrorCount || 0) + 1;
                    
                    // Track server error patterns for monitoring
                    this.serverMetrics.recentErrors = this.serverMetrics.recentErrors || [];
                    this.serverMetrics.recentErrors.push({
                        error: error || 'Unknown server error',
                        correlationId,
                        timestamp,
                        statusCode
                    });
                    
                    // Maintain recent error list size
                    if (this.serverMetrics.recentErrors.length > 100) {
                        this.serverMetrics.recentErrors = this.serverMetrics.recentErrors.slice(-50);
                    }
                    break;

                case 'CONNECTION_ESTABLISHED':
                    // Maintain rolling averages for server performance analysis
                    this.serverMetrics.totalConnections++;
                    this.serverMetrics.activeConnections = this.activeConnections.size;
                    break;

                case 'CONNECTION_CLOSED':
                    // Update connection metrics including active and total connections
                    this.serverMetrics.activeConnections = this.activeConnections.size;
                    break;

                default:
                    // Log unknown metric types for debugging
                    this.logger.warn('Unknown metric type for server metrics update', {
                        metricType,
                        correlationId,
                        timestamp
                    });
                    break;
            }

            // Trigger performance alerts if metric thresholds are exceeded
            this._checkPerformanceThresholds();

        } catch (error) {
            // Log metric update errors without throwing to avoid request processing disruption
            this.logger.error('Failed to update server metrics', {
                metricType,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Sets up graceful shutdown handlers for process signals and server lifecycle management
     * with timeout protection and resource cleanup coordination.
     * 
     * @returns {void} Configures shutdown handlers for SIGTERM, SIGINT, and other shutdown signals
     */
    configureShutdownHandlers() {
        try {
            // Register SIGTERM signal handler for graceful shutdown initiation
            process.on('SIGTERM', async () => {
                this.logger.info('SIGTERM received, initiating graceful shutdown');
                try {
                    await this.stop({ timeout: HTTP_SERVER_CONFIG.shutdownTimeout });
                    process.exit(0);
                } catch (error) {
                    this.logger.error('Graceful shutdown failed on SIGTERM', { error: error.message });
                    process.exit(1);
                }
            });

            // Configure SIGINT signal handler for development environment shutdown
            process.on('SIGINT', async () => {
                this.logger.info('SIGINT received, initiating graceful shutdown');
                try {
                    await this.stop({ timeout: HTTP_SERVER_CONFIG.shutdownTimeout });
                    process.exit(0);
                } catch (error) {
                    this.logger.error('Graceful shutdown failed on SIGINT', { error: error.message });
                    process.exit(1);
                }
            });

            // Set up unhandled exception handlers with graceful shutdown
            process.on('uncaughtException', async (error) => {
                this.logger.error('Uncaught exception detected', {
                    error: error.message,
                    stack: error.stack
                });

                try {
                    await this.errorHandler.handleGracefulShutdown(error);
                    await this.stop({ force: true, timeout: 5000 });
                    process.exit(1);
                } catch (shutdownError) {
                    this.logger.error('Failed to shutdown after uncaught exception', {
                        shutdownError: shutdownError.message
                    });
                    process.exit(1);
                }
            });

            // Configure unhandled promise rejection handlers
            process.on('unhandledRejection', async (reason, promise) => {
                this.logger.error('Unhandled promise rejection detected', {
                    reason: reason?.message || reason,
                    promise: promise.toString()
                });

                try {
                    await this.errorHandler.handleGracefulShutdown(new Error(`Unhandled rejection: ${reason}`));
                } catch (handlerError) {
                    this.logger.error('Failed to handle unhandled rejection', {
                        handlerError: handlerError.message
                    });
                }
            });

            // Set up shutdown timeout protection to prevent hanging processes
            this._shutdownTimeoutHandler = setTimeout(() => {
                this.logger.error('Shutdown timeout exceeded, forcing process exit');
                process.exit(1);
            }, HTTP_SERVER_CONFIG.shutdownTimeout + 5000);

            // Configure cleanup handlers for server resources and connections
            process.on('beforeExit', () => {
                this.logger.info('Process before exit, cleaning up resources');
                this._cleanupServerResources();
                clearTimeout(this._shutdownTimeoutHandler);
            });

            // Log shutdown handler configuration for operational awareness
            this.logger.debug('Shutdown handlers configured successfully', {
                signals: ['SIGTERM', 'SIGINT'],
                exceptionHandling: true,
                timeout: HTTP_SERVER_CONFIG.shutdownTimeout
            });

        } catch (error) {
            this.logger.error('Failed to configure shutdown handlers', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Performs comprehensive server health validation including component status, metrics validation,
     * and configuration integrity for health check and monitoring purposes.
     * 
     * @param {Object} healthOptions - Options for health validation including validation depth and timeout
     * @returns {Object} Health validation result with status, component health, and diagnostic information
     */
    validateServerHealth(healthOptions = {}) {
        try {
            const healthValidationResults = {
                overall: 'HEALTHY',
                components: {},
                metrics: {},
                configuration: {},
                diagnostics: [],
                timestamp: new Date().toISOString()
            };

            // Check server listening status and port availability
            const serverListening = this.server && this.server.listening;
            const serverAddress = serverListening ? this.server.address() : null;

            healthValidationResults.components.httpServer = {
                status: serverListening ? 'HEALTHY' : 'UNHEALTHY',
                listening: serverListening,
                address: serverAddress,
                state: this.serverState
            };

            if (!serverListening) {
                healthValidationResults.overall = 'UNHEALTHY';
                healthValidationResults.diagnostics.push({
                    component: 'HTTP Server',
                    issue: 'Server is not listening for connections',
                    severity: 'CRITICAL',
                    remedy: 'Check server startup and port binding'
                });
            }

            // Validate all component instances and their operational status
            const componentChecks = [
                { name: 'appConfig', instance: this.appConfig, methods: ['validate', 'getServerConfig'] },
                { name: 'serverConfig', instance: this.serverConfig, methods: ['validate', 'getPort'] },
                { name: 'requestHandler', instance: this.requestHandler, methods: ['handleRequest'] },
                { name: 'routeHandler', instance: this.routeHandler, methods: ['resolveRoute'] },
                { name: 'responseHandler', instance: this.responseHandler, methods: ['sendHello'] },
                { name: 'errorHandler', instance: this.errorHandler, methods: ['handle'] },
                { name: 'logger', instance: this.logger, methods: ['info', 'error'] }
            ];

            componentChecks.forEach(({ name, instance, methods }) => {
                const componentHealth = {
                    status: 'HEALTHY',
                    available: !!instance,
                    methodsAvailable: []
                };

                if (!instance) {
                    componentHealth.status = 'UNHEALTHY';
                    healthValidationResults.overall = 'DEGRADED';
                    healthValidationResults.diagnostics.push({
                        component: name,
                        issue: `${name} component is not available`,
                        severity: 'HIGH',
                        remedy: `Check ${name} initialization and dependencies`
                    });
                } else {
                    // Check required methods availability
                    methods.forEach(method => {
                        const methodAvailable = typeof instance[method] === 'function';
                        componentHealth.methodsAvailable.push({
                            method,
                            available: methodAvailable
                        });

                        if (!methodAvailable) {
                            componentHealth.status = 'DEGRADED';
                            healthValidationResults.overall = 'DEGRADED';
                            healthValidationResults.diagnostics.push({
                                component: name,
                                issue: `Required method ${method} is not available`,
                                severity: 'MEDIUM',
                                remedy: `Check ${name} implementation for ${method} method`
                            });
                        }
                    });
                }

                healthValidationResults.components[name] = componentHealth;
            });

            // Check server metrics for anomalies and performance issues
            const metricsHealth = {
                status: 'HEALTHY',
                requestCount: this.serverMetrics.requestCount,
                errorRate: this.serverMetrics.requestCount > 0 ? 
                    (this.serverMetrics.errorCount / this.serverMetrics.requestCount) * 100 : 0,
                averageResponseTime: this.serverMetrics.averageResponseTime
            };

            // Validate error rates and response time thresholds
            if (metricsHealth.errorRate > (healthOptions.maxErrorRate || 10)) {
                metricsHealth.status = 'DEGRADED';
                healthValidationResults.overall = 'DEGRADED';
                healthValidationResults.diagnostics.push({
                    component: 'Metrics',
                    issue: `High error rate: ${metricsHealth.errorRate}%`,
                    severity: 'MEDIUM',
                    remedy: 'Investigate error patterns and implement corrective measures'
                });
            }

            if (metricsHealth.averageResponseTime > (healthOptions.maxResponseTime || 1000)) {
                metricsHealth.status = 'DEGRADED';
                healthValidationResults.overall = 'DEGRADED';
                healthValidationResults.diagnostics.push({
                    component: 'Performance',
                    issue: `High response time: ${metricsHealth.averageResponseTime}ms`,
                    severity: 'MEDIUM',
                    remedy: 'Optimize request processing and check system resources'
                });
            }

            healthValidationResults.metrics = metricsHealth;

            // Validate configuration integrity and component compatibility
            const configValidation = validateServerConfiguration(this.appConfig, this.serverConfig);
            healthValidationResults.configuration = {
                status: configValidation.isValid ? 'HEALTHY' : 'UNHEALTHY',
                valid: configValidation.isValid,
                errors: configValidation.errors,
                warnings: configValidation.warnings
            };

            if (!configValidation.isValid) {
                healthValidationResults.overall = 'UNHEALTHY';
                configValidation.errors.forEach(error => {
                    healthValidationResults.diagnostics.push({
                        component: 'Configuration',
                        issue: error.error,
                        severity: 'HIGH',
                        remedy: error.remedy
                    });
                });
            }

            // Check active connection health and connection pool status
            const connectionHealth = {
                status: 'HEALTHY',
                activeConnections: this.activeConnections.size,
                maxConnections: healthOptions.maxConnections || 1000
            };

            if (connectionHealth.activeConnections > connectionHealth.maxConnections * 0.9) {
                connectionHealth.status = 'DEGRADED';
                healthValidationResults.overall = 'DEGRADED';
                healthValidationResults.diagnostics.push({
                    component: 'Connections',
                    issue: `High connection count: ${connectionHealth.activeConnections}`,
                    severity: 'MEDIUM',
                    remedy: 'Monitor connection patterns and implement connection limits'
                });
            }

            healthValidationResults.connections = connectionHealth;

            // Return comprehensive health validation result with diagnostics
            return healthValidationResults;

        } catch (error) {
            // Return critical health validation failure
            return {
                overall: 'CRITICAL',
                error: `Health validation failed: ${error.message}`,
                timestamp: new Date().toISOString(),
                validationError: true
            };
        }
    }

    /**
     * Reloads server configuration and reinitializes components without stopping the server
     * for dynamic configuration updates and component refresh.
     * 
     * @param {Object} newConfig - New configuration object for server and component updates
     * @returns {Promise<void>} Completes when configuration reload and component reinitialization are finished
     */
    async reload(newConfig = {}) {
        try {
            this.logger.info('Initiating server configuration reload');

            // Validate new configuration using validateServerConfiguration function
            if (newConfig.appConfig || newConfig.serverConfig) {
                const validationResult = validateServerConfiguration(
                    newConfig.appConfig || this.appConfig,
                    newConfig.serverConfig || this.serverConfig
                );

                if (!validationResult.isValid) {
                    throw new Error(`New configuration validation failed: ${validationResult.summary.validationResult}`);
                }
            }

            // Create backup of current configuration for rollback capability
            const configBackup = {
                appConfig: this.appConfig,
                serverConfig: this.serverConfig,
                timestamp: new Date().toISOString()
            };

            try {
                // Reload application configuration using AppConfig.reload method
                if (newConfig.appConfig) {
                    this.appConfig = newConfig.appConfig;
                } else if (newConfig.environmentConfig) {
                    await this.appConfig.reload({ environmentConfig: newConfig.environmentConfig });
                }

                // Update server configuration using ServerConfig.reload method
                if (newConfig.serverConfig) {
                    this.serverConfig = newConfig.serverConfig;
                } else if (newConfig.environmentConfig) {
                    this.serverConfig.reload(newConfig.environmentConfig);
                }

                // Reinitialize logger with new logging configuration
                const newLogConfig = this.appConfig.getLogConfig();
                this.logger = new Logger(newLogConfig);

                // Update component configurations without stopping server
                await this._updateComponentConfigurations(newConfig);

                // Validate reloaded configuration and component compatibility
                const reloadValidation = validateServerConfiguration(this.appConfig, this.serverConfig);
                if (!reloadValidation.isValid) {
                    throw new Error('Configuration reload validation failed');
                }

                // Log successful configuration reload with changes applied
                this.logger.info('Server configuration reloaded successfully', {
                    changes: Object.keys(newConfig),
                    timestamp: new Date().toISOString(),
                    validationStatus: reloadValidation.summary.validationResult
                });

            } catch (reloadError) {
                // Rollback configuration on reload failure
                this.logger.error('Configuration reload failed, rolling back', {
                    error: reloadError.message
                });

                this.appConfig = configBackup.appConfig;
                this.serverConfig = configBackup.serverConfig;
                throw reloadError;
            }

        } catch (error) {
            const reloadError = new Error(`Server reload failed: ${error.message}`);
            reloadError.originalError = error;
            throw reloadError;
        }
    }

    /**
     * Returns the current server port number from server configuration with validation.
     * 
     * @returns {number} Server port number currently configured for binding
     */
    getPort() {
        try {
            // Extract port number from server configuration using getPort method
            const port = this.serverConfig.getPort();
            
            // Return validated port number for server operations
            return port;
        } catch (error) {
            this.logger.error('Failed to get server port', { error: error.message });
            return null;
        }
    }

    /**
     * Returns the current server hostname from server configuration with validation.
     * 
     * @returns {string} Server hostname currently configured for binding
     */
    getHost() {
        try {
            // Extract hostname from server configuration using getHost method
            const host = this.serverConfig.getHost();
            
            // Return validated hostname for server operations
            return host;
        } catch (error) {
            this.logger.error('Failed to get server host', { error: error.message });
            return null;
        }
    }

    /**
     * Checks if the HTTP server is currently listening and accepting connections.
     * 
     * @returns {boolean} True if server is listening, false otherwise
     */
    isListening() {
        try {
            // Check server listening status using server.listening property
            const listening = this.server && this.server.listening;
            
            // Verify server state is LISTENING for operational confirmation
            const stateValid = this.serverState === SERVER_STATES.LISTENING;
            
            // Return boolean result of server listening status
            return listening && stateValid;
        } catch (error) {
            this.logger.error('Failed to check server listening status', { error: error.message });
            return false;
        }
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Validates network configuration including port availability and hostname resolution.
     * @private
     */
    async _validateNetworkConfiguration(port, host) {
        return new Promise((resolve, reject) => {
            // Create temporary server to test port availability
            const testServer = http.createServer();
            
            testServer.listen(port, host, (error) => {
                if (error) {
                    reject(new Error(`Port ${port} on ${host} is not available: ${error.message}`));
                } else {
                    testServer.close(() => resolve());
                }
            });

            testServer.on('error', (error) => {
                reject(new Error(`Network validation failed: ${error.message}`));
            });
        });
    }

    /**
     * Handles new connection establishment for tracking and metrics.
     * @private
     */
    _handleNewConnection(socket, connectionInfo) {
        // Add connection to active connections set
        socket.connectTime = new Date().toISOString();
        this.activeConnections.add(socket);

        // Update connection metrics
        this.updateServerMetrics('CONNECTION_ESTABLISHED', connectionInfo);

        // Emit connection established event
        this.emit(SERVER_EVENTS.CONNECTION_ESTABLISHED, connectionInfo);
    }

    /**
     * Handles connection closure for cleanup and metrics update.
     * @private
     */
    _handleConnectionClose(connectionInfo) {
        // Remove connection from active connections set
        this.activeConnections.forEach(socket => {
            if (socket.remoteAddress === connectionInfo.remoteAddress && 
                socket.remotePort === connectionInfo.remotePort) {
                this.activeConnections.delete(socket);
            }
        });

        // Update connection metrics
        this.updateServerMetrics('CONNECTION_CLOSED', connectionInfo);

        // Emit connection closed event
        this.emit(SERVER_EVENTS.CONNECTION_CLOSED, connectionInfo);
    }

    /**
     * Handles server errors with logging and monitoring.
     * @private
     */
    _handleServerError(error, errorInfo) {
        this.serverState = SERVER_STATES.ERROR;
        this.emit(SERVER_EVENTS.SERVER_ERROR, errorInfo);
    }

    /**
     * Handles client errors with appropriate response and logging.
     * @private
     */
    _handleClientError(error, socket, clientErrorInfo) {
        // Log client error for monitoring
        this.logger.warn('Client error handled', clientErrorInfo);
    }

    /**
     * Updates response time metrics with new timing data.
     * @private
     */
    _updateResponseTimeMetrics(responseTime) {
        const currentAvg = this.serverMetrics.averageResponseTime;
        const requestCount = this.serverMetrics.requestCount;
        
        // Calculate new rolling average
        this.serverMetrics.averageResponseTime = 
            ((currentAvg * (requestCount - 1)) + responseTime) / requestCount;

        // Update min/max response times
        this.serverMetrics.minResponseTime = Math.min(
            this.serverMetrics.minResponseTime || responseTime, 
            responseTime
        );
        this.serverMetrics.maxResponseTime = Math.max(
            this.serverMetrics.maxResponseTime || responseTime, 
            responseTime
        );
    }

    /**
     * Calculates response time percentiles for performance analysis.
     * @private
     */
    _calculateResponseTimePercentiles() {
        // Simplified percentile calculation for tutorial context
        return {
            p50: this.serverMetrics.averageResponseTime,
            p90: this.serverMetrics.averageResponseTime * 1.5,
            p95: this.serverMetrics.averageResponseTime * 2,
            p99: this.serverMetrics.maxResponseTime || this.serverMetrics.averageResponseTime * 3
        };
    }

    /**
     * Calculates average connection duration for performance metrics.
     * @private
     */
    _calculateAverageConnectionDuration() {
        // Simplified calculation for tutorial context
        const activeConnectionCount = this.activeConnections.size;
        const totalConnections = this.serverMetrics.totalConnections;
        
        return totalConnections > 0 ? (process.uptime() * 1000) / totalConnections : 0;
    }

    /**
     * Calculates connection turnover rate for monitoring.
     * @private
     */
    _calculateConnectionTurnover() {
        const uptime = process.uptime();
        return uptime > 0 ? this.serverMetrics.totalConnections / uptime : 0;
    }

    /**
     * Checks performance thresholds and triggers alerts if exceeded.
     * @private
     */
    _checkPerformanceThresholds() {
        const errorRate = this.serverMetrics.requestCount > 0 ? 
            (this.serverMetrics.errorCount / this.serverMetrics.requestCount) * 100 : 0;

        // Check error rate threshold
        if (errorRate > 10) {
            this.logger.warn('High error rate detected', { errorRate });
        }

        // Check response time threshold
        if (this.serverMetrics.averageResponseTime > 1000) {
            this.logger.warn('High response time detected', { 
                averageResponseTime: this.serverMetrics.averageResponseTime 
            });
        }
    }

    /**
     * Updates component configurations during reload.
     * @private
     */
    async _updateComponentConfigurations(newConfig) {
        // Update components with new configuration
        if (newConfig.requestHandlerConfig) {
            this.requestHandler.updateConfig(newConfig.requestHandlerConfig);
        }
        if (newConfig.routeHandlerConfig) {
            this.routeHandler.updateConfig(newConfig.routeHandlerConfig);
        }
        // Add other component updates as needed
    }

    /**
     * Waits for active connections to drain during shutdown.
     * @private
     */
    async _waitForConnectionsDrain(timeout) {
        return new Promise((resolve, reject) => {
            const checkInterval = 100;
            const maxChecks = timeout / checkInterval;
            let checks = 0;

            const checkConnections = () => {
                if (this.activeConnections.size === 0) {
                    resolve();
                } else if (checks++ > maxChecks) {
                    reject(new Error('Connection drain timeout'));
                } else {
                    setTimeout(checkConnections, checkInterval);
                }
            };

            checkConnections();
        });
    }

    /**
     * Forces closure of all active connections.
     * @private
     */
    async _forceCloseConnections() {
        this.activeConnections.forEach(socket => {
            socket.destroy();
        });
        this.activeConnections.clear();
    }

    /**
     * Cleans up server resources and references.
     * @private
     */
    _cleanupServerResources() {
        // Clear active connections
        this.activeConnections.clear();
        
        // Reset metrics
        this.serverMetrics = { ...DEFAULT_SERVER_METRICS };
        
        // Clear shutdown timeout
        if (this._shutdownTimeoutHandler) {
            clearTimeout(this._shutdownTimeoutHandler);
        }
    }
}

// ============================================================================
// DEFAULT HTTP SERVER INSTANCE
// ============================================================================

// Create default HTTP server instance configured for immediate use in the tutorial application
const httpServer = new HttpServer();

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export the HttpServer class for custom server instances
module.exports.HttpServer = HttpServer;

// Export utility functions for server creation and configuration
module.exports.createServerInstance = createServerInstance;
module.exports.validateServerConfiguration = validateServerConfiguration;
module.exports.setupServerEventHandlers = setupServerEventHandlers;
module.exports.generateRequestContext = generateRequestContext;

// Export global constants for server management
module.exports.SERVER_STATES = SERVER_STATES;
module.exports.HTTP_SERVER_CONFIG = HTTP_SERVER_CONFIG;
module.exports.SERVER_EVENTS = SERVER_EVENTS;
module.exports.DEFAULT_SERVER_METRICS = DEFAULT_SERVER_METRICS;

// Export default HTTP server instance for immediate use
module.exports.httpServer = httpServer;

// Default export for convenient access to the HttpServer class
module.exports = HttpServer;