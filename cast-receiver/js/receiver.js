/**
 * Main JavaScript for handling Chromecast interactions.
 */

var namespace = "urn:x-cast:com.onemore";

window.onload = function () {
    // LOG LEVEL : DEBUG
    cast.receiver.logger.setLevelValue(0);

    // GET INSTANCE
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    // READY
    castReceiverManager.onReady = function (event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState('one more is ready...');
    };

    // CONNECT
    castReceiverManager.onSenderConnected = function (event) {
        console.log('Received Sender Connected event: ' + event.senderId);
    };

    // DISCONNECT
    castReceiverManager.onSenderDisconnected = function (event) {
        console.log('Received Sender Disconnected event: ' + event.senderId);
    };

    // MESSAGE BUS
    window.messageBus =
        window.castReceiverManager.getCastMessageBus(
            namespace, cast.receiver.CastMessageBus.MessageType.JSON);

    // ON MESSAGE
    window.messageBus.onMessage = function (event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);
        handleMessage(event.senderId, event.data);
    }

    // Initialize the CastReceiverManager with an application status message.
    window.castReceiverManager.start({ statusText: 'Application is starting' });
    console.log('Receiver Manager started');
};

function handleMessage(senderId, data) {
    console.log(senderId + "has sent " + JSON.stringify(data));

    if(data.message != null) {
        $("#content").append('</br>' + data.message);
    }

    if(data.images != null) {
        data.images.forEach(image => {
            $("#content").append('</br>' + "<img src=\"" + image.url + "\"/>");
        });
    }
}