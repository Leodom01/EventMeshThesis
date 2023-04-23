'use strict';

import express from 'express';
import { httpTransport, emitterFor, CloudEvent } from "cloudevents";
import { response } from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import axios from 'axios';
import http from 'http';

// Constants
const localPort = 8080

// App
const app = express();

//Setup websocket
const ws = new WebSocket('ws://kafka-proxy.default.svc.cluster.local:80');

ws.on('error', console.error);
ws.on('open', function open(){
  console.log("Connesso a websocekt...")
})
ws.on('message', function message(data){
  console.log('Received: %s', data)
})
/**
 * GET /send generate a body and send it trhough the websocket connection and returns the proxy response
 */
app.get("/send", (req, res) => {
  console.log("Invocato /send...")

  //Voglio creare http request senza mandarla perchè è come se mi mettessi in mezzo e intercettassi tutto 
  //il traffico per poi girarlo al proxy che poi se ne occupa. In modo che il dev del servizio non debba implementare nulla  
  const httpRequest = new http.IncomingMessage({
    method: 'GET',
    url: 'http://myTargetService/myDestPath',
    headers: {
      'Content-Type': 'application/json'
    },
    rawHeaders: ['Content-Type', 'application/json']
  });
  httpRequest.data = "Test del body :)"

  ws.send(JSON.stringify(httpRequest))

  console.log("Sent message: "+JSON.stringify(httpRequest))
  res.status(200).send('Hopefully I sent it! \n');
});

  // Start the server on port 8080
app.listen(localPort, () => {
  console.log(`Running on port ${localPort} \n`);
});



