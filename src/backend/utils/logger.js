/**
 * Core Logging Utility Module for Node.js Tutorial Application
 * 
 * Provides structured console-based logging capabilities with configurable log levels, formatted output,
 * and integration with application components. Implements educational logging patterns while demonstrating
 * production-ready logging practices including request/response logging, error tracking, performance
 * monitoring, and correlation ID support for debugging and observability.
 * 
 * This module serves as the central logging authority for the Node.js tutorial application, providing:
 * - Structured console-based logging with configurable levels and formatting
 * - HTTP request/response logging with performance metrics and correlation IDs
 * - Comprehensive error tracking with stack traces and contextual information
 * - Educational logging patterns demonstrating industry-standard practices
 * - Production-ready observability features for monitoring and debugging
 * - Integration with application configuration and HTTP status code management
 * 
 * Educational Objectives:
 * - Demonstrates proper logging implementation patterns and best practices
 * - Shows structured logging for effective debugging and monitoring
 * - Illustrates performance monitoring through logging with timing metrics
 * - Provides examples of security-conscious logging with sensitive data filtering
 * - Shows integration patterns between logging and application configuration
 * - Demonstrates production-ready observability patterns for Node.js applications
 * 
 * @fileoverview Core logging utility with structured console-based logging and observability features
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import application configuration for logging settings and environment-specific behavior
import { AppConfig } from '../config/app.config.js';

// Import HTTP status code constants for determining appropriate log levels and categorization
import { 
    HTTP_STATUS_CODES 
} from './http-status.js';

// Import Node.js built-in modules for object inspection and process information
import util from 'util'; // Node.js v20.x - Built-in utility module for object inspection and formatting
import process from 'process'; // Node.js v20.x - Built-in process module for environment and system information

// ============================================================================
// GLOBAL LOGGING CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Comprehensive log level definitions with numeric priorities for level comparison and filtering.
 * Lower numeric values indicate higher priority levels that will be logged more frequently.
 * This hierarchy follows industry-standard logging level conventions.
 */
const LOG_LEVELS = {
    TRACE: 0,    // Finest-grained informational events for detailed debugging
    DEBUG: 1,    // Fine-grained informational events useful for debugging applications
    INFO: 2,     // Informational messages highlighting application progress
    WARN: 3,     // Potentially harmful situations that warrant attention
    ERROR: 4,    // Error events that might still allow the application to continue
    FATAL: 5     // Severe error events that will presumably lead the application to abort
};

/**
 * Ordered array of log level names corresponding to LOG_LEVELS for iteration and validation.
 * Used for level name validation and configuration parsing throughout the logging system.
 */
const LOG_LEVEL_NAMES = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

/**
 * Default log level for the application when no specific level is configured.
 * INFO level provides balance between verbosity and essential information capture.
 */
const DEFAULT_LOG_LEVEL = 'INFO';

/**
 * ANSI color codes for console output formatting and log level visualization.
 * Colors enhance readability and allow quick visual identification of log levels during development.
 * Each log level has a distinct color for improved debugging experience.
 */
const LOG_COLORS = {
    TRACE: '\x1b[37m',  // White - Subtle for trace-level debugging information
    DEBUG: '\x1b[36m',  // Cyan - Clear visibility for debug information
    INFO: '\x1b[32m',   // Green - Positive indication for informational messages
    WARN: '\x1b[33m',   // Yellow - Attention-grabbing for warnings
    ERROR: '\x1b[31m',  // Red - High visibility for error conditions
    FATAL: '\x1b[35m',  // Magenta - Distinctive color for critical errors
    RESET: '\x1b[0m'    // Reset code to return to default console colors
};

/**
 * Maximum log message length to prevent log pollution and ensure readable output.
 * Messages exceeding this length will be truncated with ellipsis indicator.
 */
const MAX_LOG_MESSAGE_LENGTH = 10000;

/**
 * Log format constants for structured vs. human-readable output formatting.
 * JSON format supports structured logging for machine parsing and analysis.
 * Text format provides human-readable output for development and debugging.
 */
const LOG_FORMAT_JSON = 'json';
const LOG_FORMAT_TEXT = 'text';

/**
 * Sensitive field names to filter from log output for security and privacy protection.
 * These field names will be masked or removed from logged objects to prevent
 * accidental exposure of sensitive information in logs.
 */
const SENSITIVE_FIELDS = [
    'password', 'token', 'authorization', 'cookie', 'session', 
    'secret', 'key', 'pass', 'auth', 'credential', 'bearer'
];

// ============================================================================
// UTILITY FUNCTIONS FOR LOG FORMATTING AND PROCESSING
// ============================================================================

/**
 * Formats current timestamp in ISO 8601 format with millisecond precision for consistent
 * log timestamps across all log entries. Provides standardized temporal context for
 * log analysis and correlation.
 * 
 * @param {Date} [date=new Date()] - Date object to format, defaults to current time
 * @returns {string} Formatted timestamp string in ISO 8601 format with milliseconds
 * 
 * @example
 * const timestamp = formatTimestamp();
 * console.log(timestamp); // "2024-01-15T10:30:45.123Z"
 */
function formatTimestamp(date = new Date()) {
    try {
        // Ensure input is a valid Date object for consistent formatting
        const validDate = date instanceof Date ? date : new Date();
        
        // Convert to ISO string format with millisecond precision
        // ISO 8601 format provides standardized timestamp representation
        return validDate.toISOString();
        
    } catch (error) {
        // Fallback to current time if date formatting fails
        return new Date().toISOString();
    }
}

