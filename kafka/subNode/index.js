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
      console.log({
        value: JSON.stringify(new CloudEvent(JSON.parse(message.value.toString())))
      })
      const ceMessage = new CloudEvent(JSON.parse(message.value.toString()))
    },
  });
}

run().catch(console.error);

// define the /receiveMsg route
app.get('/receiveMsg', function (req, res) {
  res.send('Still working on this');
});

// start the server
app.listen(2999, function () {
  console.log('Server started on port 2999');
});
