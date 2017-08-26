// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var cors = require('cors');

// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');

// Add your Spotify app credentials to the .env file
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET,
  redirectUri: "https://music-fingerprint.glitch.me/callback",
});

spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    console.log('Generated an access token (it expires in ' + data.body['expires_in'] + ')');

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(cors());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// Get url to use for user to authenticate with Spotify. We could just embed this in the HTML, but this gives us more freedom to change it.
app.get("/loginUrl", function(request, response) {
  console.log("Login endpoint");
  var scopes = ['user-library-read']; // Read access to a user's "Your Music" library.
  var state = "";
  var authorizeUrl = spotifyApi.createAuthorizeURL(scopes, state);

  response.send({url: authorizeUrl});
});

app.get("/isLoggedIn", function(request, response) {
  spotifyApi.getMe()
    .then(function(data) {
      response.send({loggedIn: true});
  }, function(error) {
    response.send({loggedIn: false});
  });
});

app.get("/userSavedTracks", function(request, response) {
  getSavedTracks(50, 0)
    .then(function(data) {
      console.log(JSON.stringify(data.body.items));
      response.send(data.body.items.map(function(item) {
        return item.track;
      }));
  }, function(error) {
      console.log(JSON.stringify(error));
  });
});

function getSavedTracks(limit, skip) {
  return spotifyApi.getMySavedTracks({limit: limit, skip: skip});
}

app.get("/callback", function(request, response) {
  console.log("Callback called");
  if (request && request.query && request.query.code) {
    spotifyApi.authorizationCodeGrant(request.query.code)
      .then(function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        response.redirect('/');
    })
  }
});

app.get("/search", function (request, response) {
  spotifyApi.searchTracks(request.query.query)
  .then(function(data) {
    console.log(data.body);
    response.send(data.body);
  }, function(err) {
    console.log(err)
  });
});

app.get("/features", function (request, response) {
  spotifyApi.getAudioFeaturesForTrack(request.query.id)
  .then(function(data) {
    console.log(data.body);
    response.send(data.body);
  }, function(err) {
    console.log(err)
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
