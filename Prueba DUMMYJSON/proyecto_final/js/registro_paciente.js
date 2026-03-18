const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

const token = localStorage.getItem('token');
const params = new URLSearchParams(window.location.search);
const idPaciente = params.get('id');

document.getElementById('nombre-usuario').textContent =
  `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

if (idPaciente) {
  document.getElementById('titulo-pagina').textContent = 'Editar Paciente';
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

function mostrarCamposAlumno() {
  const tipo = document.getElementById('input-tipo');
  const seleccionado = tipo.options[tipo.selectedIndex].text.toLowerCase();
  const bloque = document.getElementById('bloque-alumno');
  bloque.style.display = seleccionado.includes('alumno') ? 'block' : 'none';
}

// ── CARGAR TIPOS DE PACIENTE ──
async function cargarTipos() {
  try {
    const data = await fetch(`${API}/tipopacientes`).then(r => r.json());
    const select = document.getElementById('input-tipo');
    data.forEach(t => {
      select.innerHTML += `<option value="${t.idtipopacientes}">${t.descripcion}</option>`;
    });
  } catch (err) {
    console.error('Error al cargar tipos:', err);
  }
}

// ── CARGAR DATOS SI ES EDICIÓN ──
async function cargarPaciente() {
  if (!idPaciente) return;

  try {
    const data = await fetch(`${API}/pacientes/${idPaciente}`).then(r => r.json());
    if (!data) return;

    document.getElementById('input-nombre').value = data.nombre || '';
    document.getElementById('input-apellido-paterno').value = data.apellido_paterno || '';
    document.getElementById('input-apellido-materno').value = data.apellido_materno || '';
    document.getElementById('input-fecha-nacimiento').value = data.fecha_nacimiento?.split('T')[0] || '';
    document.getElementById('input-sexo').value = data.sexo || '';
    document.getElementById('input-correo').value = data.correo || '';
    document.getElementById('input-telefono').value = data.telefono || '';
    document.getElementById('input-direccion').value = data.direccion || '';
    document.getElementById('input-matricula').value = data.matricula || '';

    // tipo paciente
    const select = document.getElementById('input-tipo');
    for (let opt of select.options) {
      if (opt.text.toLowerCase() === data.tipo?.toLowerCase()) {
        select.value = opt.value;
        break;
      }
    }

    mostrarCamposAlumno();

    document.getElementById('input-carrera').value = data.carrera || '';
    document.getElementById('input-cuatrimestre').value = data.cuatrimestre || '';
    document.getElementById('input-grupo').value = data.grupo || '';

  } catch (err) {
    console.error('Error al cargar paciente:', err);
  }
}

// ── GUARDAR ──
async function guardarPaciente() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const apellido_paterno = document.getElementById('input-apellido-paterno').value.trim();
  const apellido_materno = document.getElementById('input-apellido-materno').value.trim();
  const fecha_nacimiento = document.getElementById('input-fecha-nacimiento').value;
  const sexo = document.getElementById('input-sexo').value;
  const correo = document.getElementById('input-correo').value.trim();
  const telefono = document.getElementById('input-telefono').value.trim();
  const direccion = document.getElementById('input-direccion').value.trim();
  const tipopaciente = document.getElementById('input-tipo').value;
  const matricula_o_numero_trabajador = document.getElementById('input-matricula').value.trim();
  const Carrera = document.getElementById('input-carrera').value;
  const Cuatrimestre = document.getElementById('input-cuatrimestre').value;
  const Grupo = document.getElementById('input-grupo').value;

  if (!nombre || !apellido_paterno || !fecha_nacimiento || !sexo ||
      !tipopaciente || !matricula_o_numero_trabajador) {
    mostrarToast('Completa los campos obligatorios.', 'error');
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  btn.textContent = 'Guardando...';

  const body = {
    nombre, apellido_paterno, apellido_materno,
    fecha_nacimiento, sexo, correo, telefono, direccion,
    tipopaciente, matricula_o_numero_trabajador,
    Carrera, Cuatrimestre, Grupo
  };

  try {
    if (idPaciente) {
      await fetch(`${API}/pacientes/${idPaciente}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      mostrarToast('Paciente actualizado correctamente.', 'ok');
    } else {
      const res = await fetch(`${API}/pacientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar');
      mostrarToast('Paciente registrado correctamente.', 'ok');
    }

    setTimeout(() => window.location.href = 'pacientes.html', 1500);

  } catch (err) {
    mostrarToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Guardar Paciente';
  }
}

// ── INIT ──
async function init() {
  await cargarTipos();
  await cargarPaciente();
}

init();