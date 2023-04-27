import express, { request } from 'express';
import { Kafka, Partitioners } from 'kafkajs';
import { CloudEvent } from 'cloudevents';
import BodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
//Chalk colors: yellow setup,bgGreen kafka related positive updates, green successful response, red error, magenta messages
const myChalk = new chalk.constructor({level: 1, enabled: true, hasColor: true, 
  chalkOptions: {level: 1, enabled: true, hasColor: true, extended: true, 
                 visible: true, colorSupport: true}});
                 
//Map connecting hostname/service name's topic name for kafka with websocket open 
const openConnections = new Map();

// app setup
const app = express();
app.use(BodyParser.urlencoded({ extended: false}))
app.use(BodyParser.json())

//Websocket server setup
const wssPort = 80
const wss = new WebSocketServer({ port: wssPort })

wss.on('connection', function connection(ws) {
  console.log(myChalk.yellow("New connection received..."));

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const stringOfData = data.toString()

    if(stringOfData.startsWith("RecordMe:")){
      //Register request
      let toRecord = stringOfData.substring("RecordMe:".length);
      console.log(myChalk.green("New service recorded: "+toRecord))
    } else {
      //Message request
      //Else it means we have received a message
      const requestToForward = JSON.parse(data)
      const requestID = requestToForward.header.headers['X-Request-ID']
      const destination = new URL(requestToForward.header.url).hostname   //This brings it to lower case, would be better to keep it in the original casing
      //Create CloudEvent
      const ce = new CloudEvent({
        id: requestID,
        specversion: '1.0',
        source: requestToForward.header.headers.Origin,
        type: requestToForward.header.url,
        data: requestToForward.body
      })

      //Check if the host that sent this message is already in my sub topics, else create it
      //If Register has correctly been called this if should never trigger
      if (!openConnections.has(requestToForward.header.headers.Origin)) {
        openConnections.set(requestToForward.header.headers.Origin, ws)
        addTopicAndRestartConsumer(consumer, requestToForward.header.headers.Origin)
        console.log(myChalk.bgGreen("Added topic to monitor/sub: " + requestToForward.header.headers.Origin))
      }

      // send the message to Kafka
      const topic = destination
      const message = JSON.stringify(ce)
      console.log("Sending to topic: " + topic)
      console.log(message)
      producer.send({ topic: topic, messages: [{ value: message }] })
        .then((result) => {
          console.log(myChalk.green('Message sent!'));
          ws.send("ACK " + requestID + " ok")
        })
        .catch((err) => {
          console.errorchalk.red(('Error sending message:' + err));
          ws.send("ACK " + requestID + " ko " + err)
        });
    }

    
  })
});

//Kafka connector setup
const kafkaHostname = "kafka-service.default.svc.cluster.local"
const kafkaPort = "9092"
const kafka = new Kafka({
  clientId: 'nodejs-proxy',
  brokers: [kafkaHostname+':'+kafkaPort],
  createPartitioner: Partitioners.LegacyPartitioner
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'myMeshProxy' });

//main maethod
async function run() {

  //Producer setup
  await producer.connect();
  console.log(myChalk.yellow('Producer side connected\n'));

  //Consumer setup
  await consumer.connect();
  console.log(myChalk.yellow('Consumer side connected\n'));
  await consumer.subscribe({ topic: 'quickstart-event'});
  await consumer.run({
    eachMessage: eachMessageHandler
  });

  // Start the server on port 3000
  app.listen(3000, () => {
    console.log(myChalk.green('Proxy started. Speaking on port 3000'))
  });
}

async function addTopicAndRestartConsumer(consumer, topic) {
  // Stop the consumer
  await consumer.stop()

  // Add the new topic to listen to
  consumer.subscribe({ topic: topic })

  // Start the consumer again
  await consumer.run({
    eachMessage: eachMessageHandler
  })
}

async function eachMessageHandler({ topic, partition, message }){
  console.log(myChalk.green("Receiver: message received!"))
    const ce = new CloudEvent(JSON.parse(message.value.toString()))
    console.log(myChalk.magenta("Message: "+JSON.stringify(ce)))
    //const ceMessage = new CloudEvent(JSON.parse(message.value.toString()))
}

//DEBUG APIs
 /**
   * GET method for /sendMsg
   * 
   * The method sends a default msg to Kafka using the quickstart-event topic.
   * The message contains a variable part generated randomly. 
   * 
   */
 app.get('/sendMsg', (req, res) => {

  console.log("Producer: sending message!")

  // create a random number between 1 and 100
  const randomNum = Math.floor(Math.random() * 100) + 1;

  //Create CloudEvent
  const ce = new CloudEvent({
    specversion: '1.0',
    source: 'nodejs-producer',
    type: 'com.leodom.testMsg',
    data: 'Hello, Kafka! Random number: '+randomNum
  })

  // send the message to Kafka
  const topic = 'quickstart-event'
  const message = JSON.stringify(ce)
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
/**
   * POST method for /shipMsg
   * 
   * The method receive a message with body in  JSON format that will be put in the data field of the CE.
   * It will then be sent to Kafka on topic quickstart-event
   * 
   */
app.post('/shipMsg', (req, res) => {

  console.log("Producer: shipping message!")

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

run().catch(console.error);