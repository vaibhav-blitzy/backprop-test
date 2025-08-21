/**
 * Main Application Class for Node.js Tutorial HTTP Server Application
 * 
 * Serves as the central orchestrator and integration point for the Node.js tutorial HTTP server
 * application. Coordinates all system components including HTTP server, routing, configuration,
 * middleware, controllers, and services to provide a unified application interface.
 * 
 * This application implements comprehensive application lifecycle management with startup,
 * shutdown, health monitoring, and component coordination while maintaining educational
 * clarity and demonstrating production-ready Node.js application architecture patterns.
 * 
 * Key Features:
 * - Centralized component orchestration and integration
 * - Comprehensive application lifecycle management
 * - Event-driven architecture with component coordination
 * - Production-ready health monitoring and metrics collection
 * - Educational patterns demonstrating enterprise Node.js architecture
 * - Graceful startup and shutdown procedures with timeout protection
 * 
 * Educational Objectives:
 * - Demonstrates industry-standard application architecture patterns
 * - Shows proper component integration and dependency management
 * - Illustrates event-driven application lifecycle management
 * - Provides examples of production-ready monitoring and observability
 * - Shows proper error handling and recovery strategies
 * - Demonstrates configuration management and validation patterns
 * 
 * @fileoverview Main application orchestrator for Node.js tutorial HTTP server
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import application configuration management with environment settings and validation
import { AppConfig } from './config/app.config.js';

// Import structured logging system for application operations and component coordination
import { Logger } from './utils/logger.js';

// Import standardized response messages for consistent application lifecycle communication
import { ERROR_MESSAGES } from './constants/error-messages.js';

// Import controller for hello endpoint with specialized request handling
import { HelloController } from './controllers/hello.controller.js';

// Import Node.js built-in modules for performance measurement and event management
import { performance } from 'node:perf_hooks'; // Node.js v20.x - Performance measurement utilities
import { EventEmitter } from 'node:events'; // Node.js v20.x - Event emitter for application lifecycle

// Dynamic imports for CommonJS modules
let HttpServer, RouteRegistry, RESPONSE_MESSAGES;

// Initialize CommonJS module imports
async function initializeCommonJSModules() {
    try {
        // Import HTTP server implementation with component orchestration
        const httpServerModule = await import('./lib/http-server.js');
        HttpServer = httpServerModule.HttpServer;
        
        // Import route registry for centralized route management
        const routeRegistryModule = await import('./routes/index.js');
        RouteRegistry = routeRegistryModule.RouteRegistry;
        
        // Import response messages for application lifecycle communication
        const responseMessagesModule = await import('./constants/response-messages.js');
        RESPONSE_MESSAGES = responseMessagesModule.RESPONSE_MESSAGES;
        
        return true;
    } catch (error) {
        console.error('Failed to initialize CommonJS modules:', error);
        return false;
    }
}

// ============================================================================
// GLOBAL APPLICATION CONSTANTS
// ============================================================================

/**
 * Application state enumeration for lifecycle management and component coordination.
 * Provides clear state definitions for application lifecycle tracking and component integration.
 */
const APPLICATION_STATES = {
    INITIALIZING: 'initializing',
    STARTING: 'starting',
    RUNNING: 'running',
    STOPPING: 'stopping',
    STOPPED: 'stopped',
    ERROR: 'error'
};

/**
 * Application event constants for lifecycle event coordination and component communication.
 * Enables event-driven architecture with component coordination and lifecycle management.
 */
const APPLICATION_EVENTS = {
    APP_INITIALIZING: 'app:initializing',
    APP_STARTED: 'app:started',
    APP_READY: 'app:ready',
    APP_STOPPING: 'app:stopping',
    APP_STOPPED: 'app:stopped',
    APP_ERROR: 'app:error'
};

/**
 * Application configuration constants providing metadata and operational parameters.
 * Defines core application information and behavioral settings for component coordination.
 */
const APPLICATION_CONFIG = {
    name: 'Node.js Tutorial HTTP Server Application',
    version: '1.0.0',
    description: 'Educational Node.js HTTP server demonstrating fundamental concepts',
    enableHealthChecks: true,
    enableMetrics: true,
    startupTimeout: 30000,
    shutdownTimeout: 10000
};

/**
 * Default application metrics structure for performance monitoring and operational tracking.
 * Provides baseline metrics collection for application performance analysis and health monitoring.
 */
