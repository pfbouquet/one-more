'use strict';
const namespace = "urn:x-cast:com.onemore";
const context = cast.framework.CastReceiverContext.getInstance();

context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);

context.addCustomMessageListener(namespace, function (customEvent) {
    switch (customEvent.data.type) {
        case "message":
            handleTextMessage(customEvent.data);
            break;
        case "images":
            handleImages(customEvent.data);
            break;
        default:

            break;
    }
});

context.addEventListener(cast.framework.system.EventType.SENDER_CONNECTED, function (event) {
    console.log('Received Sender Connected event: ' + event.senderId);
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
        $("#content").append('</br>' + data.text);
    }
}

function handleImages(data) {
    if (data.images != null) {
        data.images.forEach(image => {
            $("#content").append('</br>' + "<img src=\"" + image.url + "\"/>");
        });
    }
}
