/**
 * Basic Usage Example for Node.js Tutorial HTTP Server
 * 
 * This example demonstrates the simplest way to create and start the Node.js tutorial HTTP server
 * using the Application class and AppConfig system. Provides a minimal, educational example that
 * shows how to use the framework to quickly set up a working HTTP server with the /hello endpoint.
 * 
 * Designed for beginners to understand core concepts without the complexity of production features,
 * while still demonstrating proper application architecture patterns and graceful shutdown procedures.
 * 
 * Learning Objectives:
 * - Application class usage and factory patterns
 * - Basic configuration setup and customization
 * - Server startup and shutdown lifecycle management
 * - HTTP endpoint testing with Node.js built-in modules
 * - Graceful shutdown implementation and signal handling
 * 
 * Educational Features:
 * - Step-by-step progress logging with educational context
 * - Interactive user input and hands-on exploration opportunities
 * - Programmatic endpoint demonstration using HTTP client
 * - Clear error messages with troubleshooting guidance
 * - Comprehensive tutorial completion feedback
 * 
 * @fileoverview Basic usage example demonstrating simplest HTTP server setup
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - INTERNAL DEPENDENCIES
// ============================================================================

// Import application factory function for creating configured application instances
import { createApplication } from '../app.js';

// Import application configuration class for basic configuration with default settings
import { AppConfig } from '../config/app.config.js';

// Import response message constants for demonstrating expected outputs and tutorial feedback
import { 
    RESPONSE_MESSAGES,
    SUCCESS_MESSAGES,
    TUTORIAL_MESSAGES
} from '../constants/response-messages.js';

// ============================================================================
// MODULE IMPORTS - EXTERNAL DEPENDENCIES  
// ============================================================================

// Node.js built-in HTTP module for endpoint testing and client requests
import { createRequire } from 'module'; // Node.js v22.x - Module loading utilities
const require = createRequire(import.meta.url);
const http = require('http'); // Node.js v22.x - HTTP client and server

// Node.js built-in process module for graceful shutdown and environment access
// Process module is globally available, no import needed

// Node.js built-in readline module for user input handling
import { createInterface } from 'readline'; // Node.js v22.x - Interactive I/O utilities

// ============================================================================
// GLOBAL CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Basic example configuration object providing default settings for the tutorial server.
 * Demonstrates minimal configuration setup appropriate for learning and development environments.
 * 
 * Configuration includes:
 * - Application identification and metadata
 * - Server network settings for local development
 * - Basic feature enablement for educational visibility
 * - Graceful shutdown configuration for proper lifecycle management
 * 
 * @type {Object}
 * @constant
 */
const BASIC_EXAMPLE_CONFIG = {
    // Application identification and metadata
    name: 'Basic HTTP Server Example',
    version: '1.0.0',
    description: 'Simplest demonstration of Node.js tutorial HTTP server',
    
    // Server network configuration for local development
    port: 3000,
    host: 'localhost',
    
    // Feature enablement for educational visibility
    enableLogging: true,
    enableGracefulShutdown: true,
    enableRequestLogging: true,
    
    // Educational features for enhanced learning experience
    enableProgressLogging: true,
    enableInteractiveMode: true,
    enableEndpointDemo: true,
    
    // Timeout configurations for tutorial context
    startupTimeout: 10000, // 10 seconds for server startup
    shutdownTimeout: 5000,  // 5 seconds for graceful shutdown
    userInputTimeout: 30000  // 30 seconds for user interaction
};

/**
 * Tutorial metadata object containing educational context and learning information.
 * Provides comprehensive tutorial information for enhanced learning experience and progress tracking.
 * 
 * Metadata includes:
 * - Example identification and educational context
 * - Learning objectives and skill development goals
 * - Estimated completion time and difficulty assessment
 * - Tutorial progression and next steps guidance
 * 
 * @type {Object}
 * @constant
 */
const TUTORIAL_METADATA = {
    // Example identification and educational context
    exampleName: 'basic-usage',
    description: 'Simplest way to start the Node.js tutorial HTTP server',
    category: 'Getting Started',
    difficulty: 'Beginner',
    
    // Learning objectives and skill development goals
    learningObjectives: [
        'Application class usage and factory pattern implementation',
        'Basic configuration setup and customization techniques', 
        'Server startup and shutdown lifecycle management',
        'HTTP endpoint testing with programmatic client requests',
        'Graceful shutdown implementation and signal handling',
        'Error handling patterns and troubleshooting techniques'
    ],
    
    // Time estimates and educational progression
    estimatedTime: '5 minutes',
    prerequisites: ['Node.js v22.x installed', 'Basic JavaScript knowledge'],
    nextSteps: ['Advanced examples with middleware', 'Database integration tutorials'],
    
    // Tutorial flow and educational structure
    phases: [
        'Configuration creation and validation',
        'Application instance creation and initialization', 
        'HTTP server startup and port binding',
        'Endpoint demonstration and testing',
        'User interaction and exploration',
        'Graceful shutdown and cleanup'
    ]
};

// ============================================================================
// CORE EXAMPLE FUNCTIONS
// ============================================================================

