/**
 * HTTP Response Mock Module for Node.js Tutorial Application
 * 
 * Provides comprehensive mock HTTP response objects and factory functions for testing
 * the Node.js tutorial application. Creates realistic HTTP response objects that mimic
 * Node.js ServerResponse structure for unit tests, integration tests, and end-to-end tests.
 * 
 * This module implements complete response mocking functionality including successful hello
 * endpoint responses, error responses, malformed responses, security test responses, and
 * edge case scenarios with embedded mock functionality to eliminate circular dependencies
 * while supporting controller testing, response handler testing, middleware testing, and
 * validation testing.
 * 
 * Key Features:
 * - Comprehensive mock HTTP response objects with Node.js ServerResponse compatibility
 * - Factory functions for common testing scenarios and response types
 * - Builder pattern for complex response mock configuration
 * - Embedded helper functions to eliminate circular dependencies
 * - EventEmitter and Writable stream compatibility for realistic testing
 * - Security test patterns for vulnerability testing and protection validation
 * - Bulk response generation for performance and load testing
 * - Pre-configured response templates for quick test setup
 * 
 * Educational Value:
 * - Demonstrates comprehensive testing patterns for HTTP applications
 * - Shows proper mock object creation and Node.js ServerResponse mimicking
 * - Illustrates testing strategy implementation for response validation
 * - Provides examples of enterprise-grade testing utilities and patterns
 * 
 * @fileoverview Comprehensive HTTP response mock module for Node.js tutorial testing
 * @version 1.0.0
 * @author Node.js Tutorial Application Team
 * @since 2024
 */

// Node.js built-in modules for EventEmitter and Writable stream functionality
const { EventEmitter } = require('node:events'); // Node.js v18+
const { Writable } = require('node:stream'); // Node.js v18+

// Internal imports for HTTP constants and utilities
const { 
    HTTP_HEADERS, 
    CONTENT_TYPES, 
    SECURITY_HEADERS 
} = require('../../constants/http-headers.js');

const { 
    HTTP_STATUS_CODES, 
    isValidStatusCode, 
    getStatusMessage 
} = require('../../utils/http-status.js');

const { 
    RESPONSE_TYPES, 
    VALIDATION_SCHEMAS, 
    RESPONSE_TEMPLATES 
} = require('../../types/response.types.js');

const { 
    RESPONSE_MESSAGES 
} = require('../../constants/response-messages.js');

// Handle ES6/CommonJS compatibility for error messages
// Since error-messages.js uses ES6 exports, we'll import using dynamic import or require
let ERROR_MESSAGES;
try {
    // Try CommonJS require first
    ERROR_MESSAGES = require('../../constants/error-messages.js').ERROR_MESSAGES || 
                     require('../../constants/error-messages.js').default?.ERROR_MESSAGES;
} catch (err) {
    // Fallback error messages if import fails
    ERROR_MESSAGES = {
        NOT_FOUND: 'Not Found',
        METHOD_NOT_ALLOWED: 'Method Not Allowed',
        INTERNAL_SERVER_ERROR: 'Internal Server Error',
        BAD_REQUEST: 'Bad Request'
    };
}

/**
 * Embedded Test Utility Functions
 * 
 * Since test-utils.js doesn't exist yet, we implement the required functions
 * locally to eliminate circular dependencies and ensure self-contained mock functionality.
 */

/**
 * Generates unique test identifier for test correlation and tracking
 * 
 * @returns {string} Unique test identifier with timestamp and random component
 */
function generateTestId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `test_${timestamp}_${randomPart}`;
}

/**
 * Generates unique correlation identifier for response tracking across test scenarios
 * 
 * @returns {string} Unique correlation identifier for response tracking
 */
function generateCorrelationId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `resp_${timestamp}_${randomPart}`;
}

/**
 * High-precision timer class for measuring response generation performance
 * and timing validation in mock objects and testing scenarios
 */
class TestTimer {
    /**
     * Initializes high-precision timer for performance measurement
     * 
     * @param {Object} options - Timer configuration options
     */
    constructor(options = {}) {
        this.startTime = null;
        this.endTime = null;
        this.duration = null;
        this.precision = options.precision || 'milliseconds';
        this.label = options.label || 'Timer';
    }

    /**
     * Starts the high-precision timer for performance measurement
     * 
     * @returns {TestTimer} Timer instance for method chaining
     */
    start() {
        this.startTime = process.hrtime.bigint();
        this.endTime = null;
        this.duration = null;
        return this;
    }

    /**
     * Stops the timer and calculates elapsed duration
     * 
     * @returns {number} Elapsed time in specified precision
     */
    stop() {
        if (!this.startTime) {
            throw new Error('Timer must be started before stopping');
        }
        
        this.endTime = process.hrtime.bigint();
        const nanoSeconds = Number(this.endTime - this.startTime);
        
        switch (this.precision) {
            case 'nanoseconds':
                this.duration = nanoSeconds;
                break;
            case 'microseconds':
                this.duration = Math.round(nanoSeconds / 1000);
                break;
            case 'milliseconds':
                this.duration = Math.round(nanoSeconds / 1000000);
                break;
            default:
                this.duration = Math.round(nanoSeconds / 1000000);
        }
        
        return this.duration;
    }

    /**
     * Gets the elapsed duration without stopping the timer
     * 
     * @returns {number} Current elapsed time
     */
    getElapsed() {
        if (!this.startTime) {
            return 0;
        }
        
        const currentTime = process.hrtime.bigint();
        const nanoSeconds = Number(currentTime - this.startTime);
        
        switch (this.precision) {
            case 'nanoseconds':
                return nanoSeconds;
            case 'microseconds':
                return Math.round(nanoSeconds / 1000);
            case 'milliseconds':
                return Math.round(nanoSeconds / 1000000);
            default:
                return Math.round(nanoSeconds / 1000000);
        }
    }
}

