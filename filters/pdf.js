const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { getChannel } = require("../rabbitmq");

const OUT_FILE = path.join(__dirname, "../output/output.pdf");

async function createPDF() {
    const channel = await getChannel();
    const queue = "sendTranslatedText";

    channel.consume(queue, (msg) => {
        const translatedText = msg.content.toString();
        console.log("Creating PDF with text:", translatedText);

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(OUT_FILE));
        doc.font("font/Roboto-Regular.ttf")
            .fontSize(14)
            .text(translatedText, 100, 100);
        doc.end();

        console.log("PDF created successfully!");
    }, { noAck: true });
}

module.exports = {
    createPDF,
};
