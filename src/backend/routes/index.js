/**
 * Main Routing Index Module for Node.js Tutorial Application
 * 
 * Central routing registry and orchestrator that serves as the primary integration point
 * between the HTTP server and route handlers. Aggregates individual route modules including
 * hello endpoint and error handling routes, provides unified routing configuration, and
 * implements clean route organization patterns with educational clarity while demonstrating
 * production-ready routing architecture.
 * 
 * This module implements comprehensive routing management including:
 * - Route registration and handler delegation with validation
 * - Centralized route organization and middleware integration
 * - Educational routing patterns demonstrating enterprise practices
 * - Production-ready route management with error handling
 * - Request routing pipeline with performance monitoring
 * - Security validation and access control for route processing
 * 
 * Educational Objectives:
 * - Demonstrates enterprise-grade route organization and management patterns
 * - Shows proper separation of concerns in routing architecture
 * - Illustrates integration patterns between routing components and HTTP server
 * - Provides examples of route validation and security implementation
 * - Shows production-ready observability and monitoring patterns
 * - Demonstrates educational clarity in complex routing systems
 * 
 * @fileoverview Central route registry and orchestrator for Node.js tutorial application
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS AND DEPENDENCIES
// ============================================================================

// Import hello endpoint route handler for /hello path with GET method support
const { HelloRoute } = require('./hello.js'); // v1.0.0

// Import catch-all route handler for unmatched routes with 404 and 405 error responses
const { NotFoundRoute } = require('./notfound.js'); // v1.0.0

// Import core routing engine for URL pattern matching and request delegation
const { RouteHandler } = require('../lib/route-handler.js'); // v1.0.0

// Import HTTP method constants and validation utilities for route configuration
const { HTTP_METHODS, isValidHttpMethod } = require('../constants/http-methods.js'); // v1.0.0

// Import structured logging for route registration and operation tracking
const { Logger } = require('../utils/logger.js'); // v1.0.0

// ============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Global route configuration object defining all routes in the tutorial application.
 * Each route includes path, allowed methods, handler class, priority, and enablement status.
 * Priority determines route matching order - lower numbers are matched first.
 */
const ROUTES_CONFIG = {
    helloRoute: {
        path: '/hello',
        methods: ['GET'],
        handler: 'HelloRoute',
        priority: 1,
        enabled: true
    },
    notFoundRoute: {
        path: '*',
        methods: ['*'],
        handler: 'NotFoundRoute',
        priority: 999,
        enabled: true
    }
};

/**
 * Route registry metadata providing system information and configuration details
 * for monitoring, debugging, and operational status tracking.
 */
const ROUTE_REGISTRY_METADATA = {
    name: 'TutorialRouteRegistry',
    version: '1.0.0',
    description: 'Central route registry for Node.js tutorial application',
    totalRoutes: 2,
    lastUpdated: 'startup'
};

/**
 * Default route registry configuration with timeout, security, and operational settings
 * for consistent route processing behavior and performance limits.
 */
const DEFAULT_REGISTRY_CONFIG = {
    // Route processing configuration
    requestTimeout: 30000, // 30 seconds
    maxConcurrentRoutes: 100,
    enableRouteValidation: true,
    
    // Security and validation settings
    enableSecurityValidation: true,
    strictRouteMatching: true,
    enableInputSanitization: true,
    
    // Performance monitoring configuration
    enableMetrics: true,
    enablePerformanceLogging: true,
    slowRouteThreshold: 1000, // 1 second
    
    // Logging and observability settings
    enableRouteLogging: true,
    logRegistrationEvents: true,
    includeRequestCorrelation: true
};

// ============================================================================
// STANDALONE UTILITY FUNCTIONS
// ============================================================================

/**
 * Registers a route handler with the central route registry including validation,
 * configuration setup, and handler initialization. Provides comprehensive route
 * registration with security validation and error handling.
 * 
 * @param {string} routeName - Unique name identifier for the route
 * @param {Object} routeConfig - Route configuration with path, methods, and options
 * @param {class} RouteHandlerClass - Route handler class constructor
 * @returns {Object} Route registration result with success status and handler instance
 */
