const tesseract = require("node-tesseract-ocr")
const amqp = require("amqplib")
const { translate } = require("./translate");

async function image2text(){
  const connect = await amqp.connect("amqp://guest:guest@localhost:5672/", (err) => {
      if (err) throw err;
  });
  const channel = await connect.createChannel((err) => {
      if (err) throw err;
  });
  var queue = "sendImage";
  channel.consume(queue, async msg => {
    await tesseract.recognize(msg.content.toString(), {
      lang: "eng"
    }).then(async text => {
      var nextqueue = "sendText"
      channel.assertQueue(nextqueue, {
        durable: false
      });
      channel.sendToQueue(nextqueue, Buffer.from(text));
      await translate();
    })
  }, {noAck: true});
}

module.exports = {
  image2text
}