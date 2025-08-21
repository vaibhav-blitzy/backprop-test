---
name: Bug Report
about: Report a bug or issue with the Node.js Tutorial HTTP Server
title: '[BUG] Brief description of the issue'
labels: ['bug', 'needs-triage']
assignees: []
---

<!-- 
Bug Report Template v1.0.0
Node.js Tutorial HTTP Server Application

This template helps maintain educational value while ensuring comprehensive bug documentation.
Complete ALL applicable sections for efficient issue resolution and learning support.

Quick Reference:
📚 Check [Troubleshooting Guide](src/backend/docs/TROUBLESHOOTING.md) first
🔧 Review [Setup Instructions](README.md#installation)  
🤝 See [Contributing Guidelines](CONTRIBUTING.md)

Supported Node.js Versions: v22.x LTS, v20.x LTS
Supported Platforms: Windows 10+, macOS 10.15+, Ubuntu 18.04+
Zero External Dependencies: Required
-->

# Bug Report

Thank you for taking the time to report a bug! This template will help us understand and resolve the issue efficiently while maintaining the educational value of our tutorial application.

## Bug Summary

**What happened?** (One-sentence summary of the issue)
<!-- Provide a clear and concise description of the bug. Focus on what went wrong and how it affects the tutorial experience. -->

**How does this affect the tutorial?** (Impact on learning experience)
<!-- Describe how this bug impacts students learning Node.js HTTP server development -->

**Issue Category** (Select the most appropriate category)
<!-- Check one primary category that best describes your issue -->

- [ ] **Installation & Setup** - Issues with Node.js installation, environment setup, or initial configuration
- [ ] **Server Startup** - Problems with HTTP server initialization, port binding, or component loading  
- [ ] **Endpoint Functionality** - Issues with /hello endpoint responses, routing, or HTTP handling
- [ ] **Performance & Logging** - Performance problems, slow responses, or logging configuration issues
- [ ] **Testing** - Problems with test execution, Node.js test runner, or test environment setup
- [ ] **Development Workflow** - Issues with npm scripts, development tools, or workflow automation
- [ ] **Documentation** - Errors or unclear instructions in documentation or code comments
- [ ] **Cross-Platform** - Platform-specific issues on Windows, macOS, or Linux

**Severity Level** (Critical/High/Medium/Low)
<!-- 
Critical: Prevents tutorial completion or causes data loss/security issues
High: Significantly impacts learning experience or affects multiple platforms  
Medium: Moderate impact on tutorial experience or affects specific configurations
Low: Minor impact or cosmetic issues that don't affect core functionality
-->

**Severity:** 

---

## Environment Information

*Provide detailed environment information to help us reproduce and diagnose the issue. Run the diagnostic commands and paste the output.*

### System Information

**Operating System:** (e.g., Windows 11, macOS 13.0, Ubuntu 22.04)

**Node.js Version:** (Run: `node --version`)
```bash
# Paste output here
```

**npm Version:** (Run: `npm --version`)  
```bash
# Paste output here
```

**Terminal/Shell:** (e.g., PowerShell, Terminal, bash)

### Project Information

**Project Directory:** (Full path to project folder)

**Installation Method:** (Git clone, ZIP download, etc.)

**Last Working State:** (When did it last work correctly?)

### Environment Configuration

*Run these commands and paste the output (remove sensitive information):*

**Environment Variables:**
```bash
# Unix/Linux/macOS:
echo $PORT
echo $NODE_ENV  
echo $LOG_LEVEL

# Windows:
echo %PORT%
echo %NODE_ENV%
echo %LOG_LEVEL%
```

**Environment File (if exists):**
```bash
# Unix/Linux/macOS: 
cat .env.development

# Windows:
type .env.development
```

---

## Steps to Reproduce

*Provide detailed steps that consistently reproduce the issue. Include exact commands, file paths, and any specific conditions.*

### Minimal Reproduction Case

*Provide the simplest possible steps to reproduce the issue starting from a clean state*

1. **Environment Setup:** Describe initial state and configuration
   ```bash
   # Include exact commands used
   ```

2. **Execution Steps:** List exact commands or actions taken
   ```bash
   # Include exact commands with expected output
   ```

3. **Trigger Point:** Identify when the issue occurs
   ```bash
   # Command or action that triggers the issue
   ```

4. **Observed Result:** What actually happens (error messages, unexpected behavior)
   ```bash
   # Paste exact error output or unexpected behavior
   ```

### Reproduction Frequency

How often does this issue occur?

- [ ] Always occurs (100%)
- [ ] Frequently occurs (>50%) 
- [ ] Sometimes occurs (<50%)
- [ ] Rarely occurs (difficult to reproduce)

---

## Expected vs. Actual Behavior

### Expected Behavior

*Describe what should happen according to the tutorial documentation*

<!-- Reference specific documentation or expected tutorial outcomes -->

### Actual Behavior  

*Describe exactly what happens instead*

<!-- Include complete error messages, console output, HTTP responses, and any visual symptoms -->

### Error Output

```bash
# Paste complete error messages, stack traces, and relevant log output here
# Include full stack traces and remove sensitive information
```

---

## Troubleshooting Checklist

*Please check all items you have attempted before reporting this issue. This helps us identify the root cause more quickly.*

### Basic Troubleshooting

- [ ] **Environment Validation:** Verified Node.js version with `node --version` (should be v22.x or v20.x LTS)
- [ ] **Documentation Review:** Checked [README.md](README.md) for setup instructions and known issues
- [ ] **Troubleshooting Guide:** Reviewed [Troubleshooting Documentation](src/backend/docs/TROUBLESHOOTING.md) for similar issues
- [ ] **Clean Restart:** Killed all Node.js processes and restarted terminal/system
- [ ] **Port Availability:** Verified port 3000 is available with `lsof -i:3000` or `netstat -an | grep 3000`
- [ ] **File Integrity:** Confirmed all required files exist and are readable
- [ ] **Permission Check:** Verified appropriate file and directory permissions

### Advanced Troubleshooting

- [ ] **Dependency Validation:** Confirmed zero external dependencies maintained with `cat package.json`
- [ ] **Module Loading:** Tested module loading with `node --check server.js`
- [ ] **Environment Reset:** Tried with clean environment variables (unset PORT, NODE_ENV, etc.)
- [ ] **Fresh Installation:** Attempted fresh project setup in new directory
- [ ] **Cross-Platform Testing:** Tested on different terminal/shell if available
- [ ] **Network Diagnostics:** Verified network connectivity and firewall settings

### Testing Validation

- [ ] **Test Suite:** Ran test suite with `npm test` to identify related issues
- [ ] **Unit Tests:** Executed unit tests with `npm run test:unit`
- [ ] **Integration Tests:** Ran integration tests with `npm run test:integration`  
- [ ] **Coverage Analysis:** Checked test coverage with `npm run test:coverage`
- [ ] **Linting:** Validated code quality with `npm run lint`

---

## Educational Impact Assessment

*Help us understand how this bug affects the learning experience and tutorial effectiveness.*

### Learning Impact

**Does this issue prevent completing the tutorial?** (Yes/No and explanation)

**Which learning objective is affected?** (HTTP server creation, Node.js modules, testing, etc.)

**Is this confusing for beginners?** (Yes/No and explanation)

**Does this issue teach incorrect patterns?** (Yes/No and explanation)

### Student Experience Impact

**Setup Difficulty:** How does this affect initial setup experience?

**Concept Understanding:** Does this hinder understanding of core concepts?

**Troubleshooting Skills:** Could this serve as a learning opportunity?

**Progression Blocking:** Does this prevent moving to next tutorial steps?

### Tutorial Quality Impact

**Documentation Accuracy:** Are instructions unclear or incorrect?

**Code Example Quality:** Do examples fail to work as documented?

**Best Practice Demonstration:** Does this violate educational best practices?

**Accessibility:** Does this create barriers for diverse learning environments?

---

## Diagnostic Information

*Run these diagnostic commands and paste the output to help with debugging (remove sensitive information).*

### System Diagnostics

```bash
# Version information
node --version && npm --version

# Installation paths (Unix/Linux/macOS)
which node && which npm

# Installation paths (Windows)  
where node && where npm

# Environment PATH (Unix/Linux/macOS)
echo $PATH

# Environment PATH (Windows)
echo %PATH%
```

### Application Diagnostics

```bash
# File listing and permissions (Unix/Linux/macOS)
ls -la src/backend/

# File listing (Windows)
dir src\backend\

# Package information
cat package.json | grep -E '(name|version|main|scripts)'

# Syntax validation
node --check server.js

# Application health check (if available)
npm run health
```

### Network Diagnostics

```bash
# Port usage (Unix/Linux/macOS)
lsof -i:3000

# Port status
netstat -an | grep 3000

# HTTP endpoint test
curl -v http://localhost:3000/hello

# Node.js processes (Unix/Linux/macOS)
ps aux | grep node

# Node.js processes (Windows)
tasklist | findstr node
```

---

## Additional Context

*Optional section for additional information that may help with diagnosis*

### Screenshots or Output Examples

<!-- Include screenshots of error messages, terminal output, or browser responses if helpful -->
<!-- Drag and drop images or paste image URLs -->

### Related Issues or Discussions

<!-- Link to any related GitHub issues, Stack Overflow questions, or community discussions -->
<!-- Format:
- Related issue: #XXX
- Similar problem: [URL]
- Community discussion: [URL]
-->

### Temporary Workarounds

<!-- Describe any temporary solutions or workarounds you've found -->

**Workaround Steps:**
1. 
2. 
3. 

**Limitations of the workaround:**

**Impact on learning objectives:**

### Configuration Details

<!-- Include any relevant configuration files, environment setup, or customizations -->

```bash
# Configuration file contents
# Environment variable settings  
# Custom modifications
```

---

## For Maintainers (Triage Information)

*This section is for maintainer use during issue triage and classification.*

### Priority Assessment
<!-- 
Critical: Prevents tutorial completion or causes data loss/security issues
High: Significantly impacts learning experience or affects multiple platforms
Medium: Moderate impact on tutorial experience or affects specific configurations  
Low: Minor impact or cosmetic issues that don't affect core functionality
-->

### Category Classification
<!--
Installation: Setup, environment, or dependency issues
Functionality: Core application behavior problems
Performance: Speed, memory, or resource usage issues
Documentation: Unclear or incorrect documentation
Testing: Test execution or validation problems
Compatibility: Platform or version compatibility issues
-->

### Resolution Complexity
<!--
Simple: Quick fix, configuration change, or documentation update
Moderate: Code changes requiring testing and validation
Complex: Architectural changes or significant refactoring required
Investigation: Requires investigation to understand root cause
-->

### Educational Assessment
<!--
Learning Impact: How does this affect tutorial learning objectives?
Accessibility: Does this create barriers for beginners?
Best Practices: Does this demonstrate or violate coding best practices?
Tutorial Quality: How does this impact overall tutorial effectiveness?
-->

---

<!-- 
TEMPLATE VALIDATION CHECKLIST:

Required Sections Completed:
✓ Bug summary with clear description
✓ Complete environment information
✓ Reproducible steps with specific commands
✓ Expected vs actual behavior comparison
✓ Troubleshooting checklist completion
✓ Educational impact assessment

Quality Indicators:
✓ Clear, concise problem description
✓ Detailed reproduction steps that others can follow
✓ Complete error messages and stack traces
✓ Evidence of attempted troubleshooting
✓ Assessment of educational impact

Technical Validation:
✓ Environment verification completed
✓ Steps can be followed to reproduce issue
✓ Diagnostic information provided
✓ Zero dependency compliance verified

Educational Alignment:
✓ Learning focus considered
✓ Beginner accessibility assessed
✓ Troubleshooting education demonstrated
✓ Clear, educational language used

Supported Node.js Versions: v22.x LTS, v20.x LTS
Supported Platforms: Windows 10+, macOS 10.15+, Ubuntu 18.04+
Issue Categories: installation-setup, server-startup, endpoint-functionality, performance-logging, testing, development-workflow
Troubleshooting Documentation: src/backend/docs/TROUBLESHOOTING.md

Template version: 1.0.0
Last updated: 2024
-->