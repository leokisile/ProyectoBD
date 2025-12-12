const express = require("express");
const router = express.Router();
const c = require("../controllers/categoriasController");

// GET todos
router.get("/", c.obtenerTodos);

// GET por ID
router.get("/:id", c.obtenerUno);

// POST → crear (usa SP)
router.post("/", c.crear);

// PUT → modificar (usa SP)
router.put("/:id", c.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", c.eliminar);

module.exports = router;