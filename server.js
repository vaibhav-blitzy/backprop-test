const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

// Existing endpoint - responds with Hello World
// Supports optional ?name= query parameter for personalized greeting
app.get('/', (req, res) => {
  const name = req.query.name;
  if (name) {
    res.send(`Hello, ${name}!`);
  } else {
    res.send('Hello, World!');
  }
});

// New endpoint - responds with Good Evening
// Supports optional ?name= query parameter for personalized greeting
app.get('/evening', (req, res) => {
  const name = req.query.name;
  if (name) {
    res.send(`Good Evening, ${name}!`);
  } else {
    res.send('Good Evening');
  }
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
