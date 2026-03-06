const urlApi = "https://dummyjson.com/products";

const cargarProductos = () => {
    fetch(urlApi)
        .then(respuesta => respuesta.json())
        .then(data => {
            const productos = data.products;
            console.log("Productos recibidos:", productos);
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error("Error al cargar productos:", error);
        });
};


const buscarProductos = () => {
    const texto = document.getElementById("buscador").value;

    fetch(`https://dummyjson.com/products/search?q=${texto}`)
        .then(respuesta => respuesta.json())
        .then(data => {
            const productos = data.products;
            console.log("Resultados búsqueda:", productos);
            mostrarProductos(productos);
        })
        .catch(error => {
            console.error("Error en la búsqueda:", error);
        });
};


const mostrarProductos = (productos) => {
    const contenedorProductos = document.getElementById("contenedor-productos");
    if (!contenedorProductos) return;

    contenedorProductos.innerHTML = "";

    productos.forEach(producto => {
        const tarjeta = document.createElement("div");

        tarjeta.innerHTML = `
            <img src="${producto.thumbnail}" alt="${producto.title}" width="150">
            <h3>${producto.title}</h3>
            <button onclick="verProducto(${producto.id})">
                Ver producto
            </button>
        `;

        contenedorProductos.appendChild(tarjeta);
    });
};

const verProducto = (id) => {
    window.location.href = `producto.html?id=${id}`;
};

const obtenerProducto = () => {
    const params = new URLSearchParams(window.location.search);
    const idProducto = params.get("id");

    if (!idProducto) return;

    fetch(`https://dummyjson.com/products/${idProducto}`)
        .then(respuesta => respuesta.json())
        .then(producto => {
            console.log("Producto recibido:", producto);

            if (document.getElementById("producto")) {
                mostrarProducto(producto);
            }

            if (document.getElementById("detalles")) {
                mostrarDetalles(producto);
            }
        })
        .catch(error => {
            console.error("Error al obtener producto:", error);
        });
};

const mostrarProducto = (producto) => {
    const contenedorProducto = document.getElementById("producto");
    if (!contenedorProducto) return;

    contenedorProducto.innerHTML = `
        <img src="${producto.thumbnail}" width="200">
        <h2>${producto.title}</h2>
        <p><strong>Precio:</strong> $${producto.price}</p>
        <p><strong>Categoría:</strong> ${producto.category}</p>
        <button onclick="verDetalles(${producto.id})">
            Ver detalles
        </button>
    `;
};

const mostrarDetalles = (producto) => {
    const contenedorDetalles = document.getElementById("detalles");
    if (!contenedorDetalles) return;

    contenedorDetalles.innerHTML = `
    <img src="${producto.thumbnail}" width="200">
        <h2>${producto.title}</h2>
        <p>Descripcion : ${producto.description}</p>
        <p>Precio: $${producto.price}</p>
        <p>Descuento: ${producto.discountPercentage}%</p>
        <p>Rating: ${producto.rating}</p>
        <p>Stock: ${producto.stock}</p>
        <p>Categoría: ${producto.category}</p>
        <p>Marca: ${producto.brand}</p>
    `;
};

const verDetalles = (id) => {
    window.location.href = `detalles.html?id=${id}`;
};

cargarProductos();
obtenerProducto();
