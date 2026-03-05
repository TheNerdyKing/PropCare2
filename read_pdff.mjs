import fs from 'fs';

async function run() {
    try {
        const dataBuffer = fs.readFileSync('C:/Users/oluwh/Downloads/260304_Feedback_PropCare.pdf');
        const pdfParseModule = await import('pdf-parse');

        // dynamically determine the function
        const pdf = pdfParseModule.default || pdfParseModule.pdfParse || pdfParseModule;

        if (typeof pdf === 'function') {
            const data = await pdf(dataBuffer);
            console.log("PDF TEXT:\n\n", data.text);
        } else {
            console.log("Exported members of pdf-parse:", Object.keys(pdfParseModule));
            console.log("Type of default:", typeof pdfParseModule.default);
            if (pdfParseModule.default) {
                console.log("Keys of default:", Object.keys(pdfParseModule.default));
                if (typeof pdfParseModule.default === 'function') {
                    const data = await pdfParseModule.default(dataBuffer);
                    console.log(data.text);
                }
                if (typeof pdfParseModule.default.pdfParse === 'function') {
                    const data = await pdfParseModule.default.pdfParse(dataBuffer);
                    console.log(data.text);
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}
run();
