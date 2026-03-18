const API = 'https://api-pacientes-uthh.vercel.app/api';

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) window.location.href = 'login.html';

// mostrar datos actuales
document.getElementById('nombre-usuario').textContent = `${usuario.nombre} ${usuario.apellido_paterno} (${usuario.rol})`;
document.getElementById('input-nombre').value = `${usuario.nombre} ${usuario.apellido_paterno} ${usuario.apellido_materno}`;
document.getElementById('input-correo').value = usuario.correo;
document.getElementById('input-rol').value = usuario.rol;

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('rol');
  window.location.href = 'login.html';
}

async function guardarCambios() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const correo = document.getElementById('input-correo').value.trim();
  const password = document.getElementById('input-password').value.trim();

  if (!nombre || !correo) {
    alert('Nombre y correo son obligatorios.');
    return;
  }

  const body = {
    nombre: usuario.nombre,
    apellido_paterno: usuario.apellido_paterno,
    apellido_materno: usuario.apellido_materno,
    correo,
    contrasena: password || usuario.contrasena,
    rol: usuario.rol
  };

  try {
    await fetch(`${API}/usuarios/${usuario.id_usuarios}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    // actualizar localStorage
    const actualizado = { ...usuario, correo, contrasena: body.contrasena };
    localStorage.setItem('usuario', JSON.stringify(actualizado));

    document.getElementById('msg-perfil').style.display = 'block';
    setTimeout(() => {
      document.getElementById('msg-perfil').style.display = 'none';
    }, 3000);

  } catch (err) {
    alert('Error al guardar cambios.');
  }
}