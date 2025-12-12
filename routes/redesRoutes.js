const express = require("express");
const router = express.Router();
const rd = require("../controllers/redesController");

// GET todos
router.get("/", rd.obtenerTodos);

// GET por ID
router.get("/:id", rd.obtenerUno);

// POST → crear (usa SP)
router.post("/", rd.crear);

// PUT → modificar (usa SP)
router.put("/:id", rd.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", rd.eliminar);

module.exports = router;