# Node.js Tutorial HTTP Server API Documentation

**API Version:** 1.0.0  
**Documentation Version:** 1.0.0  
**Base URL:** http://localhost:3000  
**Content Types:** text/plain, application/json  
**Last Updated:** 2024-12-19

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication) 
3. [Endpoints](#endpoints)
   - [GET /hello](#get-hello)
4. [Status Codes](#status-codes)
5. [Error Handling](#error-handling)
6. [Examples](#examples)
7. [Educational Content](#educational-content)

---

## Overview

The Node.js Tutorial HTTP Server is an educational application designed to demonstrate fundamental web server concepts using Node.js's built-in HTTP module. This API provides a single endpoint for learning HTTP protocol fundamentals, request-response cycles, and server development patterns.

### Purpose
- **Educational Resource**: Teaches Node.js HTTP server development basics
- **Tutorial Application**: Demonstrates proper HTTP protocol implementation
- **Learning Foundation**: Provides hands-on experience with web server concepts

### Key Features
- Single hello endpoint demonstration
- Comprehensive HTTP status code handling
- Educational error response patterns
- Production-ready code architecture
- Zero external dependencies approach

### Technology Stack
- **Runtime**: Node.js v22.x LTS
- **HTTP Module**: Node.js built-in HTTP module
- **Architecture**: Single-threaded event loop
- **Dependencies**: Zero external dependencies

---

## Authentication

**No authentication required** for this tutorial application.

> **Educational Note**: Production APIs typically require authentication mechanisms such as API keys, JWT tokens, or OAuth 2.0. This tutorial omits authentication for educational simplicity and focus on core HTTP server concepts.

---

## Endpoints

### GET /hello

Returns a simple "Hello world" message demonstrating basic HTTP GET endpoint implementation.

#### Request Specification

```http
GET /hello HTTP/1.1
Host: localhost:3000
```

**Method**: `GET`  
**Path**: `/hello`  
**Parameters**: None  
**Request Headers**: None required  
**Request Body**: None

#### Response Specification

**Success Response (200 OK)**

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Content-Length: 11
Date: Thu, 19 Dec 2024 10:30:00 GMT
Server: Node.js Tutorial Server/1.0.0
X-Content-Type-Options: nosniff

Hello world
```

**Response Headers**:
- `Content-Type`: `text/plain; charset=utf-8`
- `Content-Length`: `11` (exact byte length)
- `Date`: Current timestamp in UTC format
- `Server`: `Node.js Tutorial Server/1.0.0`
- `X-Content-Type-Options`: `nosniff` (security header)

#### Error Responses

**Method Not Allowed (405)**

```http
HTTP/1.1 405 Method Not Allowed
Content-Type: text/plain; charset=utf-8
Allow: GET
Content-Length: 18
Date: Thu, 19 Dec 2024 10:30:00 GMT

Method Not Allowed
```

Returned when using unsupported HTTP methods (POST, PUT, DELETE, etc.) on the `/hello` endpoint.

---

## Status Codes

This API uses standard HTTP status codes with educational context for learning HTTP protocol fundamentals.

| Status Code | Status Message | Description | Usage in API |
|-------------|----------------|-------------|--------------|
| **200** | OK | Request successful | Successful GET /hello response |
| **404** | Not Found | Resource not found | Requests to non-existent endpoints |
| **405** | Method Not Allowed | HTTP method not supported | Non-GET requests to /hello |
| **500** | Internal Server Error | Server-side error | Unexpected server failures |

### Success Codes (2xx)

- **200 OK**: The hello endpoint successfully returns the "Hello world" message

### Client Error Codes (4xx)

- **404 Not Found**: Requested endpoint does not exist (any path other than `/hello`)
- **405 Method Not Allowed**: HTTP method not supported for the endpoint (non-GET requests to `/hello`)

### Server Error Codes (5xx)

- **500 Internal Server Error**: Unexpected server-side error during request processing

---

## Error Handling

The API implements comprehensive error handling with secure error responses that prevent information disclosure while providing useful feedback for debugging and learning.

### Error Response Format

All error responses follow a consistent plain text format:

```http
HTTP/1.1 {status_code} {status_message}
Content-Type: text/plain; charset=utf-8
Content-Length: {length}
Date: {timestamp}
Server: Node.js Tutorial Server/1.0.0
X-Content-Type-Options: nosniff

{error_message}
```

### Common Error Scenarios

#### 1. Route Not Found (404)

**Trigger**: Requesting any path other than `/hello`

```bash
# Example request to non-existent route
curl -X GET http://localhost:3000/nonexistent
```

**Response**:
```http
HTTP/1.1 404 Not Found
Content-Type: text/plain; charset=utf-8
Content-Length: 9

Not Found
```

#### 2. Method Not Allowed (405)

**Trigger**: Using unsupported HTTP methods on `/hello` endpoint

```bash
# Example POST request to hello endpoint
curl -X POST http://localhost:3000/hello
```

**Response**:
```http
HTTP/1.1 405 Method Not Allowed
Content-Type: text/plain; charset=utf-8
Allow: GET
Content-Length: 18

Method Not Allowed
```

#### 3. Internal Server Error (500)

**Trigger**: Unexpected server-side errors during request processing

**Response**:
```http
HTTP/1.1 500 Internal Server Error
Content-Type: text/plain; charset=utf-8
Content-Length: 21

Internal Server Error
```

### Error Security Features

- **Generic Error Messages**: Prevents information disclosure vulnerabilities
- **Sanitized Responses**: Removes sensitive system information from error messages
- **Consistent Format**: All errors use the same response structure
- **Security Headers**: Includes security headers to prevent MIME sniffing attacks

---

## Examples

### Command Line (curl)

#### Basic Hello Request
```bash
# Simple GET request to hello endpoint
curl -X GET http://localhost:3000/hello

# Expected Response: Hello world
```

#### Verbose Hello Request
```bash
# Request with verbose output showing headers
curl -v http://localhost:3000/hello

# Shows complete HTTP request and response headers
```

#### Testing Error Responses
```bash
# Test 404 Not Found
curl -X GET http://localhost:3000/invalid

# Test 405 Method Not Allowed  
curl -X POST http://localhost:3000/hello

# Test with different HTTP methods
curl -X PUT http://localhost:3000/hello
curl -X DELETE http://localhost:3000/hello
```

### JavaScript (Browser)

#### Fetch API Example
```javascript
// Basic fetch request to hello endpoint
fetch('http://localhost:3000/hello')
  .then(response => {
    console.log('Status:', response.status); // 200
    console.log('Content-Type:', response.headers.get('content-type')); // text/plain; charset=utf-8
    return response.text();
  })
  .then(data => {
    console.log('Response:', data); // "Hello world"
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Advanced Fetch with Error Handling
```javascript
// Comprehensive fetch example with error handling
async function callHelloEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/hello', {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.text();
    console.log('Hello API Response:', data);
    
    // Log response headers for educational purposes
    console.log('Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
  } catch (error) {
    console.error('Hello API Error:', error.message);
  }
}

// Call the function
callHelloEndpoint();
```

### Node.js HTTP Module

#### Basic HTTP Request
```javascript
// Using Node.js built-in HTTP module
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/hello',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode); // 200
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:', data); // "Hello world"
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.end();
```

#### Promise-based HTTP Request
```javascript
// Promise-wrapped Node.js HTTP request
function makeHelloRequest() {
  return new Promise((resolve, reject) => {
    const http = require('http');
    
    const req = http.get('http://localhost:3000/hello', (res) => {
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
  });
}

// Usage
makeHelloRequest()
  .then(response => {
    console.log('Hello Response:', response);
  })
  .catch(error => {
    console.error('Request failed:', error);
  });
```

### Browser Testing

#### Direct URL Access
Simply open the following URL in your web browser:
```
http://localhost:3000/hello
```

Expected result: Browser displays "Hello world" as plain text.

#### Developer Console Testing
```javascript
// Open browser developer console and run:
fetch('http://localhost:3000/hello')
  .then(r => r.text())
  .then(console.log);

// Expected output: "Hello world"
```

### Testing Tools

#### Postman Collection
```json
{
  "info": {
    "name": "Node.js Tutorial API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Hello Endpoint",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/hello",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["hello"]
        }
      }
    }
  ]
}
```

#### Automated Testing Example
```javascript
// Simple test using Node.js assert module
const http = require('http');
const assert = require('assert');

function testHelloEndpoint() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/hello', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          assert.strictEqual(res.statusCode, 200);
          assert.strictEqual(data, 'Hello world');
          assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8');
          console.log('✓ Hello endpoint test passed');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Run test
testHelloEndpoint()
  .then(() => console.log('All tests passed'))
  .catch(error => console.error('Test failed:', error));
```

---

## Educational Content

### Learning Objectives

This API demonstrates key Node.js and HTTP concepts:

1. **HTTP Server Creation**: Using Node.js built-in HTTP module
2. **Request-Response Cycle**: Understanding HTTP request processing
3. **URL Routing**: Implementing basic path-based routing
4. **Status Code Handling**: Proper HTTP status code usage
5. **Error Response Patterns**: Secure error handling implementation
6. **Header Management**: HTTP header formatting and security

### Node.js Concepts Demonstrated

#### 1. Event-Driven Architecture
```javascript
// The server uses Node.js event-driven pattern
server.on('request', (req, res) => {
  // Handle incoming requests asynchronously
});
```

#### 2. Non-Blocking I/O
- Requests are processed without blocking other requests
- Single-threaded event loop handles concurrent connections
- Asynchronous response generation patterns

#### 3. HTTP Module Usage
- Creating HTTP server with `http.createServer()`
- Processing request objects with method, url, and headers
- Generating responses with proper status codes and headers

#### 4. Stream Handling
- HTTP requests and responses are Node.js streams
- Efficient memory usage through stream processing
- No buffering of entire request/response content

### HTTP Protocol Fundamentals

#### Request Components
- **Method**: HTTP verb (GET, POST, PUT, DELETE, etc.)
- **URL**: Resource path with optional query parameters  
- **Headers**: Metadata about the request
- **Body**: Request payload (not used in GET requests)

#### Response Components  
- **Status Code**: Numeric status (200, 404, 500, etc.)
- **Status Message**: Human-readable status description
- **Headers**: Response metadata including content type and length
- **Body**: Response content (e.g., "Hello world")

#### Status Code Categories
- **1xx**: Informational responses
- **2xx**: Success responses (200 OK)
- **3xx**: Redirection responses  
- **4xx**: Client error responses (404, 405)
- **5xx**: Server error responses (500)

### Best Practices Demonstrated

#### 1. Error Handling
- Generic error messages prevent information disclosure
- Proper status codes provide appropriate feedback
- Comprehensive logging for debugging without client exposure
- Security-first approach to error response generation

#### 2. Response Generation
- Consistent content-type headers with charset specification
- Accurate content-length calculation using Buffer.byteLength
- Security headers (X-Content-Type-Options) for vulnerability prevention
- Proper HTTP/1.1 protocol compliance

#### 3. Request Validation
- HTTP method validation against allowed methods
- URL path validation for exact endpoint matching
- Security validation to prevent injection attacks
- Comprehensive validation with detailed error context

#### 4. Performance Considerations
- Efficient request processing with minimal overhead
- Stream-based processing for memory efficiency
- Performance monitoring with response time tracking
- Concurrent connection handling without thread creation

### Production Readiness Features

#### Architecture Patterns
- **Service Layer**: Business logic separation (HelloService)
- **Controller Pattern**: Request handling abstraction (HelloController)
- **Utility Functions**: Reusable response generation (response-utils)
- **Constants Management**: Centralized message and status management

#### Monitoring and Observability
- Structured logging with correlation IDs
- Performance metrics collection (request counts, response times)
- Health check capabilities for operational monitoring
- Error tracking and categorization

#### Security Implementation
- Input validation and sanitization
- Security header implementation
- Error message sanitization
- Method authorization and path validation

### Development Workflow

#### Starting the Server
```bash
# Start the Node.js tutorial server
node src/backend/server.js

# Server will listen on http://localhost:3000
```

#### Testing the API
```bash
# Test the hello endpoint
curl http://localhost:3000/hello

# Test error scenarios
curl http://localhost:3000/invalid        # 404 Not Found
curl -X POST http://localhost:3000/hello  # 405 Method Not Allowed
```

#### Development Tools Integration
- Compatible with Postman for API testing
- Works with browser developer tools for network analysis
- Supports automated testing with various Node.js testing frameworks
- Integrates with load testing tools for performance validation

### Next Steps for Learning

1. **Extend the API**: Add new endpoints with different HTTP methods
2. **Add Middleware**: Implement logging, authentication, or CORS middleware
3. **Database Integration**: Connect to databases for dynamic content
4. **Testing Framework**: Add comprehensive unit and integration tests
5. **Production Deployment**: Learn about process management and monitoring
6. **Security Enhancement**: Implement HTTPS, rate limiting, and authentication

---

## Troubleshooting

### Common Issues

**Connection Refused**
- Ensure the server is running on port 3000
- Check for port conflicts with other applications
- Verify firewall settings allow connections to port 3000

**Unexpected Response Format**
- Verify you're making GET requests to `/hello` exactly
- Check request headers don't specify unsupported content types
- Ensure proper URL encoding for special characters

**Performance Issues**
- Monitor server logs for error patterns
- Check system resources (CPU, memory) during load
- Verify Node.js version compatibility (v22.x LTS required)

### Development Tips

- Use browser network tab to inspect request/response details
- Enable verbose curl output (`-v`) to see complete HTTP transaction
- Check server console logs for detailed error information
- Use Node.js debugging tools for development troubleshooting

---

## API Reference Summary

| Endpoint | Method | Description | Status Code | Response |
|----------|--------|-------------|-------------|----------|
| `/hello` | GET | Returns hello world message | 200 | Hello world |
| `*` | GET | Any other path | 404 | Not Found |
| `/hello` | POST/PUT/DELETE/PATCH | Unsupported methods | 405 | Method Not Allowed |

### Quick Reference
- **Base URL**: `http://localhost:3000`
- **Single Endpoint**: `GET /hello`
- **Response Format**: Plain text
- **Character Encoding**: UTF-8
- **Security Headers**: X-Content-Type-Options included
- **Error Format**: Plain text with appropriate status codes

---

*This documentation serves as both an API reference and educational resource for learning Node.js HTTP server development. The implementation demonstrates production-ready patterns while maintaining tutorial simplicity.*

**Generated**: December 19, 2024  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0