/**
 * Test Utilities Module for Node.js Tutorial Application Integration Testing
 * 
 * Provides comprehensive test utility functions and classes for error handling integration
 * testing in the Node.js tutorial application. This module implements high-precision timing,
 * HTTP request generation, correlation tracking, and test identification utilities required
 * for comprehensive error handling validation and performance measurement.
 * 
 * Key Features:
 * - High-precision timing utilities for error response performance validation
 * - HTTP client utilities for making test requests with error handling
 * - Correlation ID generation for tracking error handling test execution
 * - Test ID generation for unique test identification and debugging
 * - Integration with error handling test framework and assertion utilities
 * - Support for timeout testing and error response performance benchmarking
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive test utility design for integration testing
 * - Shows HTTP client implementation patterns for testing HTTP servers
 * - Illustrates timing measurement techniques for performance validation
 * - Provides examples of correlation tracking for distributed test execution
 * - Shows test identification and debugging utility implementation
 * - Demonstrates production-ready test utility architecture
 * 
 * Architecture Integration:
 * - Integrates with TestServer class for isolated test server management
 * - Uses HTTP status code constants for error response validation
 * - Incorporates error message constants for response content validation
 * - Utilizes test configuration objects for context-aware test execution
 * - Leverages Node.js built-in modules for zero external dependencies
 * - Supports error handling test suite execution and performance measurement
 * 
 * @fileoverview Test utilities for error handling integration testing
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import Node.js built-in HTTP module for making test HTTP requests
import http from 'node:http'; // Node.js v22.x LTS - Built-in HTTP client

// Import Node.js built-in crypto module for generating correlation IDs and test identifiers
import crypto from 'node:crypto'; // Node.js v22.x LTS - Built-in cryptographic functionality

// Import Node.js built-in performance hooks for high-precision timing measurement
import { performance } from 'node:perf_hooks'; // Node.js v22.x LTS - Built-in performance measurement

// Import Node.js built-in URL module for HTTP request URL parsing and validation
import { URL } from 'node:url'; // Node.js v22.x LTS - Built-in URL utilities

// Import HTTP status code constants for error response validation and status verification
import { 
    HTTP_STATUS_CODES,
    isValidStatusCode,
    getStatusCategory,
    isClientError,
    isServerError 
} from '../../utils/http-status.js'; // Node.js v22.x LTS compatible

// Import error message constants for validating error response content and consistency
import { 
    ERROR_MESSAGES,
    HTTP_ERROR_MESSAGES,
    SERVER_ERROR_MESSAGES 
} from '../../constants/error-messages.js'; // Node.js v22.x LTS compatible

// ============================================================================
// GLOBAL TEST UTILITY CONSTANTS
// ============================================================================

/**
 * Default test request timeout in milliseconds for HTTP request operations.
 * Provides reasonable timeout value for test HTTP requests while allowing
 * sufficient time for error handling and response generation validation.
 */
const DEFAULT_REQUEST_TIMEOUT = 5000;

/**
 * Test correlation prefix for generating unique correlation IDs for test tracking.
 * Provides consistent identification pattern for test utilities enabling correlation
 * tracking and debugging across distributed test execution scenarios.
 */
const TEST_CORRELATION_PREFIX = 'test-util-';

/**
 * Default test ID prefix for generating unique test identifiers for test correlation.
 * Standardizes test ID generation across all test utility functions enabling
 * comprehensive test tracking and debugging across integration test execution.
 */
const DEFAULT_TEST_ID_PREFIX = 'test';

/**
 * High-precision timer resolution threshold in nanoseconds for performance measurement.
 * Establishes minimum timing resolution for performance measurements ensuring
 * accurate timing data for error response performance validation and benchmarking.
 */
const TIMER_PRECISION_THRESHOLD = 1000; // 1 microsecond in nanoseconds

/**
 * Maximum request body size for test HTTP requests in bytes for memory protection.
 * Prevents memory exhaustion during test execution while allowing sufficient
 * request size for comprehensive error handling and request validation testing.
 */
const MAX_REQUEST_BODY_SIZE = 1024 * 1024; // 1MB limit for test requests

/**
 * Default HTTP headers for test requests providing consistent request structure.
 * Standardizes HTTP headers across all test requests ensuring proper HTTP
 * protocol compliance and consistent request formatting for testing.
 */
const DEFAULT_TEST_HEADERS = {
    'User-Agent': 'Node.js Tutorial Test Client/1.0.0',
    'Accept': 'text/plain, */*',
    'Connection': 'close',
    'Cache-Control': 'no-cache'
};

// ============================================================================
// TEST IDENTIFICATION UTILITIES
// ============================================================================

/**
 * Generates unique test identifier for test server correlation and tracking across
 * test execution. Creates cryptographically secure unique identifiers with test type
 * context and temporal correlation for comprehensive test tracking.
 * 
 * @param {string} [prefix='test'] - Prefix for test identifier to categorize test types
 * @param {string} [suffix=''] - Suffix for additional test context identification
 * @returns {string} Unique test identifier with cryptographic security and temporal correlation
 * 
 * @example
 * const testId = generateTestId('error-test', 'client-errors');
 * // Returns: 'error-test-1692547200000-a1b2c3d4-client-errors'
 */
function generateTestId(prefix = DEFAULT_TEST_ID_PREFIX, suffix = '') {
    try {
        // Generate timestamp component for temporal correlation and ordering
        const timestamp = Date.now();
        
        // Create cryptographically secure random component using Node.js crypto module
        const randomBytes = crypto.randomBytes(4);
        const randomHex = randomBytes.toString('hex');
        
        // Validate prefix parameter to ensure proper string formatting
        const validatedPrefix = (typeof prefix === 'string' && prefix.length > 0) ? 
            prefix : DEFAULT_TEST_ID_PREFIX;
        
        // Validate suffix parameter for proper string concatenation
        const validatedSuffix = (typeof suffix === 'string' && suffix.length > 0) ? 
            suffix : '';
        
        // Construct test identifier components array for organized concatenation
        const components = [
            validatedPrefix,
            timestamp.toString(),
            randomHex
        ];
        
        // Add suffix component if provided for additional context
        if (validatedSuffix) {
            components.push(validatedSuffix);
        }
        
        // Join components with hyphens for readable test identifier format
        return components.join('-');
        
    } catch (error) {
        // Fallback identifier generation if primary generation fails
        return `test-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
}

/**
 * Generates correlation identifier for tracking error handling test execution and
 * debugging integration test failures. Creates UUID-based correlation IDs with
 * test context for comprehensive test execution correlation and error tracking.
 * 
 * @param {string} [context='general'] - Context identifier for correlation tracking
 * @returns {string} Correlation identifier for test execution tracking and debugging
 * 
 * @example
 * const correlationId = generateCorrelationId('error-handling');
 * // Returns: 'test-util-error-handling-550e8400-e29b-41d4-a716-446655440000'
 */
function generateCorrelationId(context = 'general') {
    try {
        // Generate UUID using Node.js crypto module for unique correlation identification
        const uuid = crypto.randomUUID();
        
        // Validate context parameter for proper correlation categorization
        const validatedContext = (typeof context === 'string' && context.length > 0) ? 
            context : 'general';
        
        // Sanitize context to remove special characters for clean correlation ID format
        const sanitizedContext = validatedContext
            .toLowerCase()
            .replace(/[^a-z0-9\-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        // Construct correlation ID with prefix, context, and UUID for comprehensive tracking
        const correlationId = `${TEST_CORRELATION_PREFIX}${sanitizedContext}-${uuid}`;
        
        // Return complete correlation identifier for test execution tracking
        return correlationId;
        
    } catch (error) {
        // Fallback correlation ID generation if primary generation fails
        const fallbackId = `${TEST_CORRELATION_PREFIX}fallback-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        console.warn(`Correlation ID generation failed, using fallback: ${fallbackId}`);
        return fallbackId;
    }
}

