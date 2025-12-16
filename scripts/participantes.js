const filaFichas = document.getElementById('filaFichas');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalImg');
const modalBio = document.getElementById('modalBio');
const modalOtros = document.getElementById('modalOtros');
const cerrarModal = document.getElementById('cerrarModal');
const searchInput = document.getElementById('searchInput');

let participantesGlobal = []; // guardamos todos para filtrar

// Cerrar modal
cerrarModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => {
    if(e.target === modal) modal.style.display = 'none';
});

// Cargar participantes desde API
async function cargarParticipantes() {
    try {
        const res = await fetch('http://localhost:3000/api/consultas/Persona');
        const data = await res.json();
        participantesGlobal = Array.isArray(data) ? data : Object.values(data);

        mostrarParticipantes(participantesGlobal);
    } catch(err) {
        console.error('Error cargando participantes:', err);
    }
}

// Mostrar fichas en pantalla
function mostrarParticipantes(participantes) {
    filaFichas.innerHTML = '';

    participantes.forEach(p => {
        const div = document.createElement('div');
        div.classList.add('fichaParticipante');
        div.innerHTML = `
            <img src="${p.imagen || '../resources/iconPersona.png'}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p>${p.biografia?.substring(0, 50) || '-'}...</p>
        `;
        div.addEventListener('click', () => abrirModal(p.idPersona));
        filaFichas.appendChild(div);
    });
}

// Abrir modal con info completa
async function abrirModal(id) {
    try {
        const res = await fetch(`http://localhost:3000/api/consultas/Persona/${id}`);
        const p = await res.json();

        modalTitle.textContent = p.nombre;
        modalImg.src = p.imagen || '../resources/iconPersona.png';
        modalBio.textContent = p.biografia || '-';

        modal.style.display = 'flex';
    } catch(err) {
        console.error('Error cargando participante:', err);
    }
}

// Filtrado en tiempo real
searchInput.addEventListener('input', () => {
    const filtro = searchInput.value.toLowerCase();
    const filtrados = participantesGlobal.filter(p =>
        p.nombre.toLowerCase().includes(filtro)
    );
    mostrarParticipantes(filtrados);
});

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', cargarParticipantes);

