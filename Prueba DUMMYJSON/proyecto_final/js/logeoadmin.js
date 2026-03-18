const API = 'https://api-pacientes-uthh.vercel.app/api';

// verificar sesion
const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

// mostrar nombre y rol
document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;
document.getElementById('titulo-bienvenida').textContent = `Bienvenido, ${usuario.nombre} ${usuario.apellido_paterno}`;
document.getElementById('rol-usuario').textContent = usuario.rol;

// cargar stats
async function cargarStats() {
  try {
    const [pacientes, consultas, usuarios] = await Promise.all([
      fetch(`${API}/pacientes`).then(r => r.json()),
      fetch(`${API}/consultas`).then(r => r.json()),
      fetch(`${API}/usuarios`).then(r => r.json())
    ]);

    document.getElementById('total-pacientes').textContent = pacientes.length;
    document.getElementById('total-consultas').textContent = consultas.length;
    document.getElementById('total-usuarios').textContent = usuarios.length;

  } catch (err) {
    console.error('Error al cargar stats:', err);
  }
}

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  window.location.href = 'login.html';
}

cargarStats();