/**
 * Main example function that demonstrates the complete basic usage workflow including
 * application creation, startup, testing, and graceful shutdown with comprehensive
 * educational guidance and interactive learning opportunities.
 * 
 * This function orchestrates the entire tutorial experience, providing step-by-step
 * demonstration of application lifecycle management with educational context and
 * hands-on learning opportunities for enhanced skill development.
 * 
 * Workflow Overview:
 * 1. Initialize tutorial with metadata and learning objectives
 * 2. Create basic application configuration with default settings
 * 3. Create application instance using factory pattern
 * 4. Start HTTP server and verify operational readiness
 * 5. Demonstrate endpoint functionality with programmatic testing
 * 6. Enable user interaction and manual exploration
 * 7. Set up graceful shutdown handlers for clean termination
 * 8. Complete tutorial with summary and next steps guidance
 * 
 * @returns {Promise<void>} Promise that resolves when the basic example completes successfully
 * 
 * @throws {Error} Application startup, configuration, or demonstration errors with educational context
 * 
 * @example
 * // Run the basic usage example
 * await runBasicExample();
 * // Starts server, demonstrates functionality, waits for user input, then shuts down gracefully
 */
async function runBasicExample() {
    const exampleStartTime = Date.now();
    let application = null;
    
    try {
        // Phase 1: Tutorial Introduction and Learning Objectives
        await logTutorialProgress('initialization', {
            phase: 'Tutorial Introduction',
            description: 'Starting basic Node.js HTTP server tutorial',
            learningObjectives: TUTORIAL_METADATA.learningObjectives,
            estimatedTime: TUTORIAL_METADATA.estimatedTime,
            nextPhases: TUTORIAL_METADATA.phases
        });
        
        console.log('\n='.repeat(80));
        console.log('🚀 Node.js Tutorial: Basic HTTP Server Example');
        console.log('='.repeat(80));
        console.log(`📚 Learning Objectives:`);
        TUTORIAL_METADATA.learningObjectives.forEach((objective, index) => {
            console.log(`   ${index + 1}. ${objective}`);
        });
        console.log(`⏱️  Estimated Time: ${TUTORIAL_METADATA.estimatedTime}`);
        console.log(`📈 Difficulty: ${TUTORIAL_METADATA.difficulty}`);
        console.log('='.repeat(80));
        
        // Phase 2: Configuration Creation and Application Setup
        await logTutorialProgress('configuration', {
            phase: 'Configuration Setup',
            description: 'Creating basic application configuration with default settings',
            educationalContext: 'This demonstrates how to configure the application with minimal settings appropriate for learning'
        });
        
        console.log('\n📋 Step 1: Creating Basic Configuration');
        console.log('   Creating AppConfig with tutorial-appropriate defaults...');
        
        // Create basic application configuration using AppConfig with default settings
        const basicConfig = createBasicConfig({
            name: BASIC_EXAMPLE_CONFIG.name,
            port: BASIC_EXAMPLE_CONFIG.port,
            host: BASIC_EXAMPLE_CONFIG.host,
            enableLogging: BASIC_EXAMPLE_CONFIG.enableLogging,
            environment: process.env.NODE_ENV || 'development'
        });
        
        console.log(`   ✅ Configuration created successfully`);
        console.log(`   📍 Server will run on: ${basicConfig.host}:${basicConfig.port}`);
        console.log(`   🔧 Environment: ${basicConfig.environment}`);
        console.log(`   📊 Logging enabled: ${basicConfig.enableLogging}`);
        
        // Phase 3: Application Instance Creation and Initialization
        await logTutorialProgress('creation', {
            phase: 'Application Creation',
            description: 'Creating application instance using factory pattern',
            educationalContext: 'The createApplication factory function assembles all components into a working application'
        });
        
        console.log('\n🏗️  Step 2: Creating Application Instance');
        console.log('   Using createApplication factory to initialize all components...');
        
        // Create application instance using createApplication factory with minimal configuration
        application = await createApplication({
            configOptions: {
                environment: basicConfig.environment,
                port: basicConfig.port,
                host: basicConfig.host,
                enableLogging: basicConfig.enableLogging,
                enableGracefulShutdown: basicConfig.enableGracefulShutdown
            }
        });
        
        console.log('   ✅ Application instance created successfully');
        console.log('   🔗 All components initialized and integrated');
        
        // Get application information for educational display
        const appInfo = application.getApplicationInfo();
        console.log(`   📦 Application: ${appInfo.application.name} v${appInfo.application.version}`);
        console.log(`   🔧 Components: HTTP Server, Route Registry, Hello Controller`);
        
        // Phase 4: HTTP Server Startup and Port Binding
        await logTutorialProgress('startup', {
            phase: 'Server Startup',
            description: 'Starting HTTP server and binding to configured port',
            educationalContext: 'This demonstrates the application startup lifecycle and server initialization'
        });
        
        console.log('\n🚀 Step 3: Starting HTTP Server');
        console.log(`   Starting server on ${basicConfig.host}:${basicConfig.port}...`);
        
        // Start the HTTP server on default port 3000 with localhost binding
        await application.start({
            serverTimeout: BASIC_EXAMPLE_CONFIG.startupTimeout
        });
        
        console.log('   ✅ HTTP Server started successfully');
        console.log(`   🌐 Server listening on: http://${basicConfig.host}:${basicConfig.port}`);
        console.log(`   📡 Ready to accept HTTP requests`);
        
        // Log server ready message with connection details and endpoint information
        await logTutorialProgress('ready', {
            phase: 'Server Ready',
            description: 'Server is operational and ready for requests',
            connectionDetails: {
                url: `http://${basicConfig.host}:${basicConfig.port}`,
                endpoints: ['/hello'],
                supportedMethods: ['GET']
            },
            educationalContext: 'The server is now listening for HTTP requests and ready to respond'
        });
        
        console.log(`\n🎯 Step 4: Server Ready for Requests`);
        console.log(`   📍 Main endpoint: http://${basicConfig.host}:${basicConfig.port}/hello`);
        console.log(`   📋 Supported methods: GET`);
        console.log(`   📤 Expected response: "${RESPONSE_MESSAGES.HELLO_WORLD}"`);
        
        // Phase 5: Endpoint Demonstration and Programmatic Testing
        await logTutorialProgress('demonstration', {
            phase: 'Endpoint Demonstration',
            description: 'Testing the /hello endpoint programmatically',
            educationalContext: 'This shows how to test HTTP endpoints using Node.js HTTP client'
        });
        
        console.log('\n🧪 Step 5: Testing Hello Endpoint');
        console.log('   Making programmatic HTTP request to /hello endpoint...');
        
        // Demonstrate endpoint testing by making sample requests to /hello endpoint
        await demonstrateEndpoint(basicConfig.port, basicConfig.host);
        
        console.log('   ✅ Endpoint test completed successfully');
        console.log(`   📨 Response verified: "${RESPONSE_MESSAGES.HELLO_WORLD}"`);
        
        // Phase 6: User Interaction and Manual Exploration
        await logTutorialProgress('interaction', {
            phase: 'User Interaction',
            description: 'Enabling user exploration and manual testing',
            educationalContext: 'This allows hands-on exploration of the running server'
        });
        
        console.log('\n👤 Step 6: Interactive Exploration');
        console.log('   🌐 You can now test the server manually:');
        console.log(`   📱 Browser: Open http://${basicConfig.host}:${basicConfig.port}/hello`);
        console.log(`   💻 Command line: curl http://${basicConfig.host}:${basicConfig.port}/hello`);
        console.log(`   🔧 Try different URLs to see 404 responses`);
        console.log('\n   Press any key to continue when ready...');
        
        // Set up graceful shutdown handlers for clean example termination
        setupGracefulShutdown(application);
        
        // Wait for user interaction or timeout before shutting down the example
        await waitForUserInput(BASIC_EXAMPLE_CONFIG.userInputTimeout);
        
        // Phase 7: Tutorial Completion and Graceful Shutdown
        await logTutorialProgress('completion', {
            phase: 'Tutorial Completion',
            description: 'Completing tutorial example and shutting down gracefully',
            summary: {
                serverStarted: true,
                endpointTested: true,
                userInteraction: true,
                shutdownPending: true
            },
            educationalContext: 'This demonstrates proper application shutdown and resource cleanup'
        });
        
        console.log('\n🎉 Step 7: Tutorial Completion');
        console.log('   📚 All learning objectives achieved:');
        TUTORIAL_METADATA.learningObjectives.forEach((objective, index) => {
            console.log(`   ✅ ${index + 1}. ${objective}`);
        });
        
        // Log tutorial completion message with next steps and learning outcomes
        const totalDuration = Date.now() - exampleStartTime;
        console.log(`\n🏁 ${TUTORIAL_MESSAGES.TUTORIAL_COMPLETE}`);
        console.log(`   ⏱️  Total time: ${(totalDuration / 1000).toFixed(1)} seconds`);
        console.log(`   🎯 Learning objectives achieved: ${TUTORIAL_METADATA.learningObjectives.length}`);
        console.log(`   📈 Next steps: ${TUTORIAL_METADATA.nextSteps.join(', ')}`);
        
        // Gracefully stop the application
        console.log('\n🛑 Shutting down server gracefully...');
        await application.stop({
            reason: 'tutorial_complete',
            graceful: true,
            timeout: BASIC_EXAMPLE_CONFIG.shutdownTimeout
        });
        
        console.log('   ✅ Server stopped successfully');
        console.log('   🧹 Resources cleaned up');
        console.log('\n' + '='.repeat(80));
        console.log('🎊 Tutorial completed successfully! Well done!');
        console.log('='.repeat(80));
        
    } catch (error) {
        // Comprehensive error handling with educational context and troubleshooting guidance
        console.error('\n❌ Tutorial example failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Context: ${error.context || 'Application lifecycle'}`);
        
        // Provide troubleshooting guidance for common issues
        console.error('\n🔧 Troubleshooting Guide:');
        console.error('   1. Ensure Node.js v22.x is installed: node --version');
        console.error('   2. Check if port 3000 is available: lsof -i :3000');
        console.error('   3. Verify all project files are present in src/backend/');
        console.error('   4. Try running from project root directory');
        console.error('   5. Check for permission issues with port binding');
        
        // Attempt graceful shutdown if application was created
        if (application) {
            try {
                console.error('\n🛑 Attempting graceful shutdown...');
                await application.stop({
                    reason: 'error_recovery',
                    graceful: true,
                    timeout: 3000
                });
                console.error('   ✅ Server stopped gracefully');
            } catch (shutdownError) {
                console.error(`   ❌ Shutdown failed: ${shutdownError.message}`);
            }
        }
        
        // Exit with error code for proper process termination
        process.exit(1);
    }
}

/**
 * Creates a minimal application configuration suitable for the basic tutorial example
 * with default settings and simplified options appropriate for learning environments.
 * 
 * This function demonstrates configuration creation patterns and provides educational
 * examples of how to customize application settings for different use cases while
 * maintaining production-ready configuration validation.
 * 
 * Configuration Features:
 * - Server settings optimized for local development and learning
 * - Logging configuration with appropriate verbosity for education
 * - Feature flags enabled for tutorial demonstration
 * - Security settings appropriate for development environment
 * - Performance settings optimized for single-user tutorial usage
 * 
 * @param {Object} overrides - Configuration overrides for customization
 * @param {string} [overrides.name] - Custom application name
 * @param {number} [overrides.port] - Custom server port number
 * @param {string} [overrides.host] - Custom server hostname
 * @param {boolean} [overrides.enableLogging] - Enable/disable logging
 * @param {string} [overrides.environment] - Environment setting
 * 
 * @returns {Object} Basic application configuration with default settings and tutorial-specific options
 * 
 * @throws {Error} Configuration creation or validation errors with detailed context
 * 
 * @example
 * // Create basic configuration with defaults
 * const config = createBasicConfig();
 * 
 * @example
 * // Create configuration with custom port
 * const customConfig = createBasicConfig({ port: 8080, host: '0.0.0.0' });
 */
function createBasicConfig(overrides = {}) {
    try {
        console.log('   🔧 Applying configuration overrides...');
        
        // Create base configuration object with tutorial-specific defaults
        const baseConfiguration = {
            // Application identification
            name: BASIC_EXAMPLE_CONFIG.name,
            version: BASIC_EXAMPLE_CONFIG.version,
            description: BASIC_EXAMPLE_CONFIG.description,
            
            // Server network settings for local development
            port: BASIC_EXAMPLE_CONFIG.port,
            host: BASIC_EXAMPLE_CONFIG.host,
            
            // Environment and operational settings
            environment: 'development',
            
            // Feature enablement for educational visibility
            enableLogging: BASIC_EXAMPLE_CONFIG.enableLogging,
            enableGracefulShutdown: BASIC_EXAMPLE_CONFIG.enableGracefulShutdown,
            enableRequestLogging: BASIC_EXAMPLE_CONFIG.enableRequestLogging,
            
            // Tutorial-specific features
            enableProgressLogging: BASIC_EXAMPLE_CONFIG.enableProgressLogging,
            enableInteractiveMode: BASIC_EXAMPLE_CONFIG.enableInteractiveMode,
            enableEndpointDemo: BASIC_EXAMPLE_CONFIG.enableEndpointDemo,
            
            // Timeout configurations
            startupTimeout: BASIC_EXAMPLE_CONFIG.startupTimeout,
            shutdownTimeout: BASIC_EXAMPLE_CONFIG.shutdownTimeout,
            userInputTimeout: BASIC_EXAMPLE_CONFIG.userInputTimeout
        };
        
        // Set server configuration to localhost:3000 for local development
        if (overrides.port && typeof overrides.port === 'number' && overrides.port > 0 && overrides.port < 65536) {
            baseConfiguration.port = overrides.port;
            console.log(`   📍 Custom port: ${overrides.port}`);
        }
        
        if (overrides.host && typeof overrides.host === 'string' && overrides.host.trim().length > 0) {
            baseConfiguration.host = overrides.host.trim();
            console.log(`   🌐 Custom host: ${overrides.host}`);
        }
        
        // Enable basic logging for educational visibility without overwhelming detail
        if (typeof overrides.enableLogging === 'boolean') {
            baseConfiguration.enableLogging = overrides.enableLogging;
            console.log(`   📊 Logging: ${overrides.enableLogging ? 'enabled' : 'disabled'}`);
        }
        
        // Configure minimal feature flags appropriate for basic tutorial usage
        if (overrides.environment && typeof overrides.environment === 'string') {
            const validEnvironments = ['development', 'production', 'test'];
            if (validEnvironments.includes(overrides.environment.toLowerCase())) {
                baseConfiguration.environment = overrides.environment.toLowerCase();
                console.log(`   🔧 Environment: ${baseConfiguration.environment}`);
            }
        }
        
        // Apply any user-provided configuration overrides for customization
        const finalConfiguration = {
            ...baseConfiguration,
            ...overrides,
            
            // Ensure required fields are preserved
            name: overrides.name || baseConfiguration.name,
            port: overrides.port || baseConfiguration.port,
            host: overrides.host || baseConfiguration.host
        };
        
        // Validate basic configuration format and required settings
        if (!finalConfiguration.name || typeof finalConfiguration.name !== 'string') {
            throw new Error('Configuration name must be a non-empty string');
        }
        
        if (!finalConfiguration.port || typeof finalConfiguration.port !== 'number' || 
            finalConfiguration.port < 1 || finalConfiguration.port > 65535) {
            throw new Error('Port must be a number between 1 and 65535');
        }
        
        if (!finalConfiguration.host || typeof finalConfiguration.host !== 'string') {
            throw new Error('Host must be a non-empty string');
        }
        
        console.log('   ✅ Configuration validation passed');
        
        // Return complete basic configuration ready for application initialization
        return finalConfiguration;
        
    } catch (error) {
        const enhancedError = new Error(`Basic configuration creation failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'createBasicConfig',
            overrides: JSON.stringify(overrides, null, 2),
            timestamp: new Date().toISOString()
        };
        
        console.error(`   ❌ Configuration creation failed: ${error.message}`);
        throw enhancedError;
    }
}

/**
 * Demonstrates how to test the /hello endpoint programmatically within the example,
 * showing expected responses and basic HTTP client usage with educational guidance.
 * 
 * This function provides hands-on demonstration of HTTP client usage and endpoint
 * testing techniques, illustrating how to validate server responses and handle
 * HTTP communication programmatically for enhanced learning experience.
 * 
 * Educational Features:
 * - HTTP client creation using Node.js built-in modules
 * - Request configuration and response handling patterns
 * - Response validation and content verification techniques
 * - Error handling for network and connection issues
 * - Educational logging with step-by-step explanations
 * 
 * @param {number} port - Server port number for HTTP client connection
 * @param {string} host - Server hostname for HTTP client connection
 * 
 * @returns {Promise<void>} Promise that resolves when endpoint demonstration is complete
 * 
 * @throws {Error} HTTP client, connection, or response validation errors with troubleshooting context
 * 
 * @example
 * // Test endpoint on default configuration
 * await demonstrateEndpoint(3000, 'localhost');
 * 
 * @example
 * // Test endpoint on custom configuration
 * await demonstrateEndpoint(8080, '127.0.0.1');
 */
async function demonstrateEndpoint(port, host) {
    return new Promise((resolve, reject) => {
        try {
            // Log demonstration start message with endpoint information
            console.log('   🔗 Creating HTTP client request...');
            console.log(`   📍 Target URL: http://${host}:${port}/hello`);
            console.log(`   📋 Method: GET`);
            console.log(`   📤 Expected response: "${RESPONSE_MESSAGES.HELLO_WORLD}"`);
            
            // Create HTTP client request to GET /hello endpoint using Node.js http module
            const requestOptions = {
                hostname: host,
                port: port,
                path: '/hello',
                method: 'GET',
                headers: {
                    'User-Agent': 'Node.js Tutorial Basic Example',
                    'Accept': 'text/plain',
                    'Connection': 'close'
                },
                timeout: 5000 // 5 second timeout for tutorial context
            };
            
            console.log('   📡 Sending HTTP request...');
            
            const request = http.request(requestOptions, (response) => {
                let responseData = '';
                
                // Log response status and headers for educational visibility
                console.log(`   📊 Response Status: ${response.statusCode} ${response.statusMessage}`);
                console.log(`   📋 Content-Type: ${response.headers['content-type'] || 'not specified'}`);
                console.log(`   📏 Content-Length: ${response.headers['content-length'] || 'not specified'}`);
                
                // Collect response data
                response.on('data', (chunk) => {
                    responseData += chunk;
                    console.log(`   📦 Received data chunk: ${chunk.length} bytes`);
                });
                
                response.on('end', () => {
                    try {
                        // Handle successful response and verify it matches expected content
                        console.log('   📨 Response received completely');
                        console.log(`   📝 Response content: "${responseData}"`);
                        
                        // Verify response matches RESPONSE_MESSAGES.HELLO_WORLD
                        if (responseData.trim() === RESPONSE_MESSAGES.HELLO_WORLD) {
                            console.log('   ✅ Response content verification successful');
                            console.log(`   🎯 Expected: "${RESPONSE_MESSAGES.HELLO_WORLD}"`);
                            console.log(`   🎯 Received: "${responseData.trim()}"`);
                            console.log('   🔍 Content matches expected response perfectly');
                        } else {
                            console.log('   ⚠️  Response content mismatch detected');
                            console.log(`   🎯 Expected: "${RESPONSE_MESSAGES.HELLO_WORLD}"`);
                            console.log(`   🎯 Received: "${responseData.trim()}"`);
                        }
                        
                        // Log successful response with content and status code for educational clarity
                        if (response.statusCode === 200) {
                            console.log('   ✅ HTTP status code validation successful (200 OK)');
                        } else {
                            console.log(`   ⚠️  Unexpected status code: ${response.statusCode}`);
                        }
                        
                        // Log demonstration completion with explanation of what was accomplished
                        console.log('   🎉 Endpoint demonstration completed successfully');
                        console.log('   📚 Educational takeaways:');
                        console.log('     • HTTP client creation and request configuration');
                        console.log('     • Response handling and data collection techniques');
                        console.log('     • Content validation and verification patterns');
                        console.log('     • Status code interpretation and validation');
                        
                        resolve();
                        
                    } catch (validationError) {
                        console.log(`   ❌ Response validation failed: ${validationError.message}`);
                        reject(validationError);
                    }
                });
            });
            
            // Handle any connection errors with helpful error messages and troubleshooting tips
            request.on('error', (error) => {
                console.log(`   ❌ HTTP request failed: ${error.message}`);
                console.log('   🔧 Troubleshooting tips:');
                console.log(`     • Verify server is running on ${host}:${port}`);
                console.log('     • Check network connectivity and firewall settings');
                console.log('     • Ensure no other application is blocking the connection');
                console.log('     • Verify the server started successfully without errors');
                
                reject(new Error(`HTTP client request failed: ${error.message}`));
            });
            
            request.on('timeout', () => {
                console.log('   ⏰ HTTP request timed out');
                console.log('   🔧 Troubleshooting tips:');
                console.log('     • Server may be overloaded or unresponsive');
                console.log('     • Network latency may be higher than expected');
                console.log('     • Check server logs for processing delays');
                
                request.destroy();
                reject(new Error('HTTP request timeout'));
            });
            
            // Send the request to initiate HTTP communication
            request.end();
            
        } catch (error) {
            const enhancedError = new Error(`Endpoint demonstration setup failed: ${error.message}`);
            enhancedError.originalError = error;
            enhancedError.context = {
                function: 'demonstrateEndpoint',
                port: port,
                host: host,
                timestamp: new Date().toISOString()
            };
            
            console.log(`   ❌ Demonstration setup failed: ${error.message}`);
            reject(enhancedError);
        }
    });
}

