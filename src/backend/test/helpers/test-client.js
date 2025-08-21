/**
 * HTTP Test Client Utility Module for Node.js Tutorial Application
 * 
 * Provides comprehensive HTTP client functionality for testing the Node.js tutorial application
 * with test-specific HTTP client capabilities, request correlation, response validation, performance
 * measurement, and comprehensive error testing support. Enables unit tests, integration tests, and
 * end-to-end tests with standardized HTTP request execution, response validation, and test result
 * correlation for educational testing patterns and production-ready HTTP client testing utilities.
 * 
 * This module implements:
 * - Comprehensive HTTP client with support for all HTTP methods (GET, POST, PUT, DELETE)
 * - Request correlation and tracking for debugging and test result correlation
 * - Performance measurement with high-precision timing and response time validation
 * - Response validation with status code, header, content, and performance validation
 * - Error scenario testing with comprehensive error validation and security testing
 * - Load testing capabilities with concurrent request execution and performance monitoring
 * - Fluent request builder pattern with method chaining and comprehensive configuration
 * - Integration with TestServer for coordinated testing environments
 * - Educational patterns demonstrating production-ready HTTP client implementation
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive HTTP client implementation using Node.js built-in modules
 * - Shows proper request correlation and tracking patterns for debugging and monitoring
 * - Illustrates performance measurement and validation techniques for HTTP clients
 * - Provides examples of comprehensive response validation and error handling
 * - Shows integration patterns between HTTP clients and test server management
 * - Demonstrates production-ready testing utilities and educational testing approaches
 * 
 * @fileoverview HTTP test client with comprehensive testing capabilities and validation utilities
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Node.js built-in modules for HTTP client functionality
import http from 'node:http'; // Node.js v22.x - Built-in HTTP client module for HTTP request execution
import url from 'node:url'; // Node.js v22.x - Built-in URL module for URL parsing and construction
import querystring from 'node:querystring'; // Node.js v22.x - Built-in querystring module for query parameter handling
import util from 'node:util'; // Node.js v22.x - Built-in utilities for promisification and object inspection

// Internal modules for test server coordination and management
import { 
    TestServer 
} from './test-server.js';

// Test utilities from test-server.js (actual location of utilities)
import { 
    generateTestId as generateCorrelationId,
    TestTimer,
    retry,
    sleep
} from './test-server.js';

// HTTP status code constants and validation utilities
import { 
    HTTP_STATUS_CODES,
    isSuccessStatus,
    isClientError
} from '../../utils/http-status.js';

// HTTP method constants and validation
import { 
    HTTP_METHODS 
} from '../../constants/http-methods.js';

// HTTP header constants and content types
import { 
    HTTP_HEADERS,
    CONTENT_TYPES 
} from '../../constants/http-headers.js';

// Test request fixtures and mock data
import {
    createValidHelloRequest,
    INVALID_METHOD_REQUESTS,
    INVALID_PATH_REQUESTS
} from '../fixtures/request-data.js';

// Logger for HTTP client operations and debugging
import { 
    Logger 
} from '../../utils/logger.js';

// ============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Default request timeout in milliseconds for HTTP client operations
 * @type {number}
 */
const DEFAULT_REQUEST_TIMEOUT = 5000;

/**
 * Default User-Agent string for test client identification
 * @type {string}
 */
const DEFAULT_USER_AGENT = 'Node.js Tutorial Test Client/1.0.0';

/**
 * Maximum number of retry attempts for failed requests
 * @type {number}
 */
const MAX_RETRIES = 3;

/**
 * Base delay in milliseconds for exponential backoff retry logic
 * @type {number}
 */
const RETRY_DELAY_BASE = 100;

/**
 * Default host for HTTP client connections
 * @type {string}
 */
const DEFAULT_HOST = 'localhost';

/**
 * Default port for HTTP client connections
 * @type {number}
 */
const DEFAULT_PORT = 3000;

/**
 * Performance threshold for response time validation in milliseconds
 * @type {number}
 */
const PERFORMANCE_THRESHOLD_MS = 100;

/**
 * Default HTTP version for client requests
 * @type {string}
 */
const DEFAULT_HTTP_VERSION = '1.1';

/**
 * Maximum response body size for memory protection (10MB)
 * @type {number}
 */
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

/**
 * Default HTTP headers for test client requests
 * @type {Object}
 */
const DEFAULT_CLIENT_HEADERS = {
    [HTTP_HEADERS.USER_AGENT]: DEFAULT_USER_AGENT,
    [HTTP_HEADERS.ACCEPT]: '*/*',
    [HTTP_HEADERS.CONNECTION]: 'keep-alive'
};

// ============================================================================
// UTILITY FUNCTIONS FOR HTTP CLIENT OPERATIONS
// ============================================================================

/**
 * Measures performance of asynchronous operations with high-precision timing for
 * request performance validation and monitoring. Provides comprehensive performance
 * measurement capabilities for HTTP request execution and validation.
 * 
 * @param {Function} asyncOperation - Async function to measure performance
 * @param {Object} [options={}] - Performance measurement options
 * @returns {Promise<Object>} Promise resolving to operation result with performance metrics
 */
async function measurePerformance(asyncOperation, options = {}) {
    try {
        // Create high-precision timer for performance measurement
        const timer = new TestTimer();
        
        // Include memory measurement if requested
        const startMemory = options.includeMemory ? process.memoryUsage() : null;
        
        // Start performance timing
        timer.start();
        
        // Execute async operation with performance tracking
        const result = await asyncOperation();
        
        // Stop timing and calculate duration
        timer.stop();
        const duration = timer.getElapsed();
        
        // Calculate memory usage if requested
        const endMemory = options.includeMemory ? process.memoryUsage() : null;
        const memoryDelta = startMemory && endMemory ? {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            heapTotal: endMemory.heapTotal - startMemory.heapTotal
        } : null;
        
        // Return result with comprehensive performance metrics
        return {
            result,
            performance: {
                duration,
                startTime: timer.startTime,
                endTime: timer.endTime,
                memoryUsage: memoryDelta,
                isSlowOperation: duration > (options.slowThreshold || PERFORMANCE_THRESHOLD_MS)
            }
        };
        
    } catch (error) {
        // Return error result with timing information
        return {
            result: null,
            error: error,
            performance: {
                duration: 0,
                failed: true,
                errorMessage: error.message
            }
        };
    }
}

/**
 * Creates HTTP client configuration object with defaults and validation for
 * HTTP test client initialization. Validates configuration options and applies
 * appropriate defaults for testing environments.
 * 
 * @param {Object} clientOptions - Configuration options for HTTP client
 * @param {string} [clientOptions.host] - Target host for HTTP requests
 * @param {number} [clientOptions.port] - Target port for HTTP requests
 * @param {number} [clientOptions.timeout] - Request timeout in milliseconds
 * @param {Object} [clientOptions.defaultHeaders] - Default headers for all requests
 * @returns {Object} Validated HTTP client configuration with applied defaults
 */
function createClientConfiguration(clientOptions = {}) {
    try {
        // Extract and validate basic connection parameters
        const host = clientOptions.host || DEFAULT_HOST;
        const port = clientOptions.port || DEFAULT_PORT;
        const timeout = clientOptions.timeout || DEFAULT_REQUEST_TIMEOUT;
        
        // Validate host parameter format
        if (typeof host !== 'string' || host.trim().length === 0) {
            throw new Error('Invalid host parameter: must be a non-empty string');
        }
        
        // Validate port parameter range
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
            throw new Error('Invalid port parameter: must be an integer between 1 and 65535');
        }
        
        // Validate timeout parameter
        if (!Number.isInteger(timeout) || timeout < 100) {
            throw new Error('Invalid timeout parameter: must be an integer >= 100ms');
        }
        
        // Merge default headers with provided headers
        const defaultHeaders = {
            ...DEFAULT_CLIENT_HEADERS,
            [HTTP_HEADERS.HOST]: `${host}:${port}`,
            ...clientOptions.defaultHeaders
        };
        
        // Create validated configuration object
        const config = {
            host,
            port,
            timeout,
            defaultHeaders,
            userAgent: clientOptions.userAgent || DEFAULT_USER_AGENT,
            maxRetries: clientOptions.maxRetries || MAX_RETRIES,
            retryDelay: clientOptions.retryDelay || RETRY_DELAY_BASE,
            enablePerformanceTracking: clientOptions.enablePerformanceTracking !== false,
            enableRequestLogging: clientOptions.enableRequestLogging !== false,
            maxResponseSize: clientOptions.maxResponseSize || MAX_RESPONSE_SIZE
        };
        
        return config;
        
    } catch (error) {
        // Return default configuration if validation fails
        return {
            host: DEFAULT_HOST,
            port: DEFAULT_PORT,
            timeout: DEFAULT_REQUEST_TIMEOUT,
            defaultHeaders: DEFAULT_CLIENT_HEADERS,
            userAgent: DEFAULT_USER_AGENT,
            maxRetries: MAX_RETRIES,
            retryDelay: RETRY_DELAY_BASE,
            enablePerformanceTracking: true,
            enableRequestLogging: true,
            maxResponseSize: MAX_RESPONSE_SIZE,
            configurationError: error.message
        };
    }
}

/**
 * Executes HTTP request with comprehensive error handling and response processing.
 * Provides low-level HTTP request execution with timeout handling, error management,
 * and response data collection for comprehensive HTTP client functionality.
 * 
 * @param {Object} requestOptions - HTTP request configuration options
 * @param {string} requestOptions.method - HTTP method for the request
 * @param {string} requestOptions.hostname - Target hostname
 * @param {number} requestOptions.port - Target port
 * @param {string} requestOptions.path - Request path
 * @param {Object} requestOptions.headers - Request headers
 * @param {number} requestOptions.timeout - Request timeout
 * @param {string|Buffer} [requestBody] - Request body for POST/PUT requests
 * @returns {Promise<Object>} Promise resolving to HTTP response with comprehensive data
 */
function executeHttpRequest(requestOptions, requestBody = null) {
    return new Promise((resolve, reject) => {
        try {
            // Create HTTP request using Node.js http module
            const request = http.request(requestOptions, (response) => {
                try {
                    // Initialize response data collection
                    let responseBody = '';
                    let bodySize = 0;
                    
                    // Set response encoding for text data
                    response.setEncoding('utf8');
                    
                    // Collect response data chunks with size tracking
                    response.on('data', (chunk) => {
                        bodySize += chunk.length;
                        
                        // Protect against oversized responses
                        if (bodySize > requestOptions.maxResponseSize || MAX_RESPONSE_SIZE) {
                            response.destroy();
                            reject(new Error(`Response size exceeds maximum allowed size: ${MAX_RESPONSE_SIZE} bytes`));
                            return;
                        }
                        
                        responseBody += chunk;
                    });
                    
                    // Handle response completion
                    response.on('end', () => {
                        try {
                            // Create comprehensive response object
                            const responseData = {
                                statusCode: response.statusCode,
                                statusMessage: response.statusMessage,
                                headers: response.headers,
                                body: responseBody,
                                httpVersion: response.httpVersion,
                                complete: response.complete,
                                size: bodySize,
                                timestamp: new Date().toISOString()
                            };
                            
                            resolve(responseData);
                            
                        } catch (processingError) {
                            reject(new Error(`Response processing failed: ${processingError.message}`));
                        }
                    });
                    
                    // Handle response stream errors
                    response.on('error', (responseError) => {
                        reject(new Error(`Response stream error: ${responseError.message}`));
                    });
                    
                } catch (responseHandlingError) {
                    reject(new Error(`Response handling failed: ${responseHandlingError.message}`));
                }
            });
            
            // Set request timeout with proper cleanup
            request.setTimeout(requestOptions.timeout, () => {
                request.destroy();
                reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
            });
            
            // Handle request errors
            request.on('error', (requestError) => {
                reject(new Error(`Request failed: ${requestError.message}`));
            });
            
            // Send request body if provided for POST/PUT requests
            if (requestBody) {
                request.write(requestBody);
            }
            
            // Complete the HTTP request
            request.end();
            
        } catch (error) {
            reject(new Error(`Request execution failed: ${error.message}`));
        }
    });
}

