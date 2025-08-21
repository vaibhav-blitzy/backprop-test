/**
 * HTTP Request Mock Module for Node.js Tutorial Application
 * 
 * Provides comprehensive mock HTTP request objects and factory functions for testing
 * the Node.js tutorial application. Creates realistic HTTP request objects that mimic
 * Node.js IncomingMessage structure for unit tests, integration tests, and end-to-end tests.
 * 
 * Implements complete request mocking functionality including:
 * - Valid hello endpoint requests with proper headers and metadata
 * - Invalid method scenarios for error handling testing
 * - Malformed requests for parsing error validation
 * - Security test cases for threat detection testing
 * - Edge case scenarios for boundary condition testing
 * - Bulk request generation for performance testing
 * 
 * Features embedded mock functionality to eliminate circular dependencies while supporting:
 * - Controller testing with realistic request objects
 * - Request handler testing with comprehensive scenarios
 * - Middleware testing with proper request structure
 * - Validation testing with various input patterns
 * 
 * @description HTTP request mock module for comprehensive testing scenarios
 * @author Node.js Tutorial Application
 * @version 1.0.0
 * @license MIT
 */

// =============================================================================
// EXTERNAL IMPORTS
// =============================================================================

const { EventEmitter } = require('node:events'); // Node.js built-in EventEmitter
const { Readable } = require('node:stream'); // Node.js built-in Readable stream
const { URL } = require('node:url'); // Node.js built-in URL module

// =============================================================================
// INTERNAL IMPORTS
// =============================================================================

// Import HTTP method constants for creating realistic request mocks
const { 
    HTTP_METHODS,
    isValidHttpMethod,
    isMethodAllowedForEndpoint,
    getAllowedMethodsForEndpoint 
} = require('../../constants/http-methods.js');

// Import HTTP header constants for proper header structures
const { 
    HTTP_HEADERS,
    CONTENT_TYPES,
    SERVER_IDENTIFICATION 
} = require('../../constants/http-headers.js');

// Import request type definitions for proper mock structure
const { 
    REQUEST_TYPES,
    VALIDATION_SCHEMAS,
    REQUEST_TEMPLATES,
    RequestTypeValidator 
} = require('../../types/request.types.js');

// =============================================================================
// UTILITY FUNCTIONS (for missing test-utils)
// =============================================================================

/**
 * Generate unique test ID for mock request identification and correlation tracking
 * @returns {string} Unique test identifier
 */
function generateTestId() {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 9);
    return `test_${timestamp}_${randomSuffix}`;
}

/**
 * Generate correlation ID for request/response tracking in mock objects
 * @returns {string} Unique correlation identifier
 */
function generateCorrelationId() {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 12);
    return `corr_${timestamp}_${randomSuffix}`;
}

/**
 * Create test data for mock request data and validation scenarios
 * @param {string} dataType - Type of test data to create
 * @param {Object} options - Configuration options for data creation
 * @returns {Object} Generated test data
 */
function createTestData(dataType, options = {}) {
    const timestamp = Date.now();
    
    switch (dataType) {
        case 'headers':
            return {
                [HTTP_HEADERS.HOST]: options.host || 'localhost:3000',
                [HTTP_HEADERS.USER_AGENT]: options.userAgent || 'Test-Agent/1.0',
                [HTTP_HEADERS.CONNECTION]: options.connection || 'keep-alive',
                ...options.customHeaders
            };
        case 'metadata':
            return {
                correlationId: generateCorrelationId(),
                timestamp: timestamp,
                processingStartTime: timestamp,
                clientIp: options.clientIp || '127.0.0.1',
                userAgent: options.userAgent || 'Test-Agent/1.0',
                protocol: `HTTP/${options.httpVersion || '1.1'}`,
                connectionType: options.connectionType || 'keep-alive',
                requestSize: options.requestSize || 0
            };
        default:
            return {
                testId: generateTestId(),
                timestamp: timestamp,
                ...options
            };
    }
}

// =============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Default configuration for mock HTTP request creation including headers, protocol, and metadata
 * @constant {Object} DEFAULT_REQUEST_CONFIG
 */
const DEFAULT_REQUEST_CONFIG = {
    method: HTTP_METHODS.GET,
    url: '/',
    httpVersion: '1.1',
    headers: {
        [HTTP_HEADERS.HOST]: 'localhost:3000',
        [HTTP_HEADERS.USER_AGENT]: 'Node.js Tutorial Test Client/1.0',
        [HTTP_HEADERS.CONNECTION]: 'keep-alive'
    },
    timestamp: null,
    correlationId: null,
    clientIp: '127.0.0.1',
    enableEvents: true,
    enableStreaming: true
};

/**
 * Mock socket configuration for creating realistic connection objects in mock requests
 * @constant {Object} MOCK_SOCKET_CONFIG
 */
const MOCK_SOCKET_CONFIG = {
    readable: true,
    writable: true,
    allowHalfOpen: false,
    destroyed: false,
    connecting: false,
    readyState: 'open',
    remoteAddress: '127.0.0.1',
    remoteFamily: 'IPv4',
    remotePort: Math.floor(Math.random() * 50000) + 10000,
    localAddress: '127.0.0.1',
    localPort: 3000,
    bytesRead: 0,
    bytesWritten: 0,
    timeout: 0
};

/**
 * Pre-configured request templates for common testing scenarios and endpoint validation
 * @constant {Object} REQUEST_MOCK_TEMPLATES
 */
const REQUEST_MOCK_TEMPLATES = {
    VALID_HELLO_GET: {
        method: HTTP_METHODS.GET,
        url: '/hello',
        headers: {
            [HTTP_HEADERS.HOST]: 'localhost:3000',
            [HTTP_HEADERS.USER_AGENT]: 'Test-Client/1.0',
            [HTTP_HEADERS.CONNECTION]: 'keep-alive'
        },
        httpVersion: '1.1'
    },
    INVALID_POST_HELLO: {
        method: HTTP_METHODS.POST,
        url: '/hello',
        headers: {
            [HTTP_HEADERS.HOST]: 'localhost:3000',
            [HTTP_HEADERS.USER_AGENT]: 'Test-Client/1.0',
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.APPLICATION_JSON_UTF8,
            [HTTP_HEADERS.CONNECTION]: 'keep-alive'
        },
        httpVersion: '1.1'
    },
    INVALID_PATH_GET: {
        method: HTTP_METHODS.GET,
        url: '/invalid-path',
        headers: {
            [HTTP_HEADERS.HOST]: 'localhost:3000',
            [HTTP_HEADERS.USER_AGENT]: 'Test-Client/1.0',
            [HTTP_HEADERS.CONNECTION]: 'keep-alive'
        },
        httpVersion: '1.1'
    },
    MALFORMED_REQUEST: {
        method: 'INVALID',
        url: '/hello/../admin',
        headers: {
            'invalid\nheader': 'value\r\n',
            [HTTP_HEADERS.HOST]: 'localhost:3000'
        },
        httpVersion: '1.0'
    },
    SECURITY_TEST_REQUEST: {
        method: HTTP_METHODS.GET,
        url: '/hello?param=<script>alert("xss")</script>',
        headers: {
            [HTTP_HEADERS.HOST]: 'localhost:3000',
            [HTTP_HEADERS.USER_AGENT]: 'Test-Agent/1.0 <script>',
            'x-forwarded-for': '192.168.1.1; DROP TABLE users;',
            [HTTP_HEADERS.CONNECTION]: 'keep-alive'
        },
        httpVersion: '1.1'
    }
};

