/**
 * Comprehensive Error Handling Demonstration Module for Node.js Tutorial Application
 * 
 * This module serves as an educational showcase of production-ready error handling patterns
 * in Node.js applications, demonstrating practical error scenarios, classification systems,
 * secure response generation, and comprehensive logging strategies. The module provides
 * hands-on examples of different error types including client errors (4xx), server errors (5xx),
 * validation errors, and parsing errors with proper correlation tracking and recovery mechanisms.
 * 
 * Educational Objectives:
 * - Demonstrate industry-standard error handling patterns and best practices
 * - Showcase error classification systems for appropriate HTTP status codes
 * - Illustrate secure error response generation to prevent information disclosure
 * - Provide comprehensive error recovery strategies and graceful degradation
 * - Educational clarity for learning Node.js error management concepts
 * - Production-ready patterns while maintaining tutorial simplicity
 * 
 * Architecture Integration:
 * - Utilizes ErrorHandler class for centralized error processing and classification
 * - Integrates Logger class for structured error logging and correlation tracking
 * - Demonstrates Application and HttpServer integration for complete error scenarios
 * - Shows proper HTTP status code usage and secure error message sanitization
 * - Event-driven error handling with comprehensive monitoring and debugging
 * 
 * Key Features:
 * - Complete error handling lifecycle demonstration with real-world scenarios
 * - Error classification by type, severity, and appropriate response strategies
 * - Secure error messaging with sanitization and correlation ID tracking
 * - Performance impact analysis and error recovery pattern demonstrations
 * - Educational explanations with production-ready implementation examples
 * - Integration testing scenarios for comprehensive error handling validation
 * 
 * @fileoverview Comprehensive error handling demonstration module with educational patterns
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// EXTERNAL MODULE IMPORTS - Node.js Built-in Modules
// ============================================================================

// Node.js built-in HTTP module for creating mock HTTP request and response objects
const http = require('node:http'); // Node.js v18+

// Node.js event emitter for demonstrating error event handling and propagation patterns
const { EventEmitter } = require('node:events'); // Node.js v18+

// ============================================================================
// INTERNAL MODULE IMPORTS - Application Components
// ============================================================================

// Core error handling class for demonstrating comprehensive error processing and response generation
const { 
    ErrorHandler, 
    classifyError, 
    sanitizeErrorMessage, 
    generateErrorId 
} = require('../lib/error-handler.js');

// Structured logging system for demonstrating error logging patterns and debugging information output
const { Logger } = require('../utils/logger.js');

// Main application class for demonstrating error handling in complete application context
const { Application, createApplication } = require('../app.js');

// HTTP server class for demonstrating server-level error handling scenarios
const { HttpServer } = require('../lib/http-server.js');

// Error message constants for demonstrating standardized error communication
const { 
    ERROR_MESSAGES, 
    HTTP_ERROR_MESSAGES 
} = require('../constants/error-messages.js');

// HTTP status code constants for demonstrating proper error status code usage
const { HTTP_STATUS_CODES } = require('../utils/http-status.js');

// ============================================================================
// GLOBAL CONSTANTS AND DEMONSTRATION CONFIGURATION
// ============================================================================

/**
 * Error handling demonstration scenarios organized by error type and complexity level.
 * These scenarios provide comprehensive coverage of different error conditions and handling strategies.
 */
const EXAMPLE_SCENARIOS = {
    CLIENT_ERROR_SCENARIOS: [
        'bad_request',
        'not_found',
        'method_not_allowed',
        'invalid_headers',
        'malformed_url'
    ],
    SERVER_ERROR_SCENARIOS: [
        'internal_error',
        'processing_error',
        'timeout_error',
        'memory_error',
        'configuration_error'
    ],
    PARSE_ERROR_SCENARIOS: [
        'malformed_request',
        'invalid_headers',
        'truncated_data',
        'encoding_error',
        'protocol_violation'
    ],
    VALIDATION_ERROR_SCENARIOS: [
        'missing_parameters',
        'invalid_format',
        'out_of_range',
        'type_mismatch',
        'constraint_violation'
    ]
};

/**
 * Demonstration configuration settings for error handling examples and educational clarity.
 * These settings control the verbosity and detail level of error handling demonstrations.
 */
const DEMO_CONFIG = {
    enableVerboseLogging: true,
    includeStackTrace: true,
    logErrorDetails: true,
    sanitizeErrorMessages: true,
    enableErrorCorrelation: true,
    showEducationalExplanations: true,
    includePerformanceMetrics: true,
    demonstrateRecoveryStrategies: true
};

/**
 * Error simulation settings for creating realistic error scenarios without actual system failures.
 * These settings allow controlled error generation for educational purposes.
 */
const ERROR_SIMULATION_SETTINGS = {
    simulateNetworkErrors: false,
    simulateMemoryErrors: false,
    simulateTimeoutErrors: false,
    maxRetryAttempts: 3,
    retryDelay: 1000,
    errorProbability: 0.1,
    randomErrorGeneration: false
};

/**
 * Educational content structure for providing learning context and explanations.
 * These constants organize educational information for different error handling concepts.
 */
const EDUCATIONAL_CONTENT = {
    ERROR_TYPES: {
        CLIENT_ERRORS: 'Client errors (4xx) indicate problems with the client request',
        SERVER_ERRORS: 'Server errors (5xx) indicate problems on the server side',
        PARSE_ERRORS: 'Parse errors occur when request data cannot be properly interpreted',
        VALIDATION_ERRORS: 'Validation errors occur when request data fails business rule validation'
    },
    BEST_PRACTICES: {
        SECURITY: 'Never expose sensitive system information in error responses',
        LOGGING: 'Always log errors with sufficient context for debugging',
        CORRELATION: 'Use correlation IDs to track errors across request lifecycle',
        RECOVERY: 'Implement appropriate recovery strategies for different error types'
    },
    PATTERNS: {
        CLASSIFICATION: 'Classify errors by type, severity, and impact for appropriate handling',
        SANITIZATION: 'Sanitize error messages to prevent information disclosure vulnerabilities',
        MONITORING: 'Implement comprehensive error monitoring for production readiness',
        GRACEFUL_DEGRADATION: 'Design systems to degrade gracefully when errors occur'
    }
};

// ============================================================================
// UTILITY FUNCTIONS FOR ERROR DEMONSTRATION
// ============================================================================

/**
 * Creates mock HTTP request and response objects for error handling demonstrations without
 * requiring actual network connections or server setup. Provides realistic HTTP objects
 * for testing error scenarios and educational examples.
 * 
 * @param {Object} requestConfig - Configuration for mock request object properties
 * @param {Object} responseConfig - Configuration for mock response object setup
 * @returns {Object} Mock HTTP objects with request and response for error demonstration
 * 
 * @example
 * const mockHttp = createMockHttpObjects(
 *   { method: 'GET', url: '/invalid', headers: { 'user-agent': 'test' } },
 *   { statusCode: 404 }
 * );
 */
function createMockHttpObjects(requestConfig = {}, responseConfig = {}) {
    try {
        // Create mock request object with configurable HTTP method, URL, and headers
        const mockRequest = {
            method: requestConfig.method || 'GET',
            url: requestConfig.url || '/hello',
            httpVersion: requestConfig.httpVersion || '1.1',
            headers: {
                'user-agent': 'Node.js Error Handling Demo',
                'host': 'localhost:3000',
                'connection': 'keep-alive',
                ...requestConfig.headers
            },
            socket: {
                remoteAddress: requestConfig.remoteAddress || '127.0.0.1',
                remotePort: requestConfig.remotePort || Math.floor(Math.random() * 10000) + 50000
            },
            startTime: Date.now(),
            correlationId: generateErrorId()
        };

        // Initialize response tracking and header management for demonstration output
        const responseState = {
            statusCode: responseConfig.statusCode || 200,
            headers: { ...responseConfig.headers },
            body: '',
            headersSent: false,
            finished: false,
            writable: true
        };

        // Create mock response object with HTTP response methods and state tracking
        const mockResponse = {
            statusCode: responseState.statusCode,
            headersSent: responseState.headersSent,
            finished: responseState.finished,
            writable: responseState.writable,

            // Implement writeHead method for setting status code and response headers
            writeHead(statusCode, headers = {}) {
                if (responseState.headersSent) {
                    throw new Error('Cannot set headers after they are sent to the client');
                }
                responseState.statusCode = statusCode;
                responseState.headers = { ...responseState.headers, ...headers };
                responseState.headersSent = true;
                return this;
            },

            // Implement setHeader method for individual header management
            setHeader(name, value) {
                if (responseState.headersSent) {
                    throw new Error('Cannot set headers after they are sent to the client');
                }
                responseState.headers[name.toLowerCase()] = value;
                return this;
            },

            // Implement write method for response body content streaming
            write(chunk) {
                if (!responseState.writable) {
                    throw new Error('Cannot write to response after end() has been called');
                }
                responseState.body += chunk.toString();
                return true;
            },

            // Implement end method for completing HTTP response transmission
            end(data) {
                if (responseState.finished) {
                    throw new Error('Cannot call end() after response has already ended');
                }
                if (data) {
                    responseState.body += data.toString();
                }
                responseState.finished = true;
                responseState.writable = false;
                return this;
            },

            // Provide access to response state for demonstration validation
            _getState() {
                return {
                    statusCode: responseState.statusCode,
                    headers: responseState.headers,
                    body: responseState.body,
                    headersSent: responseState.headersSent,
                    finished: responseState.finished
                };
            }
        };

        // Add correlation ID and timing information for realistic error context
        const contextMetadata = {
            correlationId: mockRequest.correlationId,
            timestamp: new Date().toISOString(),
            requestStart: mockRequest.startTime,
            mockType: 'HTTP_OBJECTS_DEMO'
        };

        // Return complete mock HTTP objects ready for error handling demonstrations
        return {
            request: mockRequest,
            response: mockResponse,
            metadata: contextMetadata
        };

    } catch (error) {
        // Handle mock object creation failures with descriptive error context
        throw new Error(`Failed to create mock HTTP objects: ${error.message}`);
    }
}

/**
 * Simulates various real-world error scenarios including network failures, processing timeouts,
 * and resource exhaustion for comprehensive error handling demonstration. Creates controlled
 * error conditions that mirror production error patterns without causing actual system issues.
 * 
 * @param {Array<string>} scenarioTypes - Array of error scenario types to simulate
 * @param {Object} simulationConfig - Configuration for error simulation parameters
 * @returns {Array<Object>} Array of simulated error scenarios with context and expected handling
 * 
 * @example
 * const scenarios = simulateErrorScenarios(
 *   ['network_timeout', 'memory_error'],
 *   { maxErrors: 5, includeContext: true }
 * );
 */
function simulateErrorScenarios(scenarioTypes = [], simulationConfig = {}) {
    const simulatedScenarios = [];

    try {
        // Validate scenario types parameter for proper error generation
        if (!Array.isArray(scenarioTypes) || scenarioTypes.length === 0) {
            throw new Error('Scenario types must be a non-empty array');
        }

        // Merge simulation configuration with default settings for comprehensive coverage
        const config = {
            maxErrors: 10,
            includeStackTrace: true,
            includeContext: true,
            randomizeErrors: false,
            errorSeverity: 'medium',
            ...simulationConfig
        };

        // Iterate through each scenario type to generate realistic error conditions
        scenarioTypes.forEach((scenarioType, index) => {
            const correlationId = generateErrorId();
            const timestamp = new Date().toISOString();

            // Create base scenario structure with metadata and context information
            const baseScenario = {
                id: `scenario-${index + 1}`,
                type: scenarioType,
                correlationId,
                timestamp,
                severity: config.errorSeverity,
                metadata: {
                    simulationConfig: config,
                    scenarioIndex: index,
                    totalScenarios: scenarioTypes.length
                }
            };

            // Generate specific error scenarios based on scenario type classification
            switch (scenarioType) {
                case 'network_timeout':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Network timeout occurred during request processing'),
                        httpStatus: HTTP_STATUS_CODES.SERVER_ERROR.GATEWAY_TIMEOUT,
                        errorCode: 'NETWORK_TIMEOUT',
                        context: {
                            timeout: 30000,
                            attempt: 1,
                            maxRetries: config.maxRetryAttempts || 3
                        },
                        expectedHandling: 'retry_with_backoff',
                        recoveryStrategy: 'exponential_backoff'
                    });
                    break;

                case 'memory_error':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Insufficient memory available for request processing'),
                        httpStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                        errorCode: 'MEMORY_EXHAUSTION',
                        context: {
                            memoryUsage: '95%',
                            availableMemory: '50MB',
                            requestSize: '100MB'
                        },
                        expectedHandling: 'graceful_degradation',
                        recoveryStrategy: 'resource_cleanup'
                    });
                    break;

                case 'parse_error':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Unable to parse malformed request data'),
                        httpStatus: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                        errorCode: 'PARSE_ERROR',
                        context: {
                            parsePosition: 'line 1, column 15',
                            expectedFormat: 'valid HTTP headers',
                            receivedData: 'malformed header data'
                        },
                        expectedHandling: 'send_400_response',
                        recoveryStrategy: 'continue_processing'
                    });
                    break;

                case 'validation_error':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Request data failed validation rules'),
                        httpStatus: HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
                        errorCode: 'VALIDATION_FAILED',
                        context: {
                            field: 'user_id',
                            value: 'invalid_format',
                            constraint: 'must be numeric',
                            rule: 'data_type_validation'
                        },
                        expectedHandling: 'send_validation_error',
                        recoveryStrategy: 'continue_processing'
                    });
                    break;

                case 'database_connection':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Database connection lost during query execution'),
                        httpStatus: HTTP_STATUS_CODES.SERVER_ERROR.SERVICE_UNAVAILABLE,
                        errorCode: 'DATABASE_UNAVAILABLE',
                        context: {
                            database: 'primary_db',
                            connectionPool: 'exhausted',
                            lastSuccessfulConnection: '2024-01-01T10:00:00Z'
                        },
                        expectedHandling: 'retry_with_circuit_breaker',
                        recoveryStrategy: 'fallback_to_cache'
                    });
                    break;

                case 'authentication_failure':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Authentication credentials are invalid or expired'),
                        httpStatus: HTTP_STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED,
                        errorCode: 'AUTH_FAILED',
                        context: {
                            authMethod: 'bearer_token',
                            tokenExpiry: '2024-01-01T09:00:00Z',
                            currentTime: new Date().toISOString()
                        },
                        expectedHandling: 'send_401_response',
                        recoveryStrategy: 'redirect_to_login'
                    });
                    break;

                case 'rate_limit_exceeded':
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error('Request rate limit exceeded for client'),
                        httpStatus: HTTP_STATUS_CODES.CLIENT_ERROR.TOO_MANY_REQUESTS,
                        errorCode: 'RATE_LIMIT_EXCEEDED',
                        context: {
                            clientId: 'demo-client-123',
                            currentRate: '150 requests/minute',
                            limit: '100 requests/minute',
                            resetTime: Date.now() + (60 * 1000)
                        },
                        expectedHandling: 'send_429_response',
                        recoveryStrategy: 'apply_backpressure'
                    });
                    break;

                default:
                    // Handle unknown scenario types with generic error simulation
                    simulatedScenarios.push({
                        ...baseScenario,
                        error: new Error(`Unknown error scenario: ${scenarioType}`),
                        httpStatus: HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
                        errorCode: 'UNKNOWN_SCENARIO',
                        context: {
                            scenarioType,
                            availableScenarios: Object.keys(EXAMPLE_SCENARIOS).join(', ')
                        },
                        expectedHandling: 'log_and_continue',
                        recoveryStrategy: 'default_error_response'
                    });
                    break;
            }
        });

        // Add simulation metadata and summary information for educational context
        const simulationSummary = {
            totalScenarios: simulatedScenarios.length,
            scenarioTypes: [...new Set(scenarioTypes)],
            generatedAt: new Date().toISOString(),
            configuration: config
        };

        // Return comprehensive array of error scenarios ready for demonstration and educational use
        return {
            scenarios: simulatedScenarios,
            summary: simulationSummary,
            metadata: {
                function: 'simulateErrorScenarios',
                version: '1.0.0',
                educationalPurpose: true
            }
        };

    } catch (error) {
        // Handle error scenario simulation failures with detailed context
        throw new Error(`Failed to simulate error scenarios: ${error.message}`);
    }
}

