const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

const cargarCategorias = () => {
    fetch("https://dummyjson.com/products/category-list")
        .then(respuesta => respuesta.json())
        .then(categorias => {
            const selectCategoria = document.getElementById("categoria");
            selectCategoria.innerHTML = "<option value=''>Selecciona una categoría</option>";

            categorias.forEach(categoria => {
                const opcion = document.createElement("option");
                opcion.value = categoria;
                opcion.textContent = categoria;
                selectCategoria.appendChild(opcion);
            });
        })
        .catch(error => console.error("Error al cargar categorías:", error));
};

const cargarProducto = () => {
    if (!idProducto) return;

    fetch(`https://dummyjson.com/products/${idProducto}`)
        .then(respuesta => respuesta.json())
        .then(producto => {
            document.getElementById("titulo").value = producto.title;
            document.getElementById("precio").value = producto.price;
            document.getElementById("descripcion").value = producto.description;
            document.getElementById("categoria").value = producto.category;
        })
        .catch(error => console.error("Error al cargar producto:", error));
};

const editarProducto = () => {
    const titulo = document.getElementById("titulo").value;
    const precio = document.getElementById("precio").value;
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value;
    const mensaje = document.getElementById("mensaje-exito");

    if (!titulo || !precio || !categoria || !descripcion) {
        alert("Favor de llenar todos los campos");
        return;
    }

    const productoActualizado = {
        title: titulo,
        price: parseFloat(precio),
        category: categoria,
        description: descripcion
    };

    fetch(`https://dummyjson.com/products/${idProducto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoActualizado)
    })
        .then(respuesta => respuesta.json())
        .then(data => {
            console.log("Producto actualizado:", data);

            mensaje.innerHTML = `
                <strong>Producto actualizado correctamente</strong><br>
                ID: ${data.id}<br>
                ${data.title}
            `;

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        })
        .catch(error => {
            console.error("Error al editar producto:", error);
            mensaje.innerHTML = "Error al actualizar producto";
        });
};

// iniciar
cargarCategorias();
cargarProducto();
