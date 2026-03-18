const API = "https://api-pacientes-uthh.vercel.app/api";

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "login.html";

const token = localStorage.getItem("token");

document.getElementById("nombre-usuario").textContent =
  `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;

function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("rol");
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-MX");
}

function mostrarToast(msg, tipo = "ok") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast toast-${tipo} visible`;
  setTimeout(() => (toast.className = "toast"), 3000);
}

let todasLasConsultas = [];

function renderTabla(data) {
  const tbody = document.getElementById("tabla-consultas");

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="sys-vacio">No se encontraron consultas.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td class="suave">${c.id_consulta}</td>
      <td><strong>${c.nombre_completo}</strong></td>
      <td>${formatearFecha(c.fecha_consulta)}</td>
      <td>${c.hora_consulta}</td>
      <td>${c.consultasalida}</td>
      <td>${c.motivo_consulta}</td>
      <td class="centro">
        <div class="tabla-acciones" style="justify-content:center">
          <button class="btn-tabla btn-editar" onclick="editarConsulta(${c.id_consulta})">✏️ Editar</button>
          <button class="btn-tabla btn-eliminar" onclick="eliminarConsulta(${c.id_consulta})">🗑 Eliminar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function buscar(val) {
  const txt = val.toLowerCase();
  const filtradas = todasLasConsultas.filter(c =>
    (c.nombre_completo || "").toLowerCase().includes(txt) ||
    c.motivo_consulta.toLowerCase().includes(txt)
  );
  renderTabla(filtradas);
}

function editarConsulta(id) {
  window.location.href = `nueva_consulta.html?id=${id}`;
}

async function cargarConsultas() {
  try {
    const data = await fetch(`${API}/consultas`).then(r => r.json());
    todasLasConsultas = data;
    renderTabla(data);
  } catch (err) {
    document.getElementById("tabla-consultas").innerHTML = `
      <tr><td colspan="7" class="sys-vacio">Error al cargar consultas.</td></tr>
    `;
  }
}

async function eliminarConsulta(id) {
  if (!confirm("¿Seguro que deseas eliminar esta consulta?")) return;
  try {
    const res = await fetch(`${API}/consultas/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    mostrarToast("Consulta eliminada.", "ok");
    cargarConsultas();
  } catch (err) {
    mostrarToast("Error al eliminar.", "error");
  }
}

cargarConsultas();