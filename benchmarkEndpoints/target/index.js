'use strict';

import express from 'express';
import WebSocket from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
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
    var receivedDate = new Date()
    data = data.toString()
    //Ho ricevuto un messaggio dal proxy (messaggio che arrvia da Kafka) 
    const messageReceived = JSON.parse(data)
    console.log("UUID", messageReceived.header.headers['X-Request-ID'], " AT ", receivedDate)
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
