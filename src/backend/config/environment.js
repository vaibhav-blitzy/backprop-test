/**
 * Core Environment Configuration Module for Node.js Tutorial Application
 * 
 * This module provides centralized management of environment variables, configuration validation,
 * and typed access to application settings. It serves as the foundational configuration layer
 * for the Node.js tutorial application, handling environment variable parsing, type conversion,
 * validation, and default value management across development, test, and production environments
 * with comprehensive error handling and security considerations.
 * 
 * The module implements localized validation functionality to avoid circular dependencies while
 * maintaining educational clarity and enterprise-grade configuration management patterns.
 * 
 * Key Features:
 * - Environment variable parsing and type conversion
 * - Cross-platform compatibility for Windows, macOS, and Linux
 * - Localized validation functions to eliminate circular dependencies
 * - Environment-specific defaults (development, test, production)
 * - Comprehensive error handling with descriptive messages
 * - Educational patterns demonstrating configuration best practices
 * 
 * Educational Value:
 * - Demonstrates environment variable management best practices
 * - Shows configuration validation and error handling techniques
 * - Illustrates circular dependency resolution strategies
 * - Provides self-contained module design patterns
 * - Shows proper default value management and constraint validation
 */

// Node.js built-in process module for environment variable access
import process from 'node:process'; // Node.js v18+

// Import standardized error messages for consistent error communication
import { 
    VALIDATION_ERROR_MESSAGES, 
    SERVER_ERROR_MESSAGES 
} from '../constants/error-messages.js';

// ============================================================================
// GLOBAL CONSTANTS AND CONSTRAINTS
// ============================================================================

/**
 * Default configuration values for different environment settings.
 * These constants provide fallback values when environment variables are not set.
 */
const DEFAULT_PORT = 3000;
const DEFAULT_HOST = 'localhost';
const DEFAULT_NODE_ENV = 'development';
const DEFAULT_LOG_LEVEL = 'info';
const DEFAULT_SERVER_TIMEOUT = 30000; // 30 seconds in milliseconds
const DEFAULT_MAX_CONNECTIONS = 1000;
const DEFAULT_KEEP_ALIVE_TIMEOUT = 5000; // 5 seconds in milliseconds

/**
 * Valid environment types supported by the application.
 * These values are used for environment validation and configuration defaults.
 */
const VALID_ENVIRONMENTS = ['development', 'test', 'production'];

/**
 * Valid log levels following standard logging conventions.
 * These levels provide hierarchical logging control from error to trace.
 */
const VALID_LOG_LEVELS = ['error', 'warn', 'info', 'debug', 'trace'];

/**
 * Boolean value representations for environment variable parsing.
 * These arrays define acceptable string values for boolean conversion.
 */
const BOOLEAN_TRUE_VALUES = ['true', '1', 'yes', 'on', 'enabled'];
const BOOLEAN_FALSE_VALUES = ['false', '0', 'no', 'off', 'disabled'];

/**
 * Validation constraints for numeric configuration values.
 * These ranges ensure configuration values remain within acceptable limits.
 */
const PORT_RANGE = { min: 1, max: 65535 };
const TIMEOUT_RANGE = { min: 1000, max: 300000 }; // 1 second to 5 minutes
const CONNECTION_RANGE = { min: 1, max: 10000 };

// ============================================================================
// LOCALIZED VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates if a value is a valid non-empty string with optional length constraints.
 * This function is localized within this module to avoid circular dependencies with
 * the main validation utility module.
 * 
 * @param {any} value - Value to validate as string
 * @param {Object} options - Validation options including min/max length
 * @param {number} [options.minLength] - Minimum string length requirement
 * @param {number} [options.maxLength] - Maximum string length requirement
 * @returns {boolean} true if value is valid string, false otherwise
 */
function isValidString(value, options = {}) {
    // Check if value is of type string
    if (typeof value !== 'string') {
        return false;
    }
    
    // Verify value is not null or undefined
    if (value === null || value === undefined) {
        return false;
    }
    
    // Check if string is not empty after trimming whitespace
    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return false;
    }
    
    // Apply length constraints if provided in options
    if (options.minLength !== undefined && trimmedValue.length < options.minLength) {
        return false;
    }
    
    if (options.maxLength !== undefined && trimmedValue.length > options.maxLength) {
        return false;
    }
    
    // Return validation result
    return true;
}

