const inicioDebug = require('debug')('app:inicio')
const dbDebug = require('debug')('app:db')
const express = require('express');
const config = require('config')
const logger = require('./logger')
const {status} = require('express/lib/response');
const {func} = require('joi');
const Joi = require('joi');
const morgan = require('morgan')
//Se crea instancia de express
const app = express() //body

//Se crea un obj Json con datos del usuario
const usuarios = [
  {id: 1,  nombre: "Gover"},
  {id: 2, nombre: "Luis"},
  {id: 3, nombre: "Luna"}
];
//Middleware de express
app.use(express.json());
//Otro Middleware para manejar queryStrings
app.use(express.urlencoded({extended:true}))
//Middleware para elementos estaticos en un servidor web
app.use(express.static('public'))

//Configuracion de entornos
console.log('Aplicacion: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));



//                      -------------------------
//
// Request -------> | json() -------> router() |--------> response
//                    -------------------------
//Nuestro propio Middleware
//app.use(logger)



//app.use(function(req, res, next){
  //console.log('Autenticacion');
  //next();
//});
//
//Uso de un Middleware de terceros
//Logger
//Solo se utiliza para dependiendo el entorno que vamos a utilizar
//va a ejecutar ciertos servicios-Middleware

if(app.get('env') === 'development'){
  app.use(morgan('tiny'))
  //console.log('Morgan habilitado');
  inicioDebug('Morgan esta habilitado');
}


//Trabajos con la base de datos
dbDebug('Conectando con la base de datos')

//app.get(); //peticion
//app.post(); //envio datos
//app.put(); //actualizacion
//app.delete(); //eliminacion
//
//Creacion del servidor web
app.get('/',(req,  res) =>{
  res.send("Hola mundo desde Express");

});
//Solocitud para obtener un usuario
app.get('/api/usuario', (req, res) =>{
  res.send(["Luis", "Jose", "Ana"]);
})

//app.get("/api/usuarios/:id",(req, res) =>{
  //res.send(req.params);
//});
//Obetner datos pasando los parametros dia y año
app.get("/api/usuarios/:day/:year", (req, res) =>{
  res.send(req.params);
});

//app.get('/api/nombre', (req, res) => {
  //res.send(req.params)
//})

//Obtener el usuario con el id
app.get('/api/usuarios/:id', (req, res) =>{
  //Se crea una variable encuentra el usuario que estamos buscando
  //Se usa el metodo find con una funcion flecha donde necesitamos un parametro (usuario)
  let user = usuarios.find(u => 
    //utilizamos el id para evaluar si es igual a un usuario que esta en el json
    u.id === parseInt(req.params.id));
  //Si el usuario no existe mandamos un error con el codigo 400 donde le decimos al usuario
  //que el usuario no existe
  if(!user) res.status(404).send("No se encontro el usuario");
  res.send(user);
});


app.post('/api/usuario',(req, res) => {
  const schema = Joi.object({
    nombre: Joi.string()
      .min(3)
      .max(30)
      .required()
  });

  const {error, value} = schema.validate({nombre:  req.body.nombre});
  if(!error){
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre
    };
    usuarios.push(usuario);
    res.send(usuario);
  }
  else{
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }

  console.log(result);
  //if(!req.body.nombre || req.body.nombre.length <= 2 ){*/
    /*res.status(400).send("Debe ingresar un nombre que tenga minimo 3 letras");*/
    /*return;*/
  /*}*/
  /*const usuario = {*/
    /*id: usuarios.length+1,*/
    /*nombre: req.body.nombre*/
  /*};*/
  /*usuarios.push(usuario);*/
  /*res.send(usuario)*/
})

//Peticiones put
//
app.put('/api/usuarios/:id', (req, res) =>{
  //Encontrar si existe el objeto usuario
  let usuario = usuarios.find(u => u.id === parseInt(req.params.id)); 
  if(!usuario) res.status(404).send("Usuario no encontrado");
  
  const schema = Joi.object({
    nombre: Joi.string().min(3).required()
    .required()
  });

  const {error, value} = schema.validate({nombre: req.body.nombre});
  if(error){
    const mensaje = error.details[0].message;
    res.status(404).send(mensaje);
    return;
  }

   usuario.nombre = value.nombre;
  res.send(usuario);
});

const port = process.env.PORT || 3000;
//Se establece el puerto por donde se va a ejecutar el servidor web
app.listen(port, () =>{
  console.log(`Escuchando el puerto ${port}`);
});

