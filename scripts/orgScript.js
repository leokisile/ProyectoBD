// ======= CONFIG =======
const API = "http://localhost:3000/api/organizaciones";

let usuarios = [];
let paginaActual = 1;
const porPagina = 5;

// ======= ELEMENTOS =======
const tablaBody = document.getElementById("tblOrganizaciones");
const searchInput = document.getElementById("search");
const filtroPais = document.getElementById("filterPais");
const filtroEstado = document.getElementById("filterEstado");

// ======= TOAST =======
function toast(msj, tipo = "success") {
    const t = document.createElement("div");
    t.className = "toast " + tipo;
    t.textContent = msj;

    Object.assign(t.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 15px",
        background: tipo === "success" ? "#4CAF50" : "#e74c3c",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        zIndex: 9999,
        opacity: 0,
        transition: "opacity .3s"
    });

    document.body.appendChild(t);

    setTimeout(() => t.style.opacity = 1, 10);
    setTimeout(() => t.style.opacity = 0, 2500);
    setTimeout(() => t.remove(), 3000);
}

// ======= CARGAR USUARIOS =======
async function cargarUsuarios() {
    try {
        const res = await fetch(API);
        usuarios = await res.json();

        //llenarFiltros();
        renderTabla();
    } catch (e) {
        toast("Error al cargar usuarios", "error");
        toast(e.message, "error");
    }
}

// ======= RENDERIZAR TABLA =======
function renderTabla() {
    const busqueda = searchInput.value.toLowerCase();
    const paisSel = filtroPais.value;
    const estadoSel = filtroEstado.value;

    let filtrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda) ||
        u.correo.toLowerCase().includes(busqueda)
    );

    if (paisSel !== "") {
        filtrados = filtrados.filter(u => u.pais === paisSel);
    }

    if (estadoSel !== "") {
        filtrados = filtrados.filter(u => u.estado === estadoSel);
    }

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    tablaBody.innerHTML = "";

    paginados.forEach(u => {
        tablaBody.innerHTML += `
            <tr>
                <td>${u.idOrganizacion}</td>
                <td>${u.nombre}</td>
                <td>${u.tel}</td>
                <td>${u.correo}</td>
                <td>${u.pais}</td>
                <td>${u.estado}</td>
                <td>${u.ciudad}</td>
            </tr>
        `;
    });

    renderPaginacion(filtrados.length);
}

// ======= FILTROS DINÁMICOS =======
function llenarFiltros() {
    const paises = [...new Set(usuarios.map(u => u.pais))];
    const estados = [...new Set(usuarios.map(u => u.estado))];

    paises.forEach(p => {
        filtroPais.innerHTML += `<option value="${p}">${p}</option>`;
    });

    estados.forEach(e => {
        filtroEstado.innerHTML += `<option value="${e}">${e}</option>`;
    });
}

// ======= PAGINACIÓN =======
function renderPaginacion(total) {
    const pagTotal = Math.ceil(total / porPagina);

    document.getElementById("paginacion").innerHTML = `
        <button onclick="cambiarPagina(-1)" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${paginaActual} de ${pagTotal}</span>
        <button onclick="cambiarPagina(1)" ${paginaActual === pagTotal ? "disabled" : ""}>Siguiente</button>
    `;
}

function cambiarPagina(delta) {
    paginaActual += delta;
    renderTabla();
}

// ======= LISTENERS =======
searchInput.addEventListener("input", () => {
    paginaActual = 1;
    renderTabla();
});

filtroPais.addEventListener("change", () => {
    paginaActual = 1;
    renderTabla();
});

filtroEstado.addEventListener("change", () => {
    paginaActual = 1;
    renderTabla();
});

// ======= INICIO =======
cargarUsuarios();
