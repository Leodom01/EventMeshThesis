'use strict';

const express = require('express');
const { HTTP } = require('cloudevents');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('I am the receiver \n');
});

//I'm now parsing in a pretty brutal way, as soon as the system will be running I'll tune it
//It is not very clear if the CloudEvetn si simply serialzied by the HTTPConsumer
app.post("/callback", (req, res) => {
  
  console.log("Callback URL pinged!\n");
  console.log("Headers: "+JSON.stringify(req.headers, null, 2));
  console.log("Body: "+JSON.stringify(req.body, null, 2));

  // body and headers come from an incoming HTTP request, e.g. express.js
  const receivedEvent = HTTP.toEvent({headers: req.headers, body: req.body});

  console.log("Message received: "+JSON.stringify(receivedEvent, null, 2)+"\n");
  console.log("Object received: "+receivedEvent+"\n");

  res.status(200).send("Parsing terminated, thank you...\n");
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT} \n`);
});



