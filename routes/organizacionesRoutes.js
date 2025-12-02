const express = require("express");
const router = express.Router();
const org = require("../controllers/organizacionesController");

// GET todos
router.get("/", org.obtenerTodos);

// GET por ID
router.get("/:id", org.obtenerUno);

// POST → crear (usa SP)
router.post("/", org.crear);

// PUT → modificar (usa SP)
router.put("/:id", org.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", org.eliminar);

module.exports = router;
