# hao-backprop-test
Test project for backprop integration. Do not touch!

## Health Check Endpoint

This server includes an authorized health check endpoint at `/health` that returns the current server timestamp in a human-readable format. This is an explicitly permitted exception to the immutability rule.

### Usage

The server provides two endpoints:

- **Default endpoint (any path except `/health`)**: Returns "Hello, World!"
- **Health check endpoint (`/health`)**: Returns the current server time in a human-readable format (e.g., "Server time: 1/1/2023, 12:00:00 PM")

### Important Note

While the health check endpoint has been added as an authorized modification, the core warning remains in effect: Do not make any additional modifications to this test project unless explicitly authorized.