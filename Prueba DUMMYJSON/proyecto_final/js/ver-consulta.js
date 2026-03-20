const API = 'https://api-pacientes-uthh.vercel.app/api';

const paciente = JSON.parse(localStorage.getItem('usuario'));
if (!paciente) window.location.href = 'login.html';

const token = localStorage.getItem('token');

document.getElementById('nombre-usuario').textContent =
  paciente.nombre_completo || paciente.nombre || '';

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

// Obtener id de la consulta desde la URL (?id=X)
const params = new URLSearchParams(window.location.search);
const idConsulta = params.get('id');

if (!idConsulta) window.location.href = 'logeopacientes.html';

async function cargarConsulta() {
  try {
    const res = await fetch(`${API}/consultas/${idConsulta}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);

    const c = await res.json();

    document.getElementById('consulta-id').textContent = `#${c.id_consulta}`;
    document.getElementById('con-paciente').textContent     = c.nombre_paciente || c.paciente || paciente.nombre_completo || '—';
    document.getElementById('con-fecha').textContent        = formatearFecha(c.fecha_consulta);
    document.getElementById('con-hora-entrada').textContent = formatearHora(c.hora_consulta);
    document.getElementById('con-hora-salida').textContent  = formatearHora(c.consultasalida);
    document.getElementById('con-motivo').textContent       = c.motivo_consulta || '—';

    cargarDiagnosticos();

  } catch (err) {
    document.querySelector('.sys-card').innerHTML =
      `<p style="color:#c53030;text-align:center;">Error al cargar la consulta. Intenta recargar.</p>`;
  }
}

async function cargarDiagnosticos() {
  const contenedor = document.getElementById('diagnosticos-container');
  const sinDiag    = document.getElementById('sin-diagnosticos');

  try {
    const res = await fetch(`${API}/diagnostico?id_consulta=${idConsulta}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    const diagnosticos = Array.isArray(data) ? data : (data.diagnosticos ?? []);

    if (diagnosticos.length === 0) {
      sinDiag.style.display = 'block';
      return;
    }

    contenedor.innerHTML = diagnosticos.map(d => `
      <div class="sys-card" style="margin-top:1rem;">
        <h2 class="sys-card-titulo">🔬 Diagnóstico</h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div>
            <p style="font-size:.75rem;font-weight:500;text-transform:uppercase;color:var(--texto-suave);margin-bottom:.25rem;">Diagnóstico</p>
            <p style="font-weight:500;">${d.diagnostico || '—'}</p>
          </div>
          <div>
            <p style="font-size:.75rem;font-weight:500;text-transform:uppercase;color:var(--texto-suave);margin-bottom:.25rem;">Tratamiento</p>
            <p style="font-weight:500;">${d.tratamiento || '—'}</p>
          </div>
          <div style="grid-column:span 2;">
            <p style="font-size:.75rem;font-weight:500;text-transform:uppercase;color:var(--texto-suave);margin-bottom:.25rem;">Observaciones</p>
            <p style="font-weight:500;">${d.observaciones || '—'}</p>
          </div>
        </div>
      </div>
    `).join('');

  } catch {
    sinDiag.style.display = 'block';
  }
}

cargarConsulta();