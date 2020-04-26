const MINIMUM_PLAYER = 4;

const ROLE_ANGEL = "Angel";
const ROLE_DEVIL = "Devil";
const ROLE_TURNCOAT = "Turncoat";
const ROLE_SAINT_THOMAS = "Saint_Thomas";

let keywordArray = ['tracteur', 'crayon', 'chat', 'chien', 'vache', 'corona', 'scientifique'];
let keywordArrayCursor = 0;
shuffle(keywordArray);

const GIPHY_API_KEY = '6zRQ8OiObokf7ql3Ez21CgNu8ljMGosp';

let players;
let roundNumber;

/**
 *
 * @param eventName
 * @param infos
 */

function sendGameEvent(eventName, infos) {
    console.log('Sending event '+eventName)
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
        case "saint-thomas-bind" :
            console.log("Launching game event " + data.eventName);
            displayLaunchGame();
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
    } catch(exception) {
        sendError(exception.message);
    }
}

/**
 *
 */
function prepareRound() {
    updateRoundNumber();

    // Get an array of player key
    let roleNumber = 0;
    let roles = getRoles(Object.entries(players).length);
    shuffle(roles);

    for(const [key, player] of Object.entries(players)) {
        if(roundNumber === player.dreamerOrder) {
            players[key].role = ROLE_SAINT_THOMAS;
        }
        else {
            players[key].role = roles[roleNumber];
            roleNumber++;
        }
    }
    updatePlayerList(false);

    displayGetReadyMessage();
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

function displayGetReadyMessage(){
    let saintThomas = getSaintThomas();
    $("#game-content").html("<h2>" + saintThomas.name + " you are Saint Thomas for this round. Go blind ! </h2><br/><h4>When Saint Thomas is blind, hit ready ! </h4>")
}

function displayLaunchGame(){
    updatePlayerList(true);
    $("#game-content").html("<h2>Watch your personal role for this round. </h2><br/><h4>When everyone is ready, click on the button the start the round ! </h4>")
}

function getSaintThomas(){
    for(const [key, player] of Object.entries(players)) {
        if(player.role === ROLE_SAINT_THOMAS) {
            return player;
        }
    }
}

function updatePlayerList(showPlayerRole = false) {
    let playerArray = getSortedPlayerArray();

    let playerList = $('#playerList');
    playerList.html("");
    playerList.show();
    playerList.append("<div class='list-group-item list-group-item-action active'> players (" + playerArray.length + ")</div>");
    for(const [key, player] of playerArray) {
        let contextualClass= "black"
        let roleName = "";
        if(showPlayerRole) {
            switch (player.role) {
                case ROLE_TURNCOAT:
                    contextualClass = "list-group-item-warning";
                    break;
                case ROLE_DEVIL:
                    contextualClass = "list-group-item-danger";
                    break;
                case ROLE_ANGEL:
                    contextualClass = "list-group-item-success";
                    break;
                case ROLE_SAINT_THOMAS:
                    contextualClass = "list-group-item-secondary";
                    break;
            }
        }
        playerList.append("<div class='list-group-item list-group-item-action " + contextualClass + "'>" + player.name + " : " + player.score + "</div>");
    }
}

function updateRoundNumber() {
    $('#round-info').html("<i>round " + roundNumber + "</i>");
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
    let keyword = $("#inputKeyword").html();
    $("#keywordCorrect").append("<p>"+keyword+"</p>");
    keywordNew();
}

function keywordWrong() {
    let keyword = $("#inputKeyword").html();
    $("#keywordWrong").append("<p>"+keyword+"</p>");
    keywordNew();
}

function keywordNew() {
    if (keywordArrayCursor >= keywordArray.length) {
        keywordArrayCursor = 0;
        shuffle(keywordArray);
    }
    let keyword = keywordArray[keywordArrayCursor];
    console.log(keyword);
    // replace HTTML
    $("#keyword").html("<p id='inputKeyword'>"+keyword+"</p>");
    keywordGif(keyword);
    sendGameEvent("newKeyword", {keyword: keyword});
    keywordArrayCursor++
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
            $("#keyword").append('</br>' + "<img src=\"" + gif_url + "\"/>");
        })
        .catch(error => {
            console.log(error)
        })
}
