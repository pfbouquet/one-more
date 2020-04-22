/**
 * Main JavaScript for handling Chromecast interactions.
 */

var applicationID = '41EF74CE';
var namespace = 'urn:x-cast:com.onemore';
var session = null;

if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializeCastApi, 1000);
}

function initializeCastApi() {
    console.log("initializeCastApi");

    var sessionRequest = new chrome.cast.SessionRequest(applicationID);
    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

function onInitSuccess() {
    console.log('onInitSuccess');
}

function onError(message) {
    console.log('onError: ' + JSON.stringify(message));
}

function onStopAppSuccess() {
    console.log('onStopAppSuccess');
}

function sessionListener(e) {
    console.log('New session ID: ' + e.sessionId);
    session = e;
    console.log("session AppId = " + session.appId + ", status=" + session.status);
    session.addUpdateListener(sessionUpdateListener);
}

function sessionUpdateListener(isAlive) {
    console.log((isAlive ? 'Session Updated' : 'Session Removed') + ': ' + session.sessionId);
    if (!isAlive) {
        session = null;
    }
};

function receiverListener(e) {
    console.log('Receiver listener' + e);
}

function stopApp() {
    session.stop(onStopAppSuccess, onError);
}

function connect() {
    console.log('connect()');

    if (session != null) {
        console.log("SESSION ALIVE !");
    }
    else {
        chrome.cast.requestSession(function (e) {
            session = e;
            sessionListener(e);
            setVolume(1);
            sendMessage({ "message": "Let's go !" });
        }, onError);
    }
}

function sendMessage(message) {
    session.sendMessage(namespace, message, onSuccessMessage.bind(this, message), onError);
}

function onSuccessMessage(message) {
    console.log('Message - onSuccess: ' + JSON.stringify(message));
}

function setVolume(volume) {
    session.setReceiverVolumeLevel(volume, function () { console.log("Volume set to " + volume) }, onError);
}

$('#connectBtn').on("click", connect);
$('#sendMessageBtn').on("click", function() {
    let text = $("#textMessageInput").val();
    sendMessage({ "message": text });
});
$('#kill').on('click', stopApp);
