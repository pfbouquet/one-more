/**
 * Main JavaScript for handling Chromecast interactions.
 */

const applicationID = '41EF74CE';
// const applicationID = '90E7072E';

const NAMESPACE = 'urn:x-cast:com.onemore';
var session = null;

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
                    break;
                case cast.framework.SessionState.SESSION_RESUMED:
                    console.log('CastSession resumed');
                    initializeSession()
                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    console.log('CastSession disconnected');
                    break;
                default:
                    console.log(JSON.stringify(event));
                    break;
            }
        }
    );
};
    
function initializeCastApi() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: applicationID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
};

function initializeSession() {
    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        console.log("Add new message listener to " + castSession.getSessionId());
        castSession.addMessageListener(NAMESPACE, function (namespace, message) {
            console.log(JSON.stringify(namespace));
            data = JSON.parse(message);

            switch (data.eventType) {
                case "text_message":
                    handleTextMessage(data.eventData);
                    break;
                case "game":
                    handleGameEvent(data.eventData);
                    break;
                default:
                    console.log(data.eventType);
                    break;
            }
        });
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
        castSession.sendMessage(NAMESPACE, { eventType: eventType, eventData: eventData }).then(function (e) {
            onSuccess(e);
        }).catch(function (e) {
            onError(e);
        });
    }
    else {

    }
}

function sendTextMessage(message) {
    sendData("text_message", { text: message });
}

function setVolume(volume) {
    let castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        castSession.setVolume(volume).then(function (e) {
            onSuccess(e);
        }).catch(function (e) {
            onError(e);
        });
    }
}

function sendImages() {
    let data = {
        "images": [
            {
                "name": "Marathon",
                "url": "https://media.giphy.com/media/URuzvsMZNVm2wRd9K3/giphy.gif"
            },
            {
                "name": "Crayon",
                "url": "https://images.assetsdelivery.com/compings_v2/yupiramos/yupiramos1712/yupiramos171209834.jpg"
            },
            {
                "name": "Maison",
                "url": "https://images.assetsdelivery.com/compings_v2/iriana88w/iriana88w1409/iriana88w140900821.jpg"
            },
            {
                "name": "Tracteur",
                "url": "https://images.assetsdelivery.com/compings_v2/stefan77/stefan771502/stefan77150200001.jpg"
            },
        ]
    };
    sendData("images", data);
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
    console.log("reveived " + JSON.stringify(data));
    if (data.text != null) {
        initAlert(data.text, "Retour: ", "success");
    }
}

$('#sendMessageBtn').on("click", function () {
    let message = $("#textMessageInput").val();
    sendTextMessage(message);
    // setVolume(0.1);
});
$('#sendSessionID').on("click", function () {
    let session = cast.framework.CastContext.getInstance().getCurrentSession();
    let sessionID = session.getSessionId();
    console.log(sessionID);
    sendTextMessage(sessionID);
});
$('#sendGameEventStart').on("click", function () {
    sendData("game", {eventName: "test"});
});
$('#sendImages').on("click", sendImages);
$('#kill').on('click', stopApp);