// ============================================================================
// HTTP TEST CLIENT CLASS IMPLEMENTATION
// ============================================================================

/**
 * Comprehensive HTTP test client class providing HTTP request functionality with correlation
 * tracking, performance measurement, response validation, and comprehensive error handling for
 * testing the Node.js tutorial application with educational patterns and production-ready HTTP
 * client capabilities.
 * 
 * This class provides:
 * - HTTP request methods for all standard HTTP verbs (GET, POST, PUT, DELETE)
 * - Request correlation and tracking for debugging and test result correlation
 * - Performance measurement with high-precision timing and validation
 * - Response validation with comprehensive status, header, and content validation
 * - Error scenario testing with detailed error analysis and validation
 * - Load testing capabilities with concurrent request execution and monitoring
 * - Integration with TestServer for coordinated testing environments
 * - Educational patterns demonstrating enterprise HTTP client implementation
 */
class HttpTestClient {
    /**
     * Initializes HTTP test client with configuration, performance tracking, and request
     * correlation for comprehensive HTTP testing capabilities.
     * 
     * @param {Object} config - Client configuration options
     * @param {string} [config.host='localhost'] - Target host for HTTP requests
     * @param {number} [config.port=3000] - Target port for HTTP requests
     * @param {number} [config.timeout=5000] - Request timeout in milliseconds
     * @param {Object} [config.defaultHeaders] - Default headers for all requests
     * @param {Logger} [config.logger] - Logger instance for request/response logging
     */
    constructor(config = {}) {
        try {
            // Validate and apply client configuration with defaults
            const clientConfig = createClientConfiguration(config);
            
            // Set host and port from configuration with defaults to localhost:3000
            this.host = clientConfig.host;
            this.port = clientConfig.port;
            
            // Configure request timeout and retry settings for stable test execution
            this.timeout = clientConfig.timeout;
            this.maxRetries = clientConfig.maxRetries;
            this.retryDelay = clientConfig.retryDelay;
            
            // Initialize default headers including User-Agent and Accept headers
            this.defaultHeaders = { ...clientConfig.defaultHeaders };
            
            // Set up logger for HTTP request and response tracking and debugging
            this.logger = config.logger || new Logger();
            
            // Initialize performance tracker for request timing and measurement
            this.performanceTracker = {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: Infinity,
                responseTimes: []
            };
            
            // Set user agent for client identification
            this.userAgent = clientConfig.userAgent;
            
            // Configure correlation tracking for request/response debugging
            this.correlationTracking = new Map();
            
            // Set up error handling and retry logic for unstable network conditions
            this.errorStats = {
                timeoutErrors: 0,
                connectionErrors: 0,
                responseErrors: 0,
                totalErrors: 0
            };
            
            // Initialize client state tracking
            this.isConnected = false;
            this.activeRequests = new Set();
            this.maxResponseSize = clientConfig.maxResponseSize;
            
            // Log client initialization for debugging
            this.logger.debug('HttpTestClient initialized', {
                host: this.host,
                port: this.port,
                timeout: this.timeout,
                userAgent: this.userAgent
            });
            
        } catch (error) {
            // Initialize with safe defaults if configuration fails
            this.host = DEFAULT_HOST;
            this.port = DEFAULT_PORT;
            this.timeout = DEFAULT_REQUEST_TIMEOUT;
            this.defaultHeaders = { ...DEFAULT_CLIENT_HEADERS };
            this.logger = new Logger();
            this.performanceTracker = { totalRequests: 0, successfulRequests: 0, failedRequests: 0 };
            this.userAgent = DEFAULT_USER_AGENT;
            this.correlationTracking = new Map();
            this.errorStats = { timeoutErrors: 0, connectionErrors: 0, responseErrors: 0, totalErrors: 0 };
            this.isConnected = false;
            this.activeRequests = new Set();
            this.maxResponseSize = MAX_RESPONSE_SIZE;
            
            this.logger.error('HttpTestClient initialization failed, using defaults', {}, error);
        }
    }
    
    /**
     * Makes HTTP GET request to specified path with comprehensive validation, timing,
     * and correlation tracking.
     * 
     * @param {string} path - Request path for GET operation
     * @param {Object} [options={}] - Additional options for GET request
     * @param {Object} [options.headers] - Additional headers for the request
     * @param {number} [options.timeout] - Custom timeout for this request
     * @param {string} [options.correlationId] - Custom correlation ID for tracking
     * @returns {Promise<Object>} Promise resolving to HTTP response with validation metadata and performance metrics
     */
    async get(path, options = {}) {
        try {
            // Validate path parameter and merge options with default configuration
            const validatedPath = path || '/';
            const requestOptions = {
                ...options,
                method: HTTP_METHODS.GET,
                path: validatedPath
            };
            
            // Execute GET request using generic request method
            return await this.request(HTTP_METHODS.GET, validatedPath, requestOptions);
            
        } catch (error) {
            this.logger.error('GET request failed', { path, error: error.message }, error);
            throw new Error(`GET request to ${path} failed: ${error.message}`);
        }
    }
    
    /**
     * Makes HTTP POST request with request body, header management, and comprehensive
     * response validation.
     * 
     * @param {string} path - Request path for POST operation
     * @param {any} body - Request body data for POST operation
     * @param {Object} [options={}] - Additional options for POST request
     * @returns {Promise<Object>} Promise resolving to HTTP response with validation and correlation data
     */
    async post(path, body, options = {}) {
        try {
            // Validate path and body parameters with request options
            const validatedPath = path || '/';
            
            // Serialize request body and determine content type
            let requestBody = '';
            let contentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            
            if (body !== null && body !== undefined) {
                if (typeof body === 'object') {
                    // JSON serialization for object bodies
                    requestBody = JSON.stringify(body);
                    contentType = CONTENT_TYPES.APPLICATION_JSON_UTF8;
                } else {
                    // String conversion for primitive bodies
                    requestBody = body.toString();
                }
            }
            
            // Calculate Content-Length header for request body
            const contentLength = Buffer.byteLength(requestBody, 'utf8');
            
            // Merge headers with content-specific headers
            const postHeaders = {
                [HTTP_HEADERS.CONTENT_TYPE]: contentType,
                [HTTP_HEADERS.CONTENT_LENGTH]: contentLength.toString(),
                ...options.headers
            };
            
            // Create POST request configuration
            const requestOptions = {
                ...options,
                method: HTTP_METHODS.POST,
                path: validatedPath,
                headers: postHeaders,
                body: requestBody
            };
            
            // Execute POST request with body and header configuration
            return await this.request(HTTP_METHODS.POST, validatedPath, requestOptions);
            
        } catch (error) {
            this.logger.error('POST request failed', { path, error: error.message }, error);
            throw new Error(`POST request to ${path} failed: ${error.message}`);
        }
    }
    
    /**
     * Makes HTTP PUT request with comprehensive request handling and response validation
     * for method testing.
     * 
     * @param {string} path - Request path for PUT operation
     * @param {any} body - Request body data for PUT operation
     * @param {Object} [options={}] - Additional options for PUT request
     * @returns {Promise<Object>} Promise resolving to HTTP response for PUT method validation testing
     */
    async put(path, body, options = {}) {
        try {
            // Configure PUT request with body serialization and headers
            const validatedPath = path || '/';
            
            // Serialize request body similar to POST handling
            let requestBody = '';
            let contentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            
            if (body !== null && body !== undefined) {
                if (typeof body === 'object') {
                    requestBody = JSON.stringify(body);
                    contentType = CONTENT_TYPES.APPLICATION_JSON_UTF8;
                } else {
                    requestBody = body.toString();
                }
            }
            
            // Calculate content length and set appropriate headers
            const contentLength = Buffer.byteLength(requestBody, 'utf8');
            const putHeaders = {
                [HTTP_HEADERS.CONTENT_TYPE]: contentType,
                [HTTP_HEADERS.CONTENT_LENGTH]: contentLength.toString(),
                ...options.headers
            };
            
            // Create PUT request configuration
            const requestOptions = {
                ...options,
                method: HTTP_METHODS.PUT,
                path: validatedPath,
                headers: putHeaders,
                body: requestBody
            };
            
            // Execute PUT request for method validation testing scenarios
            const response = await this.request(HTTP_METHODS.PUT, validatedPath, requestOptions);
            
            // Validate 405 Method Not Allowed response for hello endpoint
            if (validatedPath === '/hello' && response.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
                this.logger.info('PUT method correctly rejected for /hello endpoint', {
                    path: validatedPath,
                    expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    actualStatus: response.statusCode
                });
            }
            
            // Return response object for method authorization testing
            return response;
            
        } catch (error) {
            this.logger.error('PUT request failed', { path, error: error.message }, error);
            throw new Error(`PUT request to ${path} failed: ${error.message}`);
        }
    }
    
    /**
     * Makes HTTP DELETE request for testing method restrictions and authorization validation.
     * 
     * @param {string} path - Request path for DELETE operation
     * @param {Object} [options={}] - Additional options for DELETE request
     * @returns {Promise<Object>} Promise resolving to HTTP response for DELETE method validation testing
     */
    async delete(path, options = {}) {
        try {
            // Configure DELETE request for method authorization testing
            const validatedPath = path || '/';
            
            // Create DELETE request configuration
            const requestOptions = {
                ...options,
                method: HTTP_METHODS.DELETE,
                path: validatedPath
            };
            
            // Execute DELETE request for endpoint method restriction validation
            const response = await this.request(HTTP_METHODS.DELETE, validatedPath, requestOptions);
            
            // Validate 405 Method Not Allowed response with proper Allow header
            if (validatedPath === '/hello' && response.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED) {
                this.logger.info('DELETE method correctly rejected for /hello endpoint', {
                    path: validatedPath,
                    expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                    actualStatus: response.statusCode,
                    allowHeader: response.headers['allow']
                });
            }
            
            // Return response object for method validation analysis
            return response;
            
        } catch (error) {
            this.logger.error('DELETE request failed', { path, error: error.message }, error);
            throw new Error(`DELETE request to ${path} failed: ${error.message}`);
        }
    }
    
