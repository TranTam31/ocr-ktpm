const translator = require("open-google-translator");
const amqp = require("amqplib");

async function translate() {
    const connect = await amqp.connect("amqp://guest:guest@localhost:5672/");
    const channel = await connect.createChannel();

    const queue = "sendText";
    console.log(`[x] Listening on queue: ${queue}`);
    channel.consume(queue, async (msg) => {
        const text = msg.content.toString();
        console.log(`[x] Received text: ${text}`);

        try {
            // Dịch văn bản
            const translatedText = await translator.TranslateLanguageData({
                listOfWordsToTranslate: [text],
                fromLanguage: "en",
                toLanguage: "vi",
            });

            if (!translatedText || !translatedText[0]?.translation) {
                throw new Error("Translation failed: No result");
            }

            // Đẩy văn bản dịch vào hàng đợi tiếp theo
            const nextQueue = "sendTranslatedText";
            channel.assertQueue(nextQueue, { durable: false });
            channel.sendToQueue(nextQueue, Buffer.from(translatedText[0].translation));
            console.log(`[x] Sent translated text: ${translatedText[0].translation}`);

            // Xác nhận đã xử lý thông điệp
            channel.ack(msg);
        } catch (error) {
            console.error("[!] Error during translation:", error.message);
            channel.nack(msg); // Gửi lại thông điệp vào hàng đợi nếu gặp lỗi
        }
    });
}

module.exports = { translate };