/**
 * Displays comprehensive summary of error handling demonstrations including educational takeaways,
 * best practices, and production readiness guidelines. Provides structured learning content
 * and practical recommendations for implementing robust error handling in Node.js applications.
 * 
 * @param {Object} demonstrationResults - Results from error handling demonstrations
 * @param {Logger} logger - Logger instance for displaying educational content
 * @returns {void} Displays error handling summary with educational content and best practices
 * 
 * @example
 * displayErrorHandlingSummary({
 *   totalErrors: 15,
 *   successfulHandling: 14,
 *   patterns: ['classification', 'sanitization', 'correlation']
 * }, logger);
 */
function displayErrorHandlingSummary(demonstrationResults = {}, logger) {
    try {
        // Validate demonstration results parameter for summary generation
        if (!demonstrationResults || typeof demonstrationResults !== 'object') {
            throw new Error('Demonstration results must be a valid object');
        }

        // Validate logger instance parameter for educational content output
        if (!logger || typeof logger.info !== 'function') {
            throw new Error('Logger instance is required for displaying summary');
        }

        // Display demonstration overview and scope of error handling coverage
        logger.info('='.repeat(80));
        logger.info('ERROR HANDLING DEMONSTRATION SUMMARY');
        logger.info('='.repeat(80));

        // Show demonstration statistics and coverage metrics for learning assessment
        const statistics = {
            totalDemonstrations: demonstrationResults.totalDemonstrations || 0,
            successfulHandling: demonstrationResults.successfulHandling || 0,
            errorTypesDemo: demonstrationResults.errorTypesDemo || 0,
            patternsDemo: demonstrationResults.patternsDemo || 0,
            educationalPoints: demonstrationResults.educationalPoints || 0
        };

        logger.info('DEMONSTRATION STATISTICS:', statistics);

        // Display error handling patterns demonstrated with explanations and examples
        if (demonstrationResults.patternsDemo && demonstrationResults.patternsDemo.length > 0) {
            logger.info('\nERROR HANDLING PATTERNS DEMONSTRATED:');
            demonstrationResults.patternsDemo.forEach(pattern => {
                logger.info(`• ${pattern.name}: ${pattern.description}`);
                if (pattern.benefits) {
                    logger.info(`  Benefits: ${pattern.benefits.join(', ')}`);
                }
                if (pattern.implementation) {
                    logger.info(`  Implementation: ${pattern.implementation}`);
                }
            });
        }

        // Show error classification system benefits and proper usage guidelines
        logger.info('\nERROR CLASSIFICATION BENEFITS:');
        logger.info('• Systematic error categorization for appropriate response strategies');
        logger.info('• HTTP status code assignment based on error type and context');
        logger.info('• Severity level determination for monitoring and alerting systems');
        logger.info('• Response strategy selection based on error characteristics and impact');

        // Display error logging best practices for debugging and monitoring integration
        logger.info('\nERROR LOGGING BEST PRACTICES:');
        logger.info('• Structured logging with correlation IDs for request-response tracking');
        logger.info('• Appropriate log levels based on error severity and operational impact');
        logger.info('• Sensitive data sanitization in error logs for security compliance');
        logger.info('• Stack trace inclusion for debugging while protecting sensitive information');
        logger.info('• Error context preservation for comprehensive debugging and analysis');

        // Explain security considerations for error handling and information disclosure prevention
        logger.info('\nSECURITY CONSIDERATIONS:');
        logger.info('• Never expose sensitive system information in client error responses');
        logger.info('• Sanitize error messages to prevent information disclosure vulnerabilities');
        logger.info('• Use generic error messages for external clients while logging details internally');
        logger.info('• Implement proper error correlation without exposing internal system details');
        logger.info('• Apply rate limiting and monitoring to detect potential security threats');

        // Display error recovery strategies and graceful degradation patterns for resilience
        logger.info('\nERROR RECOVERY STRATEGIES:');
        logger.info('• Retry mechanisms with exponential backoff for transient failures');
        logger.info('• Circuit breaker patterns for preventing cascading failures');
        logger.info('• Graceful degradation to maintain service availability during errors');
        logger.info('• Fallback mechanisms for critical functionality preservation');
        logger.info('• Resource cleanup and connection management for system stability');

        // Show production readiness considerations for error handling implementation
        logger.info('\nPRODUCTION READINESS CONSIDERATIONS:');
        logger.info('• Comprehensive error monitoring with alerting and notification systems');
        logger.info('• Error rate tracking and threshold-based alerting for operational awareness');
        logger.info('• Performance impact analysis of error handling on system throughput');
        logger.info('• Error handling performance optimization for minimal system overhead');
        logger.info('• Integration with APM tools and distributed tracing systems');

        // Provide educational explanations of Node.js error handling concepts and patterns
        logger.info('\nNODE.JS ERROR HANDLING CONCEPTS:');
        logger.info('• Event-driven error propagation through EventEmitter patterns');
        logger.info('• Asynchronous error handling with Promise rejection and async/await');
        logger.info('• Process-level error handling for uncaught exceptions and unhandled rejections');
        logger.info('• HTTP-specific error handling for request-response lifecycle management');
        logger.info('• Error handling middleware patterns for Express.js and similar frameworks');

        // Display resources for further learning and advanced error handling patterns
        logger.info('\nFURTHER LEARNING RESOURCES:');
        logger.info('• Node.js Error Handling Best Practices Documentation');
        logger.info('• HTTP Status Code Standards and Usage Guidelines');
        logger.info('• Production Monitoring and Observability Patterns');
        logger.info('• Security-First Error Handling Implementation Strategies');
        logger.info('• Distributed Systems Error Handling and Resilience Patterns');

        // Show key takeaways and actionable recommendations for implementation
        if (demonstrationResults.keyTakeaways && demonstrationResults.keyTakeaways.length > 0) {
            logger.info('\nKEY TAKEAWAYS FROM DEMONSTRATIONS:');
            demonstrationResults.keyTakeaways.forEach((takeaway, index) => {
                logger.info(`${index + 1}. ${takeaway}`);
            });
        }

        // Display demonstration completion information and next steps for continued learning
        logger.info('\nDEMONSTRATION COMPLETION:');
        logger.info(`• Total Error Scenarios Demonstrated: ${statistics.totalDemonstrations}`);
        logger.info(`• Successful Error Handling Examples: ${statistics.successfulHandling}`);
        logger.info(`• Error Handling Patterns Covered: ${statistics.patternsDemo}`);
        logger.info(`• Educational Points Demonstrated: ${statistics.educationalPoints}`);

        logger.info('\nNext Steps: Apply these patterns in your Node.js applications');
        logger.info('Remember: Effective error handling is crucial for production applications');
        logger.info('='.repeat(80));

    } catch (error) {
        // Handle summary display errors with fallback error reporting
        console.error(`Failed to display error handling summary: ${error.message}`);
        console.error('This error occurred while demonstrating error handling patterns');
    }
}

// ============================================================================
// STANDALONE DEMONSTRATION FUNCTIONS
// ============================================================================

/**
 * Main demonstration function that executes comprehensive error handling examples showing
 * different error types, classification, logging, and response generation patterns.
 * Provides complete educational journey through Node.js error management concepts.
 * 
 * @param {Object} options - Options for customizing the error handling demonstration
 * @returns {Promise<void>} Promise that resolves when all error handling demonstrations are complete
 * 
 * @example
 * await runErrorHandlingDemo({
 *   verbose: true,
 *   includePerformanceMetrics: true,
 *   showEducationalContent: true
 * });
 */
