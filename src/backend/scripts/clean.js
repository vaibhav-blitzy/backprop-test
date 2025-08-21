/**
 * File System Cleanup Script for Node.js Tutorial Application
 * 
 * This script provides comprehensive file system cleanup capabilities for removing temporary files,
 * build artifacts, development caches, and environment-specific files from the Node.js tutorial
 * application. Implements educational cleanup patterns using Node.js built-in file system operations
 * with comprehensive logging and error handling while maintaining zero external dependencies for
 * learning clarity.
 * 
 * Key Features:
 * - Zero external dependencies using only Node.js built-in modules
 * - Comprehensive cleanup patterns for development and production environments
 * - Educational file management patterns demonstrating proper cleanup procedures
 * - Production-ready safety validation and error handling
 * - Command-line interface with multiple cleanup types and options
 * - Performance monitoring with disk space calculation and operation timing
 * - Integration with application logging and configuration systems
 * 
 * Educational Objectives:
 * - Demonstrates proper Node.js file system operations and patterns
 * - Shows creation of command-line cleanup and maintenance tools
 * - Illustrates comprehensive error handling for file system operations
 * - Demonstrates integration with application logging and configuration systems
 * - Shows implementation of safety checks and validation patterns
 * - Provides examples of configuration-driven tool design
 * 
 * Cleanup Types Supported:
 * - all: Comprehensive cleanup of all temporary files and development artifacts
 * - logs: Cleanup of log files and debug output
 * - deps: Cleanup of dependency files and package artifacts
 * - env: Cleanup of environment-specific configuration files
 * - coverage: Cleanup of test coverage reports and data
 * - system: Cleanup of OS-specific and IDE files
 * 
 * Safety Features:
 * - Boundary checks to ensure operations stay within project directory
 * - Critical file protection to prevent accidental removal of application files
 * - Permission validation before attempting removal operations
 * - Dry-run mode for previewing cleanup operations without execution
 * - Pattern validation to prevent dangerous cleanup operations
 * 
 * @fileoverview Comprehensive file system cleanup script with educational patterns
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS - NODE.JS BUILT-IN MODULES
// ============================================================================

// File system operations for cleanup functionality
import { 
    rmSync,        // Node.js v20.x - Remove files and directories synchronously
    existsSync,    // Node.js v20.x - Check file and directory existence before cleanup
    readdirSync,   // Node.js v20.x - Read directory contents for pattern-based discovery
    statSync,      // Node.js v20.x - Get file statistics for cleanup decision making
    lstatSync      // Node.js v20.x - Get symbolic link statistics for proper handling
} from 'node:fs';

// Path utilities for cross-platform file path construction
import { 
    join,          // Node.js v20.x - Construct cross-platform file paths for cleanup operations
    resolve,       // Node.js v20.x - Resolve absolute paths for cleanup target validation
    dirname,       // Node.js v20.x - Extract directory names for path manipulation
    basename,      // Node.js v20.x - Extract file names for pattern matching
    relative       // Node.js v20.x - Calculate relative paths for user-friendly output
} from 'node:path';

// Process utilities for command line arguments and exit codes
import process from 'node:process'; // Node.js v20.x - Global process object for arguments and exit codes

// URL utilities for ES module path resolution
import { fileURLToPath } from 'node:url'; // Node.js v20.x - Convert file URLs to paths for ES modules

// Utility module for object inspection and debugging
import util from 'node:util'; // Node.js v20.x - Utility functions for debugging and object inspection

// ============================================================================
// MODULE IMPORTS - APPLICATION COMPONENTS
// ============================================================================

// Import application logging system for cleanup operation logging
import { Logger } from '../utils/logger.js';

// Import application configuration for cleanup behavior settings
import { AppConfig } from '../config/app.config.js';

// ============================================================================
// GLOBAL CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Default cleanup patterns for comprehensive file system cleanup operations.
 * These patterns define files and directories that are safe to remove during cleanup
 * operations and represent temporary, generated, or environment-specific content.
 */
const CLEANUP_PATTERNS = [
    'node_modules',         // Node.js dependency directories
    '*.log',               // Log files of all types
    'npm-debug.log*',      // NPM debug logs with wildcard patterns
    '.env.local',          // Local environment configuration files
    '.env.production',     // Production environment configuration files
    '.env.staging',        // Staging environment configuration files
    'coverage',            // Test coverage report directories
    '.nyc_output',         // NYC test coverage output directories
    '.DS_Store',           // macOS system files
    'Thumbs.db',          // Windows system files
    '.vscode',            // Visual Studio Code configuration directories
    '.idea',              // IntelliJ IDEA configuration directories
    '*.swp',              // Vim swap files
    '*~',                 // Editor backup files
    'dist',               // Build output directories
    'build',              // Compiled output directories
    '.cache',             // Cache directories
    'tmp',                // Temporary directories
    'temp',               // Alternative temporary directories
    '*.tmp',              // Temporary files
    'logs',               // Log directories
    'debug',              // Debug output directories
];

/**
 * Default cleanup operation timeout in milliseconds to prevent infinite operations.
 * This timeout ensures cleanup operations complete within reasonable time limits.
 */
const DEFAULT_CLEANUP_TIMEOUT = 30000; // 30 seconds

/**
 * Maximum file size for individual file removal operations in bytes.
 * Large files require additional confirmation to prevent accidental data loss.
 */
const MAX_SINGLE_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Protected file patterns that should never be removed during cleanup operations.
 * These patterns protect critical application files from accidental deletion.
 */
const PROTECTED_PATTERNS = [
    'package.json',        // Package configuration files
    'package-lock.json',   // NPM lock files (sometimes protected)
    '*.js',               // JavaScript source files
    '*.ts',               // TypeScript source files  
    '*.json',             // Configuration files
    'README.*',           // Documentation files
    '.git',               // Git repository directories
    '.gitignore',         // Git ignore files
    'src',                // Source code directories
    'lib',                // Library directories
    'bin',                // Binary directories
];

/**
 * Cleanup type definitions with associated patterns and safety configurations.
 * Each cleanup type defines specific files and directories to target with
 * appropriate safety checks and validation rules.
 */
const CLEANUP_TYPES = {
    all: {
        description: 'Comprehensive cleanup of all temporary files and development artifacts',
        patterns: CLEANUP_PATTERNS,
        safety: { enabled: true, requireConfirmation: false },
        priority: 1
    },
    logs: {
        description: 'Cleanup of log files and debug output',
        patterns: ['*.log', 'npm-debug.log*', 'logs/', 'debug/'],
        safety: { enabled: true, requireConfirmation: false },
        priority: 2
    },
    deps: {
        description: 'Cleanup of dependency files and package artifacts',
        patterns: ['node_modules', 'package-lock.json', 'yarn.lock'],
        safety: { enabled: true, requireConfirmation: true },
        priority: 3
    },
    env: {
        description: 'Cleanup of environment-specific configuration files',
        patterns: ['.env.local', '.env.production', '.env.staging'],
        safety: { enabled: true, requireConfirmation: false },
        priority: 4
    },
    coverage: {
        description: 'Cleanup of test coverage reports and data',
        patterns: ['coverage/', '.nyc_output/', 'lcov.info'],
        safety: { enabled: true, requireConfirmation: false },
        priority: 5
    },
    system: {
        description: 'Cleanup of OS-specific and IDE files',
        patterns: ['.DS_Store', 'Thumbs.db', '.vscode/', '.idea/', '*.swp', '*~'],
        safety: { enabled: true, requireConfirmation: false },
        priority: 6
    }
};

/**
 * Default cleanup configuration options for consistent behavior across operations.
 * These defaults provide safe and predictable cleanup behavior while allowing customization.
 */
const DEFAULT_CLEANUP_OPTIONS = {
    dryRun: false,                    // Execute actual cleanup operations by default
    verbose: false,                   // Minimal output unless requested
    type: 'all',                     // Comprehensive cleanup by default
    timeout: DEFAULT_CLEANUP_TIMEOUT, // 30 second operation timeout
    followSymlinks: false,           // Don't follow symbolic links for safety
    preserveGitignore: true,         // Respect .gitignore patterns
    requireConfirmation: false,      // Skip confirmation for non-destructive operations
    calculateDiskSpace: true,        // Calculate disk space reclaimed by default
    logResults: true                 // Log cleanup results by default
};

// ============================================================================
// UTILITY FUNCTIONS FOR CLEANUP OPERATIONS
// ============================================================================

/**
 * Generates a unique correlation ID for cleanup operations to support logging
 * and operation tracking across multiple components and log entries.
 * 
 * @returns {string} Unique correlation ID with timestamp and random component
 * 
 * @example
 * const correlationId = generateCorrelationId();
 * logger.info('Starting cleanup operation', { correlationId });
 */
function generateCorrelationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `cleanup_${timestamp}_${random}`;
}

/**
 * Validates that a file path is within the allowed project boundaries to prevent
 * cleanup operations from affecting files outside the project directory structure.
 * 
 * @param {string} targetPath - File path to validate for boundary compliance
 * @param {string} projectRoot - Project root directory for boundary checking
 * @returns {boolean} true if path is within project boundaries, false otherwise
 * 
 * @example
 * const isValid = validatePathBoundaries('/project/src/file.js', '/project');
 * console.log('Path is safe:', isValid); // true
 */