// =============================================================================
// MOCK HTTP REQUEST CLASS
// =============================================================================

/**
 * Mock HTTP request class that mimics Node.js IncomingMessage behavior with complete
 * request properties, event emission capabilities, and stream-like functionality
 * for comprehensive testing scenarios.
 * 
 * Implements Node.js IncomingMessage-compatible interface including:
 * - HTTP request properties (method, url, headers, httpVersion)
 * - Socket and connection objects for networking simulation
 * - EventEmitter functionality for realistic event handling
 * - Stream-like behavior for data processing simulation
 * - Request metadata for tracking and debugging
 * 
 * @class MockHttpRequest
 * @extends EventEmitter
 */
class MockHttpRequest extends EventEmitter {
    /**
     * Initializes mock HTTP request object with Node.js IncomingMessage-compatible properties,
     * event emission, and realistic request structure
     * 
     * @param {Object} config - Configuration object for mock request creation
     * @param {string} [config.method='GET'] - HTTP method for the request
     * @param {string} [config.url='/'] - URL path for the request
     * @param {Object} [config.headers={}] - HTTP headers object
     * @param {string} [config.httpVersion='1.1'] - HTTP protocol version
     * @param {string} [config.correlationId] - Custom correlation ID
     * @param {boolean} [config.enableEvents=true] - Enable event emission
     */
    constructor(config = {}) {
        super();
        
        // Merge configuration with defaults
        const requestConfig = { ...DEFAULT_REQUEST_CONFIG, ...config };
        
        // Set HTTP method with validation and default to GET
        this.method = (requestConfig.method || HTTP_METHODS.GET).toString().trim().toUpperCase();
        
        // Set URL path with default to root path for basic testing
        this.url = requestConfig.url || '/';
        
        // Set HTTP version with default to 1.1 for protocol compliance
        this.httpVersion = requestConfig.httpVersion || '1.1';
        
        // Normalize headers to lowercase keys for HTTP/1.1 compliance
        this.headers = {};
        if (requestConfig.headers && typeof requestConfig.headers === 'object') {
            for (const [key, value] of Object.entries(requestConfig.headers)) {
                if (typeof key === 'string' && typeof value === 'string') {
                    this.headers[key.toLowerCase()] = value;
                }
            }
        }
        
        // Create mock socket object for Node.js compatibility
        this.socket = {
            ...MOCK_SOCKET_CONFIG,
            remotePort: MOCK_SOCKET_CONFIG.remotePort + Math.floor(Math.random() * 1000),
            ...requestConfig.socketConfig
        };
        
        // Create connection object alias for Node.js compatibility
        this.connection = this.socket;
        
        // Generate unique correlation ID for request tracking and debugging
        this.correlationId = requestConfig.correlationId || generateCorrelationId();
        
        // Set timestamp for request tracking and performance measurement
        this.timestamp = requestConfig.timestamp || Date.now();
        
        // Set additional Node.js IncomingMessage properties
        this.complete = true;
        this.readable = true;
        this.destroyed = false;
        this.aborted = false;
        
        // Set raw headers for Node.js compatibility
        this.rawHeaders = [];
        for (const [key, value] of Object.entries(this.headers)) {
            this.rawHeaders.push(key, value);
        }
        
        // Set trailers and raw trailers (empty for standard requests)
        this.trailers = {};
        this.rawTrailers = [];
        
        // Enable event emission if configured
        this.eventsEnabled = requestConfig.enableEvents !== false;
        
        // Initialize stream-like properties
        this._readableState = {
            flowing: null,
            ended: false,
            destroyed: false
        };
        
        // Bind methods to maintain proper context
        this.setHeader = this.setHeader.bind(this);
        this.getHeader = this.getHeader.bind(this);
        this.hasHeader = this.hasHeader.bind(this);
        this.emit = this.emit.bind(this);
        this.pipe = this.pipe.bind(this);
    }
    
    /**
     * Sets or updates a header value in the mock request headers object with proper
     * validation and normalization
     * 
     * @param {string} name - Header name to set
     * @param {string} value - Header value to set
     * @returns {void} No return value, modifies headers object directly
     */
    setHeader(name, value) {
        // Validate header name and value parameters
        if (!name || typeof name !== 'string') {
            throw new Error('Header name must be a non-empty string');
        }
        
        if (value === undefined || value === null) {
            throw new Error('Header value cannot be undefined or null');
        }
        
        // Normalize header name to lowercase for HTTP/1.1 compliance
        const normalizedName = name.toLowerCase();
        
        // Convert value to string for consistency
        const stringValue = String(value);
        
        // Validate header name format (basic validation)
        if (!/^[a-zA-Z0-9\-_]+$/.test(name)) {
            throw new Error('Invalid header name format');
        }
        
        // Set header value in headers object with normalized key
        this.headers[normalizedName] = stringValue;
        
        // Update raw headers array for Node.js compatibility
        const existingIndex = this.rawHeaders.findIndex((header, index) => 
            index % 2 === 0 && header.toLowerCase() === normalizedName
        );
        
        if (existingIndex !== -1) {
            // Update existing header
            this.rawHeaders[existingIndex + 1] = stringValue;
        } else {
            // Add new header
            this.rawHeaders.push(name, stringValue);
        }
        
        // Emit header change event if event emission is enabled
        if (this.eventsEnabled) {
            this.emit('headerChange', { name: normalizedName, value: stringValue });
        }
    }
    
    /**
     * Retrieves a header value from the mock request headers object with case-insensitive lookup
     * 
     * @param {string} name - Header name to retrieve
     * @returns {string|undefined} Header value or undefined if header not found
     */
    getHeader(name) {
        // Validate header name parameter
        if (!name || typeof name !== 'string') {
            return undefined;
        }
        
        // Normalize header name to lowercase for consistent lookup
        const normalizedName = name.toLowerCase();
        
        // Retrieve header value from headers object using normalized key
        return this.headers[normalizedName];
    }
    
    /**
     * Checks if a specific header exists in the mock request headers with case-insensitive comparison
     * 
     * @param {string} name - Header name to check
     * @returns {boolean} True if header exists, false otherwise
     */
    hasHeader(name) {
        // Validate header name parameter
        if (!name || typeof name !== 'string') {
            return false;
        }
        
        // Normalize header name to lowercase for consistent checking
        const normalizedName = name.toLowerCase();
        
        // Check if header exists in headers object using normalized key
        return normalizedName in this.headers;
    }
    
    /**
     * Emits events on the mock request object for realistic event-driven testing scenarios
     * 
     * @param {string} eventName - Name of the event to emit
     * @param {...any} eventData - Data to pass with the event
     * @returns {boolean} True if event had listeners, false otherwise
     */
    emit(eventName, ...eventData) {
        // Validate event name parameter
        if (!eventName || typeof eventName !== 'string') {
            return false;
        }
        
        // Only emit if events are enabled
        if (!this.eventsEnabled) {
            return false;
        }
        
        // Log event emission for debugging and test verification
        if (process.env.NODE_ENV === 'test' && process.env.DEBUG_EVENTS) {
            console.debug(`MockHttpRequest event: ${eventName}`, eventData);
        }
        
        // Emit event using EventEmitter functionality with provided data
        return super.emit(eventName, ...eventData);
    }
    
