import {updateStateFn} from './state'
import {eventEmitterConstants} from './constants/eventEmiterConstants';
const socket = new WebSocket("ws://localhost:3000" + window.location.pathname);
let socketId = null;

socket.onopen = function() {
    console.log("Connection established.");
};

socket.onclose = function(event) {
    if (event.wasClean) {
        console.log('Соединение закрыто чисто');
    } else {
        console.log('Обрыв соединения'); // например, "убит" процесс сервера
    }
    console.log('Code: ' + event.code + ' reason: ' + event.reason);
};

socket.onmessage = function(event) {
    let data = JSON.parse(event.data);

    if(data.type === "INIT"){
        socketId = data.id;
        updateStateFn({
            type: eventEmitterConstants.REPLACE_STATE_FROM_SAVE,
            state: data.state
        }, "FROM_SERVER")
    }

    if(data.type === "ACTION"){
        updateStateFn(data.action, "FROM_SERVER")
    }
};

socket.onerror = function(error) {
    console.log("Error: " + error.message);
};

function sendMessage(action){
    if(socketId){
        let messageToSend = {
            action,
            id: socketId
        };
        socket.send(JSON.stringify(messageToSend));
    }
}

export {
    sendMessage
}
