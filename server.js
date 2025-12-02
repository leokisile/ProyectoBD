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

    app.listen(3000, () => console.log("🚀 Servidor funcionando en puerto 3000"));
});
