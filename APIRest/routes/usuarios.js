const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json('Hola desde el GET de usuarios');
});


module.exports = router;
