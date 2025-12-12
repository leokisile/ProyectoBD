// ======= CONFIG =======
const API_PERSONAS = "http://localhost:3000/api/personas";
const API_REDES = "http://localhost:3000/api/redes";
const API_RP = "http://localhost:3000/api/redespersonas";

let personas = [];
let redes = [];
let redesDePersona = [];

let paginaActual = 1;
const porPagina = 8;

let editandoPersona = null; 
let editandoRelacion = null; 
let personaActualParaRed = null; 

// ======= ELEMENTOS =======
const fichero = document.getElementById("fichero");
const searchInput = document.getElementById("search");
const paginacionDiv = document.getElementById("paginacion");

// Campos participante modal
const modalTitleParticipante = document.getElementById("modalTitleParticipante");
const inputNombre = document.getElementById("nombre");
const inputBio = document.getElementById("biografia");
const inputImg = document.getElementById("img");
const listaRedesPersonaDiv = document.getElementById("listaRedesPersona");

// Campos red modal
const modalTitleRed = document.getElementById("modalTitleRed");
const redSelect = document.getElementById("redSelect");
const inputUsuarioRed = document.getElementById("usuarioRed");

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

// ======= MODALES =======
function openModalParticipante() {
    editandoPersona = null;
    personaActualParaRed = null; // ← IMPORTANTE: NO EXISTE PERSONA TODAVÍA

    modalTitleParticipante.textContent = "Nuevo Participante";
    limpiarModalParticipante();

    // No permitir agregar redes mientras no exista persona
    listaRedesPersonaDiv.innerHTML = `<p class="nothing">Guarda la persona para añadir redes</p>`;

    document.getElementById("modalParticipante").style.display = "flex";
}

function openModalEditarParticipante(idPersona) {
    const p = personas.find(x => x.idPersona === idPersona);
    if (!p) return toast("Participante no encontrado", "error");

    editandoPersona = idPersona;
    personaActualParaRed = idPersona; // ← AHORA SÍ EXISTE

    modalTitleParticipante.textContent = "Editar Participante";
    inputNombre.value = p.nombre;
    inputBio.value = p.biografia || p.bio || "";
    inputImg.value = p.imagen || p.img || "";

    // cargar redes reales del participante
    cargarRedesDePersona(idPersona).then(() => {
        renderListaRedesPersona();
    });

    document.getElementById("modalParticipante").style.display = "flex";
}

function closeModalParticipante() {
    document.getElementById("modalParticipante").style.display = "none";
}

function openModalRedAgregar() {
    if (!personaActualParaRed) {
        toast("Guarda primero la persona antes de agregar redes", "error");
        return;
    }
    editandoRelacion = null;
    modalTitleRed.textContent = "Agregar red";
    inputUsuarioRed.value = "";
    redSelect.value = "";
    document.getElementById("modalRed").style.display = "flex";
}

function openModalRedEditar(idRed, enlace) {
    editandoRelacion = { idPersona_old: personaActualParaRed, idRed_old: idRed };
    modalTitleRed.textContent = "Editar red vinculada";
    redSelect.value = idRed;
    inputUsuarioRed.value = enlace || "";
    document.getElementById("modalRed").style.display = "flex";
}

function closeModalRed() {
    document.getElementById("modalRed").style.display = "none";
}

// ======= CARGAS INICIALES =======
async function cargarPersonas() {
    try {
        const res = await fetch(API_PERSONAS);
        personas = await res.json();
        renderFichas();
    } catch (e) {
        toast("Error al cargar personas", "error");
    }
}

async function cargarRedes() {
    try {
        const res = await fetch(API_REDES);
        redes = await res.json();

        redSelect.innerHTML = `<option value="" disabled selected>Selecciona una red</option>`;
        redes.forEach(r => {
            redSelect.innerHTML += `<option value="${r.idRed}">${r.red}</option>`;
        });
    } catch (e) {
        toast("Error al cargar redes", "error");
    }
}

async function cargarRedesDePersona(idPersona) {
    try {
        const res = await fetch(`${API_RP}/${idPersona}`);

        if (!res.ok) {
            redesDePersona = [];
            throw new Error("No se pudieron cargar redes");
        }

        redesDePersona = await res.json();
    } catch (e) {
        redesDePersona = [];
    }
}
searchInput.addEventListener("input", () => {
    paginaActual = 1;   // reiniciar a la primera página
    renderFichas();
});
// ======= RENDER FICHAS =======
function renderFichas() {
    const busqueda = searchInput.value.toLowerCase();

    let filtrados = personas.filter(p =>
        p.nombre.toLowerCase().includes(busqueda)
    );

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    fichero.innerHTML = "";

    paginados.forEach(p => {
        const avatar = p.imagen || '../resources/user.png';

        fichero.innerHTML += `
        <div class="ficha">
            <img src="${avatar}" alt="Foto">
            <div class="info">
                <h3>ID: ${p.idPersona}</h3>
                <p>${escapeHtml(p.nombre)}</p>
            </div>
            <div class="ficha-actions">
                <button class="btn-edit" onclick="openModalEditarParticipante(${p.idPersona})">✏️</button>
                <button class="btn-delete" onclick="confirmEliminarParticipante(${p.idPersona})">🗑️</button>
            </div>
        </div>`;
    });

    renderPaginacion(filtrados.length);
}

