// require the packages needed
const anonymizeNlp = require("anonymize-nlp")
const xlsx = require('xlsx');
const excelJS = require("exceljs");

// collect the arguments
const args = process.argv.slice(2);
const inputFile = args[0];
const outputFile = args[1];

// show the arguments in cmd
console.log("========= Input file: " + inputFile);
console.log("========= Output file: " + outputFile)

try {
	const inputWorkbook = xlsx.readFile(inputFile);
	let workbookSheet = inputWorkbook.SheetNames;
	var workbookRowsData = xlsx.utils.sheet_to_json(
		inputWorkbook.Sheets[workbookSheet[0]], {header: 1}
	);
} catch (err) {
	console.error("Something went wrong while reading input file. Error message: " + err.message);
};

try {
	var anonymizedTextData = [];
	const anonymizer = new anonymizeNlp.AnonymizeNlp();
	workbookRowsData.forEach((data) => {
		const textData = data[Object.keys(data)[0]];
		const anonymizedText = anonymizer.anonymize(textData);

		anonymizedTextData.push(anonymizedText);
	});
} catch (err) {
	console.error("Something went wrong while annonymising data. Error message: " + err.message);
};

try {
	const outputWorkbook = new excelJS.Workbook();
	const worksheet = outputWorkbook.addWorksheet("Anonymised");

	// Column for data in excel. key must match data key
	worksheet.columns = [
		{ header: "S/No", key: "s_no", width: 10 }, 
		{ header: "Annonymised", key: "annonymised", width: 60 }, 
	];

	// Looping through User data
	let counter = 1;
	anonymizedTextData.forEach((anonymised) => {
		worksheet.addRow({
			s_no: counter,
			annonymised: anonymised
		});
		counter++;
	});

	// Making first line in excel bold
	worksheet.getRow(1).eachCell((cell) => {
		cell.font = { bold: true };
	});

	outputWorkbook.xlsx.writeFile(outputFile);
	console.log("\nData has been successfully exported to path: " + outputFile);
} catch (err) {
	console.error("Something went wrong while saving output file. Error message: " + err.message);
};