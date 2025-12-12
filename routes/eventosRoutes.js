const express = require("express");
const router = express.Router();
const eventos = require("../controllers/eventosController");

// GET todos
router.get("/", eventos.obtenerTodos);

// GET uno
router.get("/:idEvento", eventos.obtenerUno);

// POST crear
router.post("/", eventos.crear);

// PUT modificar
router.put("/:idEvento", eventos.modificar);

// DELETE eliminar
router.delete("/:idEvento", eventos.eliminar);

module.exports = router;
