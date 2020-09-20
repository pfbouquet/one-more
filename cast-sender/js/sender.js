/**
 * Main JavaScript for handling Chromecast interactions.
 */

// Prod
const applicationID = '90E7072E';
// Constant
// const applicationID = '41EF74CE';
// PF
//const applicationID = '220A8BDE';


const NAMESPACE = 'urn:x-cast:com.onemore';

$(document).ready(function () {
    console.log("HELLO ! ")
});

window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) {
        console.log("AVAILABLE");
        // initAlert("Sélectionnez un chrome cast", "Bienvenue ! ", "success");
        initializeCastApi();
    }

    var context = cast.framework.CastContext.getInstance();
    context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        function (event) {
            switch (event.sessionState) {
                case cast.framework.SessionState.SESSION_STARTED:
                    console.log('CastSession started');
                    initializeSession();
                    initializeGame();
                    break;
                case cast.framework.SessionState.SESSION_RESUMED:
                    console.log('CastSession resumed');
                    initializeSession();
                    initializeGame();
                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    console.log('CastSession disconnected');
                    kill();
                    break;
                default:
                    console.log(JSON.stringify(event));
                    break;
            }
        }
    );
};

function initializeCastApi() {
    console.log("Initializing with applicationID=" + applicationID);
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: applicationID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.PAGE_SCOPED
    });
}

function initializeSession() {
    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        console.log("Add new message listener to " + castSession.getSessionId());
        castSession.addMessageListener(NAMESPACE, function (namespace, message) {
            let data = JSON.parse(message);
            console.log("Received : "+JSON.stringify(data));
            switch (data.eventType) {
                case "text_message":
                    handleTextMessage(data.eventData);
                    break;
                case "game":
                    handleGameEvent(data.eventData);
                    break;
                default:
                    console.log(JSON.stringify(data));
                    break;
            }
        });
        console.log("Cast is ready, ")
    }
    else{
        console.log("Session is not set");
    }
}

function onError(message) {
    console.log('onError: ' + JSON.stringify(message));
}

function onSuccess(message) {
    console.log('onSuccess: ' + JSON.stringify(message));
}

function sendData(eventType, eventData) {
    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        let data = { eventType: eventType, eventData: eventData };
        console.log('Sending : '+JSON.stringify(data));
        castSession.sendMessage(NAMESPACE, data).then(function (e) {
            onSuccess(e);
        }).catch(function (e) {
            onError(e);
        });
    }
}

function sendSound(mediaContentURL) {
    console.log("Send sound " + mediaContentURL);
    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();

    var mediaInfo = new chrome.cast.media.MediaInfo(mediaContentURL, "audio/mpeg");
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    castSession.loadMedia(request).then(
        function() { console.log('Load succeed'); },
        function(errorCode) { console.log('Error code: ' + errorCode); });
}

function stopApp() {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession)
        castSession.endSession(true);
}

function initAlert(message, title, type = "danger") {
    var cls = 'alert-' + type;
    var html = '<div class="alert ' + cls + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
    if (typeof title !== 'undefined' && title !== '') {
        html += '<h4>' + title + '</h4>';
    }
    html += '<span>' + message + '</span></div>';
    $('#alert_placeholder').html(html);
}

function handleTextMessage(data) {
    if (data.text != null) {
        initAlert(data.text, "Retour: ", "success");
    }
}

function kill() {
    endGame();
    stopApp()
}
