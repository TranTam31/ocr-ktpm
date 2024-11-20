const translator = require("open-google-translator");
const { getChannel } = require("../rabbitmq");

async function translate() {
    const channel = await getChannel();
    const queue = "sendText";

    // Đảm bảo hàng đợi đầu ra tồn tại
    const nextQueue = "sendTranslatedText";
    await channel.assertQueue(nextQueue, { durable: false });

    channel.consume(queue, async (msg) => {
        const text = msg.content.toString();
        console.log("Text received for translation:", text);

        try {
            const translation = await translator.TranslateLanguageData({
                listOfWordsToTranslate: [text],
                fromLanguage: "en",
                toLanguage: "vi",
            });

            const translatedText = translation[0].translation;
            console.log("Translated text:", translatedText);

            channel.sendToQueue(nextQueue, Buffer.from(translatedText));
        } catch (error) {
            console.error("Translation error:", error);
        }
    }, { noAck: true });
}

module.exports = {
    translate,
};
