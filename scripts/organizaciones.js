// ======= CONFIG =======
const API = "http://localhost:3000/api/organizaciones";

let usuarios = [];
let paginaActual = 1;
const porPagina = 5;

let editandoId = null; // <- Para saber si es edición o registro nuevo

// ======= ELEMENTOS =======
const tablaBody = document.getElementById("tblOrganizaciones");
const searchInput = document.getElementById("search");
const filtroPais = document.getElementById("filterPais");
const filtroEstado = document.getElementById("filterEstado");

// Campos del modal
const inputNombre = document.getElementById("nombre");
const inputTel = document.getElementById("tel");
const inputCorreo = document.getElementById("correo");
const inputPagina = document.getElementById("pagina");
const inputPais = document.getElementById("pais");
const inputEstado = document.getElementById("estado");
const inputCiudad = document.getElementById("ciudad");
const modalTitle = document.getElementById("modalTitle");

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

// ======= CARGAR DATOS =======
async function cargarUsuarios() {
    try {
        const res = await fetch(API);
        usuarios = await res.json();

        generarMapaPaisEstado();
        llenarFiltroPais();
        actualizarFiltroEstado();
        renderTabla();
    } catch (e) {
        toast("Error al cargar datos", "error");
    }
}

// ======= RENDER TABLA =======
function renderTabla() {
    const busqueda = searchInput.value.toLowerCase();
    const paisSel = filtroPais.value;
    const estadoSel = filtroEstado.value;

    let filtrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(busqueda) ||
        u.correo.toLowerCase().includes(busqueda)
    );

    if (paisSel) filtrados = filtrados.filter(u => u.pais === paisSel);
    if (estadoSel) filtrados = filtrados.filter(u => u.estado === estadoSel);

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
                <td>
                    <button class="btn-edit" onclick="editar(${u.idOrganizacion})">✏️</button>
                    <button class="btn-delete" onclick="eliminar(${u.idOrganizacion})">🗑️</button>
                </td>
            </tr>
        `;
    });

    renderPaginacion(filtrados.length);
}

// ===========================================================
// =============== AGREGAR / EDITAR / ELIMINAR ===============
// ===========================================================

// 👉 ABRIR MODAL PARA NUEVO
function openModalNuevo() {
    editandoId = null;
    modalTitle.textContent = "Nueva Organización";
    limpiarModal();
    document.getElementById("modal").style.display = "flex";
}

// 👉 ABRIR MODAL PARA EDITAR
function editar(id) {
    const u = usuarios.find(x => x.idOrganizacion === id);

    if (!u) return;

    editandoId = id;
    modalTitle.textContent = "Editar Organización";

    inputNombre.value = u.nombre;
    inputTel.value = u.tel;
    inputCorreo.value = u.correo;
    inputPagina.value = u.pagina || "";
    inputPais.value = u.pais;
    inputEstado.value = u.estado;
    inputCiudad.value = u.ciudad;

    document.getElementById("modal").style.display = "flex";
}

// 👉 LIMPIAR CAMPOS
function limpiarModal() {
    inputNombre.value = "";
    inputTel.value = "";
    inputCorreo.value = "";
    inputPagina.value = "";
    inputPais.value = "";
    inputEstado.value = "";
    inputCiudad.value = "";
}
// Funciones de apertura/cierre del modal (poner en orgScript.js)
function openModalNuevo() {
    // Si usas la variable editandoId desde el script principal, la reseteamos
    if (typeof editandoId !== "undefined") editandoId = null;

    const modal = document.getElementById("modal");
    const title = document.getElementById("modalTitle");
    if (title) title.textContent = "Nueva Organización";

    // Limpiar inputs si existe la función
    if (typeof limpiarModal === "function") limpiarModal();

    // Mostrar modal (usamos flex porque en el CSS lo centramos con flex)
    if (modal) modal.style.display = "flex";
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.style.display = "none";
}

// 👉 GUARDAR (crear o modificar)
async function save() {
    const data = {
        nombre: inputNombre.value.trim(),
        tel: inputTel.value.trim(),
        correo: inputCorreo.value.trim(),
        pagina: inputPagina.value.trim(),
        pais: inputPais.value.trim(),
        estado: inputEstado.value.trim(),
        ciudad: inputCiudad.value.trim()
    };

    if (!data.nombre) return toast("El nombre es obligatorio", "error");
    if (!data.correo.includes("@")) return toast("Correo inválido", "error");

    try {
        let res;

        if (editandoId === null) {
            // ---- CREAR ----
            res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            // ---- MODIFICAR ----
            res = await fetch(`${API}/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        const msg = await res.json();
        toast(msg.mensaje || "Operación completada");

        closeModal();
        cargarUsuarios();
    } catch (e) {
        toast("Error al guardar", "error");
    }
}

// 👉 ELIMINAR
async function eliminar(id) {
    if (!confirm("¿Seguro que deseas eliminar esta organización?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const msg = await res.json();
        toast(msg.mensaje);
        cargarUsuarios();
    } catch (e) {
        toast("Error al eliminar", "error");
    }
}

// ===========================================================
// ===================== FILTROS DINÁMICOS ===================
// ===========================================================

let mapaPaisEstados = {};

function generarMapaPaisEstado() {
    mapaPaisEstados = {};
    usuarios.forEach(u => {
        if (!mapaPaisEstados[u.pais]) mapaPaisEstados[u.pais] = new Set();
        mapaPaisEstados[u.pais].add(u.estado);
    });
}

function llenarFiltroPais() {
    filtroPais.innerHTML = '<option value="">Todos</option>';
    Object.keys(mapaPaisEstados).forEach(pais => {
        filtroPais.innerHTML += `<option value="${pais}">${pais}</option>`;
    });
}

function actualizarFiltroEstado() {
    const paisSel = filtroPais.value;
    filtroEstado.innerHTML = '<option value="">Todos</option>';
    if (!paisSel) return;
    mapaPaisEstados[paisSel].forEach(estado => {
        filtroEstado.innerHTML += `<option value="${estado}">${estado}</option>`;
    });
}

// ===========================================================
// ======================= PAGINACIÓN =========================
// ===========================================================

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
searchInput.addEventListener("input", () => { paginaActual = 1; renderTabla(); });

filtroPais.addEventListener("change", () => {
    actualizarFiltroEstado();
    paginaActual = 1;
    renderTabla();
});

filtroEstado.addEventListener("change", () => {
    paginaActual = 1;
    renderTabla();
});

// ======= INICIO =======
cargarUsuarios();