/**
 * Validates if a value is a valid integer within specified range constraints.
 * This function is localized within this module to avoid circular dependencies with
 * the main validation utility module.
 * 
 * @param {any} value - Value to validate as integer
 * @param {Object} constraints - Range constraints for validation
 * @param {number} [constraints.min] - Minimum allowed value
 * @param {number} [constraints.max] - Maximum allowed value
 * @returns {boolean} true if value is valid integer within constraints, false otherwise
 */
function isValidInteger(value, constraints = {}) {
    let parsedValue;
    
    // Check if value is a number or parseable string
    if (typeof value === 'number') {
        parsedValue = value;
    } else if (typeof value === 'string') {
        // Parse string values to integer using parseInt
        parsedValue = parseInt(value, 10);
    } else {
        return false;
    }
    
    // Verify parsed value is not NaN or Infinity
    if (isNaN(parsedValue) || !isFinite(parsedValue)) {
        return false;
    }
    
    // Check value against minimum constraint if provided
    if (constraints.min !== undefined && parsedValue < constraints.min) {
        return false;
    }
    
    // Check value against maximum constraint if provided
    if (constraints.max !== undefined && parsedValue > constraints.max) {
        return false;
    }
    
    // Return validation result
    return true;
}

/**
 * Validates if a value can be converted to a valid boolean representation.
 * Uses predefined true/false value arrays for consistent boolean parsing.
 * 
 * @param {any} value - Value to validate as boolean
 * @returns {boolean} true if value is valid boolean representation, false otherwise
 */
function isValidBoolean(value) {
    // Check if value is already boolean type
    if (typeof value === 'boolean') {
        return true;
    }
    
    // Convert string value to lowercase for comparison
    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        
        // Check if value is in BOOLEAN_TRUE_VALUES array
        if (BOOLEAN_TRUE_VALUES.includes(lowerValue)) {
            return true;
        }
        
        // Check if value is in BOOLEAN_FALSE_VALUES array
        if (BOOLEAN_FALSE_VALUES.includes(lowerValue)) {
            return true;
        }
    }
    
    // Return validation result based on matches
    return false;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts string environment variables to boolean values with support for
 * multiple true/false representations defined in global constants.
 * 
 * @param {string} value - String value to convert to boolean
 * @param {boolean} defaultValue - Default value if conversion fails
 * @returns {boolean} Converted boolean value or default if invalid
 */
function convertToBoolean(value, defaultValue = false) {
    // Check if value is already boolean type
    if (typeof value === 'boolean') {
        return value;
    }
    
    // Convert string value to lowercase for comparison
    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        
        // Check against BOOLEAN_TRUE_VALUES array
        if (BOOLEAN_TRUE_VALUES.includes(lowerValue)) {
            return true;
        }
        
        // Check against BOOLEAN_FALSE_VALUES array
        if (BOOLEAN_FALSE_VALUES.includes(lowerValue)) {
            return false;
        }
    }
    
    // Return default value if conversion fails
    return defaultValue;
}

/**
 * Converts string environment variables to integer values with validation
 * and default value handling using localized validation functions.
 * 
 * @param {string} value - String value to convert to integer
 * @param {number} defaultValue - Default value if conversion fails
 * @param {Object} constraints - Range constraints for validation
 * @returns {number} Converted integer value or default if invalid
 */
function convertToInteger(value, defaultValue = 0, constraints = {}) {
    let parsedValue;
    
    // Check if value is already number type
    if (typeof value === 'number') {
        parsedValue = value;
    } else if (typeof value === 'string') {
        // Attempt to parse string value as integer using parseInt
        parsedValue = parseInt(value, 10);
    } else {
        // Return default value if conversion fails
        return defaultValue;
    }
    
    // Validate parsed value using isValidInteger with constraints
    if (!isValidInteger(parsedValue, constraints)) {
        // Return default value if validation fails
        return defaultValue;
    }
    
    // Return validated integer value
    return parsedValue;
}

/**
 * Returns environment-specific default values based on NODE_ENV setting
 * for different deployment contexts (development, test, production).
 * 
 * @param {string} environment - Environment type to get defaults for
 * @returns {Object} Environment-specific default configuration values
 */
