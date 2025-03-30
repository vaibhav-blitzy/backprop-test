const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  // Check if the request URL is '/health'
  if (req.url === '/health') {
    // Generate a human-readable timestamp using the Date object's toLocaleString() method
    const timestamp = new Date().toLocaleString();
    // Return the formatted timestamp as the response body for health check requests
    res.end(`Current server time: ${timestamp}\n`);
  } else {
    // Maintain the existing 'Hello, World!' response for all other paths
    res.end('Hello, World!\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});