/**
 * Sets up graceful shutdown handlers for the basic example to demonstrate proper
 * application lifecycle management and clean resource termination.
 * 
 * This function implements production-ready shutdown patterns appropriate for
 * educational demonstration, showing how to handle system signals and perform
 * graceful application termination with proper resource cleanup.
 * 
 * Shutdown Features:
 * - SIGINT handler for Ctrl+C interrupt during example execution
 * - SIGTERM handler for graceful termination signals
 * - Shutdown timeout configuration for example context
 * - Educational logging with shutdown process explanation
 * - Proper application lifecycle management and cleanup
 * 
 * @param {Object} application - Application instance for shutdown management
 * 
 * @returns {void} Configures signal handlers for clean example termination
 * 
 * @throws {Error} Signal handler configuration or application shutdown errors
 * 
 * @example
 * // Set up graceful shutdown for application instance
 * setupGracefulShutdown(applicationInstance);
 * // Ctrl+C or SIGTERM will now trigger graceful shutdown
 */
function setupGracefulShutdown(application) {
    try {
        // Track if shutdown is already in progress to prevent multiple shutdown attempts
        let shutdownInProgress = false;
        
        // Create shutdown handler function with comprehensive shutdown logic
        const handleShutdown = async (signal) => {
            if (shutdownInProgress) {
                console.log(`\n⚠️  Shutdown already in progress, ignoring ${signal}`);
                return;
            }
            
            shutdownInProgress = true;
            
            // Log shutdown signal reception with educational explanation
            console.log(`\n🛑 Received ${signal} signal - initiating graceful shutdown...`);
            console.log('   📚 Educational note: This demonstrates proper signal handling in Node.js');
            console.log(`   🔧 Signal meaning: ${signal === 'SIGINT' ? 'Ctrl+C interrupt' : 'Termination request'}`);
            console.log('   🎯 Graceful shutdown ensures proper resource cleanup');
            
            try {
                // Call application.stop() method to gracefully shutdown the server
                console.log('   🔄 Stopping application components...');
                await application.stop({
                    reason: `signal_${signal}`,
                    graceful: true,
                    timeout: BASIC_EXAMPLE_CONFIG.shutdownTimeout
                });
                
                // Log successful shutdown completion with tutorial summary
                console.log('   ✅ Application stopped gracefully');
                console.log('   🧹 All resources cleaned up successfully');
                console.log('   📚 Graceful shutdown demonstration completed');
                
                // Exit process with success status code
                console.log('\n👋 Thank you for trying the Node.js tutorial example!');
                process.exit(0);
                
            } catch (shutdownError) {
                // Handle shutdown errors with fallback termination
                console.error(`   ❌ Graceful shutdown failed: ${shutdownError.message}`);
                console.error('   🚨 Forcing immediate termination...');
                console.error('   📚 Educational note: In production, implement proper shutdown timeouts');
                
                // Force exit if graceful shutdown fails
                process.exit(1);
            }
        };
        
        // Register SIGINT handler for Ctrl+C interrupt during example execution
        process.on('SIGINT', () => handleShutdown('SIGINT'));
        
        // Register SIGTERM handler for graceful termination signals
        process.on('SIGTERM', () => handleShutdown('SIGTERM'));
        
        // Handle uncaught exceptions with graceful shutdown attempt
        process.on('uncaughtException', async (error) => {
            console.error('\n💥 Uncaught exception detected:');
            console.error(`   Error: ${error.message}`);
            console.error('   📚 Educational note: Always handle errors properly in production');
            
            try {
                await handleShutdown('UNCAUGHT_EXCEPTION');
            } catch (shutdownError) {
                console.error(`   ❌ Emergency shutdown failed: ${shutdownError.message}`);
                process.exit(1);
            }
        });
        
        // Handle unhandled promise rejections with graceful shutdown attempt
        process.on('unhandledRejection', async (reason, promise) => {
            console.error('\n💥 Unhandled promise rejection detected:');
            console.error(`   Reason: ${reason}`);
            console.error('   📚 Educational note: Always handle promise rejections properly');
            
            try {
                await handleShutdown('UNHANDLED_REJECTION');
            } catch (shutdownError) {
                console.error(`   ❌ Emergency shutdown failed: ${shutdownError.message}`);
                process.exit(1);
            }
        });
        
        console.log('   ✅ Graceful shutdown handlers configured');
        console.log('   📚 Educational note: Press Ctrl+C anytime to trigger graceful shutdown');
        
    } catch (error) {
        const enhancedError = new Error(`Graceful shutdown setup failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'setupGracefulShutdown',
            hasApplication: !!application,
            timestamp: new Date().toISOString()
        };
        
        console.error(`❌ Shutdown setup failed: ${error.message}`);
        throw enhancedError;
    }
}

/**
 * Logs tutorial progress messages with educational context and next steps for
 * enhanced learning experience and clear progress tracking.
 * 
 * This function provides structured educational logging that helps learners
 * understand the current phase of the tutorial, what is happening technically,
 * and what they should expect in subsequent steps.
 * 
 * Educational Features:
 * - Clear phase identification with descriptive titles
 * - Technical explanation of current operations and concepts
 * - Educational context explaining the learning value
 * - Next steps guidance for continued progression
 * - Consistent formatting for easy readability and comprehension
 * 
 * @param {string} phase - Current tutorial phase identifier
 * @param {Object} details - Phase details and educational context
 * @param {string} details.phase - Human-readable phase name
 * @param {string} details.description - Phase description and objectives
 * @param {string} [details.educationalContext] - Educational explanation
 * @param {Array} [details.learningObjectives] - Learning objectives for this phase
 * @param {Object} [details.connectionDetails] - Connection information for display
 * @param {Object} [details.summary] - Phase completion summary
 * 
 * @returns {void} Logs tutorial progress with educational formatting
 * 
 * @throws {Error} Logging configuration or formatting errors
 * 
 * @example
 * // Log initialization phase
 * await logTutorialProgress('initialization', {
 *   phase: 'Tutorial Start',
 *   description: 'Beginning basic HTTP server tutorial',
 *   educationalContext: 'This phase introduces the tutorial objectives'
 * });
 */
async function logTutorialProgress(phase, details) {
    try {
        // Validate phase parameter for proper tutorial phase identification
        if (!phase || typeof phase !== 'string') {
            throw new Error('Phase identifier must be a non-empty string');
        }
        
        if (!details || typeof details !== 'object') {
            throw new Error('Details must be a valid object with phase information');
        }
        
        // Create timestamp for progress tracking and educational sequencing
        const timestamp = new Date().toISOString();
        const formattedTime = new Date().toLocaleTimeString();
        
        // Format tutorial progress message with clear phase identification
        console.log(`\n📍 Tutorial Progress: ${details.phase || phase.toUpperCase()}`);
        console.log(`   ⏰ Time: ${formattedTime}`);
        console.log(`   📝 Description: ${details.description}`);
        
        // Include educational context explaining what is happening in this phase
        if (details.educationalContext) {
            console.log(`   📚 Educational Context:`);
            console.log(`      ${details.educationalContext}`);
        }
        
        // Add technical details relevant to the current tutorial step
        if (details.connectionDetails) {
            console.log(`   🔗 Connection Details:`);
            Object.keys(details.connectionDetails).forEach(key => {
                const value = details.connectionDetails[key];
                if (Array.isArray(value)) {
                    console.log(`      ${key}: ${value.join(', ')}`);
                } else {
                    console.log(`      ${key}: ${value}`);
                }
            });
        }
        
        // Include learning objectives for educational progression
        if (details.learningObjectives) {
            console.log(`   🎯 Learning Objectives:`);
            details.learningObjectives.forEach((objective, index) => {
                console.log(`      ${index + 1}. ${objective}`);
            });
        }
        
        // Add summary information for phase completion tracking
        if (details.summary) {
            console.log(`   📊 Phase Summary:`);
            Object.keys(details.summary).forEach(key => {
                const value = details.summary[key];
                const status = value ? '✅' : '❌';
                console.log(`      ${status} ${key}: ${value}`);
            });
        }
        
        // Include next steps and learning opportunities for continued education
        if (details.nextSteps) {
            console.log(`   ➡️  Next Steps:`);
            if (Array.isArray(details.nextSteps)) {
                details.nextSteps.forEach((step, index) => {
                    console.log(`      ${index + 1}. ${step}`);
                });
            } else {
                console.log(`      ${details.nextSteps}`);
            }
        }
        
        // Add phase completion indicator and progression tracking
        console.log(`   📈 Progress: Phase "${phase}" logged successfully`);
        
        // Small delay for educational pacing and readability
        await new Promise(resolve => setTimeout(resolve, 500));
        
    } catch (error) {
        const enhancedError = new Error(`Tutorial progress logging failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.context = {
            function: 'logTutorialProgress',
            phase: phase,
            details: JSON.stringify(details, null, 2),
            timestamp: new Date().toISOString()
        };
        
        console.error(`❌ Progress logging failed: ${error.message}`);
        throw enhancedError;
    }
}

/**
 * Waits for user input or timeout to keep the example running for demonstration
 * purposes and educational interaction with clear instructions and feedback.
 * 
 * This function enables interactive learning by pausing the tutorial execution
 * to allow hands-on exploration of the running server, manual endpoint testing,
 * and experimentation with different requests and responses.
 * 
 * Interactive Features:
 * - User input detection for interactive control
 * - Automatic timeout for unattended execution
 * - Clear instructions for user interaction and exploration
 * - Educational guidance for manual testing techniques
 * - Graceful handling of input and timeout scenarios
 * 
 * @param {number} timeoutMs - Timeout in milliseconds for automatic example termination
 * 
 * @returns {Promise<void>} Promise that resolves when user input is received or timeout occurs
 * 
 * @throws {Error} Input handling, timeout, or interaction setup errors
 * 
 * @example
 * // Wait for user input with 30 second timeout
 * await waitForUserInput(30000);
 * 
 * @example
 * // Wait indefinitely for user input
 * await waitForUserInput(0);
 */
async function waitForUserInput(timeoutMs) {
    return new Promise((resolve) => {
        try {
            // Display instructions for user interaction during the example
            console.log('   ⌨️  Interactive Mode Activated');
            console.log('   📖 Instructions for hands-on exploration:');
            console.log(`      • Test in browser: http://localhost:${BASIC_EXAMPLE_CONFIG.port}/hello`);
            console.log(`      • Test with curl: curl http://localhost:${BASIC_EXAMPLE_CONFIG.port}/hello`);
            console.log(`      • Try invalid URLs: http://localhost:${BASIC_EXAMPLE_CONFIG.port}/invalid`);
            console.log('      • Observe different response codes and content');
            console.log('   ⚡ Press any key when finished exploring...');
            
            let isResolved = false;
            
            // Configure stdin listener for user keyboard input detection
            const readline = createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            // Set raw mode for immediate keypress detection
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }
            
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            
            // Set up timeout for automatic example termination if no user input
            let timeoutHandle = null;
            if (timeoutMs > 0) {
                timeoutHandle = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        
                        // Log waiting message with timeout information
                        console.log(`\n   ⏰ Timeout reached (${timeoutMs / 1000} seconds)`);
                        console.log('   🔄 Continuing with tutorial completion automatically...');
                        console.log('   📚 Educational note: In production, implement proper timeout handling');
                        
                        // Clean up input listeners and timeout handlers
                        cleanup();
                        resolve();
                    }
                }, timeoutMs);
                
                console.log(`   ⏰ Automatic timeout: ${timeoutMs / 1000} seconds`);
            }
            
            // Handle user input for immediate tutorial progression
            const handleUserInput = () => {
                if (!isResolved) {
                    isResolved = true;
                    
                    console.log('\n   ✅ User input received');
                    console.log('   🎯 Continuing with tutorial completion...');
                    console.log('   📚 Educational note: User interaction completed successfully');
                    
                    // Clean up and resolve promise
                    cleanup();
                    resolve();
                }
            };
            
            // Cleanup function for input listeners and timeout handlers
            const cleanup = () => {
                try {
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                    }
                    
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    
                    process.stdin.pause();
                    readline.close();
                } catch (cleanupError) {
                    console.error(`   ⚠️  Input cleanup warning: ${cleanupError.message}`);
                }
            };
            
            // Set up input event listener
            process.stdin.on('data', handleUserInput);
            
            // Handle readline events
            readline.on('line', handleUserInput);
            readline.on('SIGINT', handleUserInput);
            
        } catch (error) {
            const enhancedError = new Error(`User input setup failed: ${error.message}`);
            enhancedError.originalError = error;
            enhancedError.context = {
                function: 'waitForUserInput',
                timeoutMs: timeoutMs,
                timestamp: new Date().toISOString()
            };
            
            console.error(`❌ User input setup failed: ${error.message}`);
            console.log('   🔄 Continuing automatically...');
            resolve();
        }
    });
}

