const search_bar = document.getElementById("course-search");
const apiURL = "https://eq2kp86y6k.execute-api.us-east-1.amazonaws.com/search-courses"

search_bar.addEventListener("submit", function(event) {
	event.preventDefault();
	const pattern = document.getElementById("pattern").value;

	fetch(`${apiURL}?pattern=${encodeURIComponent(pattern)}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then(response => response.json())
		.then(response => {
			console.log("response", response);
			const matches = response["matches"];
			const container = document.getElementById("course-results");
			container.innerHTML = "";

			if (matches.length > 0) {
				const table = document.createElement("table");

				matches.forEach(result => {
					console.log("result", result);

					const row = document.createElement("tr")
					result.forEach(cellData => {
						const cell = document.createElement("td");
						cell.textContent = cellData;
						row.appendChild(cell);
					});

					table.appendChild(row);
				});

				container.appendChild(table)
			} else {
				container.innerHTML = `<p>No se encontró ningún curso con la búsqueda "${pattern}"</p>`;
			}
		})
		.catch(error => {
			console.error("error fetching courses:", error);
			const container = document.getElementById("course-results");
			container.innerHTML = "<p>Hubo un error inesperado. Intentar más tarde.</p>";
		})
});