function validatePathBoundaries(targetPath, projectRoot) {
    try {
        // Resolve absolute paths for accurate comparison
        const absoluteTarget = resolve(targetPath);
        const absoluteRoot = resolve(projectRoot);
        
        // Calculate relative path to check containment
        const relativePath = relative(absoluteRoot, absoluteTarget);
        
        // Path is valid if it doesn't start with '..' (not escaping root)
        return !relativePath.startsWith('..') && !absoluteTarget.startsWith(absoluteRoot + '..');
        
    } catch (error) {
        // Return false for any path resolution errors
        return false;
    }
}

/**
 * Checks if a file or directory matches any of the protected patterns to prevent
 * accidental removal of critical application files during cleanup operations.
 * 
 * @param {string} filePath - File path to check against protected patterns
 * @param {Array} protectedPatterns - Array of patterns to match against
 * @returns {boolean} true if file is protected, false if safe to remove
 * 
 * @example
 * const isProtected = isProtectedFile('/project/package.json', PROTECTED_PATTERNS);
 * console.log('File is protected:', isProtected); // true
 */
function isProtectedFile(filePath, protectedPatterns = PROTECTED_PATTERNS) {
    try {
        const fileName = basename(filePath);
        const dirName = basename(dirname(filePath));
        
        // Check if file matches any protected patterns using simple pattern matching
        return protectedPatterns.some(pattern => {
            // Handle wildcard patterns with basic string matching
            if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/\*/g, '.*');
                const regex = new RegExp(`^${regexPattern}$`, 'i');
                return regex.test(fileName) || regex.test(dirName);
            }
            
            // Direct string matching for exact patterns
            return fileName === pattern || dirName === pattern || filePath.includes(pattern);
        });
        
    } catch (error) {
        // Treat files with path errors as protected for safety
        return true;
    }
}

/**
 * Matches file paths against cleanup patterns using simple glob-like pattern matching
 * to determine which files should be included in cleanup operations.
 * 
 * @param {string} filePath - File path to match against patterns
 * @param {Array} patterns - Array of cleanup patterns to match
 * @returns {boolean} true if file matches cleanup patterns, false otherwise
 * 
 * @example
 * const shouldClean = matchesCleanupPatterns('/project/debug.log', ['*.log']);
 * console.log('Should clean file:', shouldClean); // true
 */
function matchesCleanupPatterns(filePath, patterns) {
    try {
        const fileName = basename(filePath);
        const relativePath = filePath;
        
        // Check if file matches any cleanup patterns
        return patterns.some(pattern => {
            // Handle wildcard patterns with regex conversion
            if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
                const regex = new RegExp(`^${regexPattern}$`, 'i');
                return regex.test(fileName) || regex.test(relativePath);
            }
            
            // Handle directory patterns with trailing slashes
            if (pattern.endsWith('/')) {
                const dirPattern = pattern.slice(0, -1);
                return relativePath.includes(dirPattern + '/') || relativePath.endsWith(dirPattern);
            }
            
            // Direct string matching for exact patterns
            return fileName === pattern || relativePath.includes(pattern);
        });
        
    } catch (error) {
        // Default to not cleaning files with matching errors
        return false;
    }
}

/**
 * Safely calculates file or directory size with error handling for inaccessible files
 * and comprehensive size calculation including nested directory contents.
 * 
 * @param {string} filePath - Path to file or directory for size calculation
 * @returns {number} Size in bytes, or 0 if calculation fails
 * 
 * @example
 * const size = getFileSize('/project/node_modules');
 * console.log('Directory size:', Math.round(size / 1024 / 1024) + 'MB');
 */
function getFileSize(filePath) {
    try {
        // Check if file or directory exists before size calculation
        if (!existsSync(filePath)) {
            return 0;
        }
        
        const stats = lstatSync(filePath);
        
        // Handle symbolic links without following them
        if (stats.isSymbolicLink()) {
            return 0; // Don't calculate size for symbolic links
        }
        
        // Return file size for regular files
        if (stats.isFile()) {
            return stats.size;
        }
        
        // Calculate directory size by summing all contents
        if (stats.isDirectory()) {
            let totalSize = 0;
            
            try {
                const files = readdirSync(filePath);
                
                for (const file of files) {
                    const fullPath = join(filePath, file);
                    totalSize += getFileSize(fullPath); // Recursive size calculation
                }
                
            } catch (dirError) {
                // Return partial size if directory reading fails
                return 0;
            }
            
            return totalSize;
        }
        
        return 0; // Unknown file type
        
    } catch (error) {
        // Return 0 for any file system errors
        return 0;
    }
}

/**
 * Formats file size in bytes to human-readable format with appropriate units
 * and precision for user-friendly display in cleanup reports and logging.
 * 
 * @param {number} bytes - Size in bytes to format
 * @param {number} [decimals=2] - Number of decimal places for precision
 * @returns {string} Formatted size string with appropriate units
 * 
 * @example
 * const formatted = formatFileSize(1536);
 * console.log('File size:', formatted); // "1.50 KB"
 */
function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ============================================================================
// CORE CLEANUP FUNCTIONS
// ============================================================================

/**
 * Parses command line arguments and environment variables to configure cleanup
 * operation parameters with comprehensive validation and default value assignment.
 * 
 * @param {Array} args - Command line arguments array
 * @returns {Object} Parsed cleanup configuration options
 * 
 * @example
 * const options = parseCleanupOptions(['--type=logs', '--dry-run', '--verbose']);
 * console.log('Cleanup type:', options.type); // 'logs'
 */
function parseCleanupOptions(args = process.argv.slice(2)) {
    // Initialize configuration with safe defaults
    const options = { ...DEFAULT_CLEANUP_OPTIONS };
    
    try {
        // Parse command line arguments with comprehensive option support
        args.forEach(arg => {
            if (arg.startsWith('--type=')) {
                const type = arg.split('=')[1];
                if (CLEANUP_TYPES[type]) {
                    options.type = type;
                } else {
                    throw new Error(`Invalid cleanup type: ${type}. Valid types: ${Object.keys(CLEANUP_TYPES).join(', ')}`);
                }
            } else if (arg === '--dry-run') {
                options.dryRun = true;
            } else if (arg === '--verbose') {
                options.verbose = true;
            } else if (arg.startsWith('--pattern=')) {
                options.customPattern = arg.split('=')[1];
            } else if (arg.startsWith('--exclude=')) {
                options.excludePattern = arg.split('=')[1];
            } else if (arg === '--no-confirm') {
                options.requireConfirmation = false;
            } else if (arg === '--help' || arg === '-h') {
                options.showHelp = true;
            } else if (arg === '--version') {
                options.showVersion = true;
            } else if (arg.startsWith('--timeout=')) {
                const timeout = parseInt(arg.split('=')[1], 10);
                if (timeout > 0) {
                    options.timeout = timeout * 1000; // Convert to milliseconds
                }
            } else {
                console.warn(`Unknown argument: ${arg}`);
            }
        });
        
        // Apply environment variable overrides with validation
        if (process.env.CLEANUP_TYPE && CLEANUP_TYPES[process.env.CLEANUP_TYPE]) {
            options.type = process.env.CLEANUP_TYPE;
        }
        
        if (process.env.CLEANUP_DRY_RUN === 'true') {
            options.dryRun = true;
        }
        
        if (process.env.CLEANUP_VERBOSE === 'true') {
            options.verbose = true;
        }
        
        // Add cleanup type configuration to options
        options.typeConfig = CLEANUP_TYPES[options.type];
        
        // Generate correlation ID for operation tracking
        options.correlationId = generateCorrelationId();
        
        // Set up cleanup patterns based on type and custom patterns
        options.patterns = [...options.typeConfig.patterns];
        if (options.customPattern) {
            options.patterns.push(options.customPattern);
        }
        
        // Set up exclusion patterns if specified
        if (options.excludePattern) {
            options.excludePatterns = options.excludePatterns || [];
            options.excludePatterns.push(options.excludePattern);
        }
        
        return options;
        
    } catch (error) {
        console.error(`Error parsing cleanup options: ${error.message}`);
        return { ...DEFAULT_CLEANUP_OPTIONS, error: error.message };
    }
}

/**
 * Discovers files and directories that match cleanup patterns within the project
 * directory structure with comprehensive pattern matching and safety validation.
 * 
 * @param {Array} patterns - Cleanup patterns for file discovery
 * @param {Object} options - Discovery options and configuration
 * @returns {Array} Array of file and directory paths to be cleaned
 * 
 * @example
 * const targets = discoverCleanupTargets(['*.log', 'node_modules'], { verbose: true });
 * console.log('Found cleanup targets:', targets.length);
 */
