const MINIMUM_PLAYER = 4;
const ROUND_DURATION = 10*1000;

const ROLE_ANGEL = "Angel";
const ROLE_DEVIL = "Devil";
const ROLE_TURNCOAT = "Turncoat";
const ROLE_SAINT_THOMAS = "Saint Thomas";

const GIPHY_API_KEY = '6zRQ8OiObokf7ql3Ez21CgNu8ljMGosp';

let dictionary = [];
let dictionaryCursor = 0;

let players;
let roundNumber;
let keyword;
let keywordId = 0;
let keywords = [];

let angelScore, devilScore, turncoatScore, saintThomasScore;

let progressInterval, progressTimer, progressWidth;

/**
 *
 * @param eventName
 * @param infos
 */

function sendGameEvent(eventName, infos) {
    infos.eventName = eventName;
    sendDataToSenders("game", infos)
}

function loadDictionary(mode) {
    fetch('data/dictionary/'+mode+'.txt') // fetch text file
        .then((resp) => resp.text())
        .then(data => {
            dictionary = data.split(/\r?\n/);
            shuffle(dictionary);
        })
}

/**
 * Handle game events based on the event name
 * @param data
 */
function handleGameEvent(data) {
    console.log("Launching game event " + data.eventName);
    switch (data.eventName) {
        case undefined:
            console.log("Game events need an eventName");
            break;
        case "start-game":
            startGame(data.players);
            break;
        case "saint-thomas-bind" :
            displayLaunchGame();
            break;
        case "start-round":
            displayRound();
            startRound();
            break;
        case "correct":
            keywordCorrect();
            break;
        case "wrong":
            keywordWrong();
            break;
        case "progressPause":
            progressPause();
            break;
        case "progressResume":
            progressMove();
            break;
        case "remembered":
            keywordRemembered(parseInt(data.rememberedKeywordId, 10), data.remembered);
            break;
        case "roundIsOver":
            calculateScore();
            updatePlayerList(true);
            displayRoundScore();
            break;
        // To delete
        case "timeIsOver":
            timeIsOver();
            break;
        default:
            break;
    }
}

/**
 *
 * @param __players
 */
