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
const personasContainer = document.getElementById("personasContainer");

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

document.addEventListener("DOMContentLoaded", async () => {
    await cargarEventos();
    await cargarSedes();
    await cargarTiposEvento();
    await cargarOrganizaciones();
    await cargarPersonas();
    await cargarRoles();  
});
    searchInput.addEventListener("input", aplicarFiltros);
    filterSede.addEventListener("change", aplicarFiltros);
    filterTipo.addEventListener("change", aplicarFiltros);
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

async function cargarPersonasEvento(idEvento) {
    const res = await fetch(`${API}/personaseventos/${idEvento}`);
    const data = await res.json();

    const cont = document.getElementById("personasEventoContainer");
    cont.innerHTML = "";

    data.forEach(p => {
        agregarPersonaEvento(p.idPersona, p.idRol);
    });
}


// ===============================
// TABLA
// ===============================
function renderTabla(lista) {
    tablaBody.innerHTML = "";
    const txt = searchInput.value.toLowerCase();
    const res = eventos.filter(e =>
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
    Array.from(orgContainer.options).forEach(o => o.selected = false);
    document.querySelectorAll(".personaCheckbox").forEach(cb => cb.checked = false);
    document.querySelectorAll(".subtipo").forEach(d => d.style.display = "none");
}

// ===============================
// SUBTIPOS
// ===============================
function mostrarSubcampos() {
    document.querySelectorAll(".subtipo").forEach(d => d.style.display = "none");
    const t = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();
    if (t.includes("musical")) subMusical.style.display = "block";
    if (t.includes("taller")) subTaller.style.display = "block";
    if (t.includes("premiación")) subPremiacion.style.display = "block";
    if (t.includes("editorial")) subEditorial.style.display = "block";
}

// ===============================
// HORARIOS
// ===============================
function agregarHorario(fechaInicio = "", fechaFin = "") {
    const div = document.createElement("div");
    div.classList.add("horario-item");

    // Cada bloque ocupa todo el ancho disponible y con margen
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





function agregarOrg(idOrg = null, nombreOrg = null) {
    const select = document.getElementById("orgSelect");
    const orgItems = document.getElementById("orgItems");

    // Si no se pasa idOrg, se toma del select
    if (!idOrg) {
        idOrg = select.value;
        nombreOrg = select.options[select.selectedIndex]?.text;
        if (!idOrg) { alert("Selecciona una organización"); return; }
    }

    // Evitar duplicados
    if (orgItems.querySelector(`[data-id="${idOrg}"]`)) {
        return; // Ya existe, no agregar
    }

    const div = document.createElement("div");
    div.classList.add("org-item");
    div.dataset.id = idOrg;

    div.innerHTML = `
        <span>${nombreOrg}</span>
        <button type="button" onclick="this.parentElement.remove()">❌</button>
    `;

    orgItems.appendChild(div);

    // Si vino del select, resetear
    if (!arguments.length) select.selectedIndex = 0;
}



function agregarPersonaEvento(idPersona = "", idRol = "") {
    const div = document.createElement("div");
    div.classList.add("persona-evento-item");

    div.innerHTML = `
        <select class="persona-select">
            <option value="">Persona</option>
            ${listaPersonas.map(p =>
                `<option value="${p.idPersona}" ${p.idPersona == idPersona ? "selected" : ""}>
                    ${p.nombre}
                </option>`
            ).join("")}
        </select>

        <select class="rol-select">
            <option value="">Rol</option>
            ${listaRoles.map(r =>
                `<option value="${r.idRol}" ${r.idRol == idRol ? "selected" : ""}>
                    ${r.rol}
                </option>`
            ).join("")}
        </select>

        <button type="button" onclick="this.parentElement.remove()">❌</button>
        <hr>
    `;

    document.getElementById("personasEventoContainer").appendChild(div);
}

// ===============================
// CRUD EVENTOS
// ===============================
async function save() {
    if(!validarFormulario()) return;

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

    if(editandoId){
        await fetch(`${API}/eventos/${editandoId}`, {
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(data)
        });
        idEvento = editandoId;
    } else {
        const res = await fetch(`${API}/eventos`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(data)
        });
        const r = await res.json();
        idEvento = r.idEvento; // asegúrate que el backend devuelva idEvento
    }

    await guardarSubtipo(idEvento);
    await guardarRelaciones(idEvento);
    await guardarHorarios(idEvento);

    closeModal();
    cargarEventos();
}

// ===============================
// SUBTIPOS CRUD
// ===============================
async function guardarSubtipo(idEvento){
    const tipo = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();
    if(tipo.includes("musical")){
        await fetch(`${API}/eventos/musical/${editandoId||idEvento}`, {
            method: editandoId?"PUT":"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idMusical:idEvento,setlist:inputSetlist.value})
        });
    }
    if(tipo.includes("taller")){
        await fetch(`${API}/eventos/taller/${editandoId||idEvento}`, {
            method: editandoId?"PUT":"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idTaller:idEvento,materiales:inputMateriales.value,edades:inputRangoEdad.value})
        });
    }
    if(tipo.includes("premiación")){
        await fetch(`${API}/eventos/premiacion/${editandoId||idEvento}`, {
            method: editandoId?"PUT":"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idPrem:idEvento,premio:inputPremio.value})
        });
    }
    if(tipo.includes("editorial")){
        await fetch(`${API}/eventos/presEditorial`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idPres:idEvento})
        });
    }
}

