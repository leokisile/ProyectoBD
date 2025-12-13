const db = require("../db");

// =====================================
// GET: todas las relaciones persona-evento
// =====================================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;

        const [rows] = await connection.query(`
            SELECT pe.idPersona, p.nombre AS persona,
                   pe.idRol, r.rol AS rol,
                   pe.idEvento, e.titulo AS evento
            FROM relPersonaEvento pe
            INNER JOIN personas p ON pe.idPersona = p.idPersona
            INNER JOIN roles r ON pe.idRol = r.idRol
            INNER JOIN eventos e ON pe.idEvento = e.idEvento
            ORDER BY pe.idPersona, pe.idEvento, pe.idRol;
        `);

        res.json(rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =====================================
// GET: todas las relaciones por evento
// =====================================
exports.obtenerPorEvento = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const [rows] = await connection.query(`
            SELECT pe.idPersona, p.nombre AS persona,
                   pe.idRol, r.rol AS rol,
                   pe.idEvento, e.titulo AS evento
            FROM relPersonaEvento pe
            INNER JOIN personas p ON pe.idPersona = p.idPersona
            INNER JOIN roles r ON pe.idRol = r.idRol
            INNER JOIN eventos e ON pe.idEvento = e.idEvento
            WHERE pe.idEvento = ?
            ORDER BY pe.idPersona, pe.idEvento, pe.idRol;
        `, [idEvento]);

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
        const { idPersona, idEvento, idRol } = req.params;

        const [rows] = await connection.query(`
            SELECT *
            FROM relPersonaEvento
            WHERE idPersona = ? AND idEvento = ? AND idRol = ?;
        `, [idPersona, idEvento, idRol]);

        res.json(rows[0] || {});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// POST: Crear relación persona-evento
// =====================================
exports.crear = async (req, res) => {
    try {
        const connection = await db;

        const { idPersona, idEvento, idRol } = req.body;

        await connection.query(`
            CALL crearRelPersonaEvento(?, ?, ?, @mensaje);
        `, [idPersona, idEvento, idRol]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// PUT: Modificar relación persona-evento
// =====================================
exports.modificar = async (req, res) => {
    try {
        const connection = await db;

        // ← CORREGIDO: usar los nombres reales de las rutas
        const { idPersona: idPersona_old, idEvento: idEvento_old, idRol: idRol_old } = req.params;

        // Nuevos valores enviados por el body
        const { idPersona, idEvento, idRol } = req.body;

        await connection.query(`
            CALL modificarRelPersonaEvento(?, ?, ?, ?, ?, ?, @mensaje);
        `, [
            idPersona_old,
            idEvento_old,
            idRol_old,
            idPersona,
            idEvento,
            idRol
        ]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// DELETE: Eliminar relación persona-evento
// =====================================
exports.eliminar = async (req, res) => {
    try {
        const connection = await db;

        const { idPersona, idEvento, idRol } = req.params;

        await connection.query(`
            CALL eliminarRelPersonaEvento(?, ?, ?, @mensaje);
        `, [idPersona, idEvento, idRol]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
