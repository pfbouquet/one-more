'use strict';
const NAMESPACE = "urn:x-cast:com.onemore";
const context = cast.framework.CastReceiverContext.getInstance();
const options = new cast.framework.CastReceiverOptions();

context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
options.disableIdleTimeout = true;

context.addCustomMessageListener(NAMESPACE, function (customEvent) {
    console.log('Received :' + JSON.stringify(customEvent.data));
    switch (customEvent.data.eventType) {
        case "text_message":
            handleTextMessage(customEvent.data.eventData);
            break;
        case "images":
            handleImages(customEvent.data.eventData);
            break;
        case "game":
            console.log(customEvent.data.eventData);
            console.log("PLAY SOUND");
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

// Start Options
context.start(options);


const playbackConfig = new cast.framework.PlaybackConfig();
playbackConfig.manifestRequestHandler = requestInfo => {
    requestInfo.withCredentials = true;
};

// Start Playback configuration
context.start({playbackConfig: playbackConfig});

const playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();

playerManager.addEventListener(cast.framework.events.EventType.MEDIA_STATUS, (event) => {
    console.log(event)
});

playerManager.setMessageInterceptor(cast.framework.messages.MessageType.LOAD, loadRequestData => {
    if (!loadRequestData.media.entity) {
        // Copy the value from contentId for legacy reasons if needed
        loadRequestData.media.entity = loadRequestData.media.contentId;
    }

    return thirdparty.fetchAssetAndAuth(loadRequestData.media.entity,
        loadRequestData.credentials)
        .then(asset => {
            loadRequestData.media.contentUrl = asset.url;
            return loadRequestData;
        });
});


function handleTextMessage(data) {
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
    let data = { eventType: eventType, eventData: eventData };
    console.log('Sending : '+JSON.stringify(data));
    context.sendCustomMessage(NAMESPACE, undefined, data);
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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}