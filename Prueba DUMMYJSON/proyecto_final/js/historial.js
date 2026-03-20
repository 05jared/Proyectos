const API = 'https://api-pacientes-uthh.vercel.app/api';

const paciente = JSON.parse(localStorage.getItem('usuario'));
if (!paciente) window.location.href = 'login.html';

const token = localStorage.getItem('token');

document.getElementById('nombre-usuario').textContent =
  `${paciente.nombre_completo || paciente.nombre || ''}`;

document.getElementById('titulo-bienvenida').textContent =
  `Historial de ${paciente.nombre_completo || paciente.nombre || 'Paciente'}`;

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-MX');
}

function formatearHora(hora) {
  if (!hora) return '—';
  return hora.slice(0, 5);
}

async function cargarHistorial() {
  const tbody = document.getElementById('tabla-body');
  const sinConsultas = document.getElementById('sin-consultas');

  try {
    const res = await fetch(`${API}/consultas?id_paciente=${paciente.id_paciente}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();
    const consultas = Array.isArray(data) ? data : (data.consultas ?? []);

    if (consultas.length === 0) {
      tbody.innerHTML = '';
      sinConsultas.style.display = 'block';
      return;
    }

    sinConsultas.style.display = 'none';
    tbody.innerHTML = consultas.map(c => `
      <tr>
        <td>${formatearFecha(c.fecha_consulta)}</td>
        <td class="suave">${formatearHora(c.hora_consulta)}</td>
        <td>${c.motivo_consulta || '—'}</td>
        <td class="suave">${formatearHora(c.consultasalida)}</td>
        <td class="centro">
          <a href="ver_consulta.html?id=${c.id_consulta}" class="btn-tabla btn-editar">Ver detalle</a>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="sys-cargando" style="color:#c53030;">
          Error al cargar el historial. Intenta recargar la página.
        </td>
      </tr>`;
  }
}

cargarHistorial();