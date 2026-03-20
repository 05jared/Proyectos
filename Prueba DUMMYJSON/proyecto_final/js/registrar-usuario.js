const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

const token = localStorage.getItem('token');
const params = new URLSearchParams(window.location.search);
const idUsuario = params.get('id');

document.getElementById('nombre-usuario').textContent =
  `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

if (idUsuario) {
  document.getElementById('titulo-pagina').textContent = 'Editar Usuario';
  document.getElementById('hint-pass').textContent = 'Deja vacío para no cambiar la contraseña.';
}

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

async function cargarUsuario() {
  if (!idUsuario) return;
  try {
    const data = await fetch(`${API}/usuarios`).then(r => r.json());
    const u = data.find(x => x.id_usuarios == idUsuario);
    if (!u) return;

    document.getElementById('nombre').value           = u.nombre || '';
    document.getElementById('apellido_paterno').value  = u.apellido_paterno || '';
    document.getElementById('apellido_materno').value  = u.apellido_materno || '';
    document.getElementById('correo').value            = u.correo || '';
    document.getElementById('rol').value               = u.rol || '';
  } catch (err) {
    console.error('Error al cargar usuario:', err);
  }
}

async function registrarUsuario() {
  const nombre           = document.getElementById('nombre').value.trim();
  const apellido_paterno = document.getElementById('apellido_paterno').value.trim();
  const apellido_materno = document.getElementById('apellido_materno').value.trim();
  const correo           = document.getElementById('correo').value.trim();
  const contrasena       = document.getElementById('contrasena').value.trim();
  const rol              = document.getElementById('rol').value;

  if (!nombre || !apellido_paterno || !correo || !rol) {
    mostrarToast('Completa los campos obligatorios.', 'error');
    return;
  }

  if (!idUsuario && !contrasena) {
    mostrarToast('La contraseña es obligatoria.', 'error');
    return;
  }

  const btn = document.getElementById('btn-registrar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const body = { nombre, apellido_paterno, apellido_materno, correo, rol };
  if (contrasena) body.contrasena = contrasena;

  try {
    if (idUsuario) {
      const res = await fetch(`${API}/usuarios/${idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `Error ${res.status}`);
      }
      mostrarToast('Usuario actualizado.', 'ok');
    } else {
      const res = await fetch(`${API}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errBody = await res.text();
        console.error('Respuesta API (400):', errBody);
        let errJson = {};
        try { errJson = JSON.parse(errBody); } catch {}
        throw new Error(errJson.message || errJson.error || errJson.msg || errBody || `Error ${res.status}`);
      }
      mostrarToast('Usuario registrado.', 'ok');
    }

    setTimeout(() => window.location.href = 'usuarios.html', 1500);

  } catch (err) {
    console.error('Error al guardar usuario:', err);
    mostrarToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '✔ Registrar usuario';
  }
}

cargarUsuario();