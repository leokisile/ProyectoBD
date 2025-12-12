// ======= CONFIG =======
const API = "http://localhost:3000/api/roles";

let roles = [];
let paginaActual = 1;
const porPagina = 5;

let editandoId = null; // <- Para saber si es edición o registro nuevo

// ======= ELEMENTOS =======
const tablaBody = document.getElementById("tblRoles");
const searchInput = document.getElementById("search");

// Campos del modal
const modalTitle = document.getElementById("modalTitle");
const inputNombre = document.getElementById("rol");

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
async function cargarRoles() {
    try {
        const res = await fetch(API);
        roles = await res.json();

        renderTabla();
    } catch (e) {
        toast("Error al cargar datos", "error");
    }
}

// ======= RENDER TABLA =======
function renderTabla() {
    const busqueda = searchInput.value.toLowerCase();

    let filtrados = roles.filter(r =>
        r.rol.toLowerCase().includes(busqueda)
    );

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    tablaBody.innerHTML = "";

    paginados.forEach(r => {
        tablaBody.innerHTML += `
            <tr>
                <td>${r.idRol}</td>
                <td>${r.rol}</td>
                <td>
                    <button class="btn-edit" onclick="editar(${r.idRol})">✏️</button>
                    <button class="btn-delete" onclick="eliminar(${r.idRol})">🗑️</button>
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
    modalTitle.textContent = "Nuevo Rol";
    limpiarModal();
    document.getElementById("modal").style.display = "flex";
}

// 👉 ABRIR MODAL PARA EDITAR
function editar(id) {
    const u = roles.find(x => x.idRol === id);

    if (!u) return;

    editandoId = id;
    modalTitle.textContent = "Editar Rol";

    inputNombre.value = u.rol;

    document.getElementById("modal").style.display = "flex";
}

// 👉 LIMPIAR CAMPOS
function limpiarModal() {
    inputNombre.value = "";
}
// Funciones de apertura/cierre del modal 
function openModalNuevo() {
    // Si usas la variable editandoId desde el script principal, la reseteamos
    if (typeof editandoId !== "undefined") editandoId = null;

    const modal = document.getElementById("modal");
    const title = document.getElementById("modalTitle");
    if (title) title.textContent = "Nuevo Rol";

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
        rol: inputNombre.value.trim(),
    };

    if (!data.rol) return toast("El nombre del rol es obligatorio", "error");

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
        const mensaje = (msg.mensaje || "Operación completada");

        // Si el mensaje contiene "error" → usar toast de error
        if (mensaje.toLowerCase().includes("rror")) {
            toast(mensaje, "error");
        } else {
            toast(mensaje, "success");
        }

        closeModal();
        cargarRoles();
    } catch (e) {
        //toast("Error al guardar", "error");
    }
}

// 👉 ELIMINAR
async function eliminar(id) {
    if (!confirm("¿Seguro que deseas eliminar este rol?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const msg = await res.json();
        toast(msg.mensaje);
        cargarRoles();
    } catch (e) {
        toast("Error al eliminar", "error");
    }
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

// ======= INICIO =======
cargarRoles();