/**
 * Default Response Configuration Object
 * 
 * Contains default configuration for mock HTTP response creation including headers,
 * status codes, and metadata for consistent mock response generation across all
 * testing scenarios and validation requirements.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const DEFAULT_RESPONSE_CONFIG = {
    // Default HTTP response configuration
    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
    headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        [HTTP_HEADERS.DATE]: () => new Date().toUTCString(),
        [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
        [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
    },
    content: '',
    
    // Response state defaults
    headersSent: false,
    writableEnded: false,
    finished: false,
    
    // Mock behavior configuration
    enableEvents: true,
    enableStreaming: true,
    validateHeaders: true,
    strictMode: false,
    
    // Performance and timing defaults
    responseDelay: 0,
    enableTiming: true,
    timingPrecision: 'milliseconds',
    
    // Security and validation defaults
    enableSecurityHeaders: true,
    preventHeaderInjection: true,
    enableContentValidation: true,
    
    // Metadata defaults
    generateCorrelationId: true,
    includeTimestamp: true,
    trackPerformance: true
};

/**
 * Mock Response Templates Object
 * 
 * Contains pre-configured response templates for common testing scenarios
 * and endpoint validation with complete header sets and proper formatting
 * for rapid test setup and consistent response mock creation.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const MOCK_RESPONSE_TEMPLATES = {
    /**
     * Success hello endpoint response template with complete headers
     * and proper hello world content for success scenario testing
     */
    SUCCESS_HELLO_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(RESPONSE_MESSAGES.HELLO_WORLD, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: () => new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
        },
        content: RESPONSE_MESSAGES.HELLO_WORLD,
        metadata: {
            responseType: 'hello_endpoint',
            isSuccess: true,
            testScenario: 'success'
        }
    },

    /**
     * 404 Not Found error response template with proper error headers
     * and standard error content for route validation testing
     */
    NOT_FOUND_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(ERROR_MESSAGES.NOT_FOUND, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: () => new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
        },
        content: ERROR_MESSAGES.NOT_FOUND,
        metadata: {
            responseType: 'client_error',
            isSuccess: false,
            testScenario: 'not_found'
        }
    },

    /**
     * 405 Method Not Allowed error response template with Allow header
     * and proper error content for method validation testing
     */
    METHOD_NOT_ALLOWED_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(ERROR_MESSAGES.METHOD_NOT_ALLOWED, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: () => new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE,
            [HTTP_HEADERS.ALLOW]: 'GET'
        },
        content: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        metadata: {
            responseType: 'client_error',
            isSuccess: false,
            testScenario: 'method_not_allowed'
        }
    },

    /**
     * 500 Internal Server Error response template with secure error headers
     * and standard error content for server error testing scenarios
     */
    SERVER_ERROR_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: () => new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
            [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
        },
        content: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        metadata: {
            responseType: 'server_error',
            isSuccess: false,
            testScenario: 'server_error'
        }
    },

    /**
     * Malformed response template with intentional structural defects
     * for parsing error and edge case testing scenarios
     */
    MALFORMED_RESPONSE: {
        statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
        headers: {
            // Intentionally malformed headers for testing
            'invalid-header-\r\n': 'injection-attempt',
            [HTTP_HEADERS.CONTENT_TYPE]: 'invalid/content-type',
            [HTTP_HEADERS.CONTENT_LENGTH]: 'invalid-length'
        },
        content: 'Malformed response content',
        metadata: {
            responseType: 'malformed',
            isSuccess: false,
            testScenario: 'malformed',
            malformationType: 'general'
        }
    }
};

/**
 * Response Timing Configuration Object
 * 
 * Contains response timing configuration for performance testing and validation
 * scenarios with configurable delays and timing parameters for realistic
 * testing environments and performance validation requirements.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const RESPONSE_TIMING_CONFIG = {
    // Basic timing configuration
    defaultDelay: 0,
    minDelay: 0,
    maxDelay: 5000,
    
    // Performance testing configuration
    performanceThresholds: {
        fast: 10,
        normal: 50,
        slow: 200,
        timeout: 5000
    },
    
    // Timing variation configuration
    enableRandomDelay: false,
    delayVariation: 0.1,
    
    // Measurement configuration
    enableTiming: true,
    timingPrecision: 'milliseconds',
    enablePerformanceTracking: true,
    
    // Load testing configuration
    bulkTestingConfig: {
        maxConcurrentResponses: 100,
        responseIntervalMs: 10,
        enableThrottling: false
    }
};

/**
 * Mock HTTP Response Class
 * 
 * Mock HTTP response class that mimics Node.js ServerResponse behavior with complete
 * response properties, event emission capabilities, and stream-like functionality
 * for comprehensive testing scenarios and Node.js ServerResponse compatibility.
 */
class MockHttpResponse extends EventEmitter {
    /**
     * Initializes mock HTTP response object with Node.js ServerResponse-compatible
     * properties, event emission, and realistic response structure for testing
     * 
     * @param {Object} config - Response configuration object with status, headers, and content
     */
    constructor(config = {}) {
        super();
        
        // Set HTTP status code from config with default to 200 for success responses
        this.statusCode = config.statusCode || DEFAULT_RESPONSE_CONFIG.statusCode;
        
        // Set status message from config with default based on status code
        this.statusMessage = config.statusMessage || getStatusMessage(this.statusCode);
        
        // Normalize headers to lowercase keys for HTTP/1.1 compliance
        this.headers = this._normalizeHeaders(config.headers || {});
        
        // Set response content from config with default to empty string
        this.content = config.content || DEFAULT_RESPONSE_CONFIG.content;
        
        // Initialize response state flags (headersSent, writableEnded, finished)
        this.headersSent = config.headersSent || DEFAULT_RESPONSE_CONFIG.headersSent;
        this.writableEnded = config.writableEnded || DEFAULT_RESPONSE_CONFIG.writableEnded;
        this.finished = config.finished || DEFAULT_RESPONSE_CONFIG.finished;
        
        // Generate correlation ID and timestamp for response tracking and debugging
        this.correlationId = config.correlationId || generateCorrelationId();
        this.timestamp = config.timestamp || Date.now();
        
        // Initialize Node.js ServerResponse properties and methods for compatibility
        this.writableHighWaterMark = 65536;
        this.writableLength = 0;
        this.destroyed = false;
        this.writable = true;
        
        // Mock socket object for compatibility
        this.socket = {
            writable: true,
            destroyed: false,
            remoteAddress: '127.0.0.1',
            remotePort: Math.floor(Math.random() * 65535) + 1024
        };
        
        // Mock connection object
        this.connection = this.socket;
        
        // Performance tracking
        this._timer = new TestTimer({ label: `Response-${this.correlationId}` });
        this._timer.start();
        
        // Initialize accumulated response data
        this._responseData = [];
    }