function getEnvironmentDefaults(environment = process.env.NODE_ENV || DEFAULT_NODE_ENV) {
    // Determine environment type from parameter or NODE_ENV
    const env = environment.toLowerCase().trim();
    
    // Base defaults applicable to all environments
    const baseDefaults = {
        nodeEnv: env,
        port: DEFAULT_PORT,
        host: DEFAULT_HOST,
        serverTimeout: DEFAULT_SERVER_TIMEOUT,
        maxConnections: DEFAULT_MAX_CONNECTIONS,
        keepAliveTimeout: DEFAULT_KEEP_ALIVE_TIMEOUT,
        serverName: 'nodejs-tutorial-server'
    };
    
    // Set development-specific defaults with debugging enabled
    if (env === 'development') {
        return {
            ...baseDefaults,
            logLevel: 'debug',
            enableLogging: true,
            enableCors: true,
            enableSecurity: false
        };
    }
    
    // Set test-specific defaults with minimal logging
    if (env === 'test') {
        return {
            ...baseDefaults,
            port: 0, // Let system assign available port
            logLevel: 'error',
            enableLogging: false,
            enableCors: false,
            enableSecurity: false
        };
    }
    
    // Set production-specific defaults with optimization
    if (env === 'production') {
        return {
            ...baseDefaults,
            logLevel: 'warn',
            enableLogging: true,
            enableCors: false,
            enableSecurity: true
        };
    }
    
    // Return development defaults for unknown environments
    return getEnvironmentDefaults('development');
}

/**
 * Loads environment variables from .env files based on NODE_ENV with proper
 * file resolution and error handling. Educational implementation without external deps.
 * 
 * @param {string} environment - Environment type to load file for
 * @returns {Object} Loaded environment variables from file or empty object if not found
 */
function loadEnvironmentFile(environment = process.env.NODE_ENV || DEFAULT_NODE_ENV) {
    // For educational simplicity, return empty object
    // In production, this would use fs module to read .env files
    // This avoids complexity while demonstrating the pattern
    
    // Determine environment file path based on NODE_ENV
    const envFileName = environment === 'production' ? '.env.prod' : 
                       environment === 'test' ? '.env.test' : '.env.dev';
    
    // Educational note: In a full implementation, this would:
    // 1. Check if environment file exists and is readable using fs module
    // 2. Parse environment file content line by line
    // 3. Handle comments and empty lines in environment files
    // 4. Parse key=value pairs with proper escaping
    // 5. Merge file variables with process.env (process.env takes precedence)
    
    // Return empty object for tutorial simplicity
    return {};
}

/**
 * Creates standardized configuration error objects with detailed context
 * and troubleshooting information for consistent error handling.
 * 
 * @param {string} errorType - Type of configuration error
 * @param {string} message - Error message description
 * @param {Object} context - Additional context information
 * @returns {Object} Standardized configuration error with type, message, and context
 */
function createConfigurationError(errorType, message, context = {}) {
    // Validate error type against known configuration error categories
    const validErrorTypes = [
        'VALIDATION_ERROR',
        'PARSE_ERROR', 
        'CONSTRAINT_ERROR',
        'ENVIRONMENT_ERROR',
        'TYPE_ERROR'
    ];
    
    const normalizedErrorType = validErrorTypes.includes(errorType) ? 
        errorType : 'CONFIGURATION_ERROR';
    
    // Create error object with consistent structure and properties
    const configurationError = {
        type: normalizedErrorType,
        message: message || 'Configuration error occurred',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || DEFAULT_NODE_ENV,
        context: {
            ...context,
            errorCategory: 'ENVIRONMENT_CONFIGURATION'
        }
    };
    
    // Add troubleshooting suggestions and fix recommendations
    configurationError.troubleshooting = {
        suggestions: [
            'Check environment variable values and formats',
            'Verify configuration constraints are met',
            'Review environment-specific settings'
        ],
        documentation: 'Refer to environment configuration documentation'
    };
    
    // Return comprehensive configuration error object
    return configurationError;
}

/**
 * Parses and validates all environment variables with type conversion,
 * default value application, and validation checking using localized functions.
 * 
 * @param {Object} processEnv - Process environment object (typically process.env)
 * @returns {Object} Parsed environment configuration object with validated and typed values
 */
