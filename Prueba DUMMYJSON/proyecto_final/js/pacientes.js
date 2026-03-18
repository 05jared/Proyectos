const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  window.location.href = 'login.html';
}

let todosLosPacientes = [];

function getTipoBadge(idTipo) {
  if (idTipo == 1) return `<span class="badge badge-doctora">Alumno</span>`;
  if (idTipo == 2) return `<span class="badge badge-recep">Trabajador</span>`;
  return `<span class="badge badge-paciente">${idTipo}</span>`;
}

function renderTabla(data) {
  const tbody = document.getElementById('tabla-pacientes');

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="sys-vacio">No se encontraron pacientes.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(p => `
    <tr>
      <td><strong>${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}</strong></td>
      <td class="suave">${p.matricula_o_numero_trabajador}</td>
      <td>${getTipoBadge(p.tipopaciente)}</td>
      <td class="suave">${p.Carrera || '—'}</td>
      <td class="suave">${p.Grupo || '—'}</td>
      <td class="centro">
        <div class="tabla-acciones" style="justify-content:center">
          <button class="btn-tabla btn-editar" onclick="editarPaciente(${p.id_paciente})">Editar</button>
          <button class="btn-tabla btn-eliminar" onclick="eliminarPaciente(${p.id_paciente})">Eliminar</button>
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
    `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno}`.toLowerCase().includes(txt) ||
    p.matricula_o_numero_trabajador.toLowerCase().includes(txt)
  );
  renderTabla(filtrados);
}

function editarPaciente(id) {
  window.location.href = `editar_paciente.html?id=${id}`;
}

async function eliminarPaciente(id) {
  if (!confirm('¿Seguro que deseas eliminar este paciente?')) return;
  try {
    await fetch(`${API}/pacientes/${id}`, { method: 'DELETE' });
    cargarPacientes();
  } catch (err) {
    alert('Error al eliminar.');
  }
}

cargarPacientes();