import express, { request } from 'express';
import { Kafka, Partitioners } from 'kafkajs';
import { CloudEvent } from 'cloudevents';
import BodyParser from 'body-parser';
import { WebSocketServer } from 'ws';

//Map connecting hostname/service name's topic name for kafka with websocket open 
const openConnections = new Map();

// app setup
const app = express();
app.use(BodyParser.urlencoded({ extended: false}))
app.use(BodyParser.json())

//Websocket server setup
const wssPort = 80
const wss = new WebSocketServer({ port: wssPort })

wss.on('connection', function connection(ws){
  console.log("New connection received...");

  ws.on('error', console.error);
  
  ws.on('message', function message(data){
    console.log('Received: %s\n Type of '+typeof data, data)
    const stringOfData = JSON.stringify(data)
    if(stringOfData.startsWith("registerMe:")){
      //Then the service is asking to be added to the lsitening services
      stringOfData = stringOfData.substring(11);
      consumer.subscribe({ topic: stringOfData});
      console.log("Adding "+stringOfData+" to the service list");
      openConnections.set(stringOfData, ws);
    }else{
      //Else it means we have received a message
      const requestToForward = JSON.parse(data)
      const requestID = requestToForward.header.headers['X-Request-ID']
      //Create CloudEvent
      const ce = new CloudEvent({
        specversion: '1.0',
        source: requestToForward.header.headers.Origin,
        type: requestToForward.header.url,
        data: requestToForward.body
      })

      // send the message to Kafka
      const topic = requestToForward.header.headers.Origin   
      const message = JSON.stringify(ce)
      producer.send({ topic: topic, messages: [{ value: message }] })
        .then((result) => {
          console.log('Message sent!');
          ws.send("ACK "+requestID+" ok")
        })
        .catch((err) => {
          console.error('Error sending message:' + err);
          ws.send("ACK "+requestID+" ko "+err)
        });
      console.log("Waiting for Kafka response...")
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
  console.log('Producer side connected\n');

  //Consumer setup
  await consumer.connect();
  console.log('Consumer side connected\n');
  await consumer.subscribe({ topic: 'quickstart-event'});
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Receiver: message received!")
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

  // Start the server on port 3000
  app.listen(3000, () => {
    console.log('Proxy started. Speaking on port 3000')
  });
}



run().catch(console.error);