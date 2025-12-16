    const express = require("express");
    const router = express.Router();
    const consultas = require("../controllers/consultasController");

    const db = require("../db");


    // GET: Programa General (tabla de eventos)
    router.get("/ProgGeneral", consultas.programaGeneral);

    // GET: Dias de eventos
    router.get("/Dias", consultas.dias);

    // GET: Lista de categorias del programa editorial
    router.get("/ProgEditorial", consultas.programaEditorial);

    // GET: Lista de categorias del programa cultural
    router.get("/ProgCultural", consultas.programaCultural);

    // GET: Lista de categorias d talleres
    router.get("/Talleres", consultas.talleres);

    // GET: Eventos de una categoria y fecha especifica
        // Ruta con fecha
    router.get("/EventoCategoria/:idTipoEvento/:fecha", consultas.eventoCategoria);

    // Ruta sin fecha (para cargar todos)
    router.get("/EventoCategoria/:idTipoEvento", consultas.eventoCategoria);


    // GET: Eventos especificos por ID
    router.get("/EventoIndv/:idEvento", consultas.eventoIndv);

    // GET: Libros de presentacion editorial por id
    router.get("/LibrosPres/:id", consultas.librosPres);

    // GET: Setlist de un evento musical
    router.get("/Setlist/:id", consultas.setlist);

    // GET: Datos adicionales de un taller
    router.get("/DatosTaller/:id", consultas.datosTaller);

    // GET:Premio dado en una premiacion
    router.get("/Premio/:id", consultas.premio);

    // GET todos
    router.get("/Persona", consultas.obtenerPersonas);

    // GET por ID
    router.get("/Persona/:id", consultas.obtenerPersona);

    module.exports = router;