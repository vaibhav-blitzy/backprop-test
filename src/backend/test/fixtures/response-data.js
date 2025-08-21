/**
 * Comprehensive Test Fixture Data Module for Node.js Tutorial Application HTTP Response Testing
 * 
 * Provides standardized mock HTTP response objects for comprehensive testing of the Node.js 
 * tutorial application. This module implements embedded mock HTTP response creation functionality 
 * to eliminate external dependencies while supporting controller testing, response handler testing, 
 * middleware testing, and validation testing with realistic HTTP response structures following 
 * Node.js ServerResponse patterns.
 * 
 * Key Features:
 * - Embedded mock HTTP response functionality eliminating circular dependencies
 * - Comprehensive test fixtures for valid hello endpoint responses and error scenarios
 * - Malformed response generation for validation testing and error boundary testing
 * - Security vulnerability response fixtures for security validation and injection prevention
 * - Edge case response data for boundary condition testing and stress testing
 * - Complete test suite generation for comprehensive testing framework integration
 * - Node.js ServerResponse-compatible structure for realistic testing environments
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive HTTP response testing patterns and mock object creation
 * - Shows test fixture organization and categorization for different testing scenarios
 * - Illustrates Node.js ServerResponse behavior emulation for testing without real servers
 * - Provides examples of security testing response generation and vulnerability detection
 * - Shows automated test data generation and fixture management best practices
 * - Demonstrates production-ready test fixture architecture and testing framework integration
 * 
 * Architecture Integration:
 * - Integrates with HTTP status code constants for proper status code testing
 * - Uses HTTP header constants for consistent header structure and validation
 * - Incorporates response message constants for standardized content generation
 * - Utilizes error message constants for consistent error response testing
 * - Leverages response type definitions for proper structure validation
 * - Uses test configuration objects for context-aware response generation
 * 
 * @fileoverview Comprehensive HTTP response test fixture data for Node.js tutorial testing
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import HTTP status code constants for creating response fixtures with proper status codes
import { 
    HTTP_STATUS_CODES,
    // Import specific status code categories for test fixture generation
    STATUS_MESSAGES,
    isValidStatusCode,
    getStatusCategory 
} from '../../utils/http-status.js'; // Node.js v22.x LTS compatible

// Import HTTP header name constants for creating response fixtures with proper header structures
import { 
    HTTP_HEADERS,
    CONTENT_TYPES,
    SECURITY_HEADERS,
    SERVER_IDENTIFICATION 
} from '../../constants/http-headers.js'; // Node.js v22.x LTS compatible

// Import response message constants for creating response fixtures with standardized content
import { 
    RESPONSE_MESSAGES,
    SUCCESS_MESSAGES,
    HELLO_ENDPOINT_MESSAGES 
} from '../../constants/response-messages.js'; // Node.js v22.x LTS compatible

// Import error message constants for creating error response fixtures with standardized error content
export { 
    ERROR_MESSAGES,
    HTTP_ERROR_MESSAGES,
    VALIDATION_ERROR_MESSAGES,
    SERVER_ERROR_MESSAGES 
} from '../../constants/error-messages.js'; // ES6 module - Node.js v22.x LTS compatible

// Import response type definitions for creating properly structured response fixtures
import { 
    RESPONSE_TYPES,
    VALIDATION_SCHEMAS,
    RESPONSE_TEMPLATES 
} from '../../types/response.types.js'; // Node.js v22.x LTS compatible

// Import valid test configuration objects for creating response fixtures with proper test context
import { 
    VALID_TEST_CONFIGS,
    TEST_SERVER_CONFIGS,
    generateTestId 
} from './test-config.js'; // Node.js v22.x LTS compatible

// Import Node.js built-in crypto module for generating unique response identifiers
import crypto from 'node:crypto'; // Node.js v22.x LTS - Built-in crypto module

// ============================================================================
// GLOBAL RESPONSE FIXTURE CONSTANTS
// ============================================================================

/**
 * Default timestamp for response fixtures using Date.now() for realistic timestamp generation.
 * Provides consistent timestamp baseline for response fixture creation while supporting
 * test scenario reproducibility and response correlation tracking.
 */
const DEFAULT_RESPONSE_TIMESTAMP = Date.now();

/**
 * Test server name identifier for response fixture Server header and identification purposes.
 * Provides clear identification of test server responses in test fixtures while maintaining
 * consistency with production server identification patterns.
 */
const TEST_SERVER_NAME = 'Node.js Tutorial Server';

/**
 * Default hello endpoint content for response fixtures matching expected endpoint behavior.
 * Standardizes hello endpoint response content across all test fixtures to ensure
 * consistency with actual hello endpoint implementation and testing expectations.
 */
const DEFAULT_HELLO_CONTENT = 'Hello world';

/**
 * Content length constant for hello endpoint responses providing exact byte count calculation.
 * Ensures accurate Content-Length header values for hello endpoint response fixtures
 * supporting proper HTTP protocol compliance and response validation testing.
 */
const HELLO_CONTENT_LENGTH = '11';

/**
 * Default correlation prefix for response fixture identification and tracking across test execution.
 * Provides consistent identification pattern for response fixtures enabling correlation
 * tracking and debugging across distributed test execution scenarios.
 */
const RESPONSE_FIXTURE_PREFIX = 'response-fixture-';

/**
 * Maximum response content size for malformed response testing and boundary condition validation.
 * Establishes limits for response content size testing while preventing memory exhaustion
 * during malformed response generation and stress testing scenarios.
 */
const MAX_RESPONSE_CONTENT_SIZE = 1024 * 1024; // 1MB limit for test responses

// ============================================================================
// EMBEDDED MOCK HTTP RESPONSE CLASS
// ============================================================================

/**
 * Embedded mock HTTP response class that mimics Node.js ServerResponse behavior for testing purposes.
 * Localizes mock functionality to eliminate circular dependencies while providing realistic response 
 * object structure and properties for comprehensive response testing scenarios. Implements Node.js 
 * ServerResponse-compatible methods and properties for authentic testing environment simulation.
 * 
 * This class provides a complete mock implementation of Node.js ServerResponse functionality
 * including write operations, header management, and response finalization while maintaining
 * compatibility with testing frameworks and response validation utilities.
 */
class MockHttpResponse {
    /**
     * Initializes mock HTTP response object with Node.js ServerResponse-compatible properties
     * and structure. Creates comprehensive mock response object with proper initialization,
     * state management, and method implementation for realistic testing scenarios.
     * 
     * @param {Object} responseConfig - Configuration object for mock response initialization
     * @param {number} [responseConfig.statusCode=200] - HTTP status code for mock response
     * @param {Object} [responseConfig.headers={}] - HTTP headers object for response
     * @param {string} [responseConfig.content=''] - Response body content
     * @param {string} [responseConfig.httpVersion='1.1'] - HTTP version for response
     * @param {boolean} [responseConfig.finished=false] - Response finished state
     * @param {boolean} [responseConfig.headersSent=false] - Headers sent state
     */
    constructor(responseConfig = {}) {
        try {
            // Set HTTP status code from config with default to 200 for success responses
            this.statusCode = responseConfig.statusCode || HTTP_STATUS_CODES.SUCCESS.OK;
            
            // Initialize headers object with lowercased keys for HTTP compliance
            this.headers = {};
            if (responseConfig.headers && typeof responseConfig.headers === 'object') {
                // Normalize header keys to lowercase for HTTP compliance
                Object.keys(responseConfig.headers).forEach(key => {
                    this.headers[key.toLowerCase()] = responseConfig.headers[key];
                });
            }
            
            // Set response content from config with default to empty string
            this.content = responseConfig.content || '';
            
            // Initialize response state properties for Node.js ServerResponse compatibility
            this.headersSent = responseConfig.headersSent || false;
            this.finished = responseConfig.finished || false;
            this.destroyed = false;
            this.writableEnded = false;
            this.writableFinished = false;
            
            // Set HTTP version and connection information
            this.httpVersion = responseConfig.httpVersion || '1.1';
            this.httpVersionMajor = parseInt(this.httpVersion.split('.')[0]);
            this.httpVersionMinor = parseInt(this.httpVersion.split('.')[1]);
            
            // Add Node.js ServerResponse properties and methods for compatibility
            this.connection = null; // Mock connection object
            this.socket = null; // Mock socket object
            this.req = null; // Associated request object
            
            // Set response metadata including timestamp and correlation ID for tracking
            this.metadata = {
                createdAt: new Date().toISOString(),
                timestamp: DEFAULT_RESPONSE_TIMESTAMP,
                correlationId: `${RESPONSE_FIXTURE_PREFIX}${crypto.randomBytes(8).toString('hex')}`,
                mockType: 'http-response',
                version: '1.0.0'
            };
            
            // Initialize internal state tracking for mock response operations
            this._chunks = []; // Store written chunks
            this._headerNames = {}; // Track header name mappings
            this._events = {}; // Event listener storage
            this._removedHeader = {}; // Track removed headers
            
            // Bind methods to maintain proper context
            this.writeHead = this.writeHead.bind(this);
            this.write = this.write.bind(this);
            this.end = this.end.bind(this);
            this.setHeader = this.setHeader.bind(this);
            this.getHeader = this.getHeader.bind(this);
            this.removeHeader = this.removeHeader.bind(this);
            
        } catch (error) {
            // Enhanced error context for mock response initialization failures
            const initError = new Error(`MockHttpResponse initialization failed: ${error.message}`);
            initError.originalError = error;
            initError.context = {
                responseConfig: JSON.stringify(responseConfig, null, 2),
                timestamp: new Date().toISOString()
            };
            throw initError;
        }
    }
    
