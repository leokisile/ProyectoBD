const db = require("../db");

// =====================================
// GET: todas las relaciones persona-red
// =====================================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;

        const [rows] = await connection.query(`
            SELECT rp.idPersona, p.nombre AS persona,
                   rp.idRed, r.red AS red,
                   rp.enlace
            FROM redesPersonas rp
            JOIN personas p ON rp.idPersona = p.idPersona
            JOIN redes r ON rp.idRed = r.idRed
            ORDER BY rp.idPersona, rp.idRed;
        `);

        res.json(rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =====================================
// GET: todas las redes de una persona
// =====================================
exports.obtenerPorPersona = async (req, res) => {
    try {
        const connection = await db;
        const { idPersona } = req.params;

        const [rows] = await connection.query(`
            SELECT rp.idPersona, rp.idRed, r.red, rp.enlace
            FROM redesPersonas rp
            JOIN redes r ON rp.idRed = r.idRed
            WHERE rp.idPersona = ?
        `, [idPersona]);

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =====================================
// GET: una relación por PK compuesta
// =====================================
exports.obtenerUno = async (req, res) => {
    try {
        const connection = await db;
        const { idPersona, idRed } = req.params;

        const [rows] = await connection.query(`
            SELECT *
            FROM redesPersonas
            WHERE idPersona = ? AND idRed = ?;
        `, [idPersona, idRed]);

        res.json(rows[0] || {});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// POST: Crear relación persona-red
// =====================================
exports.crear = async (req, res) => {
    try {
        const connection = await db;

        const { idPersona, idRed, enlace } = req.body;

        await connection.query(`
            CALL crearRedPersona(?, ?, ?, @mensaje);
        `, [idPersona, idRed, enlace]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// PUT: Modificar relación persona-red
// =====================================
exports.modificar = async (req, res) => {
    try {
        const connection = await db;

        // ← CORREGIDO: usar los nombres reales de las rutas
        const { idPersona: idPersona_old, idRed: idRed_old } = req.params;

        // Nuevos valores enviados por el body
        const { idPersona, idRed, enlace } = req.body;

        await connection.query(`
            CALL modificarRedPersona(?, ?, ?, ?, ?, @mensaje);
        `, [
            idPersona_old,
            idRed_old,
            idPersona,
            idRed,
            enlace
        ]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// DELETE: Eliminar relación persona-red
// =====================================
exports.eliminar = async (req, res) => {
    try {
        const connection = await db;

        const { idPersona, idRed } = req.params;

        await connection.query(`
            CALL eliminarRedPersona(?, ?, @mensaje);
        `, [idPersona, idRed]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
