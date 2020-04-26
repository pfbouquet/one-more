let players = {};

function initializeGame() {
    console.log("initializeGame");
    document.getElementById("game").style.display= "inline-block";
    displayPlayerForm()
}

function leaveGame() {
    console.log("leaveGame");
    document.getElementById("game").style.display= "none";
}

function handleGameEvent(data) {
    switch (data.eventName) {
        case undefined:
            console.log("Game events need an eventName");
            break;
        case "Start":
            console.log("Launching game event " + data.eventName);
            break;
        case "newKeyword":
            console.log("Launching game event " + data.eventName);

        default:
            console.log("Launching game event " + data.eventName);
            break;
    }
}

function sendGameEvent(eventName, infos) {
    infos.eventName = eventName;
    sendData("game", infos)
}

function displayPlayerForm() {
    console.log("displayPlayerForm");
    document.getElementById("playerForm").style.display= "inline-block";
}

function startGameEvent() {
    players = {};
    for (let step = 1; step <= 7; step++) {
      // Runs 5 times, with values of step 0 through 4.
      let playerName = $("#player"+step).val();
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

$('#startGame').on("click", startGameEvent);

$('#showKeyword').on('click', showKeyword);

$('#correct').on('click', sendCorrect);

$('#wrong').on('click', sendWrong);
