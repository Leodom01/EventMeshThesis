/*
'use strict';

const express = require('express');
const { HTTP } = require('cloudevents');

// RocketMQ data
const PORT = 9876;
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

*/
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const co = require("co");

const Producer = require("apache-rocketmq");

co(function *() {
    const producer = new Producer("testGroup", {
        nameServer: "rmq-namesrv.default.svc.cluster.local:9876",
        groupName: "testGroupName",
        logFileNum: 5,
        logFileSize: 1048576000,
        logLevel: "debug",
        compressLevel: 3,
        sendMessageTimeout: 5000,
        maxMessageSize: 1024 * 256
    });

    console.time("producer start");
    try {
        yield producer.start();
    } catch(e) {
        console.error(e);
        process.exit(4);
    }
    console.timeEnd("producer start");
    for(let i = 0; i < 10; i++) {
        console.time(`send ${i}`);
        try {
            const ret = yield producer.send("test", `baz ${i}`, {
                keys: "foo",
                tags: "bar"
            });
            console.timeEnd(`send ${i}`);
            console.log(ret);
        } catch(e) {
            console.error(e);
            console.error(e.stack);
            process.exit(4);
        }
    }

    console.time("producer end");
    yield producer.shutdown();
    console.timeEnd("producer end");
});