    /**
     * Sets the response status code and headers in the mock response object mimicking
     * Node.js ServerResponse.writeHead() method behavior. Implements comprehensive
     * header management with validation, normalization, and state tracking.
     * 
     * @param {number} statusCode - HTTP status code for response
     * @param {Object} [headers={}] - HTTP headers object to set
     * @returns {MockHttpResponse} Returns this instance for method chaining
     * 
     * @throws {Error} Invalid status code or headers already sent errors
     */
    writeHead(statusCode, headers = {}) {
        try {
            // Validate status code is a valid HTTP status code using utility function
            if (!isValidStatusCode(statusCode)) {
                throw new Error(`Invalid HTTP status code: ${statusCode}`);
            }
            
            // Check if headers have already been sent to prevent duplicate operations
            if (this.headersSent) {
                throw new Error('Cannot set headers after they are sent');
            }
            
            // Set status code in response object for HTTP compliance
            this.statusCode = statusCode;
            
            // Merge provided headers with existing headers using proper HTTP conventions
            if (headers && typeof headers === 'object') {
                Object.keys(headers).forEach(key => {
                    // Normalize header keys to lowercase for HTTP compliance
                    const normalizedKey = key.toLowerCase();
                    this.headers[normalizedKey] = headers[key];
                    this._headerNames[normalizedKey] = key; // Track original case
                });
            }
            
            // Set headersSent flag to true to track header state
            this.headersSent = true;
            
            // Add automatic headers if not provided
            if (!this.headers[HTTP_HEADERS.DATE]) {
                this.headers[HTTP_HEADERS.DATE] = new Date().toUTCString();
            }
            
            if (!this.headers[HTTP_HEADERS.SERVER]) {
                this.headers[HTTP_HEADERS.SERVER] = TEST_SERVER_NAME;
            }
            
            // Return this instance for method chaining compatibility
            return this;
            
        } catch (error) {
            // Enhanced error context for writeHead operation failures
            const writeError = new Error(`writeHead operation failed: ${error.message}`);
            writeError.originalError = error;
            writeError.context = {
                statusCode,
                headers: JSON.stringify(headers, null, 2),
                currentState: {
                    headersSent: this.headersSent,
                    finished: this.finished
                },
                timestamp: new Date().toISOString()
            };
            throw writeError;
        }
    }
    
    /**
     * Writes content to the mock response body mimicking Node.js ServerResponse.write() method.
     * Implements proper content writing with state validation, chunk management, and
     * content length tracking for realistic response body handling.
     * 
     * @param {string|Buffer} chunk - Content chunk to write to response body
     * @param {string} [encoding='utf8'] - Character encoding for string content
     * @returns {boolean} True if write was successful, false if response finished
     */
    write(chunk, encoding = 'utf8') {
        try {
            // Validate response is not finished to prevent write operations on closed response
            if (this.finished) {
                return false; // Cannot write to finished response
            }
            
            // Validate chunk parameter for proper content handling
            if (chunk === null || chunk === undefined) {
                return true; // Allow empty writes for compatibility
            }
            
            // Convert chunk to string if necessary for consistent content handling
            let contentChunk = chunk;
            if (Buffer.isBuffer(chunk)) {
                contentChunk = chunk.toString(encoding);
            } else if (typeof chunk !== 'string') {
                contentChunk = String(chunk);
            }
            
            // Append chunk to response content for body construction
            this.content += contentChunk;
            this._chunks.push({
                content: contentChunk,
                encoding: encoding,
                timestamp: Date.now()
            });
            
            // Update content length if content-length header exists
            if (this.headers[HTTP_HEADERS.CONTENT_LENGTH]) {
                this.headers[HTTP_HEADERS.CONTENT_LENGTH] = Buffer.byteLength(this.content, 'utf8').toString();
            }
            
            // Emit 'drain' event for compatibility if needed
            if (this._events.drain) {
                setImmediate(() => this._events.drain());
            }
            
            // Return success status indicating successful write operation
            return true;
            
        } catch (error) {
            // Log write errors but return false instead of throwing
            console.error('MockHttpResponse write error:', error.message);
            return false;
        }
    }
    
    /**
     * Finalizes the mock response and marks it as complete mimicking Node.js ServerResponse.end()
     * method behavior. Implements comprehensive response finalization with final content writing,
     * state management, and completion callback execution.
     * 
     * @param {string|Buffer} [data] - Final data to write before finishing response
     * @param {string} [encoding='utf8'] - Character encoding for final data
     * @param {Function} [callback] - Completion callback function
     * @returns {MockHttpResponse} Returns this instance for compatibility
     */
    end(data, encoding = 'utf8', callback) {
        try {
            // Handle parameter overloading for Node.js compatibility
            if (typeof data === 'function') {
                callback = data;
                data = undefined;
                encoding = 'utf8';
            } else if (typeof encoding === 'function') {
                callback = encoding;
                encoding = 'utf8';
            }
            
            // Write final data to response if provided using write method
            if (data !== undefined && data !== null) {
                this.write(data, encoding);
            }
            
            // Set finished flag to true to mark response completion
            this.finished = true;
            this.writableEnded = true;
            this.writableFinished = true;
            
            // Calculate final content length for accurate header values
            const finalContentLength = Buffer.byteLength(this.content, 'utf8');
            
            // Update content-length header if not set for HTTP compliance
            if (!this.headers[HTTP_HEADERS.CONTENT_LENGTH]) {
                this.headers[HTTP_HEADERS.CONTENT_LENGTH] = finalContentLength.toString();
            }
            
            // Add finalization timestamp to metadata for tracking
            this.metadata.finishedAt = new Date().toISOString();
            this.metadata.totalBytes = finalContentLength;
            this.metadata.chunkCount = this._chunks.length;
            
            // Trigger completion callback if provided for async compatibility
            if (callback && typeof callback === 'function') {
                setImmediate(() => {
                    try {
                        callback();
                    } catch (callbackError) {
                        console.error('MockHttpResponse end callback error:', callbackError.message);
                    }
                });
            }
            
            // Emit 'finish' event for compatibility with Node.js patterns
            if (this._events.finish) {
                setImmediate(() => this._events.finish());
            }
            
            // Return this instance for method chaining compatibility
            return this;
            
        } catch (error) {
            // Log end operation errors but don't throw to maintain test stability
            console.error('MockHttpResponse end operation error:', error.message);
            return this;
        }
    }
    
    /**
     * Sets or updates a header value in the mock response headers object mimicking
     * Node.js ServerResponse.setHeader() method. Implements comprehensive header
     * management with validation, normalization, and state checking.
     * 
     * @param {string} name - Header name to set
     * @param {string|string[]} value - Header value or array of values
     * @returns {MockHttpResponse} Returns this instance for method chaining
     */
    setHeader(name, value) {
        try {
            // Validate headers have not been sent yet to prevent header modification after send
            if (this.headersSent) {
                throw new Error('Cannot set headers after they are sent');
            }
            
            // Validate header name parameter for proper HTTP header format
            if (!name || typeof name !== 'string') {
                throw new Error('Header name must be a non-empty string');
            }
            
            // Normalize header name to lowercase for HTTP compliance
            const normalizedName = name.toLowerCase();
            
            // Set header value in headers object with proper value handling
            this.headers[normalizedName] = value;
            this._headerNames[normalizedName] = name; // Track original case
            
            // Update header metadata for tracking and debugging
            this.metadata.headersModified = this.metadata.headersModified || [];
            this.metadata.headersModified.push({
                name: normalizedName,
                value: value,
                timestamp: Date.now()
            });
            
            // Return this instance for method chaining
            return this;
            
        } catch (error) {
            // Log header setting errors but don't throw to maintain test stability
            console.error('MockHttpResponse setHeader error:', error.message);
            return this;
        }
    }
    
    /**
     * Retrieves a header value from the mock response headers object mimicking
     * Node.js ServerResponse.getHeader() method. Implements comprehensive header
     * retrieval with case-insensitive lookup and proper value handling.
     * 
     * @param {string} name - Header name to retrieve
     * @returns {string|string[]|undefined} Header value or undefined if not found
     */
    getHeader(name) {
        try {
            // Validate header name parameter
            if (!name || typeof name !== 'string') {
                return undefined;
            }
            
            // Normalize header name to lowercase for lookup consistency
            const normalizedName = name.toLowerCase();
            
            // Retrieve header value from headers object using normalized name
            return this.headers[normalizedName];
            
        } catch (error) {
            // Log header retrieval errors and return undefined
            console.error('MockHttpResponse getHeader error:', error.message);
            return undefined;
        }
    }
    
