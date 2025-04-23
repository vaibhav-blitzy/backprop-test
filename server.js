const express = require('express');
const app = express();

const hostname = '127.0.0.1';
const port = 3000;

// Root endpoint - preserves original functionality
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('Hello, World!\n');
});

// New endpoint for "Good evening" response
app.get('/evening', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send('Good evening');
});

// Server initialization
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

console.log('For out-of-sync tech spec);
