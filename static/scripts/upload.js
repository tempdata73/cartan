document.getElementById("upload-exam").addEventListener("submit", e => {
	e.preventDefault();
	divMsg = document.getElementById("upload-message");
	divMsg.innerHTML = "subiendo examen...";

	const metadata = new FormData(e.target);
  metadata.delete("file");
	const file = document.getElementById("exam-file").files[0];

	// send metadata
	fetch("https://api.cartan.xyz/upload-exam", {
		method: "POST",
		body: metadata
	})
		.then(response => response.json())
		.then(response => {
			console.log("metadata uploaded successfully");

			// upload exam to s3
      fetch(response.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/pdf",
        },
        body: file,
      })
        .then(response => {
          divMsg.innerHTML = "<p>el examen se subió correctamente.</p>";
        })
        .catch(error => {
          console.log("error uploading file:", error);
          divMsg.innerHTML = "<p>hubo un error al subir el examen. Intentar más tarde.</p>";
        });
		})
		.catch(error => {
			console.log("error uploading metadata:", error);
      divMsg.innerHTML = "<p>hubo un error al subir el examen. Checa de nuevo la información que pusiste (código o archivo).</p>";
		});
});
