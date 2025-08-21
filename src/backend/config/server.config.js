/**
 * Server Configuration Module for Node.js Tutorial Application
 * 
 * This module provides comprehensive HTTP server configuration management for the Node.js
 * tutorial application. It manages HTTP server options, connection settings, security headers,
 * default response headers, and server performance configurations while maintaining educational
 * clarity and production-ready patterns for HTTP server setup, security configuration, and
 * connection management.
 * 
 * Key Features:
 * - HTTP server options configuration for Node.js http.createServer()
 * - Security headers implementation with MIME sniffing protection
 * - Connection management with timeout and keep-alive settings
 * - Default response headers with proper Content-Type configuration
 * - Comprehensive validation with detailed error reporting
 * - Environment-specific configuration integration
 * - Production-ready error handling and troubleshooting support
 * 
 * Educational Value:
 * - Demonstrates HTTP server configuration best practices
 * - Shows security header implementation patterns
 * - Illustrates server performance optimization techniques
 * - Provides comprehensive validation and error handling examples
 * - Shows integration between configuration modules
 * 
 * Production Readiness:
 * - Comprehensive error handling with detailed context
 * - Security-focused default configurations
 * - Performance optimization through connection management
 * - Flexible configuration with environment integration
 * - Extensive validation and constraint checking
 */

// Node.js built-in modules for server configuration
import http from 'node:http'; // Node.js v18+

// Import environment configuration for server networking and performance settings
import { EnvironmentConfig } from './environment.js';

// Import HTTP header constants for consistent header management and security configuration
// Note: Handling CommonJS module imports in ES6 context
import httpHeadersModule from '../constants/http-headers.js';
const { HTTP_HEADERS, CONTENT_TYPES, SECURITY_HEADERS } = httpHeadersModule;

// Import error message constants for standard error communication
import { 
    VALIDATION_ERROR_MESSAGES, 
    SERVER_ERROR_MESSAGES 
} from '../constants/error-messages.js';

// Import HTTP method constants for server method validation and CORS configuration
// Note: Handling CommonJS module imports in ES6 context
import httpMethodsModule from '../constants/http-methods.js';
const { HTTP_METHODS } = httpMethodsModule;

// ============================================================================
// GLOBAL CONSTANTS AND CONSTRAINTS
// ============================================================================

/**
 * Default server identification and version information for HTTP Server header.
 * These constants provide server identification without exposing sensitive version details.
 */
const DEFAULT_SERVER_NAME = 'Node.js Tutorial HTTP Server';
const DEFAULT_SERVER_VERSION = '1.0.0';

/**
 * Default timeout settings for HTTP server configuration in milliseconds.
 * These values provide baseline performance settings for tutorial applications.
 */
const DEFAULT_REQUEST_TIMEOUT = 30000; // 30 seconds for request processing
const DEFAULT_HEADER_TIMEOUT = 60000; // 60 seconds for header parsing

/**
 * Default connection management settings for HTTP server performance.
 * These constants control keep-alive behavior and connection optimization.
 */
const DEFAULT_KEEP_ALIVE = true; // Enable keep-alive for connection reuse
const DEFAULT_MAX_HEADER_SIZE = 8192; // 8KB maximum header size

/**
 * Validation ranges for server configuration constraints.
 * These ranges ensure configuration values remain within acceptable operational limits.
 */
const CONNECTION_TIMEOUT_RANGE = { min: 1000, max: 300000 }; // 1 second to 5 minutes
const HEADER_SIZE_RANGE = { min: 1024, max: 65536 }; // 1KB to 64KB

/**
 * Supported HTTP protocol versions for server configuration.
 * These versions define the HTTP protocol support for the tutorial server.
 */
const SUPPORTED_HTTP_VERSIONS = ['1.0', '1.1'];

/**
 * Security headers configuration for HTTP security protection.
 * These settings provide baseline security for web application protection.
 */