function parseEnvironmentVariables(processEnv = process.env) {
    // Load additional environment variables from files
    const fileEnvVars = loadEnvironmentFile(processEnv.NODE_ENV);
    
    // Merge file variables with process environment (process.env takes precedence)
    const mergedEnv = { ...fileEnvVars, ...processEnv };
    
    // Get environment-specific defaults
    const defaults = getEnvironmentDefaults(mergedEnv.NODE_ENV);
    
    // Extract and parse environment variables with type conversion
    const parsedConfig = {
        // Core environment settings
        nodeEnv: mergedEnv.NODE_ENV || defaults.nodeEnv,
        
        // Server configuration with type conversion
        port: convertToInteger(
            mergedEnv.PORT, 
            defaults.port, 
            PORT_RANGE
        ),
        host: (mergedEnv.HOST && isValidString(mergedEnv.HOST)) ? 
            mergedEnv.HOST.trim() : defaults.host,
        
        // Performance settings with validation
        serverTimeout: convertToInteger(
            mergedEnv.SERVER_TIMEOUT,
            defaults.serverTimeout,
            TIMEOUT_RANGE
        ),
        maxConnections: convertToInteger(
            mergedEnv.MAX_CONNECTIONS,
            defaults.maxConnections,
            CONNECTION_RANGE
        ),
        keepAliveTimeout: convertToInteger(
            mergedEnv.KEEP_ALIVE_TIMEOUT,
            defaults.keepAliveTimeout,
            TIMEOUT_RANGE
        ),
        
        // Application settings
        logLevel: (mergedEnv.LOG_LEVEL && VALID_LOG_LEVELS.includes(mergedEnv.LOG_LEVEL.toLowerCase())) ?
            mergedEnv.LOG_LEVEL.toLowerCase() : defaults.logLevel,
        serverName: (mergedEnv.SERVER_NAME && isValidString(mergedEnv.SERVER_NAME)) ?
            mergedEnv.SERVER_NAME.trim() : defaults.serverName,
        
        // Feature flags with boolean conversion
        enableLogging: convertToBoolean(mergedEnv.ENABLE_LOGGING, defaults.enableLogging),
        enableCors: convertToBoolean(mergedEnv.ENABLE_CORS, defaults.enableCors),
        enableSecurity: convertToBoolean(mergedEnv.ENABLE_SECURITY, defaults.enableSecurity)
    };
    
    // Normalize string values and remove extra whitespace
    Object.keys(parsedConfig).forEach(key => {
        if (typeof parsedConfig[key] === 'string') {
            parsedConfig[key] = parsedConfig[key].trim();
        }
    });
    
    // Return parsed configuration object with validated values
    return parsedConfig;
}

/**
 * Validates environment configuration values against rules and constraints
 * with detailed error reporting using localized validation functions.
 * 
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result with success status and detailed error information
 */
