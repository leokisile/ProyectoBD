const tablaBody = document.getElementById('tablaBody');
const searchInput = document.getElementById('searchInput');

let eventos = []; // Guardamos todos los eventos para filtrar

async function cargarProgramaGeneral() {
    try {
        const res = await fetch('http://localhost:3000/api/consultas/ProgGeneral');
        eventos = await res.json();

        renderTabla(eventos);
    } catch (err) {
        console.error('Error cargando programa general:', err);
        tablaBody.innerHTML = '<tr><td colspan="6">Error cargando eventos</td></tr>';
    }
}

// Renderiza la tabla según el arreglo proporcionado
function renderTabla(listaEventos) {
    tablaBody.innerHTML = '';

    if (!listaEventos || listaEventos.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="6">No se encontraron eventos</td></tr>';
        return;
    }

    listaEventos.forEach(evento => {
        const tr = document.createElement('tr');

        const fechaInicio = evento.fechaInicio ? new Date(evento.fechaInicio).toLocaleDateString('es-MX') : '-';
        const diaSemana = evento.fechaInicio ? new Date(evento.fechaInicio).toLocaleDateString('es-MX', { weekday: 'long' }) : '-';
        const horaInicio = evento.horaInicio || '-';

        tr.innerHTML = `
            <td>${evento.tipoEvento || '-'}</td>
            <td>${evento.titulo || '-'}</td>
            <td>${evento.organizaciones || '-'}</td>
            <td>${diaSemana}</td>
            <td>${fechaInicio}</td>
            <td>${horaInicio}</td>
        `;

        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => {
            window.location.href = `evento.html?id=${evento.idEvento}`;
        });

        tablaBody.appendChild(tr);
    });
}

// Filtrado en tiempo real
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtrados = eventos.filter(ev => {
        return (ev.titulo && ev.titulo.toLowerCase().includes(query)) ||
               (ev.organizaciones && ev.organizaciones.toLowerCase().includes(query));
    });
    renderTabla(filtrados);
});

window.addEventListener('DOMContentLoaded', cargarProgramaGeneral);
