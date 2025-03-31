# hao-backprop-test
Test project for backprop integration. Do not touch!

## Overview
A minimal Node.js HTTP server that provides a stable environment for backprop integration testing.

## Endpoints

### Default Endpoint
- URL: Any path except `/health`
- Response: `Hello, World!`
- Status Code: 200
- Content Type: text/plain

### Health Check Endpoint
- URL: `/health`
- Response: Server timestamp in both ISO and human-readable formats
- Status Code: 200
- Content Type: text/plain

#### Health Check Response Format
```
Server is healthy
ISO: 2023-04-15T12:34:56.789Z
Time: Sat Apr 15 2023 08:34:56 GMT-0400 (Eastern Daylight Time)
```

## Usage
The server runs on `127.0.0.1:3000` and is intended for local testing only.