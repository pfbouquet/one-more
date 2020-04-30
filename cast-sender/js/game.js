const ROLE_ANGEL = "Angel";
const ROLE_DEVIL = "Devil";
const ROLE_TURNCOAT = "Turncoat";
const ROLE_SAINT_THOMAS = "Saint_Thomas";

let players = {};
let keywords = [];

function initializeGame() {
    console.log("initializeGame");
    document.getElementById("game").style.display = "inline-block";
    displayPlayerForm()
}

function leaveGame() {
    console.log("leaveGame");
    document.getElementById("game").style.display = "none";
}

function handleGameEvent(data) {
    switch (data.eventName) {
        case undefined:
            console.log("Game events need an eventName");
            break;
        case "Start":
            break;
        case "newKeyword":
            showKeyword(data.keyword);
            break;
        case "round-info":
            handleRoundInfo(data);
            break;
        case "timeIsOver":
            roundTimeIsOver(data.keywords);
            break;
        default:
            break;
    }
}

function sendGameEvent(eventName, infos) {
    infos.eventName = eventName;
    sendData("game", infos)
}

function displayPlayerForm() {
    console.log("displayPlayerForm");
    document.getElementById("playerForm").style.display = "inline-block";
}

function startGameEvent() {
    players = {};
    for (let step = 1; step <= 7; step++) {
        // Runs 5 times, with values of step 0 through 4.
        let playerName = $("#player" + step).val();
        if (playerName.length > 0) {
            players[playerName] = {'name': playerName}
        }
    }
    console.log(players);
    sendGameEvent("start-game", {players: players})
}

function showKeyword(keyword) {
    $("#keyword").html(keyword);
}

function sendCorrect() {
    sendGameEvent("correct", {})
}

function sendWrong() {
    sendGameEvent("wrong", {})
}

function handleRoundInfo(data) {
    players = data.players;
    console.log(players);
    let saintThomas = getSaintThomas();
    $("#playerForm").hide();
    $("#stThomasReady").show();
    $("#stThomasReadyMsg").html("<h3>" + saintThomas.name + " is Saint Thomas for this round.</h3><br/><h4>When Saint Thomas is blinded, hit the button ! </h4>");
    // St thomas ready click
    $("#stThomasReadyBtn").on("click", function () {
        sendGameEvent("saint-thomas-bind", {});
        $("#stThomasReady").hide();
        $("#startRound").show();
    });
    // Start round click;
    $("#startRoundBtn").on("click", function () {
        $("#startRound").hide();
        sendGameEvent("start-round", {});
        $("#roundKeyword").show();
        $('#correct').on('click', sendCorrect);
        $('#wrong').on('click', sendWrong);

        // To delete
        $('#timeIsOver').on('click', function() {
            console.log('Time is over clicked');
            sendGameEvent("timeIsOver", {})
        });

    });
}

function roundTimeIsOver(k) {
    keywords = k;
    let elmtCorrectKeywords = $("#correctKeywords");

    // Clean
    $("#roundKeyword").hide();
    elmtCorrectKeywords.html("");

    // Display
    let nbCorrectKeywords=0;
    for (let i = 0; i < keywords.length; i++) {
        if (keywords[i].found) {
            nbCorrectKeywords++;
            elmtCorrectKeywords.append("<div id='"+keywords[i].keywordId+"' class='keyword correctKeyword' onclick=rememberedKeywordUpdate(this)>"+keywords[i].keyword+"</div>");
        }
    }
    $("#nbCorrectKeywords").html(nbCorrectKeywords);
    $("#nbRememberedKeywords").html(0);
    $("#roundRemember").show();

    // Add click sensor to trip end of round
    $('#validateRemember').on("click", roundIsOver);
}

function rememberedKeywordUpdate(correctKeyword) {
    let elmtNbRememberedKeywords = $("#nbRememberedKeywords");
    let nbRememberedKeywords = parseInt(elmtNbRememberedKeywords.html(), 10);

    if ($(correctKeyword).hasClass('remembered')) {
        sendGameEvent("remembered", {rememberedKeywordId: $(correctKeyword).attr('id'), remembered: false});
        $(correctKeyword).removeClass('remembered');
        elmtNbRememberedKeywords.html(nbRememberedKeywords-1);
    }
    else {
        sendGameEvent("remembered", {rememberedKeywordId: $(correctKeyword).attr('id'), remembered: true});
        $(correctKeyword).addClass('remembered');
        elmtNbRememberedKeywords.html(nbRememberedKeywords+1);
    }
}

function roundIsOver() {
    sendGameEvent("roundIsOver", {});

    $("#roundRemember").hide();
    $("#endOfRound").show();

}

function getSaintThomas() {
    for (const [key, player] of Object.entries(players)) {
        if (player.role === ROLE_SAINT_THOMAS) {
            return player;
        }
    }
}

$('#startGame').on("click", startGameEvent);