    /**
     * Provides stream-like pipe functionality for mock request objects in testing scenarios
     * 
     * @param {Object} destination - Destination stream or writable object
     * @param {Object} [options={}] - Pipe options including end behavior
     * @returns {Object} Destination stream for method chaining
     */
    pipe(destination, options = {}) {
        // Validate destination stream object for proper piping
        if (!destination || typeof destination !== 'object') {
            throw new Error('Destination must be a valid object');
        }
        
        // Configure pipe options including end behavior and error handling
        const pipeOptions = {
            end: true,
            ...options
        };
        
        // Set up data flow simulation from mock request to destination
        if (this.eventsEnabled) {
            // Simulate immediate data event for testing
            process.nextTick(() => {
                this.emit('data', Buffer.from('mock request body'));
                if (pipeOptions.end) {
                    this.emit('end');
                }
            });
        }
        
        // Return destination stream for method chaining compatibility
        return destination;
    }
    
    /**
     * Destroys the mock request object and cleans up resources
     * 
     * @param {Error} [error] - Optional error that caused destruction
     * @returns {void}
     */
    destroy(error) {
        if (this.destroyed) {
            return;
        }
        
        this.destroyed = true;
        this.readable = false;
        
        if (error && this.eventsEnabled) {
            this.emit('error', error);
        }
        
        if (this.eventsEnabled) {
            this.emit('close');
        }
    }
    
    /**
     * Simulates reading data from the request stream
     * 
     * @param {number} [size] - Number of bytes to read
     * @returns {Buffer|string|null} Read data or null if no data available
     */
    read(size) {
        // Simulate empty read for GET requests (no body)
        if (this.method === HTTP_METHODS.GET || this.method === HTTP_METHODS.HEAD) {
            return null;
        }
        
        // Return mock data for other methods
        return Buffer.from('mock request body data');
    }
}

// =============================================================================
// REQUEST MOCK BUILDER CLASS
// =============================================================================

/**
 * Builder class for creating customized HTTP request mock objects with fluent interface
 * and comprehensive configuration options for various testing scenarios.
 * 
 * Provides a fluent API for constructing complex mock request objects with:
 * - Method chaining for easy configuration
 * - Validation of configuration parameters
 * - Default value management
 * - Build-time validation and error checking
 * - Support for custom headers and metadata
 * 
 * @class RequestMockBuilder
 */
class RequestMockBuilder {
    /**
     * Initializes the request mock builder with default configuration and empty state
     * ready for fluent interface usage
     */
    constructor() {
        // Initialize empty request configuration object for builder pattern
        this.requestConfig = {
            method: null,
            url: null,
            headers: {},
            httpVersion: '1.1',
            correlationId: null,
            enableEvents: true,
            socketConfig: {}
        };
        
        // Set up default header configuration with standard HTTP headers
        this.headerConfig = {
            [HTTP_HEADERS.HOST]: 'localhost:3000',
            [HTTP_HEADERS.USER_AGENT]: 'MockRequest-Builder/1.0',
            [HTTP_HEADERS.CONNECTION]: 'keep-alive'
        };
        
        // Configure validation settings for mock request creation
        this.validationConfig = {
            validateMethod: true,
            validateUrl: true,
            validateHeaders: true,
            strictMode: false
        };
        
        // Initialize builder state tracking for fluent interface
        this.isBuilt = false;
    }
    
    /**
     * Sets the HTTP method for the mock request using fluent interface pattern
     * 
     * @param {string} method - HTTP method to set (GET, POST, PUT, DELETE, etc.)
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    withMethod(method) {
        // Validate HTTP method parameter against supported methods
        if (!method || typeof method !== 'string') {
            throw new Error('Method must be a non-empty string');
        }
        
        const normalizedMethod = method.trim().toUpperCase();
        
        if (this.validationConfig.validateMethod && !isValidHttpMethod(normalizedMethod)) {
            throw new Error(`Invalid HTTP method: ${normalizedMethod}`);
        }
        
        // Set method in request configuration object
        this.requestConfig.method = normalizedMethod;
        
        // Return builder instance for continued fluent interface usage
        return this;
    }
    
    /**
     * Sets the URL path for the mock request with validation and normalization
     * 
     * @param {string} url - URL path to set for the request
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    withUrl(url) {
        // Validate and normalize URL parameter for proper format
        if (!url || typeof url !== 'string') {
            throw new Error('URL must be a non-empty string');
        }
        
        const normalizedUrl = url.trim();
        
        if (this.validationConfig.validateUrl) {
            // Basic URL validation
            if (!normalizedUrl.startsWith('/')) {
                throw new Error('URL must start with /');
            }
            
            // Check for path traversal attempts
            if (normalizedUrl.includes('..')) {
                throw new Error('Path traversal detected in URL');
            }
        }
        
        // Set URL in request configuration object
        this.requestConfig.url = normalizedUrl;
        
        // Return builder instance for continued method chaining
        return this;
    }
    
    /**
     * Sets custom headers for the mock request with proper normalization and validation
     * 
     * @param {Object} headers - Headers object to set for the request
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    withHeaders(headers) {
        // Validate headers object structure and format
        if (!headers || typeof headers !== 'object') {
            throw new Error('Headers must be a valid object');
        }
        
        // Normalize header keys to lowercase for HTTP compliance
        const normalizedHeaders = {};
        for (const [key, value] of Object.entries(headers)) {
            if (typeof key === 'string' && typeof value === 'string') {
                const normalizedKey = key.toLowerCase();
                
                if (this.validationConfig.validateHeaders) {
                    // Basic header injection validation
                    if (key.includes('\n') || key.includes('\r') || value.includes('\n') || value.includes('\r')) {
                        throw new Error('Header injection detected');
                    }
                }
                
                normalizedHeaders[normalizedKey] = value;
            }
        }
        
        // Merge custom headers with default headers configuration
        this.requestConfig.headers = { ...this.headerConfig, ...normalizedHeaders };
        
        // Return builder instance for continued fluent interface
        return this;
    }
    
    /**
     * Sets a custom correlation ID for the mock request for tracking and debugging
     * 
     * @param {string} correlationId - Custom correlation ID to set
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    withCorrelationId(correlationId) {
        // Validate correlation ID format and uniqueness
        if (!correlationId || typeof correlationId !== 'string') {
            throw new Error('Correlation ID must be a non-empty string');
        }
        
        // Set correlation ID in request configuration
        this.requestConfig.correlationId = correlationId.trim();
        
        // Return builder instance for method chaining
        return this;
    }
    
    /**
     * Sets HTTP version for the mock request
     * 
     * @param {string} version - HTTP version to set (1.0, 1.1, 2.0)
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    withHttpVersion(version) {
        if (!version || typeof version !== 'string') {
            throw new Error('HTTP version must be a non-empty string');
        }
        
        const normalizedVersion = version.trim();
        if (!/^(1\.0|1\.1|2\.0)$/.test(normalizedVersion)) {
            throw new Error('Invalid HTTP version. Supported: 1.0, 1.1, 2.0');
        }
        
        this.requestConfig.httpVersion = normalizedVersion;
        return this;
    }
    
    /**
     * Enables or disables event emission for the mock request
     * 
     * @param {boolean} enabled - Whether to enable event emission
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    withEvents(enabled) {
        this.requestConfig.enableEvents = Boolean(enabled);
        return this;
    }
    
    /**
     * Creates the final mock HTTP request object using all configured settings and validation
     * 
     * @returns {MockHttpRequest} Complete MockHttpRequest object with all configured properties
     * @throws {Error} If builder has already been used or configuration is invalid
     */
    build() {
        // Validate complete request configuration for consistency
        if (this.isBuilt) {
            throw new Error('Builder can only be used once. Create a new builder for additional requests.');
        }
        
        // Apply default values for any missing configuration properties
        const finalConfig = {
            method: this.requestConfig.method || HTTP_METHODS.GET,
            url: this.requestConfig.url || '/',
            headers: { ...this.headerConfig, ...this.requestConfig.headers },
            httpVersion: this.requestConfig.httpVersion || '1.1',
            correlationId: this.requestConfig.correlationId || generateCorrelationId(),
            enableEvents: this.requestConfig.enableEvents,
            socketConfig: this.requestConfig.socketConfig
        };
        
        // Mark builder as built to prevent multiple builds
        this.isBuilt = true;
        
        // Create MockHttpRequest instance using configuration
        const mockRequest = new MockHttpRequest(finalConfig);
        
        // Return complete mock HTTP request object ready for testing
        return mockRequest;
    }
    