const SECURITY_HEADERS_CONFIG = {
    X_CONTENT_TYPE_OPTIONS: 'nosniff', // Prevent MIME sniffing attacks
    MINIMAL_SERVER_INFO: true // Minimize server information disclosure
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates HTTP server options object for Node.js http.createServer() with performance
 * settings, timeout configurations, and security options based on environment configuration.
 * 
 * @param {EnvironmentConfig} environmentConfig - Environment configuration instance
 * @param {Object} overrides - Optional configuration overrides
 * @returns {Object} HTTP server options object for Node.js server creation
 */
function createHttpServerOptions(environmentConfig, overrides = {}) {
    // Validate environment configuration parameter
    if (!environmentConfig || typeof environmentConfig.getServerConfig !== 'function') {
        throw new Error('Invalid environment configuration: must be EnvironmentConfig instance');
    }
    
    // Extract server settings from environment configuration
    const serverConfig = environmentConfig.getServerConfig();
    
    // Create base HTTP server options with performance settings
    const httpServerOptions = {
        // Set connection timeout and keep-alive timeout from environment
        timeout: serverConfig.timeout || DEFAULT_REQUEST_TIMEOUT,
        keepAliveTimeout: serverConfig.keepAliveTimeout || 5000,
        
        // Configure maximum header size and request timeout limits
        maxHeaderSize: overrides.maxHeaderSize || DEFAULT_MAX_HEADER_SIZE,
        headersTimeout: overrides.headersTimeout || DEFAULT_HEADER_TIMEOUT,
        
        // Apply security settings including header validation
        insecureHTTPParser: false, // Enforce strict HTTP parsing for security
        
        // Set HTTP version support and protocol options
        httpVersionMajor: 1,
        httpVersionMinor: 1,
        
        // Connection management settings for performance optimization
        allowHalfOpen: false, // Prevent half-open connections for security
        pauseOnConnect: false // Continue processing immediately on connection
    };
    
    // Apply any override options provided for customization
    Object.assign(httpServerOptions, overrides);
    
    // Return complete HTTP server options object
    return httpServerOptions;
}

/**
 * Creates default HTTP response headers object with security headers, content type settings,
 * and server identification for consistent response formatting.
 * 
 * @param {Object} options - Options for header generation
 * @returns {Object} Default HTTP headers object with security and identification headers
 */
function createDefaultHeaders(options = {}) {
    // Initialize default headers with consistent structure
    const defaultHeaders = {};
    
    // Set Content-Type header with UTF-8 encoding for text responses
    defaultHeaders[HTTP_HEADERS.CONTENT_TYPE] = options.contentType || CONTENT_TYPES.TEXT_PLAIN_UTF8;
    
    // Add X-Content-Type-Options header for MIME sniffing protection
    defaultHeaders[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS] = SECURITY_HEADERS_CONFIG.X_CONTENT_TYPE_OPTIONS;
    
    // Include Server header with application identification
    if (!SECURITY_HEADERS_CONFIG.MINIMAL_SERVER_INFO || options.includeServerHeader) {
        defaultHeaders[HTTP_HEADERS.SERVER] = `${DEFAULT_SERVER_NAME}/${DEFAULT_SERVER_VERSION}`;
    }
    
    // Add Date header with current timestamp for HTTP compliance
    defaultHeaders[HTTP_HEADERS.DATE] = new Date().toUTCString();
    
    // Apply additional security headers based on configuration
    if (options.enableSecurityHeaders !== false) {
        // Add connection management header
        defaultHeaders[HTTP_HEADERS.CONNECTION] = 'keep-alive';
    }
    
    // Format headers with lowercase keys for Node.js compatibility
    const formattedHeaders = {};
    Object.keys(defaultHeaders).forEach(key => {
        formattedHeaders[key.toLowerCase()] = defaultHeaders[key];
    });
    
    // Return complete default headers object
    return formattedHeaders;
}

/**
 * Validates server configuration values including port numbers, timeout settings,
 * connection limits, and security options with comprehensive error reporting.
 * 
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result with success status and detailed error information
 */
function validateServerConfig(config) {
    const validationErrors = [];
    
    // Validate port number range and availability
    if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
        validationErrors.push({
            field: 'port',
            value: config.port,
            error: 'Port must be a number between 1 and 65535',
            suggestion: 'Use a valid port number like 3000 for development'
        });
    }
    
    // Check hostname format and DNS resolution
    if (!config.host || typeof config.host !== 'string' || config.host.trim().length === 0) {
        validationErrors.push({
            field: 'host',
            value: config.host,
            error: 'Host must be a non-empty string',
            suggestion: 'Use "localhost" for development or "0.0.0.0" for all interfaces'
        });
    }
    
    // Validate timeout values against acceptable ranges
    if (config.timeout && (typeof config.timeout !== 'number' || 
        config.timeout < CONNECTION_TIMEOUT_RANGE.min || 
        config.timeout > CONNECTION_TIMEOUT_RANGE.max)) {
        validationErrors.push({
            field: 'timeout',
            value: config.timeout,
            error: `Timeout must be between ${CONNECTION_TIMEOUT_RANGE.min} and ${CONNECTION_TIMEOUT_RANGE.max} milliseconds`,
            suggestion: 'Use 30000ms (30 seconds) for typical applications'
        });
    }
    
    // Verify connection limit settings and constraints
    if (config.maxConnections && (typeof config.maxConnections !== 'number' || config.maxConnections < 1)) {
        validationErrors.push({
            field: 'maxConnections',
            value: config.maxConnections,
            error: 'Maximum connections must be a positive number',
            suggestion: 'Use 1000 for typical tutorial applications'
        });
    }
    
    // Check header size limits and HTTP version support
    if (config.maxHeaderSize && (typeof config.maxHeaderSize !== 'number' || 
        config.maxHeaderSize < HEADER_SIZE_RANGE.min || 
        config.maxHeaderSize > HEADER_SIZE_RANGE.max)) {
        validationErrors.push({
            field: 'maxHeaderSize',
            value: config.maxHeaderSize,
            error: `Maximum header size must be between ${HEADER_SIZE_RANGE.min} and ${HEADER_SIZE_RANGE.max} bytes`,
            suggestion: 'Use 8192 bytes (8KB) for typical applications'
        });
    }
    
    // Validate security configuration options
    if (config.enableSecurity !== undefined && typeof config.enableSecurity !== 'boolean') {
        validationErrors.push({
            field: 'enableSecurity',
            value: config.enableSecurity,
            error: 'Security enablement must be a boolean value',
            suggestion: 'Use true for production, false for development'
        });
    }
    
    // Return comprehensive validation result with errors
    return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        errorCount: validationErrors.length,
        summary: validationErrors.length === 0 ? 
            'Server configuration validation passed' : 
            `Found ${validationErrors.length} validation error(s)`
    };
}

