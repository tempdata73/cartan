document.getElementById("upload-exam").addEventListener("submit", (e) => {
	e.preventDefault();
	divMsg = document.getElementById("upload-message");
	divMsg.innerHTML = "subiendo examen...";

	const formData = new FormData(e.target);

	fetch("https://api.cartan.xyz/upload-exam", {
		method: "POST",
		body: formData
	})
		.then(response => response.json())
		.then(response => {
			console.log("upload was successful");
      divMsg.innerHTML = '<p>El examen se subió correctamente.</p>';
		})
		.catch(error => {
			console.log("error uploading exam:", error)
      divMsg.innerHTML = '<p>Hubo un error al subir el examen. Checa de nuevo la información que pusiste (código o archivo).</p>';
		});
});
