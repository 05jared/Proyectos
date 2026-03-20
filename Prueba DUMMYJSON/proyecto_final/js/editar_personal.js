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

function mostrarToast(msg, tipo = 'ok') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${tipo} visible`;
  setTimeout(() => (toast.className = 'toast'), 3000);
}

// Cargar datos actuales del paciente en el formulario
function cargarDatos() {
  document.getElementById('nombre').value           = paciente.nombre || '';
  document.getElementById('apellido-paterno').value = paciente.apellido_paterno || '';
  document.getElementById('apellido-materno').value = paciente.apellido_materno || '';
  document.getElementById('fecha-nacimiento').value = paciente.fecha_nacimiento
    ? paciente.fecha_nacimiento.slice(0, 10) : '';
  document.getElementById('correo').value           = paciente.correo || '';
  document.getElementById('telefono').value         = paciente.telefono || '';
}

async function guardarDatos() {
  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const body = {
    nombre:           document.getElementById('nombre').value.trim(),
    apellido_paterno: document.getElementById('apellido-paterno').value.trim(),
    apellido_materno: document.getElementById('apellido-materno').value.trim(),
    fecha_nacimiento: document.getElementById('fecha-nacimiento').value,
    correo:           document.getElementById('correo').value.trim(),
    telefono:         document.getElementById('telefono').value.trim(),
  };

  try {
    const res = await fetch(`${API}/pacientes/${paciente.id_paciente}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Error ${res.status}`);
    }

    // Actualizar localStorage con los nuevos datos
    const actualizado = { ...paciente, ...body,
      nombre_completo: `${body.nombre} ${body.apellido_paterno} ${body.apellido_materno}`.trim()
    };
    localStorage.setItem('usuario', JSON.stringify(actualizado));

    mostrarToast('Datos actualizados correctamente.', 'ok');
    setTimeout(() => window.location.href = 'logeopacientes.html', 1500);

  } catch (err) {
    mostrarToast(`Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar Cambios';
  }
}

cargarDatos();