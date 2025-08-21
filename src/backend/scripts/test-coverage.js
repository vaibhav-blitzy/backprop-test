/**
 * Test Coverage Analysis Script for Node.js Tutorial HTTP Server Application
 * 
 * Executes comprehensive test suites with coverage reporting using Node.js built-in coverage
 * capabilities. Implements educational-focused coverage analysis while maintaining
 * production-ready coverage standards and reporting formats for code quality assessment
 * and educational feedback.
 * 
 * This script serves as the central coverage analysis authority for the Node.js tutorial
 * application, providing:
 * - Comprehensive test execution with Node.js built-in coverage collection
 * - Quality gate enforcement with configurable coverage thresholds
 * - Multi-format coverage reporting (console, JSON, LCOV, HTML)
 * - Educational insights and coverage improvement recommendations
 * - CI/CD integration with proper exit codes and artifact generation
 * - Performance monitoring and test execution analytics
 * - Zero external dependencies following tutorial philosophy
 * 
 * Educational Objectives:
 * - Demonstrates Node.js built-in test coverage capabilities without external dependencies
 * - Shows quality gate implementation for automated quality assurance
 * - Illustrates comprehensive coverage reporting and analysis techniques
 * - Provides examples of CI/CD integration patterns for coverage enforcement
 * - Shows educational feedback generation for coverage improvement guidance
 * - Demonstrates production-ready coverage analysis patterns and error handling
 * 
 * @fileoverview Test coverage analysis script with Node.js built-in coverage capabilities
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================

// Import internal test infrastructure and utilities
import { TestRunner } from './test.js'; // Test execution engine with Node.js built-in test runner support
import { AppConfig } from '../config/app.config.js'; // Application configuration with test and coverage settings
import { Logger } from '../utils/logger.js'; // Centralized logging utility with structured console-based logging
import { formatCoverage } from '../test/helpers/test-utils.js'; // Test utility functions for coverage data formatting (will be created)

// Import Node.js built-in modules for coverage collection and analysis
import { spawn } from 'node:child_process'; // Node.js v22.x LTS - Execute test runner with coverage flags
import { readFile, writeFile } from 'node:fs/promises'; // Node.js v22.x LTS - Read and write coverage reports
import { join } from 'node:path'; // Node.js v22.x LTS - Construct file paths for coverage reports
import process from 'node:process'; // Node.js v22.x LTS - Access command line arguments and exit codes

// ============================================================================
// GLOBAL COVERAGE CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Default coverage thresholds for quality gate enforcement.
 * These thresholds align with industry best practices and educational objectives.
 */
const COVERAGE_THRESHOLDS = {
    lineCoverage: 90,      // 90%+ line coverage requirement
    functionCoverage: 100,  // 100% function coverage requirement  
    branchCoverage: 80,    // 80%+ branch coverage requirement
    uncoveredLinesMax: 10  // Maximum allowed uncovered lines
};

/**
 * Coverage output directory and file paths for report generation.
 */
const COVERAGE_OUTPUT_DIR = 'coverage';
const LCOV_FILE_PATH = 'coverage/lcov.info';
const COVERAGE_REPORT_FILE = 'coverage/coverage-summary.json';

/**
 * Test execution timeout in milliseconds for coverage analysis.
 */
const TEST_TIMEOUT = 30000; // 30 seconds

/**
 * Node.js coverage collection flags and options for built-in coverage capabilities.
 */
const COVERAGE_FLAGS = {
    experimental: '--experimental-test-coverage',
    reporter: '--test-reporter=tap',
    timeout: '--test-timeout=30000',
    concurrency: '--test-concurrency=1', // Serial execution for accurate coverage
    sourceMap: '--enable-source-maps'
};

/**
 * Source file patterns for coverage collection and analysis.
 */
const SOURCE_PATTERNS = [
    'src/backend/**/*.js'
];

/**
 * File patterns to exclude from coverage analysis.
 */
const EXCLUDE_PATTERNS = [
    'src/backend/test/**/*',
    'src/backend/node_modules/**/*', 
    'src/backend/coverage/**/*',
    'src/backend/scripts/test-coverage.js'
];

// ============================================================================
// MAIN ENTRY POINT FUNCTION
// ============================================================================

/**
 * Main entry point for test coverage analysis that orchestrates test execution with
 * coverage collection, analysis, and reporting for quality gate enforcement.
 * 
 * This function provides comprehensive coverage workflow including:
 * - Command line argument parsing and validation
 * - Test configuration initialization and validation
 * - Coverage-enabled test execution with Node.js built-in capabilities
 * - Coverage data collection and analysis
 * - Multi-format report generation and artifact creation
 * - Quality gate evaluation and CI/CD integration
 * 
 * @returns {Promise<void>} Promise that resolves with coverage results or rejects with failure
 */
async function main() {
    let logger;
    let appConfig;
    let coverageAnalyzer;
    
    try {
        // Parse command line arguments for coverage options
        const cliOptions = parseCommandLineArgs(process.argv);
        
        // Initialize application configuration and logging
        appConfig = new AppConfig();
        logger = new Logger({ appConfig });
        
        // Log coverage analysis initialization
        logger.info('Test Coverage Analysis Starting', {
            options: cliOptions,
            thresholds: COVERAGE_THRESHOLDS,
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        });
        
        // Load coverage configuration from application config
        const coverageConfig = appConfig.getCoverageConfig();
        const testConfig = appConfig.getTestConfig();
        
        // Merge configuration with command line options
        const finalConfig = {
            ...coverageConfig,
            ...testConfig,
            ...cliOptions,
            thresholds: { ...COVERAGE_THRESHOLDS, ...coverageConfig.thresholds }
        };
        
        // Validate coverage configuration
        validateCoverageConfiguration(finalConfig);
        
        // Create coverage analyzer instance
        coverageAnalyzer = new CoverageAnalyzer(finalConfig, logger);
        
        // Execute comprehensive coverage analysis
        const coverageResults = await coverageAnalyzer.runCoverageAnalysis({
            testTypes: cliOptions.testTypes || ['unit', 'integration'],
            outputFormats: cliOptions.outputFormats || ['console', 'json', 'lcov'],
            generateReports: true,
            enforceThresholds: true
        });
        
        // Generate coverage summary and educational insights
        const coverageSummary = generateCoverageSummary(coverageResults, testConfig);
        
        // Log coverage analysis completion
        logger.info('Test Coverage Analysis Completed', {
            results: coverageSummary,
            qualityGateStatus: coverageResults.qualityGate.passed ? 'PASSED' : 'FAILED',
            duration: coverageResults.executionTime,
            timestamp: new Date().toISOString()
        });
        
        // Handle coverage success or failure for CI/CD integration
        if (coverageResults.qualityGate.passed) {
            logger.info('Coverage Quality Gates Passed - All thresholds met', {
                coverageMetrics: coverageResults.metrics,
                recommendations: coverageResults.recommendations
            });
            process.exit(0); // Success exit code
        } else {
            await handleCoverageFailure(coverageResults, logger);
        }
        
    } catch (error) {
        // Enhanced error handling with comprehensive context
        const errorContext = {
            error: error.message,
            stack: error.stack,
            phase: 'main-execution',
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            processArgs: process.argv
        };
        
        if (logger) {
            logger.fatal('Test Coverage Analysis Failed', errorContext, error);
        } else {
            console.error('Fatal coverage analysis error:', error.message);
            console.error('Error context:', JSON.stringify(errorContext, null, 2));
        }
        
        // Exit with configuration error code
        process.exit(3);
    }
}