    /**
     * Sets the response status code and headers with proper validation and HTTP compliance
     * 
     * @param {number} statusCode - HTTP status code to set
     * @param {Object} headers - Headers object to merge with existing headers
     * @returns {MockHttpResponse} Response instance for method chaining
     */
    writeHead(statusCode, headers = {}) {
        // Validate headers have not been sent already
        if (this.headersSent) {
            throw new Error('Cannot set headers after they are sent');
        }
        
        // Validate status code using isValidStatusCode function
        if (!isValidStatusCode(statusCode)) {
            throw new Error(`Invalid status code: ${statusCode}`);
        }
        
        // Set status code and message using getStatusMessage function
        this.statusCode = statusCode;
        this.statusMessage = getStatusMessage(statusCode);
        
        // Normalize header keys to lowercase for HTTP compliance
        const normalizedHeaders = this._normalizeHeaders(headers);
        
        // Merge headers with existing headers object
        Object.assign(this.headers, normalizedHeaders);
        
        // Set headersSent flag to true
        this.headersSent = true;
        
        // Emit 'headers' event if event emission is enabled
        if (DEFAULT_RESPONSE_CONFIG.enableEvents) {
            this.emit('headers', this.headers);
        }
        
        // Return response instance for method chaining
        return this;
    }

    /**
     * Sets or updates a header value in the response headers object with proper
     * validation and normalization for HTTP compliance
     * 
     * @param {string} name - Header name to set
     * @param {string} value - Header value to set
     * @returns {MockHttpResponse} Response instance for method chaining
     */
    setHeader(name, value) {
        // Validate headers have not been sent already
        if (this.headersSent) {
            throw new Error('Cannot set headers after they are sent');
        }
        
        // Normalize header name to lowercase for HTTP/1.1 compliance
        const normalizedName = name.toLowerCase();
        
        // Validate header name and value format for proper HTTP structure
        if (!name || typeof name !== 'string') {
            throw new Error('Header name must be a valid string');
        }
        
        if (value === undefined || value === null) {
            throw new Error('Header value cannot be undefined or null');
        }
        
        // Set header value in headers object with normalized key
        this.headers[normalizedName] = String(value);
        
        // Return response instance for method chaining
        return this;
    }

    /**
     * Retrieves a header value from the response headers object with case-insensitive lookup
     * 
     * @param {string} name - Header name to retrieve
     * @returns {string|undefined} Header value or undefined if header not found
     */
    getHeader(name) {
        // Normalize header name to lowercase for consistent lookup
        const normalizedName = name.toLowerCase();
        
        // Retrieve header value from headers object using normalized key
        return this.headers[normalizedName];
    }

    /**
     * Removes a header from the response headers object with validation
     * 
     * @param {string} name - Header name to remove
     * @returns {MockHttpResponse} Response instance for method chaining
     */
    removeHeader(name) {
        // Validate headers have not been sent already
        if (this.headersSent) {
            throw new Error('Cannot remove headers after they are sent');
        }
        
        // Normalize header name to lowercase for consistent removal
        const normalizedName = name.toLowerCase();
        
        // Remove header from headers object if it exists
        delete this.headers[normalizedName];
        
        // Return response instance for method chaining
        return this;
    }

    /**
     * Writes data to the response body with content accumulation and encoding handling
     * 
     * @param {string} chunk - Data chunk to write to response
     * @param {string} encoding - Character encoding for the chunk
     * @returns {boolean} True if data was written successfully
     */
    write(chunk, encoding = 'utf8') {
        // Validate response has not been ended already
        if (this.writableEnded) {
            throw new Error('Cannot write after end');
        }
        
        // Send headers if not already sent using writeHead
        if (!this.headersSent) {
            this.writeHead(this.statusCode, {});
        }
        
        // Convert chunk to string and append to response content
        const chunkString = chunk ? String(chunk) : '';
        this._responseData.push(chunkString);
        this.content += chunkString;
        
        // Update Content-Length header if present
        const contentLength = Buffer.byteLength(this.content, encoding);
        this.setHeader(HTTP_HEADERS.CONTENT_LENGTH, contentLength.toString());
        
        // Emit 'data' event with chunk for stream compatibility
        if (DEFAULT_RESPONSE_CONFIG.enableEvents) {
            this.emit('data', chunk);
        }
        
        // Return true indicating successful write operation
        return true;
    }

    /**
     * Ends the response with optional final data and emits completion events
     * 
     * @param {string} data - Optional final data to write before ending
     * @param {string} encoding - Character encoding for the final data
     * @returns {MockHttpResponse} Response instance for method chaining
     */
    end(data, encoding = 'utf8') {
        // Write final data if provided using write method
        if (data !== undefined) {
            this.write(data, encoding);
        }
        
        // Send headers if not already sent using writeHead
        if (!this.headersSent) {
            this.writeHead(this.statusCode, {});
        }
        
        // Set writableEnded and finished flags to true
        this.writableEnded = true;
        this.finished = true;
        this.writable = false;
        
        // Calculate final Content-Length if not set
        if (!this.headers[HTTP_HEADERS.CONTENT_LENGTH]) {
            const contentLength = Buffer.byteLength(this.content, encoding);
            this.headers[HTTP_HEADERS.CONTENT_LENGTH] = contentLength.toString();
        }
        
        // Stop performance timer
        if (this._timer) {
            this._timer.stop();
        }
        
        // Emit 'finish' and 'end' events for completion
        if (DEFAULT_RESPONSE_CONFIG.enableEvents) {
            this.emit('finish');
            this.emit('end');
        }
        
        // Return response instance for method chaining
        return this;
    }

