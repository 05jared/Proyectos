const API = 'https://api-pacientes-uthh.vercel.app/api';

/* ── Sesión y rol ── */
const usuario = JSON.parse(localStorage.getItem('usuario'));
const token   = localStorage.getItem('token');

if (!usuario || !token) window.location.href = 'login.html';

// Solo recepcionistas — si entra otro rol lo mandamos a su lugar
if (usuario.rol && usuario.rol.toLowerCase() !== 'recepcionista') {
  window.location.href = 'logeoadmin.html';
}

document.getElementById('nombre-usuario').textContent =
  `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

/* ── Toast ── */
function mostrarToast(msg, tipo = 'ok') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast toast-${tipo} visible`;
  setTimeout(() => (toast.className = 'toast'), 3000);
}

/* ── Manejo global de 401 ── */
async function apiFetch(url, opciones = {}) {
  const res = await fetch(url, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(opciones.headers || {}),
    },
  });
  if (res.status === 401) {
    mostrarToast('Sesión expirada. Vuelve a iniciar sesión.', 'error');
    setTimeout(() => cerrarSesion(), 2000);
    throw new Error('401');
  }
  return res;
}

/* ── Skeleton loader ── */
function mostrarSkeleton(cols = 7, filas = 5) {
  const tbody = document.getElementById('tabla-pacientes');
  tbody.innerHTML = Array.from({ length: filas }).map(() => `
    <tr class="skeleton-row">
      ${Array.from({ length: cols }).map(() => `
        <td><div class="skeleton-cell"></div></td>
      `).join('')}
    </tr>
  `).join('');
}

/* ── Tabla (solo lectura) ── */
let todosLosPacientes = [];
let paginaActual = 1;
const POR_PAGINA = 10;

function getTipoBadge(tipo) {
  if (!tipo) return `<span class="badge badge-paciente">—</span>`;
  const t = tipo.toLowerCase();
  if (t.includes('alumno'))     return `<span class="badge badge-doctora">${tipo}</span>`;
  if (t.includes('trabajador')) return `<span class="badge badge-recep">${tipo}</span>`;
  return `<span class="badge badge-paciente">${tipo}</span>`;
}

function renderTabla(data) {
  const tbody = document.getElementById('tabla-pacientes');

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="sys-vacio">
          <div style="padding:2rem;text-align:center">
            <div style="font-size:2rem;margin-bottom:.5rem">🔍</div>
            <strong>Sin resultados</strong><br>
            <span style="font-size:.82rem;color:#6b7a8d">No se encontraron pacientes con ese criterio.</span>
          </div>
        </td>
      </tr>`;
    renderPaginacion(0);
    return;
  }

  // Paginación
  const total  = data.length;
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const fin    = inicio + POR_PAGINA;
  const pagina = data.slice(inicio, fin);

  tbody.innerHTML = pagina.map(p => `
    <tr>
      <td>${p.id_paciente}</td>
      <td><strong>${p.nombre_completo}</strong></td>
      <td class="suave">${p.matricula || '—'}</td>
      <td>${getTipoBadge(p.tipo)}</td>
      <td class="suave">${p.carrera || '—'}</td>
      <td class="suave">${p.grupo || '—'}</td>
      <td class="suave">${p.telefono || '—'}</td>
    </tr>
  `).join('');

  renderPaginacion(total);
}

/* ── Paginación ── */
function renderPaginacion(total) {
  let contenedor = document.getElementById('paginacion');
  if (!contenedor) return;

  const totalPaginas = Math.ceil(total / POR_PAGINA);
  if (totalPaginas <= 1) { contenedor.innerHTML = ''; return; }

  let html = `<div class="paginacion">`;
  html += `<button onclick="irPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPaginas; i++) {
    html += `<button class="${i === paginaActual ? 'pag-activa' : ''}" onclick="irPagina(${i})">${i}</button>`;
  }
  html += `<button onclick="irPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>›</button>`;
  html += `</div><p class="pag-info">Mostrando ${Math.min((paginaActual-1)*POR_PAGINA+1,total)}–${Math.min(paginaActual*POR_PAGINA,total)} de ${total} pacientes</p>`;
  contenedor.innerHTML = html;
}

function irPagina(n) {
  const totalPaginas = Math.ceil(filtrados().length / POR_PAGINA);
  if (n < 1 || n > totalPaginas) return;
  paginaActual = n;
  renderTabla(filtrados());
}