// ===============================
// RELACIONES
// ===============================
async function guardarRelaciones(idEvento){
    // Organizaciones
    const orgs = Array.from(orgContainer.selectedOptions).map(o => o.value);
    for(const o of orgs){
        await fetch(`${API}/eventos/organizaciones`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idEvento,idOrganizacion:o})
        });
    }

    // Personas
    const personas = Array.from(document.querySelectorAll(".personaCheckbox"))
        .filter(cb=>cb.checked).map(cb=>cb.value);
    for(const p of personas){
        await fetch(`${API}/personaseventos`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idEvento,idPersona:p,idRol:1}) // rol fijo o modificar según UI
        });
    }
}

// ===============================
// HORARIOS CRUD
// ===============================
async function guardarHorarios(idEvento){
    // Borrar antiguos
    await fetch(`${API}/eventos/horarios/${idEvento}`,{method:"DELETE"});

    const fechas = document.querySelectorAll(".fecha");
    const horas = document.querySelectorAll(".hora");
    for(let i=0;i<fechas.length;i++){
        await fetch(`${API}/horarios`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({idEvento,finicio:fechas[i].value,ffin:horas[i].value})
        });
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

    await cargarSubtipoEditar(id);
    await cargarRelacionesEditar(id);
    await cargarHorariosEditar(id);

    modal.style.display="flex";
}

// ===============================
// CARGA SUBTIPOS, RELACIONES, HORARIOS
// ===============================
async function cargarSubtipoEditar(idEvento){
    const res = await fetch(`${API}/eventos/${idEvento}`);
    const data = await res.json();

    if(data.esMusical){
        subMusical.style.display="block";
        inputSetlist.value=data.setlist||"";
    }
    if(data.esTaller){
        subTaller.style.display="block";
        inputMateriales.value=data.materiales||"";
        inputRangoEdad.value=data.edades||"";
    }
    if(data.esPremiacion){
        subPremiacion.style.display="block";
        inputPremio.value=data.premio||"";
    }
    if(data.esPresEditorial){
        subEditorial.style.display="block";
        libroSelect.value=data.idLibro||"";
    }
}

async function cargarRelacionesEditar(idEvento){
    // Personas + roles
    const res = await fetch(`${API}/personaseventos/${idEvento}`);
    const personas = await res.json();
    const personasCont = document.getElementById("personasEventoContainer");
    personasCont.innerHTML = "";
    personas.forEach(p => agregarPersonaEvento(p.idPersona, p.idRol));

    // Organizaciones
    const resOrg = await fetch(`${API}/orgeventos/${idEvento}`);
    const orgs = await resOrg.json();
    orgs.forEach(o => agregarOrg(o.idOrganizacion, o.nombre)); // Pasar datos directamente
}



async function cargarPersonasEvento(idEvento) {
    const res = await fetch(`${API}/personaseventos/${idEvento}`);
    const data = await res.json();

    const cont = document.getElementById("personasEventoContainer");
    cont.innerHTML = "";

    data.forEach(p => {
        agregarPersonaEvento(p.idPersona, p.idRol);
    });
}

async function cargarHorariosEditar(idEvento){
    const res = await fetch(`${API}/horarios/${idEvento}`);
    let horarios = await res.json();

    // Asegurarnos de que sea un arreglo
    if (!Array.isArray(horarios)) {
        horarios = [horarios];
    }

    horariosContainer.innerHTML = "";

    horarios.forEach(h => {
        agregarHorario(h.fechaInicio, h.fechaFin);
    });
}



// ===============================
// ELIMINAR
// ===============================
async function eliminar(id) {
    if (!confirm("¿Seguro que deseas eliminar este evento?")) return;

    try {
        const res = await fetch(`${API}/eventos/${id}`,{method:"DELETE"});

        const msg = await res.json();
        toast(msg.mensaje);
        cargarEventos();
    } catch (e) {
        toast("Error al eliminar", "error");
    }
}

// ===============================
// VALIDACIONES
// ===============================
function validarFormulario(){
    if(!inputTitulo.value.trim()){ alert("El título es obligatorio"); return false; }
    if(!tipoEventoModal.value){ alert("Selecciona un tipo de evento"); return false; }

    const tipo = tipoEventoModal.options[tipoEventoModal.selectedIndex].text.toLowerCase();
    if(tipo.includes("musical") && !inputSetlist.value.trim()){
        alert("Ingresa un setlist para evento musical"); return false;
    }
    return true;
}
