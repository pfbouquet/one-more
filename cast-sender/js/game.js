const ROLE_ANGEL = "Angel";
const ROLE_DEVIL = "Devil";
const ROLE_TURNCOAT = "Turncoat";
const ROLE_SAINT_THOMAS = "Saint Thomas";

let players = {};
let keywords = [];

function initializeGame() {
    console.log("initializeGame");
    players = {};
    keywords = [];
    $("#stThomasReady").hide();
    $("#startRound").hide();
    $("#roundKeyword").hide();
    $("#roundRemember").hide();
    $("#endOfRound").hide();
    // Show
    $("#game").show();
    $("#playerForm").show();
}

function endGame() {
    sendGameEvent("endGame", {});
    initializeGame()
}

function nextRound() {
    sendGameEvent("nextRound", {});
    $("#endOfRound").hide();
}

function handleGameEvent(data) {
    switch (data.eventName) {
        case undefined:
            console.log("Game events need an eventName");
            break;
        case "round-info":
            handleRoundInfo(data);
            break;
        case "newKeyword":
            $("#keyword").html(data.keyword);
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

function startGame() {
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

function handleRoundInfo(data) {
    players = data.players;
    console.log(players);
    let saintThomas = getSaintThomas();
    $("#playerForm").hide();
    $("#stThomasReady").show();
    $("#stThomasReadyMsg").html("<h3>" + saintThomas.name + " is Saint Thomas for this round.</h3><br/><h4>When Saint Thomas is blinded, hit the button ! </h4>");
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
    $("#correctKeywords").html("");
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

// MACRO GAME EVENTS
$('#startGame').on("click", startGame);
$('#endGame').on("click", endGame);
$('#nextRound').on("click", nextRound);

// ROUND EVENTS
// St thomas ready click
    $("#stThomasReadyBtn").on("click", function () {
        sendGameEvent("saint-thomas-blind", {});
        $("#stThomasReady").hide();
        $("#startRound").show();
    });

// Start round click;
$("#startRoundBtn").on("click", function () {
    $("#startRound").hide();
    sendGameEvent("start-round", {});
    $("#roundKeyword").show();
});

$('#correct').on('click', function() {
    sendGameEvent("correct", {})
});
$('#wrong').on('click', function () {
    sendGameEvent("wrong", {})
});

// Timing management
$('#pause').on("click", function () {
    sendGameEvent("progressPause", {});
    $('#correct').hide();
    $('#wrong').hide();
    $('#pause').hide();
    $('#resume').show();
});
$('#resume').on("click", function () {
    sendGameEvent("progressResume", {});
    $('#correct').show();
    $('#wrong').show();
    $('#resume').hide();
    $('#pause').show()
});

// Add click sensor to trip end of round
$('#validateRemember').on("click", roundIsOver);