const lambdaURL = "https://qx2avobor2b7i6wkz4iv5hj24i0neqyh.lambda-url.us-east-1.on.aws/";
const params = new URLSearchParams(window.location.search);

// set page title
const name = params.get("name");
document.getElementById("course-name").innerHTML = name;


// create table with results
const tableHeader = document.createElement("tr");

const headers = ["Profesor", "Año", "Periodo", "Núm. de Parcial", "Archivo"];
headers.forEach(text => {
	const th = document.createElement("th");
	th.textContent = text;
	tableHeader.appendChild(th);
});

// get all registered exams for corresponding course
const code = params.get("code");
fetch(`${lambdaURL}?code=${code}`)
	.then(response => response.json())
	.then(archives => {
		console.log(archives);
		const div = document.getElementById("archive-results");
		const table = document.createElement("table");
		table.appendChild(tableHeader);

		archives.forEach(([year, period, prof, exam_num, object_name]) => {
			const row = `<tr>
				<td>${prof || "N/A"}</td>
				<td>${year}</td>
				<td>${period}</td>
				<td>${exam_num || "N/A"}</td>
				<td><a href="#" onclick="window.open('www.cartan.xyz/${object_name}', '_blank')">examen.pdf</a></td>
			</tr>`;

		table.innerHTML += row;
		});

		div.appendChild(table);
	})
	.catch(error => console.log("error fetching archive details:", error));
