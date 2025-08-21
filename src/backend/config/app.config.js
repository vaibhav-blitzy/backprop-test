/**
 * Main Application Configuration Module for Node.js Tutorial HTTP Server
 * 
 * This module provides comprehensive configuration management for the Node.js tutorial HTTP server
 * application. It integrates environment settings, server configuration, logging setup, and feature
 * flags into a unified configuration system while demonstrating production-ready configuration
 * management practices for Node.js applications.
 * 
 * Key Features:
 * - Unified configuration management integrating multiple configuration sources
 * - Environment-specific configuration with validation and type safety
 * - Feature flag management for educational and production features
 * - Configuration validation with comprehensive error reporting
 * - Educational patterns demonstrating enterprise configuration management
 * - Production-ready error handling and troubleshooting support
 * 
 * Educational Value:
 * - Demonstrates centralized configuration patterns and integration techniques
 * - Shows environment-specific configuration management and feature flags
 * - Illustrates comprehensive configuration validation and error handling
 * - Provides examples of configuration serialization and debugging support
 * - Shows integration patterns between multiple configuration modules
 * 
 * Architecture Integration:
 * - Integrates with EnvironmentConfig for environment variable management
 * - Uses ServerConfig for HTTP server options and connection settings
 * - Incorporates standardized constants for consistent application behavior
 * - Supports configuration reloading and runtime configuration updates
 * - Provides JSON serialization for logging and configuration debugging
 * 
 * @fileoverview Main application configuration module with comprehensive config management
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import environment configuration for environment variable management and validation
import { EnvironmentConfig } from './environment.js';

// Import server configuration for HTTP server setup and connection management
import { ServerConfig } from './server.config.js';

// Import standardized response messages for consistent application communication
import { 
    RESPONSE_MESSAGES, 
    SUCCESS_MESSAGES, 
    HELLO_ENDPOINT_MESSAGES,
    SERVER_STATUS_MESSAGES,
    TUTORIAL_MESSAGES
} from '../constants/response-messages.js';

// Import error messages for configuration validation and error handling
import { 
    ERROR_MESSAGES,
    VALIDATION_ERROR_MESSAGES,
    SERVER_ERROR_MESSAGES
} from '../constants/error-messages.js';

// Import HTTP method constants for application routing and validation
import { 
    HTTP_METHODS,
    HELLO_ENDPOINT_METHODS,
    SUPPORTED_METHODS
} from '../constants/http-methods.js';

// ============================================================================
// GLOBAL CONSTANTS AND APPLICATION METADATA
// ============================================================================

/**
 * Default application name for consistent identification across all components.
 * This constant provides standardized application identification for logging,
 * monitoring, and HTTP server headers.
 */
const DEFAULT_APP_NAME = 'Node.js Tutorial HTTP Server';

/**
 * Default application version for version management and compatibility tracking.
 * Used in server headers, logging, and configuration identification.
 */
const DEFAULT_APP_VERSION = '1.0.0';

/**
 * Default API version identifier for REST API versioning and client compatibility.
 * Supports API evolution and backward compatibility management.
 */
const DEFAULT_API_VERSION = 'v1';

/**
 * Application feature constants for feature flag management and capability identification.
 * These constants define the available features that can be enabled or disabled
 * based on environment settings and configuration requirements.
 * 
 * Each feature corresponds to specific application capabilities:
 * - HELLO_ENDPOINT: Core hello world endpoint functionality
 * - REQUEST_LOGGING: HTTP request/response logging capabilities
 * - ERROR_HANDLING: Comprehensive error handling and reporting
 * - CORS: Cross-Origin Resource Sharing support for browser clients
 * - SECURITY_HEADERS: Security header implementation for web protection
 */
const APPLICATION_FEATURES = {
    HELLO_ENDPOINT: 'hello_endpoint',
    REQUEST_LOGGING: 'request_logging', 
    ERROR_HANDLING: 'error_handling',
    CORS: 'cors',
    SECURITY_HEADERS: 'security_headers'
};

/**
 * Tutorial metadata constants providing educational context and learning objectives.
 * These constants enhance the educational value of the tutorial application by
 * providing clear learning objectives, difficulty assessment, and time estimates.
 * 
 * Educational components include:
 * - LEARNING_OBJECTIVES: Core skills and concepts covered in the tutorial
 * - DIFFICULTY_LEVEL: Tutorial complexity level for appropriate skill matching
 * - ESTIMATED_TIME: Expected completion time for tutorial exercises
 */
const TUTORIAL_METADATA = {
    LEARNING_OBJECTIVES: [
        'HTTP server creation with Node.js built-in modules',
        'Request-response handling patterns and lifecycle management', 
        'Configuration management best practices and patterns',
        'Error handling and logging implementation techniques'
    ],
    DIFFICULTY_LEVEL: 'beginner',
    ESTIMATED_TIME: '30 minutes'
};

// ============================================================================
// CONFIGURATION UTILITY FUNCTIONS
// ============================================================================

