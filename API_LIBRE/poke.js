const urlBaseApi = "https://api.pokemontcg.io/v2";

// ===== PAGINACIÓN =====
let paginaActual = 1;
const limitePorPagina = 12;
let totalCartas = 0;

// ===== FILTROS =====
let filtroNombre = "";
let filtroTipo = "";

// ===== CARGAR CARTAS =====
const cargarCartas = () => {
    mostrarCargador();

    let consultas = [];

    if (filtroNombre) consultas.push(`name:${filtroNombre}`);
    if (filtroTipo) consultas.push(`types:${filtroTipo}`);

    const consultaFinal =
        consultas.length > 0 ? `&q=${consultas.join(" ")}` : "";

    fetch(`${urlBaseApi}/cards?page=${paginaActual}&pageSize=${limitePorPagina}${consultaFinal}`)
        .then(res => res.json())
        .then(data => {
            totalCartas = data.totalCount;
            mostrarCartas(data.data);
            actualizarInfoPagina();
            ocultarCargador();
        })
        .catch(() => ocultarCargador());
};

// ===== MOSTRAR CARTAS =====
const mostrarCartas = (cartas) => {
    const contenedor = document.getElementById("contenedorCartas");
    contenedor.innerHTML = "";

    if (cartas.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron cartas.....</p>";
        return;
    }

    cartas.forEach(carta => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("card");

        tarjeta.innerHTML = `
            <img src="${carta.images.small}" alt="${carta.name}">
            <h3>${carta.name}</h3>
            <button onclick="verDetalleCarta('${carta.id}')">
                Ver Detalle
            </button>
        `;

        contenedor.appendChild(tarjeta);
    });
};

// ===== BUSCAR =====
const buscarCartas = () => {
    filtroNombre = document.getElementById("inputBusqueda").value.trim();
    filtroTipo = document.getElementById("filtroTipo").value;

    paginaActual = 1;
    cargarCartas();
};


const verDetalleCarta = (idCarta) => {
    fetch(`${urlBaseApi}/cards/${idCarta}`)
        .then(res => res.json())
        .then(data => {
            const carta = data.data;

            document.getElementById("detallesCarta").innerHTML = `
                <h2>${carta.name}</h2>
                <img src="${carta.images.large}">
                <p><strong>Tipo:</strong> ${carta.types?.join(", ") || "N/A"}</p>
                <p><strong>HP:</strong> ${carta.hp || "N/A"}</p>
                <p><strong>Rareza:</strong> ${carta.rarity || "N/A"}</p>
                <p><strong>Set:</strong> ${carta.set.name}</p>
            `;

            document.getElementById("modalDetalle").classList.remove("hidden");
        });
};

// ===== MODAL =====
const cerrarModal = () => {
    document.getElementById("modalDetalle").classList.add("hidden");
};

// ===== PAGINACIÓN =====
const paginaAnterior = () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarCartas();
    }
};

const paginaSiguiente = () => {
    const totalPaginas = Math.ceil(totalCartas / limitePorPagina);
    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarCartas();
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

// ===== EVENTOS AUTOMÁTICOS =====
document.addEventListener("DOMContentLoaded", () => {
    cargarCartas();

    document.getElementById("inputBusqueda")
        .addEventListener("input", buscarCartas);

    document.getElementById("filtroTipo")
        .addEventListener("change", buscarCartas);
});