function discoverCleanupTargets(patterns, options = {}) {
    const targets = [];
    const errors = [];
    const startTime = Date.now();
    
    try {
        // Determine project root directory for boundary validation
        const projectRoot = options.projectRoot || process.cwd();
        
        // Initialize discovery statistics for reporting
        const discoveryStats = {
            scannedDirectories: 0,
            scannedFiles: 0,
            matchedTargets: 0,
            protectedFiles: 0,
            errors: 0
        };
        
        /**
         * Recursively scans directory structure to find cleanup targets
         * @param {string} dirPath - Directory path to scan
         * @param {number} depth - Current recursion depth for limiting scan depth
         */
        function scanDirectory(dirPath, depth = 0) {
            // Limit scan depth to prevent infinite recursion
            if (depth > 10) {
                return;
            }
            
            try {
                // Validate directory boundaries before scanning
                if (!validatePathBoundaries(dirPath, projectRoot)) {
                    return;
                }
                
                // Check if directory exists and is accessible
                if (!existsSync(dirPath)) {
                    return;
                }
                
                const dirStats = lstatSync(dirPath);
                
                // Skip symbolic links for safety unless explicitly enabled
                if (dirStats.isSymbolicLink() && !options.followSymlinks) {
                    return;
                }
                
                // Skip non-directory entries in recursive scan
                if (!dirStats.isDirectory()) {
                    return;
                }
                
                discoveryStats.scannedDirectories++;
                
                // Read directory contents with error handling
                let files;
                try {
                    files = readdirSync(dirPath);
                } catch (readError) {
                    errors.push({
                        path: dirPath,
                        error: `Cannot read directory: ${readError.message}`,
                        type: 'read_error'
                    });
                    discoveryStats.errors++;
                    return;
                }
                
                // Process each file and subdirectory
                for (const file of files) {
                    const fullPath = join(dirPath, file);
                    
                    try {
                        const fileStats = lstatSync(fullPath);
                        discoveryStats.scannedFiles++;
                        
                        // Check if current path matches any cleanup patterns
                        const matchesPattern = matchesCleanupPatterns(fullPath, patterns);
                        
                        if (matchesPattern) {
                            // Verify file is not protected before adding to targets
                            if (isProtectedFile(fullPath)) {
                                discoveryStats.protectedFiles++;
                                if (options.verbose) {
                                    console.log(`Protected file skipped: ${fullPath}`);
                                }
                            } else {
                                targets.push({
                                    path: fullPath,
                                    type: fileStats.isDirectory() ? 'directory' : 'file',
                                    size: getFileSize(fullPath),
                                    pattern: patterns.find(p => matchesCleanupPatterns(fullPath, [p]))
                                });
                                discoveryStats.matchedTargets++;
                                
                                if (options.verbose) {
                                    console.log(`Cleanup target found: ${fullPath}`);
                                }
                            }
                        }
                        
                        // Recursively scan subdirectories
                        if (fileStats.isDirectory() && !matchesPattern) {
                            scanDirectory(fullPath, depth + 1);
                        }
                        
                    } catch (statError) {
                        errors.push({
                            path: fullPath,
                            error: `Cannot access file: ${statError.message}`,
                            type: 'access_error'
                        });
                        discoveryStats.errors++;
                    }
                }
                
            } catch (scanError) {
                errors.push({
                    path: dirPath,
                    error: `Directory scan failed: ${scanError.message}`,
                    type: 'scan_error'
                });
                discoveryStats.errors++;
            }
        }
        
        // Start discovery from project root directory
        scanDirectory(projectRoot);
        
        // Calculate discovery performance metrics
        const discoveryTime = Date.now() - startTime;
        
        // Add discovery metadata to results
        const discoveryResults = {
            targets,
            statistics: {
                ...discoveryStats,
                discoveryTime: `${discoveryTime}ms`,
                totalTargets: targets.length,
                totalSize: targets.reduce((sum, target) => sum + target.size, 0)
            },
            errors,
            options: {
                patterns: patterns,
                projectRoot,
                followSymlinks: options.followSymlinks,
                verbose: options.verbose
            }
        };
        
        return discoveryResults;
        
    } catch (error) {
        return {
            targets: [],
            statistics: { errors: 1 },
            errors: [{
                path: 'discovery',
                error: `Discovery failed: ${error.message}`,
                type: 'discovery_error'
            }],
            options
        };
    }
}

/**
 * Executes the actual file and directory removal operations with comprehensive
 * error handling and detailed operation tracking for cleanup monitoring.
 * 
 * @param {Array} cleanupTargets - Array of cleanup targets with path and type information
 * @param {Object} options - Cleanup execution options and configuration
 * @returns {Promise<Object>} Cleanup operation results with success/failure counts
 * 
 * @example
 * const results = await executeCleanupOperation(targets, { dryRun: false, verbose: true });
 * console.log('Cleanup completed:', results.summary);
 */
async function executeCleanupOperation(cleanupTargets, options = {}) {
    const startTime = Date.now();
    const operationId = options.correlationId || generateCorrelationId();
    
    // Initialize operation results tracking
    const results = {
        success: [],
        failures: [],
        skipped: [],
        statistics: {
            totalTargets: cleanupTargets.length,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
            totalSizeRemoved: 0,
            operationTime: 0
        },
        operationId
    };
    
    try {
        // Create logger instance for operation tracking
        const appConfig = new AppConfig();
        const logger = new Logger({ appConfig });
        
        logger.info('Starting cleanup operation execution', {
            operationId,
            targetCount: cleanupTargets.length,
            dryRun: options.dryRun,
            type: options.type
        });
        
        // Process each cleanup target with comprehensive error handling
        for (const target of cleanupTargets) {
            const targetStartTime = Date.now();
            
            try {
                // Validate target still exists before attempting removal
                if (!existsSync(target.path)) {
                    results.skipped.push({
                        path: target.path,
                        reason: 'File no longer exists',
                        type: target.type
                    });
                    results.statistics.skippedCount++;
                    continue;
                }
                
                // Perform dry-run simulation without actual removal
                if (options.dryRun) {
                    results.success.push({
                        path: target.path,
                        type: target.type,
                        size: target.size,
                        action: 'simulated_removal',
                        processingTime: Date.now() - targetStartTime
                    });
                    results.statistics.successCount++;
                    results.statistics.totalSizeRemoved += target.size;
                    
                    if (options.verbose) {
                        logger.info(`[DRY RUN] Would remove: ${target.path}`, {
                            size: formatFileSize(target.size),
                            type: target.type
                        });
                    }
                    continue;
                }
                
                // Execute actual file/directory removal
                const removalStartTime = Date.now();
                
                rmSync(target.path, {
                    recursive: true,           // Remove directories and their contents
                    force: true,              // Continue even if file doesn't exist
                    maxRetries: 3,            // Retry failed operations
                    retryDelay: 100           // Delay between retries in milliseconds
                });
                
                const removalTime = Date.now() - removalStartTime;
                
                // Record successful removal operation
                results.success.push({
                    path: target.path,
                    type: target.type,
                    size: target.size,
                    action: 'removed',
                    processingTime: Date.now() - targetStartTime,
                    removalTime
                });
                
                results.statistics.successCount++;
                results.statistics.totalSizeRemoved += target.size;
                
                if (options.verbose) {
                    logger.info(`Successfully removed: ${target.path}`, {
                        size: formatFileSize(target.size),
                        type: target.type,
                        removalTime: `${removalTime}ms`
                    });
                }
                
            } catch (removalError) {
                // Handle and record removal failures with detailed error context
                const errorInfo = {
                    path: target.path,
                    type: target.type,
                    size: target.size,
                    error: removalError.message,
                    errorCode: removalError.code,
                    processingTime: Date.now() - targetStartTime
                };
                
                results.failures.push(errorInfo);
                results.statistics.failureCount++;
                
                logger.error(`Failed to remove: ${target.path}`, {
                    error: removalError.message,
                    errorCode: removalError.code,
                    type: target.type,
                    size: formatFileSize(target.size)
                });
            }
        }
        
        // Calculate final operation statistics
        results.statistics.operationTime = Date.now() - startTime;
        results.statistics.averageTimePerTarget = results.statistics.operationTime / cleanupTargets.length;
        
        // Log operation completion summary
        logger.info('Cleanup operation execution completed', {
            operationId,
            successCount: results.statistics.successCount,
            failureCount: results.statistics.failureCount,
            skippedCount: results.statistics.skippedCount,
            totalSizeRemoved: formatFileSize(results.statistics.totalSizeRemoved),
            operationTime: `${results.statistics.operationTime}ms`
        });
        
        return results;
        
    } catch (error) {
        // Handle catastrophic operation failures
        results.statistics.operationTime = Date.now() - startTime;
        results.operationError = {
            message: error.message,
            type: 'operation_failure',
            timestamp: new Date().toISOString()
        };
        
        return results;
    }
}

/**
 * Validates cleanup operations for safety, preventing accidental removal of critical
 * files and ensuring operations stay within safe project boundaries.
 * 
 * @param {Array} targets - Cleanup targets to validate for safety
 * @param {Object} options - Safety validation options and configuration
 * @returns {Object} Safety validation results with approval status and warnings
 * 
 * @example
 * const safety = validateCleanupSafety(targets, { requireConfirmation: true });
 * console.log('Cleanup is safe:', safety.approved);
 */
