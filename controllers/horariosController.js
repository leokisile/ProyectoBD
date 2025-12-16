const db = require("../db");

// =============================
// GET: Horarios por Evento
// =============================
exports.obtenerUno = async (req, res) => {
    try {
        const connection = await db;
        const { id } = req.params;

        const [rows] = await connection.query(
            "SELECT * FROM eventoHorario WHERE idEvento = ?",
            [id]
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// =============================
// GET: Horarios completos
// =============================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;

        const [rows] = await connection.query(
            "SELECT * FROM eventoHorario"
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error:err.message});
    }
};

// =============================
// POST: Crear
// =============================
exports.crear = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento, finicio, ffin} = req.body;

        await connection.query(`
            CALL crearEventoHorario(?,?,?, @mensaje);
        `, [idEvento, finicio, ffin]);

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
        const { evento, finicio, ffin} = req.body;

        await connection.query(`
            CALL modificarEventoHorario(?, ?, ?, ?, @mensaje);
        `, [id, evento, finicio, ffin]);

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

        await connection.query("CALL eliminarHorarioEvento(?, @mensaje)", [id]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};