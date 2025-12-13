const express = require("express");
const router = express.Router();
const eventos = require("../controllers/eventosController");

// =======================
// EVENTOS PRINCIPALES
// =======================

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

// =======================
// SUBTIPOS
// =======================

// ---- Presentación Editorial ----
router.post("/presEditorial", eventos.crearPres);

// ---- Evento Musical ----
router.post("/musical", eventos.crearMusical);
router.put("/musical/:idEvento", eventos.modificarMusical);

// ---- Taller ----
router.post("/taller", eventos.crearTaller);
router.put("/taller/:idEvento", eventos.modificarTaller);

// ---- Premiación ----
router.post("/premiacion", eventos.crearPremiacion);
router.put("/premiacion/:idEvento", eventos.modificarPrem);

// =======================

module.exports = router;
