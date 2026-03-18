const API_URL = 'https://api-pacientes-uthh.vercel.app/api';

const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

const btnH = document.getElementById('btn-hamburguesa');
const menuM = document.getElementById('menu-movil');

btnH.addEventListener('click', () => {
  const ab = menuM.classList.toggle('abierto');
  btnH.classList.toggle('abierto', ab);
});

document.addEventListener('click', (e) => {
  if (!btnH.contains(e.target) && !menuM.contains(e.target)) {
    menuM.classList.remove('abierto');
    btnH.classList.remove('abierto');
  }
});

async function cargarNoticia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const data = await fetch(`${API_URL}/noticias`).then(r => r.json());
    const noticia = data.find(n => n.id_noticia == id);

    if (!noticia) {
      document.getElementById('noticia-contenido').innerHTML = `
        <p style="text-align:center;color:var(--texto-suave);padding:60px 0;">Noticia no encontrada.</p>
      `;
      return;
    }

    document.title = `${noticia.titulo} — Servicio Médico UTHH`;

    document.getElementById('noticia-contenido').innerHTML = `
      ${noticia.imagen ? `
        <img src="${noticia.imagen}" alt="${noticia.titulo}"
          style="width:100%;max-height:400px;object-fit:cover;border-radius:8px;margin-bottom:28px;">
      ` : ''}
      <span style="display:inline-block;background:var(--verde-suave);color:var(--verde);
        font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:16px;">
        ${noticia.categoria || 'Aviso'}
      </span>
      <h1 style="font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:700;
        color:var(--azul);margin-bottom:16px;line-height:1.3;">
        ${noticia.titulo}
      </h1>
      <p style="font-size:14px;color:var(--texto-suave);margin-bottom:28px;">
        ${new Date(noticia.fecha).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })}
      </p>
      <div style="font-size:15px;line-height:1.8;color:var(--texto);">
        ${noticia.descripcion}
      </div>
    `;

  } catch (err) {
    document.getElementById('noticia-contenido').innerHTML = `
      <p style="text-align:center;color:var(--texto-suave);padding:60px 0;">Error al cargar la noticia.</p>
    `;
  }
}

cargarNoticia();