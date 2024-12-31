const lambdaURL = "https://lpn5jcmenithxdym2artgnyez40yfcnc.lambda-url.us-east-1.on.aws/";
const params = new URLSearchParams(window.location.search);

// set page title
const name = params.get("name");
document.getElementById("course-name").innerHTML = name;


// create table with results
const tableHeader = document.createElement("tr");

const headers = ["Profesor", "Año", "Periodo", "Archivo"];
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

		archives.forEach(([year, period, prof, s3_uri]) => {
			const row = `<tr>
				<td>${prof || "N/A"}</td>
				<td>${year}</td>
				<td>${period}</td>
				<td><a href="#" onclick="window.open('${s3_uri}', '_blank')">examen.pdf</a></td>
			</tr>`;

		table.innerHTML += row;
		});

		div.appendChild(table);
	})
	.catch(error => console.log("error fetching archive details:", error));
