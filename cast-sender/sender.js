/**
 * Main JavaScript for handling Chromecast interactions.
 */

const applicationID = '41EF74CE';
const namespace = 'urn:x-cast:com.onemore';
var session = null;

window['__onGCastApiAvailable'] = function (isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }

    var context = cast.framework.CastContext.getInstance();
    context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        function (event) {
            switch (event.sessionState) {
                case cast.framework.SessionState.SESSION_STARTED:
                    console.log('CastSession started');
                    break;
                case cast.framework.SessionState.SESSION_RESUMED:
                    console.log('CastSession resumed');
                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    console.log('CastSession disconnected');
                    break;
            }
        }
    );
};

initializeCastApi = function () {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: applicationID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
};

function onError(message) {
    console.log('onError: ' + JSON.stringify(message));
}

function onSuccess(message) {
    console.log('onSuccess: ' + JSON.stringify(message));
}


function sendData(data) {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
        castSession.sendMessage(namespace, data).then(function (e) {
            onSuccess(e);
        }).catch(function (e) {
            onError(e);
        });
    }
    else
        throw ('SESSION DOES NOT Exist !');
}

function sendTextMessage(message) {
    sendData({ type: "message", text: message });
}

function setVolume(volume) {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
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
        type: "images",
        images: [
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
    }
    sendData(data);
}

function stopApp() {
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession)
        castSession.endSession(true);
}

$('#sendMessageBtn').on("click", function () {
    let message = $("#textMessageInput").val();
    sendTextMessage(message);
    // setVolume(0.1);
});
$('#sendImages').on("click", sendImages);
$('#kill').on('click', stopApp);