// ============================================================================
// HIGH-PRECISION TIMING UTILITIES
// ============================================================================

/**
 * High-precision timing utility for server startup and performance measurement with
 * microsecond precision. Provides comprehensive timing measurement for performance
 * monitoring and optimization of test server operations.
 * 
 * Features:
 * - High-precision timing using Node.js performance hooks
 * - Multiple measurement tracking for statistical analysis
 * - Timing state management with start/stop validation
 * - Performance benchmark comparison and analysis
 * - Error handling performance measurement and validation
 * - Statistical analysis of timing measurements for optimization
 */
class TestTimer {
    /**
     * Initializes test timer with high-precision timing capabilities for performance measurement.
     * Creates timer instance with performance hooks integration and measurement tracking
     * for comprehensive timing analysis and error handling performance validation.
     */
    constructor() {
        // Initialize timing state properties for measurement tracking
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        
        // Initialize measurement collection for statistical analysis
        this.measurements = [];
        this.totalMeasurements = 0;
        this.lastMeasurement = null;
        
        // Set up performance measurement configuration
        this.performanceConfig = {
            useHighPrecision: true,
            trackStatistics: true,
            maxMeasurements: 1000
        };
        
        // Initialize statistical tracking for timing analysis
        this.statistics = {
            min: null,
            max: null,
            average: null,
            total: 0,
            count: 0
        };
        
        // Set creation metadata for timer instance tracking
        this.metadata = {
            createdAt: new Date().toISOString(),
            timerId: generateTestId('timer'),
            version: '1.0.0'
        };
    }
    
    /**
     * Starts high-precision timing measurement using Node.js performance hooks.
     * Initializes timing measurement with performance.now() for microsecond precision
     * and validates timer state for proper timing operation sequence.
     * 
     * @returns {TestTimer} Returns this instance for method chaining
     * @throws {Error} Timer already running error for state validation
     */
    start() {
        try {
            // Validate timer is not already running to prevent timing conflicts
            if (this.isRunning) {
                throw new Error('Timer is already running. Stop current measurement before starting new one.');
            }
            
            // Capture high-precision start time using performance hooks
            this.startTime = performance.now();
            this.endTime = null;
            this.isRunning = true;
            
            // Reset last measurement for clean timing cycle
            this.lastMeasurement = null;
            
            // Log timing start for debugging and tracking
            if (this.performanceConfig.trackStatistics) {
                console.debug(`Timer ${this.metadata.timerId} started at ${this.startTime}ms`);
            }
            
            // Return this instance for method chaining support
            return this;
            
        } catch (error) {
            // Enhanced error context for timer start failures
            const timerError = new Error(`Failed to start timer: ${error.message}`);
            timerError.originalError = error;
            timerError.context = {
                timerId: this.metadata.timerId,
                isRunning: this.isRunning,
                timestamp: new Date().toISOString()
            };
            throw timerError;
        }
    }
    
    /**
     * Stops high-precision timing measurement and calculates elapsed time with
     * microsecond precision. Finalizes timing measurement using performance.now()
     * and updates statistical tracking for performance analysis.
     * 
     * @returns {number} Elapsed time in milliseconds with high precision
     * @throws {Error} Timer not running error for state validation
     */
    stop() {
        try {
            // Validate timer is currently running to ensure proper timing sequence
            if (!this.isRunning) {
                throw new Error('Timer is not running. Start timer before stopping.');
            }
            
            // Capture high-precision end time using performance hooks
            this.endTime = performance.now();
            this.isRunning = false;
            
            // Calculate elapsed time with high precision
            const elapsed = this.endTime - this.startTime;
            this.lastMeasurement = elapsed;
            
            // Store measurement in measurements array for statistical analysis
            if (this.performanceConfig.trackStatistics) {
                this.measurements.push({
                    startTime: this.startTime,
                    endTime: this.endTime,
                    elapsed: elapsed,
                    timestamp: new Date().toISOString()
                });
                
                // Limit measurements array size to prevent memory growth
                if (this.measurements.length > this.performanceConfig.maxMeasurements) {
                    this.measurements.shift(); // Remove oldest measurement
                }
                
                // Update statistical tracking
                this._updateStatistics(elapsed);
            }
            
            // Log timing completion for debugging and performance tracking
            console.debug(`Timer ${this.metadata.timerId} stopped. Elapsed: ${elapsed.toFixed(3)}ms`);
            
            // Return elapsed time for performance validation
            return elapsed;
            
        } catch (error) {
            // Enhanced error context for timer stop failures
            const timerError = new Error(`Failed to stop timer: ${error.message}`);
            timerError.originalError = error;
            timerError.context = {
                timerId: this.metadata.timerId,
                isRunning: this.isRunning,
                startTime: this.startTime,
                timestamp: new Date().toISOString()
            };
            throw timerError;
        }
    }
    
    /**
     * Gets the current elapsed time if timer is running or last measurement if stopped.
     * Provides real-time elapsed time calculation using performance.now() for
     * continuous timing monitoring during test execution.
     * 
     * @returns {number|null} Current elapsed time in milliseconds or null if timer not started
     */
    getElapsed() {
        try {
            // Return null if timer was never started
            if (this.startTime === null) {
                return null;
            }
            
            // Calculate current elapsed time if timer is running
            if (this.isRunning) {
                const currentTime = performance.now();
                return currentTime - this.startTime;
            }
            
            // Return last completed measurement if timer is stopped
            return this.lastMeasurement;
            
        } catch (error) {
            // Log elapsed time calculation errors and return null
            console.error('TestTimer getElapsed error:', error.message);
            return null;
        }
    }
    
    /**
     * Resets timer state and clears measurements for clean timing cycles.
     * Initializes fresh timer state while preserving configuration and metadata
     * for reusable timing measurement across multiple test scenarios.
     * 
     * @returns {TestTimer} Returns this instance for method chaining
     */
    reset() {
        try {
            // Reset all timing state properties for clean measurement cycle
            this.startTime = null;
            this.endTime = null;
            this.isRunning = false;
            this.lastMeasurement = null;
            
            // Clear measurements array if statistics tracking is enabled
            if (this.performanceConfig.trackStatistics) {
                this.measurements = [];
                this.statistics = {
                    min: null,
                    max: null,
                    average: null,
                    total: 0,
                    count: 0
                };
            }
            
            // Update reset metadata for tracking timer usage
            this.metadata.lastReset = new Date().toISOString();
            this.metadata.resetCount = (this.metadata.resetCount || 0) + 1;
            
            // Log timer reset for debugging and tracking
            console.debug(`Timer ${this.metadata.timerId} reset`);
            
            // Return this instance for method chaining
            return this;
            
        } catch (error) {
            // Log reset errors but don't throw to maintain test stability
            console.error('TestTimer reset error:', error.message);
            return this;
        }
    }
    
