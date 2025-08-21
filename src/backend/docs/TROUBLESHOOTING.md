# Node.js Tutorial HTTP Server - Troubleshooting Guide

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Support Contact:** tutorial@nodejs-learning.org  
**Documentation:** https://github.com/nodejs-tutorial/http-server/docs

## Table of Contents

1. [Overview](#overview)
2. [Installation and Setup Issues](#installation-and-setup-issues)
3. [Server Startup Issues](#server-startup-issues)
4. [Endpoint Functionality Issues](#endpoint-functionality-issues)
5. [Performance and Logging Issues](#performance-and-logging-issues)
6. [Testing Issues](#testing-issues)
7. [Development Workflow Issues](#development-workflow-issues)
8. [Debugging Techniques](#debugging-techniques)
9. [Quick Fixes](#quick-fixes)
10. [Environment Validation](#environment-validation)
11. [Error Reference](#error-reference)
12. [Recovery Procedures](#recovery-procedures)
13. [Support Resources](#support-resources)
14. [Preventive Measures](#preventive-measures)

---

## Overview

This troubleshooting guide provides comprehensive solutions for common issues encountered when developing, running, and testing the Node.js tutorial HTTP server application. The guide covers problems ranging from initial setup to advanced debugging scenarios, helping developers understand both the symptoms and root causes of issues while providing clear resolution steps.

The tutorial application demonstrates fundamental HTTP server concepts using Node.js built-in modules, implementing a single `/hello` endpoint that returns "Hello world" responses. This guide supports the educational objectives by providing clear, understandable troubleshooting patterns while demonstrating industry-standard debugging practices.

---

## Installation and Setup Issues

Common issues during initial installation and project setup including Node.js version, dependencies, and environment configuration.

### Node.js Version Incompatibility

**Symptoms:**
- Command 'node' not found
- Unsupported Node.js version
- Module import errors

**Causes:**
- Node.js not installed
- Outdated Node.js version
- Incorrect PATH configuration

**Solutions:**
1. Install Node.js v22.x LTS from official website
2. Verify installation with `node --version`
3. Update PATH environment variable if needed
4. Use Node Version Manager (nvm) for version management

**Diagnostic Commands:**
```bash
node --version
npm --version
which node
echo $PATH
```

**Resolution Steps:**
1. Download Node.js v22.x LTS from https://nodejs.org
2. Follow platform-specific installation instructions
3. Restart terminal to reload PATH
4. Verify: `node --version` should show v22.x.x

---

### Port Already in Use (EADDRINUSE)

**Symptoms:**
- Error: listen EADDRINUSE :::3000
- Port 3000 already in use
- Server startup failure

**Causes:**
- Another process using port 3000
- Previous server instance still running
- System service on port 3000

**Solutions:**
1. Kill process using port 3000: `lsof -ti:3000 | xargs kill`
2. Use different port with PORT environment variable
3. Check for zombie Node.js processes
4. Restart terminal or system if necessary

**Diagnostic Commands:**
```bash
lsof -i:3000
netstat -tulpn | grep 3000
ps aux | grep node
killall node
```

**Resolution Steps:**
1. Check what's using port 3000: `lsof -i:3000`
2. Kill the process: `kill -9 <PID>` or `lsof -ti:3000 | xargs kill`
3. Alternative: Set different port: `PORT=3001 node server.js`

---

### Permission Denied Errors

**Symptoms:**
- EACCES permission denied
- Cannot write to directory
- Access denied

**Causes:**
- Insufficient file permissions
- Protected port usage
- Directory ownership issues

**Solutions:**
1. Use port numbers above 1024 (3000 is recommended)
2. Check file and directory permissions
3. Run with appropriate user permissions
4. Avoid running as root user

**Diagnostic Commands:**
```bash
ls -la
whoami
pwd
chmod 644 *.js
```

**Resolution Steps:**
1. Verify you're not trying to use ports below 1024 without sudo
2. Check file permissions: `ls -la`
3. Fix permissions if needed: `chmod 644 *.js`
4. Ensure proper directory access: `chmod 755 ./`

---

## Server Startup Issues

Problems during HTTP server initialization, configuration loading, and component startup.

### Server Configuration Errors

**Symptoms:**
- Configuration validation failed
- Invalid environment variables
- Server startup timeout

**Causes:**
- Invalid PORT environment variable
- Missing HOST configuration
- Environment validation failure

**Solutions:**
1. Verify PORT is valid integer between 1024-65535
2. Check HOST environment variable format
3. Validate environment.js configuration
4. Reset to default configuration values

**Diagnostic Commands:**
```bash
echo $PORT
echo $HOST
echo $NODE_ENV
node -e "console.log(process.env)"
```

**Resolution Steps:**
1. Check PORT value: `echo $PORT` (should be integer 1024-65535)
2. Validate HOST: `echo $HOST` (should be 'localhost' or valid IP)
3. Reset to defaults: `unset PORT HOST NODE_ENV`
4. Restart: `npm start`

---

### Module Import Failures

**Symptoms:**
- Cannot find module
- Import/require errors
- SyntaxError in imports

**Causes:**
- Missing file dependencies
- Incorrect file paths
- Module system mismatch

**Solutions:**
1. Verify all required files exist in correct locations
2. Check file path references in imports
3. Ensure CommonJS module system usage
4. Validate package.json main entry point

**Diagnostic Commands:**
```bash
ls -la src/backend/
find . -name "*.js"
node --check server.js
npm run lint
```

**Resolution Steps:**
1. Verify file structure: `ls -la src/backend/`
2. Check syntax: `node --check server.js`
3. Validate imports: ensure relative paths are correct
4. Test module loading: `node -e "require('./server.js')"`

---

### Application Component Initialization Failure

**Symptoms:**
- Component validation failed
- Route registry initialization error
- Logger setup failure

**Causes:**
- Missing component dependencies
- Configuration validation errors
- Circular dependency issues

**Solutions:**
1. Check component initialization order in app.js
2. Validate all component configurations
3. Ensure proper dependency injection
4. Review error logs for specific component failures

**Diagnostic Commands:**
```bash
node app.js --dry-run
node -e "require('./config/app.config.js')"
npm run test:unit
```

**Resolution Steps:**
1. Test configuration loading: `node -e "console.log(require('./config/environment.js'))"`
2. Check dependency order in code
3. Validate all file paths and imports
4. Review error messages for specific component failures

---

## Endpoint Functionality Issues

Problems with HTTP endpoint responses, routing, and request processing.

### Hello Endpoint Not Responding

**Symptoms:**
- 404 Not Found for /hello
- Connection timeout
- No response from server

**Causes:**
- Server not running
- Route not registered
- URL path mismatch

**Solutions:**
1. Verify server is running with `npm run health`
2. Check route registration in routes/index.js
3. Ensure exact URL path '/hello' with no trailing slash
4. Verify HTTP GET method usage

**Diagnostic Commands:**
```bash
curl http://localhost:3000/hello
curl -I http://localhost:3000/hello
npm run health
netstat -an | grep 3000
```

**Resolution Steps:**
1. Check server status: `netstat -an | grep 3000`
2. Test endpoint: `curl http://localhost:3000/hello`
3. Verify URL format: no trailing slash, exact path match
4. Confirm server is running and listening

---

### Wrong HTTP Status Codes

**Symptoms:**
- Unexpected 500 errors
- 405 Method Not Allowed
- Incorrect error responses

**Causes:**
- HTTP method mismatch
- Route handler errors
- Error handling configuration

**Solutions:**
1. Use GET method for /hello endpoint
2. Check error handler configuration
3. Verify route handler implementation
4. Review HTTP status code mapping

**Diagnostic Commands:**
```bash
curl -X POST http://localhost:3000/hello
curl -v http://localhost:3000/invalid
npm run test:integration
```

**Resolution Steps:**
1. Test with correct method: `curl -X GET http://localhost:3000/hello`
2. Test with wrong method: `curl -X POST http://localhost:3000/hello` (should return 405)
3. Test invalid path: `curl http://localhost:3000/invalid` (should return 404)
4. Review status code logic in route handler

---

### Response Content Issues

**Symptoms:**
- Empty response body
- Incorrect content type
- Malformed response

**Causes:**
- Response handler errors
- Content-Type header issues
- Response generation problems

**Solutions:**
1. Check response handler implementation
2. Verify Content-Type header is set to text/plain
3. Ensure 'Hello world' response content
4. Review response generation logic

**Diagnostic Commands:**
```bash
curl -H "Accept: text/plain" http://localhost:3000/hello
wget -O- http://localhost:3000/hello
npm run test:e2e
```

**Resolution Steps:**
1. Check response headers: `curl -I http://localhost:3000/hello`
2. Verify content: `curl -v http://localhost:3000/hello`
3. Expected: Content-Type: text/plain, Body: "Hello world"
4. Review response.writeHead() and response.end() usage

---

## Performance and Logging Issues

Performance problems, logging configuration issues, and monitoring concerns.

### Slow Response Times

**Symptoms:**
- Response times > 100ms
- Performance test failures
- Timeout errors

**Causes:**
- Resource contention
- Blocking operations
- Memory leaks

**Solutions:**
1. Check for blocking synchronous operations
2. Monitor memory usage and garbage collection
3. Review event loop performance
4. Optimize request processing pipeline

**Diagnostic Commands:**
```bash
node --perf-basic-prof server.js
time curl http://localhost:3000/hello
npm run test:coverage
```

**Resolution Steps:**
1. Measure response time: `time curl http://localhost:3000/hello`
2. Should be < 100ms consistently
3. Check for blocking operations in code
4. Monitor with: `node --inspect server.js`

---

### Logging Not Working

**Symptoms:**
- No console output
- Missing request logs
- Log level issues

**Causes:**
- Logger configuration errors
- Log level filtering
- Console output redirection

**Solutions:**
1. Check LOG_LEVEL environment variable
2. Verify logger configuration in app.config.js
3. Ensure console output is not redirected
4. Test logger functionality independently

**Diagnostic Commands:**
```bash
echo $LOG_LEVEL
node -e "require('./utils/logger.js').info('test')"
npm run dev
```

**Resolution Steps:**
1. Check log level: `echo $LOG_LEVEL`
2. Set debug level: `LOG_LEVEL=DEBUG node server.js`
3. Test basic logging: `node -e "console.log('test')"`
4. Verify console output is visible

---

### Memory Usage Problems

**Symptoms:**
- High memory consumption
- Memory leaks
- Out of memory errors

**Causes:**
- Event listener leaks
- Circular references
- Large object retention

**Solutions:**
1. Monitor process memory usage
2. Check for proper event listener cleanup
3. Review object lifecycle management
4. Use Node.js memory profiling tools

**Diagnostic Commands:**
```bash
node --inspect server.js
ps -o pid,vsz,rss,comm -p $(pgrep node)
node --heap-prof server.js
```

**Resolution Steps:**
1. Monitor memory: `ps -o pid,vsz,rss,comm -p $(pgrep node)`
2. Should be < 50MB for tutorial app
3. Profile if needed: `node --inspect server.js`
4. Check for memory leaks in Chrome DevTools

---

## Testing Issues

Problems with test execution, Node.js built-in test runner, and test environment setup.

### Tests Not Running

**Symptoms:**
- No tests found
- Test runner errors
- Import errors in tests

**Causes:**
- Test file naming issues
- Node.js version incompatibility
- Test runner configuration

**Solutions:**
1. Ensure test files follow *.test.js naming pattern
2. Verify Node.js v20+ for stable test runner
3. Check test file imports and syntax
4. Use npm run test command

**Diagnostic Commands:**
```bash
ls -la test/
node --test
node --test --test-reporter=spec
npm run test
```

**Resolution Steps:**
1. Check test files exist: `ls -la test/`
2. Verify naming pattern: `*.test.js`
3. Test runner: `node --test`
4. Check Node.js version: `node --version` (v20+ required)

---

### Test Failures

**Symptoms:**
- Assertion errors
- Test timeouts
- Inconsistent test results

**Causes:**
- Port conflicts in tests
- Test isolation issues
- Timing-dependent tests

**Solutions:**
1. Use unique ports for each test
2. Ensure proper test cleanup
3. Add proper async/await handling
4. Increase test timeouts if necessary

**Diagnostic Commands:**
```bash
npm run test:unit
npm run test:integration
node --test --test-timeout=10000
```

**Resolution Steps:**
1. Run tests individually: `node --test test/specific.test.js`
2. Check for port conflicts: use different ports per test
3. Verify async handling: ensure proper await usage
4. Clean up resources after each test

---

### Coverage Issues

**Symptoms:**
- Low coverage reports
- Coverage tool errors
- Missing coverage data

**Causes:**
- Incomplete test coverage
- Coverage configuration
- File exclusion issues

**Solutions:**
1. Use --experimental-test-coverage flag
2. Add tests for uncovered code paths
3. Check coverage thresholds
4. Review coverage report details

**Diagnostic Commands:**
```bash
npm run test:coverage
node --test --experimental-test-coverage
node --test --test-reporter=lcov
```

**Resolution Steps:**
1. Run with coverage: `node --test --experimental-test-coverage`
2. Review coverage report for gaps
3. Add tests for uncovered lines
4. Target 90%+ coverage for tutorial app

---

## Development Workflow Issues

Problems with development tools, scripts, and workflow automation.

### npm Script Failures

**Symptoms:**
- Script execution errors
- Command not found
- Permission denied

**Causes:**
- Missing script dependencies
- Path configuration
- Script syntax errors

**Solutions:**
1. Check package.json scripts configuration
2. Verify Node.js and npm installation
3. Check script file permissions
4. Review script syntax and dependencies

**Diagnostic Commands:**
```bash
npm run
npm config list
ls -la scripts/
cat package.json | grep scripts
```

**Resolution Steps:**
1. List available scripts: `npm run`
2. Check package.json for script definitions
3. Verify Node.js and npm are in PATH
4. Test script syntax manually

---

### File Watching Issues

**Symptoms:**
- Hot reload not working
- File changes not detected
- Dev script errors

**Causes:**
- File system limitations
- Permission issues
- Path configuration

**Solutions:**
1. Check file system event support
2. Verify file permissions and ownership
3. Use manual restart if needed
4. Check dev script configuration

**Diagnostic Commands:**
```bash
npm run dev
ls -la | grep -E "\.(js|json)$"
lsof +D .
```

**Resolution Steps:**
1. Try manual restart: `npm start`
2. Check file permissions: `ls -la`
3. Verify file system supports watching
4. Use `npm run dev` for development mode

---

## Debugging Techniques

### Logging Debug

**Description:** Using structured logging for debugging and troubleshooting

**Techniques:**
- Enable DEBUG log level with LOG_LEVEL=DEBUG environment variable
- Use logger.debug() for detailed troubleshooting information
- Check request/response logs with correlation IDs
- Monitor performance metrics through log statistics

**Example Commands:**
```bash
LOG_LEVEL=DEBUG node server.js
tail -f server.log
grep ERROR server.log
npm run logs
```

**Implementation:**
1. Set environment: `export LOG_LEVEL=DEBUG`
2. Start server: `node server.js`
3. Make requests and observe detailed logs
4. Filter logs: `grep "ERROR\|WARN" server.log`

---

### Node.js Debugging

**Description:** Using Node.js debugging tools and inspector

**Techniques:**
- Use Node.js inspector with --inspect flag
- Set breakpoints in Chrome DevTools
- Use console.log for basic debugging
- Leverage Node.js REPL for interactive debugging

**Example Commands:**
```bash
node --inspect server.js
node --inspect-brk server.js
node -e "console.log('debug test')"
node --check server.js
```

**Implementation:**
1. Start with inspector: `node --inspect server.js`
2. Open Chrome DevTools (chrome://inspect)
3. Set breakpoints in server.js
4. Make request and step through code

---

### Performance Profiling

**Description:** Profiling application performance and identifying bottlenecks

**Techniques:**
- Use --perf-basic-prof for CPU profiling
- Monitor memory usage with process.memoryUsage()
- Use performance hooks for timing measurements
- Profile with Chrome DevTools

**Example Commands:**
```bash
node --perf-basic-prof server.js
node --inspect --perf-basic-prof server.js
node --heap-prof server.js
time npm run test
```

**Implementation:**
1. Profile CPU: `node --perf-basic-prof server.js`
2. Profile memory: `node --heap-prof server.js`
3. Analyze with Chrome DevTools
4. Generate flame graphs for performance analysis

---

## Quick Fixes

### Server Won't Start

**Quick Resolution Steps:**
1. Check Node.js version: `node --version` (should be v22.x)
2. Kill processes on port 3000: `lsof -ti:3000 | xargs kill`
3. Verify files exist: `ls -la src/backend/server.js`
4. Reset environment: `unset PORT && npm start`

### Tests Failing

**Quick Resolution Steps:**
1. Run with verbose output: `npm run test -- --verbose`
2. Check test isolation: `npm run test:unit`
3. Update Node.js: Use Node.js v22.x LTS
4. Clean restart: `npm run clean && npm run test`

### Hello Endpoint Not Working

**Quick Resolution Steps:**
1. Test with curl: `curl http://localhost:3000/hello`
2. Check server status: `npm run health`
3. Verify exact URL: http://localhost:3000/hello (no trailing slash)
4. Test locally: `node -e "require('./routes/hello.js')"`

### Performance Issues

**Quick Resolution Steps:**
1. Monitor memory: `ps -o pid,vsz,rss,comm -p $(pgrep node)`
2. Check response time: `time curl http://localhost:3000/hello`
3. Profile with inspector: `node --inspect server.js`
4. Run performance tests: `npm run test:coverage`

---

## Environment Validation

### System Requirements

**Node.js Version:** v22.x LTS (minimum v22.0.0)  
**npm Version:** v10.x or higher  
**Operating System:** Windows 10+, macOS 10.15+, Ubuntu 18.04+  
**Memory:** 512MB minimum, 1GB recommended  
**Disk Space:** 100MB minimum

### Validation Commands

Run these commands to validate your environment:

```bash
node --version          # Should show v22.x.x
npm --version          # Should show v10.x.x or higher
node --check server.js # Should show no syntax errors
npm run lint          # Should pass without errors
npm run test:unit     # Should pass all tests
```

### Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Server port | 3000 |
| `HOST` | Server hostname | localhost |
| `NODE_ENV` | Environment mode | development |
| `LOG_LEVEL` | Logging level | INFO |

**Example Configuration:**
```bash
export PORT=3000
export HOST=localhost
export NODE_ENV=development
export LOG_LEVEL=DEBUG
```

---

## Error Reference

### Common Error Codes

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `EADDRINUSE` | Port already in use | Kill process or use different port |
| `ENOENT` | File or directory not found | Check file paths |
| `EACCES` | Permission denied | Check file permissions |
| `MODULE_NOT_FOUND` | Missing module | Verify file paths and imports |
| `SYNTAX_ERROR` | Code syntax error | Check JavaScript syntax |

### HTTP Status Codes

| Status Code | Description | Meaning |
|-------------|-------------|---------|
| `200` | OK | Successful hello endpoint response |
| `404` | Not Found | Invalid URL path requested |
| `405` | Method Not Allowed | Wrong HTTP method used |
| `500` | Internal Server Error | Server-side error occurred |

**Expected Responses:**
- `GET /hello` → 200 OK + "Hello world"
- `GET /invalid` → 404 Not Found
- `POST /hello` → 405 Method Not Allowed

---

## Recovery Procedures

### Complete Reset

**Steps for full system reset:**
1. Stop all Node.js processes: `killall node`
2. Clean temporary files: `npm run clean`
3. Verify file integrity: `git status` (if using Git)
4. Restart from clean state: `npm start`

### Configuration Reset

**Steps for configuration reset:**
1. Unset environment variables: `unset PORT HOST NODE_ENV`
2. Use default configuration: `rm .env.development .env.test`
3. Validate configuration: `node config/environment.js`
4. Restart with defaults: `npm start`

### Dependency Reset

**Steps for dependency reset:**
1. Clear npm cache: `npm cache clean --force`
2. Verify package.json: `cat package.json`
3. Reinstall if needed: `rm -rf node_modules && npm install`
4. Verify installation: `npm run health`

---

## Support Resources

### Documentation

- **Setup Guide:** src/backend/docs/SETUP.md
- **API Documentation:** src/backend/docs/API.md
- **Testing Guide:** src/backend/docs/TESTING.md
- **Architecture Overview:** src/backend/docs/ARCHITECTURE.md

### External Resources

- **Node.js Official Documentation:** https://nodejs.org/docs
- **Node.js LTS Schedule:** https://nodejs.org/en/about/releases/
- **Node.js Troubleshooting Guide:** https://nodejs.org/en/docs/guides/
- **HTTP Status Codes Reference:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

### Community Support

- **GitHub Issues:** https://github.com/nodejs-tutorial/http-server/issues
- **Stack Overflow:** Tag with 'nodejs' and 'http-server'
- **Node.js Community:** https://nodejs.org/en/get-involved/
- **Tutorial Support:** tutorial@nodejs-learning.org

---

## Preventive Measures

### Development Best Practices

- Use Node.js LTS versions for stability
- Regularly update dependencies and security patches
- Implement proper error handling and logging
- Follow consistent code formatting and linting
- Use version control for code management

### Testing Practices

- Run tests before committing changes
- Maintain high test coverage (>90%)
- Use test isolation and cleanup procedures
- Implement both unit and integration tests
- Automate testing in development workflow

### Monitoring Recommendations

- Monitor application performance and response times
- Track error rates and debugging information
- Implement health checks and status monitoring
- Use structured logging for troubleshooting
- Monitor system resources and memory usage

---

## Emergency Contacts

**Tutorial Support:** tutorial@nodejs-learning.org  
**Documentation Issues:** https://github.com/nodejs-tutorial/http-server/issues  
**Node.js Community:** https://nodejs.org/en/get-involved/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial troubleshooting guide |

---

*For additional support, please visit our documentation repository or contact tutorial@nodejs-learning.org*