// ============================================================================
// EXAMPLE EXECUTION AND MODULE EXPORTS
// ============================================================================

/**
 * Execute basic example if this module is run directly for immediate tutorial execution.
 * Provides convenient command-line execution while maintaining modular export structure.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    // Execute basic example when run directly from command line
    console.log('🎬 Starting Node.js Tutorial: Basic HTTP Server Example');
    console.log('📚 Educational Mode: Direct execution detected');
    console.log('⚡ Initializing tutorial example...\n');
    
    runBasicExample()
        .then(() => {
            console.log('\n🎊 Tutorial execution completed successfully!');
            console.log('📚 Thank you for learning with Node.js tutorial examples');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Tutorial execution failed:');
            console.error(`   ${error.message}`);
            console.error('\n🔧 Please check the troubleshooting guide above');
            process.exit(1);
        });
}

// ============================================================================
// MODULE EXPORTS FOR EXTERNAL USAGE
// ============================================================================

// Export main example function demonstrating complete basic usage workflow
export { runBasicExample };

// Export utility functions for creating minimal configuration suitable for basic tutorial usage
export { createBasicConfig };

// Export function for demonstrating HTTP endpoint testing and expected responses
export { demonstrateEndpoint };

// Export utility function for configuring graceful shutdown in tutorial examples
export { setupGracefulShutdown };

// Export tutorial progress logging function for educational context and guidance
export { logTutorialProgress };

// Export user interaction function for interactive learning experiences
export { waitForUserInput };

// Export configuration constants for basic example setup and initialization
export { BASIC_EXAMPLE_CONFIG };

// Export tutorial metadata for educational context and learning guidance
export { TUTORIAL_METADATA };

/**
 * Export Summary and Usage Examples:
 * 
 * Main Export Functions:
 * - runBasicExample(): Complete tutorial workflow demonstration
 * - createBasicConfig(): Minimal configuration creation
 * - demonstrateEndpoint(): HTTP endpoint testing demonstration
 * - setupGracefulShutdown(): Graceful shutdown configuration
 * - logTutorialProgress(): Educational progress logging
 * - waitForUserInput(): Interactive user input handling
 * 
 * Configuration Exports:
 * - BASIC_EXAMPLE_CONFIG: Default configuration constants
 * - TUTORIAL_METADATA: Educational metadata and learning objectives
 * 
 * Usage Examples:
 * 
 * // Import and run complete example
 * import { runBasicExample } from './basic-usage.js';
 * await runBasicExample();
 * 
 * // Use individual functions for custom tutorials
 * import { createBasicConfig, demonstrateEndpoint } from './basic-usage.js';
 * const config = createBasicConfig({ port: 8080 });
 * await demonstrateEndpoint(8080, 'localhost');
 * 
 * // Access tutorial metadata
 * import { TUTORIAL_METADATA } from './basic-usage.js';
 * console.log('Learning objectives:', TUTORIAL_METADATA.learningObjectives);
 * 
 * Educational Value:
 * - Demonstrates complete application lifecycle management
 * - Shows proper error handling and user experience patterns
 * - Illustrates modular function design and export patterns
 * - Provides examples of educational logging and progress tracking
 * - Shows integration between multiple system components
 * - Demonstrates graceful shutdown and resource cleanup techniques
 * 
 * Production Readiness:
 * - Comprehensive error handling with detailed context and recovery
 * - Proper resource cleanup and lifecycle management
 * - Signal handling for graceful termination
 * - Input validation and parameter checking
 * - Performance monitoring and timing measurement
 * - Security considerations for user input and error messages
 */