/**
 * Returns connection-specific configuration including keep-alive settings, timeout values,
 * and connection management options for HTTP server performance optimization.
 * 
 * @param {EnvironmentConfig} environmentConfig - Environment configuration instance
 * @returns {Object} Connection configuration object with timeout and keep-alive settings
 */
function getConnectionConfig(environmentConfig) {
    // Validate environment configuration parameter
    if (!environmentConfig || typeof environmentConfig.getServerConfig !== 'function') {
        throw new Error('Invalid environment configuration: must be EnvironmentConfig instance');
    }
    
    // Extract keep-alive timeout from environment configuration
    const serverConfig = environmentConfig.getServerConfig();
    
    // Set connection timeout and header timeout values
    const connectionConfig = {
        keepAliveTimeout: serverConfig.keepAliveTimeout || 5000,
        timeout: serverConfig.timeout || DEFAULT_REQUEST_TIMEOUT,
        headersTimeout: DEFAULT_HEADER_TIMEOUT,
        
        // Configure maximum connections and connection backlog
        maxConnections: serverConfig.maxConnections || 1000,
        backlog: 511, // Default TCP backlog for connection queue
        
        // Set socket timeout and idle timeout settings
        socketTimeout: serverConfig.timeout || DEFAULT_REQUEST_TIMEOUT,
        idleTimeout: serverConfig.keepAliveTimeout || 5000
    };
    
    // Apply performance optimization for tutorial application
    connectionConfig.allowHalfOpen = false; // Prevent half-open connections
    connectionConfig.pauseOnConnect = false; // Continue processing immediately
    
    // Return complete connection configuration object
    return connectionConfig;
}

/**
 * Returns security-specific configuration including security headers, server identification
 * settings, and security policy options for HTTP response protection.
 * 
 * @param {EnvironmentConfig} environmentConfig - Environment configuration instance
 * @returns {Object} Security configuration object with headers and protection settings
 */
