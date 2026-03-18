const API = 'https://api-pacientes-uthh.vercel.app/api';

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

function getRolBadge(rol) {
  if (rol === 'Administrador') return `<span class="badge badge-admin">Administrador</span>`;
  if (rol === 'Recepcionista') return `<span class="badge badge-recep">Recepcionista</span>`;
  if (rol === 'Doctora') return `<span class="badge badge-doctora">Doctora</span>`;
  return `<span class="badge badge-paciente">${rol}</span>`;
}

async function cargarUsuarios() {
  try {
    const data = await fetch(`${API}/usuarios`).then(r => r.json());
    const tbody = document.getElementById('tabla-usuarios');

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="sys-vacio">No hay usuarios registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(u => `
      <tr>
        <td><strong>${u.nombre} ${u.apellido_paterno} ${u.apellido_materno}</strong></td>
        <td class="suave">${u.correo}</td>
        <td>${getRolBadge(u.rol)}</td>
        <td class="centro">
          <div class="tabla-acciones" style="justify-content:center">
            <button class="btn-tabla btn-editar" onclick="editarUsuario(${u.id_usuarios})">✏️ Editar</button>
            <button class="btn-tabla btn-eliminar" onclick="eliminarUsuario(${u.id_usuarios})">🗑 Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    document.getElementById('tabla-usuarios').innerHTML = `
      <tr><td colspan="4" class="sys-vacio">Error al cargar usuarios.</td></tr>
    `;
  }
}

function editarUsuario(id) {
  window.location.href = `registrar_usuario.html?id=${id}`;
}

async function eliminarUsuario(id) {
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
  try {
    const res = await fetch(`${API}/usuarios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    mostrarToast('Usuario eliminado.', 'ok');
    cargarUsuarios();
  } catch (err) {
    mostrarToast('Error al eliminar.', 'error');
  }
}

cargarUsuarios();