    /**
     * Generic HTTP request method supporting all HTTP methods with comprehensive
     * configuration and validation.
     * 
     * @param {string} method - HTTP method for the request
     * @param {string} path - Request path
     * @param {Object} requestOptions - Request configuration options
     * @returns {Promise<Object>} Promise resolving to HTTP response with comprehensive validation and correlation data
     */
    async request(method, path, requestOptions = {}) {
        try {
            // Validate HTTP method using HTTP_METHODS constants and validation
            const validMethod = Object.values(HTTP_METHODS).includes(method.toUpperCase()) ? 
                method.toUpperCase() : HTTP_METHODS.GET;
            
            // Generate correlation ID and start performance timing
            const correlationId = requestOptions.correlationId || generateCorrelationId();
            const timer = new TestTimer();
            timer.start();
            
            // Track active request for cleanup management
            this.activeRequests.add(correlationId);
            
            // Configure request headers, body, and timeout settings
            const requestHeaders = {
                ...this.defaultHeaders,
                ...requestOptions.headers
            };
            
            // Create HTTP request configuration using Node.js http module
            const httpRequestOptions = {
                hostname: this.host,
                port: this.port,
                method: validMethod,
                path: path || '/',
                headers: requestHeaders,
                timeout: requestOptions.timeout || this.timeout,
                maxResponseSize: this.maxResponseSize
            };
            
            // Log request initiation for debugging and correlation
            this.logger.debug('Initiating HTTP request', {
                correlationId,
                method: validMethod,
                path: path,
                host: this.host,
                port: this.port
            });
            
            // Store correlation tracking data
            this.correlationTracking.set(correlationId, {
                method: validMethod,
                path: path,
                startTime: Date.now(),
                requestId: correlationId
            });
            
            // Handle request execution with error handling and timeout management
            let response;
            try {
                response = await executeHttpRequest(httpRequestOptions, requestOptions.body);
                this.performanceTracker.successfulRequests++;
            } catch (requestError) {
                this.performanceTracker.failedRequests++;
                this._updateErrorStats(requestError);
                throw requestError;
            } finally {
                // Clean up active request tracking
                this.activeRequests.delete(correlationId);
                timer.stop();
            }
            
            // Collect response data and calculate performance metrics
            const duration = timer.getElapsed();
            this._updatePerformanceStats(duration);
            
            // Validate response format and HTTP protocol compliance
            this._validateResponseStructure(response);
            
            // Create comprehensive response object with metadata and validation results
            const responseWithMetadata = {
                ...response,
                correlation: {
                    requestId: correlationId,
                    method: validMethod,
                    path: path,
                    requestTime: this.correlationTracking.get(correlationId)?.startTime,
                    responseTime: Date.now()
                },
                performance: {
                    duration,
                    startTime: timer.startTime,
                    endTime: timer.endTime,
                    isSlowResponse: duration > PERFORMANCE_THRESHOLD_MS
                },
                validation: {
                    statusValid: this._isValidStatusCode(response.statusCode),
                    headersValid: this._validateHeaders(response.headers),
                    performanceValid: duration <= PERFORMANCE_THRESHOLD_MS
                }
            };
            
            // Log response completion with performance metrics
            this.logger.info('HTTP request completed', {
                correlationId,
                statusCode: response.statusCode,
                duration: `${duration}ms`,
                size: response.size
            });
            
            // Clean up correlation tracking
            this.correlationTracking.delete(correlationId);
            
            // Update total request counter
            this.performanceTracker.totalRequests++;
            
            // Return complete response object with metadata and validation results
            return responseWithMetadata;
            
        } catch (error) {
            this.logger.error('HTTP request failed', { method, path, error: error.message }, error);
            throw new Error(`HTTP ${method} request to ${path} failed: ${error.message}`);
        }
    }
    
    /**
     * Specialized method for testing /hello endpoint with comprehensive validation of status,
     * content, headers, and performance.
     * 
     * @param {Object} [testOptions={}] - Options for hello endpoint testing
     * @returns {Promise<Object>} Promise resolving to hello endpoint test results with comprehensive validation status
     */
    async testHelloEndpoint(testOptions = {}) {
        try {
            // Configure hello endpoint test with correlation and performance tracking
            const correlationId = testOptions.correlationId || generateCorrelationId();
            const timer = new TestTimer();
            
            this.logger.info('Starting hello endpoint test', { correlationId });
            timer.start();
            
            // Make GET request to /hello endpoint using valid request fixture
            const response = await this.get('/hello', {
                correlationId,
                timeout: testOptions.timeout || this.timeout,
                headers: testOptions.headers
            });
            
            timer.stop();
            const duration = timer.getElapsed();
            
            // Create comprehensive validation results object
            const validationResults = {
                correlationId,
                testStartTime: timer.startTime,
                testEndTime: timer.endTime,
                duration,
                success: true,
                failures: []
            };
            
            // Validate response status is 200 OK using HTTP_STATUS_CODES
            if (response.statusCode !== HTTP_STATUS_CODES.SUCCESS.OK) {
                validationResults.success = false;
                validationResults.failures.push({
                    type: 'status_code',
                    expected: HTTP_STATUS_CODES.SUCCESS.OK,
                    actual: response.statusCode,
                    message: 'Status code validation failed'
                });
            }
            
            // Validate response body contains exact 'Hello world' message
            if (response.body.trim() !== 'Hello world') {
                validationResults.success = false;
                validationResults.failures.push({
                    type: 'response_body',
                    expected: 'Hello world',
                    actual: response.body.trim(),
                    message: 'Response body validation failed'
                });
            }
            
            // Validate response headers include Content-Type: text/plain; charset=utf-8
            const expectedContentType = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            if (response.headers[HTTP_HEADERS.CONTENT_TYPE] !== expectedContentType) {
                validationResults.success = false;
                validationResults.failures.push({
                    type: 'content_type',
                    expected: expectedContentType,
                    actual: response.headers[HTTP_HEADERS.CONTENT_TYPE],
                    message: 'Content-Type header validation failed'
                });
            }
            
            // Measure response time and validate against performance threshold (<100ms)
            if (duration > PERFORMANCE_THRESHOLD_MS) {
                validationResults.success = false;
                validationResults.failures.push({
                    type: 'performance',
                    expected: `<${PERFORMANCE_THRESHOLD_MS}ms`,
                    actual: `${duration}ms`,
                    message: 'Performance threshold exceeded'
                });
            }
            
            // Add response validation metadata
            validationResults.response = {
                statusCode: response.statusCode,
                headers: response.headers,
                body: response.body,
                size: response.size,
                httpVersion: response.httpVersion
            };
            
            // Log test completion with results
            if (validationResults.success) {
                this.logger.info('Hello endpoint test passed', {
                    correlationId,
                    duration: `${duration}ms`,
                    validations: 'all_passed'
                });
            } else {
                this.logger.warn('Hello endpoint test failed', {
                    correlationId,
                    failures: validationResults.failures.map(f => f.type)
                });
            }
            
            // Return comprehensive test results with validation details and performance metrics
            return validationResults;
            
        } catch (error) {
            this.logger.error('Hello endpoint test failed', { error: error.message }, error);
            throw new Error(`Hello endpoint test failed: ${error.message}`);
        }
    }
    
    /**
     * Tests comprehensive error scenarios including invalid methods, paths, and malformed
     * requests with detailed error validation.
     * 
     * @param {Object} [errorTestOptions={}] - Options for error scenario testing
     * @returns {Promise<Object>} Promise resolving to error scenario test results with error validation and analysis
     */
    async testErrorScenarios(errorTestOptions = {}) {
        try {
            // Configure error test scenarios using invalid method and path request fixtures
            const correlationId = errorTestOptions.correlationId || generateCorrelationId();
            const timer = new TestTimer();
            
            this.logger.info('Starting error scenario tests', { correlationId });
            timer.start();
            
            const errorTestResults = {
                correlationId,
                testStartTime: timer.startTime,
                overallSuccess: true,
                testResults: {},
                summary: {
                    totalTests: 0,
                    passedTests: 0,
                    failedTests: 0
                }
            };
            
            // Test 405 Method Not Allowed responses for unsupported methods using INVALID_METHOD_REQUESTS
            const methodTests = ['POST', 'PUT', 'DELETE'];
            for (const method of methodTests) {
                try {
                    const response = await this.request(method, '/hello', { correlationId: `${correlationId}-method-${method}` });
                    
                    const methodTestResult = {
                        method,
                        success: response.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                        expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED,
                        actualStatus: response.statusCode,
                        hasAllowHeader: response.headers.hasOwnProperty('allow'),
                        allowHeaderValue: response.headers['allow']
                    };
                    
                    errorTestResults.testResults[`invalidMethod_${method}`] = methodTestResult;
                    errorTestResults.summary.totalTests++;
                    
                    if (methodTestResult.success) {
                        errorTestResults.summary.passedTests++;
                    } else {
                        errorTestResults.summary.failedTests++;
                        errorTestResults.overallSuccess = false;
                    }
                    
                } catch (methodError) {
                    errorTestResults.testResults[`invalidMethod_${method}`] = {
                        method,
                        success: false,
                        error: methodError.message
                    };
                    errorTestResults.summary.totalTests++;
                    errorTestResults.summary.failedTests++;
                    errorTestResults.overallSuccess = false;
                }
            }
            
            // Test 404 Not Found responses for invalid paths using INVALID_PATH_REQUESTS
            const pathTests = ['/', '/api/users', '/nonexistent', '//malformed'];
            for (const testPath of pathTests) {
                try {
                    const response = await this.get(testPath, { correlationId: `${correlationId}-path-${encodeURIComponent(testPath)}` });
                    
                    const pathTestResult = {
                        path: testPath,
                        success: response.statusCode === HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                        expectedStatus: HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
                        actualStatus: response.statusCode,
                        responseBody: response.body
                    };
                    
                    errorTestResults.testResults[`invalidPath_${testPath.replace(/\//g, '_')}`] = pathTestResult;
                    errorTestResults.summary.totalTests++;
                    
                    if (pathTestResult.success) {
                        errorTestResults.summary.passedTests++;
                    } else {
                        errorTestResults.summary.failedTests++;
                        errorTestResults.overallSuccess = false;
                    }
                    
                } catch (pathError) {
                    errorTestResults.testResults[`invalidPath_${testPath.replace(/\//g, '_')}`] = {
                        path: testPath,
                        success: false,
                        error: pathError.message
                    };
                    errorTestResults.summary.totalTests++;
                    errorTestResults.summary.failedTests++;
                    errorTestResults.overallSuccess = false;
                }
            }
            
            // Validate error response headers include appropriate Allow headers for 405 responses
            // Verify error responses do not expose sensitive server information
            const securityValidation = {
                noServerHeaderExposure: true,
                noStackTraceExposure: true,
                appropriateErrorMessages: true
            };
            
            // Check for security issues in error responses
            Object.values(errorTestResults.testResults).forEach(testResult => {
                if (testResult.responseBody) {
                    // Check for server information exposure
                    if (testResult.responseBody.toLowerCase().includes('node.js') || 
                        testResult.responseBody.toLowerCase().includes('express') ||
                        testResult.responseBody.includes('Error:')) {
                        securityValidation.noServerHeaderExposure = false;
                    }
                    
                    // Check for stack trace exposure
                    if (testResult.responseBody.includes('at ') || testResult.responseBody.includes('stack')) {
                        securityValidation.noStackTraceExposure = false;
                    }
                }
            });
            
            timer.stop();
            errorTestResults.testEndTime = timer.endTime;
            errorTestResults.totalDuration = timer.getElapsed();
            errorTestResults.securityValidation = securityValidation;
            
            // Log error test completion
            this.logger.info('Error scenario tests completed', {
                correlationId,
                overallSuccess: errorTestResults.overallSuccess,
                totalTests: errorTestResults.summary.totalTests,
                passedTests: errorTestResults.summary.passedTests,
                failedTests: errorTestResults.summary.failedTests,
                duration: `${errorTestResults.totalDuration}ms`
            });
            
            // Return comprehensive error test results with validation analysis
            return errorTestResults;
            
        } catch (error) {
            this.logger.error('Error scenario testing failed', { error: error.message }, error);
            throw new Error(`Error scenario testing failed: ${error.message}`);
        }
    }
    
