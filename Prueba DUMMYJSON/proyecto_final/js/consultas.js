const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  window.location.href = 'login.html';
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX');
}

async function cargarConsultas() {
  try {
    const data = await fetch(`${API}/consultas`).then(r => r.json());
    const tbody = document.getElementById('tabla-consultas');

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="sys-vacio">No hay consultas registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(c => `
      <tr>
        <td class="suave">${c.id_consulta}</td>
        <td><strong>${c.nombre} ${c.apellido_paterno} ${c.apellido_materno}</strong></td>
        <td>${formatearFecha(c.fecha_consulta)}</td>
        <td>${c.hora_consulta}</td>
        <td>${c.consultasalida}</td>
        <td>${c.motivo_consulta}</td>
        <td class="centro">
          <div class="tabla-acciones" style="justify-content:center">
            <button class="btn-tabla btn-ver" onclick="verConsulta(${c.id_consulta})">Ver</button>
            <button class="btn-tabla btn-editar" onclick="editarConsulta(${c.id_consulta})">Editar</button>
            <button class="btn-tabla btn-eliminar" onclick="eliminarConsulta(${c.id_consulta})">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    document.getElementById('tabla-consultas').innerHTML = `
      <tr><td colspan="7" class="sys-vacio">Error al cargar consultas.</td></tr>
    `;
  }
}

function verConsulta(id) {
  window.location.href = `ver_consulta.html?id=${id}`;
}

function editarConsulta(id) {
  window.location.href = `editar_consulta.html?id=${id}`;
}

async function eliminarConsulta(id) {
  if (!confirm('¿Seguro que deseas eliminar esta consulta?')) return;
  try {
    await fetch(`${API}/consultas/${id}`, { method: 'DELETE' });
    cargarConsultas();
  } catch (err) {
    alert('Error al eliminar.');
  }
}

cargarConsultas();
