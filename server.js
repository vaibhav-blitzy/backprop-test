const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// Existing endpoint - responds with Hello World
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// New endpoint - responds with Good Evening
app.get('/evening', (req, res) => {
  res.send('Good Evening');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
