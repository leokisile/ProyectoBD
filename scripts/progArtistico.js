// progArtistico.js

const filaFichas = document.getElementById("filaFichas");
const categoriaFiltro = document.getElementById("categoriaFiltro");
const fechaFiltro = document.getElementById("fechaFiltro");

let categorias = [];
let eventos = [];

// =====================
// Inicialización
// =====================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarCategorias();
    await cargarEventos(); // Carga inicial sin filtros
    await cargarDias();    // Llenar select de fechas después de tener eventos
});

// =====================
// Cargar categorías
// =====================
async function cargarCategorias() {
    try {
        const res = await fetch("http://localhost:3000/api/consultas/ProgCultural");
        categorias = await res.json();

        categoriaFiltro.innerHTML = '<option value="">Todas las Categorías</option>';
        categorias.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.idTipoEvento;
            option.textContent = cat.tipoEvento;
            categoriaFiltro.appendChild(option);
        });

    } catch (err) {
        console.error("Error cargando categorías:", err);
    }
}

// =====================
// Cargar eventos (filtrados por categoría y fecha)
// =====================
async function cargarEventos() {
    try {
        let idTipoEvento = categoriaFiltro.value || 0; // 0 indica todos los predeterminados
        let fecha = fechaFiltro.value || null;

        let url = `http://localhost:3000/api/consultas/EventoCategoria/${idTipoEvento}`;
        if(fecha) url += `/${fecha}`;

        const res = await fetch(url);
        const data = await res.json();

        // Verificar si se recibió un array
        eventos = Array.isArray(data) ? data : (data[0] || []);

        filaFichas.innerHTML = "";

        if(eventos.length === 0){
            filaFichas.innerHTML = "<p>No hay eventos para estos filtros.</p>";
            return;
        }

        eventos.forEach(ev => {
            const ficha = document.createElement("div");
            ficha.className = "fichaEvento";

            ficha.innerHTML = `
                <img src="../resources/eventoBanner.jpeg" alt="Evento img">
                <h3>${ev.titulo}</h3>
                <p>Presenta: ${ev.presentadores || "-"}</p>
                <p>Categoría: ${categoriaFiltro.options[categoriaFiltro.selectedIndex]?.text || "-"}</p>
                <p>Sede: ${ev.sede || "-"}</p>
                <p>${ev.descripcion ? ev.descripcion.substring(0, 80) + "..." : "-"}</p>
                <p>${ev.fechaInicio ? new Date(ev.fechaInicio).toLocaleString("es-MX") : "-"}</p>
            `;

            ficha.addEventListener("click", () => {
                window.location.href = `evento.html?id=${ev.idEvento}`;
            });

            filaFichas.appendChild(ficha);
        });

    } catch (err) {
        console.error("Error cargando eventos:", err);
        filaFichas.innerHTML = "<p>Error al cargar eventos.</p>";
    }
}

// =====================
// Cargar días únicos para el filtro
// =====================
async function cargarDias() {
    try {
        // Extraer todas las fechas de los eventos ya cargados
        const fechasUnicas = new Set();
        eventos.forEach(ev => {
            if(ev.fechaInicio){
                const fechaObj = new Date(ev.fechaInicio);
                if(!isNaN(fechaObj)) {
                    fechasUnicas.add(fechaObj.toISOString().split("T")[0]);
                }
            }
        });

        // Llenar select
        fechaFiltro.innerHTML = '<option value="">Todas las Fechas</option>';
        Array.from(fechasUnicas).sort().forEach(fechaStr => {
            const option = document.createElement("option");
            option.value = fechaStr;
            option.textContent = fechaStr;
            fechaFiltro.appendChild(option);
        });

    } catch (err) {
        console.error("Error cargando días:", err);
    }
}

// =====================
// Eventos de filtro
// =====================
categoriaFiltro.addEventListener("change", async () => {
    await cargarEventos();
    await cargarDias(); // actualizar fechas según categoría seleccionada
});

fechaFiltro.addEventListener("change", cargarEventos);
