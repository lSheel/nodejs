const express = require("express");
const router = express.Router();
const Curso = require("../models/curso_model");

router.get("/", (req, res) => {
  let resultado = listarCursos();

  resultado.then(valor =>{
    res.json({
      res: valor
    });
  }).catch(err =>{
    res.status(400).json({
      error: err
    });
  });
});

router.post("/", (req, res) => {
  let resultado = crearCurso(req.body);
  resultado
    .then((valor) => {
      res.json({ curso: valor });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.put("/:id", (req, res) => {
  let body = req.body;
  let resultado = actualizarCurso(req.params.id, body);
  resultado
    .then((valor) => {
      res.json({ valores: valor });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.delete("/:id", (req, res) => {
  let resultado = desactivarCurso(req.params.id);
  resultado
    .then((valor) => {
      res.json({
        res: valor,
      });
    })
    .catch((err) => {
      res.status(400).json({
        error: err,
      });
    });
});

async function crearCurso(body) {
  let curso = new Curso({
    titulo: body.titulo,
    descripcion: body.descripcion,
  });

  return await curso.save();
}

async function actualizarCurso(id, body) {
  let curso = await Curso.findByIdAndUpdate(
    id,
    {
      $set: {
        titulo: body.titulo,
        descripcion: body.descripcion,
      },
    },
    {
      new: true,
    }
  );
  return curso;
}

async function desactivarCurso(id) {
  let desactivar = await Curso.findByIdAndUpdate(
    id,
    {
      $set: {
        estado: false,
      },
    },
    {
      new: true,
    }
  );
  return desactivar;
}

async function listarCursos(){
  let buscar = await Curso.find();

  return buscar;
}





module.exports = router;
