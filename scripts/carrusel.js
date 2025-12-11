/* ===========================================
   SLIDE PRINCIPAL (una imagen a la vez)
=========================================== */
const slides = document.querySelectorAll(".carruselInfo img");
let currentSlide = 0;

function changeSlide() {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
}

slides[0].classList.add("active");
setInterval(changeSlide, 6000);

/* ===========================================
   CARRUSEL ALIADOS (estable, suave, 1x1)
=========================================== */
const aliadosTrack = document.querySelector(".aliados-track");

if (aliadosTrack) {
    function moverAliados() {
        const first = aliadosTrack.children[0];

        // Calcular ancho exacto del primer logo usando getBoundingClientRect()
        const rect = first.getBoundingClientRect();
        const aliadoWidth = rect.width + 40; // sumamos el gap definido en CSS

        aliadosTrack.style.transition = "transform 0.9s ease-in-out";
        aliadosTrack.style.transform = `translateX(-${aliadoWidth}px)`;

        // Reacomodo al terminar la animación
        setTimeout(() => {
            aliadosTrack.appendChild(first);
            aliadosTrack.style.transition = "none";
            aliadosTrack.style.transform = "translateX(0)";
        }, 900);
    }

    // Movimiento cada 1.5s
    setInterval(moverAliados, 1500);
}

