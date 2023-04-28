'use strict';

import express from 'express';
import { httpTransport, emitterFor, CloudEvent } from "cloudevents";
import { response } from 'express';
import WebSocket, { WebSocketServer } from 'ws';
import axios from 'axios';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';

// Constants
const localPort = 8080
//I need to find a way to get it from the kubernetes service
let support;
if(typeof process.env.SERVICE_NAME === 'undefined'){
  console.log("WARNING: Set SERVICE_NAME env var to define the service name!")
  support = "unnamed_service-"+Math.floor(Math.random() * 1000000)
  console.log("Service name randomly generated: "+support)
}else{
  support = process.env.SERVICE_NAME
  console.log("Service name set: "+support)
}
const serviceName = support


//Map for request on air, contains UUID of the request and its departure time
const flyingRequest = new Map();

// App
const app = express();

//Setup websocket
let ws;

function connectWebSocket() {
  try{
    ws = new WebSocket("ws://" + process.env.PROXY_ENDPOINT + ":" + process.env.PROXY_WEBSOCKET_PORT);
  }catch(err){
    //Magari segnalo un tentativo fallito, ma magari no
    console.log("WS Connection failed, retry in 5 sec")
  }
  
  console.log("Connectiong to: " + "ws://" + process.env.PROXY_ENDPOINT + ":" + process.env.PROXY_WEBSOCKET_PORT)

  ws.on('error', console.error);
  ws.on('open', function open() {
    console.log("Connesso a websocekt...")
    //After websocket is connected I send a RecordMe: request
    ws.send("RecordMe:" + serviceName)
  })
  ws.on('message', function message(data) {
    
    data = data.toString()
    if (data.startsWith("ACK")) {
      //Qui sarebbe anchebello aggungere un controllo e avere un timeout per le api, quindi se il messaggio non 
      //arriva al proxy o il proxy non lo inoltra facciamo fallire tutto

      //Ack di messaggio
      const tokens = data.split(" ")
      if (tokens.length == 3 && tokens[2] == "ok") {
        //Messaggio consegnato
        var res = flyingRequest.get(tokens[1])
        console.log("Conferma consegna: " + tokens[2])
        res.status(200).send(tokens[1] + " OK")
        flyingRequest.delete(tokens[1])
      } else if (tokens.length >= 4 && tokens[2] == "ko") {
        //Messaggio non consegnato
        var res = flyingRequest.get(tokens[1])
        console.log("Errore consegna: " + tokens[2])
        res.status(500).send(tokens[1] + " KO:" + tokens.slice(3).join(' '))
        flyingRequest.delete(tokens[1])
      } else {
        console.log("Unknown mesage: " + data)
      }
    }
  })
}

function startWebSocketConnection() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  connectWebSocket();
  setTimeout(startWebSocketConnection, 5000);
}

startWebSocketConnection();

/**
 * GET /send generate a body and send it trhough the websocket connection and returns the proxy response
 */
app.get("/send", (req, res) => {
  
  const requestID = uuidv4()
  console.log("Invocato /send... UUID:"+requestID)

  //Voglio creare http request senza mandarla perchè è come se mi mettessi in mezzo e intercettassi tutto 
  //il traffico per poi girarlo al proxy che poi se ne occupa. In modo che il dev del servizio non debba implementare nulla  
  var httpRequest = new http.IncomingMessage({
    method: 'GET',
    url: 'http://myTargetService/myDestPath',
    headers: {
      'Content-Type': 'application/json',
      'Origin': serviceName,
      'X-Request-ID': requestID
    },
    rawHeaders: ['Content-Type', 'application/json']
  });
  httpRequest.data = "Test del body :)"

  var toSend = {
    header: httpRequest.socket,
    body: httpRequest.data
  }

  ws.send(JSON.stringify(toSend))
  flyingRequest.set(requestID, res);

  //tengo on hold la risposta finchè non mi arriva il messaggio di conferma o meno dal proxy

  //console.log("Sent message: "+JSON.stringify(toSend))
  //Handle response from ws before returning status 200 and check error cases
  //res.status(200).send('Hopefully I sent it! \n');
});

  // Start the server on port 8080
app.listen(localPort, () => {
  console.log(`Running on port ${localPort} \n`);
});