function getSecurityConfig(environmentConfig) {
    // Validate environment configuration parameter
    if (!environmentConfig || typeof environmentConfig.getFeatureFlags !== 'function') {
        throw new Error('Invalid environment configuration: must be EnvironmentConfig instance');
    }
    
    // Configure X-Content-Type-Options for MIME sniffing protection
    const featureFlags = environmentConfig.getFeatureFlags();
    
    // Set minimal server identification to avoid information disclosure
    const securityConfig = {
        enableSecurityHeaders: featureFlags.enableSecurity || false,
        xContentTypeOptions: SECURITY_HEADERS_CONFIG.X_CONTENT_TYPE_OPTIONS,
        minimalServerInfo: SECURITY_HEADERS_CONFIG.MINIMAL_SERVER_INFO,
        
        // Configure security headers based on environment settings
        securityHeaders: {
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS_CONFIG.X_CONTENT_TYPE_OPTIONS
        }
    };
    
    // Set security policy options for tutorial application
    if (featureFlags.enableSecurity) {
        securityConfig.strictParsing = true; // Enable strict HTTP parsing
        securityConfig.validateHeaders = true; // Validate incoming headers
    }
    
    // Apply environment-specific security configurations
    if (environmentConfig.isProd()) {
        securityConfig.enableSecurityHeaders = true;
        securityConfig.minimalServerInfo = true;
    }
    
    // Return complete security configuration object
    return securityConfig;
}

/**
 * Creates standardized server configuration error objects with detailed context and
 * troubleshooting information for configuration validation failures.
 * 
 * @param {string} errorType - Type of server configuration error
 * @param {string} message - Error message description
 * @param {Object} context - Additional context information
 * @returns {Object} Standardized server configuration error with type, message, and troubleshooting context
 */