    /**
     * Validates HTTP response against expected criteria with comprehensive status, header,
     * content, and performance validation.
     * 
     * @param {Object} response - HTTP response object to validate
     * @param {Object} validationCriteria - Validation criteria and expectations
     * @returns {Object} Validation result with success status, detailed validation results, and error information
     */
    validateResponse(response, validationCriteria = {}) {
        try {
            // Validate response object structure and required properties
            if (!response || typeof response !== 'object') {
                return {
                    success: false,
                    error: 'Invalid response object provided',
                    validationResults: {}
                };
            }
            
            const validationResults = {
                correlationId: validationCriteria.correlationId || generateCorrelationId(),
                validatedAt: new Date().toISOString(),
                success: true,
                validations: {},
                failures: []
            };
            
            // Check response status code against expected status using status validation utilities
            if (validationCriteria.expectedStatus) {
                const statusValid = response.statusCode === validationCriteria.expectedStatus;
                validationResults.validations.status = {
                    valid: statusValid,
                    expected: validationCriteria.expectedStatus,
                    actual: response.statusCode,
                    category: isSuccessStatus(response.statusCode) ? 'success' : 
                             isClientError(response.statusCode) ? 'client_error' : 'server_error'
                };
                
                if (!statusValid) {
                    validationResults.success = false;
                    validationResults.failures.push('status_code_mismatch');
                }
            }
            
            // Validate response headers format and required headers presence
            if (validationCriteria.expectedHeaders) {
                const headerValidation = this._validateResponseHeaders(response.headers, validationCriteria.expectedHeaders);
                validationResults.validations.headers = headerValidation;
                
                if (!headerValidation.valid) {
                    validationResults.success = false;
                    validationResults.failures.push('header_validation_failed');
                }
            }
            
            // Validate response content against expected content and format
            if (validationCriteria.expectedContent !== undefined) {
                const contentValid = response.body === validationCriteria.expectedContent;
                validationResults.validations.content = {
                    valid: contentValid,
                    expected: validationCriteria.expectedContent,
                    actual: response.body,
                    size: response.size
                };
                
                if (!contentValid) {
                    validationResults.success = false;
                    validationResults.failures.push('content_mismatch');
                }
            }
            
            // Validate response timing against performance thresholds and requirements
            if (response.performance && validationCriteria.maxDuration) {
                const performanceValid = response.performance.duration <= validationCriteria.maxDuration;
                validationResults.validations.performance = {
                    valid: performanceValid,
                    duration: response.performance.duration,
                    threshold: validationCriteria.maxDuration,
                    withinThreshold: performanceValid
                };
                
                if (!performanceValid) {
                    validationResults.success = false;
                    validationResults.failures.push('performance_threshold_exceeded');
                }
            }
            
            // Check response correlation metadata and tracking information
            if (response.correlation) {
                validationResults.validations.correlation = {
                    present: true,
                    requestId: response.correlation.requestId,
                    method: response.correlation.method,
                    path: response.correlation.path
                };
            }
            
            // Log validation results
            this.logger.debug('Response validation completed', {
                correlationId: validationResults.correlationId,
                success: validationResults.success,
                failures: validationResults.failures
            });
            
            // Return comprehensive validation result with detailed analysis
            return validationResults;
            
        } catch (error) {
            this.logger.error('Response validation failed', { error: error.message }, error);
            return {
                success: false,
                error: `Response validation failed: ${error.message}`,
                validationResults: {}
            };
        }
    }
    
    /**
     * Performs performance benchmarking of HTTP endpoints with multiple requests and
     * statistical analysis.
     * 
     * @param {string} path - Endpoint path to benchmark
     * @param {Object} [benchmarkOptions={}] - Benchmark configuration options
     * @returns {Promise<Object>} Promise resolving to benchmark results with performance statistics and analysis
     */
    async performBenchmark(path, benchmarkOptions = {}) {
        try {
            // Configure benchmark test with request count and concurrency settings
            const requestCount = benchmarkOptions.requestCount || 10;
            const concurrency = benchmarkOptions.concurrency || 1;
            const method = benchmarkOptions.method || HTTP_METHODS.GET;
            const correlationId = benchmarkOptions.correlationId || generateCorrelationId();
            
            this.logger.info('Starting performance benchmark', {
                correlationId,
                path,
                requestCount,
                concurrency,
                method
            });
            
            const benchmarkResults = {
                correlationId,
                configuration: {
                    path,
                    method,
                    requestCount,
                    concurrency,
                    startTime: new Date().toISOString()
                },
                performance: {
                    durations: [],
                    statusCodes: [],
                    errors: []
                },
                statistics: {},
                success: true
            };
            
            // Execute multiple HTTP requests with performance timing
            const promises = [];
            const batchSize = Math.ceil(requestCount / concurrency);
            
            for (let batch = 0; batch < concurrency; batch++) {
                const batchPromise = this._executeBenchmarkBatch(
                    path, 
                    method, 
                    batchSize, 
                    `${correlationId}-batch-${batch}`
                );
                promises.push(batchPromise);
            }
            
            // Wait for all benchmark batches to complete
            const batchResults = await Promise.allSettled(promises);
            
            // Collect timing data for statistical analysis
            batchResults.forEach((batchResult, batchIndex) => {
                if (batchResult.status === 'fulfilled') {
                    const batch = batchResult.value;
                    benchmarkResults.performance.durations.push(...batch.durations);
                    benchmarkResults.performance.statusCodes.push(...batch.statusCodes);
                } else {
                    benchmarkResults.performance.errors.push({
                        batch: batchIndex,
                        error: batchResult.reason.message
                    });
                    benchmarkResults.success = false;
                }
            });
            
            // Calculate performance statistics including average, min, max, and percentiles
            const durations = benchmarkResults.performance.durations;
            if (durations.length > 0) {
                const sortedDurations = [...durations].sort((a, b) => a - b);
                const sum = durations.reduce((acc, duration) => acc + duration, 0);
                
                benchmarkResults.statistics = {
                    totalRequests: durations.length,
                    successfulRequests: benchmarkResults.performance.statusCodes.filter(code => isSuccessStatus(code)).length,
                    averageDuration: Math.round(sum / durations.length * 100) / 100,
                    minDuration: Math.min(...durations),
                    maxDuration: Math.max(...durations),
                    p50Duration: sortedDurations[Math.floor(sortedDurations.length * 0.5)],
                    p95Duration: sortedDurations[Math.floor(sortedDurations.length * 0.95)],
                    p99Duration: sortedDurations[Math.floor(sortedDurations.length * 0.99)],
                    requestsPerSecond: durations.length / (Math.max(...durations) / 1000),
                    errorRate: (benchmarkResults.performance.errors.length / durations.length * 100).toFixed(2)
                };
            }
            
            // Validate performance against expected thresholds
            if (benchmarkResults.statistics.averageDuration > PERFORMANCE_THRESHOLD_MS) {
                benchmarkResults.performanceWarning = `Average response time (${benchmarkResults.statistics.averageDuration}ms) exceeds threshold (${PERFORMANCE_THRESHOLD_MS}ms)`;
            }
            
            benchmarkResults.configuration.endTime = new Date().toISOString();
            benchmarkResults.configuration.totalDuration = new Date() - new Date(benchmarkResults.configuration.startTime);
            
            // Log benchmark completion
            this.logger.info('Performance benchmark completed', {
                correlationId,
                totalRequests: benchmarkResults.statistics.totalRequests,
                averageDuration: benchmarkResults.statistics.averageDuration,
                requestsPerSecond: benchmarkResults.statistics.requestsPerSecond
            });
            
            // Return benchmark results with statistical analysis and recommendations
            return benchmarkResults;
            
        } catch (error) {
            this.logger.error('Performance benchmark failed', { path, error: error.message }, error);
            throw new Error(`Performance benchmark for ${path} failed: ${error.message}`);
        }
    }
    
    /**
     * Closes HTTP client connections and cleans up resources for proper test isolation
     * and resource management.
     * 
     * @returns {Promise<void>} Promise resolving when client cleanup is complete
     */
    async close() {
        try {
            // Close active HTTP connections and agent pools
            if (this.httpAgent) {
                this.httpAgent.destroy();
            }
            
            // Wait for active requests to complete or timeout
            if (this.activeRequests.size > 0) {
                this.logger.debug('Waiting for active requests to complete', {
                    activeRequestCount: this.activeRequests.size
                });
                
                // Wait up to 5 seconds for active requests to complete
                const maxWaitTime = 5000;
                const startTime = Date.now();
                
                while (this.activeRequests.size > 0 && (Date.now() - startTime) < maxWaitTime) {
                    await sleep(100);
                }
                
                if (this.activeRequests.size > 0) {
                    this.logger.warn('Some requests did not complete before client shutdown', {
                        remainingRequests: this.activeRequests.size
                    });
                }
            }
            
            // Clean up performance tracking and correlation resources
            this.correlationTracking.clear();
            this.activeRequests.clear();
            
            // Clear request queues and pending operations
            this.performanceTracker.responseTimes = [];
            
            // Log client shutdown and resource cleanup completion
            this.logger.info('HttpTestClient closed successfully', {
                finalStats: {
                    totalRequests: this.performanceTracker.totalRequests,
                    successfulRequests: this.performanceTracker.successfulRequests,
                    failedRequests: this.performanceTracker.failedRequests,
                    averageResponseTime: this.performanceTracker.averageResponseTime
                }
            });
            
            // Mark client as disconnected
            this.isConnected = false;
            
        } catch (error) {
            this.logger.error('HttpTestClient close failed', { error: error.message }, error);
            throw new Error(`Client close failed: ${error.message}`);
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Updates performance statistics with new response time data
     * @private
     */
    _updatePerformanceStats(duration) {
        this.performanceTracker.responseTimes.push(duration);
        
        // Update min/max response times
        this.performanceTracker.maxResponseTime = Math.max(this.performanceTracker.maxResponseTime, duration);
        this.performanceTracker.minResponseTime = Math.min(this.performanceTracker.minResponseTime, duration);
        
        // Calculate rolling average response time
        const recentTimes = this.performanceTracker.responseTimes.slice(-100); // Keep last 100 for average
        this.performanceTracker.averageResponseTime = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
    }
    
    /**
     * Updates error statistics with error categorization
     * @private
     */
    _updateErrorStats(error) {
        this.errorStats.totalErrors++;
        
        if (error.message.includes('timeout')) {
            this.errorStats.timeoutErrors++;
        } else if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
            this.errorStats.connectionErrors++;
        } else {
            this.errorStats.responseErrors++;
        }
    }
    
    /**
     * Validates response structure for HTTP compliance
     * @private
     */
    _validateResponseStructure(response) {
        const requiredFields = ['statusCode', 'headers', 'body'];
        const missingFields = requiredFields.filter(field => !response.hasOwnProperty(field));
        
        if (missingFields.length > 0) {
            throw new Error(`Response missing required fields: ${missingFields.join(', ')}`);
        }
    }
    
    /**
     * Validates status code using HTTP status utilities
     * @private
     */
    _isValidStatusCode(statusCode) {
        return Number.isInteger(statusCode) && statusCode >= 100 && statusCode < 600;
    }
    
    /**
     * Validates response headers against expected headers
     * @private
     */
    _validateResponseHeaders(responseHeaders, expectedHeaders) {
        const validation = {
            valid: true,
            missingHeaders: [],
            incorrectHeaders: [],
            presentHeaders: Object.keys(responseHeaders)
        };
        
        if (expectedHeaders && typeof expectedHeaders === 'object') {
            Object.keys(expectedHeaders).forEach(headerName => {
                const expectedValue = expectedHeaders[headerName];
                const actualValue = responseHeaders[headerName.toLowerCase()];
                
                if (actualValue === undefined) {
                    validation.missingHeaders.push(headerName);
                    validation.valid = false;
                } else if (expectedValue !== actualValue) {
                    validation.incorrectHeaders.push({
                        header: headerName,
                        expected: expectedValue,
                        actual: actualValue
                    });
                    validation.valid = false;
                }
            });
        }
        
        return validation;
    }
    
    /**
     * Executes a batch of requests for benchmark testing
     * @private
     */
    async _executeBenchmarkBatch(path, method, batchSize, correlationId) {
        const batchResults = {
            durations: [],
            statusCodes: [],
            errors: []
        };
        
        for (let i = 0; i < batchSize; i++) {
            try {
                const timer = new TestTimer();
                timer.start();
                
                const response = await this.request(method, path, {
                    correlationId: `${correlationId}-${i}`,
                    timeout: this.timeout
                });
                
                timer.stop();
                batchResults.durations.push(timer.getElapsed());
                batchResults.statusCodes.push(response.statusCode);
                
            } catch (error) {
                batchResults.errors.push({
                    requestIndex: i,
                    error: error.message
                });
            }
        }
        
        return batchResults;
    }
}

// ============================================================================
// HTTP REQUEST BUILDER CLASS IMPLEMENTATION
// ============================================================================

/**
 * Fluent HTTP request builder class providing method chaining for constructing HTTP requests
 * with comprehensive configuration options, validation, and test integration patterns for
 * educational and production-ready request building.
 * 
 * This class provides:
 * - Fluent API with method chaining for intuitive request construction
 * - Comprehensive configuration options for headers, body, timeout, and method
 * - Integration with HttpTestClient for request execution
 * - Validation and error handling for request configuration
 * - Educational patterns demonstrating builder pattern implementation
 */
class HttpRequestBuilder {
    /**
     * Initializes HTTP request builder with base configuration and default values for
     * fluent request construction.
     * 
     * @param {Object} config - Base configuration for request builder
     * @param {HttpTestClient} [config.client] - HTTP client instance for request execution
     * @param {string} [config.baseUrl] - Base URL for relative path construction
     */
    constructor(config = {}) {
        try {
            // Initialize request builder with base configuration
            this.client = config.client;
            this.baseUrl = config.baseUrl || '';
            
            // Set default HTTP method to GET using HTTP_METHODS constants
            this.method = HTTP_METHODS.GET;
            
            // Configure default headers using HTTP_HEADERS constants
            this.headers = { ...DEFAULT_CLIENT_HEADERS };
            
            // Set default timeout and validation options
            this.timeout = config.timeout || DEFAULT_REQUEST_TIMEOUT;
            this.path = '/';
            this.body = null;
            
            // Initialize correlation tracking for request builder pattern
            this.correlationId = generateCorrelationId();
            this.builderMetadata = {
                createdAt: new Date().toISOString(),
                buildSteps: []
            };
            
        } catch (error) {
            // Initialize with safe defaults if configuration fails
            this.method = HTTP_METHODS.GET;
            this.headers = { ...DEFAULT_CLIENT_HEADERS };
            this.timeout = DEFAULT_REQUEST_TIMEOUT;
            this.path = '/';
            this.body = null;
            this.correlationId = generateCorrelationId();
            this.builderMetadata = { createdAt: new Date().toISOString(), buildSteps: [] };
        }
    }
    
