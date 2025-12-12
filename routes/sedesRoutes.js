const express = require("express");
const router = express.Router();
const sd = require("../controllers/sedesController");

// GET todos
router.get("/", sd.obtenerTodos);

// GET por ID
router.get("/:id", sd.obtenerUno);

// POST → crear (usa SP)
router.post("/", sd.crear);

// PUT → modificar (usa SP)
router.put("/:id", sd.modificar);

// DELETE → eliminar (usa SP)
router.delete("/:id", sd.eliminar);

module.exports = router;