    /**
     * Convenience method for sending JSON responses with proper content type and serialization
     * 
     * @param {Object} data - Data object to serialize as JSON response
     * @returns {MockHttpResponse} Response instance for method chaining
     */
    json(data) {
        // Serialize data to JSON string with error handling
        let jsonString;
        try {
            jsonString = JSON.stringify(data);
        } catch (error) {
            throw new Error(`JSON serialization failed: ${error.message}`);
        }
        
        // Set Content-Type header to application/json; charset=utf-8
        this.setHeader(HTTP_HEADERS.CONTENT_TYPE, CONTENT_TYPES.APPLICATION_JSON_UTF8);
        
        // Calculate Content-Length based on serialized JSON
        const contentLength = Buffer.byteLength(jsonString, 'utf8');
        this.setHeader(HTTP_HEADERS.CONTENT_LENGTH, contentLength.toString());
        
        // Write JSON data using write method
        this.write(jsonString);
        
        // End response using end method
        this.end();
        
        // Return response instance for method chaining
        return this;
    }

    /**
     * Normalizes headers object to lowercase keys for HTTP/1.1 compliance
     * 
     * @private
     * @param {Object} headers - Headers object to normalize
     * @returns {Object} Normalized headers with lowercase keys
     */
    _normalizeHeaders(headers) {
        const normalized = {};
        
        // Add default headers if not present
        const defaultHeaders = { ...DEFAULT_RESPONSE_CONFIG.headers };
        
        // Merge provided headers with defaults
        const allHeaders = { ...defaultHeaders, ...headers };
        
        // Normalize all header keys to lowercase
        Object.entries(allHeaders).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase();
            
            // Handle dynamic header values (functions)
            if (typeof value === 'function') {
                normalized[normalizedKey] = value();
            } else {
                normalized[normalizedKey] = String(value);
            }
        });
        
        return normalized;
    }

    /**
     * Gets response processing performance metrics
     * 
     * @returns {Object} Performance metrics for the response
     */
    getPerformanceMetrics() {
        return {
            correlationId: this.correlationId,
            timestamp: this.timestamp,
            duration: this._timer ? this._timer.getElapsed() : 0,
            responseSize: Buffer.byteLength(this.content, 'utf8'),
            headerCount: Object.keys(this.headers).length,
            finished: this.finished
        };
    }
}

/**
 * Response Mock Builder Class
 * 
 * Builder class for creating customized HTTP response mock objects with fluent
 * interface and comprehensive configuration options for various testing scenarios
 * and complex response mock creation requirements.
 */
class ResponseMockBuilder {
    /**
     * Initializes the response mock builder with default configuration and empty
     * state ready for fluent interface usage and customized mock creation
     */
    constructor() {
        // Initialize empty response configuration object for builder pattern
        this.responseConfig = { ...DEFAULT_RESPONSE_CONFIG };
        
        // Set up default header configuration with standard HTTP headers
        this.headerConfig = {};
        
        // Configure validation settings for mock response creation
        this.validationConfig = {
            validateStatusCode: true,
            validateHeaders: true,
            validateContent: true
        };
        
        // Initialize builder state tracking for fluent interface
        this.isBuilt = false;
        
        // Set up correlation tracking for builder pattern usage
        this.correlationId = generateCorrelationId();
    }

    /**
     * Sets the HTTP status code for the mock response using fluent interface pattern
     * 
     * @param {number} statusCode - HTTP status code to set
     * @returns {ResponseMockBuilder} ResponseMockBuilder instance for method chaining
     */
    withStatusCode(statusCode) {
        // Validate HTTP status code parameter against supported codes
        if (!isValidStatusCode(statusCode)) {
            throw new Error(`Invalid status code: ${statusCode}`);
        }
        
        // Set status code in response configuration object
        this.responseConfig.statusCode = statusCode;
        
        // Set corresponding status message using getStatusMessage function
        this.responseConfig.statusMessage = getStatusMessage(statusCode);
        
        // Return builder instance for continued fluent interface usage
        return this;
    }

    /**
     * Sets custom headers for the mock response with proper normalization and validation
     * 
     * @param {Object} headers - Headers object to set
     * @returns {ResponseMockBuilder} ResponseMockBuilder instance for method chaining
     */
    withHeaders(headers) {
        // Validate headers object structure and format
        if (!headers || typeof headers !== 'object') {
            throw new Error('Headers must be a valid object');
        }
        
        // Normalize header keys to lowercase for HTTP compliance
        Object.entries(headers).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase();
            this.headerConfig[normalizedKey] = value;
        });
        
        // Return builder instance for continued fluent interface
        return this;
    }

    /**
     * Sets the response content with proper content type detection and validation
     * 
     * @param {string} content - Response content to set
     * @param {string} contentType - Optional content type for Content-Type header
     * @returns {ResponseMockBuilder} ResponseMockBuilder instance for method chaining
     */
    withContent(content, contentType) {
        // Set response content in response configuration
        this.responseConfig.content = content;
        
        // Detect or use provided content type for Content-Type header
        if (contentType) {
            this.headerConfig[HTTP_HEADERS.CONTENT_TYPE] = contentType;
        } else if (typeof content === 'object') {
            this.headerConfig[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.APPLICATION_JSON_UTF8;
        }
        
        // Calculate Content-Length based on content for accurate header
        const contentString = typeof content === 'object' ? JSON.stringify(content) : String(content);
        const contentLength = Buffer.byteLength(contentString, 'utf8');
        this.headerConfig[HTTP_HEADERS.CONTENT_LENGTH] = contentLength.toString();
        
        // Return builder instance for method chaining
        return this;
    }

    /**
     * Sets a custom correlation ID for the mock response for tracking and debugging
     * 
     * @param {string} correlationId - Correlation ID to set
     * @returns {ResponseMockBuilder} ResponseMockBuilder instance for method chaining
     */
    withCorrelationId(correlationId) {
        // Validate correlation ID format and uniqueness
        if (!correlationId || typeof correlationId !== 'string') {
            throw new Error('Correlation ID must be a valid string');
        }
        
        // Set correlation ID in response configuration
        this.responseConfig.correlationId = correlationId;
        this.correlationId = correlationId;
        
        // Return builder instance for method chaining
        return this;
    }

    /**
     * Configures response timing and performance metrics for performance testing
     * 
     * @param {Object} timingConfig - Timing configuration object
     * @returns {ResponseMockBuilder} ResponseMockBuilder instance for method chaining
     */
    withTiming(timingConfig) {
        // Configure response timing parameters and performance metrics
        this.responseConfig.timing = {
            ...RESPONSE_TIMING_CONFIG,
            ...timingConfig
        };
        
        // Return builder instance for method chaining
        return this;
    }

    /**
     * Creates the final mock HTTP response object using all configured settings and validation
     * 
     * @returns {MockHttpResponse} Complete MockHttpResponse object with all configured properties
     */
    build() {
        // Validate complete response configuration for consistency
        if (this.isBuilt) {
            throw new Error('Builder can only be used once. Create a new builder for additional responses.');
        }
        
        // Apply default values for any missing configuration properties
        const finalConfig = {
            ...this.responseConfig,
            headers: { ...DEFAULT_RESPONSE_CONFIG.headers, ...this.headerConfig },
            correlationId: this.correlationId
        };
        
        // Create MockHttpResponse instance using configuration
        const mockResponse = new MockHttpResponse(finalConfig);
        
        // Mark builder as built to prevent multiple builds
        this.isBuilt = true;
        
        // Return complete mock HTTP response object ready for testing
        return mockResponse;
    }
}