    /**
     * Sets HTTP method for request with validation against supported methods.
     * 
     * @param {string} httpMethod - HTTP method to set (GET, POST, PUT, DELETE)
     * @returns {HttpRequestBuilder} Request builder instance for method chaining
     */
    method(httpMethod) {
        try {
            // Validate HTTP method against HTTP_METHODS constants
            const normalizedMethod = httpMethod.toString().toUpperCase();
            
            if (!Object.values(HTTP_METHODS).includes(normalizedMethod)) {
                throw new Error(`Invalid HTTP method: ${httpMethod}. Supported methods: ${Object.values(HTTP_METHODS).join(', ')}`);
            }
            
            // Set method property for request construction
            this.method = normalizedMethod;
            this.builderMetadata.buildSteps.push(`Set method: ${normalizedMethod}`);
            
            // Return builder instance for continued method chaining
            return this;
            
        } catch (error) {
            // Log method setting error but continue with builder pattern
            if (this.client && this.client.logger) {
                this.client.logger.warn('Invalid method provided to builder', { method: httpMethod, error: error.message });
            }
            
            // Keep current method and return builder for chaining
            return this;
        }
    }
    
    /**
     * Sets request path with validation and normalization for proper URL construction.
     * 
     * @param {string} requestPath - Request path to set
     * @returns {HttpRequestBuilder} Request builder instance for method chaining
     */
    path(requestPath) {
        try {
            // Validate and normalize request path format
            const normalizedPath = requestPath.toString().trim();
            
            // Ensure path starts with forward slash
            const validPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
            
            // Set path property for request URL construction
            this.path = validPath;
            this.builderMetadata.buildSteps.push(`Set path: ${validPath}`);
            
            // Return builder instance for continued chaining
            return this;
            
        } catch (error) {
            // Log path setting error but continue with builder pattern
            if (this.client && this.client.logger) {
                this.client.logger.warn('Invalid path provided to builder', { path: requestPath, error: error.message });
            }
            
            // Keep current path and return builder for chaining
            return this;
        }
    }
    
    /**
     * Adds or updates HTTP header with validation and proper formatting.
     * 
     * @param {string} name - Header name to set
     * @param {string} value - Header value to set
     * @returns {HttpRequestBuilder} Request builder instance for method chaining
     */
    header(name, value) {
        try {
            // Validate header name format
            if (!name || typeof name !== 'string') {
                throw new Error('Header name must be a non-empty string');
            }
            
            // Normalize header name to lowercase for HTTP compliance
            const normalizedName = name.toString().toLowerCase();
            
            // Validate header value
            if (value === null || value === undefined) {
                throw new Error('Header value cannot be null or undefined');
            }
            
            // Set header value in headers object
            this.headers[normalizedName] = value.toString();
            this.builderMetadata.buildSteps.push(`Set header: ${normalizedName} = ${value}`);
            
            // Return builder instance for continued chaining
            return this;
            
        } catch (error) {
            // Log header setting error but continue with builder pattern
            if (this.client && this.client.logger) {
                this.client.logger.warn('Invalid header provided to builder', { name, value, error: error.message });
            }
            
            // Return builder for continued chaining
            return this;
        }
    }
    
    /**
     * Sets request body with automatic serialization and Content-Type header management.
     * 
     * @param {any} requestBody - Request body data to set
     * @returns {HttpRequestBuilder} Request builder instance for method chaining
     */
    body(requestBody) {
        try {
            // Serialize request body based on content type
            if (requestBody === null || requestBody === undefined) {
                this.body = null;
                delete this.headers[HTTP_HEADERS.CONTENT_TYPE];
                delete this.headers[HTTP_HEADERS.CONTENT_LENGTH];
            } else if (typeof requestBody === 'object') {
                // JSON serialization for object bodies
                this.body = JSON.stringify(requestBody);
                
                // Set appropriate Content-Type header using CONTENT_TYPES
                this.headers[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.APPLICATION_JSON_UTF8;
            } else {
                // String conversion for primitive bodies
                this.body = requestBody.toString();
                
                // Set text content type for string bodies
                this.headers[HTTP_HEADERS.CONTENT_TYPE] = CONTENT_TYPES.TEXT_PLAIN_UTF8;
            }
            
            // Calculate and set Content-Length header
            if (this.body) {
                const contentLength = Buffer.byteLength(this.body, 'utf8');
                this.headers[HTTP_HEADERS.CONTENT_LENGTH] = contentLength.toString();
            }
            
            this.builderMetadata.buildSteps.push(`Set body: ${this.body ? 'present' : 'null'}`);
            
            // Return builder instance for continued chaining
            return this;
            
        } catch (error) {
            // Log body setting error but continue with builder pattern
            if (this.client && this.client.logger) {
                this.client.logger.warn('Invalid body provided to builder', { error: error.message });
            }
            
            // Return builder for continued chaining
            return this;
        }
    }
    
    /**
     * Sets request timeout with validation for reasonable timeout values.
     * 
     * @param {number} timeoutMs - Timeout value in milliseconds
     * @returns {HttpRequestBuilder} Request builder instance for method chaining
     */
    timeout(timeoutMs) {
        try {
            // Validate timeout value is positive number
            const timeoutValue = parseInt(timeoutMs, 10);
            
            if (!Number.isInteger(timeoutValue) || timeoutValue < 100) {
                throw new Error('Timeout must be an integer >= 100ms');
            }
            
            // Set timeout property for request execution
            this.timeout = timeoutValue;
            this.builderMetadata.buildSteps.push(`Set timeout: ${timeoutValue}ms`);
            
            // Return builder instance for continued chaining
            return this;
            
        } catch (error) {
            // Log timeout setting error but continue with builder pattern
            if (this.client && this.client.logger) {
                this.client.logger.warn('Invalid timeout provided to builder', { timeout: timeoutMs, error: error.message });
            }
            
            // Return builder for continued chaining
            return this;
        }
    }
    
    /**
     * Builds complete HTTP request configuration object with validation and default
     * value application.
     * 
     * @returns {Object} Complete HTTP request configuration ready for execution
     */
    build() {
        try {
            // Validate all required request properties are set
            if (!this.method || !this.path) {
                throw new Error('Method and path are required for request building');
            }
            
            // Apply default values for missing optional properties
            const requestConfig = {
                method: this.method,
                path: this.path,
                headers: { ...this.headers },
                timeout: this.timeout,
                body: this.body,
                correlationId: this.correlationId
            };
            
            // Validate request configuration completeness
            if (!Object.values(HTTP_METHODS).includes(requestConfig.method)) {
                throw new Error(`Invalid HTTP method in built request: ${requestConfig.method}`);
            }
            
            // Generate correlation ID for request tracking
            if (!requestConfig.correlationId) {
                requestConfig.correlationId = generateCorrelationId();
            }
            
            // Add builder metadata to request configuration
            requestConfig.builderMetadata = {
                ...this.builderMetadata,
                builtAt: new Date().toISOString(),
                buildComplete: true
            };
            
            // Return complete request configuration object
            return requestConfig;
            
        } catch (error) {
            // Return minimal request configuration if build fails
            return {
                method: HTTP_METHODS.GET,
                path: '/',
                headers: { ...DEFAULT_CLIENT_HEADERS },
                timeout: DEFAULT_REQUEST_TIMEOUT,
                correlationId: generateCorrelationId(),
                buildError: error.message
            };
        }
    }
    
    /**
     * Executes the built HTTP request using associated HTTP client with comprehensive
     * validation and error handling.
     * 
     * @returns {Promise<Object>} Promise resolving to HTTP response with validation and correlation metadata
     */
    async execute() {
        try {
            // Build complete request configuration using build method
            const requestConfig = this.build();
            
            // Ensure HTTP client is available for request execution
            if (!this.client) {
                throw new Error('No HTTP client available for request execution');
            }
            
            // Execute HTTP request using associated client instance
            const response = await this.client.request(
                requestConfig.method,
                requestConfig.path,
                requestConfig
            );
            
            // Apply performance timing and correlation tracking
            response.builderMetadata = requestConfig.builderMetadata;
            
            // Return response object with validation and metadata
            return response;
            
        } catch (error) {
            // Log execution error and provide comprehensive error context
            if (this.client && this.client.logger) {
                this.client.logger.error('Request builder execution failed', { error: error.message }, error);
            }
            
            throw new Error(`Request builder execution failed: ${error.message}`);
        }
    }
}

// ============================================================================
// HTTP RESPONSE VALIDATOR CLASS IMPLEMENTATION
// ============================================================================

/**
 * HTTP response validation utility class providing comprehensive response validation
 * including status codes, headers, content, performance metrics, and protocol compliance
 * for educational testing patterns and production-ready validation capabilities.
 * 
 * This class provides:
 * - Comprehensive status code validation with category analysis
 * - Header validation including required headers and format validation
 * - Content validation with format, encoding, and expected content verification
 * - Performance validation against configurable thresholds
 * - Protocol compliance validation for HTTP standards adherence
 * - Educational patterns demonstrating enterprise validation approaches
 */
class HttpResponseValidator {
    /**
     * Initializes response validator with validation rules, performance thresholds, and
     * logging for comprehensive response validation.
     * 
     * @param {Object} config - Validator configuration options
     * @param {Object} [config.performanceThresholds] - Performance validation thresholds
     * @param {Logger} [config.logger] - Logger instance for validation tracking
     */
    constructor(config = {}) {
        try {
            // Configure validation rules for status codes, headers, and content
            this.validationRules = {
                requireValidStatusCode: config.requireValidStatusCode !== false,
                requireContentType: config.requireContentType !== false,
                enforceHttpCompliance: config.enforceHttpCompliance !== false,
                validatePerformance: config.validatePerformance !== false
            };
            
            // Set performance thresholds for response time validation
            this.performanceThresholds = {
                maxResponseTime: config.performanceThresholds?.maxResponseTime || PERFORMANCE_THRESHOLD_MS,
                maxMemoryUsage: config.performanceThresholds?.maxMemoryUsage || 50, // MB
                minThroughput: config.performanceThresholds?.minThroughput || 100 // requests/second
            };
            
            // Initialize logger for validation result tracking
            this.logger = config.logger || new Logger();
            
            // Configure protocol compliance validation rules
            this.protocolRules = {
                requireStandardHeaders: config.requireStandardHeaders !== false,
                enforceHeaderFormat: config.enforceHeaderFormat !== false,
                validateHttpVersion: config.validateHttpVersion !== false
            };
            
            // Initialize validation statistics
            this.validationStats = {
                totalValidations: 0,
                successfulValidations: 0,
                failedValidations: 0,
                validationTypes: {
                    status: 0,
                    headers: 0,
                    content: 0,
                    performance: 0
                }
            };
            
        } catch (error) {
            // Initialize with safe defaults if configuration fails
            this.validationRules = {
                requireValidStatusCode: true,
                requireContentType: true,
                enforceHttpCompliance: true,
                validatePerformance: true
            };
            this.performanceThresholds = {
                maxResponseTime: PERFORMANCE_THRESHOLD_MS,
                maxMemoryUsage: 50,
                minThroughput: 100
            };
            this.logger = new Logger();
            this.protocolRules = {
                requireStandardHeaders: true,
                enforceHeaderFormat: true,
                validateHttpVersion: true
            };
            this.validationStats = {
                totalValidations: 0,
                successfulValidations: 0,
                failedValidations: 0,
                validationTypes: { status: 0, headers: 0, content: 0, performance: 0 }
            };
        }
    }
    
