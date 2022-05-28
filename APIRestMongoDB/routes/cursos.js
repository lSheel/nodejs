const express = require('express');
const router = express.Router();
const Curso = require('../models/curso_model');


router.get('/',(req, res) => {
  res.send('Hola desde la ruta cursos');
});

router.post('/', (req, res) =>{
  let resultado = crearCurso(req.body);
  resultado.then( valor =>{
    res.json({curso: valor})
  }).catch(err =>{
    res.status(400).json({error: err})
  });
});


router.put('/:id', (req, res)=>{
  let body = req.body;
  let resultado = actualizarCurso(req.params.id, body);
  resultado.then( valor =>{
    res.json({valores: valor});
  }).catch(err =>{
    res.status(400).json({error : err});
  });
});

 
async function crearCurso(body){
  let curso = new Curso({
    titulo:      body.titulo,
    descripcion:  body.descripcion
  });

  return await curso.save();
}

async function actualizarCurso(id, body){
  let curso = await Curso.findByIdAndUpdate(id,{
    $set:{
      titulo: body.titulo,
      descripcion: body.descripcion
    },
  },
    {
      new: true
    });
  return curso;
}
module.exports = router;
