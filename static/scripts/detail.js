const lambdaURL = "https://lpn5jcmenithxdym2artgnyez40yfcnc.lambda-url.us-east-1.on.aws/";
const params = new URLSearchParams(window.location.search);

// set page title
const name = params.get("name");
document.getElementById("course-name").innerHTML = name;

// get all registered exams for corresponding course
const code = params.get("code");
fetch(`${lambdaURL}?code=${code}`)
	.then(response => response.json())
	.then(archives => {
		const table = document.getElementById("archive-results");

		archives.forEach(([year, period, prof, s3_uri]) => {
			const row = `<tr>
				<td>${year}</td>
				<td>${period}</td>
				<td>${prof}</td>
				<td><a href="#" onclick="window.open('${s3_uri}', '_blank')">archivo</a></td>
			</tr>`;

		table.innerHTML += row;
		});
	})
	.catch(error => console.log("error fetching archive details:", error));
