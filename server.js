const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

// Enhanced request handler with path-based routing
const server = http.createServer((req, res) => {
  // Set default response headers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  // Path-based routing
  if (req.url === '/health') {
    // Generate human-readable timestamp
    const timestamp = new Date().toLocaleString();
    res.end(`Server time: ${timestamp}\n`);
  } else {
    // Default response for all other paths (unchanged)
    res.end('Hello, World!\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});