// progEditorial.js

const gridEventos = document.querySelector(".gridEventos");
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
        const res = await fetch("http://localhost:3000/api/consultas/ProgEditorial");
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
// Cargar días
// =====================
async function cargarDias() {
    try {
        const res = await fetch("http://localhost:3000/api/consultas/Dias");
        const fechas = await res.json();

        fechaFiltro.innerHTML = '<option value="">Todas las Fechas</option>';

        const fechasFormateadas = fechas
            .map(item => item.fechaInicio.split("T")[0])
            .sort();

        fechasFormateadas.forEach(fecha => {
            const option = document.createElement("option");
            option.value = fecha;
            option.textContent = fecha;
            fechaFiltro.appendChild(option);
        });

    } catch (err) {
        console.error("Error cargando fechas:", err);
    }
}

// =====================
// Cargar eventos
// =====================
async function cargarEventos() {
    try {
        // Si no hay categoría seleccionada, usar array de IDs predeterminados
        let categoriaSeleccionada = categoriaFiltro.value;
        let idTipoEvento = categoriaSeleccionada || "predeterminados"; 
        let fecha = fechaFiltro.value || null;

        let url;
        if (idTipoEvento === "predeterminados") {
            // Endpoint que devuelve todos los eventos de categorías predeterminadas
            //(7,8,10,11,12,13,18,19,21,22,28)
            url = `http://localhost:3000/api/consultas/EventoCategoria/-1`; // 0 indica todas las categorías predeterminadas
        } else {
            url = `http://localhost:3000/api/consultas/EventoCategoria/${idTipoEvento}`;
        }

        if (fecha) url += `/${fecha}`;

        const res = await fetch(url);
        const data = await res.json();

        eventos = Array.isArray(data) ? data : (data[0] || []);

        filaFichas.innerHTML = "";

        if (eventos.length === 0) {
            filaFichas.innerHTML = "<p>No hay eventos para estos filtros.</p>";
            return;
        }

        eventos.forEach(ev => {
            const ficha = document.createElement("div");
            ficha.className = "fichaEvento";

            let fechasTexto = "-";
            if (ev.fechasInicio) {
                fechasTexto = ev.fechasInicio
                    .split(", ")
                    .map(f => new Date(f).toLocaleDateString("es-MX"))
                    .join("<br>");
            }

            ficha.innerHTML = `
                <img src="../resources/eventoBanner.jpeg" alt="Evento img">
                <h3>${ev.titulo}</h3>
                <p><strong>Presenta:</strong> ${ev.presentadores || "-"}</p>
                <p><strong>Categoría:</strong> ${
                    categoriaFiltro.options[categoriaFiltro.selectedIndex]?.text || "-"
                }</p>
                <p><strong>Sede:</strong> ${ev.sede || "-"}</p>
                <p>${ev.descripcion ? ev.descripcion.substring(0, 80) + "..." : "-"}</p>
                <p><strong>Fechas:</strong><br>${fechasTexto}</p>
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
// Eventos de filtro
// =====================
categoriaFiltro.addEventListener("change", async () => {
    await cargarEventos();
    await cargarDias();
});

fechaFiltro.addEventListener("change", cargarEventos);