    /**
     * Validates HTTP response status code against expected status with comprehensive
     * status analysis.
     * 
     * @param {number} statusCode - Actual HTTP status code
     * @param {number} expectedStatus - Expected HTTP status code
     * @returns {Object} Status validation result with success status and validation details
     */
    validateStatus(statusCode, expectedStatus) {
        try {
            // Compare actual status code with expected status
            const statusValid = statusCode === expectedStatus;
            
            // Validate status code using HTTP_STATUS_CODES and status utilities
            const isValidCode = Number.isInteger(statusCode) && statusCode >= 100 && statusCode < 600;
            
            // Determine status category using isSuccessStatus, isClientError functions
            let statusCategory = 'unknown';
            if (isSuccessStatus(statusCode)) {
                statusCategory = 'success';
            } else if (isClientError(statusCode)) {
                statusCategory = 'client_error';
            } else if (statusCode >= 500 && statusCode < 600) {
                statusCategory = 'server_error';
            } else if (statusCode >= 100 && statusCode < 200) {
                statusCategory = 'informational';
            } else if (statusCode >= 300 && statusCode < 400) {
                statusCategory = 'redirection';
            }
            
            // Create detailed status validation result
            const validationResult = {
                valid: statusValid && isValidCode,
                statusCode,
                expectedStatus,
                statusCategory,
                isValidCode,
                statusMatch: statusValid,
                validatedAt: new Date().toISOString()
            };
            
            // Update validation statistics
            this.validationStats.validationTypes.status++;
            if (validationResult.valid) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            
            // Log validation result
            this.logger.debug('Status validation completed', {
                statusCode,
                expectedStatus,
                valid: validationResult.valid,
                category: statusCategory
            });
            
            // Return detailed status validation result with analysis
            return validationResult;
            
        } catch (error) {
            this.logger.error('Status validation failed', { statusCode, expectedStatus, error: error.message }, error);
            return {
                valid: false,
                error: `Status validation failed: ${error.message}`,
                statusCode,
                expectedStatus
            };
        }
    }
    
    /**
     * Validates HTTP response headers including required headers, format, and security headers.
     * 
     * @param {Object} responseHeaders - Actual response headers object
     * @param {Object} expectedHeaders - Expected headers object for validation
     * @returns {Object} Header validation result with detailed header analysis
     */
    validateHeaders(responseHeaders, expectedHeaders = {}) {
        try {
            // Initialize header validation result structure
            const headerValidation = {
                valid: true,
                totalHeaders: Object.keys(responseHeaders).length,
                expectedHeaders: Object.keys(expectedHeaders).length,
                missingHeaders: [],
                incorrectHeaders: [],
                extraHeaders: [],
                securityHeaders: {
                    present: [],
                    missing: []
                },
                validatedAt: new Date().toISOString()
            };
            
            // Validate required headers presence using HTTP_HEADERS constants
            Object.keys(expectedHeaders).forEach(headerName => {
                const normalizedName = headerName.toLowerCase();
                const expectedValue = expectedHeaders[headerName];
                const actualValue = responseHeaders[normalizedName];
                
                if (actualValue === undefined) {
                    headerValidation.missingHeaders.push(headerName);
                    headerValidation.valid = false;
                } else if (expectedValue !== actualValue) {
                    headerValidation.incorrectHeaders.push({
                        header: headerName,
                        expected: expectedValue,
                        actual: actualValue
                    });
                    headerValidation.valid = false;
                }
            });
            
            // Check header format and value compliance
            Object.keys(responseHeaders).forEach(headerName => {
                // Validate header name format (basic validation)
                if (headerName.includes('\n') || headerName.includes('\r')) {
                    headerValidation.valid = false;
                    headerValidation.incorrectHeaders.push({
                        header: headerName,
                        issue: 'Invalid header name format'
                    });
                }
                
                // Check for security headers
                const securityHeaderNames = ['x-content-type-options', 'x-frame-options', 'x-xss-protection'];
                if (securityHeaderNames.includes(headerName.toLowerCase())) {
                    headerValidation.securityHeaders.present.push(headerName);
                }
            });
            
            // Validate security headers and protocol compliance
            const expectedSecurityHeaders = ['x-content-type-options'];
            expectedSecurityHeaders.forEach(securityHeader => {
                if (!responseHeaders[securityHeader]) {
                    headerValidation.securityHeaders.missing.push(securityHeader);
                }
            });
            
            // Update validation statistics
            this.validationStats.validationTypes.headers++;
            if (headerValidation.valid) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            
            // Log header validation results
            this.logger.debug('Header validation completed', {
                valid: headerValidation.valid,
                totalHeaders: headerValidation.totalHeaders,
                missingHeaders: headerValidation.missingHeaders.length,
                incorrectHeaders: headerValidation.incorrectHeaders.length
            });
            
            // Return comprehensive header validation result
            return headerValidation;
            
        } catch (error) {
            this.logger.error('Header validation failed', { error: error.message }, error);
            return {
                valid: false,
                error: `Header validation failed: ${error.message}`,
                responseHeaders: Object.keys(responseHeaders).length
            };
        }
    }
    
    /**
     * Validates HTTP response content including format, encoding, and expected content verification.
     * 
     * @param {any} responseBody - Actual response body content
     * @param {Object} contentCriteria - Content validation criteria
     * @returns {Object} Content validation result with content analysis and verification status
     */
    validateContent(responseBody, contentCriteria = {}) {
        try {
            // Initialize content validation result structure
            const contentValidation = {
                valid: true,
                actualContent: responseBody,
                expectedContent: contentCriteria.expectedContent,
                contentLength: responseBody ? responseBody.toString().length : 0,
                encoding: contentCriteria.encoding || 'utf8',
                validatedAt: new Date().toISOString()
            };
            
            // Validate response body format and encoding
            if (contentCriteria.requireContent && (!responseBody || responseBody.toString().trim().length === 0)) {
                contentValidation.valid = false;
                contentValidation.error = 'Response body is required but empty or missing';
            }
            
            // Compare actual content with expected content
            if (contentCriteria.expectedContent !== undefined) {
                const actualContentString = responseBody ? responseBody.toString().trim() : '';
                const expectedContentString = contentCriteria.expectedContent.toString().trim();
                
                if (actualContentString !== expectedContentString) {
                    contentValidation.valid = false;
                    contentValidation.contentMatch = false;
                    contentValidation.mismatchDetails = {
                        expected: expectedContentString,
                        actual: actualContentString,
                        lengthDifference: actualContentString.length - expectedContentString.length
                    };
                }
            }
            
            // Validate content length and structure
            if (contentCriteria.maxLength && contentValidation.contentLength > contentCriteria.maxLength) {
                contentValidation.valid = false;
                contentValidation.error = `Content length ${contentValidation.contentLength} exceeds maximum ${contentCriteria.maxLength}`;
            }
            
            // Validate content type compatibility
            if (contentCriteria.contentType) {
                contentValidation.contentTypeCheck = {
                    expected: contentCriteria.contentType,
                    compatible: true // Basic compatibility check
                };
            }
            
            // Update validation statistics
            this.validationStats.validationTypes.content++;
            if (contentValidation.valid) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            
            // Log content validation results
            this.logger.debug('Content validation completed', {
                valid: contentValidation.valid,
                contentLength: contentValidation.contentLength,
                hasExpectedContent: contentCriteria.expectedContent !== undefined
            });
            
            // Return detailed content validation result
            return contentValidation;
            
        } catch (error) {
            this.logger.error('Content validation failed', { error: error.message }, error);
            return {
                valid: false,
                error: `Content validation failed: ${error.message}`,
                actualContent: responseBody
            };
        }
    }
    
