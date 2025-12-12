const express = require("express");
const router = express.Router();
const r = require("../controllers/rolesController");

// GET todos
router.get("/", r.obtenerTodos);

// GET por ID
router.get("/:id", r.obtenerUno);

// POST → crear (usa SP)
router.post("/", r.crear);

// PUT → modificar (usa SP)
router.put("/:id", r.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", r.eliminar);

module.exports = router;