const API_URL = 'https://api-pacientes-uthh.vercel.app/api';

/* ── NAVBAR ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── HAMBURGUESA ── */
const btnH = document.getElementById('btn-hamburguesa');
const menuM = document.getElementById('menu-movil');

btnH.addEventListener('click', () => {
  const ab = menuM.classList.toggle('abierto');
  btnH.classList.toggle('abierto', ab);
});

menuM.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    menuM.classList.remove('abierto');
    btnH.classList.remove('abierto');
  })
);

document.addEventListener('click', (e) => {
  if (!btnH.contains(e.target) && !menuM.contains(e.target)) {
    menuM.classList.remove('abierto');
    btnH.classList.remove('abierto');
  }
});

/* ── CARRUSEL ── */
let indiceActual = 0;
let noticias = [];
let autoplayTimer = null;

async function cargarNoticias() {
  try {
    const response = await fetch(`${API_URL}/noticias`);
    noticias = await response.json();
    renderCarrusel();
    renderIndicadores();
    iniciarAutoplay();
  } catch (error) {
    console.error('Error al cargar noticias:', error);
  }
}

function renderCarrusel() {
  const track = document.getElementById('carrusel-track');
  track.innerHTML = '';

  noticias.forEach((noticia) => {
    const resumen = noticia.descripcion
      ? noticia.descripcion.substring(0, 100) + (noticia.descripcion.length > 100 ? '...' : '')
      : '';

    const card = document.createElement('div');
    card.classList.add('noticia-card');
    card.innerHTML = `
      ${noticia.imagen ? `<img src="${noticia.imagen}" alt="${noticia.titulo}">` : ''}
      <span class="noticia-categoria">${noticia.categoria || 'Aviso'}</span>
      <h3>${noticia.titulo}</h3>
      <p>${resumen}</p>
      <a href="noticia.html?id=${noticia.id_noticia}" class="noticia-btn-mas">Saber más →</a>
    `;
    track.appendChild(card);
  });

  actualizarPosicion();
}

function renderIndicadores() {
  const indicadores = document.getElementById('indicadores');
  indicadores.innerHTML = '';

  noticias.forEach((_, i) => {
    const punto = document.createElement('span');
    punto.classList.add('indicador');
    if (i === 0) punto.classList.add('activo');
    punto.onclick = () => {
      irA(i);
      reiniciarAutoplay();
    };
    indicadores.appendChild(punto);
  });
}

function actualizarPosicion() {
  const track = document.getElementById('carrusel-track');
  const cards = track.querySelectorAll('.noticia-card');
  if (!cards.length) return;

  const cardWidth = cards[0].offsetWidth + 24;
  track.style.transform = `translateX(-${indiceActual * cardWidth}px)`;

  document.querySelectorAll('.indicador').forEach((p, i) => {
    p.classList.toggle('activo', i === indiceActual);
  });
}

function moverCarrusel(direccion) {
  const track = document.getElementById('carrusel-track');
  const cards = track.querySelectorAll('.noticia-card');
  if (!cards.length) return;

  const maxIndice = Math.max(0, noticias.length - 3);
  indiceActual = Math.min(Math.max(indiceActual + direccion, 0), maxIndice);

  // si llega al final vuelve al inicio
  if (indiceActual >= noticias.length) indiceActual = 0;

  actualizarPosicion();
  reiniciarAutoplay();
}

function irA(index) {
  indiceActual = index;
  actualizarPosicion();
}

function iniciarAutoplay() {
  autoplayTimer = setInterval(() => {
    const maxIndice = Math.max(0, noticias.length - 3);
    indiceActual = indiceActual >= maxIndice ? 0 : indiceActual + 1;
    actualizarPosicion();
  }, 4000); // cada 4 segundos
}

function reiniciarAutoplay() {
  clearInterval(autoplayTimer);
  iniciarAutoplay();
}

cargarNoticias();