const ROLE_ANGEL = "Angel";
const ROLE_DEVIL = "Devil";
const ROLE_TURNCOAT = "Turncoat";
const ROLE_SAINT_THOMAS = "Saint_Thomas";

let players = {};

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
    console.log("Received game event:" + data.eventName);
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
        default:
            break;
    }
}

function sendGameEvent(eventName, infos) {
    console.log('Sending event '+eventName);
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
    $("#inputKeyword").html(keyword);
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
        $("#startRound").show()
        // Start round click;
        $("#startRoundBtn").on("click", function () {
            $("#startRound").hide();
            console.log("Start Round");
            sendGameEvent("start-round", {});
        });
    })
}

function getSaintThomas() {
    for (const [key, player] of Object.entries(players)) {
        if (player.role === ROLE_SAINT_THOMAS) {
            return player;
        }
    }
}


$('#startGame').on("click", startGameEvent);

$('#showKeyword').on('click', showKeyword);

$('#correct').on('click', sendCorrect);

$('#wrong').on('click', sendWrong);
