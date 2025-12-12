const db = require("../db");

// =============================
// GET: todos los espacios
// =============================

exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM tipoEventos ORDER BY idTipoEvento ASC");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: organización por ID
// =============================
exports.obtenerUno = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        const [rows] = await connection.query(
            "SELECT * FROM tipoEventos WHERE idTipoEvento = ?",
            [id]
        );

        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// POST: Crear
// =============================
exports.crear = async (req, res) => {
    try {
        const connection = await db;
        const { tipoEvento} = req.body;

        await connection.query(`
            CALL crearTipoEvento(?, @mensaje);
        `, [tipoEvento]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// PUT: Modificar
// =============================
exports.modificar = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;
        const { tipoEvento} = req.body;

        await connection.query(`
            CALL modificarTipoEvento(?, ?, @mensaje);
        `, [id, tipoEvento]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// DELETE
// =============================
exports.eliminar = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        await connection.query("CALL eliminarTipoEvento(?, @mensaje)", [id]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};