function validateCleanupSafety(targets, options = {}) {
    const validationResults = {
        approved: true,
        warnings: [],
        errors: [],
        statistics: {
            totalTargets: targets.length,
            protectedFiles: 0,
            largeFiles: 0,
            outOfBounds: 0,
            totalSize: 0
        }
    };
    
    try {
        const projectRoot = options.projectRoot || process.cwd();
        
        // Validate each cleanup target for safety compliance
        targets.forEach(target => {
            validationResults.statistics.totalSize += target.size;
            
            // Check project boundary compliance
            if (!validatePathBoundaries(target.path, projectRoot)) {
                validationResults.errors.push({
                    path: target.path,
                    issue: 'Path is outside project boundaries',
                    severity: 'critical'
                });
                validationResults.statistics.outOfBounds++;
                validationResults.approved = false;
            }
            
            // Check for protected file patterns
            if (isProtectedFile(target.path)) {
                validationResults.errors.push({
                    path: target.path,
                    issue: 'File matches protected patterns',
                    severity: 'critical'
                });
                validationResults.statistics.protectedFiles++;
                validationResults.approved = false;
            }
            
            // Check for large file removal warnings
            if (target.size > MAX_SINGLE_FILE_SIZE) {
                validationResults.warnings.push({
                    path: target.path,
                    issue: `Large file/directory (${formatFileSize(target.size)})`,
                    severity: 'warning',
                    size: target.size
                });
                validationResults.statistics.largeFiles++;
                
                // Require confirmation for large removals if configured
                if (options.requireConfirmation && !options.confirmed) {
                    validationResults.approved = false;
                }
            }
        });
        
        // Apply additional safety checks based on cleanup type
        if (options.typeConfig && options.typeConfig.safety) {
            const safetyConfig = options.typeConfig.safety;
            
            if (safetyConfig.requireConfirmation && !options.confirmed) {
                validationResults.warnings.push({
                    issue: `Cleanup type '${options.type}' requires confirmation`,
                    severity: 'confirmation_required'
                });
                
                if (!options.dryRun) {
                    validationResults.approved = false;
                }
            }
        }
        
        // Add summary information for validation results
        validationResults.summary = {
            totalTargets: validationResults.statistics.totalTargets,
            totalSize: formatFileSize(validationResults.statistics.totalSize),
            criticalErrors: validationResults.errors.length,
            warnings: validationResults.warnings.length,
            approved: validationResults.approved
        };
        
        return validationResults;
        
    } catch (error) {
        return {
            approved: false,
            errors: [{
                issue: `Safety validation failed: ${error.message}`,
                severity: 'critical'
            }],
            warnings: [],
            statistics: { totalTargets: 0 }
        };
    }
}

/**
 * Logs comprehensive cleanup operation summary including results, statistics,
 * and any errors encountered during the cleanup process.
 * 
 * @param {Object} cleanupResults - Complete cleanup results from operation execution
 * @param {Object} options - Logging options and configuration
 * @returns {void} Outputs comprehensive cleanup summary to console and logs
 * 
 * @example
 * logCleanupSummary(results, { verbose: true, correlationId: 'cleanup_123' });
 */
