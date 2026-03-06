function iniciarSesion() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const alerta = document.getElementById("alerta");

  if (!email || !password) {
    alerta.textContent = "Por favor completa todos los campos.";
    alerta.style.display = "flex";
    return;
  }

  const usuarios = [
    { correo: "admin@uthh.edu.mx",  contrasena: "admin123",  rol: "administrador" },
    { correo: "medico@uthh.edu.mx", contrasena: "medico123", rol: "medico"        },
    { correo: "recep@uthh.edu.mx",  contrasena: "recep123",  rol: "recepcion"     },
    { matricula: "20230001",        contrasena: "pac123",    rol: "paciente"      },
  ];

  const usuario = usuarios.find(u =>
    (u.correo === email || u.matricula === email) && u.contrasena === password
  );

  if (!usuario) {
    alerta.textContent = "Correo/matrícula o contraseña incorrectos.";
    alerta.style.display = "flex";
    return;
  }

  alerta.style.display = "none";
  sessionStorage.setItem("usuario", JSON.stringify(usuario));

  if (usuario.rol === "paciente") {
    window.location.href = "historial.html";
  } else if (usuario.rol === "recepcion") {
    window.location.href = "plantilla_recepcion.html";
  } else {
    window.location.href = "plantilla.html";
  }
}
