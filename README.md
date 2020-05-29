# one-more

## Concept 

## Documentation
Google cast documentation : https://developers.google.com/cast/docs/developers

## DEBUG MODE
1. Register your chromecast device (SmartTV works as well) on the https://cast.google.com/publish/ website.
To do so, you'll need to get your chromecast ID. To get it, simply cast this same website. You'll hear the ID and see it on the screen.

2. Open an http server from your cast-receiver folder
`htt-server`
3. Open access to your http server using ngrok
`ngrok http 8080` 

4. Link your app to the url you'll get (hint: create 1 app per contributor on the project)
