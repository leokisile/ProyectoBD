// ======= CONFIG =======
const API_AUTORES = "http://localhost:3000/api/personas"; // autores
const API_EDITORIALES = "http://localhost:3000/api/organizaciones"; // editoriales
const API_LIBROS = "http://localhost:3000/api/libros";

let libros = [];
let autores = [];
let editoriales = [];
let paginaActual = 1;
const porPagina = 8;

let editandoLibro = null;

// ======= ELEMENTOS =======
const fichero = document.getElementById("fichero");
const searchInput = document.getElementById("search");
const paginacionDiv = document.getElementById("paginacion");

// Modal campos
const modalLibro = document.getElementById("modalLibro");
const modalTitle = document.getElementById("modalTitle");
const inputTitulo = document.getElementById("tituloLibro");
const inputSinopsis = document.getElementById("sinopsisLibro");
const inputImg = document.getElementById("imgLibro");
const autorSelect = document.getElementById("autorSelect");
const editorialSelect = document.getElementById("editorialSelect");

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
function openModal() {
    editandoLibro = null;
    modalTitle.textContent = "Nuevo Libro";
    limpiarModal();
    modalLibro.style.display = "flex";
}

function closeModal() {
    modalLibro.style.display = "none";
}

function limpiarModal() {
    inputTitulo.value = "";
    inputSinopsis.value = "";
    inputImg.value = "";
    autorSelect.value = "";
    editorialSelect.value = "";
}

// ======= CRUD LIBROS =======
async function saveLibro() {
    const data = {
        titulo: inputTitulo.value.trim(),
        sinopsis: inputSinopsis.value.trim(),
        imagen: inputImg.value.trim(),
        idAutor: autorSelect.value,
        idEditorial: editorialSelect.value
    };

    if (!data.titulo) return toast("El título es obligatorio", "error");
    if (!data.idAutor) return toast("Selecciona un autor", "error");
    if (!data.idEditorial) return toast("Selecciona una editorial", "error");

    try {
        let res;
        if (!editandoLibro) {
            res = await fetch(API_LIBROS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(`${API_LIBROS}/${editandoLibro}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        const msg = await res.json();
        toast(msg.mensaje || "Operación completada");
        closeModal();
        await cargarLibros();
    } catch (e) {
        toast("Error al guardar libro", "error");
        console.error(e);
    }
}

function openModalEditarLibro(idLibro) {
    const libro = libros.find(l => l.idLibro === idLibro);
    if (!libro) return toast("Libro no encontrado", "error");

    editandoLibro = idLibro;
    modalTitle.textContent = "Editar Libro";

    inputTitulo.value = libro.titulo;
    inputSinopsis.value = libro.sinopsis || "";
    inputImg.value = libro.imagen || "";
    autorSelect.value = libro.idAutor;
    editorialSelect.value = libro.idEditorial;

    modalLibro.style.display = "flex";
}

function confirmEliminarLibro(idLibro) {
    if (!confirm("¿Deseas eliminar este libro?")) return;
    eliminarLibro(idLibro);
}

async function eliminarLibro(idLibro) {
    try {
        const res = await fetch(`${API_LIBROS}/${idLibro}`, { method: "DELETE" });
        const msg = await res.json();
        toast(msg.mensaje || "Libro eliminado");
        await cargarLibros();
    } catch (e) {
        toast("Error al eliminar libro", "error");
    }
}

// ======= CARGAS INICIALES =======
async function cargarAutores() {
    try {
        const res = await fetch(API_AUTORES);
        autores = await res.json();

        autorSelect.innerHTML = `<option value="" disabled selected>Selecciona un autor</option>`;
        autores.forEach(a => {
            autorSelect.innerHTML += `<option value="${a.idPersona}">${a.nombre}</option>`;
        });
    } catch (e) {
        toast("Error al cargar autores", "error");
    }
}

async function cargarEditoriales() {
    try {
        const res = await fetch(API_EDITORIALES);
        editoriales = await res.json();

        editorialSelect.innerHTML = `<option value="" disabled selected>Selecciona una editorial</option>`;
        editoriales.forEach(e => {
            editorialSelect.innerHTML += `<option value="${e.idOrganizacion}">${e.nombre}</option>`;
        });
    } catch (e) {
        toast("Error al cargar editoriales", "error");
    }
}

async function cargarLibros() {
    try {
        const res = await fetch(API_LIBROS);
        libros = await res.json();
        renderFichas();
    } catch (e) {
        toast("Error al cargar libros", "error");
        console.error(e);
    }
}

// ======= RENDER FICHAS =======
function renderFichas() {
    const busqueda = searchInput.value.toLowerCase();
    let filtrados = libros.filter(l => l.titulo.toLowerCase().includes(busqueda));

    const inicio = (paginaActual - 1) * porPagina;
    const paginados = filtrados.slice(inicio, inicio + porPagina);

    fichero.innerHTML = "";

    paginados.forEach(l => {
        const autor = autores.find(a => a.idPersona === l.idAutor)?.nombre || "Desconocido";
        const editorial = editoriales.find(e => e.idOrganizacion === l.idEditorial)?.nombre || "Desconocida";
        const imagen = l.imagen || "../resources/libro.png";

        fichero.innerHTML += `
        <div class="ficha">
            <img src="${imagen}" alt="Foto">
            <div class="info">
                <h3>${escapeHtml(l.titulo)}</h3>
                <p>ID: ${l.idLibro}</p>
                <p>Autor: ${escapeHtml(autor)}</p>
                <p>Editorial: ${escapeHtml(editorial)}</p>
            </div>
            <div class="ficha-actions">
                <button class="btn-edit" onclick="openModalEditarLibro(${l.idLibro})">✏️</button>
                <button class="btn-delete" onclick="confirmEliminarLibro(${l.idLibro})">🗑️</button>
            </div>
        </div>`;
    });

    renderPaginacion(filtrados.length);
}

// ======= PAGINACIÓN =======
function renderPaginacion(total) {
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    paginacionDiv.innerHTML = `
        <button onclick="cambiarPagina(-1)" ${paginaActual === 1 ? "disabled" : ""}>Anterior</button>
        <span>Página ${paginaActual} de ${totalPaginas}</span>
        <button onclick="cambiarPagina(1)" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente</button>
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

// ======= LISTENERS =======
searchInput.addEventListener("input", () => { paginaActual = 1; renderFichas(); });

// ======= INICIO =======
(async function init() {
    await Promise.all([cargarAutores(), cargarEditoriales()]);
    await cargarLibros();
})();
