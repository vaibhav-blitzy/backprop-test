const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// Root endpoint handler - returns 'Hello, World!' for all HTTP methods
app.all('/', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
});

// Evening endpoint handler - returns 'Good evening' for all HTTP methods
app.all('/evening', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Good evening\n');
});

// Start the Express server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