    /**
     * Resets the builder for reuse with fresh configuration
     * 
     * @returns {RequestMockBuilder} RequestMockBuilder instance for method chaining
     */
    reset() {
        this.requestConfig = {
            method: null,
            url: null,
            headers: {},
            httpVersion: '1.1',
            correlationId: null,
            enableEvents: true,
            socketConfig: {}
        };
        this.isBuilt = false;
        return this;
    }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Creates a comprehensive mock HTTP request object that mimics Node.js IncomingMessage
 * structure for testing purposes with realistic properties, methods, and event emission capabilities
 * 
 * @param {Object} [requestOptions={}] - Configuration options for mock request creation
 * @param {string} [requestOptions.method='GET'] - HTTP method for the request
 * @param {string} [requestOptions.url='/'] - URL path for the request
 * @param {Object} [requestOptions.headers={}] - HTTP headers object
 * @param {string} [requestOptions.httpVersion='1.1'] - HTTP protocol version
 * @param {string} [requestOptions.correlationId] - Custom correlation ID
 * @returns {MockHttpRequest} Mock HTTP request object with Node.js IncomingMessage-compatible structure
 */
function createMockHttpRequest(requestOptions = {}) {
    // Extract method, url, headers, and httpVersion from requestOptions parameter
    const {
        method = HTTP_METHODS.GET,
        url = '/',
        headers = {},
        httpVersion = '1.1',
        correlationId = null,
        enableEvents = true,
        ...additionalOptions
    } = requestOptions;
    
    // Set default values for missing properties using constants and configuration
    const config = {
        method: method.toString().trim().toUpperCase(),
        url: url.toString().trim(),
        httpVersion: httpVersion.toString().trim(),
        correlationId: correlationId || generateCorrelationId(),
        enableEvents: enableEvents,
        timestamp: Date.now(),
        ...additionalOptions
    };
    
    // Create headers object with lowercased keys for HTTP/1.1 compliance
    const normalizedHeaders = {};
    for (const [key, value] of Object.entries(headers)) {
        if (typeof key === 'string' && typeof value === 'string') {
            normalizedHeaders[key.toLowerCase()] = value;
        }
    }
    
    // Merge with default headers
    config.headers = { ...DEFAULT_REQUEST_CONFIG.headers, ...normalizedHeaders };
    
    // Create complete mock request object with all Node.js IncomingMessage properties
    const mockRequest = new MockHttpRequest(config);
    
    // Add EventEmitter functionality for realistic request event handling
    if (enableEvents) {
        // Simulate request events that might occur during processing
        process.nextTick(() => {
            mockRequest.emit('ready');
        });
    }
    
    // Return mock HTTP request object ready for testing scenarios
    return mockRequest;
}

/**
 * Creates a valid HTTP GET request mock object specifically for the /hello endpoint
 * with proper headers, metadata, and Node.js IncomingMessage structure
 * 
 * @param {Object} [options={}] - Additional options for hello request customization
 * @param {Object} [options.customHeaders] - Custom headers to add to the request
 * @param {string} [options.userAgent] - Custom user agent string
 * @param {string} [options.host] - Custom host header value
 * @returns {MockHttpRequest} Valid HTTP request mock object configured for hello endpoint success testing
 */
function createValidHelloRequest(options = {}) {
    // Set HTTP method to GET using HTTP_METHODS.GET constant for hello endpoint
    const method = HTTP_METHODS.GET;
    
    // Set URL path to '/hello' for hello endpoint testing
    const url = '/hello';
    
    // Create standard HTTP headers including host, user-agent, accept, and connection
    const standardHeaders = {
        [HTTP_HEADERS.HOST]: options.host || 'localhost:3000',
        [HTTP_HEADERS.USER_AGENT]: options.userAgent || 'Tutorial-Test-Client/1.0',
        'accept': 'text/plain, */*',
        'accept-encoding': 'gzip, deflate',
        'accept-language': 'en-US,en;q=0.9',
        [HTTP_HEADERS.CONNECTION]: 'keep-alive'
    };
    
    // Add optional custom headers from options parameter if provided
    const headers = { ...standardHeaders, ...options.customHeaders };
    
    // Set HTTP version to '1.1' for protocol compliance and realistic simulation
    const httpVersion = options.httpVersion || '1.1';
    
    // Generate unique correlation ID for request tracking and test isolation
    const correlationId = options.correlationId || generateCorrelationId();
    
    // Create mock request object using createMockHttpRequest with hello-specific configuration
    const mockRequest = createMockHttpRequest({
        method: method,
        url: url,
        headers: headers,
        httpVersion: httpVersion,
        correlationId: correlationId,
        enableEvents: options.enableEvents !== false,
        testId: generateTestId(),
        requestType: 'valid_hello',
        expectedStatus: 200,
        expectedResponse: 'Hello world'
    });
    
    // Add hello-specific metadata for test verification
    mockRequest.testMetadata = {
        testType: 'valid_hello_endpoint',
        expectedStatus: 200,
        expectedResponse: 'Hello world',
        endpointPath: '/hello',
        validationSchema: 'HELLO_REQUEST'
    };
    
    // Return complete valid request mock ready for hello endpoint testing
    return mockRequest;
}

/**
 * Creates HTTP request mock objects with invalid methods for testing method validation,
 * 405 error responses, and request handler error scenarios
 * 
 * @param {string} invalidMethod - Invalid HTTP method to use (POST, PUT, DELETE, etc.)
 * @param {Object} [options={}] - Additional options for invalid method request
 * @returns {MockHttpRequest} HTTP request mock object with invalid method for error scenario testing
 */
function createInvalidMethodRequest(invalidMethod, options = {}) {
    // Set HTTP method to provided invalidMethod parameter (POST, PUT, DELETE, etc.)
    const method = invalidMethod.toString().trim().toUpperCase();
    
    // Set URL path to '/hello' to test method restrictions on valid endpoint
    const url = options.url || '/hello';
    
    // Create standard headers structure for request completeness and realism
    const headers = {
        [HTTP_HEADERS.HOST]: options.host || 'localhost:3000',
        [HTTP_HEADERS.USER_AGENT]: options.userAgent || 'Invalid-Method-Test-Client/1.0',
        [HTTP_HEADERS.CONNECTION]: options.connection || 'keep-alive',
        ...options.customHeaders
    };
    
    // Add method-specific headers for POST/PUT requests
    if (method === HTTP_METHODS.POST || method === HTTP_METHODS.PUT) {
        headers[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.APPLICATION_JSON_UTF8;
        headers[HTTP_HEADERS.CONTENT_LENGTH] = '0';
    }
    
    // Create mock request object using createMockHttpRequest with error configuration
    const mockRequest = createMockHttpRequest({
        method: method,
        url: url,
        headers: headers,
        httpVersion: options.httpVersion || '1.1',
        correlationId: options.correlationId || generateCorrelationId(),
        enableEvents: options.enableEvents !== false,
        testId: generateTestId(),
        requestType: 'invalid_method'
    });
    
    // Add request validation metadata including expected error type and status code
    mockRequest.testMetadata = {
        testType: 'invalid_method_validation',
        invalidMethod: method,
        targetEndpoint: url,
        expectedStatus: 405,
        expectedErrorType: 'METHOD_NOT_ALLOWED',
        allowedMethods: getAllowedMethodsForEndpoint(url),
        validationExpected: false
    };
    
    // Include expected 405 Method Not Allowed error information for validation
    mockRequest.expectedError = {
        status: 405,
        message: 'Method Not Allowed',
        allowHeader: getAllowedMethodsForEndpoint(url).join(', ')
    };
    
    // Return invalid method request mock for method validation testing
    return mockRequest;
}

/**
 * Creates HTTP request mock objects with invalid URL paths for testing route matching,
 * 404 error responses, and path validation scenarios
 * 
 * @param {string} invalidPath - Invalid URL path to use for testing
 * @param {Object} [options={}] - Additional options for invalid path request
 * @returns {MockHttpRequest} HTTP request mock object with invalid path for route validation testing
 */
function createInvalidPathRequest(invalidPath, options = {}) {
    // Set HTTP method to valid GET method for isolated path testing
    const method = options.method || HTTP_METHODS.GET;
    
    // Set URL path to provided invalidPath parameter for route error testing
    const url = invalidPath.toString().trim();
    
    // Create standard headers structure with proper format and realistic values
    const headers = {
        [HTTP_HEADERS.HOST]: options.host || 'localhost:3000',
        [HTTP_HEADERS.USER_AGENT]: options.userAgent || 'Invalid-Path-Test-Client/1.0',
        'accept': 'text/plain, */*',
        [HTTP_HEADERS.CONNECTION]: options.connection || 'keep-alive',
        ...options.customHeaders
    };
    
    // Create mock request object using createMockHttpRequest with path error configuration
    const mockRequest = createMockHttpRequest({
        method: method,
        url: url,
        headers: headers,
        httpVersion: options.httpVersion || '1.1',
        correlationId: options.correlationId || generateCorrelationId(),
        enableEvents: options.enableEvents !== false,
        testId: generateTestId(),
        requestType: 'invalid_path'
    });
    
    // Add path validation metadata including expected error type and routing context
    mockRequest.testMetadata = {
        testType: 'invalid_path_validation',
        invalidPath: url,
        requestMethod: method,
        expectedStatus: 404,
        expectedErrorType: 'NOT_FOUND',
        routingExpected: false,
        validationExpected: false
    };
    
    // Include expected 404 Not Found error information for validation testing
    mockRequest.expectedError = {
        status: 404,
        message: 'Not Found',
        path: url
    };
    
    // Add routing metadata for path matching and error handling testing
    mockRequest.routingMetadata = {
        pathMatched: false,
        availableRoutes: ['/hello'],
        routingAttempted: true
    };
    
    // Return invalid path request mock for route validation and error testing
    return mockRequest;
}

/**
 * Creates malformed HTTP request mock objects for testing request parsing,
 * validation error handling, and edge case scenarios with various malformation types
 * 
 * @param {string} malformationType - Type of malformation to apply (missing_headers, invalid_format, etc.)
 * @param {Object} [options={}] - Additional options for malformed request creation
 * @returns {MockHttpRequest} Malformed HTTP request mock object for parsing error and edge case testing
 */
function createMalformedRequest(malformationType, options = {}) {
    let malformedConfig = {};
    
    // Determine malformation type from malformationType parameter and apply specific patterns
    switch (malformationType) {
        case 'missing_headers':
            malformedConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: {}, // Empty headers object
                httpVersion: '1.1'
            };
            break;
            
        case 'invalid_method':
            malformedConfig = {
                method: 'INVALID_METHOD',
                url: '/hello',
                headers: { [HTTP_HEADERS.HOST]: 'localhost:3000' },
                httpVersion: '1.1'
            };
            break;
            
        case 'malformed_url':
            malformedConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello/../admin/../../etc/passwd',
                headers: { [HTTP_HEADERS.HOST]: 'localhost:3000' },
                httpVersion: '1.1'
            };
            break;
            
        case 'header_injection':
            malformedConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    'injected\r\nheader': 'malicious\nvalue',
                    'x-malicious': 'value\r\nSet-Cookie: evil=true'
                },
                httpVersion: '1.1'
            };
            break;
            
        case 'oversized_request':
            const largeHeader = 'x'.repeat(10000);
            malformedConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    'x-large-header': largeHeader
                },
                httpVersion: '1.1'
            };
            break;
            
        default:
            malformedConfig = {
                method: 'UNKNOWN',
                url: '',
                headers: null,
                httpVersion: '0.9'
            };
            break;
    }
    
    // Apply specific malformation patterns based on type including structural issues
    const finalConfig = { ...malformedConfig, ...options.configOverrides };
    
    // Create request object with intentional defects using createMockHttpRequest
    const mockRequest = createMockHttpRequest({
        ...finalConfig,
        correlationId: options.correlationId || generateCorrelationId(),
        enableEvents: options.enableEvents !== false,
        testId: generateTestId(),
        requestType: 'malformed'
    });
    
    // Add malformation metadata for error testing identification and classification
    mockRequest.testMetadata = {
        testType: 'malformed_request_testing',
        malformationType: malformationType,
        expectedParsingError: true,
        expectedStatus: 400,
        expectedErrorType: 'BAD_REQUEST',
        validationExpected: false
    };
    
    // Include expected parsing error information and validation failure details
    mockRequest.expectedError = {
        status: 400,
        message: 'Bad Request',
        malformationType: malformationType,
        parsingError: true
    };
    
    // Add debugging information for malformation analysis and test verification
    mockRequest.malformationDetails = {
        appliedPattern: malformationType,
        structuralIssues: _identifyStructuralIssues(malformedConfig),
        securityRisks: _identifySecurityRisks(malformedConfig),
        parsingChallenges: _identifyParsingChallenges(malformedConfig)
    };
    
    // Return malformed request mock for comprehensive error handling testing
    return mockRequest;
}

