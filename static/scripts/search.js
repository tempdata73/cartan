// table headers
const tableHeader = document.createElement("tr");
const headers = ["Código", "Nombre", "Núm. de registros"];

headers.forEach(text => {
	const th = document.createElement("th");
	th.textContent = text;
	tableHeader.appendChild(th);
});

// search bar functionality
function create_related_courses_table(pattern) {
	fetch(`https://api.cartan.xyz/search-course?pattern=${encodeURIComponent(pattern)}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then(response => response.json())
		.then(response => {
			const matches = response["matches"];
			const container = document.getElementById("course-results");

			container.innerHTML = "";

			if (matches.length > 0) {
				const table = document.createElement("table");
				table.appendChild(tableHeader);

				matches.forEach(([code, name, count]) => {
					const row = document.createElement("tr")

					// redirect to the detail view of the respective course.
					const courseCell = document.createElement("td");
					const courseLink = document.createElement("a");
					params = `code=${encodeURIComponent(code)}&name=${encodeURIComponent(name)}`;
					courseLink.href = `./detail.html?${params}`;
					courseLink.textContent = code;

					courseCell.appendChild(courseLink);
					row.appendChild(courseCell);

					// info about the course
					[name, count].forEach(cellData => {
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
}
