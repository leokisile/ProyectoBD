const tablaBody = document.getElementById('tablaBody');

async function cargarProgramaGeneral() {
    try {
        const res = await fetch('http://localhost:3000/api/consultas/ProgGeneral');
        const eventos = await res.json();

        tablaBody.innerHTML = '';

        eventos.forEach(evento => {
            const tr = document.createElement('tr');

            // Convertimos fecha y hora de manera segura
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

            // Redirigir al hacer click en la fila
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', () => {
                window.location.href = `evento.html?id=${evento.idEvento}`;
            });

            tablaBody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error cargando programa general:', err);
        tablaBody.innerHTML = '<tr><td colspan="6">Error cargando eventos</td></tr>';
    }
}

window.addEventListener('DOMContentLoaded', cargarProgramaGeneral);