/**
 * Creates HTTP request mock objects with security threat patterns for testing
 * security validation, injection prevention, and threat detection capabilities
 * 
 * @param {string} threatType - Type of security threat to simulate (injection, traversal, XSS, etc.)
 * @param {Object} [securityOptions={}] - Security-specific configuration options
 * @returns {MockHttpRequest} HTTP request mock object with security threat patterns for security testing
 */
function createSecurityTestRequest(threatType, securityOptions = {}) {
    let threatConfig = {};
    
    // Determine threat type from threatType parameter and apply security threat patterns
    switch (threatType) {
        case 'path_traversal':
            threatConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello/../../../etc/passwd',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    [HTTP_HEADERS.USER_AGENT]: 'Security-Test/1.0'
                }
            };
            break;
            
        case 'header_injection':
            threatConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    'x-injected\r\nSet-Cookie': 'malicious=true',
                    'x-forwarded-for': '192.168.1.1\r\nX-Evil: true'
                }
            };
            break;
            
        case 'xss_attempt':
            threatConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello?name=<script>alert("xss")</script>',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    [HTTP_HEADERS.USER_AGENT]: 'Test-Agent/1.0 <script>alert("xss")</script>',
                    'x-custom': '<img src=x onerror=alert("xss")>'
                }
            };
            break;
            
        case 'sql_injection':
            threatConfig = {
                method: HTTP_METHODS.GET,
                url: "/hello?id=1' OR '1'='1",
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    'x-user-id': "admin'; DROP TABLE users; --",
                    'x-search': "test' UNION SELECT * FROM passwords --"
                }
            };
            break;
            
        case 'oversized_attack':
            const attackPayload = 'A'.repeat(100000);
            threatConfig = {
                method: HTTP_METHODS.POST,
                url: '/hello',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.APPLICATION_JSON_UTF8,
                    [HTTP_HEADERS.CONTENT_LENGTH]: attackPayload.length.toString(),
                    'x-attack-payload': attackPayload
                }
            };
            break;
            
        default:
            threatConfig = {
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: {
                    [HTTP_HEADERS.HOST]: 'localhost:3000',
                    'x-generic-threat': 'unknown threat pattern'
                }
            };
            break;
    }
    
    // Apply security threat patterns to appropriate request components
    const finalConfig = { ...threatConfig, ...securityOptions.configOverrides };
    
    // Create request object with malicious patterns using createMockHttpRequest
    const mockRequest = createMockHttpRequest({
        ...finalConfig,
        correlationId: securityOptions.correlationId || generateCorrelationId(),
        enableEvents: securityOptions.enableEvents !== false,
        testId: generateTestId(),
        requestType: 'security_test'
    });
    
    // Add security testing metadata including threat classification and severity
    mockRequest.testMetadata = {
        testType: 'security_threat_testing',
        threatType: threatType,
        threatSeverity: _determineThreatSeverity(threatType),
        expectedDetection: true,
        expectedStatus: _getExpectedSecurityStatus(threatType),
        securityValidationRequired: true
    };
    
    // Include expected security validation results and detection requirements
    mockRequest.securityContext = {
        threatClassification: threatType,
        attackVector: _getAttackVector(threatType),
        detectionMethod: _getDetectionMethod(threatType),
        mitigationStrategy: _getMitigationStrategy(threatType),
        riskLevel: _determineThreatSeverity(threatType)
    };
    
    // Configure threat detection scenarios for security validation testing
    mockRequest.expectedSecurityResult = {
        shouldDetect: true,
        detectionPoints: _getDetectionPoints(threatType),
        preventionMethods: _getPreventionMethods(threatType),
        responseAction: _getSecurityResponseAction(threatType)
    };
    
    // Return security test request mock for comprehensive threat detection testing
    return mockRequest;
}

