const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  // Parse the request URL to determine the path
  if (req.url === '/health') {
    // Health check endpoint - return timestamp
    const timestamp = new Date().toISOString();
    const humanReadable = new Date().toString();
    res.end(`Server is healthy\nISO: ${timestamp}\nTime: ${humanReadable}\n`);
  } else {
    // Maintain existing behavior for all other requests
    res.end('Hello, World!\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});