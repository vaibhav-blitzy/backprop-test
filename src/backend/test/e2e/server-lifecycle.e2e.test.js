/**
 * Comprehensive Test Utilities Module for Node.js Tutorial Application
 * 
 * Provides foundational testing utilities, performance measurement, correlation tracking,
 * and test execution context management for the Node.js tutorial application testing
 * framework. This module implements high-precision timing utilities, conditional waiting
 * mechanisms, retry logic, test correlation management, and comprehensive test execution
 * context for server lifecycle testing and validation.
 * 
 * Key Features:
 * - Cryptographically secure test ID and correlation ID generation using Node.js crypto
 * - High-precision performance timing using process.hrtime.bigint() for lifecycle measurement
 * - Flexible conditional waiting utilities with timeout handling and validation
 * - Exponential backoff retry mechanisms for handling intermittent test failures
 * - Comprehensive test execution context with metrics collection and reporting
 * - Performance measurement wrapper functions for async operation benchmarking
 * - Educational patterns demonstrating Node.js testing utilities and best practices
 * 
 * Educational Objectives:
 * - Demonstrates comprehensive testing utility development and Node.js built-in module usage
 * - Shows performance measurement integration and high-precision timing for lifecycle testing
 * - Illustrates async operation handling with retry logic and conditional waiting patterns
 * - Provides examples of test correlation and tracking across distributed test execution
 * - Shows test execution context management with metrics collection and reporting
 * - Demonstrates production-ready testing patterns and utility function development
 * 
 * Architecture Integration:
 * - Integrates with server lifecycle testing for startup, shutdown, and restart validation
 * - Uses Node.js crypto module for secure test ID generation and correlation tracking
 * - Incorporates high-precision timing for performance measurement and benchmarking
 * - Utilizes async/await patterns for modern JavaScript testing utility development
 * - Leverages Node.js built-in modules for system integration and performance monitoring
 * 
 * @fileoverview Comprehensive test utilities for Node.js tutorial testing framework
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import Node.js crypto module for cryptographically secure test ID generation
import crypto from 'node:crypto'; // Node.js v22.x LTS - Built-in crypto module for secure random generation

// Import Node.js performance monitoring capabilities for high-precision timing
import { performance } from 'node:perf_hooks'; // Node.js v22.x LTS - Built-in performance hooks for timing measurement

// Import Node.js timers for delay and timeout functionality
import { setTimeout as setTimeoutAsync } from 'node:timers/promises'; // Node.js v22.x LTS - Promise-based setTimeout

// ============================================================================
// GLOBAL TEST UTILITY CONSTANTS
// ============================================================================

/**
 * Test correlation prefix for generating unique test identifiers and correlation tracking.
 * Provides consistent prefix for test correlation IDs to enable tracking and debugging
 * across distributed test execution and parallel test scenarios.
 */
const TEST_CORRELATION_PREFIX = 'test-utils-';

/**
 * Default timeout duration in milliseconds for conditional waiting operations.
 * Provides reasonable timeout for test synchronization and conditional waiting
 * while ensuring tests don't hang indefinitely during validation operations.
 */
const DEFAULT_WAIT_TIMEOUT = 5000;

/**
 * Default retry attempts for retry utility functions with exponential backoff.
 * Provides standard retry count for handling intermittent failures during
 * test execution while preventing excessive retry attempts that could slow tests.
 */
const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Default delay interval in milliseconds for conditional waiting operations.
 * Provides standard polling interval for condition checking during test
 * synchronization without excessive resource consumption or validation overhead.
 */
const DEFAULT_WAIT_INTERVAL = 100;

/**
 * Maximum backoff delay in milliseconds for retry operations with exponential backoff.
 * Prevents retry delays from becoming excessively long while maintaining
 * reasonable retry intervals for handling intermittent test failures.
 */
const MAX_BACKOFF_DELAY = 10000;

/**
 * Performance measurement precision configuration for high-precision timing operations.
 * Defines the precision level for performance measurements to ensure accurate
 * timing data collection for server lifecycle performance validation.
 */
const PERFORMANCE_PRECISION = {
    nanoseconds: 1000000, // Conversion factor for nanoseconds to milliseconds
    microseconds: 1000,   // Conversion factor for microseconds to milliseconds
    resolution: 'milliseconds' // Default resolution for timing measurements
};

// ============================================================================
// TEST IDENTIFICATION AND CORRELATION UTILITIES
// ============================================================================

/**
 * Generates cryptographically secure unique test identifier for test correlation and tracking
 * across test execution. Creates robust unique identifiers with test type context and
 * temporal correlation using Node.js crypto module for comprehensive test tracking.
 * 
 * @param {string} [testType='general'] - Type of test for identifier context and categorization
 * @param {string} [configType='test'] - Configuration type for identifier structure and correlation
 * @returns {string} Cryptographically secure unique test identifier with test type and correlation prefix
 * 
 * @example
 * const testId = generateTestId('lifecycle', 'e2e');
 * console.log(testId); // "test-utils-lifecycle-e2e-1724123456-a1b2c3d4e5f6"
 * 
 * const correlationId = generateTestId('startup', 'performance');
 * console.log(correlationId); // "test-utils-startup-performance-1724123456-f6e5d4c3b2a1"
 */