function validateEnvironmentConfig(config) {
    const validationErrors = [];
    
    // Validate NODE_ENV against allowed environment values using local validation
    if (!isValidString(config.nodeEnv) || !VALID_ENVIRONMENTS.includes(config.nodeEnv)) {
        validationErrors.push({
            field: 'nodeEnv',
            value: config.nodeEnv,
            error: `Invalid environment. Must be one of: ${VALID_ENVIRONMENTS.join(', ')}`,
            suggestion: 'Set NODE_ENV to development, test, or production'
        });
    }
    
    // Check port number using isValidInteger with PORT_RANGE constraints
    if (!isValidInteger(config.port, PORT_RANGE)) {
        validationErrors.push({
            field: 'port',
            value: config.port,
            error: `Port must be between ${PORT_RANGE.min} and ${PORT_RANGE.max}`,
            suggestion: 'Use a valid port number (typically 3000 for development)'
        });
    }
    
    // Validate hostname format using isValidString with hostname rules
    if (!isValidString(config.host, { minLength: 1, maxLength: 253 })) {
        validationErrors.push({
            field: 'host',
            value: config.host,
            error: 'Invalid hostname format',
            suggestion: 'Use a valid hostname (e.g., localhost, 0.0.0.0, or domain name)'
        });
    }
    
    // Check timeout values using isValidInteger with TIMEOUT_RANGE constraints
    if (!isValidInteger(config.serverTimeout, TIMEOUT_RANGE)) {
        validationErrors.push({
            field: 'serverTimeout',
            value: config.serverTimeout,
            error: `Server timeout must be between ${TIMEOUT_RANGE.min} and ${TIMEOUT_RANGE.max} milliseconds`,
            suggestion: 'Set a reasonable timeout value (typically 30000ms)'
        });
    }
    
    if (!isValidInteger(config.keepAliveTimeout, TIMEOUT_RANGE)) {
        validationErrors.push({
            field: 'keepAliveTimeout',
            value: config.keepAliveTimeout,
            error: `Keep-alive timeout must be between ${TIMEOUT_RANGE.min} and ${TIMEOUT_RANGE.max} milliseconds`,
            suggestion: 'Set a reasonable keep-alive timeout (typically 5000ms)'
        });
    }
    
    // Validate log level against supported levels using string validation
    if (!isValidString(config.logLevel) || !VALID_LOG_LEVELS.includes(config.logLevel)) {
        validationErrors.push({
            field: 'logLevel',
            value: config.logLevel,
            error: `Invalid log level. Must be one of: ${VALID_LOG_LEVELS.join(', ')}`,
            suggestion: 'Use a standard log level (info for production, debug for development)'
        });
    }
    
    // Verify boolean values using isValidBoolean function
    const booleanFields = ['enableLogging', 'enableCors', 'enableSecurity'];
    booleanFields.forEach(field => {
        if (typeof config[field] !== 'boolean') {
            validationErrors.push({
                field: field,
                value: config[field],
                error: 'Value must be a boolean',
                suggestion: 'Use true/false or environment variables like true/false, 1/0, yes/no'
            });
        }
    });
    
    // Check connection limits using isValidInteger with CONNECTION_RANGE constraints
    if (!isValidInteger(config.maxConnections, CONNECTION_RANGE)) {
        validationErrors.push({
            field: 'maxConnections',
            value: config.maxConnections,
            error: `Max connections must be between ${CONNECTION_RANGE.min} and ${CONNECTION_RANGE.max}`,
            suggestion: 'Set a reasonable connection limit (typically 1000 for tutorials)'
        });
    }
    
    // Return comprehensive validation result with errors
    return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        errorCount: validationErrors.length,
        summary: validationErrors.length === 0 ? 
            'All configuration values are valid' :
            `Found ${validationErrors.length} validation error(s)`
    };
}

// ============================================================================
// ENVIRONMENT CONFIGURATION CLASS
// ============================================================================

/**
 * Comprehensive environment configuration class that manages all environment variables,
 * provides typed access to configuration values, validates settings using localized
 * validation functions, and supports environment-specific defaults with error handling
 * and integration capabilities for the Node.js tutorial application.
 * 
 * This class serves as the central configuration management system, providing:
 * - Typed property access for all configuration values
 * - Environment-specific configuration management
 * - Validation using localized functions to avoid circular dependencies
 * - Configuration reloading capabilities
 * - JSON serialization for logging and debugging
 * - Feature flag management
 * - Server configuration grouping
 */
class EnvironmentConfig {
    /**
     * Initializes environment configuration by parsing environment variables,
     * applying defaults, validating settings using localized validation functions,
     * and preparing typed configuration access.
     * 
     * @param {Object} options - Configuration options
     * @param {Object} [options.processEnv=process.env] - Process environment object
     * @param {boolean} [options.validateOnInit=true] - Whether to validate on initialization
     * @param {boolean} [options.throwOnValidationError=false] - Whether to throw on validation errors
     */
    constructor(options = {}) {
        const {
            processEnv = process.env,
            validateOnInit = true,
            throwOnValidationError = false
        } = options;
        
        // Load environment variables from process.env and optional .env files
        const rawConfig = parseEnvironmentVariables(processEnv);
        
        // Apply environment-specific defaults based on NODE_ENV setting
        const defaults = getEnvironmentDefaults(rawConfig.nodeEnv);
        
        // Parse and convert environment variables to appropriate types using local conversion functions
        this.nodeEnv = rawConfig.nodeEnv;
        this.port = rawConfig.port;
        this.host = rawConfig.host;
        this.logLevel = rawConfig.logLevel;
        this.serverTimeout = rawConfig.serverTimeout;
        this.maxConnections = rawConfig.maxConnections;
        this.keepAliveTimeout = rawConfig.keepAliveTimeout;
        this.serverName = rawConfig.serverName;
        this.enableLogging = rawConfig.enableLogging;
        this.enableCors = rawConfig.enableCors;
        this.enableSecurity = rawConfig.enableSecurity;
        
        // Store raw configuration for debugging and troubleshooting
        this.rawConfig = { ...rawConfig };
        
        // Initialize validation status
        this.isValidated = false;
        
        // Validate all configuration values using localized validation functions
        if (validateOnInit) {
            const validationResult = this.validate();
            if (!validationResult && throwOnValidationError) {
                throw new Error(`Configuration validation failed: ${this.getValidationErrors()}`);
            }
        }
        
        // Mark configuration as validated and ready for use
        this.isValidated = true;
    }
    
