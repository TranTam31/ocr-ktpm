const tesseract = require("node-tesseract-ocr");
const { getChannel } = require("../rabbitmq");

async function image2text(filePath) {
    const channel = await getChannel();
    const text = await tesseract.recognize(filePath, { lang: "eng" });

    const queue = "sendText";
    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(text));

    console.log("Extracted text sent to queue:", text);
}

module.exports = {
    image2text,
};