    /**
     * Validates HTTP response performance metrics against configured thresholds and requirements.
     * 
     * @param {Object} performanceMetrics - Performance metrics from response
     * @returns {Object} Performance validation result with threshold analysis and recommendations
     */
    validatePerformance(performanceMetrics = {}) {
        try {
            // Initialize performance validation result structure
            const performanceValidation = {
                valid: true,
                metrics: performanceMetrics,
                thresholds: this.performanceThresholds,
                validatedAt: new Date().toISOString(),
                recommendations: []
            };
            
            // Compare response time against performance thresholds
            if (performanceMetrics.duration) {
                const responseTimeValid = performanceMetrics.duration <= this.performanceThresholds.maxResponseTime;
                performanceValidation.responseTime = {
                    valid: responseTimeValid,
                    actual: performanceMetrics.duration,
                    threshold: this.performanceThresholds.maxResponseTime,
                    withinThreshold: responseTimeValid
                };
                
                if (!responseTimeValid) {
                    performanceValidation.valid = false;
                    performanceValidation.recommendations.push(
                        `Response time ${performanceMetrics.duration}ms exceeds threshold ${this.performanceThresholds.maxResponseTime}ms`
                    );
                }
            }
            
            // Validate performance metrics against requirements
            if (performanceMetrics.memoryUsage) {
                const memoryValid = performanceMetrics.memoryUsage <= this.performanceThresholds.maxMemoryUsage;
                performanceValidation.memoryUsage = {
                    valid: memoryValid,
                    actual: performanceMetrics.memoryUsage,
                    threshold: this.performanceThresholds.maxMemoryUsage,
                    withinThreshold: memoryValid
                };
                
                if (!memoryValid) {
                    performanceValidation.valid = false;
                    performanceValidation.recommendations.push(
                        `Memory usage ${performanceMetrics.memoryUsage}MB exceeds threshold ${this.performanceThresholds.maxMemoryUsage}MB`
                    );
                }
            }
            
            // Generate performance analysis and recommendations
            if (performanceMetrics.duration > this.performanceThresholds.maxResponseTime * 0.8) {
                performanceValidation.recommendations.push('Response time approaching threshold, consider optimization');
            }
            
            // Update validation statistics
            this.validationStats.validationTypes.performance++;
            if (performanceValidation.valid) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            
            // Log performance validation results
            this.logger.debug('Performance validation completed', {
                valid: performanceValidation.valid,
                duration: performanceMetrics.duration,
                threshold: this.performanceThresholds.maxResponseTime,
                recommendations: performanceValidation.recommendations.length
            });
            
            // Return performance validation result with analysis
            return performanceValidation;
            
        } catch (error) {
            this.logger.error('Performance validation failed', { error: error.message }, error);
            return {
                valid: false,
                error: `Performance validation failed: ${error.message}`,
                metrics: performanceMetrics
            };
        }
    }
    
