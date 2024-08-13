//imports
    const express = require('express');
    const ws = require("ws");
    const path = require('path');
    const fs = require('fs');
    const { stringify } = require('querystring');

//config
    //app conf
        const app = express();
        const port = 3000;
    //serving static files
        app.use(express.static(path.join(__dirname, 'public/')));
        app.use('/bootstrap',
            express.static(path.join(__dirname, 'node_modules/bootstrap/dist/')));
    //view engine settings
        app.set('view engine', 'pug');
        app.set('views', path.join(__dirname, 'views'));
//routes
    app.get('/', (req, res) => {
        res.render("index.pug", {a: "hello world"})
    });
//websocketapplication
    const wss = new ws.Server({port: 500});
    //generate unique id for each connection
    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };


    wss.on('connection', (connection) => {
        //connection management
        connection.id = wss.getUniqueID();
        console.log("user live and connected");
        wss.clients.forEach((client) => {
            console.log('Client.ID: ' + client.id);
        });

        connection.on('message', (data, isBinary) => {
            //processing message to JSON/string
                const message = isBinary ? data : data.toString();
                message_parsed = JSON.parse(message)
                console.log(message_parsed.username, " said :",message_parsed.message);
            //handling NULL msg/username
            if(message_parsed.type === "message"){
                //message type === message
                if(message_parsed.username.length === 0 && message_parsed.message.length === 0 && message_parsed.type === "message"){
                    //if message is void
                    console.error(`warning, this user sent nothing : ${connection.id}`);
                    wss.clients.forEach((client) => {
                        if(client.id === connection.id){
                            console.log("removing user");
                            connection.close();
                        }
                    });
                    
                } else if(message_parsed.canal.length > 0 && message_parsed.username.length > 0 && message_parsed.message.length > 0){
                    //message is alright and is in a canal
                    console.log(`message sent on chat canal : ${chat_canal} `)
                    wss.clients.forEach((client) => {
                        console.log("sending to users in the right canal");
                        if(client.canal === chat_canal){
                            console.log("message sent to every possible adress...");
                            client.send(message);
                        }
                    });
                } else if(message_parsed.username.length > 0 && message_parsed.message.length > 0){
                    //register msg in the "database"
                    var databasePath = path.join(__dirname, 'database/conversation.json');
                    //send msg to all connected users
                    wss.clients.forEach((client) => {
                        console.log("sending to all");
                        client.send(message);
                    });
                }
            } else if(message_parsed.type === "canal"){
                //message type === canal
                //canal selection on live update as modified
                chat_canal = message_parsed.canal;
                console.log(`user selected a canal : ${chat_canal} `)
                connection.canal = chat_canal;
                //canal message prossesing
                

            }
            
                
            
            







            //closing
            connection.on('close', (event) => {
                console.log('User disconnected');
                console.error(`disconnected user : ${connection.id} `)
                console.log(`User disconnected: ${connection.id} (Code: ${event.code}, Reason: ${event.reason})`);
            });
        });
    });
    
//execution
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });