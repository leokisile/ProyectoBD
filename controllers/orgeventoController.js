const db = require("../db");

// =====================================
// GET: todas las relacionesorg-Evento
// =====================================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;

        const [rows] = await connection.query(`
            SELECT eo.idEvento, eo.idOrganizacion, o.nombre
            FROM relEventoOrg eo
            JOIN organizaciones o ON eo.idOrganizacion = o.idOrganizacion
            ORDER BY eo.idEvento ASC, eo.idOrganizacion ASC;
        `);

        res.json(rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =====================================
// GET: todas las organizaciones de un evento
// =====================================
exports.obtenerPorEvento = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const [rows] = await connection.query(`
            SELECT eo.idEvento, eo.idOrganizacion, o.nombre
            FROM relEventoOrg eo
            JOIN organizaciones o ON eo.idOrganizacion = o.idOrganizacion
            WHERE eo.idEvento = ?;
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
        const { idEvento, idOrg } = req.params;

        const [rows] = await connection.query(`
            SELECT *
            FROM relEventoOrg
            WHERE idEvento = ? AND idOrganizacion = ?;
        `, [idEvento, idOrg]);

        res.json(rows[0] || {});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// POST: Crear relación organización-Evento
// =====================================
exports.crear = async (req, res) => {
    try {
        const connection = await db;

        const { idEvento, idOrganizacion} = req.body;

        await connection.query(`
            CALL crearRelEventoOrg(?, ?, @mensaje);
        `, [idEvento, idOrganizacion]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// =====================================
// PUT: Modificar relación organización-Evento
// =====================================
exports.modificar = async (req, res) => {
    try {
        const connection = await db;

        // ← CORREGIDO: usar los nombres reales de las rutas
        const { idEvento: idEvento_old, idOrg: idOrg_old } = req.params;

        // Nuevos valores enviados por el body
        const { idEvento, idOrg} = req.body;

        await connection.query(`
            CALL modificarRelEventoOrg(?, ?, ?, ?, @mensaje);
        `, [
            idEvento_old,
            idOrg_old,
            idEvento,
            idOrg
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

        const { idEvento, idOrg } = req.params;

        await connection.query(`
            CALL eliminarRelEventoOrg(?, ?, @mensaje);
        `, [idEvento, idOrg]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
