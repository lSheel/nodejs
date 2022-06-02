const express = require("express");
const router = express.Router();
const Curso = require("../models/curso_model");
const verificarToken = require("../middlewares/auth");

router.get("/", verificarToken, (req, res) => {

  let resultado = listarCursos();

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

router.post("/", verificarToken, (req, res) => {
  let resultado = crearCurso(req);
  resultado
    .then((valor) => {
      res.json({ curso: valor });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.put("/:id", verificarToken, (req, res) => {
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

router.delete("/:id", verificarToken, (req, res) => {
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

async function crearCurso(req) {
  //Creando curso con relacion de referencia
  let curso = new Curso({
    titulo: req.body.titulo,
    autor: req.usuario._id,
    descripcion: req.body.descripcion,
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

async function listarCursos() {
  //Relacion por referencia se usa pooulate para poder acceder a los datos del otro esquema al que hacemos referencia
  let buscar = await Curso.find({
    estado: true,
  }).populate("autor","nombre -_id");

  return buscar;
}

module.exports = router;
