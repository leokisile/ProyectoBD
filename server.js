const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());


app.use(express.json());

// Inicializar BD antes de usar rutas
const db = require("./db");

db.then(() => {
    // importar rutas aquí
    const organizacionesRoutes = require("./routes/organizacionesRoutes");
    app.use("/api/organizaciones", organizacionesRoutes);

    const espaciosRoutes = require("./routes/espaciosRoutes");
    app.use("/api/espacios", espaciosRoutes);

    const sedesRoutes = require("./routes/sedesRoutes");
    app.use("/api/sedes", sedesRoutes);

    const redesRoutes = require("./routes/redesRoutes");
    app.use("/api/redes", redesRoutes);

    const rolesRoutes = require("./routes/rolesRoutes");
    app.use("/api/roles", rolesRoutes);

    const categoriasRoutes = require("./routes/categoriasRoutes.js");
    app.use("/api/categorias", categoriasRoutes);

    const personasRoutes = require("./routes/personasRoutes.js");
    app.use("/api/personas", personasRoutes);

    const redespersonasRoutes = require("./routes/redespersonasRoutes.js");
    app.use("/api/redespersonas", redespersonasRoutes);

    const eventosRoutes = require("./routes/eventosRoutes.js");
    app.use("/api/eventos", eventosRoutes);

    app.listen(3000, () => console.log("🚀 Servidor funcionando en puerto 3000"));
});
