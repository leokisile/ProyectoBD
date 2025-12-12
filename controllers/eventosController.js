const db = require("../db");

// =============================
// GET: todas las organizaciones
// =============================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query(`
            SELECT e.*, s.nombre AS sede, t.tipoEvento AS tipoEvento
            FROM eventos e
            INNER JOIN sedes s ON e.idSede = s.idSede
            INNER JOIN tipoEventos t ON e.idTipoEvento = t.idTipoEvento
            ORDER BY e.idEvento ASC;
            `);
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =======================================================
// GET uno
// =======================================================
exports.obtenerUno = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const [rows] = await connection.query(
            `SELECT * FROM eventos WHERE idEvento = ?`,
            [idEvento]
        );

        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =======================================================
// POST crear
// =======================================================
exports.crear = async (req, res) => {
    try {
        const connection = await db;
        const {
            titulo, sinopsis, reqRegistro, participaPublico,
            descripcion, infoAd, imagen, idSede, idTipoEvento
        } = req.body;

        const [result] = await connection.query(
            `CALL crearEvento(?,?,?,?,?,?,?,?,?, @msg); SELECT @msg;`,
            [
                titulo, sinopsis, reqRegistro, participaPublico,
                descripcion, infoAd, imagen, idSede, idTipoEvento
            ]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =======================================================
// PUT modificar
// =======================================================
exports.modificar = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const {
            titulo, sinopsis, reqRegistro, participaPublico,
            descripcion, infoAd, imagen, idSede, idTipoEvento
        } = req.body;

        const [result] = await connection.query(
            `CALL modificarEvento(?,?,?,?,?,?,?,?,?,?, @msg); SELECT @msg;`,
            [
                idEvento, titulo, sinopsis, reqRegistro, participaPublico,
                descripcion, infoAd, imagen, idSede, idTipoEvento
            ]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =======================================================
// DELETE eliminar
// =======================================================
exports.eliminar = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const [result] = await connection.query(
            `CALL eliminarEvento(?, @msg); SELECT @msg;`,
            [idEvento]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
