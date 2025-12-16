const db = require("../db");

// =====================================
// GET: todas las relaciones persona-evento
// =====================================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;

        const [rows] = await connection.query(`
            SELECT * From relLibroPres lp
            INNER JOIN libros l ON lp.idLibro = l.idLibro
            INNER JOIN presEditorial p ON lp.idPresEditorial = p.idPresEditorial;
        `);

        res.json(rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Libros de presentacion editorial por id
// =============================
exports.librosPres = async (req, res) => {
    try {
        const connection = await db;
        const { idPres } = req.params;

        const [rows] = await connection.execute("CALL librosPres(?)", [idPres]);
        console.log(rows);


        // results puede ser un arreglo de arreglos, tomamos el primero que contiene filas
        let data;
        if (Array.isArray(rows)) {
            if (Array.isArray(rows[0])) {
                data = rows[0]; // Primer conjunto de filas
            } else {
                data = rows;
            }
        } else {
            data = [];
        }

        // Si data está vacío, respondemos con un arreglo vacío
        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// =====================================
// GET: una relación por PK compuesta
// =====================================
exports.obtenerUno = async (req, res) => {
    try {
        const connection = await db;
        const { idLibro, idPresEditorial } = req.params;

        const [rows] = await connection.query(`
            SELECT *
            FROM relLibroPres
            WHERE idLibro = ? AND idPresEditorial = ?;
        `, [idLibro, idPresEditorial]);

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

        const { idLibro, idPresEditorial } = req.body;

        await connection.query(`
            CALL crearRelLibroPres(?, ?, @mensaje);
        `, [idLibro, idPresEditorial]);

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
        const { idLibro: idLibro_old, idPresEditorial: idPresEditorial_old } = req.params;

        // Nuevos valores enviados por el body
        const { idLibro, idPresEditorial } = req.body;

        await connection.query(`
            CALL modificarRelLibroPres(?, ?, ?, ?, @mensaje);
        `, [
            idLibro_old,
            idPresEditorial_old,
            idLibro,
            idPresEditorial,
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

        const { idLibro, idPresEditorial } = req.params;

        await connection.query(`
            CALL eliminarRelLibroPres(?, ?, @mensaje);
        `, [idLibro, idPresEditorial ]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
