const cloudName = "dffswlrkh";
const preset = "Jared11";

const inputf = document.getElementById("fileinput");
const imagen = document.getElementById("imagen");
const boton = document.getElementById("btnSubir");
const estado = document.getElementById("estado");
const urlImagen = document.getElementById("urlImagen");

const subirimg = () => {
    const foto = inputf.files[0];
    if (!foto) {
        alert("Selecciona una imagen primero");
        return;
    }

    if (!foto.type.startsWith("image/")) {
        alert("Solo se permiten imágenes");
        return;
    }
    boton.disabled = true;
    estado.textContent = "Subiendo...";

    const formdata = new FormData();
    formdata.append("file", foto);
    formdata.append("upload_preset", preset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formdata
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en la subida");
        }
        return response.json();
    })
    .then(data => {

        alert("Imagen subida correctamente");
        estado.textContent = "";

        imagen.src = data.secure_url;
        urlImagen.href = data.secure_url;
        urlImagen.textContent = data.secure_url;
    })
    .catch(error => {
        console.error(error);
        alert("Imagen subida correctamente")

    })
    .finally(() => {
        boton.disabled = false;
    });
};
