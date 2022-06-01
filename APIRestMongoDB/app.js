//Llamamos a nuestras rutas
const usuarios  = require('./routes/usuarios.js');
const cursos  = require('./routes/cursos.js');
const auth = require('./routes/auth')
//Nuestros archivos de configuracion en json donde establecemos ciertos valores en entorno de desarrollo y produccion
const config = require('config');
//Llamamos a los modulos que necesitemos
const express = require('express');
const mongoose = require('mongoose');
const {urlencoded} = require('express');
const res = require('express/lib/response');
//Conectarnos a la base de datos
mongoose
  //Nos conectamos a la URI pasandole el puerto y la base de datos que vamos a utilizar
  //.connect("mongodb://localhost:27017/demo")
  .connect(config.get('configDB.HOST'))
  //Como es nuestra promesa para saber si fue correcta o no mandaremos a la consola un mensaje si fue correcta o no la conexion
  .then(() => console.log("Conectado a la base de datos"))
  .catch((err) =>
    console.log("No se pudo conectar con la base de datos.. ", err)
  );

//Creamos nuestra instancia express
const app = express();
//Usamos el middleware json para usar datos tipo json
app.use(express.json());

//Usamos urlencoded para leer los direcciones que vamos a recibir
app.use(express.urlencoded({extended : true}));
 //Llamamos a nuestras rutas 
app.use('/usuarios',usuarios);
app.use('/cursos', cursos);
app.use('/api/auth', auth);
//Creamos una variable donde estableceremos el puerto, ya sea uno que definimos de forma global o en otro caso el puerto 3000
const port = process.env.PORT || 3000;

//Nuestra API usara el puerto establecido para instanciar el servidor
app.listen(port, ()=> {
  console.log('API RESTFul ok y ejecutandose');
});
