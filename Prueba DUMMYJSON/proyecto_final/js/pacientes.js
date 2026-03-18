const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

const token = localStorage.getItem('token');

document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

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

let todosLosPacientes = [];

function getTipoBadge(tipo) {
  if (!tipo) return `<span class="badge badge-paciente">—</span>`;
  const t = tipo.toLowerCase();
  if (t.includes('alumno')) return `<span class="badge badge-doctora">${tipo}</span>`;
  if (t.includes('trabajador')) return `<span class="badge badge-recep">${tipo}</span>`;
  return `<span class="badge badge-paciente">${tipo}</span>`;
}

function renderTabla(data) {
  const tbody = document.getElementById('tabla-pacientes');

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="sys-vacio">No se encontraron pacientes.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(p => `
    <tr>
      <td><strong>${p.nombre_completo}</strong></td>
      <td class="suave">${p.matricula || '—'}</td>
      <td>${getTipoBadge(p.tipo)}</td>
      <td class="suave">${p.carrera || '—'}</td>
      <td class="suave">${p.grupo || '—'}</td>
      <td class="centro">
        <div class="tabla-acciones" style="justify-content:center">
          <button class="btn-tabla btn-editar" onclick="editarPaciente(${p.id_paciente})">✏️ Editar</button>
          <button class="btn-tabla btn-eliminar" onclick="eliminarPaciente(${p.id_paciente})">🗑 Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function cargarPacientes() {
  try {
    const data = await fetch(`${API}/pacientes`).then(r => r.json());
    todosLosPacientes = data;
    renderTabla(data);
  } catch (err) {
    document.getElementById('tabla-pacientes').innerHTML = `
      <tr><td colspan="6" class="sys-vacio">Error al cargar pacientes.</td></tr>
    `;
  }
}

function buscar(val) {
  const txt = val.toLowerCase();
  const filtrados = todosLosPacientes.filter(p =>
    p.nombre_completo.toLowerCase().includes(txt) ||
    (p.matricula || '').toLowerCase().includes(txt)
  );
  renderTabla(filtrados);
}

function editarPaciente(id) {
  window.location.href = `registro_paciente.html?id=${id}`;
}

async function eliminarPaciente(id) {
  if (!confirm('¿Seguro que deseas eliminar este paciente?')) return;
  try {
    const res = await fetch(`${API}/pacientes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    mostrarToast('Paciente eliminado.', 'ok');
    cargarPacientes();
  } catch (err) {
    mostrarToast('Error al eliminar.', 'error');
  }
}

cargarPacientes();