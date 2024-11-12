const PDFDocument = require('pdfkit');
const fs = require('fs');
const amqp = require("amqplib");

const OUT_FILE = "./output/output.pdf";

async function createPDF() {
    const connect = await amqp.connect("amqp://guest:guest@localhost:5672/", (err) => {
        if (err) throw err;
    });
    const channel = await connect.createChannel((err) => {
        if (err) throw err;
    });
    var queue = "sendTranslatedText";
    channel.consume(queue, async msg=> {
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(OUT_FILE));
        doc.font('font/Roboto-Regular.ttf')
        .fontSize(14)
        .text(msg.content.toString, 100, 100);
        doc.end();
        console.log("created");  
    });
}

module.exports = {
    createPDF
}