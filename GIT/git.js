const MI_USUARIO = '05jared';


fetch(`https://api.github.com/users/${MI_USUARIO}`)
    .then(respuesta => respuesta.json())
    .then(datos => {
        document.getElementById('foto').src = datos.avatar_url;
        
        document.getElementById('nombre').textContent = datos.name;
    
        document.getElementById('biografia').textContent = datos.bio;

        document.getElementById('ubicacion').textContent = datos.location;
    });



fetch(`https://api.github.com/users/${MI_USUARIO}/repos?sort=updated&direction=desc&per_page=6`)
    .then(respuesta => respuesta.json())
    .then(proyectos => {
        
        document.getElementById('lista-proyectos').innerHTML = '';

        proyectos.forEach(proyecto => {
            
            const caja = document.createElement('div');
            caja.className = 'proyecto';
            
            caja.innerHTML = `
                <h3>${proyecto.name}</h3>
                <p>${proyecto.description || 'Sin descripción'}</p>
                <p>${proyecto.stargazers_count} estrellas</p>
                <a href="${proyecto.html_url}" target="_blank">Ver código</a>
            `;
            
            document.getElementById('lista-proyectos').appendChild(caja);
        });
    });



fetch(`https://api.github.com/users/${MI_USUARIO}/followers?per_page=10`)
    .then(respuesta => respuesta.json())
    .then(seguidores => {
        
        document.getElementById('lista-seguidores').innerHTML = '';
        
        seguidores.forEach(seguidor => {
            
            const caja = document.createElement('div');
            caja.className = 'seguidor';
            
            caja.innerHTML = `
                <a href="${seguidor.html_url}" target="_blank">
                    <img src="${seguidor.avatar_url}" alt="${seguidor.login}">
                    <p>${seguidor.login}</p>
                </a>
            `;

            document.getElementById('lista-seguidores').appendChild(caja);
        });
    });