function filtrados() {
  const txt = (document.getElementById('buscador')?.value || '').toLowerCase();
  if (!txt) return todosLosPacientes;
  return todosLosPacientes.filter(p =>
    p.nombre_completo.toLowerCase().includes(txt) ||
    (p.matricula || '').toLowerCase().includes(txt)
  );
}

/* ── Buscador ── */
function buscar(val) {
  paginaActual = 1;
  renderTabla(filtrados());
}

/* ── Cargar pacientes ── */
async function cargarPacientes() {
  mostrarSkeleton();
  try {
    const res  = await apiFetch(`${API}/pacientes`);
    const data = await res.json();
    todosLosPacientes = Array.isArray(data) ? data : (data.pacientes ?? []);
    renderTabla(todosLosPacientes);
  } catch (err) {
    if (err.message === '401') return; // ya manejado
    document.getElementById('tabla-pacientes').innerHTML = `
      <tr><td colspan="7" class="sys-vacio">⚠️ Error al cargar pacientes. Intenta recargar la página.</td></tr>`;
  }
}

/* ── Modal ── */
function abrirModal() {
  document.getElementById('modalOverlay').classList.add('abierto');
  document.getElementById('formPaciente').reset();
  limpiarErrores();
  // Deshabilitar guardar hasta que los campos requeridos tengan valor
  actualizarBotonGuardar();
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('abierto');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });
document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) cerrarModal();
});

/* ── Validación ── */
const camposRequeridos = [
  { inputId: 'inp-nombre',     campoId: 'campoNombre'     },
  { inputId: 'inp-ap-paterno', campoId: 'campoApPaterno'  },
  { inputId: 'inp-sexo',       campoId: 'campoSexo'       },
  { inputId: 'inp-nacimiento', campoId: 'campoNacimiento' },
  { inputId: 'inp-telefono',   campoId: 'campoTelefono'   },
  { inputId: 'inp-matricula',  campoId: 'campoMatricula'  },
];

function limpiarErrores() {
  camposRequeridos.forEach(({ campoId }) =>
    document.getElementById(campoId)?.classList.remove('invalido')
  );
}

// Reactivo: actualiza el botón guardar mientras el usuario escribe
camposRequeridos.forEach(({ inputId }) => {
  document.getElementById(inputId)?.addEventListener('input', actualizarBotonGuardar);
});

function actualizarBotonGuardar() {
  const btn = document.getElementById('btnGuardar');
  const todosLlenos = camposRequeridos.every(({ inputId }) =>
    document.getElementById(inputId)?.value.trim() !== ''
  );
  btn.disabled = !todosLlenos;
  btn.style.opacity = todosLlenos ? '1' : '0.5';
}

function validarFormulario() {
  let ok = true;
  limpiarErrores();
  camposRequeridos.forEach(({ inputId, campoId }) => {
    if (!document.getElementById(inputId).value.trim()) {
      document.getElementById(campoId).classList.add('invalido');
      ok = false;
    }
  });
  const tel = document.getElementById('inp-telefono').value.trim();
  if (tel && !/^\d{10}$/.test(tel)) {
    document.getElementById('campoTelefono').classList.add('invalido');
    ok = false;
  }
  return ok;
}

/* ── Guardar nuevo paciente ── */
async function guardarPaciente() {
  if (!validarFormulario()) return;

  const btn = document.getElementById('btnGuardar');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const payload = {
    nombre:            document.getElementById('inp-nombre').value.trim(),
    apellido_paterno:  document.getElementById('inp-ap-paterno').value.trim(),
    apellido_materno:  document.getElementById('inp-ap-materno').value.trim(),
    sexo:              document.getElementById('inp-sexo').value,
    fecha_nacimiento:  document.getElementById('inp-nacimiento').value,
    telefono:          document.getElementById('inp-telefono').value.trim(),
    matricula:         document.getElementById('inp-matricula').value.trim(),
    carrera:           document.getElementById('inp-carrera').value.trim(),
    contacto_nombre:   document.getElementById('inp-contacto-nombre').value.trim(),
    contacto_telefono: document.getElementById('inp-contacto-tel').value.trim(),
    alergias:          document.getElementById('inp-alergias').value.trim(),
  };

  try {
    const res = await apiFetch(`${API}/pacientes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Error ${res.status}`);
    }

    cerrarModal();
    mostrarToast('Paciente registrado correctamente.', 'ok');
    cargarPacientes();

  } catch (err) {
    if (err.message !== '401') mostrarToast(`Error al guardar: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar paciente';
  }
}

cargarPacientes();