    /**
     * Performs comprehensive validation of HTTP response including all validation categories
     * with detailed analysis.
     * 
     * @param {Object} response - HTTP response object to validate
     * @param {Object} validationCriteria - Complete validation criteria
     * @returns {Object} Complete validation result with comprehensive analysis and validation status
     */
    validateComplete(response, validationCriteria = {}) {
        try {
            // Initialize comprehensive validation result
            const completeValidation = {
                correlationId: validationCriteria.correlationId || generateCorrelationId(),
                validatedAt: new Date().toISOString(),
                overallValid: true,
                validationSummary: {
                    totalValidations: 0,
                    passedValidations: 0,
                    failedValidations: 0
                },
                results: {},
                recommendations: []
            };
            
            // Perform status code validation using validateStatus method
            if (validationCriteria.expectedStatus) {
                const statusValidation = this.validateStatus(response.statusCode, validationCriteria.expectedStatus);
                completeValidation.results.status = statusValidation;
                completeValidation.validationSummary.totalValidations++;
                
                if (statusValidation.valid) {
                    completeValidation.validationSummary.passedValidations++;
                } else {
                    completeValidation.validationSummary.failedValidations++;
                    completeValidation.overallValid = false;
                }
            }
            
            // Perform header validation using validateHeaders method
            if (validationCriteria.expectedHeaders) {
                const headerValidation = this.validateHeaders(response.headers, validationCriteria.expectedHeaders);
                completeValidation.results.headers = headerValidation;
                completeValidation.validationSummary.totalValidations++;
                
                if (headerValidation.valid) {
                    completeValidation.validationSummary.passedValidations++;
                } else {
                    completeValidation.validationSummary.failedValidations++;
                    completeValidation.overallValid = false;
                }
            }
            
            // Perform content validation using validateContent method
            if (validationCriteria.expectedContent !== undefined || validationCriteria.contentValidation) {
                const contentValidation = this.validateContent(response.body, validationCriteria.contentValidation || {
                    expectedContent: validationCriteria.expectedContent
                });
                completeValidation.results.content = contentValidation;
                completeValidation.validationSummary.totalValidations++;
                
                if (contentValidation.valid) {
                    completeValidation.validationSummary.passedValidations++;
                } else {
                    completeValidation.validationSummary.failedValidations++;
                    completeValidation.overallValid = false;
                }
            }
            
            // Perform performance validation using validatePerformance method
            if (response.performance || validationCriteria.performanceValidation) {
                const performanceValidation = this.validatePerformance(response.performance || {});
                completeValidation.results.performance = performanceValidation;
                completeValidation.validationSummary.totalValidations++;
                
                if (performanceValidation.valid) {
                    completeValidation.validationSummary.passedValidations++;
                } else {
                    completeValidation.validationSummary.failedValidations++;
                    completeValidation.overallValid = false;
                }
            }
            
            // Aggregate all validation results into comprehensive result
            const validationSuccessRate = completeValidation.validationSummary.totalValidations > 0 ?
                (completeValidation.validationSummary.passedValidations / completeValidation.validationSummary.totalValidations * 100).toFixed(2) :
                100;
            
            completeValidation.validationSummary.successRate = `${validationSuccessRate}%`;
            
            // Generate recommendations based on validation results
            if (!completeValidation.overallValid) {
                completeValidation.recommendations.push('Review failed validations and adjust expectations or implementation');
            }
            
            if (completeValidation.results.performance && !completeValidation.results.performance.valid) {
                completeValidation.recommendations.push('Consider performance optimization for response time improvement');
            }
            
            // Update overall validation statistics
            this.validationStats.totalValidations++;
            if (completeValidation.overallValid) {
                this.validationStats.successfulValidations++;
            } else {
                this.validationStats.failedValidations++;
            }
            
            // Log complete validation results
            this.logger.info('Complete response validation finished', {
                correlationId: completeValidation.correlationId,
                overallValid: completeValidation.overallValid,
                successRate: completeValidation.validationSummary.successRate,
                totalValidations: completeValidation.validationSummary.totalValidations
            });
            
            // Return complete validation analysis with recommendations
            return completeValidation;
            
        } catch (error) {
            this.logger.error('Complete validation failed', { error: error.message }, error);
            return {
                overallValid: false,
                error: `Complete validation failed: ${error.message}`,
                correlationId: validationCriteria.correlationId || generateCorrelationId()
            };
        }
    }
}

// ============================================================================
// UTILITY FUNCTIONS FOR HTTP CLIENT OPERATIONS
// ============================================================================

/**
 * Creates a new HTTP test client instance with configurable options for making HTTP requests
 * to test servers with correlation tracking and performance measurement.
 * 
 * @param {Object} clientOptions - Configuration options for HTTP client creation
 * @returns {HttpTestClient} HttpTestClient instance configured for HTTP request testing with validation and correlation
 */
function createHttpClient(clientOptions = {}) {
    try {
        // Validate client options and apply defaults for host, port, and timeout configuration
        const validatedOptions = createClientConfiguration(clientOptions);
        
        // Create HTTP client configuration with test-specific settings and correlation tracking
        const client = new HttpTestClient(validatedOptions);
        
        // Initialize performance measurement and timing utilities for request monitoring
        client.logger.debug('HTTP test client created successfully', {
            host: client.host,
            port: client.port,
            timeout: client.timeout,
            userAgent: client.userAgent
        });
        
        // Return configured HttpTestClient instance ready for HTTP request testing
        return client;
        
    } catch (error) {
        // Create fallback client with default configuration if creation fails
        const fallbackClient = new HttpTestClient({
            host: DEFAULT_HOST,
            port: DEFAULT_PORT,
            timeout: DEFAULT_REQUEST_TIMEOUT
        });
        
        fallbackClient.logger.error('HTTP client creation failed, using defaults', { error: error.message }, error);
        return fallbackClient;
    }
}

/**
 * Makes HTTP request to specified endpoint with comprehensive error handling, timing
 * measurement, and response validation for testing scenarios.
 * 
 * @param {string} method - HTTP method for the request (GET, POST, PUT, DELETE)
 * @param {string} path - Request path for the HTTP operation
 * @param {Object} requestOptions - Request configuration options
 * @returns {Promise<Object>} Promise resolving to HTTP response object with timing, validation, and correlation metadata
 */
async function makeHttpRequest(method, path, requestOptions = {}) {
    try {
        // Validate method, path, and request options parameters for HTTP compliance
        const validMethod = Object.values(HTTP_METHODS).includes(method.toUpperCase()) ? 
            method.toUpperCase() : HTTP_METHODS.GET;
        const validPath = path || '/';
        
        // Generate correlation ID for request tracking and test debugging
        const correlationId = requestOptions.correlationId || generateCorrelationId();
        
        // Start performance timer for request timing measurement
        const timer = new TestTimer();
        timer.start();
        
        // Create temporary HTTP client for standalone request execution
        const client = createHttpClient({
            host: requestOptions.host || DEFAULT_HOST,
            port: requestOptions.port || DEFAULT_PORT,
            timeout: requestOptions.timeout || DEFAULT_REQUEST_TIMEOUT,
            logger: requestOptions.logger
        });
        
        try {
            // Create HTTP request with proper headers, body, and configuration
            const requestConfig = {
                ...requestOptions,
                correlationId,
                headers: {
                    ...DEFAULT_CLIENT_HEADERS,
                    ...requestOptions.headers
                }
            };
            
            // Execute HTTP request with timeout handling and error management
            const response = await client.request(validMethod, validPath, requestConfig);
            
            // Stop performance timer and calculate request duration
            timer.stop();
            const duration = timer.getElapsed();
            
            // Collect response data including status, headers, body, and timing
            const responseWithTiming = {
                ...response,
                performance: {
                    duration,
                    startTime: timer.startTime,
                    endTime: timer.endTime,
                    isSlowResponse: duration > PERFORMANCE_THRESHOLD_MS
                },
                correlation: {
                    requestId: correlationId,
                    method: validMethod,
                    path: validPath
                }
            };
            
            // Close temporary client to prevent resource leaks
            await client.close();
            
            // Return response object with correlation metadata and performance metrics
            return responseWithTiming;
            
        } catch (requestError) {
            // Ensure client cleanup even on error
            await client.close();
            throw requestError;
        }
        
    } catch (error) {
        // Log request execution error with context
        console.error(`HTTP request failed: ${error.message}`);
        throw new Error(`HTTP ${method} request to ${path} failed: ${error.message}`);
    }
}

/**
 * Specialized function for testing the /hello endpoint with comprehensive validation
 * including status, content, headers, and performance measurement.
 * 
 * @param {HttpTestClient} testClient - HTTP test client instance for request execution
 * @param {Object} testOptions - Test configuration options
 * @returns {Promise<Object>} Promise resolving to hello endpoint test results with comprehensive validation and performance data
 */
async function testHelloEndpoint(testClient, testOptions = {}) {
    try {
        // Validate test client parameter
        if (!testClient || !(testClient instanceof HttpTestClient)) {
            throw new Error('Valid HttpTestClient instance required for hello endpoint testing');
        }
        
        // Configure hello endpoint test with correlation tracking and timing
        const correlationId = testOptions.correlationId || generateCorrelationId();
        
        // Use test client's specialized hello endpoint testing method
        const testResults = await testClient.testHelloEndpoint({
            ...testOptions,
            correlationId
        });
        
        // Return comprehensive test results with validation status and performance metrics
        return testResults;
        
    } catch (error) {
        throw new Error(`Hello endpoint testing failed: ${error.message}`);
    }
}

/**
 * Tests various error scenarios including 404 Not Found, 405 Method Not Allowed, and
 * malformed requests with comprehensive error validation.
 * 
 * @param {HttpTestClient} testClient - HTTP test client instance for error testing
 * @param {Object} errorTestOptions - Error test configuration options
 * @returns {Promise<Object>} Promise resolving to error scenario test results with error validation and response verification
 */
async function testErrorScenarios(testClient, errorTestOptions = {}) {
    try {
        // Validate test client parameter
        if (!testClient || !(testClient instanceof HttpTestClient)) {
            throw new Error('Valid HttpTestClient instance required for error scenario testing');
        }
        
        // Use test client's specialized error scenario testing method
        const errorTestResults = await testClient.testErrorScenarios(errorTestOptions);
        
        // Return comprehensive error test results with validation analysis
        return errorTestResults;
        
    } catch (error) {
        throw new Error(`Error scenario testing failed: ${error.message}`);
    }
}

/**
 * Validates HTTP response object against expected criteria including status code, headers,
 * content, and performance thresholds for comprehensive response verification.
 * 
 * @param {Object} response - HTTP response object to validate
 * @param {Object} validationCriteria - Validation criteria and expectations
 * @returns {Object} Validation result object with success status, validation details, and error information
 */
function validateHttpResponse(response, validationCriteria = {}) {
    try {
        // Create response validator with default configuration
        const validator = new HttpResponseValidator({
            logger: validationCriteria.logger
        });
        
        // Perform comprehensive validation using validator
        const validationResult = validator.validateComplete(response, validationCriteria);
        
        // Return validation result with detailed validation analysis
        return validationResult;
        
    } catch (error) {
        return {
            valid: false,
            error: `Response validation failed: ${error.message}`,
            response: response
        };
    }
}

/**
 * Performs load testing by making multiple concurrent HTTP requests with performance
 * monitoring and result aggregation for scalability testing.
 * 
 * @param {HttpTestClient} testClient - HTTP test client instance for load testing
 * @param {Object} loadTestConfig - Load test configuration options
 * @returns {Promise<Object>} Promise resolving to load test results with performance statistics and concurrency analysis
 */
async function performLoadTest(testClient, loadTestConfig = {}) {
    try {
        // Validate test client parameter
        if (!testClient || !(testClient instanceof HttpTestClient)) {
            throw new Error('Valid HttpTestClient instance required for load testing');
        }
        
        // Configure load test parameters including concurrent requests and duration
        const requestCount = loadTestConfig.requestCount || 50;
        const concurrency = loadTestConfig.concurrency || 5;
        const path = loadTestConfig.path || '/hello';
        const method = loadTestConfig.method || HTTP_METHODS.GET;
        const correlationId = loadTestConfig.correlationId || generateCorrelationId();
        
        testClient.logger.info('Starting load test', {
            correlationId,
            requestCount,
            concurrency,
            path,
            method
        });
        
        // Use test client's performance benchmark method for load testing
        const loadTestResults = await testClient.performBenchmark(path, {
            requestCount,
            concurrency,
            method,
            correlationId
        });
        
        // Validate server stability and performance under concurrent load
        const stabilityAnalysis = {
            stable: loadTestResults.statistics.errorRate < 5, // Less than 5% error rate
            performanceAcceptable: loadTestResults.statistics.averageDuration < PERFORMANCE_THRESHOLD_MS * 2,
            throughputAcceptable: loadTestResults.statistics.requestsPerSecond > 10
        };
        
        // Add stability analysis to results
        loadTestResults.stabilityAnalysis = stabilityAnalysis;
        loadTestResults.overallSuccess = stabilityAnalysis.stable && stabilityAnalysis.performanceAcceptable;
        
        // Generate recommendations based on load test results
        loadTestResults.recommendations = [];
        if (!stabilityAnalysis.stable) {
            loadTestResults.recommendations.push('High error rate detected, investigate server stability');
        }
        if (!stabilityAnalysis.performanceAcceptable) {
            loadTestResults.recommendations.push('Response times degraded under load, consider performance optimization');
        }
        if (!stabilityAnalysis.throughputAcceptable) {
            loadTestResults.recommendations.push('Low throughput detected, investigate bottlenecks');
        }
        
        testClient.logger.info('Load test completed', {
            correlationId,
            overallSuccess: loadTestResults.overallSuccess,
            requestsPerSecond: loadTestResults.statistics.requestsPerSecond,
            averageDuration: loadTestResults.statistics.averageDuration,
            errorRate: loadTestResults.statistics.errorRate
        });
        
        // Return comprehensive load test results with performance analysis and recommendations
        return loadTestResults;
        
    } catch (error) {
        if (testClient && testClient.logger) {
            testClient.logger.error('Load test failed', { error: error.message }, error);
        }
        throw new Error(`Load test failed: ${error.message}`);
    }
}

/**
 * Creates a fluent request builder for constructing HTTP requests with method chaining
 * and comprehensive configuration options.
 * 
 * @param {Object} baseConfig - Base configuration for request builder
 * @returns {HttpRequestBuilder} Request builder instance with fluent API for HTTP request construction
 */
function createRequestBuilder(baseConfig = {}) {
    try {
        // Initialize request builder with base configuration and default values
        const builder = new HttpRequestBuilder(baseConfig);
        
        // Set up fluent API methods for method, path, headers, and body configuration
        // (Methods are already implemented in the class)
        
        // Configure request validation and error handling for builder pattern
        builder.logger = baseConfig.logger || new Logger();
        
        // Add correlation tracking and performance measurement to builder
        builder.correlationId = baseConfig.correlationId || generateCorrelationId();
        
        // Log builder creation for debugging
        builder.logger.debug('HTTP request builder created', {
            correlationId: builder.correlationId,
            baseConfig: Object.keys(baseConfig)
        });
        
        // Return request builder instance with method chaining capabilities
        return builder;
        
    } catch (error) {
        // Create fallback builder if creation fails
        const fallbackBuilder = new HttpRequestBuilder({});
        if (fallbackBuilder.client && fallbackBuilder.client.logger) {
            fallbackBuilder.client.logger.error('Request builder creation failed, using defaults', { error: error.message }, error);
        }
        return fallbackBuilder;
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export main HTTP test client classes for direct instantiation and testing
export {
    HttpTestClient,
    HttpRequestBuilder,
    HttpResponseValidator
};

// Export factory functions for creating HTTP client instances and utilities
export {
    createHttpClient,
    makeHttpRequest,
    testHelloEndpoint,
    testErrorScenarios,
    validateHttpResponse,
    performLoadTest,
    createRequestBuilder
};

// Export utility functions for performance measurement and request correlation
export {
    measurePerformance,
    createClientConfiguration
};

// Export constants for client configuration and customization
export {
    DEFAULT_REQUEST_TIMEOUT,
    DEFAULT_USER_AGENT,
    MAX_RETRIES,
    RETRY_DELAY_BASE,
    DEFAULT_HOST,
    DEFAULT_PORT,
    PERFORMANCE_THRESHOLD_MS,
    DEFAULT_CLIENT_HEADERS
};

// Default export object providing convenient access to commonly used HTTP client functions and classes
const httpClientUtils = {
    // Factory functions for easy client creation
    createClient: createHttpClient,
    testEndpoint: testHelloEndpoint,
    validateResponse: validateHttpResponse,
    
    // Class constructors for advanced usage
    requestBuilder: HttpRequestBuilder,
    
    // Utility functions for performance and testing
    performLoadTest: performLoadTest,
    measurePerformance: measurePerformance
};

export default httpClientUtils;

/**
 * Export Summary and Usage Examples:
 * 
 * Primary Classes:
 * - HttpTestClient: Comprehensive HTTP client with correlation tracking, performance measurement, and validation
 * - HttpRequestBuilder: Fluent request builder with method chaining for intuitive request construction
 * - HttpResponseValidator: Response validation utility with comprehensive validation categories
 * 
 * Factory Functions:
 * - createHttpClient(): Creates configured HTTP test client instances
 * - makeHttpRequest(): Makes individual HTTP requests with comprehensive error handling
 * - testHelloEndpoint(): Specialized hello endpoint testing with validation
 * - testErrorScenarios(): Comprehensive error scenario testing and validation
 * - validateHttpResponse(): Response validation against expected criteria
 * - performLoadTest(): Load testing with concurrent requests and performance monitoring
 * - createRequestBuilder(): Creates fluent request builders with method chaining
 * 
 * Integration Examples:
 * 
 * // Basic HTTP client usage
 * import { createHttpClient } from './test/helpers/test-client.js';
 * 
 * const client = createHttpClient({ host: 'localhost', port: 3000 });
 * const response = await client.get('/hello');
 * console.log(response.body); // "Hello world"
 * 
 * // Fluent request builder usage
 * import { createRequestBuilder } from './test/helpers/test-client.js';
 * 
 * const builder = createRequestBuilder({ client });
 * const response = await builder
 *   .method('GET')
 *   .path('/hello')
 *   .header('Accept', 'text/plain')
 *   .timeout(3000)
 *   .execute();
 * 
 * // Hello endpoint testing
 * import { testHelloEndpoint } from './test/helpers/test-client.js';
 * 
 * const testResults = await testHelloEndpoint(client);
 * console.log(testResults.success); // true/false
 * 
 * // Error scenario testing
 * import { testErrorScenarios } from './test/helpers/test-client.js';
 * 
 * const errorResults = await testErrorScenarios(client);
 * console.log(errorResults.overallSuccess); // true/false
 * 
 * // Load testing
 * import { performLoadTest } from './test/helpers/test-client.js';
 * 
 * const loadResults = await performLoadTest(client, {
 *   requestCount: 100,
 *   concurrency: 10,
 *   path: '/hello'
 * });
 * console.log(loadResults.statistics.requestsPerSecond);
 * 
 * // Response validation
 * import { validateHttpResponse } from './test/helpers/test-client.js';
 * 
 * const validation = validateHttpResponse(response, {
 *   expectedStatus: 200,
 *   expectedContent: 'Hello world',
 *   expectedHeaders: { 'content-type': 'text/plain; charset=utf-8' }
 * });
 * console.log(validation.overallValid); // true/false
 * 
 * Educational Value:
 * - Demonstrates comprehensive HTTP client implementation using Node.js built-in modules
 * - Shows proper request correlation and tracking patterns for debugging and monitoring
 * - Illustrates performance measurement and validation techniques for HTTP operations
 * - Provides examples of comprehensive response validation and error handling patterns
 * - Shows integration between HTTP clients and test server management systems
 * - Demonstrates production-ready testing utilities and enterprise testing approaches
 * - Illustrates fluent API design patterns and method chaining implementation
 * - Shows comprehensive error handling and retry logic for reliable HTTP operations
 * 
 * Testing Coverage:
 * - Unit testing: Individual HTTP method testing with comprehensive validation
 * - Integration testing: End-to-end request-response cycle testing with server coordination
 * - Performance testing: Load testing and benchmark analysis with statistical reporting
 * - Error testing: Comprehensive error scenario validation and security testing
 * - Validation testing: Response validation with multiple criteria and threshold analysis
 * - Security testing: Threat simulation and security validation with comprehensive analysis
 */