    /**
     * Removes a header from the mock response headers object mimicking
     * Node.js ServerResponse.removeHeader() method. Implements header removal
     * with state validation and proper cleanup operations.
     * 
     * @param {string} name - Header name to remove
     * @returns {MockHttpResponse} Returns this instance for method chaining
     */
    removeHeader(name) {
        try {
            // Validate headers have not been sent yet
            if (this.headersSent) {
                return this; // Cannot remove headers after they are sent
            }
            
            // Validate header name parameter
            if (!name || typeof name !== 'string') {
                return this;
            }
            
            // Normalize header name to lowercase for consistent removal
            const normalizedName = name.toLowerCase();
            
            // Remove header from headers object and track removal
            if (this.headers.hasOwnProperty(normalizedName)) {
                delete this.headers[normalizedName];
                delete this._headerNames[normalizedName];
                this._removedHeader[normalizedName] = Date.now();
            }
            
            // Return this instance for method chaining
            return this;
            
        } catch (error) {
            // Log header removal errors but don't throw
            console.error('MockHttpResponse removeHeader error:', error.message);
            return this;
        }
    }
    
    /**
     * Returns all header names currently set in the response mimicking
     * Node.js ServerResponse.getHeaderNames() method.
     * 
     * @returns {string[]} Array of header names
     */
    getHeaderNames() {
        return Object.keys(this.headers);
    }
    
    /**
     * Returns all headers currently set in the response mimicking
     * Node.js ServerResponse.getHeaders() method.
     * 
     * @returns {Object} Headers object with all current headers
     */
    getHeaders() {
        return { ...this.headers };
    }
    
    /**
     * Checks if a specific header exists in the response mimicking
     * Node.js ServerResponse.hasHeader() method.
     * 
     * @param {string} name - Header name to check
     * @returns {boolean} True if header exists, false otherwise
     */
    hasHeader(name) {
        if (!name || typeof name !== 'string') {
            return false;
        }
        return this.headers.hasOwnProperty(name.toLowerCase());
    }
    
    /**
     * Destroys the response object mimicking Node.js ServerResponse.destroy() method.
     * Implements cleanup operations and state management for proper resource handling.
     * 
     * @param {Error} [error] - Optional error that caused destruction
     * @returns {MockHttpResponse} Returns this instance
     */
    destroy(error) {
        try {
            // Set destroyed state and cleanup resources
            this.destroyed = true;
            this.finished = true;
            this.writableEnded = true;
            this.writableFinished = true;
            
            // Clear content and chunks for memory cleanup
            this.content = '';
            this._chunks = [];
            
            // Add destruction metadata
            this.metadata.destroyedAt = new Date().toISOString();
            if (error) {
                this.metadata.destroyError = error.message;
            }
            
            // Emit 'close' event if handlers exist
            if (this._events.close) {
                setImmediate(() => this._events.close(error));
            }
            
            return this;
            
        } catch (destroyError) {
            console.error('MockHttpResponse destroy error:', destroyError.message);
            return this;
        }
    }
    
    /**
     * Adds event listener to mock response for Node.js EventEmitter compatibility.
     * 
     * @param {string} event - Event name
     * @param {Function} listener - Event listener function
     * @returns {MockHttpResponse} Returns this instance
     */
    on(event, listener) {
        this._events[event] = listener;
        return this;
    }
    
    /**
     * Removes event listener from mock response.
     * 
     * @param {string} event - Event name
     * @param {Function} listener - Event listener function to remove
     * @returns {MockHttpResponse} Returns this instance
     */
    off(event, listener) {
        if (this._events[event] === listener) {
            delete this._events[event];
        }
        return this;
    }
}

// ============================================================================
// RESPONSE FIXTURE GENERATOR CLASS
// ============================================================================

/**
 * Class for generating various types of HTTP response fixtures with customizable options
 * and realistic response structures for comprehensive testing scenarios. Uses embedded mock 
 * functionality to eliminate external dependencies while integrating with constants for 
 * Node.js ServerResponse compatibility and supports validation testing, security testing, 
 * and performance testing.
 * 
 * This class provides centralized response fixture generation capabilities with support
 * for different test scenarios, response types, and validation requirements while maintaining
 * consistency with application response patterns and HTTP protocol compliance.
 */
