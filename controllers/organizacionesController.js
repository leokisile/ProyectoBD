const db = require("../db");

// =============================
// GET: todas las organizaciones
// =============================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query("SELECT * FROM organizaciones");
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
            "SELECT * FROM organizaciones WHERE idOrganizacion = ?",
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
        const { nombre, tel, correo, pagina, pais, estado, ciudad } = req.body;

        await connection.query(`
            CALL crearOrganizacion(?, ?, ?, ?, ?, ?, ?, @mensaje);
        `, [nombre, tel, correo, pagina, pais, estado, ciudad]);

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
        const { nombre, tel, correo, pagina, pais, estado, ciudad } = req.body;

        await connection.query(`
            CALL modificarOrganizacion(?, ?, ?, ?, ?, ?, ?, ?, @mensaje);
        `, [id, nombre, tel, correo, pagina, pais, estado, ciudad]);

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

        await connection.query("CALL eliminarOrganizacion(?, @mensaje)", [id]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
