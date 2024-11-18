const amqp = require("amqplib");

let connection;
let channel;

async function getChannel() {
    if (!connection) {
        connection = await amqp.connect("amqp://guest:guest@localhost:5672/");
        channel = await connection.createChannel();
    }
    console.log("RabbitMQ connected")
    return channel;
}

module.exports = {
    getChannel,
};
