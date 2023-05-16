import express from 'express';
import { Kafka } from 'kafkajs';

// Define Kafka broker and topic information
const kafkaBrokers = [process.env.KAFKA_ENDPOINT+':9092']; // Replace with your Kafka broker addresses
const topic = 'testTopic'; // Replace with your desired Kafka topic

// Create a Kafka producer
const kafka = new Kafka({
  brokers: kafkaBrokers,
  clientId: 'testProducer',
});

const producer = kafka.producer();

// Connect the Kafka producer
async function connectProducer() {
  await producer.connect();
  console.log('Kafka producer connected');
}

// Express setup
const app = express();
app.use(express.json());

// Define endpoint for sending Kafka message
app.get('/send', async (req, res) => {
  const message = req.query.message || 'Default message';

  try {
    // Produce Kafka message
    await producer.send({
      topic,
      messages: [{ value: message }],
    });

    console.log(`Sent message to Kafka topic '${topic}': ${message}`);
    res.status(200).json({ success: true, message: 'Message sent to Kafka' });
  } catch (error) {
    console.error('Error sending message to Kafka:', error);
    res.status(500).json({ success: false, error: 'Error sending message to Kafka' });
  }
});

// Start the Express server and connect Kafka producer
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectProducer().catch((error) => {
    console.error('Error connecting Kafka producer:', error);
    process.exit(1);
  });
});

// Create a Kafka consumer
const consumer = kafka.consumer({ groupId: 'testGroup' });

// Connect to Kafka and start consuming messages
async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { value } = message;
      console.log(`Received message from topic '${topic}', partition ${partition}: ${value.toString()}`);
    },
  });
}

// Start the Kafka consumer
run().catch((error) => {
  console.error('Error occurred:', error);
  process.exit(1);
});