    /**
     * Gets comprehensive timing statistics for performance analysis and benchmarking.
     * Calculates statistical measures including min, max, average, and percentiles
     * for performance optimization and error handling timing validation.
     * 
     * @returns {Object} Timing statistics object with comprehensive performance metrics
     */
    getStatistics() {
        try {
            // Return empty statistics if no measurements available
            if (!this.performanceConfig.trackStatistics || this.measurements.length === 0) {
                return {
                    count: 0,
                    min: null,
                    max: null,
                    average: null,
                    total: 0,
                    measurements: []
                };
            }
            
            // Calculate comprehensive statistics from measurements array
            const timings = this.measurements.map(m => m.elapsed);
            const sortedTimings = [...timings].sort((a, b) => a - b);
            
            const statistics = {
                count: timings.length,
                min: Math.min(...timings),
                max: Math.max(...timings),
                average: timings.reduce((sum, time) => sum + time, 0) / timings.length,
                total: timings.reduce((sum, time) => sum + time, 0),
                median: this._calculateMedian(sortedTimings),
                percentile95: this._calculatePercentile(sortedTimings, 95),
                percentile99: this._calculatePercentile(sortedTimings, 99),
                standardDeviation: this._calculateStandardDeviation(timings)
            };
            
            // Return comprehensive timing statistics
            return statistics;
            
        } catch (error) {
            // Log statistics calculation errors and return empty statistics
            console.error('TestTimer getStatistics error:', error.message);
            return { count: 0, error: error.message };
        }
    }
    
    /**
     * Updates internal statistics tracking with new measurement.
     * @private
     */
    _updateStatistics(elapsed) {
        this.statistics.count++;
        this.statistics.total += elapsed;
        this.statistics.average = this.statistics.total / this.statistics.count;
        
        if (this.statistics.min === null || elapsed < this.statistics.min) {
            this.statistics.min = elapsed;
        }
        
        if (this.statistics.max === null || elapsed > this.statistics.max) {
            this.statistics.max = elapsed;
        }
    }
    
    /**
     * Calculates median value from sorted array of measurements.
     * @private
     */
    _calculateMedian(sortedArray) {
        const length = sortedArray.length;
        if (length === 0) return null;
        
        const mid = Math.floor(length / 2);
        return length % 2 === 0 
            ? (sortedArray[mid - 1] + sortedArray[mid]) / 2
            : sortedArray[mid];
    }
    
    /**
     * Calculates percentile value from sorted array of measurements.
     * @private
     */
    _calculatePercentile(sortedArray, percentile) {
        if (sortedArray.length === 0) return null;
        
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
    }
    
    /**
     * Calculates standard deviation of timing measurements.
     * @private
     */
    _calculateStandardDeviation(timings) {
        if (timings.length === 0) return null;
        
        const mean = timings.reduce((sum, time) => sum + time, 0) / timings.length;
        const squaredDifferences = timings.map(time => Math.pow(time - mean, 2));
        const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / timings.length;
        
        return Math.sqrt(variance);
    }
}

// ============================================================================
// HTTP REQUEST UTILITIES
// ============================================================================

/**
 * HTTP client utility for making test requests with timing and error handling for
 * integration testing. Provides comprehensive HTTP request functionality with
 * timeout management, error handling, response validation, and performance measurement
 * for error handling integration testing scenarios.
 * 
 * @param {Object} requestConfig - Configuration object for HTTP request
 * @param {string} requestConfig.hostname - Target hostname for HTTP request
 * @param {number} requestConfig.port - Target port for HTTP request  
 * @param {string} requestConfig.path - URL path for HTTP request
 * @param {string} [requestConfig.method='GET'] - HTTP method for request
 * @param {Object} [requestConfig.headers={}] - HTTP headers for request
 * @param {string} [requestConfig.body] - Request body content for POST/PUT requests
 * @param {number} [requestConfig.timeout=5000] - Request timeout in milliseconds
 * @param {boolean} [requestConfig.followRedirects=false] - Follow HTTP redirects
 * @param {string} [requestConfig.correlationId] - Correlation ID for request tracking
 * @returns {Promise<Object>} Promise resolving to HTTP response object with timing and error information
 * 
 * @example
 * const response = await makeTestHttpRequest({
 *   hostname: 'localhost',
 *   port: 3000,
 *   path: '/hello',
 *   method: 'GET',
 *   timeout: 5000,
 *   correlationId: 'hello-test-123'
 * });
 */