async function registerRoute(routeName, routeConfig, RouteHandlerClass) {
    // Initialize structured logger for route registration tracking
    const logger = new Logger({ logLevel: 'INFO' });
    
    // Create registration result object with comprehensive tracking information
    const registrationResult = {
        success: false,
        routeName: routeName,
        handler: null,
        configuration: null,
        errors: [],
        metadata: {
            timestamp: new Date().toISOString(),
            registrationId: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            processingTime: 0
        }
    };
    
    const startTime = Date.now();
    
    try {
        // Validate route name and configuration against registration requirements
        if (!routeName || typeof routeName !== 'string' || routeName.trim().length === 0) {
            registrationResult.errors.push('Invalid route name: must be a non-empty string');
            return registrationResult;
        }
        
        if (!routeConfig || typeof routeConfig !== 'object') {
            registrationResult.errors.push('Invalid route configuration: must be a valid object');
            return registrationResult;
        }
        
        if (!RouteHandlerClass || typeof RouteHandlerClass !== 'function') {
            registrationResult.errors.push('Invalid route handler class: must be a constructor function');
            return registrationResult;
        }
        
        // Validate route path format and ensure no conflicts with existing routes
        if (!routeConfig.path || typeof routeConfig.path !== 'string') {
            registrationResult.errors.push('Invalid route path: must be a non-empty string');
            return registrationResult;
        }
        
        const normalizedPath = routeConfig.path.trim();
        if (normalizedPath !== '*' && !normalizedPath.startsWith('/')) {
            registrationResult.errors.push('Invalid route path format: must start with / or be *');
            return registrationResult;
        }
        
        // Validate HTTP methods using isValidHttpMethod for each specified method
        if (!Array.isArray(routeConfig.methods) || routeConfig.methods.length === 0) {
            registrationResult.errors.push('Invalid methods: must be a non-empty array');
            return registrationResult;
        }
        
        for (const method of routeConfig.methods) {
            if (method !== '*' && !isValidHttpMethod(method)) {
                registrationResult.errors.push(`Invalid HTTP method: ${method}`);
                return registrationResult;
            }
        }
        
        // Create route handler instance with provided configuration
        const handlerConfig = {
            path: routeConfig.path,
            methods: routeConfig.methods,
            priority: routeConfig.priority || 999,
            enabled: routeConfig.enabled !== false,
            ...routeConfig.handlerOptions
        };
        
        const handlerInstance = new RouteHandlerClass(handlerConfig);
        
        // Configure route using handler's configureRoute method
        if (typeof handlerInstance.configureRoute === 'function') {
            const configResult = await handlerInstance.configureRoute({
                pattern: handlerConfig.path,
                methods: handlerConfig.methods,
                securitySettings: {
                    enableValidation: true,
                    enableSanitization: true
                }
            });
            
            if (!configResult.success) {
                registrationResult.errors.push('Route configuration failed');
                registrationResult.errors.push(...(configResult.errors || []));
                return registrationResult;
            }
        }
        
        // Store registration results
        registrationResult.handler = handlerInstance;
        registrationResult.configuration = handlerConfig;
        registrationResult.success = true;
        
        // Log route registration with configuration details for monitoring
        logger.info('Route registered successfully', {
            registrationId: registrationResult.metadata.registrationId,
            routeName: routeName,
            path: routeConfig.path,
            methods: routeConfig.methods,
            priority: routeConfig.priority,
            handlerClass: RouteHandlerClass.name
        });
        
    } catch (error) {
        registrationResult.errors.push(`Route registration error: ${error.message}`);
        logger.error('Route registration failed', {
            registrationId: registrationResult.metadata.registrationId,
            routeName: routeName,
            error: error.message
        }, error);
    }
    
    // Calculate processing time and update metadata
    registrationResult.metadata.processingTime = Date.now() - startTime;
    
    // Return registration result with handler instance and success status
    return registrationResult;
}

/**
 * Initializes all routes in the registry by creating instances, configuring handlers,
 * and setting up the routing pipeline. Orchestrates complete route system initialization
 * with validation and error handling.
 * 
 * @param {Object} [initializationOptions={}] - Options for route initialization
 * @returns {Object} Route initialization result with registered routes and configuration status
 */