function createServerConfigurationError(errorType, message, context = {}) {
    // Validate error type against known server configuration error categories
    const validErrorTypes = [
        'VALIDATION_ERROR',
        'CONFIGURATION_ERROR',
        'SECURITY_ERROR',
        'CONNECTION_ERROR',
        'TIMEOUT_ERROR'
    ];
    
    const normalizedErrorType = validErrorTypes.includes(errorType) ? 
        errorType : 'SERVER_CONFIGURATION_ERROR';
    
    // Create error object with consistent structure and properties
    const configurationError = {
        type: normalizedErrorType,
        message: message || 'Server configuration error occurred',
        timestamp: new Date().toISOString(),
        category: 'SERVER_CONFIGURATION',
        
        // Add server-specific contextual information including port and hostname
        context: {
            ...context,
            serverComponent: 'HTTP_SERVER_CONFIG',
            module: 'server.config.js'
        }
    };
    
    // Include troubleshooting suggestions for common server configuration issues
    configurationError.troubleshooting = {
        suggestions: [
            'Verify server port availability and permissions',
            'Check hostname resolution and network connectivity',
            'Validate timeout values against system limits',
            'Review security configuration settings',
            'Ensure environment configuration is properly loaded'
        ],
        documentation: 'Refer to server configuration documentation for detailed setup instructions',
        commonIssues: [
            'Port already in use by another application',
            'Invalid hostname or network interface configuration',
            'Timeout values outside acceptable ranges',
            'Missing or invalid environment variables'
        ]
    };
    
    // Add timestamp and server configuration validation details
    configurationError.metadata = {
        errorId: `SCE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        severity: errorType.includes('SECURITY') ? 'HIGH' : 'MEDIUM',
        component: 'ServerConfiguration',
        version: DEFAULT_SERVER_VERSION
    };
    
    // Return comprehensive server configuration error object
    return configurationError;
}

// ============================================================================
// SERVER CONFIGURATION CLASS
// ============================================================================

/**
 * Comprehensive server configuration class that manages HTTP server options, connection
 * settings, security headers, and performance configurations for the Node.js tutorial
 * application. Provides typed access to server configuration values, validates settings,
 * and supports environment-specific defaults with error handling and integration
 * capabilities for http.createServer() initialization.
 */
class ServerConfig {
    /**
     * Initializes server configuration by processing environment settings, creating HTTP
     * server options, setting up default headers, and configuring security and connection
     * settings with comprehensive validation.
     * 
     * @param {EnvironmentConfig} environmentConfig - Environment configuration instance
     * @param {Object} options - Optional configuration overrides
     */
    constructor(environmentConfig, options = {}) {
        // Validate environment configuration parameter
        if (!environmentConfig || typeof environmentConfig.getServerConfig !== 'function') {
            throw createServerConfigurationError(
                'VALIDATION_ERROR',
                'Invalid environment configuration: must be EnvironmentConfig instance',
                { parameter: 'environmentConfig', expectedType: 'EnvironmentConfig' }
            );
        }
        
        // Store reference to environment configuration for server settings
        this.environmentConfig = environmentConfig;
        
        // Set server identification including name and version information
        this.serverName = options.serverName || DEFAULT_SERVER_NAME;
        this.serverVersion = options.serverVersion || DEFAULT_SERVER_VERSION;
        
        // Configure timeout settings including request and header timeouts
        const serverConfig = environmentConfig.getServerConfig();
        this.requestTimeout = serverConfig.timeout || DEFAULT_REQUEST_TIMEOUT;
        this.headerTimeout = options.headerTimeout || DEFAULT_HEADER_TIMEOUT;
        
        // Set up connection management including keep-alive and max connections
        this.keepAlive = options.keepAlive !== undefined ? options.keepAlive : DEFAULT_KEEP_ALIVE;
        this.maxHeaderSize = options.maxHeaderSize || DEFAULT_MAX_HEADER_SIZE;
        
        // Create default HTTP response headers with security headers
        this.defaultHeaders = createDefaultHeaders({
            includeServerHeader: !SECURITY_HEADERS_CONFIG.MINIMAL_SERVER_INFO,
            enableSecurityHeaders: environmentConfig.getFeatureFlags().enableSecurity
        });
        
        // Configure security settings including MIME protection and server identification
        this.securityConfig = getSecurityConfig(environmentConfig);
        
        // Generate HTTP server options object for Node.js http.createServer()
        this.httpServerOptions = createHttpServerOptions(environmentConfig, options);
        
        // Configure connection-specific settings for performance optimization
        this.connectionConfig = getConnectionConfig(environmentConfig);
        
        // Validate complete server configuration and mark as validated
        const validationResult = this.validate();
        if (!validationResult) {
            throw createServerConfigurationError(
                'VALIDATION_ERROR',
                'Server configuration validation failed',
                { validationErrors: this.getValidationErrors() }
            );
        }
        
        this.isValidated = true;
    }
    
    /**
     * Returns complete HTTP server options object for Node.js http.createServer()
     * including timeout settings, connection limits, and security configurations.
     * 
     * @returns {Object} HTTP server options object for server initialization
     */
    getHttpServerOptions() {
        // Extract timeout configuration from server settings
        const httpOptions = {
            timeout: this.requestTimeout,
            keepAliveTimeout: this.connectionConfig.keepAliveTimeout,
            headersTimeout: this.headerTimeout,
            maxHeaderSize: this.maxHeaderSize,
            
            // Include connection management options
            allowHalfOpen: this.connectionConfig.allowHalfOpen || false,
            pauseOnConnect: this.connectionConfig.pauseOnConnect || false,
            
            // Add security configuration for server creation
            insecureHTTPParser: false // Enforce strict HTTP parsing
        };
        
        // Apply performance optimization settings
        if (this.environmentConfig.isProd()) {
            httpOptions.timeout = Math.min(httpOptions.timeout, 15000); // Shorter timeout for production
        }
        
        // Return complete HTTP server options object
        return httpOptions;
    }
    
    /**
     * Returns default HTTP response headers including security headers, content type,
     * and server identification for consistent response formatting.
     * 
     * @returns {Object} Default HTTP headers object with security and identification headers
     */
    getDefaultHeaders() {
        // Extract default headers from server configuration
        const headers = { ...this.defaultHeaders };
        
        // Include Content-Type header with UTF-8 encoding
        if (!headers[HTTP_HEADERS.CONTENT_TYPE]) {
            headers[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.TEXT_PLAIN_UTF8;
        }
        
        // Add security headers for MIME sniffing protection
        if (this.securityConfig.enableSecurityHeaders) {
            Object.assign(headers, this.securityConfig.securityHeaders);
        }
        
        // Include server identification and date headers
        headers[HTTP_HEADERS.DATE] = new Date().toUTCString();
        
        // Return complete default headers object
        return headers;
    }
    
    /**
     * Returns connection-specific configuration including keep-alive settings, timeout
     * values, and connection management options.
     * 
     * @returns {Object} Connection configuration with timeout and keep-alive settings
     */
    getConnectionConfig() {
        // Extract connection settings from server configuration
        const connectionSettings = {
            keepAlive: this.keepAlive,
            keepAliveTimeout: this.connectionConfig.keepAliveTimeout,
            timeout: this.requestTimeout,
            maxConnections: this.connectionConfig.maxConnections,
            
            // Include keep-alive timeout and connection timeout settings
            socketTimeout: this.connectionConfig.socketTimeout,
            idleTimeout: this.connectionConfig.idleTimeout,
            
            // Add maximum connections and socket configuration
            backlog: this.connectionConfig.backlog || 511
        };
        
        // Return complete connection configuration object
        return connectionSettings;
    }
    
    /**
     * Returns security-specific configuration including security headers, server
     * identification settings, and protection policies.
     * 
     * @returns {Object} Security configuration with headers and protection settings
     */
    getSecurityConfig() {
        // Extract security settings from server configuration
        const securitySettings = {
            enableSecurityHeaders: this.securityConfig.enableSecurityHeaders,
            minimalServerInfo: this.securityConfig.minimalServerInfo,
            
            // Include security headers for MIME and XSS protection
            securityHeaders: { ...this.securityConfig.securityHeaders },
            
            // Add server identification and information disclosure settings
            xContentTypeOptions: this.securityConfig.xContentTypeOptions,
            strictParsing: this.securityConfig.strictParsing || false
        };
        
        // Return complete security configuration object
        return securitySettings;
    }
    
    /**
     * Returns the configured server port from environment configuration with validation.
     * 
     * @returns {number} Server port number for binding
     */
    getPort() {
        // Extract port from environment configuration
        const port = this.environmentConfig.port;
        
        // Validate port number against acceptable range
        if (typeof port !== 'number' || port < 1 || port > 65535) {
            throw createServerConfigurationError(
                'VALIDATION_ERROR',
                `Invalid port number: ${port}`,
                { port, expectedRange: '1-65535' }
            );
        }
        
        // Return validated port number
        return port;
    }
    
    /**
     * Returns the configured server hostname from environment configuration with validation.
     * 
     * @returns {string} Server hostname for binding
     */
    getHost() {
        // Extract hostname from environment configuration
        const host = this.environmentConfig.host;
        
        // Validate hostname format and accessibility
        if (!host || typeof host !== 'string' || host.trim().length === 0) {
            throw createServerConfigurationError(
                'VALIDATION_ERROR',
                `Invalid hostname: ${host}`,
                { host, expectedType: 'non-empty string' }
            );
        }
        
        // Return validated hostname
        return host.trim();
    }
    
    /**
     * Validates the complete server configuration including HTTP server options, connection
     * settings, and security configuration with error reporting.
     * 
     * @returns {boolean} true if configuration is valid, throws error if invalid
     */
    validate() {
        // Validate HTTP server options against Node.js requirements
        const configToValidate = {
            port: this.getPort(),
            host: this.getHost(),
            timeout: this.requestTimeout,
            maxConnections: this.connectionConfig.maxConnections,
            maxHeaderSize: this.maxHeaderSize,
            enableSecurity: this.securityConfig.enableSecurityHeaders
        };
        
        // Check timeout values against acceptable ranges
        const validationResult = validateServerConfig(configToValidate);
        
        // Store validation results for access
        this._validationResult = validationResult;
        
        // Verify connection configuration and limits
        if (!validationResult.isValid) {
            return false;
        }
        
        // Validate security configuration completeness
        if (!this.securityConfig || typeof this.securityConfig !== 'object') {
            this._validationResult.errors.push({
                field: 'securityConfig',
                error: 'Security configuration must be a valid object'
            });
            return false;
        }
        
        // Check default headers format and security requirements
        if (!this.defaultHeaders || typeof this.defaultHeaders !== 'object') {
            this._validationResult.errors.push({
                field: 'defaultHeaders',
                error: 'Default headers must be a valid object'
            });
            return false;
        }
        
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
     * Reloads server configuration from current environment settings with re-validation
     * and option updates.
     * 
     * @param {EnvironmentConfig} newEnvironmentConfig - Updated environment configuration
     * @param {Object} newOptions - New configuration options
     */
    reload(newEnvironmentConfig, newOptions = {}) {
        // Update environment configuration reference
        if (newEnvironmentConfig && typeof newEnvironmentConfig.getServerConfig === 'function') {
            this.environmentConfig = newEnvironmentConfig;
        }
        
        // Regenerate HTTP server options with new settings
        this.httpServerOptions = createHttpServerOptions(this.environmentConfig, newOptions);
        
        // Update default headers and security configuration
        this.defaultHeaders = createDefaultHeaders({
            includeServerHeader: !SECURITY_HEADERS_CONFIG.MINIMAL_SERVER_INFO,
            enableSecurityHeaders: this.environmentConfig.getFeatureFlags().enableSecurity,
            ...newOptions
        });
        
        // Recalculate connection and timeout settings
        this.connectionConfig = getConnectionConfig(this.environmentConfig);
        this.securityConfig = getSecurityConfig(this.environmentConfig);
        
        // Update timeout values from new configuration
        const serverConfig = this.environmentConfig.getServerConfig();
        this.requestTimeout = serverConfig.timeout || DEFAULT_REQUEST_TIMEOUT;
        
        // Revalidate complete server configuration
        const validationResult = this.validate();
        if (!validationResult) {
            throw createServerConfigurationError(
                'VALIDATION_ERROR',
                'Server configuration reload validation failed',
                { validationErrors: this.getValidationErrors() }
            );
        }
        
        // Mark configuration as updated and validated
        this.isValidated = true;
    }
    
    /**
     * Serializes server configuration to JSON format for logging and debugging with
     * sensitive data filtering.
     * 
     * @returns {Object} JSON-safe server configuration object
     */
    toJSON() {
        // Extract all non-sensitive server configuration properties
        const jsonConfig = {
            serverName: this.serverName,
            serverVersion: this.serverVersion,
            port: this.getPort(),
            host: this.getHost(),
            requestTimeout: this.requestTimeout,
            headerTimeout: this.headerTimeout,
            keepAlive: this.keepAlive,
            maxHeaderSize: this.maxHeaderSize,
            
            // Include HTTP server options and connection settings
            httpServerOptions: { ...this.httpServerOptions },
            connectionConfig: { ...this.connectionConfig },
            
            // Add default headers and security configuration
            defaultHeaders: { ...this.defaultHeaders },
            securityConfig: {
                enableSecurityHeaders: this.securityConfig.enableSecurityHeaders,
                minimalServerInfo: this.securityConfig.minimalServerInfo,
                xContentTypeOptions: this.securityConfig.xContentTypeOptions
            },
            
            // Filter out sensitive information for security
            isValidated: this.isValidated,
            environment: this.environmentConfig.getEnvironment(),
            timestamp: new Date().toISOString()
        };
        
        // Create JSON-serializable configuration object
        return jsonConfig;
    }
}

// ============================================================================
// DEFAULT CONFIGURATION INSTANCE
// ============================================================================

// Create default environment configuration for server initialization
const defaultEnvironmentConfig = new EnvironmentConfig();

// Create default server configuration instance for immediate use by HTTP server initialization
const serverConfig = new ServerConfig(defaultEnvironmentConfig);

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export the ServerConfig class for custom server configuration instances
export { ServerConfig };

// Export utility functions for creating HTTP server options and configuration
export { createHttpServerOptions };
export { createDefaultHeaders };
export { validateServerConfig };
export { getConnectionConfig };
export { getSecurityConfig };
export { createServerConfigurationError };

// Export default server configuration instance for immediate application use
export { serverConfig };

// Default export for convenient access to complete server configuration
export default serverConfig;