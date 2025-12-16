// Obtener idEvento desde URL
const params = new URLSearchParams(window.location.search);
const idEvento = params.get('id');

async function cargarEvento() {
    try {
        // Obtener datos principales del evento
        const res = await fetch(`http://localhost:3000/api/consultas/EventoIndv/${idEvento}`);
        const data = await res.json();
        if(!data || data.length === 0) return;

        const evento = data[0];

        // Campos básicos
        document.getElementById('categoria').textContent = evento.tipoEvento;
        document.getElementById('tituloEvento').textContent = evento.titulo;
        document.getElementById('imgEvento').src = evento.imagen || '../resources/eventoBanner.jpeg';
        document.getElementById('participantes').textContent = evento.participantes || '-';
        document.getElementById('sinopsis').textContent = evento.sinopsis || '-';
        document.getElementById('presentadores').textContent = evento.presentadores || '-';
        document.getElementById('sede').textContent = evento.sede || '-';
        document.getElementById('descripcion').textContent = evento.descripcion || '-';
        document.getElementById('biografias').textContent = evento.participantes || '-';

        // Mostrar condicionales
        if(evento.reqRegistro === 1) document.getElementById('reqRegistro').style.display = 'block';
        if(evento.participaPublico === 1) document.getElementById('participaPublico').style.display = 'block';

        // Información adicional según subevento
        const subeventosDiv = document.getElementById('subeventos');

        // Musical
        if(evento.esMusical === 1) {
            const resSetlist = await fetch(`http://localhost:3000/api/consultas/Setlist/${idEvento}`);
            const setlist = await resSetlist.json();
            const divMusical = document.createElement('div');
            divMusical.innerHTML = `<h4>Setlist Musical</h4><ul>${setlist.map(s => `<li>${s.cancion}</li>`).join('')}</ul>`;
            subeventosDiv.appendChild(divMusical);
        }

        // Taller
        if(evento.esTaller === 1) {
            const resTaller = await fetch(`http://localhost:3000/api/consultas/DatosTaller/${idEvento}`);
            const taller = await resTaller.json();
            const divTaller = document.createElement('div');
            divTaller.innerHTML = `<h4>Taller</h4><p>${taller[0].infoAdicional || '-'}</p>`;
            subeventosDiv.appendChild(divTaller);
        }

        // Premiación
        if(evento.esPremiacion === 1) {
            const resPremio = await fetch(`http://localhost:3000/api/consultas/Premio/${idEvento}`);
            const premio = await resPremio.json();
            const divPremio = document.createElement('div');
            divPremio.innerHTML = `<h4>Premiación</h4><p>${premio[0].nombrePremio || '-'}</p>`;
            subeventosDiv.appendChild(divPremio);
        }

        // Presentación Editorial
        if(evento.esPresEditorial === 1) {
            const resLibros = await fetch(`http://localhost:3000/api/consultas/LibrosPres/${idEvento}`);
            const libros = await resLibros.json();
            const divLibros = document.createElement('div');
            divLibros.innerHTML = `<h4>Libros de Presentación</h4><ul>${libros.map(l => `<li>${l.titulo}</li>`).join('')}</ul>`;
            subeventosDiv.appendChild(divLibros);
        }

    } catch (err) {
        console.error('Error cargando evento:', err);
    }
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', cargarEvento);