const DEFAULT_APPLICATION_METRICS = {
    startupTime: 0,
    requestCount: 0,
    errorCount: 0,
    uptime: 0,
    componentHealth: {}
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Factory function that creates and configures a complete Application instance with all
 * components initialized, validated, and ready for startup. Provides comprehensive
 * application setup with component integration and validation.
 * 
 * @param {Object} [applicationOptions={}] - Configuration options for application creation
 * @returns {Promise<Application>} Configured application instance with all components integrated and validated
 */
async function createApplication(applicationOptions = {}) {
    const creationStartTime = performance.now();
    
    try {
        // Ensure CommonJS modules are loaded
        const modulesLoaded = await initializeCommonJSModules();
        if (!modulesLoaded) {
            throw new Error('Failed to load required CommonJS modules');
        }
        
        // Create and validate AppConfig instance with environment settings and feature flags
        const appConfig = new AppConfig(applicationOptions.configOptions || {});
        const configValidation = appConfig.validate();
        
        if (!configValidation.isValid) {
            throw new Error(`Configuration validation failed: ${configValidation.errors.join(', ')}`);
        }
        
        // Initialize Logger with application-specific configuration and logging levels
        const logConfig = appConfig.getLogConfig();
        const logger = new Logger({
            appConfig: appConfig,
            logLevel: logConfig.level,
            enableColors: logConfig.colors
        });
        
        // Create HttpServer instance with server configuration and component integration
        const serverConfig = appConfig.getServerConfig();
        const httpServer = new HttpServer({
            ...serverConfig,
            logger: logger
        });
        
        // Initialize RouteRegistry with route configuration and handler setup
        const routeRegistry = new RouteRegistry({
            enableMetrics: APPLICATION_CONFIG.enableMetrics,
            enableSecurity: true,
            logger: logger
        });
        
        // Create HelloController instance with controller configuration and service integration
        const helloController = new HelloController({
            logger: logger,
            enableMetrics: APPLICATION_CONFIG.enableMetrics
        });
        
        // Create Application instance with all components and configuration validation
        const applicationConfig = {
            ...APPLICATION_CONFIG,
            ...applicationOptions,
            appConfig: appConfig,
            httpServer: httpServer,
            routeRegistry: routeRegistry,
            helloController: helloController,
            logger: logger
        };
        
        const application = new Application(applicationConfig);
        
        // Validate component integration and application readiness for startup
        const integrationValidation = await validateApplicationConfiguration(appConfig, {
            httpServer: httpServer,
            routeRegistry: routeRegistry,
            helloController: helloController
        });
        
        if (!integrationValidation.success) {
            throw new Error(`Component integration validation failed: ${integrationValidation.errors.join(', ')}`);
        }
        
        const creationDuration = performance.now() - creationStartTime;
        logger.info('Application created successfully', {
            creationDuration: `${creationDuration.toFixed(2)}ms`,
            componentsInitialized: Object.keys(applicationConfig).length,
            applicationName: APPLICATION_CONFIG.name
        });
        
        // Return configured Application instance ready for lifecycle management
        return application;
        
    } catch (error) {
        const creationDuration = performance.now() - creationStartTime;
        console.error(`Application creation failed after ${creationDuration.toFixed(2)}ms:`, error.message);
        throw error;
    }
}

/**
 * Validates complete application configuration including all components, integration points,
 * and dependencies to ensure application readiness. Performs comprehensive validation
 * of component compatibility and configuration consistency.
 * 
 * @param {AppConfig} appConfig - Application configuration instance
 * @param {Object} components - Object containing all application components
 * @returns {Object} Validation result with success status, component validation details, and error information
 */
async function validateApplicationConfiguration(appConfig, components) {
    const validationStartTime = performance.now();
    
    const validationResult = {
        success: false,
        errors: [],
        warnings: [],
        componentValidation: {},
        metadata: {
            timestamp: new Date().toISOString(),
            validationId: `app-config-val-${Date.now()}`,
            validationType: 'complete-application-configuration'
        }
    };
    
    try {
        // Validate AppConfig configuration using AppConfig.validate method
        const configValidation = appConfig.validate();
        validationResult.componentValidation.appConfig = configValidation;
        
        if (!configValidation.isValid) {
            validationResult.errors.push('AppConfig validation failed');
            validationResult.errors.push(...configValidation.errors);
        }
        
        // Validate HttpServer component initialization and configuration readiness
        if (components.httpServer) {
            const serverStatus = components.httpServer.getServerStatus();
            validationResult.componentValidation.httpServer = {
                isConfigured: !!serverStatus,
                hasRequiredMethods: typeof components.httpServer.start === 'function' &&
                                   typeof components.httpServer.stop === 'function'
            };
            
            if (!validationResult.componentValidation.httpServer.isConfigured) {
                validationResult.errors.push('HttpServer not properly configured');
            }
        } else {
            validationResult.errors.push('HttpServer component missing');
        }
        
        // Validate RouteRegistry initialization and route coverage completeness
        if (components.routeRegistry) {
            const registryValidation = components.routeRegistry.validateRegistry();
            validationResult.componentValidation.routeRegistry = registryValidation;
            
            if (!registryValidation.isValid) {
                validationResult.errors.push('RouteRegistry validation failed');
                validationResult.errors.push(...registryValidation.errors);
            }
        } else {
            validationResult.errors.push('RouteRegistry component missing');
        }
        
        // Validate HelloController configuration and service integration status
        if (components.helloController) {
            const controllerHealth = components.helloController.isHealthy();
            const controllerInfo = components.helloController.getControllerInfo();
            
            validationResult.componentValidation.helloController = {
                isHealthy: controllerHealth,
                hasControllerInfo: !!controllerInfo,
                isInitialized: !!controllerInfo?.helloController?.status?.isInitialized
            };
            
            if (!controllerHealth) {
                validationResult.warnings.push('HelloController health check failed');
            }
        } else {
            validationResult.errors.push('HelloController component missing');
        }
        
        // Check component integration points and dependency resolution
        const integrationChecks = {
            appConfigToLogger: !!(appConfig && components.logger),
            httpServerToRoutes: !!(components.httpServer && components.routeRegistry),
            controllerToService: !!(components.helloController),
            allComponentsPresent: !!(appConfig && components.httpServer && 
                                   components.routeRegistry && components.helloController)
        };
        
        validationResult.componentValidation.integration = integrationChecks;
        
        if (!integrationChecks.allComponentsPresent) {
            validationResult.errors.push('Missing required components for integration');
        }
        
        // Validate application feature flags and environment configuration consistency
        const featureFlags = appConfig.getFeatureFlags();
        const applicationInfo = appConfig.getApplicationInfo();
        
        validationResult.componentValidation.configuration = {
            hasFeatureFlags: !!featureFlags,
            hasApplicationInfo: !!applicationInfo,
            configurationComplete: !!(featureFlags && applicationInfo)
        };
        
        // Assess overall validation success
        validationResult.success = validationResult.errors.length === 0;
        
        const validationDuration = performance.now() - validationStartTime;
        validationResult.metadata.duration = `${validationDuration.toFixed(2)}ms`;
        
        // Return comprehensive validation result with detailed component analysis
        return validationResult;
        
    } catch (error) {
        const validationDuration = performance.now() - validationStartTime;
        validationResult.errors.push(`Configuration validation error: ${error.message}`);
        validationResult.metadata.duration = `${validationDuration.toFixed(2)}ms`;
        validationResult.metadata.error = true;
        
        return validationResult;
    }
}

/**
 * Configures comprehensive event handlers for application lifecycle management, component
 * coordination, and error handling with proper event propagation. Sets up event-driven
 * architecture for application component communication.
 * 
 * @param {Application} application - Application instance for event handler setup
 * @param {Logger} logger - Logger instance for event logging and monitoring
 * @returns {void} Sets up event handlers on application instance for lifecycle and component coordination
 */
function setupApplicationEventHandlers(application, logger) {
    try {
        // Set up application startup event handlers for component initialization tracking
        application.eventEmitter.on(APPLICATION_EVENTS.APP_INITIALIZING, (data) => {
            logger.info('Application initializing', {
                event: APPLICATION_EVENTS.APP_INITIALIZING,
                applicationName: APPLICATION_CONFIG.name,
                version: APPLICATION_CONFIG.version,
                ...data
            });
        });
        
        application.eventEmitter.on(APPLICATION_EVENTS.APP_STARTED, (data) => {
            logger.info('Application started successfully', {
                event: APPLICATION_EVENTS.APP_STARTED,
                startupTime: data.startupTime,
                componentsReady: data.componentsReady,
                ...data
            });
        });
        
        // Configure application ready event handlers for service availability notification
        application.eventEmitter.on(APPLICATION_EVENTS.APP_READY, (data) => {
            logger.info('Application ready for requests', {
                event: APPLICATION_EVENTS.APP_READY,
                port: data.port,
                uptime: data.uptime,
                healthStatus: data.healthStatus,
                ...data
            });
        });
        
        // Set up application error event handlers for error propagation and recovery
        application.eventEmitter.on(APPLICATION_EVENTS.APP_ERROR, (data) => {
            logger.error('Application error occurred', {
                event: APPLICATION_EVENTS.APP_ERROR,
                errorType: data.errorType,
                component: data.component,
                severity: data.severity,
                ...data
            });
        });
        
        // Configure application shutdown event handlers for graceful termination
        application.eventEmitter.on(APPLICATION_EVENTS.APP_STOPPING, (data) => {
            logger.info('Application shutdown initiated', {
                event: APPLICATION_EVENTS.APP_STOPPING,
                reason: data.reason,
                graceful: data.graceful,
                timeout: data.timeout,
                ...data
            });
        });
        
        application.eventEmitter.on(APPLICATION_EVENTS.APP_STOPPED, (data) => {
            logger.info('Application stopped successfully', {
                event: APPLICATION_EVENTS.APP_STOPPED,
                totalUptime: data.totalUptime,
                finalMetrics: data.finalMetrics,
                shutdownDuration: data.shutdownDuration,
                ...data
            });
        });
        
        // Set up component health event handlers for monitoring and alerting
        application.eventEmitter.on('component:health:changed', (data) => {
            const logLevel = data.healthy ? 'INFO' : 'WARN';
            logger.log(logLevel, 'Component health status changed', {
                component: data.component,
                healthy: data.healthy,
                previousStatus: data.previousStatus,
                healthDetails: data.healthDetails,
                ...data
            });
        });
        
        // Configure performance event handlers for metrics collection and monitoring
        application.eventEmitter.on('performance:metrics:updated', (data) => {
            logger.debug('Performance metrics updated', {
                component: data.component,
                metrics: data.metrics,
                thresholds: data.thresholds,
                alerts: data.alerts,
                ...data
            });
        });
        
        logger.debug('Application event handlers configured successfully', {
            eventsConfigured: [
                APPLICATION_EVENTS.APP_INITIALIZING,
                APPLICATION_EVENTS.APP_STARTED,
                APPLICATION_EVENTS.APP_READY,
                APPLICATION_EVENTS.APP_ERROR,
                APPLICATION_EVENTS.APP_STOPPING,
                APPLICATION_EVENTS.APP_STOPPED
            ]
        });
        
    } catch (error) {
        logger.error('Failed to setup application event handlers', {
            error: error.message
        }, error);
    }
}

// ============================================================================
// MAIN APPLICATION CLASS
// ============================================================================

/**
 * Main application class that serves as the central orchestrator and integration point
 * for the Node.js tutorial HTTP server application. Coordinates all system components
 * including HTTP server, routing, configuration, middleware, controllers, and services
 * to provide a unified application interface.
 */
class Application {
    /**
     * Initializes the Application with comprehensive component integration, configuration
     * validation, and application setup for complete HTTP server functionality with
     * educational clarity.
     * 
     * @param {Object} config - Application configuration object with components and settings
     */
    constructor(config = {}) {
        const constructorStartTime = performance.now();
        
        try {
            // Initialize EventEmitter for application lifecycle and component coordination events
            this.eventEmitter = new EventEmitter();
            this.eventEmitter.setMaxListeners(20); // Increase limit for component events
            
            // Create and validate AppConfig instance with environment settings and feature flags
            this.appConfig = config.appConfig || new AppConfig();
            
            // Initialize Logger with application configuration and environment-specific logging levels
            this.logger = config.logger || new Logger({ appConfig: this.appConfig });
            
            // Create HttpServer instance with server configuration and request handling setup
            this.httpServer = config.httpServer;
            
            // Initialize RouteRegistry with route configuration and handler registration
            this.routeRegistry = config.routeRegistry;
            
            // Create HelloController instance with controller configuration and service integration
            this.helloController = config.helloController;
            
            // Set application state to INITIALIZING and initialize application metrics collection
            this.applicationState = APPLICATION_STATES.INITIALIZING;
            this.applicationMetrics = { ...DEFAULT_APPLICATION_METRICS };
            this.applicationMetrics.startupTime = Date.now();
            
            // Initialize application status flags and tracking
            this.isInitialized = false;
            this.isRunning = false;
            this.startTime = null;
            
            // Set up application event handlers for lifecycle management and component coordination
            setupApplicationEventHandlers(this, this.logger);
            
            // Emit initialization event
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_INITIALIZING, {
                applicationName: APPLICATION_CONFIG.name,
                version: APPLICATION_CONFIG.version,
                timestamp: new Date().toISOString()
            });
            
            // Validate complete application configuration and component integration readiness
            this._validateComponentIntegration();
            
            const constructorDuration = performance.now() - constructorStartTime;
            
            // Log successful application initialization with component status and configuration details
            this.logger.info('Application initialized successfully', {
                applicationName: APPLICATION_CONFIG.name,
                version: APPLICATION_CONFIG.version,
                initializationDuration: `${constructorDuration.toFixed(2)}ms`,
                componentsLoaded: {
                    appConfig: !!this.appConfig,
                    httpServer: !!this.httpServer,
                    routeRegistry: !!this.routeRegistry,
                    helloController: !!this.helloController,
                    logger: !!this.logger
                }
            });
            
            // Set isInitialized flag and mark application ready for startup procedures
            this.isInitialized = true;
            
        } catch (error) {
            const constructorDuration = performance.now() - constructorStartTime;
            
            this.logger?.error('Application initialization failed', {
                error: error.message,
                initializationDuration: `${constructorDuration.toFixed(2)}ms`
            }, error);
            
            this.applicationState = APPLICATION_STATES.ERROR;
            this.isInitialized = false;
            
            throw error;
        }
    }
    
    /**
     * Starts the complete application by initializing all components, starting the HTTP server,
     * and setting up the application for request processing with comprehensive error handling.
     * 
     * @param {Object} [startOptions={}] - Configuration options for application startup
     * @returns {Promise<void>} Resolves when application is fully started and ready, rejects on startup errors
     */
    async start(startOptions = {}) {
        const startupStartTime = performance.now();
        
        try {
            // Set application state to STARTING and record startup start time for performance tracking
            this.applicationState = APPLICATION_STATES.STARTING;
            this.startTime = new Date();
            
            // Emit APP_INITIALIZING event and log application startup initiation with configuration details
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_INITIALIZING, {
                startTime: this.startTime.toISOString(),
                configuration: APPLICATION_CONFIG,
                options: startOptions
            });
            
            this.logger.info('Starting application', {
                applicationName: APPLICATION_CONFIG.name,
                version: APPLICATION_CONFIG.version,
                startTime: this.startTime.toISOString(),
                configuration: this.appConfig.getApplicationInfo()
            });
            
            // Initialize RouteRegistry using initialize method to set up all application routes
            this.logger.debug('Initializing route registry');
            const routeInitResult = await this.routeRegistry.initialize({
                enableMetrics: APPLICATION_CONFIG.enableMetrics,
                enableSecurity: true
            });
            
            if (!routeInitResult.success) {
                throw new Error(`Route registry initialization failed: ${routeInitResult.errors.join(', ')}`);
            }
            
            // Validate RouteRegistry initialization and route coverage using validateRegistry method
            const registryValidation = this.routeRegistry.validateRegistry();
            if (!registryValidation.isValid) {
                this.logger.warn('Route registry validation warnings', {
                    warnings: registryValidation.warnings,
                    recommendations: registryValidation.recommendations
                });
            }
            
            // Start HttpServer using start method to bind to port and begin accepting connections
            this.logger.debug('Starting HTTP server');
            const serverConfig = this.appConfig.getServerConfig();
            
            await this.httpServer.start({
                port: serverConfig.port,
                hostname: serverConfig.hostname,
                routeRegistry: this.routeRegistry,
                helloController: this.helloController
            });
            
            // Wait for HttpServer to reach listening state with timeout protection for startup errors
            const serverReady = await this._waitForServerReady(startOptions.serverTimeout || APPLICATION_CONFIG.startupTimeout);
            if (!serverReady) {
                throw new Error('Server failed to reach ready state within timeout');
            }
            
            // Perform complete application health check using validateApplicationHealth method
            const healthValidation = await this.validateApplicationHealth();
            if (!healthValidation.success) {
                this.logger.warn('Application health check warnings detected', {
                    healthIssues: healthValidation.issues,
                    recommendations: healthValidation.recommendations
                });
            }
            
            // Set application state to RUNNING and update application metrics with startup information
            this.applicationState = APPLICATION_STATES.RUNNING;
            this.isRunning = true;
            
            const startupDuration = performance.now() - startupStartTime;
            this.applicationMetrics.startupTime = startupDuration;
            this.applicationMetrics.componentHealth = {
                httpServer: this.httpServer.validateServerHealth(),
                routeRegistry: this.routeRegistry.isInitialized(),
                helloController: this.helloController.isHealthy()
            };
            
            // Emit APP_READY event and log successful application startup with performance metrics
            const serverMetrics = this.httpServer.getServerMetrics();
            
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_STARTED, {
                startupTime: startupDuration,
                componentsReady: Object.keys(this.applicationMetrics.componentHealth).length,
                serverPort: serverConfig.port
            });
            
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_READY, {
                port: serverConfig.port,
                uptime: 0,
                healthStatus: healthValidation.success ? 'healthy' : 'warning',
                serverMetrics: serverMetrics
            });
            
            this.logger.info('Application started successfully', {
                applicationName: APPLICATION_CONFIG.name,
                port: serverConfig.port,
                startupDuration: `${startupDuration.toFixed(2)}ms`,
                componentHealth: this.applicationMetrics.componentHealth,
                applicationState: this.applicationState
            });
            
            // Return resolved promise indicating successful application startup and readiness
            return;
            
        } catch (error) {
            const startupDuration = performance.now() - startupStartTime;
            this.applicationState = APPLICATION_STATES.ERROR;
            this.isRunning = false;
            
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_ERROR, {
                errorType: 'startup_error',
                component: 'application',
                severity: 'high',
                startupDuration: `${startupDuration.toFixed(2)}ms`,
                error: error.message
            });
            
            this.logger.error('Application startup failed', {
                error: error.message,
                startupDuration: `${startupDuration.toFixed(2)}ms`,
                applicationState: this.applicationState
            }, error);
            
            throw error;
        }
    }
    
    /**
     * Gracefully stops the application by shutting down components, cleaning up resources,
     * and ensuring proper application termination with timeout protection.
     * 
     * @param {Object} [stopOptions={}] - Configuration options for application shutdown
     * @returns {Promise<void>} Resolves when application is fully stopped, rejects on shutdown timeout
     */
    async stop(stopOptions = {}) {
        const shutdownStartTime = performance.now();
        
        try {
            // Set application state to STOPPING and emit APP_STOPPING event for component notification
            this.applicationState = APPLICATION_STATES.STOPPING;
            
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_STOPPING, {
                reason: stopOptions.reason || 'manual',
                graceful: stopOptions.graceful !== false,
                timeout: stopOptions.timeout || APPLICATION_CONFIG.shutdownTimeout,
                timestamp: new Date().toISOString()
            });
            
            // Log application shutdown initiation with reason and graceful shutdown timeout settings
            this.logger.info('Application shutdown initiated', {
                reason: stopOptions.reason || 'manual',
                graceful: stopOptions.graceful !== false,
                timeout: stopOptions.timeout || APPLICATION_CONFIG.shutdownTimeout,
                uptime: this.getUptime()
            });
            
            const shutdownPromises = [];
            
            // Stop HttpServer using stop method to gracefully close connections and cleanup resources
            if (this.httpServer && typeof this.httpServer.stop === 'function') {
                this.logger.debug('Stopping HTTP server');
                const serverStopPromise = this.httpServer.stop({
                    graceful: stopOptions.graceful !== false,
                    timeout: stopOptions.serverTimeout || 5000
                }).catch(error => {
                    this.logger.error('HTTP server stop failed', { error: error.message });
                });
                shutdownPromises.push(serverStopPromise);
            }
            
            // Shutdown HelloController using shutdown method for graceful controller termination
            if (this.helloController && typeof this.helloController.shutdown === 'function') {
                this.logger.debug('Shutting down HelloController');
                const controllerShutdownPromise = this.helloController.shutdown({
                    graceful: stopOptions.graceful !== false,
                    timeout: stopOptions.controllerTimeout || 5000
                }).catch(error => {
                    this.logger.error('HelloController shutdown failed', { error: error.message });
                });
                shutdownPromises.push(controllerShutdownPromise);
            }
            
            // Wait for HttpServer shutdown completion with configurable timeout protection
            const shutdownTimeout = stopOptions.timeout || APPLICATION_CONFIG.shutdownTimeout;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Shutdown timeout exceeded')), shutdownTimeout);
            });
            
            await Promise.race([
                Promise.allSettled(shutdownPromises),
                timeoutPromise
            ]);
            
            // Clean up RouteRegistry resources and component references for memory management
            if (this.routeRegistry) {
                this.logger.debug('Cleaning up RouteRegistry resources');
                // RouteRegistry doesn't have explicit cleanup but we can clear references
                this.routeRegistry = null;
            }
            
            // Clean up application metrics, event handlers, and component references
            this._cleanupApplicationResources(stopOptions);
            
            // Set application state to STOPPED and emit APP_STOPPED event for lifecycle completion
            this.applicationState = APPLICATION_STATES.STOPPED;
            this.isRunning = false;
            
            const shutdownDuration = performance.now() - shutdownStartTime;
            const totalUptime = this.getUptime();
            const finalMetrics = this.getApplicationMetrics();
            
            this.eventEmitter.emit(APPLICATION_EVENTS.APP_STOPPED, {
                totalUptime: totalUptime,
                finalMetrics: finalMetrics,
                shutdownDuration: `${shutdownDuration.toFixed(2)}ms`,
                graceful: true
            });
            
            // Log successful application shutdown with uptime statistics and final metrics
            this.logger.info('Application stopped successfully', {
                totalUptime: totalUptime,
                shutdownDuration: `${shutdownDuration.toFixed(2)}ms`,
                finalMetrics: {
                    totalRequests: finalMetrics.requests?.total || 0,
                    totalErrors: finalMetrics.errors?.total || 0
                }
            });
            
            // Flush logger to ensure all log messages are written
            if (typeof this.logger.flush === 'function') {
                await this.logger.flush();
            }
            
            // Return resolved promise indicating successful application termination and cleanup
            return;
            
        } catch (error) {
            const shutdownDuration = performance.now() - shutdownStartTime;
            this.applicationState = APPLICATION_STATES.ERROR;
            
            this.logger.error('Application shutdown failed', {
                error: error.message,
                shutdownDuration: `${shutdownDuration.toFixed(2)}ms`
            }, error);
            
            throw error;
        }
    }
    
    /**
     * Performs comprehensive application health check including all components, dependencies,
     * and operational status with detailed health reporting.
     * 
     * @param {Object} [healthOptions={}] - Configuration options for health check behavior
     * @returns {Object} Application health status with component health, metrics, and diagnostic information
     */
    async getHealthStatus(healthOptions = {}) {
        const healthCheckStartTime = performance.now();
        
        try {
            // Check application state and initialization status for basic operational readiness
            const applicationStatus = {
                state: this.applicationState,
                isInitialized: this.isInitialized,
                isRunning: this.isRunning,
                uptime: this.getUptime()
            };
            
            // Validate HttpServer health using validateServerHealth method for server component status
            const serverHealth = this.httpServer ? 
                this.httpServer.validateServerHealth() : { healthy: false, error: 'Server not initialized' };
            
            // Check RouteRegistry health and route availability for routing component validation
            const routeRegistryHealth = this.routeRegistry ? {
                initialized: this.routeRegistry.isInitialized(),
                routeCount: this.routeRegistry.getAllRoutes()?.metadata?.totalRoutes || 0,
                validationStatus: this.routeRegistry.validateRegistry()
            } : { healthy: false, error: 'RouteRegistry not initialized' };
            
            // Validate HelloController health using isHealthy method for controller component status
            const helloControllerHealth = this.helloController ? {
                healthy: this.helloController.isHealthy(),
                controllerInfo: this.helloController.getControllerInfo(),
                metrics: this.helloController.getHelloControllerMetrics()
            } : { healthy: false, error: 'HelloController not initialized' };
            
            // Check application metrics and performance indicators against health thresholds
            const currentMetrics = this.getApplicationMetrics();
            const metricsHealth = {
                requestCount: currentMetrics.requests?.total || 0,
                errorRate: currentMetrics.errors?.rate || 0,
                averageResponseTime: currentMetrics.performance?.averageResponseTime || 0,
                withinThresholds: this._checkMetricsThresholds(currentMetrics)
            };
            
            // Validate component integration and dependency resolution for system coherence
            const integrationHealth = {
                allComponentsPresent: !!(this.appConfig && this.httpServer && 
                                       this.routeRegistry && this.helloController && this.logger),
                componentCommunication: this._validateComponentCommunication(),
                configurationConsistency: this._validateConfigurationConsistency()
            };
            
            // Assess overall health status
            const overallHealth = applicationStatus.isRunning &&
                                serverHealth.healthy &&
                                routeRegistryHealth.initialized &&
                                helloControllerHealth.healthy &&
                                integrationHealth.allComponentsPresent &&
                                metricsHealth.withinThresholds;
            
            const healthCheckDuration = performance.now() - healthCheckStartTime;
            
            // Compile comprehensive health status with component details and diagnostic information
            const healthStatus = {
                healthy: overallHealth,
                status: this.applicationState,
                timestamp: new Date().toISOString(),
                uptime: this.getUptime(),
                components: {
                    application: applicationStatus,
                    httpServer: serverHealth,
                    routeRegistry: routeRegistryHealth,
                    helloController: helloControllerHealth,
                    integration: integrationHealth
                },
                metrics: metricsHealth,
                performance: {
                    healthCheckDuration: `${healthCheckDuration.toFixed(2)}ms`,
                    startupTime: this.applicationMetrics.startupTime
                },
                recommendations: this._generateHealthRecommendations(overallHealth, {
                    serverHealth,
                    routeRegistryHealth,
                    helloControllerHealth,
                    integrationHealth,
                    metricsHealth
                })
            };
            
            this.logger.debug('Health check completed', {
                healthy: overallHealth,
                checkDuration: `${healthCheckDuration.toFixed(2)}ms`,
                componentHealth: {
                    server: serverHealth.healthy,
                    routes: routeRegistryHealth.initialized,
                    controller: helloControllerHealth.healthy,
                    integration: integrationHealth.allComponentsPresent
                }
            });
            
            // Return complete application health report with recommendations and status indicators
            return healthStatus;
            
        } catch (error) {
            const healthCheckDuration = performance.now() - healthCheckStartTime;
            
            this.logger.error('Health check failed', {
                error: error.message,
                checkDuration: `${healthCheckDuration.toFixed(2)}ms`
            }, error);
            
            return {
                healthy: false,
                status: APPLICATION_STATES.ERROR,
                error: error.message,
                timestamp: new Date().toISOString(),
                performance: {
                    healthCheckDuration: `${healthCheckDuration.toFixed(2)}ms`
                }
            };
        }
    }
    
    /**
     * Returns comprehensive application information including metadata, component status,
     * configuration, and operational statistics for monitoring and debugging.
     * 
     * @returns {Object} Application information with metadata, component details, and operational statistics
     */
    getApplicationInfo() {
        try {
            // Get application metadata from AppConfig.getApplicationInfo method
            const applicationMetadata = this.appConfig.getApplicationInfo();
            
            // Include application state, startup time, and lifecycle information
            const lifecycleInfo = {
                state: this.applicationState,
                isInitialized: this.isInitialized,
                isRunning: this.isRunning,
                startTime: this.startTime?.toISOString() || null,
                uptime: this.getUptime()
            };
            
            // Get HttpServer status and metrics using getServerStatus and getServerMetrics methods
            const serverInfo = this.httpServer ? {
                status: this.httpServer.getServerStatus(),
                metrics: this.httpServer.getServerMetrics(),
                isListening: this.httpServer.isListening()
            } : { error: 'HttpServer not initialized' };
            
            // Include RouteRegistry information using getAllRoutes method for route details
            const routingInfo = this.routeRegistry ? {
                routes: this.routeRegistry.getAllRoutes(),
                initialized: this.routeRegistry.isInitialized(),
                metrics: this.routeRegistry.getRegistryMetrics()
            } : { error: 'RouteRegistry not initialized' };
            
            // Get HelloController information using getControllerInfo method for controller status
            const controllerInfo = this.helloController ? 
                this.helloController.getControllerInfo() : 
                { error: 'HelloController not initialized' };
            
            // Include application performance metrics and health indicators
            const performanceMetrics = this.getApplicationMetrics();
            
            // Compile comprehensive application information with all component details and statistics
            return {
                application: {
                    ...APPLICATION_CONFIG,
                    metadata: applicationMetadata,
                    lifecycle: lifecycleInfo
                },
                components: {
                    httpServer: serverInfo,
                    routeRegistry: routingInfo,
                    helloController: controllerInfo
                },
                performance: performanceMetrics,
                configuration: {
                    serverConfig: this.appConfig.getServerConfig(),
                    logConfig: this.appConfig.getLogConfig(),
                    featureFlags: this.appConfig.getFeatureFlags(),
                    isDevelopment: this.appConfig.isDevelopment()
                },
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('Failed to get application info', {
                error: error.message
            }, error);
            
            return {
                application: {
                    name: APPLICATION_CONFIG.name,
                    version: APPLICATION_CONFIG.version,
                    state: this.applicationState || 'unknown'
                },
                error: 'Failed to retrieve complete application information',
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Main request processing method that coordinates the complete request-response pipeline
     * through component delegation and integration.
     * 
     * @param {Object} request - HTTP request object
     * @param {Object} response - HTTP response object
     * @returns {Promise<void>} Completes when request processing and response transmission are finished
     */
    async processRequest(request, response) {
        const requestStartTime = performance.now();
        
        try {
            // Generate request correlation ID and start performance measurement for request tracking
            const requestId = `app-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            request.requestId = requestId;
            
            // Update application metrics for request count and active request tracking
            this.applicationMetrics.requestCount++;
            
            this.logger.debug('Processing request through application', {
                requestId: requestId,
                method: request.method,
                url: request.url,
                timestamp: new Date().toISOString()
            });
            
            // Delegate request to HttpServer.handleRequest method for HTTP protocol processing
            if (!this.httpServer || typeof this.httpServer.handleRequest !== 'function') {
                throw new Error('HttpServer not available for request processing');
            }
            
            const requestContext = {
                requestId: requestId,
                application: this,
                routeRegistry: this.routeRegistry,
                helloController: this.helloController,
                startTime: requestStartTime
            };
            
            await this.httpServer.handleRequest(request, response, requestContext);
            
            // Track request completion and update application metrics with processing statistics
            const requestDuration = performance.now() - requestStartTime;
            this._updateRequestMetrics(requestDuration, true);
            
            this.logger.info('Request processed successfully', {
                requestId: requestId,
                method: request.method,
                url: request.url,
                duration: `${requestDuration.toFixed(2)}ms`
            });
            
            // Return completion status indicating successful request processing and response transmission
            return;
            
        } catch (error) {
            const requestDuration = performance.now() - requestStartTime;
            
            // Handle any application-level errors through comprehensive error handling and recovery
            this.applicationMetrics.errorCount++;
            this._updateRequestMetrics(requestDuration, false);
            
            // Log request completion with correlation ID and performance metrics for monitoring
            this.logger.error('Request processing failed', {
                requestId: request.requestId,
                method: request.method,
                url: request.url,
                duration: `${requestDuration.toFixed(2)}ms`,
                error: error.message
            }, error);
            
            // Send error response if response hasn't been sent yet
            if (!response.headersSent) {
                try {
                    response.writeHead(500, { 'Content-Type': 'text/plain' });
                    response.end('Internal Server Error');
                } catch (responseError) {
                    this.logger.error('Failed to send error response', {
                        responseError: responseError.message
                    });
                }
            }
            
            throw error;
        }
    }
    
    /**
     * Validates complete application health including component operational status, integration
     * points, and performance indicators.
     * 
     * @param {Object} [validationOptions={}] - Configuration options for health validation
     * @returns {Object} Application health validation result with component analysis and recommendations
     */
    async validateApplicationHealth(validationOptions = {}) {
        const validationStartTime = performance.now();
        
        try {
            // Validate application state and initialization completeness for operational readiness
            const stateValidation = {
                validState: [APPLICATION_STATES.RUNNING, APPLICATION_STATES.STARTING].includes(this.applicationState),
                isInitialized: this.isInitialized,
                hasStartTime: !!this.startTime
            };
            
            // Check HttpServer operational health using validateServerHealth method
            const serverHealthValidation = this.httpServer ? 
                this.httpServer.validateServerHealth() : 
                { healthy: false, error: 'HttpServer not available' };
            
            // Validate RouteRegistry completeness and route availability using validateRegistry method
            const routeRegistryValidation = this.routeRegistry ? 
                this.routeRegistry.validateRegistry() : 
                { isValid: false, error: 'RouteRegistry not available' };
            
            // Check HelloController health and service integration using isHealthy method
            const helloControllerValidation = this.helloController ? {
                healthy: this.helloController.isHealthy(),
                controllerMetrics: this.helloController.getHelloControllerMetrics()
            } : { healthy: false, error: 'HelloController not available' };
            
            // Validate component integration points and dependency resolution status
            const integrationValidation = {
                componentIntegration: this._validateComponentCommunication(),
                configurationConsistency: this._validateConfigurationConsistency(),
                eventSystemOperational: this._validateEventSystem()
            };
            
            // Check application performance metrics against operational thresholds and SLA requirements
            const currentMetrics = this.getApplicationMetrics();
            const performanceValidation = {
                withinThresholds: this._checkMetricsThresholds(currentMetrics),
                responseTimeAcceptable: currentMetrics.performance?.averageResponseTime < 1000,
                errorRateAcceptable: (currentMetrics.errors?.rate || 0) < 10
            };
            
            // Validate configuration consistency and feature flag operational status
            const configurationValidation = await validateApplicationConfiguration(this.appConfig, {
                httpServer: this.httpServer,
                routeRegistry: this.routeRegistry,
                helloController: this.helloController
            });
            
            // Assess overall health status
            const overallHealthy = stateValidation.validState &&
                                 stateValidation.isInitialized &&
                                 serverHealthValidation.healthy &&
                                 routeRegistryValidation.isValid &&
                                 helloControllerValidation.healthy &&
                                 integrationValidation.componentIntegration &&
                                 performanceValidation.withinThresholds;
            
            const validationDuration = performance.now() - validationStartTime;
            
            // Return comprehensive health validation with component analysis and operational recommendations
            return {
                success: overallHealthy,
                healthy: overallHealthy,
                timestamp: new Date().toISOString(),
                components: {
                    application: stateValidation,
                    httpServer: serverHealthValidation,
                    routeRegistry: routeRegistryValidation,
                    helloController: helloControllerValidation,
                    integration: integrationValidation
                },
                performance: performanceValidation,
                configuration: configurationValidation,
                metrics: currentMetrics,
                recommendations: this._generateHealthRecommendations(overallHealthy, {
                    stateValidation,
                    serverHealthValidation,
                    routeRegistryValidation,
                    helloControllerValidation,
                    performanceValidation
                }),
                metadata: {
                    validationDuration: `${validationDuration.toFixed(2)}ms`,
                    validationType: 'comprehensive-application-health'
                }
            };
            
        } catch (error) {
            const validationDuration = performance.now() - validationStartTime;
            
            this.logger.error('Application health validation failed', {
                error: error.message,
                validationDuration: `${validationDuration.toFixed(2)}ms`
            }, error);
            
            return {
                success: false,
                healthy: false,
                error: error.message,
                timestamp: new Date().toISOString(),
                metadata: {
                    validationDuration: `${validationDuration.toFixed(2)}ms`,
                    validationType: 'failed-health-validation'
                }
            };
        }
    }
    
    /**
     * Retrieves comprehensive application performance metrics including component metrics,
     * request statistics, and operational performance data.
     * 
     * @param {Object} [metricsOptions={}] - Configuration options for metrics collection
     * @returns {Object} Application metrics with component performance data and operational statistics
     */
    getApplicationMetrics(metricsOptions = {}) {
        try {
            // Get HttpServer metrics using getServerMetrics method for server performance data
            const serverMetrics = this.httpServer ? 
                this.httpServer.getServerMetrics() : 
                { error: 'HttpServer metrics unavailable' };
            
            // Get RouteRegistry metrics using getRegistryMetrics method for routing performance
            const routeRegistryMetrics = this.routeRegistry ? 
                this.routeRegistry.getRegistryMetrics() : 
                { error: 'RouteRegistry metrics unavailable' };
            
            // Get HelloController metrics using getHelloControllerMetrics method for controller statistics
            const helloControllerMetrics = this.helloController ? 
                this.helloController.getHelloControllerMetrics() : 
                { error: 'HelloController metrics unavailable' };
            
            // Calculate application-level metrics including uptime, request rates, and error rates
            const uptime = this.getUptime();
            const totalRequests = this.applicationMetrics.requestCount;
            const totalErrors = this.applicationMetrics.errorCount;
            
            const applicationLevelMetrics = {
                uptime: uptime,
                requests: {
                    total: totalRequests,
                    successful: totalRequests - totalErrors,
                    failed: totalErrors,
                    rate: uptime > 0 ? (totalRequests / (uptime / 1000)).toFixed(2) : 0
                },
                errors: {
                    total: totalErrors,
                    rate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : 0
                },
                performance: {
                    startupTime: this.applicationMetrics.startupTime,
                    averageResponseTime: this._calculateAverageResponseTime()
                }
            };
            
            // Aggregate component metrics into comprehensive application performance dashboard
            const aggregatedMetrics = {
                application: applicationLevelMetrics,
                components: {
                    httpServer: serverMetrics,
                    routeRegistry: routeRegistryMetrics,
                    helloController: helloControllerMetrics
                },
                system: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage()
                }
            };
            
            // Include health indicators and performance trends for operational monitoring
            aggregatedMetrics.health = {
                overall: this.isHealthy(),
                componentHealth: this.applicationMetrics.componentHealth,
                trends: this._calculatePerformanceTrends()
            };
            
            aggregatedMetrics.metadata = {
                timestamp: new Date().toISOString(),
                metricsVersion: '1.0.0',
                collectionTime: new Date().toISOString()
            };
            
            // Return complete application metrics for monitoring systems and performance analysis
            return aggregatedMetrics;
            
        } catch (error) {
            this.logger.error('Failed to get application metrics', {
                error: error.message
            }, error);
            
            return {
                error: 'Failed to retrieve application metrics',
                timestamp: new Date().toISOString(),
                basicMetrics: {
                    uptime: this.getUptime(),
                    state: this.applicationState,
                    isRunning: this.isRunning
                }
            };
        }
    }
    
    /**
     * Reloads application configuration and reinitializes components without stopping the
     * application for dynamic configuration updates.
     * 
     * @param {Object} newConfig - New configuration object for application reload
     * @returns {Promise<void>} Completes when configuration reload and component reinitialization are finished
     */
    async reload(newConfig) {
        const reloadStartTime = performance.now();
        
        try {
            this.logger.info('Starting application configuration reload', {
                timestamp: new Date().toISOString(),
                newConfigKeys: Object.keys(newConfig)
            });
            
            // Validate new configuration using validateApplicationConfiguration function
            const validationResult = await validateApplicationConfiguration(
                new AppConfig(newConfig.appConfig || {}),
                {
                    httpServer: this.httpServer,
                    routeRegistry: this.routeRegistry,
                    helloController: this.helloController
                }
            );
            
            if (!validationResult.success) {
                throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
            }
            
            // Create backup of current configuration for rollback capability and error recovery
            const configBackup = {
                appConfig: this.appConfig,
                applicationState: this.applicationState
            };
            
            try {
                // Reload AppConfig using reload method with new configuration settings
                if (newConfig.appConfig) {
                    const newAppConfig = new AppConfig(newConfig.appConfig);
                    const newConfigValidation = newAppConfig.validate();
                    
                    if (newConfigValidation.isValid) {
                        this.appConfig = newAppConfig;
                        this.logger.info('AppConfig reloaded successfully');
                    } else {
                        throw new Error('New AppConfig validation failed');
                    }
                }
                
                // Update HttpServer configuration using reload method without stopping server
                if (this.httpServer && newConfig.serverConfig) {
                    if (typeof this.httpServer.reload === 'function') {
                        await this.httpServer.reload(newConfig.serverConfig);
                        this.logger.info('HttpServer configuration reloaded');
                    }
                }
                
                // Reinitialize RouteRegistry with updated route configuration and handler settings
                if (this.routeRegistry && newConfig.routeConfig) {
                    const routeInitResult = await this.routeRegistry.initialize({
                        ...newConfig.routeConfig,
                        enableMetrics: APPLICATION_CONFIG.enableMetrics
                    });
                    
                    if (routeInitResult.success) {
                        this.logger.info('RouteRegistry reinitialized successfully');
                    } else {
                        this.logger.warn('RouteRegistry reinitialization had warnings', {
                            warnings: routeInitResult.errors
                        });
                    }
                }
                
                // Update HelloController configuration with new settings and service parameters
                if (this.helloController && newConfig.controllerConfig) {
                    if (typeof this.helloController.reload === 'function') {
                        await this.helloController.reload(newConfig.controllerConfig);
                        this.logger.info('HelloController configuration reloaded');
                    }
                }
                
                // Validate reloaded configuration and component compatibility across all components
                const postReloadValidation = await this.validateApplicationHealth();
                if (!postReloadValidation.healthy) {
                    this.logger.warn('Post-reload health check detected issues', {
                        healthIssues: postReloadValidation.recommendations
                    });
                }
                
                const reloadDuration = performance.now() - reloadStartTime;
                
                // Update application metrics and log successful configuration reload with changes applied
                this.logger.info('Application configuration reload completed successfully', {
                    reloadDuration: `${reloadDuration.toFixed(2)}ms`,
                    componentsReloaded: Object.keys(newConfig).length,
                    healthStatus: postReloadValidation.healthy ? 'healthy' : 'warning'
                });
                
                // Return resolved promise indicating successful configuration reload and component updates
                return;
                
            } catch (reloadError) {
                // Rollback to backup configuration on error
                this.logger.warn('Configuration reload failed, rolling back', {
                    error: reloadError.message
                });
                
                this.appConfig = configBackup.appConfig;
                this.applicationState = configBackup.applicationState;
                
                throw reloadError;
            }
            
        } catch (error) {
            const reloadDuration = performance.now() - reloadStartTime;
            
            this.logger.error('Application configuration reload failed', {
                error: error.message,
                reloadDuration: `${reloadDuration.toFixed(2)}ms`
            }, error);
            
            throw error;
        }
    }
    
    /**
     * Checks if the application is currently running and operational with all components active.
     * 
     * @returns {boolean} True if application is running and operational, false otherwise
     */
    isRunning() {
        try {
            // Check application state equals RUNNING for operational status confirmation
            const stateRunning = this.applicationState === APPLICATION_STATES.RUNNING;
            
            // Verify HttpServer is listening using isListening method for server operational status
            const serverListening = this.httpServer ? this.httpServer.isListening() : false;
            
            // Check RouteRegistry initialization using isInitialized method for routing availability
            const routesInitialized = this.routeRegistry ? this.routeRegistry.isInitialized() : false;
            
            // Return boolean result of complete application operational status
            return stateRunning && serverListening && routesInitialized && this.isRunning;
            
        } catch (error) {
            this.logger.error('Failed to check if application is running', {
                error: error.message
            }, error);
            return false;
        }
    }
    
    /**
     * Performs quick application health check including critical component status and
     * operational readiness.
     * 
     * @returns {boolean} True if application is healthy and operational, false otherwise
     */
    isHealthy() {
        try {
            // Check application is running using isRunning method for basic operational status
            const applicationRunning = this.applicationState === APPLICATION_STATES.RUNNING && this.isRunning;
            
            // Validate HttpServer health using validateServerHealth method for server status
            const serverHealthy = this.httpServer ? 
                this.httpServer.validateServerHealth().healthy : false;
            
            // Check HelloController health using isHealthy method for controller operational status
            const controllerHealthy = this.helloController ? 
                this.helloController.isHealthy() : false;
            
            // Return boolean result of overall application health and operational readiness
            return applicationRunning && serverHealthy && controllerHealthy;
            
        } catch (error) {
            this.logger.error('Health check failed', {
                error: error.message
            }, error);
            return false;
        }
    }
    
    /**
     * Returns application uptime in milliseconds since startup for monitoring and performance tracking.
     * 
     * @returns {number} Application uptime in milliseconds since startup
     */
    getUptime() {
        try {
            // Calculate uptime by subtracting startTime from current time
            if (!this.startTime) {
                return 0;
            }
            
            // Return uptime in milliseconds for monitoring and operational tracking
            return Date.now() - this.startTime.getTime();
            
        } catch (error) {
            this.logger.error('Failed to calculate uptime', {
                error: error.message
            }, error);
            return 0;
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Validates component integration during initialization.
     * @private
     */
    _validateComponentIntegration() {
        const requiredComponents = ['appConfig', 'httpServer', 'routeRegistry', 'helloController', 'logger'];
        const missingComponents = requiredComponents.filter(component => !this[component]);
        
        if (missingComponents.length > 0) {
            throw new Error(`Missing required components: ${missingComponents.join(', ')}`);
        }
        
        this.logger.debug('Component integration validation passed', {
            componentsValidated: requiredComponents.length,
            allComponentsPresent: true
        });
    }
    
    /**
     * Waits for server to reach ready state with timeout protection.
     * @private
     */
    async _waitForServerReady(timeout = 30000) {
        return new Promise((resolve) => {
            const checkInterval = 100; // Check every 100ms
            const maxChecks = timeout / checkInterval;
            let checks = 0;
            
            const checkServerReady = () => {
                checks++;
                
                if (this.httpServer && this.httpServer.isListening()) {
                    resolve(true);
                    return;
                }
                
                if (checks >= maxChecks) {
                    this.logger.error('Server ready timeout exceeded', {
                        timeout: timeout,
                        checks: checks
                    });
                    resolve(false);
                    return;
                }
                
                setTimeout(checkServerReady, checkInterval);
            };
            
            checkServerReady();
        });
    }
    
    /**
     * Updates request processing metrics.
     * @private
     */
    _updateRequestMetrics(duration, success) {
        try {
            if (success) {
                this.applicationMetrics.successCount = (this.applicationMetrics.successCount || 0) + 1;
            }
            
            // Update average response time calculation
            const totalRequests = this.applicationMetrics.requestCount;
            const currentAverage = this.applicationMetrics.averageResponseTime || 0;
            
            this.applicationMetrics.averageResponseTime = 
                ((currentAverage * (totalRequests - 1)) + duration) / totalRequests;
            
        } catch (error) {
            this.logger.error('Failed to update request metrics', {
                error: error.message
            }, error);
        }
    }
    
    /**
     * Calculates current average response time.
     * @private
     */
    _calculateAverageResponseTime() {
        return this.applicationMetrics.averageResponseTime || 0;
    }
    
    /**
     * Checks if metrics are within acceptable thresholds.
     * @private
     */
    _checkMetricsThresholds(metrics) {
        try {
            const errorRate = parseFloat(metrics.errors?.rate || 0);
            const avgResponseTime = parseFloat(metrics.performance?.averageResponseTime || 0);
            
            return errorRate < 10 && avgResponseTime < 1000; // 10% error rate, 1s response time
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Validates component communication capabilities.
     * @private
     */
    _validateComponentCommunication() {
        try {
            return !!(this.httpServer && this.routeRegistry && this.helloController) &&
                   typeof this.httpServer.handleRequest === 'function' &&
                   typeof this.routeRegistry.route === 'function' &&
                   typeof this.helloController.processRequest === 'function';
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Validates configuration consistency across components.
     * @private
     */
    _validateConfigurationConsistency() {
        try {
            const serverConfig = this.appConfig.getServerConfig();
            const logConfig = this.appConfig.getLogConfig();
            
            return !!(serverConfig && logConfig) &&
                   typeof serverConfig.port === 'number' &&
                   typeof logConfig.level === 'string';
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Validates event system operational status.
     * @private
     */
    _validateEventSystem() {
        try {
            return this.eventEmitter instanceof EventEmitter &&
                   this.eventEmitter.listenerCount() >= 0;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Generates health recommendations based on component status.
     * @private
     */
    _generateHealthRecommendations(isHealthy, componentStatuses) {
        const recommendations = [];
        
        if (!isHealthy) {
            recommendations.push('Application requires attention - check component health');
        }
        
        if (componentStatuses.serverHealthValidation && !componentStatuses.serverHealthValidation.healthy) {
            recommendations.push('HTTP Server requires health investigation');
        }
        
        if (componentStatuses.routeRegistryValidation && !componentStatuses.routeRegistryValidation.isValid) {
            recommendations.push('Route Registry requires validation and potential reconfiguration');
        }
        
        if (componentStatuses.helloControllerValidation && !componentStatuses.helloControllerValidation.healthy) {
            recommendations.push('Hello Controller requires health check and potential restart');
        }
        
        if (componentStatuses.performanceValidation && !componentStatuses.performanceValidation.withinThresholds) {
            recommendations.push('Performance metrics exceed acceptable thresholds - review load and optimization');
        }
        
        return recommendations;
    }
    
    /**
     * Calculates performance trends for monitoring.
     * @private
     */
    _calculatePerformanceTrends() {
        try {
            return {
                requestTrend: 'stable', // Could be enhanced with actual trend calculation
                errorTrend: this.applicationMetrics.errorCount > 0 ? 'increasing' : 'stable',
                responseTrend: 'stable'
            };
        } catch (error) {
            return { error: 'Unable to calculate trends' };
        }
    }
    
    /**
     * Cleans up application resources during shutdown.
     * @private
     */
    _cleanupApplicationResources(stopOptions) {
        try {
            // Remove all event listeners
            this.eventEmitter.removeAllListeners();
            
            // Clear component references
            this.httpServer = null;
            this.routeRegistry = null;
            this.helloController = null;
            
            // Reset metrics
            this.applicationMetrics = { ...DEFAULT_APPLICATION_METRICS };
            
            this.logger.debug('Application resources cleaned up successfully', {
                cleanupReason: stopOptions.reason || 'shutdown'
            });
            
        } catch (error) {
            this.logger.error('Failed to cleanup application resources', {
                error: error.message
            }, error);
        }
    }
}

// ============================================================================
// DEFAULT APPLICATION INSTANCE CREATION
// ============================================================================

/**
 * Create default application instance configured for immediate use in the tutorial server setup.
 * Provides pre-configured application ready for startup and request processing.
 */
let application = null;

// Initialize default application instance
async function initializeDefaultApplication() {
    try {
        application = await createApplication({
            configOptions: {
                environment: process.env.NODE_ENV || 'development',
                enableMetrics: APPLICATION_CONFIG.enableMetrics,
                enableHealthChecks: APPLICATION_CONFIG.enableHealthChecks
            }
        });
        
        // Configure application for immediate use
        const applicationInstance = {
            start: (options) => application.start(options),
            stop: (options) => application.stop(options),
            getHealthStatus: (options) => application.getHealthStatus(options),
            getApplicationInfo: () => application.getApplicationInfo()
        };
        
        return applicationInstance;
        
    } catch (error) {
        console.error('Failed to initialize default application:', error.message);
        return null;
    }
}

// Initialize default application instance
const defaultApplicationPromise = initializeDefaultApplication();

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export the main Application class
export { Application };

// Export utility functions for external use and testing
export { 
    createApplication,
    validateApplicationConfiguration,
    setupApplicationEventHandlers 
};

// Export application constants for external reference
export {
    APPLICATION_STATES,
    APPLICATION_EVENTS,
    APPLICATION_CONFIG,
    DEFAULT_APPLICATION_METRICS
};

// Export default application instance configured for immediate use
export { application };

// Default export for convenient access to configured application instance
export default await defaultApplicationPromise;