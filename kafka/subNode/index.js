const { Kafka } = require('kafkajs');
const express = require('express');
const { CloudEvent } = require('cloudevents');

const app = express();

const kafkaHostname = "kafka-service.default.svc.cluster.local"
const kafkaPort = "9092"

// create a Kafka client and consumer
const kafka = new Kafka({
  clientId: 'nodejs-consumer',
  brokers: [`${kafkaHostname}:${kafkaPort}`],
})
const consumer = kafka.consumer({ groupId: 'test-group' });

// handle incoming messages
const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'quickstart-event', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const ce = new CloudEvent(JSON.parse(message.value.toString()))
      console.log({
        message: JSON.stringify(new CloudEvent(JSON.parse(message.value.toString())))
      })
      console.log({
        body: ce.data
      })
      const ceMessage = new CloudEvent(JSON.parse(message.value.toString()))
    },
  });
}

run().catch(console.error);

// start the server
app.listen(3000, function () {
  console.log('Proxy-subscriber side started. Speaking on port 3000');
});