/**
 * Formats log level string with appropriate padding and colorization for console output.
 * Creates visually consistent log level indicators with optional color coding for
 * enhanced readability during development and debugging.
 * 
 * @param {string} level - Log level name to format (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * @param {boolean} [enableColors=false] - Enable ANSI color codes for colored output
 * @returns {string} Formatted log level string with padding and optional colors
 * 
 * @example
 * const formatted = formatLogLevel('ERROR', true);
 * console.log(formatted); // "\x1b[31m[ERROR]\x1b[0m"
 */
function formatLogLevel(level, enableColors = false) {
    try {
        // Validate and normalize log level input
        const normalizedLevel = (level || DEFAULT_LOG_LEVEL).toString().toUpperCase().trim();
        
        // Ensure level exists in LOG_LEVEL_NAMES for validation
        const validLevel = LOG_LEVEL_NAMES.includes(normalizedLevel) ? normalizedLevel : DEFAULT_LOG_LEVEL;
        
        // Apply consistent padding for aligned output formatting
        const paddedLevel = `[${validLevel.padEnd(5)}]`;
        
        // Apply color codes if colors are enabled and supported
        if (enableColors && LOG_COLORS[validLevel]) {
            return `${LOG_COLORS[validLevel]}${paddedLevel}${LOG_COLORS.RESET}`;
        }
        
        // Return formatted level without colors for non-colorized output
        return paddedLevel;
        
    } catch (error) {
        // Fallback to default level formatting if error occurs
        return `[${DEFAULT_LOG_LEVEL.padEnd(5)}]`;
    }
}

/**
 * Formats and validates log message content by removing sensitive information, limiting length,
 * and ensuring safe output format. Implements security-conscious message processing to prevent
 * accidental exposure of sensitive data in log files.
 * 
 * @param {string} message - Log message content to format and validate
 * @param {Object} [options={}] - Formatting options for message processing
 * @param {boolean} [options.trimWhitespace=true] - Remove leading/trailing whitespace
 * @param {boolean} [options.escapeSpecialChars=true] - Escape special characters for safe output
 * @returns {string} Formatted and validated log message safe for output
 * 
 * @example
 * const safeMessage = formatLogMessage('User password: secret123');
 * console.log(safeMessage); // "User password: [FILTERED]"
 */
function formatLogMessage(message, options = {}) {
    try {
        // Validate message input and convert to string representation
        let processedMessage = (message || '').toString();
        
        // Apply whitespace trimming if enabled (default behavior)
        if (options.trimWhitespace !== false) {
            processedMessage = processedMessage.trim();
        }
        
        // Truncate message if it exceeds maximum allowed length
        if (processedMessage.length > MAX_LOG_MESSAGE_LENGTH) {
            processedMessage = processedMessage.substring(0, MAX_LOG_MESSAGE_LENGTH - 3) + '...';
        }
        
        // Remove or mask sensitive information using pattern matching
        SENSITIVE_FIELDS.forEach(sensitiveField => {
            const sensitivePattern = new RegExp(`(${sensitiveField}[\\s]*[:=][\\s]*)[\\w\\-\\.@#$%^&*()]+`, 'gi');
            processedMessage = processedMessage.replace(sensitivePattern, '$1[FILTERED]');
        });
        
        // Escape special characters for safe console output if enabled
        if (options.escapeSpecialChars !== false) {
            processedMessage = processedMessage
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
        }
        
        // Return sanitized and formatted message for safe logging
        return processedMessage;
        
    } catch (error) {
        // Return safe fallback message if processing fails
        return '[Message formatting error]';
    }
}

/**
 * Sanitizes log data by removing sensitive information and limiting object depth for safe logging.
 * Implements comprehensive data sanitization to prevent sensitive information exposure while
 * maintaining useful debugging context in log entries.
 * 
 * @param {any} data - Data object to sanitize for logging
 * @param {Object} [options={}] - Sanitization options for data processing
 * @param {number} [options.maxDepth=3] - Maximum object depth for nested object processing
 * @param {boolean} [options.includeStack=false] - Include stack trace for Error objects
 * @returns {any} Sanitized data safe for logging with sensitive information removed
 * 
 * @example
 * const userData = { name: 'John', password: 'secret123', age: 30 };
 * const sanitized = sanitizeLogData(userData);
 * console.log(sanitized); // { name: 'John', password: '[FILTERED]', age: 30 }
 */
