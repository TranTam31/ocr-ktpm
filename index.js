
const amqp = require('amqplib');
const path = require('path')
const { image2text } = require("./filters/ocr");
const { createPDF } = require("./filters/pdf");

var dir = "./data/sample.png";

async function ConnectToRabbitmq() {
    const connect = await amqp.connect("amqp://guest:guest@localhost:5672/", (err) => {
        if (err) throw err;
    });
    const channel = await connect.createChannel((err) => {
        if (err) throw err;
    });
    return channel;
}

ConnectToRabbitmq().then(channel => {
    var queue = "sendImage";
    var msg = dir;
    channel.assertQueue(queue, {
        durable: false
    });
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg); 
});

(async ()=> {
    const text = await image2text();
})();
