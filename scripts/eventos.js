const API = "http://localhost:3000/api";

// ===============================
// ELEMENTOS DOM
// ===============================
const tablaBody = document.getElementById("tblEventos");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");

const searchInput = document.getElementById("search");
const filterSede = document.getElementById("filterSede");
const filterTipo = document.getElementById("filterTipo");

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
const orgContainer = document.getElementById("orgSelect");
const orgItems = document.getElementById("orgItems");
const personasContainer = document.getElementById("personasEventoContainer");

const subMusical = document.getElementById("subMusical");
const subTaller = document.getElementById("subTaller");
const subPremiacion = document.getElementById("subPremiacion");
const subEditorial = document.getElementById("subEditorial");

const inputSetlist = document.getElementById("setlist");
const inputMateriales = document.getElementById("materiales");
const inputRangoEdad = document.getElementById("rangoEdad");
const inputPremio = document.getElementById("premio");
const libroSelect = document.getElementById("libroSelect");

let eventos = [];
let listaPersonas = [];
let listaRoles = [];
let listaOrganizaciones = [];
let editandoId = null;

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
    await cargarEventos();
    await cargarSedes();
    await cargarTiposEvento();
    await cargarOrganizaciones();
    await cargarPersonas();
    await cargarRoles();
    await cargarLibros();
});

searchInput.addEventListener("input", aplicarFiltros);
filterSede.addEventListener("change", aplicarFiltros);
filterTipo.addEventListener("change", aplicarFiltros);

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
// CARGA DATOS
// ===============================
async function cargarEventos() {
    const res = await fetch(`${API}/eventos`);
    eventos = await res.json();
    renderTabla(eventos);
}

async function cargarSedes() {
    const res = await fetch(`${API}/sedes`);
    const sedes = await res.json();
    sedeModal.innerHTML = "<option value=''>Selecciona una sede</option>";
    filterSede.innerHTML = "<option value=''>Todas las sedes</option>";
    sedes.forEach(s => {
        sedeModal.innerHTML += `<option value="${s.idSede}">${s.nombre}</option>`;
        filterSede.innerHTML += `<option value="${s.idSede}">${s.nombre}</option>`;
    });
}

async function cargarTiposEvento() {
    const res = await fetch(`${API}/categorias`);
    const tipos = await res.json();
    tipoEventoModal.innerHTML = "<option value=''>Selecciona un tipo de evento</option>";
    filterTipo.innerHTML = "<option value=''>Todos los tipos</option>";
    tipos.forEach(t => {
        tipoEventoModal.innerHTML += `<option value="${t.idTipoEvento}">${t.tipoEvento}</option>`;
        filterTipo.innerHTML += `<option value="${t.idTipoEvento}">${t.tipoEvento}</option>`;
    });
}

async function cargarOrganizaciones() {
    const res = await fetch(`${API}/organizaciones`);
    listaOrganizaciones = await res.json();
    orgContainer.innerHTML = "";
    listaOrganizaciones.forEach(o => {
        orgContainer.innerHTML += `<option value="${o.idOrganizacion}">${o.nombre}</option>`;
    });
}

async function cargarPersonas() {
    const res = await fetch(`${API}/personas`);
    listaPersonas = await res.json();
}

async function cargarRoles() {
    const res = await fetch(`${API}/roles`);
    listaRoles = await res.json();
}

async function cargarLibros() {
    const res = await fetch(`${API}/libros`);
    const libros = await res.json();
    libroSelect.innerHTML = "<option value=''>Selecciona un libro</option>";
    libros.forEach(l => {
        libroSelect.innerHTML += `<option value="${l.idLibro}">${l.titulo}</option>`;
    });
}

// ===============================
// TABLA
// ===============================
function renderTabla(lista) {
    tablaBody.innerHTML = "";
    const txt = searchInput.value.toLowerCase();
    const res = lista.filter(e =>
        e.titulo.toLowerCase().includes(txt) &&
        (!filterSede.value || e.idSede == filterSede.value) &&
        (!filterTipo.value || e.idTipoEvento == filterTipo.value)
    );
    res.forEach(e => {
        tablaBody.innerHTML += `
            <tr>
                <td>${e.idEvento}</td>
                <td>${e.titulo}</td>
                <td>${e.sede}</td>
                <td>${e.tipoEvento}</td>
                <td>${e.reqRegistro ? "Sí" : "No"}</td>
                <td>${e.participaPublico ? "Sí" : "No"}</td>
                <td>
                    <button onclick="editar(${e.idEvento})">✏️</button>
                    <button onclick="eliminar(${e.idEvento})">🗑️</button>
                </td>
            </tr>`;
    });
}

// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
    const txt = searchInput.value.toLowerCase();
    const res = eventos.filter(e =>
        e.titulo.toLowerCase().includes(txt) &&
        (!filterSede.value || e.idSede == filterSede.value) &&
        (!filterTipo.value || e.idTipoEvento == filterTipo.value)
    );
    renderTabla(res);
}

// ===============================
// MODAL
// ===============================
function openModalNuevo() {
    limpiarModal();
    modalTitle.textContent = "Nuevo Evento";
    modal.style.display = "flex";
}

function closeModal() {
    modal.style.display = "none";
}

function limpiarModal() {
    editandoId = null;
    inputTitulo.value = "";
    inputSinopsis.value = "";
    inputDescripcion.value = "";
    inputInfoAd.value = "";
    inputImagen.value = "";
    checkRegistro.checked = false;
    checkPublico.checked = false;
    horariosContainer.innerHTML = "";
    inputSetlist.value = "";
    inputMateriales.value = "";
    inputRangoEdad.value = "";
    inputPremio.value = "";
    libroSelect.value = "";
    orgItems.innerHTML = "";
    personasContainer.innerHTML = "";
    document.querySelectorAll(".subtipo").forEach(d => d.style.display = "none");
}

// ===============================
// SUBTIPOS
// ===============================
function mostrarSubcampos() {
    document.querySelectorAll(".subtipo").forEach(d => d.style.display = "none");
    const t = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();
    if(t.includes("musical")) subMusical.style.display = "block";
    if(t.includes("taller")) subTaller.style.display = "block";
    if(t.includes("premiación")) subPremiacion.style.display = "block";
    if(t.includes("editorial")) subEditorial.style.display = "block";
}

