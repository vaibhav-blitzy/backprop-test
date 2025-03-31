const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  
  if (req.url === '/health') {
    // Health check endpoint - return current timestamp
    const currentTime = new Date().toLocaleString();
    res.end(`Server time: ${currentTime}\n`);
  } else {
    // Original behavior for all other endpoints
    res.end('Hello, World!\n');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});