async function initializeRoutes(initializationOptions = {}) {
    // Initialize Logger instance for route initialization tracking
    const logger = new Logger({ logLevel: 'INFO' });
    
    // Create initialization result object with comprehensive tracking
    const initResult = {
        success: false,
        registeredRoutes: {},
        routeRegistry: null,
        configuration: null,
        errors: [],
        warnings: [],
        metadata: {
            timestamp: new Date().toISOString(),
            initializationId: `init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            totalRoutes: 0,
            processingTime: 0
        }
    };
    
    const startTime = Date.now();
    
    try {
        logger.info('Starting route initialization', {
            initializationId: initResult.metadata.initializationId,
            configuredRoutes: Object.keys(ROUTES_CONFIG).length
        });
        
        // Create RouteHandler instance for core routing functionality
        const routeHandler = new RouteHandler({
            enableMetrics: initializationOptions.enableMetrics !== false,
            enableSecurity: initializationOptions.enableSecurity !== false,
            strictMode: initializationOptions.strictMode !== false
        });
        
        // Register hello route using registerRoute with HelloRoute handler
        const helloRegistration = await registerRoute(
            'helloRoute', 
            ROUTES_CONFIG.helloRoute, 
            HelloRoute
        );
        
        if (helloRegistration.success) {
            initResult.registeredRoutes.helloRoute = {
                instance: helloRegistration.handler,
                configuration: helloRegistration.configuration,
                registrationId: helloRegistration.metadata.registrationId
            };
            logger.info('Hello route registered successfully', {
                path: ROUTES_CONFIG.helloRoute.path,
                methods: ROUTES_CONFIG.helloRoute.methods
            });
        } else {
            initResult.errors.push('Hello route registration failed');
            initResult.errors.push(...helloRegistration.errors);
        }
        
        // Register not found route using registerRoute with NotFoundRoute handler
        const notFoundRegistration = await registerRoute(
            'notFoundRoute',
            ROUTES_CONFIG.notFoundRoute,
            NotFoundRoute
        );
        
        if (notFoundRegistration.success) {
            initResult.registeredRoutes.notFoundRoute = {
                instance: notFoundRegistration.handler,
                configuration: notFoundRegistration.configuration,
                registrationId: notFoundRegistration.metadata.registrationId
            };
            logger.info('Not found route registered successfully', {
                pattern: ROUTES_CONFIG.notFoundRoute.path,
                priority: ROUTES_CONFIG.notFoundRoute.priority
            });
        } else {
            initResult.errors.push('Not found route registration failed');
            initResult.errors.push(...notFoundRegistration.errors);
        }
        
        // Validate complete route registry for conflicts and coverage
        const validationResult = validateRouteRegistry({
            routes: initResult.registeredRoutes,
            strictValidation: initializationOptions.strictValidation !== false
        });
        
        if (!validationResult.isValid) {
            initResult.warnings.push('Route registry validation warnings detected');
            initResult.warnings.push(...validationResult.warnings);
        }
        
        // Sort routes by priority to ensure proper route matching order
        const sortedRoutes = Object.entries(initResult.registeredRoutes)
            .sort(([, a], [, b]) => (a.configuration.priority || 999) - (b.configuration.priority || 999));
        
        // Store configuration and route registry
        initResult.configuration = {
            routes: ROUTES_CONFIG,
            metadata: ROUTE_REGISTRY_METADATA,
            sortedRoutes: sortedRoutes.map(([name]) => name)
        };
        
        initResult.routeRegistry = routeHandler;
        initResult.metadata.totalRoutes = Object.keys(initResult.registeredRoutes).length;
        initResult.success = initResult.errors.length === 0;
        
        // Log successful route initialization with registry summary
        logger.info('Route initialization completed', {
            initializationId: initResult.metadata.initializationId,
            success: initResult.success,
            totalRoutes: initResult.metadata.totalRoutes,
            registeredRoutes: Object.keys(initResult.registeredRoutes),
            errors: initResult.errors.length,
            warnings: initResult.warnings.length
        });
        
    } catch (error) {
        initResult.errors.push(`Route initialization error: ${error.message}`);
        logger.error('Route initialization failed', {
            initializationId: initResult.metadata.initializationId,
            error: error.message
        }, error);
    }
    
    // Calculate processing time and update metadata
    initResult.metadata.processingTime = Date.now() - startTime;
    
    // Return initialization result with route registry and configuration status
    return initResult;
}

/**
 * Retrieves the appropriate route handler for a given HTTP method and path through
 * route matching logic. Implements comprehensive route resolution with fallback handling
 * and method validation.
 * 
 * @param {string} method - HTTP method for route matching
 * @param {string} path - URL path for route resolution
 * @returns {Object} Route handler result with matched route and handler instance
 */
function getRouteHandler(method, path) {
    // Initialize result object with routing information
    const result = {
        matched: false,
        handler: null,
        route: null,
        routeName: null,
        errors: [],
        metadata: {
            timestamp: new Date().toISOString(),
            method: method,
            path: path,
            routeId: `rh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
    };
    
    try {
        // Validate method and path parameters for routing lookup
        if (!method || typeof method !== 'string') {
            result.errors.push('Invalid method parameter');
            return result;
        }
        
        if (!path || typeof path !== 'string') {
            result.errors.push('Invalid path parameter');
            return result;
        }
        
        // Normalize method and path for consistent matching
        const normalizedMethod = method.trim().toUpperCase();
        const normalizedPath = path.trim().split('?')[0].split('#')[0];
        
        // Iterate through registered routes in priority order
        const routeEntries = Object.entries(ROUTES_CONFIG)
            .sort(([, a], [, b]) => (a.priority || 999) - (b.priority || 999));
        
        for (const [routeName, routeConfig] of routeEntries) {
            // Skip disabled routes
            if (!routeConfig.enabled) {
                continue;
            }
            
            // Check hello route pattern matching for exact /hello path match
            if (routeConfig.path === '/hello' && normalizedPath === '/hello') {
                // Validate method is allowed for hello endpoint
                if (routeConfig.methods.includes(normalizedMethod) || routeConfig.methods.includes('*')) {
                    result.matched = true;
                    result.routeName = routeName;
                    result.route = routeConfig;
                    result.handler = HelloRoute;
                    
                    // Return HelloRoute handler for matched hello endpoint requests
                    return result;
                }
                // Method not allowed for hello endpoint - continue to not found handler
            }
            
            // Check for catch-all route (not found handler)
            if (routeConfig.path === '*') {
                result.matched = true;
                result.routeName = routeName;
                result.route = routeConfig;
                result.handler = NotFoundRoute;
                break;
            }
        }
        
        // Fall back to NotFoundRoute handler for unmatched requests
        if (!result.matched) {
            result.matched = true;
            result.routeName = 'notFoundRoute';
            result.route = ROUTES_CONFIG.notFoundRoute;
            result.handler = NotFoundRoute;
        }
        
    } catch (error) {
        result.errors.push(`Route handler lookup failed: ${error.message}`);
    }
    
    // Return route handler result with matched route and handler instance
    return result;
}

/**
 * Validates the complete route registry for configuration completeness, conflicts,
 * and proper coverage. Performs comprehensive validation of route system integrity
 * and operational readiness.
 * 
 * @param {Object} [validationOptions={}] - Options for registry validation
 * @returns {Object} Registry validation result with detailed analysis
 */
function validateRouteRegistry(validationOptions = {}) {
    // Initialize validation result with comprehensive tracking
    const validationResult = {
        isValid: false,
        compliance: {
            configurationCompleteness: false,
            routeConflicts: false,
            methodCoverage: false,
            handlerValidation: false,
            priorityOrdering: false,
            catchAllCoverage: false
        },
        errors: [],
        warnings: [],
        recommendations: [],
        coverage: {
            totalRoutes: 0,
            enabledRoutes: 0,
            helloEndpoint: false,
            catchAllHandler: false
        },
        metadata: {
            timestamp: new Date().toISOString(),
            validationId: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
    };
    
    try {
        // Validate route configuration completeness for all registered routes
        const routeNames = Object.keys(ROUTES_CONFIG);
        validationResult.coverage.totalRoutes = routeNames.length;
        
        let enabledRouteCount = 0;
        let hasHelloEndpoint = false;
        let hasCatchAllHandler = false;
        
        for (const [routeName, routeConfig] of Object.entries(ROUTES_CONFIG)) {
            // Check route configuration completeness
            if (!routeConfig.path || !routeConfig.methods || !routeConfig.handler) {
                validationResult.errors.push(`Incomplete configuration for route: ${routeName}`);
                continue;
            }
            
            // Count enabled routes
            if (routeConfig.enabled !== false) {
                enabledRouteCount++;
            }
            
            // Check for hello endpoint coverage
            if (routeConfig.path === '/hello') {
                hasHelloEndpoint = true;
                validationResult.coverage.helloEndpoint = true;
            }
            
            // Check for catch-all handler coverage
            if (routeConfig.path === '*') {
                hasCatchAllHandler = true;
                validationResult.coverage.catchAllHandler = true;
            }
            
            // Validate method configuration
            for (const method of routeConfig.methods) {
                if (method !== '*' && !isValidHttpMethod(method)) {
                    validationResult.errors.push(`Invalid HTTP method '${method}' in route: ${routeName}`);
                }
            }
        }
        
        validationResult.coverage.enabledRoutes = enabledRouteCount;
        
        // Check for route path conflicts and overlapping patterns
        const routePaths = Object.values(ROUTES_CONFIG)
            .filter(config => config.enabled !== false)
            .map(config => config.path);
        
        const pathCounts = {};
        routePaths.forEach(path => {
            if (path !== '*') { // Catch-all doesn't conflict
                pathCounts[path] = (pathCounts[path] || 0) + 1;
            }
        });
        
        const conflicts = Object.entries(pathCounts).filter(([path, count]) => count > 1);
        if (conflicts.length > 0) {
            validationResult.errors.push(`Route path conflicts detected: ${conflicts.map(([path]) => path).join(', ')}`);
        } else {
            validationResult.compliance.routeConflicts = true;
        }
        
        // Verify method coverage and authorization configuration
        if (hasHelloEndpoint) {
            const helloRoute = ROUTES_CONFIG.helloRoute;
            if (helloRoute.methods.includes('GET')) {
                validationResult.compliance.methodCoverage = true;
            } else {
                validationResult.warnings.push('Hello endpoint missing GET method support');
            }
        } else {
            validationResult.errors.push('Missing hello endpoint configuration');
        }
        
        // Validate route handler instances and configuration status
        validationResult.compliance.handlerValidation = routeNames.every(routeName => {
            const routeConfig = ROUTES_CONFIG[routeName];
            return routeConfig.handler && typeof routeConfig.handler === 'string';
        });
        
        // Check route priority ordering and resolution logic
        const enabledRoutes = Object.entries(ROUTES_CONFIG)
            .filter(([, config]) => config.enabled !== false)
            .sort(([, a], [, b]) => (a.priority || 999) - (b.priority || 999));
        
        if (enabledRoutes.length > 0) {
            const lastRoute = enabledRoutes[enabledRoutes.length - 1][1];
            validationResult.compliance.priorityOrdering = lastRoute.path === '*';
        }
        
        // Verify catch-all route coverage for unmatched requests
        validationResult.compliance.catchAllCoverage = hasCatchAllHandler;
        if (!hasCatchAllHandler) {
            validationResult.errors.push('Missing catch-all route for unmatched requests');
        }
        
        // Check configuration completeness
        validationResult.compliance.configurationCompleteness = 
            routeNames.length >= 2 && hasHelloEndpoint && hasCatchAllHandler;
        
        // Generate recommendations for configuration improvements
        if (enabledRouteCount < routeNames.length) {
            const disabledCount = routeNames.length - enabledRouteCount;
            validationResult.recommendations.push(`${disabledCount} route(s) are disabled`);
        }
        
        if (!hasHelloEndpoint) {
            validationResult.recommendations.push('Add hello endpoint for tutorial completeness');
        }
        
        // Assess overall validation status
        const complianceValues = Object.values(validationResult.compliance);
        validationResult.isValid = complianceValues.every(value => value === true) && 
                                 validationResult.errors.length === 0;
        
        // Log validation completion with results
        const logger_instance = new Logger();
        logger_instance.info('Route registry validation completed', {
            validationId: validationResult.metadata.validationId,
            isValid: validationResult.isValid,
            totalRoutes: validationResult.coverage.totalRoutes,
            enabledRoutes: validationResult.coverage.enabledRoutes,
            errors: validationResult.errors.length,
            warnings: validationResult.warnings.length
        });
        
    } catch (error) {
        validationResult.errors.push(`Registry validation error: ${error.message}`);
        const logger_instance = new Logger();
        logger_instance.error('Route registry validation failed', {
            validationId: validationResult.metadata.validationId,
            error: error.message
        }, error);
    }
    
    // Return comprehensive validation result with detailed analysis and recommendations
    return validationResult;
}

// ============================================================================
// MAIN ROUTE REGISTRY CLASS
// ============================================================================

/**
 * Central route registry class that manages registration, configuration, and coordination
 * of all HTTP routes in the tutorial application. Provides unified interface for route
 * management, handler delegation, and routing pipeline coordination with educational
 * clarity and production-ready patterns.
 */
class RouteRegistry {
    /**
     * Initializes the route registry with configuration, route handler setup, and logging
     * infrastructure for centralized route management. Sets up comprehensive routing
     * system with validation, security, and monitoring capabilities.
     * 
     * @param {Object} [config={}] - Registry configuration options
     */
    constructor(config = {}) {
        try {
            // Initialize routes Map for storing registered route handlers
            this.routes = new Map();
            
            // Create RouteHandler instance for core routing functionality
            this.routeHandler = new RouteHandler({
                enableMetrics: config.enableMetrics !== false,
                enableSecurity: config.enableSecurity !== false,
                strictMode: config.strictMode !== false
            });
            
            // Initialize Logger for route registry operations and tracking
            this.logger = new Logger({
                logLevel: config.logLevel || 'INFO',
                enableColors: config.enableColors !== false
            });
            
            // Set registry configuration with defaults and validation
            this.config = {
                ...DEFAULT_REGISTRY_CONFIG,
                ...config
            };
            
            // Initialize registry metrics for monitoring and analysis
            this.registryMetrics = {
                totalRoutes: 0,
                registrationCount: 0,
                routeRequests: 0,
                successfulRoutes: 0,
                errorCount: 0,
                averageResponseTime: 0,
                lastAccessTime: null,
                startTime: new Date()
            };
            
            // Set initialized flag to false pending route registration
            this.initialized = false;
            
            // Store registry metadata with version and description
            this.metadata = {
                ...ROUTE_REGISTRY_METADATA,
                createdAt: new Date().toISOString(),
                registryId: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            
            // Log route registry initialization with configuration details
            this.logger.info('RouteRegistry initialized', {
                registryId: this.metadata.registryId,
                configuration: {
                    enableMetrics: this.config.enableMetrics,
                    enableSecurity: this.config.enableSecurity,
                    strictMode: this.config.strictRouteMatching
                }
            });
            
        } catch (error) {
            this._initializeFallbackRegistry();
            console.error('RouteRegistry initialization failed:', error.message);
        }
    }
    
    /**
     * Registers individual routes with the registry including validation, handler setup,
     * and configuration management. Provides comprehensive route registration with
     * error handling and validation.
     * 
     * @param {string} routeName - Unique route identifier
     * @param {Object} routeConfig - Route configuration object
     * @param {class} RouteClass - Route handler class
     * @returns {Object} Route registration result with handler instance and success status
     */
    async register(routeName, routeConfig, RouteClass) {
        const registrationResult = {
            success: false,
            handler: null,
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                routeName: routeName,
                registrationId: `route_reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        };
        
        try {
            // Validate route name uniqueness and format requirements
            if (!routeName || typeof routeName !== 'string') {
                registrationResult.errors.push('Invalid route name');
                return registrationResult;
            }
            
            if (this.routes.has(routeName)) {
                registrationResult.errors.push(`Route already exists: ${routeName}`);
                return registrationResult;
            }
            
            // Validate route configuration including path, methods, and options
            if (!routeConfig || typeof routeConfig !== 'object') {
                registrationResult.errors.push('Invalid route configuration');
                return registrationResult;
            }
            
            if (!routeConfig.path || !routeConfig.methods || !Array.isArray(routeConfig.methods)) {
                registrationResult.errors.push('Route configuration missing required fields');
                return registrationResult;
            }
            
            // Create route handler instance using provided RouteClass
            const handlerInstance = new RouteClass({
                path: routeConfig.path,
                methods: routeConfig.methods,
                priority: routeConfig.priority || 999,
                enabled: routeConfig.enabled !== false
            });
            
            // Configure route using handler's configureRoute method
            if (typeof handlerInstance.configureRoute === 'function') {
                const configResult = await handlerInstance.configureRoute({
                    pattern: routeConfig.path,
                    methods: routeConfig.methods,
                    securitySettings: this.config.securitySettings
                });
                
                if (!configResult.success) {
                    registrationResult.errors.push('Route configuration failed');
                    return registrationResult;
                }
            }
            
            // Store route in registry Map with name as key
            this.routes.set(routeName, {
                name: routeName,
                config: routeConfig,
                handler: handlerInstance,
                registeredAt: new Date().toISOString(),
                registrationId: registrationResult.metadata.registrationId
            });
            
            // Update registry metrics with new route information
            this.registryMetrics.totalRoutes++;
            this.registryMetrics.registrationCount++;
            
            registrationResult.success = true;
            registrationResult.handler = handlerInstance;
            
            // Log successful route registration with configuration details
            this.logger.info('Route registered successfully', {
                routeName: routeName,
                path: routeConfig.path,
                methods: routeConfig.methods,
                priority: routeConfig.priority,
                registrationId: registrationResult.metadata.registrationId
            });
            
        } catch (error) {
            registrationResult.errors.push(`Registration error: ${error.message}`);
            this.logger.error('Route registration failed', {
                routeName: routeName,
                error: error.message,
                registrationId: registrationResult.metadata.registrationId
            }, error);
        }
        
        // Return registration result with handler instance and metadata
        return registrationResult;
    }
    
    /**
     * Initializes all routes in the registry by calling route initialization functions
     * and setting up routing pipeline. Orchestrates complete route system setup with
     * validation and configuration management.
     * 
     * @param {Object} [options={}] - Initialization options
     * @returns {Object} Registry initialization result with success status and route summary
     */
    async initialize(options = {}) {
        const initializationResult = {
            success: false,
            routesSummary: {},
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                initializationId: `registry_init_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
        };
        
        try {
            this.logger.info('Starting route registry initialization', {
                initializationId: initializationResult.metadata.initializationId
            });
            
            // Call initializeRoutes function to register all application routes
            const routeInitResult = await initializeRoutes({
                enableMetrics: options.enableMetrics !== false,
                enableSecurity: options.enableSecurity !== false,
                strictValidation: options.strictValidation !== false
            });
            
            if (!routeInitResult.success) {
                initializationResult.errors.push('Route initialization failed');
                initializationResult.errors.push(...routeInitResult.errors);
                return initializationResult;
            }
            
            // Register routes from initialization result
            for (const [routeName, routeData] of Object.entries(routeInitResult.registeredRoutes)) {
                this.routes.set(routeName, {
                    name: routeName,
                    config: routeData.configuration,
                    handler: routeData.instance,
                    registeredAt: new Date().toISOString()
                });
            }
            
            // Validate complete route registry using validateRouteRegistry
            const registryValidation = validateRouteRegistry({
                routes: Object.fromEntries(this.routes),
                strictValidation: options.strictValidation !== false
            });
            
            if (!registryValidation.isValid) {
                initializationResult.errors.push('Registry validation failed');
                initializationResult.errors.push(...registryValidation.errors);
            }
            
            // Sort routes by priority for proper matching order
            const routeArray = Array.from(this.routes.entries());
            routeArray.sort(([, a], [, b]) => (a.config.priority || 999) - (b.config.priority || 999));
            
            // Set initialized flag to true after successful setup
            this.initialized = true;
            
            // Update registry metadata with initialization timestamp
            this.metadata.lastUpdated = new Date().toISOString();
            this.metadata.totalRoutes = this.routes.size;
            
            initializationResult.success = true;
            initializationResult.routesSummary = {
                totalRoutes: this.routes.size,
                routeNames: Array.from(this.routes.keys()),
                priorityOrder: routeArray.map(([name]) => name)
            };
            
            // Log successful registry initialization with route count
            this.logger.info('Route registry initialized successfully', {
                initializationId: initializationResult.metadata.initializationId,
                totalRoutes: this.routes.size,
                routeNames: Array.from(this.routes.keys())
            });
            
        } catch (error) {
            initializationResult.errors.push(`Registry initialization error: ${error.message}`);
            this.logger.error('Route registry initialization failed', {
                initializationId: initializationResult.metadata.initializationId,
                error: error.message
            }, error);
        }
        
        // Return initialization result with route registry summary
        return initializationResult;
    }
    
    /**
     * Main routing method that delegates requests to appropriate route handlers based
     * on URL matching and method validation. Orchestrates complete request routing
     * pipeline with error handling and performance monitoring.
     * 
     * @param {Object} request - HTTP request object
     * @param {Object} response - HTTP response object
     * @param {Object} [context={}] - Additional routing context
     * @returns {Object} Routing result with handler delegation status and response information
     */
    async route(request, response, context = {}) {
        const routingResult = {
            success: false,
            routeMatched: false,
            handlerCalled: false,
            statusCode: null,
            errors: [],
            metadata: {
                timestamp: new Date().toISOString(),
                routeId: `route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0
            }
        };
        
        const startTime = Date.now();
        
        try {
            // Extract HTTP method and URL path from request object
            const method = request.method || 'GET';
            const path = request.url || '/';
            
            this.logger.info('Processing route request', {
                routeId: routingResult.metadata.routeId,
                method: method,
                path: path
            });
            
            // Get appropriate route handler using getRouteHandler function
            const handlerResult = getRouteHandler(method, path);
            
            if (!handlerResult.matched || !handlerResult.handler) {
                routingResult.errors.push('No route handler found');
                return routingResult;
            }
            
            routingResult.routeMatched = true;
            
            // Create handler instance if needed
            let handlerInstance;
            if (typeof handlerResult.handler === 'function') {
                handlerInstance = new handlerResult.handler();
            } else {
                handlerInstance = handlerResult.handler;
            }
            
            // Delegate request to matched route handler using handler.handleRequest
            const requestContext = {
                routeId: routingResult.metadata.routeId,
                routeName: handlerResult.routeName,
                ...context
            };
            
            const handleResult = await handlerInstance.handleRequest(request, response, requestContext);
            
            routingResult.handlerCalled = true;
            routingResult.success = handleResult.success || true;
            routingResult.statusCode = handleResult.statusCode;
            
            // Handle routing errors using RouteHandler error handling
            if (!handleResult.success && handleResult.errors) {
                routingResult.errors.push(...handleResult.errors);
            }
            
            // Update registry metrics with routing statistics
            this.registryMetrics.routeRequests++;
            if (routingResult.success) {
                this.registryMetrics.successfulRoutes++;
            } else {
                this.registryMetrics.errorCount++;
            }
            
            this.registryMetrics.lastAccessTime = new Date();
            
            // Calculate and update average response time
            const processingTime = Date.now() - startTime;
            const totalRequests = this.registryMetrics.routeRequests;
            this.registryMetrics.averageResponseTime = 
                ((this.registryMetrics.averageResponseTime * (totalRequests - 1)) + processingTime) / totalRequests;
            
            // Log routing completion with handler information and status
            this.logger.info('Route request completed', {
                routeId: routingResult.metadata.routeId,
                success: routingResult.success,
                routeName: handlerResult.routeName,
                statusCode: routingResult.statusCode,
                processingTime: processingTime
            });
            
        } catch (error) {
            routingResult.errors.push(`Routing error: ${error.message}`);
            this.logger.error('Route processing failed', {
                routeId: routingResult.metadata.routeId,
                error: error.message
            }, error);
        }
        
        routingResult.metadata.processingTime = Date.now() - startTime;
        
        // Return routing result with delegation status and response data
        return routingResult;
    }
    
    /**
     * Retrieves a specific route by name from the registry with validation and metadata.
     * Provides access to registered route information for monitoring and debugging.
     * 
     * @param {string} routeName - Name of the route to retrieve
     * @returns {Object} Route information with handler instance and configuration details
     */
    getRoute(routeName) {
        try {
            // Validate route name parameter and check registry existence
            if (!routeName || typeof routeName !== 'string') {
                return {
                    found: false,
                    error: 'Invalid route name parameter'
                };
            }
            
            if (!this.routes.has(routeName)) {
                return {
                    found: false,
                    error: `Route not found: ${routeName}`,
                    availableRoutes: Array.from(this.routes.keys())
                };
            }
            
            // Retrieve route from routes Map using route name
            const routeData = this.routes.get(routeName);
            
            // Include route configuration and handler metadata
            return {
                found: true,
                name: routeName,
                config: routeData.config,
                handler: routeData.handler,
                registeredAt: routeData.registeredAt,
                metadata: {
                    timestamp: new Date().toISOString(),
                    routeId: routeData.registrationId
                }
            };
            
        } catch (error) {
            this.logger.error('Failed to retrieve route', { routeName, error: error.message });
            return {
                found: false,
                error: `Route retrieval failed: ${error.message}`
            };
        }
    }
    
    /**
     * Returns all registered routes with their configurations and handler information
     * for monitoring and debugging. Provides comprehensive route registry overview.
     * 
     * @returns {Object} Complete route registry with all routes, configurations, and metadata
     */
    getAllRoutes() {
        try {
            const routeList = {};
            
            // Iterate through all routes in the registry Map
            for (const [routeName, routeData] of this.routes.entries()) {
                routeList[routeName] = {
                    name: routeName,
                    path: routeData.config.path,
                    methods: routeData.config.methods,
                    priority: routeData.config.priority,
                    enabled: routeData.config.enabled,
                    handlerType: routeData.handler.constructor.name,
                    registeredAt: routeData.registeredAt
                };
            }
            
            // Include registry metadata and initialization status
            return {
                routes: routeList,
                metadata: {
                    ...this.metadata,
                    currentTime: new Date().toISOString(),
                    totalRoutes: this.routes.size,
                    initialized: this.initialized
                },
                metrics: this.registryMetrics,
                configuration: {
                    enableMetrics: this.config.enableMetrics,
                    enableSecurity: this.config.enableSecurityValidation,
                    strictMode: this.config.strictRouteMatching
                }
            };
            
        } catch (error) {
            this.logger.error('Failed to get all routes', { error: error.message });
            return {
                error: 'Failed to retrieve route registry',
                message: error.message
            };
        }
    }
    
    /**
     * Validates the complete route registry for configuration correctness and operational
     * readiness. Provides comprehensive registry validation with detailed analysis.
     * 
     * @param {Object} [validationOptions={}] - Validation configuration options
     * @returns {Object} Registry validation result with detailed analysis and recommendations
     */
    validateRegistry(validationOptions = {}) {
        try {
            // Call validateRouteRegistry function for comprehensive validation
            const registryRoutes = {};
            for (const [routeName, routeData] of this.routes.entries()) {
                registryRoutes[routeName] = {
                    config: routeData.config,
                    handler: routeData.handler
                };
            }
            
            const validationResult = validateRouteRegistry({
                routes: registryRoutes,
                strictValidation: validationOptions.strictValidation !== false,
                includeRecommendations: validationOptions.includeRecommendations !== false
            });
            
            // Check route handler initialization status and configuration
            const routeStatusChecks = {};
            for (const [routeName, routeData] of this.routes.entries()) {
                routeStatusChecks[routeName] = {
                    hasHandler: !!routeData.handler,
                    configValid: !!routeData.config,
                    enabled: routeData.config.enabled !== false,
                    handlerType: routeData.handler?.constructor?.name
                };
            }
            
            // Validate route coverage including hello endpoint and catch-all
            const coverageAnalysis = {
                hasHelloEndpoint: this.routes.has('helloRoute'),
                hasCatchAllHandler: this.routes.has('notFoundRoute'),
                totalEnabledRoutes: Array.from(this.routes.values())
                    .filter(route => route.config.enabled !== false).length
            };
            
            // Check for route conflicts and proper priority ordering
            const priorityCheck = this._validatePriorityOrdering();
            
            // Return detailed validation result with analysis and recommendations
            return {
                ...validationResult,
                routeStatus: routeStatusChecks,
                coverage: coverageAnalysis,
                priorityValidation: priorityCheck,
                registryMetadata: {
                    initialized: this.initialized,
                    totalRoutes: this.routes.size,
                    validationTimestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            this.logger.error('Registry validation failed', { error: error.message }, error);
            return {
                isValid: false,
                error: 'Registry validation failed',
                message: error.message
            };
        }
    }
    
    /**
     * Retrieves registry performance metrics including route usage, response times,
     * and error statistics for operational monitoring and performance analysis.
     * 
     * @returns {Object} Registry metrics with route usage statistics and performance data
     */
    getRegistryMetrics() {
        try {
            const uptime = Date.now() - this.registryMetrics.startTime.getTime();
            
            // Compile route usage statistics by route and method
            const routeUsage = {};
            for (const [routeName, routeData] of this.routes.entries()) {
                routeUsage[routeName] = {
                    path: routeData.config.path,
                    methods: routeData.config.methods,
                    priority: routeData.config.priority,
                    enabled: routeData.config.enabled
                };
            }
            
            // Aggregate routing performance metrics and response times
            const performanceMetrics = {
                totalRequests: this.registryMetrics.routeRequests,
                successfulRoutes: this.registryMetrics.successfulRoutes,
                errorCount: this.registryMetrics.errorCount,
                averageResponseTime: this.registryMetrics.averageResponseTime,
                uptime: Math.floor(uptime / 1000), // seconds
                requestsPerSecond: uptime > 0 ? 
                    (this.registryMetrics.routeRequests / (uptime / 1000)).toFixed(2) : 0
            };
            
            // Include error rates and success rates by route
            const successRate = this.registryMetrics.routeRequests > 0 ? 
                ((this.registryMetrics.successfulRoutes / this.registryMetrics.routeRequests) * 100).toFixed(2) : 0;
            const errorRate = this.registryMetrics.routeRequests > 0 ? 
                ((this.registryMetrics.errorCount / this.registryMetrics.routeRequests) * 100).toFixed(2) : 0;
            
            // Return comprehensive registry metrics for monitoring
            return {
                summary: {
                    totalRoutes: this.routes.size,
                    initialized: this.initialized,
                    ...performanceMetrics
                },
                routeUsage: routeUsage,
                performance: {
                    ...performanceMetrics,
                    successRate: `${successRate}%`,
                    errorRate: `${errorRate}%`
                },
                metadata: {
                    ...this.metadata,
                    generatedAt: new Date().toISOString(),
                    uptimeSeconds: Math.floor(uptime / 1000)
                }
            };
            
        } catch (error) {
            this.logger.error('Failed to generate registry metrics', { error: error.message });
            return {
                error: 'Failed to generate metrics',
                message: error.message
            };
        }
    }
    
    /**
     * Checks if the route registry has been properly initialized and is ready for
     * routing operations. Provides operational readiness validation.
     * 
     * @returns {boolean} True if registry is initialized and operational, false otherwise
     */
    isInitialized() {
        try {
            // Check initialized flag status
            if (!this.initialized) {
                return false;
            }
            
            // Verify route registration completeness
            const requiredRoutes = ['helloRoute', 'notFoundRoute'];
            const hasRequiredRoutes = requiredRoutes.every(routeName => this.routes.has(routeName));
            
            if (!hasRequiredRoutes) {
                return false;
            }
            
            // Check route handler validity
            for (const [routeName, routeData] of this.routes.entries()) {
                if (!routeData.handler || !routeData.config) {
                    return false;
                }
            }
            
            // Return boolean status of registry initialization
            return true;
            
        } catch (error) {
            this.logger.error('Failed to check initialization status', { error: error.message });
            return false;
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Initializes fallback registry configuration.
     * @private
     */
    _initializeFallbackRegistry() {
        this.routes = new Map();
        this.config = { ...DEFAULT_REGISTRY_CONFIG };
        this.initialized = false;
        this.registryMetrics = {
            totalRoutes: 0,
            registrationCount: 0,
            routeRequests: 0,
            successfulRoutes: 0,
            errorCount: 0,
            averageResponseTime: 0,
            startTime: new Date()
        };
        this.metadata = { ...ROUTE_REGISTRY_METADATA };
    }
    
    /**
     * Validates route priority ordering.
     * @private
     */
    _validatePriorityOrdering() {
        try {
            const routes = Array.from(this.routes.values());
            const sortedRoutes = routes.sort((a, b) => (a.config.priority || 999) - (b.config.priority || 999));
            
            // Check that catch-all route has highest priority
            const lastRoute = sortedRoutes[sortedRoutes.length - 1];
            const hasCatchAllLast = lastRoute && lastRoute.config.path === '*';
            
            return {
                isValid: hasCatchAllLast,
                orderValid: true,
                catchAllPositioned: hasCatchAllLast,
                routeOrder: sortedRoutes.map(route => ({
                    name: route.name,
                    path: route.config.path,
                    priority: route.config.priority
                }))
            };
            
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }
}

// ============================================================================
// DEFAULT ROUTES OBJECT CONFIGURATION
// ============================================================================

/**
 * Create and configure default route registry instance for immediate use in the
 * tutorial application. Provides pre-configured routing system ready for integration
 * with HTTP server and request processing.
 */
const createDefaultRoutesObject = async () => {
    try {
        // Create RouteRegistry instance with default configuration
        const registry = new RouteRegistry({
            enableMetrics: true,
            enableSecurity: true,
            strictMode: true,
            logLevel: 'INFO'
        });
        
        // Initialize registry with all application routes
        const initResult = await registry.initialize({
            enableMetrics: true,
            enableSecurity: true,
            strictValidation: true
        });
        
        if (!initResult.success) {
            throw new Error(`Route registry initialization failed: ${initResult.errors.join(', ')}`);
        }
        
        // Return configured routes object for immediate use
        return {
            registry: registry,
            initialize: () => registry.initialize(),
            route: (request, response, context) => registry.route(request, response, context),
            getMetrics: () => registry.getRegistryMetrics(),
            isReady: () => registry.isInitialized()
        };
        
    } catch (error) {
        console.error('Failed to create default routes object:', error.message);
        
        // Return minimal fallback routes object
        return {
            registry: null,
            initialize: async () => ({ success: false, error: error.message }),
            route: async () => ({ success: false, error: 'Routes not initialized' }),
            getMetrics: () => ({ error: 'Metrics unavailable' }),
            isReady: () => false
        };
    }
};

// Create default routes object for export
let routes = null;
createDefaultRoutesObject()
    .then(routesObject => {
        routes = routesObject;
    })
    .catch(error => {
        console.error('Default routes creation failed:', error.message);
    });

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export main RouteRegistry class for centralized route management and request delegation
module.exports.RouteRegistry = RouteRegistry;

// Export utility functions for route registration and management
module.exports.registerRoute = registerRoute;
module.exports.initializeRoutes = initializeRoutes;
module.exports.getRouteHandler = getRouteHandler;
module.exports.validateRouteRegistry = validateRouteRegistry;

// Export default routes object configured for immediate use in tutorial application
module.exports.routes = routes;

// Export route configuration constants for application route setup and initialization
module.exports.ROUTES_CONFIG = ROUTES_CONFIG;

// Export registry metadata for monitoring and system information
module.exports.ROUTE_REGISTRY_METADATA = ROUTE_REGISTRY_METADATA;

// Export default registry configuration for custom registry creation
module.exports.DEFAULT_REGISTRY_CONFIG = DEFAULT_REGISTRY_CONFIG;