function makeTestHttpRequest(requestConfig) {
    return new Promise((resolve, reject) => {
        try {
            // Validate required request configuration parameters
            if (!requestConfig || typeof requestConfig !== 'object') {
                reject(new Error('Request configuration object is required'));
                return;
            }
            
            // Validate hostname parameter for HTTP request
            if (!requestConfig.hostname || typeof requestConfig.hostname !== 'string') {
                reject(new Error('Hostname is required for HTTP request'));
                return;
            }
            
            // Validate port parameter for HTTP request
            if (!requestConfig.port || typeof requestConfig.port !== 'number') {
                reject(new Error('Port number is required for HTTP request'));
                return;
            }
            
            // Validate path parameter for HTTP request
            if (!requestConfig.path || typeof requestConfig.path !== 'string') {
                reject(new Error('URL path is required for HTTP request'));
                return;
            }
            
            // Set default values for optional request parameters
            const {
                hostname,
                port,
                path,
                method = 'GET',
                headers = {},
                body = null,
                timeout = DEFAULT_REQUEST_TIMEOUT,
                followRedirects = false,
                correlationId = generateCorrelationId('http-request')
            } = requestConfig;
            
            // Validate HTTP method parameter
            const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
            const upperMethod = method.toUpperCase();
            if (!validMethods.includes(upperMethod)) {
                reject(new Error(`Invalid HTTP method: ${method}. Valid methods: ${validMethods.join(', ')}`));
                return;
            }
            
            // Validate request body size for memory protection
            if (body && Buffer.byteLength(body, 'utf8') > MAX_REQUEST_BODY_SIZE) {
                reject(new Error(`Request body size exceeds maximum limit: ${MAX_REQUEST_BODY_SIZE} bytes`));
                return;
            }
            
            // Create comprehensive HTTP request headers with defaults and custom headers
            const requestHeaders = {
                ...DEFAULT_TEST_HEADERS,
                'X-Correlation-ID': correlationId,
                'X-Test-Request': 'true',
                'X-Test-Timestamp': new Date().toISOString(),
                ...headers
            };
            
            // Add Content-Length header for requests with body content
            if (body) {
                requestHeaders['Content-Length'] = Buffer.byteLength(body, 'utf8').toString();
            }
            
            // Initialize request timing for performance measurement
            const timer = new TestTimer();
            timer.start();
            
            // Create HTTP request options object for Node.js HTTP client
            const requestOptions = {
                hostname: hostname,
                port: port,
                path: path,
                method: upperMethod,
                headers: requestHeaders,
                timeout: timeout,
                agent: false // Disable connection pooling for test isolation
            };
            
            // Create HTTP request using Node.js built-in HTTP module
            const request = http.request(requestOptions, (response) => {
                try {
                    // Stop timing measurement for response time calculation
                    const responseTime = timer.stop();
                    
                    // Initialize response data collection
                    let responseBody = '';
                    response.setEncoding('utf8');
                    
                    // Collect response data chunks for complete response body
                    response.on('data', (chunk) => {
                        responseBody += chunk;
                    });
                    
                    // Handle response completion and create response object
                    response.on('end', () => {
                        try {
                            // Create comprehensive response object with timing and metadata
                            const testResponse = {
                                // HTTP response properties
                                statusCode: response.statusCode,
                                statusMessage: response.statusMessage,
                                headers: { ...response.headers },
                                body: responseBody,
                                httpVersion: response.httpVersion,
                                
                                // Performance and timing information
                                timing: {
                                    responseTime: responseTime,
                                    startTime: timer.startTime,
                                    endTime: timer.endTime,
                                    timerStatistics: timer.getStatistics()
                                },
                                
                                // Request correlation and tracking information
                                metadata: {
                                    correlationId: correlationId,
                                    requestMethod: upperMethod,
                                    requestPath: path,
                                    requestTimestamp: new Date().toISOString(),
                                    responseReceivedAt: new Date().toISOString()
                                },
                                
                                // Error handling and validation information
                                validation: {
                                    isValidStatusCode: isValidStatusCode(response.statusCode),
                                    statusCategory: getStatusCategory(response.statusCode),
                                    isSuccess: response.statusCode >= 200 && response.statusCode < 300,
                                    isClientError: isClientError(response.statusCode),
                                    isServerError: isServerError(response.statusCode),
                                    responseTimeValid: responseTime < DEFAULT_REQUEST_TIMEOUT
                                }
                            };
                            
                            // Resolve promise with comprehensive response object
                            resolve(testResponse);
                            
                        } catch (responseProcessingError) {
                            // Enhanced error context for response processing failures
                            const processingError = new Error(`Response processing failed: ${responseProcessingError.message}`);
                            processingError.originalError = responseProcessingError;
                            processingError.context = {
                                correlationId,
                                statusCode: response.statusCode,
                                responseTime: timer.getElapsed(),
                                timestamp: new Date().toISOString()
                            };
                            reject(processingError);
                        }
                    });
                    
                    // Handle response stream errors
                    response.on('error', (responseError) => {
                        timer.stop();
                        const streamError = new Error(`Response stream error: ${responseError.message}`);
                        streamError.originalError = responseError;
                        streamError.context = {
                            correlationId,
                            phase: 'response-stream',
                            timestamp: new Date().toISOString()
                        };
                        reject(streamError);
                    });
                    
                } catch (responseHandlerError) {
                    // Enhanced error context for response handler failures
                    timer.stop();
                    const handlerError = new Error(`Response handler error: ${responseHandlerError.message}`);
                    handlerError.originalError = responseHandlerError;
                    handlerError.context = {
                        correlationId,
                        phase: 'response-handler',
                        timestamp: new Date().toISOString()
                    };
                    reject(handlerError);
                }
            });
            
            // Handle request timeout for timeout testing scenarios
            request.setTimeout(timeout, () => {
                timer.stop();
                const timeoutError = new Error(`Request timeout after ${timeout}ms`);
                timeoutError.code = 'ETIMEDOUT';
                timeoutError.context = {
                    correlationId,
                    timeout,
                    hostname,
                    port,
                    path,
                    method: upperMethod,
                    timestamp: new Date().toISOString()
                };
                request.destroy();
                reject(timeoutError);
            });
            
            // Handle request errors including connection failures and network errors
            request.on('error', (requestError) => {
                timer.stop();
                const networkError = new Error(`HTTP request error: ${requestError.message}`);
                networkError.originalError = requestError;
                networkError.code = requestError.code;
                networkError.context = {
                    correlationId,
                    hostname,
                    port,
                    path,
                    method: upperMethod,
                    phase: 'request-error',
                    timestamp: new Date().toISOString()
                };
                reject(networkError);
            });
            
            // Write request body for POST/PUT requests
            if (body) {
                try {
                    request.write(body);
                } catch (writeError) {
                    timer.stop();
                    const bodyError = new Error(`Failed to write request body: ${writeError.message}`);
                    bodyError.originalError = writeError;
                    bodyError.context = {
                        correlationId,
                        bodySize: Buffer.byteLength(body, 'utf8'),
                        timestamp: new Date().toISOString()
                    };
                    reject(bodyError);
                    return;
                }
            }
            
            // Finalize HTTP request and trigger request execution
            request.end();
            
        } catch (error) {
            // Enhanced error context for HTTP request creation failures
            const requestError = new Error(`Failed to create HTTP request: ${error.message}`);
            requestError.originalError = error;
            requestError.context = {
                requestConfig: JSON.stringify(requestConfig, null, 2),
                timestamp: new Date().toISOString()
            };
            reject(requestError);
        }
    });
}

// ============================================================================
// HTTP REQUEST FACTORY FUNCTIONS
// ============================================================================

/**
 * Creates a GET request configuration object for testing HTTP GET operations
 * with error handling and validation. Provides standardized GET request configuration
 * with proper headers and parameters for error handling integration testing.
 * 
 * @param {string} hostname - Target hostname for GET request
 * @param {number} port - Target port for GET request
 * @param {string} path - URL path for GET request
 * @param {Object} [options={}] - Additional request options
 * @param {Object} [options.headers] - Additional headers for GET request
 * @param {number} [options.timeout] - Request timeout override
 * @param {string} [options.correlationId] - Custom correlation ID
 * @returns {Object} GET request configuration for makeTestHttpRequest function
 */
function createGetRequest(hostname, port, path, options = {}) {
    try {
        // Validate required parameters for GET request creation
        if (!hostname || !port || !path) {
            throw new Error('Hostname, port, and path are required for GET request');
        }
        
        // Create comprehensive GET request configuration
        const getRequestConfig = {
            hostname: hostname,
            port: port,
            path: path,
            method: 'GET',
            headers: {
                ...DEFAULT_TEST_HEADERS,
                'Accept': 'text/plain, application/json, */*',
                ...options.headers
            },
            timeout: options.timeout || DEFAULT_REQUEST_TIMEOUT,
            correlationId: options.correlationId || generateCorrelationId('get-request'),
            followRedirects: false
        };
        
        // Return complete GET request configuration
        return getRequestConfig;
        
    } catch (error) {
        // Enhanced error context for GET request creation failures
        const getError = new Error(`Failed to create GET request: ${error.message}`);
        getError.originalError = error;
        getError.context = { hostname, port, path, options };
        throw getError;
    }
}

