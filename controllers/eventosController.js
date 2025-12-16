const db = require("../db");

// =============================
// GET: todas las organizaciones
// =============================
exports.obtenerTodos = async (req, res) => {
    try {
        const connection = await db;
        const [rows] = await connection.query(`
            SELECT 
                e.*, 
                s.nombre AS sede, 
                t.tipoEvento AS tipoEvento,
                m.idMusical IS NOT NULL AS esMusical,
                ta.idTaller IS NOT NULL AS esTaller,
                p.idPremiacion IS NOT NULL AS esPremiacion,
                pe.idPresEditorial IS NOT NULL AS esPresEditorial
            FROM eventos e
            INNER JOIN sedes s ON e.idSede = s.idSede
            INNER JOIN tipoEventos t ON e.idTipoEvento = t.idTipoEvento
            LEFT JOIN eventoMusical m ON e.idEvento = m.idMusical
            LEFT JOIN taller ta ON e.idEvento = ta.idTaller
            LEFT JOIN premiacion p ON e.idEvento = p.idPremiacion
            LEFT JOIN presEditorial pe ON e.idEvento = pe.idPresEditorial
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

        // Ejecutar el SP
        await connection.query(
            `CALL crearEvento(?,?,?,?,?,?,?,?,?, @msg);`,
            [
                titulo, sinopsis, reqRegistro ? 1 : 0, participaPublico ? 1 : 0,
                descripcion, infoAd, imagen, idSede, idTipoEvento
            ]
        );

        // Obtener el mensaje del SP
        const [[msgResult]] = await connection.query("SELECT @msg AS mensaje");

        // Obtener el ID recién creado (si tu SP hace INSERT)
        const [[lastId]] = await connection.query("SELECT LAST_INSERT_ID() AS idEvento");

        res.json({ mensaje: msgResult.mensaje, idEvento: lastId.idEvento });

    } catch (err) {
        console.error("Error en crear evento:", err); // log detallado
        res.status(500).json({ error: err.message });
    }
};

exports.crearPres = async (req, res) => {
    try {
        const connection = await db;
        const {idPres} = req.body;

        const [result] = await connection.query(
            `CALL crearPresEditorial(?, @msg); SELECT @msg;`,
            [idPres]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearMusical = async (req, res) => {
    try {
        const connection = await db;
        const {idMusical, setlist} = req.body;

        const [result] = await connection.query(
            `CALL crearEventoMusical(?,?, @msg); SELECT @msg;`,
            [idMusical, setlist]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearTaller = async (req, res) => {
    try {
        const connection = await db;
        const {idTaller, materiales, edades} = req.body;

        const [result] = await connection.query(
            `CALL crearTaller(?,?,?, @msg); SELECT @msg;`,
            [idTaller, materiales, edades]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.crearPremiacion= async (req, res) => {
    try {
        const connection = await db;
        const {idPrem, premio} = req.body;

        const [result] = await connection.query(
            `CALL crearPremiacion(?,?,@msg); SELECT @msg;`,
            [idPrem, premio]
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

        // Convierte booleans a 0/1
        const registro = reqRegistro ? 1 : 0;
        const publico = participaPublico ? 1 : 0;

        // Llamar al stored procedure
        await connection.query(
            `CALL modificarEvento(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @msg);`,
            [idEvento, titulo, sinopsis, registro, publico, descripcion, infoAd, imagen, idSede, idTipoEvento]
        );

        // Leer variable de salida
        const [[resultado]] = await connection.query("SELECT @msg AS mensaje");

        console.log(`Evento ${idEvento} modificado:`, resultado.mensaje);

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        console.error("Error en modificar evento:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.modificarMusical = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const {setlist} = req.body;

        const [result] = await connection.query(
            `CALL modificarEventoMusical(?,?, @msg); SELECT @msg;`,
            [idEvento,setlist]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.modificarTaller = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const {materiales, edades} = req.body;

        const [result] = await connection.query(
            `CALL modificarTaller(?,?,?, @msg); SELECT @msg;`,
            [idEvento,materiales, edades]
        );

        const mensaje = result[1][0]['@msg'];
        res.json({ mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.modificarPrem = async (req, res) => {
    try {
        const connection = await db;
        const { idEvento } = req.params;

        const {premio} = req.body;

        const [result] = await connection.query(
            `CALL modificarPremiacion(?,?, @msg); SELECT @msg;`,
            [idEvento,premio]
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

        await connection.query("CALL eliminarEvento(?, @mensaje)", [idEvento]);

        const [[resultado]] =
            await connection.query("SELECT @mensaje AS mensaje");

        res.json({ mensaje: resultado.mensaje });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};