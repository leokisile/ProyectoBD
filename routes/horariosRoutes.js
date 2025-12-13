const express = require("express");
const router = express.Router();
const p = require("../controllers/horariosController");

// GET por evento
router.get("/:id", p.obtenerUno);

// GET todos
router.get("/", p.obtenerTodos);

// POST → crear (usa SP)
router.post("/", p.crear);

// PUT → modificar (usa SP)
router.put("/:id", p.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", p.eliminar);

module.exports = router;