/**
 * Test Fixture Data Module for HTTP Request Objects
 * 
 * Provides comprehensive test fixture data containing mock HTTP request objects for
 * comprehensive testing of the Node.js tutorial application. This module implements
 * standardized request data for unit tests, integration tests, and end-to-end tests
 * including valid hello endpoint requests, invalid method scenarios, malformed requests,
 * and security test cases with embedded mock HTTP request creation functionality.
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive test fixture organization and structure
 * - Shows proper mock object creation for Node.js IncomingMessage compatibility
 * - Illustrates security-conscious test data creation and validation patterns
 * - Provides examples of enterprise-grade test data management
 * - Shows integration patterns between test fixtures and application constants
 * - Demonstrates production-ready testing approaches with realistic HTTP structures
 * 
 * Key Features:
 * - Embedded mock HTTP request creation functionality to eliminate external dependencies
 * - Comprehensive request fixtures covering all testing scenarios
 * - Integration with application constants for consistent test data
 * - Node.js IncomingMessage-compatible request object structures
 * - Security test patterns for threat detection and validation testing
 * - Performance test support with bulk request generation capabilities
 * 
 * Testing Support:
 * - Controller testing with realistic HTTP request structures
 * - Request handler testing with valid and invalid scenarios
 * - Middleware testing with comprehensive request variations
 * - Validation testing with malformed and edge case requests
 * - Security testing with threat pattern simulation
 * - Integration testing with complete request-response cycles
 * 
 * @fileoverview Comprehensive HTTP request test fixtures with embedded mock functionality
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import HTTP method constants for creating realistic request fixtures with proper method values
import { 
    HTTP_METHODS 
} from '../../constants/http-methods.js';

// Import HTTP header and content type constants for creating request fixtures with proper header structures
import { 
    HTTP_HEADERS,
    CONTENT_TYPES 
} from '../../constants/http-headers.js';

// Import request type definitions for creating properly structured request fixtures
import { 
    REQUEST_TYPES 
} from '../../types/request.types.js';

// Import valid test configuration objects for creating request fixtures with proper test context
import { 
    VALID_TEST_CONFIGS 
} from './test-config.js';

// ============================================================================
// GLOBAL TEST FIXTURE CONSTANTS
// ============================================================================

/**
 * Default timestamp for request fixtures to ensure consistent test data
 * @type {number}
 */
const DEFAULT_REQUEST_TIMESTAMP = Date.now();

/**
 * Test user agent string for identifying test requests in logs and monitoring
 * @type {string}
 */
const TEST_USER_AGENT = 'Node.js Tutorial Test Client/1.0.0';

/**
 * Default host header value for test requests
 * @type {string}
 */
const DEFAULT_HOST = 'localhost:3000';

/**
 * Hello endpoint path constant for consistent endpoint testing
 * @type {string}
 */
const HELLO_ENDPOINT_PATH = '/hello';

/**
 * Default HTTP version for test requests to ensure protocol compliance
 * @type {string}
 */
const DEFAULT_HTTP_VERSION = '1.1';

/**
 * Test request correlation ID prefix for tracking test requests
 * @type {string}
 */
const TEST_REQUEST_ID_PREFIX = 'test-req';

/**
 * Maximum request header size for testing boundary conditions
 * @type {number}
 */
const MAX_HEADER_SIZE = 8192;

/**
 * Common test headers used across multiple request fixtures
 * @type {Object}
 */
const COMMON_TEST_HEADERS = {
    [HTTP_HEADERS.HOST]: DEFAULT_HOST,
    [HTTP_HEADERS.USER_AGENT]: TEST_USER_AGENT,
    [HTTP_HEADERS.ACCEPT]: '*/*',
    [HTTP_HEADERS.CONNECTION]: 'keep-alive'
};

// ============================================================================
// MOCK HTTP REQUEST CLASS IMPLEMENTATION
// ============================================================================

/**
 * MockHttpRequest Class
 * 
 * Embedded mock HTTP request class that mimics Node.js IncomingMessage behavior for testing
 * purposes. Localizes mock functionality to eliminate circular dependencies while providing
 * realistic request object structure and properties for comprehensive request testing scenarios.
 * 
 * This class provides:
 * - Node.js IncomingMessage-compatible properties and methods
 * - Realistic HTTP request object structure with proper property names
 * - Header management functionality with lowercase key normalization
 * - Socket and connection mock objects for complete compatibility
 * - Request metadata including timestamps and correlation IDs
 * - Educational patterns demonstrating HTTP request object structure
 * 
 * Architecture Integration:
 * - Supports F-003 Request Processing Engine testing with realistic request objects
 * - Enables F-002 Hello Endpoint Implementation validation with proper request structures
 * - Provides comprehensive request object simulation for controller and middleware testing
 * - Demonstrates Node.js HTTP module compatibility patterns for educational purposes
 */