function sanitizeLogData(data, options = {}) {
    try {
        const maxDepth = options.maxDepth || 3;
        const includeStack = options.includeStack || false;
        
        // Handle primitive data types with direct sanitization
        if (data === null || data === undefined) {
            return data;
        }
        
        // Handle string data with message formatting
        if (typeof data === 'string') {
            return formatLogMessage(data, options);
        }
        
        // Handle primitive types that don't require sanitization
        if (typeof data !== 'object') {
            return data;
        }
        
        // Handle Error objects with special processing
        if (data instanceof Error) {
            const errorData = {
                name: data.name,
                message: data.message,
                type: data.constructor.name
            };
            
            // Include stack trace if requested and available
            if (includeStack && data.stack) {
                errorData.stack = data.stack;
            }
            
            return errorData;
        }
        
        // Handle Date objects with ISO string conversion
        if (data instanceof Date) {
            return data.toISOString();
        }
        
        // Handle Array objects with element sanitization
        if (Array.isArray(data)) {
            return data.map(item => sanitizeLogData(item, { ...options, maxDepth: maxDepth - 1 }));
        }
        
        // Handle plain objects with property sanitization
        if (maxDepth <= 0) {
            return '[Object - Max Depth Reached]';
        }
        
        const sanitizedObject = {};
        
        // Process each object property with sensitive field filtering
        Object.keys(data).forEach(key => {
            const lowerKey = key.toLowerCase();
            
            // Check if key matches sensitive field patterns
            const isSensitive = SENSITIVE_FIELDS.some(field => 
                lowerKey.includes(field.toLowerCase())
            );
            
            if (isSensitive) {
                // Replace sensitive values with filtered indicator
                sanitizedObject[key] = '[FILTERED]';
            } else {
                // Recursively sanitize nested objects with depth tracking
                sanitizedObject[key] = sanitizeLogData(data[key], {
                    ...options,
                    maxDepth: maxDepth - 1
                });
            }
        });
        
        return sanitizedObject;
        
    } catch (error) {
        // Return safe representation if sanitization fails
        return '[Data sanitization error]';
    }
}

/**
 * Determines appropriate log level based on HTTP status code or error type for automated
 * log level assignment. Implements intelligent log level determination based on HTTP
 * response patterns and error severity assessment.
 * 
 * @param {number} [statusCode] - HTTP status code for level determination
 * @param {Error} [error] - Error object for severity assessment
 * @returns {string} Appropriate log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * 
 * @example
 * const level = determineLogLevel(404);
 * console.log(level); // "WARN"
 * 
 * const errorLevel = determineLogLevel(null, new Error('Database connection failed'));
 * console.log(errorLevel); // "ERROR"
 */
function determineLogLevel(statusCode, error) {
    try {
        // Handle error object severity assessment
        if (error && error instanceof Error) {
            // Determine error severity based on error type and message
            const errorMessage = error.message.toLowerCase();
            const errorName = error.name.toLowerCase();
            
            // Fatal errors that require immediate attention
            if (errorName.includes('fatal') || errorMessage.includes('fatal') ||
                errorMessage.includes('segmentation fault') || errorMessage.includes('out of memory')) {
                return 'FATAL';
            }
            
            // Server errors that indicate application problems
            if (errorName.includes('type') || errorName.includes('reference') || 
                errorName.includes('syntax') || errorMessage.includes('database')) {
                return 'ERROR';
            }
            
            // Default error level for unclassified errors
            return 'ERROR';
        }
        
        // Handle HTTP status code level determination
        if (statusCode && typeof statusCode === 'number') {
            // Success status codes (2xx) - informational level
            if (statusCode >= 200 && statusCode < 300) {
                // Check if status code exists in SUCCESS category
                const successCodes = Object.values(HTTP_STATUS_CODES.SUCCESS);
                if (successCodes.includes(statusCode)) {
                    return 'INFO';
                }
            }
            
            // Client error status codes (4xx) - warning level
            if (statusCode >= 400 && statusCode < 500) {
                // Check if status code exists in CLIENT_ERROR category
                const clientErrorCodes = Object.values(HTTP_STATUS_CODES.CLIENT_ERROR);
                if (clientErrorCodes.includes(statusCode)) {
                    return 'WARN';
                }
            }
            
            // Server error status codes (5xx) - error level
            if (statusCode >= 500 && statusCode < 600) {
                // Check if status code exists in SERVER_ERROR category
                const serverErrorCodes = Object.values(HTTP_STATUS_CODES.SERVER_ERROR);
                if (serverErrorCodes.includes(statusCode)) {
                    return 'ERROR';
                }
            }
            
            // Informational and redirection codes - debug level
            if (statusCode >= 100 && statusCode < 400) {
                return 'DEBUG';
            }
        }
        
        // Default to INFO level if no specific determination criteria match
        return 'INFO';
        
    } catch (error) {
        // Fallback to default level if determination fails
        return DEFAULT_LOG_LEVEL;
    }
}

/**
 * Creates structured log entry object with timestamp, level, message, and optional metadata.
 * Implements standardized log entry format for consistent structured logging across the
 * application with comprehensive contextual information.
 * 
 * @param {string} level - Log level for the entry (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * @param {string} message - Primary log message content
 * @param {Object} [metadata={}] - Additional metadata and context information
 * @returns {Object} Structured log entry with all required fields and metadata
 * 
 * @example
 * const logEntry = createLogEntry('INFO', 'Server started', { port: 3000, env: 'development' });
 * console.log(logEntry);
 * // {
 * //   timestamp: '2024-01-15T10:30:45.123Z',
 * //   level: 'INFO',
 * //   message: 'Server started',
 * //   metadata: { port: 3000, env: 'development' },
 * //   process: { pid: 1234, version: 'v20.x' }
 * // }
 */
