// ===============================
// CONFIG
// ===============================
const API = "http://localhost:3000/api/eventos";
let eventos = [];
let paginaActual = 1;
const porPagina = 5;
let editId = null; // Para edición

// ===============================
// ELEMENTOS DOM
// ===============================
const tablaBody = document.getElementById("tblEventos");
const searchInput = document.getElementById("search");
const sedeFilter = document.getElementById("filterSede");
const tipoFilter = document.getElementById("filterTipo");
const modalTitle = document.getElementById("modalTitle");

// Campos modal
const inputTitulo = document.getElementById("titulo");
const inputSinopsis = document.getElementById("sinopsis");
const inputDescripcion = document.getElementById("descripcion");
const inputInfoAd = document.getElementById("infoAd");
const inputImagen = document.getElementById("imagen");
const checkRegistro = document.getElementById("requiereRegistro");
const checkPublico = document.getElementById("participaPublico");
const sedeModal = document.getElementById("sedeSelectModal");
const tipoEventoModal = document.getElementById("tipoEventoSelectModal");
const horariosContainer = document.getElementById("horariosContainer");

// ===============================
// TOAST
// ===============================
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

// ===============================
// CARGAR DATOS INICIALES
// ===============================
async function init() {
    await cargarEventos();
    llenarFiltros();
}

// ===============================
// CARGAR EVENTOS
// ===============================
async function cargarEventos() {
    try {
        const res = await fetch(API);
        eventos = await res.json();
        renderTabla();
    } catch (e) {
        console.error(e);
        toast("Error al cargar eventos", "error");
    }
}

// ===============================
// RENDER TABLA CON FILTROS Y PAGINACIÓN
// ===============================
function renderTabla() {
    const busqueda = searchInput.value.toLowerCase();
    const filtroS = sedeFilter.value;
    const filtroT = tipoFilter.value;

    let filtrados = eventos.filter(e =>
        e.titulo.toLowerCase().includes(busqueda) &&
        (filtroS === "" || e.idSede == filtroS) &&
        (filtroT === "" || e.idTipoEvento == filtroT)
    );

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    tablaBody.innerHTML = "";

    paginados.forEach(e => {
        tablaBody.innerHTML += `
            <tr>
                <td>${e.idEvento}</td>
                <td>${e.titulo}</td>
                <td>${e.sede || ""}</td>
                <td>${e.tipoEvento || ""}</td>
                <td>${e.reqRegistro ? "Sí" : "No"}</td>
                <td>${e.participaPublico ? "Sí" : "No"}</td>
                <td>
                    <button onclick="editar(${e.idEvento})">✏️</button>
                    <button onclick="eliminar(${e.idEvento})">🗑️</button>
                </td>
            </tr>
        `;
    });

    renderPaginacion(filtrados.length);
}

// ===============================
// PAGINACIÓN
// ===============================
function renderPaginacion(total) {
    const cont = document.getElementById("paginacion");
    cont.innerHTML = "";

    const totalPaginas = Math.ceil(total / porPagina);

    cont.innerHTML += `<button onclick="cambiarPagina(-1)" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>`;
    cont.innerHTML += `<span>Página ${paginaActual} de ${totalPaginas}</span>`;
    cont.innerHTML += `<button onclick="cambiarPagina(1)" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente</button>`;
}

function cambiarPagina(delta) {
    paginaActual += delta;
    if (paginaActual < 1) paginaActual = 1;
    renderTabla();
}

// ===============================
// FILTROS
// ===============================
// ===============================
// LLENAR SELECTS
// ===============================
async function llenarFiltros() {
    try {
        // ---- SEDES ----
        const resSedes = await fetch("http://localhost:3000/api/sedes");
        const sedes = await resSedes.json();

        // Limpiar selects
        sedeFilter.innerHTML = `<option value="">Sedes</option>`;
        sedeModal.innerHTML = `<option value="">Selecciona una sede</option>`;

        sedes.forEach(s => {
            const optionFilter = document.createElement("option");
            optionFilter.value = s.idSede;
            optionFilter.textContent = s.nombre;
            sedeFilter.appendChild(optionFilter);

            const optionModal = document.createElement("option");
            optionModal.value = s.idSede;
            optionModal.textContent = s.nombre;
            sedeModal.appendChild(optionModal);
        });

        // ---- TIPOS DE EVENTO ----
        const resTipos = await fetch("http://localhost:3000/api/categorias");
        const tipos = await resTipos.json();

        tipoFilter.innerHTML = `<option value="">Categorias</option>`;
        tipoEventoModal.innerHTML = `<option value="">Selecciona un tipo de evento</option>`;

        tipos.forEach(t => {
            const optionFilter = document.createElement("option");
            optionFilter.value = t.idTipoEvento;
            optionFilter.textContent = t.tipoEvento;
            tipoFilter.appendChild(optionFilter);

            const optionModal = document.createElement("option");
            optionModal.value = t.idTipoEvento;
            optionModal.textContent = t.tipoEvento;
            tipoEventoModal.appendChild(optionModal);
        });

    } catch (err) {
        console.error(err);
        toast("Error cargando sedes o tipos", "error");
    }
}