/**
 * Creates a comprehensive mock HTTP response object that mimics Node.js ServerResponse
 * structure for testing purposes with realistic properties, methods, and event emission
 * capabilities for comprehensive testing scenarios.
 * 
 * @param {Object} responseOptions - Configuration options for mock response creation
 * @returns {MockHttpResponse} Mock HTTP response object with Node.js ServerResponse-compatible structure
 */
function createMockHttpResponse(responseOptions = {}) {
    // Extract statusCode, headers, and content from responseOptions parameter
    const {
        statusCode = DEFAULT_RESPONSE_CONFIG.statusCode,
        headers = {},
        content = DEFAULT_RESPONSE_CONFIG.content,
        correlationId = generateCorrelationId(),
        ...additionalOptions
    } = responseOptions;
    
    // Validate status code using isValidStatusCode function for HTTP compliance
    if (!isValidStatusCode(statusCode)) {
        throw new Error(`Invalid status code: ${statusCode}`);
    }
    
    // Create complete mock response object with all Node.js ServerResponse properties
    const mockConfig = {
        statusCode,
        headers: { ...DEFAULT_RESPONSE_CONFIG.headers, ...headers },
        content,
        correlationId,
        timestamp: Date.now(),
        ...additionalOptions
    };
    
    // Return mock HTTP response object ready for testing scenarios
    return new MockHttpResponse(mockConfig);
}

/**
 * Creates a successful HTTP 200 response mock object specifically for the /hello
 * endpoint with proper headers, content, and Node.js ServerResponse structure
 * for success scenario testing and hello endpoint validation.
 * 
 * @param {Object} options - Optional configuration for hello response customization
 * @returns {MockHttpResponse} Success HTTP response mock object configured for hello endpoint
 */