class ResponseFixtureGenerator {
    /**
     * Initializes the response fixture generator with default configuration and response
     * templates using embedded mock functionality. Creates comprehensive generator instance
     * with template management, configuration validation, and fixture tracking capabilities.
     * 
     * @param {Object} [config={}] - Generator configuration options
     * @param {Object} [config.defaultHeaders] - Default headers for all generated responses
     * @param {Object} [config.statusCodeMappings] - Custom status code mappings
     * @param {string} [config.serverName] - Server name for response identification
     * @param {boolean} [config.includeMetadata=true] - Include metadata in generated responses
     */
    constructor(config = {}) {
        try {
            // Set default HTTP headers for consistent response fixtures using constants
            this.defaultHeaders = {
                [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                [HTTP_HEADERS.DATE]: new Date().toUTCString(),
                [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME,
                [HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS]: 'nosniff',
                ...config.defaultHeaders
            };
            
            // Initialize status code to test case mappings from constants for response generation
            this.statusCodeMappings = {
                success: HTTP_STATUS_CODES.SUCCESS,
                clientError: HTTP_STATUS_CODES.CLIENT_ERROR,
                serverError: HTTP_STATUS_CODES.SERVER_ERROR,
                ...config.statusCodeMappings
            };
            
            // Configure content type mappings for different response types and scenarios
            this.contentTypeMappings = {
                text: CONTENT_TYPES.TEXT_PLAIN,
                json: CONTENT_TYPES.APPLICATION_JSON,
                html: 'text/html; charset=utf-8',
                xml: 'application/xml; charset=utf-8'
            };
            
            // Set server name string for response identification and tracking
            this.serverName = config.serverName || TEST_SERVER_NAME;
            
            // Initialize timestamp and metadata for fixture tracking and correlation
            this.initializationTime = new Date().toISOString();
            this.generatedCount = 0;
            this.includeMetadata = config.includeMetadata !== false;
            
            // Initialize embedded mock response functionality for fixture generation
            this.mockResponseConfig = {
                useEmbeddedMock: true,
                validateStructure: true,
                includeCorrelation: true
            };
            
        } catch (error) {
            // Enhanced error context for generator initialization failures
            const generatorError = new Error(`ResponseFixtureGenerator initialization failed: ${error.message}`);
            generatorError.originalError = error;
            generatorError.context = {
                config: JSON.stringify(config, null, 2),
                timestamp: new Date().toISOString()
            };
            throw generatorError;
        }
    }
    
    /**
     * Generates a valid HTTP response fixture for the specified status code and content
     * using embedded mock functionality. Creates comprehensive response fixtures with proper
     * HTTP structure, headers, and content for successful response testing scenarios.
     * 
     * @param {number} statusCode - HTTP status code for response fixture
     * @param {string} content - Response body content
     * @param {Object} [options={}] - Additional options for response generation
     * @param {Object} [options.headers] - Additional headers to include
     * @param {string} [options.contentType] - Override content type
     * @param {boolean} [options.includeSecurityHeaders=false] - Include security headers
     * @returns {MockHttpResponse} Valid HTTP response object with proper structure and headers
     */
    generateValidResponse(statusCode, content, options = {}) {
        try {
            // Validate status code parameter against supported HTTP status codes
            if (!isValidStatusCode(statusCode)) {
                throw new Error(`Invalid status code for valid response: ${statusCode}`);
            }
            
            // Validate status code is in success range for valid response generation
            if (statusCode < 200 || statusCode >= 400) {
                throw new Error(`Status code ${statusCode} not appropriate for valid response`);
            }
            
            // Create base response structure with proper HTTP format and compliance
            const responseHeaders = {
                ...this.defaultHeaders,
                [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(content || '', 'utf8').toString(),
                ...options.headers
            };
            
            // Apply content type override if provided for customized content handling
            if (options.contentType) {
                responseHeaders[HTTP_HEADERS.CONTENT_TYPE] = options.contentType;
            }
            
            // Include security headers if requested for security testing scenarios
            if (options.includeSecurityHeaders) {
                responseHeaders[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS] = 'nosniff';
                responseHeaders['x-frame-options'] = 'DENY';
                responseHeaders['x-xss-protection'] = '1; mode=block';
            }
            
            // Set response status code and content from parameters for fixture structure
            const responseConfig = {
                statusCode: statusCode,
                headers: responseHeaders,
                content: content || '',
                httpVersion: '1.1',
                finished: false,
                headersSent: false
            };
            
            // Create mock response using embedded MockHttpResponse class
            const mockResponse = new MockHttpResponse(responseConfig);
            
            // Set timestamp and correlation ID for tracking and debugging
            if (this.includeMetadata) {
                mockResponse.metadata.fixtureType = 'valid-response';
                mockResponse.metadata.generatedBy = 'ResponseFixtureGenerator';
                mockResponse.metadata.statusCategory = getStatusCategory(statusCode);
                mockResponse.metadata.generationOptions = JSON.stringify(options);
            }
            
            // Track response generation statistics
            this.generatedCount++;
            
            // Return complete valid response fixture ready for testing
            return mockResponse;
            
        } catch (error) {
            // Enhanced error context for valid response generation failures
            const responseError = new Error(`Failed to generate valid response: ${error.message}`);
            responseError.originalError = error;
            responseError.context = {
                statusCode,
                content: content?.substring(0, 100) + (content?.length > 100 ? '...' : ''),
                options: JSON.stringify(options, null, 2),
                timestamp: new Date().toISOString()
            };
            throw responseError;
        }
    }
    
    /**
     * Generates HTTP error response fixtures for specific error conditions and status codes
     * using embedded mock functionality. Creates comprehensive error response fixtures with
     * proper error structure, status codes, and error content for error handling testing.
     * 
     * @param {number} errorStatusCode - HTTP error status code
     * @param {Object} [errorConfig={}] - Error configuration options
     * @param {string} [errorConfig.message] - Custom error message
     * @param {Object} [errorConfig.headers] - Additional error headers
     * @param {boolean} [errorConfig.includeStack=false] - Include stack trace (for testing only)
     * @returns {MockHttpResponse} HTTP error response object configured with specified error condition
     */
    generateErrorResponse(errorStatusCode, errorConfig = {}) {
        try {
            // Validate error status code is in error range (4xx or 5xx)
            if (!isValidStatusCode(errorStatusCode) || errorStatusCode < 400) {
                throw new Error(`Invalid error status code: ${errorStatusCode}`);
            }
            
            // Determine error type and create appropriate error response structure
            const statusCategory = getStatusCategory(errorStatusCode);
            const isClientError = statusCategory === 'CLIENT_ERROR';
            const isServerError = statusCategory === 'SERVER_ERROR';
            
            // Get appropriate error message from constants or use custom message
            let errorMessage = errorConfig.message;
            if (!errorMessage) {
                // Map status codes to error messages from constants
                const errorMessageMap = {
                    400: ERROR_MESSAGES.BAD_REQUEST,
                    404: ERROR_MESSAGES.NOT_FOUND,
                    405: ERROR_MESSAGES.METHOD_NOT_ALLOWED,
                    500: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                };
                errorMessage = errorMessageMap[errorStatusCode] || `HTTP Error ${errorStatusCode}`;
            }
            
            // Create error-specific headers including content-type and content-length
            const errorHeaders = {
                ...this.defaultHeaders,
                [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(errorMessage, 'utf8').toString(),
                ...errorConfig.headers
            };
            
            // Add Allow header for 405 Method Not Allowed responses for HTTP compliance
            if (errorStatusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
                errorHeaders[HTTP_HEADERS.ALLOW] = 'GET';
            }
            
            // Apply error condition to specific response components
            const errorResponseConfig = {
                statusCode: errorStatusCode,
                headers: errorHeaders,
                content: errorMessage,
                httpVersion: '1.1',
                finished: false,
                headersSent: false
            };
            
            // Create mock response using embedded MockHttpResponse with error settings
            const errorResponse = new MockHttpResponse(errorResponseConfig);
            
            // Set error metadata for test identification and validation
            if (this.includeMetadata) {
                errorResponse.metadata.fixtureType = 'error-response';
                errorResponse.metadata.errorType = isClientError ? 'client-error' : 'server-error';
                errorResponse.metadata.statusCategory = statusCategory;
                errorResponse.metadata.errorCode = errorStatusCode;
                errorResponse.metadata.customMessage = !!errorConfig.message;
                
                // Include expected error information for validation testing
                errorResponse.metadata.expectedValidation = {
                    shouldBeError: true,
                    expectedStatusRange: isClientError ? '4xx' : '5xx',
                    errorCategory: statusCategory
                };
            }
            
            // Track error response generation statistics
            this.generatedCount++;
            
            // Return error response fixture for error testing scenarios
            return errorResponse;
            
        } catch (error) {
            // Enhanced error context for error response generation failures
            const errorGenError = new Error(`Failed to generate error response: ${error.message}`);
            errorGenError.originalError = error;
            errorGenError.context = {
                errorStatusCode,
                errorConfig: JSON.stringify(errorConfig, null, 2),
                timestamp: new Date().toISOString()
            };
            throw errorGenError;
        }
    }
    
    /**
     * Generates multiple response fixtures in bulk for performance and load testing scenarios
     * using embedded mock functionality. Creates specified number of response fixtures with
     * unique identifiers and consistent structure for bulk testing operations.
     * 
     * @param {number} count - Number of response fixtures to generate
     * @param {string} responseType - Type of response to generate (success, error, mixed)
     * @param {Object} [options={}] - Bulk generation options
     * @param {boolean} [options.uniqueIdentifiers=true] - Generate unique IDs for each response
     * @param {Object} [options.baseConfig] - Base configuration for all responses
     * @returns {Array<MockHttpResponse>} Array of HTTP response fixtures for bulk testing scenarios
     */
    generateBulkResponses(count, responseType, options = {}) {
        try {
            // Validate count parameter for reasonable bulk generation limits
            if (typeof count !== 'number' || count <= 0 || count > 10000) {
                throw new Error(`Invalid count for bulk generation: ${count}. Must be between 1 and 10000.`);
            }
            
            // Validate response type parameter
            const validResponseTypes = ['success', 'error', 'mixed', 'hello'];
            if (!validResponseTypes.includes(responseType)) {
                throw new Error(`Invalid response type: ${responseType}. Valid types: ${validResponseTypes.join(', ')}`);
            }
            
            // Create base response template based on responseType for consistent generation
            const baseTemplate = this._createResponseTemplate(responseType, options.baseConfig);
            
            // Initialize bulk response generation array
            const bulkResponses = [];
            
            // Generate specified number of response fixtures using embedded mock
            for (let i = 0; i < count; i++) {
                try {
                    // Create response configuration for individual fixture
                    const fixtureConfig = {
                        ...baseTemplate,
                        // Add unique identifiers and timestamps to each fixture
                        content: options.uniqueIdentifiers ? 
                            `${baseTemplate.content} [${i + 1}/${count}]` : 
                            baseTemplate.content
                    };
                    
                    // Generate response fixture using appropriate method
                    let responseFixture;
                    if (responseType === 'error') {
                        responseFixture = this.generateErrorResponse(baseTemplate.statusCode, {
                            message: fixtureConfig.content,
                            headers: fixtureConfig.headers
                        });
                    } else {
                        responseFixture = this.generateValidResponse(
                            baseTemplate.statusCode,
                            fixtureConfig.content,
                            { headers: fixtureConfig.headers }
                        );
                    }
                    
                    // Add bulk generation metadata for tracking
                    if (this.includeMetadata) {
                        responseFixture.metadata.bulkGeneration = {
                            batchId: crypto.randomUUID(),
                            index: i,
                            totalCount: count,
                            responseType: responseType,
                            generatedAt: new Date().toISOString()
                        };
                    }
                    
                    // Add response fixture to bulk array
                    bulkResponses.push(responseFixture);
                    
                } catch (fixtureError) {
                    // Log individual fixture generation errors but continue with batch
                    console.error(`Failed to generate fixture ${i + 1}/${count}:`, fixtureError.message);
                    
                    // Create error placeholder fixture for failed generations
                    const errorPlaceholder = new MockHttpResponse({
                        statusCode: 500,
                        content: `Fixture generation error: ${fixtureError.message}`,
                        headers: this.defaultHeaders
                    });
                    bulkResponses.push(errorPlaceholder);
                }
            }
            
            // Track bulk generation statistics
            this.generatedCount += bulkResponses.length;
            
            // Return array of bulk response fixtures for load testing
            return bulkResponses;
            
        } catch (error) {
            // Enhanced error context for bulk generation failures
            const bulkError = new Error(`Failed to generate bulk responses: ${error.message}`);
            bulkError.originalError = error;
            bulkError.context = {
                count,
                responseType,
                options: JSON.stringify(options, null, 2),
                timestamp: new Date().toISOString()
            };
            throw bulkError;
        }
    }
    
    /**
     * Creates response template for bulk generation based on response type.
     * @private
     */
    _createResponseTemplate(responseType, baseConfig = {}) {
        const templates = {
            success: {
                statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                content: RESPONSE_MESSAGES.SUCCESS,
                headers: {}
            },
            error: {
                statusCode: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                content: ERROR_MESSAGES.NOT_FOUND,
                headers: {}
            },
            hello: {
                statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                content: RESPONSE_MESSAGES.HELLO_WORLD,
                headers: {}
            },
            mixed: {
                statusCode: Math.random() > 0.8 ? HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND : HTTP_STATUS_CODES.SUCCESS.OK,
                content: Math.random() > 0.8 ? ERROR_MESSAGES.NOT_FOUND : RESPONSE_MESSAGES.SUCCESS,
                headers: {}
            }
        };
        
        return {
            ...templates[responseType] || templates.success,
            ...baseConfig
        };
    }
}

// ============================================================================
// RESPONSE FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a mock HTTP response object that mimics Node.js ServerResponse structure for testing
 * purposes. Localizes mock response functionality to eliminate external dependencies while
 * maintaining realistic response object structure with proper method implementation and state management.
 * 
 * @param {Object} [responseOptions={}] - Configuration options for mock response creation
 * @param {number} [responseOptions.statusCode=200] - HTTP status code for mock response
 * @param {Object} [responseOptions.headers={}] - HTTP headers for mock response
 * @param {string} [responseOptions.content=''] - Response body content
 * @param {string} [responseOptions.httpVersion='1.1'] - HTTP version for response
 * @param {boolean} [responseOptions.finished=false] - Response finished state
 * @returns {MockHttpResponse} Mock HTTP response object with Node.js ServerResponse-compatible structure
 * 
 * @example
 * const mockResponse = createMockHttpResponse({
 *   statusCode: 200,
 *   headers: { 'content-type': 'text/plain' },
 *   content: 'Hello world'
 * });
 */
function createMockHttpResponse(responseOptions = {}) {
    try {
        // Extract statusCode, headers, content, and httpVersion from responseOptions
        const {
            statusCode = HTTP_STATUS_CODES.SUCCESS.OK,
            headers = {},
            content = '',
            httpVersion = '1.1',
            finished = false,
            headersSent = false
        } = responseOptions;
        
        // Set default values for missing properties using constants
        const normalizedOptions = {
            statusCode: isValidStatusCode(statusCode) ? statusCode : HTTP_STATUS_CODES.SUCCESS.OK,
            headers: headers || {},
            content: content || '',
            httpVersion: httpVersion || '1.1',
            finished: finished || false,
            headersSent: headersSent || false
        };
        
        // Create headers object with lowercased keys for HTTP compliance
        const normalizedHeaders = {};
        Object.keys(normalizedOptions.headers).forEach(key => {
            normalizedHeaders[key.toLowerCase()] = normalizedOptions.headers[key];
        });
        
        // Add Node.js ServerResponse properties like writeHead, write, and end methods
        const mockResponseConfig = {
            ...normalizedOptions,
            headers: normalizedHeaders
        };
        
        // Set timestamp and correlation ID for tracking and response identification
        const correlationId = `${RESPONSE_FIXTURE_PREFIX}mock-${crypto.randomBytes(6).toString('hex')}`;
        
        // Create mock response object with all required properties using MockHttpResponse class
        const mockResponse = new MockHttpResponse(mockResponseConfig);
        
        // Add fixture-specific metadata for test identification
        mockResponse.metadata.creationType = 'factory-function';
        mockResponse.metadata.correlationId = correlationId;
        mockResponse.metadata.fixtureSource = 'createMockHttpResponse';
        
        // Return complete mock HTTP response object for testing
        return mockResponse;
        
    } catch (error) {
        // Enhanced error context for mock response creation failures
        const mockError = new Error(`Failed to create mock HTTP response: ${error.message}`);
        mockError.originalError = error;
        mockError.context = {
            responseOptions: JSON.stringify(responseOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw mockError;
    }
}

/**
 * Creates a valid HTTP 200 response object for the /hello endpoint with proper headers
 * and content using embedded mock functionality. Generates standardized hello endpoint
 * response fixtures with proper HTTP structure and hello-specific content validation.
 * 
 * @param {Object} [options={}] - Hello response configuration options
 * @param {Object} [options.headers] - Additional headers to include in hello response
 * @param {string} [options.content] - Override default hello content
 * @param {boolean} [options.includeMetadata=true] - Include hello endpoint metadata
 * @param {string} [options.correlationId] - Custom correlation ID for response tracking
 * @returns {MockHttpResponse} Complete HTTP response object formatted for hello endpoint success testing
 * 
 * @example
 * const helloResponse = createValidHelloResponse({
 *   headers: { 'x-custom-header': 'test' },
 *   correlationId: 'hello-test-123'
 * });
 */
function createValidHelloResponse(options = {}) {
    try {
        // Set HTTP status code to 200 using HTTP_STATUS_CODES constant for success response
        const statusCode = HTTP_STATUS_CODES.SUCCESS.OK;
        
        // Set response content to 'Hello world' using RESPONSE_MESSAGES constant
        const responseContent = options.content || RESPONSE_MESSAGES.HELLO_WORLD;
        
        // Create standard HTTP headers with content-type, content-length, and date headers
        const helloHeaders = {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(responseContent, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME,
            ...options.headers
        };
        
        // Add security headers including x-content-type-options for MIME protection
        helloHeaders[HTTP_HEADERS.X_CONTENT_TYPE_OPTIONS] = 'nosniff';
        
        // Set content-length to exact byte count of 'Hello world' content for HTTP compliance
        const contentLength = Buffer.byteLength(responseContent, 'utf8');
        helloHeaders[HTTP_HEADERS.CONTENT_LENGTH] = contentLength.toString();
        
        // Create mock response object using embedded createMockHttpResponse function
        const helloResponse = createMockHttpResponse({
            statusCode: statusCode,
            headers: helloHeaders,
            content: responseContent,
            httpVersion: '1.1'
        });
        
        // Add response metadata including timestamp and correlation ID for hello endpoint tracking
        if (options.includeMetadata !== false) {
            helloResponse.metadata.endpointType = 'hello-endpoint';
            helloResponse.metadata.responseCategory = 'success';
            helloResponse.metadata.correlationId = options.correlationId || 
                `${RESPONSE_FIXTURE_PREFIX}hello-${crypto.randomBytes(4).toString('hex')}`;
            helloResponse.metadata.contentValidation = {
                expectedContent: RESPONSE_MESSAGES.HELLO_WORLD,
                contentMatch: responseContent === RESPONSE_MESSAGES.HELLO_WORLD,
                contentLength: contentLength
            };
        }
        
        // Return complete response object ready for hello endpoint testing
        return helloResponse;
        
    } catch (error) {
        // Enhanced error context for hello response creation failures
        const helloError = new Error(`Failed to create valid hello response: ${error.message}`);
        helloError.originalError = error;
        helloError.context = {
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };
        throw helloError;
    }
}

/**
 * Creates HTTP error response objects for testing error handling and validation using
 * embedded mock functionality. Generates comprehensive error response fixtures with
 * proper error status codes, error messages, and error-specific headers for error testing.
 * 
 * @param {number} statusCode - HTTP error status code for error response
 * @param {string} errorMessage - Error message content for response body
 * @param {Object} [options={}] - Error response configuration options
 * @param {Object} [options.headers] - Additional headers for error response
 * @param {boolean} [options.includeErrorDetails=false] - Include detailed error information
 * @param {string} [options.errorType] - Error type classification for testing
 * @returns {MockHttpResponse} HTTP error response object for error handling testing
 * 
 * @example
 * const errorResponse = createErrorResponse(404, 'Not Found', {
 *   errorType: 'route-not-found',
 *   includeErrorDetails: true
 * });
 */
function createErrorResponse(statusCode, errorMessage, options = {}) {
    try {
        // Set HTTP status code to provided error status code parameter with validation
        if (!isValidStatusCode(statusCode) || statusCode < 400) {
            throw new Error(`Invalid error status code: ${statusCode}. Must be 400 or higher.`);
        }
        
        // Validate error message parameter
        const validatedErrorMessage = errorMessage || `HTTP Error ${statusCode}`;
        
        // Set response content to provided error message using ERROR_MESSAGES constants
        const errorContent = validatedErrorMessage;
        
        // Create error-specific headers including content-type and content-length
        const errorHeaders = {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(errorContent, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME,
            ...options.headers
        };
        
        // Add Allow header for 405 Method Not Allowed responses for HTTP method compliance
        if (statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
            errorHeaders[HTTP_HEADERS.ALLOW] = 'GET';
        }
        
        // Create mock response object using embedded createMockHttpResponse function
        const errorResponse = createMockHttpResponse({
            statusCode: statusCode,
            headers: errorHeaders,
            content: errorContent,
            httpVersion: '1.1'
        });
        
        // Include error metadata for test identification and validation
        if (options.includeErrorDetails !== false) {
            errorResponse.metadata.fixtureType = 'error-response';
            errorResponse.metadata.errorDetails = {
                statusCode: statusCode,
                statusCategory: getStatusCategory(statusCode),
                errorType: options.errorType || 'generic-error',
                originalMessage: errorMessage,
                isClientError: statusCode >= 400 && statusCode < 500,
                isServerError: statusCode >= 500
            };
            
            // Add error validation information for test assertions
            errorResponse.metadata.expectedValidation = {
                shouldBeError: true,
                expectedStatus: statusCode,
                expectedMessage: errorContent,
                errorCategory: getStatusCategory(statusCode)
            };
        }
        
        // Return error response object for error scenario testing
        return errorResponse;
        
    } catch (error) {
        // Enhanced error context for error response creation failures
        const createError = new Error(`Failed to create error response: ${error.message}`);
        createError.originalError = error;
        createError.context = {
            statusCode,
            errorMessage,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };
        throw createError;
    }
}

/**
 * Creates malformed HTTP response objects for testing response validation and error handling
 * using embedded mock functionality. Generates response fixtures with intentional structural
 * issues for validation error testing and error boundary validation.
 * 
 * @param {string} malformationType - Type of malformation to apply to response
 * @param {Object} [options={}] - Malformation configuration options
 * @param {string} [options.severity='medium'] - Severity level of malformation
 * @param {boolean} [options.includeRecoveryInfo=true] - Include recovery information
 * @returns {MockHttpResponse} Malformed HTTP response object for validation error testing
 * 
 * @example
 * const malformedResponse = createMalformedResponse('missing-headers', {
 *   severity: 'high',
 *   includeRecoveryInfo: true
 * });
 */
function createMalformedResponse(malformationType, options = {}) {
    try {
        // Determine malformation type from malformationType parameter with validation
        const validMalformationTypes = [
            'missing-headers',
            'invalid-status',
            'malformed-headers',
            'invalid-content-length',
            'empty-response',
            'corrupted-content',
            'invalid-encoding',
            'missing-required-headers'
        ];
        
        if (!validMalformationTypes.includes(malformationType)) {
            throw new Error(`Invalid malformation type: ${malformationType}. Valid types: ${validMalformationTypes.join(', ')}`);
        }
        
        // Apply specific malformation based on type with intentional structural issues
        let malformedConfig = {};
        
        switch (malformationType) {
            case 'missing-headers':
                // Create response with missing required headers
                malformedConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {}, // Intentionally empty headers
                    content: 'Response with missing headers'
                };
                break;
                
            case 'invalid-status':
                // Create response with invalid HTTP status code
                malformedConfig = {
                    statusCode: 999, // Invalid status code
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    },
                    content: 'Response with invalid status code'
                };
                break;
                
            case 'malformed-headers':
                // Create response with malformed header structure
                malformedConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        'Invalid Header Name With Spaces': 'invalid-value',
                        'header-with-null-value': null,
                        'header-with-undefined': undefined,
                        '': 'empty-name-header'
                    },
                    content: 'Response with malformed headers'
                };
                break;
                
            case 'invalid-content-length':
                // Create response with incorrect content-length header
                const content = 'Content with incorrect length header';
                malformedConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                        [HTTP_HEADERS.CONTENT_LENGTH]: '999' // Incorrect length
                    },
                    content: content
                };
                break;
                
            case 'empty-response':
                // Create completely empty response for boundary testing
                malformedConfig = {
                    statusCode: null,
                    headers: null,
                    content: null
                };
                break;
                
            case 'corrupted-content':
                // Create response with corrupted or invalid content
                malformedConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    },
                    content: '\x00\x01\x02Invalid\nCorrupted\tContent\r\n'
                };
                break;
                
            default:
                // Default malformation with missing headers
                malformedConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {},
                    content: 'Default malformed response'
                };
        }
        
