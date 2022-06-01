"use strict";
const express = require("express");
const config = require("config");
//Creamos nuestra instancia router de express para el manejo de direcciones
const ruta = express.Router();
//Modelo de la base de datos usuarios
const Usuario = require("../models/usuario_model");
//const Joi = require("joi");
//bcrypt se utiliza para el cifrado de contraseñas
const bcrypt = require("bcrypt");
//Manejo de json web tokens
const jwt = require("jsonwebtoken");

//Peticion http post para la autenticacion del usuario
ruta.post('/', (req, res) =>{

  //Comado mongoDB donde buscaremo si el usuario existe con el email, esto se manejo como una promesa
  Usuario.findOne({email : req.body.email})
    .then(datos =>{
      //Si se cumple la promesa, verificaremos que existen datos en la variable
      if(datos){
        //Una vez que verifiquemos que existan los datos compararemos las contraseñas, la que pasamos en el body y la que esta almacenada en al base de datos
        const passValid = bcrypt.compareSync(req.body.password, datos.password);
        //Si las contraseñas no coinciden, mandara el siguiente error
        if(!passValid) return res.status(400).json({
          error: "ok",
          msj: "Usuario o contraseña incorrecto"
        });
      //Aqui crearemos nuestro jwt, en donde en el payload vamos a tener los datos del usuario (id, nombre y email), le pasaremos una clave que establecemos en la configuracon json y la expiracion que tambien le establecimos
        //en el archivo de configuracion
      const jwToken = jwt.sign({_id: datos._id, nombre: datos.nombre, email: datos.email}, config.get('configToken.SEED'), {expiresIn: config.get('configToken.expiration')});
        //jwt.sign({_id: datos._id, nombre: datos.nombre, email: datos.email}, 'password');
        //Le enviaremos al usuario
        res.json({
          usuario: {
            _id:datos._id,
            nombre: datos.nombre,
            email: datos.email
          },jwToken 
        });
      }
      else{
        res.status(400).json({
          error: "ok",
          msj: "Usuario o contraseña incorrecta"
        })
      }
    })
    .catch(err =>{
      res.status(400).json({
        error: 'ok',
        msj: 'Error en el servicio' + err
      });
    });
});


module.exports = ruta;

