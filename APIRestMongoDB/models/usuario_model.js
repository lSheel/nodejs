//Llamamos a nuestro modulo mongoose para la creacion del modelo
const mongoose = require('mongoose');

//Instanciamos el metodo Schema de mongoose donde definiremos el campo:valor que vamos a utilizar
const usuario_schema = new mongoose.Schema({
  email:{
    type: String,
    required : true,
    unique: true
  },
  nombre:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  estado:{
    type: Boolean,
    default: true
  },
  imagen:{
    type: String,
    required: false
  }
});
//Lo exportamos
module.exports = mongoose.model('Usuario', usuario_schema);