// ============================================================================
// COVERAGE EXECUTION AND DATA COLLECTION
// ============================================================================

/**
 * Executes test suite with Node.js built-in coverage collection using 
 * --experimental-test-coverage flag and captures detailed coverage data.
 * 
 * @param {Object} testOptions - Test execution options and configuration
 * @param {Object} logger - Logger instance for structured logging
 * @returns {Promise<Object>} Coverage execution results with test results and coverage data
 */
async function executeCoverageTests(testOptions, logger) {
    try {
        // Configure Node.js test runner with experimental coverage flags
        const nodeArgs = [
            COVERAGE_FLAGS.experimental,
            COVERAGE_FLAGS.reporter,
            COVERAGE_FLAGS.timeout,
            COVERAGE_FLAGS.concurrency,
            COVERAGE_FLAGS.sourceMap
        ];
        
        // Add test type filters if specified
        if (testOptions.testTypes && testOptions.testTypes.length > 0) {
            const testPattern = testOptions.testTypes.map(type => `**/*${type}*.test.js`).join('|');
            nodeArgs.push('--test-name-pattern', testPattern);
        }
        
        // Set up coverage collection for source files
        const coverageArgs = [
            '--experimental-test-coverage',
            `--test-coverage-include=${SOURCE_PATTERNS.join(',')}`,
            `--test-coverage-exclude=${EXCLUDE_PATTERNS.join(',')}`
        ];
        
        // Execute test runner with coverage monitoring
        const testExecution = await new Promise((resolve, reject) => {
            const testProcess = spawn('node', [...nodeArgs, ...coverageArgs, 'test'], {
                cwd: process.cwd(),
                stdio: ['inherit', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    NODE_ENV: 'test',
                    COVERAGE_ANALYSIS: 'true'
                }
            });
            
            let stdout = '';
            let stderr = '';
            let coverageData = '';
            
            // Capture test output and coverage data
            testProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                
                // Extract coverage data from output
                if (output.includes('coverage')) {
                    coverageData += output;
                }
            });
            
            testProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            // Handle test execution completion
            testProcess.on('close', (code) => {
                const executionResult = {
                    exitCode: code,
                    stdout: stdout,
                    stderr: stderr,
                    coverageData: coverageData,
                    success: code === 0,
                    executionTime: Date.now() - startTime
                };
                
                if (code === 0 || code === 1) { // 0 = success, 1 = test failures but coverage collected
                    resolve(executionResult);
                } else {
                    reject(new Error(`Test execution failed with code ${code}: ${stderr}`));
                }
            });
            
            testProcess.on('error', (error) => {
                reject(new Error(`Test process spawn error: ${error.message}`));
            });
            
            // Set execution timeout
            const timeout = setTimeout(() => {
                testProcess.kill('SIGTERM');
                reject(new Error(`Test execution timeout after ${TEST_TIMEOUT}ms`));
            }, TEST_TIMEOUT);
            
            testProcess.on('close', () => {
                clearTimeout(timeout);
            });
        });
        
        // Monitor test execution progress
        const startTime = Date.now();
        logger.info('Executing tests with coverage collection', {
            testTypes: testOptions.testTypes,
            nodeArgs: nodeArgs,
            coveragePatterns: SOURCE_PATTERNS
        });
        
        // Parse coverage output and extract metrics
        const coverageResults = await parseCoverageData(testExecution.coverageData, testOptions);
        
        // Return comprehensive coverage execution results
        return {
            testResults: {
                success: testExecution.success,
                exitCode: testExecution.exitCode,
                executionTime: testExecution.executionTime,
                output: testExecution.stdout,
                errors: testExecution.stderr
            },
            coverageData: coverageResults,
            rawOutput: testExecution
        };
        
    } catch (error) {
        logger.error('Coverage test execution failed', { 
            error: error.message,
            options: testOptions 
        }, error);
        
        throw new Error(`Coverage test execution failed: ${error.message}`);
    }
}

/**
 * Parses raw Node.js coverage output into structured coverage metrics including
 * line, function, and branch coverage percentages.
 * 
 * @param {string} rawCoverageOutput - Raw coverage output from Node.js test runner
 * @param {Object} config - Coverage parsing configuration
 * @returns {Promise<Object>} Structured coverage data with detailed metrics
 */
