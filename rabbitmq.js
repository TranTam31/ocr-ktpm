const amqp = require("amqplib");

async function connectToRabbitMQ() {
    try {
        const connection = await amqp.connect("amqp://guest:guest@localhost:5672/");
        const channel = await connection.createChannel();
        console.log("RabbitMQ connected successfully");
        return channel;
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        throw error;
    }
}

module.exports = { connectToRabbitMQ };
