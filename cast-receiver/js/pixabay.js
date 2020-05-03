const PIXABAY_API_KEY = '16353936-e7b3a8a17e3b4eb9c398bcd58';
const PIXABAY_URL_BASE = "https://pixabay.com/api/?key="+PIXABAY_API_KEY;

function illustratePixabay(keyword) {

    let url = PIXABAY_URL_BASE + "&q="+encodeURIComponent(keyword);

    $("#keywordIllustration").removeAttr("src");
    $("#keywordIllustration").hide();
    $.getJSON(url, function(data){
        if (parseInt(data.totalHits) > 0) {
            let offset = getRandomInt(Math.min(20,parseInt(data.totalHits)));
            let illustrationUrl = data.hits[offset].webformatURL;
            console.log('Pixabay illustration for ' + keyword + ': ' + illustrationUrl);
            $("#keywordIllustration").attr('src', illustrationUrl);
            $("#keywordIllustration").show();
        }
        else {
            console.log('No hits');
        }
    });

}
