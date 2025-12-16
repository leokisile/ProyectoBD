const express = require("express");
const router = express.Router();
const rp = require("../controllers/orgeventoController");

// GET: obtener todas las relaciones
router.get("/", rp.obtenerTodos);

// GET: obtener una relación por PK compuesta
router.get("/:idEvento/:idOrg", rp.obtenerUno);

// GET: obtener todas las redes de una persona (1 solo parámetro)
router.get("/:idEvento", rp.obtenerPorEvento); 

// POST: crear relación
router.post("/", rp.crear);

// PUT: modificar relación (PK compuesta)
router.put("/:idEvento/:idOrg", rp.modificar);

// DELETE: eliminar relación (PK compuesta)
router.delete("/:idEvento/:idOrg", rp.eliminar);

module.exports = router;
