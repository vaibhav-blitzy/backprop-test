/**
 * HTTP Headers Constants for Node.js Tutorial Application
 * 
 * This module provides centralized HTTP header constants for consistent header management
 * throughout the Node.js tutorial application. It implements standardized header naming
 * conventions with lowercase formatting for Node.js HTTP protocol compliance.
 * 
 * The constants are organized into logical groupings:
 * - HTTP_HEADERS: Standard HTTP header names in lowercase format
 * - CONTENT_TYPES: Content type values with charset specifications
 * - SECURITY_HEADERS: Security header values for web vulnerability protection
 * - CORS_HEADERS: Cross-Origin Resource Sharing header names
 * - SERVER_IDENTIFICATION: Server identification values without sensitive version info
 * 
 * Educational Value:
 * - Demonstrates HTTP protocol header naming conventions
 * - Shows proper content type specification with charset
 * - Illustrates security header implementation patterns
 * - Provides reusable constants for maintainable code
 * 
 * Production Readiness:
 * - Follows Node.js HTTP module lowercase header requirements
 * - Implements security best practices for web applications
 * - Supports proper CORS configuration for cross-origin requests
 * - Establishes standardized header management patterns
 */

/**
 * HTTP Header Names Constants
 * 
 * Standard HTTP header names formatted in lowercase as required by Node.js HTTP module.
 * These constants ensure consistent header naming across all application components
 * and prevent typos in header names that could cause protocol compliance issues.
 * 
 * Node.js HTTP message headers are represented as objects with lowercased keys
 * and unmodified values for proper HTTP/1.1 protocol compliance.
 */
const HTTP_HEADERS = {
  // Content-related headers
  CONTENT_TYPE: 'content-type',
  CONTENT_LENGTH: 'content-length',
  
  // Standard response headers
  DATE: 'date',
  SERVER: 'server',
  
  // Security headers
  X_CONTENT_TYPE_OPTIONS: 'x-content-type-options',
  
  // CORS headers for cross-origin resource sharing
  ACCESS_CONTROL_ALLOW_ORIGIN: 'access-control-allow-origin',
  ACCESS_CONTROL_ALLOW_METHODS: 'access-control-allow-methods',
  ACCESS_CONTROL_ALLOW_HEADERS: 'access-control-allow-headers',
  ACCESS_CONTROL_MAX_AGE: 'access-control-max-age',
  ACCESS_CONTROL_ALLOW_CREDENTIALS: 'access-control-allow-credentials',
  
  // HTTP method-related headers
  ALLOW: 'allow',
  
  // Connection management headers
  CONNECTION: 'connection',
  
  // Caching-related headers
  CACHE_CONTROL: 'cache-control',
  EXPIRES: 'expires',
  LAST_MODIFIED: 'last-modified',
  ETAG: 'etag'
};

/**
 * Content Type Constants
 * 
 * Standard content type values for HTTP Content-Type header with proper charset
 * specifications for international character support and proper response formatting.
 * These constants ensure consistent content type declaration across all responses.
 * 
 * Content types include charset specifications for proper character encoding,
 * particularly important for internationalization and UTF-8 support.
 */
const CONTENT_TYPES = {
  // Plain text content types
  TEXT_PLAIN: 'text/plain',
  TEXT_PLAIN_UTF8: 'text/plain; charset=utf-8',
  
  // JSON content types for API responses
  APPLICATION_JSON: 'application/json',
  APPLICATION_JSON_UTF8: 'application/json; charset=utf-8',
  
  // HTML content types for web pages
  TEXT_HTML: 'text/html',
  TEXT_HTML_UTF8: 'text/html; charset=utf-8',
  
  // Binary and form content types for future extensibility
  APPLICATION_OCTET_STREAM: 'application/octet-stream',
  MULTIPART_FORM_DATA: 'multipart/form-data',
  APPLICATION_X_WWW_FORM_URLENCODED: 'application/x-www-form-urlencoded'
};

/**
 * Security Header Values Constants
 * 
 * Security header values for protection against common web vulnerabilities
 * including MIME sniffing attacks, clickjacking, and XSS attacks. These values
 * follow industry security best practices and OWASP recommendations.
 * 
 * Security headers provide defense-in-depth protection against various
 * web application security threats and browser-based attacks.
 */
const SECURITY_HEADERS = {
  // X-Content-Type-Options header value to prevent MIME sniffing attacks
  X_CONTENT_TYPE_OPTIONS_VALUE: 'nosniff',
  
  // X-Frame-Options header value to prevent clickjacking attacks
  X_FRAME_OPTIONS_VALUE: 'DENY',
  
  // X-XSS-Protection header value for XSS attack protection
  X_XSS_PROTECTION_VALUE: '1; mode=block',
  
  // Content Security Policy default value for XSS protection
  CONTENT_SECURITY_POLICY_DEFAULT: "default-src 'self'",
  
  // HTTP Strict Transport Security for HTTPS enforcement
  STRICT_TRANSPORT_SECURITY: 'max-age=31536000; includeSubDomains'
};

/**
 * CORS Header Names Constants
 * 
 * Cross-Origin Resource Sharing (CORS) header name constants for proper
 * cross-origin request handling and preflight request configuration.
 * These constants support CORS middleware implementation and API development.
 * 
 * CORS headers control how browsers handle cross-origin requests and
 * determine which origins, methods, and headers are allowed for cross-origin access.
 */
const CORS_HEADERS = {
  // Origin control header for CORS requests
  ACCESS_CONTROL_ALLOW_ORIGIN: 'access-control-allow-origin',
  
  // HTTP methods allowed for CORS requests
  ACCESS_CONTROL_ALLOW_METHODS: 'access-control-allow-methods',
  
  // Headers allowed in CORS requests
  ACCESS_CONTROL_ALLOW_HEADERS: 'access-control-allow-headers',
  
  // Preflight cache duration for CORS requests
  ACCESS_CONTROL_MAX_AGE: 'access-control-max-age',
  
  // Credentials support for CORS requests
  ACCESS_CONTROL_ALLOW_CREDENTIALS: 'access-control-allow-credentials'
};

/**
 * Server Identification Constants
 * 
 * Server identification values for HTTP Server header that provide necessary
 * identification without exposing sensitive version information that could
 * be used for security reconnaissance attacks.
 * 
 * Server identification follows security best practices by providing
 * minimal information disclosure while maintaining HTTP protocol compliance.
 */
const SERVER_IDENTIFICATION = {
  // Server name for identification without sensitive details
  SERVER_NAME: 'Node.js Tutorial Server',
  
  // Generic version identifier for server header
  SERVER_VERSION: '1.0.0',
  
  // Complete server signature for HTTP Server header
  SERVER_SIGNATURE: 'Node.js Tutorial Server/1.0.0'
};

// Export all constant objects for use throughout the application
module.exports = {
  HTTP_HEADERS,
  CONTENT_TYPES,
  SECURITY_HEADERS,
  CORS_HEADERS,
  SERVER_IDENTIFICATION
};