// ================= MODAL GENERAL =================
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");

// Campos del modal (pueden ser más si tu HTML los incluye)
const inputTitulo = document.getElementById("titulo");
const inputSinopsis = document.getElementById("sinopsis");
const inputReqRegistro = document.getElementById("reqRegistro");
const inputParticipaPublico = document.getElementById("participaPublico");
const inputSede = document.getElementById("sede");
const inputTipoEvento = document.getElementById("tipoEvento");

// ---------- ABRIR MODAL NUEVO ----------
function openModalNuevo() {
    modal.style.display = "flex";
    modalTitle.textContent = "Nuevo Evento";

    // limpieza provisional
    if (inputTitulo) inputTitulo.value = "";
    if (inputSinopsis) inputSinopsis.value = "";
    if (inputReqRegistro) inputReqRegistro.checked = false;
    if (inputParticipaPublico) inputParticipaPublico.checked = false;

    showToast("Modal de nuevo evento abierto");
}

// ---------- ABRIR MODAL EDITAR ----------
function openModalEditar(id) {
    modal.style.display = "flex";
    modalTitle.textContent = "Editar Evento";

    // Valores temporales de prueba
    if (inputTitulo) inputTitulo.value = "Evento de prueba " + id;
    if (inputSinopsis) inputSinopsis.value = "Sinopsis temporal...";
    if (inputReqRegistro) inputReqRegistro.checked = true;

    showToast("Modal de edición abierto (fake data)");
}

// ---------- CERRAR MODAL ----------
function closeModal() {
    modal.style.display = "none";
}

// ================= TOAST =================
const toast = document.getElementById("toast");

function showToast(msg) {
    toast.textContent = msg;
    toast.className = "show";

    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 2500);
}
