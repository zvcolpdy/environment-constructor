'use strict';
const {eventEmitterConstants} = require('../../client/src/constants/eventEmiterConstants');
let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require('./http-server');
let url = require('url');
const Scene = require('./models/scene');

// Create web socket server on top of a regular http server
let wss = new WSServer({
    server: server
});

function saveScene(scene) {
    Scene.findByIdAndUpdate(scene._id, {objectsScheme: scene.objectsScheme}, function (err, scene) {
        // TODO: notify user
    });
}

function debounce(f, ms) {

    let timer = null;

    return function (...args) {
        const onComplete = () => {
            f.apply(this, args);
            timer = null;
        }

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(onComplete, ms);
    };
}

// state objects;
const clients = {};
let scenesScheme = {};

function updateState(action, sceneId){
    let currentScene = scenesScheme[sceneId];
    let objectsScheme = currentScene.objectsScheme;
    switch(action.type){
        case eventEmitterConstants.REPLACE_STATE_FROM_SAVE: {
            // TODO
            scenesScheme[sceneId].objectsScheme = action.state;
            break;
        }
        case eventEmitterConstants.ADD_OBJECT_DATA: {
            const {_id, src} = action;
            objectsScheme[_id] = {
                _id,
                src: src,
                position: {x: 0, y: 0, z: 0},
                scale: 1,
                rotation: 0,
                arrOfMaterialColors: []
            };
            break;
        }
        case eventEmitterConstants.DRAG_OBJECT: {
            objectsScheme[action._id].position = action.position;
            break;
        }

        case eventEmitterConstants.ROTATE_OBJECT: {
            objectsScheme[action._id].rotation = action.radians;
            break;
        }
        case eventEmitterConstants.SCALE_OBJECT: {
            objectsScheme[action._id].scale = action.scale;
            break;
        }
        case eventEmitterConstants.DELETE_OBJECT: {
            delete objectsScheme[action._id];
            break;
        }
        case eventEmitterConstants.CHANGE_MATERIAL_COLOR: {
            objectsScheme[action._id].arrOfMaterialColors[action.color.index] = action.color.value;
            break;
        }
        case eventEmitterConstants.PASTE_MODEL: {
            const {newId, copyBufferObjectId} = action;

            if(!copyBufferObjectId)
                break;

            let {arrOfMaterialColors, position} = objectsScheme[copyBufferObjectId];

            let newObjectScheme = Object.assign(
                {},
                objectsScheme[copyBufferObjectId],
                {
                    _id: newId,
                    arrOfMaterialColors: [...arrOfMaterialColors],
                    position: Object.assign({}, position)
                });
            objectsScheme[newObjectScheme._id] = newObjectScheme;
            break;
        }

    }
    currentScene.saveToDB(currentScene)
}

// Also mount the app here
server.on('request', app);

wss.on('connection', function connection(ws, req) {

    let url_parts = url.parse(req.url, true);
    let sceneId = url_parts.pathname.substr(1).split("/")[1];

    let id = Math.random().toString();

    const initClient = (sceneId) => {
        clients[id] = {
            sceneId: sceneId,
            ws: ws
        };
    };

    const sendInitScene = () => {
        let dataToInitialize = {id: id, type: "INIT", state: scenesScheme[sceneId].objectsScheme};
        ws.send(JSON.stringify(dataToInitialize));
    };

    if(scenesScheme[sceneId]){
        initClient(sceneId);
        scenesScheme[sceneId].clients.push(id);
        sendInitScene();
    } else {
        Scene.findById({_id: sceneId}, function (err, scene) {
            if(!scene) return;

            initClient(scene._id);
            scenesScheme[scene._id] = {
                _id: scene._id,
                objectsScheme: scene.objectsScheme || {},
                clients: [id],
                saveToDB: debounce((scene) =>  {
                    saveScene(scene);
                }, 3000)
            };
            sendInitScene();
        });
    }

    ws.on('message', function incoming(message) {
        let answer = JSON.parse(message);
        let currentSceneId = clients[answer.id].sceneId;
        let currentScene = scenesScheme[currentSceneId];

        updateState(answer.action, currentSceneId);

        currentScene.clients.forEach(clientId => {
            if(clientId !== answer.id){
                let request = {
                    action: answer.action,
                    type: "ACTION"
                };
                clients[clientId].ws.send(JSON.stringify(request));
            }
        });
    });

    ws.on('close', function close(ws) {
        let userSceneClients = scenesScheme[clients[id].sceneId].clients;
        let index = userSceneClients.indexOf(id);
        if (index > -1) {
            userSceneClients.splice(index, 1);
        }
        if(!userSceneClients.length){
            delete scenesScheme[clients[id].sceneId]
        }
        delete clients[id];
    });

});

// process.env.PORT
server.listen(3000, function() {
    console.log(`http/ws server listening on 3000`);
});