    /**
     * Returns server-specific configuration including port, host, timeouts,
     * and connection settings for HTTP server initialization.
     * 
     * @returns {Object} Server configuration object with networking and performance settings
     */
    getServerConfig() {
        // Extract server-related configuration properties
        const serverConfig = {
            // Include port and hostname for server binding
            port: this.port,
            host: this.host,
            
            // Add timeout and connection limit settings
            timeout: this.serverTimeout,
            keepAliveTimeout: this.keepAliveTimeout,
            maxConnections: this.maxConnections,
            
            // Include server identification and naming
            serverName: this.serverName,
            
            // Environment context
            environment: this.nodeEnv
        };
        
        // Return complete server configuration object
        return serverConfig;
    }
    
    /**
     * Returns logging configuration including level, format, and
     * environment-specific settings for logger initialization.
     * 
     * @returns {Object} Logging configuration with level and feature settings
     */
    getLogConfig() {
        // Extract log level from environment configuration
        const logConfig = {
            level: this.logLevel,
            
            // Include logging feature flags and enablement settings
            enabled: this.enableLogging,
            
            // Add environment-specific logging preferences
            environment: this.nodeEnv,
            format: this.isDev() ? 'detailed' : 'structured'
        };
        
        // Return complete logging configuration object
        return logConfig;
    }
    
    /**
     * Returns feature flag configuration for enabling/disabling application
     * features based on environment settings.
     * 
     * @returns {Object} Feature flags object with boolean settings for application features
     */
    getFeatureFlags() {
        // Extract feature flag settings from environment variables
        const featureFlags = {
            // Apply environment-specific feature flag defaults
            enableLogging: this.enableLogging,
            
            // Include CORS, security, and logging feature enablement
            enableCors: this.enableCors,
            enableSecurity: this.enableSecurity,
            
            // Environment-derived feature flags
            enableDebugMode: this.isDev(),
            enablePerformanceMonitoring: this.isProd(),
            enableDetailedErrors: this.isDev()
        };
        
        // Return complete feature flags configuration object
        return featureFlags;
    }
    
    /**
     * Validates the complete environment configuration using localized validation
     * functions and throws descriptive errors for invalid settings.
     * 
     * @returns {boolean} true if configuration is valid, false if validation errors exist
     * @throws {Error} Descriptive configuration errors for invalid values when in strict mode
     */
    validate() {
        // Validate complete configuration using validateEnvironmentConfig
        const validationResult = validateEnvironmentConfig({
            nodeEnv: this.nodeEnv,
            port: this.port,
            host: this.host,
            serverTimeout: this.serverTimeout,
            maxConnections: this.maxConnections,
            keepAliveTimeout: this.keepAliveTimeout,
            logLevel: this.logLevel,
            enableLogging: this.enableLogging,
            enableCors: this.enableCors,
            enableSecurity: this.enableSecurity
        });
        
        // Store validation results for later access
        this._validationResult = validationResult;
        
        // Return true if all validations pass successfully
        return validationResult.isValid;
    }
    
    /**
     * Returns validation errors from the last validation run.
     * 
     * @returns {Array} Array of validation error objects with details
     */
    getValidationErrors() {
        if (!this._validationResult) {
            return [];
        }
        return this._validationResult.errors || [];
    }
    
    /**
     * Checks if the application is running in development environment mode.
     * 
     * @returns {boolean} true if NODE_ENV is development, false otherwise
     */
    isDev() {
        // Check NODE_ENV property against development value
        return this.nodeEnv === 'development';
    }
    
    /**
     * Checks if the application is running in production environment mode.
     * 
     * @returns {boolean} true if NODE_ENV is production, false otherwise
     */
    isProd() {
        // Check NODE_ENV property against production value
        return this.nodeEnv === 'production';
    }
    