/**
 * Creates multiple HTTP request mock objects in bulk for performance testing,
 * load testing, and concurrent request scenario validation
 * 
 * @param {number} count - Number of request mock objects to create
 * @param {string} [requestType='valid'] - Type of requests to create in bulk
 * @param {Object} [bulkOptions={}] - Configuration options for bulk creation
 * @returns {Array<MockHttpRequest>} Array of HTTP request mock objects for bulk testing scenarios
 */
function createBulkRequestMocks(count, requestType = 'valid', bulkOptions = {}) {
    // Validate count parameter for reasonable bulk generation limits and performance
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error('Count must be a positive integer');
    }
    
    if (count > 10000) {
        throw new Error('Count exceeds maximum limit of 10000 for performance reasons');
    }
    
    // Determine request type template based on requestType parameter
    let templateFunction;
    switch (requestType) {
        case 'valid':
        case 'hello':
            templateFunction = createValidHelloRequest;
            break;
        case 'invalid_method':
            templateFunction = (options) => createInvalidMethodRequest(HTTP_METHODS.POST, options);
            break;
        case 'invalid_path':
            templateFunction = (options) => createInvalidPathRequest('/invalid', options);
            break;
        case 'malformed':
            templateFunction = (options) => createMalformedRequest('missing_headers', options);
            break;
        case 'security':
            templateFunction = (options) => createSecurityTestRequest('xss_attempt', options);
            break;
        default:
            templateFunction = createValidHelloRequest;
            break;
    }
    
    const requests = [];
    
    // Generate specified number of request mock objects with unique identifiers
    for (let i = 0; i < count; i++) {
        // Apply variation and randomization to bulk requests for realistic testing
        const variation = {
            correlationId: `bulk_${requestType}_${i}_${generateCorrelationId()}`,
            testId: `bulk_test_${i}_${generateTestId()}`,
            userAgent: `Bulk-Test-Client/${i + 1}`,
            customHeaders: {
                'x-bulk-index': i.toString(),
                'x-bulk-total': count.toString(),
                'x-bulk-type': requestType,
                'x-request-timestamp': Date.now().toString()
            },
            ...bulkOptions.requestVariation
        };
        
        // Add unique correlation IDs and timestamps to each request mock
        const bulkRequest = templateFunction(variation);
        
        // Configure bulk testing metadata for performance measurement and tracking
        bulkRequest.bulkMetadata = {
            bulkIndex: i,
            bulkTotal: count,
            bulkType: requestType,
            bulkId: bulkOptions.bulkId || generateTestId(),
            batchTimestamp: Date.now()
        };
        
        // Ensure request diversity for comprehensive load testing scenarios
        if (bulkOptions.addRandomization) {
            // Add random delays for realistic timing simulation
            bulkRequest.simulatedDelay = Math.floor(Math.random() * 100);
            
            // Add random headers for variety
            bulkRequest.headers[`x-random-${i}`] = Math.random().toString(36);
        }
        
        requests.push(bulkRequest);
    }
    
    // Return array of request mocks ready for bulk and performance testing
    return requests;
}

/**
 * Generates a comprehensive suite of HTTP request mock objects covering all testing scenarios
 * including valid requests, error cases, security tests, and edge cases
 * 
 * @param {Object} [suiteOptions={}] - Configuration options for test suite generation
 * @param {boolean} [suiteOptions.includeSecurityTests=true] - Include security test cases
 * @param {boolean} [suiteOptions.includeEdgeCases=true] - Include edge case scenarios
 * @param {number} [suiteOptions.bulkCount=10] - Number of bulk requests to generate
 * @returns {Object} Complete test suite with categorized request mocks for comprehensive testing
 */