        // Create response object with intentional structural issues using embedded mock
        const malformedResponse = new MockHttpResponse(malformedConfig);
        
        // Add malformation metadata for error testing identification
        malformedResponse.metadata.fixtureType = 'malformed-response';
        malformedResponse.metadata.malformationType = malformationType;
        malformedResponse.metadata.severity = options.severity || 'medium';
        malformedResponse.metadata.intentionalIssues = true;
        
        // Include expected validation error information for test assertions
        malformedResponse.metadata.expectedValidation = {
            shouldFail: true,
            expectedErrors: [`Malformation: ${malformationType}`],
            validationCategory: 'structural-error',
            recoveryPossible: options.includeRecoveryInfo !== false
        };
        
        // Return malformed response object for validation testing
        return malformedResponse;
        
    } catch (error) {
        // Enhanced error context for malformed response creation failures
        const malformError = new Error(`Failed to create malformed response: ${error.message}`);
        malformError.originalError = error;
        malformError.context = {
            malformationType,
            options: JSON.stringify(options, null, 2),
            timestamp: new Date().toISOString()
        };
        throw malformError;
    }
}

/**
 * Creates HTTP response objects with security vulnerability patterns for testing security
 * validation and injection prevention using embedded mock functionality. Generates response
 * fixtures with intentional security issues for security testing and vulnerability detection.
 * 
 * @param {string} securityType - Type of security vulnerability to simulate
 * @param {Object} [securityOptions={}] - Security test configuration options
 * @param {string} [securityOptions.payload] - Custom security payload for injection testing
 * @param {boolean} [securityOptions.includeBypass=false] - Include security bypass attempts
 * @returns {MockHttpResponse} HTTP response object with security vulnerability patterns for security testing
 * 
 * @example
 * const securityResponse = createSecurityTestResponse('header-injection', {
 *   payload: '<script>alert("xss")</script>',
 *   includeBypass: true
 * });
 */
