const express = require('express');
const ruta =  express.Router();

ruta.get('/',(req, res)=>{
  res.send('hola desde la carpeta router');
})

module.exports = ruta;