/**
 * Factory function that creates and validates a complete application configuration
 * by integrating environment, server, and feature settings with comprehensive validation.
 * 
 * This function demonstrates the factory pattern for configuration creation and provides
 * a centralized entry point for application configuration initialization with proper
 * error handling and validation support.
 * 
 * @param {Object} options - Configuration options for customization
 * @param {EnvironmentConfig} [options.environmentConfig] - Custom environment configuration
 * @param {ServerConfig} [options.serverConfig] - Custom server configuration  
 * @param {Object} [options.featureOverrides] - Feature flag overrides
 * @param {boolean} [options.validateOnCreate=true] - Enable validation during creation
 * @returns {AppConfig} Validated and integrated application configuration instance
 * 
 * @throws {Error} Configuration creation or validation errors with detailed context
 * 
 * @example
 * const appConfig = createAppConfig({
 *   featureOverrides: { cors: false },
 *   validateOnCreate: true
 * });
 */
function createAppConfig(options = {}) {
    try {
        // Initialize environment configuration with validation
        const environmentConfig = options.environmentConfig || new EnvironmentConfig({
            validateOnInit: true,
            throwOnValidationError: false
        });

        // Create server configuration with HTTP settings
        const serverConfig = options.serverConfig || new ServerConfig(environmentConfig);

        // Apply feature flag overrides if provided
        const configOptions = {
            environmentConfig,
            serverConfig,
            featureOverrides: options.featureOverrides || {},
            validateOnInit: options.validateOnCreate !== false
        };

        // Set up logging configuration based on environment settings
        configOptions.loggingConfig = {
            level: environmentConfig.getLogConfig().level,
            enabled: environmentConfig.getLogConfig().enabled,
            format: environmentConfig.isDev() ? 'detailed' : 'structured'
        };

        // Configure feature flags and application-specific settings
        const featureFlags = environmentConfig.getFeatureFlags();
        configOptions.features = {
            ...featureFlags,
            ...options.featureOverrides
        };

        // Create comprehensive application configuration instance
        const appConfig = new AppConfig(configOptions);

        // Validate complete configuration integrity
        if (options.validateOnCreate !== false) {
            const validationResult = appConfig.validate();
            if (!validationResult) {
                throw new Error(`Application configuration validation failed: ${appConfig.getValidationErrors()}`);
            }
        }

        // Apply environment-specific optimizations and defaults
        if (environmentConfig.isProd()) {
            // Production optimizations
            appConfig._applyProductionOptimizations();
        } else if (environmentConfig.isDev()) {
            // Development enhancements
            appConfig._applyDevelopmentEnhancements();
        }

        // Return comprehensive application configuration object
        return appConfig;

    } catch (error) {
        // Enhanced error context for configuration creation failures
        const enhancedError = new Error(`Failed to create application configuration: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            functionName: 'createAppConfig',
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };
        throw enhancedError;
    }
}

/**
 * Validates the complete application configuration and throws descriptive errors
 * for invalid settings with detailed validation context and troubleshooting information.
 * 
 * This function provides comprehensive configuration validation that checks all
 * configuration components for consistency, validity, and integration compliance.
 * 
 * @param {Object} config - Application configuration object to validate
 * @returns {boolean} true if configuration is valid, throws error if invalid
 * 
 * @throws {Error} Descriptive configuration errors with validation context and suggestions
 * 
 * @example
 * const isValid = validateAppConfig(appConfigInstance);
 * console.log('Configuration is valid:', isValid);
 */
function validateAppConfig(config) {
    const validationErrors = [];

    try {
        // Validate environment configuration settings
        if (!config.environment || typeof config.environment.validate !== 'function') {
            validationErrors.push('Invalid environment configuration: missing or invalid environment config object');
        } else {
            const envValidation = config.environment.validate();
            if (!envValidation) {
                validationErrors.push(`Environment configuration validation failed: ${config.environment.getValidationErrors()}`);
            }
        }

        // Check server configuration compliance  
        if (!config.server || typeof config.server.validate !== 'function') {
            validationErrors.push('Invalid server configuration: missing or invalid server config object');
        } else {
            const serverValidation = config.server.validate();
            if (!serverValidation) {
                validationErrors.push(`Server configuration validation failed: ${config.server.getValidationErrors()}`);
            }
        }

        // Verify logging configuration consistency
        if (!config.logging || typeof config.logging !== 'object') {
            validationErrors.push('Invalid logging configuration: missing or invalid logging config object');
        } else {
            if (!config.logging.level || typeof config.logging.level !== 'string') {
                validationErrors.push('Invalid logging level: must be a valid string');
            }
            if (typeof config.logging.enabled !== 'boolean') {
                validationErrors.push('Invalid logging enablement: must be boolean value');
            }
        }

        // Validate feature flag configurations
        if (!config.features || typeof config.features !== 'object') {
            validationErrors.push('Invalid feature configuration: missing or invalid features object');
        } else {
            // Validate each feature flag is boolean
            Object.keys(APPLICATION_FEATURES).forEach(featureKey => {
                const featureName = APPLICATION_FEATURES[featureKey];
                if (config.features.hasOwnProperty(featureName) && typeof config.features[featureName] !== 'boolean') {
                    validationErrors.push(`Invalid feature flag ${featureName}: must be boolean value`);
                }
            });
        }

        // Check application metadata and version information
        if (!config.application || typeof config.application !== 'object') {
            validationErrors.push('Invalid application configuration: missing application metadata');
        } else {
            if (!config.application.name || typeof config.application.name !== 'string') {
                validationErrors.push('Invalid application name: must be non-empty string');
            }
            if (!config.application.version || typeof config.application.version !== 'string') {
                validationErrors.push('Invalid application version: must be non-empty string');
            }
        }

        // Ensure configuration compatibility across components
        if (config.environment && config.server) {
            const envPort = config.environment.port;
            const serverPort = config.server.getPort();
            if (envPort !== serverPort) {
                validationErrors.push(`Port mismatch between environment (${envPort}) and server (${serverPort}) configurations`);
            }
        }

        // Throw descriptive errors for invalid configurations
        if (validationErrors.length > 0) {
            const error = new Error(`Configuration validation failed with ${validationErrors.length} error(s):\n${validationErrors.join('\n')}`);
            error.validationErrors = validationErrors;
            error.context = {
                validator: 'validateAppConfig',
                errorCount: validationErrors.length,
                timestamp: new Date().toISOString()
            };
            throw error;
        }

        // Return true if all validations pass successfully
        return true;

    } catch (error) {
        if (error.validationErrors) {
            throw error; // Re-throw validation errors with context
        }
        
        // Handle unexpected validation errors
        const validationError = new Error(`Unexpected error during configuration validation: ${error.message}`);
        validationError.originalError = error;
        validationError.context = {
            validator: 'validateAppConfig',
            unexpectedError: true,
            timestamp: new Date().toISOString()
        };
        throw validationError;
    }
}

/**
 * Returns feature-specific configuration including feature flags, endpoints, and 
 * capabilities based on environment with comprehensive feature management.
 * 
 * This function provides centralized feature configuration management with
 * environment-specific defaults and capability detection.
 * 
 * @param {string} environment - Environment type for feature configuration
 * @returns {Object} Feature configuration object with enabled features and settings
 * 
 * @example
 * const features = getFeatureConfig('development');
 * console.log('CORS enabled:', features.cors);
 */
function getFeatureConfig(environment) {
    // Determine environment-specific feature enablement
    const normalizedEnv = (environment || 'development').toLowerCase().trim();
    
    // Configure hello endpoint feature settings
    const baseFeatures = {
        [APPLICATION_FEATURES.HELLO_ENDPOINT]: true, // Always enabled for tutorial
        [APPLICATION_FEATURES.ERROR_HANDLING]: true, // Always enabled for robustness
    };

    // Set up request logging and monitoring features
    if (normalizedEnv === 'development') {
        baseFeatures[APPLICATION_FEATURES.REQUEST_LOGGING] = true;
        baseFeatures[APPLICATION_FEATURES.CORS] = true;
        baseFeatures[APPLICATION_FEATURES.SECURITY_HEADERS] = true;
    } else if (normalizedEnv === 'production') {
        baseFeatures[APPLICATION_FEATURES.REQUEST_LOGGING] = true;
        baseFeatures[APPLICATION_FEATURES.CORS] = false; // Disabled for security
        baseFeatures[APPLICATION_FEATURES.SECURITY_HEADERS] = true;
    } else if (normalizedEnv === 'test') {
        baseFeatures[APPLICATION_FEATURES.REQUEST_LOGGING] = false; // Minimal logging for tests
        baseFeatures[APPLICATION_FEATURES.CORS] = false;
        baseFeatures[APPLICATION_FEATURES.SECURITY_HEADERS] = false;
    }

    // Configure error handling and security features
    const featureConfig = {
        ...baseFeatures,
        environment: normalizedEnv,
        
        // Apply performance and optimization feature flags
        enableDebugMode: normalizedEnv === 'development',
        enablePerformanceMonitoring: normalizedEnv === 'production',
        enableDetailedErrors: normalizedEnv === 'development'
    };

    // Return complete feature configuration object
    return featureConfig;
}

/**
 * Returns application metadata including name, version, capabilities, and tutorial
 * information with comprehensive application identification.
 * 
 * This function provides centralized application metadata management for
 * identification, capabilities reporting, and tutorial context.
 * 
 * @returns {Object} Application metadata with identification and capability information
 * 
 * @example
 * const metadata = getAppMetadata();
 * console.log('App name:', metadata.name);
 * console.log('Learning objectives:', metadata.tutorial.learningObjectives);
 */
function getAppMetadata() {
    // Create application identification metadata
    const applicationInfo = {
        name: DEFAULT_APP_NAME,
        version: DEFAULT_APP_VERSION,
        apiVersion: DEFAULT_API_VERSION,
        
        // Include version and build information
        buildInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            buildDate: new Date().toISOString()
        }
    };

    // Add tutorial-specific metadata and learning objectives
    const tutorialInfo = {
        ...TUTORIAL_METADATA,
        
        // Include supported features and capabilities
        capabilities: Object.values(APPLICATION_FEATURES),
        
        // Add performance characteristics and limitations
        performanceCharacteristics: {
            maxConcurrentConnections: 1000,
            averageResponseTime: '< 10ms',
            supportedProtocols: ['HTTP/1.1'],
            maxRequestSize: '1MB'
        }
    };

    // Return complete application metadata object
    return {
        application: applicationInfo,
        tutorial: tutorialInfo,
        
        // Include supported features and endpoint capabilities
        features: Object.values(APPLICATION_FEATURES),
        endpoints: {
            hello: {
                path: '/hello',
                methods: HELLO_ENDPOINT_METHODS,
                description: 'Returns hello world response for tutorial demonstration'
            }
        },
        
        // Add metadata timestamps and versioning
        metadata: {
            generated: new Date().toISOString(),
            configVersion: '1.0.0',
            schemaVersion: 'v1'
        }
    };
}

/**
 * Merges multiple configuration objects with proper precedence and validation
 * to support flexible configuration composition and override management.
 * 
 * This function implements configuration merging with precedence rules:
 * 1. Base configuration provides defaults
 * 2. Environment configuration overrides base settings
 * 3. User configuration has highest precedence
 * 
 * @param {Object} baseConfig - Base configuration as foundation
 * @param {Object} environmentConfig - Environment-specific settings  
 * @param {Object} userConfig - User-provided configuration overrides
 * @returns {Object} Merged configuration with proper precedence handling
 * 
 * @throws {Error} Configuration merging errors with detailed context
 * 
 * @example
 * const merged = mergeConfigurations(baseConfig, envConfig, userConfig);
 */
function mergeConfigurations(baseConfig, environmentConfig, userConfig) {
    try {
        // Validate input configuration objects
        if (!baseConfig || typeof baseConfig !== 'object') {
            throw new Error('Base configuration must be a valid object');
        }
        if (!environmentConfig || typeof environmentConfig !== 'object') {
            throw new Error('Environment configuration must be a valid object');
        }
        if (!userConfig || typeof userConfig !== 'object') {
            throw new Error('User configuration must be a valid object');
        }

        // Apply base configuration as foundation
        const mergedConfig = {
            ...baseConfig
        };

        // Merge environment-specific settings with precedence
        Object.keys(environmentConfig).forEach(key => {
            if (environmentConfig[key] !== null && environmentConfig[key] !== undefined) {
                if (typeof environmentConfig[key] === 'object' && !Array.isArray(environmentConfig[key])) {
                    // Deep merge objects
                    mergedConfig[key] = {
                        ...(mergedConfig[key] || {}),
                        ...environmentConfig[key]
                    };
                } else {
                    // Direct assignment for primitives and arrays
                    mergedConfig[key] = environmentConfig[key];
                }
            }
        });

        // Apply user-provided configuration overrides
        Object.keys(userConfig).forEach(key => {
            if (userConfig[key] !== null && userConfig[key] !== undefined) {
                if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
                    // Deep merge objects with highest precedence
                    mergedConfig[key] = {
                        ...(mergedConfig[key] || {}),
                        ...userConfig[key]
                    };
                } else {
                    // User config has highest precedence
                    mergedConfig[key] = userConfig[key];
                }
            }
        });

        // Resolve configuration conflicts with proper precedence
        // User config > Environment config > Base config
        const precedenceMetadata = {
            mergeOrder: ['base', 'environment', 'user'],
            precedenceRules: 'user > environment > base',
            timestamp: new Date().toISOString()
        };
        mergedConfig._mergeMetadata = precedenceMetadata;

        // Validate merged configuration integrity
        const validationResult = validateMergedConfiguration(mergedConfig);
        if (!validationResult.isValid) {
            throw new Error(`Configuration merge validation failed: ${validationResult.errors.join(', ')}`);
        }

        // Return complete merged configuration object
        return mergedConfig;

    } catch (error) {
        const mergeError = new Error(`Configuration merge failed: ${error.message}`);
        mergeError.originalError = error;
        mergeError.context = {
            operation: 'mergeConfigurations',
            timestamp: new Date().toISOString()
        };
        throw mergeError;
    }
}

/**
 * Validates merged configuration for consistency and integrity.
 * Internal helper function for configuration merging validation.
 * 
 * @private
 * @param {Object} config - Merged configuration to validate
 * @returns {Object} Validation result with success status and errors
 */
function validateMergedConfiguration(config) {
    const errors = [];

    // Check for required configuration sections
    const requiredSections = ['environment', 'server', 'features', 'application'];
    requiredSections.forEach(section => {
        if (!config[section]) {
            errors.push(`Missing required configuration section: ${section}`);
        }
    });

    // Validate feature flag consistency
    if (config.features) {
        Object.keys(config.features).forEach(feature => {
            if (typeof config.features[feature] !== 'boolean') {
                errors.push(`Feature ${feature} must be boolean value`);
            }
        });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// ============================================================================
// MAIN APPLICATION CONFIGURATION CLASS
// ============================================================================

/**
 * Main application configuration class that integrates environment, server, logging, and
 * feature configurations into a unified configuration system. Provides comprehensive
 * configuration management with validation, type safety, and educational clarity for
 * the Node.js tutorial HTTP server application.
 * 
 * This class serves as the central configuration authority, providing:
 * - Unified access to all configuration settings
 * - Environment-specific configuration management with feature flags
 * - Configuration validation with comprehensive error reporting
 * - Integration with EnvironmentConfig and ServerConfig classes
 * - JSON serialization for debugging and logging support
 * - Configuration reloading capabilities for dynamic updates
 * - Educational patterns demonstrating enterprise configuration management
 */
class AppConfig {
    /**
     * Initializes the application configuration by integrating environment, server, and
     * feature settings with comprehensive validation and educational clarity.
     * 
     * The constructor demonstrates configuration integration patterns and provides
     * comprehensive error handling with detailed context for troubleshooting.
     * 
     * @param {Object} options - Configuration options for initialization
     * @param {EnvironmentConfig} [options.environmentConfig] - Environment configuration instance
     * @param {ServerConfig} [options.serverConfig] - Server configuration instance
     * @param {Object} [options.featureOverrides] - Feature flag overrides
     * @param {Object} [options.loggingConfig] - Logging configuration overrides
     * @param {boolean} [options.validateOnInit=true] - Enable validation during initialization
     * 
     * @throws {Error} Configuration initialization errors with detailed context
     */
    constructor(options = {}) {
        try {
            // Create and validate environment configuration instance
            this.environment = options.environmentConfig || new EnvironmentConfig({
                validateOnInit: true,
                throwOnValidationError: false
            });

            // Initialize server configuration with HTTP settings
            this.server = options.serverConfig || new ServerConfig(this.environment);

            // Set up logging configuration based on environment settings
            const envLogConfig = this.environment.getLogConfig();
            this.logging = {
                level: envLogConfig.level,
                enabled: envLogConfig.enabled,
                format: this.environment.isDev() ? 'detailed' : 'structured',
                timestamp: true,
                colors: this.environment.isDev(),
                ...options.loggingConfig
            };

            // Configure application features and capabilities
            const environmentFeatures = this.environment.getFeatureFlags();
            this.features = {
                ...getFeatureConfig(this.environment.getEnvironment()),
                ...environmentFeatures,
                ...options.featureOverrides
            };

            // Set up tutorial-specific metadata and learning objectives
            const appMetadata = getAppMetadata();
            this.application = {
                name: DEFAULT_APP_NAME,
                version: DEFAULT_APP_VERSION,
                apiVersion: DEFAULT_API_VERSION,
                environment: this.environment.getEnvironment(),
                ...appMetadata.application
            };

            this.tutorial = {
                ...appMetadata.tutorial,
                context: 'Node.js HTTP server tutorial application',
                purpose: 'Educational demonstration of HTTP server implementation'
            };

            // Apply environment-specific optimizations and defaults
            this._applyEnvironmentOptimizations();

            // Validate complete configuration integrity and compatibility
            if (options.validateOnInit !== false) {
                const validationResult = this.validate();
                if (!validationResult) {
                    throw new Error(`Configuration validation failed during initialization: ${this.getValidationErrors()}`);
                }
            }

            // Mark configuration as validated and ready for use
            this.isValidated = true;
            this._initializationTimestamp = new Date().toISOString();

        } catch (error) {
            const initError = new Error(`AppConfig initialization failed: ${error.message}`);
            initError.originalError = error;
            initError.context = {
                constructor: 'AppConfig',
                options: JSON.stringify(options, null, 2),
                timestamp: new Date().toISOString()
            };
            throw initError;
        }
    }

    /**
     * Returns complete server configuration including HTTP settings, connection management,
     * and security options for Node.js HTTP server initialization.
     * 
     * @returns {Object} Server configuration with HTTP options, headers, and connection settings
     * 
     * @example
     * const serverConfig = appConfig.getServerConfig();
     * const server = http.createServer(serverConfig.httpServerOptions);
     */
    getServerConfig() {
        try {
            // Extract server configuration from integrated settings
            const baseServerConfig = this.server.getHttpServerOptions();
            const connectionConfig = this.server.getConnectionConfig();
            const securityConfig = this.server.getSecurityConfig();

            // Include HTTP server options for Node.js http.createServer()
            const serverConfiguration = {
                // HTTP server options
                httpServerOptions: baseServerConfig,
                
                // Add default headers and security configuration
                defaultHeaders: this.server.getDefaultHeaders(),
                
                // Include connection management and timeout settings
                connection: connectionConfig,
                security: securityConfig,
                
                // Add performance optimization settings
                performance: {
                    timeout: baseServerConfig.timeout,
                    keepAliveTimeout: baseServerConfig.keepAliveTimeout,
                    maxHeaderSize: baseServerConfig.maxHeaderSize
                },

                // Environment context for server configuration
                environment: this.environment.getEnvironment(),
                port: this.server.getPort(),
                host: this.server.getHost()
            };

            // Return complete server configuration object
            return serverConfiguration;

        } catch (error) {
            throw new Error(`Failed to get server configuration: ${error.message}`);
        }
    }

    /**
     * Returns logging configuration including level, formatting, and environment-specific
     * settings for logger initialization and setup.
     * 
     * @returns {Object} Logging configuration with level, format, and feature settings
     * 
     * @example
     * const logConfig = appConfig.getLogConfig();
     * const logger = new Logger(logConfig);
     */
    getLogConfig() {
        // Extract logging configuration from environment settings
        const logConfiguration = {
            level: this.logging.level,
            enabled: this.logging.enabled,
            format: this.logging.format,
            
            // Include logging feature flags and enablement settings
            timestamp: this.logging.timestamp,
            colors: this.logging.colors,
            
            // Add environment-specific logging preferences
            environment: this.environment.getEnvironment(),
            requestLogging: this.features[APPLICATION_FEATURES.REQUEST_LOGGING] || false,
            errorLogging: this.features[APPLICATION_FEATURES.ERROR_HANDLING] || true
        };

        // Return complete logging configuration object
        return logConfiguration;
    }

    /**
     * Returns feature flag configuration for enabling/disabling application features
     * based on environment settings and configuration overrides.
     * 
     * @returns {Object} Feature flags object with boolean settings for application features
     * 
     * @example
     * const features = appConfig.getFeatureFlags();
     * if (features.cors) { enableCORS(); }
     */
    getFeatureFlags() {
        // Extract feature flags from environment and application settings
        const featureFlags = {
            // Include hello endpoint feature configuration
            [APPLICATION_FEATURES.HELLO_ENDPOINT]: this.features[APPLICATION_FEATURES.HELLO_ENDPOINT],
            
            // Add logging, security, and CORS feature flags
            [APPLICATION_FEATURES.REQUEST_LOGGING]: this.features[APPLICATION_FEATURES.REQUEST_LOGGING],
            [APPLICATION_FEATURES.ERROR_HANDLING]: this.features[APPLICATION_FEATURES.ERROR_HANDLING],
            [APPLICATION_FEATURES.CORS]: this.features[APPLICATION_FEATURES.CORS],
            [APPLICATION_FEATURES.SECURITY_HEADERS]: this.features[APPLICATION_FEATURES.SECURITY_HEADERS],
            
            // Apply environment-specific feature enablement
            enableDebugMode: this.features.enableDebugMode,
            enablePerformanceMonitoring: this.features.enablePerformanceMonitoring,
            enableDetailedErrors: this.features.enableDetailedErrors
        };

        // Return complete feature flags configuration object
        return featureFlags;
    }

    /**
     * Returns application information including name, version, environment, and capabilities
     * for identification and metadata reporting.
     * 
     * @returns {Object} Application information with metadata and capabilities
     * 
     * @example
     * const appInfo = appConfig.getApplicationInfo();
     * console.log(`Running ${appInfo.name} v${appInfo.version}`);
     */
    getApplicationInfo() {
        // Create application identification information
        const applicationInfo = {
            name: this.application.name,
            version: this.application.version,
            apiVersion: this.application.apiVersion,
            environment: this.application.environment,
            
            // Include version, environment, and build details
            runtime: {
                nodeVersion: process.version,
                platform: process.platform,
                architecture: process.arch,
                uptime: process.uptime()
            },
            
            // Add supported features and endpoint capabilities
            capabilities: Object.values(APPLICATION_FEATURES),
            endpoints: {
                hello: {
                    path: '/hello',
                    methods: HELLO_ENDPOINT_METHODS,
                    enabled: this.features[APPLICATION_FEATURES.HELLO_ENDPOINT]
                }
            }
        };

        // Return complete application information object
        return applicationInfo;
    }

    /**
     * Returns tutorial-specific configuration including learning objectives, metadata,
     * and educational settings for enhanced learning experience.
     * 
     * @returns {Object} Tutorial configuration with learning objectives and educational metadata
     * 
     * @example
     * const tutorialConfig = appConfig.getTutorialConfig();
     * console.log('Learning objectives:', tutorialConfig.learningObjectives);
     */
    getTutorialConfig() {
        // Extract tutorial metadata and learning objectives
        const tutorialConfiguration = {
            ...this.tutorial,
            
            // Include difficulty level and estimated completion time
            difficultyLevel: this.tutorial.difficultyLevel,
            estimatedTime: this.tutorial.estimatedTime,
            learningObjectives: this.tutorial.learningObjectives,
            
            // Add educational features and example configurations
            educationalFeatures: {
                stepByStepGuide: true,
                codeExamples: true,
                errorDemonstration: this.environment.isDev(),
                performanceMetrics: this.environment.isProd()
            },
            
            // Include tutorial-specific endpoint and response settings
            examples: {
                helloEndpoint: {
                    url: '/hello',
                    method: 'GET',
                    expectedResponse: RESPONSE_MESSAGES.HELLO_WORLD
                }
            }
        };

        // Return complete tutorial configuration object
        return tutorialConfiguration;
    }

    /**
     * Checks if a specific application feature is enabled based on feature flags and environment
     * configuration with comprehensive feature validation.
     * 
     * @param {string} featureName - Name of the feature to check
     * @returns {boolean} true if feature is enabled, false otherwise
     * 
     * @throws {Error} Invalid feature name errors
     * 
     * @example
     * if (appConfig.isFeatureEnabled('cors')) {
     *   // Enable CORS middleware
     * }
     */
    isFeatureEnabled(featureName) {
        // Validate feature name against known features
        if (!featureName || typeof featureName !== 'string') {
            throw new Error('Feature name must be a non-empty string');
        }

        const normalizedFeatureName = featureName.toLowerCase().trim();
        
        // Check if feature exists in APPLICATION_FEATURES
        const validFeatures = Object.values(APPLICATION_FEATURES);
        if (!validFeatures.includes(normalizedFeatureName)) {
            throw new Error(`Unknown feature: ${featureName}. Valid features: ${validFeatures.join(', ')}`);
        }

        // Check feature flag configuration for feature enablement
        const isEnabled = this.features[normalizedFeatureName];
        
        // Apply environment-specific feature restrictions
        if (this.environment.isTest() && normalizedFeatureName === APPLICATION_FEATURES.REQUEST_LOGGING) {
            return false; // Disable request logging in test environment
        }

        // Return feature enablement status
        return Boolean(isEnabled);
    }

    /**
     * Checks if the application is running in development environment.
     * 
     * @returns {boolean} true if development environment, false otherwise
     */
    isDevelopment() {
        // Check environment configuration for development mode
        return this.environment.isDev();
    }

    /**
     * Checks if the application is running in production environment.
     * 
     * @returns {boolean} true if production environment, false otherwise
     */
    isProduction() {
        // Check environment configuration for production mode
        return this.environment.isProd();
    }

    /**
     * Checks if the application is running in test environment.
     * 
     * @returns {boolean} true if test environment, false otherwise
     */
    isTest() {
        // Check environment configuration for test mode
        return this.environment.isTest();
    }

    /**
     * Validates the complete application configuration and throws errors for invalid
     * settings with comprehensive validation reporting.
     * 
     * @returns {boolean} true if configuration is valid
     * 
     * @throws {Error} Descriptive configuration errors with validation context
     */
    validate() {
        try {
            // Validate environment configuration using EnvironmentConfig.validate()
            const envValidation = this.environment.validate();
            if (!envValidation) {
                this._validationErrors = [`Environment validation failed: ${this.environment.getValidationErrors()}`];
                return false;
            }

            // Validate server configuration using ServerConfig.validate()
            const serverValidation = this.server.validate();
            if (!serverValidation) {
                this._validationErrors = [`Server validation failed: ${this.server.getValidationErrors()}`];
                return false;
            }

            // Check feature flag consistency and validity
            const featureValidation = this._validateFeatureFlags();
            if (!featureValidation.isValid) {
                this._validationErrors = featureValidation.errors;
                return false;
            }

            // Validate application metadata and version information
            const metadataValidation = this._validateApplicationMetadata();
            if (!metadataValidation.isValid) {
                this._validationErrors = metadataValidation.errors;
                return false;
            }

            // Verify configuration component compatibility
            const compatibilityValidation = this._validateComponentCompatibility();
            if (!compatibilityValidation.isValid) {
                this._validationErrors = compatibilityValidation.errors;
                return false;
            }

            // Clear any previous validation errors
            this._validationErrors = [];
            
            // Return true if all validations pass successfully
            return true;

        } catch (error) {
            this._validationErrors = [`Validation error: ${error.message}`];
            return false;
        }
    }

    /**
     * Returns validation errors from the last validation run.
     * 
     * @returns {Array} Array of validation error messages
     */
    getValidationErrors() {
        return this._validationErrors || [];
    }

    /**
     * Reloads application configuration from current environment and settings with
     * re-validation and comprehensive configuration refresh.
     * 
     * @param {Object} newOptions - New configuration options for reload
     * @param {EnvironmentConfig} [newOptions.environmentConfig] - Updated environment config
     * @param {Object} [newOptions.featureOverrides] - Updated feature overrides
     * @param {boolean} [newOptions.validateAfterReload=true] - Enable post-reload validation
     * 
     * @throws {Error} Configuration reload errors with detailed context
     */
    reload(newOptions = {}) {
        try {
            // Clear existing configuration state
            this.isValidated = false;
            this._validationErrors = [];

            // Reload environment configuration from current environment
            if (newOptions.environmentConfig) {
                this.environment = newOptions.environmentConfig;
            } else {
                this.environment.reload();
            }

            // Reinitialize server and logging configurations
            this.server = new ServerConfig(this.environment);
            
            const envLogConfig = this.environment.getLogConfig();
            this.logging = {
                level: envLogConfig.level,
                enabled: envLogConfig.enabled,
                format: this.environment.isDev() ? 'detailed' : 'structured',
                timestamp: true,
                colors: this.environment.isDev()
            };

            // Reapply feature flags and application settings
            this.features = {
                ...getFeatureConfig(this.environment.getEnvironment()),
                ...this.environment.getFeatureFlags(),
                ...newOptions.featureOverrides
            };

            // Update application metadata
            const appMetadata = getAppMetadata();
            this.application.environment = this.environment.getEnvironment();

            // Apply environment-specific optimizations
            this._applyEnvironmentOptimizations();

            // Revalidate complete configuration integrity
            if (newOptions.validateAfterReload !== false) {
                const validationResult = this.validate();
                if (!validationResult) {
                    throw new Error(`Configuration validation failed after reload: ${this.getValidationErrors()}`);
                }
            }

            // Update all configuration properties and mark as validated
            this.isValidated = true;
            this._reloadTimestamp = new Date().toISOString();

        } catch (error) {
            const reloadError = new Error(`Configuration reload failed: ${error.message}`);
            reloadError.originalError = error;
            reloadError.context = {
                method: 'reload',
                options: JSON.stringify(newOptions, null, 2),
                timestamp: new Date().toISOString()
            };
            throw reloadError;
        }
    }

    /**
     * Serializes application configuration to JSON format for logging and debugging
     * with sensitive data filtering for security.
     * 
     * @returns {Object} JSON-safe application configuration object
     * 
     * @example
     * console.log('Current config:', JSON.stringify(appConfig.toJSON(), null, 2));
     */
    toJSON() {
        // Extract all non-sensitive configuration properties
        const jsonConfig = {
            environment: this.environment.toJSON(),
            server: this.server.toJSON(),
            logging: { ...this.logging },
            features: { ...this.features },
            application: { ...this.application },
            tutorial: { ...this.tutorial },
            
            // Add metadata including environment and validation status
            metadata: {
                isValidated: this.isValidated,
                initializationTimestamp: this._initializationTimestamp,
                reloadTimestamp: this._reloadTimestamp,
                configurationVersion: '1.0.0'
            }
        };

        // Filter out sensitive information for security
        if (jsonConfig.environment && jsonConfig.environment.rawConfig) {
            delete jsonConfig.environment.rawConfig; // Remove raw env vars
        }

        // Return complete configuration for logging and debugging
        return jsonConfig;
    }

    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================

    /**
     * Applies environment-specific optimizations to the configuration.
     * @private
     */
    _applyEnvironmentOptimizations() {
        if (this.environment.isProd()) {
            this._applyProductionOptimizations();
        } else if (this.environment.isDev()) {
            this._applyDevelopmentEnhancements();
        } else if (this.environment.isTest()) {
            this._applyTestOptimizations();
        }
    }

    /**
     * Applies production-specific optimizations.
     * @private
     */
    _applyProductionOptimizations() {
        // Optimize for production performance
        this.logging.level = 'warn';
        this.logging.colors = false;
        this.features[APPLICATION_FEATURES.CORS] = false;
        this.features.enableDebugMode = false;
        this.features.enableDetailedErrors = false;
    }

    /**
     * Applies development-specific enhancements.
     * @private
     */
    _applyDevelopmentEnhancements() {
        // Enable development features
        this.logging.level = 'debug';
        this.logging.colors = true;
        this.features.enableDebugMode = true;
        this.features.enableDetailedErrors = true;
    }

    /**
     * Applies test-specific optimizations.
     * @private
     */
    _applyTestOptimizations() {
        // Minimize logging and features for testing
        this.logging.level = 'error';
        this.logging.enabled = false;
        this.features[APPLICATION_FEATURES.REQUEST_LOGGING] = false;
    }

    /**
     * Validates feature flag configuration.
     * @private
     */
    _validateFeatureFlags() {
        const errors = [];
        
        Object.keys(this.features).forEach(feature => {
            if (Object.values(APPLICATION_FEATURES).includes(feature)) {
                if (typeof this.features[feature] !== 'boolean') {
                    errors.push(`Feature ${feature} must be boolean value`);
                }
            }
        });

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Validates application metadata.
     * @private
     */
    _validateApplicationMetadata() {
        const errors = [];

        if (!this.application.name || typeof this.application.name !== 'string') {
            errors.push('Application name must be a non-empty string');
        }
        if (!this.application.version || typeof this.application.version !== 'string') {
            errors.push('Application version must be a non-empty string');
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Validates component compatibility.
     * @private
     */
    _validateComponentCompatibility() {
        const errors = [];

        // Check port consistency
        if (this.environment.port !== this.server.getPort()) {
            errors.push(`Port mismatch: environment=${this.environment.port}, server=${this.server.getPort()}`);
        }

        return { isValid: errors.length === 0, errors };
    }
}

// ============================================================================
// DEFAULT CONFIGURATION INSTANCE
// ============================================================================

// Create default application configuration instance for immediate use across the application
const appConfig = createAppConfig();

// ============================================================================
// MODULE EXPORTS  
// ============================================================================

// Export the AppConfig class for custom configuration instances
export { AppConfig };

// Export utility functions for configuration management
export { createAppConfig };
export { validateAppConfig };
export { getFeatureConfig };
export { getAppMetadata };
export { mergeConfigurations };

// Export global constants for feature and metadata management
export { APPLICATION_FEATURES };
export { TUTORIAL_METADATA };
export { DEFAULT_APP_NAME };
export { DEFAULT_APP_VERSION };
export { DEFAULT_API_VERSION };

// Export default configuration instance for immediate application use
export { appConfig };

// Default export for convenient access to complete configuration
export default appConfig;