function generateRequestTestSuite(suiteOptions = {}) {
    const options = {
        includeSecurityTests: true,
        includeEdgeCases: true,
        bulkCount: 10,
        generateCorrelationIds: true,
        ...suiteOptions
    };
    
    const testSuite = {
        metadata: {
            generatedAt: new Date().toISOString(),
            suiteId: generateTestId(),
            correlationId: generateCorrelationId(),
            totalTests: 0,
            categories: []
        },
        valid: {
            description: 'Valid HTTP request scenarios for success path testing',
            requests: []
        },
        invalid: {
            description: 'Invalid HTTP request scenarios for error handling testing',
            requests: []
        },
        security: {
            description: 'Security threat scenarios for threat detection testing',
            requests: []
        },
        edge: {
            description: 'Edge case scenarios for boundary condition testing',
            requests: []
        },
        bulk: {
            description: 'Bulk request scenarios for performance and load testing',
            requests: []
        }
    };
    
    // Generate valid hello endpoint request mocks with various header configurations
    testSuite.valid.requests.push(
        createValidHelloRequest({ testName: 'basic_valid_hello' }),
        createValidHelloRequest({ 
            testName: 'hello_with_custom_user_agent',
            userAgent: 'Custom-Test-Agent/2.0' 
        }),
        createValidHelloRequest({ 
            testName: 'hello_with_accept_headers',
            customHeaders: {
                'accept': 'text/plain, application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9,es;q=0.8'
            }
        })
    );
    
    // Create invalid method request mocks for all unsupported HTTP methods
    const invalidMethods = [HTTP_METHODS.POST, HTTP_METHODS.PUT, HTTP_METHODS.DELETE, 'PATCH'];
    invalidMethods.forEach(method => {
        testSuite.invalid.requests.push(
            createInvalidMethodRequest(method, { testName: `invalid_method_${method.toLowerCase()}` })
        );
    });
    
    // Generate invalid path request mocks for route error testing scenarios
    const invalidPaths = ['/invalid', '/hello/extra', '/admin', '/', '/hello/../admin'];
    invalidPaths.forEach(path => {
        testSuite.invalid.requests.push(
            createInvalidPathRequest(path, { testName: `invalid_path_${path.replace(/[\/\.]/g, '_')}` })
        );
    });
    
    // Create malformed request mocks for parsing error and edge case testing
    const malformationTypes = [
        'missing_headers', 
        'invalid_method', 
        'malformed_url', 
        'header_injection', 
        'oversized_request'
    ];
    malformationTypes.forEach(type => {
        testSuite.invalid.requests.push(
            createMalformedRequest(type, { testName: `malformed_${type}` })
        );
    });
    
    // Generate security test request mocks for threat detection and prevention testing
    if (options.includeSecurityTests) {
        const threatTypes = [
            'path_traversal',
            'header_injection', 
            'xss_attempt',
            'sql_injection',
            'oversized_attack'
        ];
        threatTypes.forEach(threat => {
            testSuite.security.requests.push(
                createSecurityTestRequest(threat, { testName: `security_${threat}` })
            );
        });
    }
    
    // Create edge case request mocks for boundary condition and stress testing
    if (options.includeEdgeCases) {
        // Edge case scenarios
        testSuite.edge.requests.push(
            // Minimum valid request
            createMockHttpRequest({
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: { [HTTP_HEADERS.HOST]: 'localhost:3000' },
                testName: 'minimal_valid_request'
            }),
            
            // Maximum headers request
            createMockHttpRequest({
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: {
                    ...createTestData('headers', { 
                        host: 'localhost:3000',
                        customHeaders: Object.fromEntries(
                            Array.from({ length: 20 }, (_, i) => [`x-test-header-${i}`, `value-${i}`])
                        )
                    })
                },
                testName: 'maximum_headers_request'
            }),
            
            // HTTP/1.0 version request
            createMockHttpRequest({
                method: HTTP_METHODS.GET,
                url: '/hello',
                headers: { [HTTP_HEADERS.HOST]: 'localhost:3000' },
                httpVersion: '1.0',
                testName: 'http_1_0_version'
            }),
            
            // Long URL request (within limits)
            createMockHttpRequest({
                method: HTTP_METHODS.GET,
                url: '/hello?' + 'param=value&'.repeat(50).slice(0, -1),
                headers: { [HTTP_HEADERS.HOST]: 'localhost:3000' },
                testName: 'long_url_request'
            })
        );
    }
    
    // Generate bulk requests for performance testing
    if (options.bulkCount > 0) {
        testSuite.bulk.requests = createBulkRequestMocks(
            options.bulkCount, 
            'valid', 
            { 
                bulkId: generateTestId(),
                addRandomization: true,
                testName: 'bulk_performance_test'
            }
        );
    }
    
    // Calculate total test count and update metadata
    testSuite.metadata.totalTests = 
        testSuite.valid.requests.length +
        testSuite.invalid.requests.length +
        testSuite.security.requests.length +
        testSuite.edge.requests.length +
        testSuite.bulk.requests.length;
    
    testSuite.metadata.categories = Object.keys(testSuite).filter(key => key !== 'metadata');
    
    // Organize all request mocks into categorized test suite structure
    testSuite.summary = {
        validRequests: testSuite.valid.requests.length,
        invalidRequests: testSuite.invalid.requests.length,
        securityTests: testSuite.security.requests.length,
        edgeCases: testSuite.edge.requests.length,
        bulkRequests: testSuite.bulk.requests.length,
        totalRequests: testSuite.metadata.totalTests
    };
    
    // Return comprehensive test suite ready for all testing frameworks and scenarios
    return testSuite;
}

// =============================================================================
// HELPER FUNCTIONS FOR MALFORMATION AND SECURITY ANALYSIS
// =============================================================================

/**
 * Identify structural issues in malformed request configuration
 * @private
 * @param {Object} config - Request configuration to analyze
 * @returns {Array<string>} List of identified structural issues
 */
function _identifyStructuralIssues(config) {
    const issues = [];
    
    if (!config.method || typeof config.method !== 'string') {
        issues.push('missing_or_invalid_method');
    }
    
    if (!config.url || typeof config.url !== 'string') {
        issues.push('missing_or_invalid_url');
    }
    
    if (!config.headers || typeof config.headers !== 'object') {
        issues.push('missing_or_invalid_headers');
    }
    
    if (!config.httpVersion || typeof config.httpVersion !== 'string') {
        issues.push('missing_or_invalid_http_version');
    }
    
    return issues;
}

/**
 * Identify security risks in request configuration
 * @private
 * @param {Object} config - Request configuration to analyze
 * @returns {Array<string>} List of identified security risks
 */
function _identifySecurityRisks(config) {
    const risks = [];
    
    if (config.url && config.url.includes('..')) {
        risks.push('path_traversal_attempt');
    }
    
    if (config.headers) {
        for (const [key, value] of Object.entries(config.headers)) {
            if (key.includes('\n') || key.includes('\r') || value.includes('\n') || value.includes('\r')) {
                risks.push('header_injection_attempt');
                break;
            }
        }
    }
    
    if (config.method && !/^[A-Z]+$/.test(config.method)) {
        risks.push('method_injection_attempt');
    }
    
    return risks;
}

/**
 * Identify parsing challenges in request configuration
 * @private
 * @param {Object} config - Request configuration to analyze
 * @returns {Array<string>} List of identified parsing challenges
 */
function _identifyParsingChallenges(config) {
    const challenges = [];
    
    if (config.headers === null || config.headers === undefined) {
        challenges.push('null_headers_object');
    }
    
    if (config.url === '') {
        challenges.push('empty_url_string');
    }
    
    if (config.httpVersion && !['1.0', '1.1', '2.0'].includes(config.httpVersion)) {
        challenges.push('unsupported_http_version');
    }
    
    return challenges;
}

/**
 * Determine threat severity level for security testing
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {string} Threat severity level (low, medium, high, critical)
 */
function _determineThreatSeverity(threatType) {
    const severityMap = {
        'path_traversal': 'high',
        'header_injection': 'medium',
        'xss_attempt': 'medium',
        'sql_injection': 'critical',
        'oversized_attack': 'medium'
    };
    
    return severityMap[threatType] || 'low';
}

/**
 * Get expected HTTP status for security threat scenarios
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {number} Expected HTTP status code
 */
function _getExpectedSecurityStatus(threatType) {
    const statusMap = {
        'path_traversal': 400,
        'header_injection': 400,
        'xss_attempt': 400,
        'sql_injection': 400,
        'oversized_attack': 413
    };
    
    return statusMap[threatType] || 400;
}

/**
 * Get attack vector for threat type
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {string} Attack vector description
 */