/**
 * Creates a POST request configuration object for testing HTTP POST operations
 * with body content and error handling. Provides standardized POST request configuration
 * with proper content-type headers and body handling for comprehensive testing.
 * 
 * @param {string} hostname - Target hostname for POST request
 * @param {number} port - Target port for POST request
 * @param {string} path - URL path for POST request
 * @param {string} body - Request body content for POST request
 * @param {Object} [options={}] - Additional request options
 * @returns {Object} POST request configuration for makeTestHttpRequest function
 */
function createPostRequest(hostname, port, path, body, options = {}) {
    try {
        // Validate required parameters for POST request creation
        if (!hostname || !port || !path) {
            throw new Error('Hostname, port, and path are required for POST request');
        }
        
        // Validate body parameter for POST request
        const requestBody = body || '';
        
        // Create comprehensive POST request configuration
        const postRequestConfig = {
            hostname: hostname,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                ...DEFAULT_TEST_HEADERS,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody, 'utf8').toString(),
                ...options.headers
            },
            body: requestBody,
            timeout: options.timeout || DEFAULT_REQUEST_TIMEOUT,
            correlationId: options.correlationId || generateCorrelationId('post-request'),
            followRedirects: false
        };
        
        // Return complete POST request configuration
        return postRequestConfig;
        
    } catch (error) {
        // Enhanced error context for POST request creation failures
        const postError = new Error(`Failed to create POST request: ${error.message}`);
        postError.originalError = error;
        postError.context = { hostname, port, path, body, options };
        throw postError;
    }
}

/**
 * Creates an invalid request configuration object for testing error handling
 * scenarios. Provides intentionally malformed requests for testing error processing
 * pipeline and error response generation with various invalid request patterns.
 * 
 * @param {string} invalidationType - Type of request invalidation to apply
 * @param {Object} [baseConfig={}] - Base request configuration to invalidate
 * @param {Object} [options={}] - Invalidation options and severity
 * @returns {Object} Invalid request configuration for error handling testing
 * 
 * @example
 * const invalidRequest = createInvalidRequest('invalid-method', {
 *   hostname: 'localhost',
 *   port: 3000,
 *   path: '/hello'
 * });
 */
function createInvalidRequest(invalidationType, baseConfig = {}, options = {}) {
    try {
        // Validate invalidation type parameter
        const validInvalidationTypes = [
            'invalid-method',
            'invalid-path',
            'missing-headers',
            'malformed-headers',
            'invalid-body',
            'oversized-request',
            'malformed-url',
            'invalid-protocol'
        ];
        
        if (!validInvalidationTypes.includes(invalidationType)) {
            throw new Error(`Invalid invalidation type: ${invalidationType}. Valid types: ${validInvalidationTypes.join(', ')}`);
        }
        
        // Create base invalid request configuration
        const invalidRequestConfig = {
            hostname: baseConfig.hostname || 'localhost',
            port: baseConfig.port || 3000,
            path: baseConfig.path || '/hello',
            method: baseConfig.method || 'GET',
            headers: { ...DEFAULT_TEST_HEADERS, ...baseConfig.headers },
            timeout: DEFAULT_REQUEST_TIMEOUT,
            correlationId: generateCorrelationId(`invalid-${invalidationType}`)
        };
        
        // Apply specific invalidation based on type
        switch (invalidationType) {
            case 'invalid-method':
                invalidRequestConfig.method = 'INVALID';
                break;
                
            case 'invalid-path':
                invalidRequestConfig.path = '//invalid//path//';
                break;
                
            case 'missing-headers':
                invalidRequestConfig.headers = {}; // Remove all headers
                break;
                
            case 'malformed-headers':
                invalidRequestConfig.headers = {
                    'Invalid Header Name With Spaces': 'invalid-value',
                    '': 'empty-name-header',
                    'header-with-null': null
                };
                break;
                
            case 'invalid-body':
                invalidRequestConfig.method = 'POST';
                invalidRequestConfig.body = '\x00\x01\x02Invalid\nBody\tContent';
                invalidRequestConfig.headers['Content-Type'] = 'application/json'; // Mismatched content type
                break;
                
            case 'oversized-request':
                invalidRequestConfig.method = 'POST';
                invalidRequestConfig.body = 'A'.repeat(MAX_REQUEST_BODY_SIZE + 1000); // Exceed size limit
                break;
                
            case 'malformed-url':
                invalidRequestConfig.path = '/hello\r\n\r\nInjected: header';
                break;
                
            case 'invalid-protocol':
                invalidRequestConfig.hostname = 'https://localhost'; // Protocol in hostname
                break;
                
            default:
                invalidRequestConfig.method = 'INVALID';
        }
        
        // Add invalidation metadata for test tracking
        invalidRequestConfig.metadata = {
            invalidationType: invalidationType,
            intentionallyInvalid: true,
            severity: options.severity || 'medium',
            expectedError: true,
            testCategory: 'error-handling'
        };
        
        // Return invalid request configuration for error testing
        return invalidRequestConfig;
        
    } catch (error) {
        // Enhanced error context for invalid request creation failures
        const invalidError = new Error(`Failed to create invalid request: ${error.message}`);
        invalidError.originalError = error;
        invalidError.context = {
            invalidationType,
            baseConfig,
            options,
            timestamp: new Date().toISOString()
        };
        throw invalidError;
    }
}

// ============================================================================
// REQUEST PERFORMANCE MEASUREMENT
// ============================================================================

/**
 * Measures HTTP request performance with comprehensive timing analysis and
 * performance validation. Executes HTTP request with timing measurement and
 * performance benchmark validation for error handling performance testing.
 * 
 * @param {Object} requestConfig - HTTP request configuration for performance measurement
 * @param {Object} [performanceOptions={}] - Performance measurement options
 * @param {number} [performanceOptions.expectedMaxTime] - Maximum expected response time
 * @param {boolean} [performanceOptions.trackDetailedMetrics=true] - Track detailed timing metrics
 * @param {number} [performanceOptions.warmupRequests=0] - Number of warmup requests
 * @returns {Promise<Object>} Promise resolving to performance measurement results with timing analysis
 * 
 * @example
 * const performance = await measureRequestPerformance({
 *   hostname: 'localhost',
 *   port: 3000,
 *   path: '/hello'
 * }, {
 *   expectedMaxTime: 100,
 *   trackDetailedMetrics: true,
 *   warmupRequests: 3
 * });
 */
