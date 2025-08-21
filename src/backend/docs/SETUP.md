# Node.js Tutorial HTTP Server - Setup Guide

A comprehensive setup and installation guide for the Node.js tutorial HTTP server application. This guide provides step-by-step instructions for environment preparation, installation procedures, configuration setup, and verification testing.

## Project Overview

The **Node.js Tutorial HTTP Server** is an educational demonstration application that showcases fundamental web server concepts using Node.js built-in modules. This project serves as a practical learning resource for students and developers exploring Node.js backend development fundamentals.

### Educational Objectives

- **Understanding Node.js built-in HTTP module usage** and server creation patterns
- **Learning HTTP server request handling** and response generation techniques  
- **Demonstrating zero-dependency application development** with Node.js core modules
- **Showing proper package.json configuration** and npm script management
- **Illustrating development workflow automation** and testing with built-in tools

### Project Features

- **Single `/hello` endpoint** returning 'Hello world' response for foundational learning
- **HTTP status code handling** including 200 OK, 404 Not Found, and 405 Method Not Allowed
- **Error response generation** with proper HTTP protocol compliance
- **Educational examples and comprehensive documentation** for learning progression
- **Zero external dependencies** focusing on Node.js core capabilities and built-in modules

### Target Audience

- **Students learning Node.js** and backend development fundamentals
- **Developers new to Node.js** HTTP server implementation patterns
- **Educators setting up tutorial environments** for teaching web development concepts
- **Contributors preparing development environments** for Node.js project work

## Quick Start

For experienced developers who want to get started immediately:

### Prerequisites Summary
- Node.js v22.x LTS installed
- Basic JavaScript knowledge
- Command line familiarity

### Installation Steps
1. **Install Node.js v22.11.0 LTS** from https://nodejs.org/ (includes npm)
2. **Clone or download project files** to local directory
3. **Navigate to project directory**: `cd nodejs-tutorial-http-server/src/backend`
4. **Start server**: `node server.js` or `npm start`
5. **Test endpoint**: Open http://localhost:3000/hello in browser

### Verification
```bash
curl http://localhost:3000/hello
```
**Expected Output**: `Hello world`

**Estimated Time**: 5-10 minutes for experienced developers

## Prerequisites

### System Requirements

#### Operating Systems
| Platform | Versions | Architecture | Notes |
|----------|----------|--------------|-------|
| **Windows** | Windows 10 or later | x64 or arm64 | Windows Subsystem for Linux (WSL) supported for enhanced development experience |
| **macOS** | macOS 10.15 (Catalina) or later | Intel x64 or Apple Silicon (M1/M2) | Homebrew package manager recommended for Node.js installation |
| **Linux** | Ubuntu 18.04 LTS or equivalent distributions | x64 or arm64 | Most modern Linux distributions supported with package manager installation |

#### Hardware Requirements
- **Memory**: Minimum 1GB RAM, recommended 2GB RAM for comfortable development
- **Storage**: Minimum 500MB free space for Node.js and project files
- **CPU**: Any modern processor (single core sufficient, multi-core recommended)
- **Network**: Internet connection required for initial Node.js installation and documentation access

### Software Dependencies