function _getAttackVector(threatType) {
    const vectorMap = {
        'path_traversal': 'URL path manipulation',
        'header_injection': 'HTTP header injection',
        'xss_attempt': 'Cross-site scripting',
        'sql_injection': 'SQL injection attack',
        'oversized_attack': 'Denial of service'
    };
    
    return vectorMap[threatType] || 'Unknown attack vector';
}

/**
 * Get detection method for threat type
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {string} Detection method description
 */
function _getDetectionMethod(threatType) {
    const methodMap = {
        'path_traversal': 'Path pattern analysis',
        'header_injection': 'Header format validation',
        'xss_attempt': 'Input sanitization',
        'sql_injection': 'Parameter validation',
        'oversized_attack': 'Size limit checking'
    };
    
    return methodMap[threatType] || 'Pattern matching';
}

/**
 * Get mitigation strategy for threat type
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {string} Mitigation strategy description
 */
function _getMitigationStrategy(threatType) {
    const strategyMap = {
        'path_traversal': 'Path normalization and whitelist validation',
        'header_injection': 'Header value sanitization and format validation',
        'xss_attempt': 'Input encoding and content security policy',
        'sql_injection': 'Parameterized queries and input validation',
        'oversized_attack': 'Request size limits and rate limiting'
    };
    
    return strategyMap[threatType] || 'Input validation and sanitization';
}

/**
 * Get detection points for threat type
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {Array<string>} List of detection points
 */
function _getDetectionPoints(threatType) {
    const pointsMap = {
        'path_traversal': ['url_parsing', 'path_validation', 'route_matching'],
        'header_injection': ['header_parsing', 'value_validation', 'format_checking'],
        'xss_attempt': ['input_validation', 'output_encoding', 'content_filtering'],
        'sql_injection': ['parameter_validation', 'query_analysis', 'input_sanitization'],
        'oversized_attack': ['size_checking', 'rate_limiting', 'resource_monitoring']
    };
    
    return pointsMap[threatType] || ['input_validation'];
}

/**
 * Get prevention methods for threat type
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {Array<string>} List of prevention methods
 */
function _getPreventionMethods(threatType) {
    const methodsMap = {
        'path_traversal': ['path_normalization', 'whitelist_validation', 'chroot_isolation'],
        'header_injection': ['header_sanitization', 'format_validation', 'value_encoding'],
        'xss_attempt': ['input_encoding', 'output_filtering', 'csp_headers'],
        'sql_injection': ['parameterized_queries', 'input_validation', 'least_privilege'],
        'oversized_attack': ['size_limits', 'rate_limiting', 'resource_quotas']
    };
    
    return methodsMap[threatType] || ['input_validation'];
}

/**
 * Get security response action for threat type
 * @private
 * @param {string} threatType - Type of security threat
 * @returns {string} Security response action
 */
function _getSecurityResponseAction(threatType) {
    const actionMap = {
        'path_traversal': 'Block request and log security event',
        'header_injection': 'Sanitize headers and continue processing',
        'xss_attempt': 'Encode input and return safe response',
        'sql_injection': 'Block request and alert security team',
        'oversized_attack': 'Reject request and implement rate limiting'
    };
    
    return actionMap[threatType] || 'Block request and log event';
}

// =============================================================================
// REQUEST MOCK PRESETS
// =============================================================================

/**
 * Pre-configured request mock presets for common testing scenarios and quick test setup
 * @constant {Object} REQUEST_MOCK_PRESETS
 */
const REQUEST_MOCK_PRESETS = {
    VALID_HELLO_GET: {
        description: 'Valid GET request to /hello endpoint',
        factory: () => createValidHelloRequest({ testName: 'preset_valid_hello' }),
        expectedStatus: 200,
        expectedResponse: 'Hello world',
        testType: 'success_scenario'
    },
    
    INVALID_POST_HELLO: {
        description: 'Invalid POST request to /hello endpoint',
        factory: () => createInvalidMethodRequest(HTTP_METHODS.POST, { testName: 'preset_invalid_post' }),
        expectedStatus: 405,
        expectedError: 'Method Not Allowed',
        testType: 'error_scenario'
    },
    
    INVALID_PATH_GET: {
        description: 'Valid GET request to invalid path',
        factory: () => createInvalidPathRequest('/invalid', { testName: 'preset_invalid_path' }),
        expectedStatus: 404,
        expectedError: 'Not Found',
        testType: 'error_scenario'
    },
    
    MALFORMED_REQUEST: {
        description: 'Malformed request with header injection',
        factory: () => createMalformedRequest('header_injection', { testName: 'preset_malformed' }),
        expectedStatus: 400,
        expectedError: 'Bad Request',
        testType: 'error_scenario'
    },
    
    SECURITY_TEST_REQUEST: {
        description: 'Security test with XSS attempt',
        factory: () => createSecurityTestRequest('xss_attempt', { testName: 'preset_security' }),
        expectedStatus: 400,
        expectedError: 'Bad Request',
        testType: 'security_scenario'
    }
};

// =============================================================================
// DEFAULT EXPORT OBJECT
// =============================================================================

/**
 * Default export object providing convenient access to all HTTP request mocking functionality
 * @constant {Object} httpRequestMock
 */
const httpRequestMock = {
    // Factory function for creating basic mock requests
    create: createMockHttpRequest,
    
    // Builder class for fluent interface request creation
    builder: RequestMockBuilder,
    
    // Pre-configured request presets for common scenarios
    presets: REQUEST_MOCK_PRESETS,
    
    // Helper functions for advanced mocking scenarios
    helpers: {
        generateTestId: generateTestId,
        generateCorrelationId: generateCorrelationId,
        createTestData: createTestData,
        createValidHelloRequest: createValidHelloRequest,
        createInvalidMethodRequest: createInvalidMethodRequest,
        createInvalidPathRequest: createInvalidPathRequest,
        createMalformedRequest: createMalformedRequest,
        createSecurityTestRequest: createSecurityTestRequest,
        createBulkRequestMocks: createBulkRequestMocks,
        generateRequestTestSuite: generateRequestTestSuite
    },
    
    // Configuration constants
    config: {
        DEFAULT_REQUEST_CONFIG: DEFAULT_REQUEST_CONFIG,
        MOCK_SOCKET_CONFIG: MOCK_SOCKET_CONFIG,
        REQUEST_MOCK_TEMPLATES: REQUEST_MOCK_TEMPLATES
    },
    
    // Mock class constructors
    classes: {
        MockHttpRequest: MockHttpRequest,
        RequestMockBuilder: RequestMockBuilder
    }
};

// =============================================================================
// MODULE EXPORTS
// =============================================================================

// Export factory functions for creating mock request objects
module.exports = {
    // Primary factory function for basic mock HTTP request creation
    createMockHttpRequest,
    
    // Specialized factory functions for specific testing scenarios
    createValidHelloRequest,
    createInvalidMethodRequest,
    createInvalidPathRequest,
    createMalformedRequest,
    createSecurityTestRequest,
    createBulkRequestMocks,
    generateRequestTestSuite,
    
    // Mock classes for advanced testing scenarios
    MockHttpRequest,
    RequestMockBuilder,
    
    // Pre-configured request mock presets for quick test setup
    REQUEST_MOCK_PRESETS,
    
    // Default export object with convenient access to all functionality
    httpRequestMock,
    
    // Configuration constants for advanced customization
    DEFAULT_REQUEST_CONFIG,
    MOCK_SOCKET_CONFIG,
    REQUEST_MOCK_TEMPLATES,
    
    // Utility functions for test data generation
    generateTestId,
    generateCorrelationId,
    createTestData
};