function createSecurityTestResponse(securityType, securityOptions = {}) {
    try {
        // Determine security vulnerability type from securityType parameter with validation
        const validSecurityTypes = [
            'header-injection',
            'information-disclosure',
            'xss-vulnerability',
            'mime-confusion',
            'response-splitting',
            'cache-poisoning',
            'cors-bypass',
            'clickjacking'
        ];
        
        if (!validSecurityTypes.includes(securityType)) {
            throw new Error(`Invalid security type: ${securityType}. Valid types: ${validSecurityTypes.join(', ')}`);
        }
        
        // Apply security vulnerability patterns to appropriate response components
        let securityConfig = {};
        const payload = securityOptions.payload || '<script>alert("security-test")</script>';
        
        switch (securityType) {
            case 'header-injection':
                // Create response with header injection vulnerability
                securityConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                        'x-injected-header': `value\r\nInjected-Header: malicious-value`,
                        [HTTP_HEADERS.DATE]: new Date().toUTCString()
                    },
                    content: 'Response with header injection vulnerability'
                };
                break;
                
            case 'information-disclosure':
                // Create response that discloses sensitive information
                securityConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                        'x-server-version': 'Node.js/22.0.0',
                        'x-internal-path': '/internal/server/config',
                        'x-debug-info': 'Debug mode enabled'
                    },
                    content: 'Response with information disclosure: Server internal details exposed'
                };
                break;
                
            case 'xss-vulnerability':
                // Create response with XSS vulnerability pattern
                securityConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: 'text/html', // Intentionally not setting charset
                        // Missing X-Content-Type-Options header
                    },
                    content: `<html><body>User input: ${payload}</body></html>`
                };
                break;
                
            case 'mime-confusion':
                // Create response with MIME type confusion vulnerability
                securityConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: 'text/plain',
                        // Missing X-Content-Type-Options: nosniff
                    },
                    content: `<!DOCTYPE html><script>${payload}</script>`
                };
                break;
                
            case 'response-splitting':
                // Create response with response splitting vulnerability
                securityConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                        'x-user-input': `value\r\n\r\n<script>${payload}</script>`
                    },
                    content: 'Response with response splitting vulnerability'
                };
                break;
                
            default:
                // Default security vulnerability with XSS pattern
                securityConfig = {
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    },
                    content: `Vulnerable response: ${payload}`
                };
        }
        
        // Create response object with security issues using embedded mock functionality
        const securityResponse = new MockHttpResponse(securityConfig);
        
        // Add security testing metadata and vulnerability classification
        securityResponse.metadata.fixtureType = 'security-test-response';
        securityResponse.metadata.securityVulnerability = {
            type: securityType,
            severity: this._getSecuritySeverity(securityType),
            payload: payload,
            bypassAttempt: securityOptions.includeBypass || false,
            mitigationRequired: true
        };
        
        // Include expected security validation results for test assertions
        securityResponse.metadata.expectedValidation = {
            shouldFailSecurity: true,
            vulnerabilityType: securityType,
            expectedDetection: true,
            mitigationNeeded: true,
            securityRisk: this._getSecuritySeverity(securityType)
        };
        
        // Return security test response object for vulnerability detection testing
        return securityResponse;
        
    } catch (error) {
        // Enhanced error context for security response creation failures
        const securityError = new Error(`Failed to create security test response: ${error.message}`);
        securityError.originalError = error;
        securityError.context = {
            securityType,
            securityOptions: JSON.stringify(securityOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw securityError;
    }
    
    /**
     * Gets security severity level for vulnerability type.
     * @private
     */
    _getSecuritySeverity(securityType) {
        const severityMap = {
            'header-injection': 'high',
            'information-disclosure': 'medium',
            'xss-vulnerability': 'high',
            'mime-confusion': 'medium',
            'response-splitting': 'high',
            'cache-poisoning': 'medium',
            'cors-bypass': 'medium',
            'clickjacking': 'low'
        };
        return severityMap[securityType] || 'medium';
    }
}

/**
 * Generates a complete suite of response test data covering all response scenarios and edge cases
 * for comprehensive testing using embedded mock functionality. Creates organized test suite with
 * categorized response fixtures for unit testing, integration testing, and end-to-end testing.
 * 
 * @param {Object} [suiteOptions={}] - Test suite generation options
 * @param {Array} [suiteOptions.includeCategories] - Specific categories to include in suite
 * @param {boolean} [suiteOptions.includeEdgeCases=true] - Include edge case responses
 * @param {boolean} [suiteOptions.includeSecurityTests=true] - Include security test responses
 * @param {Object} [suiteOptions.customOptions] - Custom options for response generation
 * @returns {Object} Complete test suite with categorized response fixtures for comprehensive testing
 * 
 * @example
 * const testSuite = generateResponseTestSuite({
 *   includeCategories: ['valid', 'errors', 'security'],
 *   includeEdgeCases: true,
 *   customOptions: { serverName: 'Test Server' }
 * });
 */
function generateResponseTestSuite(suiteOptions = {}) {
    try {
        // Initialize suite options with defaults for comprehensive test suite generation
        const options = {
            includeCategories: ['valid', 'errors', 'success', 'malformed', 'security', 'edgeCases'],
            includeEdgeCases: true,
            includeSecurityTests: true,
            generateBulkData: false,
            customOptions: {},
            ...suiteOptions
        };
        
        // Initialize comprehensive test suite structure
        const testSuite = {
            metadata: {
                generatedAt: new Date().toISOString(),
                suiteId: `${RESPONSE_FIXTURE_PREFIX}suite-${crypto.randomUUID()}`,
                categories: options.includeCategories,
                totalFixtures: 0,
                generatorVersion: '1.0.0'
            },
            fixtures: {}
        };
        
        // Generate valid hello endpoint response fixtures with various configurations
        if (options.includeCategories.includes('valid')) {
            testSuite.fixtures.valid = {
                basicHelloResponse: createValidHelloResponse(),
                helloResponseWithHeaders: createValidHelloResponse({
                    headers: {
                        'x-custom-header': 'test-value',
                        'x-test-scenario': 'hello-with-headers'
                    }
                }),
                helloResponseWithMetadata: createValidHelloResponse({
                    includeMetadata: true,
                    correlationId: 'hello-metadata-test'
                })
            };
            testSuite.metadata.totalFixtures += 3;
        }
        
        // Create error response fixtures for all supported HTTP error codes
        if (options.includeCategories.includes('errors')) {
            testSuite.fixtures.errors = {
                notFoundResponse: createErrorResponse(
                    HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                    ERROR_MESSAGES.NOT_FOUND
                ),
                methodNotAllowedResponse: createErrorResponse(
                    HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    ERROR_MESSAGES.METHOD_NOT_ALLOWED
                ),
                badRequestResponse: createErrorResponse(
                    HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                    ERROR_MESSAGES.BAD_REQUEST
                ),
                internalServerErrorResponse: createErrorResponse(
                    HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                    ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                )
            };
            testSuite.metadata.totalFixtures += 4;
        }
        
        // Generate success response fixtures for successful operation testing
        if (options.includeCategories.includes('success')) {
            testSuite.fixtures.success = {
                okResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: RESPONSE_MESSAGES.OK,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    }
                }),
                successResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: RESPONSE_MESSAGES.SUCCESS,
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    }
                }),
                completedResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: 'Operation completed successfully',
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                        'x-operation-status': 'completed'
                    }
                })
            };
            testSuite.metadata.totalFixtures += 3;
        }
        
        // Generate malformed response fixtures for validation error testing
        if (options.includeCategories.includes('malformed')) {
            testSuite.fixtures.malformed = {
                missingHeadersResponse: createMalformedResponse('missing-headers'),
                invalidStatusCodeResponse: createMalformedResponse('invalid-status'),
                malformedHeadersResponse: createMalformedResponse('malformed-headers'),
                invalidContentLengthResponse: createMalformedResponse('invalid-content-length')
            };
            testSuite.metadata.totalFixtures += 4;
        }
        
        // Create security test response fixtures for vulnerability detection testing
        if (options.includeCategories.includes('security') && options.includeSecurityTests) {
            testSuite.fixtures.security = {
                headerInjectionResponse: createSecurityTestResponse('header-injection'),
                informationDisclosureResponse: createSecurityTestResponse('information-disclosure'),
                xssVulnerabilityResponse: createSecurityTestResponse('xss-vulnerability'),
                mimeConfusionResponse: createSecurityTestResponse('mime-confusion')
            };
            testSuite.metadata.totalFixtures += 4;
        }
        
        // Generate edge case response fixtures for boundary condition testing
        if (options.includeCategories.includes('edgeCases') && options.includeEdgeCases) {
            testSuite.fixtures.edgeCases = {
                emptyContentResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: '',
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
                        [HTTP_HEADERS.CONTENT_LENGTH]: '0'
                    }
                }),
                maxContentResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: 'A'.repeat(1000), // Large content for boundary testing
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    }
                }),
                unicodeContentResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: 'Hello 世界 🌍 Мир 🌎',
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN
                    }
                }),
                binaryContentResponse: createMockHttpResponse({
                    statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
                    content: Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]).toString('binary'),
                    headers: {
                        [HTTP_HEADERS.CONTENT_TYPE]: 'application/octet-stream'
                    }
                })
            };
            testSuite.metadata.totalFixtures += 4;
        }
        
        // Add suite correlation and generation metadata
        testSuite.metadata.completedAt = new Date().toISOString();
        testSuite.metadata.generationDuration = Date.now() - DEFAULT_RESPONSE_TIMESTAMP;
        
        // Organize all fixtures into categorized test suite structure
        return testSuite;
        
    } catch (error) {
        // Enhanced error context for test suite generation failures
        const suiteError = new Error(`Failed to generate response test suite: ${error.message}`);
        suiteError.originalError = error;
        suiteError.context = {
            suiteOptions: JSON.stringify(suiteOptions, null, 2),
            timestamp: new Date().toISOString()
        };
        throw suiteError;
    }
}