async function measureRequestPerformance(requestConfig, performanceOptions = {}) {
    try {
        // Initialize performance measurement configuration
        const options = {
            expectedMaxTime: 100, // Default 100ms threshold
            trackDetailedMetrics: true,
            warmupRequests: 0,
            iterations: 1,
            ...performanceOptions
        };
        
        // Initialize performance tracking timer
        const performanceTimer = new TestTimer();
        const measurements = [];
        
        // Execute warmup requests if specified
        if (options.warmupRequests > 0) {
            console.debug(`Executing ${options.warmupRequests} warmup requests`);
            for (let i = 0; i < options.warmupRequests; i++) {
                try {
                    await makeTestHttpRequest({
                        ...requestConfig,
                        correlationId: generateCorrelationId(`warmup-${i}`)
                    });
                } catch (warmupError) {
                    console.warn(`Warmup request ${i + 1} failed:`, warmupError.message);
                }
            }
        }
        
        // Execute performance measurement iterations
        for (let iteration = 0; iteration < options.iterations; iteration++) {
            try {
                // Start timing measurement for individual request
                performanceTimer.start();
                
                // Execute HTTP request with performance tracking
                const response = await makeTestHttpRequest({
                    ...requestConfig,
                    correlationId: generateCorrelationId(`perf-${iteration}`)
                });
                
                // Stop timing measurement and record results
                const iterationTime = performanceTimer.stop();
                
                // Collect detailed performance metrics if enabled
                const iterationMeasurement = {
                    iteration: iteration + 1,
                    responseTime: iterationTime,
                    statusCode: response.statusCode,
                    isSuccess: response.validation.isSuccess,
                    responseSize: Buffer.byteLength(response.body, 'utf8'),
                    timestamp: new Date().toISOString()
                };
                
                measurements.push(iterationMeasurement);
                
                // Reset timer for next iteration
                performanceTimer.reset();
                
            } catch (iterationError) {
                // Record failed iteration for performance analysis
                measurements.push({
                    iteration: iteration + 1,
                    error: iterationError.message,
                    failed: true,
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        // Calculate comprehensive performance statistics
        const successfulMeasurements = measurements.filter(m => !m.failed);
        const failedMeasurements = measurements.filter(m => m.failed);
        
        const performanceResults = {
            summary: {
                totalIterations: options.iterations,
                successfulRequests: successfulMeasurements.length,
                failedRequests: failedMeasurements.length,
                successRate: (successfulMeasurements.length / options.iterations * 100).toFixed(2)
            },
            timing: {
                averageResponseTime: successfulMeasurements.length > 0 
                    ? (successfulMeasurements.reduce((sum, m) => sum + m.responseTime, 0) / successfulMeasurements.length).toFixed(3)
                    : null,
                minResponseTime: successfulMeasurements.length > 0 
                    ? Math.min(...successfulMeasurements.map(m => m.responseTime)).toFixed(3)
                    : null,
                maxResponseTime: successfulMeasurements.length > 0 
                    ? Math.max(...successfulMeasurements.map(m => m.responseTime)).toFixed(3)
                    : null,
                thresholdValidation: {
                    expectedMaxTime: options.expectedMaxTime,
                    thresholdMet: successfulMeasurements.length > 0 
                        ? Math.max(...successfulMeasurements.map(m => m.responseTime)) <= options.expectedMaxTime
                        : false
                }
            },
            measurements: options.trackDetailedMetrics ? measurements : [],
            metadata: {
                requestConfig: JSON.stringify(requestConfig),
                performanceOptions: JSON.stringify(options),
                measurementTimestamp: new Date().toISOString(),
                correlationId: generateCorrelationId('performance-measurement')
            }
        };
        
        // Return comprehensive performance measurement results
        return performanceResults;
        
    } catch (error) {
        // Enhanced error context for performance measurement failures
        const performanceError = new Error(`Performance measurement failed: ${error.message}`);
        performanceError.originalError = error;
        performanceError.context = {
            requestConfig: JSON.stringify(requestConfig),
            performanceOptions: JSON.stringify(performanceOptions),
            timestamp: new Date().toISOString()
        };
        throw performanceError;
    }
}

// ============================================================================
// REQUEST VALIDATION UTILITIES
// ============================================================================

/**
 * Validates HTTP request configuration for proper request structure and parameters.
 * Performs comprehensive validation of request configuration objects ensuring
 * proper HTTP request format and parameter validation for test execution.
 * 
 * @param {Object} requestConfig - HTTP request configuration to validate
 * @returns {Object} Validation result with detailed validation status and error information
 * 
 * @example
 * const validation = validateRequestConfig({
 *   hostname: 'localhost',
 *   port: 3000,
 *   path: '/hello',
 *   method: 'GET'
 * });
 */
function validateRequestConfig(requestConfig) {
    try {
        // Initialize validation result object
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            correctedConfig: null,
            validationMetadata: {
                validatedAt: new Date().toISOString(),
                validationRules: 'http-request-standards',
                correlationId: generateCorrelationId('request-validation')
            }
        };
        
        // Validate request configuration object structure
        if (!requestConfig || typeof requestConfig !== 'object') {
            validation.isValid = false;
            validation.errors.push('Request configuration must be an object');
            return validation;
        }
        
        // Validate hostname parameter
        if (!requestConfig.hostname || typeof requestConfig.hostname !== 'string') {
            validation.isValid = false;
            validation.errors.push('Hostname is required and must be a string');
        } else if (!/^[a-zA-Z0-9.-]+$/.test(requestConfig.hostname)) {
            validation.warnings.push('Hostname contains unusual characters');
        }
        
        // Validate port parameter
        if (!requestConfig.port || typeof requestConfig.port !== 'number') {
            validation.isValid = false;
            validation.errors.push('Port is required and must be a number');
        } else if (requestConfig.port < 1 || requestConfig.port > 65535) {
            validation.isValid = false;
            validation.errors.push('Port must be between 1 and 65535');
        }
        
        // Validate path parameter
        if (!requestConfig.path || typeof requestConfig.path !== 'string') {
            validation.isValid = false;
            validation.errors.push('Path is required and must be a string');
        } else if (!requestConfig.path.startsWith('/')) {
            validation.warnings.push('Path should start with forward slash');
        }
        
        // Validate HTTP method parameter
        if (requestConfig.method) {
            const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
            if (!validMethods.includes(requestConfig.method.toUpperCase())) {
                validation.isValid = false;
                validation.errors.push(`Invalid HTTP method: ${requestConfig.method}`);
            }
        }
        
        // Validate headers parameter
        if (requestConfig.headers && typeof requestConfig.headers !== 'object') {
            validation.isValid = false;
            validation.errors.push('Headers must be an object');
        }
        
        // Validate timeout parameter
        if (requestConfig.timeout && (typeof requestConfig.timeout !== 'number' || requestConfig.timeout <= 0)) {
            validation.isValid = false;
            validation.errors.push('Timeout must be a positive number');
        }
        
        // Create corrected configuration if validation passed with warnings
        if (validation.isValid && validation.warnings.length > 0) {
            validation.correctedConfig = {
                ...requestConfig,
                path: requestConfig.path.startsWith('/') ? requestConfig.path : `/${requestConfig.path}`,
                method: requestConfig.method ? requestConfig.method.toUpperCase() : 'GET',
                headers: requestConfig.headers || {},
                timeout: requestConfig.timeout || DEFAULT_REQUEST_TIMEOUT
            };
        }
        
        // Return comprehensive validation result
        return validation;
        
    } catch (error) {
        // Return validation error result
        return {
            isValid: false,
            errors: [`Validation error: ${error.message}`],
            warnings: [],
            correctedConfig: null,
            validationMetadata: {
                validatedAt: new Date().toISOString(),
                validationError: error.message,
                correlationId: generateCorrelationId('validation-error')
            }
        };
    }
}

// ============================================================================
// TEST EXECUTION UTILITIES
// ============================================================================

/**
 * Executes multiple HTTP requests with timing and error handling for load testing
 * and concurrent error handling validation. Provides concurrent request execution
 * with comprehensive timing analysis and error aggregation for performance testing.
 * 
 * @param {Array<Object>} requestConfigs - Array of HTTP request configurations
 * @param {Object} [executionOptions={}] - Request execution options
 * @param {number} [executionOptions.concurrency=1] - Number of concurrent requests
 * @param {number} [executionOptions.delay=0] - Delay between requests in milliseconds
 * @param {boolean} [executionOptions.failFast=false] - Stop on first error
 * @returns {Promise<Object>} Promise resolving to execution results with timing and error analysis
 */
async function executeMultipleRequests(requestConfigs, executionOptions = {}) {
    try {
        // Validate request configurations array
        if (!Array.isArray(requestConfigs) || requestConfigs.length === 0) {
            throw new Error('Request configurations array is required and must not be empty');
        }
        
        // Initialize execution options with defaults
        const options = {
            concurrency: 1,
            delay: 0,
            failFast: false,
            timeout: DEFAULT_REQUEST_TIMEOUT,
            trackDetailedMetrics: true,
            ...executionOptions
        };
        
        // Initialize execution tracking and timing
        const executionTimer = new TestTimer();
        const results = [];
        const errors = [];
        
        // Start overall execution timing
        executionTimer.start();
        
        // Execute requests based on concurrency configuration
        if (options.concurrency === 1) {
            // Sequential execution for ordered processing
            for (let i = 0; i < requestConfigs.length; i++) {
                try {
                    // Add delay between requests if specified
                    if (options.delay > 0 && i > 0) {
                        await new Promise(resolve => setTimeout(resolve, options.delay));
                    }
                    
                    // Execute individual request with timing
                    const requestTimer = new TestTimer();
                    requestTimer.start();
                    
                    const response = await makeTestHttpRequest({
                        ...requestConfigs[i],
                        correlationId: generateCorrelationId(`multi-request-${i}`)
                    });
                    
                    const requestTime = requestTimer.stop();
                    
                    // Record successful request result
                    results.push({
                        index: i,
                        success: true,
                        response: response,
                        requestTime: requestTime,
                        timestamp: new Date().toISOString()
                    });
                    
                } catch (requestError) {
                    // Record request error
                    const errorResult = {
                        index: i,
                        success: false,
                        error: requestError.message,
                        errorCode: requestError.code,
                        timestamp: new Date().toISOString()
                    };
                    
                    results.push(errorResult);
                    errors.push(errorResult);
                    
                    // Stop execution if fail-fast mode enabled
                    if (options.failFast) {
                        break;
                    }
                }
            }
        } else {
            // Concurrent execution for parallel processing
            const requestPromises = requestConfigs.map(async (config, index) => {
                try {
                    const requestTimer = new TestTimer();
                    requestTimer.start();
                    
                    const response = await makeTestHttpRequest({
                        ...config,
                        correlationId: generateCorrelationId(`concurrent-${index}`)
                    });
                    
                    const requestTime = requestTimer.stop();
                    
                    return {
                        index: index,
                        success: true,
                        response: response,
                        requestTime: requestTime,
                        timestamp: new Date().toISOString()
                    };
                    
                } catch (requestError) {
                    const errorResult = {
                        index: index,
                        success: false,
                        error: requestError.message,
                        errorCode: requestError.code,
                        timestamp: new Date().toISOString()
                    };
                    
                    errors.push(errorResult);
                    return errorResult;
                }
            });
            
            // Wait for all concurrent requests to complete
            const concurrentResults = await Promise.allSettled(requestPromises);
            results.push(...concurrentResults.map(result => 
                result.status === 'fulfilled' ? result.value : {
                    success: false,
                    error: result.reason?.message || 'Unknown error',
                    timestamp: new Date().toISOString()
                }
            ));
        }
        
        // Stop overall execution timing
        const totalExecutionTime = executionTimer.stop();
        
        // Calculate comprehensive execution statistics
        const successfulRequests = results.filter(r => r.success);
        const failedRequests = results.filter(r => !r.success);
        
        const executionResults = {
            summary: {
                totalRequests: requestConfigs.length,
                successfulRequests: successfulRequests.length,
                failedRequests: failedRequests.length,
                successRate: (successfulRequests.length / requestConfigs.length * 100).toFixed(2),
                totalExecutionTime: totalExecutionTime,
                averageRequestTime: successfulRequests.length > 0 
                    ? (successfulRequests.reduce((sum, r) => sum + (r.requestTime || 0), 0) / successfulRequests.length).toFixed(3)
                    : null
            },
            timing: {
                executionTimer: executionTimer.getStatistics(),
                performanceThresholds: {
                    expectedMaxTime: options.expectedMaxTime,
                    thresholdMet: successfulRequests.every(r => (r.requestTime || 0) <= options.expectedMaxTime)
                }
            },
            results: options.trackDetailedMetrics ? results : [],
            errors: errors,
            metadata: {
                executionOptions: JSON.stringify(options),
                executionId: generateCorrelationId('multi-execution'),
                executedAt: new Date().toISOString()
            }
        };
        
        // Return comprehensive execution results
        return executionResults;
        
    } catch (error) {
        // Enhanced error context for multiple request execution failures
        const executionError = new Error(`Multiple request execution failed: ${error.message}`);
        executionError.originalError = error;
        executionError.context = {
            requestConfigCount: requestConfigs?.length || 0,
            executionOptions: JSON.stringify(executionOptions),
            timestamp: new Date().toISOString()
        };
        throw executionError;
    }
}

// ============================================================================
// UTILITY HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a delay promise for introducing controlled delays in test execution.
 * Provides asynchronous delay functionality for timing-sensitive test scenarios
 * and rate limiting during test execution.
 * 
 * @param {number} milliseconds - Number of milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after specified delay
 */
function delay(milliseconds) {
    return new Promise(resolve => {
        if (typeof milliseconds !== 'number' || milliseconds < 0) {
            resolve(); // Resolve immediately for invalid delays
        } else {
            setTimeout(resolve, milliseconds);
        }
    });
}

/**
 * Validates HTTP response object structure and content for test assertions.
 * Performs comprehensive response validation including status codes, headers,
 * content validation, and HTTP protocol compliance checking.
 * 
 * @param {Object} response - HTTP response object to validate
 * @param {Object} [expectedResponse={}] - Expected response characteristics
 * @returns {Object} Response validation result with detailed validation status
 */
function validateHttpResponse(response, expectedResponse = {}) {
    try {
        // Initialize response validation result object
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            validationDetails: {
                statusCodeValid: false,
                headersValid: false,
                contentValid: false,
                timingValid: false
            },
            validationMetadata: {
                validatedAt: new Date().toISOString(),
                correlationId: generateCorrelationId('response-validation')
            }
        };
        
        // Validate response object structure
        if (!response || typeof response !== 'object') {
            validation.isValid = false;
            validation.errors.push('Response must be an object');
            return validation;
        }
        
        // Validate status code
        if (response.statusCode) {
            validation.validationDetails.statusCodeValid = isValidStatusCode(response.statusCode);
            if (!validation.validationDetails.statusCodeValid) {
                validation.errors.push(`Invalid HTTP status code: ${response.statusCode}`);
                validation.isValid = false;
            }
            
            // Check expected status code if provided
            if (expectedResponse.statusCode && response.statusCode !== expectedResponse.statusCode) {
                validation.errors.push(`Expected status code ${expectedResponse.statusCode}, got ${response.statusCode}`);
                validation.isValid = false;
            }
        } else {
            validation.errors.push('Response missing status code');
            validation.isValid = false;
        }
        
        // Validate headers structure
        if (response.headers) {
            validation.validationDetails.headersValid = typeof response.headers === 'object';
            if (!validation.validationDetails.headersValid) {
                validation.errors.push('Response headers must be an object');
                validation.isValid = false;
            }
            
            // Validate required headers
            const requiredHeaders = ['content-type'];
            requiredHeaders.forEach(header => {
                if (!response.headers[header] && !response.headers[header.toLowerCase()]) {
                    validation.warnings.push(`Missing recommended header: ${header}`);
                }
            });
        } else {
            validation.warnings.push('Response missing headers object');
        }
        
        // Validate response body content
        if (response.body !== undefined) {
            validation.validationDetails.contentValid = typeof response.body === 'string';
            if (!validation.validationDetails.contentValid) {
                validation.warnings.push('Response body should be a string');
            }
            
            // Check expected content if provided
            if (expectedResponse.body && response.body !== expectedResponse.body) {
                validation.warnings.push(`Expected body content "${expectedResponse.body}", got "${response.body}"`);
            }
        }
        
        // Validate timing information
        if (response.timing) {
            validation.validationDetails.timingValid = typeof response.timing === 'object' && 
                typeof response.timing.responseTime === 'number';
            if (!validation.validationDetails.timingValid) {
                validation.warnings.push('Invalid or missing timing information');
            }
        }
        
        // Return comprehensive validation result
        return validation;
        
    } catch (error) {
        // Return validation error result
        return {
            isValid: false,
            errors: [`Response validation error: ${error.message}`],
            warnings: [],
            validationDetails: {},
            validationMetadata: {
                validatedAt: new Date().toISOString(),
                validationError: error.message,
                correlationId: generateCorrelationId('validation-error')
            }
        };
    }
}

/**
 * Creates a comprehensive test context object for tracking test execution state
 * and correlation. Provides test context with timing, correlation, and metadata
 * for comprehensive test execution tracking and debugging capabilities.
 * 
 * @param {Object} [contextConfig={}] - Test context configuration options
 * @param {string} [contextConfig.testName] - Name of the test for identification
 * @param {string} [contextConfig.testType] - Type of test being executed
 * @param {Object} [contextConfig.testData] - Test-specific data and configuration
 * @returns {Object} Test context object with correlation tracking and timing information
 */
function createTestContext(contextConfig = {}) {
    try {
        // Generate unique identifiers for test context tracking
        const testId = generateTestId('context', contextConfig.testType || '');
        const correlationId = generateCorrelationId(contextConfig.testName || 'test-context');
        
        // Create comprehensive test context object
        const testContext = {
            // Test identification and tracking
            testId: testId,
            correlationId: correlationId,
            testName: contextConfig.testName || 'Unnamed Test',
            testType: contextConfig.testType || 'general',
            
            // Test execution timing and measurement
            timing: {
                createdAt: new Date().toISOString(),
                startedAt: null,
                completedAt: null,
                timer: new TestTimer()
            },
            
            // Test data and configuration
            testData: contextConfig.testData || {},
            configuration: {
                timeout: contextConfig.timeout || DEFAULT_REQUEST_TIMEOUT,
                enableDetailedLogging: contextConfig.enableDetailedLogging || false,
                trackPerformance: contextConfig.trackPerformance !== false
            },
            
            // Test state and results tracking
            state: {
                isRunning: false,
                isCompleted: false,
                hasErrors: false,
                errorCount: 0,
                successCount: 0
            },
            
            // Test results and measurements
            results: [],
            errors: [],
            measurements: [],
            
            // Metadata for debugging and analysis
            metadata: {
                version: '1.0.0',
                contextType: 'test-execution-context',
                nodeVersion: process.version,
                platform: process.platform,
                memoryUsage: process.memoryUsage(),
                pid: process.pid
            }
        };
        
        // Return complete test context object
        return testContext;
        
    } catch (error) {
        // Enhanced error context for test context creation failures
        const contextError = new Error(`Failed to create test context: ${error.message}`);
        contextError.originalError = error;
        contextError.context = {
            contextConfig: JSON.stringify(contextConfig),
            timestamp: new Date().toISOString()
        };
        throw contextError;
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export test identification utilities for unique test tracking and correlation
export { generateTestId };
export { generateCorrelationId };

// Export high-precision timing utility class for performance measurement and benchmarking
export { TestTimer };

// Export HTTP client utility for making test requests with error handling and timing
export { makeTestHttpRequest };

// Export HTTP request factory functions for standardized request creation
export { createGetRequest };
export { createPostRequest };
export { createInvalidRequest };

// Export performance measurement utilities for error handling performance testing
export { measureRequestPerformance };

// Export request validation utilities for proper request structure validation
export { validateRequestConfig };
export { validateHttpResponse };

// Export test execution utilities for concurrent testing and load testing
export { executeMultipleRequests };

// Export utility helper functions for test timing and delay management
export { delay };
export { createTestContext };

// Export global constants for test utility configuration and identification
export {
    DEFAULT_REQUEST_TIMEOUT,
    TEST_CORRELATION_PREFIX,
    DEFAULT_TEST_ID_PREFIX,
    TIMER_PRECISION_THRESHOLD,
    MAX_REQUEST_BODY_SIZE,
    DEFAULT_TEST_HEADERS
};

// Default export for convenient access to all test utility functionality
export default {
    // Core utilities
    generateTestId,
    generateCorrelationId,
    TestTimer,
    makeTestHttpRequest,
    
    // Request factories
    createGetRequest,
    createPostRequest,
    createInvalidRequest,
    
    // Performance and validation
    measureRequestPerformance,
    validateRequestConfig,
    validateHttpResponse,
    
    // Execution utilities
    executeMultipleRequests,
    delay,
    createTestContext,
    
    // Constants
    DEFAULT_REQUEST_TIMEOUT,
    TEST_CORRELATION_PREFIX,
    DEFAULT_TEST_ID_PREFIX,
    TIMER_PRECISION_THRESHOLD,
    MAX_REQUEST_BODY_SIZE,
    DEFAULT_TEST_HEADERS
};