function startGame(__players) {
    // Load dictionary
    loadDictionary('debug');
    // Load players and init round 1
    try {
        players = __players;
        if (Array.isArray(players)) {
            throw new Error("player list is not correct.");
        }

        if (Object.keys(players).length < MINIMUM_PLAYER) {
            throw new Error("Must have "+MINIMUM_PLAYER+" players or more.");
        }

        roundNumber = 1;

        let dreamerOrder = 1;
        for (const [key, player] of Object.entries(players)) {
            players[key].dreamerOrder = dreamerOrder;
            players[key].score = 0;
            dreamerOrder++;
        }

        prepareRound();
    } catch (exception) {
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

    for (const [key, player] of Object.entries(players)) {
        if (roundNumber === player.dreamerOrder) {
            players[key].role = ROLE_SAINT_THOMAS;
        } else {
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

function displayGetReadyMessage() {
    let saintThomas = getSaintThomas();
    $("#game-instruction").html("<h2>" + saintThomas.name + " you are Saint Thomas for this round. Go blind ! </h2><br/><h4>When Saint Thomas is blind, hit ready ! </h4>")
}

function displayLaunchGame() {
    updatePlayerList(true);
    $("#game-instruction").html("<h2>Watch your personal role for this round. </h2><br/><h4>When everyone is ready, click on the button the start the round ! </h4>")
}

function displayRoundScore() {
    let roundScoreDiv = $("#roundScore");

    roundScoreDiv.html("<h2>Round Score:</h2><br/>");
    roundScoreDiv.append("</br><h4 class='alert alert-danger'>" + ROLE_DEVIL + ": + " + devilScore + "</h4>");
    roundScoreDiv.append("</br><h4 class='alert alert-success'>" + ROLE_ANGEL + ": + " + angelScore + "</h4>");
    roundScoreDiv.append("</br><h4 class='alert alert-warning'>" + ROLE_TURNCOAT + ": + " + turncoatScore + "</h4>");
    roundScoreDiv.append("</br><h4 class='alert alert-info'>" + ROLE_SAINT_THOMAS + ": + " + saintThomasScore + "</h4>");
    $("#keyword").hide();
    $("#remember").hide();
    roundScoreDiv.show();
}

function getSaintThomas() {
    for (const [key, player] of Object.entries(players)) {
        if (player.role === ROLE_SAINT_THOMAS) {
            return player;
        }
    }
}

function updatePlayerList(showPlayerRole = false) {
    let playerArray = getSortedPlayerArray();
    let leaderBoard = $('#leaderBoard');
    let playerList = $('<div/>', {'class': 'list-group'});
    leaderBoard.html("");
    leaderBoard.append("<h4>Leaderboard (" + playerArray.length + ")</h4>");
    for (const [key, player] of playerArray) {
        let contextualClass = ""
        let name = player.name;
        if(showPlayerRole) {
            switch (player.role) {
                case ROLE_TURNCOAT:
                    contextualClass = "list-group-item-warning";
                    name = player.name;
                    break;
                case ROLE_DEVIL:
                    contextualClass = "list-group-item-danger";
                    name = player.name;
                    break;
                case ROLE_ANGEL:
                    contextualClass = "list-group-item-success";
                    name = player.name;
                    break;
                case ROLE_SAINT_THOMAS:
                    contextualClass = "list-group-item-info";
                    name = "&#128519; " + player.name;
                    break;
            }
        }
        playerList.append("<div class='list-group-item list-group-item-action " + contextualClass + "'>" + name + " : " + player.score + "</div>");
    }
    leaderBoard.append(playerList);
    leaderBoard.show();

}

function updateRoundNumber() {
    $('#round-info').html("<h4>round " + roundNumber + "</h4>");
}

function getSortedPlayerArray() {
    let playerArray = Object.entries(players);

    playerArray.sort(function (a, b) {
        console.log(a[1].score + " - " + b[1].score + " = " + (a[1].score - b[1].score));
        return b[1].score - a[1].score;
    });

    return playerArray;
}

function displayRound() {
    // Hide instruction
    $("#game-instruction").hide();

    // Clean
    $("#keywordCorrect").html("");
    $("#keywordWrong").html("");

    // Show main-round
    $("#main-round").show();
}

function startRound() {
    // init timer
    progressInit();
    // 1st word
    keywordNew();
}

/**
 * keyword management
 */
function keywordCorrect() {
    $("#keywordCorrect").append("<p id='"+keywordId+"' class='keyword correctKeyword'>" + keyword + "</p>");
    keywords.push({keywordId: keywordId, keyword: keyword, found: true, remembered: false});
    keywordNew();
}

function keywordWrong() {
    $("#keywordWrong").append("<p id='"+keywordId+"' class='keyword wrongKeyword'>" + keyword + "</p>");
    keywords.push({keywordId: keywordId, keyword: keyword, found: false, remembered: false});
    keywordNew();
}

function keywordNew() {
    keywordId ++;
    if (dictionaryCursor >= dictionary.length) {
        dictionaryCursor = 0;
        shuffle(dictionary);
    }
    keyword = dictionary[dictionaryCursor];
    // replace HTTML
    $("#keyword").html("<p id='"+keywordId+"' class='keyword'>"+keyword+"</p>");
    keywordGif(keyword);
    sendGameEvent("newKeyword", {keyword: keyword, keywordId: keywordId});
    dictionaryCursor++
}

function keywordRemembered(rememberedKeywordId, remembered) {
    let found = false;
    console.log(rememberedKeywordId);
    // Update keywords
    for (let i = 0; i < keywords.length; i++) {
        if (rememberedKeywordId === keywords[i].keywordId) {
            keywords[i].remembered = remembered;
            found = true
        }
    }
    if (found) {
        // Dsiplay
        let elmtRememberedKeyword = $(".keyword#" + rememberedKeywordId);
        if (remembered) {
            elmtRememberedKeyword.addClass('remembered')
        } else {
            elmtRememberedKeyword.removeClass('remembered')
        }
    }
    else {
        // Throw error
        throw new Error(rememberedKeywordId+" not found in keywords list.");
    }
}

function keywordGif(keyword) {

    let offset = getRandomInt(10);
    // get and display image
    fetch('https://api.giphy.com/v1/gifs/search?api_key='+GIPHY_API_KEY+'&q='+keyword+'&limit=1&offset='+offset+'&rating=G&lang=fr')
        .then(data => {
            return data.json()
        })
        .then(res => {
            gif_url = res.data[0].images.fixed_height.url;
            console.log('Gif for ' + keyword + ': ' + gif_url);
            $("#keyword").append('</br>' + "<img src=\"" + gif_url + "\"/>");
        })
        .catch(error => {
            console.log(error)
        })
}

function calculateScore() {
    for (const [key, player] of Object.entries(players)) {
        console.log("calculate score");
        let correct = 0;
        let wrong = 0;
        let remembered = 0;

        for (let i = 0; i < keywords.length; i++) {
            if(keywords[i].found) {
                correct++;
                if(keywords[i].remembered) {
                    remembered++;
                }
            }
            else {
                wrong++;
            }
        }

        devilScore = wrong;
        angelScore = correct;
        saintThomasScore = correct;
        if (correct === remembered) {
            saintThomasScore += 2;
        }

        // Calculate turncoat score
        if (correct === wrong) {
            turncoatScore = correct + 2;
        }
        if (Math.abs(correct - wrong) === 1) {
            if (correct > wrong) {
                turncoatScore = correct;
            } else {
                turncoatScore = wrong;
            }
        } else if (Math.abs(correct - wrong) > 1) {
            // >= 2 -- min
            if (correct > wrong) {
                turncoatScore = wrong;
            } else {
                turncoatScore = correct;
            }
        }

        // Add score to players
        switch (player.role) {
            case ROLE_TURNCOAT:
                player.score += turncoatScore;
                break;
            case ROLE_DEVIL:
                player.score += devilScore;
                break;
            case ROLE_ANGEL:
                player.score += angelScore;
                break;
            case ROLE_SAINT_THOMAS:
                player.score += saintThomasScore;
                break;
        }
    }
}

/**
 * Round time management
 */

function timeIsOver() {
    console.log("Time is over !");
    $('#progress').hide();
    $('#keyword').hide();
    $('#remember').show();
    sendGameEvent('timeIsOver', {keywords: keywords})
}

function progressInit() {
    progressTimer = 0;
    progressWidth = 0;
    $('#progress').show();
    progressMove();
}

function progressMove() {
    let elemBar = document.getElementById("progressBar");
    let elemCount = document.getElementById("progressCountdown");
    let step = 1000;

    clearInterval(progressInterval);
    progressInterval = setInterval(frame, step);

    function frame() {
        if (progressTimer >= ROUND_DURATION) {
            clearInterval(progressInterval);
            timeIsOver();
        } else {
            progressTimer = progressTimer + step;
            progressWidth = 100 * progressTimer/ROUND_DURATION;
            elemBar.style.width = progressWidth + '%';
            elemCount.innerHTML = parseInt((ROUND_DURATION - progressTimer)/1000, 10) + 's';
        }
    }
}

function progressPause() {
    clearInterval(progressInterval);
}