async function runErrorHandlingDemo(options = {}) {
    let logger, errorHandler, demoResults;

    try {
        // Merge provided options with DEMO_CONFIG defaults for comprehensive configuration
        const demoOptions = {
            ...DEMO_CONFIG,
            ...options
        };

        // Initialize Logger instance with demonstration-specific configuration settings
        logger = new Logger({
            level: demoOptions.enableVerboseLogging ? 'debug' : 'info',
            enableCorrelation: demoOptions.enableErrorCorrelation,
            includeTimestamp: true,
            colorize: true
        });

        // Create ErrorHandler instance with demonstration configuration and enhanced logging
        errorHandler = new ErrorHandler({
            logger,
            sanitizeMessages: demoOptions.sanitizeErrorMessages,
            includeStackTrace: demoOptions.includeStackTrace,
            enableCorrelation: demoOptions.enableErrorCorrelation
        });

        // Initialize demonstration results tracking and educational content collection
        demoResults = {
            totalDemonstrations: 0,
            successfulHandling: 0,
            errorTypesDemo: [],
            patternsDemo: [],
            educationalPoints: [],
            keyTakeaways: [],
            performanceMetrics: {
                startTime: Date.now(),
                demonstrations: []
            }
        };

        // Log demonstration start with learning objectives and scope information
        logger.info('='.repeat(80));
        logger.info('STARTING COMPREHENSIVE ERROR HANDLING DEMONSTRATION');
        logger.info('='.repeat(80));
        logger.info('Learning Objectives:');
        logger.info('• Understanding error classification and appropriate response strategies');
        logger.info('• Implementing secure error handling with information disclosure prevention');
        logger.info('• Demonstrating error correlation tracking and debugging capabilities');
        logger.info('• Showing production-ready error handling patterns and best practices');
        logger.info('• Educational clarity for Node.js error management concepts');
        logger.info('');

        // Execute client error demonstrations with 4xx status code scenarios
        logger.info('Phase 1: Client Error Handling Demonstrations (4xx Status Codes)');
        logger.info('-'.repeat(60));
        const clientErrorResults = await demonstrateClientErrors(errorHandler, logger);
        demoResults.totalDemonstrations += clientErrorResults.demonstrationCount;
        demoResults.successfulHandling += clientErrorResults.successfulHandling;
        demoResults.errorTypesDemo.push('CLIENT_ERRORS');
        demoResults.patternsDemo.push(...clientErrorResults.patterns);

        // Execute server error demonstrations with 5xx status code scenarios
        logger.info('\nPhase 2: Server Error Handling Demonstrations (5xx Status Codes)');
        logger.info('-'.repeat(60));
        const serverErrorResults = await demonstrateServerErrors(errorHandler, logger);
        demoResults.totalDemonstrations += serverErrorResults.demonstrationCount;
        demoResults.successfulHandling += serverErrorResults.successfulHandling;
        demoResults.errorTypesDemo.push('SERVER_ERRORS');
        demoResults.patternsDemo.push(...serverErrorResults.patterns);

        // Demonstrate parse error handling with malformed request scenarios
        logger.info('\nPhase 3: Parse Error Handling Demonstrations');
        logger.info('-'.repeat(60));
        const parseErrorResults = await demonstrateParseErrors(errorHandler, logger);
        demoResults.totalDemonstrations += parseErrorResults.demonstrationCount;
        demoResults.successfulHandling += parseErrorResults.successfulHandling;
        demoResults.errorTypesDemo.push('PARSE_ERRORS');
        demoResults.patternsDemo.push(...parseErrorResults.patterns);

        // Show error classification system with various error types and severities
        logger.info('\nPhase 4: Error Classification System Demonstration');
        logger.info('-'.repeat(60));
        const classificationResults = await demonstrateErrorClassification(
            EXAMPLE_SCENARIOS.CLIENT_ERROR_SCENARIOS.concat(
                EXAMPLE_SCENARIOS.SERVER_ERROR_SCENARIOS
            ), 
            logger
        );
        demoResults.educationalPoints.push('Error Classification System');
        demoResults.patternsDemo.push(...classificationResults.patterns);

        // Demonstrate comprehensive error logging patterns with correlation tracking
        logger.info('\nPhase 5: Comprehensive Error Logging Demonstration');
        logger.info('-'.repeat(60));
        const loggingResults = await demonstrateErrorLogging([
            new Error('Sample client error for logging demonstration'),
            new Error('Sample server error for logging demonstration'),
            new Error('Sample validation error for logging demonstration')
        ], logger);
        demoResults.educationalPoints.push('Comprehensive Error Logging');

        // Execute application-level error handling with startup and shutdown scenarios
        if (demoOptions.demonstrateApplicationErrors !== false) {
            logger.info('\nPhase 6: Application-Level Error Handling Demonstration');
            logger.info('-'.repeat(60));
            const appErrorResults = await demonstrateApplicationErrorHandling({
                enableGracefulShutdown: true,
                includeStartupErrors: true,
                showRecoveryStrategies: true
            });
            demoResults.educationalPoints.push('Application-Level Error Handling');
        }

        // Add key takeaways and educational summary points for learning reinforcement
        demoResults.keyTakeaways = [
            'Error classification enables appropriate response strategies and HTTP status codes',
            'Secure error handling prevents information disclosure while maintaining debugging capability',
            'Correlation tracking allows error tracing across request-response lifecycle',
            'Structured logging provides comprehensive error context for debugging and monitoring',
            'Recovery strategies ensure system resilience and graceful degradation during errors',
            'Production-ready error handling requires monitoring, alerting, and performance consideration'
        ];

        // Calculate demonstration completion metrics and performance information
        demoResults.performanceMetrics.endTime = Date.now();
        demoResults.performanceMetrics.totalDuration = 
            demoResults.performanceMetrics.endTime - demoResults.performanceMetrics.startTime;
        demoResults.educationalPoints.push('Performance Impact Analysis');

        // Display demonstration summary with educational takeaways and best practices
        displayErrorHandlingSummary(demoResults, logger);

        // Log demonstration completion with results summary and next steps
        logger.info('\n✅ Error Handling Demonstration Completed Successfully');
        logger.info(`Total Demonstrations: ${demoResults.totalDemonstrations}`);
        logger.info(`Successful Error Handling: ${demoResults.successfulHandling}`);
        logger.info(`Educational Points Covered: ${demoResults.educationalPoints.length}`);
        logger.info(`Duration: ${demoResults.performanceMetrics.totalDuration}ms`);
        logger.info('\nRecommendation: Review the demonstration results and apply patterns in your applications');

        return demoResults;

    } catch (error) {
        // Handle demonstration execution errors with comprehensive error context
        const errorContext = {
            function: 'runErrorHandlingDemo',
            phase: 'demonstration_execution',
            timestamp: new Date().toISOString(),
            options: options
        };

        // Log demonstration error with context for debugging and educational purposes
        if (logger) {
            logger.error('Error handling demonstration failed', {
                error: error.message,
                context: errorContext,
                stackTrace: error.stack
            });
        } else {
            console.error('Error Handling Demo Failed:', error.message);
            console.error('Context:', errorContext);
        }

        throw new Error(`Error handling demonstration failed: ${error.message}`);
    }
}

/**
 * Demonstrates various client error scenarios (4xx status codes) and their proper handling
 * including bad requests, not found errors, and method not allowed errors with secure
 * response generation and comprehensive logging.
 * 
 * @param {ErrorHandler} errorHandler - ErrorHandler instance for processing client errors
 * @param {Logger} logger - Logger instance for demonstration output and educational content
 * @returns {Promise<Object>} Promise that resolves with client error demonstration results
 * 
 * @example
 * const results = await demonstrateClientErrors(errorHandler, logger);
 * console.log(`Demonstrated ${results.demonstrationCount} client error scenarios`);
 */