// ============================================================================
// PRE-CONFIGURED RESPONSE FIXTURES
// ============================================================================

/**
 * Collection of valid HTTP response fixtures for hello endpoint success testing.
 * Provides standardized valid response objects for testing successful hello endpoint
 * operations with various header configurations and content validation scenarios.
 */
const VALID_HELLO_RESPONSES = {
    /**
     * Basic hello response fixture with minimal headers and standard hello content.
     * Provides fundamental hello endpoint response for basic testing scenarios
     * without additional headers or metadata for simple test validation.
     */
    basicHelloResponse: createValidHelloResponse({
        includeMetadata: true,
        correlationId: 'basic-hello-fixture'
    }),
    
    /**
     * Hello response fixture with additional headers for comprehensive header testing.
     * Includes custom headers and extended metadata for testing header processing
     * and response validation with additional header scenarios.
     */
    helloResponseWithHeaders: createValidHelloResponse({
        headers: {
            'x-custom-header': 'hello-test-value',
            'x-test-scenario': 'hello-with-headers',
            'x-response-source': 'test-fixture'
        },
        includeMetadata: true,
        correlationId: 'hello-headers-fixture'
    }),
    
    /**
     * Hello response fixture with comprehensive metadata for testing metadata handling.
     * Provides extended metadata and correlation information for testing response
     * tracking and correlation across distributed test execution scenarios.
     */
    helloResponseWithMetadata: createValidHelloResponse({
        includeMetadata: true,
        correlationId: 'hello-metadata-fixture',
        headers: {
            'x-correlation-id': 'hello-metadata-test',
            'x-test-type': 'metadata-validation'
        }
    })
};

/**
 * Collection of error response fixtures for testing error handling and validation.
 * Provides standardized error response objects for testing error scenarios, error
 * handling logic, and error response validation with comprehensive error coverage.
 */
const ERROR_RESPONSES = {
    /**
     * HTTP 404 Not Found response fixture for testing route not found scenarios.
     * Provides standard 404 error response with proper error headers and content
     * for testing route matching and error handling logic.
     */
    notFoundResponse: createErrorResponse(
        HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
        ERROR_MESSAGES.NOT_FOUND,
        {
            errorType: 'route-not-found',
            includeErrorDetails: true
        }
    ),
    
    /**
     * HTTP 405 Method Not Allowed response fixture for testing method validation.
     * Includes Allow header with supported methods for testing HTTP method
     * validation and proper error response with method restriction information.
     */
    methodNotAllowedResponse: createErrorResponse(
        HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
        ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        {
            errorType: 'method-not-allowed',
            headers: {
                [HTTP_HEADERS.ALLOW]: 'GET'
            },
            includeErrorDetails: true
        }
    ),
    
    /**
     * HTTP 400 Bad Request response fixture for testing request validation.
     * Provides standard bad request error response for testing input validation
     * and request parsing error handling scenarios.
     */
    badRequestResponse: createErrorResponse(
        HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
        ERROR_MESSAGES.BAD_REQUEST,
        {
            errorType: 'bad-request',
            includeErrorDetails: true
        }
    ),
    
    /**
     * HTTP 500 Internal Server Error response fixture for testing server error handling.
     * Provides standard server error response for testing server-side error scenarios
     * and error recovery mechanisms with proper server error indication.
     */
    internalServerErrorResponse: createErrorResponse(
        HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        {
            errorType: 'internal-server-error',
            includeErrorDetails: true
        }
    )
};

/**
 * Collection of success response fixtures for testing successful operations and validation.
 * Provides various success response scenarios for testing successful operation handling,
 * response formatting, and success response validation with different content types.
 */
const SUCCESS_RESPONSES = {
    /**
     * HTTP 200 OK response fixture with standard OK message for basic success testing.
     * Provides fundamental success response with minimal content for testing
     * basic success scenarios and response validation.
     */
    okResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: RESPONSE_MESSAGES.OK,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(RESPONSE_MESSAGES.OK, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME
        }
    }),
    
    /**
     * Success response fixture with success message for operation completion testing.
     * Provides success response with success-specific content for testing
     * operation completion and success response handling scenarios.
     */
    successResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: RESPONSE_MESSAGES.SUCCESS,
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.CONTENT_LENGTH]: Buffer.byteLength(RESPONSE_MESSAGES.SUCCESS, 'utf8').toString(),
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME,
            'x-operation-status': 'success'
        }
    }),
    
    /**
     * Completed response fixture for testing operation completion scenarios.
     * Provides response indicating completed operations with completion metadata
     * for testing operation lifecycle and completion handling.
     */
    completedResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: 'Operation completed successfully',
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.CONTENT_LENGTH]: '32', // Exact byte count
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME,
            'x-operation-status': 'completed',
            'x-completion-time': new Date().toISOString()
        }
    })
};

/**
 * Collection of malformed response fixtures for testing response validation and error handling.
 * Provides intentionally malformed response objects for testing validation logic, error
 * boundary handling, and response structure validation with various malformation patterns.
 */
