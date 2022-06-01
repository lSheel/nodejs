const jwt = require('jsonwebtoken');
const config = require('config')
//Funcion para la verificación de token
let verificarToken = (req, res, next) =>{
  //Obtendremos el token que tenemos guardado en el header en el campo "Authorization"
  let token  = req.get('Authorization');
  //Verificamos el token donde vamos a pasar el token que obtenemos, le pasamos la key y aparte se crea una funcion callback donde los parametros seran en error y el token decodificado
  jwt.verify(token, config.get('configToken.SEED'), (err, decoded) =>{
    //Si hay error mandaremos el error con el erro 401 de bad authenticacion
    if(err){
      return res.status(401).json({err});
    }
    //Si es correcto le pasaremos a nuestro request el json usuario que enviamos en la parte de post con los datos
    req.usuario = decoded.usuario;
    //Funcion para seguir con nuestro middleware
    next();
    
  }) 
}

module.exports = verificarToken;
