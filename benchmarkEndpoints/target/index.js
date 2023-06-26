'use strict';

import express from 'express';
import WebSocket from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import ntpClient from 'ntp-client';
//Chalk colors: yellow setup,bgGreen kafka related positive updates, green successful response, red error, magenta messages
const myChalk = new chalk.constructor({level: 1, enabled: true, hasColor: true, 
  chalkOptions: {level: 1, enabled: true, hasColor: true, extended: true, 
                 visible: true, colorSupport: true}});

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

    console.log("INFO SUL TEMPO")
    
    console.log("My time 0 : "+ new Date())
    ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
      if(err) {
          console.error(err);
          return;
      }
   
      console.log("NTP time 0: ", date);
  });

  console.log("My time 1 : "+ new Date())
    ntpClient.getNetworkTime("pool.ntp.org", 123, function(err, date) {
      if(err) {
          console.error(err);
          return;
      }
   
      console.log("NTP time 1: ", date);
  });
  
    console.log("FINE INFO SUL TEMPO")

    data = data.toString()
    //Ho ricevuto un messaggio dal proxy (messaggio che arrvia da Kafka) 
    const messageReceived = JSON.parse(data)
    console.log("Message from: "+ messageReceived.header.headers.Origin)
    console.log("Destined to: "+ messageReceived.header.url)
    console.log("Message ID: "+ messageReceived.header.headers['X-Request-ID'])
    console.log("With data: "+ messageReceived.body)
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

//
///**
// * GET /send generate a body and send it trhough the websocket connection and returns the proxy response
// */
//app.get("/send", (req, res) => {
//
//sendMsg(req.query.destination || 'http://myTargetService/myDestPath', "Test del body", res)
//
//});
//
//function sendMsg(destinationUrl, data, httpRes){
//  const target = destinationUrl
//  const requestID = uuidv4()
//  console.log("Invocato /send... UUID:"+requestID)
//
//  //Voglio creare http request senza mandarla perchè è come se mi mettessi in mezzo e intercettassi tutto 
//  //il traffico per poi girarlo al proxy che poi se ne occupa. In modo che il dev del servizio non debba implementare nulla  
//  var httpRequest = new http.IncomingMessage({
//    method: 'GET',
//    url: target,
//    headers: {
//      'Content-Type': 'application/json',
//      'Origin': serviceName,
//      'X-Request-ID': requestID
//    },
//    rawHeaders: ['Content-Type', 'application/json']
//  });
//  httpRequest.data = data
//
//  var toSend = {
//    header: httpRequest.socket,
//    body: httpRequest.data
//  }
//
//  ws.send(JSON.stringify(toSend))
//  flyingRequest.set(requestID, httpRes);
//}
//
//  // Start the server on port 8080
//app.listen(localPort, () => {
//  console.log(`Running on port ${localPort} \n`);
//});
