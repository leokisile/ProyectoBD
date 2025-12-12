const express = require("express");
const router = express.Router();
const esp = require("../controllers/espaciosController");

// GET todos
router.get("/", esp.obtenerTodos);

// GET por ID
router.get("/:id", esp.obtenerUno);

// POST → crear (usa SP)
router.post("/", esp.crear);

// PUT → modificar (usa SP)
router.put("/:id", esp.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", esp.eliminar);

module.exports = router;