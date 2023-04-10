const express = require('express');
const { Kafka, Partitioners } = require('kafkajs');
const { CloudEvent } = require('cloudevents');
BodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(BodyParser.urlencoded({ extended: false}))
// parse application/json
app.use(BodyParser.json())

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

    const topic = 'quickstart-event'
    const message = JSON.stringify(ce)
    // send the message to Kafka
    producer.send({topic: topic, messages: [{value: message}]})
      .then((result) => {
        console.log('Message sent!');
        res.send(`Message sent: ${JSON.stringify(message)} \n`);
      })
      .catch((err) => {
        console.error('Error sending message:' + err);
        res.status(500).send('Error sending message \n');
      });
  });
  
// define the /shipMsg API route
app.post('/shipMsg', (req, res) => {

  //Create CloudEvent
  const ce = new CloudEvent({
    specversion: '1.0',
    source: req.hostname,
    type: req.originalUrl,
    data: req.body
  })

  const topic = 'quickstart-event'
  const message = JSON.stringify(ce)
  
  // send the message to Kafka
  producer.send({topic: topic, messages: [{value: message}]})
    .then((result) => {
      console.log('Message sent:' + JSON.stringify(result));
      res.send(`Message sent: ${(result)} \n`);
    })
    .catch((err) => {
      console.error('Error sending message:' + err);
      res.status(500).send('Error sending message \n');
    });
});

// start the server on port 3000
app.listen(3000, () => {
  console.log('Proxy-producer side started. Speaking on port 3000')
});
}

run().catch(console.error);