#### Node.js Requirements
- **Minimum Version**: Node.js v22.0.0
- **Recommended Version**: Node.js v22.11.0 (Active LTS - Jod)
- **Installation Sources**:
  - Official Node.js website (https://nodejs.org/)
  - Package managers (brew, apt, chocolatey, winget)
  - Node Version Manager (nvm) for version management
- **Version Verification**: `node --version` command should return v22.x.x or higher

#### NPM Requirements
- **Minimum Version**: NPM v10.0.0
- **Recommended Version**: NPM v11.5.2 or later
- **Bundled Installation**: NPM comes bundled with Node.js installation
- **Version Verification**: `npm --version` command should return 10.x.x or higher

#### Optional Tools
| Tool | Purpose | Required | Installation |
|------|---------|----------|--------------|
| **Git** | Version control and repository cloning | No | git-scm.com or package manager |
| **curl** | HTTP testing and endpoint verification | No | Built-in on most systems, available via package managers |
| **VS Code or IDE** | Code editing and development | No | Any text editor or IDE with JavaScript support |

### Knowledge Prerequisites

#### Required Knowledge
- Basic JavaScript syntax and concepts
- Understanding of command line interface (CLI) usage
- Familiarity with HTTP protocol fundamentals
- Basic understanding of server-client architecture

#### Helpful Knowledge
- Experience with Node.js development environment
- Understanding of npm package management
- Knowledge of environment variables and configuration
- Basic networking concepts and localhost

#### Learning Resources
- JavaScript fundamentals tutorials
- Command line basics for your operating system
- HTTP protocol overview documentation
- Node.js official getting started guide

## Installation Instructions

### Step-by-Step Installation

#### Step 1: Node.js Installation

**Install Node.js v22.x LTS on your system**

##### Windows Instructions
1. Visit https://nodejs.org/ and download Node.js v22.x LTS for Windows
2. Run the downloaded installer (.msi file) with administrator privileges
3. Follow installation wizard accepting default settings
4. Verify installation: Open Command Prompt and run `node --version`
5. Verify NPM: Run `npm --version` to confirm NPM installation

##### macOS Instructions
1. **Option 1 - Official Installer**: Download from https://nodejs.org/ and run .pkg installer
2. **Option 2 - Homebrew**: Run `brew install node@22` (recommended for developers)
3. Verify installation: Open Terminal and run `node --version`
4. Verify NPM: Run `npm --version` to confirm NPM installation
5. Add to PATH if necessary: Homebrew typically handles PATH configuration

##### Linux Instructions
1. **Ubuntu/Debian**: Add NodeSource repository and install
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. **Alternative**: Use snap: `sudo snap install node --classic`
3. Verify installation: Run `node --version` and `npm --version`

#### Step 2: Project Setup

**Obtain and prepare the Node.js tutorial project files**

##### Git Clone Method
```bash
# Clone repository
git clone <repository-url>

# Navigate to project
cd nodejs-tutorial-http-server

# Navigate to backend
cd src/backend

# Verify project structure
ls  # or 'dir' on Windows
```

##### Download Method
1. Download project files as ZIP archive from repository
2. Extract archive to desired location
3. Navigate to extracted folder: `cd nodejs-tutorial-http-server/src/backend`
4. Verify files: Ensure server.js, package.json, and other files are present

##### Manual Setup Method
```bash
# Create project directory
mkdir nodejs-tutorial-server

# Navigate to directory
cd nodejs-tutorial-server

# Copy provided source files to project directory
# Verify file structure matches expected layout
```

#### Step 3: Dependency Verification

**Verify zero-dependency approach and built-in module availability**

##### Verification Steps
1. Check package.json dependencies section is empty
2. Verify Node.js built-in modules are available
3. Test HTTP module availability: `node -e "console.log(require('http'))"`
4. Confirm no npm install required due to zero external dependencies

> **Educational Note**: This tutorial uses only Node.js built-in modules, demonstrating core capabilities without external dependencies.

### Installation Verification

#### Node.js Version Check
```bash
node --version
```
- **Expected Output**: `v22.x.x` (where x.x represents the patch version)
- **Troubleshooting**: If version is lower than v22.0.0, reinstall Node.js from official website

#### NPM Version Check
```bash
npm --version
```
- **Expected Output**: `10.x.x` or higher
- **Troubleshooting**: NPM should be bundled with Node.js; if missing, reinstall Node.js

#### File Structure Verification
**Required Files**:
- `server.js` (main server entry point)
- `app.js` (application orchestration)
- `package.json` (project configuration)
- `config/` directory with configuration files
- `docs/` directory with documentation

**Verification Command**: `ls -la` or `dir` (depending on platform)
**Troubleshooting**: Ensure all project files are properly extracted or cloned

## Environment Configuration

### Environment Variables

#### Required Variables
**None** - application uses sensible defaults for all configuration

#### Optional Variables
| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `PORT` | `3000` | HTTP server port number (1-65535) | `PORT=8080` |
| `HOST` | `localhost` | Server hostname or IP address | `HOST=0.0.0.0` |
| `NODE_ENV` | `development` | Application environment (development, test, production) | `NODE_ENV=production` |

#### Configuration Methods

##### Command Line (macOS/Linux)
```bash
PORT=8080 node server.js
```

##### Command Line (Windows CMD)
```cmd
set PORT=8080 && node server.js
```

##### PowerShell (Windows)
```powershell
$env:PORT=8080; node server.js
```

##### .env File (All platforms)
Create `.env` file with:
```
PORT=8080
```

### Configuration Files

#### Environment Configuration
- **File**: `config/environment.js`
- **Purpose**: Centralized environment variable management and validation
- **Modification**: Generally not required; uses sensible defaults

#### Application Configuration
- **File**: `config/app.config.js`
- **Purpose**: Application-level configuration and feature flags
- **Modification**: Optional for advanced configuration

#### Server Configuration
- **File**: `config/server.config.js`
- **Purpose**: HTTP server specific configuration and security settings
- **Modification**: Optional for server behavior customization

### Configuration Validation
- **Automatic validation**: Application validates all configuration on startup with detailed error messages
- **Validation errors**: Clear error messages guide correction of invalid configuration values
- **Fallback behavior**: Application uses safe defaults when optional configuration is invalid

## Verification and Testing

### Server Startup Test

#### Basic Startup
```bash
node server.js
```

**Expected Output**:
- Server starting up message
- Port binding confirmation
- Server ready message with URL

**Success Indicators**:
- No error messages in console output
- Message indicating server is listening on port 3000
- Application startup completion log

#### NPM Script Startup
```bash
npm start
# or
npm run dev
```
**Expected Behavior**: Same as direct node execution with additional development features

### Endpoint Functionality Test

#### Browser Test
1. **Instruction**: Open web browser and navigate to http://localhost:3000/hello
2. **Expected Result**: Browser displays 'Hello world' text
3. **Status Verification**: Browser should show successful page load (no errors)

#### curl Test
```bash
# Basic test
curl http://localhost:3000/hello

# With headers
curl -i http://localhost:3000/hello
```
- **Expected Output**: `Hello world`
- **Status Check**: HTTP/1.1 200 OK

#### Invalid Route Test
```bash
curl http://localhost:3000/invalid
```
- **Expected Result**: 404 Not Found error response
- **Purpose**: Verify error handling functionality

### Health Check Verification

#### Built-in Health Check
```bash
npm run health
# or
curl -f http://localhost:3000/hello
```
- **Success Criteria**: Command exits with status 0 and returns 'Hello world'

#### Server Responsiveness
```bash
# Multiple rapid requests (Linux/macOS)
for i in {1..5}; do curl http://localhost:3000/hello; done

# Windows PowerShell equivalent
1..5 | ForEach-Object { curl http://localhost:3000/hello }
```
- **Expected**: All requests return 'Hello world' without errors

### Development Features Test

#### Test Suite Execution
```bash
npm test
```
- **Expected Result**: All tests pass with coverage report
- **Purpose**: Verify development environment and testing capabilities

#### Code Quality Check
```bash
npm run lint
```
- **Expected Result**: No linting errors or warnings
- **Purpose**: Verify code quality and development workflow

## Development Environment Setup

### Development Workflow

#### Development Server
```bash
npm run dev
```

**Features**:
- Enhanced logging for development debugging
- Detailed request/response information
- Development-specific configuration
- Educational logging and explanations

#### Testing Workflow
| Command | Purpose |
|---------|---------|
| `npm run test:unit` | Fast feedback during development |
| `npm run test:integration` | Component interaction testing |
| `npm run test:coverage` | Code coverage reports |
| `npm run test:watch` | Continuous testing during development |

### Debugging Setup

#### Node.js Debugging
```bash
node --inspect server.js
```
- **Purpose**: Enable Node.js debugger for Chrome DevTools integration
- **Access**: Open `chrome://inspect` in Chrome browser

#### Logging Configuration
- **Development logging**: Enhanced logging enabled in development environment
- **Log levels**: DEBUG level logging shows detailed request processing
- **Educational logs**: Explanatory messages for learning Node.js concepts

### IDE Configuration

#### VS Code Setup
1. Install Node.js extension pack for enhanced JavaScript support
2. Configure debugging launch configuration for server debugging
3. Install REST Client extension for endpoint testing within editor
4. Configure workspace settings for consistent code formatting

#### Editor Features
- Syntax highlighting for JavaScript and JSON files
- IntelliSense for Node.js built-in modules and APIs
- Integrated terminal for running npm scripts and commands
- Debugging support for breakpoints and variable inspection

## Platform-Specific Instructions

### Windows Considerations

#### PATH Configuration
- **Issue**: Node.js may not be in system PATH after installation
- **Solution**: Add Node.js installation directory to PATH environment variable
- **Verification**: Open new Command Prompt and test `node --version`

#### Execution Policy
- **Issue**: PowerShell execution policy may prevent npm script execution
- **Solution**: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- **Alternative**: Use Command Prompt instead of PowerShell

#### File Permissions
- **Issue**: Some operations may require administrator privileges
- **Solution**: Run Command Prompt as Administrator for global npm operations
- **Note**: Local project operations typically don't require elevation

### macOS Considerations

#### Permission Issues
- **Issue**: npm global package installation may require permissions
- **Solution**: Use Homebrew for Node.js installation to avoid permission issues
- **Alternative**: Configure npm to use different directory for global packages

#### Xcode Dependencies
- **Issue**: Some npm packages may require Xcode command line tools
- **Solution**: `xcode-select --install` (not required for this tutorial)
- **Note**: This tutorial uses zero external dependencies

### Linux Considerations

#### Package Management
- **Ubuntu/Debian**: Use apt package manager with NodeSource repository for latest versions
- **RedHat/CentOS**: Use yum or dnf with NodeSource repository
- **Arch Linux**: Use pacman to install nodejs and npm packages

#### Permission Configuration
- **Global packages**: Configure npm to avoid sudo for global package installation
- **File permissions**: Ensure user has read/write access to project directory
- **Port binding**: Ports below 1024 require root privileges (use default port 3000)

## Troubleshooting

### Common Issues

#### Node.js Version Too Old
- **Symptoms**: Error messages about unsupported Node.js features or deprecated APIs
- **Solution**: Install Node.js v22.x LTS from official website: https://nodejs.org/
- **Verification**: `node --version` should show v22.x.x
- **Additional Steps**:
  - Uninstall old Node.js version completely before installing new version
  - Clear npm cache: `npm cache clean --force`
  - Verify PATH environment variable points to correct Node.js installation

#### Port Already in Use (EADDRINUSE error)
- **Symptoms**: `Error: listen EADDRINUSE: address already in use :::3000`
- **Solution**: Use different port: `PORT=8080 node server.js`
- **Verification**: Server starts successfully on alternative port
- **Additional Solutions**:
  - Find process using port: `netstat -tulpn | grep :3000` (Linux/macOS) or `netstat -ano | findstr :3000` (Windows)
  - Kill process using port: `kill -9 <PID>` or `taskkill /PID <PID> /F`
  - Wait for TIME_WAIT state to clear (usually 1-2 minutes)
  - Restart computer to clear all port bindings

#### Permission Denied Errors
- **Symptoms**: EACCES permission denied errors when starting server or accessing files
- **Solution**: Check file permissions and use non-privileged port (>1024)
- **Verification**: `ls -la` to check file permissions and ownership
- **Platform-Specific Solutions**:
  
  **Linux/macOS**:
  - `chmod +x server.js` to make server file executable
  - `chown $USER:$USER . -R` to fix ownership issues
  - Use sudo only if absolutely necessary for privileged ports
  
  **Windows**:
  - Run Command Prompt as Administrator for system-level operations
  - Check Windows Defender or antivirus blocking file access
  - Ensure project is not in protected system directories

#### Module Not Found Errors
- **Symptoms**: `Cannot find module 'http'` or `Error: Cannot find module '../config/environment'`
- **Solution**: Verify Node.js installation integrity and project file structure
- **Verification**: `node -e "console.log(require('http'))"` should not throw error
- **Troubleshooting Steps**:
  - Reinstall Node.js from official source if built-in modules are missing
  - Verify all project files are present and in correct locations
  - Check for typos in require() statements and file paths
  - Ensure working directory is correct when running server

#### Network Connectivity Problems
- **Symptoms**: Cannot connect to http://localhost:3000/hello from browser or curl
- **Solution**: Verify server is running and network configuration is correct
- **Verification**: Check server startup logs for successful port binding message
- **Diagnostic Steps**:
  - Verify server process is running: `ps aux | grep node` (Linux/macOS) or `tasklist | findstr node` (Windows)
  - Check firewall settings blocking local connections
  - Test with different browsers or HTTP clients
  - Try accessing via 127.0.0.1:3000/hello instead of localhost
  - Verify no proxy settings interfering with local connections

#### NPM Script Execution Failures
- **Symptoms**: `npm start` or `npm test` commands not working or missing
- **Solution**: Verify package.json scripts section and npm installation
- **Verification**: `npm run-script` to list available scripts
- **Solutions**:
  - Check package.json exists and has proper scripts section
  - Run npm install if package.json was modified
  - Use direct node commands if npm scripts fail: `node server.js`
  - Check npm version compatibility: `npm --version`

#### Environment Variable Configuration Issues
- **Symptoms**: Server starts with wrong port or configuration despite setting environment variables
- **Solution**: Verify environment variable syntax and persistence
- **Verification**: `echo $PORT` (Linux/macOS) or `echo %PORT%` (Windows CMD) to check variable
- **Platform-Specific Solutions**:
  
  **Windows CMD**: `set PORT=8080 && node server.js` (same command line)
  **Windows PowerShell**: `$env:PORT=8080; node server.js` (same session)
  **Linux/macOS**: `export PORT=8080` then `node server.js` (persistent for session)
  **Env File**: Create `.env` file with `PORT=8080` for permanent configuration

#### High CPU Usage or Performance Problems
- **Symptoms**: Server consumes excessive CPU or responds slowly
- **Solution**: Verify no infinite loops or blocking operations in code
- **Diagnostic Steps**:
  - Monitor CPU usage: `top` (Linux/macOS) or Task Manager (Windows)
  - Check for multiple server instances running simultaneously
  - Verify no infinite loops in request handling code
  - Restart server to clear any accumulated issues
  - Check system resources and close unnecessary applications

### Diagnostic Commands

| Command | Purpose | Expected Output | Troubleshooting |
|---------|---------|-----------------|-----------------|
| `node --version` | Verify Node.js installation and version | `v22.x.x` | If command not found, Node.js not installed or not in PATH |
| `npm --version` | Verify npm installation and version | `10.x.x` or higher | If missing, reinstall Node.js (npm is bundled) |
| `node -e "console.log(process.versions)"` | Display detailed version information for debugging | Object with node, v8, uv, zlib versions | Helps identify specific Node.js build and component versions |
| `netstat -an \| grep 3000` | Check if port 3000 is already in use (Linux/macOS) | Empty if port available | Windows equivalent: `netstat -an \| findstr :3000` |
| `curl -v http://localhost:3000/hello` | Verbose HTTP request for detailed connection debugging | HTTP headers and 'Hello world' response | Shows connection details and server response information |
| `node -e "console.log(require('os').networkInterfaces())"` | Display network interface configuration | Network interface details | Helps diagnose network connectivity and interface issues |
| `node -pe "process.env"` | Display all environment variables | Environment variable object | Verify environment variable configuration and inheritance |

### Error Codes Reference

| Error Code | Meaning | Solution | Prevention |
|------------|---------|----------|------------|
| **EADDRINUSE** | Address already in use - port is occupied by another process | Use different port or stop process using current port | Always properly close server connections |
| **EACCES** | Permission denied - insufficient privileges | Check file permissions or use non-privileged port | Avoid running server as root unless necessary |
| **ENOTFOUND** | Host not found - DNS resolution or network issue | Check hostname spelling and network connectivity | Use localhost or 127.0.0.1 for local development |
| **MODULE_NOT_FOUND** | Cannot find specified module or file | Verify file paths and Node.js installation integrity | Use relative paths and verify file structure |

### Platform-Specific Troubleshooting

#### Windows Specific
**PowerShell Issues**:
- ExecutionPolicy may prevent script execution
- Environment variables syntax differs from CMD
- Path separators use backslashes

**Solutions**:
- Use Command Prompt instead of PowerShell for consistency
- Set execution policy: `Set-ExecutionPolicy RemoteSigned`
- Use forward slashes or escape backslashes in paths

#### macOS Specific
**Common Issues**:
- Xcode command line tools may be required for some operations
- Permission issues with global npm packages
- PATH configuration with Homebrew installations

**Solutions**:
- Install Xcode CLI tools: `xcode-select --install`
- Use Homebrew for Node.js installation
- Add Homebrew paths to shell profile

#### Linux Specific
**Common Issues**:
- Package manager versions may be outdated
- Permission issues with system directories
- Firewall blocking local connections

**Solutions**:
- Use NodeSource repository for latest versions
- Configure npm prefix for user directory
- Configure firewall to allow local development

### Getting Help

#### Internal Documentation
- **API.md** for endpoint-specific issues and testing examples
- **ARCHITECTURE.md** for system design and component understanding
- **TESTING.md** for testing procedures and validation guidance

#### External Resources
- **Node.js official documentation**: https://nodejs.org/docs/
- **NPM documentation**: https://docs.npmjs.com/
- **Node.js GitHub issues** for known problems
- **Stack Overflow** for community solutions

#### Community Support
- **Node.js Discord community** for real-time help
- **Reddit r/node** for discussion and troubleshooting
- **GitHub Discussions** for project-specific questions

#### Diagnostic Information
When seeking help, always include:
- Node.js and npm versions in help requests
- Complete error messages and stack traces
- Platform information (OS, architecture)
- Steps taken before encountering the issue

## Educational Context

### Learning Objectives

This setup process teaches several important concepts:

- **Understanding Node.js installation and environment setup procedures**
- **Learning about built-in modules and zero-dependency development approaches**
- **Practicing environment configuration and application validation techniques**
- **Experience with development workflow automation and testing procedures**
- **Gaining familiarity with cross-platform development considerations**

### Concepts Demonstrated

- **Node.js runtime environment** and version management practices
- **NPM package manager** and script execution workflows
- **Environment variable configuration** and precedence handling
- **HTTP server startup** and network binding procedures
- **Cross-platform development considerations** and compatibility

### Educational Value

#### Real-World Skills
Setup procedures mirror professional development environment preparation and deployment practices

#### Troubleshooting Practice
Common issues provide hands-on experience with problem-solving techniques and diagnostic procedures

#### Platform Awareness
Cross-platform instructions develop understanding of deployment considerations across different operating systems

#### Best Practices
Configuration and verification procedures demonstrate industry-standard development workflow patterns

### Skill Progression

#### Beginner Outcomes
- Successful Node.js installation and basic configuration
- Understanding of command line interface usage for development
- Basic troubleshooting skills for common setup issues
- Familiarity with HTTP server concepts and localhost testing

#### Intermediate Outcomes
- Environment variable configuration and management
- Development workflow automation with npm scripts
- Platform-specific installation and configuration optimization
- Integration of debugging tools and development environment setup

#### Advanced Outcomes
- Custom configuration optimization for specific development needs
- Advanced troubleshooting and diagnostic techniques
- Performance optimization and resource management
- Integration with advanced development tooling and workflows

## Next Steps

### Immediate Next Steps

1. **Review API.md** for detailed endpoint documentation and usage examples
2. **Examine ARCHITECTURE.md** for comprehensive system design understanding
3. **Study TESTING.md** for testing strategies and validation procedures
4. **Explore source code structure** starting with server.js and app.js files

### Development Progression

1. **Experiment with environment variable configuration** to understand server behavior
2. **Run comprehensive test suite** to understand testing patterns and coverage validation
3. **Add custom logging or modify responses** to practice development workflow
4. **Review educational examples** in examples/ directory for advanced usage patterns

### Advanced Topics

1. **Explore containerization with Docker** for deployment learning and orchestration
2. **Study Node.js performance optimization techniques** and monitoring strategies
3. **Learn about clustering and horizontal scaling** for Node.js applications
4. **Investigate observability patterns** including logging, metrics, and distributed tracing

### Learning Resources

- **Node.js official guides** for advanced features and best practices
- **NPM documentation** for package management and development workflows
- **HTTP protocol specifications** for deeper understanding of server behavior
- **JavaScript ES2022+ features** for modern Node.js development patterns

---

## Support Information

- **Project Name**: Node.js Tutorial HTTP Server
- **Project Version**: 1.0.0
- **Tutorial Objective**: Learn fundamental HTTP server concepts using Node.js built-in modules
- **Estimated Setup Time**: 15-30 minutes
- **Supported Platforms**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Supported Architectures**: x64, arm64

For additional support and advanced configuration options, please refer to the project documentation in the `docs/` directory or visit the project repository for community support and updates.

**🎉 Welcome to Node.js development! Happy coding!**