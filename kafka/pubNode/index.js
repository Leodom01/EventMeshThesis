const express = require('express');
const { Kafka, Partitioners } = require('kafkajs');
const { CloudEvent } = require('cloudevents');

const app = express();

const kafkaHostname = "kafka-service.default.svc.cluster.local"
const kafkaPort = "9092"

// create a Kafka producer
const kafka = new Kafka({
  clientId: 'nodejs-publisher',
  brokers: [kafkaHostname+':'+kafkaPort],
  createPartitioner: Partitioners.LegacyPartitioner
});
const producer = kafka.producer();

async function run() {
  await producer.connect();
  console.log('Producer connected\n');

  // define the /sendMsg API route
  app.get('/sendMsg', (req, res) => {

    // create a random number between 1 and 100
    const randomNum = Math.floor(Math.random() * 100) + 1;

    //Create CloudEvent
    const ce = new CloudEvent({
      specversion: '1.0',
      source: 'nodejs-producer',
      type: 'com.leodom.testMsg',
      data: 'Hello, Kafka! Random number: '+randomNum
    })

    // create a message with a fixed content and a random part
    //const message = {
    // value: `Hello, Kafka! Random number: ${randomNum}`
    //};
    const topic = 'quickstart-event'
    const message = JSON.stringify(ce)
    // send the message to Kafka
    producer.send({topic: topic, messages: [{value: message}]})
      .then((result) => {
        console.log('Message sent:' + JSON.stringify(result));
        res.send(`Message sent: ${JSON.stringify(message)} \n`);
      })
      .catch((err) => {
        console.error('Error sending message:' + err);
        res.status(500).send('Error sending message \n');
      });
  });

  // start the server on port 3000
  app.listen(3000, () => {
    console.log('Server started on port 3000\n');
  });
}

run().catch(console.error);




