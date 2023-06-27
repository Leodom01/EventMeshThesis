'use strict';

import express from 'express';
import WebSocket from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import fs from 'fs';
//Chalk colors: yellow setup,bgGreen kafka related positive updates, green successful response, red error, magenta messages
const myChalk = new chalk.constructor({level: 1, enabled: true, hasColor: true, 
  chalkOptions: {level: 1, enabled: true, hasColor: true, extended: true, 
                 visible: true, colorSupport: true}});

// Constants
const localPort = 8080
const logFile = '/var/log/'+process.env.SERVICE_NAME +'/'+ new Date().toISOString();
console.log("Logfile at: ", logFile)
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

//Crea file di log e folder
fs.mkdir('/var/log/'+process.env.SERVICE_NAME, { recursive: true }, (err) => {
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
    var receivedDate = new Date().toISOString()
    data = data.toString()
    if (data.startsWith("ACK")) {
      //Qui sarebbe anchebello aggungere un controllo e avere un timeout per le api, quindi se il messaggio non 
      //arriva al proxy o il proxy non lo inoltra facciamo fallire tutto

      //Ack di messaggio
      const tokens = data.split(" ")
      if (tokens.length == 3 && tokens[2] == "ok") {
        //Messaggio consegnato
        var res = flyingRequest.get(tokens[1])
        //console.log("Conferma consegna: " + tokens[2])        DEBUG
        flyingRequest.delete(tokens[1])
        //console.log("ACK UUID ",tokens[1], " AT ", receivedDate)
        fs.writeFile(logFile, "ACK UUID "+tokens[1]+" AT "+receivedDate+'\n', {flag: 'a'}, (err) => {});
      } else if (tokens.length >= 4 && tokens[2] == "ko") {
        //Messaggio non consegnato
        var res = flyingRequest.get(tokens[1])
        console.log("Errore consegna: " + tokens[2])
        flyingRequest.delete(tokens[1])
      } else {
        console.log("Unknown mesage: " + data)
      }
    }else{
      //Ho ricevuto un messaggio dal proxy (messaggio che arrvia da Kafka) 
      const messageReceived = JSON.parse(data)
      //console.log("GOT UUID", messageReceived.header.headers['X-Request-ID'], " AT ", receivedDate)
      fs.writeFile(logFile, "GOT UUID "+messageReceived.header.headers['X-Request-ID']+" AT "+receivedDate+'\n', {flag: 'a'}, (err) => {});
      pingMessage(messageReceived)
    }
    
  })
}

async function pingMessage(message){
  //console.log("ECCO IL MESSAGGIO ")
  //console.log(message)
  var newOrigin = message.header.url

  message.header.url = "http://"+message.header.headers['Origin']
  message.header.headers['Origin'] = newOrigin
  message.header.headers['X-Request-ID'] = "R" + message.header.headers['X-Request-ID']

  ws.send(JSON.stringify(message))
  var sendDate = new Date().toISOString()
  //console.log("RES UUID ", message.header.headers['X-Request-ID'], " AT ", sendDate)
  fs.writeFile(logFile, "RES UUID "+message.header.headers['X-Request-ID']+" AT "+sendDate+'\n', {flag: 'a'}, (err) => {});
  flyingRequest.set(message.header.headers['X-Request-ID'], message);
}

function startWebSocketConnection() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return;
  }

  connectWebSocket();
  setTimeout(startWebSocketConnection, 5000);
}

startWebSocketConnection();
