const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.get('/', (req, res) => {
  res.status(200);
  res.type('text/plain');
  res.send('Hello, World!\n');
});

app.get('/evening', (req, res) => {
  res.status(200);
  res.type('text/plain');
  res.send('Good evening');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});