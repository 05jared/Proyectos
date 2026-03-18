const API = 'https://api-pacientes-uthh.vercel.app/api';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dffswlrkh/image/upload';
const CLOUDINARY_PRESET = 'Jared11';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

const token = localStorage.getItem('token');

document.getElementById('nombre-usuario').textContent =
  `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

function mostrarToast(msg, tipo = 'ok') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${tipo} visible`;
  setTimeout(() => (toast.className = 'toast'), 3000);
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-MX');
}

let idEditando = null;

// ── TABLA ──
async function cargarNoticias() {
  try {
    const data = await fetch(`${API}/noticias`).then(r => r.json());
    const tbody = document.getElementById('tabla-noticias');

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="sys-vacio">No hay noticias.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(n => `
      <tr>
        <td>
          ${n.imagen
            ? `<img src="${n.imagen}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;">`
            : '—'}
        </td>
        <td><strong>${n.titulo}</strong></td>
        <td class="suave" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${n.descripcion}
        </td>
        <td class="suave">${formatearFecha(n.fecha_publicacion)}</td>
        <td class="centro">
          <div class="tabla-acciones" style="justify-content:center">
            <button class="btn-tabla btn-editar" onclick="editarNoticia(${n.id_noticia})">✏️ Editar</button>
            <button class="btn-tabla btn-eliminar" onclick="eliminarNoticia(${n.id_noticia})">🗑 Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    document.getElementById('tabla-noticias').innerHTML =
      `<tr><td colspan="5" class="sys-vacio">Error al cargar noticias.</td></tr>`;
  }
}

// ── MODAL ──
function abrirModal() {
  idEditando = null;
  document.getElementById('modal-titulo').textContent = 'Nueva Noticia';
  document.getElementById('input-titulo').value = '';
  document.getElementById('input-descripcion').value = '';
  document.getElementById('input-link-imagen').value = '';
  document.getElementById('input-imagen-url').value = '';
  document.getElementById('preview-imagen').style.display = 'none';
  document.getElementById('modal-noticia').classList.add('visible');
}

function cerrarModal() {
  document.getElementById('modal-noticia').classList.remove('visible');
  idEditando = null;
}

async function editarNoticia(id) {
  try {
    const data = await fetch(`${API}/noticias`).then(r => r.json());
    const n = data.find(x => x.id_noticia == id);
    if (!n) return;

    idEditando = id;
    document.getElementById('modal-titulo').textContent = 'Editar Noticia';
    document.getElementById('input-titulo').value = n.titulo;
    document.getElementById('input-descripcion').value = n.descripcion;
    document.getElementById('input-imagen-url').value = n.imagen || '';

    if (n.imagen) {
      document.getElementById('img-preview').src = n.imagen;
      document.getElementById('preview-imagen').style.display = 'block';
    } else {
      document.getElementById('preview-imagen').style.display = 'none';
    }

    document.getElementById('modal-noticia').classList.add('visible');
  } catch (err) {
    mostrarToast('Error al cargar noticia.', 'error');
  }
}

// ── SUBIR IMAGEN A CLOUDINARY ──
async function subirImagen() {
  const link = document.getElementById('input-link-imagen').value.trim();
  if (!link) {
    mostrarToast('Pega un link de imagen primero.', 'error');
    return;
  }

  const btn = document.getElementById('btn-subir');
  btn.disabled = true;
  btn.textContent = 'Subiendo...';

  try {
    const formData = new FormData();
    formData.append('file', link);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.secure_url) {
      document.getElementById('input-imagen-url').value = data.secure_url;
      document.getElementById('img-preview').src = data.secure_url;
      document.getElementById('preview-imagen').style.display = 'block';
      mostrarToast('Imagen subida a Cloudinary.', 'ok');
    } else {
      throw new Error();
    }

  } catch (err) {
    mostrarToast('Error al subir imagen. Verifica el link.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '☁ Subir';
  }
}

// ── GUARDAR ──
async function guardarNoticia() {
  const titulo = document.getElementById('input-titulo').value.trim();
  const descripcion = document.getElementById('input-descripcion').value.trim();
  const imagen = document.getElementById('input-imagen-url').value.trim();

  if (!titulo || !descripcion) {
    mostrarToast('Título y descripción son obligatorios.', 'error');
    return;
  }

  const body = { titulo, descripcion, imagen };

  try {
    if (idEditando) {
      await fetch(`${API}/noticias/${idEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      mostrarToast('Noticia actualizada.', 'ok');
    } else {
      await fetch(`${API}/noticias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      mostrarToast('Noticia creada.', 'ok');
    }

    cerrarModal();
    cargarNoticias();

  } catch (err) {
    mostrarToast('Error al guardar.', 'error');
  }
}

// ── ELIMINAR ──
async function eliminarNoticia(id) {
  if (!confirm('¿Seguro que deseas eliminar esta noticia?')) return;
  try {
    const res = await fetch(`${API}/noticias/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    mostrarToast('Noticia eliminada.', 'ok');
    cargarNoticias();
  } catch (err) {
    mostrarToast('Error al eliminar.', 'error');
  }
}

cargarNoticias();