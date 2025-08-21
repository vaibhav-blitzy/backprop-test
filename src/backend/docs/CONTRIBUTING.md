# Contributing to Node.js Tutorial HTTP Server

Welcome to the Node.js Tutorial HTTP Server project! This guide provides comprehensive information for contributors who want to help improve this educational Node.js tutorial application. Whether you're a beginner learning Node.js or an experienced developer, your contributions help make this tutorial more valuable for the learning community.

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start for Contributors](#quick-start-for-contributors)
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Contribution Workflow](#contribution-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Issue Reporting and Management](#issue-reporting-and-management)
- [Educational Alignment](#educational-alignment)
- [Documentation Standards](#documentation-standards)
- [Release Process](#release-process)
- [Community and Support](#community-and-support)
- [FAQ](#faq)

## Project Overview

### Educational Mission

The Node.js Tutorial HTTP Server is an educational project designed to demonstrate fundamental HTTP server concepts using Node.js built-in modules. Our primary objective is to provide clear, practical examples for developers learning server-side JavaScript development without the complexity of external frameworks or dependencies.

**Learning Goals:**
- Understanding Node.js built-in HTTP module usage and capabilities
- Learning HTTP server creation and request-response cycle implementation  
- Demonstrating zero-dependency application development principles
- Showing proper package.json configuration and npm script patterns
- Illustrating development workflow automation with built-in tools

**Target Audience:**
- Beginning Node.js developers learning server-side JavaScript fundamentals
- Students and educators requiring practical HTTP server implementation examples
- Developers transitioning from frontend to backend development
- Technical educators seeking zero-dependency tutorial examples

### Technical Overview

**Application Scope:** Simple HTTP server with single `/hello` endpoint returning 'Hello world' response

**Technology Stack:**
- **Runtime:** Node.js v22.x LTS with Active LTS support
- **Modules:** Node.js built-in HTTP module exclusively, no external dependencies
- **Architecture:** Event-driven, single-threaded design demonstrating Node.js core patterns

**Key Features:**
- HTTP server creation using built-in `http.createServer()` method
- Request routing and URL path handling for educational demonstration
- Response generation with proper HTTP status codes and headers
- Error handling and HTTP protocol compliance
- Development workflow with file watching and hot reloading

### Zero-Dependency Philosophy

This project maintains educational focus by using only Node.js built-in capabilities, eliminating external package complexity and dependency management overhead. This approach provides several benefits:

- **Educational Clarity:** Focus on fundamental concepts without framework abstractions
- **Simplified Learning:** Reduced cognitive load for students learning Node.js basics
- **Security Benefits:** Minimal attack surface with no third-party dependencies
- **Long-term Stability:** No breaking changes from external package updates
- **Performance Optimization:** Direct use of optimized Node.js built-in modules

## Quick Start for Contributors

### Prerequisites Verification

Ensure you have the required development environment:

```bash
# Verify Node.js v22.x LTS installation
node --version  # Should show v22.11.0 or higher

# Verify npm v11.5.2+ installation
npm --version   # Should show 11.5.2 or higher

# Confirm Git installation and configuration
git --version
git config --list
```

### Repository Setup

```bash
# Clone repository with SSH (recommended) or HTTPS
git clone <repository-url>

# Navigate to backend directory
cd src/backend

# Verify project structure
ls -la  # Should show server.js, app.js, package.json

# Validate zero dependencies
npm ls  # Should show empty dependency tree
```

### Immediate Validation

```bash
# Start development server with file watching
npm run dev

# Test hello endpoint (in another terminal)
curl http://localhost:3000/hello
# Expected response: "Hello world"

# Run complete test suite
npm test

# Check test coverage
npm run test:coverage  # Should show 90%+ coverage

# Validate code quality
npm run lint  # Should complete without errors
```

### Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `npx kill-port 3000` or use different port |
| Node.js version mismatch | Install Node.js v22.x LTS from nodejs.org |
| npm command not found | Reinstall Node.js with npm or verify PATH |
| Permission errors | Check file permissions and user privileges |

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- **Be Respectful:** Treat all community members with respect and professionalism
- **Be Collaborative:** Work together constructively and share knowledge generously
- **Be Educational:** Focus discussions on learning objectives and educational value
- **Be Constructive:** Provide helpful feedback and suggest improvements
- **Be Inclusive:** Welcome contributors of all experience levels and backgrounds

## Getting Started

### First-Time Contributors

1. **Explore the Codebase:** Start by examining `server.js`, `app.js`, and `package.json` to understand the application structure
2. **Run the Application:** Follow the Quick Start guide to get the server running locally
3. **Review Documentation:** Read through existing documentation to understand project goals and patterns
4. **Check Open Issues:** Look for issues labeled "good first issue" or "help wanted"
5. **Join Discussions:** Participate in discussions about features, improvements, and educational enhancements

### Contribution Types

**Code Contributions:**
- Bug fixes and error handling improvements
- Performance optimizations while maintaining code clarity
- Educational examples and code documentation
- Test coverage improvements and test case additions

**Documentation Contributions:**
- Tutorial content improvements and clarifications
- Code example enhancements
- Educational explanations and learning guides
- API documentation and usage examples

**Educational Contributions:**
- Learning objective refinements
- Educational content validation
- Tutorial progression improvements
- Accessibility enhancements for different learning styles

## Development Environment

### Node.js Installation

**Option 1: Direct Installation (Recommended)**
```bash
# Download and install Node.js v22.x LTS from nodejs.org
# Verify installation
node --version  # v22.11.0+
npm --version   # 11.5.2+
```

**Option 2: Node Version Manager (Advanced)**
```bash
# Using nvm (macOS/Linux)
nvm install 22
nvm use 22

# Using nvm-windows (Windows)
nvm install 22.11.0
nvm use 22.11.0
```

### Project Configuration

```bash
# Navigate to project backend directory
cd src/backend

# Verify package.json configuration
cat package.json | head -20

# Check available npm scripts
npm run  # Lists all available scripts

# Validate Node.js engine requirements
node -e "
const pkg = require('./package.json');
const current = process.version;
const required = pkg.engines.node;
console.log('Current:', current);
console.log('Required:', required);
console.log('Compatible:', require('semver').satisfies(current, required));
" || echo "Using manual version validation"
```

### Environment Variables

```bash
# Copy example environment file
cp .env.example .env.test

# Review test environment settings
cat .env.test
```

**Required Environment Variables:**
- `NODE_ENV=test` - Environment mode for testing
- `PORT=3001` - Server port for test isolation
- `HOST=localhost` - Server host binding
- `LOG_LEVEL=error` - Minimal logging for tests

### Development Tools Setup

**Recommended IDE Configuration:**

**Visual Studio Code:**
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "files.eol": "\n",
  "javascript.preferences.quoteStyle": "single",
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```

**Essential Extensions:**
- Node.js Extension Pack
- ESLint (for future implementation)
- REST Client (for endpoint testing)

## Project Structure

```
src/backend/
├── server.js              # Main server entry point and bootstrap
├── app.js                  # Application class and component orchestration
├── package.json            # Project configuration (zero dependencies)
│
├── config/
│   ├── app.config.js       # Application configuration management
│   ├── environment.js      # Environment variable handling
│   └── server.config.js    # Server-specific configuration
│
├── lib/
│   ├── http-server.js      # HTTP server implementation
│   ├── request-handler.js  # Request processing logic
│   ├── route-handler.js    # Route matching and handling
│   ├── response-handler.js # Response generation utilities
│   └── error-handler.js    # Centralized error handling
│
├── controllers/
│   ├── base.controller.js  # Base controller class
│   └── hello.controller.js # Hello endpoint controller
│
├── services/
│   ├── base.service.js     # Base service class
│   └── hello.service.js    # Hello endpoint business logic
│
├── routes/
│   ├── index.js            # Route configuration
│   ├── hello.js           # Hello route definition
│   └── notfound.js        # 404 error handling
│
├── utils/
│   ├── http-status.js      # HTTP status code utilities
│   ├── response-utils.js   # Response formatting helpers
│   ├── logger.js          # Logging implementation
│   └── validation.js      # Input validation utilities
│
├── constants/
│   ├── error-messages.js   # Standardized error messages
│   ├── response-messages.js # Success response messages
│   ├── http-headers.js     # HTTP header constants
│   └── http-methods.js     # HTTP method constants
│
├── types/
│   ├── request.types.js    # Request type definitions
│   └── response.types.js   # Response type definitions
│
├── scripts/
│   ├── dev.js             # Development server with hot reloading
│   ├── test.js            # Test execution script
│   └── lint.js            # Code quality checking (planned)
│
├── test/
│   ├── unit/              # Unit test suites
│   ├── integration/       # Integration test suites  
│   ├── e2e/              # End-to-end test suites
│   ├── fixtures/         # Test data and configuration
│   ├── helpers/          # Test utilities and helpers
│   └── mocks/            # Test mocks and stubs
│
└── docs/
    ├── CONTRIBUTING.md    # This file
    ├── TESTING.md        # Comprehensive testing guide
    └── API.md           # API documentation (planned)
```

### Architecture Overview

The application follows a **layered architecture** with clear separation of concerns:

1. **Entry Layer** (`server.js`) - Process management and application bootstrap
2. **Application Layer** (`app.js`) - Component orchestration and lifecycle management
3. **HTTP Layer** (`lib/`) - HTTP server implementation and request handling
4. **Business Layer** (`controllers/`, `services/`) - Request processing and business logic
5. **Routing Layer** (`routes/`) - URL pattern matching and endpoint definitions
6. **Utility Layer** (`utils/`, `constants/`) - Shared utilities and constants

## Coding Standards

### Code Style Guidelines

**Basic Formatting:**
- Use 2 spaces for indentation (no tabs)
- Use single quotes for strings
- Use semicolons at end of statements
- Use trailing commas in multi-line objects/arrays
- Maximum line length: 100 characters

**Variable and Function Naming:**
```javascript
// Use camelCase for variables and functions
const serverPort = 3000;
const requestHandler = (req, res) => {};

// Use PascalCase for classes and constructors
class HttpServer {}
class RequestHandler {}

// Use UPPER_SNAKE_CASE for constants
const DEFAULT_PORT = 3000;
const HTTP_STATUS_OK = 200;
```

**Function Design Principles:**
- Keep functions small and focused on single responsibility
- Use descriptive function names that explain purpose
- Prefer pure functions when possible (no side effects)
- Document complex logic with inline comments
- Handle errors explicitly with proper error messages

**Example Function Structure:**
```javascript
/**
 * Processes HTTP GET requests for the hello endpoint with comprehensive
 * error handling and educational logging for learning purposes.
 * 
 * @param {Object} request - HTTP request object from Node.js
 * @param {Object} response - HTTP response object from Node.js
 * @returns {void} Sends response directly to client
 * 
 * @example
 * handleHelloRequest(req, res);
 */
function handleHelloRequest(request, response) {
    try {
        // Validate request method for educational demonstration
        if (request.method !== 'GET') {
            sendMethodNotAllowed(response);
            return;
        }

        // Generate successful hello response
        const responseData = {
            message: 'Hello world',
            timestamp: new Date().toISOString()
        };

        // Send response with proper headers
        response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
        });
        response.end(responseData.message);

        // Log successful request for educational visibility
        console.log(`Hello endpoint served successfully at ${responseData.timestamp}`);

    } catch (error) {
        // Handle unexpected errors with educational logging
        console.error('Error processing hello request:', error.message);
        sendInternalServerError(response);
    }
}
```

### Educational Code Standards

**Documentation Requirements:**
- All functions must have JSDoc comments explaining purpose and usage
- Complex logic must include educational inline comments
- Code examples should demonstrate best practices
- Error messages should be informative and helpful for learning

**Code Clarity Principles:**
- Prioritize readability over clever optimizations
- Use verbose variable names that explain purpose
- Avoid abbreviations unless widely understood
- Structure code to follow logical progression

**Error Handling Standards:**
```javascript
// Always include try-catch blocks for educational demonstration
try {
    // Main processing logic
    const result = processRequest(request);
    sendSuccessResponse(response, result);
} catch (error) {
    // Educational error logging with context
    console.error('Request processing failed:', {
        error: error.message,
        request: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
    });
    
    // Send appropriate error response
    sendErrorResponse(response, error);
}
```

### Zero-Dependency Implementation Standards

**Module Import Standards:**
```javascript
// Use Node.js built-in modules exclusively
import http from 'node:http';           // ✓ Correct
import { URL } from 'node:url';         // ✓ Correct
import fs from 'node:fs';               // ✓ Correct

// Avoid external dependencies
import express from 'express';          // ❌ Incorrect
import lodash from 'lodash';           // ❌ Incorrect
```

**Implementation Patterns:**
- Implement functionality using Node.js built-in capabilities
- Create utility functions instead of importing libraries
- Document alternative approaches available with external packages
- Demonstrate standard patterns without framework magic

### File Organization Standards

**File Naming Convention:**
- Use kebab-case for file names: `http-server.js`
- Use descriptive names: `hello.controller.js` not `hello.js`
- Include file type in name when appropriate: `request.types.js`

**File Structure Template:**
```javascript
/**
 * [File Description]
 * 
 * [Educational objective and purpose]
 * [Key features and responsibilities]
 * [Integration points with other components]
 * 
 * @fileoverview [Brief description]
 * @version 1.0.0
 * @author Node.js Tutorial Application
 * @since 2024
 */

// ============================================================================
// MODULE IMPORTS
// ============================================================================
import { ... } from 'node:...';

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================
const CONSTANT_NAME = 'value';

// ============================================================================
// MAIN IMPLEMENTATION
// ============================================================================
[Main code here]

// ============================================================================
// MODULE EXPORTS
// ============================================================================
export { ... };
```

## Testing Requirements

### Testing Philosophy

The Node.js Tutorial HTTP Server project follows a comprehensive testing strategy using **Node.js built-in test runner** (`node:test`) and assertion library (`node:assert`). This approach maintains our zero-dependency philosophy while providing robust test coverage and educational value.

**Testing Principles:**
- **Zero External Dependencies:** Use only Node.js built-in testing capabilities
- **Educational Value:** Tests serve as examples and documentation
- **High Coverage:** Maintain 90%+ line coverage, 100% function coverage
- **Clear Test Structure:** Tests are easy to read and understand
- **Comprehensive Scenarios:** Cover both success and error paths

### Test Structure and Organization

**Testing Pyramid Distribution:**
- **Unit Tests (70%):** Individual function and component testing
- **Integration Tests (20%):** Component interaction and API testing  
- **End-to-End Tests (10%):** Complete workflow validation

**Directory Structure:**
```
test/
├── unit/                    # Unit test suites
│   ├── hello.controller.test.js
│   ├── http-server.test.js
│   └── request-handler.test.js
├── integration/             # Integration test suites
│   ├── hello-endpoint.test.js
│   └── server-lifecycle.test.js
├── e2e/                     # End-to-end test suites
│   └── application.test.js
├── helpers/                 # Test utilities
│   ├── test-server.js       # Server management
│   ├── test-utils.js        # Common utilities
│   └── assertions.js        # Custom assertions
├── mocks/                   # Test mocks and stubs
│   ├── http-request.mock.js
│   └── http-response.mock.js
└── fixtures/                # Test data
    └── test-config.js
```

### Test Execution Commands

```bash
# Run all tests with TAP reporter
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # End-to-end tests only

# Run tests with coverage analysis
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run performance tests
npm run test:performance

# Run tests with verbose output
npm run test:verbose
```

### Coverage Requirements and Quality Gates

**Minimum Coverage Thresholds:**
- **Line Coverage:** 90% minimum
- **Function Coverage:** 100% required
- **Branch Coverage:** 85% minimum
- **Statement Coverage:** 90% minimum

**Quality Gate Enforcement:**
Tests must pass all coverage thresholds to be merged. Coverage reports are generated automatically and integrated with CI/CD pipeline.

```bash
# Check coverage against thresholds
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage:html

# View coverage summary
npm run test:coverage:summary
```

### Writing Effective Tests

**Test Case Structure:**
```javascript
import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { HelloController } from '../controllers/hello.controller.js';

describe('HelloController', () => {
    let controller;

    before(() => {
        // Test setup and initialization
        controller = new HelloController();
    });

    after(() => {
        // Test cleanup and resource deallocation
        controller = null;
    });

    it('should return hello world message for valid GET request', () => {
        // Arrange - Set up test data and mocks
        const mockRequest = {
            method: 'GET',
            url: '/hello',
            headers: {}
        };
        const mockResponse = createMockResponse();

        // Act - Execute the function under test
        controller.handleRequest(mockRequest, mockResponse);

        // Assert - Verify expected outcomes
        assert.strictEqual(mockResponse.statusCode, 200);
        assert.strictEqual(mockResponse.body, 'Hello world');
        assert.strictEqual(mockResponse.headers['Content-Type'], 'text/plain');
    });

    it('should return 405 error for non-GET requests', () => {
        // Test error path with educational assertions
        const mockRequest = {
            method: 'POST',
            url: '/hello',
            headers: {}
        };
        const mockResponse = createMockResponse();

        controller.handleRequest(mockRequest, mockResponse);

        assert.strictEqual(mockResponse.statusCode, 405);
        assert.match(mockResponse.body, /Method Not Allowed/);
    });
});
```

**Test Best Practices:**
- **Descriptive Test Names:** Test names should clearly explain what is being tested
- **Arrange-Act-Assert Pattern:** Organize tests with clear setup, execution, and verification
- **Test Edge Cases:** Include boundary conditions and error scenarios
- **Mock External Dependencies:** Use mocks for HTTP requests/responses and external calls
- **Cleanup Resources:** Ensure tests clean up after themselves

### Testing Development Server

**Server Testing with TestServer Helper:**
```javascript
import { TestServer } from '../helpers/test-server.js';

describe('Server Integration Tests', () => {
    let testServer;

    before(async () => {
        testServer = new TestServer({
            port: 3001,  // Use different port for test isolation
            host: 'localhost'
        });
        await testServer.start();
    });

    after(async () => {
        await testServer.stop();
    });

    it('should respond to hello endpoint with correct message', async () => {
        const response = await testServer.get('/hello');
        
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body, 'Hello world');
        assert.strictEqual(response.headers['content-type'], 'text/plain');
    });
});
```

### Continuous Integration Integration

**GitHub Actions Integration:**
The CI pipeline automatically runs all test suites with coverage validation:

```yaml
# Automated test execution in CI
- name: Run Test Suite
  run: |
    npm run test:coverage
    npm run test:integration
    npm run test:e2e

# Coverage validation
- name: Validate Coverage Thresholds
  run: |
    npm run test:coverage:validate
```

**Test Result Artifacts:**
- Test results are uploaded as CI artifacts
- Coverage reports are generated for each pull request
- Performance test results are tracked over time

## Contribution Workflow

### GitHub Flow Process

This project follows **GitHub Flow** for all contributions. This workflow is simple, safe, and provides good integration with our educational objectives.

**Workflow Steps:**

1. **Fork Repository** (for external contributors)
2. **Create Feature Branch** from main
3. **Implement Changes** following our standards
4. **Write Tests** with appropriate coverage
5. **Run Quality Checks** locally
6. **Submit Pull Request** with detailed description
7. **Code Review Process** with educational assessment
8. **Merge After Approval** and CI validation

### Branch Naming Convention

**Branch Names Should Be:**
- Descriptive and concise
- Use kebab-case format
- Include type prefix when helpful

**Examples:**
```bash
# Feature branches
feature/enhance-error-handling
feature/add-request-logging
feature/improve-test-coverage

# Bug fix branches
fix/hello-endpoint-cors-headers
fix/server-shutdown-timeout
fix/memory-leak-in-parser

# Documentation branches
docs/update-contributing-guide
docs/add-api-examples
docs/improve-readme

# Educational content branches
education/add-learning-objectives
education/enhance-code-examples
education/improve-accessibility
```

### Setting Up Development Branch

```bash
# Create and checkout new feature branch
git checkout -b feature/your-feature-name

# Verify you're on the correct branch
git branch --show-current

# Make your changes following coding standards
# ... implement your feature ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add comprehensive error handling for hello endpoint

- Implement try-catch blocks for all request processing
- Add educational error messages for debugging
- Include error logging with request context
- Add unit tests for error scenarios
- Update documentation with error handling examples

Closes #123"
```

### Commit Message Standards

**Format:**
```
<type>(<scope>): <short description>

<detailed description>

<footer with issue references>
```

**Types:**
- `feat:` New features or enhancements
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions or improvements
- `refactor:` Code refactoring without behavior changes
- `style:` Code style/formatting changes
- `perf:` Performance improvements
- `education:` Educational content improvements

**Examples:**
```bash
feat(hello): add request timing and performance logging

- Implement performance timing measurement using process.hrtime()
- Add educational comments explaining timing measurement
- Include request duration in response headers for learning
- Add unit tests for timing functionality
- Update documentation with performance examples

Closes #45

fix(server): resolve graceful shutdown timeout issue

- Increase shutdown timeout from 5s to 10s
- Implement timeout logging for educational purposes
- Add proper cleanup for active connections
- Include shutdown timing in development logs

Fixes #67
```

### Pre-Submission Checklist

Before submitting a pull request, ensure you have completed:

**Code Quality:**
- [ ] Code follows project style guidelines
- [ ] Functions have appropriate JSDoc documentation
- [ ] Educational comments explain complex logic
- [ ] Error handling is comprehensive and educational

**Testing:**
- [ ] All existing tests pass: `npm test`
- [ ] New tests written for new functionality
- [ ] Coverage meets minimum thresholds: `npm run test:coverage`
- [ ] Integration tests pass: `npm run test:integration`

**Documentation:**
- [ ] README updated if needed
- [ ] API documentation updated for new endpoints
- [ ] Educational examples added where appropriate
- [ ] Inline code comments explain educational aspects

**Zero-Dependency Compliance:**
- [ ] No external dependencies added
- [ ] Only Node.js built-in modules used
- [ ] `npm ls` shows empty dependency tree
- [ ] Alternative approaches documented when relevant

### Local Quality Validation

```bash
# Run complete quality validation suite
npm run validate

# Or run individual checks:
npm run lint          # Code quality (when available)
npm test             # Full test suite
npm run test:coverage # Coverage validation
npm run test:integration # Integration tests
npm run dev          # Development server smoke test
```

## Pull Request Process

### Creating Effective Pull Requests

**Pull Request Title Format:**
```
<type>(<scope>): <concise description>
```

**Examples:**
- `feat(hello): add request logging and performance metrics`
- `fix(server): resolve port binding error handling`
- `docs(contrib): enhance testing section with examples`
- `education(examples): add beginner-friendly code comments`

### Pull Request Description Template

```markdown
## Description
Brief description of the changes and their purpose.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update
- [ ] Educational enhancement

## Educational Impact
Explain how these changes enhance the tutorial's learning value:
- What concepts do they demonstrate or clarify?
- How do they improve accessibility for different learning styles?
- What best practices do they showcase?

## Testing
- [ ] Tests pass locally with `npm test`
- [ ] Coverage meets requirements with `npm run test:coverage`
- [ ] Integration tests added/updated as needed
- [ ] Manual testing completed for new features

## Zero-Dependency Compliance
- [ ] No external dependencies added
- [ ] Only Node.js built-in modules used
- [ ] `npm ls` confirms empty dependency tree

## Documentation
- [ ] Code comments added for educational value
- [ ] README updated if needed
- [ ] API documentation updated for new endpoints
- [ ] Educational examples provided where appropriate

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly complex algorithms
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Screenshots/Examples (if applicable)
Include code examples, terminal output, or other relevant information.

## Related Issues
Closes #issue_number
```

### Code Review Process

**Review Criteria:**

**Functionality Review:**
- [ ] Code accomplishes stated objectives
- [ ] Edge cases and error scenarios handled appropriately
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

**Educational Assessment:**
- [ ] Code serves as good learning example
- [ ] Complexity level appropriate for tutorial audience  
- [ ] Educational comments enhance understanding
- [ ] Best practices demonstrated clearly

**Technical Standards:**
- [ ] Code style consistent with project guidelines
- [ ] Test coverage adequate (90%+ lines, 100% functions)
- [ ] Documentation complete and accurate
- [ ] Zero-dependency philosophy maintained

**Review Timeline Expectations:**
- **Initial Response:** Within 48 hours for acknowledgment
- **First Review:** Within 5 business days for substantive feedback
- **Follow-up Reviews:** Within 2 business days after changes
- **Final Approval:** When all criteria met and CI passes

### Addressing Review Feedback

**Responding to Feedback:**
1. **Acknowledge Comments:** Respond to each review comment
2. **Ask for Clarification:** If feedback is unclear, ask questions
3. **Implement Changes:** Address feedback systematically
4. **Update Tests:** Add tests for any new logic
5. **Document Changes:** Explain your implementation approach

**Example Response:**
```markdown
@reviewer Thanks for the thorough review! I've addressed your comments:

1. **Error handling improvement**: Added comprehensive try-catch blocks with educational logging as suggested in commit abc123

2. **Test coverage gap**: Added unit tests for edge cases, coverage now at 95% (see files: test/unit/new-feature.test.js)

3. **Documentation enhancement**: Expanded JSDoc comments and added inline explanations for complex algorithms

4. **Performance concern**: Implemented caching mechanism while maintaining educational clarity, added performance benchmarks

Ready for re-review when you have time!
```

### Merge Requirements

**Automated Requirements:**
- [ ] All CI checks pass (tests, linting, coverage)
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Coverage thresholds maintained

**Manual Review Requirements:**
- [ ] At least one approving review from maintainer
- [ ] Educational impact assessment completed
- [ ] Documentation review completed
- [ ] Zero-dependency compliance verified

**Post-Merge Process:**
1. **Delete Feature Branch** (keeps repository clean)
2. **Update Local Repository** with merged changes
3. **Close Related Issues** with reference to merged PR
4. **Update Project Documentation** if needed

## Code Review Guidelines

### For Reviewers

**Review Focus Areas:**

**1. Educational Value Assessment**
- Does the code serve as a good learning example?
- Are complex concepts explained with appropriate comments?
- Is the abstraction level appropriate for the tutorial audience?
- Do the examples demonstrate Node.js best practices?

**2. Technical Quality Review**
- Code functionality and correctness
- Error handling completeness and educational value
- Performance considerations without sacrificing clarity
- Security implications and safe coding practices

**3. Testing and Documentation**
- Test coverage adequate and educational
- Documentation clarity and completeness
- Code examples that enhance learning
- API documentation accuracy

**Educational Review Checklist:**
```markdown
## Educational Impact Review

### Learning Objectives
- [ ] Code aligns with tutorial learning objectives
- [ ] Demonstrates fundamental Node.js concepts clearly
- [ ] Appropriate complexity level for target audience
- [ ] Builds logically on previous tutorial content

### Code Clarity
- [ ] Functions have clear, descriptive names
- [ ] Educational comments explain "why" not just "what"
- [ ] Examples demonstrate best practices
- [ ] Error messages are helpful for learning

### Documentation Quality
- [ ] JSDoc comments complete and educational
- [ ] README sections updated appropriately
- [ ] Code examples enhance understanding
- [ ] Technical concepts explained accessibly

### Zero-Dependency Compliance
- [ ] Only Node.js built-in modules used
- [ ] Alternative approaches documented when relevant
- [ ] Educational value of dependency-free approach explained
- [ ] Performance trade-offs acknowledged when present
```

### For Contributors

**Preparing for Review:**

**Self-Review Process:**
1. **Read Your Own Code:** Review as if you're seeing it for the first time
2. **Check Educational Value:** Does your code teach effectively?
3. **Verify Standards Compliance:** Follow all coding and testing guidelines
4. **Test Thoroughly:** Ensure all scenarios work as expected

**Requesting Review:**
```markdown
## Review Request

### Summary
Brief explanation of changes and their educational purpose.

### Areas for Special Focus
- Complex algorithm in `utils/parser.js` - please verify educational clarity
- New error handling pattern - confirm it serves as good example
- Performance optimization - ensure it doesn't sacrifice learning value

### Testing Notes
- All tests pass locally
- Added integration tests for new endpoint
- Coverage maintained at 92% lines, 100% functions

### Questions for Reviewers
1. Is the complexity level appropriate for beginners?
2. Are the educational comments helpful or distracting?
3. Does the error handling demonstrate best practices clearly?
```

## Issue Reporting and Management

### Bug Report Template

When reporting bugs, please use this comprehensive template to help us understand and reproduce the issue quickly:

#### **Title Format:** Bug: [Brief description of the issue]

#### **Environment Information**
Please provide the following system details:

**Required Fields:**
- **Node.js version:** `node --version`
- **npm version:** `npm --version` 
- **Operating System:** OS name and version
- **Architecture:** x64, arm64, etc.
- **Terminal/Shell:** Command line interface used
- **Browser version:** If web-related issue

**Optional Fields:**
- **IDE/Editor:** Development environment used
- **Git version:** `git --version`
- **Additional tools:** Any other relevant software

#### **Bug Description**
Provide a clear and detailed description:

**What you expected to happen:**
[Describe the expected behavior]

**What actually happened:**
[Describe the actual behavior]

**Impact on learning objectives or functionality:**
[Explain how this affects the educational value or functionality]

**Error messages or console output:**
```
[Paste any error messages or console output here]
```

#### **Reproduction Steps**
Provide detailed steps to reproduce the bug:

1. **Step 1:** [First step with exact commands]
2. **Step 2:** [Second step with input data]
3. **Step 3:** [Continue with numbered steps]
4. **Result:** [What happens when these steps are followed]

**Exact commands executed:**
```bash
npm run dev
curl http://localhost:3000/hello
```

**Input data or configuration used:**
[Any specific data, environment variables, or configuration]

**Screenshots or terminal output (if helpful):**
[Attach relevant images or text output]

#### **Additional Context**
Any additional information that might be helpful:

- **Related issues or pull requests:** Links to related discussions
- **Workarounds discovered:** Temporary solutions found
- **Educational impact assessment:** How this affects learning experience
- **Suggestions for improvement:** Ideas for fixing or preventing the issue

---

### Feature Request Template

Use this template for suggesting new features or enhancements:

#### **Title Format:** Feature: [Brief description of the feature]

#### **Feature Description**
**What problem does this solve?**
[Describe the problem or gap this feature addresses]

**How does it enhance the educational value?**
[Explain how this improves the learning experience]

**Who would benefit from this feature?**
[Identify target audience: beginners, intermediate learners, educators]

**How does it align with zero-dependency philosophy?**
[Ensure compatibility with project constraints]

#### **Educational Justification**
**Learning objective enhancement:**
[How does this feature improve learning outcomes?]

**Concept clarity improvement:**
[What concepts does this help clarify or demonstrate?]

**Accessibility for different learning styles:**
[How does this accommodate diverse learning approaches?]

**Alignment with tutorial scope and goals:**
[How does this fit within current project boundaries?]

#### **Implementation Considerations**
**Implementation complexity:**
[Assess technical difficulty and development effort]

**Compatibility with existing code:**
[Consider impact on current functionality]

**Testing requirements:**
[What testing approach would be needed?]

**Documentation needs:**
[What documentation updates would be required?]

**Maintenance implications:**
[Long-term maintenance and support considerations]

#### **Alternatives Considered**
[List alternative solutions and explain why the proposed approach is preferred]

---

### Documentation Improvement Template

For suggesting documentation enhancements:

#### **Title Format:** Docs: [Area of documentation to improve]

#### **Current State**
**Which documentation section needs improvement:**
[Specify README, CONTRIBUTING.md, API docs, inline comments, etc.]

**What is unclear or missing:**
[Describe specific gaps or confusing content]

**How does it impact learning experience:**
[Explain the educational consequences of current state]

**Specific examples of confusion or gaps:**
[Provide concrete examples of problems]

#### **Proposed Improvements**
**Clarity enhancements:**
[Suggest specific wording or structural improvements]

**Additional examples or code snippets:**
[Propose new examples that would help understanding]

**Better organization or structure:**
[Recommend organizational improvements]

**Cross-references and navigation improvements:**
[Suggest linking and navigation enhancements]

**Educational progression optimization:**
[Recommend improvements to learning flow]

#### **Educational Impact**
**Learning effectiveness improvement:**
[How will these changes improve learning outcomes?]

**Accessibility for different experience levels:**
[How will this help learners with varying backgrounds?]

**Concept understanding enhancement:**
[What concepts will be clearer after improvements?]

**Practical application guidance:**
[How will this help with real-world application?]

---

### Issue Triage and Prioritization

#### **Priority Levels**

**Critical Priority**
- **Description:** Blocks core functionality or learning objectives
- **Examples:**
  - Server fails to start
  - Core `/hello` endpoint returns errors
  - Tests fail completely
  - Documentation has major errors that mislead learners
- **Response Time:** Within 24 hours
- **Assignment:** Immediately assigned to maintainers

**High Priority**
- **Description:** Significantly impacts educational experience
- **Examples:**
  - Confusing error messages that hinder learning
  - Missing important documentation sections
  - Performance issues that affect usability
  - Cross-platform compatibility problems
- **Response Time:** Within 48 hours
- **Assignment:** Assigned during next triage session

**Medium Priority**
- **Description:** Moderate impact with available workarounds
- **Examples:**
  - Minor documentation improvements
  - Code style inconsistencies
  - Enhancement suggestions for educational content
  - Non-critical feature requests
- **Response Time:** Within 1 week
- **Assignment:** Added to backlog for community contribution

**Low Priority**
- **Description:** Minor improvements or cosmetic issues
- **Examples:**
  - Typos in comments
  - Code formatting improvements
  - Minor optimizations
  - Cosmetic enhancements
- **Response Time:** Within 2 weeks
- **Assignment:** Good first issue for new contributors

#### **Issue Labels**

**Type Labels:**
- `bug` - Something isn't working
- `feature` - New feature or enhancement
- `documentation` - Documentation improvements
- `education` - Educational content enhancements
- `question` - Questions about usage or implementation

**Priority Labels:**
- `priority:critical` - Immediate attention required
- `priority:high` - High importance
- `priority:medium` - Medium importance
- `priority:low` - Low importance

**Status Labels:**
- `needs-triage` - Requires initial assessment
- `needs-reproduction` - Cannot reproduce the issue
- `needs-info` - More information needed
- `ready-for-work` - Ready to be worked on
- `in-progress` - Currently being worked on

**Difficulty Labels:**
- `good-first-issue` - Good for newcomers
- `help-wanted` - Community help desired
- `advanced` - Requires significant experience

**Area Labels:**
- `area:server` - HTTP server implementation
- `area:testing` - Testing infrastructure
- `area:docs` - Documentation
- `area:education` - Educational content
- `area:ci-cd` - Continuous integration/deployment

### Quality Standards for Issue Management

#### **Reporting Standards**
**Completeness:** All required template sections must be filled out
**Clarity:** Issues should be clear and understandable
**Reproducibility:** Bugs should include clear reproduction steps
**Educational alignment:** Requests should align with project educational goals

#### **Community Guidelines**
**Respectful communication:** Maintain respectful and constructive communication
**Educational focus:** Keep discussions focused on educational objectives
**Collaborative approach:** Encourage collaborative problem-solving
**Inclusive environment:** Foster inclusive environment for all contributors

#### **Response Standards**
- **Acknowledgment:** All issues acknowledged within 48 hours
- **Triage:** Issues triaged within 1 week
- **Updates:** Regular progress updates for in-progress issues
- **Resolution:** Clear communication when issues are resolved or closed

## Educational Alignment

### Learning Objectives Preservation

Every contribution to the Node.js Tutorial HTTP Server must align with and enhance our core educational objectives. This section outlines how to evaluate and maintain educational value while making improvements.

#### **Primary Learning Objectives**

**1. HTTP Server Fundamentals**
- Demonstrate basic HTTP server creation using Node.js
- Show request-response cycle implementation
- Illustrate proper HTTP status codes and headers
- Explain error handling in HTTP context

**Contribution Alignment Questions:**
- Does this change make HTTP concepts clearer or more complex?
- Are HTTP best practices properly demonstrated?
- Does the implementation show real-world applicable patterns?

**2. Node.js Built-in Module Usage**
- Showcase Node.js built-in capabilities without external dependencies
- Demonstrate event-driven, non-blocking I/O patterns
- Show proper use of Node.js APIs and conventions
- Illustrate Node.js performance characteristics

**Contribution Alignment Questions:**
- Does this maintain zero external dependencies?
- Are Node.js built-in modules used effectively?
- Is the Node.js programming model clearly demonstrated?

**3. JavaScript Server-Side Development**
- Show JavaScript usage in server environment
- Demonstrate proper error handling and async patterns
- Illustrate module system and code organization
- Show debugging and logging techniques

**Contribution Alignment Questions:**
- Does this demonstrate good JavaScript practices?
- Are modern JavaScript features used appropriately?
- Is the code readable and maintainable?

#### **Educational Impact Assessment Framework**

When reviewing contributions, use this framework to evaluate educational value:

**Clarity Assessment:**
```markdown
## Educational Clarity Review

### Concept Introduction
- [ ] New concepts introduced gradually
- [ ] Building on previously demonstrated knowledge
- [ ] Appropriate complexity for target audience
- [ ] Clear connection to real-world applications

### Code Readability
- [ ] Functions and variables have descriptive names
- [ ] Code structure follows logical progression
- [ ] Comments explain educational concepts, not just code
- [ ] Examples demonstrate best practices

### Learning Progression
- [ ] Changes maintain logical tutorial progression
- [ ] No knowledge gaps created by modifications
- [ ] Prerequisites clearly stated or demonstrated
- [ ] Follow-up learning opportunities identified
```

#### **Scope Maintenance Guidelines**

**In-Scope Educational Enhancements:**
- HTTP server implementation improvements
- Error handling and debugging demonstrations
- Performance monitoring and logging examples
- Code organization and architectural patterns
- Testing strategy demonstrations
- Development workflow improvements

**Scope Boundary Considerations:**
- **Database Integration:** Out of scope to maintain simplicity
- **Authentication/Authorization:** Beyond basic HTTP concepts
- **Complex Frameworks:** Would obscure fundamental concepts
- **Advanced Deployment:** Focus on development and basic operation

**Decision Framework for Scope Changes:**
```
1. Does this enhance understanding of core concepts?
   ├─ Yes → Consider for inclusion
   └─ No → Evaluate if creates complexity

2. Can beginners understand and learn from this?
   ├─ Yes → Strong candidate for inclusion
   └─ No → Consider alternative approaches

3. Does this align with zero-dependency philosophy?
   ├─ Yes → Proceed with evaluation
   └─ No → Reject or find alternative implementation

4. Is this applicable to real-world development?
   ├─ Yes → Good educational value
   └─ No → Consider if needed for completeness
```

### Target Audience Considerations

#### **Primary Audience: Beginning Node.js Developers**

**Characteristics:**
- Limited server-side JavaScript experience
- May be transitioning from frontend development
- Learning fundamental concepts for first time
- Need clear examples and explanations

**Contribution Guidelines:**
- Provide extensive comments explaining concepts
- Use descriptive variable and function names
- Include educational logging and error messages
- Document assumptions and prerequisites
- Show step-by-step progression

**Example Educational Enhancement:**
```javascript
// BEFORE: Minimal implementation
server.on('request', (req, res) => {
    if (req.url === '/hello') {
        res.end('Hello world');
    }
});

// AFTER: Educational implementation
server.on('request', (request, response) => {
    // Log incoming request for educational visibility
    console.log(`📥 Received ${request.method} request for ${request.url}`);
    
    // Demonstrate URL path matching for routing concept
    if (request.url === '/hello' && request.method === 'GET') {
        // Set proper HTTP headers (educational best practice)
        response.writeHead(200, {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache'
        });
        
        // Send response and log for learning visibility
        response.end('Hello world');
        console.log('✅ Hello endpoint responded successfully');
    } else {
        // Demonstrate proper 404 error handling
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Not Found');
        console.log(`❌ 404 response sent for ${request.url}`);
    }
});
```

#### **Secondary Audience: Technical Educators**

**Characteristics:**
- Need clear, correct examples for teaching
- Require comprehensive documentation
- Value progressive complexity
- Need examples that scale to real-world usage

**Contribution Guidelines:**
- Ensure technical accuracy for teaching use
- Provide multiple complexity levels when possible
- Include comprehensive documentation
- Show common patterns and anti-patterns
- Demonstrate testing and debugging techniques

### Accessibility and Inclusion

#### **Learning Style Accommodations**

**Visual Learners:**
- Include diagrams and flowcharts where helpful
- Use consistent code formatting and structure
- Provide clear visual hierarchy in documentation
- Use meaningful variable names that convey purpose

**Auditory Learners:**
- Include detailed explanations in comments
- Provide narrative flow in documentation
- Use descriptive logging that explains what's happening
- Include examples that can be "read aloud" clearly

**Kinesthetic Learners:**
- Provide hands-on examples and exercises
- Include step-by-step implementation guides
- Offer opportunities to modify and experiment
- Include troubleshooting and debugging scenarios

#### **Experience Level Accommodation**

**Complete Beginners:**
- Assume no prior Node.js knowledge
- Explain fundamental concepts before using them
- Provide extensive inline documentation
- Include links to relevant Node.js documentation

**Some Programming Experience:**
- Build on general programming knowledge
- Focus on Node.js-specific concepts
- Compare with other programming environments when helpful
- Explain JavaScript-specific patterns

**Transitioning Developers:**
- Compare with other server technologies when relevant
- Explain Node.js paradigm differences
- Show how concepts translate to real-world projects
- Provide migration/comparison examples when appropriate

## Documentation Standards

### Documentation Philosophy

Documentation in the Node.js Tutorial HTTP Server project serves dual purposes: **technical reference** and **educational content**. Every piece of documentation should help users understand not just *how* to use the code, but *why* it works the way it does and *what* they can learn from it.

#### **Documentation Principles**

**Educational First:** Documentation should teach concepts, not just describe functionality
**Progressive Complexity:** Start simple, build understanding gradually
**Practical Examples:** Include real, runnable examples with expected output
**Context Awareness:** Explain how each piece fits into the larger learning journey
**Accessibility:** Write for diverse learning styles and experience levels

### Code Documentation Standards

#### **Function Documentation (JSDoc)**

Every function must include comprehensive JSDoc comments:

```javascript
/**
 * Processes HTTP GET requests for the hello endpoint with comprehensive error
 * handling and educational logging. Demonstrates fundamental HTTP request-response
 * cycle patterns and proper Node.js server development practices.
 * 
 * Educational Concepts Demonstrated:
 * - HTTP method validation and appropriate error responses
 * - Proper HTTP header setting for different response types  
 * - Request logging for development visibility and debugging
 * - Error handling patterns for production-ready applications
 * 
 * @param {http.IncomingMessage} request - HTTP request object from Node.js built-in module
 * @param {http.ServerResponse} response - HTTP response object for sending data to client
 * @returns {Promise<void>} Resolves when response is sent, rejects on processing error
 * 
 * @throws {Error} Throws error if request processing fails critically
 * 
 * @example
 * // Basic usage in HTTP server
 * server.on('request', async (req, res) => {
 *     try {
 *         await handleHelloRequest(req, res);
 *     } catch (error) {
 *         console.error('Request handling failed:', error.message);
 *     }
 * });
 * 
 * @example
 * // Expected successful response
 * // HTTP/1.1 200 OK
 * // Content-Type: text/plain
 * // 
 * // Hello world
 * 
 * @since 1.0.0
 * @see {@link https://nodejs.org/api/http.html#http_class_http_incomingmessage} Node.js HTTP IncomingMessage
 * @see {@link https://nodejs.org/api/http.html#http_class_http_serverresponse} Node.js HTTP ServerResponse
 */
async function handleHelloRequest(request, response) {
    // Implementation here...
}
```

**JSDoc Required Elements:**
- **Description:** Clear explanation of function purpose and educational value
- **Educational Concepts:** What this function teaches or demonstrates
- **Parameters:** Complete type information and usage description
- **Returns:** Clear return value description with type
- **Throws:** Document any exceptions that may be thrown
- **Examples:** At least one practical usage example
- **Since:** Version when function was added
- **See:** Links to relevant Node.js documentation

#### **Class Documentation**

```javascript
/**
 * HTTP Server implementation that demonstrates fundamental Node.js server patterns
 * and educational best practices for learning server-side JavaScript development.
 * 
 * This class encapsulates core HTTP server functionality while maintaining educational
 * clarity and demonstrating proper Node.js patterns including event handling, error
 * management, and graceful lifecycle management.
 * 
 * Educational Objectives:
 * - Demonstrate proper server class design and encapsulation
 * - Show event-driven programming patterns with Node.js EventEmitter
 * - Illustrate server lifecycle management (start, stop, restart)
 * - Provide examples of error handling and logging in server context
 * - Show performance monitoring and health checking patterns
 * 
 * @class HttpServer
 * @extends {EventEmitter}
 * 
 * @example
 * // Basic server creation and startup
 * const server = new HttpServer({
 *     port: 3000,
 *     host: 'localhost'
 * });
 * 
 * // Start server with error handling
 * try {
 *     await server.start();
 *     console.log('Server started successfully');
 * } catch (error) {
 *     console.error('Server startup failed:', error.message);
 * }
 * 
 * @example
 * // Server with request handling
 * server.on('request', (req, res) => {
 *     console.log(`Received ${req.method} request for ${req.url}`);
 * });
 * 
 * // Graceful shutdown
 * process.on('SIGTERM', async () => {
 *     await server.stop();
 * });
 * 
 * @since 1.0.0
 */
class HttpServer extends EventEmitter {
    /**
     * Creates new HTTP server instance with configuration validation and
     * educational setup for learning Node.js server development patterns.
     * 
     * @param {Object} config - Server configuration object
     * @param {number} config.port - Port number for server binding (1-65535)
     * @param {string} config.host - Host address for server binding
     * @param {Object} [config.logger] - Logger instance for educational output
     * 
     * @throws {Error} Throws if configuration is invalid
     * 
     * @example
     * const server = new HttpServer({
     *     port: 3000,
     *     host: 'localhost',
     *     logger: console
     * });
     */
    constructor(config) {
        // Implementation...
    }
}
```

#### **Inline Comments for Complex Logic**

```javascript
// Demonstrate HTTP request parsing and validation
function parseHttpRequest(rawRequest) {
    try {
        // Extract HTTP method from request line (educational logging)
        const requestMethod = rawRequest.method.toUpperCase();
        console.log(`🔍 Processing HTTP ${requestMethod} request`);
        
        // URL parsing using Node.js built-in URL module (zero dependencies)
        // This demonstrates how to handle URL parsing without external libraries
        const parsedUrl = new URL(rawRequest.url, `http://${rawRequest.headers.host}`);
        
        // Educational note: pathname contains the path part of URL
        // e.g., for "http://localhost:3000/hello?name=world", pathname is "/hello"
        const urlPath = parsedUrl.pathname;
        
        // Route matching demonstration using simple string comparison
        // In production applications, this might use more sophisticated routing
        const isHelloEndpoint = (urlPath === '/hello');
        
        // Return structured request data for further processing
        return {
            method: requestMethod,
            path: urlPath,
            isHelloRoute: isHelloEndpoint,
            headers: rawRequest.headers,
            // Educational: Include parsing timestamp for request timing
            parsedAt: new Date().toISOString()
        };
        
    } catch (error) {
        // Educational error handling with context
        console.error('❌ Request parsing failed:', {
            error: error.message,
            requestUrl: rawRequest.url,
            requestMethod: rawRequest.method
        });
        
        // Re-throw with additional context for upstream handling
        throw new Error(`HTTP request parsing failed: ${error.message}`);
    }
}
```

### README Documentation

#### **Section Structure Requirements**

**Essential README Sections:**
1. **Project Title and Description**
2. **Educational Objectives**
3. **Quick Start Guide**
4. **Installation Instructions**
5. **Usage Examples**
6. **API Documentation**
7. **Development Setup**
8. **Testing Instructions**
9. **Contributing Guidelines**
10. **Educational Resources**

#### **Example README Section**

```markdown
## Educational Objectives

This Node.js tutorial application is designed to teach fundamental HTTP server concepts through practical implementation. By studying and working with this code, developers will learn:

### Primary Learning Goals

**HTTP Server Development:**
- Creating HTTP servers using Node.js built-in `http` module
- Understanding request-response cycle implementation
- Implementing proper HTTP status codes and headers
- Handling different HTTP methods and error scenarios

**Node.js Fundamentals:**
- Event-driven, non-blocking I/O patterns
- Using Node.js built-in modules without external dependencies
- Proper error handling and logging in server context
- Server lifecycle management (startup, operation, shutdown)

**Development Practices:**
- Test-driven development with Node.js built-in test runner
- Code organization and modular architecture
- Documentation and educational code comments
- Development workflow with hot reloading and debugging

### Target Audience

**Primary Learners:**
- Developers new to Node.js server-side development
- Frontend developers transitioning to backend technologies
- Students learning HTTP and web server concepts
- Educators seeking practical Node.js examples

**Learning Prerequisites:**
- Basic JavaScript knowledge (variables, functions, objects)
- Understanding of HTTP concepts (requests, responses, status codes)
- Command line familiarity for running npm commands
- Text editor or IDE for code examination

### Educational Approach

This tutorial follows a **progressive complexity** approach:

1. **Foundation:** Start with basic HTTP server creation
2. **Routing:** Add URL path handling and routing logic
3. **Error Handling:** Implement comprehensive error management
4. **Testing:** Add comprehensive test coverage and validation
5. **Development Workflow:** Establish professional development practices

Each concept builds upon previous knowledge while maintaining clarity and educational value.
```

### API Documentation Standards

#### **Endpoint Documentation Template**

```markdown
### GET /hello

Returns a simple "Hello world" message to demonstrate basic HTTP endpoint implementation and response generation.

**Educational Purpose:** Demonstrates fundamental HTTP request-response cycle with proper status codes and headers.

#### Request

**HTTP Method:** `GET`
**URL Path:** `/hello`
**Query Parameters:** None
**Request Headers:** None required
**Request Body:** None

#### Response

**Success Response (200 OK):**

```http
HTTP/1.1 200 OK
Content-Type: text/plain
Content-Length: 11
Date: Wed, 21 Aug 2024 12:00:00 GMT

Hello world
```

**Response Headers:**
- `Content-Type: text/plain` - Indicates plain text response
- `Content-Length: 11` - Byte length of response body
- `Date` - Server response timestamp

#### Error Responses

**404 Not Found (Invalid Path):**

```http
HTTP/1.1 404 Not Found
Content-Type: text/plain
Content-Length: 9

Not Found
```

**405 Method Not Allowed (Non-GET Request):**

```http
HTTP/1.1 405 Method Not Allowed
Content-Type: text/plain
Allow: GET

Method Not Allowed
```

#### Usage Examples

**Command Line (curl):**
```bash
# Basic request
curl http://localhost:3000/hello

# With verbose output to see headers
curl -v http://localhost:3000/hello

# Expected output:
# Hello world
```

**Browser:**
Navigate to `http://localhost:3000/hello` in your web browser. You should see "Hello world" displayed as plain text.

**JavaScript (Node.js):**
```javascript
// Using Node.js built-in http module
import http from 'node:http';

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/hello',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    res.on('data', (chunk) => {
        console.log(`Body: ${chunk}`);
    });
});

req.end();
```

#### Educational Notes

**HTTP Concepts Demonstrated:**
- **Request-Response Cycle:** Shows complete HTTP transaction
- **Status Codes:** Proper use of 200, 404, and 405 status codes
- **Headers:** Content-Type and other standard HTTP headers
- **Method Validation:** Demonstrates HTTP method handling

**Node.js Patterns Shown:**
- Built-in HTTP module usage without external dependencies
- Request object property access (`method`, `url`)
- Response object methods (`writeHead`, `end`)
- Proper error handling and logging
```

## Release Process

### Version Management

The Node.js Tutorial HTTP Server follows **Semantic Versioning (SemVer) 2.0.0** principles with educational considerations for version increments.

#### **Version Format: MAJOR.MINOR.PATCH**

**MAJOR Version (X.0.0)**
- Breaking changes that affect learning progression
- Fundamental architectural changes
- Node.js version requirement updates (e.g., LTS changes)
- Changes that require updates to existing tutorials or documentation

**MINOR Version (0.X.0)**
- New educational features or endpoints
- Enhanced error handling or logging capabilities
- New development tools or workflow improvements
- Backward-compatible functionality additions

**PATCH Version (0.0.X)**
- Bug fixes that don't change functionality
- Documentation improvements and clarifications
- Code comment enhancements
- Test improvements without functionality changes

#### **Educational Version Considerations**

**Learning Impact Assessment:**
```markdown
## Version Impact Review

### Educational Compatibility
- [ ] Existing tutorials remain valid
- [ ] Learning progression maintains logical flow
- [ ] No knowledge gaps created by changes
- [ ] Educational examples still work correctly

### Documentation Alignment
- [ ] All documentation updated for new version
- [ ] Educational examples tested and verified
- [ ] Migration guides provided if needed
- [ ] Learning objectives still achievable
```

### Release Planning

#### **Release Schedule**

**Major Releases:** Annual or bi-annual
- Aligned with Node.js LTS schedule
- Comprehensive educational review
- Community feedback integration period

**Minor Releases:** Quarterly
- Feature additions and enhancements
- Educational content improvements
- Development workflow enhancements

**Patch Releases:** As needed
- Bug fixes and critical issues
- Documentation corrections
- Security updates (if applicable)

#### **Pre-Release Process**

**Release Candidate (RC) Phase:**
```bash
# Create release candidate
npm version prerelease --preid=rc
# Example: 1.2.0-rc.1

# Test with educational scenarios
npm run test:full
npm run test:educational
npm run validate:tutorials

# Community testing period (1-2 weeks)
# Gather feedback and fix issues

# Final release candidate
npm version prerelease --preid=rc
# Example: 1.2.0-rc.2
```

**Educational Validation Checklist:**
- [ ] All learning objectives achievable with new version
- [ ] Tutorial progression logical and complete
- [ ] Examples work correctly and demonstrate concepts
- [ ] Documentation accurate and helpful
- [ ] Error messages educational and clear
- [ ] Performance acceptable for tutorial usage

### Changelog Maintenance

#### **Changelog Format**

Each release includes a comprehensive changelog following [Keep a Changelog](https://keepachangelog.com/) format with educational annotations:

```markdown
# Changelog

All notable changes to the Node.js Tutorial HTTP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-03-15

### Added
- **Educational Enhancement:** Comprehensive request logging with educational annotations
  - Shows complete request-response cycle for learning visibility
  - Includes timestamp and performance metrics for debugging education
  - Demonstrates proper logging patterns for production applications
  
- **Development Workflow:** Hot reloading with file watching capabilities
  - Automatically restarts server when code changes for efficient development
  - Educational comments explain file watching patterns
  - Demonstrates Node.js `fs.watch()` usage without external dependencies

### Changed
- **Educational Improvement:** Enhanced error messages with learning context
  - Error messages now include educational explanations
  - Demonstrates proper error handling hierarchy
  - Shows debugging techniques for common server issues

### Fixed
- **Bug Fix:** Resolved port binding error handling in development mode
  - Proper error detection and user-friendly messages
  - Educational demonstration of network error handling
  - Improved graceful degradation patterns

### Educational Impact
- **Learning Objective Enhancement:** Better demonstration of Node.js event-driven patterns
- **Tutorial Progression:** Smoother learning curve with improved examples
- **Accessibility Improvement:** More comprehensive explanations for beginners
- **Real-world Relevance:** Patterns applicable to production server development

### Migration Guide
No breaking changes. All existing code and tutorials continue to work without modification.

## [1.1.1] - 2024-02-28

### Fixed
- **Documentation:** Corrected code examples in README.md
- **Educational Content:** Fixed inconsistent variable naming in tutorials
- **Testing:** Resolved test flakiness in CI environment

### Educational Impact
- **Clarity Improvement:** Consistent code examples reduce confusion
- **Learning Reliability:** Stable test suite ensures consistent learning experience
```

#### **Educational Release Notes Template**

```markdown
## Educational Release Notes - Version X.Y.Z

### What's New for Learners

**Enhanced Learning Experience:**
- [Describe how new features improve learning]
- [Explain any new concepts introduced]
- [Detail improved explanations or examples]

**Educational Examples Added:**
- [List new code examples and their learning objectives]
- [Describe new patterns demonstrated]
- [Explain real-world applications shown]

**Documentation Improvements:**
- [Detail documentation enhancements]
- [List new explanations or clarifications]
- [Describe improved tutorials or guides]

### For Educators

**Teaching Resources:**
- [List resources useful for classroom instruction]
- [Describe assessment or exercise opportunities]
- [Explain concepts suitable for different learning levels]

**Technical Accuracy:**
- [Confirm technical correctness for teaching]
- [List any corrections to previous content]
- [Describe improved best practice demonstrations]

### For Contributors

**Development Changes:**
- [Describe changes affecting contribution workflow]
- [List new development tools or processes]
- [Explain any new coding standards or guidelines]

**Testing Improvements:**
- [Detail test coverage or quality improvements]
- [Describe new testing tools or approaches]
- [Explain validation processes for educational content]

### Compatibility and Migration

**Node.js Compatibility:**
- Tested with Node.js v22.x LTS
- Compatible with Node.js v20.x LTS (maintenance mode)
- No external dependency changes (still zero dependencies)

**Learning Path Compatibility:**
- All existing tutorials remain valid
- No breaking changes to educational progression
- Enhanced examples maintain backward compatibility
```

### Release Execution

#### **Release Checklist**

```markdown
## Pre-Release Checklist

### Code Quality Validation
- [ ] All tests pass: `npm run test:full`
- [ ] Coverage meets requirements: `npm run test:coverage`
- [ ] No linting errors: `npm run lint`
- [ ] Educational examples tested manually
- [ ] Documentation accuracy verified

### Educational Validation
- [ ] Learning objectives still achievable
- [ ] Tutorial progression tested end-to-end  
- [ ] Examples produce expected output
- [ ] Error scenarios demonstrate proper handling
- [ ] Educational comments reviewed and updated

### Documentation Updates
- [ ] README.md updated with new features
- [ ] CHANGELOG.md updated with complete changes
- [ ] API documentation reflects current functionality
- [ ] Educational examples updated and tested
- [ ] Migration guide provided if needed

### Version Management
- [ ] Version number follows SemVer conventions
- [ ] Git tags prepared for release
- [ ] Package.json version updated
- [ ] Educational metadata updated

### Community Communication
- [ ] Release notes drafted with educational focus
- [ ] Breaking changes communicated clearly
- [ ] Migration instructions provided
- [ ] Community feedback addressed
```

#### **Release Commands**

```bash
# Ensure clean working directory
git status
git pull origin main

# Run comprehensive validation
npm run validate:release

# Update version (automatically updates package.json and creates git tag)
npm version [major|minor|patch]

# Example outputs:
# npm version patch    -> 1.1.1
# npm version minor    -> 1.2.0  
# npm version major    -> 2.0.0

# Push changes and tags
git push origin main --tags

# Create GitHub release with educational notes
# (Done through GitHub interface or CLI)

# Verify release artifacts
git tag -l
npm view . version
```

#### **Post-Release Activities**

**Community Communication:**
- Announce release in project discussions
- Share educational improvements with learning community
- Update any external tutorial references
- Gather feedback on educational effectiveness

**Monitoring and Support:**
- Monitor for issues with new release
- Respond to community questions quickly
- Address any educational confusion
- Plan hotfixes if critical issues discovered

**Documentation Maintenance:**
- Ensure all links work correctly
- Verify examples execute successfully
- Update any screenshots or visual content
- Review and update educational assessments

## Community and Support

### Communication Channels

#### **Primary Channels**

**GitHub Discussions**
- **Purpose:** General project discussion, feature requests, educational questions
- **Audience:** All community members, learners, educators, contributors
- **Response Time:** Within 48 hours for questions, ongoing for discussions
- **Guidelines:** Keep discussions focused on educational value and project objectives

**GitHub Issues**
- **Purpose:** Bug reports, specific feature requests, documentation issues
- **Audience:** Contributors, maintainers, users experiencing problems
- **Response Time:** Within 24 hours for acknowledgment, varies by priority
- **Guidelines:** Use provided templates, include educational impact assessment

**Pull Request Comments**
- **Purpose:** Code review, implementation discussion, educational alignment
- **Audience:** Contributors, reviewers, maintainers
- **Response Time:** Within 48 hours for initial review, 24 hours for follow-ups
- **Guidelines:** Focus on educational value and code quality

#### **Community Guidelines for Communication**

**Respectful Interaction:**
- Treat all community members with respect and professionalism
- Use inclusive language that welcomes diverse backgrounds
- Provide constructive feedback focused on improvement
- Acknowledge different experience levels and learning styles

**Educational Focus:**
- Frame discussions around learning objectives and educational value
- Share knowledge generously and encourage questions
- Provide context and explanations for technical decisions
- Help others understand concepts rather than just providing solutions

**Collaborative Approach:**
- Work together to solve problems and improve the project
- Share different perspectives and approaches
- Build on others' ideas constructively
- Recognize and celebrate contributions from all community members

### Mentorship and Learning Support

#### **New Contributor Onboarding**

**Welcome Process:**
1. **Introduction:** Personal welcome message with project overview
2. **Learning Path:** Recommended progression through codebase and documentation
3. **First Contribution:** Guidance toward appropriate first issues
4. **Mentorship Matching:** Connection with experienced contributor for guidance
5. **Check-in Schedule:** Regular touchpoints to address questions and provide support

**Mentorship Program:**
- **Mentor Assignment:** Experienced contributors volunteer as mentors
- **Structured Support:** Regular check-ins and guidance sessions
- **Learning Goals:** Collaborative goal setting for contributor development
- **Knowledge Sharing:** Both technical and educational best practices
- **Recognition:** Celebrate learning milestones and contributions

#### **Learning Resources and Support**

**Educational Resources:**
- **Code Walkthrough Videos:** Planned video content explaining key concepts
- **Tutorial Series:** Step-by-step learning progression through project
- **Reference Documentation:** Comprehensive API and concept documentation
- **Example Projects:** Extended examples showing real-world applications

**Office Hours and Q&A:**
- **Monthly Q&A Sessions:** Community calls for questions and discussion
- **Maintainer Availability:** Scheduled times for direct questions
- **Peer Learning:** Community member knowledge sharing sessions
- **Educational Review:** Feedback sessions on learning effectiveness

### Recognition and Appreciation

#### **Contribution Recognition**

**Types of Recognition:**
- **Code Contributors:** Technical improvements and feature additions
- **Documentation Contributors:** Educational content and documentation improvements
- **Community Contributors:** Support, mentorship, and community building
- **Educational Contributors:** Learning content, tutorials, and teaching resources

**Recognition Methods:**
- **Contributor Listing:** Maintained list of all contributors with contribution types
- **Release Notes:** Acknowledgment in release announcements
- **Project Documentation:** Recognition in README and project materials
- **Community Showcasing:** Highlighting contributions in discussions and communications

#### **Contributor Appreciation Framework**

**Learning Impact Recognition:**
```markdown
## Educational Contribution Recognition

### Learning Enhancement Contributions
Contributors who improve educational value through:
- Code clarity and educational comments
- Documentation improvements and examples
- Tutorial content and learning resources
- Accessibility improvements for diverse learners

### Community Support Contributions  
Contributors who support community learning through:
- Mentorship and guidance for new contributors
- Question answering and problem-solving support
- Community discussion facilitation
- Inclusive environment creation and maintenance

### Technical Excellence Contributions
Contributors who maintain technical quality through:
- Bug fixes and performance improvements
- Test coverage and quality improvements
- Code review and quality assurance
- Security and reliability enhancements
```

### Community Health and Growth

#### **Diversity and Inclusion Initiatives**

**Inclusive Environment:**
- **Welcoming New Contributors:** Special attention to first-time contributors
- **Diverse Perspectives:** Encourage contributions from varied backgrounds
- **Learning Style Accommodation:** Support different approaches to learning
- **Accessibility Focus:** Ensure content is accessible to all learners

**Outreach and Growth:**
- **Educational Institution Partnerships:** Connections with schools and bootcamps
- **Conference and Event Participation:** Sharing educational approaches
- **Content Creation:** Blog posts, tutorials, and educational materials
- **Community Building:** Foster connections between learners and educators

#### **Feedback and Improvement**

**Community Feedback Mechanisms:**
- **Quarterly Surveys:** Community satisfaction and improvement suggestions
- **Educational Effectiveness Review:** Assessment of learning outcomes
- **Contribution Experience Evaluation:** Feedback on contribution process
- **Continuous Improvement:** Regular review and enhancement of community practices

**Project Evolution Based on Community Input:**
- **Feature Prioritization:** Community input on development priorities
- **Educational Content Direction:** Community guidance on learning content
- **Process Improvement:** Community feedback on contribution workflows
- **Tool and Resource Development:** Community-driven tool and resource creation

## FAQ

### General Project Questions

#### **Q: What is the main purpose of this project?**
A: The Node.js Tutorial HTTP Server is an educational project designed to teach fundamental HTTP server concepts using Node.js built-in modules. It serves as a practical learning resource for developers new to server-side JavaScript development, demonstrating core concepts without the complexity of external frameworks or dependencies.

#### **Q: Why does this project avoid external dependencies?**
A: We maintain a zero-dependency approach for several educational reasons:
- **Learning Focus:** Students learn Node.js fundamentals without framework abstractions
- **Concept Clarity:** Direct use of Node.js APIs makes underlying concepts visible
- **Reduced Complexity:** Eliminates cognitive load from learning multiple tools simultaneously
- **Long-term Stability:** No breaking changes from external package updates
- **Security Benefits:** Minimal attack surface with no third-party dependencies

#### **Q: Who is the target audience for this project?**
A: Our primary audiences include:
- **Beginning Node.js Developers:** Learning server-side JavaScript for the first time
- **Frontend Developers:** Transitioning to backend development
- **Students and Educators:** Requiring practical HTTP server examples
- **Self-Taught Developers:** Seeking clear, well-documented learning resources

### Getting Started Questions

#### **Q: What do I need to install to contribute?**
A: You need:
- **Node.js v22.x LTS** (minimum v22.11.0) - Download from nodejs.org
- **npm v11.5.2 or higher** (comes with Node.js)
- **Git** for version control
- **Text editor or IDE** (VS Code recommended)

Verify your installation:
```bash
node --version  # Should show v22.11.0+
npm --version   # Should show 11.5.2+
git --version   # Any recent version
```

#### **Q: How do I run the project locally?**
A: Follow these steps:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the backend directory
cd src/backend

# Start the development server
npm run dev

# Test the server (in another terminal)
curl http://localhost:3000/hello
# Expected response: "Hello world"
```

#### **Q: The server won't start - what should I check?**
A: Common issues and solutions:

| Problem | Solution |
|---------|----------|
| "Port 3000 in use" | Run `npx kill-port 3000` or use different port |
| "Node.js version mismatch" | Install Node.js v22.x LTS from nodejs.org |
| "npm command not found" | Reinstall Node.js with npm or check PATH |
| "Permission denied" | Check file permissions or run with appropriate privileges |

### Development and Contribution Questions

#### **Q: How do I find good first issues to work on?**
A: Look for issues labeled:
- **"good first issue"** - Suitable for newcomers
- **"help wanted"** - Community assistance desired
- **"documentation"** - Documentation improvements
- **"education"** - Educational content enhancements

Start with documentation or test improvements to familiarize yourself with the codebase.

#### **Q: What coding standards should I follow?**
A: Our key standards include:
- **2 spaces for indentation** (no tabs)
- **Single quotes for strings**
- **Comprehensive JSDoc comments** for all functions
- **Educational inline comments** for complex logic
- **Descriptive variable names** that explain purpose
- **Error handling with educational context**

See the [Coding Standards](#coding-standards) section for complete guidelines.

#### **Q: How do I run tests and ensure quality?**
A: Use these commands:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage  # Should show 90%+ coverage

# Run specific test types
npm run test:unit      # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e       # End-to-end tests

# Run quality checks
npm run lint           # Code quality (when available)
```

#### **Q: What should I include in a pull request?**
A: Every PR should include:
- **Clear description** of changes and educational purpose
- **Comprehensive tests** with appropriate coverage
- **Updated documentation** reflecting changes
- **Educational comments** explaining concepts
- **Zero-dependency compliance** verification

Use our [Pull Request Template](#pull-request-process) for guidance.

### Educational and Learning Questions

#### **Q: What Node.js concepts does this project teach?**
A: Key learning objectives include:
- **HTTP Server Creation:** Using Node.js built-in `http` module
- **Request-Response Cycle:** Understanding HTTP communication patterns
- **Event-Driven Programming:** Node.js asynchronous patterns
- **Error Handling:** Proper error management in server context
- **Testing:** Using Node.js built-in test runner
- **Development Workflow:** Professional development practices

#### **Q: Is this suitable for complete beginners?**
A: Yes, but with prerequisites:

**Required Knowledge:**
- **Basic JavaScript:** Variables, functions, objects, and arrays
- **HTTP Concepts:** Understanding requests, responses, and status codes
- **Command Line:** Basic terminal/command prompt usage
- **Text Editing:** Familiarity with code editors

**Learning Approach:**
- Start by examining existing code structure
- Run the server and test endpoints
- Make small modifications to understand behavior
- Progress to larger features as understanding grows

#### **Q: How does this compare to using frameworks like Express.js?**
A: This project complements framework learning:

**Educational Benefits:**
- **Foundation Understanding:** Learn underlying concepts before abstractions
- **Framework Appreciation:** Better understand what frameworks provide
- **Debugging Skills:** Understand root causes of issues
- **Performance Awareness:** Recognize optimization opportunities

**When to Use Frameworks:**
- **Production Applications:** Frameworks provide tested, optimized solutions
- **Rapid Development:** Frameworks accelerate development for common patterns
- **Team Projects:** Standardized patterns improve collaboration
- **Complex Requirements:** Advanced features like authentication, middleware chains

### Technical Questions

#### **Q: Why Node.js v22.x specifically?**
A: We use Node.js v22.x LTS for:
- **Latest Features:** Access to newest Node.js capabilities
- **Long-term Support:** Guaranteed updates and security patches
- **Educational Currency:** Teaching current, relevant technology
- **Performance Benefits:** Latest V8 engine improvements
- **Built-in Test Runner:** Native testing without external tools

#### **Q: Can I use this code in production?**
A: This is designed for education, but concepts apply to production:

**Educational Code Characteristics:**
- **Extensive Comments:** More verbose than typical production code
- **Simple Architecture:** Basic patterns suitable for learning
- **Limited Features:** Focused on core concepts only
- **Error Verbosity:** Educational error messages for learning

**Production Considerations:**
- **Security Hardening:** Add authentication, input validation, rate limiting
- **Performance Optimization:** Implement caching, compression, clustering
- **Monitoring:** Add comprehensive logging and metrics
- **Deployment:** Configure for production environment requirements

#### **Q: How do I debug issues in the server?**
A: Debugging strategies:

**Development Mode:**
```bash
# Start with verbose logging
npm run dev

# The server logs all requests and responses
# Watch console output for educational information
```

**Manual Testing:**
```bash
# Test endpoints directly
curl -v http://localhost:3000/hello

# Check different scenarios
curl -v http://localhost:3000/nonexistent  # Should return 404
curl -v -X POST http://localhost:3000/hello  # Should return 405
```

**Code Investigation:**
- **Add Console Logs:** Insert educational logging at key points
- **Use Node.js Debugger:** Run with `node --inspect` for debugging
- **Check Test Output:** Tests often reveal expected behavior
- **Review Error Messages:** Educational error messages provide context

### Community and Support Questions

#### **Q: How do I get help with contributions?**
A: Multiple support options available:
- **GitHub Discussions:** Ask questions and get community help
- **Issue Comments:** Ask for clarification on specific issues
- **Pull Request Reviews:** Get feedback during the contribution process
- **Mentorship Program:** Connect with experienced contributors
- **Documentation:** Comprehensive guides and examples available

#### **Q: How can I help improve the educational value?**
A: Educational contributions are highly valued:

**Content Improvements:**
- **Code Comments:** Add or improve educational explanations
- **Documentation:** Enhance learning guides and examples
- **Tutorials:** Create step-by-step learning content
- **Examples:** Develop practical usage demonstrations

**Community Support:**
- **Answer Questions:** Help other learners understand concepts
- **Review PRs:** Provide educational feedback on contributions
- **Mentorship:** Guide new contributors through learning process
- **Feedback:** Share insights on learning effectiveness

#### **Q: What if I disagree with educational approaches?**
A: We welcome constructive feedback:
- **Open Discussions:** Share alternative approaches and rationales
- **Educational Justification:** Explain learning benefits of suggestions
- **Experimentation:** Propose trials of different approaches
- **Community Input:** Gather feedback from other learners and educators

All educational decisions are made with community input and learning effectiveness as primary criteria.

---

*This contributing guide is a living document that evolves with our community and educational objectives. Your feedback and contributions to improving this guide are always welcome.*