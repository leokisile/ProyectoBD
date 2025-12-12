// ================== CONFIG ==================
const API_SEDES = "http://localhost:3000/api/sedes";
const API_ESPACIOS = "http://localhost:3000/api/espacios";

let sedes = [];
let espacios = [];
let paginaActual = 1;
const porPagina = 5;

let editandoId = null;

// ================== ELEMENTOS ==================
const tablaBody = document.getElementById("tblOrganizaciones");
const searchInput = document.getElementById("search");
const tipoEspacioSelect = document.getElementById("tipoEspacio");
const filterTipoEspacio = document.getElementById("filterTipoEspacio");

const inputNombre = document.getElementById("nombre");
const inputUbicacion = document.getElementById("ubicacion");
const modalTitle = document.getElementById("modalTitle");

// ================== TOAST ==================
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

// ================== CARGAR ESPACIOS PARA EL SELECT ==================
async function cargarTiposEspacio() {
    const res = await fetch(API_ESPACIOS);
    espacios = await res.json();

    tipoEspacioSelect.innerHTML = `<option value="">Escoja un tipo de Espacio</option>`;
    filterTipoEspacio.innerHTML = `<option value="">-- Tipo de Espacio --</option>`;

    espacios.forEach(e => {
        tipoEspacioSelect.innerHTML += `
            <option value="${e.idEspacio}">${e.tipoEspacio}</option>
        `;

        filterTipoEspacio.innerHTML += `
            <option value="${e.idEspacio}">${e.tipoEspacio}</option>
        `;
    });
}
filterTipoEspacio.addEventListener("change", renderTabla);

// ================== CARGAR SEDES ==================
async function cargarSedes() {
    try {
        const res = await fetch(API_SEDES);
        sedes = await res.json();
        renderTabla();
    } catch (e) {
        toast("Error al cargar sedes", "error");
    }
}

// ================== RENDER TABLA ==================
function renderTabla() {
    const busqueda = searchInput.value.toLowerCase();
    const tipoEspacioSel = filterTipoEspacio.value; // ID seleccionado del <select>

    let filtrados = sedes.filter(s =>
        s.nombre.toLowerCase().includes(busqueda)
    );

    // Si se seleccionó un tipo de espacio
    if (tipoEspacioSel) {
        filtrados = filtrados.filter(s => 
            s.idEspacio == tipoEspacioSel   // == para comparar string vs number
        );
    }

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    tablaBody.innerHTML = "";

    paginados.forEach(s => {
        const espacio = espacios.find(e => e.idEspacio === s.idEspacio);

        tablaBody.innerHTML += `
            <tr>
                <td>${s.idSede}</td>
                <td>${s.nombre}</td>
                <td>${s.ubicacion}</td>
                <td>${espacio ? espacio.tipoEspacio : "N/A"}</td>
                <td>
                    <button class="btn-edit" onclick="editar(${s.idSede})">✏️</button>
                    <button class="btn-delete" onclick="eliminar(${s.idSede})">🗑️</button>
                </td>
            </tr>
        `;
    });

    renderPaginacion(filtrados.length);
}


// ================== MODAL ==================
function openModalNuevo() {
    editandoId = null;
    modalTitle.textContent = "Nueva Sede";
    limpiarModal();
    document.getElementById("modal").style.display = "flex";
}

function editar(id) {
    const s = sedes.find(x => x.idSede === id);
    if (!s) return;

    editandoId = id;
    modalTitle.textContent = "Editar Sede";

    inputNombre.value = s.nombre;
    inputUbicacion.value = s.ubicacion;
    tipoEspacioSelect.value = s.idEspacio;

    document.getElementById("modal").style.display = "flex";
}

function limpiarModal() {
    inputNombre.value = "";
    inputUbicacion.value = "";
    tipoEspacioSelect.value = "";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// ================== GUARDAR ==================
async function save() {
    const data = {
        nombre: inputNombre.value.trim(),
        ubicacion: inputUbicacion.value.trim(),
        idEspacio: tipoEspacioSelect.value
    };

    if (!data.nombre) return toast("El nombre es obligatorio", "error");
    if (!data.ubicacion) return toast("La ubicación es obligatoria", "error");
    if (!data.idEspacio) return toast("Debe escoger un tipo de espacio", "error");

    try {
        let res;

        if (editandoId === null) {
            res = await fetch(API_SEDES, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${API_SEDES}/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        const msg = await res.json();
        const mensaje = msg.mensaje || "Operación completada";

        if (mensaje.toLowerCase().includes("rror")) {
            toast(mensaje, "error");
        } else {
            toast(mensaje, "success");
        }

        closeModal();
        cargarSedes();

    } catch (e) {
        toast("Error al guardar", "error");
    }
}

// ================== ELIMINAR ==================
async function eliminar(id) {
    if (!confirm("¿Seguro que deseas eliminar esta sede?")) return;

    try {
        const res = await fetch(`${API_SEDES}/${id}`, { method: "DELETE" });
        const msg = await res.json();
        toast(msg.mensaje);
        cargarSedes();
    } catch (e) {
        toast("Error al eliminar", "error");
    }
}

// ================== PAGINACIÓN ==================
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

// ================== EVENTOS ==================
searchInput.addEventListener("input", () => { paginaActual = 1; renderTabla(); });

// ================== INICIO ==================
cargarTiposEspacio();
cargarSedes();
