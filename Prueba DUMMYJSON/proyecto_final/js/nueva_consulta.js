const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

const token = localStorage.getItem('token');
const params = new URLSearchParams(window.location.search);
const idConsulta = params.get('id');

document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

if (idConsulta) {
  document.getElementById('titulo-pagina').textContent = 'Editar Consulta';
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
  setTimeout(() => toast.className = 'toast', 3000);
}

// IDs guardados para editar
let idDiagnostico = null;
let idTratamiento = null;

// ── CARGAR PACIENTES ──
async function cargarPacientes() {
  try {
    const data = await fetch(`${API}/pacientes`).then(r => r.json());
    const select = document.getElementById('select-paciente');
    select.innerHTML = '<option value="">Selecciona un paciente...</option>';
    data.forEach(p => {
      select.innerHTML += `<option value="${p.id_paciente}">
        ${p.nombre} ${p.apellido_paterno} ${p.apellido_materno} — ${p.matricula_o_numero_trabajador}
      </option>`;
    });
  } catch (err) {
    console.error('Error al cargar pacientes:', err);
  }
}

// ── CARGAR DATOS SI ES EDICIÓN ──
async function cargarConsulta() {
  if (!idConsulta) return;

  try {
    const consultas = await fetch(`${API}/consultas`).then(r => r.json());
    const c = consultas.find(x => x.id_consulta == idConsulta);
    if (!c) return;

    document.getElementById('select-paciente').value = c.id_paciente;
    document.getElementById('input-fecha').value = c.fecha_consulta?.split('T')[0];
    document.getElementById('input-hora-entrada').value = c.hora_consulta;
    document.getElementById('input-hora-salida').value = c.consultasalida;
    document.getElementById('input-motivo').value = c.motivo_consulta;

    // cargar diagnóstico
    const diagnosticos = await fetch(`${API}/diagnostico`).then(r => r.json());
    const d = diagnosticos.find(x => x.id_consulta == idConsulta);
    if (d) {
      idDiagnostico = d.id_diagnostico;
      document.getElementById('input-diagnostico').value = d.diagnostico || '';
      document.getElementById('input-observaciones').value = d.observaciones || '';

      // cargar tratamiento
      const tratamientos = await fetch(`${API}/tratamiento`).then(r => r.json());
      const t = tratamientos.find(x => x.id_diagnostico == idDiagnostico);
      if (t) {
        idTratamiento = t.id_tratamiento;
        document.getElementById('input-medicamento').value = t.medicamento || '';
        document.getElementById('input-dosis').value = t.dosis || '';
        document.getElementById('input-frecuencia').value = t.frecuencia || '';
        document.getElementById('input-duracion').value = t.duracion || '';
        document.getElementById('input-indicaciones').value = t.indicaciones || '';
      }
    }

  } catch (err) {
    console.error('Error al cargar consulta:', err);
  }
}

// ── GUARDAR TODO ──
async function guardarTodo() {
  const id_paciente = document.getElementById('select-paciente').value;
  const fecha_consulta = document.getElementById('input-fecha').value;
  const hora_consulta = document.getElementById('input-hora-entrada').value;
  const consultasalida = document.getElementById('input-hora-salida').value;
  const motivo_consulta = document.getElementById('input-motivo').value.trim();

  if (!id_paciente || !fecha_consulta || !hora_consulta || !motivo_consulta) {
    mostrarToast('Completa los campos obligatorios de la consulta.', 'error');
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    let consultaId = idConsulta;

    // 1. Guardar o actualizar consulta
    if (idConsulta) {
      await fetch(`${API}/consultas/${idConsulta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_paciente, fecha_consulta, hora_consulta, consultasalida, motivo_consulta })
      });
    } else {
      const res = await fetch(`${API}/consultas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_paciente, fecha_consulta, hora_consulta, consultasalida, motivo_consulta })
      });
      const data = await res.json();
      consultaId = data.id;
    }

    // 2. Guardar o actualizar diagnóstico (si tiene texto)
    const diagnostico = document.getElementById('input-diagnostico').value.trim();
    const observaciones = document.getElementById('input-observaciones').value.trim();

    if (diagnostico) {
      if (idDiagnostico) {
        await fetch(`${API}/diagnostico/${idDiagnostico}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id_consulta: consultaId, diagnostico, observaciones })
        });
      } else {
        const res = await fetch(`${API}/diagnostico`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id_consulta: consultaId, diagnostico, observaciones })
        });
        const data = await res.json();
        idDiagnostico = data.id;
      }
    }

    // 3. Guardar o actualizar tratamiento (si tiene medicamento)
    const medicamento = document.getElementById('input-medicamento').value.trim();
    const dosis = document.getElementById('input-dosis').value.trim();
    const frecuencia = document.getElementById('input-frecuencia').value.trim();
    const duracion = document.getElementById('input-duracion').value.trim();
    const indicaciones = document.getElementById('input-indicaciones').value.trim();

    if (medicamento && idDiagnostico) {
      if (idTratamiento) {
        await fetch(`${API}/tratamiento/${idTratamiento}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id_diagnostico: idDiagnostico, medicamento, dosis, frecuencia, duracion, indicaciones })
        });
      } else {
        await fetch(`${API}/tratamiento`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ id_diagnostico: idDiagnostico, medicamento, dosis, frecuencia, duracion, indicaciones })
        });
      }
    }

    mostrarToast('Consulta guardada correctamente.', 'ok');
    setTimeout(() => window.location.href = 'consultas.html', 1500);

  } catch (err) {
    mostrarToast('Error al guardar.', 'error');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar Consulta';
  }
}

// ── INIT ──
async function init() {
  await cargarPacientes();
  await cargarConsulta();

  if (!idConsulta) {
    document.getElementById('input-fecha').value = new Date().toISOString().split('T')[0];
  }
}

init();