class MockHttpRequest {
    /**
     * Initializes mock HTTP request object with Node.js IncomingMessage-compatible properties
     * and structure. Creates realistic request object that matches Node.js HTTP module patterns
     * while providing comprehensive testing capabilities.
     * 
     * @param {Object} config - Configuration object for mock request creation
     * @param {string} [config.method='GET'] - HTTP method for the request
     * @param {string} [config.url='/'] - Request URL path and query string
     * @param {Object} [config.headers={}] - HTTP headers object
     * @param {string} [config.httpVersion='1.1'] - HTTP protocol version
     * @param {string} [config.remoteAddress='127.0.0.1'] - Client IP address
     * @param {number} [config.remotePort=12345] - Client port number
     */
    constructor(config = {}) {
        try {
            // Set HTTP method from config with default to GET for hello endpoint testing
            this.method = (config.method || HTTP_METHODS.GET).toString().toUpperCase();
            
            // Set URL from config with default to root path for basic testing
            this.url = config.url || '/';
            
            // Set HTTP version from config with default to 1.1 for protocol compliance
            this.httpVersion = config.httpVersion || DEFAULT_HTTP_VERSION;
            
            // Normalize headers to lowercase keys for HTTP compliance following Node.js patterns
            this.headers = {};
            if (config.headers && typeof config.headers === 'object') {
                Object.keys(config.headers).forEach(key => {
                    this.headers[key.toLowerCase()] = config.headers[key];
                });
            }
            
            // Add default headers if not provided for realistic request structure
            if (!this.headers[HTTP_HEADERS.HOST.toLowerCase()]) {
                this.headers[HTTP_HEADERS.HOST.toLowerCase()] = DEFAULT_HOST;
            }
            if (!this.headers[HTTP_HEADERS.USER_AGENT.toLowerCase()]) {
                this.headers[HTTP_HEADERS.USER_AGENT.toLowerCase()] = TEST_USER_AGENT;
            }
            
            // Create mock socket object for Node.js IncomingMessage compatibility
            this.socket = {
                remoteAddress: config.remoteAddress || '127.0.0.1',
                remotePort: config.remotePort || Math.floor(Math.random() * 50000) + 10000,
                localAddress: '127.0.0.1',
                localPort: 3000,
                bytesRead: 0,
                bytesWritten: 0,
                connecting: false,
                destroyed: false,
                readable: true,
                writable: true
            };
            
            // Create mock connection object aliasing socket for compatibility
            this.connection = this.socket;
            
            // Add Node.js IncomingMessage properties for complete compatibility
            this.complete = true;
            this.readable = true;
            this.readableHighWaterMark = 16384;
            this.readableBuffer = { length: 0 };
            this.readableFlowing = null;
            this.readableLength = 0;
            this.destroyed = false;
            
            // Set request metadata including timestamp and correlation ID for tracking
            this.timestamp = config.timestamp || DEFAULT_REQUEST_TIMESTAMP;
            this.requestId = config.requestId || `${TEST_REQUEST_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Add raw headers for Node.js compatibility
            this.rawHeaders = [];
            Object.keys(this.headers).forEach(key => {
                this.rawHeaders.push(key, this.headers[key]);
            });
            
            // Set trailers and raw trailers for HTTP/1.1 compatibility
            this.trailers = {};
            this.rawTrailers = [];
            
        } catch (error) {
            // Initialize with minimal safe defaults if construction fails
            this.method = HTTP_METHODS.GET;
            this.url = '/';
            this.headers = { ...COMMON_TEST_HEADERS };
            this.httpVersion = DEFAULT_HTTP_VERSION;
            this.socket = { remoteAddress: '127.0.0.1', remotePort: 12345 };
            this.connection = this.socket;
            this.timestamp = Date.now();
            this.requestId = `${TEST_REQUEST_ID_PREFIX}-error-${Date.now()}`;
        }
    }
    
    /**
     * Sets or updates a header value in the mock request headers object following
     * HTTP header naming conventions and Node.js patterns for header management.
     * 
     * @param {string} name - Header name to set or update
     * @param {string} value - Header value to assign
     * @returns {void} No return value, modifies headers object
     */
    setHeader(name, value) {
        try {
            // Normalize header name to lowercase for HTTP compliance
            const normalizedName = name.toString().toLowerCase();
            
            // Validate header name and value format for HTTP compliance
            if (normalizedName && value !== null && value !== undefined) {
                this.headers[normalizedName] = value.toString();
                
                // Update raw headers array for Node.js compatibility
                const existingIndex = this.rawHeaders.findIndex((item, index) => 
                    index % 2 === 0 && item.toLowerCase() === normalizedName
                );
                
                if (existingIndex >= 0) {
                    this.rawHeaders[existingIndex + 1] = value.toString();
                } else {
                    this.rawHeaders.push(normalizedName, value.toString());
                }
            }
            
        } catch (error) {
            // Silently handle header setting errors to maintain test stability
        }
    }
    
    /**
     * Retrieves a header value from the mock request headers object using case-insensitive
     * lookup following HTTP header specification patterns.
     * 
     * @param {string} name - Header name to retrieve
     * @returns {string|undefined} Header value or undefined if not found
     */
    getHeader(name) {
        try {
            // Normalize header name to lowercase for lookup
            const normalizedName = name.toString().toLowerCase();
            
            // Retrieve header value from headers object
            return this.headers[normalizedName];
            
        } catch (error) {
            // Return undefined if header retrieval fails
            return undefined;
        }
    }
    
    /**
     * Checks if a specific header exists in the mock request headers using case-insensitive
     * comparison following HTTP header naming conventions.
     * 
     * @param {string} name - Header name to check for existence
     * @returns {boolean} True if header exists, false otherwise
     */
    hasHeader(name) {
        try {
            // Normalize header name to lowercase for lookup
            const normalizedName = name.toString().toLowerCase();
            
            // Check if header exists in headers object
            return this.headers.hasOwnProperty(normalizedName);
            
        } catch (error) {
            // Return false if header check fails
            return false;
        }
    }
}

// ============================================================================
// REQUEST FIXTURE GENERATOR CLASS IMPLEMENTATION
// ============================================================================

/**
 * RequestFixtureGenerator Class
 * 
 * Class for generating various types of HTTP request fixtures with customizable options
 * and realistic request structures for comprehensive testing scenarios. Uses embedded mock
 * functionality to eliminate external dependencies while integrating with constants for
 * Node.js IncomingMessage compatibility and supports validation testing, security testing,
 * and performance testing.
 * 
 * This class provides:
 * - Dynamic request fixture generation with customizable options
 * - Integration with application constants for consistent test data
 * - Support for various testing scenarios including edge cases and security tests
 * - Bulk request generation for performance and load testing
 * - Embedded mock functionality for dependency elimination
 * - Educational patterns demonstrating advanced testing approaches
 */
class RequestFixtureGenerator {
    /**
     * Initializes the request fixture generator with default configuration and request
     * templates using embedded mock functionality and application constants.
     * 
     * @param {Object} config - Configuration object for fixture generator
     * @param {Object} [config.defaultHeaders] - Default headers for all generated requests
     * @param {string} [config.userAgent] - Default user agent string for requests
     * @param {Array} [config.supportedPaths] - List of supported endpoint paths
     */
    constructor(config = {}) {
        try {
            // Set default HTTP headers for consistent request fixtures
            this.defaultHeaders = {
                ...COMMON_TEST_HEADERS,
                ...config.defaultHeaders
            };
            
            // Initialize method to test case mappings from constants
            this.methodMappings = {
                [HTTP_METHODS.GET]: 'valid',
                [HTTP_METHODS.POST]: 'invalid_method',
                [HTTP_METHODS.PUT]: 'invalid_method',
                [HTTP_METHODS.DELETE]: 'invalid_method'
            };
            
            // Configure supported paths for endpoint testing
            this.supportedPaths = config.supportedPaths || [HELLO_ENDPOINT_PATH];
            
            // Set user agent string for request identification
            this.userAgent = config.userAgent || TEST_USER_AGENT;
            
            // Initialize timestamp and metadata for fixture tracking
            this.generatedAt = new Date().toISOString();
            this.fixtureCount = 0;
            
        } catch (error) {
            // Initialize with safe defaults if configuration fails
            this.defaultHeaders = COMMON_TEST_HEADERS;
            this.methodMappings = { [HTTP_METHODS.GET]: 'valid' };
            this.supportedPaths = [HELLO_ENDPOINT_PATH];
            this.userAgent = TEST_USER_AGENT;
            this.generatedAt = new Date().toISOString();
            this.fixtureCount = 0;
        }
    }
    
    /**
     * Generates a valid HTTP request fixture for the specified endpoint and method using
     * embedded mock functionality and application constants for realistic request structure.
     * 
     * @param {string} endpoint - Target endpoint path (e.g., '/hello')
     * @param {string} method - HTTP method for the request
     * @param {Object} options - Additional options for request generation
     * @returns {Object} Valid HTTP request object with proper structure and headers
     */
    generateValidRequest(endpoint = HELLO_ENDPOINT_PATH, method = HTTP_METHODS.GET, options = {}) {
        try {
            // Validate endpoint and method parameters against supported values
            const validEndpoint = this.supportedPaths.includes(endpoint) ? endpoint : HELLO_ENDPOINT_PATH;
            const validMethod = Object.values(HTTP_METHODS).includes(method.toUpperCase()) ? 
                method.toUpperCase() : HTTP_METHODS.GET;
            
            // Create base request structure with proper HTTP format
            const requestConfig = {
                method: validMethod,
                url: validEndpoint,
                httpVersion: options.httpVersion || DEFAULT_HTTP_VERSION,
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers
                },
                remoteAddress: options.remoteAddress || '127.0.0.1',
                remotePort: options.remotePort || Math.floor(Math.random() * 50000) + 10000
            };
            
            // Add request-specific headers based on method
            if (validMethod === HTTP_METHODS.GET) {
                requestConfig.headers[HTTP_HEADERS.ACCEPT] = 'text/plain, */*';
            }
            
            // Set timestamp and correlation ID for tracking
            const requestId = options.requestId || `${TEST_REQUEST_ID_PREFIX}-valid-${++this.fixtureCount}`;
            requestConfig.requestId = requestId;
            requestConfig.timestamp = options.timestamp || Date.now();
            
            // Create mock request using embedded MockHttpRequest class
            const mockRequest = new MockHttpRequest(requestConfig);
            
            // Add test-specific metadata for validation and tracking
            mockRequest.testMetadata = {
                type: 'valid_request',
                endpoint: validEndpoint,
                method: validMethod,
                generatedAt: new Date().toISOString(),
                generator: 'RequestFixtureGenerator',
                testCategory: 'success_scenario'
            };
            
            // Return complete valid request fixture ready for testing
            return mockRequest;
            
        } catch (error) {
            // Return minimal valid request if generation fails
            return new MockHttpRequest({
                method: HTTP_METHODS.GET,
                url: HELLO_ENDPOINT_PATH,
                headers: COMMON_TEST_HEADERS
            });
        }
    }
    
    /**
     * Generates HTTP request fixtures for specific error conditions and validation failures
     * using embedded mock functionality for comprehensive error scenario testing.
     * 
     * @param {string} errorType - Type of error to simulate (method, path, malformed, security)
     * @param {Object} errorConfig - Configuration for error simulation
     * @returns {Object} HTTP request object configured with specified error condition
     */
    generateInvalidRequest(errorType, errorConfig = {}) {
        try {
            let requestConfig = {
                headers: { ...this.defaultHeaders },
                httpVersion: DEFAULT_HTTP_VERSION,
                remoteAddress: '127.0.0.1'
            };
            
            // Determine error type and create appropriate invalid request structure
            switch (errorType.toLowerCase()) {
                case 'invalid_method':
                    requestConfig.method = errorConfig.method || HTTP_METHODS.POST;
                    requestConfig.url = HELLO_ENDPOINT_PATH;
                    break;
                    
                case 'invalid_path':
                    requestConfig.method = HTTP_METHODS.GET;
                    requestConfig.url = errorConfig.path || '/nonexistent';
                    break;
                    
                case 'malformed_headers':
                    requestConfig.method = HTTP_METHODS.GET;
                    requestConfig.url = HELLO_ENDPOINT_PATH;
                    requestConfig.headers = { 'invalid-header-format': null };
                    break;
                    
                case 'malformed_url':
                    requestConfig.method = HTTP_METHODS.GET;
                    requestConfig.url = errorConfig.url || '//malformed//path';
                    break;
                    
                default:
                    requestConfig.method = 'INVALID_METHOD';
                    requestConfig.url = HELLO_ENDPOINT_PATH;
            }
            
            // Set error metadata for test identification
            const requestId = `${TEST_REQUEST_ID_PREFIX}-error-${errorType}-${++this.fixtureCount}`;
            requestConfig.requestId = requestId;
            requestConfig.timestamp = Date.now();
            
            // Create mock request using embedded MockHttpRequest with errors
            const mockRequest = new MockHttpRequest(requestConfig);
            
            // Include expected error information for validation testing
            mockRequest.testMetadata = {
                type: 'invalid_request',
                errorType: errorType,
                expectedError: this._getExpectedError(errorType),
                generatedAt: new Date().toISOString(),
                generator: 'RequestFixtureGenerator',
                testCategory: 'error_scenario'
            };
            
            // Return invalid request fixture for error scenario testing
            return mockRequest;
            
        } catch (error) {
            // Return basic invalid request if generation fails
            return new MockHttpRequest({
                method: 'INVALID',
                url: '/error',
                headers: {}
            });
        }
    }
    
    /**
     * Generates multiple request fixtures in bulk for performance and load testing scenarios
     * using embedded mock functionality with variety and realistic patterns.
     * 
     * @param {number} count - Number of request fixtures to generate
     * @param {Object} requestType - Type of requests to generate in bulk
     * @param {Object} options - Options for bulk generation
     * @returns {Array} Array of HTTP request fixtures for bulk testing scenarios
     */
    generateBulkRequests(count = 10, requestType = { type: 'valid' }, options = {}) {
        try {
            // Validate count parameter for reasonable bulk generation limits
            const safeCount = Math.min(Math.max(count, 1), 1000); // Limit between 1 and 1000
            const requests = [];
            
            // Create base request template based on requestType
            const baseTemplate = {
                method: requestType.method || HTTP_METHODS.GET,
                url: requestType.url || HELLO_ENDPOINT_PATH,
                headers: {
                    ...this.defaultHeaders,
                    ...requestType.headers
                }
            };
            
            // Generate specified number of request fixtures using embedded mock
            for (let i = 0; i < safeCount; i++) {
                const requestConfig = {
                    ...baseTemplate,
                    requestId: `${TEST_REQUEST_ID_PREFIX}-bulk-${i + 1}-${Date.now()}`,
                    timestamp: Date.now() + i, // Slight timestamp variation
                    remotePort: 10000 + i // Unique port for each request
                };
                
                // Add unique identifiers and timestamps to each fixture
                const mockRequest = new MockHttpRequest(requestConfig);
                mockRequest.testMetadata = {
                    type: 'bulk_request',
                    bulkIndex: i + 1,
                    totalCount: safeCount,
                    requestType: requestType.type || 'valid',
                    generatedAt: new Date().toISOString(),
                    generator: 'RequestFixtureGenerator',
                    testCategory: 'performance_testing'
                };
                
                requests.push(mockRequest);
            }
            
            // Return array of bulk request fixtures for load testing
            return requests;
            
        } catch (error) {
            // Return single valid request if bulk generation fails
            return [this.generateValidRequest()];
        }
    }
    
    /**
     * Gets expected error information for invalid request types
     * @private
     */
    _getExpectedError(errorType) {
        const errorMap = {
            'invalid_method': { status: 405, message: 'Method Not Allowed' },
            'invalid_path': { status: 404, message: 'Not Found' },
            'malformed_headers': { status: 400, message: 'Bad Request' },
            'malformed_url': { status: 400, message: 'Bad Request' },
            'security_threat': { status: 400, message: 'Bad Request' }
        };
        
        return errorMap[errorType] || { status: 400, message: 'Bad Request' };
    }
}

// ============================================================================
// FACTORY FUNCTIONS FOR REQUEST CREATION
// ============================================================================

/**
 * Creates a mock HTTP request object that mimics Node.js IncomingMessage structure for
 * testing purposes. Localizes mock request functionality to eliminate external dependencies
 * while maintaining realistic request object structure.
 * 
 * @param {Object} requestOptions - Configuration options for mock request creation
 * @param {string} [requestOptions.method] - HTTP method for the request
 * @param {string} [requestOptions.url] - Request URL path
 * @param {Object} [requestOptions.headers] - HTTP headers object
 * @param {string} [requestOptions.httpVersion] - HTTP protocol version
 * @returns {Object} Mock HTTP request object with Node.js IncomingMessage-compatible structure
 */
function createMockHttpRequest(requestOptions = {}) {
    try {
        // Extract method, url, headers, and httpVersion from requestOptions
        const {
            method = HTTP_METHODS.GET,
            url = '/',
            headers = {},
            httpVersion = DEFAULT_HTTP_VERSION,
            ...additionalOptions
        } = requestOptions;
        
        // Set default values for missing properties using constants
        const config = {
            method,
            url,
            headers: {
                ...COMMON_TEST_HEADERS,
                ...headers
            },
            httpVersion,
            ...additionalOptions
        };
        
        // Add Node.js IncomingMessage properties like socket and connection
        config.timestamp = Date.now();
        config.requestId = `${TEST_REQUEST_ID_PREFIX}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create mock request object with all required properties
        const mockRequest = new MockHttpRequest(config);
        
        // Return complete mock HTTP request object
        return mockRequest;
        
    } catch (error) {
        // Return minimal mock request if creation fails
        return new MockHttpRequest({
            method: HTTP_METHODS.GET,
            url: '/',
            headers: COMMON_TEST_HEADERS
        });
    }
}

/**
 * Creates a valid HTTP GET request object for the /hello endpoint with proper headers
 * and Node.js IncomingMessage structure using embedded mock functionality.
 * 
 * @param {Object} options - Options for hello request creation
 * @param {Object} [options.headers] - Additional headers to include
 * @param {string} [options.userAgent] - Custom user agent string
 * @param {string} [options.host] - Custom host header value
 * @returns {Object} Complete HTTP request object formatted for hello endpoint success testing
 */
function createValidHelloRequest(options = {}) {
    try {
        // Set HTTP method to GET using HTTP_METHODS constant for hello endpoint
        const method = HTTP_METHODS.GET;
        
        // Set URL path to '/hello' using HELLO_ENDPOINT_PATH constant
        const url = HELLO_ENDPOINT_PATH;
        
        // Create standard HTTP headers with host, user-agent, and accept headers
        const headers = {
            [HTTP_HEADERS.HOST]: options.host || DEFAULT_HOST,
            [HTTP_HEADERS.USER_AGENT]: options.userAgent || TEST_USER_AGENT,
            [HTTP_HEADERS.ACCEPT]: 'text/plain, */*',
            [HTTP_HEADERS.CONNECTION]: 'keep-alive',
            ...options.headers
        };
        
        // Set HTTP version to '1.1' for protocol compliance
        const httpVersion = options.httpVersion || DEFAULT_HTTP_VERSION;
        
        // Create mock request object using embedded createMockHttpRequest function
        const requestConfig = {
            method,
            url,
            headers,
            httpVersion,
            remoteAddress: options.remoteAddress || '127.0.0.1',
            timestamp: options.timestamp || Date.now()
        };
        
        const mockRequest = createMockHttpRequest(requestConfig);
        
        // Add request metadata including timestamp and correlation ID
        mockRequest.testMetadata = {
            type: 'valid_hello_request',
            endpoint: HELLO_ENDPOINT_PATH,
            method: HTTP_METHODS.GET,
            expectedStatus: 200,
            expectedResponse: 'Hello world',
            generatedAt: new Date().toISOString(),
            testCategory: 'hello_endpoint_success'
        };
        
        // Return complete request object ready for hello endpoint testing
        return mockRequest;
        
    } catch (error) {
        // Return basic hello request if creation fails
        return createMockHttpRequest({
            method: HTTP_METHODS.GET,
            url: HELLO_ENDPOINT_PATH,
            headers: COMMON_TEST_HEADERS
        });
    }
}

/**
 * Creates HTTP request objects with invalid methods for testing method validation
 * and 405 error responses using embedded mock functionality.
 * 
 * @param {string} method - Invalid HTTP method to test
 * @param {Object} options - Additional options for invalid method request creation
 * @returns {Object} HTTP request object with invalid method for method validation testing
 */
function createInvalidMethodRequest(method = HTTP_METHODS.POST, options = {}) {
    try {
        // Set HTTP method to provided invalid method parameter
        const invalidMethod = method.toString().toUpperCase();
        
        // Set URL path to '/hello' to test method restrictions on valid endpoint
        const url = HELLO_ENDPOINT_PATH;
        
        // Create standard headers structure for request completeness
        const headers = {
            ...COMMON_TEST_HEADERS,
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.APPLICATION_JSON,
            ...options.headers
        };
        
        // Create mock request using embedded createMockHttpRequest function
        const requestConfig = {
            method: invalidMethod,
            url,
            headers,
            httpVersion: options.httpVersion || DEFAULT_HTTP_VERSION,
            remoteAddress: options.remoteAddress || '127.0.0.1'
        };
        
        const mockRequest = createMockHttpRequest(requestConfig);
        
        // Add request validation metadata for error testing context
        mockRequest.testMetadata = {
            type: 'invalid_method_request',
            invalidMethod: invalidMethod,
            endpoint: HELLO_ENDPOINT_PATH,
            expectedStatus: 405,
            expectedError: 'Method Not Allowed',
            generatedAt: new Date().toISOString(),
            testCategory: 'method_validation_error'
        };
        
        // Return invalid method request object for error scenario testing
        return mockRequest;
        
    } catch (error) {
        // Return basic invalid method request if creation fails
        return createMockHttpRequest({
            method: HTTP_METHODS.POST,
            url: HELLO_ENDPOINT_PATH,
            headers: COMMON_TEST_HEADERS
        });
    }
}

/**
 * Creates HTTP request objects with invalid URL paths for testing route matching
 * and 404 error responses using embedded mock functionality.
 * 
 * @param {string} path - Invalid path to test
 * @param {Object} options - Additional options for invalid path request creation
 * @returns {Object} HTTP request object with invalid path for route validation testing
 */
function createInvalidPathRequest(path = '/nonexistent', options = {}) {
    try {
        // Set HTTP method to valid GET method for isolated path testing
        const method = HTTP_METHODS.GET;
        
        // Set URL path to provided invalid path parameter
        const invalidPath = path.toString();
        
        // Create standard headers structure with proper format
        const headers = {
            ...COMMON_TEST_HEADERS,
            ...options.headers
        };
        
        // Create mock request using embedded createMockHttpRequest function
        const requestConfig = {
            method,
            url: invalidPath,
            headers,
            httpVersion: options.httpVersion || DEFAULT_HTTP_VERSION,
            remoteAddress: options.remoteAddress || '127.0.0.1'
        };
        
        const mockRequest = createMockHttpRequest(requestConfig);
        
        // Add path validation metadata for route testing context
        mockRequest.testMetadata = {
            type: 'invalid_path_request',
            invalidPath: invalidPath,
            method: method,
            expectedStatus: 404,
            expectedError: 'Not Found',
            generatedAt: new Date().toISOString(),
            testCategory: 'route_validation_error'
        };
        
        // Return invalid path request object for route error testing
        return mockRequest;
        
    } catch (error) {
        // Return basic invalid path request if creation fails
        return createMockHttpRequest({
            method: HTTP_METHODS.GET,
            url: '/error',
            headers: COMMON_TEST_HEADERS
        });
    }
}

/**
 * Creates malformed HTTP request objects for testing request parsing and validation
 * error handling using embedded mock functionality.
 * 
 * @param {string} malformationType - Type of malformation to create
 * @param {Object} options - Additional options for malformed request creation
 * @returns {Object} Malformed HTTP request object for parsing error testing
 */
function createMalformedRequest(malformationType = 'missing_headers', options = {}) {
    try {
        let requestConfig = {
            method: HTTP_METHODS.GET,
            url: HELLO_ENDPOINT_PATH,
            httpVersion: DEFAULT_HTTP_VERSION,
            remoteAddress: '127.0.0.1'
        };
        
        // Determine malformation type from malformationType parameter
        switch (malformationType.toLowerCase()) {
            case 'missing_headers':
                requestConfig.headers = {}; // No headers
                break;
                
            case 'invalid_headers':
                requestConfig.headers = {
                    'invalid\nheader': 'value',
                    'header': 'invalid\r\nvalue'
                };
                break;
                
            case 'malformed_url':
                requestConfig.url = '//invalid//path//structure';
                requestConfig.headers = COMMON_TEST_HEADERS;
                break;
                
            case 'invalid_http_version':
                requestConfig.httpVersion = '2.0'; // Invalid for tutorial app
                requestConfig.headers = COMMON_TEST_HEADERS;
                break;
                
            case 'oversized_headers':
                requestConfig.headers = {
                    ...COMMON_TEST_HEADERS,
                    'x-large-header': 'a'.repeat(MAX_HEADER_SIZE)
                };
                break;
                
            default:
                requestConfig.headers = { 'malformed': null };
        }
        
        // Apply specific malformation based on type with intentional structural issues
        requestConfig.requestId = `${TEST_REQUEST_ID_PREFIX}-malformed-${malformationType}-${++this.fixtureCount}`;
        requestConfig.timestamp = Date.now();
        
        // Create request object with intentional structural issues using embedded mock
        const mockRequest = new MockHttpRequest(requestConfig);
        
        // Add malformation metadata for error testing identification
        mockRequest.testMetadata = {
            type: 'malformed_request',
            malformationType: malformationType,
            expectedStatus: 400,
            expectedError: 'Bad Request',
            generatedAt: new Date().toISOString(),
            testCategory: 'parsing_error'
        };
        
        // Return malformed request object for error handling testing
        return mockRequest;
        
    } catch (error) {
        // Return basic malformed request if creation fails
        return createMockHttpRequest({
            method: HTTP_METHODS.GET,
            url: HELLO_ENDPOINT_PATH,
            headers: {}
        });
    }
}

/**
 * Creates HTTP request objects with security threat patterns for testing security
 * validation and injection prevention using embedded mock functionality.
 * 
 * @param {string} threatType - Type of security threat to simulate
 * @param {Object} securityOptions - Security-specific options for threat simulation
 * @returns {Object} HTTP request object with security threat patterns for security testing
 */
function createSecurityTestRequest(threatType = 'path_traversal', securityOptions = {}) {
    try {
        let requestConfig = {
            method: HTTP_METHODS.GET,
            httpVersion: DEFAULT_HTTP_VERSION,
            remoteAddress: securityOptions.remoteAddress || '192.168.1.100', // Different IP for security tests
            headers: { ...COMMON_TEST_HEADERS }
        };
        
        // Determine threat type from threatType parameter (injection, traversal, etc.)
        switch (threatType.toLowerCase()) {
            case 'path_traversal':
                requestConfig.url = '/hello/../../etc/passwd';
                break;
                
            case 'header_injection':
                requestConfig.headers['x-injected-header'] = 'value\r\nInjected: malicious';
                requestConfig.url = HELLO_ENDPOINT_PATH;
                break;
                
            case 'url_injection':
                requestConfig.url = '/hello?param=<script>alert("xss")</script>';
                break;
                
            case 'oversized_request':
                requestConfig.url = HELLO_ENDPOINT_PATH;
                requestConfig.headers['x-large-attack'] = 'A'.repeat(MAX_HEADER_SIZE * 2);
                break;
                
            case 'null_byte_injection':
                requestConfig.url = '/hello\x00/admin';
                break;
                
            default:
                requestConfig.url = '/hello/../admin';
        }
        
        // Apply security threat patterns to appropriate request components
        requestConfig.requestId = `${TEST_REQUEST_ID_PREFIX}-security-${threatType}-${++this.fixtureCount}`;
        requestConfig.timestamp = Date.now();
        
        // Create request object with malicious patterns using embedded mock functionality
        const mockRequest = new MockHttpRequest(requestConfig);
        
        // Add security testing metadata and threat classification
        mockRequest.testMetadata = {
            type: 'security_test_request',
            threatType: threatType,
            securityLevel: 'HIGH',
            expectedStatus: 400,
            expectedAction: 'BLOCK',
            generatedAt: new Date().toISOString(),
            testCategory: 'security_validation'
        };
        
        // Return security test request object for threat detection testing
        return mockRequest;
        
    } catch (error) {
        // Return basic security test request if creation fails
        return createMockHttpRequest({
            method: HTTP_METHODS.GET,
            url: '/hello/../test',
            headers: COMMON_TEST_HEADERS
        });
    }
}

/**
 * Generates a complete suite of request test data covering all request scenarios
 * and edge cases for comprehensive testing using embedded mock functionality.
 * 
 * @param {Object} suiteOptions - Options for test suite generation
 * @param {boolean} [suiteOptions.includeEdgeCases=true] - Include edge case fixtures
 * @param {boolean} [suiteOptions.includeSecurityTests=true] - Include security test fixtures
 * @param {number} [suiteOptions.bulkRequestCount=5] - Number of bulk requests to generate
 * @returns {Object} Complete test suite with categorized request fixtures for comprehensive testing
 */
function generateRequestTestSuite(suiteOptions = {}) {
    try {
        const generator = new RequestFixtureGenerator();
        const includeEdgeCases = suiteOptions.includeEdgeCases !== false;
        const includeSecurityTests = suiteOptions.includeSecurityTests !== false;
        const bulkCount = suiteOptions.bulkRequestCount || 5;
        
        const testSuite = {
            metadata: {
                generatedAt: new Date().toISOString(),
                generator: 'generateRequestTestSuite',
                version: '1.0.0',
                totalFixtures: 0
            },
            categories: {}
        };
        
        // Generate valid hello endpoint request fixtures with various configurations
        testSuite.categories.valid = {
            basicGetRequest: createValidHelloRequest(),
            getRequestWithHeaders: createValidHelloRequest({
                headers: {
                    [HTTP_HEADERS.ACCEPT]: 'text/plain',
                    [HTTP_HEADERS.ACCEPT_ENCODING]: 'gzip, deflate'
                }
            }),
            getRequestWithUserAgent: createValidHelloRequest({
                userAgent: 'Mozilla/5.0 (Test Browser) AppleWebKit/537.36'
            })
        };
        
        // Create invalid method request fixtures for all unsupported methods
        testSuite.categories.invalidMethods = {
            postRequest: createInvalidMethodRequest(HTTP_METHODS.POST),
            putRequest: createInvalidMethodRequest(HTTP_METHODS.PUT),
            deleteRequest: createInvalidMethodRequest(HTTP_METHODS.DELETE),
            invalidMethodRequest: createInvalidMethodRequest('PATCH')
        };
        
        // Generate invalid path request fixtures for route error testing
        testSuite.categories.invalidPaths = {
            rootPath: createInvalidPathRequest('/'),
            nonExistentPath: createInvalidPathRequest('/api/users'),
            malformedPath: createInvalidPathRequest('//hello//world')
        };
        
        // Create malformed request fixtures for parsing error testing
        testSuite.categories.malformed = {
            missingHeaders: createMalformedRequest('missing_headers'),
            invalidHeaders: createMalformedRequest('invalid_headers'),
            malformedUrl: createMalformedRequest('malformed_url'),
            invalidHttpVersion: createMalformedRequest('invalid_http_version')
        };
        
        // Generate security test request fixtures for threat detection testing
        if (includeSecurityTests) {
            testSuite.categories.security = {
                pathTraversalRequest: createSecurityTestRequest('path_traversal'),
                headerInjectionRequest: createSecurityTestRequest('header_injection'),
                urlInjectionRequest: createSecurityTestRequest('url_injection'),
                oversizedRequest: createSecurityTestRequest('oversized_request')
            };
        }
        
        // Create edge case request fixtures for boundary condition testing
        if (includeEdgeCases) {
            testSuite.categories.edgeCases = {
                emptyHeadersRequest: createMockHttpRequest({
                    method: HTTP_METHODS.GET,
                    url: HELLO_ENDPOINT_PATH,
                    headers: {}
                }),
                maxHeadersRequest: createMockHttpRequest({
                    method: HTTP_METHODS.GET,
                    url: HELLO_ENDPOINT_PATH,
                    headers: {
                        ...COMMON_TEST_HEADERS,
                        'x-test-header-1': 'value1',
                        'x-test-header-2': 'value2',
                        'x-test-header-3': 'value3'
                    }
                }),
                unicodePathRequest: createMockHttpRequest({
                    method: HTTP_METHODS.GET,
                    url: '/hello/🌍',
                    headers: COMMON_TEST_HEADERS
                }),
                caseVariationRequest: createMockHttpRequest({
                    method: HTTP_METHODS.GET,
                    url: '/HELLO',
                    headers: COMMON_TEST_HEADERS
                })
            };
        }
        
        // Generate bulk requests for performance testing
        testSuite.categories.bulk = generator.generateBulkRequests(bulkCount, {
            type: 'valid',
            method: HTTP_METHODS.GET,
            url: HELLO_ENDPOINT_PATH
        });
        
        // Count total fixtures for metadata
        testSuite.metadata.totalFixtures = Object.keys(testSuite.categories).reduce((total, category) => {
            const categoryData = testSuite.categories[category];
            return total + (Array.isArray(categoryData) ? categoryData.length : Object.keys(categoryData).length);
        }, 0);
        
        // Return comprehensive test suite ready for testing frameworks
        return testSuite;
        
    } catch (error) {
        // Return minimal test suite if generation fails
        return {
            metadata: {
                generatedAt: new Date().toISOString(),
                error: 'Test suite generation failed',
                fallback: true
            },
            categories: {
                valid: {
                    basicGetRequest: createValidHelloRequest()
                }
            }
        };
    }
}

// ============================================================================
// PRE-DEFINED REQUEST FIXTURE COLLECTIONS
// ============================================================================

/**
 * Collection of valid HTTP request fixtures for hello endpoint success testing.
 * These fixtures provide standardized valid request objects for testing successful
 * hello endpoint responses and proper HTTP request handling.
 * 
 * @type {Object}
 * @readonly
 */
const VALID_HELLO_REQUESTS = {
    /**
     * Basic GET request to /hello endpoint with minimal headers
     * @type {Object}
     */
    basicGetRequest: createValidHelloRequest(),
    
    /**
     * GET request with comprehensive headers for header processing testing
     * @type {Object}
     */
    getRequestWithHeaders: createValidHelloRequest({
        headers: {
            [HTTP_HEADERS.ACCEPT]: 'text/plain',
            [HTTP_HEADERS.ACCEPT_LANGUAGE]: 'en-US,en;q=0.9',
            [HTTP_HEADERS.ACCEPT_ENCODING]: 'gzip, deflate, br',
            [HTTP_HEADERS.CACHE_CONTROL]: 'no-cache'
        }
    }),
    
    /**
     * GET request with custom user agent for user agent processing testing
     * @type {Object}
     */
    getRequestWithUserAgent: createValidHelloRequest({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
};

/**
 * Collection of invalid method request fixtures for testing method validation and 405 responses.
 * These fixtures provide various invalid HTTP method scenarios for comprehensive method
 * validation testing and proper error response generation.
 * 
 * @type {Object}
 * @readonly
 */
const INVALID_METHOD_REQUESTS = {
    /**
     * POST request to /hello endpoint for method validation testing
     * @type {Object}
     */
    postRequest: createInvalidMethodRequest(HTTP_METHODS.POST),
    
    /**
     * PUT request to /hello endpoint for method validation testing
     * @type {Object}
     */
    putRequest: createInvalidMethodRequest(HTTP_METHODS.PUT, {
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.APPLICATION_JSON,
            [HTTP_HEADERS.CONTENT_LENGTH]: '20'
        }
    }),
    
    /**
     * DELETE request to /hello endpoint for method validation testing
     * @type {Object}
     */
    deleteRequest: createInvalidMethodRequest(HTTP_METHODS.DELETE),
    
    /**
     * Completely invalid HTTP method for robust method validation testing
     * @type {Object}
     */
    invalidMethodRequest: createInvalidMethodRequest('INVALID_METHOD')
};

/**
 * Collection of invalid path request fixtures for testing route validation and 404 responses.
 * These fixtures provide various invalid path scenarios for comprehensive route matching
 * testing and proper 404 error response generation.
 * 
 * @type {Object}
 * @readonly
 */
const INVALID_PATH_REQUESTS = {
    /**
     * Request to root path for root path handling testing
     * @type {Object}
     */
    rootPath: createInvalidPathRequest('/'),
    
    /**
     * Request to non-existent API path for route validation testing
     * @type {Object}
     */
    nonExistentPath: createInvalidPathRequest('/api/users'),
    
    /**
     * Request with malformed path structure for path parsing testing
     * @type {Object}
     */
    malformedPath: createInvalidPathRequest('//hello//world//malformed')
};

/**
 * Collection of malformed request fixtures for testing request parsing and validation
 * error handling. These fixtures provide various malformed request scenarios for
 * comprehensive request parsing error testing.
 * 
 * @type {Object}
 * @readonly
 */
const MALFORMED_REQUESTS = {
    /**
     * Request with missing essential headers for header validation testing
     * @type {Object}
     */
    missingHeaders: createMalformedRequest('missing_headers'),
    
    /**
     * Request with invalid header format for header parsing testing
     * @type {Object}
     */
    invalidHeaders: createMalformedRequest('invalid_headers'),
    
    /**
     * Request with malformed URL structure for URL parsing testing
     * @type {Object}
     */
    malformedUrl: createMalformedRequest('malformed_url'),
    
    /**
     * Request with invalid HTTP version for protocol validation testing
     * @type {Object}
     */
    invalidHttpVersion: createMalformedRequest('invalid_http_version')
};

/**
 * Collection of security test request fixtures for testing security validation
 * and threat detection. These fixtures simulate various security threats for
 * comprehensive security testing and validation.
 * 
 * @type {Object}
 * @readonly
 */
const SECURITY_TEST_REQUESTS = {
    /**
     * Path traversal attack request for directory traversal protection testing
     * @type {Object}
     */
    pathTraversalRequest: createSecurityTestRequest('path_traversal'),
    
    /**
     * Injection attack request for input validation and sanitization testing
     * @type {Object}
     */
    injectionRequest: createSecurityTestRequest('url_injection'),
    
    /**
     * Header injection attack for header security validation testing
     * @type {Object}
     */
    headerInjectionRequest: createSecurityTestRequest('header_injection'),
    
    /**
     * Oversized request for resource exhaustion protection testing
     * @type {Object}
     */
    oversizedRequest: createSecurityTestRequest('oversized_request')
};

/**
 * Collection of edge case request fixtures for boundary and stress testing.
 * These fixtures provide various edge case scenarios for comprehensive boundary
 * condition testing and application robustness validation.
 * 
 * @type {Object}
 * @readonly
 */
const EDGE_CASE_REQUESTS = {
    /**
     * Request with completely empty headers for minimal request testing
     * @type {Object}
     */
    emptyHeadersRequest: createMockHttpRequest({
        method: HTTP_METHODS.GET,
        url: HELLO_ENDPOINT_PATH,
        headers: {}
    }),
    
    /**
     * Request with maximum number of headers for boundary testing
     * @type {Object}
     */
    maxHeadersRequest: createMockHttpRequest({
        method: HTTP_METHODS.GET,
        url: HELLO_ENDPOINT_PATH,
        headers: {
            ...COMMON_TEST_HEADERS,
            'x-custom-1': 'value1',
            'x-custom-2': 'value2',
            'x-custom-3': 'value3',
            'x-custom-4': 'value4',
            'x-custom-5': 'value5'
        }
    }),
    
    /**
     * Request with Unicode characters in path for internationalization testing
     * @type {Object}
     */
    unicodePathRequest: createMockHttpRequest({
        method: HTTP_METHODS.GET,
        url: '/hello/世界',
        headers: COMMON_TEST_HEADERS
    }),
    
    /**
     * Request with case variation in path for case sensitivity testing
     * @type {Object}
     */
    caseVariationRequest: createMockHttpRequest({
        method: HTTP_METHODS.GET,
        url: '/HELLO',
        headers: COMMON_TEST_HEADERS
    })
};

/**
 * Complete collection of all request fixtures organized by category for comprehensive
 * testing. This object provides centralized access to all test fixture categories
 * for easy integration with testing frameworks and test suites.
 * 
 * @type {Object}
 * @readonly
 */
const ALL_REQUEST_FIXTURES = {
    /**
     * Valid request fixtures for success scenario testing
     * @type {Object}
     */
    valid: VALID_HELLO_REQUESTS,
    
    /**
     * Invalid method request fixtures for method validation testing
     * @type {Object}
     */
    invalidMethods: INVALID_METHOD_REQUESTS,
    
    /**
     * Invalid path request fixtures for route validation testing
     * @type {Object}
     */
    invalidPaths: INVALID_PATH_REQUESTS,
    
    /**
     * Malformed request fixtures for parsing error testing
     * @type {Object}
     */
    malformed: MALFORMED_REQUESTS,
    
    /**
     * Security test request fixtures for security validation testing
     * @type {Object}
     */
    security: SECURITY_TEST_REQUESTS,
    
    /**
     * Edge case request fixtures for boundary condition testing
     * @type {Object}
     */
    edgeCases: EDGE_CASE_REQUESTS,
    
    /**
     * Metadata about the complete fixture collection
     * @type {Object}
     */
    metadata: {
        totalCategories: 6,
        generatedAt: new Date().toISOString(),
        description: 'Complete collection of HTTP request test fixtures for Node.js tutorial application',
        usage: 'Comprehensive testing of request processing, endpoint validation, and error handling'
    }
};

// ============================================================================
// SPECIALIZED REQUEST FIXTURE GENERATORS
// ============================================================================

/**
 * Creates request fixtures for specific test configurations using predefined test configs
 * and embedded mock functionality for integration with test framework patterns.
 * 
 * @param {string} configType - Type of test configuration to use
 * @param {Object} options - Additional options for fixture creation
 * @returns {Object} Request fixture configured for specific test scenario
 */
function createConfiguredRequest(configType = 'test', options = {}) {
    try {
        // Get test configuration based on configType
        const testConfig = VALID_TEST_CONFIGS[configType] || VALID_TEST_CONFIGS.test;
        
        // Create request configuration merging test config with options
        const requestConfig = {
            method: HTTP_METHODS.GET,
            url: HELLO_ENDPOINT_PATH,
            headers: {
                ...COMMON_TEST_HEADERS,
                ...testConfig.headers,
                ...options.headers
            },
            httpVersion: testConfig.httpVersion || DEFAULT_HTTP_VERSION,
            ...options
        };
        
        // Create mock request with test configuration
        const mockRequest = createMockHttpRequest(requestConfig);
        
        // Add test configuration metadata
        mockRequest.testMetadata = {
            type: 'configured_request',
            configType: configType,
            testConfig: testConfig.name || configType,
            generatedAt: new Date().toISOString(),
            testCategory: 'configuration_testing'
        };
        
        return mockRequest;
        
    } catch (error) {
        // Return basic configured request if creation fails
        return createValidHelloRequest(options);
    }
}

/**
 * Creates request fixtures with specific HTTP version testing for protocol compatibility
 * validation and version-specific behavior testing.
 * 
 * @param {string} httpVersion - HTTP version to test
 * @param {Object} options - Additional options for version-specific testing
 * @returns {Object} Request fixture with specified HTTP version for protocol testing
 */
function createVersionSpecificRequest(httpVersion = '1.1', options = {}) {
    try {
        // Create request with specific HTTP version
        const requestConfig = {
            method: options.method || HTTP_METHODS.GET,
            url: options.url || HELLO_ENDPOINT_PATH,
            httpVersion: httpVersion,
            headers: {
                ...COMMON_TEST_HEADERS,
                ...options.headers
            },
            ...options
        };
        
        // Create mock request with version-specific configuration
        const mockRequest = createMockHttpRequest(requestConfig);
        
        // Add version testing metadata
        mockRequest.testMetadata = {
            type: 'version_specific_request',
            httpVersion: httpVersion,
            testPurpose: 'protocol_compatibility',
            generatedAt: new Date().toISOString(),
            testCategory: 'protocol_testing'
        };
        
        return mockRequest;
        
    } catch (error) {
        // Return basic versioned request if creation fails
        return createMockHttpRequest({
            method: HTTP_METHODS.GET,
            url: HELLO_ENDPOINT_PATH,
            httpVersion: httpVersion,
            headers: COMMON_TEST_HEADERS
        });
    }
}

/**
 * Creates request fixtures with performance testing characteristics including timing
 * metadata and load testing patterns for performance validation.
 * 
 * @param {Object} performanceOptions - Performance testing configuration
 * @param {number} [performanceOptions.requestCount=1] - Number of performance test requests
 * @param {boolean} [performanceOptions.includeTimings=true] - Include timing metadata
 * @returns {Array|Object} Performance test request fixtures with timing metadata
 */
function createPerformanceTestRequests(performanceOptions = {}) {
    try {
        const requestCount = performanceOptions.requestCount || 1;
        const includeTimings = performanceOptions.includeTimings !== false;
        const requests = [];
        
        // Generate performance test requests with timing metadata
        for (let i = 0; i < requestCount; i++) {
            const requestConfig = {
                method: HTTP_METHODS.GET,
                url: HELLO_ENDPOINT_PATH,
                headers: {
                    ...COMMON_TEST_HEADERS,
                    'x-performance-test': `request-${i + 1}`,
                    'x-test-iteration': (i + 1).toString()
                },
                requestId: `${TEST_REQUEST_ID_PREFIX}-perf-${i + 1}-${Date.now()}`
            };
            
            const mockRequest = createMockHttpRequest(requestConfig);
            
            // Add performance testing metadata
            mockRequest.testMetadata = {
                type: 'performance_test_request',
                requestIndex: i + 1,
                totalRequests: requestCount,
                testStartTime: includeTimings ? Date.now() : null,
                performanceExpectations: {
                    maxResponseTime: 100, // milliseconds
                    maxMemoryUsage: 50,   // MB
                    targetThroughput: 1000 // requests per second
                },
                generatedAt: new Date().toISOString(),
                testCategory: 'performance_testing'
            };
            
            requests.push(mockRequest);
        }
        
        // Return single request or array based on count
        return requestCount === 1 ? requests[0] : requests;
        
    } catch (error) {
        // Return basic performance request if creation fails
        return createValidHelloRequest({
            headers: {
                ...COMMON_TEST_HEADERS,
                'x-performance-test': 'fallback'
            }
        });
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export pre-defined request fixture collections for immediate use in tests
export {
    VALID_HELLO_REQUESTS,
    INVALID_METHOD_REQUESTS,
    INVALID_PATH_REQUESTS,
    MALFORMED_REQUESTS,
    SECURITY_TEST_REQUESTS,
    EDGE_CASE_REQUESTS,
    ALL_REQUEST_FIXTURES
};

// Export factory functions for dynamic request fixture creation
export {
    createMockHttpRequest,
    createValidHelloRequest,
    createInvalidMethodRequest,
    createInvalidPathRequest,
    createMalformedRequest,
    createSecurityTestRequest,
    generateRequestTestSuite,
    createConfiguredRequest,
    createVersionSpecificRequest,
    createPerformanceTestRequests
};

// Export classes for advanced test fixture management and custom request creation
export {
    MockHttpRequest,
    RequestFixtureGenerator
};

// Export constants for test configuration and fixture customization
export {
    DEFAULT_REQUEST_TIMESTAMP,
    TEST_USER_AGENT,
    DEFAULT_HOST,
    HELLO_ENDPOINT_PATH,
    DEFAULT_HTTP_VERSION,
    TEST_REQUEST_ID_PREFIX,
    COMMON_TEST_HEADERS
};

/**
 * Export Summary and Usage Examples:
 * 
 * Pre-defined Request Fixture Collections:
 * - VALID_HELLO_REQUESTS: Ready-to-use valid request fixtures for success testing
 * - INVALID_METHOD_REQUESTS: Invalid method scenarios for 405 error testing
 * - INVALID_PATH_REQUESTS: Invalid path scenarios for 404 error testing
 * - MALFORMED_REQUESTS: Malformed request scenarios for parsing error testing
 * - SECURITY_TEST_REQUESTS: Security threat scenarios for security validation testing
 * - EDGE_CASE_REQUESTS: Edge case scenarios for boundary condition testing
 * - ALL_REQUEST_FIXTURES: Complete collection organized by category
 * 
 * Factory Functions:
 * - createMockHttpRequest(): Creates basic mock HTTP request objects
 * - createValidHelloRequest(): Creates valid hello endpoint request fixtures
 * - createInvalidMethodRequest(): Creates invalid method request fixtures
 * - createInvalidPathRequest(): Creates invalid path request fixtures
 * - createMalformedRequest(): Creates malformed request fixtures
 * - createSecurityTestRequest(): Creates security test request fixtures
 * - generateRequestTestSuite(): Creates comprehensive test suite with all scenarios
 * 
 * Classes:
 * - MockHttpRequest: Node.js IncomingMessage-compatible mock request class
 * - RequestFixtureGenerator: Advanced fixture generation with customizable options
 * 
 * Integration Examples:
 * 
 * // Using pre-defined fixtures in tests
 * import { VALID_HELLO_REQUESTS, INVALID_METHOD_REQUESTS } from './test/fixtures/request-data.js';
 * 
 * test('hello endpoint success', () => {
 *   const request = VALID_HELLO_REQUESTS.basicGetRequest;
 *   // Test hello endpoint with valid request
 * });
 * 
 * test('invalid method handling', () => {
 *   const request = INVALID_METHOD_REQUESTS.postRequest;
 *   // Test 405 response for POST method
 * });
 * 
 * // Using factory functions for dynamic fixtures
 * import { createValidHelloRequest, createSecurityTestRequest } from './test/fixtures/request-data.js';
 * 
 * test('custom valid request', () => {
 *   const request = createValidHelloRequest({
 *     headers: { 'x-custom': 'test-value' }
 *   });
 *   // Test with custom headers
 * });
 * 
 * // Using classes for advanced fixture management
 * import { RequestFixtureGenerator, MockHttpRequest } from './test/fixtures/request-data.js';
 * 
 * const generator = new RequestFixtureGenerator();
 * const bulkRequests = generator.generateBulkRequests(100, { type: 'valid' });
 * 
 * // Using complete test suite for comprehensive testing
 * import { generateRequestTestSuite } from './test/fixtures/request-data.js';
 * 
 * const testSuite = generateRequestTestSuite({
 *   includeEdgeCases: true,
 *   includeSecurityTests: true,
 *   bulkRequestCount: 10
 * });
 * 
 * Educational Value:
 * - Demonstrates comprehensive test fixture organization and management
 * - Shows proper mock object creation for Node.js HTTP compatibility
 * - Illustrates security-conscious test data creation and validation
 * - Provides examples of enterprise-grade testing patterns and practices
 * - Shows integration between test fixtures and application constants
 * - Demonstrates production-ready testing approaches with realistic HTTP structures
 * 
 * Testing Coverage:
 * - Unit testing: Individual component testing with isolated request fixtures
 * - Integration testing: End-to-end request-response cycle testing
 * - Security testing: Threat simulation and validation testing
 * - Performance testing: Load testing and stress testing with bulk requests
 * - Edge case testing: Boundary condition and robustness testing
 * - Error handling testing: Comprehensive error scenario validation
 */