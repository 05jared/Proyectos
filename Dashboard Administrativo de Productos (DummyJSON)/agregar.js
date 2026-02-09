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
        .catch(error => {
            console.error("Error al cargar categorías:", error);
        });
};

const crearProducto = () => {
    const titulo = document.getElementById("titulo").value;
    const precio = document.getElementById("precio").value;
    const categoria = document.getElementById("categoria").value;
    const descripcion = document.getElementById("descripcion").value;
    const mensaje = document.getElementById("mensaje-exito");

    if (!titulo || !precio || !descripcion || !categoria) {
        alert("Favor de llenar todos los campos");
        return;
    }

    const producto = {
        title: titulo,
        price: parseFloat(precio),
        category: categoria,
        description: descripcion,
        thumbnail: "https://via.placeholder.com/150"
    };

    fetch("https://dummyjson.com/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
    })
        .then(respuesta => respuesta.json())
        .then(data => {
            console.log("Producto creado:", data);

            mensaje.innerHTML = `
                <strong>Producto agregado correctamente</strong><br>
                ID: ${data.id}<br>
                ${data.title}
            `;

            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        })
        .catch(error => {
            console.error("Error al crear producto:", error);
        });
};

// iniciar
cargarCategorias();
