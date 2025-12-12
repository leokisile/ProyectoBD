const express = require("express");
const router = express.Router();
const p = require("../controllers/librosController");

// GET todos
router.get("/", p.obtenerTodos);

// GET por ID
router.get("/:id", p.obtenerUno);

// POST → crear (usa SP)
router.post("/", p.crear);

// PUT → modificar (usa SP)
router.put("/:id", p.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", p.eliminar);

module.exports = router;