const urlBaseApi = "https://api.pokemontcg.io/v2";

// ===== PAGINACIÓN =====
let paginaActual = 1;
const limitePorPagina = 12;
let totalCartas = 0;


let filtroNombre = "";
let filtroTipo = "";
let filtroSet = "";


const traducirTipo = (tipo) => {
    const traducciones = {
        "Fire": "Fuego",
        "Water": "Agua",
        "Grass": "Planta",
        "Lightning": "Eléctrico",
        "Psychic": "Psíquico",
        "Darkness": "Oscuro",
        "Fighting": "Lucha",
        "Metal": "Metal",
        "Fairy": "Hada",
        "Dragon": "Dragón",
        "Colorless": "Incoloro"
    };
    return traducciones[tipo] || tipo;
};


const cargarTipos = () => {
    fetch(`${urlBaseApi}/types`)
        .then(res => res.json())
        .then(data => {
            const selectTipo = document.getElementById("filtroTipo");
            selectTipo.innerHTML = '<option value="">Todos los tipos</option>';
            
            data.data.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo;
                option.textContent = traducirTipo(tipo);
                selectTipo.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar tipos:', error);
        });
};


const cargarSets = () => {
    fetch(`${urlBaseApi}/sets`)
        .then(res => res.json())
        .then(data => {
            const selectSet = document.getElementById("filtroSet");
            selectSet.innerHTML = '<option value="">Todos los sets</option>';
            
            data.data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            
            data.data.forEach(set => {
                const option = document.createElement("option");
                option.value = set.id;
                option.textContent = `${set.name} (${set.releaseDate})`;
                selectSet.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al cargar sets:', error);
        });
};


const cargarCartas = () => {
    mostrarCargador();
    
    let consultas = [];
    
    if (filtroNombre) consultas.push(`name:${filtroNombre}*`);
    if (filtroTipo) consultas.push(`types:${filtroTipo}`);
    if (filtroSet) consultas.push(`set.id:${filtroSet}`);
    
    const consultaFinal = consultas.length > 0 ? `&q=${consultas.join(" ")}` : "";
    
    fetch(`${urlBaseApi}/cards?page=${paginaActual}&pageSize=${limitePorPagina}${consultaFinal}`)
        .then(res => res.json())
        .then(data => {
            totalCartas = data.totalCount;
            mostrarCartas(data.data);
            actualizarInfoPagina();
            ocultarCargador();
        })
        .catch(error => {
            console.error('Error al cargar cartas:', error);
            document.getElementById("contenedorCartas").innerHTML = 
                "<p style='color: white; text-align: center;'>Error al cargar las cartas. Por favor, intenta de nuevo.</p>";
            ocultarCargador();
        });
};


const mostrarCartas = (cartas) => {
    const contenedor = document.getElementById("contenedorCartas");
    contenedor.innerHTML = "";
    
    if (cartas.length === 0) {
        contenedor.innerHTML = "<p style='color: white; text-align: center; grid-column: 1/-1;'>No se encontraron cartas...</p>";
        return;
    }
    
    cartas.forEach(carta => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("card");
        
        tarjeta.innerHTML = `
            <img src="${carta.images.small}" alt="${carta.name}">
            <h3>${carta.name}</h3>
            <button onclick="verDetalleCarta('${carta.id}')">Ver Detalle</button>
        `;
        
        contenedor.appendChild(tarjeta);
    });
};


const buscarCartas = () => {
    filtroNombre = document.getElementById("inputBusqueda").value.trim();
    filtroTipo = document.getElementById("filtroTipo").value;
    filtroSet = document.getElementById("filtroSet").value;
    paginaActual = 1;
    cargarCartas();
};


const verDetalleCarta = (idCarta) => {
    mostrarCargador();
    
    fetch(`${urlBaseApi}/cards/${idCarta}`)
        .then(res => res.json())
        .then(data => {
            const carta = data.data;
            
            let ataques = "";
            if (carta.attacks && carta.attacks.length > 0) {
                ataques = "<h3>Ataques:</h3>";
                carta.attacks.forEach(ataque => {
                    ataques += `<p><strong>${ataque.name}</strong> - ${ataque.damage || "N/A"}<br>${ataque.text || ""}</p>`;
                });
            }
            
            document.getElementById("detallesCarta").innerHTML = `
                <h2>${carta.name}</h2>
                <img src="${carta.images.large}" alt="${carta.name}">
                <p><strong>Tipo:</strong> ${carta.types?.join(", ") || "N/A"}</p>
                <p><strong>HP:</strong> ${carta.hp || "N/A"}</p>
                <p><strong>Rareza:</strong> ${carta.rarity || "N/A"}</p>
                <p><strong>Set:</strong> ${carta.set.name}</p>
                <p><strong>Artista:</strong> ${carta.artist || "N/A"}</p>
                <p><strong>Número:</strong> ${carta.number}/${carta.set.printedTotal}</p>
                ${ataques}
            `;
            
            ocultarCargador();
            document.getElementById("modalDetalle").classList.remove("hidden");
        })
        .catch(error => {
            console.error('Error al cargar detalle:', error);
            ocultarCargador();
        });
};


const cerrarModal = () => {
    document.getElementById("modalDetalle").classList.add("hidden");
};


const paginaAnterior = () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarCartas();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const paginaSiguiente = () => {
    const totalPaginas = Math.ceil(totalCartas / limitePorPagina);
    
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarCartas();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

const actualizarInfoPagina = () => {
    const totalPaginas = Math.ceil(totalCartas / limitePorPagina);
    document.getElementById("infoPagina").textContent = 
        `Página ${paginaActual} de ${totalPaginas}`;
};

// ===== CARGADOR =====
const mostrarCargador = () => {
    document.getElementById("cargador").classList.remove("hidden");
};

const ocultarCargador = () => {
    document.getElementById("cargador").classList.add("hidden");
};


document.getElementById("modalDetalle").classList.add("hidden");

cargarTipos();
cargarSets();
cargarCartas();
