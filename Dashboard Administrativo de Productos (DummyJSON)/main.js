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

const mostrarProductos = (productos) => {
    const tabla = document.getElementById("tabla-productos");
    if (!tabla) return;

    tabla.innerHTML = "";

    productos.forEach(producto => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${producto.id} </td>
            <td>${producto.title} <img src="${producto.thumbnail}" width="100"> </td>
            <td>$${producto.price}</td>
            <td>${producto.category}</td>
            <td>
                <button onclick="verProducto(${producto.id})">Ver</button>
                <button onclick="editarProducto(${producto.id})">Editar</button>
                <button onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </td>
        `;

        tabla.appendChild(fila);
    });
};

const verProducto = (id) => {
    window.location.href = `detalle.html?id=${id}`;
};

const editarProducto = (id) => {
    window.location.href = `editar.html?id=${id}`;
};

const eliminarProducto = (id) => {
    const confirmar = confirm("¿Deseas eliminar este producto?");
    if (!confirmar) return;

    fetch(`https://dummyjson.com/products/${id}`, {
        method: "DELETE"
    })
        .then(respuesta => respuesta.json())
        .then(data => {
            console.log("Producto eliminado:", data);
            alert("Producto eliminado (simulado)");
            cargarProductos();
        })
        .catch(error => {
            console.error("Error al eliminar:", error);
        });
};

cargarProductos();