function createSuccessHelloResponse(options = {}) {
    // Set HTTP status code to 200 using HTTP_STATUS_CODES.SUCCESS.OK for hello endpoint
    const statusCode = HTTP_STATUS_CODES.SUCCESS.OK;
    
    // Set response content to 'Hello world' using RESPONSE_MESSAGES.HELLO_WORLD constant
    const content = RESPONSE_MESSAGES.HELLO_WORLD;
    
    // Create standard HTTP headers including Content-Type, Content-Length, Date, and Server
    const headers = {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(content, 'utf8').toString(),
        [HTTP_HEADERS.DATE]: new Date().toUTCString(),
        [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
        [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
    };
    
    // Generate unique correlation ID for response tracking and test isolation
    const correlationId = options.correlationId || generateCorrelationId();
    
    // Create mock response object using createMockHttpResponse with hello-specific configuration
    const mockResponse = createMockHttpResponse({
        statusCode,
        headers: { ...headers, ...options.headers },
        content,
        correlationId,
        metadata: {
            responseType: 'hello_endpoint',
            isSuccess: true,
            testScenario: 'success',
            ...options.metadata
        }
    });
    
    // Return complete success response mock ready for hello endpoint testing
    return mockResponse;
}

/**
 * Creates HTTP 404 Not Found response mock objects for testing route validation,
 * error handling, and invalid path scenarios with proper error formatting.
 * 
 * @param {Object} options - Optional configuration for 404 response customization
 * @returns {MockHttpResponse} HTTP 404 response mock object for route validation and error testing
 */
function createNotFoundResponse(options = {}) {
    // Set HTTP status code to 404 using HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND
    const statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;
    
    // Set response content to 'Not Found' using ERROR_MESSAGES.NOT_FOUND constant
    const content = ERROR_MESSAGES.NOT_FOUND;
    
    // Create standard error headers with Content-Type and Content-Length
    const headers = {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(content, 'utf8').toString(),
        [HTTP_HEADERS.DATE]: new Date().toUTCString(),
        [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
        [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
    };
    
    // Create mock response object using createMockHttpResponse with 404 configuration
    const mockResponse = createMockHttpResponse({
        statusCode,
        headers: { ...headers, ...options.headers },
        content,
        correlationId: options.correlationId || generateCorrelationId(),
        metadata: {
            responseType: 'client_error',
            isSuccess: false,
            testScenario: 'not_found',
            expectedError: 'route_not_found',
            ...options.metadata
        }
    });
    
    // Return 404 response mock for route validation and error testing
    return mockResponse;
}

/**
 * Creates HTTP 405 Method Not Allowed response mock objects for testing method
 * validation and unsupported HTTP method scenarios with Allow header.
 * 
 * @param {Object} options - Optional configuration for 405 response customization
 * @returns {MockHttpResponse} HTTP 405 response mock object for method validation testing
 */
function createMethodNotAllowedResponse(options = {}) {
    // Set HTTP status code to 405 using HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED
    const statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;
    
    // Set response content to 'Method Not Allowed' using ERROR_MESSAGES.METHOD_NOT_ALLOWED
    const content = ERROR_MESSAGES.METHOD_NOT_ALLOWED;
    
    // Create standard error headers with Content-Type, Content-Length, and Allow header
    const headers = {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(content, 'utf8').toString(),
        [HTTP_HEADERS.DATE]: new Date().toUTCString(),
        [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
        [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE,
        [HTTP_HEADERS.ALLOW]: 'GET' // Set Allow header to 'GET' to indicate supported methods
    };
    
    // Create mock response object using createMockHttpResponse with 405 configuration
    const mockResponse = createMockHttpResponse({
        statusCode,
        headers: { ...headers, ...options.headers },
        content,
        correlationId: options.correlationId || generateCorrelationId(),
        metadata: {
            responseType: 'client_error',
            isSuccess: false,
            testScenario: 'method_not_allowed',
            expectedError: 'method_not_allowed',
            allowedMethods: ['GET'],
            ...options.metadata
        }
    });
    
    // Return 405 response mock for method validation and error testing
    return mockResponse;
}

/**
 * Creates HTTP 500 Internal Server Error response mock objects for testing server
 * error handling and exception scenarios with secure error response format.
 * 
 * @param {Object} options - Optional configuration for 500 response customization
 * @returns {MockHttpResponse} HTTP 500 response mock object for server error testing
 */
function createServerErrorResponse(options = {}) {
    // Set HTTP status code to 500 using HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR
    const statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
    
    // Set response content to 'Internal Server Error' using ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    const content = ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    
    // Create standard error headers with secure error response format
    const headers = {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
        [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(content, 'utf8').toString(),
        [HTTP_HEADERS.DATE]: new Date().toUTCString(),
        [HTTP_HEADERS.SERVER]: 'Node.js Tutorial Server/1.0.0',
        [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS_VALUE
    };
    
    // Create mock response object using createMockHttpResponse with 500 configuration
    const mockResponse = createMockHttpResponse({
        statusCode,
        headers: { ...headers, ...options.headers },
        content,
        correlationId: options.correlationId || generateCorrelationId(),
        metadata: {
            responseType: 'server_error',
            isSuccess: false,
            testScenario: 'server_error',
            expectedError: 'internal_server_error',
            errorClassification: 'server_error',
            severity: 'high',
            ...options.metadata
        }
    });
    
    // Return 500 response mock for comprehensive error handling testing
    return mockResponse;
}

/**
 * Creates malformed HTTP response mock objects for testing response parsing,
 * validation error handling, and edge case scenarios with various malformation types.
 * 
 * @param {string} malformationType - Type of malformation to apply to response
 * @param {Object} options - Optional configuration for malformed response
 * @returns {MockHttpResponse} Malformed HTTP response mock object for parsing error testing
 */
function createMalformedResponse(malformationType = 'general', options = {}) {
    // Determine malformation type from malformationType parameter
    const malformationPatterns = {
        missing_headers: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {}, // Missing required headers
            content: 'Response with missing headers'
        },
        invalid_status: {
            statusCode: 999, // Invalid status code
            headers: { [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8 },
            content: 'Response with invalid status'
        },
        header_injection: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {
                'malicious-header\r\nInjected-Header': 'injection-value',
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8
            },
            content: 'Response with header injection attempt'
        },
        invalid_content_length: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
                [HTTP_HEADERS.CONTENT_LENGTH]: 'invalid-length'
            },
            content: 'Content with mismatched length'
        },
        general: {
            statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
            headers: {
                'invalid-header-\r\n': 'injection-attempt',
                [HTTP_HEADERS.CONTENT_TYPE]: 'invalid/content-type'
            },
            content: 'Malformed response content'
        }
    };
    
    // Apply specific malformation patterns based on type
    const pattern = malformationPatterns[malformationType] || malformationPatterns.general;
    
    // Create response object with intentional defects using createMockHttpResponse
    try {
        const mockResponse = createMockHttpResponse({
            ...pattern,
            correlationId: options.correlationId || generateCorrelationId(),
            headers: { ...pattern.headers, ...options.headers },
            metadata: {
                responseType: 'malformed',
                isSuccess: false,
                testScenario: 'malformed',
                malformationType: malformationType,
                expectedParsingError: true,
                validationFailure: true,
                ...options.metadata
            }
        });
        
        // Return malformed response mock for comprehensive error handling testing
        return mockResponse;
        
    } catch (error) {
        // For invalid status codes, create a mock object with the invalid properties
        const mockResponse = new MockHttpResponse({
            statusCode: pattern.statusCode,
            headers: pattern.headers,
            content: pattern.content,
            correlationId: options.correlationId || generateCorrelationId()
        });
        
        // Override status code validation for malformed testing
        mockResponse.statusCode = pattern.statusCode;
        mockResponse.statusMessage = `Invalid Status ${pattern.statusCode}`;
        
        return mockResponse;
    }
}

/**
 * Creates HTTP response mock objects with security threat patterns for testing
 * security validation, header injection prevention, and security feature validation.
 * 
 * @param {string} securityType - Type of security test pattern to apply
 * @param {Object} securityOptions - Security testing configuration options
 * @returns {MockHttpResponse} HTTP response mock object with security patterns for security testing
 */
function createSecurityTestResponse(securityType = 'header_injection', securityOptions = {}) {
    // Determine security test type from securityType parameter
    const securityPatterns = {
        header_injection: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {
                'x-test-header\r\nInjected-Header': 'malicious-value',
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
                'x-xss-attempt': '<script>alert("XSS")</script>'
            },
            content: 'Response with header injection attempt'
        },
        xss_response: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_HTML_UTF8
            },
            content: '<script>alert("XSS Attack")</script><p>Normal content</p>'
        },
        information_disclosure: {
            statusCode: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
                'x-debug-info': 'file:///etc/passwd',
                'x-stack-trace': 'Error at /home/user/app/server.js:123'
            },
            content: 'Internal server error with sensitive debug information exposed'
        },
        mime_confusion: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8
                // Missing X-Content-Type-Options header
            },
            content: '<html><script>alert("MIME confusion")</script></html>'
        },
        general: {
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
                'x-security-test': 'enabled'
            },
            content: 'General security test response'
        }
    };
    
    // Apply security test patterns to appropriate response components
    const pattern = securityPatterns[securityType] || securityPatterns.general;
    
    // Create response object with security test patterns using createMockHttpResponse
    const mockResponse = createMockHttpResponse({
        ...pattern,
        correlationId: securityOptions.correlationId || generateCorrelationId(),
        headers: { ...pattern.headers, ...securityOptions.headers },
        metadata: {
            responseType: 'security_test',
            isSuccess: false,
            testScenario: 'security_validation',
            securityType: securityType,
            threatClassification: 'simulated',
            severity: securityOptions.severity || 'medium',
            expectedSecurityValidation: true,
            ...securityOptions.metadata
        }
    });
    
    // Return security test response mock for comprehensive security validation testing
    return mockResponse;
}

