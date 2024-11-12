const translator = require("open-google-translator");
const amqp = require("amqplib");
const { createPDF } = require ("./pdf");

translator.supportedLanguages();

async function translate() {
    const connect = await amqp.connect("amqp://guest:guest@localhost:5672/", (err) => {
        if (err) throw err;
    });
    const channel = await connect.createChannel((err) => {
        if (err) throw err;
    });
    var queue = "sendText";
    channel.consume(queue, async msg => {
        console.log(msg.content.toString());
        new Promise((resolve, reject) => {
            translator
                .TranslateLanguageData({
                    listOfWordsToTranslate: [msg.content.toString()],
                    fromLanguage: "en",
                    toLanguage: "vi",
                })
                .then((data) => {
                    resolve(data[0].translation);
                }).catch((err) => {
                    reject(err)
                });
        }).then(async (data)=> {
            console.log(data);
            var nextqueue = "sendTranslatedText"
            channel.assertQueue(nextqueue, {
            durable: false
            });
            channel.sendToQueue(nextqueue, Buffer.from(data));
            createPDF();
        })
    }, {noAck: true});
}

module.exports = {
    translate
}