// ======= RENDER LISTA REDES =======
function renderListaRedesPersona() {
    if (!personaActualParaRed) {
        listaRedesPersonaDiv.innerHTML = `<p class="nothing">Guarda la persona para añadir redes</p>`;
        return;
    }

    if (!redesDePersona || redesDePersona.length === 0) {
        listaRedesPersonaDiv.innerHTML = `<p class="nothing">No hay redes asociadas</p>`;
        return;
    }

    listaRedesPersonaDiv.innerHTML = "";
    redesDePersona.forEach(rp => {
        listaRedesPersonaDiv.innerHTML += `
            <div class="red-row" data-idred="${rp.idRed}">
                <div class="red-info">
                    <strong>${escapeHtml(rp.red)}</strong>
                    <span class="enlace">${escapeHtml(rp.enlace || "")}</span>
                </div>
                <div class="red-actions">
                    <button class="btn-edit"
                        onclick="openModalRedEditar(${rp.idRed}, decodeURIComponent('${encodeURIComponent(rp.enlace || "")}'))">✏️
                    </button>

                    <button class="btn-delete" onclick="confirmEliminarRelacion(${rp.idRed})">🗑️</button>
                </div>
            </div>
        `;
    });
}

// ======= CRUD PERSONAS =======
function limpiarModalParticipante() {
    inputNombre.value = "";
    inputBio.value = "";
    inputImg.value = "";
}

async function saveParticipante() {
    const data = {
        nombre: inputNombre.value.trim(),
        bio: inputBio.value.trim(),
        img: inputImg.value.trim()
    };

    if (!data.nombre) return toast("El nombre es obligatorio", "error");

    try {
        let res;
        if (editandoPersona === null) {
            res = await fetch(API_PERSONAS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${API_PERSONAS}/${editandoPersona}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        const msg = await res.json();
        const mensaje = (msg.mensaje || "Operación completada");

        if (mensaje.toLowerCase().includes("rror")) {
            toast(mensaje, "error");
        } else {
            toast(mensaje, "success");
        }

        closeModalParticipante();
        await cargarPersonas();
    } catch (e) {
        toast("Error al guardar participante", "error");
    }
}

function confirmEliminarParticipante(idPersona) {
    if (!confirm("¿Seguro que deseas eliminar este participante?")) return;
    eliminarParticipante(idPersona);
}

async function eliminarParticipante(idPersona) {
    try {
        const res = await fetch(`${API_PERSONAS}/${idPersona}`, { method: "DELETE" });
        const msg = await res.json();
        toast(msg.mensaje || "Operación completada");
        await cargarPersonas();
    } catch (e) {
        toast("Error al eliminar participante", "error");
    }
}

// ======= CRUD RELACIONES =======
async function saveRedRelacion() {
    const idRed = redSelect.value;
    const enlace = inputUsuarioRed.value.trim();

    if (!personaActualParaRed)
        return toast("Guarda primero la persona antes de agregar redes", "error");

    if (!idRed) return toast("Selecciona una red", "error");
    if (!enlace) return toast("El enlace es obligatorio", "error");

    try {
        let res;

        if (editandoRelacion === null) {
            // CREAR
            res = await fetch(API_RP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idPersona: personaActualParaRed,
                    idRed: Number(idRed),
                    enlace
                })
            });
        } else {
            // EDITAR
            res = await fetch(`${API_RP}/${editandoRelacion.idPersona_old}/${editandoRelacion.idRed_old}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idPersona: personaActualParaRed,
                    idRed: Number(idRed),
                    enlace
                })
            });
        }

        const msg = await res.json();
        const mensaje = msg.mensaje || "Operación completada";

        toast(mensaje, mensaje.toLowerCase().includes("rror") ? "error" : "success");

        closeModalRed();
        await cargarRedesDePersona(personaActualParaRed);
        renderListaRedesPersona();

    } catch (e) {
        toast("Error al guardar la relación", "error");
    }
}

function confirmEliminarRelacion(idRed) {
    if (!confirm("¿Deseas quitar esta red del participante?")) return;
    eliminarRelacion(personaActualParaRed, idRed);
}

async function eliminarRelacion(idPersona, idRed) {
    try {
        const res = await fetch(`${API_RP}/${idPersona}/${idRed}`, { method: "DELETE" });
        const msg = await res.json();

        toast(msg.mensaje || "Operación completada");

        await cargarRedesDePersona(personaActualParaRed);
        renderListaRedesPersona();

    } catch (e) {
        toast("Error al eliminar relación", "error");
    }
}


// ======= PAGINACIÓN =======
function renderPaginacion(total) {
    const pagTotal = Math.max(1, Math.ceil(total / porPagina));
    paginacionDiv.innerHTML = `
        <button onclick="cambiarPagina(-1)" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${paginaActual} de ${pagTotal}</span>
        <button onclick="cambiarPagina(1)" ${paginaActual === pagTotal ? "disabled" : ""}>Siguiente</button>
    `;
}

function cambiarPagina(delta) {
    paginaActual += delta;
    renderFichas();
}

// ======= UTILIDADES =======
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    if (!str) return "";
    return String(str)
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n");
}

// ======= INICIO =======
(async function init() {
    await Promise.all([cargarPersonas(), cargarRedes()]);
})();