// ===============================
// MODAL
// ===============================
function openModalNuevo() {
    editId = null;
    modalTitle.textContent = "Nuevo Evento";
    limpiarModal();
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function limpiarModal() {
    inputTitulo.value = "";
    inputSinopsis.value = "";
    inputDescripcion.value = "";
    inputInfoAd.value = "";
    inputImagen.value = "";
    checkRegistro.checked = false;
    checkPublico.checked = false;
    sedeModal.value = "";
    tipoEventoModal.value = "";
    horariosContainer.innerHTML = "";
    mostrarSubcampos();
}

// ===============================
// HORARIOS
// ===============================
function agregarHorario() {
    const div = document.createElement("div");
    div.className = "horario-item";
    div.innerHTML = `
        <input type="datetime-local" class="hora-inicio">
        <input type="datetime-local" class="hora-fin">
        <button type="button" onclick="this.parentNode.remove()">✖</button>
    `;
    horariosContainer.appendChild(div);
}

// ===============================
// SUBTIPOS
// ===============================
function mostrarSubcampos() {
    const tipo = tipoEventoModal.value;
    document.querySelectorAll(".subtipo").forEach(div => div.style.display = "none");

    if (tipo == 1) document.getElementById("subEditorial").style.display = "block";
    if (tipo == 2) document.getElementById("subMusical").style.display = "block";
    if (tipo == 3) document.getElementById("subTaller").style.display = "block";
    if (tipo == 4) document.getElementById("subPremiacion").style.display = "block";
}

// ===============================
// GUARDAR EVENTO
// ===============================
async function save() {
    const body = {
        titulo: inputTitulo.value,
        sinopsis: inputSinopsis.value,
        descripcion: inputDescripcion.value,
        infoAd: inputInfoAd.value,
        imagen: inputImagen.value,
        reqRegistro: checkRegistro.checked,
        participaPublico: checkPublico.checked,
        idSede: sedeModal.value,
        idTipoEvento: tipoEventoModal.value,
        horarios: []
    };

    document.querySelectorAll(".horario-item").forEach(h => {
        body.horarios.push({
            inicio: h.querySelector(".hora-inicio").value,
            fin: h.querySelector(".hora-fin").value
        });
    });

    try {
        let res;
        if (editId) {
            res = await fetch(`${API}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        } else {
            res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        }

        const msg = await res.json();
        toast(msg.msg || "Operación exitosa");
        closeModal();
        cargarEventos();
        editId = null;
    } catch (err) {
        console.error(err);
        toast("Error al guardar", "error");
    }
}

// ===============================
// EDITAR EVENTO
// ===============================
async function editar(id) {
    editId = id;
    const res = await fetch(`${API}/${id}`);
    const ev = await res.json();

    document.getElementById("modal").style.display = "flex";
    modalTitle.textContent = "Editar Evento";

    inputTitulo.value = ev.titulo;
    inputSinopsis.value = ev.sinopsis;
    inputDescripcion.value = ev.descripcion || "";
    inputInfoAd.value = ev.infoAd || "";
    inputImagen.value = ev.imagen || "";
    checkRegistro.checked = ev.reqRegistro;
    checkPublico.checked = ev.participaPublico;
    sedeModal.value = ev.idSede;
    tipoEventoModal.value = ev.idTipoEvento;
    mostrarSubcampos();

    horariosContainer.innerHTML = "";
    if (ev.horarios && Array.isArray(ev.horarios)) {
        ev.horarios.forEach(h => {
            const div = document.createElement("div");
            div.className = "horario-item";
            div.innerHTML = `
                <input type="datetime-local" class="hora-inicio" value="${h.inicio}">
                <input type="datetime-local" class="hora-fin" value="${h.fin}">
                <button type="button" onclick="this.parentNode.remove()">✖</button>
            `;
            horariosContainer.appendChild(div);
        });
    }
}

// ===============================
// ELIMINAR EVENTO
// ===============================
async function eliminar(id) {
    if (!confirm("¿Eliminar evento?")) return;

    try {
        const res = await fetch(`${API}/${id}`, { method: "DELETE" });
        const msg = await res.json();
        toast(msg.msg || "Evento eliminado");
        cargarEventos();
    } catch (e) {
        toast("Error al eliminar", "error");
    }
}

// ===============================
// LISTENERS FILTROS Y BUSQUEDA
// ===============================
searchInput.addEventListener("input", () => { paginaActual = 1; renderTabla(); });
sedeFilter.addEventListener("change", () => { paginaActual = 1; renderTabla(); });
tipoFilter.addEventListener("change", () => { paginaActual = 1; renderTabla(); });

// ===============================
// INICIO
// ===============================
init();