async function parseCoverageData(rawCoverageOutput, config) {
    try {
        // Initialize coverage metrics structure
        const coverageMetrics = {
            overall: {
                lines: { covered: 0, total: 0, percentage: 0 },
                functions: { covered: 0, total: 0, percentage: 0 },
                branches: { covered: 0, total: 0, percentage: 0 },
                statements: { covered: 0, total: 0, percentage: 0 }
            },
            files: {},
            uncoveredLines: [],
            summary: {
                fileCount: 0,
                totalLines: 0,
                coveredLines: 0,
                uncoveredCount: 0
            }
        };
        
        // Parse V8 coverage output from Node.js
        if (rawCoverageOutput && rawCoverageOutput.includes('coverage')) {
            const coverageLines = rawCoverageOutput.split('\n').filter(line => 
                line.includes('coverage') || line.includes('%') || line.includes('lines')
            );
            
            // Extract coverage metrics using regular expressions
            for (const line of coverageLines) {
                // Parse line coverage: "Lines: 85.5% (150/175)"
                const lineMatch = line.match(/Lines:\s*(\d+(?:\.\d+)?)%\s*\((\d+)\/(\d+)\)/);
                if (lineMatch) {
                    coverageMetrics.overall.lines = {
                        percentage: parseFloat(lineMatch[1]),
                        covered: parseInt(lineMatch[2]),
                        total: parseInt(lineMatch[3])
                    };
                }
                
                // Parse function coverage: "Functions: 100% (25/25)"
                const functionMatch = line.match(/Functions:\s*(\d+(?:\.\d+)?)%\s*\((\d+)\/(\d+)\)/);
                if (functionMatch) {
                    coverageMetrics.overall.functions = {
                        percentage: parseFloat(functionMatch[1]),
                        covered: parseInt(functionMatch[2]),
                        total: parseInt(functionMatch[3])
                    };
                }
                
                // Parse branch coverage: "Branches: 75.2% (80/106)"
                const branchMatch = line.match(/Branches:\s*(\d+(?:\.\d+)?)%\s*\((\d+)\/(\d+)\)/);
                if (branchMatch) {
                    coverageMetrics.overall.branches = {
                        percentage: parseFloat(branchMatch[1]),
                        covered: parseInt(branchMatch[2]),
                        total: parseInt(branchMatch[3])
                    };
                }
                
                // Parse file-specific coverage data
                const fileMatch = line.match(/^(.+\.js)\s+(\d+(?:\.\d+)?)%\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
                if (fileMatch) {
                    const [, filePath, percentage, statements, missing, excluded, branches] = fileMatch;
                    coverageMetrics.files[filePath] = {
                        percentage: parseFloat(percentage),
                        statements: { total: parseInt(statements), missing: parseInt(missing) },
                        branches: parseInt(branches),
                        excluded: parseInt(excluded)
                    };
                }
            }
        }
        
        // Try to read LCOV file for additional coverage data
        try {
            const lcovPath = join(process.cwd(), LCOV_FILE_PATH);
            const lcovData = await readFile(lcovPath, 'utf8');
            const lcovMetrics = parseLCOVData(lcovData);
            
            // Merge LCOV data with parsed metrics
            if (lcovMetrics.files) {
                Object.assign(coverageMetrics.files, lcovMetrics.files);
            }
        } catch (lcovError) {
            // LCOV file may not exist yet, continue with parsed data
        }
        
        // Calculate summary statistics
        coverageMetrics.summary = {
            fileCount: Object.keys(coverageMetrics.files).length,
            totalLines: coverageMetrics.overall.lines.total,
            coveredLines: coverageMetrics.overall.lines.covered,
            uncoveredCount: coverageMetrics.overall.lines.total - coverageMetrics.overall.lines.covered,
            overallPercentage: coverageMetrics.overall.lines.percentage
        };
        
        // Identify uncovered code sections
        coverageMetrics.uncoveredLines = identifyUncoveredLines(coverageMetrics.files);
        
        return coverageMetrics;
        
    } catch (error) {
        throw new Error(`Coverage data parsing failed: ${error.message}`);
    }
}

// ============================================================================
// COVERAGE ANALYZER CLASS
// ============================================================================

/**
 * Core coverage analysis class that orchestrates test execution with coverage
 * collection, report generation, and quality gate enforcement for Node.js applications.
 */
class CoverageAnalyzer {
    /**
     * Initializes coverage analyzer with configuration, logging, and test runner
     * integration for comprehensive coverage analysis.
     * 
     * @param {Object} config - Coverage analysis configuration
     * @param {Object} logger - Logger instance for structured logging
     */
    constructor(config, logger) {
        try {
            // Store configuration and logger references
            this.config = config;
            this.logger = logger;
            
            // Initialize TestRunner with coverage-enabled configuration
            this.testRunner = new TestRunner(config.testConfig || {});
            
            // Load and validate coverage thresholds
            this.coverageThresholds = {
                ...COVERAGE_THRESHOLDS,
                ...config.thresholds
            };
            
            // Set up output directory for coverage reports
            this.outputDirectory = config.outputDirectory || COVERAGE_OUTPUT_DIR;
            
            // Configure coverage collection options
            this.coverageOptions = {
                sourcePatterns: config.sourcePatterns || SOURCE_PATTERNS,
                excludePatterns: config.excludePatterns || EXCLUDE_PATTERNS,
                formats: config.outputFormats || ['console', 'json', 'lcov']
            };
            
            // Initialize performance tracking
            this.performanceMetrics = {
                startTime: null,
                endTime: null,
                phases: {}
            };
            
            // Validate analyzer configuration
            this.validateConfiguration();
            
            this.logger.debug('CoverageAnalyzer initialized successfully', {
                thresholds: this.coverageThresholds,
                outputDirectory: this.outputDirectory,
                coverageOptions: this.coverageOptions
            });
            
        } catch (error) {
            throw new Error(`CoverageAnalyzer initialization failed: ${error.message}`);
        }
    }
    
    /**
     * Executes complete coverage analysis workflow including test execution,
     * coverage collection, report generation, and quality gate enforcement.
     * 
     * @param {Object} options - Coverage analysis execution options
     * @returns {Promise<Object>} Coverage analysis results with quality gate status
     */
    async runCoverageAnalysis(options = {}) {
        try {
            // Start performance tracking
            this.performanceMetrics.startTime = Date.now();
            
            this.logger.info('Starting comprehensive coverage analysis', {
                options: options,
                thresholds: this.coverageThresholds
            });
            
            // Execute test suite with coverage collection
            const phaseStart = Date.now();
            const testExecutionResults = await this.executeCoverageTests(options);
            this.performanceMetrics.phases.testExecution = Date.now() - phaseStart;
            
            // Collect and parse coverage data
            const coveragePhaseStart = Date.now();
            const coverageData = await this.collectCoverageData(testExecutionResults);
            this.performanceMetrics.phases.coverageCollection = Date.now() - coveragePhaseStart;
            
            // Generate comprehensive coverage reports
            const reportingPhaseStart = Date.now();
            const reportResults = await this.generateDetailedReports(coverageData, options);
            this.performanceMetrics.phases.reportGeneration = Date.now() - reportingPhaseStart;
            
            // Validate coverage against quality gate thresholds
            const validationPhaseStart = Date.now();
            const thresholdResults = await this.validateCoverageThresholds(coverageData);
            this.performanceMetrics.phases.thresholdValidation = Date.now() - validationPhaseStart;
            
            // Complete performance tracking
            this.performanceMetrics.endTime = Date.now();
            this.performanceMetrics.totalDuration = this.performanceMetrics.endTime - this.performanceMetrics.startTime;
            
            // Compile comprehensive analysis results
            const analysisResults = {
                testResults: testExecutionResults.testResults,
                coverageData: coverageData,
                reports: reportResults,
                qualityGate: thresholdResults,
                performance: this.performanceMetrics,
                metrics: {
                    lines: coverageData.overall.lines,
                    functions: coverageData.overall.functions,
                    branches: coverageData.overall.branches,
                    files: Object.keys(coverageData.files).length
                },
                recommendations: this.generateCoverageRecommendations(coverageData, thresholdResults),
                executionTime: this.performanceMetrics.totalDuration,
                timestamp: new Date().toISOString()
            };
            
            this.logger.info('Coverage analysis completed', {
                qualityGateStatus: thresholdResults.passed ? 'PASSED' : 'FAILED',
                executionTime: this.performanceMetrics.totalDuration,
                coverageMetrics: analysisResults.metrics
            });
            
            return analysisResults;
            
        } catch (error) {
            this.logger.error('Coverage analysis execution failed', {
                error: error.message,
                options: options,
                phase: 'runCoverageAnalysis'
            }, error);
            
            throw new Error(`Coverage analysis failed: ${error.message}`);
        }
    }
    
    /**
     * Executes test suite with coverage collection using the TestRunner.
     * 
     * @param {Object} options - Test execution options
     * @returns {Promise<Object>} Test execution results with coverage data
     */
    async executeCoverageTests(options) {
        try {
            // Configure test execution with coverage options
            const testOptions = {
                ...options,
                coverage: true,
                timeout: TEST_TIMEOUT,
                testTypes: options.testTypes || ['unit', 'integration']
            };
            
            // Execute tests using TestRunner with coverage enabled
            const testResults = await this.testRunner.runTests(testOptions);
            
            // Also execute direct coverage collection for comprehensive data
            const coverageExecution = await executeCoverageTests(testOptions, this.logger);
            
            return {
                testResults: testResults,
                coverageExecution: coverageExecution,
                success: testResults.success && coverageExecution.testResults.success
            };
            
        } catch (error) {
            throw new Error(`Coverage test execution failed: ${error.message}`);
        }
    }
    
    /**
     * Collects comprehensive coverage data from test execution results.
     * 
     * @param {Object} testExecutionResults - Test execution results with coverage information
     * @returns {Promise<Object>} Detailed coverage data with metrics
     */
    async collectCoverageData(testExecutionResults) {
        try {
            // Extract coverage data from test runner results
            let coverageData = {};
            
            if (testExecutionResults.coverageExecution?.coverageData) {
                coverageData = testExecutionResults.coverageExecution.coverageData;
            } else if (testExecutionResults.coverageExecution?.rawOutput?.coverageData) {
                // Parse raw coverage output if structured data not available
                coverageData = await parseCoverageData(
                    testExecutionResults.coverageExecution.rawOutput.coverageData, 
                    this.config
                );
            }
            
            // Enhance coverage data with file-level analysis
            if (coverageData.files) {
                for (const [filePath, fileMetrics] of Object.entries(coverageData.files)) {
                    // Add file size and complexity metrics
                    fileMetrics.analysis = await this.analyzeFileComplexity(filePath);
                }
            }
            
            // Add aggregated coverage statistics
            coverageData.aggregatedStats = this.calculateAggregatedStatistics(coverageData);
            
            return coverageData;
            
        } catch (error) {
            throw new Error(`Coverage data collection failed: ${error.message}`);
        }
    }
    
    /**
     * Validates coverage results against configured quality gate thresholds.
     * 
     * @param {Object} coverageMetrics - Coverage metrics to validate
     * @returns {Promise<Object>} Threshold validation results with pass/fail status
     */
    async validateCoverageThresholds(coverageMetrics) {
        try {
            const validationResults = {
                passed: false,
                failures: [],
                warnings: [],
                details: {},
                scores: {}
            };
            
            // Validate line coverage threshold
            const linesCovered = coverageMetrics.overall.lines.percentage;
            const linesRequired = this.coverageThresholds.lineCoverage;
            validationResults.scores.lines = linesCovered;
            
            if (linesCovered >= linesRequired) {
                validationResults.details.lines = { passed: true, actual: linesCovered, required: linesRequired };
            } else {
                validationResults.failures.push(`Line coverage ${linesCovered}% below threshold ${linesRequired}%`);
                validationResults.details.lines = { passed: false, actual: linesCovered, required: linesRequired, deficit: linesRequired - linesCovered };
            }
            
            // Validate function coverage threshold  
            const functionsCovered = coverageMetrics.overall.functions.percentage;
            const functionsRequired = this.coverageThresholds.functionCoverage;
            validationResults.scores.functions = functionsCovered;
            
            if (functionsCovered >= functionsRequired) {
                validationResults.details.functions = { passed: true, actual: functionsCovered, required: functionsRequired };
            } else {
                validationResults.failures.push(`Function coverage ${functionsCovered}% below threshold ${functionsRequired}%`);
                validationResults.details.functions = { passed: false, actual: functionsCovered, required: functionsRequired, deficit: functionsRequired - functionsCovered };
            }
            
            // Validate branch coverage threshold
            const branchesCovered = coverageMetrics.overall.branches.percentage;
            const branchesRequired = this.coverageThresholds.branchCoverage;
            validationResults.scores.branches = branchesCovered;
            
            if (branchesCovered >= branchesRequired) {
                validationResults.details.branches = { passed: true, actual: branchesCovered, required: branchesRequired };
            } else {
                validationResults.failures.push(`Branch coverage ${branchesCovered}% below threshold ${branchesRequired}%`);
                validationResults.details.branches = { passed: false, actual: branchesCovered, required: branchesRequired, deficit: branchesRequired - branchesCovered };
            }
            
            // Validate uncovered lines limit
            const uncoveredCount = coverageMetrics.summary?.uncoveredCount || 0;
            const uncoveredLimit = this.coverageThresholds.uncoveredLinesMax;
            
            if (uncoveredCount <= uncoveredLimit) {
                validationResults.details.uncoveredLines = { passed: true, actual: uncoveredCount, limit: uncoveredLimit };
            } else {
                validationResults.failures.push(`Uncovered lines ${uncoveredCount} exceeds limit ${uncoveredLimit}`);
                validationResults.details.uncoveredLines = { passed: false, actual: uncoveredCount, limit: uncoveredLimit, excess: uncoveredCount - uncoveredLimit };
            }
            
            // Calculate overall quality score
            const totalScore = (linesCovered + functionsCovered + branchesCovered) / 3;
            validationResults.scores.overall = Math.round(totalScore * 100) / 100;
            
            // Determine overall pass/fail status
            validationResults.passed = validationResults.failures.length === 0;
            
            // Add performance warnings if thresholds are barely met
            if (linesCovered < linesRequired + 5) {
                validationResults.warnings.push('Line coverage is close to threshold - consider improving');
            }
            if (branchesCovered < branchesRequired + 10) {
                validationResults.warnings.push('Branch coverage has room for improvement');
            }
            
            return validationResults;
            
        } catch (error) {
            throw new Error(`Coverage threshold validation failed: ${error.message}`);
        }
    }
    
    /**
     * Generates comprehensive coverage reports in multiple formats.
     * 
     * @param {Object} coverageData - Coverage data to report
     * @param {Object} reportOptions - Report generation options  
     * @returns {Promise<Object>} Generated report information with file paths
     */
    async generateDetailedReports(coverageData, reportOptions) {
        try {
            const reportResults = {
                generated: [],
                paths: {},
                formats: reportOptions.outputFormats || this.coverageOptions.formats
            };
            
            // Initialize coverage reporter
            const reporter = new CoverageReporter({
                outputDirectory: this.outputDirectory,
                formats: reportResults.formats
            }, this.logger);
            
            // Generate console report for immediate feedback
            if (reportResults.formats.includes('console')) {
                const consoleReport = await reporter.generateConsoleReport(coverageData);
                console.log(consoleReport);
                reportResults.generated.push('console');
            }
            
            // Generate JSON report for programmatic analysis
            if (reportResults.formats.includes('json')) {
                const jsonPath = join(this.outputDirectory, 'coverage-summary.json');
                const jsonReport = await reporter.generateJSONReport(coverageData, jsonPath);
                reportResults.paths.json = jsonPath;
                reportResults.generated.push('json');
            }
            
            // Generate LCOV report for tool integration
            if (reportResults.formats.includes('lcov')) {
                const lcovPath = join(this.outputDirectory, 'lcov.info');
                const lcovReport = await reporter.generateLCOVReport(coverageData, lcovPath);
                reportResults.paths.lcov = lcovPath;
                reportResults.generated.push('lcov');
            }
            
            // Generate HTML report if requested
            if (reportResults.formats.includes('html')) {
                const htmlPath = join(this.outputDirectory, 'index.html');
                // HTML report generation would be implemented here
                reportResults.paths.html = htmlPath;
                reportResults.generated.push('html');
            }
            
            return reportResults;
            
        } catch (error) {
            throw new Error(`Report generation failed: ${error.message}`);
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Validates coverage analyzer configuration.
     * @private
     */
    validateConfiguration() {
        if (!this.config) {
            throw new Error('Configuration is required');
        }
        
        if (!this.logger) {
            throw new Error('Logger is required');
        }
        
        // Validate threshold values
        Object.entries(this.coverageThresholds).forEach(([key, value]) => {
            if (key.endsWith('Coverage') && (value < 0 || value > 100)) {
                throw new Error(`Invalid coverage threshold for ${key}: ${value}. Must be between 0 and 100.`);
            }
        });
    }
    
    /**
     * Analyzes file complexity for coverage context.
     * @private
     */
    async analyzeFileComplexity(filePath) {
        try {
            // Basic file analysis would be implemented here
            return {
                size: 'medium',
                complexity: 'moderate',
                testPriority: 'normal'
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    /**
     * Calculates aggregated coverage statistics.
     * @private
     */
    calculateAggregatedStatistics(coverageData) {
        try {
            const fileCount = Object.keys(coverageData.files || {}).length;
            const totalLines = coverageData.overall?.lines?.total || 0;
            const coveredLines = coverageData.overall?.lines?.covered || 0;
            
            return {
                fileCount,
                totalLines,
                coveredLines,
                averageCoverage: totalLines > 0 ? (coveredLines / totalLines) * 100 : 0,
                distributionScore: this.calculateCoverageDistribution(coverageData.files)
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    /**
     * Calculates coverage distribution score across files.
     * @private
     */
    calculateCoverageDistribution(files) {
        if (!files || Object.keys(files).length === 0) return 0;
        
        const coverageValues = Object.values(files).map(file => file.percentage || 0);
        const mean = coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length;
        const variance = coverageValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / coverageValues.length;
        
        return Math.round((100 - Math.sqrt(variance)) * 100) / 100; // Higher score = more consistent coverage
    }
    
    /**
     * Generates coverage improvement recommendations.
     * @private
     */
    generateCoverageRecommendations(coverageData, thresholdResults) {
        const recommendations = [];
        
        if (!thresholdResults.passed) {
            if (thresholdResults.details.lines?.deficit > 0) {
                recommendations.push(`Improve line coverage by ${Math.ceil(thresholdResults.details.lines.deficit)}% - focus on untested code paths`);
            }
            
            if (thresholdResults.details.functions?.deficit > 0) {
                recommendations.push('Add tests for uncovered functions - ensure all functions are called during testing');
            }
            
            if (thresholdResults.details.branches?.deficit > 0) {
                recommendations.push(`Improve branch coverage by ${Math.ceil(thresholdResults.details.branches.deficit)}% - test all conditional paths`);
            }
        }
        
        // Add educational recommendations
        recommendations.push('Consider edge cases and error conditions in your tests');
        recommendations.push('Use coverage reports to identify untested code areas');
        recommendations.push('Balance coverage quantity with test quality and maintainability');
        
        return recommendations;
    }
}

// ============================================================================
// COVERAGE REPORTER CLASS  
// ============================================================================

/**
 * Specialized coverage reporting class that formats and outputs coverage data
 * in multiple formats for different audiences and integration needs.
 */
class CoverageReporter {
    /**
     * Initializes coverage reporter with output configuration and logging.
     * 
     * @param {Object} outputConfig - Output configuration and formatting options
     * @param {Object} logger - Logger instance for structured logging
     */
    constructor(outputConfig, logger) {
        this.outputConfig = outputConfig;
        this.logger = logger;
        this.supportedFormats = ['console', 'json', 'lcov', 'html'];
        this.outputDirectory = outputConfig.outputDirectory || COVERAGE_OUTPUT_DIR;
    }
    
    /**
     * Generates formatted console coverage report with color-coded metrics and educational insights.
     * 
     * @param {Object} coverageData - Coverage data to format for console output
     * @returns {Promise<string>} Formatted console report with educational content
     */
    async generateConsoleReport(coverageData) {
        try {
            let report = '\n' + '='.repeat(80) + '\n';
            report += '  TEST COVERAGE ANALYSIS RESULTS\n';
            report += '='.repeat(80) + '\n\n';
            
            // Overall coverage summary with color coding
            report += '📊 OVERALL COVERAGE SUMMARY:\n';
            report += `   Lines:     ${this.formatPercentage(coverageData.overall.lines)} (${coverageData.overall.lines.covered}/${coverageData.overall.lines.total})\n`;
            report += `   Functions: ${this.formatPercentage(coverageData.overall.functions)} (${coverageData.overall.functions.covered}/${coverageData.overall.functions.total})\n`;
            report += `   Branches:  ${this.formatPercentage(coverageData.overall.branches)} (${coverageData.overall.branches.covered}/${coverageData.overall.branches.total})\n\n`;
            
            // File-level coverage breakdown
            if (coverageData.files && Object.keys(coverageData.files).length > 0) {
                report += '📁 FILE COVERAGE BREAKDOWN:\n';
                Object.entries(coverageData.files).forEach(([filePath, metrics]) => {
                    report += `   ${filePath.padEnd(40)} ${this.formatPercentage(metrics)}\n`;
                });
                report += '\n';
            }
            
            // Educational insights
            report += '💡 EDUCATIONAL INSIGHTS:\n';
            report += '   • Line Coverage: Percentage of executable lines covered by tests\n';
            report += '   • Function Coverage: Percentage of functions called during test execution\n';
            report += '   • Branch Coverage: Percentage of conditional branches tested\n';
            report += '   • Aim for high coverage while focusing on meaningful test scenarios\n\n';
            
            // Coverage recommendations
            if (coverageData.uncoveredLines?.length > 0) {
                report += '⚠️  AREAS NEEDING ATTENTION:\n';
                coverageData.uncoveredLines.slice(0, 5).forEach(line => {
                    report += `   • ${line.file}:${line.lineNumber} - ${line.context}\n`;
                });
                if (coverageData.uncoveredLines.length > 5) {
                    report += `   • ... and ${coverageData.uncoveredLines.length - 5} more uncovered areas\n`;
                }
                report += '\n';
            }
            
            report += '='.repeat(80) + '\n';
            
            return report;
            
        } catch (error) {
            return `Console report generation failed: ${error.message}`;
        }
    }
    
    /**
     * Creates structured JSON coverage report for programmatic analysis and CI/CD integration.
     * 
     * @param {Object} coverageData - Coverage data to format as JSON
     * @param {string} outputPath - Output path for JSON report file
     * @returns {Promise<Object>} JSON report data with comprehensive metrics
     */
    async generateJSONReport(coverageData, outputPath) {
        try {
            const jsonReport = {
                summary: {
                    lines: coverageData.overall.lines,
                    functions: coverageData.overall.functions,
                    branches: coverageData.overall.branches,
                    files: coverageData.summary?.fileCount || 0
                },
                files: coverageData.files || {},
                uncovered: coverageData.uncoveredLines || [],
                metadata: {
                    generatedAt: new Date().toISOString(),
                    nodeVersion: process.version,
                    reportFormat: 'json',
                    reportVersion: '1.0.0'
                },
                thresholds: this.outputConfig.thresholds || COVERAGE_THRESHOLDS,
                educational: {
                    metrics: {
                        lines: 'Percentage of executable code lines covered by tests',
                        functions: 'Percentage of functions executed during test runs',
                        branches: 'Percentage of decision branches tested',
                        files: 'Number of source files analyzed for coverage'
                    },
                    recommendations: [
                        'Focus on testing edge cases and error conditions',
                        'Ensure all public functions have corresponding tests',
                        'Test both positive and negative code paths',
                        'Use coverage data to guide test development priorities'
                    ]
                }
            };
            
            // Write JSON report to file
            await writeFile(outputPath, JSON.stringify(jsonReport, null, 2));
            
            this.logger.info('JSON coverage report generated', {
                outputPath: outputPath,
                fileCount: jsonReport.summary.files,
                overallCoverage: jsonReport.summary.lines.percentage
            });
            
            return jsonReport;
            
        } catch (error) {
            throw new Error(`JSON report generation failed: ${error.message}`);
        }
    }
    
    /**
     * Creates LCOV format coverage report for integration with coverage tools and badge generation.
     * 
     * @param {Object} coverageData - Coverage data to format as LCOV
     * @param {string} lcovPath - Output path for LCOV report file
     * @returns {Promise<string>} LCOV file path for tool integration
     */
    async generateLCOVReport(coverageData, lcovPath) {
        try {
            let lcovContent = '';
            
            // Generate LCOV format for each file
            if (coverageData.files) {
                Object.entries(coverageData.files).forEach(([filePath, metrics]) => {
                    lcovContent += `SF:${filePath}\n`;
                    
                    // Function coverage data
                    if (metrics.functions) {
                        Object.entries(metrics.functions).forEach(([funcName, funcData]) => {
                            lcovContent += `FN:${funcData.line},${funcName}\n`;
                            lcovContent += `FNDA:${funcData.hits},${funcName}\n`;
                        });
                        lcovContent += `FNF:${Object.keys(metrics.functions).length}\n`;
                        lcovContent += `FNH:${Object.values(metrics.functions).filter(f => f.hits > 0).length}\n`;
                    }
                    
                    // Line coverage data  
                    if (metrics.lines) {
                        Object.entries(metrics.lines).forEach(([lineNum, hits]) => {
                            lcovContent += `DA:${lineNum},${hits}\n`;
                        });
                        const totalLines = Object.keys(metrics.lines).length;
                        const coveredLines = Object.values(metrics.lines).filter(hits => hits > 0).length;
                        lcovContent += `LF:${totalLines}\n`;
                        lcovContent += `LH:${coveredLines}\n`;
                    }
                    
                    // Branch coverage data
                    if (metrics.branches) {
                        Object.entries(metrics.branches).forEach(([branchId, branchData]) => {
                            lcovContent += `BRF:${branchData.line}\n`;
                            lcovContent += `BRH:${branchData.hits}\n`;
                        });
                    }
                    
                    lcovContent += 'end_of_record\n';
                });
            }
            
            // Write LCOV content to file
            await writeFile(lcovPath, lcovContent);
            
            this.logger.info('LCOV coverage report generated', {
                outputPath: lcovPath,
                fileCount: Object.keys(coverageData.files || {}).length
            });
            
            return lcovPath;
            
        } catch (error) {
            throw new Error(`LCOV report generation failed: ${error.message}`);
        }
    }
    
    // ========================================================================
    // PRIVATE HELPER METHODS
    // ========================================================================
    
    /**
     * Formats coverage percentage with color coding for console output.
     * @private
     */
    formatPercentage(metrics) {
        const percentage = metrics.percentage || 0;
        let color = '';
        let symbol = '';
        
        if (percentage >= 90) {
            color = '\x1b[32m'; // Green
            symbol = '✓';
        } else if (percentage >= 80) {
            color = '\x1b[33m'; // Yellow
            symbol = '⚠';
        } else {
            color = '\x1b[31m'; // Red
            symbol = '✗';
        }
        
        return `${color}${symbol} ${percentage.toFixed(1)}%\x1b[0m`;
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Analyzes coverage results against configured quality gate thresholds and determines
 * pass/fail status for automated quality enforcement.
 * 
 * @param {Object} coverageMetrics - Coverage metrics to analyze
 * @param {Object} thresholds - Quality gate thresholds for comparison
 * @returns {Object} Coverage analysis results with pass/fail status
 */
function analyzeCoverageThresholds(coverageMetrics, thresholds) {
    try {
        const analysis = {
            passed: false,
            violations: [],
            warnings: [],
            metrics: {},
            recommendations: []
        };
        
        // Analyze line coverage
        const lineCoverage = coverageMetrics.overall?.lines?.percentage || 0;
        analysis.metrics.lines = {
            actual: lineCoverage,
            threshold: thresholds.lineCoverage,
            passed: lineCoverage >= thresholds.lineCoverage
        };
        
        if (!analysis.metrics.lines.passed) {
            analysis.violations.push({
                type: 'line-coverage',
                message: `Line coverage ${lineCoverage}% below threshold ${thresholds.lineCoverage}%`,
                deficit: thresholds.lineCoverage - lineCoverage
            });
        }
        
        // Analyze function coverage
        const functionCoverage = coverageMetrics.overall?.functions?.percentage || 0;
        analysis.metrics.functions = {
            actual: functionCoverage,
            threshold: thresholds.functionCoverage,
            passed: functionCoverage >= thresholds.functionCoverage
        };
        
        if (!analysis.metrics.functions.passed) {
            analysis.violations.push({
                type: 'function-coverage',
                message: `Function coverage ${functionCoverage}% below threshold ${thresholds.functionCoverage}%`,
                deficit: thresholds.functionCoverage - functionCoverage
            });
        }
        
        // Analyze branch coverage
        const branchCoverage = coverageMetrics.overall?.branches?.percentage || 0;
        analysis.metrics.branches = {
            actual: branchCoverage,
            threshold: thresholds.branchCoverage,
            passed: branchCoverage >= thresholds.branchCoverage
        };
        
        if (!analysis.metrics.branches.passed) {
            analysis.violations.push({
                type: 'branch-coverage',
                message: `Branch coverage ${branchCoverage}% below threshold ${thresholds.branchCoverage}%`,
                deficit: thresholds.branchCoverage - branchCoverage
            });
        }
        
        // Determine overall pass status
        analysis.passed = analysis.violations.length === 0;
        
        // Generate recommendations for improvement
        if (analysis.violations.length > 0) {
            analysis.recommendations.push('Focus testing efforts on uncovered code areas');
            analysis.recommendations.push('Review test cases for completeness and edge case coverage');
            analysis.recommendations.push('Consider adding integration tests for complex workflows');
        }
        
        return analysis;
        
    } catch (error) {
        return {
            passed: false,
            error: error.message,
            violations: [{ type: 'analysis-error', message: `Threshold analysis failed: ${error.message}` }]
        };
    }
}

/**
 * Generates comprehensive coverage summary with educational insights, quality metrics,
 * and actionable feedback for development teams.
 * 
 * @param {Object} coverageResults - Coverage analysis results
 * @param {Object} testResults - Test execution results
 * @returns {Object} Formatted coverage summary with metrics and recommendations
 */
function generateCoverageSummary(coverageResults, testResults) {
    try {
        const summary = {
            overall: {
                status: coverageResults.qualityGate?.passed ? 'PASSED' : 'FAILED',
                score: calculateOverallCoverageScore(coverageResults.coverageData),
                executionTime: coverageResults.executionTime
            },
            metrics: {
                lines: coverageResults.coverageData?.overall?.lines || { percentage: 0, covered: 0, total: 0 },
                functions: coverageResults.coverageData?.overall?.functions || { percentage: 0, covered: 0, total: 0 },
                branches: coverageResults.coverageData?.overall?.branches || { percentage: 0, covered: 0, total: 0 },
                files: coverageResults.metrics?.files || 0
            },
            qualityGate: {
                passed: coverageResults.qualityGate?.passed || false,
                violations: coverageResults.qualityGate?.failures || [],
                warnings: coverageResults.qualityGate?.warnings || []
            },
            recommendations: coverageResults.recommendations || [],
            educational: {
                insights: [
                    'Coverage metrics help identify untested code areas',
                    'High coverage doesn\'t guarantee bug-free code',
                    'Focus on testing critical business logic and edge cases',
                    'Use coverage data to guide test development priorities'
                ],
                bestPractices: [
                    'Aim for high coverage but prioritize test quality',
                    'Test both happy paths and error conditions',
                    'Include integration tests for complex workflows',
                    'Review uncovered code for potential testing gaps'
                ]
            },
            timestamp: new Date().toISOString()
        };
        
        return summary;
        
    } catch (error) {
        return {
            overall: { status: 'ERROR', error: error.message },
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Handles coverage threshold failures with comprehensive error reporting, educational
 * guidance, and appropriate exit codes for CI/CD integration.
 * 
 * @param {Object} failureResults - Coverage failure results and context
 * @param {Object} logger - Logger instance for structured error reporting
 * @returns {void} Logs failure details and exits with error code
 */
async function handleCoverageFailure(failureResults, logger) {
    try {
        // Log comprehensive failure information
        logger.error('Coverage Quality Gates Failed', {
            qualityGateStatus: 'FAILED',
            violations: failureResults.qualityGate?.failures || [],
            warnings: failureResults.qualityGate?.warnings || [],
            metrics: failureResults.metrics,
            recommendations: failureResults.recommendations,
            executionTime: failureResults.executionTime
        });
        
        // Generate educational guidance
        console.error('\n' + '='.repeat(80));
        console.error('🚫 COVERAGE QUALITY GATES FAILED');
        console.error('='.repeat(80));
        
        if (failureResults.qualityGate?.failures) {
            console.error('\n❌ THRESHOLD VIOLATIONS:');
            failureResults.qualityGate.failures.forEach(failure => {
                console.error(`   • ${failure}`);
            });
        }
        
        console.error('\n💡 IMPROVEMENT RECOMMENDATIONS:');
        (failureResults.recommendations || []).forEach(rec => {
            console.error(`   • ${rec}`);
        });
        
        console.error('\n📚 EDUCATIONAL GUIDANCE:');
        console.error('   • Review uncovered code areas using the generated reports');
        console.error('   • Add tests for critical business logic and edge cases');
        console.error('   • Focus on meaningful test scenarios over coverage percentages');
        console.error('   • Use coverage data to identify potential testing gaps');
        
        console.error('\n🔧 NEXT STEPS:');
        console.error('   1. Review the coverage reports in the coverage/ directory');
        console.error('   2. Identify critical uncovered code areas');
        console.error('   3. Add targeted tests for important functionality');
        console.error('   4. Re-run coverage analysis to validate improvements');
        
        console.error('\n' + '='.repeat(80) + '\n');
        
        // Exit with coverage failure code for CI/CD integration
        process.exit(1);
        
    } catch (error) {
        logger.fatal('Coverage failure handling error', { error: error.message }, error);
        process.exit(3);
    }
}

/**
 * Parses command line arguments for coverage script configuration including test type
 * filters, output formats, and threshold overrides.
 * 
 * @param {Array} argv - Command line arguments array
 * @returns {Object} Parsed command line options with defaults and validation
 */
function parseCommandLineArgs(argv) {
    try {
        const options = {
            testTypes: ['unit', 'integration'],
            outputFormats: ['console', 'json', 'lcov'],
            help: false
        };
        
        // Parse command line arguments
        for (let i = 2; i < argv.length; i++) {
            const arg = argv[i];
            
            if (arg === '--help' || arg === '-h') {
                options.help = true;
            } else if (arg === '--test-types' || arg === '-t') {
                if (i + 1 < argv.length) {
                    options.testTypes = argv[++i].split(',').map(t => t.trim());
                }
            } else if (arg === '--output-formats' || arg === '-o') {
                if (i + 1 < argv.length) {
                    options.outputFormats = argv[++i].split(',').map(f => f.trim());
                }
            } else if (arg === '--threshold-lines') {
                if (i + 1 < argv.length) {
                    options.lineThreshold = parseInt(argv[++i]);
                }
            } else if (arg === '--threshold-functions') {
                if (i + 1 < argv.length) {
                    options.functionThreshold = parseInt(argv[++i]);
                }
            } else if (arg === '--threshold-branches') {
                if (i + 1 < argv.length) {
                    options.branchThreshold = parseInt(argv[++i]);
                }
            }
        }
        
        // Display help information if requested
        if (options.help) {
            displayHelpInformation();
            process.exit(0);
        }
        
        // Validate parsed options
        validateCommandLineOptions(options);
        
        return options;
        
    } catch (error) {
        console.error(`Command line parsing error: ${error.message}`);
        displayHelpInformation();
        process.exit(3);
    }
}

// ============================================================================
// VALIDATION AND UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates coverage configuration for completeness and correctness.
 * @private
 */
function validateCoverageConfiguration(config) {
    if (!config) {
        throw new Error('Coverage configuration is required');
    }
    
    if (!config.thresholds) {
        throw new Error('Coverage thresholds must be specified');
    }
    
    // Validate threshold values
    const { lineCoverage, functionCoverage, branchCoverage } = config.thresholds;
    
    if (lineCoverage < 0 || lineCoverage > 100) {
        throw new Error('Line coverage threshold must be between 0 and 100');
    }
    
    if (functionCoverage < 0 || functionCoverage > 100) {
        throw new Error('Function coverage threshold must be between 0 and 100');
    }
    
    if (branchCoverage < 0 || branchCoverage > 100) {
        throw new Error('Branch coverage threshold must be between 0 and 100');
    }
}

/**
 * Validates parsed command line options.
 * @private
 */
function validateCommandLineOptions(options) {
    const validTestTypes = ['unit', 'integration', 'e2e', 'all'];
    const validOutputFormats = ['console', 'json', 'lcov', 'html'];
    
    // Validate test types
    options.testTypes.forEach(type => {
        if (!validTestTypes.includes(type)) {
            throw new Error(`Invalid test type: ${type}. Valid types: ${validTestTypes.join(', ')}`);
        }
    });
    
    // Validate output formats
    options.outputFormats.forEach(format => {
        if (!validOutputFormats.includes(format)) {
            throw new Error(`Invalid output format: ${format}. Valid formats: ${validOutputFormats.join(', ')}`);
        }
    });
}

/**
 * Displays help information for the coverage script.
 * @private
 */
function displayHelpInformation() {
    console.log('\nNode.js Tutorial Test Coverage Analysis Script');
    console.log('='.repeat(50));
    console.log('\nUsage: node test-coverage.js [options]');
    console.log('\nOptions:');
    console.log('  --test-types, -t      Test types to run (unit,integration,e2e,all)');
    console.log('  --output-formats, -o  Output formats (console,json,lcov,html)');
    console.log('  --threshold-lines     Line coverage threshold (0-100)');
    console.log('  --threshold-functions Function coverage threshold (0-100)');  
    console.log('  --threshold-branches  Branch coverage threshold (0-100)');
    console.log('  --help, -h           Show this help message');
    console.log('\nExamples:');
    console.log('  node test-coverage.js');
    console.log('  node test-coverage.js -t unit,integration -o console,json');
    console.log('  node test-coverage.js --threshold-lines 85 --threshold-branches 75');
    console.log('\nFor more information, see the project documentation.\n');
}

/**
 * Calculates overall coverage score from coverage data.
 * @private
 */
function calculateOverallCoverageScore(coverageData) {
    try {
        const lines = coverageData.overall?.lines?.percentage || 0;
        const functions = coverageData.overall?.functions?.percentage || 0;
        const branches = coverageData.overall?.branches?.percentage || 0;
        
        // Weighted average with emphasis on line coverage
        const weightedScore = (lines * 0.5) + (functions * 0.3) + (branches * 0.2);
        return Math.round(weightedScore * 100) / 100;
        
    } catch (error) {
        return 0;
    }
}

/**
 * Identifies uncovered lines from coverage data.
 * @private
 */
function identifyUncoveredLines(filesData) {
    const uncoveredLines = [];
    
    try {
        Object.entries(filesData || {}).forEach(([filePath, fileData]) => {
            if (fileData.uncoveredLines) {
                fileData.uncoveredLines.forEach(lineNum => {
                    uncoveredLines.push({
                        file: filePath,
                        lineNumber: lineNum,
                        context: 'Uncovered code line'
                    });
                });
            }
        });
        
        return uncoveredLines;
        
    } catch (error) {
        return [];
    }
}

/**
 * Parses LCOV format data into structured coverage metrics.
 * @private
 */
function parseLCOVData(lcovContent) {
    try {
        const files = {};
        const lines = lcovContent.split('\n');
        let currentFile = null;
        
        for (const line of lines) {
            if (line.startsWith('SF:')) {
                currentFile = line.substring(3);
                files[currentFile] = { lines: {}, functions: {}, branches: {} };
            } else if (line.startsWith('DA:') && currentFile) {
                const [lineNum, hits] = line.substring(3).split(',');
                files[currentFile].lines[parseInt(lineNum)] = parseInt(hits);
            } else if (line.startsWith('FN:') && currentFile) {
                const parts = line.substring(3).split(',');
                if (parts.length >= 2) {
                    const [lineNum, funcName] = parts;
                    files[currentFile].functions[funcName] = { line: parseInt(lineNum), hits: 0 };
                }
            } else if (line.startsWith('FNDA:') && currentFile) {
                const [hits, funcName] = line.substring(5).split(',');
                if (files[currentFile].functions[funcName]) {
                    files[currentFile].functions[funcName].hits = parseInt(hits);
                }
            }
        }
        
        return { files };
        
    } catch (error) {
        return { error: error.message };
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export main entry point for coverage analysis script execution
export { main };

// Export core coverage analysis classes for programmatic usage
export { CoverageAnalyzer };
export { CoverageReporter };

// Export utility functions for modular usage and testing
export { executeCoverageTests };
export { parseCoverageData };
export { analyzeCoverageThresholds };
export { generateCoverageSummary };
export { handleCoverageFailure };
export { parseCommandLineArgs };

// Export coverage constants for external configuration
export { 
    COVERAGE_THRESHOLDS,
    COVERAGE_OUTPUT_DIR,
    LCOV_FILE_PATH,
    COVERAGE_REPORT_FILE,
    TEST_TIMEOUT
};

// Execute main function if script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Coverage script execution failed:', error.message);
        process.exit(3);
    });
}

// Default export for convenient access to complete coverage functionality
export default {
    main,
    CoverageAnalyzer,
    CoverageReporter,
    executeCoverageTests,
    parseCoverageData,
    analyzeCoverageThresholds,
    generateCoverageSummary,
    constants: {
        COVERAGE_THRESHOLDS,
        COVERAGE_OUTPUT_DIR,
        LCOV_FILE_PATH,
        COVERAGE_REPORT_FILE,
        TEST_TIMEOUT
    }
};