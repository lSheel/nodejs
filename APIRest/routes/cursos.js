const express = require('express');
const route = express.Router();

route.get('/', (req, res) =>{
  res.json('Hola desde mi GET cursos');
});

module.exports = route;

