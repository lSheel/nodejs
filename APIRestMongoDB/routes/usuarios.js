"use strict";
//Nuestra ruta de usuario, para lo que se utiliza es para manejar las peticiones http que recibamos si es que se solicita la ruta url/usuarios
//Llamamos a nuestro modulo express
const express = require("express");
const jwt = require("jsonwebtoken");
const config = require("config");
//Creamos una variables que va a instanciar el el metodo Router donde manejaremos las direcciones que vamos a recibir
const ruta = express.Router();
//Llamamos a nuestro modelo que creamos para el manejo de datos en MongoDB
const Usuario = require("../models/usuario_model");
const Joi = require("joi");
//Bcrypt para el cifrado de contraseñas
const bcrypt = require("bcrypt");
const verificarToken = require('../middlewares/auth');
//Crearemos nuestro esquema de Joi para la validacion de los parametros que vamos a pasar para validar de datos
const schema = Joi.object({
  //Para nuestro campo "nombre" le pediremos que sea una String, con un minimo de 3 caracteres y es requerido
  nombre: Joi.string().min(3).max(30).required(),
  //Nuestra contraseña que va a ser un String y va a necesitar los campos que establecemos en la expresion regex, (de la A-Z con min y mayus con un minimo de 3 caracteres hasta 30)
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  //Email
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
});

//peticion http get para probar el servidor
ruta.get("/", verificarToken, (req, res) => {
  //creamos nuestra variable donde estanciaremos el resultado de nuestro funcion usuariosActivos
  let resultado = usuariosActivos();
  //Luego manejaremos nuestra promesa
  resultado
    //Con esto le enviaremos los usuarios como respuesta al cliente
    .then((datos) => {
      res.json({
        usuario: datos,
      });
    })
    //En otro caso le enviaremos a nuestro cliente el error
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});

//peticion http post donde crearemos un usuario con los datos que vamos a recibir
ruta.post("/",verificarToken, (req, res) => {
  //Recibimos nuestro body de donde obtendremos los datos necesarios para la creacion del usuarios
  let body = req.body;
  //const usuarioExiste = Usuario.findOne({ email: body.email }).exec();
  //usuarioExiste.then(valor =>{
  //res.status(400).json({
  //msj: valor
  //})
  //})

  //Se puede crear un metodo aparte para la validacion del email que igual debe ser un metodo asincrono
  //Se haria de la siguiente manera
  //let { email } = req.body;
  //const usuarioExiste = await Usuario.findOne({email : email}).exec();
  //Se puede crear un metodo aparte para la validacion del email que igual debe ser un metodo asincrono
  //usuarioExiste.then(valor =>{
  //res.status(400).json({
  //msj: valor
  //});
  //});
  //Se crea una secuencia mongoDB para que verifiquemos que el email no este ocupado
  Usuario.findOne(
    {
      //Comparemos el email de nuestra base de datos con el que esta en el body
      email: body.email,
    },
    //Aparte como otro parametro usaremos una funcion callback donde devolveremos la respuesta si es que hay error o ya existe el correo, para asi acabar con la peticion http
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "Server error",
        });
      }
      if (user) {
        return res.status(400).json({
          msj: "El usuario ya existe",
        });
      }
    }
  );
  //Ahora verificaremos si los datos cumplen con lo establecido en nuestro esquema Joi
  const { error, valor } = schema.validate({
    nombre: body.nombre,
    email: body.email,
  });

  if (!error) {
    //Creamos una variable donde vamos a recibir el valor de nuestro metodo crearUsuario el cual es una promesa
    let resultado = crearUsuario(body);
    //Primero definimos los dos posibles estados
    resultado
      .then((user) => {
        //En caso de que nuestra promesa que cumpla le enviaremos al usuario en un json los valores que recibimos al crear el usuario
        res.json({
          nombre: user.nombre,
          email: user.email,
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: err,
        });
      });
    //Luego viene el error, si no se cumple la promesa enviaremos el codigo 400 con el error que recibimos en un json
  } else {
    res.status(400).json({
      error: error,
    });
  }
});
//Nuestra peticion http put para actualizar datos, en donde el dato que vamos a comparar es el email
ruta.put("/:email",verificarToken, (req, res) => {
  const { error, valor } = schema.validate({ nombre: req.body.nombre });
  if (!error) {
    //Creamos nuestra variable resultado donde vamos a llamar al valor resultante de nuestro metodo actualizarUsuario donde le pasamos el email y
    //el body
    let resultado = actualizarUsuario(req.params.email, req.body);
    //Evaluamos la promesa, si se cumplio le enviaremos al usuario el json con los valores que obtuvimos del body
    resultado
      .then((datos) => {
        res.json({
          nombre: datos.nombre,
          email: datos.email,
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: err,
        });
      });
    //En caso de error mandaremos al usuario nuestro json con el error
  } else {
    res.status(400).json({
      error: error,
    });
  }
});

//Peticion http delete
ruta.delete("/:email",verificarToken, (req, res) => {
  //Creamos nuestra variable donde estanciaremos nuestra funcion desactivarUsuario
  let resultado = desactivarUsuario(req.params.email);
  //Manejaremos nuestra promesa
  resultado
    .then((datos) => {
      console.log(datos);
      res.json({
        //Si se cumplio nuestra promesa de desactivar el usuario le devolveremos los datos del usuario que se desactivo
        nombre: datos.nombre,
        email: datos.email,
      });
    })
    //Mandaremos el error si es el caso
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});

//Nuestro metodo asincrono para la creacion del usuario donde de parametro le pasaremos el body
async function crearUsuario(body) {
  //Instanciamos nuestro modelo que creamos para mongoDB y le pasaremos los datos que recibimos de nuestro body
  let usuario = new Usuario({
    email: body.email,
    nombre: body.nombre,
    password: bcrypt.hashSync(body.password, 10),
  });
  //Una vez que se le pasaron los datos se regresara el valor con el await para esperar el resultado, si se creo correctamente o no
  return await usuario.save();
}
//Metodo asincrono para la actulizacion de nuestro usuario usando el email
async function actualizarUsuario(email, body) {
  //Creamos nuestra variable usuario donde dependiendo del resultado se cumplira nuestra promesa o no
  error: "Server Error";
  //(En SQL seria el "WHERE") y si se cumple la condicional ya pasaremos a la actualizacion de datos ($set) donde cambiaremos el dato nombre y contraseña
  //que pasaremos de nuestro formulario (en este caso por postman)
  let usuario = await Usuario.findOneAndUpdate(
    { email: email },
    {
      $set: {
        nombre: body.nombre,
        password: body.password,
      },
    },
    //retorna el documento que se ha actualizado
    { new: true }
  );
  return usuario;
}

async function desactivarUsuario(email) {
  //Creamos una variable donde estanciaremos una sentencia MongoDB que hara un findOneAndUpdate para desctivar el campo el cual le pasamos la palabra clave await por que es donde se devolvera el valor de la promesa
  let usuario = await Usuario.findOneAndUpdate(
    { email: email },
    {
      $set: {
        estado: false,
      },
    },
    {
      new: true,
    }
  );
  //Retornamos la promesa
  return usuario;
}

async function usuariosActivos() {
  let usuario = await Usuario.find({
    estado: true,
  }).select({
    nombre: 1,
    email: 1,
  });
  return usuario;
}

module.exports = ruta;