const MALFORMED_RESPONSES = {
    /**
     * Response fixture with missing required headers for header validation testing.
     * Intentionally omits required headers to test header validation logic
     * and response structure validation requirements.
     */
    missingHeadersResponse: createMalformedResponse('missing-headers', {
        severity: 'high',
        includeRecoveryInfo: true
    }),
    
    /**
     * Response fixture with invalid HTTP status code for status validation testing.
     * Uses invalid status code to test status code validation and error
     * handling for malformed status code scenarios.
     */
    invalidStatusCodeResponse: createMalformedResponse('invalid-status', {
        severity: 'high',
        includeRecoveryInfo: false
    }),
    
    /**
     * Response fixture with malformed header structure for header parsing testing.
     * Includes malformed headers to test header parsing logic and validation
     * error handling for invalid header structure scenarios.
     */
    malformedHeadersResponse: createMalformedResponse('malformed-headers', {
        severity: 'medium',
        includeRecoveryInfo: true
    }),
    
    /**
     * Response fixture with incorrect content-length for content validation testing.
     * Provides mismatched content-length header for testing content validation
     * and content-length header verification logic.
     */
    invalidContentLengthResponse: createMalformedResponse('invalid-content-length', {
        severity: 'medium',
        includeRecoveryInfo: true
    })
};

/**
 * Collection of security test response fixtures for testing security validation and vulnerability detection.
 * Provides response fixtures with intentional security vulnerabilities for testing security
 * validation logic, vulnerability detection, and security response handling scenarios.
 */
const SECURITY_TEST_RESPONSES = {
    /**
     * Response fixture with header injection vulnerability for security validation testing.
     * Includes header injection patterns to test security validation and injection
     * prevention mechanisms with realistic attack vector simulation.
     */
    headerInjectionResponse: createSecurityTestResponse('header-injection', {
        payload: 'test\r\nInjected-Header: malicious',
        includeBypass: true
    }),
    
    /**
     * Response fixture with information disclosure for security testing scenarios.
     * Exposes sensitive server information to test information disclosure detection
     * and security validation for sensitive data exposure prevention.
     */
    informationDisclosureResponse: createSecurityTestResponse('information-disclosure', {
        payload: 'Server version: Node.js/22.0.0',
        includeBypass: false
    }),
    
    /**
     * Response fixture with XSS vulnerability pattern for cross-site scripting testing.
     * Includes XSS payload to test XSS detection and prevention mechanisms
     * with realistic cross-site scripting attack simulation.
     */
    xssVulnerabilityResponse: createSecurityTestResponse('xss-vulnerability', {
        payload: '<script>alert("XSS Test")</script>',
        includeBypass: true
    }),
    
    /**
     * Response fixture with MIME confusion vulnerability for MIME type testing.
     * Tests MIME type confusion attacks and content type validation
     * with missing security headers and improper content type handling.
     */
    mimeConfusionResponse: createSecurityTestResponse('mime-confusion', {
        payload: '<!DOCTYPE html><script>alert("MIME")</script>',
        includeBypass: false
    })
};

/**
 * Collection of edge case response fixtures for boundary and stress testing.
 * Provides response fixtures for testing edge cases, boundary conditions,
 * and stress testing scenarios with various content sizes and formats.
 */
const EDGE_CASE_RESPONSES = {
    /**
     * Response fixture with empty content for boundary condition testing.
     * Provides zero-length content response for testing empty content handling
     * and boundary condition validation with minimal response structure.
     */
    emptyContentResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: '',
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.CONTENT_LENGTH]: '0',
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME
        }
    }),
    
    /**
     * Response fixture with maximum content size for stress testing scenarios.
     * Provides large content response for testing content size limits and
     * stress testing with maximum allowable response content size.
     */
    maxContentResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: 'Large Content: ' + 'A'.repeat(1000),
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.TEXT_PLAIN,
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME
        }
    }),
    
    /**
     * Response fixture with Unicode content for character encoding testing.
     * Provides Unicode and international character content for testing
     * character encoding handling and Unicode content validation.
     */
    unicodeContentResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: 'Hello 世界 🌍 Мир 🌎 नमस्ते',
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: 'text/plain; charset=utf-8',
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME
        }
    }),
    
    /**
     * Response fixture with binary content for binary data handling testing.
     * Provides binary content response for testing binary data handling
     * and content type validation with non-text content scenarios.
     */
    binaryContentResponse: createMockHttpResponse({
        statusCode: HTTP_STATUS_CODES.SUCCESS.OK,
        content: Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]).toString('binary'),
        headers: {
            [HTTP_HEADERS.CONTENT_TYPE]: 'application/octet-stream',
            [HTTP_HEADERS.DATE]: new Date().toUTCString(),
            [HTTP_HEADERS.SERVER]: TEST_SERVER_NAME,
            'x-content-encoding': 'binary'
        }
    })
};

// ============================================================================
// COMPREHENSIVE RESPONSE FIXTURE COLLECTION
// ============================================================================

/**
 * Complete collection of all response fixtures organized by category for comprehensive testing.
 * Provides centralized access to all response fixture categories with organized structure
 * for easy test data access and comprehensive testing framework integration.
 */
const ALL_RESPONSE_FIXTURES = {
    /**
     * Valid response fixtures for successful operation testing and validation.
     * Contains all valid response scenarios including hello endpoint responses
     * and successful operation responses for comprehensive success testing.
     */
    valid: VALID_HELLO_RESPONSES,
    
    /**
     * Error response fixtures for error handling testing and validation.
     * Contains all error response scenarios including client errors and server errors
     * for comprehensive error handling and validation testing scenarios.
     */
    errors: ERROR_RESPONSES,
    
    /**
     * Success response fixtures for successful operation testing and validation.
     * Contains various success response scenarios for testing different success
     * conditions and successful operation handling across test scenarios.
     */
    success: SUCCESS_RESPONSES,
    
    /**
     * Malformed response fixtures for validation error testing and boundary testing.
     * Contains intentionally malformed responses for testing validation logic,
     * error boundary handling, and response structure validation requirements.
     */
    malformed: MALFORMED_RESPONSES,
    
    /**
     * Security test response fixtures for security validation and vulnerability testing.
     * Contains responses with security vulnerabilities for testing security validation,
     * vulnerability detection, and security response handling mechanisms.
     */
    security: SECURITY_TEST_RESPONSES,
    
    /**
     * Edge case response fixtures for boundary condition and stress testing.
     * Contains edge case scenarios including empty content, large content,
     * Unicode content, and binary content for comprehensive boundary testing.
     */
    edgeCases: EDGE_CASE_RESPONSES,
    
    /**
     * Metadata for complete fixture collection with statistics and correlation information.
     * Provides comprehensive metadata about the fixture collection including generation
     * statistics, correlation tracking, and fixture collection management information.
     */
    metadata: {
        totalCategories: 6,
        totalFixtures: Object.keys(VALID_HELLO_RESPONSES).length + 
                       Object.keys(ERROR_RESPONSES).length + 
                       Object.keys(SUCCESS_RESPONSES).length + 
                       Object.keys(MALFORMED_RESPONSES).length + 
                       Object.keys(SECURITY_TEST_RESPONSES).length + 
                       Object.keys(EDGE_CASE_RESPONSES).length,
        generatedAt: new Date().toISOString(),
        collectionId: `${RESPONSE_FIXTURE_PREFIX}all-fixtures-${crypto.randomUUID()}`,
        version: '1.0.0',
        
        // Category statistics for fixture collection analysis
        categoryStats: {
            valid: Object.keys(VALID_HELLO_RESPONSES).length,
            errors: Object.keys(ERROR_RESPONSES).length,
            success: Object.keys(SUCCESS_RESPONSES).length,
            malformed: Object.keys(MALFORMED_RESPONSES).length,
            security: Object.keys(SECURITY_TEST_RESPONSES).length,
            edgeCases: Object.keys(EDGE_CASE_RESPONSES).length
        }
    }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export collection of valid HTTP response fixtures for hello endpoint success testing
export { VALID_HELLO_RESPONSES };

// Export collection of error response fixtures for testing error handling and validation
export { ERROR_RESPONSES };

// Export collection of success response fixtures for testing successful operations and validation
export { SUCCESS_RESPONSES };

// Export collection of malformed response fixtures for testing response validation and error handling
export { MALFORMED_RESPONSES };

// Export collection of security test response fixtures for testing security validation and vulnerability detection
export { SECURITY_TEST_RESPONSES };

// Export collection of edge case response fixtures for boundary and stress testing
export { EDGE_CASE_RESPONSES };

// Export embedded factory function for creating mock HTTP response objects with Node.js ServerResponse compatibility
export { createMockHttpResponse };

// Export factory function for creating valid hello endpoint response fixtures using embedded mock functionality
export { createValidHelloResponse };

// Export factory function for creating error response fixtures using embedded mock functionality
export { createErrorResponse };

// Export factory function for creating malformed response fixtures using embedded mock functionality
export { createMalformedResponse };

// Export factory function for creating security test response fixtures using embedded mock functionality
export { createSecurityTestResponse };

// Export function for generating comprehensive test suites with all response categories
export { generateResponseTestSuite };

// Export embedded mock HTTP response class for creating Node.js ServerResponse-compatible test objects
export { MockHttpResponse };

// Export response fixture generator class for dynamic test data creation using embedded mock functionality
export { ResponseFixtureGenerator };

// Export complete collection of all response fixtures organized by category for comprehensive testing
export { ALL_RESPONSE_FIXTURES };

// Export global constants for response fixture configuration and identification
export {
    DEFAULT_RESPONSE_TIMESTAMP,
    TEST_SERVER_NAME,
    DEFAULT_HELLO_CONTENT,
    HELLO_CONTENT_LENGTH,
    RESPONSE_FIXTURE_PREFIX,
    MAX_RESPONSE_CONTENT_SIZE
};

// Default export for convenient access to complete response fixture functionality
export default ALL_RESPONSE_FIXTURES;