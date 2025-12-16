const db = require("../db");

// =============================
// GET: Programa General (tabla de eventos)
// =============================

exports.programaGeneral = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM programaGeneral");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Dias de eventos
// =============================

exports.dias = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM dias");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Lista de categorias del programa editorial
// =============================

exports.programaEditorial = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM programaEditorial");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Lista de categorias del programa cultural
// =============================

exports.programaCultural = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM programaCultural");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Lista de categorias d talleres
// =============================

exports.talleres = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM talleres");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Eventos de una categoria y fecha especifica
// =============================
exports.eventoCategoria = async (req, res) => {
    try {
        const connection = await db;
        const { idTipoEvento, fecha } = req.params;

        // Si no hay fecha, pasamos NULL
        const fechaParam = fecha || null;

        const [rows] = await connection.query(
            "CALL eventoCategoria(?, ?)",
            [idTipoEvento, fechaParam]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Eventos especificos por ID
// =============================
exports.eventoIndv = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const [rows] = await connection.query(
            "CALL eventoIndv(?)",
            [idEvento]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Libros de presentacion editorial por id
// =============================
exports.librosPres = async (req, res) => {
    try {
        const connection = await db;
        const { idPres} = req.params;

        const [rows] = await connection.query(
            "CALL librosPres(?)",
            [idPres]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Setlist de un evento musical
// =============================
exports.setlist = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        const [rows] = await connection.query(
            "CALL setlist(?)",
            [id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Datos adicionales de un taller
// =============================
exports.datosTaller = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        const [rows] = await connection.query(
            "CALL datosTaller(?)",
            [id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET:Premio dado en una premiacion
// =============================
exports.premio = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        const [rows] = await connection.query(
            "CALL premio(?)",
            [id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Todas las personas
// =============================

exports.obtenerPersonas = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM personas");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Persona por ID
// =============================
exports.obtenerPersona = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        const [rows] = await connection.query(
            "SELECT * FROM personas WHERE idPersona = ?",
            [id]
        );

        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};