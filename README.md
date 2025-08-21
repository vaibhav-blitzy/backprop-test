# Node.js Tutorial HTTP Server

Learn HTTP Server Fundamentals with Node.js Built-in Modules

[![Node.js v22.x LTS](https://img.shields.io/badge/Node.js-v22.x%20LTS-green.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-blue.svg)](#technology-stack)
[![Educational Tutorial](https://img.shields.io/badge/Type-Educational%20Tutorial-orange.svg)](#educational-objectives)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Beginner Friendly](https://img.shields.io/badge/Level-Beginner%20Friendly-lightgreen.svg)](#educational-objectives)

A comprehensive educational tutorial demonstrating HTTP server creation using Node.js built-in modules. Features a simple `/hello` endpoint that returns 'Hello world' while teaching fundamental web server concepts, request-response patterns, and production-ready Node.js development practices.

## Table of Contents

- [🎯 Overview](#-overview)
- [🚀 Quick Start](#-quick-start)
- [📚 Educational Objectives](#-educational-objectives)
- [🏗️ Project Structure](#️-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [💡 Usage Examples](#-usage-examples)
- [🧪 Testing](#-testing)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

This Node.js tutorial application demonstrates the creation of a simple HTTP server using only Node.js built-in modules. The server implements a single `/hello` endpoint that returns a 'Hello world' response, serving as a foundational example for learning HTTP server concepts, request-response patterns, and Node.js development best practices.

### Key Features

- **Zero External Dependencies** - Uses only Node.js built-in HTTP module
- **Educational Focus** - Clear, well-documented code with learning objectives
- **Production-Ready Patterns** - Industry-standard practices with tutorial simplicity
- **Comprehensive Testing** - Uses Node.js built-in test runner with 85%+ coverage
- **Cross-Platform** - Compatible with Windows, macOS, and Linux
- **Modern Node.js** - Built for Node.js v22.x LTS with ES modules support

### Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Runtime** | Node.js v22.x LTS (Active LTS - Jod) | JavaScript runtime environment |
| **Package Manager** | npm 11.5.2+ | Package management and script execution |
| **Module System** | CommonJS | Modern JavaScript module system |
| **Testing** | Node.js built-in test runner | Zero-dependency testing framework |
| **Dependencies** | Zero external dependencies | Uses only Node.js built-in modules |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v22.x LTS installed ([Download here](https://nodejs.org/))
- Basic command line familiarity
- Text editor or IDE
- Web browser for testing

### Setup Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd nodejs-tutorial-http-server
```

#### 2. Navigate to Backend
```bash
cd src/backend
```

#### 3. Verify Node.js Version
```bash
node --version
# Should show v22.x.x
npm --version
# Should show 11.5.2+
```

#### 4. Start the Server
```bash
npm start
# or
node server.js
```

#### 5. Test the Endpoint
Open your browser and visit [http://localhost:3000/hello](http://localhost:3000/hello)

**Expected Result**: You should see 'Hello world' displayed in your browser

### Verification Commands

| Command | Description | Expected Result |
|---------|-------------|-----------------|
| `curl http://localhost:3000/hello` | Test endpoint via command line | `Hello world` |
| `npm test` | Run the complete test suite | All tests pass |
| `npm run test:coverage` | Run tests with coverage analysis | 85%+ coverage |

---

## 📚 Educational Objectives

### Learning Goals

- **HTTP Server Creation** - Learn to create HTTP servers using Node.js built-in modules
- **Request-Response Cycle** - Understand HTTP protocol fundamentals and communication patterns
- **Event-Driven Architecture** - Experience Node.js event loop and non-blocking I/O concepts
- **Error Handling** - Implement comprehensive error management and HTTP status codes
- **Testing Strategies** - Use Node.js built-in test runner for quality assurance
- **Configuration Management** - Handle environment variables and application configuration
- **Production Patterns** - Apply industry-standard practices in a learning context

### Concepts Demonstrated

- Node.js HTTP module usage and server creation
- URL routing and endpoint implementation
- HTTP status codes and response formatting
- Middleware patterns and request processing
- Application lifecycle management
- Structured logging and monitoring
- Zero-dependency development philosophy
- Modern Node.js development practices

### Target Audience

- **Beginner Developers** - New to Node.js and backend development
- **Students** - Learning web development and HTTP protocols
- **Educators** - Teaching Node.js and server-side concepts
- **Experienced Developers** - Exploring Node.js built-in capabilities

---

## 🏗️ Project Structure

The project follows a modular architecture with clear separation of concerns, demonstrating professional Node.js application organization while maintaining educational clarity.

### Root Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation (this file) |
| `LICENSE` | MIT license terms and conditions |
| `CONTRIBUTING.md` | Guidelines for contributing to the project |
| `CHANGELOG.md` | Project version history and changes |

### Backend Structure

**Main Application Files**:
- `server.js` - Main server entry point and application bootstrap
- `app.js` - Application orchestration and component coordination  
- `package.json` - Project configuration and npm scripts

**Core Directories**:

```
src/backend/
├── config/              # Application and server configuration files
├── constants/           # Application constants and message definitions
├── controllers/         # HTTP request controllers implementing MVC pattern
├── docs/                # Comprehensive backend documentation
├── examples/            # Usage examples and code demonstrations
├── lib/                 # Core application libraries and utilities
├── middleware/          # HTTP middleware for request processing
├── routes/              # Route definitions and routing configuration
├── scripts/             # Development, testing, and utility scripts
├── services/            # Business logic services and application logic
├── test/                # Comprehensive test suite
├── types/               # Type definitions and data structures
└── utils/               # Utility functions and helper modules
```

### Architecture Highlights

- **Modular Design** - Clear separation of concerns with focused components
- **MVC Pattern** - Controllers, services, and route organization
- **Comprehensive Testing** - Unit, integration, and end-to-end tests
- **Documentation** - Extensive docs for learning and contribution
- **Quality Automation** - CI/CD workflows and quality gates

---

## ⚙️ Installation & Setup

### System Requirements

**Minimum Requirements**:
- **Operating System:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory:** 512 MB RAM minimum, 1 GB recommended
- **Storage:** 100 MB free space for project files
- **Network:** Internet connection for initial setup

**Software Requirements**:
- **Node.js v22.x LTS** - [Download from nodejs.org](https://nodejs.org/)
- **npm 11.5.2+** - Included with Node.js installation
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Text Editor** - VS Code, WebStorm, or similar recommended

### Detailed Setup

#### Environment Verification
```bash
# Verify Node.js installation
node --version
# Expected: v22.x.x

# Verify npm installation
npm --version
# Expected: 11.5.2 or higher
```

#### Project Setup
```bash
# Clone the repository
git clone <repository-url>
cd nodejs-tutorial-http-server

# Navigate to backend directory
cd src/backend

# Verify zero dependencies
npm install
# Should complete with no packages installed
```

#### Application Testing
```bash
# Start the server
npm start

# In another terminal, test the endpoint
curl http://localhost:3000/hello
# Expected response: Hello world

# Stop the server
# Press Ctrl+C in the server terminal
```

#### Development Setup
```bash
# Run tests to verify functionality
npm test

# Run tests with coverage
npm run test:coverage

# Start development server with enhanced logging
npm run dev
```

---

## 💡 Usage Examples

### Basic Server Usage

#### Start the server and test the hello endpoint
```bash
# Terminal 1: Start the server
cd src/backend
npm start
# Server will start on http://localhost:3000

# Terminal 2: Test the endpoint
curl http://localhost:3000/hello
# Response: Hello world
```

#### Test with different HTTP clients
```bash
# Using curl
curl -i http://localhost:3000/hello

# Using wget
wget -qO- http://localhost:3000/hello

# Using Node.js http module
node -e "require('http').get('http://localhost:3000/hello', r => r.on('data', d => console.log(d.toString())))"
```

### Development Workflow

#### Development server with enhanced logging
```bash
# Start development server
npm run dev

# The server will start with:
# - Enhanced logging output
# - File watching capabilities  
# - Development-specific configuration
```

#### Testing and validation
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Lint code quality
npm run lint
```

### Error Handling Examples

#### Test error responses
```bash
# Test 404 Not Found
curl -i http://localhost:3000/nonexistent
# Response: 404 Not Found

# Test 405 Method Not Allowed
curl -i -X POST http://localhost:3000/hello
# Response: 405 Method Not Allowed
```

---

## 🧪 Testing

The project uses Node.js built-in test runner for comprehensive testing without external dependencies. Tests are organized into unit, integration, and end-to-end categories with high coverage requirements.

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run complete test suite (unit, integration, e2e) |
| `npm run test:unit` | Run unit tests only for individual components |
| `npm run test:integration` | Run integration tests for component interactions |
| `npm run test:e2e` | Run end-to-end tests for complete workflows |
| `npm run test:coverage` | Run tests with coverage analysis and reporting |
| `npm run test:watch` | Run tests in watch mode for development |

### Coverage Requirements

| Metric | Target | Description |
|--------|--------|-------------|
| **Line Coverage** | 85% minimum | Statement execution coverage |
| **Function Coverage** | 90% minimum | Function call coverage |
| **Branch Coverage** | 80% minimum | Conditional branch coverage |

### Test Organization

- `test/unit/` - Individual component testing with mocks and isolation
- `test/integration/` - Component interaction and HTTP endpoint testing
- `test/e2e/` - Complete application workflow testing
- `test/helpers/` - Test utilities and helper functions
- `test/mocks/` - Mock objects and test doubles
- `test/fixtures/` - Test data and configuration

---

## 📖 Documentation

Comprehensive documentation is provided to support learning objectives and development activities. Documentation is organized by topic and audience to facilitate effective learning and contribution.

### Main Documentation

| File | Title | Description | Audience |
|------|-------|-------------|----------|
| `src/backend/docs/README.md` | Backend Documentation | Comprehensive backend overview with architecture, setup, and development guidance | Developers and contributors |
| `src/backend/docs/API.md` | API Reference | Complete API documentation with endpoint specifications, examples, and error handling | API consumers and developers |
| `src/backend/docs/ARCHITECTURE.md` | Architecture Documentation | Detailed system architecture, component design, and integration patterns | Developers and educators |
| `src/backend/docs/SETUP.md` | Setup Guide | Platform-specific installation and configuration instructions | New users and students |
| `src/backend/docs/TESTING.md` | Testing Guide | Testing strategy, organization, and quality assurance guidelines | Developers and QA |
| `src/backend/docs/TROUBLESHOOTING.md` | Troubleshooting | Common issues, solutions, and debugging guidance | All users |

### Additional Resources

- **`src/backend/examples/`** - Practical code examples and usage demonstrations
- **`CHANGELOG.md`** - Project version history and changes

### External References

- **[Node.js Official Documentation](https://nodejs.org/docs/)** - Official Node.js documentation for HTTP module and runtime features
- **[HTTP Protocol Specification](https://tools.ietf.org/html/rfc7231)** - HTTP/1.1 protocol specification for understanding web standards

---

## 🤝 Contributing

We welcome contributions that enhance the educational value and technical quality of this Node.js tutorial project. Whether you're fixing bugs, improving documentation, or adding educational examples, your contributions help create better learning resources for the community.

### Contribution Types

- **Educational Content** - Improve tutorial clarity and learning materials
- **Bug Fixes** - Resolve issues and improve application reliability
- **Documentation** - Enhance guides, examples, and explanations
- **Testing** - Expand test coverage and improve quality assurance
- **Performance** - Optimize code while maintaining educational clarity

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch for your changes
4. Make your improvements with tests
5. Ensure all tests pass and maintain coverage
6. Submit a pull request with clear description

### Contribution Requirements

- Maintain zero external dependencies philosophy
- Follow educational clarity standards
- Include comprehensive tests for changes
- Update documentation as needed
- Ensure Node.js v22.x LTS compatibility

### Development Workflow

- **Fork and Clone** - Create your own fork of the repository
- **Branch Strategy** - Create feature branches from main
- **Code Standards** - Follow existing code style and patterns
- **Testing** - All changes must include appropriate tests
- **Documentation** - Update docs to reflect changes
- **Pull Request** - Submit PR with clear description and context

### Contribution Areas

- **Tutorial Content** - Enhance educational materials and examples
- **Code Quality** - Improve implementation while maintaining simplicity
- **Documentation** - Expand guides and reference materials
- **Testing Coverage** - Add tests and improve quality assurance
- **Performance** - Optimize without compromising educational clarity
- **Accessibility** - Improve learning accessibility and inclusion

### Community Guidelines

- Be respectful and constructive in discussions
- Focus on educational value and learning outcomes
- Ask questions and seek guidance when needed
- Support fellow contributors with helpful feedback
- Maintain professional and inclusive communication

### Issue Reporting

- **Bug Reports** - Provide detailed steps to reproduce issues
- **Feature Requests** - Align with educational objectives
- **Documentation Issues** - Identify unclear or outdated content
- **Performance Concerns** - Provide specific scenarios and measurements

### Code Review Process

- All contributions require code review
- Maintain educational clarity in all changes
- Ensure comprehensive test coverage
- Verify Node.js v22.x LTS compatibility
- Update documentation for user-facing changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this code for educational and commercial purposes.

**Attribution**: © 2024 Node.js Tutorial Project Contributors

**Educational Usage**: Educational institutions and individuals are encouraged to use and modify this tutorial for learning purposes.

---

## Project Information

**Built with ❤️ for the Node.js learning community**

### Project Stats

- **Node.js:** v22.x LTS (Active LTS)
- **Dependencies:** Zero external dependencies
- **Test Coverage:** 85%+ line coverage
- **Documentation:** Comprehensive guides and examples

### Helpful Links

- [Node.js Downloads](https://nodejs.org/en/download/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [HTTP Module Reference](https://nodejs.org/api/http.html)

---

**🚀 Ready to start learning? Follow the [Quick Start](#-quick-start) guide above!**

**📚 For detailed setup instructions, see [src/backend/docs/SETUP.md](src/backend/docs/SETUP.md)**

**🔧 For complete API documentation, see [src/backend/docs/API.md](src/backend/docs/API.md)**

**🏗️ For architecture details, see [src/backend/docs/ARCHITECTURE.md](src/backend/docs/ARCHITECTURE.md)**

---

*Last Updated: December 2024*  
*Project Version: 1.0.0*  
*Documentation maintained by the Node.js Tutorial Project Contributors*