function logCleanupSummary(cleanupResults, options = {}) {
    try {
        // Create logger instance for summary reporting
        const appConfig = new AppConfig();
        const logger = new Logger({ appConfig });
        
        const operationId = options.correlationId || cleanupResults.operationId || 'unknown';
        
        // Format summary header with operation identification
        console.log('\n' + '='.repeat(80));
        console.log(`CLEANUP OPERATION SUMMARY - ${operationId.toUpperCase()}`);
        console.log('='.repeat(80));
        
        // Display cleanup type and configuration information
        if (options.type) {
            console.log(`Cleanup Type: ${options.type.toUpperCase()}`);
            console.log(`Description: ${CLEANUP_TYPES[options.type]?.description || 'Custom cleanup'}`);
        }
        
        console.log(`Operation Mode: ${options.dryRun ? 'DRY RUN (Simulation)' : 'EXECUTION'}`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log('-'.repeat(80));
        
        // Display cleanup statistics and counts
        const stats = cleanupResults.statistics || {};
        console.log('CLEANUP STATISTICS:');
        console.log(`  Total Targets Processed: ${stats.totalTargets || 0}`);
        console.log(`  Successfully Removed: ${stats.successCount || 0}`);
        console.log(`  Failed Removals: ${stats.failureCount || 0}`);
        console.log(`  Skipped Items: ${stats.skippedCount || 0}`);
        
        // Show disk space reclaimed information
        const totalSizeRemoved = stats.totalSizeRemoved || 0;
        if (totalSizeRemoved > 0) {
            console.log(`  Disk Space Reclaimed: ${formatFileSize(totalSizeRemoved)}`);
        }
        
        // Display operation timing and performance metrics
        if (stats.operationTime) {
            console.log(`  Total Operation Time: ${stats.operationTime}ms`);
            
            if (stats.averageTimePerTarget) {
                console.log(`  Average Time per Target: ${stats.averageTimePerTarget.toFixed(2)}ms`);
            }
        }
        
        console.log('-'.repeat(80));
        
        // Show successful removals in verbose mode
        if (options.verbose && cleanupResults.success && cleanupResults.success.length > 0) {
            console.log('SUCCESSFULLY REMOVED:');
            cleanupResults.success.forEach(item => {
                const sizeInfo = item.size > 0 ? ` (${formatFileSize(item.size)})` : '';
                console.log(`  ✓ ${item.path}${sizeInfo}`);
            });
            console.log('-'.repeat(80));
        }
        
        // Display cleanup failures with error details
        if (cleanupResults.failures && cleanupResults.failures.length > 0) {
            console.log('CLEANUP FAILURES:');
            cleanupResults.failures.forEach(failure => {
                console.log(`  ✗ ${failure.path}`);
                console.log(`    Error: ${failure.error}`);
                if (failure.errorCode) {
                    console.log(`    Code: ${failure.errorCode}`);
                }
            });
            console.log('-'.repeat(80));
        }
        
        // Show skipped items if any
        if (options.verbose && cleanupResults.skipped && cleanupResults.skipped.length > 0) {
            console.log('SKIPPED ITEMS:');
            cleanupResults.skipped.forEach(item => {
                console.log(`  - ${item.path} (${item.reason})`);
            });
            console.log('-'.repeat(80));
        }
        
        // Display final cleanup status
        const successRate = stats.totalTargets > 0 ? 
            ((stats.successCount / stats.totalTargets) * 100).toFixed(1) : 0;
        
        let status = 'SUCCESS';
        if (stats.failureCount > 0) {
            status = stats.failureCount === stats.totalTargets ? 'FAILED' : 'PARTIAL';
        } else if (stats.totalTargets === 0) {
            status = 'NO_TARGETS';
        }
        
        console.log(`FINAL STATUS: ${status}`);
        console.log(`Success Rate: ${successRate}%`);
        
        if (options.dryRun) {
            console.log('\nNOTE: This was a dry run simulation. No files were actually removed.');
        }
        
        console.log('='.repeat(80) + '\n');
        
        // Log structured summary for application logging
        logger.info('Cleanup operation summary', {
            operationId,
            type: options.type,
            mode: options.dryRun ? 'dry_run' : 'execution',
            statistics: stats,
            status,
            successRate: parseFloat(successRate)
        });
        
    } catch (error) {
        console.error('Failed to log cleanup summary:', error.message);
    }
}

/**
 * Handles cleanup operation errors by logging detailed error information and
 * determining recovery strategies with appropriate exit code assignment.
 * 
 * @param {Array} errors - Array of cleanup operation errors
 * @param {Object} options - Error handling options and configuration
 * @returns {number} Exit code representing error severity (0-255)
 * 
 * @example
 * const exitCode = handleCleanupErrors(errors, { verbose: true });
 * process.exit(exitCode);
 */
function handleCleanupErrors(errors, options = {}) {
    try {
        // Create logger instance for error reporting
        const appConfig = new AppConfig();
        const logger = new Logger({ appConfig });
        
        // Initialize error analysis and categorization
        const errorAnalysis = {
            critical: [],
            recoverable: [],
            warnings: [],
            totalErrors: errors.length
        };
        
        // Categorize errors by severity and type
        errors.forEach(error => {
            const errorType = error.type || 'unknown';
            const errorSeverity = error.severity || 'error';
            
            if (errorType === 'access_error' || errorType === 'permission_error') {
                errorAnalysis.critical.push(error);
            } else if (errorType === 'read_error' || errorType === 'scan_error') {
                errorAnalysis.recoverable.push(error);
            } else if (errorSeverity === 'warning') {
                errorAnalysis.warnings.push(error);
            } else {
                errorAnalysis.recoverable.push(error);
            }
        });
        
        // Display error summary header
        console.error('\n' + '!'.repeat(80));
        console.error('CLEANUP OPERATION ERRORS');
        console.error('!'.repeat(80));
        
        // Show error count summary
        console.error(`Total Errors: ${errorAnalysis.totalErrors}`);
        console.error(`Critical Errors: ${errorAnalysis.critical.length}`);
        console.error(`Recoverable Errors: ${errorAnalysis.recoverable.length}`);
        console.error(`Warnings: ${errorAnalysis.warnings.length}`);
        console.error('-'.repeat(80));
        
        // Display critical errors with detailed information
        if (errorAnalysis.critical.length > 0) {
            console.error('CRITICAL ERRORS:');
            errorAnalysis.critical.forEach((error, index) => {
                console.error(`${index + 1}. ${error.path || 'Unknown path'}`);
                console.error(`   Error: ${error.error || error.message || 'Unknown error'}`);
                console.error(`   Type: ${error.type || 'unknown'}`);
                if (error.context) {
                    console.error(`   Context: ${JSON.stringify(error.context)}`);
                }
            });
            console.error('-'.repeat(80));
        }
        
        // Display recoverable errors if verbose mode enabled
        if (options.verbose && errorAnalysis.recoverable.length > 0) {
            console.error('RECOVERABLE ERRORS:');
            errorAnalysis.recoverable.forEach((error, index) => {
                console.error(`${index + 1}. ${error.path || 'Unknown path'}`);
                console.error(`   Error: ${error.error || error.message || 'Unknown error'}`);
            });
            console.error('-'.repeat(80));
        }
        
        // Provide error resolution recommendations
        console.error('RECOMMENDATIONS:');
        if (errorAnalysis.critical.length > 0) {
            console.error('• Check file permissions and access rights for critical errors');
            console.error('• Run cleanup with elevated permissions if necessary');
            console.error('• Verify cleanup targets are not in use by other processes');
        }
        if (errorAnalysis.recoverable.length > 0) {
            console.error('• Retry cleanup operation for recoverable errors');
            console.error('• Use --verbose flag to see detailed error information');
        }
        console.error('• Review cleanup patterns and exclude protected files');
        console.error('• Use --dry-run to preview cleanup operations before execution');
        console.error('!'.repeat(80) + '\n');
        
        // Log structured error information
        logger.error('Cleanup operation errors encountered', {
            errorAnalysis,
            recommendations: 'Check permissions and retry operation',
            totalErrors: errorAnalysis.totalErrors,
            criticalCount: errorAnalysis.critical.length
        });
        
        // Determine appropriate exit code based on error severity
        let exitCode = 0; // Success by default
        
        if (errorAnalysis.critical.length > 0) {
            exitCode = 2; // Critical errors
        } else if (errorAnalysis.recoverable.length > 0) {
            exitCode = 1; // Recoverable errors
        } else if (errorAnalysis.warnings.length > 0) {
            exitCode = 0; // Warnings don't affect exit code
        }
        
        return exitCode;
        
    } catch (handlingError) {
        console.error('Failed to handle cleanup errors:', handlingError.message);
        return 3; // Error handling failure
    }
}

/**
 * Calculates the amount of disk space reclaimed by cleanup operations for
 * comprehensive reporting and analysis of cleanup impact.
 * 
 * @param {Array} removedItems - Array of successfully removed items with size information
 * @returns {Object} Disk space statistics with detailed breakdown and formatted values
 * 
 * @example
 * const spaceStats = calculateDiskSpaceReclaimed(results.success);
 * console.log('Space reclaimed:', spaceStats.totalFormatted);
 */
function calculateDiskSpaceReclaimed(removedItems) {
    try {
        // Initialize disk space calculation statistics
        const spaceStats = {
            totalBytes: 0,
            fileCount: 0,
            directoryCount: 0,
            breakdown: {
                logFiles: 0,
                nodeModules: 0,
                coverageFiles: 0,
                systemFiles: 0,
                other: 0
            }
        };
        
        // Calculate total space and categorize by file type
        removedItems.forEach(item => {
            const size = item.size || 0;
            spaceStats.totalBytes += size;
            
            // Count items by type
            if (item.type === 'file') {
                spaceStats.fileCount++;
            } else if (item.type === 'directory') {
                spaceStats.directoryCount++;
            }
            
            // Categorize space savings by file type
            const path = item.path.toLowerCase();
            if (path.includes('.log') || path.includes('debug')) {
                spaceStats.breakdown.logFiles += size;
            } else if (path.includes('node_modules')) {
                spaceStats.breakdown.nodeModules += size;
            } else if (path.includes('coverage') || path.includes('.nyc')) {
                spaceStats.breakdown.coverageFiles += size;
            } else if (path.includes('.ds_store') || path.includes('thumbs.db') || 
                      path.includes('.vscode') || path.includes('.idea')) {
                spaceStats.breakdown.systemFiles += size;
            } else {
                spaceStats.breakdown.other += size;
            }
        });
        
        // Format space statistics for human-readable display
        const formattedStats = {
            totalBytes: spaceStats.totalBytes,
            totalFormatted: formatFileSize(spaceStats.totalBytes),
            totalItems: spaceStats.fileCount + spaceStats.directoryCount,
            fileCount: spaceStats.fileCount,
            directoryCount: spaceStats.directoryCount,
            
            // Format breakdown by category
            breakdown: {
                logFiles: {
                    bytes: spaceStats.breakdown.logFiles,
                    formatted: formatFileSize(spaceStats.breakdown.logFiles),
                    percentage: spaceStats.totalBytes > 0 ? 
                        ((spaceStats.breakdown.logFiles / spaceStats.totalBytes) * 100).toFixed(1) : 0
                },
                nodeModules: {
                    bytes: spaceStats.breakdown.nodeModules,
                    formatted: formatFileSize(spaceStats.breakdown.nodeModules),
                    percentage: spaceStats.totalBytes > 0 ? 
                        ((spaceStats.breakdown.nodeModules / spaceStats.totalBytes) * 100).toFixed(1) : 0
                },
                coverageFiles: {
                    bytes: spaceStats.breakdown.coverageFiles,
                    formatted: formatFileSize(spaceStats.breakdown.coverageFiles),
                    percentage: spaceStats.totalBytes > 0 ? 
                        ((spaceStats.breakdown.coverageFiles / spaceStats.totalBytes) * 100).toFixed(1) : 0
                },
                systemFiles: {
                    bytes: spaceStats.breakdown.systemFiles,
                    formatted: formatFileSize(spaceStats.breakdown.systemFiles),
                    percentage: spaceStats.totalBytes > 0 ? 
                        ((spaceStats.breakdown.systemFiles / spaceStats.totalBytes) * 100).toFixed(1) : 0
                },
                other: {
                    bytes: spaceStats.breakdown.other,
                    formatted: formatFileSize(spaceStats.breakdown.other),
                    percentage: spaceStats.totalBytes > 0 ? 
                        ((spaceStats.breakdown.other / spaceStats.totalBytes) * 100).toFixed(1) : 0
                }
            }
        };
        
        return formattedStats;
        
    } catch (error) {
        return {
            totalBytes: 0,
            totalFormatted: '0 B',
            totalItems: 0,
            error: `Failed to calculate disk space: ${error.message}`
        };
    }
}

/**
 * Main cleanup function that orchestrates file and directory removal based on
 * configured patterns and options with comprehensive error handling and reporting.
 * 
 * @param {Object} options - Cleanup configuration options
 * @returns {Promise<Object>} Promise that resolves to cleanup results with statistics
 * 
 * @example
 * const results = await cleanupFiles({ type: 'logs', dryRun: false, verbose: true });
 * console.log('Cleanup completed:', results.success);
 */
async function cleanupFiles(options = {}) {
    const operationStartTime = Date.now();
    const operationId = options.correlationId || generateCorrelationId();
    
    try {
        // Create logger and configuration instances for operation tracking
        const appConfig = new AppConfig();
        const logger = new Logger({ appConfig });
        
        // Merge options with defaults and validate configuration
        const cleanupOptions = {
            ...DEFAULT_CLEANUP_OPTIONS,
            ...options,
            correlationId: operationId
        };
        
        logger.info('Starting cleanup operation', {
            operationId,
            type: cleanupOptions.type,
            dryRun: cleanupOptions.dryRun,
            verbose: cleanupOptions.verbose,
            patterns: cleanupOptions.patterns
        });
        
        // Step 1: Parse and validate cleanup options
        const validatedOptions = parseCleanupOptions([]);
        Object.assign(cleanupOptions, validatedOptions);
        
        // Step 2: Discover cleanup targets based on patterns
        logger.info('Discovering cleanup targets', { operationId, patterns: cleanupOptions.patterns });
        
        const discoveryResults = discoverCleanupTargets(cleanupOptions.patterns, {
            projectRoot: process.cwd(),
            verbose: cleanupOptions.verbose,
            followSymlinks: cleanupOptions.followSymlinks
        });
        
        if (discoveryResults.errors.length > 0) {
            logger.warn('Discovery errors encountered', {
                operationId,
                errorCount: discoveryResults.errors.length,
                errors: discoveryResults.errors
            });
        }
        
        // Step 3: Validate cleanup safety and boundaries
        logger.info('Validating cleanup safety', { 
            operationId, 
            targetCount: discoveryResults.targets.length 
        });
        
        const safetyValidation = validateCleanupSafety(discoveryResults.targets, {
            ...cleanupOptions,
            typeConfig: cleanupOptions.typeConfig,
            projectRoot: process.cwd()
        });
        
        if (!safetyValidation.approved) {
            const safetyError = new Error('Cleanup operation failed safety validation');
            safetyError.validationResults = safetyValidation;
            throw safetyError;
        }
        
        if (safetyValidation.warnings.length > 0) {
            logger.warn('Safety warnings detected', {
                operationId,
                warnings: safetyValidation.warnings
            });
        }
        
        // Step 4: Execute cleanup operations or dry-run simulation
        logger.info('Executing cleanup operations', {
            operationId,
            mode: cleanupOptions.dryRun ? 'dry_run' : 'execution',
            targetCount: discoveryResults.targets.length
        });
        
        const executionResults = await executeCleanupOperation(discoveryResults.targets, cleanupOptions);
        
        // Step 5: Calculate disk space reclaimed
        const spaceStats = calculateDiskSpaceReclaimed(executionResults.success || []);
        
        // Step 6: Compile comprehensive cleanup results
        const totalOperationTime = Date.now() - operationStartTime;
        
        const cleanupResults = {
            operationId,
            success: executionResults.success || [],
            failures: executionResults.failures || [],
            skipped: executionResults.skipped || [],
            
            // Comprehensive statistics
            statistics: {
                ...executionResults.statistics,
                totalOperationTime: `${totalOperationTime}ms`,
                discoveryTime: discoveryResults.statistics?.discoveryTime,
                executionTime: executionResults.statistics?.operationTime,
                
                // Discovery statistics
                scannedDirectories: discoveryResults.statistics?.scannedDirectories || 0,
                scannedFiles: discoveryResults.statistics?.scannedFiles || 0,
                
                // Safety statistics
                safetyWarnings: safetyValidation.warnings.length,
                protectedFiles: safetyValidation.statistics?.protectedFiles || 0
            },
            
            // Disk space analysis
            diskSpace: spaceStats,
            
            // Operation metadata
            configuration: {
                type: cleanupOptions.type,
                dryRun: cleanupOptions.dryRun,
                verbose: cleanupOptions.verbose,
                patterns: cleanupOptions.patterns
            },
            
            // Error information
            discoveryErrors: discoveryResults.errors || [],
            safetyWarnings: safetyValidation.warnings || [],
            operationError: executionResults.operationError || null
        };
        
        // Step 7: Log cleanup operation summary
        logCleanupSummary(cleanupResults, cleanupOptions);
        
        // Step 8: Log final operation status
        logger.info('Cleanup operation completed', {
            operationId,
            totalTime: `${totalOperationTime}ms`,
            status: executionResults.statistics?.failureCount > 0 ? 'completed_with_errors' : 'success',
            successCount: executionResults.statistics?.successCount || 0,
            failureCount: executionResults.statistics?.failureCount || 0,
            diskSpaceReclaimed: spaceStats.totalFormatted
        });
        
        return cleanupResults;
        
    } catch (error) {
        // Handle comprehensive cleanup operation failures
        const totalOperationTime = Date.now() - operationStartTime;
        
        const errorResults = {
            operationId,
            success: false,
            error: {
                message: error.message,
                type: error.constructor.name,
                stack: error.stack,
                validationResults: error.validationResults || null
            },
            statistics: {
                totalOperationTime: `${totalOperationTime}ms`,
                successCount: 0,
                failureCount: 1
            }
        };
        
        // Log critical cleanup failure
        try {
            const appConfig = new AppConfig();
            const logger = new Logger({ appConfig });
            
            logger.error('Cleanup operation failed', {
                operationId,
                error: error.message,
                totalTime: `${totalOperationTime}ms`,
                type: options.type || 'unknown'
            }, error);
            
        } catch (loggingError) {
            console.error('Cleanup failed and logging failed:', error.message);
        }
        
        return errorResults;
    }
}

// ============================================================================
// CLEANUP MANAGER CLASS
// ============================================================================

/**
 * Main cleanup management class that orchestrates file system cleanup operations,
 * manages cleanup configuration, and provides comprehensive cleanup reporting for
 * the Node.js tutorial application with educational clarity and production readiness.
 */
class CleanupManager {
    /**
     * Initializes the cleanup manager with configuration and sets up logging
     * and pattern management for comprehensive cleanup operations.
     * 
     * @param {Object} config - Cleanup manager configuration options
     */
    constructor(config = {}) {
        try {
            // Store cleanup configuration with validation
            this.config = {
                ...DEFAULT_CLEANUP_OPTIONS,
                ...config
            };
            
            // Initialize application configuration and logger
            this.appConfig = config.appConfig || new AppConfig();
            this.logger = new Logger({ appConfig: this.appConfig });
            
            // Set up cleanup patterns based on configuration
            this.cleanupPatterns = config.patterns || CLEANUP_PATTERNS;
            
            // Configure operation modes and safety settings
            this.dryRun = config.dryRun || false;
            this.verbose = config.verbose || false;
            
            // Initialize cleanup results tracking
            this.results = {
                operations: [],
                totalStats: {
                    totalOperations: 0,
                    successfulOperations: 0,
                    failedOperations: 0,
                    totalFilesRemoved: 0,
                    totalSpaceReclaimed: 0
                }
            };
            
            // Set up safety checks and cleanup boundaries
            this.projectRoot = config.projectRoot || process.cwd();
            this.safetyEnabled = config.safetyEnabled !== false;
            
            this.logger.info('CleanupManager initialized', {
                dryRun: this.dryRun,
                verbose: this.verbose,
                patterns: this.cleanupPatterns.length,
                safetyEnabled: this.safetyEnabled
            });
            
        } catch (error) {
            throw new Error(`CleanupManager initialization failed: ${error.message}`);
        }
    }
    
    /**
     * Executes the complete cleanup operation with specified configuration and
     * returns comprehensive cleanup results with statistics and error reporting.
     * 
     * @param {Object} options - Execution options for cleanup operation
     * @returns {Promise<Object>} Complete cleanup operation results with statistics
     */
    async execute(options = {}) {
        const executionId = generateCorrelationId();
        const startTime = Date.now();
        
        try {
            // Merge execution options with manager configuration
            const executionOptions = {
                ...this.config,
                ...options,
                correlationId: executionId,
                patterns: options.patterns || this.cleanupPatterns
            };
            
            this.logger.info('Starting cleanup execution', {
                executionId,
                type: executionOptions.type,
                dryRun: executionOptions.dryRun,
                patternsCount: executionOptions.patterns.length
            });
            
            // Execute comprehensive cleanup operation
            const cleanupResults = await cleanupFiles(executionOptions);
            
            // Update manager statistics and tracking
            this.results.operations.push(cleanupResults);
            this.results.totalStats.totalOperations++;
            
            if (cleanupResults.statistics?.failureCount > 0) {
                this.results.totalStats.failedOperations++;
            } else {
                this.results.totalStats.successfulOperations++;
            }
            
            this.results.totalStats.totalFilesRemoved += cleanupResults.statistics?.successCount || 0;
            this.results.totalStats.totalSpaceReclaimed += cleanupResults.diskSpace?.totalBytes || 0;
            
            const executionTime = Date.now() - startTime;
            
            this.logger.info('Cleanup execution completed', {
                executionId,
                executionTime: `${executionTime}ms`,
                success: cleanupResults.statistics?.failureCount === 0,
                filesRemoved: cleanupResults.statistics?.successCount || 0,
                spaceReclaimed: cleanupResults.diskSpace?.totalFormatted || '0 B'
            });
            
            return cleanupResults;
            
        } catch (error) {
            this.results.totalStats.failedOperations++;
            
            this.logger.error('Cleanup execution failed', {
                executionId,
                error: error.message,
                executionTime: `${Date.now() - startTime}ms`
            }, error);
            
            throw error;
        }
    }
    
    /**
     * Removes node_modules directories and package lock files with comprehensive
     * dependency cleanup and validation.
     * 
     * @param {Object} options - Node modules cleanup options
     * @returns {Promise<Object>} Node modules cleanup results with statistics
     */
    async cleanNodeModules(options = {}) {
        const nodeModulesOptions = {
            ...options,
            type: 'deps',
            patterns: ['node_modules', 'package-lock.json', 'yarn.lock'],
            correlationId: generateCorrelationId()
        };
        
        this.logger.info('Starting node_modules cleanup', {
            correlationId: nodeModulesOptions.correlationId,
            dryRun: nodeModulesOptions.dryRun
        });
        
        return await this.execute(nodeModulesOptions);
    }
    
    /**
     * Removes log files, debug files, and development logging artifacts with
     * comprehensive log file cleanup and pattern matching.
     * 
     * @param {Object} options - Log file cleanup options
     * @returns {Promise<Object>} Log file cleanup results with statistics
     */
    async cleanLogFiles(options = {}) {
        const logCleanupOptions = {
            ...options,
            type: 'logs',
            patterns: ['*.log', 'npm-debug.log*', 'logs/', 'debug/', '*.log.*'],
            correlationId: generateCorrelationId()
        };
        
        this.logger.info('Starting log files cleanup', {
            correlationId: logCleanupOptions.correlationId,
            dryRun: logCleanupOptions.dryRun
        });
        
        return await this.execute(logCleanupOptions);
    }
    
    /**
     * Removes environment-specific configuration files and local development settings
     * with safety validation and confirmation requirements.
     * 
     * @param {Object} options - Environment file cleanup options
     * @returns {Promise<Object>} Environment file cleanup results with statistics
     */
    async cleanEnvironmentFiles(options = {}) {
        const envCleanupOptions = {
            ...options,
            type: 'env',
            patterns: ['.env.local', '.env.production', '.env.staging', '.env.test'],
            correlationId: generateCorrelationId(),
            requireConfirmation: true // Environment files require confirmation
        };
        
        this.logger.info('Starting environment files cleanup', {
            correlationId: envCleanupOptions.correlationId,
            dryRun: envCleanupOptions.dryRun,
            requireConfirmation: envCleanupOptions.requireConfirmation
        });
        
        return await this.execute(envCleanupOptions);
    }
    
    /**
     * Removes test coverage reports, coverage data, and testing artifacts with
     * comprehensive coverage cleanup and validation.
     * 
     * @param {Object} options - Coverage file cleanup options
     * @returns {Promise<Object>} Coverage file cleanup results with statistics
     */
    async cleanCoverageFiles(options = {}) {
        const coverageOptions = {
            ...options,
            type: 'coverage',
            patterns: ['coverage/', '.nyc_output/', 'lcov.info', '.coverage/', 'coverage.json'],
            correlationId: generateCorrelationId()
        };
        
        this.logger.info('Starting coverage files cleanup', {
            correlationId: coverageOptions.correlationId,
            dryRun: coverageOptions.dryRun
        });
        
        return await this.execute(coverageOptions);
    }
    
    /**
     * Removes OS-specific files, IDE configurations, and editor temporary files
     * with comprehensive system file cleanup and pattern matching.
     * 
     * @param {Object} options - System file cleanup options
     * @returns {Promise<Object>} System file cleanup results with statistics
     */
    async cleanSystemFiles(options = {}) {
        const systemOptions = {
            ...options,
            type: 'system',
            patterns: ['.DS_Store', 'Thumbs.db', '.vscode/', '.idea/', '*.swp', '*~', '.sass-cache/'],
            correlationId: generateCorrelationId()
        };
        
        this.logger.info('Starting system files cleanup', {
            correlationId: systemOptions.correlationId,
            dryRun: systemOptions.dryRun
        });
        
        return await this.execute(systemOptions);
    }
    
    /**
     * Generates comprehensive cleanup reports in multiple formats for analysis
     * and documentation with detailed statistics and recommendations.
     * 
     * @param {string} format - Report format ('console' or 'json')
     * @returns {string} Formatted cleanup report content
     */
    generateReport(format = 'console') {
        try {
            const reportData = {
                summary: {
                    totalOperations: this.results.totalStats.totalOperations,
                    successfulOperations: this.results.totalStats.successfulOperations,
                    failedOperations: this.results.totalStats.failedOperations,
                    totalFilesRemoved: this.results.totalStats.totalFilesRemoved,
                    totalSpaceReclaimed: formatFileSize(this.results.totalStats.totalSpaceReclaimed),
                    successRate: this.results.totalStats.totalOperations > 0 ? 
                        ((this.results.totalStats.successfulOperations / this.results.totalStats.totalOperations) * 100).toFixed(1) : 0
                },
                operations: this.results.operations.map(op => ({
                    operationId: op.operationId,
                    type: op.configuration?.type,
                    success: op.statistics?.failureCount === 0,
                    filesRemoved: op.statistics?.successCount || 0,
                    spaceReclaimed: op.diskSpace?.totalFormatted || '0 B',
                    operationTime: op.statistics?.totalOperationTime
                })),
                timestamp: new Date().toISOString(),
                configuration: {
                    dryRun: this.dryRun,
                    verbose: this.verbose,
                    safetyEnabled: this.safetyEnabled,
                    patterns: this.cleanupPatterns.length
                }
            };
            
            if (format === 'json') {
                return JSON.stringify(reportData, null, 2);
            }
            
            // Generate console format report
            let report = '\n' + '='.repeat(80) + '\n';
            report += 'CLEANUP MANAGER SUMMARY REPORT\n';
            report += '='.repeat(80) + '\n';
            report += `Generated: ${reportData.timestamp}\n`;
            report += `Configuration: ${this.dryRun ? 'DRY RUN' : 'EXECUTION'} | Safety: ${this.safetyEnabled ? 'ENABLED' : 'DISABLED'}\n`;
            report += '-'.repeat(80) + '\n';
            
            report += 'SUMMARY STATISTICS:\n';
            report += `  Total Operations: ${reportData.summary.totalOperations}\n`;
            report += `  Successful Operations: ${reportData.summary.successfulOperations}\n`;
            report += `  Failed Operations: ${reportData.summary.failedOperations}\n`;
            report += `  Success Rate: ${reportData.summary.successRate}%\n`;
            report += `  Total Files Removed: ${reportData.summary.totalFilesRemoved}\n`;
            report += `  Total Space Reclaimed: ${reportData.summary.totalSpaceReclaimed}\n`;
            report += '-'.repeat(80) + '\n';
            
            if (reportData.operations.length > 0) {
                report += 'OPERATION HISTORY:\n';
                reportData.operations.forEach((op, index) => {
                    report += `${index + 1}. ${op.operationId} (${op.type?.toUpperCase()})\n`;
                    report += `   Status: ${op.success ? 'SUCCESS' : 'FAILED'}\n`;
                    report += `   Files Removed: ${op.filesRemoved}\n`;
                    report += `   Space Reclaimed: ${op.spaceReclaimed}\n`;
                    report += `   Operation Time: ${op.operationTime}\n`;
                });
                report += '-'.repeat(80) + '\n';
            }
            
            report += '='.repeat(80) + '\n';
            return report;
            
        } catch (error) {
            return `Report generation failed: ${error.message}`;
        }
    }
}

// ============================================================================
// CLEANUP CONFIGURATION CLASS
// ============================================================================

/**
 * Configuration management class for cleanup operation settings, pattern definitions,
 * and safety parameters with comprehensive validation and educational clarity.
 */
class CleanupConfiguration {
    /**
     * Initializes cleanup configuration with defaults and validates settings for
     * safe and predictable cleanup behavior.
     * 
     * @param {Object} options - Configuration options for cleanup operations
     */
    constructor(options = {}) {
        try {
            // Set default cleanup configuration values
            this.patterns = options.patterns || [...CLEANUP_PATTERNS];
            this.dryRun = options.dryRun || false;
            this.verbose = options.verbose || false;
            this.safetyLimits = options.safetyLimits || {
                maxFileSize: MAX_SINGLE_FILE_SIZE,
                requireConfirmation: false,
                allowOutsideProject: false
            };
            
            // Configure exclusion patterns for protected files
            this.excludePatterns = options.excludePatterns || [...PROTECTED_PATTERNS];
            
            // Apply environment-specific configuration overrides
            const environment = options.environment || process.env.NODE_ENV || 'development';
            this._applyEnvironmentDefaults(environment);
            
            // Initialize cleanup patterns and exclusion rules
            this._initializePatterns();
            
            // Validate configuration settings and safety parameters
            this._validateConfiguration();
            
        } catch (error) {
            throw new Error(`CleanupConfiguration initialization failed: ${error.message}`);
        }
    }
    
    /**
     * Returns the complete list of cleanup patterns based on configuration and
     * gitignore rules with comprehensive pattern validation.
     * 
     * @returns {Array} Array of cleanup patterns for file discovery
     */
    getCleanupPatterns() {
        try {
            // Combine base patterns with environment-specific patterns
            const allPatterns = [...this.patterns];
            
            // Add environment-specific patterns
            if (process.env.NODE_ENV === 'development') {
                allPatterns.push('.cache/', 'tmp/', '*.tmp');
            } else if (process.env.NODE_ENV === 'production') {
                allPatterns.push('*.log', 'debug/');
            }
            
            // Apply pattern exclusions and safety filters
            const filteredPatterns = allPatterns.filter(pattern => {
                return !this.excludePatterns.some(exclude => {
                    if (exclude.includes('*')) {
                        const regexPattern = exclude.replace(/\*/g, '.*');
                        const regex = new RegExp(`^${regexPattern}$`, 'i');
                        return regex.test(pattern);
                    }
                    return pattern === exclude;
                });
            });
            
            // Validate pattern format and safety
            const validatedPatterns = filteredPatterns.filter(pattern => {
                // Ensure pattern is safe and properly formatted
                return pattern && typeof pattern === 'string' && pattern.trim().length > 0;
            });
            
            return validatedPatterns;
            
        } catch (error) {
            console.error('Failed to get cleanup patterns:', error.message);
            return [...CLEANUP_PATTERNS]; // Return safe defaults
        }
    }
    
    /**
     * Validates the cleanup configuration for safety and completeness with
     * comprehensive validation rules and error reporting.
     * 
     * @returns {boolean} true if configuration is valid and safe
     */
    validate() {
        try {
            const validationErrors = [];
            
            // Check required configuration properties
            if (!Array.isArray(this.patterns) || this.patterns.length === 0) {
                validationErrors.push('Cleanup patterns must be a non-empty array');
            }
            
            if (typeof this.dryRun !== 'boolean') {
                validationErrors.push('dryRun must be a boolean value');
            }
            
            if (typeof this.verbose !== 'boolean') {
                validationErrors.push('verbose must be a boolean value');
            }
            
            // Validate cleanup patterns format and safety
            this.patterns.forEach((pattern, index) => {
                if (typeof pattern !== 'string' || pattern.trim().length === 0) {
                    validationErrors.push(`Pattern at index ${index} must be a non-empty string`);
                }
                
                // Check for dangerous patterns
                const dangerousPatterns = ['*', '/', '/*', '\\', 'C:\\', '/usr', '/bin'];
                if (dangerousPatterns.includes(pattern)) {
                    validationErrors.push(`Dangerous pattern detected: ${pattern}`);
                }
            });
            
            // Validate safety limits and boundaries
            if (!this.safetyLimits || typeof this.safetyLimits !== 'object') {
                validationErrors.push('safetyLimits must be a valid object');
            } else {
                if (typeof this.safetyLimits.maxFileSize !== 'number' || this.safetyLimits.maxFileSize <= 0) {
                    validationErrors.push('safetyLimits.maxFileSize must be a positive number');
                }
                
                if (typeof this.safetyLimits.requireConfirmation !== 'boolean') {
                    validationErrors.push('safetyLimits.requireConfirmation must be boolean');
                }
            }
            
            // Check exclusion patterns validity
            if (!Array.isArray(this.excludePatterns)) {
                validationErrors.push('excludePatterns must be an array');
            }
            
            // Store validation errors for retrieval
            this._validationErrors = validationErrors;
            
            // Return validation status
            return validationErrors.length === 0;
            
        } catch (error) {
            this._validationErrors = [`Configuration validation failed: ${error.message}`];
            return false;
        }
    }
    
    /**
     * Returns validation errors from the last validation run.
     * 
     * @returns {Array} Array of validation error messages
     */
    getValidationErrors() {
        return this._validationErrors || [];
    }
    
    /**
     * Applies environment-specific configuration defaults.
     * @private
     */
    _applyEnvironmentDefaults(environment) {
        const env = environment.toLowerCase();
        
        if (env === 'development') {
            this.verbose = true;
            this.safetyLimits.requireConfirmation = false;
        } else if (env === 'production') {
            this.verbose = false;
            this.safetyLimits.requireConfirmation = true;
        } else if (env === 'test') {
            this.verbose = false;
            this.dryRun = true; // Default to dry run for tests
        }
    }
    
    /**
     * Initializes and validates cleanup patterns.
     * @private
     */
    _initializePatterns() {
        // Remove duplicate patterns
        this.patterns = [...new Set(this.patterns)];
        
        // Sort patterns by specificity (more specific first)
        this.patterns.sort((a, b) => {
            const aSpecific = (a.match(/\*/g) || []).length;
            const bSpecific = (b.match(/\*/g) || []).length;
            return aSpecific - bSpecific;
        });
    }
    
    /**
     * Validates configuration settings for safety.
     * @private
     */
    _validateConfiguration() {
        // Ensure minimum safety requirements are met
        if (!this.safetyLimits) {
            this.safetyLimits = {
                maxFileSize: MAX_SINGLE_FILE_SIZE,
                requireConfirmation: false,
                allowOutsideProject: false
            };
        }
        
        // Ensure exclude patterns include critical protections
        const criticalProtections = ['package.json', 'src/', '.git'];
        criticalProtections.forEach(protection => {
            if (!this.excludePatterns.includes(protection)) {
                this.excludePatterns.push(protection);
            }
        });
    }
}

// ============================================================================
// COMMAND LINE INTERFACE AND SCRIPT EXECUTION
// ============================================================================

/**
 * Shows usage information and command line help for the cleanup script.
 */
function showHelp() {
    console.log(`
Node.js Tutorial Application Cleanup Script

USAGE:
  node src/backend/scripts/clean.js [OPTIONS]

OPTIONS:
  --type=TYPE          Cleanup type: all, logs, deps, env, coverage, system (default: all)
  --dry-run           Preview cleanup without removing files
  --verbose           Enable verbose output and detailed logging
  --pattern=PATTERN   Add custom cleanup pattern (can be used multiple times)
  --exclude=PATTERN   Exclude specific patterns from cleanup
  --timeout=SECONDS   Set operation timeout in seconds (default: 30)
  --no-confirm        Skip confirmation prompts
  --help, -h          Show this help message
  --version           Show version information

CLEANUP TYPES:
  all        Comprehensive cleanup of all temporary files and artifacts
  logs       Remove log files and debug output
  deps       Remove node_modules and package lock files
  env        Remove environment-specific configuration files
  coverage   Remove test coverage reports and data
  system     Remove OS-specific and IDE files

EXAMPLES:
  node src/backend/scripts/clean.js --type=logs --verbose
  node src/backend/scripts/clean.js --dry-run --type=all
  node src/backend/scripts/clean.js --pattern="*.tmp" --exclude="important.tmp"

SAFETY FEATURES:
  • Boundary checks ensure operations stay within project directory
  • Protected file patterns prevent removal of critical files
  • Dry-run mode allows preview of cleanup operations
  • Comprehensive logging tracks all operations and results

For more information, visit the Node.js Tutorial documentation.
`);
}

/**
 * Shows version information for the cleanup script.
 */
function showVersion() {
    console.log(`
Node.js Tutorial Cleanup Script
Version: 1.0.0
Node.js: ${process.version}
Platform: ${process.platform} ${process.arch}
`);
}

/**
 * Main script execution function when run directly from command line.
 */
async function main() {
    try {
        // Parse command line arguments
        const options = parseCleanupOptions();
        
        // Handle help and version requests
        if (options.showHelp) {
            showHelp();
            process.exit(0);
        }
        
        if (options.showVersion) {
            showVersion();
            process.exit(0);
        }
        
        // Handle parsing errors
        if (options.error) {
            console.error(`Error: ${options.error}`);
            console.error('Use --help for usage information.');
            process.exit(1);
        }
        
        // Create and configure cleanup manager
        const cleanupManager = new CleanupManager({
            dryRun: options.dryRun,
            verbose: options.verbose,
            patterns: options.patterns,
            safetyEnabled: true
        });
        
        // Execute cleanup operation with comprehensive error handling
        console.log('Starting cleanup operation...\n');
        const results = await cleanupManager.execute(options);
        
        // Generate and display final report
        if (options.verbose) {
            const report = cleanupManager.generateReport('console');
            console.log(report);
        }
        
        // Determine exit code based on results
        const exitCode = results.statistics?.failureCount > 0 ? 1 : 0;
        
        if (exitCode === 0) {
            console.log('✓ Cleanup operation completed successfully!');
        } else {
            console.error('✗ Cleanup operation completed with errors.');
            
            // Handle and report errors
            const errors = [
                ...results.discoveryErrors || [],
                ...results.safetyWarnings || [],
                ...(results.operationError ? [results.operationError] : [])
            ];
            
            if (errors.length > 0) {
                const errorExitCode = handleCleanupErrors(errors, options);
                process.exit(errorExitCode);
            }
        }
        
        process.exit(exitCode);
        
    } catch (error) {
        console.error('Fatal error during cleanup operation:', error.message);
        
        if (process.env.NODE_ENV === 'development') {
            console.error('Stack trace:', error.stack);
        }
        
        process.exit(3);
    }
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// Export main cleanup function for standalone script usage
export { cleanupFiles };

// Export command line argument parsing utility
export { parseCleanupOptions };

// Export file discovery utility function
export { discoverCleanupTargets };

// Export cleanup operation execution utility
export { executeCleanupOperation };

// Export validation and safety functions
export { validateCleanupSafety };

// Export error handling utilities
export { handleCleanupErrors };

// Export disk space calculation utility
export { calculateDiskSpaceReclaimed };

// Export logging and reporting functions
export { logCleanupSummary };

// Export utility functions
export { formatFileSize, generateCorrelationId };

// Export cleanup manager class
export { CleanupManager };

// Export cleanup configuration class
export { CleanupConfiguration };

// Export cleanup constants and configuration
export { CLEANUP_PATTERNS, CLEANUP_TYPES, DEFAULT_CLEANUP_OPTIONS };

// ============================================================================
// SCRIPT EXECUTION CHECK
// ============================================================================

// Execute main function if script is run directly (not imported)
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === __filename;

if (isMainModule) {
    main().catch(error => {
        console.error('Unhandled script execution error:', error.message);
        process.exit(3);
    });
}