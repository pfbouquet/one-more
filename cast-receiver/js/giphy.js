const GIPHY_API_KEY = '6zRQ8OiObokf7ql3Ez21CgNu8ljMGosp';
const GIPHY_URL_BASE = 'https://api.giphy.com/v1/gifs/search?api_key='+GIPHY_API_KEY+'&limit=1&rating=G&lang=fr';

function illustrateGiphy(keyword) {

    let offset = getRandomInt(10);
    let url = GIPHY_URL_BASE +'&q='+keyword+'&offset='+offset;
    // get and display image
    fetch(url)
        .then(data => {
            return data.json()
        })
        .then(res => {
            gif_url = res.data[0].images.fixed_height.url;
            console.log('Gif for ' + keyword + ': ' + gif_url);
            $("#keywordIllustration").attr('src', gif_url);
        })
        .catch(error => {
            console.log(error)
        })
}