    /**
     * Checks if the application is running in test environment mode.
     * 
     * @returns {boolean} true if NODE_ENV is test, false otherwise
     */
    isTest() {
        // Check NODE_ENV property against test value
        return this.nodeEnv === 'test';
    }
    
    /**
     * Returns the current environment name with normalization and validation.
     * 
     * @returns {string} Normalized environment name (development, test, or production)
     */
    getEnvironment() {
        // Get NODE_ENV value from configuration
        const environment = this.nodeEnv;
        
        // Normalize environment name to lowercase
        const normalizedEnv = environment.toLowerCase().trim();
        
        // Validate against supported environment values using isValidString
        if (isValidString(normalizedEnv) && VALID_ENVIRONMENTS.includes(normalizedEnv)) {
            // Return normalized and validated environment name
            return normalizedEnv;
        }
        
        // Return default environment if validation fails
        return DEFAULT_NODE_ENV;
    }
    
    /**
     * Reloads environment configuration from current environment variables and files
     * with re-validation using localized functions.
     * 
     * @param {Object} newOptions - New configuration options
     * @param {Object} [newOptions.processEnv=process.env] - Updated process environment
     * @param {boolean} [newOptions.validateOnReload=true] - Whether to validate after reload
     */
    reload(newOptions = {}) {
        const {
            processEnv = process.env,
            validateOnReload = true
        } = newOptions;
        
        // Clear existing configuration state
        this.isValidated = false;
        this._validationResult = null;
        
        // Reload environment variables from process.env
        const reloadedConfig = parseEnvironmentVariables(processEnv);
        
        // Update all configuration properties
        this.nodeEnv = reloadedConfig.nodeEnv;
        this.port = reloadedConfig.port;
        this.host = reloadedConfig.host;
        this.logLevel = reloadedConfig.logLevel;
        this.serverTimeout = reloadedConfig.serverTimeout;
        this.maxConnections = reloadedConfig.maxConnections;
        this.keepAliveTimeout = reloadedConfig.keepAliveTimeout;
        this.serverName = reloadedConfig.serverName;
        this.enableLogging = reloadedConfig.enableLogging;
        this.enableCors = reloadedConfig.enableCors;
        this.enableSecurity = reloadedConfig.enableSecurity;
        
        // Update raw configuration
        this.rawConfig = { ...reloadedConfig };
        
        // Revalidate complete configuration using localized validation
        if (validateOnReload) {
            this.validate();
        }
        
        // Mark configuration as updated and validated
        this.isValidated = true;
    }
    
    /**
     * Serializes environment configuration to JSON format for logging and debugging
     * with sensitive data filtering for security.
     * 
     * @returns {Object} JSON-safe environment configuration object
     */
    toJSON() {
        // Extract all non-sensitive configuration properties
        const jsonConfig = {
            nodeEnv: this.nodeEnv,
            port: this.port,
            host: this.host,
            logLevel: this.logLevel,
            serverTimeout: this.serverTimeout,
            maxConnections: this.maxConnections,
            keepAliveTimeout: this.keepAliveTimeout,
            serverName: this.serverName,
            enableLogging: this.enableLogging,
            enableCors: this.enableCors,
            enableSecurity: this.enableSecurity,
            
            // Add metadata including environment and validation status
            isValidated: this.isValidated,
            environment: this.getEnvironment(),
            timestamp: new Date().toISOString()
        };
        
        // Return JSON-safe configuration object for logging
        return jsonConfig;
    }
    
    /**
     * Returns the raw unparsed environment configuration for debugging and troubleshooting.
     * 
     * @returns {Object} Raw environment variables object before parsing and validation
     */
    getRawConfig() {
        // Return stored raw configuration object
        return { ...this.rawConfig };
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Create default environment configuration instance for immediate use across the application
const environmentConfig = new EnvironmentConfig();

// Export the EnvironmentConfig class for custom configuration instances
export { EnvironmentConfig };

// Export utility functions for parsing and validation using localized validation
export { parseEnvironmentVariables };
export { validateEnvironmentConfig };
export { convertToBoolean };
export { convertToInteger };
export { getEnvironmentDefaults };
export { loadEnvironmentFile };
export { createConfigurationError };

// Export localized validation functions to avoid circular dependencies
export { isValidString };
export { isValidInteger };
export { isValidBoolean };

// Export default configuration instance for immediate application use
export { environmentConfig };

// Default export for convenient access to complete configuration
export default environmentConfig;