const express = require("express");
const router = express.Router();
const rp = require("../controllers/redespersonasController");

// GET: obtener todas las relaciones
router.get("/", rp.obtenerTodos);

// GET: obtener una relación por PK compuesta
router.get("/:idPersona/:idRed", rp.obtenerUno);

// GET: obtener todas las redes de una persona (1 solo parámetro)
router.get("/:idPersona", rp.obtenerPorPersona); 

// POST: crear relación
router.post("/", rp.crear);

// PUT: modificar relación (PK compuesta)
router.put("/:idPersona/:idRed", rp.modificar);

// DELETE: eliminar relación (PK compuesta)
router.delete("/:idPersona/:idRed", rp.eliminar);

module.exports = router;