/**
 * Creates multiple HTTP response mock objects in bulk for performance testing,
 * load testing, and concurrent response scenario validation with unique identifiers.
 * 
 * @param {number} count - Number of response mock objects to create
 * @param {string} responseType - Type of response template to use for bulk generation
 * @param {Object} bulkOptions - Configuration options for bulk response generation
 * @returns {Array<MockHttpResponse>} Array of HTTP response mock objects for bulk testing
 */
function createBulkResponseMocks(count = 10, responseType = 'success', bulkOptions = {}) {
    // Validate count parameter for reasonable bulk generation limits and performance
    if (typeof count !== 'number' || count < 1 || count > 1000) {
        throw new Error('Count must be a number between 1 and 1000');
    }
    
    // Determine response type template based on responseType parameter
    const templateMap = {
        success: () => createSuccessHelloResponse(),
        not_found: () => createNotFoundResponse(),
        method_not_allowed: () => createMethodNotAllowedResponse(),
        server_error: () => createServerErrorResponse(),
        malformed: () => createMalformedResponse(),
        security: () => createSecurityTestResponse()
    };
    
    const templateFunction = templateMap[responseType] || templateMap.success;
    
    // Generate specified number of response mock objects with unique identifiers
    const responseMocks = [];
    const bulkId = generateTestId();
    
    for (let i = 0; i < count; i++) {
        // Apply variation and randomization to bulk responses for realistic testing
        const responseVariation = {
            correlationId: `${bulkId}_${i.toString().padStart(4, '0')}`,
            metadata: {
                bulkIndex: i,
                bulkId: bulkId,
                totalCount: count,
                responseType: responseType,
                ...bulkOptions.metadata
            }
        };
        
        // Add unique correlation IDs and timestamps to each response mock
        const mockResponse = templateFunction();
        
        // Override correlation ID and add bulk metadata
        mockResponse.correlationId = responseVariation.correlationId;
        mockResponse.bulkMetadata = responseVariation.metadata;
        mockResponse.timestamp = Date.now() + i; // Slightly different timestamps
        
        responseMocks.push(mockResponse);
    }
    
    // Return array of response mocks ready for bulk and performance testing
    return responseMocks;
}

/**
 * Generates a comprehensive suite of HTTP response mock objects covering all testing
 * scenarios including success responses, error cases, security tests, and edge cases.
 * 
 * @param {Object} suiteOptions - Configuration options for test suite generation
 * @returns {Object} Complete test suite with categorized response mocks for comprehensive testing
 */
function generateResponseTestSuite(suiteOptions = {}) {
    const suiteId = generateTestId();
    const suiteTimestamp = Date.now();
    
    // Generate success hello endpoint response mocks with various header configurations
    const successResponses = {
        basicHello: createSuccessHelloResponse(),
        helloWithCustomHeaders: createSuccessHelloResponse({
            headers: { 'x-custom-header': 'test-value' }
        }),
        helloWithCorrelation: createSuccessHelloResponse({
            correlationId: `${suiteId}_success_hello`
        })
    };
    
    // Create error response mocks for all error status codes (404, 405, 500)
    const errorResponses = {
        notFound: createNotFoundResponse(),
        methodNotAllowed: createMethodNotAllowedResponse(),
        serverError: createServerErrorResponse(),
        notFoundWithCorrelation: createNotFoundResponse({
            correlationId: `${suiteId}_not_found`
        })
    };
    
    // Generate malformed response mocks for parsing error and edge case testing
    const malformedResponses = {
        missingHeaders: createMalformedResponse('missing_headers'),
        invalidStatus: createMalformedResponse('invalid_status'),
        headerInjection: createMalformedResponse('header_injection'),
        invalidContentLength: createMalformedResponse('invalid_content_length'),
        general: createMalformedResponse('general')
    };
    
    // Create security test response mocks for security validation and protection testing
    const securityResponses = {
        headerInjection: createSecurityTestResponse('header_injection'),
        xssResponse: createSecurityTestResponse('xss_response'),
        informationDisclosure: createSecurityTestResponse('information_disclosure'),
        mimeConfusion: createSecurityTestResponse('mime_confusion'),
        general: createSecurityTestResponse('general')
    };
    
    // Generate edge case response mocks for boundary condition and stress testing
    const edgeCaseResponses = {
        emptyContent: createMockHttpResponse({
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            content: '',
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8,
                [HTTP_HEADERS.CONTENT_LENGTH]: '0'
            }
        }),
        largeContent: createMockHttpResponse({
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            content: 'x'.repeat(10000), // 10KB content
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN_UTF8
            }
        }),
        jsonResponse: createMockHttpResponse({
            statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
            content: JSON.stringify({ message: 'Hello world', timestamp: Date.now() }),
            headers: {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.APPLICATION_JSON_UTF8
            }
        })
    };
    
    // Create performance test response mocks for timing and load testing scenarios
    const performanceResponses = {
        bulkSuccessResponses: createBulkResponseMocks(10, 'success', { 
            metadata: { suite: suiteId, category: 'performance' }
        }),
        bulkErrorResponses: createBulkResponseMocks(5, 'not_found', {
            metadata: { suite: suiteId, category: 'performance' }
        })
    };
    
    // Organize all response mocks into categorized test suite structure
    const testSuite = {
        // Suite metadata
        suiteId: suiteId,
        timestamp: suiteTimestamp,
        generatedAt: new Date().toISOString(),
        
        // Response categories
        success: successResponses,
        errors: errorResponses,
        malformed: malformedResponses,
        security: securityResponses,
        edgeCases: edgeCaseResponses,
        performance: performanceResponses,
        
        // Suite statistics
        stats: {
            totalResponses: Object.keys(successResponses).length + 
                           Object.keys(errorResponses).length + 
                           Object.keys(malformedResponses).length + 
                           Object.keys(securityResponses).length + 
                           Object.keys(edgeCaseResponses).length,
            successResponses: Object.keys(successResponses).length,
            errorResponses: Object.keys(errorResponses).length,
            malformedResponses: Object.keys(malformedResponses).length,
            securityResponses: Object.keys(securityResponses).length,
            edgeCaseResponses: Object.keys(edgeCaseResponses).length,
            bulkResponses: performanceResponses.bulkSuccessResponses.length + 
                          performanceResponses.bulkErrorResponses.length
        },
        
        // Utility methods for test suite management
        getAllResponses: function() {
            return [
                ...Object.values(this.success),
                ...Object.values(this.errors),
                ...Object.values(this.malformed),
                ...Object.values(this.security),
                ...Object.values(this.edgeCases),
                ...this.performance.bulkSuccessResponses,
                ...this.performance.bulkErrorResponses
            ];
        },
        
        getResponsesByType: function(type) {
            return this[type] || {};
        },
        
        getResponseByScenario: function(scenario) {
            const allResponses = this.getAllResponses();
            return allResponses.find(response => 
                response.metadata?.testScenario === scenario ||
                response.bulkMetadata?.testScenario === scenario
            );
        }
    };
    
    // Return comprehensive test suite ready for all testing frameworks and scenarios
    return testSuite;
}

