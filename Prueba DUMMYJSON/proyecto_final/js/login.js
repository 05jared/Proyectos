const API = 'https://api-pacientes-uthh.vercel.app/api';

let esPaciente = false;

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

const btnMenu = document.getElementById('btn-hamburguesa');
const menuMov = document.getElementById('menu-movil');

btnMenu.addEventListener('click', () => {
  menuMov.classList.toggle('abierto');
  btnMenu.classList.toggle('abierto');
});

document.addEventListener('click', (e) => {
  if (!btnMenu.contains(e.target) && !menuMov.contains(e.target)) {
    menuMov.classList.remove('abierto');
    btnMenu.classList.remove('abierto');
  }
});

document.getElementById('btn-toggle-pass').addEventListener('click', () => {
  const pass = document.getElementById('password');
  pass.type = pass.type === 'password' ? 'text' : 'password';
});

function detectarTipo(val) {
  esPaciente = /^\d{5,}$/.test(val.trim());
  const campoPass = document.getElementById('campo-password');
  const hint = document.getElementById('login-hint');

  if (esPaciente) {
    campoPass.style.display = 'none';
    hint.classList.add('visible');
    document.getElementById('password').value = '';
  } else {
    campoPass.style.display = 'flex';
    hint.classList.remove('visible');
  }
}

function validar() {
  const user = document.getElementById('usuario').value.trim();
  const pass = document.getElementById('password').value.trim();
  let ok = true;

  if (!user) {
    document.getElementById('usuario').classList.add('input-error');
    document.getElementById('error-usuario').classList.add('visible');
    ok = false;
  } else {
    document.getElementById('usuario').classList.remove('input-error');
    document.getElementById('error-usuario').classList.remove('visible');
  }

  if (!esPaciente && !pass) {
    document.getElementById('password').classList.add('input-error');
    document.getElementById('error-password').classList.add('visible');
    ok = false;
  } else {
    document.getElementById('password').classList.remove('input-error');
    document.getElementById('error-password').classList.remove('visible');
  }

  return ok;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  document.getElementById('login-error').classList.remove('visible');
  if (!validar()) return;

  const user = document.getElementById('usuario').value.trim();
  const pass = document.getElementById('password').value.trim();
  const btn = document.getElementById('btn-login');

  btn.disabled = true;
  btn.textContent = 'Verificando...';

  try {
    if (esPaciente) {
      const data = await fetch(`${API}/pacientes`).then(r => r.json());
      const p = data.find(x => x.matricula_o_numero_trabajador == user);

      if (p) {
        localStorage.setItem('usuario', JSON.stringify(p));
        localStorage.setItem('rol', 'paciente');
        window.location.href = 'historial.html';
      } else {
        mostrarError('Matrícula no encontrada.');
      }

    } else {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: user, contrasena: pass })
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarError(data.message || 'Credenciales inválidas.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('rol', data.usuario.rol);

      if (data.usuario.rol === 'Administrador') {
        window.location.href = 'logeoadmin.html';
      } else if (data.usuario.rol === 'Recepcionista') {
        window.location.href = 'logeoRecepcion.html';
      } else {
        window.location.href = 'plantilla.html';
      }
    }

  } catch (err) {
    mostrarError('No se pudo conectar al servidor.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ingresar al Sistema';
  }
});

function mostrarError(msg) {
  document.getElementById('login-error-msg').textContent = msg;
  document.getElementById('login-error').classList.add('visible');
}

document.getElementById('usuario').addEventListener('input', () => {
  document.getElementById('login-error').classList.remove('visible');
});

document.getElementById('password').addEventListener('input', () => {
  document.getElementById('login-error').classList.remove('visible');
  document.getElementById('password').classList.remove('input-error');
  document.getElementById('error-password').classList.remove('visible');
});