// ===============================
// SUBTIPOS
// ===============================
async function guardarSubtipo(idEvento) {
    const tipo = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();

    try {
        if (tipo.includes("musical") && inputSetlist.value.trim()) {
            const res = await fetch(`${API}/eventos/musical`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idMusical: idEvento, setlist: inputSetlist.value })
            });
            const r = await res.json();
            if (res.ok) toast("Subtipo musical guardado: " + (r.mensaje || ""));
            else toast("Error subtipo musical: " + (r.error || r.mensaje), "error");
        }

        if (tipo.includes("taller") && inputMateriales.value.trim() && inputRangoEdad.value.trim()) {
            const res = await fetch(`${API}/eventos/taller`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idTaller: idEvento, materiales: inputMateriales.value, edades: inputRangoEdad.value })
            });
            const r = await res.json();
            if (res.ok) toast("Subtipo taller guardado: " + (r.mensaje || ""));
            else toast("Error subtipo taller: " + (r.error || r.mensaje), "error");
        }

        if (tipo.includes("premiación") && inputPremio.value.trim()) {
            const res = await fetch(`${API}/eventos/premiacion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idPrem: idEvento, premio: inputPremio.value })
            });
            const r = await res.json();
            if (res.ok) toast("Subtipo premiación guardado: " + (r.mensaje || ""));
            else toast("Error subtipo premiación: " + (r.error || r.mensaje), "error");
        }

        if (tipo.includes("editorial") && libroSelect.value) {
            const res = await fetch(`${API}/eventos/presEditorial`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idPres: libroSelect.value, idEvento })
            });
            const r = await res.json();
            if (res.ok) toast("Subtipo editorial guardado: " + (r.mensaje || ""));
            else toast("Error subtipo editorial: " + (r.error || r.mensaje), "error");
        }

    } catch (e) {
        console.error("Error guardarSubtipo:", e);
        toast("Error al guardar subtipo: " + e.message, "error");
    }
}

// ===============================
// RELACIONES
// ===============================
async function guardarRelaciones(idEvento) {
    try {
        // Organizaciones
        const orgs = Array.from(orgItems.children).map(d => d.dataset.id);
        for (const idOrg of orgs) {
            try {
                const res = await fetch(`${API}/orgeventos`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idEvento, idOrganizacion: idOrg })
                });
                const r = await res.json();
                if (!res.ok) toast("Error relación org: " + (r.error || r.mensaje), "error");
            } catch (err) {
                console.error("Error POST org:", err);
                toast("Error guardando organización: " + err.message, "error");
            }
        }

        // Personas
        const personas = Array.from(personasContainer.children);
        for (const p of personasContainer.children) {
            const idPersona = p.querySelector(".persona-select").value;
            const idRol = p.querySelector(".rol-select").value;
            const idRel = p.dataset.id || null; // si existe, actualizar
            await fetch(`${API}/personaseventos${idRel ? "/" + idRel : ""}`, {
                method: idRel ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idEvento, idPersona, idRol })
            });
        }
    } catch (e) {
        console.error("Error guardarRelaciones:", e);
        toast("Error al guardar relaciones: " + e.message, "error");
    }
}

// ===============================
// HORARIOS
// ===============================
async function guardarHorarios(idEvento) {
    if (!idEvento) return;

    try {
        const items = document.querySelectorAll(".horario-item");
        for (const item of items) {
            let finicio = item.querySelector(".fechaInicio").value;
            let ffin = item.querySelector(".fechaFin").value;

            if (!finicio || !ffin) continue;

            // Corregir formato para MySQL
            finicio = finicio.replace("T", " ");
            ffin = ffin.replace("T", " ");

            try {
                const res = await fetch(`${API}/horarios`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idEvento, finicio, ffin })
                });
                const r = await res.json();
                if (!res.ok) toast("Error guardando horario: " + (r.error || r.mensaje), "error");
            } catch (err) {
                console.error("Error POST horario:", err);
                toast("Error guardando horario: " + err.message, "error");
            }
        }

    } catch (e) {
        console.error("Error guardarHorarios:", e);
        toast("Error al guardar horarios: " + e.message, "error");
    }
}


// ===============================
// HORARIOS
// ===============================
function agregarHorario(fechaInicio = "", fechaFin = "") {
    const div = document.createElement("div");
    div.classList.add("horario-item");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.marginBottom = "10px";
    div.style.padding = "5px";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "5px";

    div.innerHTML = `
        <label>Fecha y hora inicio:
            <input type="datetime-local" class="fechaInicio" value="${fechaInicio.slice(0,16)}">
        </label>

        <label>Fecha y hora fin:
            <input type="datetime-local" class="fechaFin" value="${fechaFin.slice(0,16)}">
        </label>

        <button type="button" style="margin-top:5px;" onclick="this.parentElement.remove()">❌ Eliminar horario</button>
    `;

    horariosContainer.appendChild(div);
}

async function modificarSubtipo(idEvento) {
    const tipo = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();

    if(tipo.includes("musical")) {
        await fetch(`${API}/eventos/musical/${idEvento}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ setlist: inputSetlist.value })
        });
    }

    if(tipo.includes("taller")) {
        await fetch(`${API}/eventos/taller/${idEvento}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ materiales: inputMateriales.value, edades: inputRangoEdad.value })
        });
    }

    if(tipo.includes("premiación")) {
        await fetch(`${API}/eventos/premiacion/${idEvento}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ premio: inputPremio.value })
        });
    }

    if(tipo.includes("editorial")) {
        await fetch(`${API}/eventos/presEditorial/${idEvento}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idPres: libroSelect.value })
        });
    }
}

async function modificarRelaciones(idEvento) {
    try {
        // Organizaciones
        const orgs = Array.from(orgItems.children);
        for (const div of orgs) {
            const idOrg = div.dataset.id;
            const existe = div.dataset.relacionId || null; // id de la relación en BD si existe

            try {
                const res = await fetch(`${API}/orgeventos${existe ? "/" + existe : ""}`, {
                    method: existe ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idEvento, idOrganizacion: idOrg })
                });
                const r = await res.json();
                if (!res.ok) toast("Error relación org: " + (r.error || r.mensaje), "error");
                else if (!existe && r.idRelacion) div.dataset.relacionId = r.idRelacion; // asignar ID a elemento nuevo
            } catch (err) {
                console.error("Error guardando organización:", err);
                toast("Error guardando organización: " + err.message, "error");
            }
        }

        // Personas
        const personas = Array.from(personasContainer.children);
        for (const p of personas) {
            const idPersona = p.querySelector(".persona-select").value;
            const idRol = p.querySelector(".rol-select").value;
            const existe = p.dataset.relacionId || null;

            if (!idPersona || !idRol) continue;

            try {
                const res = await fetch(`${API}/personaseventos${existe ? "/" + existe : ""}`, {
                    method: existe ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idEvento, idPersona, idRol })
                });
                const r = await res.json();
                if (!res.ok) toast("Error relación persona: " + (r.error || r.mensaje), "error");
                else if (!existe && r.idRelacion) p.dataset.relacionId = r.idRelacion;
            } catch (err) {
                console.error("Error guardando persona-evento:", err);
                toast("Error guardando persona-evento: " + err.message, "error");
            }
        }

    } catch (e) {
        console.error("Error general en modificarRelaciones:", e);
        toast("Error al modificar relaciones: " + e.message, "error");
    }
}


async function modificarHorarios(idEvento) {
    try {
        // Borrar horarios previos
        await fetch(`${API}/horarios/${idEvento}`, { method: "DELETE" });
        // Insertar nuevos horarios
        await guardarHorarios(idEvento);

    } catch (e) {
        console.error("Error modificarHorarios:", e);
        toast("Error al modificar horarios: " + e.message, "error");
    }
}

// ===============================
// ORGANIZACIONES
// ===============================
function agregarOrg() {
    const select = orgContainer;
    const idOrg = select.value;
    const nombreOrg = select.options[select.selectedIndex]?.text;

    if(!idOrg){ alert("Selecciona una organización"); return; }
    if(orgItems.querySelector(`[data-id="${idOrg}"]`)) return;

    const div = document.createElement("div");
    div.classList.add("org-item");
    div.dataset.id = idOrg;
    div.innerHTML = `<span>${nombreOrg}</span>
                     <button type="button" onclick="this.parentElement.remove()">❌</button>`;
    orgItems.appendChild(div);
}

// ===============================
// PERSONAS
// ===============================
function agregarPersonaEvento(idPersona = "", idRol = "") {
    const div = document.createElement("div");
    div.classList.add("persona-evento-item");
    div.innerHTML = `
        <select class="persona-select">
            <option value="">Persona</option>
            ${listaPersonas.map(p => `<option value="${p.idPersona}" ${p.idPersona==idPersona?"selected":""}>${p.nombre}</option>`).join("")}
        </select>

        <select class="rol-select">
            <option value="">Rol</option>
            ${listaRoles.map(r => `<option value="${r.idRol}" ${r.idRol==idRol?"selected":""}>${r.rol}</option>`).join("")}
        </select>

        <button type="button" onclick="this.parentElement.remove()">❌</button>
        <hr>
    `;
    personasContainer.appendChild(div);
}

// ===============================
// CRUD EVENTOS (CREAR / MODIFICAR)
// ===============================
async function save() {
    if (!validarFormulario()) return;

    const data = {
        titulo: inputTitulo.value,
        sinopsis: inputSinopsis.value,
        descripcion: inputDescripcion.value,
        infoAd: inputInfoAd.value,
        imagen: inputImagen.value,
        reqRegistro: checkRegistro.checked,
        participaPublico: checkPublico.checked,
        idSede: sedeModal.value,
        idTipoEvento: tipoEventoModal.value
    };

    let idEvento;

    try {
        // CREAR o EDITAR evento principal
        if (editandoId) {
            const res = await fetch(`${API}/eventos/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const r = await res.json();
            if (res.ok) {
                toast(r.mensaje || "Evento modificado correctamente");
            } else {
                console.error("Error al modificar:", r);
                toast("Error al modificar: " + (r.error || r.mensaje), "error");
                return;
            }
            idEvento = editandoId;
            await modificarSubtipo(idEvento);
            await modificarRelaciones(idEvento);
            await modificarHorarios(idEvento);
        } else {
            const res = await fetch(`${API}/eventos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const r = await res.json();
            if (res.ok) {
                toast(r.mensaje || "Evento creado correctamente");
            } else {
                console.error("Error al crear:", r);
                toast("Error al crear: " + (r.error || r.mensaje), "error");
                return;
            }
            idEvento = r.idEvento;

            // Guardar subtipo (musical, taller, premiación, editorial)
            await guardarSubtipo(idEvento);

            // Guardar relaciones (personas y organizaciones)
            await guardarRelaciones(idEvento);

            // Guardar horarios
            await guardarHorarios(idEvento);
        }

        // Cerrar modal y recargar tabla
        closeModal();
        await cargarEventos();

    } catch (e) {
        console.error("Error general al guardar evento:", e);
        toast("Error al guardar el evento: " + e.message, "error");
    }
}


// ===============================
// EDITAR
// ===============================
async function editar(id){
    limpiarModal();
    modalTitle.textContent="Editar Evento";
    editandoId=id;

    const res = await fetch(`${API}/eventos/${id}`);
    const e = await res.json();

    inputTitulo.value=e.titulo;
    inputSinopsis.value=e.sinopsis;
    inputDescripcion.value=e.descripcion;
    inputInfoAd.value=e.infoAd;
    inputImagen.value=e.imagen;
    checkRegistro.checked=e.reqRegistro;
    checkPublico.checked=e.participaPublico;
    sedeModal.value=e.idSede;
    tipoEventoModal.value=e.idTipoEvento;

    mostrarSubcampos();

    // Subtipos
    if(e.esMusical){ subMusical.style.display="block"; inputSetlist.value=e.setlist||""; }
    if(e.esTaller){ subTaller.style.display="block"; inputMateriales.value=e.materiales||""; inputRangoEdad.value=e.rangoEdad||""; }
    if(e.esPremiacion){ subPremiacion.style.display="block"; inputPremio.value=e.premio||""; }
    if(e.esPresEditorial){ subEditorial.style.display="block"; libroSelect.value=e.idLibro||""; }

    // Relaciones
    const personasRes = await fetch(`${API}/personaseventos/${id}`);
    const personas = await personasRes.json();
    personas.forEach(p => agregarPersonaEvento(p.idPersona,p.idRol));

    const orgRes = await fetch(`${API}/orgeventos/${id}`);
    const orgs = await orgRes.json();
    orgs.forEach(o => {
        const div = document.createElement("div");
        div.classList.add("org-item");
        div.dataset.id = o.idOrganizacion;
        div.innerHTML = `<span>${o.nombre}</span><button type="button" onclick="this.parentElement.remove()">❌</button>`;
        orgItems.appendChild(div);
    });

    // Horarios
    const horariosRes = await fetch(`${API}/horarios/${id}`);
    const horarios = await horariosRes.json();
    horariosContainer.innerHTML="";
    horarios.forEach(h => agregarHorario(h.fechaInicio,h.fechaFin));

    modal.style.display="flex";
}

// ===============================
// ELIMINAR
// ===============================
async function eliminar(id){
    if(!confirm("¿Seguro que deseas eliminar este evento?")) return;

    try{
        const res = await fetch(`${API}/eventos/${id}`,{method:"DELETE"});
        const msg = await res.json();
        toast(msg.mensaje);
        cargarEventos();
    } catch(e){
        console.error(e);
        toast("Error al eliminar","error");
    }
}

// ===============================
// VALIDACIONES
// ===============================
function validarFormulario(){
    if(!inputTitulo.value.trim()){ alert("El título es obligatorio"); return false; }
    if(!tipoEventoModal.value){ alert("Selecciona un tipo de evento"); return false; }

    const tipo = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();
    if(tipo.includes("musical") && !inputSetlist.value.trim()){ alert("El setlist es obligatorio"); return false; }
    if(tipo.includes("taller") && (!inputMateriales.value.trim() || !inputRangoEdad.value.trim())){ alert("Materiales y rango de edad son obligatorios"); return false; }
    if(tipo.includes("premiación") && !inputPremio.value.trim()){ alert("El premio es obligatorio"); return false; }
    if(tipo.includes("editorial") && !libroSelect.value){ alert("Selecciona un libro"); return false; }

    return true;
}
