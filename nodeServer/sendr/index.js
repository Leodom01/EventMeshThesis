'use strict';

const express = require('express');
const { httpTransport, emitterFor, CloudEvent } = require("cloudevents");
const axios = require('axios');
const { response } = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const TARGET_IP = "cloudevents-receiver.default.svc.cluster.local";
const TARGET_PORT = "8080";

// Create an emitter to send events to a receiver
//const emit = emitterFor(httpTransport("http://" + TARGET_IP + ":" + TARGET_PORT + "/callback"));

// App
const app = express();

app.get('/', (req, res) => {
  res.send('I am the sender\n');
});

//I'm now parsing in a pretty brutal way, as soon as the system will be running I'll tune it
//It is not very clear if the CloudEvetn si simply serialzied by the HTTPConsumer
app.get("/send", (req, res) => {

  /*
  const header = {
    'Content-Type': 'application/json',
    'CE-SpecVersion': '1.0',
    'CE-Type': "com.demo.weather-report",
    'CE-Source': "/send",
    'CE-ID': "TEST-#" + Math.floor(Math.random() * 1000).toString(),
    'CE-Time': new Date().toISOString()
  }
  */

  // Create a new CloudEvent
  //const ce = new CloudEvent(msgToSend);
  const ce = new CloudEvent({
    specversion: '1.0',
    id: 'my-event-id',
    type: 'com.example.myevent',
    source: 'https://cloudevents-sender.default.svc.cluster.local/send',
    data: {
      message: 'Hello, CloudEvent!'
    }
  });

  const emit = emitterFor(httpTransport("http://cloudevents-receiver.default.svc.cluster.local:8080/callback"));

  emit(ce)
    .then(response => {
      console.log("Emit response: "+response.data);
    })
    .catch(err => {
      // Deal with errors
      console.log("Error during event post");
      console.error(err);
    });

  //const httpMessage = HTTP.structured(ce);
/**
  // Send it to the endpoint - encoded as HTTP binary by default
  //emit(ce);
  axios.post('http://' + TARGET_IP + ':' + TARGET_PORT + '/callback', ce, {
    headers: {
      'Content-Type': 'application/cloudevents+json'
    }
  }).then(response => {
    res.status(200).send(response.data);
    return;
  }).catch(err => {
    res.status(500).send(err.response.data);
    return;
  });
  */
  console.log("Sent as body: "+JSON.stringify(ce, null, 2));
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT} \n`);
});



