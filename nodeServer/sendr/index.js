'use strict';

const express = require('express');
const { httpTransport, emitterFor, CloudEvent } = require("cloudevents");
const axios = require('axios');
const { response } = require('express');
import WebSocket, { WebSocketServer } from 'ws';

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const TARGET_IP = "cloudevents-receiver.default.svc.cluster.local";
const TARGET_PORT = "8080";

// Create an emitter to send events to a receiver
const emit = emitterFor(httpTransport("http://cloudevents-receiver.default.svc.cluster.local:8080/callback"));

// App
const app = express();

app.get('/', (req, res) => {
  res.send('I am the sender\n');
});

//I'm now parsing in a pretty brutal way, as soon as the system will be running I'll tune it
//It is not very clear if the CloudEvetn si simply serialzied by the HTTPConsumer
app.get("/send", (req, res) => {

  // Create a new CloudEvent
  const ce = new CloudEvent({
    specversion: '1.0',
    id: 'TEST-#'+Math.floor(Math.random() * 10000).toString(),
    type: 'com.demo.weather-report',
    source: 'https://cloudevents-sender.default.svc.cluster.local/send',
    data: {
      lat: '44.42166302363834', 
      lon: '11.914882614159643',
      temp: Math.floor(Math.random()*50).toString(),
      hum: Math.floor(Math.random()*100).toString(),
      rain: Math.floor(Math.random()*10).toString(),
      rec_time: new Date().toDateString()
    }
  });

  //Still have to understand whether this one is a syncronous or not, worst case scanario (it is syncronous) I'll use axios
  emit(ce);

  console.log("Sent as body: "+JSON.stringify(ce, null, 2));

  res.status(200).send("POST endpoint call terminated\n");

});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT} \n`);
});



