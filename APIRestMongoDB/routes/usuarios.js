//Nuestra ruta de usuario, para lo que se utiliza es para manejar las peticiones http que recibamos si es que se solicita la ruta url/usuarios
//Llamamos a nuestro modulo express
const express = require("express");
//Creamos una variables que va a instanciar el el metodo Router donde manejaremos las direcciones que vamos a recibir
const ruta = express.Router();
//Llamamos a nuestro modelo que creamos para el manejo de datos en MongoDB
const Usuario = require("../models/usuario_model");


const Joi = require("joi");

const schema = Joi.object({
  nombre: Joi.string().min(3).max(30).required(),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),

  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
});
//peticion http get para probar el servidor
ruta.get("/", (req, res) => {
  let resultado = usuariosActivos();
  resultado
    .then((datos) => {
      res.json({
        usuario: datos,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});

//peticion http post donde crearemos un usuario con los datos que vamos a recibir
ruta.post("/", (req, res) => {
  //Recibimos nuestro body de donde obtendremos los datos necesarios para la creacion del usuarios
  let body = req.body;

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
          valor: user,
          //Luego viene el error, si no se cumple la promesa enviaremos el codigo 400 con el error que recibimos en un json
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: err,
        });
      });
  } else {
    res.status(400).json({
      error: error,
    });
  }
});
//Nuestra peticion http put para actualizar datos, en donde el dato que vamos a comparar es el email
ruta.put("/:email", (req, res) => {
  const { error, valor } = schema.validate({ nombre: req.body.nombre });
  if (!error) {
    //Creamos nuestra variable resultado donde vamos a llamar al valor resultante de nuestro metodo actualizarUsuario donde le pasamos el email y
    //el body
    let resultado = actualizarUsuario(req.params.email, req.body);
    //Evaluamos la promesa, si se cumplio le enviaremos al usuario el json con los valores que obtuvimos del body
    resultado
      .then((datos) => {
        res.json({
          valor: datos,
        });
      })
      .catch((err) => {
        res.status(400).json({
          error: err,
        });
      });
    //En caso de error mandaremos al usuario nuestro json con el error
  }
  else{
    res.status(400).json({
      error: error
    })
  }
});

ruta.delete("/:email", (req, res) => {
  let resultado = desactivarUsuario(req.params.email);
  resultado
    .then((datos) => {
      console.log(datos);
      res.json({
        usuario: datos,
      });
    })
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
    password: body.password,
  });
  //Una vez que se le pasaron los datos se regresara el valor con el await para esperar el resultado, si se creo correctamente o no
  return await usuario.save();
}
//Metodo asincrono para la actulizacion de nuestro usuario usando el email
async function actualizarUsuario(email, body) {
  //Creamos nuestra variable usuario donde dependiendo del resultado se cumplira nuestra promesa o no
  //Lo usaremos un metodo de nuestro modelo Usuario(findOneAndUpdate) donde la primera parte es evaluar el dato donde queremos actulizar el dato
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
  return usuario;
}

async function usuariosActivos() {
  let usuario = await Usuario.find({
    estado: true,
  });
  return usuario;
}

module.exports = ruta;
