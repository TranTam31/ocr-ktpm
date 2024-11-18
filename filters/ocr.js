const tesseract = require("node-tesseract-ocr");
const amqp = require("amqplib");

async function image2text(filePath) {
    const connect = await amqp.connect("amqp://guest:guest@localhost:5672/", (err) => {
        if (err) throw err;
    });
    const channel = await connect.createChannel((err) => {
        if (err) throw err;
    });

    try {
        // Thực hiện OCR
        const text = await tesseract.recognize(filePath);
        console.log(`[x] OCR Result: ${text}`);

        // Gửi text vào hàng đợi
        const queue = "sendText";
        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(text));
        console.log(`[x] Sent OCR result to queue: ${queue}`);
    } catch (error) {
        console.error("[!] OCR failed:", error.message);
    }
}


module.exports = { image2text };
