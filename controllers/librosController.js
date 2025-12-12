const e = require("cors");
const db = require("../db");

// =============================
// GET: todos los espacios
// =============================

exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query('SELECT l.*, p.nombre as autor, e.nombre as editorial FROM libros l INNER JOIN personas p ON l.idAutor = p.idPersona INNER JOIN organizaciones e ON l.idEditorial = e.idOrganizacion');
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
            "SELECT * FROM libros WHERE idLibro = ?",
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
        const { titulo, sinopsis, img, idAutor, idEditorial} = req.body;

        await connection.query(`
            CALL crearLibros(?,?,?,?,?, @mensaje);
        `, [titulo, sinopsis, img, idAutor, idEditorial]);

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
        const { titulo, sinopsis, img, idAutor, idEditorial} = req.body;

        await connection.query(`
            CALL modificarLibros(?, ?, ?, ?, ?, ?, @mensaje);
        `, [id, titulo, sinopsis, img, idAutor, idEditorial]);

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

        await connection.query("CALL eliminarLibro(?, @mensaje)", [id]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};