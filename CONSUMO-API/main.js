const API= "https://equipo5uthh.grupoahost.com/api/get_pacientes.php";

fetch(API)
    .then(response => response.json())
    .then(data => {
        const pacientes = data.pacientes;
        mostrarpacientes(pacientes);

    })
    .catch(error => {

            console.error("Error al cargar los pacientes:", error);
            alert("Error al cargar los pacientes.");

    }) ;
    const container = document.getElementById("pacientes-contenedor");
    
    function mostrarpacientes(pacientes) {
        container.innerHTML = "";

        pacientes.forEach(paciente => {

          const NombreC = `${paciente.nombre} ${paciente.apellido_paterno} ${paciente.apellido_materno}`;  

           const card = `
            <div class="card">
                <img 
                  src="paciente.jpg" 
                  alt="Paciente"
                  class="pacienteimg"
                />
                <h3>${NombreC}</h3>
                <p><strong>ID:</strong> ${paciente.id_paciente}</p>
                <p><strong>Matrícula:</strong> ${paciente.matricula_o_numero_trabajador}</p>
                <p><strong>Carrera:</strong> ${paciente.Carrera}</p>
                <p><strong>Grupo:</strong> ${paciente.Grupo}</p>
            </div>
        `;
        container.innerHTML += card;
        });

    };