async function demonstrateClientErrors(errorHandler, logger) {
    const demonstrationResults = {
        demonstrationCount: 0,
        successfulHandling: 0,
        patterns: [],
        educationalPoints: []
    };

    try {
        // Validate errorHandler and logger parameters for demonstration execution
        if (!errorHandler || typeof errorHandler.handleClientError !== 'function') {
            throw new Error('Valid ErrorHandler instance is required for client error demonstrations');
        }

        if (!logger || typeof logger.info !== 'function') {
            throw new Error('Valid Logger instance is required for demonstration logging');
        }

        // Create mock HTTP request and response objects for demonstration scenarios
        logger.info('Creating mock HTTP objects for client error demonstrations...');

        // Demonstrate 400 Bad Request error with malformed request data
        logger.info('\n1. Demonstrating 400 Bad Request Error Handling:');
        logger.info('Scenario: Client sends malformed request with invalid headers');

        const badRequestMock = createMockHttpObjects(
            { 
                method: 'GET', 
                url: '/hello', 
                headers: { 
                    'invalid-header': 'malformed\ndata\rwith\tcontrol\x00chars',
                    'content-length': 'not-a-number' 
                }
            },
            { statusCode: 400 }
        );

        // Process bad request error using ErrorHandler.handleClientError method
        const badRequestError = new Error('Malformed request headers detected');
        badRequestError.code = 'BAD_REQUEST';
        badRequestError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;

        await errorHandler.handleClientError(
            badRequestError,
            badRequestMock.request,
            badRequestMock.response,
            {
                correlationId: badRequestMock.metadata.correlationId,
                errorType: 'CLIENT_ERROR',
                errorCode: 'MALFORMED_HEADERS'
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show proper error logging with request correlation and context
        logger.info('✅ Bad Request Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• Error classified as client error (4xx status code)');
        logger.info('• Error message sanitized to prevent information disclosure');
        logger.info('• Request correlation maintained for debugging purposes');
        logger.info('• Appropriate HTTP status code (400) returned to client');

        // Demonstrate 404 Not Found error with invalid route request
        logger.info('\n2. Demonstrating 404 Not Found Error Handling:');
        logger.info('Scenario: Client requests non-existent endpoint');

        const notFoundMock = createMockHttpObjects(
            { 
                method: 'GET', 
                url: '/nonexistent-endpoint', 
                headers: { 'user-agent': 'Test Client' }
            },
            { statusCode: 404 }
        );

        // Process not found error using ErrorHandler.handleRouteError method
        const notFoundError = new Error(`Route not found: ${notFoundMock.request.url}`);
        notFoundError.code = 'NOT_FOUND';
        notFoundError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.NOT_FOUND;

        await errorHandler.handleRouteError(
            notFoundError,
            notFoundMock.request,
            notFoundMock.response,
            {
                correlationId: notFoundMock.metadata.correlationId,
                requestedPath: notFoundMock.request.url,
                availableRoutes: ['/hello']
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show sanitized error response generation for client consumption
        logger.info('✅ Not Found Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• Generic error message used to prevent path disclosure');
        logger.info('• Original requested path logged internally for debugging');
        logger.info('• Standard 404 Not Found status code returned');
        logger.info('• Error correlation maintained across request lifecycle');

        // Demonstrate 405 Method Not Allowed error with invalid HTTP method
        logger.info('\n3. Demonstrating 405 Method Not Allowed Error Handling:');
        logger.info('Scenario: Client uses unsupported HTTP method on valid endpoint');

        const methodNotAllowedMock = createMockHttpObjects(
            { 
                method: 'POST', 
                url: '/hello', 
                headers: { 'content-type': 'application/json' }
            },
            { statusCode: 405 }
        );

        // Process method not allowed error using ErrorHandler.handleMethodError method
        const methodError = new Error(`Method ${methodNotAllowedMock.request.method} not allowed for ${methodNotAllowedMock.request.url}`);
        methodError.code = 'METHOD_NOT_ALLOWED';
        methodError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.METHOD_NOT_ALLOWED;

        await errorHandler.handleMethodError(
            methodError,
            methodNotAllowedMock.request,
            methodNotAllowedMock.response,
            {
                correlationId: methodNotAllowedMock.metadata.correlationId,
                method: methodNotAllowedMock.request.method,
                url: methodNotAllowedMock.request.url,
                allowedMethods: ['GET']
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Display error classification and response status code determination
        logger.info('✅ Method Not Allowed Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• Allow header set with supported HTTP methods');
        logger.info('• Clear error message indicating supported methods');
        logger.info('• Proper 405 Method Not Allowed status code used');
        logger.info('• Request method and URL logged for analysis');

        // Add demonstrated patterns to results for summary generation
        demonstrationResults.patterns = [
            {
                name: 'Client Error Classification',
                description: 'Systematic classification of 4xx client errors with appropriate responses',
                benefits: ['Clear client feedback', 'Proper HTTP compliance', 'Security through information limitation'],
                implementation: 'ErrorHandler.handleClientError with status code determination'
            },
            {
                name: 'Error Message Sanitization',
                description: 'Sanitization of error messages to prevent information disclosure',
                benefits: ['Security compliance', 'Consistent error format', 'Debug info preservation'],
                implementation: 'sanitizeErrorMessage function with correlation tracking'
            },
            {
                name: 'Request Correlation Tracking',
                description: 'Correlation ID tracking across error handling lifecycle',
                benefits: ['Request traceability', 'Debug capability', 'Monitoring integration'],
                implementation: 'generateErrorId with context preservation'
            }
        ];

        // Add educational points covered during client error demonstrations
        demonstrationResults.educationalPoints = [
            'Client errors indicate problems with the request from the client side',
            '4xx status codes should be used for all client-related error conditions',
            'Error messages should be sanitized to prevent information disclosure vulnerabilities',
            'Correlation IDs enable tracking errors across the entire request-response cycle',
            'Different client error types require specific handling strategies and responses'
        ];

        // Log client error handling summary with educational explanations
        logger.info('\n📚 Client Error Handling Summary:');
        logger.info(`• Demonstrated ${demonstrationResults.demonstrationCount} client error scenarios`);
        logger.info(`• Successfully handled ${demonstrationResults.successfulHandling} error conditions`);
        logger.info(`• Covered ${demonstrationResults.patterns.length} error handling patterns`);
        logger.info('• All errors properly classified, logged, and responded to');
        logger.info('• Security considerations applied to prevent information disclosure');

        return demonstrationResults;

    } catch (error) {
        // Handle client error demonstration failures with comprehensive error context
        logger.error('Client error demonstration failed', {
            error: error.message,
            phase: 'client_error_demonstration',
            demonstrationCount: demonstrationResults.demonstrationCount,
            timestamp: new Date().toISOString()
        });

        throw new Error(`Client error demonstration failed: ${error.message}`);
    }
}

/**
 * Demonstrates server error scenarios (5xx status codes) and their secure handling including
 * internal server errors, processing failures, and error recovery patterns with comprehensive
 * logging and monitoring integration.
 * 
 * @param {ErrorHandler} errorHandler - ErrorHandler instance for processing server errors
 * @param {Logger} logger - Logger instance for demonstration output and educational content
 * @returns {Promise<Object>} Promise that resolves with server error demonstration results
 * 
 * @example
 * const results = await demonstrateServerErrors(errorHandler, logger);
 * console.log(`Demonstrated ${results.demonstrationCount} server error scenarios`);
 */
async function demonstrateServerErrors(errorHandler, logger) {
    const demonstrationResults = {
        demonstrationCount: 0,
        successfulHandling: 0,
        patterns: [],
        educationalPoints: []
    };

    try {
        // Validate errorHandler and logger parameters for demonstration execution
        if (!errorHandler || typeof errorHandler.handleServerError !== 'function') {
            throw new Error('Valid ErrorHandler instance is required for server error demonstrations');
        }

        if (!logger || typeof logger.error !== 'function') {
            throw new Error('Valid Logger instance is required for demonstration logging');
        }

        // Create mock server error scenarios including internal processing failures
        logger.info('Creating server error scenarios for demonstration...');

        // Demonstrate internal server error with stack trace and debugging context
        logger.info('\n1. Demonstrating 500 Internal Server Error Handling:');
        logger.info('Scenario: Unexpected error during request processing');

        const internalErrorMock = createMockHttpObjects(
            { method: 'GET', url: '/hello', headers: { 'user-agent': 'Test Client' } },
            { statusCode: 500 }
        );

        // Simulate internal server error with stack trace and debugging information
        const internalError = new Error('Unexpected error in request processing pipeline');
        internalError.code = 'INTERNAL_SERVER_ERROR';
        internalError.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR;
        internalError.stack = `Error: Unexpected error in request processing pipeline
    at processRequest (/app/server.js:123:15)
    at handleRequest (/app/server.js:89:10)
    at Server.<anonymous> (/app/server.js:45:5)`;

        // Process internal server error using ErrorHandler.handleServerError method
        await errorHandler.handleServerError(
            internalError,
            internalErrorMock.request,
            internalErrorMock.response,
            {
                correlationId: internalErrorMock.metadata.correlationId,
                errorType: 'SERVER_ERROR',
                errorCode: 'INTERNAL_PROCESSING_ERROR',
                context: {
                    processingPhase: 'request_handler',
                    memoryUsage: process.memoryUsage(),
                    systemInfo: {
                        nodeVersion: process.version,
                        uptime: process.uptime()
                    }
                }
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show comprehensive error logging with full debugging information for internal use
        logger.info('✅ Internal Server Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• Full error details logged internally for debugging purposes');
        logger.info('• Generic error message sent to client to prevent information disclosure');
        logger.info('• Stack trace preserved in logs while hidden from client response');
        logger.info('• System context included for comprehensive debugging capability');

        // Demonstrate error sanitization to prevent information disclosure to clients
        logger.info('\n2. Demonstrating Error Sanitization for Security:');
        logger.info('Scenario: Database connection error with sensitive information');

        const dbErrorMock = createMockHttpObjects(
            { method: 'GET', url: '/hello', headers: { 'authorization': 'Bearer token123' } },
            { statusCode: 500 }
        );

        // Create database error with sensitive information that must be sanitized
        const dbError = new Error('Connection failed to database server db-prod-001.internal.company.com:5432 with credentials user=admin password=secret123');
        dbError.code = 'DATABASE_CONNECTION_FAILED';
        dbError.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.SERVICE_UNAVAILABLE;
        dbError.sensitive = true;

        // Process database error with sanitization using ErrorHandler.handleServerError
        const sanitizedMessage = sanitizeErrorMessage(dbError.message);
        const sanitizedError = new Error(sanitizedMessage);
        sanitizedError.code = dbError.code;
        sanitizedError.statusCode = dbError.statusCode;

        await errorHandler.handleServerError(
            sanitizedError,
            dbErrorMock.request,
            dbErrorMock.response,
            {
                correlationId: dbErrorMock.metadata.correlationId,
                originalError: dbError.message, // Logged internally only
                sanitized: true,
                securityContext: 'prevent_information_disclosure'
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show error correlation ID generation for tracking and debugging purposes
        logger.info('✅ Error Sanitization Demonstration Completed');
        logger.info('Educational Points:');
        logger.info('• Sensitive information removed from client-facing error messages');
        logger.info('• Original error details preserved in internal logs for debugging');
        logger.info('• Generic service unavailable message sent to client');
        logger.info('• Correlation ID maintained for internal error tracking');

        // Simulate processing timeout error and demonstrate recovery strategies
        logger.info('\n3. Demonstrating Processing Timeout and Recovery:');
        logger.info('Scenario: Request processing timeout with retry strategy');

        const timeoutErrorMock = createMockHttpObjects(
            { method: 'GET', url: '/hello', headers: { 'x-request-timeout': '30000' } },
            { statusCode: 504 }
        );

        // Create timeout error with recovery strategy information
        const timeoutError = new Error('Request processing timeout after 30000ms');
        timeoutError.code = 'PROCESSING_TIMEOUT';
        timeoutError.statusCode = HTTP_STATUS_CODES.SERVER_ERROR.GATEWAY_TIMEOUT;
        timeoutError.timeout = 30000;
        timeoutError.retryable = true;

        // Process timeout error with recovery strategy demonstration
        await errorHandler.handleServerError(
            timeoutError,
            timeoutErrorMock.request,
            timeoutErrorMock.response,
            {
                correlationId: timeoutErrorMock.metadata.correlationId,
                timeout: timeoutError.timeout,
                retryStrategy: 'exponential_backoff',
                maxRetries: 3,
                recoveryAction: 'client_retry_recommended'
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show error classification by severity level and impact assessment
        logger.info('✅ Timeout Error and Recovery Demonstration Completed');
        logger.info('Educational Points:');
        logger.info('• Timeout errors classified as gateway timeout (504) for client clarity');
        logger.info('• Recovery strategies communicated through appropriate HTTP headers');
        logger.info('• Retry-After header could be included for client guidance');
        logger.info('• Internal timeout tracking for performance analysis and optimization');

        // Demonstrate error metrics collection and monitoring integration
        logger.info('\n4. Demonstrating Error Metrics and Monitoring:');
        logger.info('Scenario: Error rate tracking and alerting integration');

        // Show error classification and monitoring data collection
        const errorMetrics = {
            totalServerErrors: demonstrationResults.demonstrationCount,
            errorsByType: {
                'INTERNAL_SERVER_ERROR': 1,
                'DATABASE_CONNECTION_FAILED': 1,
                'PROCESSING_TIMEOUT': 1
            },
            errorRate: 0.05, // 5% error rate
            averageResponseTime: 250,
            correlationIds: [
                internalErrorMock.metadata.correlationId,
                dbErrorMock.metadata.correlationId,
                timeoutErrorMock.metadata.correlationId
            ]
        };

        logger.info('Error Metrics Collected:', errorMetrics);
        logger.info('Educational Points:');
        logger.info('• Error metrics enable monitoring and alerting systems');
        logger.info('• Error rate tracking helps identify system health trends');
        logger.info('• Correlation IDs enable error tracing across distributed systems');
        logger.info('• Performance impact analysis helps optimize error handling');

        // Add demonstrated patterns to results for summary generation
        demonstrationResults.patterns = [
            {
                name: 'Server Error Classification',
                description: 'Systematic classification of 5xx server errors with secure responses',
                benefits: ['Security compliance', 'Debug capability', 'Client clarity'],
                implementation: 'ErrorHandler.handleServerError with sanitization'
            },
            {
                name: 'Error Sanitization for Security',
                description: 'Sanitization of server errors to prevent information disclosure',
                benefits: ['Security protection', 'Compliance', 'Debug preservation'],
                implementation: 'sanitizeErrorMessage with internal logging'
            },
            {
                name: 'Recovery Strategy Integration',
                description: 'Integration of recovery strategies and retry mechanisms',
                benefits: ['System resilience', 'Client guidance', 'Service availability'],
                implementation: 'Retry headers and recovery action guidance'
            },
            {
                name: 'Error Metrics and Monitoring',
                description: 'Comprehensive error metrics collection for monitoring systems',
                benefits: ['Operational visibility', 'Trend analysis', 'Alerting capability'],
                implementation: 'Error rate tracking with correlation preservation'
            }
        ];

        // Add educational points covered during server error demonstrations
        demonstrationResults.educationalPoints = [
            'Server errors indicate problems on the server side that prevent request fulfillment',
            '5xx status codes should be used for all server-related error conditions',
            'Error sanitization is critical for preventing information disclosure vulnerabilities',
            'Recovery strategies help maintain service availability during error conditions',
            'Error metrics enable monitoring, alerting, and performance optimization',
            'Correlation tracking is essential for debugging distributed system errors'
        ];

        // Display server error handling best practices and security considerations
        logger.info('\n📚 Server Error Handling Summary:');
        logger.info(`• Demonstrated ${demonstrationResults.demonstrationCount} server error scenarios`);
        logger.info(`• Successfully handled ${demonstrationResults.successfulHandling} error conditions`);
        logger.info(`• Covered ${demonstrationResults.patterns.length} error handling patterns`);
        logger.info('• Security considerations applied to prevent information disclosure');
        logger.info('• Recovery strategies demonstrated for system resilience');
        logger.info('• Monitoring integration shown for operational awareness');

        return demonstrationResults;

    } catch (error) {
        // Handle server error demonstration failures with comprehensive error context
        logger.error('Server error demonstration failed', {
            error: error.message,
            phase: 'server_error_demonstration',
            demonstrationCount: demonstrationResults.demonstrationCount,
            timestamp: new Date().toISOString()
        });

        throw new Error(`Server error demonstration failed: ${error.message}`);
    }
}

/**
 * Demonstrates HTTP request parsing error scenarios and their handling including malformed
 * requests, invalid headers, and truncated data with appropriate error classification
 * and secure response generation.
 * 
 * @param {ErrorHandler} errorHandler - ErrorHandler instance for processing parse errors
 * @param {Logger} logger - Logger instance for demonstration output and educational content
 * @returns {Promise<Object>} Promise that resolves with parse error demonstration results
 * 
 * @example
 * const results = await demonstrateParseErrors(errorHandler, logger);
 * console.log(`Demonstrated ${results.demonstrationCount} parse error scenarios`);
 */
async function demonstrateParseErrors(errorHandler, logger) {
    const demonstrationResults = {
        demonstrationCount: 0,
        successfulHandling: 0,
        patterns: [],
        educationalPoints: []
    };

    try {
        // Validate errorHandler and logger parameters for demonstration execution
        if (!errorHandler || typeof errorHandler.handleParseError !== 'function') {
            throw new Error('Valid ErrorHandler instance is required for parse error demonstrations');
        }

        if (!logger || typeof logger.warn !== 'function') {
            throw new Error('Valid Logger instance is required for demonstration logging');
        }

        // Create mock malformed HTTP request scenarios for demonstration
        logger.info('Creating malformed HTTP request scenarios for parse error demonstration...');

        // Demonstrate HTTP request with invalid headers and malformed structure
        logger.info('\n1. Demonstrating Malformed Header Parse Error:');
        logger.info('Scenario: HTTP request contains invalid header format');

        const malformedHeaderMock = createMockHttpObjects(
            { 
                method: 'GET', 
                url: '/hello',
                headers: {
                    'invalid-header-name-with-spaces': 'value',
                    'header-with-invalid-chars': 'value\r\ninjected\nheader',
                    'content-length': 'invalid-number',
                    '': 'empty-header-name',
                    'normal-header': 'valid-value'
                }
            },
            { statusCode: 400 }
        );

        // Create parse error for malformed headers with specific error details
        const headerParseError = new Error('Invalid characters detected in HTTP header names');
        headerParseError.code = 'HEADER_PARSE_ERROR';
        headerParseError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
        headerParseError.parseContext = {
            errorType: 'MALFORMED_HEADERS',
            invalidHeaders: ['invalid-header-name-with-spaces', 'header-with-invalid-chars'],
            position: 'header parsing phase'
        };

        // Process malformed header error using ErrorHandler.handleParseError method
        await errorHandler.handleParseError(
            headerParseError,
            malformedHeaderMock.request,
            malformedHeaderMock.response,
            {
                correlationId: malformedHeaderMock.metadata.correlationId,
                parsePhase: 'header_validation',
                errorContext: headerParseError.parseContext,
                recoveryAction: 'reject_request'
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show proper error logging for debugging malformed request issues
        logger.info('✅ Malformed Header Parse Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• Parse errors typically result in 400 Bad Request responses');
        logger.info('• Invalid header names and values are detected and logged');
        logger.info('• Specific parse context preserved for debugging purposes');
        logger.info('• Request rejected early to prevent further processing');

        // Demonstrate truncated request data and parsing error handling
        logger.info('\n2. Demonstrating Truncated Request Parse Error:');
        logger.info('Scenario: HTTP request data is incomplete or truncated');

        const truncatedRequestMock = createMockHttpObjects(
            { 
                method: 'POST', 
                url: '/hello',
                headers: {
                    'content-type': 'application/json',
                    'content-length': '500'
                }
            },
            { statusCode: 400 }
        );

        // Add truncated request body to mock for realistic error scenario
        truncatedRequestMock.request.body = '{"name": "test", "incomplete": tr'; // Truncated JSON

        // Create parse error for truncated request data
        const truncatedParseError = new Error('Request data truncated - expected 500 bytes, received 35 bytes');
        truncatedParseError.code = 'TRUNCATED_REQUEST';
        truncatedParseError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
        truncatedParseError.parseContext = {
            errorType: 'TRUNCATED_DATA',
            expectedLength: 500,
            receivedLength: 35,
            contentType: 'application/json'
        };

        // Process truncated request error with appropriate error handling
        await errorHandler.handleParseError(
            truncatedParseError,
            truncatedRequestMock.request,
            truncatedRequestMock.response,
            {
                correlationId: truncatedRequestMock.metadata.correlationId,
                parsePhase: 'body_parsing',
                errorContext: truncatedParseError.parseContext,
                clientAdvice: 'check_network_connection'
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Show error message sanitization for secure client error responses
        logger.info('✅ Truncated Request Parse Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• Content-Length mismatch indicates truncated or incomplete data');
        logger.info('• Parse position and expected vs received length logged for debugging');
        logger.info('• Client receives generic bad request message for security');
        logger.info('• Network connectivity issues may cause request truncation');

        // Demonstrate invalid HTTP method parsing and protocol violation handling
        logger.info('\n3. Demonstrating Invalid HTTP Method Parse Error:');
        logger.info('Scenario: HTTP request contains invalid or unsupported method');

        const invalidMethodMock = createMockHttpObjects(
            { 
                method: 'INVALID_METHOD_NAME_TOO_LONG', 
                url: '/hello',
                headers: { 'host': 'localhost:3000' }
            },
            { statusCode: 400 }
        );

        // Create parse error for invalid HTTP method
        const methodParseError = new Error('Invalid HTTP method format detected');
        methodParseError.code = 'INVALID_HTTP_METHOD';
        methodParseError.statusCode = HTTP_STATUS_CODES.CLIENT_ERROR.BAD_REQUEST;
        methodParseError.parseContext = {
            errorType: 'INVALID_METHOD',
            receivedMethod: 'INVALID_METHOD_NAME_TOO_LONG',
            validMethods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
            maxMethodLength: 10
        };

        // Process invalid method error with protocol compliance validation
        await errorHandler.handleParseError(
            methodParseError,
            invalidMethodMock.request,
            invalidMethodMock.response,
            {
                correlationId: invalidMethodMock.metadata.correlationId,
                parsePhase: 'method_validation',
                protocolViolation: true,
                complianceCheck: 'HTTP_METHOD_VALIDATION'
            }
        );

        demonstrationResults.demonstrationCount++;
        demonstrationResults.successfulHandling++;

        // Demonstrate error correlation with request context and timing information
        logger.info('✅ Invalid HTTP Method Parse Error Handling Completed');
        logger.info('Educational Points:');
        logger.info('• HTTP method validation ensures protocol compliance');
        logger.info('• Method length limits prevent potential buffer overflow attacks');
        logger.info('• Invalid methods are rejected before route processing begins');
        logger.info('• Protocol violations are logged for security monitoring');

        // Show educational explanations of HTTP protocol compliance and error handling
        logger.info('\n4. HTTP Protocol Compliance and Parse Error Prevention:');
        logger.info('Educational Overview: HTTP Parse Error Best Practices');

        const protocolCompliancePoints = [
            'HTTP/1.1 specification defines strict formatting rules for requests and responses',
            'Parse errors should be detected early in the request processing pipeline',
            'Invalid or malformed requests should be rejected with 400 Bad Request status',
            'Parse error details should be logged internally but not exposed to clients',
            'Protocol violations may indicate potential security attacks or client bugs'
        ];

        protocolCompliancePoints.forEach((point, index) => {
            logger.info(`${index + 1}. ${point}`);
        });

        // Add demonstrated patterns to results for summary generation
        demonstrationResults.patterns = [
            {
                name: 'HTTP Parse Error Classification',
                description: 'Classification of different HTTP parsing errors with appropriate responses',
                benefits: ['Protocol compliance', 'Security validation', 'Early error detection'],
                implementation: 'ErrorHandler.handleParseError with parse context tracking'
            },
            {
                name: 'Request Validation Pipeline',
                description: 'Early validation of HTTP request structure and format',
                benefits: ['Resource efficiency', 'Security protection', 'Clear error reporting'],
                implementation: 'Multi-stage validation with specific error context'
            },
            {
                name: 'Parse Context Preservation',
                description: 'Preservation of parse error context for debugging and monitoring',
                benefits: ['Debug capability', 'Issue diagnosis', 'Pattern detection'],
                implementation: 'Structured parse context with correlation tracking'
            }
        ];

        // Add educational points covered during parse error demonstrations
        demonstrationResults.educationalPoints = [
            'Parse errors occur when HTTP request data cannot be properly interpreted',
            'Early detection of parse errors prevents wasted processing resources',
            'Malformed requests should be rejected with appropriate 400 status codes',
            'Parse error context is valuable for debugging but must not be exposed to clients',
            'Protocol compliance validation helps detect potential security threats',
            'Different parse error types require specific handling and response strategies'
        ];

        // Display parse error classification and appropriate response strategies
        logger.info('\n📚 Parse Error Handling Summary:');
        logger.info(`• Demonstrated ${demonstrationResults.demonstrationCount} parse error scenarios`);
        logger.info(`• Successfully handled ${demonstrationResults.successfulHandling} error conditions`);
        logger.info(`• Covered ${demonstrationResults.patterns.length} error handling patterns`);
        logger.info('• Protocol compliance validation implemented for security');
        logger.info('• Parse error context preserved for debugging while ensuring client security');
        logger.info('• Early error detection prevents unnecessary resource consumption');

        return demonstrationResults;

    } catch (error) {
        // Handle parse error demonstration failures with comprehensive error context
        logger.error('Parse error demonstration failed', {
            error: error.message,
            phase: 'parse_error_demonstration',
            demonstrationCount: demonstrationResults.demonstrationCount,
            timestamp: new Date().toISOString()
        });

        throw new Error(`Parse error demonstration failed: ${error.message}`);
    }
}

/**
 * Demonstrates error classification system including error types, severity levels, and
 * appropriate response strategy selection with comprehensive examples and educational
 * explanations for production-ready error management.
 * 
 * @param {Array<string>} errorScenarios - Array of error scenarios for classification demonstration
 * @param {Logger} logger - Logger instance for demonstration output and educational content
 * @returns {Object} Classification results with error types, severities, and response strategies
 * 
 * @example
 * const results = await demonstrateErrorClassification([
 *   'bad_request', 'internal_error', 'timeout_error'
 * ], logger);
 */
async function demonstrateErrorClassification(errorScenarios = [], logger) {
    const classificationResults = {
        totalClassifications: 0,
        classificationsByType: {},
        classificationsBySeverity: {},
        patterns: [],
        educationalPoints: []
    };

    try {
        // Validate error scenarios parameter for classification demonstration
        if (!Array.isArray(errorScenarios) || errorScenarios.length === 0) {
            throw new Error('Error scenarios must be a non-empty array for classification demonstration');
        }

        // Validate logger instance parameter for educational content output
        if (!logger || typeof logger.info !== 'function') {
            throw new Error('Valid Logger instance is required for classification demonstration');
        }

        logger.info('\n📊 ERROR CLASSIFICATION SYSTEM DEMONSTRATION');
        logger.info('='.repeat(60));
        logger.info('Demonstrating systematic error classification for production-ready error handling');

        // Create various error scenarios representing different error types and severities
        const errorExamples = [];

        errorScenarios.forEach((scenarioType, index) => {
            const correlationId = generateErrorId();
            
            // Create realistic error objects based on scenario type
            switch (scenarioType) {
                case 'bad_request':
                    errorExamples.push({
                        id: `error-${index + 1}`,
                        error: new Error('Invalid request parameters provided'),
                        correlationId,
                        scenarioType,
                        originalContext: {
                            httpMethod: 'POST',
                            requestUrl: '/api/users',
                            invalidFields: ['email', 'age']
                        }
                    });
                    break;

                case 'not_found':
                    errorExamples.push({
                        id: `error-${index + 1}`,
                        error: new Error('Requested resource does not exist'),
                        correlationId,
                        scenarioType,
                        originalContext: {
                            httpMethod: 'GET',
                            requestUrl: '/api/users/999999',
                            resourceType: 'user'
                        }
                    });
                    break;

                case 'internal_error':
                    errorExamples.push({
                        id: `error-${index + 1}`,
                        error: new Error('Unexpected server error during processing'),
                        correlationId,
                        scenarioType,
                        originalContext: {
                            httpMethod: 'GET',
                            requestUrl: '/api/data',
                            processingPhase: 'data_retrieval'
                        }
                    });
                    break;

                case 'timeout_error':
                    errorExamples.push({
                        id: `error-${index + 1}`,
                        error: new Error('Operation timeout after 30000ms'),
                        correlationId,
                        scenarioType,
                        originalContext: {
                            httpMethod: 'POST',
                            requestUrl: '/api/process',
                            timeout: 30000,
                            operation: 'data_processing'
                        }
                    });
                    break;

                default:
                    errorExamples.push({
                        id: `error-${index + 1}`,
                        error: new Error(`Generic error for scenario: ${scenarioType}`),
                        correlationId,
                        scenarioType,
                        originalContext: {
                            httpMethod: 'GET',
                            requestUrl: '/api/generic',
                            scenarioType
                        }
                    });
                    break;
            }
        });

        // Demonstrate classifyError function with different error objects and contexts
        logger.info(`\n1. Classifying ${errorExamples.length} Error Scenarios:`);
        logger.info('-'.repeat(40));

        for (const errorExample of errorExamples) {
            // Use classifyError function to analyze error characteristics
            const classification = classifyError(
                errorExample.error,
                errorExample.originalContext
            );

            classificationResults.totalClassifications++;

            // Show error type determination (client error, server error, validation error)
            logger.info(`\nError ${errorExample.id} Classification:`);
            logger.info(`• Scenario Type: ${errorExample.scenarioType}`);
            logger.info(`• Error Type: ${classification.type}`);
            logger.info(`• Severity Level: ${classification.severity}`);
            logger.info(`• HTTP Status Code: ${classification.httpStatusCode}`);
            logger.info(`• Response Strategy: ${classification.responseStrategy}`);
            logger.info(`• Recovery Action: ${classification.recoveryAction}`);
            logger.info(`• Correlation ID: ${errorExample.correlationId}`);

            // Track classification statistics by type and severity
            classificationResults.classificationsByType[classification.type] = 
                (classificationResults.classificationsByType[classification.type] || 0) + 1;
            
            classificationResults.classificationsBySeverity[classification.severity] = 
                (classificationResults.classificationsBySeverity[classification.severity] || 0) + 1;

            // Display severity level calculation based on error impact and context
            if (classification.impactAnalysis) {
                logger.info('• Impact Analysis:');
                logger.info(`  - User Impact: ${classification.impactAnalysis.userImpact}`);
                logger.info(`  - System Impact: ${classification.impactAnalysis.systemImpact}`);
                logger.info(`  - Business Impact: ${classification.impactAnalysis.businessImpact}`);
            }

            // Show error context preservation for debugging and monitoring
            if (classification.debugContext) {
                logger.info('• Debug Context Preserved:');
                Object.entries(classification.debugContext).forEach(([key, value]) => {
                    logger.info(`  - ${key}: ${JSON.stringify(value)}`);
                });
            }
        }

        // Demonstrate HTTP status code assignment based on error classification
        logger.info('\n2. HTTP Status Code Assignment Strategy:');
        logger.info('-'.repeat(40));

        const statusCodeMapping = {
            'CLIENT_ERROR': {
                codes: [400, 401, 403, 404, 405, 409, 422],
                strategy: 'Client-side issues require 4xx status codes',
                examples: ['Bad Request', 'Unauthorized', 'Forbidden', 'Not Found']
            },
            'SERVER_ERROR': {
                codes: [500, 502, 503, 504],
                strategy: 'Server-side issues require 5xx status codes',
                examples: ['Internal Server Error', 'Bad Gateway', 'Service Unavailable']
            },
            'VALIDATION_ERROR': {
                codes: [400, 422],
                strategy: 'Data validation failures use specific client error codes',
                examples: ['Bad Request', 'Unprocessable Entity']
            }
        };

        Object.entries(statusCodeMapping).forEach(([errorType, mapping]) => {
            logger.info(`\n${errorType}:`);
            logger.info(`• Status Codes: ${mapping.codes.join(', ')}`);
            logger.info(`• Strategy: ${mapping.strategy}`);
            logger.info(`• Examples: ${mapping.examples.join(', ')}`);
        });

        // Show appropriate response strategy selection based on error characteristics
        logger.info('\n3. Response Strategy Selection Matrix:');
        logger.info('-'.repeat(40));

        const responseStrategies = {
            'IMMEDIATE_REJECTION': {
                trigger: 'Invalid request format or authentication failure',
                action: 'Return error response immediately without processing',
                statusCodes: [400, 401, 403],
                recovery: 'Client must correct request before retry'
            },
            'GRACEFUL_DEGRADATION': {
                trigger: 'Non-critical service failure or resource limitation',
                action: 'Provide reduced functionality or cached response',
                statusCodes: [200, 206, 503],
                recovery: 'Automatic recovery when service restored'
            },
            'RETRY_WITH_BACKOFF': {
                trigger: 'Transient failures or rate limiting',
                action: 'Request client retry with increasing delays',
                statusCodes: [429, 502, 503, 504],
                recovery: 'Exponential backoff strategy recommended'
            },
            'ESCALATION_REQUIRED': {
                trigger: 'Critical system errors or security incidents',
                action: 'Log error, alert administrators, return generic error',
                statusCodes: [500, 502],
                recovery: 'Manual intervention or system restart required'
            }
        };

        Object.entries(responseStrategies).forEach(([strategy, details]) => {
            logger.info(`\n${strategy}:`);
            logger.info(`• Trigger: ${details.trigger}`);
            logger.info(`• Action: ${details.action}`);
            logger.info(`• Status Codes: ${details.statusCodes.join(', ')}`);
            logger.info(`• Recovery: ${details.recovery}`);
        });

        // Display error logging level determination using classification results
        logger.info('\n4. Logging Level Determination:');
        logger.info('-'.repeat(40));

        const loggingStrategy = {
            'DEBUG': 'Detailed information for development and troubleshooting',
            'INFO': 'General application flow and successful operations',
            'WARN': 'Potentially harmful situations or degraded functionality',
            'ERROR': 'Error conditions that allow application to continue',
            'FATAL': 'Critical errors that may cause application termination'
        };

        Object.entries(loggingStrategy).forEach(([level, description]) => {
            logger.info(`• ${level}: ${description}`);
        });

        // Add demonstrated patterns to results for summary generation
        classificationResults.patterns = [
            {
                name: 'Systematic Error Classification',
                description: 'Comprehensive classification of errors by type, severity, and impact',
                benefits: ['Consistent handling', 'Appropriate responses', 'Monitoring integration'],
                implementation: 'classifyError function with context analysis'
            },
            {
                name: 'HTTP Status Code Mapping',
                description: 'Automatic assignment of appropriate HTTP status codes based on error type',
                benefits: ['Protocol compliance', 'Client clarity', 'API consistency'],
                implementation: 'Status code assignment matrix based on error classification'
            },
            {
                name: 'Response Strategy Selection',
                description: 'Selection of appropriate response strategy based on error characteristics',
                benefits: ['System resilience', 'User experience', 'Recovery guidance'],
                implementation: 'Strategy matrix with error type and severity consideration'
            }
        ];

        // Add educational points for comprehensive learning reinforcement
        classificationResults.educationalPoints = [
            'Error classification enables systematic and consistent error handling approaches',
            'Different error types require different HTTP status codes and response strategies',
            'Severity levels help determine appropriate logging levels and escalation procedures',
            'Impact analysis guides resource allocation and recovery priority decisions',
            'Correlation tracking enables error pattern analysis and system improvement',
            'Classification consistency improves API reliability and developer experience'
        ];

        // Display classification summary with educational explanations and best practices
        logger.info('\n📚 Error Classification System Summary:');
        logger.info(`• Total Classifications Performed: ${classificationResults.totalClassifications}`);
        logger.info(`• Error Types Identified: ${Object.keys(classificationResults.classificationsByType).join(', ')}`);
        logger.info(`• Severity Levels Used: ${Object.keys(classificationResults.classificationsBySeverity).join(', ')}`);
        logger.info('• All errors systematically classified for appropriate handling');
        logger.info('• HTTP status codes assigned based on error type and context');
        logger.info('• Response strategies selected based on error characteristics and impact');

        return classificationResults;

    } catch (error) {
        // Handle classification demonstration failures with comprehensive error context
        logger.error('Error classification demonstration failed', {
            error: error.message,
            phase: 'error_classification_demonstration',
            totalClassifications: classificationResults.totalClassifications,
            timestamp: new Date().toISOString()
        });

        throw new Error(`Error classification demonstration failed: ${error.message}`);
    }
}

/**
 * Demonstrates comprehensive error logging patterns including structured logging, correlation
 * tracking, sensitive data sanitization, and debugging information with security considerations
 * and monitoring integration for production-ready applications.
 * 
 * @param {Array<Error>} errorExamples - Array of error objects for logging demonstration
 * @param {Logger} logger - Logger instance for demonstration output and educational content
 * @returns {void} Demonstrates error logging patterns with console output examples
 * 
 * @example
 * await demonstrateErrorLogging([
 *   new Error('Sample error for logging demo'),
 *   new Error('Another error with context')
 * ], logger);
 */
async function demonstrateErrorLogging(errorExamples = [], logger) {
    try {
        // Validate error examples parameter for logging demonstration
        if (!Array.isArray(errorExamples) || errorExamples.length === 0) {
            throw new Error('Error examples must be a non-empty array for logging demonstration');
        }

        // Validate logger instance parameter for demonstration execution
        if (!logger || typeof logger.logError !== 'function') {
            throw new Error('Valid Logger instance is required for error logging demonstration');
        }

        logger.info('\n📝 COMPREHENSIVE ERROR LOGGING DEMONSTRATION');
        logger.info('='.repeat(60));
        logger.info('Demonstrating production-ready error logging patterns with security considerations');

        // Create various error examples with different contexts and metadata
        const enrichedErrorExamples = errorExamples.map((error, index) => {
            const correlationId = generateErrorId();
            
            return {
                id: `log-demo-${index + 1}`,
                error,
                correlationId,
                context: {
                    requestId: correlationId,
                    userId: 'user-' + Math.floor(Math.random() * 1000),
                    sessionId: 'session-' + Math.random().toString(36).substr(2, 9),
                    userAgent: 'Mozilla/5.0 (Demo Client)',
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    timestamp: new Date().toISOString(),
                    requestUrl: `/api/demo/${index + 1}`,
                    httpMethod: ['GET', 'POST', 'PUT'][index % 3]
                },
                metadata: {
                    environment: 'demonstration',
                    applicationVersion: '1.0.0',
                    nodeVersion: process.version,
                    memoryUsage: process.memoryUsage(),
                    cpuUsage: process.cpuUsage()
                }
            };
        });

        // Demonstrate Logger.logError method with comprehensive error context
        logger.info('\n1. Structured Error Logging with Context:');
        logger.info('-'.repeat(40));

        for (const enrichedError of enrichedErrorExamples) {
            logger.info(`\nLogging Error ${enrichedError.id}:`);
            
            // Use Logger.logError method with comprehensive context information
            await logger.logError(enrichedError.error, {
                correlationId: enrichedError.correlationId,
                context: enrichedError.context,
                metadata: enrichedError.metadata,
                severity: 'ERROR',
                category: 'DEMONSTRATION'
            });

            logger.info('✅ Error logged with structured format and complete context');
        }

        // Show structured error logging with correlation IDs and request context
        logger.info('\n2. Correlation ID Tracking and Request Context:');
        logger.info('-'.repeat(40));

        enrichedErrorExamples.forEach((enrichedError) => {
            logger.info(`\nCorrelation Tracking for ${enrichedError.id}:`);
            logger.info(`• Correlation ID: ${enrichedError.correlationId}`);
            logger.info(`• Request Context: ${enrichedError.context.httpMethod} ${enrichedError.context.requestUrl}`);
            logger.info(`• User Context: ${enrichedError.context.userId} (Session: ${enrichedError.context.sessionId})`);
            logger.info(`• Network Context: ${enrichedError.context.ipAddress} via ${enrichedError.context.userAgent}`);
            logger.info('• Full request lifecycle trackable through correlation ID');
        });

        // Display sensitive data sanitization in error logs for security compliance
        logger.info('\n3. Sensitive Data Sanitization for Security:');
        logger.info('-'.repeat(40));

        // Create error with sensitive information that must be sanitized
        const sensitiveError = new Error('Database connection failed with password=secret123 for user=admin');
        const sanitizedMessage = sanitizeErrorMessage(sensitiveError.message);

        logger.info('Original Error Message (Internal Only):');
        logger.debug(sensitiveError.message); // Only logged at debug level internally

        logger.info('Sanitized Error Message (Client Safe):');
        logger.info(sanitizedMessage);

        logger.info('\nSanitization Benefits:');
        logger.info('• Removes passwords, API keys, and other sensitive credentials');
        logger.info('• Maintains error context while protecting security information');
        logger.info('• Complies with security policies and data protection regulations');
        logger.info('• Prevents accidental exposure of sensitive data in log aggregation systems');

        // Demonstrate error logging level determination based on error severity
        logger.info('\n4. Error Logging Level Strategy:');
        logger.info('-'.repeat(40));

        const loggingLevelExamples = [
            {
                level: 'DEBUG',
                error: new Error('Detailed troubleshooting information'),
                context: 'Development environment with verbose logging enabled',
                audience: 'Developers and troubleshooting teams'
            },
            {
                level: 'INFO',
                error: new Error('Normal application flow information'),
                context: 'Successful operations and expected application behavior',
                audience: 'Operations teams and application monitoring'
            },
            {
                level: 'WARN',
                error: new Error('Potentially harmful situation detected'),
                context: 'Degraded performance or non-critical service failures',
                audience: 'Operations teams and system administrators'
            },
            {
                level: 'ERROR',
                error: new Error('Error condition that allows continued operation'),
                context: 'Application errors that require attention but do not stop service',
                audience: 'Operations teams and development teams'
            },
            {
                level: 'FATAL',
                error: new Error('Critical error that may terminate application'),
                context: 'Severe system failures requiring immediate intervention',
                audience: 'On-call teams and incident response personnel'
            }
        ];

        loggingLevelExamples.forEach((example) => {
            logger.info(`\n${example.level} Level:`);
            logger.info(`• Error: ${example.error.message}`);
            logger.info(`• Context: ${example.context}`);
            logger.info(`• Audience: ${example.audience}`);
            
            // Demonstrate appropriate logging method based on level
            switch (example.level) {
                case 'DEBUG':
                    logger.debug(example.error.message);
                    break;
                case 'INFO':
                    logger.info(`INFO: ${example.error.message}`);
                    break;
                case 'WARN':
                    logger.warn(`WARN: ${example.error.message}`);
                    break;
                case 'ERROR':
                    logger.error(`ERROR: ${example.error.message}`);
                    break;
                case 'FATAL':
                    logger.error(`FATAL: ${example.error.message}`);
                    break;
            }
        });

        // Show stack trace handling for debugging while maintaining security
        logger.info('\n5. Stack Trace Handling and Security:');
        logger.info('-'.repeat(40));

        const stackTraceError = new Error('Stack trace demonstration error');
        stackTraceError.stack = `Error: Stack trace demonstration error
    at demonstrateErrorLogging (/app/examples/error-handling.js:1234:56)
    at runErrorHandlingDemo (/app/examples/error-handling.js:567:89)
    at main (/app/server.js:123:45)`;

        logger.info('Stack Trace Security Considerations:');
        logger.info('• Full stack traces logged internally for debugging purposes');
        logger.info('• Stack traces sanitized or omitted from client-facing responses');
        logger.info('• File paths and internal implementation details protected');
        logger.info('• Debug information preserved for authorized personnel only');

        // Log stack trace internally (would be restricted in production)
        logger.debug('Internal Stack Trace:', stackTraceError.stack);

        // Show sanitized version for external consumption
        const sanitizedStack = 'Error occurred in application request handler';
        logger.info('Client-Safe Error Description:', sanitizedStack);

        // Display error metrics integration for monitoring and alerting
        logger.info('\n6. Error Metrics Integration and Monitoring:');
        logger.info('-'.repeat(40));

        const errorMetrics = {
            totalErrorsLogged: enrichedErrorExamples.length + loggingLevelExamples.length + 1,
            errorsByLevel: {
                'DEBUG': 1,
                'INFO': 1,
                'WARN': 1,
                'ERROR': enrichedErrorExamples.length + 1,
                'FATAL': 1
            },
            errorsByCorrelation: enrichedErrorExamples.map(e => e.correlationId),
            loggingMetadata: {
                sessionStart: new Date().toISOString(),
                loggerVersion: '1.0.0',
                structuredLogging: true,
                correlationTracking: true,
                sensitiveDataSanitization: true
            }
        };

        logger.info('Error Logging Metrics:');
        logger.info(`• Total Errors Logged: ${errorMetrics.totalErrorsLogged}`);
        logger.info(`• Errors by Level: ${JSON.stringify(errorMetrics.errorsByLevel, null, 2)}`);
        logger.info(`• Correlation IDs Generated: ${errorMetrics.errorsByCorrelation.length}`);
        logger.info('• Structured logging format used for all error entries');
        logger.info('• Security sanitization applied to prevent information disclosure');

        // Show correlation between error logs and response generation
        logger.info('\n7. Error Log Correlation with Response Generation:');
        logger.info('-'.repeat(40));

        logger.info('Log-Response Correlation Benefits:');
        logger.info('• Error logs and HTTP responses share correlation IDs for traceability');
        logger.info('• Internal error details preserved in logs while responses remain secure');
        logger.info('• Support teams can correlate customer reports with internal error logs');
        logger.info('• Performance impact analysis links response times with error patterns');
        logger.info('• Monitoring systems can correlate log entries with user experience metrics');

        // Display error logging best practices and educational explanations
        logger.info('\n📚 Error Logging Best Practices Summary:');
        logger.info('• Use structured logging with consistent format across all error types');
        logger.info('• Include correlation IDs to enable tracing across distributed systems');
        logger.info('• Sanitize sensitive data while preserving debugging context');
        logger.info('• Apply appropriate logging levels based on error severity and audience');
        logger.info('• Preserve stack traces internally while protecting them from external exposure');
        logger.info('• Integrate error metrics for monitoring, alerting, and performance analysis');
        logger.info('• Maintain correlation between error logs and application responses');
        logger.info('• Consider log aggregation and centralized monitoring for production systems');

        logger.info('\n✅ Error Logging Demonstration Completed Successfully');
        logger.info('All error logging patterns demonstrated with security and monitoring considerations');

    } catch (error) {
        // Handle error logging demonstration failures with comprehensive error context
        logger.error('Error logging demonstration failed', {
            error: error.message,
            phase: 'error_logging_demonstration',
            timestamp: new Date().toISOString()
        });

        throw new Error(`Error logging demonstration failed: ${error.message}`);
    }
}

/**
 * Demonstrates complete application-level error handling including server startup errors,
 * graceful shutdown, and comprehensive error recovery strategies with monitoring integration
 * and production-ready patterns.
 * 
 * @param {Object} appConfig - Configuration object for application error handling demonstration
 * @returns {Promise<void>} Promise that resolves when application error handling demonstration is complete
 * 
 * @example
 * await demonstrateApplicationErrorHandling({
 *   enableGracefulShutdown: true,
 *   includeStartupErrors: true,
 *   showRecoveryStrategies: true
 * });
 */
async function demonstrateApplicationErrorHandling(appConfig = {}) {
    let demoApp, logger, errorHandler;

    try {
        // Create logger instance for application error handling demonstration
        logger = new Logger({
            level: appConfig.verbose ? 'debug' : 'info',
            enableCorrelation: true,
            includeTimestamp: true
        });

        // Create error handler for application-level error management
        errorHandler = new ErrorHandler({
            logger,
            enableGracefulShutdown: appConfig.enableGracefulShutdown !== false,
            includeStackTrace: appConfig.includeStackTrace !== false
        });

        logger.info('\n🏗️  APPLICATION-LEVEL ERROR HANDLING DEMONSTRATION');
        logger.info('='.repeat(60));
        logger.info('Demonstrating comprehensive application error handling and recovery strategies');

        // Create application instance with error handling configuration
        logger.info('\n1. Application Instance Creation with Error Handling:');
        logger.info('-'.repeat(40));

        try {
            // Use createApplication factory function with error handling configuration
            demoApp = createApplication({
                port: 0, // Use dynamic port to avoid conflicts
                host: '127.0.0.1',
                errorHandler: errorHandler,
                logger: logger,
                enableGracefulShutdown: appConfig.enableGracefulShutdown !== false
            });

            logger.info('✅ Application instance created with error handling configuration');
            logger.info('• Error handler integrated for comprehensive error management');
            logger.info('• Logger configured for application lifecycle event tracking');
            logger.info('• Graceful shutdown enabled for production-ready error recovery');

        } catch (appCreationError) {
            logger.error('Application creation error demonstration:', {
                error: appCreationError.message,
                phase: 'application_initialization',
                recoveryAction: 'validate_configuration_and_dependencies'
            });

            // Show application error recovery strategies and graceful degradation
            logger.info('Application Creation Error Recovery:');
            logger.info('• Validate application configuration parameters');
            logger.info('• Check dependency availability and versions');
            logger.info('• Verify environment variable configuration');
            logger.info('• Implement fallback configuration for critical components');
        }

        // Simulate server startup error scenarios and demonstrate proper error handling
        if (appConfig.includeStartupErrors !== false) {
            logger.info('\n2. Server Startup Error Scenarios:');
            logger.info('-'.repeat(40));

            // Demonstrate port binding error handling with clear error messages
            logger.info('\nSimulating Port Binding Error:');
            try {
                // Attempt to bind to a port that might be in use
                const conflictApp = createApplication({
                    port: 80, // Privileged port likely to cause permission error
                    host: '127.0.0.1'
                });

                await conflictApp.start();

            } catch (portError) {
                logger.info('Port binding error handled appropriately:');
                logger.info(`• Error: ${portError.message}`);
                logger.info('• Recovery Strategy: Try alternative port or check permissions');
                logger.info('• User Guidance: Use port >= 1024 for non-privileged execution');
                logger.info('• Graceful Failure: Application fails fast with clear error message');

                await errorHandler.handle(portError, null, null, {
                    correlationId: generateErrorId(),
                    errorType: 'STARTUP_ERROR',
                    phase: 'port_binding',
                    recoveryStrategy: 'try_alternative_port'
                });
            }

            // Show configuration validation error handling and user-friendly error reporting
            logger.info('\nSimulating Configuration Validation Error:');
            try {
                const invalidConfigApp = createApplication({
                    port: 'invalid-port', // Invalid configuration
                    host: null
                });

            } catch (configError) {
                logger.info('Configuration validation error handled:');
                logger.info(`• Error: ${configError.message}`);
                logger.info('• Recovery Strategy: Validate configuration before application start');
                logger.info('• User Guidance: Check configuration file format and required fields');
                logger.info('• Fail-Fast Principle: Prevent application start with invalid configuration');

                await errorHandler.handle(configError, null, null, {
                    correlationId: generateErrorId(),
                    errorType: 'CONFIGURATION_ERROR',
                    phase: 'configuration_validation',
                    recoveryStrategy: 'validate_and_correct_configuration'
                });
            }
        }

        // Start the demo application if it was successfully created
        if (demoApp) {
            logger.info('\n3. Application Startup and Runtime Error Handling:');
            logger.info('-'.repeat(40));

            try {
                await demoApp.start();
                logger.info('✅ Demo application started successfully');
                logger.info(`• Application listening on port: ${demoApp.getPort()}`);
                logger.info(`• Application host: ${demoApp.getHost()}`);
                logger.info('• Runtime error handling active and monitoring for errors');

                // Simulate runtime error scenarios and demonstrate error recovery mechanisms
                logger.info('\n4. Runtime Error Scenarios and Recovery:');
                logger.info('-'.repeat(40));

                // Simulate memory pressure error
                const memoryError = new Error('Memory usage exceeded safe threshold');
                memoryError.code = 'MEMORY_PRESSURE';
                
                await errorHandler.handle(memoryError, null, null, {
                    correlationId: generateErrorId(),
                    errorType: 'RUNTIME_ERROR',
                    memoryUsage: process.memoryUsage(),
                    recoveryStrategy: 'garbage_collection_and_monitoring'
                });

                logger.info('Runtime error recovery demonstrated:');
                logger.info('• Memory pressure detected and logged with metrics');
                logger.info('• Garbage collection triggered for memory recovery');
                logger.info('• Application continues operation with enhanced monitoring');

                // Show comprehensive error logging throughout application lifecycle
                logger.info('\n5. Application Lifecycle Error Logging:');
                logger.info('-'.repeat(40));

                const lifecycleEvents = [
                    'application_started',
                    'first_request_received',
                    'error_detected_and_handled',
                    'recovery_strategy_applied',
                    'monitoring_metrics_updated'
                ];

                lifecycleEvents.forEach(event => {
                    logger.info(`📊 Lifecycle Event: ${event}`);
                });

                logger.info('• All application lifecycle events logged with correlation');
                logger.info('• Error patterns tracked across application runtime');
                logger.info('• Performance metrics integrated with error handling');

            } catch (startupError) {
                logger.error('Application startup failed', {
                    error: startupError.message,
                    phase: 'application_startup',
                    recoveryAction: 'check_system_resources_and_configuration'
                });
            }

            // Demonstrate graceful shutdown with error cleanup and resource deallocation
            if (appConfig.enableGracefulShutdown !== false) {
                logger.info('\n6. Graceful Shutdown and Error Cleanup:');
                logger.info('-'.repeat(40));

                try {
                    logger.info('Initiating graceful shutdown with error cleanup...');
                    
                    // Stop the application gracefully
                    await demoApp.stop();
                    
                    logger.info('✅ Graceful shutdown completed successfully');
                    logger.info('• Active connections closed gracefully');
                    logger.info('• Error handlers cleaned up and resources released');
                    logger.info('• Application state persisted for restart recovery');
                    logger.info('• Monitoring systems notified of clean shutdown');

                } catch (shutdownError) {
                    logger.error('Graceful shutdown encountered error', {
                        error: shutdownError.message,
                        phase: 'graceful_shutdown',
                        fallbackAction: 'force_shutdown_with_resource_cleanup'
                    });

                    // Demonstrate fallback shutdown strategy
                    logger.info('Fallback Shutdown Strategy:');
                    logger.info('• Force close active connections after timeout');
                    logger.info('• Log incomplete operations for manual recovery');
                    logger.info('• Ensure critical resources are released');
                    logger.info('• Generate shutdown report for operational review');
                }
            }
        }

        // Display error handling integration across all application components
        logger.info('\n7. Error Handling Integration Across Components:');
        logger.info('-'.repeat(40));

        const integrationPoints = [
            'HTTP Server: Request processing errors handled with appropriate status codes',
            'Application: Startup, runtime, and shutdown errors managed with recovery strategies',
            'Logger: Comprehensive error logging with correlation and security sanitization',
            'ErrorHandler: Centralized error classification and response generation',
            'Configuration: Validation errors caught early with clear user guidance',
            'Monitoring: Error metrics integrated with application performance monitoring'
        ];

        integrationPoints.forEach((point, index) => {
            logger.info(`${index + 1}. ${point}`);
        });

        // Demonstrate production-ready error handling patterns and monitoring integration
        logger.info('\n8. Production Readiness and Monitoring Integration:');
        logger.info('-'.repeat(40));

        const productionReadinessChecklist = [
            '✅ Error classification system for systematic error handling',
            '✅ Correlation tracking for distributed system error tracing',
            '✅ Secure error messages that prevent information disclosure',
            '✅ Graceful degradation for non-critical error conditions',
            '✅ Resource cleanup and memory management during errors',
            '✅ Monitoring integration with error rate tracking',
            '✅ Alerting configuration for critical error conditions',
            '✅ Error recovery strategies for different failure scenarios'
        ];

        productionReadinessChecklist.forEach(item => {
            logger.info(item);
        });

        logger.info('\n✅ Application-Level Error Handling Demonstration Completed');
        logger.info('All application error handling patterns demonstrated with production readiness');
        logger.info('Comprehensive error management across application lifecycle achieved');

    } catch (error) {
        // Handle application error handling demonstration failures
        if (logger) {
            logger.error('Application error handling demonstration failed', {
                error: error.message,
                phase: 'application_error_demonstration',
                timestamp: new Date().toISOString()
            });
        } else {
            console.error('Application Error Demo Failed:', error.message);
        }

        throw new Error(`Application error handling demonstration failed: ${error.message}`);
    } finally {
        // Ensure demo application cleanup regardless of success or failure
        if (demoApp) {
            try {
                await demoApp.stop();
                if (logger) {
                    logger.info('Demo application cleanup completed');
                }
            } catch (cleanupError) {
                if (logger) {
                    logger.warn('Demo application cleanup encountered error', {
                        error: cleanupError.message
                    });
                }
            }
        }
    }
}

// ============================================================================
// MAIN ERROR HANDLING DEMONSTRATION CLASS
// ============================================================================

/**
 * Main demonstration class that orchestrates comprehensive error handling examples and provides
 * structured learning experience for Node.js error management concepts. Implements educational
 * error handling patterns while showcasing production-ready error management techniques including
 * error classification, logging, response generation, and recovery strategies.
 * 
 * This class serves as the central orchestrator for all error handling demonstrations, providing
 * a complete educational journey through Node.js error management concepts with practical examples
 * and production-ready patterns.
 */
class ErrorHandlingDemo extends EventEmitter {
    /**
     * Initializes the error handling demonstration with configuration, error handler, logger,
     * and demo application setup for comprehensive error handling education.
     * 
     * @param {Object} options - Configuration options for error handling demonstration
     */
    constructor(options = {}) {
        super();

        try {
            // Merge provided options with DEMO_CONFIG defaults for comprehensive configuration
            this.config = {
                ...DEMO_CONFIG,
                ...options
            };

            // Initialize Logger instance with demonstration-specific configuration settings
            this.logger = new Logger({
                level: this.config.enableVerboseLogging ? 'debug' : 'info',
                enableCorrelation: this.config.enableErrorCorrelation,
                includeTimestamp: true,
                colorize: true,
                format: 'structured'
            });

            // Create ErrorHandler instance with demonstration configuration and enhanced logging
            this.errorHandler = new ErrorHandler({
                logger: this.logger,
                sanitizeMessages: this.config.sanitizeErrorMessages,
                includeStackTrace: this.config.includeStackTrace,
                enableCorrelation: this.config.enableErrorCorrelation,
                enableMetrics: this.config.includePerformanceMetrics
            });

            // Set up demo application instance using createApplication factory function
            this.demoApp = null; // Will be initialized during demonstration if needed
            
            // Initialize error scenario collection for comprehensive demonstration coverage
            this.errorScenarios = {
                ...EXAMPLE_SCENARIOS,
                customScenarios: options.customScenarios || []
            };

            // Initialize demonstration tracking and results collection
            this.demonstrationResults = {
                totalDemonstrations: 0,
                successfulHandling: 0,
                errorTypesDemo: [],
                patternsDemo: [],
                educationalPoints: [],
                keyTakeaways: [],
                performanceMetrics: {
                    startTime: null,
                    endTime: null,
                    demonstrations: []
                }
            };

            // Configure demonstration tracking and results collection
            this.isRunning = false;

            // Set up error simulation settings based on configuration preferences
            this.simulationSettings = {
                ...ERROR_SIMULATION_SETTINGS,
                ...options.simulationSettings
            };

            // Log demonstration initialization with configuration summary and learning objectives
            this.logger.info('Error Handling Demonstration initialized successfully');
            this.logger.debug('Configuration:', this.config);
            this.logger.info('Learning Objectives: Error classification, secure handling, correlation tracking, recovery strategies');

        } catch (error) {
            // Handle initialization errors with comprehensive error context
            const initError = new Error(`ErrorHandlingDemo initialization failed: ${error.message}`);
            initError.originalError = error;
            initError.context = {
                class: 'ErrorHandlingDemo',
                method: 'constructor',
                timestamp: new Date().toISOString()
            };
            throw initError;
        }
    }

    /**
     * Executes the complete error handling demonstration including all error types, logging
     * patterns, and educational explanations with comprehensive coverage and learning reinforcement.
     * 
     * @returns {Promise<Object>} Promise that resolves with complete demonstration results
     */
    async runDemo() {
        try {
            // Check if demonstration is already running
            if (this.isRunning) {
                throw new Error('Error handling demonstration is already running');
            }

            this.isRunning = true;
            this.demonstrationResults.performanceMetrics.startTime = Date.now();

            // Log demonstration start with learning objectives and scope
            this.logger.info('='.repeat(80));
            this.logger.info('STARTING COMPREHENSIVE ERROR HANDLING DEMONSTRATION');
            this.logger.info('='.repeat(80));
            this.logger.info('Educational Journey: From basic error handling to production-ready patterns');
            this.emit('demo:started', { timestamp: new Date().toISOString() });

            // Execute client error demonstrations with 4xx status code scenarios
            this.logger.info('\n🎯 Phase 1: Client Error Handling (4xx Status Codes)');
            const clientResults = await this.demonstrateClientErrorHandling({
                scenarios: this.errorScenarios.CLIENT_ERROR_SCENARIOS,
                includeEducationalContent: this.config.showEducationalExplanations
            });
            
            this.demonstrationResults.totalDemonstrations += clientResults.demonstrationCount;
            this.demonstrationResults.successfulHandling += clientResults.successfulHandling;
            this.demonstrationResults.errorTypesDemo.push('CLIENT_ERRORS');
            this.demonstrationResults.patternsDemo.push(...clientResults.patterns);

            // Execute server error demonstrations with 5xx status code scenarios
            this.logger.info('\n🔥 Phase 2: Server Error Handling (5xx Status Codes)');
            const serverResults = await this.demonstrateServerErrorHandling({
                scenarios: this.errorScenarios.SERVER_ERROR_SCENARIOS,
                includeSecurityConsiderations: true
            });

            this.demonstrationResults.totalDemonstrations += serverResults.demonstrationCount;
            this.demonstrationResults.successfulHandling += serverResults.successfulHandling;
            this.demonstrationResults.errorTypesDemo.push('SERVER_ERRORS');
            this.demonstrationResults.patternsDemo.push(...serverResults.patterns);

            // Demonstrate error classification system with various error types and severities
            this.logger.info('\n📊 Phase 3: Error Classification System');
            const classificationResults = await this.demonstrateErrorClassificationSystem();
            
            this.demonstrationResults.educationalPoints.push('Error Classification System');
            this.demonstrationResults.patternsDemo.push(...classificationResults.patterns);

            // Demonstrate comprehensive error logging patterns with correlation tracking
            this.logger.info('\n📝 Phase 4: Comprehensive Error Logging');
            const loggingResults = await this.demonstrateComprehensiveLogging({
                includeSanitization: this.config.sanitizeErrorMessages,
                includeCorrelation: this.config.enableErrorCorrelation
            });

            this.demonstrationResults.educationalPoints.push('Comprehensive Error Logging');

            // Simulate real-world error scenarios for comprehensive testing
            this.logger.info('\n🌐 Phase 5: Real-World Error Scenarios');
            const realWorldScenarios = await this.simulateRealWorldScenarios([
                'network_timeout',
                'memory_error',
                'parse_error',
                'validation_error'
            ]);

            this.demonstrationResults.educationalPoints.push('Real-World Error Simulation');

            // Calculate demonstration completion metrics and performance information
            this.demonstrationResults.performanceMetrics.endTime = Date.now();
            this.demonstrationResults.performanceMetrics.totalDuration = 
                this.demonstrationResults.performanceMetrics.endTime - 
                this.demonstrationResults.performanceMetrics.startTime;

            // Generate key takeaways and educational summary
            this.demonstrationResults.keyTakeaways = [
                'Error classification enables systematic and appropriate error handling',
                'Secure error responses prevent information disclosure while maintaining debugging capability',
                'Correlation tracking allows comprehensive error tracing across request lifecycles',
                'Structured logging provides essential context for debugging and monitoring',
                'Recovery strategies ensure system resilience and graceful degradation',
                'Production-ready error handling requires monitoring, metrics, and alerting integration'
            ];

            // Display demonstration summary with educational takeaways and best practices
            this.logger.info('\n📚 DEMONSTRATION COMPLETION SUMMARY');
            this.logger.info('='.repeat(80));
            displayErrorHandlingSummary(this.demonstrationResults, this.logger);

            // Log demonstration completion with results summary and next steps
            this.logger.info('\n✅ ERROR HANDLING DEMONSTRATION COMPLETED SUCCESSFULLY');
            this.logger.info(`📊 Total Demonstrations: ${this.demonstrationResults.totalDemonstrations}`);
            this.logger.info(`✅ Successful Handling: ${this.demonstrationResults.successfulHandling}`);
            this.logger.info(`📖 Educational Points: ${this.demonstrationResults.educationalPoints.length}`);
            this.logger.info(`⏱️  Duration: ${this.demonstrationResults.performanceMetrics.totalDuration}ms`);
            this.logger.info('🎓 Next Steps: Apply these patterns in your Node.js applications');

            this.emit('demo:completed', this.demonstrationResults);
            return this.demonstrationResults;

        } catch (error) {
            // Handle demonstration execution errors with comprehensive error context
            this.logger.error('Error handling demonstration failed', {
                error: error.message,
                phase: 'demonstration_execution',
                timestamp: new Date().toISOString(),
                demonstrationCount: this.demonstrationResults.totalDemonstrations
            });

            this.emit('demo:error', {
                error: error.message,
                context: 'demonstration_execution'
            });

            throw new Error(`Error handling demonstration failed: ${error.message}`);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Demonstrates client error handling (4xx) including bad requests, not found, and method
     * not allowed scenarios with proper response generation and educational explanations.
     * 
     * @param {Object} clientErrorConfig - Configuration for client error demonstration
     * @returns {Object} Client error demonstration results with examples and educational content
     */
    async demonstrateClientErrorHandling(clientErrorConfig = {}) {
        const results = {
            demonstrationCount: 0,
            successfulHandling: 0,
            patterns: [],
            educationalPoints: []
        };

        try {
            this.logger.info('\n📋 Client Error Handling Demonstration (4xx Status Codes)');
            this.logger.info('-'.repeat(60));

            // Use the standalone function for client error demonstrations
            const clientResults = await demonstrateClientErrors(this.errorHandler, this.logger);

            // Merge results from standalone function
            results.demonstrationCount = clientResults.demonstrationCount;
            results.successfulHandling = clientResults.successfulHandling;
            results.patterns = clientResults.patterns;
            results.educationalPoints = clientResults.educationalPoints;

            // Add additional educational content if requested
            if (clientErrorConfig.includeEducationalContent) {
                results.educationalPoints.push(
                    'Client errors (4xx) indicate problems with the client request',
                    'Proper status code selection helps clients understand and fix issues',
                    'Error message sanitization prevents information disclosure vulnerabilities'
                );
            }

            this.logger.info(`✅ Client error handling demonstration completed: ${results.demonstrationCount} scenarios`);
            return results;

        } catch (error) {
            this.logger.error('Client error handling demonstration failed', {
                error: error.message,
                demonstrationCount: results.demonstrationCount
            });
            throw error;
        }
    }

    /**
     * Demonstrates server error handling (5xx) including internal errors, processing failures,
     * and secure error response generation with comprehensive security considerations.
     * 
     * @param {Object} serverErrorConfig - Configuration for server error demonstration
     * @returns {Object} Server error demonstration results with security considerations and monitoring integration
     */
    async demonstrateServerErrorHandling(serverErrorConfig = {}) {
        const results = {
            demonstrationCount: 0,
            successfulHandling: 0,
            patterns: [],
            educationalPoints: []
        };

        try {
            this.logger.info('\n🔥 Server Error Handling Demonstration (5xx Status Codes)');
            this.logger.info('-'.repeat(60));

            // Use the standalone function for server error demonstrations
            const serverResults = await demonstrateServerErrors(this.errorHandler, this.logger);

            // Merge results from standalone function
            results.demonstrationCount = serverResults.demonstrationCount;
            results.successfulHandling = serverResults.successfulHandling;
            results.patterns = serverResults.patterns;
            results.educationalPoints = serverResults.educationalPoints;

            // Add security considerations if requested
            if (serverErrorConfig.includeSecurityConsiderations) {
                results.educationalPoints.push(
                    'Server errors (5xx) should never expose sensitive system information',
                    'Error sanitization is critical for preventing information disclosure',
                    'Internal error details must be logged separately from client responses'
                );
            }

            this.logger.info(`✅ Server error handling demonstration completed: ${results.demonstrationCount} scenarios`);
            return results;

        } catch (error) {
            this.logger.error('Server error handling demonstration failed', {
                error: error.message,
                demonstrationCount: results.demonstrationCount
            });
            throw error;
        }
    }

    /**
     * Demonstrates the error classification system including error types, severity levels,
     * and response strategy selection with comprehensive examples and educational explanations.
     * 
     * @returns {Object} Error classification demonstration results with examples and educational explanations
     */
    async demonstrateErrorClassificationSystem() {
        try {
            this.logger.info('\n📊 Error Classification System Demonstration');
            this.logger.info('-'.repeat(60));

            // Combine all error scenarios for comprehensive classification demonstration
            const allScenarios = [
                ...this.errorScenarios.CLIENT_ERROR_SCENARIOS,
                ...this.errorScenarios.SERVER_ERROR_SCENARIOS,
                ...this.errorScenarios.VALIDATION_ERROR_SCENARIOS
            ];

            // Use the standalone function for error classification demonstration
            const classificationResults = await demonstrateErrorClassification(allScenarios, this.logger);

            this.logger.info(`✅ Error classification demonstration completed: ${classificationResults.totalClassifications} classifications`);
            return classificationResults;

        } catch (error) {
            this.logger.error('Error classification demonstration failed', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Demonstrates comprehensive error logging including structured logging, correlation tracking,
     * and debugging information with security considerations and monitoring integration.
     * 
     * @param {Object} loggingConfig - Configuration for error logging demonstration
     * @returns {void} Demonstrates error logging patterns with console output and educational explanations
     */
    async demonstrateComprehensiveLogging(loggingConfig = {}) {
        try {
            this.logger.info('\n📝 Comprehensive Error Logging Demonstration');
            this.logger.info('-'.repeat(60));

            // Create sample errors for logging demonstration
            const errorExamples = [
                new Error('Sample client error for logging demonstration'),
                new Error('Sample server error with sensitive data: password=secret123'),
                new Error('Sample validation error for logging demonstration'),
                new Error('Sample network timeout error for logging demonstration')
            ];

            // Use the standalone function for error logging demonstration
            await demonstrateErrorLogging(errorExamples, this.logger);

            this.logger.info('✅ Comprehensive error logging demonstration completed');

        } catch (error) {
            this.logger.error('Error logging demonstration failed', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Simulates real-world error scenarios including network failures, resource exhaustion,
     * and concurrent request handling errors for comprehensive error handling validation.
     * 
     * @param {Array<string>} scenarioTypes - Array of error scenario types to simulate
     * @returns {Array<Object>} Array of simulated error scenarios with context and handling results
     */
    async simulateRealWorldScenarios(scenarioTypes = []) {
        try {
            this.logger.info('\n🌐 Real-World Error Scenarios Simulation');
            this.logger.info('-'.repeat(60));

            // Use the utility function to simulate error scenarios
            const simulationResults = simulateErrorScenarios(scenarioTypes, {
                maxErrors: 10,
                includeContext: true,
                includeStackTrace: this.config.includeStackTrace
            });

            this.logger.info('Simulated Error Scenarios:');
            simulationResults.scenarios.forEach((scenario, index) => {
                this.logger.info(`${index + 1}. ${scenario.type}: ${scenario.error.message}`);
                this.logger.info(`   Expected Handling: ${scenario.expectedHandling}`);
                this.logger.info(`   Recovery Strategy: ${scenario.recoveryStrategy}`);
                this.logger.info(`   HTTP Status: ${scenario.httpStatus}`);
            });

            this.logger.info(`✅ Real-world scenarios simulation completed: ${simulationResults.scenarios.length} scenarios`);
            return simulationResults.scenarios;

        } catch (error) {
            this.logger.error('Real-world scenarios simulation failed', {
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Returns comprehensive demonstration results including error handling examples, educational
     * content, and performance metrics for analysis and learning assessment.
     * 
     * @returns {Object} Complete demonstration results with examples, metrics, and educational content
     */
    getDemonstrationResults() {
        return {
            ...this.demonstrationResults,
            configuration: this.config,
            errorScenarios: this.errorScenarios,
            simulationSettings: this.simulationSettings,
            metadata: {
                class: 'ErrorHandlingDemo',
                version: '1.0.0',
                generatedAt: new Date().toISOString(),
                educationalPurpose: true
            }
        };
    }

    /**
     * Cleans up demonstration resources and provides summary of error handling concepts
     * learned during the demonstration with resource cleanup and educational summary.
     * 
     * @returns {Promise<void>} Promise that resolves when cleanup is complete
     */
    async cleanup() {
        try {
            this.logger.info('\n🧹 Cleaning up demonstration resources...');

            // Stop demo application instance if running
            if (this.demoApp) {
                await this.demoApp.stop();
                this.demoApp = null;
                this.logger.info('• Demo application stopped and cleaned up');
            }

            // Clean up mock objects and demonstration resources
            this.errorScenarios = {};
            this.demonstrationResults = {};
            this.isRunning = false;

            // Generate final demonstration summary with key takeaways
            this.logger.info('\n📚 Final Learning Summary:');
            this.logger.info('• Error classification enables systematic error handling');
            this.logger.info('• Secure error responses protect sensitive information');
            this.logger.info('• Correlation tracking enables comprehensive debugging');
            this.logger.info('• Structured logging supports monitoring and alerting');
            this.logger.info('• Recovery strategies ensure system resilience');
            this.logger.info('• Production patterns require comprehensive error management');

            // Flush logger output and ensure all logs are written
            if (typeof this.logger.flush === 'function') {
                await this.logger.flush();
            }

            this.logger.info('✅ Demonstration cleanup completed successfully');
            this.emit('demo:cleanup', { timestamp: new Date().toISOString() });

        } catch (error) {
            this.logger.error('Demonstration cleanup failed', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
            throw new Error(`Demonstration cleanup failed: ${error.message}`);
        }
    }
}

// ============================================================================
// MODULE EXPORTS - Classes and Functions
// ============================================================================

// Export main demonstration class for comprehensive error handling education and practical examples
module.exports.ErrorHandlingDemo = ErrorHandlingDemo;

// Export main entry point function for executing error handling demonstrations with educational content
module.exports.runErrorHandlingDemo = runErrorHandlingDemo;

// Export individual demonstration functions for specific error handling scenarios
module.exports.demonstrateClientErrors = demonstrateClientErrors;
module.exports.demonstrateServerErrors = demonstrateServerErrors;
module.exports.demonstrateParseErrors = demonstrateParseErrors;
module.exports.demonstrateErrorClassification = demonstrateErrorClassification;
module.exports.demonstrateErrorLogging = demonstrateErrorLogging;
module.exports.demonstrateApplicationErrorHandling = demonstrateApplicationErrorHandling;

// Export utility functions for creating mock objects and simulating error scenarios
module.exports.createMockHttpObjects = createMockHttpObjects;
module.exports.simulateErrorScenarios = simulateErrorScenarios;
module.exports.displayErrorHandlingSummary = displayErrorHandlingSummary;

// Export configuration constants and educational content for customization
module.exports.EXAMPLE_SCENARIOS = EXAMPLE_SCENARIOS;
module.exports.DEMO_CONFIG = DEMO_CONFIG;
module.exports.ERROR_SIMULATION_SETTINGS = ERROR_SIMULATION_SETTINGS;
module.exports.EDUCATIONAL_CONTENT = EDUCATIONAL_CONTENT;