function generateTestId(testType = 'general', configType = 'test') {
    try {
        // Generate cryptographically random component for uniqueness guarantee
        const randomBytes = crypto.randomBytes(8);
        const randomComponent = randomBytes.toString('hex');
        
        // Include test type and configuration type in identifier structure
        const typeComponent = `${testType}-${configType}`;
        
        // Add timestamp component for temporal correlation and debugging
        const timestampComponent = Date.now().toString(36);
        
        // Apply TEST_CORRELATION_PREFIX for consistent identifier formatting
        const testIdentifier = `${TEST_CORRELATION_PREFIX}${typeComponent}-${timestampComponent}-${randomComponent}`;
        
        // Return cryptographically secure unique test identifier for correlation tracking
        return testIdentifier;
        
    } catch (error) {
        // Fallback identifier generation if crypto operations fail
        const fallbackId = `${TEST_CORRELATION_PREFIX}${testType}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        return fallbackId;
    }
}

/**
 * Generates unique correlation identifier for tracking server lifecycle test execution
 * and debugging across test scenarios. This function serves as an alias for generateTestId
 * with correlation-specific naming for test tracking and execution correlation.
 * 
 * @param {string} [testType='correlation'] - Type of test for correlation context
 * @param {string} [executionType='general'] - Execution type for correlation tracking
 * @returns {string} Unique correlation identifier for test execution tracking and debugging
 * 
 * @example
 * const correlationId = generateCorrelationId('lifecycle', 'startup');
 * console.log(correlationId); // "test-utils-lifecycle-startup-1724123456-a1b2c3d4e5f6"
 */
function generateCorrelationId(testType = 'correlation', executionType = 'general') {
    // Use generateTestId function with correlation-specific parameter naming
    return generateTestId(testType, executionType);
}

// ============================================================================
// HIGH-PRECISION TIMING UTILITIES
// ============================================================================

/**
 * High-precision timing utility class for measuring server lifecycle performance including
 * startup and shutdown timing with nanosecond precision. Implements comprehensive timing
 * measurement using Node.js process.hrtime.bigint() for accurate performance benchmarking
 * and server lifecycle operation validation.
 * 
 * This class provides:
 * - High-precision timing measurement using process.hrtime.bigint()
 * - Performance metrics calculation and statistical analysis
 * - Multiple timing session management with correlation tracking
 * - Memory-efficient timing data storage and retrieval
 * - Comprehensive timing validation and performance assessment
 */
class TestTimer {
    /**
     * Initializes high-precision test timer with correlation tracking and performance
     * monitoring configuration for comprehensive timing measurement and validation.
     * 
     * @param {Object} [options={}] - Timer configuration options and precision settings
     * @param {string} [options.correlationId] - Correlation ID for timing session tracking
     * @param {string} [options.resolution='milliseconds'] - Timing resolution for measurement precision
     * @param {boolean} [options.enableMetrics=true] - Enable comprehensive metrics collection
     */
    constructor(options = {}) {
        // Initialize timer configuration with defaults
        this.options = {
            correlationId: options.correlationId || generateTestId('timer', 'session'),
            resolution: options.resolution || PERFORMANCE_PRECISION.resolution,
            enableMetrics: options.enableMetrics !== false,
            ...options
        };
        
        // Initialize timing state and measurement tracking
        this.startTime = null;
        this.endTime = null;
        this.isRunning = false;
        this.sessionId = crypto.randomUUID();
        
        // Initialize performance metrics collection and statistical tracking
        this.metrics = {
            measurements: [],
            totalMeasurements: 0,
            averageTime: 0,
            minTime: Number.MAX_SAFE_INTEGER,
            maxTime: 0,
            lastMeasurement: null
        };
        
        // Track timer creation timestamp for lifecycle management
        this.createdAt = Date.now();
        this.timerName = `TestTimer-${this.sessionId.slice(0, 8)}`;
    }
    
    /**
     * Starts high-precision timing measurement using process.hrtime.bigint() for nanosecond
     * precision. Implements comprehensive timing session management with validation and
     * state tracking for accurate performance measurement.
     * 
     * @param {string} [measurementName] - Optional name for timing measurement identification
     * @returns {TestTimer} Timer instance for method chaining and fluent interface
     * 
     * @throws {Error} Timing operation errors if timer is already running or invalid state
     * 
     * @example
     * const timer = new TestTimer();
     * timer.start('server-startup');
     * // ... perform operation ...
     * const elapsed = timer.stop();
     */
    start(measurementName) {
        try {
            // Validate timer state before starting new measurement
            if (this.isRunning) {
                throw new Error(`Timer is already running. Stop current measurement before starting new one.`);
            }
            
            // Initialize new timing measurement session
            this.startTime = process.hrtime.bigint();
            this.endTime = null;
            this.isRunning = true;
            this.currentMeasurementName = measurementName || `measurement-${this.metrics.totalMeasurements + 1}`;
            
            // Record measurement start in metrics collection
            if (this.options.enableMetrics) {
                this.metrics.lastMeasurement = {
                    name: this.currentMeasurementName,
                    startedAt: new Date().toISOString(),
                    correlationId: this.options.correlationId
                };
            }
            
            // Return timer instance for method chaining
            return this;
            
        } catch (error) {
            // Enhanced error context for timing start failures
            const timingError = new Error(`Failed to start timer: ${error.message}`);
            timingError.originalError = error;
            timingError.context = {
                measurementName,
                timerState: this.isRunning ? 'running' : 'stopped',
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            throw timingError;
        }
    }
    
    /**
     * Stops timing measurement and calculates elapsed time with high precision using
     * process.hrtime.bigint(). Implements comprehensive measurement completion with
     * statistical analysis and performance metrics collection.
     * 
     * @returns {number} Elapsed time in milliseconds with high precision for performance analysis
     * 
     * @throws {Error} Timing operation errors if timer is not running or invalid state
     * 
     * @example
     * const timer = new TestTimer();
     * timer.start();
     * await someAsyncOperation();
     * const elapsedMs = timer.stop(); // Returns elapsed time in milliseconds
     */
    stop() {
        try {
            // Validate timer state for measurement completion
            if (!this.isRunning) {
                throw new Error('Timer is not running. Call start() before stop().');
            }
            
            // Capture end time with high precision
            this.endTime = process.hrtime.bigint();
            this.isRunning = false;
            
            // Calculate elapsed time in nanoseconds and convert to milliseconds
            const elapsedNanoseconds = this.endTime - this.startTime;
            const elapsedMilliseconds = Number(elapsedNanoseconds) / PERFORMANCE_PRECISION.nanoseconds;
            
            // Update performance metrics and statistical tracking
            if (this.options.enableMetrics) {
                this._updateMetrics(elapsedMilliseconds);
            }
            
            // Return elapsed time in milliseconds for performance analysis
            return elapsedMilliseconds;
            
        } catch (error) {
            // Enhanced error context for timing stop failures
            const timingError = new Error(`Failed to stop timer: ${error.message}`);
            timingError.originalError = error;
            timingError.context = {
                timerState: this.isRunning ? 'running' : 'stopped',
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            throw timingError;
        }
    }
    
    /**
     * Retrieves current elapsed time without stopping the timer for intermediate measurement
     * and progress monitoring during long-running operations. Provides non-intrusive timing
     * measurement for monitoring operation progress without affecting timer state.
     * 
     * @returns {number} Current elapsed time in milliseconds without stopping timer
     * 
     * @throws {Error} Timing operation errors if timer is not running
     * 
     * @example
     * const timer = new TestTimer();
     * timer.start();
     * // ... some operation ...
     * const intermediate = timer.getElapsed(); // Get current elapsed time
     * // ... continue operation ...
     * const final = timer.stop(); // Get final elapsed time
     */
    getElapsed() {
        try {
            // Validate timer state for elapsed time calculation
            if (!this.isRunning) {
                throw new Error('Timer is not running. Call start() to begin timing.');
            }
            
            // Calculate current elapsed time with high precision
            const currentTime = process.hrtime.bigint();
            const elapsedNanoseconds = currentTime - this.startTime;
            const elapsedMilliseconds = Number(elapsedNanoseconds) / PERFORMANCE_PRECISION.nanoseconds;
            
            // Return current elapsed time without stopping timer
            return elapsedMilliseconds;
            
        } catch (error) {
            // Enhanced error context for elapsed time calculation failures
            const elapsedError = new Error(`Failed to get elapsed time: ${error.message}`);
            elapsedError.originalError = error;
            elapsedError.context = {
                timerState: this.isRunning ? 'running' : 'stopped',
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            throw elapsedError;
        }
    }
    
    /**
     * Retrieves comprehensive performance metrics including statistical analysis and timing
     * data for server lifecycle performance validation. Provides detailed performance
     * analysis with statistical calculations and measurement history.
     * 
     * @returns {Object} Comprehensive performance metrics with statistical analysis and measurement history
     * 
     * @example
     * const timer = new TestTimer();
     * // ... perform multiple measurements ...
     * const metrics = timer.getPerformanceMetrics();
     * console.log('Average time:', metrics.averageTime);
     * console.log('Total measurements:', metrics.totalMeasurements);
     */
    getPerformanceMetrics() {
        try {
            // Calculate comprehensive statistical metrics from measurement history
            const statistics = this._calculateStatistics();
            
            // Create comprehensive performance metrics object
            const performanceMetrics = {
                // Basic timing statistics
                totalMeasurements: this.metrics.totalMeasurements,
                averageTime: this.metrics.averageTime,
                minTime: this.metrics.minTime === Number.MAX_SAFE_INTEGER ? 0 : this.metrics.minTime,
                maxTime: this.metrics.maxTime,
                
                // Advanced statistical analysis
                statistics: statistics,
                
                // Timer session information
                sessionInfo: {
                    sessionId: this.sessionId,
                    correlationId: this.options.correlationId,
                    timerName: this.timerName,
                    createdAt: new Date(this.createdAt).toISOString(),
                    resolution: this.options.resolution
                },
                
                // Current timer state
                currentState: {
                    isRunning: this.isRunning,
                    currentElapsed: this.isRunning ? this.getElapsed() : null,
                    lastMeasurement: this.metrics.lastMeasurement
                },
                
                // Measurement history (last 100 measurements for memory efficiency)
                measurementHistory: this.metrics.measurements.slice(-100),
                
                // Performance assessment and recommendations
                assessment: this._generatePerformanceAssessment(statistics)
            };
            
            // Return comprehensive performance metrics for analysis
            return performanceMetrics;
            
        } catch (error) {
            // Return minimal metrics on error to prevent test failures
            return {
                totalMeasurements: this.metrics.totalMeasurements,
                averageTime: this.metrics.averageTime,
                error: error.message,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Resets timer state and clears measurement history for fresh measurement sessions.
     * Implements comprehensive state reset including metrics clearing and session
     * reinitialization for isolated test execution.
     * 
     * @returns {TestTimer} Timer instance for method chaining
     */
    reset() {
        try {
            // Reset timer state for fresh measurement session
            this.startTime = null;
            this.endTime = null;
            this.isRunning = false;
            this.currentMeasurementName = null;
            
            // Clear performance metrics and measurement history
            this.metrics = {
                measurements: [],
                totalMeasurements: 0,
                averageTime: 0,
                minTime: Number.MAX_SAFE_INTEGER,
                maxTime: 0,
                lastMeasurement: null
            };
            
            // Generate new session ID for fresh measurement correlation
            this.sessionId = crypto.randomUUID();
            this.timerName = `TestTimer-${this.sessionId.slice(0, 8)}`;
            this.createdAt = Date.now();
            
            // Return timer instance for method chaining
            return this;
            
        } catch (error) {
            // Log reset errors but don't throw to maintain test stability
            console.error('Timer reset failed:', error.message);
            return this;
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Updates performance metrics with new measurement data.
     * @private
     */
    _updateMetrics(elapsedTime) {
        // Add measurement to history
        this.metrics.measurements.push({
            time: elapsedTime,
            name: this.currentMeasurementName,
            timestamp: new Date().toISOString(),
            correlationId: this.options.correlationId
        });
        
        // Update statistical tracking
        this.metrics.totalMeasurements++;
        this.metrics.minTime = Math.min(this.metrics.minTime, elapsedTime);
        this.metrics.maxTime = Math.max(this.metrics.maxTime, elapsedTime);
        
        // Calculate running average
        this.metrics.averageTime = this.metrics.measurements.reduce((sum, m) => sum + m.time, 0) / this.metrics.totalMeasurements;
        
        // Update last measurement reference
        this.metrics.lastMeasurement = {
            time: elapsedTime,
            name: this.currentMeasurementName,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Calculates comprehensive statistical analysis of timing measurements.
     * @private
     */
    _calculateStatistics() {
        const measurements = this.metrics.measurements.map(m => m.time);
        
        if (measurements.length === 0) {
            return {
                count: 0,
                sum: 0,
                mean: 0,
                median: 0,
                standardDeviation: 0,
                variance: 0
            };
        }
        
        const count = measurements.length;
        const sum = measurements.reduce((acc, val) => acc + val, 0);
        const mean = sum / count;
        
        // Calculate variance and standard deviation
        const variance = measurements.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
        const standardDeviation = Math.sqrt(variance);
        
        // Calculate median
        const sorted = [...measurements].sort((a, b) => a - b);
        const median = count % 2 === 0 
            ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
            : sorted[Math.floor(count / 2)];
        
        return {
            count,
            sum,
            mean,
            median,
            standardDeviation,
            variance,
            percentiles: this._calculatePercentiles(sorted)
        };
    }
    
    /**
     * Calculates performance percentiles for statistical analysis.
     * @private
     */
    _calculatePercentiles(sortedMeasurements) {
        if (sortedMeasurements.length === 0) return {};
        
        const getPercentile = (arr, percentile) => {
            const index = Math.ceil((percentile / 100) * arr.length) - 1;
            return arr[Math.max(0, index)];
        };
        
        return {
            p50: getPercentile(sortedMeasurements, 50),
            p75: getPercentile(sortedMeasurements, 75),
            p90: getPercentile(sortedMeasurements, 90),
            p95: getPercentile(sortedMeasurements, 95),
            p99: getPercentile(sortedMeasurements, 99)
        };
    }
    
    /**
     * Generates performance assessment and recommendations.
     * @private
     */
    _generatePerformanceAssessment(statistics) {
        const assessment = {
            overall: 'unknown',
            recommendations: [],
            warnings: []
        };
        
        if (statistics.mean < 100) {
            assessment.overall = 'excellent';
        } else if (statistics.mean < 500) {
            assessment.overall = 'good';
        } else if (statistics.mean < 1000) {
            assessment.overall = 'acceptable';
            assessment.recommendations.push('Consider optimization for better performance');
        } else {
            assessment.overall = 'poor';
            assessment.warnings.push('Performance below acceptable thresholds');
            assessment.recommendations.push('Performance optimization required');
        }
        
        if (statistics.standardDeviation > statistics.mean * 0.5) {
            assessment.warnings.push('High performance variability detected');
            assessment.recommendations.push('Investigate performance consistency');
        }
        
        return assessment;
    }
}

// ============================================================================
// CONDITIONAL WAITING AND SYNCHRONIZATION UTILITIES
// ============================================================================

/**
 * Conditional waiting utility for server lifecycle synchronization including startup and
 * shutdown validation. Implements flexible conditional waiting with timeout handling,
 * polling intervals, and comprehensive error handling for test synchronization.
 * 
 * @param {Function} condition - Async function that returns true when condition is met
 * @param {Object} [options={}] - Waiting configuration options and timeout settings
 * @param {number} [options.timeout=DEFAULT_WAIT_TIMEOUT] - Maximum wait time in milliseconds
 * @param {number} [options.interval=DEFAULT_WAIT_INTERVAL] - Polling interval in milliseconds
 * @param {string} [options.description='condition'] - Description for logging and error reporting
 * @param {boolean} [options.throwOnTimeout=true] - Throw error on timeout vs return false
 * @returns {Promise<boolean>} Promise resolving to true when condition met or false on timeout
 * 
 * @throws {Error} Timeout errors when condition not met within specified timeout duration
 * 
 * @example
 * // Wait for server to be running
 * await waitForCondition(
 *   async () => server.isRunning(),
 *   { timeout: 10000, description: 'server startup' }
 * );
 * 
 * // Wait for health check to pass
 * await waitForCondition(
 *   async () => {
 *     const health = await server.getHealthStatus();
 *     return health.status === 'healthy';
 *   },
 *   { timeout: 5000, interval: 500, description: 'server health' }
 * );
 */
async function waitForCondition(condition, options = {}) {
    // Initialize waiting options with defaults
    const waitOptions = {
        timeout: DEFAULT_WAIT_TIMEOUT,
        interval: DEFAULT_WAIT_INTERVAL,
        description: 'condition',
        throwOnTimeout: true,
        correlationId: generateTestId('wait', 'condition'),
        ...options
    };
    
    // Validate condition parameter
    if (typeof condition !== 'function') {
        throw new Error('Condition must be a function that returns a boolean or Promise<boolean>');
    }
    
    try {
        // Initialize timing for timeout management
        const startTime = Date.now();
        let attempts = 0;
        
        // Continue polling until condition met or timeout reached
        while (Date.now() - startTime < waitOptions.timeout) {
            attempts++;
            
            try {
                // Evaluate condition function with error handling
                const conditionResult = await condition();
                
                // Check if condition is satisfied
                if (conditionResult === true) {
                    // Return success with timing information
                    return true;
                }
                
                // Wait for polling interval before next check
                await delay(waitOptions.interval);
                
            } catch (conditionError) {
                // Log condition evaluation errors but continue polling
                console.warn(`Condition evaluation error (attempt ${attempts}):`, {
                    error: conditionError.message,
                    description: waitOptions.description,
                    correlationId: waitOptions.correlationId,
                    timestamp: new Date().toISOString()
                });
                
                // Wait before retry on condition errors
                await delay(waitOptions.interval);
            }
        }
        
        // Handle timeout condition based on configuration
        const timeoutMessage = `Timeout waiting for ${waitOptions.description} after ${waitOptions.timeout}ms (${attempts} attempts)`;
        
        if (waitOptions.throwOnTimeout) {
            // Throw comprehensive timeout error with context
            const timeoutError = new Error(timeoutMessage);
            timeoutError.context = {
                description: waitOptions.description,
                timeout: waitOptions.timeout,
                attempts: attempts,
                correlationId: waitOptions.correlationId,
                elapsedTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
            throw timeoutError;
        } else {
            // Return false on timeout when throwOnTimeout disabled
            return false;
        }
        
    } catch (error) {
        // Enhanced error context for conditional waiting failures
        if (error.context) {
            // Re-throw timeout errors with existing context
            throw error;
        }
        
        const waitError = new Error(`Conditional waiting failed: ${error.message}`);
        waitError.originalError = error;
        waitError.context = {
            description: waitOptions.description,
            options: waitOptions,
            timestamp: new Date().toISOString()
        };
        throw waitError;
    }
}

// ============================================================================
// RETRY AND RESILIENCE UTILITIES
// ============================================================================

/**
 * Retry utility for handling intermittent failures during server lifecycle transitions
 * with exponential backoff and comprehensive error handling. Implements robust retry
 * logic with configurable attempts, backoff strategies, and failure classification.
 * 
 * @param {Function} asyncOperation - Async function to retry on failure
 * @param {Object} [options={}] - Retry configuration options and backoff settings
 * @param {number} [options.maxAttempts=DEFAULT_RETRY_ATTEMPTS] - Maximum retry attempts
 * @param {number} [options.baseDelay=100] - Base delay in milliseconds for exponential backoff
 * @param {number} [options.maxDelay=MAX_BACKOFF_DELAY] - Maximum delay between retries
 * @param {Function} [options.shouldRetry] - Custom function to determine if error should trigger retry
 * @param {string} [options.description='operation'] - Operation description for logging
 * @returns {Promise<any>} Promise resolving to operation result or rejecting with final error
 * 
 * @throws {Error} Operation failure after all retry attempts exhausted
 * 
 * @example
 * // Retry server startup with exponential backoff
 * const result = await retry(
 *   async () => server.start(),
 *   { 
 *     maxAttempts: 5, 
 *     baseDelay: 200,
 *     description: 'server startup'
 *   }
 * );
 * 
 * // Retry with custom retry condition
 * await retry(
 *   async () => makeHttpRequest(),
 *   {
 *     shouldRetry: (error) => error.code === 'ECONNREFUSED',
 *     description: 'HTTP request'
 *   }
 * );
 */
async function retry(asyncOperation, options = {}) {
    // Initialize retry options with defaults
    const retryOptions = {
        maxAttempts: DEFAULT_RETRY_ATTEMPTS,
        baseDelay: 100,
        maxDelay: MAX_BACKOFF_DELAY,
        shouldRetry: null, // Default: retry all errors
        description: 'operation',
        correlationId: generateTestId('retry', 'operation'),
        ...options
    };
    
    // Validate async operation parameter
    if (typeof asyncOperation !== 'function') {
        throw new Error('Async operation must be a function');
    }
    
    // Initialize retry tracking variables
    let lastError;
    let attempt = 0;
    const retryLog = [];
    
    try {
        // Execute retry loop with exponential backoff
        while (attempt < retryOptions.maxAttempts) {
            attempt++;
            
            try {
                // Execute async operation with error handling
                const result = await asyncOperation();
                
                // Log successful retry completion if previous attempts failed
                if (attempt > 1) {
                    console.info(`Retry successful for ${retryOptions.description}`, {
                        attempt: attempt,
                        totalAttempts: retryOptions.maxAttempts,
                        correlationId: retryOptions.correlationId,
                        previousFailures: retryLog.length,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Return successful operation result
                return result;
                
            } catch (error) {
                // Track retry attempt and error details
                lastError = error;
                retryLog.push({
                    attempt: attempt,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
                // Check if this error should trigger retry using custom logic
                if (retryOptions.shouldRetry && !retryOptions.shouldRetry(error)) {
                    // Don't retry for this error type
                    throw error;
                }
                
                // Check if more attempts are available
                if (attempt >= retryOptions.maxAttempts) {
                    // Exhausted all retry attempts
                    break;
                }
                
                // Calculate exponential backoff delay with jitter for retry timing
                const exponentialDelay = Math.min(
                    retryOptions.baseDelay * Math.pow(2, attempt - 1),
                    retryOptions.maxDelay
                );
                
                // Add random jitter to prevent thundering herd
                const jitter = Math.random() * 0.1 * exponentialDelay;
                const delayWithJitter = exponentialDelay + jitter;
                
                // Log retry attempt with timing information
                console.warn(`Retry attempt ${attempt}/${retryOptions.maxAttempts} for ${retryOptions.description}`, {
                    error: error.message,
                    nextRetryIn: Math.round(delayWithJitter),
                    correlationId: retryOptions.correlationId,
                    timestamp: new Date().toISOString()
                });
                
                // Wait before next retry attempt
                await delay(delayWithJitter);
            }
        }
        
        // Create comprehensive retry failure error with context
        const retryError = new Error(`Retry failed for ${retryOptions.description} after ${attempt} attempts: ${lastError.message}`);
        retryError.originalError = lastError;
        retryError.context = {
            description: retryOptions.description,
            maxAttempts: retryOptions.maxAttempts,
            actualAttempts: attempt,
            correlationId: retryOptions.correlationId,
            retryLog: retryLog,
            timestamp: new Date().toISOString()
        };
        
        // Throw final retry failure error
        throw retryError;
        
    } catch (error) {
        // Enhanced error context for retry operation failures
        if (error.context) {
            // Re-throw retry errors with existing context
            throw error;
        }
        
        const operationError = new Error(`Retry operation failed: ${error.message}`);
        operationError.originalError = error;
        operationError.context = {
            description: retryOptions.description,
            attempt: attempt,
            correlationId: retryOptions.correlationId,
            timestamp: new Date().toISOString()
        };
        throw operationError;
    }
}

// ============================================================================
// TIMING AND DELAY UTILITIES
// ============================================================================

/**
 * Delay utility for server lifecycle testing timing control and synchronization using
 * Node.js promise-based setTimeout. Implements non-blocking delay operations with
 * correlation tracking and comprehensive error handling for test timing control.
 * 
 * @param {number} milliseconds - Delay duration in milliseconds for timing control
 * @param {Object} [options={}] - Delay options and configuration settings
 * @param {string} [options.correlationId] - Correlation ID for delay tracking
 * @param {string} [options.description='delay'] - Description for logging and debugging
 * @returns {Promise<void>} Promise that resolves after specified delay duration
 * 
 * @throws {Error} Delay operation errors for invalid parameters or timing failures
 * 
 * @example
 * // Simple delay for test timing
 * await delay(1000); // Wait 1 second
 * 
 * // Delay with correlation tracking
 * await delay(500, { 
 *   correlationId: 'test-123',
 *   description: 'server startup delay'
 * });
 */
async function delay(milliseconds, options = {}) {
    // Initialize delay options with defaults
    const delayOptions = {
        correlationId: options.correlationId || generateTestId('delay', 'utility'),
        description: options.description || 'delay',
        ...options
    };
    
    try {
        // Validate delay duration parameter
        if (typeof milliseconds !== 'number' || milliseconds < 0) {
            throw new Error(`Invalid delay duration: ${milliseconds}. Must be non-negative number.`);
        }
        
        // Handle zero delay case immediately
        if (milliseconds === 0) {
            return Promise.resolve();
        }
        
        // Use Node.js promise-based setTimeout for non-blocking delay
        await setTimeoutAsync(milliseconds);
        
        // Return resolved promise after delay completion
        return Promise.resolve();
        
    } catch (error) {
        // Enhanced error context for delay operation failures
        const delayError = new Error(`Delay operation failed: ${error.message}`);
        delayError.originalError = error;
        delayError.context = {
            milliseconds,
            description: delayOptions.description,
            correlationId: delayOptions.correlationId,
            timestamp: new Date().toISOString()
        };
        throw delayError;
    }
}

// ============================================================================
// PERFORMANCE MEASUREMENT UTILITIES
// ============================================================================

/**
 * Performance measurement function for server lifecycle operations timing and benchmarking
 * with comprehensive metrics collection. Wraps async operations with high-precision timing
 * measurement and statistical analysis for server lifecycle performance validation.
 * 
 * @param {Function} asyncOperation - Async function to measure for performance analysis
 * @param {Object} [options={}] - Performance measurement options and configuration
 * @param {string} [options.name='operation'] - Operation name for measurement identification
 * @param {string} [options.correlationId] - Correlation ID for measurement tracking
 * @param {boolean} [options.includeMemory=false] - Include memory usage measurement
 * @param {boolean} [options.includeResourceUsage=false] - Include CPU and resource usage
 * @returns {Promise<Object>} Performance measurement result with timing metrics and resource usage
 * 
 * @throws {Error} Performance measurement errors if operation fails or measurement invalid
 * 
 * @example
 * // Measure server startup performance
 * const result = await measurePerformance(
 *   async () => server.start(),
 *   { 
 *     name: 'server-startup',
 *     includeMemory: true,
 *     correlationId: 'lifecycle-test-123'
 *   }
 * );
 * console.log('Startup time:', result.elapsedTime);
 * console.log('Memory usage:', result.memoryUsage);
 */
async function measurePerformance(asyncOperation, options = {}) {
    // Initialize performance measurement options with defaults
    const measurementOptions = {
        name: 'operation',
        correlationId: options.correlationId || generateTestId('performance', 'measurement'),
        includeMemory: options.includeMemory || false,
        includeResourceUsage: options.includeResourceUsage || false,
        resolution: 'milliseconds',
        ...options
    };
    
    // Validate async operation parameter
    if (typeof asyncOperation !== 'function') {
        throw new Error('Async operation must be a function');
    }
    
    try {
        // Initialize performance measurement tracking
        const performanceData = {
            name: measurementOptions.name,
            correlationId: measurementOptions.correlationId,
            startTime: Date.now(),
            endTime: null,
            elapsedTime: null,
            success: false,
            error: null
        };
        
        // Capture initial memory usage if requested
        let initialMemory = null;
        let finalMemory = null;
        if (measurementOptions.includeMemory) {
            initialMemory = process.memoryUsage();
        }
        
        // Capture initial CPU usage if requested
        let initialCpuUsage = null;
        let finalCpuUsage = null;
        if (measurementOptions.includeResourceUsage) {
            initialCpuUsage = process.cpuUsage();
        }
        
        // Create high-precision timer for operation measurement
        const timer = new TestTimer({
            correlationId: measurementOptions.correlationId,
            resolution: measurementOptions.resolution
        });
        
        // Start high-precision timing measurement
        timer.start(measurementOptions.name);
        
        try {
            // Execute async operation with error handling
            const operationResult = await asyncOperation();
            
            // Stop timing and calculate elapsed time
            const elapsedTime = timer.stop();
            performanceData.elapsedTime = elapsedTime;
            performanceData.endTime = Date.now();
            performanceData.success = true;
            performanceData.result = operationResult;
            
            // Capture final resource usage measurements
            if (measurementOptions.includeMemory) {
                finalMemory = process.memoryUsage();
                performanceData.memoryUsage = this._calculateMemoryDelta(initialMemory, finalMemory);
            }
            
            if (measurementOptions.includeResourceUsage) {
                finalCpuUsage = process.cpuUsage(initialCpuUsage);
                performanceData.cpuUsage = {
                    user: finalCpuUsage.user / 1000, // Convert microseconds to milliseconds
                    system: finalCpuUsage.system / 1000
                };
            }
            
            // Include comprehensive timing metrics from TestTimer
            performanceData.timerMetrics = timer.getPerformanceMetrics();
            
            // Calculate performance statistics and assessment
            performanceData.assessment = this._generatePerformanceAssessment(performanceData);
            
            // Return comprehensive performance measurement result
            return performanceData;
            
        } catch (operationError) {
            // Stop timer on operation failure
            const elapsedTime = timer.isRunning ? timer.stop() : null;
            
            // Record failure information
            performanceData.elapsedTime = elapsedTime;
            performanceData.endTime = Date.now();
            performanceData.success = false;
            performanceData.error = {
                message: operationError.message,
                stack: operationError.stack,
                name: operationError.name
            };
            
            // Include timer metrics even for failed operations
            performanceData.timerMetrics = timer.getPerformanceMetrics();
            
            // Create operation failure error with performance context
            const performanceError = new Error(`Operation '${measurementOptions.name}' failed: ${operationError.message}`);
            performanceError.originalError = operationError;
            performanceError.performanceData = performanceData;
            performanceError.context = {
                name: measurementOptions.name,
                correlationId: measurementOptions.correlationId,
                elapsedTime: elapsedTime,
                timestamp: new Date().toISOString()
            };
            
            throw performanceError;
        }
        
    } catch (error) {
        // Enhanced error context for performance measurement failures
        if (error.performanceData) {
            // Re-throw operation errors with existing performance context
            throw error;
        }
        
        const measurementError = new Error(`Performance measurement failed: ${error.message}`);
        measurementError.originalError = error;
        measurementError.context = {
            measurementOptions,
            timestamp: new Date().toISOString()
        };
        throw measurementError;
    }
}

/**
 * Calculates memory usage delta between initial and final measurements.
 * @private
 * @param {Object} initial - Initial memory usage from process.memoryUsage()
 * @param {Object} final - Final memory usage from process.memoryUsage()
 * @returns {Object} Memory usage delta with detailed breakdown
 */
function _calculateMemoryDelta(initial, final) {
    return {
        rss: final.rss - initial.rss,
        heapUsed: final.heapUsed - initial.heapUsed,
        heapTotal: final.heapTotal - initial.heapTotal,
        external: final.external - initial.external,
        arrayBuffers: final.arrayBuffers - initial.arrayBuffers,
        initial: initial,
        final: final
    };
}

/**
 * Generates performance assessment and recommendations based on measurement data.
 * @private
 * @param {Object} performanceData - Performance measurement data
 * @returns {Object} Performance assessment with recommendations
 */
function _generatePerformanceAssessment(performanceData) {
    const assessment = {
        overall: 'unknown',
        recommendations: [],
        warnings: [],
        score: 0
    };
    
    // Assess timing performance
    if (performanceData.elapsedTime < 100) {
        assessment.overall = 'excellent';
        assessment.score += 40;
    } else if (performanceData.elapsedTime < 500) {
        assessment.overall = 'good';
        assessment.score += 30;
    } else if (performanceData.elapsedTime < 1000) {
        assessment.overall = 'acceptable';
        assessment.score += 20;
        assessment.recommendations.push('Consider optimization for better performance');
    } else {
        assessment.overall = 'poor';
        assessment.score += 10;
        assessment.warnings.push('Performance below acceptable thresholds');
        assessment.recommendations.push('Performance optimization required');
    }
    
    // Assess memory usage if available
    if (performanceData.memoryUsage) {
        const memoryDelta = performanceData.memoryUsage.heapUsed;
        if (memoryDelta < 1024 * 1024) { // Less than 1MB
            assessment.score += 30;
        } else if (memoryDelta < 5 * 1024 * 1024) { // Less than 5MB
            assessment.score += 20;
        } else {
            assessment.warnings.push('High memory usage detected');
            assessment.recommendations.push('Review memory allocation patterns');
        }
    }
    
    // Assess success status
    if (performanceData.success) {
        assessment.score += 30;
    } else {
        assessment.warnings.push('Operation failed during measurement');
        assessment.overall = 'failed';
    }
    
    return assessment;
}

// ============================================================================
// TEST EXECUTION CONTEXT MANAGEMENT
// ============================================================================

/**
 * Test execution context for managing server lifecycle test state and metrics collection
 * with comprehensive test tracking, metrics aggregation, and reporting capabilities.
 * Provides centralized test state management with correlation tracking and comprehensive
 * metrics collection for server lifecycle testing validation.
 * 
 * This class provides:
 * - Centralized test state management and correlation tracking
 * - Comprehensive metrics collection and statistical analysis
 * - Test execution reporting with detailed performance analysis
 * - Test correlation and identification across test execution
 * - Memory-efficient test data storage and retrieval
 * - Educational patterns for test context management
 */
class TestExecutionContext {
    /**
     * Initializes test execution context with correlation tracking, metrics collection,
     * and comprehensive test state management for server lifecycle testing validation.
     * 
     * @param {Object} [options={}] - Test execution context options and configuration
     * @param {string} [options.testSuiteName='Test Suite'] - Test suite name for identification
     * @param {string} [options.correlationId] - Correlation ID for test execution tracking
     * @param {boolean} [options.enableMetrics=true] - Enable comprehensive metrics collection
     * @param {boolean} [options.enableReporting=true] - Enable test result reporting
     */
    constructor(options = {}) {
        try {
            // Initialize test execution context configuration
            this.options = {
                testSuiteName: options.testSuiteName || 'Test Suite',
                correlationId: options.correlationId || generateTestId('execution', 'context'),
                enableMetrics: options.enableMetrics !== false,
                enableReporting: options.enableReporting !== false,
                ...options
            };
            
            // Initialize test execution state and tracking
            this.sessionId = crypto.randomUUID();
            this.testSuiteName = this.options.testSuiteName;
            this.correlationId = this.options.correlationId;
            this.startTime = Date.now();
            this.endTime = null;
            this.isActive = true;
            
            // Initialize comprehensive metrics collection storage
            this.metrics = {
                // Test execution metrics
                testCount: 0,
                passedTests: 0,
                failedTests: 0,
                skippedTests: 0,
                
                // Performance metrics
                totalExecutionTime: 0,
                averageTestTime: 0,
                minTestTime: Number.MAX_SAFE_INTEGER,
                maxTestTime: 0,
                
                // Lifecycle metrics
                startupMetrics: [],
                shutdownMetrics: [],
                restartMetrics: [],
                healthCheckMetrics: [],
                
                // Error tracking
                errorCount: 0,
                errorTypes: new Map(),
                criticalErrors: [],
                
                // Custom metrics storage
                customMetrics: new Map()
            };
            
            // Initialize test results tracking and correlation management
            this.testResults = [];
            this.testHistory = [];
            this.correlationMap = new Map();
            
            // Initialize performance timing utilities
            this.globalTimer = new TestTimer({
                correlationId: this.correlationId,
                enableMetrics: true
            });
            
            // Track context creation for lifecycle management
            this.createdAt = new Date().toISOString();
            
        } catch (error) {
            // Enhanced error context for test execution context initialization failures
            const contextError = new Error(`TestExecutionContext initialization failed: ${error.message}`);
            contextError.originalError = error;
            contextError.context = {
                options: JSON.stringify(options, null, 2),
                timestamp: new Date().toISOString()
            };
            throw contextError;
        }
    }
    
    /**
     * Adds performance metric to test execution context with correlation tracking and
     * statistical analysis. Implements comprehensive metric storage with validation,
     * correlation tracking, and statistical calculation for test performance analysis.
     * 
     * @param {string} metricName - Name of the metric for identification and categorization
     * @param {number|Object} metricValue - Metric value or complex metric object with detailed data
     * @param {Object} [metricOptions={}] - Metric options and metadata configuration
     * @param {string} [metricOptions.category='general'] - Metric category for organization
     * @param {string} [metricOptions.unit='ms'] - Metric unit for proper interpretation
     * @param {string} [metricOptions.testCorrelationId] - Test correlation ID for metric tracking
     * @returns {TestExecutionContext} Context instance for method chaining and fluent interface
     * 
     * @example
     * // Add simple timing metric
     * context.addMetric('startup-time', 1250, { category: 'lifecycle', unit: 'ms' });
     * 
     * // Add complex metric with detailed data
     * context.addMetric('server-health', {
     *   status: 'healthy',
     *   responseTime: 45,
     *   availability: 100
     * }, { category: 'health', testCorrelationId: 'health-test-123' });
     */
    addMetric(metricName, metricValue, metricOptions = {}) {
        try {
            // Initialize metric options with defaults
            const options = {
                category: 'general',
                unit: 'ms',
                testCorrelationId: options.testCorrelationId || generateTestId('metric', metricName),
                timestamp: new Date().toISOString(),
                ...metricOptions
            };
            
            // Validate metric name and value parameters
            if (!metricName || typeof metricName !== 'string') {
                throw new Error('Metric name must be a non-empty string');
            }
            
            if (metricValue === null || metricValue === undefined) {
                throw new Error('Metric value cannot be null or undefined');
            }
            
            // Create comprehensive metric object with metadata
            const metricObject = {
                name: metricName,
                value: metricValue,
                category: options.category,
                unit: options.unit,
                correlationId: options.testCorrelationId,
                sessionId: this.sessionId,
                timestamp: options.timestamp,
                contextCorrelation: this.correlationId
            };
            
            // Store metric in appropriate category collection
            this._storeMetricByCategory(metricObject);
            
            // Update statistical calculations for numeric metrics
            if (typeof metricValue === 'number') {
                this._updateStatisticalMetrics(metricName, metricValue, options.category);
            }
            
            // Add metric to correlation mapping for test tracking
            this.correlationMap.set(options.testCorrelationId, {
                metricName: metricName,
                category: options.category,
                timestamp: options.timestamp
            });
            
            // Track total metrics count
            this.metrics.testCount++;
            
            // Return context instance for method chaining
            return this;
            
        } catch (error) {
            // Enhanced error context for metric addition failures
            const metricError = new Error(`Failed to add metric '${metricName}': ${error.message}`);
            metricError.originalError = error;
            metricError.context = {
                metricName,
                metricValue: typeof metricValue === 'object' ? JSON.stringify(metricValue) : metricValue,
                metricOptions: JSON.stringify(metricOptions, null, 2),
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            };
            throw metricError;
        }
    }
    
    /**
     * Retrieves comprehensive test execution results with metrics analysis and statistical
     * summary. Provides complete test execution summary with performance analysis,
     * error tracking, and statistical calculations for test validation and reporting.
     * 
     * @param {Object} [resultOptions={}] - Result retrieval options and filtering configuration
     * @param {boolean} [resultOptions.includeHistory=false] - Include complete test history
     * @param {boolean} [resultOptions.includeStatistics=true] - Include statistical analysis
     * @param {string} [resultOptions.format='detailed'] - Result format (detailed, summary, raw)
     * @returns {Object} Comprehensive test execution results with metrics analysis and correlation data
     * 
     * @example
     * // Get detailed test results
     * const results = context.getResults({ includeHistory: true });
     * console.log('Test success rate:', results.successRate);
     * console.log('Average execution time:', results.statistics.averageTime);
     * 
     * // Get summary results only
     * const summary = context.getResults({ format: 'summary' });
     * console.log('Tests passed:', summary.passedTests);
     */
    getResults(resultOptions = {}) {
        try {
            // Initialize result retrieval options with defaults
            const options = {
                includeHistory: false,
                includeStatistics: true,
                format: 'detailed',
                ...resultOptions
            };
            
            // Calculate current execution duration
            const currentTime = Date.now();
            const executionDuration = this.endTime ? 
                (this.endTime - this.startTime) : 
                (currentTime - this.startTime);
            
            // Calculate test execution success rate and statistics
            const totalTests = this.metrics.testCount;
            const successRate = totalTests > 0 ? 
                (this.metrics.passedTests / totalTests) * 100 : 0;
            
            // Create base results object with execution summary
            const baseResults = {
                // Test execution summary
                sessionId: this.sessionId,
                correlationId: this.correlationId,
                testSuiteName: this.testSuiteName,
                
                // Execution timing information
                startTime: new Date(this.startTime).toISOString(),
                endTime: this.endTime ? new Date(this.endTime).toISOString() : null,
                executionDuration: executionDuration,
                isActive: this.isActive,
                
                // Test count and success tracking
                testCounts: {
                    total: totalTests,
                    passed: this.metrics.passedTests,
                    failed: this.metrics.failedTests,
                    skipped: this.metrics.skippedTests,
                    successRate: Math.round(successRate * 100) / 100
                },
                
                // Error summary and tracking
                errorSummary: {
                    totalErrors: this.metrics.errorCount,
                    criticalErrors: this.metrics.criticalErrors.length,
                    errorTypes: Object.fromEntries(this.metrics.errorTypes),
                    errorRate: totalTests > 0 ? (this.metrics.errorCount / totalTests) * 100 : 0
                }
            };
            
            // Add statistical analysis if requested
            if (options.includeStatistics) {
                baseResults.statistics = this._calculateExecutionStatistics();
            }
            
            // Add test history if requested
            if (options.includeHistory) {
                baseResults.testHistory = this.testHistory;
                baseResults.correlationMap = Object.fromEntries(this.correlationMap);
            }
            
            // Format results based on requested format
            switch (options.format) {
                case 'summary':
                    return this._formatSummaryResults(baseResults);
                case 'raw':
                    return this._formatRawResults(baseResults);
                case 'detailed':
                default:
                    return this._formatDetailedResults(baseResults);
            }
            
        } catch (error) {
            // Return minimal results on error to prevent test failures
            return {
                sessionId: this.sessionId,
                correlationId: this.correlationId,
                error: error.message,
                timestamp: new Date().toISOString(),
                isActive: this.isActive
            };
        }
    }
    
    /**
     * Generates comprehensive test execution report with performance analysis, metrics
     * summary, and educational insights for monitoring and documentation. Creates detailed
     * test report with correlation tracking and performance recommendations.
     * 
     * @param {Object} [reportOptions={}] - Report generation options and formatting configuration
     * @param {string} [reportOptions.format='detailed'] - Report format (detailed, summary, json)
     * @param {boolean} [reportOptions.includeRecommendations=true] - Include performance recommendations
     * @param {boolean} [reportOptions.includeCorrelation=true] - Include correlation tracking data
     * @returns {Object} Comprehensive test execution report with analysis and recommendations
     * 
     * @example
     * // Generate detailed test report
     * const report = context.generateReport({ includeRecommendations: true });
     * console.log('Test Report:', report.summary);
     * console.log('Recommendations:', report.recommendations);
     * 
     * // Generate JSON report for automated processing
     * const jsonReport = context.generateReport({ format: 'json' });
     */
    generateReport(reportOptions = {}) {
        try {
            // Initialize report generation options with defaults
            const options = {
                format: 'detailed',
                includeRecommendations: true,
                includeCorrelation: true,
                includePerformanceAnalysis: true,
                ...reportOptions
            };
            
            // Mark test execution as complete if not already done
            if (this.isActive) {
                this.endTime = Date.now();
                this.isActive = false;
            }
            
            // Get comprehensive test execution results
            const executionResults = this.getResults({
                includeHistory: options.includeCorrelation,
                includeStatistics: options.includePerformanceAnalysis
            });
            
            // Create comprehensive test execution report
            const testReport = {
                // Report metadata and identification
                reportId: generateTestId('report', 'generation'),
                sessionId: this.sessionId,
                correlationId: this.correlationId,
                testSuiteName: this.testSuiteName,
                generatedAt: new Date().toISOString(),
                
                // Executive summary of test execution
                executiveSummary: {
                    testSuite: this.testSuiteName,
                    executionDuration: executionResults.executionDuration,
                    totalTests: executionResults.testCounts.total,
                    successRate: executionResults.testCounts.successRate,
                    overallStatus: this._determineOverallStatus(executionResults),
                    keyFindings: this._generateKeyFindings(executionResults)
                },
                
                // Detailed test execution results
                executionResults: executionResults,
                
                // Performance analysis and benchmarking
                performanceAnalysis: options.includePerformanceAnalysis ? 
                    this._generatePerformanceAnalysis() : null,
                
                // Correlation tracking and test identification
                correlationData: options.includeCorrelation ? {
                    sessionCorrelation: this.sessionId,
                    testCorrelations: Object.fromEntries(this.correlationMap),
                    correlationCount: this.correlationMap.size
                } : null,
                
                // Performance recommendations and optimization suggestions
                recommendations: options.includeRecommendations ? 
                    this._generateRecommendations(executionResults) : null,
                
                // Test execution metadata and context
                metadata: {
                    reportFormat: options.format,
                    nodeVersion: process.version,
                    platform: process.platform,
                    architecture: process.arch,
                    memoryUsage: process.memoryUsage(),
                    uptime: process.uptime()
                }
            };
            
            // Format report based on requested format
            switch (options.format) {
                case 'summary':
                    return {
                        sessionId: testReport.sessionId,
                        summary: testReport.executiveSummary,
                        recommendations: testReport.recommendations?.slice(0, 3) || []
                    };
                    
                case 'json':
                    return JSON.stringify(testReport, null, 2);
                    
                case 'detailed':
                default:
                    return testReport;
            }
            
        } catch (error) {
            // Return minimal report on error to prevent test failures
            return {
                sessionId: this.sessionId,
                correlationId: this.correlationId,
                error: error.message,
                timestamp: new Date().toISOString(),
                reportStatus: 'failed'
            };
        }
    }
    
    /**
     * Completes test execution context and finalizes metrics collection for comprehensive
     * test execution completion. Implements proper test context cleanup with final
     * metrics calculation and execution summary generation.
     * 
     * @returns {Object} Test execution completion summary with final metrics and analysis
     */
    complete() {
        try {
            // Mark test execution as complete
            this.endTime = Date.now();
            this.isActive = false;
            
            // Stop global timer if running
            if (this.globalTimer.isRunning) {
                this.globalTimer.stop();
            }
            
            // Calculate final execution statistics
            const executionSummary = {
                sessionId: this.sessionId,
                correlationId: this.correlationId,
                testSuiteName: this.testSuiteName,
                completedAt: new Date().toISOString(),
                executionDuration: this.endTime - this.startTime,
                
                // Final test counts and success metrics
                finalMetrics: {
                    totalTests: this.metrics.testCount,
                    successRate: this.metrics.testCount > 0 ? 
                        (this.metrics.passedTests / this.metrics.testCount) * 100 : 0,
                    errorRate: this.metrics.testCount > 0 ? 
                        (this.metrics.errorCount / this.metrics.testCount) * 100 : 0,
                    averageTestTime: this.metrics.averageTestTime
                },
                
                // Performance assessment
                performanceAssessment: this._generateFinalPerformanceAssessment(),
                
                // Test execution status
                executionStatus: this._determineExecutionStatus()
            };
            
            // Return test execution completion summary
            return executionSummary;
            
        } catch (error) {
            // Return minimal completion data on error
            return {
                sessionId: this.sessionId,
                correlationId: this.correlationId,
                error: error.message,
                completedAt: new Date().toISOString(),
                executionStatus: 'error'
            };
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Stores metric in appropriate category collection.
     * @private
     */
    _storeMetricByCategory(metricObject) {
        const category = metricObject.category;
        
        // Store in category-specific collections
        switch (category) {
            case 'lifecycle':
                if (metricObject.name.includes('startup')) {
                    this.metrics.startupMetrics.push(metricObject);
                } else if (metricObject.name.includes('shutdown')) {
                    this.metrics.shutdownMetrics.push(metricObject);
                } else if (metricObject.name.includes('restart')) {
                    this.metrics.restartMetrics.push(metricObject);
                }
                break;
                
            case 'health':
                this.metrics.healthCheckMetrics.push(metricObject);
                break;
                
            default:
                // Store in custom metrics collection
                if (!this.metrics.customMetrics.has(category)) {
                    this.metrics.customMetrics.set(category, []);
                }
                this.metrics.customMetrics.get(category).push(metricObject);
        }
    }
    
    /**
     * Updates statistical metrics for numeric values.
     * @private
     */
    _updateStatisticalMetrics(metricName, metricValue, category) {
        if (typeof metricValue === 'number') {
            // Update min/max tracking
            this.metrics.minTestTime = Math.min(this.metrics.minTestTime, metricValue);
            this.metrics.maxTestTime = Math.max(this.metrics.maxTestTime, metricValue);
            
            // Update average calculation
            if (this.metrics.testCount > 0) {
                this.metrics.averageTestTime = 
                    (this.metrics.averageTestTime * (this.metrics.testCount - 1) + metricValue) / this.metrics.testCount;
            } else {
                this.metrics.averageTestTime = metricValue;
            }
        }
    }
    
    /**
     * Calculates comprehensive execution statistics.
     * @private
     */
    _calculateExecutionStatistics() {
        return {
            executionTime: {
                total: this.endTime ? (this.endTime - this.startTime) : (Date.now() - this.startTime),
                average: this.metrics.averageTestTime,
                min: this.metrics.minTestTime === Number.MAX_SAFE_INTEGER ? 0 : this.metrics.minTestTime,
                max: this.metrics.maxTestTime
            },
            testMetrics: {
                lifecycle: {
                    startup: this.metrics.startupMetrics.length,
                    shutdown: this.metrics.shutdownMetrics.length,
                    restart: this.metrics.restartMetrics.length
                },
                health: this.metrics.healthCheckMetrics.length,
                custom: this.metrics.customMetrics.size
            }
        };
    }
    
    /**
     * Determines overall test execution status.
     * @private
     */
    _determineOverallStatus(results) {
        if (results.testCounts.failed === 0 && results.errorSummary.totalErrors === 0) {
            return 'success';
        } else if (results.testCounts.successRate >= 80) {
            return 'partial_success';
        } else {
            return 'failure';
        }
    }
    
    /**
     * Generates key findings from test execution.
     * @private
     */
    _generateKeyFindings(results) {
        const findings = [];
        
        if (results.testCounts.successRate === 100) {
            findings.push('All tests passed successfully');
        } else if (results.testCounts.successRate >= 80) {
            findings.push('Most tests passed with some failures');
        } else {
            findings.push('Significant test failures detected');
        }
        
        if (results.statistics?.executionTime?.average < 100) {
            findings.push('Excellent performance characteristics');
        } else if (results.statistics?.executionTime?.average > 1000) {
            findings.push('Performance optimization opportunities identified');
        }
        
        return findings;
    }
    
    /**
     * Generates performance analysis from collected metrics.
     * @private
     */
    _generatePerformanceAnalysis() {
        return {
            startupPerformance: this._analyzeLifecycleMetrics(this.metrics.startupMetrics),
            shutdownPerformance: this._analyzeLifecycleMetrics(this.metrics.shutdownMetrics),
            restartPerformance: this._analyzeLifecycleMetrics(this.metrics.restartMetrics),
            healthCheckPerformance: this._analyzeLifecycleMetrics(this.metrics.healthCheckMetrics),
            overallPerformance: {
                averageTime: this.metrics.averageTestTime,
                minTime: this.metrics.minTestTime,
                maxTime: this.metrics.maxTestTime,
                totalMeasurements: this.metrics.testCount
            }
        };
    }
    
    /**
     * Analyzes lifecycle metrics for performance assessment.
     * @private
     */
    _analyzeLifecycleMetrics(metricsArray) {
        if (metricsArray.length === 0) {
            return { count: 0, averageTime: 0, analysis: 'No data available' };
        }
        
        const values = metricsArray
            .map(m => typeof m.value === 'number' ? m.value : 0)
            .filter(v => v > 0);
        
        if (values.length === 0) {
            return { count: metricsArray.length, averageTime: 0, analysis: 'No numeric data' };
        }
        
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        
        return {
            count: values.length,
            averageTime: average,
            minTime: min,
            maxTime: max,
            analysis: average < 100 ? 'Excellent' : average < 500 ? 'Good' : 'Needs optimization'
        };
    }
    
    /**
     * Generates recommendations based on test execution results.
     * @private
     */
    _generateRecommendations(results) {
        const recommendations = [];
        
        if (results.testCounts.successRate < 100) {
            recommendations.push('Investigate failed tests for reliability improvements');
        }
        
        if (results.statistics?.executionTime?.average > 500) {
            recommendations.push('Consider performance optimization for faster test execution');
        }
        
        if (results.errorSummary.errorRate > 10) {
            recommendations.push('Review error handling and test stability');
        }
        
        if (this.metrics.customMetrics.size === 0) {
            recommendations.push('Consider adding custom metrics for better test insights');
        }
        
        return recommendations;
    }
    
    /**
     * Generates final performance assessment.
     * @private
     */
    _generateFinalPerformanceAssessment() {
        return {
            overallRating: this.metrics.passedTests === this.metrics.testCount ? 'Excellent' : 'Needs Improvement',
            performanceScore: Math.round((this.metrics.passedTests / Math.max(1, this.metrics.testCount)) * 100),
            executionEfficiency: this.metrics.averageTestTime < 100 ? 'High' : 'Medium',
            reliabilityScore: Math.round(((this.metrics.testCount - this.metrics.errorCount) / Math.max(1, this.metrics.testCount)) * 100)
        };
    }
    
    /**
     * Determines final execution status.
     * @private
     */
    _determineExecutionStatus() {
        if (this.metrics.criticalErrors.length > 0) {
            return 'critical_failure';
        } else if (this.metrics.failedTests === 0) {
            return 'success';
        } else if (this.metrics.passedTests > this.metrics.failedTests) {
            return 'partial_success';
        } else {
            return 'failure';
        }
    }
    
    /**
     * Formats detailed results output.
     * @private
     */
    _formatDetailedResults(baseResults) {
        return {
            ...baseResults,
            format: 'detailed',
            generatedAt: new Date().toISOString()
        };
    }
    
    /**
     * Formats summary results output.
     * @private
     */
    _formatSummaryResults(baseResults) {
        return {
            sessionId: baseResults.sessionId,
            testSuiteName: baseResults.testSuiteName,
            successRate: baseResults.testCounts.successRate,
            executionDuration: baseResults.executionDuration,
            status: baseResults.overallStatus || 'completed',
            format: 'summary'
        };
    }
    
    /**
     * Formats raw results output.
     * @private
     */
    _formatRawResults(baseResults) {
        return {
            metrics: this.metrics,
            testResults: this.testResults,
            correlationMap: Object.fromEntries(this.correlationMap),
            format: 'raw'
        };
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export test identification and correlation utilities
export { generateTestId };
export { generateCorrelationId };

// Export high-precision timing utilities
export { TestTimer };

// Export conditional waiting and synchronization utilities
export { waitForCondition };

// Export performance measurement utilities
export { measurePerformance };

// Export retry and resilience utilities
export { retry };

// Export timing and delay utilities
export { delay };

// Export test execution context management
export { TestExecutionContext };

// Export global test utility constants for external use
export {
    TEST_CORRELATION_PREFIX,
    DEFAULT_WAIT_TIMEOUT,
    DEFAULT_RETRY_ATTEMPTS,
    DEFAULT_WAIT_INTERVAL,
    MAX_BACKOFF_DELAY,
    PERFORMANCE_PRECISION
};

// Default export for convenient access to all test utilities
export default {
    // Core utilities
    generateTestId,
    generateCorrelationId,
    TestTimer,
    waitForCondition,
    measurePerformance,
    retry,
    delay,
    TestExecutionContext,
    
    // Constants
    TEST_CORRELATION_PREFIX,
    DEFAULT_WAIT_TIMEOUT,
    DEFAULT_RETRY_ATTEMPTS,
    DEFAULT_WAIT_INTERVAL,
    MAX_BACKOFF_DELAY,
    PERFORMANCE_PRECISION,
    
    // Utility functions
    createTimer: (options) => new TestTimer(options),
    createExecutionContext: (options) => new TestExecutionContext(options)
};