function createLogEntry(level, message, metadata = {}) {
    try {
        // Create base log entry with essential fields
        const logEntry = {
            // ISO 8601 timestamp with millisecond precision for temporal ordering
            timestamp: formatTimestamp(),
            
            // Normalized log level for consistent categorization
            level: level.toString().toUpperCase(),
            
            // Sanitized message content safe for output
            message: formatLogMessage(message),
            
            // Process information for debugging and monitoring context
            process: {
                pid: process.pid,
                version: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
        
        // Include sanitized metadata if provided
        if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
            logEntry.metadata = sanitizeLogData(metadata, {
                maxDepth: 3,
                includeStack: level === 'ERROR' || level === 'FATAL'
            });
        }
        
        // Add memory usage information for performance monitoring
        if (level === 'DEBUG' || level === 'TRACE') {
            const memUsage = process.memoryUsage();
            logEntry.memory = {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
            };
        }
        
        // Include uptime information for server monitoring
        logEntry.uptime = Math.round(process.uptime());
        
        return logEntry;
        
    } catch (error) {
        // Return minimal log entry if creation fails
        return {
            timestamp: new Date().toISOString(),
            level: level || DEFAULT_LOG_LEVEL,
            message: message || '[Log entry creation error]',
            error: 'Failed to create complete log entry'
        };
    }
}

// ============================================================================
// MAIN LOGGER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Main logging class that provides structured console-based logging capabilities with configurable
 * log levels, formatted output, and integration with application components. Implements educational
 * logging patterns while demonstrating production-ready logging practices for the Node.js tutorial
 * application.
 * 
 * This class serves as the central logging authority, providing:
 * - Configurable log levels with environment-specific defaults
 * - Structured console output with optional color coding and timestamps
 * - HTTP request/response logging with performance metrics and correlation IDs
 * - Comprehensive error logging with stack traces and contextual information
 * - Performance monitoring through timing and resource usage tracking
 * - Educational patterns demonstrating enterprise logging best practices
 * - Production-ready observability features for debugging and monitoring
 */
class Logger {
    /**
     * Initializes the Logger instance with configuration from AppConfig and sets up logging
     * behavior based on environment and feature flags. Demonstrates configuration integration
     * patterns and provides comprehensive error handling for initialization.
     * 
     * @param {Object} [options={}] - Configuration options for logger initialization
     * @param {AppConfig} [options.appConfig] - Application configuration instance
     * @param {string} [options.logLevel] - Override log level
     * @param {boolean} [options.enableColors] - Force color enablement
     * @param {string} [options.logFormat] - Override log format (json/text)
     */
    constructor(options = {}) {
        try {
            // Initialize application configuration with fallback to default
            this.appConfig = options.appConfig || new AppConfig();
            
            // Load logging configuration from AppConfig
            const logConfig = this.appConfig.getLogConfig();
            
            // Set log level based on configuration and environment
            this.logLevel = options.logLevel || logConfig.level || DEFAULT_LOG_LEVEL;
            
            // Configure color support based on TTY and environment
            this.enableColors = options.enableColors !== undefined ? 
                options.enableColors : (logConfig.colors && process.stdout.isTTY);
            
            // Set timestamp inclusion preference
            this.includeTimestamp = logConfig.timestamp !== false;
            
            // Configure stack trace enablement for error logging
            this.enableStackTrace = logConfig.enableStackTrace !== false;
            
            // Set log format preference (json or text)
            this.logFormat = options.logFormat || logConfig.format || LOG_FORMAT_TEXT;
            
            // Store development mode flag for enhanced logging features
            this.isDevelopment = this.appConfig.isDevelopment();
            
            // Initialize log statistics tracking for monitoring
            this.logStats = {
                totalLogs: 0,
                levelCounts: {
                    TRACE: 0,
                    DEBUG: 0,
                    INFO: 0,
                    WARN: 0,
                    ERROR: 0,
                    FATAL: 0
                },
                errorCount: 0,
                warningCount: 0,
                startTime: new Date(),
                lastLogTime: null
            };
            
            // Validate configuration completeness
            this._validateConfiguration();
            
            // Log successful initialization in development mode
            if (this.isDevelopment) {
                this._logInitialization();
            }
            
        } catch (error) {
            // Fallback to safe defaults if initialization fails
            this._initializeFallbackConfiguration();
            console.error(`Logger initialization failed: ${error.message}`);
        }
    }
    
    /**
     * Core logging method that outputs formatted log messages with specified level and optional
     * metadata. Implements comprehensive message formatting, level filtering, and output routing
     * with performance monitoring and statistics tracking.
     * 
     * @param {string} level - Log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
     * @param {string} message - Primary log message content
     * @param {Object} [metadata={}] - Additional context and metadata
     * @returns {void} Outputs formatted log message to console
     */
    log(level, message, metadata = {}) {
        try {
            // Validate log level against configured minimum level
            const normalizedLevel = level.toString().toUpperCase();
            if (!this.isLevelEnabled(normalizedLevel)) {
                return; // Skip logging if level is below threshold
            }
            
            // Format message using sanitization and validation
            const formattedMessage = formatLogMessage(message);
            
            // Sanitize metadata to remove sensitive information
            const sanitizedMetadata = sanitizeLogData(metadata, {
                maxDepth: 3,
                includeStack: normalizedLevel === 'ERROR' || normalizedLevel === 'FATAL'
            });
            
            // Create structured log entry with timestamp and context
            const logEntry = createLogEntry(normalizedLevel, formattedMessage, sanitizedMetadata);
            
            // Format log message according to configured format
            let outputMessage;
            if (this.logFormat === LOG_FORMAT_JSON) {
                // JSON format for structured logging and machine parsing
                outputMessage = JSON.stringify(logEntry);
            } else {
                // Human-readable text format for development and debugging
                outputMessage = this._formatTextMessage(logEntry);
            }
            
            // Apply color coding if enabled and supported
            if (this.enableColors) {
                outputMessage = this._applyColorCoding(outputMessage, normalizedLevel);
            }
            
            // Route output to appropriate console method based on log level
            this._outputMessage(outputMessage, normalizedLevel);
            
            // Update log statistics for monitoring and analysis
            this._updateLogStatistics(normalizedLevel);
            
        } catch (error) {
            // Fallback logging if primary logging fails
            console.error(`Logging failed: ${error.message}`);
            console.error(`Original message: ${message}`);
        }
    }
    
    /**
     * Logs trace-level messages for detailed debugging information in development environments.
     * Provides finest-grained logging for detailed code execution tracking and variable inspection.
     * 
     * @param {string} message - Trace message content
     * @param {Object} [metadata={}] - Debug context and variable information
     * @returns {void} Outputs trace-level log message
     */
    trace(message, metadata = {}) {
        // Include additional debugging context in metadata for trace level
        const enhancedMetadata = {
            ...metadata,
            debugLevel: 'TRACE',
            timestamp: Date.now()
        };
        
        // Include memory usage for trace-level debugging
        if (this.isDevelopment) {
            enhancedMetadata.memory = process.memoryUsage();
        }
        
        this.log('TRACE', message, enhancedMetadata);
    }
    
    /**
     * Logs debug-level messages for development and troubleshooting information.
     * Provides detailed debugging context with object inspection and development-specific
     * information for effective troubleshooting and code analysis.
     * 
     * @param {string} message - Debug message content
     * @param {Object} [metadata={}] - Debug context and object inspection data
     * @returns {void} Outputs debug-level log message
     */
    debug(message, metadata = {}) {
        // Include debugging context and object inspection using util.inspect
        const debugContext = {
            ...metadata,
            debugLevel: 'DEBUG'
        };
        
        // Add object inspection for complex objects in development mode
        if (this.isDevelopment && metadata && typeof metadata === 'object') {
            debugContext.inspected = util.inspect(metadata, {
                depth: 3,
                colors: this.enableColors,
                showHidden: false,
                maxArrayLength: 10
            });
        }
        
        this.log('DEBUG', message, debugContext);
    }
    
    /**
     * Logs informational messages for normal application operation and successful requests.
     * Provides standard operational logging for request tracking, system status, and
     * successful operation confirmation.
     * 
     * @param {string} message - Informational message content
     * @param {Object} [metadata={}] - Operational context and success indicators
     * @returns {void} Outputs info-level log message
     */
    info(message, metadata = {}) {
        // Include operational context and success indicators
        const operationalContext = {
            ...metadata,
            level: 'INFO',
            category: 'operational'
        };
        
        // Format message for standard informational output
        this.log('INFO', message, operationalContext);
    }
    
    /**
     * Logs warning messages for potentially problematic situations and client errors.
     * Provides attention-grabbing logging for situations that warrant investigation
     * but don't prevent normal application operation.
     * 
     * @param {string} message - Warning message content
     * @param {Object} [metadata={}] - Warning context and potential impact information
     * @returns {void} Outputs warning-level log message
     */
    warn(message, metadata = {}) {
        // Include warning context and potential impact assessment
        const warningContext = {
            ...metadata,
            level: 'WARN',
            category: 'warning',
            requiresAttention: true
        };
        
        // Increment warning count for statistics
        this.logStats.warningCount++;
        
        this.log('WARN', message, warningContext);
    }
    
    /**
     * Logs error messages for application errors, server errors, and exception handling.
     * Provides comprehensive error logging with stack traces, error context, and debugging
     * information for effective error resolution and monitoring.
     * 
     * @param {string} message - Error message content
     * @param {Object} [metadata={}] - Error context and debugging information
     * @param {Error} [error] - Error object with stack trace information
     * @returns {void} Outputs error-level log message with enhanced error context
     */
    error(message, metadata = {}, error = null) {
        // Include error object with stack trace if provided
        const errorContext = {
            ...metadata,
            level: 'ERROR',
            category: 'error',
            requiresImmedateAttention: true
        };
        
        // Add error details and stack trace if error object provided
        if (error && error instanceof Error) {
            errorContext.error = {
                name: error.name,
                message: error.message,
                type: error.constructor.name
            };
            
            // Include stack trace if enabled and available
            if (this.enableStackTrace && error.stack) {
                errorContext.error.stack = error.stack;
            }
        }
        
        // Include system state information for error analysis
        errorContext.systemState = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            platform: process.platform
        };
        
        // Update error statistics for monitoring
        this.logStats.errorCount++;
        
        this.log('ERROR', message, errorContext);
    }
    
    /**
     * Logs fatal error messages for critical application failures that may cause application
     * termination. Provides comprehensive fatal error logging with full context and system
     * state information for post-mortem analysis.
     * 
     * @param {string} message - Fatal error message content
     * @param {Object} [metadata={}] - Fatal error context and system state
     * @param {Error} [error] - Fatal error object with comprehensive error information
     * @returns {void} Outputs fatal-level log message with complete error context
     */
    fatal(message, metadata = {}, error = null) {
        // Include complete error context and stack trace for fatal errors
        const fatalContext = {
            ...metadata,
            level: 'FATAL',
            category: 'fatal',
            criticalError: true,
            requiresImmediateAction: true
        };
        
        // Add comprehensive error details for fatal errors
        if (error && error instanceof Error) {
            fatalContext.error = {
                name: error.name,
                message: error.message,
                type: error.constructor.name,
                stack: error.stack
            };
        }
        
        // Include complete system state for post-mortem analysis
        fatalContext.systemState = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            platform: process.platform,
            version: process.version,
            pid: process.pid,
            argv: process.argv
        };
        
        // Add environment variables (excluding sensitive ones)
        fatalContext.environment = {};
        Object.keys(process.env).forEach(key => {
            const lowerKey = key.toLowerCase();
            const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
            if (!isSensitive) {
                fatalContext.environment[key] = process.env[key];
            }
        });
        
        this.log('FATAL', message, fatalContext);
    }
    
    /**
     * Specialized method for logging HTTP request details with structured format for request
     * tracking and monitoring. Provides comprehensive request logging with sanitized headers,
     * correlation IDs, and performance timing information.
     * 
     * @param {Object} request - HTTP request object from Node.js
     * @param {string} [requestId] - Correlation ID for request tracking
     * @param {Object} [options={}] - Request logging options and configuration
     * @returns {void} Logs structured HTTP request information
     */
    logHttpRequest(request, requestId, options = {}) {
        try {
            // Extract HTTP method, URL, and headers from request
            const requestInfo = {
                method: request.method,
                url: request.url,
                httpVersion: request.httpVersion,
                remoteAddress: request.connection?.remoteAddress,
                userAgent: request.headers?.['user-agent']
            };
            
            // Include request correlation ID for tracking
            if (requestId) {
                requestInfo.requestId = requestId;
            }
            
            // Sanitize request headers for secure logging
            if (request.headers) {
                requestInfo.headers = sanitizeLogData(request.headers, {
                    maxDepth: 2
                });
            }
            
            // Include client information and timing data
            requestInfo.clientInfo = {
                ip: request.connection?.remoteAddress,
                port: request.connection?.remotePort,
                family: request.connection?.remoteFamily
            };
            
            // Add request timestamp for performance tracking
            requestInfo.requestTime = new Date().toISOString();
            
            // Log with INFO level for successful request tracking
            this.info('HTTP Request Received', requestInfo);
            
        } catch (error) {
            this.error('Failed to log HTTP request', { error: error.message }, error);
        }
    }
    
    /**
     * Specialized method for logging HTTP response details with performance metrics and
     * correlation to original request. Provides comprehensive response logging with timing
     * information, status codes, and performance analysis.
     * 
     * @param {Object} response - HTTP response object from Node.js
     * @param {number} statusCode - HTTP status code for the response
     * @param {number} [duration] - Request processing duration in milliseconds
     * @param {string} [requestId] - Correlation ID linking to original request
     * @returns {void} Logs structured HTTP response information with performance data
     */
    logHttpResponse(response, statusCode, duration, requestId) {
        try {
            // Extract response status code and headers
            const responseInfo = {
                statusCode: statusCode,
                statusMessage: response.statusMessage
            };
            
            // Include request processing duration and performance metrics
            if (typeof duration === 'number') {
                responseInfo.duration = `${duration}ms`;
                responseInfo.performance = {
                    processingTime: duration,
                    isSlowResponse: duration > 1000 // Flag responses over 1 second
                };
            }
            
            // Correlate response to original request using requestId
            if (requestId) {
                responseInfo.requestId = requestId;
            }
            
            // Add response timestamp and size information
            responseInfo.responseTime = new Date().toISOString();
            
            // Determine appropriate log level based on status code
            const logLevel = determineLogLevel(statusCode);
            
            // Include performance warnings if duration exceeds thresholds
            if (duration && duration > 5000) { // 5 second threshold
                responseInfo.performanceWarning = 'Response time exceeds 5 seconds';
            }
            
            // Log with appropriate level based on response status
            this.log(logLevel, `HTTP Response Sent - ${statusCode}`, responseInfo);
            
        } catch (error) {
            this.error('Failed to log HTTP response', { error: error.message }, error);
        }
    }
    
    /**
     * Specialized method for logging application errors with enhanced context and debugging
     * information. Provides comprehensive error logging with request context, system state,
     * and correlation IDs for effective debugging and monitoring.
     * 
     * @param {Error} error - Error object with stack trace and error details
     * @param {Object} [context={}] - Additional context and debugging information
     * @param {string} [requestId] - Request correlation ID for error tracking
     * @returns {void} Logs error with comprehensive context and debugging information
     */
    logError(error, context = {}, requestId) {
        try {
            // Extract error message, type, and stack trace
            const errorInfo = {
                errorName: error.name,
                errorMessage: error.message,
                errorType: error.constructor.name
            };
            
            // Include request context and correlation ID
            if (requestId) {
                errorInfo.requestId = requestId;
            }
            
            // Add system state and environment information
            errorInfo.systemContext = {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                platform: process.platform,
                nodeVersion: process.version
            };
            
            // Format error for maximum debugging value using util.inspect
            if (this.isDevelopment) {
                errorInfo.errorInspection = util.inspect(error, {
                    depth: 4,
                    colors: this.enableColors,
                    showHidden: true
                });
            }
            
            // Include stack trace if available and enabled
            if (error.stack && this.enableStackTrace) {
                errorInfo.stack = error.stack;
            }
            
            // Merge additional context information
            const fullContext = {
                ...context,
                ...errorInfo
            };
            
            // Log with ERROR level and comprehensive context
            this.error('Application Error Occurred', fullContext, error);
            
        } catch (loggingError) {
            // Fallback error logging if primary error logging fails
            console.error('Failed to log application error:', loggingError.message);
            console.error('Original error:', error.message);
        }
    }
    
    /**
     * Updates the current log level at runtime for dynamic logging control.
     * Provides runtime log level adjustment for debugging and troubleshooting
     * without requiring application restart.
     * 
     * @param {string} level - New log level (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
     * @returns {boolean} True if log level was successfully updated
     */
    setLogLevel(level) {
        try {
            // Validate new log level against supported LOG_LEVEL_NAMES
            const normalizedLevel = level.toString().toUpperCase();
            
            if (!LOG_LEVEL_NAMES.includes(normalizedLevel)) {
                this.warn(`Invalid log level: ${level}. Valid levels: ${LOG_LEVEL_NAMES.join(', ')}`);
                return false;
            }
            
            // Update internal log level configuration
            const previousLevel = this.logLevel;
            this.logLevel = normalizedLevel;
            
            // Log level change event for audit trail
            this.info(`Log level changed from ${previousLevel} to ${normalizedLevel}`, {
                previousLevel,
                newLevel: normalizedLevel,
                changedAt: new Date().toISOString()
            });
            
            return true;
            
        } catch (error) {
            this.error('Failed to update log level', { targetLevel: level, error: error.message });
            return false;
        }
    }
    
    /**
     * Checks if a specific log level is enabled for conditional logging logic.
     * Provides efficient log level checking to avoid expensive logging operations
     * when messages won't be output due to level filtering.
     * 
     * @param {string} level - Log level to check (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
     * @returns {boolean} True if specified log level is enabled
     */
    isLevelEnabled(level) {
        try {
            // Normalize both levels for comparison
            const normalizedLevel = level.toString().toUpperCase();
            const normalizedCurrentLevel = this.logLevel.toString().toUpperCase();
            
            // Check if levels exist in LOG_LEVELS mapping
            if (!LOG_LEVELS.hasOwnProperty(normalizedLevel) || 
                !LOG_LEVELS.hasOwnProperty(normalizedCurrentLevel)) {
                return false;
            }
            
            // Compare level priorities using LOG_LEVELS numeric values
            return LOG_LEVELS[normalizedLevel] >= LOG_LEVELS[normalizedCurrentLevel];
            
        } catch (error) {
            // Default to enabled if level check fails
            return true;
        }
    }
    
    /**
     * Returns logging statistics including message counts by level and performance metrics.
     * Provides comprehensive logging statistics for monitoring, analysis, and performance
     * assessment of logging operations and application behavior.
     * 
     * @returns {Object} Comprehensive logging statistics with counts, rates, and performance data
     */
    getLogStats() {
        try {
            // Calculate uptime and logging rates
            const uptime = (new Date() - this.logStats.startTime) / 1000; // seconds
            const logsPerSecond = uptime > 0 ? (this.logStats.totalLogs / uptime).toFixed(2) : 0;
            
            // Aggregate log message counts by level
            const levelDistribution = {};
            Object.keys(this.logStats.levelCounts).forEach(level => {
                const count = this.logStats.levelCounts[level];
                levelDistribution[level] = {
                    count,
                    percentage: this.logStats.totalLogs > 0 ? 
                        ((count / this.logStats.totalLogs) * 100).toFixed(2) : 0
                };
            });
            
            // Calculate error rates and warning frequencies
            const errorRate = this.logStats.totalLogs > 0 ? 
                ((this.logStats.errorCount / this.logStats.totalLogs) * 100).toFixed(2) : 0;
            const warningRate = this.logStats.totalLogs > 0 ? 
                ((this.logStats.warningCount / this.logStats.totalLogs) * 100).toFixed(2) : 0;
            
            // Return comprehensive logging statistics object
            return {
                summary: {
                    totalLogs: this.logStats.totalLogs,
                    errorCount: this.logStats.errorCount,
                    warningCount: this.logStats.warningCount,
                    uptime: `${uptime.toFixed(1)}s`,
                    logsPerSecond: parseFloat(logsPerSecond),
                    currentLogLevel: this.logLevel
                },
                rates: {
                    errorRate: `${errorRate}%`,
                    warningRate: `${warningRate}%`,
                    logsPerSecond: logsPerSecond
                },
                levelDistribution,
                configuration: {
                    logLevel: this.logLevel,
                    enableColors: this.enableColors,
                    logFormat: this.logFormat,
                    enableStackTrace: this.enableStackTrace,
                    isDevelopment: this.isDevelopment
                },
                timing: {
                    startTime: this.logStats.startTime.toISOString(),
                    lastLogTime: this.logStats.lastLogTime ? 
                        this.logStats.lastLogTime.toISOString() : null,
                    uptime: uptime
                }
            };
            
        } catch (error) {
            return {
                error: 'Failed to generate log statistics',
                message: error.message
            };
        }
    }
    
    /**
     * Creates a child logger instance with inherited configuration and additional context.
     * Provides logger inheritance for component-specific logging with shared configuration
     * and enhanced context for better log organization and filtering.
     * 
     * @param {Object} [childConfig={}] - Additional configuration for child logger
     * @param {Object} [additionalContext={}] - Additional context to include in all child logs
     * @returns {Logger} New Logger instance with inherited and additional configuration
     */
    createChildLogger(childConfig = {}, additionalContext = {}) {
        try {
            // Inherit configuration from parent logger
            const inheritedConfig = {
                appConfig: this.appConfig,
                logLevel: this.logLevel,
                enableColors: this.enableColors,
                logFormat: this.logFormat
            };
            
            // Apply additional configuration and context
            const mergedConfig = {
                ...inheritedConfig,
                ...childConfig
            };
            
            // Create new Logger instance with merged settings
            const childLogger = new Logger(mergedConfig);
            
            // Store additional context for automatic inclusion in child logs
            childLogger._additionalContext = additionalContext;
            
            // Override log method to include additional context
            const originalLog = childLogger.log.bind(childLogger);
            childLogger.log = (level, message, metadata = {}) => {
                const enhancedMetadata = {
                    ...childLogger._additionalContext,
                    ...metadata,
                    childLogger: true
                };
                return originalLog(level, message, enhancedMetadata);
            };
            
            return childLogger;
            
        } catch (error) {
            this.error('Failed to create child logger', { error: error.message }, error);
            return this; // Return parent logger as fallback
        }
    }
    
    /**
     * Ensures all pending log messages are flushed to output streams.
     * Provides graceful shutdown support by ensuring all logging operations
     * complete before application termination.
     * 
     * @returns {Promise} Promise that resolves when all logs are flushed
     */
    async flush() {
        try {
            // Flush console output streams to ensure all logs are written
            return new Promise((resolve) => {
                // Flush stdout stream for regular log output
                if (process.stdout.write('')) {
                    resolve();
                } else {
                    process.stdout.once('drain', resolve);
                }
                
                // Also flush stderr stream for error output
                if (!process.stderr.write('')) {
                    process.stderr.once('drain', () => {});
                }
            });
            
        } catch (error) {
            console.error('Failed to flush logger:', error.message);
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Validates logger configuration and sets up fallback values.
     * @private
     */
    _validateConfiguration() {
        // Validate log level
        if (!LOG_LEVEL_NAMES.includes(this.logLevel.toUpperCase())) {
            this.logLevel = DEFAULT_LOG_LEVEL;
        }
        
        // Validate log format
        if (![LOG_FORMAT_JSON, LOG_FORMAT_TEXT].includes(this.logFormat)) {
            this.logFormat = LOG_FORMAT_TEXT;
        }
    }
    
    /**
     * Initializes fallback configuration when normal initialization fails.
     * @private
     */
    _initializeFallbackConfiguration() {
        this.logLevel = DEFAULT_LOG_LEVEL;
        this.enableColors = false;
        this.includeTimestamp = true;
        this.enableStackTrace = true;
        this.logFormat = LOG_FORMAT_TEXT;
        this.isDevelopment = false;
        this.logStats = {
            totalLogs: 0,
            levelCounts: { TRACE: 0, DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0, FATAL: 0 },
            errorCount: 0,
            warningCount: 0,
            startTime: new Date()
        };
    }
    
    /**
     * Logs successful logger initialization.
     * @private
     */
    _logInitialization() {
        const initMessage = `Logger initialized successfully`;
        const initContext = {
            logLevel: this.logLevel,
            enableColors: this.enableColors,
            logFormat: this.logFormat,
            isDevelopment: this.isDevelopment
        };
        
        console.log(`[INFO ] ${new Date().toISOString()} - ${initMessage}`, 
                   JSON.stringify(initContext, null, 2));
    }
    
    /**
     * Formats log entry for human-readable text output.
     * @private
     */
    _formatTextMessage(logEntry) {
        let message = '';
        
        // Add timestamp if enabled
        if (this.includeTimestamp && logEntry.timestamp) {
            message += logEntry.timestamp + ' - ';
        }
        
        // Add formatted log level
        message += formatLogLevel(logEntry.level, false) + ' ';
        
        // Add primary message
        message += logEntry.message;
        
        // Add metadata if present
        if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
            message += ' | ' + JSON.stringify(logEntry.metadata);
        }
        
        return message;
    }
    
    /**
     * Applies color coding to log messages based on level.
     * @private
     */
    _applyColorCoding(message, level) {
        const color = LOG_COLORS[level];
        if (color) {
            return `${color}${message}${LOG_COLORS.RESET}`;
        }
        return message;
    }
    
    /**
     * Routes log output to appropriate console method.
     * @private
     */
    _outputMessage(message, level) {
        switch (level) {
            case 'ERROR':
            case 'FATAL':
                console.error(message);
                break;
            case 'WARN':
                console.warn(message);
                break;
            default:
                console.log(message);
                break;
        }
    }
    
    /**
     * Updates internal logging statistics.
     * @private
     */
    _updateLogStatistics(level) {
        this.logStats.totalLogs++;
        this.logStats.lastLogTime = new Date();
        
        if (this.logStats.levelCounts[level] !== undefined) {
            this.logStats.levelCounts[level]++;
        }
    }
}

// ============================================================================
// DEFAULT LOGGER INSTANCE AND MODULE EXPORTS
// ============================================================================

// Create default logger instance configured for immediate use across the tutorial application
const logger = new Logger();

// Export the Logger class for custom logger instances
export { Logger };

// Export utility functions for external use and testing
export { 
    formatTimestamp,
    formatLogLevel, 
    formatLogMessage,
    sanitizeLogData,
    determineLogLevel,
    createLogEntry
};

// Export logging constants for external configuration and validation
export {
    LOG_LEVELS,
    LOG_LEVEL_NAMES,
    DEFAULT_LOG_LEVEL,
    LOG_COLORS,
    MAX_LOG_MESSAGE_LENGTH,
    LOG_FORMAT_JSON,
    LOG_FORMAT_TEXT,
    SENSITIVE_FIELDS
};

// Export default logger instance for immediate use across the application
export { logger };

// Default export for convenient access to complete logging functionality
export default logger;