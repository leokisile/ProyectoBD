const express = require("express");
const router = express.Router();
const rp = require("../controllers/personaseventosController");

// GET: obtener todas las relaciones
router.get("/", rp.obtenerTodos);

// GET: obtener una relación por PK compuesta
router.get("/:idPersona/:idEvento/:idRol", rp.obtenerUno);

// GET: obtener todas las redes de una persona (1 solo parámetro)
router.get("/:idEvento", rp.obtenerPorEvento); 

// POST: crear relación
router.post("/", rp.crear);

// PUT: modificar relación (PK compuesta)
router.put("/:idPersona/:idEvento/:idRol", rp.modificar);

// DELETE: eliminar relación (PK compuesta)
router.delete("/:idPersona/:idEvento/:idRol", rp.eliminar);

module.exports = router;