/**
 * Response Mock Presets Object
 * 
 * Pre-configured response mock presets for common testing scenarios and quick
 * test setup with standardized response configurations and validation patterns.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const RESPONSE_MOCK_PRESETS = {
    /**
     * Success hello response preset for hello endpoint success testing
     */
    SUCCESS_HELLO_RESPONSE: {
        create: () => createSuccessHelloResponse(),
        template: MOCK_RESPONSE_TEMPLATES.SUCCESS_HELLO_RESPONSE,
        description: 'Pre-configured success response for /hello endpoint testing'
    },

    /**
     * Not found response preset for route validation testing
     */
    NOT_FOUND_RESPONSE: {
        create: () => createNotFoundResponse(),
        template: MOCK_RESPONSE_TEMPLATES.NOT_FOUND_RESPONSE,
        description: 'Pre-configured 404 response for route validation testing'
    },

    /**
     * Method not allowed response preset for method validation testing
     */
    METHOD_NOT_ALLOWED_RESPONSE: {
        create: () => createMethodNotAllowedResponse(),
        template: MOCK_RESPONSE_TEMPLATES.METHOD_NOT_ALLOWED_RESPONSE,
        description: 'Pre-configured 405 response for method validation testing'
    },

    /**
     * Server error response preset for server error testing
     */
    SERVER_ERROR_RESPONSE: {
        create: () => createServerErrorResponse(),
        template: MOCK_RESPONSE_TEMPLATES.SERVER_ERROR_RESPONSE,
        description: 'Pre-configured 500 response for server error testing'
    },

    /**
     * Malformed response preset for parsing error testing
     */
    MALFORMED_RESPONSE: {
        create: (type) => createMalformedResponse(type),
        template: MOCK_RESPONSE_TEMPLATES.MALFORMED_RESPONSE,
        description: 'Pre-configured malformed response for edge case testing'
    }
};

/**
 * Default Export Object for HTTP Response Mocking
 * 
 * Provides convenient access to all HTTP response mocking functionality including
 * factory functions, builder classes, presets, and helper utilities for comprehensive
 * testing capabilities and easy integration with testing frameworks.
 * 
 * @type {Object}
 * @readonly
 * @constant
 */
const httpResponseMock = {
    /**
     * Factory function for creating basic mock HTTP response objects
     */
    create: createMockHttpResponse,
    
    /**
     * Builder class for creating customized response mocks with fluent interface
     */
    builder: ResponseMockBuilder,
    
    /**
     * Pre-configured response mock presets for quick test setup
     */
    presets: RESPONSE_MOCK_PRESETS,
    
    /**
     * Helper utilities for response mock management and testing
     */
    helpers: {
        generateTestId,
        generateCorrelationId,
        TestTimer,
        createSuccessHelloResponse,
        createNotFoundResponse,
        createMethodNotAllowedResponse,
        createServerErrorResponse,
        createMalformedResponse,
        createSecurityTestResponse,
        createBulkResponseMocks,
        generateResponseTestSuite
    },
    
    /**
     * Configuration objects for mock response creation
     */
    config: {
        DEFAULT_RESPONSE_CONFIG,
        MOCK_RESPONSE_TEMPLATES,
        RESPONSE_TIMING_CONFIG
    },
    
    /**
     * Utility method to create a new builder instance
     */
    createBuilder: () => new ResponseMockBuilder(),
    
    /**
     * Utility method to generate a complete test suite
     */
    generateTestSuite: generateResponseTestSuite,
    
    /**
     * Utility method to validate mock response objects
     */
    validateMock: function(mockResponse) {
        if (!mockResponse || typeof mockResponse !== 'object') {
            return { isValid: false, errors: ['Mock response must be an object'] };
        }
        
        const errors = [];
        
        if (typeof mockResponse.statusCode !== 'number') {
            errors.push('Status code must be a number');
        }
        
        if (!mockResponse.headers || typeof mockResponse.headers !== 'object') {
            errors.push('Headers must be an object');
        }
        
        if (mockResponse.content === undefined) {
            errors.push('Content must be defined');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};

/**
 * Module Exports
 * 
 * Comprehensive exports for all HTTP response mocking functionality including
 * factory functions, classes, configuration objects, and utility functions
 * for complete testing support and integration capabilities.
 */

// Export factory functions for creating mock response objects
module.exports = {
    // Primary factory functions
    createMockHttpResponse,
    createSuccessHelloResponse,
    createNotFoundResponse,
    createMethodNotAllowedResponse,
    createServerErrorResponse,
    createMalformedResponse,
    createSecurityTestResponse,
    createBulkResponseMocks,
    generateResponseTestSuite,
    
    // Classes for advanced mock creation
    MockHttpResponse,
    ResponseMockBuilder,
    
    // Configuration and template objects
    DEFAULT_RESPONSE_CONFIG,
    MOCK_RESPONSE_TEMPLATES,
    RESPONSE_TIMING_CONFIG,
    RESPONSE_MOCK_PRESETS,
    
    // Embedded utility functions
    generateTestId,
    generateCorrelationId,
    TestTimer,
    
    // Default export object for convenient access
    httpResponseMock
};

// Set default export for ES6 compatibility
module.exports.default = httpResponseMock;