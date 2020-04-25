const MINIMUM_PLAYER = 4;

const ROLE_ANGEL = "ANGEL";
const ROLE_DEVIL = "DEVIL";
const ROLE_TURNCOAT = "TURNCOAT";
const ROLE_SAINT_PETER = "SAINT_PETER";

let players;
let roundNumber;

/**
 *
 * @param eventName
 * @param infos
 */
function sendGameData(eventName, infos) {
    infos.eventName = eventName;
    sendDataToSenders("text_message", eventName);
}

/**
 * Handle game events based on the event name
 * @param data
 */
function handleGameEvent(data) {
    switch (data.eventName) {
        case undefined:
            console.log("Game events need an eventName");
            break;
        case "start-game":
            console.log("Launching game event " + data.eventName);
            startGame(data.players);
            break;
        default:
            console.log("Launching game event " + data.eventName);
            break;
    }
}

/**
 *
 * @param __players
 */
function startGame(__players) {
    try {
        console.log("HELLO ! ");
        players = __players;
        if(Array.isArray(players)) {
            throw new Error("player list is not correct.");
        }

        if(Object.keys(players).length < 4) {
            throw new Error("Must have 4 players or more.");
        }

        let playerList = $('#playerList');
        playerList.html("");
        playerList.show();

        roundNumber = 1;

        let dreamerOrder=1;
        for(const [key, player] of Object.entries(players)) {
            players[key].dreamerOrder = dreamerOrder;
            dreamerOrder++;
        }

        prepareRound();

        for(const [key, player] of Object.entries(players)) {
            let color= "black"
            switch (player.role) {
                case ROLE_TURNCOAT:
                    color = "black";
                    break;
                case ROLE_DEVIL:
                    color = "red";
                    break;
                case ROLE_ANGEL:
                    color = "green";
                    break;
                case ROLE_SAINT_PETER:
                    color = "blue";
                    break;
            }
            playerList.append("<div class='col-md-4' style='color: " + color + "'>" + player.name + "</div>");
            console.log("KEY = " + key);
        }
        console.log(players);

    } catch(exception) {
        sendError(exception.message);
    }
}

/**
 *
 */
function prepareRound() {
    // Get an array of player key
    let roleNumber = 0;
    let roles = getRoles(Object.entries(players).length);
    shuffle(roles);

    for(const [key, player] of Object.entries(players)) {
        if(roundNumber === player.dreamerOrder) {
            players[key].role = ROLE_SAINT_PETER;
        }
        else {
            players[key].role = roles[roleNumber];
            roleNumber++;
        }
    }
    console.log(players);

    sendGameData("round-info", {players: players});

}

function getRoles(playerNumber) {
    switch (playerNumber) {
        case 4:
            return [ROLE_ANGEL, ROLE_DEVIL, ROLE_TURNCOAT, ROLE_TURNCOAT];
        case 5:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_TURNCOAT, ROLE_TURNCOAT];
        case 6:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT];
        case 7:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT, ROLE_TURNCOAT];
        case 8:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT];
        case 9:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT, ROLE_TURNCOAT];
        case 10:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT];
        case 11:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT, ROLE_TURNCOAT];
        case 12:
            return [ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_ANGEL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_DEVIL, ROLE_TURNCOAT, ROLE_TURNCOAT, ROLE_TURNCOAT];
    }
}