const MINIMUM_PLAYER = 4;

const ROLE_ANGEL = "ANGEL";
const ROLE_DEVIL = "DEVIL";
const ROLE_TURNCOAT = "TURNCOAT";
const ROLE_SAINT_PETER = "SAINT_PETER";

const KEYWORD_BASE = ['tracteur', 'crayon', 'chat', 'chien', 'vache', 'corona', 'scientifique'];
const GIPHY_API_KEY = '6zRQ8OiObokf7ql3Ez21CgNu8ljMGosp';

let players;
let roundNumber;

/**
 *
 * @param eventName
 * @param infos
 */

function sendGameEvent(eventName, infos) {
    infos.eventName = eventName;
    sendDataToSenders("game", infos)
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
        case "newKeyword":
            console.log("Launching game event " + data.eventName);
            displayKeyword(data.keyword);
            break;
        case "correct":
            console.log("Launching game event " + data.eventName);
            keywordCorrect();
            break;
        case "wrong":
            console.log("Launching game event " + data.eventName);
            keywordWrong();
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

        roundNumber = 1;

        let dreamerOrder=1;
        for(const [key, player] of Object.entries(players)) {
            players[key].dreamerOrder = dreamerOrder;
            players[key].score = 0;
            dreamerOrder++;
        }

        prepareRound();

        console.log(players);
        updatePlayerList();
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

    sendGameEvent("round-info", {players: players});

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

function updatePlayerList(withColor = false) {
    let playerArray = getSortedPlayerArray();

    let playerList = $('#playerList');
    playerList.html("");
    playerList.show();
    playerList.append("<div class='list-group-item list-group-item-action active'> players (" + playerArray.length + ")</div>");
    for(const [key, player] of playerArray) {
        let color= "black"
        if(withColor) {
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
        }
        playerList.append("<div class='list-group-item list-group-item-action' style='color: " + color + "'>" + player.name + " : " + player.score + "</div>");
        console.log("KEY = " + key);
    }
}

function getSortedPlayerArray() {
    let playerArray = Object.entries(players);

    playerArray.sort(function(a, b) {
        console.log(a[1].score + " - " + b[1].score + " = " + (a[1].score - b[1].score));
        return  b[1].score - a[1].score;
    })

    return playerArray;
}

/**
 * word management
 */
function keywordCorrect() {
    let keyword = $("#inputKeyword").val();
    $("#keywordCorrect").prepend("<p>"+keyword+"</p>");
    keywordNew()
}

function keywordWrong() {
    let keyword = $("#inputKeyword").val();
    $("#keywordWrong").prepend("<p>"+keyword+"</p>");
    keywordNew()
}

function keywordNew() {
    let keyword = _.sample(KEYWORD_BASE);
    // replace HTTML
    $("#keyword").html("<p>"+keyword+"</p>");
    keywordGif(keyword)
}

function keywordGif(keyword) {
    // get and display image
    fetch('https://api.giphy.com/v1/gifs/search?api_key=' + GIPHY_API_KEY + '&q=' + keyword + '&limit=1&offset=0&rating=G&lang=fr')
        .then(data => {
            return data.json()
        })
        .then(res => {
            gif_url = res.data[0].images.fixed_height.url;
            console.log('Gif for '+keyword+': '+ gif_url);
            $("#keyword").prepend('</br>' + "<img src=\"" + gif_url + "\"/>");
        })
        .then(sendGameEvent("newKeyword", {keyword: keyword}))
        .catch(error => {
            console.log(error)
        })
}
