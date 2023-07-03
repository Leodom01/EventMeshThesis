import express, { request } from 'express';
import { Kafka, Partitioners, logLevel } from 'kafkajs';
import { CloudEvent } from 'cloudevents';
import BodyParser from 'body-parser';
import { WebSocketServer } from 'ws';
import chalk from 'chalk';
import http from 'http';
import fs from 'fs';
//Chalk colors: yellow setup,bgGreen kafka related positive updates, green successful response, red error, magenta messages
const myChalk = new chalk.constructor({level: 1, enabled: true, hasColor: true, 
  chalkOptions: {level: 1, enabled: true, hasColor: true, extended: true, 
                 visible: true, colorSupport: true}});

const logFile = '/var/log/'+process.env.SERVICE_NAME+'-proxy';
console.log("Logfile at: ", logFile)
//Crea file di log e folder
fs.mkdir('/var/log/'+process.env.SERVICE_NAME+'-proxy', { recursive: true }, (err) => {
  if (err) {
    console.error('Errore nella creazione della cartella:', err);
  } else {
    console.log('Cartella creata con successo.');
    fs.open(logFile, 'w', (err, fd) => {
      if (err) {
        console.error('Errore nella creazione del file:', err);
      } else {
        console.log('File di log creato con successo.');
        fs.close(fd, (err) => {
          if (err) {
            console.error('Errore nella chiusura del file:', err);
          }
        });
      }
    });
  }
});

// app setup
const app = express();
app.use(BodyParser.urlencoded({ extended: false}))
app.use(BodyParser.json())

//Websocket server setup
const wssPort = 80
const wss = new WebSocketServer({ port: wssPort })
let serviceWs = null

wss.on('connection', function connection(ws) {
  console.log(myChalk.yellow("New connection received..."));

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    var receivedDate = new Date().toISOString()
    const stringOfData = data.toString()
    if(stringOfData.startsWith("RecordMe:")){
      //Register request
      let toRecord = stringOfData.substring("RecordMe:".length);
      console.log(myChalk.green("New service recorded: "+toRecord))
      serviceWs = ws
      //addTopicAndRestartConsumer(consumer, toRecord)
      //console.log(myChalk.bgGreen("Added topic to monitor/sub: " + toRecord))
      run(toRecord).catch(console.error);

    } else {
      //Message request
      //Else it means we have received a message
      const requestToForward = JSON.parse(data)
      const requestID = requestToForward.header.headers['X-Request-ID']
      //console.log("TO KAFKA ",requestID, " AT ", receivedDate)
      fs.writeFile(logFile, "TO KAFKA UUID "+requestID+" AT "+receivedDate+'\n', {flag: 'a'}, (err) => {});
      const destination = new URL(requestToForward.header.url).hostname   //This brings it to lower case, would be better to keep it in the original casing
      //Create CloudEvent
      const ce = new CloudEvent({
        id: requestID,
        specversion: '1.0',
        source: requestToForward.header.headers.Origin,
        type: requestToForward.header.url,
        data: requestToForward.body
      })

      // send the message to Kafka
      const topic = destination
      const message = JSON.stringify(ce)
      //console.log("Sending to topic: " + topic)       DEBUG
      //console.log(myChalk.green(message))       DEBUG
      producer.send({ topic: topic, messages: [{ value: message }] })
        .then((result) => {
          //console.log(myChalk.green('Message sent!'));        DEBUG
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
const kafkaHostname = process.env.KAFKA_ENDPOINT
const kafkaPort = process.env.KAFKA_PORT
const serviceName = process.env.SERVICE_NAME
const kafka = new Kafka({
  clientId: serviceName+'_proxy',
  brokers: [kafkaHostname+':'+kafkaPort],
  //createPartitioner: Partitioners.LegacyPartitioner,
  //logLevel: logLevel.ERROR
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: serviceName+'_groupID' });

//main maethod
async function run(topicToListenTo) {

  await producer.connect();
  console.log(myChalk.yellow('Producer side connected\n'));
  //Consumer setup
  await consumer.connect();
  console.log(myChalk.yellow('Consumer side connected\n'));
  await consumer.subscribe({ topic: topicToListenTo});   
  console.log(myChalk.bgGreen("Added topic to monitor/sub: " + topicToListenTo))
  await consumer.run({
    eachMessage: eachMessageHandler
  });
  consumer.on('consumer.rebalancing', async () => {
    let startTime = new Date().toISOString()
    console.log(myChalk.red('Consumer group is rebalancing...'));
    await consumer.stop();
    await consumer.connect();
    console.log(myChalk.yellow('Consumer side connected\n'));
    //await consumer.subscribe({ topic: 'quickstart-event' }); // Just for debug purpose
    await consumer.run({
    eachMessage: eachMessageHandler
    });
  });

  // Start the server on port 3000
  app.listen(3000, () => {
    console.log(myChalk.green('Proxy started. Speaking on port 3000'))
  });
}

async function eachMessageHandler({ topic, partition, message }){
  //console.log("Receiving from topic: "+topic)       DEBUG 
  var receivedDate = new Date().toISOString()

  const msgJson = JSON.parse(message.value)

  //console.log("FROM KAFKA ",msgJson.id, " AT ", receivedDate)
  fs.writeFile(logFile, "FROM KAFKA UUID "+msgJson.id+" AT "+receivedDate+'\n', {flag: 'a'}, (err) => {});
  //Package it in an http request to send it back via ws
  var httpRequest = new http.IncomingMessage({
    method: 'GET',
    url: msgJson.type,
    headers: {
      'Content-Type': 'application/json',
      'Origin': msgJson.source,
      'X-Request-ID': msgJson.id
    },
    rawHeaders: ['Content-Type', 'application/json']
  });
  httpRequest.data = msgJson.data

  var toSend = {
    header: httpRequest.socket,
    body: httpRequest.data
  }
  serviceWs.send(JSON.stringify(toSend))

  //console.log(myChalk.green("Message forwarded to the service as: "+JSON.stringify(toSend)))        DEBUG

  //var recvdCe = CloudEvent(message.value)
    //ceToHttp() e poi mandalo via websocket e tramite openCOnnections a nodeserver
}

function ceToHttpReq(cloudevent){
  //TODO
}

function httpReqToCe(reqData){
  const requestToForward = JSON.parse(reqData)
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

  return ce
}
