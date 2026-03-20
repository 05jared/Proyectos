const API_URL = 'https://api-pacientes-uthh.vercel.app/api';
const NEWSDATA_KEY = 'pub_b6479f60221e4951bc4741f196146870';

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

/* Trae las noticias internas del sistema */
async function obtenerNoticiasInternas() {
  try {
    const response = await fetch(`${API_URL}/noticias`);
    const data = await response.json();
    // Normaliza al formato común
    return data.map(n => ({
      titulo:      n.titulo,
      descripcion: n.descripcion || '',
      imagen:      n.imagen || null,
      categoria:   n.categoria || 'Aviso',
      link:        `noticia.html?id=${n.id_noticia}`,
      externo:     false
    }));
  } catch (error) {
    console.error('Error al cargar noticias internas:', error);
    return [];
  }
}

/* Trae noticias de salud desde NewsData.io */
async function obtenerNoticiasExternas() {
  try {
    const url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&category=health&language=es&country=mx`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) return [];

    // Toma máximo 6 noticias externas y normaliza al mismo formato
    return data.results.slice(0, 6).map(n => ({
      titulo:      n.title || 'Sin título',
      descripcion: n.description || n.content || '',
      imagen:      n.image_url || null,
      categoria:   'Salud',
      link:        n.link || '#',
      externo:     true
    }));
  } catch (error) {
    console.error('Error al cargar noticias externas (NewsData):', error);
    return [];
  }
}

/* Carga ambas fuentes y las combina */
async function cargarNoticias() {
  const [internas, externas] = await Promise.all([
    obtenerNoticiasInternas(),
    obtenerNoticiasExternas()
  ]);

  // Primero las del consultorio, luego las de salud general
  noticias = [...internas, ...externas];

  if (noticias.length === 0) {
    document.getElementById('carrusel-track').innerHTML =
      '<p style="color:var(--texto-suave);padding:40px;">No hay noticias disponibles.</p>';
    return;
  }

  renderCarrusel();
  renderIndicadores();
  iniciarAutoplay();
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

    // Badge diferente para noticias externas
    const badgeExtra = noticia.externo
      ? '<span class="noticia-fuente">🌐 Noticias de Salud</span>'
      : '';

    card.innerHTML = `
      ${noticia.imagen
        ? `<img src="${noticia.imagen}" alt="${noticia.titulo}" onerror="this.style.display='none'">`
        : ''}
      <span class="noticia-categoria">${noticia.categoria}</span>
      ${badgeExtra}
      <h3>${noticia.titulo}</h3>
      <p>${resumen}</p>
      <a href="${noticia.link}"
         class="noticia-btn-mas"
         ${noticia.externo ? 'target="_blank" rel="noopener noreferrer"' : ''}>
        Saber más →
      </a>
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
  indiceActual = indiceActual + direccion;

  // Loop infinito: si pasa del final vuelve al inicio y viceversa
  if (indiceActual > maxIndice) indiceActual = 0;
  if (indiceActual < 0) indiceActual = maxIndice;

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
  }, 4000);
}

function reiniciarAutoplay() {
  clearInterval(autoplayTimer);
  iniciarAutoplay();
}

cargarNoticias();