const PDFDocument = require("pdfkit");
const fs = require("fs");
const amqp = require("amqplib");

const OUT_FILE = '../output/output.pdf';

async function createPDF() {
    const connect = await amqp.connect("amqp://guest:guest@localhost:5672/");
    const channel = await connect.createChannel();

    // Nhận văn bản dịch từ hàng đợi
    const queue = "sendTranslatedText";
    channel.consume(queue, (msg) => {
        const translatedText = msg.content.toString();
        console.log(`[x] Received translated text: ${translatedText}`);

        // Tạo file PDF
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(OUT_FILE));
        doc.font("fonts/Roboto-Regular.ttf").fontSize(14).text(translatedText, 100, 100);
        doc.end();
        console.log("[x] PDF created successfully");
    }, { noAck: true });
}

module.exports = { createPDF };
