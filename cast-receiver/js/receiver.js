'use strict';
const NAMESPACE = "urn:x-cast:com.onemore";
const context = cast.framework.CastReceiverContext.getInstance();

context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);

context.addCustomMessageListener(NAMESPACE, function (customEvent) {
    console.log(JSON.stringify(customEvent.data));
    switch (customEvent.data.eventType) {
        case "text_message":
            handleTextMessage(customEvent.data.eventData);
            break;
        case "images":
            handleImages(customEvent.data.eventData);
            break;
        case "game":
            console.log(customEvent.data.eventData);
            handleGameEvent(customEvent.data.eventData);
            break;
        default:
            break;
    }
});

context.addEventListener(cast.framework.system.EventType.SENDER_CONNECTED, function (event) {
    console.log('Received Sender Connected event: ' + event.senderId);
    // ENVOYER UN CUSTOM MESSSAGE ! 
    context.setApplicationState("Player connected. Let's start a game !");
});

context.addEventListener(cast.framework.system.EventType.READY, function (event) {
    console.log('Received Ready event: ' + JSON.stringify(event.data));
    context.setApplicationState('one more is ready...');
});

context.start();

function handleTextMessage(data) {
    console.log("reveived " + JSON.stringify(data));
    if (data.text != null) {
        $("#content").prepend('</br>' + data.text);
        sendTextMessage("Message reçu : " + data.text);
    }
}

function handleImages(data) {
    if (data.images != null) {
        data.images.forEach(image => {
            $("#content").prepend('</br>' + "<img src=\"" + image.url + "\"/>");
        });
    }
}

function onError(message) {
    console.log('onError: ' + JSON.stringify(message));
}

function onSuccess(message) {
    console.log('onSuccess: ' + JSON.stringify(message));
}

function sendDataToSenders(eventType, eventData) {
    context.sendCustomMessage(NAMESPACE, undefined, { eventType: eventType, eventData: eventData });
}

function sendTextMessage(message) {
    sendDataToSenders("text_message", {text: message});
}

function sendError(message) {
    sendDataToSenders("error_message", {message: message});
}

/**
 *
 * @param array
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}