const express = require('express');
const usuarios = require('./routes/usuarios');
const cursos = require('./routes/cursos');

const app = express();


app.use(express.json);
app.use(express.urlencoded({extended : true}));

const port = 3100;

app.use('/usuarios', usuarios);
app.use('/cursos', cursos);


app.get('/', (req, res) =>{
  res.send('Hola mundo');
  res.end();
})

app.listen(port, () => {
  console.log('Se ha conectado con el servicio express y nodejs');
})
