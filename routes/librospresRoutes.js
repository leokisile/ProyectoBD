const express = require("express");
const router = express.Router();
const lp = require("../controllers/librospresController");

// GET: obtener todas las relaciones
router.get("/", lp.obtenerTodos);

// GET: obtener una relación por PK compuesta
router.get("/:idLibro/:idPresEditorial", lp.obtenerUno);

// GET: obtener todas las redes de una persona (1 solo parámetro)
router.get("/:idPres", lp.librosPres); 

// POST: crear relación
router.post("/", lp.crear);

// PUT: modificar relación (PK compuesta)
router.put("/:idLibro/:idPresEditorial", lp.modificar);

// DELETE: eliminar relación (PK compuesta)
router.delete("/:idLibro/:idPresEditorial", lp.eliminar);

module.exports = router;
