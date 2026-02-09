const urlApi = "https://dummyjson.com/products";

let paginaActual = 1;
const limite = 10;
let totalProductos = 0;


const cargarProductos = () => {
    const salto = (paginaActual - 1) * limite;

    fetch(`https://dummyjson.com/products?limit=${limite}&skip=${salto}`)
        .then(respuesta => respuesta.json())
        .then(data => {
            totalProductos = data.total;
            mostrarProductos(data.products);
            actualizarInfoPagina();
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
            alert("Producto eliminado correctamente");
            cargarProductos();
        })
        .catch(error => {
            console.error("Error al eliminar:", error);
        });
};

const buscarProductos = () => {
    const texto = document.getElementById("buscador").value;

    if (texto.trim() === "") {
        cargarProductos();
        return;
    }

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

const paginaAnterior = () => {
    if (paginaActual > 1) {
        paginaActual--;
        cargarProductos();
    }
};

const paginaSiguiente = () => {
    const totalPaginas = Math.ceil(totalProductos / limite);

    if (paginaActual < totalPaginas) {
        paginaActual++;
        cargarProductos();
    }
};

const actualizarInfoPagina = () => {
    const totalPaginas = Math.ceil(totalProductos / limite);
    document.getElementById("info-pagina").textContent =
        `Página ${paginaActual} de ${totalPaginas}`;
};

const cargarCategorias = () => {
    fetch("https://dummyjson.com/products/category-list")
        .then(respuesta => respuesta.json())
        .then(categorias => {
            const select = document.getElementById("select-categoria");
            select.innerHTML = '<option value="">Todas las categorías</option>';

            categorias.forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria;
                option.textContent = categoria;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error al cargar categorías:", error);
        });
};


const filtrarPorCategoria = () => {
    const categoria = document.getElementById("select-categoria").value;

    paginaActual = 1;

    if (categoria === "") {
        cargarProductos();
        return;
    }

    fetch(`https://dummyjson.com/products/category/${categoria}`)
        .then(respuesta => respuesta.json())
        .then(data => {
            totalProductos = data.total;
            mostrarProductos(data.products);
            document.getElementById("info-pagina").textContent =
                `Categoría: ${categoria}`;
        })
        .catch(error => {
            console.error("Error al filtrar por categoría:", error);
        });
};

cargarCategorias();
cargarProductos();